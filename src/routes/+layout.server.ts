import { publicSiteUrl } from '$lib/seo/config';
import { isSiteIndexable } from '$lib/seo/indexable.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	return {
		seo: {
			indexable: isSiteIndexable(),
			siteUrl: publicSiteUrl()
		}
	};
};
