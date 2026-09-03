import React, { createContext, useContext, useEffect, useReducer } from 'react'

// Bump this whenever the expense/report shape changes so stale cached data
// (e.g. old reportId-based expenses without status/history) doesn't crash
// screens that assume the new shape.
const STORAGE_KEY = 'x2p.v8'

// Grouped expense types, matching the company's real chart-of-accounts
// expense types (GL code shown in parentheses where one applies).
const CATEGORY_GROUPS = [
  {
    group: 'Travel',
    types: [
      'Airfare (7-4320)',
      'Airline Fees (7-4300)',
      'Car Rental (6-3600)',
      'Hotel',
      'Train (7-4330)',
      'Travel Christmas do (7-4300)',
    ],
  },
  {
    group: 'Transportation',
    types: [
      'Fuel (6-3300)',
      'Parking (7-4300)',
      'Public Transport (7-4300)',
      'Taxi (7-4300)',
      'Tolls/Road Charges (7-4300)',
    ],
  },
  {
    group: 'Meals and Entertainment',
    types: [
      'Breakfast (7-4300)',
      'Dinner (7-4300)',
      'Entertainment - Client (7-4500)',
      'Entertainment - Staff (7-4600)',
      'Entertainment - Supplier (7-4400)',
      'Individual Meals (7-4340)',
      'Lunch (7-4300)',
    ],
  },
  {
    group: 'Office Expenses',
    types: [
      'Computer Software (7-4000)',
      'Courier/Shipping/Freight (6-4100)',
      'Maintenance of Computer (7-3900)',
      'Postage (7-3500)',
      'Printing/Photocopying/Stationery (7-3300)',
      'Repairs and Maintenance (7-3800)',
    ],
  },
  {
    group: 'Communications',
    types: [
      'Mobile Phone (7-3200)',
      'Telephone/Internet/Fax (7-3200)',
    ],
  },
  {
    group: 'Fees',
    types: [
      'Bank Fees (7-5900)',
      'Barclaycard Charges (7-6000)',
      'Legal/ Professional Charges (7-5400)',
      'Medical Fees (7-2200)',
      'Passport/Visa Fees (7-4300)',
      'Shopify Transaction Fees (5-1500)',
      'Subscription & Donations (6-1500)',
    ],
  },
  {
    group: 'Other',
    types: [
      'Advertising (6-1100)',
      'COS - Customer Penalties (5-9550)',
      'COS – Returns Fees (5-7250)',
      'Canteen (7-3700)',
      'Car Maintenance/Repairs (6-3400)',
      'Carriage Outwards (6-4100)',
      'Cleaning (7-3600)',
      'Exhibitions (6-1300)',
      'Gifts - Clients (7-4400)',
      'Gifts - Staff (7-2200)',
      'Incidentals Allowance (7-4300)',
      'Marketing - Collaborations (6-1100)',
      'Marketing - Hotel (Photography) (7-4400)',
      'Marketing - JD Support (6-1100)',
      'Marketing - Music (6-1100)',
      'Marketing - OOH Advertising (6-1100)',
      'Marketing - Other Misc (7-3800)',
      'Marketing - PR (6-1100)',
      'Marketing - Photography (6-1100)',
      'Marketing - Retail Support (6-1100)',
      'Marketing - Samples (5-9000)',
      'Marketing - Showroom Updates (7-3800)',
      'Marketing - Social media (6-1100)',
      'Marketing - Sponsorship - Tennis/Golf etc (6-1400)',
      'Marketing - Tennis Activation (6-1100)',
      'Marketing - Trade - Sales Docs, POS, Fairs (6-1300)',
      'Marketing - eCommerce Development (6-1100)',
      'Marketing - eCommerce Marketing (6-1100)',
      'Packaging (5-4000)',
      'Relocation Expenses (7-1400)',
      'Samples - Development Samples (5-9003)',
      'Security & Safety Charges (7-4200)',
      'Selling Costs (7-8000)',
      'Seminar/Course Fees (7-1800)',
      'Staff Awards/Incentives (7-2200)',
      'Staff Welfare (7-2200)',
      'Sundry Expenses (7-4700)',
      'Travel - other (7-4300)',
      'Tuition/Training Reimbursement (7-1800)',
      'Vehicle Road Tax (6-3100)',
    ],
  },
]
const CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.types)
const PAYMENT_TYPES = ['Cash', 'Company Paid']
const CURRENCIES = ['GBP', 'USD', 'EUR', 'LKR']

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}
function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString() }

// ---- Seed data -----------------------------------------------------------

