/* The Cognitive Lens — an Obsidian plugin that renders the Claude-Wiki not as a graph but as the
   wiki's LIVING COGNITIVE PROCESS: a particle field shaped like an eye. It WATCHES 09_working/eye-state.json
   (the bridge the commands write) and reacts — focus to a goal (/prime), pulse a reasoning pipeline (/compose),
   blink on an answer (/query), crystallize new memory (/expand). Reads graph-export.json for structure and
   graph-manifest.json for taxonomy (data-agnostic seam). Manifesto: it visualizes the cognitive process operating
   on the graph, not the graph. Laws: Visual Priority · Restraint · Functional Abstraction · Semantic Morphing ·
   Information Conservation · Data-Agnostic. Plain CommonJS, no build step. */
"use strict";
const { Plugin, ItemView } = require("obsidian");
const VIEW_TYPE_EYE = "wiki-eye-view";
const STATE_PATHS = ["Claude-Wiki/09_working/eye-state.json", "09_working/eye-state.json"];
const NORTHSTAR_PATHS = ["Claude-Wiki/09_working/north-star.json", "09_working/north-star.json"];   // the persistent long-term goal the Lens orbits
const GRAPH_PATHS = ["Claude-Wiki/07_visualizer/graph-local.json", "07_visualizer/graph-local.json", "Claude-Wiki/07_visualizer/graph-export.json", "07_visualizer/graph-export.json"];
const PUBLIC_GRAPH_PATHS = ["Claude-Wiki/07_visualizer/graph-public.json", "07_visualizer/graph-public.json"];   // presenter mode: the export allowlist (public_system only) — safe to record/screen-share
const MANIFEST_PATHS = ["Claude-Wiki/graph-manifest.json", "graph-manifest.json"];

// type → category (same palette as build_obsidian_graph.py / juggl-graph.css)
const CATEGORIES = [
  { key: "sources",      label: "SOURCES",      color: "#8a8f98", types: ["source-summary", "source-map"] },
  { key: "concepts",     label: "CONCEPTS",     color: "#4f9dde", types: ["concept"] },
  { key: "patterns",     label: "PATTERNS",     color: "#b07fd9", types: ["pattern"] },
  { key: "synthesis",    label: "SYNTHESIS",    color: "#9b59b6", types: ["synthesis"] },
  { key: "projects",     label: "PROJECTS",     color: "#e0a458", types: ["project", "system", "entity"] },
  { key: "pipelines",    label: "PIPELINES",    color: "#7e9cff", types: ["pipeline", "stage", "interface"] },
  { key: "capabilities", label: "CAPABILITIES", color: "#2ec4b6", types: ["capability"] },
  { key: "outcomes",     label: "OUTCOMES",     color: "#e07a5f", types: ["outcome"] },
  { key: "decisions",    label: "DECISIONS",    color: "#d96d6d", types: ["decision", "contradiction"] },
  { key: "gaps",         label: "GAPS",         color: "#ff4d4d", types: ["gap"] },
  { key: "blueprints",   label: "BLUEPRINTS",   color: "#2ecc71", types: ["blueprint", "question"] },
  { key: "sessions",     label: "SESSIONS",     color: "#b48ead", types: ["reasoning-session"] },
];
const CAT_OF_TYPE = {};
CATEGORIES.forEach(c => c.types.forEach(t => (CAT_OF_TYPE[t] = c.key)));
const CAT_KEYS = CATEGORIES.map(c => c.key);
const RING_RANK = { pupil: 0, inner: 1, middle: 2, outer: 3 };
// semantic shapes by ROLE: round=knowledge, hexagon=reusable, square=systems, diamond=contracts/choices,
// triangle=open/forward, star=insights/results
const TYPE_SHAPE = {
  concept: "circle", "source-summary": "circle", "source-map": "circle", "reasoning-session": "circle",
  capability: "hexagon", pattern: "hexagon",
  project: "square", system: "square", entity: "square", pipeline: "square", stage: "square",
  interface: "diamond", decision: "diamond", contradiction: "diamond",
  gap: "triangle", question: "triangle", blueprint: "triangle",
  synthesis: "star", outcome: "star",
};
const HOLLOW_STATUS = new Set(["open", "building", "placeholder", "draft"]);
// the detail card groups a node's links by what they ARE (our semantics, not generic "relationships")
const CARD_BUCKETS = [
  ["Capabilities", ["capability"]],
  ["Pipelines", ["pipeline", "stage", "interface"]],
  ["Decisions", ["decision", "contradiction"]],
  ["Gaps", ["gap"]],
  ["Blueprints", ["blueprint", "question"]],
  ["Projects", ["project", "system", "entity"]],
  ["Outcomes", ["outcome"]],
  ["Concepts", ["concept", "pattern", "synthesis"]],
  ["Evidence", ["source-summary", "source-map", "reasoning-session"]],
];
// the reasoning pipeline strip (canonical stage id → label)
const REASONING_STRIP = [["observe", "OBSERVE"], ["map-context", "MAP"], ["generate-candidates", "GENERATE"], ["validate", "VALIDATE"], ["human-review", "REVIEW"], ["learn", "LEARN"]];

function hexA(hex, a) {
  const h = (hex || "#9aa4b2").replace("#", "");
  const v = h.length === 3 ? h.split("").map(c => c + c).join("") : h.slice(0, 6);
  const n = parseInt(v, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function hslHex(h, s, l) {                                  // hsl(0-360,0-100,0-100) → #rrggbb (for theme ramps)
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = x => Math.round(255 * x).toString(16).padStart(2, "0");
  return "#" + to(f(0)) + to(f(8)) + to(f(4));
}
function mixHex(a, b, t) {                                  // blend two #rrggbb toward each other (achromatic atmosphere)
  const pa = parseInt((a || "#000").replace("#", "").slice(0, 6).padEnd(6, "0"), 16);
  const pb = parseInt((b || "#fff").replace("#", "").slice(0, 6).padEnd(6, "0"), 16);
  const ch = (sa, sb) => Math.round(sa + (sb - sa) * t);
  const r = ch((pa >> 16) & 255, (pb >> 16) & 255), g = ch((pa >> 8) & 255, (pb >> 8) & 255), bl = ch(pa & 255, pb & 255);
  const to = x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0");
  return "#" + to(r) + to(g) + to(bl);
}
function hash01(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 100000) / 100000; }   // stable per-id pseudo-random
function ramp(fn) { const m = {}; CAT_KEYS.forEach((k, i) => (m[k] = fn(i, CAT_KEYS.length))); return m; }
const MATRIX_CAT = ramp((i, n) => hslHex(132 + (i % 3) * 9, 78, 40 + i * (40 / n)));     // monochrome-green by category
const NEURAL_CAT = ramp((i, n) => hslHex(258 - i * (46 / n), 68, 62));                   // purple → blue ramp

// ATMOSPHERES — palette/mood tokens. `classic` = today's exact literals (byte-identical default). Chrome reads
// these; category colours read theme.cat ?? CATEGORIES. outlineMin/lashMin gate the EMERGENT eye (0 ⇒ the eye
// only reforms when reasoning rises; 1 ⇒ always drawn, as Classic was).
const THEMES = {
  classic: {
    bg: "#04060a", scleraInner: "#0a1320", scleraOuter: "#05080e", irisRing: "#ffffff08",
    starfield: "#9fb6d8", fiberAmbient: "#ffffff07", fiberHot: "#9b8cff", waveDot: "#cfc6ff",
    pupilStops: [["#000", 0], ["#05070b", 0.82], ["#0e1626", 1]], confArc: "#39d98a",
    eyeOutline: "#b9a290", outlineMin: 1, lash: "#1a1410", lashMin: 1, labelBg: "#0a0c10cc",
    freshHalo: "#cfe0ff", primedHalo: "#cfe0ff", hudBg: "#0a0f17d8", hudStroke: "#2ec4b655", hudAccent: "#2ec4b6",
    nodePillBg: "#0a0f17ee", nodePillText: "#cdd4df", nodePillTextHot: "#fff", cat: null,
  },
  matrix: {
    bg: "#020604", scleraInner: "#04140a", scleraOuter: "#010402", irisRing: "#39ff8810",
    starfield: "#3bd07a", fiberAmbient: "#39ff8809", fiberHot: "#39ff88", waveDot: "#b6ffce",
    pupilStops: [["#000", 0], ["#01160b", 0.82], ["#04361f", 1]], confArc: "#39ff88",
    eyeOutline: "#39ff88", outlineMin: 0, lash: "#0b2a18", lashMin: 0, labelBg: "#02100acc",
    freshHalo: "#b6ffce", primedHalo: "#9dffc0", hudBg: "#02100ad8", hudStroke: "#39ff8855", hudAccent: "#39ff88",
    nodePillBg: "#02100aee", nodePillText: "#bdf5d0", nodePillTextHot: "#eafff2", cat: MATRIX_CAT,
  },
  neural: {
    bg: "#04030a", scleraInner: "#0c0a20", scleraOuter: "#05040e", irisRing: "#b08cff10",
    starfield: "#9aa6ff", fiberAmbient: "#b08cff09", fiberHot: "#b08cff", waveDot: "#dcd0ff",
    pupilStops: [["#000", 0], ["#070518", 0.82], ["#16104a", 1]], confArc: "#7c8cff",
    eyeOutline: "#b08cff", outlineMin: 0, lash: "#1a1430", lashMin: 0, labelBg: "#0a0820cc",
    freshHalo: "#dcd0ff", primedHalo: "#c9b8ff", hudBg: "#0a0820d8", hudStroke: "#b08cff55", hudAccent: "#b08cff",
    nodePillBg: "#0a0820ee", nodePillText: "#d8d0ff", nodePillTextHot: "#f3f0ff", cat: NEURAL_CAT,
  },
  // "Cognition" — the reference aesthetic: achromatic point-cloud on pure black, fully emergent eye, serif caption.
  // achroma = blend category hue → white (hybrid: a whisper of colour survives); labelFont = serif caption.
  cognition: {
    bg: "#000000", scleraInner: "#04060c", scleraOuter: "#000000", irisRing: "#ffffff08",
    starfield: "#cfe0ff", fiberAmbient: "#ffffff08", fiberHot: "#eaf2ff", waveDot: "#ffffff",
    pupilStops: [["#000", 0], ["#03040a", 0.85], ["#12203a", 1]], confArc: "#dfe8ff",
    eyeOutline: "#cfe0ff", outlineMin: 0, lash: "#9fb6d8", lashMin: 0, labelBg: "#02040acc",
    freshHalo: "#ffffff", primedHalo: "#dfe8ff", hudBg: "#02040ad8", hudStroke: "#9fb6d855", hudAccent: "#cfe0ff",
    nodePillBg: "#02040aee", nodePillText: "#dfe8ff", nodePillTextHot: "#ffffff", cat: null,
    achroma: 0.82, labelFont: "'Playfair Display', Georgia, 'Times New Roman', serif",
  },
};
const THEME_ORDER = ["classic", "matrix", "neural", "cognition"];

const SHAPES = {
  circle: (g, x, y, s) => g.arc(x, y, s, 0, Math.PI * 2),
  square: (g, x, y, s) => g.rect(x - s, y - s, 2 * s, 2 * s),
  diamond: (g, x, y, s) => { g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.closePath(); },
  triangle: (g, x, y, s) => { g.moveTo(x, y - s); g.lineTo(x + s * 0.92, y + s * 0.7); g.lineTo(x - s * 0.92, y + s * 0.7); g.closePath(); },
  hexagon: (g, x, y, s) => poly(g, x, y, s, 6, -Math.PI / 2),
  star: (g, x, y, s) => star(g, x, y, s),
};
function poly(g, x, y, s, n, a0) { for (let i = 0; i < n; i++) { const a = a0 + i * 2 * Math.PI / n, px = x + s * Math.cos(a), py = y + s * Math.sin(a); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); }
function star(g, x, y, s) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * 0.45 : s, px = x + r * Math.cos(a), py = y + r * Math.sin(a); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); }

