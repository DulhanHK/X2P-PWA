import React, { useRef } from 'react'
import { Check } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { money, timeAgo, initials, STATUS_META } from '../lib/format'

export default function ExpenseRow({ expense, onClick, selectable, selected, onToggleSelect, onLongPress }) {
  const meta = STATUS_META[expense.status]
  const pressTimer = useRef(null)
  const longPressed = useRef(false)

  function startPress() {
    if (!onLongPress) return
    longPressed.current = false
    pressTimer.current = setTimeout(() => {
      longPressed.current = true
      onLongPress()
    }, 450)
  }

  function cancelPress() {
    clearTimeout(pressTimer.current)
  }

  function handleClick() {
    // suppress the click that fires right after a long-press fires
    if (longPressed.current) {
      longPressed.current = false
      return
    }
    if (selectable) onToggleSelect()
    else onClick()
  }

  return (
    <button
      className="list-row"
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
    >
      {selectable ? (
        <span className={`select-dot ${selected ? 'checked' : ''}`}>{selected && <Check size={13} />}</span>
      ) : (
        <div className="merchant-badge">{initials(expense.merchant)}</div>
      )}
      <div className="card-body">
        <div className="card-title-row">
          <span className="card-merchant">{expense.merchant}</span>
          <span className="card-amount">{money(expense.amount, expense.currency)}</span>
        </div>
        <div className="card-meta">{expense.category} · {timeAgo(expense.date)}</div>
        {meta && <span className={`status-chip ${meta.className}`}>{meta.label}</span>}
      </div>
      {!selectable && <ChevronRight size={16} className="list-row-chevron" />}
    </button>
  )
}