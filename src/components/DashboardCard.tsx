import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
}

export default function DashboardCard({
  title,
  value,
  icon,
  trend,
}: DashboardCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">{title}</span>
        <span className="text-zinc-600">
          {icon}
        </span>
      </div>
      <p className="text-xl font-semibold tracking-tight text-zinc-100">{value}</p>
      {trend && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={`text-[11px] font-medium ${trend.value >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-[11px] text-zinc-600">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
