/*:
 * @plugindesc Compiles the PIXI filters this game uses during boot instead of
 * on the first menu open / first tinted sprite.
 * @author Senior MV Expert
 *
 * @help
 * A PIXI.Filter compiles its GLSL program the first time it is rendered, and
 * that compilation is synchronous on the main thread — the 300ms-1100ms stall
 * that shows up inside the requestAnimationFrame handler when a filter is
 * applied mid-gameplay.
 *
 * The filters actually applied at runtime in this project:
 *  - BlurFilter: Irina_PerformanceUpgrade builds one in
 *    Scene_MenuBase.createBackground, so the first menu open pays the compile.
 *  - ColorMatrixFilter: MV colour tones (Sprite.setColorTone) plus Irina's
 *    EnemyHue / AnimationHue.
 *  - VoidFilter: YEP_X_CoreUpdatesOpt.
 * FilterController bundles 25 more pixi-filters, but nothing in data/ or in the
 * amyGame scripts issues a FilterController command, so warming those up would
 * only make boot slower. GradientWipeFilter is likewise unused.
 *
 * Rendering a 32x32 sprite with each filter into a throw-away RenderTexture at
 * Scene_Boot.start forces the compile before the player can see anything. The
 * next Graphics.render rebinds the root render target, so leaving the renderer
 * pointed at our texture is harmless.
 */
(function() {
    "use strict";

    var WARMUP = [
        ['BlurFilter', function() { return new PIXI.filters.BlurFilter(0.5); }],
        ['ColorMatrixFilter', function() { return new PIXI.filters.ColorMatrixFilter(); }],
        ['VoidFilter', function() { return new PIXI.filters.VoidFilter(); }]
    ];

    function prewarmFilters() {
        if (!Graphics.isWebGL() || !Graphics._renderer) {
            return;
        }
        var texture = PIXI.RenderTexture.create(32, 32);
        var sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        for (var i = 0; i < WARMUP.length; i++) {
            if (!PIXI.filters[WARMUP[i][0]]) {
                continue;
            }
            try {
                var filter = WARMUP[i][1]();
                sprite.filters = [filter];
                Graphics._renderer.render(sprite, texture);
                sprite.filters = null;
                filter.destroy();
            } catch (e) {
                // A filter that cannot be warmed up must never break the boot.
            }
        }
        texture.destroy(true);
    }

    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.apply(this, arguments);
        prewarmFilters();
    };
})();
