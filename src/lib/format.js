export function currencySymbol(currency = 'GBP') {
  try {
    const parts = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0)
    const symbolPart = parts.find((p) => p.type === 'currency')
    return symbolPart ? symbolPart.value : `${currency} `
  } catch (e) {
    // Invalid/unrecognized ISO code (e.g. OCR hallucinated something) — fall
    // back to showing the raw code instead of breaking the UI.
    return `${currency} `
  }
}

export function money(amount, currency = 'GBP') {
  const sym = currencySymbol(currency)
  return `${sym}${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function currencyName(currency = 'GBP') {
  try {
    const name = new Intl.DisplayNames(['en-GB'], { type: 'currency' }).of(currency)
    return `${name} (${currency})`
  } catch (e) {
    // Invalid/unrecognized ISO code — fall back to the raw code.
    return currency
  }
}

export const STATUS_META = {
  draft: { label: 'Not Submitted', className: 'status-draft' },
  submitted: { label: 'Submitted', className: 'status-submitted' },
  approved: { label: 'Approved', className: 'status-manager-approved' },
  rejected: { label: 'Rejected', className: 'status-rejected' },
  paid: { label: 'Paid', className: 'status-paid' },
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function initials(name) {
  return name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
}