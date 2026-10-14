<script lang="ts">
	import AvisArticle from '$lib/components/AvisArticle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<AvisArticle
	blocs={data.blocs}
	loadError={data.loadError}
	indexable={data.seo.indexable}
	siteUrl={data.seo.siteUrl}
/>
