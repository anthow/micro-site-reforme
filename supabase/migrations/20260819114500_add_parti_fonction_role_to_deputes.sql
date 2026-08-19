-- Ajoute le parti politique, le rôle (député / ministre) et la fonction ministérielle.
-- Pour les ministres, l'affichage utilise `fonction` à la place de `circonscription`.

ALTER TABLE public.deputes
	ADD COLUMN parti text,
	ADD COLUMN fonction text,
	ADD COLUMN role text NOT NULL DEFAULT 'depute';

ALTER TABLE public.deputes
	ADD CONSTRAINT deputes_role_check CHECK (role IN ('depute', 'ministre'));
