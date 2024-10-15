const convertDiscountedPrice = (price, discount) =>
  Math.round(price * (1 - discount / 100));
module.exports = convertDiscountedPrice;
