'use client';

import React, { useState, useEffect } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import PostEditor from '@/components/admin/PostEditor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  category: string;
  categoryLabel?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  views: number;
  readTime?: number;
  featured: boolean;
  trending: boolean;
  editorsPick: boolean;
  seoMetadata?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  cta?: {
    enabled: boolean;
    title?: string;
    description?: string;
    primaryHref?: string;
    primaryLabel?: string;
    secondaryHref?: string;
    secondaryLabel?: string;
  };
}

export default function EditPostPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}?raw=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const data = await response.json();
      setPost(data.post);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminTopBar />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#CC0000] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading post...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <AdminTopBar />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Post not found'}</p>
            <Link
              href="/admin/posts"
              className="text-[#CC0000] hover:underline"
            >
              Back to Posts
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminTopBar />
      
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <Link 
            href="/admin/posts" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#CC0000] transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Back to Posts
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a1a1a]">Edit Post</h1>
        </div>

        <PostEditor post={post} mode="edit" />
      </main>
    </>
  );
}
