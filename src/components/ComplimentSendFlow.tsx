import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Send,
  Heart,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smile,
} from 'lucide-react';
import { Student, ComplimentOption, EmojiOption } from '../types';
import { COMPLIMENT_CARDS, EMOJI_OPTIONS } from '../data/mockData';
import { sound, speakText } from '../utils/audio';
import { sendCompliment, getTodaySentCount } from '../services/storageService';

interface ComplimentSendFlowProps {
  currentStudent: Student;
  allStudents: Student[];
  onFinish: () => void;
  onGoBack: () => void;
  dailyLimit: number;
}

export const ComplimentSendFlow: React.FC<ComplimentSendFlowProps> = ({
  currentStudent,
  allStudents,
  onFinish,
  onGoBack,
  dailyLimit,
}) => {
  // 4단계 직관적 흐름: 1단계 [친구 선택] -> 2단계 [칭찬 카드 선택] -> 3단계 [이모지/소리 넣기] -> 4단계 [칭찬 보내기 확인]
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedFriend, setSelectedFriend] = useState<Student | null>(null);
  const [selectedCard, setSelectedCard] = useState<ComplimentOption | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiOption>(EMOJI_OPTIONS[0]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const todaySentCount = getTodaySentCount(currentStudent.id);
  const remainingCount = Math.max(0, dailyLimit - todaySentCount);

  // 친구 선택 (자신 제외)
  const candidateFriends = allStudents.filter((s) => s.id !== currentStudent.id);

  // 1단계: 친구 터치
  const handleSelectFriend = (friend: Student) => {
    sound.playPop();
    setSelectedFriend(friend);
    speakText(`${friend.name} 친구를 골랐어요! 어떤 칭찬을 해줄까요?`);
    setStep(2);
  };

  // 2단계: 칭찬 카드 터치
  const handleSelectCard = (card: ComplimentOption) => {
    sound.playSparkle();
    setSelectedCard(card);
    speakText(`'${card.title}'! 정말 멋진 칭찬 카드예요!`);
    setStep(3);
  };

  // 3단계: 이모지/효과음 터치
  const handleSelectEmoji = (emoji: EmojiOption) => {
    if (emoji.soundName === 'magic') sound.playMagic();
    else if (emoji.soundName === 'cheer') sound.playCheer();
    else sound.playSparkle();

    setSelectedEmoji(emoji);
    speakText(`${emoji.label}를 골랐어요! 이제 보낼게요 버튼을 눌러요!`);
    setStep(4);
  };

  // 4단계: 칭찬 보내기 실행
  const handleSend = () => {
    if (!selectedFriend || !selectedCard) return;

    if (remainingCount <= 0) {
      sound.playPop();
      setErrorMessage('오늘은 칭찬을 모두 보냈어요! 내일 또 친구를 칭찬해줘요!');
      speakText('오늘은 칭찬을 모두 보냈어요! 내일 또 친구를 칭찬해줘요!');
      return;
    }

    setIsSending(true);
    sound.playCheer();

    // 폭죽 효과
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const result = sendCompliment(
      currentStudent,
      selectedFriend,
      { id: selectedCard.id, title: selectedCard.title, icon: selectedCard.icon },
      selectedEmoji.emoji,
      selectedEmoji.soundName
    );

    setTimeout(() => {
      setIsSending(false);
      if (result.success) {
        speakText(`와아! ${selectedFriend.name} 친구에게 예쁜 칭찬이 전해졌어요! 1점 획득!`);
        onFinish();
      } else {
        setErrorMessage(result.error || '칭찬을 전하지 못했어요. 다시 눌러주세요!');
      }
    }, 600);
  };

  return (
    <div id="compliment-send-flow" className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* 상단 네비게이션 및 단계 안내 인디케이터 */}
      <div className="w-full flex items-center justify-between bg-white/95 rounded-3xl p-4 sm:p-5 shadow-lg border-2 border-amber-200 mb-6">
        <button
          type="button"
          onClick={() => {
            sound.playPop();
            if (step > 1) {
              setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
            } else {
              onGoBack();
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl font-bold transition-all text-sm sm:text-base cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-['Jua']">{step === 1 ? '처음으로' : '이전 단계'}</span>
        </button>

        {/* 4단계 스텝 배지 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {[
            { num: 1, label: '친구 선택' },
            { num: 2, label: '칭찬 카드' },
            { num: 3, label: '이모지' },
            { num: 4, label: '보내기' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-['Jua'] transition-all ${
                step === s.num
                  ? 'bg-amber-500 text-white scale-105 shadow-md'
                  : step > s.num
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span>{s.num}단계</span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* 오늘 남은 횟수 뱃지 */}
        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-2xl text-xs sm:text-sm">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
          <span>오늘 남은 칭찬: {remainingCount}회</span>
        </div>
      </div>

      {/* 친절한 유아용 에러/안내 모달 또는 배너 */}
      {errorMessage && (
        <div className="w-full bg-rose-100 border-2 border-rose-400 rounded-2xl p-4 text-rose-900 font-bold flex items-center justify-between mb-4 shadow-md">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
            <span className="text-base sm:text-lg">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="px-3 py-1 bg-rose-200 hover:bg-rose-300 text-rose-800 rounded-xl text-sm"
          >
            확인
          </button>
        </div>
      )}

      {/* ========================================================
          1단계: [친구 선택]
          ======================================================== */}
      {step === 1 && (
        <div className="w-full bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-200 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">👧👦</span>
            <h2 className="text-2xl sm:text-3xl font-['Jua'] text-amber-900">
              어떤 친구를 칭찬해주고 싶나요?
            </h2>
            <button
              type="button"
              onClick={() => speakText('칭찬하고 싶은 친구의 얼굴을 콕 터치해 주세요!')}
              className="p-1 text-amber-600 hover:text-amber-800"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>
          <p className="text-slate-600 font-medium mb-6">
            친구의 얼굴이나 이름을 터치해 주세요!
          </p>

          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {candidateFriends.map((friend) => (
              <button
                key={friend.id}
                id={`select-friend-${friend.id}`}
                type="button"
                onClick={() => handleSelectFriend(friend)}
                className="bg-gradient-to-b from-white to-amber-50 hover:to-orange-100 border-3 border-amber-200 hover:border-amber-400 rounded-3xl p-4 flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl sm:text-5xl mb-2">
                  {friend.avatar}
                </div>
                <span className="text-lg sm:text-xl font-['Jua'] text-slate-800">
                  {friend.name}
                </span>
                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-1">
                  ⭐ {friend.points}점
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          2단계: [칭찬 카드 선택]
          ======================================================== */}
      {step === 2 && selectedFriend && (
        <div className="w-full bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-200 flex flex-col items-center">
          {/* 선택된 친구 배너 */}
          <div className="inline-flex items-center gap-3 bg-amber-100 px-5 py-2 rounded-full border border-amber-300 text-amber-900 font-bold mb-4">
            <span className="text-2xl">{selectedFriend.avatar}</span>
            <span className="font-['Jua'] text-lg sm:text-xl">
              {selectedFriend.name} 친구에게 보낼 칭찬 카드를 골라요
            </span>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl sm:text-3xl font-['Jua'] text-amber-900">
              어떤 멋진 점을 칭찬할까요?
            </h2>
            <button
              type="button"
              onClick={() => speakText('칭찬 카드를 콕 터치해 주세요!')}
              className="p-1 text-amber-600 hover:text-amber-800"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {COMPLIMENT_CARDS.map((card) => (
              <button
                key={card.id}
                id={`select-card-${card.id}`}
                type="button"
                onClick={() => handleSelectCard(card)}
                className={`group bg-gradient-to-br ${card.color} border-4 rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1.5 active:scale-95 cursor-pointer`}
              >
                <div className="w-20 h-20 rounded-2xl bg-white/80 border-2 border-white shadow-sm flex items-center justify-center text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-['Jua'] mb-1">{card.title}</h3>
                <p className="text-sm font-medium opacity-90">{card.subText}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          3단계: [이모지 및 소리 넣기]
          ======================================================== */}
      {step === 3 && selectedFriend && selectedCard && (
        <div className="w-full bg-white/95 rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-200 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">✨</span>
            <h2 className="text-2xl sm:text-3xl font-['Jua'] text-amber-900">
              반짝반짝 선물 스티커를 골라요!
            </h2>
            <button
              type="button"
              onClick={() => speakText('마음에 드는 스티커를 콕 터치해 주세요!')}
              className="p-1 text-amber-600 hover:text-amber-800"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 my-4">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji.id}
                id={`select-emoji-${emoji.id}`}
                type="button"
                onClick={() => handleSelectEmoji(emoji)}
                className={`bg-gradient-to-b from-white to-pink-50 hover:to-pink-100 border-4 ${
                  selectedEmoji.id === emoji.id ? 'border-rose-400 bg-rose-50 scale-105' : 'border-rose-200'
                } rounded-3xl p-5 flex flex-col items-center shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-95`}
              >
                <span className="text-5xl sm:text-6xl mb-2 animate-pulse">{emoji.emoji}</span>
                <span className="font-['Jua'] text-lg sm:text-xl text-slate-800">
                  {emoji.label}
                </span>
                <span className="text-xs text-rose-500 font-semibold mt-1">소리 퐁퐁!</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          4단계: [칭찬 보내기 대형 버튼 및 최종 확인]
          ======================================================== */}
      {step === 4 && selectedFriend && selectedCard && (
        <div className="w-full bg-white/95 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-4xl font-['Jua'] text-amber-900 mb-6 flex items-center gap-2">
            <span>📮</span> 칭찬 편지가 완성되었어요! <span>💌</span>
          </h2>

          {/* 편지 프리뷰 카드 */}
          <div className="w-full max-w-md bg-gradient-to-br from-amber-50 to-orange-100 border-4 border-amber-300 rounded-3xl p-6 shadow-inner mb-8 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-3 right-3 text-4xl">{selectedEmoji.emoji}</div>

            {/* 보낸이와 받는이 */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col items-center">
                <span className="text-3xl">{currentStudent.avatar}</span>
                <span className="font-['Jua'] text-slate-700 text-sm">{currentStudent.name}</span>
              </div>
              <span className="text-amber-500 font-bold text-xl">➡️</span>
              <div className="flex flex-col items-center">
                <span className="text-3xl">{selectedFriend.avatar}</span>
                <span className="font-['Jua'] text-slate-700 text-sm">{selectedFriend.name}</span>
              </div>
            </div>

            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-amber-200 flex items-center justify-center text-5xl mb-3 shadow-md">
              {selectedCard.icon}
            </div>

            <h3 className="text-2xl font-['Jua'] text-amber-900 mb-1">
              "{selectedCard.title}"
            </h3>
            <p className="text-slate-600 font-medium text-sm">
              {selectedCard.subText}
            </p>

            <div className="mt-4 pt-3 border-t border-amber-200/80 w-full flex items-center justify-around text-xs font-bold text-amber-800">
              <span>보내는 나도 +1점 ⭐</span>
              <span>받는 친구도 +1점 ⭐</span>
            </div>
          </div>

          {/* 대형 보낼게요 버튼 */}
          <button
            id="send-compliment-submit-button"
            type="button"
            disabled={isSending || remainingCount <= 0}
            onClick={handleSend}
            className={`w-full max-w-md py-5 sm:py-6 px-8 rounded-3xl text-2xl sm:text-3xl font-['Jua'] text-white shadow-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
              remainingCount <= 0
                ? 'bg-slate-400 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 border-4 border-yellow-300'
            }`}
          >
            {isSending ? (
              <span className="animate-spin text-3xl">⏳</span>
            ) : (
              <>
                <Send className="w-8 h-8 animate-bounce" />
                <span>우체통에 칭찬 넣기! (보낼게요)</span>
              </>
            )}
          </button>

          <p className="text-slate-500 text-sm font-medium mt-4">
            버튼을 누르면 우체통 안으로 편지가 쏙 들어가고 점수가 올라가요!
          </p>
        </div>
      )}
    </div>
  );
};
