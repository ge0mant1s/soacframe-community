
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - List all website content or filter by section
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const where = section ? { section } : {};
    
    const contents = await prisma.websiteContent.findMany({
      where,
      orderBy: [
        { section: 'asc' },
        { order: 'asc' },
      ],
    });

    return NextResponse.json({ contents });
  } catch (error: any) {
    console.error('Error fetching website content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new website content
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { section, contentKey, contentType, value, jsonValue, order, isVisible, metadata } = body;

    if (!section || !contentKey || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: section, contentKey, contentType' },
        { status: 400 }
      );
    }

    const content = await prisma.websiteContent.create({
      data: {
        section,
        contentKey,
        contentType,
        value,
        jsonValue,
        order: order ?? 0,
        isVisible: isVisible ?? true,
        metadata,
      },
    });

    return NextResponse.json({ content }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating website content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update website content
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, section, contentKey, contentType, value, jsonValue, order, isVisible, metadata } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    const updateData: any = {};
    if (section !== undefined) updateData.section = section;
    if (contentKey !== undefined) updateData.contentKey = contentKey;
    if (contentType !== undefined) updateData.contentType = contentType;
    if (value !== undefined) updateData.value = value;
    if (jsonValue !== undefined) updateData.jsonValue = jsonValue;
    if (order !== undefined) updateData.order = order;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (metadata !== undefined) updateData.metadata = metadata;

    const content = await prisma.websiteContent.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Error updating website content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete website content
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
    }

    await prisma.websiteContent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting website content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
