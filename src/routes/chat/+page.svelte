<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import UploadFileIndicator from '$lib/components/UploadFileIndicator.svelte';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let files: FileList | undefined = $state(undefined);
	let fileInput: HTMLInputElement;

	let isLoading = $state(false);
	let errorMessage = $state('Something went wrong, try again.');
</script>

<div class="mx-auto w-fit pt-20">
	<h3>Chat With your PDF</h3>
	<form
		method="post"
		enctype="multipart/form-data"
		class="flex flex-col items-start"
		action="?/startChat"
		use:enhance={() => {
			isLoading = true;
			errorMessage = '';

			return async ({ result, update }) => {
				await applyAction(result);

				if (form?.error) {
					isLoading = false;
					errorMessage = 'Something went wrong, try again';
				}

				if (form?.chatID) {
					goto('/chat/' + form.chatID);
				}
			};
		}}
	>
		<textarea
			id="prompt"
			name="prompt"
			class="block border border-gray-200 my-5 w-full h-20 resize-none px-1"
		></textarea>

		<input bind:this={fileInput} type="file" name="pdf-file" bind:files accept=".pdf" />

		<UploadFileIndicator bind:files resetFileInput={() => (fileInput.value = '')} />
		{#if form?.error}
			<p>{errorMessage}</p>
		{/if}

		<button
			disabled={isLoading}
			class="px-4 w-24 py-1.5 text-slate-50 rounded-lg bg-gray-950 disabled:bg-gray-700"
			type="submit"
		>
			{isLoading ? '...' : 'submit'}
		</button>
	</form>
</div>
