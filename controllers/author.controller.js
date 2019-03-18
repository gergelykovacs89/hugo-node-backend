const { User } = require("../models/user");
const { Author } = require("../models/author");
const _ = require("lodash");

exports.addAuthor = async function(req, res) {
  try {
    const body = _.pick(req.body, ["name", "description", "imgPath"]);
    let author = new Author(body);
    author._userId = req.user._id;
    author = await author.save();
    res
      .header("x-auth", req.token)
      .status(200)
      .send(author);
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.editAuthor = async function(req, res) {
  try {
    const body = _.pick(req.body, ["description", "imgPath"]);
    let authorUpdated = await Author.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { imgPath: body.imgPath, description: body.description } },
      { new: true }
    );
    if (!authorUpdated) {
      return res.status(400).send({ message: "author not found" });
    } else {
      return res.status(200).send({ authorUpdated });
    }
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.deleteAuthor = async function(req, res) {
  try {
    let authorId = req.params.id;
    let authorRemoved = await Author.findOneAndDelete({
      _id: authorId,
      _userId: req.user._id
    });
    if (!authorRemoved) {
      return res.status(404).send({ message: "author not found" });
    } else {
      return res.status(200).send({
        message: `${authorRemoved.name} was deleted ok`,
        status: "DELETED"
      });
    }
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.getAuthorById = async function(req, res) {
  try {
    let authorId = req.params.id;
    let author = await Author.findOne({
      _id: authorId,
      _userId: req.user._id
    });
    res.status(200).send({ author });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.getAuthorDetail = async function(req, res) {
  try {
    let authorId = req.params.id;
    let author = await Author.findOne({
      _id: authorId
    });
    res.status(200).send({ author });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.getAuthorsByUserId = async function(req, res) {
  try {
    const userToken = await req.user.generateAuthToken();
    let authors = await Author.findByUserId(req.user._id);
    res.status(200).send({
      authors: authors,
      jwtToken: userToken
    });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.followAuthor = async function(req, res) {
  try {
    const body = _.pick(req.body, ["selectAuthorId", "authorToFollowId"]);
    const authorSelfId = body.selectAuthorId;
    const authorToFollowId = body.authorToFollowId;
    await Author.updateOne(
      { _id: authorSelfId },
      { $push: { following: authorToFollowId } }
    );
    await Author.updateOne(
      { _id: authorToFollowId },
      { $push: { followers: authorSelfId } }
    );

    res.status(200).send({
      message: `UPDATED`
    });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};

exports.unFollowAuthor = async function(req, res) {
  try {
    const body = _.pick(req.body, ["selectAuthorId", "authorToUnFollowId"]);
    
    const authorSelfId = body.selectAuthorId;
    const authorToUnfollowId = body.authorToUnFollowId;
    await Author.updateOne(
      { _id: authorSelfId },
      { $pull: { following: authorToUnfollowId } }
    );
    await Author.updateOne(
      { _id: authorToUnfollowId },
      { $pull: { followers: authorSelfId } }
    );

    res.status(200).send({
      message: `UPDATED`
    });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
};
