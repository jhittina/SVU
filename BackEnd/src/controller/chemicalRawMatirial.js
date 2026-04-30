const { objSum } = require("../common-function");
const { getPaginatedData } = require("../common-function/pagination");
const chemicalRawMatirial = require("../models/chemicalRawMatirial");
const moment = require("moment/moment");

exports.chemicalRawMatirial = async (req, res) => {
  try {
    req.body.amount =
      req.body.pricePerLiter * req.body.noLiter +
      req.body.transportCharge +
      req.body.gstAmount;
    const id = req.query.id;
    const isExist = await chemicalRawMatirial.findOne({ _id: id }).exec();
    if (isExist) {
      var myquery = { _id: id };
      var newvalues = {
        $set: req.body,
      };
      const data = await chemicalRawMatirial
        .updateOne(myquery, newvalues)
        .exec();
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
      const _chemicalRawMatirial = new chemicalRawMatirial(req.body);
      const data = await _chemicalRawMatirial.save();
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

exports.getAllchemicalRawMatirial = async (req, res) => {
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

    const result = await getPaginatedData(chemicalRawMatirial, {
      page,
      limit,
      search,
      searchFields: ["companyName", "chemicalName"],
      filter,
      sort: { createdAt: -1 },
    });

    // Calculate totals from all matching records
    const allData = await chemicalRawMatirial.find(filter);
    const totalSum = allData.length > 0 ? objSum(allData, "amount") : 0;
    const totalLiter = allData.length > 0 ? objSum(allData, "noLiter") : 0;

    res.status(200).json({
      ...result,
      totalAmount: totalSum,
      totalLiter,
    });
  } catch (error) {
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};

exports.getByIdchemicalRawMatirial = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await chemicalRawMatirial.findById(id);
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
exports.deleteByIdchemicalRawMatirial = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await chemicalRawMatirial.deleteOne({ _id: id });
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
