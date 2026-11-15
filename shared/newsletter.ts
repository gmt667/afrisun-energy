import { z } from "zod";
export const newsletterSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  topics: z
    .array(z.enum(["industry", "company"]))
    .min(1)
    .max(2),
  consent: z.literal(true, {
    error: "Please agree to receive the selected updates",
  }),
  website: z.string().max(0).default(""),
});
