const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email.'
        }
    },
    fullName: {
        type: String,
        required: false,
        trim: true,
        minLength: 1,
        unique: false,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    tokens: [
        {
            access: {
                type: String,
                required: true
            },
            userToken: {
                type: String,
                required: true
            }
        },
        {
            access: {
                type: String,
                required: true
            },
            authorToken: {
                type: String,
                required: true
            }
        }
        ]
});

UserSchema.methods.generateAuthToken = function () {
    let user = this;
    const access = 'auth';
    let userToken = jwt.sign({
      _id: user._id.toHexString(),
      access: access
  }, process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat({
      access: access,
      userToken: userToken
  });

  return user.save().then(() => {
      return userToken;
  });
};

UserSchema.methods.removeToken = function (userToken) {
    let user = this;
    return user.update({
        $pull: {
            tokens: {
                userToken: userToken
            }
        }
    });
};

UserSchema.methods.removeAuthorToken = function (authorToken) {
    let user = this;
    return user.update({
        $pull: {
            tokens: {
                authorToken: authorToken
            }
        }
    });
};


UserSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    let userToken = _.get(userObject, 'tokens[0].userToken');
    user = _.pick(userObject, ['_id', 'email']);
    user.userToken = userToken;
    return user;
};

UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;

    return User.findOne({email: email})
        .then((user) => {
            if (!user) {
                return Promise.reject();
            }
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (!res) {
                        reject();
                    } else {
                        resolve(user);
                    }
                });
            });
        });
};

UserSchema.statics.findByToken = function (token) {
    let User = this;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject();
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.userToken': token,
        'tokens.access': 'auth'
    });
};

UserSchema.pre('save', function (next) {
    let user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }

});

const User = mongoose.model('User', UserSchema);

module.exports = {
    User: User
};
