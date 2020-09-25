// js transpiler
import autoinstall from '@rollup/plugin-auto-install'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

// loader
import yaml from '@rollup/plugin-yaml'
import json from '@rollup/plugin-json'
import url from '@rollup/plugin-url'

// js transformer
import sucrase from '@rollup/plugin-sucrase'
import strip from '@rollup/plugin-strip'
import buble from '@rollup/plugin-buble'
import gcc from '@ampproject/rollup-plugin-closure-compiler'
import { terser } from 'rollup-plugin-terser'
import uglify3 from 'rollup-plugin-uglify'
const { uglify } = uglify3

// meta
import indexHtml from '@rollup/plugin-html'
import * as html from './html-template.js'
import styles from 'rollup-plugin-styles'
import hotcss from 'rollup-plugin-hot-css'
import appManifest from 'rollup-plugin-manifest-json'

// QoL
import mode from './mode.js'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import sizes from 'rollup-plugin-size-snapshot'
const { sizeSnapshot } = sizes

import path from 'path'
const { basename, extname } = path
import workaround from './workaround.cjs'
const { loadPkg, relativePath } = workaround

export default function ({
	input = 'src/main.ts',
	packageJson = './package.json',
	manifest = './manifest.json',
	assets = { publicPath: 'assets' },
	hash = true,
	flags = new Set(['-Os'])
} = {}) {
	const
		INPUT_NAME = basename(input, extname(input)),
		pkg = loadPkg(packageJson),
		app = loadPkg(manifest),
		dist = `dist/${mode.production ?
			'production' : 'development'}`

	// BUG(rollup): error on using ??=
	app.description ?? (app.description = pkg.description)
	app.short_name ?? (app.short_name = pkg.name)
	app.categories ?? (app.categories = ['games'])
	app.display ?? (app.display = 'fullscreen')

	return {
		input,
		output: {
			dir: dist,
			//format: mode.production ? 'iife' : 'es',
			format: 'es',
			sourcemap: !mode.production,
			freeze: false,
			esModule: false,
			externalLiveBindings: false,
			preferConst: true,
			// https://stackoverflow.com/a/62825401/5221998
			name: app.short_name?.replace('-', '') ?? INPUT_NAME, // TODO: replace() -> camelCase()
			...(mode.production ?
				{ // production
					...(hash && { entryFileNames: '[name]-[hash].js' })
				} : {// non-production
					...{ // just to suppress warning
						treeshake: true,
						preserveSymlinks: true,
					},
					preserveModules: true,
				}),
			preserveModulesRoot: 'src',
			assetFileNames: mode.production && hash ?
				'[name]-[hash][extname]' : '[name][extname]',
		},
		// TODO: find a way to skip node_modules or something like snowpack
		// external: !mode.production && Object.keys(pkg.dependencies),
		plugins: [
			// autoinstall(),
			resolve({
				browser: true,
				preferBuiltins: mode.production,
			}),
			commonjs({
				esmExternals: !mode.production,
				requireReturnsDefault: !mode.production
			}),

			yaml(),
			json({
				compact: mode.production,
				preferConst: true,
			}),

			styles({
				mode: 'extract',
				autoModules: true,
				config: mode.production,
				minimize: mode.production,
				sourceMap: !mode.production,
				url: {
					hash: mode.production && hash,
					// FIXME: cause runtime-error in mode.production
					publicPath: assets.publicPath,
				},
				sass: {
					outputStyle: mode.production ?
						'compressed' : 'expanded',
				},
				less: { compress: mode.production },
			}),
			mode.development && hotcss({
				hot: true,
				url: false,
			}),

			url({
				limit: 3141, // 3kb
				// TODO: make [name] same as styles.url resolver (rollup/plugins#573)
				// make PR for https://github.com/rollup/plugins/issues/573
				// hint: take a look on how rollup-plugin-styles use the assetFileNames hash
				fileName: `[dirname][name]${mode.production && hash ? '-[hash]' : ''}[extname]`,
			}),

			!mode.production && sucrase({
				transforms: ['typescript'],
			}),
			...(mode.preview ? [
				serve(dist),
				livereload(dist),
			] : []),
			...(mode.production ? [
				typescript(),
				strip(),
				flags.has('-Oz') && gcc({
  					compilation_level: 'ADVANCED',
  					module_resolution: 'BROWSER',
  					isolation_mode: 'IIFE',
				}),
				...(flags.has('-Os') ? [
					buble(),
					terser({ toplevel: true }),
					uglify({ sourcemap: false, toplevel: true }),
				] : []),
			] : []),

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
					{ charset: 'utf-8' },
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
				template: mode.production ?
					html.minify({
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
					}, { manifest }) :
					html.template({ manifest }),
			}),

			// report
			mode.production && !hash && sizeSnapshot(),
		],
	}
}
