import React from 'react';
import Link from 'next/link';
import NewsletterSignupForm from '@/components/NewsletterSignupForm';

export default function NewsletterWidget() {
  return (
    <section
      aria-labelledby="dispatch-heading"
      className="relative overflow-hidden rounded-2xl bg-charcoal p-6 text-white shadow-md"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-brand-red" />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-red-light">
        Courier Dispatch
      </p>
      <h3 id="dispatch-heading" className="mt-3 text-h4 font-semibold">
        Gear intel, straight to your inbox
      </h3>
      <p className="mt-2 text-small text-gray-300">
        New durability findings, failure reports and buying guides for couriers. No sponsored picks.
      </p>

      <div className="mt-5">
        <NewsletterSignupForm
          source="sidebar-widget"
          inputId="newsletter-widget-email"
          inputPlaceholder="your@email.com"
          buttonText="Join the Dispatch"
          rowClassName="flex flex-col gap-3"
          inputClassName="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-gray-400 transition-colors duration-200 hover:border-white/25 focus:border-white/40 focus:outline-none"
          buttonClassName="h-11 w-full rounded-xl bg-brand-red text-sm font-semibold text-white transition-colors duration-200 ease-out hover:bg-brand-red-dark active:bg-[#8a0000]"
        />
      </div>

      <p className="mt-4 text-xs text-gray-300">
        We respect your privacy.{' '}
        <Link
          href="/privacy-policy"
          className="underline decoration-white/30 underline-offset-4 hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Privacy Policy
        </Link>
      </p>
    </section>
  );
}
