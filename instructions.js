// public/scripts/instructions.js

// --- DOM refs ---
const gridEl = document.getElementById('grid');
const nameInput = document.getElementById('patternName');
const saveBtn = document.getElementById('savePattern');

// --- utils ---
function rgbToHex(rgb) {
  const m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
  if (!m) return rgb; // already hex or unknown format
  const h = n => Number(n).toString(16).padStart(2, '0');
  return `#${h(m[1])}${h(m[2])}${h(m[3])}`;
}

function ensureGridSizeDataAttrs() {
  // Prefer what grid.js sets; if missing, derive from CSS grid columns
  if (!gridEl.dataset.rows || !gridEl.dataset.cols) {
    const total = gridEl.children.length;
    const cols = getComputedStyle(gridEl).gridTemplateColumns.split(' ').length || Math.sqrt(total) | 0;
    const rows = cols ? Math.ceil(total / cols) : 0;
    gridEl.dataset.rows = String(rows);
    gridEl.dataset.cols = String(cols);
  }
}

function readGrid() {
  ensureGridSizeDataAttrs();
  const rows = Number(gridEl.dataset.rows);
  const cols = Number(gridEl.dataset.cols);
  const out = [];

  const cells = Array.from(gridEl.children);
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const cell = cells[r * cols + c];
      // Prefer stored color from grid.js; fallback to computed style
      const hex = (cell.dataset.color || rgbToHex(getComputedStyle(cell).backgroundColor)).toLowerCase();
      row.push(hex);
    }
    out.push(row);
  }
  return { rows, cols, grid: out };
}

// --- crochet instruction generator (flat piece, one pixel = 1 single crochet) ---
const COLOR_ABBR = {
  white: 'WH', black: 'BK', red: 'RD', green: 'GR',
  blue: 'BL', yellow: 'YL', purple: 'PU'
};

function hexToIdMap() {
  // Uses PALETTE defined in grid.js; fallback if not found
  const m = {};
  if (typeof PALETTE !== 'undefined' && Array.isArray(PALETTE)) {
    for (const c of PALETTE) m[c.hex.toLowerCase()] = c.id;
  }
  return m;
}

function abbrFor(idOrHex, hex2id) {
  const id = (idOrHex?.startsWith('#')) ? (hex2id[idOrHex] || idOrHex) : idOrHex;
  return COLOR_ABBR[id] || (typeof id === 'string' ? id.slice(0, 2).toUpperCase() : '??');
}

function rle(arr) {
  const res = [];
  let prev = arr[0], count = 1;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === prev) count++;
    else { res.push([count, prev]); prev = arr[i]; count = 1; }
  }
  if (arr.length) res.push([count, prev]);
  return res;
}

function gridToCrochetInstructions(grid) {
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const hex2id = hexToIdMap();

  const lines = [];
  lines.push(`Pattern: ${rows} rows × ${cols} sts (single crochet, one stitch per pixel)`);
  lines.push(`Read flat, bottom to top. Row 1 (RS) goes right→left across chart; Row 2 (WS) left→right; alternate.`);
  lines.push('');

  for (let srcR = rows - 1, printed = 1; srcR >= 0; srcR--, printed++) {
    const isRS = (printed % 2 === 1);
    const row = grid[srcR];
    const reading = isRS ? row.slice().reverse() : row;

    const segs = rle(reading)
      .map(([n, color]) => `sc ${n} ${abbrFor(color, hex2id)}`)
      .join(', ');

    const arrow = isRS ? 'RS →' : 'WS ←';
    lines.push(`Row ${printed} (${arrow}): ${segs}`);
    if (printed < rows) lines.push('ch 1, turn;');
  }
  return lines.join('\n');
}

// --- save handler ---
saveBtn?.addEventListener('click', async () => {
  try {
    const { grid } = readGrid();
    const instructions = gridToCrochetInstructions(grid);
    const name = (nameInput?.value?.trim()) || 'Untitled';

    const res = await fetch('/api/patterns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, instructions })
    });
    const data = await res.json();
    if (!res.ok) return alert(`Save failed: ${data.error || res.statusText}`);

    alert(`Saved! Pattern ID: ${data.id}`);
  } catch (e) {
    console.error(e);
    alert('Unexpected error while saving.');
  }
});
