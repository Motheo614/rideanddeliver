/**
 * lib/dates.ts
 *
 * Single source of truth for editorial date logic.
 * Used by the article page (JSON-LD dateModified + visible label),
 * the sitemap (<lastmod>) and OG modifiedTime so all four always agree.
 *
 * Rule:
 *   dateModified = contentUpdatedAt  only when contentUpdatedAt is more than
 *                                    24 hours after publishedAt.
 *   Otherwise dateModified = datePublished (unedited post).
 *
 *   showUpdatedLabel = dateModified !== datePublished
 *     (i.e. only show "Last updated" when there is a real editorial edit)
 */

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export interface EditorialDates {
  /** Full ISO-8601 string. Always set. */
  datePublished: string;
  /**
   * Full ISO-8601 string. Equals datePublished for unedited posts.
   * Equals contentUpdatedAt only when it is >24 h after publishedAt.
   */
  dateModified: string;
  /** True when dateModified differs from datePublished (i.e. a real edit exists). */
  showUpdatedLabel: boolean;
}

function toIso(value: Date | string | undefined | null): string | null {
  if (!value) return null;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function getEditorialDates(
  publishedAt: Date | string | undefined | null,
  contentUpdatedAt: Date | string | undefined | null
): EditorialDates {
  const datePublished = toIso(publishedAt) ?? '1970-01-01T00:00:00.000Z';

  const updatedIso = toIso(contentUpdatedAt);
  const isRealEdit =
    updatedIso !== null &&
    new Date(updatedIso).getTime() - new Date(datePublished).getTime() > TWENTY_FOUR_HOURS_MS;

  const dateModified = isRealEdit ? updatedIso! : datePublished;

  return { datePublished, dateModified, showUpdatedLabel: dateModified !== datePublished };
}
