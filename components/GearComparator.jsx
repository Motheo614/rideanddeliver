import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const CATEGORY_CONFIG = {
  "safety-gear": {
    label: "Safety Gear",
    filters: ["Daily commuting", "Long-distance touring", "Night riding", "Bad weather"],
    categories: ["Safety", "Comfort", "Durability", "Weatherproofing", "Value", "Fit"],
  },
  "tech-lighting": {
    label: "Tech & Lighting",
    filters: ["Commuting", "Touring", "Night riding", "Off-road"],
    categories: ["Performance", "Battery life", "Build quality", "Ease of use", "Value", "Connectivity"],
  },
  "bike-security": {
    label: "Bike Security",
    filters: ["Urban parking", "Touring", "Long-term storage"],
    categories: ["Security rating", "Portability", "Ease of use", "Durability", "Deterrence", "Value"],
  },
  "delivery-gear": {
    label: "Delivery Gear",
    filters: ["Bike delivery", "Scooter / moped delivery", "Car delivery", "High-volume shifts"],
    categories: ["Capacity", "Durability", "Comfort", "Weatherproofing", "Value", "Ease of use"],
  },
  "platform-reviews": {
    label: "Platform Reviews",
    filters: ["Bike delivery", "Car delivery", "Full-time", "Side gig"],
    categories: ["Pay & earnings", "Tip reliability", "App reliability", "Support", "Availability", "Value"],
  },
};

const CATEGORY_KEYS = Object.keys(CATEGORY_CONFIG);
const fieldClassName = "min-h-14 w-full rounded border-2 border-[#1a1a1a] bg-white px-3 text-base text-[#1a1a1a] placeholder:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000]";
const primaryButtonClassName = "inline-flex min-h-14 items-center justify-center rounded bg-[#CC0000] px-7 text-base font-black text-white transition-colors hover:bg-[#a80000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-600";
const rowLabelClassName = "px-3 py-4 align-top text-left text-xs font-black uppercase tracking-wide text-[#1a1a1a]";

