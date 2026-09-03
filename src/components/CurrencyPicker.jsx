import React, { useMemo, useState } from 'react'
import { ArrowLeft, Search, Check } from 'lucide-react'

const CURRENCIES = [
  { code: 'AED', label: 'United Arab Emirates Dirham' },
  { code: 'AFN', label: 'Afghan Afghani' },
  { code: 'ALL', label: 'Albanian Lek' },
  { code: 'AMD', label: 'Armenian Dram' },
  { code: 'ANG', label: 'Netherlands Antillean Gulden (-2025)' },
  { code: 'AOA', label: 'Angolan Kwanza' },
  { code: 'ARS', label: 'Argentine Peso' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'AWG', label: 'Aruban Florin' },
  { code: 'AZN', label: 'Azerbaijani Manat' },
  { code: 'BAM', label: 'Bosnia and Herzegovina Convertible Mark' },
  { code: 'BBD', label: 'Barbadian Dollar' },
  { code: 'BDT', label: 'Bangladeshi Taka' },
  { code: 'BGN', label: 'Bulgarian Lev' },
  { code: 'BHD', label: 'Bahraini Dinar' },
  { code: 'BIF', label: 'Burundian Franc' },
  { code: 'BMD', label: 'Bermudian Dollar' },
  { code: 'BND', label: 'Brunei Dollar' },
  { code: 'BOB', label: 'Bolivian Boliviano' },
  { code: 'BRL', label: 'Brazilian Real' },
  { code: 'BSD', label: 'Bahamian Dollar' },
  { code: 'BTN', label: 'Bhutanese Ngultrum' },
  { code: 'BWP', label: 'Botswana Pula' },
  { code: 'BYN', label: 'Belarusian Ruble' },
  { code: 'BYR', label: 'Belarusian Ruble (2000-2016)' },
  { code: 'BZD', label: 'Belize Dollar' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'CDF', label: 'Congolese Franc' },
  { code: 'CHF', label: 'Swiss Franc' },
  { code: 'CLP', label: 'Chilean Peso' },
  { code: 'CNY', label: 'Chinese Renminbi Yuan' },
  { code: 'COP', label: 'Colombian Peso' },
  { code: 'CRC', label: 'Costa Rican Colón' },
  { code: 'CUC', label: 'Cuban Convertible Peso' },
  { code: 'CUP', label: 'Cuban Peso' },
  { code: 'CVE', label: 'Cape Verdean Escudo' },
  { code: 'CZK', label: 'Czech Koruna' },
  { code: 'DJF', label: 'Djiboutian Franc' },
  { code: 'DKK', label: 'Danish Krone' },
  { code: 'DOP', label: 'Dominican Peso' },
  { code: 'DZD', label: 'Algerian Dinar' },
  { code: 'EGP', label: 'Egyptian Pound' },
  { code: 'ERN', label: 'Eritrean Nakfa' },
  { code: 'ETB', label: 'Ethiopian Birr' },
  { code: 'EUR', label: 'Euro' },
  { code: 'FJD', label: 'Fijian Dollar' },
  { code: 'FKP', label: 'Falkland Pound' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'GEL', label: 'Georgian Lari' },
  { code: 'GHS', label: 'Ghanaian Cedi' },
  { code: 'GIP', label: 'Gibraltar Pound' },
  { code: 'GMD', label: 'Gambian Dalasi' },
  { code: 'GNF', label: 'Guinean Franc' },
  { code: 'GTQ', label: 'Guatemalan Quetzal' },
  { code: 'GYD', label: 'Guyanese Dollar' },
  { code: 'HKD', label: 'Hong Kong Dollar' },
  { code: 'HNL', label: 'Honduran Lempira' },
  { code: 'HRK', label: 'Croatian Kuna' },
  { code: 'HTG', label: 'Haitian Gourde' },
  { code: 'HUF', label: 'Hungarian Forint' },
  { code: 'IDR', label: 'Indonesian Rupiah' },
  { code: 'ILS', label: 'Israeli New Sheqel' },
  { code: 'INR', label: 'Indian Rupee' },
  { code: 'IQD', label: 'Iraqi Dinar' },
  { code: 'IRR', label: 'Iranian Rial' },
  { code: 'ISK', label: 'Icelandic Króna' },
  { code: 'JMD', label: 'Jamaican Dollar' },
  { code: 'JOD', label: 'Jordanian Dinar' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'KES', label: 'Kenyan Shilling' },
  { code: 'KGS', label: 'Kyrgyzstani Som' },
  { code: 'KHR', label: 'Cambodian Riel' },
  { code: 'KMF', label: 'Comorian Franc' },
  { code: 'KPW', label: 'North Korean Won' },
  { code: 'KRW', label: 'South Korean Won' },
  { code: 'KWD', label: 'Kuwaiti Dinar' },
  { code: 'KYD', label: 'Cayman Islands Dollar' },
  { code: 'KZT', label: 'Kazakhstani Tenge' },
  { code: 'LAK', label: 'Lao Kip' },
  { code: 'LBP', label: 'Lebanese Pound' },
  { code: 'LKR', label: 'Sri Lankan Rupee' },
  { code: 'LRD', label: 'Liberian Dollar' },
  { code: 'LSL', label: 'Lesotho Loti' },
  { code: 'LTL', label: 'Lithuanian Litas' },
  { code: 'LVL', label: 'Latvian Lats' },
  { code: 'LYD', label: 'Libyan Dinar' },
  { code: 'MAD', label: 'Moroccan Dirham' },
  { code: 'MDL', label: 'Moldovan Leu' },
  { code: 'MGA', label: 'Malagasy Ariary' },
  { code: 'MKD', label: 'Macedonian Denar' },
  { code: 'MMK', label: 'Myanmar Kyat' },
  { code: 'MNT', label: 'Mongolian Tögrög' },
  { code: 'MOP', label: 'Macanese Pataca' },
  { code: 'MRU', label: 'Mauritanian Ouguiya' },
  { code: 'MUR', label: 'Mauritian Rupee' },
  { code: 'MVR', label: 'Maldivian Rufiyaa' },
  { code: 'MWK', label: 'Malawian Kwacha' },
  { code: 'MXN', label: 'Mexican Peso' },
  { code: 'MYR', label: 'Malaysian Ringgit' },
  { code: 'MZN', label: 'Mozambican Metical' },
  { code: 'NAD', label: 'Namibian Dollar' },
  { code: 'NGN', label: 'Nigerian Naira' },
  { code: 'NIO', label: 'Nicaraguan Córdoba' },
  { code: 'NOK', label: 'Norwegian Krone' },
  { code: 'NPR', label: 'Nepalese Rupee' },
  { code: 'NZD', label: 'New Zealand Dollar' },
  { code: 'OMR', label: 'Omani Rial' },
  { code: 'PAB', label: 'Panamanian Balboa' },
  { code: 'PEN', label: 'Peruvian Sol' },
  { code: 'PGK', label: 'Papua New Guinean Kina' },
  { code: 'PHP', label: 'Philippine Peso' },
  { code: 'PKR', label: 'Pakistani Rupee' },
  { code: 'PLN', label: 'Polish Złoty' },
  { code: 'PYG', label: 'Paraguayan Guaraní' },
  { code: 'QAR', label: 'Qatari Riyal' },
  { code: 'RON', label: 'Romanian Leu' },
  { code: 'RSD', label: 'Serbian Dinar' },
  { code: 'RUB', label: 'Russian Ruble' },
  { code: 'RWF', label: 'Rwandan Franc' },
  { code: 'SAR', label: 'Saudi Riyal' },
  { code: 'SBD', label: 'Solomon Islands Dollar' },
  { code: 'SCR', label: 'Seychellois Rupee' },
  { code: 'SDG', label: 'Sudanese Pound' },
  { code: 'SEK', label: 'Swedish Krona' },
  { code: 'SGD', label: 'Singapore Dollar' },
  { code: 'SHP', label: 'Saint Helenian Pound' },
  { code: 'SKK', label: 'Slovak Koruna' },
  { code: 'SLL', label: 'Sierra Leonean Leone (1964-2022/6)' },
  { code: 'SLE', label: 'Sierra Leonean Leone' },
  { code: 'SOS', label: 'Somali Shilling' },
  { code: 'SRD', label: 'Surinamese Dollar' },
  { code: 'STD', label: 'São Tomé and Príncipe Dobra (1977-2017)' },
  { code: 'STN', label: 'São Tomé and Príncipe Dobra' },
  { code: 'SVC', label: 'Salvadoran Colón' },
  { code: 'SYP', label: 'Syrian Pound' },
  { code: 'SZL', label: 'Swazi Lilangeni' },
  { code: 'THB', label: 'Thai Baht' },
  { code: 'TJS', label: 'Tajikistani Somoni' },
  { code: 'TMT', label: 'Turkmenistani Manat' },
  { code: 'TND', label: 'Tunisian Dinar' },
  { code: 'TOP', label: 'Tongan Paʻanga' },
  { code: 'TRY', label: 'Turkish Lira' },
  { code: 'TTD', label: 'Trinidad and Tobago Dollar' },
  { code: 'TWD', label: 'New Taiwan Dollar' },
  { code: 'TZS', label: 'Tanzanian Shilling' },
  { code: 'UAH', label: 'Ukrainian Hryvnia' },
  { code: 'UGX', label: 'Ugandan Shilling' },
  { code: 'USD', label: 'United States Dollar' },
  { code: 'UYU', label: 'Uruguayan Peso' },
  { code: 'UZS', label: 'Uzbekistan Som' },
  { code: 'VES', label: 'Venezuelan Bolívar' },
  { code: 'VND', label: 'Vietnamese Đồng' },
  { code: 'VUV', label: 'Vanuatu Vatu' },
  { code: 'WST', label: 'Samoan Tala' },
  { code: 'XBA', label: 'European Composite Unit' },
  { code: 'XBB', label: 'European Monetary Unit' },
  { code: 'XBC', label: 'European Unit of Account 9' },
  { code: 'XBD', label: 'European Unit of Account 17' },
  { code: 'XCD', label: 'East Caribbean Dollar' },
  { code: 'XCG', label: 'Caribbean Guilder (2025-)' },
  { code: 'XOF', label: 'West African Cfa Franc' },
  { code: 'XPD', label: 'Palladium' },
  { code: 'XPT', label: 'Platinum' },
  { code: 'XTS', label: 'Codes specifically reserved for testing purposes' },
  { code: 'YER', label: 'Yemeni Rial' },
  { code: 'ZAR', label: 'South African Rand' },
  { code: 'ZMW', label: 'Zambian Kwacha' },
  { code: 'ZWL', label: 'Zimbabwean Dollar (2019-2024)' },
  { code: 'ZWG', label: 'Zimbabwe Gold' },
]

