//=============================================================================
// BattleCustomDropItem.js
// ----------------------------------------------------------------------------
// (C) 2018 astral
// This software is released under the MIT License.
// https://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.4 2018/12/22 プラグインコマンド調整
//                  消去コマンド　追加
//                  データベースドロップ品無効化　追加
// 1.0.0 2018/12/22 初版
/*:
 * 
 * @plugindesc 戦闘中、指定したアイテム・装備をドロップ品に追加します
 * @author astral
 * 
 * @help
 * 
 * 戦闘中、敵キャラのドロップアイテムに設定されていないアイテムを、
 * この戦闘終了後に限り、追加で確定ドロップさせる事が出来ます。
 * 
 * 
 * プラグインコマンド
 * 
 * CunstomDropItem add item 1
 * ドロップアイテム 追加 アイテム 1
 * 
 *  アイテム1番をドロップ品に追加します。
 * 
 * CunstomDropItem add weapon 1
 * ドロップアイテム 追加 武器 1
 * 
 *  防具1番をドロップ品に追加します。
 * 
 * CunstomDropItem add armor 1
 * ドロップアイテム 追加 防具 1
 * 
 *  防具1番をドロップ品に追加します。
 * 
 * CunstomDropItem add item 1
 * CunstomDropItem add item 2
 *  複数回プラグインコマンドを実行すると、1番2番両方をドロップ品に追加します。
 *  同一アイテムを複数個ドロップさせる場合も、コマンドを複数回追加してください。
 * 
 * CunstomDropItem add \V[1] \V[2]
 *  制御文字を使用することも可能です。
 * 
 * 
 * CunstomDropItem clear
 * ドロップアイテム 消去
 * 
 *  この戦闘中にコマンドによって追加されたアイテムを、全て消去します。
 *  再び追加されない限り、データベースで設定されたドロップ品のみになります。
 * 
 * 
 * CunstomDropItem disable
 * ドロップアイテム 無効化
 * 
 *  この戦闘中、データーベースで設定されているドロップアイテム判定を、無効化します。
 *  プラグインコマンドで追加されたもののみ、ドロップされるようになります。
 * 
 * 
 * プラグインコマンドの日本語、英語はどちらも同じ動作をします。
 * 
 */

(function () {
    'use strict';

    var _Game_Troop_clear = Game_Troop.prototype.clear;
    Game_Troop.prototype.clear = function() {
        _Game_Troop_clear.apply(this, arguments);
        this.clearDropItem();
        this._disableDropItem = false;
    };

    Game_Troop.prototype.addDropItem = function(item) {
        if (DataManager.isItem(item)) {
            this._addDropItems.push(item);
        } else if (DataManager.isWeapon(item)) {
            this._addDropItems.push(item);
        } else if (DataManager.isArmor(item)) {
            this._addDropItems.push(item);
        }
    };

    Game_Troop.prototype.clearDropItem = function() {
        this._addDropItems = [];
    };

    Game_Troop.prototype.disableDropItem = function() {
        this._disableDropItem = true;
    };

    var _Game_Troop_makeDropItems = Game_Troop.prototype.makeDropItems;
    Game_Troop.prototype.makeDropItems = function() {
        var items = [];
        if (!this._disableDropItem) {
            items = _Game_Troop_makeDropItems.apply(this, arguments);
        }
        
        if (!this._addDropItems.length) return items;
        this._addDropItems.forEach(function(v) {
            items.push(v);
        });
        return items;
    };

    var getCommandItem = function(type, itemId) {
        var itemId = parseInt(convertEscapeVariable(itemId));
        if (!itemId || !type) return;
        type = convertEVtoLC(type);
        var item = null;
        if (type === 'item' || type === 'アイテム') {
            item = $dataItems[itemId];
        } else if (type === 'weapon' || type === '武器') {
            item = $dataWeapons[itemId];
        } else if (type === 'armor' || type === '防具') {
            item = $dataArmors[itemId];
        }
        return item;
    }
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var commandName = command.toLowerCase();
        if (commandName === 'cunstomdropitem' || commandName === 'ドロップアイテム') {
            switch (args[0].toLowerCase()) {
                case 'add':
                case '追加':
                    var item = getCommandItem(args[1], args[2]);
                    $gameTroop.addDropItem(item);
                    break;
                case 'clear':
                case '消去':
                    $gameTroop.clearDropItem();
                    break;
                case 'disable':
                case '無効化':
                    $gameTroop.disableDropItem();
                    break;
                default:
                    break;
            }
        }
    };

    var convertEscapeVariable = function(text) {
        if (typeof text !== 'string') return text;
        text = text.replace(/\\/g, '\x1b');
        text = text.replace(/\x1b\x1b/g, '\\');
        text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
            return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
            return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));
        return text;
    };

    var convertEVtoLC  = function(text) {
        if (typeof text !== 'string') return text;
        text = convertEscapeVariable(text);
        text = text.toLowerCase();
        return text;
    };

})();