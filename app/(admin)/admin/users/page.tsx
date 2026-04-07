'use client';

import React, { useState, useEffect } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Users, UserPlus, Trash2, X, Shield, Edit, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add user form state
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'viewer' as 'admin' | 'editor' | 'viewer',
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
        console.log('Loaded users:', data.users?.length || 0);
      } else {
        console.error('Failed to load users:', data.error);
        setMessage({ type: 'error', text: data.error || 'Failed to load users' });
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to connect to server' });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setAddLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'User created successfully' });
        setShowAddModal(false);
        setNewUser({ email: '', name: '', password: '', role: 'viewer' });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setMessage(null);
    setAddLoading(true);

    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully' });
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setAddLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AdminTopBar />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="text-[#CC0000]" size={30} />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a1a1a]">Users</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#CC0000] text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            <UserPlus size={20} />
            Add User
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or role..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#CC0000] mx-auto mb-4"></div>
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              {searchQuery ? (
                <>
                  <div className="text-gray-400 mb-2">No users found matching your search</div>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[#CC0000] text-sm font-medium hover:underline"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <Users className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-400 mb-2">No users in the database yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Create your first user by running: <code className="bg-gray-100 px-2 py-1 rounded">npm run create-admin</code>
                  </p>
                  <p className="text-xs text-gray-400">
                    Or click "Add User" above to create a user through the interface
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '200px' }}>
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '220px' }}>
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '100px' }}>
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '100px' }}>
                      2FA
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '140px' }}>
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap" style={{ minWidth: '110px' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-[#CC0000] font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-[#1a1a1a]">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role === 'admin' && <Shield size={12} />}
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            user.twoFactorEnabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                        >
                          <Trash2 size={16} />
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

        {/* User count */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setNewUser({ email: '', name: '', password: '', role: 'viewer' });
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <UserPlus className="text-[#CC0000]" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Add New User</h2>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                  required
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Admin: Full access | Editor: Edit content | Viewer: Read-only
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 bg-[#CC0000] text-white px-4 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addLoading ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewUser({ email: '', name: '', password: '', role: 'viewer' });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Delete User</h2>
            </div>

            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Email: {selectedUser.email}
            </p>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-6">
              âš ï¸ This action cannot be undone. All user data will be permanently deleted.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteUser}
                disabled={addLoading}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addLoading ? 'Deleting...' : 'Delete User'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

