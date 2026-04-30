const express = require("express");
const { signup, signin } = require("../../controller/superadmin/auth");
const {
  validateSignupRequest,
  isRequestValidated,
  validateSigninRequest,
} = require("../../validators/auth");
const router = express.Router();

// Guard: only requests carrying the correct x-setup-secret header can create a superadmin
const requireSetupSecret = (req, res, next) => {
  const secret = process.env.SUPERADMIN_SETUP_SECRET;
  if (!secret || req.headers["x-setup-secret"] !== secret) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

router.post(
  "/superadmin/signup",
  requireSetupSecret,
  validateSignupRequest,
  isRequestValidated,
  signup,
);
router.post(
  "/superadmin/signin",
  validateSigninRequest,
  isRequestValidated,
  signin,
);

module.exports = router;
