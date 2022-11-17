const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Files = new Schema({
  blob: {
    type: Object,
    require: true,
  },
});

const submission = mongoose.model("Files", Files);

module.exports = submission;
