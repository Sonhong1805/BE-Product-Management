const asyncHandler = require("express-async-handler");
const categoryModel = require("../models/category.model");
const { getParentCategory } = require("../helpers/getParentCategory");
const { getChildCategory } = require("../helpers/getSubCategory");

class CategoriesController {
  index = asyncHandler(async (req, res) => {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    queryObj.deleted = false;

    if (queryObj?.title?.trim()) {
      queryObj.$or = [
        { title: { $regex: queryObj.title, $options: "i" } },
        { slug: { $regex: queryObj.title, $options: "i" } },
      ];

      delete queryObj.title;
    }

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    let query = categoryModel.find(JSON.parse(queryString));

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

    const categories = await query.exec();

    res.status(200).json({
      success: true,
      message: "Danh sách danh mục",
      data: categories,
    });
  });

  getSubCategories = asyncHandler(async (req, res) => {
    const { categorySlug } = req.body;
    if (categorySlug) {
      const subCategories = await getChildCategory(categorySlug);
      const listOfSubCategories = await Promise.all(subCategories);
      const flattenedSubCategories = listOfSubCategories.flat();

      const updatedSubCategories = flattenedSubCategories.map((category) => {
        if (category.parent_slug === categorySlug) {
          category.parent_slug = "";
        }
        return category._doc;
      });

      const parentCategories = await getParentCategory(categorySlug);

      res.status(200).json({
        success: true,
        message: "Lấy toàn bộ danh mục con liên quan",
        data: updatedSubCategories,
        parentCategories,
      });
    } else {
      const categories = await categoryModel.find({});
      res.status(200).json({
        success: true,
        message: "Lấy toàn bộ danh mục liên quan",
        data: categories,
      });
    }
  });

  getParentCategories = asyncHandler(async (req, res) => {
    const { slug } = req.body;
    const parents = await getParentCategory(slug);
    res.json(parents);
  });

  detail = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const data = await categoryModel.findOne({ slug, deleted: false });
    if (data) {
      res.status(200).json({
        success: true,
        message: "Chi tiết danh mục",
        data,
      });
    }
  });

  create = asyncHandler(async (req, res) => {
    const { title, parent_slug } = req.body;
    const data = await categoryModel.create({ title, parent_slug });
    const categories = await categoryModel.find({}).sort("-updatedAt");
    if (data) {
      res.status(200).json({
        success: true,
        message: "Tạo mới danh mục thành công",
        data: categories,
      });
    }
  });

  update = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { title, parent_slug } = req.body;

    const currentCategory = await categoryModel
      .findOne({ slug })
      .select("productIds parent_slug");

    const currentParentCategories = await getParentCategory(
      currentCategory.parent_slug
    );

    const currentParentIds = currentParentCategories.map(
      (category) => category._id
    );
    const newParentCategories = await getParentCategory(parent_slug);
    const newParentIds = newParentCategories.map((category) => category._id);

    // cập nhật các id cho danh mục cha mới
    await categoryModel.updateMany(
      { _id: { $in: newParentIds } },
      { $addToSet: { productIds: { $each: currentCategory.productIds } } }
    );

    // xoá các id ở danh mục cha cũ
    await categoryModel.updateMany(
      { _id: { $in: currentParentIds } },
      { $pull: { productIds: { $in: currentCategory.productIds } } }
    );

    const response = await categoryModel.findOneAndUpdate(
      { slug },
      { title, parent_slug, updatedAt: new Date() },
      { new: true }
    );

    const categories = await categoryModel.find({}).sort("-updatedAt");

    if (response) {
      res.status(200).json({
        success: true,
        message: "Cập nhật danh mục thành công",
        data: categories,
      });
    }
  });

  async deleteCategoryWithChildren(slug) {
    await categoryModel.findOneAndDelete({ slug });

    const childCategories = await categoryModel.find({
      parent_slug: slug,
    });

    for (let child of childCategories) {
      await this.deleteCategoryWithChildren(child.slug);
    }
  }

  delete = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    await this.deleteCategoryWithChildren(slug);
    const categories = await categoryModel.find({}).sort("-updatedAt");

    res.status(200).json({
      success: true,
      message: "Xoá danh mục và các danh mục con thành công",
      data: categories,
    });
  });

  changeFeature = asyncHandler(async (req, res) => {
    const { slugs, feature } = req.body;
    const field = feature.split("-")[0];
    const value = feature.split("-")[1];
    const response = await categoryModel.updateMany(
      { slug: { $in: slugs } },
      { $set: { [field]: value } },
      { multi: true }
    );

    if (field === "deleted") {
      await Promise.all(
        slugs.map(async (slug) => await this.deleteCategoryWithChildren(slug))
      );
    }

    const categories = await categoryModel.find({}).sort("-updatedAt");

    if (response) {
      res.status(200).json({
        success: true,
        message: "Áp dụng thành công",
        data: categories,
      });
    }
  });
}

module.exports = new CategoriesController();
