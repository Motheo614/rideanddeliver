import React from 'react';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'About Rider Complex',
  description: 'Learn how Rider Complex helps gig riders choose delivery gear, vehicles, and tools that hold up in real-world shifts.',
  path: '/about/',
  keywords: ['about Rider Complex', 'gig rider gear reviews', 'delivery rider resources'],
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="container mx-auto max-w-4xl px-4 py-16 md:py-20">
        <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] leading-tight">
          About Rider Complex
        </h1>

        <h2 className="mt-8 text-2xl md:text-3xl font-extrabold text-[#1a1a1a] leading-tight">Built for Real Delivery Work</h2>

        <div className="mt-8 space-y-6 text-base md:text-lg leading-relaxed text-gray-700">
          <p>
            Rider Complex is built for gig riders doing food delivery, courier runs, and app-based work who need honest guidance on the gear, vehicles, and tools that actually hold up on the job.
          </p>

          <p>
            Most riding content online is written by people who have never done a delivery shift. We come at it differently. Every review and recommendation is looked at through one lens: does it work in real delivery conditions, is it worth the cost, and does it help you earn better or ride smarter.
          </p>
        </div>

        <h2 className="mt-12 text-2xl md:text-3xl font-extrabold text-[#1a1a1a]">What We Cover</h2>
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-gray-700">
          <p>
            We help riders build a complete setup for the road. That includes motorcycles, e-bikes, bikes, and mopeds for delivery work, rental options for riders who want flexibility, gear and accessories, insurance for gig workers, banking and financial tools for managing irregular income, and the practical stuff like mileage tracking, tax guidance, and expense management.
          </p>

          <p>
            Everything gets judged on the same terms: does it work in real delivery conditions, is it worth the cost, and does it help you earn more or stress less.
          </p>
        </div>

        <h2 className="mt-12 text-2xl md:text-3xl font-extrabold text-[#1a1a1a]">Who It&apos;s For</h2>
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-gray-700">
          <p>
            If you&apos;re using a bike, scooter, or any vehicle to earn income, this is built for you. Whether you&apos;re just getting started or tightening up a setup you&apos;ve had for years, the right choices make a real difference in your comfort, efficiency, and earnings.
          </p>
        </div>

        <h2 className="mt-12 text-2xl md:text-3xl font-extrabold text-[#1a1a1a]">A Note on Affiliate Links</h2>
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-gray-700">
          <p>
            Some links on this site are affiliate links. If you buy something through them, we earn a small commission at no extra cost to you. This is how the site stays free. It does not affect what we recommend. We have turned down partnerships with brands whose gear we would not use on our own shifts. Our recommendations come from riding, not from who pays the most.
          </p>
        </div>

        <h2 className="mt-12 text-2xl md:text-3xl font-extrabold text-[#1a1a1a]">Dig In</h2>
        <div className="mt-6 space-y-6 text-base md:text-lg leading-relaxed text-gray-700">
          <p>
            Browse the latest guides and reviews to find what works best for your riding style and setup.
          </p>
        </div>
      </section>
    </main>
  );
}
