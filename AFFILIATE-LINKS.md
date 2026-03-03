# Affiliate Links Management Documentation

## Overview

The Affiliate Links Management page provides a comprehensive interface for managing affiliate products, tracking performance metrics, and monitoring revenue. This feature is designed specifically for affiliate marketers using the Rider Section platform.

## Features

### 📦 Product Management

#### Add New Products
- **Product Name**: Required field for the product display name
- **ASIN**: Amazon Standard Identification Number (required, unique)
- **Affiliate Link**: Your Amazon affiliate tracking link (required)
- **Category**: Organize products into categories:
  - Helmets
  - Lights
  - Locks
  - Bags
  - Tools
  - Clothing
  - Accessories
- **Price**: Optional display price (e.g., "$29.99")
- **Rating**: Product rating (0-5 stars)
- **Commission Rate**: Custom commission percentage (default: 3%)
- **Image URL**: Product image for visual display

#### Edit Products
- Update any product field
- Toggle active/inactive status
- Change commission rates
- Update affiliate links

#### Deactivate Products
- Soft delete (sets `isActive: false`)
- Products remain in database for historical tracking
- Can be reactivated anytime

### 📊 Performance Tracking

#### Summary Statistics
- **Total Products**: Count of all products in database
- **Active Products**: Number of currently active listings
- **Total Clicks**: Aggregate click count across all products
- **Estimated Earnings**: Calculated revenue based on clicks and commission rates

#### Product-Level Metrics
- **Click Count**: Number of times affiliate link was clicked
- **Estimated Earnings**: Revenue estimation per product
- **Commission Rate**: Percentage commission for each product
- **Last Click Date**: Timestamp of most recent click (future feature)

### 🔍 Search & Filter

#### Search Functionality
- Search by product name
- Search by ASIN
- Search by category
- Real-time filtering as you type

#### Category Filter
- Filter products by category dropdown
- "All Categories" option to view everything
- Combines with search for refined results

#### Status Toggle
- **Active Only** (default): Shows only active products
- **Showing All**: Includes inactive products
- Visual indicator (eye icon) for current state

### 💾 Data Export

#### CSV Export
- Export all filtered products to CSV
- Includes:
  - Product Name
  - ASIN
  - Category
  - Price
  - Click Count
  - Commission Rate
  - Estimated Earnings
  - Status (Active/Inactive)
  - Affiliate Link
  - Created Date

**File Format:**
```
Filename: affiliate-links-YYYY-MM-DD.csv
Title: Affiliate Links Report - MMM DD, YYYY
```

### 🎯 Quick Actions

#### Copy Affiliate Link
- One-click copy to clipboard
- Success notification displayed
- Icon button for easy access

#### Visual Product Display
- Product images in table
- Star ratings
- Category badges
- Status indicators

## API Integration

### Endpoints

#### GET /api/products
**Query Parameters:**
- `includeInactive` (boolean): Include inactive products (admin only)
- `category` (string): Filter by category
- `search` (string): Search term for products

