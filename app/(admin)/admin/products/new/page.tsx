'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg text-white font-bold z-50 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle product creation here
    console.log({ name, category, price, stock, description, affiliateLink, imageUrl });
  };

  return (
    <>
      <AdminTopBar />
      
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Link 
            href="/admin/products" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#CC0000] transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            Back to Products
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a1a1a]">Add New Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 max-w-4xl">
          <div className="space-y-6">
            {/* Product Image Upload */}
            <div>
              <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                Product Image
              </label>
              
              {imageUrl ? (
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <Image
                    src={imageUrl}
                    alt="Product preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label 
                  htmlFor="productImageUpload"
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#CC0000] transition-colors cursor-pointer block"
                >
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG or WEBP (max. 5MB)</p>
                </label>
              )}
              
              <input
                id="productImageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-bold text-[#1a1a1a] mb-2">
                Product Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-bold text-[#1a1a1a] mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="equipment">Equipment</option>
                  <option value="safety">Safety</option>
                  <option value="tech">Tech</option>
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-bold text-[#1a1a1a] mb-2">
                  Price
                </label>
                <input
                  id="price"
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                  placeholder="$0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-bold text-[#1a1a1a] mb-2">
                Stock Quantity
              </label>
              <input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold text-[#1a1a1a] mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                placeholder="Describe the product features and benefits..."
                required
              />
            </div>

            <div>
              <label htmlFor="affiliateLink" className="block text-sm font-bold text-[#1a1a1a] mb-2">
                Affiliate Link
              </label>
              <input
                id="affiliateLink"
                type="url"
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                placeholder="https://affiliate-link.com/product"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-[#CC0000] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#AA0000] transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Add Product
              </button>
              <Link
                href="/admin/products"
                className="bg-gray-100 text-[#1a1a1a] px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}

