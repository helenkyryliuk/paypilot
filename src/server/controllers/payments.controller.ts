import Stripe from "stripe";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "❌ CRITICAL: STRIPE_SECRET_KEY is missing from your .env file!",
  );
}

const stripe = new Stripe(secretKey);

export async function getPublicPaymentPage(
  request: Request<{ slug: string }>,
  response: Response,
) {
  try {
    const paymentLink = await prisma.paymentLink.findUnique({
      where: {
        slug: request.params.slug,
      },

      include: {
        user: true,
      },
    });

    if (!paymentLink || !paymentLink.isActive) {
      return response.status(404).json({
        message: "Payment link not found.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentLink.amount,
      currency: paymentLink.currency,

      metadata: {
        paymentLinkId: paymentLink.id,
        paymentLinkSlug: paymentLink.slug,
      },

      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe did not return a client secret.");
    }

    return response.json({
      paymentLink: {
        id: paymentLink.id,
        slug: paymentLink.slug,
        productName: paymentLink.productName,
        description: paymentLink.description,
        amount: paymentLink.amount / 100,
        currency: paymentLink.currency,
        productType: paymentLink.downloadUrl ? "digital_download" : "service",
        sellerName: paymentLink.user.name ?? "PayPilot Seller",
        supportEmail: paymentLink.user.email,
      },

      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Get payment page error:", error);

    return response.status(500).json({
      message: "Unable to create payment.",
    });
  }
}
