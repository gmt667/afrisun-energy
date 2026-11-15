import { detailsOf } from "../shared/enhancements.js";
// Evidence and reviewer identities are administration-only, even for published content.
export function publicContent<
  T extends {
    details?: unknown;
    approvedBy?: string | null;
    approvedAt?: unknown;
  },
>(record: T) {
  const { approvedBy, approvedAt, details, ...rest } = record;
  void approvedBy;
  void approvedAt;
  void details;
  return {
    ...rest,
    details: { ...detailsOf(record), evidence: "" },
  };
}
