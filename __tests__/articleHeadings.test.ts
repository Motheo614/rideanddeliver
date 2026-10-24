import { describe, expect, it } from 'vitest';
import { addStableArticleHeadingIds } from '../lib/articleHeadings';

describe('addStableArticleHeadingIds', () => {
  it('adds stable anchors and a plain-text heading list', () => {
    const result = addStableArticleHeadingIds(
      '<h2>Rack &amp; Fit</h2><h2><em>Installation</em> Guide</h2>'
    );

    expect(result.headings).toEqual([
      { id: 'section-rack-fit', title: 'Rack & Fit' },
      { id: 'section-installation-guide', title: 'Installation Guide' },
    ]);
    expect(result.content).toContain('<h2 id="section-rack-fit">Rack &amp; Fit</h2>');
    expect(result.content).toContain('<h2 id="section-installation-guide"><em>Installation</em> Guide</h2>');
  });

  it('uses deterministic suffixes for duplicate heading text and replaces old ids', () => {
    const result = addStableArticleHeadingIds(
      '<h2 id="old-id">Pros</h2><h2>Pros</h2>'
    );

    expect(result.headings.map(({ id }) => id)).toEqual([
      'section-pros',
      'section-pros-2',
    ]);
  });

  it('leaves blank headings out of the generated navigation', () => {
    const result = addStableArticleHeadingIds('<h2><br></h2><h3>Not included</h3>');

    expect(result.headings).toEqual([]);
    expect(result.content).toBe('<h2><br></h2><h3>Not included</h3>');
  });
});
