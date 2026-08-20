require("dotenv").config();

const path = require("node:path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const pgSession = require("connect-pg-simple")(session);

const pool = require("./db/pool");
const initializePassport = require("./config/passport");
const { attachUserToLocals } = require("./middleware/auth");
const indexRouter = require("./routes/index");

initializePassport(passport);

const app = express();
app.locals.currentUser = null;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))

app.locals.currentUser = currentUser;
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new pgSession({ pool, tableName: "session", createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 1 week
  })
);

app.use(passport.session());
app.use(attachUserToLocals);

app.use("/", indexRouter);

// 404
app.use((req, res) => {
  res.status(404).render("error", { message: "Page not found." });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", { message: "Something went wrong." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Members Only listening on http://localhost:${PORT}`);
});
