'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Mail, Download, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Subscriber {
  _id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  source: string;
  subscribedAt?: string;
  unsubscribedAt?: string;
  createdAt: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/admin/subscribers');
      const data = await response.json();

      if (response.ok) {
        setSubscribers(data.subscribers || []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load subscribers' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load subscribers' });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((subscriber) => {
      const matchesQuery = subscriber.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : subscriber.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [subscribers, searchQuery, statusFilter]);

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    params.set('format', 'csv');

    window.open(`/api/admin/subscribers?${params.toString()}`, '_blank');
    setMessage({ type: 'success', text: 'CSV export started.' });
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <AdminTopBar />
      <main className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Mail className="text-[#CC0000]" size={34} />
            <h1 className="text-4xl font-black text-[#1a1a1a]">Subscribers</h1>
          </div>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-bold hover:bg-[#CC0000] transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'unsubscribed')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#CC0000] mx-auto mb-4"></div>
              Loading subscribers...
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No subscribers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Source</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Subscribed</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber._id}
                      className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 font-medium text-[#1a1a1a]">{subscriber.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(subscriber.status)}`}>
                          {subscriber.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{subscriber.source || 'website'}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {subscriber.subscribedAt ? formatDate(subscriber.subscribedAt) : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{formatDate(subscriber.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredSubscribers.length} of {subscribers.length} subscribers
        </div>
      </main>
    </>
  );
}
