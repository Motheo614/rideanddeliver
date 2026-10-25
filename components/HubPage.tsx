import React from 'react';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, ClipboardList } from 'lucide-react';
import ArticleCard from '@/components/ArticleCard';
import CategoryPagination from '@/components/CategoryPagination';
import Sidebar from '@/components/Sidebar';
import { getPostsByCategoryPage } from '@/lib/posts';
import { DEPARTMENTS, getDepartment } from '@/lib/departments';

interface HubPageProps {
  title: string;
  description: string;
  categorySlug: string;
  intro: string;
  currentPage?: number;
}

const POSTS_PER_PAGE = 10;

export default async function HubPage({
  title,
  description,
  categorySlug,
  intro,
  currentPage = 1,
}: HubPageProps) {
  // Render category hubs with fresh data to avoid stale empty states after publishing.
  noStore();

  const categoryData = await getPostsByCategoryPage(categorySlug, currentPage, POSTS_PER_PAGE);
  const categoryPosts = categoryData.posts;

  if (categoryData.totalPages > 0 && currentPage > categoryData.totalPages) {
    notFound();
  }

  const department = getDepartment(categorySlug);

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-hairline bg-offwhite">
        <div className="container-page py-12 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-body">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-brand-red hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4" />
              </li>
              <li aria-current="page" className="font-semibold text-charcoal">
                {title}
              </li>
            </ol>
          </nav>

          <p className="inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-red">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Independent Research · Zero Paid Placements
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight text-charcoal md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-body">{description}</p>

          {department && (
            <aside
              aria-labelledby="scope-heading"
              className="mt-8 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6"
            >
              <h2 id="scope-heading" className="flex items-center gap-2 text-base font-black text-charcoal">
                <ClipboardList className="h-5 w-5 text-brand-red" aria-hidden="true" />
                Department scope &amp; testing criteria
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-body">{department.scope}</p>
              <ul className="mt-3 grid gap-2 text-sm text-body sm:grid-cols-2">
                {department.criteria.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" aria-hidden="true" />
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm">
                <Link href="/how-we-research" className="font-semibold text-brand-red underline underline-offset-2">
                  See our full research method
                </Link>
              </p>
            </aside>
          )}
        </div>
      </section>

      <div className="container-page py-12 md:py-20">
        <p className="mb-10 max-w-3xl leading-relaxed text-body">{intro}</p>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]">
          <section aria-labelledby="hub-guides-heading">
            <h2 id="hub-guides-heading" className="mb-6 text-2xl font-black text-charcoal">
              Latest in {title}
            </h2>
            {categoryPosts.length > 0 ? (
              <>
                <div className="flex flex-col">
                  {categoryPosts.map((post) => (
                    <ArticleCard key={post.slug} post={post} />
                  ))}
                </div>
                <CategoryPagination
                  currentPage={currentPage}
                  totalPages={categoryData.totalPages}
                  basePath={`/${categorySlug}`}
                />
              </>
            ) : (
              <p className="italic text-body">No articles found in this category yet.</p>
            )}
          </section>

          <Sidebar />
        </div>

        <nav aria-labelledby="other-depts-heading" className="mt-16 border-t border-gray-200 pt-10">
          <h2 id="other-depts-heading" className="mb-6 text-center text-2xl font-black text-charcoal">
            Other Research Departments
          </h2>
          <ul className="flex flex-wrap justify-center gap-3">
            {DEPARTMENTS.filter((d) => d.key !== categorySlug).map((d) => (
              <li key={d.key}>
                <Link
                  href={d.href}
                  className="inline-block rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-charcoal transition-colors hover:border-brand-red hover:text-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                >
                  {d.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
