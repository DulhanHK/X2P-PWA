import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/store'
import { initials } from '../lib/format'
import logo from '../assets/logo.png'
import { ChevronLeft } from 'lucide-react'

export default function TopBar({ title, subtitle, onBack }) {
  const { state } = useStore()
  const nav = useNavigate()

  return (
    <div className="topbar">
      <div className="topbar-left">
        {onBack ? (
          <button className="back-btn" onClick={onBack} aria-label="Back">
            <ChevronLeft size={18} strokeWidth={2.25} />
          </button>
        ) : (
          <div className="topbar-logo"><img src={logo} alt="X2P" /></div>
        )}
        <div>
          <div className="topbar-title">{title}</div>
          {subtitle && <div className="topbar-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="topbar-actions">
        <button className="avatar-circle" onClick={() => nav('/profile')} aria-label="Profile">
          {initials(state.user.name)}
        </button>
      </div>
    </div>
  )
}
