import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LinkStatus } from '@prisma/client';
import { getAuthenticatedTeacher } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const teacher = await getAuthenticatedTeacher(req);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك، يرجى تسجيل الدخول' }, { status: 401 });
    }

    const [totalExams, totalStudents, totalLinks, completedAttempts, recentAttempts] = await Promise.all([
      prisma.exam.count({ where: { teacherId: teacher.id } }),
      prisma.student.count({ where: { teacherId: teacher.id } }),
      prisma.examLink.count({ where: { exam: { teacherId: teacher.id } } }),
      prisma.studentAttempt.count({
        where: {
          examLink: {
            exam: { teacherId: teacher.id },
            status: { in: [LinkStatus.SUBMITTED, LinkStatus.GRADED] },
          },
        },
      }),
      prisma.studentAttempt.findMany({
        where: {
          examLink: {
            exam: { teacherId: teacher.id },
          },
        },
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
        examLink: {
          exam: { teacherId: teacher.id },
          status: LinkStatus.GRADED,
        },
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

    const pendingGrading = await prisma.examLink.count({
      where: {
        exam: { teacherId: teacher.id },
        status: LinkStatus.SUBMITTED,
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalExams,
        totalStudents,
        totalLinks,
        completedAttempts,
        avgPercentage,
        pendingGrading,
      },
      recentAttempts,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في جلب الإحصائيات' }, { status: 500 });
  }
}
