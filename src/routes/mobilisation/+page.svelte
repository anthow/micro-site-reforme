<script lang="ts">
	import AbonnementBadge from '$lib/components/AbonnementBadge.svelte';
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
	{@const detail = articlePath(article.id, article.titre)}
	<article
		class="flex h-full flex-col overflow-hidden rounded-lg border border-ink-light/10 bg-white dark:border-ink-dark/10 dark:bg-page-dark"
	>
		{#if article.imageUrl || article.videoEmbed}
			<MobilisationMedia
				titre={article.titre}
				imageUrl={article.imageUrl}
				videoEmbed={article.videoEmbed}
				href={article.videoEmbed ? null : detail}
			/>
		{/if}
		<div class="min-w-0 px-5 py-5 sm:px-6">
			<h2
				class="whitespace-pre-line font-heading text-2xl font-bold leading-tight tracking-tight text-ink-light dark:text-ink-dark"
			>
				<a href={detail} class="transition-colors hover:text-accent">
					{article.titre}
				</a>
			</h2>
			{#if article.publication}
				<p class="mt-2 font-heading text-sm font-medium tracking-tight text-ink-light/70 dark:text-ink-dark/70">
					<time datetime={article.publication.iso}>{article.publication.label}</time>
				</p>
			{/if}
			{#if article.resume}
				<p
					class="mt-3 whitespace-pre-line font-heading text-base font-medium leading-relaxed text-ink-light/80 dark:text-ink-dark/80"
				>
					{article.resume}
				</p>
			{/if}
			<div class="mt-4 flex flex-wrap items-center gap-3">
				{#if article.lien}
					<a
						href={article.lien}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 font-heading text-sm font-bold tracking-tight text-white transition-opacity hover:opacity-90"
					>
						Lire l'article
					</a>
					{#if article.abonnement}
						<AbonnementBadge />
					{/if}
				{:else}
					<a
						href={detail}
						class="font-heading text-sm font-semibold tracking-tight text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-ink-light hover:decoration-ink-light dark:hover:text-ink-dark dark:hover:decoration-ink-dark"
					>
						Lire la suite
					</a>
				{/if}
			</div>
		</div>
	</article>
{/snippet}

<Seo
	title={`Mobilisation | ${siteTitle}`}
	description="Communiqués de presse, revue de presse et retours d'actions."
	indexable={data.seo.indexable}
	siteUrl={data.seo.siteUrl}
/>

<section class="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
	<h1
		class="mb-8 text-center font-heading text-3xl font-bold leading-[1.15] tracking-tighter text-ink-light dark:text-ink-dark sm:text-4xl"
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
