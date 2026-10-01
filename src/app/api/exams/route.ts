import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuestionType } from '@prisma/client';

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            questions: true,
            links: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء جلب الامتحانات' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, grade, durationMins, instructions, questions } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json({ success: false, error: 'عنوان الاختبار مطلوب' }, { status: 400 });
    }

    // Get default teacher
    const teacher = await prisma.teacher.findFirst();
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'لم يتم العثور على حساب المعلمة' }, { status: 400 });
    }

    const calculatedTotalMarks = Array.isArray(questions)
      ? questions.reduce((sum: number, q: { marks?: number }) => sum + Number(q.marks || 0), 0)
      : 0;

    const newExam = await prisma.exam.create({
      data: {
        teacherId: teacher.id,
        title,
        grade,
        durationMins: Number(durationMins) || 30,
        instructions: instructions || 'أجب عن جميع الأسئلة التالية بتركيز وعناية.',
        totalMarks: calculatedTotalMarks,
        questions: {
          create: (questions || []).map((q: any, idx: number) => ({
            orderIndex: idx + 1,
            type: q.type as QuestionType,
            promptText: q.promptText,
            hint: q.hint || null,
            marks: Number(q.marks) || 1,
            optionsJson: q.optionsJson ? (typeof q.optionsJson === 'string' ? JSON.parse(q.optionsJson) : q.optionsJson) : null,
            correctAnswer: q.correctAnswer || null,
            audioUrl: q.audioUrl || null,
            maxAudioPlays: Number(q.maxAudioPlays) || 3,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({ success: true, exam: newExam }, { status: 201 });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ success: false, error: 'فشل إنشاء الامتحان' }, { status: 500 });
  }
}
