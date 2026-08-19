<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import {
		MAIL_SUBJECT,
		buildMailLinks,
		buildMessage,
		destinataireLabel,
		sortByPartiPuisNom
	} from '$lib/campagneMail';
	import { supabase } from '$lib/supabaseClient';
	import type { BoutonClic, Depute } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const deputes = $derived(data.deputes);
	const logos = $derived(data.logos ?? []);
	const campagneEmail = $derived(data.campagneEmail);
	const currentYear = new Date().getFullYear();

	let selectedId = $state<number | null>(null);
	let message = $state('');
	let putInBcc = $state(false);
	let copiedEmail = $state(false);
	let copiedMessage = $state(false);
	let copyEmailReset: ReturnType<typeof setTimeout> | undefined;
	let copyMessageReset: ReturnType<typeof setTimeout> | undefined;

	const ministres = $derived(
		sortByPartiPuisNom(deputes.filter((item) => item.role === 'ministre'))
	);
	const elus = $derived(sortByPartiPuisNom(deputes.filter((item) => item.role !== 'ministre')));
	const selected = $derived(deputes.find((depute) => depute.id === selectedId) ?? null);

	function onDeputeChange(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value;
		selectedId = value ? Number(value) : null;
		const depute = deputes.find((item) => item.id === selectedId);
		if (depute) {
			message = buildMessage(depute.nom, depute.sexe);
		}
	}

	const bcc = $derived(putInBcc && campagneEmail ? campagneEmail : null);

	const links = $derived(
		selected
			? buildMailLinks({
					to: selected.email,
					subject: MAIL_SUBJECT,
					body: message,
					bcc
				})
			: null
	);

	function logoImageClass(id: number) {
		return id === 1 ? 'h-16 w-auto object-contain sm:h-[4.5rem]' : 'h-12 w-auto object-contain';
	}

	async function track(bouton: BoutonClic, depute: Depute) {
		const { error } = await supabase.from('evenements_clics').insert({
			bouton_clique: bouton,
			depute_id: depute.id
		});
		if (error) {
			console.error('Suivi du clic impossible', error.message);
		}
	}

	function onSendClick(event: MouseEvent, bouton: BoutonClic) {
		if (!selected) {
			event.preventDefault();
			return;
		}
		void track(bouton, selected);
	}

	async function copyText(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			textarea.setAttribute('readonly', '');
			textarea.style.position = 'absolute';
			textarea.style.left = '-9999px';
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
		}
	}

	async function onCopyEmail() {
		if (!selected) return;
		void track('copier', selected);
		await copyText(selected.email);
		copiedEmail = true;
		if (copyEmailReset) clearTimeout(copyEmailReset);
		copyEmailReset = setTimeout(() => {
			copiedEmail = false;
		}, 2000);
	}

	async function onCopyMessage() {
		if (!selected) return;
		void track('copier', selected);
		await copyText(message);
		copiedMessage = true;
		if (copyMessageReset) clearTimeout(copyMessageReset);
		copyMessageReset = setTimeout(() => {
			copiedMessage = false;
		}, 2000);
	}
</script>

