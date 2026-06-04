import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { statsApi, type StatsResponse } from '../../api/stats';

export function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await statsApi.fetch();
      setStats(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
        <p className="text-[12px]">Failed to load stats.</p>
        <button
          onClick={load}
          className="text-[11px] text-indigo-400 hover:text-indigo-300"
        >
          Retry
        </button>
      </div>
    );
  }

  const maxDomain = Math.max(...stats.topDomains.map(d => d.count), 1);

  const chartData = stats.byDay.map(d => ({
    count: d.count,
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="flex flex-col gap-4 p-3 overflow-y-auto">

      {/* Counters */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Read', value: stats.readCount },
          { label: 'Unread', value: stats.unreadCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-800/50 rounded-lg p-2 text-center">
            <div className="text-[20px] font-bold text-slate-200">{value}</div>
            <div className="text-[10px] text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Top domains */}
      {stats.topDomains.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">
            Top Domains
          </p>
          <div className="flex flex-col gap-1.5">
            {stats.topDomains.slice(0, 5).map(({ domain, count }) => (
              <div key={domain} className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 w-28 truncate flex-shrink-0">
                  {domain}
                </span>
                <div className="flex-1 bg-slate-800 rounded-full h-1">
                  <div
                    className="bg-indigo-500 h-1 rounded-full"
                    style={{ width: `${(count / maxDomain) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 w-5 text-right flex-shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar chart: last 30 days */}
      {stats.byDay.length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Last 30 Days
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 11,
                }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#a5b4fc' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}
