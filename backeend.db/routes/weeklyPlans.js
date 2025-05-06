const express = require('express');
const router = express.Router();
const pool = require('../db');

// 获取所有用药计划
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM weeklyPlans');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 添加新的用药计划
router.post('/', async (req, res) => {
  const { Name, Date, Day, Time, Dose, Status } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO weeklyPlans (Name, Date, Day, Time, Dose, Status) VALUES (?, ?, ?, ?, ?, ?)',
      [Name, Date, Day, Time, Dose, Status]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
