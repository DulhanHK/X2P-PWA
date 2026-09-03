import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { useStore } from '../store/store'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import ExpenseRow from '../components/ExpenseRow'
import SectionTabs from '../components/SectionTabs'

export default function Claims() {
  const { state } = useStore()
  const nav = useNavigate()
  const [subTab, setSubTab] = useState('pending')

  function lastActionAt(expense) {
    return expense.history?.[expense.history.length - 1]?.at || expense.date
  }

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

  const visibleClaims = subTab === 'pending' ? myPending : myDone

  return (
    <>
      <TopBar title="Claims" subtitle={`${myPending.length + myDone.length} submitted`} />

      <div className="app-scroll">
        <div className="page" style={{ paddingTop: 0 }}>
          <SectionTabs active="claims" />

          <div className="segmented" style={{ marginBottom: 6 }}>
            <button
              className={subTab === 'pending' ? 'active' : ''}
              onClick={() => setSubTab('pending')}
            >
              Pending ({myPending.length})
            </button>
            <button
              className={subTab === 'done' ? 'active' : ''}
              onClick={() => setSubTab('done')}
            >
              Done ({myDone.length})
            </button>
          </div>

          <div className="section-title">
            {subTab === 'pending' ? 'Awaiting approval' : 'Decided claims'}
          </div>

          {visibleClaims.length === 0 ? (
            <div className="empty-state">
              <Inbox size={34} />
              <p>
                {subTab === 'pending'
                  ? "Submit an expense for approval and it'll show up here."
                  : 'Approved, paid, and rejected claims will show up here.'}
              </p>
            </div>
          ) : (
            visibleClaims.map((expense) => (
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