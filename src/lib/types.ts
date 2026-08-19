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

export interface Depute {
	id: number;
	nom: string;
	circonscription: string;
	email: string;
	actif: boolean;
	parti: string | null;
	fonction: string | null;
	role: 'depute' | 'ministre';
	sexe: 'M' | 'F' | null;
}

export type BoutonClic = 'mailto' | 'gmail' | 'outlook' | 'copier';
