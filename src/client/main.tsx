import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate } from "react-router";
import type { RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { CreatePaymentPage } from "./CreatePaymentPage.tsx";
import { DashboardPage } from "./DashboardPage.tsx";
import { AnalyticsPage } from "./AnalyticsPage.tsx";
import { LandingPage } from "./LandingPage.tsx";
import { PublicPaymentPage } from "./payment/PublicPaymentPage.tsx";
import { PaymentSuccessPage } from "./payment/PaymentSuccessPage.tsx";
import { isAppEnabled } from "./lib/featureFlags.ts";

// While the app is off (see lib/featureFlags.ts), production serves only the
// landing page and every other address redirects to it.
const appRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/create-payment",
    element: <CreatePaymentPage />,
  },
  {
    path: "/pay/:slug",
    element: <PublicPaymentPage />,
  },
  {
    path: "/analytics",
    element: <AnalyticsPage />,
  },
  {
    path: "/pay/:slug/success",
    element: <PaymentSuccessPage />,
  },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  ...(isAppEnabled ? appRoutes : []),
  // Any unknown address (or an app page while the app is off) goes home.
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
