<script lang="ts">
  interface Props {
    files: FileList | null | undefined;
    resetFileInput: () => void;
  }

  let { files = $bindable(), resetFileInput }: Props = $props()  
  let filename = $state<string | undefined>(undefined);
  $effect(() => {
    filename = files?.item(0)?.name
  })

  const resetFile = () => {
    filename = undefined
    resetFileInput()
  }
</script>

<div class="my-3">
  {#if !filename}
    <p>No Files Selected</p>
  {:else if filename}
    <div class="w-full flex gap-5 items-center">
      <p>
        {filename}
      </p>
      <button onclick={resetFile} class="text-slate-50 size-7 p-0 flex justify-center items-center bg-red-600 text-lg">x</button>
    </div>
  {/if}
</div>