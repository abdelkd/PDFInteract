import { error, json } from "@sveltejs/kit";

import type { RequestHandler } from "./$types";
import { generateChatID, fileManager } from '$lib/server/chat';
import { chatTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData()
  const formObj = Object.fromEntries(formData.entries())
  const pdfFile = formObj["pdf-file"] as File | undefined
  const prompt = formObj.prompt as string | undefined
  if (!pdfFile || !prompt) error(401, { message: "invalid form data" })

  const fileBuffer = await pdfFile.arrayBuffer()

  const filename = Date.now() + pdfFile.name;

  try {
    const fileResult = await fileManager.uploadFile(Buffer.from(fileBuffer), {
      displayName: filename,
      mimeType: 'application/pdf'
    });

    const chatID = generateChatID();
    await db.insert(chatTable).values({
      id: chatID,
      prompt: [prompt],
      answer: [],
      fileUri: fileResult.file.uri,
      expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24)
    });

    // TODO: cleanup
    console.log({ fileResult });

    return json({ chatID });
  } catch (err) {
    console.error(err);

    return error(501, { message: "Something went wrong" })
  }
}
