// TODO: submit issue for nollup to suppor .mjs
// https://rollupjs.org/guide/en/#using-untranspiled-config-files

import { config } from 'bundler'

export default {
    ...config({
        input: 'src/main.ts',
        hash: false,
        body: '<canvas/>',
    }),
}
