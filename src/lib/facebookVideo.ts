import type { Video } from '$lib/types';

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
			playable: await isFacebookVideoPlayable(video.url)
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
