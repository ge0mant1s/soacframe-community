
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/workflows/playbook-library - Browse playbook templates
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'downloads';

    const where: any = { isPublic: true };
    if (category && category !== 'all') where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { useCase: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'downloads') orderBy.downloads = 'desc';
    else if (sortBy === 'rating') orderBy.rating = 'desc';
    else if (sortBy === 'recent') orderBy.createdAt = 'desc';

    const templates = await prisma.playbookTemplate.findMany({
      where,
      orderBy,
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching playbook templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/workflows/playbook-library - Create playbook template
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      name,
      description,
      category,
      useCase,
      mitreAttack,
      steps,
      tags,
      complexity,
      estimatedTime,
      isPublic,
    } = data;

    const template = await prisma.playbookTemplate.create({
      data: {
        name,
        description,
        category,
        useCase,
        mitreAttack: mitreAttack || [],
        steps,
        tags: tags || [],
        complexity: complexity || 'medium',
        estimatedTime,
        author: session.user.email!,
        isPublic: isPublic !== false,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating playbook template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
