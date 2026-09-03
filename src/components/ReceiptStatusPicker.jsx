import React, { useMemo, useState } from 'react'
import { ArrowLeft, Search, Check } from 'lucide-react'

const RECEIPT_STATUSES = [
  'No Receipt',
  'Receipt',
  'Tax Receipt',
]

export default function ReceiptStatusPicker({ value, onSelect, onClose }) {
  const [query, setQuery] = useState('')

  const receiptStatuses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return RECEIPT_STATUSES
    }

    return RECEIPT_STATUSES.filter((receiptStatus) => (
      receiptStatus.toLowerCase().includes(normalizedQuery)
    ))
  }, [query])

  return (
    <div className="fullscreen-picker">
      <div className="picker-header">
        <button className="back-btn" onClick={onClose} aria-label="Back">
          <ArrowLeft size={19} />
        </button>
        <div className="topbar-title">Receipt Status</div>
      </div>

      <div className="picker-search-row">
        <Search size={15} className="picker-search-icon" />
        <input
          className="picker-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search receipt statuses"
          autoFocus
        />
      </div>

      <div className="picker-list">
        {receiptStatuses.map((receiptStatus) => (
          <button
            key={receiptStatus}
            type="button"
            className="picker-row"
            onClick={() => onSelect(receiptStatus)}
          >
            <span>{receiptStatus}</span>
            <span className={`picker-radio ${value === receiptStatus ? 'checked' : ''}`}>
              {value === receiptStatus && <Check size={11} color="#fff" />}
            </span>
          </button>
        ))}

        {receiptStatuses.length === 0 && (
          <div className="field-hint" style={{ marginTop: 20 }}>
            No receipt statuses match "{query}".
          </div>
        )}
      </div>
    </div>
  )
}