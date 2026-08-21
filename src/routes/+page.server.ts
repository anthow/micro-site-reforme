import { filterPlayableFacebookVideos } from '$lib/facebookVideo';
import { supabase } from '$lib/supabaseClient';
import type { FaqEntry, Homepage, LogoFede, Video } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [homepageResult, faqResult, logosResult, videosResult] = await Promise.all([
		supabase
			.from('Homepage')
			.select('id, Titre, Soustitre, Texte, Image_hero_URL')
			.eq('id', 1)
			.maybeSingle(),
		supabase.from('FAQ').select('id, Question, "Réponse"').order('id', { ascending: true }),
		supabase.from('Logo_fede').select('id, url, "url-website"').order('id', { ascending: true }),
		supabase.from('videos').select('id, url').order('id', { ascending: true })
	]);

	const fetchedVideos = (videosResult.data ?? []) as Video[];
	const playableVideos = videosResult.error
		? fetchedVideos
		: await filterPlayableFacebookVideos(fetchedVideos);
	const videos = moveVideoToPosition(playableVideos, 2, 5);

	return {
		homepage: homepageResult.data as Homepage | null,
		faq: (faqResult.data ?? []) as unknown as FaqEntry[],
		logos: (logosResult.data ?? []) as LogoFede[],
		videos,
		errors: {
			homepage: homepageResult.error?.message ?? null,
			faq: faqResult.error?.message ?? null,
			logos: logosResult.error?.message ?? null,
			videos: videosResult.error?.message ?? null
		}
	};
};

function moveVideoToPosition(videos: Video[], id: number, position: number): Video[] {
	const from = videos.findIndex((video) => video.id === id);
	if (from < 0) return videos;

	const next = [...videos];
	const [item] = next.splice(from, 1);
	next.splice(Math.min(Math.max(position - 1, 0), next.length), 0, item);
	return next;
}
