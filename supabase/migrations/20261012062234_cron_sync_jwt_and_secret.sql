-- Le cron envoie à nouveau la clé anon, uniquement pour passer verify_jwt.
-- L'autorisation réelle reste l'en-tête x-sync-secret.

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
			'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_sync_deputes_auth'),
			'apikey', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_sync_deputes_auth'),
			'x-sync-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_sync_deputes_secret')
		),
		body := '{}'::jsonb
	);
	$$
);
