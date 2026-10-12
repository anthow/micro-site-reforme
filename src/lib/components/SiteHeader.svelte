<script lang="ts">
	import { page } from '$app/state';

	const pathname = $derived(page.url.pathname);
	const hash = $derived(page.url.hash);
	const onHome = $derived(pathname === '/');
	const enjeuxActive = $derived(onHome && hash === '#faq');
	const mobilisationActive = $derived(
		pathname === '/mobilisation' || pathname.startsWith('/mobilisation/')
	);
	const positionActive = $derived(pathname === '/avis-initiative');
	const temoignageActive = $derived(onHome && hash === '#temoignages');

	const linkClass =
		'font-heading text-sm font-semibold tracking-tight text-ink-light transition-colors hover:text-accent sm:text-base';
	const activeClass =
		'font-heading text-sm font-semibold tracking-tight text-accent transition-colors hover:text-accent sm:text-base';

	function itemClass(active: boolean) {
		return active ? activeClass : linkClass;
	}
</script>

<header class="sticky top-0 z-50 border-b border-ink-light/10 bg-page-light/95 backdrop-blur-sm">
	<div
		class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-6"
	>
		<a
			href="/"
			class="flex max-w-full flex-wrap items-baseline font-heading text-sm font-bold leading-tight tracking-tighter text-accent sm:text-base"
		>
			<span class="whitespace-nowrap">(Ré)former sans exclure <span aria-hidden="true">|</span></span>
			<span class="whitespace-nowrap">&nbsp;Écoutez le terrain ! <span aria-hidden="true">|</span></span>
			<span class="whitespace-nowrap">&nbsp;Laissez-nous travailler !</span>
		</a>
		<nav
			class="flex max-w-full flex-wrap items-center justify-end gap-x-4 gap-y-1 sm:gap-x-6"
			aria-label="Navigation principale"
		>
			<a
				href="/#faq"
				class={itemClass(enjeuxActive)}
				aria-current={enjeuxActive ? 'location' : undefined}
			>
				Enjeux réforme
			</a>
			<a
				href="/mobilisation"
				class={itemClass(mobilisationActive)}
				aria-current={mobilisationActive ? 'page' : undefined}
			>
				Mobilisation
			</a>
			<a
				href="/avis-initiative"
				class={itemClass(positionActive)}
				aria-current={positionActive ? 'page' : undefined}
			>
				Position du secteur
			</a>
			<a
				href="/#temoignages"
				class={itemClass(temoignageActive)}
				aria-current={temoignageActive ? 'location' : undefined}
			>
				Témoignages secteur
			</a>
		</nav>
	</div>
</header>
