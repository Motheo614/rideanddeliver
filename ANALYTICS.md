# Analytics Feature Documentation

## Overview

The Analytics dashboard provides comprehensive insights into your site's performance, including page views, visitor statistics, top performing content, and product engagement metrics.

## Features

### 📊 Real-Time Data Tracking

- **Page Views**: Total number of page views across all content
- **Unique Visitors**: Number of unique visitors tracked
- **Published Posts**: Count of total published posts with monthly additions
- **Active Products**: Number of active affiliate products

### 📅 Date Range Filtering

The analytics dashboard supports flexible date range selection:

#### Preset Ranges
- **Today**: Current day's statistics
- **Last 7 days**: Weekly performance overview
- **Last 30 days**: Monthly insights (default)
- **Last 90 days**: Quarterly analysis

#### Custom Range
- Select any custom date range using the date picker
- Maximum range: From site inception to current day
- Dates displayed in a user-friendly calendar interface

### 📈 Visual Analytics

#### Interactive Charts
- **Line Charts**: Compare page views vs. unique visitors over time
- **Sparklines**: Quick trend indicators on stat cards
- **Progress Bars**: Visual representation of top products by click-through rate

#### Data Visualization
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)
- Color-coded metrics (green for positive, red for negative trends)

### 🎯 Top Performance Metrics

