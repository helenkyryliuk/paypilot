import {
  BadgeDollarSign,
  Download,
  FileDown,
  Flag,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PublicPaymentLink } from "../../shared/types";
import { SummaryRow } from "./SummaryRow";

type ProductSummaryProps = {
  paymentLink: PublicPaymentLink;
};

export function ProductSummary({ paymentLink }: ProductSummaryProps) {
  const formattedAmount = new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: paymentLink.currency.toUpperCase(),
  }).format(paymentLink.amount);

  const productType =
    paymentLink.productType === "digital_download"
      ? "Digital Download"
      : "Service";

  return (
    <Card className="h-full border-border/70 shadow-sm">
      <CardContent className="flex h-full flex-col p-6 sm:p-8">
        <div className="flex flex-1 flex-col">
          <div className="mx-auto flex size-28 items-center justify-center rounded-full bg-primary/8">
            <div className="relative flex size-15 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
              <FileDown className="size-5" />

              {paymentLink.productType === "digital_download" && (
                <span className="absolute -bottom-2 -right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Download className="size-4" />
                </span>
              )}
            </div>
          </div>

          <div className="mt-7 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {paymentLink.productName}
            </h2>

            {paymentLink.description && (
              <div className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                {paymentLink.description}
              </div>
            )}
          </div>

          <Separator className="my-8" />

          <dl className="space-y-5">
            <SummaryRow
              icon={<BadgeDollarSign className="size-4" />}
              label="Amount"
              value={`NZD ${formattedAmount.replace("NZ$", "$")}`}
            />

            <SummaryRow
              icon={<Flag className="size-4" />}
              label="Product"
              value={paymentLink.productName}
            />

            <SummaryRow
              icon={<Download className="size-4" />}
              label="Type"
              value={productType}
            />

            <SummaryRow
              icon={<UserRound className="size-4" />}
              label="Seller"
              value={paymentLink.sellerName}
            />
          </dl>
        </div>

        <Separator className="my-8" />

        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

          <div>
            <p className="text-sm font-semibold">Secure checkout</p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Your payment information is encrypted and securely processed by
              Stripe.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
