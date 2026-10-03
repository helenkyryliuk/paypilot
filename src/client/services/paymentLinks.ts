import type {
  PaymentConfirmation,
  PaymentPageData,
} from "../../shared/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export async function getPaymentPage(slug: string): Promise<PaymentPageData> {
  const response = await fetch(
    `${API_URL}/payment-links/${encodeURIComponent(slug)}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("This payment link does not exist.");
    }

    if (response.status === 410) {
      throw new Error("This payment link has expired.");
    }

    throw new Error("Unable to load the payment page.");
  }

  return response.json() as Promise<PaymentPageData>;
}

export async function getPaymentConfirmation(
  slug: string,
  paymentIntentId: string,
): Promise<PaymentConfirmation> {
  const response = await fetch(
    `${API_URL}/payment-links/${encodeURIComponent(slug)}/payments/${encodeURIComponent(paymentIntentId)}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("We couldn't find this payment.");
    }

    throw new Error("Unable to load your payment details.");
  }

  return response.json() as Promise<PaymentConfirmation>;
}
