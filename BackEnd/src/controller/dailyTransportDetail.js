const { objSum } = require("../common-function");
const { getPaginatedData } = require("../common-function/pagination");
const dailyTransportDetail = require("../models/dailyTransportDetail");
const moment = require("moment/moment");

exports.dailyTransportDetail = async (req, res) => {
  try {
    req.body.amount = req.body.perTrip * req.body.trip;
    const id = req.query.id;
    const isExist = await dailyTransportDetail.findOne({ _id: id }).exec();
    if (isExist) {
      var myquery = { _id: id };
      var newvalues = {
        $set: req.body,
      };
      const data = await dailyTransportDetail
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
      const _dailyTransportDetail = new dailyTransportDetail(req.body);
      const data = await _dailyTransportDetail.save();
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

exports.getAlldailyTransportDetail = async (req, res) => {
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

    const result = await getPaginatedData(dailyTransportDetail, {
      page,
      limit,
      search,
      searchFields: ["vehicleNo", "driverName"],
      filter,
      sort: { createdAt: -1 },
    });

    // Calculate total quantity from all matching records
    const allData = await dailyTransportDetail.find(filter);
    const sum = allData.length > 0 ? objSum(allData, "quantity") : 0;

    res.status(200).json({
      ...result,
      totaldailyTransportDetail: sum,
    });
  } catch (error) {
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};

exports.getByIddailyTransportDetail = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await dailyTransportDetail.findById(id);
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
exports.deleteByIddailyTransportDetail = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await dailyTransportDetail.deleteOne({ _id: id });
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
