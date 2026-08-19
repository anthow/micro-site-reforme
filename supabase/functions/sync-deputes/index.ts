/**
 * Synchro quotidienne des députés et ministres wallons :
 * projet source (lecture) → table `deputes` du projet site.
 *
 * -----------------------------------------------------------------------------
 * CONFIGURATION — identifiants du projet SOURCE
 * -----------------------------------------------------------------------------
 * Dashboard du projet SITE > Edge Functions > Secrets (ou `supabase secrets set`) :
 *
 *   SOURCE_SUPABASE_URL  URL API du projet source, ex. https://xxxx.supabase.co
 *   SOURCE_SUPABASE_KEY  Clé service_role (ou clé disposant d'un SELECT sur les
 *                        tables politiques). L'anon key ne suffit généralement pas
 *                        si le RLS du source n'a pas de politique de lecture.
 *
 * Ces secrets ne doivent JAMAIS être exposés au navigateur.
 *
 * Tables lues côté source (constantes ci-dessous, faciles à adapter) :
 *   - public.individu_politique + public.individu (identité, circonscription, parti, ministère)
 *   - public.staging_dato_politique (e-mail parlementaire public, champ payload.mail)
 *
 * -----------------------------------------------------------------------------
 * CONFIGURATION — fréquence du cron
 * -----------------------------------------------------------------------------
 * Voir `supabase/migrations/20260819100001_schedule_sync_deputes_cron.sql`
 * (job `sync-deputes-daily`, actuellement `0 5 * * *` = tous les jours à 05:00 UTC).
 *
 * Les personnes absentes du source sont marquées `actif = false` (jamais supprimées).
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

/** Tables du projet source — modifier ici si le schéma amont change. */
const SOURCE_TABLE_POLITIQUE = 'individu_politique';
const SOURCE_TABLE_STAGING = 'staging_dato_politique';

type IndividuEmbed = {
	prenom: string | null;
	nom: string | null;
	sexe: string | null;
};

type IndividuPolitiqueRow = {
	id_individ: number;
	slug: string | null;
	dato_item_id: string | null;
	circonscription: string | null;
	mail2: string | null;
	statut: string | null;
	effectif_ou_suppleant: string | null;
	parti: string | null;
	ministere: string | null;
	individu: IndividuEmbed | IndividuEmbed[] | null;
};

type StagingRow = {
	dato_item_id: string | null;
	payload: Record<string, unknown> | null;
};

type Role = 'depute' | 'ministre';

type DeputeUpsert = {
	nom: string;
	circonscription: string;
	email: string;
	parti: string | null;
	fonction: string | null;
	role: Role;
	sexe: 'M' | 'F' | null;
	actif: true;
};

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

function asSingleIndividu(value: IndividuPolitiqueRow['individu']): IndividuEmbed | null {
	if (!value) return null;
	return Array.isArray(value) ? (value[0] ?? null) : value;
}

function normalizeEmail(value: string | null | undefined): string | null {
	if (!value) return null;
	const candidates = value
		.split(/[\s,;]+/)
		.map((part) => part.trim().toLowerCase())
		.filter((part) => part.includes('@') && part.length >= 5);

	return (
		candidates.find((email) => email.endsWith('@gov.wallonie.be')) ??
		candidates.find((email) => email.endsWith('@parlement-wallonie.be')) ??
		candidates[0] ??
		null
	);
}

function payloadString(payload: Record<string, unknown> | null, key: string): string | null {
	if (!payload) return null;
	const value = payload[key];
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function classifyRole(statut: string | null, effectifOuSuppleant: string | null): Role | null {
	if (!statut) return null;
	if (/ministre/i.test(statut)) return 'ministre';
	if (!/d[eé]put/i.test(statut)) return null;
	if (effectifOuSuppleant && /suppl/i.test(effectifOuSuppleant)) return null;
	return 'depute';
}

function inferSexe(
	sexe: string | null | undefined,
	prenom: string | null | undefined,
	ministere: string | null | undefined
): 'M' | 'F' | null {
	const normalized = sexe?.trim().toUpperCase();
	if (normalized === 'M' || normalized === 'F') return normalized;

	const titre = ministere ?? '';
	if (/wallonne|présidente/i.test(titre)) return 'F';
	if (/wallon|président/i.test(titre)) return 'M';

	const prenomNorm = prenom
		?.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{M}/gu, '');
	if (!prenomNorm) return null;
	if (['willy', 'gregory', 'yves', 'vincent', 'francois', 'herve'].includes(prenomNorm)) return 'M';
	if (['veronique', 'sylvie', 'valerie', 'cecile'].includes(prenomNorm)) return 'F';
	return null;
}

function displayName(prenom: string | null, nom: string | null): string | null {
	const parts = [prenom, nom].map((part) => part?.trim()).filter(Boolean);
	return parts.length > 0 ? parts.join(' ') : null;
}

