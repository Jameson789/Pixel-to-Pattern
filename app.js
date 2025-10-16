import express from 'express';
import pool from './db.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const app = express();

app.use(express.json({ limit: '1mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('home'));

app.get("/patterns", async (req, res) => {
  let rows = [];
  let error = null;

  try {
    const [result] = await pool.query(
      "SELECT id, name, instructions, created_at FROM patterns ORDER BY id DESC"
    );
    rows = result;
  } catch (err) {
    console.error(err);
  }

  res.render("patterns", { patterns: rows, error });
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

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
