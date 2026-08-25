const SYMBOLS = { GBP: '£', USD: '$', EUR: '€', LKR: 'Rs ' }

export function money(amount, currency = 'GBP') {
  const sym = SYMBOLS[currency] || ''
  return `${sym}${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const STATUS_META = {
  draft: { label: 'Not Submitted', className: 'status-draft' },
  submitted: { label: 'Submitted', className: 'status-submitted' },
  approved: { label: 'Approved', className: 'status-manager-approved' },
  paid: { label: 'Paid', className: 'status-paid' },
  sent_back: { label: 'Sent Back', className: 'status-returned' },
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
