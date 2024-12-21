import { eq } from "drizzle-orm"
import { db } from "."
import { chatTable } from "./schema"


export const getChatByID = async (id: string) => {
  return db.select()
    .from(chatTable)
    .where(eq(chatTable.id, id))
}

export const saveChatAnswer = async (chatId: string, question: string, answer: string) => {
  try {
    const chat = await db.select()
      .from(chatTable)
      .where(
        eq(chatTable.id, chatId)
      )

    const oldAnswers = chat[0].answer
    const newAnswers = [...oldAnswers.slice(0), answer]

    const oldQuestions = chat[0].prompt
    const newQuestions = [...oldQuestions.slice(0)]
    if (question !== '') {
      newQuestions.push(question)
    }

    await db.update(chatTable).set({
      answer: newAnswers,
      prompt: newQuestions,
    })

  } catch (err) {
    console.log(err)
  }
}
