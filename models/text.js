const mongoose = require("mongoose");
const _ = require("lodash");

const TextSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  _authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true
  },
  _parentTextId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Text",
    required: true
  }
});

TextSchema.methods.toJSON = function() {
  let text = this;
  let textObject = text.toObject();
  text = _.pick(textObject, ["_id", "text", "_authorId", "_parentTextId"]);
  return text;
};

TextSchema.statics.findByAuthorId = function(_authorId) {
  return Text.find({ _authorId }).then(texts => {
    if (!texts) {
      return Promise.resolve([]);
    }
    return Promise.resolve(texts);
  });
};

const Text = mongoose.model("Text", TextSchema);

module.exports = {
  Text
};
