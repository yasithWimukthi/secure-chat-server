var multer = require("multer");
var fs = require("fs");
const router = require("express").Router();
var verifyJwt = require("../middleware/verifyJwt");
var maxSize = 5242880;

var {
  checkAdminPermissions,
  checkWorkerPermissions,
  checkManagerPermissions,
} = require("../middleware/jwtAuthz");
var crypto = require("node:crypto");
const mongoose = require("mongoose");
const Messages = require("../models/message");
const Files = require("../models/file");

const SHA256 = require("crypto-js/sha256");

// api to reseive files from client and save it to file folder
router
  .route("/upload")
  .post(verifyJwt, checkManagerPermissions, async (req, res) => {
    // encode userid with base64 to avoid special characters
    try {
      const encodedUserId = Buffer.from(req.headers.userid).toString("base64");
      var encryptedFile = new Blob([req.body.file]); // Create blob from string

      //validate file size
      if (encryptedFile.size <= 5000000) {
        const savedFile = await Files.create({ blob: encryptedFile });
        return res.status(200).send("success");
      } else {
        return res.status(400).send("file too large");
      }
    } catch (error) {
      return res.status(500).send("server error");
    }
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

router
  .route("/message")
  .post(verifyJwt, checkWorkerPermissions, async (req, res) => {
    try {
      // generate hmac signature
      var hmac = crypto.createHmac("sha512", "secret");
      hmac.update(req.body.message);
      var signature = hmac.digest("hex");

      // compare hmac signature with client signature
      if (signature === req.headers.signature) {
        const message = req.body.message;
        const savedMessage = await Messages.create({ text: message });
        return res.status(200).send("Message received successfully");
      } else {
        return res.status(401).send("Message currupted");
      }
    } catch (error) {
      console.log(error);
    }
  });

// function decryptFile(file) {
//   var reader = new FileReader();
//   reader.onload = () => {
//     var key = "1234567887654321";

//     var decrypted = CryptoJS.AES.decrypt(reader.result, key); // Decryption: I: Base64 encoded string (OpenSSL-format) -> O: WordArray
//     var typedArray = convertWordArrayToUint8Array(decrypted); // Convert: WordArray -> typed array

//     var fileDec = new Blob([typedArray]); // Create blob from typed array

//     return fileDec;
//   };
//   reader.readAsText(file);
// }

module.exports = router;
