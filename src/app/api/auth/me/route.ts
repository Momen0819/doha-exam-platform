import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('teacher_auth_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: token },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: teacher,
    });
  } catch (error) {
    console.error('Error in auth me:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
