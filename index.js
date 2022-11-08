const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http");
var fs = require("fs");
require("dotenv").config();

// SSL
const cert = fs.readFileSync("./ssl/cert.pem");
const key = fs.readFileSync("./ssl/ssdapi.key");
const origin_ca_ecc_root = fs.readFileSync("./ssl/origin_ca_ecc_root.pem");
const origin_ca_rsa_root = fs.readFileSync("./ssl/origin_ca_rsa_root.pem");
const authenticated_origin_pull_ca = fs.readFileSync(
  "./ssl/authenticated_origin_pull_ca.pem"
);

const options = {
  cert: authenticated_origin_pull_ca,
  key: key,
  ca: [origin_ca_ecc_root, origin_ca_rsa_root],
};

const server = http.createServer(options, app);

//request allow any domain
app.use(cors({ origin: "*" }));

//Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// Cookie parser
app.use(cookieParser());

app.use(bodyParser.json());

// Import routes
const routes = require("./routes/routes");

// Route middlewares
app.use("/api/v1", routes);

const PORT = process.env.PORT || 8443;

server.listen(8443, console.log(`Server running on port ${PORT}`));

module.exports = app;
