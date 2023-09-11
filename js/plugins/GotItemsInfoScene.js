//===============================================
// GotItemsInfoScene.js 
//===============================================

/*:ja
 * @plugindesc 入手したアイテムの履歴を表示するこ画面を表示するプラグインです。
 * @author 村人A
 *
 * @help
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * バージョン情報
 * 
 * 2021/05/28 1.21リリース
 * 武器防具入手時に発生する不具合を修正しました。
 * 
 * 2021/05/26 1.2リリース
 * 2列表示にし、スクリプトにて実行された際の不具合を修正しました。
 * 
 * 2020/03/25 1.1リリース
 * アイテムの表示を最後に入手した順に上から表示するようにしました。
 * 
 * 2020/03/24 1.0リリース
 * 
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * ===================================
 * ヘルプ
 * ===================================
 * プラグインコマンドにて「取得アイテム情報画面へ」と記述することによってアイテム
 * 入手履歴画面に行くことができます。
 * 宝箱や他のオブジェクトからのアイテム入手の場合アイテムの増減イベント前にプラグインコマンドにて
 * 
 * 取得アイテムイベント名設定 イベント名
 * 
 * と記述することによって「マップ名のイベント名で入手」とすることができます。
 * 
 * 戦闘で取得した場合は
 * 
 * 敵グループ名　＋　プラグインパラメータ「戦闘で入手した際の文言」
 * 
 * で表示されます。
 * 
 * ショップで取得した場合は
 * 
 * マップ名　＋　プラグインパラメータ「ショップで入手した際の文言」
 * 
 * で表示されます。
 * 
 * プラグインパラメータ「ショップで入手した際の文言」はプラグインパラメータ「ショ
 * ップで入手した際の文言を決める変数のID」に対応した変数の値で決まります。
 * 
 * 
 * 
 * 
 * @param shopText
 * @text ショップで入手した際の文言
 * @desc ショップでアイテムを入手した際にマップ名の後に表示する文言を半角カンマ,を挟んで記述します。変数に対応
 * @default で購入,鑑定結果,ガチャで入手した
 *
 * @param shopTextValId
 * @text ショップで入手した際の文言を決める変数のID
 * @desc 「ショップで入手した際の文言」で決めた文言のどれを表示するかを決める変数のIDを指定します。
 * @default 885
 * @type variable
 *
 * @param inBattleText
 * @text 戦闘で入手した際の文言
 * @desc 戦闘でドロップアイテムにて入手した際に敵グループ名の後に表示する文言を記述します。
 * @default からのドロップ品
 *
 * @param maxListNum
 * @desc アイテム入手履歴画面で表示する最大のアイテム数を半角数字で指定します。
 * @default 50
 * @type number
 *
 * @param itemNameWidth
 * @text アイテム名の幅
 * @desc アイテム名の幅を指定します。アイコンも含めた名前の幅となります。
 * @default 150
 * @type number
 *
 * @param itemNamePadding
 * @text アイテム名と入手場所の余白
 * @desc アイテム名右の入手場所との余白の幅を指定します。
 * @default 10
 * @type number
 *
 *
 */
 {
	'use strict';
	
    const param = PluginManager.parameters('GotItemsInfoScene');
	const getInBattleText     = param.inBattleText;
	const getInShopTextsArr   = param.shopText.split(",");
	const getInShopTextsValId = Number(param.shopTextValId) || 885;
	const itemNameWidth       = Number(param.itemNameWidth) || 150;
	const itemNamePadding     = Number(param.itemNamePadding) || 10;
	const maxGotItemInfoList  = Number(param.maxListNum) || 50;


    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command == "toGotItemsInfoScene" || command == "取得アイテム情報画面へ") {
			SceneManager.push(Scene_GotItemsInfo)
		}
		
        if (command == "setGotItemEventName" || command == "取得アイテムイベント名設定") {
			$gameParty.gotItemEventName = args[0];
		}
	}
	
	
	//-----------------------------------------------------------------------------
	// Scene_GotItemsInfo
	//

	function Scene_GotItemsInfo() {
		this.initialize.apply(this, arguments);
	}

	Scene_GotItemsInfo.prototype = Object.create(Scene_Base.prototype);
	Scene_GotItemsInfo.prototype.constructor = Scene_GotItemsInfo;

	Scene_GotItemsInfo.prototype.initialize = function() {
		Scene_Base.prototype.initialize.call(this);
		this.helpWindowOpen = false;
	};

	Scene_GotItemsInfo.prototype.create = function() {
		Scene_Base.prototype.create.call(this);
		this.createBackground();
		this.createWindows();
	};

	Scene_GotItemsInfo.prototype.createBackground = function() {
		this._backgroundSprite = new Sprite();
		this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
		this.addChild(this._backgroundSprite);
	};

	Scene_GotItemsInfo.prototype.createWindows = function() {
		this.listWindow = new Window_GotItemInfoList();
		this.listWindow.setHandler('ok', this.onListOk.bind(this));
		this.listWindow.setHandler('cancel', this.onListCancel.bind(this));
		this.addChild(this.listWindow);
		this.listWindow.activate();
		this.listHelpWindow = new Window_GotItemInfoHelp()
		this.addChild(this.listHelpWindow);
		this.listWindow.getHelpWindow(this.listHelpWindow)
	}

	Scene_GotItemsInfo.prototype.onListOk = function() {
		const info = $gameParty.gotItemInfo[this.listWindow.index()];
		this.listHelpWindow.updateHelp(info);
		this.listHelpWindow.open();
		this.listHelpWindow.activate();
		this.listWindow.deactivate();
		this.helpWindowOpen = true;
	}

	Scene_GotItemsInfo.prototype.onListCancel = function() {
		SceneManager.pop();
	}
	
	Scene_GotItemsInfo.prototype.update = function() {
		Scene_Base.prototype.update.call(this);
		this.updateHelpWindowCommand();
	}
	
	Scene_GotItemsInfo.prototype.updateHelpWindowCommand = function() {
		if(!this.helpWindowOpen){return};
		if(Input.isTriggered('cancel') || TouchInput.isCancelled()){
			this.listHelpWindow.close();
			this.listHelpWindow.deactivate();
			this.listWindow.activate();
			this.helpWindowOpen = false
		}
	}
	
	//-----------------------------------------------------------------------------
	// Game_Party
	//
	
	const _alias_Game_Party_initialize = Game_Party.prototype.initialize
	Game_Party.prototype.initialize = function() {
		_alias_Game_Party_initialize.call(this);
		this.gotItemInfo = []
	}
	
	const _alias_Game_Party_gainItem = Game_Party.prototype.gainItem
	Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
		_alias_Game_Party_gainItem.call(this, item, amount, includeEquip)
		if(!item){return}
		this.gotItemDevideByScene(item, amount);
	}

	Game_Party.prototype.gotItemDevideByScene = function(item, amount) {
		let where = ""
		switch(SceneManager._scene.constructor.name){
			case "Scene_Boot":
				return;
				break;
			case "Scene_Map":
				if($gameParty.gotItemEventName == ""){console.log("アイテム取得イベント前に取得アイテムイベント名設定が行われていません")};
				where = $dataMap.displayName + "の" + $gameParty.gotItemEventName + "で入手"
				break;
			case "Scene_Shop":
				where = $dataMap.displayName + getInShopTextsArr[$gameVariables.value(getInShopTextsValId)];
				break;
			case "Scene_Battle":
				where = $gameTroop.troop().name + getInBattleText;
				break;
		}
		for(let i = 0; i < amount; i++){
			this.setGotItemInfo(item, where)
		}
	}
	
	Game_Party.prototype.setGotItemInfo = function(item, where) {
		let _item;//変更。アイテムタイプ条件分岐追加
               if(item.itypeId ==3 || item.itypeId ==4){}else{
		if (DataManager.isWeapon(item)) {
			const id = item.baseItemId || item.id
			_item = $dataWeapons[id]
		} else if (DataManager.isArmor(item)) {
			const id = item.baseItemId || item.id
			_item = $dataArmors[id]
		} else {
			_item = $dataItems[item.id]
		}
		if(_item.meta.removeFromGotItemlist){return}
		const obj = {"item" : _item, "where" : where};
		this.gotItemInfo.unshift(obj)
		if(maxGotItemInfoList <= this.gotItemInfo.length){this.gotItemInfo.pop()}
	}}

	//-----------------------------------------------------------------------------
	// Window_GotItemInfoList
	//

	function Window_GotItemInfoList() {
		this.initialize.apply(this, arguments);
	}

	Window_GotItemInfoList.prototype = Object.create(Window_Selectable.prototype);
	Window_GotItemInfoList.prototype.constructor = Window_GotItemInfoList;

	Window_GotItemInfoList.prototype.initialize = function() {
		Window_Selectable.prototype.initialize.call(this, 0, 0, Graphics.width, Graphics.height);
		this.drawAllItems()
		this.select(0);
	}
	
	Window_GotItemInfoList.prototype.maxCols = function() {
		return 2;
	};

	Window_GotItemInfoList.prototype.maxItems = function() {
		return $gameParty.gotItemInfo.length;
	};

	Window_GotItemInfoList.prototype.drawItem = function(index) {
		const info = $gameParty.gotItemInfo[index];
		if (!info) {return};
		const cw = this.contentsWidth()/2
		const rect = this.itemRect(index);
		rect.width -= this.textPadding();
		this.drawItemName(info.item, rect.x, rect.y, itemNameWidth)
		const helpWidth = this.contents.width - itemNameWidth
		const infoX = rect.x + itemNameWidth + itemNamePadding;
		const infoW = cw - itemNameWidth - this.textPadding() - itemNamePadding;
		this.drawText(info.where, infoX, rect.y, infoW);
	}
	
	Window_GotItemInfoList.prototype.getHelpWindow = function(window) {
		this.helpWindow = window;
	}

	//-----------------------------------------------------------------------------
	// Window_GotItemInfoHelp
	//

	function Window_GotItemInfoHelp() {
		this.initialize.apply(this, arguments);
	}

	Window_GotItemInfoHelp.prototype = Object.create(Window_Base.prototype);
	Window_GotItemInfoHelp.prototype.constructor = Window_GotItemInfoHelp;

	Window_GotItemInfoHelp.prototype.initialize = function() {
		Window_Base.prototype.initialize.call(this, (Graphics.width - 600)/2, (Graphics.height - 200)/2, 600, 200);
		this.openness = 0;
	}
	
	Window_GotItemInfoHelp.prototype.updateHelp = function(info) {
		this.contents.clear();
		this.drawItemName(info.item, 0, 0, this.contentsWidth())
		this.drawText(info.where, 0, this.lineHeight(), this.contentsWidth());
		this.drawText(info.item.description, 0, this.lineHeight()*2, this.contentsWidth());
	}
}