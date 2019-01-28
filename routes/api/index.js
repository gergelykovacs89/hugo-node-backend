const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');
const router = require('express').Router();
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
