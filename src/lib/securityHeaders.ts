import type { KitConfig } from '@sveltejs/kit';

type CspDirectives = NonNullable<NonNullable<KitConfig['csp']>['directives']>;

/**
 * Posée par SvelteKit, pas dans `_headers`.
 * Un `script-src 'self'` statique, sans nonce, bloque le script inline de démarrage :
 * la page s'affiche, mais les clics (FAQ comprise) ne sont plus branchés.
 * `unsafe-inline` reste sur `style-src` pour la transition du menu des questions.
 */
export function cspDirectives(): CspDirectives {
	return {
		'default-src': ['self'],
		'base-uri': ['self'],
		'object-src': ['none'],
		'frame-ancestors': ['none'],
		'form-action': ['self'],
		'script-src': [
			'self',
			'https://www.google.com',
			'https://www.gstatic.com',
			'https://www.googletagmanager.com'
		],
		'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
		'font-src': ['self', 'https://fonts.gstatic.com'],
		'img-src': [
			'self',
			'data:',
			'blob:',
			'https://wcvhjrwplxthowpsrgqe.supabase.co',
			'https://www.gstatic.com',
			'https://www.interfede.be',
			'https://www.googletagmanager.com',
			'https://*.google-analytics.com'
		],
		'frame-src': [
			'https://www.facebook.com',
			'https://www.google.com',
			'https://recaptcha.google.com',
			'https://www.youtube.com',
			'https://www.googletagmanager.com'
		],
		'media-src': ['self', 'https://www.interfede.be', 'blob:'],
		'connect-src': [
			'self',
			'https://www.google.com',
			'https://www.gstatic.com',
			'https://recaptcha.google.com',
			'https://www.googletagmanager.com',
			'https://*.google-analytics.com',
			'https://*.analytics.google.com',
			'https://*.google.com'
		],
		'upgrade-insecure-requests': true
	};
}
