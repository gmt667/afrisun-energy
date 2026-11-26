import { z } from "zod";
import countries from "./africa-countries.json" with { type: "json" };
export const impactKeys = [
  "households",
  "capacity",
  "partners",
  "institutions",
] as const;
export const marketTypes = [
  "headquarters",
  "distribution",
  "retail",
  "planned",
] as const;
export const marketLabels = {
  headquarters: "Corporate headquarters",
  distribution: "Verified distribution hub",
  retail: "Verified retail market",
  planned: "Planned expansion",
};
const copy = (max = 5000) => z.string().trim().max(max).default("");
const date = z.union([z.iso.date(), z.literal("")]).default("");
const amount = z.number().finite().min(0).max(1e12).nullable().default(null);
export function safeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === "443") &&
      url.hostname.includes(".") &&
      !url.hostname.endsWith(".") &&
      !/^[\d.]+$/.test(url.hostname) &&
      !url.hostname.includes("[") &&
      !url.hostname.includes("]") &&
      !url.hostname.includes(":") &&
      !/(^|\.)(localhost|local|internal|test|invalid|example|onion)$/.test(
        url.hostname,
      ) &&
      !url.hostname.endsWith(".example.com") &&
      url.hostname !== "example.com"
    );
  } catch {
    return false;
  }
}
export const detailsSchema = z.object({
  evidence: copy(3000),
  metric: z
    .object({
      key: z.enum(impactKeys),
      value: amount,
      unit: z.enum(["", "MW", "MWh"]).default(""),
      suffix: z.enum(["", "+"]).default(""),
      decimals: z.number().int().min(0).max(2).default(0),
      target: amount,
      targetYear: z.number().int().min(2026).max(2100).nullable().default(null),
      asOf: date,
      methodology: copy(2000),
    })
    .nullable()
    .default(null),
  market: z
    .object({
      countryCode: z
        .string()
        .refine(
          (code) => countries.some((c) => c.code === code),
          "Select a country from the sourced African boundary dataset",
        )
        .default("ZAF"),
      type: z.enum(marketTypes).default("planned"),
      locations: copy(500),
    })
    .nullable()
    .default(null),
  story: z
    .object({
      location: copy(300),
      challenge: copy(),
      contribution: copy(),
      results: copy(),
      testimonial: copy(3000),
      attribution: copy(300),
      quotePermission: z.boolean().default(false),
      relatedServices: z.array(z.string().max(120)).max(6).default([]),
      claims: z
        .array(
          z.object({
            label: z.string().trim().min(1).max(120),
            value: z.number().finite().min(0).max(1e12),
            unit: z.string().max(40).default(""),
            baseline: amount,
            multiplier: amount,
          }),
        )
        .max(12)
        .default([]),
    })
    .nullable()
    .default(null),
  news: z
    .object({
      source: copy(200),
      url: z
        .string()
        .max(2000)
        .default("")
        .refine(
          (v) => !v || safeExternalUrl(v),
          "Use a public HTTPS source URL without credentials or private hosts",
        ),
      sourcePublishedAt: date,
      linkChecked: z.boolean().default(false),
      originalSummary: z.boolean().default(false),
    })
    .nullable()
    .default(null),
  network: z
    .object({ role: copy(160), namePermission: z.boolean().default(false) })
    .nullable()
    .default(null),
  video: z
    .object({
      url: z
        .string()
        .regex(/^$|^\/videos\/[a-z0-9_-]+\.mp4$/i)
        .default(""),
      captions: z
        .string()
        .regex(/^$|^\/captions\/[a-z0-9_-]+\.vtt$/i)
        .default(""),
      transcript: copy(20000),
      location: copy(300),
      durationSeconds: z
        .number()
        .int()
        .min(1)
        .max(7200)
        .nullable()
        .default(null),
      attribution: copy(300),
      mediaPermission: z.boolean().default(false),
    })
    .nullable()
    .default(null),
  faq: z
    .object({
      group: z
        .enum(["Payment Terms", "Partnership Criteria"])
        .default("Partnership Criteria"),
    })
    .nullable()
    .default(null),
});
export type ContentDetails = z.infer<typeof detailsSchema>;
export const emptyDetails = detailsSchema.parse({});
export function detailsOf(record: { details?: unknown }): ContentDetails {
  const parsed = detailsSchema.safeParse(record.details || {});
  return parsed.success ? parsed.data : emptyDetails;
}
export function validatePublishedDetails(
  kind: string,
  details: ContentDetails,
  ctx: z.RefinementCtx,
) {
  const issue = (message: string) =>
    ctx.addIssue({ code: "custom", path: ["details"], message });
  if (
    [
      "metric",
      "market",
      "case-study",
      "network-partner",
      "video-story",
    ].includes(kind) &&
    !details.evidence.trim()
  )
    issue(
      "Add supporting evidence and measurement/permission references before approval",
    );
  if (
    kind === "video-story" &&
    (!details.video?.url ||
      !details.video.captions ||
      !details.video.transcript ||
      !details.video.mediaPermission ||
      !details.video.attribution ||
      !details.video.location)
  )
    issue(
      "Video stories require a clip, English captions, transcript, attribution, location and written media permission",
    );
  if (
    kind === "network-partner" &&
    (!details.network?.role || !details.network.namePermission)
  )
    issue(
      "Named partners require an approved role and permission to name the organisation",
    );
  if (kind === "metric") {
    const m = details.metric;
    if (!m || m.value === null || !m.asOf || !m.methodology)
      issue(
        "Published impact metrics require a value, measurement date and methodology",
      );
    if (m?.asOf && m.asOf > new Date().toISOString().slice(0, 10))
      issue("Measurement dates cannot be in the future");
    if (m?.key === "capacity" && !m.unit)
      issue(
        "Capacity requires an explicit MW or MWh unit; do not combine incompatible units",
      );
    if (m && m.key !== "capacity" && m.unit)
      issue("Household, partner and institution metrics must be counts");
    if (
      m &&
      m.key !== "capacity" &&
      m.value !== null &&
      !Number.isInteger(m.value)
    )
      issue("Counts must be whole numbers");
    if (
      m &&
      ((m.target !== null && !m.targetYear) ||
        (m.targetYear !== null && m.target === null) ||
        (m.target !== null && m.target <= 0))
    )
      issue("A progress target requires a positive value and target year");
  }
  if (kind === "market" && (!details.market || !details.market.locations))
    issue(
      "Published markets require a country, category and verified location description",
    );
  if (kind === "case-study") {
    const s = details.story;
    if (!s || !s.location || !s.challenge || !s.contribution || !s.results)
      issue(
        "Case studies require location, challenge, contribution and results",
      );
    if (s?.testimonial && (!s.quotePermission || !s.attribution))
      issue("Testimonials require written permission and approved attribution");
    if (s && /\d/.test(s.results) && !s.claims.length)
      issue(
        "Record numerical result claims in structured claims with supporting evidence",
      );
    for (const claim of s?.claims || []) {
      if (claim.unit === "%" && claim.value > 100)
        issue("Percentage claims cannot exceed 100");
      if (
        claim.multiplier !== null &&
        (claim.baseline === null ||
          claim.baseline <= 0 ||
          Math.abs(claim.value / claim.baseline - claim.multiplier) > 0.02)
      )
        issue(
          "Claim multiplier must agree with the recorded value and baseline",
        );
    }
  }
  if (kind === "article" && details.news) {
    const n = details.news;
    if (
      !n.source ||
      !n.url ||
      !n.sourcePublishedAt ||
      !n.linkChecked ||
      !n.originalSummary
    )
      issue(
        "External news requires source, date, checked HTTPS link and an original-summary acknowledgement",
      );
    if (n.sourcePublishedAt > new Date().toISOString().slice(0, 10))
      issue("External source dates cannot be in the future");
  }
}
