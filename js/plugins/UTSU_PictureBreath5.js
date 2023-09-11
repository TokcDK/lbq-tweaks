//=============================================================================
// UTSU_PictureBreath5.js
// ----------------------------------------------------------------------------
// Copyright (c) 2020 Utsuda Shinou
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.3 2020/08/26 Fix bug that breath of pictures in map stops after battle
// 1.1.2 2020/08/25 Fix to continue picture breath even if picture changed for the same picture number
// 1.1.1 2020/08/25 Fix bug about init params
// 1.1.0 2020/08/23 Fix plugin does not work in a battle
//                  Fix help about parameters, speed -> period
// 1.0.0 2020/08/21 Release
// ----------------------------------------------------------------------------
// [GitHub] : https://github.com/utsudashinou
// [Twitter]: https://twitter.com/virtualUtsuda
//=============================================================================

/*:
 * @plugindesc ピクチャ息遣い
 * @author Utsuda Shinou
 *
 * @help ピクチャに息遣いの動作を加えます。
 *
 * * スクリプト
 * UTSU.PictureBreath.on(pictureIds, period);
 *   息遣いをする。pictureIdsは対象のピクチャIDの配列、periodは息遣いの周期。
 *   例: UTSU.PictureBreath5.on([71,72], 150);
 *
 * UTSU.PictureBreath.off(pictureIds);
 *   息遣いをやめる。
 *   例: UTSU.PictureBreath5.off([1,2,3]);
 *
 *
 * * プラグインコマンド
 * UTSU_PictureBreathOn pictureId0, ...pictureIdN, period
 *   息遣いをする。pictureId*は対象のピクチャID、periodは息遣いの周期。
 *   例: UTSU_PictureBreathOn 1 2 3 4 5 150
 *
 * UTSU_PictureBreathOff pictureId0, ...pictureIdN
 *   息遣いをやめる。
 *   例: UTSU_PictureBreathOff 1 2 3 4 5
 *
 */

((global) => {
  global.UTSU = global.UTSU || {};
  global.UTSU.PictureBreath5 = global.UTSU.PictureBreath5 || {};

  const STATE_NO_OPERATION5 = -1;
  const STATE_REQUEST_DEACTIVATE5 = 0;
  const STATE_REQUEST_ACTIVATE5 = 1;

  const breathBackup5 = {};

  global.UTSU.PictureBreath5.on = (pids, period) => {
    pids.forEach((pid) => {
      const picture = $gameScreen.picture(Number(pid));
      if (picture) {
        picture._breathState5 = STATE_REQUEST_ACTIVATE5;
        picture._breathPeriod5 = Number(period);
        const realPictureId5 = $gameScreen.realPictureId(Number(pid));
        breathBackup5[realPictureId5] = {
          _breathPeriod5: picture._breathPeriod5,
        };
      }
    });
  };

  global.UTSU.PictureBreath5.off = (pids) => {
    pids.forEach((pid) => {
      const picture = $gameScreen.picture(Number(pid));
      if (picture) {
        picture._breathState5 = STATE_REQUEST_DEACTIVATE5;
        const realPictureId5 = $gameScreen.realPictureId(Number(pid));
        breathBackup5[realPictureId5] = null;
      }
    });
  };

  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === "UTSU_PictureBreathOn5") {
      const period = args.pop();
      UTSU.PictureBreath5.on(args, period);
    }
    if (command === "UTSU_PictureBreathOff5") {
      UTSU.PictureBreath5.off(args);
    }
  };

  const _Game_Screen_showPicture = Game_Screen.prototype.showPicture;
  Game_Screen.prototype.showPicture = function (pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode) {
    _Game_Screen_showPicture.call(this, pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode);
    const realPictureId5 = this.realPictureId(pictureId);
    if (breathBackup5[realPictureId5]) {
      const picture = this._pictures[realPictureId5];
      picture._breathState5 = STATE_REQUEST_ACTIVATE5;
      picture._breathPeriod5 = breathBackup5[realPictureId5]._breathPeriod5;
    }
  };

  const _Game_Picture_initBasic = Game_Picture.prototype.initBasic;
  Game_Picture.prototype.initBasic = function () {
    _Game_Picture_initBasic.call(this);
    this._breathActive5 = false;
    this._breathState5 = STATE_NO_OPERATION5;
    this._breathPeriod5 = 0;
    this._breathCount5 = 0;
  };

  const _Game_Picture_update = Game_Picture.prototype.update;
  Game_Picture.prototype.update = function () {
    _Game_Picture_update.call(this);
    if (this._breathState5 === STATE_REQUEST_ACTIVATE5) {
      this._breathState5 = STATE_NO_OPERATION5;
      this._breathActive5 = true;
      this._breathCount5 = 0;
    }
    if (this._breathState5 === STATE_REQUEST_DEACTIVATE5) {
      this._breathState5 = STATE_NO_OPERATION5;
      this._breathActive5 = false;
    }
    if (this._breathActive5) {
      this._breathCount5 = (this._breathCount5 + 1) % this._breathPeriod5;
    }
  };

  const _Sprite_Picture_update = Sprite_Picture.prototype.update;
  Sprite_Picture.prototype.update = function () {
    _Sprite_Picture_update.call(this);
    if (this.visible) {
      this._breathUpdate5();
    }
  };

  Sprite_Picture.prototype._breathUpdate5 = function () {
    const picture = this.picture();
    if (!picture) {
      return;
    }
    if (picture._breathActive5) {
      const freq = Math.sin((Math.PI * picture._breathCount5) / (picture._breathPeriod5 / 2));
      this.scale.y -= freq * valueTachieBless5[4] + valueTachieBless5[4]; //0.015 + 0.015
      this.y -= Math.ceil((this.height * (1.0 - this.scale.y)) / valueTachieBless5[1]);
      this.scale.x += freq * valueTachieBless5[3] + valueTachieBless5[3]; //0.005 + 0.005
      this.x += Math.ceil((this.width * (1.0 - this.scale.x)) / valueTachieBless5[0]);
    }
  };
})(window);
