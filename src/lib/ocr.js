import { CATEGORIES } from '../store/store'

const OCR_API_URL = import.meta.env.VITE_OCR_API_URL || ''
// OCR-friendly limits: smaller than original camera images, but clear enough for receipt text.
const OCR_IMAGE_TARGET_BYTES = 750 * 1024
const OCR_IMAGE_MAX_DIMENSION = 2048
const OCR_IMAGE_MIN_DIMENSION = 1200

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

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image compression failed.'))),
      'image/jpeg',
      quality
    )
  })
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const source = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(source)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(source)
      reject(new Error('Selected image could not be read.'))
    }
    image.src = source
  })
}

export async function compressReceiptImage(file) {
  if (!file.type.startsWith('image/') || file.size <= OCR_IMAGE_TARGET_BYTES) {
    return file
  }

  try {
    const image = await loadImage(file)
    let scale = Math.min(1, OCR_IMAGE_MAX_DIMENSION / Math.max(image.width, image.height))
    let width = Math.max(1, Math.round(image.width * scale))
    let height = Math.max(1, Math.round(image.height * scale))
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) return file

    for (let attempt = 0; attempt < 5; attempt += 1) {
      canvas.width = width
      canvas.height = height
      context.drawImage(image, 0, 0, width, height)

      const blob = await canvasToBlob(canvas, Math.max(0.65, 0.88 - attempt * 0.05))
      if (blob.size <= OCR_IMAGE_TARGET_BYTES || Math.min(width, height) <= OCR_IMAGE_MIN_DIMENSION) {
        return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'receipt'}.jpg`, {
          type: 'image/jpeg',
          lastModified: file.lastModified,
        })
      }

      scale *= 0.75
      width = Math.max(OCR_IMAGE_MIN_DIMENSION, Math.round(image.width * scale))
      height = Math.max(OCR_IMAGE_MIN_DIMENSION, Math.round(image.height * scale))
    }
  } catch {
    // Preserve the original if a browser cannot decode its image format.
  }

  return file
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