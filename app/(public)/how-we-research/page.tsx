import React from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'How We Research Courier Gear',
  description:
    'Our five-step research framework for delivery rider gear: real courier demands, verified specs, field reviews, failure patterns and total cost of ownership.',
  path: '/how-we-research/',
  keywords: ['how we research gear', 'delivery rider gear reviews', 'independent gear reviews'],
});

const STEPS = [
  {
    title: 'Map Real Courier Demands',
    body: 'We start from the job, not the product. A courier rides 40–70 miles a day, in rain and heat, and locks and unlocks the bike dozens of times per shift. Every product category gets a written set of demands before we look at a single spec sheet.',
  },
  {
    title: 'Verify Factory Specifications',
    body: 'Claims are checked against the numbers: IPX water-resistance ratings, battery capacity in mAh, steel hardness (HRC) and certified standards. Where a spec cannot be verified, we say so.',
  },
  {
    title: 'Cross-Examine Field Reviews',
    body: 'We compare independent results such as Virginia Tech helmet ratings and lockpicking-lab teardowns with what owners report, and look for where they disagree.',
  },
  {
    title: 'Analyze Courier Failure Patterns',
    body: 'We read Reddit, courier forums and reader reports for how gear fails: zips at 500+ miles, mounts that vibrate loose, locks that seize. Repeated failures lower a product’s rank.',
  },
  {
    title: 'Rank by Total Cost of Ownership',
    body: 'Final rankings weigh durability-per-dollar. A cheaper item replaced twice costs more than one that lasts, so we rank on what gear costs over its working life.',
  },
];

const WE_DO = [
  'Research each product against written courier-shift criteria',
  'Publish the evidence level for each guide (researched, hands-on or mixed)',
  'Update guides when specs, prices or failure reports change',
  'Disclose every affiliate relationship',
];

const WE_NEVER = [
  'Accept payment for placement, scores or reviews',
  'Rank a product higher because of its commission rate',
  'Publish brand-written copy as our own research',
  'Hide negative findings from a product we link to',
];

export default function HowWeResearchPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-gray-200 bg-offwhite">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
            Research Standards
          </p>
          <h1 className="mt-3 text-4xl font-black text-charcoal md:text-5xl">
            How We Research Courier Gear
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-body">
            Every recommendation on Rider Complex passes the same five-step framework, built around
            the demands of a real delivery shift.
          </p>
        </div>
      </section>

      <section aria-labelledby="framework-heading" className="mx-auto max-w-4xl px-4 py-16">
        <h2 id="framework-heading" className="text-3xl font-black text-charcoal">
          The 5-Step Framework
        </h2>
        <ol className="mt-8 space-y-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-5 rounded-2xl border border-gray-200 bg-offwhite p-6">
              <span className="text-3xl font-black text-brand-red" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-xl font-black text-charcoal">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="dos-heading" className="bg-offwhite py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 id="dos-heading" className="text-3xl font-black text-charcoal">
            What We Do vs. What We Never Do
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-black text-charcoal">What we do</h3>
              <ul className="mt-4 space-y-3">
                {WE_DO.map((item) => (
                  <li key={item} className="flex gap-3 text-body">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-charcoal p-6 text-white">
              <h3 className="text-lg font-black">What we never do</h3>
              <ul className="mt-4 space-y-3">
                {WE_NEVER.map((item) => (
                  <li key={item} className="flex gap-3 text-gray-300">
                    <X className="mt-1 h-4 w-4 shrink-0 text-brand-red-light" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="funding-heading" className="mx-auto max-w-4xl px-4 py-16">
        <h2 id="funding-heading" className="text-3xl font-black text-charcoal">
          How We’re Funded
        </h2>
        <div className="mt-4 space-y-4 leading-relaxed text-body">
          <p>
            Rider Complex is reader-supported. When you buy through some of our links, we may earn a
            commission through the Amazon Associates program at no extra cost to you. That income
            pays for research, and it never decides what we recommend.
          </p>
          <p>
            Read the full{' '}
            <Link href="/affiliate-disclaimer" className="font-semibold text-brand-red underline underline-offset-2">
              affiliate disclaimer
            </Link>
            , or{' '}
            <Link href="/contact" className="font-semibold text-brand-red underline underline-offset-2">
              contact us
            </Link>{' '}
            to report a gear failure.
          </p>
        </div>
      </section>
    </main>
  );
}
