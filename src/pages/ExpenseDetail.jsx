import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2, Check, RotateCcw, Sparkles, ChevronRight } from 'lucide-react'
import { useStore, PAYMENT_TYPES, actorName } from '../store/store'
import TopBar from '../components/TopBar'
import ExpenseTypePicker from '../components/ExpenseTypePicker'
import { money, STATUS_META, timeAgo } from '../lib/format'

export default function ExpenseDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, dispatch } = useStore()
  const expense = state.expenses.find((e) => e.id === id)
  const [actionSheet, setActionSheet] = useState(null) // 'send_back' | null
  const [comment, setComment] = useState('')
  const [typePicker, setTypePicker] = useState(false)
  const [tab, setTab] = useState('details') // details | receipt
  const [aiInfoOpen, setAiInfoOpen] = useState(false)

  if (!expense) return null

  const editable = expense.status === 'draft' || expense.status === 'sent_back'
  const meta = STATUS_META[expense.status]

  function update(patch) {
    dispatch({ type: 'UPDATE_EXPENSE', id: expense.id, updater: (e) => ({ ...e, ...patch }) })
  }

  function removeExpense() {
    dispatch({ type: 'DELETE_EXPENSE', id: expense.id })
    nav(-1)
  }

  function submit() {
    dispatch({ type: 'SUBMIT_EXPENSE', id: expense.id, actor: actorName(state.role, state) })
  }

  function approve() {
    dispatch({ type: 'EXPENSE_ACTION', id: expense.id, status: 'approved', actor: actorName(state.role, state) })
    setTimeout(() => dispatch({ type: 'EXPENSE_ACTION', id: expense.id, status: 'paid', actor: 'Finance / PIS Settlement' }), 3500)
  }

  function sendBack() {
    if (!comment.trim()) return
    dispatch({ type: 'EXPENSE_ACTION', id: expense.id, status: 'sent_back', actor: actorName(state.role, state), comment: comment.trim() })
    setActionSheet(null)
    setComment('')
  }

  return (
    <>
      <TopBar title="Expense" onBack={() => nav(-1)} />
      <div className="app-scroll">
        <div className="detail-header">
          <div style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 600 }}>{expense.merchant}</div>
          <div className="detail-amount">{money(expense.amount, expense.currency)}</div>
          {meta && <span className={`status-chip ${meta.className}`} style={{ marginTop: 8, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{meta.label}</span>}
        </div>

        <div className="page" style={{ paddingTop: 0 }}>
          <div className="tab-row" style={{ marginTop: -34, position: 'relative', zIndex: 2 }}>
            <button className={tab === 'details' ? 'active' : ''} onClick={() => setTab('details')}>Details</button>
            <button className={tab === 'receipt' ? 'active' : ''} onClick={() => setTab('receipt')}>Receipt</button>
          </div>

          {tab === 'receipt' ? (
            expense.receiptImage ? (
              <img src={expense.receiptImage} alt="Receipt" style={{ width: '100%', borderRadius: 12 }} />
            ) : (
              <div className="empty-state">
                <p>No receipt attached to this expense.</p>
              </div>
            )
          ) : (
          <div className="card">
            {expense.source === 'expenseit' && (
              <>
                <button type="button" className="ai-row" onClick={() => setAiInfoOpen((v) => !v)}>
                  <Sparkles size={15} />
                  <span>AI-assisted</span>
                  <ChevronRight size={15} style={{ marginLeft: 'auto', transform: aiInfoOpen ? 'rotate(90deg)' : 'none' }} />
                </button>
                {aiInfoOpen && (
                  <div className="ai-disclaimer" style={{ marginBottom: 14 }}>
                    <Sparkles size={14} />
                    <span>These fields were filled in by AI from your receipt photo — double-check them before submitting this claim.</span>
                  </div>
                )}
              </>
            )}

            <div className="field">
              <label>Vendor</label>
              <input className="field-input" disabled={!editable} value={expense.merchant} onChange={(e) => update({ merchant: e.target.value })} />
            </div>
            <div className="field">
              <label>Amount</label>
              <input className="field-input" type="number" step="0.01" disabled={!editable} value={expense.amount} onChange={(e) => update({ amount: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="field">
              <label>Expense Type</label>
              <button type="button" className="field-input" disabled={!editable} onClick={() => editable && setTypePicker(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', color: 'inherit' }}>
                <span>{expense.category}</span>
                {editable && <ChevronRight size={15} />}
              </button>
            </div>
            <div className="field" style={{ marginBottom: 4 }}>
              <label>Date</label>
              <input className="field-input" type="date" disabled={!editable} value={expense.date.slice(0, 10)} onChange={(e) => update({ date: e.target.value })} />
            </div>

            <div className="optional-label">Optional</div>
            <div className="field">
              <label>Location</label>
              <input className="field-input" disabled={!editable} value={expense.location || ''} onChange={(e) => update({ location: e.target.value })} placeholder="Optional" />
            </div>
            <div className="field">
              <label>Payment type</label>
              <select className="field-select" disabled={!editable} value={expense.paymentType} onChange={(e) => update({ paymentType: e.target.value })}>
                {PAYMENT_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Business purpose</label>
              <textarea className="field-textarea" disabled={!editable} value={expense.businessPurpose} onChange={(e) => update({ businessPurpose: e.target.value })} placeholder="Why was this spent?" />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Comment</label>
              <textarea className="field-textarea" disabled={!editable} value={expense.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Optional" />
            </div>
          </div>
          )}

          {tab === 'details' && (
          <>
          <div className="section-title">Status timeline</div>
          <div className="card">
            <div className="timeline">
              {(expense.history || []).map((h, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-title">{STATUS_META[h.status]?.label || h.status}</div>
                  <div className="timeline-meta">{h.actor} · {timeAgo(h.at)}</div>
                  {h.comment && <div className="timeline-comment">"{h.comment}"</div>}
                </div>
              ))}
            </div>
          </div>

          {editable && (
            <button className="btn-ghost" style={{ marginTop: 16, color: 'var(--x2p-rust-500)', display: 'flex', alignItems: 'center', gap: 6 }} onClick={removeExpense}>
              <Trash2 size={15} /> Delete expense
            </button>
          )}
          </>
          )}
        </div>
      </div>

      {editable && state.role !== 'manager' && (
        <div className="page" style={{ position: 'sticky', bottom: 0, background: 'var(--x2p-paper)', paddingTop: 12, paddingBottom: 16, boxShadow: '0 -8px 20px -12px rgba(0,0,0,0.2)' }}>
          <button className="btn-primary" onClick={submit}>{expense.status === 'sent_back' ? 'Resubmit claim' : 'Submit for approval'} · {money(expense.amount, expense.currency)}</button>
        </div>
      )}

      {expense.status === 'submitted' && state.role === 'manager' && (
        <div className="page" style={{ position: 'sticky', bottom: 0, background: 'var(--x2p-paper)', paddingTop: 12, paddingBottom: 16, boxShadow: '0 -8px 20px -12px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
            <button className="btn-secondary" style={{ padding: 11 }} onClick={() => setActionSheet('send_back')}><RotateCcw size={15} /> Send Back</button>
            <button className="btn-primary" style={{ padding: 11, boxShadow: 'none' }} onClick={approve}><Check size={16} /> Approve claim</button>
          </div>
        </div>
      )}

      {actionSheet === 'send_back' && (
        <div className="sheet-backdrop" onClick={() => setActionSheet(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">Send claim back</div>
            <p className="field-hint" style={{ marginBottom: 12 }}>Let the employee know what to fix.</p>
            <textarea className="field-textarea" autoFocus value={comment} onChange={(e) => setComment(e.target.value)} placeholder="e.g. Please attach the customs invoice as a second page." />
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              <button className="btn-primary" disabled={!comment.trim()} onClick={sendBack}>Send back to employee</button>
              <button className="btn-secondary" onClick={() => setActionSheet(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {typePicker && (
        <ExpenseTypePicker
          value={expense.category}
          onSelect={(cat) => { update({ category: cat }); setTypePicker(false) }}
          onClose={() => setTypePicker(false)}
        />
      )}
    </>
  )
}

