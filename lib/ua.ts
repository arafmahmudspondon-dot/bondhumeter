/**
 * Lightweight user-agent parsing — no external dependency.
 */

export interface UAResult {
  browser: string;
  os: string;
  device: string; // "Mobile" | "Tablet" | "Desktop"
}

export function parseUA(ua: string): UAResult {
  const s = ua || "";
  let browser = "Unknown Browser";

  // Order matters: Edge / Opera / Samsung contain "Chrome" etc.
  if (/edg\//i.test(s)) browser = "Microsoft Edge";
  else if (/opr\/|opera/i.test(s)) browser = "Opera";
  else if (/samsungbrowser/i.test(s)) browser = "Samsung Internet";
  else if (/firefox\//i.test(s)) browser = "Firefox";
  else if (/chrome|crios\//i.test(s)) browser = "Google Chrome";
  else if (/safari\//i.test(s)) browser = "Safari";
  else if (/bot|crawler|spider|curl|wget|postman/i.test(s)) browser = "Bot / Tool";

  let os = "Unknown OS";
  if (/windows nt/i.test(s)) os = "Windows";
  else if (/android/i.test(s)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(s)) os = "iOS";
  else if (/mac os x|macintosh/i.test(s)) os = "macOS";
  else if (/cros/i.test(s)) os = "ChromeOS";
  else if (/linux/i.test(s)) os = "Linux";

  let device = "Desktop";
  if (/ipad|tablet|playbook|silk|kindle/i.test(s)) device = "Tablet";
  else if (/mobi|iphone|ipod|android.*mobile|phone/i.test(s)) device = "Mobile";

  return { browser, os, device };
}
