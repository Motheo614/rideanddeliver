/**
 * Backfills missing product brands with "Generic".
 *
 * Usage:
 *   Dry run (default): npx tsx scripts/backfill-brands.ts
 *   Apply:             npx tsx scripts/backfill-brands.ts --apply
 */

import fs from 'node:fs';
import mongoose from 'mongoose';
import path from 'node:path';

const DRY_RUN = !process.argv.includes('--apply');
const MISSING_BRAND_FILTER = {
  $or: [
    { brand: null },
    { brand: { $regex: /^\s*$/ } },
  ],
};

function loadLocalEnv() {
  if (process.env.MONGODB_URI) return;

  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadLocalEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  try {
    await mongoose.connect(uri);
    const products = mongoose.connection.collection('products');
    const count = await products.countDocuments(MISSING_BRAND_FILTER);

    console.log(`Found ${count} products with an empty brand. DRY_RUN=${DRY_RUN}`);
    if (DRY_RUN) {
      console.log('No changes made. Run with --apply to set their brand to "Generic".');
      return;
    }

    const result = await products.updateMany(
      MISSING_BRAND_FILTER,
      { $set: { brand: 'Generic' } }
    );
    console.log(`Updated ${result.modifiedCount} of ${count} products.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Brand backfill failed:', error);
  process.exitCode = 1;
});
