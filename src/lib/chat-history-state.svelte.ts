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

  popThread() {
    this.chatHistory.pop()
  }

  updateLastThread(chunk: string) {
    const lastThread = this.chatHistory.at(-1)
    if (!lastThread) return;

    lastThread.text += chunk;
  }
}

const CHAT_HISTORY = Symbol('CHAT_HISTORY');

export function setChatHistoryState(defaultChatHistory: Thread[] = []) {
  return setContext(CHAT_HISTORY, new ChatHistory(defaultChatHistory));
}

export function getChatHistoryState() {
  return getContext<ReturnType<typeof setChatHistoryState>>(CHAT_HISTORY)
}
