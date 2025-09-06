const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { lat, lng, accuracy } = req.body;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
    await db.query('INSERT INTO locations (user_id, lat, lng, accuracy) VALUES ($1,$2,$3,$4)', [req.user.id, lat, lng, accuracy || null]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// admin endpoint: get active positions (last N minutes)
router.get('/active', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    const minutes = parseInt(req.query.minutes || '10', 10);
    const q = `
      SELECT DISTINCT ON (user_id) user_id, lat, lng, recorded_at
      FROM locations
      WHERE recorded_at > now() - ($1 || ' minutes')::interval
      ORDER BY user_id, recorded_at DESC;
    `;
    const r = await db.query(q, [minutes]);
    res.json({ ok: true, rows: r.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
