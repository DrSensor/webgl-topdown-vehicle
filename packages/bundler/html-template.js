import indexHtml from '@rollup/plugin-html'
const { makeHtmlAttributes } = indexHtml
import terser from 'html-minifier-terser'
const { minify: htmlMinify } = terser
import path from 'path'
const { basename } = path

export const
  template = ({ manifest } = {}, postprocess) => args => _template({ ...args, manifest }, postprocess ?? (html => html)),
  minify = (opts, args) => template(args, html => htmlMinify(html, opts))

function _template({ attributes, files, meta, publicPath, title, manifest: appManifest }, postprocess) {
  const scripts = (files.js ?? [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.script);
      return `<script src="${publicPath}${fileName}"${attrs}></script>`;
    })
    .join('\n');

  const links = (files.css ?? [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.link);
      return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
    })
    .join('\n');

  const metas = meta
    .map((input) => {
      const attrs = makeHtmlAttributes(input);
      return `<meta${attrs}>`;
    })
    .join('\n');

  const manifest = appManifest ? `<link rel="manifest" href="/${basename(appManifest)}">` : ''

  return postprocess(`
      <!doctype html>
      <html${makeHtmlAttributes(attributes.html)}>
        <head>
          ${metas}
          <title>${title}</title>
          ${manifest}
          ${links}
        </head>
        <body>
          ${scripts}
        </body>
      </html>`)
}
