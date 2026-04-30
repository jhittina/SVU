const express = require("express");
const {
  challen,
  getAllSales,
  downloadChallanPdf,
  deleteChallen,
  getStock,
  getDashboard,
} = require("../controller/sale");
const { requiredsignin } = require("../common-middleware/index");
const router = express.Router();

router.post("/challen", requiredsignin, challen);
router.get("/sales", requiredsignin, getAllSales);
router.get("/challenPdf", requiredsignin, downloadChallanPdf);
router.delete("/challen", requiredsignin, deleteChallen);
router.get("/stock", requiredsignin, getStock);
router.get("/dashboard", requiredsignin, getDashboard);

module.exports = router;
