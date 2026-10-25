import React from 'react';
import { HeroSearch } from './SearchTriggers';

const POPULAR_TAGS = ['U-lock', 'MIPS helmet', 'Phone mount', 'Backpack'];

export default function ResearchHero() {
  return (
    <section
      className="hero relative overflow-hidden border-b border-hairline bg-offwhite bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgb(204_0_0/0.06),transparent_70%)]"
    >
      <div className="container-page relative z-[1] py-16 text-center md:py-28">
        <p className="eyebrow inline-flex items-center rounded-full border border-hairline bg-white px-4 py-1.5 shadow-xs">
          Independent Courier Gear Research Desk
        </p>

        <h1 className="mx-auto mt-8 max-w-[18ch] text-display font-extrabold text-charcoal">
          Gear Up. Ride Smart. <span className="text-brand-red">Earn More.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-[65ch] text-lead text-body">
          We test and research gear against real 10-hour courier shifts, with no paid placements,
          so you can buy once and ride on.
        </p>

        <div className="mx-auto mt-10 max-w-2xl text-left">
          <HeroSearch tags={POPULAR_TAGS} />
        </div>
      </div>
    </section>
  );
}
