import mongoose from 'mongoose';
import { Notification, User } from '../lib/db/models';
import connectDB from '../lib/db/mongoose';

async function seedNotifications() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      console.log('Run: npm run create-admin');
      process.exit(1);
    }

    console.log(`📧 Found admin user: ${adminUser.email}`);

    // Delete existing notifications for this user
    await Notification.deleteMany({ userId: adminUser._id });
    console.log('🗑️  Cleared existing notifications');

    // Sample notifications
    const sampleNotifications = [
      {
        userId: adminUser._id,
        type: 'post',
        title: 'New Post Published',
        message: 'Your post "Ultimate Guide to Bike Delivery Safety" has been published successfully.',
        link: '/admin/posts',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        userId: adminUser._id,
        type: 'analytics',
        title: 'Traffic Milestone Reached',
        message: 'Congratulations! Your site has reached 10,000 monthly visitors.',
        link: '/admin/analytics',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        userId: adminUser._id,
        type: 'product',
        title: 'Product Click Milestone',
        message: 'Giro Syntax MIPS Helmet has received 100 clicks this month!',
        link: '/admin/affiliate-links',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        userId: adminUser._id,
        type: 'comment',
        title: '3 New Comments',
        message: 'You have 3 new comments waiting for moderation on your recent posts.',
        link: '/admin/posts',
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        readAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // Read 3 hours ago
      },
      {
        userId: adminUser._id,
        type: 'system',
        title: 'Database Backup Complete',
        message: 'Your weekly database backup has been completed successfully.',
        link: '/admin/settings',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        readAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
      {
        userId: adminUser._id,
        type: 'user',
        title: 'New User Registration',
        message: 'A new user has registered on your site.',
        link: '/admin/users',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        readAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
      },
      {
        userId: adminUser._id,
        type: 'analytics',
        title: 'Weekly Report Available',
        message: 'Your weekly analytics report is now available for review.',
        link: '/admin/analytics',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        readAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: adminUser._id,
        type: 'post',
        title: 'Draft Saved',
        message: 'Your draft "Essential Gear for Night Delivery" has been auto-saved.',
        link: '/admin/posts',
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: adminUser._id,
        type: 'product',
        title: 'New Product Added',
        message: 'You successfully added "LED Bike Light Set" to your affiliate products.',
        link: '/admin/affiliate-links',
        isRead: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        readAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        userId: adminUser._id,
        type: 'system',
        title: 'Security Update Available',
        message: 'A new security update is available for your admin panel.',
        link: '/admin/settings',
        isRead: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        readAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
    ];

    // Create notifications
    const createdNotifications = await Notification.insertMany(sampleNotifications);
    
    console.log(`\n✅ Successfully created ${createdNotifications.length} notifications`);
    
    // Count unread
    const unreadCount = createdNotifications.filter(n => !n.isRead).length;
    console.log(`📬 Unread: ${unreadCount}`);
    console.log(`📭 Read: ${createdNotifications.length - unreadCount}`);

    console.log('\n📊 Notifications by type:');
    const typeCount = createdNotifications.reduce((acc: any, notif: any) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {});
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n🎉 Notification seeding completed successfully!');
    console.log('\n💡 View notifications at: http://localhost:3002/admin');
    console.log('   Click the bell icon in the top-right corner');

  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the seeding
seedNotifications();
