import React from 'react'
import { User, Mail, Building2, Info } from 'lucide-react'
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
            <div className="merchant-badge" style={{ width: 52, height: 52, fontSize: 17 }}>{initials(state.user.name || 'User')}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{state.user.name || 'Loading...'}</div>
              <div className="field-hint" style={{ marginTop: 2 }}>{state.user.department || 'Department'}</div>
            </div>
          </div>

          <div className="section-title">Details</div>
          <div className="card">
            <div className="kv-row"><span className="kv-label"><User size={14} style={{ verticalAlign: -2, marginRight: 6 }} />User Name</span><span className="kv-value">{state.user.name}</span></div>
            <div className="kv-row"><span className="kv-label"><Building2 size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Department</span><span className="kv-value">{state.user.department}</span></div>
          </div>

          <div className="section-title">Demo mode</div>
          <div className="card">
            <p className="field-hint" style={{ marginBottom: 10 }}>
              <Info size={13} style={{ verticalAlign: -2, marginRight: 5 }} />
              Switch roles to preview both the employee and manager experience without signing out.
            </p>
            <div className="chip-row">
              <button className={`toggle-chip ${state.role === 'employee' ? 'active' : ''}`} onClick={() => { dispatch({ type: 'SET_ROLE', role: 'employee' }); nav('/home') }}>Employee view</button>
              <button
                  className={`toggle-chip ${state.role === 'manager' ? 'active' : ''}`}
                  onClick={() => {
                    dispatch({ type: 'SET_ROLE', role: 'manager' })
                    nav('/approvals')
                  }}
                >
                  Manager view
                </button>
            </div>
          </div>

          <button className="btn-secondary" style={{ marginTop: 20 }} onClick={() => dispatch({ type: 'LOG_OUT' })}>Sign out</button>
        </div>
      </div>
      <BottomNav />
    </>
  )
}