/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

(function() {
    'use strict';

    Game_Interpreter.prototype.sVal = function(a, b) {
        $gameVariables.setValue(a, b);
        return $gameVariables.value(a);
    };

//rpg_windows.js
Window_ChoiceList.prototype.updatePlacement = function() {
    var positionType = $gameMessage.choicePositionType();
    var messageY = this._messageWindow.y;
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    switch (positionType) {
    case 0:
        this.x = 0;
        break;
    case 1:
        this.x = (Graphics.boxWidth - this.width) / 2;
        break;
    case 2:
        this.x = Graphics.boxWidth - this.width;
        break;
    }
    if (messageY >= Graphics.boxHeight / 2) {
        if ($gameSwitches.value(520)){
          this.y = messageY - this.height-50;
        } else {
          this.y = messageY - this.height;
        };
    } else {
        this.y = messageY + this._messageWindow.height;
    }
};
Window_Base.prototype.actorName = function(n) {
    var actor = n >= 1 ? $gameActors.actor(n) : null;
    return actor ? '\x1bC[23]' + actor.name() + '\x1bC[0]': '';
};

Window_Base.prototype.makeFontBigger = function() {
    if (this.contents.fontSize <= 96) {
        this.contents.fontSize += 22;//12
    }
};
Window_Base.prototype.makeFontSmaller = function() {
    if (this.contents.fontSize >= 24) {
        this.contents.fontSize -= 6;//12
    }
};

Window_Message.prototype.windowWidth = function() {
　  return Graphics.boxWidth - $gameVariables.value(311) - valueGraphicsWidth;
};
Window_Message.prototype.updatePlacement = function() {
    this._positionType = $gameMessage.positionType();
    this.y = this._positionType * (Graphics.boxHeight - this.height) / 2;
    this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;
    this.x = 0;//記述追加
    if($gameVariables.value(313) >= 1){
      this.x = $gameVariables.value(313); 
    } else {  //$gameScreen.picture(92) || 
      if($gameSwitches.value(358)){}else{
        if($gameScreen.brightness() == 0){
          this.x = 128;
        } else {
          if($gameMessage.faceName() != '' || $gameScreen.picture(6) || $gameScreen.picture(70)){
            this.x = 0; 
          } else {
            this.x = 128;
          };
        };
      };
    };
};

//rpg_sprites.js
Sprite_Damage.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this._duration = 90;
    this._flashColor = [0, 0, 0, 0];
    this._flashDuration = 0;
    this._damageBitmap = ImageManager.loadSystem($gameSwitches.value(211) ? 'Damage2' : 'Damage');
};

//rpg_scenes
Scene_Status.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this._statusWindow = new Window_Status();
    this._statusWindow.setHandler('ok',   this.nextPageOpenok.bind(this));
    this._statusWindow.setHandler('cancel',   this.popScene.bind(this));
    this._statusWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._statusWindow.setHandler('pageup',   this.previousActor.bind(this));
    this._statusWindow.reserveFaceImages();
    this.addWindow(this._statusWindow);
};

Scene_Status.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this.refreshActor();
};

Scene_Status.prototype.refreshActor = function() {
    WindowManager.hideAll();
    valueStatusSet1 = 0;
    var actor = this.actor();
    this._statusWindow.setActor(actor);
};

Scene_Status.prototype.onActorChange = function() {
    WindowManager.hideAll();
    valueStatusSet1 = 0;
    this.refreshActor();
    this._statusWindow.activate();
};

Scene_Status.prototype.nextPageOpenok = function() {
    if(valueStatusSet1 == 0){
      var actor = this.actor();
      $gameVariables.setValue(20,actor.actorId());
      battle_xsarStatas(20);
      valueStatusSet1 = 1;
    } else {
      WindowManager.hideAll();
      valueStatusSet1 = 0;
    };
    this._statusWindow.activate();
};

//rpg_scenes.js
Scene_Battle.prototype.startActorCommandSelection = function() {
if(!Input.isRepeated("ok")){
  if(ConfigManager.battleAniSpeed >= 3){
    if(!$gameSwitches.value(131)){ //立ち絵禁止のスイッチで条件分岐
      tachie_syoukyo1($gameVariables.value(300));
      $gameVariables.setValue(20,BattleManager.actor().actorId());
        if($gameVariables.value(263) >= 2){
          tachie_settei3(BattleManager.actor());
        };
        tachie_hyouji2(BattleManager.actor());
}}};
    this._statusWindow.select(BattleManager.actor().index());
    this._partyCommandWindow.close();
    this._actorCommandWindow.setup(BattleManager.actor());
if (Imported.MOG_BattleHud) {
  if (!this._hudField) {
    this.createHudField()
    this.createBattleHudSB();
  };
};
};

