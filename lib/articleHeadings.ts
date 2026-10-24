export interface ArticleHeading {
  id: string;
  title: string;
}

function getHeadingText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;|&#xA0;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

function slugifyHeading(title: string) {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function addStableArticleHeadingIds(html: string) {
  const usedIds = new Map<string, number>();
  const headings: ArticleHeading[] = [];
  const content = html.replace(
    /(<h2\b[^>]*)(>)([\s\S]*?)<\/h2>/gi,
    (headingHtml, attributes: string, closeTag: string, innerHtml: string) => {
      const title = getHeadingText(innerHtml);
      if (!title) return headingHtml;

      const baseId = `section-${slugifyHeading(title) || 'heading'}`;
      const occurrence = (usedIds.get(baseId) || 0) + 1;
      usedIds.set(baseId, occurrence);
      const id = occurrence === 1 ? baseId : `${baseId}-${occurrence}`;
      const cleanAttributes = attributes.replace(/\s+id=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

      headings.push({ id, title });
      return `${cleanAttributes} id="${id}"${closeTag}${innerHtml}</h2>`;
    }
  );

  return { content, headings };
}
