import { safeHref, safeResourceUrl } from './safeUrl.ts';
import { sanitizeArticleHtml } from './sanitizeRichText.ts';
import type { CispBloc, CispRole, CispSource } from './types.ts';

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export interface CispRow {
	id: number;
	Role: string | null;
	Titre: string | null;
	Texte: string | null;
	Video_URL: string | null;
	Image_URL: string | null;
	Lien: string | null;
	Source: string | null;
}

export function youtubeEmbedUrl(value: string | null | undefined): string | null {
	const href = safeHref(value ?? '');
	if (!href) return null;

	let url: URL;
	try {
		url = new URL(href);
	} catch {
		return null;
	}

	if (url.protocol !== 'https:') return null;
	const host = url.hostname.toLowerCase().replace(/^www\./, '');
	let id = '';

	if (host === 'youtu.be') {
		id = url.pathname.split('/').filter(Boolean)[0] ?? '';
	} else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
		if (url.pathname === '/watch') id = url.searchParams.get('v') ?? '';
		else if (url.pathname.startsWith('/embed/')) id = url.pathname.split('/')[2] ?? '';
	}

	if (!YOUTUBE_ID.test(id)) return null;
	return `https://www.youtube.com/embed/${id}`;
}

function roleOf(value: string | null): CispRole | null {
	if (value === 'intro' || value === 'tiroir' || value === 'outil') return value;
	return null;
}

function sourceOf(value: string | null): CispSource | null {
	if (value === 'IF' || value === 'CAIPS') return value;
	return null;
}

export function presentCisp(rows: CispRow[]): CispBloc[] {
	return rows.flatMap((row) => {
		const role = roleOf(row.Role);
		const titre = row.Titre?.trim() ?? '';
		if (!role || !titre) return [];

		const brut = row.Texte?.replace(/\r\n/g, '\n').trim() || null;
		const texte = brut ? sanitizeArticleHtml(brut).trim() || null : null;
		const videoUrl = role === 'tiroir' ? null : youtubeEmbedUrl(row.Video_URL);
		const imageUrl = safeResourceUrl(row.Image_URL);
		const lien = safeHref(row.Lien ?? '');

		if (!texte && !videoUrl && !imageUrl && !lien) return [];

		return [
			{
				id: Number(row.id),
				role,
				titre,
				texte,
				videoUrl,
				imageUrl,
				lien,
				source: sourceOf(row.Source)
			}
		];
	});
}
