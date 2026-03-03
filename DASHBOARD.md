# Admin Dashboard Documentation

## Overview

The Admin Dashboard serves as the central hub for managing your Rider Section website. It provides real-time analytics, quick actions, and an overview of recent content and products.

## Features

### 📊 **Real-Time Analytics**

The dashboard displays key performance metrics with live data:

#### Summary Statistics
- **Page Views**: Total page views for selected date range
- **Unique Visitors**: Number of unique visitors
- **Product Clicks**: Total affiliate link clicks
- **Published Posts**: Count of published articles

Each stat card includes:
- Current value
- Percentage change indicator
- Sparkline chart showing trend
- Color-coded positive/negative indicators

### 📅 **Calendar & Date Range Selection**

#### Preset Ranges
- **Today**: Current day's activity
- **Last 7 days**: Weekly overview
- **Last 30 days**: Monthly insights (default)

#### Custom Date Range
- Select any date range using calendar picker
- Visual calendar interface
- Maximum range: From site inception to today
- Apply button to confirm selection

#### How to Use
1. Click the date selector button (top-right)
2. Choose preset or "Custom Range..."
3. For custom: select start and end dates in calendar
4. Click "Apply" to update dashboard

### 📈 **Analytics Chart**

Interactive line chart displaying:
- **Page Views** (blue line)
- **Unique Visitors** (green line)

Features:
- Responsive design
- Hover tooltips with exact values
- Date range headers
- Total counts displayed
- Smooth animations

### ⚡ **Quick Actions Panel**

Four main action buttons for common tasks:

#### 1. New Post
- **Icon**: Blue + sign
- **Action**: Create new blog post
- **Route**: `/admin/posts/new`

#### 2. Add Product
- **Icon**: Purple + sign
- **Action**: Add affiliate product
- **Route**: `/admin/products/new`

#### 3. Analytics
- **Icon**: Green chart
- **Action**: View detailed analytics
- **Route**: `/admin/analytics`

#### 4. Users
- **Icon**: Amber users
- **Action**: Manage user accounts
- **Route**: `/admin/users`

### 📝 **Recent Posts Section**

Displays the 5 most recently created posts:

#### Information Shown
- Featured image thumbnail
- Post title (clickable)
- Creation date
- View count
- Status badge (Published/Draft)

#### Actions
- Click any post to edit it
- "View All" button to see posts page
- Hover effects for better UX

#### Empty State
When no posts exist:
- File icon displayed
- "No posts yet" message
- Encouraging to create first post

### 🛍️ **Recent Products Section**

Shows the 5 most recently added products:

#### Information Shown
- Product image thumbnail
- Product name
- Category and price
- Click count
- Active/Inactive status

#### Actions
- Click "View All" to see affiliate links page
- Visual status indicators
- Hover effects

#### Empty State
When no products exist:
- Package icon displayed
- "No products yet" message

## API Integration

### Endpoints Used

#### 1. GET /api/analytics/overview
**Purpose**: Fetch overall statistics

**Query Parameters:**
```
from: 2026-02-01T00:00:00.000Z
to: 2026-03-03T23:59:59.999Z
```

**Response Data:**
```json
{
  "overview": {
    "totalPageViews": 42892,
    "totalUniqueVisitors": 28401,
    "postsPublishedThisMonth": 5,
    "totalPublishedPosts": 156
  },
  "topPosts": [...],
  "topProducts": [...]
}
```

#### 2. GET /api/analytics/pageviews
**Purpose**: Get daily pageviews for chart

**Query Parameters:**
```
from: 2026-02-01T00:00:00.000Z
to: 2026-03-03T23:59:59.999Z
```

**Response Data:**
```json
{
  "data": [
    { "date": "2026-02-01", "views": 1234, "visitors": 856 }
  ]
}
```

#### 3. GET /api/posts
**Purpose**: Fetch recent posts

**Query Parameters:**
```
limit: 5
sort: createdAt
```

