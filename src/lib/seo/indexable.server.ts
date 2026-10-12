import { dev } from '$app/environment';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { publicSiteUrl } from './config';
import { decideIndexable } from './policy';

export function isSiteIndexable(): boolean {
	return decideIndexable({
		dev,
		flag: publicEnv.PUBLIC_SITE_INDEXABLE,
		context: privateEnv.CONTEXT,
		siteUrl: publicSiteUrl()
	});
}
