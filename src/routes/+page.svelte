<script lang="ts">
	import ContactForm from '$lib/components/ContactForm.svelte';
	import FaqItem from '$lib/components/FaqItem.svelte';
	import HeroCarousel from '$lib/components/HeroCarousel.svelte';
	import IndustryTestimonials from '$lib/components/IndustryTestimonials.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { siteTitle } from '$lib/seo/identity';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const homepage = $derived(data.homepage);
	const points = $derived(data.points ?? []);
	const faq = $derived(data.faq ?? []);
	const slides = $derived(data.slides ?? []);
	const videos = $derived((data.videos ?? []).filter((video) => Boolean(video.url)));
	const slogans = $derived(data.slogans ?? []);
	const errors = $derived(data.errors);

	const introParagraphs = $derived(
		homepage?.Texte
			? homepage.Texte.split(/\n\s*\n+/)
					.map((paragraph) => paragraph.trim())
					.filter(Boolean)
			: []
	);
</script>

{#snippet slogan(text: string)}
	<p
		class="flex items-center justify-center gap-3 text-center font-heading text-2xl font-bold leading-tight tracking-tight text-accent sm:text-3xl"
	>
		<img src="/cone.png" alt="" class="h-7 w-auto shrink-0 sm:h-8" aria-hidden="true" />
		<span class="max-w-xl">{text}</span>
		<img src="/cone.png" alt="" class="h-7 w-auto shrink-0 sm:h-8" aria-hidden="true" />
	</p>
{/snippet}

<Seo
	title={siteTitle}
	description={homepage?.Soustitre ?? ''}
	indexable={data.seo.indexable}
	siteUrl={data.seo.siteUrl}
/>

{#if errors.homepage || errors.faq || errors.videos}
	<div
		class="border-b border-accent/30 bg-accent/10 px-4 py-3 text-center font-sans text-sm text-ink-light dark:text-ink-dark"
		role="status"
	>
		Certaines informations n'ont pas pu être chargées. Réessayez plus tard.
	</div>
{/if}

{#if !homepage}
	<section class="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
		<p class="font-sans text-ink-light/70 dark:text-ink-dark/70">
			Le contenu de la page d'accueil n'est pas disponible pour le moment.
		</p>
	</section>
{:else}
	{#if homepage.Image_hero_URL}
		<div class="border-b border-ink-light/10 dark:border-ink-dark/10">
			<img src={homepage.Image_hero_URL} alt="" class="block w-full object-cover" loading="eager" />
		</div>
	{/if}

	<section class="border-b border-ink-light/10 dark:border-ink-dark/10">
		<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
			<h1
				class="text-center font-heading text-3xl font-bold leading-[1.05] tracking-tight text-ink-light dark:text-ink-dark sm:text-4xl lg:text-5xl"
			>
				<span class="inline-flex items-center gap-3">
					<img src="/cone.png" alt="" class="h-8 w-auto sm:h-10" aria-hidden="true" />
					<span>{homepage.Titre}</span>
					<img src="/cone.png" alt="" class="h-8 w-auto sm:h-10" aria-hidden="true" />
				</span>
			</h1>
			{#if slogans[0]}
				<p class="mt-4 text-center font-heading text-lg font-bold tracking-tight text-accent sm:text-xl">
					{slogans[0]}
				</p>
			{/if}
		</div>
	</section>

	{#if introParagraphs.length > 0}
		<section class="mx-auto max-w-5xl px-3 py-7 sm:px-4 sm:py-10">
			{#each introParagraphs as paragraph}
				<p
					class="mb-4 whitespace-pre-line font-heading text-base font-medium leading-snug tracking-tight text-ink-light/90 last:mb-0 dark:text-ink-dark/90 [&_strong]:font-bold"
				>
					{@html paragraph}
				</p>
			{/each}
		</section>
	{/if}

	{#if points.length > 0}
		<ul class="mx-auto mb-8 flex max-w-3xl flex-col gap-3 px-4 text-left">
			{#each points as point, i (i)}
				<li
					class="flex items-start gap-3 rounded-lg border border-accent/25 bg-accent/10 px-4 py-3 font-heading text-base font-semibold leading-snug text-ink-light dark:text-ink-dark"
				>
					<img src="/cone.png" alt="" class="mt-0.5 h-5 w-auto shrink-0" aria-hidden="true" />
					<span class="whitespace-pre-line">{point}</span>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

{#if slides.length > 0}
	<HeroCarousel {slides} />
{:else}
	<div class="bg-page-light px-4 py-8 dark:bg-page-dark sm:px-6 sm:py-10">
		<img
			src={encodeURI('/Banderole (Ré)Former sans exclure.png')}
			alt="(Ré)Former sans exclure"
			class="mx-auto block w-full max-w-md object-contain sm:max-w-xl"
			loading="lazy"
		/>
	</div>
{/if}

<section
	id="enjeux"
	class="scroll-mt-28 border-t border-ink-light/10 bg-ink-light/[0.02] dark:border-ink-dark/10 dark:bg-ink-dark/[0.02]"
>
	<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
		{#if homepage?.Soustitre}
			<p
				class="mb-10 text-center font-heading text-xl font-bold leading-tight tracking-tight text-ink-light dark:text-ink-dark sm:text-2xl"
			>
				{homepage.Soustitre}
			</p>
		{/if}

		{#if faq.length === 0}
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
	</div>
</section>

{#if videos.length > 0}
	<section
		id="temoignages"
		class="scroll-mt-28 border-t border-ink-light/10 bg-ink-light/[0.02] dark:border-ink-dark/10 dark:bg-ink-dark/[0.02]"
	>
		<div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
			<img
				src={encodeURI('/Ecoutez le terrain.png')}
				alt="Écoutez le terrain"
				class="mx-auto mb-6 block h-52 w-auto object-contain sm:h-64"
				loading="lazy"
			/>
			{#if slogans[1]}
				<div class="mb-3">
					{@render slogan(slogans[1])}
				</div>
			{/if}
			<h2
				class="mb-10 text-center font-heading text-xl font-bold leading-tight tracking-tight text-ink-light dark:text-ink-dark sm:text-2xl"
			>
				Témoignages du secteur
			</h2>
			<IndustryTestimonials {videos} />
		</div>
	</section>
{/if}

{#if slogans[2]}
	<div class="px-4 py-14 sm:py-20">
		{@render slogan(slogans[2])}
	</div>
{/if}

<ContactForm {form} siteKey={data.recaptchaSiteKey} />
