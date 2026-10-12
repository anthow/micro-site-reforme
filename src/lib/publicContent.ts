import { sanitizeRichText } from '$lib/sanitizeRichText';
import { safeResourceUrl } from '$lib/safeUrl';
import type { AvisInitiativeBloc, Homepage, LogoFede, Video } from '$lib/types';

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
