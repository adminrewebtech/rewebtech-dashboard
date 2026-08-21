import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (typeof body.featured !== 'boolean') {
    return NextResponse.json({ error: 'featured must be a boolean' }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { featured: body.featured },
  });

  return NextResponse.json({ success: true, data: updated });
}
