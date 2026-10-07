const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const valuesRoutes = require("./routes/valuesRoutes");
const cvRoutes = require("./routes/cvRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hi");
});

app.use("/values", valuesRoutes);
app.use("/auth", authRoutes);
app.use("/", adminRoutes);
app.use("/cv", cvRoutes);
app.use("/candidate", candidateRoutes);

// Global Error Handler Middleware (must be registered last)
app.use(errorHandler);

module.exports = app;

