import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2, Check, X, Sparkles, ChevronRight, FileText } from 'lucide-react'
import { useStore, actorName } from '../store/store'
import TopBar from '../components/TopBar'
import ExpenseTypePicker from '../components/ExpenseTypePicker'
import { money, STATUS_META, timeAgo, currencyName } from '../lib/format'
import CountryPicker from '../components/CountryPicker'
import CurrencyPicker from '../components/CurrencyPicker'
import BrandPicker from '../components/BrandPicker'
import DivisionPicker from '../components/DivisionPicker'
import TerritoryPicker from '../components/TerritoryPicker'
import PaymentTypePicker from '../components/PaymentTypePicker'
import ReceiptStatusPicker from '../components/ReceiptStatusPicker'


export default function ExpenseDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, dispatch } = useStore()
  const expense = state.expenses.find((item) => item.id === id)

  const [actionSheet, setActionSheet] = useState(null)
  const [comment, setComment] = useState('')
  const [typePicker, setTypePicker] = useState(false)
  const [tab, setTab] = useState('details')
  const [aiInfoOpen, setAiInfoOpen] = useState(false)
  const [countryPicker, setCountryPicker] = useState(false)
  const [currencyPicker, setCurrencyPicker] = useState(false)
  const [brandPicker, setBrandPicker] = useState(false)
  const [divisionPicker, setDivisionPicker] = useState(false)
  const [territoryPicker, setTerritoryPicker] = useState(false)
  const [paymentTypePicker, setPaymentTypePicker] = useState(false)
  const [receiptStatusPicker, setReceiptStatusPicker] = useState(false)
  const [errors, setErrors] = useState({})

  if (!expense) return null

  const editable = expense.status === 'draft'
  const meta = STATUS_META[expense.status]
  const exchangeRate = Number(expense.exchangeRate) || 0
  const amountInGbp = (Number(expense.amount) || 0) * exchangeRate
  const isOcrExpense = expense.source === 'expenseit'

  function update(patch) {
  dispatch({
    type: 'UPDATE_EXPENSE',
    id: expense.id,
    updater: (item) => ({ ...item, ...patch }),
  })

  setErrors((currentErrors) => {
    const remainingErrors = { ...currentErrors }

    Object.keys(patch).forEach((fieldName) => {
      delete remainingErrors[fieldName]
    })

    return remainingErrors
  })
}

  function removeExpense() {
    dispatch({ type: 'DELETE_EXPENSE', id: expense.id })
    nav(-1)
  }

  function submit() {
  const nextErrors = {}

  if (!expense.invoiceNumber?.trim()) {
  nextErrors.invoiceNumber = 'Enter the invoice number.'
}

  if (!expense.category?.trim()) {
    nextErrors.category = 'Select an expense type.'
  }

  if (!expense.date?.trim()) {
    nextErrors.date = 'Enter the transaction date.'
  }

  if (!expense.businessPurpose?.trim()) {
    nextErrors.businessPurpose = 'Enter the business purpose.'
  }

  if (!expense.merchant?.trim()) {
    nextErrors.merchant = 'Enter the vendor description.'
  }

  if (!expense.country?.trim()) {
    nextErrors.country = 'Select a country.'
  }

  if (!expense.paymentType?.trim()) {
    nextErrors.paymentType = 'Select a payment type.'
  }

  if (!expense.currency?.trim()) {
    nextErrors.currency = 'Select a currency.'
  }

  if (!Number(expense.amount) || Number(expense.amount) <= 0) {
    nextErrors.amount = 'A valid amount is required.'
  }

  if (!Number(expense.exchangeRate) || Number(expense.exchangeRate) <= 0) {
    nextErrors.exchangeRate = 'Enter a valid exchange rate.'
  }

  if (!Number(amountInGbp) || amountInGbp <= 0) {
    nextErrors.amountInGbp = 'Amount in GBP must be greater than zero.'
  }

  if (!expense.receiptStatus?.trim()) {
    nextErrors.receiptStatus = 'Select a receipt status.'
  }

  if (!expense.brand?.trim()) {
    nextErrors.brand = 'Select a brand.'
  }

  if (!expense.division?.trim()) {
    nextErrors.division = 'Select a division.'
  }

  if (typeof expense.personalExpense !== 'boolean') {
    nextErrors.personalExpense = 'Choose whether this is a personal expense.'
  }

  setErrors(nextErrors)

  if (Object.keys(nextErrors).length > 0) {
    document.querySelector('.field-error')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
    return
  }

  dispatch({
    type: 'SUBMIT_EXPENSE',
    id: expense.id,
    actor: actorName(state.role, state),
  })
}

  function approve() {
    dispatch({
      type: 'EXPENSE_ACTION',
      id: expense.id,
      status: 'approved',
      actor: actorName(state.role, state),
    })
    setTimeout(() => {
      dispatch({
        type: 'EXPENSE_ACTION',
        id: expense.id,
        status: 'paid',
        actor: 'Finance / PIS Settlement',
      })
    }, 3500)
  }

  function sendBack() {
    if (!comment.trim()) return

    dispatch({
      type: 'EXPENSE_ACTION',
      id: expense.id,
      status: 'rejected',
      actor: actorName(state.role, state),
      comment: comment.trim(),
    })
    setActionSheet(null)
    setComment('')
  }

 

  return (
    <>
      <TopBar title="Expense" onBack={() => nav(-1)} />

      <div className="app-scroll">
        <div className="detail-header">
          <div style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 600 }}>
            {expense.merchant}
          </div>
          <div className="detail-amount">{money(expense.amount, expense.currency)}</div>
          {meta && (
            <span
              className={`status-chip ${meta.className}`}
              style={{
                marginTop: 8,
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
              }}
            >
              {meta.label}
            </span>
          )}
        </div>

        <div className="page expense-detail-page">
  <div className="tab-row expense-detail-tabs">
            <button className={tab === 'details' ? 'active' : ''} onClick={() => setTab('details')}>
              Details
            </button>
            <button className={tab === 'receipt' ? 'active' : ''} onClick={() => setTab('receipt')}>
              Receipt
            </button>
          </div>

          {tab === 'receipt' ? (
            expense.receiptImage ? (
              <img
                src={expense.receiptImage}
                alt="Receipt attachment"
                style={{ width: '100%', borderRadius: 12 }}
              />
            ) : expense.receiptAttachment || expense.receiptDocumentName ? (
              <div
                className="capture-preview"
                style={{
                  minHeight: 150,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 20,
                  background: 'var(--x2p-surface)',
                }}
              >
                <FileText size={36} color="var(--x2p-green-600)" />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {expense.receiptAttachment?.name || expense.receiptDocumentName}
                  </div>
                  <div className="field-hint">
                    {expense.receiptAttachment?.type || 'Document attachment'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>No receipt attached to this expense.</p>
              </div>
            )
          ) : (
            <div className="card">
              {isOcrExpense && (
                <>
                  <button type="button" className="ai-row" onClick={() => setAiInfoOpen((open) => !open)}>
                    <Sparkles size={15} />
                    <span>AI-assisted</span>
                    <ChevronRight
                      size={15}
                      style={{ marginLeft: 'auto', transform: aiInfoOpen ? 'rotate(90deg)' : 'none' }}
                    />
                  </button>

                  {aiInfoOpen && (
                    <div className="ai-disclaimer" style={{ marginBottom: 14 }}>
                      <Sparkles size={14} />
                      <span>
                        These fields were filled from your receipt photo. Please check them before submitting.
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="field">
                <label>Invoice Number <span className="req">*</span></label>
                <input
                  className="field-input"
                  disabled={!editable}
                  value={expense.invoiceNumber || ''}
                  onChange={(event) => update({ invoiceNumber: event.target.value })}
                  placeholder="Enter invoice number"
                />
                {errors.invoiceNumber && (
                  <div className="field-error">{errors.invoiceNumber}</div>
                )}
              </div>

              <div className="field">
                <label>Expense Type <span className="req">*</span></label>
                <button
                  type="button"
                  className="field-input"
                  disabled={!editable}
                  onClick={() => editable && setTypePicker(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', color: 'inherit' }}
                >
                  <span>{expense.category}</span>
                  {editable && <ChevronRight size={15} />}
                </button>
                {errors.category && <div className="field-error">{errors.category}</div>}
              </div>

              <div className="field">
                <label>Transaction Date <span className="req">*</span></label>
                <input
                  className="field-input"
                  type="date"
                  disabled={!editable}
                  value={expense.date?.slice(0, 10) || ''}
                  onChange={(event) => update({ date: event.target.value })}
                />
                {errors.date && <div className="field-error">{errors.date}</div>}
              </div>

              <div className="field">
                <label>Business Purpose <span className="req">*</span></label>
                <textarea
                  className="field-textarea"
                  disabled={!editable}
                  value={expense.businessPurpose || ''}
                  onChange={(event) => update({ businessPurpose: event.target.value })}
                  placeholder="Why was this spent?"
                />
                {errors.businessPurpose && <div className="field-error">{errors.businessPurpose}</div>}
              </div>

              <div className="field">
                <label>Vendor Description <span className="req">*</span></label>
                <input
                  className="field-input"
                  disabled={!editable}
                  value={expense.merchant || ''}
                  onChange={(event) => update({ merchant: event.target.value })}
                  placeholder="Vendor"
                />
                {errors.merchant && <div className="field-error">{errors.merchant}</div>}
              </div>

              <div className="field">
                <label>Country <span className="req">*</span></label>
                <button
                  type="button"
                  className="field-input"
                  disabled={!editable}
                  onClick={() => editable && setCountryPicker(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span>{expense.country || 'Select country'}</span>
                  {editable && <ChevronRight size={15} />}
                </button>
                {errors.country && <div className="field-error">{errors.country}</div>}
              </div>

              <div className="field">
               <label>Payment Type <span className="req">*</span></label>
                <button
                  type="button"
                  className="field-input"
                  disabled={!editable}
                  onClick={() => editable && setPaymentTypePicker(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span>{expense.paymentType || 'Select payment type'}</span>
                  {editable && <ChevronRight size={15} />}
                </button>
                {errors.paymentType && <div className="field-error">{errors.paymentType}</div>}
              </div>

              <div className="field">
                <label>Currency <span className="req">*</span></label>
                <button
                  type="button"
                  className="field-input"
                  disabled={!editable}
                  onClick={() => editable && setCurrencyPicker(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span>{expense.currency ? currencyName(expense.currency) : 'Select currency'}</span>
                  {editable && <ChevronRight size={15} />}
                </button>
                {errors.currency && <div className="field-error">{errors.currency}</div>}
              </div>

              <div className="field">
                <label>Amount <span className="req">*</span></label>
                <input
                  className="field-input"
                  type="number"
                  value={expense.amount}
                  disabled
                  aria-label="Amount"
                />
                <div className="field-hint">Amount is locked after the expense is saved.</div>
                {errors.amount && <div className="field-error">{errors.amount}</div>}
              </div>

              <div className="field">
                <label>Exchange Rate <span className="req">*</span></label>
                <input
                  className="field-input"
                  type="number"
                  min="0"
                  step="0.0001"
                  disabled={!editable}
                  value={expense.exchangeRate ?? ''}
                  onChange={(event) => update({ exchangeRate: event.target.value })}
                  placeholder="1.0000"
                />
                {errors.exchangeRate && <div className="field-error">{errors.exchangeRate}</div>}
              </div>

              <div className="field">
                <label>Amount in GBP <span className="req">*</span></label>
                <input
                  className="field-input"
                  value={money(amountInGbp, 'GBP')}
                  disabled
                  aria-label="Amount in GBP"
                />
                {errors.amountInGbp && <div className="field-error">{errors.amountInGbp}</div>}
              </div>

              <div className="field">
                <label>Receipt Status <span className="req">*</span></label>
                <button
                  type="button"
                  className="field-input"
                  disabled={!editable}
                  onClick={() => editable && setReceiptStatusPicker(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span>{expense.receiptStatus || 'Select receipt status'}</span>
                  {editable && <ChevronRight size={15} />}
                </button>
                {errors.receiptStatus && <div className="field-error">{errors.receiptStatus}</div>}
              </div>

              <div className="field">
                <label>Brand <span className="req">*</span></label>
                <button
                  type="button"
                  className="field-input"
                  disabled={!editable}
                  onClick={() => editable && setBrandPicker(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span>{expense.brand || 'Select brand'}</span>
                  {editable && <ChevronRight size={15} />}
                </button>
                {errors.brand && <div className="field-error">{errors.brand}</div>}
              </div>

              <div className="field">
                <label>Division <span className="req">*</span></label>
                <button
                  type="button"
                  className="field-input"
                  disabled={!editable}
                  onClick={() => editable && setDivisionPicker(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span>{expense.division || 'Select division'}</span>
                  {editable && <ChevronRight size={15} />}
                </button>
                {errors.division && <div className="field-error">{errors.division}</div>}
              </div>

              <div className="field">
                <label>Merchant Tax ID</label>
                <input
                  className="field-input"
                  disabled={!editable}
                  value={expense.merchantTaxId || ''}
                  onChange={(event) => update({ merchantTaxId: event.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className="field">
                <label>Territory</label>
                <button
                  type="button"
                  className="field-input"
                  disabled={!editable}
                  onClick={() => editable && setTerritoryPicker(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span>{expense.territory || 'Select territory'}</span>
                  {editable && <ChevronRight size={15} />}
                </button>
                {errors.territory && <div className="field-error">{errors.territory}</div>}
              </div>

              <div className="field">
                <label>Comment</label>
                <textarea
                  className="field-textarea"
                  disabled={!editable}
                  value={expense.notes || ''}
                  onChange={(event) => update({ notes: event.target.value })}
                  placeholder="Optional"
                />
                {errors.notes && <div className="field-error">{errors.notes}</div>}
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label>Personal Expense (do not reimburse) <span className="req">*</span></label>

                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(expense.personalExpense)}
                  aria-label="Personal Expense"
                  className={`personal-expense-switch ${expense.personalExpense ? 'is-on' : ''}`}
                  disabled={!editable}
                  onClick={() => update({ personalExpense: !expense.personalExpense })}
                >
                  <span className="personal-expense-track">
                    <span className="personal-expense-thumb" />
                  </span>
                </button>

                {errors.personalExpense && (
                  <div className="field-error">{errors.personalExpense}</div>
                )}
              </div>
            </div>
          )}

          {tab === 'details' && (
            <>
              <div className="section-title">Status timeline</div>
              <div className="card">
                <div className="timeline">
                  {(expense.history || []).map((historyItem, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-title">
                        {STATUS_META[historyItem.status]?.label || historyItem.status}
                      </div>
                      <div className="timeline-meta">
                        {historyItem.actor} · {timeAgo(historyItem.at)}
                      </div>
                      {historyItem.comment && (
                        <div className="timeline-comment">"{historyItem.comment}"</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {editable && (
                <button
                  className="btn-ghost"
                  style={{ marginTop: 16, color: 'var(--x2p-rust-500)', display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={removeExpense}
                >
                  <Trash2 size={15} /> Delete expense
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {editable && state.role !== 'manager' && (
        <div className="page" style={{ position: 'sticky', bottom: 0, background: 'var(--x2p-paper)', paddingTop: 12, paddingBottom: 16, boxShadow: '0 -8px 20px -12px rgba(0,0,0,0.2)' }}>
          <button className="btn-primary" onClick={submit}>
            Submit for approval · {money(amountInGbp, 'GBP')}
          </button>
        </div>
      )}

      {expense.status === 'submitted' && state.role === 'manager' && (
        <div className="page" style={{ position: 'sticky', bottom: 0, background: 'var(--x2p-paper)', paddingTop: 12, paddingBottom: 16, boxShadow: '0 -8px 20px -12px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
            <button className="btn-secondary" style={{ padding: 11 }} onClick={() => setActionSheet('send_back')}>
              <X size={15} /> Reject
            </button>
            <button className="btn-primary" style={{ padding: 11, boxShadow: 'none' }} onClick={approve}>
              <Check size={16} /> Approve claim
            </button>
          </div>
        </div>
      )}

      {actionSheet === 'send_back' && (
        <div className="sheet-backdrop" onClick={() => setActionSheet(null)}>
          <div className="sheet" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">Reject claim</div>
            <p className="field-hint" style={{ marginBottom: 12 }}>Let the employee know why this claim was rejected.</p>
            <textarea className="field-textarea" autoFocus value={comment} onChange={(event) => setComment(event.target.value)} />
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              <button className="btn-primary" disabled={!comment.trim()} onClick={sendBack}>Reject claim</button>
              <button className="btn-secondary" onClick={() => setActionSheet(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {typePicker && (
        <ExpenseTypePicker
          value={expense.category}
          onSelect={(category) => {
            update({ category })
            setTypePicker(false)
          }}
          onClose={() => setTypePicker(false)}
        />
      )}

      {countryPicker && (
        <CountryPicker
          value={expense.country}
          onSelect={(country) => {
            update({ country })
            setCountryPicker(false)
          }}
          onClose={() => setCountryPicker(false)}
        />
      )}

      {currencyPicker && (
        <CurrencyPicker
          value={expense.currency}
          onSelect={(currency) => {
            update({
              currency,
              exchangeRate: currency === 'GBP' ? 1 : expense.exchangeRate,
            })
            setCurrencyPicker(false)
          }}
          onClose={() => setCurrencyPicker(false)}
        />
      )}

      {brandPicker && (
        <BrandPicker
          value={expense.brand}
          onSelect={(brand) => {
            update({ brand })
            setBrandPicker(false)
          }}
          onClose={() => setBrandPicker(false)}
        />
      )}

      {divisionPicker && (
        <DivisionPicker
          value={expense.division}
          onSelect={(division) => {
            update({ division })
            setDivisionPicker(false)
          }}
          onClose={() => setDivisionPicker(false)}
        />
      )}

      {territoryPicker && (
        <TerritoryPicker
          value={expense.territory}
          onSelect={(territory) => {
            update({ territory })
            setTerritoryPicker(false)
          }}
          onClose={() => setTerritoryPicker(false)}
        />
      )}

      {paymentTypePicker && (
        <PaymentTypePicker
          value={expense.paymentType}
          onSelect={(paymentType) => {
            update({ paymentType })
            setPaymentTypePicker(false)
          }}
          onClose={() => setPaymentTypePicker(false)}
        />
      )}

      {receiptStatusPicker && (
        <ReceiptStatusPicker
          value={expense.receiptStatus}
          onSelect={(receiptStatus) => {
            update({ receiptStatus })
            setReceiptStatusPicker(false)
          }}
          onClose={() => setReceiptStatusPicker(false)}
        />
      )}
    </>
  )
}