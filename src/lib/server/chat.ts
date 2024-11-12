import { GoogleGenerativeAI } from "@google/generative-ai";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { env } from "$env/dynamic/private";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const mimeType = "application/pdf"

export const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
export const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY)
export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
})


export const askPDF = async (pdfUri: string, prompt: string) => {

  const result = await model.generateContent([
    prompt,
    {
      fileData: {
        mimeType,
        fileUri: pdfUri,
      }
    }
  ])

  return result.response
}

type GetAIResponseArgs = ({
  prompt: string,
  pdfUri: string,
  callback: (data: string) => void;
  onEnd: (response: string) => void;
})

export const getStreamedAIResponse = async (args: GetAIResponseArgs) => {
  const { prompt, pdfUri, callback, onEnd } = args;
  const response = await model.generateContentStream([
    'As an LLM that answers questions from the provided PDF file,\
    Here is a question about the provided PDF file and you have to answer it.',
    prompt,
    {
      fileData: {
        fileUri: pdfUri,
        mimeType: 'application/pdf',
      }
    }
  ])


  while (true) {
    const { done, value } = await response.stream.next()
    if (done) return onEnd((await response.response).text());

    if (value) {
      callback(value.text())
    }
  }
}

export function generateChatID() {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(25))
  const timestamp = Date.now()
  const token = encodeBase32LowerCaseNoPadding(tokenBytes) + timestamp.toString()
  return token
}