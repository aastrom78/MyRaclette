import { useState, useEffect } from "react";

// ─── Données initiales ────────────────────────────────────────────────────────
const INITIAL_INGREDIENTS = [
  { id: 1, nom: "Raclette AOP Valais", categorie: "Fromage", emoji: "🧀", note: 5, stock: true },
  { id: 2, nom: "Raclette fumée", categorie: "Fromage", emoji: "🧀", note: 4, stock: true },
  { id: 3, nom: "Pommes de terre grenaille", categorie: "Féculents", emoji: "🥔", note: 5, stock: true },
  { id: 4, nom: "Charcuterie italienne", categorie: "Viandes", emoji: "🥩", note: 4, stock: false },
  { id: 5, nom: "Jambon cru de Savoie", categorie: "Viandes", emoji: "🍖", note: 5, stock: true },
  { id: 6, nom: "Cornichons maison", categorie: "Condiments", emoji: "🥒", note: 5, stock: true },
  { id: 7, nom: "Oignons grelots", categorie: "Légumes", emoji: "🧅", note: 4, stock: false },
  { id: 8, nom: "Champignons sautés", categorie: "Légumes", emoji: "🍄", note: 3, stock: true },
  { id: 9, nom: "Poivrons marinés", categorie: "Légumes", emoji: "🌶️", note: 4, stock: true },
  { id: 10, nom: "Vin blanc de Savoie", categorie: "Boissons", emoji: "🍷", note: 5, stock: true },
];

const INITIAL_SOIREES = [
  {
    id: 1,
    date: "2024-12-24",
    nom: "Réveillon de Noël",
    invites: ["Sophie", "Marc", "Emma", "Lucas"],
    ingredients: [1, 3, 5, 6, 10],
    note: 5,
    avis: "La meilleure raclette de l'année ! L'AOP Valais était parfaite.",
    duree: 180,
    quantiteFromage: 1200,
  },
  {
    id: 2,
    date: "2025-01-18",
    nom: "Soirée ski indoor",
    invites: ["Thomas", "Léa", "Pierre"],
    ingredients: [2, 3, 4, 6, 7],
    note: 4,
    avis: "Super ambiance, fromage fumé très apprécié.",
    duree: 120,
    quantiteFromage: 900,
  },
  {
    id: 3,
    date: "2025-02-08",
    nom: "Dîner du vendredi",
    invites: ["Sophie", "Tom"],
    ingredients: [1, 3, 5, 6, 8, 9],
    note: 4,
    avis: "Classique et efficace. Les champignons sautés : gros hit !",
    duree: 90,
    quantiteFromage: 600,
  },
];

const CATEGORIES = ["Fromage", "Féculents", "Viandes", "Légumes", "Condiments", "Boissons", "Autre"];

const CAT_COLORS = {
  "Fromage": "#F5A623",
  "Féculents": "#8B6914",
  "Viandes": "#C0392B",
  "Légumes": "#27AE60",
  "Condiments": "#E67E22",
  "Boissons": "#8E44AD",
  "Autre": "#7F8C8D",
};

// ─── Utilitaires ──────────────────────────────────────────────────────────────
const formatDate = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "–";

// ─── Composants UI ────────────────────────────────────────────────────────────
const Badge = ({ color, children }) => (
  <span style={{
    background: color + "22",
    color: color,
    border: `1px solid ${color}44`,
    borderRadius: "20px",
    padding: "2px 10px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  }}>{children}</span>
);

const StarRating = ({ value, onChange, size = 20 }) => (
  <div style={{ display: "flex", gap: 2, cursor: onChange ? "pointer" : "default" }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} onClick={() => onChange && onChange(i)}
        style={{ fontSize: size, color: i <= value ? "#F5A623" : "#3a2e1e", transition: "color 0.15s" }}>
        {i <= value ? "★" : "☆"}
      </span>
    ))}
  </div>
);

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(20,14,8,0.85)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#1E160D",
        border: "1px solid #3D2E1A",
        borderRadius: 20, padding: 28, maxWidth: 520, width: "100%",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
      }}>
        {children}
      </div>
    </div>
  );
};

