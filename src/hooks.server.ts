import { isSiteIndexable } from '$lib/seo/indexable.server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Frame-Options', 'DENY');
	const privatePage =
		event.url.pathname === '/contactez-votre-depute' ||
		event.url.pathname.startsWith('/contactez-votre-depute/');
	if (!isSiteIndexable() || privatePage) {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}
	return response;
};