export default function GearComparator() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryCounts, setCategoryCounts] = useState({});
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productLoadError, setProductLoadError] = useState(false);
  const [productA, setProductA] = useState("");
  const [productB, setProductB] = useState("");
  const [customA, setCustomA] = useState("");
  const [customB, setCustomB] = useState("");
  const [useCustomA, setUseCustomA] = useState(false);
  const [useCustomB, setUseCustomB] = useState(false);
  const [riderStyle, setRiderStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const config = CATEGORY_CONFIG[selectedCategory] || null;
  const nameA = useCustomA ? customA : productA;
  const nameB = useCustomB ? customB : productB;
  const canCompare = Boolean(
    selectedCategory &&
    nameA.trim() &&
    nameB.trim() &&
    nameA.trim() !== nameB.trim()
  );
  const selectedProductA = !useCustomA ? products.find((product) => product.name === productA) : null;
  const selectedProductB = !useCustomB ? products.find((product) => product.name === productB) : null;
  const selectionMessage = nameA.trim() && nameB.trim() && nameA.trim() === nameB.trim()
    ? "Choose two different products."
    : !nameA.trim() || !nameB.trim()
      ? "Choose two products to continue."
      : "";

  useEffect(() => {
    let active = true;
    Promise.all(
      CATEGORY_KEYS.map(async (category) => {
        const response = await fetch(`/api/comparison-products?category=${category}`);
        if (!response.ok) throw new Error(`Could not load ${category} product count.`);
        const data = await response.json();
        return [category, Array.isArray(data.products) ? data.products.length : null];
      }).map((request, index) => request.catch(() => [CATEGORY_KEYS[index], null]))
    ).then((counts) => {
      if (active) setCategoryCounts(Object.fromEntries(counts));
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCategory) return undefined;
    let active = true;
    setProducts([]);
    setProductA("");
    setProductB("");
    setCustomA("");
    setCustomB("");
    setUseCustomA(false);
    setUseCustomB(false);
    setRiderStyle("");
    setResult(null);
    setError(null);
    setProductLoadError(false);
    setLoadingProducts(true);

    fetch(`/api/comparison-products?category=${selectedCategory}`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load product list.");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setProducts(Array.isArray(data.products) ? data.products : []);
        setLoadingProducts(false);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setProductLoadError(true);
        setLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory]);

  async function handleCompare() {
    if (!canCompare || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const catLabel = config.label;
    const comparisonAxes = config.categories.join(", ");
    const riderContext = riderStyle ? `Rider style/use case: ${riderStyle}.` : "";

    // Find DB data for the two products (for review summaries / affiliate links)
    const productAData = products.find(p => p.name === nameA);
    const productBData = products.find(p => p.name === nameB);
    const reviewA = productAData?.reviewSummary ? `RiderComplex review of ${nameA}: "${productAData.reviewSummary}"` : "";
    const reviewB = productBData?.reviewSummary ? `RiderComplex review of ${nameB}: "${productBData.reviewSummary}"` : "";

    const prompt = `You are a motorcycle gear expert writing for ridercomplex.com. Compare these two ${catLabel} for a rider.

Products: "${nameA}" vs "${nameB}"
Category: ${catLabel}
${riderContext}
${reviewA}
${reviewB}

Evaluate them across these specific dimensions: ${comparisonAxes}.

Respond ONLY with a valid JSON object, no markdown, no extra text:
{
  "verdict": "one sentence declaring a winner and why",
  "productA": {
    "name": "${nameA}",
    "pros": ["pro 1", "pro 2", "pro 3"],
    "cons": ["con 1", "con 2"],
    "bestFor": "one sentence on ideal rider/use case"
  },
  "productB": {
    "name": "${nameB}",
    "pros": ["pro 1", "pro 2", "pro 3"],
    "cons": ["con 1", "con 2"],
    "bestFor": "one sentence on ideal rider/use case"
  },
  "categories": {
    ${config.categories.map(c => `"${c}": {"winner": "A or B or Tie", "note": "brief reason"}`).join(",\n    ")}
  },
  "buyAdvice": "2-sentence actionable buying recommendation"
}`;

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult({
        verdict: parsed.verdict,
        productA: {
          name: parsed.productA.name,
          pros: parsed.productA.pros,
          cons: parsed.productA.cons,
          bestFor: parsed.productA.bestFor,
          affiliateUrl: productAData?.affiliateUrl || null,
        },
        productB: {
          name: parsed.productB.name,
          pros: parsed.productB.pros,
          cons: parsed.productB.cons,
          bestFor: parsed.productB.bestFor,
          affiliateUrl: productBData?.affiliateUrl || null,
        },
        categories: parsed.categories,
        buyAdvice: parsed.buyAdvice,
      });
    } catch (e) {
      setError("We couldn't complete this comparison. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setProductA("");
    setProductB("");
    setCustomA("");
    setCustomB("");
    setUseCustomA(false);
    setUseCustomB(false);
    setRiderStyle("");
  }

  function resetCategory() {
    reset();
    setSelectedCategory("");
    setProducts([]);
    setProductLoadError(false);
  }

  const currentStep = result ? 3 : selectedCategory ? 2 : 1;
  const affiliateLinksExist = Boolean(result?.productA.affiliateUrl || result?.productB.affiliateUrl);

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-12 lg:px-12 lg:py-20">
        {selectedCategory && !result && (
          <button
            type="button"
            onClick={resetCategory}
            className="mb-4 min-h-8 text-left text-base font-bold text-gray-700 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000]"
          >
            All categories
          </button>
        )}
        <h1 className="text-[clamp(38px,4.6vw,60px)] font-black leading-[1.04] tracking-[-0.02em]">
          {selectedCategory ? `Compare ${config.label} products` : "Compare gear"}
        </h1>
        <p className="mt-4 text-base leading-[1.6] text-gray-700">
          Choose a category, then two products.
        </p>
        <p className="mt-3 text-sm leading-[1.5] text-gray-700" aria-label="Comparison steps">
          <StepLabel number="1" text="Category" active={currentStep === 1} />,{" "}
          <StepLabel number="2" text="Products" active={currentStep === 2} />,{" "}
          <StepLabel number="3" text="Verdict" active={currentStep === 3} />
        </p>

        {!selectedCategory && !result && (
          <div className="mt-10 border-t border-[#1a1a1a]">
            {CATEGORY_KEYS.map((category) => {
              const count = categoryCounts[category];
              if (count === 0) return null;
              const { label } = CATEGORY_CONFIG[category];
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className="flex min-h-20 w-full items-center justify-between gap-5 border-b border-[#1a1a1a] px-3 py-6 text-left transition-colors hover:bg-gray-50 focus-visible:relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#CC0000]"
                >
                  <span className="text-2xl font-black">{label}</span>
                  {typeof count === "number" && (
                    <span className="shrink-0 text-base text-gray-600">
                      {count} {count === 1 ? "product" : "products"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedCategory && !result && (
          <section className="mt-10" aria-label="Choose products to compare">
            {loadingProducts ? (
              <p className="py-8 text-base text-gray-700" aria-live="polite">
                Loading {config.label} products…
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <ProductPicker
                    id="product-a"
                    label="Product A"
                    products={products}
                    value={productA}
                    onChange={setProductA}
                    customValue={customA}
                    onCustomChange={setCustomA}
                    useCustom={useCustomA}
                    onToggleCustom={setUseCustomA}
                    selectedProduct={selectedProductA}
                  />
                  <ProductPicker
                    id="product-b"
                    label="Product B"
                    products={products}
                    value={productB}
                    onChange={setProductB}
                    customValue={customB}
                    onCustomChange={setCustomB}
                    useCustom={useCustomB}
                    onToggleCustom={setUseCustomB}
                    selectedProduct={selectedProductB}
                    className="border-t border-[#1a1a1a] pt-8 md:border-l md:border-t-0 md:pl-8 md:pt-0"
                  />
                </div>

                {productLoadError && (
                  <p className="mt-6 text-base text-gray-800" role="status">
                    We couldn&apos;t load the product list. You can still enter a product name.
                  </p>
                )}
                {!productLoadError && products.length === 0 && (
                  <p className="mt-6 text-base text-gray-800" role="status">
                    No products are listed in this category yet. You can still enter a product name.
                  </p>
                )}

                <div className="mt-8 border-t-2 border-[#1a1a1a] pt-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="w-full md:max-w-[560px]">
                      <label htmlFor="use-case" className="mb-2 block text-[13px] font-black uppercase tracking-wide">
                        Use case
                      </label>
                      <select
                        id="use-case"
                        value={riderStyle}
                        onChange={(event) => setRiderStyle(event.target.value)}
                        className={fieldClassName}
                      >
                        <option value="">Any use case</option>
                        {config.filters.map((filter) => <option key={filter} value={filter}>{filter}</option>)}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleCompare}
                      disabled={!canCompare || loading}
                      className={`${primaryButtonClassName} w-full md:w-auto`}
                    >
                      {loading ? "Comparing…" : "Compare"}
                    </button>
                  </div>
                  {selectionMessage && (
                    <p className="mt-3 text-sm text-gray-700" aria-live="polite">
                      {selectionMessage}
                    </p>
                  )}
                  {error && (
                    <p className="mt-3 text-base text-gray-800" role="alert" aria-live="polite">
                      {error}
                    </p>
                  )}
                  {loading && (
                    <p className="mt-3 text-base text-gray-700" aria-live="polite">
                      Comparing…
                    </p>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {result && (
          <section className="mt-10" aria-label="Comparison result">
            <p className="text-[13px] font-black uppercase tracking-wide text-gray-600">{config.label}</p>
            <h2 className="mt-2 break-words text-[clamp(30px,3.6vw,44px)] font-black leading-[1.08] tracking-[-0.02em] [overflow-wrap:anywhere]">
              {result.productA.name} vs {result.productB.name}
            </h2>

            <div className="mt-8 border-t-2 border-[#1a1a1a] pt-5">
              <h3 className="text-[13px] font-black uppercase tracking-wide">Verdict</h3>
              <p className="mt-3 max-w-[760px] text-xl leading-[1.5]">{result.verdict}</p>
              <p className="mt-3 text-sm leading-[1.5] text-gray-700">
                Generated by AI. For products we have reviewed, it can draw on our own notes.
              </p>
            </div>

            <div className="mt-8">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full table-fixed border-t-[3px] border-b border-[#1a1a1a] text-left">
                  <caption className="sr-only">Comparison of {result.productA.name} and {result.productB.name}</caption>
                  <colgroup>
                    <col className="w-[20%]" />
                    <col className="w-[40%]" />
                    <col className="w-[40%]" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col" className="px-3 py-4" />
                      {[result.productA, result.productB].map((product, index) => (
                        <th key={index} scope="col" className="break-words border-l border-[#1a1a1a] px-4 py-4 align-bottom text-[22px] font-black leading-tight [overflow-wrap:anywhere]">
                          {product.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-300">
                      <th scope="row" className={rowLabelClassName}>Score</th>
                      <td className="border-l border-[#1a1a1a] px-4 py-4 text-base font-bold">
                        {formatScore(selectedProductA?.score)}
                      </td>
                      <td className="border-l border-[#1a1a1a] px-4 py-4 text-base font-bold">
                        {formatScore(selectedProductB?.score)}
                      </td>
                    </tr>
                    {(["Pros", "Cons"] ).map((kind) => (
                      <tr key={kind} className="border-t border-gray-300">
                        <th scope="row" className={rowLabelClassName}>{kind}</th>
                        {[result.productA, result.productB].map((product, index) => (
                          <td key={index} className="border-l border-[#1a1a1a] px-4 py-4 align-top text-sm leading-[1.5]">
                            <ItemList items={product[kind.toLowerCase()]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="border-t border-gray-300">
                      <th scope="row" className={rowLabelClassName}>Best for</th>
                      {[result.productA, result.productB].map((product, index) => (
                        <td key={index} className="border-l border-[#1a1a1a] px-4 py-4 align-top text-sm leading-[1.5] [overflow-wrap:anywhere]">
                          {product.bestFor}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-gray-300">
                      <th scope="row" className={rowLabelClassName}>Check price</th>
                      {[result.productA, result.productB].map((product, index) => (
                        <td key={index} className="border-l border-[#1a1a1a] px-4 py-4">
                          {product.affiliateUrl && (
                            <a
                              href={product.affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className={`${primaryButtonClassName} w-full`}
                            >
                              Check price
                            </a>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-8 border-t-[3px] border-b border-[#1a1a1a] md:hidden">
                {[result.productA, result.productB].map((product, index) => (
                  <div key={index} className={index > 0 ? "border-t-2 border-[#1a1a1a] pt-6" : "pt-6"}>
                    <h3 className="break-words text-xl font-black [overflow-wrap:anywhere]">{product.name}</h3>
                    <dl className="mt-4">
                      <ResultDetail label="Score">
                        <span className="font-bold">{formatScore(index === 0 ? selectedProductA?.score : selectedProductB?.score)}</span>
                      </ResultDetail>
                      <ResultDetail label="Pros"><ItemList items={product.pros} /></ResultDetail>
                      <ResultDetail label="Cons"><ItemList items={product.cons} /></ResultDetail>
                      <ResultDetail label="Best for"><span className="[overflow-wrap:anywhere]">{product.bestFor}</span></ResultDetail>
                      <ResultDetail label="Check price">
                        {product.affiliateUrl && (
                          <a
                            href={product.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className={`${primaryButtonClassName} w-full`}
                          >
                            Check price
                          </a>
                        )}
                      </ResultDetail>
                    </dl>
                  </div>
                ))}
              </div>
            </div>

            {affiliateLinksExist && (
              <p className="mt-4 text-sm leading-[1.5] text-gray-700">
                If you make a purchase through these links, we may earn a commission at no extra cost to you.{" "}
                <Link
                  href="/affiliate-disclaimer"
                  className="font-bold underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000]"
                >
                  Affiliate disclaimer
                </Link>
              </p>
            )}

            <div className="mt-10">
              <h3 className="border-t-2 border-[#1a1a1a] pt-5 text-xl font-black">
                Head to head: {config.label}
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full table-fixed border-t-[3px] border-b border-[#1a1a1a] text-left text-sm">
                  <caption className="sr-only">Head to head comparison by criterion</caption>
                  <colgroup>
                    <col className="w-[28%]" />
                    <col className="w-[26%]" />
                    <col className="w-[46%]" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col" className="px-3 py-3 font-black">Criterion</th>
                      <th scope="col" className="border-l border-[#1a1a1a] px-3 py-3 font-black">Better</th>
                      <th scope="col" className="border-l border-[#1a1a1a] px-3 py-3 font-black">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(result.categories).map(([category, data]) => {
                      const better = data.winner === "A"
                        ? result.productA.name
                        : data.winner === "B"
                          ? result.productB.name
                          : "Tie";
                      return (
                        <tr key={category} className="border-t border-gray-300">
                          <th scope="row" className="break-words px-3 py-3 text-left font-bold [overflow-wrap:anywhere]">{category}</th>
                          <td className="break-words border-l border-[#1a1a1a] px-3 py-3 font-bold [overflow-wrap:anywhere]">{better}</td>
                          <td className="break-words border-l border-[#1a1a1a] px-3 py-3 text-gray-800 [overflow-wrap:anywhere]">{data.note}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-10 max-w-[760px]">
              <h3 className="text-xl font-black">Buying advice</h3>
              <p className="mt-3 text-base leading-[1.6] text-gray-800">{result.buyAdvice}</p>
            </div>

            <div className="mt-10 flex flex-col items-start gap-4 border-t border-[#1a1a1a] pt-6 sm:flex-row sm:gap-8">
              <button
                type="button"
                onClick={reset}
                className="min-h-8 text-left text-base font-bold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000]"
              >
                Compare different {config.label.toLowerCase()} products
              </button>
              <button
                type="button"
                onClick={resetCategory}
                className="min-h-8 text-left text-base font-bold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000]"
              >
                Choose another category
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StepLabel({ number, text, active }) {
  return (
    <span className={active ? "font-black text-[#1a1a1a]" : "font-normal"}>
      {number} {text}
    </span>
  );
}

function ProductPicker({
  id,
  label,
  products,
  value,
  onChange,
  customValue,
  onCustomChange,
  useCustom,
  onToggleCustom,
  selectedProduct,
  className = "",
}) {
  return (
    <div className={`min-w-0 pb-8 ${className}`}>
      <label htmlFor={id} className="mb-2 block text-[13px] font-black uppercase tracking-wide">
        {label}
      </label>
      {!useCustom ? (
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={fieldClassName}>
          <option value="">Choose a product</option>
          {products.map((product) => <option key={product.name} value={product.name}>{product.name}</option>)}
        </select>
      ) : (
        <input
          id={id}
          type="text"
          value={customValue}
          onChange={(event) => onCustomChange(event.target.value)}
          placeholder="Enter product name"
          className={fieldClassName}
        />
      )}
      {useCustom ? (
        <button
          type="button"
          onClick={() => {
            onToggleCustom(false);
            onChange("");
            onCustomChange("");
          }}
          className="mt-3 min-h-8 text-left text-[15px] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000]"
        >
          Choose from the list
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            onToggleCustom(true);
            onChange("");
            onCustomChange("");
          }}
          className="mt-3 min-h-8 text-left text-[15px] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CC0000]"
        >
          Not listed? Type it
        </button>
      )}
      {selectedProduct && (
        <div className="mt-4 flex items-center gap-3">
          {selectedProduct.imageUrl && (
            <Image
              src={selectedProduct.imageUrl}
              alt={`${selectedProduct.name} product image`}
              width={96}
              height={96}
              sizes="96px"
              unoptimized
              className="h-24 w-24 rounded object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="break-words font-bold [overflow-wrap:anywhere]">{selectedProduct.name}</p>
            {typeof selectedProduct.score === "number" && Number.isFinite(selectedProduct.score) && (
              <p className="mt-1 text-sm text-gray-700">
                Our score: <span className="font-bold text-[#1a1a1a]">{formatScore(selectedProduct.score)}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultDetail({ label, children }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border-t border-gray-300 py-4">
      <dt className="text-xs font-black uppercase tracking-wide">{label}</dt>
      <dd className="min-w-0 text-sm leading-[1.5]">{children}</dd>
    </div>
  );
}

function ItemList({ items }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, index) => (
        <li key={index} className="break-words [overflow-wrap:anywhere]">{item}</li>
      ))}
    </ul>
  );
}

function formatScore(score) {
  return typeof score === "number" && Number.isFinite(score)
    ? `${score.toFixed(1)} / 10`
    : "Not available";
}
