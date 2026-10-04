export type PublicPaymentLink = {
  id: string;
  slug: string;
  productName: string;
  description?: string;
  amount: number;
  currency: "nzd";
  productType: "digital_download" | "service";
  sellerName: string;
  supportEmail?: string;
  productUrl?: string;
};

export type PaymentPageData = {
  paymentLink: PublicPaymentLink;
  clientSecret: string;
};

export type PaymentLinkParams = {
  slug: string;
};
export type CreatePaymentIntentResponse = {
  clientSecret: string;
};

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED";

export type PaymentConfirmation = {
  status: PaymentStatus;
  productName: string;
  amount: number;
  currency: string;
  paymentIntentId: string;
  customerEmail: string | null;
  paidAt: string;
  downloadUrl: string | null;
  supportEmail: string;
};
