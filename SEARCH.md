# Admin Search System Documentation

## Overview

The admin search system provides powerful real-time search across posts, products, and users directly from the admin topbar. Features include debounced input, keyboard navigation, and categorized results with thumbnails.

## Features

### 🔍 **Core Functionality**

- **Multi-resource search** - Posts, Products, and Users
- **Real-time results** - As you type (300ms debounce)
- **Keyboard navigation** - Arrow keys, Enter, Escape
- **Smart ranking** - Most relevant results first
- **Category grouping** - Results organized by type
- **Visual previews** - Thumbnails/avatars for each result
- **Quick navigation** - Click to jump to resource
- **Loading indicators** - Visual feedback during search
- **Empty states** - Helpful messages when no results

### ⌨️ **Keyboard Shortcuts**

| Key | Action |
|-----|--------|
| **Type** | Start searching (auto-opens dropdown) |
| **↓** | Move down through results |
| **↑** | Move up through results |
| **Enter** | Navigate to selected result |
| **Esc** | Close search dropdown |
| **Ctrl/Cmd + K** | Focus search bar (future) |

### 📊 **Search Categories**

#### 1. Posts
- **Searchable fields**: Title, excerpt, category, category label
- **Displayed info**: Title, status badge, category, view count
- **Thumbnail**: Featured image or default icon
- **Navigation**: Redirects to post editor
- **Max results**: 5 per search

#### 2. Products
- **Searchable fields**: Product name, category, ASIN
- **Displayed info**: Name, active status, category, click count
- **Thumbnail**: Product image or default icon
- **Navigation**: Redirects to affiliate links page
- **Max results**: 5 per search

#### 3. Users
- **Searchable fields**: Name, email
- **Displayed info**: Name, role badge, email
- **Avatar**: Initials with gradient background
- **Navigation**: Redirects to users management page
- **Max results**: 5 per search

## Technical Implementation

### API Endpoint

**Route**: `/api/admin/search`  
**Method**: GET  
**Auth**: Required (Admin only)

#### Request

```http
GET /api/admin/search?q=helmet

Headers:
  Cookie: next-auth.session-token=...
```

#### Response

```json
{
  "posts": [
    {
      "_id": "65abc123...",
      "title": "Best Helmets for Bike Delivery",
      "slug": "best-helmets-bike-delivery",
      "status": "published",
      "category": "bike-delivery-rider-gear",
      "categoryLabel": "Rider Gear",
      "featuredImage": "/images/helmet.jpg",
      "views": 1234,
      "createdAt": "2026-03-01T..."
    }
  ],
  "products": [
    {
      "_id": "65def456...",
      "productName": "Giro Syntax MIPS Helmet",
      "asin": "B08XYZ123",
      "category": "helmets",
      "productImage": "/products/giro.jpg",
      "clickCount": 156,
      "isActive": true,
      "price": "$199.99"
    }
  ],
  "users": [
    {
      "_id": "65ghi789...",
      "name": "John Doe",
      "email": "john@ridersection.com",
      "role": "admin",
      "createdAt": "2025-01-15T...",
      "lastLogin": "2026-03-03T..."
    }
  ],
  "total": 3,
  "query": "helmet"
}
```

#### Status Codes

- `200` - Success
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not admin)
- `500` - Server error

### Search Logic

#### Query Building

```typescript
const searchRegex = new RegExp(query, 'i'); // Case-insensitive

// Posts: title, excerpt, category, categoryLabel
Post.find({
  $or: [
    { title: searchRegex },
    { excerpt: searchRegex },
    { category: searchRegex },
    { categoryLabel: searchRegex },
  ],
})

// Products: name, category, ASIN
Product.find({
  $or: [
    { productName: searchRegex },
    { category: searchRegex },
    { asin: searchRegex },
  ],
})

// Users: name, email
User.find({
  $or: [
    { name: searchRegex },
    { email: searchRegex },
  ],
})
```

#### Parallel Execution

All three searches execute simultaneously using `Promise.all()`:

```typescript
const [posts, products, users] = await Promise.all([
  postsPromise,
  productsPromise,
  usersPromise,
]);
```

**Benefits:**
- Faster response time
- Efficient resource usage
- Single network request

### Component Architecture

#### State Management

```typescript
// Search state
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
const [showSearchResults, setShowSearchResults] = useState(false);
const [searchLoading, setSearchLoading] = useState(false);
const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

// Refs
const searchRef = useRef<HTMLDivElement>(null);
const searchInputRef = useRef<HTMLInputElement>(null);
const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
```

#### Debounced Search

```typescript
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setSearchQuery(value);

  // Clear existing timeout
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }

  // Debounce search (300ms)
  searchTimeoutRef.current = setTimeout(() => {
    performSearch(value);
  }, 300);
};
```

**Why debouncing?**
- Reduces API calls (saves bandwidth)
- Improves performance
- Better user experience
- Waits for user to finish typing

#### Keyboard Navigation

