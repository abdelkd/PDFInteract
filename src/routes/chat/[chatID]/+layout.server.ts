import { getChatByID } from "$lib/server/db/chat";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params }) => {
  const chats = await getChatByID(params.chatID)
  if (chats.length === 0) return error(404);

  const chat = chats[0];
  if (Date.now() >= (new Date(chat.expiresOn)).getTime()) return error(404);

  const chatHistory = chat.chat;

  return {
    chatHistory,
  }
}
