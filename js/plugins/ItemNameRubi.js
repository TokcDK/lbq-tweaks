//===============================================
// ItemNameRubi.js 
//===============================================

/*:ja
 * @plugindesc スキル・アイテム・武器・防具名にルビを振るプラグインです。
 * @author 村人A
 *
 * @help
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * バージョン情報
 * 
 * 2020/03/24 1.0リリース
 * 
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * ===================================
 * ヘルプ
 * ===================================
 *　このプラグインにはプラグインコマンドはありません。
 *
 * スキル・アイテム・武器・防具のデータベースにrubiというメタタグを入れ、その後にルビとして表示する文字を入力するとそのアイテム名にルビが振られます。
 * 例えば「木刀」に「ぼくとう」というルビを振りたい場合は
 * <rubi:ぼくとう>
 * と記述して下さい。
 *
 * @param ルビのフォントの大きさ
 * @desc ルビ文字のフォントの大きさを指定します。
 * @default 7
 * @type number
 *
 */
 {
	'use strict';
	
    const parameters = PluginManager.parameters('ItemNameRubi');
	const rubiFontSize = Number(parameters['ルビのフォントの大きさ']);
	
	const _alias_Window_Base_drawItemName = Window_Base.prototype.drawItemName
	Window_Base.prototype.drawItemName = function(item, x, y, width) {
		if (!item){return}
		if (!item.meta){return}
		const rubi = item.meta.rubi;
		if(!rubi){
			_alias_Window_Base_drawItemName.call(this, item, x, y, width)
			return
		} else {
			_alias_Window_Base_drawItemName.call(this, item, x, y+rubiFontSize-1, width)
		}
		width = width || 312;
		const iconBoxWidth = Window_Base._iconWidth + 4;
		this.contents.fontSize = rubiFontSize;
		this.drawText(rubi, x + iconBoxWidth, y-rubiFontSize - 4, width - iconBoxWidth);
		this.contents.fontSize = this.standardFontSize();
	};

	Window_ItemList.prototype.itemRect = function(index) {
		const rect = Window_Selectable.prototype.itemRect.call(this, index)
		rect.y += rubiFontSize;
		return rect;
	};

}