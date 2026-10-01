/**
 * WhatsApp message link generators for Parents
 */

function formatWhatsAppPhone(phone: string): string {
  let clean = phone.replace(/[^\d]/g, '');
  if (clean.startsWith('01') && clean.length === 11) {
    clean = '2' + clean;
  }
  return clean;
}

export function generateExamLinkWhatsAppUrl(
  parentPhone: string,
  studentName: string,
  examTitle: string,
  accessCode: string,
  baseUrl = 'https://doha-exams.vercel.app'
): string {
  const cleanPhone = formatWhatsAppPhone(parentPhone);
  const examUrl = `${baseUrl}/exam/${accessCode}`;

  const message = `مرحباً بحضرتك ولي أمر الطالب/ة: *${studentName}* 🌸
معكم *أ/ ضحى مصطفى* (معلمة اللغة العربية).

نرسل لحضراتكم رابط اختبار:
📝 *${examTitle}*

🔗 للدخول للاختبار مباشرة:
${examUrl}

⚠️ *تنبيهات هامة للطلاب:*
1. يرجى أداء الامتحان من مكان هادئ واستخدام سماعة الأذن لسؤال الإملاء.
2. لكل طالب محاولة واحدة فقط تبدأ بمجرد الضغط على "بدء الامتحان".
3. ستصل لحضراتكم النتيجة وتقرير الأداء وملاحظات التصحيح فور اعتمادها بإذن الله.

مع تمنياتي لأبطالنا بدوام التميز والتفوق! ✨`;

  return `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
}

export function generateResultWhatsAppUrl(
  parentPhone: string,
  studentName: string,
  examTitle: string,
  score: number,
  totalMarks: number,
  feedback: string,
  accessCode: string,
  baseUrl = 'https://doha-exams.vercel.app'
): string {
  const cleanPhone = formatWhatsAppPhone(parentPhone);
  const percentage = Math.round((score / Math.max(totalMarks, 1)) * 100);
  const resultUrl = `${baseUrl}/exam/${accessCode}/result`;

  let appreciationBadge = '🌟 ممتاز جداً';
  if (percentage < 50) appreciationBadge = '🌱 يحتاج مراجعة واجتهاد';
  else if (percentage < 75) appreciationBadge = '👍 جيد جداً مع تقدم ملحوظ';
  else if (percentage < 90) appreciationBadge = '🎖️ رائع ومتفوق';

  const message = `السلام عليكم ورحمة الله وبركاته 🌸
ولي أمر الطالب/ة المتميز/ة: *${studentName}*

يسر *أ/ ضحى مصطفى* مشاركة نتيجة اختبار:
📝 *${examTitle}*

📊 *الدرجة المستحقة:* ${score} من ${totalMarks} (${percentage}%)
🏆 *التقدير:* ${appreciationBadge}

💬 *ملاحظات المعلمة للتطوير:*
"${feedback || 'أداء ممتاز واجتهاد مشكور، استمر في المذاكرة والممارسة اليومية!'}"

📑 للاطلاع على ورقة الإجابة والتصحيح التفصيلي لكل سؤال:
${resultUrl}

خالص تحياتي وتمنياتي بالتفوق الدائم 💐`;

  return `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
}