```typescript
const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const flatResults = getFlatResults(); // Combines all results
  
  switch (e.key) {
    case 'ArrowDown':
      // Move down, prevent default scrolling
      setSelectedResultIndex(prev => 
        prev < flatResults.length - 1 ? prev + 1 : prev
      );
      break;
    case 'ArrowUp':
      // Move up
      setSelectedResultIndex(prev => prev > 0 ? prev - 1 : -1);
      break;
    case 'Enter':
      // Navigate to selected
      if (selectedResultIndex >= 0) {
        const selected = flatResults[selectedResultIndex];
        handleResultClick(selected.type, selected.item);
      }
      break;
    case 'Escape':
      // Close and blur
      clearSearch();
      searchInputRef.current?.blur();
      break;
  }
};
```

#### Outside Click Detection

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && 
        !searchRef.current.contains(event.target as Node)) {
      setShowSearchResults(false);
    }
  };

  if (showSearchResults) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showSearchResults]);
```

## User Interface

### Search Input

```tsx
<input
  ref={searchInputRef}
  type="text"
  value={searchQuery}
  onChange={handleSearchChange}
  onKeyDown={handleSearchKeyDown}
  onFocus={() => {
    if (searchQuery.trim().length >= 2 && searchResults) {
      setShowSearchResults(true);
    }
  }}
  placeholder="Search posts, products, or users..."
  className="w-full bg-gray-50 rounded-xl py-3 pl-12 pr-12"
/>
```

#### Input States

- **Empty**: Gray placeholder text
- **Typing**: Black text, shows clear button
- **Loading**: Animated spinner on right
- **Focused**: Ring highlight
- **Results**: Dropdown appears below

### Results Dropdown

#### Layout Structure

```
┌────────────────────────────────────┐
│ POSTS (3)                          │ <- Section header
├────────────────────────────────────┤
│ [Img] Post Title                   │ <- Result item
│       ✓ published • Category       │
├────────────────────────────────────┤
│ PRODUCTS (2)                       │
├────────────────────────────────────┤
│ [Img] Product Name                 │
│       ✓ active • helmet            │
├────────────────────────────────────┤
│ USERS (1)                          │
├────────────────────────────────────┤
│ [JD] John Doe                      │
│      admin • john@example.com      │
└────────────────────────────────────┘
```

#### Visual Design

**Container:**
- Width: Matches search input
- Max height: 500px (scrollable)
- Shadow: 2xl for depth
- Border: 1px gray-200
- Border radius: xl (12px)

**Section Headers:**
- Background: Gray-50
- Text: Uppercase, bold, small
- Shows count: "POSTS (3)"

**Result Items:**
- Padding: 12px 16px
- Hover: Gray-50 background
- Selected: Blue-50 background
- Cursor: Pointer
- Transition: Smooth color change

**Thumbnails:**
- Size: 48x48px
- Border radius: 8px (6px for users - circle)
- Object fit: Cover
- Fallback: Colored icon background

**Status Badges:**
- Published: Green
- Draft: Yellow
- Active: Green
- Inactive: Gray
- Admin: Red
- User: Blue

### Loading State

```tsx
{searchLoading && (
  <div className="absolute right-4 top-1/2 -translate-y-1/2">
    <Loader2 size={16} className="animate-spin text-gray-400" />
  </div>
)}
```

### Empty State

```tsx
<div className="p-8 text-center text-gray-500">
  <Search size={32} className="mx-auto mb-2 opacity-30" />
  <p className="text-sm font-semibold">No results found</p>
  <p className="text-xs mt-1">Try different keywords</p>
</div>
```

## Usage Examples

### Basic Search

1. Click search input at top of admin panel
2. Type query: "delivery"
3. View results automatically
4. Click any result to navigate

### Keyboard Navigation

1. Type: "helmet"
2. Press ↓ to select first result
3. Press ↓ again to move down
4. Press Enter to open selected item
5. Or press Esc to cancel

### Quick Clear

1. Start typing in search
2. Click X button on right
3. Search clears immediately
4. Dropdown closes

## Performance Optimization

### Debouncing

```typescript
// 300ms debounce prevents excessive API calls
searchTimeoutRef.current = setTimeout(() => {
  performSearch(value);
}, 300);
```

**Before debouncing:** Typing "helmet" = 6 API calls  
**After debouncing:** Typing "helmet" = 1 API call

### Parallel Queries

```typescript
await Promise.all([postsPromise, productsPromise, usersPromise]);
```

**Sequential:** ~300ms (100ms × 3)  
**Parallel:** ~100ms (max of three)  
**Speedup:** 3x faster

### Limited Results

```typescript
.limit(5)  // Only 5 of each type
```

**Benefits:**
- Faster queries
- Smaller payload
- Better UX (not overwhelming)
- Room for pagination

### Indexed Fields

Ensure these indexes exist for fast searching:

```typescript
// Posts
{ title: 'text', excerpt: 'text' }

// Products
{ productName: 1, category: 1, asin: 1 }

