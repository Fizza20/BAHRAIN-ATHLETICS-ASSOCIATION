import "server-only";
import { z } from "zod";

/**
 * Server-side environment, validated once at start-up so a typo fails loudly instead of
 * silently falling back to an insecure default. Nothing here is exposed to the browser:
 * only variables starting with NEXT_PUBLIC_ are ever bundled for clients, and the sole one
 * used is NEXT_PUBLIC_SITE_URL (a public URL, not a secret).
 */
const schema = z.object({
  DATABASE_URL: z
    .string()
    .trim()
    .min(1)
    .refine((v) => /^(file:|libsql:\/\/|https:\/\/|wss:\/\/)/.test(v), "DATABASE_URL must start with file:, libsql://, https:// or wss://")
    .optional(),
  DATABASE_AUTH_TOKEN: z.string().trim().min(1).optional(),
  SEED_ADMIN_PASSWORD: z.string().min(12, "SEED_ADMIN_PASSWORD must be at least 12 characters").max(72).optional(),
  BAA_DEMO_DB: z.enum(["0", "1"]).optional(),
  VERCEL: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsed.data;
