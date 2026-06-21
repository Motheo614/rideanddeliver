'use client';

import React from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LayoutDashboard, FileText, Package, BarChart3, Settings, Mail, LogOut } from 'lucide-react';

const mobileNavItems = [
  { label: 'Home', href: '/admin', icon: LayoutDashboard },
  { label: 'Posts', href: '/admin/posts', icon: FileText },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Subscribers', href: '/admin/subscribers', icon: Mail },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#CC0000] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {children}
      </div>

      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur px-1.5 py-1.5 sm:px-2 sm:py-2">
        <ul className="grid grid-cols-7 gap-1">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex min-h-14 flex-col items-center justify-center rounded-lg px-0.5 py-1 text-[10px] font-semibold leading-tight transition-colors sm:py-2 sm:text-[11px] ${
                    isActive ? 'text-[#CC0000] bg-red-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={16} />
                  <span className="mt-1 text-center">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-14 w-full flex-col items-center justify-center rounded-lg px-0.5 py-1 text-[10px] font-semibold leading-tight text-red-700 transition-colors hover:bg-red-50 sm:py-2 sm:text-[11px]"
            >
              <LogOut size={16} />
              <span className="mt-1 text-center">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
