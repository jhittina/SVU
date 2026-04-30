const { objSum } = require("../common-function");
const { getPaginatedData } = require("../common-function/pagination");
const dustAndPowderRawMatirial = require("../models/dustAndPowderRawMatirial");
const moment = require("moment/moment");

exports.dustAndPowderRawMatirial = async (req, res) => {
  try {
    req.body.amount = req.body.quantity * req.body.pricePerQuantity;
    const id = req.query.id;
    const isExist = await dustAndPowderRawMatirial.findOne({ _id: id }).exec();
    if (isExist) {
      var myquery = { _id: id };
      var newvalues = {
        $set: req.body,
      };
      const data = await dustAndPowderRawMatirial
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
      const _dustAndPowderRawMatirial = new dustAndPowderRawMatirial(req.body);
      const data = await _dustAndPowderRawMatirial.save();
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

exports.getAlldustAndPowderRawMatirial = async (req, res) => {
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

    const result = await getPaginatedData(dustAndPowderRawMatirial, {
      page,
      limit,
      search,
      searchFields: ["companyName", "materialType"],
      filter,
      sort: { createdAt: -1 },
    });

    // Calculate totals from all matching records
    const allData = await dustAndPowderRawMatirial.find(filter);
    const totalTrip = allData.length > 0 ? objSum(allData, "quantity") : 0;
    const totalaAmount = allData.length > 0 ? objSum(allData, "amount") : 0;

    res.status(200).json({
      ...result,
      totalTrip,
      totalaAmount,
    });
  } catch (error) {
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};

exports.getByIddustAndPowderRawMatirial = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await dustAndPowderRawMatirial.findById(id);
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
exports.deleteByIddustAndPowderRawMatirial = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await dustAndPowderRawMatirial.deleteOne({ _id: id });
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
