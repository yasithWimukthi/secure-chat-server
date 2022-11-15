var multer = require("multer");
var fs = require("fs");
const router = require("express").Router();
var verifyJwt = require("../middleware/verifyJwt");
var {
  checkAdminPermissions,
  checkWorkerPermissions,
  checkManagerPermissions,
} = require("../middleware/jwtAuthz");

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

  var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "file/doc" ||
        file.mimetype == "file/docx" ||
        file.mimetype == "file/xls" ||
        file.mimetype == "file/xlsx" ||
        file.mimetype == "file/pdf"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(
          new Error("Only .doc, .docx, .xls, .xlsx, .pdf formats are allowed!")
        );
      }
    },
  }).single("file");

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
router.route("/message").post(verifyJwt, checkWorkerPermissions, (req, res) => {
  console.log(req.body.message);
  return res.status(200).send("Message received successfully");
});

module.exports = router;
