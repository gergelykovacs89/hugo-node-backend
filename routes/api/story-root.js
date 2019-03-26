const router = require("express").Router();
const StoryRootController = require("../../controllers/story-root.controller");
const { authenticate } = require("../../middleware/authenticate");
const _ = require("lodash");
const validateCreateStoryInput = require("../../validation/createStory");

router.post("/create", authenticate, async (req, res) => {
  const { errors, isValid } = validateCreateStoryInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  StoryRootController.createRoot(req, res);
});

router.get("/story-roots/:id", authenticate, async (req, res) => {
  StoryRootController.getRootsByAuthorId(req, res);
});

router.get("/root/:id", authenticate, async (req, res) => {
  StoryRootController.getRootById(req, res);
});

router.put("/update/:id", authenticate, async (req, res) => {
  const { errors, isValid } = validateCreateStoryInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  StoryRootController.updateRoot(req, res);
});

module.exports = router;
