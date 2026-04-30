const { objSum, phoneNumber } = require("../common-function");
const { getPaginatedData } = require("../common-function/pagination");
const customerDetail = require("../models/customerDetail");
const moment = require("moment/moment");

exports.customerDetail = async (req, res) => {
  try {
    const id = req.query.id;
    const isExist = id
      ? await customerDetail.findOne({ _id: id }).exec()
      : null;
    // if (phoneNumber(req.body.contactNumber) === false)
    //   return res.status(500).json({ Message: "Invalied Phone Number...!" });
    if (isExist) {
      var myquery = { _id: id };
      var newvalues = {
        $set: req.body,
      };
      const data = await customerDetail.updateOne(myquery, newvalues).exec();
      res.status(200).json({
        Message: "Requested Data Is Successfully Updated...!",
      });
    } else {
      const _production = new customerDetail(req.body);
      const data = await _production.save();
      if (data) {
        res.status(200).json({
          data,
        });
      } else {
        res.status(data).json({
          Message: "Failed to Create a Data...!",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};
exports.customerAddressDetail = async (req, res) => {
  try {
    const id = req.query.id;
    const action = req.query.action;
    let resp = await customerDetail.findOne({ _id: id }).exec();
    let updatedData = resp;
    const updatedAddress = {
      brickType: req.body.brickType,
      address: req.body.address,
      price: req.body.price,
      priceHistory: req.body.price
        ? [
            {
              price: req.body.price,
              effectiveDate: req.body.effectiveDate || new Date(),
              note: req.body.note || "Initial price",
            },
          ]
        : [],
    };
    if (action === "create") {
      updatedData?.address.push(updatedAddress);
    } else if (action === "update") {
      const indexOfObject = updatedData?.address.findIndex(
        (x) =>
          x.address === req.body.origAddress &&
          x.brickType === req.body.origBrickType,
      );
      if (indexOfObject !== -1) {
        const existing = updatedData.address[indexOfObject];
        updatedData?.address.splice(indexOfObject, 1, {
          brickType: req.body.brickType,
          address: req.body.address,
          price: existing.price,
          priceHistory: existing.priceHistory || [],
        });
      }
    } else if (action === "addPrice") {
      const idx = updatedData?.address.findIndex(
        (x) =>
          x.address === req.body.address && x.brickType === req.body.brickType,
      );
      if (idx !== -1) {
        const existing = updatedData.address[idx];
        const currentHistory = existing.priceHistory || [];
        const newEntry = {
          price: req.body.newPrice,
          effectiveDate: req.body.effectiveDate,
          note: req.body.note || "",
        };
        // If effective date is today or past, update the current price
        const isEffectiveNow = new Date(req.body.effectiveDate) <= new Date();
        updatedData.address.splice(idx, 1, {
          brickType: existing.brickType,
          address: existing.address,
          price: isEffectiveNow ? req.body.newPrice : existing.price,
          priceHistory: [...currentHistory, newEntry],
        });
      }
    } else if (action === "delete") {
      const indexOfObject = updatedData?.address.findIndex(
        (x) =>
          x.address === req.body.address && x.brickType === req.body.brickType,
      );
      if (indexOfObject !== -1) updatedData?.address.splice(indexOfObject, 1);
    } else {
      res.status(500).json({
        Message: "Invalied Event...!",
      });
    }
    var myquery = { _id: id };
    var newvalues = {
      $set: updatedData,
    };
    const data = await customerDetail.updateOne(myquery, newvalues).exec();
    res.status(200).json({
      Message: "Requested Data Is Successfully Updated...!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};

exports.getAllCustomerDetail = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";

    const result = await getPaginatedData(customerDetail, {
      page,
      limit,
      search,
      searchFields: ["name", "poNumber", "contactNumber"],
      sort: { createdAt: -1 },
    });

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};

exports.getByIdCustomerDetail = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await customerDetail.findById(id);
    if (data) {
      res.status(200).json({
        data,
      });
    } else {
      res.status(500).json({
        Message: "Invalied ID...!",
      });
    }
  } catch (error) {
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};
exports.deleteByIdCustomerDetail = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await customerDetail.deleteOne({ _id: id });
    if (data?.deletedCount > 0) {
      res.status(200).json({
        Message: "Requested Data Is Successfully Deleted...!",
      });
    } else {
      res.status(500).json({
        Message: "Invalied ID...!",
      });
    }
  } catch (error) {
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};
