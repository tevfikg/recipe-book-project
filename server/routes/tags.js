const express = require('express');
const { supabaseAdmin } = require('../lib/supabase');

const router = express.Router();

// GET /api/tags — List all available tags
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('tags')
    .select('*')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json({ tags: data });
});

module.exports = router;
