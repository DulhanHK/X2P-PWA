import React, { useMemo, useState } from 'react'
import { ArrowLeft, Search, Check } from 'lucide-react'

const PAYMENT_TYPES = [
  'Cash',
  'Company Paid',
]

export default function PaymentTypePicker({ value, onSelect, onClose }) {
  const [query, setQuery] = useState('')

  const paymentTypes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return PAYMENT_TYPES
    }

    return PAYMENT_TYPES.filter((paymentType) => (
      paymentType.toLowerCase().includes(normalizedQuery)
    ))
  }, [query])

  return (
    <div className="fullscreen-picker">
      <div className="picker-header">
        <button className="back-btn" onClick={onClose} aria-label="Back">
          <ArrowLeft size={19} />
        </button>
        <div className="topbar-title">Payment Type</div>
      </div>

      <div className="picker-search-row">
        <Search size={15} className="picker-search-icon" />
        <input
          className="picker-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search payment types"
          autoFocus
        />
      </div>

      <div className="picker-list">
        {paymentTypes.map((paymentType) => (
          <button
            key={paymentType}
            type="button"
            className="picker-row"
            onClick={() => onSelect(paymentType)}
          >
            <span>{paymentType}</span>
            <span className={`picker-radio ${value === paymentType ? 'checked' : ''}`}>
              {value === paymentType && <Check size={11} color="#fff" />}
            </span>
          </button>
        ))}

        {paymentTypes.length === 0 && (
          <div className="field-hint" style={{ marginTop: 20 }}>
            No payment types match "{query}".
          </div>
        )}
      </div>
    </div>
  )
}