<script lang="ts">
	import type { LogoFede, Partenaire } from '$lib/types';

	let {
		partenaires = [],
		logos = [],
		unavailable = false
	}: { partenaires?: Partenaire[]; logos?: LogoFede[]; unavailable?: boolean } = $props();

	function logoImageClass(id: number) {
		return id === 1 ? 'h-16 w-auto object-contain sm:h-[4.5rem]' : 'h-12 w-auto object-contain';
	}

	const currentYear = new Date().getFullYear();

	function external(lien: string) {
		return lien.startsWith('http');
	}
</script>

<footer class="border-t border-ink-light/10 bg-white dark:border-ink-dark/10 dark:bg-page-dark">
	<div
		class="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-8 text-center font-heading sm:px-6"
	>
		{#if partenaires.length > 0}
			<ul class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
				{#each partenaires as partenaire (partenaire.id)}
					<li class="flex h-16 items-center justify-center rounded-md bg-neutral-100 px-3">
						{#if partenaire.lien}
							<a
								href={partenaire.lien}
								target={external(partenaire.lien) ? '_blank' : undefined}
								rel={external(partenaire.lien) ? 'noopener noreferrer' : undefined}
							>
								<img
									src={partenaire.logoUrl}
									alt={partenaire.nom}
									class="h-12 w-auto max-w-[9rem] object-contain"
									loading="lazy"
								/>
							</a>
						{:else}
							<img
								src={partenaire.logoUrl}
								alt={partenaire.nom}
								class="h-12 w-auto max-w-[9rem] object-contain"
								loading="lazy"
							/>
						{/if}
					</li>
				{/each}
			</ul>
		{:else if logos.length > 0}
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
		{:else if unavailable}
			<p class="text-xs font-medium text-ink-light/60 dark:text-ink-dark/60">
				Logos indisponibles pour le moment.
			</p>
		{/if}

		<a
			href="/#ecrire"
			class="text-base font-bold tracking-tight text-ink-light transition-colors hover:text-accent dark:text-ink-dark"
		>
			Contact
		</a>

		<p class="text-sm font-medium tracking-tight text-ink-light/60 dark:text-ink-dark/60">
			© {currentYear}
		</p>
	</div>
</footer>
