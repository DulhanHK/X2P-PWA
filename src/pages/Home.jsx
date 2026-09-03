import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Receipt, ClipboardCheck, Inbox } from 'lucide-react'
import { useStore } from '../store/store'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import ExpenseRow from '../components/ExpenseRow'
import { money } from '../lib/format'
import useOnline from '../lib/useOnline'

export default function Home() {
  const { state } = useStore()
  const nav = useNavigate()
  const online = useOnline()

  const drafts = state.expenses.filter((e) => e.status === 'draft')
  const pendingApprovals = state.expenses.filter((e) => e.status === 'submitted')
  const totalClaims = state.expenses.filter((e) => e.status !== 'draft')
  const sum = (list) => list.reduce((s, e) => s + e.amount, 0)

  return (
    <>
      {!online && <div className="offline-banner">● Offline — captures sync automatically once reconnected</div>}
      <TopBar title="X2P" subtitle={`Hi, ${state.user.name.split(' ')[0]}`} />
      <div className="app-scroll">
        <div className="page" style={{ paddingTop: 0 }}>
          <button className="expenseit-cta" onClick={() => nav('/capture')}>
            <div className="expenseit-cta-icon"><Camera size={22} color="#fff" /></div>
            <div>
              <div className="expenseit-cta-title">Capture a receipt</div>
              <div className="expenseit-cta-sub">X2P reads the merchant, date, and amount for you</div>
            </div>
          </button>

          <div className="tile-grid">
            <button className="tile" onClick={() => nav('/expenses')}>
              <div className="tile-icon"><Receipt size={17} /></div>
              <div className="tile-label">Expenses</div>
              <div className="tile-count"><b>{drafts.length}</b> not submitted · {money(sum(drafts), 'GBP')}</div>
            </button>
            <button className="tile" onClick={() => nav('/claims')}>
              <div className="tile-icon"><ClipboardCheck size={17} /></div>
              <div className="tile-label">Claims</div>
              <div className="tile-count"><b>{totalClaims.length}</b> total · {money(sum(totalClaims), 'GBP')}</div>
              <div className="tile-count">{pendingApprovals.length} {state.role === 'manager' ? 'pending you' : 'pending'} · {money(sum(pendingApprovals), 'GBP')}</div>
            </button>
          </div>

          <div className="section-title">Recent expenses</div>
          {state.expenses.length === 0 ? (
            <div className="empty-state">
              <Inbox size={34} />
              <p>No expenses yet. Tap "Capture a receipt" to add your first one.</p>
            </div>
          ) : (
            state.expenses.slice(0, 4).map((e) => <ExpenseRow key={e.id} expense={e} onClick={() => nav(`/expenses/${e.id}`)} />)
          )}
        </div>
      </div>
      <BottomNav />
    </>
  )
}
