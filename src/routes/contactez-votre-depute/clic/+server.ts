import { createHash } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { supabase } from '$lib/supabaseClient';
import type { BoutonClic } from '$lib/types';
import type { RequestHandler } from './$types';

const BOUTONS = new Set<BoutonClic>(['mailto', 'gmail', 'outlook', 'copier']);

function hashIp(ip: string, salt: string): string {
	return createHash('sha256').update(`${salt}\n${ip}`).digest('hex');
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return new Response(null, { status: 400 });
	}

	const bouton = (body as { bouton?: unknown }).bouton;
	const deputeId = (body as { deputeId?: unknown }).deputeId;
	if (typeof bouton !== 'string' || !BOUTONS.has(bouton as BoutonClic)) {
		return new Response(null, { status: 400 });
	}
	if (typeof deputeId !== 'number' || !Number.isInteger(deputeId) || deputeId <= 0) {
		return new Response(null, { status: 400 });
	}

	const secret = env.CLIC_INGEST_SECRET?.trim() ?? '';
	if (!secret) {
		console.error('CLIC_INGEST_SECRET manquant : clic non enregistré');
		return new Response(null, { status: 204 });
	}

	let ip = 'inconnue';
	try {
		ip = getClientAddress();
	} catch (error) {
		console.error('Adresse client indisponible', error);
	}

	const { error } = await supabase.rpc('enregistrer_clic', {
		p_secret: secret,
		p_bouton: bouton,
		p_depute_id: deputeId,
		p_ip_hash: hashIp(ip, secret)
	});
	if (error) {
		console.error('Suivi du clic impossible');
	}

	return new Response(null, { status: 204 });
};
