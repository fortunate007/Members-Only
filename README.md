# Members Only

A clubhouse app from [The Odin Project](https://www.theodinproject.com/lessons/node-path-nodejs-members-only). Anyone can read anonymized messages; members can see who wrote what and when; admins can delete messages.

## Stack

- Node.js + Express
- PostgreSQL (raw SQL via `pg`, no ORM)
- Passport.js (`passport-local`) for auth, sessions stored in Postgres via `connect-pg-simple`
- `bcryptjs` for password hashing
- `express-validator` for form validation/sanitization
- EJS for views (no frontend framework/build step)

## Data model

**users**: `id, first_name, last_name, email (unique), password (hashed), membership_status (bool), is_admin (bool), created_at`

**messages**: `id, title, text, timestamp, user_id (FK -> users.id)`

## Local setup

1. **Install Postgres** and create a database, e.g.:
   ```bash
   createdb members_only
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # then edit .env with your real DATABASE_URL, SESSION_SECRET,
   # CLUB_PASSCODE, and ADMIN_PASSCODE
   ```

4. **Create the schema**
   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   ```
   (The `session` table used for storing login sessions is created automatically on first run via `connect-pg-simple`'s `createTableIfMissing: true`.)

5. **Run it**
   ```bash
   npm run dev   # auto-restarts on file changes (Node 18.11+)
   # or
   npm start
   ```
   Visit `http://localhost:3000`.

## How the permissions work

- **Anyone** (logged out) can see the list of messages, but the author and timestamp are hidden.
- **Logged-in users** additionally get a "Create a new message" link and, if not yet a member, a "Join the club" link.
- **"Join the club"** (`/join`) asks for `CLUB_PASSCODE` from `.env`. Correct entry sets `membership_status = true`, which reveals authors and timestamps on the home page.
- **"Become admin"** (`/admin`) asks for a separate `ADMIN_PASSCODE`. This is the second secret-passcode route mentioned in step 8 of the assignment (as an alternative to an "is admin" checkbox). The sign-up form *also* has an "sign up as admin" checkbox for convenience while testing — remove that in a real deployment.
- **Admins** see a "Delete" button on every message.

## Project structure

```
app.js                  Express app setup, sessions, passport, routes
config/passport.js      passport-local strategy, serialize/deserialize
db/pool.js               pg connection pool
db/queries.js            all SQL, one function per operation
db/schema.sql             CREATE TABLE statements
middleware/auth.js        ensureAuthenticated / ensureAdmin / locals helper
controllers/               request handlers (auth + messages)
routes/index.js            route -> controller wiring
views/                     EJS templates
public/css/style.css       styling
```

## Deploying

Any Node-friendly PaaS with a managed Postgres add-on works (Render, Railway, Fly.io, etc.):

1. Push this repo to GitHub.
2. Create a new Postgres database on your platform and copy its connection string into `DATABASE_URL`.
3. Set `SESSION_SECRET`, `CLUB_PASSCODE`, and `ADMIN_PASSCODE` as environment variables on the platform.
4. Run `db/schema.sql` against the production database once (most platforms let you open a psql shell, or run `psql "$DATABASE_URL" -f db/schema.sql` from your machine pointed at the remote DB).
5. Set the start command to `npm start`.
6. Deploy — the app reads `PORT` from the environment automatically.
