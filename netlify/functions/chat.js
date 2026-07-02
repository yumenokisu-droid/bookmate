import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const modePrompts = {
  default: `너는 BOOKMATE의 AI 독서 파트너 'AI 모아'다. 사용자의 말에서 의도를 파악해 바로 도와준다. 줄거리 요약, 등장인물, 핵심주제, 반대의견, 토론질문, 독서모임 준비, 서평 작성, 책추천을 자연스럽게 지원한다. 절대 모드를 고르라고 요구하지 않는다. 한국어로 따뜻하고 실용적으로 답한다.`,
  debate: `너는 BOOKMATE의 AI 독서 파트너 'AI 모아'다. 책에 대한 사용자의 질문에 바로 답하고, 필요하면 다른 관점이나 반론을 제시한다. 절대 모드를 고르라고 요구하지 않는다.`,
  organize: `너는 BOOKMATE의 AI 독서 파트너 'AI 모아'다. 사용자의 감상과 메모를 자연스럽게 정리하고 서평·독서기록으로 발전시킨다. 절대 모드를 고르라고 요구하지 않는다.`,
  coaching: `너는 BOOKMATE의 AI 독서 파트너 'AI 모아'다. 독서모임 준비, 진행 질문, 발제문, 시간 배분을 실제로 쓸 수 있게 돕는다. 절대 모드를 고르라고 요구하지 않는다.`,
  curator: `너는 BOOKMATE의 AI 독서 파트너 'AI 모아'다. 독자의 취향과 상황을 고려해 다음 책을 추천한다. 절대 모드를 고르라고 요구하지 않는다.`
};

function cleanText(value, max = 8000) {
  return String(value || "").slice(0, max);
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: "POST만 지원합니다." }) };
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: "GEMINI_API_KEY가 설정되지 않았습니다." }) };
    }

    const body = JSON.parse(event.body || "{}");
    const { message, mode = "default", modePrompt = "", systemPrompt = "", bookTitle = "", history = [] } = body;

    if (!message || typeof message !== "string") {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "message가 필요합니다." }) };
    }

    const safeMode = modePrompts[mode] ? mode : "default";
    const basePrompt = cleanText(systemPrompt, 9000) || `${modePrompts[safeMode]}\n${cleanText(modePrompt, 3000)}`;
    const bookContext = bookTitle ? `현재 대화 중인 책: 『${cleanText(bookTitle, 100)}』` : "현재 대화 중인 책: 아직 정하지 않음";
    const historyText = Array.isArray(history)
      ? history.slice(-10).map(item => `${item.role === "model" ? "AI" : "사용자"}: ${cleanText(item.text, 1000)}`).join("\n")
      : "";

    const prompt = `${basePrompt}\n\n${bookContext}\n\n최근 대화:\n${historyText}\n\n사용자의 마지막 말:\n${cleanText(message, 2000)}\n\n위 마지막 말에 직접 반응해 한국어로 자연스럽게 답해줘.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    const text = response.text || "답변을 생성하지 못했어요. 다시 한 번 입력해 주세요.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: true, reply: text })
    };
  } catch (error) {
    console.error("[BOOKMATE] Gemini Function Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "AI 응답을 불러오지 못했어요. 잠시 후 다시 시도해 주세요." })
    };
  }
}
