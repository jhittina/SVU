import API from "./axios";

// Helper to build query string for pagination
const buildPaginationQuery = (page = 1, limit = 10, search = "") => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  if (search) params.append("search", search);
  return params.toString();
};

// ── Auth ─────────────────────────────────────────────────────────────────────
export const adminSignin = (data) => API.post("/admin/signin", data);
export const adminSignup = (data) => API.post("/admin/signup", data);
export const superadminSignin = (data) => API.post("/superadmin/signin", data);
export const superadminSignup = (data) => API.post("/superadmin/signup", data);

// ── Admin management ─────────────────────────────────────────────────────────
export const getAdmins = () => API.get("/admin/list");
export const deleteAdmin = (id) => API.delete(`/admin/delete?id=${id}`);

// ── Production ───────────────────────────────────────────────────────────────
export const addProduction = (data) => API.post("/production", data);
export const updateProduction = (id, data) =>
  API.post(`/production?id=${id}`, data);
export const getProductions = (page, limit, search) =>
  API.get(`/productions?${buildPaginationQuery(page, limit, search)}`);
export const deleteProduction = (id) => API.delete(`/production?id=${id}`);

// ── Customer ─────────────────────────────────────────────────────────────────
export const addCustomer = (data) => API.post("/customerDetail", data);
export const updateCustomer = (id, data) =>
  API.post(`/customerDetail?id=${id}`, data);
export const getCustomers = (page, limit, search) =>
  API.get(`/customerDetails?${buildPaginationQuery(page, limit, search)}`);
export const deleteCustomer = (id) => API.delete(`/customerDetail?id=${id}`);
// Address: action = "create" | "update" | "delete"
export const manageCustomerAddress = (id, action, data) =>
  API.post(`/customerAddressDetail?id=${id}&action=${action}`, data);

// ── Vehicle ──────────────────────────────────────────────────────────────────
export const addVehicle = (data) => API.post("/vehicalDetail", data);
export const updateVehicle = (id, data) =>
  API.post(`/vehicalDetail?id=${id}`, data);
export const getVehicles = (page, limit, search) =>
  API.get(`/vehicalDetails?${buildPaginationQuery(page, limit, search)}`);
export const deleteVehicle = (id) => API.delete(`/vehicalDetail?id=${id}`);

// ── Supplier ─────────────────────────────────────────────────────────────────
export const addSupplier = (data) => API.post("/supplairDetail", data);
export const updateSupplier = (id, data) =>
  API.post(`/supplairDetail?id=${id}`, data);
export const getSuppliers = (page, limit, search) =>
  API.get(`/supplairDetails?${buildPaginationQuery(page, limit, search)}`);
export const deleteSupplier = (id) => API.delete(`/supplairDetail?id=${id}`);

// ── Daily Transport ──────────────────────────────────────────────────────────
// Backend auto-calc: amount = perTrip * trip
export const addDailyTransport = (data) =>
  API.post("/dailyTransportDetail", data);
export const updateDailyTransport = (id, data) =>
  API.post(`/dailyTransportDetail?id=${id}`, data);
export const getDailyTransports = (page, limit, search) =>
  API.get(
    `/dailyTransportDetails?${buildPaginationQuery(page, limit, search)}`,
  );
export const deleteDailyTransport = (id) =>
  API.delete(`/dailyTransportDetail?id=${id}`);

// ── Cement Raw Material ──────────────────────────────────────────────────────
// Backend auto-calc: amount = pricePerBag * quantity + transportCharge
export const addCementRaw = (data) => API.post("/cementRawMatirial", data);
export const updateCementRaw = (id, data) =>
  API.post(`/cementRawMatirial?id=${id}`, data);
export const getCementRaws = (page, limit, search) =>
  API.get(`/cementRawMatirials?${buildPaginationQuery(page, limit, search)}`);
export const deleteCementRaw = (id) =>
  API.delete(`/cementRawMatirial?id=${id}`);

// ── Dust & Powder Raw Material ───────────────────────────────────────────────
export const addDustPowderRaw = (data) =>
  API.post("/dustAndPowderRawMatirial", data);
export const updateDustPowderRaw = (id, data) =>
  API.post(`/dustAndPowderRawMatirial?id=${id}`, data);
export const getDustPowderRaws = (page, limit, search) =>
  API.get(
    `/dustAndPowderRawMatirials?${buildPaginationQuery(page, limit, search)}`,
  );
export const deleteDustPowderRaw = (id) =>
  API.delete(`/dustAndPowderRawMatirial?id=${id}`);

// ── Fly Ash Raw Material ─────────────────────────────────────────────────────
export const addFlyAshRaw = (data) => API.post("/flyAshRawMatirial", data);
export const updateFlyAshRaw = (id, data) =>
  API.post(`/flyAshRawMatirial?id=${id}`, data);
export const getFlyAshRaws = (page, limit, search) =>
  API.get(`/flyAshRawMatirials?${buildPaginationQuery(page, limit, search)}`);
export const deleteFlyAshRaw = (id) =>
  API.delete(`/flyAshRawMatirial?id=${id}`);

