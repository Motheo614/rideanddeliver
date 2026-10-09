import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/lib/posts';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getStartHereComparisonProducts } from '@/lib/start-here-comparison';
import NewsletterSignupForm from '@/components/NewsletterSignupForm';

export const metadata = buildPageMetadata({
  title: 'Start Here: New Delivery Rider Guide',
  description: 'A practical start-here guide for US gig riders with essential gear categories, setup tips, and first-shift recommendations.',
  path: '/start-here',
  keywords: ['new delivery rider guide', 'start delivery riding', 'gig rider setup'],
});

function PostCard({ post }: { post: any }) {
  const imageUrl = post.featuredImage && (typeof post.featuredImage === 'string' ? post.featuredImage : post.featuredImage.url);

  return (
    <Link
      href={`/${post.dbCategorySlug}/${post.slug}`}
      className="group flex gap-4 bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-[#CC0000] transition-colors"
    >
      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 relative">
        {imageUrl ? (
          <Image src={imageUrl} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center py-3 pr-4">
        <span className="text-[10px] text-[#CC0000] font-bold uppercase tracking-widest mb-1">{post.category}</span>
        <h3 className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#CC0000] transition-colors leading-snug">
          {post.title}
        </h3>
      </div>
    </Link>
  );
}

function MidListCapture() {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 my-4">
      <div>
        <p className="font-bold text-[#1a1a1a]">Get weekly gear picks in your inbox</p>
        <p className="text-sm text-gray-500">Budget-first recommendations for working delivery riders. No fluff.</p>
      </div>
      <div className="w-full md:w-auto md:min-w-[320px]">
        <NewsletterSignupForm
          source="start-here-midlist"
          buttonText="Join free"
          rowClassName="flex flex-col sm:flex-row gap-2"
          inputClassName="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
          buttonClassName="bg-[#CC0000] text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition-colors whitespace-nowrap"
        />
      </div>
    </div>
  );
}

export default async function StartHerePage() {
  const [allPosts, comparisonProducts] = await Promise.all([
    getPosts({ status: 'published' }),
    getStartHereComparisonProducts(),
  ]);
  const importantPosts = allPosts.slice(0, 8);
  const firstPosts = importantPosts.slice(0, 4);
  const restPosts = importantPosts.slice(4, 8);

  const hubs = [
    { label: 'Safety Gear', href: '/safety-gear', desc: 'Helmets, clothing, and safety tips.' },
    { label: 'Tech & Lighting', href: '/tech-lighting', desc: 'Dash cams, lights, and gadgets.' },
    { label: 'Bike Security', href: '/bike-security', desc: 'Locks, trackers, and theft prevention.' },
    { label: 'Delivery Gear', href: '/delivery-gear', desc: 'Bags, racks, and equipment.' },
    { label: 'Platform Reviews', href: '/platform-reviews', desc: 'Earnings, apps, and platform guides.' },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Zone 1: hero */}
      <section className="relative isolate flex min-h-[clamp(520px,62vh,720px)] items-center overflow-hidden bg-[#1a1412] text-white">
        <Image
          src="/Assets/Order_Collection.png"
          alt="Delivery rider loading a paper bag and drinks into an insulated delivery backpack beside an e-bike"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="z-0 object-cover [object-position:50%_55%] [transform:scaleX(-1)]"
        />
        <div aria-hidden="true" className="start-here-hero-overlay absolute inset-0 z-[1]" />
        <div className="relative z-10 mx-auto w-full max-w-[1240px] px-[clamp(20px,4vw,48px)] py-[clamp(48px,7vw,96px)]">
          <div className="flex max-w-[640px] flex-col items-start gap-7">
            <span className="inline-flex items-center rounded-full border border-white/40 bg-white/[0.14] px-4 py-2 text-[13px] font-extrabold uppercase tracking-[0.14em] text-white">
              New to delivery riding?
            </span>
            <h1 className="text-[clamp(42px,6vw,76px)] font-black leading-[1.12] tracking-[-0.02em] text-white">
              Everything you need to ride smarter,{' '}
              <span className="rounded-[8px] bg-[#CC0000] px-[0.18em] text-inherit [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                earn more.
              </span>
            </h1>
            <div className="flex flex-wrap gap-4">
              <a
                href="#free-starter-checklist"
                className="inline-flex min-h-14 items-center gap-3 rounded-full bg-[#CC0000] px-7 text-[17px] font-extrabold text-white transition-colors hover:bg-[#a80000] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Get the free field guide
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <Link
                href="/category/safety-gear"
                className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-white px-7 text-[17px] font-extrabold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Browse reviews
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Zone 1: category grid */}
          <h2 className="text-2xl font-black text-[#1a1a1a] mb-8 text-center">Browse by category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {hubs.map((hub) => (
              <Link key={hub.href} href={hub.href} className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#CC0000] transition-all">
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 group-hover:text-[#CC0000] transition-colors">{hub.label}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{hub.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

          {/* Zone 2: field guide signup */}
          <section id="free-starter-checklist" className="bg-white">
            <div className="mx-auto flex w-full max-w-[1240px] flex-col items-start gap-14 px-5 py-12 lg:flex-row lg:items-center lg:px-12 lg:py-24">
              <div className="flex min-w-0 flex-[1_1_480px] flex-col items-start gap-6">
                <span className="text-[13px] font-black uppercase tracking-widest text-[#1a1a1a]">
                  Free PDF · 7 pages
                </span>
                <h2 className="max-w-[640px] text-[clamp(38px,4.6vw,60px)] font-black leading-[1.04] tracking-[-0.02em] text-[#1a1a1a]">
                  What nobody tells you before your first delivery
                </h2>
                <p className="max-w-[540px] text-[19px] leading-[1.6] text-gray-700">
                  The pay traps, safety risks and gear regrets that catch delivery riders out. Built from rider reports on DoorDash, Uber Eats, Grubhub and Instacart forums, plus city labor data.
                </p>
                <div className="w-full max-w-[560px]">
                  <NewsletterSignupForm
                    source="start-here-lead-magnet"
                    inputId="start-here-field-guide-email"
                    inputPlaceholder="you@example.com"
                    buttonText="Send me the guide"
                    label="Email address"
                    variant="field-guide"
                  />
                  <p className="mt-3 max-w-[500px] text-sm leading-[1.5] text-gray-600">
                    We&apos;ll email a link to confirm first. Confirm it and we&apos;ll send you the guide. Unsubscribe any time.
                  </p>
                </div>
              </div>
              <div className="relative aspect-[404/494] w-[70%] max-w-[404px] self-center lg:w-full lg:flex-[0_1_404px]">
                <Image
                  src="/Assets/guide-contents.jpg"
                  alt="Contents page of the guide, listing five sections"
                  width={1190}
                  height={1540}
                  sizes="(max-width: 639px) 54vw, 360px"
                  className="absolute border"
                  style={{
                    top: '5.7%',
                    left: '10.9%',
                    width: '89.1%',
                    height: 'auto',
                    borderColor: 'rgba(26,26,26,0.18)',
                    borderRadius: '4px',
                    boxShadow: '0 12px 28px rgba(26,26,26,0.16)',
                  }}
                />
                <Image
                  src="/Assets/guide-cover.jpg"
                  alt="Cover of the Rider Complex Field Guide: What Nobody Tells You Before Your First Delivery"
                  width={1190}
                  height={1540}
                  sizes="(max-width: 639px) 54vw, 360px"
                  className="absolute"
                  style={{
                    top: 0,
                    left: 0,
                    width: '89.1%',
                    height: 'auto',
                    borderRadius: '4px',
                    boxShadow: '0 24px 48px rgba(26,26,26,0.32)',
                  }}
                />
              </div>
            </div>
          </section>

          {/* Zone 3: reviewed gear comparison */}
          <section className="border-y border-t-2 border-[#1a1a1a] bg-white">
            <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-14 px-5 py-12 lg:flex-row lg:px-12 lg:py-20">
              <div className={`flex min-w-0 flex-col items-start gap-6 ${comparisonProducts ? 'lg:flex-1' : 'flex-1'}`}>
                <h2 className="max-w-[600px] text-[clamp(34px,4vw,48px)] font-black leading-[1.06] tracking-[-0.02em] text-[#1a1a1a]">
                  Compare any two products
                </h2>
                <p className="max-w-[460px] text-[18px] leading-[1.6] text-gray-700">
                  Choose two products and see their pros and cons side by side, with a verdict for the job you have in mind.
                </p>
                <Link
                  href="/tools/gear-comparison"
                  className="inline-flex min-h-14 items-center gap-3 rounded bg-[#CC0000] px-7 text-[17px] font-black text-white transition-colors hover:bg-[#a80000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a]"
                >
                  Compare two products
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <p className="text-[15px] leading-[1.5] text-gray-600">
                  Choose from the products we list in each category, from helmets and locks to e-bikes, or type in any product.
                </p>
              </div>

              {comparisonProducts && (
                <div className="min-w-0 lg:flex-[1.35_1_0%]">
                  <div className="overflow-x-auto">
                    <table id="start-here-comparison-table" className="w-full min-w-[600px] table-fixed border-t-[3px] border-b border-[#1a1a1a] text-left text-[#1a1a1a]">
                      <caption className="caption-bottom pt-4 text-left text-sm leading-[1.5] text-gray-600">
                        Score, pros and cons are from our own notes on each product. The tool adds an AI-generated verdict and category notes.
                      </caption>
                      <colgroup>
                        <col className="w-[22%]" />
                        <col className="w-[39%]" />
                        <col className="w-[39%]" />
                      </colgroup>
                      <thead>
                        <tr>
                          <th scope="col" className="px-3 py-4 align-bottom text-[12px] font-black uppercase tracking-wide text-gray-700" />
                          {comparisonProducts.map((product) => (
                            <th key={product.productName} scope="col" className="border-l border-[#1a1a1a] px-4 py-4 align-bottom">
                              <span className="block text-[11px] font-bold uppercase tracking-wide text-gray-600">
                                {product.category}
                              </span>
                              <span className="mt-1 block break-words [overflow-wrap:anywhere] text-[22px] font-black leading-tight">
                                {product.productName}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-300">
                          <th scope="row" className="px-3 py-4 text-[12px] font-black uppercase tracking-wide">Score</th>
                          {comparisonProducts.map((product) => (
                            <td key={product.productName} className="border-l border-[#1a1a1a] px-4 py-4 text-[17px] font-bold">
                              {product.score.toFixed(1)} / 10
                            </td>
                          ))}
                        </tr>
                        {(['Pros', 'Cons'] as const).map((kind) => (
                          <tr key={kind} className="border-t border-gray-300">
                            <th scope="row" className="px-3 py-4 align-top text-[12px] font-black uppercase tracking-wide">{kind}</th>
                            {comparisonProducts.map((product) => (
                              <td key={product.productName} className="border-l border-[#1a1a1a] px-4 py-4 align-top text-[14px] leading-[1.5] text-[#1a1a1a]">
                                <ul className="list-disc space-y-1 pl-4">
                                  {(kind === 'Pros' ? product.pros : product.cons).slice(0, 3).map((item, index) => (
                                    <li key={`${product.productName}-${kind}-${index}`} className="break-words">{item}</li>
                                  ))}
                                </ul>
                              </td>
                            ))}
                          </tr>
                        ))}
                        {comparisonProducts.every((product) => product.editorNote?.trim()) && (
                          <tr className="border-t border-gray-300">
                            <th scope="row" className="px-3 py-4 align-top text-[12px] font-black uppercase tracking-wide">Editor&apos;s note</th>
                            {comparisonProducts.map((product) => (
                              <td key={product.productName} className="border-l border-[#1a1a1a] px-4 py-4 align-top break-words text-sm leading-[1.5] text-gray-700">
                                {product.editorNote}
                              </td>
                            ))}
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>

      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Zone 4: essential reading */}
          <h2 className="text-2xl font-black text-[#1a1a1a] mb-8 text-center">Essential Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {firstPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          <MidListCapture />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
