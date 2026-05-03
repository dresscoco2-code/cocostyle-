"use client"

export default function WardrobePage() {
  const categories = [
    { name: "Uppers", emoji: "👕", slug: "uppers" },
    { name: "Lowers", emoji: "👖", slug: "lowers" },
    { name: "Shoes", emoji: "👟", slug: "shoes" },
    { name: "Jackets", emoji: "🧥", slug: "jackets" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", padding: "40px" }}>
      <h1 style={{ color: "white", fontSize: "32px", marginBottom: "8px" }}>
        Wardrobe Categories
      </h1>
      <p style={{ color: "#aaa", marginBottom: "40px" }}>
        Choose where you want to add or view clothes.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {categories.map((cat) => (
          <div
            key={cat.slug}
            onClick={() => window.location.href = `/wardrobe/${cat.slug}`}
            style={{
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "40px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>{cat.emoji}</div>
            <div style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
              {cat.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
