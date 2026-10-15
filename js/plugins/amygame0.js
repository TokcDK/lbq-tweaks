/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

(function () {
  'use strict';

  Game_Interpreter.prototype.sVal = function (a, b) {
    $gameVariables.setValue(a, b);
    return $gameVariables.value(a);
  };

  //rpg_windows.js
  Window_ChoiceList.prototype.updatePlacement = function() {    
    // Set dimensions once
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    
    // Set x position based on positionType with direct assignment
    const positionType = $gameMessage.choicePositionType();
    if (positionType === 0) {
      this.x = 0;
    } else if (positionType === 1) {
      this.x = (Graphics.boxWidth - this.width) / 2;
    } else {
      this.x = Graphics.boxWidth - this.width;
    }
    
    // Calculate y position
    const messageWindow = this._messageWindow;
    const messageY = messageWindow.y;
    const isLowerHalf = messageY >= Graphics.boxHeight / 2;
    if (isLowerHalf) {
      // Cache switch value to avoid multiple lookups
      this.y = messageY - this.height - ($gameSwitches.value(520) ? 50 : 0);
    } else {
      this.y = messageY + messageWindow.height;
    }
  };

  Window_Base.prototype.actorName = function (n) {
    var actor = n >= 1 ? $gameActors.actor(n) : null;
    return actor ? '\x1bC[23]' + actor.name() + '\x1bC[0]' : '';
  };

  Window_Base.prototype.makeFontBigger = function () {
    if (this.contents.fontSize <= 96) {
      this.contents.fontSize += 22;//12
    }
  };
  Window_Base.prototype.makeFontSmaller = function () {
    if (this.contents.fontSize >= 24) {
      this.contents.fontSize -= 6;//12
    }
  };

  Window_Message.prototype.windowWidth = function () {
    return Graphics.boxWidth - $gameVariables.value(311) - valueGraphicsWidth;
  };
  Window_Message.prototype.updatePlacement = function() {
    
    // Set position type and calculate y position once
    const positionType = $gameMessage.positionType();
    this._positionType = positionType;
    this.y = positionType * (Graphics.boxHeight - this.height) / 2;
    
    // Update gold window position
    this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;    
    
    // Use early returns for better performance
    // PERF: read variable 313 once instead of twice.
    const messageX = $gameVariables.value(313);
    if (messageX >= 1) {
      this.x = messageX;
      return;
    }
    else {
      // Default x position
      this.x = 0;
    }
    
    // Skip processing if switch 358 is ON
    if ($gameSwitches.value(358)) {
      return;
    }

    const gameScreen = $gameScreen;
    // Set x based on screen brightness
    if (gameScreen.brightness() === 0) {
      this.x = 128;
      return;
    }
    
    // Final condition check with cached face name
    this.x = ($gameMessage.faceName() !== '' || 
             gameScreen.picture(6) || 
             gameScreen.picture(70)) ? 0 : 128;
  };

  //rpg_sprites.js
  Sprite_Damage.prototype.initialize = function () {
    Sprite.prototype.initialize.call(this);
    this._duration = 90;
    this._flashColor = [0, 0, 0, 0];
    this._flashDuration = 0;
    this._damageBitmap = ImageManager.loadSystem($gameSwitches.value(211) ? 'Damage2' : 'Damage');
  };

  //rpg_scenes
  Scene_Status.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);
    this._statusWindow = new Window_Status();
    this._statusWindow.setHandler('ok', this.nextPageOpenok.bind(this));
    this._statusWindow.setHandler('cancel', this.popScene.bind(this));
    this._statusWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._statusWindow.setHandler('pageup', this.previousActor.bind(this));
    this._statusWindow.reserveFaceImages();
    this.addWindow(this._statusWindow);
  };

  Scene_Status.prototype.start = function () {
    Scene_MenuBase.prototype.start.call(this);
    this.refreshActor();
  };

  Scene_Status.prototype.refreshActor = function () {
    WindowManager.hideAll();
    window.valueStatusSet1 = 0;
    var actor = this.actor();
    this._statusWindow.setActor(actor);
  };

  Scene_Status.prototype.onActorChange = function () {
    WindowManager.hideAll();
    this.refreshActor();
    this._statusWindow.activate();
  };

  Scene_Status.prototype.nextPageOpenok = function () {
    if (window.valueStatusSet1 == 0) {
      var actor = this.actor();
      $gameVariables.setValue(20, actor.actorId());
      battle_xsarStatas1(actor, false);
      window.valueStatusSet1 = 1;
    } else {
      WindowManager.hideAll();
      window.valueStatusSet1 = 0;
    };
    this._statusWindow.activate();
  };

  //rpg_scenes.js
  Scene_Battle.prototype.startActorCommandSelection = function () {
    const actor = BattleManager.actor();
    if (!actor) return;

    const isOkRepeated = Input.isRepeated("ok");

    // Only perform tachie operations if needed
    if (!isOkRepeated && ConfigManager.battleAniSpeed >= 3 && !$gameSwitches.value(131)) {
      // Remove tachie
      tachie_syoukyo1(getPreviousTachiePicId());

      // Set variable directly with actor ID
      $gameVariables.setValue(20, actor.actorId());

      // Only call tachie_settei3 if necessary
      if ($gameVariables.value(263) >= 2) {
        tachie_settei3(actor);
      }

      // Show tachie
      tachie_hyouji2(actor);
    }

    // Cache the current actor for status window
    this._statusWindow.select(actor.index());
    this._partyCommandWindow.close();
    this._actorCommandWindow.setup(actor);

    // Check Imported.MOG_BattleHud with direct property access
    if (Imported.MOG_BattleHud && !this._hudField) {
      this.createHudField();
      this.createBattleHudSB();
    }
  };

  //rpg_managers.js
  BattleManager.selectNextCommand = function () {
    const party = $gameParty;
    const switches = $gameSwitches;
    const gameScreen = $gameScreen;
    const actorId = getPreviousTachiePicId();

    while (true) {
      const currentActor = this.actor();
      if (!currentActor || !currentActor.selectNextCommand()) {
        this.changeActor(this._actorIndex + 1, 'waiting');
        if (this._actorIndex >= party.size()) {
          if (!switches.value(131)) {
            tachie_syoukyo1(actorId);
          }
          if (gameScreen.picture(50)) {
            gameScreen.erasePicture(50);
          }
          const scene = SceneManager._scene;
          if (scene && scene._gabWindow) {
            scene.clearGabWindow();
          }
          this.startTurn();
          return;
        }
      }
      if (this.actor().canInput()) {
        break;
      }
    }
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
      const slotId = etypeId - 1;
      if (this.equipSlots()[slotId] === 1) {
          this.changeEquip(slotId, $dataWeapons[itemId]);
      } else {
          this.changeEquip(slotId, $dataArmors[itemId]);
      }
  };
  */

  ImageManager.loadBattleback2 = function (filename, hue) {
    return this.loadBitmap('img/parallaxes/', filename, hue, true);//変更
  };

  ImageManager.loadBattleback1 = function (filename, hue) {
    return this.loadBitmap('img/parallaxes/', filename, hue, true);//変更
  };

  Window_NumberInput.prototype.isCancelEnabled = function () {
    return true;
  };

  Window_NumberInput.prototype.processCancel = function () {
    if ($gameSwitches.value(56)) {
      $gameSwitches.setValue(56, false);
      SoundManager.playCancel();
      this._messageWindow.terminateMessage();
      this.updateInputData();
      this.deactivate();
      this.close();
    };
  };

  Scene_Equip.prototype.onItemOk = function () {
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

  const DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
  DataManager.makeSavefileInfo = function () {
    const info = DataManager_makeSavefileInfo.call(this);
    info.saveString = $gameVariables ? $gameVariables.value(87) : '';
    return info;
  };

  Window_SavefileList.prototype.drawGameTitle = function (info, x, y, width) {
    this.drawText(info.saveString, x, y, width);
  };

  Game_Map.prototype.updateEvents = function () {
    // PERF: iterate the internal sparse array directly. Game_Map#events()
    // allocates a fresh filtered array on every call, and updateEvents runs
    // once per frame; the inline null check yields the same events in the
    // same order with zero per-frame allocation.
    const events = this._events;
    const len = events.length;
    for (let i = 0; i < len; i++) {
      const event = events[i];
      // Only update events that are near the player
      if (event && event.isNearThePlayer()) {
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

  const ARRAY_1to15 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  Window_SkillType.prototype.updateHelp = function () {
    const itemdata = $dataWeapons[ARRAY_1to15[this.currentExt() - 1]]; //アイテムIDのデータを拾って
    this._helpWindow.setItem(itemdata); //ヘルプウィンドウに表示させる
  };

  Scene_Skill.prototype.createSkillTypeWindow = function () {
    var wy = this._helpWindow.height;
    this._skillTypeWindow = new Window_SkillType(0, wy);
    this._skillTypeWindow.setHelpWindow(this._helpWindow);
    this._skillTypeWindow.setHandler('skill', this.commandSkill.bind(this));
    this._skillTypeWindow.setHandler('cancel', this.popScene.bind(this));
    this._skillTypeWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._skillTypeWindow.setHandler('pageup', this.previousActor.bind(this));
    this.addWindow(this._skillTypeWindow);
    // NOTE: help window is refreshed automatically via setHelpWindow + Window_Selectable.callUpdateHelp
  };

  Game_CharacterBase.prototype.realMoveSpeed = function () {
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

  Game_Unit.prototype.luklity = function () {
    const members = this.members();
    if (members.length === 0) {
      return 1;
    }
    const sum = members.reduce(function (r, member) {
      return r + member.luk;
    }, 0);
    return sum / members.length;
  };

  const windowEventItemStart = Window_EventItem.prototype.start;
  Window_EventItem.prototype.start = function () {
    this.initializeWidth();
    windowEventItemStart.call(this);
  };

  // Switch ids controlling the event-item "choose item" window layout.
  const EVENT_ITEM_LAYOUT_HALF_WIDTH_SWITCH_ID = 111;
  const EVENT_ITEM_SINGLE_COLUMN_SWITCH_ID = 400;

  Window_EventItem.prototype.initializeWidth = function () {
    const isDefaultWidth = this.isDefaultSize();
    const switchOn = $gameSwitches.value(EVENT_ITEM_LAYOUT_HALF_WIDTH_SWITCH_ID);

    if (isDefaultWidth && switchOn) {
      this.width = this.defaultWidth() / 2 - $gameVariables.value(338);
    } else if (!isDefaultWidth && !switchOn) {
      this.width = this.defaultWidth();
    }
  };

  Window_EventItem.prototype.maxCols = function () {
    return $gameSwitches.value(EVENT_ITEM_SINGLE_COLUMN_SWITCH_ID) ? 1 : 2;
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

  BattleManager.makeRewards = function () {
    this._rewards = {};
    this._rewards.gold = Math.ceil($gameTroop.goldTotal() * valueTotalgold);
    this._rewards.exp = Math.ceil($gameTroop.expTotal() * valueTotalexp);
    this._rewards.items = $gameTroop.makeDropItems();
  };

  //モーション制御
  Sprite_Actor.prototype.updateMotionCount = function () {
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

  const updatePatternAlias = Sprite_Weapon.prototype.updatePattern;
  Sprite_Weapon.prototype.updatePattern = function () {
    if (this.parent._maxPattern && this._pattern === this.parent._maxPattern) {
      return;
    }
    updatePatternAlias.call(this);
  };

  const refreshMotionAlias = Sprite_Actor.prototype.refreshMotion;
  Sprite_Actor.prototype.refreshMotion = function () {
    if (this._actor && this._maxPattern && this._pattern === this._maxPattern) {
      return;
    }
    refreshMotionAlias.call(this);
  };

  Sprite_Actor.prototype.setMaxFrame = function (num) {
    this._maxPattern = num;
  };

  Sprite_Actor.prototype.removeMaxFrame = function () {
    // PERF: `delete` would move this sprite onto V8's slow dictionary-mode path,
    // and Sprite_Actor instances are long-lived (one per actor for the whole
    // session). `undefined` is indistinguishable from the deleted state here:
    // updateMotionCount tests `this._maxPattern !== undefined` and
    // updatePattern/refreshMotion test it for truthiness.
    this._maxPattern = undefined;
  };

  Sprite_Actor.prototype.setFrame = function (motion, num) {
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
  };

})();

