require("dotenv").config();
const express = require("express");
const app = express();
const systemConfig = require("./configs/system");
const routes = require("./routes");
const database = require("./configs/database");
const port = process.env.PORT;

database.connect(app);
systemConfig(app);
routes(app);

app.listen(port, () => {
  console.log(`Product management project listening on port ${port}`);
});
