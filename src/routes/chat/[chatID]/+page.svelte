<script lang="ts">
	import { page } from '$app/stores';
	import { getChatHistoryState } from '$lib/chat-history-state.svelte';
	import type { LayoutServerData } from './$types';
  import clsx from 'clsx'

	interface Props {
		data: LayoutServerData;
	}

	const { data }: Props = $props();

	let { chatHistory: chatsFromServer } = data;

	let chatHistory = $state<ReturnType<typeof getChatHistoryState>>(getChatHistoryState());

	let newQuestion = $state('');
	let shadowNewQuestion = $state('');
	let chats = chatsFromServer;
	let lastChat = $state(chatsFromServer.at(-1)!);

	const decoder = new TextDecoder();

	const fetchFirstThread = async (chatID: string) => {
		const endpoint = `/chat/${chatID}?prompt-idx=${0}`;

		const response = await fetch(endpoint);
		if (!response.ok) {
		  console.error('Something went wrong');
			return false;
		}

		const reader = response.body?.getReader();
		if (!reader) return;

		let textBuf = '';

		while (true) {
			const { done, value } = await reader.read();
			if (done) return true;

			if (lastChat.ai) lastChat.ai = '';

			textBuf += decoder.decode(value);
			chatHistory.updateLastThread(textBuf);
		}
	};

	$effect(() => {
		if (lastChat?.ai?.length === 0) {
			const chatID = $page.params.chatID;

			(async() => {
				for (let i=0; i < 4; i++) {
	
					const result = await fetchFirstThread(chatID)
					if (result) return;
				}

				console.log('failed')
				chatHistory.updateLastThread('Failed to generate content, try again later.')
			})()
		}
	});

	const handleNewQuestion = async (e: SubmitEvent) => {
		e.preventDefault();
		const endpoint = `/chat/${$page.params.chatID}`;
		let textBuf = '';

		shadowNewQuestion = newQuestion;
		newQuestion = '';
		chatHistory.addThread({
			user: shadowNewQuestion,
			ai: ''
		});

		try {
			await fetch(endpoint, {
				method: 'POST',
				body: JSON.stringify({
					prompt: shadowNewQuestion
				})
			}).then(async (response) => {
				if (!response.ok) {
					throw new Error('');
				}

				const reader = response.body?.getReader();
				if (!reader) return;

				while (true) {
					const { done, value } = await reader.read();

					if (done) {
						console.log('done streaming');
						break;
					}

					textBuf += decoder.decode(value);
					chatHistory.updateLastThread(textBuf);
				}

				console.log(textBuf);
			});
		} catch (err) {
			console.log(err);
			newQuestion = shadowNewQuestion;
			chatHistory.popThread();
		}

		shadowNewQuestion = '';
	};
</script>

{#if !chats}
	<div class="w-fit max-w-md mx-auto pt-36">
		<h1 class="text-4xl">Nothing to show here</h1>
	</div>
{:else}
	<div class="w-fit max-w-lg mx-auto py-6">
		<div class="flex flex-col gap-3">
      <div class="space-y-4">
        {#each chatHistory.chatHistory as chatThread}
          <div class={clsx("p-4 rounded-lg bg-blue-200 ml-auto w-fit")}>
            <p>{chatThread?.user}</p>
					</div>
					<div class={clsx("p-4 rounded-lg bg-gray-200 ml-auto")}>
            <p>{chatThread.ai.length > 0 ? chatThread.ai : 'Analyzing file...'}</p>
					</div>
        {/each}
      </div>

			<div class="mt-5">
				<form onsubmit={handleNewQuestion} class="flex items-center justify-center gap-3 max-w-md">
					<textarea bind:value={newQuestion} class="resize-none border border-gray-300"></textarea>
					<button disabled={newQuestion === ''} class="bg-black text-white px-5 py-2">Send</button>
				</form>
			</div>
		</div>
	</div>
{/if}
