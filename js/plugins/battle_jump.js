/*:
 * @plugindesc 戦闘開始時に画面の外からジャンプして登場させる。
 * @help
 * プラグインコマンドはありません。
 * 
 * 2019/10/24追記:こちらのプラグインはパブリックドメインです。
*/
(function() {
Sprite_Battler.prototype.updateMove = function() {
    if (this._movementDuration > 0) {
        var d = this._movementDuration;
		var dx = 1.1;
		var dy = -0.5;
		var g = 0.3;
		dy -= g;
        this._offsetX = (this._offsetX * (d - dx) + this._targetOffsetX) / d;
        this._offsetY = (this._offsetY * (d + dy) + this._targetOffsetY) / d;
        this._movementDuration--;
        if (this._movementDuration === 0) {
            this.onMoveEnd();
        }
    }
};

Sprite_Actor.prototype.moveToStartPosition = function() {
    this.startMove(300, -200, 0);//this.startMove(300, -300, 0)
};

})();