<script lang="ts">
	import { onMount } from 'svelte';
	import type { CarrouselSlide } from '$lib/types';

	let { slides }: { slides: CarrouselSlide[] } = $props();

	let index = $state(0);
	let hovered = $state(false);
	let focused = $state(false);
	let reduceMotion = $state(false);
	let ready = $state(false);
	let startX = 0;
	let startY = 0;
	let tracking = false;

	const several = $derived(slides.length > 1);
	const paused = $derived(hovered || focused);

	function go(delta: number) {
		if (!several) return;
		index = (index + delta + slides.length) % slides.length;
	}

	function onFocusOut(event: FocusEvent) {
		const next = event.relatedTarget;
		const current = event.currentTarget;
		if (next instanceof Node && current instanceof Node && current.contains(next)) return;
		focused = false;
	}

	function onPointerDown(event: PointerEvent) {
		if (!several || event.pointerType === 'mouse') return;
		tracking = true;
		startX = event.clientX;
		startY = event.clientY;
	}

	function onPointerUp(event: PointerEvent) {
		if (!tracking) return;
		tracking = false;
		const dx = event.clientX - startX;
		const dy = event.clientY - startY;
		if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
		go(dx < 0 ? 1 : -1);
	}

	function onKeydown(event: KeyboardEvent) {
		if (!several) return;
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			go(-1);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			go(1);
		}
	}

	function external(lien: string) {
		return lien.startsWith('http');
	}

	onMount(() => {
		ready = true;
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduceMotion = media.matches;
		const sync = () => {
			reduceMotion = media.matches;
		};
		media.addEventListener('change', sync);
		return () => media.removeEventListener('change', sync);
	});

	$effect(() => {
		if (index >= slides.length) index = 0;
	});

	$effect(() => {
		if (!ready || !several || paused || reduceMotion) return;
		const timer = setInterval(() => {
			index = (index + 1) % slides.length;
		}, 7000);
		return () => clearInterval(timer);
	});
</script>

<!-- Le motif carousel ARIA demande une région focusable, avec clavier et pause au survol. -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="relative touch-pan-y border-b border-ink-light/10 outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-ink-dark/10"
	role="region"
	aria-roledescription="carousel"
	aria-label="Diaporama"
	tabindex="0"
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	onfocusin={() => (focused = true)}
	onfocusout={onFocusOut}
	onpointerdown={onPointerDown}
	onpointerup={onPointerUp}
	onpointercancel={() => (tracking = false)}
	onkeydown={onKeydown}
>
	<div class="relative overflow-hidden">
		{#each slides as slide, i (slide.id)}
			<div
				class="{i === index
					? 'relative opacity-100'
					: 'pointer-events-none absolute inset-0 opacity-0'} {reduceMotion
					? ''
					: 'transition-opacity duration-500'}"
				aria-hidden={i !== index}
				inert={i !== index}
				aria-roledescription="slide"
				aria-label={`${i + 1} sur ${slides.length}`}
			>
				<div class="relative flex min-h-[18rem] items-end sm:min-h-[24rem]">
					{#if slide.imageUrl}
						<img src={slide.imageUrl} alt="" class="absolute inset-0 h-full w-full object-cover" />
						<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25"></div>
					{:else}
						<div class="absolute inset-0 bg-ink-light"></div>
					{/if}
					<div class="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
						<h2
							class="max-w-3xl whitespace-pre-line font-heading text-3xl font-bold leading-tight tracking-tighter text-white sm:text-4xl"
						>
							{slide.titre}
						</h2>
						{#if slide.texte}
							<p
								class="mt-3 max-w-2xl whitespace-pre-line font-heading text-base font-medium leading-snug text-white/90"
							>
								{slide.texte}
							</p>
						{/if}
						{#if slide.lien}
							<p class="mt-6">
								<a
									href={slide.lien}
									target={external(slide.lien) ? '_blank' : undefined}
									rel={external(slide.lien) ? 'noopener noreferrer' : undefined}
									class="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 font-heading text-sm font-bold tracking-tight text-white transition-opacity hover:opacity-90"
								>
									En savoir plus
								</a>
							</p>
						{/if}
					</div>
				</div>
			</div>
		{/each}

		{#if several}
			<button
				type="button"
				class="absolute top-1/2 left-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition-colors hover:border-accent hover:text-accent"
				aria-label="Diapositive précédente"
				onclick={() => go(-1)}
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
					<path d="M15 18l-6-6 6-6" />
				</svg>
			</button>
			<button
				type="button"
				class="absolute top-1/2 right-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition-colors hover:border-accent hover:text-accent"
				aria-label="Diapositive suivante"
				onclick={() => go(1)}
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
					<path d="M9 18l6-6-6-6" />
				</svg>
			</button>
		{/if}
	</div>

	{#if several}
		<div class="flex justify-center gap-2 bg-page-light py-3 dark:bg-page-dark" role="group" aria-label="Choisir une diapositive">
			{#each slides as slide, i (slide.id)}
				<button
					type="button"
					class="h-2.5 w-2.5 rounded-full {i === index ? 'bg-accent' : 'bg-ink-light/25 dark:bg-ink-dark/30'}"
					aria-label={`Diapositive ${i + 1}`}
					aria-current={i === index ? 'true' : undefined}
					onclick={() => (index = i)}
				></button>
			{/each}
		</div>
	{/if}
</div>
