const _ = require("lodash");
const { Text } = require("../models/text");

exports.getTextById = async function(req, res) {
  try {
    const textId = req.params.id;
    const text = await Text.findById(textId);
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
    );
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
