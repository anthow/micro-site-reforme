<script lang="ts">
	interface Props {
		titre: string;
		imageUrl: string | null;
		videoEmbed: string | null;
		href?: string | null;
		external?: boolean;
		eager?: boolean;
		imageAlt?: string;
	}

	let { titre, imageUrl, videoEmbed, href = null, external = false, eager = false, imageAlt }: Props = $props();
	const alt = $derived(imageAlt ?? titre);
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
			loading={eager ? 'eager' : 'lazy'}
		></iframe>
	</div>
{:else if imageUrl}
	{#if href}
		<a
			{href}
			class="flex justify-center"
			target={external ? '_blank' : undefined}
			rel={external ? 'noopener noreferrer' : undefined}
		>
			<img
				src={imageUrl}
				alt={alt}
				class="block max-h-[32rem] w-full object-contain"
				loading={eager ? 'eager' : 'lazy'}
			/>
		</a>
	{:else}
		<div class="bg-ink-light/[0.03] dark:bg-ink-dark/[0.04]">
			<img
				src={imageUrl}
				alt={alt}
				class="mx-auto block max-h-[40rem] w-full object-contain"
				loading={eager ? 'eager' : 'lazy'}
			/>
		</div>
	{/if}
{/if}
