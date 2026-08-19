-- Sexe du destinataire (M / F), pour la formule d'appel Madame / Monsieur.
-- Nullable : si inconnu, le message conserve « Madame, Monsieur ».

ALTER TABLE public.deputes
	ADD COLUMN sexe text;

ALTER TABLE public.deputes
	ADD CONSTRAINT deputes_sexe_check CHECK (sexe IS NULL OR sexe IN ('M', 'F'));
