const Stripe = require('stripe');
const { supabaseAdmin } = require('../lib/supabase');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(user, userId) {
  let customerId = user.stripe_customer_id;

  // Create Stripe customer if not exists
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.display_name,
      metadata: { supabase_user_id: userId }
    });
    customerId = customer.id;

    await supabaseAdmin
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.APP_URL}/?checkout=success`,
    cancel_url: `${process.env.APP_URL}/pricing?checkout=cancelled`,
    metadata: { supabase_user_id: userId }
  });

  return session;
}

async function handleWebhookEvent(rawBody, signature) {
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;
      if (!userId) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const premiumUntil = new Date(subscription.current_period_end * 1000);

      await supabaseAdmin
        .from('users')
        .update({ is_premium: true, premium_until: premiumUntil.toISOString() })
        .eq('id', userId);
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata?.supabase_user_id;
      if (!userId) break;

      const isActive = subscription.status === 'active';
      const premiumUntil = isActive
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;

      await supabaseAdmin
        .from('users')
        .update({ is_premium: isActive, premium_until: premiumUntil })
        .eq('id', userId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customer = await stripe.customers.retrieve(invoice.customer);
      const userId = customer.metadata?.supabase_user_id;
      if (userId) {
        await supabaseAdmin
          .from('users')
          .update({ is_premium: false, premium_until: null })
          .eq('id', userId);
      }
      break;
    }
  }
}

async function cancelSubscription(stripeCustomerId) {
  const subscriptions = await stripe.subscriptions.list({ customer: stripeCustomerId, status: 'active' });
  for (const sub of subscriptions.data) {
    await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
  }
}

module.exports = { createCheckoutSession, handleWebhookEvent, cancelSubscription };
