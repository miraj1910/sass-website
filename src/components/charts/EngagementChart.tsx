import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface EngagementChartProps {
  data: Array<{
    engagement: number;
    // We need another field for the pie chart. Let's use engagement vs non-engagement?
    // Or we can show the breakdown of engagement by some categories? Not in our model.
    // For simplicity, we'll show engagement rate and the remaining percentage (100 - engagement).
    // But engagement is a percentage, so we can show engagement vs rest.
    rest: number;
  }>;
}

export default function EngagementChart({ data }: EngagementChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">No data available</div>;
  }

  // We'll take the latest data point for the pie chart
  const latest = data[data.length - 1];
  const engagement = latest.engagement;
  const rest = 100 - engagement;

  const chartData = [
    { name: "Engagement", value: engagement },
    { name: "Rest", value: rest },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#6b7280"} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}