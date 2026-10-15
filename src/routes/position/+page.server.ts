import { loadProblem, sanitizeAvis } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { AvisInitiativeBloc } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const avisResult = await supabase
		.from('Position_du_secteur')
		.select('id, ordre, type, texte, ancre')
		.order('ordre', { ascending: true });

	return {
		blocs: sanitizeAvis((avisResult.data ?? []) as AvisInitiativeBloc[]),
		loadError: loadProblem(avisResult.error)
	};
};
