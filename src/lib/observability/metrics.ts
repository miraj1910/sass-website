import "server-only";

const counters = new Map<string, number>();
const histograms = new Map<string, number[]>();

export const metrics = {
  increment(counter: string, by = 1): void {
    counters.set(counter, (counters.get(counter) ?? 0) + by);
  },

  record(histogram: string, value: number): void {
    if (!histograms.has(histogram)) {
      histograms.set(histogram, []);
    }
    histograms.get(histogram)!.push(value);
    if (histograms.get(histogram)!.length > 1000) {
      histograms.get(histogram)!.shift();
    }
  },

  getCounters(): Record<string, number> {
    return Object.fromEntries(counters);
  },

  getHistograms(): Record<string, { count: number; avg: number; p95: number; max: number }> {
    const result: Record<string, { count: number; avg: number; p95: number; max: number }> = {};

    for (const [key, values] of histograms) {
      if (values.length === 0) continue;
      const sorted = [...values].sort((a, b) => a - b);
      const sum = sorted.reduce((a, b) => a + b, 0);
      const p95Index = Math.ceil(sorted.length * 0.95) - 1;

      result[key] = {
        count: sorted.length,
        avg: Math.round(sum / sorted.length),
        p95: sorted[p95Index] ?? 0,
        max: sorted[sorted.length - 1],
      };
    }

    return result;
  },

  reset(): void {
    counters.clear();
    histograms.clear();
  },
};
