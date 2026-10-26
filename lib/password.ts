import crypto from "crypto";

/**
 * Password hashing with Node's built-in scrypt — zero dependencies.
 * Stored format:  scrypt$N$salt_b64$hash_b64
 */

const KEYLEN = 64;
const COST = 16384; // 2^14 — OWASP-recommended minimum for scrypt

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, KEYLEN, { N: COST });
  return `scrypt$${COST}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

/** Constant-time password verification. Returns false on any malformed input. */
export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;
  const cost = parseInt(parts[1], 10);
  if (!Number.isFinite(cost) || cost < 4096) return false;
  try {
    const salt = Buffer.from(parts[2], "base64");
    const expected = Buffer.from(parts[3], "base64");
    const actual = crypto.scryptSync(password, salt, expected.length, { N: cost });
    return (
      actual.length === expected.length &&
      crypto.timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}

export function passwordPolicyError(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password is too long";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    return "Password needs at least one letter and one number";
  if (/^\s|\s$/.test(password)) return "Password cannot start or end with spaces";
  return null;
}
