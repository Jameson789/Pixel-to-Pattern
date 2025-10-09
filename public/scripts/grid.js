// public/scripts/grid.js

const PALETTE = [
  { id: "white", hex: "#ffffff" },
  { id: "black", hex: "#000000" },
  { id: "red", hex: "#ef4444" },
  { id: "green", hex: "#22c55e" },
  { id: "blue", hex: "#3b82f6" },
  { id: "yellow", hex: "#f59e0b" },
  { id: "purple", hex: "#8b5cf6" },
];

let activeColor = PALETTE[1]; // default: black

const paletteEl = document.getElementById("palette");
const gridEl = document.getElementById("grid");
const rowsInput = document.getElementById("rows");
const colsInput = document.getElementById("cols");
const generateBtn = document.getElementById("generate");

// --- Palette ---
PALETTE.forEach((color, i) => {
  const sw = document.createElement("div");
  sw.className = "swatch" + (i === 1 ? " active" : "");
  sw.style.background = color.hex;
  sw.title = color.id;
  sw.addEventListener("click", () => {
    activeColor = color;
    document
      .querySelectorAll(".swatch")
      .forEach((s) => s.classList.remove("active"));
    sw.classList.add("active");
  });
  paletteEl.appendChild(sw);
});

// --- Grid + paint state ---
let cells = []; // 2D array: cells[row][col] -> HTMLElement

let isMouseDown = false;
let startRow = null;
let startCol = null;
let axis = null; // 'row' | 'col' | null

function setCellColor(r, c, hex) {
  const cell = cells[r][c];
  cell.dataset.color = hex;
  cell.style.background = hex;
}

function paintSegmentTo(currR, currC) {
  if (axis === "row") {
    const r = startRow;
    const c1 = Math.min(startCol, currC);
    const c2 = Math.max(startCol, currC);
    for (let c = c1; c <= c2; c++) setCellColor(r, c, activeColor.hex);
  } else if (axis === "col") {
    const c = startCol;
    const r1 = Math.min(startRow, currR);
    const r2 = Math.max(startRow, currR);
    for (let r = r1; r <= r2; r++) setCellColor(r, c, activeColor.hex);
  }
}

function handleEnter(cellEl) {
  if (!isMouseDown) return;
  const r = Number(cellEl.dataset.row);
  const c = Number(cellEl.dataset.col);

  // Lock axis on first move away from the start cell
  if (axis == null) {
    if (r === startRow && c !== startCol) axis = "row";
    else if (c === startCol && r !== startRow) axis = "col";
    else return; // still over the start cell
  }

  // Ignore diagonals / switching axis mid-drag
  if ((axis === "row" && r !== startRow) || (axis === "col" && c !== startCol))
    return;

  paintSegmentTo(r, c);
}

// --- Build (resizable) grid ---
function buildGrid(rows, cols) {
  // Reset container & state
  gridEl.innerHTML = "";
  gridEl.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
  gridEl.style.gridTemplateRows = `repeat(${rows}, 30px)`;
  cells = [];

  for (let r = 0; r < rows; r++) {
    const rowArr = [];
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);
      cell.dataset.color = "#ffffff";
      cell.style.background = "#ffffff";
      cell.draggable = false;

      // Start stroke, paint starting cell immediately
      cell.addEventListener("mousedown", (e) => {
        e.preventDefault(); // prevent text selection/drag ghost
        isMouseDown = true;
        startRow = r;
        startCol = c;
        axis = null;
        setCellColor(r, c, activeColor.hex);
      });

      // Extend stroke when moving into cells
      cell.addEventListener("mouseenter", () => handleEnter(cell));

      // Optional: prevent native drag image
      cell.addEventListener("dragstart", (e) => e.preventDefault());

      rowArr.push(cell);
      gridEl.appendChild(cell);
    }
    cells.push(rowArr);
  }
}

// End drag anywhere on the page
document.addEventListener("mouseup", () => {
  isMouseDown = false;
  startRow = startCol = null;
  axis = null;
});

// Initial grid
buildGrid(10, 10);

// Regenerate with new size
if (generateBtn) {
  generateBtn.addEventListener("click", () => {
    const rows = parseInt(rowsInput?.value, 10) || 10;
    const cols = parseInt(colsInput?.value, 10) || 10;
    buildGrid(rows, cols);
  });
}
