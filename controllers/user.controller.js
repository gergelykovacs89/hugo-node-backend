const { User } = require("../models/user");
const { Author } = require("../models/author");
const _ = require("lodash");

exports.registerUser = async function(req, res) {
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
};

exports.loginUser = async function(req, res, errors) {
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
    errors.email = e;
    console.log(e);
    res.status(400).json(errors);
  }
};
