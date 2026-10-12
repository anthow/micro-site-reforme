import { loadProblem } from '$lib/publicContent';
import { presentMobilisationList, type MobilisationRow } from '$lib/mobilisation';
import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const result = await supabase
		.from('Mobilisation')
		.select('id, created_at, titre, resume, image_url, video_url, epingle, publie')
		.eq('publie', true)
		.order('created_at', { ascending: false });

	return {
		articles: presentMobilisationList((result.data ?? []) as MobilisationRow[]),
		loadError: loadProblem(result.error)
	};
};