const seedExpenses = [
  { id: uid('exp'), merchant: 'Pret A Manger', date: daysAgo(0), amount: 9.85, currency: 'GBP', category: 'Individual Meals (7-4340)', paymentType: 'Company Card', businessPurpose: '', notes: '', receiptImage: null, source: 'card', status: 'draft', history: [{ status: 'draft', actor: 'Radika G.', at: daysAgo(0) }] },
  { id: uid('exp'), merchant: 'Uber', date: daysAgo(1), amount: 27.8, currency: 'GBP', category: 'Taxi (7-4300)', paymentType: 'Company Card', businessPurpose: '', notes: '', receiptImage: null, source: 'card', status: 'draft', history: [{ status: 'draft', actor: 'Radika G.', at: daysAgo(1) }] },
  { id: uid('exp'), merchant: 'The Ivy Brasserie', date: daysAgo(2), amount: 84.5, currency: 'GBP', category: 'Entertainment - Client (7-4500)', paymentType: 'Company Card', businessPurpose: 'Client dinner — Q3 renewal discussion', notes: '', receiptImage: null, source: 'expenseit', status: 'submitted', history: [{ status: 'draft', actor: 'Radika G.', at: daysAgo(3) }, { status: 'submitted', actor: 'Radika G.', at: daysAgo(2) }] },
  { id: uid('exp'), merchant: 'Heathrow Express', date: daysAgo(4), amount: 38.9, currency: 'GBP', category: 'Train (7-4330)', paymentType: 'Cash / Out of Pocket', businessPurpose: 'Site visit — Manchester distribution centre', notes: '', receiptImage: null, source: 'expenseit', status: 'submitted', history: [{ status: 'draft', actor: 'Radika G.', at: daysAgo(5) }, { status: 'submitted', actor: 'Radika G.', at: daysAgo(4) }] },
  { id: uid('exp'), merchant: 'Premier Inn Manchester', date: daysAgo(4), amount: 119, currency: 'GBP', category: 'Hotel', paymentType: 'Company Card', businessPurpose: 'Site visit — overnight stay', notes: '', receiptImage: null, source: 'card', status: 'approved', history: [
    { status: 'draft', actor: 'Radika G.', at: daysAgo(6) },
    { status: 'submitted', actor: 'Radika G.', at: daysAgo(5) },
    { status: 'approved', actor: 'D. Wickramasinghe', at: daysAgo(3) },
  ] },
  { id: uid('exp'), merchant: 'BT Business', date: daysAgo(14), amount: 210, currency: 'GBP', category: 'Telephone/Internet/Fax (7-3200)', paymentType: 'Company Card', businessPurpose: 'Site broadband — Vauxhall office', notes: 'Monthly recurring', receiptImage: null, source: 'manual', status: 'paid', history: [
    { status: 'draft', actor: 'Radika G.', at: daysAgo(15) },
    { status: 'submitted', actor: 'Radika G.', at: daysAgo(14) },
    { status: 'approved', actor: 'D. Wickramasinghe', at: daysAgo(12) },
    { status: 'paid', actor: 'Finance / PIS Settlement', at: daysAgo(8) },
  ] },
  { id: uid('exp'), merchant: 'DHL Express', date: daysAgo(6), amount: 56.2, currency: 'GBP', category: 'Courier/Shipping/Freight (6-4100)', paymentType: 'Cash / Out of Pocket', businessPurpose: 'Sample shipment to Colombo warehouse', notes: '', receiptImage: null, source: 'expenseit', status: 'rejected', history: [
    { status: 'draft', actor: 'Radika G.', at: daysAgo(7) },
    { status: 'submitted', actor: 'Radika G.', at: daysAgo(6) },
    { status: 'rejected', actor: 'D. Wickramasinghe', at: daysAgo(5), comment: 'Missing customs invoice for this shipment.' },
  ] },
]

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* corrupt cache, fall through to seed */ }
  return {
    role: null,
    user: { name: 'RadikaG', email: 'radika.gunawardana@helabrands.com', department: 'Commercial' },
    expenses: seedExpenses,
  }
}

// ---- Reducer ---------------------------------------------------------------

const StoreContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role }
    case 'LOG_OUT':
      return { ...state, role: null }

    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.expense, ...state.expenses] }

    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map((e) => (e.id === action.id ? action.updater(e) : e)) }

    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) }

    case 'SUBMIT_EXPENSE': {
      const now = new Date().toISOString()
      return {
        ...state,
        expenses: state.expenses.map((e) => (e.id === action.id
          ? { ...e, status: 'submitted', history: [...e.history, { status: 'submitted', actor: action.actor, at: now }] }
          : e)),
      }
    }

    case 'EXPENSE_ACTION': {
      // action.status: 'approved' | 'rejected' | 'paid'
      const now = new Date().toISOString()
      return {
        ...state,
        expenses: state.expenses.map((e) => (e.id === action.id
          ? { ...e, status: action.status, history: [...e.history, { status: action.status, actor: action.actor, at: now, comment: action.comment }] }
          : e)),
      }
    }

    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (e) { /* storage unavailable */ }
  }, [state])
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function actorName(role, state) {
  return role === 'manager' ? 'D. Wickramasinghe' : state.user.name.split(' ')[0] + ' ' + state.user.name.split(' ')[1][0] + '.'
}

export { CATEGORY_GROUPS, CATEGORIES, PAYMENT_TYPES, CURRENCIES, uid }