import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface UserGrowthChartProps {
  data: Array<{ month: string; userCount: number }>;
}

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-zinc-600">No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
        <XAxis dataKey="month" tick={false} axisLine={false} />
        <YAxis tick={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: "6px", fontSize: "12px", boxShadow: "none" }}
          labelStyle={{ color: "#71717a" }}
        />
        <Bar dataKey="userCount" fill="#52525b" barSize={12} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
