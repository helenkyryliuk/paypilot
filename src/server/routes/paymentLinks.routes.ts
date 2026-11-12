import { Router } from "express";
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

router.post("/", createPaymentLink);
router.get("/", getPaymentLinks);

router.get("/:slug/payments/:paymentIntentId", getPaymentConfirmation);
router.get("/:slug", getPublicPaymentPage);

router.patch("/:id/status", updatePaymentLinkStatus);
router.delete("/:id", deletePaymentLink);

export default router;
