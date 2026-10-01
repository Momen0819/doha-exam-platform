import { compareAnswers, removeTashkeel, normalizeArabic, calculateLevenshteinSimilarity } from './src/lib/arabic-helpers';
import { generateExamLinkWhatsAppUrl, generateResultWhatsAppUrl } from './src/lib/whatsapp';
import { formatMinutes } from './src/lib/utils';
import { prisma } from './src/lib/prisma';

async function runTests() {
  console.log('🧪 ===============================================');
  console.log('🧪 Starting Doha Mostafa Exam Platform Test Suite');
  console.log('🧪 ===============================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // --- 1. Arabic Tashkeel & Normalization Tests ---
  console.log('\n--- 1. Arabic Normalization & Tashkeel Tests ---');
  assert(removeTashkeel('مُعَلِّمٌ') === 'معلم', 'Remove tashkeel from مُعَلِّمٌ');
  assert(removeTashkeel('السَّمَاءُ صَافِيَةٌ') === 'السماء صافية', 'Remove tashkeel from sentence');
  assert(normalizeArabic('أحمد') === normalizeArabic('احمد'), 'Normalize Alef Hamza: أحمد == احمد');
  assert(normalizeArabic('مدرسة') === normalizeArabic('مدرسه'), 'Normalize Taa Marbuta: مدرسة == مدرسه');
  assert(normalizeArabic('علي') === normalizeArabic('على'), 'Normalize Yaa / Alef Maksura: علي == على');

  // --- 2. Smart Grading Comparator Tests ---
  console.log('\n--- 2. Smart Grading Comparator Tests ---');
  assert(compareAnswers('الفاعل', 'الفاعلُ', false).isMatch, 'Match exact with optional tashkeel ignored');
  assert(compareAnswers('فَاعِلٌ', 'فَاعِلٌ', true).isMatch, 'Match strict tashkeel when required');
  assert(!compareAnswers('فَاعِلٌ', 'فَاعِلٍ', true).isMatch, 'Fail strict tashkeel when different diacritic');
  assert(compareAnswers('المبتدأ والخبر', 'المبتدا والخبر', false).isMatch, 'Match with flexible hamza');

  // --- 3. Similarity Tests ---
  console.log('\n--- 3. Levenshtein Similarity Tests ---');
  const sim1 = calculateLevenshteinSimilarity('العلم نور يهدي العقول', 'العلم نور يهدي العقول');
  assert(sim1 === 100, `Exact similarity: ${sim1}%`);
  const sim2 = calculateLevenshteinSimilarity('العلم نور يهدى العقول', 'العلم نور يهدي العقول');
  assert(sim2 >= 90, `Close similarity with yaa/alef variation: ${sim2}%`);

  // --- 4. WhatsApp Generator Tests ---
  console.log('\n--- 4. WhatsApp Link Generator Tests ---');
  const waLink = generateExamLinkWhatsAppUrl('01012345678', 'عمر أحمد', 'اختبار النحو', 'omar-test', 'https://doha-exam.vercel.app');
  assert(waLink.includes('wa.me/201012345678') && waLink.includes('omar-test'), 'WhatsApp exam link generated cleanly with Egypt country code');

  const waResult = generateResultWhatsAppUrl('01012345678', 'عمر أحمد', 'اختبار النحو', 19, 20, 'ممتاز يا بطل', 'omar-test', 'https://doha-exam.vercel.app');
  assert(waResult.includes('19') && waResult.includes('20') && waResult.includes('wa.me/201012345678'), 'WhatsApp result card link formatted properly');

  // --- 5. Utilities Formatting Tests ---
  console.log('\n--- 5. Utility Formatting Tests ---');
  assert(formatMinutes(60) === '01:00', 'formatMinutes(60) == 01:00');
  assert(formatMinutes(125) === '02:05', 'formatMinutes(125) == 02:05');

  // --- 6. Database Integration Tests ---
  console.log('\n--- 6. PostgreSQL Database Integration Tests ---');
  const teacher = await prisma.teacher.findFirst();
  assert(!!teacher, `Teacher Doha Mostafa exists in PostgreSQL: ${teacher?.name}`);

  const exams = await prisma.exam.findMany({ include: { questions: true, links: true } });
  assert(exams.length > 0, `Exams found in DB: count = ${exams.length}`);
  assert(exams[0].questions.length > 0, `First exam has questions: count = ${exams[0].questions.length}`);

  const students = await prisma.student.findMany();
  assert(students.length >= 3, `Students found in DB: count = ${students.length}`);

  const sampleLink = await prisma.examLink.findFirst({
    where: { accessCode: 'demo-omar-101' },
    include: { student: true, exam: true },
  });
  assert(!!sampleLink && sampleLink.student.name === 'عمر أحمد محمود', 'Access code "demo-omar-101" found for student عمر أحمد محمود');

  console.log('\n===============================================');
  console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error('Test run failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
