import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LinkStatus } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json().catch(() => ({}));
    const { fingerprint } = body;

    const examLink = await prisma.examLink.findUnique({
      where: { accessCode: code },
      include: { exam: true },
    });

    if (!examLink) {
      return NextResponse.json({ success: false, error: 'الرابط غير صالح' }, { status: 404 });
    }

    if (examLink.status === LinkStatus.SUBMITTED || examLink.status === LinkStatus.GRADED) {
      return NextResponse.json({ success: false, error: 'تم تسليم هذا الامتحان مسبقاً' }, { status: 400 });
    }

    // If not started yet, initialize start and expiry
    if (!examLink.startedAt) {
      const startedAt = new Date();
      const expiresAt = new Date(startedAt.getTime() + examLink.exam.durationMins * 60 * 1000);

      const updated = await prisma.examLink.update({
        where: { id: examLink.id },
        data: {
          status: LinkStatus.IN_PROGRESS,
          startedAt,
          expiresAt,
          deviceFingerprint: fingerprint || 'web-browser',
        },
      });

      return NextResponse.json({
        success: true,
        startedAt: updated.startedAt,
        expiresAt: updated.expiresAt,
        remainingSeconds: examLink.exam.durationMins * 60,
      });
    }

    // Already in progress, return current expiry
    const now = new Date();
    const remainingSeconds = examLink.expiresAt
      ? Math.max(0, Math.floor((examLink.expiresAt.getTime() - now.getTime()) / 1000))
      : 0;

    return NextResponse.json({
      success: true,
      startedAt: examLink.startedAt,
      expiresAt: examLink.expiresAt,
      remainingSeconds,
    });
  } catch (error) {
    console.error('Error starting exam:', error);
    return NextResponse.json({ success: false, error: 'فشل بدء الامتحان' }, { status: 500 });
  }
}
