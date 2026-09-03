import React, { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ClipboardCheck, Inbox, History } from 'lucide-react'
import { useStore } from '../store/store'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import ExpenseRow from '../components/ExpenseRow'

export default function Approvals() {
  const { state } = useStore()
  const nav = useNavigate()
  const [showHistory, setShowHistory] = useState(false)

  if (state.role !== 'manager') {
    return <Navigate to="/claims" replace />
  }

  function lastActionAt(expense) {
    return expense.history?.[expense.history.length - 1]?.at || expense.date
  }

  const pending = useMemo(
    () => state.expenses
      .filter((expense) => expense.status === 'submitted')
      .sort((firstExpense, secondExpense) => secondExpense.amount - firstExpense.amount),
    [state.expenses]
  )

  const done = useMemo(
    () => state.expenses
      .filter((expense) =>
        expense.status === 'approved' ||
        expense.status === 'paid' ||
        expense.status === 'rejected'
      )
      .sort((firstExpense, secondExpense) =>
        new Date(lastActionAt(secondExpense)) - new Date(lastActionAt(firstExpense))
      ),
    [state.expenses]
  )

  const visibleExpenses = showHistory ? done : pending

  return (
    <>
      <TopBar
        title={showHistory ? 'Approval History' : 'Approvals'}
        subtitle={
          showHistory
            ? `${done.length} past decision${done.length === 1 ? '' : 's'}`
            : `${pending.length} claim${pending.length === 1 ? '' : 's'} awaiting approval`
        }
      />

      <div className="app-scroll">
        <div className="page" style={{ paddingTop: 16 }}>
          <div className="approval-heading">
            <div className="section-title">
              {showHistory ? 'Past approvals' : 'Approval queue'}
            </div>

            <button
              className="approval-history-btn"
              type="button"
              aria-pressed={showHistory}
              onClick={() => setShowHistory((current) => !current)}
            >
              <History size={15} strokeWidth={2.25} />
              <span>{showHistory ? 'Show queue' : 'Show history'}</span>
            </button>
          </div>

          {visibleExpenses.length === 0 ? (
            <div className="empty-state">
              {showHistory ? <Inbox size={34} /> : <ClipboardCheck size={34} />}
              <p>
                {showHistory
                  ? 'No past approvals yet.'
                  : "You're all caught up - nothing pending approval right now."}
              </p>
            </div>
          ) : (
            visibleExpenses.map((expense) => (
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