import presetWebFonts from '@unocss/preset-web-fonts';
import { defineConfig, presetUno } from 'unocss';

export default defineConfig({
	theme: {
		colors: {
			blurple: '#5865F2',
		},
		fontFamily: {
			sans: ['Inter var', 'sans-serif'],
			mono: ['JetBrains Mono', 'monospace'],
		},
	},
	presets: [
		presetUno({
			dark: 'media',
		}),
		presetWebFonts({
			provider: 'google',
			fonts: {
				sans: 'JetBrains Mono',
			},
		}),
	],
});
