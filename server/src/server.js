const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const productsRoute = require("./routes/products.js");
const authRoute = require("./routes/auth.js");
const imagesRoute = require("./routes/images.js");
const paymentsRoute = require("./routes/payments.js");
const cors = require("cors");
const errorHandler = require("./middlewares/error-handler");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 8000;

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.ORIGIN || "http://localhost:5173"],
    credentials: true,
  })
);
app.use("/api/auth", authRoute);
app.use("/api/images", imagesRoute);
app.use("/api/payments", paymentsRoute);
app.use("/api/products", productsRoute);
app.use("/api/swagger-ui", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res) => res.status(404).json({ msg: "Route not found" }));

app.use(errorHandler); // error fallbacks

mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database not connected!\n", err));

app.listen(port, () => console.log(`Server running on port ${port}...`));
