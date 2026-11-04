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
 * through ImageManager._imageCache). It also spares the one cached bitmap that
 * does NOT carry `_url`: the blank singleton from ImageManager.loadEmptyBitmap,
 * which every sprite with an empty file name points at.
 *
 * destroy() releases the GL texture but leaves the Bitmap itself usable: the
 * BaseTexture is disposed rather than destroyed and the canvas is shrunk to
 * 1x1. A PIXI.Texture that something still holds therefore keeps working (it
 * draws nothing) instead of crashing the renderer with
 * "Cannot read properties of null (reading 'videoWidth')".
 *
 * Freed automatically:
 *  - Window_Base.createContents: allocates a new Bitmap on every call, and
 *    CommonPopupCore calls it once per popup on a full-screen window.
 *  - Window._refreshBack / _refreshFrame / _refreshCursor: a new Bitmap per
 *    resize, and the message window resizes on almost every message.
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
    //
    // It disposes the BaseTexture instead of destroying it. BaseTexture#destroy
    // sets `source = null`, and the PIXI.Texture built from it can still be
    // installed on a sprite -- a shared bitmap, a pooled sprite, a scene that
    // kept a reference -- so the next bind threw in the middle of the render
    // pass:
    //   TextureManager.updateTexture -> glTexture.upload(texture.source)
    //   Texture.upload -> source.videoWidth        (source === null)
    // dispose() frees the GL allocation and leaves the texture usable, and the
    // canvas is shrunk to 1x1 first so the re-upload is 4 bytes and completely
    // transparent: a stale reference degrades to an invisible quad, never a
    // crash. Nothing has to be nulled, so no accessor can walk into a corpse.
    Bitmap.prototype.destroy = function() {
        if (this.__disposed) {
            return;
        }
        this.__disposed = true;
        if (this.__canvas) {
            this.__canvas.width = 1;
            this.__canvas.height = 1;
        }
        if (this.__baseTexture) {
            this.__baseTexture.dispose();
        }
    };

    /**
     * A deferred bitmap (Bitmap.load, and every Bitmap_Video, which sets
     * `_defer = true`) has no canvas, and once it is destroyed -- or its image
     * has not arrived -- it has no `_image` either. The lazy `_baseTexture`
     * getter then called _createBaseTexture(null), and PIXI accepted it: the
     * BaseTexture was created with `source === null` and only threw later, when
     * the renderer bound it.
     *   TextureManager.updateTexture -> glTexture.upload(texture.source)
     *   Texture.upload -> source.videoWidth   (source === null)
     * Give it an empty 1x1 canvas so the frame survives.
     */
    var _Bitmap_createBaseTexture = Bitmap.prototype._createBaseTexture;
    Bitmap.prototype._createBaseTexture = function(source) {
        if (!source) {
            this._createCanvas();
            source = this.__canvas;
        }
        return _Bitmap_createBaseTexture.call(this, source);
    };

    /**
     * ImageManager hands out one shared blank Bitmap ('empty') to every sprite
     * whose file name is empty: events with no graphic, a map without a
     * parallax, erased pictures, blank tileset slots. It is built with
     * `new Bitmap()`, so it looks dynamic, but it outlives the sprite that uses
     * it. Destroying it left a dead entry behind and the next
     * ShaderTilemap.refreshTileset() -> `x._baseTexture` threw
     * "Cannot read properties of null (reading 'width')".
     *
     * The singleton is tagged on the way out instead of looked up in a cache:
     * YEP_X_CoreUpdatesOpt replaces loadEmptyBitmap three times and stores the
     * bitmap in ImageManager.cache or ImageManager._imageCache depending on
     * which core-update params are on, so no single lookup is reliable.
     */
    var _ImageManager_loadEmptyBitmap = ImageManager.loadEmptyBitmap;
    ImageManager.loadEmptyBitmap = function() {
        var bitmap = _ImageManager_loadEmptyBitmap.apply(this, arguments);
        if (bitmap) {
            bitmap.__shared = true;
        }
        return bitmap;
    };

    /**
     * Frees the GPU texture of a bitmap built with `new Bitmap(w, h)`.
     * ImageManager bitmaps carry `_url` and are shared through
     * ImageManager._imageCache, so they must be left alone.
     *
     * Bitmap_Video is skipped as well: it owns a <video> element and a
     * VideoBaseTexture, and MoviePicture.js drives that lifecycle itself
     * (loadVideo / clearVideo). Its destroy() also is not idempotent -- it
     * leaves `_loadingState` at 'loaded', so a second call runs pause() on the
     * `_video` it just nulled. `isVideo` only exists on that class.
     */
    Bitmap.prototype.destroyIfDynamic = function() {
        if (this._url || this.__shared || typeof this.isVideo === 'function') {
            return;
        }
        this.destroy();
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
    // Window (back / frame / cursor bitmaps)
    //-----------------------------------------------------------------------

    // _refreshBack / _refreshFrame / _refreshCursor each draw a brand new Bitmap
    // and assign it to their sprite, dropping the previous one. They run on
    // every resize, and the message window resizes on almost every message
    // (MPP_MessageEX.startMessage, MessageWindowPopup.resetLayout), so three
    // window-sized textures leaked per line of dialogue.
    function patchWindowPartRefresh(method, spriteName) {
        var original = Window.prototype[method];
        if (!original) {
            return;
        }
        Window.prototype[method] = function() {
            var sprite = this[spriteName];
            var previous = sprite ? sprite.bitmap : null;
            original.apply(this, arguments);
            if (previous && sprite.bitmap !== previous) {
                previous.destroyIfDynamic();
            }
        };
    }

    patchWindowPartRefresh('_refreshBack', '_windowBackSprite');
    patchWindowPartRefresh('_refreshFrame', '_windowFrameSprite');
    patchWindowPartRefresh('_refreshCursor', '_windowCursorSprite');

    //-----------------------------------------------------------------------
    // Sprite_Picture
    //-----------------------------------------------------------------------

    // loadBitmap() replaces this.bitmap when the picture name changes, and the
    // bitmap is dropped when the picture is erased. Free the one that was
    // actually replaced -- destroying the one that is *about to* be replaced is
    // wrong: TKM_TachieManager allocates `new Bitmap(1, 1)` once for a
    // "TKMtachie_" picture and reuses it across loadBitmap() calls (it only
    // allocates when `!bitmap.isTachie`, and destroy() leaves that flag set), so
    // the sprite kept rendering a texture whose BaseTexture had been freed.
    var _Sprite_Picture_updateBitmap = Sprite_Picture.prototype.updateBitmap;
    Sprite_Picture.prototype.updateBitmap = function() {
        var previous = this.bitmap;
        _Sprite_Picture_updateBitmap.apply(this, arguments);
        if (previous && previous !== this.bitmap) {
            previous.destroyIfDynamic();
        }
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
