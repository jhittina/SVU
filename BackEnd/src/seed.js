/**
 * Seed Script — Brick Factory Management System
 * Run: node src/seed.js
 *
 * Creates:
 *  - 1 SuperAdmin account
 *  - 1 Admin account
 *  - Sample data for all modules
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const env = require("dotenv");
env.config();

// ── Models ─────────────────────────────────────────────────────────────────
const SuperAdmin = require("./models/superadmin");
const Admin = require("./models/admin");
const Production = require("./models/production");
const CustomerDetail = require("./models/customerDetail");
const VehicalDetail = require("./models/vehicalDetail");
const SupplairDetail = require("./models/supplairDetail");
const DailyTransportDetail = require("./models/dailyTransportDetail");
const CementRawMatirial = require("./models/cementRawMatirial");
const DustAndPowderRawMatirial = require("./models/dustAndPowderRawMatirial");
const FlyAshRawMatirial = require("./models/flyAshRawMatirial");
const PondAshRawMatirial = require("./models/pondAshRawMatirial");
const ChemicalRawMatirial = require("./models/chemicalRawMatirial");
const WorkerSalary = require("./models/workerSalary");
const MaintainesCost = require("./models/maintainesCost");
const Sale = require("./models/sale");

// ── Helpers ─────────────────────────────────────────────────────────────────
const d = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  console.log("✅ Connected to MongoDB:", process.env.MONGO_DB_DATABASE);

  // ── 1. SuperAdmin ──────────────────────────────────────────────────────────
  const superAdminEmail = "superadmin@brickfactory.com";
  const existingSA = await SuperAdmin.findOne({ email: superAdminEmail });
  if (!existingSA) {
    const hash = await bcrypt.hash("SuperAdmin@123", 10);
    await SuperAdmin.create({
      firstName: "Super",
      lastName: "Admin",
      username: "superadmin_factory",
      email: superAdminEmail,
      hash_password: hash,
      role: "superadmin",
      contactNumber: "9876543210",
    });
    console.log(
      "✅ SuperAdmin created  →  superadmin@brickfactory.com  /  SuperAdmin@123",
    );
  } else {
    console.log("ℹ️  SuperAdmin already exists — skipped");
  }

  // ── 2. Admin ───────────────────────────────────────────────────────────────
  const adminEmail = "admin@brickfactory.com";
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hash = await bcrypt.hash("Admin@123", 10);
    await Admin.create({
      firstName: "Rajesh",
      username: "rajesh_factory",
      email: adminEmail,
      hash_password: hash,
      role: "admin",
      profession: "Factory Manager",
      PhoneNo: "9876500001",
      interestedin: "Brick Manufacturing",
    });
    console.log(
      "✅ Admin created       →  admin@brickfactory.com  /  Admin@123",
    );
  } else {
    console.log("ℹ️  Admin already exists — skipped");
  }

  // ── 3. Production ──────────────────────────────────────────────────────────
  const prodCount = await Production.countDocuments();
  if (prodCount === 0) {
    await Production.insertMany([
      { date: d(0), type: "Fly Ash Brick", quantity: 5000 },
      { date: d(1), type: "Cement Brick", quantity: 3200 },
      { date: d(2), type: "Fly Ash Brick", quantity: 4800 },
      { date: d(3), type: "Pond Ash Brick", quantity: 2500 },
      { date: d(5), type: "Fly Ash Brick", quantity: 6000 },
      { date: d(7), type: "Cement Brick", quantity: 4000 },
      { date: d(10), type: "Fly Ash Brick", quantity: 5500 },
    ]);
    console.log("✅ Production records seeded (7)");
  } else {
    console.log("ℹ️  Production already has data — skipped");
  }

  // ── 4. Customers ───────────────────────────────────────────────────────────
  const custCount = await CustomerDetail.countDocuments();
  if (custCount === 0) {
    await CustomerDetail.insertMany([
      {
        name: "Arun Construction",
        brickType: "Fly Ash Brick",
        contactNumber: "9800000001",
        poNumber: "PO-001",
      },
      {
        name: "Mehta Builders",
        brickType: "Cement Brick",
        contactNumber: "9800000002",
        poNumber: "PO-002",
      },
      {
        name: "Sharma Infra Pvt Ltd",
        brickType: "Fly Ash Brick",
        contactNumber: "9800000003",
      },
      {
        name: "City Developers",
        brickType: "Pond Ash Brick",
        contactNumber: "9800000004",
        poNumber: "PO-004",
      },
      {
        name: "Ram & Sons Contractor",
        brickType: "Fly Ash Brick",
        contactNumber: "9800000005",
      },
    ]);
    console.log("✅ Customer records seeded (5)");
  } else {
    console.log("ℹ️  Customers already has data — skipped");
  }

  // ── 5. Vehicles ────────────────────────────────────────────────────────────
  const vehCount = await VehicalDetail.countDocuments();
  if (vehCount === 0) {
    await VehicalDetail.insertMany([
      {
        name: "Suresh Transporter",
        vehicleType: "Truck",
        vehicleNumber: "MH-12-AB-1234",
        price: 1200,
        contactNumber: "9700000001",
        address: "Pune",
      },
      {
        name: "Ramesh Logistics",
        vehicleType: "Truck",
        vehicleNumber: "MH-14-CD-5678",
        price: 1500,
        contactNumber: "9700000002",
        address: "Nashik",
      },
      {
        name: "Ganesh Transport",
        vehicleType: "Tractor",
        vehicleNumber: "GJ-01-EF-9012",
        price: 800,
        contactNumber: "9700000003",
        address: "Ahmedabad",
      },
      {
        name: "Shiva Mini Trucks",
        vehicleType: "Mini Truck",
        vehicleNumber: "MH-04-GH-3456",
        price: 600,
        contactNumber: "9700000004",
        address: "Mumbai",
      },
    ]);
    console.log("✅ Vehicle records seeded (4)");
  } else {
    console.log("ℹ️  Vehicles already has data — skipped");
  }

  // ── 6. Suppliers ───────────────────────────────────────────────────────────
  const suppCount = await SupplairDetail.countDocuments();
  if (suppCount === 0) {
    await SupplairDetail.insertMany([
      {
        name: "Priya Cement Co.",
        address: ["Pune, Maharashtra"],
        matirialType: "Cement",
        price: 380,
        conatctNumber: "9600000001",
      },
      {
        name: "Fly Ash Traders",
        address: ["Nagpur, Maharashtra"],
        matirialType: "Fly Ash",
        price: 500,
        conatctNumber: "9600000002",
      },
      {
        name: "Pond Ash Suppliers",
        address: ["Nasik, Maharashtra"],
        matirialType: "Pond Ash",
        price: 450,
        conatctNumber: "9600000003",
      },
      {
        name: "Chem Solutions Pvt Ltd",
        address: ["Mumbai, Maharashtra"],
        matirialType: "Chemical",
        price: 1200,
        conatctNumber: "9600000004",
      },
      {
        name: "Dust & Grit Suppliers",
        address: ["Solapur, Maharashtra"],
        matirialType: "Dust & Powder",
        price: 250,
        conatctNumber: "9600000005",
      },
    ]);
    console.log("✅ Supplier records seeded (5)");
  } else {
    console.log("ℹ️  Suppliers already has data — skipped");
  }

  // ── 7. Daily Transport ─────────────────────────────────────────────────────
  const dtCount = await DailyTransportDetail.countDocuments();
  if (dtCount === 0) {
    await DailyTransportDetail.insertMany([
      {
        date: d(0),
        type: "Outward",
        trip: 4,
        vehicalNumber: "MH-12-AB-1234",
        perTrip: 1200,
        amount: 4800,
      },
      {
        date: d(1),
        type: "Outward",
        trip: 3,
        vehicalNumber: "MH-14-CD-5678",
        perTrip: 1500,
        amount: 4500,
      },
      {
        date: d(2),
        type: "Inward",
        trip: 2,
        vehicalNumber: "GJ-01-EF-9012",
        perTrip: 800,
        amount: 1600,
      },
      {
        date: d(3),
        type: "Outward",
        trip: 5,
        vehicalNumber: "MH-04-GH-3456",
        perTrip: 600,
        amount: 3000,
      },
      {
        date: d(5),
        type: "Inward",
        trip: 3,
        vehicalNumber: "MH-12-AB-1234",
        perTrip: 1200,
        amount: 3600,
      },
    ]);
    console.log("✅ Daily Transport records seeded (5)");
  } else {
    console.log("ℹ️  Daily Transport already has data — skipped");
  }

  // ── 8. Cement Raw Material ─────────────────────────────────────────────────
  const cemCount = await CementRawMatirial.countDocuments();
  if (cemCount === 0) {
    await CementRawMatirial.insertMany([
      {
        date: d(2),
        name: "Priya Cement Co.",
        vehicalNumber: "MH-12-AB-1234",
        quantity: 200,
        pricePerBag: 380,
        transportCharge: 500,
        numberOfTon: 10,
        amount: 76500,
      },
      {
        date: d(7),
        name: "Ultra Tech Cement",
        vehicalNumber: "MH-14-CD-5678",
        quantity: 150,
        pricePerBag: 400,
        transportCharge: 400,
        numberOfTon: 7,
        amount: 60400,
      },
      {
        date: d(14),
        name: "ACC Cement Supplier",
        vehicalNumber: "GJ-01-EF-9012",
        quantity: 300,
        pricePerBag: 375,
        transportCharge: 600,
        numberOfTon: 15,
        amount: 112600,
      },
    ]);
    console.log("✅ Cement Raw Material records seeded (3)");
  } else {
    console.log("ℹ️  Cement Raw Material already has data — skipped");
  }

  // ── 9. Fly Ash Raw Material ────────────────────────────────────────────────
  const flyCount = await FlyAshRawMatirial.countDocuments();
  if (flyCount === 0) {
    await FlyAshRawMatirial.insertMany([
      {
        date: d(1),
        name: "Fly Ash Traders",
        vehicalNumber: "MH-12-AB-1234",
        numberOfTon: 20,
        pricePerTon: 500,
        amount: 10000,
      },
      {
        date: d(6),
        name: "NTPC Fly Ash",
        vehicalNumber: "MH-14-CD-5678",
        numberOfTon: 30,
        pricePerTon: 480,
        amount: 14400,
      },
      {
        date: d(12),
        name: "Thermal Power Ash",
        vehicalNumber: "GJ-01-EF-9012",
        numberOfTon: 25,
        pricePerTon: 510,
        amount: 12750,
      },
    ]);
    console.log("✅ Fly Ash Raw Material records seeded (3)");
  } else {
    console.log("ℹ️  Fly Ash Raw Material already has data — skipped");
  }

  // ── 10. Pond Ash Raw Material ──────────────────────────────────────────────
  const pondCount = await PondAshRawMatirial.countDocuments();
  if (pondCount === 0) {
    await PondAshRawMatirial.insertMany([
      {
        date: d(3),
        name: "Pond Ash Suppliers",
        vehicalNumber: "MH-04-GH-3456",
        numberOfTon: 15,
        amount: 6750,
      },
      {
        date: d(9),
        name: "Pond Ash Traders",
        vehicalNumber: "MH-12-AB-1234",
        numberOfTon: 20,
        amount: 9000,
      },
    ]);
    console.log("✅ Pond Ash Raw Material records seeded (2)");
  } else {
    console.log("ℹ️  Pond Ash Raw Material already has data — skipped");
  }

  // ── 11. Dust & Powder Raw Material ────────────────────────────────────────
  const dustCount = await DustAndPowderRawMatirial.countDocuments();
  if (dustCount === 0) {
    await DustAndPowderRawMatirial.insertMany([
      {
        Date: d(4),
        name: "Dust & Grit Suppliers",
        vehicalNumber: "MH-14-CD-5678",
        quantity: 10,
        quantityUnit: "ton",
        rawMatirialType: "Dust",
        pricePerQuantity: 250,
        amount: 2500,
      },
      {
        Date: d(10),
        name: "Stone Powder Works",
        vehicalNumber: "GJ-01-EF-9012",
        quantity: 8,
        quantityUnit: "ton",
        rawMatirialType: "Powder",
        pricePerQuantity: 300,
        amount: 2400,
      },
    ]);
    console.log("✅ Dust & Powder Raw Material records seeded (2)");
  } else {
    console.log("ℹ️  Dust & Powder Raw Material already has data — skipped");
  }

  // ── 12. Chemical Raw Material ──────────────────────────────────────────────
  const chemCount = await ChemicalRawMatirial.countDocuments();
  if (chemCount === 0) {
    await ChemicalRawMatirial.insertMany([
      {
        date: d(5),
        name: "Admixture Chem A",
        noLiter: 200,
        pricePerLiter: 45,
        transportCharge: 300,
        gstAmount: 378,
        amount: 9678,
      },
      {
        date: d(11),
        name: "Binding Agent B",
        noLiter: 150,
        pricePerLiter: 60,
        transportCharge: 200,
        gstAmount: 306,
        amount: 9506,
      },
    ]);
    console.log("✅ Chemical Raw Material records seeded (2)");
  } else {
    console.log("ℹ️  Chemical Raw Material already has data — skipped");
  }

  // ── 13. Worker Salary ──────────────────────────────────────────────────────
  const wsCount = await WorkerSalary.countDocuments();
  if (wsCount === 0) {
    await WorkerSalary.insertMany([
      {
        date: d(0),
        typeOfBrick: "Fly Ash Brick",
        noOfPlates: 500,
        pricePerPlate: 12,
        amount: 6000,
      },
      {
        date: d(1),
        typeOfBrick: "Cement Brick",
        noOfPlates: 320,
        pricePerPlate: 14,
        amount: 4480,
      },
      {
        date: d(2),
        typeOfBrick: "Fly Ash Brick",
        noOfPlates: 480,
        pricePerPlate: 12,
        amount: 5760,
      },
      {
        date: d(3),
        typeOfBrick: "Pond Ash Brick",
        noOfPlates: 250,
        pricePerPlate: 13,
        amount: 3250,
      },
      {
        date: d(5),
        typeOfBrick: "Fly Ash Brick",
        noOfPlates: 600,
        pricePerPlate: 12,
        amount: 7200,
      },
    ]);
    console.log("✅ Worker Salary records seeded (5)");
  } else {
    console.log("ℹ️  Worker Salary already has data — skipped");
  }

  // ── 14. Maintenance Cost ───────────────────────────────────────────────────
  const maintCount = await MaintainesCost.countDocuments();
  if (maintCount === 0) {
    await MaintainesCost.insertMany([
      {
        date: d(3),
        type: "Mechanical",
        Resion: "Brick moulding machine repair",
        amount: 5500,
      },
      {
        date: d(8),
        type: "Electrical",
        Resion: "Motor winding replacement",
        amount: 3200,
      },
      {
        date: d(12),
        type: "Vehicle",
        Resion: "Truck tyre replacement",
        amount: 8000,
      },
      {
        date: d(15),
        type: "Civil",
        Resion: "Shed roof leakage repair",
        amount: 4500,
      },
      {
        date: d(20),
        type: "Mechanical",
        Resion: "Conveyor belt replacement",
        amount: 6800,
      },
    ]);
    console.log("✅ Maintenance Cost records seeded (5)");
  } else {
    console.log("ℹ️  Maintenance Cost already has data — skipped");
  }

  // ── 15. Sales / Challans ───────────────────────────────────────────────────
  const saleCount = await Sale.countDocuments();
  if (saleCount === 0) {
    await Sale.insertMany([
      {
        _id: "CHAL001",
        date: d(0),
        customerName: "Arun Construction",
        address: "Pune, Maharashtra",
        poNumber: "PO-001",
        vehicleNumber: "MH-12-AB-1234",
        saleDetail: [
          {
            brickName: "Fly Ash Brick",
            quantity: 2000,
            rate: 6,
            amount: 12000,
          },
          { brickName: "Cement Brick", quantity: 500, rate: 8, amount: 4000 },
        ],
      },
      {
        _id: "CHAL002",
        date: d(2),
        customerName: "Mehta Builders",
        address: "Nashik, Maharashtra",
        poNumber: "PO-002",
        vehicleNumber: "MH-14-CD-5678",
        saleDetail: [
          { brickName: "Cement Brick", quantity: 3000, rate: 8, amount: 24000 },
        ],
      },
      {
        _id: "CHAL003",
        date: d(5),
        customerName: "Sharma Infra Pvt Ltd",
        address: "Mumbai, Maharashtra",
        vehicleNumber: "GJ-01-EF-9012",
        saleDetail: [
          {
            brickName: "Fly Ash Brick",
            quantity: 5000,
            rate: 6,
            amount: 30000,
          },
          {
            brickName: "Pond Ash Brick",
            quantity: 1000,
            rate: 5,
            amount: 5000,
          },
        ],
      },
    ]);
    console.log("✅ Sale / Challan records seeded (3)");
  } else {
    console.log("ℹ️  Sales already has data — skipped");
  }

  // ── 16. Brick Factory Customers (4 & 6 inch) ──────────────────────────────
  const brickCustNames = [
    "Ramesh Constructions",
    "Suresh Builders",
    "Priya Infra",
  ];
  const existingBrickCusts = await CustomerDetail.countDocuments({
    name: { $in: brickCustNames },
  });
  if (existingBrickCusts === 0) {
    await CustomerDetail.insertMany([
      {
        name: "Ramesh Constructions",
        contactNumber: "9876541001",
        poNumber: "PO-RC-001",
        address: [
          {
            brickType: "4 inch Bricks",
            address: "Sector 12, Hubli",
            price: 10,
            priceHistory: [
              { price: 10, effectiveDate: d(180), note: "Initial rate" },
            ],
          },
          {
            brickType: "6 inch Bricks",
            address: "Sector 12, Hubli",
            price: 14,
            priceHistory: [
              { price: 14, effectiveDate: d(180), note: "Initial rate" },
            ],
          },
        ],
      },
      {
        name: "Suresh Builders",
        contactNumber: "9876541002",
        poNumber: "PO-SB-001",
        address: [
          {
            brickType: "4 inch Bricks",
            address: "MG Road, Dharwad",
            price: 11,
            priceHistory: [
              { price: 9, effectiveDate: d(150), note: "Starting price" },
              { price: 11, effectiveDate: d(60), note: "Rate revision" },
            ],
          },
          {
            brickType: "6 inch Bricks",
            address: "MG Road, Dharwad",
            price: 15,
            priceHistory: [
              { price: 13, effectiveDate: d(150), note: "Starting price" },
              { price: 15, effectiveDate: d(60), note: "Rate revision" },
            ],
          },
        ],
      },
      {
        name: "Priya Infra",
        contactNumber: "9876541003",
        poNumber: "PO-PI-001",
        address: [
          {
            brickType: "4 inch Bricks",
            address: "Vidyanagar, Hubli",
            price: 10,
            priceHistory: [
              { price: 10, effectiveDate: d(90), note: "Initial rate" },
            ],
          },
          {
            brickType: "6 inch Bricks",
            address: "Vidyanagar, Hubli",
            price: 13,
            priceHistory: [
              { price: 13, effectiveDate: d(90), note: "Initial rate" },
            ],
          },
        ],
      },
    ]);
    console.log("✅ Brick customer records seeded (3)");
  } else {
    console.log("ℹ️  Brick customers already exist — skipped");
  }

  // ── 17. Production — 4 & 6 inch bricks, last 6 months ───────────────────
  const brickProdCount = await Production.countDocuments({
    type: { $in: ["4 inch Bricks", "6 inch Bricks"] },
  });
  if (brickProdCount === 0) {
    const prodRecords = [];
    for (let i = 180; i >= 1; i--) {
      prodRecords.push({
        date: d(i),
        type: "4 inch Bricks",
        quantity: 2000 + Math.floor(Math.random() * 1500),
      });
      prodRecords.push({
        date: d(i),
        type: "6 inch Bricks",
        quantity: 1500 + Math.floor(Math.random() * 1000),
      });
    }
    await Production.insertMany(prodRecords);
    console.log(`✅ Production records seeded (${prodRecords.length})`);
  } else {
    console.log("ℹ️  4/6 inch production already exists — skipped");
  }

  // ── 18. Challans — 4 & 6 inch bricks, last 3 months (weekly) ────────────
  const challanIds = Array.from(
    { length: 12 },
    (_, i) => `BRICK-CHAL-${String(i + 1).padStart(3, "0")}`,
  );
  const existingChallans = await Sale.countDocuments({
    _id: { $in: challanIds },
  });
  if (existingChallans === 0) {
    const customers = [
      {
        name: "Ramesh Constructions",
        address: "Sector 12, Hubli",
        poNumber: "PO-RC-001",
      },
      {
        name: "Suresh Builders",
        address: "MG Road, Dharwad",
        poNumber: "PO-SB-001",
      },
      {
        name: "Priya Infra",
        address: "Vidyanagar, Hubli",
        poNumber: "PO-PI-001",
      },
    ];
    const vehicles = ["KA-25-AB-1234", "KA-25-CD-5678"];
    const challans = [];
    for (let week = 12; week >= 1; week--) {
      const cIdx = week % 3;
      const cust = customers[cIdx];
      const qty4 = 1000 + Math.floor(Math.random() * 2000);
      const qty6 = 500 + Math.floor(Math.random() * 1500);
      // Suresh Builders: rate revision at day 60 ago
      const rate4 = cIdx === 1 && week * 7 > 60 ? 9 : cIdx === 1 ? 11 : 10;
      const rate6 =
        cIdx === 1 && week * 7 > 60
          ? 13
          : cIdx === 1
            ? 15
            : cIdx === 2
              ? 13
              : 14;
      const totalAmount = qty4 * rate4 + qty6 * rate6;
      challans.push({
        _id: `BRICK-CHAL-${String(13 - week).padStart(3, "0")}`,
        date: d(week * 7),
        customerName: cust.name,
        address: cust.address,
        poNumber: cust.poNumber,
        vehicleNumber: vehicles[week % 2],
        status: "confirmed",
        totalAmount,
        saleDetail: [
          {
            brickName: "4 inch Bricks",
            quantity: qty4,
            rate: rate4,
            amount: qty4 * rate4,
          },
          {
            brickName: "6 inch Bricks",
            quantity: qty6,
            rate: rate6,
            amount: qty6 * rate6,
          },
        ],
      });
    }
    await Sale.insertMany(challans);
    console.log(`✅ Brick challans seeded (${challans.length})`);
  } else {
    console.log("ℹ️  Brick challans already exist — skipped");
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────────────");
  console.log("  SEED COMPLETE");
  console.log("─────────────────────────────────────────────────");
  console.log(
    "  SuperAdmin  →  superadmin@brickfactory.com  /  SuperAdmin@123",
  );
  console.log("  Admin       →  admin@brickfactory.com       /  Admin@123");
  console.log("─────────────────────────────────────────────────\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  mongoose.disconnect();
  process.exit(1);
});
