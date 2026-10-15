<script lang="ts">
	import { isDirectVideoUrl } from '$lib/facebookVideo';
	import type { Video } from '$lib/types';

	interface Props {
		videos: Video[];
	}

	let { videos }: Props = $props();

	const items = $derived(videos.filter((video): video is Video & { url: string } => Boolean(video.url)));
	let index = $state(0);
	let loaded = $state<Record<number, boolean>>({});
	let mounted = $state<Record<number, boolean>>({});
	let players = $state<Record<number, HTMLVideoElement | undefined>>({});

	const count = $derived(items.length);
	const prevIndex = $derived(count === 0 ? 0 : (index - 1 + count) % count);
	const nextIndex = $derived(count === 0 ? 0 : (index + 1) % count);

	$effect(() => {
		if (count === 0) return;
		if (index >= count) index = 0;
		mounted[items[index].id] = true;
		if (count > 1) {
			mounted[items[prevIndex].id] = true;
			mounted[items[nextIndex].id] = true;
		}
		const activeId = items[index]?.id;
		for (const [id, player] of Object.entries(players)) {
			if (!player) continue;
			if (Number(id) !== activeId) player.pause();
		}
	});

	function facebookEmbedSrc(postUrl: string): string {
		const params = new URLSearchParams({
			href: postUrl,
			show_text: 'false',
			width: '267'
		});
		return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
	}

	function markLoaded(id: number) {
		loaded[id] = true;
	}

	function bindPlayer(node: HTMLVideoElement, id: number) {
		players[id] = node;
		// Précharger la 1ʳᵉ frame dès le montage (slide latérale ou active).
		if (node.readyState < 1) node.load();
		return {
			destroy() {
				if (players[id] === node) delete players[id];
			}
		};
	}

	function showPreviewFrame(node: HTMLVideoElement, id: number) {
		markLoaded(id);
		// Certains mp4 restent noirs à currentTime=0 tant qu’on n’a pas seek.
		if (node.readyState >= 1 && node.currentTime === 0) {
			try {
				node.currentTime = 0.001;
			} catch {
				/* ignore */
			}
		}
	}

	function wrapOffset(i: number): number {
		if (count === 0) return 0;
		let diff = i - index;
		const half = Math.floor(count / 2);
		if (diff > half) diff -= count;
		if (diff < -half) diff += count;
		return diff;
	}

	function go(delta: number) {
		if (count < 2) return;
		index = (index + delta + count) % count;
	}

	function onKeydown(event: KeyboardEvent) {
		const tag = (event.target as HTMLElement | null)?.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			go(-1);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			go(1);
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="relative mx-auto w-full max-w-3xl select-none"
	role="region"
	aria-roledescription="carrousel"
	aria-label="Témoignages vidéo du secteur"
>
	<div class="relative h-[26rem] overflow-hidden sm:h-[30rem]">
		{#each items as video, i (video.id)}
			{#if mounted[video.id]}
				{@const offset = wrapOffset(i)}
				{@const active = offset === 0}
				{@const visible = Math.abs(offset) <= 1}
				<div
					class="absolute top-1/2 left-1/2 w-[210px] sm:w-[267px] transition-all duration-500 ease-out"
					class:pointer-events-none={!active}
					style="transform: translate(-50%, -50%) translateX({offset * 72}%) scale({active
						? 1
						: 0.72}); z-index: {active ? 10 : visible ? 5 : 0}; opacity: {visible
						? active
							? 1
							: 0.4
						: 0}; filter: {active ? 'none' : 'saturate(0.75)'};"
					aria-hidden={!active}
				>
					<div
						class="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-ink-light/5 shadow-lg dark:bg-ink-dark/5"
					>
						{#if !loaded[video.id]}
							<div
								class="absolute inset-0 animate-pulse bg-ink-light/10 dark:bg-ink-dark/10"
								aria-hidden="true"
							></div>
						{/if}
						{#if isDirectVideoUrl(video.url)}
							<!-- svelte-ignore a11y_media_has_caption -->
							<video
								use:bindPlayer={video.id}
								class="absolute inset-0 h-full w-full bg-black object-contain"
								src={video.url}
								controls={active}
								playsinline
								preload="metadata"
								title="Témoignage du secteur"
								onloadedmetadata={(event) => showPreviewFrame(event.currentTarget, video.id)}
								onloadeddata={(event) => showPreviewFrame(event.currentTarget, video.id)}
							></video>
						{:else}
							<iframe
								src={facebookEmbedSrc(video.url)}
								class="absolute inset-0 h-full w-full"
								style="border:none;overflow:hidden"
								scrolling="no"
								frameborder="0"
								allowfullscreen={active}
								allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
								title="Témoignage du secteur"
								onload={() => markLoaded(video.id)}
							></iframe>
						{/if}
						{#if !active && visible}
							<button
								type="button"
								class="absolute inset-0 z-10 cursor-pointer bg-transparent"
								aria-label="Afficher ce témoignage"
								onclick={() => (index = i)}
							></button>
						{/if}
					</div>
				</div>
			{/if}
		{/each}
	</div>

	{#if count > 1}
		<button
			type="button"
			class="absolute top-1/2 left-0 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-light/15 bg-page-light/90 text-accent shadow-sm backdrop-blur-sm transition-colors hover:border-accent sm:left-1 dark:border-ink-dark/20 dark:bg-page-dark/90"
			aria-label="Vidéo précédente"
			onclick={() => go(-1)}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</button>
		<button
			type="button"
			class="absolute top-1/2 right-0 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-light/15 bg-page-light/90 text-accent shadow-sm backdrop-blur-sm transition-colors hover:border-accent sm:right-1 dark:border-ink-dark/20 dark:bg-page-dark/90"
			aria-label="Vidéo suivante"
			onclick={() => go(1)}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
				<path d="M9 18l6-6-6-6" />
			</svg>
		</button>
		<p class="mt-4 text-center font-heading text-sm font-medium text-ink-light/50 dark:text-ink-dark/50">
			{index + 1} / {count}
		</p>
	{/if}
</div>
