import { getChatByID } from "$lib/server/db/chat";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { chatHistoryFromChat } from "$lib/server/chat";

const prom = async () => new Promise((res) => setTimeout(res, 3000))

export const load: LayoutServerLoad = async ({ params }) => {
  const chats = await getChatByID(params.chatID)
  if (chats.length === 0) return error(404)

  const chat = chats[0];

  const chatHistory = chatHistoryFromChat(chat)

  return {
    chatHistory,
  }
}