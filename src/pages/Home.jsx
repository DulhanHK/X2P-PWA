import React, { useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Receipt, Inbox } from 'lucide-react'
import { useStore } from '../store/store'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import ExpenseRow from '../components/ExpenseRow'
import { money, STATUS_META, timeAgo } from '../lib/format'
import useOnline from '../lib/useOnline'

export default function Home() {
  const { state } = useStore()
  const nav = useNavigate()
  const online = useOnline()
  const cameraInputId = useId()

  const drafts = state.expenses.filter((e) => e.status === 'draft')
  const pendingClaims = state.expenses
  .filter((expense) => expense.status === 'submitted')
  .sort((firstExpense, secondExpense) =>
    new Date(secondExpense.date) - new Date(firstExpense.date)
  )
  const sum = (list) => list.reduce((s, e) => s + e.amount, 0)

  function captureReceipt(event) {
    const file = event.target.files?.[0]

    // Allows taking or selecting the same photo again after returning.
    event.target.value = ''

    if (file) {
      nav('/capture', { state: { mode: 'camera', file } })
    }
  }

  return (
    <>
      <input
        id={cameraInputId}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={captureReceipt}
      />

      {!online && (
        <div className="offline-banner">
          ● Offline — captures sync automatically once reconnected
        </div>
      )}

      <TopBar title="X2P" subtitle={`Hi, ${state.user.name.split(' ')[0]}`} />

      <div className="app-scroll">
        <div className="page" style={{ paddingTop: 0 }}>
          <label className="expenseit-cta" htmlFor={cameraInputId}>
            <div className="expenseit-cta-icon">
              <Camera size={22} color="#fff" />
            </div>
            <div>
              <div className="expenseit-cta-title">Capture a receipt</div>
              <div className="expenseit-cta-sub">
                X2P reads the merchant, date, and amount for you
              </div>
            </div>
          </label>

          {pendingClaims.length > 0 && (
  <>
    <div className="home-section-heading">
      <div className="section-title">Claim requests</div>

      <button
        type="button"
        className="home-section-link"
        onClick={() => nav('/claims')}
      >
        View all
      </button>
    </div>

    <div className="claim-request-scroll">
      {pendingClaims.map((expense) => {
        const status = STATUS_META[expense.status]

        return (
          <button
            key={expense.id}
            type="button"
            className="claim-request-card"
            onClick={() => nav(`/expenses/${expense.id}`)}
          >
            <div className="claim-request-card-top">
              <span className="claim-request-merchant">
                {expense.merchant}
              </span>
              <span className="claim-request-amount">
                {money(expense.amount, expense.currency)}
              </span>
            </div>

            <div className="claim-request-category">
              {expense.category}
            </div>

            <div className="claim-request-card-bottom">
              <span>{timeAgo(expense.date)}</span>
              {status && (
                <span className={`status-chip ${status.className}`}>
                  {status.label}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  </>
)}

          <div className="section-title">Recent expenses</div>

          {state.expenses.length === 0 ? (
            <div className="empty-state">
              <Inbox size={34} />
              <p>No expenses yet. Tap "Capture a receipt" to add your first one.</p>
            </div>
          ) : (
            state.expenses
              .slice(0, 4)
              .map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onClick={() => nav(`/expenses/${expense.id}`)}
                />
              ))
          )}
        </div>
      </div>

      <BottomNav />
    </>
  )
}