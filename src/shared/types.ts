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
