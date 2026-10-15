import { safeResourceUrl } from './safeUrl.ts';
import type { Video } from './types.ts';

const REEL_WIDTH = '267';
const REEL_HEIGHT = '476';
const DIRECT_VIDEO_EXT = /\.(mp4|webm|ogg|ogv|m4v)(?:[?#]|$)/i;

export function facebookPluginSrc(postUrl: string | null | undefined): string | null {
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

	return `https://www.facebook.com/plugins/video.php?height=${REEL_HEIGHT}&href=${encodeURIComponent(safe)}&show_text=false&width=${REEL_WIDTH}&t=0`;
}

/** Fichier média hébergé (mp4/webm/…) hors embed Facebook. */
export function isDirectVideoUrl(url: string | null | undefined): boolean {
	const safe = safeResourceUrl(url);
	if (!safe || facebookPluginSrc(safe)) return false;
	if (safe.startsWith('/')) return DIRECT_VIDEO_EXT.test(safe);

	try {
		const parsed = new URL(safe);
		if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
		if (DIRECT_VIDEO_EXT.test(parsed.pathname)) return true;
		// Médias WordPress sans extension dans le chemin (ex. /uploads/…/reforme).
		return /\/uploads\//i.test(parsed.pathname);
	} catch {
		return false;
	}
}

const PLAYABLE_MARKERS = ['hd_src', 'sd_src', 'dash_manifest'] as const;
const CHECK_TIMEOUT_MS = 4000;
const CACHE_TTL_MS = 30 * 60 * 1000;

const playableCache = new Map<string, { playable: boolean; expiresAt: number }>();

export async function filterPlayableFacebookVideos(videos: Video[]): Promise<Video[]> {
	const withUrl = videos.filter((video): video is Video & { url: string } => Boolean(video.url));
	if (withUrl.length === 0) return [];

	const results = await Promise.all(
		withUrl.map(async (video) => ({
			video,
			playable: isDirectVideoUrl(video.url) ? true : await isFacebookVideoPlayable(video.url)
		}))
	);

	const playable = results.filter((result) => result.playable).map((result) => result.video);
	return playable.length === 0 ? withUrl : playable;
}

async function isFacebookVideoPlayable(postUrl: string): Promise<boolean> {
	const cached = playableCache.get(postUrl);
	if (cached && cached.expiresAt > Date.now()) return cached.playable;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

	try {
		const src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(postUrl)}&show_text=false&width=267`;
		const response = await fetch(src, {
			signal: controller.signal,
			headers: {
				Accept: 'text/html',
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
			}
		});

		if (!response.ok) return false;

		const html = await response.text();
		const playable = PLAYABLE_MARKERS.some((marker) => html.includes(marker));
		playableCache.set(postUrl, { playable, expiresAt: Date.now() + CACHE_TTL_MS });
		return playable;
	} catch {
		return true;
	} finally {
		clearTimeout(timeout);
	}
}
