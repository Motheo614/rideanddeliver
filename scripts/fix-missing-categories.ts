/**
 * Script to fix posts with missing categories
 * Run with: npx tsx scripts/fix-missing-categories.ts
 */

import connectDB from '../lib/db/mongoose';
import Post from '../lib/db/models/Post';

async function fixMissingCategories() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find all posts without a category or with invalid category
    const postsWithoutCategory = await Post.find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: '' },
        { category: { $nin: ['safety-gear', 'tech-lighting', 'bike-security', 'delivery-gear', 'platform-reviews'] } }
      ]
    });

    console.log(`Found ${postsWithoutCategory.length} posts with missing or invalid categories`);

    if (postsWithoutCategory.length === 0) {
      console.log('All posts have valid categories!');
      process.exit(0);
    }

    // Set default category to 'safety-gear' for posts missing category
    for (const post of postsWithoutCategory) {
      console.log(`Fixing post: ${post.title}`);
      console.log(`  Current category: ${post.category}`);
      
      // Try to guess category from title or default to safety-gear
      let newCategory: 'safety-gear' | 'tech-lighting' | 'bike-security' | 'delivery-gear' | 'platform-reviews' = 'safety-gear';
      const title = post.title.toLowerCase();
      
      if (title.includes('lock') || title.includes('security') || title.includes('theft')) {
        newCategory = 'bike-security';
      } else if (title.includes('light') || title.includes('camera') || title.includes('tech')) {
        newCategory = 'tech-lighting';
      } else if (title.includes('bag') || title.includes('equipment') || title.includes('delivery')) {
        newCategory = 'delivery-gear';
      } else if (title.includes('uber') || title.includes('deliveroo') || title.includes('platform')) {
        newCategory = 'platform-reviews';
      }
      
      post.category = newCategory;
      await post.save();
      console.log(`  ✓ Set category to: ${newCategory}`);
    }

    console.log('\n✅ All posts updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing categories:', error);
    process.exit(1);
  }
}

fixMissingCategories();
