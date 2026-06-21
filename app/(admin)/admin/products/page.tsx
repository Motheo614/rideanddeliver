'use client';

import React, { useState, useEffect } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Plus, Edit2, Trash2, X, Star } from 'lucide-react';

interface Product {
  _id: string;
  productName: string;
  asin: string;
  affiliateLink: string;
  category: string;
  price: string;
  imageUrl: string;
  rating: number;
  awardLabel?: string;
  score?: number;
  reviewCount?: number;
  stars?: number;
  description: string;
  pros: string[];
  cons: string[];
  specs?: Array<{ label: string; value: string }>;
  editorNote?: string;
  jumpTargetId?: string;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
}

const categoryOptions = [
  { value: 'helmets', label: 'Safety Gear' },
  { value: 'lights', label: 'Tech & Lighting' },
  { value: 'locks', label: 'Bike Security' },
  { value: 'bags', label: 'Delivery Gear' },
];

const normalizeUiCategory = (category: string) => {
  if (['bags', 'tools', 'clothing', 'accessories'].includes(category)) {
    return 'bags';
  }

  return category;
};

const getCategoryLabel = (category: string) => {
  return categoryOptions.find(c => c.value === normalizeUiCategory(category))?.label || category;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [previewImageBroken, setPreviewImageBroken] = useState(false);

  const buildJumpTargetId = (value: string) => {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    asin: '',
    affiliateLink: '',
    category: '',
    price: '',
    imageUrl: '',
    rating: 5,
    awardLabel: '',
    score: '',
    reviewCount: '',
    description: '',
    pros: [''],
    cons: [''],
    jumpTargetId: '',
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => normalizeUiCategory(p.category) === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.asin.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      productName: '',
      asin: '',
      affiliateLink: '',
      category: '',
      price: '',
      imageUrl: '',
      rating: 5,
      awardLabel: '',
      score: '',
      reviewCount: '',
      description: '',
      pros: [''],
      cons: [''],
      jumpTargetId: '',
      isActive: true,
    });
    setFormErrors({});
    setPreviewImageBroken(false);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      asin: product.asin,
      affiliateLink: product.affiliateLink,
      category: normalizeUiCategory(product.category),
      price: product.price,
      imageUrl: product.imageUrl,
      rating: product.rating,
      awardLabel: product.awardLabel || '',
      score: typeof product.score === 'number' ? String(product.score) : '',
      reviewCount: typeof product.reviewCount === 'number' ? String(product.reviewCount) : '',
      description: product.description,
      pros: product.pros.length > 0 ? product.pros : [''],
      cons: product.cons.length > 0 ? product.cons : [''],
      jumpTargetId: product.jumpTargetId || buildJumpTargetId(product.productName),
      isActive: product.isActive,
    });
    setFormErrors({});
    setPreviewImageBroken(false);
    setShowModal(true);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.productName.trim()) {
      errors.productName = 'Product name is required';
    }

    if (!formData.asin.trim()) {
      errors.asin = 'ASIN is required';
    } else if (!/^[A-Z0-9]{10}$/.test(formData.asin)) {
      errors.asin = 'ASIN must be 10 alphanumeric characters';
    }

    if (!formData.affiliateLink.trim()) {
      errors.affiliateLink = 'Affiliate link is required';
    } else if (!/^https?:\/\/.+/.test(formData.affiliateLink)) {
      errors.affiliateLink = 'Must be a valid URL';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (formData.score !== '') {
      const scoreValue = Number(formData.score);
      if (!Number.isFinite(scoreValue) || scoreValue < 0 || scoreValue > 10) {
        errors.score = 'Score must be between 0 and 10';
      }
    }

    if (formData.reviewCount !== '') {
      const reviewCountValue = Number(formData.reviewCount);
      if (!Number.isFinite(reviewCountValue) || reviewCountValue < 0 || !Number.isInteger(reviewCountValue)) {
        errors.reviewCount = 'Review count must be a whole number >= 0';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const normalizeImageUrl = (url: string) => {
    const trimmed = (url || '').trim();

    if (!trimmed) {
      return '';
    }

    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }

    if (trimmed.startsWith('http://')) {
      return `https://${trimmed.slice('http://'.length)}`;
    }

    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const productData = {
      ...formData,
      asin: formData.asin.toUpperCase(),
      imageUrl: normalizeImageUrl(formData.imageUrl),
      awardLabel: formData.awardLabel.trim(),
      score: formData.score === '' ? undefined : Number(formData.score),
      reviewCount: formData.reviewCount === '' ? undefined : Number(formData.reviewCount),
      pros: formData.pros.filter(p => p.trim()),
      cons: formData.cons.filter(c => c.trim()),
      jumpTargetId: (formData.jumpTargetId || buildJumpTargetId(formData.productName)).trim(),
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        showToast(editingProduct ? 'Product updated!' : 'Product added!', 'success');
        setShowModal(false);
        fetchProducts();
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Failed to save product', 'error');
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Product deleted', 'success');
        setDeleteConfirm(null);
        fetchProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Failed to delete product', 'error');
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, isActive: !product.isActive }),
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProductNameBlur = () => {
    if (!String(formData.jumpTargetId || '').trim()) {
      updateFormField('jumpTargetId', buildJumpTargetId(formData.productName));
    }
  };

  const addListItem = (field: 'pros' | 'cons') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const updateListItem = (field: 'pros' | 'cons', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeListItem = (field: 'pros' | 'cons', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const renderStarSelector = (rating: number, onSelect: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onSelect(star)}
            className="hover:scale-110 transition-transform"
          >
            <Star
              size={24}
              className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <AdminTopBar />

      <main className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a1a1a]">Affiliate Products</h1>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto bg-[#CC0000] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#AA0000] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or ASIN..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] sm:min-w-[200px]"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#CC0000] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">No products found</p>
            <button
              onClick={openAddModal}
              className="text-[#CC0000] hover:underline font-bold"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="bg-white h-[120px] flex items-center justify-center p-4 border-b border-gray-100">
                  {product.imageUrl && !brokenImages[product._id] ? (
                    <img
                      src={normalizeImageUrl(product.imageUrl)}
                      alt={product.productName}
                      loading="lazy"
                      className="max-h-[120px] max-w-[120px] object-contain"
                      onError={() => {
                        setBrokenImages(prev => ({ ...prev, [product._id]: true }));
                      }}
                    />
                  ) : (
                    <div className="w-[120px] h-[120px] bg-gray-100 flex items-center justify-center rounded">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-[#1a1a1a] mb-2 line-clamp-2">{product.productName}</h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {getCategoryLabel(product.category)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-black text-[#CC0000]">{product.price}</span>
                    {renderStars(product.rating)}
                  </div>

                  <p className="text-sm text-gray-500 mb-3">{product.clickCount} clicks</p>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Status:</span>
                    <button
                      onClick={() => toggleProductStatus(product)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        product.isActive ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          product.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product._id)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#1a1a1a]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => updateFormField('productName', e.target.value)}
                    onBlur={handleProductNameBlur}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${
                      formErrors.productName ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter product name"
                  />
                  {formErrors.productName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.productName}</p>
                  )}
                </div>

                {/* ASIN */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ASIN * <span className="text-gray-400 font-normal">(10 alphanumeric characters)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.asin}
                    onChange={(e) => updateFormField('asin', e.target.value.toUpperCase())}
                    maxLength={10}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] uppercase ${
                      formErrors.asin ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="B08XYZ1234"
                  />
                  {formErrors.asin && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.asin}</p>
                  )}
                </div>

                {/* Affiliate Link */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Affiliate Link *
                  </label>
                  <input
                    type="url"
                    value={formData.affiliateLink}
                    onChange={(e) => updateFormField('affiliateLink', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${
                      formErrors.affiliateLink ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="https://amazon.com/..."
                  />
                  {formErrors.affiliateLink && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.affiliateLink}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => updateFormField('category', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${
                        formErrors.category ? 'border-red-500' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categoryOptions.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => updateFormField('price', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                      placeholder="$29.99"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setPreviewImageBroken(false);
                      updateFormField('imageUrl', e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                    placeholder="https://..."
                  />
                  {formData.imageUrl && !previewImageBroken && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                      <img
                        src={normalizeImageUrl(formData.imageUrl)}
                        alt="Preview"
                        className="object-contain max-h-[120px] max-w-[120px]"
                        onError={() => setPreviewImageBroken(true)}
                      />
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Rating
                  </label>
                  {renderStarSelector(formData.rating, (rating) => updateFormField('rating', rating))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Award Label
                    </label>
                    <input
                      type="text"
                      value={formData.awardLabel}
                      onChange={(e) => updateFormField('awardLabel', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                      placeholder="e.g. Best Overall, Best Budget, Most Versatile"
                    />
                    <p className="text-xs text-gray-500 mt-1">Shows as the badge on the product card</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Score
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step="0.1"
                      value={formData.score}
                      onChange={(e) => updateFormField('score', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${
                        formErrors.score ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="e.g. 9.2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your editorial score out of 10</p>
                    {formErrors.score && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.score}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Review Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={formData.reviewCount}
                      onChange={(e) => updateFormField('reviewCount', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] ${
                        formErrors.reviewCount ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="e.g. 214"
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of customer reviews to display</p>
                    {formErrors.reviewCount && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.reviewCount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Jump Target ID
                    </label>
                    <input
                      type="text"
                      value={formData.jumpTargetId}
                      onChange={(e) => updateFormField('jumpTargetId', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                      placeholder="e.g. joe-rocket-eclipse-gloves"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used for anchor links from comparison cards to this product's review section
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormField('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] resize-none"
                    placeholder="Brief product description..."
                  />
                </div>

                {/* Pros */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Pros
                  </label>
                  <div className="space-y-2">
                    {formData.pros.map((pro, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={pro}
                          onChange={(e) => updateListItem('pros', index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                          placeholder="Enter a pro"
                        />
                        {formData.pros.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeListItem('pros', index)}
                            className="text-red-600 hover:bg-red-50 px-3 rounded-lg transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addListItem('pros')}
                      className="text-[#CC0000] hover:bg-red-50 px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add Pro
                    </button>
                  </div>
                </div>

                {/* Cons */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Cons
                  </label>
                  <div className="space-y-2">
                    {formData.cons.map((con, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={con}
                          onChange={(e) => updateListItem('cons', index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]"
                          placeholder="Enter a con"
                        />
                        {formData.cons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeListItem('cons', index)}
                            className="text-red-600 hover:bg-red-50 px-3 rounded-lg transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addListItem('cons')}
                      className="text-[#CC0000] hover:bg-red-50 px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add Con
                    </button>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold text-gray-700">Active Product</span>
                  <button
                    type="button"
                    onClick={() => updateFormField('isActive', !formData.isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isActive ? 'bg-[#CC0000]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#CC0000] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#AA0000] transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-black text-[#1a1a1a] mb-2">Delete Product?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

