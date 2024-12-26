<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { X, Paperclip, ArrowUp } from 'lucide-svelte';

	let textareaElement: HTMLTextAreaElement;
	let inputFileElement: HTMLInputElement;
	let sendMessageButtonElement: HTMLButtonElement;

	let isLoading = $state(false);
	let errorMessage = $state('');
	let selectedFileName: string | null = $state(null);
	let textareaInput = $state('');

	function handleFileChange(event: Event) {
		const files = (event.target as HTMLInputElement)?.files;
		if (files && files.length > 0) {
			selectedFileName = files[0].name;
		} else {
			selectedFileName = null;
		}
	}

	function clearFiles() {
		if (inputFileElement) {
			inputFileElement.value = ''; // Reset the file input
		}
		selectedFileName = null;
	}
</script>

<form
	method="post"
	action="/chat?/startChat"
	enctype="multipart/form-data"
	class="mt-auto md:mt-2 w-full max-w-lg p-6 rounded-lg bg-card shadow-sm"
	use:enhance={({ cancel }) => {
		isLoading = true;
		if (!selectedFileName || !textareaInput) {
			errorMessage = 'Please upload PDF file and write your question.';
			isLoading = false;
			return cancel();
		}

		if (errorMessage) errorMessage = '';

		return async ({ result }) => {
			if (result.status === 200) {
				/* @ts-expect-error */
				const data = result.data;
				const chatID = data.chatID;
				if (!chatID) return;

				return goto(`/chat/${chatID}`);
			}

			isLoading = false;
		};
	}}
>
	{#if selectedFileName}
		<div class="px-3 py-2 rounded-xl flex items-center border bg-muted max-w-sm space-x-2 mb-4 relative">
			<Button
				variant="outline"
				class="absolute -right-2 -top-2 size-4 p-3"
				on:click={clearFiles}
			>
				<X size={5} class="h-1 w-1" />
			</Button>

			<div class="rounded-md size-10 bg-primary/20 flex items-center justify-center">
				<Paperclip class="h-5 w-5 text-primary" />
			</div>
			<div class="h-12 flex flex-col justify-center overflow-hidden">
				<p class="text-sm font-semibold text-foreground truncate">{selectedFileName}</p>
				<p class="text-xs text-muted-foreground">PDF</p>
			</div>
		</div>
	{/if}
	<div class="space-y-2">
		<Textarea
      ref={textareaElement}
			bind:value={textareaInput}
			class="resize-none focus-visible:ring-ring focus-visible:ring-offset-2"
			placeholder="Ask about file..."
			name="prompt"
		/>
		{#if errorMessage.length > 0}
			<p class="text-sm text-destructive">{errorMessage}</p>
		{/if}
	</div>

	<div class="mt-4 flex items-center justify-between space-x-2 w-full">
		<input bind:this={inputFileElement} onchange={handleFileChange} type="file" name="file" accept="application/pdf" hidden />
		<Button
			variant="outline"
			size="sm"
			class="rounded-full"
			onclick={() => inputFileElement?.click()}
			disabled={isLoading}
		>
			<Paperclip size={16} class="h-4 w-4" />
		</Button>

		<Button
			type="submit"
			class="rounded-full"
      ref={sendMessageButtonElement}
			disabled={isLoading}
		>
			{#if isLoading}
				<svg
					aria-hidden="true"
					class="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-primary dark:fill-primary-foreground"
					viewBox="0 0 100 101"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
						fill="currentColor"
					/>
					<path
						d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
						fill="currentFill"
					/>
				</svg>
				Processing
			{:else}
				<ArrowUp size={16} class="mr-2 h-4 w-4" />
				Start Chat
			{/if}
		</Button>
	</div>
</form>
