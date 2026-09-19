import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

export function registerApiRoutes(app: express.Express) {
  app.use(express.json());

  // 1. AI Health Check
  app.get('/api/ai/health', async (_req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        ok: false,
        message: 'GEMINI_API_KEY가 서버 환경변수에 설정되어 있지 않습니다.',
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Say OK',
      });
      return res.json({
        ok: true,
        message: 'Gemini AI 연결 정상 (gemini-2.5-flash 응답 완료)',
        sample: response.text?.trim(),
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return res.status(200).json({
        ok: false,
        message: `Gemini API 호출 실패: ${errorMsg}`,
      });
    }
  });

  // 2. 유아용 AI 칭찬 요약 로봇 (다정한 로봇 말투 한 문장)
  app.post('/api/ai/summary', async (req, res) => {
    const { studentName, compliments } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 만약 API 키가 없거나 외부 환경일 때 친근한 규칙 기반 즉시 응답 폴백 제공
    if (!apiKey) {
      if (!compliments || compliments.length === 0) {
        return res.json({
          summary: `${studentName}야! 오늘 우리 반 친구들과 함께 웃으며 멋진 하루를 보내고 있어! 참 자랑스러워! 삐리삐리!`,
        });
      }
      const topTitle = compliments[0]?.cardTitle || '친절하고 멋진 행동';
      return res.json({
        summary: `${studentName}야! 친구들이 '${topTitle}' 모습을 많이 칭찬해 주었단다! 정말 최고야, 삐리삐리!`,
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
당신은 대한민국 유치원 만 5세(7세) 햇살반의 다정하고 귀여운 '칭찬 요약 꼬마 로봇 삐뽀'입니다.
학생 이름: ${studentName}
친구가 보낸 칭찬 목록: ${JSON.stringify(compliments || [])}

지침:
1. 유치원 만 5세 아이가 귀로 듣고(TTS) 바로 이해할 수 있도록 매우 따뜻하고 밝고 쉬운 말로 1문장~2문장 이내(최대 50자 안팎)로 말해주세요.
2. 로봇다운 귀여운 감탄사("삐리삐리!", "삐뽀삐뽀!" 등)를 섞어도 좋습니다.
3. 칭찬 내역에 있는 내용(예: 정리를 잘함, 친절함, 양보함 등)을 구체적으로 언급하며 용기와 기쁨을 북돋아 주세요.
4. 문장은 따옴표 없이 순수 텍스트만 출력하세요.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text?.trim() || `${studentName}야! 친구들이 보낸 따뜻한 칭찬이 가득해! 정말 멋져, 삐리삐리!`;
      return res.json({ summary: text });
    } catch (err: unknown) {
      console.error('Gemini summary error:', err);
      // 에러 발생 시에도 유아 화면이 멈추지 않도록 안전한 메시지 반환
      return res.json({
        summary: `${studentName}야! 친구들이 보낸 예쁜 칭찬 하트가 우체통에 가득 모였어! 항상 고마워, 삐리삐리!`,
      });
    }
  });

  // 3. 교사용 종합 AI 분석 보고서 초안 생성 (학부모 상담 및 생활기록부 참고용)
  app.post('/api/ai/teacher-report', async (req, res) => {
    const { studentName, records, totalSent, totalReceived } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        report: {
          studentName,
          topStrengths: ['또래 관계 배려', '기본생활습관', '협동 놀이'],
          summaryMessage: `${studentName} 유아는 또래와의 놀이 상황에서 양보와 정리를 성실히 실천하며 학급 내 긍정적인 관계를 주도하고 있습니다.`,
          lifeRecordDraft: `기본생활습관이 바르게 형성되어 있으며, 놀이 후 교구와 장난감을 스스로 정리정돈하는 태도가 돋보임. 또래 친구들의 기분과 상황을 배려하여 따뜻한 말과 행동으로 소통하며 긍정적인 사회정서적 성장을 보여줌.`,
          parentCounselingNote: `가정에서도 아이가 정리정돈이나 친구를 칭찬할 때 격려해 주시면 자존감과 교우관계 주도성이 더욱 신장될 것으로 기대됩니다.`,
        },
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
당신은 대한민국 유아교육 전문가이자 유치원 만 5세(누리과정) 학급 담임교사 어시스턴트입니다.
유아 이름: ${studentName}
칭찬을 보낸 횟수: ${totalSent}회
칭찬을 받은 횟수: ${totalReceived}회
상세 칭찬 내역 데이터: ${JSON.stringify(records || [])}

위 정량적/정성적 칭찬 기록을 분석하여 교사가 활용할 수 있는 [유아 칭찬 분석 보고서]를 JSON 형식으로 작성해주세요.

반드시 다음 JSON 형식만 순수 JSON으로 출력하세요:
{
  "topStrengths": ["강점1", "강점2", "강점3"],
  "summaryMessage": "교사용 한 줄 총평 요약",
  "lifeRecordDraft": "유치원 생활기록부(유아행동발달 및 놀이관찰 기록)에 바로 참고할 수 있는 교육적 문장(약 120자)",
  "parentCounselingNote": "학부모 정기 상담 시 강점 및 가정 연계 격려 포인트로 전달할 수 있는 조언 문장(약 120자)"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        report: {
          studentName,
          topStrengths: parsed.topStrengths || ['또래 협동', '정리정돈', '친절성'],
          summaryMessage: parsed.summaryMessage || '또래 친구들과 원만한 관계를 맺으며 밝게 생활하고 있습니다.',
          lifeRecordDraft: parsed.lifeRecordDraft || '놀이 참여도가 높고 친구들에게 따뜻한 태도를 보임.',
          parentCounselingNote: parsed.parentCounselingNote || '원에서의 긍정적 태도를 가정에서도 적극 지지해 주시길 권장합니다.',
        },
      });
    } catch (err: unknown) {
      console.error('Gemini teacher report error:', err);
      return res.json({
        report: {
          studentName,
          topStrengths: ['친구 배려', '정리정돈', '씩씩한 도전'],
          summaryMessage: `${studentName} 유아는 또래와의 상호작용에서 긍정적 정서를 교류하며 협동을 잘 실천합니다.`,
          lifeRecordDraft: `놀잇감을 제자리에 스스로 정돈하며 친구들의 놀이에 적극적으로 동참하고 양보하는 태도가 우수함.`,
          parentCounselingNote: `원 생활에서 칭찬을 적극적으로 주고받으며 사회성이 크게 발달하고 있으니 가정에서도 칭찬 경험을 격려해 주세요.`,
        },
      });
    }
  });
}
