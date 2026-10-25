import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/departments';

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.26l-4.9-6.4L6.5 22H3.4l7.24-8.28L1 2h6.42l4.43 5.85L18.9 2Zm-1.1 18h1.73L6.48 3.9H4.6L17.8 20Z" />
    </svg>
  );
}

function RedditIcon({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <path d="M8.5 15c1 .8 2.2 1.2 3.5 1.2 1.3 0 2.5-.4 3.5-1.2" />
      <path d="M14.8 6.3 16.5 8" />
      <circle cx="17.5" cy="6.5" r="1" />
    </svg>
  );
}

function PinterestIcon({ size = 20 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2A9.8 9.8 0 0 0 8.6 21.2c0-.7 0-1.6.2-2.3l1.3-5.4s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6 1 0 1.4.7 1.4 1.6 0 1-.6 2.4-.9 3.7-.3 1.1.5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.2 0-2.1-1.4-3.6-4-3.6-2.9 0-4.7 2.1-4.7 4.4 0 .8.2 1.4.6 1.9.2.3.2.4.1.7l-.2.9c-.1.3-.4.5-.7.4-2-.8-3-2.9-3-5.2 0-3.9 3.3-7.5 8.8-7.5 4.5 0 7.4 3.2 7.4 6.7 0 4.6-2.6 8.1-6.5 8.1-1.3 0-2.5-.7-2.9-1.6l-.8 3.1c-.3 1-.8 2-1.3 2.8.9.3 1.8.4 2.8.4A9.8 9.8 0 0 0 12 2.2Z" />
    </svg>
  );
}

const SOCIALS = [
  { label: 'X', href: 'https://x.com/ridercomplex', icon: <XIcon /> },
  { label: 'Facebook', href: 'https://web.facebook.com/profile.php?id=61564725947294', icon: <Facebook size={20} aria-hidden="true" /> },
  { label: 'Reddit', href: 'https://www.reddit.com/user/rider_complex/', icon: <RedditIcon /> },
  { label: 'Pinterest', href: 'https://www.pinterest.com/ridercomplexblog/', icon: <PinterestIcon /> },
];

const STANDARDS = [
  { label: 'How We Research', href: '/how-we-research' },
  { label: 'Affiliate Disclaimer', href: '/affiliate-disclaimer' },
  { label: 'Free Rider Checklist', href: '/free-rider-checklist' },
  { label: 'Night Riding Safety', href: '/night-delivery-riding-safety' },
];

const ORGANIZATION = [
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Admin', href: '/admin' },
];

const linkClass =
  'rounded-sm text-gray-300 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-white">{title}</h2>
      <ul className="space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={linkClass}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-charcoal pb-8 pt-16 text-white md:pt-24">
      <div className="container-page">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              <Image src="/Assets/LogoBlack.png" alt="Rider Section – home" width={360} height={79} className="h-12 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs text-small text-gray-300">
              Independent gear reviews, durability ratings and buying guides for bike delivery
              couriers. Gear Up. Ride Smart. Earn More.
            </p>
            <ul className="mt-6 flex items-center gap-4" aria-label="Social links">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Rider Section on ${s.label}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 hover:border-white/30 ${linkClass}`}
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn
            title="Research Departments"
            links={DEPARTMENTS.map((d) => ({ label: d.title, href: d.href }))}
          />
          <FooterColumn title="Standards & Trust" links={STANDARDS} />
          <FooterColumn title="Organization" links={ORGANIZATION} />
        </div>

        <div className="mt-14 border-t border-white/10 pt-8 text-xs leading-relaxed text-gray-300">
          <p className="max-w-4xl">
            Rider Section is a participant in the Amazon Services LLC Associates Program, an
            affiliate advertising program designed to provide a means for sites to earn advertising
            fees by advertising and linking to Amazon.com. As an Amazon Associate we earn from
            qualifying purchases. Product prices and availability are accurate as of the date and
            time indicated and are subject to change. See our{' '}
            <Link href="/affiliate-disclaimer" className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
              affiliate disclaimer
            </Link>
            .
          </p>
          <p className="mt-4">© {new Date().getFullYear()} Rider Section. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
