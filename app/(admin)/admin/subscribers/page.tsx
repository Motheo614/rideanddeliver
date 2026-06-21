'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Mail, Download, Search, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Subscriber {
  _id: string;
  email: string;
  status: 'pending' | 'active' | 'unsubscribed';
  isVerified?: boolean;
  verifiedAt?: string;
  source: string;
  subscribedAt?: string;
  unsubscribedAt?: string;
  createdAt: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'unsubscribed'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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

  const filteredSubscriberIds = useMemo(
    () => filteredSubscribers.map((subscriber) => subscriber._id),
    [filteredSubscribers]
  );

  const allFilteredSelected = filteredSubscriberIds.length > 0
    && filteredSubscriberIds.every((id) => selectedIds.has(id));

  useEffect(() => {
    const validSubscriberIds = new Set(subscribers.map((subscriber) => subscriber._id));

    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => validSubscriberIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [subscribers]);

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    params.set('format', 'csv');

    window.open(`/api/admin/subscribers?${params.toString()}`, '_blank');
    setMessage({ type: 'success', text: 'CSV export started.' });
  };

  const openDeleteModal = (subscriber: Subscriber) => {
    setDeleteTarget(subscriber);
    setIsBulkDeleteModalOpen(false);
    setDeleteConfirmText('');
    setMessage(null);
  };

  const openBulkDeleteModal = () => {
    if (selectedIds.size === 0) {
      return;
    }

    setDeleteTarget(null);
    setIsBulkDeleteModalOpen(true);
    setDeleteConfirmText('');
    setMessage(null);
  };

  const closeDeleteModal = () => {
    if (deletingId || isBulkDeleting) {
      return;
    }

    setDeleteTarget(null);
    setIsBulkDeleteModalOpen(false);
    setDeleteConfirmText('');
  };

  const handleDeleteSubscriber = async () => {
    const isSingleDelete = Boolean(deleteTarget);
    const idsToDelete = isSingleDelete ? [deleteTarget!._id] : Array.from(selectedIds);

    if (idsToDelete.length === 0) {
      return;
    }

    if (deleteConfirmText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Type DELETE to confirm removal.' });
      return;
    }

    if (isSingleDelete) {
      setDeletingId(deleteTarget!._id);
    } else {
      setIsBulkDeleting(true);
    }
    setMessage(null);

    try {
      const response = isSingleDelete
        ? await fetch(`/api/admin/subscribers?id=${encodeURIComponent(idsToDelete[0])}`, {
            method: 'DELETE',
          })
        : await fetch('/api/admin/subscribers', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: idsToDelete }),
          });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to delete subscriber' });
        return;
      }

      const idsToDeleteSet = new Set(idsToDelete);
      setSubscribers((prev) => prev.filter((item) => !idsToDeleteSet.has(item._id)));
      setSelectedIds((prev) => {
        const next = new Set([...prev].filter((id) => !idsToDeleteSet.has(id)));
        return next;
      });
      setMessage({
        type: 'success',
        text: isSingleDelete
          ? `Deleted ${deleteTarget!.email}`
          : `Deleted ${idsToDelete.length} subscribers`,
      });
      setDeleteTarget(null);
      setIsBulkDeleteModalOpen(false);
      setDeleteConfirmText('');
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete subscriber' });
    } finally {
      setDeletingId(null);
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectSubscriber = (subscriberId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(subscriberId)) {
        next.delete(subscriberId);
      } else {
        next.add(subscriberId);
      }
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (allFilteredSelected) {
        filteredSubscriberIds.forEach((id) => next.delete(id));
      } else {
        filteredSubscriberIds.forEach((id) => next.add(id));
      }

      return next;
    });
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'pending') return 'bg-amber-100 text-amber-800';
    if (status === 'active') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-700';
  };

  const getVerificationBadgeClass = (isVerified: boolean) => {
    return isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
  };

  return (
    <>
      <AdminTopBar />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-3">
            <Mail className="text-[#CC0000]" size={28} />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a1a1a]">Subscribers</h1>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {selectedIds.size > 0 && (
              <button
                onClick={openBulkDeleteModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#CC0000] text-white px-5 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                Delete Selected ({selectedIds.size})
              </button>
            )}
            <button
              onClick={handleExportCsv}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-bold hover:bg-[#CC0000] transition-colors"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'active' | 'unsubscribed')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Verification</option>
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
                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAllFiltered}
                        aria-label="Select all filtered subscribers"
                        className="h-4 w-4 rounded border-gray-300 text-[#CC0000] focus:ring-[#CC0000]"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Verified</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Source</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Subscribed</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber._id}
                      className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(subscriber._id)}
                          onChange={() => toggleSelectSubscriber(subscriber._id)}
                          aria-label={`Select ${subscriber.email}`}
                          className="h-4 w-4 rounded border-gray-300 text-[#CC0000] focus:ring-[#CC0000]"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-[#1a1a1a]">{subscriber.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(subscriber.status)}`}>
                          {subscriber.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getVerificationBadgeClass(Boolean(subscriber.isVerified))}`}>
                          {subscriber.isVerified ? 'verified' : 'unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{subscriber.source || 'website'}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {subscriber.subscribedAt ? formatDate(subscriber.subscribedAt) : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{formatDate(subscriber.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openDeleteModal(subscriber)}
                          disabled={deletingId === subscriber._id || isBulkDeleting}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </td>
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

      {(deleteTarget || isBulkDeleteModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-black text-[#1a1a1a]">
              {deleteTarget ? 'Delete Subscriber' : 'Bulk Delete Subscribers'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This action cannot be undone. Type <span className="font-bold text-[#1a1a1a]">DELETE</span> to remove
              {deleteTarget ? (
                <span className="font-bold text-[#1a1a1a]"> {deleteTarget.email}</span>
              ) : (
                <span className="font-bold text-[#1a1a1a]"> {selectedIds.size} selected subscribers</span>
              )}
              .
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#CC0000]"
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={Boolean(deletingId) || isBulkDeleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubscriber}
                disabled={deleteConfirmText !== 'DELETE' || Boolean(deletingId) || isBulkDeleting}
                className="rounded-lg bg-[#CC0000] px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(Boolean(deletingId) || isBulkDeleting) ? 'Deleting...' : deleteTarget ? 'Delete Subscriber' : 'Delete Subscribers'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

