import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LinkStatus } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { answers } = body; // map of questionId -> studentAnswer

    const examLink = await prisma.examLink.findUnique({
      where: { accessCode: code },
      include: {
        attempt: true,
      },
    });

    if (!examLink || examLink.status === LinkStatus.SUBMITTED || examLink.status === LinkStatus.GRADED) {
      return NextResponse.json({ success: false, error: 'لا يمكن حفظ الإجابات' }, { status: 400 });
    }

    // Ensure attempt exists to store draft answers
    let attempt = examLink.attempt;
    if (!attempt) {
      attempt = await prisma.studentAttempt.create({
        data: {
          examLinkId: examLink.id,
        },
      });
    }

    if (answers && typeof answers === 'object') {
      for (const [questionId, studentAnswer] of Object.entries(answers)) {
        await prisma.answer.upsert({
          where: {
            attemptId_questionId: {
              attemptId: attempt.id,
              questionId,
            },
          },
          update: {
            studentAnswer: String(studentAnswer || ''),
          },
          create: {
            attemptId: attempt.id,
            questionId,
            studentAnswer: String(studentAnswer || ''),
          },
        });
      }
    }

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error auto-saving answers:', error);
    return NextResponse.json({ success: false, error: 'فشل حفظ الإجابات' }, { status: 500 });
  }
}
