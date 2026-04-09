'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  FileText, 
  Link as LinkIcon, 
  Users, 
  Settings, 
  LogOut,
  Package,
  BarChart3,
  Mail
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Posts', href: '/admin/posts', icon: FileText },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Affiliate Links', href: '/admin/affiliate-links', icon: LinkIcon },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Subscribers', href: '/admin/subscribers', icon: Mail },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <aside className="w-64 bg-black border-r border-gray-800 flex flex-col h-[100svh] sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center justify-center">
          <Image 
            src="/Assets/LogoBlack.png"
            alt="Rider Complex Logo"
            width={180}
            height={32}
            className="h-7 w-auto object-contain xl:h-8 2xl:h-9"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-white text-[#1a1a1a] shadow-lg' 
                  : 'text-white hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.label}
              </div>
              {isActive && <span className="w-1 h-1 rounded-full bg-[#1a1a1a]"></span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-900 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-[#CC0000] font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">info@ridercomplex.com</p>
            </div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-950 rounded-lg w-full transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
