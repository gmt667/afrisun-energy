import { Router, type RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { randomBytes, createHash } from "node:crypto";
import { z } from "zod";
import { db } from "./db.js";
import { newsletterSchema } from "../shared/newsletter.js";
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const newsletterEnabled = () =>
  process.env.NEWSLETTER_ENABLED === "true" &&
  Boolean(
    process.env.DATABASE_URL &&
    process.env.RESEND_API_KEY &&
    process.env.EMAIL_FROM,
  );
export function newsletterRouter() {
  const router = Router();
  router.post(
    "/subscribe",
    rateLimit({
      windowMs: 15 * 60_000,
      limit: 5,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many requests. Please try again later." },
    }),
    async (req, res) => {
      if (!newsletterEnabled()) {
        res.status(503).json({
          error:
            "Newsletter signup is not enabled. Please contact Afrisun directly.",
        });
        return;
      }
      const data = newsletterSchema.parse(req.body);
      const existing = await db.newsletterSubscriber.findUnique({
        where: { email: data.email },
      });
      const message =
        "If confirmation is needed, check your inbox and confirm your email address. You are subscribed only after confirmation.";
      if (existing?.status === "confirmed") {
        res.status(202).json({ message });
        return;
      }
      const token = randomBytes(32).toString("hex");
      const unsubscribe = randomBytes(32).toString("hex");
      const fields = {
        topics: [...new Set(data.topics)],
        status: "pending",
        confirmationHash: digest(token),
        confirmationExpiresAt: new Date(Date.now() + 86400000),
        unsubscribeHash: digest(unsubscribe),
        consentAt: new Date(),
        confirmedAt: null,
      };
      await db.newsletterSubscriber.upsert({
        where: { email: data.email },
        create: { email: data.email, ...fields },
        update: fields,
      });
      const origin = new URL(process.env.SITE_URL || "http://localhost:5173")
        .origin;
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [data.email],
            subject: "Confirm Afrisun Energy updates",
            text: `You requested Afrisun Energy updates (${data.topics.join(", ")}). Confirm within 24 hours:\n${origin}/newsletter/confirm?token=${token}\n\nIf this was not you, ignore this email. You will not be subscribed.\n\nCancel or unsubscribe:\n${origin}/newsletter/unsubscribe?token=${unsubscribe}`,
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error("Provider rejected request");
        res.status(202).json({ message });
      } catch {
        res.status(503).json({
          error:
            "The confirmation email could not be sent. You have not been subscribed. Please try again later.",
        });
      }
    },
  );
  for (const action of ["confirm", "unsubscribe"] as const)
    router.post(`/${action}`, async (req, res) => {
      const { token } = z
        .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
        .parse(req.body);
      if (!process.env.DATABASE_URL) {
        res.status(503).json({ error: "This service is unavailable." });
        return;
      }
      const result = await db.newsletterSubscriber.updateMany({
        where:
          action === "confirm"
            ? {
                confirmationHash: digest(token),
                status: "pending",
                confirmationExpiresAt: { gt: new Date() },
              }
            : {
                unsubscribeHash: digest(token),
                status: { in: ["pending", "confirmed"] },
              },
        data:
          action === "confirm"
            ? {
                status: "confirmed",
                confirmedAt: new Date(),
                confirmationHash: null,
                confirmationExpiresAt: null,
              }
            : {
                status: "unsubscribed",
                confirmationHash: null,
                confirmationExpiresAt: null,
                unsubscribeHash: null,
              },
      });
      if (!result.count) {
        res
          .status(400)
          .json({ error: "This link has expired or has already been used." });
        return;
      }
      res.json({
        message:
          action === "confirm"
            ? "Your email address is confirmed. You are subscribed to your selected Afrisun updates."
            : "You have been unsubscribed from Afrisun updates.",
      });
    });
  return router;
}
export const listSubscribers: RequestHandler = async (_req, res) => {
  res.json(
    await db.newsletterSubscriber.findMany({
      select: {
        id: true,
        email: true,
        topics: true,
        status: true,
        consentAt: true,
        confirmedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    }),
  );
};
