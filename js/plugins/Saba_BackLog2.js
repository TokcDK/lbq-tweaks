/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

(function() {
    'use strict';

    var _Game_Message_add = Game_Message.prototype.add;
    Game_Message.prototype.add = function(text) {
        Saba.BackLog.$gameBackLog.addLog('Page Up', text);
        _Game_Message_add.apply(this, arguments);
    };
})();