Deno.serve(async () => {
	const sourceUrl = Deno.env.get('SOURCE_SUPABASE_URL');
	const sourceKey = Deno.env.get('SOURCE_SUPABASE_KEY');
	const siteUrl = Deno.env.get('SUPABASE_URL');
	const siteServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

	if (!sourceUrl || !sourceKey) {
		return jsonResponse(
			{
				error:
					'Secrets SOURCE_SUPABASE_URL et SOURCE_SUPABASE_KEY manquants. Les configurer dans Dashboard > Edge Functions > Secrets.'
			},
			500
		);
	}

	if (!siteUrl || !siteServiceKey) {
		return jsonResponse({ error: 'Secrets internes SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.' }, 500);
	}

	const source = createClient(sourceUrl, sourceKey, {
		auth: { persistSession: false, autoRefreshToken: false }
	});
	const site = createClient(siteUrl, siteServiceKey, {
		auth: { persistSession: false, autoRefreshToken: false }
	});

	const { data: politiques, error: politiquesError } = await source
		.from(SOURCE_TABLE_POLITIQUE)
		.select(
			'id_individ, slug, dato_item_id, circonscription, mail2, statut, effectif_ou_suppleant, parti, ministere, individu(prenom, nom, sexe)'
		)
		.limit(1000);

	if (politiquesError) {
		return jsonResponse(
			{ error: 'Lecture du projet source (individu_politique) impossible', details: politiquesError.message },
			502
		);
	}

	const { data: staging, error: stagingError } = await source
		.from(SOURCE_TABLE_STAGING)
		.select('dato_item_id, payload')
		.limit(1000);

	if (stagingError) {
		return jsonResponse(
			{ error: 'Lecture du projet source (staging_dato_politique) impossible', details: stagingError.message },
			502
		);
	}

	const mailByDatoId = new Map<string, string>();
	const mailBySlug = new Map<string, string>();
	for (const row of (staging ?? []) as StagingRow[]) {
		const payload = row.payload;
		const email = normalizeEmail(payloadString(payload, 'mail') ?? payloadString(payload, 'mail2'));
		if (!email) continue;
		if (row.dato_item_id) mailByDatoId.set(row.dato_item_id, email);
		const slug = payloadString(payload, 'slug_source') ?? payloadString(payload, 'slug_preview');
		if (slug) mailBySlug.set(slug.toLowerCase(), email);
	}

	const seenEmails = new Set<string>();
	const rows: DeputeUpsert[] = [];

	for (const raw of (politiques ?? []) as IndividuPolitiqueRow[]) {
		const role = classifyRole(raw.statut, raw.effectif_ou_suppleant);
		if (!role) continue;

		const individu = asSingleIndividu(raw.individu);
		const nom = displayName(individu?.prenom ?? null, individu?.nom ?? null);
		const circonscription = raw.circonscription?.trim() ?? '';
		const stagingPayload =
			(staging ?? []).find((row) => (row as StagingRow).dato_item_id === raw.dato_item_id)?.payload ?? null;
		const parti = raw.parti?.trim() || payloadString(stagingPayload, 'parti');
		const fonction =
			role === 'ministre' ? raw.ministere?.trim() || payloadString(stagingPayload, 'ministere') : null;
		const email =
			normalizeEmail(raw.mail2) ??
			(raw.dato_item_id ? mailByDatoId.get(raw.dato_item_id) : undefined) ??
			(raw.slug ? mailBySlug.get(raw.slug.toLowerCase()) : undefined) ??
			null;
		const sexe = inferSexe(individu?.sexe, individu?.prenom, raw.ministere);

		if (!nom || !email) continue;
		if (role === 'depute' && !circonscription) continue;
		if (role === 'ministre' && !fonction) continue;
		if (seenEmails.has(email)) continue;
		seenEmails.add(email);

		rows.push({
			nom,
			circonscription: circonscription || fonction || nom,
			email,
			parti,
			fonction,
			role,
			sexe,
			actif: true
		});
	}

	if (rows.length === 0) {
		return jsonResponse(
			{
				error:
					'Aucun député ou ministre valide dans le projet source. Aucune désactivation n’a été effectuée.'
			},
			502
		);
	}

	const { error: upsertError } = await site.from('deputes').upsert(rows, { onConflict: 'email' });
	if (upsertError) {
		return jsonResponse({ error: 'Upsert des députés impossible', details: upsertError.message }, 500);
	}

	const { data: existing, error: existingError } = await site.from('deputes').select('id, email');
	if (existingError) {
		return jsonResponse({ error: 'Lecture des députés locaux impossible', details: existingError.message }, 500);
	}

	const goneIds = (existing ?? [])
		.filter((row: { id: number; email: string }) => !seenEmails.has(row.email.toLowerCase()))
		.map((row: { id: number }) => row.id);

	if (goneIds.length > 0) {
		const { error: deactivateError } = await site.from('deputes').update({ actif: false }).in('id', goneIds);
		if (deactivateError) {
			return jsonResponse(
				{ error: 'Désactivation des destinataires absents impossible', details: deactivateError.message },
				500
			);
		}
	}

	return jsonResponse({
		ok: true,
		upserted: rows.length,
		deactivated: goneIds.length,
		ministres: rows.filter((row) => row.role === 'ministre').length,
		deputes: rows.filter((row) => row.role === 'depute').length
	});
});
