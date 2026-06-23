import { useState, useEffect } from "react";

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
  const [riderStyle, setRiderStyle] = useState("");
  const [budget, setBudget] = useState("");
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
    const riderContext = riderStyle ? `Rider style/use case: ${riderStyle}.` : "";
    const budgetContext = budget ? `Budget range: ${budget}.` : "";

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
      // Inject affiliate links from DB if available
      parsed.productA.affiliateUrl = productAData?.affiliateUrl || null;
      parsed.productB.affiliateUrl = productBData?.affiliateUrl || null;
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
    setRiderStyle("");
    setBudget("");
  }

  function resetCategory() {
    reset();
    setSelectedCategory("");
    setProducts([]);
  }

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: TEXT, fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "32px 20px" }}>

        {/* Back to all categories (moved from bespoke header) */}
        {selectedCategory && (
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-start' }}>
            <button onClick={resetCategory} style={{ background: 'none', border: `1px solid ${BORDER}`, color: MUTED, borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
              ← All categories
            </button>
          </div>
        )}

        

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

                {/* Optional filters */}
                <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
                  <div style={{ fontSize: "11px", color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 600 }}>
                    Optional — personalise the comparison
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "13px", color: MUTED, display: "block", marginBottom: "6px" }}>Use case</label>
                      <select value={riderStyle} onChange={e => setRiderStyle(e.target.value)} style={selectStyle()}>
                        <option value="">Any</option>
                        {config.filters.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "13px", color: MUTED, display: "block", marginBottom: "6px" }}>Budget</label>
                      <select value={budget} onChange={e => setBudget(e.target.value)} style={selectStyle()}>
                        <option value="">Any</option>
                        <option>Under $50</option>
                        <option>$50–$150</option>
                        <option>$150–$300</option>
                        <option>$300–$500</option>
                        <option>$500+</option>
                      </select>
                    </div>
                  </div>
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
                  {loading ? `Comparing ${config.label.toLowerCase()}…` : `Compare ${config.label} →`}
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              {[result.productA, result.productB].map((p, i) => (
                <div key={i} style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "20px" }}>
                  <div style={{ fontSize: "11px", color: ACCENT, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                    Product {i === 0 ? "A" : "B"}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>{p.name}</div>
                  <div style={{ fontSize: "13px", color: MUTED, marginBottom: "16px" }}>{p.priceRange}</div>
                  <div style={{ marginBottom: "12px" }}>
                    {p.pros.map((pro, j) => (
                      <div key={j} style={{ display: "flex", gap: "8px", fontSize: "13px", marginBottom: "6px", alignItems: "flex-start" }}>
                        <span style={{ color: "#4CAF50", flexShrink: 0 }}>✓</span><span>{pro}</span>
                      </div>
                    ))}
                    {p.cons.map((con, j) => (
                      <div key={j} style={{ display: "flex", gap: "8px", fontSize: "13px", marginBottom: "6px", alignItems: "flex-start", color: "#aaa" }}>
                        <span style={{ color: "#FF6B6B", flexShrink: 0 }}>✗</span><span>{con}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "12px", color: MUTED, borderTop: `1px solid ${BORDER}`, paddingTop: "12px", marginBottom: "12px" }}>
                    <span style={{ color: ACCENT, fontWeight: 600 }}>Best for: </span>{p.bestFor}
                  </div>
                  {p.affiliateUrl ? (
                    <a
                      href={p.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      style={{
                        display: "block", textAlign: "center",
                        background: ACCENT, color: "#fff",
                        padding: "10px", borderRadius: "8px",
                        fontSize: "13px", fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Check Price →
                    </a>
                  ) : (
                    <div style={{ textAlign: "center", fontSize: "11px", color: BORDER, padding: "8px" }}>[ Add affiliate link ]</div>
                  )}
                </div>
              ))}
            </div>

            {/* Head to head */}
            <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
              <div style={{ fontSize: "13px", color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "16px" }}>
                Head-to-head — {config.label}
              </div>
              {Object.entries(result.categories).map(([cat, data]) => {
                const isA = data.winner === "A";
                const isB = data.winner === "B";
                const winnerName = isA ? nameA : isB ? nameB : "Tie";
                return (
                  <div key={cat} style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{cat}</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: data.winner === "Tie" ? MUTED : ACCENT, background: data.winner === "Tie" ? BORDER : `${ACCENT}22`, padding: "2px 8px", borderRadius: "4px" }}>
                        {data.winner === "Tie" ? "Tie" : `${winnerName} wins`}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                      <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: isA ? ACCENT : BORDER }} />
                      <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: isB ? ACCENT : BORDER }} />
                    </div>
                    <div style={{ fontSize: "12px", color: MUTED }}>{data.note}</div>
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
              ← Compare other {config.label.toLowerCase()}
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
