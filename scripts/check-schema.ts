import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const FORBIDDEN_KEYS = new Set([
  'offers',
  'price',
  'lowprice',
  'highprice',
  'pricevaliduntil',
  'aggregaterating',
  'ratingcount',
  'reviewcount',
]);
const ISO_DATE_WITH_TIMEZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const CURRENCY_AMOUNT = /[$€£]\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/;

type JsonObject = Record<string, unknown>;

function hasValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasValue);
  return value !== null && typeof value === 'object';
}

function getTypes(value: JsonObject): string[] {
  const rawTypes = value['@type'];
  return (Array.isArray(rawTypes) ? rawTypes : [rawTypes])
    .filter((type): type is string => typeof type === 'string');
}

function getJsonLdBlocks(value: unknown): JsonObject[] {
  const roots = Array.isArray(value) ? value : [value];
  return roots.flatMap((root) => {
    if (!root || typeof root !== 'object' || Array.isArray(root)) return [];
    const graph = (root as JsonObject)['@graph'];
    if (Array.isArray(graph)) {
      return graph.filter((item): item is JsonObject => Boolean(item && typeof item === 'object' && !Array.isArray(item)));
    }
    return [root as JsonObject];
  });
}

function walkJson(value: unknown, visit: (object: JsonObject) => void): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item) => walkJson(item, visit));
    return;
  }

  const object = value as JsonObject;
  visit(object);
  Object.values(object).forEach((child) => walkJson(child, visit));
}

function isIsoDateWithTimezone(value: unknown): value is string {
  return typeof value === 'string'
    && ISO_DATE_WITH_TIMEZONE.test(value)
    && Number.isFinite(Date.parse(value));
}

function getVisibleLastUpdatedLabels(html: string): string[] {
  const visibleHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  return Array.from(visibleHtml.matchAll(/Last updated:\s*([^<]*)/gi), (match) => (
    decodeHtmlEntities(match[1]).trim()
  ));
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, '\'');
}

function getProductCardRegions(html: string): string[] {
  const tagPattern = /<(\/?)(div|section|article|table)\b([^>]*)>/gi;
  const stack: Array<{ tag: string; start: number; marked: boolean }> = [];
  const regions: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html)) !== null) {
    const [, closing, tag, attributes] = match;
    if (closing) {
      let stackIndex = stack.length - 1;
      while (stackIndex >= 0 && stack[stackIndex].tag !== tag.toLowerCase()) stackIndex -= 1;
      if (stackIndex < 0) continue;

      const [element] = stack.splice(stackIndex, 1);
      if (element.marked) {
        regions.push(html.slice(element.start, tagPattern.lastIndex));
      }
      continue;
    }

    const className = attributes.match(/\bclass\s*=\s*(["'])(.*?)\1/i)?.[2] || '';
    const marked = tag.toLowerCase() === 'table'
      || /\bdata-(?:product-card|comparison-table)\b/i.test(attributes)
      || /(?:product-card|affiliate-product-card|comparison-table)/i.test(className);
    if (!/\/\s*>$/.test(match[0])) {
      stack.push({ tag: tag.toLowerCase(), start: match.index, marked });
    } else if (marked) {
      regions.push(match[0]);
    }
  }

  return regions;
}

function getVisibleText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
  );
}

