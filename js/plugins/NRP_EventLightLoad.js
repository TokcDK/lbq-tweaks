//=============================================================================
// NRP_EventLightLoad.js
//=============================================================================
/*:
 * @target MV MZ
 * @plugindesc v1.00 Lightweight event processing.
 * @author Takeshi Sunagawa (http://newrpg.seesaa.net/)
 * @url https://newrpg.seesaa.net/article/499543048.html
 *
 * @help The following actions will lighten the processing of events
 * It is effective on maps where a large number of events are placed.
 * 
 * 1. Stop Draw Out of Screen
 * Reduces the load by stopping unnecessary
 * drawing processing for off-screen events.
 * 
 * 2. Cache Event Running
 * Cache the process of checking the running status of events,
 * so that it is executed only once every 1/60th of a second.
 * This can be especially effective when used in conjunction
 * with StopSelfMovementWithPlayer.js, etc.
 * 
 * -------------------------------------------------------------------
 * [Usage]
 * -------------------------------------------------------------------
 * Just apply and it will take effect.
 * 
 * Each feature has been verified to not cause problems
 * in the author's environment,
 * but can be turned on or off in case problems arise.
 * 
 * -------------------------------------------------------------------
 * [Terms]
 * -------------------------------------------------------------------
 * There are no restrictions.
 * Modification, redistribution freedom, commercial availability,
 * and rights indication are also optional.
 * The author is not responsible,
 * but will deal with defects to the extent possible.
 * 
 * @------------------------------------------------------------------
 * @ [Plugin Parameters]
 * @------------------------------------------------------------------
 * 
 * @param StopDrawOutOfScreen
 * @type boolean
 * @default true
 * @desc Stops the drawing process for off-screen events.
 * 
 * @param OutOfScreenMargin
 * @parent StopDrawOutOfScreen
 * @type number
 * @default 100
 * @desc The margin width (in pixels) that is considered off-screen.
 * 
 * @param CacheEventRunning
 * @type boolean
 * @default true
 * @desc Caches the running status of events and suppresses unnecessary reacquisition processing.
 */

/*:ja
 * @target MV MZ
 * @plugindesc v1.00 イベントの処理を軽量化します。
 * @author 砂川赳（http://newrpg.seesaa.net/）
 * @url https://newrpg.seesaa.net/article/499543048.html
 *
 * @help 以下の対応によってイベントの処理を軽量化します。
 * 大量のイベントが配置されたマップ上で効果的です。
 * 
 * １．画面外のイベント描画停止
 * 画面外のイベントに対する不要な描画処理を
 * 停止することで負荷を軽減します。
 * 
 * ２．起動状況をキャッシュ
 * イベントの起動状況の確認処理をキャッシュし、
 * 1/60秒に一度のみに限定して実行するようにします。
 * 特にStopSelfMovementWithPlayer.jsなどとの
 * 併用時は大きな効果が見込めます。
 * 
 * -------------------------------------------------------------------
 * ■使用方法
 * -------------------------------------------------------------------
 * 適用するだけで有効になります。
 * 
 * 各機能は作者環境で問題が起きないことを確認していますが、
 * 問題が起きた時のためにオンオフできるようにしています。
 * 
 * -------------------------------------------------------------------
 * ■利用規約
 * -------------------------------------------------------------------
 * 特に制約はありません。
 * 改変、再配布自由、商用可、権利表示も任意です。
 * 作者は責任を負いませんが、不具合については可能な範囲で対応します。
 * 
 * @------------------------------------------------------------------
 * @ プラグインパラメータ
 * @------------------------------------------------------------------
 * 
 * @param StopDrawOutOfScreen
 * @text 画面外のイベント描画停止
 * @type boolean
 * @default true
 * @desc 画面外のイベントの描画処理を停止します。
 * 
 * @param OutOfScreenMargin
 * @parent StopDrawOutOfScreen
 * @text 画面外の余裕幅
 * @type number
 * @default 100
 * @desc 画面外と見なす余裕の幅（ピクセル）です。
 * 数値分だけ画面外にはみ出していても停止しません。
 * 
 * @param CacheEventRunning
 * @text 起動状況をキャッシュ
 * @type boolean
 * @default true
 * @desc イベントの起動状況をキャッシュし、不要な再取得処理を抑制します。
 */

