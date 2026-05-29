import { z } from "zod";

export const metricCreateSchema = z.object({
  key: z
    .string()
    .min(1, "Metric key is required")
    .max(128, "Metric key must be at most 128 characters"),
  value: z.number("Metric value must be a number"),
});

export const checkoutSchema = z.object({
  priceId: z.string().min(1, "priceId is required"),
  planSlug: z.string().optional(),
  billing: z.enum(["MONTHLY", "YEARLY"]).optional(),
  trialDays: z.number().optional(),
});

export const teamCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .max(100, "Team name must be at most 100 characters")
    .transform((val) => val.trim()),
});

export const teamInviteSchema = z.object({
  email: z.preprocess(
    (val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
    z.string().email("Valid email is required"),
  ),
});
