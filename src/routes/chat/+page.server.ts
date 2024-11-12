import { generateChatID, fileManager } from "$lib/server/chat";
import type { Actions, PageServerLoad } from "./$types";
import { chatTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';

export const actions = {
  startChat: async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get("pdf-file") as File | null
    const prompt = formData.get("prompt")?.toString()
    const fileBuffer = await file?.arrayBuffer();
    if (!fileBuffer || !prompt || !file?.name) return {error: true}

    // TODO: remove just for testing
    const filename = Date.now() + file.name

    const fileResult = await fileManager.uploadFile(Buffer.from(fileBuffer), {
      displayName: filename,
      mimeType: "application/pdf",
    })

    
    const chatID = generateChatID()
    await db.insert(chatTable)
    .values({ id: chatID, prompt: [prompt], answer: [], fileUri: fileResult.file.uri })
    
    console.log({ fileResult })
    return {
      chatID,
    }
  },
} satisfies Actions