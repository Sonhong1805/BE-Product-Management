module.exports = (app) => {
  app.use("/admin", (req, res) => {
    res.send("Admin site");
  });
};
