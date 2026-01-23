const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const productsController = require("./controller/product-controller.js");
const usersController = require("./controller/user-controller.js");

dotenv.config();

const app = express();
const port = process.env.PORT || 8001;

app.use(express.json());

// API routes first
app.use("/api/products", productsController);
app.use("/api/auth", usersController);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve React only in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../client/build", "index.html"));
    });
}

mongoose.connect(process.env.DB_CONNECT, (err) =>
    err ? console.error("Database not connected!\n" + err) : console.log("Database connected")
);

app.listen(port, () => console.log(`Server running on port ${port}...`));
