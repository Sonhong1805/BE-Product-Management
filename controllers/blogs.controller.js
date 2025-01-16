const blogModel = require("../models/blog.model");
const asyncHandler = require("express-async-handler");

class BlogsController {
  index = asyncHandler(async (req, res) => {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    queryObj.deleted = false;

    if (queryObj?.title?.trim()) {
      queryObj.$or = [
        { title: { $regex: queryObj.title, $options: "i" } },
        { slug: { $regex: queryObj.title, $options: "i" } },
        { author: { $regex: queryObj.title, $options: "i" } },
      ];

      delete queryObj.title;
    }

    if (queryObj?.topic?.trim()) {
      queryObj["topic.value"] = {
        $regex: `^${queryObj.topic}$`,
        $options: "i",
      };
      delete queryObj.topic;
    }

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    let query = blogModel.find(JSON.parse(queryString));

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
    const limit = +req.query.limit || 2;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    const [blogs, totalItems] = await Promise.all([
      query.exec(),
      blogModel.find(JSON.parse(queryString)).countDocuments(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      message: "Danh sách bài viết",
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
      data: blogs,
    });
  });

  detail = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const data = await blogModel.findOne({ slug, deleted: false });
    if (data) {
      res.status(200).json({
        success: true,
        message: "Chi tiết bài viết",
        data,
      });
    }
  });

  create = asyncHandler(async (req, res) => {
    const thumbnail = req?.file?.path;
    const { title, topic, content } = req.body;
    const validTopic = topic ? JSON.parse(topic) : null;

    const data = await blogModel.create({
      title,
      topic: validTopic,
      thumbnail,
      author: req.user.fullname,
      content,
    });
    if (data) {
      res.status(200).json({
        success: true,
        message: "Tạo mới bài viết thành công",
        data,
      });
    }
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, topic, content } = req.body;
    const thumbnail = req?.file?.path || req.body.thumbnail;
    const validTopic = topic ? JSON.parse(topic) : null;
    const response = await blogModel.findByIdAndUpdate(
      { _id: id },
      {
        title,
        topic: validTopic,
        thumbnail,
        author: req.user.fullname,
        content,
      },
      { new: true }
    );
    if (response) {
      res.status(200).json({
        success: true,
        message: "Cập nhật bài viết thành công",
        data: response,
      });
    }
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const response = await blogModel.findByIdAndUpdate(
      { _id: id },
      {
        deleted: true,
      },
      { new: true }
    );

    if (response) {
      res.status(200).json({
        success: true,
        message: "Xoá bài viết thành công",
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
    const response = await blogModel.updateMany(
      { _id: { $in: ids } },
      { $set: { [field]: value } },
      { multi: true }
    );

    if (response) {
      res.status(200).json({
        success: true,
        message: "Áp dụng thành công",
        data: response,
      });
    }
  });
}

module.exports = new BlogsController();
