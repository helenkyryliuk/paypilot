import { useLocation } from "react-router";
import { ChartNoAxesCombined } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar.tsx";

// Placeholder until the analytics charts are built.
export function AnalyticsPage() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <AppSidebar pathname={location.pathname} />
      <SidebarInset>
        <main>
          <h2 className="create-payment-header">
            Analytics{" "}
            <ChartNoAxesCombined className="online-payment-rocket-icon" />
          </h2>
          <div className="create-payment-description">
            Revenue and sales trends across your payment links.
          </div>

          <Card className="m-7 mt-5 w-full sm:max-w-md">
            <CardHeader>
              <CardTitle>Coming soon</CardTitle>
              <CardDescription>
                Charts for revenue, payments over time and your best-selling
                links are in progress. For now, the Dashboard shows payments and
                revenue for each link.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
