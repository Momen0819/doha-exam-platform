import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LinkStatus } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const examLink = await prisma.examLink.findUnique({
      where: { accessCode: code },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            grade: true,
          },
        },
        exam: {
          include: {
            teacher: {
              select: { name: true },
            },
            questions: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                orderIndex: true,
                type: true,
                promptText: true,
                hint: true,
                marks: true,
                optionsJson: true,
                audioUrl: true,
                maxAudioPlays: true,
                images: true,
                // Do NOT expose correctAnswer to client during active exam
              },
            },
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
      return NextResponse.json({ success: false, error: 'رابط الامتحان غير صحيح أو غير موجود' }, { status: 404 });
    }

    // Check if expired
    let isExpired = false;
    let remainingSeconds = examLink.exam.durationMins * 60;

    if (examLink.startedAt && examLink.expiresAt) {
      const now = new Date();
      if (now > examLink.expiresAt) {
        isExpired = true;
        if (examLink.status === LinkStatus.IN_PROGRESS) {
          await prisma.examLink.update({
            where: { id: examLink.id },
            data: { status: LinkStatus.EXPIRED },
          });
        }
      } else {
        remainingSeconds = Math.max(0, Math.floor((examLink.expiresAt.getTime() - now.getTime()) / 1000));
      }
    }

    return NextResponse.json({
      success: true,
      examLink: {
        id: examLink.id,
        accessCode: examLink.accessCode,
        status: examLink.status,
        startedAt: examLink.startedAt,
        expiresAt: examLink.expiresAt,
        submittedAt: examLink.submittedAt,
        isExpired,
        remainingSeconds,
        student: examLink.student,
        exam: examLink.exam,
        attempt: examLink.attempt,
      },
    });
  } catch (error) {
    console.error('Error fetching student exam link:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في جلب بيانات الامتحان' }, { status: 500 });
  }
}
