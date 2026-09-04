

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || ''
const API_URL = import.meta.env.VITE_API || 'http://172.23.1.46/xtp/app-api/'

export const AUTH_MOCK_MODE = !AUTH_API_URL

/**
 * @param {{username: string, password: string, role?: 'employee'|'manager'}} params
 * @returns {Promise<{token: string|null, user: object, mocked: boolean}>}
 */
export async function login({ username, password, role = 'employee' }) {
  if (!username.trim() || !password) {
    throw new Error('Enter your username and password.')
  }

  if (AUTH_MOCK_MODE) {
    throw new Error('Real backend API is required. Set VITE_AUTH_API_URL environment variable.')
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

/**
 * Fetch the current logged-in user from the API
 * @returns {Promise<{userId: number, userName: string, email: string, department: string, hod: string|null}>}
 */
export async function getCurrentUser() {
  const res = await fetch(`${API_URL}users/getUser.php`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok || !data?.success) {
    throw new Error(data?.message || 'Failed to fetch user data.')
  }

  // Map API response to internal user format
  return {
    name: data.data.userName,
    userId: data.data.userId,
    email: data.data.email,
    department: data.data.department,
  }
}
