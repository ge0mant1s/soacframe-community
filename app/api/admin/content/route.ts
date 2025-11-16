
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET all content
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    const contents = await prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(contents)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

// POST new content
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await req.json()

    const content = await prisma.content.create({
      data: {
        title: body.title,
        slug: body.slug,
        type: body.type,
        status: body.status || 'DRAFT',
        content: body.content,
        excerpt: body.excerpt,
        featuredImage: body.featuredImage,
        gallery: body.gallery,
        files: body.files,
        metadata: body.metadata,
        authorId: session.user.id,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
      },
    })

    return NextResponse.json(content, { status: 201 })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
  }
}
