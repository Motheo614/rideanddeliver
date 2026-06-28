import { useState, useEffect } from "react";
import Image from "next/image";

// Category config — comparison attributes are tailored per category
const CATEGORY_CONFIG = {
  "safety-gear": {
    label: "Safety Gear",
    icon: "⛑",
    filters: ["Daily commuting", "Long-distance touring", "Night riding", "Bad weather"],
    categories: ["Safety", "Comfort", "Durability", "Weatherproofing", "Value", "Fit"],
  },
  "tech-lighting": {
    label: "Tech & Lighting",
    icon: "💡",
    filters: ["Commuting", "Touring", "Night riding", "Off-road"],
    categories: ["Performance", "Battery life", "Build quality", "Ease of use", "Value", "Connectivity"],
  },
  "bike-security": {
    label: "Bike Security",
    icon: "🔒",
    filters: ["Urban parking", "Touring", "Long-term storage"],
    categories: ["Security rating", "Portability", "Ease of use", "Durability", "Deterrence", "Value"],
  },
  "delivery-gear": {
    label: "Delivery Gear",
    icon: "🎒",
    filters: ["Bike delivery", "Scooter / moped delivery", "Car delivery", "High-volume shifts"],
    categories: ["Capacity", "Durability", "Comfort", "Weatherproofing", "Value", "Ease of use"],
  },
  "platform-reviews": {
    label: "Platform Reviews",
    icon: "📱",
    filters: ["Bike delivery", "Car delivery", "Full-time", "Side gig"],
    categories: ["Pay & earnings", "Tip reliability", "App reliability", "Support", "Availability", "Value"],
  },
};

// Theme tokens changed to match the main site (light theme)
const ACCENT = "#CC0000"; // brand red
const DARK = "#ffffff";
const MID = "#ffffff";
const PANEL = "#ffffff";
const BORDER = "#e5e7eb"; // light gray border
const TEXT = "#1a1a1a";
const MUTED = "#6b7280";

const PRODUCT_COLORS = [
  {
    dot: 'bg-red-600',
    border: 'border-red-600',
    text: 'text-red-700',
    pillBg: 'bg-red-100',
    pillText: 'text-red-700',
    bar: 'bg-red-600',
    mutedBar: 'bg-red-600/30',
  },
  {
    dot: 'bg-sky-600',
    border: 'border-sky-600',
    text: 'text-sky-700',
    pillBg: 'bg-sky-100',
    pillText: 'text-sky-700',
    bar: 'bg-sky-600',
    mutedBar: 'bg-sky-600/30',
  },
];

function getShortName(name) {
  if (!name) return 'Product';
  const cleaned = String(name).trim().replace(/\s*[-–|:]\s*.*$/, '');
  const words = cleaned.split(/\s+/);
  return words.length <= 4 ? cleaned : `${words.slice(0, 4).join(' ')}...`;
}

function getDefaultRiderStyle(category) {
  switch (category) {
    case 'safety-gear':
      return 'general safety';
    case 'tech-lighting':
      return 'general use';
    case 'bike-security':
      return 'general security';
    case 'delivery-gear':
      return 'general delivery';
    case 'platform-reviews':
      return 'general';
    default:
      return 'general';
  }
}

