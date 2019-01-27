var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    User.findByToken(token).then((user) => {
        if (!user) {
            console.log('reject auth.js 7');
            return Promise.reject();
        }
        console.log(user, 'authenticate.js 9');
        req.user = user;
        req.token = token;
        next();
    })
        .catch((err) => {
            res.status(401).send();
        });
};

module.exports = {
    authenticate: authenticate
};
