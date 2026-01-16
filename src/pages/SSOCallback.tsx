import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignIn, useSignUp } from '@clerk/clerk-react'

export function SSOCallback() {
  const { signIn, setActive: setActiveSignIn } = useSignIn()
  const { signUp, setActive: setActiveSignUp } = useSignUp()
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Try to handle sign-in callback
        if (signIn?.status === 'complete') {
          await setActiveSignIn({ session: signIn.createdSessionId })
          navigate('/dashboard')
          return
        }

        // Try to handle sign-up callback
        if (signUp?.status === 'complete') {
          await setActiveSignUp({ session: signUp.createdSessionId })
          navigate('/dashboard')
          return
        }

        // If neither is complete, wait a bit and check again
        // This handles the OAuth flow delay
        const checkInterval = setInterval(async () => {
          if (signIn?.status === 'complete') {
            clearInterval(checkInterval)
            await setActiveSignIn({ session: signIn.createdSessionId })
            navigate('/dashboard')
          } else if (signUp?.status === 'complete') {
            clearInterval(checkInterval)
            await setActiveSignUp({ session: signUp.createdSessionId })
            navigate('/dashboard')
          }
        }, 100)

        // Cleanup after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval)
          navigate('/sign-in')
        }, 10000)

      } catch (err) {
        console.error('SSO callback error:', err)
        navigate('/sign-in')
      }
    }

    handleCallback()
  }, [signIn, signUp, setActiveSignIn, setActiveSignUp, navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
