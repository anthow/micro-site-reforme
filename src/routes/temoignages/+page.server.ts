import { loadProblem, presentReels } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const result = await supabase
		.from('Videos')
		.select('id, "Titre", "URL", "Categorie", "Ordre"')
		.eq('"Categorie"', 'temoignage')
		.order('"Ordre"', { ascending: true });

	return {
		videos: presentReels(result.data ?? []),
		loadError: loadProblem(result.error)
	};
};