**Response:**
```json
{
  "products": [
    {
      "_id": "...",
      "productName": "Delivery Rider Helmet",
      "asin": "B08XXXXXX",
      "affiliateLink": "https://amzn.to/...",
      "category": "helmets",
      "price": "$49.99",
      "imageUrl": "https://...",
      "rating": 4.5,
      "isActive": true,
      "clickCount": 156,
      "commissionRate": 3,
      "estimatedEarnings": 23.40,
      "createdAt": "2026-01-15T00:00:00.000Z",
      "updatedAt": "2026-03-03T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/products
**Authentication:** Admin only (NextAuth session)

**Request Body:**
```json
{
  "productName": "Product Name",
  "asin": "B08XXXXXX",
  "affiliateLink": "https://amzn.to/...",
  "category": "accessories",
  "price": "$29.99",
  "imageUrl": "https://...",
  "rating": 4.5,
  "commissionRate": 3
}
```

#### PUT /api/products/[id]
**Authentication:** Admin only

**Request Body:** Same as POST (all fields optional)

#### DELETE /api/products/[id]
**Authentication:** Admin only

Soft deletes product by setting `isActive: false`

## Database Schema

### Product Model Updates

New fields added for commission tracking:

```typescript
{
  // Existing fields...
  clickCount: Number,           // Track affiliate link clicks
  commissionRate: Number,       // Custom commission % (default: 3)
  estimatedEarnings: Number,    // Calculated earnings
  lastClickDate: Date,          // Last click timestamp
  isActive: Boolean,            // Active/inactive status
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Guide

### Adding Your First Product

1. **Navigate to Affiliate Links**
   - Go to: `http://localhost:3002/admin/affiliate-links`

2. **Click "Add Product"**
   - Button in top-right corner

3. **Fill Required Fields:**
   - Product Name: "Delivery Rider LED Bike Light"
   - ASIN: "B08ABC123" (auto-uppercased)
   - Affiliate Link: Your Amazon Associates link
   - Category: Select from dropdown

4. **Optional Fields:**
   - Price: "$24.99"
   - Rating: 4.5
   - Commission Rate: 3 (%)
   - Image URL: Product image link

5. **Submit**
   - Click "Add Product"
   - Success message appears
   - Product appears in table

### Tracking Performance

#### View Summary Stats
- Dashboard shows totals at top
- Updates automatically when products change

#### Monitor Individual Products
- Table displays click counts
- Estimated earnings calculated per product
- Formula: `clicks × average_order_value × commission_rate`

#### Track Trends
- Use date filters (future feature)
- Export data regularly
- Compare time periods

### Managing Products

#### Edit a Product
1. Click edit icon (pencil) in Actions column
2. Modal opens with current values
3. Modify any field
4. Click "Update Product"

#### Deactivate a Product
1. Click delete icon (trash) in Actions column
2. Confirmation modal appears
3. Click "Deactivate" to confirm
4. Product hidden from active view

#### Reactivate a Product
1. Toggle "Showing All" to see inactive products
2. Click edit icon on inactive product
3. Check "Active Product" checkbox
4. Click "Update Product"

### Searching & Filtering

#### Quick Search
```
Type in search box:
- "helmet" → finds all helmet products
- "B08" → finds products with matching ASIN
- "lights" → finds products in lights category
```

#### Category Filter
```
Select from dropdown:
- All Categories
- Helmets
- Lights
- Locks
- Bags
- Tools
- Clothing
- Accessories
```

#### Combined Filters
```
Example:
- Search: "delivery"
- Category: "clothing"
- Result: Delivery-related clothing items
```

### Exporting Data

#### CSV Export
1. **Apply Filters** (optional)
   - Search for specific products
   - Filter by category
   - Toggle inactive products

2. **Click "Export CSV"**
   - Button in top-right corner
   - Only exports filtered results

3. **File Downloads**
   - Opens in spreadsheet software
   - Filename includes date

4. **Use Cases:**
   - Monthly performance reports
   - Tax documentation
   - Partner sharing
   - Data analysis

## Security & Authentication

### Admin-Only Access
- All product management requires admin role
- NextAuth session validation
- Dual authentication check (database + session)

### API Security
- Session-based authentication
- CSRF protection via Next.js
- Input validation on all endpoints
- ASIN uniqueness enforced

### Authorization Flow
```
1. User accesses page
2. NextAuth checks session
3. Query database for user role
4. Verify admin status
5. Grant/deny access
```

## Performance Optimization

### Database Queries
- Indexed fields: `category`, `isActive`, `clickCount`
- Efficient sorting by click count
- Lean queries for better performance

### Frontend Optimization
- Client-side filtering (no API calls on search)
- Debounced state updates
- Conditional rendering
- Optimized re-renders

## Troubleshooting

### Issue: Products Not Loading
**Symptoms:** Empty table or loading state stuck

**Solutions:**
1. Check MongoDB connection
2. Verify admin session (try logging out/in)
3. Check browser console for errors
4. Ensure products exist in database

### Issue: Cannot Add Product
**Symptoms:** Error message when submitting form

**Solutions:**
1. Check required fields (name, ASIN, link, category)
2. Verify ASIN is unique
3. Ensure valid URL for affiliate link
4. Check admin permissions

### Issue: Export CSV Not Working
**Symptoms:** Button disabled or no download

**Solutions:**
1. Ensure products are loaded
2. Check if filters return results
3. Verify browser allows downloads
4. Clear filters and try again

### Issue: Search Not Finding Products
**Symptoms:** No results when searching

**Solutions:**
1. Check spelling
2. Try partial matches
3. Clear category filter
4. Toggle "Showing All" for inactive products

## Future Enhancements

Planned features for future releases:

1. **Advanced Analytics**
   - Click-through rate (CTR) tracking
   - Conversion rate monitoring
   - Revenue trends over time
   - Geographic click data

2. **Bulk Operations**
   - Import products from CSV
   - Bulk edit categories
   - Batch activate/deactivate
   - Mass commission updates

3. **API Integration**
   - Amazon Product Advertising API
   - Auto-fetch product details
   - Price updates
   - Availability status

4. **Performance Reports**
   - Weekly/monthly summaries
   - Email reports
   - PDF exports
   - Custom date ranges

5. **Link Management**
   - Short link generator
   - Link expiration tracking
   - A/B testing support
   - UTM parameter builder

6. **Revenue Tracking**
   - Actual earnings sync
   - Payment history
   - Tax reporting
   - Commission variations

## Best Practices

### Product Organization
- Use consistent naming conventions
- Keep categories organized
- Update prices regularly
- Add high-quality images

### Link Management
- Use Amazon Associates SiteStripe
- Test links before adding
- Monitor for broken links
- Update affiliate IDs as needed

### Performance Monitoring
- Review metrics weekly
- Export data monthly
- Track top performers
- Optimize low performers

### Commission Optimization
- Research category rates
- Negotiate better rates
- Track seasonal variations
- Monitor Amazon program changes

## Support Resources

### Related Files
- `/app/(admin)/admin/affiliate-links/page.tsx` - Main page component
- `/app/api/products/route.ts` - Products list/create API
- `/app/api/products/[id]/route.ts` - Product update/delete API
- `/lib/db/models/Product.ts` - Product database schema

### Documentation
- [Analytics Documentation](./ANALYTICS.md)
- [User Management](./SECURITY.md)
- [API Routes Guide](./README.md)

### External Resources
- [Amazon Associates](https://affiliate-program.amazon.com/)
- [Product Advertising API](https://webservices.amazon.com/paapi5/documentation/)
- [SiteStripe Guide](https://affiliate-program.amazon.com/help/topic/t405)

---

**Version**: 1.0.0  
**Last Updated**: March 3, 2026  
**Maintainer**: Rider Section Development Team
