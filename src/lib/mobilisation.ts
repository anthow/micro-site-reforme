import { facebookPluginSrc } from './facebookVideo.ts';
import { safeHref, safeResourceUrl } from './safeUrl.ts';
import { sanitizeArticleHtml } from './sanitizeRichText.ts';
import type { MobilisationArticle, MobilisationCategorie } from './types';

const SLUG_MAX = 80;
const BRUSSELS = 'Europe/Brussels';

export const MOBILISATION_COLUMNS =
	'id, created_at, "Titre", "Resume", "Texte", "Image_URL", "Video_URL", "Epingle", "Publie", "Date", "Lien", abonnement, "Categorie"';

export const MOBILISATION_CATEGORIES: { id: MobilisationCategorie; label: string }[] = [
	{ id: 'communique', label: 'Communiqués de presse' },
	{ id: 'revue_presse', label: 'Revue de presse' },
	{ id: 'retour_actions', label: 'Retour des actions des CISP' }
];

export interface MobilisationRow {
	id: number | string;
	created_at: string;
	Titre: string | null;
	Resume: string | null;
	Texte?: string | null;
	Image_URL: string | null;
	Video_URL: string | null;
	Lien?: string | null;
	abonnement?: boolean | null;
	Epingle: boolean | null;
	Publie: boolean | null;
	Date?: string | null;
	Categorie?: string | null;
}

export function mobilisationCategorie(value: string | null | undefined): MobilisationCategorie | null {
	if (!value) return null;
	return MOBILISATION_CATEGORIES.some((item) => item.id === value) ? (value as MobilisationCategorie) : null;
}

export function articleSlug(titre: string): string {
	const folded = titre
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/['’ʼ]/g, '-')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	if (folded.length <= SLUG_MAX) return folded;

	const cut = folded.slice(0, SLUG_MAX);
	const hyphen = cut.lastIndexOf('-');
	return (hyphen > 24 ? cut.slice(0, hyphen) : cut).replace(/-+$/g, '');
}

export function articlePath(id: number, titre: string): string {
	const slug = articleSlug(titre);
	return slug ? `/mobilisation/${id}-${slug}` : `/mobilisation/${id}`;
}

export function articleIdFromParam(param: string): number | null {
	const match = /^(\d+)(?:-|$)/.exec(param);
	if (!match) return null;
	const id = Number(match[1]);
	if (!Number.isInteger(id) || id < 1) return null;
	return id;
}

function looksLikeHtml(value: string): boolean {
	return /<\/?[a-z]/i.test(value);
}

export function splitParagraphs(text: string | null | undefined): string[] {
	if (!text) return [];
	return text
		.split(/\n\s*\n+/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
}

function timestamp(value: string): number {
	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatPublicationDate(
	value: string | null | undefined
): { iso: string; label: string } | null {
	if (!value) return null;
	const iso = value.slice(0, 10);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || value.length !== 10) return null;

	const [year, month, day] = iso.split('-').map(Number);
	const date = new Date(year, month - 1, day);
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return null;
	}

	return {
		iso,
		label: new Intl.DateTimeFormat('fr-BE', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(date)
	};
}

export function formatTimestamp(
	value: string | null | undefined
): { iso: string; label: string } | null {
	if (!value) return null;
	const parsed = Date.parse(value);
	if (Number.isNaN(parsed)) return null;

	const date = new Date(parsed);
	const iso = new Intl.DateTimeFormat('en-CA', {
		timeZone: BRUSSELS,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(date);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

	return {
		iso,
		label: new Intl.DateTimeFormat('fr-BE', {
			timeZone: BRUSSELS,
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(date)
	};
}

export function sortMobilisation<
	T extends { epingle: boolean; created_at: string; publication?: { iso: string } | null }
>(articles: T[]): T[] {
	return [...articles].sort((a, b) => {
		if (a.epingle !== b.epingle) return a.epingle ? -1 : 1;
		return timestamp(b.publication?.iso ?? b.created_at) - timestamp(a.publication?.iso ?? a.created_at);
	});
}

export function facebookReelEmbed(postUrl: string | null | undefined): string | null {
	return facebookPluginSrc(postUrl);
}

function storedText(value: string | null | undefined): string | null {
	if (!value) return null;
	const normalized = value.replace(/\r\n/g, '\n').trim();
	return normalized || null;
}

export function presentMobilisation(row: MobilisationRow): MobilisationArticle | null {
	const titre = storedText(row.Titre) ?? '';
	const id = typeof row.id === 'string' ? Number(row.id) : row.id;
	if (!row.Publie || !titre || !Number.isInteger(id) || id < 1) return null;

	const rawTexte = storedText(row.Texte);
	const texteHtml = rawTexte != null && looksLikeHtml(rawTexte);

	return {
		id,
		created_at: row.created_at,
		titre,
		resume: storedText(row.Resume),
		texte: rawTexte == null ? null : texteHtml ? sanitizeArticleHtml(rawTexte) : rawTexte,
		texteHtml,
		publication: formatPublicationDate(row.Date) ?? formatTimestamp(row.created_at),
		imageUrl: safeResourceUrl(row.Image_URL),
		videoEmbed: facebookReelEmbed(row.Video_URL),
		lien: row.Lien ? safeHref(row.Lien) : null,
		abonnement: row.abonnement === true,
		epingle: row.Epingle === true
	};
}

export function presentMobilisationList(rows: MobilisationRow[]): MobilisationArticle[] {
	return sortMobilisation(
		rows.flatMap((row) => {
			const article = presentMobilisation(row);
			return article ? [article] : [];
		})
	);
}
