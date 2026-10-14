import { loadProblem } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { FaqEntry } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const faqResult = await supabase
		.from('FAQ')
		.select('id, Question, "Réponse"')
		.order('id', { ascending: true });

	return {
		faq: (faqResult.data ?? []) as unknown as FaqEntry[],
		loadError: loadProblem(faqResult.error)
	};
};
