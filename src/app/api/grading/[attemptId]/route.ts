import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LinkStatus } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        examLink: {
          include: {
            student: true,
            exam: {
              include: {
                questions: {
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ success: false, error: 'محاولة الطالب غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    console.error('Error fetching attempt for grading:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في جلب بيانات المحاولة' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await req.json();
    const { questionScores, teacherFeedback, publishFeedback } = body;
    // questionScores: { [questionId: string]: { score: number, note?: string } }

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        examLink: true,
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ success: false, error: 'محاولة الطالب غير موجودة' }, { status: 404 });
    }

    // Update each answer score & teacher note
    if (questionScores && typeof questionScores === 'object') {
      for (const [qId, data] of Object.entries(questionScores as Record<string, { score: number; note?: string }>)) {
        const score = Number(data.score) || 0;

        await prisma.answer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: qId,
            },
          },
          update: {
            scoreAwarded: score,
            teacherNote: data.note || null,
          },
          create: {
            attemptId,
            questionId: qId,
            studentAnswer: '',
            scoreAwarded: score,
            teacherNote: data.note || null,
          },
        });
      }
    }

    // Calculate total score from ALL answers
    const allAnswers = await prisma.answer.findMany({
      where: { attemptId },
    });
    const calculatedTotal = allAnswers.reduce((sum, ans) => sum + (ans.scoreAwarded || 0), 0);

    // Update studentAttempt
    const updatedAttempt = await prisma.studentAttempt.update({
      where: { id: attemptId },
      data: {
        totalScore: calculatedTotal,
        teacherFeedback: teacherFeedback || attempt.teacherFeedback,
        isFeedbackPublished: publishFeedback !== undefined ? Boolean(publishFeedback) : true,
      },
    });

    // Mark link as GRADED
    await prisma.examLink.update({
      where: { id: attempt.examLinkId },
      data: {
        status: LinkStatus.GRADED,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حفظ واعتماد التقييم بنجاح!',
      attempt: updatedAttempt,
      totalScore: calculatedTotal,
    });
  } catch (error) {
    console.error('Error grading attempt:', error);
    return NextResponse.json({ success: false, error: 'فشل حفظ التقييم' }, { status: 500 });
  }
}
