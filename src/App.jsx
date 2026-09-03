import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './store/store'
import Home from './pages/Home'
import CaptureExpense from './pages/CaptureExpense'
import Expenses from './pages/Expenses'
import ExpenseDetail from './pages/ExpenseDetail'
import Claims from './pages/Claims'
import Profile from './pages/Profile'
import './App.css'
import Approvals from './pages/Approvals'
 
function Gate({ children }) {
  return children
}
 
function Shell() {
  return (
    <Routes>
      <Route path="/home" element={<Gate><Home /></Gate>} />
      <Route path="/capture" element={<Gate><CaptureExpense /></Gate>} />
      <Route path="/expenses" element={<Gate><Expenses /></Gate>} />
      <Route path="/expenses/:id" element={<Gate><ExpenseDetail /></Gate>} />
      <Route path="/claims" element={<Gate><Claims /></Gate>} />
      <Route path="/profile" element={<Gate><Profile /></Gate>} />
      <Route path="/approvals" element={<Gate><Approvals /></Gate>} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
 
export default function App() {
  return (
    <StoreProvider>
      <div className="app-frame-outer">
        <div className="app-frame">
          <HashRouter>
            <Shell />
          </HashRouter>
        </div>
      </div>
    </StoreProvider>
  )
}