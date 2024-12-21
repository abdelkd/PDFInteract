<script lang="ts">
import '@fontsource-variable/montserrat'
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
  <title>PDF Interact: AI-Powered PDF Q&A Tool</title>
  <meta name="description" content="Unlock insights from PDFs with PDF Interact, an AI-powered tool for extracting answers to your questions. Perfect for research and study." />
  <meta name="keywords" content="PDF question answering tool, extract information from PDF, get answers from PDFs, PDF research assistant, AI-powered PDF analysis, PDF content extraction tool, intelligent PDF question answering, PDF study aid, PDF AI interaction tool, PDF Q&A, efficient PDF research tool, quick PDF answer extraction">
</svelte:head>

<div class="w-screen h-dvh md:h-screen px-3">
	{@render children()}
</div>
