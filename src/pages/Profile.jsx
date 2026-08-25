import React from 'react'
import { ShieldCheck, Fingerprint, Smartphone, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/store'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { initials } from '../lib/format'

export default function Profile() {
  const { state, dispatch } = useStore()
  const nav = useNavigate()

  return (
    <>
      <TopBar title="Profile" />
      <div className="app-scroll">
        <div className="page" style={{ paddingTop: 0 }}>
          <div className="card" style={{ marginTop: 18, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="merchant-badge" style={{ width: 52, height: 52, fontSize: 17 }}>{initials(state.user.name)}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{state.user.name}</div>
              <div className="field-hint" style={{ marginTop: 2 }}>{state.user.title} · {state.user.entity}</div>
            </div>
          </div>

          <div className="section-title">Security</div>
          <div className="card">
            <div className="kv-row"><span className="kv-label"><ShieldCheck size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Signed in as</span><span className="kv-value">{state.user.name}</span></div>
            <div className="kv-row"><span className="kv-label"><Fingerprint size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Biometric unlock</span><span className="kv-value">Enabled</span></div>
            <div className="kv-row"><span className="kv-label"><Smartphone size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Device sync</span><span className="kv-value">Up to date</span></div>
          </div>

          <div className="section-title">Demo mode</div>
          <div className="card">
            <p className="field-hint" style={{ marginBottom: 10 }}>
              <Info size={13} style={{ verticalAlign: -2, marginRight: 5 }} />
              Switch roles to preview both the employee and manager experience without signing out.
            </p>
            <div className="chip-row">
              <button className={`toggle-chip ${state.role === 'employee' ? 'active' : ''}`} onClick={() => { dispatch({ type: 'SET_ROLE', role: 'employee' }); nav('/home') }}>Employee view</button>
              <button className={`toggle-chip ${state.role === 'manager' ? 'active' : ''}`} onClick={() => { dispatch({ type: 'SET_ROLE', role: 'manager' }); nav('/claims') }}>Manager view</button>
            </div>
          </div>

          <button className="btn-secondary" style={{ marginTop: 20 }} onClick={() => dispatch({ type: 'LOG_OUT' })}>Sign out</button>
        </div>
      </div>
      <BottomNav />
    </>
  )
}
