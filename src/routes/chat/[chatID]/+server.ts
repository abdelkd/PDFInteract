import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { askNewQuestion, getStreamedAIResponse } from '$lib/server/chat';
import { getChatByID, saveChatAnswer } from '$lib/server/db/chat';

export const GET: RequestHandler = async ({ request, params }) => {
	const queryParams = new URL(request.url).searchParams;
	const chatID = params.chatID;
	let promptIdx: string | null | number = queryParams.get('prompt-idx');

	if (!chatID || !promptIdx) {
		return json({ error: true, message: 'Please provide a valid chat id and prompt idx.' });
	}

	promptIdx = Number(promptIdx);
	if (isNaN(promptIdx)) return json({ error: true, message: 'Please provide a valid prompt idx.' });

	const chats = await getChatByID(chatID);
	if (chats.length < 1) return json({ error: true, message: 'not found' });

	// type safety
	const prompt = chats[0].prompt.at(promptIdx)!;

	try {
		const stream = new ReadableStream({
			start: async (controller) => {
				try {
					await getStreamedAIResponse({
						prompt,
						pdfUri: chats[0].fileUri,
						callback: (data) => {
							controller.enqueue(data);
						},
						onEnd: (response) => {
							if (response === '') return;

							saveChatAnswer(chatID, response).then(() => controller.close());
						}
					});
				} catch (error) {
					console.error(error);
				}
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/plain'
			}
		});
	} catch (err) {
		return new Response(JSON.stringify({ message: 'Failed to generate response' }), {
			status: 401
		});
	}
};

export const POST: RequestHandler = async ({ request, params }) => {
	const chatID = params.chatID;

	const jsonRequest = await request.json();
	if (!jsonRequest?.prompt)
		return json({ error: true, message: 'Prompt is not provided' }, { status: 401 });

	const { prompt } = jsonRequest;
	const chat = await getChatByID(chatID);
	if (chat.length < 1) return json({ error: true, message: 'Chat is not found' }, { status: 404 });

	const chatHistory = chat[0].prompt.map((promptEntry, idx) => ({
		user: promptEntry,
		ai: chat[0].answer[idx] ?? 'No Answer Provided.'
	}));

	try {
		const stream = new ReadableStream({
			start: async (controller) => {
				const answerStream = await askNewQuestion(chatHistory, prompt, chat[0].fileUri);
				while (true) {
					const { done, value } = await answerStream.stream.next();

					if (done) {
						await saveChatAnswer(chatID, (await answerStream.response).text());
						controller.close();
						break;
					}

					controller.enqueue(value.text());
				}
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/plain',
				'Transfer-Encoding': 'chunked'
			}
		});
	} catch (err) {
		return new Response(
			JSON.stringify({
				message: 'Failed to generate response.'
			}),
			{ status: 401 }
		);
	}
};
