/*:
* @plugindesc このゲーム専用プラグイン
* @author 作者名
* @help ゲーム専用に作成された初期読み込み用プラグイン
*/

(function () {
  const GAME_VARIABLE = {
    TRUE_PROTAGONIST_ACTOR_ID: 2, // 真の主人公ＩＤ
    PORTRAIT_ACTOR_ID: 3, // 変数で立ち絵判断
    PROCESSED_ITEM_ID: 19, // アイテム処理時代入変数
    SELECTED_ACTOR_ID: 20, // アクター選択肢代入変数
    WEEKDAY: 55, // Weeks:
    ELAPSED_DAYS: 58, // Days:
    FIRST_HEROINE_ACTOR_ID: 73, // ヒロインキャラ指定変数始点
    LAST_HEROINE_ACTOR_ID: 74, // ヒロインキャラ指定変数終点
    FIRST_DEPLOYED_ACTOR_ID: 75, // 登場キャラ指定変数始点
    LAST_DEPLOYED_ACTOR_ID: 76, // 登場キャラ指定変数終点
    CHOICE_COLUMN_COUNT: 177, // 選択肢列数操作変数
    DUNGEON_WARP_POINTS: 211, // ダンジョンワープ魔方陣用２次配列
    DUNGEON_INFO_ITEM_ID: 240, // ダンジョン毎情報アイテム指定変数
    HEROINE_ACTOR_IDS: 247, // ヒロインID配列
    CHARACTER_ACTOR_IDS: 248, // キャラID配列
    ACTOR_WEAPON_PARAMETERS: 287, // 各アクター専用武器変数配列
    DYNAMIC_EVENT_IDS: 292, // イベント用動的生成ID配列
    TRAINING_DOLL_PRESET: 293, // 訓練人形事前設定配列
    PERSONAL_TITLE_ACTOR_IDS: 297, // 個人用の称号を獲得したアクターID配列
    SCENE_PREVIOUS_TIME_SWITCH_ID: 320, // イベント時朝昼夜スイッチ番号代入変数
    CONFINED_ACTOR_RECORDS: 333, // 監禁時アクター記憶配列
    ENEMY_PRESET_STATES: 345, // エネミー付与ステート事前設定配列
    BOSS_ACTIONS: 346, // ボス行動パターン配列
    BOSS_SPECIAL_ACTIONS: 347, // ボス特殊行動パターン配列
    MAP_ENEMY_SPECIAL_STATES: 350, // マップ毎のエネミー特殊ステート
    LEARNED_SKILL_ARRAYS: 351, // スキル習得配列
    NPC_PROFESSIONS: 353, // NPC役職名配列
    NPC_SURNAMES: 354, // NPC苗字配列
    OUTFIT_PRESETS: 355, // 衣装プリセット配列
    MENU_BACKGROUND_NAME: 508, // メニュー背景
    DAY_END_INFO_TEXT: 539, // 一日終了時情報表示文字列変数
    DAY_END_INFO_LINE_COUNT: 540, // 一日終了時情報表示カウント変数
    MEAL_BUFF_EFFECTS: 620, // 食事バフ配列
    SCENE_KIND: 626, // メイン/シーン/挿話
    BOSS_GUARANTEED_DROPS: 628, // ボス確定ドロップ配列自動
    SCENE_END_TIME_ADVANCE: 630, // シーン終了時時間経過指定変数
    FAITH_TOTAL: 631, // [NoReset]喜捨総額
    TEMPORARY_TEXT: 801, // 一時テキスト変数
    CURRENT_VIEWPOINT_ACTOR_ID: 11,
    SCRIPT_CHOICE_RESULT: 14,
    RANDOM_WORK_1: 21,
    RANDOM_WORK_2: 22,
    RANDOM_WORK_3: 23,
    ACTOR_NAME_TEXT: 49,
    RACE_KILL_COUNTS: 52,
    GAME_VERSION_TEXT: 61,
    BACKGROUND_SCROLL_X: 81,
    BACKGROUND_SCROLL_Y: 82,
    SCRIPT_COMMON_VALUE_1: 121,
    SCRIPT_COMMON_VALUE_2: 122,
    MAIN_QUEST_PROGRESS_1: 135,
    MAIN_QUEST_PROGRESS_2: 136,
    MAIN_QUEST_PROGRESS_3: 137,
    MAIN_QUEST_PROGRESS_4: 138,
    MAIN_QUEST_PROGRESS_5: 139,
    MAIN_QUEST_PROGRESS_6: 140,
    DUNGEON_LEFT_MEMBER_IDS: 154,
    SAVED_POSITION: 161,
    RESET_FLAG_SETTINGS: 183,
    SKILL_MASTERY_GAIN: 203,
    GLOSSARY_BLOCKING_STATES: 214,
    DUNGEON_TREASURE_IDS: 215,
    DUNGEON_TREASURE_TYPES: 216,
    DUNGEON_S_RARE_CHEST_IDS: 212,
    ENEMY_SPAWN_POOL: 220,
    ERO_ENEMY_POOL: 228,
    TOWN_INFO_ITEM_ID: 230,
    DUNGEON_FLOOR_NUMBER: 232,
    RARE_ENEMY_POOL: 242,
    DUNGEON_TRANSFER_ID: 204,
    DUNGEON_ANNIHILATION_COUNTS: 257,
    ENEMY_LEVEL: 270,
    TITLE_EFFECT_IDS: 288,
    TITLE_SLOT_COUNT: 289,
    PORTRAIT_PICTURE_ID: 300,
    BOSS_SOURCE_ID: 303,
    BOSS_DEFEATED_ARRAY: 304,
    DUNGEON_BOSS_DEFEAT_COUNTS: 305,
    CASH_IN_ITEM_MEMORY: 316,
    HOME_ACTIVATION_RECORDS: 327,
    BOSS_BGM_TABLE: 337,
    DAY_SPENT_GOLD: 341,
    DAY_GAINED_GOLD: 342,
    BOSS_ENEMY_STATES: 343,
    ACTOR_RECORD_BASE: 380,
    ACTOR_NUDE_FLAGS_BASE: 440,
    H_NAVI_CONDITION_MET: 504,
    H_NAVI_CONDITION_UNMET: 505,
    EPISODE_NAVI_CONDITION_MET: 517,
    EPISODE_NAVI_CONDITION_UNMET: 518,
    OUTFIT_PERMISSION_FLAGS: 520,
    EPISODE_COMPLETION_SWITCH: 525,
    EVENT_PROGRESS: 528,
    EVENT_SUBJECT_ACTOR_ID: 530,
    TIP_TITLES: 532,
    TIP_TEXTS: 533,
    TIP_PICTURES: 534,
    OPTION_TEXT_BASE: 800,
    EPISODE_COLLECTION_RATES: 321,
    SCENE_COLLECTION_RATES: 322,
    TITLE_COLLECTION_RATES: 323,
    H_TITLE_COLLECTION_RATES: 324,
    QUEST_COLLECTION_RATES: 325,
    SCRIPT_COMMON_VALUE_3: 123,
    SCRIPT_COMMON_VALUE_4: 124,
    SCRIPT_COMMON_VALUE_5: 125,
    SCRIPT_COMMON_VALUE_6: 126,
    SCRIPT_COMMON_VALUE_7: 127,
    SCRIPT_COMMON_VALUE_8: 128,
    SCRIPT_COMMON_VALUE_9: 129,
    MAP_STATUS_DISPLAY_MODE: 200,
    WORLD_MAP_LAST_DESTINATION: 610, // 全体マップ移動選択で最後に選んだ移動先イベントID
  };
  const GAME_SWITCH = {
    MORNING: 13, // 朝
    DAYTIME: 14, // 昼
    NIGHT: 15, // 夜
    RECOLLECTION_SKIP: 29, // 回想時スキップスイッチ
    SCENE_GLOSSARY_DISABLED: 160, // シーングローサリー使用不可スイッチ
    BATTLE_MAP: 201, // 戦闘マップ
    WORLD_MAP: 209, // 全体マップ
    DUNGEON: 207, // ダンジョン
    TEMPORARY_RESULT: 380, // 汎用一時onoff自動スイッチ
    DIRECT_ENEMY_BOSS: 426, // 特殊条件ボス戦自動onoff
    TRIAL_VERSION: 4,
    LOAD_SKILL_NAME_TEMP: 19,
    TACHIE_VISIBLE: 42,
    DEBUG: 53,
    RISHABLE: 61,
    GEKIDEN_EX1: 62,
    GEKIDEN_EX2: 63,
    GEKIDEN_1: 64,
    GEKIDEN_2: 65,
    GEKIDEN_3: 66,
    READ_SCENE_SKIP_CHOICE: 71,
    ENEMY_STATUS_DISPLAY: 95,
    TACHIE_AUTO_CHANGE: 96,
    EVENT_PROGRESS_ACTIVE: 124,
    BATTLE_TACHIE_DISABLED: 131,
    MAP_FIRST_PROCESS_DONE: 140,
    CONTINUE_ENABLED: 146,
    HOME_BASE: 206,
    BOSS_BATTLE_IMMINENT: 211,
    BRIDGE: 227,
    CHURCH: 233,
    GUILD: 237,
    ENEMY_POPUP_SETTING: 357,
    H_ENEMY: 370,
    EPISODE_AUTO_GENERATED: 412,
    ENEMY_IS_HUMAN: 424,
    INITIAL_COMMENTARY: 427,
    BUSTUP_ON_MESSAGE: 436,
    RARE_CHEST_TEMP: 439,
    TEMP_CHEST: 440,
    NPC_VANISHED: 467,
    EVENT_PROGRESS_BLOCKER: 468,
    H_SCENE_PARALLEL: 469,
    MAP_WEATHER_IGNORED: 473,
    PARALLEL_PROCESS_STOPPED: 474,
    HOME_LATER: 486,
    ANNIHILATION: 503,
    TRIAL_MAIN_PROGRESS_SUPPRESSED: 504,
    SCENE_CONTINUE_SELECTED: 505,
    PASSERBY_VANISHED: 506,
    GEKIDEN_4: 67,
  };

  // Indent used by the ticker messages (kept out of the translatable sentences).
  const MESSAGE_HEAD_INDENT = "　　";
  const QUEST_BOARD_TITLE = "クエスト掲示板";
  // Result markers of the class release requirement line.
  const MET_RESULT_TEXT = "<達成>";
  const UNMET_RESULT_TEXT = "<未達成>";
  // Hearts drawn with the 27th palette color are shaken differently.
  const HEART_WORD_BODIES = ["\\C[27]♥\\C[0]", "\\C[27]♡\\C[0]"];

  // Deliberately non-strict: public event functions and documented work globals are shared with other plugins.

  function clearSelfSwitchVariableRange(mapId, eventId, lastVariableId) {
    for (let variableId = 1; variableId <= lastVariableId; variableId++) {
      $gameSelfSwitches.setVariableValue([mapId, eventId, variableId], 0);
    }
  }

  function initializeGameVariableArrays(
    gameVariables,
    firstVariableId,
    lastVariableId,
    arrayLength
  ) {
    for (
      let variableId = firstVariableId;
      variableId <= lastVariableId;
      variableId++
    ) {
      gameVariables.setValue(variableId, Array(arrayLength).fill(0));
    }
  }

  amygame_startUpArrangement = function () {
    clearSelfSwitchVariableRange(4, 11, 2000);
    clearSelfSwitchVariableRange(4, 12, 1000);
    clearSelfSwitchVariableRange(4, 13, 1000);
    const gameVariables = $gameVariables;
    gameVariables.setValue(356, Array(501).fill(0));
    const firstHeroineId = gameVariables.value(
      GAME_VARIABLE.FIRST_HEROINE_ACTOR_ID
    );
    const lastHeroineId = gameVariables.value(
      GAME_VARIABLE.LAST_HEROINE_ACTOR_ID
    );
    initializeHeroineOutfitPresets(
      gameVariables,
      firstHeroineId,
      lastHeroineId
    );
    initializeCoreGameRecordArrays(
      gameVariables,
      firstHeroineId,
      lastHeroineId
    );
    initializeDungeonRecordArrays(gameVariables);
    initializeActorProgressArrays(gameVariables);
  };

  amygame_startUp = function () {
    initializeStartupDatabaseNames();
    const gameVariables = $gameVariables;
    initializeViewpointSwitchNames(gameVariables);
    initializeStartupItemNames(gameVariables);
    // Descriptions must be built before resistance traits are appended.
    [4, 1, 2, 3, 5, 0].forEach((databaseType) =>
      various_description(databaseType)
    );
    initializeStartupResistanceTraits();
    enemy_troopPosition1();
    appendUniqueMaterialLocationDescriptions();
    attack_addKaisetu1();
    class_addKaisetu1();
    restoreDeployedActorSurnames(gameVariables);
    initializeSpecialMapNames();
  };

  //ステート付与されているかどうか。名前21に全員の名前、変数21に人数、変数22にid
  actor_stateCheck = function (stateId) {
    const affectedActorIds = [];
    const affectedActorNames = [];
    const firstActorId = $gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = $gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    const mapId = $gameMap.mapId();
    for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
      const gameActor = $gameActors.actor(actorId);
      if (!gameActor || !gameActor.isStateAffected(stateId)) continue;
      affectedActorIds.push(actorId);
      affectedActorNames.push(gameActor.name());
    }
    if (stateId == 83)
      affectedActorIds.forEach((actorId) =>
        $gameSelfSwitches.setValue([mapId, actorId, "A"], true)
      );
    let stateAffectedNames = affectedActorNames.join(" ");
    if (affectedActorNames.length) stateAffectedNames += " ";
    if (affectedActorIds.length >= 2) stateAffectedNames += "達";
    const nameCarrierActor = $gameActors.actor(21);
    if (nameCarrierActor) nameCarrierActor.setName(stateAffectedNames);
    $gameVariables.setValue(GAME_VARIABLE.RANDOM_WORK_1, affectedActorIds.length - 1);
    $gameVariables.setValue(GAME_VARIABLE.RANDOM_WORK_2, affectedActorIds);
  };

  //役職名を変更する。Profession_CharaChange(0,1,`\\wn[314]の恋人`,0);//0がｱｸﾀｰで1NPC,id,役職名,0で表示1でｻｲﾚﾝﾄ
  Profession_CharaChange = function (
    targetTypeId,
    targetId,
    professionName,
    displayModeId
  ) {
    if (!$gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP)) {
      let actorName = "";
      if (targetTypeId == 0) {
        $gameVariables.value(GAME_VARIABLE.ACTOR_RECORD_BASE + targetId)[59] = `${professionName}`;
        actorName = $gameActors.actor(targetId).name();
      } else {
        $gameVariables.value(GAME_VARIABLE.NPC_PROFESSIONS)[targetId - 300] =
          `${professionName}`; //スタートリセットコモンで初期実行
        actorName = $dataWeapons[targetId].name;
      }
      if (displayModeId == 0) {
        $gameScreen.startAnimation(100, 150, 300, false);
        const actor = colorTaggedText(1, actorName);
        const job = colorTaggedText(2, professionName);
        // The sentence only interpolates prepared values, the indent is concatenated.
        const professionChangedText = `${actor}の役職名が${job}に変更されました。`;
        TickerManager.show(MESSAGE_HEAD_INDENT + professionChangedText);
      }
    }
  };

  //役職名を基本に戻す
  Profession_basicReturn = function (actorId) {
    if ($gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP)) return; // Exit early if switch 29 is on

    const dataActor = $dataActors[actorId];
    if (!dataActor) return;
    const actorRecords = $gameVariables.value(GAME_VARIABLE.ACTOR_RECORD_BASE + actorId);
    if (!Array.isArray(actorRecords)) return;
    //const actor = $dataActors[actorId]; // was set by default
    let defaultProfession = `${dataActor.meta["Profession"]}`;
    let newProfession = defaultProfession;

    newProfession = chooseActorProfession(dataActor.meta, defaultProfession);
    const currentProfession = actorRecords[59];

    // Only update if profession has changed
    if (currentProfession === newProfession) return;

    if (!$gameSwitches.value(GAME_SWITCH.TEMPORARY_RESULT)) {
      const actorName = `\\N[${actorId}]`;
      const actor = colorTaggedText(1, actorName);
      const jobCurrentLabel = colorTaggedText(1, currentProfession);
      const jobNewLabel = colorTaggedText(2, newProfession);
      const jobCur = `<${jobCurrentLabel}>`;
      const jobNew = `<${jobNewLabel}>`;
      const professionChangeMessage = `${actor}の役職名${jobCur}から${jobNew}に変更されました。`;
      TickerManager.show(MESSAGE_HEAD_INDENT + professionChangeMessage);
    }

    actorRecords[59] = newProfession;
  };

  message_popup2 = function (
    popupEventId,
    popupPosition,
    messageRow,
    displayModeId
  ) {
    if (displayModeId == 0) {
      valueAutoSkipPicX = 0;
      $gameSystem.clearMessagePopupFree();
      $gameSystem.clearMessagePopup();
      $gameMessage.setMessageRow(4);
      return;
    }
    if (displayModeId != 1) return;

    valueAutoSkipPicX = 1000;
    $gameSystem.clearMessagePopupFree();
    if (popupEventId == 0) {
      $gameSystem.setMessagePopupFree(popupPosition[0], popupPosition[1]);
    } else {
      $gameSystem.setMessagePopup(popupEventId);
      switch (popupPosition) {
        case 1:
          $gameSystem.setPopupFixUpper(popupEventId);
          break;
        case 2:
          $gameSystem.setPopupFixLower(popupEventId);
          break;
      }
    }
    $gameMessage.setMessageRow(messageRow);
  };

  //配列に記録して控えメンバー0外す/1加える
  submember_saveAddRemove = function (changeModeId) {
    if (changeModeId == 0) {
      $gameParty.members().forEach(function (actor) {
        if (!!actor.isBattleMember()) return;

        $gameVariables.value(GAME_VARIABLE.DUNGEON_LEFT_MEMBER_IDS).push(actor._actorId);
        $gameParty.removeActor(actor._actorId);
      }, this);
    } else {
      if ($gameVariables.value(GAME_VARIABLE.DUNGEON_LEFT_MEMBER_IDS) != 0) {
        $gameParty.addActor(23);
        $gameParty.addActor(24);
        $gameParty.addActor(25);
        //$gameParty.changeBattleMax($gameParty.battleMembers().length);
        var list = $gameVariables.value(GAME_VARIABLE.DUNGEON_LEFT_MEMBER_IDS);
        list.forEach(function (id) {
          const actor = $gameActors.actor(id);
          if (
            !$gameParty.members().contains(actor) &&
            actor.isLearnedSkill(18) &&
            !actor.isStateAffected(valueDollStateId)
          ) {
            $gameParty.addActor(id);
          }
        }, this);
        $gameVariables.setValue(GAME_VARIABLE.DUNGEON_LEFT_MEMBER_IDS, []);
        //$gameParty.changeBattleMax(4);
        $gameParty.removeActor(23);
        $gameParty.removeActor(24);
        $gameParty.removeActor(25);
      }
    }
  };

  //プレイヤー位置記憶した場所に戻る。スイッチ140はそれぞれのコモンなりでoffにする
  set_playerPosition2 = function (varId) {
    const savedPosition = $gameVariables.value(varId);
    const mapId = Number(savedPosition[0]);
    const x = Number(savedPosition[1]);
    const y = Number(savedPosition[2]);
    $gamePlayer.reserveTransfer(mapId, x, y, 0, 2);
    SceneManager.goto(Scene_Map);
    //this.popScene();
    //$gamePlayer.setTransparent(false);
    //$gamePlayer.performTransfer();
    //console.log(`${arr1}`);
  };

  //プレイヤー位置記憶
  set_playerPosition1 = function (varId) {
    $gameVariables.setValue(varId, [
      $gameMap.mapId(),
      $gamePlayer._realX,
      $gamePlayer._realY
    ]);
    //$gamePlayer.setTransparent(true);
  };

  //拠点強制帰還位置指定移動
  set_homeMoveForced = function () {
    $gameSwitches.setValue(GAME_SWITCH.MAP_FIRST_PROCESS_DONE, false);
    $gameSwitches.setValue(GAME_SWITCH.HOME_LATER, true);
    var homeWeaponId = 22;
    for (var i = 1; i <= 100; i++) {
      if (!($gameVariables.value(GAME_VARIABLE.HOME_ACTIVATION_RECORDS)[i] == 2)) continue;

      var homeWeaponId = i;
      break;
    }
    const homePositionValues =
      $dataWeapons[homeWeaponId].meta["HomePosition"].split(",");
    $gameVariables.setValue(GAME_VARIABLE.SAVED_POSITION, [
      Number(homePositionValues[0]),
      Number(homePositionValues[1]),
      Number(homePositionValues[2])
    ]);
    set_playerPosition2(161);
  };

  //時計表示
  // Neutral status icon: reused whenever no navi condition is pending.
  const NEUTRAL_STATUS_ICON = "\\I[16]";

  // Icon of a navi condition: met, unmet, or nothing pending.
  function naviStatusIconText(metVariableId, unmetVariableId, metIconIndex, unmetIconIndex) {
    if ($gameVariables.value(metVariableId) >= 1) return `\\I[${metIconIndex}]`;
    if ($gameVariables.value(unmetVariableId) >= 1) return `\\I[${unmetIconIndex}]`;
    return NEUTRAL_STATUS_ICON;
  }

  // Morning / daytime / night icon.
  function buildTimeOfDayIconText() {
    if ($gameSwitches.value(GAME_SWITCH.NIGHT)) return "\\I[418]";
    if ($gameSwitches.value(GAME_SWITCH.DAYTIME)) return "\\I[417]";
    return "\\I[416]";
  }

  // H-navi icon plus, in battle, the enemy status and continue icons, or, on the map,
  // the episode navi icon; the time of day icon closes the line in both cases.
  function buildStatusIconText(isInBattle) {
    let statusIconText = naviStatusIconText(
      GAME_VARIABLE.H_NAVI_CONDITION_MET,
      GAME_VARIABLE.H_NAVI_CONDITION_UNMET,
      383,
      382
    );
    if (isInBattle) {
      const enemyStatusIconIndex = $gameSwitches.value(GAME_SWITCH.ENEMY_STATUS_DISPLAY)
        ? 427
        : 317;
      const continueIconIndex = $gameSwitches.value(GAME_SWITCH.CONTINUE_ENABLED)
        ? 126
        : 16;
      statusIconText += `\\I[${enemyStatusIconIndex}]`;
      statusIconText += `\\I[${continueIconIndex}]`;
    } else {
      statusIconText += naviStatusIconText(
        GAME_VARIABLE.EPISODE_NAVI_CONDITION_MET,
        GAME_VARIABLE.EPISODE_NAVI_CONDITION_UNMET,
        535,
        625
      );
    }
    return statusIconText + buildTimeOfDayIconText();
  }

  // Battle line: party stats, then one row per heroine and, unless a boss fight is
  // imminent, the enemy state rows. Returns the text and the y of the picture top.
  function buildBattleStatusMessage(statusIconText) {
    let messageText =
      `${statusIconText}:+\\V[290,3]\\I[75]:\\V[263]\n` +
      `\\I[176]:\\V[190]/\\V[189]\\V[332]\\I[127]:${valueMaxEnemyLv}\n`;
    const heroineStatus = buildBattleHeroineStatus($gameParty.battleMembers());
    messageText += heroineStatus.text;
    let pictureY = 680 - heroineStatus.rowCount * 28;
    if ($gameSwitches.value(GAME_SWITCH.BOSS_BATTLE_IMMINENT)) {
      return { messageText: messageText, pictureY: pictureY };
    }
    const enemyStatus = buildEnemyStateIconRows($gameTroop.members());
    messageText += enemyStatus.text;
    pictureY -= enemyStatus.rowCount * 28;
    return { messageText: messageText, pictureY: pictureY };
  }

  // Map line: money, plus the enemy party window on battle maps.
  function buildMapStatusMessage(statusIconText) {
    const messageText = `${statusIconText}:\\V[56,3]`;
    if (!$gameSwitches.value(GAME_SWITCH.BATTLE_MAP)) return messageText;
    return (
      messageText +
      " [" +
      colorTaggedText(10, "\\V[335,2]") +
      "/" +
      colorTaggedText(1, "\\V[334,2]") +
      "]"
    );
  }

  // Battle status picture: bottom right, framed, left aligned.
  function drawBattleStatusPicture(pictureY) {
    $gameScreen.dTextAlign = 0;
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(50, "", 0, 1010, pictureY, 80, 80, 250, 0);
    /*       if($gameSwitches.value(GAME_SWITCH.BOSS_BATTLE_IMMINENT)){
    \t\t\t\t
                     } else {
                       //$gameScreen.showPicture(50,"",0,10,10,80,80,250,0);
                     }; */
  }

  // Map status picture: bottom bar plus its button, battle maps use the other pair.
  function drawMapStatusPictures() {
    $gameScreen.dTextAlign = 1;
    const isBattleMap = $gameSwitches.value(GAME_SWITCH.BATTLE_MAP);
    $gameScreen.showPicture(50, "", 0, isBattleMap ? 760 : 860, 10, 100, 100, 255, 0);
    const pictureName = isBattleMap ? "PictureBottan49d" : "PictureBottan49";
    $gameScreen.showPicture(49, pictureName, 0, 0, -5, 100, 100, 250, 0);
  }

  time_settei = function () {
    scene_joukensettei(1);
    scene_joukensettei(2);
    const isInBattle = $gameParty.inBattle();
    const statusIconText = buildStatusIconText(isInBattle);

    if ($gameSwitches.value(GAME_SWITCH.WORLD_MAP)) return;
    //全体マップ以外で表示10
    let messageText = "";
    let pictureY = 680;

    if (isInBattle) {
      const battleStatus = buildBattleStatusMessage(statusIconText);
      messageText = battleStatus.messageText;
      pictureY = battleStatus.pictureY;
    } else {
      messageText = buildMapStatusMessage(statusIconText);
    }
    $gameScreen.setDTextPicture(messageText, 25);
    if ($gameSwitches.value(GAME_SWITCH.BATTLE_MAP) && !isInBattle) {
      $gameScreen.dTextRealTime = "ON";
    }
    if (isInBattle) {
      drawBattleStatusPicture(pictureY);
    } else {
      drawMapStatusPictures();
    }
  };

  //エリクシール設定コンティニュー
  continue_settei = function (itemId) {
    const item = $dataItems[itemId];
    const itemMetaSwitchOnOffUseNum = Number(item.meta.SwicthOnOffUse);
    const isOn = $gameSwitches.value(itemMetaSwitchOnOffUseNum);
    const hasItemOn = $gameParty.hasItem(item) && isOn;

    item.name = hasItemOn ? item.meta.SwicthOnName : item.meta.SwicthOffName;
    $gameSwitches.setValue(itemMetaSwitchOnOffUseNum, hasItemOn); // correct value based on the item in inventory
    $gameParty.members().forEach(function (actor) {
      if (hasItemOn) actor.addState(25);
      else actor.removeState(25);
    });
  };

  //主人公パッシブ獲得
  actor_skilllearn1 = function (actorId) {
    const actor = $gameActors.actor(actorId);
    if (!actor) return;
    for (const skillId of valueHeroGetSkill || []) {
      if (actor.isLearnedSkill(skillId)) continue;
      const skillData = $dataSkills[skillId];
      if (!skillData || !heroineSkillConditionMet(actor, skillData.meta))
        continue;
      if (!$gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP))
        actor.learnSkill(skillId);
      $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, skillId);
      return;
    }
    teachCompositeActorSkill(actor, valueIdentifySkillId, [
      { skillId: valueAppraisalSkillId },
      { skillId: valueHarvestingSkillId, minRank: 3 }
    ]);
    teachCompositeActorSkill(actor, valueMassGatheringSkillId, [
      { skillId: valueHuntingSkillId, minRank: 2 },
      { skillId: valueHarvestingSkillId, minRank: 2 }
    ]);
  };

  //パーティメンバーが通常攻撃派生スキル獲得。対象スキル範囲は101-200
  actor_skilllearn2 = function (actorId) {
    const actor = $gameActors.actor(actorId);
    for (var skillId = SKILL_DERIVED_SCAN_FIRST; skillId <= SKILL_DERIVED_SCAN_LAST; skillId++) {
      const skill = $dataSkills[skillId];
      if (skill.name === "") {
        continue;
      }
      const skillMetaNormalAttackDerived = skill.meta["NormalAttackDerived"];
      if (!skillMetaNormalAttackDerived) {
        continue;
      }

      const [masteryThreshold, derivedSkillId] = readDerivedSkillRule(skillMetaNormalAttackDerived);
      if (!actor.isLearnedSkill(derivedSkillId) &&
        actor.skillMasteryLevel(skillId) >= masteryThreshold) {
        learnDerivedSkill(actor, skillId, derivedSkillId, masteryThreshold);
      }
    }
  }

  // Skill range scanned by actor_skilllearn2, and the effect of a learned derived skill.
  const SKILL_DERIVED_SCAN_FIRST = 101;
  const SKILL_DERIVED_SCAN_LAST = 200;
  const LEARN_ANIMATION_ID = 300;
  const LEARN_SOUND_NAME = "21_SkillLearn";

  // "threshold,derivedSkillId" meta -> the two numbers, threshold first.
  function readDerivedSkillRule(skillMetaNormalAttackDerived) {
    const normalAttackDerivedValues = skillMetaNormalAttackDerived.split(",");
    return [Number(normalAttackDerivedValues[0]), Number(normalAttackDerivedValues[1])];
  }

  // Learns the derived skill with its animation, sound and message.
  function learnDerivedSkill(actor, skillId, derivedSkillId, masteryThreshold) {
    const isInBattle = $gameParty.inBattle();
    actor.learnSkill(derivedSkillId);

    if (!isInBattle) {
      $gamePlayer.requestAnimation(LEARN_ANIMATION_ID);
    } else {
      $gameParty.members()[actor.index()].startAnimation(LEARN_ANIMATION_ID, false, 0);
    }
    AudioManager.playMe({
      name: LEARN_SOUND_NAME,
      volume: 60,
      pitch: 120,
      pan: 0
    });

    const learnMessage = buildDerivedSkillMessage(actor, skillId, derivedSkillId, masteryThreshold);
    if (isInBattle) {
      BattleManager._logWindow.push("addText", learnMessage);
    } else {
      gab_wordParticle(learnMessage);
    }
  }

  // "Actor's skill reached Rank n and the derived skill appeared!"; the icon tags stay out of the text.
  function buildDerivedSkillMessage(actor, skillId, derivedSkillId, masteryThreshold) {
    const actorName = actor.name();
    const learnedSkillTag = `\x1bSIN[${skillId}]`;
    const derivedSkillTag = `\x1bSIN[${derivedSkillId}]`;
    return `${actorName}の${learnedSkillTag}がRank${masteryThreshold}に到達し、${derivedSkillTag}が派生した！`;
  };

  //パーソナルスキルのonoffロード時
  skill_personalonoffload = function (itemId, valueItemsType) {
    const skillSwitchTarget = readSkillSwitchTarget(itemId, valueItemsType);
    if (!skillSwitchTarget) return;

    // set effect switch by skill name
    //if (!$gameSwitches.value(19)) {
    applySkillSwitchName(skillSwitchTarget.item, skillSwitchTarget.switchStateValue);
    $gameSwitches.setValue(
      skillSwitchTarget.skillSwitchId,
      skillSwitchTarget.switchStateValue
    );
    //}
  };

  // Database entry (skills or items), its on/off switch id and the state of that switch.
  // Also refreshes the shared valueItems array, because the callers rely on it.
  function readSkillSwitchTarget(itemId, valueItemsType) {
    if (valueItemsType > 1) return null;

    valueItems = valueItemsType == 0 ? $dataSkills : $dataItems;

    const item = valueItems[itemId];
    const skillSwitchId = Number(item.meta.SwicthOnOffUse);
    return {
      item: item,
      skillSwitchId: skillSwitchId,
      switchStateValue: $gameSwitches.value(skillSwitchId)
    };
  }

  // Shows the name that belongs to the state the item switches to next.
  function applySkillSwitchName(item, nextSwitchState) {
    item.name = nextSwitchState
      ? item.meta.SwicthOnName
      : item.meta.SwicthOffName;
  }

  //パーソナルスキルのonoff
  skill_personalonoff = function (actorA, actorB, itemId, valueItemsType) {
    if (actorB.actorId() !== actorA.actorId()) return;

    const skillSwitchTarget = readSkillSwitchTarget(itemId, valueItemsType);
    if (!skillSwitchTarget) return;

    // revers switch state
    applySkillSwitchName(skillSwitchTarget.item, !skillSwitchTarget.switchStateValue);
    $gameSwitches.setValue(skillSwitchTarget.skillSwitchId, !skillSwitchTarget.switchStateValue);

    // show new state name
    const s = valueItemsType == 0 ? "S" : "I";
    // Color tag from the shared helper; \x1b..IN[] stays a technical marker.
    const switchStateName = colorTaggedText(2, `\x1b${s}IN[${itemId}]`);
    TickerManager.show(`<${switchStateName}>に変更しました`);
  };

  //パーソナルスキルの所持者不在時にスイッチ自動off
  skill_personalonoffAutoOff = function (itemId, itemOrSkillType) {
    valueItems = itemOrSkillType == 0 ? $dataSkills : $dataItems;
    $gameSwitches.setValue(
      Number(valueItems[itemId].meta.SwicthOnOffUse),
      false
    );
  };

  //主人公がパーソナルスキルを道具で習得
  // Coloured actor and skill labels of the personal skill messages.
  function buildPersonalSkillLabels(actor, skillId) {
    return {
      actorName: colorTaggedText(16, actor.name()),
      skillName: colorTaggedText(2, `\x1bSIN[${skillId}]`)
    };
  }

  // "Rank:n /熟練度 used (max)" line shown after a mastery gain.
  function showSkillMasteryRank(actor, skillId) {
    const skillMasteryLevel = actor.skillMasteryLevel(skillId);
    const skillMasteryUses = actor.skillMasteryUses(skillId);
    const skillMasteryUsageMax = actor.skillMasteryUsageMax(skillId);
    // One colored "used (max)" value instead of a tag split over two strings.
    const skillMasteryCount = colorTaggedText(
      2,
      `${skillMasteryUses}(${skillMasteryUsageMax})`
    );
    TickerManager.show(`Rank:${skillMasteryLevel} /熟練度${skillMasteryCount}`);
  }

  // Mastery gain of a skill the protagonist already knows.
  function raiseSkillMastery(actor, itemId, skillId, skillLabels) {
    const maxMasteryLevel = Number($dataSkills[skillId].meta["Max Mastery Level"]);
    if (actor.skillMasteryLevel(skillId) >= maxMasteryLevel) {
      TickerManager.show(
        `${skillLabels.actorName}の${skillLabels.skillName}は最高ランクに到達しています…。`
      );
      return;
    }
    const skillRankNum = 10 * $gameVariables.value(GAME_VARIABLE.SKILL_MASTERY_GAIN);
    actor.gainSkillMasteryUses(skillId, skillRankNum); //変更熟練度
    const skillRank = colorTaggedText(3, `${skillRankNum}`);
    TickerManager.show(
      `${skillLabels.actorName}の${skillLabels.skillName}熟練度を${skillRank}獲得した！`
    );
    showSkillMasteryRank(actor, skillId);
    $gameParty.loseItem($dataItems[itemId], 1);
  }

  // First learn of a personal skill: skill, mastery 1, fanfare and message.
  function learnPersonalSkill(actor, itemId, skillId) {
    actor.learnSkill(skillId);
    actor.setSkillMasteryLevel(skillId, 1);
    AudioManager.playMe({
      name: "21_SkillLearn",
      volume: 60,
      pitch: 120,
      pan: 0
    });
    const skillLabels = buildPersonalSkillLabels(actor, skillId);
    TickerManager.show(`${skillLabels.actorName}は${skillLabels.skillName}を習得した！`);
    $gameParty.loseItem($dataItems[itemId], 1);
  }

  actor_personalskilllearn = function (
    sourceActor,
    targetActor,
    itemId,
    itemOrSkillTypeId,
    skillId
  ) {
    const actor = $gameActors.actor(
      $gameVariables.value(GAME_VARIABLE.TRUE_PROTAGONIST_ACTOR_ID)
    );
    if (targetActor.actorId() != sourceActor.actorId()) return;

    if (!actor.isLearnedSkill(skillId)) {
      learnPersonalSkill(actor, itemId, skillId);
      return;
    }
    const skillLabels = buildPersonalSkillLabels(actor, skillId);
    switch (numericCaseValue(itemOrSkillTypeId)) {
      // Skill item of an already known skill has no effect.
      case 2:
        TickerManager.show(
          `${skillLabels.actorName}は既に${skillLabels.skillName}を習得済みのため効果は無かった。`
        );
        break;
      // Skill book: raises the mastery of the skill.
      case 1:
        raiseSkillMastery(actor, itemId, skillId, skillLabels);
        break;
    }
  };

  //ステートオンオフ
  skill_stateonoff = function (actorA, actorB, skillId, stateId) {
    if (actorB.actorId() !== actorA.actorId()) return;

    const skill = $dataSkills[skillId];
    stateId = Number(skill.meta["SkillStateAddRemove"]); // re set stateId, all using of skill_stateonoff use 0 value for stateId

    const actor = $gameActors.actor(actorB._actorId);
    const isStateAffected =
      $dataStates[stateId] !== null && actor.isStateAffected(stateId);
    if (isStateAffected) actor.removeState(stateId);
    else if ($dataStates[stateId] !== null) actor.addState(stateId);
    const animationId = isStateAffected ? 289 : 282;
    if ($gameParty.inBattle()) {
      actorB.startAnimation(animationId, true, 0);
    }
    if (skill.meta["TachieChangeSet"]) {
      //たぶん使ってない isStateAffected
      actor.addState(20);
      $gameSwitches.setValue(GAME_SWITCH.TACHIE_AUTO_CHANGE, true);
    }

    const actorName = colorTaggedText(16, actorB.name());
    const skillName = colorTaggedText(2, `\x1bSIN[${skillId}]`);
    const message = isStateAffected
      ? `${actorName}の${skillName}が解除された。`
      : `${actorName}に${skillName}が付与された。`;
    TickerManager.show(message);
  };

  //スキルアイテム使用時に立ち絵が変化する場合。事前に$gameVariables.setValue(20,b.actorId());
  tachie_usedChange1 = function (gameActor) {
    const gameActorData = gameActor.actor();
    if (!gameActorData || !gameActorData.meta["Heroine"]) return;

    if (!$gameSwitches.value(GAME_SWITCH.BATTLE_TACHIE_DISABLED) || !$gameParty.inBattle()) {
      if (
        $gameSwitches.value(GAME_SWITCH.TACHIE_VISIBLE) &&
        $gameVariables.value(GAME_VARIABLE.PORTRAIT_ACTOR_ID) ==
          gameActor.actorId()
      ) {
        const tachiePicId = gameActor.actor().meta["TachiePicId"];
        tachie_syoukyo1(tachiePicId); // getPreviousTachiePicId();
        tachie_settei3(gameActor);
        $gameVariables.setValue(
          GAME_VARIABLE.SELECTED_ACTOR_ID,
          $gameVariables.value(GAME_VARIABLE.PORTRAIT_ACTOR_ID)
        );
        tachie_hyouji2(gameActor);
      } else {
        tachie_settei3(gameActor);
      }
    } else {
      tachie_settei3(gameActor);
    }
  };

  //スキルアイテム使用でのぶっかけ付与。
  bukkake_addSemen1 = function (user, target, itemId, valueItemsType) {
    const sourceEntries = valueItemsType == 0 ? $dataSkills : $dataItems;
    const heroineName = target.name();
    if ($dataActors[target.actorId()].meta["Heroine"]) {
      target.addState(86);
      $gameVariables.setValue(
        GAME_VARIABLE.SELECTED_ACTOR_ID,
        target.actorId()
      );
      tachie_usedChange1(target);

      TickerManager.show(`${heroineName}はぶっかけられた！`);
    } else {
      TickerManager.show(
        `${heroineName}は対象キャラでは無いため、効果が無かった…。`
      );

      if (valueItemsType == 1) {
        $gameParty.gainItem(sourceEntries[itemId], +1);
      }
    }
  };

  //スキルアイテム使用での精液回復。実際のステート回復は<Remove 1 State Category: StateSemen>で実施
  semen_reflesh1 = function (user, target, itemId, itemOrSkillTypeId) {
    const sourceEntries = itemOrSkillTypeId == 0 ? $dataSkills : $dataItems;
    const stateCategoryName = "StateSemen";
    let semenCount = 0;

    const itemMetaSemenRemove = sourceEntries[itemId].meta["SemenRemove"];
    let end = itemMetaSemenRemove ? Number(itemMetaSemenRemove) : 1;

    const semenItem = $dataItems[120];
    for (let i = 1; i <= end; i++) {
      if (!target.isStateCategoryAffected(stateCategoryName)) continue;

      target.removeStateCategory(stateCategoryName, 1);
      $gameParty.gainItem(semenItem, 1); //白濁瓶
      semenCount += 1;
    }

    const targetName = target.name();
    const cnt = `(${semenCount})`;
    const itemName = "\\iin[120]";
    const txtObtained = cnt + `${itemName}を入手`;
    const nonEmptyMessage = `${targetName}は白濁を洗浄した。` + txtObtained;
    const emptyMessage = `${targetName}には効果が無かった`;
    const messageText = semenCount >= 1 ? nonEmptyMessage : emptyMessage;
    showMessage(messageText);
    target.addState(71);
    showMessage(`${targetName}は濡れてしまった`);

    $gameVariables.setValue(GAME_VARIABLE.SELECTED_ACTOR_ID, target.actorId());
    tachie_usedChange1(target);
  };

  /*:
   * Show message text depend on where is party is in battle or not.
   * @function
   * @param {*} messageText
   */
  showMessage = function (messageText) {
    if ($gameParty.inBattle()) {
      BattleManager._logWindow.push("addText", messageText);
    } else {
      TickerManager.show(messageText);
    }
  };

  //スキルアイテム使用での衣装修復
  cloth_repair1 = function (user, target, itemId, itemsToReturn) {
    if (!target) return;
    const sourceDatabase = itemsToReturn == 0 ? $dataSkills : $dataItems;
    const sourceEntry = sourceDatabase[itemId];
    const targetName = target.name();
    if (target.isStateAffected(23)) {
      refundClothingRepairItem(sourceEntry, itemsToReturn);
      showMessage(`現在の${targetName}は衣装修復対象ではありません。`);
      return;
    }
    const actorData = target.isActor() ? target.actor() : null;
    if (actorData)
      $gameVariables.setValue(
        GAME_VARIABLE.SELECTED_ACTOR_ID,
        target.actorId()
      );
    const actorMeta = actorData && actorData.meta;
    const mainClothId = actorMeta && Number(actorMeta.MainCloth);
    if (!actorMeta || !actorMeta.Heroine || !Number.isFinite(mainClothId)) {
      refundClothingRepairItem(sourceEntry, itemsToReturn);
      showMessage(`${targetName}は衣装修復の対象ではありません。`);
      return;
    }
    target.removeState(70);
    $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, mainClothId);
    kisekae_tyokusetusitei(mainClothId, 0);
    tachie_usedChange1(target);
    showMessage(`${targetName}の衣装を修復しました。`);
  };

  //スキルアイテム使用での状態異常クリア//0スキル1アイテム<abNomalClearCount:5>
  //<abNomalClearCountPlus:200>mat200につき1プラス,修正一律で300
    // Refunds a normal-only recovery item when there was nothing to clear, and tells
  // the player why the item had no effect (actors only, not monsters).
  function reportNoAbnormalToClear(
    sourceActor,
    targetActor,
    sourceEntry,
    normalOnly,
    itemOrSkillTypeId
  ) {
    if (sourceActor.isActor()) {
      const targetName = targetActor.name();
      const messageText = normalOnly
        ? `${targetName}は基本状態異常を付与されていない為、効果が無かった。`
        : `${targetName}は基本特殊状態異常を付与されていない為、効果が無かった。`;
      showMessage(messageText);
    }
    // Preserve the original refund: only normal-only item recovery refunds here.
    if (normalOnly && itemOrSkillTypeId == 1)
      $gameParty.gainItem(sourceEntry, 1);
  }

abNomal_Clear = function (
    sourceActor,
    targetActor,
    itemId,
    itemOrSkillTypeId
  ) {
    const database = getItemsSourceSkillsItemsStates(itemOrSkillTypeId);
    const sourceEntry = database && database[itemId];
    if (!sourceEntry || !sourceActor || !targetActor) return;
    const meta = sourceEntry.meta;
    let remainingCount = meta.abNomalClearCount
      ? Number(meta.abNomalClearCount)
      : 1;
    const normalOnly = !!meta.StateabNomalOnly;
    const normalCount =
      targetActor.getStateCategoryAffectedCount("StateabNomal");
    const affectedCount =
      normalCount +
      (normalOnly
        ? 0
        : targetActor.getStateCategoryAffectedCount("StateSPabNomal"));
    if (affectedCount == 0) {
      reportNoAbnormalToClear(sourceActor, targetActor, sourceEntry, normalOnly, itemOrSkillTypeId);
      return;
    }
    remainingCount += stateRemovalMagicBonus(
      sourceActor,
      meta.abNomalClearCountPlus,
      "recovery"
    );
    remainingCount = removeStateCategoryWithMessage(
      targetActor,
      "StateabNomal",
      remainingCount,
      "normal"
    );
    if (remainingCount < 1 || normalOnly) return;
    removeStateCategoryWithMessage(
      targetActor,
      "StateSPabNomal",
      remainingCount,
      "special"
    );
  };

  powerUp_dispel = function (
    sourceActor,
    targetActor,
    itemId,
    itemOrSkillTypeId
  ) {
    if (!sourceActor || !targetActor) return;
    if (activateDispelGuard(targetActor)) return;
    const database = getItemsSourceSkillsItemsStates(itemOrSkillTypeId);
    const sourceEntry = database && database[itemId];
    if (!sourceEntry) return;
    const meta = sourceEntry.meta;
    let remainingCount = meta.dispelCount ? Number(meta.dispelCount) : 1;
    if (
      sourceActor.isActor() &&
      targetActor.getStateCategoryAffectedCount("PowerUp") == 0
    ) {
      const targetName = targetActor.name();
      const messageText = `${targetName}は強化状態を付与されていない為、効果が無かった。`;
      showMessage(messageText);
    }
    // Retain the source's bonus notification even when no power-up state is present.
    remainingCount += stateRemovalMagicBonus(
      sourceActor,
      meta.dispelCountPlus,
      "dispel"
    );
    removeStateCategoryWithMessage(
      targetActor,
      "PowerUp",
      remainingCount,
      "powerUp"
    );
  };

  const masteryLevel5R100Map = {
    1: "[D]",
    2: "[C]",
    3: "[B]",
    4: "[A]",
    5: "[S]"
  };
  const masteryLevel5Map = {
    1: "[E]",
    2: "[D]",
    3: "[C]",
    4: "[B]",
    5: "[A]"
  };
  const masteryLevel6Map = {
    1: "[E]",
    2: "[D]",
    3: "[C]",
    4: "[B]",
    5: "[A]",
    6: "[S]"
  };
  const masteryLevel10R100Map = {
    1: "[D]",
    2: "[D]",
    3: "[C]",
    4: "[C]",
    5: "[B]",
    6: "[B]",
    7: "[A]",
    8: "[A]",
    9: "[S]",
    10: "[S]"
  };
  const masteryLevel10Map = {
    1: "[E]",
    2: "[E]",
    3: "[D]",
    4: "[D]",
    5: "[C]",
    6: "[C]",
    7: "[B]",
    8: "[B]",
    9: "[A]",
    10: "[A]"
  };
  //スキルアイテム使用での二つ名変更//0スキル1アイテムskillItem_titles(a,b,this.item().id,0);
  skillItem_titles = function (sourceActor, targetActor, itemId, ItemType) {
    // Only process if target is same as source actor
    if (targetActor.actorId() !== sourceActor.actorId()) return;

    const itemsData = ItemType == 0 ? $dataSkills : $dataItems;
    const itemData = itemsData[itemId];

    // Get appropriate sound effect parameters based on item type
    const soundEffectParams = getSoundEffectParamsSkillItemTitles(
      itemData,
      ItemType
    );

    // Get rank label based on item mastery level
    const skillRankLabel = getSkillRankLabelSkillItemTitles(
      targetActor,
      itemData,
      itemId,
      ItemType
    );

    // Update actor's title and display notification
    updateActorTitleSkillItemTitles(
      targetActor,
      itemData,
      skillRankLabel,
      soundEffectParams,
      ItemType,
      itemId
    );
  };

  // Determine appropriate sound effect based on item type and category
  function getSoundEffectParamsSkillItemTitles(itemData, ItemType) {
    // Default sound effect for title changes
    let soundEffectParams = ["Z11_NickNameChange", 50, 110, 0];

    const itemMeta = itemData.meta;

    // Check Menu Category for H titles
    if (
      itemMeta["Menu Category"] &&
      itemMeta["Menu Category"] === " H'sTitle"
    ) {
      soundEffectParams = ["Z_Suspicious", 50, 150, 0];
    }

    // Check skill type for special skills (type 15)
    if (ItemType === 0 && itemData.stypeId === 15) {
      soundEffectParams = ["Z_Suspicious", 50, 150, 0];
    }

    return soundEffectParams;
  }

  // Determine rank label based on skill mastery level and configuration
  function getSkillRankLabelSkillItemTitles(actor, itemData, itemId, ItemType) {
    // Special case for libido-related skill (ID 50)
    if (ItemType === 0 && itemId === 50) {
      const libidoValue = $gameVariables.value(actor.actorId() + 380)[1];
      return getLibidoRankLabelSkillItemTitles(libidoValue);
    }

    const itemMeta = itemData.meta;
    if (!itemMeta["RankUpPoint"]) return "";

    const masteryLevel = actor.skillMasteryLevel(itemId);
    const maxMasteryLevel = Number(itemMeta["Max Mastery Level"]);
    const rankUpPoint = Number(itemMeta["RankUpPoint"]);

    // Select appropriate rank label based on max mastery level and rank up point
    switch (maxMasteryLevel) {
      case 6:
        return masteryLevel6Map[masteryLevel] || "";
      case 5:
        return (
          (rankUpPoint >= 100
            ? masteryLevel5R100Map[masteryLevel]
            : masteryLevel5Map[masteryLevel]) || ""
        );
      case 10:
        return (
          (rankUpPoint >= 100
            ? masteryLevel10R100Map[masteryLevel]
            : masteryLevel10Map[masteryLevel]) || ""
        );
      default:
        return "";
    }
  }

  // Update actor's title and display notification to player
  function updateActorTitleSkillItemTitles(
    actor,
    itemData,
    skillRankLabel,
    soundEffectParams,
    ItemType,
    itemId
  ) {
    const actorName = actor.name();
    const nickname = $dataActors[actor._actorId].nickname;

    // Handle special case for default title item (ID 600)
    if (ItemType === 1 && itemId === 600) {
      $gameActors.actor(actor._actorId).setNickname(`${nickname}`);
      TickerManager.show(`${actorName}の二つ名が${nickname}になった！`);
    } else {
      // Regular title update with rank label
      const newTitle = itemData.name + skillRankLabel;
      $gameActors.actor(actor._actorId).setNickname(`＜${newTitle}＞`);
      TickerManager.show(`${actorName}の二つ名が＜${newTitle}＞になった！`);
    }

    // Play sound effect
    AudioManager.playSe({
      name: soundEffectParams[0],
      volume: Number(soundEffectParams[1]),
      pitch: Number(soundEffectParams[2]),
      pan: Number(soundEffectParams[3])
    });
  }

  // Special pattern for the libido-related skill
  // Helper function to determine rank label for libido level
  function getLibidoRankLabelSkillItemTitles(libidoValue) {
    if (libidoValue > 900) return "[SSS]";
    if (libidoValue > 800) return "[SS]";
    if (libidoValue > 600) return "[A]";
    if (libidoValue > 500) return "[B]";
    if (libidoValue > 400) return "[C]";
    if (libidoValue > 300) return "[D]";
    if (libidoValue > 200) return "[E]";
    return "[圏外]"; // Default for values 200 and below
  }

  //コモンイベントでスクリプト実行前に代入
  common_script1 = function (
    commonVar14,
    commonVar121,
    commonVar122,
    commonVar123,
    commonVar124,
    commonVar125,
    commonVar126,
    commonVar127,
    commonVar128,
    commonVar129
  ) {
    $gameVariables.setValue(GAME_VARIABLE.SCRIPT_CHOICE_RESULT, commonVar14);
    $gameVariables.setValue(GAME_VARIABLE.SCRIPT_COMMON_VALUE_1, commonVar121);
    $gameVariables.setValue(GAME_VARIABLE.SCRIPT_COMMON_VALUE_2, commonVar122);
    $gameVariables.setValue(GAME_VARIABLE.SCRIPT_COMMON_VALUE_3, commonVar123);
    $gameVariables.setValue(GAME_VARIABLE.SCRIPT_COMMON_VALUE_4, commonVar124);
    $gameVariables.setValue(GAME_VARIABLE.SCRIPT_COMMON_VALUE_5, commonVar125);
    $gameVariables.setValue(GAME_VARIABLE.SCRIPT_COMMON_VALUE_6, commonVar126);
    $gameVariables.setValue(GAME_VARIABLE.SCRIPT_COMMON_VALUE_7, commonVar127);
    $gameVariables.setValue(GAME_VARIABLE.SCRIPT_COMMON_VALUE_8, commonVar128);
    $gameVariables.setValue(GAME_VARIABLE.SCRIPT_COMMON_VALUE_9, commonVar129);
  };

  //スキル複数選択肢1スキル用
  skill_sentaku = function (skillId, unusedValue) {
    // Cache meta for performance.
    const skill = $dataSkills[skillId];
    const meta = skill.meta;
    const varId = Number(meta.VariableChangeUse);

    if (!$gameSwitches.value(GAME_SWITCH.LOAD_SKILL_NAME_TEMP)) {
      $gameVariables.setValue(
        varId,
        getVariableValueSkillSentaku($gameVariables.value(varId), meta)
      );
    }

    skill.name = getUpdatedSkillNameSkillSentaku(
      $gameVariables.value(varId),
      meta,
      skill.name
    );
  };

  function getUpdatedSkillNameSkillSentaku(val, meta, def) {
    switch (val) {
      case 1:
        return meta.ValChangeName1;
      case 2:
        return meta.ValChangeName2;
      case 3:
        return meta.ValChangeName3;
      case 4:
        return meta.ValChangeName4;
      case 5:
        return meta.ValChangeName5;
      default:
        return def;
    }
  }

  function getVariableValueSkillSentaku(currentValue, meta) {
    switch (currentValue) {
      case 1:
        return 2;
      case 2:
        return 3;
      case 3:
        return meta.ValChangeName4 ? 4 : 1;
      case 4:
        return meta.ValChangeName5 ? 5 : 1;
      case 5:
        return 1;
      default:
        return currentValue;
    }
  }

  //苗字取得
  family_name = function (actorId, resultVarId) {
    $gameVariables.setValue(
      resultVarId,
      $gameVariables.value(actorId + 380)[50]
    );
  };

  //ウィンドウカラー変更
  const windowColor1Map = {
    0: [0, 0, 0], // Default
    1: [170, 0, 170], // H関係
    2: [-34, 153, 68], // 一人称視点
    3: [170, 170, 0], // その他（白と黄の間？）
    4: [-255, 170, 34] // その他（薄水色）
  };
  window_color1 = function (colorToneId) {
    const tone = windowColor1Map[colorToneId] || [0, 0, 0]; // Default to [0, 0, 0] if id1 is not in the map
    $gameSystem.setWindowTone(tone);
  };

  const xOffsetOptions = [-30, -20, -10, 0, 10, 20, 30];
  const yNegativeOffsetOptions = [-30, -25, -20, -10, -5, 0];
  const yPositiveOffsetOptions = [30, 25, 20, 10, 5, 0];
  //エネミーグループ設定$gameVariables.value(270)//$gameVariables.value(232)
  // One member of a generated troop: enemy id, position and hide flag.
  function buildTroopMember(enemyId, spawnX, spawnY, isHidden) {
    return { enemyId: enemyId, x: spawnX, y: spawnY, hidden: isHidden };
  }

  // The last spawned enemy is hidden as a spare slot, unless it is the only one.
  function isSpareSpawnHidden(spawnIndex, enemyCountToSpawn) {
    return spawnIndex >= enemyCountToSpawn && enemyCountToSpawn != 1;
  }

  // Fills one troop with the enemies of the spawn pool.
  function pushSpawnTroopMembers(enemyTroop, enemyCountToSpawn, spawnPool) {
    const spawnPoolLength = spawnPool.length;
    const spawnTracker = { hasSpawned27: false, hasSpawned28: false };
    for (let spawnIndex = 1; spawnIndex <= enemyCountToSpawn; spawnIndex++) {
      const enemySpawnId = resolveEnemySpawnIdEnemyTroopPush(
        spawnPool,
        spawnPoolLength,
        spawnTracker
      );
      const { spawnX, spawnY } = getSpawnCoordinatesEnemyTroopPush(
        spawnIndex,
        enemyCountToSpawn,
        xOffsetOptions,
        yNegativeOffsetOptions,
        yPositiveOffsetOptions
      );
      enemyTroop.members.push(
        buildTroopMember(
          enemySpawnId,
          spawnX,
          spawnY,
          isSpareSpawnHidden(spawnIndex, enemyCountToSpawn)
        )
      );
    }
  }

  // Random enemy of the H spawn pool, picked once per member.
  function resolveHEnemySpawnId(spawnPoolH) {
    return Number(spawnPoolH[getRandomIndex(spawnPoolH.length)]) || 0; //出現エネミースポーン
  }

  // Fills the H troop with members of the H spawn pool; the members are never hidden.
  function pushHEnemyTroopMembers(enemyTroopH, enemyCountToSpawn, spawnPoolH) {
    for (let spawnIndex = 1; spawnIndex <= enemyCountToSpawn; spawnIndex++) {
      // The spawn id is rolled before the position; keeping this order keeps the
      // random draws identical to the original loop.
      const enemySpawnId = resolveHEnemySpawnId(spawnPoolH);
      const { spawnX, spawnY } = getSpawnCoordinatesHEnemyTroopPush(
        spawnIndex,
        enemyCountToSpawn,
        xOffsetOptions,
        yNegativeOffsetOptions,
        yPositiveOffsetOptions
      );
      enemyTroopH.members.push(
        buildTroopMember(enemySpawnId, spawnX, spawnY, false)
      );
    }
  }

  enemy_troopPush = function () {
    // 出現プールが空配列のままのダンジョンでは通常版メタを持たないため split が落ちる。
    // 旧ガード(=== 0)は空配列を素通りするので、henemy_troopPush と同じ判定にそろえる。
    const spawnPool = $gameVariables.value(GAME_VARIABLE.ENEMY_SPAWN_POOL);
    if (!spawnPool || spawnPool.length === 0) return;

    const chestItemMeta =
      $dataItems[$gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)].meta;
    let spawnChanceOffset = 0;
    for (let troopId = 11; troopId <= 20; troopId++) {
      const enemyTroop = $dataTroops[troopId];
      enemyTroop.name = chestItemMeta["TroopName"];
      enemyTroop.members = []; //グループのメンバーを空に

      // get enemy count to spawn
      const enemyCountToSpawn =
        calculateEnemyCountToSpawnEnemyTroopPush(chestItemMeta);

      // get enemy spawn pool
      const spawnResult = calculateSpawnPoolEnemyTroopPush(spawnChanceOffset);
      spawnChanceOffset = spawnResult.spawnChanceOffset;

      // add enemies to enemy troop
      pushSpawnTroopMembers(enemyTroop, enemyCountToSpawn, spawnResult.pool);
    }
    $gameSwitches.setValue(GAME_SWITCH.ENEMY_POPUP_SETTING, true);
  };

  // Each of these party states makes one extra rare enemy roll pass.
  const RARE_SPAWN_BONUS_STATE_IDS = [304, 305, 306];
  const RARE_SPAWN_BONUS_PER_STATE = 10;
  const RARE_SPAWN_THRESHOLD = 80;
  // Spawn chance roll range and the extra step every successful roll grants.
  const RARE_SPAWN_ROLL_RANGE = 101;
  const RARE_SPAWN_OFFSET_STEP = 10;

  // The bonus states stay constant while the pool is rolled, so the total is
  // counted once instead of three times per roll.
  function getRareSpawnChanceBonus() {
    return RARE_SPAWN_BONUS_STATE_IDS.reduce(
      (bonus, stateId) =>
        $gameParty.membersState(stateId)
          ? bonus + RARE_SPAWN_BONUS_PER_STATE
          : bonus,
      0
    );
  }

  // Rolls the rare enemy pool into the normal pool; every success makes the next
  // roll easier (the offset grows by 10).
  function calculateSpawnPoolEnemyTroopPush(spawnChanceOffset) {
    const basePool = $gameVariables.value(GAME_VARIABLE.ENEMY_SPAWN_POOL);
    const specialPool = $gameVariables.value(GAME_VARIABLE.RARE_ENEMY_POOL);
    if (specialPool == 0) return { pool: basePool, spawnChanceOffset };

    let pool = basePool;
    const rareSpawnChanceBonus = getRareSpawnChanceBonus();
    for (let rareSlot = 0; rareSlot < specialPool.length; rareSlot++) {
      const chanceRoll =
        getRandomIndex(RARE_SPAWN_ROLL_RANGE) -
        spawnChanceOffset +
        rareSpawnChanceBonus;
      if (chanceRoll < RARE_SPAWN_THRESHOLD) continue;
      pool = pool.concat(specialPool);
      spawnChanceOffset += RARE_SPAWN_OFFSET_STEP;
    }
    return { pool, spawnChanceOffset };
  }

  // A troop never spawns more than eight enemies.
  const MAX_TROOP_ENEMY_COUNT = 8;
  // From this dungeon floor on the troop size is randomized per battle.
  const DUNGEON_FLOOR_WITH_RANDOM_ENEMY_COUNT = 2;
  // From this enemy level on there is an extra chance for one more enemy.
  const ENEMY_LEVEL_WITH_BONUS_ROLL = 11;

  function calculateEnemyCountToSpawnEnemyTroopPush(troopMeta) {
    const battleEnemyPopOptions = troopMeta["BattleEnemyPopC"].split(",");
    let enemyCountToSpawn = Number(
      battleEnemyPopOptions[getRandomIndex(battleEnemyPopOptions.length)]
    );

    const dungeonFloorNumber = $gameVariables.value(
      GAME_VARIABLE.DUNGEON_FLOOR_NUMBER
    );
    if (dungeonFloorNumber < DUNGEON_FLOOR_WITH_RANDOM_ENEMY_COUNT) {
      return Math.min(enemyCountToSpawn, MAX_TROOP_ENEMY_COUNT);
    }

    enemyCountToSpawn += Math.floor(Math.random() * dungeonFloorNumber);
    const enemyLevel = $gameVariables.value(GAME_VARIABLE.ENEMY_LEVEL);
    if (enemyLevel >= ENEMY_LEVEL_WITH_BONUS_ROLL) {
      const bonusChance = getRandomIndex(RARE_SPAWN_ROLL_RANGE);
      if (enemyLevel >= bonusChance) enemyCountToSpawn += 1;
    }
    return Math.min(enemyCountToSpawn, MAX_TROOP_ENEMY_COUNT);
  }

  // Enemies that may only appear once per troop: a repeat roll falls back to the
  // listed replacement id. Both rules share the same two steps.
  const SINGLE_SPAWN_ENEMY_RULES = [
    { enemyId: 27, fallbackEnemyId: 21, trackerKey: "hasSpawned27" },
    { enemyId: 28, fallbackEnemyId: 22, trackerKey: "hasSpawned28" }
  ];

  function resolveEnemySpawnIdEnemyTroopPush(
    spawnPool,
    spawnPoolLength,
    tracker
  ) {
    let enemySpawnId = Number(spawnPool[getRandomIndex(spawnPoolLength)]); // 出現エネミースポーン
    SINGLE_SPAWN_ENEMY_RULES.forEach((rule) => {
      if (enemySpawnId === rule.enemyId && tracker[rule.trackerKey] === true) {
        enemySpawnId = rule.fallbackEnemyId;
      }
      if (enemySpawnId === rule.enemyId) tracker[rule.trackerKey] = true;
    });
    return enemySpawnId;
  }

  // Horizontal stack shift for troops of two to five enemies, by spawn slot;
  // the third slot of a five-enemy troop is also moved down.
  const SPAWN_COUNT_SHIFTS = {
    2: { 2: { x: -200, y: 0 } },
    3: { 2: { x: -100, y: 0 }, 3: { x: -100, y: 0 } },
    4: {
      2: { x: -100, y: 0 },
      3: { x: -100, y: 0 },
      4: { x: -200, y: 0 }
    },
    5: {
      3: { x: -100, y: 50 },
      4: { x: -200, y: 0 },
      5: { x: -100, y: 0 }
    }
  };

  // Offset added on top of the random spawn position; zero when the troop has no rule.
  function readSpawnCountShift(spawnIndex, enemyCountToSpawn) {
    const shiftsForCount = SPAWN_COUNT_SHIFTS[enemyCountToSpawn];
    if (!shiftsForCount) return { x: 0, y: 0 };
    return shiftsForCount[spawnIndex] || { x: 0, y: 0 };
  }

  // Base position mapping for spawn indexes; shared by the normal and the H enemy push.
  const spawnCoordinateBasePositions = {
    1: { x: 450, y: 350 },
    2: { x: 400, y: 500 },
    3: { x: 350, y: 350 },
    4: { x: 300, y: 500 },
    5: { x: 250, y: 350 },
    6: { x: 200, y: 500 },
    7: { x: 150, y: 350 },
    8: { x: 100, y: 500 }
  };

  // Nudges the base position with the random offsets; the draw order (X, then Y) is
  // part of the battle behaviour, so it lives here for both troop pushers.
  function applySpawnOffsets(
    spawnIndex,
    baseX,
    baseY,
    xOffsetOptions,
    yNegativeOffsetOptions,
    yPositiveOffsetOptions
  ) {
    let spawnX = baseX;
    if (spawnIndex >= 2 && spawnIndex <= 6) {
      spawnX += Number(xOffsetOptions[getRandomIndex(xOffsetOptions.length)]);
    }

    const yOffsetOptions = isUpwardSpawnSlot(spawnIndex)
      ? yNegativeOffsetOptions
      : yPositiveOffsetOptions;
    const spawnY = baseY + Number(yOffsetOptions[getRandomIndex(yOffsetOptions.length)]);

    return { spawnX, spawnY };
  }

  // Even spawn slots (2/4/6/8) are placed higher than the odd ones.
  function isUpwardSpawnSlot(spawnIndex) {
    return spawnIndex % 2 === 0;
  }

  function getSpawnCoordinatesEnemyTroopPush(
    spawnIndex,
    enemyCountToSpawn,
    xOffsetOptions,
    yNegativeOffsetOptions,
    yPositiveOffsetOptions
  ) {
    const basePosition = spawnCoordinateBasePositions[spawnIndex];
    let { spawnX, spawnY } = applySpawnOffsets(
      spawnIndex,
      basePosition.x,
      basePosition.y,
      xOffsetOptions,
      yNegativeOffsetOptions,
      yPositiveOffsetOptions
    );
    const countShift = readSpawnCountShift(spawnIndex, enemyCountToSpawn);
    spawnX += countShift.x;
    spawnY += countShift.y;
    spawnY -= 80; // Adjust according to battle background
    return { spawnX, spawnY };
  }

  henemy_troopPush = function () {
    const spawnPoolH = $gameVariables.value(GAME_VARIABLE.ERO_ENEMY_POOL);
    // Hエネミーが出現しないダンジョンではプールが空配列のまま。旧ガード(=== 0)は
    // 空配列を素通りするため、H専用メタを持たないデータで split が落ちていた。
    if (!spawnPoolH || spawnPoolH.length === 0) return;

    const troopId = 10; //グループIDを指定
    const enemyTroopH = $dataTroops[troopId];
    const troopMeta =
      $dataItems[$gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)].meta;
    // H専用メタを持たないダンジョンもあるため、通常版のキーへフォールバックする
    enemyTroopH.name = troopMeta["TroopNameH"] || troopMeta["TroopName"];
    enemyTroopH.members = []; //グループのメンバーを空に

    // add enemies to enemy troop
    const battleEnemyPopHOptions = (
      troopMeta["BattleEnemyPopCH"] || troopMeta["BattleEnemyPopC"]
    ).split(",");
    const enemyCountToSpawn = Number(
      battleEnemyPopHOptions[getRandomIndex(battleEnemyPopHOptions.length)]
    );
    // 元コードでも hidden は常に false 固定(算出していた value5 はコメントアウトされていた)
    pushHEnemyTroopMembers(enemyTroopH, enemyCountToSpawn, spawnPoolH);
  };

  function getSpawnCoordinatesHEnemyTroopPush(
    spawnIndex,
    enemyCountToSpawn,
    xOffsetOptions,
    yNegativeOffsetOptions,
    yPositiveOffsetOptions
  ) {
    // Special case for single enemy
    if (enemyCountToSpawn === 1 && spawnIndex === 1) {
      return { spawnX: 350, spawnY: 420 };
    }

    // Get base position or default to {0, 0}
    const basePosition = spawnCoordinateBasePositions[spawnIndex] || {
      x: 0,
      y: 0
    };
    let spawnX = basePosition.x;
    let spawnY = basePosition.y;

    // Apply random X offset for middle positions
    if (spawnIndex >= 2 && spawnIndex <= 6) {
      spawnX += Number(xOffsetOptions[getRandomIndex(xOffsetOptions.length)]);
    }

    // Apply random Y offset based on even/odd spawn index
    const isEven = spawnIndex % 2 === 0;
    const yOffsetOptions = isEven
      ? yNegativeOffsetOptions
      : yPositiveOffsetOptions;
    spawnY += Number(yOffsetOptions[getRandomIndex(yOffsetOptions.length)]);

    // Apply positioning adjustments based on enemy count
    const countShift = readSpawnCountShift(spawnIndex, enemyCountToSpawn);
    spawnX += countShift.x;
    spawnY += countShift.y;

    return { spawnX, spawnY };
  }

  // Pre-define position mappings for different troop name patterns
  const enemyBossTroopPositionMappings = {
    バハムート: { x: 150, y: 600 },
    768: { x: 250, y: 768 },
    600: { x: 250, y: 600 },
    500: { x: 250, y: 500 },
    big: { x: 250, y: 400 },
    one: { x: 250, y: 330 }
  };
  //エネミーグループ配置設定。bosssetup時に実行
  enemy_troopPosition1 = function () {
    // Process each troop in the database
    const troopsLength = $dataTroops.length;
    for (let i = 1; i < troopsLength; i++) {
      const troop = $dataTroops[i];

      // Skip invalid troops or those without members
      if (!troop || !troop.members || troop.members.length === 0) continue;

      // Find matching pattern and apply position
      for (const [pattern, position] of Object.entries(
        enemyBossTroopPositionMappings
      )) {
        if (!troop.name.match(pattern)) continue;

        troop.members[0].x = position.x;
        troop.members[0].y = position.y;
        break; // Exit the loop once a match is found
      }
    }
  };

  //図鑑のテキスト代入
  // Shared helpers for the map glossary (scene_Glossarytext1) and the enemy
  // description builder (Glossarytext1ProcessEnemyData).
  // Enemies described by an item are cloned from the database starting at this id.
  const ENEMY_CLONE_BASE_ID = 21;
  // <PopEnemy*> stores the four action skill ids after the graphic columns.
  const ENEMY_ACTION_SKILL_SLOTS = [0, 1, 2, 3];
  // A conditional state is listed once and the line breaks every third entry.
  const CONDITIONAL_STATE_PER_LINE = 3;

  // Reward meta tags store "database type" and "entry id" at different positions
  // (<firstAnnihilationItem:type,id> vs <TchestOnly:..,..,..,type,id>), so both
  // indexes are parameters of this one builder.
  function getRewardDatabase(databaseType, dataItems) {
    switch (databaseType) {
      case 0:
        return dataItems;
      case 1:
        return $dataWeapons;
      default:
        return $dataArmors;
    }
  }

  function buildRewardItemLine(metaValue, typeIndex, idIndex, labelText, dataItems) {
    const metaValues = metaValue.split(",");
    const rewardItems = getRewardDatabase(Number(metaValues[typeIndex]), dataItems);
    const rewardItemName = rewardItems[Number(metaValues[idIndex])].name;
    const rewardLabel = colorTaggedText(16, labelText);
    const rewardValue = colorTaggedText(10, `${rewardItemName}`);
    return `${rewardLabel}${rewardValue}\u3000\n`;
  }

  // The <OnSwitch> tag of a map info item contains the switches that enable it;
  // switch 207 marks a dungeon map.
  function isDungeonMapItem(itemMeta) {
    const onSwitchMeta = itemMeta["OnSwitch"];
    if (!onSwitchMeta) return false;
    return onSwitchMeta
      .split(",")
      .map(Number)
      .includes(GAME_SWITCH.DUNGEON);
  }

  // "エネミーLV：3～12" line, built from the <EnemyLV> range.
  function appendEnemyLevelSection(glossaryText, enemyLevelRange) {
    const maxEnemyLevel = Math.max(...enemyLevelRange);
    const minEnemyLevel = Math.min(...enemyLevelRange);
    const enemyLv = colorTaggedText(16, "エネミーLV：");
    const minLv = colorTaggedText(10, `${minEnemyLevel}`);
    const maxLv = colorTaggedText(10, `${maxEnemyLevel}`);
    glossaryText.push(`${enemyLv}${minLv}\uFF5E${maxLv}\u3000`);
  }

  // "<EnemyElement>" holds state ids that describe the damage attributes.
  function appendEnemyElementSection(glossaryText, itemMeta, dataStates) {
    const enemyElementMetadata = itemMeta.EnemyElement;
    const attributeHeading = colorTaggedText(16, "属性：");
    glossaryText.push("\u3000\u3000" + attributeHeading);
    if (!enemyElementMetadata || Number(enemyElementMetadata) === 0) {
      glossaryText.push("？？？");
      return;
    }
    enemyElementMetadata.split(",").forEach((elementStateId) => {
      const stateData = dataStates[Number(elementStateId)];
      if (!stateData) return;
      const elementNameLabel = colorTaggedText(13, stateData.name);
      glossaryText.push(`【${elementNameLabel}】\u3000`);
    });
  }

  // Annihilation count plus the first-annihilation reward of a dungeon map.
  function appendAnnihilationSection(glossaryText, itemMeta, annCount, dataItems) {
    if (annCount >= 1) {
      const annihilated = colorTaggedText(16, "殲滅回数：");
      const cnt = colorTaggedText(10, `${annCount}`);
      glossaryText.push(`${annihilated}${cnt}\u3000\n`);
    } else {
      glossaryText.push("\n");
    }
    if (!itemMeta["firstAnnihilationItem"] || annCount < 1) return;
    glossaryText.push(
      buildRewardItemLine(itemMeta["firstAnnihilationItem"], 0, 1, "初回殲滅報酬：", dataItems)
    );
  }

  // S-rank (white) treasure chest reward, only for maps that already rolled one.
  function appendTreasureChestSection(glossaryText, itemId, itemMeta, dataItems) {
    const rareChestIds = $gameVariables.value(GAME_VARIABLE.DUNGEON_S_RARE_CHEST_IDS);
    if (!itemMeta["TchestOnly"] || rareChestIds[itemId] < 1) return;
    glossaryText.push(buildRewardItemLine(itemMeta["TchestOnly"], 3, 4, "白箱：", dataItems));
  }

  // <PopEnemy1..8> feed both the text and the raw arrays used by the enemy
  // description builder, so the collected rows are returned.
  function appendEnemyPopSection(glossaryText, itemMeta) {
    const enemyPopHeading = colorTaggedText(16, "・出現エネミー");
    glossaryText.push(enemyPopHeading + "\n");
    const enemyPopArray = [];
    for (let popIndex = 1; popIndex <= 8; popIndex++) {
      const enemyMeta = itemMeta["PopEnemy" + popIndex];
      if (!enemyMeta) continue;
      const enemyInfo = enemyMeta.split(",");
      enemyPopArray.push(enemyInfo);
      const enemyNameLabel = colorTaggedText(2, enemyInfo[1]);
      glossaryText.push(`【${enemyNameLabel}】`);
      if (popIndex % 2 === 0) glossaryText.push("\n");
    }
    glossaryText.push("\n");
    return enemyPopArray;
  }

  // Builds the map info text and stores it in gameVariables.value(variableId)[itemId].
  scene_Glossarytext1 = function (itemId, variableId) {
    const gameVariables = $gameVariables;
    const dataItems = $dataItems;
    const dataStates = $dataStates;
    const dataEnemies = $dataEnemies;

    const itemData = dataItems[itemId];
    const itemMeta = itemData.meta;
    const enemyLevelRange = itemMeta["EnemyLV"]
      ? itemMeta["EnemyLV"].split(",")
      : [0];

    const locationType = isDungeonMapItem(itemMeta) ? "ダンジョン" : "フィールド";
    const glossaryText = [];
    // Translatable title text, then one color tag around it.
    const mapInfoTitle = `＜${locationType}マップ情報＞`;
    const mapInfoHeading = colorTaggedText(16, mapInfoTitle);
    glossaryText.push(mapInfoHeading + "\n");
    glossaryText.push(`${itemData.description}\n`);
    appendEnemyLevelSection(glossaryText, enemyLevelRange);
    appendEnemyElementSection(glossaryText, itemMeta, dataStates);

    const annihilationCounts = gameVariables.value(
      GAME_VARIABLE.DUNGEON_ANNIHILATION_COUNTS
    );
    const annCount = annihilationCounts[itemId];
    appendAnnihilationSection(glossaryText, itemMeta, annCount, dataItems);
    appendTreasureChestSection(glossaryText, itemId, itemMeta, dataItems);

    glossaryText.push(Glossarytext1AddUniqueMaterials(itemMeta, dataItems));
    const enemyPopArray = appendEnemyPopSection(glossaryText, itemMeta);

    glossaryText.push(
      Glossarytext1ProcessEnemyData(
        enemyPopArray,
        dataEnemies,
        dataStates,
        itemMeta
      )
    );

    gameVariables.value(variableId)[itemId] = glossaryText.join("");
  };

  // Helper function to process unique materials
  function Glossarytext1AddUniqueMaterials(itemMeta, dataItems) {
    const materialTextArray = [];
    let materialCount = 0;

    for (let i = 1; i <= 10; i++) {
      if (!itemMeta["UniqueMaterial" + i]) continue;

      if (materialCount === 0) {
        const rareMaterialHeading = colorTaggedText(16, "・希少採取素材");
        materialTextArray.push("\n" + rareMaterialHeading);
      }

      const uniqueMaterialArray = itemMeta["UniqueMaterial" + i].split(",");
      if (uniqueMaterialArray[0] >= 1) {
        const materialItemName = dataItems[Number(uniqueMaterialArray[0])].name;
        const materialNameLabel = colorTaggedText(3, materialItemName);
        materialTextArray.push(`【${materialNameLabel}】`);
        materialCount += 1;

        if (materialCount % 3 === 0) {
          materialTextArray.push("\n");
        }
      }
    }

    const materialText = materialTextArray.join("");
    return materialText + "\n";
  }

  // Clones the database enemy described by a <PopEnemy*> row so the glossary can
  // override its name, graphic and actions without touching the real entry.
  function cloneGlossaryEnemy(enemyInfo, cloneIndex, dataEnemies) {
    const enemyId = Number(enemyInfo[0]);
    const cloneId = ENEMY_CLONE_BASE_ID + cloneIndex;
    dataEnemies[cloneId] = Object.assign({}, dataEnemies[enemyId]);
    const clonedEnemy = dataEnemies[cloneId];
    clonedEnemy.name = enemyInfo[1];
    clonedEnemy.battlerName = enemyInfo[2];
    clonedEnemy.battlerHue = Number(enemyInfo[3]);
    ENEMY_ACTION_SKILL_SLOTS.forEach((actionSlot) => {
      clonedEnemy.actions[actionSlot].skillId = Number(
        enemyInfo[actionSlot + ENEMY_ACTION_SKILL_SLOTS.length]
      );
    });
    return clonedEnemy;
  }

  // Passive states are described once even when several enemies share them.
  function appendPassiveStateDescriptions(
    enemyData,
    dataStates,
    processedStateNames,
    processedText
  ) {
    const passiveStateMeta = enemyData.meta["Passive State"];
    if (!passiveStateMeta) return;
    passiveStateMeta.split(",").forEach((passiveStateId) => {
      const state = dataStates[Number(passiveStateId)];
      if (processedStateNames.has(state.name)) return;
      processedText.push(`${state.description}\n`);
      processedStateNames.add(state.name);
    });
  }

  // Map wide <EnemySpecialState> list, appended before the per-enemy list.
  function appendEnemySpecialStateDescriptions(itemMeta, dataStates, processedText) {
    const specialStateMeta = itemMeta["EnemySpecialState"];
    if (!specialStateMeta) return;
    specialStateMeta.split(",").forEach((specialStateId) => {
      const stateId = Number(specialStateId);
      if (stateId < 1) return;
      processedText.push(`${dataStates[stateId].description}\n`);
    });
  }

  function matchesConditionMeta(conditionMetaValue, candidateText) {
    return conditionMetaValue
      .split(",")
      .some((conditionPattern) => candidateText.match(conditionPattern));
  }

  // One entry per state name, with a line break every third entry.
  function appendConditionalStateText(
    processedText,
    processedStateNames,
    state,
    lineCounter
  ) {
    if (processedStateNames.has(state.name)) return;
    const conditionalStateName = colorTaggedText(14, state.name);
    processedText.push(`【${conditionalStateName}】`);
    processedStateNames.add(state.name);
    lineCounter.count += 1;
    if (lineCounter.count % CONDITIONAL_STATE_PER_LINE === 0) {
      processedText.push("\n");
    }
  }

  // Both tags add to the same list: the state name is matched against
  // <NameCondiAddState> and the battler graphic against <GraphicNameCondiAddState>.
  const CONDITIONAL_STATE_MATCHERS = [
    { metaKey: "NameCondiAddState", getCandidateText: (enemy) => enemy.name },
    {
      metaKey: "GraphicNameCondiAddState",
      getCandidateText: (enemy) => enemy.battlerName
    }
  ];

  function appendMatchingConditionalStates(
    processedText,
    processedStateNames,
    enemy,
    dataStates,
    lineCounter
  ) {
    valueEnemyAddState.forEach((stateId) => {
      const state = dataStates[stateId];
      CONDITIONAL_STATE_MATCHERS.forEach((matcher) => {
        const conditionMetaValue = state.meta[matcher.metaKey];
        if (!conditionMetaValue) return;
        const candidateText = matcher.getCandidateText(enemy);
        if (!matchesConditionMeta(conditionMetaValue, candidateText)) return;
        appendConditionalStateText(
          processedText,
          processedStateNames,
          state,
          lineCounter
        );
      });
    });
  }

  // Builds the shared state description block of every cloned enemy.
  function Glossarytext1ProcessEnemyData(
    enemyPopArray,
    dataEnemies,
    dataStates,
    itemMeta
  ) {
    const processedText = [];
    const processedStateNames = new Set();

    enemyPopArray.forEach((enemyInfo, cloneIndex) => {
      const clonedEnemy = cloneGlossaryEnemy(enemyInfo, cloneIndex, dataEnemies);
      appendPassiveStateDescriptions(
        clonedEnemy,
        dataStates,
        processedStateNames,
        processedText
      );
    });

    appendEnemySpecialStateDescriptions(itemMeta, dataStates, processedText);
    processedText.push("\n");

    const lineCounter = { count: 0 };
    const lastCloneId = ENEMY_CLONE_BASE_ID + enemyPopArray.length;
    for (
      let enemyId = ENEMY_CLONE_BASE_ID;
      enemyId < lastCloneId;
      enemyId++
    ) {
      const enemy = dataEnemies[enemyId];
      if (!enemy) continue;
      appendMatchingConditionalStates(
        processedText,
        processedStateNames,
        enemy,
        dataStates,
        lineCounter
      );
    }

    return processedText.join("");
  }

  //図鑑のテキスト代入ボス分$gameVariables.value(305)[id]
  // Icon + name label of a database skill, as used by the glossary lines.
  function glossarySkillLabel(skill) {
    return `\x1bI[${skill.iconIndex}]${skill.name}`;
  }

  // Drops the "[戦闘中1回]" marker of a skill description; the glossary hides it.
  function stripOncePerBattleMarker(description) {
    const oncePerBattleText = "[" + colorTaggedText(2, "戦闘中1回") + "]";
    return description.replace(oncePerBattleText, "");
  }

  // Name, level and defeat count of a defeated boss.
  function appendBossHeaderLines(glossaryText, itemData, bossName, defeatCount) {
    const bossLevel = Number(itemData.meta["BossLV"]);
    const bossNameLabel = colorTaggedText(16, "名前：");
    glossaryText.push(`${bossNameLabel}${bossName}\u3000ＬＶ：${bossLevel}\u3000`);
    const defeatCountLabel = colorTaggedText(16, "討伐回数：");
    const defeatCountText = colorTaggedText(10, `${defeatCount}`);
    glossaryText.push(`${defeatCountLabel}${defeatCountText} \n`);
  }

  // Normal attack skill plus the additional attack skills, then a line break.
  function appendBossAttackLines(glossaryText, itemData, bossInfo) {
    const normalAttackSkill = $dataSkills[Number(bossInfo[4])];
    glossaryText.push(
      colorTaggedText(16, "通常攻撃") + glossarySkillLabel(normalAttackSkill) + " "
    );
    const additionalAttackMeta = itemData.meta["BossAddAttack"];
    if (additionalAttackMeta) {
      for (const additionalAttack of additionalAttackMeta.split(",")) {
        const attackSkill = $dataSkills[Number(additionalAttack)];
        glossaryText.push(`\\I[${attackSkill.iconIndex}]${attackSkill.name} `);
      }
    }
    glossaryText.push("\n");
  }

  // Ability skill and its description.
  function appendBossAbilityLines(glossaryText, bossInfo) {
    const abilitySkill = $dataSkills[Number(bossInfo[5])];
    glossaryText.push(
      colorTaggedText(16, "アビリティ") + glossarySkillLabel(abilitySkill) + "\n"
    );
    glossaryText.push(stripOncePerBattleMarker(abilitySkill.description) + "\n");
  }

  // Additional skills of the boss, one name per line.
  function appendBossAdditionalSkillLines(glossaryText, itemData) {
    const additionalSkillMeta = itemData.meta["BossAddSkill"];
    if (!additionalSkillMeta) return;
    for (const additionalSkill of additionalSkillMeta.split(",")) {
      const skill = $dataSkills[Number(additionalSkill)];
      glossaryText.push(`\\I[${skill.iconIndex}]${skill.name}\n`);
    }
  }

  // Ultimate skill and its description.
  function appendBossUltimateLines(glossaryText, bossInfo) {
    const ultimateSkill = $dataSkills[Number(bossInfo[6])];
    glossaryText.push(
      colorTaggedText(16, "奥義") + glossarySkillLabel(ultimateSkill) + "\n"
    );
    glossaryText.push(stripOncePerBattleMarker(ultimateSkill.description) + "\n");
  }

  // State descriptions; only the first one is printed without the zero / NaN guard.
  function appendBossStateLines(glossaryText, itemData) {
    const stateInformationMeta = itemData.meta["BossStateInformation"];
    if (!stateInformationMeta) return;
    glossaryText.push("\n");
    const stateInfos = stateInformationMeta.split(",");

    const primaryStateId = Number(stateInfos[0]);
    if (!isNaN(primaryStateId)) {
      glossaryText.push(`${$dataStates[primaryStateId].description}\n`);
    }

    for (let stateIndex = 1; stateIndex < stateInfos.length; stateIndex++) {
      if (!stateInfos[stateIndex]) continue;
      const stateId = Number(stateInfos[stateIndex]);
      if (isNaN(stateId) || stateId === 0) continue;
      glossaryText.push(`${$dataStates[stateId].description}\n`);
    }
  }

  scene_Glossarytext2 = function (itemId, variableId) {
    const itemData = $dataItems[itemId];
    const glossaryText = [colorTaggedText(16, "＜ボス情報＞") + "\n"];
    const bossEnemyMeta = itemData.meta["BossEnemy"];
    const bossDefeatCount =
      $gameVariables.value(GAME_VARIABLE.DUNGEON_BOSS_DEFEAT_COUNTS)[itemId];

    if (!bossEnemyMeta) {
      glossaryText.push("※ ボス不在。");
    } else if (!(bossDefeatCount >= 1)) {
      glossaryText.push("情報なし。討伐後に情報更新。");
    } else {
      const bossInfo = bossEnemyMeta.split(",");
      const bossName = bossInfo[1];

      appendBossHeaderLines(glossaryText, itemData, bossName, bossDefeatCount);
      appendBossAttackLines(glossaryText, itemData, bossInfo);
      appendBossAbilityLines(glossaryText, bossInfo);
      appendBossAdditionalSkillLines(glossaryText, itemData);
      appendBossUltimateLines(glossaryText, bossInfo);
      appendBossStateLines(glossaryText, itemData);
    }

    $gameVariables.value(variableId)[itemId] = glossaryText.join("");
  };

  //図鑑のテキスト代入ボス特殊行動
  scene_Glossarytext3 = function (itemId, variableId) {
    const glossaryText = [];
    const itemData = $dataItems[itemId];
    let specialActionCount = 0;

    const specialActionHeading = colorTaggedText(16, "＜ボス特殊行動一覧＞");
    glossaryText.push(specialActionHeading + "\n");

    // If boss hasn't been defeated yet, show placeholder text
    if ($gameVariables.value(GAME_VARIABLE.DUNGEON_BOSS_DEFEAT_COUNTS)[itemId] < 1) {
      glossaryText.push("情報なし。討伐後に情報更新。");
      $gameVariables.value(variableId)[itemId] = glossaryText.join("");
      return;
    }

    // Process all possible special actions
    for (let actionIndex = 1; actionIndex <= 15; actionIndex++) {
      const metaKey = "BossSpecialAction" + actionIndex;
      if (!itemData.meta[metaKey]) continue;

      specialActionCount++;
      const actionData = itemData.meta[metaKey].split(",");
      const triggerType = Number(actionData[0]);
      const triggerValue = Number(actionData[1]);
      const skillId = Number(actionData[2]);

      // Add trigger condition text
      glossaryText.push(getTriggerText(triggerType, triggerValue));

      // Add skill information
      const bossSkillMarker = colorTaggedText(10, `\x1bSIN[${skillId}]`);
      glossaryText.push(`${bossSkillMarker}\n`);
      glossaryText.push(`${$dataSkills[skillId].description}\n`);
    }

    // If no special actions found
    if (specialActionCount === 0) {
      glossaryText.push("なし");
    }

    $gameVariables.value(variableId)[itemId] = glossaryText.join("");
  };

  // Helper function to get trigger text based on type and value
  function getTriggerText(triggerType, triggerValue) {
    switch (triggerType) {
      case 0:
      case 9:
        const effectAmount = colorTaggedText(2, `HP${triggerValue}%`);
        return `<${effectAmount}以下で発動>\n`;
      case 1:
        const effectAmount2 = colorTaggedText(2, `MP${triggerValue}%`);
        return `<${effectAmount2}以下で発動>\n`;
      case 2:
        const effectAmount3 = colorTaggedText(2, `${triggerValue}%`);
        return `<${effectAmount3}ターン毎に発動>\n`;
      case 3:
        const effectName = colorTaggedText(2, "オーバードライブ");
        return `<${effectName}時に発動>\n`;
      default:
        const effectName2 = colorTaggedText(2, "特殊条件");
        return `<${effectName2}で発動>\n`;
    }
  }

  //マップ情報を代入
  const jouhouMapResetVariableIds = [
    37, 81, 82, 197, 207, 222, 224, 226, 227, 232, 230, 235, 236, 240, 241, 251,
    256, 260, 266, 329, 507, 508
  ];
  // Clears every map related switch and variable before the new map is read.
  function resetMapInfoState(gameSwitches, gameVariables) {
    for (let switchId = 201; switchId <= 377; switchId++) {
      gameSwitches.setValue(switchId, false);
    }
    jouhouMapResetVariableIds.forEach((variableId) => {
      gameVariables.setValue(variableId, 0);
    });
  }

  // Applies the "MapSwi" default switches, unless a conditional map switch won.
  function applyDefaultMapSwitches(dataMap, gameSwitches, foundMapSwitch) {
    if (foundMapSwitch !== 0 || !dataMap.meta["MapSwi"]) return;
    const switchIds = dataMap.meta["MapSwi"].split(",").map(Number);
    switchIds.forEach((switchId) => {
      if (switchId !== 0) {
        gameSwitches.setValue(switchId, true);
      }
    });
  }

  // Map type, location and background setup of one map: everything that only needs
  // the map notes and the map metadata.
  function setupMapInfoSources(dataMap, gameVariables, gameSwitches) {
    // Extract map metadata
    const mapMeta = extractMapMetadata(dataMap);

    // Set basic map type switches
    setMapTypeSwitches(mapMeta, gameSwitches, gameVariables);

    // Set town and battle map info
    setMapLocationInfo(gameSwitches, gameVariables);

    // Determine current map info source
    // NOTE: this must stay after setMapLocationInfo; it reads variable 230 and
    // DUNGEON_INFO_ITEM_ID which setMapLocationInfo writes.
    const mapInfo = determineMapInfoSource(
      dataMap,
      gameVariables,
      gameSwitches
    );

    // Play start sound effect
    mapPlayStartSoundEffect(mapInfo, gameSwitches);

    // Set up enemy states and map variables
    setupMapEnemyVariables(mapInfo, gameVariables);

    // Set up escape and move positions
    setupMapPositions(mapInfo, gameVariables);

    // Process unique material slots
    setupUniqueMaterials(mapInfo, gameVariables);

    // Configure enemy and boss setup
    setupMapEnemiesAndBoss(mapInfo);

    // Set up battlebacks and parallax
    setupMapBattlebacksAndParallax(
      mapInfo,
      dataMap,
      gameVariables,
      gameSwitches,
      $gameMap
    );

    // Configure BGS and BGM
    setupMapBackgroundAudio(mapInfo, dataMap, gameVariables, gameSwitches);
  }

  jouhou_map = function () {
    // Run on every map loading

    const gameVariables = $gameVariables;
    const gameSwitches = $gameSwitches;
    const dataMap = $dataMap;

    // Reset map-related switches and variables
    resetMapInfoState(gameSwitches, gameVariables);

    // Process conditional map switches
    const conditionalMapSwitches = gameVariables.value(356);
    const foundMapSwitch = processMapConditionalSwitches(
      dataMap,
      gameSwitches,
      gameVariables,
      conditionalMapSwitches
    );

    // Apply default map switches if no conditions matched
    applyDefaultMapSwitches(dataMap, gameSwitches, foundMapSwitch);

    setupMapInfoSources(dataMap, gameVariables, gameSwitches);
  };

  // Helper Functions

  processMapConditionalSwitches = function (
    dataMap,
    gameSwitches,
    gameVariables,
    conditionalMapSwitches
  ) {
    const dataMapMeta = dataMap.meta;

    // Variable conditions are checked first; the switch conditions only run when none matched.
    if (applyFirstMatchingConditionalSwitch(
      dataMapMeta,
      CONDITIONAL_MAP_VARIABLE_KEYS,
      (conditionText) => {
        const [varId, varValue] = conditionText.split(",").map(Number);
        return gameVariables.value(varId) >= varValue;
      },
      gameSwitches,
      conditionalMapSwitches
    )) {
      return 1;
    }

    return applyFirstMatchingConditionalSwitch(
      dataMapMeta,
      CONDITIONAL_MAP_SWITCH_KEYS,
      (conditionText) => gameSwitches.value(Number(conditionText)),
      gameSwitches,
      conditionalMapSwitches
    ) ? 1 : 0;
  }

  // Meta key prefixes of the two conditional switch passes.
  const CONDITIONAL_MAP_VARIABLE_KEYS = { condition: "ChangeMapVal", target: "MapSwiCVal" };
  const CONDITIONAL_MAP_SWITCH_KEYS = { condition: "ChangeMapSwi", target: "MapSwiCSwi" };

  // Runs the highest matching entry (index 9 down to 1) of one pass; true when one matched.
  function applyFirstMatchingConditionalSwitch(
    dataMapMeta,
    keySuffixes,
    isConditionMet,
    gameSwitches,
    conditionalMapSwitches
  ) {
    for (let entryIndex = 9; entryIndex > 0; entryIndex--) {
      const conditionText = dataMapMeta[keySuffixes.condition + entryIndex];
      const targetSwitchText = dataMapMeta[keySuffixes.target + entryIndex];
      if (!conditionText || !targetSwitchText) continue;
      if (!isConditionMet(conditionText)) continue;

      mapActivateConditionalSwitches(
        targetSwitchText,
        gameSwitches,
        conditionalMapSwitches
      );
      return true;
    }

    return false;
  };

  mapActivateConditionalSwitches = function (
    switchIdString,
    gameSwitches,
    conditionalMapSwitches
  ) {
    const switchIds = switchIdString.split(",").map(Number);

    switchIds.forEach((switchId) => {
      if (switchId === 0) return;

      gameSwitches.setValue(switchId, true);

      if (conditionalMapSwitches[switchId] !== 0) {
        conditionalMapSwitches[switchId] = 1;
      }
    });
  };

  extractMapMetadata = function (dataMap) {
    const mapMeta = {
      outInFloorType: 0,
      outInFloorValue: 0,
      homeType: 0,
      animalType: 0,
      npcType: 0,
      mapHeight: dataMap.height,
      mapWidth: dataMap.width
    };

    const dataMapMeta = dataMap.meta;

    if (dataMapMeta["OutIn_Froor"]) {
      const [type, value] = dataMapMeta["OutIn_Froor"].split(",").map(Number);
      mapMeta.outInFloorType = type;
      mapMeta.outInFloorValue = value;
    }

    if (dataMapMeta["NPC"]) mapMeta.npcType = Number(dataMapMeta["NPC"]);
    if (dataMapMeta["Home"]) mapMeta.homeType = Number(dataMapMeta["Home"]);
    if (dataMapMeta["Animal"])
      mapMeta.animalType = Number(dataMapMeta["Animal"]);

    return mapMeta;
  };

  // Switches and variables filled from the map notes by setMapTypeSwitches().
  const MAP_TYPE_SWITCH_IDS = {
    INDOOR_FLOOR: 203, // outInFloorType >= 1
    OUTDOOR_FLOOR: 204, // outInFloorType == 0
    HOME_TYPES: { 1: 206, 2: 231 },
    ANIMAL: 208 // animalType >= 1
  };
  const MAP_TYPE_VARIABLE_IDS = {
    FLOOR_VALUE: 232, // outInFloorValue
    NPC_TYPE: 241, // npcType
    MAP_SIZE: 238 // (width + height) / 20
  };

  setMapTypeSwitches = function (mapMeta, gameSwitches, gameVariables) {
    // Set indoor/outdoor switch
    if (mapMeta.outInFloorType >= 1) {
      gameSwitches.setValue(MAP_TYPE_SWITCH_IDS.INDOOR_FLOOR, true);
    } else {
      gameSwitches.setValue(MAP_TYPE_SWITCH_IDS.OUTDOOR_FLOOR, true);
    }

    // Set floor value if available
    if (mapMeta.outInFloorValue >= 1) {
      gameVariables.setValue(MAP_TYPE_VARIABLE_IDS.FLOOR_VALUE, mapMeta.outInFloorValue);
    }

    // Set NPC type if available
    if (mapMeta.npcType >= 1) {
      gameVariables.setValue(MAP_TYPE_VARIABLE_IDS.NPC_TYPE, mapMeta.npcType);
    }

    // Set home switches if applicable
    const homeTypeSwitchId = MAP_TYPE_SWITCH_IDS.HOME_TYPES[mapMeta.homeType];
    if (homeTypeSwitchId) gameSwitches.setValue(homeTypeSwitchId, true);

    // Calculate map size variable
    gameVariables.setValue(
      MAP_TYPE_VARIABLE_IDS.MAP_SIZE,
      (mapMeta.mapHeight + mapMeta.mapWidth) / 20
    );

    // Set animal switch if applicable
    if (mapMeta.animalType >= 1) {
      gameSwitches.setValue(MAP_TYPE_SWITCH_IDS.ANIMAL, true);
    }
  };

  setMapLocationInfo = function (gameSwitches, gameVariables) {
    // Check town locations
    const dataWeapons = $dataWeapons;
    valueJouhouTown.forEach((weaponId) => {
      const switchId = Number(dataWeapons[weaponId].meta["MapSwitch"]);
      if (gameSwitches.value(switchId)) {
        gameVariables.setValue(230, weaponId);
        gameSwitches.setValue(202, true);
      }
    });

    // Check battle map locations
    const dataItems = $dataItems;
    valueJouhouBattleMap.forEach((itemId) => {
      const switchId = Number(dataItems[itemId].meta["MapSwitch"]);
      if (gameSwitches.value(switchId)) {
        gameVariables.setValue(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID, itemId);
        gameSwitches.setValue(GAME_SWITCH.BATTLE_MAP, true);
      }
    });
  };

  determineMapInfoSource = function (dataMap, gameVariables, gameSwitches) {
    let mapInfo = dataMap;

    // Town map info
    if (gameVariables.value(230) >= 1) {
      const townId = gameVariables.value(230);
      mapInfo = $dataWeapons[townId];

      // Check if this is a repeated visit to the same town
      const visitMemory = gameVariables.value(237);
      if (townId === visitMemory[1] && visitMemory[0] === 1) {
        gameSwitches.setValue(216, true);
      } else {
        gameVariables.setValue(237, [1, townId]);
        gameSwitches.setValue(216, false);
      }
    }

    // Battle map info
    if (gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID) >= 1) {
      const battleMapId = gameVariables.value(
        GAME_VARIABLE.DUNGEON_INFO_ITEM_ID
      );
      mapInfo = $dataItems[battleMapId];

      // Check if this is a repeated visit to the same battle map
      const visitMemory = gameVariables.value(237);
      if (battleMapId === visitMemory[1] && visitMemory[0] === 2) {
        gameSwitches.setValue(216, true);
      } else {
        gameVariables.setValue(237, [2, battleMapId]);
        gameSwitches.setValue(216, false);
      }
    }

    return mapInfo;
  };

  mapPlayStartSoundEffect = function (mapInfo, gameSwitches) {
    const seKey = gameSwitches.value(GAME_SWITCH.NIGHT)
      ? "StartSeN"
      : "StartSe";

    if (!mapInfo.meta[seKey]) return;

    const [seName, seVolume, sePitch] = mapInfo.meta[seKey].split(",");
    AudioManager.playSe({
      name: seName,
      volume: Number(seVolume),
      pitch: Number(sePitch),
      pan: 0
    });
  };

  // Map note driven variables written by setupMapEnemyVariables().
  const MAP_NOTE_VARIABLE_IDS = {
    WATER_ITEM: 266, // getWaterItem
    WEATHER: 256, // weatherSetP
    WEATHER_NIGHT: 251, // weatherSetPN, the map note wins over the map meta
    ENEMY_LEVEL: 270 // EnemyLV, first field
  };

  // Positive ids of a comma separated note list.
  function collectPositiveNoteIds(noteValue) {
    const noteIds = [];
    for (const noteField of noteValue.split(",")) {
      const noteId = Number(noteField);
      if (noteId >= 1) noteIds.push(noteId);
    }
    return noteIds;
  }

  // "<EnemySpecialState>" note of the map, as state ids.
  function setupMapSpecialStates(gameVariables, mapInfoMeta) {
    // The stored array is filled in place, like the original block did.
    gameVariables.setValue(GAME_VARIABLE.MAP_ENEMY_SPECIAL_STATES, []);
    const specialStates = gameVariables.value(
      GAME_VARIABLE.MAP_ENEMY_SPECIAL_STATES
    );
    const enemySpecialStateMeta = mapInfoMeta["EnemySpecialState"];
    if (!enemySpecialStateMeta) return;
    for (const stateId of collectPositiveNoteIds(enemySpecialStateMeta)) {
      specialStates.push(stateId);
    }
  }

  // Night weather of the map: the map note wins over the map meta.
  function resolveMapWeatherNightId(mapInfoMeta) {
    const noteValue = mapInfoMeta["weatherSetPN"] || $dataMap.meta["weatherSetPN"];
    if (!noteValue) return undefined;
    return Number(noteValue);
  }

  setupMapEnemyVariables = function (mapInfo, gameVariables) {
    // Cache map meta data
    const mapInfoMeta = mapInfo.meta;

    // Initialize special state array
    setupMapSpecialStates(gameVariables, mapInfoMeta);

    // Set various map-specific variables
    if (mapInfoMeta["getWaterItem"]) {
      gameVariables.setValue(
        MAP_NOTE_VARIABLE_IDS.WATER_ITEM,
        Number(mapInfoMeta["getWaterItem"])
      );
    }

    if (mapInfoMeta["weatherSetP"]) {
      gameVariables.setValue(
        MAP_NOTE_VARIABLE_IDS.WEATHER,
        Number(mapInfoMeta["weatherSetP"])
      );
    }

    const weatherNightId = resolveMapWeatherNightId(mapInfoMeta);
    if (weatherNightId !== undefined) {
      gameVariables.setValue(MAP_NOTE_VARIABLE_IDS.WEATHER_NIGHT, weatherNightId);
    }

    applyNumericMetadataVariables(mapInfoMeta, gameVariables, [
      ["MapCount", 217],
      ["MapEnemyMaxPop", 334],
      ["MapEnemyPopC", 224],
      ["MapEnemyPopCH", 227],
      ["HEnemyPopSwi", 236],
      ["DeadBody", 260]
    ]);
    // Set enemy level variable
    if (mapInfoMeta["EnemyLV"]) {
      gameVariables.setValue(
        MAP_NOTE_VARIABLE_IDS.ENEMY_LEVEL,
        Number(mapInfoMeta["EnemyLV"].split(",")[0])
      );
    }

    // Set switches from OnSwitch metadata
    const onSwitchMeta = mapInfoMeta["OnSwitch"];
    if (onSwitchMeta) {
      for (const switchId of collectPositiveNoteIds(onSwitchMeta)) {
        $gameSwitches.setValue(switchId, true);
      }
    }
  };

  setupMapPositions = function (mapInfo, gameVariables) {
    const mapInfoMeta = mapInfo.meta;
    const positions = gameVariables.value(204);

    // Set escape position
    if (mapInfoMeta["EscapeMapID"]) {
      const [mapId, x, y] = mapInfoMeta["EscapeMapID"].split(",").map(Number);
      positions[0] = mapId;
      positions[1] = x;
      positions[2] = y;
    }

    // Set move position
    if (mapInfoMeta["MoveMapID"]) {
      const [mapId, x, y] = mapInfoMeta["MoveMapID"].split(",").map(Number);
      positions[0] = mapId;
      positions[1] = x;
      positions[2] = y;
    }

    // Set permission cloth
    const clothKey = "PermissionCloth";
    if (mapInfoMeta[clothKey]) {
      gameVariables.setValue(207, Number(mapInfoMeta[clothKey]));
    } else if ($dataMap.meta[clothKey]) {
      gameVariables.setValue(207, Number($dataMap.meta[clothKey]));
    }
  };

  setupUniqueMaterials = function (mapInfo, gameVariables) {
    // Initialize unique material slots array
    gameVariables.setValue(259, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    const mapInfoMeta = mapInfo.meta;
    // Process unique materials and backgrounds
    for (let idx = 1; idx <= 9; idx++) {
      // Preload background images
      if (mapInfoMeta["BG" + idx]) {
        Galv.CACHE.load("parallaxes", mapInfoMeta["BG" + idx].split(",")[0]);
      }

      if (mapInfoMeta["BGN" + idx]) {
        Galv.CACHE.load("parallaxes", mapInfoMeta["BGN" + idx].split(",")[0]);
      }

      // Set unique material IDs
      if (mapInfoMeta["UniqueMaterial" + idx]) {
        const materialId = Number(
          mapInfoMeta["UniqueMaterial" + idx].split(",")[0]
        );
        gameVariables.value(259)[idx] = materialId;
      }
    }
  };

  setupMapEnemiesAndBoss = function (mapInfo) {
    // Setup enemies if defined
    if (mapInfo.meta["PopEnemy1"] || mapInfo.meta["PopEnemy9"]) {
      popEnemy_setUp(mapInfo);
      enemy_troopPush();
      henemy_troopPush();
    }

    // Setup boss if defined
    if (mapInfo.meta["BossEnemy"]) {
      boss_setup1(1, 0);
    }
  };

  setupMapBattlebacksAndParallax = function (
    mapInfo,
    dataMap,
    gameVariables,
    gameSwitches,
    gameMap
  ) {
    const backgrounds = configureMapEnvironmentBattlebacks(
      mapInfo.meta,
      gameVariables,
      gameSwitches,
      gameMap
    );
    if (backgrounds.backgroundKey)
      setMapBgVariables(gameVariables, mapInfo, backgrounds.backgroundKey);
    parallaxesSound_switchChange(1);
    applyMapBackgroundOverrides(
      dataMap,
      backgrounds,
      gameVariables,
      gameSwitches,
      gameMap
    );
    applyMapMetadataParallax(dataMap.meta, gameVariables, gameMap);
  };

  // "name,volume,pitch,pan" audio note -> [name, volume, pitch, pan].
  function parseAudioNote(audioNote) {
    const [audioName, audioVolume, audioPitch, audioPan] = audioNote.split(",");
    return [audioName, Number(audioVolume), Number(audioPitch), Number(audioPan)];
  }

  // Map BGS of the current map; it keeps playing while the same track is requested.
  function setupMapBgs(mapInfo, dataMap, gameVariables, gameSwitches) {
    const bgsKey = gameSwitches.value(GAME_SWITCH.NIGHT) ? "BGSN" : "BGS";
    const bgsSource = determineAudioMapInfoSource(
      mapInfo,
      dataMap,
      gameVariables,
      bgsKey
    );

    if (!bgsSource.meta[bgsKey]) {
      AudioManager.fadeOutBgs(1);
      valueMapBGS = [0, 0, 0, 0];
      return;
    }

    const bgsValues = parseAudioNote(bgsSource.meta[bgsKey]);
    if (bgsValues[0] === valueMapBGS[0]) return;

    valueMapBGS = bgsValues;
    AudioManager.playBgs({
      name: valueMapBGS[0],
      volume: valueMapBGS[1],
      pitch: valueMapBGS[2],
      pan: valueMapBGS[3]
    });
  }

  // Map BGM of the current map; "NoMusic" and the music mute switch both fade out.
  function setupMapBgm(mapInfo, dataMap, gameVariables, gameSwitches) {
    const bgmKey = gameSwitches.value(GAME_SWITCH.NIGHT) ? "BGMN" : "BGM";
    const bgmSource = determineAudioMapInfoSource(
      mapInfo,
      dataMap,
      gameVariables,
      bgmKey
    );

    if (!bgmSource.meta[bgmKey]) {
      AudioManager.stopBgm();
      return;
    }

    valueMapBGM = parseAudioNote(bgmSource.meta[bgmKey]);
    parallaxesSound_switchChange(2);

    // While an event owns the progress the map music is faded, not switched.
    if (gameSwitches.value(GAME_SWITCH.EVENT_PROGRESS_ACTIVE)) {
      AudioManager.fadeOutBgm(3);
      return;
    }
    if (valueMapBGM[0] === "NoMusic") {
      AudioManager.fadeOutBgm(10);
      return;
    }
    if (AudioManager.saveBgm().name === valueMapBGM[0]) return;
    AudioManager.playBgm({
      name: valueMapBGM[0],
      volume: valueMapBGM[1],
      pitch: valueMapBGM[2],
      pan: valueMapBGM[3]
    });
  }

  setupMapBackgroundAudio = function (
    mapInfo,
    dataMap,
    gameVariables,
    gameSwitches
  ) {
    // Set up BGS (background sound)
    setupMapBgs(mapInfo, dataMap, gameVariables, gameSwitches);

    // Set up BGM (background music)
    setupMapBgm(mapInfo, dataMap, gameVariables, gameSwitches);
  };

  determineAudioMapInfoSource = function (
    mapInfo,
    dataMap,
    gameVariables,
    metaKey
  ) {
    // Reset to base map info
    let currentMapInfo = mapInfo;

    // Check if battle map info should be used
    if (gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID) >= 1) {
      currentMapInfo =
        $dataItems[gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)];
    }

    // Check if town map info should be used
    if (gameVariables.value(230) >= 1) {
      currentMapInfo = $dataWeapons[gameVariables.value(230)];
    }

    // If data map has the key, use that (highest priority)
    if (dataMap.meta[metaKey]) {
      currentMapInfo = dataMap;
    }

    return currentMapInfo;
  };

  // Helper function to set BG variables from meta
  setMapBgVariables = function (gameVariables, mapInfo, bgKey) {
    if (mapInfo.meta[bgKey]) {
      const bgMeta = mapInfo.meta[bgKey].split(",");
      gameVariables.setValue(GAME_VARIABLE.MENU_BACKGROUND_NAME, bgMeta[0]);
      gameVariables.setValue(81, Number(bgMeta[1]));
      gameVariables.setValue(82, Number(bgMeta[2]));
    }
  };

  //スイッチに応じて遠景と音楽設定スクリプト
  //スイッチID -> メニュー背景名(parallaxesSound_switchChange用)
  const PARALLAX_BG_BY_SWITCH_ID = [
    { switchId: 233, backgroundName: "BG_Temple" },
    { switchId: 234, backgroundName: "BG_Shop1Items" },
    { switchId: 235, backgroundName: "BG_Shop3Weapons" },
    { switchId: 237, backgroundName: "BG_Shop3Weapons" }
  ];

  parallaxesSound_switchChange = function (switchStateId) {
    switch (switchStateId) {
      case 2:
        if ($gameSwitches.value(GAME_SWITCH.CHURCH)) {
          //結果を渡すためにverは付けない
          if (!$gameSwitches.value(GAME_SWITCH.NIGHT)) {
            valueMapBGM = ["41_TownTemple", 50, 100, 0];
          }
        }
        if ($gameSwitches.value(GAME_SWITCH.GUILD)) {
          if (!$gameSwitches.value(GAME_SWITCH.NIGHT)) {
            valueMapBGM = ["41_Guild", 50, 100, 0];
          }
        }
        break;
      case 1:
        for (const bgmEntry of PARALLAX_BG_BY_SWITCH_ID) {
          if (!$gameSwitches.value(bgmEntry.switchId)) continue;

          $gameVariables.setValue(
            GAME_VARIABLE.MENU_BACKGROUND_NAME,
            bgmEntry.backgroundName
          );
          $gameVariables.setValue(GAME_VARIABLE.BACKGROUND_SCROLL_X, 0);
          $gameVariables.setValue(GAME_VARIABLE.BACKGROUND_SCROLL_Y, 0);
          if ($gameSwitches.value(GAME_SWITCH.NIGHT)) {
            const backgroundName = $gameVariables.value(
              GAME_VARIABLE.MENU_BACKGROUND_NAME
            );
            const nightBackgroundName = backgroundName + NIGHT_BACKGROUND_SUFFIX;
            $gameVariables.setValue(
              GAME_VARIABLE.MENU_BACKGROUND_NAME,
              nightBackgroundName
            );
          }
        }
        break;
    }
  };

  //雑魚エネミー設定スクリプト
  popEnemy_setUp = function (mapInfo) {
    const gameVariables = $gameVariables;
    const normalEnemyIds = [];
    const hEnemyIds = [];
    const rareEnemyIds = [];
    const enemyPresetStates = Array.from({ length: 11 }, () => []);
    gameVariables.setValue(220, normalEnemyIds);
    gameVariables.setValue(228, hEnemyIds);
    gameVariables.setValue(242, rareEnemyIds);
    gameVariables.setValue(
      GAME_VARIABLE.ENEMY_PRESET_STATES,
      enemyPresetStates
    );
    if (!mapInfo || !mapInfo.meta) return;
    for (let spawnSlot = 1; spawnSlot <= 10; spawnSlot++) {
      const spawnDefinition = mapInfo.meta["PopEnemy" + spawnSlot];
      if (!spawnDefinition) continue;
      const spawnValues = spawnDefinition.split(",");
      const sourceEnemy = $dataEnemies[Number(spawnValues[0])];
      if (!sourceEnemy) continue;
      const enemyId = 20 + spawnSlot;
      const enemyData = copyEnemySpawnData(sourceEnemy);
      $dataEnemies[enemyId] = enemyData;
      configureMapEnemySpawnData(enemyData, spawnValues);
      const addedStateIds = enemyPresetStates[spawnSlot];
      appendEnemyNameConditionStates(enemyData, addedStateIds);
      registerSpawnedEnemy(
        { normalEnemyIds, hEnemyIds, rareEnemyIds },
        addedStateIds,
        spawnSlot,
        enemyId
      );
    }
  }

  // Slot 9 is the H enemy, slots 7 and 8 are rare ones (they also start with state 480).
  const SPAWN_SLOT_H_ENEMY = 9;
  const RARE_SPAWN_SLOTS = [7, 8];
  const RARE_SPAWN_STATE_ID = 480;

  // Adds the copied enemy id to the list of its slot category.
  function registerSpawnedEnemy(enemyLists, addedStateIds, spawnSlot, enemyId) {
    if (spawnSlot == SPAWN_SLOT_H_ENEMY) {
      enemyLists.hEnemyIds.push(enemyId);
      return;
    }
    if (RARE_SPAWN_SLOTS.indexOf(spawnSlot) >= 0) {
      enemyLists.rareEnemyIds.push(enemyId);
      addedStateIds.push(RARE_SPAWN_STATE_ID);
      return;
    }
    enemyLists.normalEnemyIds.push(enemyId);
  };

  //簡易戦闘報酬設定スクリプト
  // Spawn pool entries of a map: "PopEnemy1".."PopEnemy10", first field is the enemy id.
  const MAP_POP_ENEMY_NOTE_COUNT = 10;
  // "Passive State" is shared with the enemy, "885" is the levelled state group.
  const SCALED_ENEMY_STATE_ID = 885;
  const ENEMY_STATE_LEVEL_BREAKPOINTS = [30, 60];

  // Random enemy id of the map spawn pool.
  function pickRandomPopEnemyId(mapInfo) {
    const popEnemyIds = [];
    for (let popIndex = 1; popIndex <= MAP_POP_ENEMY_NOTE_COUNT; popIndex++) {
      const popEnemyMeta = mapInfo.meta["PopEnemy" + popIndex];
      if (popEnemyMeta) popEnemyIds.push(Number(popEnemyMeta.split(",")[0]));
    }
    return popEnemyIds[getRandomIndex(popEnemyIds.length)];
  }

  // "<Passive State>" note of the picked enemy, as state ids.
  function collectPassiveStateIds(enemyData) {
    const passiveStateIds = [];
    const passiveStateMeta = enemyData.meta["Passive State"];
    if (!passiveStateMeta) return passiveStateIds;

    for (const stateId of passiveStateMeta.split(",")) {
      passiveStateIds.push(Number(stateId));
    }
    return passiveStateIds;
  }

  // States 885+ are levelled: the roll range widens with the enemy level.
  function resolveScaledEnemyStateId(stateId, enemyLevel) {
    if (stateId != SCALED_ENEMY_STATE_ID) return stateId;

    let rollRange = 11;
    if (enemyLevel >= ENEMY_STATE_LEVEL_BREAKPOINTS[0] && enemyLevel <= ENEMY_STATE_LEVEL_BREAKPOINTS[1]) {
      rollRange = 21;
    } else if (enemyLevel >= ENEMY_STATE_LEVEL_BREAKPOINTS[1]) {
      rollRange = 31;
    }
    return getRandomIndex(rollRange) + SCALED_ENEMY_STATE_ID;
  }

  // Preset states 1 and 2 of the map: the "enemy preset state" records.
  function applyPresetStates(actor, enemyPresetStates) {
    if (!Array.isArray(enemyPresetStates)) return;
    for (const presetIndex of [1, 2]) {
      const presetStateIds = enemyPresetStates[presetIndex] || [];
      for (let stateIndex = 0; stateIndex < presetStateIds.length; stateIndex++) {
        if (!(presetStateIds[stateIndex] >= 1)) continue;
        actor.addState(presetStateIds[stateIndex]);
      }
    }
  }

  // Special states of the map, with the levelled group resolved per entry.
  function applyMapEnemySpecialStates(actor, enemyLevel) {
    const mapEnemySpecialStates = $gameVariables.value(
      GAME_VARIABLE.MAP_ENEMY_SPECIAL_STATES
    );
    if (!mapEnemySpecialStates) return;
    for (let stateIndex = 0; stateIndex < mapEnemySpecialStates.length; stateIndex++) {
      actor.addState(
        resolveScaledEnemyStateId(mapEnemySpecialStates[stateIndex], enemyLevel)
      );
    }
  }

  // "<EnemyElement>" note: one random element state of the map.
  function applyRandomEnemyElementState(actor, mapInfo) {
    const enemyElementMeta = mapInfo.meta["EnemyElement"];
    if (!enemyElementMeta) return;
    const enemyElementValues = enemyElementMeta.split(",");
    actor.addState(
      Number(enemyElementValues[getRandomIndex(enemyElementValues.length)])
    );
  }

  actor1_setup1 = function (mapInfo, enemyLevel) {
    const selectedActor = $gameActors.actor(GAME_VARIABLE.SELECTED_ACTOR_ID);
    if (!selectedActor) return;
    selectedActor.addState(610);
    if (!mapInfo || !mapInfo.meta) return;

    const enemyData = $dataEnemies[pickRandomPopEnemyId(mapInfo)];
    if (!enemyData) return;

    for (const passiveStateId of collectPassiveStateIds(enemyData)) {
      selectedActor.addState(passiveStateId);
    }
    applyPresetStates(
      selectedActor,
      $gameVariables.value(GAME_VARIABLE.ENEMY_PRESET_STATES)
    );
    applyMapEnemySpecialStates(selectedActor, enemyLevel);
    applyRandomEnemyElementState(selectedActor, mapInfo);
    //console.log($gameActors.actor(20));
  };

  //ボス設定スクリプト
  // Clears the boss records a previous fight may have left behind.
  function resetBossRecords() {
    $gameSwitches.setValue(GAME_SWITCH.DIRECT_ENEMY_BOSS, false);
    $gameVariables.setValue(GAME_VARIABLE.BOSS_SOURCE_ID, 0);
    $gameVariables.setValue(
      GAME_VARIABLE.BOSS_GUARANTEED_DROPS,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    );
    $gameVariables.setValue(
      GAME_VARIABLE.BOSS_ACTIONS,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    );
    $gameVariables.setValue(
      GAME_VARIABLE.BOSS_SPECIAL_ACTIONS,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    );
  }

  // Note source of the fight: the dungeon info item (1) or the enemy itself (2).
  function selectBossSource(bossConfigId, bossEnemyId) {
    switch (numericCaseValue(bossConfigId)) {
      case 1:
        {
          const dungeonInfoItemId = $gameVariables.value(
            GAME_VARIABLE.DUNGEON_INFO_ITEM_ID
          );
          value = $dataItems[dungeonInfoItemId];
          valueBossEnemyId = dungeonInfoItemId;
        }
        break;
      case 2:
        {
          value = $dataEnemies[bossEnemyId];
          $gameSwitches.setValue(GAME_SWITCH.DIRECT_ENEMY_BOSS, true);
          valueBossEnemyId = bossEnemyId;
        }
        break;
    }
  }

  // Enemy id the boss is copied from: the enemy itself, or the first field of
  // "<BossEnemy>".
  function resolveBossSourceId(bossConfigId, bossEnemyId, bossEnemyValues) {
    if (bossConfigId == 2) return bossEnemyId;
    return Number(bossEnemyValues[0]);
  }

  // The boss fights its own copy of the enemy entry, so the database stays clean.
  function copyBossEnemyEntry(bossEnemySource) {
    $dataEnemies[valueBossEnemiesId] = copyEnemySpawnData(bossEnemySource);
    return $dataEnemies[valueBossEnemiesId];
  }

  boss_setup1 = function (bossConfigId, bossEnemyId) {
    if (bossConfigId != 1 && bossConfigId != 2) return;
    resetBossRecords();
    const bossActionValues = $gameVariables.value(GAME_VARIABLE.BOSS_ACTIONS);
    const bossSpecialActionValues = $gameVariables.value(
      GAME_VARIABLE.BOSS_SPECIAL_ACTIONS
    );
    //ボス行動は変数346に配列で設定する。
    //特殊行動は347に2次配列
    selectBossSource(bossConfigId, bossEnemyId);
    if (!value || !value.meta) return;

    const bossMeta = value.meta;
    configureBossGuaranteedDrops(bossMeta);
    const bossEnemyValues = readBossEnemyValues(bossMeta);
    //'<BossEnemy>'未有時の下部処理回避
    if (bossEnemyValues == 0) return;

    $gameVariables.setValue(
      GAME_VARIABLE.BOSS_SOURCE_ID,
      resolveBossSourceId(bossConfigId, bossEnemyId, bossEnemyValues)
    );
    const bossEnemySource = $dataEnemies[
      $gameVariables.value(GAME_VARIABLE.BOSS_SOURCE_ID)
    ];
    if (!bossEnemySource) return;

    const bossEnemyData = copyBossEnemyEntry(bossEnemySource);
    configureBossActionData(
      bossEnemyData,
      bossMeta,
      bossEnemyValues,
      bossActionValues,
      bossSpecialActionValues
    );
    configureBossActionDisplay(
      bossConfigId,
      bossActionValues,
      bossSpecialActionValues
    );
    applyBossFrontView(bossMeta);
    configureBossTroop(bossMeta, bossEnemyData, bossEnemyValues);
    applyBossInformationStates.call(this, bossMeta, bossEnemyData);
  }

  // "BossEnemy" lists the enemy ids; 0 keeps the original "no BossEnemy note" path.
  function readBossEnemyValues(bossMeta) {
    if (!bossMeta["BossEnemy"]) return 0;
    return bossMeta["BossEnemy"].split(",");
  }

  // A front boss is fought from the front view, whatever the system default is.
  function applyBossFrontView(bossMeta) {
    if (!bossMeta["FrontBoss"]) return;
    $dataSystem.optSideView = false;
  };

  //戦闘グループでボスステ付与
  troop_bossState = function () {
    if (!$gameSwitches.value(GAME_SWITCH.BOSS_BATTLE_IMMINENT)) return;

    const members2 = $gameTroop.members();
    const enemy = members2[0];
    enemy.addState(BOSS_ENTRY_STATE_ID);
    //エネミー隊列変更
    applyBossRowShift(members2);

    //獲得戦果
    if (!enemy.isStateAffected(BOSS_ENTRY_STATE_ID)) return;

    //ボスステートで戦果
    const dropCount = rollBossDropCount(enemy);
    for (var j = 0; j <= dropCount; j++) {
      $gameTroop.addDropItem($dataItems[BOSS_DROP_ITEM_ID]);
    }
  }

  // State given to the boss when the troop appears, and the item it drops.
  const BOSS_ENTRY_STATE_ID = 410;
  const BOSS_DROP_ITEM_ID = 10;

  // States 411-414 each add an extra random amount of the boss drop.
  const BOSS_DROP_BONUS_STATES = [
    { stateId: 411, rollRange: 10, bonus: 1 },
    { stateId: 412, rollRange: 20, bonus: 10 },
    { stateId: 413, rollRange: 30, bonus: 20 },
    { stateId: 414, rollRange: 100, bonus: 1 }
  ];

  // Enemies placed in the front half of the screen are moved to the back row.
  function applyBossRowShift(members2) {
    for (var memberIndex = 0; memberIndex <= members2.length - 1; memberIndex++) {
      var troopX = $gameTroop.getX(memberIndex + 1);
      if (troopX <= 200) {
        members2[memberIndex].setRow(2);
      }
    }
  }

  // One base drop plus one roll per bonus state the boss carries (the draws stay in order).
  function rollBossDropCount(enemy) {
    let dropCount = getRandomIndex(10) + 1;
    BOSS_DROP_BONUS_STATES.forEach(function (dropBonus) {
      if (!enemy.isStateAffected(dropBonus.stateId)) return;
      dropCount += getRandomIndex(dropBonus.rollRange) + dropBonus.bonus;
    });
    return dropCount;
  };

  //ヒント種別(EICSwitch値)ごとの見出し。CommonEvent 178の設計に合わせた
  //定義。分岐(switch)で持つと、実際には呼ばれない種別が到達不能なcaseと
  //して残るため、表として持つ。
  const HINT_TYPE_HEADERS = {
    102: "未発生挿話",
    103: "未発生シーン",
    104: "未回収タイトル",
    105: "未回収Ｈタイトル",
    108: "未発生クエスト"
  };

  //代入して全般ヒントとして作成
  hint1_zenpan = function (hintTypeId) {
    //呼び出し元(CommonEvent 178)は$gameVariables.value(19)を渡す。変数に
    //入っているのが数値とは限らないので、比較が崩れないように数値化する。
    const hintType = Number(hintTypeId);

    const uncollectedHeader = `${HINT_TYPE_HEADERS[hintType] || "　"}\n`;
    window["valueWordSet" + valueCountSet2] = uncollectedHeader;

    valueCountSet1 = 0;
    valueCountSet2 = 1;
    const max = $dataItems.length - 1;
    for (var itemId = 1; itemId < max; itemId++) {
      const item = $dataItems[itemId];
      if (!item.meta["EICSwitch"]) {
        continue;
      }
      if (
        Number(item.meta["EICSwitch"]) !== hintType ||
        $gameParty.hasItem(item)
      ) {
        continue;
      }

      const itemName = colorTaggedText(2, item.name);
      const hintLineText = `${itemName}\n${item.description}\n`;
      window["valueWordSet" + valueCountSet2] += hintLineText;
      valueCountSet1 += 1;
      if (valueCountSet1 % 6 == 0) {
        valueCountSet2 += 1;
        window["valueWordSet" + valueCountSet2] = uncollectedHeader;
      }
    }
  };

  //怒りのツッコミ演出
  ensyutu_ikari = function (effectDurationFrames, seName) {
    const shakePower = getRandomIndex(3) + 6;
    $gameScreen.startShake(shakePower, shakePower, effectDurationFrames);
    const sePitch = getRandomIndex(41) + 80;
    AudioManager.playSe({ name: seName, volume: 90, pitch: sePitch, pan: 0 });
    var flashColor = [255, 255, 255];
    if (seName == "Explosion2") {
      var flashColor = [255, 50, 50];
    }
    const flashColorAlpha = getRandomIndex(41) + 150;
    $gameScreen.startFlash(
      [flashColor[0], flashColor[1], flashColor[2], flashColorAlpha],
      effectDurationFrames
    );
  };

  //オブジェクト探知(79)とトラップ視認(135)が表示するアイコンのメタ。
  //1つのイベントが両方のメタを持つことがあるので、まとめて扱う。
  const EVENT_ICON_METAS = [
    { meta: "IconDisplay", switchId: 79 },
    { meta: "TrapDisplay", switchId: 135 }
  ];

  //オブジェクト探知とトラップ視認実行
  search_object = function () {
    //IDの上限(100/200)で打ち切ると、それを超えるIDのイベントを取りこぼす
    //(Map003は247イベントあり、生成イベントはさらに大きいIDを取る)。
    //実在するイベントをそのまま回す。
    for (const event of $gameMap.events()) {
      const eventData = event.event();
      if (!eventData) {
        continue;
      }
      if ($gameSelfSwitches.value([$gameMap.mapId(), event.eventId(), "B"])) {
        continue;
      }

      //メタごとにスイッチを見てアイコンを反映する。片方のメタのスイッチが
      //OFFというだけで、もう片方が表示したアイコンまで消してしまわない
      //ように、表示したものが1つも無いときだけ消去する。
      let iconMetaFound = false;
      let iconShown = false;
      for (const iconDefinition of EVENT_ICON_METAS) {
        const eventMeta = eventData.meta[iconDefinition.meta];
        if (!eventMeta) continue;
        iconMetaFound = true;
        if (!$gameSwitches.value(iconDefinition.switchId)) continue;
        event.setIconOnEvent(Number(eventMeta));
        iconShown = true;
      }
      if (iconMetaFound && !iconShown) {
        event.clearIconOnEvent();
      }
    }
  };

  //タイトル入手
  item_titleget = function (unusedArg1, unusedArg2) {
    const achievementRecords = collectTitleAchievementRecords();
    const items = $dataItems;
    for (let itemId = 1; itemId < items.length; itemId++) {
      const item = items[itemId];
      if (!item || !item.meta.EICSwitch) continue;
      const titleCategoryId = Number(item.meta.EICSwitch);
      if (titleCategoryId !== 104 && titleCategoryId !== 105) continue;
      if (item.name === "" || $gameParty.hasItem(item)) continue;
      const result = evaluateTitleCandidate(item, achievementRecords);
      if (!result.eligible) continue;
      applyTitleAward(item, itemId, result.actorId);
      break;
    }
  };

  //戦闘マップ殲滅回数による称号獲得
  // Annihilation counters are read for item ids 1..100.
  const ANNIHILATION_COUNT_RANGE_END = 100;
  // Dungeon items are recognised by this switch inside their "OnSwitch" note.
  const DUNGEON_CATEGORY_SWITCH_ID = 207;

  // Remembers the title item the checks have just awarded.
  function markProcessedItem(itemId) {
    $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, itemId);
  }

  // Total annihilation count of every dungeon.
  function sumAnnihilationCounts(annihilationCounts) {
    return sumCountedAnnihilations(annihilationCounts, () => true);
  }

  // Adds the counters 1..END; shouldCount() lets the dungeon variant filter the entries.
  function sumCountedAnnihilations(annihilationCounts, shouldCount) {
    let annihilationCount = 0;
    for (
      let counterIndex = 1;
      counterIndex <= ANNIHILATION_COUNT_RANGE_END;
      counterIndex++
    ) {
      if (!shouldCount(counterIndex)) continue;
      annihilationCount += annihilationCounts[counterIndex];
    }
    return annihilationCount;
  }

  // Total annihilation count of the dungeon items only, that is the items whose
  // "OnSwitch" note contains the dungeon category switch.
  function sumDungeonAnnihilationCounts(annihilationCounts) {
    return sumCountedAnnihilations(annihilationCounts, isDungeonCategoryItem);
  }

  // Whether the item belongs to the dungeon category (its OnSwitch lists that switch id).
  function isDungeonCategoryItem(itemId) {
    const itemData = $dataItems[itemId];
    const onSwitchMeta = itemData && itemData.meta["OnSwitch"];
    if (!onSwitchMeta) return false;
    return hasOnSwitchId(onSwitchMeta, DUNGEON_CATEGORY_SWITCH_ID);
  }

  // True when the comma separated "OnSwitch" note lists the given switch id.
  function hasOnSwitchId(onSwitchMeta, switchId) {
    for (const switchField of onSwitchMeta.split(",")) {
      if (Number(switchField) == switchId) return true;
    }
    return false;
  }

  // "<annihilationTitle>source,required" check of one title item: the source is a
  // dungeon id (20+), the total count (1) or the dungeon item count (2).
  function applyAnnihilationTitle(titleItem, itemId, annihilationCounts) {
    const titleValues = titleItem.meta["annihilationTitle"].split(",");
    const titleSourceId = Number(titleValues[0]);
    const requiredCount = Number(titleValues[1]);

    if (titleSourceId >= 20) {
      if (annihilationCounts[titleSourceId] >= 1) markProcessedItem(itemId);
      return;
    }
    if (titleSourceId == 1) {
      if (sumAnnihilationCounts(annihilationCounts) >= requiredCount) {
        markProcessedItem(itemId);
      }
      return;
    }
    if (titleSourceId != 2) return;
    if (sumDungeonAnnihilationCounts(annihilationCounts) < requiredCount) return;

    markProcessedItem(itemId);
    $gameParty.gainItem(titleItem, 1);
  }

  title_battleMapannihilation = function () {
    const annihilationCounts = $gameVariables.value(
      GAME_VARIABLE.DUNGEON_ANNIHILATION_COUNTS
    );
    const itemCount = $dataItems.length;
    for (let itemId = 1; itemId < itemCount; itemId++) {
      const titleItem = $dataItems[itemId];
      if (!titleItem || !titleItem.meta["annihilationTitle"]) continue;
      if ($gameParty.hasItem(titleItem, true)) continue;

      applyAnnihilationTitle(titleItem, itemId, annihilationCounts);
    }

    const processedItem = $dataItems[
      $gameVariables.value(GAME_VARIABLE.PROCESSED_ITEM_ID)
    ];
    if ($gameParty.hasItem(processedItem, true)) {
      $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, 0);
    }
  };

  //曜日変更と日数経過時の処理
  // Day-of-week switches: 6 = 日 ... 12 = 土, 17 = weekday, 16 = weekend day.
  const DAY_OF_WEEK_NAMES = ["日", "月", "火", "水", "木", "金", "土"];
  const DAY_OF_WEEK_SWITCH_BASE = 6;
  const WEEKDAY_SWITCH_ID = 17;
  const WEEKEND_SWITCH_ID = 16;
  const LAST_WEEKDAY_INDEX = 4; // 金
  // Switch ranges cleared when a new day starts (weekend/weekday first, as before).
  const DAY_START_RESET_SWITCH_RANGES = [
    [WEEKEND_SWITCH_ID, WEEKDAY_SWITCH_ID],
    [DAY_OF_WEEK_SWITCH_BASE, DAY_OF_WEEK_SWITCH_BASE + DAY_OF_WEEK_NAMES.length - 1]
  ];
  // Per-actor record slots used by the daily report.
  const ACTOR_RECORD_LAST_HCG_SLOT = 46;
  const ACTOR_RECORD_PREVIOUS_EXP_SLOT = 65;
  // The last line of an odd number of actor rows has to be closed explicitly.
  const EXP_REPORT_LINE_BREAK_COUNTS = [1, 3, 5, 7];

  // Appends text to the day-end report without consuming a report line.
  function appendDayEndInfoText(gameVariables, reportText) {
    gameVariables.setValue(
      GAME_VARIABLE.DAY_END_INFO_TEXT,
      gameVariables.value(GAME_VARIABLE.DAY_END_INFO_TEXT) + reportText
    );
  }

  // Appends a complete line to the day-end report and counts it.
  function appendDayEndInfoLine(gameVariables, lineText) {
    appendDayEndInfoText(gameVariables, lineText);
    gameVariables.setValue(
      GAME_VARIABLE.DAY_END_INFO_LINE_COUNT,
      gameVariables.value(GAME_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1
    );
  }

  // "本日消費\G: <colored amount>" report, only when the counter moved today.
  function appendDayGoldReport(
    gameVariables,
    labelText,
    currentGoldSum,
    previousGoldSumVariableId
  ) {
    const previousGoldSum = gameVariables.value(previousGoldSumVariableId);
    if (!(currentGoldSum > previousGoldSum)) return;
    const gainedGold = currentGoldSum - previousGoldSum;
    const gainedGoldText = gainedGold.toLocaleString();
    const goldAmountLabel = colorTaggedText(2, gainedGoldText);
    const goldReportLine = labelText + goldAmountLabel + "\n\n";
    appendDayEndInfoLine(gameVariables, goldReportLine);
  }

  // The standing picture of the previous H scene is forgotten on a new day.
  function resetHeroineLastHcgRecords(gameVariables) {
    const firstHeroineId = gameVariables.value(
      GAME_VARIABLE.FIRST_HEROINE_ACTOR_ID
    );
    const lastHeroineId = gameVariables.value(
      GAME_VARIABLE.LAST_HEROINE_ACTOR_ID
    );
    for (
      let heroineId = firstHeroineId;
      heroineId <= lastHeroineId;
      heroineId++
    ) {
      const heroineRecord = gameVariables.value(
        GAME_VARIABLE.ACTOR_RECORD_BASE + heroineId
      );
      heroineRecord[ACTOR_RECORD_LAST_HCG_SLOT] = 0;
    }
  }

  // <SkillCostToday> items are handed back at the start of every day.
  function restoreDailyLimitItems() {
    valueOneDayLimitItem.forEach((dailyLimitItemId) => {
      const itemData = $dataItems[dailyLimitItemId];
      if (!itemData.meta.SkillCostToday) return;
      $gameParty.gainItem(itemData, 1);
    });
  }

  function advanceElapsedDays(gameVariables) {
    gameVariables.setValue(
      GAME_VARIABLE.ELAPSED_DAYS,
      gameVariables.value(GAME_VARIABLE.ELAPSED_DAYS) + 1
    ); //経過日数
  }

  // Experience gained during the day, two actors per report line.
  function appendDailyExpReport(gameVariables) {
    const firstDeployedActorId = gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastDeployedActorId = gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    let reportedActorCount = 0;

    for (
      let actorId = firstDeployedActorId;
      actorId <= lastDeployedActorId;
      actorId++
    ) {
      const actor = $gameActors.actor(actorId);
      const actorRecord = gameVariables.value(
        GAME_VARIABLE.ACTOR_RECORD_BASE + actorId
      );
      const currentExp = actor.currentExp();
      const previousExp = actorRecord[ACTOR_RECORD_PREVIOUS_EXP_SLOT];

      if (currentExp > previousExp) {
        const gainedExp = currentExp - previousExp;
        const gainedExpText = gainedExp.toLocaleString();
        const expValue = colorTaggedText(2, gainedExpText);
        const actorName = actor.name();
        // The actor rows share one report line, so only the text grows here.
        appendDayEndInfoText(
          gameVariables,
          `${actorName}本日獲得経験値:${expValue}\u3000`
        );
        reportedActorCount += 1;
        if (reportedActorCount % 2 == 0) appendDayEndInfoLine(gameVariables, "\n");
      }
      actorRecord[ACTOR_RECORD_PREVIOUS_EXP_SLOT] = currentExp;
    }

    if (EXP_REPORT_LINE_BREAK_COUNTS.includes(reportedActorCount)) {
      appendDayEndInfoLine(gameVariables, "\n");
    }
  }

  function resetDayStartSwitches(gameSwitches) {
    DAY_START_RESET_SWITCH_RANGES.forEach(
      ([firstSwitchId, lastSwitchId]) => {
        for (
          let switchId = firstSwitchId;
          switchId <= lastSwitchId;
          switchId++
        ) {
          gameSwitches.setValue(switchId, false);
        }
      }
    );
  }

  // Moves the weekday one step forward and switches the matching day flags.
  function advanceWeekday(gameVariables, gameSwitches) {
    const currentDayName = gameVariables.value(GAME_VARIABLE.WEEKDAY);
    const currentDayIndex = DAY_OF_WEEK_NAMES.indexOf(currentDayName);
    if (currentDayIndex < 0) return;

    const nextDayIndex = (currentDayIndex + 1) % DAY_OF_WEEK_NAMES.length;
    gameVariables.setValue(
      GAME_VARIABLE.WEEKDAY,
      DAY_OF_WEEK_NAMES[nextDayIndex]
    );
    gameSwitches.setValue(DAY_OF_WEEK_SWITCH_BASE + currentDayIndex, true);
    gameSwitches.setValue(
      currentDayIndex <= LAST_WEEKDAY_INDEX
        ? WEEKDAY_SWITCH_ID
        : WEEKEND_SWITCH_ID,
      true
    );
  }

  // End of day: daily report, counters, weekday and the daily item refund.
  weeks_toggleOther = function () {
    const gameVariables = $gameVariables;
    const gameSwitches = $gameSwitches;

    resetHeroineLastHcgRecords(gameVariables);
    restoreDailyLimitItems();
    advanceElapsedDays(gameVariables);

    appendDayGoldReport(
      gameVariables,
      "本日消費\\G:",
      $gameParty.loseGoldSum,
      GAME_VARIABLE.DAY_SPENT_GOLD
    );
    appendDayGoldReport(
      gameVariables,
      "本日獲得\\G:",
      $gameParty.gainGoldSum,
      GAME_VARIABLE.DAY_GAINED_GOLD
    );
    gameVariables.setValue(GAME_VARIABLE.DAY_SPENT_GOLD, $gameParty.loseGoldSum);
    gameVariables.setValue(GAME_VARIABLE.DAY_GAINED_GOLD, $gameParty.gainGoldSum);

    appendDailyExpReport(gameVariables);
    resetDayStartSwitches(gameSwitches);
    advanceWeekday(gameVariables, gameSwitches);
  };
  //ガチャスクリプト
  // Gacha rarity -> [text colour, item icon used in the "<Rarity:...>" tag].
  const RARITY_COLOR_TAG_INFOS = {
    1: [0, 473],
    2: [2, 473],
    3: [22, 473],
    4: [21, 473],
    5: [29, 473],
    6: [28, 474],
    7: [24, 475],
    8: [26, 476],
    9: [27, 477],
    10: [25, 478]
  };

  // Database list -> the name tag that prints an icon plus the entry name.
  function gachaNameTagFor(database) {
    switch (database) {
      case $dataItems:
        return "\\iin";
      case $dataWeapons:
        return "\\win";
      case $dataArmors:
        return "\\ain";
    }
    return undefined;
  }

  // Loot entries that must not be drawn: out-of-range entries, "max 1" entries the
  // party already owns, and ranged entries it does not own yet.
  function isGachaItemExcluded(databaseEntry) {
    if (databaseEntry.meta["GatchaOutOfRange"]) return true;
    if (databaseEntry.meta["Max Item"]) {
      if (Number(databaseEntry.meta["Max Item"]) == 1) return $gameParty.hasItem(databaseEntry);
    }
    if (databaseEntry.meta["GatchaHasRange"]) return !$gameParty.hasItem(databaseEntry);
    return false;
  }

  // Indices of valueItems whose rarity equals the wanted one.
  function collectGachaItemIndicesByRarity(wantedRarity) {
    return collectGachaItemIndices(
      (databaseEntry) => isGachaEntryOfRarity(databaseEntry, wantedRarity),
      isGachaItemExcluded
    );
  }

  // Ids 1..n of the entries that pass the pool filter and carry a matching rarity.
  function collectGachaItemIndices(acceptEntry, isExcluded) {
    const eligibleItemIndices = [];
    const itemCount = valueItems.length;
    for (let itemIndex = 1; itemIndex < itemCount; itemIndex++) {
      const databaseEntry = valueItems[itemIndex];
      if (!databaseEntry) continue;
      if (isExcluded(databaseEntry)) continue;
      if (!acceptEntry(databaseEntry)) continue;
      eligibleItemIndices.push(itemIndex);
    }
    return eligibleItemIndices;
  }

  // Whether the entry lists the wanted value in its "LotteryRearity" meta field.
  function isGachaEntryOfRarity(databaseEntry, wantedRarity) {
    const entryRarity = databaseEntry.meta["LotteryRearity"];
    if (!entryRarity) return false;
    return Number(entryRarity) === wantedRarity;
  }

  // The rarity-1 fallback also accepts ranged entries the party already owns; the
  // "max 1" rule is not applied there.
  function collectRarityOneFallbackIndices() {
    return collectGachaItemIndices(
      (databaseEntry) => isGachaEntryOfRarity(databaseEntry, 1),
      isGachaFallbackExcluded
    );
  }

  // Fallback pool filter: out of range, or a gacha range whose item the party does not own yet.
  // The stricter isGachaItemExcluded() is intentionally not used here.
  function isGachaFallbackExcluded(databaseEntry) {
    if (databaseEntry.meta["GatchaOutOfRange"]) return true;
    if (databaseEntry.meta["GatchaHasRange"] && !$gameParty.hasItem(databaseEntry)) return true;
    return false;
  }

  // Database list of one draw: an explicit 0..2 type is used as given, anything else
  // rolls a random list (11 rolls, values above 1 mean armors).
  function pickGachaDatabase(valueItemsType) {
    const hasExplicitType =
      (valueItemsType || valueItemsType === 0) && valueItemsType > -1 && valueItemsType < 3;
    if (hasExplicitType) return getItemEquipmentSource(valueItemsType);
    const randomValueItemsType = getRandomIndex(11);
    return getItemEquipmentSource(randomValueItemsType > 1 ? 2 : randomValueItemsType);
  }

  // Highest rarity the gacha may draw: SSR (8) needs the 100-pull title item, UR/LR
  // (9, 10) the 200-pull one.
  function gachaRarityCap() {
    if ($gameParty.hasItem($dataItems[657], true)) return 10;
    if ($gameParty.hasItem($dataItems[656], true)) return 8;
    return 7;
  }

  // Weighted rarity draw: ten base entries, one extra "1" per round and the bonus
  // entries of addRarityCheckValues for the first 45 rounds. Rarities above
  // maxRarity leave the pool instead of being downgraded to it - downgrading piled
  // their weight on the cap tier, which then outdrew the tier below (rarity 7 came
  // up ~1.9x as often as rarity 6 without the unlock titles).
  function drawGachaRarity(maxRarity) {
    const rarityArray = DEFAULT_RARITY_LIST.slice();
    for (let round = 1; round <= 50; round++) {
      rarityArray.push(1);
      if (round > 45) continue;
      addRarityCheckValues(rarityArray, round);
    }
    const drawableRarities = rarityArray.filter((value) => value <= maxRarity);
    return drawableRarities[getRandomIndex(drawableRarities.length)];
  }

  // "<Rarity:icon>" tag followed by the "<icon tag[id]>" name tag of the drawn entry.
  function buildGachaItemLabel(lotteryRarity, gachaItemId) {
    const rarityInfo = RARITY_COLOR_TAG_INFOS[lotteryRarity];
    const rarityColorTag = colorTaggedText(rarityInfo[0], `<Rarity:\\I[${rarityInfo[1]}]`);
    const nameTag = gachaNameTagFor(valueItems);
    return rarityColorTag + colorTaggedText(16, `${nameTag}[${gachaItemId}]`);
  }
item_gacha = function () {
    //内容のほうで開始時点ではレアリティ7まで（称号取得で解放）
    gacha_naiyou(3, 0);
    if (!(valueGachaId >= 1)) return;

    const databaseEntry = valueItems[valueGachaId];
    $gameParty.gainItem(databaseEntry, 1);
    const lotteryRarity = Number(databaseEntry.meta["LotteryRearity"]);
    if ($gameVariables.value(GAME_VARIABLE.RANDOM_WORK_3) < lotteryRarity) {
      $gameVariables.setValue(GAME_VARIABLE.RANDOM_WORK_3, lotteryRarity);
    }

    // The label is built first: no function call inside the translatable sentence.
    const gachaItem = buildGachaItemLabel(lotteryRarity, valueGachaId);
    const gachaResultMessage = `${gachaItem}が排出されました！`;
    if (!$gameSwitches.value(GAME_SWITCH.TEMPORARY_RESULT)) {
      $gameVariables.setValue(GAME_VARIABLE.RANDOM_WORK_2, gachaResultMessage);
      return;
    }
    // 乱数汎用1 counts the draws, 乱数汎用2 keeps the accumulated result text.
    $gameVariables.setValue(
      GAME_VARIABLE.RANDOM_WORK_1,
      $gameVariables.value(GAME_VARIABLE.RANDOM_WORK_1) + 1
    );
    const previousResultText = $gameVariables.value(GAME_VARIABLE.RANDOM_WORK_2);
    $gameVariables.setValue(
      GAME_VARIABLE.RANDOM_WORK_2,
      previousResultText + gachaResultMessage + "\n"
    );
  };

  //アイテム武器防具抽選スクリプト。id12アイテム1武器2防具3all
  //id13がall。10まで。value1としてid決定
  const DEFAULT_RARITY_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    gacha_naiyou = function (valueItemsType, rarity) {
    valueItems = pickGachaDatabase(valueItemsType);

    let chosenRarity = rarity;
    if (rarity < 1) {
      //ガチャ称号取得でＵＲ，ＬＲ解放。解放前のレアリティは抽選母数から外す。
      chosenRarity = drawGachaRarity(gachaRarityCap());
    }

    if ($gameParty.inBattle()) {
      valueGachaId = 71; //仮指定。ポーションのみ
      return;
    }

    // Only a genuinely empty pool falls back. The old leading 0 burned one draw out
    // of every poolSize+1 and handed that share to rarity 1, which hit the small
    // pools hardest.
    const eligibleItemIndices = collectGachaItemIndicesByRarity(chosenRarity);
    if (eligibleItemIndices.length === 0) {
      //レアリティ1でmax1アイテムを作らない。
      const fallbackIndices = collectRarityOneFallbackIndices();
      valueGachaId = fallbackIndices[getRandomIndex(fallbackIndices.length)];
      return;
    }
    valueGachaId = eligibleItemIndices[getRandomIndex(eligibleItemIndices.length)];
  };

  const rarityChecks = [
    { threshold: 45, value: 2 },
    { threshold: 40, value: 3 },
    { threshold: 35, value: 4 },
    { threshold: 30, value: 5 },
    { threshold: 9, value: 6 },
    { threshold: 7, value: 7 },
    { threshold: 5, value: 8 },
    { threshold: 3, value: 9 }
  ];
  function addRarityCheckValues(rarityArray, currentValue) {
    rarityChecks.forEach((check) => {
      if (currentValue <= check.threshold) {
        rarityArray.push(check.value);
      }
    });
  }

  // One loot choice of the gacha list: the icon+name choice plus the two picture
  // placeholders that carry the entry description and the shared "詳細情報" block.
  function addGachaListChoice(
    detailInfoText,
    databaseTypeId,
    itemIndex,
    databaseEntry,
    choiceIndex,
    pictureSlot
  ) {
    item_priceinfo(databaseTypeId, itemIndex);
    $gameSystem.addCustomChoice(1, {
      text: `\x1bI[${databaseEntry.iconIndex}]${databaseEntry.name}`,
      value: choiceIndex
    });
    showGachaListPicture(
      pictureSlot + 100,
      20,
      10,
      `${databaseEntry.description}`
    );
    $gameMessage.setSelectPictureId(choiceIndex, pictureSlot + 100);
    showGachaListPicture(
      pictureSlot + 101,
      640,
      110,
      DETAIL_INDENT_LEFT +
        colorTaggedText(14, "──詳細情報──") +
        DETAIL_INDENT_RIGHT +
        "\n" +
        detailInfoText
    );
    $gameMessage.setSelectPictureId(choiceIndex, pictureSlot + 101);
  }

  // Plain text picture drawn without a name at the given position; 28 is the text size.
  function showGachaListPicture(pictureId, pictureX, pictureY, text) {
    $gameScreen.setDTextPicture(text, 28);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(pictureId, "", 0, pictureX, pictureY, 100, 100, 0, 0);
  }

  //レアリティ一覧作成
  item_gachaitiran1 = function (lotteryRarity) {
    let choiceIndex = 1;
    let pictureSlot = 1;

    // Read once for the whole list, like the original block did.
    const detailInfoText = $gameVariables.value(GAME_VARIABLE.TEMPORARY_TEXT);

    // Item / weapon / armor databases, in the order the price helper expects them.
    const gachaDatabases = [$dataItems, $dataWeapons, $dataArmors];
    for (let databaseTypeId = 0; databaseTypeId <= 2; databaseTypeId++) {
      valueItems = gachaDatabases[databaseTypeId];
      const itemCount = valueItems.length;
      for (let itemIndex = 1; itemIndex < itemCount; itemIndex++) {
        const databaseEntry = valueItems[itemIndex];
        if (!databaseEntry) continue;
        const entryRarity = databaseEntry.meta["LotteryRearity"];
        if (!entryRarity) continue;
        if (Number(entryRarity) !== lotteryRarity) continue;
        if (isGachaItemExcluded(databaseEntry)) continue;

        addGachaListChoice(
          detailInfoText,
          databaseTypeId,
          itemIndex,
          databaseEntry,
          choiceIndex,
          pictureSlot
        );
        choiceIndex += 1;
        pictureSlot += 2;
      }
    }
  };

  //ダンジョンランダム宝箱中身処理
  danjon_treasure = function () {
    const chestId = $gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID);
    const chestMeta = $dataItems[chestId].meta;
    const treasureIndices = $gameVariables.value(GAME_VARIABLE.DUNGEON_TREASURE_IDS)[chestId];
    const entryCategoryIndices = $gameVariables.value(GAME_VARIABLE.DUNGEON_TREASURE_TYPES)[chestId];
    if (treasureIndices != 0) {
      var treasureMessage = openTreasureChest(
        chestMeta,
        treasureIndices,
        entryCategoryIndices
      );
    } else {
      var treasureMessage = "宝箱の中身は空だった…。";
      $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, true);
    }
    if ($gameSwitches.value(GAME_SWITCH.RARE_CHEST_TEMP)) {
      var treasureItemIndex = RARE_TREASURE_PICTURE_ID;
      $gameScreen.setDTextPicture(treasureMessage, treasureItemIndex);
    } else {
      CommonPopupManager.showInfo({}, treasureMessage, null);
    }
  }

  // Picture id used for the rare chest result text.
  const RARE_TREASURE_PICTURE_ID = 28;

  // Draws one item from the chest, marks a rare prize and returns the result message.
  function openTreasureChest(chestMeta, treasureIndices, entryCategoryIndices) {
    const treasureItemIndex = treasureIndices[getRandomIndex(treasureIndices.length)];
    // The item ids may repeat inside the list, so the first matching slot is removed.
    const index = treasureIndices.findIndex(
      (candidateIndex) => candidateIndex == treasureItemIndex
    );
    const sourceEntries = getItemEquipmentSource(entryCategoryIndices[index]);
    markRareTreasureIfMatched(chestMeta, treasureItemIndex);

    const gainedItem = sourceEntries[treasureItemIndex];
    $gameParty.gainItem(gainedItem, 1);
    const itemName = colorTaggedText(
      24,
      `\x1bI[${gainedItem.iconIndex}]${gainedItem.name}`
    );
    removeDrawnTreasure(treasureIndices, entryCategoryIndices, index);
    return `${itemName}を入手した！`;
  }

  // "TchestRere" lists the item id that counts as the rare prize.
  function markRareTreasureIfMatched(chestMeta, treasureItemIndex) {
    if (!chestMeta["TchestRere"]) return;
    if (treasureItemIndex == Number(chestMeta["TchestRere"])) {
      $gameSwitches.setValue(GAME_SWITCH.RARE_CHEST_TEMP, true);
    }
  }

  // A temporary chest keeps its contents; otherwise the drawn entry leaves both lists.
  function removeDrawnTreasure(treasureIndices, entryCategoryIndices, index) {
    if ($gameSwitches.value(GAME_SWITCH.TEMP_CHEST)) return;
    if (index < 0) return;

    treasureIndices.splice(index, 1);
    entryCategoryIndices.splice(index, 1);
  };

  //ランダム表情index -> 顔グラID(actor_choicePre1用)
  const FACE_IDS_BY_RANDOM_INDEX = [1, 2, 5, 15, 40, 39, 38, 41];

  //アクター選択肢準備
  actor_choicePre1 = function () {
    const partyMembers = $gameParty.members();
    let choiceOrder = 0;
    let choicePictureId = 101;
    const start = 0;
    const end = partyMembers.length - 1;
    for (var memberIndex = start; memberIndex <= end; memberIndex++) {
      if (memberIndex >= 1) {
        choiceOrder += 1;
      }
      const gameActor = partyMembers[memberIndex];
      var actorId = gameActor.actorId();
      $gameVariables.setValue(GAME_VARIABLE.SELECTED_ACTOR_ID, actorId);
      const customChoiceId = 1;
      const choiceParams = { text: gameActor.name(), value: actorId };
      $gameSystem.addCustomChoice(customChoiceId, choiceParams);
      if (isGirl(gameActor)) {
        valueFaceSelect = 6;
        const randomFaceIndex = getRandomIndex(8);
        //index4-7はスキル66習得時のみ。習得していなければデフォルトの6
        if (randomFaceIndex <= 3 || gameActor.isLearnedSkill(66)) {
          valueFaceSelect = FACE_IDS_BY_RANDOM_INDEX[randomFaceIndex];
        }

        battle_bustUp1(gameActor, choicePictureId, 0, 0, 10);
        for (var j = 0; j <= 7; j++) {
          if ($gameScreen.picture(choicePictureId + j)) {
            $gameMessage.setSelectPictureId(choiceOrder, choicePictureId + j);
          }
        }
      } else {
        //$gameScreen.showPicture(id3,$gameVariables.value(20)+"Actor1_s0",0,0,0,100,100,0,0);
        //$gameMessage.setSelectPictureId(id2, id3);
      }
      choicePictureId += 10;
    }
  };

  //エネミーのデータベースパラメータ設定
  enemy_dataBaseSettei = function () {
    const start = 31;
    const end = 300;
    for (var enemyId = start; enemyId <= end; enemyId++) {
      const enemyData = $dataEnemies[enemyId];
      if (enemyData.meta["BaseStates"]) {
        var baseStateValues = enemyData.meta["BaseStates"].split(",");
        var baseParamValue = Number(baseStateValues[0]);
        //var arr2 = [baseParamValue-5,baseParamValue-4,baseParamValue-3,baseParamValue-2,baseParamValue-2,baseParamValue,baseParamValue+1,baseParamValue+2,baseParamValue+3,baseParamValue+4,baseParamValue+5];
        var statVarianceCandidates = [
          baseParamValue - 10,
          baseParamValue - 5,
          baseParamValue,
          baseParamValue + 5,
          baseParamValue + 10
        ];
        var randomParam =
          statVarianceCandidates[getRandomIndex(statVarianceCandidates.length)];
        enemyData.params[0] = randomParam;
        for (var j = 1; j <= 7; j++) {
          var secondBaseValue = Number(baseStateValues[1]);
          var randomStatValue = getRandomIndex(5) + (secondBaseValue - 3);
          //var randomStatValue = secondBaseValue;//getRandomIndex(5) + (secondBaseValue - 3);
          enemyData.params[j] = randomStatValue;
        }
        enemyData.exp = Math.round(randomParam / 10);
        var goldDivisor = getRandomIndex(4) + 8;
        enemyData.gold = Math.round(randomParam / goldDivisor);
      }
    }
  };

  //メニュー画面で付与ステートの解説分表示
  state_menuDisprayDescription = function () {
    valueCountSet1 = 0;
    valueCountSet2 = 1;
    const headerText = "付与ステート一覧\n";
    window["valueWordSet" + valueCountSet2] = headerText;
    const states = $dataStates;
    const partyMembers = $gameParty.members();
    for (let stateId = 1; stateId < states.length; stateId++) {
      if (!$gameParty.membersState(stateId)) continue;
      const stateData = states[stateId];
      if (
        !stateData ||
        !(stateData.iconIndex >= 1) ||
        stateData.name === "" ||
        stateData.description === ""
      )
        continue;
      const pageKey = "valueWordSet" + valueCountSet2;
      window[pageKey] += partyStateDescription(
        stateId,
        stateData,
        partyMembers
      );
      valueCountSet1++;
      if (valueCountSet1 % 6 !== 0) continue;
      valueCountSet2++;
      window["valueWordSet" + valueCountSet2] = headerText;
    }
  };

  //キャラ初期セットアップ。ＬＶリセットにも実行。この後レアリティコモン実行。
  // Armour notes of an actor: "JoinEquipArmors1".."JoinEquipArmors9".
  const INITIAL_ARMOR_NOTE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Weapon mastery skills every actor starts with.
  const INITIAL_ATTACK_SKILL_IDS = [101, 111, 121, 131, 141, 151, 161, 171, 181, 191];
  // Skills of the true protagonist: 407 存在フラグ, 18 レベルフラグ.
  const PROTAGONIST_START_SKILL_IDS = [407, 18];
  const PROTAGONIST_STATE_ID = 601; //主人公確定
  const HEROINE_STATE_ID = 602; //女
  const MALE_STATE_ID = 603; //男
  const NUDE_SKILL_ID = 45; //立ち絵変更あり男に全裸スキル
  const PERSONAL_WEAPON_ID_OFFSET = 200; //actor id + 200 holds the personal weapon
  const ACTOR_RECORD_SECOND_NAME_INDEX = 50;
  const INITIAL_JP = 100;

  // Gives and equips the weapon of the "<JoinEquipWeapons>" note.
  function equipInitialWeapon(actor, actorData) {
    const weaponMeta = actorData.meta["JoinEquipWeapons"];
    if (!weaponMeta) return;
    const weaponId = Number(weaponMeta);
    $gameParty.gainItem($dataWeapons[weaponId], 1, false);
    actor.changeEquipById(1, weaponId);
  }

  // Gives the armours of the "<JoinEquipArmorsN>" notes; the original code always
  // equips them into body slot 3, which is kept as is.
  function equipInitialArmors(actor, actorData) {
    for (const armorNoteId of INITIAL_ARMOR_NOTE_IDS) {
      const armorMeta = actorData.meta["JoinEquipArmors" + armorNoteId];
      if (!armorMeta) continue;

      const armorId = Number(armorMeta);
      $gameParty.gainItem($dataArmors[armorId], 1, false);
      actor.changeEquipById(3, armorId);
    }
  }

  // Learns the skills of the "<JoinSkillLearn>" note.
  function learnNoteSkills(actor, actorData) {
    const joinSkillMeta = actorData.meta["JoinSkillLearn"];
    if (!joinSkillMeta) return;
    for (const skillId of joinSkillMeta.split(",")) {
      actor.learnSkill(Number(skillId));
    }
  }

  // Protagonist flag and heroine / male state of the actor notes.
  function applyActorIdentityStates(actor, actorData) {
    //主人公確定
    if (actorData.meta["Mcharacter"]) {
      actor.addState(PROTAGONIST_STATE_ID);
    } else {
      actor.removeState(PROTAGONIST_STATE_ID);
    }
    //主人公と女・男用ステート↓
    if (actorData.meta["Heroine"]) {
      actor.addState(HEROINE_STATE_ID);
    } else {
      actor.addState(MALE_STATE_ID);
    }
  }

  // Every actor learns the ten basic attack skills and the nude skill of the actors
  // whose portrait changes.
  function learnInitialSkills(actor, actorData) {
    // The nude skill is learned before the ten attack skills, in the original order.
    if (actorData.meta["MultipleTachie"]) actor.learnSkill(NUDE_SKILL_ID);
    for (const skillId of INITIAL_ATTACK_SKILL_IDS) {
      actor.learnSkill(skillId);
    }
  }

  // "<SecondName>" note: renames the personal weapon copy and the actor record entry.
  function applySecondName(actorId, actorData) {
    const secondNameMeta = actorData.meta["SecondName"];
    if (!secondNameMeta) return;
    const secondNameValues = secondNameMeta.split(",");
    const weaponData = $dataWeapons[actorId + PERSONAL_WEAPON_ID_OFFSET];
    weaponData.name = secondNameValues[1];
    $gameVariables.value(GAME_VARIABLE.ACTOR_RECORD_BASE + actorId)[
      ACTOR_RECORD_SECOND_NAME_INDEX
    ] = weaponData.name;
  }

  actor_StartSetUp = function (actorId) {
    const actor = $gameActors.actor(actorId);
    const actorData = $dataActors[actorId];
    //主人公にタイトルセットと存在フラグとレベルフラグと視点変更スキル
    if (
      actorId == $gameVariables.value(GAME_VARIABLE.TRUE_PROTAGONIST_ACTOR_ID)
    ) {
      //actor.learnSkill(23);//タイトルセット。不要
      //actor.learnSkill(24);//性欲度関連に合わせて習得させる。性欲度ランク1で習得
      //actor.learnSkill(42);//視点変更
      for (const skillId of PROTAGONIST_START_SKILL_IDS) {
        actor.learnSkill(skillId);
      }
    }
    //デバッグ時に全員に存在フラグとレベルフラグ
    //if($gameSwitches.value(53)){
    //actor.learnSkill(407);
    //actor.learnSkill(18);
    //};
    //初期装備とスキル付与
    equipInitialWeapon(actor, actorData);
    equipInitialArmors(actor, actorData);
    learnNoteSkills(actor, actorData);
    //初期レアリティ設定。スキルとしてはJoinSkillLearnで付与
    reality_setUp(actorId);
    applyActorIdentityStates(actor, actorData);
    learnInitialSkills(actor, actorData);
    //初期JP
    actor.gainJp(INITIAL_JP);
    //苗字代入
    applySecondName(actorId, actorData);
  };

  const ACTOR_RARITY_RANK_DATA = {
    // rarityRank: [skillId, rankLv, code, maxLevel]
    0: { skillId: 406, rankLv: 0, code: "N", maxLv: 9 },
    1: { skillId: 405, rankLv: 1, code: "R", maxLv: 39 },
    2: { skillId: 404, rankLv: 2, code: "SR", maxLv: 59 },
    3: { skillId: 403, rankLv: 3, code: "SSR", maxLv: 79 },
    4: { skillId: 402, rankLv: 4, code: "UR", maxLv: 98 },
    5: { skillId: 401, rankLv: 5, code: "LR", maxLv: 998 }
  };

  /*
   * Get actor rarity rank data
   */
  getRarityRank = function (actor) {
    for (var rarityRank in ACTOR_RARITY_RANK_DATA) {
      var rank = ACTOR_RARITY_RANK_DATA[rarityRank];
      if (actor.isLearnedSkill(rank.skillId)) {
        return rank;
      }
    }
  };

  //レアリティを設定
  reality_setUp = function (actorId) {
    const actor = $gameActors.actor(actorId);
    if (!actor) return;
    const rank = getRarityRank(actor);
    if (!rank) return;

    actor.gainMaxLevel(-999);
    actor.gainMaxLevel(rank.maxLv);
    actor.setupCssbgi(
      1,
      "actorreality" + (valueCountSet1 = rank.code),
      0,
      0,
      0,
      0,
      0
    );
    actor.setFaceImage("Actor_" + actorId, rank.rankLv);
  };

  const ACTOR_RARITY_RANK_SKILLS_DATA = {
    // rarityRank: { skillId, forgetSkillIds: [], learnSkillIds: [] }
    5: { skillId: 401, forgetSkillIds: [], learnSkillIds: [] },
    4: { skillId: 402, forgetSkillIds: [402], learnSkillIds: [401] },
    3: { skillId: 403, forgetSkillIds: [403], learnSkillIds: [402] },
    2: { skillId: 404, forgetSkillIds: [404], learnSkillIds: [403] },
    1: { skillId: 405, forgetSkillIds: [405], learnSkillIds: [404] },
    0: { skillId: 406, forgetSkillIds: [406], learnSkillIds: [405] }
  };

  //レアリティアップ
  reality_Up = function (actorId) {
    const gameActor = $gameActors.actor(actorId);
    if (!gameActor) return;
    for (const rankKey of Object.keys(ACTOR_RARITY_RANK_SKILLS_DATA)) {
      const rankData = ACTOR_RARITY_RANK_SKILLS_DATA[rankKey];
      if (!gameActor.isLearnedSkill(rankData.skillId)) continue;
      applyRaritySkillTransition(gameActor, rankData);
      // Exactly one promotion: newly learned flags must not trigger later ranks in this loop.
      return;
    }
  };

  const RANK_BY_PROMOTION_DATA = {
    // rankLv: { promotionValue, promotionCode, cost }
    0: { promotionValue: 402, promotionCode: "LR", cost: 1000000 },
    1: { promotionValue: 403, promotionCode: "UR", cost: 100000 },
    2: { promotionValue: 404, promotionCode: "SSR", cost: 50000 },
    3: { promotionValue: 405, promotionCode: "SR", cost: 10000 },
    4: { promotionValue: 406, promotionCode: "R", cost: 1000 }
  };

  //レアリティの昇格計算
  // 昇格に必要な素材の作業配列。CommonEvent 235 が mode 1 → 2 → 0 の順で
  // 呼ぶ前提で、mode 1 が詰めて mode 2/0 が読む。宣言が無いと window を汚し、
  // mode 1 を経ずに呼ばれた場合は undefined.length で落ちる。
  let promotionMaterialItemIds = [];
  let promotionMaterialQuantities = [];
  let preparedPromotionActorId = 0;
  reality_setPromotion = function (promotionModeId, actorId) {
    switch (promotionModeId) {
      case 1:
        prepareRarityPromotion(actorId);
        break;
      case 2:
        $gameSwitches.setValue(
          GAME_SWITCH.TEMPORARY_RESULT,
          canPayRarityPromotion(actorId)
        );
        break;
      case 0:
        payRarityPromotionMaterials(actorId);
        break;
    }
  };

  //監禁、奴隷化時にレアリティと装備を記憶。レアリティダウンを実行するかはid3が1で実行
  // Equipment slots 1-10 are stored in the confiscation record; 11-13 hold the
  // rarity skill, the experience and the subclass.
  const CONFISCATED_EQUIP_SLOT_COUNT = 10;
  const CONFISCATED_SKILL_RECORD = 11;
  const CONFISCATED_EXP_RECORD = 12;
  const CONFISCATED_SUBCLASS_RECORD = 13;
  const FIRST_RARITY_SKILL_ID = 401;
  const LAST_RARITY_SKILL_ID = 406;
  const RARITY_DOWN_STATE_ID = 93;
  const CONFISCATED_SUBCLASS_ID = 42;

  // Forgets every rarity skill; a confiscated actor then knows only one of them.
  function forgetRaritySkills(actor) {
    for (
      let skillId = FIRST_RARITY_SKILL_ID;
      skillId <= LAST_RARITY_SKILL_ID;
      skillId++
    ) {
      actor.forgetSkill(skillId);
    }
  }

  // Highest learned rarity skill, or the first one when nothing is learned.
  function highestLearnedRaritySkillId(actor) {
    let learnedSkillId = FIRST_RARITY_SKILL_ID;
    for (
      let skillId = FIRST_RARITY_SKILL_ID;
      skillId <= LAST_RARITY_SKILL_ID;
      skillId++
    ) {
      if (actor.isLearnedSkill(skillId)) learnedSkillId = skillId;
    }
    return learnedSkillId;
  }

  // Record of one actor: cleared equipment plus its rarity skill, exp and subclass.
  function buildEmptyConfiscationRecord() {
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0-10: 装備, 11: レアリティスキル, 12: 経験値, 13: サブジョブ
  }

  // Puts every recorded piece of equipment back and clears the equipment slots.
  function restoreConfiscatedEquipment(actor, equipData, actorName) {
    for (let slotIndex = 0; slotIndex < CONFISCATED_EQUIP_SLOT_COUNT; slotIndex++) {
      if (!(equipData[slotIndex] >= 1)) continue;

      actor.changeEquipById(slotIndex + 1, equipData[slotIndex]);
      equipData[slotIndex] = 0;
    }
    const recoverMessage = `${actorName}は装備を取り戻した！`;
    CommonPopupManager.showInfo({}, recoverMessage, null);
  }

  // Removes every piece of equipment and stores its id in the record.
  function confiscateEquipment(actor, equipData, actorName) {
    const equips = actor.equips();
    for (let slotIndex = 0; slotIndex < equips.length; slotIndex++) {
      if (!equips[slotIndex]) continue;

      equipData[slotIndex] = equips[slotIndex].id;
      actor.changeEquipById(slotIndex + 1, 0);
    }
    const stealMessage = `${actorName}は装備を奪われた…`;
    CommonPopupManager.showInfo({}, stealMessage, null);
  }

  // Clears the rarity down state: skill, exp and subclass come back from the record.
  function restoreConfiscatedState(actor, equipData, actorName, stateData) {
    forgetRaritySkills(actor);
    actor.learnSkill(equipData[CONFISCATED_SKILL_RECORD]);
    reality_setUp(actor.actorId());
    actor.removeState(RARITY_DOWN_STATE_ID);
    const stateRemoveMessage = `${actorName}の\x1bI[${stateData.iconIndex}]${stateData.name}が解除された！`;
    CommonPopupManager.showInfo({}, stateRemoveMessage, null);
    actor.changeExp(equipData[CONFISCATED_EXP_RECORD] + actor.currentExp(), false);

    if (equipData[CONFISCATED_SUBCLASS_RECORD] >= 1) {
      restoreConfiscatedSubclass(
        actor,
        equipData[CONFISCATED_SUBCLASS_RECORD],
        actorName
      );
    }
    equipData[CONFISCATED_SKILL_RECORD] = 0;
    equipData[CONFISCATED_EXP_RECORD] = 0;
    equipData[CONFISCATED_SUBCLASS_RECORD] = 0;
  }

  // Subclass restored after the state removal.
  function restoreConfiscatedSubclass(actor, subclassId, actorName) {
    actor.changeSubclass(subclassId);
    const restoredClassName = $dataClasses[subclassId].name;
    const effectName = colorTaggedText(14, restoredClassName);
    const subclassMessage = `${actorName}のサブジョブが${effectName}に戻った！`;
    CommonPopupManager.showInfo({}, subclassMessage, null);
  }

  // Applies the rarity down state: only the last rarity skill is kept, the subclass is
  // replaced by the temporary one and exp is stored in the record.
  function applyConfiscatedState(actor, equipData, actorName, stateData) {
    equipData[CONFISCATED_EXP_RECORD] = actor.currentExp();
    forgetRaritySkills(actor);
    actor.learnSkill(LAST_RARITY_SKILL_ID);
    reality_setUp(actor.actorId());
    actor.addState(RARITY_DOWN_STATE_ID);
	const stateName = `\x1bI[${stateData.iconIndex}]${stateData.name}`;
    const stateApplyMessage = `${actorName}は${stateName}を受けた…`;
    CommonPopupManager.showInfo({}, stateApplyMessage, null);

    equipData[CONFISCATED_SUBCLASS_RECORD] = actor._subclassId;
    actor.changeSubclass(CONFISCATED_SUBCLASS_ID);
    // Read after the change, so the message names the temporary subclass (as before).
    const appliedClassName = $dataClasses[actor._subclassId].name;
    const effectName = colorTaggedText(27, appliedClassName);
    const subclassAppliedMessage = `${actorName}のサブジョブが${effectName}になった…`;
    CommonPopupManager.showInfo({}, subclassAppliedMessage, null);
  }

  reality_setRelegation = function (rarityModeId, actorId, isRarityDownFlag) {
    const actor = $gameActors.actor(actorId);
    const confinedActorRecords = $gameVariables.value(
      GAME_VARIABLE.CONFINED_ACTOR_RECORDS
    );
    const actorName = actor.name();
    const stateData = $dataStates[RARITY_DOWN_STATE_ID];
    let equipData = confinedActorRecords[actorId];

    switch (rarityModeId) {
      // Lift the relegation.
      case 0:
        restoreConfiscatedEquipment(actor, equipData, actorName);
        const hasStoredSkillRecord = equipData[CONFISCATED_SKILL_RECORD] >= 1;
        if (actor.isStateAffected(RARITY_DOWN_STATE_ID) && hasStoredSkillRecord) {
          restoreConfiscatedState(actor, equipData, actorName, stateData);
        }
        break;
      // Enforce the relegation.
      case 1:
        confinedActorRecords[actorId] = buildEmptyConfiscationRecord();
        equipData = confinedActorRecords[actorId];
        equipData[CONFISCATED_SKILL_RECORD] = highestLearnedRaritySkillId(actor);
        confiscateEquipment(actor, equipData, actorName);
        if (isRarityDownFlag === 1 && !actor.isStateAffected(RARITY_DOWN_STATE_ID)) {
          applyConfiscatedState(actor, equipData, actorName, stateData);
        }
        break;
    }
  };

  //換金時にアイテム没収/解放時に放出スクリプト.1で実行 2で解除
  // Confinement record layout: 0-2 item id lists per category, 3 the stored gold.
  const CONFINEMENT_CATEGORY_COUNT = 3;
  const CONFINEMENT_GOLD_SLOT = 3;
  const CONFINEMENT_CATEGORY_LENGTH = 2001;

  // Fresh confinement record: one id list per category plus the gold total. The
  // record is stored first and then filled, as the engine keeps the array by
  // reference and the transfer code expects that shape.
  function initializeConfinementSlots() {
    $gameVariables.setValue(GAME_VARIABLE.CASH_IN_ITEM_MEMORY, Array(4).fill(0));
    const confinementSlots = $gameVariables.value(
      GAME_VARIABLE.CASH_IN_ITEM_MEMORY
    );
    for (
      let categoryId = 0;
      categoryId < CONFINEMENT_CATEGORY_COUNT;
      categoryId++
    ) {
      confinementSlots[categoryId] = Array(CONFINEMENT_CATEGORY_LENGTH).fill(0);
    }
    confinementSlots[CONFINEMENT_GOLD_SLOT] = 0;
    return confinementSlots;
  }

  // Confiscates the party gold and adds it to the confinement record.
  function confiscatePartyGold(confinementSlots) {
    const partyGold = $gameParty.gold();
    if (!(partyGold >= 1)) return;

    const partyGoldText = colorTaggedText(1, partyGold.toLocaleString());
    const confinementMessage = `アイテム類と所持金${partyGoldText}を奪われた…`;
    CommonPopupManager.showInfo({}, confinementMessage, null);
    confinementSlots[CONFINEMENT_GOLD_SLOT] += partyGold;
    $gameParty.loseGold(partyGold);
  }

  // Gives the stored gold back and clears the gold slot.
  function restoreConfinementGold(confinementSlots) {
    const storedGold = confinementSlots[CONFINEMENT_GOLD_SLOT];
    if (!(storedGold >= 1)) return;

    const storedGoldText = colorTaggedText(5, storedGold.toLocaleString());
    const confinementMessage = `アイテム類と所持金${storedGoldText}を取り戻した！`;
    CommonPopupManager.showInfo({}, confinementMessage, null);
    $gameParty.gainGold(storedGold);
    confinementSlots[CONFINEMENT_GOLD_SLOT] = 0;
  }

  item_confinementScript = function (confinementModeId) {
    const isConfiscating = confinementModeId == 1;
    if (
      isConfiscating &&
      $gameVariables.value(GAME_VARIABLE.CASH_IN_ITEM_MEMORY)[0] == 0
    ) {
      initializeConfinementSlots();
    }

    const confinementSlots = $gameVariables.value(GAME_VARIABLE.CASH_IN_ITEM_MEMORY);
    if (isConfiscating) {
      confiscatePartyGold(confinementSlots);
    } else {
      restoreConfinementGold(confinementSlots);
    }

    for (
      let categoryId = 0;
      categoryId < CONFINEMENT_CATEGORY_COUNT;
      categoryId++
    ) {
      transferConfinementCategory(confinementSlots, categoryId, isConfiscating);
    }

    if (confinementModeId == 0) {
      $gameVariables.setValue(GAME_VARIABLE.CASH_IN_ITEM_MEMORY, Array(4).fill(0));
    }
  };

  //初めて来る街でマップ名表示
    // Shows a picture at zero opacity and moves it to the target opacity: the usual
  // "fade in" pair in this plugin. startHeight keeps the scale the original used.
  function showPictureFadeIn(pictureId, pictureName, x, y, startHeight, targetOpacity) {
    $gameScreen.showPicture(pictureId, pictureName, 1, x, y, 100, startHeight, 0, 0);
    $gameScreen.movePicture(pictureId, 1, x, y, 100, 100, targetOpacity, 0, 30);
  }

map_centerDispray = function (pictureId, mapTitleText) {
    const screenPictureId = pictureId;
    // The darker backdrop fades in to 150, the text frame to full opacity.
    showPictureFadeIn(screenPictureId, "ScreenBlackOut", 640, 384, 100, 150);
    showPictureFadeIn(screenPictureId + 1, "ScreenCenterTextDisPray", 640, 384, 0, 255);

    const centerDisplayText = mapTitleText;
    $gameScreen.setDTextPicture(`\\f[b]${centerDisplayText}`, 40);
    $gameScreen.setDtextFont("ＭＳ Ｐ明朝");
    pic_1(2, screenPictureId + 3, "", 3, 100, 255, 90, 1280, 768, 0, 0);
  };

  //右横256とメニュー背景設定 backGraund_menuMapSelect(2,'BG_Shower',0,0);
  //右横256とメニュー背景設定 backGraund_menuMapSelect(2,'BG_Shower',0,0);
  // Menu background pictures: picture 6 is the background itself, picture 70 is the
  // second layer used by the variant 2 backdrop (same graphic, brighter fade in).
  const MENU_BACKGROUND_PICTURE_ID = 6;
  const MENU_BACKGROUND_SUB_PICTURE_ID = 70;
  const MENU_BACKGROUND_Y_OFFSETS = { Dungeon2_2: -355 };

  // Writes the background name and its parallax scroll speeds in one place.
  function setMenuBackground(gameVariables, backgroundName, horizontalSpeed, verticalSpeed) {
    gameVariables.setValue(GAME_VARIABLE.MENU_BACKGROUND_NAME, backgroundName);
    gameVariables.setValue(GAME_VARIABLE.BACKGROUND_SCROLL_X, horizontalSpeed);
    gameVariables.setValue(GAME_VARIABLE.BACKGROUND_SCROLL_Y, verticalSpeed);
  }

  // The home base uses its own room background (night/day variant).
  function applyHomeBackgroundPreset(gameVariables) {
    if (!$gameSwitches.value(GAME_SWITCH.HOME_BASE)) return;
    if ($gameSwitches.value(GAME_SWITCH.NIGHT)) {
      setMenuBackground(gameVariables, "BG_MyRoomN", 0, 0.4);
      return;
    }
    setMenuBackground(gameVariables, "BG_MyRoom", 0.3, 0);
  }

  function getMenuBackgroundYOffset(backgroundName) {
    return MENU_BACKGROUND_Y_OFFSETS[backgroundName] || 0;
  }

  // Slides one background layer in: it starts 50px lower and fades to its final
  // opacity while moving up to the offset of that parallax.
  function showMenuBackgroundLayer(pictureId, backgroundName, yOffset, opacity, fadeFrames) {
    const picturePath = "/img/parallaxes/" + backgroundName;
    $gameScreen.showPicture(
      pictureId,
      picturePath,
      0,
      1024,
      yOffset + 50,
      100,
      100,
      0,
      0
    );
    $gameScreen.movePicture(
      pictureId,
      0,
      1024,
      yOffset,
      100,
      100,
      opacity,
      0,
      fadeFrames
    );
  }

  // The whole map and the bridge draw their own background, so the menu picture is
  // skipped there.
  function isMenuBackgroundSuppressed() {
    return (
      $gameSwitches.value(GAME_SWITCH.WORLD_MAP) || $gameSwitches.value(GAME_SWITCH.BRIDGE)
    );
  }

  // Menu background selection (variant 0 = plain, 2 = double layer).
  // Menu background sources of one menu call: the default sky, the home preset and
  // the explicitly requested background, in ascending priority.
  function applyMenuBackgroundSources(
    gameVariables,
    backgroundName,
    horizontalScrollSpeed,
    verticalScrollSpeed
  ) {
    if (gameVariables.value(GAME_VARIABLE.MENU_BACKGROUND_NAME) == 0) {
      setMenuBackground(gameVariables, "BlueSky", 0.3, 0);
    }
    applyHomeBackgroundPreset(gameVariables);

    if (backgroundName == 0) return;
    setMenuBackground(
      gameVariables,
      backgroundName,
      horizontalScrollSpeed,
      verticalScrollSpeed
    );
  }

  // Parallax of the menu background, applied to the map when the event progress
  // blocker owns the screen.
  function applyMenuBackgroundParallax(menuBackgroundName, isEventProgressBlocked) {
    if (!isEventProgressBlocked) return;
    const hScrollSpeed = $gameVariables.value(GAME_VARIABLE.BACKGROUND_SCROLL_X);
    const vScrollSpeed = $gameVariables.value(GAME_VARIABLE.BACKGROUND_SCROLL_Y);
    $gameMap.changeParallax(
      menuBackgroundName,
      hScrollSpeed != 0,
      vScrollSpeed != 0,
      hScrollSpeed,
      vScrollSpeed
    );
  }

  // Background picture layers; the sub layer is only used by the wide variant (2).
  function showMenuBackgroundLayers(backgroundVariantId, menuBackgroundName) {
    const parallaxYOffset = getMenuBackgroundYOffset(menuBackgroundName);
    showMenuBackgroundLayer(
      MENU_BACKGROUND_PICTURE_ID,
      menuBackgroundName,
      parallaxYOffset,
      250,
      60
    );
    if (backgroundVariantId != 2) return;
    showMenuBackgroundLayer(
      MENU_BACKGROUND_SUB_PICTURE_ID,
      menuBackgroundName,
      parallaxYOffset,
      255,
      60
    );
  }

  backGraund_menuMapSelect = function (
    backgroundVariantId,
    backgroundName,
    horizontalScrollSpeed,
    verticalScrollSpeed
  ) {
    const gameVariables = $gameVariables;
    h_keikenhyouji2(521, 0);
    $gameScreen.erasePicture(MENU_BACKGROUND_PICTURE_ID);
    $gameScreen.erasePicture(MENU_BACKGROUND_SUB_PICTURE_ID);

    applyMenuBackgroundSources(
      gameVariables,
      backgroundName,
      horizontalScrollSpeed,
      verticalScrollSpeed
    );

    const menuBackgroundName = gameVariables.value(
      GAME_VARIABLE.MENU_BACKGROUND_NAME
    );
    if (menuBackgroundName == 0) return;

    Galv.CACHE.load("parallaxes", menuBackgroundName);
    $gameSystem._backgroundName = menuBackgroundName;

    applyMenuBackgroundParallax(
      menuBackgroundName,
      $gameSwitches.value(GAME_SWITCH.EVENT_PROGRESS_BLOCKER)
    );
    if (isMenuBackgroundSuppressed()) return;

    showMenuBackgroundLayers(backgroundVariantId, menuBackgroundName);
  };

  //遠景をアイテム武器ＩＤで指定
  //遠景をアイテム武器ＩＤで指定
  // Parallax key of a map meta block: the night variant wins over the day one.
  function resolveParallaxKey(metaSource, databaseTypeId, isNight, inOutFlag) {
    let parallaxKey = 0;
    if (databaseTypeId == 1) {
      if (inOutFlag == 0 && metaSource.meta["BG_in"]) parallaxKey = "BG_in";
      if (inOutFlag == 1 && metaSource.meta["BG_out"]) parallaxKey = "BG_out";
      if (isNight) {
        switch (numericCaseValue(inOutFlag)) {
          case 0:
            if (metaSource.meta["BG_inN"]) parallaxKey = "BG_inN";
            break;
          case 1:
            if (metaSource.meta["BG_outN"]) parallaxKey = "BG_outN";
            break;
        }
      }
    }
    if (databaseTypeId == 0) {
      if (metaSource.meta["BG2"]) parallaxKey = "BG2";
      if (isNight && metaSource.meta["BGN2"]) parallaxKey = "BGN2";
    }
    return parallaxKey;
  }

  // "name,scrollX,scrollY" parallax note -> map parallax plus the menu background copy.
  function applyParallaxNote(parallaxNote) {
    const parallaxValues = parallaxNote.split(",");
    const scrollX = Number(parallaxValues[1]);
    const scrollY = Number(parallaxValues[2]);
    $gameMap.changeParallax(
      parallaxValues[0],
      scrollX != 0,
      scrollY != 0,
      scrollX,
      scrollY
    );
    $gameVariables.setValue(GAME_VARIABLE.MENU_BACKGROUND_NAME, parallaxValues[0]);
    $gameVariables.setValue(GAME_VARIABLE.BACKGROUND_SCROLL_X, 0); //メニュー背景横スク
    $gameVariables.setValue(GAME_VARIABLE.BACKGROUND_SCROLL_Y, 0); //メニュー背景縦スク
  }

  setMap_parallaxSelect = function (
    databaseTypeId,
    paramItemId,
    paramInOutFlag
  ) {
    let metaSource;
    switch (databaseTypeId) {
      case 0:
        metaSource = $dataItems[paramItemId];
        break;
      case 1:
        metaSource = $dataWeapons[paramItemId];
        break;
      default:
        return;
    }

    const parallaxKey = resolveParallaxKey(
      metaSource,
      databaseTypeId,
      $gameSwitches.value(GAME_SWITCH.NIGHT),
      paramInOutFlag
    );
    if (!(parallaxKey != 0)) return;

    applyParallaxNote(metaSource.meta[parallaxKey]);
  };

  //BGMをjouhouで設定した配列で指定。BGMの保存も実行
  setMap_musicSelect2 = function () {
    AudioManager.playBgm({
      name: valueMapBGM[0],
      volume: valueMapBGM[1],
      pitch: valueMapBGM[2],
      pan: valueMapBGM[3]
    });
    $gameSystem.saveBgm();
  };

  //BGMをアイテム武器ＩＤで指定
  //BGMをアイテム武器ＩＤで指定
  setMap_musicSelect = function (databaseTypeId, paramItemId, paramInOutFlag) {
    let mapInfo;
    switch (databaseTypeId) {
      case 0:
        mapInfo = $dataItems[paramItemId];
        break;
      case 1:
        mapInfo = $dataWeapons[paramItemId];
        break;
    }
    if ($dataMap.meta.BGM) mapInfo = $dataMap;
    if (!mapInfo) return;
    const mapMeta = mapInfo.meta;
    if (!mapMeta.BGM) return;
    const bgmKey =
      $gameSwitches.value(GAME_SWITCH.NIGHT) && mapMeta.BGMN ? "BGMN" : "BGM";
    const bgmValues = mapMeta[bgmKey].split(",");
    AudioManager.playBgm({
      name: bgmValues[0],
      volume: bgmValues[1],
      pitch: bgmValues[2],
      pan: bgmValues[3]
    });
    $gameSystem.saveBgm();
  };

  //サブクエなどのイベント開始と終了時スクリプト
  // Time-of-day switches (morning / daytime / night) are stored as a block so the
  // scene code can switch all of them off at once.
  const TIME_OF_DAY_SWITCH_IDS = [
    GAME_SWITCH.MORNING,
    GAME_SWITCH.DAYTIME,
    GAME_SWITCH.NIGHT
  ];
  // The scene start remembers the current time switch in this variable.
  const SCENE_SAVED_TIME_SWITCH_VARIABLE_ID = 320;
  // Switch id of the running common event, remembered for the scene end.
  const SCENE_COMMON_EVENT_SWITCH_VARIABLE_ID = 529;
  // Common event id used when the scene was started by a direct script call.
  const SCENE_DEFAULT_COMMON_EVENT_VARIABLE_ID = 201;
  const AUTO_RUN_TRIGGER_SWITCH_ID = 180;
  const SCENE_START_PHASE_ID = 1;
  const SCENE_END_PHASE_ID = 0;
  // Scene progress value 101 marks a scene that has to be torn down.
  const SCENE_END_PROGRESS_THRESHOLD = 101;

  // Turns every time-of-day switch off and switches the remembered one back on.
  function restoreSavedTimeSwitch(gameVariables, gameSwitches) {
    const savedTimeSwitchId = gameVariables.value(
      SCENE_SAVED_TIME_SWITCH_VARIABLE_ID
    );
    if (savedTimeSwitchId < 1) return;
    TIME_OF_DAY_SWITCH_IDS.forEach((timeSwitchId) => {
      gameSwitches.setValue(timeSwitchId, false);
    });
    gameSwitches.setValue(savedTimeSwitchId, true);
  }

  // Turns every time-of-day switch off, so exactly one of them can be set after.
  function clearTimeOfDaySwitches() {
    for (const switchId of TIME_OF_DAY_SWITCH_IDS) {
      $gameSwitches.setValue(switchId, false);
    }
  }

  // Remembers which time-of-day switch was active before the scene took over.
  function captureCurrentTimeSwitch(gameVariables, gameSwitches) {
    if (gameVariables.value(SCENE_SAVED_TIME_SWITCH_VARIABLE_ID) != 0) return;
    if (valueWeatherSceneSet == 0) return;
    TIME_OF_DAY_SWITCH_IDS.forEach((timeSwitchId) => {
      if (!gameSwitches.value(timeSwitchId)) return;
      gameSwitches.setValue(timeSwitchId, false);
      gameVariables.setValue(SCENE_SAVED_TIME_SWITCH_VARIABLE_ID, timeSwitchId);
    });
    gameSwitches.setValue(valueWeatherSceneSet, true);
  }

  // Stores the switch of the running common event so the scene end can switch it
  // back off. Common events without a switch id keep the previous value.
  function rememberRunningCommonEventSwitch(gameVariables) {
    const dataCommonEvents = $dataCommonEvents;
    $gameMap._commonEvents
      .filter((commonEvent) => commonEvent.isActive())
      .map((commonEvent) => commonEvent.event().id)
      .forEach((commonEventId) => {
        if (commonEventId < 2) return;
        const commonEventSwitchId = dataCommonEvents[commonEventId].switchId;
        if (!commonEventSwitchId) return;
        gameVariables.setValue(
          SCENE_COMMON_EVENT_SWITCH_VARIABLE_ID,
          commonEventSwitchId
        );
      });
    if (gameVariables.value(SCENE_COMMON_EVENT_SWITCH_VARIABLE_ID) != 0) return;
    const fallbackCommonEventId = gameVariables.value(
      SCENE_DEFAULT_COMMON_EVENT_VARIABLE_ID
    );
    gameVariables.setValue(
      SCENE_COMMON_EVENT_SWITCH_VARIABLE_ID,
      dataCommonEvents[fallbackCommonEventId].switchId
    );
  }

  // Scene start: hide the player, block map events and remember the time switch.
  function beginScenePhase(gameVariables, gameSwitches, isInBattle, gamePlayer) {
    gamePlayer.setTransparent(true);
    gameVariables.setValue(GAME_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    if (!isInBattle) {
      $gameTemp.stopMapPlayerMovement();
      gamePlayer.setStealthMode(true);
    }
    // Progress on, map fade + other events blocked, NPCs vanish.
    gameSwitches.setValue(GAME_SWITCH.EVENT_PROGRESS_ACTIVE, true);
    gameSwitches.setValue(GAME_SWITCH.EVENT_PROGRESS_BLOCKER, true);
    gameSwitches.setValue(GAME_SWITCH.NPC_VANISHED, true);
    captureCurrentTimeSwitch(gameVariables, gameSwitches);
    rememberRunningCommonEventSwitch(gameVariables);
  }

  // Erases the events the scene spawned (ids are kept in DYNAMIC_EVENT_IDS).
  function eraseDynamicSceneEvents(gameVariables, isInBattle) {
    const gameMap = $gameMap;
    const dynamicEventIds = gameVariables.value(GAME_VARIABLE.DYNAMIC_EVENT_IDS);
    dynamicEventIds.forEach((dynamicEventId) => {
      if (!(dynamicEventId >= 1)) return;
      if (!gameMap.event(dynamicEventId)) return;
      if (isInBattle) return;
      gameMap.eraseEvent(dynamicEventId);
    });
  }

  // Scene end: release the player and the map again.
  function releaseScenePlayer(isInBattle, gamePlayer) {
    if (!isInBattle) gamePlayer.setStealthMode(false);
    if (isInBattle) return;
    gamePlayer.setThrough(false);
    $gameTemp.allowMapPlayerMovement();
  }

  function clearSceneSwitches(gameSwitches) {
    // Progress off, NPCs/passers-by back, weather reflected again, fade released.
    gameSwitches.setValue(GAME_SWITCH.EVENT_PROGRESS_ACTIVE, false);
    gameSwitches.setValue(GAME_SWITCH.NPC_VANISHED, false);
    gameSwitches.setValue(GAME_SWITCH.PASSERBY_VANISHED, false);
    gameSwitches.setValue(GAME_SWITCH.MAP_WEATHER_IGNORED, false);
    gameSwitches.setValue(GAME_SWITCH.EVENT_PROGRESS_BLOCKER, false);
    gameSwitches.setValue(AUTO_RUN_TRIGGER_SWITCH_ID, true);
  }

  // The common event that started the scene is switched off again at its end.
  function finishSceneCommonEvent(gameVariables, gameSwitches) {
    const commonEventSwitchId = gameVariables.value(
      SCENE_COMMON_EVENT_SWITCH_VARIABLE_ID
    );
    if (commonEventSwitchId < 2) return;
    gameSwitches.setValue(commonEventSwitchId, false);
  }

  // Scene end: erase the spawned events, restore the time switch and the player.
  function endScenePhase(gameVariables, gameSwitches, isInBattle, gamePlayer) {
    eraseDynamicSceneEvents(gameVariables, isInBattle);
    restoreSavedTimeSwitch(gameVariables, gameSwitches);
    gameVariables.setValue(SCENE_SAVED_TIME_SWITCH_VARIABLE_ID, 0);
    gameVariables.setValue(GAME_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));

    releaseScenePlayer(isInBattle, gamePlayer);
    clearSceneSwitches(gameSwitches);
    if (!isInBattle) {
      drowsepost.camera.zoom(1, 60, gamePlayer);
      gamePlayer.setTransparent(false);
    }
    itemGet_afterProcess();
    fade_wipeDirect(1);
    finishSceneCommonEvent(gameVariables, gameSwitches);
  }

  // Scene start (1) / scene end (0) handling for the episode scenes.
  otherScene_StartEnd = function (scenePhaseId, unusedArg2) {
    const gameVariables = $gameVariables;
    const gameSwitches = $gameSwitches;
    const isInBattle = $gameParty.inBattle();
    const gamePlayer = $gamePlayer;

    switch (scenePhaseId) {
      case SCENE_START_PHASE_ID:
        if (gameVariables.value(GAME_VARIABLE.EVENT_PROGRESS) != 0) return;
        beginScenePhase(gameVariables, gameSwitches, isInBattle, gamePlayer);
        break;
      case SCENE_END_PHASE_ID:
        if (
          gameVariables.value(GAME_VARIABLE.EVENT_PROGRESS) <
          SCENE_END_PROGRESS_THRESHOLD
        )
          return;
        endScenePhase(gameVariables, gameSwitches, isInBattle, gamePlayer);
        break;
      default:
        break;
    }
  };
  //イベント開始と終了時スクリプト
  // Main quest counters advanced by a finished scene, in the order of the quest ids.
  const MAIN_QUEST_PROGRESS_ENTRIES = [
    { switchId: GAME_SWITCH.RISHABLE, variableId: GAME_VARIABLE.MAIN_QUEST_PROGRESS_1 },
    { switchId: GAME_SWITCH.GEKIDEN_EX1, variableId: GAME_VARIABLE.MAIN_QUEST_PROGRESS_2 },
    { switchId: GAME_SWITCH.GEKIDEN_EX2, variableId: GAME_VARIABLE.MAIN_QUEST_PROGRESS_3 },
    { switchId: GAME_SWITCH.GEKIDEN_1, variableId: GAME_VARIABLE.MAIN_QUEST_PROGRESS_4 },
    { switchId: GAME_SWITCH.GEKIDEN_2, variableId: GAME_VARIABLE.MAIN_QUEST_PROGRESS_5 },
    { switchId: GAME_SWITCH.GEKIDEN_3, variableId: GAME_VARIABLE.MAIN_QUEST_PROGRESS_6 }
  ];

  // Completion switch of a scene item: its "AddEventCompSwi" note, otherwise derived
  // from the scene kind (episode 901+, H scene 601+).
  function resolveEpisodeCompletionSwitchId(eventItemMeta, eventItemId) {
    if (eventItemMeta["AddEventCompSwi"]) {
      return Number(eventItemMeta["AddEventCompSwi"]);
    }
    switch ($gameVariables.value(GAME_VARIABLE.SCENE_KIND)) {
      //挿話
      case 1:
        return eventItemId + 900;
      //Ｈ
      case 2:
        return eventItemId + 600;
    }
    return undefined;
  }

  // Recording only happens on a real scene end: not while skipping, not after an
  // annihilation, not for an already seen scene and, for trials, not while the main
  // quest progress is suppressed.
  function isSceneCompletionRecordingAllowed(startEndFlag, checksTrialSuppression) {
    if (startEndFlag != 1) return false;
    if ($gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP)) return false;
    if ($gameSwitches.value(GAME_SWITCH.ANNIHILATION)) return false;
    if ($gameSwitches.value(GAME_SWITCH.SCENE_CONTINUE_SELECTED)) return false;
    if (
      checksTrialSuppression &&
      $gameSwitches.value(GAME_SWITCH.TRIAL_MAIN_PROGRESS_SUPPRESSED)
    ) {
      return false;
    }
    return true;
  }

  // Advances the counter of every main quest the finished trial belongs to.
  function advanceMainQuestProgress() {
    for (const questEntry of MAIN_QUEST_PROGRESS_ENTRIES) {
      if (!$gameSwitches.value(questEntry.switchId)) continue;
      $gameVariables.setValue(
        questEntry.variableId,
        $gameVariables.value(questEntry.variableId) + 1
      );
    }
  }

  eventScene_StartEnd = function (
    startEndFlag,
    selectionSwitchId,
    sceneParamValue,
    eventItemId
  ) {
    var i; // Preserve the legacy eval-visible binding after moving the phase loops.
    valueCountSet1 = 0;
    const startSceneActor = $gameActors.actor(
      $gameVariables.value(GAME_VARIABLE.CURRENT_VIEWPOINT_ACTOR_ID)
    );
    if (startSceneActor) {
      $gameVariables.setValue(GAME_VARIABLE.ACTOR_NAME_TEXT, startSceneActor.name());
    }
    $gameVariables.setValue(GAME_VARIABLE.EPISODE_COMPLETION_SWITCH, 0); //達成スイッチid変数

    if (eventItemId >= 401) {
      recordEpisodeSceneCompletion(startEndFlag, eventItemId);
    } else {
      //135-140
      if (isSceneCompletionRecordingAllowed(startEndFlag, true)) {
        advanceMainQuestProgress();
      }
      $gameSwitches.setValue(GAME_SWITCH.TRIAL_MAIN_PROGRESS_SUPPRESSED, false);
    }
    if (startEndFlag == 0) beginRegisteredEventScene(sceneParamValue, eventItemId);
    else finishRegisteredEventScene(selectionSwitchId);
  }

  // Episode items (401+) publish their completion switch and, when the scene is being
  // recorded, are granted unless one of the registration conditions already holds.
  function recordEpisodeSceneCompletion(startEndFlag, eventItemId) {
    const eventItemMeta = $dataItems[eventItemId].meta;
    const completionSwitchId = resolveEpisodeCompletionSwitchId(
      eventItemMeta,
      eventItemId
    );
    $gameVariables.setValue(
      GAME_VARIABLE.EPISODE_COMPLETION_SWITCH,
      completionSwitchId
    );
    valueCountSet1 += completionSwitchId;
    if (!isSceneCompletionRecordingAllowed(startEndFlag, false)) return;

    if (!hasMetRegistrationCondition(eventItemMeta)) {
      $gameParty.gainItem($dataItems[eventItemId], 1);
    }
    $gameSwitches.setValue(completionSwitchId, true);
  }

  // The registration conditions are data driven expressions evaluated in this scope on
  // purpose (eval), so they can read the scene parameters set up by the event.
  function hasMetRegistrationCondition(eventItemMeta) {
    let registrationFlag = 0;
    var conditionExpression;
    for (const conditionMetaKey of [
      "RegistrationC1",
      "RegistrationC2",
      "RegistrationC3"
    ]) {
      conditionExpression = eventItemMeta[conditionMetaKey];
      if (!conditionExpression) continue;
      if (eval(conditionExpression)) {
        //データドリブン条件式のためevalを使用(意図的)
        registrationFlag = 1;
      }
    }
    return registrationFlag != 0;
  };

  //隊列順で次の表示者を決定formation_orderSelect(20,0);
  formation_orderSelect = function (targetVarId, stepDirectionId) {
    const members2 = $gameParty.members();
    const partyMembers = members2;
    const maxPartyMembersIndex = members2.length - 1;

    let partyMemberIndex1;
    let partyMemberIndex2;
    if (stepDirectionId == 0) {
      partyMemberIndex1 = maxPartyMembersIndex;
      partyMemberIndex2 = 0;
    } else {
      partyMemberIndex1 = 0;
      partyMemberIndex2 = maxPartyMembersIndex;
    }

    for (
      let memberIndex = 0;
      memberIndex <= maxPartyMembersIndex;
      memberIndex++
    ) {
      if (
        partyMembers[memberIndex].actorId() == $gameVariables.value(targetVarId)
      ) {
        if (memberIndex == partyMemberIndex1) {
          $gameVariables.setValue(
            targetVarId,
            partyMembers[partyMemberIndex2].actorId()
          );
        } else {
          let index = memberIndex + (stepDirectionId == 0 ? 1 : -1);
          $gameVariables.setValue(targetVarId, partyMembers[index].actorId());
        }
        break;
      }
    }
  };

  //隊列順で次のヒロインを決定formation_orderSelectH(20,0);//formation_orderSelectH(167,2);
  // Heroine ids of the current party, in party order.
  function collectPartyHeroineIds() {
    const heroineIds = [];
    for (const partyMember of $gameParty.members()) {
      if (isGirl(partyMember)) heroineIds.push(partyMember.actorId());
    }
    return heroineIds;
  }

  // Wraps the selection around the end of the heroine list: forwards from the first
  // heroine for list mode 0, backwards from the last one for list mode 1.
  function wrapHeroineSelection(targetVarId, listModeId) {
    const heroineIds = valueHeroineCoice;
    const isForwardWrap = listModeId == 0;
    for (let step = 0; step < heroineIds.length; step++) {
      const heroineIndex = isForwardWrap ? step : heroineIds.length - 1 - step;
      const heroineId = heroineIds[heroineIndex];
      if (!isGirl($gameActors.actor(heroineId))) continue;

      $gameVariables.setValue(targetVarId, heroineId);
      return true;
    }
    return false;
  }

  // Moves the selection to the next heroine of the list: backwards for list mode 0,
  // forwards for list mode 1. The value is only set when the neighbour is a girl.
  function selectNextHeroine(targetVarId, listModeId) {
    const heroineIds = valueHeroineCoice;
    const heroineCount = heroineIds.length;
    const isBackwardList = listModeId == 0;
    const edgeActorId = heroineIds[isBackwardList ? heroineCount - 1 : 0];
    const actorIndexShift = isBackwardList ? 1 : -1;
    const currentActorId = $gameVariables.value(targetVarId);
    const partyMembers = $gameParty.members();

    for (let heroineIndex = 0; heroineIndex < heroineCount; heroineIndex++) {
      const heroineId = heroineIds[heroineIndex];
      if (heroineId !== currentActorId) continue;

      // The current heroine sits at the edge of the list: wrap around.
      if (heroineId == edgeActorId) {
        wrapHeroineSelection(targetVarId, listModeId);
        return;
      }
      const heroinePartyIndex = $gameActors.actor(heroineId).index();
      const nextActor = partyMembers[heroinePartyIndex + actorIndexShift];
      if (!nextActor || !isGirl(nextActor)) return;

      $gameVariables.setValue(targetVarId, nextActor.actorId());
      return;
    }
  }

  formation_orderSelectH = function (targetVarId, listModeId) {
    // Mode 2 only refreshes the heroine list and reports whether it has two entries.
    if (listModeId != 2) {
      selectNextHeroine(targetVarId, listModeId);
      return;
    }
    valueHeroineCoice = collectPartyHeroineIds();
    if (valueHeroineCoice.length >= 2) {
      $gameSwitches.setValue(targetVarId, true);
    }
  };

  //初期解説コモン+tips選択肢作成
  start_commentary = function (
    switchId,
    choiceText,
    displayType,
    displayText,
    firstPictureData,
    firstTextData,
    secondPictureData,
    secondTextData
  ) {
    if ($gameSwitches.value(GAME_SWITCH.INITIAL_COMMENTARY))
      showCommentaryChoice(choiceText, displayType, displayText, firstTextData);
    else unlockCommentaryEntry(switchId, choiceText, displayType, displayText);
    if (firstPictureData != "Npic") {
      valueStartCommentary2P[valueStartCommentary0] = firstPictureData;
    }
    if (firstTextData != "Nda") {
      valueStartCommentary2[valueStartCommentary0] = firstTextData;
    }
    if (secondPictureData != "Npic") {
      valueStartCommentary3P[valueStartCommentary0] = secondPictureData;
    }
    if (secondTextData != "Nda") {
      valueStartCommentary3[valueStartCommentary0] = secondTextData;
    }
    valueStartCommentary0 += 1;
    valueWordSet0 = choiceText;
  };

  // Shown whenever the mastery level of a skill reaches its maximum.
  const RANK_MAX_TEXT = "<ランクマックス！>";

  // Learning animation used when a skill is first learned / raised in rank.
  const SKILL_LEARNED_ANIMATION_ID = 296;
  const SKILL_RANK_UP_ANIMATION_ID = 297;

  // Colored skill icon+name marker, reused by every learn/rank-up message.
  function coloredSkillMarker(skillId) {
    return colorTaggedText(16, `\x1bSIN[${skillId}]`);
  }

  function buildSkillLearnedMessage(userName, skillId) {
    const skillMarker = coloredSkillMarker(skillId);
    return `${userName}は${skillMarker}を習得した！`;
  }

  function buildSkillRankUpMessage(userName, skillId) {
    const skillMarker = coloredSkillMarker(skillId);
    return `${userName}の${skillMarker}がランクアップ！`;
  }

  // Appends the current/mastery progress and the max-rank note when reached.
  function appendSkillMasteryProgress(message, user, skillId, maxMasteryLevel) {
    const skillLevel = user.skillMasteryLevel(skillId);
    const maxSkillLevel = Number(maxMasteryLevel);
    const progressLabel = `${skillLevel}/${maxSkillLevel}`;
    const progressText = colorTaggedText(2, progressLabel);
    message += ` [${progressText}]`;
    if (skillLevel >= maxSkillLevel) {
      const rankMaxLabel = colorTaggedText(10, RANK_MAX_TEXT);
      message += rankMaxLabel;
    }
    return message;
  }

  //スキル習得時のコスト（反応）skill_learnFeedback(user,skill.id);
  skill_learnFeedback = function (user, skillId) {
    let feedbackMessage = " ";
    let feedbackAnimationId = SKILL_LEARNED_ANIMATION_ID;
    const maxMasteryLevel = $dataSkills[skillId].meta["Max Mastery Level"];
    const userName = user.name();
    if (!maxMasteryLevel) {
      feedbackMessage += buildSkillLearnedMessage(userName, skillId);
    } else {
      const isFirstLevel = user.skillMasteryLevel(skillId) < 1;
      feedbackMessage += isFirstLevel
        ? buildSkillLearnedMessage(userName, skillId)
        : buildSkillRankUpMessage(userName, skillId);
      feedbackAnimationId = isFirstLevel
        ? SKILL_LEARNED_ANIMATION_ID
        : SKILL_RANK_UP_ANIMATION_ID;
      user.gainSkillMasteryLevel(skillId, +1);
      feedbackMessage = appendSkillMasteryProgress(
        feedbackMessage,
        user,
        skillId,
        maxMasteryLevel
      );
    }
    //};
    TickerManager.show(feedbackMessage);
    user.startAnimation(feedbackAnimationId, true, 0); //変更。アニメ追加
    passive_addCondition(user); //パッシブ
    title_battleUp(user); //タイトル
    user.refresh();
  };

  //スキル習得時のＪＰコストskill_learnJPCost(user,skill.id);
  skill_learnJPCost = function (user, skillId) {
    const rankUpPoint = Number($dataSkills[skillId].meta.RankUpPoint);
    const skillMasteryUses = user.skillMasteryUses(skillId);
    valueSkillLearnJPCost =
      rankUpPoint +
      user.skillMasteryLevel(skillId) * rankUpPoint -
      skillMasteryUses;
  };

  //クラスランク -> 解放資金(job_releaseUnlockEvent/job_releaseCostEvent用)
  const RELEASE_COST_BY_CLASS_RANK = {
    1: 3000,
    2: 10000,
    3: 100000
  };

  //クラスランク -> 要求レベル(job_releaseUnlockEvent用)
  const REQUIRED_LEVEL_BY_CLASS_RANK = {
    2: 20,
    3: 30
  };

  //クラス毎ジョブ解放スクリプト。途中セーブ禁止！
  job_releaseUnlockEvent = function (firstClassId, lastClassId) {
    const actor = $gameActors.actor(
      $gameVariables.value(GAME_VARIABLE.SELECTED_ACTOR_ID)
    );
    showActorClassReleaseOverview(actor);
    const unlockedClasses = actor.unlockedClasses();
    const costContext = { releaseCost: undefined, requiredLevel: undefined };
    let choiceIndex = 1;
    for (let classId = firstClassId; classId <= lastClassId; classId++) {
      if (unlockedClasses.some((unlockedId) => unlockedId == classId)) continue;
      addJobReleaseClassChoice(
        actor,
        classId,
        choiceIndex,
        100 + choiceIndex,
        costContext
      );
      choiceIndex++;
    }
  };

  //クラス毎ジョブ解放スクリプト。コスト支払い
  job_releaseCostEvent = function (classId) {
    const classRankIndex = Number($dataClasses[classId].meta["classRank"]);

    const goldValue = RELEASE_COST_BY_CLASS_RANK[classRankIndex];

    const soundFileName =
      classRankIndex == 3 ? "21_ClassRelease2" : "21_ClassRelease";
    AudioManager.playMe({
      name: soundFileName,
      volume: 90,
      pitch: 100,
      pan: 0
    });

    $gameParty.loseGold(goldValue);
    const effectName = colorTaggedText(2, `${goldValue}`);
    const messageText = `所持金:-${effectName}\\G`;
    CommonPopupManager.showInfo({}, messageText, null);

    let itemIndex = 0;
    if (classRankIndex >= 1) {
      for (var itemId = 1; itemId <= $dataItems.length - 1; itemId++) {
        if (!$dataItems[itemId].meta["class" + classRankIndex + "JobReleaseM"])
          continue;

        itemIndex = itemId;
        break;
      }
    }

    if (itemIndex >= 1) {
      const item = $dataItems[itemIndex];
      $gameParty.loseItem(item, 3);

      const itemName = colorTaggedText(2, `${item.name}`);
      const messageText = `アイテム:-${itemName}`;
      CommonPopupManager.showInfo({}, messageText, null);
    }

    const actor = $gameActors.actor(
      $gameVariables.value(GAME_VARIABLE.SELECTED_ACTOR_ID)
    );
    actor.unlockClass(classId);
    $gameSwitches.setValue(GAME_SWITCH.ENEMY_IS_HUMAN, true); //初めてジョブ解放したスイッチ
  };

  //パーティ全体のアンロッククラス数,コモン43で実行
  actors_unlockedClassHit = function () {
    const classIds = new Set();
    for (const actor of $gameParty.members())
      for (const classId of actor.unlockedClasses()) classIds.add(classId);
    const groups = [
      { first: 51, last: 60, switchId: 423 },
      { first: 61, last: 70, switchId: 613 },
      { first: 71, last: 80, switchId: 614 }
    ];
    for (const group of groups)
      if (countUnlockedClassRange(classIds, group.first, group.last) >= 10)
        $gameSwitches.setValue(group.switchId, true);
  };

  //変数やスイッチのタイトル効果
  title_EffectConfi = function () {
    const items = $dataItems;
    for (let itemId = 1; itemId < items.length; itemId++) {
      const item = items[itemId];
      const resetSwitch = item && item.meta.titleEffectConfiSwi;
      if (resetSwitch) $gameSwitches.setValue(Number(resetSwitch), false);
    }
    const equippedTitleIds = $gameVariables.value(GAME_VARIABLE.TITLE_EFFECT_IDS) || [];
    for (const storedId of equippedTitleIds) {
      const itemId = Number(storedId);
      if (!(itemId >= 1)) continue;
      const item = items[itemId];
      if (item) applyTitleConfiguration(item.meta, true);
    }
    for (const storedId of valueTitleSetItemsNoSetEffect || []) {
      const item = items[Number(storedId)];
      if (!item) continue;
      const isOwned = $gameParty.hasItem(item);
      applyTitleConfiguration(item.meta, !!isOwned);
    }
  };

  //フェードインアウトワイプ演出。0消去1汎用2ワープ
    // Dungeon transitions on a battle map, town transitions everywhere else.
  const DUNGEON_WIPE_IMAGES = [
    "Dunjon004",
    "Dunjon008",
    "Dunjon012",
    "Dunjon036",
    "Dunjon052",
    "Dunjon100",
    "Dunjon104",
    "Dunjon118",
    "Dunjon153",
    "Dunjon999"
  ];
  const TOWN_WIPE_IMAGES = [
    "Town048",
    "Town084",
    "Town092",
    "Town129",
    "Town131",
    "Town225",
    "Town309",
    "Town310",
    "Town001",
    "Town013",
    "Town014",
    "Town032",
    "Town033",
    "Town039",
    "Town041",
    "Town046"
  ];
  const FIXED_WIPE_IMAGE = "Town129";

  // Random transition image of the current surroundings.
  function pickWipeImage() {
    const wipeImageCandidates = $gameSwitches.value(GAME_SWITCH.BATTLE_MAP)
      ? DUNGEON_WIPE_IMAGES
      : TOWN_WIPE_IMAGES;
    return wipeImageCandidates[getRandomIndex(wipeImageCandidates.length)];
  }

fade_wipeDirect = function (wipeTypeId) {
    var wipeImageName;
    switch (wipeTypeId) {
      case 0:
        $gameScreen._useGWTrans = "off";
        break;
      case 1:
        wipeImageName = pickWipeImage();
        break;
      case 2:
        wipeImageName = FIXED_WIPE_IMAGE;
        break;
    }
    if (!(wipeTypeId >= 1)) return;

    $gameScreen._GWInImg = wipeImageName;
    $gameScreen._GWOutImg = wipeImageName;
    valueWipeImg = wipeImageName;
    Galv.CACHE.load("transitions", wipeImageName);
  };

  //トラップ設定
  trap_setUp = function (unusedArg1) {
    $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, false);
    const partyMembers = $gameParty.members();
    let canEvade = partyHasTrapEvasionSkill(partyMembers);
    if (!canEvade) {
      const evasionItem = findTrapEvasionItem();
      if (evasionItem) {
        $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, true);
        $gameParty.gainItem(evasionItem, -1);
        canEvade = true;
      }
    } else {
      $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, true);
    }
    if (!canEvade) return;
    showTrapEvasionAfterimage(partyMembers[0]);
  };

  function getScaledTrapValue(enemyLevelValues, multiplier) {
    const baseValue =
      Number(enemyLevelValues[getRandomIndex(enemyLevelValues.length)]) *
      multiplier;
    return Math.floor(Math.random() * (baseValue * 10)) + (baseValue + 1);
  }

  // トラップカテゴリ(valueCountSet1)→状態ID(valueCountSet2)対応表
  const TRAP_STATE_IDS_BY_CATEGORY = {
    0: 1,
    1: 1,
    2: 4, //毒
    3: 5, //暗闇
    4: 6, //沈黙
    5: 1, //激高
    6: 8, //混乱
    7: 9, //魅了
    8: 10, //睡眠
    9: 1, //スタン
    10: 0, //爆破。ＨＰダメージ
    11: 0, //吸収。ＭＰダメージ
    12: 0, //脱力。ＴＰダメージ
    13: 0 //転移。valueCountSet2に転送先のイベID
  };

  // Party state trap states, applied to every member at once.
  const PARTY_STATE_TRAP_STATE_IDS = [4, 5, 6, 8, 9, 10];

  trap_starting1 = function (trapModeId, eventId) {
    const event = $gameMap.event(eventId);
    if (trapModeId == 1) {
      valueCountSet1 = getRandomIndex(13);
      const trapStateId = TRAP_STATE_IDS_BY_CATEGORY[valueCountSet1];
      if (trapStateId !== undefined) valueCountSet2 = trapStateId;
    }
    if (trapModeId != 2) return;
    const members = $gameParty.members();
    if (valueCountSet2 == 1) showClothingDamageTrap(members[0]);
    if (PARTY_STATE_TRAP_STATE_IDS.some((stateId) => valueCountSet2 == stateId))
      applyPartyStateTrap(members, valueCountSet2);
    switch (valueCountSet1) {
      case 5:
      case 9: {
        $gamePlayer.requestBalloon(2);
        const messageText = "しかし何も起こらなかった…。";
        CommonPopupManager.showInfo({}, messageText, null);
        break;
      }
      case 10:
      case 11:
      case 12:
        applyPartyResourceTrap(members, event, valueCountSet1);
        break;
      case 13:
        activateWarpTrap();
        break;
    }
  };

  //フラッシュモブ演出flashmob_wordDirect(1,55,56,100,'Tamanegiv6',`!?`);
  // Banner picture of each flash message mode, with its y and inner width.
  const FLASHMOB_BANNER_MODES = {
    1: { pictureName: "Screen_mobFlash", pictureY: 250, innerWidth: 60 },
    2: { pictureName: "Screen_hukidasi", pictureY: 250, innerWidth: 60 },
    3: { pictureName: "Screen_hukidasiIkari", pictureY: 255, innerWidth: 40 }
  };
  const FLASHMOB_EFFECT_BANNER_HEIGHT = 1280;
  const FLASHMOB_BANNER_CANVAS = [768, 0, 0];
  const FLASHMOB_ANGER_EFFECT_ARGUMENTS = [60, "Thunder9"];

  // Message banner of the current flash mode.
  function showFlashmobBanner(displayModeId, bannerPictureId) {
    const bannerMode = FLASHMOB_BANNER_MODES[displayModeId];
    pic_1(
     2,
     bannerPictureId,
     bannerMode.pictureName,
     0,
     100,
     bannerMode.pictureY,
     bannerMode.innerWidth,
     FLASHMOB_EFFECT_BANNER_HEIGHT,
     FLASHMOB_BANNER_CANVAS[0],
     FLASHMOB_BANNER_CANVAS[1],
     FLASHMOB_BANNER_CANVAS[2]
    );
  }

  // Flash text picture: the id is drawn as a time code so the text can be animated.
  function showFlashmobTextPicture(messageText, fontName, textPictureId) {
    $gameScreen.setDTextPicture(`\\oc[15]\\C[15]${textPictureId}`, messageText); //\\f[b]
    $gameScreen.setDtextFont(fontName);
  }

  // The text slides in from the right for the plain modes, and is scaled up for the
  // angry mode.
  function showFlashmobMessagePicture(displayModeId, messagePictureId) {
    if (displayModeId === 3) {
      adv_partDirectPlay(7);
      $gameScreen.dTextAlign = 1;
      $gameScreen.showPicture(messagePictureId, "", 1, 640, 384, 300, 300, 0, 0);
      $gameScreen.movePicture(messagePictureId, 1, 640, 384, 100, 100, 255, 0, 40);
      return;
    }
    $gameScreen.showPicture(
      messagePictureId,
      "",
      1,
      640 - 240 + 60,
      384 - 80,
      100,
      100,
      0,
      0
    );
    $gameScreen.movePicture(
      messagePictureId,
      1,
      640 - 240,
      384 - 80,
      100,
      100,
      255,
      0,
      60
    );
  }

  flashmob_wordDirect = function (
    displayModeId,
    bannerPictureId,
    messagePictureId,
    messageText,
    fontName,
    textPictureId
  ) {
    if (displayModeId == 0) {
      $gameScreen.erasePicture(bannerPictureId);
      $gameScreen.erasePicture(messagePictureId);
      return;
    }
    // A mode without a banner definition only refreshes the text picture.
    const bannerMode = FLASHMOB_BANNER_MODES[displayModeId];
    if (bannerMode) showFlashmobBanner(displayModeId, bannerPictureId);
    showFlashmobTextPicture(messageText, fontName, textPictureId);
    if (bannerMode) showFlashmobMessagePicture(displayModeId, messagePictureId);
    if (displayModeId == 1 || displayModeId == 3) {
      ensyutu_ikari(
        FLASHMOB_ANGER_EFFECT_ARGUMENTS[0],
        FLASHMOB_ANGER_EFFECT_ARGUMENTS[1]
      );
    }
  };

  //獲得物等一覧表示
  get_loopListDisplay = function () {
    const windowY = valueCountSet1 <= 3 ? 250 - valueCountSet1 * 40 : 50;
    drawPagedListTextWindow(windowY, 768 - windowY);
  };

  //獲得物等一覧表示全画面
  get_loopListDisplay2 = function () {
    drawPagedListTextWindow(70, 698);
  };

  //獲得物等一覧表示２面仕様valueCountSet3 = 0;から始める
  get_loopListDisplay3 = function (isBulkSellFlag) {
    const listKindId = numericCaseValue(isBulkSellFlag);
    const rowsPerPage =
      listKindId === 1 ? 20 : listKindId === 2 ? 15 : undefined;
    const fontSize = listKindId === 1 ? 23 : listKindId === 2 ? 32 : undefined;
    let pageIndex = 1;
    let leftDisplayText = "";
    let rightDisplayText = "";
    let accumulatedText = "";
    const rows = valueIkkatuArray;
    for (let rowIndex = valueCountSet3; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      // Advance across empty slots too: otherwise the next call repeats sold rows/totals.
      valueCountSet3 = rowIndex + 1;
      if (row != 0) {
        accumulatedText += formatLoopListRow(row, listKindId);
        if (pageIndex === 1) leftDisplayText = accumulatedText;
        else rightDisplayText = accumulatedText;
      }
      if (valueCountSet3 % rowsPerPage !== 0) continue;
      if (pageIndex === 2) break;
      pageIndex = 2;
      accumulatedText = "";
    }
    WindowManager.show(1, 0, 70, 640, 698);
    WindowManager.drawText(1, `\x1bfs[${fontSize}]${leftDisplayText}`);
    if (rightDisplayText == 0) return;
    WindowManager.show(2, 640, 70, 1280, 698);
    WindowManager.drawText(2, `\x1bfs[${fontSize}]${rightDisplayText}`);
  };

  //選択肢でアイテム表示item_price()合わせて3面表示//選択肢のvalueは1からで選択肢ﾋﾟｸﾁｬは0からvalueWordArray
  // Indent that keeps the quest board title on the right of the window.
  const QUEST_BOARD_TITLE_INDENT = "　　　　　　　　　　　　　　　　　　　";
  // Indent that keeps the quest board prompt below the title.
  const QUEST_BOARD_PROMPT_INDENT = "　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　";
  const SELECTION_PROMPT_FONT = "\\FS[25]";
  const SELECTION_PROMPT_TEXT = "対象を選択して下さい　　　　　　　　　　　　　　　　　　　　　　　　　　　";

  // Header of the list: the quest board window (1) or the bulk sale prompt (2, 3).
  // Returns the choice text of the list prompt.
  function setupLoopChoiceHeader(listKindId) {
    if (listKindId == 1) {
      //クエスト掲示
      WindowManager.show(0, 0, 0, 1280, 110);
      WindowManager.drawText(0, QUEST_BOARD_TITLE_INDENT + QUEST_BOARD_TITLE);
      return QUEST_BOARD_PROMPT_INDENT;
    }
    //一括売却
    return SELECTION_PROMPT_FONT + SELECTION_PROMPT_TEXT;
  }

  // Label of one list entry: the caller prepared word list wins over the entry name.
  function resolveLoopChoiceLabel(
    listKindId,
    entryCategoryId,
    entryIndex,
    entryId,
    runningLabel
  ) {
    if (valueWordArray != 0) return `${valueWordArray[entryIndex]}`;

    const categoryId =
      listKindId == 3 ? valueCountArray2[entryIndex] : entryCategoryId;
    return loopChoiceEntryLabel(entryId, categoryId, runningLabel);
  }

  get_loopChoiceDisplay1 = function (listKindId, entryCategoryId, columnCount) {
    //get_loopChoiceDisplay1(1,0,1);//クエストid1は種類 id2が0道具1武器2防具 id3が列数WindowManager.hide(0);
    //get_loopChoiceDisplay1(2,0,2);//一括売却
    //get_loopChoiceDisplay1(3,0,2);//一括売却

    //picture_motion1("linear",[0]);
    $gameVariables.setValue(GAME_VARIABLE.CHOICE_COLUMN_COUNT, columnCount);
    const choicePromptText = setupLoopChoiceHeader(listKindId);

    const isBulkSaleList = listKindId == 2 || listKindId == 3;
    if (isBulkSaleList) {
      const customChoiceId = 1;
      const choiceParams = {
        text: choicePromptText,
        value: -1
      };
      $gameSystem.addCustomChoice(customChoiceId, choiceParams);
    }

    let choiceIndex = 1;
    let choiceText = "";
    let detailsText = "";
    valueCountArray3 = [];
    const entryIds = valueCountArray;
    const columnLayout = COLUMN_LAYOUT_BY_COUNT[columnCount];
    for (let entryIndex = 0; entryIndex < entryIds.length; entryIndex++) {
      const entryId = entryIds[entryIndex];
      // Both texts are carried over to the next entry, so they stay loop variables.
      choiceText = resolveLoopChoiceLabel(
        listKindId,
        entryCategoryId,
        entryIndex,
        entryId,
        choiceText
      );
      const details = loopChoiceEntryDetails(
        listKindId,
        entryCategoryId,
        entryId,
        entryIndex,
        choiceText,
        detailsText
      );
      choiceText = details.label;
      detailsText = details.text;
      $gameSystem.addCustomChoice(1, { text: choiceText, value: entryIndex });
      valueCountArray3.push(entryId);
      showLoopChoicePicture(
        listKindId,
        columnCount,
        columnLayout,
        choiceIndex,
        detailsText
      );
      choiceIndex++;
    }
  };

  //カラム数 -> 選択肢画像の座標(get_loopChoiceDisplay1用)
  const COLUMN_LAYOUT_BY_COUNT = {
    1: { x: 700, y: 120 },
    2: { x: 1000, y: 10 }
  };

  //リセット項目を表示
  reset_exeDisplay = function () {
    //0がリセットする。1がリセットしない
    //スタートコモンで実行$gameVariables.setValue(183,[0,0,0,1,1,0,0,0,0,0,0]);//10
    //1Ｈシーンフラグをリセットする
    //2挿話フラグをリセットする
    //3Ｈ回想履歴をリセットしない
    //4挿話回想履歴をリセットしない
    //5クエスト達成状況をリセットする
    //6種族討伐数をリセットする
    //7マップ情報をリセットする
    //8戦績情報をクリアする
    const resetFlags = $gameVariables.value(GAME_VARIABLE.RESET_FLAG_SETTINGS);
    const RESET_OPTION_LABELS = {
      1: "Ｈシーンフラグ",
      2: "挿話シーンフラグ",
      3: "Ｈ回想履歴",
      4: "挿話回想履歴",
      5: "クエスト達成状況",
      6: "各種族討伐数",
      7: "マップ情報",
      8: "戦闘レコード"
    };
    for (let entryIndex = 1; entryIndex <= 8; entryIndex++) {
      const label = RESET_OPTION_LABELS[entryIndex];
      const optionText =
        resetFlags[entryIndex] == 0
          ? `${label}をリセットする`
          : `${label}をリセットしない`;
      $gameVariables.setValue(GAME_VARIABLE.OPTION_TEXT_BASE + entryIndex, optionText);
    }
  };

  //リセット時に実行
  reset_exe1 = function () {
    resetSystemEntriesByName(
      401,
      501,
      (label) => !/NoReset|QReset|OReset|SReset/.test(label)
    );
    const resetFlags = $gameVariables.value(GAME_VARIABLE.RESET_FLAG_SETTINGS);
    if (!Array.isArray(resetFlags)) return;
    if (resetFlags[1] == 0) {
      resetSystemEntriesByName(1, 1, (label) =>
        /シーン達成|SReset/.test(label)
      );
      resetFactorData("SceneFactorClearReset", true);
    }
    if (resetFlags[2] == 0)
      resetSystemEntriesByName(1, 1, (label) => /挿話達成|OReset/.test(label));
    if (resetFlags[3] == 0) removeInventoryItemsByMetaValue("EICSwitch", 103);
    if (resetFlags[4] == 0) removeInventoryItemsByMetaValue("EICSwitch", 102);
    if (resetFlags[5] == 0) {
      removeInventoryItemsByMetaValue("SG種別", 1);
      resetSystemEntriesByName(1, 1, (label) => /QReset/.test(label));
    }
    if (resetFlags[6] == 0) $gameVariables.setValue(GAME_VARIABLE.RACE_KILL_COUNTS, Array(1001).fill(0));
    if (resetFlags[7] == 0)
      removeDatabaseItemsByMetadata(
        $dataItems,
        ["BattleMapInformation"],
        -9999
      );
    if (resetFlags[8] == 0) {
      $gameParty.clearRecord();
      deployedActorsForReset().forEach((gameActor) =>
        gameActor.clearBattleRecord()
      );
    }
    resetFactorData("EventFactorClearReset", false);
  };

  //バトルレコード一覧
  //スキルタイプ -> 戦績レコードindex(actor_battleRecordDisplay1用)
  const BATTLE_RECORD_SKILL_TYPE_IDS = [2, 5, 6, 7, 8, 12, 13];

  actor_battleRecordDisplay1 = function () {
    valueBattleRecordMVP = Array(11).fill(0);
    const partyMembers = $gameParty.members();
    updatePartyBattleRecordMvp(partyMembers);
    const battleRecordTitle = colorTaggedText(10, "☆Battle Record");
    const skillCountTitle = colorTaggedText(10, "☆Skill Count");
    let recordHeaderText = `${battleRecordTitle}\nTotalKill\nMaxAssalt\nTotalAssalt\nCritical\nOverKill\nMaxDamage\nTotalDamage\nDefead\n`;
    recordHeaderText += `${skillCountTitle}\nAttack\nS-Ability\nA-Ability\nW-Ability\nR-Ability\nBurst!\nChain!`;
    WindowManager.show(1, 10, 100, 250, 668);
    WindowManager.drawText(1, recordHeaderText);

    for (
      let memberIndex = 0;
      memberIndex < partyMembers.length && memberIndex < 4;
      memberIndex++
    )
      showActorBattleRecord(
        partyMembers[memberIndex],
        memberIndex,
        2 + memberIndex * 2,
        260 + memberIndex * 250
      );
  };

  //コンフィグ時に全般情報表示
  // Collection rate lines of the party record: label plus the variable holding
  // [collected, total].
  const COLLECTION_RATE_ENTRIES = [
    { label: "S.Scene  :", variableId: GAME_VARIABLE.EPISODE_COLLECTION_RATES },
    { label: "H.Scene  :", variableId: GAME_VARIABLE.SCENE_COLLECTION_RATES },
    { label: "Title    :", variableId: GAME_VARIABLE.TITLE_COLLECTION_RATES },
    { label: "H.Title  :", variableId: GAME_VARIABLE.H_TITLE_COLLECTION_RATES },
    { label: "Quest    :", variableId: GAME_VARIABLE.QUEST_COLLECTION_RATES }
  ];

  // "Label    :collected/total" line of one collection rate variable.
  function collectionRateLine(label, variableId) {
    const rateValues = $gameVariables.value(variableId);
    return `${label}${rateValues[0]}/${rateValues[1]}\n`;
  }

  // "[発動中の称号効果]" block: one line per title slot, "Empty" for an empty slot.
  function buildActiveTitleEffectText() {
    const activeTitleHeading = colorTaggedText(16, "[発動中の称号効果]");
    let miscInfoText = activeTitleHeading + "\n";
    const titleSlotCount = $gameVariables.value(GAME_VARIABLE.TITLE_SLOT_COUNT);
    const titleEffectIds = $gameVariables.value(GAME_VARIABLE.TITLE_EFFECT_IDS);
    for (let slotIndex = 0; slotIndex < titleSlotCount; slotIndex++) {
      const titleItemId = titleEffectIds[slotIndex];
      if (titleItemId == 0) {
        miscInfoText += "Empty\n";
        continue;
      }
      const activeTitleName = colorTaggedText(2, $dataItems[titleItemId].name);
      miscInfoText += `${activeTitleName}\n`;
    }
    return miscInfoText;
  }

  // Party record picture on the right edge; the message window links to it.
  function showPartyRecordPicture(partyInfoText) {
    const partyInfoPictureId = 101;
    $gameScreen.setDTextPicture(partyInfoText, 25);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(
      partyInfoPictureId,
      "",
      0,
      810,
      80,
      100,
      100,
      255,
      0
    );
    $gameMessage.setSelectPictureId(0, partyInfoPictureId);
  }

  config_display = function () {
    const variableText = "\\V[58]";
    const variableText2 = "\\V[55]";
    const variableText3 = "\\V[141]";
    const partyRecordText = `${variableText}日目<${variableText2}> ${variableText3}\n`;
    const partyRecordTitle = colorTaggedText(16, "Party Record");
    let partyInfoText = `${partyRecordTitle}\n`;
    partyInfoText += "\\I[266]\\V[16]/\\V[13]\n";
    partyInfoText += "F.Seed   :\\V[57]\n";
    for (const rateEntry of COLLECTION_RATE_ENTRIES) {
      partyInfoText += collectionRateLine(rateEntry.label, rateEntry.variableId);
    }
    partyInfoText += "PartySize:\\V[54]\n";
    partyInfoText += "Battle   :\\V[46]\n";
    partyInfoText += "Victory  :\\V[47]\n";
    partyInfoText += "Defeat   :\\V[48]\n";
    const escapeCount = $gameSystem.escapeCount();
    partyInfoText += `Escape   :${escapeCount}\n`;
    partyInfoText += "TotalKill:\\V[43]\n\n";

    const miscInfoText = buildActiveTitleEffectText();

    WindowManager.show(1, 0, 0, 800, 68);
    WindowManager.drawText(1, `\\fs[25]${partyRecordText}`);
    WindowManager.show(2, 410, 68, 390, 520);
    WindowManager.drawText(2, miscInfoText);

    showPartyRecordPicture(partyInfoText);
  };

  //会話時に実行
  talk_script = function () {
    const facePictureId = 86;
    const picture2 = $gameScreen.picture(facePictureId);
    if (picture2) {
      var faceName = picture2.name();
      var faceName = faceName.replace("/img/talkface/", "");
      var actorIdCode = faceName.charAt(0);
      var secondChar = faceName.charAt(1);
      if (Number(secondChar)) {
        actorIdCode += String(secondChar);
      }
    } else {
      var actorIdCode = $gameVariables.value(GAME_VARIABLE.SELECTED_ACTOR_ID);
    }
    const picMoveParam = $gameMessage._IZSTPicMoveParam[1];
    if (
      Number(actorIdCode) ==
      $gameVariables.value(GAME_VARIABLE.SELECTED_ACTOR_ID)
    ) {
      const selectedActorId = $gameVariables.value(
        GAME_VARIABLE.SELECTED_ACTOR_ID
      );
      var faceName = selectedActorId + "Actor_" + valueFaceSelect;
      pic_locationSet(91, 91, "/img/talkface/" + faceName, 1, 0);
      //$gameSwitches.setValue(436,true);
      //battle_bustUp(id1,$gameMessage._IZSTPicMoveParam[0]-640,picMoveParam-384,1);
      //$gameSwitches.setValue(436,false);
    } else {
      $gameSwitches.setValue(GAME_SWITCH.BUSTUP_ON_MESSAGE, true);
      battle_bustUp(101, 100, picMoveParam - 384, 30);
      $gameSwitches.setValue(GAME_SWITCH.BUSTUP_ON_MESSAGE, false);
    }
  };

  //変動する特徴設定
  trait_changeSetting = function (stateId) {
    switch (numericCaseValue(stateId)) {
      case 106:
        configureFaithBuff(stateId);
        break;
      case 107:
        configureMealBuff(stateId);
        break;
    }
    $gamePlayer.refresh();
  };

  //ミニステでインフォＹ軸補正値変更info_SetY($gameVariables.value(200));
  info_SetY = function (positionPresetId) {
    switch (positionPresetId) {
      case 1:
        valueInfoY = 0;
        break;
      case 2:
      case 3:
      case 4:
        valueInfoY = -100;
        break;
      case 5:
        valueInfoY = 0;
        break;
    }
  };

  // Small text fragments that used to be concatenated inline.
  const NIGHT_BACKGROUND_SUFFIX = "N";
  const SHADOW_BATTLER_SUFFIX = "[影]";
  const BATTLE_HUD_FACE_PREFIX = "/img/battlehud/Face_";
  // Escape marker wrapped around an icon index in the record windows.
  const ICON_MARKER_PREFIX = "\x1bI[";
  const ICON_MARKER_SUFFIX = "]";
  // Indents of the item detail window (ideographic spaces in the original).
  const DETAIL_INDENT_LEFT =
    "　　　　　　";
  const DETAIL_INDENT_RIGHT =
    "　　　　　　　　";

  // Tips menu layout: the choice list shows the first pictures of the tip block.
  const TIP_CHOICE_ID = 1;                 // the tips reuse custom choice list 1
  const TIP_PICTURE_ID_BASE = 101;
  // Each tip uses a text picture and an optional image picture (101, 102, 103, ...).
  const TIP_PICTURE_SLOTS_PER_TIP = 2;
  // Choice labels are truncated, so long tip titles do not break the window.
  const TIP_CHOICE_LABEL_MAX_LENGTH = 14;
  // Font size tags around the truncated title (20 inside the choice list, 28 after).
  const TIP_CHOICE_FONT_TAG = "\\fs[20]";
  const TIP_CHOICE_FONT_RESET = "\\fs[28]";

  function buildTipChoiceLabel(tipTitle) {
    const shortTitle =
      tipTitle.length >= TIP_CHOICE_LABEL_MAX_LENGTH
        ? tipTitle.substring(0, TIP_CHOICE_LABEL_MAX_LENGTH)
        : tipTitle;
    return TIP_CHOICE_FONT_TAG + shortTitle + TIP_CHOICE_FONT_RESET;
  }

  //tipsを纏めて閲覧
  tips_select = function () {
    const tipNames = $gameVariables.value(GAME_VARIABLE.TIP_TITLES);
    const tipDescriptions = $gameVariables.value(GAME_VARIABLE.TIP_TEXTS);
    const tipPictures = $gameVariables.value(GAME_VARIABLE.TIP_PICTURES);
    // Every tip reserves two picture slots, so the offset grows by two per entry.
    let pictureIdOffset = TIP_PICTURE_ID_BASE;
    for (let tipIndex = 0; tipIndex < tipNames.length; tipIndex++) {
      const tipChoiceLabel = buildTipChoiceLabel(tipNames[tipIndex]);
      $gameSystem.addCustomChoice(TIP_CHOICE_ID, {
        text: tipChoiceLabel,
        value: tipIndex + 1
      });
      showTipDescriptionPicture(tipNames, tipDescriptions, tipIndex, pictureIdOffset);
      showTipImagePicture(tipPictures, tipIndex, pictureIdOffset);
      pictureIdOffset += TIP_PICTURE_SLOTS_PER_TIP;
    }
  }

  // The tip title and its description sit one slot after the tip image.
  function showTipDescriptionPicture(tipNames, tipDescriptions, tipIndex, pictureIdOffset) {
    const tipDescription = tipDescriptions[tipIndex];
    if (tipDescription == 0) return;

    const tipTitleLabel = colorTaggedText(16, tipNames[tipIndex]);
    $gameScreen.setDTextPicture(
      `${tipTitleLabel}:\n${tipDescription}`,
      28
    );
    $gameScreen.dWindowFrame = "ON";
    const descriptionPictureId = tipIndex + pictureIdOffset + 1;
    $gameScreen.showPicture(
      descriptionPictureId,
      "",
      0,
      334,
      10,
      100,
      100,
      255,
      0
    );
    $gameMessage.setSelectPictureId(tipIndex, descriptionPictureId);
  }

  // Optional illustration of the tip; the entry carries its file name and flags in [0].
  function showTipImagePicture(tipPictures, tipIndex, pictureIdOffset) {
    const tipPicture = tipPictures[tipIndex];
    if (!tipPicture || tipPicture[0] == 0) return;

    const imagePictureId = tipIndex + pictureIdOffset;
    $gameScreen.showPicture(
      imagePictureId,
      tipPicture[0],
      0,
      334,
      0,
      100,
      100,
      255,
      0
    );
    $gameMessage.setSelectPictureId(tipIndex, imagePictureId);
  };

  //ダンジョンから脱出スクリプト
  dungeon_escape = function () {
    if ($gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID) >= 1) {
      var escapePositionValues =
        $dataItems[
          $gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)
        ].meta["EscapeMapID"].split(",");
      $gameVariables.setValue(GAME_VARIABLE.SAVED_POSITION, [
        Number(escapePositionValues[0]),
        Number(escapePositionValues[1]),
        Number(escapePositionValues[2])
      ]);
      set_playerPosition2(161);
    } else {
      $gameVariables.setValue(GAME_VARIABLE.SAVED_POSITION, [14, 26, 7]);
      set_playerPosition2(161);
    }
  };

  //街から外に出るスクリプト
  town_escape = function () {
    $gameVariables.setValue(GAME_VARIABLE.OUTFIT_PERMISSION_FLAGS, Array(21).fill(0));
    const members = $gameParty.members();
    for (var i = 0; i < members.length; i++) {
      if (isGirl(members[i])) {
        const girlActorId = members[i].actorId();
        const permissionWeaponId = $gameVariables.value(GAME_VARIABLE.TOWN_INFO_ITEM_ID);
        if (permissionWeaponId >= 1) {
          const permissionClothMeta =
            $dataWeapons[permissionWeaponId].meta["PermissionCloth"];
          if (permissionClothMeta) {
            if (
              $gameVariables.value(GAME_VARIABLE.ACTOR_NUDE_FLAGS_BASE + girlActorId)[41] ==
              Number(permissionClothMeta)
            ) {
              const actorRecords = $gameVariables.value(GAME_VARIABLE.ACTOR_RECORD_BASE + girlActorId);
              if (actorRecords[5] > actorRecords[4]) {
                $gameVariables.value(GAME_VARIABLE.OUTFIT_PERMISSION_FLAGS)[girlActorId] =
                  Number(permissionClothMeta);
              }
            }
          }
        }
      }
    }
    const escapeSourceVarId = 204;
    const escapeSource = $gameVariables.value(escapeSourceVarId);
    const escapeMapId = escapeSource[0];
    const escapeMapX = escapeSource[1];
    const escapeMapY = escapeSource[2];
    if (escapeMapId >= 1) {
      $gamePlayer.reserveTransfer(escapeMapId, escapeMapX, escapeMapY, 2, 2);
    } else {
      $gamePlayer.reserveTransfer(14, 2, 2, 2, 2);
    }
  };

  //指定衣装OKな町から出た後、次マップで露出超過なら通常衣装に戻すスクリプト。マップ最初イベントで実行
  town_startPermissionClothChange = function () {
    const actorIds = $gameVariables.value(GAME_VARIABLE.OUTFIT_PERMISSION_FLAGS) || [];
    const permissionWeaponId = $gameVariables.value(GAME_VARIABLE.TOWN_INFO_ITEM_ID);
    const permissionWeapon =
      permissionWeaponId >= 1 ? $dataWeapons[permissionWeaponId] : null;
    const permissionActor =
      permissionWeapon && permissionWeapon.meta.PermissionCloth;
    const hasPermission =
      !!permissionActor &&
      actorIds.some(
        (actorId) => actorId >= 1 && actorId == Number(permissionActor)
      );
    if (!hasPermission) {
      // Variable 520 is indexed by actor id and stores the permitted outfit id,
      // so the index (not the stored value) identifies the actor to restore.
      for (let actorId = 0; actorId < actorIds.length; actorId++)
        if (actorIds[actorId] >= 1) restoreActorTownClothing(actorId);
    }
    $gameVariables.setValue(GAME_VARIABLE.OUTFIT_PERMISSION_FLAGS, Array(21).fill(0));
  };

  //ダンジョンワプ機能スクリプト<warpShare:1>
  // Warp points of a dungeon item note: "warpPoint1".."warpPoint9".
  const WARP_POINT_NOTE_COUNT = 9;

  // Pushes the warp start and every unlocked warp point of one item meta block.
  // Returns true when at least one warp point was unlocked.
  function pushWarpEntries(itemMeta, pointFlags) {
    if (itemMeta["warpStart"]) {
      valueScriptArray1.push(itemMeta["warpStart"].split(","));
    }

    let hasUnlockedWarpPoint = false;
    for (
      let warpPointIndex = 1;
      warpPointIndex <= WARP_POINT_NOTE_COUNT;
      warpPointIndex++
    ) {
      const warpPointMeta = itemMeta["warpPoint" + warpPointIndex];
      if (!warpPointMeta) continue;
      if (pointFlags[warpPointIndex] != 1) continue;

      valueScriptArray1.push(warpPointMeta.split(","));
      hasUnlockedWarpPoint = true;
    }
    return hasUnlockedWarpPoint;
  }

  // Warp entries of the whole share group: every item with the same "<warpShare>".
  function collectSharedWarpEntries(warpShareGroupId, warpPoints) {
    for (let itemId = 1; itemId <= $dataWeapons.length - 1; itemId++) {
      const itemData = $dataItems[itemId];
      if (!itemData || !itemData.meta["warpShare"]) continue;
      if (Number(itemData.meta["warpShare"]) != warpShareGroupId) continue;

      if (pushWarpEntries(itemData.meta, warpPoints[itemId])) {
        $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, true);
      }
    }
  }

  dungeon_warpscript = function (warpModeId) {
    if (warpModeId != 1) return;

    $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, false);
    const dungeonInfoItemId = $gameVariables.value(
      GAME_VARIABLE.DUNGEON_INFO_ITEM_ID
    );
    const dungeonMeta = $dataItems[dungeonInfoItemId].meta;
    const warpPoints = $gameVariables.value(GAME_VARIABLE.DUNGEON_WARP_POINTS);

    if (dungeonMeta["warpShare"]) {
      collectSharedWarpEntries(Number(dungeonMeta["warpShare"]), warpPoints);
      return;
    }
    // Single dungeon: its own warp point flags.
    if (pushWarpEntries(dungeonMeta, warpPoints[dungeonInfoItemId])) {
      $gameSwitches.setValue(GAME_SWITCH.TEMPORARY_RESULT, true);
    }
  };
  function createRandomWordSegment(
    wordHeadCandidates,
    wordBodyCandidates,
    wordTailCandidates,
    shakeOffsetCandidates
  ) {
    const wordHead =
      wordHeadCandidates[getRandomIndex(wordHeadCandidates.length)];
    const wordBody =
      wordBodyCandidates[getRandomIndex(wordBodyCandidates.length)];
    const fontSize =
      wordTailCandidates[getRandomIndex(wordTailCandidates.length)];
    let shakeOffset;

    if (wordBody == " ") {
      shakeOffset = -getRandomIndex(11);
    } else if (HEART_WORD_BODIES.includes(wordBody)) {
      shakeOffset = getRandomIndex(6);
    } else {
      shakeOffset =
        shakeOffsetCandidates[getRandomIndex(shakeOffsetCandidates.length)];
      if (fontSize >= 40) {
        shakeOffset += Math.ceil(fontSize / 4);
      }
    }

    return `\x1bfs[${fontSize}]${wordHead}${wordBody}\\MX[${-shakeOffset}]`;
  }

  function appendRandomWordSegments(
    targetVarId,
    count,
    wordHeadCandidates,
    wordBodyCandidates,
    wordTailCandidates,
    shakeOffsetCandidates
  ) {
    let generatedText = $gameVariables.value(targetVarId);
    for (let index = 0; index < count; index++) {
      generatedText += createRandomWordSegment(
        wordHeadCandidates,
        wordBodyCandidates,
        wordTailCandidates,
        shakeOffsetCandidates
      );
    }
    $gameVariables.setValue(targetVarId, generatedText);
  }

  //文字ランダム作成
  text_randumWord = function (
    targetVarId,
    actorIdCode,
    wordRepeatCount,
    wordHeadCandidates,
    wordBodyCandidates,
    wordTailCandidates,
    shakeOffsetCandidates
  ) {
    $gameVariables.setValue(targetVarId, `\\AT[${actorIdCode}]`);
    //var wordPart1 = `${wordPart1}\\MY[0]`;
    appendRandomWordSegments(
      targetVarId,
      wordRepeatCount,
      wordHeadCandidates,
      wordBodyCandidates,
      wordTailCandidates,
      shakeOffsetCandidates
    ); //
    if (!(wordRepeatCount >= 20)) return;

    const currentWordText = $gameVariables.value(targetVarId);
    $gameVariables.setValue(targetVarId, currentWordText + "\n");
    appendRandomWordSegments(
      targetVarId,
      wordRepeatCount,
      wordHeadCandidates,
      wordBodyCandidates,
      wordTailCandidates,
      shakeOffsetCandidates
    ); //
    //Graphics.loadFont("GameFont","fonts/eromangasimaji.otf");
  };

  //２回目以降殲滅時にボーナス
  annihilationItem_bonus = function () {
    const chestId = Number(
      $gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)
    );
    const chestData = $dataItems[chestId];
    if (!chestData) return;
    const chestMeta = chestData.meta;

    if (!chestMeta["TchestType"]) return;

    const chestOptions = collectChestOptions(chestMeta);
    const selectedOption = selectRandomChestOption(chestOptions);

    if (!selectedOption) return;

    const itemData = getItemAndAwardToPlayer(selectedOption);

    if (!itemData) return;
    // displayBonusMessage

    // Icon marker and name live in one variable so the sentence stays translatable.
    const itemName = colorTaggedText(
      24,
      `\x1bI[${itemData.iconIndex}]${itemData.name}`
    );
    valueWordSet1 = `全滅ボーナスとして${itemName}を入手した！`;

    checkForRareItemFlags(chestMeta, selectedOption.itemIndex);
  };

  // Collects all possible chest reward options from the chest metadata
  collectChestOptions = function (chestMeta) {
    const options = [];

    // Add standard chest items
    if (chestMeta["TchestType"] && chestMeta["Tchest"]) {
      const types = chestMeta["TchestType"].split(",");
      const indices = chestMeta["Tchest"].split(",");

      for (let i = 0; i < types.length; i++) {
        options.push({
          type: Number(types[i]),
          itemIndex: Number(indices[i])
        });
      }
    }

    // Add first annihilation item if present
    if (chestMeta["firstAnnihilationItem"]) {
      const [type, index] = chestMeta["firstAnnihilationItem"].split(",");
      options.push({
        type: Number(type),
        itemIndex: Number(index)
      });
    }

    // Add chest-only bonus item if present
    if (chestMeta["TchestOnly"]) {
      const [, , , type, index] = chestMeta["TchestOnly"].split(",");
      options.push({
        type: Number(type),
        itemIndex: Number(index)
      });
    }

    return options.filter((option) => {
      const database = getItemEquipmentSource(option.type);
      return (
        Number.isInteger(option.type) &&
        option.type >= 0 &&
        option.type <= 2 &&
        Number.isInteger(option.itemIndex) &&
        option.itemIndex > 0 &&
        !!database[option.itemIndex]
      );
    });
  };

  // Selects a random option from the available chest options
  selectRandomChestOption = function (options) {
    if (options.length === 0) return null;
    return options[getRandomIndex(options.length)];
  };

  // Retrieves the item based on type and index, then gives it to the player
  getItemAndAwardToPlayer = function (option) {
    if (!option) return null;
    const itemArray = getItemEquipmentSource(option.type);
    const item = itemArray[option.itemIndex];

    if (!item) return null;
    $gameParty.gainItem(item, 1);

    return {
      item: item,
      iconIndex: item.iconIndex,
      name: item.name
    };
  };

  // Checks if the selected item is a rare item and sets appropriate flags
  checkForRareItemFlags = function (chestMeta, selectedItemIndex) {
    // Check standard rare item flag
    if (
      chestMeta["TchestRere"] &&
      selectedItemIndex == Number(chestMeta["TchestRere"])
    ) {
      $gameSwitches.setValue(GAME_SWITCH.RARE_CHEST_TEMP, true);
      return;
    }
    // Check first annihilation rare item flag
    if (chestMeta["firstAnnihilationItem"]) {
      const firstAnnihilationIndex = Number(
        chestMeta["firstAnnihilationItem"].split(",")[1]
      );
      if (selectedItemIndex == firstAnnihilationIndex) {
        $gameSwitches.setValue(GAME_SWITCH.RARE_CHEST_TEMP, true);
        return;
      }
    }

    // Check chest-only rare item flag
    if (chestMeta["TchestOnly"]) {
      const chestOnlyIndex = Number(chestMeta["TchestOnly"].split(",")[4]);
      if (selectedItemIndex == chestOnlyIndex) {
        $gameSwitches.setValue(GAME_SWITCH.RARE_CHEST_TEMP, true);
        return;
      }
    }
  };

  //文字ピクチャを座標指定して表示しっぱなしpictureText_SetUp(1,100,`ジュク…っ\\I[12]`,28,640,384,180,'eromangasimaji')
  pictureText_SetUp = function (
    setupType,
    pictureId,
    displayText,
    textSetting,
    posX,
    posY,
    moveDuration,
    fontName
  ) {
    if (setupType == 1) {
      curveFunctions.patternScaleX = curveFunctions.getPattern("jump", [100]);
      curveFunctions.patternScaleY = curveFunctions.getPattern("jump", [100]);
      if (fontName != 0) {
        $gameScreen.setDtextFont(fontName);
      }
      $gameScreen.dTextAlign = 0;
      $gameScreen.dWindowFrame = "ON";
      $gameScreen.dTextRealTime = "ON";
      $gameScreen.setDTextPicture(displayText, textSetting);
      $gameScreen.showPicture(pictureId, "", 1, posX, posY, 0, 0, 0, 0);
      $gameScreen.movePicture(
        pictureId,
        1,
        posX,
        posY,
        100,
        100,
        255,
        0,
        moveDuration
      );
    } else {
      $gameScreen.setDtextFont("ＭＳ Ｐ明朝");
      picture_motion1("smooth", [0]);
      pic_eraseP(0, [pictureId]);
    }
  };

  //エネミーステートでドロップ
  //enemy_drop = function(user,enemy){
  //};

  learn_show_eval_is_notlearned_added_contains = function (user, skillId) {
    return (
      !user.isLearnedSkill(skillId) && user.addedSkills().contains(skillId)
    );
  };

  learn_show_eval_mastery_moreorequalof = function (
    user,
    skillId,
    minSkillMasteryLevel
  ) {
    return user.skillMasteryLevel(skillId) >= minSkillMasteryLevel;
  };

  learn_show_eval_notmax_or_islearned = function (user, skillId) {
    return (
      user.skillMasteryLevel(skillId) <
        Number($dataSkills[skillId].meta["Max Mastery Level"]) &&
      user.isLearnedSkill(skillId)
    );
  };

  learn_show_eval_is_notlearned_max_addedcontains_reqskill = function (
    user,
    skillId,
    reqSkillId
  ) {
    return (
      !user.isLearnedSkill(skillId) &&
      user.skillMasteryLevel(skillId) >=
        Number($dataSkills[skillId].meta["Max Mastery Level"]) &&
      user.addedSkills().contains(skillId) &&
      user.isLearnedSkill(reqSkillId)
    );
  };

  triggerParallelEventIfQuestAndMapMatch0 = function (
    questProgress,
    mapId,
    event_pararelStarting_param2
  ) {
    triggerParallelEventIfQuestAndMapMatch(
      questProgress,
      mapId,
      event_pararelStarting_param2,
      true,
      -1
    );
  };

  triggerParallelEventIfQuestAndMapMatch1 = function (
    questProgress,
    mapId,
    switchId,
    event_pararelStarting_param2
  ) {
    triggerParallelEventIfQuestAndMapMatch(
      questProgress,
      mapId,
      event_pararelStarting_param2,
      false,
      switchId
    );
  };

  // Renamed from triggerParallelEventIfQuestAndMapMatch
  triggerParallelEventIfQuestAndMapMatch = function (
    questProgress,
    mapId,
    eventParallelParam,
    skipGuardCheck,
    switchId
  ) {
    if ($gameVariables.value(GAME_VARIABLE.MAIN_QUEST_PROGRESS_1) != questProgress) return;
    if ($gameMap.mapId() != mapId) return;
    if (!skipGuardCheck && !$gameSwitches.value(switchId)) return; // Guard win condition check

    event_pararelStarting(0, eventParallelParam, 0);
    $gameSwitches.setValue(GAME_SWITCH.PARALLEL_PROCESS_STOPPED, true);
  };

  scene_joukenNakami_clean_prefixes = function (text) {
    return text
      .replace("[daysReset]", "")
      .replace("[NoReset]", "")
      .replace("[夜自動]", "")
      .replace("[シーン達成]", "")
      .replace("[挿話達成]", "");
  };

  getItemEquipmentSource = function (id) {
    switch (Number(id)) {
      case 1:
        return $dataWeapons;
      case 2:
        return $dataArmors;
      default:
        return $dataItems;
    }
  };

  getItemsSourceSkillsItemsStates = function (id) {
    switch (Number(id)) {
      case 0:
        return $dataSkills;
      case 1:
        return $dataItems;
      case 2:
        return $dataStates;
      default:
        console.error(
          `getItemsSourceSkillsItemsStates: id(${id}) is not 0,1,2!`
        );
        return null;
    }
  };

  getRandomIndex = function (length) {
    return Math.floor(Math.random() * length);
  };

  getPreviousTachiePicId = function () {
    return $gameVariables.value(GAME_VARIABLE.PORTRAIT_PICTURE_ID);
  };

  isHEnemyOrNonAuto = function () {
    return $gameSwitches.value(GAME_SWITCH.H_ENEMY);
  };

  isGirl = function (gameActor) {
    return !!gameActor && gameActor.isStateAffected(602);
  };

  // CommonEvents
  configureCommonEvents = function (start, end, switchIdOffset) {
    for (let itemId = start; itemId <= end; itemId++) {
      const cEv = $dataCommonEvents[itemId];
      cEv.trigger = 2;
      if ($dataItems[itemId].meta["AutoEvent"]) cEv.trigger = 1;
      cEv.switchId = switchIdOffset + itemId;
    }
  };

  initializeVersionSettings = function () {
    //$gameSwitches.setValue(4,true)//体験版on
    $gameSwitches.setValue(GAME_SWITCH.TRIAL_VERSION, false); //製品版on
    //$gameSwitches.setValue(53,true)//デバッグon
    //$gameSwitches.setValue(53,false)//デバッグoff
    $gameVariables.setValue(GAME_VARIABLE.GAME_VERSION_TEXT, "りしゃぶるVer1.49");
  };

  setNPCInfo = function (gameVarId, metaKey, substitutionCallback) {
    $gameVariables.setValue(gameVarId, Array(101).fill(0));
    populateNPCInformation(
      $gameVariables.value(gameVarId),
      metaKey,
      substitutionCallback
    );
  };
  setNPCFamilyName = function () {
    setNPCInfo(354, "FamilyName", function (actorId) {
      return $dataWeapons[actorId + 200].name;
    });
  };
  setNPCProfession = function () {
    setNPCInfo(353, "Profession", function (actorId) {
      return $gameVariables.value(actorId + 380)[59];
    });
  };
  setItemSGType2GlossaryText123 = function () {
    const start = 1;
    const end = $dataItems.length - 1;
    for (var itemId = start; itemId <= end; itemId++) {
      let itemMeta = $dataItems[itemId].meta["SG種別"];
      if (itemMeta && Number(itemMeta) === 2) {
        scene_Glossarytext1(itemId, 218);
        scene_Glossarytext2(itemId, 213);
        scene_Glossarytext3(itemId, 219);
      }
    }
  };

  /* Checks if the scene glossary functionality is disabled.
   *
   * This function uses switch 160("シーングローサリー使用不可スイッチ") to determine if the scene glossary
   * feature should be prevented from use. When the switch is active(true), the scene glossary is disabled.
   *
   * @function isSceneGlossaryDisabled
   */
  isSceneGlossaryDisabled = function () {
    const statesCount = $dataStates.length;
    const partyMembers = $gameParty.members();
    const partyMembersCount = partyMembers.length;
    const gameSwitches = $gameSwitches;
    for (let i = 1; i < statesCount; i++) {
      for (
        let memberIndex = 0;
        memberIndex < partyMembersCount;
        memberIndex++
      ) {
        const partyMember = partyMembers[memberIndex];
        if (partyMember.getStateCounter(i) != undefined) {
          gameSwitches.setValue(GAME_SWITCH.SCENE_GLOSSARY_DISABLED, true);
          return;
        }
      }
    }

    gameSwitches.setValue(GAME_SWITCH.SCENE_GLOSSARY_DISABLED, false);
  };

  isSceneGlossaryDisabledv2 = function () {
    const stateIds = $gameVariables.value(GAME_VARIABLE.GLOSSARY_BLOCKING_STATES);
    if (!Array.isArray(stateIds) || !stateIds.length) {
      $gameSwitches.setValue(GAME_SWITCH.SCENE_GLOSSARY_DISABLED, false);
      return;
    }

    const gameSwitches = $gameSwitches;
    const gameParty = $gameParty;
    const partyMembers = gameParty.members();

    const partyMinIndex = partyMembers.length - 1;

    // Process in reverse order for potentially earlier exit
    for (let i = stateIds.length - 1; i >= 0; i--) {
      const stateId = stateIds[i];
      if (!gameParty.membersState(stateId)) continue;

      for (let memberIndex = partyMinIndex; memberIndex >= 0; memberIndex--) {
        const actor = partyMembers[memberIndex];

        if (
          actor.isStateAffected(stateId) &&
          actor.getStateCounter(stateId) !== undefined
        ) {
          gameSwitches.setValue(GAME_SWITCH.SCENE_GLOSSARY_DISABLED, true);
          return;
        }
      }
    }

    // If we get here, no matches were found
    gameSwitches.setValue(GAME_SWITCH.SCENE_GLOSSARY_DISABLED, false);
  };

  setupDateTime = function () {
    const timeget = new Date();
    const year = timeget.getFullYear();
    const month = timeget.getMonth() + 1;
    const day = timeget.getDate(); //日(1-31)。getDay()は曜日(0-6)なので使わない
    const hour = timeget.getHours();
    const min = timeget.getMinutes();
    const sec = timeget.getSeconds();
    $gameVariables.setValue(
      67,
      year + "/" + month + "/" + day + " T" + hour + ":" + min + ":" + sec
    );
  };

  showMapName = function () {
    const displayName = $gameMap.displayName();
    if (!displayName) return;
    const mapId = $gameMap.mapId();
    const specialMapName = valueMapNameSpecialStaging[mapId];
    const hasSpecialName =
      specialMapName !== undefined &&
      specialMapName !== null &&
      specialMapName !== 0;
    const mapName = hasSpecialName ? specialMapName : displayName;
    if (hasSpecialName) $dataMap.displayName = mapName;
    const nameColorId = $gameSwitches.value(GAME_SWITCH.BATTLE_MAP) ? 10 : 3;
    const coloredMapName = colorTaggedText(nameColorId, mapName);
    const messageText = `～～${coloredMapName}～～`;
    CommonPopupManager.showInfo({}, messageText, null);
  };

  evStateCleanFromActors = function (actorInitId, actorEndId, stateId) {
    for (let actorId = actorInitId; actorId <= actorEndId; actorId++) {
      const gameActor = $gameActors.actor(actorId);
      if (!gameActor) continue;
      gameActor.removeState(stateId);
    }
  };

  //#region cev 296
  ev296RemoveTempState = function (
    valueTachieChangeStateTemporary,
    parentList
  ) {
    const firstActorId = $gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = $gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    valueTachieChangeStateTemporary.forEach((stateId) =>
      evStateCleanFromActors(firstActorId, lastActorId, stateId)
    );
    restorePartyHeroineOutfits(() => tachie_settei2());
    parentList.setupChild($dataCommonEvents[19].list, 0);
  };
  //#endregion

  //#region cev23
  ev23StateReleaseOverTime = function (parent) {
    const firstActorId = $gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = $gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );

    // Process each state that has the timeRemove flag
    for (let stateId = 1; stateId < $dataStates.length; stateId++) {
      const state = $dataStates[stateId];
      if (!state.meta["timeRemove"]) continue;

      // If any party member has this state, log its removal
      if ($gameParty.membersState(stateId)) {
        appendDayEndInformation(parent, `${state.name}が解除された。\n`);
      }

      // Remove the state from all actors
      evStateCleanFromActors(firstActorId, lastActorId, stateId);
    }
  };

  ev23DecreaseTPby30 = function (parent) {
    const actorIds = $gameVariables.value(GAME_VARIABLE.CHARACTER_ACTOR_IDS);

    // Reduce TP for each party member
    actorIds.forEach((actorId) => {
      $gameActors.actor(actorId).gainTp(-30);
    });

    // Log the TP reduction
    appendDayEndInformation(parent, "パーティメンバーのTP-30\n");
  };
  //#endregion

  ev23MorningDayEveningNightSwitch = function (parent) {
    const gameSwitches = $gameSwitches;
    const wasNight = gameSwitches.value(GAME_SWITCH.NIGHT);
    const wasDay = gameSwitches.value(GAME_SWITCH.DAYTIME);
    for (let switchId = 13; switchId <= 15; switchId++)
      gameSwitches.setValue(switchId, false);
    if (wasNight) {
      appendDayEndInformation(parent, "朝になりました。\n");
      gameSwitches.setValue(GAME_SWITCH.MORNING, true);
      return;
    }
    if (wasDay) {
      appendDayEndInformation(parent, "夜になりました。\n");
      gameSwitches.setValue(GAME_SWITCH.NIGHT, true);
      return;
    }
    gameSwitches.setValue(GAME_SWITCH.DAYTIME, true);
  };

  ev23zsumaho = function () {
    WindowManager.show(
      1,
      0,
      100,
      1024,
      120 + $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_LINE_COUNT) * 60
    );
  };

  ev23showElapsedMessage = function () {
    const dayNumber = $gameVariables.value(GAME_VARIABLE.ELAPSED_DAYS);
    const weekdayNumber = $gameVariables.value(GAME_VARIABLE.WEEKDAY);
    TickerManager.show(`──${dayNumber}日目(${weekdayNumber}曜日)経過──`);
  };

  resetChildEventAppearance = function () {
    const eventIds = $gameVariables.value(GAME_VARIABLE.DYNAMIC_EVENT_IDS);
    for (let eventId = 11; eventId <= 13; eventId++) {
      const childEventId = eventIds[eventId]; // this._eventId
      const mapEvent = $gameMap.event(childEventId);
      if (mapEvent) {
        mapEvent.setStepAnime(false);
        mapEvent.setWalkAnime(false);
        mapEvent.setDirection(2);
        mapEvent.resetPattern();
        mapEvent._originalPattern = 1;
        mapEvent.setAngle(45);
        mapEvent._spriteOffsetX = -12;
        mapEvent._spriteOffsetY = -12;
        if (mapEvent._kageM) mapEvent._kageM.clear();
        mapEvent.setFace(6, true, true); // For child events: mapEvent.setFace(6, true, true, 0, 6, 0, 6);
      }
    }
  };

  prepareDarknessTransition = function () {
    $gameMap.darknessOpacity = 200;
    const eventId = $gameVariables.value(GAME_VARIABLE.DYNAMIC_EVENT_IDS)[5]; // this._eventId
    const mapEvent = $gameMap.event(eventId);
    if (!mapEvent) return;

    mapEvent.setStepAnime(true);
    mapEvent.setWalkAnime(true);
    mapEvent.setAngle(0);
    mapEvent._spriteOffsetX = 0;
    mapEvent._spriteOffsetY = 0;
    mapEvent._kageM = new Game_KageMaster(mapEvent);
    mapEvent.removeFace();
    mapEvent.setOpacity(0);
  };

  updateDefaultPortraitOutsideBattle = function () {
    if (!!$gameParty.inBattle()) return;

    $gameVariables.setValue(
      GAME_VARIABLE.SELECTED_ACTOR_ID,
      $gameVariables.value(GAME_VARIABLE.PORTRAIT_ACTOR_ID)
    );
    tachie_settei2();
  };

  updateBattleGirlsPortrait = function () {
    const gamePartyBattleMembers = $gameParty.battleMembers();
    for (
      let memberIndex = 0, max = gamePartyBattleMembers.length - 1;
      memberIndex <= max;
      memberIndex++
    ) {
      const actor = gamePartyBattleMembers[memberIndex];
      if (isGirl(actor)) {
        $gameVariables.setValue(
          GAME_VARIABLE.SELECTED_ACTOR_ID,
          actor.actorId()
        );
        tachie_settei3(actor);
      }
    }
  };

  syncAndUpdateActorPortrait = function () {
    restorePartyHeroineOutfits((gameActor) => tachie_settei3(gameActor));
  };

  clearTemporaryActorState = function (parent) {
    const actorIds = $gameVariables.value(GAME_VARIABLE.CHARACTER_ACTOR_IDS);
    actorIds.forEach(function (actorId) {
      $gameActors.actor(actorId).removeState(39);
      $gameVariables.value(GAME_VARIABLE.ACTOR_RECORD_BASE + actorId)[58] = 0;
    }, parent);
  };

  updateNPCWeaponNamesFromVariables = function (parent) {
    const actorIds = $gameVariables.value(GAME_VARIABLE.CHARACTER_ACTOR_IDS);
    actorIds.forEach(function (actorId) {
      $dataWeapons[actorId + 200].name = $gameVariables.value(
        actorId + 380
      )[50];
    }, parent);
  };

  setNPCFamilyNames = function (parent) {
    setNPCInformation(parent, 354, "FamilyName", function (actorId) {
      return $dataWeapons[actorId + 200].name;
    });
  };

  //#region setNPCInformation
  setNPCProfessions = function (parent) {
    setNPCInformation(parent, 353, "Profession", function (actorId) {
      return $gameVariables.value(actorId + 380)[59];
    });
  };

  /**
   * Sets NPC information based on substitution actor or direct metadata.
   * @param {*} parent - The parent object (for sVal method access)
   * @param {number} gameVarId - Target game variable ID to store data (353 for Profession, 354 for FamilyName)
   * @param {string} metaKey - The metadata key to look for ('Profession' or 'FamilyName')
   * @param {Function} substitutionCallback - Function that returns value for substitution actors
   */
  setNPCInformation = function (
    parent,
    gameVarId,
    metaKey,
    substitutionCallback
  ) {
    parent.sVal(gameVarId, Array(101).fill(0));
    populateNPCInformation(
      $gameVariables.value(gameVarId),
      metaKey,
      substitutionCallback
    );
  };
  //#endregion

  /* Private implementation stages: public event entry points stay unchanged. */
  function initializeStartupDatabaseNames() {
    let start = 1;
    let end = $dataWeapons.length;
    for (let weaponId = start; weaponId < end; weaponId++) {
      const weaponData = $dataWeapons[weaponId];
      if (weaponData && weaponData.name == "") {
        weaponData.name = weaponId;
      }
    }

    //操作用などの名称を変更
    //var start = 1;
    end = $dataStates.length;
    for (let stateId = start; stateId < end; stateId++) {
      const state = $dataStates[stateId];
      if (!state) continue;
      if (state.meta["起動時名前改変"]) {
        state.name = state.meta["起動時名前改変"];
      }
    }
  }

  function initializeViewpointSwitchNames(gameVariables) {
    const switches = $dataSystem.switches;
    const switchesLen = switches.length;
    const list = gameVariables.value(GAME_VARIABLE.CHARACTER_ACTOR_IDS);
    if (!Array.isArray(list)) return;
    list.forEach(function (id) {
      const gameActor = $gameActors.actor(id);
      if (!gameActor) return;
      const actorName = gameActor.name();
      switches[440 + id] = `${actorName}視点`;
    }, this);
    for (let switchId = 1; switchId < switchesLen; switchId++) {
      if (switches[switchId].match(/Battle/)) {
        switches[switchId] = switches[switchId].replace("[Battle]", "");
      }
    }
  }

  function initializeStartupItemNames(gameVariables) {
    const switches = $dataSystem.switches;
    initializeMapWeaponNames(switches);
    const numbering = {
      episode: 1,
      scene: 1,
      title: 1,
      quest: 1,
      dailyQuest: 1
    };
    const achieverActorIds = gameVariables.value(
      GAME_VARIABLE.PERSONAL_TITLE_ACTOR_IDS
    );
    const items = $dataItems;
    for (let itemId = 1; itemId < items.length; itemId++) {
      const itemData = items[itemId];
      if (!itemData || itemData.name === "") continue;
      applyStartupItemNameMetadata(itemData, switches);
      applyStartupItemNumbering(itemData, itemId, numbering, achieverActorIds);
    }
  }

  // Trait codes and <Category> names the resistance tags refer to.
  const TRAIT_RESIST_NORMAL_STATE = 13;
  const TRAIT_RESIST_SP_STATE = 14;
  const TRAIT_ELEMENT_RATE = 11;
  const NORMAL_STATE_CATEGORY_NAME = " StateNomal";
  const SP_STATE_CATEGORY_NAME = " StateabNomal";
  // <elementRegist6> covers elements 3-8, <elementRegist9> 3-9 plus 16 and 17.
  const ELEMENT_REGIST_6_IDS = [3, 4, 5, 6, 7, 8];
  const ELEMENT_REGIST_9_IDS = [3, 4, 5, 6, 7, 8, 9, 16, 17];
  // Database order of the resistance pass (states, weapons, armors, classes).
  const RESISTANCE_DATABASE_GETTERS = [
    () => $dataStates,
    () => $dataWeapons,
    () => $dataArmors,
    () => $dataClasses
  ];

  function collectStateIdsByCategory(categoryName) {
    const stateIds = [];
    for (let stateId = 1; stateId < $dataStates.length; stateId++) {
      const stateData = $dataStates[stateId];
      if (!stateData) continue;
      if (stateData.meta["Category"] != categoryName) continue;
      stateIds.push(stateId);
    }
    return stateIds;
  }

  // <StateabNomalResist:20> = 20% less resistance against every listed state.
  function pushResistanceTraits(databaseEntry, resistMetaValue, stateIds) {
    if (!resistMetaValue) return;
    const resistPercent = Number(resistMetaValue);
    const traitCode =
      resistPercent == 0 ? TRAIT_RESIST_SP_STATE : TRAIT_RESIST_NORMAL_STATE;
    const resistRate = resistPercent == 0 ? 1 : 1 - resistPercent / 100;
    stateIds.forEach((stateId) => {
      databaseEntry.traits.push({
        code: traitCode,
        dataId: stateId,
        value: resistRate
      });
    });
  }

  // Same rate rule for every listed element id (0 means "no damage at all").
  function pushElementRateTraits(databaseEntry, resistPercent, elementIds) {
    const elementResistRate =
      resistPercent == 0 ? 0 : 1 - resistPercent / 100;
    elementIds.forEach((elementId) => {
      databaseEntry.traits.push({
        code: TRAIT_ELEMENT_RATE,
        dataId: elementId,
        value: elementResistRate
      });
    });
  }

  function appendElementResistanceTraits(databaseEntry, entryMeta) {
    if (entryMeta["elementRegist6"]) {
      pushElementRateTraits(
        databaseEntry,
        Number(entryMeta["elementRegist6"]),
        ELEMENT_REGIST_6_IDS
      );
    }
    if (entryMeta["elementRegist9"]) {
      pushElementRateTraits(
        databaseEntry,
        Number(entryMeta["elementRegist9"]),
        ELEMENT_REGIST_9_IDS
      );
    }
  }

  function appendResistanceTraitsToDatabase(
    database,
    normalResistStateIds,
    spResistStateIds
  ) {
    for (let databaseIndex = 1; databaseIndex < database.length; databaseIndex++) {
      const databaseEntry = database[databaseIndex];
      if (!databaseEntry) continue; // armors (and others) may hold holes
      const entryMeta = databaseEntry.meta;
      pushResistanceTraits(
        databaseEntry,
        entryMeta["StateabNomalResist"],
        normalResistStateIds
      );
      pushResistanceTraits(
        databaseEntry,
        entryMeta["StateSPabNomalResist"],
        spResistStateIds
      );
      appendElementResistanceTraits(databaseEntry, entryMeta);
    }
  }

  // Adds the resistance traits of every state/weapon/armor/class meta tag once at
  // startup. valueItems is still assigned because other plugins read it.
  function initializeStartupResistanceTraits() {
    const normalResistStateIds = collectStateIdsByCategory(
      NORMAL_STATE_CATEGORY_NAME
    );
    const spResistStateIds = collectStateIdsByCategory(SP_STATE_CATEGORY_NAME);

    RESISTANCE_DATABASE_GETTERS.forEach((getDatabase) => {
      valueItems = getDatabase();
      appendResistanceTraitsToDatabase(
        valueItems,
        normalResistStateIds,
        spResistStateIds
      );
    });
  }

  function appendUniqueMaterialLocationDescriptions() {
    const itemsCount = $dataItems.length;
    const switches = $dataSystem.switches;
    for (let i = 1; i <= 9; i++) {
      for (let itemId = 1; itemId < itemsCount; itemId++) {
        const item = $dataItems[itemId];
        if (!item) continue;
        const itemMeta = item.meta;
        if (itemMeta["UniqueMaterial" + i]) {
          const uniqueMaterials = itemMeta["UniqueMaterial" + i].split(",");
          if (itemMeta["MapSwitch"]) {
            const material = switches[Number(itemMeta["MapSwitch"])];
            const rareGatheringNote = colorTaggedText(2, `[${material}で希少採取]`);
            $dataItems[Number(uniqueMaterials[0])].description += " " + rareGatheringNote;
          }
        }
      }
    }
  }

  function restoreDeployedActorSurnames(gameVariables) {
    const firstActorId = gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    for (let i = firstActorId; i <= lastActorId; i++) {
      const surnameWeapon = $dataWeapons[i + 200];
      const actorRecords = gameVariables.value(i + 380);
      if (!surnameWeapon || !Array.isArray(actorRecords)) continue;
      surnameWeapon.name = actorRecords[50];
    }
  }

  function initializeSpecialMapNames() {
    if (!$dataSystem.variables[61].match(/りしゃぶる/)) return;

    const switches = $dataSystem.switches;
    SPECIAL_MAP_SHOP_NAMES.forEach((shopName) => {
      applySpecialMapShopName(switches, shopName);
    });
    SPECIAL_MAP_FLOOR_NAMES.forEach((floorName) => {
      applySpecialMapFloorNames(switches, floorName);
    });
    SPECIAL_MAP_DIRECT_SWITCHES.forEach((directSwitch) => {
      valueMapNameSpecialStaging[directSwitch.mapId] = `${switches[directSwitch.switchId]}`;
    });
  }

  // Shop / house map names built from the family name stored on a weapon.
  // The switch id and the staged map id differ per entry, so they are listed here.
  const SPECIAL_MAP_SHOP_NAMES = [
    { weaponId: 315, switchId: 279, mapId: 200, prefix: `喫茶 <`, suffix: `カフェ>` },
    { weaponId: 311, switchId: 275, mapId: 95, prefix: `書店 <`, suffix: `古書店>` },
    { weaponId: 316, switchId: 274, mapId: 25, prefix: `民家 <`, suffix: `家>` }
  ];

  // Basement floors tagged with the tower name of their switch: "${name}-[B1F]".
  // The staged map ids are not sequential, so each floor keeps its own entry.
  const SPECIAL_MAP_FLOOR_NAMES = [
    { switchId: 341, floors: [[146, "B1F"], [147, "B2F"], [148, "B3F"], [149, "B4F"], [150, "B5F"]] },
    { switchId: 342, floors: [[152, "B6F"], [153, "B7F"], [154, "B8F"], [155, "B9F"], [156, "B10F"]] },
    { switchId: 343, floors: [[172, "B11F"], [173, "B12F"], [174, "B13F"], [175, "B14F"], [176, "B15F"]] },
    { switchId: 344, floors: [[164, "B16F"], [188, "B17F"], [168, "B18F"], [75, "B19F"], [92, "B20F"]] },
    { switchId: 345, floors: [[177, "B21F"], [178, "B22F"], [179, "B23F"], [180, "B24F"], [181, "B25F"]] }
  ];

  // Map names that are simply the text of a switch.
  const SPECIAL_MAP_DIRECT_SWITCHES = [
    { switchId: 346, mapId: 161 },
    { switchId: 347, mapId: 162 },
    { switchId: 348, mapId: 211 },
    { switchId: 349, mapId: 160 },
    { switchId: 350, mapId: 163 },
    { switchId: 351, mapId: 159 }
  ];

  // Fills "name <family name + suffix>" into the switch and stages it for the map.
  function applySpecialMapShopName(switches, shopName) {
    const familyName = $dataWeapons[shopName.weaponId].meta["FamilyName"];
    if (!familyName) return;

    switches[shopName.switchId] = shopName.prefix + familyName + shopName.suffix;
    valueMapNameSpecialStaging[shopName.mapId] = switches[shopName.switchId];
  }

  // Stages every basement floor of one tower switch.
  function applySpecialMapFloorNames(switches, floorName) {
    const towerName = switches[floorName.switchId];
    floorName.floors.forEach((floor) => {
      valueMapNameSpecialStaging[floor[0]] = `${towerName}-[${floor[1]}]`;
    });
  }

  function populateNPCInformation(
    npcInformation,
    metaKey,
    substitutionCallback
  ) {
    const weapons = $dataWeapons;
    for (let weaponId = 301; weaponId <= 400; weaponId++) {
      const weaponData = weapons[weaponId];
      if (!weaponData || weaponData.name === "") continue;
      const weaponMeta = weaponData.meta;
      if (weaponMeta.SubstitutionActorId) {
        npcInformation[weaponId - 300] = substitutionCallback(
          Number(weaponMeta.SubstitutionActorId)
        );
      }
      if (weaponMeta[metaKey])
        npcInformation[weaponId - 300] = weaponMeta[metaKey];
    }
  }

  function restorePartyHeroineOutfits(updatePortrait) {
    const variables = $gameVariables;
    const heroineIds = variables.value(247);
    if (!Array.isArray(heroineIds)) return;
    const partyMembers = new Set($gameParty.members());
    heroineIds.forEach(function (actorId) {
      const gameActor = $gameActors.actor(actorId);
      if (!gameActor || !partyMembers.has(gameActor)) return;
      const currentOutfit = variables.value(actorId + 440);
      const savedOutfit = variables.value(actorId + 540);
      if (!Array.isArray(currentOutfit) || !Array.isArray(savedOutfit)) return;
      for (let outfitIndex = 0; outfitIndex <= 42; outfitIndex++) {
        currentOutfit[outfitIndex] = savedOutfit[outfitIndex];
      }
      variables.setValue(20, actorId);
      updatePortrait(gameActor);
    });
  }

  function appendDayEndInformation(parent, messageText) {
    parent.sVal(
      539,
      $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_TEXT) + messageText
    );
    parent.sVal(
      540,
      $gameVariables.value(GAME_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1
    );
  }

  function applyNumericMetadataVariables(meta, gameVariables, assignments) {
    assignments.forEach(function (assignment) {
      const metaKey = assignment[0];
      const variableId = assignment[1];
      if (meta[metaKey])
        gameVariables.setValue(variableId, Number(meta[metaKey]));
    });
  }

  function removeStateCategoryWithMessage(
    targetActor,
    category,
    remainingCount,
    messageKind
  ) {
    if (!targetActor.isStateCategoryAffected(category)) return remainingCount;
    const affectedCount = targetActor.getStateCategoryAffectedCount(category);
    const removedCount = Math.min(affectedCount, remainingCount);
    targetActor.removeStateCategory(category, removedCount);
    const targetName = targetActor.name();
    const removedAmount = colorTaggedText(3, removedCount);
    let messageText;
    switch (messageKind) {
      case "normal":
        messageText = `${targetName}の基本状態異常を${removedAmount}個回復した！`;
        break;
      case "special":
        messageText = `${targetName}の特殊状態異常を${removedAmount}個回復した！`;
        break;
      case "powerUp":
        messageText = `${targetName}の強化状態を${removedAmount}個消去した！`;
        break;
    }
    showMessage(messageText);
    return remainingCount - removedCount;
  }

  function stateRemovalMagicBonus(sourceActor, enabled, messageKind) {
    if (!enabled) return 0;
    const bonusCount = Math.floor(sourceActor.param(4) / 300);
    if (bonusCount < 1) return 0;
    if (sourceActor.isActor()) {
      const actorName = sourceActor.name();
      const magicName = colorTaggedText(16, "Magic");
      const bonusAmount = colorTaggedText(3, "+" + bonusCount);
      const messageText =
        messageKind === "recovery"
          ? `${actorName}の${magicName}により回復数${bonusAmount}！`
          : `${actorName}の${magicName}により消去数${bonusAmount}！`;
      showMessage(messageText);
    }
    return bonusCount;
  }

  function activateDispelGuard(targetActor) {
    for (
      let guardIndex = 0;
      guardIndex < valueDispelGuardState.length;
      guardIndex++
    ) {
      if (!targetActor.isStateAffected(valueDispelGuardState[guardIndex]))
        continue;
      const targetName = targetActor.name();
      const messageText = `${targetName}のディスペル・ガード効果が発動！　強化消去を無効化した。`;
      showMessage(messageText);
      if ($gameParty.inBattle()) targetActor.startAnimation(286, true, 0);
      return true;
    }
    return false;
  }

  function findTrapEvasionItem() {
    const items = $dataItems;
    for (let itemId = 1; itemId < items.length; itemId++) {
      const itemData = items[itemId];
      if (
        !itemData ||
        !itemData.meta.trapEvasion ||
        !$gameParty.hasItem(itemData)
      )
        continue;
      return itemData;
    }
    return null;
  }

  function partyHasTrapEvasionSkill(partyMembers) {
    const evasionSkillIds = new Set();
    for (let skillId = 1; skillId < $dataSkills.length; skillId++) {
      const skillData = $dataSkills[skillId];
      if (skillData && skillData.meta.trapEvasion) evasionSkillIds.add(skillId);
    }
    // Only one battleSkillsRaw call per actor; stop as soon as protection is found.
    return partyMembers.some((gameActor) =>
      gameActor
        .battleSkillsRaw()
        .some((skillId) => evasionSkillIds.has(skillId))
    );
  }

  function showTrapEvasionAfterimage(gameActor) {
    if (!gameActor) return;
    const gameMap = $gameMap;
    const player = $gamePlayer;
    gameMap.spawnEvent(136, player._realX, player._realY, true);
    const mapEvent = gameMap.event(gameMap.getLastSpawnEventId());
    if (!mapEvent) return;
    mapEvent.setImage(gameActor.characterName(), gameActor.characterIndex());
    mapEvent.setDirection(player._direction);
    mapEvent.setPattern(1);
    mapEvent._originalPattern = 1;
    mapEvent.setOpacity(250);
    mapEvent.setBlendMode(1);
    const actorName = colorTaggedText(16, gameActor.name());
    const trapName = colorTaggedText(10, "トラップ");
    const messageText = `${actorName}は${trapName}を回避した！`;
    CommonPopupManager.showInfo({}, messageText, null);
  }

  function prepareRarityPromotion(actorId) {
    promotionMaterialItemIds = [];
    promotionMaterialQuantities = [];
    preparedPromotionActorId = 0;
    const gameActor = $gameActors.actor(actorId);
    if (!gameActor) return;
    let raritySkillId = 401;
    for (let skillId = 401; skillId <= 406; skillId++) {
      if (!gameActor.isLearnedSkill(skillId)) continue;
      raritySkillId = skillId;
      break;
    }
    valueCountSet1 = raritySkillId;
    if (raritySkillId === 401) {
      valueCountSet2 = 0;
      return;
    }
    const rankKeys = Object.keys(RANK_BY_PROMOTION_DATA);
    const rankData = rankKeys
      .map((key) => RANK_BY_PROMOTION_DATA[key])
      .find((rank) => rank.promotionValue == raritySkillId);
    if (!rankData) return;
    const promotionCodeText = rankData.promotionCode;
    valueWordSet2 = `<${promotionCodeText}>昇格`;
    valueWordSet1 = rankData.promotionCode + "promotionM"; // Metadata key, not translated.
    valueCountSet2 = rankData.cost;
    for (let itemId = 1; itemId < $dataItems.length; itemId++) {
      const itemData = $dataItems[itemId];
      if (!itemData || !itemData.meta[valueWordSet1]) continue;
      promotionMaterialItemIds.push(itemId);
      promotionMaterialQuantities.push(Number(itemData.meta[valueWordSet1]));
    }
    preparedPromotionActorId = actorId;
    showRarityPromotionRequirements();
  }

  function showRarityPromotionRequirements() {
    let messageText = `${valueWordSet2}\n`;
    for (
      let materialIndex = 0;
      materialIndex < promotionMaterialItemIds.length;
      materialIndex++
    ) {
      const itemId = promotionMaterialItemIds[materialIndex];
      const itemData = $dataItems[itemId];
      const itemName = `\x1bIIN[${itemId}]`;
      const requiredAmount = colorTaggedText(
        10,
        promotionMaterialQuantities[materialIndex]
      );
      const ownedItemCount = $gameParty.numItems(itemData);
      messageText += `${itemName}:${requiredAmount}個<${ownedItemCount}>\n`;
    }
    const requiredGold = colorTaggedText(10, valueCountSet2.toLocaleString());
    const currentGold = $gameParty.gold().toLocaleString();
    const goldIcon = "\\G";
    messageText += `${requiredGold}${goldIcon}<${currentGold}${goldIcon}>`;
    $gameScreen.setDTextPicture(messageText, 28);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(100, "", 0, 150, 100, 100, 100, 0, 0);
    $gameScreen.movePicture(100, 0, 50, 100, 100, 100, 255, 0, 60);
  }

  function canPayRarityPromotion() {
    if (!preparedPromotionActorId) return false;
    if ($gameParty.gold() < valueCountSet2) return false;
    return promotionMaterialItemIds.every(
      (itemId, materialIndex) =>
        $gameParty.numItems($dataItems[itemId]) >=
        promotionMaterialQuantities[materialIndex]
    );
  }

  function payRarityPromotionMaterials(actorId) {
    if (!canPayRarityPromotion(actorId)) return;
    promotionMaterialItemIds.forEach(function (itemId, materialIndex) {
      const itemData = $dataItems[itemId];
      const quantity = promotionMaterialQuantities[materialIndex];
      $gameParty.loseItem(itemData, quantity);
      const itemName = `\x1bIIN[${itemId}]`;
      const requiredAmount = colorTaggedText(10, quantity);
      const messageText = `${itemName}を${requiredAmount}個捧げた…`;
      TickerManager.show(messageText);
    });
    $gameParty.loseGold(valueCountSet2);
    const requiredGold = colorTaggedText(10, valueCountSet2.toLocaleString());
    const goldIcon = "\\G";
    const messageText = `${requiredGold}${goldIcon}捧げた…`;
    TickerManager.show(messageText);
    preparedPromotionActorId = 0;
  }

  function describeMealBuffEffect(effectValues) {
    const effectTypeId = Number(effectValues[0]);
    const parameterId = Number(effectValues[1]);
    const effectStrength = Number(effectValues[2]);
    let traitRate = effectStrength;
    let traitLineText = "";
    switch (effectTypeId) {
      case 0:
      case 1:
      case 2:
        traitLineText = describeMealParameterBuff(effectTypeId, parameterId, effectStrength);
        break;
      case 3:
        traitLineText = describeMealElementPowerBuff(parameterId, effectStrength);
        break;
      case 4: {
        const resistanceBuff = describeMealResistanceBuff(parameterId, effectStrength, traitRate);
        traitRate = resistanceBuff.traitRate;
        traitLineText = resistanceBuff.traitLineText;
        break;
      }
    }
    return { traitRate: traitRate, traitLineText: traitLineText };
  }

  // "Parameter +100%UP!" line of the stat buffs (types 0-2).
  function describeMealParameterBuff(effectTypeId, parameterId, effectStrength) {
    const parameterName = mealBuffParameterName(effectTypeId, parameterId);
    const amount = effectStrength * 100;
    const rateText = colorTaggedText(10, `${amount}%`);
    return parameterName + `${rateText}UP!`;
  }

  // "Element power +15%UP!" / "...DOWN!" line (type 3).
  function describeMealElementPowerBuff(parameterId, effectStrength) {
    const elementName = $dataSystem.elements[parameterId];
    const isIncrease = effectStrength >= 0;
    const changeText = isIncrease
      ? `${effectStrength}%UP!`
      : `${effectStrength}%DOWN!`;
    const rateLabel = colorTaggedText(isIncrease ? 10 : 1, changeText);
    return `${elementName}威力${rateLabel}`;
  }

  // Resistance line (type 4). Elements 10/11/12/15/20/38-41 are shown without the
  // "耐性" suffix and keep their sign; the others store the rate negated.
  function describeMealResistanceBuff(parameterId, effectStrength, traitRate) {
    const elementName = $dataSystem.elements[parameterId];
    const useDirectRate = MEAL_DIRECT_RATE_ELEMENTS.indexOf(parameterId) >= 0;
    const isIncrease = useDirectRate ? traitRate >= 0 : !(traitRate <= 0);
    let traitLineText = `${elementName}`;
    if (!useDirectRate) {
      traitLineText += "耐性";
      if (traitRate <= 0) traitRate = traitRate - traitRate - traitRate;
    }
    const amount = effectStrength * (parameterId === 11 ? 10 : 100);
    const rateText = colorTaggedText(isIncrease ? 10 : 1, `${amount}%`);
    traitLineText += isIncrease ? `${rateText}UP!` : `${rateText}DOWN!`;
    return { traitRate: traitRate, traitLineText: traitLineText };
  }

  // Elements whose resistance is displayed with its own sign instead of the suffix.
  const MEAL_DIRECT_RATE_ELEMENTS = [10, 11, 12, 15, 20, 38, 39, 40, 41];

  function applyMealBuffEffect(stateData, effectValues, traitRate) {
    const effectTypeId = Number(effectValues[0]);
    const effectParameterId = Number(effectValues[1]);
    const effectStrength = Number(effectValues[2]);

    switch (effectTypeId) {
      case 0:
      case 1:
      case 2: {
        const parameterTrait = MEAL_BUFF_PARAMETER_TRAITS[effectTypeId];
        const traitValue = parameterTrait.addsBase ? 1 + traitRate : traitRate;
        stateData.traits.push({
          code: parameterTrait.code,
          dataId: effectParameterId,
          value: traitValue
        });
        break;
      }
      case 3:
        $gameParty.members().forEach(function (partyMember) {
          valueAttackAmplifysActorId[partyMember.actorId()][
            effectParameterId
          ] += effectStrength;
        });
        break;
      case 4:
        // The resistance trait stores the negated rate (x - x - x is the original -x).
        const negatedRate = traitRate - traitRate - traitRate;
        stateData.traits.push({
          code: 11,
          dataId: effectParameterId,
          value: 1 + negatedRate
        });
        break;
    }
  }

  // Trait code written by the parameter buffs (types 0-2) and whether they add the
  // base value 1 on top of the rate.
  const MEAL_BUFF_PARAMETER_TRAITS = {
    0: { code: 21, addsBase: true },
    1: { code: 22, addsBase: false },
    2: { code: 23, addsBase: true }
  };

  function configureFaithBuff(stateId) {
    const stateData = $dataStates[stateId];
    stateData.traits = [];
    const traitRate = $gameVariables.value(GAME_VARIABLE.FAITH_TOTAL) / 100000;
    for (var i = 2; i <= 7; i++) {
      stateData.traits.push({ code: 21, dataId: i, value: 1 + traitRate });
    }
    if (!stateData.meta["Help Description"]) return;

    if (stateData.meta["AddDWord"]) {
      var traitText = `${stateData.meta["AddDWord"]}`;
    } else {
      var traitText = " ";
    }
    stateData.description = `\\sim[${stateId}]:${traitText}\n\\I[659]+${traitRate * 100}%`;
  }

  function configureMealBuff(stateId) {
    const stateData = $dataStates[stateId];
    stateData.traits = [];
    const effectEntries = $gameVariables.value(GAME_VARIABLE.MEAL_BUFF_EFFECTS);
    let traitLineCount = 0;
    let descBuilder = "";
    if (effectEntries.length >= 1) {
      for (var i = 0; i <= effectEntries.length - 1; i++) {
        var effectValues = effectEntries[i];
        if (!Array.isArray(effectValues)) continue;
        var traitRate = Number(effectValues[2]);
        var traitLineText = "";
        const effectDescription = describeMealBuffEffect(effectValues);
        traitRate = effectDescription.traitRate;
        traitLineText = effectDescription.traitLineText;
        applyMealBuffEffect(stateData, effectValues, traitRate);
        descBuilder += `[${traitLineText}] `;
        traitLineCount += 1;
        if (traitLineCount % 5 == 0) {
          descBuilder += "\n";
        }
      }
      const effectNote = "時間経過で解除。";
      stateData.description = `\\sim[${stateId}]:${effectNote}\n${descBuilder}`;
    }
  }

  function numericCaseValue(value) {
    // Numeric loose comparisons previously accepted booleans/numeric strings, but not null.
    return value == null ? value : Number(value);
  }

  function copyEnemySpawnData(sourceEnemy) {
    const enemyData = Object.assign({}, sourceEnemy);
    enemyData.actions = (sourceEnemy.actions || []).map((action) =>
      Object.assign({}, action)
    );
    while (enemyData.actions.length < 4) enemyData.actions.push({ skillId: 0 });
    return enemyData;
  }

  function takeRandomSpawnOffset(offsets) {
    // Keep one RNG draw even for an exhausted offset pool, matching existing spawn order.
    const index = getRandomIndex(offsets.length);
    return offsets.splice(index, 1)[0];
  }

  function configureBossGuaranteedDrops(bossMeta) {
    const guaranteedDrops = $gameVariables.value(
      GAME_VARIABLE.BOSS_GUARANTEED_DROPS
    );
    if (!bossMeta["BossConfirmDrop"]) return;

    const guaranteedDropValues = bossMeta["BossConfirmDrop"].split(",");
    for (var i = 0; i <= 9; i++) {
      guaranteedDrops[i] = Number(guaranteedDropValues[i]);
    }
  }

  function configureBossActionData(
    bossEnemyData,
    bossMeta,
    bossEnemyValues,
    bossActionValues,
    bossSpecialActionValues
  ) {
    bossEnemyData.name = bossEnemyValues[1];
    if (!bossMeta["Sideview Battler"]) {
      bossEnemyData.battlerName = String(bossEnemyValues[2]);
    }
    bossEnemyData.battlerHue = Number(bossEnemyValues[3]);
    const actions = bossEnemyData.actions;
    for (let actionIndex = 0; actionIndex < 4; actionIndex++) {
      actions[actionIndex].skillId = actionIndex === 0 ? 900 : 0;
      bossActionValues[actionIndex] = Number(bossEnemyValues[4 + actionIndex]);
    }
    assignBossAlternateActions(
      bossActionValues,
      4,
      bossMeta.BossAddAttack,
      bossActionValues[0]
    );
    assignBossAlternateActions(
      bossActionValues,
      7,
      bossMeta.BossAddSkill,
      bossActionValues[1]
    );
    for (let actionIndex = 1; actionIndex <= 15; actionIndex++) {
      const specialActionMetadata = bossMeta["BossSpecialAction" + actionIndex];
      if (!specialActionMetadata) continue;

      const actionRow = [0, 0, 0];
      bossSpecialActionValues[actionIndex] = actionRow;
      const specialActionValues = specialActionMetadata.split(",");
      for (let fieldIndex = 0; fieldIndex < 3; fieldIndex++)
        actionRow[fieldIndex] = Number(specialActionValues[fieldIndex]);
    }
  }

  function configureBossActionDisplay(
    bossConfigId,
    bossActionValues,
    bossSpecialActionValues
  ) {
    $gameVariables.setValue(GAME_VARIABLE.BOSS_ENEMY_STATES, []);
    const addedStateIds = $gameVariables.value(GAME_VARIABLE.BOSS_ENEMY_STATES);
    const displayedSkillIds = collectBossDisplayedSkillIds(
      bossActionValues,
      bossSpecialActionValues,
      wasBossAlreadyDefeated(bossConfigId)
    );

    displayedSkillIds.forEach(function (skillId, displayIndex) {
      applyBossActionState(addedStateIds, skillId, displayIndex);
    });
  }

  // Skills the boss may use: its normal list, plus the special actions once it was met.
  function collectBossDisplayedSkillIds(bossActionValues, bossSpecialActionValues, wasDefeated) {
    const normalSkillIds = bossActionValues
      .slice(0, BOSS_NORMAL_ACTION_COUNT)
      .filter((skillId) => skillId >= 1);
    if (!wasDefeated) return normalSkillIds;

    const specialSkillIds = [];
    for (let actionIndex = 1; actionIndex <= BOSS_SPECIAL_ACTION_COUNT; actionIndex++) {
      const actionValues = bossSpecialActionValues[actionIndex];
      if (actionValues && actionValues[2] >= 1)
        specialSkillIds.push(actionValues[2]);
    }
    return Array.from(new Set(normalSkillIds.concat(specialSkillIds)));
  }

  // Whether this boss was already defeated in this dungeon (config 1) or anywhere (config 2).
  function wasBossAlreadyDefeated(bossConfigId) {
    switch (numericCaseValue(bossConfigId)) {
      case 1:
        return (
          $gameVariables.value(GAME_VARIABLE.DUNGEON_BOSS_DEFEAT_COUNTS)[
            $gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID)
          ] >= 1
        );
      case 2:
        return $gameVariables.value(GAME_VARIABLE.BOSS_DEFEATED_ARRAY)[valueBossEnemyId] >= 1;
    }
    return false;
  }

  // Copies one skill into the display state 750+index used by the boss action window.
  function applyBossActionState(addedStateIds, skillId, displayIndex) {
    const skillData = $dataSkills[skillId];
    const stateId = BOSS_ACTION_STATE_BASE + displayIndex;
    const stateData = $dataStates[stateId];
    if (!skillData || !stateData) return;

    stateData.iconIndex = skillData.iconIndex;
    const skillName = skillData.name;
    stateData.name = `[行動]${skillName}`;
    stateData.description = skillData.description;
    addedStateIds.push(stateId);
  }

  // Display states start at 750; the action lists of a boss hold 10 normal and 15 special slots.
  const BOSS_ACTION_STATE_BASE = 750;
  const BOSS_NORMAL_ACTION_COUNT = 10;
  const BOSS_SPECIAL_ACTION_COUNT = 15;

  function configureBossTroop(bossMeta, bossEnemyData, bossEnemyValues) {
    const troopSetting = bossMeta.BossTroop;
    if (!troopSetting) return;
    const troopValues = troopSetting.split(",");
    const troopId = Number(troopValues[0]);
    valueTroopId = troopId;
    const troop = $dataTroops[troopId];
    const originalLeader = troop.members[0];
    let previousSpawnX = originalLeader.x;
    const bossMember = {
      enemyId: valueBossEnemiesId,
      x: previousSpawnX,
      y: originalLeader.y,
      hidden: false
    };
    troop.members = [];
    const troopMembers = troop.members;
    troop.name = bossEnemyData.name;
    troopMembers.push(bossMember);
    if (Number(troopValues[1]) !== 0) bossMember.x -= 150;
    if (bossMeta["Sideview Battler"]) bossMember.y -= 50;
    if (bossMeta.cloneShadow1)
      previousSpawnX = appendBossShadowMembers(troopMembers, bossEnemyValues);
    appendBossEntourageMembers(troopMembers, bossMeta, previousSpawnX);
  }

  function applyBossInformationStates(bossMeta, bossEnemyData) {
    const bossEnemyValues = bossMeta["BossStateInformation"]
      ? bossMeta["BossStateInformation"].split(",")
      : []; //
    const addedStateIds = $gameVariables.value(GAME_VARIABLE.BOSS_ENEMY_STATES);
    for (const stateValue of bossEnemyValues) {
      const stateId = Number(stateValue);
      if (!(stateId >= 1)) continue;
      const stateData = $dataStates[stateId];
      const bgmMetadata = stateData && stateData.meta.valueBossBgm;
      if (bgmMetadata) {
        const bgmValues = bgmMetadata.split(",");
        $gameVariables.setValue(GAME_VARIABLE.BOSS_BGM_TABLE, [
          bgmValues[0],
          Number(bgmValues[1]),
          Number(bgmValues[2]),
          Number(bgmValues[3])
        ]);
      }
      addedStateIds.push(stateId);
    }
    appendEnemyNameConditionStates(bossEnemyData, addedStateIds);
  }

  function appendEnemyNameConditionStates(enemyData, targetStateIds) {
    valueEnemyAddState.forEach(function (stateId) {
      const stateData = $dataStates[stateId];
      if (!stateData) return;
      const meta = stateData.meta;
      if (meta.NameCondiAddState) {
        meta.NameCondiAddState.split(",").forEach(function (namePattern) {
          if (!enemyData.name.match(namePattern)) return;
          if (meta.battlerHue1) enemyData.battlerHue = Number(meta.battlerHue1);
          targetStateIds.push(stateId);
        });
      }
      if (!meta.GraphicNameCondiAddState) return;
      meta.GraphicNameCondiAddState.split(",").forEach(function (namePattern) {
        if (enemyData.battlerName.match(namePattern))
          targetStateIds.push(stateId);
      });
    });
  }

  function configureMapEnemySpawnData(enemyData, spawnValues) {
    enemyData.name = spawnValues[1];
    enemyData.battlerName = spawnValues[2];
    Galv.CACHE.load("sv_enemies", spawnValues[2]);
    enemyData.battlerHue = Number(spawnValues[3]);
    for (let actionIndex = 0; actionIndex < 4; actionIndex++) {
      enemyData.actions[actionIndex].skillId = Number(
        spawnValues[4 + actionIndex]
      );
    }
  }

  function chooseActorProfession(actorMeta, defaultProfession) {
    let newProfession = defaultProfession;
    // Check all possible profession alternatives (up to 9)
    for (let i = 1; i <= 9; i++) {
      const professionMetaKey = "Profession" + i;

      if (!actorMeta[professionMetaKey]) continue;

      const professionChoice = readProfessionChoice(actorMeta[professionMetaKey]);
      if (isProfessionChoiceMet(professionChoice)) {
        newProfession = professionChoice.name;
        continue;
      }
    }

    return newProfession;
  }

  // "name,switchId,variableId,requiredValue,itemId" -> one profession alternative.
  function readProfessionChoice(professionMetaValue) {
    const professionData = professionMetaValue.split(",");
    return {
      name: professionData[0],
      switchId: Number(professionData[1]),
      variableId: Number(professionData[2]),
      requiredValue: Number(professionData[3]),
      requiredItemId: Number(professionData[4])
    };
  }

  // A profession applies when its switch is on, its variable reached the value or the
  // party holds the item; the first matching condition already decides.
  function isProfessionChoiceMet(professionChoice) {
    if (professionChoice.switchId >= 1 && $gameSwitches.value(professionChoice.switchId)) {
      return true;
    }
    if (
      professionChoice.variableId >= 1 &&
      $gameVariables.value(professionChoice.variableId) >= professionChoice.requiredValue
    ) {
      return true;
    }
    if (
      professionChoice.requiredItemId >= 1 &&
      $gameParty.hasItem($dataItems[professionChoice.requiredItemId], true)
    ) {
      return true;
    }
    return false;
  }

  function drawPagedListTextWindow(windowY, windowHeight) {
    WindowManager.show(1, 0, windowY, 1280, windowHeight);
    const pageText = window["valueWordSet" + valueCountSet3];
    const messageFont = "\\fs[28]";
    WindowManager.drawText(1, messageFont + pageText);
    valueCountSet3 += 1;
  }
  function applyRaritySkillTransition(gameActor, rankData) {
    rankData.forgetSkillIds.forEach((skillId) =>
      gameActor.forgetSkill(skillId)
    );
    rankData.learnSkillIds.forEach((skillId) => gameActor.learnSkill(skillId));
  }

  function initializeMapWeaponNames(switches) {
    const weapons = $dataWeapons;
    for (let weaponId = 1; weaponId < weapons.length; weaponId++) {
      const weaponData = weapons[weaponId];
      if (!weaponData || weaponData.name === "" || !weaponData.meta.MapSwitch)
        continue;
      weaponData.name = String(switches[Number(weaponData.meta.MapSwitch)]);
    }
  }
  function startupReferencedName(sourceTypeId, entryId, switches) {
    let database;
    switch (sourceTypeId) {
      case 0:
        database = $dataItems;
        break;
      case 1:
        database = $dataWeapons;
        break;
      case 2:
        database = $dataArmors;
        break;
      case 3:
      case 5:
        database = $dataStates;
        break;
      case 4:
        database = $dataSkills;
        break;
      case 6:
        return switches[entryId];
      default:
        return undefined;
    }
    const entryData = database[entryId];
    return entryData ? entryData.name : undefined;
  }
  function applyStartupItemNameMetadata(itemData, switches) {
    const meta = itemData.meta;
    if (meta.ItemNameAddSet) {
      const nameSettings = meta.ItemNameAddSet.split(",");
      const referenceName = startupReferencedName(
        Number(nameSettings[0]),
        Number(nameSettings[1]),
        switches
      );
      if (referenceName !== undefined) {
        itemData.name =
          Number(nameSettings[2]) === 0
            ? referenceName + itemData.name
            : itemData.name + referenceName;
      }
    }
    if (meta.annihilationTitle) {
      const targetItemId = Number(meta.annihilationTitle.split(",")[0]);
      const targetItem = $dataItems[targetItemId];
      if (targetItemId >= 20 && targetItem) {
        const targetName = targetItem.name;
        itemData.name = `${targetName}を殲滅せし者`;
      }
    }
    if (meta.MapSwitch)
      itemData.name = String(switches[Number(meta.MapSwitch)]);
  }
  function numberCommonEventItem(
    itemData,
    itemId,
    sequenceNumber,
    rangeOffset
  ) {
    const commonEvent = $dataCommonEvents[itemId];
    if (
      itemData.meta["追加コモンID"] ||
      (itemId >= 401 + rangeOffset && itemId <= 500 + rangeOffset)
    ) {
      if (commonEvent) itemData.name = commonEvent.name;
      return;
    }
    itemData.name = "[" + sequenceNumber + "]" + itemData.name;
  }
  function copyCompletedQuestItem(itemData, itemId, sequenceNumber, offset) {
    itemData.name = "[" + sequenceNumber + "]" + itemData.name;
    const completedItem = $dataItems[itemId + offset];
    if (!completedItem) return;
    completedItem.iconIndex = itemData.iconIndex;
    const itemName = itemData.name;
    completedItem.name = `${itemName}[了]`;
    completedItem.description = itemData.description;
  }
  function applyStartupItemNumbering(
    itemData,
    itemId,
    numbering,
    achieverActorIds
  ) {
    const meta = itemData.meta;
    if (!meta.EICSwitch) return;
    switch (Number(meta.EICSwitch)) {
      case 102:
      case 103: {
        const eventItemRule = EVENT_ITEM_NUMBERING_RULES[Number(meta.EICSwitch)];
        const eventNumber = numbering[eventItemRule.counter]++;
        numberCommonEventItem(itemData, itemId, eventNumber, eventItemRule.baseNumber);
        break;
      }
      case 104:
      case 105:
        itemData.description =
          "[" + numbering.title++ + "]" + itemData.description;
        appendPersonalTitleAchiever(itemData, itemId, achieverActorIds);
        break;
      case 108: {
        const questRule = QUEST_ITEM_NUMBERING_RULES[meta["SGカテゴリ"]];
        if (!questRule) break;
        const questNumber = numbering[questRule.counter]++;
        copyCompletedQuestItem(itemData, itemId, questNumber, questRule.baseNumber);
        break;
      }
    }
  }

  // Episode / scene items: which counter of <numbering> advances and the number the
  // first entry gets.
  const EVENT_ITEM_NUMBERING_RULES = {
    102: { counter: "episode", baseNumber: 0 },
    103: { counter: "scene", baseNumber: 100 }
  };

  // Quest items of category 108: the two order categories share one counter, the daily
  // quests have their own with a different start.
  const QUEST_ITEM_NUMBERING_RULES = {
    "受注クエスト": { counter: "quest", baseNumber: 100 },
    "ＥＸ受注クエスト": { counter: "quest", baseNumber: 100 },
    "デイリークエスト": { counter: "dailyQuest", baseNumber: 50 }
  };
  function appendPersonalTitleAchiever(itemData, itemId, achieverActorIds) {
    if (!itemData.meta.KojinTitle || !Array.isArray(achieverActorIds)) return;
    const achieverActorId = achieverActorIds[itemId];
    if (!(achieverActorId >= 1)) return;
    const gameActor = $gameActors.actor(achieverActorId);
    if (!gameActor) return;
    const achieverName = gameActor.name();
    itemData.description += `[達成者:${achieverName}]`;
  }
  function resetSystemEntriesByName(
    firstSwitchId,
    firstVariableId,
    shouldReset
  ) {
    const switchNames = $dataSystem.switches;
    const variableNames = $dataSystem.variables;
    for (
      let switchId = firstSwitchId;
      switchId < switchNames.length;
      switchId++
    ) {
      const switchName = switchNames[switchId];
      if (typeof switchName === "string" && shouldReset(switchName))
        $gameSwitches.setValue(switchId, false);
    }
    for (
      let variableId = firstVariableId;
      variableId < variableNames.length;
      variableId++
    ) {
      const variableName = variableNames[variableId];
      if (typeof variableName === "string" && shouldReset(variableName))
        $gameVariables.setValue(variableId, 0);
    }
  }
  function deployedActorsForReset() {
    const firstActorId = $gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = $gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    const actors = [];
    if (
      !Number.isInteger(firstActorId) ||
      !Number.isInteger(lastActorId) ||
      firstActorId < 1
    )
      return actors;
    for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
      const gameActor = $gameActors.actor(actorId);
      if (gameActor) actors.push(gameActor);
    }
    return actors;
  }
  function resetActorFactors(metaKey, actors) {
    const skills = $dataSkills;
    const states = $dataStates;
    for (let skillId = 1; skillId < skills.length; skillId++) {
      const skillData = skills[skillId];
      if (!skillData || !skillData.meta[metaKey]) continue;
      actors.forEach(function (gameActor) {
        if (!gameActor.isLearnedSkill(skillId)) return;
        if (skillData.meta["Max Mastery Level"])
          gameActor.setSkillMasteryLevel(skillId, 0);
        gameActor.forgetSkill(skillId);
      });
    }
    for (let stateId = 1; stateId < states.length; stateId++) {
      const stateData = states[stateId];
      if (!stateData || !stateData.meta[metaKey]) continue;
      actors.forEach(function (gameActor) {
        if (gameActor.isStateAffected(stateId)) gameActor.removeState(stateId);
      });
    }
  }
  function removeDatabaseItemsByMetadata(
    database,
    metaKeys,
    amount,
    lastEntryId
  ) {
    const lastId =
      lastEntryId === undefined
        ? database.length - 1
        : Math.min(lastEntryId, database.length - 1);
    for (let entryId = 1; entryId <= lastId; entryId++) {
      const entryData = database[entryId];
      if (!entryData) continue;
      // Checks are intentionally cumulative: two matching flags still produce two calls.
      metaKeys.forEach(function (metaKey) {
        if (entryData.meta[metaKey]) $gameParty.gainItem(entryData, amount);
      });
    }
  }
  function resetFactorData(metaKey, includeDungeonInformation) {
    resetActorFactors(metaKey, deployedActorsForReset());
    const itemMetaKeys = includeDungeonInformation
      ? ["DungeonInformation", metaKey]
      : [metaKey];
    removeDatabaseItemsByMetadata($dataItems, itemMetaKeys, -9999);
    removeDatabaseItemsByMetadata($dataWeapons, [metaKey], -9999);
    const lastArmorId =
      typeof valueArmorsLength === "number"
        ? valueArmorsLength
        : $dataArmors.length - 1;
    removeDatabaseItemsByMetadata($dataArmors, [metaKey], -9999, lastArmorId);
  }
  function removeInventoryItemsByMetaValue(metaKey, requiredValue) {
    const items = $dataItems;
    for (let itemId = 1; itemId < items.length; itemId++) {
      const itemData = items[itemId];
      if (
        !itemData ||
        !itemData.meta[metaKey] ||
        Number(itemData.meta[metaKey]) !== requiredValue
      )
        continue;
      $gameParty.gainItem(itemData, -1);
    }
  }
  function buildBattleHeroineStatus(battleMembers) {
    let text = "";
    let rowCount = 0;
    battleMembers.forEach(function (gameActor) {
      if (!isGirl(gameActor)) return;
      const actorId = gameActor.actorId();
      const actorRecords = $gameVariables.value(actorId + 380);
      const statusCount = actorRecords && actorRecords[2];
      if (!(statusCount >= 1)) return;
      if (rowCount === 0) text += "\\I[376] ";
      const actorData = $dataActors[actorId];
      const iconIndex = actorData && actorData.meta.IconGura;
      const actorLabel = iconIndex ? buildIconMarker(iconIndex) : gameActor.name();
      text += actorLabel + statusCount + " ";
      rowCount++;
    });
    if (rowCount) text += "\n";
    return { text: text, rowCount: rowCount };
  }
  // Icon escape marker ("\x1bI[n]") shared by the record windows.
  function buildIconMarker(iconIndex) {
    const iconCode = Number(iconIndex);
    return ICON_MARKER_PREFIX + iconCode + ICON_MARKER_SUFFIX;
  }

  function buildEnemyStateIconRows(enemies) {
    const uniqueStateIds = new Set();
    enemies.forEach(function (enemy) {
      enemy._states.forEach((stateId) => uniqueStateIds.add(stateId));
    });
    let text = "";
    let iconCount = 0;
    uniqueStateIds.forEach(function (stateId) {
      const stateData = $dataStates[stateId];
      if (!stateData || !(stateData.iconIndex >= 1) || stateData.name === "")
        return;
      text += buildIconMarker(stateData.iconIndex);
      iconCount++;
      if (iconCount % 9 === 0) text += "\n";
    });
    return { text: text, rowCount: Math.floor(iconCount / 9) };
  }
  function refundClothingRepairItem(sourceEntry, itemsToReturn) {
    if (itemsToReturn == 1 && sourceEntry) $gameParty.gainItem(sourceEntry, 1);
  }

  function initializeCoreGameRecordArrays(
    gameVariables,
    firstHeroineId,
    lastHeroineId
  ) {
    //各アクターの装備スキル配列記憶用
    gameVariables.setValue(
      GAME_VARIABLE.LEARNED_SKILL_ARRAYS,
      Array.from({ length: 21 }, () => [])
    );
    //各ステート毎の討伐数設定。主に種族対象,1が当日魔物討伐数,2が総魔物討伐数
    gameVariables.setValue(52, Array(1001).fill(0));
    //Tipsタイトルと内容配列。
    gameVariables.setValue(532, []);
    gameVariables.setValue(533, []);
    gameVariables.setValue(534, []);
    //イベントのプレイヤーの位置記憶。
    gameVariables.setValue(163, Array(1001).fill(0));
    //個別リセットフラグonoff
    gameVariables.setValue(183, [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]); //10
    //各キャラの性欲度初期配列↓
    initializeGameVariableArrays(gameVariables, 381, 400, 101);
    //0は性欲度上限。41は初体験相手,42,43,44,45は妊娠時サイズ増加。妊娠時に計測。
    //46に直前のHｼｰﾝﾋﾟｸﾁｬ,49に初出産相手。50は苗字、51,52,53,54,55は身長体重スリーサイズ
    //56がカップ数,58はポーション耐性59は役職
    //61は当日Ｈ回数、62は当日Ｈ回数10以上の時に記録。
    //63は性欲薬使用回数(代入する)、64は日数経過時に性欲499で61が0の時。
    //65は当日獲得経験値
    //66リザルト67ｵｰﾊﾞｰｷﾙ68会心
    //71当日強姦回数、翌日凌辱事後付与。リセットはｺﾓﾝ24で個別で実行

    //46に直前のHｼｰﾝﾋﾟｸﾁｬ
    for (let actorId = firstHeroineId; actorId <= lastHeroineId; actorId++) {
      gameVariables.value(actorId + 380)[46] = 0;
    }

    //各キャラの衣装初期配列↓
    initializeGameVariableArrays(gameVariables, 441, 460, 43);
    initializeGameVariableArrays(gameVariables, 541, 560, 43);
    //計43。0は統合時のアイテムID。41は会話立ち絵用衣装指定変数代入用(TotalCloth)
    //42は露出超過回数

    //NPCのキャラごとＨ回数。
    initializeGameVariableArrays(gameVariables, 361, 380, 301);
    //計301.対応する相手とのH回数。101～200は受精した状態で1。
    //201～300は子供の数。301～400は現在の役職名。0は使用しない。
  }

  function initializeDungeonRecordArrays(gameVariables) {
    //召喚石強化配列
    gameVariables.setValue(352, Array(51).fill(0));
    //ダンジョン情報配列//計55.
    gameVariables.setValue(218, Array(55).fill(0));
    gameVariables.setValue(219, Array(55).fill("？？？"));
    gameVariables.setValue(213, Array(55).fill("？？？"));
    //特殊ボス討伐情報配列。情報確認用なのでリセットしない
    gameVariables.setValue(304, Array(201).fill(0));
    //ダンジョンボス討伐情報配列。情報確認用なのでリセットしない
    gameVariables.setValue(305, Array(101).fill(0));
    //宝箱の中身と種類
    gameVariables.setValue(212, Array(101).fill(0)); //<TchestOnly:1,1,1,2,21>レア宝箱用
    gameVariables.setValue(215, Array(101).fill(0));
    gameVariables.setValue(216, Array(101).fill(0));
    //ダンジョンワープ魔方陣指定
    gameVariables.setValue(
      GAME_VARIABLE.DUNGEON_WARP_POINTS,
      Array(101).fill(0)
    );
    initializeVariableRows(
      gameVariables.value(GAME_VARIABLE.DUNGEON_WARP_POINTS),
      0,
      100,
      11,
      0
    );
  }

  function initializeActorProgressArrays(gameVariables) {
    //監禁時にアクターの記憶配列。２次配列で記憶させる。0レアリティ1-10装備
    gameVariables.setValue(
      GAME_VARIABLE.CONFINED_ACTOR_RECORDS,
      Array(21).fill(0)
    );
    //収集アイテム表示用配列
    gameVariables.setValue(284, [0, 0, 0, 0, 0]);
    //簡易Hステ表示用配列
    gameVariables.setValue(283, [0, 0, 0, 0, 0]);
    //タイトル設定したIDの配列
    gameVariables.setValue(288, Array(21).fill(0));
    gameVariables.setValue(294, Array(21).fill(0));
    //くるりんドロップ動作用配列
    gameVariables.setValue(160, Array(11).fill(0));
    //各キャラ専用武器パラメータ配列//8番目は通常攻撃決定数値。9番目は奥義。10番目は強化段階
    //gameVariables.setValue(287,Array(21).fill(0));
    let weaponParameterRows = gameVariables.value(
      GAME_VARIABLE.ACTOR_WEAPON_PARAMETERS
    );
    if (!Array.isArray(weaponParameterRows)) {
      gameVariables.setValue(
        GAME_VARIABLE.ACTOR_WEAPON_PARAMETERS,
        Array(22).fill(0)
      );
      weaponParameterRows = gameVariables.value(
        GAME_VARIABLE.ACTOR_WEAPON_PARAMETERS
      );
    }
    initializeVariableRows(weaponParameterRows, 0, 21, 11, 21);
    //マスターノート入手用配列↓21まで。1から始める//計20.
    gameVariables.setValue(249, Array(20).fill(0));
    //訓練人形事前設定配列
    gameVariables.setValue(
      GAME_VARIABLE.TRAINING_DOLL_PRESET,
      Array(31).fill(1)
    ); //11から-10のｱｸﾀｰのその訓練時のトータルダメージ
    //10にターン数
    const trainingDollSettings = gameVariables.value(
      GAME_VARIABLE.TRAINING_DOLL_PRESET
    );
    trainingDollSettings[3] = 100;
    trainingDollSettings[4] = 100;
    trainingDollSettings[6] = 0; //種族指定
    //街ごと賞金額
    gameVariables.setValue(501, Array(101).fill(0));
  }

  function beginRegisteredEventScene(sceneParamValue, eventItemId) {
    rememberPreviousTimeSwitch();
    applySceneWeatherSwitch();

    // Outside battle the player walks through the scene unseen.
    const isInBattle = $gameParty.inBattle();
    if (!isInBattle) {
      $gamePlayer.setThrough(true);
      $gamePlayer.setStealthMode(true);
    }

    publishSceneRegistrationConditions(eventItemId);

    //$gamePlayer.setTransparent(true);//効果なし。コモンで実行
    $gameSwitches.setValue(GAME_SWITCH.NPC_VANISHED, true); //NPC消滅スイッチon
    $gameSwitches.setValue(GAME_SWITCH.EVENT_PROGRESS_BLOCKER, true);
    $gameSwitches.setValue(GAME_SWITCH.EVENT_PROGRESS_ACTIVE, true);
    $gameVariables.setValue(GAME_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    $gameVariables.setValue(GAME_VARIABLE.EVENT_SUBJECT_ACTOR_ID, sceneParamValue);
    //$gameSwitches.setValue(71,true);//ﾌﾟﾚｲﾔ移動禁止未使用
    if (!isInBattle) {
      $gameTemp.stopMapPlayerMovement();
    }
  }

  // Time of day switches 13-15; the last one that is on is remembered for the end of the scene.
  function rememberPreviousTimeSwitch() {
    if ($gameVariables.value(GAME_VARIABLE.SCENE_PREVIOUS_TIME_SWITCH_ID) != 0) return;

    for (var i = SCENE_TIME_SWITCH_FIRST; i <= SCENE_TIME_SWITCH_LAST; i++) {
      if ($gameSwitches.value(i)) {
        $gameVariables.setValue(
          GAME_VARIABLE.SCENE_PREVIOUS_TIME_SWITCH_ID,
          i
        );
      }
    }
  }

  // Scene time switches that rememberPreviousTimeSwitch() scans.
  const SCENE_TIME_SWITCH_FIRST = 13;
  const SCENE_TIME_SWITCH_LAST = 15;

  // The scene sets its own time of day; the three default switches are cleared first.
  function applySceneWeatherSwitch() {
    if (valueWeatherSceneSet == 0) return;

    $gameSwitches.setValue(GAME_SWITCH.MORNING, false);
    $gameSwitches.setValue(GAME_SWITCH.DAYTIME, false);
    $gameSwitches.setValue(GAME_SWITCH.NIGHT, false);
    $gameSwitches.setValue(valueWeatherSceneSet, true);
  }

  // Conditions the event code evaluates later; a recollection keeps them all true.
  function publishSceneRegistrationConditions(eventItemId) {
    if (eventItemId < 1) return;

    if ($gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP)) {
      valueSceneConditions1 = true;
      valueSceneConditions2 = true;
      valueSceneConditions3 = true;
      return;
    }

    const eventItemMeta = $dataItems[eventItemId].meta;
    if (eventItemMeta["RegistrationC1"]) {
      valueSceneConditions1 = eventItemMeta["RegistrationC1"];
    }
    if (eventItemMeta["RegistrationC2"]) {
      valueSceneConditions2 = eventItemMeta["RegistrationC2"];
    }
    if (eventItemMeta["RegistrationC3"]) {
      valueSceneConditions3 = eventItemMeta["RegistrationC3"];
    }
  }

  function finishRegisteredEventScene(selectionSwitchId) {
    restoreRegisteredSceneTime();

    // The same battle check is used three times; it cannot change during the call.
    const isInBattle = $gameParty.inBattle();
    if (!isInBattle) {
      $gamePlayer.setThrough(false);
      $gamePlayer.setStealthMode(false);
    }
    $gameSwitches.setValue(GAME_SWITCH.EVENT_PROGRESS_ACTIVE, false); //イベント進行時onoff
    $gameSwitches.setValue(GAME_SWITCH.MAP_WEATHER_IGNORED, false);
    $gameSwitches.setValue(GAME_SWITCH.SCENE_CONTINUE_SELECTED, false); //選択肢でシーン達成なし続行
    if (!isInBattle) {
      $gameTemp.allowMapPlayerMovement();
      $gameTemp.allowMapEventMovement();
    }
    $gameSwitches.setValue(GAME_SWITCH.NPC_VANISHED, false); //NPC消滅スイッチoff
    $gameSwitches.setValue(GAME_SWITCH.PASSERBY_VANISHED, false); //通行人消滅スイッチoff。任意
    eraseRegisteredSceneEvents();
    resetSceneConditions();
    clearEpisodeSceneFlags();
    if (!isInBattle) {
      drowsepost.camera.zoom(1, 60, $gamePlayer);
    }
    if (selectionSwitchId >= 2) {
      valueCountSet2 = selectionSwitchId;
      //$gameSwitches.setValue(selectionSwitchId,false);
    }
  }

  // Resets the scene globals shared by every event scene.
  function resetSceneConditions() {
    valueWeatherSceneSet = 0;
    valueSceneConditions1 = true;
    valueSceneConditions2 = true;
    valueSceneConditions3 = true;
    $gameVariables.setValue(GAME_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    $gameVariables.setValue(GAME_VARIABLE.EVENT_SUBJECT_ACTOR_ID, 0);
    $gameVariables.setValue(GAME_VARIABLE.EVENT_PROGRESS, 0);
  }

  // A recorded scene becomes visible again and drops the episode / H scene flags.
  function clearEpisodeSceneFlags() {
    if ($gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP)) return;

    $gamePlayer.setTransparent(false);
    if ($gameSwitches.value(GAME_SWITCH.EPISODE_AUTO_GENERATED)) {
      //挿話
      $gameSwitches.setValue(GAME_SWITCH.EPISODE_AUTO_GENERATED, false);
    }
    if ($gameSwitches.value(GAME_SWITCH.H_SCENE_PARALLEL)) {
      //Ｈ
      $gameSwitches.setValue(GAME_SWITCH.H_SCENE_PARALLEL, false);
    }
  }

    // Feeds the four per-actor best values of one actor into their leader records.
  function updateTitleActorRecords(actorRecords, actor, actorRecordId) {
    const recordValues = $gameVariables.value(GAME_VARIABLE.ACTOR_RECORD_BASE + actorRecordId);
    updateTitleAchievementLeader(
      actorRecords.criticalHitRecord,
      actorRecordId,
      recordValues[68]
    );
    updateTitleAchievementLeader(
      actorRecords.maxDamageDealtRecord,
      actorRecordId,
      actor.attackDamageMax
    );
    updateTitleAchievementLeader(
      actorRecords.maxDamageTakenRecord,
      actorRecordId,
      actor.acceptDamageMax
    );
    updateTitleAchievementLeader(
      actorRecords.koCountRecord,
      actorRecordId,
      actor.deadCounter
    );
  }

  // Keeps the actor with the highest use count per custom achievement id.
  function updateTitleSkillLeaders(
    useCounts,
    customAchievementIds,
    topUseCounts,
    topActorIds,
    actorRecordId
  ) {
    for (var skillIndex = 0; skillIndex <= customAchievementIds.length - 1; skillIndex++) {
      if (!(useCounts[skillIndex] > topUseCounts[skillIndex])) continue;

      topUseCounts[skillIndex] = useCounts[skillIndex];
      topActorIds[skillIndex] = actorRecordId;
    }
  }

  // Sum of the overkill counter (record slot 67) of the deployed actors.
  function sumTitleOverkillCounts(firstActorId, lastActorId) {
    let overkillCount = 0;
    for (var actorId = firstActorId; actorId <= lastActorId; actorId++) {
      overkillCount += $gameVariables.value(GAME_VARIABLE.ACTOR_RECORD_BASE + actorId)[67];
    }
    return overkillCount;
  }

function collectTitleAchievementRecords() {
    const firstActorId = $gameVariables.value(
      GAME_VARIABLE.FIRST_DEPLOYED_ACTOR_ID
    );
    const lastActorId = $gameVariables.value(
      GAME_VARIABLE.LAST_DEPLOYED_ACTOR_ID
    );
    const criticalHitRecord = [16, 0, 0]; //会心回数
    const maxDamageDealtRecord = [2, 0, 0]; //最大与えダメージ
    const maxDamageTakenRecord = [5, 0, 0]; //最大受けダメージ
    const koCountRecord = [7, 0, 0]; //戦闘不能回数

    const customAchievementIds = [8, 9, 10, 11, 12, 13, 14];
    const topActorIds = [0, 0, 0, 0, 0, 0, 0];
    const topUseCounts = [0, 0, 0, 0, 0, 0, 0];
    const actorRecords = {
      criticalHitRecord: criticalHitRecord,
      maxDamageDealtRecord: maxDamageDealtRecord,
      maxDamageTakenRecord: maxDamageTakenRecord,
      koCountRecord: koCountRecord
    };
    for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
      const actor = $gameActors.actor(actorId);
      if (!actor) continue;
      const actorRecordId = actor.actorId();
      updateTitleActorRecords(actorRecords, actor, actorRecordId);
      //獲得実績自己設定ID
      //スキルタイプid
      //アクターID
      updateTitleSkillLeaders(
        collectActorTitleSkillUses(actor, BATTLE_RECORD_SKILL_TYPE_IDS),
        customAchievementIds,
        topUseCounts,
        topActorIds,
        actorRecordId
      );
    }

    const partyKillRecord = [1, 0, $gameActors.getAllKillEnemyCounter()];
    const partyDamageDealtRecord = [3, 0, $gameActors.attackDamageSum];
    const partyDamageTakenRecord = [6, 0, $gameActors.acceptDamageSum];
    const partyDeathRecord = [15, 0, $gameActors.deadCounter];
    const partyOverkillRecord = [4, 0, sumTitleOverkillCounts(firstActorId, lastActorId)]; //全員のオーバーキル回数

    return {
      customAchievementIds: customAchievementIds,
      topActorIds: topActorIds,
      topUseCounts: topUseCounts,
      criticalHitRecord: criticalHitRecord,
      maxDamageDealtRecord: maxDamageDealtRecord,
      maxDamageTakenRecord: maxDamageTakenRecord,
      koCountRecord: koCountRecord,
      partyKillRecord: partyKillRecord,
      partyDamageDealtRecord: partyDamageDealtRecord,
      partyDamageTakenRecord: partyDamageTakenRecord,
      partyDeathRecord: partyDeathRecord,
      partyOverkillRecord: partyOverkillRecord
    };
  }

    // "variableId,threshold" of the variable based title conditions.
  function readTitleVariableCondition(conditionText) {
    const conditionValues = conditionText.split(",");
    return {
      varId: Number(conditionValues[0]),
      threshold: Number(conditionValues[1])
    };
  }

  // "variableId,arrayIndex,threshold" of the array based title conditions.
  function readTitleArrayCondition(conditionText) {
    const conditionValues = conditionText.split(",");
    return {
      varId: Number(conditionValues[0]),
      arrayIndex: Number(conditionValues[1]),
      threshold: Number(conditionValues[2])
    };
  }

  // "itemId,threshold" of the item possession title conditions.
  function readTitleItemCondition(conditionText) {
    const conditionValues = conditionText.split(",");
    return {
      itemId: Number(conditionValues[0]),
      threshold: Number(conditionValues[1])
    };
  }

  // First party member whose mastery of the listed skill reaches the threshold.
  function findTitleSkillRankOwner(conditionText) {
    const conditionValues = conditionText.split(",");
    const skillId = Number(conditionValues[0]);
    const threshold = Number(conditionValues[1]);
    const members2 = $gameParty.members();

    for (var memberIndex = 0; memberIndex <= members2.length - 1; memberIndex++) {
      const actor = members2[memberIndex];
      if (actor.skillMasteryLevel(skillId) >= threshold) {
        return { matched: true, actorId: actor.actorId(), skillId, threshold };
      }
    }
    return { matched: false, actorId: 0, skillId, threshold };
  }

function evaluateTitleCandidate(item, achievementRecords) {
    const itemMeta = item.meta;
    //スイッチID。最初にtrueにして成立しない場合は途中でfalse
    const titleCheck = {
      checkId: itemMeta["annihilationTitle"] ? 1 : 2,
      result: true,
      mvpActorId: 0 //個人記録のＭＶＰアクター
    };
    if (itemMeta["titleGetSwitch"]) {
      titleCheck.checkId = Number(itemMeta["titleGetSwitch"]);
    }

    // Every present condition replaces the outcome of the previous one, in table order.
    for (const conditionReader of TITLE_CONDITION_READERS) {
      if (!itemMeta[conditionReader.metaKey]) continue;

      const conditionResult = conditionReader.read(itemMeta, achievementRecords);
      if (!conditionResult) continue;

      if (conditionResult.checkId !== undefined) titleCheck.checkId = conditionResult.checkId;
      if (conditionResult.result !== undefined) titleCheck.result = conditionResult.result;
      if (conditionResult.mvpActorId !== undefined) {
        titleCheck.mvpActorId = conditionResult.mvpActorId;
      }
    }

    return {
      eligible: $gameSwitches.value(titleCheck.checkId) && titleCheck.result,
      actorId: titleCheck.mvpActorId
    };
  }

  // Achievement ids that belong to the whole party, so they carry no single owner.
  const TEAM_ACHIEVEMENT_TYPE_IDS = [1, 3, 4, 6, 15];

  // Title conditions in the order the original evaluated them. A reader returns null when
  // the item does not carry that meta key; the fields it returns override the check state.
  const TITLE_CONDITION_READERS = [
    {
      metaKey: "titleGetVariable",
      read: (itemMeta) => {
        const condition = readTitleVariableCondition(itemMeta["titleGetVariable"]);
        return { result: $gameVariables.value(condition.varId) >= condition.threshold };
      }
    },
    {
      metaKey: "titleGetArray",
      read: (itemMeta) => {
        const condition = readTitleArrayCondition(itemMeta["titleGetArray"]);
        return {
          result:
            $gameVariables.value(condition.varId)[condition.arrayIndex] >=
            condition.threshold
        };
      }
    },
    {
      metaKey: "titleGetItems",
      read: (itemMeta) => {
        const condition = readTitleItemCondition(itemMeta["titleGetItems"]);
        return {
          result:
            $gameParty.numItems($dataItems[condition.itemId]) >= condition.threshold
        };
      }
    },
    {
      metaKey: "HtitleGetArray",
      read: (itemMeta) => {
        //主人公のみ
        const condition = readTitleVariableCondition(itemMeta["HtitleGetArray"]);
        return {
          result:
            $gameVariables.value(
              GAME_VARIABLE.ACTOR_RECORD_BASE + $gameVariables.value(GAME_VARIABLE.TRUE_PROTAGONIST_ACTOR_ID)
            )[condition.varId] >= condition.threshold
        };
      }
    },
    {
      metaKey: "titleGetSkillRank",
      read: (itemMeta) => {
        const skillRankMatch = findTitleSkillRankOwner(itemMeta["titleGetSkillRank"]);
        if (!skillRankMatch.matched) return { result: false };
        return { result: true, mvpActorId: skillRankMatch.actorId };
      }
    },
    {
      metaKey: "titleGetAchievement",
      read: (itemMeta, achievementRecords) => {
        const achievementValues = itemMeta["titleGetAchievement"].split(",");
        const achievementTypeId = Number(achievementValues[0]);
        const record = titleAchievementRecord(achievementRecords, achievementTypeId);
        // A matched achievement re-opens switch 2; an unmatched one only leaves switch 1.
        if (!record || !(achievementValues[1] <= record[2])) return { checkId: 1 };

        const isTeamRecord = TEAM_ACHIEVEMENT_TYPE_IDS.indexOf(achievementTypeId) >= 0;
        if (isTeamRecord) return { checkId: 2 };
        return { checkId: 2, mvpActorId: record[1] };
      }
    }
  ];

  function applyTitleAward(item, itemId, titleMvpActorId) {
    $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, itemId);
    const titleMeta = item.meta;
    const coinAward = titleMeta.titleSenkaGet;
    if (coinAward) {
      if (!$gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP))
        $gameParty.gainItem($dataItems[10], Number(coinAward));
      const coinCount = Number(coinAward);
      const titleName = `\x1bIIN[10]${coinCount}`;
      valueWordSetEx = `${titleName}枚獲得！`;
    }
    if (
      !(titleMvpActorId >= 1) ||
      $gameSwitches.value(GAME_SWITCH.RECOLLECTION_SKIP)
    )
      return;
    const titleOwners = $gameVariables.value(
      GAME_VARIABLE.PERSONAL_TITLE_ACTOR_IDS
    );
    titleOwners[itemId] = titleMvpActorId;
    const titleOwnerActor = $gameActors.actor(titleMvpActorId);
    const titleOwnerName = titleOwnerActor.name();
    const achievementOwnerLabel = colorTaggedText(2, titleOwnerName);
    valueWordSetEx = `\n[達成者:${achievementOwnerLabel}]`;
  }

  function appendBossShadowMembers(troopMembers, bossEnemyValues) {
    const shadowEnemyId = 57;
    const sourceEnemy = $dataEnemies[Number(bossEnemyValues[0])];
    $dataEnemies[shadowEnemyId] = copyEnemySpawnData(sourceEnemy);
    const shadowEnemy = $dataEnemies[shadowEnemyId];
    shadowEnemy.name = bossEnemyValues[1];
    const shadowBattlerName = String(bossEnemyValues[2]) + SHADOW_BATTLER_SUFFIX;
    shadowEnemy.battlerName = shadowBattlerName;
    shadowEnemy.battlerHue = 190;
    const actions = shadowEnemy.actions;
    for (let actionIndex = 0; actionIndex < 4; actionIndex++)
      actions[actionIndex].skillId = Number(bossEnemyValues[4 + actionIndex]);
    const availableXs = [50, 100, 150, 200, -50, -100, -150];
    const availableYs = [-50, 0, 50, 100, 150, 200, 250];
    let lastSpawnX;
    for (let memberIndex = 1; memberIndex <= 7; memberIndex++) {
      lastSpawnX = takeRandomSpawnOffset(availableXs);
      const y = takeRandomSpawnOffset(availableYs);
      troopMembers.push({
        enemyId: shadowEnemyId,
        x: lastSpawnX,
        y: y,
        hidden: true
      });
    }
    return lastSpawnX;
  }

  function appendBossEntourageMembers(troopMembers, bossMeta, previousSpawnX) {
    const frontRowXs = [400, 380, 360, 340, 320, 300, 280];
    const backRowXs = [150, 140, 130, 120, 110, 100, 90, 70];
    const availableYs = [200, 220, 250, 400, 450, 470, 500];
    for (let memberIndex = 1; memberIndex <= 7; memberIndex++) {
      const metadata = bossMeta["EnemyEntourage" + memberIndex];
      if (!metadata) continue;
      const memberValues = metadata.split(",");
      const enemyId = Number(memberValues[0]);
      switch (Number(memberValues[1])) {
        case 0:
          previousSpawnX = takeRandomSpawnOffset(frontRowXs);
          break;
        case 1:
          previousSpawnX = takeRandomSpawnOffset(backRowXs);
          break;
      }
      const y = takeRandomSpawnOffset(availableYs);
      const hidden = Number(memberValues[2]) === 1;
      troopMembers.push({
        enemyId: enemyId,
        x: previousSpawnX,
        y: y,
        hidden: hidden
      });
    }
  }

  function initializeVariableRows(
    rows,
    firstRow,
    lastRow,
    columnCount,
    initialValue
  ) {
    for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++)
      rows[rowIndex] = Array(columnCount).fill(initialValue);
  }
  function createActorOutfitPresets(presetBaseName) {
    const actorPresets = [0];
    for (let presetIndex = 1; presetIndex <= 4; presetIndex++) {
      const preset = Array(51).fill(0);
      preset[50] = `${presetBaseName}${presetIndex}`;
      actorPresets.push(preset);
    }
    return actorPresets;
  }
  function initializeHeroineOutfitPresets(
    gameVariables,
    firstActorId,
    lastActorId
  ) {
    gameVariables.setValue(GAME_VARIABLE.OUTFIT_PRESETS, Array(21).fill(0));
    const outfitPresets = gameVariables.value(GAME_VARIABLE.OUTFIT_PRESETS);
    const presetBaseName = "プリセット";
    for (let actorId = firstActorId; actorId <= lastActorId; actorId++)
      outfitPresets[actorId] = createActorOutfitPresets(presetBaseName);
  }
  function titleAchievementRecord(records, achievementTypeId) {
    switch (achievementTypeId) {
      case 1:
        return records.partyKillRecord;
      case 2:
        return records.maxDamageDealtRecord;
      case 3:
        return records.partyDamageDealtRecord;
      case 4:
        return records.partyOverkillRecord;
      case 5:
        return records.maxDamageTakenRecord;
      case 6:
        return records.partyDamageTakenRecord;
      case 7:
        return records.koCountRecord;
      case 15:
        return records.partyDeathRecord;
      case 16:
        return records.criticalHitRecord;
      default: {
        const skillTypeIndex =
          records.customAchievementIds.indexOf(achievementTypeId);
        if (skillTypeIndex < 0) return null;
        return [
          achievementTypeId,
          records.topActorIds[skillTypeIndex],
          records.topUseCounts[skillTypeIndex]
        ];
      }
    }
  }
  function collectActorTitleSkillUses(actor, skillTypeIds) {
    const useCounts = Array(skillTypeIds.length).fill(0);
    const skills = $dataSkills;
    for (let skillId = 1; skillId < skills.length; skillId++) {
      const skill = skills[skillId];
      if (!skill || skill.name === "") continue;
      const skillTypeIndex = skillTypeIds.findIndex(
        (typeId) => skill.stypeId == typeId
      );
      if (skillTypeIndex < 0) continue;
      useCounts[skillTypeIndex] += actor.getSkillUseCounter(skillId);
    }
    return useCounts;
  }
  function showClothingDamageTrap(actor) {
    if (actor && isGirl(actor)) {
      actor.addState(62);
      if (actor.isStateAffected(62)) {
        $gamePlayer.requestAnimation(624);
        $gameVariables.setValue(
          GAME_VARIABLE.SELECTED_ACTOR_ID,
          actor.actorId()
        );
        const messageText = "衣装破損トラップが発生した！";
        CommonPopupManager.showInfo({}, messageText, null);
        return;
      }
    }
    $gamePlayer.requestBalloon(2);
    const trapResult = colorTaggedText(3, "衣装破損トラップ未発生");
    const messageText = `しかし何も起こらなかった…。（${trapResult}）`;
    CommonPopupManager.showInfo({}, messageText, null);
  }
  function applyPartyStateTrap(members, stateId) {
    $gamePlayer.requestAnimation(valueStateAnimeArr[stateId]);
    for (const actor of members)
      state_addFormula1([stateId, 50, actor, actor, actor.mdf, actor.luk]);
  }
  function resourceTrapProfile(trapTypeId) {
    switch (trapTypeId) {
      case 10:
        return {
          stat: "agi",
          gainMethod: "gainHp",
          resourceName: "ＨＰ",
          animationId: 623,
          hitAnimationId: 131,
          damageScale: 10,
          messageText: "足元の魔法陣から爆発が発生した！"
        };
      case 11:
        return {
          stat: "mat",
          gainMethod: "gainMp",
          resourceName: "ＭＰ",
          animationId: 625,
          hitAnimationId: 58,
          damageScale: 1,
          messageText: "吸収の魔法陣が発動した！"
        };
      case 12:
        return {
          stat: "mdf",
          gainMethod: "gainTp",
          resourceName: "ＴＰ",
          animationId: 626,
          hitAnimationId: 58,
          damageScale: 0,
          messageText: "脱力の魔法陣が発動した！"
        };
    }
    return null;
  }
  function readTrapEnemyLevels() {
    const dungeonItemId = $gameVariables.value(
      GAME_VARIABLE.DUNGEON_INFO_ITEM_ID
    );
    if (!(dungeonItemId >= 1)) return null;
    const dungeonItem = $dataItems[dungeonItemId];
    const enemyLevels = dungeonItem && dungeonItem.meta.EnemyLV;
    return enemyLevels ? enemyLevels.split(",") : null;
  }
  function showResourceTrapResult(
    actor,
    profile,
    evasionThreshold,
    randomRoll,
    damageAmount
  ) {
    const actorName = colorTaggedText(16, actor.name());
    const evasionText = colorTaggedText(4, `${evasionThreshold}`);
    const rollText = colorTaggedText(10, `${randomRoll}`);
    if (randomRoll > evasionThreshold) {
      const damageText = colorTaggedText(10, `${damageAmount}`);
      const resourceName = profile.resourceName;
      const messageText = `${actorName}は${damageText}の${resourceName}ダメージを受けた！（判定：${evasionText} > ${rollText}）`;
      CommonPopupManager.showInfo({}, messageText, null);
      return;
    }
    const evasionResult = colorTaggedText(2, "回避");
    const messageText = `${actorName}は${evasionResult}に成功した！（判定：${evasionText} > ${rollText}）`;
    CommonPopupManager.showInfo({}, messageText, null);
  }
  function applyActorResourceTrap(actor, profile, enemyLevelValues) {
    const evasionThreshold = Math.round(
      (actor[profile.stat] * 2 + actor.luk / 10) * actor.xparam(0)
    );
    // Always consume both default rolls before metadata overrides, preserving RNG order.
    let randomRoll = getRandomIndex(900) + 101;
    let damageAmount = profile.damageScale
      ? getRandomIndex(900) + 101
      : getRandomIndex(90) + 11;
    if (enemyLevelValues) {
      randomRoll = getScaledTrapValue(enemyLevelValues, 10);
      if (profile.damageScale)
        damageAmount = getScaledTrapValue(
          enemyLevelValues,
          profile.damageScale
        );
    }
    if (randomRoll > evasionThreshold) {
      $gamePlayer.requestAnimation(profile.hitAnimationId);
      actor[profile.gainMethod](-damageAmount);
    } else $gamePlayer.requestAnimation(129);
    showResourceTrapResult(
      actor,
      profile,
      evasionThreshold,
      randomRoll,
      damageAmount
    );
  }
  function applyPartyResourceTrap(members, event, trapTypeId) {
    const profile = resourceTrapProfile(trapTypeId);
    // HP announces after its animation; MP/TP announce before it. TP animates the event.
    if (trapTypeId === 10) $gamePlayer.requestAnimation(profile.animationId);
    CommonPopupManager.showInfo({}, profile.messageText, null);
    if (trapTypeId !== 10)
      (trapTypeId === 12 ? event : $gamePlayer).requestAnimation(
        profile.animationId
      );
    const enemyLevelValues = readTrapEnemyLevels();
    for (const actor of members)
      applyActorResourceTrap(actor, profile, enemyLevelValues);
  }
  function activateWarpTrap() {
    $gameVariables.setValue(GAME_VARIABLE.SAVED_POSITION, 0);
    // Search actual event IDs, not a fixed database limit; newest/highest ID wins.
    const warpEvents = $gameMap
      .events()
      .slice()
      .sort(
        (firstEvent, secondEvent) =>
          secondEvent.eventId() - firstEvent.eventId()
      );
    for (const warpEvent of warpEvents) {
      const eventData = warpEvent.event();
      if (!eventData || !eventData.meta.warpTrap) continue;
      valueCountSet2 = warpEvent.eventId();
      $gameVariables.setValue(GAME_VARIABLE.SAVED_POSITION, [
        $gameMap.mapId(),
        warpEvent.x,
        warpEvent.y
      ]);
      break;
    }
    const messageText = "転送トラップが発動した！";
    CommonPopupManager.showInfo({}, messageText, null);
  }
  function isConfinementEntryEligible(entry, categoryId) {
    const entryMeta = entry.meta;
    switch (categoryId) {
      case 0:
        return (
          !!entryMeta.EICSwitch &&
          [101, 106, 109].indexOf(Number(entryMeta.EICSwitch)) >= 0
        );
      case 1:
        return true;
      case 2:
        return !!entryMeta["Not Independent item"];
      default:
        return false;
    }
  }
  function transferConfinementEntry(
    entry,
    entryId,
    storedCounts,
    isConfiscating
  ) {
    if (isConfiscating) {
      storedCounts[entryId] += $gameParty.numItems(entry);
      $gameParty.loseItem(entry, storedCounts[entryId]);
      return;
    }
    $gameParty.gainItem(entry, storedCounts[entryId]);
    storedCounts[entryId] = 0;
  }
  function transferConfinementCategory(
    confinementSlots,
    categoryId,
    isConfiscating
  ) {
    const entries = getItemEquipmentSource(categoryId);
    const lastEntryId =
      categoryId === 2 ? valueArmorsLength : entries.length - 1;
    const storedCounts = confinementSlots[categoryId];
    for (let entryId = 1; entryId <= lastEntryId; entryId++) {
      const entry = entries[entryId];
      if (!entry) continue;
      const shouldTransfer = isConfiscating
        ? $gameParty.hasItem(entry, true)
        : storedCounts[entryId];
      if (!shouldTransfer || !isConfinementEntryEligible(entry, categoryId))
        continue;
      transferConfinementEntry(entry, entryId, storedCounts, isConfiscating);
    }
  }
  function formatDefeatCountRow(row) {
    let entryName = row[0];
    if (entryName.length <= 8) {
      for (let columnIndex = entryName.length; columnIndex <= 9; columnIndex++)
        entryName += "　";
      row[0] = entryName;
    }
    const nameText = colorTaggedText(16, `${entryName}`);
    const defeatCount = row[1];
    const countText = colorTaggedText(2, `${defeatCount}体`);
    return `　　${nameText}:${countText} \n`;
  }
  function formatBulkSaleRewards(row) {
    let rewardText = "";
    for (let rewardIndex = 2; rewardIndex <= 4; rewardIndex++) {
      const rewardAmount = row[rewardIndex];
      if (rewardAmount == 0) continue;
      const amountText = rewardAmount.toLocaleString();
      rewardText +=
        rewardIndex === 2 ? `[+${amountText}\\G]` : `[+\\I[1]${amountText}]`;
      switch (rewardIndex) {
        case 2:
          valueCountSet5 += rewardAmount;
          break;
        case 3:
          valueCountSet6 += rewardAmount;
          break;
        case 4:
          valueCountSet7 += rewardAmount;
          break;
      }
    }
    return rewardText;
  }
  function formatBulkSaleRow(row) {
    const entryName = row[0];
    const soldCount = row[1];
    valueCountSet4 += soldCount;
    const rewardText = formatBulkSaleRewards(row);
    return `${entryName}:${soldCount}個売却 ` + rewardText + "\n";
  }
  function formatLoopListRow(row, listKindId) {
    switch (listKindId) {
      case 1:
        return formatBulkSaleRow(row);
      case 2:
        return formatDefeatCountRow(row);
      default:
        return "";
    }
  }
  function loopChoiceEntryLabel(entryId, categoryId, previousLabel) {
    // Categories were strict switch cases; do not coerce a string category here.
    switch (categoryId) {
      case 0:
        return `\x1bIIN[${entryId}]`;
      case 1:
        return `\x1bWIN[${entryId}]`;
      case 2:
        return `\x1bAIN[${entryId}]`;
      default:
        return previousLabel;
    }
  }
  function loopChoiceEntryDetails(
    listKindId,
    entryCategoryId,
    entryId,
    entryIndex,
    choiceText,
    previousDetails
  ) {
    switch (numericCaseValue(listKindId)) {
      case 1: {
        const questIndex = entryId - 800;
        if (valueWordArray[entryIndex] !== "？？？")
          return { label: choiceText, text: valueQuestArray4[questIndex] };
        const unavailableText = colorTaggedText(1, "受注不可");
        const iconIndex = $dataItems[entryId].iconIndex;
        const unknownText = "？？？";
        return {
          label: "[" + unavailableText + `]\x1bI[${iconIndex}]` + unknownText,
          text: valueQuestArray7[questIndex]
        };
      }
      case 2:
        item_priceinfo(entryCategoryId, entryId);
        return {
          label: choiceText,
          text: $gameVariables.value(GAME_VARIABLE.TEMPORARY_TEXT)
        };
      default:
        return { label: choiceText, text: previousDetails };
    }
  }
  function showLoopChoicePicture(
    listKindId,
    columnCount,
    columnLayout,
    choiceIndex,
    detailsText
  ) {
    if (
      !(columnCount <= 2) ||
      choiceIndex > 240 ||
      !(listKindId == 1 || listKindId == 2)
    )
      return;
    const picturePosX = columnLayout && columnLayout.x;
    const picturePosY = columnLayout && columnLayout.y;
    const selectPictureId = listKindId == 2 ? choiceIndex : choiceIndex - 1;
    const pictureId = choiceIndex + 10;
    showChoiceDescriptionPicture(
      pictureId,
      selectPictureId,
      detailsText,
      22,
      picturePosX,
      picturePosY
    );
  }
  function assignBossAlternateActions(
    actionValues,
    firstSlot,
    metadata,
    fallbackSkillId
  ) {
    const metadataValues = metadata ? metadata.split(",") : null;
    for (let offset = 0; offset < 3; offset++)
      actionValues[firstSlot + offset] = metadataValues
        ? Number(metadataValues[offset])
        : fallbackSkillId;
  }
  function restoreActorTownClothing(actorId) {
    $gameVariables.setValue(GAME_VARIABLE.SELECTED_ACTOR_ID, actorId);
    const actor = $gameActors.actor(actorId);
    const actorMeta = $dataActors[actorId].meta;
    if (!actorMeta.MainCloth) return;
    $gameVariables.setValue(
      GAME_VARIABLE.PROCESSED_ITEM_ID,
      Number(actorMeta.MainCloth)
    );
    kisekae_tyokusetusitei(
      $gameVariables.value(GAME_VARIABLE.PROCESSED_ITEM_ID),
      0
    );
    const actorName = actor.name();
    const processedEntryId = $gameVariables.value(
      GAME_VARIABLE.PROCESSED_ITEM_ID
    );
    const itemName = `\x1bIIN[${processedEntryId}]`;
    const messageText = `${actorName}は${itemName}に着替えた。`;
    CommonPopupManager.showInfo({}, messageText, null);
  }
  function heroineSkillConditionMet(actor, skillMeta) {
    const switchCondition = skillMeta.MCharacterSkillLearnSwith;
    if (switchCondition && $gameSwitches.value(Number(switchCondition)))
      return true;
    const skillCondition = skillMeta.MCharacterSkillLearnSkill;
    if (skillCondition && actor.isLearnedSkill(Number(skillCondition)))
      return true;
    const rankCondition = skillMeta.MCharacterSkillLearnSRank;
    if (!rankCondition) return false;
    const rankValues = rankCondition.split(",");
    return (
      actor.skillMasteryLevel(Number(rankValues[0])) >= Number(rankValues[1])
    );
  }
  function teachCompositeActorSkill(actor, skillId, requirements) {
    if (actor.isLearnedSkill(skillId)) return;
    if (
      !requirements.every((requirement) =>
        requirement.minRank === undefined
          ? actor.isLearnedSkill(requirement.skillId)
          : actor.skillMasteryLevel(requirement.skillId) >= requirement.minRank
      )
    )
      return;
    actor.learnSkill(skillId);
    $gameVariables.setValue(GAME_VARIABLE.PROCESSED_ITEM_ID, skillId);
  }
  function configureMapEnvironmentBattlebacks(
    mapMeta,
    gameVariables,
    gameSwitches,
    gameMap
  ) {
    const isNight = gameSwitches.value(GAME_SWITCH.NIGHT);
    let backgroundKey = 0;
    let battlefrontKey = 0;
    let battlebackKey = isNight ? "StarlitSkyBattle" : "BlueSkyBattle";
    if (gameVariables.value(230) >= 1) {
      const nightSuffix = isNight ? "N" : "";
      if (gameSwitches.value(203)) {
        backgroundKey = "BG_out" + nightSuffix;
        battlefrontKey = "TownOutdoor" + nightSuffix;
      } else if (gameSwitches.value(204)) {
        backgroundKey = "BG_in" + nightSuffix;
        battlefrontKey = "TownIndoor" + nightSuffix;
      }
      if (battlefrontKey)
        gameMap.changeBattleback(battlebackKey, battlefrontKey);
    }
    if (gameVariables.value(GAME_VARIABLE.DUNGEON_INFO_ITEM_ID) >= 1) {
      if (mapMeta.BG2) backgroundKey = battlefrontKey = "BG2";
      if (mapMeta.BG1) battlebackKey = "BG1";
      if (isNight) {
        if (mapMeta.BGN2) backgroundKey = battlefrontKey = "BGN2";
        if (mapMeta.BGN1) battlebackKey = "BGN1";
      }
      const backMetadata = mapMeta[battlebackKey];
      const frontMetadata = mapMeta[battlefrontKey];
      if (battlefrontKey && backMetadata && frontMetadata)
        gameMap.changeBattleback(
          backMetadata.split(",")[0],
          frontMetadata.split(",")[0]
        );
    }
    return {
      backgroundKey: backgroundKey,
      battlebackKey: battlebackKey,
      battlefrontKey: battlefrontKey
    };
  }
  function applyMapBackgroundOverrides(
    dataMap,
    backgrounds,
    gameVariables,
    gameSwitches,
    gameMap
  ) {
    const meta = dataMap.meta;
    const nightSuffix = gameSwitches.value(GAME_SWITCH.NIGHT) ? "N" : "";
    const backgroundKey = "BGchange" + nightSuffix;
    const backOverride = meta["BattleBGChange1" + nightSuffix];
    const frontOverride = meta["BattleBGChange2" + nightSuffix];
    if (meta[backgroundKey])
      setMapBgVariables(gameVariables, dataMap, backgroundKey);
    if (!backOverride && !frontOverride) return;
    const battlebackName = backOverride
      ? backOverride.split(",")[0]
      : backgrounds.battlebackKey;
    const battlefrontName = frontOverride
      ? frontOverride.split(",")[0]
      : backgrounds.battlefrontKey;
    gameMap.changeBattleback(battlebackName, battlefrontName);
  }
  function applyMapMetadataParallax(mapMeta, gameVariables, gameMap) {
    const backgroundName = gameVariables.value(
      GAME_VARIABLE.MENU_BACKGROUND_NAME
    );
    if (backgroundName === 0 || !mapMeta.ParallaxSet) return;
    const scrollSpeedX = gameVariables.value(81);
    const scrollSpeedY = gameVariables.value(82);
    gameMap.changeParallax(
      backgroundName,
      scrollSpeedX !== 0,
      scrollSpeedY !== 0,
      scrollSpeedX,
      scrollSpeedY
    );
  }

  function applyTitleConfiguration(titleMeta, isActive) {
    const variableEffect = titleMeta.titleEffectConfiVal;
    if (isActive && variableEffect) {
      const effectValues = variableEffect.split(",");
      const variableId = Number(effectValues[0]);
      $gameVariables.setValue(
        variableId,
        $gameVariables.value(variableId) + Number(effectValues[1])
      );
    }
    const switchEffect = titleMeta.titleEffectConfiSwi;
    if (switchEffect) $gameSwitches.setValue(Number(switchEffect), isActive);
  }
  function partyStateDescription(stateId, stateData, partyMembers) {
    let actorText = "";
    for (const actor of partyMembers) {
      if (!actor.isStateAffected(stateId)) continue;
      const actorName = actor.name();
      actorText += colorTaggedText(16, `[${actorName}]`);
    }
    const description = stateData.description;
    return actorText + `\n${description}\n`;
  }
  function countUnlockedClassRange(classIds, firstClassId, lastClassId) {
    let count = 0;
    for (const classId of classIds)
      if (classId >= firstClassId && classId <= lastClassId) count++;
    return count;
  }
  function collectActorBattleMetrics(actor, actorId) {
    const killCount = actor.getAllKillEnemyCounter();
    const attackDamageMax = actor.attackDamageMax;
    const attackDamageSum = actor.attackDamageSum;
    const actorRecords = $gameVariables.value(GAME_VARIABLE.ACTOR_RECORD_BASE + actorId);
    return [
      killCount,
      attackDamageMax,
      attackDamageSum,
      actorRecords[68],
      actorRecords[67],
      actor.acceptDamageMax,
      actor.acceptDamageSum,
      actor.deadCounter
    ];
  }
  function updatePartyBattleRecordMvp(partyMembers) {
    const metricColumns = Array.from({ length: 8 }, () => []);
    for (const member of partyMembers) {
      const actorId = member._actorId;
      const actor = $gameActors.actor(actorId);
      const metrics = collectActorBattleMetrics(actor, actorId);
      for (let metricIndex = 0; metricIndex < 8; metricIndex++)
        metricColumns[metricIndex].push(metrics[metricIndex]);
    }
    for (let metricIndex = 0; metricIndex < 8; metricIndex++) {
      const maximum = metricColumns[metricIndex].reduce((best, value) =>
        Math.max(best, value)
      );
      valueBattleRecordMVP[metricIndex + 1] =
        metricIndex === 4 ? maximum / 2 : maximum;
    }
  }
  function buildActorBattleRecord(actor) {
    const battleRecord = Array(21).fill(-1);
    const actorNameLabel = colorTaggedText(1, actor.name());
    battleRecord[0] = actorNameLabel + "\n";
    const metrics = collectActorBattleMetrics(actor, actor.actorId());
    for (let metricIndex = 0; metricIndex < 8; metricIndex++)
      battleRecord[metricIndex + 1] = metrics[metricIndex];
    battleRecord[5] /= 2;
    battleRecord[10] = "────";
    const skillUseCounts = collectActorTitleSkillUses(
      actor,
      BATTLE_RECORD_SKILL_TYPE_IDS
    );
    for (let typeIndex = 0; typeIndex < skillUseCounts.length; typeIndex++)
      battleRecord[11 + typeIndex] = skillUseCounts[typeIndex];
    return battleRecord;
  }
  function formatActorBattleRecord(battleRecord) {
    let text = battleRecord[0];
    for (let recordIndex = 1; recordIndex <= 20; recordIndex++) {
      const recordValue = battleRecord[recordIndex];
      if (recordValue == -1) continue;
      if (
        recordIndex <= 8 &&
        recordValue >= 1 &&
        recordValue >= valueBattleRecordMVP[recordIndex]
      )
        text += "\\I[676]\\C[2]";
      const amountText = recordValue.toLocaleString();
      text +=
        recordValue >= 1000000000
          ? `\\fs[22]${amountText}\\C[0]\\fs[28]\n`
          : `${amountText}\\C[0]\n`;
    }
    return text;
  }
  function showActorBattleRecord(actor, memberIndex, windowId, windowX) {
    const battleRecord = buildActorBattleRecord(actor);
    window["valueBattleRecord_" + memberIndex] = battleRecord;
    battleRecord[0] = formatActorBattleRecord(battleRecord);
    WindowManager.show(windowId, windowX, 100, 250, 668);
    WindowManager.drawText(windowId, battleRecord[0]);
    WindowManager.show(windowId + 1, windowX + 40, 20, 170, 80);
    const faceFileName = BATTLE_HUD_FACE_PREFIX + actor.actorId();
    WindowManager.drawPicture(windowId + 1, faceFileName);
  }

    // Plain text picture used by the commentary choices.
  function showCommentaryTextPicture(commentaryText, pictureId, pictureX, pictureY) {
    $gameScreen.setDTextPicture(commentaryText, 28);
    $gameScreen.dWindowFrame = "ON";
    showCommentaryPicture("", pictureId, pictureX, pictureY);
  }

  // Picture slot of the commentary screen; an empty name means "text only".
  function showCommentaryPicture(pictureName, pictureId, pictureX, pictureY) {
    $gameScreen.showPicture(pictureId, pictureName, 0, pictureX, pictureY, 100, 100, 0, 0);
  }

  function showCommentaryChoice(
    choiceText,
    displayType,
    displayText,
    firstTextData
  ) {
    const customChoiceId = 1;
    const choiceParams = {
      text: `${choiceText}`,
      value: valueStartCommentary0
    };
    $gameSystem.addCustomChoice(customChoiceId, choiceParams);

    // Detail pictures carry the description themselves, so the text picture is only
    // drawn for tips.
    const isDetailPicture = displayType == "Dpic";
    if (!isDetailPicture) {
      let commentaryText = displayText;
      if (firstTextData != "Nda") {
        commentaryText += "\\I[535]";
      }
      const commentaryPictureId = 150 + valueStartCommentary1 + valueStartCommentary0;
      showCommentaryTextPicture(commentaryText, commentaryPictureId, 10, 606);
      $gameMessage.setSelectPictureId(valueStartCommentary0 - 1, commentaryPictureId);
    }
    if (displayType == "Npic") return;

    const pictureId = 100 + valueStartCommentary1 + valueStartCommentary0;
    if (isDetailPicture) {
      showCommentaryTextPicture(displayText, pictureId, 334, 100);
    } else {
      showCommentaryPicture("/img/tips/" + displayType, pictureId, 334, 0);
    }
    $gameMessage.setSelectPictureId(valueStartCommentary0 - 1, pictureId);
  };

  function unlockCommentaryEntry(
    switchId,
    choiceText,
    displayType,
    displayText
  ) {
    $gameVariables.setValue(GAME_VARIABLE.RANDOM_WORK_1, 0);
    $gameVariables.setValue(GAME_VARIABLE.RANDOM_WORK_2, 0);
    if ($gameSwitches.value(switchId)) return;

    if (switchId >= 1) {
      $gameSwitches.setValue(switchId, true);
    }
    AudioManager.playSe({ name: "Chime1", volume: 90, pitch: 100, pan: 0 });
    $gameVariables.setValue(GAME_VARIABLE.RANDOM_WORK_1, switchId);
    valueStartCommentary0 = 1;
    showUnlockCommentaryPicture(choiceText, displayType, displayText);
    showCommentaryBackdrop();
  }

  // Text commentary uses an empty picture plus the drawn text; a named type shows
  // "/img/tips/<type>" and passes the text through variable 2 instead.
  function showUnlockCommentaryPicture(choiceText, displayType, displayText) {
    if (displayType == "Npic" || displayType == "Dpic") {
      $gameScreen.setDTextPicture(`${choiceText}\n${displayText}`, 28);
      $gameScreen.dWindowFrame = "ON";
      $gameScreen.showPicture(102, "", 0, 110, 100, 100, 100, 0, 0);
    } else {
      $gameScreen.showPicture(102, "/img/tips/" + displayType, 0, 110, 100, 100, 100, 0, 0);
      $gameVariables.setValue(GAME_VARIABLE.RANDOM_WORK_2, displayText);
    }
    $gameScreen.movePicture(102, 0, 10, 10, 100, 100, 255, 0, 60);
  }

  // Black overlay that dims the map behind the commentary.
  function showCommentaryBackdrop() {
    $gameScreen.showPicture(
      101,
      "ScreenBlackOut",
      1,
      640,
      384,
      100,
      100,
      0,
      0
    );
    $gameScreen.movePicture(101, 1, 640, 384, 100, 100, 200, 0, 60);
  }

  function showChoiceDescriptionPicture(
    pictureId,
    choiceIndex,
    text,
    fontSize,
    x,
    y
  ) {
    $gameScreen.setDTextPicture(text, fontSize);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(pictureId, "", 0, x, y, 100, 100, 0, 0);
    $gameMessage.setSelectPictureId(choiceIndex, pictureId);
  }
  function showActorClassReleaseOverview(actor) {
    const actorName = actor.name();
    $gameSystem.addCustomChoice(1, { text: `${actorName}→`, value: 0 });
    const classId = actor._classId;
    const classData = $dataClasses[classId];
    const learnings = classData.learnings;
    let learningText = "";
    let shownCount = 0;
    for (const learning of learnings) {
      if (!learning || !(learning.level >= actor.level)) continue;
      const skillId = learning.skillId;
      const level = learning.level;
      const skillDescription = $dataSkills[skillId].description;
      const levelLabel = colorTaggedText(17, `[Lv${level}]`);
      const skillMarker = `\x1bSIN[${skillId}]`;
      const skillRowText =
        levelLabel + skillMarker + "\n" + skillDescription + "\n";
      learningText += skillRowText;
      if (++shownCount >= 6) break;
    }
    const classNameText = `<${classData.name}>`;
    const className = colorTaggedText(23, classNameText);
    const description = classData.description;
    const additionalDescription = valueAddDescriptionClass[classId];
    const text =
      `${className}\n${description}\n${additionalDescription}\n` + learningText;
    showChoiceDescriptionPicture(100, 0, text, 22, 300, 20);
  }
  function classReleaseSkillList(classId) {
    const heading = colorTaggedText(14, "習得可能スキル");
    let text = heading + "\n";
    const skills = $dataSkills;
    for (let skillId = 1; skillId <= 888; skillId++) {
      const skill = skills[skillId];
      const learningClass = skill.meta.SkillLearningClass;
      if (!learningClass || Number(learningClass) != classId) continue;
      const skillDescription = skill.description;
      text += `\x1bSIN[${skillId}]\n${skillDescription}\n`;
    }
    return text;
  }
  function classReleaseGoldRequirement(releaseCost) {
    const heading = colorTaggedText(14, "解放資金");
    const costText = releaseCost.toLocaleString();
    const currentGold = $gameParty.gold();
    const goldText = currentGold.toLocaleString();
    const amountText = `（現在所持金:${goldText}）`;
    const blocked = !(currentGold >= releaseCost);
    const holdingText = blocked ? colorTaggedText(10, amountText) : amountText;
    return { text: `${heading}:${costText}${holdingText}\n`, blocked: blocked };
  }
  function classReleaseMaterialRequirement(classRank) {
    const heading = colorTaggedText(14, "解放素材");
    let text = heading + ":";
    let requiredItem = null;
    if (classRank >= 1) {
      const metadataKey = "class" + classRank + "JobReleaseM";
      const items = $dataItems;
      for (let itemId = 1; itemId < items.length; itemId++) {
        const item = items[itemId];
        if (!item.meta[metadataKey]) continue;
        requiredItem = item;
        break;
      }
    }
    if (!requiredItem) return { text: text + "なし\n", blocked: false };
    const itemName = requiredItem.name;
    text += `${itemName} 3個`;
    const ownedItemCount = $gameParty.numItems(requiredItem);
    if (ownedItemCount >= 1)
      return {
        text: text + `（所持数:${ownedItemCount}）\n`,
        blocked: !(ownedItemCount >= 3)
      };
    const missingText = colorTaggedText(10, "（未所持）");
    return { text: text + missingText + "\n", blocked: true };
  }
  function classReleaseLevelRequirement(actor, classId, requiredLevel) {
    const heading = colorTaggedText(14, "解放条件");
    const parentClassId = classId - 10;
    const className = $dataClasses[parentClassId].name;
    const currentLevel = actor.classLevel(parentClassId);
    const blocked = !(currentLevel >= requiredLevel);
    const resultText = blocked ? colorTaggedText(10, UNMET_RESULT_TEXT) : MET_RESULT_TEXT;
    return {
      text: `${heading}:${className}LV:${currentLevel}${resultText}\n`,
      blocked: blocked
    };
  }
  function buildJobReleaseChoiceDetails(
    actor,
    classId,
    classData,
    costContext
  ) {
    const classRank = Number(classData.meta.classRank);
    // Preserve the legacy carry-forward values for ranks without a table entry.
    costContext.releaseCost =
      RELEASE_COST_BY_CLASS_RANK[classRank] || costContext.releaseCost;
    const gold = classReleaseGoldRequirement(costContext.releaseCost);
    const materials = classReleaseMaterialRequirement(classRank);
    let text = classReleaseSkillList(classId) + gold.text + materials.text;
    let blocked = gold.blocked || materials.blocked;
    if (classRank >= 2) {
      costContext.requiredLevel =
        REQUIRED_LEVEL_BY_CLASS_RANK[classRank] || costContext.requiredLevel;
      const level = classReleaseLevelRequirement(
        actor,
        classId,
        costContext.requiredLevel
      );
      text += level.text;
      blocked = blocked || level.blocked;
    }
    return { text: text, blocked: blocked };
  }
  function addJobReleaseClassChoice(
    actor,
    classId,
    choiceIndex,
    pictureId,
    costContext
  ) {
    const classData = $dataClasses[classId];
    const details = buildJobReleaseChoiceDetails(
      actor,
      classId,
      classData,
      costContext
    );
    if (!details.blocked) valueJobReleaseTorF1[classId] = 1;
    const className = classData.name;
    const label = details.blocked
      ? colorTaggedText(7, className)
      : `${className}`;
    $gameSystem.addCustomChoice(1, { text: label, value: choiceIndex });
    const description = classData.description;
    const additionalDescription = valueAddDescriptionClass[classId];
    const text = `${description}\n${additionalDescription}\n` + details.text;
    showChoiceDescriptionPicture(pictureId, choiceIndex, text, 22, 300, 20);
    valueJobReleaseTorF2[choiceIndex] = classId;
  }

  // "Scene end time advance" value -> the switch of the resulting time of day.
  const TIME_OF_DAY_SWITCH_BY_ADVANCE = {
    1: GAME_SWITCH.MORNING,
    2: GAME_SWITCH.DAYTIME,
    3: GAME_SWITCH.NIGHT
  };

  function restoreRegisteredSceneTime() {
    // Puts back the time of day the scene interrupted, unless none was saved.
    restoreSavedTimeSwitch($gameVariables, $gameSwitches);
    $gameVariables.setValue(GAME_VARIABLE.SCENE_PREVIOUS_TIME_SWITCH_ID, 0);

    const sceneTimeAdvance = $gameVariables.value(
      GAME_VARIABLE.SCENE_END_TIME_ADVANCE
    );
    if (!(sceneTimeAdvance >= 1)) return;

    clearTimeOfDaySwitches();
    const nextTimeSwitchId = TIME_OF_DAY_SWITCH_BY_ADVANCE[sceneTimeAdvance];
    if (nextTimeSwitchId !== undefined) {
      $gameSwitches.setValue(nextTimeSwitchId, true);
    }
    $gameVariables.setValue(GAME_VARIABLE.SCENE_END_TIME_ADVANCE, 0);
  }

  function eraseRegisteredSceneEvents() {
    const spawnedEventIds = $gameVariables.value(
      GAME_VARIABLE.DYNAMIC_EVENT_IDS
    );
    for (const spawnedEventId of spawnedEventIds || []) {
      if (!(spawnedEventId >= 1)) continue;
      const spawnedEvent = $gameMap.event(spawnedEventId);
      if (!spawnedEvent || $gameParty.inBattle()) continue;
      $gameMap.eraseEvent(spawnedEventId);
    }
  }

  function mealBuffParameterName(effectTypeId, parameterId) {
    switch (effectTypeId) {
      case 0:
        return TextManager.param(parameterId);
      case 1:
        return FTKR.CSS.cssStatus.xparam[parameterId];
      case 2:
        return FTKR.CSS.cssStatus.sparam[parameterId];
    }
    return "";
  }
  function updateTitleAchievementLeader(record, actorId, score) {
    if (!(score > record[2])) return;
    record[1] = actorId;
    record[2] = score;
  }
})();
