// TODO: google-closure-compiler compilation_level: 'ADVANCED'
// import { install } from '@pixi/unsafe-eval'
// import * as PIXI from '@pixi/core'
// install(PIXI)

import './main.scss'
import { Application } from '@pixi/app'
import { Renderer } from '@pixi/core'

import { BatchRenderer } from '@pixi/core'
Renderer.registerPlugin('batch', BatchRenderer)

import { TickerPlugin } from '@pixi/ticker'
Application.registerPlugin(TickerPlugin)

import { AppLoaderPlugin } from '@pixi/loaders'
Application.registerPlugin(AppLoaderPlugin)

import { Sprite } from '@pixi/sprite'

const app = new Application({
    antialias: true,
    resolution: window.devicePixelRatio
}) as any
document.body.appendChild(app.view)

// Listen for window resize events
const resize = () => {
    app.renderer.resize(window.innerWidth / 2, window.innerHeight / 2)
    if (window.innerWidth > window.innerHeight)
        app.stage.scale.set(window.innerWidth / screen.availWidth)
    else if (window.innerWidth < window.innerHeight)
        app.stage.scale.set(window.innerHeight / screen.availHeight)
}
window.addEventListener('resize', resize)
resize()

app.loader.add('logo', './assets/logo.png')
app.loader.load(() => {
    const sprite = Sprite.from('logo')
    sprite.anchor.set(0.5)
    app.stage.addChild(sprite)

    sprite.x = app.screen.width * 0.5
    sprite.y = app.screen.height * 0.5

    app.ticker.add(delta => {
        sprite.rotation += 0.02 * delta
    })
})
