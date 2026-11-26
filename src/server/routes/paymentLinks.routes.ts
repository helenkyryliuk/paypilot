import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import {
  createPaymentLink,
  deletePaymentLink,
  getPaymentLinks,
  updatePaymentLinkStatus,
} from "../controllers/paymentLinks.controller.js";
import {
  getPaymentConfirmation,
  getPublicPaymentPage,
} from "../controllers/payments.controller.js";

const router = Router();

// Demo mode: visitors can create links and pay, but can't change or delete
// the sample data. The dashboard hides those buttons too, but hiding a button
// doesn't stop someone calling the API directly, so the API enforces it.
// One variable controls both: Vercel exposes VITE_* variables to the server
// at runtime as well as building them into the frontend.
function blockInDemoMode(
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (process.env.VITE_DEMO_MODE === "true") {
    response.status(403).json({
      message: "This action is turned off in the demo.",
    });
    return;
  }

  next();
}

router.post("/", createPaymentLink);
router.get("/", getPaymentLinks);

router.get("/:slug/payments/:paymentIntentId", getPaymentConfirmation);
router.get("/:slug", getPublicPaymentPage);

router.patch("/:id/status", blockInDemoMode, updatePaymentLinkStatus);
router.delete("/:id", blockInDemoMode, deletePaymentLink);

export default router;
