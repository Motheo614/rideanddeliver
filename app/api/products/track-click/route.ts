import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Product from '@/lib/db/models/Product';
import Analytics from '@/lib/db/models/Analytics';

/**
 * POST /api/products/track-click
 * Track affiliate product click before redirect
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { asin } = body;

    if (!asin) {
      return NextResponse.json(
        { error: 'ASIN is required' },
        { status: 400 }
      );
    }

    // Find product by ASIN
    const product = await Product.findOne({ asin: asin.toUpperCase() });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product is not active' },
        { status: 403 }
      );
    }

    // Increment product click count
    product.clickCount = (product.clickCount || 0) + 1;
    await product.save();

    // Update analytics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await Analytics.findOne({ date: today });

    if (!analytics) {
      // Create new analytics document for today
      analytics = new Analytics({
        date: today,
        pageViews: 0,
        uniqueVisitors: 0,
        topProducts: [],
      });
    }

    // Update or add product to topProducts array
    const productIndex = analytics.topProducts.findIndex(
      (p: { asin: string; productName: string; clicks: number }) => p.asin === product.asin
    );

    if (productIndex > -1) {
      // Update existing product click count
      analytics.topProducts[productIndex].clicks += 1;
    } else {
      // Add new product to array
      analytics.topProducts.push({
        asin: product.asin,
        productName: product.productName,
        clicks: 1,
      });
    }

    // Sort top products by clicks (descending) and keep top 10
    analytics.topProducts.sort((a: { asin: string; productName: string; clicks: number }, b: { asin: string; productName: string; clicks: number }) => b.clicks - a.clicks);
    analytics.topProducts = analytics.topProducts.slice(0, 10);

    await analytics.save();

    // Return success with affiliate link for redirect
    return NextResponse.json({
      success: true,
      affiliateLink: product.affiliateLink,
      productName: product.productName,
    });
  } catch (error) {
    console.error('Error tracking product click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
