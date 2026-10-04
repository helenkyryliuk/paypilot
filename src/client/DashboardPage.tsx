import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { ExternalLink, LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar.tsx";
import { CopyLinkInput } from "./CopyLinkInput.tsx";
import {
  deletePaymentLink,
  getPaymentLinks,
  updatePaymentLinkStatus,
  type PaymentLink,
} from "../api/paymentLinks.api.ts";

function formatAmount(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

export function DashboardPage() {
  const location = useLocation();
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    getPaymentLinks()
      .then(setPaymentLinks)
      .catch((err) => {
        console.error("Failed to load payment links:", err);
        setError("Unable to load your payment links. Please try again.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleToggleStatus(paymentLink: PaymentLink) {
    setPendingId(paymentLink.id);
    setError(null);

    try {
      const updated = await updatePaymentLinkStatus(
        paymentLink.id,
        !paymentLink.isActive,
      );

      setPaymentLinks((links) =>
        links.map((link) =>
          link.id === updated.id
            ? { ...link, isActive: updated.isActive }
            : link,
        ),
      );
    } catch (err) {
      console.error("Failed to update payment link:", err);
      setError("Unable to update the payment link.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(paymentLink: PaymentLink) {
    if (!window.confirm(`Delete "${paymentLink.productName}"?`)) {
      return;
    }

    setPendingId(paymentLink.id);
    setError(null);

    try {
      await deletePaymentLink(paymentLink.id);
      setPaymentLinks((links) =>
        links.filter((link) => link.id !== paymentLink.id),
      );
    } catch (err) {
      console.error("Failed to delete payment link:", err);
      // Links with payments can't be deleted (the database restricts it),
      // so suggest deactivating instead.
      setError(
        "Unable to delete this payment link. Links that already have payments can be deactivated instead.",
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar pathname={location.pathname} />
      <SidebarInset>
        <main>
          <h2 className="create-payment-header">
            Dashboard <LayoutDashboard className="mt-2" />
          </h2>
          <div className="create-payment-description">
            All your payment links, their status and how much they have earned.
          </div>

          <div className="m-7 mt-5 flex flex-col gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} className="h-56 w-full rounded-xl" />
                ))}
              </div>
            ) : paymentLinks.length === 0 && !error ? (
              <Card className="w-full sm:max-w-md">
                <CardHeader>
                  <CardTitle>No payment links yet</CardTitle>
                  <CardDescription>
                    Create your first payment link and share it with your
                    customers.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link to="/create-payment" className={buttonVariants()}>
                    <Plus /> Create payment link
                  </Link>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paymentLinks.map((paymentLink) => {
                  const checkoutUrl = `${window.location.origin}/pay/${paymentLink.slug}`;
                  const isPending = pendingId === paymentLink.id;

                  return (
                    <Card key={paymentLink.id} className="w-full">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle>{paymentLink.productName}</CardTitle>
                          <span
                            className={
                              paymentLink.isActive
                                ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                                : "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                            }
                          >
                            {paymentLink.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <CardDescription>
                          {paymentLink.description ?? "No description"}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-col gap-3">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-gray-500">Price</div>
                            <div className="font-semibold">
                              {formatAmount(
                                paymentLink.amount,
                                paymentLink.currency,
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Payments</div>
                            <div className="font-semibold">
                              {paymentLink.totalPayments ?? 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Revenue</div>
                            <div className="font-semibold">
                              {formatAmount(
                                paymentLink.revenue ?? 0,
                                paymentLink.currency,
                              )}
                            </div>
                          </div>
                        </div>

                        <CopyLinkInput value={checkoutUrl} />
                      </CardContent>

                      <CardFooter className="flex gap-2">
                        <a
                          href={checkoutUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          <ExternalLink /> Open
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleToggleStatus(paymentLink)}
                        >
                          {paymentLink.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleDelete(paymentLink)}
                          aria-label={`Delete ${paymentLink.productName}`}
                        >
                          <Trash2 />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
