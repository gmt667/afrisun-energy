import type { Content } from "./schemas";

// Public records are edited as source and shipped with the static site.
// Keep unverified drafts out of these arrays.
export const publicContent = {
  products: [] as Content[],
  articles: [] as Content[],
  metrics: [] as Content[],
  markets: [] as Content[],
  caseStudies: [] as Content[],
  videoStories: [] as Content[],
  faqs: [] as Content[],
};
