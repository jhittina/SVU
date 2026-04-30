const express = require("express");
const router = express.Router();
const { requiredsignin } = require("../common-middleware/index");
const paymentController = require("../controller/payment");

// Create payment
router.post("/payment", requiredsignin, paymentController.createPayment);

// Get payments for a reference
router.get("/payments", requiredsignin, paymentController.getPayments);

// Delete payment
router.delete("/payment", requiredsignin, paymentController.deletePayment);

// Customer payment summary
router.get(
  "/payment/customer-summary",
  requiredsignin,
  paymentController.getCustomerPaymentSummary,
);

// Supplier payment summary
router.get(
  "/payment/supplier-summary",
  requiredsignin,
  paymentController.getSupplierPaymentSummary,
);

// Vehicle payment summary
router.get(
  "/payment/vehicle-summary",
  requiredsignin,
  paymentController.getVehiclePaymentSummary,
);

// Worker salary payment summary
router.get(
  "/payment/worker-summary",
  requiredsignin,
  paymentController.getWorkerPaymentSummary,
);

// Maintenance payment summary
router.get(
  "/payment/maintenance-summary",
  requiredsignin,
  paymentController.getMaintenancePaymentSummary,
);

// Pending overview (all types)
router.get(
  "/payment/pending-overview",
  requiredsignin,
  paymentController.getPendingOverview,
);

module.exports = router;
