import { useState, useRef, useEffect } from 'react'
import { useSignIn } from '@clerk/clerk-react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Logo } from '../components/ui/Logo'

// Friendly error messages
const getErrorMessage = (error: any): string => {
  const code = error?.errors?.[0]?.code
  const message = error?.errors?.[0]?.message || ''

  if (code === 'form_identifier_not_found') {
    return "We couldn't find an account with that email. Try signing up instead."
  }
  if (code === 'form_password_incorrect') {
    return "Incorrect password. Please try again."
  }
  if (code === 'strategy_for_user_invalid') {
    return "This account uses a different sign-in method."
  }
  if (message.toLowerCase().includes('too many')) {
    return "Too many attempts. Please wait a moment before trying again."
  }

  return error?.errors?.[0]?.longMessage || message || 'Something went wrong. Please try again.'
}

export function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [errorSuggestion, setErrorSuggestion] = useState<'signup' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // Auto-focus email input on mount
  useEffect(() => {
    if (isLoaded && emailRef.current) {
      emailRef.current.focus()
    }
  }, [isLoaded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return

    setIsLoading(true)
    setError('')
    setErrorSuggestion(null)

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate('/dashboard')
      } else {
        setError('Sign in incomplete. Please try again.')
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)

      const code = err?.errors?.[0]?.code
      if (code === 'form_identifier_not_found') {
        setErrorSuggestion('signup')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-8 bg-card/80 backdrop-blur-xl border-border">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex justify-center mb-4 hover:opacity-80 transition-opacity">
              <Logo size="lg" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                ref={emailRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && passwordRef.current?.focus()}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <p>{error}</p>
                    {errorSuggestion === 'signup' && (
                      <Link to="/sign-up" className="block mt-2 text-primary hover:underline font-medium">
                        Create an account
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/sign-up" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
