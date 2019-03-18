var router = require('express').Router();

router.use('/api', require('./api'));
router.use('/user', require('./api/user'));
router.use('/author', require('./api/author'));

module.exports = router;
