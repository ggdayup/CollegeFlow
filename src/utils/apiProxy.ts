/**
 * Next.js & Express Secure API Routes Gateway & Local Redis Caching Layer
 * 
 * Provides:
 * 1. Redis Caching Layer (using ioredis) with graceful In-Memory Fallback.
 * 2. Next.js Pages router API Gateway Handler (apiProxyHandler).
 * 3. Next.js App router GET/POST handlers.
 * 4. Express-compatible Middleware/Handler.
 * 5. Client-side SWR caching strategies via custom hooks and custom fetchers.
 */

import Redis from 'ioredis';
import useSWR, { SWRConfiguration } from 'swr';

// Redis connection URI.
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:36379';
const FASTAPI_SERVICE_URL = process.env.FASTAPI_SERVICE_URL || 'http://localhost:38080';
const GATEWAY_SECURE_TOKEN = process.env.GATEWAY_SECURE_TOKEN || 'secure-college-major-gateway-token';

// Simple In-memory cache fallback in case Redis is offline or not installed
class MemoryCache {
  private cache = new Map<string, { value: string; expiry: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }
}

// Instantiate Redis with lazy connection & failure handling
let redisClient: Redis | null = null;
let useMemoryFallback = false;
const fallbackCache = new MemoryCache();

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    lazyConnect: true,
  });

  redisClient.on('error', (err) => {
    console.warn('⚠️ Redis Connection Error. Falling back to In-Memory Cache layer.', err.message);
    useMemoryFallback = true;
  });

  redisClient.on('connect', () => {
    console.log('✅ Connected to local Redis instance successfully.');
    useMemoryFallback = false;
  });
} catch (e) {
  console.warn('⚠️ Failed to initialize Redis. Using In-Memory Cache fallback.', e);
  useMemoryFallback = true;
}

// ----------------------------------------------------
// Caching Helpers
// ----------------------------------------------------
export async function getCachedData(key: string): Promise<string | null> {
  if (useMemoryFallback || !redisClient) {
    return fallbackCache.get(key);
  }
  try {
    return await redisClient.get(key);
  } catch (err) {
    console.error('Redis get error:', err);
    return fallbackCache.get(key);
  }
}

export async function setCachedData(key: string, value: string, ttlSeconds = 300): Promise<void> {
  if (useMemoryFallback || !redisClient) {
    await fallbackCache.set(key, value, ttlSeconds);
    return;
  }
  try {
    await redisClient.set(key, value, 'EX', ttlSeconds);
  } catch (err) {
    console.error('Redis set error:', err);
    await fallbackCache.set(key, value, ttlSeconds);
  }
}

// ----------------------------------------------------
// Secure Server Proxy Logic
// ----------------------------------------------------
/**
 * Core function that proxies incoming request threads to FastAPI services,
 * protecting endpoints, stripping auth, injecting system headers, and caching.
 */
