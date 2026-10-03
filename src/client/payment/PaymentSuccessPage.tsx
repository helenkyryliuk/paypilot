import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import {
  AlertCircle,
  Check,
  CreditCard,
  Download,
  FileText,
  HelpCircle,
  LoaderCircle,
  Mail,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPaymentConfirmation } from "@/services/paymentLinks";
import type { PaymentConfirmation } from "../../shared/types";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15;

export function PaymentSuccessPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");

  const [payment, setPayment] = useState<PaymentConfirmation>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isStillProcessing, setIsStillProcessing] = useState(false);

  useEffect(() => {
    if (!slug || !paymentIntentId) {
      setErrorMessage("Payment details are missing from this link.");
      return;
    }

    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function loadPayment() {
      attempts += 1;

      try {
        const data = await getPaymentConfirmation(slug!, paymentIntentId!);

        if (isCancelled) return;

        setPayment(data);

        // The webhook can arrive a moment after Stripe redirects the customer,
        // so keep checking until the payment leaves the pending states.
        if (data.status === "PENDING" || data.status === "PROCESSING") {
          if (attempts < MAX_POLL_ATTEMPTS) {
            timeoutId = setTimeout(loadPayment, POLL_INTERVAL_MS);
          } else {
            setIsStillProcessing(true);
          }
        }
      } catch (error) {
        if (isCancelled) return;

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your payment details.",
        );
      }
    }

    void loadPayment();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [slug, paymentIntentId]);

  if (errorMessage) {
    return (
      <PaymentStatusMessage
        variant="destructive"
        title="Payment details unavailable"
        message={errorMessage}
      />
    );
  }

  if (payment?.status === "FAILED" || payment?.status === "CANCELED") {
    return (
      <PaymentStatusMessage
        variant="destructive"
        title="Payment not completed"
        message="Your payment was not completed and you have not been charged."
      />
    );
  }

  if (isStillProcessing) {
    return (
      <PaymentStatusMessage
        title="Payment is still processing"
        message="Your payment is taking longer than usual to confirm. You will receive an email once it is complete."
      />
    );
  }

  if (!payment || payment.status !== "SUCCEEDED") {
    return <PaymentConfirming />;
  }

  return <PaymentSuccessDetails payment={payment} />;
}

type PaymentSuccessDetailsProps = {
  payment: PaymentConfirmation;
};

function PaymentSuccessDetails({ payment }: PaymentSuccessDetailsProps) {
  const {
    productName,
    amount,
    currency,
    paymentIntentId,
    customerEmail,
    paidAt,
    downloadUrl,
    supportEmail,
  } = payment;

  const formattedAmount = new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);

  const paymentDate = new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(paidAt));

  const handleDownload = () => {
    if (!downloadUrl) return;

    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadReceipt = () => {
    // Replace this later with your receipt PDF endpoint.
    window.print();
  };

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <span className="text-lg font-bold">P</span>
            </div>

            <span className="text-2xl font-bold tracking-tight">PayPilot</span>
          </div>

          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <ShieldCheck className="size-4" />
            Secure payment powered by Stripe
          </div>
        </header>

        <Card className="overflow-hidden shadow-sm">
          <CardContent className="p-0">
            <section className="px-6 py-12 text-center sm:px-10">
              <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-emerald-50">
                <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                  <Check className="size-8" strokeWidth={3} />
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Payment successful!
              </h1>

              <p className="mt-3 text-muted-foreground">
                Thank you for your purchase. Your payment has been processed
                successfully.
              </p>
            </section>

            <Separator />

            <section className="grid gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_340px]">
              <div>
                <h2 className="mb-5 text-lg font-semibold">Payment summary</h2>

                <dl className="space-y-5">
                  <SummaryRow
                    icon={<FileText className="size-4" />}
                    label="Product"
                    value={productName}
                  />

                  <SummaryRow
                    icon={<ReceiptText className="size-4" />}
                    label="Amount"
                    value={formattedAmount}
                  />

                  <SummaryRow
                    icon={<CreditCard className="size-4" />}
                    label="Payment ID"
                    value={paymentIntentId}
                    mono
                  />

                  <SummaryRow
                    icon={<ReceiptText className="size-4" />}
                    label="Date"
                    value={paymentDate}
                  />
                </dl>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="size-4" />
                    </div>

                    <div>
                      <p className="font-semibold text-emerald-900">
                        Payment complete
                      </p>

                      {customerEmail && (
                        <p className="mt-2 text-sm leading-6 text-emerald-800">
                          A confirmation has been sent to{" "}
                          <span className="font-medium">{customerEmail}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadReceipt}
                >
                  <Download className="size-4" />
                  Download receipt
                </Button>
              </div>
            </section>

            {downloadUrl && (
              <>
                <Separator />

                <section className="px-6 py-8 sm:px-10">
                  <div className="rounded-2xl border bg-primary/5 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
                    <div className="flex gap-4">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                        <FileText className="size-7" />
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold">
                          Your download is ready
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          You can now download your purchased product.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="mt-5 w-full sm:mt-0 sm:w-auto"
                      onClick={handleDownload}
                    >
                      <Download className="size-4" />
                      Download {productName}
                    </Button>
                  </div>
                </section>
              </>
            )}

            <Separator />

            <section className="px-6 py-8 sm:px-10">
              <div className="flex flex-col gap-5 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <HelpCircle className="mt-0.5 size-5 text-muted-foreground" />

                  <div>
                    <p className="font-medium">Need help?</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Contact the seller if you have any questions about your
                      purchase.
                    </p>
                  </div>
                </div>

                <Button variant="outline" asChild>
                  <a href={`mailto:${supportEmail}`}>
                    <Mail className="size-4" />
                    Contact support
                  </a>
                </Button>
              </div>
            </section>
          </CardContent>
        </Card>

        <footer className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Need help? Contact us at{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="font-medium text-primary hover:underline"
            >
              {supportEmail}
            </a>
          </p>

          <p className="mt-2">
            © {new Date().getFullYear()} PayPilot. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}

type SummaryRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
};

function SummaryRow({ icon, label, value, mono = false }: SummaryRowProps) {
  return (
    <div className="grid grid-cols-[minmax(130px,0.8fr)_1fr] items-start gap-4">
      <dt className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>

        {label}
      </dt>

      <dd
        className={
          mono
            ? "break-all text-right font-mono text-sm font-medium"
            : "text-right text-sm font-medium"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function PaymentConfirming() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />

        <p className="mt-4 text-sm text-muted-foreground">
          Confirming your payment...
        </p>
      </div>
    </main>
  );
}

type PaymentStatusMessageProps = {
  title: string;
  message: string;
  variant?: "default" | "destructive";
};

function PaymentStatusMessage({
  title,
  message,
  variant = "default",
}: PaymentStatusMessageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Alert variant={variant} className="max-w-md">
        <AlertCircle className="size-4" />

        <AlertTitle>{title}</AlertTitle>

        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </main>
  );
}
