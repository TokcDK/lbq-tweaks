//=============================================================================
// MPP_ResistMessage.js
//=============================================================================
// Copyright (c) 2018 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.1.0】スキル・アイテムの対象が付加しようとしたステートを無効化した際に表示するメッセージを設定できます。
 * @author 木星ペンギン
 *
 * @help ステートのメモ欄:
 *   <ResMsg:text>             # 無効化された際に表示するメッセージ
 * 
 * ================================================================
 * ▼ステートのメモ欄詳細
 * --------------------------------
 *  〇 <ResMsg:text> (無効化された際に表示するメッセージ)
 *   表示されるメッセージは
 *     対象者の名前 + text
 *   となります。
 *   
 *   このメッセージは他のステートの成否にかかわらず、
 *   このステートが無効化された場合に表示されます。
 *   
 * ================================================================
 * ▼詳細
 * --------------------------------
 *  〇 プラグインパラメータ[State Resist Message]にて設定したメッセージは、
 *   付加しようとしたステートが複数ある場合、すべてのステートを無効化した
 *   場合のみ表示されます。
 *  
 *  〇 メッセージが設定されたステートとそうでないステートが防がれた場合、
 *   個別に設定されたメッセージのみが表示されます。
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 * @param State Resist Message
 * @desc ステート付加を無効化した際のメッセージ
 * @default %1には効かなかった！
 * 
 * 
 * 
 */

(function () {

var MPPlugin = {};

(function() {
    
    var parameters = PluginManager.parameters('MPP_ResistMessage');
    
    MPPlugin.StateResistMessage = parameters['State Resist Message'];
    
})();

var Alias = {};

//-----------------------------------------------------------------------------
// Game_ActionResult

//15
Alias.GaAcRe_clear = Game_ActionResult.prototype.clear;
Game_ActionResult.prototype.clear = function() {
    Alias.GaAcRe_clear.apply(this, arguments);
    this.mppResistStates = [];
};

Game_ActionResult.prototype.mppResistStateObjects = function() {
    return this.mppResistStates.map(function(id) {
        return $dataStates[id];
    });
};

//46
Alias.GaAcRe_isStatusAffected = Game_ActionResult.prototype.isStatusAffected;
Game_ActionResult.prototype.isStatusAffected = function() {
    return (Alias.GaAcRe_isStatusAffected.apply(this, arguments) ||
            this.mppResistStates.length > 0);
};

//-----------------------------------------------------------------------------
// Game_Battler

//165
Alias.GaBa_addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId) {
    if (this.isAlive() && !this.isStateAddable(stateId)) {
        this._result.mppResistStates.push(stateId);
    }
    Alias.GaBa_addState.apply(this, arguments);
};

//-----------------------------------------------------------------------------
// Window_BattleLog

//490
Alias.WiBaLo_displayChangedStates = Window_BattleLog.prototype.displayChangedStates;
Window_BattleLog.prototype.displayChangedStates = function(target) {
    Alias.WiBaLo_displayChangedStates.apply(this, arguments);
    this.displayMppResistStates(target);
        target.result().mppResistStateObjects().forEach(function(state) {
            var stateAni = state.meta.ResAni;
            if (stateAni) {
    target.startAnimation(Number(stateAni), false, 0);//変更
            }
        }, this);
};

Window_BattleLog.prototype.displayMppResistStates = function(target) {
    if (target.result().mppResistStates.length > 0) {
        var msg = false;
        target.result().mppResistStateObjects().forEach(function(state) {
            var stateMsg = state.meta.ResMsg;
            if (stateMsg) {
                this.push('popBaseLine');
                this.push('pushBaseLine');
                this.push('addText', target.name() + stateMsg);
                this.push('waitForEffect');
                msg = true;
            }
        }, this);
       // if (!msg && !Alias.GaAcRe_isStatusAffected.call(target.result())) {
       //     this.push('popBaseLine');
       //     this.push('pushBaseLine');
       //     var text = MPPlugin.StateResistMessage.format(target.name());
       //     this.push('addText', text);
       //     this.push('waitForEffect');
       // }
    }
};





})();
