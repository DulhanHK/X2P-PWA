import { useEffect, useRef } from 'react'
import { useStore } from '../store/store'
import { getCurrentUser } from '../lib/auth'

export function useInitializeUser() {
  const { state, dispatch } = useStore()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only fetch once on component mount
    if (hasInitialized.current) return
    
    hasInitialized.current = true
    let isMounted = true

    const initializeUser = async () => {
      // Add small delay to ensure proper rendering
      await new Promise(r => setTimeout(r, 100))
      
      try {
        console.log('Fetching user from API...')
        const user = await getCurrentUser()
        console.log('User fetched successfully:', user)
        
        if (isMounted) {
          dispatch({ 
            type: 'SET_USER', 
            user: {
              name: user.name || 'User',
              userId: user.userId || null,
              email: user.email || '',
              department: user.department || '',
            }
          })
        }
      } catch (err) {
        console.error('Failed to fetch user from API:', err.message)
        // Set a default user to prevent blank display
        if (isMounted) {
          dispatch({
            type: 'SET_USER',
            user: {
              name: 'User',
              userId: null,
              email: '',
              department: '',
            }
          })
        }
      }
    }

    initializeUser()

    return () => {
      isMounted = false
    }
  }, [dispatch])
}
