import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
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

    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في جلب بيانات الطلاب' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, grade, parentPhone } = body;

    if (!name || !grade) {
      return NextResponse.json({ success: false, error: 'اسم الطالب والمرحلة مطلوبان' }, { status: 400 });
    }

    const teacher = await prisma.teacher.findFirst();
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'لم يتم العثور على حساب المعلمة' }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        teacherId: teacher.id,
        name: name.trim(),
        grade: grade.trim(),
        parentPhone: parentPhone ? parentPhone.trim() : null,
      },
    });

    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ success: false, error: 'فشل إضافة الطالب' }, { status: 500 });
  }
}
