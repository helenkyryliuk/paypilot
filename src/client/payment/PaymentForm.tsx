import { useState, type SubmitEvent } from "react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicPaymentLink } from "@/types/payment-link";

type PaymentFormProps = {
  paymentLink: PublicPaymentLink;
};

const paymentElementOptions: StripePaymentElementOptions = {
  layout: {
    type: "tabs",
    defaultCollapsed: false,
  },

  fields: {
    billingDetails: {
      name: "never",
      email: "never",
      address: "if_required",
    },
  },
};

export function PaymentForm({ paymentLink }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const formattedAmount = new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: paymentLink.currency.toUpperCase(),
  }).format(paymentLink.amount);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const trimmedName = customerName.trim();
    const trimmedEmail = customerEmail.trim();

    if (!trimmedName || !trimmedEmail) {
      setErrorMessage("Enter your name and email address to continue.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(undefined);

    const returnUrl = new URL(
      `/pay/${paymentLink.slug}/success`,
      window.location.origin,
    );

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,

      confirmParams: {
        return_url: returnUrl.toString(),

        payment_method_data: {
          billing_details: {
            name: trimmedName,
            email: trimmedEmail,
          },
        },
      },

      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "Your payment could not be completed.");
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      window.location.assign(
        `/pay/${paymentLink.slug}/success?payment_intent=${paymentIntent.id}`,
      );
      return;
    }

    if (paymentIntent?.status === "processing") {
      window.location.assign(
        `/pay/${paymentLink.slug}/success?payment_intent=${paymentIntent.id}`,
      );
      return;
    }

    setErrorMessage("Your payment has not been completed. Please try again.");
    setIsSubmitting(false);
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="px-6 pb-2 pt-7 sm:px-10 sm:pt-10">
        <CardTitle className="text-2xl sm:text-3xl">
          Complete your payment
        </CardTitle>

        <CardDescription className="text-base">
          Enter your details below to complete your purchase.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-8 pt-6 sm:px-10 sm:pb-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="customer-email">Email address</Label>

            <div className="relative">
              <Mail
                aria-hidden="true"
                className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                id="customer-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-12 pl-12"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Payment information</Label>

            <div className="rounded-lg border bg-background p-4">
              <PaymentElement options={paymentElementOptions} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-name">Cardholder name</Label>

            <div className="relative">
              <UserRound
                aria-hidden="true"
                className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                id="customer-name"
                type="text"
                autoComplete="cc-name"
                placeholder="Name on card"
                className="h-12 pl-12"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />

              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            size="lg"
            className="h-14 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-base shadow-sm hover:from-violet-700 hover:to-indigo-700"
            disabled={!stripe || !elements || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-5 animate-spin" />
                Processing payment...
              </>
            ) : (
              <>
                <LockKeyhole className="size-5" />
                Pay NZD {formattedAmount.replace("NZ$", "$")}
              </>
            )}
          </Button>

          {paymentLink.productUrl && (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-primary"
              disabled={isSubmitting}
              onClick={() => {
                window.location.assign(paymentLink.productUrl!);
              }}
            >
              <ArrowLeft className="size-4" />
              Back to product
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
