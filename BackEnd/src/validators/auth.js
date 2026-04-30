const { check, validationResult } = require("express-validator");

exports.validateSignupRequest = [
  check("firstName").notEmpty().withMessage("firstName is required"),
  check("email").isEmail().withMessage("Valid Email is required"),
  check("password")
    .isLength({ min: 10 })
    .withMessage("Password must be at least 10 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/)
    .withMessage(
      "Password must contain uppercase, lowercase, a number, and a special character",
    ),
];
exports.validatepassword = [
  check("password")
    .isLength({ min: 10 })
    .withMessage("Password must be at least 10 characters long"),
];

exports.validateSigninRequest = [
  check("email").isEmail().withMessage("Valid Email is required"),
  check("password").notEmpty().withMessage("Password is required"),
];

exports.isRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res.status(201).json({ error: errors.array()[0].msg });
  }
  next();
};