export async function handleProxyRequest(
  method: string,
  urlPath: string,
  bodyData?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: any; fromCache: boolean }> {
  // Generate cache key based on route path, method, and stringified body
  const cacheKey = `proxy:cache:${method}:${urlPath}:${bodyData ? JSON.stringify(bodyData) : ''}`;

  // Only GET requests should be cached in standard proxy strategies
  if (method.toUpperCase() === 'GET') {
    const cached = await getCachedData(cacheKey);
    if (cached) {
      try {
        return { status: 200, data: JSON.parse(cached), fromCache: true };
      } catch {
        return { status: 200, data: cached, fromCache: true };
      }
    }
  }

  // Construct target Python FastAPI microservice URL
  const targetUrl = `${FASTAPI_SERVICE_URL.replace(/\/$/, '')}/${urlPath.replace(/^\//, '')}`;

  // Build clean, secure forwarding headers
  const secureHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Gateway-Security': GATEWAY_SECURE_TOKEN,
    // Add additional backend secrets or tenant identifiers here to prevent live direct exposure
    'Authorization': `Bearer ${process.env.INTERNAL_FASTAPI_SECRET || 'internal_secret_token_abc123'}`,
  };

  // Pass along acceptable client headers
  if (headers['accept-language']) secureHeaders['accept-language'] = headers['accept-language'];
  if (headers['user-agent']) secureHeaders['user-agent'] = headers['user-agent'];

  try {
    const response = await fetch(targetUrl, {
      method: method.toUpperCase(),
      headers: secureHeaders,
      body: bodyData && method.toUpperCase() !== 'GET' ? JSON.stringify(bodyData) : undefined,
    });

    const contentType = response.headers.get('content-type') || '';
    let responseData: any;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (response.ok) {
      if (method.toUpperCase() === 'GET') {
        // Cache the successful response for 5 minutes (300 seconds)
        await setCachedData(cacheKey, JSON.stringify(responseData), 300);
      }
      return { status: response.status, data: responseData, fromCache: false };
    } else {
      return { status: response.status, data: responseData, fromCache: false };
    }
  } catch (error: any) {
    console.error('⚠️ Proxy Request Failed:', error.message);
    return {
      status: 502,
      data: { error: 'Bad Gateway. Failed to proxy request to FastAPI microservice.', details: error.message },
      fromCache: false,
    };
  }
}

// ----------------------------------------------------
// Next.js Pages Router API Handler
// ----------------------------------------------------
export async function apiProxyHandler(req: any, res: any) {
  const { method, url, body, headers } = req;
  const urlPath = url.replace(/^\/api\/proxy/, '') || '/';
  
  const result = await handleProxyRequest(method, urlPath, body, headers);
  
  res.setHeader('X-Cache-Status', result.fromCache ? 'HIT' : 'MISS');
  res.status(result.status).json(result.data);
}

// ----------------------------------------------------
// Next.js App Router API Handler Templates
// ----------------------------------------------------
export async function handleAppRouterProxy(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/proxy/, '') || '/';
  const method = request.method;
  
  let body: any = undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      body = await request.json();
    } catch {
      // Body empty or not JSON
    }
  }

  // Header extraction
  const headersObj: Record<string, string> = {};
  request.headers.forEach((val, key) => {
    headersObj[key] = val;
  });

  const result = await handleProxyRequest(method, path, body, headersObj);

  return new Response(JSON.stringify(result.data), {
    status: result.status,
    headers: {
      'Content-Type': 'application/json',
      'X-Cache-Status': result.fromCache ? 'HIT' : 'MISS',
    },
  });
}

// ----------------------------------------------------
// Express-compatible Middleware/Handler
// ----------------------------------------------------
export async function expressProxyMiddleware(req: any, res: any) {
  const method = req.method;
  const path = req.path || req.url;
  const body = req.body;
  const headers = req.headers;

  const result = await handleProxyRequest(method, path, body, headers);
  
  res.set('X-Cache-Status', result.fromCache ? 'HIT' : 'MISS');
  res.status(result.status).json(result.data);
}

// ----------------------------------------------------
// Client-side Custom SWR Hook & Fetcher
// ----------------------------------------------------
/**
 * Direct fetch client that channels through our secure proxy
 */
export async function apiProxyFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const proxyUrl = `/api/proxy/${endpoint.replace(/^\//, '')}`;
  
  const response = await fetch(proxyUrl, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown API error' }));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Custom React SWR hook for stale-while-revalidate client fetching
 */
export function useApiProxy<T>(endpoint: string, config?: SWRConfiguration) {
  return useSWR<T, Error>(
    endpoint ? `/api/proxy/${endpoint.replace(/^\//, '')}` : null,
    async (url: string) => {
      const path = url.replace(/^\/api\/proxy\//, '');
      return apiProxyFetch<T>(path);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000, // 5s deduping
      ...config,
    }
  );
}
