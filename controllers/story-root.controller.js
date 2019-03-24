const _ = require("lodash");
const { Text } = require("../models/text");
const { StoryRoot } = require("../models/story-root");
const { Author } = require("../models/author");

exports.createRoot = async function(req, res) {
  try {
    let storyRootBody = _.pick(req.body, [
      "title",
      "summary",
      "imgPath",
      "_authorId"
    ]);
    let rootText = new Text(_.pick(req.body, ["text", "_authorId"]));
    rootText = await rootText.save();
    let storyRoot = new StoryRoot(storyRootBody);
    storyRoot._rootTextId = rootText._id;
    storyRoot = await storyRoot.save();
    res.status(200).send(storyRoot);
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.getRootsByAuthorId = async function(req, res) {
  try {
    let authorId = req.params.id;
    const roots = await StoryRoot.findByAuthorId(authorId);
    res.status(200).send(roots);
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.getRootById = async function(req, res) {
  try {
    let storyRootId = req.params.id;
    const root = await StoryRoot.findById(storyRootId);
    const author = await Author.findById(root._authorId);
    const rootText = await Text.findById(root._rootTextId);
    res.status(200).send({ root, author, rootText });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};
