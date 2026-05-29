import "server-only";

type JobHandler<T = unknown> = (payload: T) => void | Promise<void>;

interface QueueJob<T = unknown> {
  id: string;
  name: string;
  payload: T;
  attempts: number;
  maxRetries: number;
  createdAt: number;
}

interface JobDefinition {
  handler: JobHandler;
  concurrency?: number;
}

const jobHandlers = new Map<string, JobDefinition>();
const pendingJobs: QueueJob[] = [];
let processing = false;
let jobCounter = 0;

export function defineJob<T>(name: string, handler: JobHandler<T>, concurrency = 1): void {
  jobHandlers.set(name, { handler: handler as JobHandler, concurrency });
}

async function processNext(): Promise<void> {
  if (processing || pendingJobs.length === 0) return;
  processing = true;

  while (pendingJobs.length > 0) {
    const job = pendingJobs.shift()!;
    const def = jobHandlers.get(job.name);

    if (!def) {
      console.warn(`[QUEUE] No handler for job: ${job.name}`);
      continue;
    }

    try {
      await def.handler(job.payload);
    } catch (error) {
      if (job.attempts < job.maxRetries) {
        pendingJobs.push({ ...job, attempts: job.attempts + 1 });
        console.warn(
          `[QUEUE] Retrying job ${job.name} (attempt ${job.attempts + 1}/${job.maxRetries})`,
        );
      } else {
        console.error(
          `[QUEUE] Job ${job.name} failed after ${job.maxRetries} attempts:`,
          error,
        );
      }
    }
  }

  processing = false;
}

export function enqueue<T>(name: string, payload: T, maxRetries = 3): string {
  const id = `job_${Date.now()}_${++jobCounter}`;
  pendingJobs.push({
    id,
    name,
    payload,
    attempts: 0,
    maxRetries,
    createdAt: Date.now(),
  });
  processNext().catch(() => {});
  return id;
}

export function getQueueSize(): number {
  return pendingJobs.length;
}

export async function publishToRedis(channel: string, message: unknown): Promise<void> {
  try {
    const { default: Redis } = await import("ioredis");
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return;

    const redis = new Redis(redisUrl);
    await redis.publish(channel, JSON.stringify(message));
    await redis.quit();
  } catch {
    /* redis unavailable */
  }
}

export function createQueueWorker(): void {
  const startProcessing = () => {
    setInterval(() => {
      processNext().catch(() => {});
    }, 1000);
  };

  startProcessing();
  console.log("[QUEUE] In-memory worker started");
}
