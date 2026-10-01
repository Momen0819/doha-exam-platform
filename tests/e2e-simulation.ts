import { prisma } from '../src/lib/prisma';
import { normalizeArabic, compareAnswers, calculateLevenshteinSimilarity } from '../src/lib/arabic-helpers';
import { generateExamLinkWhatsAppUrl, generateResultWhatsAppUrl } from '../src/lib/whatsapp';

interface TestResult {
  suite: string;
  testName: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];

function record(suite: string, testName: string, passed: boolean, details?: string) {
  results.push({
    suite,
    testName,
    status: passed ? 'PASS' : 'FAIL',
    details: details || (passed ? 'Verified successfully' : 'Assertion failed')
  });
  const symbol = passed ? '✅' : '❌';
  console.log(`${symbol} [${suite}] ${testName}${details ? ` -> ${details}` : ''}`);
}

const BASE_URL = 'http://localhost:3001';

async function runE2ETests() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  // Reset demo-sara-102 state for deterministic test run
  const saraLink = await prisma.examLink.findUnique({
    where: { accessCode: 'demo-sara-102' },
    include: { attempt: true }
  });
  if (saraLink) {
    if (saraLink.attempt) {
      await prisma.answer.deleteMany({ where: { attemptId: saraLink.attempt.id } });
      await prisma.studentAttempt.delete({ where: { id: saraLink.attempt.id } });
    }
    await prisma.examLink.update({
      where: { id: saraLink.id },
      data: { status: 'PENDING', startedAt: null, submittedAt: null }
    });
  }

  // ----------------------------------------------------
  // SUITE 1: HTTP API Health & Static Route Accessibility
  // ----------------------------------------------------
  const pagesToTest = [
    { path: '/', name: 'Landing Page' },
    { path: '/dashboard', name: 'Teacher Dashboard Home' },
    { path: '/dashboard/exams', name: 'Teacher Exams Management' },
    { path: '/dashboard/students', name: 'Student Roster' },
    { path: '/dashboard/grading', name: 'Grading Room' },
    { path: '/exam/demo-sara-102', name: 'Student Exam Interface' },
    { path: '/exam/demo-sara-102/result', name: 'Student Result Certificate' }
  ];

  for (const page of pagesToTest) {
    try {
      const res = await fetch(`${BASE_URL}${page.path}`);
      record('1. UI & Routes HTTP', `Route ${page.path} (${page.name})`, res.status === 200, `HTTP status ${res.status}`);
    } catch (err: any) {
      record('1. UI & Routes HTTP', `Route ${page.path} (${page.name})`, false, err.message);
    }
  }

  // ----------------------------------------------------
  // SUITE 2: Student Exam Full Lifecycle & Auto-Grading
  // ----------------------------------------------------
  let attemptId = '';
  try {
    // 2.1 Fetch Exam by Access Code
    const linkRes = await fetch(`${BASE_URL}/api/exam/demo-sara-102`);
    const linkData = await linkRes.json();
    record('2. Student E2E Lifecycle', 'Fetch Exam Link (demo-sara-102)', linkData.success === true && !!linkData.examLink.student.name, `Student: ${linkData.examLink?.student?.name}`);

    const examQuestions = linkData.examLink.exam.questions;
    record('2. Student E2E Lifecycle', 'Verify 6 Diverse Question Types Loaded', examQuestions.length === 6, `Count: ${examQuestions.length}`);

    // 2.2 Start Exam Session
    const startRes = await fetch(`${BASE_URL}/api/exam/demo-sara-102/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceInfo: 'iPhone 15 Pro / Safari 18 Mobile' })
    });
    const startData = await startRes.json();
    record('2. Student E2E Lifecycle', 'Start Exam Attempt & Lock Timer', startData.success === true && startData.remainingSeconds > 0, `Remaining: ${startData.remainingSeconds}s`);

    // 2.3 Intermediate Draft Auto-Save
    const saveRes = await fetch(`${BASE_URL}/api/exam/demo-sara-102/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: {
          [examQuestions[0].id]: 'مبتدأ مرفوع وعلامة رفعه الضمة'
        },
        tabSwitchCount: 1
      })
    });
    const saveData = await saveRes.json();
    record('2. Student E2E Lifecycle', 'Auto-Save Intermediate Draft & Anti-Cheat Sync', saveData.success === true);

    // 2.4 Submit Complete Exam
    const fullAnswers = {
      [examQuestions[0].id]: 'مبتدأ مرفوع وعلامة رفعه الضمة', // MCQ: 4 pts
      [examQuestions[1].id]: 'إلى',                          // BETWEEN_PARENS: 3 pts
      [examQuestions[2].id]: 'كتب',                           // FILL_IN_BLANK: 3 pts
      [examQuestions[3].id]: 'فاعل مرفوع بالضمة الظاهرة',     // IRAB: 5 pts (subjective)
      [examQuestions[4].id]: 'العلم نور يهدي العقول إلى الحق والصواب', // DICTATION: 5 pts (auto)
      [examQuestions[5].id]: 'القراءة مفتاح المعرفة وتغذي العقل بالعلوم النافعة.' // ESSAY: 10 pts (subjective)
    };

    const submitRes = await fetch(`${BASE_URL}/api/exam/demo-sara-102/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: fullAnswers,
        timeSpentSeconds: 420
      })
    });
    const submitData = await submitRes.json();
    attemptId = submitData.attemptId;
    record('2. Student E2E Lifecycle', 'Submit Final Exam & Trigger Auto-Grading Engine', submitData.success === true, `Objective Score Awarded: ${submitData.score}/15`);

    // Verify DB State
    const dbAttempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: { answers: true, examLink: true }
    });
    record('2. Student E2E Lifecycle', 'Database State Confirmation', dbAttempt?.examLink.status === 'SUBMITTED' && dbAttempt?.totalScore === 15, `DB Link Status: ${dbAttempt?.examLink.status}, TotalScore: ${dbAttempt?.totalScore}`);
  } catch (err: any) {
    record('2. Student E2E Lifecycle', 'Exam Flow Exception', false, err.message);
  }

  // ----------------------------------------------------
  // SUITE 3: Teacher Portal & Manual Grading Room E2E
  // ----------------------------------------------------
  try {
    // 3.1 Fetch Grading Queue
    const gradingRes = await fetch(`${BASE_URL}/api/grading/${attemptId}`);
    const gradingData = await gradingRes.json();
    record('3. Teacher Grading Room', 'Retrieve Submitted Exam for Review', gradingData.success === true && gradingData.attempt.answers.length === 6, `Answers in queue: ${gradingData.attempt?.answers?.length}`);

    // 3.2 Grade Subjective Questions (Irab + Essay)
    const irabQ = gradingData.attempt.examLink.exam.questions.find((q: any) => q.type === 'IRAB');
    const essayQ = gradingData.attempt.examLink.exam.questions.find((q: any) => q.type === 'ESSAY');

    const manualGradingRes = await fetch(`${BASE_URL}/api/grading/${attemptId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionScores: {
          [irabQ.id]: { score: 5, note: 'إعراب نموذجي ومتقن يا سارة' },
          [essayQ.id]: { score: 10, note: 'تعبير رائع واستخدام متميز لعلامات الترقيم' }
        },
        teacherFeedback: 'بارك الله فيكِ يا سارة، إجابات متميزة وإتقان رائع لقواعد النحو والإملاء! نفتخر بكِ دائماً.',
        publishFeedback: true
      })
    });
    const manualData = await manualGradingRes.json();
    record('3. Teacher Grading Room', 'Finalize Manual Grading & Total Score Calculation', manualData.success === true && manualData.totalScore === 30, `Total Final Score: ${manualData.totalScore}/30 (100%)`);

    // Verify Graded Attempt
    const finalAttempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: { examLink: true }
    });
    record('3. Teacher Grading Room', 'Attempt Status Updated to GRADED', finalAttempt?.examLink.status === 'GRADED' && finalAttempt?.totalScore === 30, `Final DB Score: ${finalAttempt?.totalScore}/30`);
  } catch (err: any) {
    record('3. Teacher Grading Room', 'Grading Room Exception', false, err.message);
  }

  // ----------------------------------------------------
  // SUITE 4: WhatsApp Integration & Parent Messaging E2E
  // ----------------------------------------------------
  try {
    const parentPhone = '01122334455';
    const studentName = 'سارة ياسر إبراهيم';
    const examTitle = 'اختبار منتصف الفصل الدراسي الأول في قواعد النحو والإملاء';
    const waResultUrl = generateResultWhatsAppUrl(
      parentPhone,
      studentName,
      examTitle,
      30,
      30,
      'بارك الله فيكِ يا سارة، إجابات متميزة وإتقان رائع لقواعد النحو والإملاء!',
      'demo-sara-102',
      'https://doha-exams.vercel.app'
    );

    const hasCorrectPhone = waResultUrl.includes('phone=201122334455') || waResultUrl.includes('/201122334455');
    const hasStudentName = waResultUrl.includes(encodeURIComponent(studentName));
    const hasPerfectScore = waResultUrl.includes(encodeURIComponent('30 من 30'));
    const hasAppreciation = waResultUrl.includes(encodeURIComponent('ممتاز جداً'));

    record('4. WhatsApp Notifications', 'International Phone Number Auto-Prefix (201122334455)', hasCorrectPhone);
    record('4. WhatsApp Notifications', 'Parent Result Card Message Content', hasStudentName && hasPerfectScore && hasAppreciation, 'Includes badge, score, link and feedback');
  } catch (err: any) {
    record('4. WhatsApp Notifications', 'WhatsApp Formatting Exception', false, err.message);
  }

  // ----------------------------------------------------
  // SUITE 5: Arabic NLP & Tolerance Logic E2E
  // ----------------------------------------------------
  try {
    // Hamza normalization
    const hamza1 = normalizeArabic('أحمد');
    const hamza2 = normalizeArabic('إحمد');
    const hamza3 = normalizeArabic('احمد');
    record('5. Arabic NLP Engine', 'Alef Hamza Normalization (أ = إ = ا)', hamza1 === hamza2 && hamza2 === hamza3);

    // Taa Marbuta & Haa
    const taa1 = normalizeArabic('مدرسة');
    const taa2 = normalizeArabic('مدرسه');
    record('5. Arabic NLP Engine', 'Taa Marbuta / Haa Normalization (ة = ه)', taa1 === taa2);

    // Alef Maksura & Yaa
    const yaa1 = normalizeArabic('علي');
    const yaa2 = normalizeArabic('على');
    record('5. Arabic NLP Engine', 'Yaa / Alef Maksura Normalization (ي = ى)', yaa1 === yaa2);

    // Tashkeel Comparison Tolerance
    const exact1 = compareAnswers('العِلْمُ نُورٌ', 'العِلْمُ نُورٌ', true);
    record('5. Arabic NLP Engine', 'Exact Tashkeel Match (100%)', exact1.isMatch && exact1.accuracyPercent === 100);

    const minorMismatch = compareAnswers('العَلْمُ نُورٌ', 'العِلْمُ نُورٌ', true);
    record('5. Arabic NLP Engine', 'Minor Tashkeel Difference Detection (>80%)', minorMismatch.accuracyPercent >= 80);

    // Levenshtein Similarity on Dictation
    const sim = calculateLevenshteinSimilarity('العلم نور يهدي العقول', 'العلم نور يهدى العقول');
    record('5. Arabic NLP Engine', 'Levenshtein Dictation Similarity (>90%)', sim >= 95, `Calculated: ${sim.toFixed(1)}%`);
  } catch (err: any) {
    record('5. Arabic NLP Engine', 'NLP Exception', false, err.message);
  }

  // ----------------------------------------------------
  // SUITE 6: Security & Validation Edge Cases
  // ----------------------------------------------------
  try {
    // 6.1 Invalid Access Code
    const invalidRes = await fetch(`${BASE_URL}/api/exam/invalid-code-999`);
    record('6. Security & Edge Cases', 'Invalid Link Code Returns 404', invalidRes.status === 404);

    // 6.2 Exam Creation Validation (Missing title)
    const badExamRes = await fetch(`${BASE_URL}/api/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'No title provided' })
    });
    record('6. Security & Edge Cases', 'Exam Creation Validation (Rejects Missing Title)', badExamRes.status === 400);
  } catch (err: any) {
    record('6. Security & Edge Cases', 'Security Test Exception', false, err.message);
  }

  // ----------------------------------------------------
  // SUMMARY REPORT
  // ----------------------------------------------------
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('\n====================================================');
  console.log(`📊 FINAL TEST REPORT: ${passed}/${total} TESTS PASSED (${failed} FAILED)`);
  console.log('====================================================');

  if (failed > 0) {
    console.error(`❌ Suite failed with ${failed} failing assertions.`);
    process.exit(1);
  } else {
    console.log('🎉 100% OF ALL END-TO-END SUITES PASSED FLAWLESSLY!');
    process.exit(0);
  }
}

runE2ETests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
