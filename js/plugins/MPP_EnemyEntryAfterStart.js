//=============================================================================
// MPP_EnemyEntryAfterStart.js
//=============================================================================
// Copyright (c) 2018 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.1.0】エネミーを戦闘開始後に登場させます。
 * @author 木星ペンギン
 *
 * @help 〇通常では戦闘開始前に読み込むエネミー画像を、戦闘開始後に読み込みます。
 *   これにより戦闘開始時のロードが短くなります。
 *  
 *  〇画像の読み込みが完了でき次第、フロントビューでは上から、
 *   サイドビューでは左からエネミーを登場させます。
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 * @param Entry Base Delay
 * @type number
 * @desc 登場を開始するまでの時間
 * @default 20
 * 
 * @param Entry Next Delay
 * @type number
 * @desc エネミーを順に登場させる際の間隔
 * @default 8
 * 
 * @param Entry Duration
 * @type number
 * @desc 登場にかかる時間
 * @default 20
 * 
 * 
 */

(function () {

var MPPlugin = {};

(function() {
    
    var parameters = PluginManager.parameters('MPP_EnemyEntryAfterStart');
    
    MPPlugin.EntryBaseDelay = Number(parameters['Entry Base Delay'] || 20);
    MPPlugin.EntryNextDelay = Number(parameters['Entry Next Delay'] || 8);
    MPPlugin.EntryDuration = Number(parameters['Entry Duration'] || 20);
    
})();

var Alias = {};

//-----------------------------------------------------------------------------
// BattleManager

//19
Alias.BaMa_initMembers = BattleManager.initMembers;
BattleManager.initMembers = function() {
    Alias.BaMa_initMembers.call(this);
    this.mppBattleStarted = false;
};

//221
Alias.BaMa_startBattle = BattleManager.startBattle;
BattleManager.startBattle = function() {
    Alias.BaMa_startBattle.call(this);
    this.mppBattleStarted = true;
};

//-----------------------------------------------------------------------------
// Sprite_Enemy

//17
Alias.SpEn_initMembers = Sprite_Enemy.prototype.initMembers;
Sprite_Enemy.prototype.initMembers = function() {
    Alias.SpEn_initMembers.call(this);
    this._entryDelay = 0;
};

//49
Alias.SpEn_updateBitmap = Sprite_Enemy.prototype.updateBitmap;
Sprite_Enemy.prototype.updateBitmap = function() {
    if (BattleManager.mppBattleStarted) {
        Alias.SpEn_updateBitmap.call(this);
    }
};

//69
Alias.SpEn_updateFrame = Sprite_Enemy.prototype.updateFrame;
Sprite_Enemy.prototype.updateFrame = function() {
    if (this.bitmap) {
        Alias.SpEn_updateFrame.call(this);
    }
};

//
if (Sprite_Enemy.prototype.hasOwnProperty('updateMove')) {
    Alias.SpEn_updateMove = Sprite_Enemy.prototype.updateMove;
}
Sprite_Enemy.prototype.updateMove = function() {
    if (this._entryDelay > 0) {
        this._entryDelay--;
        return;
    }
    var bitmap = this.bitmap;
    if (!bitmap || bitmap.isReady()) {
        if (Alias.SpEn_updateMove) {
            Alias.SpEn_updateMove.call(this);
        } else {
            Sprite_Battler.prototype.updateMove.call(this);
        }
    }
};

Sprite_Enemy.prototype.startEntry = function(delay) {
    if ($gameSystem.isSideView()) {
        this.startMove(-600, 0, 0);
    } else {
        this.startMove(0, -600, 0);
    }
    this.startMove(0, 0, MPPlugin.EntryDuration);
    this._entryDelay = delay;
};

//83
Alias.SpEn_updateStateSprite = Sprite_Enemy.prototype.updateStateSprite;
Sprite_Enemy.prototype.updateStateSprite = function() {
    if (this.bitmap) {
        Alias.SpEn_updateStateSprite.call(this);
    }
};

//-----------------------------------------------------------------------------
// Spriteset_Battle

Spriteset_Battle.prototype.startEnemyEntry = function() {
    var sprites = this._enemySprites;
    var delay = MPPlugin.EntryBaseDelay;
    var nextDelay = MPPlugin.EntryNextDelay;
    for (var i = 0; i < sprites.length; i++) {
        sprites[i].startEntry(delay);
        delay += nextDelay;
    }
};

//-----------------------------------------------------------------------------
// Scene_Battle

//22
Alias.ScBa_start = Scene_Battle.prototype.start;
Scene_Battle.prototype.start = function() {
    Alias.ScBa_start.call(this);
    this._spriteset.startEnemyEntry();
};






})();
