import React, { useMemo, useState } from 'react'
import { ArrowLeft, Search, Check } from 'lucide-react'

const TERRITORIES = [
  'Afghanistan',
  'Åland Islands',
  'Albania',
  'Algeria',
  'American Samoa',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antarctica',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Aruba',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas (the)',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bermuda',
  'Bhutan',
  'Bolivia (Plurinational State of)',
  'Bonaire, Sint Eustatius and Saba',
  'Bosnia and Herzegovina',
  'Botswana',
  'Bouvet Island',
  'Brazil',
  'British Indian Ocean Territory (the)',
  'Brunei Darussalam',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cayman Islands (the)',
  'Central African Republic (the)',
  'Chad',
  'Chile',
  'China',
  'Christmas Island',
  'Cocos (Keeling) Islands (the)',
  'Colombia',
  'Comoros (the)',
  'Congo (the Democratic Republic of the)',
  'Congo (the)',
  'Cook Islands (the)',
  'Costa Rica',
  "Côte d'lvoire",
  'Croatia',
  'Cuba',
  'Curaçao',
  'Cyprus',
  'Czechia',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic (the)',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Falkland Islands (the) [Malvinas]',
  'Faroe Islands (the)',
  'Fiji',
  'Finland',
  'France',
  'French Guiana',
  'French Polynesia',
  'French Southern Territories (the)',
  'Gabon',
  'Gambia (the)',
  'Georgia',
  'Germany',
  'Ghana',
  'Gibraltar',
  'Greece',
  'Greenland',
  'Grenada',
  'Guadeloupe',
  'Guam',
  'Guatemala',
  'Guernsey',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Heard Island and McDonald Islands',
  'Holy See (the)',
  'Honduras',
]

export default function TerritoryPicker({ value, onSelect, onClose }) {
  const [query, setQuery] = useState('')

  const territories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return TERRITORIES
    }

    return TERRITORIES.filter((territory) => (
      territory.toLowerCase().includes(normalizedQuery)
    ))
  }, [query])

  return (
    <div className="fullscreen-picker">
      <div className="picker-header">
        <button className="back-btn" onClick={onClose} aria-label="Back">
          <ArrowLeft size={19} />
        </button>
        <div className="topbar-title">Territories</div>
      </div>

      <div className="picker-search-row">
        <Search size={15} className="picker-search-icon" />
        <input
          className="picker-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search territories"
          autoFocus
        />
      </div>

      <div className="picker-list">
        {territories.map((territory) => (
          <button
            key={territory}
            type="button"
            className="picker-row"
            onClick={() => onSelect(territory)}
          >
            <span>{territory}</span>
            <span className={`picker-radio ${value === territory ? 'checked' : ''}`}>
              {value === territory && <Check size={11} color="#fff" />}
            </span>
          </button>
        ))}

        {territories.length === 0 && (
          <div className="field-hint" style={{ marginTop: 20 }}>
            No territories match "{query}".
          </div>
        )}
      </div>
    </div>
  )
}