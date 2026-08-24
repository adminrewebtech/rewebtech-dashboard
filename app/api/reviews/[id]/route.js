import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request, { params }) {
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
