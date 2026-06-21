import Link from 'next/link';

interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function buildPageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export default function CategoryPagination({
  currentPage,
  totalPages,
  basePath,
}: CategoryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Category pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <Link
        href={buildPageHref(basePath, currentPage - 1)}
        className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
          currentPage <= 1
            ? 'pointer-events-none cursor-not-allowed border-gray-200 text-gray-400'
            : 'border-gray-300 text-gray-700 hover:border-[#CC0000] hover:text-[#CC0000]'
        }`}
      >
        Previous
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={buildPageHref(basePath, page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
            page === currentPage
              ? 'border-[#CC0000] bg-[#CC0000] text-white'
              : 'border-gray-300 text-gray-700 hover:border-[#CC0000] hover:text-[#CC0000]'
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={buildPageHref(basePath, currentPage + 1)}
        className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
          currentPage >= totalPages
            ? 'pointer-events-none cursor-not-allowed border-gray-200 text-gray-400'
            : 'border-gray-300 text-gray-700 hover:border-[#CC0000] hover:text-[#CC0000]'
        }`}
      >
        Next
      </Link>
    </nav>
  );
}
