import { formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(dateString: string) {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}

export function getAbsoluteUrl(path: string) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
}

