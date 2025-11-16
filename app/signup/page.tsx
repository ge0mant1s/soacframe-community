
import { SignupForm } from '@/components/auth/signup-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Zap, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Sign Up - SOaC Framework',
  description: 'Create your SOaC Framework account',
}

const benefits = [
  'Access to private documentation',
  'Early access to new features',
  'Premium support channels',
  'Custom deployment assistance',
]

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Benefits */}
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-flex items-center space-x-2 group mb-8">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">SOaC Framework</span>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join the Future of
              <span className="block gradient-text">Security Operations</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Get access to advanced features, premium documentation, and direct support 
              from the SOaC Framework team.
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users, value: '2.4k+', label: 'Users' },
                { icon: Zap, value: '24/7', label: 'Support' },
                { icon: Shield, value: '99.9%', label: 'Uptime' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-2">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-lg font-semibold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Sign Up Form */}
          <div className="max-w-md w-full mx-auto">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-semibold">Create Account</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sign up to get started with SOaC Framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignupForm />
                
                {/* Login link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link 
                      href="/login" 
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Phase 1 Notice */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                Phase 1: Authentication UI Structure
              </div>
              <p className="mt-2 text-xs text-muted-foreground max-w-sm mx-auto">
                This is the frontend authentication interface. Full backend authentication 
                and user management will be implemented in Phase 2.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
