import { Router } from "express";
import {
  createPaymentLink,
  deletePaymentLink,
  getPaymentLinks,
  updatePaymentLinkStatus,
} from "../controllers/paymentLinks.controller.ts";
import { getPublicPaymentPage } from "../controllers/payments.controller.ts";

const router = Router();

router.post("/", createPaymentLink);
router.get("/", getPaymentLinks);

// router.post("/:slug/success", createPaymentIntent);
router.get("/:slug", getPublicPaymentPage);

router.patch("/:id/status", updatePaymentLinkStatus);
router.delete("/:id", deletePaymentLink);

export default router;
