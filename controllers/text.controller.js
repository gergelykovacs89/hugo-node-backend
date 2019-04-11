const _ = require("lodash");
const { Text } = require("../models/text");
const { Author } = require("../models/author");

const populateTextWithAuthor = [
  {
    path: "_authorId",
    select: ["_id", "name", "description", "imgPath", "followers", "following"]
  }
];

exports.getTextById = async function(req, res) {
  try {
    const textId = req.params.id;
    let text = await Text.findById(textId).populate(populateTextWithAuthor);
    res.status(200).send(text);
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.updateById = async function(req, res) {
  try {
    const newTextState = _.pick(req.body, ["newTextState"]);
    let textUpdated = await Text.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { text: newTextState.newTextState } },
      { new: true }
    ).populate(populateTextWithAuthor);
    if (!textUpdated) {
      return res.status(400).send({ message: "text not found" });
    } else {
      return res.status(200).send({ textUpdated });
    }
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.createTextFromParent = async function(req, res) {
  try {
    const newChildTextBody = _.pick(req.body, [
      "text",
      "_parentTextId",
      "_authorId"
    ]);

    let childText = new Text(newChildTextBody);
    await childText.save();
    childText.populate(populateTextWithAuthor);
    return res.status(200).send({ childText });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.deleteTextById = async function(req, res) {
  try {
    let textId = req.params.id;
    let textTobeRemoved = await Text.findOneAndDelete({
      _id: textId
    });
    if (!textTobeRemoved) {
      return res.status(404).send({ message: "text not found" });
    } else {
      return res.status(200).send({
        message: `${textTobeRemoved._id} was deleted ok`,
        status: "DELETED"
      });
    }
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.getTextsByParentId = async function(req, res) {
  try {
    const _parentTextId = req.params.id;
    let childTexts = await Text.find({ _parentTextId }).populate(
      populateTextWithAuthor
    );
    res.status(200).send({ childTexts });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};
