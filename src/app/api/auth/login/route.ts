import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال اسم المستخدم وكلمة المرور' },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();

    // Find teacher by username or email
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { username: cleanIdentifier },
          { email: cleanIdentifier },
          { email: { startsWith: cleanIdentifier } },
        ],
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'بيانات الدخول غير صحيحة، تأكد من اسم المستخدم' },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, teacher.passwordHash);

    // Fallback for mock/plain testing if any
    const isDirectMatch = teacher.passwordHash === password;

    if (!isValid && !isDirectMatch) {
      return NextResponse.json(
        { success: false, error: 'كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Create session cookie response
    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: teacher.id,
        name: teacher.name,
        username: teacher.username,
        email: teacher.email,
      },
    });

    // Set secure auth cookie
    response.cookies.set('teacher_auth_token', teacher.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم أثناء تسجيل الدخول: ' + String(error) },
      { status: 500 }
    );
  }
}
