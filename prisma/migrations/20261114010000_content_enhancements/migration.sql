-- Additive only: existing content, publication status, users and sessions are preserved.
ALTER TABLE "Content" ADD COLUMN "details" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Content" ADD COLUMN "approvedBy" TEXT;
ALTER TABLE "Content" ADD COLUMN "approvedAt" TIMESTAMP(3);
CREATE TABLE "NewsletterSubscriber" (
 "id" TEXT NOT NULL,
 "email" TEXT NOT NULL,
 "topics" JSONB NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'pending',
 "confirmationHash" TEXT,
 "confirmationExpiresAt" TIMESTAMP(3),
 "unsubscribeHash" TEXT,
 "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "confirmedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
CREATE UNIQUE INDEX "NewsletterSubscriber_confirmationHash_key" ON "NewsletterSubscriber"("confirmationHash");
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeHash_key" ON "NewsletterSubscriber"("unsubscribeHash");
