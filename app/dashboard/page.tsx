
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata = {
  title: 'Dashboard - SOaC Framework',
  description: 'Security operations dashboard and control center',
}

export default async function DashboardPage() {
  // Redirect to the new admin dashboard
  // The old /dashboard is deprecated - all users now use /admin
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/admin')
  } else {
    redirect('/login')
  }
}
