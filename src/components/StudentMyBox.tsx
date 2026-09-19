import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bot,
  Volume2,
  Sparkles,
  Heart,
  Clock,
  Send,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import { Student, ComplimentRecord } from '../types';
import { getReceivedCompliments } from '../services/storageService';
import { fetchAiComplimentSummary } from '../services/aiService';
import { sound, speakText, stopSpeaking } from '../utils/audio';

interface StudentMyBoxProps {
  student: Student;
  onGoBack: () => void;
  onOpenSendCompliment: () => void;
}

export const StudentMyBox: React.FC<StudentMyBoxProps> = ({
  student,
  onGoBack,
  onOpenSendCompliment,
}) => {
  const [compliments, setCompliments] = useState<ComplimentRecord[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    // 칭찬 내역 로드
    const records = getReceivedCompliments(student.id);
    setCompliments(records);

    // AI 칭찬 요약 로봇 메시지 생성
    let isMounted = true;
    setLoadingAi(true);

    fetchAiComplimentSummary(student.name, records)
      .then((summary) => {
        if (!isMounted) return;
        setAiSummary(summary);
        setLoadingAi(false);
        // 진입 시 자동으로 다정한 로봇 목소리로 읽어주기
        setTimeout(() => {
          setIsSpeaking(true);
          speakText(summary, () => setIsSpeaking(false));
        }, 300);
      })
      .catch(() => {
        if (!isMounted) return;
        const fallback = `${student.name}야! 친구들이 보낸 따뜻한 칭찬이 가득해! 정말 멋져, 삐리삐리!`;
        setAiSummary(fallback);
        setLoadingAi(false);
      });

    return () => {
      isMounted = false;
      stopSpeaking();
    };
  }, [student.id, student.name]);

  const handleReplayTts = () => {
    sound.playPop();
    setIsSpeaking(true);
    speakText(aiSummary, () => setIsSpeaking(false));
  };

  const handleCardClick = (c: ComplimentRecord) => {
    sound.playSparkle();
    speakText(`${c.fromStudentName} 친구가 '${c.cardTitle}' 칭찬을 보내주었어요!`);
  };

  return (
    <div id="student-mybox-view" className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* 상단 헤더 */}
      <div className="w-full flex items-center justify-between bg-white/95 rounded-3xl p-4 sm:p-5 shadow-lg border-2 border-amber-200 mb-6">
        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            sound.playPop();
            onGoBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl font-bold transition-all text-sm sm:text-base cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-['Jua']">처음으로</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl">
            {student.avatar}
          </div>
          <div>
            <h1 className="font-['Jua'] text-xl sm:text-2xl text-slate-800">
              {student.name}의 칭찬 보물함
            </h1>
            <span className="text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
              누적 칭찬 점수 ⭐ {student.points}점
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            sound.playPop();
            onOpenSendCompliment();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all text-sm sm:text-base cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="font-['Jua']">칭찬 보내기</span>
        </button>
      </div>

      {/* 4) 유아용 AI 칭찬 요약 로봇 (Gemini API + Web Speech TTS) */}
      <div className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 sm:p-8 shadow-2xl text-white mb-8 border-4 border-yellow-300 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          {/* 말하는 칭찬 로봇 캐릭터 */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/20 backdrop-blur-md border-4 border-white/60 flex items-center justify-center text-6xl shadow-xl ${
                isSpeaking ? 'animate-bounce' : 'animate-pulse'
              }`}
            >
              🤖
            </div>
            {isSpeaking && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-indigo-900 font-bold text-xs px-2 py-1 rounded-full shadow-md animate-ping">
                말하는 중!
              </span>
            )}
          </div>

          {/* 로봇 대화 풍선 */}
          <div className="flex-1 bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative border-3 border-purple-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-600" />
                <span>AI 칭찬 요약 로봇 삐뽀</span>
              </span>

              <button
                id="replay-tts-button"
                type="button"
                onClick={handleReplayTts}
                disabled={loadingAi}
                className="flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all cursor-pointer"
                title="목소리 다시 듣기"
              >
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span>목소리 다시 듣기</span>
              </button>
            </div>

            {loadingAi ? (
              <div className="flex items-center gap-3 py-3 text-purple-700 font-['Jua'] text-lg">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>로봇 삐뽀가 받은 칭찬들을 모으고 있어요... 삐리삐리!</span>
              </div>
            ) : (
              <p className="font-['Jua'] text-xl sm:text-2xl text-purple-950 leading-relaxed">
                "{aiSummary}"
              </p>
            )}

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>* Gemini AI가 친구들의 칭찬을 다정하게 요약해 주었어요.</span>
              <span className="text-purple-600 font-semibold">🔊 귀 기울여 들어봐요!</span>
            </div>
          </div>
        </div>
      </div>

      {/* 받은 칭찬 편지함 리스트 */}
      <div className="w-full bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💌</span>
            <h2 className="text-2xl sm:text-3xl font-['Jua'] text-amber-900">
              친구들이 나에게 보낸 칭찬 편지 ({compliments.length}장)
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-medium">
            카드를 터치하면 소리가 나요!
          </span>
        </div>

        {compliments.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <span className="text-6xl mb-3">📬</span>
            <p className="font-['Jua'] text-2xl text-slate-600 mb-2">
              아직 받은 칭찬 편지가 도착하는 중이에요!
            </p>
            <p className="text-slate-500 text-sm mb-6">
              먼저 친구에게 따뜻한 칭찬을 보내보는 건 어떨까요?
            </p>
            <button
              type="button"
              onClick={onOpenSendCompliment}
              className="bg-amber-500 hover:bg-amber-600 text-white font-['Jua'] text-xl px-6 py-3 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              친구 칭찬하러 가기!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {compliments.map((record) => (
              <div
                key={record.id}
                id={`compliment-card-${record.id}`}
                onClick={() => handleCardClick(record)}
                className="bg-gradient-to-b from-amber-50 to-orange-50 hover:to-pink-50 border-3 border-amber-200 hover:border-amber-400 rounded-3xl p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer relative overflow-hidden"
              >
                {/* 우측 상단 이모지 스티커 */}
                <div className="absolute top-3 right-3 text-3xl">
                  {record.emoji}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center text-3xl shadow-sm">
                    {record.fromStudentAvatar}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500">보낸 친구</span>
                    <h3 className="font-['Jua'] text-lg text-slate-800">
                      {record.fromStudentName}
                    </h3>
                  </div>
                </div>

                <div className="bg-white/80 rounded-2xl p-3 border border-amber-200 flex items-center gap-3">
                  <span className="text-3xl">{record.cardIcon}</span>
                  <div>
                    <h4 className="font-['Jua'] text-amber-900 text-base">
                      {record.cardTitle}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {new Date(record.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
