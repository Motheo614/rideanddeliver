'use client';

import React, { useState, useEffect } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { 
  ExternalLink, 
  Copy, 
  Edit, 
  Trash2, 
  Plus, 
  Download, 
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  MousePointer,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { format } from 'date-fns';

interface Product {
  _id: string;
  productName: string;
  asin: string;
  affiliateLink: string;
  category: string;
  price?: string;
  imageUrl?: string;
  rating?: number;
  isActive: boolean;
  clickCount: number;
  commissionRate?: number;
  estimatedEarnings?: number;
  lastClickDate?: Date;
  createdAt: string;
  updatedAt: string;
}

type Message = {
  type: 'success' | 'error';
  text: string;
} | null;

export default function AdminAffiliatePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    asin: '',
    affiliateLink: '',
    category: 'accessories',
    price: '',
    imageUrl: '',
    rating: 0,
    description: '',
    commissionRate: 3,
    isActive: true,
  });

  const categories = [
    'helmets',
    'lights',
    'locks',
    'bags',
    'tools',
    'clothing',
    'accessories',
  ];

  useEffect(() => {
    fetchProducts();
  }, [showInactive]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const normalizeImageUrl = (url?: string) => {
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        includeInactive: showInactive.toString(),
      });
      
      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load products' });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Failed to connect to server' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        imageUrl: normalizeImageUrl(formData.imageUrl),
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Product added successfully!' });
        setShowAddModal(false);
        resetForm();
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add product' });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage({ type: 'error', text: 'Failed to connect to server' });
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const payload = {
        ...formData,
        imageUrl: normalizeImageUrl(formData.imageUrl),
      };

      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Product updated successfully!' });
        setShowEditModal(false);
        setSelectedProduct(null);
        resetForm();
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update product' });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage({ type: 'error', text: 'Failed to connect to server' });
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Product deactivated successfully!' });
        setShowDeleteModal(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete product' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage({ type: 'error', text: 'Failed to connect to server' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Link copied to clipboard!' });
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      asin: '',
      affiliateLink: '',
      category: 'accessories',
      price: '',
      imageUrl: '',
      rating: 0,
      description: '',
      commissionRate: 3,
      isActive: true,
    });
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      productName: product.productName,
      asin: product.asin,
      affiliateLink: product.affiliateLink,
      category: product.category,
      price: product.price || '',
      imageUrl: product.imageUrl || '',
      rating: product.rating || 0,
      description: '',
      commissionRate: product.commissionRate || 3,
      isActive: product.isActive,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const exportToCSV = () => {
    if (!filteredProducts.length) return;

    const csvData = filteredProducts.map(p => ({
      'Product Name': p.productName,
      'ASIN': p.asin,
      'Category': p.category,
      'Price': p.price || 'N/A',
      'Clicks': p.clickCount,
      'Commission Rate': `${p.commissionRate || 3}%`,
      'Estimated Earnings': `$${(p.estimatedEarnings || 0).toFixed(2)}`,
      'Status': p.isActive ? 'Active' : 'Inactive',
      'Affiliate Link': p.affiliateLink,
      'Created': format(new Date(p.createdAt), 'MMM dd, yyyy'),
    }));

    const csvConfig = mkConfig({
      useKeysAsHeaders: true,
      filename: `affiliate-links-${format(new Date(), 'yyyy-MM-dd')}`,
    });

    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
    setMessage({ type: 'success', text: 'Exported successfully!' });
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.asin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate summary stats
  const totalClicks = products.reduce((sum, p) => sum + p.clickCount, 0);
  const totalEarnings = products.reduce((sum, p) => sum + (p.estimatedEarnings || 0), 0);
  const activeProducts = products.filter(p => p.isActive).length;

  return (
    <>
      <AdminTopBar />
      
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a1a1a] mb-2">Affiliate Links</h1>
            <p className="text-gray-400 font-medium">Manage your affiliate products and track performance</p>
          </div>
          
          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3">
            <button
              onClick={exportToCSV}
              disabled={!filteredProducts.length}
              className="w-full sm:w-auto bg-white border border-gray-200 px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-[#1a1a1a] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Export CSV
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto bg-[#CC0000] text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-[#aa0000] transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {message.text}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <ExternalLink size={24} className="text-blue-600" />
            </div>
            <h4 className="text-2xl font-black text-blue-900 mb-1">{products.length}</h4>
            <p className="text-sm text-blue-700 font-medium">Total Products</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <h4 className="text-2xl font-black text-green-900 mb-1">{activeProducts}</h4>
            <p className="text-sm text-green-700 font-medium">Active Products</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <MousePointer size={24} className="text-purple-600" />
            </div>
            <h4 className="text-2xl font-black text-purple-900 mb-1">{totalClicks.toLocaleString()}</h4>
            <p className="text-sm text-purple-700 font-medium">Total Clicks</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <DollarSign size={24} className="text-amber-600" />
            </div>
            <h4 className="text-2xl font-black text-amber-900 mb-1">${totalEarnings.toFixed(2)}</h4>
            <p className="text-sm text-amber-700 font-medium">Est. Earnings</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products, ASIN, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Show Inactive Toggle */}
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${
                showInactive
                  ? 'bg-[#CC0000] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showInactive ? <Eye size={18} /> : <EyeOff size={18} />}
              {showInactive ? 'Showing All' : 'Active Only'}
            </button>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-lg font-medium">Loading products...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ExternalLink className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-gray-400 mb-2">
              {searchQuery || categoryFilter !== 'all' 
                ? 'No products found matching your filters' 
                : 'No affiliate products yet'}
            </p>
            {(searchQuery || categoryFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="text-[#CC0000] text-sm font-medium hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '250px' }}>
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '140px' }}>
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '120px' }}>
                      ASIN
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '100px' }}>
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '100px' }}>
                      Clicks
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '130px' }}>
                      Earnings
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '110px' }}>
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '150px' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr key={product._id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl && !brokenImages[product._id] ? (
                            <img
                              src={normalizeImageUrl(product.imageUrl)}
                              alt={product.productName}
                              loading="lazy"
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={() => {
                                setBrokenImages(prev => ({ ...prev, [product._id]: true }));
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100" />
                          )}
                          <div>
                            <p className="text-sm font-bold text-[#1a1a1a]">{product.productName}</p>
                            {product.rating && (
                              <p className="text-xs text-gray-500">â­ {product.rating.toFixed(1)}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600">{product.asin}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-[#1a1a1a]">{product.price || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MousePointer size={14} className="text-gray-400" />
                          <span className="text-sm font-bold text-[#1a1a1a]">{product.clickCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-green-600">
                            ${(product.estimatedEarnings || 0).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {product.commissionRate || 3}% rate
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          product.isActive 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(product.affiliateLink)}
                            className="p-2 text-gray-600 hover:text-[#CC0000] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy affiliate link"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit product"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deactivate product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black text-[#1a1a1a] mb-6">Add New Product</h2>
              
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ASIN *</label>
                    <input
                      type="text"
                      required
                      value={formData.asin}
                      onChange={(e) => setFormData({ ...formData, asin: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent font-mono"
                      placeholder="B08XXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Affiliate Link *</label>
                  <input
                    type="url"
                    required
                    value={formData.affiliateLink}
                    onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    placeholder="https://amzn.to/..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Price</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                      placeholder="$29.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                      placeholder="4.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Commission %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 3 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                      placeholder="3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#CC0000] text-white rounded-xl text-sm font-bold hover:bg-[#aa0000] transition-colors"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black text-[#1a1a1a] mb-6">Edit Product</h2>
              
              <form onSubmit={handleEditProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ASIN *</label>
                    <input
                      type="text"
                      required
                      value={formData.asin}
                      onChange={(e) => setFormData({ ...formData, asin: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Affiliate Link *</label>
                  <input
                    type="url"
                    required
                    value={formData.affiliateLink}
                    onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Price</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Commission %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 3 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#CC0000] focus:ring-[#CC0000]"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-gray-700">
                    Active Product
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedProduct(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#CC0000] text-white rounded-xl text-sm font-bold hover:bg-[#aa0000] transition-colors"
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#1a1a1a]">Deactivate Product</h2>
                  <p className="text-sm text-gray-500">This action will hide the product from active listings</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">You are about to deactivate:</p>
                <p className="text-sm font-bold text-[#1a1a1a]">{selectedProduct.productName}</p>
                <p className="text-xs text-gray-500 mt-1">ASIN: {selectedProduct.asin}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

