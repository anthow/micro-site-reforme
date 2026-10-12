import { publicSiteUrl } from '$lib/seo/config';
import { isSiteIndexable } from '$lib/seo/indexable.server';
import { robotsTxt } from '$lib/seo/policy';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = () => {
	return new Response(robotsTxt(isSiteIndexable(), publicSiteUrl()), {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'no-store'
		}
	});
};
