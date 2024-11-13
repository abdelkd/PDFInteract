import { getContext, setContext } from "svelte";
import type { Thread } from "./types";


class ChatHistory {
  chatHistory = $state<Thread[]>([]);

  constructor(threads: Thread[]) {
    this.chatHistory = threads;
  }

  addThread(thread: Thread) {
    this.chatHistory.push(thread);
  }

  update(threads: Thread[]) {
    this.chatHistory = threads;
  }

  updateLastThread(aiText: string) {
    const oldThreads = this.chatHistory.slice(0, this.chatHistory.length - 1);
    const lastThread = this.chatHistory.at(-1);
    if (lastThread) {
      lastThread.ai = aiText
    }
  }
}

const CHAT_HISTORY = Symbol('CHAT_HISTORY');

export function setChatHistoryState(defaultChatHistory: Thread[] = []) {
  return setContext(CHAT_HISTORY, new ChatHistory(defaultChatHistory));
}

export function getChatHistoryState() {
  return getContext<ReturnType<typeof setChatHistoryState>>(CHAT_HISTORY)
}