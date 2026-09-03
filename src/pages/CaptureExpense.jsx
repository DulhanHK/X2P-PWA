import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Camera, CheckCircle2, RefreshCw, ImagePlus, Sparkles, AlertTriangle, PenLine, ChevronRight } from 'lucide-react'
import { useStore, uid } from '../store/store'
import { scanReceipt, AI_DISCLAIMER } from '../lib/ocr'
import TopBar from '../components/TopBar'
import ExpenseTypePicker from '../components/ExpenseTypePicker'
import { money, currencySymbol, currencyName } from '../lib/format'
import CurrencyPicker from '../components/CurrencyPicker'

export default function CaptureExpense() {
  const { dispatch } = useStore()
  const nav = useNavigate()
  const routeState = useLocation().state
  const fileRef = useRef(null)
  const [receipt, setReceipt] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState(null)
  const [extracted, setExtracted] = useState(null)
  const [typePicker, setTypePicker] = useState(false)
  const [currencyPicker, setCurrencyPicker] = useState(false)
  const [errors, setErrors] = useState({})

  // Arriving from the "+" action sheet on Expenses jumps straight into the
  // requested mode instead of showing the initial choice screen.
  useEffect(() => {
    if (routeState?.mode === 'manual') handleManual()
    else if (routeState?.mode === 'camera' || routeState?.mode === 'library' || routeState?.mode === 'file') fileRef.current?.click()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type.startsWith('image/')) setReceipt(URL.createObjectURL(file))
    setScanning(true)
    setScanError(null)
    setExtracted(null)
    try {
      const result = await scanReceipt(file)
      setExtracted(result)
    } catch (err) {
      // AI extraction failed (backend down, network, etc.) — fall back to a
      // blank form so the user can still enter the expense manually.
      setScanError("Automatic scanning didn't work this time — you can still fill this in yourself.")
      setExtracted({ merchant: '', amount: '', currency: 'GBP', date: new Date().toISOString().slice(0, 10), category: 'Other', mocked: false, failed: true })
    } finally {
      setScanning(false)
    }
  }

  function handleManual() {
    setReceipt(null)
    setScanError(null)
    setExtracted({ merchant: '', amount: '', currency: 'GBP', date: new Date().toISOString().slice(0, 10), category: 'Other', location: '', mocked: false, failed: true, manual: true })
  }

  function validateExpense() {
  const nextErrors = {}

  if (!extracted.merchant?.trim()) {
    nextErrors.merchant = 'Enter the supplier.'
  }

  if (!Number(extracted.amount) || Number(extracted.amount) <= 0) {
    nextErrors.amount = 'Enter an amount greater than zero.'
  }

  if (!extracted.currency?.trim()) {
    nextErrors.currency = 'Select a currency.'
  }

  if (!extracted.category?.trim()) {
    nextErrors.category = 'Select an expense type.'
  }

  if (!extracted.date?.trim()) {
    nextErrors.date = 'Enter the transaction date.'
  }

  if (!extracted.invoiceNumber?.trim()) {
  nextErrors.invoiceNumber = 'Enter the invoice number.'
}

  setErrors(nextErrors)
  return Object.keys(nextErrors).length === 0
}

  function saveExpense() {
    if (!validateExpense()) {
      return
    }
    const now = new Date().toISOString()
    const expense = {
      id: uid('exp'),
      invoiceNumber: extracted.invoiceNumber || '',
      merchant: extracted.merchant,
      date: extracted.date,
      amount: parseFloat(extracted.amount) || 0,
      currency: extracted.currency,
      category: extracted.category,
      location: extracted.location || '',
      paymentType: 'Company Paid',
      businessPurpose: '',
      notes: '',
      country: extracted.country || '',
      exchangeRate: extracted.currency === 'GBP' ? 1 : '',
      receiptStatus: receipt ? 'Receipt' : 'No Receipt',
      brand: '',
      division: '',
      merchantTaxId: '',
      territory: '',
      personalExpense: false,
      receiptImage: receipt,
      source: extracted.manual ? 'manual' : 'expenseit',
      status: 'draft',
      history: [{ status: 'draft', actor: 'You', at: now }],
    }
    dispatch({ type: 'ADD_EXPENSE', expense })
    nav(`/expenses/${expense.id}`, { replace: true })
  }

  return (
    <>
      <TopBar title="Add expense" subtitle="Snap a receipt or enter it yourself" onBack={() => nav(-1)} />
      <div className="app-scroll">
        <div className="page">
          {!receipt && !extracted && (
            <>
              <div className="capture-zone" style={{ padding: '48px 16px' }} onClick={() => fileRef.current?.click()}>
                <Camera size={30} color="var(--x2p-green-600)" />
                <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 4 }}>Take a photo of your receipt</div>
                <div className="field-hint">Merchant, date, amount and category are extracted automatically using AI</div>
              </div>
              <button className="btn-secondary" style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => fileRef.current?.click()}>
                <ImagePlus size={16} /> Choose from library
              </button>
              <button className="btn-ghost" style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }} onClick={handleManual}>
                <PenLine size={16} /> Enter details manually
              </button>
              <input ref={fileRef} type="file" accept="image/*,.pdf" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
            </>
          )}

          {receipt && (
            <div className="capture-preview">
              <img src={receipt} alt="Captured receipt" />
              {scanning && <div className="ocr-scanline" />}
              <span className="ocr-tag"><CheckCircle2 size={12} /> {scanning ? 'Reading receipt…' : 'Extraction complete'}</span>
              <button className="fab secondary" style={{ position: 'absolute', bottom: 8, right: 8, width: 36, height: 36 }} onClick={() => fileRef.current?.click()} aria-label="Retake photo">
                <RefreshCw size={15} />
              </button>
              <input ref={fileRef} type="file" accept="image/*,.pdf" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
            </div>
          )}

          {extracted && (
            <>
              <div className="section-title">{receipt ? 'Review before saving' : 'Enter expense details'}</div>

              {scanError && (
                <div className="ai-disclaimer ai-disclaimer-warn">
                  <AlertTriangle size={14} />
                  <span>{scanError}</span>
                </div>
              )}
              {receipt && !scanError && (
                <div className="ai-disclaimer">
                  <Sparkles size={14} />
                  <span>{AI_DISCLAIMER}{extracted.mocked ? ' (Demo mode — showing sample data.)' : ''}</span>
                </div>
              )}

              <div className="field">
                <label>Invoice Number <span className="req">*</span></label>
                <input
                  className="field-input"
                  value={extracted.invoiceNumber || ''}
                  onChange={(event) => {
                    setExtracted({ ...extracted, invoiceNumber: event.target.value })
                    setErrors((currentErrors) => ({
                      ...currentErrors,
                      invoiceNumber: undefined,
                    }))
                  }}
                  placeholder="Enter invoice number"
                />
                {errors.invoiceNumber && (
                  <div className="field-error">{errors.invoiceNumber}</div>
                )}
              </div>

              <div className="field">
                <label>Supplier <span className="req">*</span></label>
                <input
                  className="field-input"
                  value={extracted.merchant}
                  onChange={(event) => {
                    setExtracted({ ...extracted, merchant: event.target.value })
                    setErrors((currentErrors) => ({ ...currentErrors, merchant: undefined }))
                  }}
                  placeholder="Enter supplier"
                />
                {errors.merchant && <div className="field-error">{errors.merchant}</div>}
              </div>
              <div className="field">
                <label>Amount <span className="req">*</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, opacity: 0.7 }}>
                    {currencySymbol(extracted.currency)}
                  </span>
                  <input
                    className="field-input"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={extracted.amount}
                    onChange={(event) => {
                      setExtracted({ ...extracted, amount: event.target.value })
                      setErrors((currentErrors) => ({ ...currentErrors, amount: undefined }))
                    }}
                    style={{ flex: 1 }}
                  />
                </div>
                {errors.amount && <div className="field-error">{errors.amount}</div>}
              </div>

              <div className="field">
                <label>Currency <span className="req">*</span></label>
                <button
                  type="button"
                  className="field-input"
                  onClick={() => setCurrencyPicker(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span>{extracted.currency ? currencyName(extracted.currency) : 'Select currency'}</span>
                  <ChevronRight size={15} />
                </button>
                {errors.currency && <div className="field-error">{errors.currency}</div>}
              </div>
              <div className="field">
                <label>Expense Type <span className="req">*</span></label>
                <button
                  type="button"
                  className="field-input"
                  onClick={() => setTypePicker(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span>{extracted.category || 'Select expense type'}</span>
                  <ChevronRight size={15} />
                </button>
                {errors.category && <div className="field-error">{errors.category}</div>}
              </div>
              <div className="field">
                <label>Date<span className="req">*</span></label>
                <input
                  className="field-input"
                  type="date"
                  value={extracted.date}
                  onChange={(event) => {
                    setExtracted({ ...extracted, date: event.target.value })
                    setErrors((currentErrors) => ({ ...currentErrors, date: undefined }))
                  }}
                />
                {errors.date && <div className="field-error">{errors.date}</div>}
              </div>
              <div className="field">
                <label>Location</label>
                <input className="field-input" value={extracted.location || ''} onChange={(e) => setExtracted({ ...extracted, location: e.target.value })} placeholder="Optional" />
              </div>

              <button className="btn-primary" style={{ marginTop: 8 }} onClick={saveExpense}>
                Save expense · {money(parseFloat(extracted.amount) || 0, extracted.currency)}
              </button>
              <div className="field-hint" style={{ textAlign: 'center', marginTop: 8 }}>
                You can add business purpose, payment type and other details next, or submit it as a claim.
              </div>
            </>
          )}
        </div>
      </div>

      {typePicker && (
        <ExpenseTypePicker
          value={extracted.category}
          onSelect={(cat) => { setExtracted({ ...extracted, category: cat }); setTypePicker(false) }}
          onClose={() => setTypePicker(false)}
        />
      )}

      {currencyPicker && (
        <CurrencyPicker
          value={extracted.currency}
          onSelect={(currency) => {
            setExtracted({ ...extracted, currency })
            setErrors((currentErrors) => ({ ...currentErrors, currency: undefined }))
            setCurrencyPicker(false)
          }}
          onClose={() => setCurrencyPicker(false)}
        />
      )}
    </>
  )
}

