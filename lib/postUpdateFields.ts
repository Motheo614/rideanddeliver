const CLIENT_UPDATABLE_POST_FIELDS = [
  'title',
  'slug',
  'excerpt',
  'content',
  'featuredImage',
  'category',
  'categoryLabel',
  'tags',
  'author',
  'amazonProducts',
  'seoMetadata',
  'status',
  'readTime',
  'featured',
  'trending',
  'editorsPick',
  'cta',
] as const;

export function getClientPostUpdates(body: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    CLIENT_UPDATABLE_POST_FIELDS
      .filter((field) => field in body)
      .map((field) => [field, body[field]])
  );
}
