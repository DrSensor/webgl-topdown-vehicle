export default {
    production:
        !process.env.ROLLUP_WATCH && !process.env.NOLLUP,

    preview:
        process.env.ROLLUP_WATCH,

    development:
        process.env.NOLLUP,
}

// process.env.BUILD ?? (process.env.BUILD = process.env.NODE_ENV)
// export default {
//     production:
//         !process.env.ROLLUP_WATCH &&
//         !process.env.NOLLUP && (
//             process.env.BUILD === 'production' ||
//             process.env.BUILD === 'release'),

//     development:
//         process.env.BUILD === 'development' ||
//         process.env.BUILD === 'hotreload' ||
//         process.env.BUILD === 'hot' ||
//         process.env.BUILD === 'debug' ||
//         process.env.NOLLUP,

//     preview:
//         process.env.BUILD === 'preview' ||
//         process.env.BUILD === 'livereload' ||
//         process.env.BUILD === 'live' ||
//         process.env.ROLLUP_WATCH,
// }
