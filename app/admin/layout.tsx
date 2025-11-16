
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  Sparkles,
  Shield,
  Bell,
  AlertTriangle,
  Database,
  Server,
  BarChart3,
  Workflow,
  TrendingUp,
  Send,
  Package,
  Activity,
  BookOpen,
  HardDrive,
  CreditCard,
  Globe,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['USER', 'ADMIN'] },
  { name: 'Security Dashboard', href: '/admin/security-dashboard', icon: Shield, roles: ['USER', 'ADMIN'] },
  { name: 'AI Hub', href: '/admin/ai-hub', icon: Sparkles, roles: ['USER', 'ADMIN'] },
  
  // Phase 1: Core Security Operations
  { name: 'Alerts', href: '/admin/alerts', icon: Bell, roles: ['USER', 'ADMIN'] },
  { name: 'Incidents', href: '/admin/incidents', icon: AlertTriangle, roles: ['USER', 'ADMIN'] },
  { name: 'Devices', href: '/admin/devices', icon: Server, roles: ['USER', 'ADMIN'] },
  { name: 'Integrations', href: '/admin/integrations', icon: Database, roles: ['USER', 'ADMIN'] },
  
  // Phase 3 Tier 1: Automation & Intelligence
  { name: 'Workflows', href: '/admin/workflows', icon: Workflow, roles: ['USER', 'ADMIN'] },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp, roles: ['USER', 'ADMIN'] },
  { name: 'Notifications', href: '/admin/notifications', icon: Send, roles: ['USER', 'ADMIN'] },
  
  // Phase 3 Tier 2: Intelligence & Integration
  { name: 'Integration Hub', href: '/admin/integrations/connectors', icon: Package, roles: ['USER', 'ADMIN'] },
  { name: 'Threat Intel', href: '/admin/threat-intel/feeds', icon: Shield, roles: ['USER', 'ADMIN'] },
  { name: 'Playbook Library', href: '/admin/workflows/library', icon: BookOpen, roles: ['USER', 'ADMIN'] },
  { name: 'Custom Dashboards', href: '/admin/dashboards/builder', icon: LayoutDashboard, roles: ['USER', 'ADMIN'] },
  
  // Management & Reporting
  { name: 'Reports', href: '/admin/reports', icon: BarChart3, roles: ['USER', 'ADMIN'] },
  { name: 'Activity Audit', href: '/admin/audit/activity', icon: Activity, roles: ['ADMIN'] },
  { name: 'Export/Import', href: '/admin/config/export-import', icon: HardDrive, roles: ['ADMIN'] },
  { name: 'Content', href: '/admin/content', icon: FileText, roles: ['ADMIN'] },
  { name: 'Website Content', href: '/admin/content/website', icon: Globe, roles: ['ADMIN'] },
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard, roles: ['USER', 'ADMIN'] },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.replace('/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isAdmin = (session.user as any)?.role === 'ADMIN'
  const userRole = (session.user as any)?.role || 'USER'
  
  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-border">
          <div className="flex items-center flex-shrink-0 px-4">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                SOaC Platform
              </h1>
              {isAdmin && (
                <p className="text-xs text-muted-foreground mt-0.5">Admin Access</p>
              )}
            </div>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5',
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="px-2 pb-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto focus:outline-none">
        <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
          {/* Page header */}
          <div className="bg-white dark:bg-gray-800 shadow border-b border-border">
            <div className="px-4 sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-8">
              <div className="py-4 md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {session?.user?.name || session?.user?.email?.split('@')[0]}
                        </h2>
                        {isAdmin && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
