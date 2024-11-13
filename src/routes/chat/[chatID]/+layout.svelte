<script lang="ts">
  import { type Snippet } from "svelte";
  import type { LayoutServerData } from "./$types";
	import { setChatHistoryState } from "$lib/chat-history-state.svelte";

  type Props = {
    data: LayoutServerData;
    children: Snippet;
  }

  const { data, children }: Props = $props();

  setChatHistoryState(data.chatHistory);
</script>

{@render children()}