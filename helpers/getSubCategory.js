const categoryModel = require("../models/category.model");

module.exports.getChildCategory = async (parentSlug) => {
  const getCategory = async (slug) => {
    const subs = await categoryModel.find({
      parent_slug: slug,
      status: true,
      deleted: false,
    });

    let allSub = [...subs];
    for (const sub of subs) {
      const childs = await getCategory(sub.slug);
      allSub = allSub.concat(childs);
    }
    return allSub;
  };

  return await getCategory(parentSlug);
};
