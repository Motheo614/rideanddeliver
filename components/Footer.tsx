import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <Link href="/" className="flex items-center">
            <Image
              src="/Assets/LogoBlack.png"
              alt="Rider Section Logo"
              width={360}
              height={79}
              className="h-20 w-auto"
            />
          </Link>

          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-[#CC0000] transition-colors"><Twitter size={20} /></Link>
            <Link href="#" className="hover:text-[#CC0000] transition-colors"><Facebook size={20} /></Link>
            <Link href="#" className="hover:text-[#CC0000] transition-colors"><Instagram size={20} /></Link>
            <Link href="#" className="hover:text-[#CC0000] transition-colors"><Linkedin size={20} /></Link>
          </div>
        </div>

        <div className="h-px bg-white/10 mb-8"></div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
          <p>© Copyright Rider Section 2026 All Rights Reserved</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Link href="/terms/" className="hover:text-[#CC0000] transition-colors">Terms of Service</Link>
            <Link href="/privacy-policy/" className="hover:text-[#CC0000] transition-colors">Privacy Policy</Link>
            <Link href="/affiliate-disclaimer/" className="hover:text-[#CC0000] transition-colors">Affiliate Disclaimer</Link>
            <Link href="/contact/" className="hover:text-[#CC0000] transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
