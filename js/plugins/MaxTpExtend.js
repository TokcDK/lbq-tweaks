/*=============================================================================
 MaxTpExtend.js
----------------------------------------------------------------------------
 (C)2020 Triacontane
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.1.0 2022/07/16 TP拡張のタグの対象にスキルを追加
 1.0.1 2021/06/22 競合が起こりやすい記述を変更
 1.0.0 2020/05/08 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc MaxTpExtendPlugin
 * @author triacontane
 *
 * @help MaxTpExtend.js
 *
 * Extend the maximum TP.
 * Please describe the following in the memo field of
 * the database (*) that has the feature as follows.
 * <MaxTp:30> // The maximum TP will be added by 30.
 *
 * (*) Actors, Classes, Weapons, Armors, Enemies, and States
 *
 * Negative values can also be set.
 * The actual TP is the basic value of 100 with the specified
 * The values of all the memo fields will be added together.
 *
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc 最大TP拡張プラグイン
 * @author トリアコンタン
 *
 * @help MaxTpExtend.js
 *
 * 最大TPを拡張します。
 * 特徴を有するデータベース(※)のメモ欄に以下の通り記述してください。
 * <MaxTp:30>  // 最大TPが30加算されます。
 * <最大TP:30> // 同上
 * ※アクター、職業、武器、防具、敵キャラ、ステート、スキル
 *
 * 負の値も設定できます。実際のTPは基本値の100に対して指定した
 * メモ欄全ての値が合算されます。制御文字\v[n]で変数の値を参照できます。
 *　
 * このプラグインにはプラグインコマンドはありません。
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(function() {
    'use strict';

    /**
     * Get database meta information.
     * @param object Database item
     * @param tagName Meta name
     * @returns {String} meta value
     */
    var getMetaValue = function(object, tagName) {
        return object && object.meta && object.meta.hasOwnProperty(tagName) ?
            convertEscapeCharacters(object.meta[tagName]) : null;
    };

    /**
     * Get database meta information.(for multi language)
     * @param object Database item
     * @param names Meta name array (for multi language)
     * @returns {String} meta value
     */
    var getMetaValues = function(object, names) {
        var metaValue;
        names.some(function(name) {
            metaValue = getMetaValue(object, name);
            return metaValue !== null;
        });
        return metaValue;
    };

    /**
     * Convert escape characters.
     * A scene's window layer can legitimately have no child window while game
     * logic is still running: YEP_CoreEngine's "Collection Clear" empties the
     * scene in Scene_Base.terminate, and YEP_X_CoreUpdatesOpt hooks the
     * WindowLayer's 'removed' event to drop its children, yet
     * Scene_Battle.terminate calls $gameParty.onBattleEnd() (state removal ->
     * refresh -> maxTp) afterwards. Conversion only needs $gameVariables /
     * $gameActors, which every Window_Base carries on its prototype, so fall
     * back to that instead of dereferencing a window that is not there.
     * @param text Target text
     * @returns {String} Converted text
     */
    var convertEscapeCharacters = function(text) {
        var scene = SceneManager._scene;
        var windowLayer = scene && scene._windowLayer;
        var window = windowLayer && windowLayer.children[0];
        var converter = window && window.convertEscapeCharacters ? window : Window_Base.prototype;
        return converter.convertEscapeCharacters(text.toString());
    };

    /**
     * Game_BattlerBase
     * TPの最大値をメモ欄から取得します。
     */
    var _Game_BattlerBase_maxTp = Game_BattlerBase.prototype.maxTp;
    Game_BattlerBase.prototype.maxTp = function() {
        return _Game_BattlerBase_maxTp.apply(this, arguments) + this.findMaxTpExtend();
    };

    Game_BattlerBase.prototype.findMaxTpExtend = function() {
        return this.findMaxTpTraits().reduce(function(tp, traitObj) {
            var meta = getMetaValues(traitObj, ['最大TP', 'MaxTp']);
            if (meta) {
                // Without the parentheses a single unparsable tag (NaN) resets
                // the sum of every tag collected so far back to 0.
                tp += parseInt(meta, 10) || 0;
            }
            return tp;
        }, 0);
    };

    Game_BattlerBase.prototype.findMaxTpTraits = function() {
        return this.traitObjects();
    };

    Game_Actor.prototype.findMaxTpTraits = function() {
        const traits = Game_BattlerBase.prototype.findMaxTpTraits.apply(this, arguments);
        return traits.concat(this.skills());
    };
})();
