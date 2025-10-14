// public/scripts/pattern.js
// Generate + render pattern text, require a name, then POST to /api/patterns

// --- Palette mapping (your codes) ---
const HEX_TO_CODE = {
  "#ffffff": "W", // white
  "#000000": "K", // black
  "#ef4444": "R", // red
  "#22c55e": "G", // green
  "#3b82f6": "B", // blue
  "#f59e0b": "Y", // yellow
  "#8b5cf6": "P", // purple
};

// --- Color helpers ---
function rgbToHex(rgb) {
  if (!rgb) return null;
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return null;
  const [r, g, b] = m.map(Number);
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function normalizeHex(hexOrRgb) {
  if (!hexOrRgb) return null;
  const s = hexOrRgb.trim().toLowerCase();
  if (s.startsWith("#") && s.length === 7) return s;
  if (s.startsWith("rgb")) return rgbToHex(s);
  return null;
}
function codeFromColor(colorStr) {
  const hex = normalizeHex(colorStr) || "#ffffff";
  return HEX_TO_CODE[hex] || "W";
}

// --- Grid reading ---
function getColCount(gridEl) {
  // Prefer data-cols set by grid.js
  const ds = Number(gridEl.dataset?.cols);
  if (Number.isInteger(ds) && ds > 0) return ds;

  // Fallback: CSS grid template
  const styleCols = getComputedStyle(gridEl)
    .gridTemplateColumns.trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (styleCols > 0) return styleCols;

  // Last resort: input field
  const colsEl = document.getElementById("cols");
  return parseInt(colsEl?.value, 10) || 10;
}

function exportCodeGridFromDOM() {
  const gridEl = document.getElementById("grid");
  if (!gridEl) {
    console.error("Grid element #grid not found.");
    return [];
  }
  const cols = getColCount(gridEl);
  const cellEls = Array.from(gridEl.querySelectorAll(".cell"));
  if (cellEls.length === 0) return [];

  const rows = [];
  for (let i = 0; i < cellEls.length; i += cols) {
    const rowCells = cellEls.slice(i, i + cols);
    const rowCodes = rowCells.map((cell) => {
      const dataColor = cell.dataset?.color;
      const styleColor = getComputedStyle(cell).backgroundColor;
      return codeFromColor(dataColor || styleColor);
    });
    rows.push(rowCodes);
  }
  return rows;
}

// --- RLE + text building (your format) ---
function rleRow(codes) {
  if (codes.length === 0) return "";
  const out = [];
  let curr = codes[0],
    count = 1;
  for (let i = 1; i < codes.length; i++) {
    if (codes[i] === curr) count++;
    else {
      out.push(`${count}${curr}`);
      curr = codes[i];
      count = 1;
    }
  }
  out.push(`${count}${curr}`);
  return out.join(" ");
}
function buildPatternText(codeGrid) {
  return codeGrid.map((row, i) => `Row ${i + 1}: ${rleRow(row)}`).join("\n");
}

// --- UI state ---
let lastPatternText = ""; // what we rendered (and will POST)

function setSaveEnabled(enabled) {
  const saveBtn = document.getElementById("savePattern");
  if (saveBtn) saveBtn.disabled = !enabled;
}

// --- Render preview (Jameson’s behavior) ---
function renderPattern() {
  const outEl = document.getElementById("pattern-output");
  const codeGrid = exportCodeGridFromDOM();

  if (!outEl) {
    console.warn("Missing #pattern-output container.");
    return;
  }
  if (!codeGrid.length) {
    outEl.textContent =
      "No grid found. Click 'Generate Grid' and color some cells first.";
    lastPatternText = "";
    setSaveEnabled(false);
    return;
  }

  const patternText = buildPatternText(codeGrid);
  lastPatternText = patternText;

  outEl.textContent = patternText;
  outEl.setAttribute("aria-live", "polite");
  outEl.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Dev logs
  console.log("=== Crochet Pattern (2D Codes) ===");
  console.log(codeGrid);
  console.log("=== Crochet Pattern (RLE by Row) ===");
  console.log(patternText);

  // Enable save only if name is present
  const name = (document.getElementById("patternName")?.value || "").trim();
  setSaveEnabled(Boolean(name));
}

// --- POST helper ---
async function savePatternToDB(name, instructions) {
  const res = await fetch("/api/patterns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, instructions }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data.id;
}

// --- Save click (requires label/name + rendered pattern) ---
async function handleSaveClick() {
  const nameInput = document.getElementById("patternName");
  const name = (nameInput?.value || "").trim();

  if (!lastPatternText) {
    // No preview yet—generate it first
    renderPattern();
    if (!lastPatternText) return; // still nothing, bail
  }
  if (!name) {
    alert("Please enter a pattern name before saving.");
    nameInput?.focus();
    return;
  }

  try {
    const id = await savePatternToDB(name, lastPatternText);
    alert(`Saved! Pattern ID: ${id}`);
  } catch (err) {
    console.error("Save failed:", err);
    alert(`Save failed: ${err.message}`);
  }
}

// --- Wire up ---
document.addEventListener("DOMContentLoaded", () => {
  const patternBtn = document.getElementById("pattern");
  const saveBtn = document.getElementById("savePattern");
  const nameInput = document.getElementById("patternName");

  if (patternBtn) patternBtn.addEventListener("click", renderPattern);
  if (saveBtn) saveBtn.addEventListener("click", handleSaveClick);

  // Live-enable Save only when both name + preview exist
  nameInput?.addEventListener("input", () => {
    const hasName = Boolean(nameInput.value.trim());
    setSaveEnabled(hasName && Boolean(lastPatternText));
  });

  // Start disabled
  setSaveEnabled(false);
});
