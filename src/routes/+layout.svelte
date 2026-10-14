<script lang="ts">
	import { afterNavigate, disableScrollHandling, onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import GoogleAnalytics from '$lib/components/GoogleAnalytics.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import '../app.css';

	let { children, data } = $props();

	let retirerEcouteImages = () => {};

	function scrollToHash(hash: string) {
		retirerEcouteImages();
		const id = decodeURIComponent(hash.replace(/^#/, ''));
		if (!id) return;
		const scroll = () => document.getElementById(id)?.scrollIntoView();
		scroll();
		const images = [...document.querySelectorAll('main img')].filter(
			(image): image is HTMLImageElement => image instanceof HTMLImageElement && !image.complete
		);
		for (const image of images) image.addEventListener('load', scroll);
		retirerEcouteImages = () => {
			for (const image of images) image.removeEventListener('load', scroll);
		};
	}

	onMount(() => {
		if (location.hash) scrollToHash(location.hash);
	});

	function versAncre(hash: string) {
		return hash !== '' && hash !== '#';
	}

	onNavigate((navigation) => {
		retirerEcouteImages();
		if (navigation.type !== 'link' && navigation.type !== 'goto') return;
		const hash = navigation.to?.url.hash ?? '';
		if (!versAncre(hash)) disableScrollHandling();
		return () => {
			if (versAncre(hash)) {
				disableScrollHandling();
				scrollToHash(hash);
			} else {
				window.scrollTo(0, 0);
			}
		};
	});

	afterNavigate((navigation) => {
		if (navigation.type !== 'link' && navigation.type !== 'goto') return;
		if (versAncre(navigation.to?.url.hash ?? '')) return;
		window.scrollTo(0, 0);
		requestAnimationFrame(() => window.scrollTo(0, 0));
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" type="image/png" href="/favicon.png" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	{#if !data.seo.indexable}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>

{#if data.gaMeasurementId}
	<GoogleAnalytics measurementId={data.gaMeasurementId} />
{/if}

<div class="flex min-h-screen flex-col">
	<SiteHeader />
	<main class="flex-1">
		{@render children()}
	</main>
	<SiteFooter
		partenaires={data.partenaires}
		logos={data.logos}
		unavailable={Boolean(data.errors.partenaires && data.errors.logos)}
	/>
</div>
