const bcrypt = require("bcryptjs");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

// ---------- Sign-up ----------

exports.signUpGet = (req, res) => {
  res.render("sign-up-form", { errors: [], formData: {} });
};

exports.signUpValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").trim().notEmpty().withMessage("Last name is required."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required.")
    .custom(async (email) => {
      const existing = await db.getUserByEmail(email);
      if (existing) {
        throw new Error("An account with that email already exists.");
      }
      return true;
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match.");
    }
    return true;
  }),
];

exports.signUpPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("sign-up-form", {
      errors: errors.array(),
      formData: req.body,
    });
  }

  try {
    const { firstName, lastName, email, password } = req.body;
    const isAdmin = req.body.isAdmin === "on";
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.createUser({
      firstName,
      lastName,
      email,
      hashedPassword,
      isAdmin,
    });

    res.redirect("/log-in");
  } catch (err) {
    next(err);
  }
};

// ---------- Log-in / Log-out ----------

exports.logInGet = (req, res) => {
  res.render("log-in-form", { error: req.session.messages || null });
  req.session.messages = null;
};

exports.logInPost = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in",
  failureMessage: true,
});

exports.logOutPost = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

// ---------- Join the club ----------

exports.joinGet = (req, res) => {
  res.render("join-form", { error: null });
};

exports.joinPost = async (req, res, next) => {
  try {
    const { passcode } = req.body;
    if (passcode !== process.env.CLUB_PASSCODE) {
      return res.status(400).render("join-form", {
        error: "Incorrect passcode. Try again.",
      });
    }
    await db.setMembershipStatus(req.user.id, true);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

// ---------- Become admin ----------

exports.adminGet = (req, res) => {
  res.render("admin-form", { error: null });
};

exports.adminPost = async (req, res, next) => {
  try {
    const { passcode } = req.body;
    if (passcode !== process.env.ADMIN_PASSCODE) {
      return res.status(400).render("admin-form", {
        error: "Incorrect passcode. Try again.",
      });
    }
    await db.setAdminStatus(req.user.id, true);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};