export function checkSchemaHtml(html: string): string[] {
  const errors: string[] = [];
  const blocks: JsonObject[] = [];
  const scriptPattern = /<script\b(?=[^>]*\btype\s*=\s*(["'])application\/ld\+json\1)[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch: RegExpExecArray | null;
  let scriptCount = 0;

  while ((scriptMatch = scriptPattern.exec(html)) !== null) {
    scriptCount += 1;
    try {
      blocks.push(...getJsonLdBlocks(JSON.parse(scriptMatch[2].trim())));
    } catch (error) {
      errors.push(`JSON-LD block ${scriptCount} does not parse: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (scriptCount === 0) errors.push('No JSON-LD blocks found.');

  const typeCounts = new Map<string, number>();
  for (const block of blocks) {
    for (const type of getTypes(block)) {
      const count = (typeCounts.get(type) || 0) + 1;
      typeCounts.set(type, count);
      if (count === 2) errors.push(`More than one JSON-LD block has @type "${type}".`);
    }

    walkJson(block, (object) => {
      for (const key of Object.keys(object)) {
        if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
          errors.push(`Forbidden structured-data key "${key}" found.`);
        }
      }
    });
  }

  const typedObjects: JsonObject[] = [];
  blocks.forEach((block) => walkJson(block, (object) => typedObjects.push(object)));
  const products = typedObjects.filter((object) => getTypes(object).includes('Product'));
  for (const product of products) {
    if (!hasValue(product.name)) errors.push('Product is missing name.');
    if (!hasValue(product.image)) errors.push('Product is missing image.');
    if (!hasValue(product.review)) {
      errors.push('Product is missing review.');
      continue;
    }

    const productRatings: JsonObject[] = [];
    walkJson(product.review, (object) => {
      if (getTypes(object).includes('Rating')) productRatings.push(object);
    });
    if (productRatings.length === 0) {
      errors.push('Product review is missing a Rating.');
    }
    for (const rating of productRatings) {
      if (typeof rating.ratingValue !== 'number' || rating.ratingValue < 1 || rating.ratingValue > 5) {
        errors.push('Product ratingValue must be between 1 and 5.');
      }
    }
  }

  const blogPostings = blocks.filter((block) => getTypes(block).includes('BlogPosting'));
  if (blogPostings.length === 0) errors.push('No BlogPosting block found.');
  for (const blogPosting of blogPostings) {
    for (const key of ['headline', 'image', 'author', 'publisher']) {
      if (!hasValue(blogPosting[key])) errors.push(`BlogPosting is missing ${key}.`);
    }

    const published = blogPosting.datePublished;
    const modified = blogPosting.dateModified;
    if (!isIsoDateWithTimezone(published)) errors.push('BlogPosting datePublished must be ISO 8601 with a timezone.');
    if (!isIsoDateWithTimezone(modified)) errors.push('BlogPosting dateModified must be ISO 8601 with a timezone.');
    const publishedTimestamp = typeof published === 'string' ? Date.parse(published) : NaN;
    const modifiedTimestamp = typeof modified === 'string' ? Date.parse(modified) : NaN;
    if (Number.isFinite(publishedTimestamp)
      && Number.isFinite(modifiedTimestamp)
      && modifiedTimestamp < publishedTimestamp) {
      errors.push('BlogPosting dateModified is earlier than datePublished.');
    }
  }

  const labels = getVisibleLastUpdatedLabels(html);
  for (const label of labels) {
    const expectedDates = blogPostings
      .filter((posting) => isIsoDateWithTimezone(posting.dateModified))
      .map((posting) => Date.parse(posting.dateModified as string));

    if (blogPostings.some((posting) => (
      isIsoDateWithTimezone(posting.datePublished)
      && isIsoDateWithTimezone(posting.dateModified)
      && Date.parse(posting.datePublished) === Date.parse(posting.dateModified)
    ))) {
      errors.push('A Last updated label is present when dateModified equals datePublished.');
      continue;
    }

    const matchingDate = expectedDates.some((timestamp) => (
      new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        .format(new Date(timestamp)) === label
    ));
    if (!matchingDate) errors.push(`Visible Last updated date "${label}" differs from dateModified.`);
  }

  for (const region of getProductCardRegions(html)) {
    if (CURRENCY_AMOUNT.test(getVisibleText(region))) {
      errors.push('Visible currency amount found inside a product card or comparison table.');
    }
  }

  return errors;
}

function getPathname(input: string): string {
  try {
    return new URL(input, 'http://localhost:3000').pathname;
  } catch {
    throw new Error(`Invalid page URL: ${input}`);
  }
}

async function readBuiltHtml(pathname: string): Promise<string | null> {
  const appDirectory = path.resolve('.next/server/app');
  const segments = decodeURIComponent(pathname).split('/').filter(Boolean);
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error(`Invalid page path: ${pathname}`);
  }

  const pagePath = path.resolve(appDirectory, ...segments);
  const candidates = pathname.endsWith('/')
    ? [path.join(pagePath, 'index.html')]
    : [`${pagePath}.html`, path.join(pagePath, 'index.html')];

  for (const candidate of candidates) {
    if (!candidate.startsWith(`${appDirectory}${path.sep}`)) continue;
    try {
      return await readFile(candidate, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  return null;
}

async function fetchHtml(pathname: string, baseUrl: string): Promise<string> {
  const response = await fetch(new URL(pathname, baseUrl), { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${response.url}`);
  return response.text();
}

async function loadPageHtml(input: string, baseUrl?: string): Promise<string> {
  const url = new URL(input, 'http://localhost:3000');
  if (baseUrl) return fetchHtml(`${url.pathname}${url.search}`, baseUrl);

  const builtHtml = await readBuiltHtml(url.pathname);
  if (builtHtml !== null) return builtHtml;

  try {
    return await fetchHtml(`${url.pathname}${url.search}`, 'http://localhost:3000');
  } catch (error) {
    throw new Error(
      `No built HTML found for ${url.pathname}, and localhost:3000 was unavailable: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function parseArguments(args: string[]): { urls: string[]; baseUrl?: string } {
  const urls: string[] = [];
  let baseUrl: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--base-url') {
      baseUrl = args[index + 1];
      if (!baseUrl) throw new Error('--base-url requires a URL.');
      index += 1;
    } else if (argument.startsWith('--base-url=')) {
      baseUrl = argument.slice('--base-url='.length);
    } else {
      urls.push(argument);
    }
  }

  if (urls.length === 0) {
    throw new Error('Usage: npm run check:schema -- <post-url> [<post-url> ...] [--base-url http://localhost:3000]');
  }
  return { urls, baseUrl };
}

async function main(): Promise<void> {
  const { urls, baseUrl } = parseArguments(process.argv.slice(2));
  const results: Array<{ url: string; errors: string[] }> = [];

  for (const url of urls) {
    try {
      const html = await loadPageHtml(url, baseUrl);
      results.push({ url, errors: checkSchemaHtml(html) });
    } catch (error) {
      results.push({ url, errors: [error instanceof Error ? error.message : String(error)] });
    }
  }

  console.log('| Page | Result | Findings |');
  console.log('|---|---|---|');
  for (const result of results) {
    console.log(`| ${result.url} | ${result.errors.length === 0 ? 'PASS' : 'FAIL'} | ${result.errors.length} |`);
  }
  for (const result of results) {
    for (const error of result.errors) {
      console.error(`${result.url}: ${error}`);
    }
  }

  if (results.some((result) => result.errors.length > 0)) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
