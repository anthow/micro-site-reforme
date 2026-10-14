<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	type Etat = {
		envoye?: boolean;
		erreurs?: { nom?: string; email?: string; message?: string; envoi?: string };
		valeurs?: { nom: string; email: string; message: string };
	} | null;

	type Grecaptcha = {
		render: (
			container: HTMLElement,
			parameters: {
				sitekey: string;
				size: 'invisible';
				badge: 'inline';
				callback: (token: string) => void;
				'error-callback': () => void;
			}
		) => number;
		execute: (widgetId?: number) => void;
		reset: (widgetId?: number) => void;
	};

	let { form, siteKey = '' }: { form: Etat; siteKey?: string } = $props();

	let enCours = $state(false);
	let jeton = $state('');
	let erreurLocale = $state('');
	let formulaire = $state<HTMLFormElement | null>(null);
	let boite = $state<HTMLDivElement | null>(null);
	let widgetId = $state<number | null>(null);

	const erreurs = $derived(form?.erreurs);
	const valeurs = $derived(form?.valeurs);

	function grecaptcha(): Grecaptcha | null {
		return (window as Window & { grecaptcha?: Grecaptcha }).grecaptcha ?? null;
	}

	function rendreWidget() {
		const api = grecaptcha();
		if (!api || !boite || widgetId !== null || !siteKey) return;
		widgetId = api.render(boite, {
			sitekey: siteKey,
			size: 'invisible',
			badge: 'inline',
			callback: (token) => {
				jeton = token;
				const champ = formulaire?.querySelector<HTMLInputElement>('input[name="g-recaptcha-response"]');
				if (champ) champ.value = token;
				formulaire?.requestSubmit();
			},
			'error-callback': () => {
				enCours = false;
				erreurLocale = 'La vérification a échoué. Réessayez.';
			}
		});
	}

	onMount(() => {
		if (!siteKey) return;
		const fenetre = window as Window & { contactRecaptchaPret?: () => void; grecaptcha?: Grecaptcha };
		fenetre.contactRecaptchaPret = rendreWidget;
		if (fenetre.grecaptcha) {
			rendreWidget();
			return () => {
				delete fenetre.contactRecaptchaPret;
			};
		}
		if (!document.querySelector('script[data-recaptcha="contact"]')) {
			const script = document.createElement('script');
			script.src =
				'https://www.google.com/recaptcha/api.js?onload=contactRecaptchaPret&render=explicit&hl=fr';
			script.async = true;
			script.defer = true;
			script.dataset.recaptcha = 'contact';
			document.head.appendChild(script);
		}
		return () => {
			delete fenetre.contactRecaptchaPret;
		};
	});
</script>

