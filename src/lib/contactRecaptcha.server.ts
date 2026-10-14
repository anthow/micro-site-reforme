import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import { reponseRecaptchaValide } from './contactRecaptcha.ts';

const SITEVERIFY = 'https://www.google.com/recaptcha/api/siteverify';

export function cleSiteRecaptcha(): string {
	return envPublic.PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? '';
}

export function recaptchaConfigure(): boolean {
	return cleSiteRecaptcha().length > 0 && secret().length > 0;
}

export async function verifierRecaptcha(
	jeton: string,
	adresseIp: string
): Promise<'ok' | 'absent' | 'refuse'> {
	if (!recaptchaConfigure()) {
		if (dev) return 'ok';
		console.error('contact: reCAPTCHA non configuré');
		return 'absent';
	}
	if (!jeton || jeton.length > 4_000 || /\s/.test(jeton)) return 'refuse';

	try {
		const corps = new URLSearchParams({ secret: secret(), response: jeton });
		if (adresseIp && adresseIp !== 'inconnue') corps.set('remoteip', adresseIp);
		const response = await fetch(SITEVERIFY, {
			method: 'POST',
			redirect: 'error',
			signal: AbortSignal.timeout(10_000),
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: corps
		});
		if (!response.ok) {
			console.error('contact: reCAPTCHA injoignable', response.status);
			return 'refuse';
		}
		if (!reponseRecaptchaValide(await response.json())) {
			console.error('contact: reCAPTCHA refusé');
			return 'refuse';
		}
		return 'ok';
	} catch (error) {
		const nom = error instanceof Error ? error.name : 'erreur';
		console.error('contact: reCAPTCHA injoignable', nom);
		return 'refuse';
	}
}

function secret(): string {
	return env.RECAPTCHA_SECRET_KEY?.trim() ?? '';
}
