<script lang="ts">
	import type { Video } from '$lib/types';

	interface Props {
		videos: Video[];
	}

	let { videos }: Props = $props();

	const items = $derived(videos.filter((video): video is Video & { url: string } => Boolean(video.url)));
	let loaded = $state<Record<number, boolean>>({});

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
</script>

<div class="flex flex-wrap justify-center gap-6">
	{#each items as video (video.id)}
		<div class="w-full max-w-[280px] lg:w-[267px] lg:max-w-none">
			<div
				class="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-ink-light/5 dark:bg-ink-dark/5"
			>
				{#if !loaded[video.id]}
					<div
						class="absolute inset-0 animate-pulse bg-ink-light/10 dark:bg-ink-dark/10"
						aria-hidden="true"
					></div>
				{/if}
				<iframe
					src={facebookEmbedSrc(video.url)}
					class="absolute inset-0 h-full w-full"
					style="border:none;overflow:hidden"
					scrolling="no"
					frameborder="0"
					allowfullscreen={true}
					allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
					title="Témoignage du secteur"
					onload={() => markLoaded(video.id)}
				></iframe>
			</div>
		</div>
	{/each}
</div>
