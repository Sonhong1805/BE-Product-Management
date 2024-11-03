const categoryModel = require("../models/category.model");

const findParentCategories = async (slug, result = []) => {
  const category = await categoryModel.findOne({ slug });
  if (category) {
    result.push(category);
    if (category.parent_slug) {
      await findParentCategories(category.parent_slug, result);
    }
  }
  return result;
};

module.exports.getParentCategory = async (slug) => {
  try {
    const parents = await findParentCategories(slug);
    return parents;
  } catch (error) {}
};
