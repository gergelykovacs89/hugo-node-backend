const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { User } = require("../../models/user");
const { Author } = require("../../models/author");
const { authenticate } = require("../../middleware/authenticate");
const _ = require("lodash");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateCreateAuthorInput = require("../../validation/createAuthor");

router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  try {
    const user = await User.findOne({
      email: req.body.email
    });
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const body = _.pick(req.body, ["email", "password", "fullName"]);
      const user = new User(body);
      await user.save();
      res.send({
        message: "Registration was successful.",
        status: "OK"
      });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  try {
    const body = _.pick(req.body, ["email", "password"]);
    const user = await User.findByCredentials(body.email, body.password);
    const userToken = await user.generateAuthToken();
    const authors = await Author.findByUserId(user._id);
    res.status(200).send({
      status: "OK",
      message: "logged in",
      authors: authors,
      jwtToken: userToken
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/new-author", authenticate, async (req, res) => {
  const { errors, isValid } = validateCreateAuthorInput(req.body);
  console.log(errors);
  if (!isValid) {
    return res.status(400).json(errors);
  }
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
});

router.put("/update-author", authenticate, async (req, res) => {
  try {
    const body = _.pick(req.body, ["_id", "name", "description", "imgPath"]);
    let authorUpdated = await Author.findOneAndUpdate(
      { _id: body._id },
      { $set: { imgPath: body.imgPath, description: body.description } },
      { new: true }
    );
    if (!authorUpdated) {
      return res.status(404).send({ message: "author not found" });
    } else {
      return res
        .header("x-auth", req.token)
        .status(200)
        .send(authorUpdated);
    }
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
});

router.delete("/delete-author", authenticate, async (req, res) => {
  try {
    const body = _.pick(req.headers, ["authname"]);
    let authorRemoved = await Author.findOneAndDelete({
      name: body["authname"],
      _userId: req.user._id
    });
    if (!authorRemoved) {
      return res.status(404).send({ message: "author not found" });
    } else {
      return res
        .header("x-auth", req.token)
        .status(200)
        .send({
          message: `${authorRemoved.name} was deleted ok`,
          status: "DELETED"
        });
    }
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
});

router.get("/get-author-by-id", authenticate, async (req, res) => {
  try {
    const body = _.pick(req.headers, ["authname"]);
    let author = await Author.findOne({
      _id: body.authname,
      _userId: req.user._id
    });
    let user = await User.findById(req.user._id);
    const authorToken = await user.generateAuthorAuthToken(author._id);
    res
      .header("x-auth", req.token)
      .status(200)
      .send({ author: author, authorToken: authorToken });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
});

router.delete("/logout-author", authenticate, (req, res) => {
  try {
    req.user
      .removeAuthorToken(req.headers["authortoken"])
      .then(res => console.log(res));
    res.status(200).send({
      status: "AUTHOR_LOGGED_OUT"
    });
  } catch (e) {
    res.status(400).send();
  }
});

router.get("/get-author-by-name", authenticate, async (req, res) => {
  try {
    const body = _.pick(req.headers, ["authname"]);
    let author = await Author.findOne({ name: body.authname });
    res
      .header("x-auth", req.token)
      .status(200)
      .send(author);
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
});

router.get("/get-author-by-token", authenticate, async (req, res) => {
  try {
    const body = _.pick(req.headers, ["authortoken"]);
    let authorId = jwt.decode(body.authortoken)._id;
    let author = await Author.findById(authorId);
    res
      .header("x-auth", req.token)
      .status(200)
      .send(author);
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
});

router.get("/user-authors", authenticate, async (req, res) => {
  try {
    const userToken = await req.user.generateAuthToken();
    let authors = await Author.findByUserId(req.user._id);
    res
      .header("x-auth", req.token)
      .status(200)
      .send({
        authors: authors,
        jwtToken: userToken
      });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
});

router.post("/follow-author", authenticate, async (req, res) => {
  try {
    const body = _.pick(req.body, ["authorSelfId", "authorToFollowId"]);
    const authorSelfId = body.authorSelfId;
    const authorToFollowId = body.authorToFollowId;
    await Author.updateOne(
      { _id: authorSelfId },
      { $push: { following: authorToFollowId } }
    );
    await Author.updateOne(
      { _id: authorToFollowId },
      { $push: { followers: authorSelfId } }
    );

    res
      .header("x-auth", req.token)
      .status(200)
      .send({
        message: `UPDATED`
      });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
});

router.post("/unfollow-author", authenticate, async (req, res) => {
  try {
    const body = _.pick(req.body, ["authorSelfId", "authorToUnfollowId"]);
    const authorSelfId = body.authorSelfId;
    const authorToUnfollowId = body.authorToUnfollowId;
    Author.updateOne(
      { _id: authorSelfId },
      { $pull: { following: authorToUnfollowId } }
    ).then((res, err) => console.log(res, err));
    await Author.updateOne(
      { _id: authorToUnfollowId },
      { $pull: { followers: authorSelfId } }
    );

    res
      .header("x-auth", req.token)
      .status(200)
      .send({
        message: `UPDATED`
      });
  } catch (e) {
    res.status(400).send({
      status: "Somethign went wrong..."
    });
  }
});

module.exports = router;
