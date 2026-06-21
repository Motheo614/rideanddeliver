'use client';

import React, { useState, useEffect } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import StatCard from '@/components/admin/StatCard';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import Image from 'next/image';
import { 
  Calendar, 
  TrendingUp, 
  Eye, 
  FileText, 
  Package,
  ChevronDown,
  Plus,
  Edit,
  BarChart3,
  Users,
  MousePointer,
  Clock
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

type DateRangePreset = {
  label: string;
  days: number;
};

const dateRangePresets: DateRangePreset[] = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>(dateRangePresets[2]);
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [pageviewsData, setPageviewsData] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [brokenRecentProductImages, setBrokenRecentProductImages] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    fetchDashboardData();
  }, [startDate, endDate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      });

      const [overviewRes, pageviewsRes, postsRes, productsRes] = await Promise.all([
        fetch(`/api/analytics/overview?${params}`),
        fetch(`/api/analytics/pageviews?${params}`),
        fetch('/api/posts?limit=5&sort=createdAt'),
        fetch('/api/products?includeInactive=true'),
      ]);

      if (overviewRes.ok) {
        const overview = await overviewRes.json();
        setOverviewData(overview);
      }

      if (pageviewsRes.ok) {
        const pageviews = await pageviewsRes.json();
        setPageviewsData(pageviews.data || []);
      }

      if (postsRes.ok) {
        const posts = await postsRes.json();
        setRecentPosts((posts.posts || []).slice(0, 5));
      }

      if (productsRes.ok) {
        const products = await productsRes.json();
        setRecentProducts((products.products || []).slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    const end = new Date();
    const start = new Date();
    if (preset.days === 0) {
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(start.getDate() - preset.days);
    }
    setStartDate(start);
    setEndDate(end);
    setShowPresetMenu(false);
  };

  const handleCustomDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if (start) setStartDate(start);
    if (end) {
      setEndDate(end);
      setShowDatePicker(false);
    }
  };

  // Calculate sparkline data from pageviews
  const getSparklineData = (data: any[] = []) => {
    if (!data.length) return [{ value: 0 }];
    return data.slice(-8).map(d => ({ value: d.views || 0 }));
  };

  // Calculate change percentage (simplified)
  const calculateChange = (current: number, previous: number = 0) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };
  return (
    <>
      <AdminTopBar />
      
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a1a1a] mb-2">Dashboard</h1>
            <p className="text-gray-400 font-medium">Welcome back, Admin. Here&apos;s what&apos;s happening with your site today.</p>
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPresetMenu(!showPresetMenu)}
              className="bg-white border border-gray-200 px-6 py-3 rounded-xl flex items-center gap-3 text-sm font-bold text-[#1a1a1a] hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Calendar size={18} className="text-gray-400" />
              {selectedPreset.label}
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {showPresetMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                {dateRangePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetChange(preset)}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors ${
                      selectedPreset.label === preset.label ? 'text-[#CC0000] bg-red-50' : 'text-gray-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={() => {
                    setShowPresetMenu(false);
                    setShowDatePicker(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Custom Range...
                </button>
              </div>
            )}
          </div>

          {/* Custom Date Picker Modal */}
          {showDatePicker && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Select Date Range</h3>
                <DatePicker
                  selected={startDate}
                  onChange={handleCustomDateChange}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                  maxDate={new Date()}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      setSelectedPreset({ label: 'Custom Range', days: -1 });
                    }}
                    className="flex-1 px-4 py-2 bg-[#CC0000] text-white rounded-lg text-sm font-medium hover:bg-[#aa0000]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-lg font-medium">Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard 
                label="Page Views" 
                value={overviewData?.overview?.totalPageViews?.toLocaleString() || '0'} 
                change={calculateChange(overviewData?.overview?.totalPageViews || 0)} 
                isPositive={true} 
                data={getSparklineData(pageviewsData)}
              />
              <StatCard 
                label="Unique Visitors" 
                value={overviewData?.overview?.totalUniqueVisitors?.toLocaleString() || '0'} 
                change={calculateChange(overviewData?.overview?.totalUniqueVisitors || 0)} 
                isPositive={true} 
                data={getSparklineData(pageviewsData.map(d => ({ views: d.visitors })))}
              />
              <StatCard 
                label="Product Clicks" 
                value={overviewData?.topProducts?.reduce((sum: number, p: any) => sum + (p.clickCount || 0), 0)?.toLocaleString() || '0'} 
                change="+0%" 
                isPositive={true} 
                data={getSparklineData()}
              />
              <StatCard 
                label="Published Posts" 
                value={overviewData?.overview?.totalPublishedPosts?.toLocaleString() || '0'} 
                change={`+${overviewData?.overview?.postsPublishedThisMonth || 0}`} 
                isPositive={true} 
                data={getSparklineData()}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8 mb-10">
              <AnalyticsChart data={pageviewsData} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
              <button
                onClick={() => router.push('/admin/posts/new')}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={24} className="text-white" />
                  </div>
                  <FileText size={20} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-blue-900">New Post</h3>
                <p className="text-xs text-blue-600 mt-1">Create article</p>
              </button>

              <button
                onClick={() => router.push('/admin/products/new')}
                className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-xl hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={24} className="text-white" />
                  </div>
                  <Package size={20} className="text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-purple-900">Add Product</h3>
                <p className="text-xs text-purple-600 mt-1">Affiliate link</p>
              </button>

              <button
                onClick={() => router.push('/admin/analytics')}
                className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-xl hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                  <TrendingUp size={20} className="text-green-600" />
                </div>
                <h3 className="text-sm font-bold text-green-900">Analytics</h3>
                <p className="text-xs text-green-600 mt-1">View reports</p>
              </button>

              <button
                onClick={() => router.push('/admin/users')}
                className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-6 rounded-xl hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users size={24} className="text-white" />
                  </div>
                  <Users size={20} className="text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-amber-900">Users</h3>
                <p className="text-xs text-amber-600 mt-1">Manage access</p>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Posts */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-[#1a1a1a] flex items-center gap-2">
                    <FileText size={20} className="text-[#CC0000]" />
                    Recent Posts
                  </h3>
                  <button
                    onClick={() => router.push('/admin/posts')}
                    className="text-sm font-bold text-[#CC0000] hover:underline"
                  >
                    View All
                  </button>
                </div>
                
                {recentPosts.length > 0 ? (
                  <div className="space-y-4">
                    {recentPosts.map((post: any) => {
                      const imageUrl = getPostImageUrl(post.featuredImage);

                      return (
                      <div
                        key={post._id}
                        onClick={() => router.push(`/admin/posts/${post._id}/edit`)}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                      >
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={post.title}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#1a1a1a] truncate">
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={12} />
                              {post.views || 0} views
                            </span>
                          </p>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs font-bold rounded-full ${
                            post.status === 'published'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        <Edit size={16} className="text-gray-400" />
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto mb-3 text-gray-300" size={48} />
                    <p className="text-gray-400">No posts yet</p>
                  </div>
                )}
              </div>

              {/* Recent Products */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-[#1a1a1a] flex items-center gap-2">
                    <Package size={20} className="text-[#CC0000]" />
                    Recent Products
                  </h3>
                  <button
                    onClick={() => router.push('/admin/affiliate-links')}
                    className="text-sm font-bold text-[#CC0000] hover:underline"
                  >
                    View All
                  </button>
                </div>
                
                {recentProducts.length > 0 ? (
                  <div className="space-y-4">
                    {recentProducts.map((product: any) => {
                      const productImageUrl = normalizeImageUrl(product.imageUrl);

                      return (
                      <div
                        key={product._id}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                      >
                        {productImageUrl && !brokenRecentProductImages[product._id] ? (
                          <img
                            src={productImageUrl}
                            alt={product.productName}
                            loading="lazy"
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={() => {
                              setBrokenRecentProductImages(prev => ({ ...prev, [product._id]: true }));
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#1a1a1a] truncate">
                            {product.productName}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {product.category} â€¢ {product.price || 'N/A'}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-600">
                              <MousePointer size={12} />
                              {product.clickCount || 0} clicks
                            </span>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                              product.isActive
                                ? 'bg-green-50 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto mb-3 text-gray-300" size={48} />
                    <p className="text-gray-400">No products yet</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

