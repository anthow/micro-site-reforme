import { error } from '@sveltejs/kit';
import { presentMobilisation, type MobilisationRow } from '$lib/mobilisation';
import { loadProblem } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id < 1) error(404, 'Article introuvable');

	const result = await supabase
		.from('Mobilisation')
		.select('id, created_at, titre, resume, texte, image_url, video_url, epingle, publie')
		.eq('id', id)
		.eq('publie', true)
		.maybeSingle();

	if (result.error) {
		return {
			article: null,
			loadError: loadProblem(result.error)
		};
	}

	const article = result.data ? presentMobilisation(result.data as MobilisationRow) : null;
	if (!article) error(404, 'Article introuvable');

	return { article, loadError: null };
};
