const express = require('express');
const { supabaseAdmin } = require('../lib/supabase');

const router = express.Router();

// GET /auth/google — redirect to Supabase Google OAuth
router.get('/google', (req, res) => {
  const redirectUrl = `${process.env.SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${process.env.APP_URL}/auth/callback`;
  res.redirect(redirectUrl);
});

// GET /auth/callback — redirect to the frontend so the React app can handle the token
router.get('/callback', (req, res) => {
  const frontendUrl = process.env.APP_URL || 'http://localhost:5173';
  const query = new URLSearchParams(req.query).toString();
  res.redirect(`${frontendUrl}/auth/callback${query ? '?' + query : ''}`);
});

// POST /auth/sync-user — called after login to ensure user row exists in our users table
router.post('/sync-user', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  // Upsert user into public.users table
  const { error: upsertError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.full_name || user.email.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url || null,
    }, { onConflict: 'id', ignoreDuplicates: false });

  if (upsertError) {
    console.error('User upsert error:', upsertError);
    return res.status(500).json({ error: 'Failed to sync user' });
  }

  // Fetch and return the user row
  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  res.json({ user: dbUser });
});

module.exports = router;
