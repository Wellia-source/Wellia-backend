import express from "express";
import cors from "cors";
import Stripe from "stripe";
import bodyParser from "body-parser";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());

// Webhook must be raw (we will finish webhook setup after it’s live)
app.post("/webhook", bodyParser.raw({ type: "application/json" }), (req, res) => {
  res.json({ received: true });
});

// Everything else JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Wellia API is live");
});

app.post("/api/create-checkout", async (req, res) => {
  try {
    const { email } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai-plan", (req, res) => {
  const { goals } = req.body || {};
  res.json({
    workout: "20 min walk + glutes",
    mental: "5 min breathing",
    habit: "Drink 2L water",
    focus: goals || "general wellness"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Wellia backend running on port ${PORT}`));
