var router = require("express").Router();

router.use("/api", require("./api"));
router.use("/user", require("./api/user"));
router.use("/author", require("./api/author"));
router.use("/story", require("./api/story-root"));
router.use("/text", require("./api/text"));

module.exports = router;
