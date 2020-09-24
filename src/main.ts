import '../res/main.scss'

import { stage, render_process } from './engine'
import { Sprite } from '@pixi/sprite'

// @ts-ignore
import logo from '../res/assets/logo.png'
import { cssVar } from './utils'

const sprite = Sprite.from(logo)
sprite.anchor.set(0.5)

stage.addChild(sprite)
render_process.add(delta => {
    sprite.x = 0
    sprite.y = 0
    sprite.rotation += 0.02 * delta
})
