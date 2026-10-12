import type { OrganizationProfile } from './identity';

export type JsonLdNode = Record<string, unknown>;

export type FaqPair = {
	question: string | null;
	answer: string | null;
};

export type VideoObjectInput = {
	name: string;
	description: string;
	thumbnailUrl: string;
	uploadDate: string;
	embedUrl: string;
};

function plain(value: string): string {
	return value
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function faqPageJsonLd(entries: FaqPair[]): JsonLdNode | null {
	const mainEntity = entries.flatMap((entry) => {
		const question = plain(entry.question ?? '');
		const answer = plain(entry.answer ?? '');
		if (!question || !answer) return [];
		return [
			{
				'@type': 'Question',
				name: question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: answer
				}
			}
		];
	});

	if (mainEntity.length === 0) return null;
	return {
		'@type': 'FAQPage',
		mainEntity
	};
}

export function websiteJsonLd(input: {
	name: string;
	url: string;
	description?: string;
}): JsonLdNode | null {
	const name = input.name.trim();
	const url = input.url.trim();
	if (!name || !url) return null;
	return {
		'@type': 'WebSite',
		name,
		url,
		inLanguage: 'fr',
		...(input.description?.trim() ? { description: input.description.trim() } : {})
	};
}

export function organizationJsonLd(
	profile: OrganizationProfile | null,
	siteUrl: string
): JsonLdNode | null {
	if (!profile || !siteUrl) return null;
	const name = profile.name.trim();
	if (!name) return null;
	const logo = profile.logoPath ? new URL(profile.logoPath, `${siteUrl}/`).href : undefined;
	return {
		'@type': 'Organization',
		name,
		url: siteUrl,
		...(profile.legalName ? { legalName: profile.legalName } : {}),
		...(profile.description ? { description: profile.description } : {}),
		...(logo ? { logo } : {}),
		...(profile.email ? { email: profile.email } : {}),
		...(profile.sameAs && profile.sameAs.length > 0 ? { sameAs: profile.sameAs } : {})
	};
}

export function videoObjectJsonLd(videos: VideoObjectInput[]): JsonLdNode[] {
	return videos.flatMap((video) => {
		if (!video.name || !video.description || !video.thumbnailUrl || !video.uploadDate || !video.embedUrl) {
			return [];
		}
		return [
			{
				'@type': 'VideoObject',
				name: video.name,
				description: video.description,
				thumbnailUrl: video.thumbnailUrl,
				uploadDate: video.uploadDate,
				embedUrl: video.embedUrl
			}
		];
	});
}

export function jsonLdGraph(nodes: Array<JsonLdNode | null>): JsonLdNode | null {
	const graph = nodes.filter((node): node is JsonLdNode => node != null);
	if (graph.length === 0) return null;
	return {
		'@context': 'https://schema.org',
		'@graph': graph
	};
}
