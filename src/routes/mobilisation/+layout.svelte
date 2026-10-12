<script lang="ts">
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { data, children } = $props();

	const logos = $derived(data.logos ?? []);
	const currentYear = new Date().getFullYear();

	function logoImageClass(id: number) {
		return id === 1 ? 'h-16 w-auto object-contain sm:h-[4.5rem]' : 'h-12 w-auto object-contain';
	}
</script>

<div class="flex min-h-screen flex-col">
	<SiteHeader />

	<main class="flex-1">
		{@render children()}
	</main>

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
			{:else if data.errors.logos}
				<p class="text-xs text-ink-light/60">Logos indisponibles pour le moment.</p>
			{/if}
			<p>© {currentYear}</p>
		</div>
	</footer>
</div>
