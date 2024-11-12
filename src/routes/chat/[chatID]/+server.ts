import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getStreamedAIResponse } from "$lib/server/chat";
import { getChatByID, saveChatAnswer } from "$lib/server/db/chat";

export const GET: RequestHandler = async ({ request, params }) => {
  const queryParams = new URL(request.url).searchParams
  const chatID = params.chatID
  let promptIdx: string | null | number = queryParams.get('prompt-idx')

  if (!chatID || !promptIdx) {
    return json({ error: true, message: 'Please provide a valid chat id and prompt idx.' });
  }

  promptIdx = Number(promptIdx)
  if (isNaN(promptIdx)) return json({ error: true, message: 'Please provide a valid prompt idx.' });

  const chats = await getChatByID(chatID)
  if (chats.length < 1) return json({ error: true, message: 'not found' })

  // type safety
  const prompt = chats[0].prompt.at(promptIdx)!

  const stream = new ReadableStream({
    start: async (controller) => {
      try {
        await getStreamedAIResponse({
          prompt,
          pdfUri: chats[0].fileUri,
          callback: (data) => {
            controller.enqueue(data)
          },
          onEnd: (response) => {
            if (response === '') return;

            saveChatAnswer(chatID, response).then(() => controller.close())
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
    }
  })
}