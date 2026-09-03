import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Inbox, Check, X, ChevronRight } from 'lucide-react'
import { useStore, actorName } from '../store/store'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import ExpenseRow from '../components/ExpenseRow'
import SectionTabs from '../components/SectionTabs'
import { money, initials, timeAgo } from '../lib/format'

export default function Claims() {
  const { state, dispatch } = useStore()
  const nav = useNavigate()
  const isManager = state.role === 'manager'
  const [rejectId, setRejectId] = useState(null)
  const [comment, setComment] = useState('')
  const [subTab, setSubTab] = useState('pending') // pending | done

  function lastActionAt(e) { return e.history?.[e.history.length - 1]?.at || e.date }

  const pending = useMemo(
    () => state.expenses
      .filter((e) => e.status === 'submitted')
      .sort((a, b) => b.amount - a.amount),
    [state.expenses]
  )
  const done = useMemo(
    () => state.expenses
      .filter((e) => e.status === 'approved' || e.status === 'paid' || e.status === 'rejected')
      .sort((a, b) => new Date(lastActionAt(b)) - new Date(lastActionAt(a))),
    [state.expenses]
  )
  const myPending = useMemo(
    () => state.expenses.filter((e) => e.status === 'submitted').sort((a, b) => new Date(b.date) - new Date(a.date)),
    [state.expenses]
  )
  const myDone = useMemo(
    () => state.expenses
      .filter((e) => e.status === 'approved' || e.status === 'paid' || e.status === 'rejected')
      .sort((a, b) => new Date(lastActionAt(b)) - new Date(lastActionAt(a))),
    [state.expenses]
  )
  const totalPending = pending.reduce((s, e) => s + e.amount, 0)

  function approve(id) {
    dispatch({ type: 'EXPENSE_ACTION', id, status: 'approved', actor: actorName(state.role, state) })
    setTimeout(() => dispatch({ type: 'EXPENSE_ACTION', id, status: 'paid', actor: 'Finance / PIS Settlement' }), 3500)
  }

  function reject() {
    if (!comment.trim()) return
    dispatch({ type: 'EXPENSE_ACTION', id: rejectId, status: 'rejected', actor: actorName(state.role, state), comment: comment.trim() })
    setRejectId(null)
    setComment('')
  }

  if (isManager) {
    return (
      <>
        <TopBar title="Claims" subtitle={`${pending.length} claim${pending.length === 1 ? '' : 's'} pending you`} />
        <div className="app-scroll">
          <div className="page" style={{ paddingTop: 0 }}>
            <SectionTabs active="claims" />
            {pending.length > 0 && subTab === 'pending' && (
              <div className="spendbar-card" style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="spendbar-title">Total pending approval</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--x2p-green-800)' }}>{money(totalPending, 'GBP')}</span>
              </div>
            )}

            <div className="segmented" style={{ marginBottom: 6 }}>
              <button className={subTab === 'pending' ? 'active' : ''} onClick={() => setSubTab('pending')}>Pending ({pending.length})</button>
              <button className={subTab === 'done' ? 'active' : ''} onClick={() => setSubTab('done')}>Done ({done.length})</button>
            </div>
            <div className="section-title">{subTab === 'pending' ? 'Approval queue' : 'Decided claims'}</div>

            {subTab === 'pending' ? (
              pending.length === 0 ? (
                <div className="empty-state">
                  <ClipboardCheck size={34} />
                  <p>You're all caught up — nothing pending approval right now.</p>
                </div>
              ) : (
                pending.map((e) => (
                  <div key={e.id} className="card" style={{ marginBottom: 10 }}>
                    <button className="list-row" style={{ padding: 0, marginBottom: 10 }} onClick={() => nav(`/expenses/${e.id}`)}>
                      <div className="merchant-badge">{initials(e.merchant)}</div>
                      <div className="card-body">
                        <div className="card-title-row">
                          <span className="card-merchant">{e.merchant}</span>
                          <span className="card-amount">{money(e.amount, e.currency)}</span>
                        </div>
                        <div className="card-meta">{e.category} · {timeAgo(e.date)}</div>
                      </div>
                      <ChevronRight size={16} className="list-row-chevron" />
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button className="btn-secondary" style={{ padding: 10 }} onClick={() => setRejectId(e.id)}><X size={15} /> Reject</button>
                      <button className="btn-primary" style={{ padding: 10, boxShadow: 'none' }} onClick={() => approve(e.id)}><Check size={16} /> Approve</button>
                    </div>
                  </div>
                ))
              )
            ) : (
              done.length === 0 ? (
                <div className="empty-state">
                  <Inbox size={34} />
                  <p>Nothing decided yet — approved, paid, and rejected claims will show up here.</p>
                </div>
              ) : (
                done.map((e) => <ExpenseRow key={e.id} expense={e} onClick={() => nav(`/expenses/${e.id}`)} />)
              )
            )}
          </div>
        </div>
        <BottomNav />

        {rejectId && (
          <div className="sheet-backdrop" onClick={() => setRejectId(null)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-handle" />
              <div className="sheet-title">Reject claim</div>
              <p className="field-hint" style={{ marginBottom: 12 }}>Let the employee know why this claim was rejected.</p>
              <textarea className="field-textarea" autoFocus value={comment} onChange={(e) => setComment(e.target.value)} placeholder="e.g. Missing customs invoice for this shipment." />
              <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                <button className="btn-primary" disabled={!comment.trim()} onClick={reject}>Reject claim</button>
                <button className="btn-secondary" onClick={() => setRejectId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
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
            <button className={subTab === 'pending' ? 'active' : ''} onClick={() => setSubTab('pending')}>Pending ({myPending.length})</button>
            <button className={subTab === 'done' ? 'active' : ''} onClick={() => setSubTab('done')}>Done ({myDone.length})</button>
          </div>
          <div className="section-title">{subTab === 'pending' ? 'Awaiting approval' : 'Decided claims'}</div>
          {(subTab === 'pending' ? myPending : myDone).length === 0 ? (
            <div className="empty-state">
              <Inbox size={34} />
              <p>{subTab === 'pending' ? 'Submit an expense for approval and it\'ll show up here.' : 'Approved, paid, and rejected claims will show up here.'}</p>
            </div>
          ) : (
            (subTab === 'pending' ? myPending : myDone).map((e) => <ExpenseRow key={e.id} expense={e} onClick={() => nav(`/expenses/${e.id}`)} />)
          )}
        </div>
      </div>
      <BottomNav />
    </>
  )
}
