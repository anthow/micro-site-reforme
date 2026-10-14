import { formatPublicationDate } from '$lib/mobilisation';
import { loadProblem, presentPartenaires, presentSlogans, sanitizeLogos } from '$lib/publicContent';
import { publicSiteUrl } from '$lib/seo/config';
import { isSiteIndexable } from '$lib/seo/indexable.server';
import { supabase } from '$lib/supabaseClient';
import type { EnjeuxMaj, LogoFede } from '$lib/types';
import type { LayoutServerLoad } from './$types';

const SLOGANS_EXISTANTS = [
	'(Ré)former sans exclure',
	'Écoutez le terrain !',
	'Laissez-nous travailler !'
];

export const load: LayoutServerLoad = async () => {
	const [parametresResult, partenairesResult, logosResult] = await Promise.all([
		supabase
			.from('Parametres')
			.select('Slogans, Enjeux_maj_texte, Enjeux_maj_date')
			.order('id', { ascending: true })
			.limit(1)
			.maybeSingle(),
		supabase
			.from('Partenaires')
			.select('id, "Nom", "Logo_URL", "Lien", "Ordre"')
			.order('"Ordre"', { ascending: true }),
		supabase.from('Logo_fede').select('id, url, "url-website"').order('id', { ascending: true })
	]);

	const parametres = parametresResult.data;
	const enjeuxMaj: EnjeuxMaj = {
		texte: parametres?.Enjeux_maj_texte?.replace(/\r\n/g, '\n').trim() || null,
		date: formatPublicationDate(parametres?.Enjeux_maj_date ?? null)
	};

	const slogans = presentSlogans(parametres?.Slogans);

	return {
		seo: {
			indexable: isSiteIndexable(),
			siteUrl: publicSiteUrl()
		},
		slogans: slogans.length > 0 ? slogans : SLOGANS_EXISTANTS,
		enjeuxMaj,
		partenaires: presentPartenaires(partenairesResult.data ?? []),
		logos: sanitizeLogos((logosResult.data ?? []) as LogoFede[]),
		errors: {
			parametres: loadProblem(parametresResult.error),
			partenaires: loadProblem(partenairesResult.error),
			logos: loadProblem(logosResult.error)
		}
	};
};
