const convertDiscountedPrice = (price, discount = 0) =>
  Math.round(price * (1 - discount / 100));
module.exports = convertDiscountedPrice;
