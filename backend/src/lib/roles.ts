import type { UserRole } from "../db/schema.js";

const VALID: readonly UserRole[] = ["customer", "support", "admin"];

export function parseRole(value: unknown) {
  if (typeof value === "string" && (VALID as readonly string[]).includes(value)) {
    return value as UserRole;
  }
  return "customer";
}
