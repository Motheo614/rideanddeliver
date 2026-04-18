const UNICODE_DASH_REGEX = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g;

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeSlug(value: string): string {
  const decoded = safeDecode(value || '');

  return decoded
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/â€“|â€”/g, '-')
    .replace(UNICODE_DASH_REGEX, '-')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generateSlugFromTitle(title: string): string {
  return normalizeSlug(title || '');
}

export function getSlugLookupCandidates(input: string): string[] {
  const original = input || '';
  const decoded = safeDecode(original);
  const normalized = normalizeSlug(decoded);

  const candidates = [
    original,
    decoded,
    normalized,
    normalized.replace(/-/g, '–'),
    normalized.replace(/-/g, '—'),
  ];

  return Array.from(new Set(candidates.filter(Boolean)));
}
