const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var {User} = require('./user');

const AuthorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        unique: true
    },
    imgPath: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
        unique: false,
    },
    description: {
        type: String,
        required: false,
        minLength: 6
    },
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

AuthorSchema.methods.generateAuthToken = async function () {
    let author = this;
    const access = 'authorAuth';
    let authorToken = jwt.sign({
        _id: author._id.toHexString(),
        access: access
    }, process.env.JWT_SECRET).toString();

    User.findById(author._userId)
        .then((user) => {
            user.tokens = user.tokens.concat({
                access: access,
                authorToken: authorToken
            });

            return user.save().then(() => {
                return authorToken;
            });
        });



};


AuthorSchema.methods.toJSON = function () {
    let author = this;
    let userObject = author.toObject();
    author = _.pick(userObject, ['_id', 'name', 'description', 'imgPath']);
    return author;
};

AuthorSchema.statics.findByUserId = function (_userId) {
    return Author.find({_userId:_userId})
        .then((authors) => {
            if (!authors) {
                return Promise.resolve([]);
            }
            return Promise.resolve(authors);
        });
};





const Author = mongoose.model('Author', AuthorSchema);

module.exports = {
    Author: Author
};
