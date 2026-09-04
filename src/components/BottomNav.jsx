import React from 'react'
import { Home, Receipt, ClipboardCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/store'

export default function BottomNav() {
  const nav = useNavigate()
  const loc = useLocation()
  const { state } = useStore()

  const left = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
  ]
  const right = state.role === 'manager' ? [{ path: '/claims', label: 'Approvals', icon: ClipboardCheck }] : []

  const Item = ({ path, label, icon: Icon }) => {
    const active = loc.pathname === path
    return (
      <button className={`nav-btn ${active ? 'active' : ''}`} onClick={() => nav(path)}>
        <Icon size={20} strokeWidth={active ? 2.4 : 2} />
        {label}
      </button>
    )
  }

  return (
    <nav className="bottom-nav">
      {left.map((it) => <Item key={it.path} {...it} />)}
      {right.map((it) => <Item key={it.path} {...it} />)}
    </nav>
  )
}
