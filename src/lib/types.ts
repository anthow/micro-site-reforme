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

export interface Video {
	id: number;
	url: string | null;
}

export interface MobilisationArticle {
	id: number;
	created_at: string;
	titre: string;
	resume: string | null;
	texte: string | null;
	imageUrl: string | null;
	videoEmbed: string | null;
	epingle: boolean;
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

export type AvisInitiativeType =
	| 'titre'
	| 'soustitre'
	| 'date'
	| 'description'
	| 'h2'
	| 'h3'
	| 'kicker'
	| 'p'
	| 'li'
	| 'note';

export interface AvisInitiativeBloc {
	id: number;
	ordre: number;
	type: AvisInitiativeType;
	texte: string;
	ancre: string | null;
}
