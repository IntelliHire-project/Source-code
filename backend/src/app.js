const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const valuesRoutes = require("./routes/valuesRoutes");
const cvRoutes = require("./routes/cvRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const vacancyRoutes = require("./routes/vacancyRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const questionRoutes = require("./routes/questionRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
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
app.use("/vacancies", vacancyRoutes);
app.use("/payments", paymentRoutes);
app.use("/questions", questionRoutes);

// Interview Management Routes (Supports both direct and Nginx-proxied paths)
app.use("/interviews", interviewRoutes);
app.use("/api/interviews", interviewRoutes);

// Recruiter Analytics Routes (Supports both direct and Nginx-proxied paths)
app.use("/analytics", analyticsRoutes);
app.use("/api/analytics", analyticsRoutes);

// Global Error Handler Middleware (must be registered last)
app.use(errorHandler);

module.exports = app;
