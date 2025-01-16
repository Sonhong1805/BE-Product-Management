const asyncHandler = require("express-async-handler");
const productModel = require("../models/product.model");
const convertDiscountedPrice = require("../helpers/discountedPrice");
const { getChildCategory } = require("../helpers/getSubCategory");
const categoryModel = require("../models/category.model");
const { getParentCategory } = require("../helpers/getParentCategory");
const { default: mongoose } = require("mongoose");

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
        const subCategories = await getChildCategory(slug);
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

    if (queryObj?.label?.trim()) {
      queryObj["label.value"] = {
        $regex: `^${queryObj.label}$`,
        $options: "i",
      };
      delete queryObj.label;
    }

    if (queryObj?.colors?.length) {
      queryObj.colors = { $elemMatch: { value: queryObj.colors } };
    }
    if (queryObj?.tags?.length) {
      queryObj.tags = { $elemMatch: { value: queryObj.tags } };
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
    const limit = +req.query.limit || 4;
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
      priceMax: priceMax?.discountedPrice,
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
    const response = await productModel
      .findOne({ slug })
      .populate("category")
      .populate({ path: "ratings.user", select: "fullname avatar" });
    if (response) {
      res.status(200).json({
        success: true,
        message: "Chi tiết sản phẩm",
        data: response,
      });
    }
  });

  create = asyncHandler(async (req, res) => {
    const {
      title,
      slug,
      description,
      category,
      label,
      price,
      discount,
      descriptions,
      quantity,
    } = req.body;

    const tags = JSON.parse(req.body.tags);
    const colors = JSON.parse(req.body.colors);

    const thumbnail = req?.files?.thumbnail?.[0]?.path || "";
    const images = req?.files?.images?.map((file) => file.path) || [];
    const discountedPrice = convertDiscountedPrice(price, discount || 0);
    const validCategory = category ? category : null;
    const validLabel = label ? JSON.parse(label) : null;

    const response = await productModel.create({
      title,
      slug,
      description,
      thumbnail,
      images,
      category: validCategory,
      label: validLabel,
      price,
      discount,
      discountedPrice,
      descriptions,
      quantity,
      tags,
      colors,
    });

    if (response) {
      const productId = response._id;
      if (validCategory) {
        const categoryData = await categoryModel.findById(validCategory);
        if (categoryData) {
          const { slug } = categoryData;
          const parents = await getParentCategory(slug);
          const parentIds = parents.map((parent) => parent._id);

          await categoryModel.updateMany(
            { _id: { $in: parentIds } },
            { $push: { productIds: productId } }
          );
        }
      }
      // await categoryModel.updateMany(
      //   { _id: { $in: parentIds } },
      //   { $inc: { quantity: 1 } }
      // );
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
      slug,
      description,
      label,
      thumbnail: thumbnailBody,
      images: imagesBody,
      category,
      price,
      discount,
      descriptions,
      quantity,
    } = req.body;

    const currentProduct = await productModel.findById(id).select("category");

    const tags = JSON.parse(req.body.tags);
    const colors = JSON.parse(req.body.colors);

    const thumbnail = req?.files?.thumbnail?.[0]?.path || thumbnailBody || "";

    const imageArr = JSON.parse(imagesBody || "[]");
    const imagesPath = req?.files?.images?.map((file) => file.path) || [];
    const images = [...imageArr, ...imagesPath];
    const discountedPrice = convertDiscountedPrice(price, discount);
    const validCategory = category ? category : null;
    const validLabel = label ? JSON.parse(label) : null;

    const response = await productModel.findByIdAndUpdate(
      { _id: id },
      {
        title,
        slug,
        description,
        thumbnail,
        images,
        category: validCategory,
        label: validLabel,
        price,
        discount,
        discountedPrice,
        descriptions,
        quantity,
        tags,
        colors,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (response) {
      const categoryProduct = response.category;
      const isCompare =
        categoryProduct.toString() === currentProduct.category.toString();
      if (!isCompare) {
        // xoá id ở danh mục cũ
        const currentCategory = await categoryModel
          .findById(currentProduct.category.toString())
          .select("productIds parent_slug");
        const currentParentCategories = await getParentCategory(
          currentCategory.parent_slug
        );
        const currentParentIds = currentParentCategories.map(
          (category) => category._id
        );
        const parentIds = [currentCategory._id, ...currentParentIds];
        await categoryModel.updateMany(
          { _id: { $in: parentIds } },
          { $pull: { productIds: id } }
        );

        // cập nhật id cho danh mục mới
        const newCategory = await categoryModel.findById(validCategory);
        if (newCategory) {
          const { slug } = newCategory;
          const parentCategories = await getParentCategory(slug);
          const parentIds = parentCategories.map((parent) => parent._id);
          await categoryModel.updateMany(
            { _id: { $in: parentIds } },
            { $addToSet: { productIds: id } }
          );
        }
      }
      res.status(200).json({
        success: true,
        message: "Cập nhật sản phẩm thành công",
        data: response,
      });
    }
  });

  delete = asyncHandler(async (req, res) => {
    const { pid, cid } = req.params;
    console.log(pid, cid);

    const response = await productModel.findByIdAndUpdate(
      { _id: pid },
      {
        deleted: true,
      }
    );

    if (response) {
      if (cid && mongoose.Types.ObjectId.isValid(cid)) {
        const productId = pid;
        const { slug } = await categoryModel.findById(cid);
        const parents = await getParentCategory(slug);
        const parentIds = parents.map((parent) => parent._id);
        await categoryModel.updateMany(
          { _id: { $in: parentIds } },
          { $pull: { productIds: productId } }
        );
      }
      res.status(200).json({
        success: true,
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

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    if (field === "deleted" || feature === "status-false") {
      await categoryModel.updateMany(
        { productIds: { $in: objectIds } },
        { $pull: { productIds: { $in: objectIds } } }
      );
    } else if (feature === "status-true") {
      //  Lấy danh mục liên quan của từng sản phẩm
      const products = await productModel
        .find({ _id: { $in: ids } })
        .select("category");
      const categoryIds = products.map((product) => product.category);

      const categories = await categoryModel
        .find({ _id: { $in: categoryIds } })
        .select("slug");

      const categorySlugs = categories.map((category) => category.slug);

      // Lấy danh mục cha của từng danh mục
      const parentCategories = await Promise.all(
        categorySlugs.map((slug) => getParentCategory(slug))
      );

      //  Lấy tất cả _id của danh mục cha
      const parentIds = Array.from(
        new Set(parentCategories.flat().map((parent) => parent._id))
      );

      await categoryModel.updateMany(
        { _id: { $in: parentIds } },
        { $addToSet: { productIds: { $each: objectIds } } }
      );
    }

    if (response) {
      res.status(200).json({
        success: true,
        message: "Áp dụng thành công",
      });
    }
  });
}

module.exports = new productsController();

// Lấy danh mục cha của từng danh mục con
// const parentCategories = await Promise.all(
//   categorySlugs.map((slug) => getParentCategory(slug))
// );

// Làm phẳng danh sách danh mục cha
// const flatParentCategories = parentCategories.flat();

// Tạo map để đếm số lần mỗi danh mục cha xuất hiện
// const parentCounts = flatParentCategories.reduce((acc, parent) => {
//   acc[parent._id] = (acc[parent._id] || 0) + 1;
//   return acc;
// }, {});

// Giảm số lượng của danh mục cha
// for (const [parentId, count] of Object.entries(parentCounts)) {
//   await categoryModel.updateOne(
//     { _id: parentId },
//     { $inc: { quantity: -count } }
//   );
// }
