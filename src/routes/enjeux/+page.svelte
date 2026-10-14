<script lang="ts">
	import FaqItem from '$lib/components/FaqItem.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { siteTitle } from '$lib/seo/identity';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const faq = $derived(data.faq ?? []);
	const maj = $derived(data.enjeuxMaj);
	const showMaj = $derived(Boolean(maj?.texte || maj?.date));
</script>

<Seo
	title={`Enjeux réforme | ${siteTitle}`}
	description="Questions et réponses sur la réforme."
	indexable={data.seo.indexable}
	siteUrl={data.seo.siteUrl}
/>

<section class="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
	<h1
		class="mb-8 text-center font-heading text-3xl font-bold leading-[1.15] tracking-tighter text-ink-light dark:text-ink-dark sm:text-4xl"
	>
		Enjeux réforme
	</h1>

	{#if data.errors.parametres}
		<p class="mb-8 text-center font-heading text-sm font-medium text-ink-light/70 dark:text-ink-dark/70" role="status">
			La mise à jour n'a pas pu être chargée.
		</p>
	{:else if showMaj}
		<p
			class="mb-8 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-center font-heading text-sm font-semibold tracking-tight text-ink-light dark:text-ink-dark"
		>
			Dernière mise à jour
			{#if maj.date}
				<time datetime={maj.date.iso}> · {maj.date.label}</time>
			{/if}
			{#if maj.texte}
				<span class="mt-1 block whitespace-pre-line font-medium">{maj.texte}</span>
			{/if}
		</p>
	{/if}

	{#if data.loadError}
		<p class="font-heading text-base font-medium text-ink-light/70 dark:text-ink-dark/70" role="status">
			Les questions n'ont pas pu être chargées. Réessayez plus tard.
		</p>
	{:else if faq.length === 0}
		<p class="font-sans text-ink-light/60 dark:text-ink-dark/60">Aucune question pour le moment.</p>
	{:else}
		<div>
			{#each faq as item (item.id)}
				{#if item.Question && item.Réponse}
					<FaqItem question={item.Question} answer={item.Réponse} />
				{/if}
			{/each}
		</div>
	{/if}
</section>
