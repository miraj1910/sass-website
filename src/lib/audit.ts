import "server-only";
import { prisma } from "@/lib/prisma";
import { eventBus, EVENTS } from "@/lib/event-bus";

type AuditAction =
  | "team.created"
  | "team.member.added"
  | "team.member.removed"
  | "billing.checkout.completed"
  | "billing.subscription.updated"
  | "billing.subscription.deleted"
  | "billing.payment.failed"
  | "auth.login"
  | "auth.signup"
  | "api_key.created"
  | "api_key.revoked"
  | "settings.updated"
  | "metrics.created"
  | "admin.action";

type AuditMeta = Record<string, unknown>;

export async function auditLog(params: {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  teamId?: string;
  userId?: string;
  metadata?: AuditMeta;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    const created = await prisma.auditEvent.create({
      data: {
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId ?? null,
        teamId: params.teamId ?? null,
        userId: params.userId ?? null,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
      },
    });

    eventBus.emit(EVENTS.AUDIT_LOG, created);
  } catch (error) {
    console.error("[AUDIT] Failed to log:", error);
  }
}

export async function getAuditLogs(params: {
  teamId?: string;
  userId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}): Promise<{ events: unknown[]; total: number }> {
  const where: Record<string, unknown> = {};
  if (params.teamId) where.teamId = params.teamId;
  if (params.userId) where.userId = params.userId;
  if (params.action) where.action = params.action;

  const [events, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: params.limit ?? 50,
      skip: params.offset ?? 0,
    }),
    prisma.auditEvent.count({ where }),
  ]);

  return { events, total };
}
