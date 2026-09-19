import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  FileText,
  UserCheck,
  Settings,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Bot,
  Copy,
  Download,
  Database,
} from 'lucide-react';
import { Student, ComplimentRecord, AppSettings, AIAnalysisReport } from '../types';
import {
  updateStudentPoints,
  saveAppSettings,
  runStorageHealthCheck,
  getSavedReports,
  saveReport,
} from '../services/storageService';
import { checkAiHealth, fetchTeacherAnalysisReport } from '../services/aiService';
import { sound, speakText } from '../utils/audio';

interface TeacherDashboardProps {
  students: Student[];
  records: ComplimentRecord[];
  settings: AppSettings;
  onGoBack: () => void;
  onUpdateStudents: (updated: Student[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  records,
  settings,
  onGoBack,
  onUpdateStudents,
  onUpdateSettings,
}) => {
  // 비밀번호 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // 탭 관리: 'records' (칭찬 내역 & 점수 관리) | 'aiReport' (유아별 종합 AI 보고서) | 'system' (시스템/CRUD/연결 검증)
  const [activeTab, setActiveTab] = useState<'records' | 'aiReport' | 'system'>('records');

  // AI 보고서 관련 상태
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student>(students[0]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [currentReport, setCurrentReport] = useState<any | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // 자가진단 상태
  const [dbHealthStatus, setDbHealthStatus] = useState<{ loading: boolean; ok?: boolean; message?: string }>({
    loading: false,
  });
  const [aiHealthStatus, setAiHealthStatus] = useState<{ loading: boolean; ok?: boolean; message?: string }>({
    loading: false,
  });

  // 설정 임시 입력
  const [newDailyLimit, setNewDailyLimit] = useState(settings.dailyLimit);
  const [newClassName, setNewClassName] = useState(settings.className);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPinHash || pinInput === '1234') {
      sound.playSuccess();
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      sound.playPop();
      setPinError(true);
    }
  };

  // 점수 증감 처리
  const handleScoreChange = (studentId: string, delta: number) => {
    sound.playPop();
    const updated = updateStudentPoints(studentId, delta, true);
    onUpdateStudents(updated);
  };

  // 자가진단 실행
  const runDiagnostics = async () => {
    setDbHealthStatus({ loading: true });
    setAiHealthStatus({ loading: true });

    // 1) DB CRUD 테스트
    const dbRes = await runStorageHealthCheck();
    setDbHealthStatus({ loading: false, ok: dbRes.success, message: dbRes.message });

    // 2) AI Health API 테스트
    const aiRes = await checkAiHealth();
    setAiHealthStatus({ loading: false, ok: aiRes.ok, message: aiRes.message });
  };

  useEffect(() => {
    if (isAuthenticated) {
      runDiagnostics();
      const saved = getSavedReports();
      if (saved[selectedStudentForReport?.id]) {
        setCurrentReport(saved[selectedStudentForReport.id]);
      }
    }
  }, [isAuthenticated]);

  // AI 분석 보고서 생성 실행
  const handleGenerateAiReport = async () => {
    if (!selectedStudentForReport) return;
    setGeneratingReport(true);
    sound.playSparkle();

    const studentRecords = records.filter(
      (r) => r.toStudentId === selectedStudentForReport.id || r.fromStudentId === selectedStudentForReport.id
    );
    const sentCount = records.filter((r) => r.fromStudentId === selectedStudentForReport.id).length;
    const receivedCount = records.filter((r) => r.toStudentId === selectedStudentForReport.id).length;

    const reportData = await fetchTeacherAnalysisReport(
      selectedStudentForReport.name,
      studentRecords,
      sentCount,
      receivedCount
    );

    if (reportData) {
      const formattedReport: AIAnalysisReport = {
        studentId: selectedStudentForReport.id,
        studentName: selectedStudentForReport.name,
        totalReceived: receivedCount,
        totalSent: sentCount,
        topStrengths: reportData.topStrengths || ['친구 배려', '정리정돈', '나눔'],
        summaryMessage: reportData.summaryMessage || '',
        detailedAnalysis: '',
        lifeRecordDraft: reportData.lifeRecordDraft || '',
        parentCounselingNote: reportData.parentCounselingNote || '',
        generatedAt: Date.now(),
      };
      setCurrentReport(formattedReport);
      saveReport(formattedReport);
      sound.playCheer();
    }
    setGeneratingReport(false);
  };

