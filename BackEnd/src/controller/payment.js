const shortid = require("shortid");
const Payment = require("../models/payment");
const Bill = require("../models/bill");
const CementRaw = require("../models/cementRawMatirial");
const FlyAshRaw = require("../models/flyAshRawMatirial");
const PondAshRaw = require("../models/pondAshRawMatirial");
const DustPowderRaw = require("../models/dustAndPowderRawMatirial");
const ChemicalRaw = require("../models/chemicalRawMatirial");
const DailyTransport = require("../models/dailyTransportDetail");
const WorkerSalary = require("../models/workerSalary");
const MaintainesCost = require("../models/maintainesCost");
const createLogger = require("../lib/bunyan");
const serviceName = "Payment Service";
const loggers = createLogger(serviceName);

// Create a payment
exports.createPayment = async (req, res) => {
  try {
    const {
      type,
      referenceId,
      referenceName,
      amount,
      date,
      paymentMethod,
      note,
    } = req.body;

    if (!type || !referenceId || !referenceName || !amount || !date) {
      return res.status(400).json({
        Message:
          "type, referenceId, referenceName, amount, and date are required",
      });
    }

    const payment = new Payment({
      type,
      referenceId,
      referenceName,
      amount: Number(amount),
      date,
      paymentMethod: paymentMethod || "cash",
      note: note || "",
    });

    await payment.save();
    loggers.info("Payment created", { id: payment._id });
    res.status(201).json({ data: payment });
  } catch (err) {
    loggers.error("Error creating payment", err);
    res.status(500).json({ Message: "Failed to create payment" });
  }
};

// Get payments for a specific reference (customer/supplier)
exports.getPayments = async (req, res) => {
  try {
    const { type, referenceId } = req.query;

    if (!type || !referenceId) {
      return res
        .status(400)
        .json({ Message: "type and referenceId are required" });
    }

    const payments = await Payment.find({ type, referenceId }).sort({
      date: -1,
    });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({ data: payments, totalPaid });
  } catch (err) {
    loggers.error("Error fetching payments", err);
    res.status(500).json({ Message: "Failed to fetch payments" });
  }
};

// Delete a payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ Message: "id is required" });

    await Payment.findByIdAndDelete(id);
    loggers.info("Payment deleted", { id });
    res.status(200).json({ Message: "Payment deleted" });
  } catch (err) {
    loggers.error("Error deleting payment", err);
    res.status(500).json({ Message: "Failed to delete payment" });
  }
};

