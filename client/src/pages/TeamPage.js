import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTeam } from '../hooks/useData';

const ROLE_BADGE = {
  owner: 'badge-purple',
  admin: 'badge-blue',
  member: 'badge-green',
  viewer: 'badge-gray',
};

export default function TeamPage() {
  const { user } = useAuth();
  const { members, loading, inviteMember, removeMember } = useTeam();
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'member' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [removeConfirm, setRemoveConfirm] = useState(null);

  const canManage = ['owner', 'admin'].includes(user?.role);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await inviteMember(form);
      setSuccess(`${res.user.name} invited! Temp password: ${res.tempPassword}`);
      setForm({ name: '', email: '', role: 'member' });
      setShowInvite(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to invite member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (userId) => {
    try {
      await removeMember(userId);
      setRemoveConfirm(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Team</h1>
          <p className="text-slate-500 mt-0.5 text-sm">{members.length} member{members.length !== 1 ? 's' : ''} in your organization</p>
        </div>
        {canManage && (
          <button onClick={() => setShowInvite(true)} className="btn-primary">
            <PlusIcon /> Invite member
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-mono">
          ✓ {success}
        </div>
      )}

      {/* Member list */}
      <div className="card divide-y divide-slate-800 p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-slate-800 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No team members found.</div>
        ) : (
          members.map((m) => (
            <div key={m._id} className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {m.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-200 text-sm">{m.name}</p>
                  {m._id === user?.id && <span className="text-xs text-slate-600">(you)</span>}
                </div>
                <p className="text-xs text-slate-500 truncate">{m.email}</p>
              </div>
              <div className="flex items-center gap-3">
                {m.lastLogin && (
                  <span className="text-xs text-slate-600 hidden md:block">
                    Last seen {new Date(m.lastLogin).toLocaleDateString()}
                  </span>
                )}
                <span className={ROLE_BADGE[m.role]}>{m.role}</span>
                {canManage && m._id !== user?.id && m.role !== 'owner' && (
                  <button
                    onClick={() => setRemoveConfirm(m._id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    title="Remove member"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Role legend */}
      <div className="card">
        <h3 className="font-medium text-slate-300 text-sm mb-3">Role Permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { role: 'owner', desc: 'Full access. Billing, delete org, manage all settings.' },
            { role: 'admin', desc: 'Manage members, projects, and settings. No billing.' },
            { role: 'member', desc: 'Create and manage projects. View analytics.' },
            { role: 'viewer', desc: 'Read-only access to projects and analytics.' },
          ].map(({ role, desc }) => (
            <div key={role} className="flex gap-3">
              <span className={`${ROLE_BADGE[role]} mt-0.5 flex-shrink-0`}>{role}</span>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <Modal title="Invite team member" onClose={() => setShowInvite(false)}>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                required
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                required
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@company.com"
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <p className="text-xs text-slate-500 bg-slate-800 p-3 rounded-lg">
              ℹ️ A temporary password will be generated. In production, an email invite would be sent.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Inviting...' : 'Send invite'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Remove confirm */}
      {removeConfirm && (
        <Modal title="Remove member?" onClose={() => setRemoveConfirm(null)}>
          <p className="text-slate-400 text-sm mb-6">
            This member will lose access to your organization immediately.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setRemoveConfirm(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => handleRemove(removeConfirm)} className="btn-danger flex-1">Remove</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function PlusIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>; }
function XIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>; }