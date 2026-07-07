import { supabase } from '$lib/supabaseClient';
import type { FaqEntry, Homepage, LogoFede } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [homepageResult, faqResult, logosResult] = await Promise.all([
		supabase
			.from('Homepage')
			.select('id, Titre, Soustitre, Texte, Image_hero_URL')
			.eq('id', 1)
			.maybeSingle(),
		supabase.from('FAQ').select('id, Question, "Réponse"').order('id', { ascending: true }),
		supabase.from('Logo_fede').select('id, url, "url-website"').order('id', { ascending: true })
	]);

	return {
		homepage: homepageResult.data as Homepage | null,
		faq: (faqResult.data ?? []) as unknown as FaqEntry[],
		logos: (logosResult.data ?? []) as LogoFede[],
		errors: {
			homepage: homepageResult.error?.message ?? null,
			faq: faqResult.error?.message ?? null,
			logos: logosResult.error?.message ?? null
		}
	};
};
