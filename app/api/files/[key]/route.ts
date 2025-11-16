
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getFileUrl } from '@/lib/s3'

export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Decode the key from URL encoding
    const key = decodeURIComponent(params.key)

    // Generate signed URL
    const url = await getFileUrl(key, 3600) // 1 hour expiry

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error getting file URL:', error)
    return NextResponse.json({ error: 'Failed to get file URL' }, { status: 500 })
  }
}
