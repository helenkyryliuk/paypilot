import { Controller, useForm } from "react-hook-form";
import { useLocation } from "react-router";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldSet } from "@/components/ui/field";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar.tsx";
import { useState } from "react";
import {
  Rocket,
  Check,
  Copy,
  Link,
  ExternalLink,
  Download,
  FileDown,
  ShieldCheck,
  Flag,
  BadgeDollarSign,
  UserRound,
} from "lucide-react";
import { CopyLinkInput } from "./CopyLinkInput.tsx";
import { createPaymentLink } from "../api/paymentLinks.api.ts";
import ReactCountryFlag from "react-country-flag";
import { ButtonGroup } from "@/components/ui/button-group";
import { buttonVariants } from "@/components/ui/button";
import { CreatePaymentBanner } from "./CreatePaymentBanner.tsx";
import { Separator } from "@/components/ui/separator";
import { SummaryRow } from "./payment/SummaryRow.tsx";

const formSchema = z.object({
  productName: z
    .string()
    .min(5, "Product name must be at least 5 characters.")
    .max(32, "Product name must be at most 32 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
  downloadUrl: z
    .string()
    .min(5, "Download URL must be at least 5 characters.")
    .max(32, "Download URL must be at most 32 characters."),
  amount: z.number().min(1, "Amount must be more than 0."),
  currency: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePaymentPage() {
  const [slug, setSlug] = useState<String>();
  const location = useLocation();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isSubmitted, isSubmitSuccessful },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      description: "",
      downloadUrl: "",
      amount: 0,
      currency: "nzd",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data);
    const response = await createPaymentLink({
      productName: data.productName,
      description: data.description,
      amount: Math.round(data.amount * 100),
      currency: data.currency,
      downloadUrl: data.downloadUrl,
    });
    setSlug(response.slug);
  };

  const pnCreateAnotherPaymentLink = () => {
    setSlug("");
  };
  const watchAllFields = watch();
  return (
    <SidebarProvider>
      <AppSidebar pathname={location.pathname} />
      <SidebarInset>
        <main>
          <h2 className="create-payment-header">
            Create Payment <Rocket className="online-payment-rocket-icon" />
          </h2>

          <div className="create-payment-description">
            Create a payment link for your digital product and start getting
            paid.
          </div>

          <div className="flex flex-row items-start gap-4 w-full">
            {isSubmitSuccessful && slug ? (
              <div className="max-w-xl mx-auto my-8 p-8 bg-white border border-gray-100 rounded-2xl shadow-sm font-sans">
                <div className="flex items-start gap-3 mb-6">
                  <div className="flex">
                    <div className="icon-circle-wrapper">
                      <Link className="online-payment-link-icon" />
                    </div>
                    <div className="">
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">
                        Payment link created!
                      </h2>
                      <p className="text-gray-500 text-sm mt-0.5 leading-normal">
                        Share this link with your customer to collect payment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-900  tracking-wide mb-2">
                    Checkout URL
                  </label>
                  <ButtonGroup className="w-full">
                    <Input value={`http://localhost:5000/pay/${slug}`} />
                    <Button variant="outline" aria-label="Search">
                      <Copy />
                    </Button>
                  </ButtonGroup>
                </div>
                <a
                  href={`/pay/${slug}`}
                  className={`${buttonVariants({ variant: "outline" })} w-full link`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Checkout <ExternalLink />
                </a>
                <Button
                  className="w-full mt-5"
                  onClick={pnCreateAnotherPaymentLink}
                >
                  Create another payment link
                </Button>
              </div>
            ) : (
              <Card className="w-full sm:max-w-md m-7 mb-9 mt-5">
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                    Enter the payment information and configure your link.
                  </CardDescription>
                </CardHeader>
                {/* <CopyLinkInput /> */}
                <CardContent>
                  <form id="form-rhf-demo" onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                      <FieldSet>
                        <FieldGroup>
                          <div className="grid grid-cols-2 gap-4">
                            <Controller
                              name="amount"
                              control={control}
                              render={({ field, fieldState }) => (
                                <Field
                                  data-invalid={fieldState.invalid}
                                  className="flex-3"
                                >
                                  <FieldLabel htmlFor="form-rhf-demo-title">
                                    Amount
                                  </FieldLabel>
                                  <InputGroup>
                                    <InputGroupAddon>
                                      <InputGroupText>$</InputGroupText>
                                    </InputGroupAddon>
                                    <InputGroupInput
                                      {...field}
                                      id="number"
                                      type="number"
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        // Keep it as a number if valid, or null/empty string if blank
                                        field.onChange(
                                          val === "" ? "" : Number(val),
                                        );
                                      }}
                                      aria-invalid={fieldState.invalid}
                                      placeholder="0.00"
                                      // autoComplete="off"
                                    />
                                  </InputGroup>

                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />

                            <Controller
                              name="currency"
                              control={control}
                              render={({ field }) => (
                                <Field className="flex-1">
                                  <FieldLabel htmlFor="form-rhf-demo-title">
                                    Currency
                                  </FieldLabel>
                                  <Select defaultValue="nzd">
                                    <SelectTrigger className="w-[200px] gap-2">
                                      <SelectValue placeholder="Select currency">
                                        <div className="flex items-center gap-2">
                                          <ReactCountryFlag
                                            countryCode="NZ"
                                            svg
                                            style={{
                                              width: "1.5em",
                                              height: "1.5em",
                                            }}
                                          />

                                          <span>NZD</span>
                                        </div>
                                      </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                      <SelectItem value="nzd">
                                        NZD New Zealand Dollar
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </Field>
                              )}
                            />
                          </div>
                          <Controller
                            name="productName"
                            control={control}
                            render={({ field, fieldState }) => (
                              <Field
                                data-invalid={fieldState.invalid}
                                className="flex-2"
                              >
                                <FieldLabel htmlFor="form-rhf-demo-title">
                                  Payment for
                                </FieldLabel>
                                <Input
                                  {...field}
                                  id="form-rhf-demo-title"
                                  aria-invalid={fieldState.invalid}
                                  placeholder="Enter a product or service"
                                  autoComplete="off"
                                />
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />
                        </FieldGroup>
                      </FieldSet>

                      <FieldSet>
                        <FieldGroup>
                          <Controller
                            name="description"
                            control={control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-demo-description">
                                  Description
                                </FieldLabel>
                                <InputGroup>
                                  <InputGroupTextarea
                                    {...field}
                                    id="form-rhf-demo-description"
                                    placeholder="What is this payment for?"
                                    rows={6}
                                    className="min-h-24 resize-none"
                                    aria-invalid={fieldState.invalid}
                                  />
                                  <InputGroupAddon align="block-end">
                                    <InputGroupText className="tabular-nums">
                                      {field.value.length}/100 characters
                                    </InputGroupText>
                                  </InputGroupAddon>
                                </InputGroup>
                                <FieldDescription>
                                  This will appear on the payment page and in
                                  receipts.
                                </FieldDescription>
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />
                          <Controller
                            name="downloadUrl"
                            control={control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-demo-title">
                                  Download URL
                                </FieldLabel>
                                <Input
                                  {...field}
                                  id="form-rhf-demo-title"
                                  aria-invalid={fieldState.invalid}
                                  placeholder="Login button not working on mobile"
                                  autoComplete="off"
                                />
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />
                        </FieldGroup>
                      </FieldSet>
                    </FieldGroup>
                  </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    form="form-rhf-demo"
                    className="w-full"
                    disabled={isSubmitting}
                    id="submit"
                  >
                    {isSubmitting ? (
                      <div className="spinner" id="spinner"></div>
                    ) : (
                      "Create payment"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
            <div>
              <div className="w-120">
                <div className="browser">
                  <div className="browser-header">
                    <div className="browser-controls">
                      <span className="dot red"></span>
                      <span className="dot yellow"></span>
                      <span className="dot green"></span>
                    </div>
                  </div>
                  <div className="flex h-full flex-col p-6 sm:p-8">
                    <div className="flex flex-1 flex-col">
                      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/8">
                        <div className="relative flex size-10 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                          <FileDown className="size-5" />

                          <span className="absolute -bottom-2 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Download className="size-2" />
                          </span>
                        </div>
                      </div>

                      <div className="mt-7 text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                          Product name
                        </h2>

                        <div className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                          {watchAllFields.description ??
                            "Payment link description"}
                        </div>
                      </div>

                      <Separator className="my-8" />

                      <dl className="space-y-5">
                        <SummaryRow
                          icon={<BadgeDollarSign className="size-4" />}
                          label="Amount"
                          value={`NZD $${watchAllFields.amount.toFixed(2)}`}
                        />

                        <SummaryRow
                          icon={<Flag className="size-4" />}
                          label="Product"
                          value={watchAllFields.productName}
                        />

                        <SummaryRow
                          icon={<Download className="size-4" />}
                          label="Type"
                          value={`Digital Download`}
                        />

                        <SummaryRow
                          icon={<UserRound className="size-4" />}
                          label="Seller"
                          value={`Helen`}
                        />
                      </dl>
                    </div>

                    <Separator className="my-8" />

                    <div className="flex gap-3">
                      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

                      <div>
                        <p className="text-sm font-semibold">Secure checkout</p>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Your payment information is encrypted and securely
                          processed by Stripe.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="browser-footer"></div>
                </div>
              </div>
              <CreatePaymentBanner />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
