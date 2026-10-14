<script lang="ts">
	import { facebookPluginSrc } from '$lib/facebookVideo';
	import type { ReelVideo } from '$lib/types';

	let { videos, titleFallback }: { videos: ReelVideo[]; titleFallback: string } = $props();

	const items = $derived(
		videos.flatMap((video) => {
			const src = facebookPluginSrc(video.url);
			return src ? [{ ...video, src }] : [];
		})
	);
</script>

{#if items.length > 0}
	<ul class="grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 xl:grid-cols-3">
		{#each items as video (video.id)}
			<li class="w-[267px]">
				<iframe
					src={video.src}
					width="267"
					height="476"
					class="rounded-lg bg-ink-light/5 dark:bg-ink-dark/5"
					style="border:none;overflow:hidden"
					scrolling="no"
					frameborder="0"
					allowfullscreen
					allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
					loading="lazy"
					title={video.titre || titleFallback}
				></iframe>
			</li>
		{/each}
	</ul>
{/if}
