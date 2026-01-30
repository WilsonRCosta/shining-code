const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const productsController = require("./controller/product-controller.js");
const usersController = require("./controller/user-controller.js");
const imagesController = require("./controller/images-controller.js");
const cors = require("cors");
const errorHandler = require("./middlewares/error-handler");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.ORIGIN || "http://localhost:5173"],
    credentials: true,
  })
);
app.use("/api/products", productsController);
app.use("/api/auth", usersController);
app.use("/api/images", imagesController);
app.use("/api/swagger-ui", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res) => res.status(404).json({ msg: "Route not found" }));

app.use(errorHandler); // error fallbacks

mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database not connected!\n", err));

app.listen(port, () => console.log(`Server running on port ${port}...`));
