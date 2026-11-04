//=============================================================================
// amyGamePerfBridge.js
//=============================================================================
/*:
 * @plugindesc Re-applies the core optimizations of KODERA_optimization,
 * SA_CoreSpeedImprovement, FSDK_EngineTuner and Irina_PerformanceUpgrade that
 * YEP_X_CoreUpdatesOpt discards when it replaces the same core methods.
 * @author amyGame
 *
 * @help
 * ============================================================================
 * Load order
 * ============================================================================
 * Must sit directly ABOVE YEP_CoreEngine (i.e. below every optimization
 * plugin and below every plugin that customizes the listed methods).
 *
 * YEP_X_CoreUpdatesOpt replaces ~120 rpg_*.js methods with its own copies and
 * never calls the previous version, so every optimization installed above it
 * is thrown away. Capturing the functions here and restoring them once all
 * plugins have run keeps the optimized bodies while leaving everything that
 * is layered on top of YEP_X_CoreUpdatesOpt untouched.
 *
 * The restore runs from Scene_Boot.start, so every plugin below this one must
 * alias that method (all of them do today) for the restore to happen.
 * ============================================================================
 */

(function() {
    // Methods an optimization plugin implements and YEP_X_CoreUpdatesOpt later
    // overwrites. Only methods nothing is stacked on top of are listed: a
    // method whose final owner is another plugin must keep that plugin's body.
    // A method is also skipped when it reads a field that only the optimization
    // plugin's own initializer sets (e.g. Tilemap._tileWidthHalf comes from
    // FSDK's Tilemap.initialize, which MPP_MapLight/DP_MapZoom have replaced).
    var TARGETS = [
        'Tilemap.prototype.update',
        'TilingSprite.prototype.update',
        'Window.prototype.update',
        'WindowLayer.prototype.update',
        'Weather.prototype._updateAllSprites',
        'Scene_Base.prototype.updateChildren',
        'Scene_ItemBase.prototype.applyItem',
        'Sprite_Animation.prototype.updateFrame',
        'Bitmap.prototype._createCanvas',
        'Bitmap.prototype.checkDirty',
        'Bitmap.prototype._requestImage',
        'Sprite.prototype._renderCanvas',
        'Sprite.prototype._renderWebGL',
        'TilingSprite.prototype._refresh',
        'Decrypter.decryptArrayBuffer',
        'Graphics.printLoadingError',
        'Graphics.eraseLoadingError',
        'Graphics.printError',
        'JsonEx._encode',
        'JsonEx._decode',
        'ImageManager.requestNormalBitmap',
        'AudioManager.createBuffer',
        'Game_Interpreter.requestImages',
        'Bitmap.snap'
    ];

    function resolve(path) {
        var parts = path.split('.');
        var owner = window;
        for (var i = 0; i < parts.length - 1; i++) {
            owner = owner[parts[i]];
            if (!owner) return null;
        }
        return { owner: owner, key: parts[parts.length - 1] };
    }

    var saved = [];
    TARGETS.forEach(function(path) {
        var target = resolve(path);
        if (!target || typeof target.owner[target.key] !== 'function') return;
        saved.push({ owner: target.owner, key: target.key, fn: target.owner[target.key] });
    });

    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        // Every plugin script has run by now; put the optimized bodies back on
        // top of YEP_X_CoreUpdatesOpt's copies.
        saved.forEach(function(entry) {
            entry.owner[entry.key] = entry.fn;
        });
        saved = [];
        if (typeof _Scene_Boot_start === 'function') _Scene_Boot_start.call(this);
    };
})();
