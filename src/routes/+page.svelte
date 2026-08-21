<script lang="ts">
	import FaqItem from '$lib/components/FaqItem.svelte';
	import IndustryTestimonials from '$lib/components/IndustryTestimonials.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const homepage = $derived(data.homepage);
	const faq = $derived(data.faq);
	const logos = $derived(data.logos ?? []);
	const videos = $derived((data.videos ?? []).filter((video) => Boolean(video.url)));
	const errors = $derived(data.errors);

	const siteName = $derived(homepage?.Titre ?? 'Mobilisation sectorielle');
	const introParagraphs = $derived(
		homepage?.Texte
			? homepage.Texte
					.split(/\n\s*\n+/)
					.map((p) => p.trim())
					.filter(Boolean)
			: []
	);
	const currentYear = new Date().getFullYear();

	function logoImageClass(id: number) {
		return id === 1 ? 'h-16 w-auto object-contain sm:h-[4.5rem]' : 'h-12 w-auto object-contain';
	}
</script>

<svelte:head>
	<title>{siteName}</title>
	<meta name="description" content={homepage?.Soustitre ?? ''} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<SiteHeader />

	<main class="flex-1">
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
					<img
						src={homepage.Image_hero_URL}
						alt=""
						class="block w-full object-cover"
						loading="eager"
					/>
				</div>
			{/if}

			<section class="border-b border-ink-light/10 dark:border-ink-dark/10">
				<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
					<h1
						class="mb-2 text-center font-heading text-3xl font-bold leading-[1.05] tracking-tight text-ink-light dark:text-ink-dark sm:text-4xl lg:text-5xl"
					>
						<span class="inline-flex items-center gap-3">
							<img src="/cone.png" alt="" class="h-8 w-auto sm:h-10" aria-hidden="true" />
							<span>{homepage.Titre}</span>
							<img src="/cone.png" alt="" class="h-8 w-auto sm:h-10" aria-hidden="true" />
						</span>
					</h1>
				</div>
			</section>

			<!-- Intro -->
			{#if introParagraphs.length > 0}
				<section class="mx-auto max-w-5xl px-3 py-7 sm:px-4 sm:py-10">
					{#each introParagraphs as paragraph}
						<p
							class="mb-4 whitespace-pre-line font-heading text-base font-medium leading-snug tracking-tight text-ink-light/90 last:mb-0 dark:text-ink-dark/90"
						>
							{paragraph}
						</p>
					{/each}
				</section>
			{/if}
		{/if}

		<div class="bg-page-light px-4 py-8 dark:bg-page-dark sm:px-6 sm:py-10">
			<img
				src={encodeURI('/Banderole (Ré)Former sans exclure.png')}
				alt="(Ré)Former sans exclure"
				class="mx-auto block w-full max-w-md object-contain sm:max-w-xl"
				loading="lazy"
			/>
		</div>

		<!-- FAQ -->
		<section id="faq" class="border-t border-ink-light/10 bg-ink-light/[0.02] dark:border-ink-dark/10 dark:bg-ink-dark/[0.02]">
			<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
				{#if homepage?.Soustitre}
					<p
						class="mb-10 text-center font-heading text-xl font-bold leading-tight tracking-tight text-ink-light dark:text-ink-dark sm:text-2xl"
					>
						{homepage.Soustitre}
					</p>
				{/if}

				{#if faq.length === 0}
					<p class="font-sans text-ink-light/60 dark:text-ink-dark/60">
						Aucune question pour le moment.
					</p>
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
				class="border-t border-ink-light/10 bg-ink-light/[0.02] dark:border-ink-dark/10 dark:bg-ink-dark/[0.02]"
			>
				<div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
					<img
						src={encodeURI('/Ecoutez le terrain.png')}
						alt="Écoutez le terrain"
						class="mx-auto mb-8 block h-52 w-auto object-contain sm:h-64"
						loading="lazy"
					/>
					<h2
						class="mb-10 text-center font-heading text-xl font-bold leading-tight tracking-tight text-ink-light dark:text-ink-dark sm:text-2xl"
					>
						Témoignages du secteur
					</h2>
					<IndustryTestimonials {videos} />
				</div>
			</section>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="border-t border-ink-light/10 bg-white">
		<div
			class="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-6 text-center font-heading text-sm font-medium tracking-tight text-ink-light/60 sm:px-6"
		>
			{#if logos.length > 0}
				<div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
					{#each logos as logo (logo.id)}
						{#if logo.url}
							{#if logo['url-website']}
								<a
									href={logo['url-website']}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Ouvrir le site du logo ${logo.id}`}
								>
									<img
										src={logo.url}
										alt={`Logo fédération ${logo.id}`}
										class={logoImageClass(logo.id)}
										loading="lazy"
									/>
								</a>
							{:else}
								<img
									src={logo.url}
									alt={`Logo fédération ${logo.id}`}
									class={logoImageClass(logo.id)}
									loading="lazy"
								/>
							{/if}
						{/if}
					{/each}
				</div>
			{:else if errors.logos}
				<p class="text-xs text-ink-light/60 dark:text-ink-dark/60">
					Logos indisponibles pour le moment.
				</p>
			{/if}
			<p>© {currentYear}</p>
		</div>
	</footer>
</div>
