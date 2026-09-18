import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { AlertCircle, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { useParams } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PaymentForm } from "./PaymentForm";
import { ProductSummary } from "./ProductSummary";
import { payPilotAppearance, stripePromise } from "@/lib/stripe";
import { getPaymentPage } from "@/services/paymentLinks";
import type { PaymentPageData } from "../../shared/types";

export function PublicPaymentPage() {
  const { slug } = useParams<{ slug: string }>();

  const [pageData, setPageData] = useState<PaymentPageData>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setErrorMessage("Payment link is missing.");
      setIsLoading(false);
      return;
    }
    console.log(slug);
    console.log(pageData);

    const controller = new AbortController();

    async function loadPaymentPage() {
      try {
        setIsLoading(true);
        setErrorMessage(undefined);

        const data = await getPaymentPage(slug!);

        if (!controller.signal.aborted) {
          setPageData(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load this payment page.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadPaymentPage();

    return () => {
      controller.abort();
    };
  }, [slug]);

  if (isLoading) {
    return <PaymentPageLoading />;
  }

  if (errorMessage || !pageData) {
    return (
      <PaymentPageError
        message={errorMessage ?? "This payment page is unavailable."}
      />
    );
  }

  const elementsOptions: StripeElementsOptions = {
    clientSecret: pageData.clientSecret,
    appearance: payPilotAppearance,
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(109,74,255,0.09),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.08),_transparent_35%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-6 flex items-center justify-between rounded-2xl border bg-background/90 px-5 py-4 shadow-sm backdrop-blur sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 rotate-[-10deg] items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Send className="size-5" />
              </div>

              <span className="text-2xl font-bold tracking-tight">
                PayPilot
              </span>
            </div>

            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <ShieldCheck className="size-4" />
              Secure payment powered by Stripe
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
            <ProductSummary paymentLink={pageData.paymentLink} />

            <PaymentForm paymentLink={pageData.paymentLink} />
          </div>

          <footer className="mt-8 text-center text-sm text-muted-foreground">
            {pageData.paymentLink.supportEmail && (
              <p>
                Need help? Contact us at{" "}
                <a
                  href={`mailto:${pageData.paymentLink.supportEmail}`}
                  className="font-medium text-primary hover:underline"
                >
                  {pageData.paymentLink.supportEmail}
                </a>
              </p>
            )}

            <p className="mt-2">
              © {new Date().getFullYear()} PayPilot. All rights reserved.
            </p>
          </footer>
        </div>
      </main>
    </Elements>
  );
}

function PaymentPageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />

        <p className="mt-4 text-sm text-muted-foreground">
          Loading secure payment page...
        </p>
      </div>
    </main>
  );
}

type PaymentPageErrorProps = {
  message: string;
};

function PaymentPageError({ message }: PaymentPageErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="size-4" />

        <AlertTitle>Payment page unavailable</AlertTitle>

        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </main>
  );
}
