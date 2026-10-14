import {
	MOBILISATION_COLUMNS,
	mobilisationCategorie,
	presentMobilisationList,
	type MobilisationRow
} from '$lib/mobilisation';
import { loadProblem } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const categorie = mobilisationCategorie(url.searchParams.get('categorie'));
	let query = supabase.from('Mobilisation').select(MOBILISATION_COLUMNS).eq('"Publie"', true);
	if (categorie) query = query.eq('"Categorie"', categorie);

	const result = await query;

	return {
		articles: presentMobilisationList((result.data ?? []) as MobilisationRow[]),
		categorie,
		loadError: loadProblem(result.error)
	};
};
