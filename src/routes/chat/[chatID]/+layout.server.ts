import { getChatByID } from "$lib/server/db/chat";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

const prom = async () => new Promise((res) => setTimeout(res, 3000))

export const load: LayoutServerLoad = async ({ params }) => {
  const chats = await getChatByID(params.chatID)
  if (chats.length === 0) return error(404)

  const chat = chats[0];

  if (chat.prompt.length > 1) {
    throw new Error('more than one prompt, UNIMPLEMENTED');
  }

  const groupedChats = chat.prompt.map((prompt, idx) => {
    return {
      prompt,
      answer: chat.answer[idx] ?? null,
    }
  })

  return {
    chats: groupedChats,
    initialized: chat.answer.length > 0
  }
}