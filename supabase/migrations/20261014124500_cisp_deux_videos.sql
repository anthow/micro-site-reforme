-- Les tiroirs restent du texte. Les deux vidéos de la page sont côte à côte.

UPDATE public."Cisp"
SET "Video_URL" = NULL
WHERE "Role" = 'tiroir';

UPDATE public."Cisp"
SET
	"Titre" = 'C''est quoi un CISP ?',
	"Video_URL" = 'https://youtu.be/nJAlYSNn93o',
	"Image_URL" = NULL,
	"Lien" = NULL
WHERE "Ordre" = 6;
