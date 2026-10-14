import { facebookPluginSrc } from './facebookVideo.ts';
import { formatPublicationDate, splitParagraphs } from './mobilisation.ts';
import { sanitizeRichText } from './sanitizeRichText.ts';
import { safeResourceUrl } from './safeUrl.ts';
import type {
	AvisInitiativeBloc,
	CarrouselSlide,
	Homepage,
	LogoFede,
	Partenaire,
	PositionContenu,
	ReelVideo,
	Video
} from './types.ts';

export function loadProblem(error: { message: string } | null): string | null {
	if (!error) return null;
	console.error(error.message);
	return 'indisponible';
}

export function sanitizeLogos(logos: LogoFede[]): LogoFede[] {
	return logos.map((logo) => ({
		...logo,
		url: safeResourceUrl(logo.url),
		'url-website': safeResourceUrl(logo['url-website'])
	}));
}

export function sanitizeHomepage(homepage: Homepage | null): Homepage | null {
	if (!homepage) return null;
	return {
		...homepage,
		Texte: homepage.Texte ? sanitizeRichText(homepage.Texte) : homepage.Texte,
		Image_hero_URL: safeResourceUrl(homepage.Image_hero_URL)
	};
}

const HTML_BLOC = new Set(['p', 'li', 'note']);

export function sanitizeAvis(blocs: AvisInitiativeBloc[]): AvisInitiativeBloc[] {
	return blocs.map((bloc) =>
		HTML_BLOC.has(bloc.type) ? { ...bloc, texte: sanitizeRichText(bloc.texte) } : bloc
	);
}

export function sanitizeVideos(videos: Video[]): Video[] {
	return videos.flatMap((video) => {
		const url = safeResourceUrl(video.url);
		return url ? [{ ...video, url }] : [];
	});
}

export function linesOf(value: string | null | undefined): string[] {
	if (!value) return [];
	return value
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

export function presentSlogans(value: string | null | undefined): string[] {
	return linesOf(value);
}

export function presentPartenaires(
	rows: { id: number; Nom: string | null; Logo_URL: string | null; Lien: string | null }[]
): Partenaire[] {
	return rows.flatMap((row) => {
		const nom = row.Nom?.trim() ?? '';
		const logoUrl = safeResourceUrl(row.Logo_URL);
		if (!nom || !logoUrl) return [];
		return [{ id: Number(row.id), nom, logoUrl, lien: safeResourceUrl(row.Lien) }];
	});
}

export function presentCarousel(
	rows: {
		id: number;
		Titre: string | null;
		Texte: string | null;
		Image_URL: string | null;
		Lien: string | null;
		Ordre: number | null;
		Actif: boolean | null;
	}[]
): CarrouselSlide[] {
	return rows
		.filter((row) => row.Actif !== false)
		.sort((a, b) => (a.Ordre ?? 0) - (b.Ordre ?? 0) || Number(a.id) - Number(b.id))
		.flatMap((row) => {
			const titre = row.Titre?.replace(/\r\n/g, '\n').trim() ?? '';
			if (!titre) return [];
			return [
				{
					id: Number(row.id),
					titre,
					texte: row.Texte?.replace(/\r\n/g, '\n').trim() || null,
					imageUrl: safeResourceUrl(row.Image_URL),
					lien: safeResourceUrl(row.Lien)
				}
			];
		});
}

export function presentReels(
	rows: { id: number; Titre: string | null; URL: string | null; Ordre: number | null }[]
): ReelVideo[] {
	return [...rows]
		.sort((a, b) => (a.Ordre ?? 0) - (b.Ordre ?? 0) || Number(a.id) - Number(b.id))
		.flatMap((row) => {
			const url = safeResourceUrl(row.URL);
			if (!url || !facebookPluginSrc(url)) return [];
			return [{ id: Number(row.id), titre: row.Titre?.trim() || null, url }];
		});
}

export function presentPosition(
	row: {
		Titre: string | null;
		Texte: string | null;
		PDF_URL: string | null;
		Mis_a_jour_le: string | null;
	} | null
): PositionContenu | null {
	if (!row) return null;
	const titre = row.Titre?.replace(/\r\n/g, '\n').trim() || null;
	const paragraphes = splitParagraphs(row.Texte?.replace(/\r\n/g, '\n'));
	const pdfUrl = safeResourceUrl(row.PDF_URL);
	const misAJour = formatPublicationDate(row.Mis_a_jour_le);
	if (!titre && paragraphes.length === 0 && !pdfUrl && !misAJour) return null;
	return { titre, paragraphes, pdfUrl, misAJour };
}
