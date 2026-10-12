-- Ferme les accès trop larges constatés à l'audit :
-- synchro cron par secret dédié, clics via fonction, lecture des députés
-- limitée à la majorité, écriture retirée sur le contenu éditorial.

-- Députés affichés : actifs, rôle député, MR ou Les Engagés.
DROP POLICY IF EXISTS "Lecture publique des deputes" ON public.deputes;
DROP POLICY IF EXISTS "Lecture publique des deputes de la majorite" ON public.deputes;

CREATE POLICY "Lecture publique des deputes de la majorite"
	ON public.deputes
	FOR SELECT
	TO anon, authenticated
	USING (
		actif
		AND role = 'depute'
		AND lower(
			translate(
				btrim(parti),
				'éèêëÉÈÊËàâäÀÂÄôöÔÖûüÛÜîïÎÏçÇ',
				'eeeeEEEEaaaAAAooOOuuUUiiIIcC'
			)
		) IN ('mr', 'les engages')
	);

-- Clics : plus d'INSERT direct. Le serveur appelle enregistrer_clic.
DROP POLICY IF EXISTS "Insertion publique des evenements_clics" ON public.evenements_clics;

REVOKE INSERT ON TABLE public.evenements_clics FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.evenements_clics_id_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.evenements_clics_id_seq TO service_role;

ALTER TABLE public.evenements_clics
	ADD COLUMN IF NOT EXISTS ip_hash text;

CREATE INDEX IF NOT EXISTS evenements_clics_ip_depute_date_idx
	ON public.evenements_clics (ip_hash, depute_id, date_creation);

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.enregistrer_clic(
	p_secret text,
	p_bouton text,
	p_depute_id bigint,
	p_ip_hash text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	expected text;
	recent_depute bigint;
	recent_ip bigint;
BEGIN
	SELECT decrypted_secret INTO expected
	FROM vault.decrypted_secrets
	WHERE name = 'clic_ingest_secret';

	IF expected IS NULL OR length(expected) = 0 THEN
		RAISE EXCEPTION 'non autorise';
	END IF;

	IF p_secret IS NULL
		OR extensions.digest(p_secret, 'sha256') IS DISTINCT FROM extensions.digest(expected, 'sha256') THEN
		RAISE EXCEPTION 'non autorise';
	END IF;

	IF p_bouton NOT IN ('mailto', 'gmail', 'outlook', 'copier') THEN
		RAISE EXCEPTION 'bouton invalide';
	END IF;

	IF p_ip_hash IS NULL OR p_ip_hash !~ '^[0-9a-f]{64}$' THEN
		RAISE EXCEPTION 'empreinte invalide';
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM public.deputes AS d
		WHERE d.id = p_depute_id
			AND d.actif
			AND d.role = 'depute'
			AND lower(
				translate(
					btrim(d.parti),
					'éèêëÉÈÊËàâäÀÂÄôöÔÖûüÛÜîïÎÏçÇ',
					'eeeeEEEEaaaAAAooOOuuUUiiIIcC'
				)
			) IN ('mr', 'les engages')
	) THEN
		RAISE EXCEPTION 'depute invalide';
	END IF;

	SELECT count(*) INTO recent_depute
	FROM public.evenements_clics
	WHERE depute_id = p_depute_id
		AND ip_hash = p_ip_hash
		AND date_creation > now() - interval '1 hour';

	SELECT count(*) INTO recent_ip
	FROM public.evenements_clics
	WHERE ip_hash = p_ip_hash
		AND date_creation > now() - interval '1 hour';

	IF recent_depute >= 8 OR recent_ip >= 30 THEN
		RETURN;
	END IF;

	INSERT INTO public.evenements_clics (bouton_clique, depute_id, ip_hash)
	VALUES (p_bouton, p_depute_id, p_ip_hash);
END;
$$;

REVOKE ALL ON FUNCTION private.enregistrer_clic(text, text, bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.enregistrer_clic(text, text, bigint, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.enregistrer_clic(
	p_secret text,
	p_bouton text,
	p_depute_id bigint,
	p_ip_hash text
) RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
	PERFORM private.enregistrer_clic(p_secret, p_bouton, p_depute_id, p_ip_hash);
END;
$$;

REVOKE ALL ON FUNCTION public.enregistrer_clic(text, text, bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enregistrer_clic(text, text, bigint, text) TO anon, authenticated, service_role;

-- La synchro vérifie l'en-tête via cette fonction. anon ne peut pas l'appeler.
-- Elle ne renvoie qu'un booléen, jamais le secret.
CREATE OR REPLACE FUNCTION public.sync_autorise(p_secret text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
	expected text;
BEGIN
	SELECT decrypted_secret INTO expected
	FROM vault.decrypted_secrets
	WHERE name = 'cron_sync_deputes_secret';

	IF expected IS NULL OR length(expected) = 0 OR p_secret IS NULL OR length(p_secret) = 0 THEN
		RETURN false;
	END IF;

	RETURN extensions.digest(p_secret, 'sha256') = extensions.digest(expected, 'sha256');
END;
$$;

REVOKE ALL ON FUNCTION public.sync_autorise(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_autorise(text) TO service_role;

-- Contenu éditorial : anon ne garde que la lecture. Le RLS reste la barrière,
-- et TRUNCATE n'est plus accordé (il ignore le RLS).
REVOKE ALL ON TABLE public."FAQ" FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public."FAQ" TO anon, authenticated;

REVOKE ALL ON TABLE public."Homepage" FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public."Homepage" TO anon, authenticated;

REVOKE ALL ON TABLE public."Logo_fede" FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public."Logo_fede" TO anon, authenticated;

REVOKE ALL ON TABLE public.videos FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.videos TO anon, authenticated;

-- Le cron envoie le secret Vault cron_sync_deputes_secret dans x-sync-secret.
-- sync_autorise le compare. Ce secret n'est pas recopié dans les secrets d'Edge Function.
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'sync-deputes-daily';

SELECT cron.schedule(
	'sync-deputes-daily',
	'0 5 * * *',
	$$
	SELECT net.http_post(
		url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_sync_deputes_url'),
		headers := jsonb_build_object(
			'Content-Type', 'application/json',
			'x-sync-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_sync_deputes_secret')
		),
		body := '{}'::jsonb
	);
	$$
);