**Response Data:**
```json
{
  "posts": [
    {
      "_id": "...",
      "title": "Post Title",
      "featuredImage": "...",
      "status": "published",
      "views": 1234,
      "createdAt": "2026-03-01T..."
    }
  ]
}
```

#### 4. GET /api/products
**Purpose**: Fetch recent products

**Query Parameters:**
```
includeInactive: true
```

**Response Data:**
```json
{
  "products": [
    {
      "_id": "...",
      "productName": "Product Name",
      "category": "helmets",
      "price": "$49.99",
      "clickCount": 156,
      "isActive": true
    }
  ]
}
```

## Technical Details

### State Management

```typescript
// Date range state
const [startDate, setStartDate] = useState<Date>()
const [endDate, setEndDate] = useState<Date>()
const [selectedPreset, setSelectedPreset] = useState()

// Data state
const [overviewData, setOverviewData] = useState()
const [pageviewsData, setPageviewsData] = useState()
const [recentPosts, setRecentPosts] = useState()
const [recentProducts, setRecentProducts] = useState()

// UI state
const [loading, setLoading] = useState(true)
const [showDatePicker, setShowDatePicker] = useState(false)
const [showPresetMenu, setShowPresetMenu] = useState(false)
```

### Data Fetching

#### Parallel API Calls
```typescript
const [overviewRes, pageviewsRes, postsRes, productsRes] = 
  await Promise.all([
    fetch(`/api/analytics/overview?${params}`),
    fetch(`/api/analytics/pageviews?${params}`),
    fetch('/api/posts?limit=5&sort=createdAt'),
    fetch('/api/products?includeInactive=true'),
  ]);
```

**Benefits:**
- Faster loading (parallel vs sequential)
- Single loading state
- Efficient resource usage

#### Re-fetch Triggers
Data is automatically refetched when:
- Date range changes
- Page loads/refreshes
- User navigates back to dashboard

### Calculations

#### Sparkline Data
```typescript
const getSparklineData = (data: any[] = []) => {
  if (!data.length) return [{ value: 0 }];
  return data.slice(-8).map(d => ({ value: d.views || 0 }));
};
```

Takes last 8 data points for mini chart display.

#### Change Percentage
```typescript
const calculateChange = (current: number, previous: number = 0) => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
};
```

Calculates percentage change with proper formatting.

## User Interface

### Layout Structure

```
┌────────────────────────────────────────────────┐
│  Header (Title + Date Selector)                │
├────────────────────────────────────────────────┤
│  Stat Cards Grid (4 columns)                   │
├────────────────────────────────────────────────┤
│  Analytics Chart (full width)                  │
├────────────────────────────────────────────────┤
│  Quick Actions (4 buttons)                     │
├────────────────────────────────────────────────┤
│  Recent Posts  │  Recent Products              │
│  (2 columns)   │                               │
└────────────────────────────────────────────────┘
```

### Responsive Breakpoints

- **Mobile** (< 768px): Single column layout
- **Tablet** (768px - 1024px): 2 column grid
- **Desktop** (> 1024px): Full 4 column grid

### Color Scheme

#### Stat Cards
- **Blue**: Page Views
- **Green**: Unique Visitors
- **Purple**: Product Clicks
- **Amber**: Published Posts

#### Quick Actions
- **Blue**: New Post
- **Purple**: Add Product
- **Green**: Analytics
- **Amber**: Users

### Animations

- Hover scale on quick action buttons
- Smooth transitions on card hovers
- Loading state fadeins
- Modal animations

## Usage Guide

### Accessing the Dashboard

1. Navigate to `http://localhost:3002/admin`
2. Ensure you're logged in as admin
3. Dashboard loads automatically

### Viewing Analytics

#### Change Date Range
1. Click date selector (top-right)
2. Choose preset or custom range
3. Data updates automatically

