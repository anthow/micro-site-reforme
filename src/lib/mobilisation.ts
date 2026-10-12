import { safeResourceUrl } from './safeUrl.ts';
import type { MobilisationArticle } from './types';

const REEL_WIDTH = '267';

export interface MobilisationRow {
	id: number | string;
	created_at: string;
	titre: string | null;
	resume: string | null;
	texte?: string | null;
	image_url: string | null;
	video_url: string | null;
	epingle: boolean | null;
	publie: boolean | null;
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

	return {
		id,
		created_at: row.created_at,
		titre,
		resume: row.resume?.trim() || null,
		texte: row.texte?.trim() || null,
		imageUrl: safeResourceUrl(row.image_url),
		videoEmbed: facebookReelEmbed(row.video_url),
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
