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
		'script-src': ['self'],
		'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
		'font-src': ['self', 'https://fonts.gstatic.com'],
		'img-src': ['self', 'data:', 'blob:', 'https://wcvhjrwplxthowpsrgqe.supabase.co'],
		'frame-src': ['https://www.facebook.com'],
		'connect-src': ['self'],
		'upgrade-insecure-requests': true
	};
}
