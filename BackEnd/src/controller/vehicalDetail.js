const { objSum, phoneNumber } = require("../common-function");
const { getPaginatedData } = require("../common-function/pagination");
const vehicalDetail = require("../models/vehicalDetail");
const moment = require("moment/moment");

exports.vehicalDetail = async (req, res) => {
  try {
    console.log(req.body);
    const id = req.query.id;
    const isExist = await vehicalDetail.findOne({ _id: id }).exec();
    if (phoneNumber(req.body.contactNumber) === false)
      return res.status(500).json({ Message: "Invalied Phone Number...!" });
    if (isExist) {
      var myquery = { _id: id };
      var newvalues = {
        $set: req.body,
      };
      const data = await vehicalDetail.updateOne(myquery, newvalues).exec();
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
      const _production = new vehicalDetail(req.body);
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

exports.getAllvehicalDetail = async (req, res) => {
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

    const result = await getPaginatedData(vehicalDetail, {
      page,
      limit,
      search,
      searchFields: ["vehicleNo", "vehicleType"],
      filter,
      sort: { createdAt: -1 },
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};

exports.getByIdvehicalDetail = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await vehicalDetail.findById(id);
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
exports.deleteByIdvehicalDetail = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await vehicalDetail.deleteOne({ _id: id });
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
