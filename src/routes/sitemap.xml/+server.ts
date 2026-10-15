import { publicSiteUrl } from '$lib/seo/config';
import { isSiteIndexable } from '$lib/seo/indexable.server';
import { buildSitemapXml, publicSitemapEntries } from '$lib/seo/policy';
import { supabase } from '$lib/supabaseClient';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async () => {
	const siteUrl = publicSiteUrl();
	if (!isSiteIndexable() || !siteUrl) {
		return new Response('Not found', {
			status: 404,
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'cache-control': 'no-store'
			}
		});
	}

	const avisDate = await avisPublicationDate();
	const xml = buildSitemapXml(siteUrl, publicSitemapEntries(avisDate, avisDate));
	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'no-store'
		}
	});
};

async function avisPublicationDate(): Promise<string | null> {
	try {
		const { data, error } = await supabase
			.from('Position_du_secteur')
			.select('texte')
			.eq('type', 'date')
			.order('ordre', { ascending: true })
			.limit(1)
			.maybeSingle();
		if (error || typeof data?.texte !== 'string') return null;
		return /^\d{4}-\d{2}-\d{2}$/.test(data.texte) ? data.texte : null;
	} catch {
		return null;
	}
}
