import { apiHandler, HttpError, requireAdmin, assertSameOrigin } from "@/lib/api";
import { readLocalStream, storageDriver, verifyLocalSignature } from "@/lib/storage";
import { privateDownloadUrl } from "@/lib/storage";
import { Readable } from "node:stream";

/**
 * Private file downloads. Requires BOTH a valid administrator session AND a
 * valid short-lived HMAC signature, so URLs expire and cannot be shared.
 * Never accepts a filename from the client — only a server-generated key.
 */
export const GET = apiHandler(async (req: Request) => {
  await requireAdmin();

  const url = new URL(req.url);
  const key = url.searchParams.get("k") ?? "";
  const exp = Number(url.searchParams.get("exp") ?? "0");
  const sig = url.searchParams.get("sig") ?? "";
  const name = url.searchParams.get("n") ?? "file";

  if (!key || !verifyLocalSignature(key, exp, sig)) {
    throw new HttpError("This download link is invalid or has expired.", 403);
  }
  if (storageDriver() === "s3") {
    const signed = await privateDownloadUrl(key, 120);
    if (!signed) throw new HttpError("File unavailable.", 404);
    return Response.redirect(signed, 302);
  }

  const safeName = name.replace(/[^\w.()\[\] -]/g, "_").slice(0, 200) || "download";
  const ext = "." + (key.split(".").pop() ?? "").toLowerCase();
  const inline = ext === ".pdf";

  const file = await readLocalStream(key, false);
  if (!file) throw new HttpError("File not found.", 404);

  return new Response(Readable.toWeb(file.stream) as unknown as ReadableStream, {
    headers: {
      "Content-Type": inline ? "application/pdf" : "application/octet-stream",
      "Content-Length": String(file.size),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});

export const runtime = "nodejs";
