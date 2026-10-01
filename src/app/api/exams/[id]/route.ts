import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedTeacher } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await getAuthenticatedTeacher(req);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك، يرجى تسجيل الدخول' }, { status: 401 });
    }

    const { id } = await params;
    const exam = await prisma.exam.findFirst({
      where: { id, teacherId: teacher.id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { images: true },
        },
        links: {
          include: {
            student: true,
            attempt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ success: false, error: 'الامتحان غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error('Error fetching exam details:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في جلب بيانات الامتحان' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await getAuthenticatedTeacher(req);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك، يرجى تسجيل الدخول' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.exam.deleteMany({
      where: { id, teacherId: teacher.id },
    });

    return NextResponse.json({ success: true, message: 'تم حذف الامتحان بنجاح' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json({ success: false, error: 'فشل حذف الامتحان' }, { status: 500 });
  }
}
