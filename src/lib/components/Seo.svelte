<script lang="ts">
	import { page } from '$app/state';
	import { absoluteUrl } from '$lib/seo/policy';
	import type { JsonLdNode } from '$lib/seo/jsonld';

	interface Props {
		title: string;
		description?: string;
		image?: string | null;
		imageWidth?: number;
		imageHeight?: number;
		type?: 'website' | 'article';
		indexable: boolean;
		siteUrl: string;
		jsonLd?: JsonLdNode | null;
	}

	let {
		title,
		description = '',
		image = null,
		imageWidth = 1200,
		imageHeight = 630,
		type = 'website',
		indexable,
		siteUrl,
		jsonLd = null
	}: Props = $props();

	const descriptionClean = $derived(description.replace(/\s+/g, ' ').trim());
	const canonical = $derived(indexable ? absoluteUrl(siteUrl, page.url.pathname) : '');
	const absoluteImage = $derived.by(() => {
		if (!canonical || !image) return '';
		try {
			return new URL(image, `${siteUrl.replace(/\/+$/, '')}/`).href;
		} catch {
			return '';
		}
	});
	const jsonLdMarkup = $derived.by(() => {
		if (!indexable || jsonLd == null) return '';
		const serialized = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
		return `<script type="application/ld+json">${serialized}</` + 'script>';
	});
</script>

<svelte:head>
	<title>{title}</title>
	{#if descriptionClean}
		<meta name="description" content={descriptionClean} />
	{/if}
	{#if canonical}
		<link rel="canonical" href={canonical} />
		<meta property="og:locale" content="fr_FR" />
		<meta property="og:type" content={type} />
		<meta property="og:title" content={title} />
		{#if descriptionClean}
			<meta property="og:description" content={descriptionClean} />
		{/if}
		<meta property="og:url" content={canonical} />
		{#if absoluteImage}
			<meta property="og:image" content={absoluteImage} />
			<meta property="og:image:width" content={String(imageWidth)} />
			<meta property="og:image:height" content={String(imageHeight)} />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:image" content={absoluteImage} />
		{:else}
			<meta name="twitter:card" content="summary" />
		{/if}
		<meta name="twitter:title" content={title} />
		{#if descriptionClean}
			<meta name="twitter:description" content={descriptionClean} />
		{/if}
	{/if}
	{#if jsonLdMarkup}
		{@html jsonLdMarkup}
	{/if}
</svelte:head>
