import express from 'express';
import pool from './db.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const app = express();

// allow JSON bodies for API routes
app.use(express.json({ limit: '1mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('home'));

app.get("/patterns", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, instructions, created_at FROM patterns ORDER BY id DESC"
    );
    res.render("patterns", { patterns: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load patterns");
  }
});


app.get('/health/db', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ db: 'ok', result: rows[0].ok });
  } catch (err) {
    console.error(err);
    res.status(500).json({ db: 'error', message: err.message });
  }
});

app.get('/ping', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM ping ORDER BY id DESC LIMIT 5');
  res.json(rows);
});

// begin crochet pattern fxn
// --- patterns API: ONLY id, name, instructions ---
// create
app.post('/api/patterns', async (req, res) => {
  try {
    const { name, instructions } = req.body;
    if (typeof name !== 'string' || !name.trim() ||
        typeof instructions !== 'string' || !instructions.trim()) {
      return res.status(400).json({ error: 'name and instructions are required strings' });
    }

    const [result] = await pool.query(
      'INSERT INTO patterns (name, instructions) VALUES (?, ?)',
      [name.trim(), instructions]
    );
    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'insert failed', message: err.message });
  }
});

// read (single)
app.get('/api/patterns/:id', async (req, res) => {
  try {
    const pid = Number(req.params.id);
    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ error: 'invalid id' });
    }
    const [rows] = await pool.query(
      'SELECT id, name, instructions FROM patterns WHERE id = ?',
      [pid]
    );
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'fetch failed', message: err.message });
  }
});

// optional: list recent (handy while developing)
app.get('/api/patterns', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name FROM patterns ORDER BY id DESC LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'list failed', message: err.message });
  }
});
// end crochet instructions fxn

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
