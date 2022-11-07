const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
var multer = require("multer");
var jwt = require("express-jwt");
var jwks = require("jwks-rsa");
var fs = require("fs");
require("dotenv").config();

var tls;
try {
  tls = require("node:tls");
} catch (err) {
  console.log("tls support is disabled!");
}
var msg = "hey world";
var options = {
  key: fs.readFileSync("ryans-key.pem"),
  cert: fs.readFileSync("ryans-cert.pem"),
};

const server = tls.createServer(options, function (s) {
  s.write(msg + "\n");
  s.pipe(s);
});
// const server = http.createServer(app);

//request allow any domain
app.use(cors({ origin: "*" }));

const verifyJwt = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH_ISSUER}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH_ISSUER}/`,
  algorithms: ["RS256"],
});

app.use(verifyJwt);

//Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// Cookie parser
app.use(cookieParser());

app.use(bodyParser.json());

// api to reseive files from client and save it to file folder
app.post("/upload", (req, res) => {
  // encode userid with base64 to avoid special characters
  const encodedUserId = Buffer.from(req.headers.userid).toString("base64");

  // create a sub folder inside file folder
  var dir = "./files/" + encodedUserId;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // save file to sub folder
      cb(null, "files/" + encodedUserId);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

  var upload = multer({ storage: storage }).single("file");

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).send(req.file);
  });
});

// api to get all files from file folder
app.get("/files", (req, res) => {
  // encode userid with base64 to avoid special characters
  const encodedUserId = Buffer.from(req.headers.userid).toString("base64");

  // get all files from sub folder and send it to client as base64 string
  fs.readdir("./files/" + encodedUserId, (err, files) => {
    if (err) {
      return res.status(500).json(err);
    }
    var fileArray = [];
    files.forEach((file) => {
      var fileObj = {};
      fileObj.name = file;
      fileObj.file = fs.readFileSync("./files/" + encodedUserId + "/" + file, {
        encoding: "base64",
      });
      fileObj.type = file.split(".")[1];
      fileArray.push(fileObj);
    });
    return res.status(200).send(fileArray);
  });
});

// api to delete file from file folder
app.delete("/files/:name", (req, res) => {
  // encode userid with base64 to avoid special characters
  const encodedUserId = Buffer.from(req.headers.userid).toString("base64");

  // delete file from sub folder
  fs.unlink("./files/" + encodedUserId + "/" + req.params.name, (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).send("File deleted successfully");
  });
});

// api to receive message from client
app.post("/message", (req, res) => {
  try {
    console.log(req.body.message);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, console.log(`Server running on port ${PORT}`));

module.exports = app;
