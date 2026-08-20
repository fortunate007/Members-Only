const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

exports.indexGet = async (req, res, next) => {
  try {
    const messages = await db.getAllMessagesWithAuthors();
    res.render("index", { messages });
  } catch (err) {
    next(err);
  }
};

exports.newMessageGet = (req, res) => {
  res.render("new-message-form", { errors: [], formData: {} });
};

exports.newMessageValidation = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("text").trim().notEmpty().withMessage("Message text is required."),
];

exports.newMessagePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("new-message-form", {
      errors: errors.array(),
      formData: req.body,
    });
  }

  try {
    const { title, text } = req.body;
    await db.createMessage({ title, text, userId: req.user.id });
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

exports.deleteMessagePost = async (req, res, next) => {
  try {
    await db.deleteMessage(req.params.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};
