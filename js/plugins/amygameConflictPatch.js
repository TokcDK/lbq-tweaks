//=============================================================================
// amyGameConflictPatch.js
//=============================================================================
/*:
 * @plugindesc Restores behaviour that later plugins drop when they replace a
 * core method without aliasing the previous version. Must be the LAST plugin.
 * @author amyGame
 *
 * @help
 * ============================================================================
 * What this fixes
 * ============================================================================
 * 1. Scene_Status.create
 *    YEP_X_CoreUpdatesOpt rebuilds the status window without the 'ok' handler
 *    amyGame0 installs (nextPageOpenok -> battle_xsarStatas1), so the battle
 *    status page could not be opened.
 * 2. Sprite_Actor.refreshMotion
 *    YEP_BattleEngineCore replaces the method, dropping amyGame0's guard that
 *    keeps a custom frame count (setMaxFrame) from being overwritten.
 * 3. Scene_Base.createWindowLayer
 *    AddFavouriteEquipsToEquipScene replaces the method, dropping
 *    YEP_X_ActSeqPack2's BattleManager.setWindowLayer call.
 * 4. Graphics.render
 *    YEP_X_CoreUpdatesOpt replaces the method, dropping the negative
 *    _skipCount clamp that GraphicsRenderFix and FSDK_EngineTuner install.
 *    Without it a backwards Date.now() jump sets _skipCount below zero and the
 *    "if (_skipCount === 0)" test never renders again - a permanent freeze.
 * ============================================================================
 */

(function() {
    // 1. amyGame0: status screen 'ok' handler
    var _Scene_Status_create = Scene_Status.prototype.create;
    Scene_Status.prototype.create = function() {
        _Scene_Status_create.call(this);
        if (this._statusWindow && typeof this.nextPageOpenok === 'function') {
            this._statusWindow.setHandler('ok', this.nextPageOpenok.bind(this));
        }
    };

    // 2. amyGame0: keep the custom frame count of a battler sprite
    var _Sprite_Actor_refreshMotion = Sprite_Actor.prototype.refreshMotion;
    Sprite_Actor.prototype.refreshMotion = function() {
        if (this._actor && this._maxPattern && this._pattern === this._maxPattern) return;
        _Sprite_Actor_refreshMotion.call(this);
    };

    // 3. YEP_X_ActSeqPack2: battle hud / window layer action sequences
    var _Scene_Base_createWindowLayer = Scene_Base.prototype.createWindowLayer;
    Scene_Base.prototype.createWindowLayer = function() {
        _Scene_Base_createWindowLayer.call(this);
        if (this._windowLayer && BattleManager.setWindowLayer) {
            BattleManager.setWindowLayer(this._windowLayer);
        }
    };

    // 4. GraphicsRenderFix: a negative _skipCount must never freeze rendering
    var _Graphics_render = Graphics.render;
    Graphics.render = function(stage) {
        if (this._skipCount < 0) this._skipCount = 0;
        _Graphics_render.call(this, stage);
    };
})();
