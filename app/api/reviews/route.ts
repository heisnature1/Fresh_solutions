import { apiHandler, checkRateLimit, honeypotReject, jsonOk, parseJson } from "@/lib/api";
import { reviewSchema } from "@/lib/validation";
import { getDb, schema } from "@/lib/db/client";

/**
 * Customer review submissions. Always stored as "pending" — nothing is
 * published before administrator approval and consent checks.
 */
export const POST = apiHandler(async (req: Request) => {
  await checkRateLimit(req, "public:review", 4, 600);
  const input = await parseJson(req, reviewSchema);
  if (honeypotReject(input.website)) return jsonOk({});

  const db = await getDb();
  await db.insert(schema.testimonials).values({
    name: input.name,
    organisation: input.organisation || null,
    role: input.role || null,
    content: input.content,
    rating: input.rating ?? null,
    source: "customer",
    consentRecorded: false,
    status: "pending",
  });

  return jsonOk({
    message:
      "Thank you — your feedback has been received. It will only be published after our team reviews it and confirms your consent.",
  });
});

export const runtime = "nodejs";
