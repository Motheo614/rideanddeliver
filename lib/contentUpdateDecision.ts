export type ContentUpdateDecision = 'store-only' | 'bump' | 'none';

export function decideContentUpdate({
  storedHash,
  newHash,
  minorEdit,
}: {
  storedHash: string | undefined;
  newHash: string;
  minorEdit: boolean;
}): ContentUpdateDecision {
  if (storedHash === newHash) return 'none';
  if (!storedHash || minorEdit) return 'store-only';
  return 'bump';
}
