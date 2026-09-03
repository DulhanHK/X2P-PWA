import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Inbox, History } from 'lucide-react'
import { useStore } from '../store/store'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import ExpenseRow from '../components/ExpenseRow'
import SectionTabs from '../components/SectionTabs'

export default function Claims() {
  const { state } = useStore()
  const nav = useNavigate()
  const isManager = state.role === 'manager'
  const [subTab, setSubTab] = useState('pending')
  const [showHistory, setShowHistory] = useState(false)

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

  const myPending = useMemo(
    () => state.expenses
      .filter((expense) => expense.status === 'submitted')
      .sort((firstExpense, secondExpense) =>
        new Date(secondExpense.date) - new Date(firstExpense.date)
      ),
    [state.expenses]
  )

  const myDone = useMemo(
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

  if (isManager) {
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

          {!showHistory ? (
            pending.length === 0 ? (
              <div className="empty-state">
                <ClipboardCheck size={34} />
                <p>You're all caught up - nothing pending approval right now.</p>
              </div>
            ) : (
              pending.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onClick={() => nav(`/expenses/${expense.id}`)}
                />
              ))
            )
          ) : done.length === 0 ? (
            <div className="empty-state">
              <Inbox size={34} />
              <p>No past approvals yet.</p>
            </div>
          ) : (
            done.map((expense) => (
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

  return (
    <>
      <TopBar title="Claims" subtitle={`${myPending.length + myDone.length} submitted`} />
      <div className="app-scroll">
        <div className="page" style={{ paddingTop: 0 }}>
          <SectionTabs active="claims" />
          <div className="segmented" style={{ marginBottom: 6 }}>
            <button className={subTab === 'pending' ? 'active' : ''} onClick={() => setSubTab('pending')}>
              Pending ({myPending.length})
            </button>
            <button className={subTab === 'done' ? 'active' : ''} onClick={() => setSubTab('done')}>
              Done ({myDone.length})
            </button>
          </div>
          <div className="section-title">{subTab === 'pending' ? 'Awaiting approval' : 'Decided claims'}</div>

          {(subTab === 'pending' ? myPending : myDone).length === 0 ? (
            <div className="empty-state">
              <Inbox size={34} />
              <p>
                {subTab === 'pending'
                  ? "Submit an expense for approval and it'll show up here."
                  : 'Approved, paid, and rejected claims will show up here.'}
              </p>
            </div>
          ) : (
            (subTab === 'pending' ? myPending : myDone).map((expense) => (
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