//rpg_managers.js
BattleManager.selectNextCommand = function() {
    do {
        if (!this.actor() || !this.actor().selectNextCommand()) {
            this.changeActor(this._actorIndex + 1, 'waiting');
            if (this._actorIndex >= $gameParty.size()) {
if(!$gameSwitches.value(131)){ //立ち絵禁止のスイッチで条件分岐
  tachie_syoukyo1($gameVariables.value(300));
};
if($gameScreen.picture(50)){$gameScreen.erasePicture(50)};//時刻表示を消去
var scene = SceneManager._scene;
if (scene._gabWindow) scene.clearGabWindow();
                this.startTurn();
                break;
            }
        }
    } while (!this.actor().canInput());
};

/*:
BattleManager.checkAbort = function() {
    if ($gameParty.isEmpty() || this.isAborting()) {
//        SoundManager.playEscape();
//        this._escaped = true;
        this.processAbort();
    }
    return false;
};
Game_Actor.prototype.changeEquipById = function(etypeId, itemId) {
    var slotId = etypeId - 1;
    if (this.equipSlots()[slotId] === 1) {
        this.changeEquip(slotId, $dataWeapons[itemId]);
    } else {
        this.changeEquip(slotId, $dataArmors[itemId]);
    }
};
*/

ImageManager.loadBattleback2 = function(filename, hue) {
    return this.loadBitmap('img/parallaxes/', filename, hue, true);//変更
};

ImageManager.loadBattleback1 = function(filename, hue) {
    return this.loadBitmap('img/parallaxes/', filename, hue, true);//変更
};

Window_NumberInput.prototype.isCancelEnabled = function() {
    return true;
};

Window_NumberInput.prototype.processCancel = function() {
  if($gameSwitches.value(56)){
    $gameSwitches.setValue(56,false);
    SoundManager.playCancel();
    this._messageWindow.terminateMessage();
    this.updateInputData();
    this.deactivate();
    this.close();
  };
};

Scene_Equip.prototype.onItemOk = function() {
    SoundManager.playEquip();
    this.actor().changeEquip(this._slotWindow.index(), this._itemWindow.item());
    passive_addCondition(this.actor());//パッシブ
    title_battleUp(this.actor());//タイトル
    this._slotWindow.activate();
    this._slotWindow.refresh();
    this._itemWindow.deselect();
    this._itemWindow.refresh();
    this._statusWindow.refresh();
};

  DataManager.makeSavefileInfo = function () {
    const info = {};
    info.globalId = this._globalId;
    info.title = $dataSystem.gameTitle;
    info.characters = $gameParty.charactersForSavefile();
    info.faces = $gameParty.facesForSavefile();
    info.playtime = $gameSystem.playtimeText();
    info.timestamp = Date.now();
    info.saveString = $gameVariables.value(87);
    return info;
  };

  Window_SavefileList.prototype.drawGameTitle = function (info, x, y, width) {
    this.drawText(info.saveString, x, y, width);
  };

Game_Map.prototype.updateEvents = function() {
  const events = this.events();
  const len = events.length;
  // Use direct indexing instead of forEach for better performance
  for (let i = 0; i < len; i++) {
    const event = events[i];
    // Only update events that are near the player
    if (event.isNearThePlayer()) {
      event.update();
    }
  }
  
  // Common events always update regardless of position
  const commonEvents = this._commonEvents;
  const commonLen = commonEvents.length;
  for (let j = 0; j < commonLen; j++) {
    commonEvents[j].update();
  }
};

//Game_SelfSwitches.prototype.onChange = function(eventId) {
//   if($gameMap.event(eventId)) $gameMap.event(eventId).refresh();
//};

const ARRAY_1to15 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
Window_SkillType.prototype.updateHelp = function() {
  const itemdata = $dataWeapons[ARRAY_1to15[this.currentExt() - 1]]; //アイテムIDのデータを拾って
  this._helpWindow.setItem(itemdata) //ヘルプウィンドウに表示させる
};

Scene_Skill.prototype.createSkillTypeWindow = function() {
    var wy = this._helpWindow.height;
    this._skillTypeWindow = new Window_SkillType(0, wy);
    this._skillTypeWindow.setHelpWindow(this._helpWindow);
    this._skillTypeWindow.setHandler('skill',    this.commandSkill.bind(this));
    this._skillTypeWindow.setHandler('cancel',   this.popScene.bind(this));
    this._skillTypeWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._skillTypeWindow.setHandler('pageup',   this.previousActor.bind(this));
    this.addWindow(this._skillTypeWindow);
    this._skillTypeWindow.updateHelp; //実際に処理に加える
};

