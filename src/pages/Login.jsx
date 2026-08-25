import React, { useState } from 'react'
import { Fingerprint, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/store'
import { login, AUTH_MOCK_MODE } from '../lib/auth'
import logo from '../assets/logo.png'

export default function Login() {
  const [role, setRole] = useState('employee')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [stage, setStage] = useState('form') // form -> biometric -> done
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { dispatch } = useStore()
  const nav = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      const { user } = await login({ username, password, role })
      setStage('biometric')
      setTimeout(() => {
        dispatch({ type: 'SET_ROLE', role: user.role || role })
        nav((user.role || role) === 'manager' ? '/claims' : '/home')
      }, 1000)
    } catch (err) {
      setError(err.message || 'Sign-in failed — please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-logo"><img src={logo} alt="X2P logo" /></div>
      <div className="login-title">X2P</div>
      <div className="login-sub">Spend tracking &amp; approvals, on the go</div>

      {stage === 'form' && (
        <form onSubmit={handleSubmit} noValidate>
          {AUTH_MOCK_MODE && (
            <div className="role-toggle" role="radiogroup" aria-label="Sign in as (demo)">
              <button type="button" className={`role-chip ${role === 'employee' ? 'active' : ''}`} onClick={() => setRole('employee')}>Employee</button>
              <button type="button" className={`role-chip ${role === 'manager' ? 'active' : ''}`} onClick={() => setRole('manager')}>Manager</button>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="txtusername">Username</label>
            <input
              id="txtusername"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="you@company.com"
            />
          </div>

          <div className="login-field">
            <label htmlFor="txtpassword">Password</label>
            <div className="login-password-row">
              <input
                id="txtpassword"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error"><AlertCircle size={14} /> <span>{error}</span></div>
          )}

          <button className="sso-btn" type="submit" disabled={submitting} style={{ marginTop: 24 }}>
            <ShieldCheck size={17} color="#046307" /> {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="login-footnote">
            {AUTH_MOCK_MODE ? 'Demo mode — any password will do' : 'Secured with your company directory · Hela Brands UK tenant'}
          </div>

          <button
            type="button"
            className="login-forgot"
            onClick={() => setError('Password reset isn\u2019t wired up yet in this preview.')}
          >
            Forgot your password?
          </button>
        </form>
      )}

      {stage === 'biometric' && (
        <div style={{ textAlign: 'center' }}>
          <div className="biometric-pulse"><Fingerprint size={28} color="#fff" /></div>
          <div style={{ marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            Confirming your identity…
          </div>
          <div className="login-footnote">Face ID / Touch ID bound to your device</div>
        </div>
      )}
    </div>
  )
}
