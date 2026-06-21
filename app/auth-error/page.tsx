'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, Home, LogIn } from 'lucide-react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL.';
      case 'OAuthCallback':
        return 'Error in handling the response from an OAuth provider.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth provider user in the database.';
      case 'EmailCreateAccount':
        return 'Could not create email provider user in the database.';
      case 'Callback':
        return 'Error in the OAuth callback handler route.';
      case 'OAuthAccountNotLinked':
        return 'The email on the account is already linked, but not with this OAuth account.';
      case 'EmailSignin':
        return 'Sending the e-mail with the verification token failed.';
      case 'CredentialsSignin':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An authentication error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/Assets/Logo.png"
              alt="Rider Complex Logo"
              width={400}
              height={120}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Error Message */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            
            <h1 className="text-2xl font-black text-[#1a1a1a] mb-3">
              Authentication Error
            </h1>
            
            <p className="text-gray-600 mb-8">
              {getErrorMessage(error)}
            </p>

            {error === 'CredentialsSignin' && (
              <p className="text-sm text-gray-500 mb-8">
                If you continue to experience issues, please contact support.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center gap-2 bg-[#CC0000] text-white rounded-lg px-6 py-3 font-bold hover:bg-[#990000] transition-colors"
              >
                <LogIn size={18} />
                Try Again
              </Link>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-[#1a1a1a] rounded-lg px-6 py-3 font-bold hover:bg-gray-200 transition-colors"
              >
                <Home size={18} />
                Go Home
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link href="/contact" className="text-[#CC0000] font-semibold hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/Assets/Logo.png"
                alt="Rider Complex Logo"
                width={400}
                height={120}
                className="object-contain"
              />
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <AlertCircle size={32} className="text-gray-400" />
              </div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