Game_CharacterBase.prototype.realMoveSpeed = function() {
  return this._moveSpeed + (this.isDashing() ? $gameVariables.value(83) : 0);
};

//Window_BattleStatus.prototype.initialize = function() {
    //var width = this.windowWidth()-300;
    //var height = this.windowHeight();
    //var x = Graphics.boxWidth - width;
    //var y = Graphics.boxHeight - height;
    //Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    //this.refresh();
    //this.openness = 0;
//};

Game_Unit.prototype.luklity = function() {
    const members = this.members();
    if (members.length === 0) {
        return 1;
    }
    const sum = members.reduce(function(r, member) {
        return r + member.luk;
    }, 0);
    return sum / members.length;
};

  const windowEventItemStart = Window_EventItem.prototype.start;
  Window_EventItem.prototype.start = function () {
    this.initializeWidth();
    windowEventItemStart.call(this);
  };

  Window_EventItem.prototype.initializeWidth = function() {
    const isDefaultWidth = this.isDefaultSize();
    const switchOn = $gameSwitches.value(111);
    
    if (isDefaultWidth && switchOn) {
      this.width = this.defaultWidth() / 2 - $gameVariables.value(338);
    } else if (!isDefaultWidth && !switchOn) {
      this.width = this.defaultWidth();
    }
  };

  Window_EventItem.prototype.maxCols = function () {
    return $gameSwitches.value(400) ? 1 : 2;
  };

  Window_EventItem.prototype.defaultWidth = function () {
    return Graphics.boxWidth;
  };

  Window_EventItem.prototype.isDefaultSize = function () {
    return this.width === this.defaultWidth();
  };

/*:
//負荷が掛かり過ぎるため没
// Common Event
const game_Interpreter_command117 = Game_Interpreter.prototype.command117;
Game_Interpreter.prototype.command117 = function() {
    $gameVariables.setValue(201, this._params[0]); // 変数番号201番にコモンイベントIDを記録する。
    return Game_Interpreter_command117.call(this);
};
*/

BattleManager.makeRewards = function() {
    this._rewards = {};
    this._rewards.gold = Math.ceil($gameTroop.goldTotal() * valueTotalgold);
    this._rewards.exp = Math.ceil($gameTroop.expTotal() * valueTotalexp);
    this._rewards.items = $gameTroop.makeDropItems();
};

  //モーション制御
  Sprite_Actor.prototype.updateMotionCount = function() {
    if (!this._motion) return;
    
    if (++this._motionCount >= this.motionSpeed()) {
      this._motionCount = 0;
      
      // Check for max pattern limit first
      if (this._maxPattern !== undefined && this._pattern === this._maxPattern) {
        this.refreshMotion();
        return;
      }
      
      // Handle pattern updates with minimal branching
      if (this._motion.loop) {
        this._pattern = (this._pattern + 1) % 4;
      } else if (this._pattern < 2) {
        this._pattern++;
      } else {
        this.refreshMotion();
      }
    }
  };

  const updatePatternAlias = Sprite_Weapon.prototype.updatePattern
  Sprite_Weapon.prototype.updatePattern = function () {
    if (this.parent._maxPattern && this._pattern === this.parent._maxPattern) {
      return;
    }
    updatePatternAlias.call(this);
  };

  const refreshMotionAlias = Sprite_Actor.prototype.refreshMotion
  Sprite_Actor.prototype.refreshMotion = function () {
    if (this._actor && this._maxPattern && this._pattern === this._maxPattern) {
      return;
    }
    refreshMotionAlias.call(this)
  }

Sprite_Actor.prototype.setMaxFrame = function(num) {
    this._maxPattern = num;
}

Sprite_Actor.prototype.removeMaxFrame = function() {
    delete this._maxPattern
}

Sprite_Actor.prototype.setFrame = function(motion, num) {
  // Use direct comparison instead of loose equality
  if (motion === "attack") {
    this._actor.performAttack();
    
    // if (this.hasOwnProperty("_weaponSprite")) but in optimized we check wpn which will be undefined if the property is not exist
    // Only access weaponSprite if attack motion and optimize property check
    const wpn = this._weaponSprite;
    if (wpn) {
      wpn._pattern = num - 1;
      wpn._motionCount = 0;
      wpn.updatePattern();
    }
  } else {
    this._actor.requestMotion(motion);
  }
  
  // Set these properties unconditionally to avoid duplicate assignments
  this._pattern = num;
  this._motionCount = 0;
  this.setMaxFrame(num);
}

})()

