import { site } from '@/content/site';

const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5_000;
let statusCache = null;
let cacheTimestamp = 0;
let refreshPromise = null;

function textFromTag(body, tag) {
  const match = body.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function looksLikePlaceholderPage(body) {
  const headline = `${textFromTag(body, 'title')} ${textFromTag(body, 'h1')}`.toLowerCase();
  if (
    /\b(?:403|404|500|502|503|504)\b|\bnot found\b|\bforbidden\b|\bserver error\b|\bservice unavailable\b|\bunder maintenance\b|\bmaintenance mode\b|\bcoming soon\b|\bdomain parked\b|\bindex of\s*\//.test(headline)
  ) {
    return true;
  }
  return [
    /<title>\s*index of\s*\//i,
    /error\s+404/i,
    /404\s+not\s+found/i,
    /service\s+unavailable/i,
    /temporarily\s+unavailable/i,
    /this\s+site\s+is\s+under\s+maintenance/i,
    /apache2\s+ubuntu\s+default\s+page/i,
    /welcome\s+to\s+nginx/i,
  ].some((pattern) => pattern.test(body.slice(0, 16_000)));
}

async function checkProject(project) {
  const fallback = project.status;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const response = await fetch(project.url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent': 'nateponds-portfolio-status-api/1.0',
      },
    });
    const body = await response.text();
    clearTimeout(timer);
    const contentType = response.headers.get('content-type') || '';
    const html = /text\/html/i.test(contentType) || /<!doctype\s+html|<html[\s>]|<head[\s>]|<body[\s>]/i.test(body);
    if (!response.ok || !html || looksLikePlaceholderPage(body)) return fallback === 'green' ? 'yellow' : fallback;
    return 'green';
  } catch {
    return fallback;
  }
}

async function refreshStatuses() {
  const entries = await Promise.all(
    site.projects.map(async (project) => [project.number, await checkProject(project)]),
  );
  statusCache = Object.fromEntries(entries);
  cacheTimestamp = Date.now();
  return statusCache;
}

export async function GET() {
  if (statusCache && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return Response.json(statusCache);
  }
  try {
    refreshPromise ||= refreshStatuses();
    return Response.json(await refreshPromise);
  } catch (error) {
    console.error('Failed to refresh project statuses:', error);
    return statusCache
      ? Response.json(statusCache)
      : Response.json(
          Object.fromEntries(site.projects.map((project) => [project.number, project.status])),
        );
  } finally {
    refreshPromise = null;
  }
}
