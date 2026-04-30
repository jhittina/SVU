const moment = require("moment/moment");
const { objSum, arrayOfObjectfilter } = require("../common-function");
const { getPaginatedData } = require("../common-function/pagination");
const production = require("../models/production");

exports.production = async (req, res) => {
  try {
    req.body.date = new Date(moment(req?.body?.date).format("YYYY-MM-DD"));
    const id = req.query.id;
    const isExist = await production.findOne({ _id: id }).exec();
    if (isExist) {
      var myquery = { _id: id };
      var newvalues = {
        $set: req.body,
      };
      const data = await production.updateOne(myquery, newvalues).exec();
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
      const _production = new production(req.body);
      const data = await _production.save();
      if (data) {
        res.status(200).json({
          Message: "Requested Data Is Successfully Created...!",
        });
      } else {
        res.status(500).json({
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

exports.getAllProduction = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";

    // Build filter
    const filter = {};
    if (req?.query?.startDate && req?.query?.endDate) {
      const startDate = new Date(
        moment(req?.query?.startDate).format("YYYY-MM-DD"),
      );
      const endDate = new Date(
        moment(req?.query?.endDate).format("YYYY-MM-DD"),
      );
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Get paginated data
    const result = await getPaginatedData(production, {
      page,
      limit,
      search,
      searchFields: ["type"],
      filter,
      sort: { date: -1, createdAt: -1 },
    });

    // Calculate total production
    const allData = await production.find(filter);
    const totalProduction =
      allData.length > 0 ? objSum(allData, "quantity") : 0;

    res.status(200).json({
      ...result,
      totalProduction,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      Message: "Something Went Wrong ...!",
    });
  }
};

exports.getByIdProduction = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await production.findById(id);
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
exports.deleteByIdProduction = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await production.deleteOne({ _id: id });
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
