//=============================================================================
// MPP_PartyGraphics.js
//=============================================================================
// Copyright (c) 2015 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.1.0】イベントの画像をパーティメンバーと同じにします。
 * @author 木星ペンギン
 *
 * @help プラグインコマンド:
 *   PartyGraphics id index      # イベント id 番を index　番目の
 *                                 パーティメンバーの画像にする
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 */

(function() {

//1722
var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'PartyGraphics') {
        var event = this.character(Number(args[0]));
        var actor = $gameParty.members()[Number(args[1])];
        event.setImage(actor.characterName(), actor.characterIndex());
    }
};


})();
