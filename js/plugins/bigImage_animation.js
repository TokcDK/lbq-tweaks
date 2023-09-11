//=============================================================================
// bigImage_animation.js
//=============================================================================
//Copyright (c) 2016 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
//twitter https://twitter.com/Trb_surasura
/*:
 * @plugindesc アニメーションで一枚絵を使用できるようにするプラグイン
 * @author Trb
 * @version 1.00 2016/7/13 初版
 * 
 * @help 
 * アニメーション画像の画像名に『$』を付けると
 * その画像は一枚絵として表示されるようになります。
 * 詳しくはツクマテの投稿ページ内の説明を見て下さい。
 * 
 * 
 */
(function () {

    var _Sprite_Animation_updateCellSprite = Sprite_Animation.prototype.updateCellSprite;
    Sprite_Animation.prototype.updateCellSprite = function(sprite, cell) {
        _Sprite_Animation_updateCellSprite.apply(this,arguments);
        //セルパターンが100未満だったらアニメーション1の名前を、100以上だったらアニメーション2の名前を取得
        if(cell[0] < 100){
            var name = this._animation.animation1Name;
        }else{
            name = this._animation.animation2Name;
        }
        //名前の頭文字に『$』が付いているかの判定(キャラチップの$判定用のメソッドを流用)
        if(ImageManager.isBigCharacter(name)){
            //『$』が付いていたらsetFrameで画像全体を指定
            sprite.setFrame( 0, 0, sprite.bitmap.width, sprite.bitmap.height);
        }
    };


})();