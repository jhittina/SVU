const shortid = require("shortid");
const { getPaginatedData } = require("../common-function/pagination");
const bill = require("../models/bill");
const sale = require("../models/sale");
const PDFDocument = require("pdfkit");
const createLogger = require("../lib/bunyan");
const serviceName = "Bill Service";
const loggers = createLogger(serviceName);

// Get confirmed challans within a date range (for bill generation preview)
exports.getChallansForBill = async (req, res) => {
  try {
    const { dateFrom, dateTo, customerId } = req.query;

    if (!dateFrom || !dateTo) {
      return res
        .status(400)
        .json({ Message: "dateFrom and dateTo are required" });
    }

    // Get all challan IDs that are already in generated bills
    const generatedBills = await bill.find({ status: "generated" });
    const billedChallanIds = new Set();
    generatedBills.forEach((b) => {
      b.billItems.forEach((item) => {
        billedChallanIds.add(item.challanId);
      });
    });

    const filter = {
      status: "confirmed",
      date: {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      },
      _id: { $nin: Array.from(billedChallanIds) }, // Exclude already billed challans
    };

    if (customerId) {
      // Find customer name from sale records
      const sampleSale = await sale.findOne({ customerId });
      if (sampleSale) {
        filter.customerName = sampleSale.customerName;
      }
    }

    const challans = await sale.find(filter).sort({ date: 1 });

    // Group by customer
    const groupedByCustomer = {};
    challans.forEach((challan) => {
      if (!groupedByCustomer[challan.customerName]) {
        groupedByCustomer[challan.customerName] = [];
      }
      groupedByCustomer[challan.customerName].push(challan);
    });

    res.status(200).json({ data: groupedByCustomer });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "Something Went Wrong ...!" });
  }
};

// Create or update a bill
exports.createBill = async (req, res) => {
  try {
    const id = req.query.id;
    const {
      dateFrom,
      dateTo,
      customerName,
      customerId,
      challanIds = [],
      status = "draft",
      notes,
    } = req.body;

    // If creating new bill, fetch challans
    if (!id && challanIds.length === 0) {
      return res
        .status(400)
        .json({ Message: "Challan IDs are required for new bill" });
    }

    let billItems = [];
    let totalAmount = 0;

    if (!id || (challanIds && challanIds.length > 0)) {
      // Fetch confirmed challans
      const challans = await sale.find({
        _id: { $in: challanIds },
        status: "confirmed",
      });

      if (challans.length === 0) {
        return res
          .status(404)
          .json({ Message: "No confirmed challans found for given IDs" });
      }

      // Build bill items from challans
      challans.forEach((challan) => {
        challan.saleDetail.forEach((detail) => {
          billItems.push({
            challanId: challan._id,
            challanDate: challan.date,
            brickName: detail.brickName,
            quantity: detail.quantity,
            rate: detail.rate,
            amount: detail.amount,
          });
          totalAmount += detail.amount;
        });
      });
    }

    let savedBill;
    if (id) {
      // Update existing bill
      const updateData = { status, notes };
      if (billItems.length > 0) {
        updateData.billItems = billItems;
        updateData.totalAmount = totalAmount;
      }
      await bill.updateOne({ _id: id }, { $set: updateData });
      savedBill = await bill.findById(id);
    } else {
      // Create new bill
      const billNumber = `BILL-${Date.now()}`;
      const newBill = new bill({
        _id: `SVU-BILL-${shortid.generate()}`,
        billNumber,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        customerName,
        customerId: customerId || undefined,
        status,
        totalAmount,
        billItems,
        notes,
      });
      savedBill = await newBill.save();
    }

    res.status(200).json({ data: savedBill });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "Something Went Wrong ...!" });
  }
};

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const status = req.query.status; // optional filter by status

    const filter = {};
    if (status) filter.status = status;

    const result = await getPaginatedData(bill, {
      page,
      limit,
      search,
      searchFields: ["billNumber", "customerName", "_id"],
      filter,
      sort: { createdAt: -1 },
    });

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "Something Went Wrong ...!" });
  }
};

// Download bill PDF
exports.downloadBillPdf = async (req, res) => {
  try {
    const id = req.query.id;
    const billDoc = await bill.findById(id);
    if (!billDoc) return res.status(404).json({ Message: "Bill not found" });

    const pdfData = generateBillPdf(billDoc.toObject());
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bill-${billDoc.billNumber}.pdf"`,
    );
    pdfData.pipe(res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "Something Went Wrong ...!" });
  }
};

