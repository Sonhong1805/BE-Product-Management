const asyncHandler = require("express-async-handler");
const userModel = require("../models/user.model");

class accountsController {
  index = asyncHandler(async (req, res) => {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    queryObj.deleted = false;

    if (queryObj?.fullname?.trim()) {
      queryObj.$or = [
        { fullname: { $regex: queryObj.fullname, $options: "i" } },
        { email: { $regex: queryObj.fullname, $options: "i" } },
      ];

      delete queryObj.fullname;
    }

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    let query = userModel.find(JSON.parse(queryString));

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-updatedAt");
    }

    const page = +req.query.page || 1;
    const limit = +req.query.limit || 5;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    query = query.populate("role");

    const [accounts, totalItems] = await Promise.all([
      query.select("-password").exec(),
      userModel.find(JSON.parse(queryString)).countDocuments(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      message: "Danh sách tài khoản",
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
      data: accounts,
    });
  });

  detail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await userModel
      .findOne({ _id: id })
      .populate({ path: "role", select: "_id title" });
    if (response) {
      res.status(200).json({
        success: !!response,
        message: "Chi tiết tài khoản",
        data: response,
      });
    }
  });

  create = asyncHandler(async (req, res) => {
    const { fullname, email, password, gender, phone, address, role } =
      req.body;
    const avatar = req?.file?.path || "";

    const response = await userModel.create({
      fullname,
      email,
      avatar,
      password,
      gender,
      phone,
      address,
      role,
    });

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Tạo mới tài khoản thành công",
      });
    }
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { fullname, email, gender, phone, address, role } = req.body;
    const avatar = req?.file?.path || "";
    const response = await userModel.findByIdAndUpdate(
      { _id: id },
      {
        fullname,
        email,
        avatar,
        gender,
        phone,
        address,
        role,
      },
      { new: true }
    );

    if (response) {
      res.status(200).json({
        success: !!response,
        message: "Cập nhật tài khoản thành công",
        data: response,
      });
    }
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const response = await userModel.findByIdAndUpdate(
      { _id: id },
      {
        deleted: true,
      }
    );

    if (response) {
      res.status(200).json({
        success: !!response,
        message: "Xoá tài khoản thành công",
        data: {
          _id: response._id,
        },
      });
    }
  });

  changeFeature = asyncHandler(async (req, res) => {
    const { ids, feature } = req.body;
    const field = feature.split("-")[0];
    const value = feature.split("-")[1];
    const response = await userModel.updateMany(
      { _id: { $in: ids } },
      { $set: { [field]: value } },
      { multi: true }
    );

    if (response) {
      res.status(200).json({
        success: !!response,
        message: "Áp dụng thành công",
        data: response,
      });
    }
  });

  updatePermissions = asyncHandler(async (req, res) => {
    const { roles } = req.body;

    for (const role of roles) {
      await userModel.findByIdAndUpdate(
        { _id: role._id },
        {
          permissions: role.permissions,
        },
        { new: true }
      );
    }
    res.status(200).json({
      success: true,
      message: "Cập nhật tài khoản thành công",
    });
  });
}

module.exports = new accountsController();
