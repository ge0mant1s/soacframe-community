
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: UserRole
    }
  }

  interface User {
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
  }
}

export interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Device {
  id: string
  name: string
  type: string
  status: string
  endpoint: string
  config: any
  createdAt: Date
  updatedAt: Date
}

export interface Incident {
  id: string
  title: string
  description: string | null
  severity: string
  status: string
  confidence: string
  patternId: string | null
  assignedTo: string | null
  entities: any
  events: any
  timeline: any
  playbooks: any
  createdAt: Date
  updatedAt: Date
}
