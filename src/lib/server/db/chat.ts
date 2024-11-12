import { eq } from "drizzle-orm"
import { db } from "."
import { chatTable } from "./schema"


export const getChatByID = async (id: string) => {
  return db.select()
    .from(chatTable)
    .where(eq(chatTable.id, id))
}

export const saveChatAnswer = async (chatId: string, answer: string) => {
  const chat = await db.select()
    .from(chatTable)
    .where(
      eq(chatTable.id, chatId)
    )
  const answers = chat[0].answer

  await db.update(chatTable).set({
    answer: [...answers.slice(0, answers.length - 1), answer]
  })

}