// ── Pond Ash Raw Material ────────────────────────────────────────────────────
export const addPondAshRaw = (data) => API.post("/pondAshRawMatirial", data);
export const updatePondAshRaw = (id, data) =>
  API.post(`/pondAshRawMatirial?id=${id}`, data);
export const getPondAshRaws = (page, limit, search) =>
  API.get(`/pondAshRawMatirials?${buildPaginationQuery(page, limit, search)}`);
export const deletePondAshRaw = (id) =>
  API.delete(`/pondAshRawMatirial?id=${id}`);

// ── Chemical Raw Material ────────────────────────────────────────────────────
export const addChemicalRaw = (data) => API.post("/chemicalRawMatirial", data);
export const updateChemicalRaw = (id, data) =>
  API.post(`/chemicalRawMatirial?id=${id}`, data);
export const getChemicalRaws = (page, limit, search) =>
  API.get(`/chemicalRawMatirials?${buildPaginationQuery(page, limit, search)}`);
export const deleteChemicalRaw = (id) =>
  API.delete(`/chemicalRawMatirial?id=${id}`);

// ── Worker Salary ────────────────────────────────────────────────────────────
// Backend auto-calc: amount = noOfPlates * pricePerPlate
export const addWorkerSalary = (data) => API.post("/workerSalary", data);
export const updateWorkerSalary = (id, data) =>
  API.post(`/workerSalary?id=${id}`, data);
export const getWorkerSalaries = (page, limit, search) =>
  API.get(`/workerSalarys?${buildPaginationQuery(page, limit, search)}`);
export const deleteWorkerSalary = (id) => API.delete(`/workerSalary?id=${id}`);

// ── Maintenance Cost ─────────────────────────────────────────────────────────
export const addMaintenance = (data) => API.post("/maintainesCost", data);
export const updateMaintenance = (id, data) =>
  API.post(`/maintainesCost?id=${id}`, data);
export const getMaintenances = (page, limit, search) =>
  API.get(`/maintainesCosts?${buildPaginationQuery(page, limit, search)}`);
export const deleteMaintenance = (id) => API.delete(`/maintainesCost?id=${id}`);

// ── Sale / Challan ───────────────────────────────────────────────────────────
export const addChallan = (data) => API.post("/challen", data);
export const updateChallan = (id, data) => API.post(`/challen?id=${id}`, data);
export const getSales = (page, limit, search) =>
  API.get(`/sales?${buildPaginationQuery(page, limit, search)}`);
export const deleteChallan = (id) => API.delete(`/challen?id=${id}`);
export const downloadChallanPdf = (id) =>
  API.get(`/challenPdf?id=${id}`, { responseType: "blob" });
export const getStock = () => API.get("/stock");
export const getDashboardData = () => API.get("/dashboard");

// ── Bill ─────────────────────────────────────────────────────────────────────
export const getChallansForBill = (dateFrom, dateTo, customerId) =>
  API.get(
    `/challans-for-bill?dateFrom=${dateFrom}&dateTo=${dateTo}${customerId ? `&customerId=${customerId}` : ""}`,
  );
export const addBill = (data) => API.post("/bill", data);
export const updateBill = (id, data) => API.post(`/bill?id=${id}`, data);
export const getBills = (page, limit, search) =>
  API.get(`/bills?${buildPaginationQuery(page, limit, search)}`);
export const deleteBill = (id) => API.delete(`/bill?id=${id}`);
export const downloadBillPdf = (id) =>
  API.get(`/billPdf?id=${id}`, { responseType: "blob" });

// ── Payments ─────────────────────────────────────────────────────────────────
export const createPayment = (data) => API.post("/payment", data);
export const getPayments = (type, referenceId) =>
  API.get(`/payments?type=${type}&referenceId=${referenceId}`);
export const deletePayment = (id) => API.delete(`/payment?id=${id}`);
export const getCustomerPaymentSummary = (customerId, customerName) => {
  const params = new URLSearchParams();
  if (customerId) params.append("customerId", customerId);
  if (customerName) params.append("customerName", customerName);
  return API.get(`/payment/customer-summary?${params.toString()}`);
};
export const getSupplierPaymentSummary = (supplierName) =>
  API.get(
    `/payment/supplier-summary?supplierName=${encodeURIComponent(supplierName)}`,
  );
export const getVehiclePaymentSummary = (vehicleNumber) =>
  API.get(
    `/payment/vehicle-summary?vehicleNumber=${encodeURIComponent(vehicleNumber)}`,
  );
export const getWorkerPaymentSummary = (brickType, dateFrom, dateTo) => {
  const params = new URLSearchParams();
  if (brickType) params.append("brickType", brickType);
  if (dateFrom) params.append("dateFrom", dateFrom);
  if (dateTo) params.append("dateTo", dateTo);
  return API.get(`/payment/worker-summary?${params.toString()}`);
};
export const getMaintenancePaymentSummary = (type, dateFrom, dateTo) => {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (dateFrom) params.append("dateFrom", dateFrom);
  if (dateTo) params.append("dateTo", dateTo);
  return API.get(`/payment/maintenance-summary?${params.toString()}`);
};

// Pending overview
export const getPendingOverview = () => API.get("/payment/pending-overview");
