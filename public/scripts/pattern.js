function rleRow(codes) {
  if (!codes.length) return "";
  const out = [];
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

let lastPatternText = "";

function renderPattern() {
  const outEl = document.getElementById("pattern-output");
  if (!outEl) return;

  const grid = window.cells;
  if (!Array.isArray(grid) || grid.length === 0) {
    outEl.textContent = "No grid found. Click 'Generate Grid' and color some cells first.";
    lastPatternText = "";
    updateSaveEnabled();
    return;
  }

  const codeGrid = grid.map(row => row.map(cell => cell.dataset.code || "W"));
  lastPatternText = buildPatternText(codeGrid);
  outEl.textContent = lastPatternText;
  updateSaveEnabled();
}

async function savePattern(name, instructions) {
  const res = await fetch("/api/patterns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, instructions })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data.id;
}

function updateSaveEnabled() {
  const saveBtn = document.getElementById("save");
  const nameInput = document.getElementById("pattern-name");
  const hasName = Boolean(nameInput?.value.trim());
  const hasPattern = Boolean(lastPatternText);
  saveBtn.disabled = !(hasName && hasPattern);
}

document.addEventListener("DOMContentLoaded", () => {
  const genBtn = document.getElementById("pattern");
  const saveBtn = document.getElementById("save");
  const nameInput = document.getElementById("pattern-name");

  genBtn?.addEventListener("click", renderPattern);
  nameInput?.addEventListener("input", updateSaveEnabled);

  saveBtn?.addEventListener("click", async () => {
    const name = (nameInput?.value || "").trim();
    if (!name) return alert("Please enter a name before saving.");
    if (!lastPatternText) return alert("Please generate a pattern first.");

    try {
      const id = await savePattern(name, lastPatternText);
      alert(`Saved! Pattern ID: ${id}`);
    } catch (err) {
      console.error(err);
      alert(`Save failed: ${err.message}`);
    }
  });

  updateSaveEnabled(); // start disabled
});
