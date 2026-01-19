import { useState, useRef, useEffect } from 'react'
import { useSignUp } from '@clerk/clerk-react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Logo } from '../components/ui/Logo'

// Password strength calculator
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' }
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' }
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' }
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-green-500' }
  return { score: 5, label: 'Very Strong', color: 'bg-emerald-500' }
}

// Friendly error messages
const getErrorMessage = (error: any): string => {
  const code = error?.errors?.[0]?.code
  const message = error?.errors?.[0]?.message || ''

  if (code === 'form_identifier_exists') {
    return "An account with this email already exists. Try signing in instead."
  }
  if (code === 'form_password_pwned') {
    return "This password has been found in data breaches. Please choose a different one."
  }
  if (code === 'form_password_length_too_short') {
    return "Password must be at least 8 characters long."
  }
  if (code === 'form_code_incorrect') {
    return "That code doesn't match. Please check your email and try again."
  }
  if (message.toLowerCase().includes('too many')) {
    return "Too many attempts. Please wait a moment before trying again."
  }

  return error?.errors?.[0]?.longMessage || message || 'Something went wrong. Please try again.'
}

export function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [errorSuggestion, setErrorSuggestion] = useState<'signin' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [resendCountdown, setResendCountdown] = useState(0)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  const passwordStrength = getPasswordStrength(password)

  // Auto-focus email input on mount
  useEffect(() => {
    if (isLoaded && emailRef.current && !pendingVerification) {
      emailRef.current.focus()
    }
  }, [isLoaded, pendingVerification])

  // Focus first code input when verification starts
  useEffect(() => {
    if (pendingVerification && codeRefs.current[0]) {
      codeRefs.current[0].focus()
    }
  }, [pendingVerification])

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return

    setIsLoading(true)
    setError('')
    setErrorSuggestion(null)

    try {
      // Create sign-up and use the returned object directly
      const result = await signUp.create({
        emailAddress: email,
        password,
      })

      // Use the result object to prepare verification (not the hook's signUp)
      await result.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
      setResendCountdown(60)
    } catch (err: any) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)

      const code = err?.errors?.[0]?.code
      if (code === 'form_identifier_exists') {
        setErrorSuggestion('signin')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.slice(-1)
    if (digit && !/^\d$/.test(digit)) return

    const newCode = [...verificationCode]
    newCode[index] = digit
    setVerificationCode(newCode)

    // Auto-advance to next input
    if (digit && index < 5) {
      codeRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (digit && index === 5) {
      const fullCode = newCode.join('')
      if (fullCode.length === 6) {
        handleVerificationSubmit(fullCode)
      }
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setVerificationCode(paste.split(''))
      handleVerificationSubmit(paste)
    }
  }

  const handleVerificationSubmit = async (code?: string) => {
    if (!isLoaded || !signUp) return

    const finalCode = code || verificationCode.join('')
    if (finalCode.length !== 6) return

    setIsLoading(true)
    setError('')

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: finalCode,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate('/dashboard')
      } else {
        setError('Verification incomplete. Please try again.')
      }
    } catch (err: any) {
      setError(getErrorMessage(err))
      setVerificationCode(['', '', '', '', '', ''])
      codeRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!signUp || resendCountdown > 0) return

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setResendCountdown(60)
      setError('')
      setVerificationCode(['', '', '', '', '', ''])
      codeRefs.current[0]?.focus()
    } catch (err: any) {
      setError(getErrorMessage(err))
    }
  }

  const handleGoogleSignUp = async () => {
    if (!signUp) return
    setIsGoogleLoading(true)
    setError('')

    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
    } catch (err: any) {
      setIsGoogleLoading(false)
      setError('Could not connect to Google. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
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
            <AnimatePresence mode="wait">
              {pendingVerification ? (
                <motion.div
                  key="verification"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="text-2xl font-bold text-white">Check your email</h1>
                  <p className="text-muted-foreground mt-1">
                    We sent a 6-digit code to<br />
                    <span className="text-white font-medium">{email}</span>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1 className="text-2xl font-bold text-white">Create your account</h1>
                  <p className="text-muted-foreground mt-1">Start creating amazing content</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {!pendingVerification ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Google Sign Up */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-6 h-12"
                  onClick={handleGoogleSignUp}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Connecting to Google...
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
                  </div>
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
                        placeholder="Create a strong password"
                        className="w-full px-4 py-3 pr-12 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                        required
                        minLength={8}
                        autoComplete="new-password"
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

                    {/* Password strength indicator */}
                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2"
                      >
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                level <= passwordStrength.score ? passwordStrength.color : 'bg-border'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Password strength: <span className={`${passwordStrength.score >= 3 ? 'text-green-400' : passwordStrength.score >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>{passwordStrength.label}</span>
                        </p>
                      </motion.div>
                    )}
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
                          {errorSuggestion === 'signin' && (
                            <Link to="/sign-in" className="block mt-2 text-primary hover:underline font-medium">
                              Sign in to your account
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={isLoading || !email || !password || password.length < 8}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>

                {/* Sign In Link */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Already have an account?{' '}
                  <Link to="/sign-in" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            ) : (
              /* Verification Form */
              <motion.div
                key="verification"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-6">
                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-center">Enter verification code</label>
                    <div className="flex gap-2 justify-center" onPaste={handleCodePaste}>
                      {verificationCode.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { codeRefs.current[index] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          className="w-12 h-14 text-center text-2xl font-bold rounded-lg bg-background border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                          disabled={isLoading}
                        />
                      ))}
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
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                          {error}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="button"
                    onClick={() => handleVerificationSubmit()}
                    className="w-full h-12"
                    disabled={isLoading || verificationCode.join('').length !== 6}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify Email'
                    )}
                  </Button>

                  {/* Resend code */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
                    {resendCountdown > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Resend in <span className="text-white font-medium">{resendCountdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Resend code
                      </button>
                    )}
                  </div>

                  {/* Change email */}
                  <button
                    type="button"
                    onClick={() => {
                      setPendingVerification(false)
                      setVerificationCode(['', '', '', '', '', ''])
                      setError('')
                    }}
                    className="w-full text-center text-sm text-muted-foreground hover:text-white transition-colors"
                  >
                    Use a different email
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing up, you agree to our{' '}
          <a href="/terms" className="hover:underline">Terms</a>
          {' '}and{' '}
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  )
}