<section id="ecrire" class="scroll-mt-28 border-t border-ink-light/10 dark:border-ink-dark/10">
	<div class="mx-auto max-w-xl px-4 py-14 sm:px-6 sm:py-16">
		<h2
			class="text-center font-heading text-2xl font-bold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl"
		>
			Contact
		</h2>
		<p class="mt-3 text-center font-heading text-base font-medium leading-relaxed text-ink-light/80 dark:text-ink-dark/80">
			Si vous avez des questions concernant la réforme, ou si vous souhaitez partager votre témoignage sur le sujet, n'hésitez pas à nous contacter à l'aide de ce formulaire.
		</p>

		{#if form?.envoye}
			<p class="mt-8 text-center font-heading text-base font-semibold text-ink-light dark:text-ink-dark" role="status">
				Votre message a été envoyé. Nous vous répondrons à l'adresse indiquée.
			</p>
		{:else}
			<form
				method="POST"
				action="?/contact"
				class="mt-8 flex flex-col gap-4"
				bind:this={formulaire}
				use:enhance={({ cancel }) => {
					erreurLocale = '';
					if (siteKey && !jeton) {
						cancel();
						enCours = true;
						if (widgetId === null) {
							enCours = false;
							erreurLocale = 'La vérification est indisponible. Rechargez la page.';
							return;
						}
						grecaptcha()?.execute(widgetId);
						return;
					}
					enCours = true;
					return async ({ result, update }) => {
						await update();
						enCours = false;
						if (result.type !== 'success') {
							jeton = '';
							if (widgetId !== null) grecaptcha()?.reset(widgetId);
						}
					};
				}}
			>
				<div class="relative h-0 overflow-hidden" aria-hidden="true">
					<label>
						Organisme
						<input type="text" name="organisme" tabindex="-1" autocomplete="off" />
					</label>
				</div>

				<label class="block">
					<span class="mb-2 block font-heading text-sm font-semibold tracking-tight text-ink-light dark:text-ink-dark">
						Nom
					</span>
					<input
						class="w-full rounded-lg border border-ink-light/15 bg-white px-3 py-3 font-heading text-base tracking-tight text-ink-light outline-none transition-colors focus:border-accent dark:border-ink-dark/20 dark:bg-[#1A1A1A] dark:text-ink-dark"
						type="text"
						name="nom"
						autocomplete="name"
						maxlength="80"
						required
						value={valeurs?.nom ?? ''}
						aria-invalid={erreurs?.nom ? 'true' : undefined}
						aria-describedby={erreurs?.nom ? 'contact-nom' : undefined}
					/>
					{#if erreurs?.nom}
						<span id="contact-nom" class="mt-2 block font-heading text-sm font-medium text-accent">{erreurs.nom}</span>
					{/if}
				</label>

				<label class="block">
					<span class="mb-2 block font-heading text-sm font-semibold tracking-tight text-ink-light dark:text-ink-dark">
						E-mail
					</span>
					<input
						class="w-full rounded-lg border border-ink-light/15 bg-white px-3 py-3 font-heading text-base tracking-tight text-ink-light outline-none transition-colors focus:border-accent dark:border-ink-dark/20 dark:bg-[#1A1A1A] dark:text-ink-dark"
						type="email"
						name="email"
						autocomplete="email"
						maxlength="254"
						required
						value={valeurs?.email ?? ''}
						aria-invalid={erreurs?.email ? 'true' : undefined}
						aria-describedby={erreurs?.email ? 'contact-email' : undefined}
					/>
					{#if erreurs?.email}
						<span id="contact-email" class="mt-2 block font-heading text-sm font-medium text-accent">
							{erreurs.email}
						</span>
					{/if}
				</label>

				<label class="block">
					<span class="mb-2 block font-heading text-sm font-semibold tracking-tight text-ink-light dark:text-ink-dark">
						Message
					</span>
					<textarea
						class="min-h-36 w-full rounded-lg border border-ink-light/15 bg-white px-3 py-3 font-heading text-base tracking-tight text-ink-light outline-none transition-colors focus:border-accent dark:border-ink-dark/20 dark:bg-[#1A1A1A] dark:text-ink-dark"
						name="message"
						maxlength="4000"
						required
						aria-invalid={erreurs?.message ? 'true' : undefined}
						aria-describedby={erreurs?.message ? 'contact-message' : undefined}
					>{valeurs?.message ?? ''}</textarea>
					{#if erreurs?.message}
						<span id="contact-message" class="mt-2 block font-heading text-sm font-medium text-accent">
							{erreurs.message}
						</span>
					{/if}
				</label>

				<input type="hidden" name="g-recaptcha-response" value={jeton} />

				{#if erreurs?.envoi}
					<p class="font-heading text-sm font-medium text-accent" role="alert">{erreurs.envoi}</p>
				{/if}
				{#if erreurLocale}
					<p class="font-heading text-sm font-medium text-accent" role="alert">{erreurLocale}</p>
				{/if}

				<div class="h-0 overflow-hidden" bind:this={boite} aria-hidden="true"></div>

				<button
					type="submit"
					class="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-3 font-heading text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-90 disabled:opacity-60"
					disabled={enCours}
				>
					Envoyer
				</button>
			</form>
		{/if}
	</div>
</section>
