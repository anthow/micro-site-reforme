import { loadProblem, sanitizeLogos } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { LogoFede } from '$lib/types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const logosResult = await supabase
		.from('Logo_fede')
		.select('id, url, "url-website"')
		.order('id', { ascending: true });

	return {
		logos: sanitizeLogos((logosResult.data ?? []) as LogoFede[]),
		errors: {
			logos: loadProblem(logosResult.error)
		}
	};
};
