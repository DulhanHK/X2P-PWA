// ---------------------------------------------------------------------------
// Receipt OCR / AI-extraction service
// ---------------------------------------------------------------------------
// This is the single integration point for receipt scanning ("ExpenseIt"-style
// capture). Today it runs in MOCK MODE so the app is fully demoable offline.
// When the real OCR backend is hosted, point it here — nothing in the UI
// (CaptureExpense.jsx) needs to change, only this file.
//
// Intended real-world architecture:
//   1. Receipt photo is captured/chosen on-device.
//   2. The image is sent (multipart/form-data or base64 JSON) to our own
//      backend endpoint, e.g. POST {VITE_OCR_API_URL}/scan
//   3. That backend runs PaddleOCR (text/field detection) and/or forwards the
//      image to a vision-capable model to structure the fields, then returns
//      clean JSON — the frontend never talks to PaddleOCR or the model
//      directly, and never holds any model API key.
//   4. We map the response into the shape the "review" form expects and let
//      the user correct anything before it's saved as a draft expense.
//
// Expected backend response shape (adjust the mapping in `normalizeResult`
// below if the real API differs):
//   {
//     merchant: string,
//     amount: number | string,
//     currency: string,        // ISO code, e.g. "GBP"
//     date: string,             // "YYYY-MM-DD"
//     category: string,         // best-effort guess, mapped to our CATEGORIES
//     confidence: number        // 0–1, optional
//   }

import { CATEGORIES } from '../store/store'

// Set these in a local .env.local (see .env.example) once the OCR backend is
// hosted. While VITE_OCR_API_URL is unset, scanReceipt() runs in mock mode.
const OCR_API_URL = import.meta.env.VITE_OCR_API_URL || ''
const OCR_API_KEY = import.meta.env.VITE_OCR_API_KEY || ''

// Text shown to the user any time a field on screen was filled in by the AI
// extraction step, mirroring the disclaimer SAP Concur's ExpenseIt shows
// ("uses machine learning... should be reviewed and updated accordingly").
export const AI_DISCLAIMER =
  'These details were filled in automatically by AI receipt scanning. Please check them carefully and correct anything wrong before submitting.'

const MOCK_SAMPLES = [
  { merchant: 'Costa Coffee', amount: '4.60', currency: 'GBP', category: 'Individual Meals' },
  { merchant: 'Shell Petrol Station', amount: '62.30', currency: 'GBP', category: 'Fuel' },
  { merchant: 'Premier Inn', amount: '119.00', currency: 'GBP', category: 'Hotel' },
  { merchant: 'WHSmith Travel', amount: '8.99', currency: 'GBP', category: 'Other' },
]

// Loose text -> our CATEGORIES matcher, so a slightly different label coming
// back from the OCR backend (e.g. "Meals", "Restaurant") still lands on a
// valid option instead of an empty/unmatched select.
function matchCategory(raw) {
  if (!raw) return 'Other'
  if (CATEGORIES.includes(raw)) return raw
  const needle = raw.toLowerCase()
  const hit = CATEGORIES.find((c) => c.toLowerCase().includes(needle) || needle.includes(c.toLowerCase()))
  return hit || 'Other'
}

function normalizeResult(raw) {
  return {
    merchant: raw.merchant || '',
    amount: String(raw.amount ?? ''),
    currency: raw.currency || 'GBP',
    date: raw.date || new Date().toISOString().slice(0, 10),
    category: matchCategory(raw.category),
    confidence: typeof raw.confidence === 'number' ? raw.confidence : null,
  }
}

/**
 * Send a captured receipt image to the OCR/AI extraction backend and return
 * the structured fields to pre-fill the review form with.
 *
 * @param {File} file - the receipt photo captured or chosen by the user
 * @returns {Promise<{merchant, amount, currency, date, category, confidence, mocked: boolean}>}
 */
export async function scanReceipt(file) {
  if (!OCR_API_URL) {
    // ---- Mock mode: no backend configured yet ----
    await new Promise((r) => setTimeout(r, 1500))
    const sample = MOCK_SAMPLES[Math.floor(Math.random() * MOCK_SAMPLES.length)]
    return { ...normalizeResult(sample), mocked: true }
  }

  // ---- Real mode: hosted OCR backend ----
  const body = new FormData()
  body.append('receipt', file)

  const res = await fetch(`${OCR_API_URL}/scan`, {
    method: 'POST',
    headers: OCR_API_KEY ? { Authorization: `Bearer ${OCR_API_KEY}` } : undefined,
    body,
  })

  if (!res.ok) {
    throw new Error(`OCR request failed (${res.status})`)
  }

  const data = await res.json()
  return { ...normalizeResult(data), mocked: false }
}
