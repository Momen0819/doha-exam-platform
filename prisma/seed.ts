import { PrismaClient, QuestionType, LinkStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Doha Mostafa Exam Platform...');

  await prisma.answer.deleteMany();
  await prisma.studentAttempt.deleteMany();
  await prisma.examLink.deleteMany();
  await prisma.questionImage.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.student.deleteMany();

  const passwordHash = await bcrypt.hash('P123456', 10);

  // 1. Create Teacher
  const teacher = await prisma.teacher.upsert({
    where: { email: 'doha@dohamostafa.com' },
    update: {
      username: 'doha',
      passwordHash: passwordHash,
    },
    create: {
      name: 'أ/ ضحى مصطفى',
      username: 'doha',
      email: 'doha@dohamostafa.com',
      passwordHash: passwordHash,
    },
  });

  console.log('Teacher created:', teacher.name);

  // 2. Create Students
  const student1 = await prisma.student.create({
    data: {
      teacherId: teacher.id,
      name: 'عمر أحمد محمود',
      grade: 'الصف الرابع الابتدائي',
      parentPhone: '+201012345678',
    },
  });

  const student2 = await prisma.student.create({
    data: {
      teacherId: teacher.id,
      name: 'سارة محمد السيد',
      grade: 'الصف الرابع الابتدائي',
      parentPhone: '+201123456789',
    },
  });

  const student3 = await prisma.student.create({
    data: {
      teacherId: teacher.id,
      name: 'ياسين علي إبراهيم',
      grade: 'الصف الرابع الابتدائي',
      parentPhone: '+201234567890',
    },
  });

  console.log('Students created: Omar, Sara, Yassin');

  // 3. Create Comprehensive Arabic Exam
  const exam = await prisma.exam.create({
    data: {
      teacherId: teacher.id,
      title: 'امتحان اللغة العربية الشامل - شهر أكتوبر',
      grade: 'الصف الرابع الابتدائي',
      durationMins: 30,
      instructions: 'اقرأ الأسئلة بعناية قبل الإجابة، واستمع لقطعة الإملاء بتركيز (يتاح لك الاستماع 3 مرات فقط)، وتأكد من ضبط الحركات والتشكيل في أسئلة الإعراب.',
      totalMarks: 30,
      questions: {
        create: [
          {
            orderIndex: 1,
            type: QuestionType.MCQ,
            promptText: 'ما إعراب كلمة "السَّمَاءُ" في جملة: "السَّمَاءُ صَافِيَةٌ"؟',
            hint: 'تبدأ بها الجملة الاسمية وهي اسم مرفوع',
            marks: 4,
            optionsJson: ['مبتدأ مرفوع وعلامة رفعه الضمة', 'خبر مرفوع وعلامة رفعه الضمة', 'فاعل مرفوع وعلامة رفعه الضمة', 'مفعول به منصوب وعلامة نصبه الفتحة'],
            correctAnswer: 'مبتدأ مرفوع وعلامة رفعه الضمة',
          },
          {
            orderIndex: 2,
            type: QuestionType.BETWEEN_PARENS,
            promptText: 'حضر الطلاب جميعهم (إلى / على / في) المدرسة صباحاً.',
            hint: 'حرف جر يفيد انتهاء الغاية المكانية',
            marks: 3,
            optionsJson: ['إلى', 'على', 'في'],
            correctAnswer: 'إلى',
          },
          {
            orderIndex: 3,
            type: QuestionType.FILL_IN_BLANK,
            promptText: 'الفعل من كلمة "كِتَابَةٌ" في صيغة الماضي هو: [الفراغ]',
            hint: 'فعل ثلاثي ماضٍ',
            marks: 3,
            correctAnswer: 'كَتَبَ',
          },
          {
            orderIndex: 4,
            type: QuestionType.IRAB,
            promptText: 'أعرب الكلمة الملونة: "يَشْرَحُ [المُعَلِّمُ] الدَّرْسَ بِإِخْلاصٍ."',
            hint: 'من قام بالفعل؟',
            marks: 5,
            correctAnswer: 'فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره',
          },
          {
            orderIndex: 5,
            type: QuestionType.DICTATION,
            promptText: 'استمع للتسجيل الصوتي بتركيز واكتب الجملة مضبوطة بالشكل التام:',
            hint: 'انتبه لهمزة القطع وألف الوصل',
            marks: 5,
            correctAnswer: 'العِلْمُ نُورٌ يَهْدِي العُقُولَ إِلَى الحَقِّ',
            audioUrl: '/audio/sample-dictation.mp3',
            maxAudioPlays: 3,
          },
          {
            orderIndex: 6,
            type: QuestionType.ESSAY,
            promptText: 'اكتب فقرة من ثلاثة أسطر تتحدث فيها عن "أهمية القراءة وغذاء العقل" موظفاً علامات الترقيم الصحيحة.',
            hint: 'استخدم النقطة والفصلة والنقطتين الرأسيتين',
            marks: 10,
          },
        ],
      },
    },
  });

  console.log('Exam created:', exam.title);

  // 4. Create Exam Links for students
  const link1 = await prisma.examLink.create({
    data: {
      accessCode: 'demo-omar-101',
      examId: exam.id,
      studentId: student1.id,
      status: LinkStatus.PENDING,
    },
  });

  const link2 = await prisma.examLink.create({
    data: {
      accessCode: 'demo-sara-102',
      examId: exam.id,
      studentId: student2.id,
      status: LinkStatus.IN_PROGRESS,
      startedAt: new Date(Date.now() - 10 * 60 * 1000), // started 10 mins ago
      expiresAt: new Date(Date.now() + 20 * 60 * 1000),
    },
  });

  // Submitted attempt for Yassin
  const link3 = await prisma.examLink.create({
    data: {
      accessCode: 'demo-yassin-103',
      examId: exam.id,
      studentId: student3.id,
      status: LinkStatus.GRADED,
      startedAt: new Date(Date.now() - 40 * 60 * 1000),
      submittedAt: new Date(Date.now() - 15 * 60 * 1000),
      attempt: {
        create: {
          totalScore: 28,
          teacherFeedback: 'ممتاز يا بطل! إجاباتك دقيقة وخطك وإملاؤك رائع، راجع فقط موضع الهمزة في كلمة واحدة.',
          isFeedbackPublished: true,
        },
      },
    },
  });

  console.log('Generated access codes:', {
    omar: link1.accessCode,
    sara: link2.accessCode,
    yassin: link3.accessCode,
  });

  console.log('Seeding completed successfully! ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
