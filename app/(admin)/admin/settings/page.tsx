'use client';

import React, { useState, useEffect } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Shield, Lock, Key, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import Image from 'next/image';

export default function AdminSettingsPage() {
  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(true);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [twoFactorMessage, setTwoFactorMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisable2FA, setShowDisable2FA] = useState(false);

  // Fetch 2FA status on mount
  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa/status');
      const data = await response.json();
      if (response.ok) {
        setTwoFactorEnabled(data.twoFactorEnabled);
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setTwoFactorMessage(null);
    setTwoFactorLoading(true);

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setShowSetup2FA(true);
      } else {
        setTwoFactorMessage({ type: 'error', text: data.error || 'Failed to setup 2FA' });
      }
    } catch (error) {
      setTwoFactorMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorMessage(null);
    setTwoFactorLoading(true);

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setTwoFactorMessage({ type: 'success', text: '2FA enabled successfully!' });
        setTwoFactorEnabled(true);
        setShowSetup2FA(false);
        setVerifyToken('');
        setQrCode('');
        setSecret('');
      } else {
        setTwoFactorMessage({ type: 'error', text: data.error || 'Invalid verification code' });
      }
    } catch (error) {
      setTwoFactorMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorMessage(null);
    setTwoFactorLoading(true);

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setTwoFactorMessage({ type: 'success', text: '2FA disabled successfully' });
        setTwoFactorEnabled(false);
        setShowDisable2FA(false);
        setDisablePassword('');
      } else {
        setTwoFactorMessage({ type: 'error', text: data.error || 'Failed to disable 2FA' });
      }
    } catch (error) {
      setTwoFactorMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return (
    <>
      <AdminTopBar />
      <main className="p-8 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1a1a1a] mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Security Section */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-[#CC0000]" size={28} />
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Security</h2>
            </div>

            {/* Change Password */}
            <div className="mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Lock size={20} className="text-gray-600" />
                <h3 className="text-lg font-bold text-[#1a1a1a]">Change Password</h3>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                    required
                  />
                </div>

                {passwordMessage && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      passwordMessage.type === 'success'
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {passwordMessage.type === 'success' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )}
                    <span className="text-sm">{passwordMessage.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-[#CC0000] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* Two-Factor Authentication */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Smartphone size={20} className="text-gray-600" />
                <h3 className="text-lg font-bold text-[#1a1a1a]">Two-Factor Authentication</h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>

              {twoFactorMessage && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                    twoFactorMessage.type === 'success'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {twoFactorMessage.type === 'success' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <span className="text-sm">{twoFactorMessage.text}</span>
                </div>
              )}

              {!twoFactorLoading && (
                <>
                  {/* Status Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        twoFactorEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  {/* Setup 2FA */}
                  {!twoFactorEnabled && !showSetup2FA && (
                    <button
                      onClick={handleSetup2FA}
                      className="bg-[#CC0000] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Enable 2FA
                    </button>
                  )}

                  {/* Setup Flow */}
                  {showSetup2FA && (
                    <div className="max-w-md border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <h4 className="font-bold text-[#1a1a1a] mb-4">Setup Two-Factor Authentication</h4>
                      
                      <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 mb-6">
                        <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                        <li>Scan the QR code below with your app</li>
                        <li>Enter the 6-digit code to verify</li>
                      </ol>

                      {qrCode && (
                        <div className="mb-4 text-center">
                          <Image
                            src={qrCode}
                            alt="2FA QR Code"
                            width={200}
                            height={200}
                            className="mx-auto border-2 border-gray-300 rounded-lg"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Secret: <code className="bg-white px-2 py-1 rounded">{secret}</code>
                          </p>
                        </div>
                      )}

                      <form onSubmit={handleVerify2FA} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                          </label>
                          <input
                            type="text"
                            value={verifyToken}
                            onChange={(e) => setVerifyToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CC0000] focus:border-transparent text-center text-2xl tracking-widest font-mono"
                            required
                            maxLength={6}
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={twoFactorLoading || verifyToken.length !== 6}
                            className="flex-1 bg-[#CC0000] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {twoFactorLoading ? 'Verifying...' : 'Verify & Enable'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSetup2FA(false);
                              setVerifyToken('');
                              setQrCode('');
                              setSecret('');
                            }}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Disable 2FA */}
                  {twoFactorEnabled && !showDisable2FA && (
                    <button
                      onClick={() => setShowDisable2FA(true)}
                      className="border-2 border-red-200 text-red-700 px-6 py-2.5 rounded-lg font-medium hover:bg-red-50 transition-colors"
                    >
                      Disable 2FA
                    </button>
                  )}

                  {/* Disable Flow */}
                  {showDisable2FA && (
                    <div className="max-w-md border border-red-200 rounded-lg p-6 bg-red-50">
                      <h4 className="font-bold text-red-900 mb-4">Disable Two-Factor Authentication</h4>
                      <p className="text-sm text-red-700 mb-4">
                        Enter your password to confirm disabling 2FA. This will make your account less secure.
                      </p>

                      <form onSubmit={handleDisable2FA} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-red-900 mb-2">
                            Password
                          </label>
                          <input
                            type="password"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={twoFactorLoading}
                            className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {twoFactorLoading ? 'Disabling...' : 'Disable 2FA'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowDisable2FA(false);
                              setDisablePassword('');
                            }}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

