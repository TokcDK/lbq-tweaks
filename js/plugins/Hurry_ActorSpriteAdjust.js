/*:

 * @plugindesc パーティ人数によってSVアクターの位置を自動調整します
 * @author ハーリー


 * @param CenterAdjustX
 * @desc 【横方向への中央寄せ】パーティ人数が4人以下のときSVアクターをこの数値だけ右に中央寄せします。Default:24
 * @default 16

 * @param CenterAdjustY
 * @desc 【縦方向への中央寄せ】パーティ人数が4人以下のときSVアクターをこの数値だけ下に中央寄せします。Default:24
 * @default 24

 * @param ActorHomeX
 * @desc 【アクターの横位置】パーティ人数が4人の時のアクター1の横方向の位置です。Default:600
 * @default 600

 * @param ActorHomeY
 * @desc 【アクターの縦位置】パーティ人数が4人の時のアクター1の縦方向の位置です。Default:280
 * @default 280

 * @param DistanceX
 * @desc 【アクター間の横方向の距離】SVアクターの位置がパーティIDによってこの数値分だけ右にずれていきます。Default:32
 * @default 32

 * @param DistanceY
 * @desc 【アクター間の縦方向の距離】SVアクターの位置がパーティIDによってこの数値分だけ下にずれていきます。Default:48
 * @default 48

 * @help
 * パーティ人数によってSVアクターの位置を自動調整します
 * 最大4人までのパーティーを想定しています。
 *
 * 　○
 * 　　　　　○
 * 　○　　　　　　　○
 * 　　　　　○　　　　　　　○
 * 　○　　　　　　　○
 * 　　　　　○
 * 　○
 * 　４人　　３人　　２人　　１人　このように位置が自動調整されます
 * 
 * プラグインパラメータによって隊列全体の位置やアクター間の距離も調整できます。
 * 「CenterAdjustX」「CenterAdjustY」を0にすることで中央寄せ機能をOFFにできます。

 * ※このプラグインをメモ帳などで開き、各数値を直接変更することで
 *　 より細かく位置を調整していただけます。
 *
 *Author ハーリー
 *Version 1.00:2016/7/4
 *Version 1.10:2016/7/4
 *Version 1.20:2016/8/14
 */

(function(){
//プラグインパラメータ
var parameters = PluginManager.parameters('Hurry_ActorSpriteAdjust');
var CenterAdjustX = Number(parameters['CenterAdjustX']);
var CenterAdjustY = Number(parameters['CenterAdjustY']);
var ActorHomeX = Number(parameters['ActorHomeX']);
var ActorHomeY = Number(parameters['ActorHomeY']);
var DistanceX = Number(parameters['DistanceX']);
var DistanceY = Number(parameters['DistanceY']);

//パーティー人数に合わせてSVアクターのスプライト位置変更
Sprite_Actor.prototype.setActorHome = function(index) {
        if($gameParty.battleMembers().length == 1){
	var m = $gameParty.battleMembers().length;
	var x =  ActorHomeX + (4 - m) * CenterAdjustX + index * DistanceX;
	var y =  ActorHomeY + (4 - m) * CenterAdjustY + index * DistanceY;
    	this.setHome(x, y);
}};
})();