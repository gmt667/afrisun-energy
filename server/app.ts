import "dotenv/config";
import express, { type RequestHandler } from "express";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { pageResponse } from "./page-response.js";
import path from "node:path";
import bcrypt from "bcryptjs";
import multer from "multer";
import sharp from "sharp";
import { z } from "zod";
import { db } from "./db.js";
import type { Prisma } from "@prisma/client";
import {
  contentSchema,
  enquirySchema,
  loginSchema,
  type ContentInput,
} from "../shared/schemas.js";
import { company, navigation } from "../shared/content.js";
import { detailsOf } from "../shared/enhancements.js";
import { publicContent } from "./public-content.js";
import {
  newsletterRouter,
  newsletterEnabled,
  listSubscribers,
} from "./newsletter.js";

const production = process.env.NODE_ENV === "production";
const origin = new URL(process.env.SITE_URL || "http://localhost:5173").origin;
const secret =
  process.env.SESSION_SECRET ||
  (production ? "" : randomBytes(32).toString("hex"));
if (production && secret.length < 32)
  throw new Error("SESSION_SECRET must have at least 32 characters");
if (production && !origin.startsWith("https://"))
  throw new Error("Production SITE_URL must use HTTPS");
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const sign = (s: string) =>
  createHmac("sha256", secret).update(s).digest("hex");
const same = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
export const publicWhere = {
  status: "published",
  demo: false,
  verified: true,
  OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
};
const publicFilter = () => ({
  ...publicWhere,
  OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
});
const audit = (userId: string, action: string, target: string) =>
  db.audit.create({ data: { userId, action, target } });
