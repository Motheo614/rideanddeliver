'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Safety Gear', href: '/bike-delivery-rider-gear/' },
  { label: 'Tech & Lighting', href: '/bike-delivery-tech-and-visibility/' },
  { label: 'Bike Security', href: '/bike-security-for-delivery-riders/' },
  { label: 'Delivery Gear', href: '/delivery-rider-equipment/' },
  { label: 'Platform Reviews', href: '/delivery-platform-reviews/' },
];

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  featuredImage?: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearchOpen]);

  // Search functionality with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();
          setSearchResults(data.results || []);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }
  };

  const handleResultClick = (slug: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/blog/${slug}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/Assets/Logo.png"
              alt="Rider Section Logo"
              width={360}
              height={79}
              priority
              className="h-20 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold uppercase tracking-wide transition-colors hover:text-[#CC0000] relative py-2 ${
                  pathname === link.href ? 'text-[#CC0000]' : 'text-[#1a1a1a]'
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#CC0000]"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 relative">
            <div ref={searchRef}>
              <button 
                onClick={handleSearchClick}
                className="p-2 text-[#1a1a1a] hover:text-[#CC0000] transition-colors"
              >
                <Search size={20} />
              </button>

              {/* Search Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-[90vw] md:w-[95vw] max-w-[1400px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        id="search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search articles..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    {isSearching && (
                      <div className="p-8 text-center text-gray-500">
                        Searching...
                      </div>
                    )}

                    {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No results found for "{searchQuery}"
                      </div>
                    )}

                    {!isSearching && searchQuery.trim().length < 2 && searchQuery.trim().length > 0 && (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        Type at least 2 characters to search
                      </div>
                    )}

                    {!isSearching && searchResults.length > 0 && (
                      <div>
                        {searchResults.map((result) => (
                          <button
                            key={result._id}
                            onClick={() => handleResultClick(result.slug)}
                            className="w-full p-4 hover:bg-gray-50 border-b border-gray-100 text-left transition-colors"
                          >
                            <div className="flex gap-3">
                              {result.featuredImage && (
                                <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                                  <Image
                                    src={typeof result.featuredImage === 'string' ? result.featuredImage : (result.featuredImage as any).url || ''}
                                    alt={result.title}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-bold uppercase text-[#CC0000] bg-red-50 px-2 py-0.5 rounded">
                                    {result.categoryLabel}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-[#1a1a1a] mb-1 line-clamp-2">
                                  {result.title}
                                </h4>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {result.excerpt}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/start-here/"
              className="hidden md:block bg-[#CC0000] text-white px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
            >
              Start Here
            </Link>
            <button
              className="lg:hidden p-2 text-[#1a1a1a]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-bold uppercase tracking-wide py-2 ${
                  pathname === link.href ? 'text-[#CC0000]' : 'text-[#1a1a1a]'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/start-here/"
              className="bg-[#CC0000] text-white px-6 py-4 rounded-lg text-center font-bold uppercase tracking-wider mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Start Here
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
