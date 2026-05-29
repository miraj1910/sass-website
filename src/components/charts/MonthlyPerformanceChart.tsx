import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface MonthlyPerformanceChartProps {
  data: Array<{ month: string; engagement: number }>;
}

export default function MonthlyPerformanceChart({ data }: MonthlyPerformanceChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-zinc-600">No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
        <XAxis dataKey="month" tick={false} axisLine={false} />
        <YAxis tick={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "6px", fontSize: "12px", boxShadow: "none" }}
          labelStyle={{ color: "#71717a" }}
        />
        <Area type="monotone" dataKey="engagement" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.06} strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
