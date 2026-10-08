import { supabase } from '$lib/supabaseClient';
import type { AvisInitiativeBloc, LogoFede } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [avisResult, logosResult] = await Promise.all([
		supabase
			.from('Avis_initiative')
			.select('id, ordre, type, texte, ancre')
			.order('ordre', { ascending: true }),
		supabase.from('Logo_fede').select('id, url, "url-website"').order('id', { ascending: true })
	]);

	return {
		blocs: (avisResult.data ?? []) as AvisInitiativeBloc[],
		logos: (logosResult.data ?? []) as LogoFede[],
		errors: {
			avis: avisResult.error?.message ?? null,
			logos: logosResult.error?.message ?? null
		}
	};
};
