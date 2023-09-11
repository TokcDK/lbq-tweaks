// Copyright (c) 2018-2020 fuku
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//

// 最新版は↓から
// http://www5f.biglobe.ne.jp/~fuku-labo/library/etc/

/*:
 * @plugindesc スプライト色変換効率化
 * @author fuku
 *
 * @help スプライトのフラッシュや色調変更の処理を効率化します。
 * このプラグインはコアスクリプトの一部を上書きします。
 * コアスクリプトのバージョンによっては適用できない可能性が高いです。
 * (「色調変更スプライトが正常に描画できないことがある問題の修正」を統合済み)
 */
var Fuku_Plugins=(Fuku_Plugins||{});
Fuku_Plugins.OptSpriteTint={version:3};

(function(){
'use strict';

Sprite.prototype._createTinter = function(w, h) {
	if (!this._canvas) {
		this._canvas = document.createElement('canvas');
		this._context = this._canvas.getContext('2d');
	}

	if(this._canvas.width !== w)this._canvas.width = w;
	if(this._canvas.height !== h)this._canvas.height = h;

	if (!this._tintTexture) {
		this._tintTexture = new PIXI.BaseTexture(this._canvas);
		this._tintTexture.mipmap = false;
	}

	if(this._tintTexture.width !== w)this._tintTexture.width = w;
	if(this._tintTexture.height !== h)this._tintTexture.height = h;
	this._tintTexture.scaleMode = this._bitmap.baseTexture.scaleMode;
};

Sprite.prototype._executeTint = function(x, y, w, h) {
	var context = this._context;
	var tone = this._colorTone;
	var color = this._blendColor;

	context.globalCompositeOperation = 'copy';
	context.drawImage(this._bitmap.canvas, x, y, w, h, 0, 0, w, h);
	
	var need_mul = false;
	if (Graphics.canUseSaturationBlend()) {
		var gray = Math.max(0, tone[3]);
		if(gray > 0){
			context.globalCompositeOperation = 'saturation';
			context.fillStyle = 'rgba(255,255,255,' + gray / 255 + ')';
			context.fillRect(0, 0, w, h);
		}
	}

	var r1 = Math.max(0, tone[0]);
	var g1 = Math.max(0, tone[1]);
	var b1 = Math.max(0, tone[2]);
	if ((r1 > 0) || (g1 > 0) || (b1 > 0)) {
		context.globalCompositeOperation = 'lighter';
		context.fillStyle = Utils.rgbToCssColor(r1, g1, b1);
		context.fillRect(0, 0, w, h);
		need_mul = true;
	}

	if (Graphics.canUseDifferenceBlend()) {
		var r2 = Math.max(0, -tone[0]);
		var g2 = Math.max(0, -tone[1]);
		var b2 = Math.max(0, -tone[2]);
		if ((r2 > 0) || (g2 > 0) || (b2 > 0)) {
			context.globalCompositeOperation = 'difference';
			context.fillStyle = 'white';
			context.fillRect(0, 0, w, h);

			context.globalCompositeOperation = 'lighter';
			context.fillStyle = Utils.rgbToCssColor(r2, g2, b2);
			context.fillRect(0, 0, w, h);

			context.globalCompositeOperation = 'difference';
			context.fillStyle = 'white';
			context.fillRect(0, 0, w, h);
			need_mul = true;
		}
	}
	var a3 = Math.max(0, color[3]);
	if (a3 > 0) {
		var r3 = Math.max(0, color[0]);
		var g3 = Math.max(0, color[1]);
		var b3 = Math.max(0, color[2]);
		context.globalCompositeOperation = 'source-atop';
		context.fillStyle = Utils.rgbToCssColor(r3, g3, b3);
		context.globalAlpha = a3 / 255;
		context.fillRect(0, 0, w, h);
		context.globalAlpha = 1;
	}
	
	if (need_mul) {
		context.globalCompositeOperation = 'destination-in';
		context.drawImage(this._bitmap.canvas, x, y, w, h, 0, 0, w, h);
   }
};

})();
