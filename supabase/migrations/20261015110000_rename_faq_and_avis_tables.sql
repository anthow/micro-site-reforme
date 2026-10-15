-- Alignement du schéma : FAQ → Enjeux_reforme, Avis_initiative → Position_du_secteur.
-- Idempotent : ignore si le renommage a déjà été fait côté dashboard.

DO $$
BEGIN
	IF to_regclass('public."FAQ"') IS NOT NULL
		AND to_regclass('public."Enjeux_reforme"') IS NULL
	THEN
		ALTER TABLE public."FAQ" RENAME TO "Enjeux_reforme";
	END IF;

	IF to_regclass('public."Avis_initiative"') IS NOT NULL
		AND to_regclass('public."Position_du_secteur"') IS NULL
	THEN
		ALTER TABLE public."Avis_initiative" RENAME TO "Position_du_secteur";
	END IF;
END $$;

COMMENT ON TABLE public."Enjeux_reforme" IS
	'Enjeux de la réforme (ex-FAQ), questions / réponses affichées sur le site.';

COMMENT ON TABLE public."Position_du_secteur" IS
	'Contenu de la page Position du secteur (ex-Avis d''initiative), dans l''ordre d''affichage.';
