
/*:ja
 * @plugindesc FavouriteEquipsの機能を装備画面に導入するプラグインです。
 * @author 村人A
 *
 * @help AddFavouriteEquipsToEquipScene.js
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * バージョン情報
 * 
 * 21/05/27 バージョン1.1　リリース
 * Ticker.jsのホップアップウィンドウを適用
 * 
 * 21/05/26 バージョン1.0　リリース
 * 
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * ========================================
 * 以下ヘルプ
 * ========================================
 * 
 * プラグイン管理画面ではFTKR_CustomSimpleActorStatus、FavouriteEquips,Ticker.jsの下に配置してください。
 * 装備記憶枠名称の初期値はプラグインパラメータにて設定してください。
 * プラグインコマンドで装備記憶枠名称を変更する場合
 * 
 * 装備記憶枠名称変更 変更する記憶枠番号 新しい名称
 * 
 * と記述してください。
 * スクリプトにて行う場合
 * 
 * $gameSystem.changeSaveEquipCommandName(変更する記憶枠番号 新しい名称);
 * 
 * と記述してください。
 * 
 * 装備画面の装備保存＆読込のコマンドもプラグインコマンドにて指定可能です。
 * 
 * 
 * @param saveEquipName
 * @text 装備記憶コマンドテキスト
 * @desc 装備画面の装備を記憶させるコマンドとして表示するテキストを指定します。
 * @default 装備保存
 *
 * @param loadEquipName
 * @text 装備読み込みコマンドテキスト
 * @desc 装備画面の装備を読み込むコマンドとして表示するテキストを指定します。
 * @default 装備読込
 *
 * @param saveEquipCommandName1
 * @text 装備記憶枠名称１
 * @desc 装備記憶枠名称１番目のデフォルト名を指定します。
 * @default 装備記憶枠名称１
 *
 * @param saveEquipCommandName2
 * @text 装備記憶枠名称２
 * @desc 装備記憶枠名称２番目のデフォルト名を指定します。
 * @default 装備記憶枠名称２
 *
 * @param saveEquipCommandName3
 * @text 装備記憶枠名称３
 * @desc 装備記憶枠名称３番目のデフォルト名を指定します。
 * @default 装備記憶枠名称３
 *
 * @param saveEquipCommandName4
 * @text 装備記憶枠名称４
 * @desc 装備記憶枠名称４番目のデフォルト名を指定します。
 * @default 装備記憶枠名称４
 *
 * @param saveEquipCommandName5
 * @text 装備記憶枠名称５
 * @desc 装備記憶枠名称５番目のデフォルト名を指定します。
 * @default 装備記憶枠名称５
 *
 * @param saveEquipCommandName6
 * @text 装備記憶枠名称６
 * @desc 装備記憶枠名称６番目のデフォルト名を指定します。
 * @default 装備記憶枠名称６
 *
 * @param saveEquipCommandName7
 * @text 装備記憶枠名称７
 * @desc 装備記憶枠名称７番目のデフォルト名を指定します。
 * @default 装備記憶枠名称７
 *
 * @param saveEquipCommandName8
 * @text 装備記憶枠名称８
 * @desc 装備記憶枠名称８番目のデフォルト名を指定します。
 * @default 装備記憶枠名称８
 *
 * @param saveEquipCommandName9
 * @text 装備記憶枠名称９
 * @desc 装備記憶枠名称９番目のデフォルト名を指定します。
 * @default 装備記憶枠名称９
 *
 *
 */
 
