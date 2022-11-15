const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http");
<<<<<<< HEAD
=======
const mongoose = require("mongoose");
>>>>>>> 6802ca4a7754b5fa4834c61a617a71de7c2ce238
var fs = require("fs");
require("dotenv").config();
require("./db")();

// SSL
// const cert = fs.readFileSync("./server.crt");
// const key = fs.readFileSync("./server.key");

// const options = {
//   key: key,
//   cert: cert,
// };

const server = http.createServer(app);
//const server = https.createServer(options, app);

//request allow any domain
app.use(cors({ origin: "*" }));

//Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cookie parser
app.use(cookieParser());

app.use(bodyParser.json());

// Import routes
const routes = require("./routes/routes");

// Route middlewares
app.use("/api/v1", routes);

const PORT = process.env.PORT || 8443;

server.listen(PORT, console.log(`Server running on port ${PORT}`));

module.exports = app;
