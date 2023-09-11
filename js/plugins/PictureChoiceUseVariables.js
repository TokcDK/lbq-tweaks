//=============================================================================
// PictureChoiceUseVariables.js
//=============================================================================

/*:
 * @plugindesc PictureChoice の画像名を変数で設定可能にします
 * @author tubo
 *
 *
 * @help
 * Credit:
 * This plugin is customize SumRndmDde's plugin.
 *   http://sumrndm.site/
 *
 * 
 * 使用方法：
 * SRD_PictureChoices.js の下に入れてください。
 * /picture[/v[n]] で変数nの文字列を画像名として取得します。
 *
 * 著作権について：
 * 著作権フリーです。好きにしていいです。
 * ただし改造して再配布する場合は、改造実施者と改造箇所を明記してください。
 *
 * 免責事項：
 * このプラグインを利用したことによるいかなる損害も制作者は一切の責任を負いません。
 */

(function () {
    'use strict'
    
    var _Window_PictureChoiceList_commandName = Window_PictureChoiceList.prototype.commandName;
    Window_PictureChoiceList.prototype.commandName = function(index) {
        let name = _Window_PictureChoiceList_commandName.call(this,index);
        name = name.replace(/\\V\[(\d+)\]/gi, function() {
            return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));
       // console.log(name);
        return name;
    };

})();