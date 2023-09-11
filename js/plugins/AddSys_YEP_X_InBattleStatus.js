
/*:ja
 * @plugindesc YEP_X_InBattleStatusの機能を拡張するプラグインです。
 * @author 村人A
 *
 * @help AddSys_YEP_X_InBattleStatus.js
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * バージョン情報
 * 
 * 21/05/27 バージョン1.0　リリース
 * 敵ステータスが表示されていない不備を修正
 * YEP_CoreEngine.jsとの競合を修正
 * 敵顔グラが読み込まれない現象への対策
 * 
 * 21/05/26 バージョン1.0　リリース
 * 
 * _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 * 
 * ========================================
 * 以下ヘルプ
 * ========================================
 * 
 * プラグイン管理画面では
 * YEP_CoreEngine.js
 * YEP_X_InBattleStatus
 * の下に配置してください。
 * 
 *
 * @param enemyValidSwitch
 * @text 敵ステータス参照可能スイッチID
 * @desc 敵ステータスを見ることができるようにするスイッチIDを指定します。スイッチがONで見ることができるように、OFFで見れなくなります。
 * @default 5
 * @type switch
 *
 */
 
{
	'use strict';
	
    const param = PluginManager.parameters('AddSys_YEP_X_InBattleStatus');
	const enemyValidSwitch = Number(param.enemyValidSwitch);
	
	
	//-----------------------------------------------------------------------------
	// Game_Enemy
	//
	
	Game_Enemy.prototype.maxLevel = function() {
		return 999;
	}
	
	Game_Troop.prototype.appearingMember = function(troopId) {
		return this.members().filter(enemy => !enemy._hidden)
	}

	//-----------------------------------------------------------------------------
	// Scene_Battle
	//
	
	const _alias_Scene_Battle_commandInBattleStatus = Scene_Battle.prototype.commandInBattleStatus;
	Scene_Battle.prototype.commandInBattleStatus = function() {
		this._inBattleStatusWindow.isEnemySide = false;
		_alias_Scene_Battle_commandInBattleStatus.call(this);
	}

	//-----------------------------------------------------------------------------
	// Window_InBattleStateList
	//
	
	const _alias_Window_InBattleStateList_update = Window_InBattleStateList.prototype.update;
	Window_InBattleStateList.prototype.update = function() {
		_alias_Window_InBattleStateList_update.call(this);
		this.updateShiftSide();
	}
	
	Window_InBattleStateList.prototype.updateShiftSide = function() {//変更。効果音とok選択肢設定
              if(valueInBattleStatus == 1){
		if (Input.isTriggered('pageup') || Input.isTriggered('pagedown')) {
		  if($gameSwitches.value(enemyValidSwitch)){
			this.toggleSide();
                  } else {
                        AudioManager.playSe({"name":'Buzzer1',"volume":50,"pitch":150,"pan":0});
                        //TickerManager.show('情報が無いためエネミーステータスは確認できません。');
                  };
		}
                if (Input.isTriggered('ok')) {
                  this.nextPageOpenokB()
                };
              };
	}
	
	Window_InBattleStateList.prototype.toggleSide = function() {
		SoundManager.playCursor();
		this.setBattler(this._parentWindow.setToggle());
	}

	Window_InBattleStateList.prototype.nextPageOpenokB = function() {//変更。要素追加
		const isEnemy = this._parentWindow.isEnemySide
                  if(isEnemy){}else{
		    SoundManager.playCursor();
                  };
                  if(valueStatusSet1 == 0){
                    if(isEnemy){
                      if(this._battler.isStateAffected(485)){
                        SceneManager._scene._helpWindow.hide();
                        SceneManager._scene._inBattleStatusWindow.hide();
                        SceneManager._scene._inBattleStateList.hide();
                        battle_xsarStatas(this._battler.index());
                        valueStatusSet1 = 1;
                      };
                    }else{
                      SceneManager._scene._helpWindow.hide();
                      SceneManager._scene._inBattleStatusWindow.hide();
                      SceneManager._scene._inBattleStateList.hide();
                      $gameVariables.setValue(20,this._battler.actorId());
                      battle_xsarStatas(20);
                      valueStatusSet1 = 1;
                    };
                  } else {
                    SceneManager._scene._inBattleStatusWindow.show();
                    SceneManager._scene._inBattleStateList.show();
                    SceneManager._scene._helpWindow.show();
                    WindowManager.hideAll();
                    valueStatusSet1 = 0;
                  };
	}
	
	Window_InBattleStateList.prototype.updateLeftRight = function() {
		const isEnemy = this._parentWindow.isEnemySide
		const member = isEnemy ? $gameTroop.appearingMember() : $gameParty.battleMembers();
		var index = member.indexOf(this._battler);
		var current = index;
		if (Input.isRepeated('left')) {
			index -= 1;
		} else if (Input.isRepeated('right')) {
			index += 1;
		}
		index = index.clamp(0, member.length - 1);
		if (current !== index) {
			var battler = member[index];
			this.setBattler(battler);
			SoundManager.playCursor();
		}
	};
	
	//-----------------------------------------------------------------------------
	// Window_InBattleStatus
	//
	
	const _alias_Window_InBattleStatus_initialize = Window_InBattleStatus.prototype.initialize;
	Window_InBattleStatus.prototype.initialize = function() {
		_alias_Window_InBattleStatus_initialize.call(this)
		this.isEnemySide = false;
	}

	Window_InBattleStatus.prototype.setToggle = function() {
		this.isEnemySide = !this.isEnemySide;
		const battler = this.isEnemySide ? $gameTroop.appearingMember()[0] : $gameParty.battleMembers()[0];
		this.setBattler(battler);
		return battler;
	}
	
	Window_InBattleStatus.prototype.drawEnemySimpleStatus = function(actor, x, y, width) {
		const lineHeight = this.lineHeight();
		const xpad = Window_Base._faceWidth + (2 * Yanfly.Param.TextPadding);
		const x2 = x + xpad;
		const width2 = Math.max(180, width - xpad - this.textPadding());
		this.drawActorName(actor, x, y, 280);
		this.drawActorLevel(actor, x, y + lineHeight * 1);
		this.drawActorIcons(actor, x, y + lineHeight * 2);
		this.drawActorHp(actor, x2, y + lineHeight * 1, width2);
		this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
		this.drawActorTp(actor, x2, y + lineHeight * 3, width2);
	};

	const _alias_Window_InBattleStatus_refresh = Window_InBattleStatus.prototype.refresh;
	Window_InBattleStatus.prototype.refresh = function() {
		this.contents.clear();
		if (!this._battler) return;
		if(this.isEnemySide){
			const enemy = this._battler.enemy();
			const meta = this._battler.enemy().meta
			if(!meta || !meta.enemyface){
				throw new Error("敵データベースメモ欄にenemyfaceの記述がありません。")
			}
			const x = this.standardPadding() + eval(Yanfly.Param.IBSStatusListWidth);
			const faceInfo = meta.enemyface.split(",");
			const _this = this;
			const loadCallback = () => {
				_this.drawFace(faceInfo[0], Number(faceInfo[1]), x, 0, Window_Base._faceWidth);
			}
			this.promiseLoadBitmap("loadFace", faceInfo[0], loadCallback)
			let x2 = x + Window_Base._faceWidth + this.standardPadding();
			let w = this.contents.width - x2;
			this.drawEnemySimpleStatus(this._battler, x2, 0, w);
			w = this.contents.width - x;
			var y = Math.ceil(this.lineHeight() * 4.5);
			var h = this.contents.height - y;
			if (h >= this.lineHeight() * 6) {
				for (var i = 2; i < 8; ++i) {
					this.drawParam(i, x, y, w, this.lineHeight());
					y += this.lineHeight();
				}
			} else {
				w = Math.floor(w / 2);
				x2 = x;
				for (var i = 2; i < 8; ++i) {
					this.drawParam(i, x2, y, w, this.lineHeight());
					if (i % 2 === 0) {
						x2 += w;
					} else {
						x2 = x;
						y += this.lineHeight();
					}
				}
			}
		} else {
			_alias_Window_InBattleStatus_refresh.call(this);
		}
	};

	Window_InBattleStatus.prototype.promiseLoadBitmap = function(imf, imgName, loadCallback) {
		if(!imgName || imgName == ""){
			throw new Error("画像名が不正です。画像名：" + imgName)
		}
		
		let b = ImageManager[imf](imgName);
		function load() {
			return new Promise((resolve, reject) => {
				setTimeout(function() {
					b = ImageManager[imf](imgName);
					resolve();
				}, 3);
			});
		}

		function load_func() {
			if (b.width > 1) {
				return Promise.resolve();
			} else {
				return load().then(n => {
					return load_func();
				});
			}
		}

		load_func().then(num => {
			loadCallback.call(this);
		});
	}
	

}
