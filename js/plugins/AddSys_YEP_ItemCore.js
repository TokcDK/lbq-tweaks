
/*:ja
 * @plugindesc YEP_ItemCoreの使用確認をスキップするプラグインです。
 * @author 村人A
 *
 * @help AddSys_YEP_ItemCore.js
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * バージョン情報
 * 
 * 21/08/19 バージョン1.2　リリース
 * 21/08/17 バージョン1.1　リリース
 * 21/05/26 バージョン1.0　リリース
 * 
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * ========================================
 * 以下ヘルプ
 * ========================================
 * 
 * プラグイン管理画面ではYEP_ItemCoreの下に配置してください。
 * 
 * 
 * 
 * 
 * 
 *
 *
 */
 
{
	'use strict';
	
	const _alias_Window_ItemList_isCurrentItemEnabled = Window_ItemList.prototype.isCurrentItemEnabled;
	Window_ItemList.prototype.isCurrentItemEnabled = function() {
		const isNotItem = DataManager.isWeapon(this.item()) || DataManager.isArmor(this.item());
		if(SceneManager._scene.constructor == Scene_Item && isNotItem){return false}
		return _alias_Window_ItemList_isCurrentItemEnabled.call(this);
	};

	Scene_Item.prototype.onItemOk = function() {
		$gameParty.setLastItem(this.item());
		this.determineItem();
	};

}