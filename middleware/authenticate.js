const { User } = require("./../models/user");
const jwt = require("jsonwebtoken");

var authenticate = (req, res, next) => {
  const token = req.header("x-auth");
  const decode = jwt.decode(token);
  User.findById(decode._id)
    .then(user => {
      if (!user) {
        return Promise.reject();
      }
      req.user = user;
      req.token = token;
      next();
    })
    .catch(err => {
      res.status(401).send();
    });
};

module.exports = {
  authenticate: authenticate
};
