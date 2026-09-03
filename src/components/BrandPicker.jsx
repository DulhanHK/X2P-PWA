import React, { useMemo, useState } from 'react'
import { ArrowLeft, Search, Check } from 'lucide-react'

const BRANDS = [
  'American Freshman - Head Office',
  'Avirex - Head Office',
  'Avx - Head Office',
  'Bear - Head Office',
  'Carbrini - Head Office',
  'Certified - Head Office',
  'Component - Head Office',
  'Danskin - Head Office',
  'Diadora - Head Office',
  'Duffer - Head Office',
  'Ecko - Head Office',
  'Ellesse - Head Office',
  'Farah - Head Office',
  'Fenchurch - Head Office',
  'Fila - Head Office',
  'Fly 53 - Head Office',
  'Gio Goi - Head Office',
  'Henleys - Head Office',
  'Hymn - Head Office',
  'McKenzie - Head Office',
  'Miss Kick',
  'Nautica - Head Office',
  'Nautica Competition - Head Office',
  'Nickelson - Head Office',
  'Non Merchandise - Head Office',
  'OEX - Head Office',
  'Own Brand - Head Office',
  'Patrick - Head Office',
  'Penn - Head Office',
  'Peter Werth - Head Office',
  'Private Label - Fashion - Head Office',
  'Reebok - Head Office',
  'Sergio Tacchini - Head Office',
  'Sonneti - Head Office',
  'Starter - Head Office',
  'Unsung Hero - Head Office',
  'Valsport - Head Office',
  'Voi - Head Office',
  'Yogi - Head Office',
  'Zoo York - Head Office',
]

export default function BrandPicker({ value, onSelect, onClose }) {
  const [query, setQuery] = useState('')

  const brands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return BRANDS
    }

    return BRANDS.filter((brand) => (
      brand.toLowerCase().includes(normalizedQuery)
    ))
  }, [query])

  return (
    <div className="fullscreen-picker">
      <div className="picker-header">
        <button className="back-btn" onClick={onClose} aria-label="Back">
          <ArrowLeft size={19} />
        </button>
        <div className="topbar-title">Brands</div>
      </div>

      <div className="picker-search-row">
        <Search size={15} className="picker-search-icon" />
        <input
          className="picker-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search brands"
          autoFocus
        />
      </div>

      <div className="picker-list">
        {brands.map((brand) => (
          <button
            key={brand}
            type="button"
            className="picker-row"
            onClick={() => onSelect(brand)}
          >
            <span>{brand}</span>
            <span className={`picker-radio ${value === brand ? 'checked' : ''}`}>
              {value === brand && <Check size={11} color="#fff" />}
            </span>
          </button>
        ))}

        {brands.length === 0 && (
          <div className="field-hint" style={{ marginTop: 20 }}>
            No brands match "{query}".
          </div>
        )}
      </div>
    </div>
  )
}