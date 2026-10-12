import { safeHref } from './safeUrl.ts';

const ALLOWED = new Set(['a', 'br', 'em', 'strong', 'sup']);
const ARTICLE_ALLOWED = new Set([
	'a',
	'article',
	'br',
	'em',
	'h2',
	'h3',
	'li',
	'ol',
	'p',
	'strong',
	'sup',
	'time',
	'ul'
]);
const CLASS_NAME = /^[a-zA-Z0-9 _:-]+$/;

function readAttr(attrs: string, name: string): string | null {
	const match = new RegExp(
		`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
		'i'
	).exec(attrs);
	if (!match) return null;
	return match[1] ?? match[2] ?? match[3] ?? null;
}

function escapeAttr(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function stripDangerousBlocks(input: string): string {
	return input
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
		.replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?\s*>/gi, '');
}

function rewriteTags(
	input: string,
	allowed: Set<string>,
	openTag: (name: string, attrs: string) => string
): string {
	return stripDangerousBlocks(input).replace(
		/<\/?\s*([a-zA-Z][\w:-]*)\b([^>]*)>/g,
		(full, rawName: string, rawAttrs: string) => {
			const name = rawName.toLowerCase();
			if (!allowed.has(name)) return '';
			if (full.startsWith('</')) return `</${name}>`;
			return openTag(name, rawAttrs);
		}
	);
}

export function sanitizeRichText(input: string): string {
	return rewriteTags(input, ALLOWED, (name, rawAttrs) => {
		if (name === 'br') return '<br>';
		if (name !== 'a') return `<${name}>`;

		const href = safeHref(readAttr(rawAttrs, 'href') ?? '');
		if (!href) return '';
		const className = readAttr(rawAttrs, 'class');
		const classAttr =
			className && CLASS_NAME.test(className) ? ` class="${escapeAttr(className)}"` : '';
		return `<a href="${escapeAttr(href)}"${classAttr}>`;
	});
}

export function sanitizeArticleHtml(input: string): string {
	return rewriteTags(input, ARTICLE_ALLOWED, (name, rawAttrs) => {
		if (name === 'br') return '<br>';
		if (name === 'time') {
			const datetime = readAttr(rawAttrs, 'datetime');
			if (datetime && /^\d{4}-\d{2}-\d{2}$/.test(datetime)) {
				return `<time datetime="${datetime}">`;
			}
			return '<time>';
		}
		if (name !== 'a') return `<${name}>`;

		const href = safeHref(readAttr(rawAttrs, 'href') ?? '');
		if (!href) return '';
		return `<a href="${escapeAttr(href)}" rel="noopener noreferrer">`;
	});
}
