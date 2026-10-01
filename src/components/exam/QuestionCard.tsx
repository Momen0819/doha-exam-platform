'use client';

import { useState, useRef } from 'react';
import { QuestionType } from '@prisma/client';
import TashkeelKeyboard from './TashkeelKeyboard';
import AudioDictationPlayer from './AudioDictationPlayer';
import { CheckCircle2, Circle, Sparkles, HelpCircle, PenTool, Mic } from 'lucide-react';

interface QuestionData {
  id: string;
  type: QuestionType;
  prompt: string;
  passage?: string | null;
  audioUrl?: string | null;
  maxAudioPlays: number;
  options?: any;
  marks: number;
  orderNum: number;
}

interface QuestionCardProps {
  question: QuestionData;
  questionNumber: number;
  totalQuestions: number;
  currentAnswer: string;
  audioPlaysCount: number;
  onAnswerChange: (answer: string) => void;
  onAudioPlayIncrement: () => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  currentAnswer,
  audioPlaysCount,
  onAnswerChange,
  onAudioPlayIncrement,
}: QuestionCardProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const parsedOptions: string[] = Array.isArray(question.options)
    ? question.options
    : typeof question.options === 'string'
    ? JSON.parse(question.options)
    : [];

  const handleTashkeelInsert = (char: string) => {
    if (!inputRef.current) {
      onAnswerChange((currentAnswer || '') + char);
      return;
    }

    const elem = inputRef.current;
    const start = elem.selectionStart ?? currentAnswer.length;
    const end = elem.selectionEnd ?? currentAnswer.length;
    const val = currentAnswer || '';

    const nextVal = val.substring(0, start) + char + val.substring(end);
    onAnswerChange(nextVal);

    setTimeout(() => {
      elem.focus();
      elem.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  const getQuestionTypeBadge = (type: QuestionType) => {
    switch (type) {
      case 'MCQ':
        return { label: 'اختر الإجابة الصحيحة', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'BETWEEN_PARENS':
        return { label: 'اختر مما بين القوسين', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'FILL_IN_BLANK':
        return { label: 'أكمل مكان النقط', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'IRAB':
        return { label: 'إعراب نحوي', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'DICTATION':
        return { label: 'إملاء صوتي', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'ESSAY':
        return { label: 'سؤال مقالي واستخراج', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      default:
        return { label: 'سؤال', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const badge = getQuestionTypeBadge(question.type);

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-md overflow-hidden transition-all">
      
      {/* Header of Question Card */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-bold text-sm flex items-center justify-center shadow-xs">
            {questionNumber}
          </span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
          <span>الدرجة:</span>
          <span className="text-amber-600 text-sm">{question.marks}</span>
          <span>درجات</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        
        {/* Reading Passage (if present) */}
        {question.passage && (
          <div className="bg-amber-50/60 border-2 border-amber-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>اقرأ الفقرة التالية بعناية:</span>
            </div>
            <p className="font-serif-arabic text-lg sm:text-xl text-slate-800 leading-loose text-justify">
              « {question.passage} »
            </p>
          </div>
        )}

        {/* Question Prompt */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-lg sm:text-xl font-serif-arabic leading-relaxed">
            {question.prompt}
          </h3>
        </div>

        {/* Audio Player for Dictation */}
        {question.type === 'DICTATION' && (
          <div className="pt-2">
            <AudioDictationPlayer
              audioUrl={question.audioUrl}
              maxPlays={question.maxAudioPlays || 3}
              currentPlays={audioPlaysCount}
              onPlayIncrement={onAudioPlayIncrement}
              promptText={question.prompt}
            />
          </div>
        )}

        {/* Answer Input Areas Based on Type */}

        {/* 1. MCQ */}
        {question.type === 'MCQ' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {parsedOptions.map((opt, idx) => {
              const isSelected = currentAnswer === opt;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onAnswerChange(opt)}
                  className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 text-right transition-all group ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-slate-900 shadow-sm ring-2 ring-amber-500/30'
                      : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-serif-arabic text-lg font-medium">{opt}</span>
                  </div>

                  {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-amber-600 fill-amber-100 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. BETWEEN_PARENS */}
        {question.type === 'BETWEEN_PARENS' && (
          <div className="flex flex-wrap gap-3 pt-2">
            {parsedOptions.map((opt, idx) => {
              const isSelected = currentAnswer === opt;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onAnswerChange(opt)}
                  className={`px-6 py-3 rounded-2xl border-2 font-serif-arabic text-lg font-bold transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300'
                      : 'bg-purple-50/60 hover:bg-purple-100 text-purple-900 border-purple-200'
                  }`}
                >
                  [ {opt} ]
                </button>
              );
            })}
          </div>
        )}

        {/* 3. FILL_IN_BLANK & IRAB & DICTATION */}
        {(question.type === 'FILL_IN_BLANK' ||
          question.type === 'IRAB' ||
          question.type === 'DICTATION') && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                اكتب إجابتك هنا (يمكنك استخدام أزرار التشكيل بالأسفل):
              </label>
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={currentAnswer || ''}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="اكتب الإجابة بالتشكيل..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 font-serif-arabic text-xl text-slate-900 outline-none transition-all shadow-inner bg-white"
              />
            </div>

            {/* Tashkeel Helper Keyboard */}
            <TashkeelKeyboard onInsert={handleTashkeelInsert} />
          </div>
        )}

        {/* 4. ESSAY */}
        {question.type === 'ESSAY' && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                اكتب إجابتك واستخراجك بالتفصيل:
              </label>
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                rows={4}
                value={currentAnswer || ''}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="اكتب الإجابة والشرح هنا..."
                className="w-full p-5 rounded-2xl border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 font-serif-arabic text-lg text-slate-900 outline-none transition-all shadow-inner bg-white leading-relaxed resize-y"
              />
            </div>

            {/* Tashkeel Helper Keyboard */}
            <TashkeelKeyboard onInsert={handleTashkeelInsert} />
          </div>
        )}

      </div>
    </div>
  );
}
