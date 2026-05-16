import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535),

  ENVIRONMENT: z.enum(["development", "production", "test"]),

  DATABASE_URL: z
    .string()
    .url()
    .startsWith("postgresql://", {
      message: "DATABASE_URL must be a valid PostgreSQL connection string",
    }),

  CLERK_PUBLISHABLE_KEY: z
    .string()
    .startsWith("pk_", {
      message: "Invalid Clerk publishable key",
    }),

  CLERK_SECRET_KEY: z
    .string()
    .startsWith("sk_", {
      message: "Invalid Clerk secret key",
    }),

  CLERK_WEBHOOK_SECRET: z
    .string()
    .startsWith("whsec_", {
      message: "Invalid Clerk webhook secret",
    }),

  SENTRY_DSN: z
    .string()
    .url()
    .includes("sentry.io", {
      message: "Invalid Sentry DSN",
    }),

  STRAM_API_KEY: z
    .string()
    .min(10, "STRAM_API_KEY is too short"),

  STRAM_API_SECRETE: z
    .string()
    .min(20, "STRAM_API_SECRETE is too short"),

  IMAGEKI_PUBLIC_KEY: z
    .string()
    .startsWith("public_", {
      message: "Invalid ImageKit public key",
    }),

  IMAGEKI_PRIVATE_KEY: z
    .string()
    .startsWith("private_", {
      message: "Invalid ImageKit private key",
    }),

  IMAGEKI_URL: z
    .string()
    .url()
    .includes("imagekit.io", {
      message: "Invalid ImageKit URL",
    }),

  FRONTEND_URL: z
    .string()
    .url(),

  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_API_BASE: z.string().url().default('https://api.polar.sh'),
  //TODO make the variable below a uuid
  POLAR_CHECKOUT_PRODUCT_ID: z.string().optional()  //.uuid()
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);

    throw new Error("Invalid environments variables");
  }

  return parsed.data;
}

let cachedEnv: Env | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = loadEnv();
  }

  return cachedEnv;
}
