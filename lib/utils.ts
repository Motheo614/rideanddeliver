import { formatDistanceToNow, parseISO } from 'date-fns';

const CLOUDINARY_UPLOAD_URL = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/i;
const CLOUDINARY_TRANSFORMATION = /^(?:a_|ar_|b_|bo_|c_|dpr_|e_|f_|fl_|g_|h_|l_|o_|q_|r_|t_|u_|w_|x_|y_|z_)/i;

export function getCloudinaryImageUrl(imageUrl: string): string {
  const match = imageUrl.match(CLOUDINARY_UPLOAD_URL);
  if (!match) return imageUrl;

  const [, uploadPath, imagePath] = match;
  const [firstSegment, ...remainingSegments] = imagePath.split('/');
  const transformations = ['f_auto', 'q_auto'];
  const alreadyHasTransformation = CLOUDINARY_TRANSFORMATION.test(firstSegment || '');
  const optimizedSegment = alreadyHasTransformation
    ? [...new Set([...firstSegment.split(','), ...transformations])].join(',')
    : transformations.join(',');
  const optimizedPath = alreadyHasTransformation
    ? [optimizedSegment, ...remainingSegments].join('/')
    : [optimizedSegment, firstSegment, ...remainingSegments].filter(Boolean).join('/');

  return `${uploadPath}${optimizedPath}`;
}

export function isCloudinaryImageUrl(imageUrl: string): boolean {
  return CLOUDINARY_UPLOAD_URL.test(imageUrl);
}

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
