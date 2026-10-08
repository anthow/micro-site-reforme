<script lang="ts">
	import { page } from '$app/state';

	const avisActive = $derived(page.url.pathname === '/avis-initiative');

	const linkClass =
		'font-heading text-sm font-semibold tracking-tight text-ink-light transition-colors hover:text-accent sm:text-base';
	const activeClass =
		'font-heading text-sm font-semibold tracking-tight text-accent transition-colors hover:text-accent sm:text-base';
</script>

<header class="sticky top-0 z-50 border-b border-ink-light/10 bg-page-light/95 backdrop-blur-sm">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4"
	>
		<a href="/" class="min-w-0 font-heading leading-tight tracking-tight">
			<span class="block text-sm font-semibold text-ink-light">(Ré)former sans exclure</span>
			<span class="block text-sm font-semibold text-ink-light">Ecoutez le terrain !</span>
			<span class="block text-lg font-bold text-accent sm:text-xl">Laissez-nous travailler !</span>
		</a>
		<nav
			class="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 sm:gap-x-6"
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
