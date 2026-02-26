const express = require('express');
const { supabaseAdmin } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:username — Get user profile + public recipes
router.get('/:username', async (req, res) => {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, display_name, avatar_url, bio, is_premium, created_at')
    .eq('display_name', req.params.username)
    .single();

  if (error || !user) return res.status(404).json({ error: 'User not found' });

  const { data: recipes } = await supabaseAdmin
    .from('recipes')
    .select('id, title, slug, cover_photo_url, difficulty, cooking_time_minutes, created_at')
    .eq('user_id', user.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  res.json({ user, recipes: recipes || [] });
});

// PUT /api/users/me — Update own profile
router.put('/me', requireAuth, async (req, res) => {
  const { display_name, bio } = req.body;
  const updates = {};
  if (display_name) updates.display_name = display_name;
  if (bio !== undefined) updates.bio = bio;

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ user });
});

// GET /api/users/me/profile — Full profile with recipe count
router.get('/me/profile', requireAuth, async (req, res) => {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const { count } = await supabaseAdmin
    .from('recipes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', req.user.id);

  res.json({ user, recipe_count: count });
});

module.exports = router;
