import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { categories, articleCategories } from "../shared/content.js";
import { proposedContent } from "./proposed-content.js";
const db = new PrismaClient();
try {
  for (const [order, c] of categories.entries())
    await db.content.upsert({
      where: { kind_slug: { kind: "category", slug: c.slug } },
      update: {},
      create: {
        kind: "category",
        slug: c.slug,
        title: c.name,
        description: c.description,
        status: "draft",
        order,
      },
    });
  for (const title of articleCategories)
    await db.content.upsert({
      where: {
        kind_slug: {
          kind: "article-category",
          slug: title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),
        },
      },
      update: {},
      create: {
        kind: "article-category",
        slug: title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),
        title,
        status: "draft",
      },
    });
  for (const entry of proposedContent)
    await db.content.upsert({
      where: { kind_slug: { kind: entry.kind, slug: entry.slug } },
      update: {},
      create: { ...entry, status: "draft", demo: true, verified: false },
    });
  console.log(
    "Proposed categories and user-supplied illustrative metrics, markets, case studies and headlines saved as drafts. Nothing published.",
  );
} finally {
  await db.$disconnect();
}
