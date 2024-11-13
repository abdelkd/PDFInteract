import { GoogleGenerativeAI } from "@google/generative-ai";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { env } from "$env/dynamic/private";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import type { getChatByID } from "./db/chat";
import type { Thread } from "$lib/types";

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

export const askNewQuestion = (mixedPrompts: Thread[], question: string, fileUri: string) => {
  const SEPARATOR = '-------CONVERSATION--------'
  const mix = mixedPrompts.map((prompt) => {
    return `
    USER:
    ${prompt.user}

    AI:
    ${prompt.ai}
    `
  })

  const initialPrompt = `
    Given This conversation between AI and a User. 
    Each Question and Answer is separated by ${SEPARATOR}.
    ${mix.join(SEPARATOR)}
  
    Based On This History and The file provided, The question is: ${question}.
    THE RULES THAT YOUR MUST FOLLOW:
    - YOUR REPLY MUST NOT BE WRAPPED IN JSON OR ANYTHING.
    - IT'S OKAY TO REPLY WITH LONG AND DESCRIPTIVE TEXT.
  `

  return model.generateContentStream([
    initialPrompt,
    {
      fileData: {
        fileUri,
        mimeType: 'application/pdf',
      }
    }
  ])
}

export function generateChatID() {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(25))
  const timestamp = Date.now()
  const token = encodeBase32LowerCaseNoPadding(tokenBytes) + timestamp.toString()
  return token
}

export function chatHistoryFromChat(chat: Awaited<ReturnType<typeof getChatByID>>[number]): Thread[] {
  return chat.prompt.map((prompt, idx) => ({
    user: prompt,
    ai: chat.answer[idx] ?? ''
  }))
}