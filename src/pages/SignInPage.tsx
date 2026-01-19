import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/ui/Logo'

export function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center hover:opacity-80 transition-opacity">
            <Logo size="lg" />
          </Link>
        </div>

        {/* Clerk SignIn Component */}
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-card/80 backdrop-blur-xl border border-border shadow-xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-muted-foreground',
              formFieldLabel: 'text-white',
              formFieldInput: 'bg-background border-border text-white',
              formButtonPrimary: 'bg-primary hover:bg-primary/90',
              footerActionLink: 'text-primary hover:text-primary/80',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-primary',
              formFieldInputShowPasswordButton: 'text-muted-foreground hover:text-white',
              dividerLine: 'bg-border',
              dividerText: 'text-muted-foreground',
              socialButtonsBlockButton: 'border-border hover:bg-muted',
              socialButtonsBlockButtonText: 'text-white',
            }
          }}
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
