import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LinkStatus, QuestionType } from '@prisma/client';
import { compareAnswers } from '@/lib/arabic-helpers';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json().catch(() => ({}));
    const { answers = {} } = body;

    const examLink = await prisma.examLink.findUnique({
      where: { accessCode: code },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
        attempt: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!examLink) {
      return NextResponse.json({ success: false, error: 'الرابط غير موجود' }, { status: 404 });
    }

    if (examLink.status === LinkStatus.SUBMITTED || examLink.status === LinkStatus.GRADED) {
      return NextResponse.json({ success: false, error: 'تم تسليم الامتحان مسبقاً' }, { status: 400 });
    }

    // Ensure attempt exists
    let attempt = examLink.attempt;
    if (!attempt) {
      attempt = await prisma.studentAttempt.create({
        data: {
          examLinkId: examLink.id,
        },
        include: { answers: true },
      });
    }

    let calculatedScore = 0;
    let hasSubjectiveQuestions = false;

    for (const question of examLink.exam.questions) {
      const studentAns = String(answers[question.id] || '').trim();
      let scoreAwarded = 0;
      let isAutoGraded = false;
      let teacherNote = null;

      if (
        question.type === QuestionType.MCQ ||
        question.type === QuestionType.BETWEEN_PARENS ||
        question.type === QuestionType.FILL_IN_BLANK
      ) {
        isAutoGraded = true;
        if (question.correctAnswer) {
          const comp = compareAnswers(studentAns, question.correctAnswer, false);
          if (comp.isMatch) {
            scoreAwarded = question.marks;
          } else {
            scoreAwarded = 0;
            teacherNote = `الإجابة النموذجية هي: "${question.correctAnswer}"`;
          }
        }
      } else if (question.type === QuestionType.DICTATION) {
        isAutoGraded = true;
        if (question.correctAnswer) {
          const comp = compareAnswers(studentAns, question.correctAnswer, false);
          if (comp.isMatch) {
            scoreAwarded = question.marks;
          } else if (comp.accuracyPercent >= 70) {
            scoreAwarded = Math.round((question.marks * 0.7) * 10) / 10;
            teacherNote = `تحتاج مراجعة رسم بعض الحروف والتشكيل. النموذج: "${question.correctAnswer}"`;
          } else {
            scoreAwarded = 0;
            teacherNote = `القطعة الإملائية الصحيحة: "${question.correctAnswer}"`;
          }
        }
      } else {
        // ESSAY or IRAB: Needs manual teacher review
        hasSubjectiveQuestions = true;
        isAutoGraded = false;
        scoreAwarded = 0; // Pending teacher evaluation
      }

      calculatedScore += scoreAwarded;

      await prisma.answer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: question.id,
          },
        },
        update: {
          studentAnswer: studentAns,
          scoreAwarded: isAutoGraded ? scoreAwarded : undefined,
          isAutoGraded,
          teacherNote,
        },
        create: {
          attemptId: attempt.id,
          questionId: question.id,
          studentAnswer: studentAns,
          scoreAwarded: isAutoGraded ? scoreAwarded : null,
          isAutoGraded,
          teacherNote,
        },
      });
    }

    const finalStatus = hasSubjectiveQuestions ? LinkStatus.SUBMITTED : LinkStatus.GRADED;

    await prisma.studentAttempt.update({
      where: { id: attempt.id },
      data: {
        totalScore: calculatedScore,
        isFeedbackPublished: !hasSubjectiveQuestions, // Auto-publish if purely objective
      },
    });

    const updatedLink = await prisma.examLink.update({
      where: { id: examLink.id },
      data: {
        status: finalStatus,
        submittedAt: new Date(),
      },
      include: {
        attempt: {
          include: {
            answers: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تسليم الامتحان بنجاح!',
      attemptId: attempt.id,
      status: finalStatus,
      score: calculatedScore,
      totalScore: calculatedScore,
      totalMarks: examLink.exam.totalMarks,
      hasSubjectiveQuestions,
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json({ success: false, error: 'فشل تسليم الامتحان' }, { status: 500 });
  }
}
