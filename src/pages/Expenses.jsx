import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Plus, FilePlus2, Camera, ImagePlus, Upload, Send } from 'lucide-react'
import { useStore, actorName } from '../store/store'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import ExpenseRow from '../components/ExpenseRow'
import SectionTabs from '../components/SectionTabs'
import { money } from '../lib/format'

export default function Expenses() {
  const { state, dispatch } = useStore()
  const nav = useNavigate()
  const [filter, setFilter] = useState('all') // all | draft | submitted
  const [addSheet, setAddSheet] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const filtered = useMemo(() => {
    const sorted = [...state.expenses].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (filter === 'draft') return sorted.filter((e) => e.status === 'draft')
    if (filter === 'submitted') return sorted.filter((e) => e.status !== 'draft')
    return sorted
  }, [state.expenses, filter])

  // Concur lets you tick expenses and submit them as a report in one go —
  // we submit each selected expense as its own claim instead of a report.
  const submittable = filtered.filter((e) => e.status === 'draft')
  const selectedExpenses = submittable.filter((e) => selectedIds.includes(e.id))
  const selectedTotal = selectedExpenses.reduce((s, e) => s + e.amount, 0)

  function addVia(mode) {
    setAddSheet(false)
    nav('/capture', { state: { mode } })
  }

  function toggleSelect(id) {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]))
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds([])
  }

  function submitSelected() {
    const actor = actorName(state.role, state)
    selectedIds.forEach((id) => dispatch({ type: 'SUBMIT_EXPENSE', id, actor }))
    exitSelectMode()
    nav('/claims')
  }

  return (
    <>
      <TopBar title="Expenses" subtitle={`${state.expenses.length} total`} />
      <div className="app-scroll">
        <div className="page" style={{ paddingTop: 0 }}>
          <SectionTabs active="expenses" />
          {submittable.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
              <button className="btn-ghost" style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--x2p-green-700)', padding: '2px 4px' }} onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}>
                {selectMode ? 'Cancel' : 'Select'}
              </button>
            </div>
          )}
          <div className="segmented" style={{ marginBottom: 6 }}>
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
            <button className={filter === 'draft' ? 'active' : ''} onClick={() => setFilter('draft')}>Not Submitted</button>
            <button className={filter === 'submitted' ? 'active' : ''} onClick={() => setFilter('submitted')}>Submitted</button>
          </div>
          <div className="section-title">&nbsp;</div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Inbox size={34} />
              <p>Nothing here yet.</p>
            </div>
          ) : (
            filtered.map((e) => {
              const canSelect = selectMode && e.status === 'draft'
              return (
                <ExpenseRow
                  key={e.id}
                  expense={e}
                  onClick={() => nav(`/expenses/${e.id}`)}
                  selectable={canSelect}
                  selected={selectedIds.includes(e.id)}
                  onToggleSelect={() => toggleSelect(e.id)}
                />
              )
            })
          )}
        </div>
        {!selectMode && (
          <div className="fab-row">
            <button className="fab" onClick={() => setAddSheet(true)} aria-label="Add expense"><Plus size={22} /></button>
          </div>
        )}
      </div>
      <BottomNav />

      {selectMode && selectedIds.length > 0 && (
        <div className="page" style={{ position: 'sticky', bottom: 0, background: 'var(--x2p-paper)', paddingTop: 12, paddingBottom: 16, boxShadow: '0 -8px 20px -12px rgba(0,0,0,0.2)' }}>
          <button className="btn-primary" onClick={submitSelected}>
            <Send size={16} /> Submit {selectedIds.length} expense{selectedIds.length === 1 ? '' : 's'} · {money(selectedTotal, 'GBP')}
          </button>
        </div>
      )}

      {addSheet && (
        <div className="sheet-backdrop" onClick={() => setAddSheet(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">Add an expense</div>
            <div style={{ display: 'grid', gap: 4, marginTop: 12 }}>
              <button className="list-row" onClick={() => addVia('manual')}>
                <div className="merchant-badge"><FilePlus2 size={17} /></div>
                <div className="card-body"><div className="card-merchant">Create Manual Expense</div></div>
              </button>
              <button className="list-row" onClick={() => addVia('camera')}>
                <div className="merchant-badge"><Camera size={17} /></div>
                <div className="card-body"><div className="card-merchant">Take Photo</div></div>
              </button>
              <button className="list-row" onClick={() => addVia('library')}>
                <div className="merchant-badge"><ImagePlus size={17} /></div>
                <div className="card-body"><div className="card-merchant">Upload Photo</div></div>
              </button>
              <button className="list-row" onClick={() => addVia('file')}>
                <div className="merchant-badge"><Upload size={17} /></div>
                <div className="card-body"><div className="card-merchant">Upload File</div></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
