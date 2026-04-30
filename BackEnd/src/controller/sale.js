const shortid = require("shortid");
const { getPaginatedData } = require("../common-function/pagination");
const customerDetail = require("../models/customerDetail");
const sale = require("../models/sale");
const production = require("../models/production");
const vehicalDetail = require("../models/vehicalDetail");
const { createChallen } = require("../lib/pdfkit");
const createLogger = require("../lib/bunyan");
const serviceName = "Sale Service";
const loggers = createLogger(serviceName);

// Create or update a challan
exports.challen = async (req, res) => {
  try {
    const id = req.query.id;
    const { saleDetail, status = "draft" } = req.body;

    let totalAmount = 0;
    if (saleDetail && saleDetail.length) {
      saleDetail.forEach((element, index) => {
        const amount = element.quantity * element.rate;
        saleDetail[index].amount = amount;
        totalAmount += amount;
      });
      req.body.totalAmount = totalAmount;
    }

    let savedSale;
    if (id) {
      await sale.updateOne({ _id: id }, { $set: req.body });
      savedSale = await sale.findById(id);
    } else {
      req.body.date = req.body.date ? new Date(req.body.date) : new Date();
      req.body._id = `SVU-${shortid.generate()}`;
      const _sale = new sale(req.body);
      savedSale = await _sale.save();
    }

    res.status(200).json({ data: savedSale });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "Something Went Wrong ...!" });
  }
};

// Get all sales/challans
exports.getAllSales = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const status = req.query.status; // optional filter by status

    const filter = {};
    if (status) filter.status = status;

    const result = await getPaginatedData(sale, {
      page,
      limit,
      search,
      searchFields: ["_id", "customerName", "vehicleNumber"],
      filter,
      sort: { date: -1, createdAt: -1 },
    });

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "Something Went Wrong ...!" });
  }
};

