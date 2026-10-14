-- Page /cisp : questions en tiroir, puis outils déjà publiés (infographie, vidéos).

CREATE TABLE public."Cisp" (
	id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamptz NOT NULL DEFAULT now(),
	"Ordre" integer NOT NULL UNIQUE,
	"Role" text NOT NULL CHECK ("Role" = ANY (ARRAY['intro'::text, 'tiroir'::text, 'outil'::text])),
	"Titre" text NOT NULL,
	"Texte" text,
	"Video_URL" text,
	"Image_URL" text,
	"Lien" text,
	"Source" text CHECK ("Source" IS NULL OR "Source" = ANY (ARRAY['IF'::text, 'CAIPS'::text]))
);

ALTER TABLE public."Cisp" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique Cisp"
	ON public."Cisp"
	FOR SELECT
	TO anon, authenticated
	USING (true);

REVOKE ALL ON TABLE public."Cisp" FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public."Cisp" TO anon, authenticated;

INSERT INTO public."Cisp" ("Ordre", "Role", "Titre", "Texte", "Video_URL", "Image_URL", "Lien", "Source")
VALUES
	(
		1,
		'intro',
		'CISP ?',
		'Les centres d’insertion socioprofessionnelle (CISP) sont des opérateurs de formation et d’insertion qui s’adressent principalement à des adultes demandeurs d’emploi, souvent peu scolarisés.',
		NULL,
		NULL,
		NULL,
		NULL
	),
	(
		2,
		'tiroir',
		'C’est quoi ?',
		NULL,
		'https://www.youtube.com/watch?v=-aoHhar5R90',
		NULL,
		NULL,
		'IF'
	),
	(
		3,
		'tiroir',
		'Pour qui ?',
		NULL,
		'https://www.youtube.com/watch?v=AhwlxKzG4z8',
		NULL,
		NULL,
		'IF'
	),
	(
		4,
		'tiroir',
		'Comment ?',
		NULL,
		'https://www.youtube.com/watch?v=AVOXeHEyo3I',
		NULL,
		NULL,
		'IF'
	),
	(
		5,
		'outil',
		'CISP, une solution pour l’emploi !',
		NULL,
		'https://youtu.be/ANV7BPe2miQ',
		NULL,
		NULL,
		'IF'
	),
	(
		6,
		'outil',
		'Les différentes formations des CISP',
		NULL,
		'https://www.youtube.com/watch?v=8twAJPNs75Y',
		NULL,
		NULL,
		'IF'
	),
	(
		7,
		'outil',
		'Découvrez le secteur CISP avec les chiffres de 2025',
		NULL,
		NULL,
		'https://www.interfede.be/wp-content/uploads/2026/10/2026-09_Infographie_chiffres2025-scaled.jpg',
		'https://www.interfede.be/wp-content/uploads/2026/10/2026-09_Infographie-chiffres-2025.pdf',
		'IF'
	);