<svelte:head>
	<title>Contactez votre député ou ministre | Laissez-nous travailler !</title>
	<meta
		name="description"
		content="La réforme des CISP n’est pas un détail technique. Écrivez à votre député ou ministre wallon pour défendre une insertion qui laisse le temps."
	/>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header
		class="sticky top-0 z-50 border-b border-ink-light/10 bg-page-light/95 backdrop-blur-sm dark:border-ink-dark/10 dark:bg-page-dark/95"
	>
		<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
			<a href="/" class="font-heading text-lg font-bold tracking-tight text-accent sm:text-xl">
				Laissez-nous travailler !
			</a>
			<ThemeToggle />
		</div>
	</header>

	<main class="flex-1">
		<section class="border-b border-ink-light/10 dark:border-ink-dark/10">
			<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
				<h1
					class="mb-4 text-center font-heading text-3xl font-bold leading-[1.05] tracking-tight text-ink-light dark:text-ink-dark sm:text-4xl"
				>
					<span class="inline-flex max-w-full flex-wrap items-center justify-center gap-3">
						<img src="/cone.png" alt="" class="h-8 w-auto sm:h-10" aria-hidden="true" />
						<span>Contactez votre député ou ministre</span>
						<img src="/cone.png" alt="" class="h-8 w-auto sm:h-10" aria-hidden="true" />
					</span>
				</h1>
				<p
					class="font-heading text-base font-medium leading-snug tracking-tight text-ink-light/90 dark:text-ink-dark/90"
				>
					La réforme des CISP n’est pas un détail technique : c’est la vision de l’insertion que nous
					voulons défendre. Écrivez à votre député ou à un ministre du gouvernement wallon.
					Rien n’est envoyé à votre place.
				</p>
			</div>
		</section>

		<section class="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
			{#if data.errors.deputes}
				<p
					class="mb-6 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 font-sans text-sm text-ink-light dark:text-ink-dark"
					role="status"
				>
					La liste n’a pas pu être chargée. Réessayez plus tard.
				</p>
			{:else if deputes.length === 0}
				<p
					class="mb-6 rounded-lg border border-ink-light/15 px-4 py-3 font-sans text-sm text-ink-light/80 dark:border-ink-dark/20 dark:text-ink-dark/80"
					role="status"
				>
					Aucun destinataire n’est disponible pour le moment. La liste est mise à jour automatiquement.
				</p>
			{/if}

			<div class="flex flex-col gap-6">
				<label class="block">
					<span class="mb-2 block font-heading text-sm font-semibold tracking-tight">
						Votre député ou ministre
					</span>
					<select
						class="w-full rounded-lg border border-ink-light/15 bg-white px-3 py-3 font-heading text-base tracking-tight text-ink-light outline-none transition-colors focus:border-accent dark:border-ink-dark/20 dark:bg-[#1A1A1A] dark:text-ink-dark"
						value={selectedId ?? ''}
						onchange={onDeputeChange}
					>
						<option value="">Choisissez un destinataire</option>
						{#if ministres.length > 0}
							<optgroup label="Gouvernement wallon">
								{#each ministres as depute (depute.id)}
									<option value={depute.id}>{destinataireLabel(depute)}</option>
								{/each}
							</optgroup>
						{/if}
						{#if elus.length > 0}
							<optgroup label="Députés wallons">
								{#each elus as depute (depute.id)}
									<option value={depute.id}>{destinataireLabel(depute)}</option>
								{/each}
							</optgroup>
						{/if}
					</select>
				</label>

				<label class="block">
					<span class="mb-2 block font-heading text-sm font-semibold tracking-tight">
						Votre message
					</span>
					<textarea
						class="min-h-[18rem] w-full resize-y rounded-lg border border-ink-light/15 bg-white px-3 py-3 font-heading text-base font-medium leading-snug tracking-tight text-ink-light outline-none transition-colors focus:border-accent dark:border-ink-dark/20 dark:bg-[#1A1A1A] dark:text-ink-dark"
						bind:value={message}
						rows="14"
						placeholder="Le texte se remplit après le choix du destinataire. Vous pouvez ensuite le modifier librement."
					></textarea>
				</label>

				{#if campagneEmail}
					<label class="flex items-start gap-3 font-heading text-sm font-medium tracking-tight">
						<input
							type="checkbox"
							class="mt-1 h-4 w-4 shrink-0 accent-accent"
							bind:checked={putInBcc}
						/>
						<span>
							Mettez-nous en copie pour nous aider à comptabiliser les mails envoyés
							<span class="mt-1 block text-ink-light/60 dark:text-ink-dark/60">
								Si vous cochez cette case, l’adresse {campagneEmail} sera ajoutée en copie cachée (Cci).
								Sinon, aucune copie n’est ajoutée.
							</span>
						</span>
					</label>
				{/if}

				<p
					class="rounded-lg bg-ink-light/[0.04] px-4 py-3 font-heading text-sm font-medium leading-snug tracking-tight text-ink-light/80 dark:bg-ink-dark/[0.06] dark:text-ink-dark/80"
					role="note"
				>
					Utilisez d’abord Envoyer par mail, Gmail ou Outlook : le destinataire et le texte sont déjà
					en place, il ne vous reste plus qu’à cliquer sur Envoyer. Si rien ne s’ouvre, copiez
					l’adresse d’un côté et le message de l’autre, puis collez-les dans votre messagerie.
				</p>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<a
						class="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-3 text-center font-heading text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-90 {selected
							? ''
							: 'pointer-events-none opacity-40'}"
						href={links?.mailto ?? '#'}
						aria-disabled={!selected}
						onclick={(event) => onSendClick(event, 'mailto')}
					>
						Envoyer par mail
					</a>
					<a
						class="inline-flex items-center justify-center rounded-lg border border-ink-light/15 px-4 py-3 text-center font-heading text-sm font-semibold tracking-tight text-ink-light transition-colors hover:border-accent hover:text-accent dark:border-ink-dark/20 dark:text-ink-dark {selected
							? ''
							: 'pointer-events-none opacity-40'}"
						href={links?.gmail ?? '#'}
						target="_blank"
						rel="noopener noreferrer"
						aria-disabled={!selected}
						onclick={(event) => onSendClick(event, 'gmail')}
					>
						Ouvrir dans Gmail
					</a>
					<a
						class="inline-flex items-center justify-center rounded-lg border border-ink-light/15 px-4 py-3 text-center font-heading text-sm font-semibold tracking-tight text-ink-light transition-colors hover:border-accent hover:text-accent dark:border-ink-dark/20 dark:text-ink-dark {selected
							? ''
							: 'pointer-events-none opacity-40'}"
						href={links?.outlook ?? '#'}
						target="_blank"
						rel="noopener noreferrer"
						aria-disabled={!selected}
						onclick={(event) => onSendClick(event, 'outlook')}
					>
						Ouvrir dans Outlook
					</a>
				</div>

				<div class="flex flex-col gap-3 border-t border-ink-light/10 pt-6 dark:border-ink-dark/10">
					<p class="font-heading text-sm font-semibold tracking-tight">
						Si les boutons ci-dessus ne fonctionnent pas
					</p>
					<label class="block">
						<span class="mb-2 block font-heading text-sm font-medium tracking-tight">
							Adresse du destinataire
						</span>
						<div class="flex flex-col gap-2 sm:flex-row">
							<input
								class="min-w-0 flex-1 rounded-lg border border-ink-light/15 bg-white px-3 py-3 font-heading text-base tracking-tight text-ink-light outline-none dark:border-ink-dark/20 dark:bg-[#1A1A1A] dark:text-ink-dark"
								type="text"
								readonly
								value={selected?.email ?? ''}
								placeholder="Elle s’affiche après le choix du destinataire."
								onfocus={(event) => event.currentTarget.select()}
							/>
							<button
								type="button"
								class="inline-flex shrink-0 items-center justify-center rounded-lg border border-ink-light/15 px-4 py-3 font-heading text-sm font-semibold tracking-tight text-ink-light transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40 dark:border-ink-dark/20 dark:text-ink-dark"
								disabled={!selected}
								onclick={onCopyEmail}
							>
								{copiedEmail ? 'Adresse copiée !' : 'Copier l’adresse'}
							</button>
						</div>
					</label>
					<button
						type="button"
						class="inline-flex items-center justify-center rounded-lg border border-ink-light/15 px-4 py-3 font-heading text-sm font-semibold tracking-tight text-ink-light transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-40 dark:border-ink-dark/20 dark:text-ink-dark"
						disabled={!selected}
						onclick={onCopyMessage}
					>
						{copiedMessage ? 'Message copié !' : 'Copier le message'}
					</button>
				</div>

				<p class="font-heading text-xs font-medium tracking-tight text-ink-light/50 dark:text-ink-dark/50">
					Lors d’un clic, seul le bouton utilisé et le destinataire choisi sont enregistrés. Ni votre
					adresse, ni le contenu du message.
				</p>
			</div>
		</section>
	</main>

	<footer class="border-t border-ink-light/10 bg-white">
		<div
			class="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-6 text-center font-heading text-sm font-medium tracking-tight text-ink-light/60 sm:px-6"
		>
			{#if logos.length > 0}
				<div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
					{#each logos as logo (logo.id)}
						{#if logo.url}
							{#if logo['url-website']}
								<a
									href={logo['url-website']}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Ouvrir le site du logo ${logo.id}`}
								>
									<img
										src={logo.url}
										alt={`Logo fédération ${logo.id}`}
										class={logoImageClass(logo.id)}
										loading="lazy"
									/>
								</a>
							{:else}
								<img
									src={logo.url}
									alt={`Logo fédération ${logo.id}`}
									class={logoImageClass(logo.id)}
									loading="lazy"
								/>
							{/if}
						{/if}
					{/each}
				</div>
			{/if}
			<p>© {currentYear}</p>
		</div>
	</footer>
</div>
