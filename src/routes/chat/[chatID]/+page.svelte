<script lang="ts">
	import { page } from "$app/stores";
  import type { LayoutServerData } from "./$types";

  interface Props {
    data: LayoutServerData
  }

  const { data }: Props = $props();

  let { chats: chatsFromServer, initialized } = data

  let chats = $state(chatsFromServer.slice(0, chatsFromServer.length - 1));
  let lastChat = $state(chatsFromServer.at(-1)!);

  const chatAnswered = $derived(lastChat?.answer)
  const decoder = new TextDecoder()

  $effect(() => {
    if (!initialized) {
      lastChat.answer = '';
      
      const chatID = $page.params.chatID;
      const endpoint = `/chat/${chatID}?prompt-idx=${0}`;
      
      fetch(endpoint).then(async (response) => {
        const reader = response.body?.getReader()
        if (!reader) return;
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) return;

          if (!lastChat.answer) lastChat.answer = '';

          const text = decoder.decode(value);
          lastChat.answer += text

          console.log('Chunk:', lastChat.answer)
        }
      })
    }
  });
</script>

{#if !chats}
  <div class="w-fit max-w-md mx-auto pt-36">
    <h1 class="text-4xl">Nothing to show here</h1>  
  </div>
{:else}
  <div class="w-fit max-w-lg mx-auto py-6">
    <div class="flex flex-col gap-3">
      {#each chats as query}
        <div class="max-w-lg border border-slate-200 rounded-md px-2 py-1">
          <h1 class="text-3xl mb-3">{query.prompt}</h1>
          <p>{chatAnswered ? query.answer : "Analyzing file..."}</p>
        </div>
      {/each}

      <div class="max-w-lg border border-slate-200 rounded-md px-2 py-1">
        <h1 class="text-3xl mb-3">{lastChat.prompt}</h1>
        <p>{lastChat.answer ? lastChat.answer : "Analyzing file..."}</p>
      </div>
    </div>
  </div>
{/if}