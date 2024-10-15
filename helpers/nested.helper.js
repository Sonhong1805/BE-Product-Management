const createNested = (arr, parentId) => {
  const nested = [];
  let count = 0;

  arr.forEach((item) => {
    if (item.parent_slug === parentId) {
      count++;
      const newItem = { ...item, index: count };
      const children = createNested(arr, item._id);
      if (children.length > 0) {
        newItem.children = children;
      }
      nested.push(newItem);
    }
  });
  return nested;
};

module.exports.nested = (arr, parentId) => {
  return createNested((arr = []), parentId);
};