(function() {
"use strict";

function toBoolean(str, def) {
    if (str === true || str === "true") {
        return true;
    } else if (str === false || str === "false") {
        return false;
    }
    return def;
}
function toNumber(str, def) {
    if (str == undefined || str == "") {
        return def;
    }
    return isNaN(str) ? def : +(str || def);
}
function setDefault(str, def) {
    if (str == undefined || str == "") {
        return def;
    }
    return str;
}

const PLUGIN_NAME = "NRP_EventLightLoad";
const parameters = PluginManager.parameters(PLUGIN_NAME);
const pStopDrawOutOfScreen = toBoolean(parameters["StopDrawOutOfScreen"], false);
const pOutOfScreenMargin = toNumber(parameters["OutOfScreenMargin"], 0);
const pCacheEventRunning = toBoolean(parameters["CacheEventRunning"], false);

// ----------------------------------------------------------------------------
// 画面外イベントの描画停止
// ----------------------------------------------------------------------------
if (pStopDrawOutOfScreen) {
    const _Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        // 移動命令中は除外、画面外なら最小限の情報だけを更新
        // BUGFIX: アニメ／フキダシの再生中は停止しない。update を丸ごと飛ばすと
        // updateBalloon が endBalloon を呼べず、画面外に出た瞬間のフキダシが
        // 画面端に残り続ける（Sprite_Balloon は自分では消えない）。
        if (!this._character.isMoveRouteForcing()
            && !isPlayingEffect(this)
            && isOutOfScreenSprite(this)) {
            // BUGFIX: setFrame(0,0,0,0) は再開時に updateFrame とテクスチャ更新を
            // 強制するので visible で隠す（Sprite_Base.updateVisibility が戻す）
            this.updatePosition();
            this.visible = false;
            return;
        }

        _Sprite_Character_update.apply(this, arguments);
    };

    /**
     * ●アニメ・フキダシの再生中か？（画面外でも更新を止めてはいけない）
     */
    function isPlayingEffect(sprite) {
        const character = sprite._character;
        return sprite.isAnimationPlaying() || sprite.isBalloonPlaying()
            || character.animationId() > 0 || character.balloonId() > 0;
    }

    /**
     * ●スプライトの位置が画面内かどうか？
     */
    function isOutOfScreenSprite(sprite) {
        // BUGFIX: sprite.x/y はタイルマップ内の座標なので、親の変換を通して
        // 画面座標に直す。$gameScreen.zoomScale() で割るだけでは、DP_MapZoom が
        // Spriteset_Base の scale/x で拡大する分だけ可視範囲がずれる。
        // 座標はキャラクターから直接取る（sprite.x/y は前フレームの値）
        const parent = sprite.parent;
        if (!parent) {
            return false;
        }
        const character = sprite._character;
        const m = parent.worldTransform;
        const cx = character.screenX();
        const cy = character.screenY();
        const x = m.a * cx + m.c * cy + m.tx;
        const y = m.b * cx + m.d * cy + m.ty;

        // 画像の幅を考慮（Ｘ座標は中央、Ｙ座標は足元が基準）
        // 拡大率は親の変換に含まれているので画面上の実寸に直す
        let w = sprite.width;
        let h = sprite.height;
        if (!w || !h) {
            // updateFrame 前は frame が 0 なので bitmap で代用
            if (sprite.bitmap) {
                w = sprite.bitmap.width;
                h = sprite.bitmap.height;
            }
        }
        const halfWidth = w / 2 * Math.abs(m.a);
        const height = h * Math.abs(m.d);

        if (x + halfWidth + pOutOfScreenMargin < 0
            || x - halfWidth - pOutOfScreenMargin > Graphics.width
            || y + pOutOfScreenMargin < 0
            || y - height - pOutOfScreenMargin > Graphics.height) {
            return true;
        }
        return false;
    }
}

// ----------------------------------------------------------------------------
// 起動状況をキャッシュ
// ※$gameMap.isEventRunningのキャッシュ化
// ----------------------------------------------------------------------------
if (pCacheEventRunning) {
    // イベントの実行判定
    let mIsEventRunning = null;

    /**
     * ●更新
     */
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        // 毎フレームクリア
        mIsEventRunning = null;

        _Scene_Map_update.apply(this, arguments);
    };

    /**
     * ●イベントの実行判定
     */
    const _Game_Map_isEventRunning = Game_Map.prototype.isEventRunning;
    Game_Map.prototype.isEventRunning = function() {
        // 最初の１回だけ実行する。
        if (mIsEventRunning === null) {
            mIsEventRunning = _Game_Map_isEventRunning.apply(this, arguments);
        }
        return mIsEventRunning;
    };
}

})();
