const express = require("express");
const router = express.Router();
const { requiredsignin } = require("../common-middleware/index");
const billController = require("../controller/bill");

// Get challans for bill generation (preview)
router.get(
  "/challans-for-bill",
  requiredsignin,
  billController.getChallansForBill,
);

// Create or update bill
router.post("/bill", requiredsignin, billController.createBill);

// Get all bills
router.get("/bills", requiredsignin, billController.getAllBills);

// Download bill PDF
router.get("/billPdf", requiredsignin, billController.downloadBillPdf);

// Delete bill
router.delete("/bill", requiredsignin, billController.deleteBill);

module.exports = router;
