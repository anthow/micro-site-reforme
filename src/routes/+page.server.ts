import { dev } from '$app/environment';
import { envoyerContact, secretFormulaire } from '$lib/contactMail.server';
import { cleSiteRecaptcha, verifierRecaptcha } from '$lib/contactRecaptcha.server';
import {
	ATTENTE_COOKIE,
	ATTENTE_S,
	FENETRE_MS,
	JETON_COOKIE,
	JETON_DUREE_MS,
	MAX_ENVOIS,
	lireContact,
	lireJeton,
	priseEnCompte,
	signerJeton
} from '$lib/contactForm';
import { filterPlayableFacebookVideos } from '$lib/facebookVideo';
import { loadProblem, linesOf, presentCarousel, sanitizeHomepage, sanitizeVideos } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { FaqEntry, Homepage, Video } from '$lib/types';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const envoisParAdresse = new Map<string, number[]>();

export const load: PageServerLoad = async ({ cookies }) => {
	const secret = secretFormulaire();
	const emis = Date.now();
	const jeton = secret ? signerJeton(secret, emis, emis + JETON_DUREE_MS) : '';
	if (jeton) {
		cookies.set(JETON_COOKIE, jeton, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: JETON_DUREE_MS / 1000
		});
	}
	const [homepageResult, faqResult, videosResult, carouselResult] = await Promise.all([
		supabase
			.from('Homepage')
			.select('id, Titre, Soustitre, Texte, Points_cles, Image_hero_URL')
			.eq('id', 1)
			.maybeSingle(),
		supabase.from('FAQ').select('id, Question, "Réponse"').order('id', { ascending: true }),
		supabase.from('videos').select('id, url').order('id', { ascending: true }),
		supabase
			.from('Carrousel')
			.select('id, "Titre", "Texte", "Image_URL", "Lien", "Ordre", "Actif"')
			.eq('"Actif"', true)
			.order('"Ordre"', { ascending: true })
	]);

	const homepage = sanitizeHomepage(homepageResult.data as Homepage | null);
	const fetchedVideos = sanitizeVideos((videosResult.data ?? []) as { id: number; url: string | null }[]);
	const playableVideos = videosResult.error
		? fetchedVideos
		: await filterPlayableFacebookVideos(fetchedVideos);

	return {
		recaptchaSiteKey: cleSiteRecaptcha(),
		homepage,
		points: linesOf(homepage?.Points_cles),
		faq: (faqResult.data ?? []) as unknown as FaqEntry[],
		videos: moveVideoToPosition(playableVideos, 2, 5),
		slides: presentCarousel(carouselResult.data ?? []),
		errors: {
			homepage: loadProblem(homepageResult.error),
			faq: loadProblem(faqResult.error),
			videos: loadProblem(videosResult.error),
			carousel: loadProblem(carouselResult.error)
		}
	};
};

export const actions: Actions = {
	contact: async ({ request, cookies, getClientAddress }) => {
		const data = await request.formData();
		const decision = lireContact({
			nom: texte(data.get('nom'), 200),
			email: texte(data.get('email'), 300),
			message: texte(data.get('message'), 8_000),
			organisme: texte(data.get('organisme'), 200)
		});
		if (decision.kind === 'piege') return { envoye: true };
		if (decision.kind === 'invalide') {
			return fail(400, {
				erreurs: decision.champs,
				valeurs: valeurs(data)
			});
		}

		const secret = secretFormulaire();
		const jeton = cookies.get(JETON_COOKIE) ?? '';
		if (!secret || !jeton) {
			return fail(400, {
				erreurs: { envoi: 'Le formulaire a expiré. Rechargez la page.' },
				valeurs: valeurs(data)
			});
		}

		const moment = lireJeton(secret, jeton, Date.now());
		if (moment !== 'ok') {
			const envoi =
				moment === 'trop_tot'
					? 'Merci de patienter quelques secondes avant d’envoyer.'
					: 'Le formulaire a expiré. Rechargez la page.';
			return fail(400, { erreurs: { envoi }, valeurs: valeurs(data) });
		}

		if (cookies.get(ATTENTE_COOKIE)) {
			return fail(429, {
				erreurs: { envoi: 'Trop de messages ont été envoyés. Réessayez un peu plus tard.' },
				valeurs: valeurs(data)
			});
		}

		const adresse = adresseClient(getClientAddress);
		const controle = await verifierRecaptcha(texte(data.get('g-recaptcha-response'), 4_000), adresse);
		if (controle !== 'ok') {
			return fail(400, {
				erreurs: { envoi: 'La vérification a échoué. Réessayez.' },
				valeurs: valeurs(data)
			});
		}

		const quota = priseEnCompte(envoisParAdresse.get(adresse) ?? [], Date.now(), FENETRE_MS, MAX_ENVOIS);
		envoisParAdresse.set(adresse, quota.suivants);
		if (envoisParAdresse.size > 5_000) {
			const premiere = envoisParAdresse.keys().next().value;
			if (premiere) envoisParAdresse.delete(premiere);
		}
		if (!quota.autorise) {
			return fail(429, {
				erreurs: { envoi: 'Trop de messages ont été envoyés. Réessayez un peu plus tard.' },
				valeurs: valeurs(data)
			});
		}

		const envoi = await envoyerContact(decision);
		if (envoi !== 'envoye') {
			return fail(503, {
				erreurs: { envoi: "Le message n'a pas pu être envoyé. Réessayez plus tard." },
				valeurs: valeurs(data)
			});
		}

		cookies.set(ATTENTE_COOKIE, '1', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: ATTENTE_S
		});
		return { envoye: true };
	}
};

function texte(valeur: FormDataEntryValue | null, max: number): string {
	return typeof valeur === 'string' ? valeur.slice(0, max) : '';
}

function valeurs(data: FormData) {
	return {
		nom: texte(data.get('nom'), 80),
		email: texte(data.get('email'), 254),
		message: texte(data.get('message'), 4_000)
	};
}

function adresseClient(lire: () => string): string {
	try {
		return lire() || 'inconnue';
	} catch {
		return 'inconnue';
	}
}

function moveVideoToPosition(videos: Video[], id: number, position: number): Video[] {
	const from = videos.findIndex((video) => video.id === id);
	if (from < 0) return videos;

	const next = [...videos];
	const [item] = next.splice(from, 1);
	next.splice(Math.min(Math.max(position - 1, 0), next.length), 0, item);
	return next;
}
