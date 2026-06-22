const store = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 30, windowMs: 60_000 }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + config.windowMs };
    store.set(key, entry);
  }

  entry.count++;
  return {
    allowed: entry.count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

// Clean up stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 300_000);
