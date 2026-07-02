const { GoogleGenAI } = require('@google/genai');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { message, history = [], book = '', systemPrompt = '' } = JSON.parse(event.body || '{}');
    if (!message || !String(message).trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'message is required' }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }) };
    }

    const ai = new GoogleGenAI({ apiKey });
    const recent = (history || []).slice(-10).map((h) => {
      const role = h.role === 'model' ? 'AI 모아' : '사용자';
      const text = h.parts?.[0]?.text || '';
      return `${role}: ${text}`;
    }).join('\n');

    const prompt = `${systemPrompt || `너는 BOOKMATE의 AI 독서 파트너 AI 모아이다. 한국어로 자연스럽게 답한다.`}\n\n현재 책: ${book || '미정'}\n\n최근 대화:\n${recent}\n\n사용자의 마지막 요청:\n${message}`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: result.text || '답변을 생성하지 못했어요.' })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: 'AI request failed', detail: error.message }) };
  }
};
