const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const productsController = require("./controller/product-controller.js");
const usersController = require("./controller/user-controller.js");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.use(cors({ origin: [process.env.ORIGIN], exposedHeaders: ["token"] }));

app.use("/api/products", productsController);
app.use("/api/auth", usersController);
app.use("/api/swagger-ui", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((err, req, res, _) => {
  console.error(err);
  res.status(500).json({ msg: "Internal server error" });
});

mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database not connected!\n", err));

app.listen(port, () => console.log(`Server running on port ${port}...`));
