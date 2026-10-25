'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/departments';
import { SearchButton } from './SearchTriggers';

const NAV_LINKS = [
  ...DEPARTMENTS.map((d) => ({ label: d.navLabel, href: d.href })),
  { label: 'How We Research', href: '/how-we-research' },
];

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red/40';

export default function HeaderNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md transition-[border-color,box-shadow] duration-200 ease-out supports-[backdrop-filter]:bg-white/70 ${
        scrolled || menuOpen ? 'border-hairline shadow-xs' : 'border-transparent'
      }`}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4 md:h-[72px]">
          <Link href="/" className={`flex shrink-0 items-center rounded-lg ${focusRing}`}>
            <Image
              src="/Assets/Logo.png"
              alt="Rider Section – home"
              width={360}
              height={79}
              priority
              className="h-10 w-auto md:h-12"
            />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ease-out hover:bg-black/[0.04] hover:text-charcoal ${focusRing} ${
                    active ? 'text-brand-red' : 'text-body'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <SearchButton />
            <Link
              href="/start-here"
              className="btn btn-primary !h-10 !px-5 hidden shadow-xs sm:inline-flex"
            >
              Start Here
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className={`btn btn-ghost !h-10 !w-10 !px-0 xl:hidden ${focusRing}`}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <nav
          id="mobile-menu"
          aria-label="Mobile"
          hidden={!menuOpen}
          className="border-t border-hairline pb-6 pt-3 xl:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-2 py-3 text-base font-medium ${focusRing} ${
                    isActive(link.href) ? 'text-brand-red' : 'text-charcoal'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/start-here"
            onClick={() => setMenuOpen(false)}
            className="btn btn-primary mt-4 w-full"
          >
            Start Here
          </Link>
        </nav>
      </div>
    </header>
  );
}
