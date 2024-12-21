<script lang="ts">
import '@fontsource-variable/montserrat'
	import '../app.css';
	let { children } = $props();
</script>

<div class="w-screen h-dvh md:h-screen px-3">
	{@render children()}
</div>
