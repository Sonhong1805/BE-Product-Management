const asyncHandler = require("express-async-handler");
const roleModel = require("../models/role.model");

class rolesController {
  index = asyncHandler(async (req, res) => {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    queryObj.deleted = false;

    if (queryObj?.title?.trim()) {
      queryObj.title = { $regex: queryObj.title, $options: "i" };
    }

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    let query = roleModel.find(JSON.parse(queryString));

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

    const roles = await query.exec();

    res.status(200).json({
      success: true,
      message: "Danh sách vai trò",
      data: roles,
    });
  });

  detail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await roleModel.findOne({ _id: id });
    if (response) {
      res.status(200).json({
        success: !!response,
        message: "Chi tiết vai trò",
        data: response,
      });
    }
  });

  create = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    const response = await roleModel.create({
      title,
      description,
    });

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Tạo mới vai trò thành công",
        data: response,
      });
    }
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { title, description } = req.body;
    const response = await roleModel.findByIdAndUpdate(
      { _id: id },
      {
        title,
        description,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (response) {
      res.status(200).json({
        success: !!response,
        message: "Cập nhật vai trò thành công",
        data: response,
      });
    }
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const response = await roleModel.findByIdAndUpdate(
      { _id: id },
      {
        deleted: true,
      }
    );

    if (response) {
      console.log(response);

      res.status(200).json({
        success: !!response,
        message: "Xoá vai trò thành công",
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
    const response = await roleModel.updateMany(
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
      await roleModel.findByIdAndUpdate(
        { _id: role._id },
        {
          permissions: role.permissions,
        },
        { new: true }
      );
    }
    res.status(200).json({
      success: true,
      message: "Cập nhật vai trò thành công",
    });
  });
}

module.exports = new rolesController();
