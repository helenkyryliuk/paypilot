import express from "express";
import ViteExpress from "vite-express";
import dotenv from "dotenv";
import Stripe from "stripe";
import { prisma } from "./lib/prisma.ts";
import paymentLinkRoutes from "./routes/paymentLinks.routes.ts";
import { handlePaymentIntentSucceeded } from "./controllers/payments.controller.ts";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

dotenv.config();

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "❌ CRITICAL: STRIPE_SECRET_KEY is missing from your .env file!",
  );
}

const stripe = new Stripe(secretKey);
// If you are testing with the CLI, find the secret by running 'stripe listen'.
// If you are using an endpoint defined with the API or dashboard, look in
// your webhook settings at https://dashboard.stripe.com/webhooks.
//
// Don't include webhook secrets in code.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    let event = request.body;

    if (endpointSecret) {
      const signature = request.headers["stripe-signature"];

      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature!,
          endpointSecret,
        );
      } catch (err) {
        console.log("⚠️ Webhook signature verification failed.", err);

        return response.sendStatus(400);
      }
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;

          console.log(
            `PaymentIntent for ${paymentIntent.amount} was successful!`,
          );

          await handlePaymentIntentSucceeded(paymentIntent);

          break;
        }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      response.sendStatus(200);
    } catch (error) {
      console.error("Webhook processing failed:", error);

      response.sendStatus(500);
    }
  },
);

app.use(express.json()); // Essential to read incoming JSON if needed

app.use("/api/payment-links", paymentLinkRoutes);

app.get("/api/health/db", async (_request, response) => {
  try {
    const userCount = await prisma.user.count();

    response.json({
      success: true,
      database: "connected",
      userCount,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    response.status(500).json({
      success: false,
      database: "disconnected",
    });
  }
});

ViteExpress.listen(app, PORT, () => {
  console.log(`PayPilot API running at http://localhost:${PORT}`);
});

// // 3. Catch-all for undefined routes (404)
// app.use((req, res, next) => {
//   res.status(404).json({ message: "Route not found" });
// });

// // 4. Global Error Handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: "Something went wrong on the server!" });
// });
