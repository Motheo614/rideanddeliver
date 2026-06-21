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

  const stripCanonicalLinkTags = (input: string) =>
    input.replace(/<link\b[^>]*>/gi, (tag) => {
      const relMatch = tag.match(/\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const relValue = (relMatch?.[1] || relMatch?.[2] || relMatch?.[3] || '').toLowerCase();
      const relTokens = relValue.split(/\s+/).filter(Boolean);

      return relTokens.includes('canonical') ? '' : tag;
    });

  return stripCanonicalLinkTags(html)
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '');
}

