import connectDB from '@/lib/db/mongoose';
import Product from '@/lib/db/models/Product';

export interface StartHereComparisonProduct {
  productName: string;
  category: string;
  score: number;
  pros: string[];
  cons: string[];
  editorNote?: string;
}

export async function getStartHereComparisonProducts(): Promise<[StartHereComparisonProduct, StartHereComparisonProduct] | null> {
  try {
    await connectDB();
    const records = await Product.find({ isActive: true })
      .select('productName category score pros cons editorNote')
      .sort({ clickCount: -1, createdAt: -1 })
      .lean();

    const complete = records.filter((product) =>
      typeof product.productName === 'string'
      && Boolean(product.productName.trim())
      && typeof product.category === 'string'
      && typeof product.score === 'number'
      && Number.isFinite(product.score)
      && Array.isArray(product.pros)
      && product.pros.some((value: unknown) => typeof value === 'string' && value.trim())
      && Array.isArray(product.cons)
      && product.cons.some((value: unknown) => typeof value === 'string' && value.trim())
    );

    const categoryGroups = new Map<string, typeof complete>();
    for (const product of complete) {
      const group = categoryGroups.get(product.category) || [];
      group.push(product);
      categoryGroups.set(product.category, group);
    }

    const preferred = complete.filter((product) => /kryptonite/i.test(product.productName));
    const preferredPair = findPreferredPair(preferred);
    const pair = preferredPair || [...categoryGroups.values()].find((products) => products.length >= 2)?.slice(0, 2);

    if (!pair || pair.length !== 2) {
      return null;
    }

    const toPreviewProduct = (product: (typeof pair)[number]): StartHereComparisonProduct => ({
      productName: product.productName,
      category: product.category,
      score: product.score,
      pros: product.pros.filter((value: unknown): value is string => typeof value === 'string' && Boolean(value.trim())).slice(0, 3),
      cons: product.cons.filter((value: unknown): value is string => typeof value === 'string' && Boolean(value.trim())).slice(0, 3),
      editorNote: typeof product.editorNote === 'string' && product.editorNote.trim()
        ? product.editorNote
        : undefined,
    });

    return [toPreviewProduct(pair[0]), toPreviewProduct(pair[1])];
  } catch (error) {
    console.error('Unable to load start-here comparison preview:', error);
    return null;
  }
}

function findPreferredPair<T extends { productName: string; category: string }>(products: T[]) {
  const newYork = products.find((product) => /new york/i.test(product.productName));
  if (!newYork) {
    return null;
  }

  const evolution = products.find((product) =>
    product.category === newYork.category && /evolution/i.test(product.productName)
  );

  return evolution ? [newYork, evolution] : null;
}
