//===================================================================
//RandomShake.js
//ランダムに画面を揺らすプラグイン
//===================================================================
//Copyright (c) 2017 蔦森くいな
//Released under the MIT license.
//http://opensource.org/licenses/mit-license.php
//-------------------------------------------------------------------
//blog   : http://paradre.com/
//Twitter: https://twitter.com/Kuina_T
//===================================================================
//＜更新情報＞
//　ver1.0.1 2017/07/07 セーブデータ作成後にプラグインを導入した際の不具合修正
//　ver1.0.0 2017/07/06 初版
//===================================================================

/*:
 * @plugindesc イベントコマンド「画面のシェイク」にランダムに揺らす機能を追加します。
 * @author 蔦森くいな
 *
 * @help プラグイン管理画面からパラメータ「SwitchNumber」にスイッチ番号を設定すると、
 * その番号のスイッチがＯＮの時、イベントコマンド「画面のシェイク」で
 * 画面を不規則に揺らす事ができます。
 * 
 * 設定項目は通常の「画面のシェイク」と同じです。
 * 「強さ」「速さ」「時間」「ウェイト」を指定できます。
 * お好みの数値で試してみて下さい。
 * 
 * 
 * @param SwitchNumber
 * @desc ランダムシェイク機能をＯＮにするために使用するスイッチ番号
 * @default 0
 *
 * 利用規約：
 * このプラグインは商用・非商用を問わず無料でご利用いただけます。
 * どのようなゲームに使っても、どのように加工していただいても構いません。
 * MIT Licenseにつき著作権表示とライセンスURLは残しておいて下さい。
 */

(function() {
    'use strict';
    
    var pd_RS_SwitchNumber = Number(PluginManager.parameters("RandomShake")["SwitchNumber"]);
    
    var pd_RS_Game_Screen_initialize = Game_Screen.prototype.initialize;
    Game_Screen.prototype.initialize = function() {
        this.__pd_RS = {};
        pd_RS_Game_Screen_initialize.call(this);
    };
    
    var pd_RS_Game_Screen_clearShake = Game_Screen.prototype.clearShake;
    Game_Screen.prototype.clearShake = function() {
        
        pd_RS_Game_Screen_clearShake.call(this);
        
        this.pd_RS_clearShake();
    };
    
    Game_Screen.prototype.pd_RS_clearShake = function() {
        this.__pd_RS.shakeX = 0;
        this.__pd_RS.shakeY = 0;
        this.__pd_RS.shakeRandomX = 0;
        this.__pd_RS.shakeRandomY = 0;
    };
    
    Game_Screen.prototype.pd_RS_checkProperty = function() {
        if(this.__pd_RS === undefined){
            this.__pd_RS = {};
            this.pd_RS_clearShake();
        }
    };
    
    var pd_RS_Game_Screen_updateShake = Game_Screen.prototype.updateShake;
    Game_Screen.prototype.updateShake = function() {
        
        if(pd_RS_SwitchNumber !== 0 && $gameSwitches.value(pd_RS_SwitchNumber)){
            if(this._shakeDuration > 0){
                if(this._shakeDuration % this._shakePower === 0){
                    this.__pd_RS.shakeRandomX = (this._shakeSpeed/2 - Math.random() * this._shakeSpeed) * this._shakePower / 3;
                    this.__pd_RS.shakeRandomY = (this._shakeSpeed/2 - Math.random() * this._shakeSpeed) * this._shakePower / 3;
                }
                if(Math.abs(this.__pd_RS.shakeX + this.__pd_RS.shakeRandomX) > this._shakePower*2){
                    var sign = 0;
                    if(this.__pd_RS.shakeRandomX > 0){
                        sign = 1;
                    }else if(this.__pd_RS.shakeRandomX < 0){
                        sign = -1;
                    }
                    this.__pd_RS.shakeX = this._shakePower*2 * sign;
                    this.__pd_RS.shakeRandomX *= -1;
                }else{
                    this.__pd_RS.shakeX += this.__pd_RS.shakeRandomX;
                }
                if(Math.abs(this.__pd_RS.shakeY + this.__pd_RS.shakeRandomY) > this._shakePower*2){
                    var sign = 0;
                    if(this.__pd_RS.shakeRandomY > 0){
                        sign = 1;
                    }else if(this.__pd_RS.shakeRandomY < 0){
                        sign = -1;
                    }
                    this.__pd_RS.shakeY = this._shakePower*2 * sign;
                    this.__pd_RS.shakeRandomY *= -1;
                }else{
                    this.__pd_RS.shakeY += this.__pd_RS.shakeRandomY;
                }
                this._shakeDuration--;
            }else if(this.__pd_RS.shakeX !== 0 || this.__pd_RS.shakeY !== 0){
                if(this.__pd_RS.shakeX > 0){
                    this.__pd_RS.shakeX -= this._shakeSpeed;
                    if(this.__pd_RS.shakeX < 0) this.__pd_RS.shakeX = 0;
                }else if(this.__pd_RS.shakeX < 0){
                    this.__pd_RS.shakeX += this._shakeSpeed;
                    if(this.__pd_RS.shakeX > 0) this.__pd_RS.shakeX = 0;
                }
                if(this.__pd_RS.shakeY > 0){
                    this.__pd_RS.shakeY -= this._shakeSpeed;
                    if(this.__pd_RS.shakeY < 0) this.__pd_RS.shakeY = 0;
                }else if(this.__pd_RS.shakeY < 0){
                    this.__pd_RS.shakeY += this._shakeSpeed;
                    if(this.__pd_RS.shakeY > 0) this.__pd_RS.shakeY = 0;
                }
            }
        }else{
            pd_RS_Game_Screen_updateShake.call(this);
        }
        
    };
    
    var pd_RS_Game_Screen_shake = Game_Screen.prototype.shake;
    Game_Screen.prototype.shake = function() {
        if(pd_RS_SwitchNumber !== 0 && $gameSwitches.value(pd_RS_SwitchNumber)){
            this.pd_RS_checkProperty();
            return this.__pd_RS.shakeX;
        }else{
            return pd_RS_Game_Screen_shake.call(this);
        }
    };
    
    var pd_RS_Spriteset_Base_updatePosition = Spriteset_Base.prototype.updatePosition;
    Spriteset_Base.prototype.updatePosition = function() {
        
        pd_RS_Spriteset_Base_updatePosition.call(this);
        
        if(pd_RS_SwitchNumber !== 0 && $gameSwitches.value(pd_RS_SwitchNumber)){
            this.y += Math.round($gameScreen.__pd_RS.shakeY);
        }
        
    };
    
    
})();