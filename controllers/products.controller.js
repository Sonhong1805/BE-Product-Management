const asyncHandler = require("express-async-handler");
const productModel = require("../models/product.model");
const convertDiscountedPrice = require("../helpers/discountedPrice");
const { getSubCategory } = require("../helpers/getSubCategory");
const categoryModel = require("../models/category.model");

class productsController {
  index = asyncHandler(async (req, res) => {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    queryObj.deleted = false;

    let categoryIds = [];
    const categorySlug = queryObj.categorySlug;
    if (categorySlug) {
      const subCategoryPromises = categorySlug.map(async (slug) => {
        const subCategories = await getSubCategory(slug);
        return subCategories;
      });
      const listOfSubCategories = await Promise.all(subCategoryPromises);
      const flattenedSubCategories = listOfSubCategories.flat();
      categoryIds = flattenedSubCategories.map((sub) => sub._id);
      if (Array.isArray(categorySlug)) {
        const additionalCategories = await categoryModel
          .find({
            slug: { $in: categorySlug },
          })
          .select("_id");
        const additionalCategoryIds = additionalCategories.map(
          (cat) => cat._id
        );
        categoryIds.push(...additionalCategoryIds);
      } else {
        categoryIds.push(category._id);
      }
      queryObj.category = { $in: categoryIds };
      delete queryObj.categorySlug;
    }

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

    let query = productModel.find(JSON.parse(queryString));

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
    query = query.populate("category");

    const [products, totalItems, priceMax] = await Promise.all([
      query.exec(),
      productModel.find(JSON.parse(queryString)).countDocuments(),
      productModel
        .findOne({})
        .select("discountedPrice")
        .sort({ discountedPrice: -1 })
        .limit(1),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      message: "Danh sách sản phẩm",
      priceMax: priceMax.discountedPrice,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
      data: products,
    });
  });

  detail = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const response = await productModel.findOne({ slug }).populate("category");
    if (response) {
      res.status(200).json({
        success: !!response,
        message: "Chi tiết sản phẩm",
        data: response,
      });
    }
  });

  create = asyncHandler(async (req, res) => {
    const { title, category, price, discount, descriptions, quantity } =
      req.body;

    const highlights = JSON.parse(req.body.highlights);

    const thumbnail = req?.files?.thumbnail?.[0]?.path || "";
    const images = req?.files?.images?.map((file) => file.path) || [];
    const discountedPrice = convertDiscountedPrice(price, discount);
    const validCategory = category ? category : null;

    const response = await productModel.create({
      title,
      thumbnail,
      images,
      category: validCategory,
      price,
      discount,
      discountedPrice,
      descriptions,
      quantity,
      highlights,
    });

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Tạo mới sản phẩm thành công",
        data: response,
      });
    }
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
      title,
      thumbnail: thumbnailBody,
      images: imagesBody,
      category,
      price,
      discount,
      descriptions,
      quantity,
    } = req.body;
    const highlights = JSON.parse(req.body.highlights);

    const thumbnail = req?.files?.thumbnail?.[0]?.path || thumbnailBody || "";

    const imageArr = JSON.parse(imagesBody || "[]");
    const imagesPath = req?.files?.images?.map((file) => file.path) || [];
    const images = [...imageArr, ...imagesPath];
    const discountedPrice = convertDiscountedPrice(price, discount);
    const validCategory = category ? category : null;
    const response = await productModel.findByIdAndUpdate(
      { _id: id },
      {
        title,
        thumbnail,
        images,
        category: validCategory,
        price,
        discount,
        discountedPrice,
        descriptions,
        quantity,
        highlights,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (response) {
      res.status(200).json({
        success: !!response,
        message: "Cập nhật sản phẩm thành công",
        data: response,
      });
    }
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const response = await productModel.findByIdAndUpdate(
      { _id: id },
      {
        deleted: true,
      }
    );

    if (response) {
      res.status(200).json({
        success: !!response,
        message: "Xoá sản phẩm thành công",
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
    const response = await productModel.updateMany(
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

  upload = asyncHandler(async (req, res) => {
    const { thumbnail, images } = req.files;
    console.log("thumbnail:" + thumbnail[0]?.path);
    console.log("images:" + images?.map((file) => file.path));

    res.status(200).json({
      success: true,
      message: "Upload thành công",
    });
  });
}

module.exports = new productsController();
