const { challen, createInvoice } = require("./controller/sale");

const run = () => {
  // index.js
  createInvoice("invoice.pdf");
};
run();