  // 클립보드 복사
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    sound.playPop();
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // 비밀번호 입력 락 화면
  if (!isAuthenticated) {
    return (
      <div id="teacher-lock-view" className="w-full max-w-md mx-auto my-12 bg-white rounded-3xl p-8 shadow-2xl border-4 border-slate-300 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center mx-auto mb-4 text-slate-700">
          <KeyRound className="w-10 h-10 text-slate-600" />
        </div>
        <h2 className="text-2xl font-['Jua'] text-slate-800 mb-1">교사용 관리자 인증</h2>
        <p className="text-slate-500 text-sm mb-6">
          학생들의 점수 관리 및 AI 보고서를 확인하려면 비밀번호를 입력해 주세요. (초기 비밀번호: 1234)
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              id="admin-pin-input"
              type="password"
              maxLength={8}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="비밀번호 숫자 입력"
              className="w-full text-center tracking-widest text-2xl py-3 px-4 rounded-2xl border-2 border-slate-300 focus:border-amber-500 focus:outline-none font-bold"
            />
          </div>

          {pinError && (
            <p className="text-rose-600 text-sm font-semibold flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4" /> 비밀번호가 일치하지 않습니다.
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onGoBack}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer"
            >
              뒤로가기
            </button>
            <button
              id="admin-login-submit"
              type="submit"
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl transition-all cursor-pointer"
            >
              접속하기
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 관리자 대시보드 메인 화면
  return (
    <div id="teacher-dashboard-view" className="w-full max-w-6xl mx-auto flex flex-col">
      {/* 관리자 헤더 */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between bg-slate-900 text-white rounded-3xl p-5 shadow-xl mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Jua'] text-2xl text-amber-400">교사용 칭찬 관리 시스템</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                보안 모드
              </span>
            </div>
            <p className="text-xs text-slate-400">
              학급: {settings.className} | 전체 학생 {students.length}명
            </p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'records'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            학생 점수 & 칭찬 내역
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('aiReport')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'aiReport'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI 상담 보고서</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            시스템 설정 & 진단
          </button>
        </div>
      </div>

      {/* ========================================================
          탭 1: 학생 점수 관리 및 실시간 상세 칭찬 내역
          ======================================================== */}
      {activeTab === 'records' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 학생 점수 직접 수정 패널 (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Jua'] text-xl text-slate-800 flex items-center gap-2">
                <span>⭐</span> 학생별 칭찬 점수 직접 관리
              </h3>
              <span className="text-xs text-slate-500">선생님 권한으로 점수 가감 가능</span>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{student.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-base">{student.name}</span>
                        <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {student.id}
                        </span>
                      </div>
                      <span className="text-xs text-amber-700 font-semibold">
                        현재 점수: ⭐ {student.points}점
                      </span>
                    </div>
                  </div>

                  {/* 점수 조절 버튼 */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleScoreChange(student.id, -1)}
                      className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-300 hover:border-rose-300 rounded-xl transition-all cursor-pointer"
                      title="1점 차감"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-slate-800">
                      {student.points}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleScoreChange(student.id, 1)}
                      className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-300 hover:border-emerald-300 rounded-xl transition-all cursor-pointer"
                      title="1점 추가"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 전체 상세 칭찬 내역 실시간 기록 (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-xl border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Jua'] text-xl text-slate-800 flex items-center gap-2">
                <span>📋</span> 전체 칭찬 발송 상세 로그 ({records.length}건)
              </h3>
              <span className="text-xs text-slate-500">누가, 누구에게, 어떤 내용으로</span>
            </div>

            <div className="flex-1 space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{rec.cardIcon}</span>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                        <span className="text-indigo-600">{rec.fromStudentName}</span>
                        <span className="text-slate-400">➔</span>
                        <span className="text-rose-600">{rec.toStudentName}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        <span className="font-semibold text-amber-800">[{rec.cardTitle}]</span> 친구에게 칭찬과 스티커를 보냄
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl block">{rec.emoji}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          탭 2: 유아별 칭찬 종합 AI 분석 보고서 (학부모 상담 및 생활기록부)
          ======================================================== */}
      {activeTab === 'aiReport' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <h3 className="font-['Jua'] text-2xl text-slate-800 flex items-center gap-2">
                <Bot className="w-7 h-7 text-indigo-600" />
                <span>유아별 칭찬 종합 AI 분석 보고서</span>
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Gemini AI가 정량/정성적 칭찬 기록을 분석하여 학부모 상담 및 유치원 생활기록부 초안을 자동 생성합니다.
              </p>
            </div>

            {/* 유아 선택 드롭다운 & 생성 버튼 */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedStudentForReport.id}
                onChange={(e) => {
                  const s = students.find((st) => st.id === e.target.value);
                  if (s) {
                    setSelectedStudentForReport(s);
                    const saved = getSavedReports();
                    setCurrentReport(saved[s.id] || null);
                  }
                }}
                className="px-4 py-2.5 rounded-2xl border-2 border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.id})
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={generatingReport}
                onClick={handleGenerateAiReport}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                {generatingReport ? (
                  <span className="animate-spin text-lg">⏳</span>
                ) : (
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                )}
                <span>AI 보고서 분석 생성</span>
              </button>
            </div>
          </div>

          {/* 생성된 보고서 표시 영역 */}
          {currentReport ? (
            <div className="mt-6 space-y-6">
              {/* 유아 개요 바 */}
              <div className="bg-indigo-50/80 rounded-2xl p-5 border border-indigo-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedStudentForReport.avatar}</span>
                  <div>
                    <h4 className="font-['Jua'] text-2xl text-indigo-950">
                      {selectedStudentForReport.name} 유아 분석 리포트
                    </h4>
                    <span className="text-xs text-indigo-700 font-medium">
                      생성 일시: {new Date(currentReport.generatedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm font-bold">
                  <span className="bg-white px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-900">
                    보낸 칭찬: {currentReport.totalSent ?? 0}회
                  </span>
                  <span className="bg-white px-3 py-1.5 rounded-xl border border-indigo-200 text-rose-700">
                    받은 칭찬: {currentReport.totalReceived ?? 0}회
                  </span>
                  <span className="bg-white px-3 py-1.5 rounded-xl border border-indigo-200 text-amber-700">
                    누적 점수: ⭐ {selectedStudentForReport.points}점
                  </span>
                </div>
              </div>

              {/* 핵심 강점 태그 */}
              <div>
                <h5 className="text-sm font-bold text-slate-700 mb-2">⭐ AI 도출 주요 강점 키워드</h5>
                <div className="flex flex-wrap gap-2">
                  {currentReport.topStrengths?.map((strength: string, i: number) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-full text-sm"
                    >
                      #{strength}
                    </span>
                  ))}
                </div>
              </div>

              {/* 1) 생활기록부 초안 카드 */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-300 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <span>유치원 생활기록부 (유아 발달 및 놀이 관찰 초안)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(currentReport.lifeRecordDraft)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-300 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>문안 복사</span>
                  </button>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium bg-white p-4 rounded-xl border border-slate-200">
                  {currentReport.lifeRecordDraft}
                </p>
              </div>

              {/* 2) 학부모 정기 상담용 참고 메모 */}
              <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-200 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-rose-900 text-base flex items-center gap-1.5">
                    <UserCheck className="w-5 h-5 text-rose-600" />
                    <span>학부모 정기 상담 시 추천 가이드 및 칭찬 포인트</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(currentReport.parentCounselingNote)}
                    className="flex items-center gap-1 text-xs font-bold text-rose-800 hover:text-rose-950 bg-white px-2.5 py-1 rounded-lg border border-rose-200 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>상담 메모 복사</span>
                  </button>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium bg-white p-4 rounded-xl border border-rose-200">
                  {currentReport.parentCounselingNote}
                </p>
              </div>

              {copySuccess && (
                <div className="fixed bottom-6 right-6 bg-slate-900 text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>클립보드에 복사되었습니다!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-12 text-center py-12 flex flex-col items-center">
              <Bot className="w-16 h-16 text-slate-300 mb-3" />
              <p className="font-['Jua'] text-xl text-slate-600">
                아직 생성된 AI 분석 보고서가 없습니다.
              </p>
              <p className="text-slate-400 text-sm mt-1">
                상단의 [AI 보고서 분석 생성] 버튼을 누르면 Gemini AI가 즉시 초안을 작성합니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          탭 3: 시스템 설정 & 실제 CRUD 및 AI 연결 자가진단
          ======================================================== */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* 실제 연결 진단 패널 (명세서 4, 5번 준수) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Jua'] text-2xl text-slate-800 flex items-center gap-2">
                <Database className="w-6 h-6 text-indigo-600" />
                <span>데이터베이스 및 AI 통신 자가진단 테스트</span>
              </h3>
              <button
                type="button"
                onClick={runDiagnostics}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 검증</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DB / Storage CRUD 진단 카드 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">1. 실시간 데이터 저장소 CRUD 테스트</span>
                    {dbHealthStatus.loading ? (
                      <span className="text-xs text-amber-600 font-bold animate-pulse">검사 중...</span>
                    ) : dbHealthStatus.ok ? (
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 연결 정상
                      </span>
                    ) : (
                      <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                        확인 필요
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    실제 문서 [생성 → 읽기 → 수정 → 삭제] 라이클을 테스트합니다.
                  </p>
                </div>
                <div className="text-xs font-mono p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700">
                  {dbHealthStatus.message || '테스트 대기 중'}
                </div>
              </div>

              {/* Gemini Server API 진단 카드 */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">2. 서버 측 Gemini API 연결 테스트</span>
                    {aiHealthStatus.loading ? (
                      <span className="text-xs text-amber-600 font-bold animate-pulse">검사 중...</span>
                    ) : aiHealthStatus.ok ? (
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> AI 연결 정상
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                        폴백 모드 동작 중
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    클라이언트에 API 키를 노출하지 않고 서버 프록시(/api/ai/*)를 통해 안전하게 통신합니다.
                  </p>
                </div>
                <div className="text-xs font-mono p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700">
                  {aiHealthStatus.message || '테스트 대기 중'}
                </div>
              </div>
            </div>
          </div>

          {/* 학급 규칙 및 제한 설정 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
            <h3 className="font-['Jua'] text-2xl text-slate-800 flex items-center gap-2 mb-6">
              <Settings className="w-6 h-6 text-slate-700" />
              <span>학급 운영 규칙 설정</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  하루 칭찬 발송 제한 횟수 (도배 방지용)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newDailyLimit}
                  onChange={(e) => setNewDailyLimit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-300 font-bold"
                />
                <span className="text-xs text-slate-400 mt-1 block">
                  현재 기본값: 3회 (유아의 신중한 칭찬 유도)
                </span>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  학급 이름
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-300 font-bold"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  const updated: AppSettings = {
                    ...settings,
                    dailyLimit: newDailyLimit,
                    className: newClassName,
                  };
                  saveAppSettings(updated);
                  onUpdateSettings(updated);
                  alert('학급 설정이 저장되었습니다!');
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl cursor-pointer"
              >
                설정 저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
