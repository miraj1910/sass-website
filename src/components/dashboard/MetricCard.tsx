interface MetricCardProps {
  title: string;
  value: string | number;
  trend: "up" | "down" | "neutral";
}

export default function MetricCard({
  title,
  value,
  trend,
}: MetricCardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <div className="border bg-background rounded-lg p-6">
      <h2 className="text-sm font-medium text-muted-foreground mb-2">
        {title}
      </h2>
      <p className="text-2xl font-bold mb-2">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <div className="flex items-center space-x-2 text-sm">
        <span className={`${trendColors[trend]} font-medium`}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
        </span>
        <span className="text-xs">{trend}</span>
      </div>
    </div>
  );
}
