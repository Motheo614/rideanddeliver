# Notification System Documentation

## Overview

The notification system provides real-time alerts and updates to admin users through an interactive bell icon in the admin topbar. It includes complete CRUD functionality, read/unread tracking, and an elegant dropdown interface.

## Features

### 📬 **Core Functionality**

- **Real-time notifications** with unread count badge
- **Six notification types** with unique icons and colors
- **Interactive dropdown** with smooth animations
- **Mark as read** individually or all at once
- **Delete notifications** with confirmation
- **Click-to-navigate** to related content
- **Time-relative formatting** ("5 minutes ago")
- **Auto-refresh** when dropdown opens

### 🎨 **Notification Types**

Each type has a distinct icon and color scheme:

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| **Post** | FileText | Blue | New posts, drafts, publishing |
| **Product** | Package | Purple | Product additions, clicks |
| **User** | Users | Green | User registrations, updates |
| **Analytics** | TrendingUp | Amber | Traffic milestones, reports |
| **Comment** | MessageSquare | Indigo | New comments, moderation |
| **System** | AlertCircle | Red | Security, backups, updates |

### 🖱️ **User Interface**

#### Bell Icon
- Located in admin topbar (top-right)
- Shows red badge with unread count
- Badge displays "9+" for 10 or more unread
- Hover effect for better UX

#### Dropdown Panel
- **Width**: 384px (96 in Tailwind)
- **Max height**: 500px with scroll
- **Position**: Right-aligned below bell
- **Shadow**: 2xl shadow for depth
- **Animation**: Smooth fade-in

#### Notification Items
- **Unread**: Blue background highlight + red dot indicator
- **Read**: White background
- **Hover**: Gray background
- **Delete button**: Appears on hover
- **Clickable**: Full card is clickable

## Installation

### No Additional Packages Required! ✅

All functionality uses existing packages:
- `date-fns` - Time formatting
- `lucide-react` - Icons
- `next-auth` - Authentication
- `mongoose` - Database operations

## Database Model

### Schema Fields

```typescript
interface INotification {
  userId: ObjectId;          // Reference to User
  type: string;              // post | product | user | system | comment | analytics
  title: string;             // Max 200 characters
  message: string;           // Max 500 characters
  link?: string;             // Optional navigation URL
  isRead: boolean;           // Default: false
  createdAt: Date;           // Auto-generated
  readAt?: Date;             // Set when marked as read
}
```

### Indexes

Optimized for performance:
```typescript
{ userId: 1, isRead: 1, createdAt: -1 }  // List unread
{ userId: 1, createdAt: -1 }             // List all
{ userId: 1 }                            // User lookup
{ isRead: 1 }                            // Filter by status
{ createdAt: 1 }                         // Sort by date
```

## API Routes

### GET /api/notifications

Fetch user's notifications.

**Query Parameters:**
```
limit: number = 20          // Max notifications to return
unreadOnly: boolean = false // Only fetch unread
```

