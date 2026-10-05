import { describe, expect, it } from 'vitest';
import { decideContentUpdate } from '../lib/contentUpdateDecision';

describe('decideContentUpdate', () => {
  it('stores the hash without bumping on the first save', () => {
    expect(decideContentUpdate({
      storedHash: undefined,
      newHash: 'new',
      minorEdit: false,
    })).toBe('store-only');
  });

  it('does nothing when the hash is unchanged', () => {
    expect(decideContentUpdate({
      storedHash: 'same',
      newHash: 'same',
      minorEdit: false,
    })).toBe('none');
  });

  it('bumps on a changed hash when not marked minor', () => {
    expect(decideContentUpdate({
      storedHash: 'old',
      newHash: 'new',
      minorEdit: false,
    })).toBe('bump');
  });

  it('stores a changed hash without bumping for a minor edit', () => {
    expect(decideContentUpdate({
      storedHash: 'old',
      newHash: 'new',
      minorEdit: true,
    })).toBe('store-only');
  });

  it('ignores a client-supplied content date', () => {
    const request = {
      storedHash: 'old',
      newHash: 'new',
      minorEdit: false,
      contentUpdatedAt: '2000-01-01T00:00:00Z',
    };

    expect(decideContentUpdate(request)).toBe('bump');
  });
});
