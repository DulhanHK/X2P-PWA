import React, { useMemo, useState } from 'react'
import { ArrowLeft, Search, Check } from 'lucide-react'
import { CATEGORY_GROUPS } from '../store/store'

export default function ExpenseTypePicker({ value, onSelect, onClose }) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CATEGORY_GROUPS
      .map((g, i) => ({ ...g, number: String(i + 1).padStart(2, '0') }))
      .map((g) => ({ ...g, types: q ? g.types.filter((t) => t.toLowerCase().includes(q)) : g.types }))
      .filter((g) => g.types.length > 0)
  }, [query])

  return (
    <div className="fullscreen-picker">
      <div className="picker-header">
        <button className="back-btn" onClick={onClose} aria-label="Back"><ArrowLeft size={19} /></button>
        <div className="topbar-title">Expense Types</div>
      </div>
      <div className="picker-search-row">
        <Search size={15} className="picker-search-icon" />
        <input
          className="picker-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search expense types"
          autoFocus
        />
      </div>
      <div className="picker-list">
        {groups.map((g) => (
          <div key={g.group}>
            <div className="picker-group-label">{g.number}. {g.group}</div>
            {g.types.map((t) => (
              <button key={t} className="picker-row" onClick={() => onSelect(t)}>
                <span>{t}</span>
                <span className={`picker-radio ${value === t ? 'checked' : ''}`}>{value === t && <Check size={11} color="#fff" />}</span>
              </button>
            ))}
          </div>
        ))}
        {groups.length === 0 && <div className="field-hint" style={{ marginTop: 20 }}>No expense types match "{query}".</div>}
      </div>
    </div>
  )
}