**Response:**
```json
{
  "notifications": [
    {
      "_id": "65abc123...",
      "userId": "65abc456...",
      "type": "post",
      "title": "New Post Published",
      "message": "Your post has been published successfully.",
      "link": "/admin/posts/123",
      "isRead": false,
      "createdAt": "2026-03-03T10:30:00.000Z"
    }
  ],
  "unreadCount": 5
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (not logged in)
- `404` - User not found
- `500` - Server error

### PATCH /api/notifications/[id]

Mark notification as read.

**Special Routes:**
- `/api/notifications/mark-all-read` - Marks all as read

**Request:**
```http
PATCH /api/notifications/65abc123
```

**Response:**
```json
{
  "_id": "65abc123...",
  "isRead": true,
  "readAt": "2026-03-03T11:00:00.000Z",
  ...
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Notification not found
- `500` - Server error

### DELETE /api/notifications/[id]

Delete a notification.

**Request:**
```http
DELETE /api/notifications/65abc123
```

**Response:**
```json
{
  "message": "Notification deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Notification not found
- `500` - Server error

### POST /api/notifications

Create a notification (admin only).

**Request Body:**
```json
{
  "userId": "65abc456...",
  "type": "post",
  "title": "New Post Published",
  "message": "Your post has been published successfully.",
  "link": "/admin/posts/123"
}
```

**Response:**
```json
{
  "_id": "65abc789...",
  "userId": "65abc456...",
  "type": "post",
  "title": "New Post Published",
  "message": "Your post has been published successfully.",
  "link": "/admin/posts/123",
  "isRead": false,
  "createdAt": "2026-03-03T10:30:00.000Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Invalid request
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Server error

## Usage

### Setup & Testing

#### 1. Ensure MongoDB is Connected

```bash
# Check .env.local file exists
MONGODB_URI=mongodb://localhost:27017/ridersection
# or
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ridersection
```

#### 2. Seed Sample Notifications

```bash
npm run seed-notifications
```

This creates 10 sample notifications:
- 3 unread (recent)
- 7 read (older)
- Various types and timestamps

#### 3. View Notifications

1. Start development server: `npm run dev`
2. Navigate to: http://localhost:3002/admin
3. Click bell icon (top-right)
4. Interact with notifications

### Creating Notifications Programmatically

#### From API Route
```typescript
// In any API route
import Notification from '@/lib/db/models/Notification';

await Notification.create({
  userId: user._id,
  type: 'post',
  title: 'New Post Published',
  message: 'Your post "Guide to Bike Safety" is now live.',
  link: '/admin/posts/123',
});
```

#### From Server Action
```typescript
'use server';

import connectDB from '@/lib/db/mongoose';
import { Notification } from '@/lib/db/models';

export async function notifyUser(userId: string, data: any) {
  await connectDB();
  
  await Notification.create({
    userId,
    ...data,
  });
}
```

#### Common Use Cases

**Post Published:**
```typescript
await Notification.create({
  userId: authorId,
  type: 'post',
  title: 'Post Published',
  message: `Your post "${postTitle}" is now live.`,
  link: `/admin/posts/${postId}/edit`,
});
```

**Product Milestone:**
```typescript
await Notification.create({
  userId: adminId,
  type: 'product',
  title: 'Product Milestone',
  message: `${productName} has reached 100 clicks!`,
  link: '/admin/affiliate-links',
});
```

**Traffic Alert:**
```typescript
await Notification.create({
  userId: adminId,
  type: 'analytics',
  title: 'Traffic Milestone',
  message: 'Your site reached 10,000 monthly visitors!',
  link: '/admin/analytics',
});
```

**System Update:**
```typescript
await Notification.create({
  userId: adminId,
  type: 'system',
  title: 'Database Backup Complete',
  message: 'Weekly backup completed successfully.',
  link: '/admin/settings',
});
```

## Component Architecture

### AdminTopBar State

```typescript
const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState<Notification[]>([]);
const [unreadCount, setUnreadCount] = useState(0);
const [loading, setLoading] = useState(false);
```

### Key Functions

#### fetchNotifications()
- Called on mount and dropdown open
- Fetches latest 20 notifications
- Updates unread count
- Handles loading state

#### markAsRead(id)
- Sends PATCH request
- Updates local state
- Decrements unread count
- No page refresh needed

#### markAllAsRead()
- Special endpoint call
- Updates all unread notifications
- Resets unread count to 0

#### deleteNotification(id, event)
- Stops event propagation
- Sends DELETE request
- Removes from local state
- Updates unread count if needed

#### handleNotificationClick(notification)
- Marks as read if unread
- Navigates to link if provided
- Closes dropdown

### Outside Click Detection

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)) {
      setShowNotifications(false);
    }
  };

  if (showNotifications) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showNotifications]);
