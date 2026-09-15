import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import * as z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldSeparator } from "@/components/ui/field";
import { LockKeyholeIcon } from "lucide-react";

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 5 characters.")
    .max(32, "Bug title must be at most 32 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
});

export function OnlinePaymentForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: "http://localhost:5000/complete",
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise,  customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL,  customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "accordion",
  };

  return (
    <Card className="w-full sm:max-w-md m-7 mb-9 mt-5">
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>
          <FieldSeparator className="m-1" />
          <div>
            <LockKeyholeIcon /> Secure payment{" "}
          </div>
          Your payment information are encrypted and secure.{" "}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="payment-form" onSubmit={handleSubmit}>
          <PaymentElement
            id="payment-element"
            options={paymentElementOptions}
          />
          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              form="form-rhf-demo"
              className="w-full"
              disabled={isLoading || !stripe || !elements}
              id="submit"
              onClick={handleSubmit}
            >
              {isLoading ? (
                <div className="spinner" id="spinner"></div>
              ) : (
                "Pay now"
              )}
            </Button>
          </CardFooter>
          {/* Show any error or success messages */}
          {message && <div id="payment-message">{message}</div>}
        </form>
      </CardContent>
    </Card>
  );
}
