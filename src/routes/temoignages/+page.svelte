<script lang="ts">
	import ReelGrid from '$lib/components/ReelGrid.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { siteTitle } from '$lib/seo/identity';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const videos = $derived(data.videos ?? []);
</script>

<Seo
	title={`Témoignages secteur | ${siteTitle}`}
	description="Témoignages vidéo du secteur."
	indexable={data.seo.indexable}
	siteUrl={data.seo.siteUrl}
/>

<section class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
	<h1
		class="mb-10 text-center font-heading text-3xl font-bold leading-[1.15] tracking-tighter text-ink-light dark:text-ink-dark sm:text-4xl"
	>
		Témoignages secteur
	</h1>

	{#if data.loadError}
		<p class="text-center font-heading text-base font-medium text-ink-light/70 dark:text-ink-dark/70" role="status">
			Les témoignages n'ont pas pu être chargés. Réessayez plus tard.
		</p>
	{:else if videos.length === 0}
		<p class="text-center font-heading text-base font-medium text-ink-light/70 dark:text-ink-dark/70">
			Aucun témoignage pour le moment.
		</p>
	{:else}
		<ReelGrid {videos} titleFallback="Témoignage vidéo" />
	{/if}
</section>
