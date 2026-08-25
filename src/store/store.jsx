import React, { createContext, useContext, useEffect, useReducer } from 'react'

// Bump this whenever the expense/report shape changes so stale cached data
// (e.g. old reportId-based expenses without status/history) doesn't crash
// screens that assume the new shape.
const STORAGE_KEY = 'x2p.v3'

// Grouped expense types, matching the categories/expense-type structure used in the
// SAP Concur mobile app's "New Expense" screen (Standard Edition default set).
const CATEGORY_GROUPS = [
  { group: 'Air Travel', types: ['Airfare', 'Airline Fee (Baggage / Change / Seat)'] },
  { group: 'Ground Transportation', types: ['Car Rental', 'Fuel', 'Taxi / Rideshare', 'Train', 'Parking', 'Tolls', 'Personal Car Mileage'] },
  { group: 'Lodging', types: ['Hotel', 'Lodging (Other)'] },
  { group: 'Meals & Entertainment', types: ['Business Meals (Attendees)', 'Individual Meals', 'Client Entertainment', 'Alcohol'] },
  { group: 'Fees & Subscriptions', types: ['Registration Fee', 'Passport / Visa Fee', 'Subscriptions / Dues', 'Internet Access', 'Telephone / Fax'] },
  { group: 'Other', types: ['Office Supplies', 'Postage / Shipping', 'Laundry / Dry Cleaning', 'Gift', 'Tips', 'Miscellaneous', 'Other'] },
]
const CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.types)
const PAYMENT_TYPES = ['Company Card', 'Cash / Out of Pocket']
const CURRENCIES = ['GBP', 'USD', 'EUR', 'LKR']

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}
function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString() }

// ---- Seed data -----------------------------------------------------------

const seedExpenses = [
  { id: uid('exp'), merchant: 'Pret A Manger', date: daysAgo(0), amount: 9.85, currency: 'GBP', category: 'Individual Meals', paymentType: 'Company Card', businessPurpose: '', notes: '', receiptImage: null, source: 'card', status: 'draft', history: [{ status: 'draft', actor: 'Radika G.', at: daysAgo(0) }] },
  { id: uid('exp'), merchant: 'Uber', date: daysAgo(1), amount: 27.8, currency: 'GBP', category: 'Taxi / Rideshare', paymentType: 'Company Card', businessPurpose: '', notes: '', receiptImage: null, source: 'card', status: 'draft', history: [{ status: 'draft', actor: 'Radika G.', at: daysAgo(1) }] },
  { id: uid('exp'), merchant: 'The Ivy Brasserie', date: daysAgo(2), amount: 84.5, currency: 'GBP', category: 'Client Entertainment', paymentType: 'Company Card', businessPurpose: 'Client dinner — Q3 renewal discussion', notes: '', receiptImage: null, source: 'expenseit', status: 'submitted', history: [{ status: 'draft', actor: 'Radika G.', at: daysAgo(3) }, { status: 'submitted', actor: 'Radika G.', at: daysAgo(2) }] },
  { id: uid('exp'), merchant: 'Heathrow Express', date: daysAgo(4), amount: 38.9, currency: 'GBP', category: 'Train', paymentType: 'Cash / Out of Pocket', businessPurpose: 'Site visit — Manchester distribution centre', notes: '', receiptImage: null, source: 'expenseit', status: 'submitted', history: [{ status: 'draft', actor: 'Radika G.', at: daysAgo(5) }, { status: 'submitted', actor: 'Radika G.', at: daysAgo(4) }] },
  { id: uid('exp'), merchant: 'Premier Inn Manchester', date: daysAgo(4), amount: 119, currency: 'GBP', category: 'Hotel', paymentType: 'Company Card', businessPurpose: 'Site visit — overnight stay', notes: '', receiptImage: null, source: 'card', status: 'submitted', history: [{ status: 'draft', actor: 'Radika G.', at: daysAgo(5) }, { status: 'submitted', actor: 'Radika G.', at: daysAgo(4) }] },
  { id: uid('exp'), merchant: 'BT Business', date: daysAgo(14), amount: 210, currency: 'GBP', category: 'Internet Access', paymentType: 'Company Card', businessPurpose: 'Site broadband — Vauxhall office', notes: 'Monthly recurring', receiptImage: null, source: 'manual', status: 'paid', history: [
    { status: 'draft', actor: 'Radika G.', at: daysAgo(15) },
    { status: 'submitted', actor: 'Radika G.', at: daysAgo(14) },
    { status: 'approved', actor: 'D. Wickramasinghe', at: daysAgo(12) },
    { status: 'paid', actor: 'Finance / PIS Settlement', at: daysAgo(8) },
  ] },
  { id: uid('exp'), merchant: 'DHL Express', date: daysAgo(6), amount: 56.2, currency: 'GBP', category: 'Postage / Shipping', paymentType: 'Cash / Out of Pocket', businessPurpose: 'Sample shipment to Colombo warehouse', notes: '', receiptImage: null, source: 'expenseit', status: 'sent_back', history: [
    { status: 'draft', actor: 'Radika G.', at: daysAgo(7) },
    { status: 'submitted', actor: 'Radika G.', at: daysAgo(6) },
    { status: 'sent_back', actor: 'D. Wickramasinghe', at: daysAgo(5), comment: 'Please attach the customs invoice as a second page.' },
  ] },
]

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* corrupt cache, fall through to seed */ }
  return {
    role: null,
    user: { name: 'Radika Gunawardana', title: 'Solutions Lead', entity: 'Hela Brands UK', department: 'Commercial' },
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
      // action.status: 'approved' | 'sent_back' | 'paid'
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

