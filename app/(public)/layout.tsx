import React from 'react';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SearchProvider, type SearchIndexItem } from '@/components/SearchModal';
import { getLatestPosts } from '@/lib/posts';
import { getPostHref } from '@/lib/postDisplay';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const posts = await getLatestPosts(200);
  const searchIndex: SearchIndexItem[] = posts.map((post) => ({
    title: post.title,
    excerpt: post.excerpt || '',
    category: post.category,
    href: getPostHref(post),
  }));

  return (
    <>
      <Script
        id="google-adsense"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4885543584254654"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <SearchProvider index={searchIndex}>
        <Header />
        {children}
        <Footer />
      </SearchProvider>
    </>
  );
}
