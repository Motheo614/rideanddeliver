/**
 * Script to create an admin user
 * Run: npm run create-admin
 */

import connectDB from '../lib/db/mongoose';
import User from '../lib/db/models/User';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdminUser() {
  try {
    console.log('🚀 Creating Admin User\n');

    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Get user input
    const email = await question('Enter admin email: ');
    const name = await question('Enter admin name: ');
    const password = await question('Enter admin password (min 8 chars): ');

    // Validate input
    if (!email || !name || !password) {
      console.error('❌ All fields are required');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('❌ User with this email already exists');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      role: 'admin',
      twoFactorEnabled: false,
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🔑 Role: ${user.role}`);
    console.log('\n🎉 You can now login with these credentials\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdminUser();
