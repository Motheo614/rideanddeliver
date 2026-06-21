import mongoose from 'mongoose';
import Post from '../lib/db/models/Post';
import connectDB from '../lib/db/mongoose';

// No sample posts - all articles should be created through the admin panel
const samplePosts: any[] = [];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing posts
    const deletedCount = await Post.deleteMany({});
    console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing posts`);

    if (samplePosts.length > 0) {
      // Insert sample posts
      const createdPosts = await Post.insertMany(samplePosts);
      console.log(`✅ Created ${createdPosts.length} sample posts`);

      // Display created posts
      console.log('\n📝 Created posts:');
      createdPosts.forEach(post => {
        console.log(`   - ${post.title} (/${post.slug})`);
      });
    } else {
      console.log('ℹ️  No sample posts to create. Use the admin panel to create posts.');
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n🔍 Create posts at:');
    console.log('   https://ridercomplex.com/admin/posts');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

seed();
