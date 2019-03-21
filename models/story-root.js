const mongoose = require("mongoose");
const _ = require("lodash");

const StoryRootSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 1
  },
  imgPath: {
    type: String,
    required: true,
    trim: true,
    unique: false
  },
  summary: {
    type: String,
    required: true,
    minLength: 1
  },
  _authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true
  },
  _rootTextId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Text",
    required: true
  }
});

StoryRootSchema.methods.toJSON = function() {
  let storyRoot = this;
  let storyRootObject = storyRoot.toObject();
  storyRoot = _.pick(storyRootObject, [
    "_id",
    "title",
    "summary",
    "imgPath",
    "_authorId",
    "_rootTextId"
  ]);
  return storyRoot;
};

StoryRootSchema.statics.findByAuthorId = function(_authorId) {
  return StoryRoot.find({ _authorId }).then(stories => {
    if (!stories) {
      return Promise.resolve([]);
    }
    return Promise.resolve(stories);
  });
};

const StoryRoot = mongoose.model("StoryRoot", StoryRootSchema);

module.exports = {
  StoryRoot
};
