interface ArticleHeaderEnvironment {
  flag?: string;
  vercelEnv?: string;
  nodeEnv?: string;
}

export function isTextLedArticleHeaderEnabled({
  flag = process.env.ARTICLE_TEXT_LED_HEADER_ENABLED,
  vercelEnv = process.env.VERCEL_ENV,
  nodeEnv = process.env.NODE_ENV,
}: ArticleHeaderEnvironment = {}) {
  const isProduction = vercelEnv === 'production' || (!vercelEnv && nodeEnv === 'production');
  if (isProduction) return false;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return vercelEnv === 'preview' || nodeEnv !== 'production';
}
