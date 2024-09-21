const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
module.exports = (app) => {
  app.use(logger("dev"));
  app.use(express.json());
  app.use(cors(corsOptions));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(`${__dirname}/../public`));
};
