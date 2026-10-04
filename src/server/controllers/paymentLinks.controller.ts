import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.ts";

interface CreatePaymentLinkBody {
  productName: string;
  description?: string;
  amount: number;
  currency: string;
  downloadUrl?: string;
}

function createSlug(productName: string): string {
  const readableName = productName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const uniquePart = crypto.randomUUID().slice(0, 8);

  return `${readableName}-${uniquePart}`;
}

export async function createPaymentLink(
  request: Request<unknown, unknown, CreatePaymentLinkBody>,
  response: Response,
): Promise<void> {
  try {
    const { productName, description, amount, currency, downloadUrl } =
      request.body;

    if (!productName?.trim()) {
      response.status(400).json({
        message: "Product name is required",
      });
      return;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      response.status(400).json({
        message: "Amount must be a positive integer in cents",
      });
      return;
    }

    const paymentLink = await prisma.paymentLink.create({
      data: {
        productName: productName.trim(),
        description: description?.trim() || null,
        amount,
        currency: currency.toLowerCase(),
        downloadUrl: downloadUrl?.trim() || null,
        slug: createSlug(productName),

        // Replace this when you add real authentication.
        user: {
          connect: {
            email: "helen@paypilot.dev",
          },
        },
      },
    });

    response.status(201).json(paymentLink);
  } catch (error) {
    console.error("Create payment link error:", error);

    response.status(500).json({
      message: "Unable to create payment link",
    });
  }
}

export async function getPaymentLinks(
  _request: Request,
  response: Response,
): Promise<void> {
  try {
    const paymentLinks = await prisma.paymentLink.findMany({
      include: {
        // A PENDING payment is created every time the checkout page loads,
        // so only completed payments count towards the totals.
        payments: {
          where: {
            status: "SUCCEEDED",
          },
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = paymentLinks.map((paymentLink) => ({
      ...paymentLink,
      totalPayments: paymentLink.payments.length,
      revenue: paymentLink.payments.reduce(
        (total, payment) => total + payment.amount,
        0,
      ),
      payments: undefined,
    }));

    response.json(result);
  } catch (error) {
    console.error("Get payment links error:", error);

    response.status(500).json({
      message: "Unable to load payment links",
    });
  }
}

export async function getPaymentLinkBySlug(
  request: Request<{ slug: string }>,
  response: Response,
): Promise<void> {
  try {
    const paymentLink = await prisma.paymentLink.findUnique({
      where: {
        slug: request.params.slug,
      },
    });

    if (!paymentLink) {
      response.status(404).json({
        message: "Payment link not found",
      });
      return;
    }

    if (!paymentLink.isActive) {
      response.status(410).json({
        message: "This payment link is no longer active",
      });
      return;
    }

    response.json(paymentLink);
  } catch (error) {
    console.error("Get payment link error:", error);

    response.status(500).json({
      message: "Unable to load the payment link",
    });
  }
}

export async function updatePaymentLinkStatus(
  request: Request<{ id: string }, unknown, { isActive: boolean }>,
  response: Response,
): Promise<void> {
  try {
    const paymentLink = await prisma.paymentLink.update({
      where: {
        id: request.params.id,
      },
      data: {
        isActive: request.body.isActive,
      },
    });

    response.json(paymentLink);
  } catch (error) {
    console.error("Update payment link error:", error);

    response.status(500).json({
      message: "Unable to update the payment link",
    });
  }
}

export async function deletePaymentLink(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  try {
    await prisma.paymentLink.delete({
      where: {
        id: request.params.id,
      },
    });

    response.status(204).send();
  } catch (error) {
    console.error("Delete payment link error:", error);

    response.status(500).json({
      message: "Unable to delete the payment link",
    });
  }
}
