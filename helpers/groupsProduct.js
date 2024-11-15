const groupItems = (array) => {
  const groupItems = array?.reduce((groups, item) => {
    const existGroup = groups.find((group) => group.slug === item.slug);
    if (existGroup) {
      existGroup.quantity += item.quantity;
    } else {
      groups.unshift({
        slug: item.slug,
        quantity: item.quantity,
      });
    }
    return groups;
  }, []);
  return groupItems;
};

module.exports = groupItems;
