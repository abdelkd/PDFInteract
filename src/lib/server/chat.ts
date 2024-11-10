import { GoogleGenerativeAI } from "@google/generative-ai";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { env } from "$env/dynamic/private";
import { GoogleAIFileManager } from "@google/generative-ai/server";

export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
export const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY)
export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
})

export const askPDF = async (pdfFileBuffer: Buffer, prompt: string) => {
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: pdfFileBuffer.toString("base64"),
        mimeType: "application/pdf"
      }
    }
  ])

  return result.response.text()
}

export function generateChatID() {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(25))
  const timestamp = Date.now()
  const token = encodeBase32LowerCaseNoPadding(tokenBytes) + timestamp.toString()
  return token
}