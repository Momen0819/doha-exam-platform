import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LinkStatus } from '@prisma/client';
import { getAuthenticatedTeacher } from '@/lib/auth';

function generateShortCode(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const teacher = await getAuthenticatedTeacher(req);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك، يرجى تسجيل الدخول' }, { status: 401 });
    }

    const body = await req.json();
    const { examId, studentIds } = body;

    if (!examId || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ success: false, error: 'يجب اختيار الامتحان والطلاب' }, { status: 400 });
    }

    const createdLinks = [];

    for (const studentId of studentIds) {
      // Check if existing link exists for this exam and student
      let link = await prisma.examLink.findFirst({
        where: { examId, studentId },
      });

      if (!link) {
        let code = generateShortCode();
        // ensure uniqueness
        let existingCode = await prisma.examLink.findUnique({ where: { accessCode: code } });
        while (existingCode) {
          code = generateShortCode();
          existingCode = await prisma.examLink.findUnique({ where: { accessCode: code } });
        }

        link = await prisma.examLink.create({
          data: {
            accessCode: code,
            examId,
            studentId,
            status: LinkStatus.PENDING,
          },
        });
      }

      createdLinks.push(link);
    }

    return NextResponse.json({ success: true, links: createdLinks });
  } catch (error) {
    console.error('Error generating links:', error);
    return NextResponse.json({ success: false, error: 'فشل توليد روابط الامتحان' }, { status: 500 });
  }
}
