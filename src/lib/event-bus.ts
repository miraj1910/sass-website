import "server-only";
import { EventEmitter } from "events";

type EventHandler = (payload: unknown) => void | Promise<void>;

const bus = new EventEmitter();
bus.setMaxListeners(200);

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL;
}

function isRedisAvailable(): boolean {
  return !!getRedisUrl();
}

const eventBus = {
  emit(event: string, payload: unknown): void {
    bus.emit(event, payload);
    if (isRedisAvailable()) {
      import("@/lib/queue").then(({ publishToRedis }) =>
        publishToRedis(event, payload).catch(() => {
          /* redis unavailable */
        }),
      );
    }
  },

  on(event: string, handler: EventHandler): void {
    bus.on(event, handler);
  },

  off(event: string, handler: EventHandler): void {
    bus.off(event, handler);
  },

  once(event: string, handler: EventHandler): void {
    bus.once(event, handler);
  },
};

export const EVENTS = {
  BILLING_CHECKOUT_COMPLETED: "billing:checkout:completed",
  BILLING_SUBSCRIPTION_UPDATED: "billing:subscription:updated",
  BILLING_SUBSCRIPTION_DELETED: "billing:subscription:deleted",
  BILLING_PAYMENT_FAILED: "billing:payment:failed",
  BILLING_USAGE_THRESHOLD: "billing:usage:threshold",

  TEAM_MEMBER_ADDED: "team:member:added",
  TEAM_MEMBER_REMOVED: "team:member:removed",
  TEAM_CREATED: "team:created",

  METRICS_CREATED: "metrics:created",
  METRICS_AGGREGATED: "metrics:aggregated",

  AUDIT_LOG: "audit:log",
  NOTIFICATION_SEND: "notification:send",
  EMAIL_SEND: "email:send",

  USER_SIGNED_IN: "user:signed:in",
  USER_SIGNED_UP: "user:signed:up",

  API_KEY_CREATED: "api-key:created",
  API_KEY_REVOKED: "api-key:revoked",
} as const;

export { eventBus };