// Download PDF for a challan (two copies: client + owner)
exports.downloadChallanPdf = async (req, res) => {
  try {
    const id = req.query.id;
    const doc = await sale.findById(id);
    if (!doc) return res.status(404).json({ Message: "Challan not found" });
    const pdfData = createChallen(doc.toObject());
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="challan-${id}.pdf"`,
    );
    pdfData.pipe(res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "Something Went Wrong ...!" });
  }
};

// Delete a challan
exports.deleteChallen = async (req, res) => {
  try {
    const id = req.query.id;
    await sale.deleteOne({ _id: id });
    res.status(200).json({ Message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ Message: "Something Went Wrong ...!" });
  }
};

// Stock levels: total produced - total sold (confirmed challans only) per brick type
exports.getStock = async (req, res) => {
  try {
    // Sum produced per brick type
    const produced = await production.aggregate([
      { $group: { _id: "$type", total: { $sum: "$quantity" } } },
    ]);

    // Sum sold per brick type (only confirmed challans)
    const sold = await sale.aggregate([
      { $match: { status: "confirmed" } },
      { $unwind: "$saleDetail" },
      {
        $group: {
          _id: "$saleDetail.brickName",
          total: { $sum: "$saleDetail.quantity" },
        },
      },
    ]);

    // Build stock map
    const stock = {};
    produced.forEach((p) => {
      stock[p._id] = (stock[p._id] || 0) + p.total;
    });
    sold.forEach((s) => {
      stock[s._id] = (stock[s._id] || 0) - s.total;
    });

    // Convert to array, include zero-stock types
    const result = Object.entries(stock).map(([brickType, available]) => ({
      brickType,
      available: Math.max(0, available),
    }));

    res.status(200).json({ data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "Something Went Wrong ...!" });
  }
};

// Dashboard summary
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ── Revenue & bricks sold this month vs last month ────────────────────
    const salesThisMonth = await sale.aggregate([
      { $match: { status: "confirmed", date: { $gte: startOfMonth } } },
      { $unwind: "$saleDetail" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$saleDetail.amount" },
          totalBricks: { $sum: "$saleDetail.quantity" },
        },
      },
    ]);
    const salesLastMonth = await sale.aggregate([
      {
        $match: {
          status: "confirmed",
          date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $unwind: "$saleDetail" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$saleDetail.amount" },
          totalBricks: { $sum: "$saleDetail.quantity" },
        },
      },
    ]);

    // ── Production this month ──────────────────────────────────────────────
    const prodThisMonth = await production.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: "$type", total: { $sum: "$quantity" } } },
    ]);

    // ── Monthly revenue last 6 months ─────────────────────────────────────
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyRevenue = await sale.aggregate([
      { $match: { status: "confirmed", date: { $gte: sixMonthsAgo } } },
      { $unwind: "$saleDetail" },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          revenue: { $sum: "$saleDetail.amount" },
          bricksSold: { $sum: "$saleDetail.quantity" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // ── Bricks sold by type last 3 months ─────────────────────────────────
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const salesByType = await sale.aggregate([
      { $match: { status: "confirmed", date: { $gte: threeMonthsAgo } } },
      { $unwind: "$saleDetail" },
      {
        $group: {
          _id: "$saleDetail.brickName",
          totalQty: { $sum: "$saleDetail.quantity" },
          totalRevenue: { $sum: "$saleDetail.amount" },
        },
      },
    ]);

    // ── Stock levels ───────────────────────────────────────────────────────
    const produced = await production.aggregate([
      { $group: { _id: "$type", total: { $sum: "$quantity" } } },
    ]);
    const sold = await sale.aggregate([
      { $match: { status: "confirmed" } },
      { $unwind: "$saleDetail" },
      {
        $group: {
          _id: "$saleDetail.brickName",
          total: { $sum: "$saleDetail.quantity" },
        },
      },
    ]);
    const stockMap = {};
    produced.forEach((p) => {
      stockMap[p._id] = (stockMap[p._id] || 0) + p.total;
    });
    sold.forEach((s) => {
      stockMap[s._id] = (stockMap[s._id] || 0) - s.total;
    });
    const stock = Object.entries(stockMap).map(([brickType, available]) => ({
      brickType,
      available: Math.max(0, available),
    }));

    // ── Recent challans ────────────────────────────────────────────────────
    const recentChallans = await sale
      .find({ status: "confirmed" })
      .sort({ date: -1 })
      .limit(5)
      .select("_id date customerName totalAmount saleDetail");

    // ── Totals ────────────────────────────────────────────────────────────
    const totalCustomers =
      await require("../models/customerDetail").countDocuments();
    const totalChallans = await sale.countDocuments({ status: "confirmed" });
    const totalRevenue = await sale.aggregate([
      { $match: { status: "confirmed" } },
      { $unwind: "$saleDetail" },
      { $group: { _id: null, total: { $sum: "$saleDetail.amount" } } },
    ]);

    // ── Additional Business Insights ──────────────────────────────────────
    const workerSalaryModel = require("../models/workerSalary");
    const maintainesCostModel = require("../models/maintainesCost");
    const cementRawModel = require("../models/cementRawMatirial");
    const flyAshRawModel = require("../models/flyAshRawMatirial");
    const pondAshRawModel = require("../models/pondAshRawMatirial");
    const dustPowderRawModel = require("../models/dustAndPowderRawMatirial");
    const chemicalRawModel = require("../models/chemicalRawMatirial");
    const dailyTransportModel = require("../models/dailyTransportDetail");

    // Vehicles count
    const totalVehicles = await vehicalDetail.countDocuments();

    // Worker salary this month
    const workerSalaryThisMonth = await workerSalaryModel.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    // Maintenance this month
    const maintenanceThisMonth = await maintainesCostModel.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    // Raw material costs this month (all types combined)
    const cementThisMonth = await cementRawModel.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);
    const flyAshThisMonth = await flyAshRawModel.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);
    const pondAshThisMonth = await pondAshRawModel.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);
    const dustPowderThisMonth = await dustPowderRawModel.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);
    const chemicalThisMonth = await chemicalRawModel.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    // Transport this month
    const transportThisMonth = await dailyTransportModel.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          trips: { $sum: "$trip" },
        },
      },
    ]);

    // All-time totals for expenses
    const totalWorkerSalary = await workerSalaryModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalMaintenance = await maintainesCostModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRawMaterial = await Promise.all([
      cementRawModel.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      flyAshRawModel.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      pondAshRawModel.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      dustPowderRawModel.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      chemicalRawModel.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);
    const allTimeRawMaterial = totalRawMaterial.reduce(
      (sum, r) => sum + (r[0]?.total || 0),
      0,
    );
    const totalTransport = await dailyTransportModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const rawMaterialThisMonth = {
      cement: cementThisMonth[0]?.total || 0,
      flyAsh: flyAshThisMonth[0]?.total || 0,
      pondAsh: pondAshThisMonth[0]?.total || 0,
      dustPowder: dustPowderThisMonth[0]?.total || 0,
      chemical: chemicalThisMonth[0]?.total || 0,
      totalCost:
        (cementThisMonth[0]?.total || 0) +
        (flyAshThisMonth[0]?.total || 0) +
        (pondAshThisMonth[0]?.total || 0) +
        (dustPowderThisMonth[0]?.total || 0) +
        (chemicalThisMonth[0]?.total || 0),
      totalEntries:
        (cementThisMonth[0]?.count || 0) +
        (flyAshThisMonth[0]?.count || 0) +
        (pondAshThisMonth[0]?.count || 0) +
        (dustPowderThisMonth[0]?.count || 0) +
        (chemicalThisMonth[0]?.count || 0),
    };

    res.status(200).json({
      data: {
        thisMonth: salesThisMonth[0] || { totalRevenue: 0, totalBricks: 0 },
        lastMonth: salesLastMonth[0] || { totalRevenue: 0, totalBricks: 0 },
        prodThisMonth,
        monthlyRevenue,
        salesByType,
        stock,
        recentChallans,
        totals: {
          customers: totalCustomers,
          confirmedChallans: totalChallans,
          allTimeRevenue: totalRevenue[0]?.total || 0,
          vehicles: totalVehicles,
          allTimeWorkerSalary: totalWorkerSalary[0]?.total || 0,
          allTimeMaintenance: totalMaintenance[0]?.total || 0,
          allTimeRawMaterial,
          allTimeTransport: totalTransport[0]?.total || 0,
        },
        expenses: {
          workerSalary: workerSalaryThisMonth[0] || { total: 0, count: 0 },
          maintenance: maintenanceThisMonth[0] || { total: 0, count: 0 },
          rawMaterial: rawMaterialThisMonth,
          transport: transportThisMonth[0] || { total: 0, trips: 0 },
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Message: "Something Went Wrong ...!" });
  }
};
