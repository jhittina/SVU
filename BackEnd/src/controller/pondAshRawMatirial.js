const { objSum } = require("../common-function");
const { getPaginatedData } = require("../common-function/pagination");
const pondAshRawMatirial = require("../models/pondAshRawMatirial");
const moment = require("moment/moment");

exports.pondAshRawMatirial = async (req, res) => {
  try {
    const id = req.query.id;
    const isExist = await pondAshRawMatirial.findOne({ _id: id }).exec();
    if (isExist) {
      var myquery = { _id: id };
      var newvalues = {
        $set: req.body,
      };
      const data = await pondAshRawMatirial
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
      const _pondAshRawMatirial = new pondAshRawMatirial(req.body);
      const data = await _pondAshRawMatirial.save();
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

exports.getAllpondAshRawMatirial = async (req, res) => {
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

    const result = await getPaginatedData(pondAshRawMatirial, {
      page,
      limit,
      search,
      searchFields: ["companyName"],
      filter,
      sort: { createdAt: -1 },
    });

    // Calculate totals from all matching records
    const allData = await pondAshRawMatirial.find(filter);
    const totalTon = allData.length > 0 ? objSum(allData, "numberOfTon") : 0;
    const totalAmount = allData.length > 0 ? objSum(allData, "amount") : 0;

    res.status(200).json({
      ...result,
      totalTon,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};

exports.getByIdpondAshRawMatirial = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await pondAshRawMatirial.findById(id);
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
exports.deleteByIdpondAshRawMatirial = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await pondAshRawMatirial.deleteOne({ _id: id });
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
