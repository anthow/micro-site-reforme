<script lang="ts">
	import { page } from '$app/state';

	const avisActive = $derived(page.url.pathname === '/avis-initiative');

	const linkClass =
		'font-heading text-sm font-semibold tracking-tight text-ink-light transition-colors hover:text-accent sm:text-base';
	const activeClass =
		'font-heading text-sm font-semibold tracking-tight text-accent transition-colors hover:text-accent sm:text-base';
</script>

<header class="sticky top-0 z-50 border-b border-ink-light/10 bg-page-light/95 backdrop-blur-sm">
	<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
		<a
			href="/"
			class="flex min-w-0 items-baseline gap-x-1.5 font-heading text-[11px] font-bold leading-none tracking-tighter text-accent sm:text-xs"
		>
			<span class="whitespace-nowrap">(Ré)former sans exclure</span>
			<span class="whitespace-nowrap">Ecoutez le terrain !</span>
			<span class="whitespace-nowrap">Laissez-nous travailler !</span>
		</a>
		<nav
			class="flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-1 sm:gap-x-6"
			aria-label="Navigation principale"
		>
			<a href="/#faq" class={linkClass}>Enjeux réforme</a>
			<a href="/#temoignages" class={linkClass}>Témoignages secteur</a>
			<a
				href="/avis-initiative"
				class={avisActive ? activeClass : linkClass}
				aria-current={avisActive ? 'page' : undefined}
			>
				Avis d'initiative
			</a>
		</nav>
	</div>
</header>
