<script lang="ts">
	import { slide } from 'svelte/transition';

	interface Props {
		question: string;
		answer: string;
	}

	let { question, answer }: Props = $props();
	let open = $state(false);

	const paragraphs = $derived(
		answer
			.split(/\n\s*\n+/)
			.map((p) => p.trim())
			.filter(Boolean)
	);
</script>

<div class="border-b border-ink-light/10 dark:border-ink-dark/10">
	<button
		type="button"
		class="flex w-full items-center justify-between gap-4 py-5 text-left font-heading text-base font-semibold tracking-tight text-ink-light transition-colors hover:text-accent dark:text-ink-dark dark:hover:text-accent"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<span class="flex items-start gap-3 pr-4">
			<img src="/cone.png" alt="" class="mt-0.5 h-5 w-auto shrink-0" aria-hidden="true" />
			<span>{question}</span>
		</span>
		<span
			class="flex h-8 w-8 shrink-0 items-center justify-center text-accent transition-transform duration-200"
			class:rotate-45={open}
			aria-hidden="true"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				class="h-5 w-5"
			>
				<path d="M12 5v14M5 12h14" />
			</svg>
		</span>
	</button>

	{#if open}
		<div transition:slide={{ duration: 250 }}>
			<div
				class="mb-5 rounded-lg bg-gray-100 px-5 py-4 text-ink-light dark:bg-[#1A1A1A] dark:text-ink-dark"
			>
				{#each paragraphs as paragraph}
					<p class="mb-3 whitespace-pre-line font-heading text-base font-medium leading-snug tracking-tight last:mb-0">
						{paragraph}
					</p>
				{/each}
			</div>
		</div>
	{/if}
</div>
