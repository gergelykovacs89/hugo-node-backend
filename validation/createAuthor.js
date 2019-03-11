const Validator = require("validator");
const isEmpty = require("./is-empty");
const isImageUrl = require("is-image-url");

module.exports = function validateCreateAuthorInput(data) {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.imgPath = !isEmpty(data.imgPath) ? data.imgPath : "";
  data.description = !isEmpty(data.description) ? data.description : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name is required";
  }

  if (!Validator.isLength(data.name, { min: 3, max: 15 })) {
    errors.name = "Name must have 3-15 chars";
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
