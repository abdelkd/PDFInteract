<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { goto } from "$app/navigation";
	import UploadFileIndicator from "$lib/components/UploadFileIndicator.svelte";
  import type { ActionData } from './$types'

  let { form }: { form: ActionData } = $props()

  let files: FileList | undefined = $state(undefined);
  let fileInput: HTMLInputElement;
</script>

<div class="mx-auto w-fit pt-20">
  <h3>Chat With your PDF</h3>
  <form 
    method="post" 
    enctype="multipart/form-data" 
    class="flex flex-col items-start" 
    action="?/startChat" 
    use:enhance={() => {
      return async ({ result, update }) => {
        await applyAction(result)

        if (form?.chatID) {
          goto("/chat/" + form.chatID)
        }
      };
    }}>

    <textarea value="what's the name of the person in this resume?" id="prompt" name="prompt" class="block border border-gray-200 my-5 w-full h-20 resize-none px-1"></textarea>

    <input
      bind:this={fileInput}
      type="file" 
      name="pdf-file"
      bind:files={files} 
      accept=".pdf"/>

    <UploadFileIndicator bind:files={files} resetFileInput={() => fileInput.value = ""} />

    <button type="submit">submit</button>
  </form>
</div>