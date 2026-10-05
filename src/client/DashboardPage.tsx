import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Check,
  Copy,
  ExternalLink,
  LayoutDashboard,
  Plus,
  Trash2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar.tsx";
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

function CopyLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy link"}
    >
      {copied ? <Check className="text-green-600" /> : <Copy />}
    </Button>
  );
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
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} className="h-12 w-full" />
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
              <Card>
                <CardHeader>
                  <CardTitle>Payment links</CardTitle>
                  <CardDescription>
                    Payments and revenue include completed payments only.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Payments</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentLinks.map((paymentLink) => {
                        const checkoutUrl = `${window.location.origin}/pay/${paymentLink.slug}`;
                        const isPending = pendingId === paymentLink.id;

                        return (
                          <TableRow key={paymentLink.id}>
                            <TableCell>
                              <div className="font-medium">
                                {paymentLink.productName}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                /pay/{paymentLink.slug}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  paymentLink.isActive ? "default" : "secondary"
                                }
                              >
                                {paymentLink.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatAmount(
                                paymentLink.amount,
                                paymentLink.currency,
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {paymentLink.totalPayments ?? 0}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatAmount(
                                paymentLink.revenue ?? 0,
                                paymentLink.currency,
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                paymentLink.createdAt,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <CopyLinkButton value={checkoutUrl} />
                                <a
                                  href={checkoutUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label="Open checkout page"
                                  className={buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                  })}
                                >
                                  <ExternalLink />
                                </a>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isPending}
                                  onClick={() =>
                                    handleToggleStatus(paymentLink)
                                  }
                                >
                                  {paymentLink.isActive
                                    ? "Deactivate"
                                    : "Activate"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isPending}
                                  onClick={() => handleDelete(paymentLink)}
                                  aria-label={`Delete ${paymentLink.productName}`}
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
