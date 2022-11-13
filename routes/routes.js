var multer = require("multer");
var fs = require("fs");
const router = require("express").Router();
var verifyJwt = require("../middleware/verifyJwt");
var {
  checkAdminPermissions,
  checkWorkerPermissions,
  checkManagerPermissions,
} = require("../middleware/jwtAuthz");
var crypto = require("node:crypto");

const mongoose = require("mongoose");
const Messages = require("../models/message");
const SHA256 = require("crypto-js/sha256");

// api to reseive files from client and save it to file folder
router.route("/upload").post(verifyJwt, checkManagerPermissions, (req, res) => {
  // encode userid with base64 to avoid special characters
  const encodedUserId = Buffer.from(req.headers.userid).toString("base64");

  // create a sub folder inside file folder
  var dir = "./files/" + encodedUserId;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
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
router.route("/files").get(verifyJwt, checkManagerPermissions, (req, res) => {
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
router
  .route("/files/:name")
  .delete(verifyJwt, checkManagerPermissions, (req, res) => {
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

// router
//   .route("/message")
//   .post(verifyJwt, checkManagerPermissions, async (req, res) => {
//     const message = req.body.message;
//     var hasheddata = SHA256(message).toString();
//     try {
//       const savedMessage = await Messages.create({ text: hasheddata });
//       return res
//         .status(200)
//         .send({ msg: "Message received successfully", savedMessage });
//     } catch (e) {
//       return res.status(500).send(e.error);
//     }
//   });

router.route("/message").post(verifyJwt, checkWorkerPermissions, async (req, res) => {
  // generate hmac signature
  var hmac = crypto.createHmac("sha512", "secret");
  hmac.update(req.body.message);
  var signature = hmac.digest("hex");

  // compare hmac signature with client signature
  if (signature === req.headers.signature) {
    const message = req.body.message;
    var hasheddata = SHA256(message).toString();
    const savedMessage = await Messages.create({ text: hasheddata });
    return res.status(200).send("Message received successfully");
  } else {
    return res.status(401).send("Message currupted");
  }
});


module.exports = router;
