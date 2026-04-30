const fs = require("fs");
const PDFDocument = require("pdfkit");

function addWatermarkToPage(doc, waterMark) {
  doc.save(); // Save the current state of the document
  doc
    .fontSize(48)
    .fillOpacity(0.3)
    .text(`${waterMark}`, 150, 80, { width: 300, align: "center" });
  doc.restore(); // Restore the document to its previous state
}

function generateHeader(doc, data) {
  doc
    .fontSize(10)
    .text(
      "SAMARTH VEET UDYOG - Fly ash Bricks & Pavers Blocks Manufactures & Sales",
      { align: "center", underline: true },
    )
    .fontSize(8)
    .moveDown(0.5)
    .text(
      "chandak Mala,near SRPF Camp,Vijapur Road Solapur Phone Number - 9923949492, 9011628663",
      {
        align: "center",
        underline: true,
      },
    )
    .moveDown()
    .text(`To - ${data.customerName}, ${data.address} `, {
      align: "center",
      lineBreak: true,
      underline: true,
    })
    .moveDown()
    .text(`Date - ${new Date().toJSON().slice(0, 10)}`, 40, 75, {
      align: "left",
      underline: true,
      continued: true,
    })
    .text(`Challen Number - ${data._id}`, {
      align: "center",
      underline: true,
      continued: true,
    })
    .text(`Vehical Number - ${data.vehicleNumber}`, {
      align: "right",
      underline: true,
    });
}

function generateFooter(doc, data) {
  doc
    .fontSize(10)
    .text("Recieved Sign", 50, 200, {
      align: "left",
      width: 500,
      underline: true,
      continued: true,
    })
    .text("Samarth Veet Udyog", 50, 200, {
      align: "center",
      width: 500,
      underline: true,
      continued: true,
    })
    .fontSize(12)
    .text(`Total - ${data.totalAmount}`, 50, 200, {
      align: "right",
      width: 500,
      underline: true,
    });
}

function generateInvoiceTable(doc, invoice) {
  let i,
    invoiceTableTop = 100;

  for (i = 0; i < invoice.length; i++) {
    const item = invoice[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.brickName,
      item.rate,
      item.quantity,
      item.amount,
    );
  }
}

function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
  doc
    .fontSize(8)
    .text(c1, 65, y)
    .moveDown(0.5)
    .moveTo(0 + 50, doc.y)
    .lineTo(doc.page.width - 10, doc.y)
    .stroke()
    .moveDown(0.5)
    .text(c2, 265, y)
    .text(c3, 300, y, { width: 90, align: "right" })
    .text(c4, 410, y, { width: 90, align: "right" });
}
function generateTableHeader(doc, y, c1, c2, c3, c4, c5) {
  const basePosition = 70;
  const style = { width: 90 };
  doc
    .fontSize(10)
    .text(c1, basePosition, y, style)
    .moveDown(0.5)
    .moveTo(0 + 50, doc.y)
    .lineTo(doc.page.width - 10, doc.y, style)
    .stroke()
    .moveDown(0.5)
    .text(c2, basePosition + 200, y, style)
    .text(c3, basePosition + 300, y, style)
    .text(c4, basePosition + 400, y, style);
}
function createChallen(data) {
  let doc = new PDFDocument({ margin: 10, size: "A4" });
  doc.font("Helvetica-Bold");

  const item = data.saleDetail;
  const header = {
    brickName: "Brick Name",
    quantity: "Quantity",
    rate: "Rate",
    amount: "Amount",
  };

  // ─── Client Copy (top half) ─────────────────────────────────────────────
  const topY = 10;
  doc.save();
  generateHeaderAt(doc, data, topY);
  addWatermarkAt(doc, "Client Copy", topY);
  const tableTopClient = topY + 90;
  generateTableHeaderAt(doc, tableTopClient, header);
  generateInvoiceTableAt(doc, item, tableTopClient);
  generateFooterAt(doc, data, topY + 320);
  doc.restore();

  // ─── Divider line (middle of page) ─────────────────────────────────────
  const midY = 410;
  doc
    .moveTo(20, midY)
    .lineTo(doc.page.width - 20, midY)
    .dash(5, { space: 3 })
    .stroke()
    .undash();

  // Scissors icon hint
  doc
    .fontSize(8)
    .fillOpacity(0.5)
    .text(
      "✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
      20,
      midY - 5,
      { align: "center" },
    )
    .fillOpacity(1);

  // ─── Own Copy (bottom half) ─────────────────────────────────────────────
  const bottomY = midY + 15;
  doc.save();
  generateHeaderAt(doc, data, bottomY);
  addWatermarkAt(doc, "Own Copy", bottomY);
  const tableTopOwn = bottomY + 90;
  generateTableHeaderAt(doc, tableTopOwn, header);
  generateInvoiceTableAt(doc, item, tableTopOwn);
  generateFooterAt(doc, data, bottomY + 320);
  doc.restore();

  doc.end();
  return doc;
}

