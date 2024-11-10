<script lang="ts">
  import type { PageServerData } from "./$types";

  interface Props {
    data: PageServerData;
  }

  const { data }: Props = $props();

  const { result } = data
</script>

{#if !result}
  <div class="w-fit max-w-md mx-auto pt-36">
    <h1 class="text-4xl">Nothing to show here</h1>  
  </div>
{:else}
  <div class="w-fit max-w-lg mx-auto py-6">
    <div class="flex flex-col gap-3">
      {#each result as query}
        <div class="max-w-lg border border-slate-200 rounded-md px-2 py-1">
          <h1 class="text-3xl mb-3">{query.prompt}</h1>
          <p>{query.answer}</p>
        </div>
      {/each}
    </div>
  </div>
{/if}