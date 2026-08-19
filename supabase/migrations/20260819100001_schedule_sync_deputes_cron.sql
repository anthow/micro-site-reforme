-- Planifie l'appel quotidien de l'Edge Function sync-deputes.
--
-- FRÉQUENCE DU CRON (modifier ici, syntaxe cron standard) :
--   '0 5 * * *'  = tous les jours à 05:00 UTC
--   '0 */12 * * *' = toutes les 12 heures
--   '0 5 * * 1'  = tous les lundis à 05:00 UTC
-- Après un premier déploiement, pour changer la fréquence sans recréer le job :
--   SELECT cron.alter_job((SELECT jobid FROM cron.job WHERE jobname = 'sync-deputes-daily'), schedule => '0 5 * * *');
--
-- SECRETS VAULT (à créer une fois, valeurs non versionnées) :
--   cron_sync_deputes_url  = https://<PROJECT_REF_SITE>.supabase.co/functions/v1/sync-deputes
--   cron_sync_deputes_auth = clé anon JWT (legacy) du projet site
-- Identifiants du PROJET SOURCE : secrets d'Edge Function SOURCE_SUPABASE_URL et SOURCE_SUPABASE_KEY
-- (Dashboard > Edge Functions > Secrets), pas dans Vault.

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Job idempotent : on recrée s'il existe déjà (ré-application / ajustement).
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'sync-deputes-daily';

SELECT cron.schedule(
	'sync-deputes-daily',
	'0 5 * * *', -- CRON_SCHEDULE : une fois par jour à 05:00 UTC
	$$
	SELECT net.http_post(
		url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_sync_deputes_url'),
		headers := jsonb_build_object(
			'Content-Type', 'application/json',
			'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_sync_deputes_auth'),
			'apikey', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_sync_deputes_auth')
		),
		body := '{}'::jsonb
	);
	$$
);
