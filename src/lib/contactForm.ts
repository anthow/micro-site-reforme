import { createHmac, timingSafeEqual } from 'node:crypto';

export const CONTACT_RECIPIENT = 'communication@interfede.be';
export const JETON_COOKIE = 'contact_jeton';
export const ATTENTE_COOKIE = 'contact_attente';
export const DELAI_MIN_MS = 2_000;
export const JETON_DUREE_MS = 2 * 60 * 60 * 1000;
export const ATTENTE_S = 30;
export const FENETRE_MS = 10 * 60 * 1000;
export const MAX_ENVOIS = 5;

const NOM_MAX = 80;
const EMAIL_MAX = 254;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 4_000;

export type ContactChamps = {
	nom?: string;
	email?: string;
	message?: string;
};

export type ContactDecision =
	| { kind: 'piege' }
	| { kind: 'invalide'; champs: ContactChamps }
	| { kind: 'pret'; nom: string; email: string; message: string };

export function lireContact(brut: {
	nom: string;
	email: string;
	message: string;
	organisme: string;
}): ContactDecision {
	if (brut.organisme.trim()) return { kind: 'piege' };

	const nom = ligne(brut.nom, NOM_MAX);
	const email = ligne(brut.email, EMAIL_MAX).toLowerCase();
	const message = texte(brut.message, MESSAGE_MAX);
	const champs: ContactChamps = {};

	if (nom.length < 2) champs.nom = 'Indiquez votre nom.';
	if (!emailValide(email)) champs.email = 'Indiquez une adresse e-mail valide.';
	if (message.length < MESSAGE_MIN) champs.message = 'Écrivez votre message (au moins quelques mots).';
	else if ((brut.message.match(/https?:\/\//gi) ?? []).length > 3) {
		champs.message = 'Le message contient trop de liens.';
	}

	if (champs.nom || champs.email || champs.message) return { kind: 'invalide', champs };
	return { kind: 'pret', nom, email, message };
}

export function signerJeton(secret: string, emis: number, expire: number): string {
	const charge = `${emis}.${expire}`;
	const mac = createHmac('sha256', secret).update(charge).digest('base64url');
	return `${charge}.${mac}`;
}

export function lireJeton(
	secret: string,
	jeton: string,
	maintenant: number
): 'ok' | 'trop_tot' | 'expire' | 'invalide' {
	const parts = jeton.split('.');
	if (parts.length !== 3) return 'invalide';
	const [emisBrut, expireBrut, mac] = parts;
	if (!/^\d+$/.test(emisBrut) || !/^\d+$/.test(expireBrut) || !mac) return 'invalide';

	const attendu = createHmac('sha256', secret).update(`${emisBrut}.${expireBrut}`).digest('base64url');
	if (!identique(mac, attendu)) return 'invalide';

	const emis = Number(emisBrut);
	const expire = Number(expireBrut);
	if (emis > maintenant + 30_000 || expire <= emis) return 'invalide';
	if (maintenant > expire) return 'expire';
	if (maintenant < emis + DELAI_MIN_MS) return 'trop_tot';
	return 'ok';
}

export function identique(gauche: string, droite: string): boolean {
	const a = Buffer.from(gauche);
	const b = Buffer.from(droite);
	if (a.length === 0 || a.length !== b.length) return false;
	return timingSafeEqual(new Uint8Array(a), new Uint8Array(b));
}

export function priseEnCompte(
	instants: number[],
	maintenant: number,
	fenetreMs: number,
	max: number
): { autorise: boolean; suivants: number[] } {
	const suivants = instants.filter((instant) => maintenant - instant < fenetreMs);
	if (suivants.length >= max) return { autorise: false, suivants };
	suivants.push(maintenant);
	return { autorise: true, suivants };
}

function ligne(valeur: string, max: number): string {
	return sansControle(valeur, false).replace(/\s+/g, ' ').trim().slice(0, max);
}

function texte(valeur: string, max: number): string {
	return sansControle(valeur, true).replace(/\n{4,}/g, '\n\n').trim().slice(0, max);
}

function sansControle(valeur: string, garderSauts: boolean): string {
	let resultat = '';
	for (const char of valeur) {
		const code = char.codePointAt(0) ?? 0;
		if (code === 0) continue;
		if (code < 32 || code === 127) {
			if (garderSauts && (char === '\n' || char === '\t')) resultat += char;
			continue;
		}
		resultat += char;
	}
	return resultat;
}

function emailValide(email: string): boolean {
	if (!email || email.length > EMAIL_MAX) return false;
	if (email.includes('..')) return false;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
