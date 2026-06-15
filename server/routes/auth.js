const express = require("express");

const router = express.Router();

const {
  register,
  login,
  changePassword,
  deleteAccount
} = require(
  "../controllers/authController"
);

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.patch(
  "/change-password",
  changePassword
);

router.delete(
  "/account/:userId",
  deleteAccount
);

module.exports = router;