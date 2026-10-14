<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import type { AvisInitiativeBloc } from '$lib/types';

	let {
		blocs = [],
		loadError = null,
		indexable,
		siteUrl
	}: {
		blocs?: AvisInitiativeBloc[];
		loadError?: string | null;
		indexable: boolean;
		siteUrl: string;
	} = $props();

	const titre = $derived(blocs.find((bloc) => bloc.type === 'titre')?.texte ?? '');
	const soustitre = $derived(blocs.find((bloc) => bloc.type === 'soustitre')?.texte ?? '');
	const dateIso = $derived(blocs.find((bloc) => bloc.type === 'date')?.texte ?? '');
	const description = $derived(blocs.find((bloc) => bloc.type === 'description')?.texte ?? '');

	const dateLabel = $derived.by(() => {
		if (!dateIso) return '';
		const date = new Date(`${dateIso}T00:00:00`);
		if (Number.isNaN(date.getTime())) return dateIso;
		return new Intl.DateTimeFormat('fr-BE', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(date);
	});

	function plain(html: string) {
		return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
	}

	type TocItem = { ancre: string; label: string; children: TocItem[] };

	const sommaire = $derived.by(() => {
		const items: TocItem[] = [];
		let current: TocItem | null = null;
		for (const bloc of blocs) {
			if ((bloc.type !== 'h2' && bloc.type !== 'h3') || !bloc.ancre) continue;
			const item: TocItem = { ancre: bloc.ancre, label: plain(bloc.texte), children: [] };
			if (bloc.type === 'h2') {
				current = item;
				items.push(item);
			} else if (current) {
				current.children.push(item);
			} else {
				items.push(item);
			}
		}
		return items;
	});

	type CorpsGroup =
		| { kind: 'ul'; items: AvisInitiativeBloc[] }
		| { kind: 'bloc'; bloc: AvisInitiativeBloc };

	const corps = $derived.by(() => {
		const meta = new Set(['titre', 'soustitre', 'date', 'description']);
		const groups: CorpsGroup[] = [];
		let list: Extract<CorpsGroup, { kind: 'ul' }> | null = null;
		for (const bloc of blocs) {
			if (meta.has(bloc.type)) continue;
			if (bloc.type === 'li') {
				if (!list) {
					list = { kind: 'ul', items: [] };
					groups.push(list);
				}
				list.items.push(bloc);
			} else {
				list = null;
				groups.push({ kind: 'bloc', bloc });
			}
		}
		return groups;
	});

	const noteNumbers = $derived.by(() => {
		const numbers = new Map<number, number>();
		let count = 0;
		for (const bloc of blocs) {
			if (bloc.type === 'note') {
				count += 1;
				numbers.set(bloc.id, count);
			}
		}
		return numbers;
	});

	const tocLink =
		'underline decoration-ink-light/30 underline-offset-2 transition-colors hover:text-accent hover:decoration-accent dark:decoration-ink-dark/30';
	const prose =
		'mt-4 font-heading text-base font-medium leading-relaxed text-ink-light/90 dark:text-ink-dark/90 [&_strong]:font-bold';
</script>

<Seo
	title="Position du secteur"
	{description}
	type="article"
	{indexable}
	{siteUrl}
/>

<article
	class="mx-auto w-full max-w-[calc(70ch+2rem)] hyphens-auto px-4 py-8 sm:max-w-[calc(70ch+3rem)] sm:px-6 sm:py-12"
>
	{#if loadError}
		<p class="font-heading text-base font-medium text-ink-light/70 dark:text-ink-dark/70" role="status">
			L'avis n'a pas pu être chargé. Réessayez plus tard.
		</p>
	{:else if blocs.length === 0}
		<p class="font-heading text-base font-medium text-ink-light/70 dark:text-ink-dark/70">
			Le contenu de l'avis n'est pas disponible pour le moment.
		</p>
	{:else}
		<header class="border-b border-ink-light/10 pb-8 text-center dark:border-ink-dark/10">
			{#if titre}
				<h1
					class="font-heading text-3xl font-bold leading-[1.15] tracking-tighter text-ink-light sm:text-4xl dark:text-ink-dark"
				>
					{titre}
				</h1>
			{/if}
			{#if soustitre}
				<p class="mt-4 font-heading text-xl font-bold tracking-tight text-ink-light sm:text-2xl dark:text-ink-dark">
					<span class="inline-flex max-w-full flex-wrap items-center justify-center gap-3">
						<img src="/cone.png" alt="" class="h-8 w-auto sm:h-10" aria-hidden="true" />
						<span>{soustitre}</span>
						<img src="/cone.png" alt="" class="h-8 w-auto sm:h-10" aria-hidden="true" />
					</span>
				</p>
			{/if}
			{#if dateLabel}
				<p class="mt-3 font-heading text-base font-medium tracking-tight text-ink-light/70 dark:text-ink-dark/70">
					<time datetime={dateIso}>{dateLabel}</time>
				</p>
			{/if}
		</header>

		{#if sommaire.length > 0}
			<nav
				aria-label="Sommaire"
				class="mt-8 rounded-lg border border-ink-light/10 bg-ink-light/[0.02] px-4 py-4 sm:px-5 dark:border-ink-dark/10 dark:bg-ink-dark/[0.04]"
			>
				<p class="font-heading text-sm font-bold tracking-tight text-ink-light dark:text-ink-dark">Sommaire</p>
				<ol class="mt-3 space-y-2 font-heading text-sm font-medium leading-snug text-ink-light/80 dark:text-ink-dark/80">
					{#each sommaire as item (item.ancre)}
						<li>
							<a class={tocLink} href="#{item.ancre}">{item.label}</a>
							{#if item.children.length > 0}
								<ol class="mt-2 space-y-1.5 border-l border-ink-light/15 pl-3 dark:border-ink-dark/20">
									{#each item.children as child (child.ancre)}
										<li>
											<a class={tocLink} href="#{child.ancre}">{child.label}</a>
										</li>
									{/each}
								</ol>
							{/if}
						</li>
					{/each}
				</ol>
			</nav>
		{/if}

		{#each corps as group (`${group.kind}-${group.kind === 'ul' ? group.items[0].id : group.bloc.id}`)}
			{#if group.kind === 'ul'}
				<ul
					class="mt-4 list-disc space-y-3 pl-5 font-heading text-base font-medium leading-relaxed text-ink-light/90 marker:text-accent dark:text-ink-dark/90 [&_strong]:font-bold"
				>
					{#each group.items as item (item.id)}
						<li>{@html item.texte}</li>
					{/each}
				</ul>
			{:else if group.bloc.type === 'h2'}
				<h2
					id={group.bloc.ancre ?? undefined}
					class="mt-12 scroll-mt-24 font-heading text-xl font-bold tracking-tighter text-ink-light sm:text-2xl dark:text-ink-dark"
				>
					{plain(group.bloc.texte)}
				</h2>
			{:else if group.bloc.type === 'h3'}
				<h3
					id={group.bloc.ancre ?? undefined}
					class="mt-8 scroll-mt-24 font-heading text-lg font-bold tracking-tighter text-ink-light dark:text-ink-dark"
				>
					{plain(group.bloc.texte)}
				</h3>
			{:else if group.bloc.type === 'kicker'}
				<p class="mt-1 font-heading text-sm font-bold tracking-tight text-accent">
					{plain(group.bloc.texte)}
				</p>
			{:else if group.bloc.type === 'note'}
				<p
					id={group.bloc.ancre ?? undefined}
					class="mt-4 border-t border-ink-light/15 pt-3 font-heading text-sm font-medium leading-relaxed text-ink-light/70 dark:border-ink-dark/20 dark:text-ink-dark/70"
				>
					<span class="mr-1 font-bold text-accent">{noteNumbers.get(group.bloc.id)}</span>
					{@html group.bloc.texte}
				</p>
			{:else}
				<p class={prose}>{@html group.bloc.texte}</p>
			{/if}
		{/each}

		<p class="mt-14 border-t border-ink-light/10 pt-6 text-center dark:border-ink-dark/10">
			<a
				href="/avis-initiative-2026-10-07.pdf"
				download="2026-10-07_Avis-IF.pdf"
				class="font-heading text-sm font-semibold tracking-tight text-ink-light/60 underline decoration-ink-light/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent dark:text-ink-dark/60 dark:decoration-ink-dark/30"
			>
				Télécharger le PDF original
			</a>
		</p>
	{/if}
</article>