// ─── Positional helpers (render at a given Y offset) ──────────────────────────

function addWatermarkAt(doc, waterMark, yOffset) {
  doc.save();
  doc
    .fontSize(40)
    .fillOpacity(0.15)
    .text(waterMark, 150, yOffset + 60, { width: 300, align: "center" });
  doc.restore();
}

function generateHeaderAt(doc, data, yOffset) {
  doc
    .fontSize(10)
    .text(
      "SAMARTH VEET UDYOG - Fly ash Bricks & Pavers Blocks Manufactures & Sales",
      40,
      yOffset,
      { align: "center", underline: true, width: doc.page.width - 80 },
    );
  doc
    .fontSize(7)
    .text(
      "chandak Mala, near SRPF Camp, Vijapur Road Solapur Phone Number - 9923949492, 9011628663",
      40,
      yOffset + 14,
      { align: "center", width: doc.page.width - 80, underline: true },
    );
  doc
    .fontSize(8)
    .text(`To - ${data.customerName}, ${data.address}`, 40, yOffset + 30, {
      align: "center",
      width: doc.page.width - 80,
      underline: true,
    });
  doc
    .fontSize(7)
    .text(
      `Date - ${new Date(data.date || Date.now()).toJSON().slice(0, 10)}`,
      40,
      yOffset + 50,
    )
    .text(`Challan No - ${data._id}`, 220, yOffset + 50)
    .text(`Vehicle No - ${data.vehicleNumber}`, 380, yOffset + 50);
}

function generateTableHeaderAt(doc, yPosition, header) {
  doc
    .fontSize(8)
    .text(header.brickName, 65, yPosition, { width: 90 })
    .text(header.quantity, 250, yPosition, { width: 90 })
    .text(header.rate, 340, yPosition, { width: 90 })
    .text(header.amount, 440, yPosition, { width: 90 });
  doc
    .moveTo(50, yPosition + 12)
    .lineTo(doc.page.width - 30, yPosition + 12)
    .stroke();
}

function generateInvoiceTableAt(doc, items, tableTop) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const y = tableTop + 18 + i * 22;
    doc
      .fontSize(8)
      .text(item.brickName, 65, y)
      .text(String(item.quantity), 250, y, { width: 90 })
      .text(String(item.rate), 340, y, { width: 90 })
      .text(String(item.amount), 440, y, { width: 90 });
    doc
      .moveTo(50, y + 14)
      .lineTo(doc.page.width - 30, y + 14)
      .stroke();
  }
}

function generateFooterAt(doc, data, yPosition) {
  doc
    .fontSize(9)
    .text("Received Sign", 50, yPosition, { underline: true })
    .text("Samarth Veet Udyog", 220, yPosition, { underline: true })
    .text(`Total - ${data.totalAmount}`, 400, yPosition, { underline: true });
}

module.exports = {
  createChallen,
};
