const db = require('../config/db');
const path = require('path');

function toDateISO(date = new Date()) {
  return date.toISOString().slice(0,10);
}

module.exports = {
  checkin: async (req, res) => {
    try {
      const userId = req.user.id;
      const { lat, lng, timestamp } = req.body;
      const faceFile = req.file;
      const faceUrl = faceFile ? `/uploads/${path.basename(faceFile.path)}` : null;
      const date = timestamp ? new Date(timestamp) : new Date();
      const isoDate = toDateISO(date);

      const q = `
        INSERT INTO attendance (user_id, date, in_time, in_lat, in_lng, face_image_url)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (user_id, date)
        DO UPDATE SET in_time = EXCLUDED.in_time, in_lat = EXCLUDED.in_lat, in_lng = EXCLUDED.in_lng, face_image_url = COALESCE(attendance.face_image_url, EXCLUDED.face_image_url)
        RETURNING *;
      `;
      const vals = [userId, isoDate, date.toISOString(), lat || null, lng || null, faceUrl];
      const r = await db.query(q, vals);
      // NOTE: integrate face verification here (call ML or third party) and update face_verified & verification_score
      res.json({ ok: true, attendance: r.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'DB error' });
    }
  },

  checkout: async (req, res) => {
    try {
      const userId = req.user.id;
      const { lat, lng, timestamp } = req.body;
      const faceFile = req.file;
      const faceUrl = faceFile ? `/uploads/${path.basename(faceFile.path)}` : null;
      const date = timestamp ? new Date(timestamp) : new Date();
      const isoDate = toDateISO(date);

      const q = `
        UPDATE attendance
        SET out_time = $1, out_lat = $2, out_lng = $3, face_image_url = COALESCE(face_image_url, $4)
        WHERE user_id = $5 AND date = $6
        RETURNING *;
      `;
      const vals = [date.toISOString(), lat || null, lng || null, faceUrl, userId, isoDate];
      const r = await db.query(q, vals);
      if (r.rowCount === 0) return res.status(404).json({ error: 'Check-in not found for today' });
      // NOTE: optionally run face verification here too
      res.json({ ok: true, attendance: r.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'DB error' });
    }
  }
};