```

## Styling

### Unread Badge

```tsx
{unreadCount > 0 && (
  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] 
                   bg-[#CC0000] text-white text-[10px] font-bold 
                   rounded-full flex items-center justify-center px-1">
    {unreadCount > 9 ? '9+' : unreadCount}
  </span>
)}
```

### Unread Indicator

```tsx
{!notification.isRead && (
  <div className="w-2 h-2 bg-[#CC0000] rounded-full mt-1.5"></div>
)}
```

### Loading State

```tsx
{loading && (
  <div className="p-8 text-center text-gray-500">
    <div className="animate-spin rounded-full h-8 w-8 
                    border-b-2 border-[#CC0000] mx-auto"></div>
    <p className="mt-2 text-sm">Loading notifications...</p>
  </div>
)}
```

### Empty State

```tsx
{notifications.length === 0 && (
  <div className="p-8 text-center text-gray-500">
    <Bell size={32} className="mx-auto mb-2 opacity-30" />
    <p className="text-sm font-semibold">No notifications</p>
    <p className="text-xs mt-1">You're all caught up!</p>
  </div>
)}
```

## Performance Optimization

### Efficient Queries

```typescript
// Only fetch what's needed
.find(query)
.sort({ createdAt: -1 })
.limit(20)
.lean();  // Return plain objects, not Mongoose documents
```

### Indexed Queries

All common queries use compound indexes:
- List unread: `{ userId: 1, isRead: 1, createdAt: -1 }`
- List all: `{ userId: 1, createdAt: -1 }`

### Optimistic Updates

UI updates immediately before API confirmation:
```typescript
// Update UI first
setNotifications(prev =>
  prev.map(notif =>
    notif._id === notificationId ? { ...notif, isRead: true } : notif
  )
);

// Then make API call
await fetch(`/api/notifications/${notificationId}`, { method: 'PATCH' });
```

## Security

### Authentication

All routes require valid NextAuth session:
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Authorization

Users can only access their own notifications:
```typescript
const notification = await Notification.findOne({
  _id: id,
  userId: user._id,  // Ensures user owns this notification
});
```

### POST Route Protection

Only admins can create notifications:
```typescript
const user = await User.findOne({ email: session.user.email });
if (!user || user.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## Troubleshooting

### Issue: Badge Not Showing

**Symptoms:** Bell icon has no badge

**Solutions:**
1. Check if notifications exist in database
2. Verify notifications are unread (`isRead: false`)
3. Check browser console for API errors
4. Ensure user is logged in

### Issue: Dropdown Not Opening

**Symptoms:** Click on bell does nothing

**Solutions:**
1. Check browser console for errors
2. Verify React state is updating
3. Check z-index conflicts
4. Ensure JavaScript is enabled

### Issue: Notifications Not Loading

**Symptoms:** Loading spinner never disappears

**Solutions:**
1. Check MongoDB connection
2. Verify API route exists: `/api/notifications`
3. Check network tab for 404/500 errors
4. Verify user session is valid

### Issue: Click Navigation Not Working

**Symptoms:** Clicking notification doesn't navigate

**Solutions:**
1. Ensure `link` field is set in notification
2. Check if link is valid route
3. Verify useRouter is imported correctly
4. Check browser console for navigation errors

### Issue: Mark as Read Not Working

**Symptoms:** Notifications stay unread

**Solutions:**
1. Check PATCH endpoint: `/api/notifications/[id]`
2. Verify notification ID is correct
3. Check network tab for API errors
4. Ensure optimistic update is working

## Best Practices

### Creating Notifications

✅ **Do:**
- Keep titles under 50 characters
- Keep messages under 150 characters for visibility
- Always include relevant links
- Use appropriate notification type
- Create notifications for important events only

❌ **Don't:**
- Spam users with too many notifications
- Create notifications for minor events
- Use generic titles like "Update"
- Leave link field empty when relevant
- Create duplicate notifications

### Notification Timing

**Immediate** (realtime):
- System errors
- Security alerts
- Failed operations

**Batched** (every 5-15 min):
- New comments
- User registrations
- Product clicks

**Daily** (scheduled):
- Analytics reports
- Performance summaries
- Batch operations

### User Experience

1. **Priority**: System > Analytics > User > Product > Post
2. **Frequency**: Max 20-30 per day
3. **Grouping**: Bundle similar notifications
4. **Dismissal**: Always allow deletion
5. **Persistence**: Keep for 30 days max

## Future Enhancements

Planned features:

### Real-Time Updates (WebSockets)
```typescript
// Coming soon
import { useNotifications } from '@/hooks/useNotifications';

const { notifications, unreadCount } = useNotifications({
  realtime: true,
  pollInterval: 30000,
});
```

### Notification Preferences
```typescript
interface NotificationSettings {
  post: boolean;
  product: boolean;
  analytics: boolean;
  system: boolean;
  email: boolean;
  push: boolean;
}
```

### Push Notifications
- Browser push notifications
- Service worker integration
- Permission management
- Custom notification sounds

### Advanced Filtering
- Filter by type
- Filter by date range
- Search notifications
- Archive functionality

### Notification Groups
- Group similar notifications
- Expandable groups
- Bulk actions

## Related Documentation

- [Admin Dashboard](./DASHBOARD.md)
- [Analytics System](./ANALYTICS.md)
- [User Management](./SECURITY.md)
- [API Routes](./README.md)

## Support

For issues or questions:
1. Check this documentation
2. Review browser console
3. Test API endpoints manually
4. Check database connectivity

---

**Version**: 1.0.0  
**Last Updated**: March 3, 2026  
**Maintainer**: Rider Section Development Team
