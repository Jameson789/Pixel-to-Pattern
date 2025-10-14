# Sprint 2 Notes — (Pixel-to-Pattern)

## What we shipped

* **Grid UX**: resizable grid; palette; **click + drag** paints straight **rows/columns** (axis locks on first move).
* **Pattern generation (client)**: `public/scripts/pattern.js` reads the DOM, builds per-row RLE text (e.g., `Row 1: 9W 10Y 9W`).
* **Persistence (server)**: `POST /api/patterns` stores **{ id, name, instructions }**; `GET /api/patterns/:id` fetches it.

## Branches

* **`test`** — grid drag-to-paint feature.
* **`dbtest`** — app.js with **POST instructions** route wired to DB.
* (main untouched)

## DB + Env (as actually used)

**`test.sql` (no changes):**

```sql
CREATE TABLE IF NOT EXISTS patterns (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  instructions MEDIUMTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**`.env` (current):**

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=p2p_user
DB_PASS=sulesule
DB_NAME=p2p_db

HOST=0.0.0.0
PORT=3000
```

> Note: `DB_HOST=127.0.0.1` means the app and DB are on the **same machine** (works on each MacBook and on the VM when both app+DB run there).

## App routes (in `dbtest`)

* `POST /api/patterns` → insert `{ name, instructions }`
* `GET /api/patterns/:id` → return `{ id, name, instructions, created_at }`
* `GET /api/patterns` → list recent (dev helper)
* `GET /health/db` → quick MySQL connectivity check

## Frontend wiring

* `views/home.ejs` includes:

  * Grid controls, palette, grid, and **Generate Pattern** button (`#pattern`)
  * Scripts in order:

    ```html
    <script src="/scripts/grid.js" defer></script>
    <script src="/scripts/pattern.js" defer></script>
    ```
* `public/scripts/pattern.js`:

  * Reads `.cell` colors → builds RLE rows → **console logs**
  * **Also POSTs** `{ name, instructions }` to `/api/patterns`
  * Optional `<input id="patternName">` (if present, used; else auto name)

## How to run (local + VM)

```bash
# 1) Switch to the branch with the POST route
git checkout dbtest
git pull --rebase

# 2) Install deps
npm install

# 3) Ensure DB table exists (run your test.sql on each machine)
mysql -u p2p_user -p p2p_db < test.sql

# 4) Start the server
npm run dev   # or npm start

# 5) Open the app
# http://localhost:3000 (or VM IP:3000 if remote browser)
```

## Smoke tests

1. **DB health**
   Open `/health/db` → expect `{"db":"ok","result":1}`.
2. **UI**
   Generate a grid; paint using click-drag rows/columns; white erases.
3. **Generate + Save**
   Click **Generate Pattern** → alert shows saved **ID**.
4. **Verify API**
   Visit `/api/patterns/<ID>` → expect JSON with `id,name,instructions,created_at`.
5. **cURL insert** (optional)

   ```bash
   curl -s -X POST http://localhost:3000/api/patterns \
     -H 'Content-Type: application/json' \
     -d '{"name":"Smoke Test","instructions":"Row 1: 10W"}'
   ```

## Known limits (Sprint 2)

* Instructions are **top-to-bottom RLE** (no RS/WS alternation yet).
* No auth; patterns are readable by ID.
* Only `{ id, name, instructions }` stored (grid/palette not persisted yet).

## Next up (Sprint 3 candidates)

* Alternate instruction style (RS/WS, bottom-up).
* Save/load full charts (store grid + palette).
* TXT/PDF export and shareable view.
* Auth + “My Patterns”; edit/delete.
* Clear/Undo/Redo; freehand mode; Shift = straight line.
