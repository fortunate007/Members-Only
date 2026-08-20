const pool = require("./pool");

// ---------- Users ----------

async function createUser({ firstName, lastName, email, hashedPassword, isAdmin }) {
  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password, is_admin)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, first_name, last_name, email, membership_status, is_admin`,
    [firstName, lastName, email, hashedPassword, !!isAdmin]
  );
  return rows[0];
}

async function getUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return rows[0];
}

async function getUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, email, membership_status, is_admin
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
}

async function setMembershipStatus(userId, status) {
  await pool.query(`UPDATE users SET membership_status = $1 WHERE id = $2`, [
    status,
    userId,
  ]);
}

async function setAdminStatus(userId, status) {
  await pool.query(`UPDATE users SET is_admin = $1 WHERE id = $2`, [
    status,
    userId,
  ]);
}

// ---------- Messages ----------

async function createMessage({ title, text, userId }) {
  const { rows } = await pool.query(
    `INSERT INTO messages (title, text, user_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [title, text, userId]
  );
  return rows[0];
}

async function getAllMessagesWithAuthors() {
  const { rows } = await pool.query(
    `SELECT messages.id, messages.title, messages.text, messages.timestamp,
            users.id AS author_id, users.first_name, users.last_name
     FROM messages
     JOIN users ON messages.user_id = users.id
     ORDER BY messages.timestamp DESC`
  );
  return rows;
}

async function deleteMessage(id) {
  await pool.query(`DELETE FROM messages WHERE id = $1`, [id]);
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  setMembershipStatus,
  setAdminStatus,
  createMessage,
  getAllMessagesWithAuthors,
  deleteMessage,
};
