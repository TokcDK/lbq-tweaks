//=============================================================================
// Trb_AnimationExtend.js
//=============================================================================
//Copyright (c) 2016 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
//twitter https://twitter.com/Trb_surasura
/*:
 * @plugindesc アニメーションの設定拡張プラグイン
 * @author Trb
 * @version 1.00 2016/12/6
 * 
 * @help アニメーションの設定に色々な機能を追加します。
 * 現バージョンでは、別のアニメーションの呼び出し、画面のシェイク、演出スキップの機能があります。
 * 導入方法が少し特殊なので、下にも簡易的な説明を書いておきますが詳しくは配布ページの解説を参考にしてください。
 * 
 * 
 * <簡易的な説明>
 * 
 * 1.以下の名前のoggファイルを用意する
 *   StartAnimation.ogg
 *   StartShake.ogg
 *   SkipProcess.ogg
 *  （使用するのはファイルの名前だけなので、中身は何でもいいです）
 * 2.そのファイルをseのフォルダに入れる
 * 
 * ここまでが下準備です。
 * 
 * 4.アニメーションの『seとフラッシュのタイミング』で上のoggを設定することで各機能を使えます。
 * ・StartAnimation
 *   任意の位置で別のアニメーションを再生することができます。
 * 
 *   ・使い方
 *   『se』にStartAnimationを設定する。
 *   フラッシュを『対象』にして、『時間』で再生したいアニメーションのIDを指定する
 * 
 * ・StartShake
 *   任意の位置で画面をシェイクさせることができます。
 * 
 *   ・使い方
 *   『se』にStartShakeを設定する。
 *   フラッシュを『対象』にして、『赤』の値でシェイクの強さ、『緑』の値でシェイクの速さ、『時間』でシェイクの時間を指定する
 *   
 * ・SkipProcess
 *   (※この機能は試験的に導入してみたものです。もしエラーが出た場合どういう設定でエラーになったか報告頂けると助かります)
 *   通常はアニメーションの再生が全て終わってからダメージの処理に移りますが、
 *   このコマンドを入れるとアニメーションの終了を待たずにダメージの処理に移ります。
 * 
 *   ・使い方
 *   『se』にSkipProcessを設定する。
 * 
 * 
 *   上で書かれていない項目（seの音量やピッチなど）は使用しないので特に設定する必要ありません。
 * 
 */
(function () {

    var _Sprite_Animation_processTimingData = Sprite_Animation.prototype.processTimingData;
    Sprite_Animation.prototype.processTimingData = function(timing) {
        if(timing.se){
            switch(timing.se.name){//seの名前で分岐

                case 'StartShake'://StartShakeの時
                    //timingから必要な数値を取得する
                    var power = timing.flashColor[0].clamp(1,9);//clamp(a,b)は与えられた数値をa～bの範囲に収めるスクリプト
                    var speed = timing.flashColor[1].clamp(1,9);
                    var duration = timing.flashDuration.clamp(1,200);
                    $gameScreen.startShake(power,speed,duration);//画面を揺らすスクリプト
                    break;

                case 'StartAnimation'://StartAnimationの時
                    var ID = timing.flashDuration;
                    this._target.startAnimation($dataAnimations[ID],false,false);//このメソッド内のthis._targetは、アニメーションのターゲットになっているSpriteを指してます
                    break;

                case 'SkipProcess'://SkipProcessの時
                    if($gameParty.inBattle()){
                        BattleManager.updateAction();
                    }
                    break;

                default://それ以外の時（通常のse）
                    _Sprite_Animation_processTimingData.apply(this,arguments);
            }
        }else{//それ以外の時（se以外）
            _Sprite_Animation_processTimingData.apply(this,arguments);
        }
    };

/*
↑のメソッド内で、引数 timing は
flashColor,flashDuration,flashScope,se
のデータを持ってます。
本来は効果音やフラッシュの演出に使うものですが、se名が特定の名前の時には
別の演出を実行するにしようというのがこのプラグインの基本構造です。
*/

})();