//=============================================================================
// StartSymbol.js
//=============================================================================

/*:ja
 * @plugindesc ver1.00 メニューを開いたときのカーソル位置。
 * @author まっつＵＰ
 * 
 * @param symbolvalue
 * @desc コマンドのシンボルを格納するための
 * ゲーム変数のID
 * @default 10
 *
 * @help
 * 
 * RPGで笑顔を・・・
 * 
 * このヘルプとパラメータの説明をよくお読みになってからお使いください。
 * 
 * 次にメニューを開いたときに変数の値と一致する
 * シンボルを持つコマンドにカーソルを合わせます。
 * このカーソルを合わせた後パラメータで指定した変数の値は0にします。
 * 
 * 主にコモンイベントをメニューにバインドしている時などに
 * 再びメニューを開くときに効果的です。
 * その時は、コモンイベントの実行内容に
 * ◆変数の操作：#0010 = Window_MenuCommand._lastCommandSymbol
 * と変数に代入するのがよいでしょう。
 * 
 * このプラグインを利用する場合は
 * readmeなどに「まっつＵＰ」の名を入れてください。
 * また、素材のみの販売はダメです。
 * 上記以外の規約等はございません。
 * もちろんツクールMVで使用する前提です。
 * 何か不具合ありましたら気軽にどうぞ。
 *  
 * 免責事項：
 * このプラグインを利用したことによるいかなる損害も制作者は一切の責任を負いません。
 * 
 */

(function() {
    
var parameters = PluginManager.parameters('StartSymbol');
var SSsymbolvalue = Number(parameters['symbolvalue'] || 10);

var _Window_MenuCommand_initCommandPosition = Window_MenuCommand.initCommandPosition;
Window_MenuCommand.initCommandPosition = function() {
    _Window_MenuCommand_initCommandPosition.call(this);
    this._lastCommandSymbol = $gameVariables.value(SSsymbolvalue);
    $gameVariables.setValue(SSsymbolvalue, 0);
};
 
})();
