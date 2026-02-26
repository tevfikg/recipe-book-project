const express = require('express');
const { supabaseAdmin } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/bookmarks — Get current user's bookmarks
router.get('/', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('bookmarks')
    .select(`
      created_at,
      recipes (
        id, title, slug, cover_photo_url, difficulty, cooking_time_minutes,
        users (display_name, avatar_url)
      )
    `)
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ bookmarks: data });
});

// POST /api/bookmarks/:recipeId — Add bookmark
router.post('/:recipeId', requireAuth, async (req, res) => {
  const { error } = await supabaseAdmin
    .from('bookmarks')
    .insert({ user_id: req.user.id, recipe_id: req.params.recipeId });

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Already bookmarked' });
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ success: true });
});

// DELETE /api/bookmarks/:recipeId — Remove bookmark
router.delete('/:recipeId', requireAuth, async (req, res) => {
  const { error } = await supabaseAdmin
    .from('bookmarks')
    .delete()
    .eq('user_id', req.user.id)
    .eq('recipe_id', req.params.recipeId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
