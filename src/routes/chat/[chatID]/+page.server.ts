import { fail } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { chatTable } from '$lib/server/db/schema'
import { model } from '$lib/server/chat'
import type { PageServerLoad } from './$types'
import { getChatByID } from '$lib/server/db/chat'

export const load: PageServerLoad = async ({ request, params }) => {
  const chatResult = await getChatByID(params.chatID)

  if (chatResult.length !== 1) return fail(404)

  const chat = chatResult[0]
  let answer: string = "";


  if (chat.answer.length === 0) {
    const generatedResult = await model.generateContent([chat.prompt[0], {
      fileData: {
        mimeType: "application/pdf",
        fileUri: chat.fileUri,
      }
    }])

    answer = generatedResult.response.text()

    await db.update(chatTable).set({
      answer: [answer]
    })
  } else {
    answer = chat.answer[0]
  }

  const mixedResults = chat.prompt.map((prompt, idx) => {
    return {
      prompt,
      answer: chat.answer[idx] ?? answer
    }
  })

  console.log({ mixedResults })

  return {
    result: mixedResults
  }
}