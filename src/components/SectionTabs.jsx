import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Receipt } from 'lucide-react'

export default function SectionTabs({ active }) {
  const nav = useNavigate()
  return (
    <div className="tab-row">
      <button className={active === 'claims' ? 'active' : ''} onClick={() => nav('/claims')}><ClipboardCheck size={15} /> Claims</button>
      <button className={active === 'expenses' ? 'active' : ''} onClick={() => nav('/expenses')}><Receipt size={15} /> Expenses</button>
    </div>
  )
}
