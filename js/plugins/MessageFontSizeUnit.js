//=============================================================================
// MessageFontSizeUnit.js
//=============================================================================
/*:
 * @author Thirop
 *
 * @param unit
 * @text フォントサイズ変更単位
 * @desc メッセージ表示の制御文字\}、\{でフォントサイズを変える際の変更単位。
 * @default 6
 *
 */
//============================================================================= 

(function(){
var parameters = PluginManager.parameters('MessageFontSizeUnit');
var unit = Number(parameters['unit'])||6;
Window_Base.prototype.makeFontBigger = function() {
    if (this.contents.fontSize <= 96) {
        this.contents.fontSize += unit;
    }
};

Window_Base.prototype.makeFontSmaller = function() {
    if (this.contents.fontSize >= 24) {
        this.contents.fontSize -= unit;
    }
};

})();