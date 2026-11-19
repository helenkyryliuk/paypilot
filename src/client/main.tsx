import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { CreatePaymentPage } from "./CreatePaymentPage.tsx";
import { DashboardPage } from "./DashboardPage.tsx";
import { AnalyticsPage } from "./AnalyticsPage.tsx";
import { LandingPage } from "./LandingPage.tsx";
import { PublicPaymentPage } from "./payment/PublicPaymentPage.tsx";
import { PaymentSuccessPage } from "./payment/PaymentSuccessPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
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
  // {
  //   path: "*", // Catch-all route for 404 pages
  //   element: <NotFound />,
  // },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
