/**
 * Seeds non-content taxonomy only (knowledge-centre categories). No fake
 * projects, testimonials, articles, or statistics are ever created — those
 * must come from the owner through the dashboard.
 */
import { getDb, schema } from "../lib/db/client";
import { slugify } from "../lib/utils";

const CATEGORIES = ["Technology", "Cybersecurity", "Business", "Tutorials", "Company News"];

async function main() {
  const db = await getDb();
  for (const name of CATEGORIES) {
    const slug = slugify(name);
    await db
      .insert(schema.articleCategories)
      .values({ name, slug })
      .onConflictDoNothing({ target: schema.articleCategories.slug });
  }
  console.log("✔ Seeded knowledge-centre categories.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
