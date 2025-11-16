
import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Login - SOaC Framework',
  description: 'Sign in to your SOaC Framework account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">SOaC Framework</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your security operations dashboard
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            
            {/* Sign up link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  href="/signup" 
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Phase 1 Notice */}
        <div className="text-center">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            Phase 1: Authentication UI Structure
          </div>
          <p className="mt-2 text-xs text-muted-foreground max-w-sm mx-auto">
            This is the frontend authentication interface. Full backend authentication 
            will be implemented in Phase 2.
          </p>
        </div>
      </div>
    </div>
  )
}
