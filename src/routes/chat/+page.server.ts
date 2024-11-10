import { writeFile } from 'node:fs/promises'

import { generateChatID, fileManager, askPDF } from "$lib/server/chat";
import type { Actions } from "./$types";
import { chatTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';

export const actions = {
  startChat: async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get("pdf-file") as File | null
    const prompt = formData.get("prompt")?.toString()
    const fileBuffer = await file?.arrayBuffer();
    if (!fileBuffer || !prompt) return

    // TODO: remove just for testing
    const filename = "./uploads/" + file?.name + Date.now()
    await writeFile(filename, Buffer.from(fileBuffer), "utf-8")
    console.log('file made')

    const fileResult = await fileManager.uploadFile(filename, {
      mimeType: "application/pdf",
      displayName: filename.split("/")[2],
    })

    const chatID = generateChatID()
    await db.insert(chatTable)
      .values({ id: chatID, prompt: [prompt], answer: [], fileUri: fileResult.file.uri })

    return {
      chatID,
    }
  },
} satisfies Actions