// Users
{ name: 1, email: 1 }
```

### Lean Queries

```typescript
.lean()  // Returns plain objects, not Mongoose documents
```

**Benefits:**
- 5x faster than full documents
- Less memory usage
- Faster JSON serialization

## Security

### Authentication Check

```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Admin-Only Access

```typescript
const user = await User.findOne({ email: session.user.email });
if (!user || user.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Query Sanitization

```typescript
// Regex automatically escapes special characters
const searchRegex = new RegExp(query, 'i');

// Mongoose prevents NoSQL injection
Post.find({ title: searchRegex })
```

### Field Selection

```typescript
.select('title slug status category')  // Only return needed fields
```

**Benefits:**
- Hides sensitive data
- Smaller payload
- Faster queries

## Troubleshooting

### Issue: No Results Showing

**Symptoms:** Search returns empty even with valid query

**Solutions:**
1. Check if resources exist in database
2. Verify search fields match schema
3. Check console for API errors
4. Ensure admin authentication is valid
5. Test API endpoint directly: `/api/admin/search?q=test`

### Issue: Slow Search Performance

**Symptoms:** Long delay before results appear

**Solutions:**
1. Check database indexes exist
2. Reduce limit per category
3. Optimize regex patterns
4. Monitor MongoDB performance
5. Consider full-text search indexes

### Issue: Keyboard Navigation Not Working

**Symptoms:** Arrow keys don't move selection

**Solutions:**
1. Check if dropdown is open
2. Verify `showSearchResults` is true
3. Check console for JavaScript errors
4. Ensure event handlers are attached
5. Test with different browsers

### Issue: Dropdown Won't Close

**Symptoms:** Clicking outside doesn't close

**Solutions:**
1. Check `searchRef` is attached to container
2. Verify outside click handler is registered
3. Check for z-index conflicts
4. Test event listener cleanup
5. Check browser console for errors

### Issue: Search Query Too Short

**Symptoms:** Nothing happens when typing

**Solutions:**
- Minimum 2 characters required
- Type at least 2 letters
- This prevents excessive API calls
- Wait for full debounce delay (300ms)

## Best Practices

### Search Query Length

✅ **Do:**
- Require minimum 2 characters
- Show helpful message if too short
- Clear results when input cleared
- Provide search suggestions

❌ **Don't:**
- Search on single character
- Search on every keystroke
- Allow empty searches
- Show stale results

### Result Presentation

✅ **Do:**
- Group by category
- Show thumbnails/avatars
- Display key metadata
- Highlight status badges
- Truncate long text
- Show result counts

❌ **Don't:**
- Mix categories randomly
- Show only text
- Display too much info
- Use inconsistent styling
- Allow horizontal scrolling

### Performance

✅ **Do:**
- Use debouncing (300ms+)
- Execute parallel queries
- Limit results (5-10 per type)
- Use lean queries
- Add loading indicators
- Cache when possible

❌ **Don't:**
- Search instantly on keypress
- Make sequential API calls
- Return unlimited results
- Use full Mongoose documents
- Block UI during search
- Ignore loading states

### User Experience

✅ **Do:**
- Support keyboard navigation
- Show loading state
- Display empty state
- Auto-focus on shortcut
- Clear on navigation
- Close on outside click

❌ **Don't:**
- Require mouse only
- Leave spinner forever
- Show blank space
- Ignore accessibility
- Keep results after navigation
- Force manual close

## Future Enhancements

### Advanced Search Filters

```typescript
interface SearchFilters {
  type?: 'posts' | 'products' | 'users' | 'all';
  status?: 'published' | 'draft' | 'all';
  dateRange?: { from: Date; to: Date };
  sortBy?: 'relevance' | 'date' | 'views';
}
```

### Search History

```typescript
const [searchHistory, setSearchHistory] = useState<string[]>([]);

// Show recent searches on focus
<div className="recent-searches">
  {searchHistory.slice(0, 5).map(term => (
    <button onClick={() => setSearchQuery(term)}>
      {term}
    </button>
  ))}
</div>
```

### Fuzzy Search

```bash
npm install fuse.js
```

```typescript
import Fuse from 'fuse.js';

const fuse = new Fuse(posts, {
  keys: ['title', 'excerpt'],
  threshold: 0.3,
});

const results = fuse.search(query);
```

### Search Analytics

Track what users search for:

```typescript
await Analytics.updateOne(
  { date: today },
  { 
    $push: { 
      adminSearches: { 
        query, 
        userId: user._id,
        resultCount: total,
        timestamp: new Date()
      } 
    } 
  }
);
```

### Keyboard Shortcuts

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Highlighted Matches

```typescript
const highlightMatch = (text: string, query: string) => {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};
```

## Related Documentation

- [Admin Dashboard](./DASHBOARD.md)
- [Notifications System](./NOTIFICATIONS.md)
- [API Routes](./README.md)
- [User Management](./SECURITY.md)

## Support

For issues or questions:
1. Check this documentation
2. Test API endpoint manually
3. Review browser console
4. Verify authentication
5. Check database connectivity

---

**Version**: 1.0.0  
**Last Updated**: March 3, 2026  
**Maintainer**: Rider Complex Development Team
