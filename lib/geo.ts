/**
 * IP geolocation via free services (no API key required).
 * Results are cached in-memory per IP to respect rate limits.
 */

export interface GeoResult {
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  isp: string | null;
}

const cache = new Map<string, GeoResult>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cacheTimes = new Map<string, number>();

function isPrivateIp(ip: string) {
  if (!ip) return true;
  if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("::ffff:127.")) return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.16.")) return true;
  if (ip.startsWith("172.17.") || ip.startsWith("172.18.") || ip.startsWith("172.19.")) return true;
  if (ip.startsWith("172.2") || ip.startsWith("172.30.") || ip.startsWith("172.31.")) return true;
  if (ip.startsWith("169.254.") || ip.startsWith("fc00:") || ip.startsWith("fd")) return true;
  return false;
}

/** Extract the client IP from proxy headers. */
export function extractIp(headers: Headers) {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-vercel-forwarded-for") ||
    ""
  );
}

async function fetchFromIpwhois(ip: string): Promise<GeoResult | null> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.success === false) return null;
    return {
      city: data.city || null,
      region: data.region || null,
      country: data.country || null,
      latitude: typeof data.latitude === "number" ? data.latitude : null,
      longitude: typeof data.longitude === "number" ? data.longitude : null,
      isp: data.connection?.isp || data.connection?.org || null,
    };
  } catch {
    return null;
  }
}

async function fetchFromIpApi(ip: string): Promise<GeoResult | null> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,lat,lon,isp,org`,
      { signal: controller.signal }
    );
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.status !== "success") return null;
    return {
      city: data.city || null,
      region: data.regionName || null,
      country: data.country || null,
      latitude: typeof data.lat === "number" ? data.lat : null,
      longitude: typeof data.lon === "number" ? data.lon : null,
      isp: data.isp || data.org || null,
    };
  } catch {
    return null;
  }
}

/**
 * Look up geo info for an IP. Private/loopback IPs return a "Local" marker.
 * Never throws — returns nulls on failure so tracking is resilient.
 */
export async function geoLookup(ip: string): Promise<GeoResult> {
  if (!ip || isPrivateIp(ip)) {
    return {
      city: "Local",
      region: null,
      country: null,
      latitude: null,
      longitude: null,
      isp: "Local Network",
    };
  }

  const hit = cache.get(ip);
  const time = cacheTimes.get(ip);
  if (hit && time && Date.now() - time < CACHE_TTL) return hit;

  let result = await fetchFromIpwhois(ip);
  if (!result) result = await fetchFromIpApi(ip);
  if (!result) {
    return {
      city: null,
      region: null,
      country: null,
      latitude: null,
      longitude: null,
      isp: null,
    };
  }

  cache.set(ip, result);
  cacheTimes.set(ip, Date.now());
  return result;
}
