const express = require('express');
const { supabaseAdmin } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { createCheckoutSession, handleWebhookEvent, cancelSubscription } = require('../services/stripe');

const router = express.Router();

// POST /api/stripe/create-checkout — Create Stripe Checkout session
router.post('/create-checkout', requireAuth, async (req, res) => {
  const { data: user } = await supabaseAdmin
    .from('users').select('*').eq('id', req.user.id).single();

  try {
    const session = await createCheckoutSession(user, req.user.id);
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/stripe/webhook — Receive Stripe events
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    await handleWebhookEvent(req.body, sig);
    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/stripe/cancel — Cancel subscription
router.post('/cancel', requireAuth, async (req, res) => {
  const { data: user } = await supabaseAdmin
    .from('users').select('stripe_customer_id').eq('id', req.user.id).single();

  if (!user?.stripe_customer_id) {
    return res.status(400).json({ error: 'No active subscription found' });
  }

  try {
    await cancelSubscription(user.stripe_customer_id);
    res.json({ success: true, message: 'Subscription will end at the billing period end' });
  } catch (err) {
    console.error('Stripe cancel error:', err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;
