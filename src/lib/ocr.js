import { CATEGORIES } from '../store/store'

const OCR_API_URL = import.meta.env.VITE_OCR_API_URL || ''

export const AI_DISCLAIMER =
  'These details were filled in automatically by AI receipt scanning. Please check them carefully and correct anything wrong before submitting.'

function matchCategory(raw) {
  if (!raw) return 'Other'
  if (CATEGORIES.includes(raw)) return raw
  const needle = raw.toLowerCase()
  const hit = CATEGORIES.find((c) => c.toLowerCase().includes(needle) || needle.includes(c.toLowerCase()))
  return hit || 'Other'
}

function normalizeResult(raw) {
  return {
    merchant: raw.merchant || raw.vendor_name || '',
    amount: String(raw.amount ?? raw.total_amount ?? ''),
    currency: raw.currency || 'GBP',
    date: raw.date || raw.invoice_date || new Date().toISOString().slice(0, 10),
    category: matchCategory(raw.category),
    country: raw.country || raw.vendor_country || raw.merchant_country || '',
    location: raw.location || raw.vendor_address || raw.merchant_address || raw.address || '',
    invoiceNumber: raw.invoice_number ?? raw.invoiceNumber ?? null,
    confidence: typeof raw.confidence === 'number' ? raw.confidence : null,
  }
}

export async function scanReceipt(file) {
  if (!OCR_API_URL) {
    throw new Error('OCR service is not configured (VITE_OCR_API_URL is missing).')
  }

  const body = new FormData()
  body.append('file', file)

  const res = await fetch(`${OCR_API_URL}/invoices/extract`, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    throw new Error(`OCR request failed (${res.status})`)
  }

  const data = await res.json()
  return { ...normalizeResult(data), mocked: false }
}