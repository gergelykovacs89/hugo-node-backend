const router = require("express").Router();
const AuthorController = require("../../controllers/author.controller");
const { authenticate } = require("../../middleware/authenticate");
const _ = require("lodash");
const validateCreateAuthorInput = require("../../validation/createAuthor");

router.post("/new-author", authenticate, async (req, res) => {
  const { errors, isValid } = validateCreateAuthorInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  AuthorController.addAuthor(req, res);
});

router.put(`/edit-author/:id`, authenticate, async (req, res) => {
  const { errors, isValid } = validateCreateAuthorInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  AuthorController.editAuthor(req, res);
});

router.delete("/delete-author/:id", authenticate, async (req, res) => {
  AuthorController.deleteAuthor(req, res);
});

router.get("/get-author/:id", authenticate, async (req, res) => {
  AuthorController.getAuthorById(req, res);
});

router.get("/user-authors", authenticate, async (req, res) => {
  AuthorController.getAuthorsByUserId(req, res);
});

router.post("/follow-author", authenticate, async (req, res) => {
  AuthorController.followAuthor(req, res);
});

router.post("/unfollow-author", authenticate, async (req, res) => {
  AuthorController.unFollowAuthor(req, res);
});

module.exports = router;
