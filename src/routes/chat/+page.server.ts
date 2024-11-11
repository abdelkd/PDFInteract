import { generateChatID, fileManager } from "$lib/server/chat";
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
    const filename = "./uploads/" + Date.now() + file?.name

    const fileResult = await fileManager.uploadFile(Buffer.from(fileBuffer), {
      displayName: filename.split("/")[2],
      mimeType: "application/pdf",
    })

    console.log({ fileResult })

    const chatID = generateChatID()
    await db.insert(chatTable)
      .values({ id: chatID, prompt: [prompt], answer: [], fileUri: fileResult.file.uri })

    return {
      chatID,
    }
  },
} satisfies Actions