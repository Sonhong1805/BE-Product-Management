const express = require("express");
const app = express();
const systemConfig = require("./configs/system");
const clientRoute = require("./routes/client");
const adminRoute = require("./routes/admin");
const database = require("./configs/database");
require("dotenv").config();
const port = process.env.PORT;

database.connect(app);
systemConfig(app);
adminRoute(app);
clientRoute(app);

app.listen(port, () => {
  console.log(`Product management project listening on port ${port}`);
});
