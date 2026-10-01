import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedTeacher } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const teacher = await getAuthenticatedTeacher(req);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك، يرجى تسجيل الدخول' }, { status: 401 });
    }

    const students = await prisma.student.findMany({
      where: { teacherId: teacher.id },
      orderBy: { name: 'asc' },
      include: {
        examLinks: {
          include: {
            exam: true,
            attempt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, students, data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في جلب بيانات الطلاب' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const teacher = await getAuthenticatedTeacher(req);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'غير مصرح لك، يرجى تسجيل الدخول' }, { status: 401 });
    }

    const body = await req.json();
    const { name, grade, gradeLevel, parentPhone } = body;
    const studentGrade = grade || gradeLevel;

    if (!name || !studentGrade) {
      return NextResponse.json({ success: false, error: 'اسم الطالب والمرحلة مطلوبان' }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        teacherId: teacher.id,
        name: name.trim(),
        grade: studentGrade.trim(),
        parentPhone: parentPhone ? parentPhone.trim() : null,
      },
    });

    return NextResponse.json({ success: true, student, data: student }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ success: false, error: 'فشل إضافة الطالب' }, { status: 500 });
  }
}
