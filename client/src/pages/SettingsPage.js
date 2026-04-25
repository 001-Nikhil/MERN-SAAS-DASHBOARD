import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Manage your account and organization preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
        {['profile', 'organization', 'security'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize
              ${activeTab === tab ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && <ProfileSettings user={user} updateProfile={updateProfile} />}
      {activeTab === 'organization' && <OrgSettings user={user} />}
      {activeTab === 'security' && <SecuritySettings />}
    </div>
  );
}

function ProfileSettings({ user, updateProfile }) {
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await updateProfile(form);
      setMsg('Profile updated successfully.');
    } catch {
      setMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card space-y-5">
      <h2 className="font-semibold text-slate-200">Profile Information</h2>

      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
          {form.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">{form.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <span className="badge badge-purple text-xs mt-1">{user?.role}</span>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm border ${msg.includes('success') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Email address</label>
          <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
          <p className="text-xs text-slate-600 mt-1">Email cannot be changed.</p>
        </div>
        <div>
          <label className="label">Avatar URL (optional)</label>
          <input
            className="input"
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            placeholder="https://..."
          />
        </div>
        <div className="pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function OrgSettings({ user }) {
  const [form, setForm] = useState({
    name: user?.tenant?.name || '',
    billingEmail: user?.tenant?.billingEmail || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const canEdit = ['owner', 'admin'].includes(user?.role);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.patch('/tenants/me', form);
      setMsg('Organization updated successfully.');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-200">Organization Details</h2>

        {msg && (
          <div className={`p-3 rounded-lg text-sm border ${msg.includes('success') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Organization name</label>
            <input
              className={`input ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!canEdit}
              required
            />
          </div>
          <div>
            <label className="label">Slug</label>
            <input className="input opacity-50 cursor-not-allowed font-mono text-xs" value={user?.tenant?.slug} disabled />
            <p className="text-xs text-slate-600 mt-1">Slug is permanent and cannot be changed.</p>
          </div>
          <div>
            <label className="label">Billing email</label>
            <input
              type="email"
              className={`input ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={form.billingEmail}
              onChange={(e) => setForm({ ...form, billingEmail: e.target.value })}
              disabled={!canEdit}
            />
          </div>
          {canEdit && (
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          )}
        </form>
      </div>

      {/* Plan info */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-200">Current Plan</h2>
        <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
          <div>
            <p className="font-semibold text-slate-100 capitalize">{user?.tenant?.plan} Plan</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Up to {user?.tenant?.settings?.maxUsers} members · {user?.tenant?.settings?.maxProjects} projects
            </p>
          </div>
          <span className={`badge ${user?.tenant?.plan === 'free' ? 'badge-gray' : user?.tenant?.plan === 'pro' ? 'badge-blue' : 'badge-purple'}`}>
            {user?.tenant?.plan?.toUpperCase()}
          </span>
        </div>

        {user?.tenant?.trialEndsAt && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Trial ends:</span>
            <span className="text-amber-400">
              {new Date(user.tenant.trialEndsAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {[
            { plan: 'Starter', price: '$29/mo', features: '10 members, 50 projects' },
            { plan: 'Pro', price: '$79/mo', features: '50 members, unlimited projects' },
            { plan: 'Enterprise', price: 'Custom', features: 'Unlimited everything' },
          ].map(({ plan, price, features }) => (
            <div key={plan} className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
              <p className="font-medium text-slate-200 text-sm">{plan}</p>
              <p className="text-sky-400 font-bold mt-1">{price}</p>
              <p className="text-xs text-slate-500 mt-1">{features}</p>
              <button className="btn-secondary text-xs mt-3 w-full py-1.5">Upgrade</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMsg('New passwords do not match.');
      return;
    }
    if (form.newPassword.length < 8) {
      setMsg('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      await api.patch('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMsg('Password changed successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card space-y-5">
      <h2 className="font-semibold text-slate-200">Change Password</h2>

      {msg && (
        <div className={`p-3 rounded-lg text-sm border ${msg.includes('success') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="label">Current password</label>
          <input
            type="password"
            className="input"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">New password</label>
          <input
            type="password"
            className="input"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            required
            placeholder="Min 8 chars, uppercase & number"
          />
        </div>
        <div>
          <label className="label">Confirm new password</label>
          <input
            type="password"
            className="input"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Changing...' : 'Change password'}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-800">
        <h3 className="font-medium text-slate-300 text-sm mb-2">Session Info</h3>
        <p className="text-xs text-slate-500">
          JWT tokens expire after 7 days. You will be automatically signed out after that period.
        </p>
      </div>
    </div>
  );
}