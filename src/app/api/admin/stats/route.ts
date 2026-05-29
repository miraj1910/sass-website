import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") ?? "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const [totalUsers, totalTeams, usersThisPeriod, teamsThisPeriod, recentActivity] = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.team.count({ where: { createdAt: { gte: since } } }),
    prisma.auditEvent.count({ where: { createdAt: { gte: since } } }),
  ]);

  const usageByDay = await prisma.$queryRaw<Array<{ date: string; count: number }>>`
    SELECT DATE("createdAt")::text as date, COUNT(*)::int as count
    FROM "AuditEvent"
    WHERE "createdAt" >= ${since}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  return NextResponse.json({
    stats: {
      totalUsers,
      totalTeams,
      newUsers: usersThisPeriod,
      newTeams: teamsThisPeriod,
      recentActivity,
    },
    usageByDay: usageByDay.map((r) => ({
      date: r.date,
      count: r.count,
    })),
    period: `${days}d`,
  });
}
