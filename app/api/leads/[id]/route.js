import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const ALLOWED_STATUSES = ['new', 'contacted', 'won', 'lost'];

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const data = {};

  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    data.status = body.status;
  }

  if (body.notes !== undefined) {
    data.notes = body.notes;
  }

  const updated = await prisma.contact.update({
    where: { id },
    data,
  });

  return NextResponse.json({ success: true, data: updated });
}
