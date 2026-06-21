'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, X, Check, FileText, Package, Users, TrendingUp, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Notification {
  _id: string;
  type: 'post' | 'product' | 'user' | 'system' | 'comment' | 'analytics';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface SearchResults {
  posts: any[];
  products: any[];
  users: any[];
  total: number;
  query: string;
}

const getPostImageUrl = (featuredImage: unknown): string | null => {
  if (!featuredImage) return null;

  if (typeof featuredImage === 'string') {
    return featuredImage.trim() || null;
  }

  if (typeof featuredImage === 'object' && featuredImage !== null && 'url' in featuredImage) {
    const url = (featuredImage as { url?: unknown }).url;
    if (typeof url === 'string' && url.trim()) {
      return url.trim();
    }
  }

  return null;
};

export default function AdminTopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [brokenProductImages, setBrokenProductImages] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const getUserInitial = (name?: string | null) => {
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  };

  const truncateEmail = (email?: string | null) => {
    if (!email) return 'info@ridercomplex.com';
    if (email.length > 25) {
      return email.substring(0, 22) + '...';
    }
    return email;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText size={18} className="text-blue-500" />;
      case 'product':
        return <Package size={18} className="text-purple-500" />;
      case 'user':
        return <Users size={18} className="text-green-500" />;
      case 'analytics':
        return <TrendingUp size={18} className="text-amber-500" />;
      case 'comment':
        return <MessageSquare size={18} className="text-indigo-500" />;
      case 'system':
        return <AlertCircle size={18} className="text-red-500" />;
      default:
        return <Bell size={18} className="text-gray-500" />;
    }
  };

  // Search functionality
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowSearchResults(true);
        setSelectedResultIndex(-1);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowSearchResults(false);
    setSelectedResultIndex(-1);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const getFlatResults = () => {
    if (!searchResults) return [];
    
    const results: { type: string; item: any }[] = [];
    
    searchResults.posts.forEach(post => results.push({ type: 'post', item: post }));
    searchResults.products.forEach(product => results.push({ type: 'product', item: product }));
    searchResults.users.forEach(user => results.push({ type: 'user', item: user }));
    
    return results;
  };

  const normalizeImageUrl = (url: unknown): string | null => {
    if (typeof url !== 'string') {
      return null;
    }

    const trimmed = url.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }

    if (trimmed.startsWith('http://')) {
      return `https://${trimmed.slice('http://'.length)}`;
    }

    return trimmed;
  };

  const getProductImageUrl = (product: any): string | null => {
    return normalizeImageUrl(product?.imageUrl) || normalizeImageUrl(product?.productImage);
  };

  const handleResultClick = (type: string, item: any) => {
    clearSearch();
    
    switch (type) {
      case 'post':
        router.push(`/admin/posts/${item._id}/edit`);
        break;
      case 'product':
        router.push('/admin/affiliate-links');
        break;
      case 'user':
        router.push('/admin/users');
        break;
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchResults || !searchResults) return;

    const flatResults = getFlatResults();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedResultIndex(prev => 
          prev < flatResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedResultIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedResultIndex >= 0 && selectedResultIndex < flatResults.length) {
          const selected = flatResults[selectedResultIndex];
          handleResultClick(selected.type, selected.item);
        }
        break;
      case 'Escape':
        e.preventDefault();
        clearSearch();
        searchInputRef.current?.blur();
        break;
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=20');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const notification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
      setShowNotifications(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    if (showNotifications || showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showSearchResults]);

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  useEffect(() => {
    if (showNotifications && session?.user) {
      fetchNotifications();
    }
  }, [showNotifications]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex-1 max-w-2xl relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
            className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-12 text-sm focus:ring-2 focus:ring-[#1a1a1a] transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          {searchLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[500px] overflow-y-auto">
            {searchResults.total === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">No results found</p>
                <p className="text-xs mt-1">Try different keywords</p>
              </div>
            ) : (
              <>
                {/* Posts Section */}
                {searchResults.posts.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Posts ({searchResults.posts.length})</p>
                    </div>
                    {searchResults.posts.map((post, index) => {
                      const flatIndex = index;
                      const postImage = getPostImageUrl(post.featuredImage);
                      return (
                        <button
                          key={post._id}
                          onClick={() => handleResultClick('post', post)}
                          className={`w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 text-left ${
                            selectedResultIndex === flatIndex ? 'bg-blue-50' : ''
                          }`}
                        >
                          {postImage ? (
                            <Image
                              src={postImage}
                              alt={post.title}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <FileText size={20} className="text-blue-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#1a1a1a] truncate">{post.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {post.status}
                              </span>
                              <span className="text-xs text-gray-500">{post.categoryLabel || post.category}</span>
                              {post.views > 0 && (
                                <span className="text-xs text-gray-400">• {post.views} views</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Products Section */}
                {searchResults.products.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Products ({searchResults.products.length})</p>
                    </div>
                    {searchResults.products.map((product, index) => {
                      const flatIndex = searchResults.posts.length + index;
                      const productImage = getProductImageUrl(product);
                      return (
                        <button
                          key={product._id}
                          onClick={() => handleResultClick('product', product)}
                          className={`w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 text-left ${
                            selectedResultIndex === flatIndex ? 'bg-blue-50' : ''
                          }`}
                        >
                          {productImage && !brokenProductImages[product._id] ? (
                            <img
                              src={productImage}
                              alt={product.productName}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                              loading="lazy"
                              onError={() => {
                                setBrokenProductImages(prev => ({ ...prev, [product._id]: true }));
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <Package size={20} className="text-purple-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#1a1a1a] truncate">{product.productName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-xs text-gray-500">{product.category}</span>
                              {product.clickCount > 0 && (
                                <span className="text-xs text-gray-400">• {product.clickCount} clicks</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Users Section */}
                {searchResults.users.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Users ({searchResults.users.length})</p>
                    </div>
                    {searchResults.users.map((user, index) => {
                      const flatIndex = searchResults.posts.length + searchResults.products.length + index;
                      return (
                        <button
                          key={user._id}
                          onClick={() => handleResultClick('user', user)}
                          className={`w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 text-left ${
                            selectedResultIndex === flatIndex ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 font-bold text-lg">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#1a1a1a] truncate">{user.name || 'Unnamed User'}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role}
                              </span>
                              <span className="text-xs text-gray-500 truncate">{user.email}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 md:justify-end md:gap-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-[#1a1a1a] transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#CC0000] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div>
                  <h3 className="font-bold text-[#1a1a1a] text-sm">Notifications</h3>
                  <p className="text-xs text-gray-500">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#CC0000] hover:text-[#990000] font-semibold flex items-center gap-1"
                  >
                    <Check size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CC0000] mx-auto"></div>
                    <p className="mt-2 text-sm">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">No notifications</p>
                    <p className="text-xs mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-semibold ${
                              !notification.isRead ? 'text-[#1a1a1a]' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => deleteNotification(notification._id, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1.5">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#CC0000] rounded-full mt-1.5"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
            <span className="text-[#CC0000] text-xl font-bold">
              {getUserInitial(session?.user?.name)}
            </span>
          </div>
          <div className="hidden sm:flex flex-col min-w-0">
            <p className="text-[#1a1a1a] font-semibold text-sm leading-tight">
              {session?.user?.name || 'Admin User'}
            </p>
            <p className="text-gray-500 text-xs leading-tight">
              {truncateEmail(session?.user?.email)}
            </p>
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}
