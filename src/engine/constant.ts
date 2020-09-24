/**
* Represents the update priorities used by internal PIXI classes when registered with
* the _PIXI.Ticker_ object. Higher priority items are updated first and lower
* priority items, such as render, should go later.
*/
export const enum UPDATE_PRIORITY {
    /** Highest priority, used for _PIXI.InteractionManager_ */
    INTERACTION = 50,
    /** High priority updating, used for _PIXI.VideoBaseTexture_ and _PIXI.AnimatedSprite_ */
    HIGH = 25,
    /** Default priority for ticker events, see _PIXI.Ticker.add()_ */
    NORMAL = 0,
    /** Low priority used for _PIXI.Application_ rendering */
    LOW = -25,
    /** Lowest priority used for _PIXI.BasePrepare_ utility */
    UTILITY = -50
}
