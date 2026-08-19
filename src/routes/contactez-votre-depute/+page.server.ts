import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { supabase } from '$lib/supabaseClient';
import type { Depute, LogoFede } from '$lib/types';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async () => {
	const [deputesResult, logosResult] = await Promise.all([
		supabase
			.from('deputes')
			.select('id, nom, circonscription, email, parti, fonction, role, sexe')
			.eq('actif', true)
			.order('role', { ascending: false })
			.order('nom', { ascending: true }),
		supabase.from('Logo_fede').select('id, url, "url-website"').order('id', { ascending: true })
	]);

	const campagneEmail =
		publicEnv.PUBLIC_CAMPAGNE_EMAIL?.trim() || privateEnv.CAMPAGNE_EMAIL?.trim() || null;

	return {
		deputes: (deputesResult.data ?? []) as Depute[],
		logos: (logosResult.data ?? []) as LogoFede[],
		campagneEmail,
		errors: {
			deputes: deputesResult.error?.message ?? null,
			logos: logosResult.error?.message ?? null
		}
	};
};
