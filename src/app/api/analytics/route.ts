import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LinkStatus } from '@prisma/client';

export async function GET() {
  try {
    const [totalExams, totalStudents, totalLinks, completedAttempts, recentAttempts] = await Promise.all([
      prisma.exam.count(),
      prisma.student.count(),
      prisma.examLink.count(),
      prisma.studentAttempt.count({
        where: {
          examLink: {
            status: { in: [LinkStatus.SUBMITTED, LinkStatus.GRADED] },
          },
        },
      }),
      prisma.studentAttempt.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          examLink: {
            include: {
              student: true,
              exam: true,
            },
          },
        },
      }),
    ]);

    // Calculate average score across graded attempts
    const gradedAttempts = await prisma.studentAttempt.findMany({
      where: {
        examLink: { status: LinkStatus.GRADED },
        totalScore: { not: null },
      },
      include: {
        examLink: {
          include: { exam: true },
        },
      },
    });

    let avgPercentage = 0;
    if (gradedAttempts.length > 0) {
      const sumPercentages = gradedAttempts.reduce((acc, att) => {
        const total = att.examLink.exam.totalMarks || 1;
        return acc + ((att.totalScore || 0) / total) * 100;
      }, 0);
      avgPercentage = Math.round(sumPercentages / gradedAttempts.length);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalExams,
        totalStudents,
        totalLinks,
        completedAttempts,
        avgPercentage,
        pendingGrading: await prisma.examLink.count({ where: { status: LinkStatus.SUBMITTED } }),
      },
      recentAttempts,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في جلب الإحصائيات' }, { status: 500 });
  }
}
