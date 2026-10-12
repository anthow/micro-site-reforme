<script lang="ts">
	import '../app.css';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" type="image/png" href="/favicon.png" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	{#if !data.seo.indexable}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>

{@render children()}
