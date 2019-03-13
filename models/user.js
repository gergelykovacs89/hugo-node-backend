const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email."
    }
  },
  fullName: {
    type: String,
    required: false,
    trim: true,
    minLength: 1,
    unique: false
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  }
});

UserSchema.methods.generateAuthToken = function() {
  let user = this;
  const access = "auth";
  let userToken = jwt
    .sign(
      {
        _id: user._id.toHexString(),
        email: user.email,
        access: access
      },
      process.env.JWT_SECRET
    )
    .toString();
  return userToken;
};

UserSchema.methods.removeToken = function(userToken) {
  let user = this;
  return user.update({
    $pull: {
      tokens: {
        userToken: userToken
      }
    }
  });
};

UserSchema.methods.removeAuthorToken = function(authorToken) {
  let user = this;
  return user.update({
    $pull: {
      authorTokens: {
        authorToken: authorToken
      }
    }
  });
};

UserSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject();
  let userToken = _.get(userObject, "tokens[0].userToken");
  user = _.pick(userObject, ["_id", "email"]);
  user.userToken = userToken;
  return user;
};

UserSchema.statics.findByCredentials = function(email, password) {
  let User = this;

  return User.findOne({ email: email }).then(user => {
    if (!user) {
      return Promise.reject("Email and/or password incorrect");
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (!res) {
          reject("Email and/or password incorrect");
        } else {
          resolve(user);
        }
      });
    });
  });
};

UserSchema.pre("save", function(next) {
  let user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = {
  User: User
};