#### Read Stat Cards
- **Large number**: Current value
- **Percentage**: Change indicator
- **Mini chart**: Trend visualization
- **Green/Red**: Positive/negative change

### Using Quick Actions

#### Create New Post
1. Click "New Post" blue button
2. Redirects to post editor
3. Fill in post details
4. Publish when ready

#### Add Product
1. Click "Add Product" purple button
2. Opens product form
3. Enter product details
4. Save to database

#### View Analytics
1. Click "Analytics" green button
2. Redirects to full analytics page
3. Access detailed reports

#### Manage Users
1. Click "Users" amber button
2. View user list
3. Add/edit/remove users

### Managing Recent Content

#### Edit Post
1. Locate post in Recent Posts section
2. Click on post card
3. Redirects to edit page
4. Make changes and save

#### View All Posts
1. Click "View All" button
2. Opens posts management page
3. See complete post list

#### View All Products
1. Click "View All" button in Products section
2. Opens affiliate links page
3. Manage all products

## Performance Optimization

### Loading Strategy
- Initial state shows loading indicator
- Parallel API calls for speed
- Cached data where possible
- Efficient re-renders

### Data Handling
- Lean database queries
- Limited result sets (top 5)
- Selected fields only
- Indexed queries

### UI Optimization
- Conditional rendering
- Lazy loading for images
- Debounced interactions
- Optimized re-renders

## Troubleshooting

### Issue: Dashboard Not Loading
**Symptoms**: Stuck on loading screen

**Solutions:**
1. Check MongoDB connection
2. Verify admin authentication
3. Check browser console for errors
4. Ensure API routes are accessible

### Issue: No Data Showing
**Symptoms**: Empty charts and zero stats

**Solutions:**
1. Run analytics seed: `npm run seed-analytics`
2. Check date range selection
3. Verify database has data
4. Check API responses in Network tab

### Issue: Date Picker Not Working
**Symptoms**: Calendar doesn't open or apply

**Solutions:**
1. Clear browser cache
2. Check DatePicker styles loaded
3. Verify date state updates
4. Check console for errors

### Issue: Recent Posts/Products Empty
**Symptoms**: "No posts/products yet" showing incorrectly

**Solutions:**
1. Check if posts/products exist in DB
2. Verify API endpoints working
3. Check status filters
4. Ensure proper authentication

## Best Practices

### Regular Monitoring
- Check dashboard daily
- Monitor key metrics
- Track trends over time
- Set performance goals

### Date Range Selection
- Use "Last 7 days" for weekly checks
- Use "Last 30 days" for monthly reports
- Use custom ranges for specific analysis
- Compare similar time periods

### Quick Actions
- Use keyboard shortcuts when available
- Bookmark frequently used actions
- Keep workflow efficient
- Organize content regularly

### Content Management
- Review recent posts for updates
- Check product performance
- Update inactive content
- Archive old products

## Future Enhancements

Planned features:

1. **Customizable Dashboard**
   - Drag-and-drop widgets
   - Custom stat cards
   - Personalized layouts
   - Widget preferences

2. **Real-Time Updates**
   - WebSocket integration
   - Live visitor count
   - Real-time notifications
   - Auto-refresh data

3. **Performance Goals**
   - Set target metrics
   - Progress indicators
   - Achievement tracking
   - Goal notifications

4. **Advanced Filtering**
   - Multi-date comparisons
   - Category breakdowns
   - Custom metrics
   - Export capabilities

5. **Notifications Center**
   - New comments
   - Low-performing content
   - System alerts
   - Achievement badges

## Related Documentation

- [Analytics Documentation](./ANALYTICS.md)
- [Affiliate Links Guide](./AFFILIATE-LINKS.md)
- [User Management](./SECURITY.md)
- [API Routes](./README.md)

## Support

For issues or questions:
1. Check this documentation
2. Review browser console
3. Verify database connection
4. Check API responses
5. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: March 3, 2026  
**Maintainer**: Rider Section Development Team
