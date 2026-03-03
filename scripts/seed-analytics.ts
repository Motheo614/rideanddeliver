import connectDB from '../lib/db/mongoose';
import Analytics from '../lib/db/models/Analytics';
import Post from '../lib/db/models/Post';
import Product from '../lib/db/models/Product';

/**
 * Seed sample analytics data for testing
 * Creates analytics entries for the last 90 days
 */
async function seedAnalytics() {
  try {
    console.log('🌱 Starting analytics data seeding...\n');

    await connectDB();

    // Get all published posts and active products
    const posts = await Post.find({ status: 'published' }).lean();
    const products = await Product.find({ isActive: true }).lean();

    console.log(`Found ${posts.length} posts and ${products.length} products\n`);

    if (posts.length === 0) {
      console.log('⚠️  No published posts found. Please run the main seed script first.');
      process.exit(0);
    }

    // Clear existing analytics data
    await Analytics.deleteMany({});
    console.log('🗑️  Cleared existing analytics data\n');

    // Generate data for last 90 days
    const daysToGenerate = 90;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analyticsData = [];

    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate random but realistic numbers
      // More recent days have slightly higher traffic
      const recentnessFactor = 1 + ((daysToGenerate - i) / daysToGenerate) * 0.5;
      const baseViews = Math.floor((Math.random() * 500 + 300) * recentnessFactor);
      const baseVisitors = Math.floor(baseViews * (0.6 + Math.random() * 0.2)); // 60-80% of views

      // Select random top posts (3-5 per day)
      const numTopPosts = Math.floor(Math.random() * 3) + 3;
      const shuffledPosts = [...posts].sort(() => Math.random() - 0.5);
      const topPosts = shuffledPosts.slice(0, numTopPosts).map(post => ({
        slug: post.slug,
        title: post.title,
        views: Math.floor(Math.random() * 100 + 20),
      }));

      // Select random top products (2-4 per day)
      const numTopProducts = Math.floor(Math.random() * 3) + 2;
      const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
      const topProducts = shuffledProducts.slice(0, numTopProducts).map(product => ({
        asin: product.asin,
        productName: product.productName,
        clicks: Math.floor(Math.random() * 50 + 10),
      }));

      // Generate some search queries
      const searchQueries = [
        { query: 'delivery rider gear', count: Math.floor(Math.random() * 20 + 5) },
        { query: 'bike helmet', count: Math.floor(Math.random() * 15 + 3) },
        { query: 'waterproof jacket', count: Math.floor(Math.random() * 12 + 2) },
        { query: 'bike lights', count: Math.floor(Math.random() * 10 + 2) },
        { query: 'thermal gloves', count: Math.floor(Math.random() * 8 + 1) },
      ];

      analyticsData.push({
        date,
        pageViews: baseViews,
        uniqueVisitors: baseVisitors,
        topPosts,
        topProducts,
        searchQueries,
      });
    }

    // Bulk insert all analytics data
    await Analytics.insertMany(analyticsData);

    console.log(`✅ Successfully seeded ${analyticsData.length} days of analytics data`);
    console.log(`📊 Date range: ${analyticsData[0].date.toISOString().split('T')[0]} to ${analyticsData[analyticsData.length - 1].date.toISOString().split('T')[0]}`);
    console.log(`📈 Total page views: ${analyticsData.reduce((sum, d) => sum + d.pageViews, 0).toLocaleString()}`);
    console.log(`👥 Total unique visitors: ${analyticsData.reduce((sum, d) => sum + d.uniqueVisitors, 0).toLocaleString()}`);
    console.log('\n🎉 Analytics seeding completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding analytics data:', error);
    process.exit(1);
  }
}

seedAnalytics();
