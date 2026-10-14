import crypto from "node:crypto";

/**
 * Reference numbers are unique but deliberately non-sequential, so they cannot
 * be used to enumerate other customers' records.
 * Format: PREFIX-XXXX-XXXX-XXXX (Crockford-ish alphabet, no ambiguous chars).
 */

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomChunk(len: number): string {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function newReference(prefix: string): string {
  return `${prefix}-${randomChunk(4)}-${randomChunk(4)}-${randomChunk(4)}`;
}

/** Public lookup code given to customers alongside the reference (kept secret). */
export function newAccessCode(): string {
  return randomChunk(8);
}
