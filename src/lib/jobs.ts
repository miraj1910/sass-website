import "server-only";
import { defineJob } from "@/lib/queue";
import { eventBus, EVENTS } from "@/lib/event-bus";
import { logger } from "@/lib/observability/logger";
import { cache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

defineJob("metrics:aggregate", async (payload: { teamId: string }) => {
  const start = Date.now();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const metricsByDate = await prisma.metric.groupBy({
    by: ["recordedAt", "key"],
    where: { teamId: payload.teamId, recordedAt: { gte: thirtyDaysAgo } },
    _sum: { value: true },
    orderBy: { recordedAt: "asc" },
  });

  const dateMap = new Map<string, Record<string, number>>();
  for (const m of metricsByDate) {
    const dateStr = m.recordedAt.toISOString().split("T")[0];
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, {});
    }
    const entry = dateMap.get(dateStr)!;
    entry[m.key] = m._sum.value ?? 0;
  }

  const aggregated = Array.from(dateMap.entries()).map(([date, values]) => ({
    date,
    ...values,
  }));

  await cache.set(`metrics:aggregated:${payload.teamId}`, aggregated, 300_000);

  logger.info("Metrics aggregated", {
    teamId: payload.teamId,
    metadata: { durationMs: Date.now() - start, dataPoints: aggregated.length },
  });

  eventBus.emit(EVENTS.METRICS_AGGREGATED, {
    teamId: payload.teamId,
    dataPoints: aggregated.length,
  });
});

defineJob("notification:send", async (payload: {
  userId: string;
  teamId?: string;
  title: string;
  body?: string;
  type?: string;
  link?: string;
}) => {
  await prisma.notification.create({
    data: {
      userId: payload.userId,
      teamId: payload.teamId ?? null,
      title: payload.title,
      body: payload.body ?? null,
      type: payload.type ?? "info",
      link: payload.link ?? null,
    },
  });
});

defineJob("cache:invalidate", async (payload: { pattern: string }) => {
  await cache.invalidatePattern(payload.pattern);
});

defineJob("audit:persist", async (payload: Record<string, unknown>) => {
  logger.info("Audit event processed", { metadata: payload });
});
