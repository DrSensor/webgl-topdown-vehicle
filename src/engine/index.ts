// non tree-shakeable module, only useful for prototyping
// import { UPDATE_PRIORITY, Renderer, Ticker, Container } from 'pixi.js'

// tree-shakeable module, https://pixijs.io/customize
import { Ticker } from '@pixi/ticker'
import { Container } from '@pixi/display'
import { Renderer, BatchRenderer } from '@pixi/core'

// TODO: -Oz, google-closure-compiler{compilation_level: 'ADVANCED'}
// import { install } from '@pixi/unsafe-eval'
// import * as PIXI from '@pixi/core'
// install(PIXI)
// const { Renderer, BatchRenderer } = PIXI

import { UPDATE_PRIORITY } from './constant'

// Don't register any built-ins plugins if using 'pixi.js' module
Renderer.registerPlugin('batch', BatchRenderer)

export const
    renderer = new Renderer({
        antialias: true,
        transparent: true,
        resolution: window.devicePixelRatio,
        view: document.querySelector('canvas'),
    }),
    render_process = new Ticker(),
    physics_process = new Ticker(),
    stage = new Container()

render_process.maxFPS = 48
render_process.add(() => { renderer.render(stage) }, UPDATE_PRIORITY.LOW)
render_process.start()

physics_process.maxFPS = 60
physics_process.add(() => { }, UPDATE_PRIORITY.LOW)
physics_process.start()

window.addEventListener('resize', resize)
resize()

function resize() {
    const width = screen.width, height = screen.height
        , ratio = Math.min(window.innerWidth / width, window.innerHeight / height)

    renderer.resize(window.innerWidth / 2, window.innerHeight / 2)
    stage.scale.set(ratio)

    // disable this to make (0,0) as center
    // stage.pivot.set(width / 2, height / 2)

    stage.position.set(renderer.width / 2, renderer.height / 2)
    // landscape,potrait relative
    // if (innerWidth > innerHeight) {
    //     // stage.scale.set(innerWidth / screen.availWidth)
    //     stage.position.set(innerWidth / screen.availWidth)
    // } else if (innerWidth < innerHeight) {
    //     // stage.scale.set(innerHeight / screen.availHeight)
    //     stage.position.set(innerHeight / screen.availHeight)
    // }

    // other approach https://github.com/pixijs/pixi.js/issues/4757#issuecomment-410343139
}
