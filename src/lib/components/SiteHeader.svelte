<script lang="ts">
	import { page } from '$app/state';

	const pathname = $derived(page.url.pathname);
	const hash = $derived(page.url.hash);
	let open = $state(false);

	const items = $derived([
		{
			href: '/#enjeux',
			label: 'Enjeux réforme',
			active: pathname === '/' && hash === '#enjeux'
		},
		{
			href: '/mobilisation',
			label: 'Mobilisation',
			active: pathname === '/mobilisation' || pathname.startsWith('/mobilisation/')
		},
		{
			href: '/position',
			label: 'Position du secteur',
			active: pathname === '/position' || pathname.startsWith('/position/')
		},
		{
			href: '/#temoignages',
			label: 'Témoignages secteur',
			active: pathname === '/' && hash === '#temoignages'
		},
		{
			href: '/cisp',
			label: 'CISP ?',
			active: pathname === '/cisp'
		}
	]);

	const linkClass =
		'font-heading text-sm font-semibold tracking-tight text-ink-light transition-colors hover:text-accent sm:text-base dark:text-ink-dark';
	const activeClass =
		'font-heading text-sm font-semibold tracking-tight text-accent transition-colors hover:text-accent sm:text-base';

	function itemClass(active: boolean) {
		return active ? activeClass : linkClass;
	}

	$effect(() => {
		pathname;
		hash;
		open = false;
	});
</script>

{#snippet links()}
	{#each items as item (item.href)}
		<a
			href={item.href}
			class={itemClass(item.active)}
			aria-current={item.active ? (item.href.includes('#') ? 'location' : 'page') : undefined}
		>
			{item.label}
		</a>
	{/each}
{/snippet}

<header
	class="sticky top-0 z-50 border-b border-ink-light/10 bg-page-light/95 backdrop-blur-sm dark:border-ink-dark/10 dark:bg-page-dark/95"
>
	<div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
		<a href="/" class="shrink-0">
			<img src="/cisp-logo.jpg" alt="CISP" class="h-14 w-auto bg-white sm:h-16" />
		</a>

		<button
			type="button"
			class="font-heading text-sm font-semibold tracking-tight text-ink-light hover:text-accent lg:hidden dark:text-ink-dark"
			aria-expanded={open}
			aria-controls="navigation-mobile"
			onclick={() => (open = !open)}
		>
			{open ? 'Fermer' : 'Menu'}
		</button>

		<nav
			class="hidden flex-wrap items-center justify-end gap-x-4 gap-y-1 lg:flex lg:gap-x-6"
			aria-label="Navigation principale"
		>
			{@render links()}
		</nav>
	</div>

	{#if open}
		<nav
			id="navigation-mobile"
			class="flex flex-col gap-3 border-t border-ink-light/10 px-4 py-4 lg:hidden dark:border-ink-dark/10"
			aria-label="Navigation principale"
		>
			{@render links()}
		</nav>
	{/if}
</header>
