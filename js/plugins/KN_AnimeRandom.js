//=============================================================================
// KN_AnimeRandom.js
//=============================================================================

/*:
 * @plugindesc 任意アニメーションの表示ランダム化
 * @author こんにちは
 *
 * @help 任意のアニメーションの角度や拡大率などを自動的にランダム化して表示します。
 * 
 * ■使い方■
 * アニメーションの名前のどこかに「<rand>」と付け加えてください。
 * するとアニメーションの角度、拡大率、反転などが自動的にランダム化されます。
 * 
 * 具体的には、角度は0～360度までランダムになりますが、
 * 拡大率はほんのちょっと大きくなったり小さくなったりする程度です。
 * 
 * デフォルトの「打撃/物理」など、回転しても変じゃないアニメーションに
 * 使うことをおすすめします。
 *
 * ■プラグインコマンド■
 * なし
 *
 * ■利用規約■
 * 特にありません。
 *
 */

var _Sprite_Animation_updateCellSprite = Sprite_Animation.prototype.updateCellSprite;
Sprite_Animation.prototype.updateCellSprite = function(sprite, cell) {
    _Sprite_Animation_updateCellSprite.apply(this, arguments);
    var pattern = cell[0];
    if (pattern >= 0) {
        if (this.currentFrameIndex() == 1 && this._animation.name.indexOf('<rand>') >= 0) {
            var rand = function(min, max) {
                return Math.floor(Math.random() * (max + 1 - min)) + min;
            }
            this._rand = {
                rotation : rand(0, 360) * Math.PI / 180,
                addX     : rand(-2, 2),
                addY     : rand(-2, 2),
                scale    : rand(0, 100),
                invertX  : rand(0, 1) * 2 - 1,
                invertY  : rand(0, 1) * 2 - 1,
            }
        }
        if (this._rand) {
            sprite.rotation = this._rand.rotation;
            sprite.x += this._rand.addX;
            sprite.y += this._rand.addY;
            sprite.scale.x *= (-0.90 + this._rand.scale * 0.002) * this._rand.invertX;
            sprite.scale.y *= (-0.90 + this._rand.scale * 0.002) * this._rand.invertY;
        }
    }
};

