import React from 'react';

export default function StatCard({ title, value, change, changeType = 'positive', icon, prefix = '', suffix = '', loading = false }) {
  const isPositive = changeType === 'positive';

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-24 mb-3" />
        <div className="h-8 bg-slate-800 rounded w-32 mb-2" />
        <div className="h-3 bg-slate-800 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="card hover:border-slate-700 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        {icon && (
          <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-sky-500/10 group-hover:text-sky-400 transition-colors">
            {icon}
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="text-xs text-slate-600">vs last period</span>
        </div>
      )}
    </div>
  );
}