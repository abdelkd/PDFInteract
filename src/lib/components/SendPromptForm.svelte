<script lang="ts">
	import Paperclip from 'lucide-svelte/icons/paperclip';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import X from 'lucide-svelte/icons/x';

  import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';

	let textarea: HTMLTextAreaElement;
	let inputFile: HTMLInputElement;
  let sendMessageButton: HTMLButtonElement;

	let textareaInput = $state('');
	let selectedFileName = $state<undefined | string>(undefined);
  let isLoading = $state(false)

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

<form method="post" action="/chat?/startChat" enctype="multipart/form-data" class="mt-auto md:mt-2 w-full max-w-lg p-3 rounded-[2rem] bg-card border" 
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
  {#if selectedFileName}
    <div class="px-1.5 py-1 rounded-md flex items-center border bg-slate-50/80 max-w-[16rem] space-x-2 mb-2 relative">
      <button onclick={clearFiles} class="size-4 flex justify-center items-center bg-white text-xs rounded-full border absolute -right-1 -top-1">
        <X size={14} />
      </button>

      <div class="rounded-md size-10 bg-red-400"></div>
      <div class="height-[3rem]">
        <p class="text-lg font-semibold whitespace-nowrap overflow-ellipsis overflow-hidden max-w-[10rem]">{selectedFileName}</p>
        <p class="text-muted-foreground">PDF</p>
      </div>
    </div>

      
  {/if}
	<textarea
		bind:this={textarea}
		bind:value={textareaInput}
		class="resize-none overflow-y-hidden placeholder:text-card--placeholder bg-transparent focus-visible:outline-none w-full"
		placeholder="Ask about file..."
    name="prompt"
	></textarea>

	<div
		class={cn('w-full flex justify-between', { 'grid grid-cols-[1fr_40px]': selectedFileName })}
	>
		<input bind:this={inputFile} onchange={handleFileChange} type="file" name="file" hidden />
		<button class="w-fit relative z-10" onclick={() => inputFile?.click()} disabled={isLoading}>
			<span
				class={cn(
					'relative h-10 border rounded-full flex justify-center items-center min-w-10 w-fit hover:bg-slate-50 transition-colors duration-300 disabled:bg-slate-100'
				)}
			>
				<Paperclip size={20} />
			</span>
		</button>

    <Button
		<button bind:this={sendMessageButton} disabled={isLoading}>
			<div
				class={cn("size-10 border bg-primary text-primary-foreground rounded-full flex justify-center items-center", {"bg-gray-300 text-gray-500": isLoading})}
			>
				<ArrowUp size={20} />
			</div>
		</button>
	</div>
</form>
