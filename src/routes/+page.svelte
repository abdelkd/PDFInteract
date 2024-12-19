<script lang="ts">
	import SendPromptForm from '$lib/components/SendPromptForm.svelte';
</script>

<div class="w-full h-dvh overflow-x-hidden pb-2 flex flex-col md:items-center">
	<div
		class="mx-auto pt-28 w-full px-6 md:w-5/12 md:min-w-[600px] h-full flex flex-col items-center"
	>
		<div class="flex grow items-center md:block md:grow-0">
			<h1 class="text-[clamp(1.5rem,4vw,1.8rem)] text-nowrap mb-2 text-center">Need help with your PDF?</h1>
		</div>

		<SendPromptForm />
	</div>
</div>
