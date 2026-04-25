import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook } from 'lucide-react';

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.26l-4.9-6.4L6.5 22H3.4l7.24-8.28L1 2h6.42l4.43 5.85L18.9 2Zm-1.1 18h1.73L6.48 3.9H4.6L17.8 20Z" />
    </svg>
  );
}

function RedditIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.2A9.8 9.8 0 0 0 8.6 21.2c0-.7 0-1.6.2-2.3l1.3-5.4s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6 1 0 1.4.7 1.4 1.6 0 1-.6 2.4-.9 3.7-.3 1.1.5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.2 0-2.1-1.4-3.6-4-3.6-2.9 0-4.7 2.1-4.7 4.4 0 .8.2 1.4.6 1.9.2.3.2.4.1.7l-.2.9c-.1.3-.4.5-.7.4-2-.8-3-2.9-3-5.2 0-3.9 3.3-7.5 8.8-7.5 4.5 0 7.4 3.2 7.4 6.7 0 4.6-2.6 8.1-6.5 8.1-1.3 0-2.5-.7-2.9-1.6l-.8 3.1c-.3 1-.8 2-1.3 2.8.9.3 1.8.4 2.8.4A9.8 9.8 0 0 0 12 2.2Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <Link href="/" className="flex items-center">
            <Image
              src="/Assets/LogoBlack.png"
              alt="Rider Complex Logo"
              width={360}
              height={79}
              className="h-28 w-auto"
            />
          </Link>

          <div className="flex items-center gap-6">
            <Link href="https://x.com/ridercomplex" target="_blank" rel="noopener noreferrer" className="hover:text-[#CC0000] transition-colors"><XIcon size={20} /></Link>
            <Link href="https://web.facebook.com/profile.php?id=61564725947294" target="_blank" rel="noopener noreferrer" className="hover:text-[#CC0000] transition-colors"><Facebook size={20} /></Link>
            <Link href="https://www.reddit.com/user/rider_complex/" target="_blank" rel="noopener noreferrer" className="hover:text-[#CC0000] transition-colors"><RedditIcon size={20} /></Link>
            <Link href="https://www.pinterest.com/ridercomplexblog/" target="_blank" rel="noopener noreferrer" className="hover:text-[#CC0000] transition-colors"><PinterestIcon size={20} /></Link>
          </div>
        </div>

        <div className="h-px bg-white/10 mb-8"></div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
          <p>© Copyright Rider Complex 2026 All Rights Reserved</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Link href="/terms" className="hover:text-[#CC0000] transition-colors">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-[#CC0000] transition-colors">Privacy Policy</Link>
            <Link href="/affiliate-disclaimer" className="hover:text-[#CC0000] transition-colors">Affiliate Disclaimer</Link>
            <Link href="/about" className="hover:text-[#CC0000] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#CC0000] transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
