function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/log-in");
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.is_admin) return next();
  res.status(403).send("Admins only.");
}

// Makes currentUser available in every view without passing it manually.
function attachUserToLocals(req, res, next) {
  res.locals.currentUser = req.user || null;
  next();
}

module.exports = { ensureAuthenticated, ensureAdmin, attachUserToLocals };
