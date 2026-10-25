import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const STAGES = [
  {
    title: 'Map Real Courier Demands',
    body: '40–70 miles a day, all weather, and dozens of lock-and-unlock cycles per shift.',
  },
  {
    title: 'Verify Factory Specifications',
    body: 'IPX ratings, battery mAh and steel HRC hardness checked against what brands claim.',
  },
  {
    title: 'Cross-Examine Field Reviews',
    body: 'Virginia Tech helmet ratings and independent lockpicking labs, not marketing copy.',
  },
  {
    title: 'Analyze Courier Failure Patterns',
    body: 'Reddit threads, courier forums and reports of wear past 500+ miles.',
  },
  {
    title: 'Rank by Total Cost of Ownership',
    body: 'Durability-per-dollar ROI, so the cheapest gear to buy is not the costliest to replace.',
  },
];

export default function MethodologySection() {
  return (
    <section aria-labelledby="method-heading" className="section-y border-b border-hairline bg-offwhite">
      <div className="container-page reveal">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">Our Process</p>
                    <h2 id="method-heading" className="mt-3 text-h2 font-bold text-charcoal">
            How Our Product Research Works
          </h2>
        </div>

        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage, i) => (
            <li key={stage.title} className="rounded-2xl border border-hairline bg-white p-5 shadow-xs">
              <p className="text-3xl font-black text-brand-red">
                <span className="sr-only">Stage </span>
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 text-base font-black leading-snug text-charcoal">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{stage.body}</p>
            </li>
          ))}
        </ol>

        <aside className="mt-8 flex flex-col gap-4 rounded-2xl border border-hairline border-l-4 border-l-brand-red bg-white p-6 shadow-xs md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-brand-red" aria-hidden="true" />
            <div>
              <h3 className="font-black text-charcoal">Editorial Independence Guarantee</h3>
              <p className="mt-1 text-sm text-body">
                No brand can pay for a placement, a score or a recommendation here.
              </p>
            </div>
          </div>
          <Link
            href="/how-we-research"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-red hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            Read the full method
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  );
}
