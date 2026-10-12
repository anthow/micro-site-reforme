<script lang="ts">
	interface Props {
		titre: string;
		imageUrl: string | null;
		videoEmbed: string | null;
		href?: string | null;
		eager?: boolean;
	}

	let { titre, imageUrl, videoEmbed, href = null, eager = false }: Props = $props();
</script>

{#if videoEmbed}
	<div class="flex justify-center bg-ink-light/[0.03] px-4 py-6 dark:bg-ink-dark/[0.04]">
		<iframe
			src={videoEmbed}
			title={titre}
			width="267"
			height="476"
			class="rounded-lg bg-ink-light/5 dark:bg-ink-dark/5"
			style="border:none;overflow:hidden"
			scrolling="no"
			frameborder="0"
			allowfullscreen
			allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
		></iframe>
	</div>
{:else if imageUrl}
	{#if href}
		<a {href} class="block bg-ink-light/[0.03] dark:bg-ink-dark/[0.04]">
			<img
				src={imageUrl}
				alt={titre}
				class="mx-auto block max-h-[36rem] w-full object-contain"
				loading={eager ? 'eager' : 'lazy'}
			/>
		</a>
	{:else}
		<div class="bg-ink-light/[0.03] dark:bg-ink-dark/[0.04]">
			<img
				src={imageUrl}
				alt={titre}
				class="mx-auto block max-h-[40rem] w-full object-contain"
				loading={eager ? 'eager' : 'lazy'}
			/>
		</div>
	{/if}
{:else}
	<div
		class="aspect-[16/9] bg-ink-light/[0.04] dark:bg-ink-dark/[0.06]"
		aria-hidden="true"
	></div>
{/if}
