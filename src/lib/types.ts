export interface Homepage {
	id: number;
	Titre: string | null;
	Soustitre: string | null;
	Texte: string | null;
	Points_cles: string | null;
	Image_hero_URL: string | null;
}

export interface EnjeuxMaj {
	texte: string | null;
	date: { iso: string; label: string } | null;
}

export interface Partenaire {
	id: number;
	nom: string;
	logoUrl: string;
	lien: string | null;
}

export interface CarrouselSlide {
	id: number;
	titre: string;
	texte: string | null;
	imageUrl: string | null;
	lien: string | null;
}

export interface ReelVideo {
	id: number;
	titre: string | null;
	url: string;
}

export interface PositionContenu {
	titre: string | null;
	paragraphes: string[];
	pdfUrl: string | null;
	misAJour: { iso: string; label: string } | null;
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

export type MobilisationCategorie = 'communique' | 'revue_presse' | 'retour_actions';

export interface MobilisationArticle {
	id: number;
	created_at: string;
	titre: string;
	resume: string | null;
	texte: string | null;
	texteHtml: boolean;
	publication: { iso: string; label: string } | null;
	imageUrl: string | null;
	videoEmbed: string | null;
	lien: string | null;
	abonnement: boolean;
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

export type CispRole = 'intro' | 'tiroir' | 'outil';
export type CispSource = 'IF' | 'CAIPS';

export interface CispBloc {
	id: number;
	role: CispRole;
	titre: string;
	texte: string | null;
	videoUrl: string | null;
	imageUrl: string | null;
	lien: string | null;
	source: CispSource | null;
}
