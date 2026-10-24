import mongoose from 'mongoose';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

for (const envFile of ['.env.local', '.env']) {
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

const approvedMappings = new Map<string, string>([
  [
    'https://ridercomplex.com/axiom-streamliner-dlx/',
    '/delivery-gear/axiom-streamliner-dlx-review-is-this-rack-worth-it-for-delivery-riders',
  ],
  [
    'https://ridercomplex.com/rockbros-rear-bike-rack/',
    '/delivery-gear/rockbros-rear-bike-rack-review-is-it-worth-it-for-delivery-riders',
  ],
  [
    'https://ridercomplex.com/topeak-mtx-beamrack/',
    '/delivery-gear/topeak-mtx-beamrack-review-is-this-seatpost-rack-worth-it-for-delivery-riders',
  ],
  [
    'https://ridercomplex.com/best-bike-cargo-racks-of-2026-for-delivery-riders/',
    '/delivery-gear/best-bike-cargo-racks-of-2026-for-delivery-riders-what-actually-holds-up',
  ],
  [
    'https://ridercomplex.com/ibera-pakrak-touring-carrier-plus/',
    '/delivery-gear/ibera-pakrak-touring-carrier-plus-review-is-it-worth-it-for-delivery-riders',
  ],
  [
    '/safety-gear/best-motorcycle-gloves-for-delivery-riders-2026',
    '/safety-gear/best-mens-motorcycle-gloves-for-uber-eats-doordash-riders-2026',
  ],
  [
    '/safety-gear/best-motorcycle-rain-suit-under-80-budget-gig-riders',
    '/safety-gear/best-motorcycle-rain-suit-under-80-for-gig-delivery-riders-2026',
  ],
  [
    '/safety-gear/best-motorcycle-hand-guards-delivery-riders-2026',
    '/safety-gear/best-motorcycle-hand-guards-for-delivery-riders-2026-wind-rain-and-impact-protection',
  ],
  [
    '/safety-gear/best-motorcycle-rain-suit-for-delivery-riders-2026',
    '/safety-gear/best-motorcycle-rain-suit-for-delivery-riders-2026-stay-dry-stay-earning',
  ],
  [
    '/tech-lighting/best-motorcycle-helmet-camera-delivery-riders-2026',
    '/tech-lighting/best-motorcycle-helmet-camera-for-delivery-riders-2026-road-evidence-on-every-shift',
  ],
  [
    '/safety-gear/best-e-bike-helmet-delivery-riders-2026',
    '/safety-gear/best-e-bike-helmet-for-delivery-riders-2026-what-you-actually-need-and-why',
  ],
  [
    '/tech-lighting/best-wireless-power-bank-delivery-riders-2026',
    '/tech-lighting/best-wireless-power-bank-for-delivery-riders-2026-keep-your-phone-alive-all-shift',
  ],
  [
    '/tech-lighting/best-motorcycle-phone-mount-delivery-riders-2026',
    '/tech-lighting/best-motorcycle-phone-mount-for-delivery-riders-2026-vibration-proof-and-one-hand-operated',
  ],
  [
    '/safety-gear/waterproof-motorcycle-gear-delivery-riders-full-setup',
    '/safety-gear/waterproof-motorcycle-gear-for-delivery-riders-2026-the-full-setup-guide',
  ],
]);

const expectedNewLinkCounts = new Map<string, number>([
  ['/safety-gear/best-motorcycle-gloves-for-delivery-riders-2026', 2],
  ['/safety-gear/best-motorcycle-rain-suit-under-80-budget-gig-riders', 1],
  ['/safety-gear/best-motorcycle-hand-guards-delivery-riders-2026', 1],
  ['/safety-gear/best-motorcycle-rain-suit-for-delivery-riders-2026', 1],
  ['/tech-lighting/best-motorcycle-helmet-camera-delivery-riders-2026', 1],
  ['/safety-gear/best-e-bike-helmet-delivery-riders-2026', 3],
  ['/tech-lighting/best-wireless-power-bank-delivery-riders-2026', 2],
  ['/tech-lighting/best-motorcycle-phone-mount-delivery-riders-2026', 1],
  ['/safety-gear/waterproof-motorcycle-gear-delivery-riders-full-setup', 1],
]);

interface PostRecord {
  _id: mongoose.Types.ObjectId;
  slug: string;
  title?: string;
  category?: string;
  status?: string;
  content: string;
}

interface LinkChange {
  before: string;
  after: string;
}

function replaceApprovedAnchorHrefs(content: string) {
  const changes: LinkChange[] = [];
  const updatedContent = content.replace(
    /(<a\b[^>]*\bhref\s*=\s*)(["'])(.*?)\2/gi,
    (anchorStart, attribute: string, quote: string, href: string) => {
      const directReplacement = approvedMappings.get(href);
      let replacement = directReplacement;
      if (!replacement) {
        try {
          const parsed = new URL(href, 'https://ridercomplex.invalid');
          const targetPath = approvedMappings.get(parsed.pathname);
          if (targetPath) {
            replacement = href.startsWith('/')
              ? `${targetPath}${parsed.search}${parsed.hash}`
              : `${parsed.origin}${targetPath}${parsed.search}${parsed.hash}`;
          }
        } catch {
          return anchorStart;
        }
      }
      if (!replacement) return anchorStart;

      changes.push({
        before: `${attribute}${quote}${href}${quote}`,
        after: `${attribute}${quote}${replacement}${quote}`,
      });
      return `${attribute}${quote}${replacement}${quote}`;
    }
  );
  return { updatedContent, changes };
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function printDiff(slug: string, changes: LinkChange[]) {
  console.log(`\n--- ${slug} (${changes.length} approved link change${changes.length === 1 ? '' : 's'})`);
  for (const change of changes) {
    console.log(`- ${change.before}`);
    console.log(`+ ${change.after}`);
  }
}

async function main() {
  const apply = process.argv.includes('--apply');
  const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--apply');
  if (unknownArgs.length > 0) {
    throw new Error(`Unexpected argument(s): ${unknownArgs.join(', ')}`);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  await mongoose.connect(uri, { readPreference: 'secondaryPreferred' });

  try {
    const posts = await mongoose.connection
      .collection<PostRecord>('posts')
      .find({ status: 'published', content: { $type: 'string' } })
      .project({ _id: 1, slug: 1, title: 1, category: 1, status: 1, content: 1 })
      .toArray();

    const affected = posts.flatMap((post) => {
      const { updatedContent, changes } = replaceApprovedAnchorHrefs(post.content || '');
      return changes.length > 0 ? [{ post, updatedContent, changes }] : [];
    });
    const actualCount = affected.reduce((count, entry) => count + entry.changes.length, 0);
    const newLinkChanges = new Map<string, number>();
    for (const { changes } of affected) {
      for (const change of changes) {
        let pathname: string;
        try {
          const href = change.before.match(/(["'])(.*?)\1$/)?.[2] || '';
          pathname = new URL(href, 'https://ridercomplex.invalid').pathname;
        } catch {
          continue;
        }
        if (expectedNewLinkCounts.has(pathname)) {
          newLinkChanges.set(pathname, (newLinkChanges.get(pathname) || 0) + 1);
        }
      }
    }
    const invalidCounts = [...expectedNewLinkCounts].filter(
      ([pathname, count]) => newLinkChanges.get(pathname) !== count
    );
    if (invalidCounts.length > 0) {
      throw new Error(
        `Expected approved anchor counts did not match: ${invalidCounts
          .map(([pathname, count]) => `${pathname}: expected ${count}, found ${newLinkChanges.get(pathname) || 0}`)
          .join('; ')}. Refusing to continue.`
      );
    }

    const targetSlugs = [...expectedNewLinkCounts.keys()].map((pathname) =>
      approvedMappings.get(pathname)!.split('/').pop()!
    );
    const publishedTargets = await mongoose.connection
      .collection<PostRecord>('posts')
      .find({ slug: { $in: targetSlugs }, status: 'published' })
      .project({ slug: 1, title: 1, status: 1 })
      .toArray();
    const publishedSlugs = new Set(publishedTargets.map((post) => post.slug));
    const missingTargets = targetSlugs.filter((slug) => !publishedSlugs.has(slug));
    if (missingTargets.length > 0) {
      throw new Error(`Target posts are missing or unpublished: ${missingTargets.join(', ')}`);
    }
    for (const target of publishedTargets) {
      console.log(`VERIFIED published target: ${target.slug} — ${target.title || '(untitled)'}`);
    }

    const backupPath = resolve(`backup-approved-link-fix-${timestamp()}.json`);
    writeFileSync(
      backupPath,
      `${JSON.stringify(
        affected.map(({ post }) => ({
          id: String(post._id),
          slug: post.slug,
          title: post.title,
          category: post.category,
          status: post.status,
          content: post.content,
        })),
        null,
        2
      )}\n`,
      'utf8'
    );
    console.log(`Backed up full content for ${affected.length} affected published posts to ${backupPath}`);

    for (const entry of affected) printDiff(entry.post.slug, entry.changes);

    if (!apply) {
      console.log(`\nDry run only: ${actualCount} anchor href(s) would change. No database content was written.`);
      console.log('Review this diff, then explicitly rerun with --apply to write the changes.');
      return;
    }

    for (const { post, updatedContent, changes } of affected) {
      const result = await mongoose.connection.collection<PostRecord>('posts').updateOne(
        { _id: post._id, content: post.content, status: 'published' },
        { $set: { content: updatedContent } }
      );
      if (result.matchedCount !== 1 || result.modifiedCount !== 1) {
        throw new Error(`Concurrent change detected; stopped before updating remaining posts. Post slug: ${post.slug}`);
      }
      for (const change of changes) {
        console.log(`APPLIED ${post.slug}: ${change.before} -> ${change.after}`);
      }
    }

    console.log(`Applied ${actualCount} exact anchor href change(s) across ${affected.length} published posts.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Approved internal-link fix failed:', error);
  process.exitCode = 1;
});
