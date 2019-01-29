const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const {User} = require('../../models/user');
const {Author} = require('../../models/author');
const {authenticate} = require('../../middleware/authenticate');
const _ = require('lodash');

router.post('/register', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password', 'fullName']);
        const user = new User(body);
        await user.save();
        res.send({
            message: 'Registration was successful.',
            status: 'OK'
        });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        const userToken = await user.generateAuthToken();
        const authors = await Author.findByUserId(user._id);
        res.header('x-auth', userToken).status(200).send({
            status: 'OK',
            message: 'logged in',
            user: user,
            authors: authors
        });
    } catch (e) {
        res.status(400).send({
            status: 'WRONG_PASSWORD'
        });
    }
});

router.delete('/logout', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send({
            status: 'LOGGED_OUT'
        });
    } catch (e) {
        res.status(400).send();
    }
});

router.post('/new-author', authenticate, async (req, res) => {
    try {
        const body = _.pick(req.body, ['name', 'description', 'imgPath']);
        let author = new Author(body);
        author._userId = req.user._id;
        author = await author.save();
        res.header('x-auth', req.token).status(200).send(author);
    } catch (e) {
        res.status(400).send({
            status: 'Somethign went wrong...'
        });
    }
});


router.put('/update-author', authenticate, async (req, res) => {
    try {
        const body = _.pick(req.body, ['_id', 'name', 'description', 'imgPath']);
        let authorUpdated = await Author.findOneAndUpdate({_id: body._id}, {$set:{imgPath: body.imgPath, description: body.description}}, {new: true});
        if (!authorUpdated) {
            return res.status(404).send({message: 'author not found'});
        } else {
            return res.header('x-auth', req.token).status(200).send(authorUpdated);
        }
    } catch (e) {
        res.status(400).send({
            status: 'Somethign went wrong...'
        });
    }
});


router.delete('/delete-author', authenticate, async (req, res) => {
    try {
        const body = _.pick(req.headers, ['authname']);
        let authorRemoved = await Author.findOneAndDelete({name: body['authname'], _userId: req.user._id});
        if (!authorRemoved) {
            return res.status(404).send({message: 'author not found'});
        } else {
            return res.header('x-auth', req.token).status(200).send({message: `${authorRemoved.name} was deleted ok`, status: 'DELETED'});
        }
    } catch (e) {
        res.status(400).send({
            status: 'Somethign went wrong...'
        });
    }
});

router.get('/get-author-by-id', authenticate, async (req, res) => {
    try {
        const body = _.pick(req.headers, ['authname']);
        let author = await Author.findOne({_id: body.authname, _userId: req.user._id});
        let user = await User.findById(req.user._id);
        const authorToken = await user.generateAuthorAuthToken(author._id);
        res.header('x-auth', req.token).status(200).send({author: author, authorToken: authorToken});
    } catch (e) {
        res.status(400).send({
            status: 'Somethign went wrong...'
        });
    }
});


router.delete('/logout-author', authenticate, async (req, res) => {
    try {
        await req.user.removeAuthorToken(req.token);
        res.status(200).send({
            status: 'AUTHOR_LOGGED_OUT'
        });
    } catch (e) {
        res.status(400).send();
    }
});

router.get('/get-author-by-name', authenticate, async (req, res) => {
    try {
        const body = _.pick(req.headers, ['authname']);
        let author = await Author.findOne({name: body.authname});
        res.header('x-auth', req.token).status(200).send(author);
    } catch (e) {
        res.status(400).send({
            status: 'Somethign went wrong...'
        });
    }
});

router.get('/get-author-by-token', authenticate, async (req, res) => {
    try {
        const body = _.pick(req.headers, ['authortoken']);
        let authorId = jwt.decode(body.authortoken)._id;
        let author = await Author.findById(authorId);
        res.header('x-auth', req.token).status(200).send(author);
    } catch (e) {
        res.status(400).send({
            status: 'Somethign went wrong...'
        });
    }
});

router.get('/user-authors', authenticate, async (req, res) => {
    try {
        let authors = await Author.findByUserId(req.user._id);
        res.header('x-auth', req.token).status(200).send(authors);
    } catch (e) {
        res.status(400).send({
            status: 'Somethign went wrong...'
        });
    }
});

module.exports = router;
