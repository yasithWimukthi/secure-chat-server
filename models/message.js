const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Messages = new Schema({
  text: {
    type: String,
    require: true,
  },
});

const submission = mongoose.model("Messages", Messages);

module.exports = submission;
