import { dev } from '$app/environment';
import { CONTENT_SECURITY_POLICY } from '$lib/securityHeaders';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Frame-Options', 'DENY');
	if (!dev) {
		response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
	}
	return response;
};
