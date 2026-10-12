import { safeHref, safeResourceUrl } from './safeUrl.ts';
import { sanitizeArticleHtml } from './sanitizeRichText.ts';
import type { MobilisationArticle } from './types';

const REEL_WIDTH = '267';
const SLUG_MAX = 80;

export interface MobilisationRow {
	id: number | string;
	created_at: string;
	titre: string | null;
	resume: string | null;
	texte?: string | null;
	image_url: string | null;
	video_url: string | null;
	lien?: string | null;
	abonnement?: boolean | null;
	epingle: boolean | null;
	publie: boolean | null;
	Date?: string | null;
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
	if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

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

export function sortMobilisation<T extends { epingle: boolean; created_at: string }>(
	articles: T[]
): T[] {
	return [...articles].sort((a, b) => {
		if (a.epingle !== b.epingle) return a.epingle ? -1 : 1;
		return timestamp(b.created_at) - timestamp(a.created_at);
	});
}

export function facebookReelEmbed(postUrl: string | null | undefined): string | null {
	const safe = safeResourceUrl(postUrl);
	if (!safe) return null;

	let host = '';
	try {
		host = new URL(safe).hostname;
	} catch {
		return null;
	}

	const facebook =
		host === 'facebook.com' ||
		host.endsWith('.facebook.com') ||
		host === 'fb.watch' ||
		host.endsWith('.fb.watch');
	if (!facebook) return null;

	const params = new URLSearchParams({
		href: safe,
		show_text: 'false',
		width: REEL_WIDTH
	});
	return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}

export function presentMobilisation(row: MobilisationRow): MobilisationArticle | null {
	const titre = row.titre?.trim() ?? '';
	const id = typeof row.id === 'string' ? Number(row.id) : row.id;
	if (!row.publie || !titre || !Number.isInteger(id) || id < 1) return null;

	const rawTexte = row.texte?.trim() || null;
	const texteHtml = rawTexte != null && looksLikeHtml(rawTexte);

	return {
		id,
		created_at: row.created_at,
		titre,
		resume: row.resume?.trim() || null,
		texte: rawTexte == null ? null : texteHtml ? sanitizeArticleHtml(rawTexte) : rawTexte,
		texteHtml,
		publication: formatPublicationDate(row.Date),
		imageUrl: safeResourceUrl(row.image_url),
		videoEmbed: facebookReelEmbed(row.video_url),
		lien: row.lien ? safeHref(row.lien) : null,
		abonnement: row.abonnement === true,
		epingle: row.epingle === true
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