function ProductThumbnail({ src, alt, colorClasses }) {
  const [failed, setFailed] = useState(false);
  const hasImage = src && !failed;

  return (
    <div className={`relative w-11 h-11 min-w-[36px] min-h-[36px] rounded-xl overflow-hidden border ${colorClasses.border} bg-gray-100 flex items-center justify-center`}>
      {hasImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="44px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 21l-4.35-4.35" />
            <circle cx="10" cy="10" r="7" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function GearComparator() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productA, setProductA] = useState("");
  const [productB, setProductB] = useState("");
  const [customA, setCustomA] = useState("");
  const [customB, setCustomB] = useState("");
  const [useCustomA, setUseCustomA] = useState(false);
  const [useCustomB, setUseCustomB] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const config = CATEGORY_CONFIG[selectedCategory] || null;
  const nameA = useCustomA ? customA : productA;
  const nameB = useCustomB ? customB : productB;
  const canCompare = selectedCategory && nameA.trim() && nameB.trim() && nameA !== nameB;

  // Fetch products from your MongoDB API when category changes
  useEffect(() => {
    if (!selectedCategory) return;
    setProducts([]);
    setProductA("");
    setProductB("");
    setUseCustomA(false);
    setUseCustomB(false);
    setResult(null);
    setLoadingProducts(true);

    fetch(`/api/comparison-products?category=${selectedCategory}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  }, [selectedCategory]);

  async function handleCompare() {
    if (!canCompare) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const catLabel = config.label;
    const comparisonAxes = config.categories.join(", ");
    const defaultRiderStyle = getDefaultRiderStyle(selectedCategory);
    const riderContext = `Rider style/use case: ${defaultRiderStyle}.`;
    const budgetContext = `Budget range: Any.`;

    // Find DB data for the two products (for review summaries / affiliate links)
    const productAData = products.find(p => p.name === nameA);
    const productBData = products.find(p => p.name === nameB);
    const reviewA = productAData?.reviewSummary ? `RiderComplex review of ${nameA}: "${productAData.reviewSummary}"` : "";
    const reviewB = productBData?.reviewSummary ? `RiderComplex review of ${nameB}: "${productBData.reviewSummary}"` : "";

    const prompt = `You are a motorcycle gear expert writing for ridercomplex.com. Compare these two ${catLabel} for a rider.

Products: "${nameA}" vs "${nameB}"
Category: ${catLabel}
${riderContext}
${budgetContext}
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
    "bestFor": "one sentence on ideal rider/use case",
    "priceRange": "$XXX–$XXX"
  },
  "productB": {
    "name": "${nameB}",
    "pros": ["pro 1", "pro 2", "pro 3"],
    "cons": ["con 1", "con 2"],
    "bestFor": "one sentence on ideal rider/use case",
    "priceRange": "$XXX–$XXX"
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
      // Inject affiliate links and metadata from DB if available
      const affiliateLinkA = productAData?.affiliateUrl || null;
      const affiliateLinkB = productBData?.affiliateUrl || null;
      parsed.productA = {
        ...parsed.productA,
        affiliateLink: affiliateLinkA,
        affiliateUrl: affiliateLinkA,
        imageUrl: productAData?.imageUrl || null,
        score: typeof productAData?.score === 'number' ? productAData.score : null,
        shortName: productAData?.shortName || getShortName(nameA),
      };
      parsed.productB = {
        ...parsed.productB,
        affiliateLink: affiliateLinkB,
        affiliateUrl: affiliateLinkB,
        imageUrl: productBData?.imageUrl || null,
        score: typeof productBData?.score === 'number' ? productBData.score : null,
        shortName: productBData?.shortName || getShortName(nameB),
      };
      setResult(parsed);
    } catch (e) {
      setError("Something went wrong. Please try again.");
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
  }

  function resetCategory() {
    setSelectedCategory("");
    reset();
  }

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "24px 16px" }}>
      <div style={{ maxWidth: "920px", margin: "0 auto", background: DARK, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: ACCENT, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
            Gear comparison
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: TEXT, marginBottom: "6px" }}>
            Compare two products side by side
          </div>
          <div style={{ fontSize: "14px", color: MUTED, lineHeight: 1.6 }}>
            Choose a category, pick two products, and get a quick expert verdict.
          </div>
        </div>

        {/* Step 1 — Category picker */}
        {!selectedCategory && (
          <>
            <div style={{ fontSize: "13px", color: MUTED, marginBottom: "20px" }}>
              Choose a gear category to compare two products side by side.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
              {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  style={{
                    background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "10px",
                    padding: "20px 16px", cursor: "pointer", textAlign: "center",
                    color: TEXT, transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
                  onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                >
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{cat.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{cat.label}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2 — Product picker + compare */}
        {selectedCategory && !result && (
          <>
            {loadingProducts && (
              <div style={{ textAlign: "center", color: MUTED, padding: "32px", fontSize: "13px" }}>
                Loading your reviewed {config.label.toLowerCase()}…
              </div>
            )}

            {!loadingProducts && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "16px", alignItems: "start", marginBottom: "24px" }}>
                  <ProductPicker
                    label="Product A"
                    products={products}
                    value={productA}
                    onChange={setProductA}
                    customValue={customA}
                    onCustomChange={setCustomA}
                    useCustom={useCustomA}
                    onToggleCustom={setUseCustomA}
                  />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "32px", color: MUTED, fontWeight: 800, fontSize: "20px" }}>VS</div>
                  <ProductPicker
                    label="Product B"
                    products={products}
                    value={productB}
                    onChange={setProductB}
                    customValue={customB}
                    onCustomChange={setCustomB}
                    useCustom={useCustomB}
                    onToggleCustom={setUseCustomB}
                  />
                </div>

                {error && (
                  <div style={{ color: "#FF6B6B", background: "#1A0000", border: "1px solid #FF6B6B", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "14px" }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCompare}
                  disabled={!canCompare || loading}
                  style={{
                    width: "100%", padding: "16px",
                    background: canCompare && !loading ? ACCENT : BORDER,
                    color: canCompare && !loading ? "#fff" : MUTED,
                    border: "none", borderRadius: "10px",
                    fontSize: "15px", fontWeight: 700, cursor: canCompare && !loading ? "pointer" : "not-allowed",
                  }}
                >
                  {loading ? `Comparing ${config.label.toLowerCase()}…` : `Compare ${config.label}`}
                </button>
              </>
            )}
          </>
        )}

        {/* Step 3 — Results */}
        {result && (
          <>
            {/* Verdict */}
            <div style={{ background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}08)`, border: `1px solid ${ACCENT}44`, borderRadius: "12px", padding: "20px 24px", marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>Verdict</div>
              <div style={{ fontSize: "16px", lineHeight: 1.5 }}>{result.verdict}</div>
            </div>

            {/* Side by side */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
              {[result.productA, result.productB].map((p, i) => {
                const color = PRODUCT_COLORS[i];
                return (
                  <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <ProductThumbnail src={p.imageUrl} alt={p.name} colorClasses={color} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2.5 w-2.5 rounded-full ${color.dot}`} />
                          <p className="truncate text-sm font-semibold text-gray-900">{p.shortName || getShortName(p.name)}</p>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Editorial score: {typeof p.score === 'number' ? `${p.score.toFixed(1)}/10` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {p.affiliateLink ? (
                      <a
                        href={p.affiliateLink}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#CC0000] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700"
                      >
                        Check Price
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Head to head */}
            <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
              <div style={{ fontSize: "13px", color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "16px" }}>
                Head-to-head — {config.label}
              </div>
              {Object.entries(result.categories).map(([cat, data]) => {
                const isA = data.winner === "A";
                const isB = data.winner === "B";
                const winnerLabel = data.winner === "Tie"
                  ? "Tie"
                  : `${getShortName(data.winner === "A" ? result.productA.shortName || result.productA.name : result.productB.shortName || result.productB.name)} wins`;
                const winnerColor = data.winner === "A" ? PRODUCT_COLORS[0] : data.winner === "B" ? PRODUCT_COLORS[1] : null;
                return (
                  <div key={cat} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-semibold text-gray-900">{cat}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${data.winner === "Tie" ? 'bg-gray-100 text-gray-500' : `${winnerColor.pillBg} ${winnerColor.pillText}`}`}>
                        {winnerLabel}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <div className={`flex-1 h-2 rounded-full ${isA ? PRODUCT_COLORS[0].bar : PRODUCT_COLORS[0].mutedBar}`} />
                      <div className={`flex-1 h-2 rounded-full ${isB ? PRODUCT_COLORS[1].bar : PRODUCT_COLORS[1].mutedBar}`} />
                    </div>
                    <div className="text-xs text-gray-500">{data.note}</div>
                  </div>
                );
              })}
            </div>

            {/* Buy advice */}
            <div style={{ background: MID, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", color: ACCENT, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Our recommendation</div>
              <div style={{ fontSize: "14px", lineHeight: 1.6 }}>{result.buyAdvice}</div>
            </div>

            <button onClick={reset} style={{ width: "100%", padding: "14px", background: "transparent", color: TEXT, border: `1px solid ${BORDER}`, borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "12px" }}>
              Compare other {config.label.toLowerCase()}
            </button>
            <button onClick={resetCategory} style={{ width: "100%", padding: "14px", background: "transparent", color: MUTED, border: "none", fontSize: "13px", cursor: "pointer" }}>
              Choose a different category
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ProductPicker({ label, products, value, onChange, customValue, onCustomChange, useCustom, onToggleCustom }) {
  return (
    <div>
      <div style={{ fontSize: "11px", color: ACCENT, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>{label}</div>
      {!useCustom ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={selectStyle()}>
          <option value="">Select a product…</option>
          {products.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
        </select>
      ) : (
        <input
          value={customValue}
          onChange={e => onCustomChange(e.target.value)}
          placeholder="Type product name…"
          style={{ width: "100%", padding: "10px 12px", background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "8px", color: TEXT, fontSize: "14px", boxSizing: "border-box", outline: "none" }}
        />
      )}
      <button
        onClick={() => { onToggleCustom(!useCustom); onChange(""); onCustomChange(""); }}
        style={{ marginTop: "6px", background: "none", border: "none", color: MUTED, fontSize: "11px", cursor: "pointer", padding: "0", textDecoration: "underline" }}
      >
        {useCustom ? "← Pick from list" : "Not listed? Type it"}
      </button>
    </div>
  );
}

function selectStyle() {
  return {
    width: "100%", padding: "10px 12px",
    background: PANEL, border: `1px solid ${BORDER}`,
    borderRadius: "8px", color: TEXT,
    fontSize: "14px", boxSizing: "border-box",
    appearance: "none", outline: "none",
  };
}
