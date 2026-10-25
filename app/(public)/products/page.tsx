import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { DEPARTMENTS, type DepartmentKey } from '@/lib/departments';
import { getCatalogProducts, splitBadge, type TopPick } from '@/lib/products';
import { buildAffiliateRedirectUrl } from '@/lib/affiliate/tracking';
import { getCategoryInfo } from '@/lib/categoryMap';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  title: 'All Products for Delivery Riders',
  description: 'Browse recommended delivery rider products grouped by department, from safety gear to bike security and tech.',
  path: '/products/',
});

const PRODUCT_CATEGORIES: Partial<Record<DepartmentKey, string[]>> = {
  'safety-gear': ['helmets'],
  'tech-lighting': ['lights'],
  'bike-security': ['locks'],
  'delivery-gear': ['bags', 'tools', 'clothing', 'accessories'],
};

export default async function ProductsPage() {
  const products = await getCatalogProducts();
  const departments = DEPARTMENTS.flatMap((department) => {
    const categories = PRODUCT_CATEGORIES[department.key];
    if (!categories) return [];

    const departmentProducts: TopPick[] = products
      .filter((product) => categories.includes(product.category))
      .map((product) => ({
        id: product._id,
        name: product.productName,
        brand: product.brand || '',
        imageUrl: product.imageUrl || '',
        amazonHref: buildAffiliateRedirectUrl(
          product.productName,
          product.asin,
          '/products',
          product.affiliateLink
        ),
        ...splitBadge(product.awardLabel || 'Recommended'),
        features: product.pros.filter(Boolean).slice(0, 2),
        roundupLabel: getCategoryInfo(department.key)?.displayName || department.title,
        roundupHref: department.href,
        reviewHref: department.href,
      }));
    return departmentProducts.length > 0 ? [{ department, products: departmentProducts }] : [];
  });

  return (
    <main className="min-h-screen bg-white text-charcoal">
      <section className="section-y bg-offwhite">
        <div className="container-page">
          <p className="eyebrow">Product directory</p>
          <h1 className="mt-3 text-h1 font-bold">All Products</h1>
          <p className="mt-4 max-w-2xl text-body">
            Browse our recommended gear, organized by department to help you find what you need for your next shift.
          </p>
        </div>
      </section>

      {departments.length > 0 ? (
        departments.map(({ department, products: departmentProducts }) => (
          <section
            key={department.key}
            aria-labelledby={`${department.key}-products-heading`}
            className="section-y border-b border-hairline"
          >
            <div className="container-page">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow">{department.navLabel}</p>
                  <h2
                    id={`${department.key}-products-heading`}
                    className="mt-2 text-h2 font-bold"
                  >
                    {department.title}
                  </h2>
                </div>
                <Link
                  href={department.href}
                  className="inline-flex items-center gap-2 self-start text-sm font-semibold text-brand-red underline underline-offset-4 hover:text-brand-red-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red sm:self-auto"
                >
                  Read department guides
                </Link>
              </div>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {departmentProducts.map((product) => (
                  <li key={product.id}>
                    <ProductCard pick={product} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))
      ) : (
        <section className="section-y">
          <div className="container-page">
            <p className="text-body">There are no products available right now. Please check back soon.</p>
          </div>
        </section>
      )}
    </main>
  );
}
