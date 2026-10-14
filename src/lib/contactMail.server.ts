import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { CONTACT_RECIPIENT } from './contactForm.ts';

const SECRET_DEV = 'developpement-local-uniquement-ne-pas-reutiliser';
const RESEND_EMAILS = 'https://api.resend.com/emails';

export function secretFormulaire(): string | null {
	const secret = env.CONTACT_FORM_SECRET?.trim() ?? '';
	if (secret.length >= 32) return secret;
	if (dev) return SECRET_DEV;
	console.error('contact: CONTACT_FORM_SECRET manquant');
	return null;
}

export async function envoyerContact(message: {
	nom: string;
	email: string;
	message: string;
}): Promise<'envoye' | 'indisponible'> {
	const apiKey = env.RESEND_API_KEY?.trim() ?? '';
	const from = env.CONTACT_FROM?.trim() ?? '';
	if (!cleResend(apiKey) || !expediteur(from)) {
		console.error('contact: Resend non configuré');
		return 'indisponible';
	}

	try {
		const response = await fetch(RESEND_EMAILS, {
			method: 'POST',
			redirect: 'error',
			signal: AbortSignal.timeout(10_000),
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from,
				to: [CONTACT_RECIPIENT],
				reply_to: message.email,
				subject: 'Message depuis le site Réforme des CISP',
				text: `Nom : ${message.nom}\nAdresse : ${message.email}\n\n${message.message}\n`
			})
		});
		if (!response.ok) {
			console.error('contact: Resend a refusé l’envoi', response.status);
			return 'indisponible';
		}
		const body = (await response.json()) as { id?: unknown };
		if (typeof body.id !== 'string' || !body.id) {
			console.error('contact: réponse Resend inattendue');
			return 'indisponible';
		}
		return 'envoye';
	} catch (error) {
		const nom = error instanceof Error ? error.name : 'erreur';
		console.error('contact: envoi Resend impossible', nom);
		return 'indisponible';
	}
}

function cleResend(valeur: string): boolean {
	return valeur.startsWith('re_') && valeur.length >= 11 && !/[\s]/.test(valeur);
}

function expediteur(valeur: string): boolean {
	if (!valeur || valeur.length > 200) return false;
	return !/[\r\n<>]/.test(valeur) || /^[^<>\r\n]+ <[^<>\r\n@]+@[^<>\r\n]+>$/.test(valeur);
}
