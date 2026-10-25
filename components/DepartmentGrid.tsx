import React from 'react';
import Link from 'next/link';
import {
  HardHat,
  Lightbulb,
  Lock,
  Backpack,
  BarChart3,
  ClipboardCheck,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { DEPARTMENTS, type DepartmentKey } from '@/lib/departments';
import { getPostsByCategoryPage } from '@/lib/posts';

const ICONS: Record<DepartmentKey, LucideIcon> = {
  'safety-gear': HardHat,
  'tech-lighting': Lightbulb,
  'bike-security': Lock,
  'delivery-gear': Backpack,
  'platform-reviews': BarChart3,
};

const MAX_BADGES = 3;

export default async function DepartmentGrid() {
  const totals = await Promise.all(
    DEPARTMENTS.map(async (dept) => {
      const { total } = await getPostsByCategoryPage(dept.key, 1, 1);
      return total;
    })
  );

  return (
    <section aria-labelledby="departments-heading" className="section-y border-b border-hairline bg-white">
      <div className="container-page reveal">
        <div className="mb-12 max-w-[65ch]">
          <p className="eyebrow">Research Departments</p>
          <h2 id="departments-heading" className="mt-3 text-h2 font-bold text-charcoal">
            Start with the department you need
          </h2>
          <p className="mt-4 text-body">
            Every guide lives in one of five departments, each with its own testing criteria.
          </p>
        </div>

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((dept, i) => {
            const Icon = ICONS[dept.key];
            const total = totals[i];
            const shown = dept.topics.slice(0, MAX_BADGES);
            const extra = dept.topics.length - shown.length;
            return (
              <li key={dept.key}>
                <Link
                  href={dept.href}
                  className="group flex h-full flex-col rounded-2xl border border-hairline bg-white p-6 shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-red/20 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red/40 md:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-brand-red">
                      <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="text-xs font-medium text-body">
                      {total > 0 ? `${total} ${total === 1 ? 'guide' : 'guides'}` : 'Coming soon'}
                    </span>
                  </div>
                  <h3 className="mt-6 flex items-center gap-2 text-h4 font-semibold text-charcoal">
                    {dept.title}
                    <ArrowRight
                      className="h-4 w-4 -translate-x-1 text-brand-red opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </h3>
                  <p className="mt-2 text-small text-body">{dept.description}</p>
                  <ul className="mt-auto flex flex-nowrap items-center gap-1.5 overflow-hidden pt-5" aria-label="Topics">
                    {shown.map((topic) => (
                      <li
                        key={topic}
                        className="truncate whitespace-nowrap rounded-full bg-offwhite px-2.5 py-1 text-[11px] font-medium text-body ring-1 ring-inset ring-black/5"
                      >
                        {topic}
                      </li>
                    ))}
                    {extra > 0 && (
                      <li className="shrink-0 whitespace-nowrap rounded-full bg-offwhite px-2.5 py-1 text-[11px] font-medium text-body ring-1 ring-inset ring-black/5">
                        +{extra}
                      </li>
                    )}
                  </ul>
                </Link>
              </li>
            );
          })}

          <li>
            <Link
              href="/free-rider-checklist"
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-brand-red to-[#8a0000] p-6 text-white shadow-md ring-1 ring-inset ring-white/15 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal md:p-7"
            >
              <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20">
                <ClipboardCheck className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3 className="relative mt-6 text-h4 font-semibold">New Courier Shift Checklist</h3>
              <p className="relative mt-2 text-small text-white/90">
                A free pre-shift checklist covering helmet, lights, lock, phone and bag, so nothing
                fails mid-delivery.
              </p>
              <span className="relative mt-auto inline-flex h-10 items-center gap-2 self-start rounded-xl bg-white px-4 text-sm font-semibold text-brand-red shadow-sm transition-colors duration-200 group-hover:bg-red-50">
                Get the checklist
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden="true" />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
