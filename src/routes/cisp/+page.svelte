<script lang="ts">
	import { slide } from 'svelte/transition';
	import Seo from '$lib/components/Seo.svelte';
	import YoutubeCarousel from '$lib/components/YoutubeCarousel.svelte';
	import { siteTitle } from '$lib/seo/identity';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const intro = $derived(data.blocs.find((bloc) => bloc.role === 'intro') ?? null);
	const videos = $derived(data.blocs.filter((bloc) => bloc.role === 'outil' && bloc.videoUrl));
	const tiroirs = $derived(data.blocs.filter((bloc) => bloc.role === 'tiroir' && bloc.texte));
	const chiffres = $derived(data.blocs.filter((bloc) => bloc.role === 'outil' && !bloc.videoUrl && (bloc.lien || bloc.imageUrl)));
	let ouvert = $state<number | null>(null);

	const html =
		'font-heading text-base font-medium leading-snug tracking-tight text-ink-light dark:text-ink-dark [&_a]:text-accent [&_a]:underline [&_li]:mt-1 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_strong]:text-accent [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul:last-child]:mb-0';

	function plain(value: string) {
		return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
	}
</script>

<Seo
	title={`CISP ? | ${siteTitle}`}
	description={intro?.texte ? plain(intro.texte) : 'Ce qu’est un CISP, à qui il s’adresse, et comment on s’y forme.'}
	indexable={data.seo.indexable}
	siteUrl={data.seo.siteUrl}
/>

<section class="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
	<h1
		class="text-center font-heading text-3xl font-bold leading-[1.15] tracking-tighter text-ink-light dark:text-ink-dark sm:text-4xl"
	>
		{intro?.titre ?? 'CISP ?'}
	</h1>

	{#if data.loadError}
		<p class="mt-8 font-heading text-base font-medium text-ink-light/70 dark:text-ink-dark/70" role="status">
			Le contenu n'a pas pu être chargé. Réessayez plus tard.
		</p>
	{:else}
		{#if videos.length > 0}
			<div class="mt-8">
				<YoutubeCarousel {videos} />
			</div>
		{/if}

		{#if intro?.texte}
			<div class="mt-10 text-center {html}">
				{@html intro.texte}
			</div>
		{/if}

		{#if tiroirs.length > 0}
			<div class="mt-6 border-t border-ink-light/10 dark:border-ink-dark/10">
				{#each tiroirs as bloc (bloc.id)}
					<div class="border-b border-ink-light/10 dark:border-ink-dark/10">
						<button
							type="button"
							class="flex w-full items-center justify-between gap-4 py-5 text-left font-heading text-base font-semibold tracking-tight text-ink-light transition-colors hover:text-accent dark:text-ink-dark"
							aria-expanded={ouvert === bloc.id}
							onclick={() => (ouvert = ouvert === bloc.id ? null : bloc.id)}
						>
							<span class="flex items-start gap-3 pr-4">
								<img src="/cone.png" alt="" class="mt-0.5 h-5 w-auto shrink-0" aria-hidden="true" />
								<span>{bloc.titre}</span>
							</span>
							<span
								class="flex h-8 w-8 shrink-0 items-center justify-center text-accent transition-transform duration-200"
								class:rotate-45={ouvert === bloc.id}
								aria-hidden="true"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									class="h-5 w-5"
								>
									<path d="M12 5v14M5 12h14" />
								</svg>
							</span>
						</button>
						{#if ouvert === bloc.id && bloc.texte}
							<div class="mb-5 rounded-lg bg-gray-100 px-5 py-4 dark:bg-[#1A1A1A]" transition:slide={{ duration: 250 }}>
								<div class={html}>
									{@html bloc.texte}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		{#if chiffres.length > 0}
			<div class="mt-14 flex flex-col gap-8">
				{#each chiffres as bloc (bloc.id)}
					<div>
						{#if bloc.lien}
							<a
								href={bloc.lien}
								class="font-heading text-base font-semibold tracking-tight text-accent"
								target="_blank"
								rel="noopener noreferrer"
							>
								{bloc.titre}
							</a>
						{:else}
							<p class="font-heading text-base font-semibold tracking-tight text-ink-light dark:text-ink-dark">
								{bloc.titre}
							</p>
						{/if}
						{#if bloc.imageUrl}
							<a
								href={bloc.lien ?? bloc.imageUrl}
								class="mt-4 block"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img src={bloc.imageUrl} alt={bloc.titre} class="w-full rounded-lg object-contain" loading="lazy" />
							</a>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</section>
