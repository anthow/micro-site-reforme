export type SitemapEntry = {
	loc: string;
	lastmod?: string;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function decideIndexable(input: {
	dev: boolean;
	flag: string | undefined;
	context: string | undefined;
	siteUrl: string;
}): boolean {
	if (input.dev) return false;
	if (input.flag !== 'true') return false;
	if (!input.siteUrl) return false;
	const context = input.context?.trim().toLowerCase() ?? '';
	if (context && context !== 'production') return false;
	return true;
}

export function robotsTxt(indexable: boolean, siteUrl: string): string {
	if (!indexable) return 'User-agent: *\nDisallow: /\n';

	const lines = ['User-agent: *', 'Allow: /', 'Disallow: /contactez-votre-depute'];
	if (siteUrl) lines.push('', `Sitemap: ${siteUrl}/sitemap.xml`);
	return `${lines.join('\n')}\n`;
}

export function publicSitemapEntries(avisPublicationDate: string | null): SitemapEntry[] {
	const avisDate = avisPublicationDate && DATE.test(avisPublicationDate) ? avisPublicationDate : undefined;
	return [
		{ loc: '/' },
		{ loc: '/avis-initiative', lastmod: avisDate },
		{ loc: '/avis-initiative-2026-10-07.pdf', lastmod: '2026-10-07' }
	];
}

export function absoluteUrl(siteUrl: string, pathname: string): string {
	const base = siteUrl.replace(/\/+$/, '');
	if (!base) return '';
	if (pathname === '/') return `${base}/`;
	return `${base}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

export function buildSitemapXml(siteUrl: string, entries: SitemapEntry[]): string {
	const urls = entries
		.map((entry) => {
			const loc = escapeXml(absoluteUrl(siteUrl, entry.loc));
			const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
			return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
