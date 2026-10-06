import { describe, expect, it } from 'vitest';
import { getClientPostUpdates } from '../lib/postUpdateFields';

describe('getClientPostUpdates', () => {
  it('ignores a client-supplied publishedAt', () => {
    const clientDate = '2000-01-01T00:00:00.000Z';
    const updates = getClientPostUpdates({
      title: 'Updated title',
      status: 'published',
      publishedAt: clientDate,
    });

    expect(updates).toEqual({
      title: 'Updated title',
      status: 'published',
    });
    expect(updates).not.toHaveProperty('publishedAt');
  });
});
