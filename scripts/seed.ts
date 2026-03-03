import mongoose from 'mongoose';
import Post from '../lib/db/models/Post';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://motheoeesemang:3hWJldC4AAddouY9@cluster1.sgegg2e.mongodb.net/?appName=Cluster1';

const samplePosts = [
  {
    title: 'Best Dash Cams in 2026',
    slug: 'best-dash-cams-in-2026',
    excerpt: 'Protect yourself on the road with these top-rated dash cams for delivery riders. Compare features, prices, and real-world performance.',
    content: `# Best Dash Cams for Delivery Riders in 2026

As a delivery rider, having a reliable dash cam is essential for protecting yourself in case of accidents or disputes. Here are the top picks for 2026.

## Why You Need a Dash Cam

A dash cam provides crucial evidence in accidents, helps with insurance claims, and can even lower your insurance premiums.

## Top 5 Dash Cams

### 1. Viofo A229 Pro
The Viofo A229 Pro offers excellent 4K front and 2K rear recording with superior night vision. Perfect for delivery riders working late shifts.

### 2. Nextbase 622GW
Premium features including Alexa integration and emergency SOS alerts make this a top choice for professional riders.

### 3. REDTIGER F7NP
Budget-friendly option with solid 4K recording and parking mode. Great value for money.

### 4. Garmin Dash Cam 67W
Compact design with voice control and driver alerts. Ideal for bikes and scooters.

### 5. BlackVue DR970X-2CH Plus
Cloud connectivity and 4K resolution make this perfect for fleet management.

## Key Features to Look For

- **Night Vision**: Essential for evening deliveries
- **Parking Mode**: Protects your vehicle when parked
- **GPS**: Records location and speed data
- **Wide Angle**: Captures more of the road
- **Build Quality**: Weather-resistant for all conditions`,
    featuredImage: {
      url: 'https://picsum.photos/1920/1080',
      alt: 'Dash cam mounted on delivery bike'
    },
    category: 'tech-lighting',
    categoryLabel: 'Tech & Lighting',
    tags: ['dash cams', 'safety', 'technology', 'equipment'],
    status: 'published',
    publishedAt: new Date('2026-02-20'),
    views: 245,
    readTime: 8,
    featured: true,
    trending: true,
    editorsPick: true,
    amazonProducts: [
      {
        productTitle: 'Viofo A229 Pro Dual Dash Cam',
        asin: 'B0SAMPLE1',
        affiliateLink: 'https://amazon.com/dp/B0SAMPLE1',
        price: '£199.99',
        image: 'https://picsum.photos/400/400',
        description: '4K Front + 2K Rear, Night Vision, GPS'
      }
    ]
  },
  {
    title: 'Top 10 Motorcycle Helmets for Delivery Riders',
    slug: 'top-motorcycle-helmets-delivery-riders',
    excerpt: 'Stay safe on the road with our comprehensive guide to the best motorcycle helmets for food and parcel delivery in 2026.',
    content: `# Top 10 Motorcycle Helmets for Delivery Riders

Safety comes first when you're on the road all day. Here's our definitive guide to the best helmets for delivery riders.

## What Makes a Good Delivery Helmet?

- Comfort for long shifts
- Good ventilation
- Pinlock visor for all weather
- Bluetooth compatibility
- ECE/DOT certified

## Our Top Picks

### 1. Shoei NXR2
Premium comfort and safety with excellent aerodynamics.

### 2. HJC i71
Great value with built-in sun visor and Bluetooth ready.

### 3. AGV K6
Sporty design with excellent visibility and ventilation.

Safety is non-negotiable. Invest in a quality helmet.`,
    featuredImage: {
      url: 'https://picsum.photos/1920/1080',
      alt: 'Motorcycle helmet for delivery riders'
    },
    category: 'safety-gear',
    categoryLabel: 'Safety Gear',
    tags: ['helmets', 'safety', 'motorcycle gear', 'protection'],
    status: 'published',
    publishedAt: new Date('2026-02-18'),
    views: 189,
    readTime: 10,
    featured: true,
    trending: true,
    editorsPick: false
  },
  {
    title: 'Best Bike Locks to Prevent Theft in 2026',
    slug: 'best-bike-locks-prevent-theft-2026',
    excerpt: 'Secure your delivery bike with these top-rated locks. We test and review the strongest locks on the market.',
    content: `# Best Bike Locks to Prevent Theft in 2026

Bike theft is a major concern for delivery riders. Protect your investment with these robust security solutions.

## Types of Locks

### D-Locks (U-Locks)
The most secure option, resistant to bolt cutters and saws.

### Chain Locks
Flexible and strong, ideal for securing to odd-shaped objects.

### Folding Locks
Compact and versatile, great for urban environments.

## Top Recommendations

### Kryptonite New York Fahgettaboudit
The gold standard in bike security. Virtually unbreakable.

### ABUS Granit XPlus 540
German engineering at its finest. Sold Secure Diamond rated.

### Hiplok Gold
Wearable chain lock that's both practical and secure.

## Security Tips

1. Always lock your frame and wheels
2. Use two different types of locks
3. Lock in well-lit, busy areas
4. Register your bike frame number

Don't become a statistic. Invest in proper security.`,
    featuredImage: {
      url: 'https://picsum.photos/1920/1080',
      alt: 'Bike lock securing delivery bicycle'
    },
    category: 'bike-security',
    categoryLabel: 'Bike Security',
    tags: ['locks', 'security', 'theft prevention', 'bike safety'],
    status: 'published',
    publishedAt: new Date('2026-02-15'),
    views: 312,
    readTime: 7,
    featured: false,
    trending: true,
    editorsPick: true
  },
  {
    title: 'Uber Eats vs Deliveroo vs Just Eat: Which Pays Best in 2026?',
    slug: 'uber-eats-deliveroo-just-eat-comparison-2026',
    excerpt: 'Comprehensive comparison of the top delivery platforms. Find out which app offers the best pay, flexibility, and working conditions.',
    content: `# Platform Comparison: Uber Eats vs Deliveroo vs Just Eat 2026

Choosing the right platform can significantly impact your earnings. Here's our detailed breakdown.

## Earnings Comparison

### Uber Eats
- Base pay: £4-6 per delivery
- Peak bonuses up to 1.8x
- Tips: Good, integrated into app
- Avg hourly: £12-15

### Deliveroo
- Base pay: £4.50-7 per delivery
- Boosts during busy times
- Tips: Lower than Uber
- Avg hourly: £11-14

### Just Eat
- Shift-based or self-employed
- More consistent earnings
- Less peak pay variability
- Avg hourly: £10-12

## Flexibility

Uber Eats wins for flexibility - login anytime, work anywhere.

## Best Strategy

Multi-app! Run 2-3 apps simultaneously to maximize earnings during quiet periods.

## Insurance & Support

All platforms now require valid insurance. Deliveroo has best rider support.

## The Verdict

- **Best Pay**: Uber Eats (during peaks)
- **Most Consistent**: Just Eat
- **Best App**: Uber Eats
- **Best Support**: Deliveroo

Your earnings will vary by area. Test all three in your first month.`,
    featuredImage: {
      url: 'https://picsum.photos/1920/1080',
      alt: 'Food delivery apps comparison'
    },
    category: 'platform-reviews',
    categoryLabel: 'Platform Reviews',
    tags: ['uber eats', 'deliveroo', 'just eat', 'earnings', 'comparison'],
    status: 'published',
    publishedAt: new Date('2026-02-10'),
    views: 567,
    readTime: 12,
    featured: true,
    trending: true,
    editorsPick: true
  },
  {
    title: 'Essential Delivery Bag Guide: Insulated vs Non-Insulated',
    slug: 'delivery-bag-guide-insulated-vs-non-insulated',
    excerpt: 'Choose the right delivery bag for your needs. We compare popular options and share tips for keeping food hot and fresh.',
    content: `# Delivery Bag Guide: Choosing the Right Bag for Your Deliveries

Your delivery bag is one of your most important tools. Here's how to choose the right one.

## Insulated Bags

Essential for food delivery. Keeps meals hot for 30-45 minutes.

### Top Picks:
- **Deliveroo Official Bag**: Free when you sign up, decent quality
- **Uber Eats Backpack**: Excellent insulation, waterproof
- **Lifewit Insulated Backpack**: Budget option, good value

## Non-Insulated Bags

Better for parcel delivery or mixed deliveries.

### Good Options:
- **Amazon Basics Backpack**: Large capacity, durable
- **Carradice City Folder**: Pannier-style, great for bikes

## What to Look For

1. **Size**: Must fit large pizza boxes
2. **Waterproofing**: Essential for UK weather
3. **Reflective strips**: Improves visibility
4. **Comfort**: Padded straps for long shifts
5. **Easy clean**: Wipe-clean interior

## Pro Tips

- Use cardboard dividers to prevent spills
- Keep spare bags for odor rotation
- Add extra insulation in winter
- Use carabiner clips for drinks

Invest in quality - your bag works as hard as you do.`,
    featuredImage: {
      url: 'https://picsum.photos/1920/1080',
      alt: 'Delivery rider with insulated backpack'
    },
    category: 'delivery-gear',
    categoryLabel: 'Delivery Gear',
    tags: ['delivery bags', 'equipment', 'insulated bags', 'backpacks'],
    status: 'published',
    publishedAt: new Date('2026-02-05'),
    views: 156,
    readTime: 6,
    featured: false,
    trending: false,
    editorsPick: false
  },
  {
    title: 'Waterproof Gear for Delivery Riders: Stay Dry in Any Weather',
    slug: 'waterproof-gear-delivery-riders-guide',
    excerpt: 'Don\'t let rain stop your earnings. Our guide to the best waterproof jackets, trousers, and gloves for delivery work.',
    content: `# Ultimate Waterproof Gear Guide for Delivery Riders

Working in the rain doesn't have to be miserable. Here's how to stay dry and comfortable.

## Waterproof Jackets

### Top Picks:
- **Alpinestars Andes V3**: Fully waterproof, breathable, armor included
- **Oxford Rainseal**: Budget option, fully waterproof
- **Rev'It Nitric 3**: Premium choice, excellent in heavy rain

## Waterproof Trousers

- **Alpinestars Hurricane Rain Pants**: Quick to put on over regular gear
- **Oxford Rainseal Overtrousers**: Affordable and effective

## Gloves

Waterproof gloves are essential:
- **Alpinestars WR-3 Gore-Tex**: Warm and totally waterproof
- **Oxford Montreal**: Budget waterproof option

## Boot Covers

Keep your feet dry with overshoes or waterproof boots.

## Layering System

1. Base layer: Moisture-wicking
2. Mid layer: Insulation
3. Outer layer: Waterproof shell

Stay dry, stay safe, keep earning.`,
    featuredImage: {
      url: 'https://picsum.photos/1920/1080',
      alt: 'Delivery rider in rain gear'
    },
    category: 'safety-gear',
    categoryLabel: 'Safety Gear',
    tags: ['waterproof', 'rain gear', 'jacket', 'clothing'],
    status: 'published',
    publishedAt: new Date('2026-01-28'),
    views: 203,
    readTime: 8,
    featured: false,
    trending: false,
    editorsPick: true
  }
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing posts
    await Post.deleteMany({});
    console.log('🗑️  Cleared existing posts');

    // Insert sample posts
    const createdPosts = await Post.insertMany(samplePosts);
    console.log(`✅ Created ${createdPosts.length} sample posts`);

    // Display created posts
    console.log('\n📝 Created posts:');
    createdPosts.forEach(post => {
      console.log(`   - ${post.title} (/${post.slug})`);
    });

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n🔍 You can now visit:');
    console.log('   http://localhost:3002/');
    console.log('   http://localhost:3002/blog/best-dash-cams-in-2026');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

seed();
