import { dev } from '$app/environment';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { estPartiMajorite } from '$lib/campagneMail';
import {
	DEPUTE_ACCESS_COOKIE,
	DEPUTE_ACCESS_TTL_MS,
	issueAccessToken,
	passwordsMatch
} from '$lib/deputeAccess';
import { deputeAccessGranted, deputePagePassword } from '$lib/deputeAccess.server';
import { loadProblem, sanitizeLogos } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { Depute, LogoFede } from '$lib/types';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

const locked = {
	locked: true,
	deputes: [] as Depute[],
	logos: [] as LogoFede[],
	campagneEmail: null,
	errors: { deputes: null, logos: null }
};

export const load: PageServerLoad = async ({ cookies }) => {
	if (!deputeAccessGranted(cookies.get(DEPUTE_ACCESS_COOKIE))) return locked;

	const [deputesResult, logosResult] = await Promise.all([
		supabase
			.from('deputes')
			.select('id, nom, circonscription, email, parti, sexe')
			.eq('actif', true)
			.eq('role', 'depute')
			.order('nom', { ascending: true }),
		supabase.from('Logo_fede').select('id, url, "url-website"').order('id', { ascending: true })
	]);

	const campagneEmail =
		publicEnv.PUBLIC_CAMPAGNE_EMAIL?.trim() || privateEnv.CAMPAGNE_EMAIL?.trim() || null;

	const deputes = ((deputesResult.data ?? []) as Depute[]).filter((depute) =>
		estPartiMajorite(depute.parti)
	);

	return {
		locked: false,
		deputes,
		logos: sanitizeLogos((logosResult.data ?? []) as LogoFede[]),
		campagneEmail,
		errors: {
			deputes: loadProblem(deputesResult.error),
			logos: loadProblem(logosResult.error)
		}
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const password = deputePagePassword();
		const submitted = String((await request.formData()).get('motDePasse') ?? '');
		if (!password || !passwordsMatch(submitted, password)) {
			if (!password) console.error('DEPUTE_PAGE_PASSWORD manquant');
			await new Promise((resolve) => setTimeout(resolve, 400));
			return fail(401, { refus: true });
		}

		cookies.set(DEPUTE_ACCESS_COOKIE, issueAccessToken(password, Date.now(), DEPUTE_ACCESS_TTL_MS), {
			path: '/contactez-votre-depute',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: DEPUTE_ACCESS_TTL_MS / 1000
		});
		redirect(303, '/contactez-votre-depute');
	}
};
