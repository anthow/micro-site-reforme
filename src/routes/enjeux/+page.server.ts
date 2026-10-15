import { loadProblem, sanitizeFaq } from '$lib/publicContent';
import { supabase } from '$lib/supabaseClient';
import type { FaqEntry } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const faqResult = await supabase
		.from('Enjeux_reforme')
		.select('id, Question, "Réponse"')
		.order('id', { ascending: true });

	return {
		faq: sanitizeFaq((faqResult.data ?? []) as unknown as FaqEntry[]),
		loadError: loadProblem(faqResult.error)
	};
};
