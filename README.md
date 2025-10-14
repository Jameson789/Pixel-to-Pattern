Project Name: Pixel to Pattern
Tagline: Create your perfect tapestry
Target Users: Beginner – Advanced crocheters

ORIGINAL PLAN

* Feature Breakdown (MVP)

  * Create: user paints a pixel drawing that is converted to a crochet pattern row-by-row (count stitches per color).
    Example (sc = single crochet):
    Row 1: 28 sc (white)
    Row 2: 9 sc (white), 10 sc (yellow), 9 sc (white)
    Row 3: 8 sc (white), 10 sc (yellow), 9 sc (white)
  * Read: view all submitted patterns
  * Update: TBD
  * Delete: remove a pattern the user posted
* Extended Ideas

  * Comments under posts
  * Sidebar with links to crochet or pixel-art tutorials
* Data Model (initial concept)

  * Core Entities: Users, Posts, Comments
  * Relationships: each post/comment belongs to one user; everyone can view
  * CRUD: create pixel drawings and comments; read all; update TBD; delete patterns and comments
* User Experience (planned)

  * Home Page: feed of posts, sidebar resources, floating + to post
  * Add Post: responsive canvas size (width/height independent), tools (pencil, color, eraser, fill, clear)
  * View Post: show pixel image; underneath, generated crochet pattern text
* Credits

  * Madeleine Chance, Software Development and Data Analytics Student, Green River College

SPRINT1 WORK

* Direction

  * Build a grid where users choose size (1–50 by 1–50), select basic colors, and paint pixel-by-pixel.
  * Backend will convert the pixel grid into a crochet pattern.
* Milestones

  1. Hello World in Node
  2. Deploy the app
  3. Set up MySQL
  4. Connect using a pool from code
  5. Build the frontend
* Front End

  * Variable grid (1–50 x 1–50)
  * Sprint goal: save a generated pattern to the database with a label
  * Extras considered: DB view page, sticky header with grid-size inputs and logo/index title
* Back End

  * Frontend connects to DB (Workbench used during setup)
  * Data fields for initial persistence: ID, Label, pattern saved as an array (early concept before final Sprint 2 schema)

SPRINT2 WORK

* What we shipped

  * Grid UX: resizable grid; palette; click + drag paints straight rows or columns (axis locks on first move)
  * Pattern generation (client): reads DOM cells and produces row-by-row RLE text (example: Row 1: 9W 10Y 9W)
  * Persistence (server): POST /api/patterns stores { id, name, instructions }; GET /api/patterns/:id fetches a saved pattern
* Branches

  * test: grid drag-to-paint feature
  * dbtest: POST instructions route wired to DB in app.js
  * main: unchanged during this sprint
* Database and environment (current)

  * test.sql
    CREATE TABLE IF NOT EXISTS patterns (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    instructions MEDIUMTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  * .env
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_USER=p2p_user
    DB_PASS=sulesule
    DB_NAME=p2p_db
    HOST=0.0.0.0
    PORT=3000
  * Note: DB_HOST=127.0.0.1 assumes app and DB run on the same machine (works on each MacBook and on the VM when both app and DB run there)
* App routes (in dbtest)

  * POST /api/patterns → insert { name, instructions }
  * GET /api/patterns/:id → return { id, name, instructions, created_at }
  * GET /api/patterns → list recent (dev helper)
  * GET /health/db → simple MySQL connectivity check
* Frontend wiring

  * views/home.ejs includes grid controls, palette, grid, a Generate Pattern button
  * Scripts load in order: grid.js then pattern.js
  * pattern.js reads .cell colors → builds RLE rows for on-page preview → requires a name → POSTs { name, instructions } to /api/patterns
* How to run (local or VM)

  * Switch to branch with POST route:
    git checkout dbtest
    git pull --rebase
  * Install dependencies:
    npm install
  * Ensure DB table exists on each machine:
    mysql -u p2p_user -p p2p_db < test.sql
  * Start the server:
    npm run dev
    or
    npm start
  * Open the app:
    [http://localhost:3000](http://localhost:3000)  (or VM_IP:3000 if accessing remotely)
* Smoke tests

  1. Open /health/db → expect {"db":"ok","result":1}
  2. Generate grid; paint with click-drag rows/columns; white erases
  3. Click Generate Pattern to see preview, enter a name, click Save Pattern → alert shows saved ID
  4. Visit /api/patterns/ID → expect JSON { id, name, instructions, created_at }
  5. Optional cURL insert:
     curl -s -X POST [http://localhost:3000/api/patterns](http://localhost:3000/api/patterns) 
     -H 'Content-Type: application/json' 
     -d '{"name":"Smoke Test","instructions":"Row 1: 10W"}'
* Known limits at end of Sprint 2

  * Instructions are top-to-bottom RLE (no RS/WS alternating yet)
  * No authentication; patterns are readable by ID
  * Only { id, name, instructions } are stored (grid and palette not persisted yet)
* Next sprint candidates

  * RS/WS alternating, bottom-up reading; left-handed mode option
  * Save/load full charts (persist grid + palette)
  * TXT/PDF export and shareable read-only view
  * Auth and “My Patterns”; edit/delete
  * Clear, Undo/Redo, freehand mode, Shift for straight lines
