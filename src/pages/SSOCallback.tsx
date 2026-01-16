import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignIn, useSignUp, useClerk } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Logo } from '../components/ui/Logo'
import { useMetaPixel } from '../hooks/useMetaPixel'
import { useGA4 } from '../hooks/useGA4'

export function SSOCallback() {
  const { signIn, setActive: setActiveSignIn } = useSignIn()
  const { signUp, setActive: setActiveSignUp } = useSignUp()
  const { handleRedirectCallback } = useClerk()
  const navigate = useNavigate()
  const { trackEvent: trackMetaEvent } = useMetaPixel()
  const { trackEvent: trackGA4Event } = useGA4()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Use Clerk's built-in redirect callback handler
        await handleRedirectCallback({
          afterSignInUrl: '/dashboard',
          afterSignUpUrl: '/dashboard',
        })
      } catch (err) {
        // Fallback: manually check sign-in/sign-up status
        try {
          if (signIn?.status === 'complete' && setActiveSignIn) {
            setStatus('success')
            await setActiveSignIn({ session: signIn.createdSessionId })
            navigate('/dashboard')
            return
          }

          if (signUp?.status === 'complete' && setActiveSignUp) {
            setStatus('success')

            // Track new user registration (Meta Pixel)
            trackMetaEvent('CompleteRegistration', {
              content_name: 'User Sign Up',
              status: 'completed'
            })

            // Track new user registration (GA4)
            trackGA4Event('sign_up', {
              method: 'OAuth'
            })

            await setActiveSignUp({ session: signUp.createdSessionId })
            navigate('/dashboard')
            return
          }

          // Poll for completion
          let attempts = 0
          const maxAttempts = 50

          const checkStatus = async () => {
            attempts++

            if (signIn?.status === 'complete' && setActiveSignIn) {
              setStatus('success')
              await setActiveSignIn({ session: signIn.createdSessionId })
              navigate('/dashboard')
              return true
            }

            if (signUp?.status === 'complete' && setActiveSignUp) {
              setStatus('success')

              // Track new user registration (Meta Pixel)
              trackMetaEvent('CompleteRegistration', {
                content_name: 'User Sign Up',
                status: 'completed'
              })

              // Track new user registration (GA4)
              trackGA4Event('sign_up', {
                method: 'OAuth'
              })

              await setActiveSignUp({ session: signUp.createdSessionId })
              navigate('/dashboard')
              return true
            }

            if (attempts >= maxAttempts) {
              throw new Error('Authentication timed out')
            }

            return false
          }

          const interval = setInterval(async () => {
            const done = await checkStatus()
            if (done) {
              clearInterval(interval)
            }
          }, 200)

          // Cleanup after timeout
          setTimeout(() => {
            clearInterval(interval)
            if (status === 'loading') {
              setStatus('error')
              setError('Authentication took too long. Please try again.')
            }
          }, 10000)

        } catch (fallbackErr: any) {
          console.error('SSO callback error:', fallbackErr)
          setStatus('error')
          setError(fallbackErr?.message || 'Failed to complete sign in')
        }
      }
    }

    handleCallback()
  }, [handleRedirectCallback, signIn, signUp, setActiveSignIn, setActiveSignUp, navigate, status])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10"
      >
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Animated loading indicator */}
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-2 border-2 border-transparent border-t-primary/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>

            <div className="space-y-2">
              <p className="text-white font-medium">Completing sign in...</p>
              <p className="text-sm text-muted-foreground">Just a moment while we verify your account</p>
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Success checkmark */}
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-white font-medium">Sign in successful!</p>
              <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Error icon */}
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-white font-medium">Sign in failed</p>
              <p className="text-sm text-muted-foreground">{error || 'Something went wrong. Please try again.'}</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/sign-in')}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white border border-border rounded-lg transition-colors"
              >
                Go home
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
