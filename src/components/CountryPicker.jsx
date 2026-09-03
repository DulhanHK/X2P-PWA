import React, { useMemo, useState } from 'react'
import { ArrowLeft, Search, Check } from 'lucide-react'

const COUNTRIES = [
  'AFGHANISTAN',
  'ÅLAND ISLANDS',
  'ALBANIA',
  'ALGERIA',
  'AMERICAN SAMOA',
  'ANDORRA',
  'ANGOLA',
  'ANGUILLA',
  'ANTARCTICA',
  'ANTIGUA AND BARBUDA',
  'ARGENTINA',
  'ARMENIA',
  'ARUBA',
  'AUSTRALIA',
  'AUSTRIA',
  'AZERBAIJAN',
  'BAHAMAS',
  'BAHRAIN',
  'BANGLADESH',
  'BARBADOS',
  'BELARUS',
  'BELGIUM',
  'BELIZE',
  'BENIN',
  'BERMUDA',
  'BHUTAN',
  'BOLIVIA',
  'BONAIRE, SAINT EUSTATIUS AND SABA',
  'BOSNIA AND HERZEGOVINA',
  'BOTSWANA',
  'BOUVET ISLAND',
  'BRAZIL',
  'BRITISH INDIAN OCEAN TERRITORY',
  'BRUNEI DARUSSALAM',
  'BULGARIA',
  'BURKINA FASO',
  'BURUNDI',
  'CAMBODIA',
  'CAMEROON',
  'CANADA',
  'CAPE VERDE',
  'CAYMAN ISLANDS',
  'CENTRAL AFRICAN REPUBLIC',
  'CHAD',
  'CHILE',
  'CHINA',
  'CHRISTMAS ISLAND',
  'COCOS (KEELING) ISLANDS',
  'COLOMBIA',
  'COMOROS',
  'CONGO, Democratic Republic of',
  "CONGO, People's Republic of",
  'COOK ISLANDS',
  'COSTA RICA',
  "COTE D'IVOIRE",
  'CROATIA',
  'CUBA',
  'CURAÇAO',
  'CYPRUS',
  'CZECH REPUBLIC',
  'DENMARK',
  'DJIBOUTI',
  'DOMINICA',
  'DOMINICAN REPUBLIC',
  'ECUADOR',
  'EGYPT',
  'EL SALVADOR',
  'EQUATORIAL GUINEA',
  'ERITREA',
  'ESTONIA',
  'ESWATINI',
  'ETHIOPIA',
  'FAEROE ISLANDS',
  'FALKLAND ISLANDS (MALVINAS)',
  'FIJI',
  'FINLAND',
  'FRANCE',
  'FRENCH GUIANA',
  'FRENCH POLYNESIA',
  'FRENCH SOUTHERN TERRITORIES',
  'GABON',
  'GAMBIA',
  'GEORGIA',
  'GERMANY',
  'GHANA',
  'GIBRALTAR',
  'GREECE',
  'GREENLAND',
  'GRENADA',
  'GUADELOUPE',
  'GUAM',
  'GUATEMALA',
  'GUERNSEY',
  'GUINEA',
  'GUINEA-BISSAU',
  'GUYANA',
  'HAITI',
  'HEARD AND MC DONALD ISLANDS',
  'HONDURAS',
  'HONG KONG',
  'HUNGARY',
  'ICELAND',
  'INDIA',
  'INDONESIA',
  'IRAN (ISLAMIC REPUBLIC OF)',
  'IRAQ',
  'IRELAND',
  'ISLE OF MAN',
  'ISRAEL',
  'ITALY',
  'JAMAICA',
  'JAPAN',
  'JERSEY',
  'JORDAN',
  'KAZAKHSTAN',
  'KENYA',
  'KIRIBATI',
  "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF",
  'KOREA, REPUBLIC OF',
  'KUWAIT',
  'KYRGYZSTAN',
  "LAO PEOPLE'S DEMOCRATIC REPUBLIC",
  'LATVIA',
  'LEBANON',
  'LESOTHO',
  'LIBERIA',
  'LIBYA',
  'LIECHTENSTEIN',
  'LITHUANIA',
  'LUXEMBOURG',
  'MACAO',
  'MADAGASCAR',
  'MALAWI',
  'MALAYSIA',
  'MALDIVES',
  'MALI',
  'MALTA',
  'MARSHALL ISLANDS',
  'MARTINIQUE',
  'MAURITANIA',
  'MAURITIUS',
  'MAYOTTE',
  'MEXICO',
  'MICRONESIA, FEDERATED STATES OF',
  'MOLDOVA, REPUBLIC OF',
  'MONACO',
  'MONGOLIA',
  'MONTENEGRO',
  'MONTSERRAT',
  'MOROCCO',
  'MOZAMBIQUE',
  'MYANMAR',
  'NAMIBIA',
  'NEPAL',
  'NETHERLANDS',
  'NEW CALEDONIA',
  'NEW ZEALAND',
  'NICARAGUA',
  'NIGER',
  'NIGERIA',
  'NIUE',
  'NORFOLK ISLAND',
  'NORTH MACEDONIA',
  'NORTHERN MARIANA ISLANDS',
  'NORWAY',
  'OMAN',
  'PAKISTAN',
  'PALAU',
  'PALESTINE',
  'PANAMA',
  'PAPUA NEW GUINEA',
  'PARAGUAY',
  'PERU',
  'PHILIPPINES',
  'PITCAIRN',
  'POLAND',
  'PORTUGAL',
  'PUERTO RICO',
  'QATAR',
  'Republic of Naoero',
  'REUNION',
  'ROMANIA',
  'RUSSIAN FEDERATION',
  'RWANDA',
  'SAINT BARTHÉLEMY',
  'SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA',
  'SAINT KITTS AND NEVIS',
  'SAINT LUCIA',
  'Saint Martin',
  'SAINT VINCENT AND THE GRENADINES',
  'SAMOA',
  'SAN MARINO',
  'SAO TOME AND PRINCIPE',
  'SAUDI ARABIA',
  'SENEGAL',
  'SERBIA',
  'SEYCHELLES',
  'SIERRA LEONE',
  'SINGAPORE',
  'SINT MAARTEN (DUTCH PART)',
  'SLOVAKIA (Slovak Republic)',
  'SLOVENIA',
  'SOLOMON ISLANDS',
  'SOMALIA',
  'SOUTH AFRICA',
  'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS',
  'SOUTH SUDAN',
  'SPAIN',
  'SRI LANKA',
  'ST. PIERRE AND MIQUELON',
  'SUDAN',
  'SURINAME',
  'SVALBARD AND JAN MAYEN ISLANDS',
  'SWEDEN',
  'SWITZERLAND',
  'SYRIAN ARAB REPUBLIC',
  'TAIWAN',
  'TAJIKISTAN',
  'TANZANIA, UNITED REPUBLIC OF',
  'THAILAND',
  'TIMOR-LESTE',
  'TOGO',
  'TOKELAU',
  'TONGA',
  'TRINIDAD AND TOBAGO',
  'TUNISIA',
  'TÜRKIYE',
  'TURKMENISTAN',
  'TURKS AND CAICOS ISLANDS',
  'TUVALU',
  'UGANDA',
  'UKRAINE',
  'UNITED ARAB EMIRATES',
  'UNITED KINGDOM',
  'UNITED STATES',
  'UNITED STATES MINOR OUTLYING ISLANDS',
  'URUGUAY',
  'UZBEKISTAN',
  'VANUATU',
  'VATICAN CITY STATE (HOLY SEE)',
  'VENEZUELA',
  'VIET NAM',
  'VIRGIN ISLANDS (BRITISH)',
  'VIRGIN ISLANDS (U.S.)',
  'WALLIS AND FUTUNA ISLANDS',
  'WESTERN SAHARA',
  'YEMEN',
  'ZAMBIA',
  'ZIMBABWE',
]

export default function CountryPicker({ value, onSelect, onClose }) {
  const [query, setQuery] = useState('')

  const countries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return COUNTRIES
    }

    return COUNTRIES.filter((country) => (
      country.toLowerCase().includes(normalizedQuery)
    ))
  }, [query])

  return (
    <div className="fullscreen-picker">
      <div className="picker-header">
        <button className="back-btn" onClick={onClose} aria-label="Back">
          <ArrowLeft size={19} />
        </button>
        <div className="topbar-title">Countries</div>
      </div>

      <div className="picker-search-row">
        <Search size={15} className="picker-search-icon" />
        <input
          className="picker-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search countries"
          autoFocus
        />
      </div>

      <div className="picker-list">
        {countries.map((country) => (
          <button
            key={country}
            type="button"
            className="picker-row"
            onClick={() => onSelect(country)}
          >
            <span>{country}</span>

            <span className={`picker-radio ${value === country ? 'checked' : ''}`}>
              {value === country && <Check size={11} color="#fff" />}
            </span>
          </button>
        ))}

        {countries.length === 0 && (
          <div className="field-hint" style={{ marginTop: 20 }}>
            No countries match "{query}".
          </div>
        )}
      </div>
    </div>
  )
}