{
	'use strict';
	
	const param = PluginManager.parameters('AddFavouriteEquipsToEquipScene');
	const saveEquipName = param.saveEquipName;
	const loadEquipName = param.loadEquipName;
	let saveEquipCommandNameArray = []
	//for(let i = 1; i < 9; i++){
	for(let i = 0; i < 9; i++){
		saveEquipCommandNameArray.push(param["saveEquipCommandName"+(i+1)]);
	}
	
    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command == "装備記憶枠名称変更") {
			$gameSystem.changeSaveEquipCommandName(Number(args[0]), args[1]);
		}
	}
	
	//-----------------------------------------------------------------------------
	// Game_System
	//
	
	const _alias_Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_alias_Game_System_initialize.call(this);
		this.saveEquipCommandNameArray = saveEquipCommandNameArray;
	}

	Game_System.prototype.changeSaveEquipCommandName = function(index, name) {
		this.saveEquipCommandNameArray[index-1] = name;
		
	}
	
	//-----------------------------------------------------------------------------
	// Scene_Equip
	//
	
	const _alias_Scene_Equip_createCommandWindow = Scene_Equip.prototype.createCommandWindow;
	Scene_Equip.prototype.createCommandWindow = function() {
		_alias_Scene_Equip_createCommandWindow.call(this);
		this._commandWindow.setHandler('equipSave', this.commandEquipSave.bind(this));
		this._commandWindow.setHandler('equipLoad', this.commandEquipLoad.bind(this));
	};
	
	Scene_Equip.prototype.commandEquipSaveLoadCommonPros = function() {
		this._savedEquipNameWindow.select(0)
		this._savedEquipNameWindow.activate();
		this._savedEquipsListWindow.visible = true;
		this._savedEquipNameWindow.visible = true;
		this._slotWindow.visible = false;
		this._compareWindow.visible = false;
	}
	
	//=====Ticker対策======
	
	const _alias_WindowLayer_removeChild = WindowLayer.prototype.removeChild;
	WindowLayer.prototype.removeChild = function(win) {
		if(SceneManager._scene.constructor == Scene_Equip && win.constructor.name == "Window_Ticker"){
			SceneManager._scene.removeChild(win)
		} else {
			_alias_WindowLayer_removeChild.call(this, win);
		}
	}

	Scene_Base.prototype.createWindowLayer = function() {
		var width = Graphics.boxWidth;
		var height = Graphics.boxHeight;
		var x = (Graphics.width - width) / 2;
		var y = (Graphics.height - height) / 2;
		this._windowLayer = new WindowLayer();
		this._windowLayer.move(x, y, width, height);
		this.addChild(this._windowLayer);
	};

	const _alias_Scene_Equip_addWindow = Scene_Equip.prototype.addWindow;
	Scene_Equip.prototype.addWindow = function(win) {
		if(win.constructor.name == "Window_Ticker"){
			this.addChild(win)
		} else {
			_alias_Scene_Equip_addWindow.call(this, win);
		}
	}
	
	//===========
	
	Scene_Equip.prototype.commandEquipSave = function() {
		this.commandEquipSaveLoadCommonPros();
		this._isEquipSave = true;
	}

	Scene_Equip.prototype.commandEquipLoad = function() {
		this.commandEquipSaveLoadCommonPros();
		this._isEquipSave = false;
	}
	
	const _alias_Scene_Equip_create = Scene_Equip.prototype.create;
	Scene_Equip.prototype.create = function() {
		_alias_Scene_Equip_create.call(this);
		this.createSavedEquipsListWindow();
		this.createSavedEquipNameWindow();
	}
	
	Scene_Equip.prototype.createSavedEquipsListWindow = function() {
		const w = this._compareWindow;
		this._savedEquipsListWindow = new Window_SavedEquipsListWindow(w.x, w.y, w.width, w.height)
		this.addChild(this._savedEquipsListWindow);
	}

	Scene_Equip.prototype.createSavedEquipNameWindow = function() {
		const w = this._slotWindow;
		this._savedEquipNameWindow = new Window_SavedEquipName(w.x, w.y, w.width, w.height)
		for(let i = 0; i < 9; i++){
			this._savedEquipNameWindow.setHandler('savedEquips' + i, this.commandSavedEquips.bind(this, i));
		}
		this._savedEquipNameWindow.setHandler('cancel', this.commandEquipSaveLoadCancel.bind(this));
		this.addChild(this._savedEquipNameWindow);
		this._savedEquipNameWindow.setListWindow(this._savedEquipsListWindow);
	}

	Scene_Equip.prototype.commandSavedEquips = function(index) {
		if(this._isEquipSave){
			this.actor().setFavouriteEquip(index+1);
			TickerManager.show(this.actor().name() + "は" + $gameSystem.saveEquipCommandNameArray[index] + "にセーブした。");//saveEquipName
		} else {
			this.actor().restoreFavouriteEquip(index+1);
			TickerManager.show(this.actor().name() + "は" + $gameSystem.saveEquipCommandNameArray[index] + "をロードした。")
		}
		this._slotWindow.refresh();
		this._savedEquipNameWindow.refreshListWindow();
		this._savedEquipNameWindow.activate();
	}

	Scene_Equip.prototype.commandEquipSaveLoadCancel = function() {
		this._savedEquipNameWindow.deactivate();
		this._commandWindow.activate();
		this._savedEquipsListWindow.visible = false;
		this._savedEquipNameWindow.visible = false;
		this._slotWindow.visible = true;
		this._compareWindow.visible = true;
	}
	
	//-----------------------------------------------------------------------------
	// Window_SavedEquipsListWindow
	//
	
	function Window_SavedEquipsListWindow() {
		this.initialize.apply(this, arguments);
	}

	Window_SavedEquipsListWindow.prototype = Object.create(Window_EquipSlot.prototype);
	Window_SavedEquipsListWindow.prototype.constructor = Window_SavedEquipsListWindow;

	Window_SavedEquipsListWindow.prototype.initialize = function(x, y, width, height) {
		Window_EquipSlot.prototype.initialize.call(this, x, y, width, height);
		this.visible = false;
	};
	
	Window_SavedEquipsListWindow.prototype.refresh = function(index) {
		this._actor = SceneManager._scene.actor();
		const list = this._actor.getFavouriteEquip(index+1);
		this.contents.clear();
		for(let i = 0; i < this._actor.equipSlots().length; i++){
			const rect = this.itemRectForText(i);
			this.changeTextColor(this.systemColor());
			this.drawText(this.slotName(i), rect.x, rect.y, 138, this.lineHeight());
			if(list)this.drawItemName(list[i], rect.x + 138, rect.y);
			this.changePaintOpacity(true);
		}
	}
	
	//-----------------------------------------------------------------------------
	// Window_SavedEquipName
	//
	
	function Window_SavedEquipName() {
		this.initialize.apply(this, arguments);
	}

	Window_SavedEquipName.prototype = Object.create(Window_Command.prototype);
	Window_SavedEquipName.prototype.constructor = Window_SavedEquipName;

	Window_SavedEquipName.prototype.initialize = function(x, y, width, height) {
		this._width = width;
		this._height = height;
		this.clearCommandList();
		this.makeCommandList();
		var width = this.windowWidth();
		var height = this.windowHeight();
		Window_Selectable.prototype.initialize.call(this, x, y, width, height);
		this.refresh();
		this.select(-1);
		this.deactivate();
		this.visible = false;
	};

	Window_SavedEquipName.prototype.setListWindow = function(win) {
		this._listWindow = win;
	}
	
	Window_SavedEquipName.prototype.refreshListWindow = function() {
		this._listWindow.refresh(this.index());
	}
	
	Window_SavedEquipName.prototype.select = function(index) {
		Window_Command.prototype.select.call(this, index);
		if(index >= 0){this.refreshListWindow()};
	}
	
	Window_SavedEquipName.prototype.makeCommandList = function() {
		for(let i = 0; i < 8; i++){
			this.addCommand($gameSystem.saveEquipCommandNameArray[i], 'savedEquips' + i);
		}
	};

	Window_SavedEquipName.prototype.windowWidth = function() {
		return this._width;
	};

	Window_SavedEquipName.prototype.windowHeight = function() {
		return this._height;
	};

	//-----------------------------------------------------------------------------
	// Window_EquipCommand
	//
	
	const _alias_Window_EquipCommand_makeCommandList = Window_EquipCommand.prototype.makeCommandList;
	Window_EquipCommand.prototype.makeCommandList = function() {
		_alias_Window_EquipCommand_makeCommandList.call(this);
		this.addCommand(saveEquipName, 'equipSave');
		this.addCommand(loadEquipName, 'equipLoad');
	}


}


















