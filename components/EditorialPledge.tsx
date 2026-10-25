import React from 'react';
import Link from 'next/link';
import { Ban, HeartHandshake, MessageSquareWarning } from 'lucide-react';

export default function EditorialPledge() {
  return (
    <section aria-labelledby="pledge-heading" className="section-y bg-white">
      <div className="container-page reveal">
        <div className="rounded-3xl bg-charcoal p-8 text-white shadow-md md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-red-light">
            Our Editorial Pledge
          </p>
          <h2 id="pledge-heading" className="mt-3 text-h2 font-bold">
            Research You Can Trust, Funded by Readers
          </h2>

          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            <li>
              <Ban className="h-6 w-6 text-brand-red-light" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-black">0% Payola</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">
                No sponsored placements. Brands cannot buy rankings, scores or reviews.
              </p>
            </li>
            <li>
              <HeartHandshake className="h-6 w-6 text-brand-red-light" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-black">Reader-Supported</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">
                We earn a small commission through Amazon Associates when you buy via our links, at
                no extra cost to you.{' '}
                <Link
                  href="/affiliate-disclaimer"
                  className="font-semibold text-white underline underline-offset-2 hover:text-brand-red-light"
                >
                  Read the disclaimer
                </Link>
                .
              </p>
            </li>
            <li>
              <MessageSquareWarning className="h-6 w-6 text-brand-red-light" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-black">Have a gear failure to report?</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">
                Courier reports shape our rankings.{' '}
                <Link
                  href="/contact"
                  className="font-semibold text-white underline underline-offset-2 hover:text-brand-red-light"
                >
                  Tell us what broke
                </Link>
                .
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
