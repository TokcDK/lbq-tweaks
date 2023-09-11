//=============================================================================
// MPP_PreloadBattleImage.js
//=============================================================================
// Copyright (c) 2018 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.1.1】戦闘に必要な画像を先読み込みすることで、戦闘開始時のロード時間をわずかに減らします。
 * @author 木星ペンギン
 *
 * @help 通常、戦闘画面へ移行する際に読み込みを行う画像を、
 *   戦闘開始エフェクトと同時に先読み込みを行います。
 * 
 * デフォルトではエフェクトの時間が60フレーム(1秒)なので
 * 理論上はロード時間が1秒短縮されます。
 * 
 * ================================================================
 * ▼デフォルトの仕様
 *  ツクールMVでは、戦闘開始エフェクト後に背景画像とエネミー画像の読み込みを
 *  開始し、読み込み完了までLoadingの文字を表示させます。
 *  アクター画像は戦闘開始後に読み込みが始まり、読み込みができ次第、
 *  画面内に登場します。
 *  
 * ▼プラグインパラメータ説明
 *  〇アクターの戦闘画像の先読みを行うかどうか
 *   アクター画像の先読みを行うことで、戦闘開始後の処理落ちを軽減します。
 *   ただし、Loadingが表示される時間が長くなる可能性があります。
 *   主に[キャラクターメイク(MPP_CharacterMake.js)]と
 *   [戦闘開始特殊エフェクト(MPP_EncounterEffect.js)]を併用した場合を
 *   想定した機能です。
 *  
 *  〇エネミーの戦闘画像の先読みを行うかどうか
 *   エネミー画像の先読みを無効化した場合、Loadingが表示される時間が
 *   短縮できます。
 *   ただし、戦闘開始後に処理落ちが発生する可能性があります。
 *   主に[敵キャラを遅れて登場させる(MPP_EnemyEntryAfterStart.js)]と
 *   併用した場合を想定した機能です。
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 * 
 * @param Actor Image Preload?
 * @type boolean
 * @desc アクターの戦闘画像の先読みを行うかどうか
 * @default false
 * 
 * @param Enemy Image Preload?
 * @type boolean
 * @desc エネミーの戦闘画像の先読みを行うかどうか
 * @default true
 * 
 */

(function () {

var MPPlugin = {};

(function() {
    
    var parameters = PluginManager.parameters('MPP_PreloadBattleImage');
    
    MPPlugin.ActorImagePreload = !!eval(parameters['Actor Image Preload?'] || 'false');
    MPPlugin.EnemyImagePreload = !!eval(parameters['Enemy Image Preload?'] || 'true');
    
})();

//-----------------------------------------------------------------------------
// Scene_Map

//57
var _Scene_Map_launchBattle = Scene_Map.prototype.launchBattle;
Scene_Map.prototype.launchBattle = function() {
    _Scene_Map_launchBattle.call(this);
    var spriteset = Object.create(Spriteset_Battle.prototype);
    //ImageManager.requestParallaxes(spriteset.parallaxesName());
    //ImageManager.requestParallaxes(spriteset.parallaxesName());
    if (MPPlugin.ActorImagePreload) {
        var actors = $gameParty.battleMembers();
        for (var i = 0; i < actors.length; i++) {
            if (actors[i].isSpriteVisible()) {
                var name = actors[i].battlerName();
                ImageManager.requestSvActor(name);
            }
        }
    }
    if (MPPlugin.EnemyImagePreload) {
        var enemies = $gameTroop.members();
        for (var i = 0; i < enemies.length; i++) {
            var name = enemies[i].battlerName();
            var hue = enemies[i].battlerHue();
            if ($gameSystem.isSideView()) {
                ImageManager.requestSvEnemy(name, hue);
            } else {
                ImageManager.requestEnemy(name, hue);
            }
        }
    }
};




})();
