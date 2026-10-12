<script lang="ts">
	import MobilisationMedia from '$lib/components/MobilisationMedia.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { articlePath } from '$lib/mobilisation';
	import { siteTitle } from '$lib/seo/identity';
	import type { MobilisationArticle } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const articles = $derived(data.articles ?? []);
	const pinned = $derived(articles.filter((article) => article.epingle));
	const following = $derived(articles.filter((article) => !article.epingle));
</script>

{#snippet card(article: MobilisationArticle)}
	{@const href = article.lien ?? articlePath(article.id, article.titre)}
	{@const external = article.lien != null}
	<article
		class="flex h-full flex-col overflow-hidden rounded-lg border bg-white dark:bg-page-dark {article.epingle
			? 'border-accent/40'
			: 'border-ink-light/10 dark:border-ink-dark/10'}"
	>
		{#if article.imageUrl || article.videoEmbed}
			<MobilisationMedia
				titre={article.titre}
				imageUrl={article.imageUrl}
				videoEmbed={article.videoEmbed}
				href={article.videoEmbed ? null : href}
				{external}
			/>
		{/if}
		<div class="min-w-0 px-5 py-5 sm:px-6">
			<h2 class="font-heading text-2xl font-bold leading-tight tracking-tight text-ink-light dark:text-ink-dark">
				<a
					{href}
					target={external ? '_blank' : undefined}
					rel={external ? 'noopener noreferrer' : undefined}
					class="transition-colors hover:text-accent"
				>
					{article.titre}
				</a>
			</h2>
			{#if article.publication}
				<p class="mt-2 font-heading text-sm font-medium tracking-tight text-ink-light/70 dark:text-ink-dark/70">
					<time datetime={article.publication.iso}>{article.publication.label}</time>
				</p>
			{/if}
			{#if article.resume}
				<p class="mt-3 font-heading text-base font-medium leading-relaxed text-ink-light/80 dark:text-ink-dark/80">
					{article.resume}
				</p>
			{/if}
			<p class="mt-4">
				<a
					{href}
					target={external ? '_blank' : undefined}
					rel={external ? 'noopener noreferrer' : undefined}
					class="font-heading text-sm font-semibold tracking-tight text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-ink-light hover:decoration-ink-light dark:hover:text-ink-dark dark:hover:decoration-ink-dark"
				>
					{article.abonnement ? 'Lire plus (accès abonnés)' : 'Lire la suite'}
				</a>
			</p>
		</div>
	</article>
{/snippet}

<Seo
	title={`Mobilisation | ${siteTitle}`}
	description="Textes, images et vidéos pour suivre la mobilisation du secteur CISP."
	indexable={data.seo.indexable}
	siteUrl={data.seo.siteUrl}
/>

<section class="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
	<h1
		class="mb-10 text-center font-heading text-3xl font-bold leading-[1.15] tracking-tighter text-ink-light dark:text-ink-dark sm:text-4xl"
	>
		Mobilisation
	</h1>

	{#if data.loadError}
		<p class="font-heading text-base font-medium text-ink-light/70 dark:text-ink-dark/70" role="status">
			Les articles n'ont pas pu être chargés. Réessayez plus tard.
		</p>
	{:else if articles.length === 0}
		<p class="font-heading text-base font-medium text-ink-light/70 dark:text-ink-dark/70">
			Aucun article pour le moment.
		</p>
	{:else}
		<div class="flex flex-col gap-10">
			{#if pinned.length > 0}
				<div class={pinned.length > 1 ? 'grid gap-8 sm:grid-cols-2' : ''}>
					{#each pinned as article (article.id)}
						{@render card(article)}
					{/each}
				</div>
			{/if}
			{#if following.length > 0}
				<div class="grid gap-8 sm:grid-cols-2">
					{#each following as article (article.id)}
						{@render card(article)}
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</section>
