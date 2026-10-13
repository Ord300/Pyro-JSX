// ============================================================
// MOTS DE PASSE — hachage scrypt (Node, sans dépendance).
// Format stocké : scrypt$N$r$p$selHex$cleHex
// Les anciens mots de passe en clair restent vérifiables une fois
// (retour "legacy") puis sont migrés vers le hash à la connexion.
// ============================================================

import { scrypt as _scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(_scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options?: { N?: number; r?: number; p?: number; maxmem?: number }
) => Promise<Buffer>;

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const PREFIX = `scrypt$${N}$${R}$${P}$`;

export const isHashed = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("scrypt$");

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scryptAsync(password, salt, KEYLEN, { N, r: R, p: P })) as Buffer;
  return `${PREFIX}${salt.toString("hex")}$${key.toString("hex")}`;
}

export type VerifyResult = "ok" | "legacy" | "invalid";

export async function verifyPassword(password: string, stored: unknown): Promise<VerifyResult> {
  if (typeof password !== "string" || typeof stored !== "string" || !stored) return "invalid";
  // Nouveau format : comparaison scrypt en temps constant.
  if (isHashed(stored)) {
    try {
      const parts = stored.split("$");
      if (parts.length !== 6) return "invalid";
      const [, n, r, p, saltHex, keyHex] = parts;
      const key = (await scryptAsync(password, Buffer.from(saltHex, "hex"), KEYLEN, {
        N: Number(n),
        r: Number(r),
        p: Number(p),
      })) as Buffer;
      const expected = Buffer.from(keyHex, "hex");
      if (key.length !== expected.length) return "invalid";
      return timingSafeEqual(key, expected) ? "ok" : "invalid";
    } catch {
      return "invalid";
    }
  }
  // Héritage : mot de passe stocké en clair (à migrer au login).
  return password === stored ? "legacy" : "invalid";
}
