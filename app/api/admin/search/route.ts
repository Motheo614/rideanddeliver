import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/mongoose';
import { Post, Product, User } from '@/lib/db/models';

/**
 * GET /api/admin/search
 * Admin-only search across posts, products, and users
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    // Return empty results if no query
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        posts: [],
        products: [],
        users: [],
        total: 0,
      });
    }

    const searchRegex = new RegExp(query, 'i');

    // Search Posts (title, excerpt, category)
    const postsPromise = Post.find({
      $or: [
        { title: searchRegex },
        { excerpt: searchRegex },
        { category: searchRegex },
        { categoryLabel: searchRegex },
      ],
    })
      .select('title slug status category categoryLabel featuredImage views createdAt')
      .limit(5)
      .sort({ createdAt: -1 })
      .lean();

    // Search Products (name, category, ASIN)
    const productsPromise = Product.find({
      $or: [
        { productName: searchRegex },
        { category: searchRegex },
        { asin: searchRegex },
      ],
    })
      .select('productName asin category productImage clickCount isActive price')
      .limit(5)
      .sort({ clickCount: -1 })
      .lean();

    // Search Users (name, email)
    const usersPromise = User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
      ],
    })
      .select('name email role createdAt lastLogin')
      .limit(5)
      .sort({ createdAt: -1 })
      .lean();

    // Execute all searches in parallel
    const [posts, products, users] = await Promise.all([
      postsPromise,
      productsPromise,
      usersPromise,
    ]);

    const total = posts.length + products.length + users.length;

    return NextResponse.json({
      posts,
      products,
      users,
      total,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Error executing admin search:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
