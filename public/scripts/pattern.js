const HEX_TO_CODE = {
  "#ffffff": "W", // white
  "#000000": "K", // black
  "#ef4444": "R", // red
  "#22c55e": "G", // green
  "#3b82f6": "B", // blue
  "#f59e0b": "Y", // yellow
  "#8b5cf6": "P", // purple
};

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

function exportCodeGridFromDOM() {
  const gridEl = document.getElementById("grid");
  const colsEl = document.getElementById("cols");
  if (!gridEl) {
    console.error("Grid element #grid not found.");
    return [];
  }
  const cols = parseInt(colsEl?.value, 10) || 10;

  const cellEls = Array.from(gridEl.querySelectorAll(".cell"));
  if (cellEls.length === 0) return [];

  const rows = [];
  for (let i = 0; i < cellEls.length; i += cols) {
    const rowCells = cellEls.slice(i, i + cols);
    const rowCodes = rowCells.map((cell) => {
      
      const dataColor = cell.dataset?.color;
      const styleColor = getComputedStyle(cell).backgroundColor;
      const chosen = dataColor || styleColor;
      return codeFromColor(chosen);
    });
    rows.push(rowCodes);
  }
  return rows;
}

function rleRow(codes) {
  if (codes.length === 0) return "";
  let out = [];
  let curr = codes[0], count = 1;
  for (let i = 1; i < codes.length; i++) {
    if (codes[i] === curr) count++;
    else { out.push(`${count}${curr}`); curr = codes[i]; count = 1; }
  }
  out.push(`${count}${curr}`);
  return out.join(" ");
}

function buildPatternText(codeGrid) {
  return codeGrid.map((row, i) => `Row ${i + 1}: ${rleRow(row)}`).join("\n");
}

function renderPattern() {
  const outEl = document.getElementById("pattern-output");
  const codeGrid = exportCodeGridFromDOM();

  if (!outEl) {
    console.warn("Missing #pattern-output container.");
    return;
  }

  if (!codeGrid.length) {
    outEl.textContent = "No grid found. Click 'Generate Grid' and color some cells first.";
    return;
  }

  const patternText = buildPatternText(codeGrid);

  // Show on page
  outEl.textContent = patternText;

  // Optional niceties
  outEl.setAttribute("aria-live", "polite");
  outEl.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Still log for devs
  console.log("=== Crochet Pattern (2D Codes) ===");
  console.log(codeGrid);
  console.log("=== Crochet Pattern (RLE by Row) ===");
  console.log(patternText);
}

document.addEventListener("DOMContentLoaded", () => {
  const patternBtn = document.getElementById("pattern");
  if (patternBtn) patternBtn.addEventListener("click", renderPattern);
});
