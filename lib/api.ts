import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { fieldErrors } from "./validation";
import { rateLimit } from "./ratelimit";
import { clientIp } from "./audit";
import { getCurrentAdmin } from "./auth";

export function jsonOk(data: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function jsonError(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Wrap a route handler with consistent, leak-free error handling. */
export function apiHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>,
): (...args: T) => Promise<Response> {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof HttpError) return jsonError(err.message, err.status);
      if (err instanceof ZodError) {
        return jsonError("Please correct the highlighted fields.", 422, { errors: fieldErrors(err) });
      }
      console.error("[api] Unhandled error:", err);
      return jsonError("Something went wrong on our side. Please try again in a moment.", 500);
    }
  };
}

/** Parse + validate JSON body against a zod schema. */
export async function parseJson<S extends ZodSchema>(req: Request, schema: S): Promise<import("zod").infer<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError("Invalid request body.", 400);
  }
  return schema.parse(body);
}

/** Enforce origin for cookie-authenticated mutations (CSRF defence-in-depth). */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  if (!origin) return; // non-browser clients (and same-origin forms) may omit it
  try {
    const host = new URL(origin).host;
    const reqHost = req.headers.get("host");
    if (reqHost && host !== reqHost) throw new HttpError("Cross-origin request rejected.", 403);
  } catch (err) {
    if (err instanceof HttpError) throw err;
  }
}

export { HttpError };

/** Admin guard for API routes. */
export async function requireAdmin() {
  const session = await getCurrentAdmin();
  if (!session) throw new HttpError("Authentication required.", 401);
  return session.admin;
}

/** Rate-limit guard keyed by bucket + IP. */
export async function checkRateLimit(
  req: Request,
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const ip = clientIp(req.headers) ?? "unknown";
  const result = await rateLimit({ key: `${bucket}:${ip}`, limit, windowSeconds });
  if (!result.allowed) {
    throw new HttpError(`Too many requests. Please try again in ${Math.ceil(result.retryAfterSeconds / 60)} minute(s).`, 429);
  }
}

/** Honeypot anti-spam: reject when a hidden field has been filled. */
export function honeypotReject(website?: string): boolean {
  return Boolean(website && website.length > 0);
}

/** Collect uploaded files from multipart FormData under a given field name. */
export async function formFiles(form: FormData, field: string, max = 5): Promise<File[]> {
  const out: File[] = [];
  for (const value of form.getAll(field)) {
    if (value instanceof File && value.size > 0) out.push(value);
    if (out.length >= max) break;
  }
  return out;
}
