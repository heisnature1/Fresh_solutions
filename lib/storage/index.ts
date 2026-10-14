import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { dataDir } from "../db/client";

/**
 * File storage abstraction with two drivers:
 *
 * - local (development default): files on disk under .data/storage. Private
 *   files are only readable through an HMAC-signed, short-lived URL checked by
 *   /api/files/download; public files through /api/media/[...key].
 * - s3 (production): S3-compatible object storage (Supabase Storage, AWS S3,
 *   Cloudflare R2...). Private files use presigned GET URLs; public files are
 *   proxied/redirected via presigned URLs too.
 *
 * Storage keys are always generated server-side (`<prefix>/<uuid><ext>`);
 * client-supplied names are never trusted.
 */

export interface StoredRef {
  key: string;
  isPublic: boolean;
}

function extFromMimeOrName(mime: string, name: string): string {
  const fromName = path.extname(name).toLowerCase();
  if (/^\.[a-z0-9]{1,8}$/.test(fromName)) return fromName;
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
  };
  return map[mime] ?? ".bin";
}

export function newStorageKey(prefix: string, originalName: string, mime: string): string {
  const safePrefix = prefix.replace(/[^a-z0-9/-]/gi, "").replace(/\.+/g, "");
  return `${safePrefix}/${crypto.randomUUID()}${extFromMimeOrName(mime, originalName)}`;
}

export function storageDriver(): "s3" | "local" {
  return process.env.S3_BUCKET_PRIVATE && process.env.S3_ACCESS_KEY_ID ? "s3" : "local";
}

function localRoot(isPublic: boolean): string {
  const root = path.join(dataDir(), "storage", isPublic ? "public" : "private");
  fs.mkdirSync(root, { recursive: true });
  return root;
}

function localPathForKey(key: string, isPublic: boolean): string {
  const root = localRoot(isPublic);
  const resolved = path.resolve(root, key);
  // Path-traversal guard: the resolved path must stay inside the storage root.
  if (!resolved.startsWith(root + path.sep)) throw new Error("Invalid storage key");
  return resolved;
}

// -----------------------------------------------------------------------------

export async function saveFile(
  buffer: Buffer,
  opts: { prefix: string; originalName: string; mimeType: string; public?: boolean },
): Promise<StoredRef> {
  const key = newStorageKey(opts.prefix, opts.originalName, opts.mimeType);
  const isPublic = opts.public ?? false;

  if (storageDriver() === "s3") {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: isPublic ? process.env.S3_BUCKET_PUBLIC : process.env.S3_BUCKET_PRIVATE,
        Key: key,
        Body: buffer,
        ContentType: opts.mimeType,
        // Ensures browsers treat served files as downloads unless inline-safe
        ContentDisposition: "attachment",
      }),
    );
    return { key, isPublic };
  }

  const filePath = localPathForKey(key, isPublic);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer, { mode: 0o600 });
  return { key, isPublic };
}

export async function readLocalStream(key: string, isPublic: boolean): Promise<{
  stream: fs.ReadStream;
  size: number;
} | null> {
  if (storageDriver() !== "local") return null;
  try {
    const filePath = localPathForKey(key, isPublic);
    const stat = fs.statSync(filePath);
    return { stream: fs.createReadStream(filePath), size: stat.size };
  } catch {
    return null;
  }
}

export async function deleteFile(key: string, isPublic: boolean): Promise<void> {
  if (storageDriver() === "s3") {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    await (await getS3Client()).send(
      new DeleteObjectCommand({
        Bucket: isPublic ? process.env.S3_BUCKET_PUBLIC : process.env.S3_BUCKET_PRIVATE,
        Key: key,
      }),
    );
    return;
  }
  try {
    fs.unlinkSync(localPathForKey(key, isPublic));
  } catch {
    /* already gone */
  }
}

// ---------------------------------------------------------------------------
// Signed URL support
// ---------------------------------------------------------------------------

function fileTokenSecret(): Buffer {
  if (process.env.FILE_TOKEN_SECRET) return Buffer.from(process.env.FILE_TOKEN_SECRET, "utf8");
  // Dev convenience: generate and persist a local secret so links stay valid
  // across restarts. Production must set FILE_TOKEN_SECRET explicitly.
  const file = path.join(dataDir(), ".file-token-secret");
  if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(32).toString("hex"), { mode: 0o600 });
  return Buffer.from(fs.readFileSync(file, "utf8"), "utf8");
}

function signLocal(key: string, exp: number): string {
  return crypto.createHmac("sha256", fileTokenSecret()).update(`${key}:${exp}`).digest("base64url");
}

export function verifyLocalSignature(key: string, exp: number, sig: string): boolean {
  if (!Number.isInteger(exp) || exp < Date.now()) return false;
  const expected = signLocal(key, exp);
  const a = Buffer.from(expected);
  const b = Buffer.from(String(sig ?? ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Returns a short-lived URL for downloading a private file, or null if the
 * storage layer is not configured.
 */
export async function privateDownloadUrl(key: string, expiresInSeconds = 300): Promise<string | null> {
  if (storageDriver() === "s3") {
    try {
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      return await getSignedUrl(
        await getS3Client(),
        new GetObjectCommand({ Bucket: process.env.S3_BUCKET_PRIVATE, Key: key }),
        { expiresIn: expiresInSeconds },
      );
    } catch {
      return null;
    }
  }
  const exp = Date.now() + expiresInSeconds * 1000;
  const sig = signLocal(key, exp);
  return `/api/files/download?k=${encodeURIComponent(key)}&exp=${exp}&sig=${encodeURIComponent(sig)}`;
}

/** URL usable in <img src> for public files (streamed or presigned). */
export async function publicFileUrl(key: string): Promise<string | null> {
  if (storageDriver() === "s3") {
    try {
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      return await getSignedUrl(
        await getS3Client(),
        new GetObjectCommand({ Bucket: process.env.S3_BUCKET_PUBLIC, Key: key }),
        { expiresIn: 3600 },
      );
    } catch {
      return null;
    }
  }
  return `/api/media/${key}`;
}

// ---------------------------------------------------------------------------

let cachedS3: import("@aws-sdk/client-s3").S3Client | null = null;

async function getS3Client(): Promise<import("@aws-sdk/client-s3").S3Client> {
  if (cachedS3) return cachedS3;
  const { S3Client } = await import("@aws-sdk/client-s3");
  cachedS3 = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  return cachedS3;
}

/** Honest integration status for the admin dashboard. */
export function storageStatus(): { driver: "s3" | "local"; configured: boolean; note: string } {
  if (storageDriver() === "s3") {
    return { driver: "s3", configured: true, note: "S3-compatible object storage configured." };
  }
  if (process.env.VERCEL) {
    return {
      driver: "local",
      configured: false,
      note: "No S3 storage configured — files would be lost on redeploy. Configure S3_* variables before production use.",
    };
  }
  return {
    driver: "local",
    configured: true,
    note: "Local disk storage under .data/storage (development only — configure S3_* variables for deployment).",
  };
}
