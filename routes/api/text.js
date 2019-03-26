const router = require("express").Router();
const TextController = require("../../controllers/text.controller");
const { authenticate } = require("../../middleware/authenticate");
const _ = require("lodash");

router.get("/:id", authenticate, async (req, res) => {
  TextController.getTextById(req, res);
});

router.put("/update/:id", authenticate, async (req, res) => {
    TextController.updateById(req, res);
  });

module.exports = router;
