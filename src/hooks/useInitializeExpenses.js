import { useEffect, useRef } from 'react'
import { useStore } from '../store/store'
import { getExpenses } from '../lib/expenses'

export function useInitializeExpenses() {
  const { state, dispatch } = useStore()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only fetch once on component mount
    if (hasInitialized.current) return
    
    hasInitialized.current = true
    let isMounted = true

    const initializeExpenses = async () => {
      // Add small delay to ensure proper rendering
      await new Promise(r => setTimeout(r, 100))
      
      try {
        console.log('Fetching expenses from API...')
        const expenses = await getExpenses()
        console.log('Expenses fetched successfully:', expenses)
        
        if (isMounted && Array.isArray(expenses)) {
          dispatch({ 
            type: 'SET_EXPENSES', 
            expenses
          })
        }
      } catch (err) {
        console.error('Failed to fetch expenses from API:', err.message)
        // Set empty expenses array if fetch fails
        if (isMounted) {
          dispatch({
            type: 'SET_EXPENSES',
            expenses: []
          })
        }
      }
    }

    initializeExpenses()

    return () => {
      isMounted = false
    }
  }, [dispatch])
}
