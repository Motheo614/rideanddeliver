'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Plus, Search, Edit, Trash2, Eye, Calendar, ArrowRight } from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  category: string;
  categoryLabel?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  views: number;
  createdAt: string;
}

const POSTS_PER_PAGE = 20;

const statusColors = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-gray-100 text-gray-800',
};

const categoryColors: Record<string, string> = {
  'safety-gear': 'bg-blue-100 text-blue-800',
  'tech-lighting': 'bg-purple-100 text-purple-800',
  'bike-security': 'bg-red-100 text-red-800',
  'delivery-gear': 'bg-orange-100 text-orange-800',
  'platform-reviews': 'bg-indigo-100 text-indigo-800',
};

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch posts on mount
  React.useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts?status=all&limit=1000');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((post) => post.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [posts, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handleDelete = async (post: Post) => {
    if (!confirm(`Are you sure you want to archive "${post.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        fetchPosts(); // Refresh posts list
      } else {
        alert('Failed to archive post');
      }
    } catch (error) {
      console.error('Error archiving post:', error);
      alert('Failed to archive post');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status counts for tabs
  const statusCounts = {
    all: posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    draft: posts.filter((p) => p.status === 'draft').length,
    archived: posts.filter((p) => p.status === 'archived').length,
  };

  return (
    <>
      <AdminTopBar />

      <main className="p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#1a1a1a] mb-2">Blog Posts</h1>
            <p className="text-gray-400 font-medium">
              Manage your blog content and articles
            </p>
          </div>

          <Link
            href="/admin/posts/new"
            className="bg-[#CC0000] text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-[#AA0000] transition-colors shadow-sm"
          >
            <Plus size={18} />
            New Post
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  statusFilter === status
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search posts by title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#CC0000] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && posts.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-[#1a1a1a] mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first blog post to get started with your content strategy.
              </p>
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center gap-2 bg-[#CC0000] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#AA0000] transition-colors"
              >
                Create First Post
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && filteredPosts.length === 0 && posts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-600">
              No posts found matching your filters. Try adjusting your search or filters.
            </p>
          </div>
        )}

        {/* Posts Table */}
        {!loading && paginatedPosts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedPosts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {/* Thumbnail */}
                          <div className="w-[60px] h-[40px] bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {post.featuredImage?.url ? (
                              <Image
                                src={post.featuredImage.url}
                                alt={post.featuredImage.alt || post.title}
                                width={60}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Edit size={16} className="text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Title */}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/posts/${post._id}/edit`}
                              className="font-bold text-[#1a1a1a] hover:text-[#CC0000] transition-colors block truncate"
                            >
                              {post.title}
                            </Link>
                            <p className="text-sm text-gray-500 truncate">/{post.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            categoryColors[post.category] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {post.categoryLabel || post.category}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            statusColors[post.status]
                          }`}
                        >
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(post.publishedAt)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Eye size={14} className="text-gray-400" />
                          {post.views.toLocaleString()}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/posts/${post._id}/edit`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit post"
                          >
                            <Edit size={16} className="text-gray-600" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Archive post"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + POSTS_PER_PAGE, filteredPosts.length)} of{' '}
                  {filteredPosts.length} posts
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-sm font-bold text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
