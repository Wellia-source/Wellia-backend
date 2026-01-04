// Wellia Backend API
// Stack: Node.js, Express, Stripe, PostgreSQL (Supabase-compatible)

import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import pkg from 'pg';

const { Pool } = pkg;
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/', (_, res) => {
  res.send('Wellia API is live');
});

// Create Stripe checkout session
app.post('/api/create-checkout', async (req, res) => {
  const { email } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
  });

  res.json({ url: session.url });
});

// Stripe webhook
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  res.json({ received: true });
});

// AI wellness plan endpoint
app.post('/api/ai-plan', async (req, res) => {
  const { goals } = req.body;

  const plan = {
    workout: '20 min walk + glutes',
    mental: '5 min breathing',
    habit: 'Drink 2L water',
    focus: goals,
  };

  res.json(plan);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Wellia backend running on port ${PORT}`));
