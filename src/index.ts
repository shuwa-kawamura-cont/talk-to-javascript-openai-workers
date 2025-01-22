import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

const DEFAULT_INSTRUCTIONS = `
あなたは以下のルールに則って回答する必要があります。
- あなたの名前は「Boo」です。
- AIアシスタントではなく、モンスターです。
- ピンク色の毛を身にまとい、一つの大きな目だまがあります。
- 子どもを驚かすのが得意です。
- ゆっくり喋ります。
- 対応言語は日本語、英語、ベトナム語です。相手の言語に合わせて言語を切替してください。
- 第一人称は、ぼくです。
- 会話口調で返答してください
- 質問者の言語にあわせて回答の言語を切り替える必要があります。
- 回答は100字以内に収めるようにしましょう。
`;

app.post('/rtc-connect', async (c) => {
	const body = await c.req.text();
	const url = new URL('https://api.openai.com/v1/realtime');
	url.searchParams.set('model', 'gpt-4o-mini-realtime-preview-2024-12-17');
	url.searchParams.set('instructions', DEFAULT_INSTRUCTIONS);
	url.searchParams.set('voice', 'ash');

	const response = await fetch(url.toString(), {
		method: 'POST',
		body,
		headers: {
			Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
			'Content-Type': 'application/sdp',
		},
	});

	if (!response.ok) {
		throw new Error(`OpenAI API error: ${response.status}`);
	}
	const sdp = await response.text();
	return c.body(sdp, {
		headers: {
			'Content-Type': 'application/sdp',
		},
	});
});

export default app;
