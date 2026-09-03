import React, { useMemo, useState } from 'react'
import { ArrowLeft, Search, Check } from 'lucide-react'

const DIVISIONS = [
  'Benelux',
  'Customer Service',
  'Design',
  'Directors',
  'Equipment',
  'Finance',
  'FIT',
  'Focus International GmbH',
  'Footwear',
  'HR',
  'International',
  'IT',
  'Logistics',
  'Marketing',
  'Marketplace',
  'Merchandising',
  'North',
  'Product',
  'Retail Outlet',
  'Sales - UK',
  'Sourcing and supply chain',
  'South Internet',
  'South Retail',
  'South Wholesale',
]

export default function DivisionPicker({ value, onSelect, onClose }) {
  const [query, setQuery] = useState('')

  const divisions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return DIVISIONS
    }

    return DIVISIONS.filter((division) => (
      division.toLowerCase().includes(normalizedQuery)
    ))
  }, [query])

  return (
    <div className="fullscreen-picker">
      <div className="picker-header">
        <button className="back-btn" onClick={onClose} aria-label="Back">
          <ArrowLeft size={19} />
        </button>
        <div className="topbar-title">Divisions</div>
      </div>

      <div className="picker-search-row">
        <Search size={15} className="picker-search-icon" />
        <input
          className="picker-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search divisions"
          autoFocus
        />
      </div>

      <div className="picker-list">
        {divisions.map((division) => (
          <button
            key={division}
            type="button"
            className="picker-row"
            onClick={() => onSelect(division)}
          >
            <span>{division}</span>
            <span className={`picker-radio ${value === division ? 'checked' : ''}`}>
              {value === division && <Check size={11} color="#fff" />}
            </span>
          </button>
        ))}

        {divisions.length === 0 && (
          <div className="field-hint" style={{ marginTop: 20 }}>
            No divisions match "{query}".
          </div>
        )}
      </div>
    </div>
  )
}