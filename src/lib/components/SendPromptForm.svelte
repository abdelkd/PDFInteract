<script lang="ts">
	import Paperclip from 'lucide-svelte/icons/paperclip';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import X from 'lucide-svelte/icons/x';

  import { buttonVariants, Button } from '$lib/components/ui/button';

  import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';

	let textarea: HTMLTextAreaElement;
	let inputFile: HTMLInputElement;
  let sendMessageButton: HTMLButtonElement;

	let textareaInput = $state('');
	let selectedFileName = $state<undefined | string>(undefined);
  let isLoading = $state(false);
  let errorMessage = $state('');

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
    if (errorMessage) errorMessage = '';
		if (!e.target) return;

		const files = e.target?.files;
		if (!files || files.length < 1) return;

		const selectedFile = files[0];
		selectedFileName = selectedFile.name;
	};

	const clearFiles = (e: Event) => {
		e.stopPropagation();
    if (errorMessage) errorMessage = '';
		selectedFileName = '';
		inputFile.value = '';
	};
</script>

<form method="post" action="/chat?/startChat" enctype="multipart/form-data" class="mt-auto md:mt-2 w-full max-w-lg p-3 rounded-[2rem] bg-card border" 
  use:enhance={({ formElement, formData, action, cancel, submitter }) => {
    isLoading = true;
    if (!selectedFileName || !textareaInput) {
      errorMessage = 'Please upload PDF file and write your question.';
      
      isLoading = false;
      return cancel();
    }

    if (errorMessage) errorMessage = '';
    

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
  {#if errorMessage.length > 0}
    <p class="text-sm text-[#FF0000]">{errorMessage}</p>
  {/if}

	<div
		class={cn('w-full flex justify-between', { 'grid grid-cols-[1fr_40px]': selectedFileName })}
	>
		<input bind:this={inputFile} onchange={handleFileChange} type="file" name="file" hidden />
    <Button variant="outline" size="icon" class="rounded-full" onclick={() => inputFile?.click()} disabled={isLoading}>
      <Paperclip size={20} />
    </Button>

		<button class={cn(buttonVariants({ variant: "default", className: "rounded-full", size: "icon" }))} bind:this={sendMessageButton} disabled={isLoading}>
      {#if isLoading}
        <div role="status">
          <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
        </div>
      {:else}
        <ArrowUp size={20} />
      {/if}
		</button>
	</div>
</form>
