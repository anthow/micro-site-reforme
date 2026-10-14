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
import { loadProblem } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { Depute } from '$lib/types';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

const locked = {
	locked: true,
	deputes: [] as Depute[],
	campagneEmail: null,
	errors: { deputes: null as string | null }
};

export const load: PageServerLoad = async ({ cookies }) => {
	if (!deputeAccessGranted(cookies.get(DEPUTE_ACCESS_COOKIE))) return locked;

	const deputesResult = await supabase
		.from('deputes')
		.select('id, nom, circonscription, email, parti, sexe')
		.eq('actif', true)
		.eq('role', 'depute')
		.order('nom', { ascending: true });

	const campagneEmail =
		publicEnv.PUBLIC_CAMPAGNE_EMAIL?.trim() || privateEnv.CAMPAGNE_EMAIL?.trim() || null;

	const deputes = ((deputesResult.data ?? []) as Depute[]).filter((depute) =>
		estPartiMajorite(depute.parti)
	);

	return {
		locked: false,
		deputes,
		campagneEmail,
		errors: {
			deputes: loadProblem(deputesResult.error)
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
