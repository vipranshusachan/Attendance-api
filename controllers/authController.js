const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/password');
require('dotenv').config();

module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, phone, password, role='employee', department_id=null } = req.body;
      if (!name || !password) return res.status(400).json({ error: 'name and password required' });

      const hashed = await hashPassword(password);
      const q = `INSERT INTO users (name,email,phone,password_hash,role,department_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,name,email,role`;
      const vals = [name, email, phone, hashed, role, department_id];
      const r = await db.query(q, vals);
      res.json({ ok: true, user: r.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'DB error or duplicate email' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'email and password required' });

      const r = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = r.rows[0];
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await comparePassword(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '7d' });
      res.json({ ok: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
};
