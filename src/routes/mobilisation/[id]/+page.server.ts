import { error, redirect } from '@sveltejs/kit';
import { articleIdFromParam, articlePath, presentMobilisation, type MobilisationRow } from '$lib/mobilisation';
import { loadProblem } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = articleIdFromParam(params.id);
	if (id == null) error(404, 'Article introuvable');

	const result = await supabase
		.from('Mobilisation')
		.select('id, created_at, titre, resume, texte, image_url, video_url, lien, abonnement, epingle, publie, "Date"')
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
	if (article.lien) redirect(302, article.lien);

	const canonical = articlePath(article.id, article.titre);
	if (`/mobilisation/${params.id}` !== canonical) redirect(301, canonical);

	return { article, loadError: null };
};
