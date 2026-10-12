-- La fonction citait "Epingle", qui n'existe pas. La colonne s'appelle epingle.
-- search_path vide, comme recommandé par le linter Supabase (0011).

CREATE OR REPLACE FUNCTION public.limiter_epingles()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
	IF NEW.epingle AND (
		SELECT count(*)
		FROM public."Mobilisation"
		WHERE epingle AND id <> NEW.id
	) >= 2 THEN
		RAISE EXCEPTION 'Maximum 2 articles épinglés';
	END IF;

	RETURN NEW;
END;
$$;
