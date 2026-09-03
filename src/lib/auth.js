// ---------------------------------------------------------------------------
// Auth service
// ---------------------------------------------------------------------------
// Single integration point for signing in — same pattern as src/lib/ocr.js.
// Runs in mock mode until a real backend is wired up via VITE_AUTH_API_URL;
// once that's set, login() starts calling the real API and nothing in
// Login.jsx needs to change.
//
// Expected backend contract (matches php-backend/api/login.php):
//   POST {VITE_AUTH_API_URL}/login   body: { username, password }
//   200 -> { ok: true,  token: string, user: { name, title, entity, department, role } }
//   401 -> { ok: false, message: string }   (bad credentials)
//   403 -> { ok: false, message: string }   (e.g. account needs a password reset)
//
// Security notes for whoever builds the real backend (worth calling out
// explicitly, since it's easy to copy patterns from an older system):
//   - Never build the SQL query by concatenating username/password into the
//     query string — that's a SQL-injection hole. Use parameterized queries /
//     prepared statements.
//   - Hash passwords with bcrypt or argon2 (per-user salt), not a bare
//     sha1/md5 digest.
//   - Return a short-lived token (JWT or opaque session id); never send the
//     password back to the client, and never store it anywhere client-side.
//   - Serve over HTTPS only, and rate-limit login attempts.

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || ''

// True while there's no real backend configured — Login.jsx uses this to
// decide whether to show the employee/manager demo toggle and the "any
// password works" hint.
export const AUTH_MOCK_MODE = !AUTH_API_URL

const MOCK_PROFILES = {
  employee: { name: 'RadikaG', email: 'radika.gunawardana@helabrands.com', department: 'Commercial', role: 'employee' },
  manager: { name: 'D. Wickramasinghe', email: 'd.wickramasinghe@helabrands.com',department: 'Commercial', role: 'manager' },
}

/**
 * @param {{username: string, password: string, role?: 'employee'|'manager'}} params
 * @returns {Promise<{token: string|null, user: object, mocked: boolean}>}
 */
export async function login({ username, password, role = 'employee' }) {
  if (!username.trim() || !password) {
    throw new Error('Enter your username and password.')
  }

  if (AUTH_MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 700))
    return { token: null, user: MOCK_PROFILES[role] || MOCK_PROFILES.employee, mocked: true }
  }

  const res = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok || !data?.ok) {
    throw new Error(data?.message || 'Sign-in failed — please try again.')
  }

  return { token: data.token, user: data.user, mocked: false }
}
