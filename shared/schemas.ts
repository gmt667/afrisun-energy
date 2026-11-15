import { z } from "zod";
import {
  detailsSchema,
  emptyDetails,
  validatePublishedDetails,
} from "./enhancements";
const text = (max = 200) =>
  z.string().trim().min(1, "This field is required").max(max);
export const enquirySchema = z
  .object({
    kind: z.enum(["contact", "quote", "partnership"]),
    name: text(120),
    organisation: text(160),
    email: z.email().max(254),
    phone: text(40).regex(/^[+\d\s().-]{6,40}$/, "Enter a valid phone number"),
    country: z.string().trim().max(100).default(""),
    category: z.string().trim().max(100).default(""),
    interest: z.string().trim().max(200).default(""),
    productId: z.string().max(100).default(""),
    quantity: z.coerce.number().int().min(1).max(1000000).optional(),
    message: text(5000).min(10, "Please include at least 10 characters"),
    consent: z.literal(true, {
      error: "Please acknowledge the privacy notice",
    }),
    website: z.string().max(0).default(""),
    startedAt: z.number(),
  })
  .superRefine((value, ctx) => {
    if (value.kind !== "contact" && !value.country)
      ctx.addIssue({
        code: "custom",
        path: ["country"],
        message: "Country is required",
      });
    if (value.kind === "quote" && (!value.productId || !value.quantity))
      ctx.addIssue({
        code: "custom",
        path: ["productId"],
        message: "Select a product and quantity",
      });
    if (value.kind !== "quote" && !value.category)
      ctx.addIssue({
        code: "custom",
        path: ["category"],
        message: "Choose an enquiry category",
      });
  });
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(12).max(128),
});
export const contentSchema = z
  .object({
    kind: z.enum([
      "product",
      "article",
      "category",
      "article-category",
      "company",
      "homepage",
      "metric",
      "market",
      "case-study",
      "network-partner",
      "video-story",
      "faq",
    ]),
    slug: text(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: text(200),
    description: z.string().trim().max(1000).default(""),
    body: z.string().max(100000).default(""),
    category: z.string().max(160).default(""),
    brand: z.string().max(160).default(""),
    model: z.string().max(160).default(""),
    image: z
      .string()
      .regex(/^$|^\/media\/[a-f0-9-]+\.(webp|pdf)$/)
      .default(""),
    imageAlt: z.string().max(300).default(""),
    datasheet: z
      .string()
      .regex(/^$|^\/media\/[a-f0-9-]+\.pdf$/)
      .default(""),
    status: z
      .enum(["draft", "review", "published", "archived"])
      .default("draft"),
    details: detailsSchema.default(emptyDetails),
    availability: z
      .enum(["enquiry", "available", "unavailable", "on-order"])
      .default("enquiry"),
    demo: z.boolean().default(false),
    verified: z.boolean().default(false),
    featured: z.boolean().default(false),
    author: z.string().max(120).default(""),
    publishedAt: z.iso.datetime().nullable().default(null),
    seoTitle: z.string().max(70).default(""),
    seoDescription: z.string().max(180).default(""),
    specifications: z
      .array(z.object({ name: text(100), value: text(500) }))
      .max(100)
      .default([]),
    applications: z.string().max(5000).default(""),
    warranty: z.string().max(2000).default(""),
    order: z.number().int().min(0).max(10000).default(0),
  })
  .superRefine((value, ctx) => {
    if (value.status === "published") {
      validatePublishedDetails(value.kind, value.details, ctx);
      if (value.kind === "faq" && (!value.body || !value.details.faq))
        ctx.addIssue({
          code: "custom",
          message: "Published FAQs require an answer and category",
        });
      if (value.demo || !value.verified)
        ctx.addIssue({
          code: "custom",
          message: "Only verified, non-demonstration content may be published",
        });
      if (
        value.kind === "article" &&
        (!value.body || !value.author || !value.publishedAt)
      )
        ctx.addIssue({
          code: "custom",
          message:
            "Published articles require body, author and publication date",
        });
      if (value.image && !value.imageAlt)
        ctx.addIssue({
          code: "custom",
          message: "Add descriptive alternative text for the image",
        });
    }
  });
export type ContentInput = z.infer<typeof contentSchema>;
export type Content = ContentInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
};