// Delete a bill
exports.deleteBill = async (req, res) => {
  try {
    const id = req.query.id;
    await bill.deleteOne({ _id: id });
    res.status(200).json({ Message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ Message: "Something Went Wrong ...!" });
  }
};

// Helper function to generate bill PDF
function generateBillPdf(data) {
  let doc = new PDFDocument({ margin: 30, size: "A4" });
  doc.font("Helvetica-Bold");

  // Header
  doc
    .fontSize(16)
    .text("SAMARTH VEET UDYOG", { align: "center" })
    .fontSize(10)
    .text("Fly ash Bricks & Pavers Blocks Manufactures & Sales", {
      align: "center",
    })
    .fontSize(8)
    .moveDown(0.5)
    .text(
      "chandak Mala, near SRPF Camp, Vijapur Road Solapur Phone: 9923949492, 9011628663",
      { align: "center" },
    )
    .moveDown()
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke()
    .moveDown();

  // Bill details
  doc
    .fontSize(14)
    .text(`BILL / INVOICE`, { align: "center" })
    .moveDown()
    .fontSize(10)
    .text(`Bill Number: ${data.billNumber}`, 50)
    .text(
      `Period: ${new Date(data.dateFrom).toLocaleDateString()} - ${new Date(data.dateTo).toLocaleDateString()}`,
      50,
    )
    .text(`Customer: ${data.customerName}`, 50)
    .text(`Status: ${data.status.toUpperCase()}`, 50)
    .moveDown();

  // Watermark based on status
  if (data.status === "draft") {
    doc
      .save()
      .fontSize(60)
      .fillOpacity(0.1)
      .text("DRAFT", 150, 250, { width: 300, align: "center" })
      .restore();
  }

  // Table header
  const tableTop = doc.y;
  doc
    .fontSize(10)
    .text("Date", 50, tableTop)
    .text("Challan ID", 105, tableTop)
    .text("Brick Type", 230, tableTop)
    .text("Qty", 360, tableTop, { width: 60, align: "right" })
    .text("Rate", 430, tableTop, { width: 50, align: "right" })
    .text("Amount", 490, tableTop, { width: 60, align: "right" });

  doc
    .moveTo(50, doc.y + 5)
    .lineTo(doc.page.width - 50, doc.y + 5)
    .stroke();

  let y = doc.y + 10;

  // Group items by challan for better readability
  const challanGroups = {};
  data.billItems.forEach((item) => {
    if (!challanGroups[item.challanId]) {
      challanGroups[item.challanId] = {
        date: item.challanDate,
        items: [],
      };
    }
    challanGroups[item.challanId].items.push(item);
  });

  // Render items
  doc.font("Helvetica");
  Object.keys(challanGroups).forEach((challanId) => {
    const group = challanGroups[challanId];

    group.items.forEach((item, idx) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc
        .fontSize(7)
        .text(
          idx === 0 ? new Date(group.date).toLocaleDateString("en-IN") : "",
          50,
          y,
        )
        .text(idx === 0 ? challanId : "", 105, y, { width: 120 })
        .text(item.brickName, 230, y)
        .text(item.quantity.toLocaleString("en-IN"), 360, y, {
          width: 60,
          align: "right",
        })
        .text(`₹${item.rate}`, 430, y, { width: 50, align: "right" })
        .text(`₹${item.amount.toLocaleString("en-IN")}`, 490, y, {
          width: 60,
          align: "right",
        });

      y += 20;
    });

    // Divider after each challan group
    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .strokeOpacity(0.3)
      .stroke()
      .strokeOpacity(1);
    y += 10;
  });

  // Total
  doc
    .moveTo(50, y)
    .lineTo(doc.page.width - 50, y)
    .stroke()
    .moveDown();

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(
      `TOTAL AMOUNT: ₹${data.totalAmount.toLocaleString("en-IN")}`,
      50,
      y + 10,
      {
        align: "right",
        width: doc.page.width - 100,
      },
    );

  // Notes
  if (data.notes) {
    doc
      .moveDown(2)
      .fontSize(10)
      .font("Helvetica")
      .text(`Notes: ${data.notes}`, 50, doc.y, { width: doc.page.width - 100 });
  }

  // Footer
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Customer Signature", 80, doc.page.height - 100, {
      align: "left",
      width: 200,
    })
    .text("Samarth Veet Udyog", doc.page.width - 230, doc.page.height - 100, {
      align: "right",
      width: 200,
    });

  doc.end();
  return doc;
}

module.exports = exports;
