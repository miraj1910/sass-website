import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-zinc-600">No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
        <XAxis dataKey="month" tick={false} axisLine={false} />
        <YAxis tick={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "6px", fontSize: "12px", boxShadow: "none" }}
          labelStyle={{ color: "#71717a" }}
        />
        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
