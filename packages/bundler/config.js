// js transpiler
import autoinstall from '@rollup/plugin-auto-install'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

// loader
import yaml from '@rollup/plugin-yaml'
import json from '@rollup/plugin-json'

// js transformer
import sucrase from '@rollup/plugin-sucrase'
import strip from '@rollup/plugin-strip'
import buble from '@rollup/plugin-buble'
import gcc from '@ampproject/rollup-plugin-closure-compiler'

// meta
import indexHtml from '@rollup/plugin-html'
import { minify as minifiedHtml } from './html-template.js'
import styles from 'rollup-plugin-styles'
import appManifest from 'rollup-plugin-manifest-json'

// QoL
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import sizes from 'rollup-plugin-size-snapshot'
const { sizeSnapshot } = sizes

import path from 'path'
const { basename, extname } = path
import workaround from './workaround.cjs'
const { loadPkg } = workaround

export default function ({
	input = 'src/main.ts',
	packageJson = './package.json',
	manifest = './manifest.json'
} = {}) {
	const
		INPUT_NAME = basename(input, extname(input)),
		production = !process.env.ROLLUP_WATCH,
		pkg = loadPkg(packageJson),
		app = loadPkg(manifest)

	// BUG(typescript): error on using ??=
	app.description ?? (app.description = pkg.description)
	app.short_name ?? (app.short_name = pkg.name)
	app.categories ?? (app.categories = ['games'])
	app.display ?? (app.display = 'fullscreen')

	return {
		input,
		output: {
			sourcemap: production,
			format: production ? 'iife' : 'es',
			freeze: false,
			esModule: false,
			dir: 'dist',
			assetFileNames: '[name][extname]',
			// https://stackoverflow.com/a/62825401/5221998
			name: app.short_name?.replace('-', '') ?? INPUT_NAME, // TODO: replace() -> camelCase()
		},
		plugins: [
			// autoinstall(),
			resolve({
				browser: true,
				preferBuiltins: true,
				dedupe: [],
			}),
			commonjs(),

			yaml(),
			json({
				compact: production,
				preferConst: true,
			}),

			styles({
				mode: 'extract',
				autoModules: true,
				sass: { outputStyle: production ? 'compressed' : 'expanded' },
				less: { compress: production },
			}),

			...(!production ?
				[ // development
					// sucrase({ // doesn't work
					// 	exclude: ['node_modules/**', 'packages/*/**'],
					// 	transforms: ['typescript'],
					// 	enableLegacyTypeScriptModuleInterop: true,
					// 	enableLegacyBabel5ModuleInterop: true,
					// }),
					typescript(), // TODO: try esbuild
					serve('dist'),
					livereload('dist'),
				] :
				[ // production
					typescript(),
					strip(),
					buble(),
					gcc({
						compilation_level: 'SIMPLE',
					}),
				]),

			// html
			appManifest({
				input: manifest,
				minify: true,
				manifest: {
					...app,
					start_url: app.start_url ?? '/index.html',
					scope: '/',
				},
			}),
			indexHtml({
				title: app.name,
				attributes: {
					html: app.lang ? { lang: app.lang } : {},
				},
				meta: [
					...(app.short_name ? [{ name: 'application-name', content: app.short_name }] : []),
					...(pkg.author ? [{ name: 'author', content: pkg.author }] : []),
					...(app.description ? [{ name: 'description', content: app.description }] : []),
					...(pkg.keywords ? [{ name: 'keywords', content: pkg.keywords }] : []),
					{ // https://www.smashingmagazine.com/2012/10/design-your-own-mobile-game
						name: 'viewport',
						content: 'width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1, user-scalable=0'
					},
					{ name: 'theme-color', content: 'transparent' }, // transparent statusbar
					{ name: 'color-scheme', content: 'normal' }, // no dark mode
					{ name: 'mobile-web-app-capable', content: 'yes' },

					// Open Graph (https://ogp.me)
					...(app.name ? [{ property: 'og:title', content: app.name }] : []),
					...(app.description ? [{ property: 'og:description', content: app.description }] : []),
					{ property: 'og:type', content: 'website' },
					{ property: 'og:determiner', content: 'auto' },
					... (app.lang ? [{ property: 'og:locale', content: app.lang }] : []),
					...(app.start_url ? [
						{ property: 'og:url', content: app.start_url },
						// TODO: combine (or just verify) manifest.screenshot with og:image using url.resolve()
						// https://ogp.me/#structured
					] : [])
				],
				template: minifiedHtml({
					collapseWhitespace: true,
					useShortDoctype: true,
					removeComments: true,
					removeAttributeQuotes: true,
					removeRedundantAttributes: true,
					removeEmptyAttributes: true,
					removeTagWhitespace: true,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true,
					minifyCss: true,
					minifyJs: true,
					sortAttributes: true,
					sortClassName: true,
					// somehow 👇 will remove <html> and </html> as long as it doesn't has attributes
					removeOptionalTags: true,
				}, { manifest }),
			}),

			// report
			production && sizeSnapshot(),
		],
	}
}