#### Top Posts
- Lists highest-performing blog posts by view count
- Shows exact view numbers
- Ranked by performance (#1, #2, etc.)

#### Top Products
- Displays most clicked affiliate products
- Visual progress bars showing relative performance
- Click counts for each product

### 💾 Data Export

#### CSV Export
- Export analytics data to CSV format
- Includes all pageview and visitor data for selected date range
- Filename includes export date for easy organization
- Custom report title with date range

**Export Fields:**
- Date
- Page Views
- Unique Visitors

## API Endpoints

### Overview Endpoint
```
GET /api/analytics/overview
```

**Query Parameters:**
- `from` (string, ISO date): Start date for analytics range
- `to` (string, ISO date): End date for analytics range
- `days` (number): Number of days to look back (alternative to from/to)

**Response:**
```json
{
  "overview": {
    "totalPageViews": 42892,
    "totalUniqueVisitors": 28401,
    "postsPublishedThisMonth": 5,
    "draftPostsCount": 3,
    "totalPublishedPosts": 48,
    "totalActiveProducts": 156
  },
  "topPosts": [...],
  "topProducts": [...],
  "dateRange": {
    "from": "2026-02-01T00:00:00.000Z",
    "to": "2026-03-03T23:59:59.999Z"
  }
}
```

### Pageviews Endpoint
```
GET /api/analytics/pageviews
```

**Query Parameters:** Same as overview endpoint

**Response:**
```json
{
  "data": [
    {
      "date": "2026-02-01",
      "views": 1234,
      "visitors": 856
    },
    ...
  ],
  "total": 42892,
  "dateRange": {
    "from": "2026-02-01T00:00:00.000Z",
    "to": "2026-03-03T23:59:59.999Z"
  }
}
```

### Tracking Endpoint
```
POST /api/analytics/track
```

**Request Body:**
```json
{
  "type": "pageview",
  "slug": "bike-delivery-rider-gear"
}
```

**Types:**
- `pageview`: Track page views for blog posts
- `search`: Track search queries

## Database Schema

### Analytics Model
```typescript
{
  date: Date,              // Date of analytics record (unique)
  pageViews: Number,       // Total page views for the day
  uniqueVisitors: Number,  // Unique visitors for the day
  topPosts: [{
    slug: String,
    title: String,
    views: Number
  }],
  topProducts: [{
    asin: String,
    productName: String,
    clicks: Number
  }],
  searchQueries: [{
    query: String,
    count: Number
  }]
}
```

## Setup Instructions

### 1. Install Dependencies

All required packages are already installed:
- `react-datepicker`: Date range selection
- `export-to-csv`: CSV export functionality
- `recharts`: Chart visualization
- `date-fns`: Date formatting

### 2. Seed Sample Data

To populate the analytics dashboard with sample data for testing:

```bash
npm run seed-analytics
```

This will:
- Generate 90 days of sample analytics data
- Create realistic page view and visitor numbers
- Populate top posts and products
- Add sample search queries

### 3. Access the Dashboard

Navigate to: `http://localhost:3002/admin/analytics`

**Requirements:**
- Must be logged in as an admin user
- Database connection must be active

## Usage Examples

### Viewing Weekly Performance
1. Click on the date range selector (default: "Last 30 days")
2. Select "Last 7 days" from the dropdown
3. Dashboard automatically refreshes with weekly data

### Exporting Data
1. Select desired date range
2. Wait for data to load
3. Click "Export CSV" button
4. CSV file downloads automatically with timestamp

### Custom Date Range
1. Click date range selector
2. Select "Custom Range..." from dropdown
3. Pick start date in calendar
4. Pick end date in calendar
5. Click "Apply" to load data

## Security

### Authentication
- All analytics endpoints require admin authentication
- Session validation via NextAuth
- Dual authentication check (database + session)

### Authorization
- Only users with `role: 'admin'` can access analytics
- API endpoints return 401 for unauthorized requests
- No sensitive data exposed in responses

## Performance Optimization

### Data Caching
- Analytics data is aggregated by day
- Reduced database queries through date-based indexing
- Efficient date range queries using MongoDB operators

### Frontend Optimization
- Debounced data fetching on date changes
- Progressive loading states
- Responsive chart rendering
- Efficient re-renders with React.memo potential

## Troubleshooting

### No Data Showing
**Problem**: Analytics dashboard shows "No data available"

**Solutions:**
1. Run seed script: `npm run seed-analytics`
2. Check if posts are published (`status: 'published'`)
3. Verify MongoDB connection is active
4. Check console for API errors

### Authentication Errors
**Problem**: "Unauthorized" error when accessing analytics

**Solutions:**
1. Ensure you're logged in as admin
2. Check session is active (try refreshing)
3. Verify user role in database: `db.users.find({ email: "your@email.com" })`
4. Run `npm run create-admin` to create an admin user

### Date Range Issues
**Problem**: Custom date range not loading data

**Solutions:**
1. Ensure end date is after start date
2. Check that date range contains analytics data
3. Maximum range is from site inception to today
4. Try using preset ranges first to verify data exists

## Future Enhancements

Potential improvements for the analytics system:

1. **Real-time Updates**: WebSocket integration for live data
2. **Comparison Periods**: Compare current period with previous period
3. **Traffic Sources**: Track referrer information and sources
4. **Bounce Rate**: Calculate and display bounce rate metrics
5. **Session Duration**: Track average session time
6. **Geographic Data**: Show visitor locations on map
7. **Device Analytics**: Track desktop vs mobile traffic
8. **Conversion Tracking**: Monitor affiliate conversion rates
9. **Goal Tracking**: Set and track custom goals
10. **Email Reports**: Scheduled analytics reports via email

## Additional Resources

### Packages Used
- [React DatePicker](https://reactdatepicker.com/) - Date selection UI
- [Recharts](https://recharts.org/) - Chart library
- [Export to CSV](https://www.npmjs.com/package/export-to-csv) - CSV export utility
- [date-fns](https://date-fns.org/) - Date manipulation

### Related Files
- `/app/(admin)/admin/analytics/page.tsx` - Main analytics page
- `/components/admin/AnalyticsChart.tsx` - Chart component
- `/components/admin/StatCard.tsx` - Stat card component
- `/app/api/analytics/*` - API routes
- `/lib/db/models/Analytics.ts` - Database model
- `/scripts/seed-analytics.ts` - Data seeding script

## Phase 1: GA4, Search Console, and Affiliate Clicks

The dashboard uses the existing Next.js App Router, Mongoose connection, and admin session. Set these optional server-only variables in `.env.local` to enable Google's external metrics:

```dotenv
GA4_PROPERTY_ID=123456789
GSC_SITE_URL=sc-domain:ridercomplex.com
GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\google-service-account.json
```

Grant the service account read access to the GA4 property and Search Console property. Without these values, the dashboard continues to show local analytics and displays an "Analytics syncing" state for unavailable Google data. Never commit the service-account JSON file.

### First-party affiliate redirects

Public product links that include a known ASIN use `/go/:slug?asin=...&page=...`. The route looks up the active Product by ASIN and redirects to its saved `affiliateLink` (including that link's configured Amazon tracking tag). An ASIN must exist in Products before its redirect can be used. Unknown or inactive products do not redirect. The route records the post path, link slug, ASIN, campaign parameters, user agent, and a keyed IP hash; it never stores the raw IP address.

### Phase 1 endpoints

All analytics endpoints require an authenticated admin:

- `GET /api/analytics/overview` includes GA4 sessions, users, pageviews, landing pages, and local outbound-click totals alongside the existing dashboard metrics.
- `GET /api/analytics/gsc` returns query/page clicks, impressions, CTR, and position.
- `GET /api/analytics/clicks` groups first-party clicks by referring post and ASIN.
- `GET /go/:slug` resolves and logs a click before issuing a 302 redirect. The click-log write runs after the redirect response.

GA4 and Search Console responses are cached in MongoDB for one hour. Cache entries expire automatically. Configure the credentials, property IDs, and site URL, then wait for Google's first report data to populate. Redirect statistics are local and do not require Amazon PA-API.

### Verifying Google OAuth access

The admin dashboard's `GET /api/analytics` endpoint and the verification script use OAuth2 refresh-token credentials. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GA4_PROPERTY_ID`, and `GSC_SITE_URL`. Grant the refresh token read access to both the GA4 property and Search Console site. The endpoint is admin-only and returns period totals and daily series for the last seven complete days; the dashboard displays the four metrics and a daily chart. A provider failure is reported independently so the other provider's metrics remain available.

To verify API access from Node, run:

```sh
node --env-file=.env scripts/test-analytics.js
```

The script reports GA4 active users and pageviews and Search Console clicks and impressions for the last seven complete days. It runs both checks independently and exits with a non-zero status if either request fails.

### Related Phase 1 files

- `/app/go/[slug]/route.ts`
- `/app/api/analytics/overview/route.ts`
- `/app/api/analytics/gsc/route.ts`
- `/app/api/analytics/clicks/route.ts`
- `/app/api/analytics/route.ts`
- `/scripts/test-analytics.js`
- `/components/analytics/GoogleAnalyticsSummary.tsx`
- `/lib/analytics/`
- `/lib/db/models/OutboundClickLog.ts`
- `/lib/db/models/AnalyticsCache.ts`
- `/components/analytics/`

## Support

For issues or questions:
1. Check console for error messages
2. Verify database connectivity
3. Ensure all dependencies are installed
4. Check API endpoint responses in Network tab
5. Review authentication status

---

**Version**: 1.0.0  
**Last Updated**: March 3, 2026  
**Maintainer**: Rider Complex Development Team
