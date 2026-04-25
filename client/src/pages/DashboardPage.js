import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAnalytics, useProjects } from '../hooks/useData';
import StatCard from '../components/StatCard';
import api from '../api/api';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const STATUS_COLORS = {
  planning: 'badge-gray',
  active: 'badge-green',
  on_hold: 'badge-yellow',
  completed: 'badge-blue',
  cancelled: 'badge-red',
};

const PRIORITY_COLORS = {
  low: 'badge-gray',
  medium: 'badge-yellow',
  high: 'badge-red',
  critical: 'text-red-300 bg-red-500/20 badge',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: analyticsData, loading: aLoading } = useAnalytics(30);
  const { projects, loading: pLoading, stats } = useProjects();
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  const hasAnalytics = analyticsData?.overview?.data?.length > 0;

  const handleSeedAnalytics = async () => {
    setSeeding(true);
    try {
      const res = await api.post('/analytics/seed');
      setSeedMsg(res.data.message);
      window.location.reload();
    } catch (err) {
      setSeedMsg('Failed to seed analytics.');
    } finally {
      setSeeding(false);
    }
  };

  // Build chart data
  const chartData = analyticsData?.overview?.data?.slice(-14).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: d.metrics.revenue,
    users: d.metrics.activeUsers,
    sessions: d.metrics.sessions,
  })) || [];

  const revenueChartData = analyticsData?.revenue?.data?.map((d) => ({
    month: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d._id.month - 1]} ${d._id.year}`,
    revenue: d.revenue,
    mrr: d.mrr,
  })) || [];

  const totalRevenue = analyticsData?.overview?.totals?.revenue || 0;
  const totalNewUsers = analyticsData?.overview?.totals?.newUsers || 0;
  const latestActiveUsers = analyticsData?.overview?.latest?.activeUsers || 0;
  const latestMrr = analyticsData?.overview?.latest?.mrr || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Here's what's happening at <span className="text-slate-300">{user?.tenant?.name}</span> today.
          </p>
        </div>
        {user?.role === 'owner' && !hasAnalytics && (
          <button onClick={handleSeedAnalytics} disabled={seeding} className="btn-secondary text-xs">
            {seeding ? 'Seeding...' : '🌱 Seed Demo Data'}
          </button>
        )}
      </div>

      {seedMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
          {seedMsg}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Revenue"
          value={totalRevenue}
          prefix="$"
          change={12.5}
          changeType="positive"
          loading={aLoading}
          icon={<DollarIcon />}
        />
        <StatCard
          title="Active Users"
          value={latestActiveUsers}
          change={8.2}
          changeType="positive"
          loading={aLoading}
          icon={<UserIcon />}
        />
        <StatCard
          title="New Sign-ups"
          value={totalNewUsers}
          change={3.1}
          changeType="positive"
          loading={aLoading}
          icon={<PlusUserIcon />}
        />
        <StatCard
          title="MRR"
          value={latestMrr}
          prefix="$"
          change={5.4}
          changeType="positive"
          loading={aLoading}
          icon={<TrendIcon />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-200">Revenue (14 days)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daily revenue trend</p>
            </div>
          </div>
          {aLoading ? (
            <div className="h-48 bg-slate-800 rounded-lg animate-pulse" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No analytics data yet. Click 'Seed Demo Data' to populate." />
          )}
        </div>

        {/* MRR bar chart */}
        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-1">MRR by Month</h3>
          <p className="text-xs text-slate-500 mb-4">Monthly recurring revenue</p>
          {aLoading ? (
            <div className="h-48 bg-slate-800 rounded-lg animate-pulse" />
          ) : revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => [`$${val.toLocaleString()}`, 'MRR']}
                />
                <Bar dataKey="mrr" fill="#0ea5e9" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No data" />
          )}
        </div>
      </div>

      {/* Projects summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-200">Recent Projects</h3>
            <Link to="/projects" className="text-xs text-sky-400 hover:text-sky-300">View all →</Link>
          </div>
          {pLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-slate-800 rounded-lg animate-pulse" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No projects yet. <Link to="/projects" className="text-sky-400">Create one →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map((p) => (
                <div key={p._id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 truncate">{p.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={STATUS_COLORS[p.status]}>{p.status.replace('_', ' ')}</span>
                    <span className={PRIORITY_COLORS[p.priority]}>{p.priority}</span>
                  </div>
                  <div className="w-16">
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 text-right">{p.progress}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project status breakdown */}
        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-4">Project Status</h3>
          {pLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 bg-slate-800 rounded animate-pulse" />)}
            </div>
          ) : stats.stats?.length > 0 ? (
            <div className="space-y-3">
              {stats.stats.map((s) => (
                <div key={s._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${STATUS_DOT[s._id] || 'bg-slate-500'}`} />
                    <span className="text-sm text-slate-400 capitalize">{s._id.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_BAR[s._id] || 'bg-slate-500'}`}
                        style={{ width: `${(s.count / (stats.total || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-300 w-4 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Total projects</span>
                  <span className="font-medium text-slate-300">{stats.total}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No projects yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_DOT = {
  active: 'bg-emerald-400',
  planning: 'bg-slate-400',
  on_hold: 'bg-amber-400',
  completed: 'bg-sky-400',
  cancelled: 'bg-red-400',
};

const STATUS_BAR = {
  active: 'bg-emerald-400',
  planning: 'bg-slate-400',
  on_hold: 'bg-amber-400',
  completed: 'bg-sky-400',
  cancelled: 'bg-red-400',
};

function EmptyChart({ message }) {
  return (
    <div className="h-48 flex items-center justify-center">
      <p className="text-slate-600 text-sm text-center max-w-xs">{message}</p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function DollarIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function UserIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function PlusUserIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>; }
function TrendIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>; }