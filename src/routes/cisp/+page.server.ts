import { presentCisp, type CispRow } from '$lib/cisp';
import { loadProblem } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const result = await supabase
		.from('Cisp')
		.select('id, "Role", "Titre", "Texte", "Video_URL", "Image_URL", "Lien", "Source"')
		.order('"Ordre"', { ascending: true });

	return {
		blocs: presentCisp((result.data ?? []) as CispRow[]),
		loadError: loadProblem(result.error)
	};
};
