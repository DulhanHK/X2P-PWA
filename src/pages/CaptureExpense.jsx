import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronRight,
  FileText,
  ImagePlus,
  PenLine,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useStore, uid } from '../store/store'
import { compressReceiptImage, scanReceipt, AI_DISCLAIMER } from '../lib/ocr'
import TopBar from '../components/TopBar'
import ExpenseTypePicker from '../components/ExpenseTypePicker'
import { money, currencySymbol, currencyName } from '../lib/format'
import CurrencyPicker from '../components/CurrencyPicker'

export default function CaptureExpense() {
  const { dispatch } = useStore()
  const nav = useNavigate()
  const routeState = useLocation().state

  const cameraInputRef = useRef(null)
  const photoInputRef = useRef(null)
  const documentInputRef = useRef(null)

  const [receipt, setReceipt] = useState(null)
  const [document, setDocument] = useState(null)
  const [manualAttachment, setManualAttachment] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState(null)
  const [extracted, setExtracted] = useState(null)
  const [typePicker, setTypePicker] = useState(false)
  const [currencyPicker, setCurrencyPicker] = useState(false)
  const [errors, setErrors] = useState({})
  const manualAttachmentInputRef = useRef(null)

  useEffect(() => {
    if (routeState?.mode === 'manual') {
      handleManual()
      return
    }

    if (routeState?.file instanceof File) {
      processFile(routeState.file)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (file) {
      processFile(file)
    }
  }

  async function processFile(file) {

    const isImage = file.type.startsWith('image/')
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')

    if (!isImage && !isPdf) {
      setScanError('Choose an image or a PDF document.')
      return
    }

    if (receipt) {
      URL.revokeObjectURL(receipt)
    }

    const ocrFile = isImage ? await compressReceiptImage(file) : file

    setReceipt(isImage ? URL.createObjectURL(ocrFile) : null)
    setDocument(isPdf ? { name: file.name, size: file.size } : null)
    setScanning(true)
    setScanError(null)
    setExtracted(null)

    try {
      const result = await scanReceipt(ocrFile)
      setExtracted(result)
    } catch (error) {
      setScanError(
        "Automatic scanning didn't work this time - you can still fill this in yourself."
      )
      setExtracted({
        merchant: '',
        amount: '',
        currency: 'GBP',
        date: new Date().toISOString().slice(0, 10),
        category: 'Other',
        location: '',
        invoiceNumber: '',
        mocked: false,
        failed: true,
      })
    } finally {
      setScanning(false)
    }
  }

  function handleManualAttachment(event) {
  const file = event.target.files?.[0]

  event.target.value = ''

  if (!file) return

  const isImage = file.type.startsWith('image/')

  setManualAttachment((currentAttachment) => {
    if (currentAttachment?.previewUrl) {
      URL.revokeObjectURL(currentAttachment.previewUrl)
    }

    return {
      name: file.name,
      type: file.type || 'Unknown file type',
      size: file.size,
      previewUrl: isImage ? URL.createObjectURL(file) : null,
    }
  })
}

  function handleManual() {
    if (receipt) {
      URL.revokeObjectURL(receipt)
    }

    setReceipt(null)
    setDocument(null)
    setManualAttachment(null)
    setScanError(null)
    setExtracted({
      merchant: '',
      amount: '',
      currency: 'GBP',
      date: new Date().toISOString().slice(0, 10),
      category: 'Other',
      location: '',
      invoiceNumber: '',
      mocked: false,
      failed: true,
      manual: true,
    })
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
      receiptStatus: receipt || document || manualAttachment ? 'Receipt' : 'No Receipt',
      receiptImage: receipt || manualAttachment?.previewUrl || null,
      receiptDocumentName: document?.name || manualAttachment?.name || '',
      receiptAttachment: manualAttachment,
      brand: '',
      division: '',
      merchantTaxId: '',
      territory: '',
      personalExpense: false,
      source: extracted.manual ? 'manual' : 'expenseit',
      status: 'draft',
      history: [{ status: 'draft', actor: 'You', at: now }],
    }

    dispatch({ type: 'ADD_EXPENSE', expense })
    nav(`/expenses/${expense.id}`, { replace: true })
  }

  const hasAttachment = Boolean(receipt || document)

  return (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFile}
      />

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />

      <input
        ref={documentInputRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={handleFile}
      />

      <input
        ref={manualAttachmentInputRef}
        type="file"
        hidden
        onChange={handleManualAttachment}
      />

      <TopBar
        title="Add expense"
        subtitle="Snap a receipt or enter it yourself"
        onBack={() => nav(-1)}
      />

      <div className="app-scroll">
        <div className="page">
          {!hasAttachment && !extracted && (
            <>
              <div
                className="capture-zone"
                style={{ padding: '48px 16px' }}
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera size={30} color="var(--x2p-green-600)" />
                <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 4 }}>
                  Take a photo of your receipt
                </div>
                <div className="field-hint">
                  Merchant, date, amount and category are extracted automatically using AI
                </div>
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onClick={() => photoInputRef.current?.click()}
              >
                <ImagePlus size={16} />
                Choose from library
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onClick={() => documentInputRef.current?.click()}
              >
                <FileText size={16} />
                Upload PDF document
              </button>

              <button
                type="button"
                className="btn-ghost"
                style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                }}
                onClick={handleManual}
              >
                <PenLine size={16} />
                Enter details manually
              </button>
            </>
          )}

          {receipt && (
            <div className="capture-preview">
              <img src={receipt} alt="Captured receipt" />
              {scanning && <div className="ocr-scanline" />}

              <span className="ocr-tag">
                <CheckCircle2 size={12} />
                {scanning ? 'Reading receipt...' : 'Extraction complete'}
              </span>

              <button
                type="button"
                className="fab secondary"
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  width: 36,
                  height: 36,
                }}
                onClick={() => cameraInputRef.current?.click()}
                aria-label="Retake photo"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          )}

          {document && (
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
                  {document.name}
                </div>
                <div className="field-hint">
                  PDF document selected
                </div>
              </div>

              {scanning && <div className="ocr-scanline" />}

              <span className="ocr-tag">
                <CheckCircle2 size={12} />
                {scanning ? 'Reading document...' : 'Extraction complete'}
              </span>

              <button
                type="button"
                className="fab secondary"
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  width: 36,
                  height: 36,
                }}
                onClick={() => documentInputRef.current?.click()}
                aria-label="Choose another PDF"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          )}

          {extracted && (
            <>
              <div
                className="section-title"
                style={{ marginBottom: 18 }}
              >
                {hasAttachment ? 'Review before saving' : 'Enter expense details'}
              </div>

              {scanError && (
                <div className="ai-disclaimer ai-disclaimer-warn">
                  <AlertTriangle size={14} />
                  <span>{scanError}</span>
                </div>
              )}

              {hasAttachment && !scanError && (
                <div className="ai-disclaimer">
                  <Sparkles size={14} />
                  <span>
                    {AI_DISCLAIMER}
                    {extracted.mocked ? ' (Demo mode - showing sample data.)' : ''}
                  </span>
                </div>
              )}

              <div className="field">
                <label>
                  Invoice Number <span className="req">*</span>
                </label>
                <input
                  className="field-input"
                  value={extracted.invoiceNumber || ''}
                  onChange={(event) => {
                    setExtracted({
                      ...extracted,
                      invoiceNumber: event.target.value,
                    })
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
                <label>
                  Supplier <span className="req">*</span>
                </label>
                <input
                  className="field-input"
                  value={extracted.merchant}
                  onChange={(event) => {
                    setExtracted({ ...extracted, merchant: event.target.value })
                    setErrors((currentErrors) => ({
                      ...currentErrors,
                      merchant: undefined,
                    }))
                  }}
                  placeholder="Enter supplier"
                />
                {errors.merchant && (
                  <div className="field-error">{errors.merchant}</div>
                )}
              </div>

              <div className="field">
                <label>
                  Amount <span className="req">*</span>
                </label>
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
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        amount: undefined,
                      }))
                    }}
                    style={{ flex: 1 }}
                  />
                </div>
                {errors.amount && (
                  <div className="field-error">{errors.amount}</div>
                )}
              </div>

              <div className="field">
                <label>
                  Currency <span className="req">*</span>
                </label>
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
                  <span>
                    {extracted.currency
                      ? currencyName(extracted.currency)
                      : 'Select currency'}
                  </span>
                  <ChevronRight size={15} />
                </button>
                {errors.currency && (
                  <div className="field-error">{errors.currency}</div>
                )}
              </div>

              <div className="field">
                <label>
                  Expense Type <span className="req">*</span>
                </label>
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
                {errors.category && (
                  <div className="field-error">{errors.category}</div>
                )}
              </div>

              <div className="field">
                <label>
                  Date <span className="req">*</span>
                </label>
                <input
                  className="field-input"
                  type="date"
                  value={extracted.date}
                  onChange={(event) => {
                    setExtracted({ ...extracted, date: event.target.value })
                    setErrors((currentErrors) => ({
                      ...currentErrors,
                      date: undefined,
                    }))
                  }}
                />
                {errors.date && (
                  <div className="field-error">{errors.date}</div>
                )}
              </div>

              <div className="field">
                <label>Location</label>
                <input
                  className="field-input"
                  value={extracted.location || ''}
                  onChange={(event) =>
                    setExtracted({
                      ...extracted,
                      location: event.target.value,
                    })
                  }
                  placeholder="Optional"
                />
              </div>

              {extracted.manual && (
                <div className="field">
                  <label>Receipt attachment</label>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                    onClick={() => manualAttachmentInputRef.current?.click()}
                  >
                    <FileText size={16} />
                    {manualAttachment ? 'Replace attachment' : 'Attach receipt'}
                  </button>

                  {manualAttachment && (
                    <div className="field-hint" style={{ overflowWrap: 'anywhere' }}>
                      Attached: {manualAttachment.name}
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: 8 }}
                onClick={saveExpense}
              >
                Save expense · {money(parseFloat(extracted.amount) || 0, extracted.currency)}
              </button>

              <div
                className="field-hint"
                style={{ textAlign: 'center', marginTop: 8 }}
              >
                You can add business purpose, payment type and other details next,
                or submit it as a claim.
              </div>
            </>
          )}
        </div>
      </div>

      {typePicker && (
        <ExpenseTypePicker
          value={extracted.category}
          onSelect={(category) => {
            setExtracted({ ...extracted, category })
            setErrors((currentErrors) => ({
              ...currentErrors,
              category: undefined,
            }))
            setTypePicker(false)
          }}
          onClose={() => setTypePicker(false)}
        />
      )}

      {currencyPicker && (
        <CurrencyPicker
          value={extracted.currency}
          onSelect={(currency) => {
            setExtracted({ ...extracted, currency })
            setErrors((currentErrors) => ({
              ...currentErrors,
              currency: undefined,
            }))
            setCurrencyPicker(false)
          }}
          onClose={() => setCurrencyPicker(false)}
        />
      )}
    </>
  )
}