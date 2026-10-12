import { safeHref } from './safeUrl';

const ALLOWED = new Set(['a', 'br', 'em', 'strong', 'sup']);
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

export function sanitizeRichText(input: string): string {
	const withoutBlocks = input
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
		.replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?\s*>/gi, '');

	return withoutBlocks.replace(/<\/?\s*([a-zA-Z][\w:-]*)\b([^>]*)>/g, (full, rawName: string, rawAttrs: string) => {
		const name = rawName.toLowerCase();
		if (!ALLOWED.has(name)) return '';
		if (full.startsWith('</')) return `</${name}>`;
		if (name === 'br') return '<br>';
		if (name !== 'a') return `<${name}>`;

		const href = safeHref(readAttr(rawAttrs, 'href') ?? '');
		if (!href) return '';
		const className = readAttr(rawAttrs, 'class');
		const classAttr = className && CLASS_NAME.test(className) ? ` class="${escapeAttr(className)}"` : '';
		return `<a href="${escapeAttr(href)}"${classAttr}>`;
	});
}