// Get payment summary for a customer (total billed from Bills, total paid, pending)
exports.getCustomerPaymentSummary = async (req, res) => {
  try {
    const { customerId, customerName } = req.query;

    if (!customerId && !customerName) {
      return res
        .status(400)
        .json({ Message: "customerId or customerName is required" });
    }

    // Get total billed from bills (confirmed and generated)
    // Search by customerName (case-insensitive) since that's always stored in bills
    const billFilter = { status: { $in: ["confirmed", "generated"] } };
    if (customerName) {
      billFilter.customerName = {
        $regex: new RegExp(
          `^${customerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        ),
      };
    } else if (customerId) {
      billFilter.customerId = customerId;
    }

    const bills = await Bill.find(billFilter);
    const totalBilled = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Get total paid — check both referenceId (customerId) and referenceName (customerName)
    let payments;
    if (customerId) {
      payments = await Payment.find({
        type: "customer",
        $or: [
          { referenceId: customerId },
          {
            referenceName: {
              $regex: new RegExp(
                `^${customerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                "i",
              ),
            },
          },
        ],
      });
    } else {
      payments = await Payment.find({
        type: "customer",
        referenceName: {
          $regex: new RegExp(
            `^${customerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i",
          ),
        },
      });
    }
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const pending = totalBilled - totalPaid;

    res.status(200).json({
      totalBilled,
      totalPaid,
      pending,
      billCount: bills.length,
      paymentCount: payments.length,
    });
  } catch (err) {
    loggers.error("Error fetching customer payment summary", err);
    res.status(500).json({ Message: "Failed to fetch summary" });
  }
};

// Get payment summary for a supplier (total purchases from raw materials, total paid, pending)
exports.getSupplierPaymentSummary = async (req, res) => {
  try {
    const { supplierName } = req.query;

    if (!supplierName) {
      return res.status(400).json({ Message: "supplierName is required" });
    }

    // Sum all raw material purchases where name matches supplier
    const [cement, flyAsh, pondAsh, dustPowder, chemical] = await Promise.all([
      CementRaw.aggregate([
        { $match: { name: supplierName } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      FlyAshRaw.aggregate([
        { $match: { name: supplierName } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      PondAshRaw.aggregate([
        { $match: { name: supplierName } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      DustPowderRaw.aggregate([
        { $match: { name: supplierName } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      ChemicalRaw.aggregate([
        { $match: { name: supplierName } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalPurchases =
      (cement[0]?.total || 0) +
      (flyAsh[0]?.total || 0) +
      (pondAsh[0]?.total || 0) +
      (dustPowder[0]?.total || 0) +
      (chemical[0]?.total || 0);

    // Get total paid
    const payments = await Payment.find({
      type: "supplier",
      referenceName: supplierName,
    });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const pending = totalPurchases - totalPaid;

    res.status(200).json({
      totalPurchases,
      totalPaid,
      pending,
      paymentCount: payments.length,
    });
  } catch (err) {
    loggers.error("Error fetching supplier payment summary", err);
    res.status(500).json({ Message: "Failed to fetch summary" });
  }
};

// Get payment summary for a vehicle (total from dailyTransportDetail by vehicleNumber)
exports.getVehiclePaymentSummary = async (req, res) => {
  try {
    const { vehicleNumber } = req.query;

    if (!vehicleNumber) {
      return res.status(400).json({ Message: "vehicleNumber is required" });
    }

    // Sum all daily transport entries for this vehicle
    const result = await DailyTransport.aggregate([
      { $match: { vehicalNumber: vehicleNumber } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalTransport = result[0]?.total || 0;

    // Get total paid
    const payments = await Payment.find({
      type: "vehicle",
      referenceName: vehicleNumber,
    });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const pending = totalTransport - totalPaid;

    res.status(200).json({
      totalTransport,
      totalPaid,
      pending,
      paymentCount: payments.length,
    });
  } catch (err) {
    loggers.error("Error fetching vehicle payment summary", err);
    res.status(500).json({ Message: "Failed to fetch summary" });
  }
};

// Get payment summary for worker salary (total salary amount vs paid)
exports.getWorkerPaymentSummary = async (req, res) => {
  try {
    const { brickType, dateFrom, dateTo } = req.query;

    // Build date filter
    const match = {};
    if (brickType) match.typeOfBrick = brickType;
    if (dateFrom || dateTo) {
      match.date = {};
      if (dateFrom) match.date.$gte = new Date(dateFrom);
      if (dateTo) match.date.$lte = new Date(dateTo + "T23:59:59.999Z");
    }

    const result = await WorkerSalary.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalSalary = result[0]?.total || 0;

    // Get total paid (filtered by date range too)
    const paymentFilter = { type: "worker" };
    if (brickType) paymentFilter.referenceName = brickType;
    if (dateFrom || dateTo) {
      paymentFilter.date = {};
      if (dateFrom) paymentFilter.date.$gte = new Date(dateFrom);
      if (dateTo) paymentFilter.date.$lte = new Date(dateTo + "T23:59:59.999Z");
    }
    const payments = await Payment.find(paymentFilter);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const pending = totalSalary - totalPaid;

    res.status(200).json({
      totalSalary,
      totalPaid,
      pending,
      paymentCount: payments.length,
    });
  } catch (err) {
    loggers.error("Error fetching worker payment summary", err);
    res.status(500).json({ Message: "Failed to fetch summary" });
  }
};

// Get payment summary for maintenance (total maintenance cost vs paid)
exports.getMaintenancePaymentSummary = async (req, res) => {
  try {
    const { type, dateFrom, dateTo } = req.query;

    // Build date filter
    const match = {};
    if (type) match.type = type;
    if (dateFrom || dateTo) {
      match.date = {};
      if (dateFrom) match.date.$gte = new Date(dateFrom);
      if (dateTo) match.date.$lte = new Date(dateTo + "T23:59:59.999Z");
    }

    const result = await MaintainesCost.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalMaintenance = result[0]?.total || 0;

    // Get total paid (filtered by date range too)
    const paymentFilter = { type: "maintenance" };
    if (type) paymentFilter.referenceName = type;
    if (dateFrom || dateTo) {
      paymentFilter.date = {};
      if (dateFrom) paymentFilter.date.$gte = new Date(dateFrom);
      if (dateTo) paymentFilter.date.$lte = new Date(dateTo + "T23:59:59.999Z");
    }
    const payments = await Payment.find(paymentFilter);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const pending = totalMaintenance - totalPaid;

    res.status(200).json({
      totalMaintenance,
      totalPaid,
      pending,
      paymentCount: payments.length,
    });
  } catch (err) {
    loggers.error("Error fetching maintenance payment summary", err);
    res.status(500).json({ Message: "Failed to fetch summary" });
  }
};

// Get all pending amounts across all types with days-ago info
exports.getPendingOverview = async (req, res) => {
  try {
    const Customer = require("../models/customerDetail");
    const Supplier = require("../models/supplairDetail");
    const Vehicle = require("../models/vehicalDetail");

    const now = new Date();

    // ─── CUSTOMERS (money they owe us) ────────────────────────────────────────
    const customers = await Customer.find({});
    const customerPending = [];

    for (const cust of customers) {
      const billFilter = {
        status: { $in: ["confirmed", "generated"] },
        customerName: {
          $regex: new RegExp(
            `^${cust.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i",
          ),
        },
      };
      const bills = await Bill.find(billFilter).sort({ dateTo: -1 });
      const totalBilled = bills.reduce(
        (sum, b) => sum + (b.totalAmount || 0),
        0,
      );

      const payments = await Payment.find({
        type: "customer",
        referenceName: {
          $regex: new RegExp(
            `^${cust.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i",
          ),
        },
      });
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const pending = totalBilled - totalPaid;

      if (pending > 0) {
        const lastBill = bills[0];
        const lastDate = lastBill ? new Date(lastBill.dateTo) : null;
        const daysAgo = lastDate
          ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
          : null;

        customerPending.push({
          name: cust.name,
          id: cust._id,
          totalBilled,
          totalPaid,
          pending,
          lastDate: lastDate ? lastDate.toISOString() : null,
          daysAgo,
        });
      }
    }

    // ─── SUPPLIERS (money we owe them) ────────────────────────────────────────
    const suppliers = await Supplier.find({});
    const supplierPending = [];

    for (const sup of suppliers) {
      const [cement, flyAsh, pondAsh, dustPowder, chemical] = await Promise.all(
        [
          CementRaw.find({ name: sup.name }).sort({ date: -1 }).limit(1),
          FlyAshRaw.find({ name: sup.name }).sort({ date: -1 }).limit(1),
          PondAshRaw.find({ name: sup.name }).sort({ date: -1 }).limit(1),
          DustPowderRaw.find({ name: sup.name }).sort({ date: -1 }).limit(1),
          ChemicalRaw.find({ name: sup.name }).sort({ date: -1 }).limit(1),
        ],
      );

      const [cementSum, flyAshSum, pondAshSum, dustPowderSum, chemicalSum] =
        await Promise.all([
          CementRaw.aggregate([
            { $match: { name: sup.name } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
          FlyAshRaw.aggregate([
            { $match: { name: sup.name } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
          PondAshRaw.aggregate([
            { $match: { name: sup.name } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
          DustPowderRaw.aggregate([
            { $match: { name: sup.name } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
          ChemicalRaw.aggregate([
            { $match: { name: sup.name } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
        ]);

      const totalPurchases =
        (cementSum[0]?.total || 0) +
        (flyAshSum[0]?.total || 0) +
        (pondAshSum[0]?.total || 0) +
        (dustPowderSum[0]?.total || 0) +
        (chemicalSum[0]?.total || 0);

      const payments = await Payment.find({
        type: "supplier",
        referenceName: sup.name,
      });
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const pending = totalPurchases - totalPaid;

      if (pending > 0) {
        // Find most recent delivery date
        const allDates = [
          cement[0],
          flyAsh[0],
          pondAsh[0],
          dustPowder[0],
          chemical[0],
        ]
          .filter(Boolean)
          .map((d) => new Date(d.date || d.Date))
          .filter((d) => !isNaN(d));
        const lastDate = allDates.length
          ? new Date(Math.max(...allDates))
          : null;
        const daysAgo = lastDate
          ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
          : null;

        supplierPending.push({
          name: sup.name,
          id: sup._id,
          totalPurchases,
          totalPaid,
          pending,
          lastDate: lastDate ? lastDate.toISOString() : null,
          daysAgo,
        });
      }
    }

    // ─── VEHICLES (money we owe for transport) ────────────────────────────────
    const vehicles = await Vehicle.find({});
    const vehiclePending = [];

    for (const veh of vehicles) {
      const vehNum = veh.vehicleNumber || veh.vehicalNumber;
      const result = await DailyTransport.aggregate([
        { $match: { vehicalNumber: vehNum } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const totalTransport = result[0]?.total || 0;

      const payments = await Payment.find({
        type: "vehicle",
        referenceName: vehNum,
      });
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const pending = totalTransport - totalPaid;

      if (pending > 0) {
        const lastTrip = await DailyTransport.findOne({ vehicalNumber: vehNum })
          .sort({ date: -1 })
          .limit(1);
        const lastDate = lastTrip ? new Date(lastTrip.date) : null;
        const daysAgo = lastDate
          ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
          : null;

        vehiclePending.push({
          name: vehNum,
          id: veh._id,
          totalTransport,
          totalPaid,
          pending,
          lastDate: lastDate ? lastDate.toISOString() : null,
          daysAgo,
        });
      }
    }

    // ─── WORKERS (total salary pending) ───────────────────────────────────────
    const workerResult = await WorkerSalary.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalSalary = workerResult[0]?.total || 0;
    const workerPayments = await Payment.find({ type: "worker" });
    const workerPaid = workerPayments.reduce((sum, p) => sum + p.amount, 0);
    const workerPendingAmt = totalSalary - workerPaid;

    const lastSalaryEntry = await WorkerSalary.findOne().sort({ date: -1 });
    const workerLastDate = lastSalaryEntry
      ? new Date(lastSalaryEntry.date)
      : null;
    const workerDaysAgo = workerLastDate
      ? Math.floor((now - workerLastDate) / (1000 * 60 * 60 * 24))
      : null;

    // ─── MAINTENANCE (total maintenance pending) ──────────────────────────────
    const maintResult = await MaintainesCost.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalMaint = maintResult[0]?.total || 0;
    const maintPayments = await Payment.find({ type: "maintenance" });
    const maintPaid = maintPayments.reduce((sum, p) => sum + p.amount, 0);
    const maintPendingAmt = totalMaint - maintPaid;

    const lastMaintEntry = await MaintainesCost.findOne().sort({ date: -1 });
    const maintLastDate = lastMaintEntry ? new Date(lastMaintEntry.date) : null;
    const maintDaysAgo = maintLastDate
      ? Math.floor((now - maintLastDate) / (1000 * 60 * 60 * 24))
      : null;

    res.status(200).json({
      customers: customerPending.sort((a, b) => b.pending - a.pending),
      suppliers: supplierPending.sort((a, b) => b.pending - a.pending),
      vehicles: vehiclePending.sort((a, b) => b.pending - a.pending),
      worker: {
        totalSalary,
        totalPaid: workerPaid,
        pending: workerPendingAmt,
        lastDate: workerLastDate ? workerLastDate.toISOString() : null,
        daysAgo: workerDaysAgo,
      },
      maintenance: {
        totalCost: totalMaint,
        totalPaid: maintPaid,
        pending: maintPendingAmt,
        lastDate: maintLastDate ? maintLastDate.toISOString() : null,
        daysAgo: maintDaysAgo,
      },
    });
  } catch (err) {
    loggers.error("Error fetching pending overview", err);
    res.status(500).json({ Message: "Failed to fetch pending overview" });
  }
};