export default function CurrencyPicker({ value, onSelect, onClose }) {
  const [query, setQuery] = useState('')

  const currencies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) return CURRENCIES

    return CURRENCIES.filter(({ code, label }) => (
      code.toLowerCase().includes(normalizedQuery)
      || label.toLowerCase().includes(normalizedQuery)
    ))
  }, [query])

  return (
    <div className="fullscreen-picker">
      <div className="picker-header">
        <button className="back-btn" onClick={onClose} aria-label="Back">
          <ArrowLeft size={19} />
        </button>
        <div className="topbar-title">Currencies</div>
      </div>

      <div className="picker-search-row">
        <Search size={15} className="picker-search-icon" />
        <input
          className="picker-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search currencies"
          autoFocus
        />
      </div>

      <div className="picker-list">
        {currencies.map(({ code, label }) => (
          <button key={code} type="button" className="picker-row" onClick={() => onSelect(code)}>
            <span>{label} ({code})</span>
            <span className={`picker-radio ${value === code ? 'checked' : ''}`}>
              {value === code && <Check size={11} color="#fff" />}
            </span>
          </button>
        ))}

        {currencies.length === 0 && (
          <div className="field-hint" style={{ marginTop: 20 }}>
            No currencies match "{query}".
          </div>
        )}
      </div>
    </div>
  )
}