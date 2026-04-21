import React from 'react';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="google-adsense"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4885543584254654"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Header />
      {children}
      <Footer />
    </>
  );
}
