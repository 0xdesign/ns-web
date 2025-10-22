/**
 * Application rate limiting helper.
 *
 * Provides an Upstash Redis-backed limiter with an in-memory fallback so that
 * local development and automated tests do not rely on external services.
 */

const FALLBACK_WINDOW_SECONDS = 24 * 60 * 60; // 24 hours
const FALLBACK_LIMIT = 3; // 3 submissions per window

type RateLimitResult = {
  allowed: boolean
  remaining: number
  reset: number
}

type MemoryBucket = {
  count: number
  reset: number
}

const memoryBuckets = new Map<string, MemoryBucket>()

function getMemoryBucket(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now()
  const existing = memoryBuckets.get(key)

  if (!existing || existing.reset <= now) {
    const bucket: MemoryBucket = {
      count: 1,
      reset: now + windowSeconds * 1000,
    }
    memoryBuckets.set(key, bucket)
    return {
      allowed: true,
      remaining: Math.max(limit - bucket.count, 0),
      reset: bucket.reset,
    }
  }

  existing.count += 1
  memoryBuckets.set(key, existing)

  return {
    allowed: existing.count <= limit,
    remaining: existing.count >= limit ? 0 : limit - existing.count,
    reset: existing.reset,
  }
}

async function upstashRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  try {
    const response = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commands: [
          ['INCR', key],
          ['EXPIRE', key, windowSeconds, 'NX'],
          ['PTTL', key],
        ],
      }),
    })

    if (!response.ok) {
      console.error('Upstash rate limit error:', response.status, await response.text())
      return null
    }

    const data: { result?: [number, unknown, number] } = await response.json()
    const [count, _expireResult, ttlMs] = data.result || []

    if (typeof count !== 'number' || typeof ttlMs !== 'number') {
      return null
    }

    return {
      allowed: count <= limit,
      remaining: count >= limit ? 0 : limit - count,
      reset: Date.now() + ttlMs,
    }
  } catch (error) {
    console.error('Upstash rate limit fetch error:', error)
    return null
  }
}

/**
 * Enforce the application submission rate limit.
 *
 * @param identifier Typically the requester IP address
 * @param limit Maximum attempts within the window (default 3)
 * @param windowSeconds Window length in seconds (default 24 hours)
 */
export async function enforceApplicationRateLimit(
  identifier: string | null,
  limit: number = FALLBACK_LIMIT,
  windowSeconds: number = FALLBACK_WINDOW_SECONDS
): Promise<RateLimitResult> {
  const key = identifier ? `app_rl:${identifier}` : 'app_rl:unknown'

  const upstashResult = await upstashRateLimit(key, limit, windowSeconds)
  if (upstashResult) {
    return upstashResult
  }

  return getMemoryBucket(key, limit, windowSeconds)
}

/**
 * Reset the in-memory fallback buckets. Intended for automated tests.
 */
export function resetApplicationRateLimitMemory() {
  memoryBuckets.clear()
}
