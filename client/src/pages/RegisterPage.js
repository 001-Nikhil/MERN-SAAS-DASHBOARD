import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.organizationName);
      navigate('/dashboard');
    } catch (err) {
      const details = err.response?.data?.details;
      if (details) {
        setError(details.map((d) => d.message).join(', '));
      } else {
        setError(err.response?.data?.error || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/25">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create your workspace</h1>
          <p className="text-slate-500 mt-1 text-sm">Free 14-day trial · No credit card required</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">Your name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="input"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Organization name</label>
                <input
                  name="organizationName"
                  type="text"
                  required
                  className="input"
                  placeholder="Acme Corp"
                  value={form.organizationName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Work email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="jane@acme.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="input"
                  placeholder="Min 8 chars, uppercase & number"
                  value={form.password}
                  onChange={handleChange}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Must contain uppercase, lowercase, and a number
                </p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating workspace...</>
              ) : 'Create workspace →'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}