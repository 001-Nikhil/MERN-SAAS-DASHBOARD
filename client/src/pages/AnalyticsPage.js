import React, { useState } from 'react';
import { useAnalytics } from '../hooks/useData';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const PERIOD_OPTIONS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const { data, loading, error } = useAnalytics(period);

  const dailyData = data?.overview?.data?.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: d.metrics.revenue,
    activeUsers: d.metrics.activeUsers,
    newUsers: d.metrics.newUsers,
    sessions: d.metrics.sessions,
    pageViews: d.metrics.pageViews,
    conversionRate: d.metrics.conversionRate,
    mrr: d.metrics.mrr,
  })) || [];

  const totals = data?.overview?.totals || {};
  const latest = data?.overview?.latest || {};

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Track your growth and engagement metrics</p>
        </div>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setPeriod(opt.days)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${period === opt.days ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${(totals.revenue || 0).toLocaleString()}`, sub: 'this period' },
          { label: 'New Users', value: (totals.newUsers || 0).toLocaleString(), sub: 'this period' },
          { label: 'Active Users', value: (latest.activeUsers || 0).toLocaleString(), sub: 'latest day' },
          { label: 'Current MRR', value: `$${(latest.mrr || 0).toLocaleString()}`, sub: 'monthly recurring' },
        ].map(({ label, value, sub }) => (
          <div key={label} className={`card ${loading ? 'animate-pulse' : ''}`}>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className={`text-2xl font-bold text-slate-100 mt-1 ${loading ? 'opacity-0' : ''}`}>{value}</p>
            <p className={`text-xs text-slate-600 mt-0.5 ${loading ? 'opacity-0' : ''}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Users combined chart */}
      <div className="card">
        <h3 className="font-semibold text-slate-200 mb-1">Revenue & Active Users</h3>
        <p className="text-xs text-slate-500 mb-4">Daily trend over selected period</p>
        {loading ? (
          <div className="h-64 bg-slate-800 rounded-lg animate-pulse" />
        ) : dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={dailyData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#revGrad2)" dot={false} name="Revenue ($)" />
              <Line yAxisId="right" type="monotone" dataKey="activeUsers" stroke="#a78bfa" strokeWidth={2} dot={false} name="Active Users" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Row: New Users + Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-1">New User Sign-ups</h3>
          <p className="text-xs text-slate-500 mb-4">Daily new registrations</p>
          {loading ? (
            <div className="h-48 bg-slate-800 rounded-lg animate-pulse" />
          ) : dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val) => [val, 'New Users']}
                />
                <Bar dataKey="newUsers" fill="#34d399" radius={[3, 3, 0, 0]} opacity={0.8} name="New Users" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-1">Sessions & Page Views</h3>
          <p className="text-xs text-slate-500 mb-4">Daily engagement</p>
          {loading ? (
            <div className="h-48 bg-slate-800 rounded-lg animate-pulse" />
          ) : dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="sessions" stroke="#f59e0b" strokeWidth={2} dot={false} name="Sessions" />
                <Line type="monotone" dataKey="pageViews" stroke="#6366f1" strokeWidth={2} dot={false} name="Page Views" />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="card">
        <h3 className="font-semibold text-slate-200 mb-1">Conversion Rate (%)</h3>
        <p className="text-xs text-slate-500 mb-4">Visitor to user conversion over time</p>
        {loading ? (
          <div className="h-48 bg-slate-800 rounded-lg animate-pulse" />
        ) : dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val) => [`${val}%`, 'Conversion Rate']}
              />
              <Area type="monotone" dataKey="conversionRate" stroke="#34d399" strokeWidth={2} fill="url(#convGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <EmptyState />}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-48 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-600 text-sm">No analytics data available.</p>
        <p className="text-slate-700 text-xs mt-1">Go to Dashboard and click "Seed Demo Data"</p>
      </div>
    </div>
  );
}