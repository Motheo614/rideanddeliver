import { formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(dateString: string) {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}

export function formatDateAbsolute(dateString: string) {
  const date = parseISO(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getAbsoluteUrl(path: string) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
}

export function stripHeadMetadataTags(html: string) {
  if (!html) return '';

  return html
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*\brel\s*=\s*(["'])?canonical\1[^>]*>/gi, '');
}

