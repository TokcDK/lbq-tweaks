/*:
 * @plugindesc Frees the GPU texture of dynamically created Bitmaps
 * (`new Bitmap(w, h)`) once the sprite that owns them is discarded.
 * @author Senior MV Expert
 *
 * @help
 * `new Bitmap(w, h)` allocates a canvas and, once it is rendered, a
 * PIXI.BaseTexture. MV never frees that BaseTexture: dropping the last
 * reference to the Bitmap leaves the GL texture in the renderer, so VRAM grows
 * with every text picture, damage popup and map transfer until a GC/GPU stall
 * shows up inside the requestAnimationFrame handler.
 *
 * The usual guard, `if (bitmap && !bitmap._url) bitmap.destroy()`, cannot be
 * used as-is: MV has no Bitmap#destroy at all (MPP_MessageEX adds one, so it
 * only exists while that plugin is enabled) and destroying twice throws.
 * This plugin defines an idempotent Bitmap#destroy plus Bitmap#destroyIfDynamic,
 * which never touches ImageManager bitmaps (they carry `_url` and are shared
 * through ImageManager._imageCache).
 *
 * Freed automatically:
 *  - Window_Base.createContents: allocates a new Bitmap on every call, and
 *    CommonPopupCore calls it once per popup on a full-screen window.
 *  - Sprite_Picture.updateBitmap: DTextPicture / FacePicture / MpiComposePicture
 *    / OriginalTimer rebuild the picture bitmap on every picture name change.
 *  - Scene_Map / Scene_Battle terminate: the spriteset is only detached from the
 *    scene, so its dynamic bitmaps (HzChoiceEvent's full-screen layer, minimap,
 *    darkness layer) stay in VRAM after every map transfer and every menu open.
 *  - Sprite_Battler.updateDamagePopup: BattleEffectPopup builds a Bitmap per
 *    damage popup message.
 *
 * ImageManager._imageCache is deliberately untouched: clearTextureCache() would
 * destroy textures ImageManager still hands out and render black boxes.
 */
(function() {
    "use strict";

    //-----------------------------------------------------------------------
    // Bitmap
    //-----------------------------------------------------------------------

    // MV has no Bitmap#destroy; MPP_MessageEX adds one but only while enabled.
    // This replaces it with an idempotent version that also avoids waking the
    // lazy `_baseTexture` getter (which would upload a texture just to free it).
    Bitmap.prototype.destroy = function() {
        if (this.__disposed) {
            return;
        }
        this.__disposed = true;
        if (this.__baseTexture) {
            this.__baseTexture.destroy();
            this.__baseTexture = null;
        }
        if (this.__canvas) {
            this.__canvas.width = 0;
            this.__canvas.height = 0;
            this.__canvas = null;
        }
    };

    /**
     * Frees the GPU texture of a bitmap built with `new Bitmap(w, h)`.
     * ImageManager bitmaps carry `_url` and are shared through
     * ImageManager._imageCache, so they must be left alone.
     */
    Bitmap.prototype.destroyIfDynamic = function() {
        if (!this._url) {
            this.destroy();
        }
    };

    function disposeDynamicBitmaps(node) {
        if (!node) {
            return;
        }
        if (node.bitmap && node.bitmap.destroyIfDynamic) {
            node.bitmap.destroyIfDynamic();
        }
        var children = node.children;
        if (children) {
            for (var i = 0; i < children.length; i++) {
                disposeDynamicBitmaps(children[i]);
            }
        }
    }

    //-----------------------------------------------------------------------
    // Window_Base
    //-----------------------------------------------------------------------

    // createContents() always allocates a fresh Bitmap and drops the previous
    // one. CommonPopupCore calls it once per popup on a full-screen window, so
    // that alone is ~3 MB of VRAM per popup shown.
    var _Window_Base_createContents = Window_Base.prototype.createContents;
    Window_Base.prototype.createContents = function() {
        if (this.contents && this.contents.destroyIfDynamic) {
            this.contents.destroyIfDynamic();
        }
        _Window_Base_createContents.apply(this, arguments);
    };

    //-----------------------------------------------------------------------
    // Sprite_Picture
    //-----------------------------------------------------------------------

    var _Sprite_Picture_updateBitmap = Sprite_Picture.prototype.updateBitmap;
    Sprite_Picture.prototype.updateBitmap = function() {
        var picture = this.picture();
        // loadBitmap() replaces this.bitmap whenever the picture name changes,
        // and the bitmap is dropped outright when the picture is erased.
        if (!picture || this._pictureName !== picture.name()) {
            if (this.bitmap) {
                this.bitmap.destroyIfDynamic();
            }
        }
        _Sprite_Picture_updateBitmap.apply(this, arguments);
    };

    //-----------------------------------------------------------------------
    // Sprite_Battler
    //-----------------------------------------------------------------------

    var _Sprite_Battler_updateDamagePopup = Sprite_Battler.prototype.updateDamagePopup;
    Sprite_Battler.prototype.updateDamagePopup = function() {
        var head = this._damages ? this._damages[0] : null;
        _Sprite_Battler_updateDamagePopup.apply(this, arguments);
        // core shifts the sprite out of _damages once it stopped playing
        if (head && this._damages.indexOf(head) < 0) {
            disposeDynamicBitmaps(head);
        }
    };

    //-----------------------------------------------------------------------
    // Scene_Map / Scene_Battle
    //-----------------------------------------------------------------------

    // Both scenes only removeChild() their spriteset on terminate, so every
    // bitmap created with `new Bitmap` inside it is orphaned.
    var _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        _Scene_Map_terminate.apply(this, arguments);
        disposeDynamicBitmaps(this._spriteset);
    };

    var _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function() {
        _Scene_Battle_terminate.apply(this, arguments);
        disposeDynamicBitmaps(this._spriteset);
    };
})();
