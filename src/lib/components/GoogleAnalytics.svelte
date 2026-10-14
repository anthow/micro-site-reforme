<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { measurementId }: { measurementId: string } = $props();

	function cheminPage(url: URL) {
		return `${url.pathname}${url.search}`;
	}

	function envoyerPage(url: URL) {
		if (typeof window.gtag !== 'function') return;
		window.gtag('event', 'page_view', {
			page_path: cheminPage(url),
			page_location: url.href,
			page_title: document.title
		});
	}

	onMount(() => {
		window.dataLayer = window.dataLayer ?? [];
		window.gtag = function gtag() {
			// Signature attendue par gtag.js : push de l'objet arguments.
			// eslint-disable-next-line prefer-rest-params
			window.dataLayer.push(arguments);
		};

		window.gtag('js', new Date());
		window.gtag('config', measurementId, { send_page_view: false });

		if (!document.querySelector('script[data-analytics="ga4"]')) {
			const script = document.createElement('script');
			script.async = true;
			script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
			script.dataset.analytics = 'ga4';
			document.head.appendChild(script);
		}

		envoyerPage(new URL(window.location.href));
	});

	afterNavigate(({ to }) => {
		if (!to) return;
		envoyerPage(to.url);
	});
</script>
