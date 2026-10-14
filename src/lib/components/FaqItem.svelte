<script lang="ts">
	import { slide } from 'svelte/transition';

	interface Props {
		question: string;
		answer: string;
	}

	let { question, answer }: Props = $props();
	let open = $state(false);

	const html =
		'font-heading text-base font-medium leading-snug tracking-tight text-ink-light dark:text-ink-dark [&_a]:text-accent [&_a]:underline [&_li]:mt-1 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul:last-child]:mb-0 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol:last-child]:mb-0';
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
			<div class="mb-5 rounded-lg bg-gray-100 px-5 py-4 dark:bg-[#1A1A1A]">
				<div class={html}>
					{@html answer}
				</div>
			</div>
		</div>
	{/if}
</div>