class CognitiveLensView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.nodes = []; this.edges = []; this.byId = new Map();
    this.out = new Map(); this.inc = new Map(); this.adj = new Map(); this.recip = new Set();
    this.focusId = null; this.hoverId = null; this.dist = new Map();
    this.active = new Set(); this.state = {};
    this.activeEdges = []; this.building = null;                              // RUNTIME: pathways Claude is developing + what it's building
    this.pulse = null; this.crystal = new Map();
    this.blink = 0; this.blinkClock = -1; this.lastBlinkStamp = 0; this.idle = 0;
    this.par = { x: 0, y: 0 }; this._parTarget = { x: 0, y: 0 }; this._lastStateAt = 0;   // eased parallax target + LIVE-indicator clock
    this.northStar = null;                                                   // persistent long-term goal { goal, anchor, setAt }
    this._t = 0; this.stars = []; this._flows = []; this._glow = null;
    // atmosphere (palette) — default set HERE so headless verify.js (which never calls onOpen) has a theme
    this.themeName = "classic"; this.theme = THEMES.classic; this.manifest = null;
    // view MODE — "field" (Cognition Field: emergent particle field) | "eye" (classic readable). Default field.
    this.viewMode = "field"; this._clusterPos = {};
    this.zoomLevel = "stars"; this.expanded = new Set(); this._dotClusters = {}; this._cloudHits = []; this._today = "";   // cognitive-zoom + review-due state
    // camera + cognition easing state (the curious camera, the eased season, the emergent eye)
    this.zoom = 1; this.userZoom = 1; this._uz = 1; this.camcx = null; this.camcy = null; this._emerge = null; this._season = null; this.presenter = false;
    this.W = 800; this.H = 600;
  }
  getViewType() { return VIEW_TYPE_EYE; }
  getDisplayText() { return "Cognitive Lens"; }
  getIcon() { return "eye"; }

  // ---- data ---------------------------------------------------------------
  buildGraph(data, base) {
    this.base = base || "";
    const cats = CATEGORIES.filter(c => data.nodes.some(n => CAT_OF_TYPE[n.type] === c.key));
    this.catsPresent = cats;
    this.catIndex = Object.fromEntries(cats.map((c, i) => [c.key, i]));
    this.catByKey = Object.fromEntries(cats.map(c => [c.key, c]));
    this.nodes = data.nodes.map(n => ({ ...n, x: this.W / 2, y: this.H / 2, tx: 0, ty: 0, _ring: 2 }));
    this.byId = new Map(this.nodes.map(n => [n.id, n]));
    this.adj = new Map(this.nodes.map(n => [n.id, new Set()]));
    this.out = new Map(this.nodes.map(n => [n.id, []]));
    this.inc = new Map(this.nodes.map(n => [n.id, []]));
    const _allE = data.edges.filter(e => this.byId.has(e.source) && this.byId.has(e.target));
    this.edges = _allE.filter(e => e.type !== "inferred");                    // structural links → adjacency / layout / degree
    this.inferredEdges = _allE.filter(e => e.type === "inferred");            // inferred "suggested" pathways → dashed overlay only (not structural)
    const seen = new Set();
    for (const e of this.edges) {
      this.adj.get(e.source).add(e.target); this.adj.get(e.target).add(e.source);
      this.out.get(e.source).push(e.target); this.inc.get(e.target).push(e.source);
      if (seen.has(e.target + "|" + e.source)) this.recip.add(e.source + "|" + e.target);  // reciprocal = stronger
      seen.add(e.source + "|" + e.target);
    }
    // particle field: each node = a bright core + satellites (count ∝ degree). Deterministic (golden angle).
    for (const n of this.nodes) {
      const deg = (this.out.get(n.id) || []).length + (this.inc.get(n.id) || []).length;
      n._deg = deg; n._h = hash01(n.id); n._h2 = hash01("y" + n.id);          // stable per-node jitter seeds (Field)
      const k = Math.min(14, 3 + Math.round(deg * 0.35)), sat = [];           // fewer satellites → crisper, more refined dots (less fuzzy clumping)
      for (let i = 0; i < k; i++) {
        const t = (i + 1) / k;
        sat.push({ r: 2 + Math.pow(t, 0.7) * 13, a: i * 2.39996, sp: 0.18 + (i % 5) * 0.05, ph: i * 1.7, br: 0.22 + ((i * 0.3779) % 1) * 0.55 });
      }
      n._sat = sat;
    }
    // learning-flow: experience (outcome) → capability, on REAL adjacency (no typed edges; inferred by node type)
    this._flows = [];
    for (const n of this.nodes) if (n.type === "outcome")
      for (const id of (this.adj.get(n.id) || [])) { const m = this.byId.get(id); if (m && m.type === "capability") this._flows.push([n.id, id]); }
    this.modes = [...new Set(this.nodes.map(n => n.mode).filter(Boolean))];   // galaxies (for v2.2 cognitive zoom)
    const _dots = this.nodes.filter(n => n.cluster && n.cluster !== n.id).length;   // cognitive-zoom: big graphs (many dots) open folded into constellations
    this.zoomLevel = _dots > 200 ? "constellation" : "stars"; this.expanded = new Set();
    this.makeStars();
  }
  makeStars() {
    this.stars = []; const N = 240;
    for (let i = 0; i < N; i++)
      this.stars.push({ a: i * 2.39996, r: Math.sqrt((i + 0.5) / N), br: 0.08 + ((i * 0.61803) % 1) * 0.45, sp: 0.04 + (i % 7) * 0.015, ph: i * 0.7 });
  }
  makeGlow() {                                              // pre-render a soft radial-glow sprite ONCE (cheap bloom via drawImage, not per-node shadowBlur)
    if (typeof document === "undefined") { this._glow = null; return; }       // headless (verify.js) has no DOM — sprite skipped
    const s = 64, c = document.createElement("canvas"); c.width = c.height = s;
    const g = c.getContext("2d"), grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, "rgba(234,242,255,0.9)"); grd.addColorStop(0.4, "rgba(234,242,255,0.22)"); grd.addColorStop(1, "rgba(234,242,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, s, s); this._glow = c;
  }
  categoryOf(n) { return CAT_OF_TYPE[n.type] || "blueprints"; }
  clusterOf(n) { return n.cluster || this.categoryOf(n); }   // Cognition Field: theme (dots/hubs) else category
  isFolded(n) { return !!n && this.viewMode === "field" && this.zoomLevel === "constellation" && n.cluster && n.cluster !== n.id && !this.expanded.has(n.cluster); }   // a dot collapsed into its cloud (hidden) — skip its edges (PERF)
  catColor(n) { return this.catColorKey(this.categoryOf(n)); }
  catColorKey(key) {
    const t = this.theme;
    let col = (t && t.cat && t.cat[key]) ? t.cat[key] : (this.catByKey && this.catByKey[key] ? this.catByKey[key].color : "#9aa4b2");
    if (t && t.achroma) col = mixHex(col, "#ffffff", t.achroma);   // hybrid achromatic — a whisper of category hue
    return col;
  }
  lf() { return (this.theme && this.theme.labelFont) || "ui-sans-serif"; }   // caption font (serif in Cognition)
  isHollow(n) { return n.type === "gap" || HOLLOW_STATUS.has(n.status); }
  bfs(start) {
    const d = new Map([[start, 0]]); let f = [start];
    while (f.length) { const nx = []; for (const id of f) for (const nb of this.adj.get(id) || []) if (!d.has(nb)) { d.set(nb, d.get(id) + 1); nx.push(nb); } f = nx; }
    return d;
  }

  // ---- eye-anatomy layout (UNTOUCHED — relevance semantics stay; verify.js insideAlmond depends on it) ----
  computeEye() {
    const W = this.W, H = this.H, cx = W / 2, cy = H / 2;
    this.cx = cx; this.cy = cy;
    const hw = Math.min(W * 0.46, H * 0.82), hh = hw * 0.6;
    this.hw = hw; this.hh = hh;
    this.lidYc = (hw * hw - hh * hh) / (2 * hh); this.lidR = this.lidYc + hh;
    this.Ri = Math.min(hh * 0.94, hw * 0.66); this.Rp = this.Ri * 0.34;
    const sector = (Math.PI * 2) / this.catsPresent.length;
    const groups = new Map();
    for (const n of this.nodes) {
      let ring;
      if (this.active.size) ring = (n.id === this.focusId) ? 0 : (this.active.has(n.id) ? 1 : 3);  // focus=pupil, working-context inward
      else if (this.focusId) { const d = this.dist.get(n.id); ring = n.id === this.focusId ? 0 : (d == null ? 3 : Math.min(d, 3)); }
      else ring = RING_RANK[n.iris_ring] != null ? RING_RANK[n.iris_ring] : 2;
      n._ring = ring;
      const ci = this.catIndex[this.categoryOf(n)];
      (groups.get(ci + "|" + ring) || groups.set(ci + "|" + ring, []).get(ci + "|" + ring)).push(n);
    }
    for (const [key, arr] of groups) {
      const ci = +key.split("|")[0];
      const a0 = -Math.PI / 2 + (ci + 0.5) * sector, span = sector * 0.94;   // wider sector span → denser fill (less inter-sector gap)
      arr.forEach((n, i) => {
        if (n._ring === 0 && n.id === this.focusId) { n.tx = cx; n.ty = cy; return; }
        const t = arr.length === 1 ? 0.5 : i / (arr.length - 1);
        const h1 = n._h != null ? n._h : (i % 7) / 7, h2 = n._h2 != null ? n._h2 : (i % 5) / 5;
        const ang = a0 - span / 2 + t * span + (h1 - 0.5) * span * 0.3;      // angular spread + organic jitter (de-bunch)
        const ex = this.hw * 0.88, ey = this.hh * 0.88;                     // fill the whole eye ELLIPSE (almond), not just the inner iris circle
        const efr = 0.34 + 0.62 * (n._ring + h2) / 4;                       // radial fraction: just outside the pupil → near the rim
        n.tx = cx + efr * ex * Math.cos(ang); n.ty = cy + efr * ey * Math.sin(ang);
        const dx = n.tx - cx, dy = n.ty - cy, ee = Math.hypot(dx / ex, dy / ey);
        if (ee > 1) { n.tx = cx + dx / ee; n.ty = cy + dy / ee; }           // clamp inside the eye ellipse
      });
    }
  }
  // ---- Cognition Field layout — organic theme gravity-clusters; the eye EMERGES from density (not drawn) ----
  computeField() {
    const W = this.W, H = this.H, cx = W / 2, cy = H / 2;
    this.cx = cx; this.cy = cy;
    const hw = Math.min(W * 0.46, H * 0.82), hh = hw * 0.6;
    this.hw = hw; this.hh = hh;
    this.lidYc = (hw * hw - hh * hh) / (2 * hh); this.lidR = this.lidYc + hh;
    this.Ri = Math.min(hh * 0.94, hw * 0.66); this.Rp = this.Ri * 0.34;
    const ex = hw * 0.86, ey = hh * 0.86, GA = Math.PI * (3 - Math.sqrt(5));   // eye-filling ellipse + golden angle
    const groups = new Map();
    for (const n of this.nodes) {                                             // group by cluster + relevance ring (computeEye semantics)
      let ring;
      if (this.active.size) ring = (n.id === this.focusId) ? 0 : (this.active.has(n.id) ? 1 : 3);
      else if (this.focusId) { const d = this.dist.get(n.id); ring = n.id === this.focusId ? 0 : (d == null ? 3 : Math.min(d, 3)); }
      else ring = RING_RANK[n.iris_ring] != null ? RING_RANK[n.iris_ring] : 2;
      n._ring = ring;
      const key = this.clusterOf(n);
      (groups.get(key) || groups.set(key, []).get(key)).push(n);
    }
    const keys = [...groups.keys()]; this._clusterPos = {};                    // each cluster = a gravity well (organic centroid)
    keys.forEach((k, ci) => {
      const arr = groups.get(k);
      const avgRing = arr.reduce((s, n) => s + (RING_RANK[n.iris_ring] != null ? RING_RANK[n.iris_ring] : 2), 0) / arr.length;
      const rf = 0.22 + 0.62 * Math.min(1, avgRing / 3);                       // core clusters pulled in, weak signals to the rim
      const ang = ci * GA + ((ci * 0.6180339) % 1) * 0.5;                      // golden-angle (NOT even sectors)
      this._clusterPos[k] = { cx: cx + rf * ex * Math.cos(ang), cy: cy + rf * ey * Math.sin(ang), ang };
    });
    for (const k of keys) {                                                   // within a cluster — DANDELION: hub at centre, rest spread
      const arr = groups.get(k).slice().sort((a, b) => (b._deg || 0) - (a._deg || 0));
      const cp = this._clusterPos[k], spread = (this.Ri - this.Rp) * (0.18 + Math.min(0.3, arr.length * 0.004));
      arr.forEach((n, i) => {
        if (n._ring === 0 && n.id === this.focusId) { n.tx = cx; n.ty = cy; n._zv = 1; return; }
        if (i === 0) { n.tx = cp.cx; n.ty = cp.cy; }                           // hub (max degree) at the centroid
        else {                                                                 // messy DANDELION burst — NOT a clean spiral
          const h1 = n._h != null ? n._h : (i % 7) / 7, h2 = n._h2 != null ? n._h2 : (i % 5) / 5;
          const t = i / arr.length, a = i * GA + cp.ang + (h1 - 0.5) * 1.2;     // angular jitter
          const rr = spread * Math.pow(t, 0.5) * (0.5 + 1.0 * h2);             // radial jitter — uneven density
          n.tx = cp.cx + rr * Math.cos(a) + (h2 - 0.5) * spread * 0.55;        // scatter offset
          n.ty = cp.cy + rr * Math.sin(a) + (h1 - 0.5) * spread * 0.55;
        }
        if (n._ring <= 1) { const p = n._ring === 0 ? 0.7 : 0.34; n.tx += (cx - n.tx) * p; n.ty += (cy - n.ty) * p; }  // relevance pull-in
        const dx = n.tx - cx, dy = n.ty - cy, e = Math.hypot(dx / ex, dy / ey);                                       // clamp inside the eye ellipse
        if (e > 1) { n.tx = cx + dx / e; n.ty = cy + dy / e; }
        n._zv = Math.max(0.12, Math.min(1, 0.36 + (n._deg || 0) * 0.03 + (((i * 0.6180339) % 1) - 0.5) * 0.4));       // fake depth
      });
    }
    this._dotClusters = {};                                                   // cognitive-zoom: per-theme dot clouds (count + centroid)
    for (const k of keys) { const dm = groups.get(k).filter(m => m.cluster && m.cluster !== m.id); if (dm.length >= 4 && this._clusterPos[k]) this._dotClusters[k] = { count: dm.length, cx: this._clusterPos[k].cx, cy: this._clusterPos[k].cy }; }
  }
  layout() { return this.viewMode === "field" ? this.computeField() : this.computeEye(); }
  setFocus(id) {
    if (id && this.byId.has(id)) { this.focusId = id; this.dist = this.bfs(id); }
    else { this.focusId = null; this.dist = new Map(); }
    this.layout();
  }

  // ---- the living bridge: react to eye-state.json -------------------------
  applyState(s) {
    if (!s || typeof s !== "object") return;
    this.state = s;
    this.active = new Set((s.activeIds || []).filter(id => this.byId.has(id)));
    if (s.status === "idle") { this.focusId = null; this.dist = new Map(); }    // exploration/idle: RELEASE the focus so the auto-camera never stays stuck on the mission
    else if (s.focusId && this.byId.has(s.focusId)) { this.focusId = s.focusId; this.dist = this.bfs(s.focusId); }
    else if (!this.active.size) { /* leave current focus */ }
    if (Array.isArray(s.pipeline) && s.pipeline.length) {
      const seq = s.pipeline.filter(id => this.byId.has(id));
      if (seq.length) this.pulse = { seq, idx: 0, frame: 0 };
    }
    if (Array.isArray(s.newNodeIds)) for (const id of s.newNodeIds) if (this.byId.has(id)) {
      const n = this.byId.get(id); n.x = this.cx || this.W / 2; n.y = this.cy || this.H / 2; this.crystal.set(id, 0);
    }
    this.activeEdges = (Array.isArray(s.activeEdges) ? s.activeEdges : []).map(p => String(p).split("|")).filter(p => p.length === 2 && this.byId.has(p[0]) && this.byId.has(p[1]));   // RUNTIME: pathways Claude is developing
    this.building = s.building || null;
    if (s.blink && s.blink !== this.lastBlinkStamp) { this.lastBlinkStamp = s.blink; this.triggerBlink(); }
    this._lastStateAt = Date.now();                                          // LIVE indicator: Claude just drove the Eye
    this.layout();
  }
  triggerBlink() { this.blinkClock = 0; }

  // ---- cognition model: priority, season, role, emergence (all from REAL state) ----
  attention(n) {                                            // Visual Priority — one thing owns the frame
    if (this.pulse && this.pulse.seq[this.pulse.idx] === n.id) return 1;     // current reasoning
    if (this.crystal.has(n.id)) return 0.85;                                  // just-formed memory
    if (n.id === this.focusId) return 0.92;
    if (this.active.has(n.id)) return 0.7;                                    // working context
    if (n.id === this.hoverId) return 0.6;
    if (this.isFresh(n)) return 0.4;                                          // recently changed
    return 0.12;                                                              // everything else → atmosphere
  }
  seasonOf() {                                              // operating mode — auto-selected by live state
    const s = this.state || {}; let name = "exploration";
    if (s.status === "composing" || this.pulse) name = "composition";
    else if (s.status === "expanding" || this.crystal.size) name = "reflection";
    else if (s.status === "primed" || s.status === "searching" || this.focusId || this.active.size) name = "focus";
    const P = {
      exploration: { contrast: 0.72, ambient: 1.0, motion: 1.0 },
      focus: { contrast: 1.0, ambient: 0.5, motion: 0.82 },
      composition: { contrast: 0.95, ambient: 0.68, motion: 1.18 },
      reflection: { contrast: 0.85, ambient: 0.8, motion: 0.7 },
    }[name];
    return { name, contrast: P.contrast, ambient: P.ambient, motion: P.motion };
  }
  reasonIntensity() {                                       // drives the emergent eye + camera push-in
    if (this.pulse) return 1;
    if (this.crystal.size) return 0.75;
    const s = this.state || {};
    if (this.focusId || this.active.size) return 0.6;
    if (typeof s.confidence === "number") return 0.5;
    return 0;
  }
  renderRole(n) {                                           // Semantic Morphing — form follows current BEHAVIOUR
    if (this.pulse && this.pulse.seq[this.pulse.idx] === n.id) return "stream";   // flowing through reasoning
    if (n.id === this.focusId) return "beacon";                                   // the mission
    if (this.isHollow(n)) return "gap";                                           // unstable / forming
    if (n.type === "decision" || n.type === "contradiction") return "anchor";     // gravity well
    if (this.active.has(n.id) || n.type === "capability") return "nucleus";       // energised / executable
    return "star";                                                                // settled knowledge
  }

  // ---- per-frame animation + drawing --------------------------------------
  nodeRadius(n) {
    if (this.pulse && this.pulse.seq[this.pulse.idx] === n.id) return 13;
    if (n.id === this.focusId) return 12;
    if (n.id === this.hoverId) return 9;
    if (this.crystal.has(n.id)) return 6 + 8 * (1 - this.crystal.get(n.id));
    const deg = (this.out.get(n.id) || []).length + (this.inc.get(n.id) || []).length;
    return Math.min(9, 4.5 + deg * 0.11) * (this._uz !== 1 ? Math.max(0.7, Math.min(1.8, Math.sqrt(this._uz))) : 1);
  }
  alphaOf(n) {
    if (this.active.size && !this.active.has(n.id) && n.id !== this.hoverId && n.id !== this.focusId) return 0.22;   // keep the background a LIVING field when focused (was near-dark 0.12)
    return 1;
  }
  almondPath(ctx) {
    const cx = this.cx, cy = this.cy, hw = this.hw, yc = this.lidYc, R = this.lidR;
    const upC = cy + yc, loC = cy - yc, Lx = cx - hw, Rx = cx + hw;
    ctx.beginPath();
    ctx.arc(cx, upC, R, Math.atan2(cy - upC, Lx - cx), Math.atan2(cy - upC, Rx - cx), false);
    ctx.arc(cx, loC, R, Math.atan2(cy - loC, Rx - cx), Math.atan2(cy - loC, Lx - cx), false);
    ctx.closePath();
  }
  rimParticles(ctx) {                                       // the eyelid as a BROKEN PARTICLE BAND — no vector stroke
    const cx = this.cx, cy = this.cy, hw = this.hw, yc = this.lidYc, R = this.lidR, t = this._t, col = this.theme.eyeOutline;
    const upC = cy + yc, loC = cy - yc, base = 0.16 + 0.5 * this._emerge;      // rim brightens as reasoning rises
    const aU = [Math.atan2(cy - upC, -hw), Math.atan2(cy - upC, hw)];
    const aL = [Math.atan2(cy - loC, hw), Math.atan2(cy - loC, -hw)];
    const N = 70;
    for (let i = 0; i <= N; i++) {
      const f = i / N, dens = Math.pow(Math.sin(Math.PI * f), 0.6);            // density peaks mid-lid, thins at corners
      for (const [cyc, a0, a1, k] of [[upC, aU[0], aU[1], 7], [loC, aL[0], aL[1], 5]]) {
        const rnd = ((i * k * 73 + 31) % 100) / 100;
        if (rnd < 0.42) continue;                                              // sparser, irregular gaps — uneven particle density
        const a = a0 + (a1 - a0) * f, x = cx + R * Math.cos(a), y = cyc + R * Math.sin(a);
        const tw = base * (0.18 + 0.82 * dens) * (0.3 + 0.7 * rnd) * (0.6 + 0.4 * Math.sin(t * 0.05 + i * 0.6));
        const s = 0.6 + 1.6 * dens * (0.5 + rnd); ctx.fillStyle = hexA(col, Math.max(0, tw)); ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    }
  }
  fiber(ctx, ax, ay, bx, by) {                              // straight in Eye; soft curved filament in Field
    ctx.beginPath(); ctx.moveTo(ax, ay);
    if (this.viewMode === "field") { const dx = bx - ax, dy = by - ay; ctx.quadraticCurveTo((ax + bx) / 2 - dy * 0.16, (ay + by) / 2 + dx * 0.16, bx, by); }
    else ctx.lineTo(bx, by);
    ctx.stroke();
  }
  fieldDust(ctx) {                                          // semantic DUST — tiny non-node particles thickening each cluster (uneven weather)
    const t = this._t, keys = Object.keys(this._clusterPos || {}), R = this.Ri - this.Rp;
    for (const k of keys) {
      const cp = this._clusterPos[k]; if (!cp) continue;
      const bx = this.sx(cp.cx, 9), by = this.sy(cp.cy, 9);
      for (let i = 0; i < 26; i++) {
        const h1 = ((i * 9301 + 49297) % 233280) / 233280, h2 = ((i * 4099 + 1) % 9973) / 9973;
        const a = i * 2.39996 + t * 0.0025 * (0.4 + h1), rr = R * 0.36 * Math.sqrt(h2) * (0.7 + 0.4 * Math.sin(t * 0.01 + i));
        const tw = (0.04 + 0.13 * h1) * (0.45 + 0.55 * Math.sin(t * 0.03 + i * 1.3));
        ctx.fillStyle = hexA("#eaf2ff", Math.max(0, tw)); ctx.fillRect(bx + rr * Math.cos(a), by + rr * Math.sin(a), 1, 1);
      }
    }
  }
  voidClusters(ctx) {                                       // a few faint dandelion bursts adrift in the VOID outside the eye
    const cx = this.cx, cy = this.cy, t = this._t, spots = [[-1.3, -0.5], [1.34, 0.34], [-1.12, 0.66], [1.08, -0.62]];
    spots.forEach(([fx, fy], si) => {
      const hx = cx + fx * this.hw + this.par.x * 1.2, hy = cy + fy * this.hh + this.par.y * 1.2;
      ctx.fillStyle = hexA("#eaf2ff", 0.16); ctx.fillRect(hx - 1, hy - 1, 2, 2);
      for (let i = 0; i < 18; i++) {
        const h1 = ((i * 7919 + si * 911) % 6997) / 6997, h2 = ((i * 4051 + si * 17) % 5003) / 5003;
        const a = i * 2.39996 + t * 0.003, rr = 30 * Math.sqrt(h2) * (0.7 + 0.3 * Math.sin(t * 0.02 + i));
        const x = hx + rr * Math.cos(a), y = hy + rr * Math.sin(a);
        if (h1 < 0.3) { ctx.strokeStyle = hexA("#9fb6d8", 0.05); ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + x) / 2 - (y - hy) * 0.2, (hy + y) / 2 + (x - hx) * 0.2, x, y); ctx.stroke(); }
        ctx.fillStyle = hexA("#eaf2ff", Math.max(0, (0.05 + 0.16 * h1) * (0.5 + 0.5 * Math.sin(t * 0.03 + i)))); ctx.fillRect(x, y, 1, 1);
      }
    });
  }
  off(ctx, depth) { ctx.save(); ctx.translate(this.par.x * depth, this.par.y * depth); }
  draw(ctx) {
    const W = this.W, H = this.H, cx = this.cx, cy = this.cy, T = this.theme;
    this._now = Date.now();
    // ---- advance animation ----
    this._t++;                                                                // time advances (motion is alive)
    for (const n of this.nodes) { n.x += (n.tx - n.x) * 0.2; n.y += (n.ty - n.y) * 0.2; }
    if (this.pulse) { if (++this.pulse.frame >= 16) { this.pulse.frame = 0; if (++this.pulse.idx >= this.pulse.seq.length) this.pulse = null; } }
    for (const [id, t] of this.crystal) { const nt = t + 0.022; if (nt >= 1) this.crystal.delete(id); else this.crystal.set(id, nt); }
    this.blink = 0;                                                           // blink removed by design — no eyelid close, ever
    this.breath = 1 + 0.02 * Math.sin(this._t * 0.012);                       // the iris breathes
    this.par.x += (this._parTarget.x - this.par.x) * 0.08; this.par.y += (this._parTarget.y - this.par.y) * 0.08;   // EASED parallax — the scene glides toward the cursor instead of lurching with it

    // ---- the curious camera + eased season + emergent-eye intensity ----
    let ax = 0, ay = 0, aw = 0;
    for (const n of this.nodes) { if (n.id === this.hoverId && n.id !== this.focusId && !this.active.has(n.id)) continue; const a = this.attention(n); if (a > 0.5) { ax += n.tx * a; ay += n.ty * a; aw += a; } }   // casual HOVER must not drag the camera (the swim) — only focus/active/reasoning steer it
    const tcx = aw ? cx + (ax / aw - cx) * 0.18 : cx, tcy = aw ? cy + (ay / aw - cy) * 0.18 : cy;
    const _follow = Math.abs(this.userZoom - 1) > 0.04 ? 0.004 : 0.05;          // when the user has scroll-zoomed the field, HOLD the view (don't let the auto-camera yank it away)
    this.camcx = this.camcx == null ? cx : this.camcx + (tcx - this.camcx) * _follow;
    this.camcy = this.camcy == null ? cy : this.camcy + (tcy - this.camcy) * _follow;
    const te = this.reasonIntensity();
    this._emerge = this._emerge == null ? te : this._emerge + (te - this._emerge) * 0.04;
    this.zoom += (1 + 0.08 * this._emerge - this.zoom) * 0.05;
    this._uz = this.viewMode === "field" ? this.userZoom : 1;                   // user scroll-zoom applies to the Field only; Eye view stays native
    const ts = this.seasonOf();
    if (!this._season) this._season = { name: ts.name, contrast: ts.contrast, ambient: ts.ambient, motion: ts.motion };
    else { this._season.name = ts.name; this._season.contrast += (ts.contrast - this._season.contrast) * 0.04; this._season.ambient += (ts.ambient - this._season.ambient) * 0.04; this._season.motion += (ts.motion - this._season.motion) * 0.04; }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
    this.layerStarfield(ctx);                                                 // (1) background — cognitive universe
    ctx.save(); this.almondPath(ctx); ctx.clip();
    // (2) sclera/iris — Eye: a dark fill; Field: nearly vanishes (eye implied by particles, not a filled container)
    {
      const g = ctx.createRadialGradient(cx, cy, this.Rp, cx, cy, this.hw);
      if (this.viewMode === "field") { g.addColorStop(0, hexA(T.scleraInner, 0.22)); g.addColorStop(1, hexA(T.scleraOuter, 0)); }
      else { g.addColorStop(0, T.scleraInner); g.addColorStop(1, T.scleraOuter); }
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (this.viewMode !== "field") {                                          // iris rings read as UI — Field hides them
      ctx.strokeStyle = T.irisRing;
      for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(cx, cy, this.Rp + (k / 3) * (this.Ri - this.Rp), 0, Math.PI * 2); ctx.stroke(); }
    }
    this.layerFibers(ctx);                                                    // (3) faint neural fibers + active path
    this.flowLayer(ctx);                                                      // (3b) learning flows back into capabilities
    this.conduitFlow(ctx);                                                    // (3b') living conduits — slow dots travel the strong connections
    this.inferredLayer(ctx);                                                  // (3b'') inferred "suggested" pathways — dashed teal links Claude proposed
    this.developmentLayer(ctx);                                              // (3b''') RUNTIME glow — the pathways Claude is developing right now
    if (this.viewMode === "field") this.fieldDust(ctx);                       // (3c) semantic dust thickens the field
    this.layerParticles(ctx);                                                 // (4) the particle field (physics + morph)
    this.layerClouds(ctx);                                                    // (4b) cognitive-zoom: folded dot-clusters drawn as labelled clouds
    this.off(ctx, 9); this.drawPupil(ctx); ctx.restore();                     // (5) pupil = mission
    ctx.restore(); // clip
    if (this.viewMode === "field") this.voidClusters(ctx);                    // satellite constellations adrift in the negative space

    // (6) eye boundary — Field: a BROKEN PARTICLE RIM (the eye emerges from density); Eye: the classic silhouette
    if (this.viewMode === "field") { this.rimParticles(ctx); }
    else {
      const outA = T.outlineMin + (1 - T.outlineMin) * this._emerge;
      this.almondPath(ctx); ctx.lineWidth = Math.max(3, this.hw * 0.018); ctx.strokeStyle = hexA(T.eyeOutline, outA); ctx.stroke();
      this.lashes(ctx, T.lashMin + (1 - T.lashMin) * this._emerge);
    }
    // (7) HUD overlays
    this.layerLabels(ctx);                                                    // category labels emerge on hover/focus
    this.nodeLabels(ctx);
    this.drawCockpit(ctx);                                                    // the IDE status bar
    this.drawNorthStar(ctx);                                                  // the persistent long-term goal banner + momentum
    this.drawReasoningStrip(ctx);
    this.drawThemeChip(ctx);                                                  // atmosphere toggle (click to cycle)
    if (this.blink > 0.001) this.drawBlink(ctx);
  }
  sx(x, d) { return this.cx + (x - this.camcx) * this.breath * this.zoom * this._uz + this.par.x * (d ? d / 9 : 0); }
  sy(y, d) { return this.cy + (y - this.camcy) * this.breath * this.zoom * this._uz + this.par.y * (d ? d / 9 : 0); }
  layerStarfield(ctx) {                                                       // ambient drifting starfield (negative space honoured)
    const cx = this.cx, cy = this.cy, maxR = Math.max(this.W, this.H) * 0.62, t = this._t;
    const amb = this._season ? this._season.ambient : 1;
    for (const s of this.stars) {
      const a = s.a + t * 0.00006, r = s.r * maxR;
      const x = cx + r * Math.cos(a) + this.par.x * 1.4, y = cy + r * Math.sin(a) * 0.82 + this.par.y * 1.4;
      const tw = s.br * (0.5 + 0.5 * Math.sin(t * 0.03 * s.sp * 10 + s.ph));
      ctx.fillStyle = hexA(this.theme.starfield, tw * 0.5 * amb); ctx.fillRect(x, y, 1.3, 1.3);
    }
  }
  layerFibers(ctx) {                                                          // edges almost vanish; active path lights up
    const hot = this.hoverId || this.focusId, t = this._t, T = this.theme;
    if (this.viewMode === "field") {                                          // Field: faint curved filaments across the WHOLE network (cognitive weather)
      ctx.lineWidth = 0.85; ctx.strokeStyle = hexA("#cfe0ff", 0.13);          // connections emphasized — brighter + wider
      const stride = this.edges.length > 1400 ? 2 : 1; let ei = 0;            // PERF: subsample the dense weather (still reads, half the curves)
      for (const e of this.edges) {
        if (hot && (e.source === hot || e.target === hot)) continue;
        const a = this.byId.get(e.source), b = this.byId.get(e.target);
        if (this.isFolded(a) || this.isFolded(b)) continue;                    // skip edges to folded dots (hidden in constellation view) — big PERF win
        if (this.alphaOf(a) < 0.4 && this.alphaOf(b) < 0.4) continue;
        if (stride > 1 && (ei++ & 1)) continue;
        this.fiber(ctx, this.sx(a.x, 6), this.sy(a.y, 6), this.sx(b.x, 6), this.sy(b.y, 6));
      }
    } else {
      let ei = 0, drawn = 0;                                                   // Eye: connections visible but BOUNDED (was a ~2000-line hairball → lag)
      for (const e of this.edges) {
        if (drawn >= 950) break;                                              // PERF hard cap
        if (hot && (e.source === hot || e.target === hot)) continue;
        const a = this.byId.get(e.source), b = this.byId.get(e.target);
        if (this.alphaOf(a) < 0.5 && this.alphaOf(b) < 0.5) continue;
        const recip = this.recip.has(e.source + "|" + e.target) || this.recip.has(e.target + "|" + e.source);
        if (!recip && (ei++ % 3)) continue;                                    // reciprocal links always; only every 3rd weak one-way
        ctx.lineWidth = recip ? 1.0 : 0.6; ctx.strokeStyle = hexA(T.fiberHot, recip ? 0.24 : 0.10);   // reciprocal brighter
        this.fiber(ctx, this.sx(a.x, 6), this.sy(a.y, 6), this.sx(b.x, 6), this.sy(b.y, 6));
        drawn++;
      }
    }
    for (const e of this.edges) {                                             // active reasoning path: illuminate
      const inPulse = this.pulse && this.pulse.idx > 0 && this.isPulseEdge(e);
      const incident = hot && (e.source === hot || e.target === hot);
      if (!inPulse && !incident) continue;
      const a = this.byId.get(e.source), b = this.byId.get(e.target);
      ctx.lineWidth = inPulse ? 2.2 : 1.1;
      ctx.strokeStyle = inPulse ? hexA(T.fiberHot, 0.9) : hexA(this.catColor(this.byId.get(hot)), 0.45);
      this.fiber(ctx, this.sx(a.x, 6), this.sy(a.y, 6), this.sx(b.x, 6), this.sy(b.y, 6));
      if (inPulse) { const ph = (t % 28) / 28, mx = a.x + (b.x - a.x) * ph, my = a.y + (b.y - a.y) * ph; ctx.fillStyle = T.waveDot; ctx.beginPath(); ctx.arc(this.sx(mx, 6), this.sy(my, 6), 2, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  developmentLayer(ctx) {                                   // RUNTIME: glowing conduits where Claude is ACTIVELY developing the system (eye-state.activeEdges)
    const ae = this.activeEdges; if (!ae || !ae.length) return;
    const t = this._t, T = this.theme;
    ctx.save(); ctx.lineWidth = 2.0; ctx.strokeStyle = hexA(T.fiberHot, 0.85); ctx.shadowColor = T.fiberHot; ctx.shadowBlur = 10;
    for (const [s, tg] of ae) {
      const a = this.byId.get(s), b = this.byId.get(tg); if (!a || !b || this.isFolded(a) || this.isFolded(b)) continue;
      this.fiber(ctx, this.sx(a.x, 6), this.sy(a.y, 6), this.sx(b.x, 6), this.sy(b.y, 6));
      for (let k = 0; k < 2; k++) {                                          // signal flowing as Claude builds
        const ph = (t * 0.012 + k * 0.5) % 1, mx = a.x + (b.x - a.x) * ph, my = a.y + (b.y - a.y) * ph;
        ctx.fillStyle = hexA(T.waveDot, 0.9 * Math.sin(ph * Math.PI));
        ctx.beginPath(); ctx.arc(this.sx(mx, 6), this.sy(my, 6), 2.2, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.shadowBlur = 0; ctx.restore();
  }
  inferredLayer(ctx) {                                                        // inferred "suggested" pathways — dashed COOL-TEAL links Claude proposed (distinct from authored)
    const ie = this.inferredEdges; if (!ie || !ie.length) return;
    const hot = this.hoverId || this.focusId, t = this._t;
    ctx.save(); ctx.lineWidth = 0.8; ctx.setLineDash([3, 4]); ctx.lineDashOffset = -(t * 0.06) % 7;
    for (const e of ie) {
      const a = this.byId.get(e.source), b = this.byId.get(e.target); if (!a || !b) continue;
      if (this.isFolded(a) || this.isFolded(b)) continue;                      // skip inferred edges to folded dots
      if (this.alphaOf(a) < 0.4 && this.alphaOf(b) < 0.4) continue;
      const inc = hot && (e.source === hot || e.target === hot);
      ctx.strokeStyle = hexA("#7cf5d0", inc ? 0.6 : 0.15);                    // cool teal = "suggested" (vs authored white/hot); brighter when incident to hover/focus
      this.fiber(ctx, this.sx(a.x, 6), this.sy(a.y, 6), this.sx(b.x, 6), this.sy(b.y, 6));
    }
    ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.restore();
  }
  conduitFlow(ctx) {                                                          // living conduits — a slow dot travels each STRONG (reciprocal) connection
    const t = this._t, T = this.theme; let n = 0;
    for (const e of this.edges) {
      if (!(this.recip.has(e.source + "|" + e.target) || this.recip.has(e.target + "|" + e.source))) continue;
      const a = this.byId.get(e.source), b = this.byId.get(e.target);
      if (!a || !b || this.isFolded(a) || this.isFolded(b) || this.alphaOf(a) < 0.5 || this.alphaOf(b) < 0.5) continue;
      if (++n > 250) break;                                                   // PERF cap — plenty for the "alive" read
      const ph = (t * 0.004 + (a._h || 0)) % 1, mx = a.x + (b.x - a.x) * ph, my = a.y + (b.y - a.y) * ph;
      ctx.fillStyle = hexA(T.waveDot, 0.45 * Math.sin(ph * Math.PI));
      ctx.beginPath(); ctx.arc(this.sx(mx, 6), this.sy(my, 6), 1.3, 0, Math.PI * 2); ctx.fill();
    }
  }
  flowLayer(ctx) {                                                            // experience flows back into capabilities (learning)
    if (!this._flows || !this._flows.length) return;
    const t = this._t;
    for (const [aId, bId] of this._flows) {
      const a = this.byId.get(aId), b = this.byId.get(bId); if (!a || !b) continue;
      const hot = this.active.has(aId) || this.active.has(bId) || this.focusId === aId || this.focusId === bId;
      const base = hot ? 0.85 : 0.4;
      for (let k = 0; k < 2; k++) {
        const ph = (t * 0.004 + k * 0.5) % 1, x = a.x + (b.x - a.x) * ph, y = a.y + (b.y - a.y) * ph;
        ctx.fillStyle = hexA(this.catColor(a), base * (0.4 + 0.6 * Math.sin(ph * Math.PI)));
        ctx.beginPath(); ctx.arc(this.sx(x, 6), this.sy(y, 6), 1.6, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  layerClouds(ctx) {                                                          // cognitive-zoom: each folded dot-cluster = one soft "cloud" super-node (size ∝ members)
    this._cloudHits = [];
    if (this.viewMode !== "field" || this.zoomLevel !== "constellation") return;
    const t = this._t, keys = Object.keys(this._dotClusters || {});
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const k of keys) {
      if (this.expanded.has(k)) continue;
      const dc = this._dotClusters[k], x = this.sx(dc.cx, 9), y = this.sy(dc.cy, 9), r = 10 + Math.sqrt(dc.count) * 3.4;
      if (this._glow) { ctx.globalAlpha = 0.5; ctx.drawImage(this._glow, x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1; }
      for (let i = 0; i < 14; i++) { const a = i * 2.39996 + t * 0.004, rr = r * (0.4 + 0.6 * ((i * 0.61803) % 1)); ctx.fillStyle = hexA("#eaf2ff", 0.08 + 0.07 * Math.sin(t * 0.03 + i)); ctx.fillRect(x + rr * Math.cos(a), y + rr * Math.sin(a), 1.4, 1.4); }
      ctx.strokeStyle = hexA("#cfe0ff", 0.22); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = hexA("#eaf2ff", 0.92); ctx.font = "600 10px " + this.lf(); ctx.fillText(k.replace(/-/g, " "), x, y);
      ctx.fillStyle = hexA("#9fb6d8", 0.7); ctx.font = "8px " + this.lf(); ctx.fillText(String(dc.count), x, y + 12);
      this._cloudHits.push({ key: k, x: dc.cx, y: dc.cy, r: r + 4 });
    }
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  }
  layerParticles(ctx) {                                                       // each node = a glowing cluster (physics + agency + morph)
    const t = this._t, T = this.theme, emph = this._season ? this._season.contrast : 1, mot = this._season ? this._season.motion : 1;
    for (const n of this.nodes) {
      const al = this.alphaOf(n); if (al < 0.06) continue;
      if (this.viewMode === "field" && this.zoomLevel === "constellation" && n.cluster && n.cluster !== n.id && !this.expanded.has(n.cluster)) continue;   // cognitive-zoom: dot folded into its cloud
      const att = this.attention(n), cat = this.categoryOf(n);
      let col = this.catColor(n);
      const field = this.viewMode === "field", z = field ? (n._zv != null ? n._zv : 0.5) : 1;
      if (field) col = mixHex(col, "#ffffff", 0.92);                          // mostly-white field; only a whisper of category temperature
      const primed = this.active.has(n.id) || n.id === this.focusId;
      const hotN = n.id === this.hoverId || n.id === this.focusId || (this.pulse && this.pulse.seq[this.pulse.idx] === n.id) || this.crystal.has(n.id);
      const imp = Math.min(1, 0.3 + (n._deg || 0) * 0.02);                    // importance = degree
      // cognitive physics: knowledge = high mass (slow); working memory = high energy (fast)
      const energy = primed ? 1 : (cat === "concepts" || cat === "patterns" || cat === "synthesis") ? 0.25 : 0.6;
      const motion = mot * (0.5 + energy);
      // uncertainty: tiny time-seeded fluctuation — the field never reaches equilibrium (deterministic, no RNG)
      const seed = (n._sat && n._sat[0]) ? n._sat[0].ph : 0;
      const jx = Math.sin(t * 0.010 * motion + seed) * 1.3 + Math.sin(t * 0.005 + seed * 1.7) * 0.9;   // gentler + larger living drift — the field breathes, not jitters
      const jy = Math.cos(t * 0.009 * motion + seed * 1.3) * 1.3 + Math.cos(t * 0.0045 + seed * 2.1) * 0.9;
      const cxn = this.sx(n.x, 9) + jx, cyn = this.sy(n.y, 9) + jy;
      const _sats = n._sat || [], _nsat = (att < 0.3) ? Math.min(6, _sats.length) : _sats.length;   // cap satellites for dim nodes in BOTH modes → crisper dots + cheaper
      for (let _si = 0; _si < _nsat; _si++) { const s = _sats[_si];            // satellites — agency: hesitate / drift
        const ang = s.a + t * 0.01 * s.sp * motion;
        const rmul = 1 + (energy > 0.8 ? 0.18 * Math.sin(t * 0.02 * s.sp + s.ph) : 0.05 * Math.sin(t * 0.01 + s.ph));
        const px = cxn + s.r * rmul * Math.cos(ang), py = cyn + s.r * rmul * Math.sin(ang);
        const tw = s.br * (0.55 + 0.45 * Math.sin(t * 0.04 * s.sp + s.ph));
        ctx.fillStyle = hexA(col, (field ? al * (0.4 + 0.6 * z) : al) * tw * (this.isHollow(n) ? 0.45 : 0.85) * (0.6 + 0.4 * att));
        const ss = field ? 0.8 + 0.55 * z : 1.5; ctx.beginPath(); ctx.arc(px, py, ss * 0.62, 0, Math.PI * 2); ctx.fill();   // ROUND soft dot (was a hard square) — refined particle shape
      }
      const dof = 0.6 + 0.4 * att;                                            // depth of field — low-priority recedes
      const cr = field ? (0.45 + imp * imp * 2.8 + (hotN ? 2.4 : 0)) * dof * (0.5 + 0.6 * z)   // Field: bimodal — most tiny, only hubs/hot large
                       : (1.6 + imp * 2.2 + (hotN ? 1.6 : 0)) * dof;
      if (this.isFresh(n) && al > 0.3) { ctx.fillStyle = hexA(T.freshHalo, al * 0.12 * (0.5 + 0.5 * att)); ctx.beginPath(); ctx.arc(cxn, cyn, cr + 4, 0, Math.PI * 2); ctx.fill(); }   // freshness (the Fresh stage)
      if (primed) { ctx.strokeStyle = hexA(T.primedHalo, al * 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cxn, cyn, cr + 3, 0, Math.PI * 2); ctx.stroke(); }                      // primed halo
      if (field) {                                                            // PERF: bloom via a cheap pre-rendered SPRITE, not per-node shadowBlur
        const glowA = al * (0.08 + 0.5 * att + (hotN ? 0.3 : 0)) * (0.35 + 0.65 * z);
        if (glowA > 0.02 && this._glow) { const gr = (cr + 3 + imp * 5) * (hotN ? 2.2 : 1.3); ctx.globalAlpha = Math.min(1, glowA); ctx.drawImage(this._glow, cxn - gr, cyn - gr, gr * 2, gr * 2); ctx.globalAlpha = 1; }
        if (hotN) { ctx.shadowColor = "#eaf2ff"; ctx.shadowBlur = 14 + imp * 6; }   // real blur only for the few hot nodes
      }
      else if (T.achroma) { ctx.shadowColor = "#dfe8ff"; ctx.shadowBlur = (hotN ? 16 : 3) + imp * 7; }              // density = light (Cognition)
      else if (hotN) { ctx.shadowColor = col; ctx.shadowBlur = (this.crystal.has(n.id) ? 22 : 14) * emph; }
      this.drawRole(ctx, this.renderRole(n), n, cxn, cyn, cr, col, field ? al * (0.45 + 0.55 * z) : al, imp, t);   // SEMANTIC MORPHING — form by role
      if (field && this._today && n.review_due && n.review_due <= this._today && al > 0.2) {   // review-loop: a soft amber "due for review" ring
        ctx.strokeStyle = hexA("#e0a458", al * (0.4 + 0.3 * Math.sin(t * 0.06 + (n._h || 0) * 6))); ctx.lineWidth = 1.2; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.arc(cxn, cyn, cr + 5, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.shadowBlur = 0;
    }
  }
  drawRole(ctx, role, n, x, y, cr, col, al, imp, t) {       // the node's CURRENT form (behaviour, not type)
    switch (role) {
      case "gap": {                                          // unstable: flicker + animated dashed halo; stabilizes on crystallize
        const flick = 0.5 + 0.5 * Math.sin(t * 0.18 + (n._sat && n._sat[0] ? n._sat[0].ph : 0)) * (0.6 + 0.4 * Math.sin(t * 0.05));
        const z = this.crystal.has(n.id) ? (this.crystal.get(n.id) || 0) : 0;
        ctx.beginPath(); ctx.arc(x, y, cr, 0, Math.PI * 2);
        ctx.setLineDash([3, 2]); ctx.lineWidth = 1.2; ctx.strokeStyle = hexA(col, al * (0.5 + 0.5 * flick) * (1 - z)); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(x, y, cr + 7, 0, Math.PI * 2);
        ctx.setLineDash([4, 3]); ctx.lineDashOffset = -(t * 0.12) % 7; ctx.lineWidth = 1; ctx.strokeStyle = hexA(col, al * 0.32 * flick * (1 - z)); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
        if (z > 0) { ctx.fillStyle = hexA(col, al * z * 0.9); ctx.beginPath(); ctx.arc(x, y, cr * z, 0, Math.PI * 2); ctx.fill(); }
        break;
      }
      case "anchor": {                                       // decision: gravity well — slow concentric rings, bright core
        const gw = 0.5 + 0.5 * Math.sin(t * 0.011);
        for (const rr of [cr + 6, cr + 11]) { ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.strokeStyle = hexA(col, al * 0.1 * (1.3 - gw)); ctx.lineWidth = 1; ctx.stroke(); }
        ctx.fillStyle = hexA(col, Math.min(1, al * (0.85 + imp * 0.4))); ctx.beginPath(); ctx.arc(x, y, cr, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case "nucleus": {                                      // capability / working memory: dense nucleus + hex shell
        ctx.fillStyle = hexA(col, Math.min(1, al * (0.7 + imp * 0.5))); ctx.beginPath(); ctx.arc(x, y, cr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = hexA(col, al * 0.9); ctx.beginPath(); ctx.arc(x, y, cr * 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = hexA(col, al * 0.4); ctx.lineWidth = 1; ctx.beginPath(); SHAPES.hexagon(ctx, x, y, cr + 4); ctx.stroke();
        break;
      }
      case "beacon": {                                       // focus: bright core + radiating ring pulse
        ctx.fillStyle = hexA(col, Math.min(1, al * (0.8 + imp * 0.5))); ctx.beginPath(); ctx.arc(x, y, cr, 0, Math.PI * 2); ctx.fill();
        const bp = (t % 60) / 60; ctx.strokeStyle = hexA(col, al * 0.5 * (1 - bp)); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, cr + bp * 10, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      case "stream": {                                       // node currently flowing through reasoning
        ctx.fillStyle = hexA(col, Math.min(1, al)); ctx.beginPath(); ctx.arc(x, y, cr + 1, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = hexA(col, al * 0.6); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, cr + 4, 0, Math.PI * 2); ctx.stroke();
        break;
      }
      default: {                                             // star — settled knowledge (also covers non-gap hollow)
        if (this.isHollow(n)) { ctx.beginPath(); ctx.arc(x, y, cr, 0, Math.PI * 2); ctx.setLineDash([3, 2]); ctx.lineWidth = 1.2; ctx.strokeStyle = hexA(col, al); ctx.stroke(); ctx.setLineDash([]); }
        else { ctx.fillStyle = hexA(col, Math.min(1, al * (0.7 + imp * 0.5))); ctx.beginPath(); ctx.arc(x, y, cr, 0, Math.PI * 2); ctx.fill(); }
      }
    }
  }
  layerLabels(ctx) {                                                          // statistical: a category label only on hover/focus
    if (this.viewMode === "field") return;                                    // Cognition Field: no category labels (hover-only nodeLabels)
    const show = new Set();
    if (this.hoverId && this.byId.get(this.hoverId)) show.add(this.categoryOf(this.byId.get(this.hoverId)));
    if (this.focusId && this.byId.get(this.focusId)) show.add(this.categoryOf(this.byId.get(this.focusId)));
    if (!show.size) return;
    ctx.textBaseline = "middle"; ctx.textAlign = "center"; ctx.font = "700 11px " + this.lf();
    const sector = (Math.PI * 2) / this.catsPresent.length, T = this.theme;
    this.catsPresent.forEach((c, i) => {
      if (!show.has(c.key)) return;
      const a = -Math.PI / 2 + (i + 0.5) * sector, lx = this.cx + (this.Ri + 16) * Math.cos(a), ly = this.cy + (this.Ri + 16) * Math.sin(a);
      if (Math.abs(ly - this.cy) > this.hh + 4) return;
      const w = ctx.measureText(c.label).width;
      ctx.fillStyle = T.labelBg; ctx.fillRect(lx - w / 2 - 4, ly - 8, w + 8, 16);
      ctx.fillStyle = this.catColorKey(c.key); ctx.fillText(c.label, lx, ly);
    });
  }
  isPulseEdge(e) {
    const seq = this.pulse.seq;
    for (let i = 1; i <= this.pulse.idx && i < seq.length; i++) {
      if ((e.source === seq[i - 1] && e.target === seq[i]) || (e.target === seq[i - 1] && e.source === seq[i])) return true;
    }
    return false;
  }
  drawPupil(ctx) {
    if (this.viewMode === "field") return this.drawFieldVoid(ctx);            // Field: a dark void, not a solid orb
    const cx = this.cx, cy = this.cy, Rp = this.Rp, s = this.state || {}, T = this.theme;
    let g = ctx.createRadialGradient(cx, cy, 1, cx, cy, Rp);
    for (const [c, stop] of T.pupilStops) g.addColorStop(stop, c);
    ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    if (typeof s.confidence === "number") {                                  // confidence arc around pupil
      ctx.strokeStyle = T.confArc; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, Rp + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.confidence); ctx.stroke();
    }
    ctx.fillStyle = "#ffffff22"; ctx.beginPath(); ctx.arc(cx - Rp * 0.32, cy - Rp * 0.36, Rp * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (this.focusId && !s.goal) { ctx.fillStyle = "#cfe0ff"; ctx.font = "600 11px " + this.lf(); this.wrap(ctx, this.byId.get(this.focusId).title, cx, cy, Rp * 1.6, 12); return; }
    if (s.goal) {                                                            // terminal HUD
      ctx.fillStyle = "#8fb6ff"; ctx.font = "10px ui-monospace,monospace";
      this.wrap(ctx, s.goal, cx, cy - Rp * 0.42, Rp * 1.7, 11);
      if (typeof s.confidence === "number") { ctx.fillStyle = "#39d98a"; ctx.font = "700 18px ui-monospace,monospace"; ctx.fillText(Math.round(s.confidence * 100) + "%", cx, cy + Rp * 0.18); }
      const st = (s.status || "").toLowerCase();
      ctx.fillStyle = "#7e8aa0"; ctx.font = "9px ui-monospace,monospace";
      ctx.fillText(st === "done" ? "✓ done" : st ? st + "…" : "", cx, cy + Rp * 0.62);
    } else { ctx.fillStyle = "#cfe0ff"; ctx.font = "600 12px " + this.lf(); ctx.fillText("KNOWLEDGE", cx, cy - 4); ctx.fillStyle = "#5b6b80"; ctx.font = "9px " + this.lf(); ctx.fillText(this.nodes.length + " nodes", cx, cy + 9); }
  }
  drawFieldVoid(ctx) {                                      // Field centre: a dark cognitive VOID — soft, no solid disc, no label
    const cx = this.cx, cy = this.cy, s = this.state || {}, t = this._t, ca = this.theme.confArc;
    const Rv = this.Rp * 0.6 * (1 + 0.05 * Math.sin(t * 0.01));
    const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, Rv * 2.4);
    g.addColorStop(0, "#000000dd"); g.addColorStop(0.55, "#00000055"); g.addColorStop(1, "#00000000");   // fades into the field — no hard disc
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, Rv * 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hexA(ca, 0.08); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, Rv, 0, Math.PI * 2); ctx.stroke();   // faint bloom rim
    if (typeof s.confidence === "number") { ctx.strokeStyle = hexA(ca, 0.7); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, Rv + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.confidence); ctx.stroke(); }
    if (s.goal || this.focusId) {                                            // minimal text only when there IS a mission/focus
      const txt = s.goal || (this.byId.get(this.focusId) || {}).title || "";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = hexA("#dfe8ff", 0.85); ctx.font = "10px " + this.lf();
      this.wrap(ctx, txt, cx, cy, Rv * 3.2, 12);
    }
  }
  drawBlink(ctx) {
    ctx.save(); this.almondPath(ctx); ctx.clip();
    const cy = this.cy, hh = this.hh, a = this.blink;
    const top = cy - hh + a * hh, bot = cy + hh - a * hh;
    ctx.fillStyle = "#b9967f"; ctx.fillRect(0, cy - hh - 4, this.W, (top - (cy - hh)) + 4);
    ctx.fillRect(0, bot, this.W, (cy + hh) - bot + 6);
    ctx.restore();
  }
  lashes(ctx, alpha) {
    const cx = this.cx, cy = this.cy, hw = this.hw, yc = this.lidYc, R = this.lidR, upC = cy + yc;
    const aL = Math.atan2(cy - upC, -hw), aR = Math.atan2(cy - upC, hw);
    ctx.strokeStyle = hexA(this.theme.lash, alpha == null ? 1 : alpha); ctx.lineWidth = 2; const N = 22;
    for (let i = 1; i < N; i++) { const a = aL + (aR - aL) * (i / N), x = cx + R * Math.cos(a), y = upC + R * Math.sin(a), len = 9 + 7 * Math.sin(Math.PI * i / N); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(a) * len, y - Math.sin(a) * len); ctx.stroke(); }
  }
  nodeLabels(ctx) {
    ctx.font = "12px ui-sans-serif"; ctx.textBaseline = "bottom"; const T = this.theme;
    const lbl = [], add = id => { if (id && !lbl.includes(id)) lbl.push(id); };
    add(this.hoverId);
    if (this.northStar && this.northStar.anchor && this.byId.has(this.northStar.anchor)) add(this.northStar.anchor);   // the north-star anchor is always labelled (a locatable pole star)
    if (this.pulse) add(this.pulse.seq[this.pulse.idx]);
    if (this.focusId) {                                                        // focus + only the 8 highest-degree neighbours (no unreadable pile on hubs)
      add(this.focusId);
      [...(this.adj.get(this.focusId) || [])].sort((a, b) => ((this.byId.get(b) || {})._deg || 0) - ((this.byId.get(a) || {})._deg || 0)).slice(0, 8).forEach(add);
    }
    const placed = [];
    for (const id of lbl) {
      const n = this.byId.get(id); if (!n || this.alphaOf(n) < 0.5) continue;
      const bold = id === this.focusId || id === this.hoverId || (this.pulse && this.pulse.seq[this.pulse.idx] === id);
      ctx.font = (bold ? "600 12px" : "11px") + " " + this.lf();
      const w = ctx.measureText(n.title).width, cxl = this.sx(n.x, 9), cyl = this.sy(n.y, 9) - 11;
      const box = { x: cxl - w / 2 - 6, y: cyl - 8, w: w + 12 };
      if (!bold && placed.some(p => Math.abs(p.x - box.x) < (p.w + box.w) / 2 && Math.abs(p.y - box.y) < 17)) continue;   // collision-skip
      placed.push(box);
      this.roundRect(ctx, box.x, box.y, box.w, 16, 7);                        // pill label
      ctx.fillStyle = T.nodePillBg; ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = hexA(this.catColor(n), 0.7); ctx.stroke();
      ctx.fillStyle = bold ? T.nodePillTextHot : T.nodePillText; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(n.title, cxl, cyl);
    }
    ctx.textBaseline = "bottom";
  }
  isFresh(n) {
    if (!n.updated || !this._now) return false;
    const t = Date.parse(n.updated);
    return !isNaN(t) && (this._now - t) < 7 * 864e5;            // updated within 7 days
  }
  roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  clipFit(ctx, t, maxw) { let s = String(t); while (s.length > 4 && ctx.measureText(s).width > maxw) s = s.slice(0, -2); return s.length < String(t).length ? s + "…" : s; }
  goalProgress() {                                          // NORTH STAR: momentum in the goal's neighbourhood (honest counts, never a fake %-complete)
    const ns = this.northStar; if (!ns || !ns.goal) return null;
    let ids;
    if (ns.anchor && this.byId.has(ns.anchor)) { const d = this.bfs(ns.anchor); ids = [...d].filter(e => e[1] <= 2).map(e => e[0]); }
    else ids = this.nodes.map(n => n.id);
    const total = ids.length || 1; let fresh = 0, due = 0;
    for (const id of ids) { const n = this.byId.get(id); if (!n) continue; if (this.isFresh(n)) fresh++; if (this._today && n.review_due && n.review_due <= this._today) due++; }
    return { goal: ns.goal, anchorId: (ns.anchor && this.byId.has(ns.anchor)) ? ns.anchor : null, total, fresh, due, pct: fresh / total };
  }
  drawNorthStar(ctx) {                                       // a persistent top-centre banner: the long-term goal the Lens orbits + its momentum
    const g = this.goalProgress(); if (!g) return;
    const T = this.theme, y = 10, h = 24, pad = 12, gap = 11, barW = 84;
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    ctx.font = "600 11px " + this.lf(); const label = this.clipFit(ctx, "✦ " + g.goal, 340), lw = ctx.measureText(label).width;
    const meta = g.fresh + " fresh · " + g.due + " due · " + g.total + " in orbit";
    ctx.font = "9px ui-monospace,monospace"; const mw = ctx.measureText(meta).width;
    const w = pad + lw + gap + barW + gap + mw + pad, x = Math.max(232, (this.W - w) / 2);   // keep clear of the cockpit (which ends at x≈216)
    this.roundRect(ctx, x, y, w, h, 12); ctx.fillStyle = T.hudBg; ctx.fill(); ctx.strokeStyle = hexA(T.hudAccent, 0.55); ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = hexA("#dfe8ff", 0.96); ctx.font = "600 11px " + this.lf(); ctx.fillText(label, x + pad, y + h / 2 + 0.5);
    const bx = x + pad + lw + gap, by = y + h / 2 - 2;
    this.roundRect(ctx, bx, by, barW, 4, 2); ctx.fillStyle = "#16294a"; ctx.fill();
    this.roundRect(ctx, bx, by, barW * Math.min(1, g.pct), 4, 2); ctx.fillStyle = T.hudAccent; ctx.fill();
    ctx.fillStyle = "#7e8aa0"; ctx.font = "9px ui-monospace,monospace"; ctx.fillText(meta, bx + barW + gap, y + h / 2 + 0.5);
    if (g.anchorId) { const n = this.byId.get(g.anchorId); if (n) { ctx.fillStyle = hexA(T.hudAccent, 0.9); ctx.font = "13px " + this.lf(); ctx.textAlign = "center"; ctx.fillText("✦", this.sx(n.x, 9), this.sy(n.y, 9) - 15); ctx.textAlign = "left"; } }   // pole-star marker on the anchor node
  }
  drawCockpit(ctx) {                                       // the IDE STATUS BAR: Mission → Reasoning → Memory → Execution → Learning
    const s = this.state || {}, T = this.theme, N = this.nodes.length;
    const fresh = this.nodes.filter(n => this.isFresh(n)).length;
    const openGaps = this.nodes.filter(n => n.type === "gap" && (n.status === "open" || n.status === "building"));
    const mission = s.goal || (this.focusId ? (this.byId.get(this.focusId) || {}).title : "—");
    const stage = this.pulse ? ((this.byId.get(this.pulse.seq[this.pulse.idx]) || {}).title) : (s.status === "searching" ? "searching" : "—");
    const mem = this.active.size ? (this.active.size + " in context") : (N + " nodes · " + Math.round(100 * fresh / Math.max(1, N)) + "% fresh");
    const exec = this.presenter ? "presenting" : (this.building || ((s.status === "expanding" || s.status === "composing") ? s.status : "idle"));   // RUNTIME: what Claude is building (suppressed while presenting — could name a local file)
    const due = this._today ? this.nodes.filter(n => n.review_due && n.review_due <= this._today).length : 0;   // concepts due for active-recall review
    const queued = this._researching ? this._researching.size : 0;   // clicks awaiting Claude's research (the human→Claude half of the exchange)
    const learn = [queued ? queued + " queued" : "", due ? due + " due" : "", openGaps.length ? openGaps.length + " gaps" : ""].filter(Boolean).join(" · ") || "—";
    const conf = typeof s.confidence === "number" ? s.confidence : null;
    const x = 12, y = 12, w = 204, h = 180, lx = x + 12;
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 9); ctx.fillStyle = T.hudBg; ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = T.hudStroke; ctx.stroke();
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    const live = this._lastStateAt && (Date.now() - this._lastStateAt < 120000);   // Claude drove the Eye in the last 2 min ⇒ your clicks are being acted on
    ctx.font = "8px ui-monospace,monospace";
    ctx.fillStyle = live ? "#39d98a" : "#5b6b80"; ctx.fillText(live ? "● LIVE" : "○ idle", lx, y + 15);
    ctx.fillStyle = hexA(T.hudAccent, 0.85); ctx.fillText("· COGNITIVE IDE · " + (this._season ? this._season.name.toUpperCase() : ""), lx + 33, y + 15);
    ctx.strokeStyle = "#ffffff14"; ctx.beginPath(); ctx.moveTo(lx, y + 21); ctx.lineTo(x + w - 12, y + 21); ctx.stroke();
    const phase = (label, val, vy, color) => {
      ctx.font = "8px ui-monospace,monospace"; ctx.fillStyle = "#7e8aa0"; ctx.textAlign = "left"; ctx.fillText(label, lx, vy);
      ctx.font = "600 10px ui-monospace,monospace"; ctx.fillStyle = color || "#cdd4df"; ctx.textAlign = "right";
      ctx.fillText(this.clipFit(ctx, String(val), w - 78), x + w - 12, vy); ctx.textAlign = "left";
    };
    phase("MISSION", mission, y + 40, "#cfe0ff");
    phase("REASONING", stage, y + 62, stage === "—" ? "#5b6b80" : hexA(T.fiberHot, 1));
    phase("MEMORY", mem, y + 84);
    phase("EXECUTION", exec, y + 106, exec === "idle" ? "#5b6b80" : "#e0a458");
    phase("EXCHANGE", learn, y + 128, learn === "—" ? "#5b6b80" : "#39d98a");   // the pending human↔Claude exchange: queued to research · due to review · open gaps
    phase("CONFIDENCE", conf == null ? "—" : Math.round(conf * 100) + "%", y + 152, conf == null ? "#5b6b80" : "#39d98a");
    this.roundRect(ctx, lx, y + 157, w - 24, 3, 1.5); ctx.fillStyle = "#16294a"; ctx.fill();
    if (conf != null) { this.roundRect(ctx, lx, y + 157, (w - 24) * conf, 3, 1.5); ctx.fillStyle = "#39d98a"; ctx.fill(); }
    ctx.restore();
  }
  clip1(ctx, t, x, y, maxw) {
    let s = String(t);
    while (s.length > 4 && ctx.measureText(s).width > maxw) s = s.slice(0, -2);
    ctx.fillText(s.length < String(t).length ? s + "…" : s, x, y);
  }
  drawReasoningStrip(ctx) {                                 // reasoning as FLOW: completed (cool) · active (bright) · next (pulse)
    const pipeOn = this.pulse || (this.state && this.state.pipeline && this.state.pipeline.length);
    if (!pipeOn) return;
    const activeId = this.pulse ? this.pulse.seq[this.pulse.idx] : null;
    const aIdx = REASONING_STRIP.findIndex(([sid]) => sid === activeId);     // strip-relative position (-1 ⇒ fallback)
    const n = REASONING_STRIP.length, cw = Math.min(76, (this.W - 40) / n), tot = cw * n, T = this.theme, t = this._t;
    let x = (this.W - tot) / 2; const y = this.H - 24;
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "8px ui-monospace,monospace";
    REASONING_STRIP.forEach(([id, label], i) => {
      const mid = x + cw / 2;
      const isActive = aIdx < 0 ? (id === activeId) : (i === aIdx);
      const isDone = aIdx >= 0 && i < aIdx;
      const isNext = aIdx >= 0 && i === aIdx + 1;
      this.roundRect(ctx, x + 3, y - 8, cw - 6, 16, 8);
      if (isActive) { ctx.fillStyle = T.fiberHot; ctx.strokeStyle = T.waveDot; }
      else if (isDone) { ctx.fillStyle = hexA(T.fiberHot, 0.15); ctx.strokeStyle = "#ffffff14"; }
      else if (isNext) { const p = 0.45 + 0.3 * Math.sin(t * 0.08); ctx.fillStyle = "#0a0f17cc"; ctx.strokeStyle = hexA(T.fiberHot, p); }
      else { ctx.fillStyle = "#0a0f17cc"; ctx.strokeStyle = "#ffffff14"; }
      ctx.fill(); ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = isActive ? "#0a0c10" : isDone ? hexA(T.fiberHot, 0.6) : "#6b7689";
      ctx.fillText(isDone ? "✓ " + label : label, mid, y);
      if (i < n - 1) { ctx.fillStyle = "#5b6b80"; ctx.fillText("›", x + cw, y); }
      x += cw;
    });
    ctx.restore();
  }
  drawThemeChip(ctx) {                                      // bottom-right chips: atmosphere (cycle) + mode (Field/Eye toggle)
    const T = this.theme, h = 18, y = this.H - 28;
    ctx.font = "9px ui-monospace,monospace"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    const chip = (label, rx) => {
      const w = ctx.measureText(label).width + 16, x = rx - w;
      this.roundRect(ctx, x, y, w, h, 9); ctx.fillStyle = T.hudBg; ctx.fill();
      ctx.strokeStyle = hexA(T.hudAccent, 0.6); ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = hexA(T.hudAccent, 0.95); ctx.fillText(label, x + 8, y + h / 2 + 0.5);
      return { x, y, w, h };
    };
    this._chipRect = chip("◐ " + this.themeName, this.W - 12);                 // atmosphere
    this._modeChipRect = chip(this.viewMode === "field" ? "✦ field" : "⊙ eye", this._chipRect.x - 6);   // mode toggle
    this._zoomChipRect = (this.viewMode === "field") ? chip(this.zoomLevel === "constellation" ? "⊕ clusters" : "✸ stars", this._modeChipRect.x - 6) : null;   // cognitive-zoom toggle
    const _q = this._researching ? this._researching.size : 0;
    this._drainChipRect = _q ? chip("⟳ drain " + _q, (this._zoomChipRect || this._modeChipRect).x - 6) : null;   // one-gesture: ask Claude to research my queued clicks now
    this._chatChipRect = chip("💬 chat", (this._drainChipRect || this._zoomChipRect || this._modeChipRect).x - 6);   // toggle the chat panel
    this._presChipRect = chip(this.presenter ? "● presenting" : "◯ present", this._chatChipRect.x - 6);   // presenter mode: public-only graph (safe to record)
    if (this._drainAt && this._now - this._drainAt < 3000) {                  // transient feedback after a drain request
      const liveD = this._lastStateAt && (this._now - this._lastStateAt < 120000);
      ctx.fillStyle = hexA(T.hudAccent, 0.95); ctx.textAlign = "right";
      ctx.fillText(liveD ? "⟳ drain requested — Claude will pick it up" : "⟳ requested — runs on the next /loop or /study --drain", this.W - 12, y - 14);
      ctx.textAlign = "left";
    }
  }
  wrap(ctx, t, x, y, maxw, lh) {
    const words = String(t).split(" "); let line = "", lines = [];
    for (const w of words) { if (ctx.measureText(line + " " + w).width > maxw && line) { lines.push(line); line = w; } else line = line ? line + " " + w : w; }
    if (line) lines.push(line); if (lines.length > 3) lines = lines.slice(0, 3);
    const y0 = y - (lines.length - 1) * lh / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, y0 + i * lh));
  }
  hit(mx, my) { let best = null, bd = 14; const fold = this.viewMode === "field" && this.zoomLevel === "constellation"; for (const n of this.nodes) { if (this.alphaOf(n) < 0.5) continue; if (fold && n.cluster && n.cluster !== n.id && !this.expanded.has(n.cluster)) continue; const d = Math.hypot(n.x - mx, n.y - my); if (d < Math.max(bd, this.nodeRadius(n) + 4) && (!best || d < bd)) { best = n; bd = d; } } return best; }

  // ---- atmosphere switching + persistence ---------------------------------
  setTheme(name) { if (!THEMES[name]) name = "classic"; this.themeName = name; this.theme = THEMES[name]; this.applyCardTheme(); }
  cycleTheme() { const i = THEME_ORDER.indexOf(this.themeName), next = THEME_ORDER[(i + 1) % THEME_ORDER.length]; this.setTheme(next); if (this.plugin && this.plugin.saveTheme) this.plugin.saveTheme(next); }
  setMode(m) { this.viewMode = (m === "eye") ? "eye" : "field"; this.layout(); }
  cycleMode() { this.setMode(this.viewMode === "field" ? "eye" : "field"); if (this.plugin && this.plugin.saveMode) this.plugin.saveMode(this.viewMode); }
  cycleZoom() { this.zoomLevel = this.zoomLevel === "constellation" ? "stars" : "constellation"; this.expanded = new Set(); this.layout(); }   // cognitive-zoom: fold/unfold all dot-clusters
  requestDrain() {                                         // one-gesture "process my clicks now": write a sentinel a running /loop or the cron services
    const count = this._researching ? this._researching.size : 0;
    const rec = JSON.stringify({ requestedAt: Date.now(), count }) + "\n";
    const path = (this.base || "") + "09_working/drain-request.json";
    try { const a = this.app.vault.adapter; a.write(path, rec).catch(() => {}); } catch (e) {}
    this._drainAt = Date.now();
  }
  applyCardTheme() { const el = this.contentEl; if (!el || !el.style) return; const ac = this.theme.hudAccent; el.style.setProperty("--we-accent", ac); el.style.setProperty("--we-border", ac + "aa"); el.style.setProperty("--we-actions-border", ac + "55"); }

  // ---- Obsidian view lifecycle -------------------------------------------
  async onOpen() {
    const root = this.contentEl; root.empty(); root.addClass("wiki-eye-root");
    this.canvas = root.createEl("canvas", { cls: "wiki-eye-canvas" });
    this.ctx = this.canvas.getContext("2d"); this.makeGlow();                 // pre-render the bloom sprite (perf)
    this._today = new Date().toISOString().slice(0, 10);                      // for review-due highlighting (real Obsidian only; verify.js skips onOpen)
    this.tip = root.createDiv({ cls: "wiki-eye-tip" }); this.tip.style.display = "none";
    this.setTheme((this.plugin && this.plugin.settings && this.plugin.settings.theme) || "classic");
    if (this.plugin && this.plugin.settings && this.plugin.settings.mode) this.viewMode = this.plugin.settings.mode;   // persisted view mode

    const data = await this.readJson(GRAPH_PATHS);
    if (!data || !data.data) { root.createDiv({ text: "Cognitive Lens: couldn't read graph-export.json — run /graph first." }); return; }
    this.buildGraph(data.data, data.base);
    const man = await this.readJson(MANIFEST_PATHS); if (man && man.data) this.manifest = man.data;   // data-agnostic taxonomy seam
    this.resize(); this.layout();
    const st = await this.readJson(STATE_PATHS); if (st && st.data) this.applyState(st.data);
    const ns0 = await this.readJson(NORTHSTAR_PATHS); if (ns0 && ns0.data) { this.northStar = ns0.data; this._nsAt = ns0.data.setAt; }

    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(root);
    this.registerEvent(this.app.vault.on("modify", f => this.maybeReload(f)));
    this.registerEvent(this.app.vault.on("create", f => this.maybeReload(f)));
    this.statePoll = window.setInterval(() => this.pollState(), 1100);   // fallback for terminal writes
    this.canvas.addEventListener("wheel", ev => {                              // scroll-zoom the Cognition Field (cursor-anchored); Eye view keeps native scroll
      if (this.viewMode !== "field" || this.camcx == null) return;
      ev.preventDefault();
      const r = this.canvas.getBoundingClientRect(), mx = ev.clientX - r.left, my = ev.clientY - r.top;
      const S = (this.breath * this.zoom * this.userZoom) || 1;
      const wx = this.camcx + (mx - this.cx) / S, wy = this.camcy + (my - this.cy) / S;   // world point under the cursor
      this.userZoom = Math.min(6, Math.max(0.45, this.userZoom * Math.exp(-ev.deltaY * 0.0016)));
      if (Math.abs(this.userZoom - 1) < 0.03) this.userZoom = 1;               // snap near 1 → the living auto-camera resumes
      const S2 = (this.breath * this.zoom * this.userZoom) || 1;
      this.camcx = wx - (mx - this.cx) / S2; this.camcy = wy - (my - this.cy) / S2;       // keep that point pinned under the cursor
    }, { passive: false });
    this.canvas.addEventListener("mousemove", ev => this.onMove(ev));
    this.canvas.addEventListener("mouseleave", () => { this.hoverId = null; this._hoverNode = null; this._parTarget = { x: 0, y: 0 }; this.tip.style.display = "none"; });
    this.canvas.addEventListener("click", ev => {
      const r = this.canvas.getBoundingClientRect(), mx = ev.clientX - r.left, my = ev.clientY - r.top;
      const c = this._chipRect, mc = this._modeChipRect;
      if (mc && mx >= mc.x && mx <= mc.x + mc.w && my >= mc.y && my <= mc.y + mc.h) { this.cycleMode(); return; }   // chip toggles Field/Eye
      if (c && mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) { this.cycleTheme(); return; }          // chip cycles atmosphere
      const zc = this._zoomChipRect;
      if (zc && mx >= zc.x && mx <= zc.x + zc.w && my >= zc.y && my <= zc.y + zc.h) { this.cycleZoom(); return; }     // chip toggles stars/constellation
      const dch = this._drainChipRect;
      if (dch && mx >= dch.x && mx <= dch.x + dch.w && my >= dch.y && my <= dch.y + dch.h) { this.requestDrain(); return; }   // ⟳ drain chip → request research now
      const cch = this._chatChipRect; if (cch && mx >= cch.x && mx <= cch.x + cch.w && my >= cch.y && my <= cch.y + cch.h) { this.toggleChat(); return; }   // 💬 chat chip → toggle panel
      const pch = this._presChipRect; if (pch && mx >= pch.x && mx <= pch.x + pch.w && my >= pch.y && my <= pch.y + pch.h) { this.togglePresenter(); return; }   // ◯ present chip → public-only safe view
      if (this.viewMode === "field" && this.zoomLevel === "constellation") {                                          // cognitive-zoom: click a cloud to unfold/refold its dots
        for (const ch of (this._cloudHits || [])) { if (Math.hypot(ch.x - mx, ch.y - my) < ch.r) { this.expanded.has(ch.key) ? this.expanded.delete(ch.key) : this.expanded.add(ch.key); this.layout(); return; } }
      }
      const n = this.hit(mx, my); if (n) this.primeOn(n); else { this.active = new Set(); this.setFocus(null); this.hideCard(); }
    });
    this.canvas.addEventListener("dblclick", ev => { const n = this.pick(ev); if (n) this.openNote(n); else if (this.viewMode === "field") this.userZoom = 1; });   // dbl-click empty space → reset scroll-zoom
    const loop = () => { this.draw(this.ctx); this.raf = requestAnimationFrame(loop); };
    loop();
  }
  async onClose() { if (this.raf) cancelAnimationFrame(this.raf); if (this.ro) this.ro.disconnect(); if (this.statePoll) window.clearInterval(this.statePoll); }
  async readJson(paths) {
    for (const p of paths) { try { const txt = await this.app.vault.adapter.read(p); return { data: JSON.parse(txt), base: p.replace(/(07_visualizer|09_working)\/[^/]+$/, "") }; } catch (e) {} }
    return null;
  }
  async maybeReload(file) {
    const p = file && file.path ? file.path : "";
    if (/09_working\/eye-state\.json$/.test(p)) { const st = await this.readJson(STATE_PATHS); if (st && st.data) this.applyState(st.data); }
    else if (/09_working\/north-star\.json$/.test(p)) { const ns = await this.readJson(NORTHSTAR_PATHS); this.northStar = ns && ns.data ? ns.data : null; }   // re-read the goal when /goal rewrites it
    else if (/09_working\/chat-outbox\.jsonl?$/.test(p)) { this.pollChat(); }   // a new chat reply arrived → render it
    else if (/07_visualizer\/graph-(local|public|export)\.json$/.test(p)) { await this.loadGraphData(); if (this.cardNode && this.byId.get(this.cardNode.id)) this.showCard(this.byId.get(this.cardNode.id)); }   // bloom when the graph regenerates (presenter-aware source)
  }
  async pollState() {
    this.pollChat();                                                          // also surface new chat replies (terminal writes don't always fire vault events)
    try {
      const txt = await this.app.vault.adapter.read(STATE_PATHS[0]).catch(() => this.app.vault.adapter.read(STATE_PATHS[1]));
      const s = JSON.parse(txt); if (s.ts !== this._stateTs) { this._stateTs = s.ts; this.applyState(s); }
    } catch (e) {}
    try {                                                                     // north-star fallback poll (terminal writes don't always fire vault events)
      const nt = await this.app.vault.adapter.read(NORTHSTAR_PATHS[0]).catch(() => this.app.vault.adapter.read(NORTHSTAR_PATHS[1]));
      const ns = JSON.parse(nt); if (ns.setAt !== this._nsAt) { this._nsAt = ns.setAt; this.northStar = ns; }
    } catch (e) {}
  }
  resize() {
    const root = this.contentEl, dpr = Math.min(window.devicePixelRatio || 1, 1.5);   // PERF: cap backing-store dpr (huge fill-rate win on a particle field)
    this.W = root.clientWidth || 800; this.H = root.clientHeight || 600;
    this.canvas.width = this.W * dpr; this.canvas.height = this.H * dpr;
    this.canvas.style.width = this.W + "px"; this.canvas.style.height = this.H + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.layout();
  }
  pick(ev) { const r = this.canvas.getBoundingClientRect(); return this.hit(ev.clientX - r.left, ev.clientY - r.top); }
  onMove(ev) {
    const r = this.canvas.getBoundingClientRect(), mx = ev.clientX - r.left, my = ev.clientY - r.top;
    this._parTarget = { x: Math.max(-1, Math.min(1, (mx - this.W / 2) / (this.W / 2))) * 6, y: Math.max(-1, Math.min(1, (my - this.H / 2) / (this.H / 2))) * 6 };   // target only — draw() eases the actual parallax
    if ((this._moveTick = (this._moveTick || 0) + 1) % 2) { } else { const n = this.hit(mx, my); this.hoverId = n ? n.id : null; this.canvas.style.cursor = n ? "pointer" : "default"; this._hoverNode = n; }   // hover hit-test every other move (cheaper on 1k nodes)
    const n = this._hoverNode;
    if (n) { this.tip.style.display = ""; this.tip.style.left = (mx + 12) + "px"; this.tip.style.top = (my + 12) + "px"; this.tip.setText(n.title + "  ·  " + n.type + (this.isHollow(n) ? " · " + (n.status || "gap") : "")); }
    else this.tip.style.display = "none";
  }
  // ---- detail card — exposes OUR semantics (capabilities/pipelines/decisions/gaps/…), not a generic explorer ----
  primeOn(n) {                                            // stateful click = visual prime + a LEARNING INTENT (expand my knowledge on this)
    this.setFocus(n.id);
    this.active = new Set([n.id, ...(this.adj.get(n.id) || [])]);
    this.layout();
    this.queueLearning(n);                                 // Eye → Claude reverse channel
    if (this._today && n.review_due && n.review_due <= this._today) this.queueReview(n);   // review-loop: a due node click also enqueues a /review
    this.showCard(n);
  }
  queueReview(n) {                                         // append a review-intent (/review --drain reads this); debounced 20s per node
    this._reviewed = this._reviewed || {};
    const now = Date.now(); if (this._reviewed[n.id] && now - this._reviewed[n.id] < 20000) return;
    this._reviewed[n.id] = now;
    const rec = JSON.stringify({ nodeId: n.id, title: n.title, type: n.type, clickedAt: now }) + "\n";
    const path = (this.base || "") + "09_working/review-queue.jsonl";
    try { const a = this.app.vault.adapter; (a.append ? a.append(path, rec) : Promise.reject()).catch(() => a.write(path, rec).catch(() => {})); } catch (e) {}
  }
  queueLearning(n) {                                       // append a click-intent the steward loop drains (debounced 20s per node)
    this._learned = this._learned || {}; this._researching = this._researching || new Set();
    const now = Date.now(); if (this._learned[n.id] && now - this._learned[n.id] < 20000) return;
    this._learned[n.id] = now; this._researching.add(n.id);
    const rec = JSON.stringify({ nodeId: n.id, title: n.title, type: n.type, mode: n.mode, clickedAt: now, depth: "both" }) + "\n";
    const path = (this.base || "") + "09_working/learning-intent-queue.jsonl";
    try { const a = this.app.vault.adapter; (a.append ? a.append(path, rec) : Promise.reject()).catch(() => a.write(path, rec).catch(() => {})); } catch (e) {}
  }
  showCard(n) {
    this.cardNode = n;
    let card = this.cardEl;
    if (!card) card = this.cardEl = this.contentEl.createDiv({ cls: "we-card" });
    card.style.display = ""; card.empty();
    const cat = this.catByKey[this.categoryOf(n)] || { color: "#9aa4b2" }, s = this.state || {};
    const accent = this.catColor(n);
    const head = card.createDiv({ cls: "we-card-head" });
    head.createSpan({ cls: "we-badge", text: (this.categoryOf(n) + " · " + n.type).toUpperCase() }).style.color = accent;
    head.createSpan({ cls: "we-x", text: "✕" }).onclick = () => this.hideCard();
    card.createDiv({ cls: "we-title", text: n.title }).style.color = accent;
    const outN = (this.out.get(n.id) || []).length, inN = (this.inc.get(n.id) || []).length;
    let meta = `↗ ${outN} out   △ ${inN} in   ·   ${n.status || "active"}`;
    if (n.id === this.focusId && typeof s.confidence === "number") meta += `   ·   conf ${s.confidence.toFixed(2)}`;
    card.createDiv({ cls: "we-meta", text: meta });
    if (this._researching && this._researching.has(n.id)) {                  // honest about whether Claude is actually listening
      const live = this._lastStateAt && (Date.now() - this._lastStateAt < 120000);
      card.createDiv({ cls: "we-reason", text: live ? "● researching now — fresh links + questions will bloom here" : "◌ queued for research — runs when Claude is live (start a /loop or run /study --drain)" });
    }
    card.createDiv({ cls: "we-desc", text: n.excerpt || "(" + n.type + " · " + n.mode + ")" });
    card.createDiv({ cls: "we-id", text: "@" + n.id + (n.updated ? "   ·   updated " + n.updated : "") });
    // reasoning line — distinguish primed (working context) vs an active pipeline stage (current eye-state only)
    if (this.pulse && (this.pulse.seq || []).includes(n.id))
      card.createDiv({ cls: "we-reason", text: "▸ reasoning: pipeline stage" + (s.goal ? " · " + s.goal : "") });
    else if (this.active.has(n.id))
      card.createDiv({ cls: "we-reason", text: "● in working context" + (s.goal ? ": " + s.goal : "") });
    const nb = [...new Set([...(this.out.get(n.id) || []), ...(this.inc.get(n.id) || [])])];
    const typeOf = id => (this.byId.get(id) || {}).type;
    let any = false;
    for (const [label, types] of CARD_BUCKETS) {           // OUR structure: grouped by what each link IS
      const ids = nb.filter(id => types.includes(typeOf(id)));
      if (!ids.length) continue;
      any = true;
      const sec = card.createDiv({ cls: "we-sec" });
      sec.createDiv({ cls: "we-sec-h", text: label.toUpperCase() + "  " + ids.length });
      const rel = sec.createDiv({ cls: "we-rel" });
      ids.sort((a, b) => this.byId.get(a).title.localeCompare(this.byId.get(b).title)).slice(0, 16).forEach(id => {
        const m = this.byId.get(id), p = rel.createSpan({ cls: "we-pill", text: m.title });
        p.style.borderLeftColor = this.catColor(m);
        if (m.type === "gap" && (m.status === "open" || m.status === "building")) p.createSpan({ text: " ·open", cls: "we-muted" });
        p.onclick = () => this.primeOn(m);                 // click a relationship → prime there (workspace shifts)
      });
    }
    if (!any) card.createDiv({ cls: "we-muted", text: "no links yet" });
    const act = card.createDiv({ cls: "we-actions" });
    act.createEl("button", { text: "⌖ Prime here" }).onclick = () => this.primeOn(n);
    act.createEl("button", { text: "↗ Open note" }).onclick = () => this.openNote(n);
  }
  hideCard() { if (this.cardEl) this.cardEl.style.display = "none"; this.cardNode = null; }
  openNote(n) {
    const file = this.app.vault.getAbstractFileByPath((this.base || "") + n.path);
    if (file) this.app.workspace.getLeaf(false).openFile(file);
    else this.app.workspace.openLinkText(n.id, "", false);
  }
  // ---- chat panel (Phase 4 — talk to the running Claude session via 09_working/chat-*.jsonl) ----
  async loadGraphData() {                                                      // (re)load the graph from the right source — local (full) or public (presenter)
    const d = await this.readJson(this.presenter ? PUBLIC_GRAPH_PATHS : GRAPH_PATHS);
    if (d && d.data) { this._researching = new Set(); this.buildGraph(d.data, d.base); this.layout(); }
  }
  togglePresenter() {                                                          // PRESENTER MODE — render only the public_system subset (safe to record/screen-share)
    this.presenter = !this.presenter;
    if (this.presenter && this._chatOpen) this.toggleChat(false);             // hide the chat (its history is LOCAL — could name the edge) while presenting
    this.userZoom = 1;                                                        // reset scroll-zoom for a clean recording
    this.loadGraphData();
  }
  async newChat() {                                                            // start a fresh chat history (archive the current thread, then clear it)
    const a = this.app.vault.adapter, b = this.base || "", ts = Date.now();
    for (const f of ["chat-inbox.jsonl", "chat-outbox.jsonl"]) {
      const cur = await this.readText("09_working/" + f);
      try { if (cur && cur.trim()) await a.write(b + "09_working/chat-archive-" + ts + "-" + f, cur); await a.write(b + "09_working/" + f, ""); } catch (e) {}
    }
    try { await a.write(b + "09_working/chat-processed.txt", ""); } catch (e) {}   // reset processed ids for the new session
    if (this.chatThread) this.chatThread.empty();
    this._chatSeen = 0;
    this.addChatBubble("assistant", "✨ New chat — previous thread archived. Ask, research, or build.");
  }
  buildChat() {
    if (this.chatEl) return;
    const c = this.chatEl = this.contentEl.createDiv({ cls: "we-chat" }); c.style.display = "none"; this._chatOpen = false;
    const head = c.createDiv({ cls: "we-chat-head" });
    head.createSpan({ text: "💬 Chat — ask, research, build" });
    head.createSpan({ cls: "we-chat-new", text: "✎ new" }).onclick = () => this.newChat();   // start a fresh chat history (archives the current)
    head.createSpan({ cls: "we-x", text: "✕" }).onclick = () => this.toggleChat(false);
    this.chatThread = c.createDiv({ cls: "we-chat-thread" });
    const row = c.createDiv({ cls: "we-chat-input" });
    const ta = this.chatInput = row.createEl("textarea");
    ta.setAttr("placeholder", "Ask, research, or build… (Enter to send · Shift+Enter = newline)");
    row.createEl("button", { text: "↑" }).onclick = () => this.sendChat();
    ta.addEventListener("keydown", ev => { if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); this.sendChat(); } });
    this._chatSeen = 0; this.renderChatHistory();
  }
  toggleChat(show) {
    this.buildChat();
    this._chatOpen = (show == null) ? !this._chatOpen : !!show;
    this.chatEl.style.display = this._chatOpen ? "" : "none";
    if (this._chatOpen) { this.pollChat(); if (this.chatInput) this.chatInput.focus(); }
  }
  async sendChat() {
    const ta = this.chatInput; if (!ta) return;
    const text = (ta.value || "").trim(); if (!text) return; ta.value = "";
    this.addChatBubble("user", text); this.addChatPending();
    const id = "u" + Date.now() + "_" + Math.floor(Math.random() * 1e4);
    const rec = JSON.stringify({ id, role: "user", text, ts: Date.now() }) + "\n";
    const path = (this.base || "") + "09_working/chat-inbox.jsonl";
    try { const a = this.app.vault.adapter; (a.append ? a.append(path, rec) : Promise.reject()).catch(() => a.write(path, rec).catch(() => {})); } catch (e) {}
  }
  addChatBubble(role, text) {
    const m = this.chatThread.createDiv({ cls: "we-chat-msg " + (role === "user" ? "we-chat-user" : "we-chat-asst") });
    m.setText(text || "");
    const cp = m.createSpan({ cls: "we-chat-copy", text: "⧉" });   // copy the whole message
    cp.onclick = e => { e.stopPropagation(); try { navigator.clipboard.writeText(text || ""); cp.setText("✓"); setTimeout(() => cp.setText("⧉"), 900); } catch (err) {} };
    this.chatThread.scrollTop = this.chatThread.scrollHeight; return m;
  }
  addChatPending() { this.removeChatPending(); this._chatPending = this.chatThread.createDiv({ cls: "we-chat-pending", text: "● working… (needs a chat-loop running)" }); this.chatThread.scrollTop = this.chatThread.scrollHeight; }
  removeChatPending() { if (this._chatPending) { this._chatPending.remove(); this._chatPending = null; } }
  async readText(rel) { try { return await this.app.vault.adapter.read((this.base || "") + rel); } catch (e) { return null; } }
  openPath(p) { const f = this.app.vault.getAbstractFileByPath((this.base || "") + p); if (f) this.app.workspace.getLeaf(false).openFile(f); else this.app.workspace.openLinkText(String(p), "", false); }
  async renderChatHistory() {
    const inb = await this.readText("09_working/chat-inbox.jsonl"), out = await this.readText("09_working/chat-outbox.jsonl");
    const msgs = [];
    for (const txt of [inb, out]) if (txt) for (const ln of txt.trim().split("\n")) { try { msgs.push(JSON.parse(ln)); } catch (e) {} }
    msgs.sort((a, b) => (a.ts || 0) - (b.ts || 0));
    for (const m of msgs) (m.role === "assistant") ? this.renderAssistant(m) : this.addChatBubble("user", m.text);
    this._chatSeen = out ? out.trim().split("\n").filter(Boolean).length : 0;
  }
  async pollChat() {
    if (!this.chatThread || !this._chatOpen) return;
    const out = await this.readText("09_working/chat-outbox.jsonl"); if (!out) return;
    const lines = out.trim().split("\n").filter(Boolean);
    for (let i = this._chatSeen || 0; i < lines.length; i++) { let m; try { m = JSON.parse(lines[i]); } catch (e) { continue; } if (m.role === "assistant") { this.removeChatPending(); this.renderAssistant(m); } }
    this._chatSeen = lines.length;
  }
  renderAssistant(m) {
    const el = this.addChatBubble("assistant", m.text || "");
    if (Array.isArray(m.refs) && m.refs.length) { const r = el.createDiv({ cls: "we-chat-refs" }); for (const id of m.refs) if (this.byId.has(id)) { const ch = r.createSpan({ cls: "we-chat-ref", text: "◈ " + (this.byId.get(id).title || id) }); ch.onclick = () => { this.primeOn(this.byId.get(id)); }; } }
    if (Array.isArray(m.artifacts) && m.artifacts.length) { const r = el.createDiv({ cls: "we-chat-refs" }); for (const p of m.artifacts) { const ch = r.createSpan({ cls: "we-chat-ref", text: "📄 " + String(p).split("/").pop() }); ch.onclick = () => this.openPath(p); } }
  }
}

class WikiEyePlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({ theme: "classic", mode: "field" }, await this.loadData());
    this.registerView(VIEW_TYPE_EYE, leaf => new CognitiveLensView(leaf, this));
    this.addRibbonIcon("eye", "Open Cognitive Lens", () => this.activate());
    this.addRibbonIcon("palette", "Cognitive Lens: cycle atmosphere", () => this.cycleActive());
    this.addCommand({ id: "open-cognitive-lens", name: "Open Cognitive Lens", callback: () => this.activate() });
    this.addCommand({ id: "cycle-lens-theme", name: "Cognitive Lens: cycle atmosphere", callback: () => this.cycleActive() });
    this.addCommand({ id: "cycle-lens-mode", name: "Cognitive Lens: toggle Field / Eye", callback: () => this.cycleModeActive() });
    this.addRibbonIcon("message-circle", "Cognitive Lens: chat with Claude", () => this.chatActive());
    this.addCommand({ id: "toggle-lens-chat", name: "Cognitive Lens: toggle chat", callback: () => this.chatActive() });
    this.addCommand({ id: "toggle-lens-presenter", name: "Cognitive Lens: presenter mode (public-only, safe to record)", callback: () => this.presenterActive() });
  }
  cycleActive() { const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_EYE)[0]; if (leaf && leaf.view && leaf.view.cycleTheme) leaf.view.cycleTheme(); }
  cycleModeActive() { const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_EYE)[0]; if (leaf && leaf.view && leaf.view.cycleMode) leaf.view.cycleMode(); }
  chatActive() { const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_EYE)[0]; if (leaf && leaf.view && leaf.view.toggleChat) { this.activate(); leaf.view.toggleChat(); } else this.activate(); }
  presenterActive() { const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_EYE)[0]; if (leaf && leaf.view && leaf.view.togglePresenter) { this.activate(); leaf.view.togglePresenter(); } else this.activate(); }
  async saveTheme(name) { this.settings.theme = name; await this.saveData(this.settings); }
  async saveMode(m) { this.settings.mode = m; await this.saveData(this.settings); }
  async activate() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_EYE)[0];
    if (!leaf) { leaf = workspace.getLeaf(true); await leaf.setViewState({ type: VIEW_TYPE_EYE, active: true }); }
    workspace.revealLeaf(leaf);
  }
  async onunload() { this.app.workspace.detachLeavesOfType(VIEW_TYPE_EYE); }
}

module.exports = WikiEyePlugin;
module.exports.__EyeView = CognitiveLensView;   // headless-test hook (name kept for verify.js/smoke)
module.exports.__VIEW_TYPE = VIEW_TYPE_EYE;
