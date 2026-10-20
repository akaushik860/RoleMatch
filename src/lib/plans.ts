// Free-tier limits. Change numbers here; UI copy reads from this file.
export const FREE_LIMITS = {
  tailor: 3, // AI tailoring runs per day
  import: 2, // resume imports per day
} as const;

export type QuotaKind = keyof typeof FREE_LIMITS;

// Server-side safety net per IP address, across all AI calls.
export const IP_LIMIT_PER_HOUR = 30;
