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

	const introHtml = $derived(homepage?.Texte?.trim() || null);

	const introProse =
		'font-heading text-[0.95rem] font-medium leading-[1.55] tracking-normal text-ink-light/90 dark:text-ink-dark/90 sm:text-base sm:leading-snug sm:tracking-tight [&_a]:text-accent [&_a]:underline [&_li]:mt-1.5 [&_p]:mb-5 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_strong]:text-accent [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul:last-child]:mb-0';
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
		<div class="mx-auto max-w-3xl px-5 py-8 sm:max-w-6xl sm:px-6 sm:py-10">
			<div class="mb-4 flex justify-center gap-2 sm:hidden" aria-hidden="true">
				<img src="/cone.png" alt="" class="h-6 w-auto" />
				<img src="/cone.png" alt="" class="h-6 w-auto" />
			</div>
			<h1
				class="text-balance text-center font-heading text-[1.45rem] font-bold leading-[1.2] tracking-tight text-ink-light dark:text-ink-dark sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-[1.05]"
			>
				<span class="sm:inline-flex sm:items-center sm:gap-3">
					<img
						src="/cone.png"
						alt=""
						class="hidden h-8 w-auto sm:inline sm:h-10"
						aria-hidden="true"
					/>
					<span>{homepage.Titre}</span>
					<img
						src="/cone.png"
						alt=""
						class="hidden h-8 w-auto sm:inline sm:h-10"
						aria-hidden="true"
					/>
				</span>
			</h1>
			{#if slogans[0]}
				<p class="mt-4 text-center font-heading text-base font-bold tracking-tight text-accent sm:text-xl">
					{slogans[0]}
				</p>
			{/if}
		</div>
	</section>

	{#if introHtml}
		<section class="mx-auto max-w-3xl px-5 py-8 sm:max-w-5xl sm:px-6 sm:py-10">
			<div class={introProse}>
				{@html introHtml}
			</div>
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
