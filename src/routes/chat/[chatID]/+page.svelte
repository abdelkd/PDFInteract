<script lang="ts">
  import { page } from '$app/stores';

	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import { cn } from '$lib/utils';
	import { getChatHistoryState } from '$lib/chat-history-state.svelte';

	let chatStore = $state(getChatHistoryState());
	let message = $state('');
	let isThinking = $state(false);

  $effect(() => {
    chatStore.chatHistory
    const lastMessage = chatStore.chatHistory.at(-1)
    if (!!lastMessage && lastMessage?.sender === 'user') {
      isThinking = true;

      askQuestion(lastMessage?.text!).then(() => {
        isThinking = false
      });
    }

  })

  async function askQuestion(message: string) {
    const chatID = $page.params.chatID

    const body = JSON.stringify({
      chatId: chatID,
      prompt: message,
    })

    const result = await fetch(`/chat/${chatID}/`, { method: 'POST', body })

    if (!result.ok) {
      chatStore.popThread();
      return console.error('error')
    }

    const reader = result.body?.getReader()!
    const decoder = new TextDecoder();

    let chunk: any;
    let textBuf = '';
    while ((chunk = await reader.read()) && !chunk.done) {
      textBuf += decoder.decode(chunk.value)

      if (chatStore.chatHistory.at(-1).sender !== 'ai') {
        chatStore.addThread({ sender: 'ai', text: textBuf })
        continue;
      }

      chatStore.chatHistory.at(-1).text = textBuf
    }
  }

	async function sendMessage() {
		if (!message.trim()) return;

    isThinking = true;
    chatStore.addThread({ sender: 'user', text: message })

    await askQuestion(message)

    message = '';
		isThinking = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			sendMessage();
		}
	}
</script>

<div class="flex flex-col w-full h-screen bg-zinc-50 dark:bg-zinc-900">
  <ScrollArea class="w-full h-full">
	<div class="flex-grow overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto">
		{#each chatStore.chatHistory as msg}
        <div class:justify-end={msg.sender === 'user'} class="flex">
          <div
            class={cn(
              'p-3 rounded-lg max-w-[80%] break-words',
              msg.sender === 'user'
                ? 'bg-zinc-500 text-white'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
            )}
          >
            {msg.text}
          </div>
        </div>
		{/each}
		{#if isThinking}
			<div class="flex justify-start">
				<div class="p-3 rounded-lg max-w-[80%] bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 animate-pulse">
					Thinking...
				</div>
			</div>
		{/if}

	</div>
  </ScrollArea>

	<div class="p-4 border-t dark:border-zinc-700 w-full max-w-2xl mx-auto">
		<div class="flex space-x-2">
			<Input
				type="text"
				placeholder="Type your message..."
				bind:value={message}
				onkeydown={handleKeyDown}
				disabled={isThinking}
				class="flex-grow"
			/>
			<Button on:click={sendMessage} disabled={isThinking}>
				Send
			</Button>
		</div>
	</div>
</div>