// ─── Vue : Dashboard ─────────────────────────────────────────────────────────
function Dashboard({ soirees, ingredients }) {
  const totalFromage = soirees.reduce((a, s) => a + s.quantiteFromage, 0);
  const totalInvites = soirees.reduce((a, s) => a + s.invites.length, 0);
  const notesMoyenne = avg(soirees.map(s => s.note));
  const totalDuree = soirees.reduce((a, s) => a + s.duree, 0);

  // Top ingrédients
  const ingCount = {};
  soirees.forEach(s => s.ingredients.forEach(id => { ingCount[id] = (ingCount[id] || 0) + 1; }));
  const topIng = Object.entries(ingCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, count]) => ({ ...ingredients.find(i => i.id === Number(id)), count }));

  // Tous les invités uniques
  const allGuests = [...new Set(soirees.flatMap(s => s.invites))];
  const guestCount = {};
  soirees.forEach(s => s.invites.forEach(g => { guestCount[g] = (guestCount[g] || 0) + 1; }));
  const topGuests = Object.entries(guestCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const StatCard = ({ emoji, label, value, sub }) => (
    <div style={{
      background: "linear-gradient(135deg, #1E160D 0%, #2A1C0E 100%)",
      border: "1px solid #3D2E1A",
      borderRadius: 16, padding: "20px 24px",
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <span style={{ fontSize: 36 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#F5C87A", fontFamily: "'Playfair Display', serif" }}>{value}</div>
        <div style={{ fontSize: 13, color: "#A08060", fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#705040", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#F5C87A", margin: "0 0 4px" }}>Tableau de bord</h2>
        <p style={{ color: "#705040", margin: 0, fontSize: 14 }}>Ton historique raclette en un coup d'œil</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard emoji="🧀" label="Soirées raclette" value={soirees.length} sub={`${totalDuree} min au total`} />
        <StatCard emoji="⚖️" label="Fromage fondu" value={`${(totalFromage / 1000).toFixed(1)} kg`} sub="depuis le début" />
        <StatCard emoji="👥" label="Convives totaux" value={totalInvites} sub={`${allGuests.length} ami·es uniques`} />
        <StatCard emoji="⭐" label="Note moyenne" value={notesMoyenne} sub="sur 5 étoiles" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top ingrédients */}
        <div style={{
          background: "linear-gradient(135deg, #1E160D 0%, #2A1C0E 100%)",
          border: "1px solid #3D2E1A", borderRadius: 16, padding: 24
        }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#F5C87A", margin: "0 0 16px", fontSize: 18 }}>
            🏆 Ingrédients stars
          </h3>
          {topIng.map((ing, i) => (
            <div key={ing.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22, minWidth: 32, textAlign: "center" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ing.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#E8D0A0", fontSize: 14, fontWeight: 600 }}>{ing.nom}</div>
                <div style={{ height: 4, background: "#2A1C0E", borderRadius: 2, marginTop: 4 }}>
                  <div style={{ height: 4, borderRadius: 2, background: "#F5A623", width: `${(ing.count / soirees.length) * 100}%`, transition: "width 0.6s" }} />
                </div>
              </div>
              <span style={{ color: "#F5A623", fontWeight: 700, fontSize: 13 }}>{ing.count}×</span>
            </div>
          ))}
        </div>

        {/* Top invités */}
        <div style={{
          background: "linear-gradient(135deg, #1E160D 0%, #2A1C0E 100%)",
          border: "1px solid #3D2E1A", borderRadius: 16, padding: 24
        }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#F5C87A", margin: "0 0 16px", fontSize: 18 }}>
            👥 Habitués de la table
          </h3>
          {topGuests.map(([name, count], i) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `hsl(${(name.charCodeAt(0) * 17) % 360}, 45%, 35%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#F5C87A", fontWeight: 800, fontSize: 14,
              }}>{name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#E8D0A0", fontSize: 14, fontWeight: 600 }}>{name}</div>
                <div style={{ color: "#705040", fontSize: 12 }}>{count} soirée{count > 1 ? "s" : ""}</div>
              </div>
              <span style={{ fontSize: 18 }}>{i === 0 ? "🏆" : i === 1 ? "🥈" : "🎖️"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dernière soirée */}
      {soirees.length > 0 && (() => {
        const last = [...soirees].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return (
          <div style={{
            marginTop: 20, background: "linear-gradient(135deg, #2A1C0E 0%, #3D2410 100%)",
            border: "1px solid #5D3E20", borderRadius: 16, padding: 24
          }}>
            <div style={{ color: "#705040", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Dernière soirée</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#F5C87A" }}>{last.nom}</div>
                <div style={{ color: "#A08060", fontSize: 13, marginTop: 2 }}>{formatDate(last.date)} · {last.invites.length} convive{last.invites.length > 1 ? "s" : ""}</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <StarRating value={last.note} size={22} />
              </div>
            </div>
            {last.avis && <div style={{ marginTop: 12, color: "#C8A878", fontSize: 14, fontStyle: "italic", borderLeft: "3px solid #F5A623", paddingLeft: 12 }}>
              « {last.avis} »
            </div>}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Vue : Collection d'ingrédients ──────────────────────────────────────────
function Collection({ ingredients, setIngredients }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Tous");
  const [showAdd, setShowAdd] = useState(false);
  const [newIng, setNewIng] = useState({ nom: "", categorie: "Fromage", emoji: "🧀", note: 4, stock: true });

  const filtered = ingredients.filter(i =>
    (catFilter === "Tous" || i.categorie === catFilter) &&
    i.nom.toLowerCase().includes(search.toLowerCase())
  );

  const addIngredient = () => {
    if (!newIng.nom.trim()) return;
    setIngredients(prev => [...prev, { ...newIng, id: Date.now() }]);
    setNewIng({ nom: "", categorie: "Fromage", emoji: "🧀", note: 4, stock: true });
    setShowAdd(false);
  };

  const toggleStock = (id) => setIngredients(prev => prev.map(i => i.id === id ? { ...i, stock: !i.stock } : i));
  const deleteIng = (id) => setIngredients(prev => prev.filter(i => i.id !== id));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#F5C87A", margin: "0 0 2px" }}>Ma Cave à Raclette</h2>
          <p style={{ color: "#705040", margin: 0, fontSize: 14 }}>{ingredients.length} ingrédients dans ta collection</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          marginLeft: "auto", background: "#F5A623", color: "#1A0E05",
          border: "none", borderRadius: 12, padding: "10px 20px",
          fontWeight: 800, fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
        }}>+ Ajouter</button>
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["Tous", ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)} style={{
            background: catFilter === cat ? "#F5A623" : "transparent",
            color: catFilter === cat ? "#1A0E05" : "#A08060",
            border: `1px solid ${catFilter === cat ? "#F5A623" : "#3D2E1A"}`,
            borderRadius: 20, padding: "5px 14px", fontSize: 12,
            fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
          }}>{cat}</button>
        ))}
      </div>

      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍  Rechercher un ingrédient..."
        style={{
          width: "100%", background: "#150E07", border: "1px solid #3D2E1A",
          borderRadius: 12, padding: "10px 14px", color: "#E8D0A0", fontSize: 14,
          outline: "none", marginBottom: 20, boxSizing: "border-box",
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {filtered.map(ing => (
          <div key={ing.id} style={{
            background: "linear-gradient(135deg, #1E160D 0%, #221608 100%)",
            border: `1px solid ${ing.stock ? "#3D2E1A" : "#2A1C0E"}`,
            borderRadius: 14, padding: "16px 18px",
            opacity: ing.stock ? 1 : 0.5, transition: "opacity 0.2s",
            position: "relative",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 28 }}>{ing.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#E8D0A0", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{ing.nom}</div>
                <Badge color={CAT_COLORS[ing.categorie] || "#7F8C8D"}>{ing.categorie}</Badge>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <StarRating value={ing.note} size={14} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <button onClick={() => toggleStock(ing.id)} style={{
                flex: 1, background: ing.stock ? "#2A4A1E" : "#3D1A0A",
                color: ing.stock ? "#6EC861" : "#E07050",
                border: "none", borderRadius: 8, padding: "6px 0",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>{ing.stock ? "✓ En stock" : "✗ Épuisé"}</button>
              <button onClick={() => deleteIng(ing.id)} style={{
                background: "#2A1C0E", color: "#705040", border: "1px solid #3D2E1A",
                borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12,
              }}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#F5C87A", margin: "0 0 20px" }}>Nouvel ingrédient</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={newIng.emoji} onChange={e => setNewIng(p => ({ ...p, emoji: e.target.value }))}
              style={inputStyle} placeholder="Emoji" maxLength={2} />
            <input value={newIng.nom} onChange={e => setNewIng(p => ({ ...p, nom: e.target.value }))}
              style={{ ...inputStyle, flex: 1 }} placeholder="Nom de l'ingrédient" />
          </div>
          <select value={newIng.categorie} onChange={e => setNewIng(p => ({ ...p, categorie: e.target.value }))}
            style={{ ...inputStyle, cursor: "pointer" }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div>
            <div style={{ color: "#A08060", fontSize: 13, marginBottom: 6 }}>Votre note</div>
            <StarRating value={newIng.note} onChange={n => setNewIng(p => ({ ...p, note: n }))} size={28} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button onClick={() => setShowAdd(false)} style={{ ...btnStyle, background: "transparent", color: "#705040", border: "1px solid #3D2E1A", flex: 1 }}>Annuler</button>
            <button onClick={addIngredient} style={{ ...btnStyle, flex: 2 }}>Ajouter à ma cave</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Vue : Soirées ────────────────────────────────────────────────────────────
function Soirees({ soirees, setSoirees, ingredients }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newSoiree, setNewSoiree] = useState({
    nom: "", date: new Date().toISOString().split("T")[0],
    invites: "", ingredients: [], note: 4, avis: "", duree: 90, quantiteFromage: 200,
  });
  const [inviteInput, setInviteInput] = useState("");

  const addSoiree = () => {
    if (!newSoiree.nom.trim()) return;
    const invitesArr = newSoiree.invites ? newSoiree.invites.split(",").map(s => s.trim()).filter(Boolean) : [];
    setSoirees(prev => [...prev, { ...newSoiree, id: Date.now(), invites: invitesArr }]);
    setNewSoiree({ nom: "", date: new Date().toISOString().split("T")[0], invites: "", ingredients: [], note: 4, avis: "", duree: 90, quantiteFromage: 200 });
    setShowAdd(false);
  };

  const deleteSoiree = (id) => setSoirees(prev => prev.filter(s => s.id !== id));

  const sorted = [...soirees].sort((a, b) => new Date(b.date) - new Date(a.date));

  const toggleIngInNew = (id) => setNewSoiree(p => ({
    ...p, ingredients: p.ingredients.includes(id) ? p.ingredients.filter(i => i !== id) : [...p.ingredients, id]
  }));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#F5C87A", margin: "0 0 2px" }}>Mes Soirées</h2>
          <p style={{ color: "#705040", margin: 0, fontSize: 14 }}>{soirees.length} soirée{soirees.length > 1 ? "s" : ""} mémorable{soirees.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ marginLeft: "auto", background: "#F5A623", color: "#1A0E05", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
          + Nouvelle soirée
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sorted.map(s => {
          const ings = s.ingredients.map(id => ingredients.find(i => i.id === id)).filter(Boolean);
          return (
            <div key={s.id} onClick={() => setSelected(s)}
              style={{
                background: "linear-gradient(135deg, #1E160D 0%, #2A1C0E 100%)",
                border: "1px solid #3D2E1A", borderRadius: 16, padding: "20px 24px",
                cursor: "pointer", transition: "border-color 0.2s, transform 0.1s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#F5A62355"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#3D2E1A"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 12, background: "#2A1C0E",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, border: "1px solid #3D2E1A", flexShrink: 0,
                }}>🫕</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#F5C87A", fontWeight: 700 }}>{s.nom}</span>
                    <span style={{ color: "#705040", fontSize: 13 }}>{formatDate(s.date)}</span>
                    <div style={{ marginLeft: "auto", display: "flex" }}>
                      {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: i <= s.note ? "#F5A623" : "#3a2e1e", fontSize: 16 }}>{i <= s.note ? "★" : "☆"}</span>)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {s.invites.slice(0, 4).map(name => (
                      <div key={name} style={{
                        background: `hsl(${name.charCodeAt(0) * 17 % 360}, 35%, 25%)`,
                        color: "#E8D0A0", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600,
                      }}>{name}</div>
                    ))}
                    {s.invites.length > 4 && <div style={{ color: "#705040", fontSize: 12, alignSelf: "center" }}>+{s.invites.length - 4}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {ings.slice(0, 6).map(i => <span key={i.id} title={i.nom} style={{ fontSize: 18 }}>{i.emoji}</span>)}
                    {ings.length > 6 && <span style={{ color: "#705040", fontSize: 13, alignSelf: "center" }}>+{ings.length - 6}</span>}
                  </div>
                </div>
              </div>
              {s.avis && (
                <div style={{ marginTop: 12, color: "#C8A878", fontSize: 13, fontStyle: "italic", borderLeft: "2px solid #F5A623", paddingLeft: 12 }}>
                  « {s.avis.length > 100 ? s.avis.slice(0, 97) + "…" : s.avis} »
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal détail */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (() => {
          const ings = selected.ingredients.map(id => ingredients.find(i => i.id === id)).filter(Boolean);
          return (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 36 }}>🫕</div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#F5C87A" }}>{selected.nom}</div>
                  <div style={{ color: "#A08060", fontSize: 13 }}>{formatDate(selected.date)}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div style={statBoxStyle}><span style={statNumStyle}>{selected.invites.length}</span><span style={statLblStyle}>convives</span></div>
                <div style={statBoxStyle}><span style={statNumStyle}>{selected.quantiteFromage}g</span><span style={statLblStyle}>fromage</span></div>
                <div style={statBoxStyle}><span style={statNumStyle}>{selected.duree}'</span><span style={statLblStyle}>durée</span></div>
                <div style={statBoxStyle}><StarRating value={selected.note} size={18} /></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: "#705040", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Invités</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {selected.invites.map(n => (
                    <div key={n} style={{ background: `hsl(${n.charCodeAt(0) * 17 % 360}, 35%, 25%)`, color: "#E8D0A0", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>{n}</div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: "#705040", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Au menu</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ings.map(i => (
                    <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#150E07", border: "1px solid #3D2E1A", borderRadius: 10, padding: "6px 10px" }}>
                      <span style={{ fontSize: 18 }}>{i.emoji}</span>
                      <span style={{ color: "#C8A878", fontSize: 13 }}>{i.nom}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selected.avis && (
                <div style={{ background: "#150E07", borderRadius: 12, padding: "12px 16px", borderLeft: "3px solid #F5A623" }}>
                  <div style={{ color: "#705040", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Avis</div>
                  <div style={{ color: "#C8A878", fontSize: 14, fontStyle: "italic" }}>« {selected.avis} »</div>
                </div>
              )}
              <button onClick={() => { deleteSoiree(selected.id); setSelected(null); }}
                style={{ marginTop: 16, background: "#2A0E0E", color: "#E05050", border: "1px solid #4A1A1A", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                🗑 Supprimer cette soirée
              </button>
            </>
          );
        })()}
      </Modal>

      {/* Modal nouvelle soirée */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#F5C87A", margin: "0 0 20px" }}>Nouvelle soirée raclette</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input value={newSoiree.nom} onChange={e => setNewSoiree(p => ({ ...p, nom: e.target.value }))}
            style={inputStyle} placeholder="Nom de la soirée (ex: Soirée ski...)" />
          <input type="date" value={newSoiree.date} onChange={e => setNewSoiree(p => ({ ...p, date: e.target.value }))}
            style={inputStyle} />
          <input value={newSoiree.invites} onChange={e => setNewSoiree(p => ({ ...p, invites: e.target.value }))}
            style={inputStyle} placeholder="Invités séparés par des virgules (Sophie, Marc...)" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ color: "#A08060", fontSize: 12, marginBottom: 4 }}>Durée (min)</div>
              <input type="number" value={newSoiree.duree} onChange={e => setNewSoiree(p => ({ ...p, duree: Number(e.target.value) }))}
                style={inputStyle} min={30} step={15} />
            </div>
            <div>
              <div style={{ color: "#A08060", fontSize: 12, marginBottom: 4 }}>Fromage (g)</div>
              <input type="number" value={newSoiree.quantiteFromage} onChange={e => setNewSoiree(p => ({ ...p, quantiteFromage: Number(e.target.value) }))}
                style={inputStyle} min={100} step={100} />
            </div>
          </div>
          <div>
            <div style={{ color: "#A08060", fontSize: 13, marginBottom: 8 }}>Ingrédients utilisés</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 160, overflowY: "auto" }}>
              {ingredients.map(i => (
                <button key={i.id} onClick={() => toggleIngInNew(i.id)} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: newSoiree.ingredients.includes(i.id) ? "#3D2A10" : "#150E07",
                  border: `1px solid ${newSoiree.ingredients.includes(i.id) ? "#F5A623" : "#3D2E1A"}`,
                  color: newSoiree.ingredients.includes(i.id) ? "#F5C87A" : "#705040",
                  borderRadius: 20, padding: "5px 10px", fontSize: 12, cursor: "pointer",
                }}>
                  <span>{i.emoji}</span> {i.nom}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: "#A08060", fontSize: 13, marginBottom: 6 }}>Note</div>
            <StarRating value={newSoiree.note} onChange={n => setNewSoiree(p => ({ ...p, note: n }))} size={26} />
          </div>
          <textarea value={newSoiree.avis} onChange={e => setNewSoiree(p => ({ ...p, avis: e.target.value }))}
            placeholder="Vos impressions..." rows={3}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button onClick={() => setShowAdd(false)} style={{ ...btnStyle, background: "transparent", color: "#705040", border: "1px solid #3D2E1A", flex: 1 }}>Annuler</button>
            <button onClick={addSoiree} style={{ ...btnStyle, flex: 2 }}>Enregistrer la soirée</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Vue : Liste de courses ───────────────────────────────────────────────────
function Courses({ ingredients }) {
  const [checked, setChecked] = useState({});
  const outOfStock = ingredients.filter(i => !i.stock);
  const fromages = outOfStock.filter(i => i.categorie === "Fromage");
  const autres = outOfStock.filter(i => i.categorie !== "Fromage");

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const calcFromage = (nb) => Math.ceil(nb * 200);

  const [nbPersonnes, setNbPersonnes] = useState(4);

  const Section = ({ title, items }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: "#705040", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{title}</div>
      {items.length === 0 ? (
        <div style={{ color: "#3D2E1A", fontSize: 14, fontStyle: "italic", padding: "8px 0" }}>Rien à acheter ici ✓</div>
      ) : items.map(i => (
        <div key={i.id} onClick={() => toggle(i.id)}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
            background: checked[i.id] ? "#1A1208" : "#1E160D",
            border: "1px solid #3D2E1A", borderRadius: 10, marginBottom: 8,
            cursor: "pointer", opacity: checked[i.id] ? 0.5 : 1, transition: "opacity 0.2s",
          }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            border: `2px solid ${checked[i.id] ? "#F5A623" : "#3D2E1A"}`,
            background: checked[i.id] ? "#F5A623" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {checked[i.id] && <span style={{ color: "#1A0E05", fontSize: 13, fontWeight: 900 }}>✓</span>}
          </div>
          <span style={{ fontSize: 20 }}>{i.emoji}</span>
          <span style={{ color: "#E8D0A0", fontSize: 14, fontWeight: 600, textDecoration: checked[i.id] ? "line-through" : "none" }}>{i.nom}</span>
          <Badge color={CAT_COLORS[i.categorie] || "#7F8C8D"}>{i.categorie}</Badge>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#F5C87A", margin: "0 0 2px" }}>Liste de courses</h2>
        <p style={{ color: "#705040", margin: 0, fontSize: 14 }}>Tout ce qui manque dans ta cave</p>
      </div>

      {/* Calculateur */}
      <div style={{
        background: "linear-gradient(135deg, #2A1C0E 0%, #3D2410 100%)",
        border: "1px solid #5D3E20", borderRadius: 16, padding: 20, marginBottom: 28,
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", color: "#F5C87A", fontSize: 18, marginBottom: 12 }}>
          🧮 Calculateur de raclette
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#A08060", fontSize: 14 }}>Nombre de convives :</span>
            <button onClick={() => setNbPersonnes(p => Math.max(1, p - 1))}
              style={{ background: "#1E160D", border: "1px solid #3D2E1A", color: "#F5C87A", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <span style={{ color: "#F5C87A", fontWeight: 800, fontSize: 20, minWidth: 24, textAlign: "center" }}>{nbPersonnes}</span>
            <button onClick={() => setNbPersonnes(p => p + 1)}
              style={{ background: "#1E160D", border: "1px solid #3D2E1A", color: "#F5C87A", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          <div style={{ background: "#1E160D", border: "1px solid #3D2E1A", borderRadius: 12, padding: "10px 18px" }}>
            <div style={{ color: "#F5A623", fontWeight: 800, fontSize: 22 }}>{calcFromage(nbPersonnes)}g</div>
            <div style={{ color: "#705040", fontSize: 12 }}>de fromage recommandé</div>
          </div>
          <div style={{ background: "#1E160D", border: "1px solid #3D2E1A", borderRadius: 12, padding: "10px 18px" }}>
            <div style={{ color: "#F5A623", fontWeight: 800, fontSize: 22 }}>{Math.ceil(nbPersonnes * 150)}g</div>
            <div style={{ color: "#705040", fontSize: 12 }}>de charcuterie</div>
          </div>
          <div style={{ background: "#1E160D", border: "1px solid #3D2E1A", borderRadius: 12, padding: "10px 18px" }}>
            <div style={{ color: "#F5A623", fontWeight: 800, fontSize: 22 }}>{nbPersonnes * 2}-{nbPersonnes * 3}</div>
            <div style={{ color: "#705040", fontSize: 12 }}>pommes de terre</div>
          </div>
        </div>
      </div>

      {outOfStock.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontFamily: "'Playfair Display', serif", color: "#F5C87A", fontSize: 20 }}>Ta cave est bien garnie !</div>
          <div style={{ color: "#705040", fontSize: 14, marginTop: 6 }}>Tous tes ingrédients sont en stock.</div>
        </div>
      ) : (
        <>
          <Section title={`Fromages (${fromages.length} manquant${fromages.length > 1 ? "s" : ""})`} items={fromages} />
          <Section title="Autres ingrédients" items={autres} />
        </>
      )}
    </div>
  );
}

// ─── Styles globaux ───────────────────────────────────────────────────────────
const inputStyle = {
  background: "#150E07", border: "1px solid #3D2E1A", borderRadius: 10,
  padding: "10px 12px", color: "#E8D0A0", fontSize: 14, outline: "none",
  width: "100%", boxSizing: "border-box", fontFamily: "inherit",
};

const btnStyle = {
  background: "#F5A623", color: "#1A0E05", border: "none",
  borderRadius: 12, padding: "11px 0", fontWeight: 800,
  fontSize: 14, cursor: "pointer",
};

const statBoxStyle = {
  background: "#150E07", border: "1px solid #3D2E1A",
  borderRadius: 12, padding: "12px 16px",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
};

const statNumStyle = { color: "#F5C87A", fontWeight: 800, fontSize: 18 };
const statLblStyle = { color: "#705040", fontSize: 11 };

// ─── App principale ───────────────────────────────────────────────────────────
export default function MyRaclette() {
  const [view, setView] = useState("dashboard");
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [soirees, setSoirees] = useState(INITIAL_SOIREES);

  const nav = [
    { id: "dashboard", emoji: "🏠", label: "Accueil" },
    { id: "collection", emoji: "🧀", label: "Ma Cave" },
    { id: "soirees", emoji: "🫕", label: "Soirées" },
    { id: "courses", emoji: "🛒", label: "Courses" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#120A04",
      fontFamily: "'Crimson Pro', Georgia, serif",
      color: "#E8D0A0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Crimson+Pro:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #150E07; }
        ::-webkit-scrollbar-thumb { background: #3D2E1A; border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button { opacity: 1; }
        select option { background: #1E160D; color: #E8D0A0; }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #2A1C0E",
        background: "linear-gradient(180deg, #1A0E05 0%, #120A04 100%)",
        padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🫕</span>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontWeight: 800,
              fontSize: 22, color: "#F5C87A", letterSpacing: "-0.02em",
              lineHeight: 1,
            }}>MyRaclette</div>
            <div style={{ fontSize: 11, color: "#705040", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Gestion de collection
            </div>
          </div>
        </div>

        {/* Nav desktop */}
        <nav style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: view === n.id ? "#2A1C0E" : "transparent",
              color: view === n.id ? "#F5C87A" : "#705040",
              border: `1px solid ${view === n.id ? "#3D2E1A" : "transparent"}`,
              borderRadius: 10, padding: "7px 14px",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              transition: "all 0.15s",
            }}>
              <span>{n.emoji}</span>
              <span style={{ display: window.innerWidth < 480 ? "none" : "inline" }}>{n.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Conteneur principal */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        {view === "dashboard" && <Dashboard soirees={soirees} ingredients={ingredients} />}
        {view === "collection" && <Collection ingredients={ingredients} setIngredients={setIngredients} />}
        {view === "soirees" && <Soirees soirees={soirees} setSoirees={setSoirees} ingredients={ingredients} />}
        {view === "courses" && <Courses ingredients={ingredients} />}
      </main>

      {/* Nav mobile */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#1A0E05", borderTop: "1px solid #2A1C0E",
        display: "flex", padding: "8px 0 12px",
        "@media(min-width:600px)": { display: "none" },
      }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "none", border: "none",
            color: view === n.id ? "#F5C87A" : "#705040",
            fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "4px 0",
          }}>
            <span style={{ fontSize: 22 }}>{n.emoji}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
