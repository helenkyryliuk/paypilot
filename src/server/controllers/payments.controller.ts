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

    await prisma.payment.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: "PENDING",
        paymentLinkId: paymentLink.id,
      },
    });

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

export async function getPaymentConfirmation(
  request: Request<{ slug: string; paymentIntentId: string }>,
  response: Response,
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: {
        stripePaymentIntentId: request.params.paymentIntentId,
      },

      include: {
        paymentLink: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment || payment.paymentLink.slug !== request.params.slug) {
      return response.status(404).json({
        message: "Payment not found.",
      });
    }

    const isSucceeded = payment.status === "SUCCEEDED";

    return response.json({
      status: payment.status,
      productName: payment.paymentLink.productName,
      amount: payment.amount / 100,
      currency: payment.currency,
      paymentIntentId: payment.stripePaymentIntentId,
      customerEmail: payment.customerEmail,
      paidAt: payment.updatedAt.toISOString(),
      downloadUrl: isSucceeded ? payment.paymentLink.downloadUrl : null,
      supportEmail: payment.paymentLink.user.email,
    });
  } catch (error) {
    console.error("Get payment confirmation error:", error);

    return response.status(500).json({
      message: "Unable to load payment.",
    });
  }
}

export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
) {
  const paymentLinkId = paymentIntent.metadata.paymentLinkId;

  if (!paymentLinkId) {
    console.log(
      `PaymentIntent ${paymentIntent.id} has no paymentLinkId, skipping.`,
    );
    return;
  }

  const expandedPaymentIntent = await stripe.paymentIntents.retrieve(
    paymentIntent.id,
    { expand: ["latest_charge"] },
  );

  const latestCharge = expandedPaymentIntent.latest_charge;
  const billingDetails =
    latestCharge && typeof latestCharge !== "string"
      ? latestCharge.billing_details
      : undefined;

  const customerEmail =
    billingDetails?.email ?? paymentIntent.receipt_email ?? null;
  const customerName = billingDetails?.name ?? null;

  await prisma.payment.upsert({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    },

    update: {
      status: "SUCCEEDED",
      customerEmail,
      customerName,
    },

    create: {
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: "SUCCEEDED",
      customerEmail,
      customerName,
      paymentLinkId,
    },
  });
}
