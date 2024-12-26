import { eq } from "drizzle-orm"
import { db } from "."
import { chatTable } from "./schema"
import type { Thread } from "../../types"


export const getChatByID = async (id: string) => {
  return db.select()
    .from(chatTable)
    .where(eq(chatTable.id, id))
}

type AppendChatEntryArgs = {
  sender: Thread['sender'],
  chatID: string,
  text: string,
}
export const appendChatEntry = async ({ sender, chatID, text }: AppendChatEntryArgs) => {
  try {
    const chats = await getChatByID(chatID)

    if (chats.length === 0) return;

    chats[0].chat.push({ sender, text })

    await db.update(chatTable).set({ chat: chats[0].chat }).where(eq(chatTable.id, chatID))

  } catch (err) {
    console.error(err)
  }
}

export const saveChatAnswer = async (chatId: string, text: string) => {
  try {
    const chats = await getChatByID(chatId)

    if (chats.length === 0) return;

    chats[0].chat.push({ sender: 'ai', text })

    await db.update(chatTable).set({ chat: chats[0].chat }).where(eq(chatTable.id, chatId))

  } catch (err) {
    console.error(err)
  }
}
