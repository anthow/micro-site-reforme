import { env } from '$env/dynamic/public';

export function publicSiteUrl(): string {
	const raw = (env.PUBLIC_SITE_URL ?? '').trim();
	if (!raw) return '';

	try {
		const url = new URL(raw);
		if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
		const path = url.pathname.replace(/\/+$/, '');
		return `${url.origin}${path === '/' ? '' : path}`;
	} catch {
		return '';
	}
}
