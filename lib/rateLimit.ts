const globalForRateLimit = globalThis as unknown as {
  invoiceRequests?: Map<string, number[]>;
};

const requests = globalForRateLimit.invoiceRequests ?? new Map();
if (!globalForRateLimit.invoiceRequests) {
  globalForRateLimit.invoiceRequests = requests;
}

export function checkRateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const timestamps = requests.get(key) ?? [];
  const updated = timestamps.filter((ts) => now - ts < windowMs);
  if (updated.length >= limit) {
    return false;
  }
  updated.push(now);
  requests.set(key, updated);
  return true;
}
