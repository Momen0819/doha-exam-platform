import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function getAuthenticatedTeacher(req: NextRequest) {
  const token = req.cookies.get('teacher_auth_token')?.value;

  if (token) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: token },
    });
    if (teacher) return teacher;
  }

  return null;
}
