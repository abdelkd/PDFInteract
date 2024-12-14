<script lang="ts">
	import clsx from 'clsx';
  import { enhance } from '$app/forms';

	import Paperclip from 'lucide-svelte/icons/paperclip';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import X from 'lucide-svelte/icons/x';
	import { goto } from '$app/navigation';

	let textarea: HTMLTextAreaElement;
	let inputFile: HTMLInputElement;
  let sendMessageButton: HTMLButtonElement;

	let textareaInput = $state('');
	let selectedFileName = $state<undefined | string>(undefined);
  let isLoading = $state(true)

	$effect(() => {
		if (textareaInput === '') {
			textarea.style.height = '35px';
			return;
		}

		if (window?.innerWidth < 700 && textarea.scrollHeight > 70) {
			textarea.style.height = '79px';
			textarea.style.overflowY = 'scroll';
			return;
		}

		textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
		textarea.style.overflowY = textarea.scrollHeight > 100 ? 'scroll' : 'hidden';

		void textareaInput;
		console.log(textarea.scrollHeight);
	});

	const handleFileChange = (e: Event) => {
		if (!e.target) return;

		const files = e.target?.files;
		if (!files || files.length < 1) return;

		const selectedFile = files[0];
		selectedFileName = selectedFile.name;
	};

	const clearFiles = (e: Event) => {
		e.stopPropagation();
		selectedFileName = '';
		inputFile.value = '';
	};
</script>

<form method="post" action="/chat?/startChat" enctype="multipart/form-data" class="mt-auto md:mt-2 w-full max-w-lg p-4 rounded-[2rem] bg-card border" 
  use:enhance={({ formElement, formData, action, cancel, submitter }) => {
    isLoading = true;

		return async ({ result, update }) => {
      if (result.status === 200) {
        /* @ts-expect-error */
        const data = result.data
        const chatID = data.chatID
        if (!chatID) return;

        return goto(`/chat/${chatID}`)
      }

      isLoading = false;
		};
	}}>
	<textarea
		bind:this={textarea}
		bind:value={textareaInput}
		class="resize-none overflow-y-hidden placeholder:text-card--placeholder bg-transparent focus-visible:outline-none w-full"
		placeholder="Ask about file..."
    name="prompt"
	></textarea>

	<div
		class={clsx('w-full flex justify-between', { 'grid grid-cols-[1fr_40px]': selectedFileName })}
	>
		<input bind:this={inputFile} onchange={handleFileChange} type="file" name="file" hidden />
		<button class="w-fit" onclick={() => inputFile?.click()} disabled={isLoading}>
			<div
				class={clsx(
					'relative h-10 border bg-[#DFDDDD] rounded-full flex justify-center items-center min-w-10 w-fit px-2'
				)}
			>
				<Paperclip size={20} />
				{#if selectedFileName}
					<p class="pl-3 cursor-pointer">{selectedFileName}</p>

					<a
            href="/"
						aria-label="remove file"
						role="button"
						tabindex="0"
						onclick={clearFiles}
						class="ml-2 absolute -right-6 size-4 bg-red-500 flex justify-center items-center text-background rounded-full"
					>
						<X size={14} />
					</a>
				{/if}
			</div>
		</button>

		<button bind:this={sendMessageButton} disabled={isLoading}>
			<div
				class={clsx("size-10 border bg-primary text-primary-foreground rounded-full flex justify-center items-center", {"bg-gray-300 text-gray-500": isLoading})}
			>
				<ArrowUp size={20} />
			</div>
		</button>
	</div>
</form>