async function validateMedia(data: ContentInput, tx: Prisma.TransactionClient) {
  if (data.status !== "published") return;
  const video = detailsOf(data).video;
  const references = [
    { url: data.image, mime: "image/webp" },
    { url: data.datasheet, mime: "application/pdf" },
    ...(data.kind === "video-story" && video
      ? [
          { url: video.url, mime: "video/mp4" },
          { url: video.captions, mime: "text/vtt" },
        ]
      : []),
  ];
  for (const reference of references.filter((x) => x.url)) {
    const media = await tx.media.findFirst({
      where: { url: reference.url, mime: reference.mime },
    });
    if (!media)
      throw Object.assign(
        new Error(
          "Referenced media is missing or has the wrong type. Upload and review the asset before publication.",
        ),
        { status: 400 },
      );
  }
}
type Auth = { id: string; role: string; name: string; email: string };
declare module "express-serve-static-core" {
  interface Locals {
    user: Auth;
    csrf: string;
    sessionId: string;
  }
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameSrc: ["https://www.openstreetmap.org"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: production ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(compression(), express.json({ limit: "250kb" }), cookieParser());
  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 300,
      message: { error: "Too many requests. Please try again shortly." },
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  const sameOrigin: RequestHandler = (req, res, next) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.headers.origin !== origin
    ) {
      res.status(403).json({ error: "Request origin rejected" });
      return;
    }
    next();
  };
  app.use("/api", sameOrigin);
  const auth: RequestHandler = async (req, res, next) => {
    const token = req.cookies.afrisun_session;
    if (typeof token !== "string") {
      res.status(401).json({ error: "Please sign in" });
      return;
    }
    const session = await db.session.findUnique({
      where: { id: hash(token) },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date() || !session.user.active) {
      res.status(401).json({ error: "Session expired" });
      return;
    }
    res.locals.user = session.user;
    res.locals.csrf = session.csrf;
    res.locals.sessionId = session.id;
    if (
      !["GET", "HEAD"].includes(req.method) &&
      req.headers["x-csrf-token"] !== session.csrf
    ) {
      res.status(403).json({ error: "Invalid security token" });
      return;
    }
    next();
  };
  const admin: RequestHandler = (_req, res, next) => {
    if (res.locals.user.role !== "admin") {
      res.status(403).json({ error: "Administrator access required" });
      return;
    }
    next();
  };
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/config", (_req, res) =>
    res.json({
      newsletterEnabled: newsletterEnabled(),
      enquiriesEnabled:
        Boolean(process.env.DATABASE_URL) &&
        process.env.ENQUIRIES_ENABLED === "true",
    }),
  );
  app.get("/api/challenge", (_req, res) => {
    const timestamp = Date.now().toString();
    const nonce = randomBytes(16).toString("hex");
    const value = `${timestamp}.${nonce}`;
    res.json({ challenge: `${value}.${sign(value)}` });
  });
  app.use("/api/newsletter", newsletterRouter());
  app.get("/api/content", async (req, res) => {
    if (!process.env.DATABASE_URL) {
      res.json({ items: [], total: 0, page: 1 });
      return;
    }
    const kind = z
      .enum([
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
      ])
      .parse(req.query.kind || "product");
    const q = z
      .string()
      .max(120)
      .parse(req.query.q || "");
    const category = z
      .string()
      .max(160)
      .parse(req.query.category || "");
    const brand = z
      .string()
      .max(160)
      .parse(req.query.brand || "");
    const page = z.coerce
      .number()
      .int()
      .min(1)
      .max(10000)
      .parse(req.query.page || 1);
    const specification = z
      .string()
      .max(100)
      .parse(req.query.specification || "");
    const specValue = z
      .string()
      .max(500)
      .parse(req.query.specValue || "");
    const where = {
      ...publicFilter(),
      kind,
      ...(q
        ? {
            AND: [
              {
                OR: [
                  { title: { contains: q, mode: "insensitive" as const } },
                  {
                    description: { contains: q, mode: "insensitive" as const },
                  },
                  { body: { contains: q, mode: "insensitive" as const } },
                ],
              },
            ],
          }
        : {}),
      ...(category ? { category } : {}),
      ...(brand ? { brand } : {}),
      ...(specification && specValue
        ? {
            specifications: {
              array_contains: [{ name: specification, value: specValue }],
            },
          }
        : {}),
      ...(req.query.featured === "true" ? { featured: true } : {}),
    };
    const limit = z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .parse(req.query.limit || 12);
    const [items, total] = await Promise.all([
      db.content.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
      }),
      db.content.count({ where }),
    ]);
    res.json({ items: items.map(publicContent), total, page });
  });
  app.get("/api/facets", async (_req, res) => {
    if (!process.env.DATABASE_URL) {
      res.json({ brands: [], specifications: [] });
      return;
    }
    const rows = await db.content.findMany({
      where: { ...publicFilter(), kind: "product" },
      select: { brand: true, specifications: true },
      take: 2000,
    });
    const specs = new Map<string, { name: string; value: string }>();
    for (const row of rows) {
      if (Array.isArray(row.specifications)) {
        for (const spec of row.specifications) {
          if (
            spec &&
            typeof spec === "object" &&
            !Array.isArray(spec) &&
            typeof spec.name === "string" &&
            typeof spec.value === "string"
          )
            specs.set(spec.name + "::" + spec.value, {
              name: spec.name,
              value: spec.value,
            });
        }
      }
    }
    res.json({
      brands: [...new Set(rows.map((x) => x.brand).filter(Boolean))],
      specifications: [...specs.values()],
    });
  });
  app.get("/api/content/:kind/:slug", async (req, res) => {
    if (!process.env.DATABASE_URL) {
      res.status(404).json({ error: "Content not found" });
      return;
    }
    const item = await db.content.findFirst({
      where: {
        ...publicFilter(),
        kind: req.params.kind,
        slug: req.params.slug,
      },
    });
    if (!item) {
      res.status(404).json({ error: "Content not found" });
      return;
    }
    res.json(publicContent(item));
  });
  app.post(
    "/api/enquiries",
    rateLimit({
      windowMs: 15 * 60_000,
      limit: 5,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
    async (req, res) => {
      if (
        process.env.ENQUIRIES_ENABLED !== "true" ||
        !process.env.DATABASE_URL
      ) {
        res.status(503).json({
          error:
            "Online enquiries are not enabled. Please email or call Afrisun directly.",
        });
        return;
      }
      const data = enquirySchema.parse(req.body);
      const challenge = z.string().max(200).parse(req.body.challenge);
      const parts = challenge.split(".");
      const stamp = Number(parts[0]);
      if (
        parts.length !== 3 ||
        !Number.isFinite(stamp) ||
        !same(sign(`${parts[0]}.${parts[1]}`), parts[2]) ||
        Date.now() - stamp < 2000 ||
        Date.now() - stamp > 3600000 ||
        data.startedAt > Date.now() - 2000
      ) {
        res
          .status(400)
          .json({ error: "Please reload the form and try again." });
        return;
      }
      if (data.kind === "quote") {
        const product = await db.content.findFirst({
          where: { ...publicFilter(), id: data.productId, kind: "product" },
        });
        if (!product) {
          res
            .status(400)
            .json({ error: "This product is not available for enquiry." });
          return;
        }
      }
      const {
        website: _website,
        startedAt: _started,
        consent: _consent,
        ...fields
      } = data;
      void _website;
      void _started;
      void _consent;
      const record = await db.enquiry.create({ data: fields });
      // A stored enquiry is successful independently of external mail delivery.
      let emailStatus = "unconfigured";
      if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
        try {
          const configuredRecipients = process.env.EMAIL_TO
            ?.split(",")
            .map((email) => email.trim())
            .filter(Boolean);
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
              "Idempotency-Key": record.id,
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM,
              to: configuredRecipients?.length
                ? configuredRecipients
                : company.emails,
              reply_to: data.email,
              subject: `Afrisun ${data.kind} enquiry ${record.id}`,
              text: Object.entries(fields)
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n"),
            }),
            signal: AbortSignal.timeout(10000),
          });
          emailStatus = response.ok ? "sent" : "failed";
        } catch {
          emailStatus = "failed";
        }
      }
      await db.enquiry.update({
        where: { id: record.id },
        data: { emailStatus },
      });
      res.status(201).json({
        id: record.id,
        message: "Your enquiry has been securely recorded.",
        notification:
          emailStatus === "sent"
            ? "Email notification accepted by provider."
            : "The team can review your enquiry in the administration dashboard.",
      });
    },
  );
  const loginLimit = rateLimit({
    windowMs: 15 * 60_000,
    limit: 8,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  app.post("/api/auth/login", loginLimit, async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    const valid = await bcrypt.compare(
      password,
      user?.passwordHash ||
        "$2b$12$2vV4olwSiZnVFrPJL3e4zOY19ju3A8fueOEJi3Q8oQkWDMqL0oUTe",
    );
    if (!user || !user.active || !valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = randomBytes(32).toString("hex");
    const csrf = randomBytes(32).toString("hex");
    await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    await db.session.create({
      data: {
        id: hash(token),
        csrf,
        userId: user.id,
        expiresAt: new Date(Date.now() + 8 * 3600000),
      },
    });
    await audit(user.id, "login", user.id);
    res.cookie("afrisun_session", token, {
      httpOnly: true,
      secure: production,
      sameSite: "strict",
      maxAge: 8 * 3600000,
      path: "/",
    });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      csrf,
    });
  });
  app.get("/api/auth/me", auth, (_req, res) =>
    res.json({
      user: {
        id: res.locals.user.id,
        name: res.locals.user.name,
        email: res.locals.user.email,
        role: res.locals.user.role,
      },
      csrf: res.locals.csrf,
    }),
  );
  app.post("/api/auth/logout", auth, async (_req, res) => {
    await db.session.delete({ where: { id: res.locals.sessionId } });
    res.clearCookie("afrisun_session", { path: "/" }).json({ ok: true });
  });
  app.use("/api/admin", auth, (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.get("/api/admin/overview", async (_req, res) => {
    const [products, articles, enquiries, drafts] = await Promise.all([
      db.content.count({ where: { kind: "product", status: "published" } }),
      db.content.count({ where: { kind: "article", status: "published" } }),
      db.enquiry.count(),
      db.content.count({ where: { status: "draft" } }),
    ]);
    res.json({ products, articles, enquiries, drafts });
  });
  app.get("/api/admin/content", async (req, res) =>
    res.json(
      await db.content.findMany({
        where: req.query.kind ? { kind: String(req.query.kind) } : {},
        orderBy: { updatedAt: "desc" },
        take: 500,
      }),
    ),
  );
  app.get("/api/admin/content/:id", async (req, res) => {
    const item = await db.content.findUnique({ where: { id: req.params.id } });
    if (!item) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(item);
  });
  app.post("/api/admin/content", async (req, res) => {
    const data = contentSchema.parse(req.body);
    if (
      res.locals.user.role !== "admin" &&
      (data.verified || data.status === "published")
    ) {
      res.status(403).json({
        error:
          "Only administrators may approve or publish content. Save a draft or submit for review.",
      });
      return;
    }
    const item = await db.$transaction(async (tx) => {
      await validateMedia(data, tx);
      const item = await tx.content.create({
        data: {
          ...data,
          approvedBy: data.verified ? res.locals.user.id : null,
          approvedAt: data.verified ? new Date() : null,
        },
      });
      await tx.audit.create({
        data: {
          userId: res.locals.user.id,
          action: data.verified
            ? "content.approve.create"
            : data.status === "review"
              ? "content.submit-review"
              : "content.create",
          target: item.id,
        },
      });
      return item;
    });
    res.status(201).json(item);
  });
  app.put("/api/admin/content/:id", async (req, res) => {
    const data = contentSchema.parse(req.body);
    const item = await db.$transaction(async (tx) => {
      const current = await tx.content.findUnique({
        where: { id: req.params.id },
      });
      if (!current)
        throw Object.assign(new Error("Content not found"), { status: 404 });
      if (
        res.locals.user.role !== "admin" &&
        (data.verified ||
          data.status === "published" ||
          current.status === "published" ||
          current.verified)
      )
        throw Object.assign(
          new Error(
            "Administrator approval is required to edit approved content. Ask an administrator to unpublish it for review.",
          ),
          { status: 403 },
        );
      await validateMedia(data, tx);
      const item = await tx.content.update({
        where: { id: req.params.id },
        data: {
          ...data,
          approvedBy: data.verified ? res.locals.user.id : null,
          approvedAt: data.verified ? new Date() : null,
        },
      });
      await tx.audit.create({
        data: {
          userId: res.locals.user.id,
          action: data.verified
            ? "content.approve.update"
            : data.status === "review"
              ? "content.submit-review"
              : "content.update",
          target: item.id,
        },
      });
      return item;
    });
    res.json(item);
  });
  app.get("/api/admin/enquiries", admin, async (_req, res) =>
    res.json(
      await db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 1000 }),
    ),
  );
  app.get("/api/admin/newsletter", admin, listSubscribers);
  app.patch("/api/admin/enquiries/:id", admin, async (req, res) => {
    const id = z.string().parse(req.params.id);
    const status = z
      .enum(["new", "in-progress", "closed"])
      .parse(req.body.status);
    await db.$transaction([
      db.enquiry.update({ where: { id }, data: { status } }),
      db.audit.create({
        data: {
          userId: res.locals.user.id,
          action: `enquiry.${status}`,
          target: id,
        },
      }),
    ]);
    res.json({ ok: true });
  });
  app.get("/api/admin/export", admin, async (_req, res) => {
    const rows = await db.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 10000,
    });
    await audit(res.locals.user.id, "enquiry.export", String(rows.length));
    const fields = [
      "id",
      "kind",
      "name",
      "organisation",
      "email",
      "phone",
      "country",
      "category",
      "message",
      "status",
      "createdAt",
    ] as const;
    const cell = (v: unknown) =>
      `"${String(v ?? "")
        .replace(/^[=+\-@\t\r]/, "'$&")
        .replaceAll('"', '""')}"`;
    res
      .type("text/csv")
      .attachment("afrisun-enquiries.csv")
      .send(
        [
          fields.join(","),
          ...rows.map((row) => fields.map((f) => cell(row[f])).join(",")),
        ].join("\r\n"),
      );
  });
  app.get("/api/admin/audit", admin, async (_req, res) =>
    res.json(
      await db.audit.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    ),
  );
  app.get("/api/admin/users", admin, async (_req, res) =>
    res.json(
      await db.user.findMany({
        select: { id: true, email: true, name: true, role: true, active: true },
      }),
    ),
  );
  app.post("/api/admin/users", admin, async (req, res) => {
    const input = z
      .object({
        email: z.email(),
        name: z.string().trim().min(1).max(120),
        password: z.string().min(14).max(128),
        role: z.enum(["admin", "editor"]),
      })
      .parse(req.body);
    const user = await db.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        role: input.role,
        passwordHash: await bcrypt.hash(input.password, 12),
      },
    });
    await audit(res.locals.user.id, "user.create", user.id);
    res.status(201).json({ id: user.id });
  });
  app.patch("/api/admin/users/:id", admin, async (req, res) => {
    const id = z.string().parse(req.params.id);
    const data = z
      .object({ role: z.enum(["admin", "editor"]), active: z.boolean() })
      .parse(req.body);
    if (id === res.locals.user.id) {
      res.status(400).json({ error: "You cannot change your own access" });
      return;
    }
    await db.$transaction([
      db.user.update({ where: { id }, data }),
      db.session.deleteMany({ where: { userId: id } }),
      db.audit.create({
        data: {
          userId: res.locals.user.id,
          action: "user.access",
          target: id,
        },
      }),
    ]);
    res.json({ ok: true });
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  });
  app.get("/api/admin/media", async (_req, res) =>
    res.json(
      await db.media.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    ),
  );
  app.post("/api/admin/media", upload.single("file"), async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "Select a file" });
      return;
    }
    const alt = z.string().trim().min(1).max(300).parse(req.body.alt);
    const file = req.file;
    if (file.mimetype !== "video/mp4" && file.size > 10 * 1024 * 1024) {
      res
        .status(400)
        .json({ error: "Images and documents must be under 10 MB." });
      return;
    }
    const id = randomUUID();
    let buffer: Buffer;
    let extension: string;
    let mime: string;
    if (
      file.mimetype === "video/mp4" &&
      file.buffer.subarray(4, 8).toString() === "ftyp"
    ) {
      buffer = file.buffer;
      extension = "mp4";
      mime = "video/mp4";
    } else if (
      file.mimetype === "text/vtt" &&
      file.size <= 1024 * 1024 &&
      file.buffer
        .toString("utf8")
        .replace(/^\uFEFF/, "")
        .startsWith("WEBVTT")
    ) {
      buffer = file.buffer;
      extension = "vtt";
      mime = "text/vtt";
    } else if (
      file.mimetype === "application/pdf" &&
      file.buffer.subarray(0, 5).toString() === "%PDF-"
    ) {
      buffer = file.buffer;
      extension = "pdf";
      mime = "application/pdf";
    } else if (
      ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
    ) {
      buffer = await sharp(file.buffer, { limitInputPixels: 24000000 })
        .rotate()
        .resize({
          width: 2000,
          height: 2000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
      extension = "webp";
      mime = "image/webp";
    } else {
      res.status(400).json({
        error: "Only JPEG, PNG, WebP, PDF, MP4 and WebVTT files are allowed",
      });
      return;
    }
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, `${id}.${extension}`), buffer, {
      flag: "wx",
    });
    const media = await db.media.create({
      data: {
        id,
        filename: file.originalname.slice(0, 200),
        url: `/media/${id}.${extension}`,
        mime,
        size: buffer.length,
        alt,
      },
    });
    await audit(res.locals.user.id, "media.upload", id);
    res.status(201).json(media);
  });
  app.get("/media/:filename", async (req, res) => {
    if (!process.env.DATABASE_URL) {
      res.sendStatus(404);
      return;
    }
    if (!/^[a-f0-9-]+\.(webp|pdf|mp4|vtt)$/.test(req.params.filename)) {
      res.sendStatus(404);
      return;
    }
    const record = await db.media.findFirst({
      where: { url: `/media/${req.params.filename}` },
    });
    if (!record) {
      res.sendStatus(404);
      return;
    }
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.type(record.mime);
    if (record.mime === "application/pdf") res.attachment("datasheet.pdf");
    res.sendFile(path.join(uploadDir, req.params.filename));
  });
  app.get("/robots.txt", (_req, res) =>
    res
      .type("text")
      .send(
        `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nDisallow: /newsletter/\nSitemap: ${origin}/sitemap.xml`,
      ),
  );
  app.get("/sitemap.xml", async (_req, res) => {
    const rows = process.env.DATABASE_URL
      ? await db.content.findMany({
          where: {
            ...publicFilter(),
            kind: { in: ["product", "article", "case-study"] },
          },
        })
      : [];
    const urls = [
      ...navigation.map((x) => x[1]),
      "/privacy",
      "/cookies",
      ...rows.map(
        (x) =>
          `/${x.kind === "product" ? "products" : x.kind === "case-study" ? "stories" : "insights"}/${x.slug}`,
      ),
    ];
    res
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((x) => `<url><loc>${origin}${x}</loc></url>`).join("")}</urlset>`,
      );
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "Endpoint not found" }),
  );
  if (production) {
    app.use(
      express.static(path.resolve("dist"), { index: false, maxAge: "1h" }),
    );
    app.get("/{*path}", pageResponse);
  }
  const errorHandler: express.ErrorRequestHandler = (
    error,
    _req,
    res,
    _next,
  ) => {
    void _next;
    if (
      error instanceof Error &&
      "status" in error &&
      (error.status === 400 || error.status === 403 || error.status === 404)
    ) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        error: "This URL slug is already in use. Choose a unique slug.",
      });
      return;
    }
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ error: error.issues.map((x) => x.message).join(". ") });
      return;
    }
    if (error instanceof multer.MulterError) {
      res.status(400).json({
        error:
          "Upload rejected. Maximum video size is 50 MB; images and PDFs are limited to 10 MB.",
      });
      return;
    }
    console.error(
      "Request failed:",
      error instanceof Error ? error.name : "UnknownError",
    );
    res.status(503).json({
      error:
        "This service is temporarily unavailable. Please try again or contact Afrisun directly.",
    });
  };
  app.use(errorHandler);
  return app;
}
