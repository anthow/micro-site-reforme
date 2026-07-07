/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				page: {
					light: '#FFFFFF',
					dark: '#0B0B0B'
				},
				ink: {
					light: '#111111',
					dark: '#F5F5F5'
				},
				accent: '#FF6A00'
			},
			fontFamily: {
				heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
				sans: ['"Space Grotesk"', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: []
};
