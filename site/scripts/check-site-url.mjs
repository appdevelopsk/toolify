import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
/** Fail early if an SEO build would publish example/preview host canonicals. */
export function validateSiteUrl(value) {
  if (!value || typeof value !== 'string') throw new Error('NEXT_PUBLIC_SITE_URL is required for production builds');
  let url;
  try { url = new URL(value); } catch { throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute URL'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be a bare HTTPS origin');
  }
  if (url.hostname !== 'toolify365.com' && url.hostname !== 'www.toolify365.com') {
    throw new Error('NEXT_PUBLIC_SITE_URL must use the verified Toolify365 canonical host');
  }
  return url.origin;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    console.log(`Canonical origin: ${validateSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)}`);
  } catch (error) {
    console.error(`[site-url] ${error.message}`);
    process.exitCode = 1;
  }
}
