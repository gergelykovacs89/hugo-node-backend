const Validator = require("validator");
const isEmpty = require("./is-empty");
const isImageUrl = require("is-image-url");

module.exports = function validateCreateStoryInput(data) {
  let errors = {};
  data.title = !isEmpty(data.title) ? data.title : "";
  data.imgPath = !isEmpty(data.imgPath) ? data.imgPath : "";
  data.summary = !isEmpty(data.summary) ? data.summary : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title is required";
  }

  if (!Validator.isLength(data.title, { min: 1, max: 150 })) {
    errors.title = "Title must have 1-150 chars";
  }

  if (Validator.isEmpty(data.summary)) {
    errors.summary = "Title is required";
  }

  if (!Validator.isLength(data.summary, { min: 1, max: 150 })) {
    errors.summary = "Summary must have 1-150 chars";
  }


  if (Validator.isEmpty(data.imgPath)) {
    errors.imgPath = "imgPath is required";
  }

  if (!isImageUrl(data.imgPath)) {
    errors.imgPath = "Please provide a link for an image";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
