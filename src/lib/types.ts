export interface Homepage {
	id: number;
	Titre: string | null;
	Soustitre: string | null;
	Texte: string | null;
	Image_hero_URL: string | null;
}

export interface FaqEntry {
	id: number;
	Question: string | null;
	Réponse: string | null;
}

export interface LogoFede {
	id: number;
	url: string | null;
	'url-website': string | null;
}
