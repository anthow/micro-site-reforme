<script lang="ts">
	import MobilisationMedia from '$lib/components/MobilisationMedia.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { siteTitle } from '$lib/seo/identity';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const articles = $derived(data.articles ?? []);
</script>

<Seo
	title={`Mobilisation | ${siteTitle}`}
	description="Textes, images et vidéos pour suivre la mobilisation du secteur CISP."
	indexable={data.seo.indexable}
	siteUrl={data.seo.siteUrl}
/>

<section class="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
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
			{#each articles as article (article.id)}
				<article
					class="overflow-hidden rounded-lg border bg-white dark:bg-page-dark {article.epingle
						? 'border-accent/40'
						: 'border-ink-light/10 dark:border-ink-dark/10'}"
				>
					<MobilisationMedia
						titre={article.titre}
						imageUrl={article.imageUrl}
						videoEmbed={article.videoEmbed}
						href={article.videoEmbed ? null : `/mobilisation/${article.id}`}
					/>
					<div class="px-5 py-5 sm:px-6">
						{#if article.epingle}
							<p class="mb-3">
								<span
									class="inline-block rounded-full bg-accent px-2.5 py-0.5 font-heading text-xs font-semibold tracking-tight text-white"
								>
									Épinglé
								</span>
							</p>
						{/if}
						<h2 class="font-heading text-2xl font-bold leading-tight tracking-tight text-ink-light dark:text-ink-dark">
							<a href={`/mobilisation/${article.id}`} class="transition-colors hover:text-accent">
								{article.titre}
							</a>
						</h2>
						{#if article.resume}
							<p
								class="mt-3 font-heading text-base font-medium leading-relaxed text-ink-light/80 dark:text-ink-dark/80"
							>
								{article.resume}
							</p>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>
