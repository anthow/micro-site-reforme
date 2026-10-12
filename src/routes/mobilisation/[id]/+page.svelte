<script lang="ts">
	import MobilisationMedia from '$lib/components/MobilisationMedia.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { splitParagraphs } from '$lib/mobilisation';
	import { siteTitle } from '$lib/seo/identity';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const article = $derived(data.article);
	const paragraphs = $derived(splitParagraphs(article?.texte));
	const description = $derived(article?.resume || 'Mobilisation du secteur CISP.');
</script>

{#if article}
	<Seo
		title={`${article.titre} | ${siteTitle}`}
		{description}
		type="article"
		indexable={data.seo.indexable}
		siteUrl={data.seo.siteUrl}
	/>
{/if}

<article class="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
	<p class="mb-8">
		<a
			href="/mobilisation"
			class="font-heading text-sm font-semibold tracking-tight text-ink-light/70 underline decoration-ink-light/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent dark:text-ink-dark/70"
		>
			Retour à la mobilisation
		</a>
	</p>

	{#if data.loadError || !article}
		<p class="font-heading text-base font-medium text-ink-light/70 dark:text-ink-dark/70" role="status">
			L'article n'a pas pu être chargé. Réessayez plus tard.
		</p>
	{:else}
		<h1
			class="mb-8 font-heading text-3xl font-bold leading-[1.15] tracking-tighter text-ink-light dark:text-ink-dark sm:text-4xl"
		>
			{article.titre}
		</h1>

		<div class="overflow-hidden rounded-lg border border-ink-light/10 dark:border-ink-dark/10">
			<MobilisationMedia
				titre={article.titre}
				imageAlt=""
				imageUrl={article.imageUrl}
				videoEmbed={article.videoEmbed}
				eager
			/>
		</div>

		{#if article.texteHtml && article.texte}
			<div
				class="mt-8 font-heading text-base font-medium leading-relaxed text-ink-light/90 dark:text-ink-dark/90 [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 [&_a]:underline-offset-2 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:tracking-tight [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:tracking-tight [&_li]:mb-2 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_strong]:font-bold [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
			>
				{@html article.texte}
			</div>
		{:else if paragraphs.length > 0}
			<div class="mt-8">
				{#each paragraphs as paragraph}
					<p
						class="mb-4 whitespace-pre-line font-heading text-base font-medium leading-relaxed text-ink-light/90 last:mb-0 dark:text-ink-dark/90"
					>
						{paragraph}
					</p>
				{/each}
			</div>
		{/if}
	{/if}
</article>
