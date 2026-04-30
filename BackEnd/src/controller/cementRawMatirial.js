const { objSum } = require("../common-function");
const { getPaginatedData } = require("../common-function/pagination");
const cementRawMatirial = require("../models/cementRawMatirial");
const moment = require("moment/moment");

exports.cementRawMatirial = async (req, res) => {
  try {
    req.body.amount =
      req.body.pricePerBag * req.body.quantity + req.body.transportCharge;
    const id = req.query.id;
    const isExist = await cementRawMatirial.findOne({ _id: id }).exec();
    if (isExist) {
      var myquery = { _id: id };
      var newvalues = {
        $set: req.body,
      };
      const data = await cementRawMatirial.updateOne(myquery, newvalues).exec();
      if (data.nModified === 1) {
        res.status(200).json({
          Message: "Requested Data Is Successfully Updated...!",
        });
      } else {
        res.status(500).json({
          Message: "Failed to Update the Data...!",
        });
      }
    } else {
      const _cementRawMatirial = new cementRawMatirial(req.body);
      const data = await _cementRawMatirial.save();
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
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};

exports.getAllcementRawMatirial = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const filter = {};

    if (req?.query?.startDate && req?.query?.endDate) {
      const startDate = new Date(
        moment(req?.query?.startDate).format("YYYY-MM-DD"),
      );
      const endDate = new Date(
        moment(req?.query?.endDate).format("YYYY-MM-DD"),
      );
      filter["date"] = { $gte: startDate, $lte: endDate };
    }

    const result = await getPaginatedData(cementRawMatirial, {
      page,
      limit,
      search,
      searchFields: ["companyName", "materialType"],
      filter,
      sort: { createdAt: -1 },
    });

    // Calculate totals from all matching records
    const allData = await cementRawMatirial.find(filter);
    const bagSum = allData.length > 0 ? objSum(allData, "quantity") : 0;
    const tonSum = allData.length > 0 ? objSum(allData, "numberOfTon") : 0;
    const amount = allData.length > 0 ? objSum(allData, "amount") : 0;

    res.status(200).json({
      ...result,
      totalBag: bagSum,
      totalTon: tonSum,
      totalSum: amount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};

exports.getByIdcementRawMatirial = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await cementRawMatirial.findById(id);
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
exports.deleteByIdcementRawMatirial = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await cementRawMatirial.deleteOne({ _id: id });
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
