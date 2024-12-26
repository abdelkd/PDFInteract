import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { askNewQuestion, getStreamedAIResponse } from '$lib/server/chat';
import { appendChatEntry, getChatByID, saveChatAnswer } from '$lib/server/db/chat';

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
	const prompt = chats[0].chat[0].text;

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
						onEnd: async (response) => {
							if (response === '') return;
              console.log(response)

							await appendChatEntry({ chatID, sender: 'ai', text: response })
              controller.close()
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

  const lastChat = chat[0]?.chat.at(-1)

  if (lastChat?.sender === 'ai') {
    await appendChatEntry({ chatID, sender: 'user', text: prompt, })
  }

	try {
		const stream = new ReadableStream({
			start: async (controller) => {
				const answerStream = await askNewQuestion(chat[0].chat, prompt, chat[0].fileUri);
        let textBuf = '';

				while (true) {
					const { done, value } = await answerStream.stream.next();

					if (done) {
            await appendChatEntry({ chatID, sender: 'ai', text: textBuf })
						controller.close();
						break;
					}

          const currentText = value.text();
					controller.enqueue(currentText);
          textBuf += currentText;
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
