// Expenses service - handles fetching and managing expenses from the API

const API_URL = import.meta.env.VITE_API || 'http://172.23.1.46/xtp/app-api/'

/**
 * Fetch all expenses for the current user
 * @returns {Promise<Array>} Array of expense objects
 */
export async function getExpenses() {
  try {
    const res = await fetch(`${API_URL}requests/misRequests.php`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      throw new Error(data?.message || 'Failed to fetch expenses.')
    }

    // Ensure data.data is an array
    const expenses = data?.data || data || []
    if (!Array.isArray(expenses)) {
      console.warn('API returned non-array data:', expenses)
      return []
    }

    // Map API response to internal expense format
    return expenses.map(transformExpense)
  } catch (err) {
    console.error('Error fetching expenses:', err)
    throw err
  }
}

/**
 * Transform API expense format to internal format
 */
function transformExpense(exp) {
  // Map API response fields to internal expense format
  // API provides: requestNo, amount, description, status, requiredDate, glAccount, etc.
  return {
    id: exp.requestNo || `exp_${exp.requestedUserId}_${Date.now()}`,
    merchant: exp.glAccount || 'Expense',
    date: exp.requiredDate || new Date().toISOString(),
    amount: parseFloat(exp.amount) || 0,
    currency: 'GBP',
    category: exp.description || 'Other',
    paymentType: 'Company Card',
    businessPurpose: exp.description || '',
    notes: `Request: ${exp.requestNo}/${exp.requestYear} | Module: ${exp.module} | IOU: ${exp.iouStatus}`,
    receiptImage: null,
    source: 'api',
    status: mapApiStatus(exp.status, exp.statusId),
    history: [
      {
        status: mapApiStatus(exp.status, exp.statusId),
        actor: exp.requestedBy || 'User',
        at: exp.approvedDate || new Date().toISOString(),
      }
    ],
    userId: exp.requestedUserId,
    requestId: exp.requestNo,
    requestYear: exp.requestYear,
    statusId: exp.statusId,
    approvedBy: exp.approvedBy,
    approvedDate: exp.approvedDate,
    specialApprovedBy: exp.specialApprovedBy,
    specialApprovedDate: exp.specialApprovedDate,
  }
}

function mapApiStatus(apiStatus, statusId) {
  const statusMap = {
    'Payment_Processing': 'submitted',
    'Approved': 'approved',
    'Paid': 'paid',
    'Rejected': 'sent_back',
    'Cancelled': 'cancelled',
    'Draft': 'draft',
    'Pending': 'submitted',
  }
  return statusMap[apiStatus] || 'draft'
}
