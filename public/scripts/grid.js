const PALETTE = [
  { id: "white",  hex: "#ffffff" },
  { id: "black",  hex: "#000000" },
  { id: "red",    hex: "#ef4444" },
  { id: "green",  hex: "#22c55e" },
  { id: "blue",   hex: "#3b82f6" },
  { id: "yellow", hex: "#f59e0b" },
  { id: "purple", hex: "#8b5cf6" },
];

let activeColor = PALETTE[1]; // default: black

const paletteEl = document.getElementById("palette");
const gridEl = document.getElementById("grid");

// palette
PALETTE.forEach((color, i) => {
  const sw = document.createElement("div");
  sw.className = "swatch" + (i === 1 ? " active" : "");
  sw.style.background = color.hex;
  sw.addEventListener("click", () => {
    activeColor = color;
    document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
    sw.classList.add("active");
  });
  paletteEl.appendChild(sw);
});

// 10x10 grid
for (let r = 0; r < 10; r++) {
  for (let c = 0; c < 10; c++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.addEventListener("click", () => {
      cell.style.background =
        cell.style.background === activeColor.hex ? "#ffffff" : activeColor.hex;
    });
    gridEl.appendChild(cell);
  }
}
