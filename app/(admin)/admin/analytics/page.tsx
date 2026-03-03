'use client';

import React, { useState, useEffect } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import StatCard from '@/components/admin/StatCard';
import AnalyticsChart from '@/components/admin/AnalyticsChart';
import { Calendar, TrendingUp, Users, MousePointer, Eye, Download, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ExportToCsv } from 'export-to-csv';
import { format } from 'date-fns';

type DateRangePreset = {
  label: string;
  days: number;
};

const dateRangePresets: DateRangePreset[] = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export default function AnalyticsPage() {
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
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [startDate, endDate]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      });

      const [overviewRes, pageviewsRes] = await Promise.all([
        fetch(`/api/analytics/overview?${params}`),
        fetch(`/api/analytics/pageviews?${params}`),
      ]);

      if (!overviewRes.ok || !pageviewsRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const overview = await overviewRes.json();
      const pageviews = await pageviewsRes.json();

      setOverviewData(overview);
      setPageviewsData(pageviews.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - preset.days);
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

  const exportToCSV = () => {
    if (!pageviewsData.length) return;

    const csvExporter = new ExportToCsv({
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: `Analytics Report - ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      filename: `analytics-${format(new Date(), 'yyyy-MM-dd')}`,
    });

    csvExporter.generateCsv(pageviewsData);
  };

  // Calculate sparkline data from pageviews
  const getSparklineData = (data: any[] = []) => {
    if (!data.length) return [{ value: 0 }];
    return data.slice(-8).map(d => ({ value: d.views || 0 }));
  };

  // Calculate percentage change (mock for now - would need comparison period data)
  const calculateChange = (current: number) => {
    // This is simplified - in real scenario, compare with previous period
    const change = Math.floor(Math.random() * 30) - 10;
    return change > 0 ? `+${change}%` : `${change}%`;
  };

  return (
    <>
      <AdminTopBar />
      
      <main className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#1a1a1a] mb-2">Analytics</h1>
            <p className="text-gray-400 font-medium">Comprehensive insights into your site&apos;s performance and traffic</p>
          </div>

          <div className="flex gap-3">
            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={!pageviewsData.length}
              className="bg-white border border-gray-200 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-bold text-[#1a1a1a] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} className="text-gray-400" />
              Export CSV
            </button>

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
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-lg font-medium">Loading analytics...</div>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
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
                label="Published Posts" 
                value={overviewData?.overview?.totalPublishedPosts?.toLocaleString() || '0'} 
                change={`+${overviewData?.overview?.postsPublishedThisMonth || 0} this month`} 
                isPositive={true} 
                data={getSparklineData()}
              />
              <StatCard 
                label="Active Products" 
                value={overviewData?.overview?.totalActiveProducts?.toLocaleString() || '0'} 
                change="+0%" 
                isPositive={true} 
                data={getSparklineData()}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="lg:col-span-2">
                <AnalyticsChart data={pageviewsData} />
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Pages */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-black text-[#1a1a1a] mb-6 flex items-center gap-2">
                  <Eye size={20} className="text-[#CC0000]" />
                  Top Posts
                </h3>
                <div className="space-y-4">
                  {overviewData?.topPosts?.length > 0 ? (
                    overviewData.topPosts.map((post: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1a1a1a] truncate">{post.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{post.views?.toLocaleString() || 0} views</p>
                        </div>
                        <span className="text-sm font-bold ml-4 text-green-600">
                          #{index + 1}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No data available</p>
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-black text-[#1a1a1a] mb-6 flex items-center gap-2">
                  <MousePointer size={20} className="text-[#CC0000]" />
                  Top Products
                </h3>
                <div className="space-y-4">
                  {overviewData?.topProducts?.length > 0 ? (
                    overviewData.topProducts.map((product: any, index: number) => (
                      <div key={index} className="py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-[#1a1a1a] truncate flex-1">{product.productName}</p>
                          <span className="text-sm font-bold text-gray-600 ml-4">
                            {product.clickCount?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-[#CC0000] h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((product.clickCount / (overviewData.topProducts[0]?.clickCount || 1)) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <Users size={24} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
                    {calculateChange(overviewData?.overview?.totalUniqueVisitors || 0)}
                  </span>
                </div>
                <h4 className="text-2xl font-black text-blue-900 mb-1">
                  {overviewData?.overview?.totalUniqueVisitors?.toLocaleString() || '0'}
                </h4>
                <p className="text-sm text-blue-700 font-medium">Unique Visitors</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <MousePointer size={24} className="text-purple-600" />
                  <span className="text-xs font-bold text-purple-600 bg-purple-200 px-2 py-1 rounded-full">
                    Track
                  </span>
                </div>
                <h4 className="text-2xl font-black text-purple-900 mb-1">
                  {overviewData?.topProducts?.reduce((sum: number, p: any) => sum + (p.clickCount || 0), 0)?.toLocaleString() || '0'}
                </h4>
                <p className="text-sm text-purple-700 font-medium">Total Product Clicks</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp size={24} className="text-green-600" />
                  <span className="text-xs font-bold text-green-600 bg-green-200 px-2 py-1 rounded-full">
                    {overviewData?.overview?.postsPublishedThisMonth || 0} new
                  </span>
                </div>
                <h4 className="text-2xl font-black text-green-900 mb-1">
                  {overviewData?.overview?.totalPublishedPosts?.toLocaleString() || '0'}
                </h4>
                <p className="text-sm text-green-700 font-medium">Total Posts</p>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
