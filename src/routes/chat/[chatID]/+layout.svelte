<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import { writable } from "svelte/store";
  import type { LayoutServerData } from "./$types";

  interface Props {
    data: LayoutServerData;
    children: Snippet;
  }

  const { data, children }: Props = $props();

  const chat = writable(data.chats);
  $effect.pre(() => {
    console.log(data.chats)
    chat.set(data.chats)
  });

  setContext('chatHistory', chat)
</script>

{@render children()}