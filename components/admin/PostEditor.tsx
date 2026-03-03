'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Save, Eye, Upload, X, ChevronDown, ChevronUp } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';
import '@/app/quill-custom.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface Post {
  _id?: string;
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
}

interface PostEditorProps {
  post?: Post;
  mode: 'create' | 'edit';
}

const categoryOptions = [
  { value: 'safety-gear', label: 'Safety Gear' },
  { value: 'tech-lighting', label: 'Tech & Lighting' },
  { value: 'bike-security', label: 'Bike Security' },
  { value: 'delivery-gear', label: 'Delivery Gear' },
  { value: 'platform-reviews', label: 'Platform Reviews' },
];

const quillModules = {
  toolbar: [
    [{ 'header': [2, 3, false] }],
    ['bold', 'italic'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['blockquote'],
  ],
};

export default function PostEditor({ post, mode }: PostEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [seoCollapsed, setSeoCollapsed] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [imageUrl, setImageUrl] = useState(post?.featuredImage?.url || '');
  const [imageAlt, setImageAlt] = useState(post?.featuredImage?.alt || '');
  const [category, setCategory] = useState(post?.category || '');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(post?.status || 'draft');
  const [featured, setFeatured] = useState(post?.featured || false);
  const [trending, setTrending] = useState(post?.trending || false);
  const [editorsPick, setEditorsPick] = useState(post?.editorsPick || false);
  const [metaTitle, setMetaTitle] = useState(post?.seoMetadata?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(post?.seoMetadata?.metaDescription || '');
  const [keywords, setKeywords] = useState(post?.seoMetadata?.keywords?.join(', ') || '');

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === 'create' && title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  }, [title, mode, slug]);

  // Calculate read time from content
  const calculateReadTime = (text: string) => {
    const strippedText = text.replace(/<[^>]*>/g, '');
    const words = strippedText.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  };

  const readTime = calculateReadTime(content);

  // Handle tag input
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Save post
  const handleSave = async (publishPost: boolean = false) => {
    if (!title || !excerpt || !content || !category) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);

    const postData = {
      title,
      slug,
      excerpt,
      content,
      featuredImage: imageUrl ? { url: imageUrl, alt: imageAlt } : undefined,
      category,
      categoryLabel: categoryOptions.find(c => c.value === category)?.label,
      tags,
      status: publishPost ? 'published' : status,
      publishedAt: publishPost ? new Date().toISOString() : post?.publishedAt,
      readTime,
      featured,
      trending,
      editorsPick,
      seoMetadata: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      },
    };

    try {
      const url = mode === 'create' ? '/api/posts' : `/api/posts/${post?._id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save failed:', response.status, errorData);
        throw new Error(errorData.error || `Failed to save post (${response.status})`);
      }

      const data = await response.json();
      setLastSaved(new Date());
      showToast(
        publishPost ? 'Post published successfully!' : 'Post saved successfully!',
        'success'
      );

      if (mode === 'create' && data.post?._id) {
        router.push(`/admin/posts/${data.post._id}/edit`);
      }
    } catch (error: any) {
      console.error('Error saving post:', error);
      showToast(error?.message || 'Failed to save post', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg text-white font-bold z-50 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setImageUrl(data.url);
      showToast('Image uploaded successfully!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex gap-8">
      {/* LEFT COLUMN - Main Editor */}
      <div className="flex-1" style={{ width: '70%' }}>
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post Title"
          className="w-full text-4xl font-black text-[#1a1a1a] mb-4 border-none outline-none focus:ring-0 p-0"
          autoFocus
        />

        {/* Slug */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="post-url-slug"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
          />
          <p className="text-xs text-gray-500 mt-1">
            ridersection.com/blog/{slug || 'your-post-slug'}
          </p>
        </div>

        {/* Excerpt */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Excerpt <span className="text-gray-400 font-normal">({excerpt.length}/300)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value.slice(0, 300))}
            placeholder="Brief description of your post..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] resize-none"
          />
        </div>

        {/* Rich Text Editor */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <ReactQuill
              value={content}
              onChange={setContent}
              modules={quillModules}
              placeholder="Write your post content here..."
              className="h-[500px]"
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Settings Panel */}
      <div className="w-[30%]">
        <div className="sticky top-8 space-y-4">
          {/* Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Status</h3>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex-1 bg-[#CC0000] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#AA0000] transition-colors disabled:opacity-50"
              >
                Publish
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>

            {lastSaved && (
              <p className="text-xs text-gray-400 mt-2">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Featured Image Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Featured Image</h3>
            
            {imageUrl && (
              <div className="mb-3 relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={imageAlt || 'Featured image preview'}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="mb-3">
              <label 
                htmlFor="imageUpload" 
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <Upload size={18} />
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste image URL"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
            />
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Alt text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
            />
          </div>

          {/* Category & Tags Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Category & Tags</h3>
            
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
            >
              <option value="">Select category</option>
              {categoryOptions.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <div className="mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter or comma)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
              />
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-600">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post Settings Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Post Settings</h3>
            
            <label className="flex items-center justify-between mb-3 cursor-pointer">
              <span className="text-sm text-gray-600">Featured Post</span>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-[#CC0000] border-gray-300 rounded focus:ring-[#CC0000]"
              />
            </label>

            <label className="flex items-center justify-between mb-3 cursor-pointer">
              <span className="text-sm text-gray-600">Trending</span>
              <input
                type="checkbox"
                checked={trending}
                onChange={(e) => setTrending(e.target.checked)}
                className="w-4 h-4 text-[#CC0000] border-gray-300 rounded focus:ring-[#CC0000]"
              />
            </label>

            <label className="flex items-center justify-between mb-3 cursor-pointer">
              <span className="text-sm text-gray-600">Editor's Pick</span>
              <input
                type="checkbox"
                checked={editorsPick}
                onChange={(e) => setEditorsPick(e.target.checked)}
                className="w-4 h-4 text-[#CC0000] border-gray-300 rounded focus:ring-[#CC0000]"
              />
            </label>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">Read Time</span>
              <span className="text-sm font-bold text-gray-900">{readTime} min</span>
            </div>
          </div>

          {/* SEO Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <button
              onClick={() => setSeoCollapsed(!seoCollapsed)}
              className="flex items-center justify-between w-full text-sm font-bold text-gray-700 mb-3"
            >
              SEO Metadata
              {seoCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>

            {!seoCollapsed && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Meta Title ({metaTitle.length}/60)
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))}
                    placeholder={title || 'Meta title'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Meta Description ({metaDescription.length}/160)
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
                    placeholder={excerpt || 'Meta description'}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
