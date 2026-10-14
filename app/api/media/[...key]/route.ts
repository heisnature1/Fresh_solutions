import { readLocalStream, storageDriver, publicFileUrl } from "@/lib/storage";
import { apiHandler, HttpError } from "@/lib/api";
import { Readable } from "node:stream";

/**
 * Serves PUBLIC storage files only (portfolio images, published resources).
 * Private files never pass through this route. Keys are validated against
 * path traversal inside the storage layer.
 */

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
};

export const GET = apiHandler(async (_req: Request, ctx: { params: Promise<{ key: string[] }> }) => {
  const { key } = await ctx.params;
  const joined = key.join("/");

  // Only content-safe extensions are served inline.
  const ext = "." + (joined.split(".").pop() ?? "").toLowerCase();
  const mime = MIME[ext];
  if (!mime) throw new HttpError("Not found.", 404);

  if (storageDriver() === "s3") {
    const url = await publicFileUrl(joined);
    if (!url) throw new HttpError("Not found.", 404);
    return Response.redirect(url, 302);
  }

  const file = await readLocalStream(joined, true);
  if (!file) throw new HttpError("Not found.", 404);

  return new Response(Readable.toWeb(file.stream) as unknown as ReadableStream, {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(file.size),
      "Cache-Control": "public, max-age=3600, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": mime.startsWith("image/") ? "inline" : `attachment; filename="${joined.split("/").pop()}"`,
    },
  });
});

export const runtime = "nodejs";
