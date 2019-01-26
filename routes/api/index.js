const mongoose = require('mongoose');
const router = require('express').Router();
const {User} = require('../../models/user');
const {authenticate} = require('../../middleware/authenticate');
const _ = require('lodash');

router.post('/register', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password', 'fullName']);
        const user = new User(body);
        await user.save();
        const token = await user.generateAuthToken();
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
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send();
    }
});

module.exports = router;
