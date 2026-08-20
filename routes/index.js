const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const messageController = require("../controllers/messageController");
const {
  ensureAuthenticated,
  ensureAdmin,
} = require("../middleware/auth");

// Home - list of all messages
router.get("/", messageController.indexGet);

// Sign up
router
  .route("/sign-up")
  .get(authController.signUpGet)
  .post(authController.signUpValidation, authController.signUpPost);

// Log in / out
router
  .route("/log-in")
  .get(authController.logInGet)
  .post(authController.logInPost);
router.post("/log-out", authController.logOutPost);

// Join the club (must be logged in)
router
  .route("/join")
  .get(ensureAuthenticated, authController.joinGet)
  .post(ensureAuthenticated, authController.joinPost);

// Become an admin (must be logged in)
router
  .route("/admin")
  .get(ensureAuthenticated, authController.adminGet)
  .post(ensureAuthenticated, authController.adminPost);

// New message (must be logged in)
router
  .route("/messages/new")
  .get(ensureAuthenticated, messageController.newMessageGet)
  .post(
    ensureAuthenticated,
    messageController.newMessageValidation,
    messageController.newMessagePost
  );

// Delete message (admin only)
router.post(
  "/messages/:id/delete",
  ensureAuthenticated,
  ensureAdmin,
  messageController.deleteMessagePost
);

module.exports = router;
