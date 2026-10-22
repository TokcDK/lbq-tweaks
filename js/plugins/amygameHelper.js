/*:
 * @plugindesc Shared helper functions extracted from repeating Script (355/655) command blocks found across data/*.json (maps, troops, common events)
 * @author BlueQuest maintenance
 *
 * @help
 * Script blocks that were copy-pasted across many map/common events were moved
 * into the parameterized functions below. Every occurrence in the data files
 * was replaced by a single Script command calling the corresponding function.
 *
 * Functions that touch Game_Interpreter state (_eventId, setupChild, sVal)
 * take the interpreter as first argument: call them from a Script event
 * command as "AGH_xxx(this, ...);" so behaviour is identical to the original
 * inline code.
 *
 * NOTE: deliberately NOT strict mode - several helpers intentionally write
 * implicit globals (valuePic1, valueWeatherSceneSet, valueCountSet*, ...)
 * exactly like the original inline snippets did.
 */

(function () {
  const HELPER_VARIABLE = {
    PROTAGONIST_ACTOR_ID: 2, // 真の主人公ＩＤ
    VIEWPOINT_ACTOR_ID: 11, // その時点での視点主人公ID
    PROCESSED_ENTRY_ID: 19, // アイテム処理時代入変数
    SELECTED_ACTOR_ID: 20, // アクター選択肢代入変数
    RANDOM_WORK_1: 21, // 乱数汎用1
    RANDOM_WORK_2: 22, // 乱数汎用2
    RANDOM_WORK_3: 23, // 乱数汎用3
    RANDOM_WORK_4: 24, // 乱数汎用4
    FIRST_DEPLOYED_ACTOR_ID: 75, // 登場キャラ指定変数始点
    LAST_DEPLOYED_ACTOR_ID: 76, // 登場キャラ指定変数終点
    QUEST_HINT: 134, // クエスト進行毎のヒント変数
    EVENT_WORK_VALUES: 163, // [リセットなし]各位置未確定イベント用配列20個
    EVENT_DESTINATION: 171, // イベント移動一時指定
    SCENE_SUMMARY_COUNTS: 175, // Hシーン一行表現履歴数
    RESTRICTED_MENU_STATE_IDS: 205, // シーングローサリー開き禁止ステート配列
    DUNGEON_WARP_POINTS: 211, // ダンジョンワープ魔方陣用２次配列
    DUNGEON_TREASURE_LISTS: 215, // ダンジョン宝箱指定２次配列
    DUNGEON_TREASURE_TYPES: 216, // ダンジョン宝箱種類指定２次配列
    MAX_ENEMY_COUNT: 224, // 雑魚魔物出現最大数
    MAX_H_ENEMY_COUNT: 227, // エロ雑魚出現最大数
    TOWN_INFO_ITEM_ID: 230, // 街情報アイテム指定変数
    DUNGEON_INFO_ITEM_ID: 240, // ダンジョン毎情報アイテム指定変数
    DAMAGED_CLOTHES_NAME: 243, // 衣装破損時部位指定アイテム名
    HEROINE_ACTOR_IDS: 247, // ヒロインID配列
    CHARACTER_ACTOR_IDS: 248, // キャラID配列
    DYNAMIC_EVENT_IDS: 292, // イベント用動的生成ID配列
    TRAINING_DOLL_SETTINGS: 293, // 訓練人形事前設定配列
    BASE_ACTIVATION_RECORDS: 327, // 拠点アクティベート記録配列
    OUTFIT_PRESETS: 355, // 衣装プリセット配列
    PARTNER_ENCOUNTER_COUNTS: 380, // アクター20相手毎のH回数記録配列
    EVENT_SUBJECT_INDEX: 530, // イベント進行時主格キャラ指定変数
    EPISODE_ITEM_ID: 535, // 挿話回想進行時アイテムID指定
    DAY_END_INFO_TEXT: 539, // 一日終了時情報表示文字列変数
    DAY_END_INFO_LINE_COUNT: 540, // 一日終了時情報表示カウント変数
    WALLET_DELIVERY_COUNT: 605 // 称号：正直者。財布届けた回数
  };
  const HELPER_SWITCH = {
    RECOLLECTION_SKIP: 29, // 回想時スキップスイッチ
    ENEMY_STATUS_VISIBLE: 95, // エネミーステータス確認onoff
    EVENT_IN_PROGRESS: 124, // イベント進行時onoff()
    NON_ADULT_BACKGROUND_VOICE: 125, // Hシーン以外BGV開始並列スイッチ
    DAILY_AUTO_ACCEPT: 128, // デイリー自動受注スイッチ
    DAILY_AUTO_COMPLETE: 129, // デイリー自動達成スイッチ
    CHOICE_1_ENABLED: 161, // 各種選択肢スイッチonoff
    CHOICE_2_ENABLED: 162, // 180まで
    TOWN: 202, // 街
    TEMPORARY_FLAG: 380, // 汎用一時onoff自動スイッチ
    LOOP_PICTURE_MOVEMENT: 429, // ピクチャ並列処理ループ移動
    RARE_CHEST_DISPLAY: 439, // 宝箱レア枠時一時
    RANK_3_ATTACK_NOTICE: 482, // [NoReset]通常攻撃スキルランク3で習得スキル増加お知らせ
    SENSE_MAP_WINDOW_OPEN: 603 // スキルアイテムでウィンドウ切換えスイッチonoff自動
  };

  
  const ON_MARK = "ON";
  const OFF_MARK = "OFF";

  getIWA = function (id) {
    switch (id) {
      case 0:
        return $dataItems;
      case 1:
        return $dataWeapons;
      case 2:
        return $dataArmors;
      default:
        console.warn("getIWA: Warn, ID is not 0-2! return items");
        return $dataItems;
    }
  };

  //内部用。変数292(スポーンID一覧)が未設定/配列でない場合の事故を防ぐ
  function AGH_spawnIdList() {
    const spawnIdList = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    return Array.isArray(spawnIdList) ? spawnIdList : [];
  }

  //=============================================================================
  // Scene return / position bookkeeping (common event 54 family)
  //=============================================================================

  // Replaces (~90x):
  //   $gameVariables.setValue(HELPER_VARIABLE.EVENT_DESTINATION,[x,y,z]);        <- position array or expression
  //   this.setupChild($dataCommonEvents[54].list, 0);
  // Common event 54 restores the scene from the destination array in variable 171.
  const SCENE_RETURN_COMMON_EVENT_ID = 54;

  function startSceneReturn(interp, eventDestination) {
    $gameVariables.setValue(HELPER_VARIABLE.EVENT_DESTINATION, eventDestination);
    interp.setupChild($dataCommonEvents[SCENE_RETURN_COMMON_EVENT_ID].list, 0);
  }

  AGH_sceneReturnSetup = function (interp, eventDestination) {
    startSceneReturn(interp, eventDestination);
  };

  //=============================================================================
  // Conversation face selection
  //=============================================================================

  // Replaces (~57x):
  //   this.sVal(172,7);//会話途中顔グラ。
  //   $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID,<actorId>);
  //   valueFaceSelect = <faceNo>;
  AGH_faceSelectMidTalk = function (interp, actorId, faceIndex) {
    $gameVariables.setValue(172, 7); //会話途中顔グラ。
    $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID, actorId);
    valueFaceSelect = faceIndex;
  };

  //=============================================================================
  // H-scene recall / replay presets
  //=============================================================================

  // Replaces (~48x):
  //   this.sVal(530,<mainChara>);//主格キャラ
  //   this.sVal(535,<itemSub>);//挿話回想の場合アイテムID。メインは0
  //   valueWeatherSceneSet = <weather>;
  //   h_keikenhyouji1(521,<partnerId>);//記録変数,相手ID
  AGH_recallSceneSetup = function (interp, eventSubjectIndex, episodeItemId, sceneWeather, partnerId) {
    $gameVariables.setValue(530, eventSubjectIndex); //主格キャラ
    $gameVariables.setValue(535, episodeItemId); //挿話回想の場合アイテムID。メインは0
    valueWeatherSceneSet = sceneWeather;
    h_keikenhyouji1(521, partnerId); //記録変数,相手ID
  };

  // Replaces (~44x):
  //   valueScenePic = '<prefix>';
  //   //var value2 = valueScenePic+'01';
  //   this.sVal(530,<mainChara>);
  //   this.sVal(535,<itemSub>);
  //   h_keikenhyouji1(521,<partnerId>);
  //   valueWeatherSceneSet = <weather>;
  //   $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID,$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX));
  AGH_xevSceneIntro = function (interp, scenePic, eventSubjectIndex, episodeItemId, partnerId, sceneWeather) {
    valueScenePic = scenePic;
    //var value2 = valueScenePic+'01';
    $gameVariables.setValue(530, eventSubjectIndex); //主格キャラ
    $gameVariables.setValue(535, episodeItemId); //挿話回想の場合アイテムID。メインは0
    h_keikenhyouji1(521, partnerId); //記録変数,相手ID
    valueWeatherSceneSet = sceneWeather;
    $gameVariables.setValue(
      HELPER_VARIABLE.SELECTED_ACTOR_ID,
      $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX)
    ); //H主体ｱｸﾀｰID
  };

  //=============================================================================
  // Boss battle helpers
  //=============================================================================

  // Replaces (~37x): spawn blood-stain decal behind defeated boss event.
  AGH_bossBloodMark = function () {
    const event = $gameMap.event(valueBossId);
    if (!event) return;
    event.resetPattern();
    event._originalPattern = 1;
    event.setAngle(45);
    event.setDirection(2);
    event.setDirectionFix(true);
    event.setStepAnime(false);
    event.setWalkAnime(false);
    $gameMap.spawnEvent(99, event.x, event.y, true); //血痕
  };

  // Replaces (~5x):
  //   var arr1 = $gameMap.event(this._eventId).event().meta['BossGura'].split(',');
  //   boss_setup1(Number(arr1[0]),Number(arr1[1]));
  AGH_bossSetupFromMeta = function (interp) {
    const mapEvent = $gameMap.event(interp._eventId);
    if (!mapEvent) return;
    const eventData = mapEvent.event();
    if (!eventData || !eventData.meta) return;
    const bossGraphics = eventData.meta.BossGura;
    if (typeof bossGraphics !== "string") return;
    const bossGraphicsParameters = bossGraphics.split(",").map(Number);
    if (bossGraphicsParameters.length < 2 || !bossGraphicsParameters.every(Number.isFinite)) return;
    boss_setup1(bossGraphicsParameters[0], bossGraphicsParameters[1]);
  };

  //=============================================================================
  // Counter flags (parallel-event counters)
  //=============================================================================

  // Replaces (~28x):
  //   valueCountSet3 = <v3>;
  //   valueCountSet1 = <v1>;
  AGH_setCountSet = function (tertiaryCounter, primaryCounter) {
    valueCountSet3 = tertiaryCounter;
    valueCountSet1 = primaryCounter;
  };

  //=============================================================================
  // Spawned-NPC respawn presets
  //=============================================================================

  // Replaces (~27x):
  //   var value1 = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
  //   event_respawnSetA(value1,<a>,<b>,<c>[,<d>]);
  //   this._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1];
  AGH_respawnPartyAndSetId = function (interp, a, b, c, d) {
    const spawnSlot = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    if (arguments.length >= 5) {
      event_respawnSetA(spawnSlot, a, b, c, d);
    } else {
      event_respawnSetA(spawnSlot, a, b, c);
    }
    interp._eventId = AGH_spawnIdList()[spawnSlot] || 0;
  };

  // Replaces (~31x):
  //   var value1 = <id or expression>;
  //   var event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1]);
  //   event.locate(<x>, <y>);
  //   event.setDirection(<dir>);
  AGH_locateSpawnedNpc = function (id, x, y, dir) {
    const spawnSlot = id;
    const event = $gameMap.event(AGH_spawnIdList()[spawnSlot]);
    if (!event) return;
    event.locate(x, y);
    event.setDirection(dir);
  };

  // Replaces (~26x):
  //   var arr1 = [];
  //   arr1.push($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[<id1>]); ...
  //   event_NpcCharaMoveId(45,"<action>",arr1);
  AGH_npcGroupAction = function (ids, action) {
    const spawnIdList = AGH_spawnIdList();
    if (spawnIdList.length === 0) return;
    const spawnEventIds = [];
    ids.forEach(function (id) {
      spawnEventIds.push(spawnIdList[id]);
    });
    event_NpcCharaMoveId(45, action, spawnEventIds);
  };

  //=============================================================================
  // UI notices / windows
  //=============================================================================

  // Replaces (~24x): region/map unlock notification popup (common event 45).
  AGH_regionUnlockNotice = function (interp, entrySwitchId, regionSwitchId) {
    $gameVariables.setValue(20, 0);
    const newEntryName = $dataSystem.switches[entrySwitchId];
    const regionName = $dataSystem.switches[regionSwitchId];
    const coloredText = colorTaggedText(16, `${newEntryName}`);
    valueWordSet0 = `${regionName}に${coloredText}が追加されました`;
    valueWordSetEx = 0; //補足が必要な場合
    interp.setupChild($dataCommonEvents[45].list, 0);
  };

  // Replaces (~23x): party join/leave processing via common event 64.
  //   this.sVal(14,<mode14>);this.sVal(20,<mode20>);this.sVal(121,0);
  //   this.setupChild($dataCommonEvents[64].list, 0);
  AGH_partyJoinLeaveCommon = function (interp, mode14, mode20) {
    $gameVariables.setValue(14, mode14);
    $gameVariables.setValue(20, mode20);
    $gameVariables.setValue(121, 0);
    interp.setupChild($dataCommonEvents[64].list, 0);
  };

  // Replaces (~10x):
  //   this.sVal(172,16);
  //   valueTalkSet = [<give>,<actorId>,<frames>];
  //   this.setupChild($dataCommonEvents[60].list, 0);
  AGH_talkSetCall = function (interp, give, actorId, frames) {
    $gameVariables.setValue(172, 16);
    valueTalkSet = [give, actorId, frames]; //1で付与2で直接表示\CE[60]のみ0で解除,ｱｸﾀｰid,ﾌﾚｰﾑ60,40,20
    interp.setupChild($dataCommonEvents[60].list, 0);
  };

  //=============================================================================
  // Picture / screen effects
  //=============================================================================

  // Replaces (~33x):
  //   var value1 = <picId>;
  //   $gameScreen.movePicture(value1,<origin>,<x>,<y>,100,<scaleY>,0,0,<dur>);
  AGH_movePictureTo = function (pictureId2, origin, x, y, scaleY, duration) {
    const pictureId = pictureId2;
    $gameScreen.movePicture(pictureId, origin, x, y, 100, scaleY, 0, 0, duration);
  };

  // Replaces (~16x):
  //   $gameSwitches.setValue(<switchId>,false);
  //   var arr1 = [<ids>];
  //   pic_eraseP(<layer>,arr1);
  AGH_erasePictureIdsForSwitch = function (switchId, layer, ids) {
    $gameSwitches.setValue(switchId, false);
    const picIds = ids;
    pic_eraseP(layer, picIds);
  };

  // Replaces (~12x):
  //   valuePic1 = <picId>;
  //   var value2 = '<imageName>';
  //   $gameScreen.showPicture(valuePic1,value2,1,640,384,100,100,255,0);
  //   picture_fade1(valuePic1,"fadeIn",<fadeTarget>,<frames>,5);
  AGH_showCgFadeIn = function (pictureId, imageName, fadeTarget, frames) {
    valuePic1 = pictureId;
    const cgImageName = imageName;
    $gameScreen.showPicture(pictureId, cgImageName, 1, 640, 384, 100, 100, 255, 0);
    picture_fade1(pictureId, "fadeIn", fadeTarget, frames, 5);
  };

  // Replaces (8x): slide out left-side standing pictures (11..20).
  AGH_slideOutLeftPictures = function () {
    for (let i = 11; i <= 20; i++) {
      const pic = $gameScreen.picture(i);
      if (!pic) continue;

      const posX = pic.x() >= 640 ? 1280 : -500;
      $gameScreen.movePicture(i, 1, posX, pic.y(), pic.scaleX(), pic.scaleY(), 0, 0, 60);
    }
  };

  //=============================================================================
  // Battle / party processing
  //=============================================================================

  // Replaces (8x): refresh whole party with passive/title re-application.
  AGH_partyBattleRefresh = function () {
    const members2 = $gameParty.members();
    for (let i = 0; i < members2.length; i++) {
      const actor = members2[i];
      passive_addCondition(actor);
      title_battleUp(actor);
      actor.refresh();
    }
  };

  //=============================================================================
  // Scenes / quests / misc
  //=============================================================================

  // Replaces (~21x):
  //   original_scene(0,<subId>);
  //   this.wait(valuePicWait2);
  AGH_originalSceneAndWait = function (interp, subId) {
    original_scene(0, subId);
    interp.wait(valuePicWait2);
  };

  // Replaces (~18x):
  //   valueSPBuyCountSet1 = <count>;
  //   valueSPBuyCountSet2 = <itemId>;
  //   item_oneOffBuy(1,valueSPBuyCountSet1,valueSPBuyCountSet2,<kind>);
  AGH_oneOffBuy = function (count, itemId, kind) {
    item_oneOffBuy(1, (valueSPBuyCountSet1 = count), (valueSPBuyCountSet2 = itemId), kind);
  };

  // Replaces (~12x):
  //   $gameSwitches.setValue(<questSwitch>,true);
  //   quest_housyuu(<questId>,1);
  //   $gameSwitches.setValue(<questSwitch>,false);
  AGH_questReward = function (questSwitch, questId) {
    $gameSwitches.setValue(questSwitch, true);
    quest_housyuu(questId, 1);
    $gameSwitches.setValue(questSwitch, false);
  };

  // Replaces (10x): player transfer from saved return-position variables.
  //   var value = <slot>;
  //   var value1..3 = $gameVariables.value(value)[0..2];
  //   if(value1 >= 1){ transfer(saved) } else { transfer(default) }
  AGH_warpFromSave = function (slot) {
    let savedPos = $gameVariables.value(slot);
    if (!Array.isArray(savedPos)) savedPos = [];
    const mapId = savedPos[0];
    const mapX = savedPos[1];
    const mapY = savedPos[2];
    if (mapId >= 1) {
      $gamePlayer.reserveTransfer(mapId, mapX, mapY, 2, 2);
    } else {
      $gamePlayer.reserveTransfer(14, 2, 2, 2, 2);
    }
  };

  //=============================================================================
  // Party arrangement / return-to-scene processing (common event 54 family)
  //=============================================================================

  // Replaces (115x):
  //   event_PlayerArrangement($gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX));
  //   this.setupChild($dataCommonEvents[54].list, 0);
  CEH_arrangePartyAndCall54 = function (interp) {
    event_PlayerArrangement($gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX));
    interp.setupChild($dataCommonEvents[54].list, 0);
  };

  // Replaces (37x / 18x):
  //   $gameVariables.setValue(HELPER_VARIABLE.EVENT_DESTINATION,0);              <- or [18,26,2]
  //   $gameVariables.setValue(528,100);
  //   this.setupChild($dataCommonEvents[54].list, 0);
  CEH_sceneReturnSetup = function (interp, val171) {
    $gameVariables.setValue(528, 100);
    CEH_sceneReturnKeepCount(interp, val171);
  };

  // Replaces (11x):
  //   $gameVariables.setValue(HELPER_VARIABLE.EVENT_DESTINATION,[20,5,2]);
  //   this.setupChild($dataCommonEvents[54].list, 0);
  // Same as CEH_sceneReturnSetup but without resetting variable 528.
  CEH_sceneReturnKeepCount = function (interp, val171) {
    startSceneReturn(interp, val171);
  };

  //=============================================================================
  // Spawned-event bookkeeping (variable 292 spawn id list)
  //=============================================================================

  // Replaces (88x):
  //   var value1 = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
  //   this._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1];
  // and (34x):
  //   var value1 = 11;//$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
  //   this._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1];
  //
  // NOTE: this helper was previously defined twice in this file. The second
  // definition read $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS) directly and so threw whenever the
  // variable had not been initialised to an array yet, and it also dropped the
  // `|| 0` fallback, leaving _eventId undefined for an empty slot. The single
  // definition below keeps the guarded accessor and the fallback.
  CEH_setEventIdFromSpawnList = function (interp, slot) {
    interp._eventId = AGH_spawnIdList()[slot] || 0;
  };

  // Replaces (18x):
  //   $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS,Array(21).fill(0));
  CEH_clearSpawnList = function () {
    $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
  };

  // Replaces (17x):
  //   for (var i = 0; i <= $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS).length-1; i++) {
  //     ...
  //   };
  CEH_eraseAllSpawnedEvents = function () {
    const spawnIdList = AGH_spawnIdList();
    for (let i = 0; i <= spawnIdList.length - 1; i++) {
      const id = spawnIdList[i];
      if (id < 1 || !$gameMap.event(id) || $gameParty.inBattle()) {
        continue;
      }
      $gameMap.eraseEvent(id);
    }
  };

  // Replaces (17x):
  //   if(this._eventId >= 1){
  //     valueThisEventId = this._eventId;
  //   } else {
  //     valueThisEventId = 0;
  //   };
  CEH_storeThisEventId = function (interp) {
    valueThisEventId = interp._eventId >= 1 ? interp._eventId : 0;
  };

  // Replaces (21x):
  //   if(valueThisEventId >= 1){this._eventId = valueThisEventId};
  CEH_restoreThisEventId = function (interp) {
    if (valueThisEventId >= 1) {
      interp._eventId = valueThisEventId;
    }
  };

  // Replaces (11x):
  //   this._eventId = valueBossId;
  // Dead now, but was using before
  CEH_setEventIdToBoss = function (interp) {
    interp._eventId = valueBossId;
  };

  //=============================================================================
  // Respawn presets (main NPC / sub NPC combinations)
  //=============================================================================

  // Replaces (19x):
  //   var value1 = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
  //   event_respawnSetA(value1,14,34,1,4);
  //   this._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1];
  //   var value1 = 11;
  //   event_respawnSetN(value1,16,15,0,'npcUnique1',0,4);
  CEH_respawnMainNpcDefault = function (interp) {
    let spawnSlot;
    spawnSlot = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(spawnSlot, 14, 34, 1, 4);
    interp._eventId = AGH_spawnIdList()[spawnSlot] || 0;
    spawnSlot = 11;
    event_respawnSetN(spawnSlot, 16, 15, 0, "npcUnique1", 0, 4);
  };

  // Replaces (18x):
  //   var value1 = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
  //   var arr1 = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[$gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)];
  //   event_respawnSetA(value1,15,4,0,6);
  //   var event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1]);
  //   var value1 = 11;
  //   event_respawnSetN(value1,16,4,1,arr1[6],arr1[7],2);
  CEH_respawnSubNpcWithPreset = function (interp) {
    let spawnSlot;
    const presetList = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES);
    const npcPreset = Array.isArray(presetList)
      ? presetList[$gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)]
      : null;
    if (!npcPreset) return;
    spawnSlot = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(spawnSlot, 15, 4, 0, 6);
    spawnSlot = 11;
    event_respawnSetN(spawnSlot, 16, 4, 1, npcPreset[6], npcPreset[7], 2);
  };

  // Replaces (11x):
  //   var value1 = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
  //   var arr1 = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[$gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)];
  //   event_respawnSetA(value1,arr1[3],arr1[4],1);
  //   var event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1]);
  //   event.setImage(arr1[1], arr1[2]);
  //   event.setDirection(arr1[5]);
  //   this._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1];
  CEH_respawnSubNpcWithImage = function (interp) {
    const presetList = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES);
    const npcPreset = Array.isArray(presetList)
      ? presetList[$gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)]
      : null;
    if (!npcPreset) return;
    const spawnSlot = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(spawnSlot, npcPreset[3], npcPreset[4], 1);
    const event = $gameMap.event(AGH_spawnIdList()[spawnSlot]);
    if (event) {
      event.setImage(npcPreset[1], npcPreset[2]);
      event.setDirection(npcPreset[5]);
    }
    interp._eventId = AGH_spawnIdList()[spawnSlot] || 0;
  };

  // Replaces (11x):
  //   var value1 = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
  //   var arr1 = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[$gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)];
  //   event_respawnSetA(value1,arr1[3],arr1[4],1,arr1[5]);
  //   this._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1];
  //   var value1 = 11;
  //   event_respawnSetN(value1,arr1[8],arr1[9],0,arr1[6],arr1[7],arr1[10]);
  CEH_respawnSubNpcWithPresetArr = function (interp) {
    let spawnSlot;
    const presetList = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES);
    const npcPreset = Array.isArray(presetList)
      ? presetList[$gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)]
      : null;
    if (!npcPreset) return;
    spawnSlot = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(spawnSlot, npcPreset[3], npcPreset[4], 1, npcPreset[5]);
    interp._eventId = AGH_spawnIdList()[spawnSlot] || 0;
    spawnSlot = 11;
    event_respawnSetN(spawnSlot, npcPreset[8], npcPreset[9], 0, npcPreset[6], npcPreset[7], npcPreset[10]);
  };

  //=============================================================================
  // Camera work
  //=============================================================================

  // Replaces (19x):
  //   var value1 = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
  //   var value1 = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1];
  //   drowsepost.camera.zoom(1, 60, value1);
  CEH_zoomToPartySpawnedEvent = function () {
    const spawnSlot = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventId = AGH_spawnIdList()[spawnSlot] || 0;
    drowsepost.camera.zoom(1, 60, spawnedEventId);
  };

  // Replaces (17x):
  //   drowsepost.camera.zoom(1, 60, this._eventId);
  CEH_zoomToThisEvent = function (interp) {
    drowsepost.camera.zoom(1, 60, interp._eventId);
  };

  //=============================================================================
  // Screen / picture effects
  //=============================================================================

  // Replaces (102x):
  //   valuePic1 = 101;
  //   picture_fade1(valuePic1,"fadeOut",valueWipeImg,60,5);
  CEH_wipeFadeOut101 = function () {
    valuePic1 = 101;
    picture_fade1(101, "fadeOut", valueWipeImg, 60, 5);
  };

  // Replaces (16x):
  //   var value2 = 'ScreenBlackOut';
  //   $gameScreen.showPicture(51,value2,1,640,384,100,100,200,0);
  //   picture_fade1(51,"fadeIn",valueWipeImg,60,5);
  CEH_blackoutFadeIn = function () {
    const blackoutImageName = "ScreenBlackOut";
    $gameScreen.showPicture(51, blackoutImageName, 1, 640, 384, 100, 100, 200, 0);
    picture_fade1(51, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (13x):
  //   $gameSwitches.setValue(HELPER_SWITCH.LOOP_PICTURE_MOVEMENT,false);
  //   valueParallelPicSe1 = [0,0,0];
  //   valueParallelPicSe2 = [0,0,0];
  //   pic_setArray(0,0,0,0,0,0);
  //   picture_motion1("smooth",[0]);
  CEH_resetParallelPictureState = function () {
    $gameSwitches.setValue(HELPER_SWITCH.LOOP_PICTURE_MOVEMENT, false);
    valueParallelPicSe1 = [0, 0, 0];
    valueParallelPicSe2 = [0, 0, 0];
    pic_setArray(0, 0, 0, 0, 0, 0);
    picture_motion1("smooth", [0]);
  };

  //=============================================================================
  // Misc gameplay values
  //=============================================================================

  // Replaces (33x):
  //   $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID,$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX));//H主体ｱｸﾀｰID
  CEH_currentActorId = function () {
    $gameVariables.setValue(
      HELPER_VARIABLE.SELECTED_ACTOR_ID,
      $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX)
    ); // H主体ｱｸﾀｰID
  };

  // Replaces (24x):
  //   var arr1 = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[$gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)];
  //   $gameVariables.setValue(HELPER_VARIABLE.EVENT_DESTINATION,[arr1[0],arr1[3],arr1[4]]);
  CEH_setScenePosFromPreset = function () {
    const presetList = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES);
    const npcPreset = Array.isArray(presetList)
      ? presetList[$gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)]
      : null;
    if (!npcPreset) return;
    $gameVariables.setValue(HELPER_VARIABLE.EVENT_DESTINATION, [npcPreset[0], npcPreset[3], npcPreset[4]]);
  };

  // Replaces (13x):
  //   i1 = getRandomIndex(6) + 5;//人数
  //   i2 = getRandomIndex(10) + 11;//膣回数
  //   i3 = Math.floor( Math.random() * -5) + i1;//中だし回数
  //   i4 = getRandomIndex(5) + 6;//アナル回数
  //   i5 = Math.floor( Math.random() * -2) + i4;//中だし回数
  //   i6 = getRandomIndex(5) + 6;//フェラ回数
  //   i7 = Math.floor( Math.random() * -2) + i4;//口腔回数
  //   i8 = getRandomIndex(3) + 0;//失禁回数
  //
  // Returns the same eight counts as an {i1..i8} object so a JS caller does not
  // have to read them back out of globals.
  //
  // The random draws below are kept in their original order and count on
  // purpose: the RNG stream position after this call has to stay identical.
  // The i1..i8 globals are still assigned because the Script commands that
  // follow the call in the 13 common events read them by name.
  CEH_rollRandomHCounts = function () {
    const peopleCount = getRandomIndex(6) + 5; //人数
    const vaginaCount = getRandomIndex(10) + 11; //膣回数
    const creampieVaginaCount = Math.floor(Math.random() * -5) + peopleCount; //中出し回数
    const anusCount = getRandomIndex(5) + 6; //アナル回数
    const creampieAnusCount = Math.floor(Math.random() * -2) + anusCount; //中出し回数
    const oralCount = getRandomIndex(5) + 6; //フェラ回数
    const creampieOralCount = Math.floor(Math.random() * -2) + anusCount; //口腔回数
    const incontinenceCount = getRandomIndex(3) + 0; //失禁回数

    i1 = peopleCount;
    i2 = vaginaCount;
    i3 = creampieVaginaCount;
    i4 = anusCount;
    i5 = creampieAnusCount;
    i6 = oralCount;
    i7 = creampieOralCount;
    i8 = incontinenceCount;

    return {
      i1: peopleCount,
      i2: vaginaCount,
      i3: creampieVaginaCount,
      i4: anusCount,
      i5: creampieAnusCount,
      i6: oralCount,
      i7: creampieOralCount,
      i8: incontinenceCount
    };
  };

  // Replaces (11x):
  //   var value1 = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
  //   var value1 = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1];
  //   event_partyCharaMove(45,"this.turnTowardCharacter($gameMap.event("+value1+"));");
  CEH_turnPartyTowardSpawnedEvent = function () {
    const spawnSlot = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventId = AGH_spawnIdList()[spawnSlot] || 0;
    event_partyCharaMove(45, "this.turnTowardCharacter($gameMap.event(" + spawnedEventId + "));");
  };

  // Replaces (11x):
  //   this.sVal(172,7);//会話途中顔グラ。
  //   $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID,1);
  //   valueFaceSelect = 8;
  CEH_faceSelectMidTalk = function (interp) {
    $gameVariables.setValue(172, 7); //会話途中顔グラ。
    $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID, 1);
    valueFaceSelect = 8;
  };

  //=============================================================================
  // Event Script blocks migrated out of data/CommonEvents.json + data/Map*.json
  //----------------------------------------------------------------------------
  // RPG Maker splits a multi-line Script command into several CONSECUTIVE
  // 355/655 commands, so the same few snippets were copy-pasted all over the
  // event data (273 blocks across 78 distinct snippets). Each one is now a single
  // call to a function below; the per-event differences are arguments.
  //
  // These helpers deliberately write the same implicit globals the snippets
  // wrote (valuePic1, valueBossId, valueCountSet*, valueTalkSet, ...), because
  // the Show Picture / Move Picture commands that follow in the editor read
  // those globals.
  //=============================================================================

  // Replaces (62x): $gameSystem.vnChoices = true|false;
  AGH_setVisualNovelChoices = function (enabled) {
    $gameSystem.vnChoices = enabled;
  };

  // Replaces (87x): event_charaPreset(id); event_charaRoot(id);
  AGH_event_charaPrepChara = function (eventId) {
    event_charaPreset(eventId);
    event_charaRoot(eventId);
  };

  // Replaces (25x): valueBossId = id; event_charaPreset(id); event_charaRoot(id);
  CEH_bossMarkAndCharaPrep = function (eventId) {
    valueBossId = eventId;
    AGH_event_charaPrepChara(eventId);
  };

  // Replaces (26x): event_charaPreset/Root + page variable -> event_pararelStarting
  CEH_mapEventParallelStart = function (eventId) {
    AGH_event_charaPrepChara(eventId);
    const pageVariable = $dataMap.events[eventId].pages[0].conditions.variableValue;
    event_pararelStarting(0, pageVariable + 301, eventId);
  };

  // Replaces (18x): var value1 = `text`; CommonPopupManager.showInfo({},value1,null);
  AGH_popupInfo = function (text) {
    CommonPopupManager.showInfo({}, text, null);
  };

  // Replaces (8x): var value1 = `text`; TickerManager.show(value1);
  AGH_tickerInfo = function (text) {
    TickerManager.show(text);
  };

  // Replaces (21x): valueBossAddLevel = 0; valueEnemyAddLevel = 0;
  CEH_clearBossAddLevels = function () {
    valueBossAddLevel = 0;
    valueEnemyAddLevel = 0;
  };

  // Replaces (5x): value = $dataItems[$gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID)]; popEnemy_setUp(value);
  CEH_popEnemySetUp = function () {
    const dungeonItem = $dataItems[$gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID)];
    popEnemy_setUp(dungeonItem);
  };

  // Replaces (10x): valueEnemyEventId = this.eventId(); this.sVal(21,this.eventId());
  CEH_storeEnemyEventId = function (interp) {
    valueEnemyEventId = interp.eventId();
    $gameVariables.setValue(21, interp.eventId());
  };

  // Replaces (9x): this._eventId = valueBossId; CEH_storeThisEventId(this); pic_erase(0);
  CEH_restoreBossEvent = function (interp) {
    interp._eventId = valueBossId;
    CEH_storeThisEventId(interp);
    pic_erase(0);
  };

  // Replaces (9x): self switch [mapId, eventId, 10] -> variable 21 as a grouped string
  AGH_selfSwitchValue10ToVar21 = function (interp) {
    const slotValue = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_1, slotValue.toLocaleString());
  };

  // Replaces (6x): same self switch -> shop_priceComparison(value,1,0)
  AGH_shopPriceComparisonFromSelfSwitch = function (interp) {
    const priceValue = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
    shop_priceComparison(priceValue, 1, 0);
  };

  // Replaces (9x): shop NPC naming + weapon reference + menu type
  AGH_setShopNpc = function (actorId, actorName, weaponName, menuTypeId) {
    $gameActors.actor(actorId).setName(actorName);
    $gameVariables.value(400)[59] = weaponName;
    valueCountSet1 = menuTypeId;
  };

  // Replaces (7x): valueCountSet1 = kindId; valueCountSet2 = targetId;
  AGH_setCountSetPair = function (kindId, targetId) {
    valueCountSet1 = kindId;
    valueCountSet2 = targetId;
  };

  // Replaces (7x): find the weapon flagged in variable 327 and warp to its
  // <HomePosition>. Falls back to weapon 22 when none is flagged.
  CEH_returnHomeWeaponPosition = function (interp) {
    let weaponId = 22;
    const baseActivationRecords = $gameVariables.value(HELPER_VARIABLE.BASE_ACTIVATION_RECORDS);
    for (let i = 1; i <= 100; i++) {
      if (!(baseActivationRecords[i] == 2)) continue;

      weaponId = i;
      break;
    }
    const homePosition = $dataWeapons[weaponId].meta["HomePosition"].split(",");
    $gameVariables.setValue(161, [Number(homePosition[0]), Number(homePosition[1]), Number(homePosition[2])]);
    CEH_sceneReturnSetup(interp, $gameVariables.value(161));
  };

  // Replaces (6x): $dataItems[clothPartsChoice].name = `...`;
  AGH_setClothPartsChoiceName = function (name) {
    $dataItems[clothPartsChoice].name = name;
  };

  // Replaces (6x): valuePic1 = picId; showPicture(640,384) + picture_fade1.
  // valuePic1 is still assigned because later commands read it.
  AGH_setPicAndFadeIn = function (pictureId, imageName, opacity) {
    valuePic1 = pictureId;
    $gameScreen.showPicture(pictureId, imageName, 1, 640, 384, 100, 100, opacity, 0);
    picture_fade1(pictureId, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (5x): showPicture + picture_fade1 at an explicit position.
  AGH_showPictureFadeIn = function (pictureId, imageName, x, y, scaleX, scaleY, opacity, fadeWait, moveWait) {
    $gameScreen.showPicture(pictureId, imageName, 1, x, y, scaleX, scaleY, opacity, 0);
    picture_fade1(pictureId, "fadeIn", valueWipeImg, fadeWait, moveWait);
  };

  // Replaces (6x): the one-line talk popup (common event 60).
  // NOTE: the original assigned valueTalkSet twice, the second assignment
  // overwriting the first with [0,0,0]. That looks like a leftover bug in the
  // event data, but it is preserved here on purpose so behaviour is identical;
  // if the intent was [mode, 250, eventId], delete the second line.
  AGH_openTalkWindow = function (interp, mode) {
    $gameVariables.setValue(172, 21);
    valueTalkSet = [mode, 250, interp._eventId];
    valueTalkSet = [0, 0, 0];
    interp.setupChild($dataCommonEvents[60].list, 0);
  };

  // Replaces (6x): clear the particle attached to this event.
  AGH_clearEventParticle = function (interp, particlePrefix) {
    const particleName = particlePrefix + "-" + interp._eventId;
    $gameScreen._particle.particleClear(particleName);
  };

  // Replaces (4x): this._eventId = id; drowsepost.camera.zoom(mode, 60, this._eventId);
  CEH_focusEventAndZoom = function (interp, eventId, zoomMode) {
    interp._eventId = eventId;
    drowsepost.camera.zoom(zoomMode, 60, interp._eventId);
  };

  // Replaces (4x): open the quest board for the <QuestSet> item on this event.
  AGH_openQuestSetForThisEvent = function (interp) {
    valueCountSet1 = Number($gameMap.event(interp._eventId).event().meta["QuestSet"]);
    quest_singleJutyuu(valueCountSet1);
  };

  // Replaces (4x): respawn a main NPC into a party slot, then make the
  // interpreter act on the event that was just created.
  CEH_respawnMainNpcAndTarget = function (interp, slot, x, y, zoomFlag, direction) {
    event_respawnSetA(slot, x, y, zoomFlag, direction);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[slot];
  };
  //=============================================================================
  // Event Script blocks migrated out of data/CommonEvents.json + data/Map*.json
  // (second pass: whole-run blocks that were still inline)
  //----------------------------------------------------------------------------
  // Each block was one 355 plus its contiguous 655 lines, and its whole content
  // was a single repeatable pattern. Interpreter context is passed explicitly
  // as `interp` because event-script `this` is the Game_Interpreter.
  //=============================================================================

  // Replaces (21x): build the three one-line arrays inline, then chara_oneWord.
  AGH_charaOneWord = function (pictureId, eventId, textPicId, AGH_waitFrames, randX, randY, lines) {
    chara_oneWord(pictureId, eventId, textPicId, AGH_waitFrames, [randX], [randY], lines);
  };

  // Replaces (5x): spawn the summons-boss event, register it in slot 12 and
  // start the boss intro CG + animation.
  AGH_summonBossCharaGura = function (x, y, imageName, cgWidth, cgHeight, animScale, animId) {
    const slot = 12;
    $gameMap.spawnEvent(192, x, y, true);
    const eventId = $gameMap.getLastSpawnEventId();
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    spawnedEventIds[slot] = eventId;
    const event = $gameMap.event(spawnedEventIds[slot]);
    event._priorityType = 2;
    valueBossCharaGura = [spawnedEventIds[slot], imageName, cgWidth, cgHeight, animScale];
    boss_charaGuraCGSet(valueBossCharaGura);
    event.requestAnimation(animId);
  };

  // Replaces (6x): rebuild both the main and the sub NPC from the scene preset
  // held in variable 163, then wipe the screen.
  CEH_respawnSubNpcFromScenePreset = function (interp) {
    const mainSlot = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const preset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(mainSlot, preset[3], preset[4], 1);
    let event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[mainSlot]);
    event.setImage(preset[1], preset[2]);
    event.setDirection(preset[5]);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[mainSlot];
    const subSlot = 11;
    event_respawnSetN(subSlot, preset[8], preset[9], 0, preset[6], preset[7]);
    event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[subSlot]);
    event.setDirection(preset[10]);
    CEH_wipeFadeOut101();
  };

  // Replaces (5x): the goods-drag sprite, whose ids and image names were fixed.
  AGH_showGoodsDragSprite = function () {
    let pictureId = 55;
    valuePic1 = pictureId;
    valueScenePic = "Goods_drag1_";
    $gameScreen.setPicturesAnimation(2, 10, "連番", 20);
    pictureId = pictureId + 4;
    const imageName = valueScenePic + "05_00";
    $gameScreen.showPicture(pictureId, imageName, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    if ($gameScreen.picture(pictureId)) {
      $gameScreen.picture(pictureId).startAnimationFrame(1, true, [1, 1, 1, 2]);
    }
  };

  // Replaces (4x): this._eventId = valueEnemyEventId;
  CEH_setEventIdFromEnemyEvent = function (interp) {
    interp._eventId = valueEnemyEventId;
  };

  // Replaces (4x): a custom label stored in a data-system switch slot.
  AGH_setDataSystemLabel = function (index, label) {
    $dataSystem.switches[index] = label;
  };

  //=============================================================================
  // Debug / authoring support (common event 52, "ファイルチェック用スクリプト")
  //=============================================================================

  // Shows every database entry that carries the given meta tag as a picture,
  // so an author can eyeball whether the tag resolves to a real graphic.
  //
  // Replaces (7x): an 11-line inline loop over $dataEnemies / $dataItems that
  // differed only in which meta tag it read, which comma field it took, and
  // which image folder it prefixed:
  //   var value2 = 'BossEnemy';
  //   var valueItems = $dataEnemies; var end = valueItems.length - 1;
  //   var j = 1;
  //   for (var i = 1; i <= end; i++) {
  //     if (valueItems[i].meta[value2]) {
  //       var value1 = valueItems[i].meta[value2].split(',')[2];
  //       var value1 = '/img/sv_enemies/' + value1;
  //       console.log(`${i}  ${value1}`);
  //       $gameScreen.showPicture(j, value1, 1, 640-128, 384, 100, 100, 255, 0);
  //       j += 1;
  //     }
  //   }
  AGH_previewMetaTaggedPictures = function (database, metaKey, fieldIndex, pathPrefix) {
    const end = database.length - 1;
    let pictureId = 1;
    for (let i = 1; i <= end; i++) {
      const metaValue = database[i].meta[metaKey];
      if (!metaValue) continue;
      const imageName = pathPrefix + metaValue.split(",")[fieldIndex];
      //console.log(`${i}  ${imageName}`);
      $gameScreen.showPicture(pictureId, imageName, 1, 640 - 128, 384, 100, 100, 255, 0);
      pictureId += 1;
    }
  };

  //=============================================================================
  // Boss victory aftermath (common events 356-363)
  //=============================================================================

  // Shared post-boss bookkeeping. Every boss common event ends with this
  // sequence; only the memo item id and the objective text differ.
  //
  // Replaces (8x):
  //   this.sVal(530, 1);                                 // 主格キャラ
  //   this.sVal(535, <itemId>);                          // 挿話回想の場合アイテムID
  //   valueWeatherSceneSet = 0;
  //   $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
  //   $gameVariables.setValue(HELPER_VARIABLE.QUEST_HINT, `<objective text>`);
  AGH_bossVictoryAftermath = function (interp, memoItemId, objectiveText) {
    $gameVariables.setValue(530, 1);
    $gameVariables.setValue(535, memoItemId);
    valueWeatherSceneSet = 0;
    $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    $gameVariables.setValue(HELPER_VARIABLE.QUEST_HINT, objectiveText);
  };

  // --------------------------------------------------------------------------
  // Opens an H scene: picture slot, scene-art prefix, memo item, record id, weather.
  // The "汎用" family also re-reads variable 530 into variable 20; the "陵辱"
  // family does not, which is why syncActorVariable is a parameter.
  // Replaces (5x) the common opening sequence.
  // --------------------------------------------------------------------------
  AGH_hSceneSetup = function (
    interp,
    pictureId,
    scenePicPrefix,
    mainCharId,
    memoItemId,
    recordId,
    weatherSceneSet,
    syncActorVariable
  ) {
    // The 陵辱 family never assigned valuePic1 in the original, so a null picId
    // must leave the existing value alone rather than overwrite it with null.
    if (pictureId != null) {
      valuePic1 = pictureId;
    }
    valueScenePic = scenePicPrefix;
    $gameVariables.setValue(530, mainCharId);
    $gameVariables.setValue(535, memoItemId);
    h_keikenhyouji1(521, recordId);
    valueWeatherSceneSet = weatherSceneSet;
    if (syncActorVariable) {
      $gameVariables.setValue(
        HELPER_VARIABLE.SELECTED_ACTOR_ID,
        $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX)
      );
    }
  };

  // --------------------------------------------------------------------------
  // Applies the standard H-scene experience bundle: the base gain, a random
  // message, and the four h_exp channels. Only the h_exp3 gain vector differs
  // between scenes, so it is passed through as an argument array.
  // Replaces (4x).
  // --------------------------------------------------------------------------
  AGH_hSceneExperience = function (interp, exp3Args) {
    h_exp(
      $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID),
      valueScenePic + "99",
      valueScenePartnerId,
      false,
      false,
      false
    );
    $gameVariables.setValue(401, getRandomIndex(11) + 20);
    const actor1 = `\\V[94]`;
    const actor2 = `\\V[22]`;
    $gameVariables.setValue(506, `${actor1}は${actor2}とセックスした…。`);
    h_exp1(1, 1, 0, 0, 0, 1);
    h_exp2(1, 0, 0, 0, 0, 0);
    h_exp3.apply(null, exp3Args);
    h_exp4(5, 0, 0, 5, 0, 5, 0, 1, 0);
    interp.setupChild($dataCommonEvents[85].list, 0);
  };

  // --------------------------------------------------------------------------
  // Claims post-battle spoils when the party holds enough, otherwise raises the
  // shortage ticker and sets switch 380 so the caller can retry later.
  // Replaces (2x) in the two loot events.
  // --------------------------------------------------------------------------
  AGH_warLootPickup = function (interp, itemId, count, popupLabel) {
    $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, false);
    const itemData = $dataItems[itemId];
    if ($gameParty.numItems(itemData) >= count) {
      $gameParty.loseItem(itemData, count);
      interp.addPopup(["add", "text:" + popupLabel]);
    } else {
      const itemName = itemData.name;
      TickerManager.show(`${itemName}が${count}枚必要です`);
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
    }
  };

  // --------------------------------------------------------------------------
  // Shows a tips popup via the shared talk common event. pictureLayout is the
  // literal [image,x,y,scaleX,scaleY,opacity] array the source built inline.
  // Replaces (2x) in the prologue-end common event.
  // --------------------------------------------------------------------------
  AGH_showTipPopup = function (interp, title, pictureLayout) {
    $gameVariables.setValue(172, 2);
    const mode = 0;
    valueTalkSet = [title, mode, pictureLayout];
    interp.setupChild($dataCommonEvents[60].list, 0);
  };

  // =========================================================================
  // Field drop roll (common events 187 / 188 / 196)
  // =========================================================================

  // Rolls the field drop for the current enemy and applies the matching
  // proficiency gain. The candidate index list is created here rather than by the
  // caller: the original relied on a bare `arr4 = []` (an implicit global that is
  // read nowhere else) or on `var arr4` hoisted into a one-shot eval scope, so the
  // accumulator was always fresh per invocation. Making it a local here preserves
  // that and keeps the global out of the picture entirely.
  //
  // drop_genericDropRate still writes the legacy valueDropItems global for older
  // call sites; we use its return value instead of reading the global back.
  AGH_fieldDropItemId = function (skillId) {
    const itemToDropIndexes = drop_enemyDropRate(0, null);
    const valueDropItemIndex = drop_genericDropRate(0, itemToDropIndexes);

    //熟練度上昇拾得物。
    //スキルid、アイテム種別3お金0アイテム1武器2防具、金額orアイテムID
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, 0);
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_3, valueDropItemIndex);
    item_getSkillLevel(skillId, 0, valueDropItemIndex);

    return valueDropItemIndex;
  };

  //=============================================================================
  // State notetag effects (data/states.json <Custom Apply Effect> /
  // <Custom Remove Effect>)
  //----------------------------------------------------------------------------
  // YEP_BuffsStatesCore runs each of those notetag bodies through a *direct*
  // `eval` inside Game_Battler.prototype.customEffectEval, so a body can see:
  //
  //   this === user === target === the battler the state sits on
  //   stateId                       the state being applied / removed
  //   a, origin, s, v              plugin aliases (unused by any body here)
  //
  // The bodies were moved out of the database into the functions below and are
  // invoked as a single call from the notetag, e.g.
  //
  //   <Custom Apply Effect>
  //   AGH_stateApplyPoisonStack(user,target,stateId);
  //   </Custom Apply Effect>
  //
  // Two details make the move behaviour-preserving:
  //   * the plugin still wraps the call in its try/catch, so a failure is still
  //     reported as "CUSTOM STATE <id> CODE ERROR" with the same granularity;
  //   * `var` declarations inside the eval'd body were local to
  //     customEffectEval anyway (sloppy-mode direct eval hoists them into the
  //     calling function's variable environment), so nothing leaked to globals
  //     before and nothing leaks now.
  //
  // Where several states shared one body the body is parameterised instead of
  // duplicated, and the generic `value1..value9` / `arr1..arr9` locals were
  // renamed after what they actually hold.
  //
  // The state ids below are only documentation - every function is driven by
  // the stateId it is handed at runtime.
  //=============================================================================

  // --- Collapse / death -------------------------------------------------------

  // Replaces (1x, state 1 戦闘不能): a unit that carries state 390 and still has
  // 30% MP is revived instead of collapsing; otherwise the enemy drop roll runs
  // and, when a special collapse animation has already wiped the troop, the
  // surviving lead member is faded out.
  AGH_stateApplyCollapse = function (user, target, stateId) {
    if (user.isStateAffected(390) && user.mpRate() >= 0.3) {
      user.removeState(stateId);
      const reviveHp = Math.ceil(user.mmp * 0.3);
      user.gainHp(reviveHp);
      const reviveMpCost = Math.ceil(user.mmp * 0.3);
      user.gainMp(-reviveMpCost);
      user.startDamagePopup();
      user.clearResult();
      user.startAnimation(436, false, 0);
    } else {
      if (user.isEnemy()) {
        enemy_dropSelection(user);
      }
      if (valueCollapseAnime >= 1 && user.isEnemy()) {
        if ($gameTroop.aliveMembers().length == 0) {
          const members2 = $gameTroop.members();
          members2[0].spriteOpacity(0, 120);
          pic_eraseP(0, [51, 52, 53, 54, 55, 56, 57]);
          members2[0].startAnimation(valueCollapseAnime, false, 40);
        }
      }
    }
  };

  // Replaces (1x, state 38 即死): instant death, guarded so that an already
  // collapsed target is not killed twice.
  AGH_stateApplyInstantDeath = function (user, target, stateId) {
    if (!(!target.isStateAffected(1) && $gameParty.inBattle())) return;

    state_applyCommonEffect(user, target, stateId, 260);
    const targetName = target.name();
    const stateName = $dataStates[stateId].name;
    BattleManager._logWindow.push("addText", `${targetName}に${stateName}が発動した！`);
    target.gainHp(-999999);
    target.addState(1);
  };

  // Replaces (4x, states 411 ボス / 412 大ボス / 413 ラスボス / 414 真のボス):
  // picks the collapse animation a dying boss uses and, for everything above
  // the plain ボス tier, also grants state 289 敵者適合.
  //
  // respectState436 mirrors the database: states 411/412 only overwrote
  // valueCollapseAnime while state 436 人類種 was absent, while 413/414
  // assigned it unconditionally.
  AGH_stateApplyBossCollapse = function (user, target, animeId, respectState436, addSacredState) {
    if (!respectState436 || !target.isStateAffected(436)) {
      valueCollapseAnime = animeId;
    }
    if (addSacredState) {
      user.addState(289);
    }
  };

  // --- Counter ladders --------------------------------------------------------

  // Replaces (1x, state 4 毒): poison stacks; the fifth application is converted
  // into state 12 猛毒 and the counter is cleared.
  AGH_stateApplyPoisonStack = function (user, target, stateId) {
    if (!$gameParty.inBattle()) return;

    state_applyCommonEffect(user, target, stateId, 261);
    if (target._stateCounter[stateId] >= 5) {
      target.addState(12);
      target.removeStateCounter(stateId);
      target.removeState(stateId);
    } else {
      if (target._stateCounter[stateId] >= 1) {
        target.addStateCounter(stateId, +1);
      } else {
        target.setStateCounter(stateId, 1);
      }
    }
  };

  // Fatigue tiers of state 32: each tier swaps the previous tier state for the next
  // one and the black tier (37) also drops the fatigue state itself.
  const FATIGUE_TIER_FIRST_STATE_ID = 32;
  const FATIGUE_TIERS = [
    { threshold: 5, stateId: 37, removesOwnState: true },
    { threshold: 4, stateId: 36, removesOwnState: false },
    { threshold: 3, stateId: 35, removesOwnState: false },
    { threshold: 2, stateId: 34, removesOwnState: false },
    { threshold: 1, stateId: 33, removesOwnState: false }
  ];

  // Replaces (1x, state 31 疲労操作用非表示): five-step fatigue ladder
  // 32 疲労(小) -> 37 疲労(ブラック).
  AGH_stateApplyFatigueTier = function (user, target, stateId) {
    state_applyCommonEffect(user, target, stateId, 261);
    const counter = target._stateCounter[stateId];
    const tier = FATIGUE_TIERS.find(function (candidate) {
      return counter >= candidate.threshold;
    });
    if (!tier) {
      target.setStateCounter(stateId, 1);
      target.addState(FATIGUE_TIER_FIRST_STATE_ID);
      return;
    }
    target.addState(tier.stateId);
    target.removeState(tier.stateId - 1);
    // Only the black tier drops the fatigue state itself.
    if (tier.removesOwnState) target.removeState(stateId);
    target.addStateCounter(stateId, +1);
  };

  // Replaces (1x, state 31 疲労操作用非表示): tears the whole fatigue ladder down.
  AGH_stateRemoveFatigueTier = function (user, target, stateId) {
    state_removeCommonEffect(user, target, stateId, 262);
    target.removeState(stateId);
    target.setStateCounter(stateId, 0);
    target.removeState(32);
    target.removeState(33);
    target.removeState(34);
    target.removeState(35);
    target.removeState(36);
  };

  // Replaces (1x, state 42 呪苛): five applications upgrade to stateId+1.
  AGH_stateApplyCurseTorment = function (user, target, stateId) {
    state_applyCommonEffect(user, target, stateId, 261);
    if (target._stateCounter[stateId] >= 5) {
      target.addState(stateId + 1);
      target.removeState(stateId);
    } else {
      if (target._stateCounter[stateId] >= 1) {
        target.addStateCounter(stateId, +1);
      } else {
        target.setStateCounter(stateId, 1);
      }
    }
  };

  // Replaces (1x, state 42 呪苛): only play the removal effect when the upgraded
  // state is still on the target.
  AGH_stateRemoveCurseTorment = function (user, target, stateId) {
    if (target.isStateAffected(stateId + 1)) {
      state_removeCommonEffect(user, target, stateId, 262);
    }
  };

  // Replaces (3x, states 44 恐怖 / 45 恐慌 / 46 狂乱): if a stronger tier of the
  // same family is already active the incoming state is not stacked but
  // escalated straight to stateId+1; otherwise it stacks up to five and then
  // escalates. higherTierCount is how many tiers above this one the family has
  // (3 / 2 / 1 for 44 / 45 / 46).
  AGH_stateApplyEscalatingTier = function (user, target, stateId, higherTierCount) {
    const higherTierIds = [];
    for (let tier = 1; tier <= higherTierCount; tier++) {
      higherTierIds.push(stateId + tier);
    }
    if (
      higherTierIds.some(function (id) {
        return target.isStateAffected(id);
      })
    ) {
      target.addState(stateId + 1);
      target.removeState(stateId);
    } else {
      state_applyCommonEffect(user, target, stateId, 261);
      if (target._stateCounter[stateId] >= 5) {
        target.addState(stateId + 1);
        target.removeState(stateId);
      } else {
        if (target._stateCounter[stateId] >= 1) {
          target.addStateCounter(stateId, +1);
        } else {
          target.setStateCounter(stateId, 1);
        }
      }
    }
  };

  // Replaces (3x, states 44 恐怖 / 45 恐慌 / 46 狂乱): the escalation counterpart.
  //
  // NOTE: the condition is the *opposite* of AGH_stateRemoveCurseTorment /
  // AGH_stateRemoveStanceUpgrade - the database wrote
  //   if([higher tiers].some(...)) {} else { <removal effect> }
  // so the removal effect only plays when the state really expired rather than
  // being swallowed by an escalation. higherTierCount is 3 / 2 / 1.
  AGH_stateRemoveEscalatingTier = function (user, target, stateId, higherTierCount) {
    const higherTierIds = [];
    for (let tier = 1; tier <= higherTierCount; tier++) {
      higherTierIds.push(stateId + tier);
    }
    if (
      !higherTierIds.some(function (id) {
        return target.isStateAffected(id);
      })
    ) {
      state_removeCommonEffect(user, target, stateId, 262);
    }
  };

  // Replaces (2x, states 402 超覚醒 / 403 限界超越): drops the weaker
  // abnormal-state tiers below this one and re-registers the normal-abnormal
  // class. lowerTierCount is 1 / 2 for 402 / 403.
  AGH_stateApplyAwakeningTier = function (user, target, stateId, lowerTierCount) {
    for (let tier = 1; tier <= lowerTierCount; tier++) {
      if (target.isStateAffected(stateId - tier)) {
        target.removeState(stateId - tier);
      }
    }
    abNomal_Clear(target, target, stateId, 2);
  };

  // Brave Command: one counter index of state 274 per command, each command state is
  // handed to the listed recipients. memberList() is called per rule on purpose.
  const BRAVE_COMMAND_RULES = [
    { counterIndex: 0, commandStateId: 663, memberList: function () { return $gameParty.battleMembers(); } },
    { counterIndex: 1, commandStateId: 664, memberList: function () { return $gameParty.battleMembers(); } },
    { counterIndex: 2, commandStateId: 665, memberList: function () { return $gameTroop.members(); } },
    { counterIndex: 3, commandStateId: 666, memberList: function () { return $gameParty.battleMembers(); } }
  ];

  // Replaces (1x, state 662 ブレイブコマンド): distributes the four command
  // counters recorded on the caster to the matching party / enemy members, then
  // consumes the state.
  //
  // NOTE: the counter is re-read from target._stateCounter on every line on
  // purpose. When the target is itself a party member, the
  // actor.setStateCounter(...) inside the loops overwrites the array, and the
  // original observed that overwrite; caching the array first would change the
  // result.
  AGH_stateApplyBraveCommand = function (user, target, stateId) {
    state_applyCommonEffect(user, target, stateId, 274);
    const commandCounters = target._stateCounter[stateId];
    if (!commandCounters || !(commandCounters[0] >= 0)) {
      target.setStateCounter(stateId, [0, 0, 0, 0]);
      return;
    }
    // The counters are read again per rule on purpose: a recipient may be the target,
    // so applying one command can change the counters of the following ones.
    BRAVE_COMMAND_RULES.forEach(function (rule) {
      if (!(target._stateCounter[stateId][rule.counterIndex] >= 1)) return;
      applyBraveCommandToMembers(
        target,
        stateId,
        rule.counterIndex,
        rule.commandStateId,
        rule.memberList()
      );
    });
    target.removeState(stateId);
    target.removeStateCounter(stateId);
    target.addCooldown(217, 5);
  };

  // Replaces (4x, states 663 強化号令 / 664 攻撃号令 / 665 弱体号令 / 666 回復号令):
  // rebuilds the state's trait set for the stored counter value, then runs the
  // shared add effect.
  AGH_stateApplyCommandOrder = function (user, target, stateId) {
    traitBattle_changeSetting(user, stateId, user._stateCounter[stateId]);
    state_applyCommonEffect(user, target, stateId, 274);
  };

  // Replaces (4x, states 663-666): the removal counterpart.
  AGH_stateRemoveCommandOrder = function (user, target, stateId) {
    state_removeCommonEffect(user, target, stateId, 275);
    user.removeStateCounter(stateId);
  };

  // --- Flat stat / damage conversions -----------------------------------------

  // Replaces (1x, state 157 魔装): turns MAT into a flat Atk/Def/Mdf/Agi/Luk
  // bonus and remembers the granted amount in the state counter.
  AGH_stateApplyMagicArmor = function (user, target, stateId) {
    let masteryMultiplier = 1 + (user.skillMasteryLevel(307) / 100) * 2;
    if (masteryMultiplier == 0) {
      masteryMultiplier = 1;
    }
    const statBonus = Math.round((user.mat / 100) * 20 * masteryMultiplier);
    user.setStateCounter(stateId, statBonus);
    user.addAtk(statBonus);
    user.addDef(statBonus);
    user.addMdf(statBonus);
    user.addAgi(statBonus);
    user.addLuk(statBonus);
    const popupText = "Atk/Def/Dex/Agi/Luk20%up!";
    target.startMessagePopup(popupText, [255, 0, 0, 255, 0, 256]);
    state_applyCommonEffect(user, target, stateId, 271);
  };

  // Replaces (1x, state 157 魔装): gives the stored bonus back.
  AGH_stateRemoveMagicArmor = function (user, target, stateId) {
    if (user.getStateCounter(stateId) >= 1) {
      const statBonus = user.getStateCounter(stateId);
      user.minusAtk(statBonus);
      user.minusDef(statBonus);
      user.minusMdf(statBonus);
      user.minusAgi(statBonus);
      user.minusLuk(statBonus);
      const popupText = "Atk/Def/Dex/Agi/Luk20%Down…";
      target.startMessagePopup(popupText, [255, 0, 187, 189, 0, 256]);
    }
    user.removeStateCounter(stateId);
    state_removeCommonEffect(user, target, stateId, 272);
  };

  // Replaces (1x, state 895 デストロイ・フォーム): converts the unit's current DEF
  // into ATK and remembers how much was moved.
  AGH_stateApplyDestroyForm = function (user, target, stateId) {
    const convertedDef = user.def;
    user.setStateCounter(stateId, convertedDef);
    user.addAtk(convertedDef);
    user.minusDef(convertedDef);
    state_applyCommonEffect(user, target, stateId, 274);
  };

  // Replaces (1x, state 895 デストロイ・フォーム): moves the DEF back.
  AGH_stateRemoveDestroyForm = function (user, target, stateId) {
    if (user.getStateCounter(stateId) >= 1) {
      const convertedDef = user.getStateCounter(stateId);
      user.minusAtk(convertedDef);
      user.addDef(convertedDef);
    }
    user.removeStateCounter(stateId);
    state_removeCommonEffect(user, target, stateId, 275);
  };

  // Replaces (1x, state 155 ファルサス・ガード): pays the accumulated counter out
  // as direct damage when the guard drops, then logs the amount.
  //
  // BUGFIX: the database body called `this.changeHp(user, -value1, true)`.
  // changeHp only ever existed on Game_Interpreter, never on Game_Battler, so
  // every removal of state 155 threw a TypeError that the plugin's try/catch
  // swallowed - the stored damage was never dealt and the two lines after it
  // never ran. The body below reproduces Game_Interpreter.changeHp(target,
  // value, allowDeath) semantics on the battler instead.
  AGH_stateRemoveFalSasGuard = function (user, target, stateId) {
    const accumulatedDamage = user.getStateCounter(stateId);
    if (user.isAlive()) {
      user.gainHp(-accumulatedDamage);
      if (user.isDead()) user.performCollapse();
    }
    const userName = user.name();
    const stateName = $dataStates[stateId].name;
    const damage = `\\C[10]${accumulatedDamage}\\C[0]`;
    const logText = `${userName}の${stateName}が解除！ 蓄積ダメージ${damage}を受けた…`;
    BattleManager._logWindow.push("addText", logText);
    user.removeStateCounter(stateId);
    user.removeState(stateId);
  };

  // Replaces (1x, state 849 二王の諍い): one hit of damage per abnormal state on
  // the unit, then the state consumes itself.
  //
  // BUGFIX: the damage line read `user.gainHp(-value)`, but no variable named
  // `value` is in scope there (only the unrelated implicit global written by
  // amygame.js while setting up boss battles), so the notetag either threw a
  // ReferenceError or dealt NaN damage. The accumulated count is used instead.
  // If the intent was a flat 1 damage per hit, change the one line to
  // `user.gainHp(-1)`.
  // TwoKingsFeud punishes the user for every abnormal state it carries, then clears
  // itself.
  const ABNORMAL_STATE_META_KEYS = [
    "StateabNomal",
    "StateSPabNomal",
    "StateUnique"
  ];

  // Counts the states flagged as abnormal in the database.
  function countAbnormalStates(user) {
    let abnormalStateCount = 0;
    for (let stateId = 1; stateId <= $dataStates.length - 1; stateId++) {
      const stateData = $dataStates[stateId];
      const isAbnormal = ABNORMAL_STATE_META_KEYS.some(function (metaKey) {
        return stateData.meta[metaKey];
      });
      if (isAbnormal && user.isStateAffected(stateId)) abnormalStateCount += 1;
    }
    return abnormalStateCount;
  }

  // Deals one point of damage per abnormal state, stopping if the user dies first.
  function damageUserForAbnormalStates(user, abnormalStateCount) {
    for (let hitIndex = 1; hitIndex <= abnormalStateCount; hitIndex++) {
      if (!user.isAlive()) return;
      user.gainHp(-abnormalStateCount);
      user.startDamagePopup();
      user.clearResult();
    }
  }

  AGH_stateApplyTwoKingsFeud = function (user, target, stateId) {
    state_applyCommonEffect(user, target, stateId, 271);
    if (!user.isAlive()) return;
    const abnormalStateCount = countAbnormalStates(user);
    if (abnormalStateCount >= 1) damageUserForAbnormalStates(user, abnormalStateCount);
    user.removeState(stateId);
  };

  // --- Random / rolled effects ------------------------------------------------

  // Replaces (1x, state 299 ランダムバフ): grants one random stat buff for 3-5
  // turns.
  //
  // NOTE: the database removed the state *before* running the shared add effect,
  // which is kept here so the animation/popup still plays after the state is
  // gone.
  AGH_stateApplyRandomBuff = function (user, target, stateId) {
    target.removeState(stateId);
    const buffParamId = [2, 3, 4, 5, 6, 7][getRandomIndex(6)];
    const buffTurns = getRandomIndex(3) + 3;
    target.addBuff(buffParamId, buffTurns);
    state_applyCommonEffect(user, target, stateId, 271);
  };

  // Replaces (1x, state 301 ランダムデバフ): applies one random resistance-down
  // state, then removes the marker state.
  //
  // NOTE: the second random draw is unused by the original body but is kept
  // because it advances the RNG stream, and every later roll in the same action
  // depends on that position.
  AGH_stateApplyRandomDebuff = function (user, target, stateId) {
    const debuffStateId = [212, 213, 214, 215, 216, 217][getRandomIndex(6)];
    // var unusedTurnsDraw = getRandomIndex(3) + 3; //RNG stream position
    target.addState(debuffStateId);
    state_applyCommonEffect(user, target, stateId, 277);
    target.removeState(stateId);
  };

  // Replaces (1x, state 320 属性弱体): on a 6-in-11 roll, applies the
  // resistance-down state matching the attacker's own element tag, then removes
  // the marker. No element tag means no effect.
  // ElementBreak turns one of the user's element states into the matching weakness
  // state on the target. The table keeps the order of the original if chain, so the
  // last matching rule still wins.
  const ELEMENT_BREAK_ROLL_RANGE = 11;
  const ELEMENT_BREAK_SUCCESS_ROLL = 6;
  const ELEMENT_BREAK_FORMULA_ID = 50;
  const ELEMENT_BREAK_STATE_RULES = [
    { triggerStateIds: [51], weaknessStateId: 311 },
    { triggerStateIds: [52], weaknessStateId: 312 },
    { triggerStateIds: [53], weaknessStateId: 313 },
    { triggerStateIds: [54], weaknessStateId: 314 },
    { triggerStateIds: [55, 58], weaknessStateId: 315 },
    { triggerStateIds: [56, 59], weaknessStateId: 316 },
    { triggerStateIds: [49], weaknessStateId: 318 },
    { triggerStateIds: [50], weaknessStateId: 319 }
  ];

  // Weakness state that matches the user's current element states (0 = none).
  function resolveElementBreakStateId(user) {
    let weaknessStateId = 0;
    ELEMENT_BREAK_STATE_RULES.forEach(function (rule) {
      const hasTriggerState = rule.triggerStateIds.some(function (triggerStateId) {
        return user.isStateAffected(triggerStateId);
      });
      if (hasTriggerState) weaknessStateId = rule.weaknessStateId;
    });
    return weaknessStateId;
  }

  // Applies the weakness state when the roll and the user's states allow it.
  function applyElementBreakWeakness(user, target) {
    if (getRandomIndex(ELEMENT_BREAK_ROLL_RANGE) < ELEMENT_BREAK_SUCCESS_ROLL) return;
    const weaknessStateId = resolveElementBreakStateId(user);
    if (!(weaknessStateId >= 1)) return;
    state_addFormula1([
      weaknessStateId,
      ELEMENT_BREAK_FORMULA_ID,
      user,
      target,
      user.mdf,
      target.luk
    ]);
  }

  AGH_stateApplyElementBreak = function (user, target, stateId) {
    if (target.isAlive()) applyElementBreakWeakness(user, target);
    target.removeState(stateId);
  };

  // --- Element resistance -----------------------------------------------------

  // Replaces (9x, states 311-319 element weakness): lowers the target's
  // resistance to the state's element, then runs the shared add effect.
  AGH_stateApplyElementWeakness = function (user, target, stateId) {
    state_applyElementDebuffRate(target, stateId);
    state_applyCommonEffect(user, target, stateId, 277);
  };

  // Replaces (9x, states 311-319 element weakness): restores the resistance.
  AGH_stateRemoveElementWeakness = function (user, target, stateId) {
    state_removeElementDebuffRate(target, stateId);
    state_removeCommonEffect(user, target, stateId, 278);
  };

  // Replaces (2x, states 55 光属性 / 56 闇属性): enemy-only element tag swap, e.g.
  // 55 -> 58 when a light element is applied.
  AGH_stateApplyElementSwap = function (user, target, stateId, addStateId) {
    if (!user.isEnemy()) return;

    user.removeState(stateId);
    user.addState(addStateId);
  };

  // Replaces (1x, state 62 破損): chains into the follow-up state
  // (70 衣装破損).
  AGH_stateApplyFollowUpState = function (user, target, stateId, addStateId) {
    target.addState(addStateId);
  };

  // --- Guard ladders ----------------------------------------------------------

  // Replaces (24x, states 515-538 属性の加護 family): the six element guard tiers
  // (小 / 中 / 大 / 極大) form a ladder whose rungs are six state ids apart.
  // tier is 0 for 小, 1 for 中, 2 for 大, 3 for 極大:
  //   * a stronger tier already on the unit cancels the incoming weaker one;
  //   * the incoming tier clears every weaker tier below it;
  //   * the shared add effect runs last.
  //
  // NOTE: tiers 0-2 re-checked the state before playing the effect while the
  // 極大 tier (533-538) called it unconditionally, which is why the guard is
  // conditional on the tier here.
  AGH_stateApplyElementGuard = function (user, target, stateId, tier, animationId) {
    for (let up = 1; up <= 3 - tier; up++) {
      if (!user.isStateAffected(stateId + 6 * up)) continue;

      user.removeState(stateId);
      break;
    }
    for (let down = 1; down <= tier; down++) {
      if (user.isStateAffected(stateId - 6 * down)) {
        user.removeState(stateId - 6 * down);
      }
    }
    if (tier >= 3 || user.isStateAffected(stateId)) {
      state_applyCommonEffect(user, target, stateId, animationId);
    }
  };

  // Replaces (6x, states 539-544 无の加護 family): the same idea as
  // AGH_stateApplyElementGuard but the rungs are one state id apart and the
  // upgrade / downgrade sets are not symmetric in the database, so both are
  // passed in explicitly as offsets from stateId.
  //
  // effectFirst is set for 544 无の加護(神撃) only, which played the add effect
  // before clearing the weaker tiers instead of after.
  AGH_stateApplyNullGuard = function (
    user,
    target,
    stateId,
    upgradeOffsets,
    downgradeOffsets,
    animationId,
    effectFirst
  ) {
    if (effectFirst) {
      state_applyCommonEffect(user, target, stateId, animationId);
    }
    for (let up = 0; up < upgradeOffsets.length; up++) {
      if (!user.isStateAffected(stateId + upgradeOffsets[up])) continue;

      user.removeState(stateId);
      break;
    }
    for (let down = 0; down < downgradeOffsets.length; down++) {
      if (user.isStateAffected(stateId - downgradeOffsets[down])) {
        user.removeState(stateId - downgradeOffsets[down]);
      }
    }
    if (!effectFirst && user.isStateAffected(stateId)) {
      state_applyCommonEffect(user, target, stateId, animationId);
    }
  };

  // --- Stance upgrades --------------------------------------------------------

  // Replaces (2x, states 802 フォーカス / 822 ソング・オブ・グランデ): when the unit
  // knows the listed skill the stance escalates to stateId+1 instead of
  // lingering. skillId is 320 / 350 for 802 / 822.
  AGH_stateApplyStanceUpgrade = function (user, target, stateId, skillId) {
    state_applyCommonEffect(user, target, stateId, 271);
    if (!user.battleSkillsRaw().contains(skillId)) return;

    user.addState(stateId + 1);
    user.removeState(stateId);
  };

  // Replaces (2x, states 802 フォーカス / 822 ソング・オブ・グランデ): only play the
  // removal effect while the escalated state is still active.
  AGH_stateRemoveStanceUpgrade = function (user, target, stateId) {
    if (!!user.isStateAffected(stateId + 1)) {
      state_removeCommonEffect(user, target, stateId, 272);
    }
  };

  // --- Misc single-state effects ----------------------------------------------

  // Replaces (3x, states 151 果たし合い / 154 青眼の構え / 155 ファルサス・ガード):
  // the guard counter starts at zero.
  AGH_stateApplyResetCounter = function (user, target, stateId) {
    user.setStateCounter(stateId, 0);
  };

  // Replaces (1x, state 64 放心): recovery log line plus the opacity restore.
  AGH_stateRemoveRelief = function (user, target, stateId) {
    const targetName = target.name();
    BattleManager._logWindow.push("addText", `${targetName}は立ち直った！`);
    target.spriteOpacity(255, 20);
  };

  // Replaces (1x, state 172 鴉雀無声): weapon-type driven follow-up states, and
  // the state always removes itself.
  AGH_stateApplyCrowSilence = function (user, target, stateId) {
    if (user.isWtypeEquipped(3)) {
      user.addState(173);
    }
    if (user.isWtypeEquipped(9)) {
      user.addState(174);
      user.gainTp(-30);
      user.startMessagePopup("TP-30%", [255, 0, 0, 255], 0, 256);
    }
    user.removeState(stateId);
  };

  // Replaces (1x, state 177 ブレイブソウル): grants state 201 once per 10% of
  // remaining HP, at least once, then removes itself.
  //
  // BUGFIX: the database loop read `for (var 1 = start; i <= value1; i++)`,
  // which is a SyntaxError ("Unexpected number"). The plugin evaluates notetags
  // with a bare eval, so the whole body failed to compile and the state did
  // nothing at all. The counter is now a normal `var i = 1`.
  AGH_stateApplyBraveSoul = function (user, target, stateId) {
    let braveSoulStacks = Math.round(user.hpRate() * 10);
    if (braveSoulStacks <= 1) {
      braveSoulStacks = 1;
    }
    for (let i = 1; i <= braveSoulStacks; i++) {
      user.addState(201);
    }
    user.removeState(stateId);
  };

  // Replaces (1x, state 186 トレジャーハント): stacks a counter while in battle.
  //
  // NOTE: the database guard read `>= 1 || <= 9`, which is true for every
  // number, so the reset branch was unreachable. Kept as-is: the observable
  // behaviour (the counter always increments) is the same either way.
  AGH_stateApplyTreasureHunt = function (user, target, stateId) {
    if (!$gameParty.inBattle()) {
      return;
    }
    state_applyCommonEffect(user, target, stateId, 261);
    if (target._stateCounter[stateId] >= 1 || target._stateCounter[stateId] <= 9) {
      target.addStateCounter(stateId, +1);
    } else {
      target.setStateCounter(stateId, 1);
    }
  };

  // Replaces (1x, state 194 トレマーラウンド): applies the two tremolo states to
  // every battle member, then drops this state.
  //
  // NOTE: `actor` is declared with `var` inside the loop, so after the loop it
  // still points at the *last* battle member and only that member loses the
  // state. Preserved on purpose; hoisting the declaration would change which
  // battler is affected.
  AGH_stateApplyTremaRound = function (user, target, stateId) {
    let actor;
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length; i++) {
      actor = battleMembers2[i];
      actor.addState(206);
      actor.addState(207);
    }
    actor.removeState(stateId);
  };

  // Replaces (2x, states 266 連撃ボーナス / 267 三連撃ボーナス): battle-log banner.
  AGH_stateApplyStrikeBonus = function (user, target, stateId, logText) {
    BattleManager._logWindow.push("addText", logText);
  };

  // Replaces (1x, state 292 浄眼): re-runs the boss action pattern when the lead
  // troop member is a boss individual and can still act.
  AGH_stateApplyPureEye = function (user, target, stateId) {
    const leadEnemy = $gameTroop.members()[0];
    if (!(leadEnemy.isStateAffected(410) && leadEnemy.isAlive() && !leadEnemy.isRestricted())) return;

    $gameSwitches.setValue(470, true);
    boss_actionPattarn1(leadEnemy);
    $gameSwitches.setValue(470, false);
  };

  // Replaces (5x, states 321/323/324/898/905 delay family): grants the delay TP
  // gain declared in the notetag, then removes the state.
  AGH_stateApplyDelay = function (user, target, stateId) {
    state_applyCommonEffect(user, target, stateId, 277);
    target.gainTp(Number($dataStates[stateId].meta["TPGain1"]));
    target.removeState(stateId);
  };

  // Replaces (1x, state 417 モードゲージ減少): drains 20 points of the party limit
  // gauge while break mode is up, then removes the marker.
  AGH_stateApplyModeGaugeDown = function (user, target, stateId) {
    if (target.isStateAffected(stateId - 2)) {
      const targetName = target.name();
      const coloredText = colorTaggedText(10, "モードゲージ");
      BattleManager._logWindow.push("addText", `${targetName}の${coloredText}が20減少した！`);
      state_applyCommonEffect(user, target, stateId, 261);
      $gameTroop.losePartyLimitGauge(20);
    }
    target.removeState(stateId);
  };

  // Replaces (1x, state 418 ブレイクモード維持): resets the turn counter of the
  // break-mode state instead of letting it expire, then removes the marker.
  AGH_stateApplyBreakModeKeep = function (user, target, stateId) {
    if (target.isStateAffected(stateId - 2)) {
      const targetName = target.name();
      const stateName = `\\C[1]＜${$dataStates[stateId - 2].name}＞\\C[0]`;
      BattleManager._logWindow.push("addText", `${targetName}の${stateName}のターンが初期化された！`);
      state_applyCommonEffect(user, target, stateId - 2, 261);
    }
    target.removeState(stateId);
  };

  // Replaces (1x, state 472 命乞い): plays the plea message plus one random
  // flavour line per active plea state.
  //
  // BUGFIX: both _logWindow.push calls in the database lost their
  // template-literal backticks (`push(addText, ${target.name()}…)`), which is a
  // SyntaxError, so the whole notetag failed to compile. The backticks are
  // restored here.
  AGH_stateApplyBegForLife = function (user, target, stateId) {
    const targetName = target.name();
    const stateName = `\\sim[427]`;
    BattleManager._logWindow.push("addText", `${targetName}は${stateName}を始めた！`);
    const pleaStateIds = [421, 436];
    pleaStateIds.forEach(function (id) {
      if (!target.isStateAffected(id)) return;

      const pleaLines = $dataStates[stateId].meta["inotigoi" + id].split(",");
      const pleaLine = pleaLines[getRandomIndex(pleaLines.length)];
      BattleManager._logWindow.push("addText", pleaLine);
    }, this);
  };

  // Replaces (1x, state 551 エネミー変身): re-skins the enemy from the
  // valueWordSet9 preset (battler name, hue, move distance).
  AGH_stateApplyEnemyTransform = function (user, target, stateId) {
    const enemyData = $dataEnemies[user._enemyId];
    const presetParts = enemyData.meta[valueWordSet9].split(",");
    const moveDistance = Number(presetParts[3]);
    $gameTroop.move(user.index() + 1, 0, moveDistance, 40);
    enemyData.battlerName = presetParts[1];
    enemyData.battlerHue = presetParts[2];
  };

  // Replaces (3x, states 594 Thrust / 595 Swing / 596 Missile): plays the
  // equipped weapon's animation with the matching battler frame for one motion
  // type. motionType is 'Thrust' / 'Swing' / 'Missile'.
  //
  // NOTE: the original also read meta['MotionType'] into a local that was never
  // used; the read had no side effect, so it is not carried over.
  AGH_stateApplyWeaponMotion = function (user, target, stateId, motionType) {
    const weaponData = $dataWeapons[$gameActors.actor(user.actorId()).equips()[0].id];
    const weaponNumber = Number(weaponData.meta["WeaponNumber"]);
    user.battler().setFrame(motionType, 2);
    user.startWeaponAnimation(weaponNumber);
  };

  // Replaces (1x, state 771 被虐体質): resets a non-negative counter.
  AGH_stateApplyMasochism = function (user, target, stateId) {
    if (target._stateCounter[stateId] >= 0) {
      target.setStateCounter(stateId, 0);
    }
  };

  //=============================================================================
  // State notetag effects, part 2 (the remaining <Custom ...> tags)
  //----------------------------------------------------------------------------
  // data/States.json carries five more eval scopes besides Apply/Remove. Each
  // one binds a different set of names, which is what fixes the signature of the
  // helpers below:
  //
  //  1. Game_Battler.prototype.customEffectEval(stateId, type)
  //     <Custom Turn Start Effect>, <Custom Turn End Effect>,
  //     <Custom Action Start Effect>, <Custom Action End Effect>,
  //     <Custom Battle Effect> (and the unused victory/defeat/escape).
  //     this === user === target === the battler the state sits on.
  //     No `value` is in scope.  -> AGH_...(user, target, stateId)
  //
  //  2. Game_Action.prototype.customEffectEval(target, stateId, type, side, value)
  //     <Custom Initiate Effect>, <Custom Select Effect>, <Custom Deselect Effect>,
  //     <Custom Conclude Effect>            -> AGH_...(user, target, stateId)
  //     <Custom Confirm Effect>, <Custom React Effect>, <Custom Respond Effect>
  //                                         -> AGH_...(user, target, stateId, value)
  //     this === the Game_Action, user === attacker === a === the action's subject,
  //     target === defender === b.
  //     For the four value-carrying types the plugin *writes the return value back*
  //     (Game_Action.executeDamage: `value = this.reactStateEffects(...)`), so those
  //     helpers must return the - possibly modified - value and the notetag reads
  //     `value = AGH_...(...)`.
  //     Bodies that used `this` (this.isHpEffect()) take the action as their first
  //     argument, because `this` inside a plain function is not the action.
  //
  //  3. Game_BattlerBase.prototype.passiveStateConditionEval(state) -
  //     <Custom Passive Condition>, and the identical
  //     Game_BattlerBase.prototype.auraStateConditionEval(state) -
  //     <Custom Aura Condition>. Both compile the body with
  //     new Function('condition','a','user','subject','b','target','s','v',
  //                  body + '\nreturn condition;')
  //     and call it with `this` bound to the battler. `stateId` is NOT in scope,
  //     and the body has to leave the result in `condition`, so the helpers return
  //     a boolean and the notetag reads `condition = AGH_...(...)`.
  //
  //  4. Game_Battler.prototype.processDamageOverTimeStateEffect(state) -
  //     <Custom Regen Formula> (YEP_X_ExtDoT). The body is concatenated into
  //     state.dotFormula and eval'd directly, where a === origin === the state's
  //     origin and b === user === target === the battler. The body has to leave
  //     its result in `value` (an undeclared global!), and may also override the
  //     `variance` and `element` locals. The helper returns those three in an
  //     object and the notetag unpacks them, so `variance` / `element` still land
  //     in the enclosing function's locals exactly as before.
  //
  // Bodies that were already a single call to a properly named function
  // (state_turnEndBuffDebuff, enemy_battleStartCry) were left untouched.
  //=============================================================================

  // --- Turn Start -------------------------------------------------------------

  // Replaces (1x, state 235): starts the turn with an empty damage counter.
  AGH_stateTurnStartResetCounter = function (user, target, stateId) {
    user.setStateCounter(stateId, 0);
  };

  // Replaces (2x, states 594 Thrust / 595 Swing / 596 Missile): drops the
  // weapon-motion states and restores the default battler frame. guardStateId
  // (state 64 for state 594, 0 for 595/596) skips the reset while the battler is
  // under that state.
  AGH_stateTurnStartClearWeaponMotion = function (user, target, stateId, guardStateId) {
    if (guardStateId > 0 && user.isStateAffected(guardStateId)) return;
    user.removeState(594);
    user.removeState(595);
    user.removeState(596);
    user.battler().setMaxFrame(4);
  };

  // Replaces (2x, states 618 背水 / 619 渾身): converts the missing HP ratio into
  // a state counter scaled by the battler's rate for elementId (39 / 40).
  AGH_stateTurnStartElementCounter = function (user, target, stateId, elementId) {
    if (!user.isAlive()) {
      user.setStateCounter(stateId, 0);
      return;
    }
    const missingHpRate = 1 - user.hpRate();
    const elementScaledRate = missingHpRate * user.elementRate(elementId);
    const counterRate = Math.round((elementScaledRate * 100) / 2);
    user.setStateCounter(stateId, counterRate / 100);
  };

  // --- Turn End ---------------------------------------------------------------

  // Replaces (1x, state 94): the last surviving party member collapses, otherwise
  // the battler taunts and fades out.
  AGH_stateTurnEndFleeOrTaunt = function (user, target, stateId) {
    if ($gameParty.aliveMembers().length === 1) {
      user.addState(1);
      return;
    }
    const userName = colorTaggedText(16, user.name());
    BattleManager._logWindow.push("addText", `${userName}「は、早く倒してしまえっ！」`);
    user.spriteOpacity(0, 30);
  };

  // Replaces (1x, state 154): once the stored counter is non-zero, forces skillId
  // on the battler's own side and clears both the counter and the state.
  AGH_stateTurnEndForceSkill = function (user, target, stateId, skillId) {
    if (user.getStateCounter(stateId) >= 1) {
      BattleManager.queueForceAction(user, skillId, -1);
    }
    user.removeStateCounter(stateId);
    user.removeState(stateId);
  };

  // Replaces (1x, state 235): spends the damage accumulated during the turn over
  // the whole enemy troop, then resets the counter. The original read
  // target._stateCounter[stateId] twice; it is read once here.
  AGH_stateTurnEndDamageTroop = function (user, target, stateId) {
    if (user.isAlive()) {
      const accumulatedDamage = target._stateCounter[stateId];
      if (accumulatedDamage >= 1) {
        const troopMembers = $gameTroop.members();
        const troopCount = troopMembers.length;
        if (troopCount >= 1) {
          const targetName = target.name();
          const stateName = `\\SIM[${stateId}]`;
          BattleManager._logWindow.push("addText", `${targetName}の${stateName}が発動！`);
          user.startAnimation(509, true, 0);
          for (let i = 0; i < troopCount; i++) {
            troopMembers[i].startAnimation(132, true, 10);
            const damagePerMember = Math.round((accumulatedDamage * 2) / troopCount);
            target.gainHp(-damagePerMember);
            target.startDamagePopup();
          }
        }
      }
    }
    user.setStateCounter(stateId, 0);
  };

  // Replaces (1x, state 302 種): the seed sprouts into a random abnormal state
  // (毒/暗闇/沈黙/激昂/混乱/魅了/睡眠/スタン) on the whole unit, then removes itself.
  //
  // BUGFIX: the original called `target.aliveMembers()`, but
  //   * aliveMembers() is a Game_Unit method while `target` is a Game_Battler,
  //     so the call threw "target.aliveMembers is not a function"; and
  //   * Game_Unit.prototype.aliveMembers() returns a plain Array (it is
  //     `members().filter(...)`), which has no addState()/startAnimation()
  //     either - so even on a unit the second line would have thrown.
  // The plugin's try/catch swallowed both, and the state never did anything.
  // It now walks the state holder's own unit, which is the literal reading of
  // the original. The animation delay is read once and the 279 accumulator
  // advances once, exactly as the original did - whether the delay was meant to
  // stagger per member is not recoverable from the broken source.
  AGH_stateTurnEndSeedSpread = function (user, target, stateId) {
    const seedStateId = [4, 5, 6, 7, 8, 9, 10, 11][getRandomIndex(8)];
    const unitMembers = target.friendsUnit().aliveMembers();
    unitMembers.forEach(function (member) {
      member.addState(seedStateId);
    });
    target.removeState(stateId);
    if (!(ConfigManager.battleAniSpeed >= 3)) return;

    const animationDelay = $gameVariables.value(279);
    unitMembers.forEach(function (member) {
      member.startAnimation(277, false, animationDelay);
    });
    $gameVariables.setValue(279, animationDelay + $gameVariables.value(280));
  };

  // Replaces (1x, state 327): clears the battler's abnormal states.
  AGH_stateTurnEndClearAbnormal = function (user, target, stateId) {
    if (!target.isAlive()) return;
    abNomal_Clear(target, target, stateId, 2);
  };

  // Replaces (3x, states 403 / 405 / 475): the same, but only on a 1-in-11 roll of
  // at least `threshold`.
  AGH_stateTurnEndClearAbnormalChance = function (user, target, stateId, threshold) {
    if (!target.isAlive()) return;
    if (getRandomIndex(11) < threshold) return;
    abNomal_Clear(target, target, stateId, 2);
  };

  // Replaces (1x, state 329): adds one state picked at random out of stateIds.
  AGH_stateTurnEndAddRandomState = function (user, target, stateId, stateIds) {
    if (!target.isAlive()) return;
    target.addState(stateIds[getRandomIndex(stateIds.length)]);
  };

  // Replaces (3x, states 405 / 412 / 413 / 414): the same, gated on an
  // at-least-`threshold` roll of 1-in-11.
  AGH_stateTurnEndAddRandomStateChance = function (user, target, stateId, threshold, stateIds) {
    if (!target.isAlive()) return;
    if (getRandomIndex(11) < threshold) return;
    target.addState(stateIds[getRandomIndex(stateIds.length)]);
  };

  // Replaces (4x, states 395 自己再生(小) / 396 (中) / 397 (大) / 398 (超)): while
  // wounded, drains drainRate of max MP. Note the rates are 0.01/0.02/0.03/0.05
  // while the matching regen formulas use 1/2/3/5 - the asymmetry is in the
  // original data.
  AGH_stateTurnEndDrainMp = function (user, target, stateId, drainRate) {
    if (!user.isAlive()) return;
    if (user.hpRate() === 1.0 || user.mpRate() < drainRate) return;
    const drain = Math.round(user.mmp * drainRate);
    user.gainMp(-drain);
    user.startDamagePopup();
  };

  // Replaces (1x, state 420): plays animationId on the battler and heals it for
  // the damage its own origin is missing.
  AGH_stateTurnEndHealMissingHp = function (user, target, stateId, animationId) {
    target.startAnimation(animationId, true, 0);
    target.gainHp(user.mhp - user.hp);
    target.startDamagePopup();
  };

  // Replaces (1x, state 472): prints the "…をしている…。" line and then one random
  // flavour line per watched state the battler is under, read from the
  // meta['inotigoi<id>'] notetag.
  //
  // NOTE: the original passed `this` as the forEach thisArg, but the callback
  // never referenced `this`; the argument is dropped.
  AGH_stateTurnEndInotigoiMessage = function (user, target, stateId, simStateId, watchedStateIds) {
    const targetName = target.name();
    const stateName = `\\sim[${simStateId}]`;
    BattleManager._logWindow.push("addText", `${targetName}は${stateName}をしている…。`);
    watchedStateIds.forEach(function (id) {
      if (!target.isStateAffected(id)) return;
      const lines = $dataStates[stateId].meta["inotigoi" + id].split(",");
      BattleManager._logWindow.push("addText", lines[getRandomIndex(lines.length)]);
    });
  };

  // Replaces (1x, state 600): reports the damage taken during the turn and then
  // re-requests the equipped weapon's motion so the actor keeps animating.
  // Weapon motions used by the side-view battle display, indexed by MotionType.
  const WEAPON_MOTION_NAMES = ["thrust", "swing", "missile"];
  const STATE_COUNTER_HIGHLIGHT_COLOR_ID = 10;

  // Reports the damage the state counter accumulated and resets it.
  function reportStateCounterDamage(target, stateId) {
    const counterDamage = target._stateCounter[stateId];
    // Negated comparison keeps the original "not a number >= 1" behaviour.
    if (!(counterDamage >= 1)) return;
    const targetName = target.name();
    const damage = colorTaggedText(STATE_COUNTER_HIGHLIGHT_COLOR_ID, counterDamage);
    BattleManager._logWindow.push(
      "addText",
      `${targetName}はターン中に${damage}のダメージを受けた！`
    );
    target.setStateCounter(stateId, 0);
  }

  // Plays the weapon motion of the attacker's equip slot, when the database asks for it.
  function playWeaponMotion(user) {
    const weapon = $gameActors.actor(user.actorId()).equips()[0];
    if (!$dataSystem.optSideView) return;
    if (user.isStateAffected(1) || user.isStateAffected(64)) return;
    if (!weapon) return;
    const weaponData = $dataWeapons[weapon.id];
    if (!weaponData.meta["WeaponNumber"] || !weaponData.meta["MotionType"]) return;
    // An unknown type keeps the original empty motion name.
    const motionName = WEAPON_MOTION_NAMES[Number(weaponData.meta["MotionType"])] || "";
    user.requestMotion(motionName);
    user.startWeaponAnimation(Number(weaponData.meta["WeaponNumber"]));
  }

  AGH_stateTurnEndReportCounterDamageAndMotion = function (user, target, stateId) {
    if (!user.isAlive()) return;
    reportStateCounterDamage(target, stateId);
    playWeaponMotion(user);
  };

  // Replaces (1x, state 610): reports the damage taken during the turn together
  // with the battler's current TP percentage.
  AGH_stateTurnEndReportCounterDamageTp = function (user, target, stateId) {
    if (!user.isAlive()) return;
    const counterDamage = target._stateCounter[stateId];
    const targetName = target.name();
    const tpValue = colorTaggedText(6, target.tp);
    if (counterDamage >= 1) {
      const damage = colorTaggedText(10, counterDamage);
      BattleManager._logWindow.push(
        "addText",
        `${targetName}のTP${tpValue}% ターン中に${damage}のダメージを受けた！`
      );
      target.setStateCounter(stateId, 0);
    } else {
      BattleManager._logWindow.push("addText", `${targetName}のTP${tpValue}%`);
    }
  };

  // --- Action Start -----------------------------------------------------------

  // Replaces (1x, state 157): charges the state's <TurnCost> against MP, or drops
  // the state when the battler cannot pay.
  AGH_stateActionStartPayTurnCostMp = function (user, target, stateId) {
    const turnCost = Number($dataStates[stateId].meta["TurnCost"]);
    if (user.mp >= turnCost) {
      user.gainMp(-turnCost);
    } else {
      user.removeState(stateId);
    }
  };

  // Replaces (1x, state 895): the HP-paying twin of the above.
  AGH_stateActionStartPayTurnCostHp = function (user, target, stateId) {
    const turnCost = Number($dataStates[stateId].meta["TurnCost"]);
    if (user.hp >= turnCost) {
      user.gainHp(-turnCost);
    } else {
      user.removeState(stateId);
    }
  };

  // --- Action End -------------------------------------------------------------

  // Replaces (1x, state 151): remembers which slot the previous action hit (as
  // 'E<n>' in the state counter) and hands out state 206 for a repeated target or
  // state 213 for a fresh one.
  AGH_stateActionEndTrackLastTarget = function (user, target, stateId) {
    const action = BattleManager._action;
    const unit = action.isForOpponent() ? action.opponentsUnit() : action.friendsUnit();
    const lastTarget = unit.members()[BattleManager._subject._lastTargetIndex];
    if (!lastTarget.isStateAffected(610)) return;
    const targetMarker = "E" + (BattleManager._subject._lastTargetIndex + 1);
    if (user.getStateCounter(stateId) == 0) {
      user.setStateCounter(stateId, targetMarker);
      return;
    }
    if (user.getStateCounter(stateId) === targetMarker && !$gameTroop.isAllDead() && $gameParty.inBattle()) {
      user.addState(206);
    } else {
      user.setStateCounter(stateId, targetMarker);
      user.addState(213);
    }
  };

  // Replaces (2x, states 802 / 803): drops the state while the battle mode
  // variable holds modeValue.
  AGH_stateActionEndRemoveInMode = function (user, target, stateId, modeVariableId, modeValue) {
    if ($gameVariables.value(modeVariableId) != modeValue) return;
    user.removeState(stateId);
  };

  // Replaces (1x, state 846): while the battle mode variable is 6, banks up to
  // four actions before the state is consumed.
  //
  // NOTE: the `user._stateCounter[stateId] >= 1` branch is dead - the counter is
  // removed on the line above, so the read is always undefined and the else
  // branch always runs. Kept verbatim so the behaviour is unchanged.
  AGH_stateActionEndResolveCounter = function (user, target, stateId) {
    if ($gameVariables.value(182) != 6) return;
    if (target._stateCounter[stateId] < 4) return;

    user.removeStateCounter(stateId);
    user.removeState(stateId);

    if (user._stateCounter[stateId] >= 1) {
      user.addStateCounter(stateId, +1);
    } else {
      user.setStateCounter(stateId, 1);
    }
  };

  // --- Battle -----------------------------------------------------------------

  // Replaces (1x, state 94): the "runs away" battle start.
  AGH_stateBattleFlee = function (user, target, stateId) {
    const userName = colorTaggedText(16, user.name());
    BattleManager._logWindow.push("addText", `${userName}「ヒィィ～～っ！」`);
    BattleManager._logWindow.push("addText", `${userName}は逃げ出した！`);
    AudioManager.playSe({ name: "Z_FootRun", volume: 90, pitch: 150, pan: 0 });
    user.spriteOpacity(0, 60);
    $gameParty.move(user.index() + 1, 400, 0, 60);
  };

  // Replaces (1x, state 425): the standard enemy battle cry plus a mark state.
  AGH_stateBattleCryAndMark = function (user, target, stateId, markStateId) {
    enemy_battleStartCry(user);
    if (!target.isStateAffected(markStateId)) {
      target.addState(markStateId);
    }
  };

  // Replaces (1x, state 600): sets up the actor's per-index battle state, the
  // state counter and the weapon-motion state (594/595/596) chosen from the
  // equipped weapon's <MotionType>.
  //
  // NOTE: the original also read meta['WeaponNumber'] into a local it never used;
  // that read has no side effect and is not carried over.
  AGH_stateBattleInitWeaponMotion = function (user, target, stateId) {
    user.addState(486 + user.index());
    if (user.isBattleMember()) {
      user.setStateCounter(stateId, 0);
    }
    if (!$dataSystem.optSideView) return;
    if (user.isStateAffected(1) || user.isStateAffected(64)) return;
    if (!user.isBattleMember()) return;

    const weapon = user.equips()[0];
    if (!weapon) return;
    const weaponData = $dataWeapons[weapon.id];
    if (!weaponData.meta["WeaponNumber"] || !weaponData.meta["MotionType"]) return;
    const motionType = Number(weaponData.meta["MotionType"]);
    switch (motionType) {
      case 0:
        user.addState(594);
        break;
      case 1:
        user.addState(595);
        break;
      case 2:
        user.addState(596);
        break;
      default:
        break;
    }
  };

  // Replaces (1x, state 610): rolls the starting TP, shows it as a popup, applies
  // the per-index state and seeds the enemy battle AI.
  AGH_stateBattleInitTpGauge = function (user, target, stateId) {
    user.setStateCounter(stateId, 0);
    user.gainTp(getRandomIndex(31) + 20);
    target.startMessagePopup("TP:" + user.tp, [255, 128, 0, 255, 256]);
    user.addState(490 + user.index());
    if (user.isAlive()) {
      enemy_battleSetting(user.index());
    }
  };

  // --- React ------------------------------------------------------------------

  // Replaces (3x, states 161 / 332 / 893): plays a hit animation without touching
  // the damage.
  AGH_stateReactPlayAnimation = function (user, target, stateId, value, animationId) {
    target.startAnimation(animationId, true, 0);
    return value;
  };

  // Replaces (1x, state 162): 31% chance to halve the incoming HP damage.
  AGH_stateReactHalveDamageChance = function (action, user, target, stateId, value) {
    if (action.isHpEffect() && value > 0) {
      if (getRandomIndex(101) <= 30) {
        target.startAnimation(257, true, 0);
        value = value / 2;
      }
    }
    return value;
  };

  // Replaces (1x, state 180): plays the guard animation, then nullifies the
  // incoming HP damage and drops the state.
  AGH_stateReactNullifyDamageAndRemove = function (action, user, target, stateId, value) {
    target.startAnimation(259, true, 0);
    if (action.isHpEffect() && value > 0) {
      value = 0;
      user.removeState(stateId);
    }
    return value;
  };

  // Replaces (1x, state 183): parks a fifth of the incoming damage in the state
  // counter and lets the rest through, then drops the state.
  AGH_stateReactRedirectOneFifthDamage = function (action, user, target, stateId, value) {
    if (action.isHpEffect() && value > 0) {
      target.setStateCounter(stateId, value / 5);
      value = Math.round(value - value / 5);
      user.removeState(stateId);
    }
    return value;
  };

  // Replaces (1x, state 410): converts incoming damage into party limit gauge
  // movement and swaps between the 415 "gauge up" and 416 "broken" states.
  AGH_stateReactPartyLimitGauge = function (action, user, target, stateId, value) {
    if (!action.isHpEffect() || value <= 0 || !target.isAlive()) return value;
    updatePartyLimitGaugeForStance(target, 407, false);
    updatePartyLimitGaugeForStance(target, 408, true);
    const targetName = target.name();
    if (target.isStateAffected(415)) {
      const gaugeLoss = Math.max(15, Math.min(50, Math.floor((20 * value) / target.mhp)));
      $gameTroop.losePartyLimitGauge(gaugeLoss);
      if ($gameTroop.partyLimitGauge() <= 0) {
        target.removeState(415);
        applyLimitGaugeState(user, target, 416, 251, targetName);
      }
    }
    if (target.isStateAffected(416)) $gameTroop.setPartyLimitGauge(0);
    if ($gameTroop.partyLimitGaugeCurrent() >= 1) applyLimitGaugeState(user, target, 415, 252, targetName);
    return value;
  };

  // Replaces (2x, states 467 / 468): incoming HP damage is clamped to 1 unless
  // the metal-killer global is set or the hit was a critical (爆発ポーション).
  AGH_stateReactMinimizeUnlessMetalKiller = function (action, user, target, stateId, value) {
    if (!action.isHpEffect() || value <= 0) return value;
    if (valueMetalKiller === 1 || target.result().critical) return value;
    return 1;
  };

  // Replaces (1x, state 472): counts every HP-damaging hit in a game variable.
  AGH_stateReactCountHpDamage = function (action, user, target, stateId, value, variableId) {
    if (action.isHpEffect() && value > 0) {
      $gameVariables.setValue(variableId, $gameVariables.value(variableId) + 1);
    }
    return value;
  };

  // Replaces (1x, state 600): routes the incoming hit through the shared
  // damage_keisan1 formula (formulaType 121) and leaves the damage alone.
  AGH_stateReactDamageFormula = function (action, user, target, stateId, value, formulaType) {
    damage_keisan1(
      user,
      target,
      action.isHpEffect(),
      value,
      formulaType,
      0,
      $gameVariables.value(93),
      stateId
    );
    return value;
  };

  // Replaces (1x, state 771): on taking HP damage, plays the victory motion and
  // stacks a counter that grows with the actor's variable block.
  AGH_stateReactAddCounterOnHit = function (action, user, target, stateId, value) {
    if (!action.isHpEffect() || value <= 0) return value;
    target.requestMotion("Victory");
    AudioManager.playSe({ name: "ZH_Knead1", volume: 50, pitch: 120, pan: 0 });
    let counter = getRandomIndex(10) + 1;
    counter = counter + Math.ceil($gameVariables.value(target.actorId() + 380)[1] / 100);
    target.addStateCounter(stateId, counter);
    return value;
  };

  // Replaces (1x, state 812): the state is consumed by the first HP hit.
  AGH_stateReactRemoveSelfOnHit = function (action, user, target, stateId, value) {
    if (action.isHpEffect() && value > 0) {
      target.removeState(stateId);
    }
    return value;
  };

  // --- Respond ----------------------------------------------------------------

  // Replaces (1x, state 25): the last-man-standing rescue. Every party member is
  // revived and the lead battle member plays the recovery animation.
  //
  // NOTE: the original wrote `var actor = $gameParty.battleMembers()[0]` inside a
  // callback that already had an `actor` parameter - the `var` rebinds the
  // parameter, so the animation always played on battleMembers()[0]. Renaming the
  // local keeps that behaviour but makes it obvious.
  AGH_stateRespondPartyRescue = function (user, target, stateId, value) {
    if ($gameParty.aliveMembers().length === 0) {
      $gameParty.members().forEach(function (actor) {
        actor.addState(24);
        actor.recoverAll();
        const leadActor = $gameParty.battleMembers()[0];
        leadActor.startAnimation(396, false, 0);
        $gameSwitches.setValue(145, true);
      });
    }
    return value;
  };

  // Replaces (1x, state 63): heals the target by the damage just dealt.
  AGH_stateRespondHealByDamage = function (action, user, target, stateId, value) {
    if (action.isHpEffect() && value > 0) {
      target.gainHp(value);
    }
    return value;
  };

  // Replaces (1x, state 94): fades the battler out after being hit.
  AGH_stateRespondFadeOut = function (user, target, stateId, value) {
    target.spriteOpacity(0, 30);
    return value;
  };

  // Replaces (2x, states 154 / 235): banks the incoming damage in the state
  // counter for the turn-end payout.
  AGH_stateRespondStoreDamage = function (user, target, stateId, value) {
    user.addStateCounter(stateId, value);
    return value;
  };

  // Replaces (1x, state 155): banks the damage and cancels it entirely.
  AGH_stateRespondAbsorbDamage = function (user, target, stateId, value) {
    user.addStateCounter(stateId, value);
    return 0;
  };

  // Replaces (1x, state 602): while the battler is under guardStateId, records the
  // actor id in variable 20 and reserves a common event.
  AGH_stateRespondReserveCommonEventOnState = function (
    user,
    target,
    stateId,
    value,
    guardStateId,
    commonEventId
  ) {
    if (target.isStateAffected(guardStateId)) {
      $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID, target.actorId());
      $gameTemp.reserveCommonEvent(commonEventId);
    }
    return value;
  };

  // Replaces (1x, state 610): the enemy-side damage formula, the kill tally and
  // the per-species collapse animation.
  AGH_stateRespondEnemyDamageFormula = function (action, user, target, stateId, value) {
    damage_keisan1(user, target, action.isHpEffect(), value, 120, 0, $gameVariables.value(93), stateId);
    if (target.hp <= 0 && $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID) >= 1) {
      $gameVariables.value(258)[$gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID)] += 1;
    }
    if (!target.isAlive() && valueCollapseAnime == 0) {
      let collapseAnimationId = 598;
      if ($gameSwitches.value(207)) collapseAnimationId = 0;
      if (target.isStateAffected(435)) collapseAnimationId = 591; //機械種,爆発
      if (target.isStateAffected(436)) collapseAnimationId = 599; //人種、流血小さめ
      if (target.isStateAffected(425) || target.isStateAffected(426)) collapseAnimationId = 600; //霊体不死、成仏
      if (target.isStateAffected(434) || target.isStateAffected(429)) collapseAnimationId = 597; //ﾐﾐｯｸｺﾞｰﾚﾑ,特殊
      if (target.isStateAffected(437) || target.isStateAffected(438)) collapseAnimationId = 601; //天使悪魔,特殊
      if (target.isStateAffected(439)) collapseAnimationId = 602; //竜、特殊
      if (collapseAnimationId >= 1) {
        target.startAnimation(collapseAnimationId, true, 0);
      }
      // The original's else-branch only built the argument list for a
      // commented-out $gameScreen._particle.particlePlay() call, so it had no
      // observable effect.
    }
    return value;
  };

  // Replaces (1x, state 842): heals the target by the incoming damage scaled by
  // its rate for elementId.
  AGH_stateRespondHealByElement = function (action, user, target, stateId, value, elementId) {
    if (target.isAlive()) {
      if (action.isHpEffect() && value > 0) {
        target.gainHp(Math.floor(value * target.elementRate(elementId)));
      }
    }
    return value;
  };

  // --- Confirm ----------------------------------------------------------------

  // Replaces (1x, state 156): guarantees a critical hit.
  AGH_stateConfirmCritical = function (user, target, stateId, value) {
    target.result().critical = true;
    return value;
  };

  // Replaces (1x, state 290): breaks the equipped weapon when the hit's critical
  // state contradicts what the weapon wants (71/72 want a crit, 73 wants none).
  AGH_stateConfirmBreakWeapon = function (user, target, stateId, value) {
    if (!user.equips()[0] || $gameVariables.value(182) != 2) return value;
    const weaponId = user._equips[0]._itemId;
    let shouldBreak = false;
    if (weaponId == 71 || weaponId == 72) {
      shouldBreak = !!target.result().critical;
    } else if (weaponId == 73) {
      shouldBreak = !target.result().critical;
    }
    if (shouldBreak) {
      user.changeEquipById(1, 0);
      $gameParty.loseItem($dataWeapons[weaponId], 1);
      AudioManager.playSe({ name: "壊れた音", volume: 100, pitch: 110, pan: 50 });
    }
    return value;
  };

  // Replaces (1x, state 599): runs the shared attack formula and accumulates the
  // damage dealt into the actor's block of variable 293.
  AGH_stateConfirmTrackDamage = function (action, user, target, stateId, value) {
    attack_DamageFormula(user, target, $gameVariables.value(96));
    if (action.isHpEffect() && value > 0) {
      $gameVariables.value(HELPER_VARIABLE.TRAINING_DOLL_SETTINGS)[user.actorId() + 10] += value;
    }
    return value;
  };

  // --- Conclude ---------------------------------------------------------------

  // Replaces (2x, states 309 / 310): on an at-least-`threshold` roll, runs the
  // formula skill matching whichever of the battler's stance states is active.
  // stateSkillGroups is a list of [[requiredStateIds...], formulaSkillId] pairs,
  // applied in order so the last match wins. Each group short-circuits like the
  // original `a || b` test, which matters only for how many isStateAffected()
  // probes are made.
  AGH_stateConcludeFormulaByState = function (user, target, stateId, threshold, stateSkillGroups) {
    if (!user.isAlive() || !target.isAlive() || !target.isActor()) return;
    if (getRandomIndex(11) < threshold) return;
    let formulaSkillId = 0;
    for (let i = 0; i < stateSkillGroups.length; i++) {
      const group = stateSkillGroups[i];
      let matched = false;
      for (let j = 0; j < group[0].length; j++) {
        if (!user.isStateAffected(group[0][j])) continue;

        matched = true;
        break;
      }
      if (matched) formulaSkillId = group[1];
    }
    if (formulaSkillId >= 1) {
      state_addFormula1([formulaSkillId, 50, user, target, user.mdf, target.luk]);
    }
  };

  // Replaces (1x, state 326): strips one tier of the target's power-up.
  AGH_stateConcludeDispelPowerUp = function (user, target, stateId) {
    if (!user.isAlive() || !target.isAlive() || !target.isActor()) return;
    powerUp_dispel(user, target, stateId, 2);
  };

  // Replaces (3x, states 401 / 402 / 403 / 405): the same, on a 1-in-11 roll of at
  // least `threshold`.
  AGH_stateConcludeDispelPowerUpChance = function (user, target, stateId, threshold) {
    if (!target.isAlive() || !target.isActor()) return;
    if (getRandomIndex(11) < threshold) return;
    powerUp_dispel(user, target, stateId, 2);
  };

  // Replaces (1x, state 328): runs one formula skill picked at random.
  AGH_stateConcludeRandomFormula = function (user, target, stateId, formulaSkillIds) {
    if (!user.isAlive() || !target.isAlive() || !target.isActor()) return;
    const formulaSkillId = formulaSkillIds[getRandomIndex(formulaSkillIds.length)];
    state_addFormula1([formulaSkillId, 50, user, target, user.mdf, target.luk]);
  };

  // Replaces (1x, state 405): the same, gated on an at-least-`threshold` roll.
  AGH_stateConcludeRandomFormulaChance = function (user, target, stateId, threshold, formulaSkillIds) {
    if (!target.isAlive() || !target.isActor()) return;
    if (getRandomIndex(11) < threshold) return;
    const formulaSkillId = formulaSkillIds[getRandomIndex(formulaSkillIds.length)];
    state_addFormula1([formulaSkillId, 50, user, target, user.mdf, target.luk]);
  };

  // --- Select / Deselect / Initiate -------------------------------------------

  // Replaces (1x, state 425): lifts the mark state when the "dispel" global is up.
  AGH_stateSelectRemoveMarkOnDispel = function (user, target, stateId, markStateId) {
    if (valueSkillSpecialDispel35 >= 1 && target.isStateAffected(markStateId)) {
      target.removeState(markStateId);
    }
  };

  // Replaces (1x, state 13): re-applies addStateId whenever guardStateId is absent.
  AGH_stateDeselectAddStateUnlessAffected = function (user, target, stateId, guardStateId, addStateId) {
    if (!target.isStateAffected(guardStateId)) {
      target.addState(addStateId);
    }
  };

  // Replaces (1x, state 425): a deliberate no-op. The original body's only
  // statement was commented out ("解除されない場合にあり" - for the case where the
  // mark must not be lifted), so the tag exists purely as documentation.
  AGH_stateDeselectKeepMark = function (user, target, stateId) {};

  // Replaces (1x, state 184): on the qualifying battle modes, upgrades the state
  // when its prerequisite is present and grants state 201 for the named skills.
  AGH_stateInitiateTierUp = function (user, target, stateId) {
    const battleMode = $gameVariables.value(182);
    if (battleMode != 2 && battleMode != 12) return;
    if (user.isStateAffected(181)) {
      user.addState(stateId + 1);
    }
    const currentSkillId = $gameVariables.value(96);
    if (currentSkillId == 256 || currentSkillId == 306 || currentSkillId == 356) {
      user.addState(201);
    }
  };

  // --- Shared state plumbing --------------------------------------------------

  // Replaces the many bare `target.addState(n)` bodies (2x Action Start 131/137/
  // 141/147 + 133/143 + 134/144 + 136/146 + 138/148 + 139/149 + 140/150 + 889,
  // Turn End 47).
  AGH_stateAddState = function (user, target, stateId, addStateId) {
    target.addState(addStateId);
  };

  // Replaces (1x, state 332): applies a whole ladder of states at once, but only
  // while the battler is alive - the original wrapped the six addState() calls in
  // `if (target.isAlive()) { ... }`.
  AGH_stateAddStatesIfAlive = function (user, target, stateId, stateIds) {
    if (!target.isAlive()) return;
    stateIds.forEach(function (id) {
      target.addState(id);
    });
  };

  //=============================================================================
  // State notetag conditions (data/states.json <Custom Passive Condition> /
  // <Custom Aura Condition>)
  //----------------------------------------------------------------------------
  // Both are compiled with new Function('condition', ...) and must leave the
  // answer in `condition`, so these helpers return a boolean and the notetag body
  // is `condition = AGH_...(user, ...);`. `stateId` is not available in that
  // scope, which is why every id below is passed in explicitly.
  //=============================================================================

  // Replaces (1x, state 104): the battler must have the passive-condition weapon
  // type equipped. valuewtype is the shared global from amygameSettei.js.
  AGH_statePassiveConditionWeaponType = function (user, weaponType) {
    return user.isWtypeEquipped(weaponType);
  };

  // Replaces (26x, states 179 / 184 / 298 / 651 / 652 / 653 / 654 / 659 / 660 /
  // 661 / 700 / 801 / 804 / 808 / 811 / 817 / 831-840): the battler must have the
  // given skill equipped in battle.
  AGH_statePassiveConditionBattleSkill = function (user, skillId) {
    return user.battleSkillsRaw().includes(skillId);
  };

  // Replaces (1x, state 184): the same, only while a battle is running.
  AGH_statePassiveConditionBattleSkillInBattle = function (user, skillId) {
    return user.battleSkillsRaw().includes(skillId) && $gameParty.inBattle();
  };

  // Replaces (1x, state 162): a battle skill plus a matching armour type.
  AGH_statePassiveConditionBattleSkillAndArmorType = function (user, skillId, armorTypeId) {
    return user.battleSkillsRaw().includes(skillId) && user.isAtypeEquipped(armorTypeId);
  };

  // Replaces (1x, state 166): a battle skill plus a matching weapon type.
  AGH_statePassiveConditionBattleSkillAndWeaponType = function (user, skillId, weaponTypeId) {
    return user.battleSkillsRaw().includes(skillId) && user.isWtypeEquipped(weaponTypeId);
  };

  // Replaces (1x, state 621): a battle skill that must not have been learned as a
  // permanent skill.
  AGH_statePassiveConditionBattleSkillNotLearned = function (user, skillId, excludedSkillId) {
    return user.battleSkillsRaw().includes(skillId) && !user.isLearnedSkill(excludedSkillId);
  };

  // Replaces (3x, states 616 / 620 / 700): the state is active until the skill is
  // learned permanently.
  AGH_statePassiveConditionNotLearnedSkill = function (user, skillId) {
    return !user.isLearnedSkill(skillId);
  };

  // Replaces (1x, state 700): the battle skill must sit at an exact mastery level.
  AGH_statePassiveConditionBattleSkillMasteryLevel = function (user, skillId, level) {
    if (!user.battleSkillsRaw().includes(skillId)) return false;
    return user.skillMasteryLevel(skillId) === level;
  };

  // Replaces (9x, states 673-677 / 687-691): an inclusive band on an element rate.
  AGH_statePassiveConditionElementRateRange = function (user, elementId, minRate, maxRate) {
    const rate = user.elementRate(elementId);
    return rate >= minRate && rate <= maxRate;
  };

  // Replaces (2x, states 501 / 502): a cell of a two-dimensional game variable
  // must have reached minValue.
  AGH_statePassiveConditionVariableCellAtLeast = function (
    user,
    variableId,
    rowIndex,
    columnIndex,
    minValue
  ) {
    return $gameVariables.value(variableId)[rowIndex][columnIndex] >= minValue;
  };

  // Replaces (2x, states 618 / 619): only while a battle is running and the
  // battler is alive.
  AGH_statePassiveConditionInBattleAlive = function (user) {
    return $gameParty.inBattle() && user.isAlive();
  };

  // Replaces (4x, states 332 / 447 / 449 / 450): the aura is suppressed while the
  // battler carries blockedStateId.
  AGH_stateAuraConditionNotAffected = function (user, blockedStateId) {
    return !user.isStateAffected(blockedStateId);
  };

  // Replaces (2x, states 444 揮下戦士 / 445 揮下魔導士): suppressed by
  // blockedStateId, otherwise it needs requiredStateId (441 / 442).
  AGH_stateAuraConditionNotAffectedAndAffected = function (user, blockedStateId, requiredStateId) {
    if (user.isStateAffected(blockedStateId)) return false;
    return user.isStateAffected(requiredStateId);
  };

  //=============================================================================
  // State notetag regen formulas (data/states.json <Custom Regen Formula>)
  //----------------------------------------------------------------------------
  // YEP_X_ExtDoT concatenates the body into state.dotFormula and eval's it inside
  // processDamageOverTimeStateEffect, where `a`/`origin` is the state's origin and
  // `b`/`user`/`target` is the battler being regenerated. The body has to leave
  // its result in `value`, and may also override the `variance` / `element`
  // locals. These helpers return all three in an object; the notetag unpacks them,
  // so the two locals are still assigned in the enclosing function exactly as
  // before.
  //
  // BUGFIX: `value` is not declared in processDamageOverTimeStateEffect, so in the
  // original a formula whose condition failed left whatever the previous DoT state
  // had written into the global `value` - the battler then healed for that stale
  // amount. The helpers seed value with 0 instead, which is what the failing
  // branch clearly intends.
  //=============================================================================

  // Replaces (5x, states 395 自己再生(小) / 396 (中) / 397 (大) / 398 (超) / 399 (神)):
  // while the origin is wounded and still has mpThreshold MP, heals
  // mpMultiplier x the origin's max MP.
  AGH_stateRegenFormulaSelfMp = function (origin, user, target, stateId, mpThreshold, mpMultiplier) {
    const state = $dataStates[stateId];
    const result = { value: 0, variance: state.dotVariance, element: state.dotElement };
    if (origin.hpRate() !== 1.0 && origin.mpRate() >= mpThreshold) {
      result.value = Math.round(origin.mmp * mpMultiplier);
      result.variance = 10;
      result.element = 12;
    }
    return result;
  };

  // Replaces (1x, state 666 回復号令): heals twice the origin's MAT for every stack
  // of the state counter.
  AGH_stateRegenFormulaMasteryCommand = function (origin, user, target, stateId) {
    return {
      value: origin.mat * 2 * user._stateCounter[stateId],
      variance: 10,
      element: 12
    };
  };

  //=============================================================================
  // Skill notetag code (data/Skills.json)
  //----------------------------------------------------------------------------
  // YEP_SkillCore eval's these bodies directly inside methods on
  // Game_BattlerBase, with `item` bound to the skill and `user`/`a`/`subject` to
  // the battler. <Custom Requirement> must leave its answer in `value` (which
  // starts as true) and <Custom Show Eval> in `visible`; <Custom HP Cost> and
  // <Custom TP Cost> must leave the new cost in `cost` (which starts as the
  // skill's flat cost plus its per-MHP / per-maxTP share). <Custom Execution>
  // returns nothing.
  //
  // Note that these are all direct eval's, so a body that throws leaves the
  // answer at its initial value - the plugins wrap them in try/catch. Helpers
  // that call Game_Actor-only methods (battleSkillsRaw, isAtypeEquipped, ...)
  // therefore still behave identically when `user` is an enemy: the throw
  // propagates out of the eval into the same catch.
  //=============================================================================

  // Replaces (1x, skill 23): requires switchId to be OFF.
  AGH_skillRequireSwitchOff = function (user, item, switchId) {
    return !$gameSwitches.value(switchId);
  };

  // Replaces (2x, skills 24 / 42): requires onSwitchId ON and offSwitchId OFF.
  //   24: if (s201) { value = !s414 } else { value = false }
  //   42: if (s213) { value = false } else { value = s202 }
  // Both reduce to s[on] && !s[off].
  AGH_skillRequireSwitchGate = function (user, item, onSwitchId, offSwitchId) {
    return $gameSwitches.value(onSwitchId) && !$gameSwitches.value(offSwitchId);
  };

  // Replaces (143x, skills 80-399 / 831 / 832): usable only while the skill is
  // equipped as a battle skill.
  AGH_skillRequireEquippedAsBattleSkill = function (user, item) {
    return user.battleSkillsRaw().contains(item.id);
  };

  // Replaces (5x, skills 256 / 258 / 306 / 308 / 356): requires an armor of
  // atypeId to be equipped.
  AGH_skillRequireArmorTypeEquipped = function (user, item, atypeId) {
    return user.isAtypeEquipped(atypeId);
  };

  // Replaces (9x, skills 701-704 / 706-710): requires a weapon of wtypeId to be
  // equipped.
  AGH_skillRequireWeaponTypeEquipped = function (user, item, wtypeId) {
    return user.isWtypeEquipped(wtypeId);
  };

  // Replaces (7x, skills 711-717): requires stateId to be active.
  AGH_skillRequireStateAffected = function (user, item, stateId) {
    return user.isStateAffected(stateId);
  };

  // Replaces (1x, skill 373): usable outside battle, or while the party holds
  // more gold than the value stored in goldVariableId.
  AGH_skillRequireNotInBattleOrGoldAbove = function (user, item, goldVariableId) {
    return !$gameParty.inBattle() || $gameParty.gold() > $gameVariables.value(goldVariableId);
  };

  // Replaces (34x, skills 600-633): free for allies, but an enemy needs at least
  // tpThreshold TP.
  AGH_skillRequireEnemyTpOrAlly = function (user, item, tpThreshold) {
    if (!user.isEnemy()) return true;
    return user.tp >= tpThreshold;
  };

  // Replaces (1x, skill 681): only listed while stateId is active.
  AGH_skillShowEvalStateAffected = function (user, item, stateId) {
    return user.isStateAffected(stateId);
  };

  // Replaces (1x, skill 363): HP cost is a rounded share of the user's CURRENT
  // hp - `user.hp / divisor * multiplier`, i.e. divisor 99 / multiplier 100
  // charges a little more than every point of HP the user has left.
  AGH_skillHpCostFromCurrentHp = function (user, item, divisor, multiplier) {
    return Math.round((user.hp / divisor) * multiplier);
  };

  // Replaces (34x, skills 600-633): enemies pay tpSurcharge more TP.
  AGH_skillTpCostEnemySurcharge = function (user, item, cost, tpSurcharge) {
    if (user.isEnemy()) cost += tpSurcharge;
    return cost;
  };

  // Replaces (1x, skill 90): writes each [variableId, value] pair.
  AGH_skillExecutionSetVariables = function (user, item, pairs) {
    for (let i = 0; i < pairs.length; i++) {
      $gameVariables.setValue(pairs[i][0], pairs[i][1]);
    }
  };

  // Replaces (1x, skill 373 ルビフリップ): spends the gold amount the player
  // has parked in goldVariableId (the menu-driven 消費額 the skill toggles).
  AGH_skillExecutionLoseGoldFromVariable = function (user, item, goldVariableId) {
    $gameParty.loseGold($gameVariables.value(goldVariableId));
  };

  //=============================================================================
  // Custom targets (data/Skills.json, data/Items.json <Custom Target Eval>)
  //----------------------------------------------------------------------------
  // Different scope from the tags above: YEP_TargetCore's makeEvalTargets fills
  // and RETURNS a local `targets` array, with `user` = the action's subject and
  // `foes`/`allies` = the opposing / friendly unit. The helpers push into the
  // array the caller passes in, because that array is the return value.
  //
  // The tag is owned by YEP_TargetCore, not YEP_SkillCore, so it applies to
  // items as well as skills - hence the neutral AGH_targetEval prefix.
  //=============================================================================

  // Replaces (1x, skill 17): every living foe whose level is a multiple of 3.
  AGH_targetEvalFoesLevelMultipleOf3 = function (targets, foes) {
    const aliveFoes = foes.aliveMembers();
    for (let i = 0; i < aliveFoes.length; ++i) {
      const member = aliveFoes[i];
      if (member.level % 3 === 0) targets.push(member);
    }
  };

  // Replaces (2x, skill 369 五神の慈しみ / item 99 ラスト・エリクサー): the whole
  // party.
  // BUGFIX: both originals pushed into `target` - a single Game_Battler, which
  // has no push() - instead of `targets`. makeEvalTargets threw, YEP's
  // try/catch swallowed it and the skill/item silently targeted nothing at all.
  AGH_targetEvalAllPartyBattleMembers = function (targets) {
    const members = $gameParty.battleMembers();
    for (let i = 0; i < members.length; ++i) {
      targets.push(members[i]);
    }
  };

  // Replaces (1x, skill 949 五神の慈しみ): the whole troop.
  // BUGFIX: same `target` -> `targets` mistake as the party version above.
  AGH_targetEvalAllTroopMembers = function (targets) {
    const members = $gameTroop.members();
    for (let i = 0; i < members.length; ++i) {
      targets.push(members[i]);
    }
  };

  //=============================================================================
  // Class base parameter formulas (data/Classes.json <Custom Class Parameters>)
  //----------------------------------------------------------------------------
  // WARNING: this tag is NOT a plain eval block. YEP_X_ClassBaseParam parses each
  // line as "<PARAM> = <expression>", keeps ONLY the expression, and appends it
  // to baseParamFormula[paramId]. That per-parameter string is then eval'd on its
  // own in Game_Actor.classBaseParamFormula, where `this`/`user` is the actor and
  // `level` is the level being computed.
  //
  // So only the right-hand side of each line can be migrated. Replacing the whole
  // body with a call would leave the formula empty, paramBase() would fall back
  // to the default, and every class would silently revert to its editor values.
  //=============================================================================

  // Replaces (10x, classes 1-5 / 21-25): the per-actor growth curve.
  //   <PARAM> = level * statas[i] * ceil(level / 20) * classRank + statas[i] * 2
  // classRank is a static notetag but this formula is re-evaluated for every
  // parameter on every level-up / status refresh, so the parsed Number is
  // cached per classId (NaN for a class without the notetag, exactly like the
  // previous Number(undefined) result).
  const classRankCache = {};
  function classRankOf(classId) {
    let rank = classRankCache[classId];
    if (rank === undefined) {
      rank = Number($dataClasses[classId].meta["classRank"]);
      classRankCache[classId] = rank;
    }
    return rank;
  }
  AGH_classBaseParamActorStatas = function (user, level, statas, statIndex) {
    const base = statas[statIndex];
    const classRank = classRankOf(user._classId);
    return level * base * Math.ceil(level / 20) * classRank + base * 2;
  };

  // Replaces (35x, classes 41-80): subclass growth, scaled by a tier multiplier
  // of 1 / 2 / 3.
  //   <PARAM> = this.classLevel(this._subclassId) * statas[i] * multiplier
  AGH_classBaseParamSubclassStatas = function (user, statas, statIndex, multiplier) {
    return user.classLevel(user._subclassId) * statas[statIndex] * multiplier;
  };

  //=============================================================================
  // Equipment notetag code (data/Armors.json, data/Weapons.json)
  //----------------------------------------------------------------------------
  // YEP_X_EquipRequirements eval's <Custom Equip Requirement Condition> inside
  // meetEquipEvalRequirements(item) with `condition` as the answer (starting
  // true) and `user`/`a`/`subject` bound to the battler; `item` is the function
  // argument, so it is in scope.
  //
  // YEP_EquipCore accumulates <Custom Parameters> into item.parameterEval and
  // eval's the WHOLE block once per parameter in evalParamPlus(item, paramId),
  // with maxhp/maxmp/atk/def/mat/mdf/agi/luk/all pre-declared and `user` bound to
  // the actor. Each line assigns one of those locals, so again only the
  // right-hand side moves.
  //=============================================================================

  // Replaces (20x, armors 81-100): equippable once at least one of skillIds has
  // been learned.
  AGH_equipReqConditionLearnedAny = function (user, item, skillIds) {
    for (let i = 0; i < skillIds.length; i++) {
      if (user.isLearnedSkill(skillIds[i])) return true;
    }
    return false;
  };

  // Replaces (2x, weapons 81 / 82): equippable only by the actor whose id sits
  // actorIdOffset above the weapon's own id.
  AGH_equipReqConditionActorMatchesOffset = function (user, item, actorIdOffset) {
    return user.actorId() === item.id - actorIdOffset;
  };

  // Replaces (8x, armor 104): the parameter scales with the wearer's level.
  AGH_equipParamFromActorLevel = function (user, item, perLevel) {
    return user.level * perLevel;
  };

  // Replaces (1x, weapon 2): the parameter is read straight out of a game
  // variable.
  AGH_equipParamFromVariable = function (user, item, variableId) {
    return $gameVariables.value(variableId);
  };

  // Replaces (2x, weapons 2 / 3): `all` is split evenly between the battle
  // members, so it is added to every parameter.
  AGH_equipParamAllSplitAmongParty = function (user, item, total) {
    return total / $gameParty.battleMembers().length;
  };

  // Replaces (16x, weapons 81 / 82): the parameter is one cell of a game
  // variable row, addressed by the weapon's own id.
  AGH_equipParamFromVariableRow = function (user, item, variableId, idOffset, statIndex) {
    return $gameVariables.value(variableId)[item.id - idOffset][statIndex];
  };

  // =====================================================================
  // Skill learn conditions (data/Skills.json)
  //
  // <Learn Show Eval> and <Learn Require Eval> are both evaluated by
  // Window_SkillLearn.prototype.getEvalLine (YEP_SkillLearnSystem.js:983):
  //
  //     var value = undefined;
  //     var a = this._actor; var user = this._actor; var subject = this._actor;
  //     var s = $gameSwitches._data; var v = $gameVariables._data;
  //     try { eval(code); } catch (e) { ... }
  //     return value;
  //
  // A direct eval whose answer must be left in `value`, starting from
  // `undefined`. There is no `item` and no `this`; `a`/`user`/`subject` are
  // the actor. The caller treats `undefined` as "no opinion" and falls through
  // to the default level / skill / switch / mastery checks, so a body that
  // assigns to anything but `value` silently disables itself.
  //
  // BUGFIX: 71 of the 79 <Learn Show Eval> bodies were written as
  // `value1 = learn_show_eval_...(user, N);`. `value1` is not declared in this
  // scope, so the assignment created a global and `value` stayed undefined -
  // every one of those custom show conditions was dead and the skills fell
  // back to the default rules. They now assign to `value`.
  //
  // The four `learn_show_eval_*` helpers themselves live in amygame.js beside
  // the rest of the learn-menu code (they were extracted before this file
  // existed); the helpers below are the bodies that were still inline.
  // =====================================================================

  // Replaces (6x, skills 694-699): shown while the given parameter is 100+.
  AGH_learnShowEvalParamAbove = function (user, paramId, threshold) {
    return user.param(paramId) >= threshold;
  };

  // Replaces (1x skill 747 上級魔力操作 / 1x skill 748 超級魔力操作): the
  // upgrade stays visible only until it is learned, and only while the
  // prerequisite is learned and the actor's MAT is high enough. Skill 747
  // additionally requires the prerequisite to be at max mastery.
  AGH_learnShowEvalMagicControlUpgrade = function (user, skillId, reqSkillId, reqMat, reqMastery) {
    if (user.isLearnedSkill(skillId)) return false;
    if (!user.isLearnedSkill(reqSkillId)) return false;
    if (user.mat < reqMat) return false;
    if (
      reqMastery &&
      user.skillMasteryLevel(reqSkillId) < Number($dataSkills[reqSkillId].meta["Max Mastery Level"])
    ) {
      return false;
    }
    return true;
  };

  // Replaces (21x): the skill is learnable once its prerequisite is learned
  // and mastered to at least minMastery.
  AGH_learnRequireSkillMastered = function (user, skillId, minMastery) {
    return user.isLearnedSkill(skillId) && user.skillMasteryLevel(skillId) >= minMastery;
  };

  // Replaces (6x): the skill is learnable once its prerequisite is learned.
  AGH_learnRequireSkillLearned = function (user, skillId) {
    return user.isLearnedSkill(skillId);
  };

  // Replaces (20x): the skill is learnable once its prerequisite has reached
  // its own max mastery level.
  AGH_learnRequireSkillMaxMastery = function (user, skillId) {
    return user.skillMasteryLevel(skillId) >= Number($dataSkills[skillId].meta["Max Mastery Level"]);
  };

  // Replaces (11x): the skill is learnable while the party carries the item
  // (including in the bag, hence the second argument to hasItem).
  AGH_learnRequirePartyHasItem = function (user, itemId) {
    return $gameParty.hasItem($dataItems[itemId], true);
  };

  // Replaces (1x, skill 746 魔力操作): learnable once MAT reaches the
  // threshold.
  AGH_learnRequireMatAbove = function (user, threshold) {
    return user.mat >= threshold;
  };

  // Replaces (6x): learnable once every listed skill is mastered to at least
  // minMastery.
  AGH_learnRequireAllSkillsMastered = function (user, skillIds, minMastery) {
    return skillIds.every(function (id) {
      return user.skillMasteryLevel(id) >= minMastery;
    });
  };

  // Replaces (1x, skill 331 カウンターⅡ): learnable once the prerequisite is
  // mastered AND a second skill is learned.
  AGH_learnRequireSkillMasteredAndOther = function (user, skillId, minMastery, otherSkillId) {
    return (
      user.isLearnedSkill(skillId) &&
      user.skillMasteryLevel(skillId) >= minMastery &&
      user.isLearnedSkill(otherSkillId)
    );
  };

  // =====================================================================
  // Damage formulas (data/Skills.json)
  //
  // <damage formula> replaces the database formula box entirely and is
  // evaluated by Game_Action.prototype.evalDamageFormula
  // (YEP_DamageCore.js:1353):
  //
  //     var item = this.item();
  //     var a = this.subject(); var b = target;
  //     var user = this.subject(); var subject = this.subject();
  //     var s = $gameSwitches._data; var v = $gameVariables._data;
  //     var sign = ([3, 4].contains(item.damage.type) ? -1 : 1);
  //     var value = 0;
  //     if (item.damage.custom) { eval(item.damage.formula); value = Math.max(value, 0) * sign; }
  //
  // The answer goes in `value`. `this` is the Game_Action and `target` is the
  // action's target. NOTE: MPP_Patch (plugins.js:19) and YEP_X_CoreUpdatesOpt
  // (:65) each redefine evalDamageFormula too, but YEP_DamageCore loads last
  // (:116), so this is the definition that wins - MPP_Patch's patch 16 (the
  // NaN guard and the `v[n]` substitution) is dead code in this project.
  //
  // Helpers used by the other 270-odd bodies (skillItem_titles, skill_titles,
  // skill_personalonoff, skill_equipOperation, skill_stateonoff,
  // powerUp_dispel, abNomal_Clear, seiyoku_itemHanei, kantei_ikkatu,
  // search_object) already existed; only the still-inline bodies are here.
  // =====================================================================

  // Replaces (1x, skill 17 メモ): swaps the actor's normal-attack skill for
  // the one whose id sits 400 below this skill's, after clearing the whole
  // 101-200 state band.
  AGH_damageFormulaSwapAttackSkill = function (action, user, target) {
    if (target.actorId() !== user.actorId()) return;
    const item = action.item();
    const stateId = item.id - 400;
    if (target.isStateAffected(stateId)) {
      const targetName = target.name();
      const itemName = item.name;
      TickerManager.show(`${targetName}の通常攻撃は${itemName}です`);
      return;
    }
    const targetName = target.name();
    const itemName = item.name;
    for (let stateIndex = 101; stateIndex <= 200; stateIndex++) target.removeState(stateIndex);
    target.addState(stateId);
    TickerManager.show(`${targetName}の通常攻撃を${itemName}に変更しました`);
  };

  // Replaces (1x, skill 26 持ち上げ＜OFF＞): flips the pickup flag and the
  // skill's own name between ＜ON＞ and ＜OFF＞.
  AGH_damageFormulaTogglePickup = function (action, user, target) {
    if (target.actorId() !== user.actorId()) return;
    const item = action.item();
    const onMsg = "持ち上げ＜ON＞";
    if (item.name === onMsg) {
      $gameSystem._pickupData[0] = false;
      item.name = "持ち上げ＜OFF＞";
    } else {
      $gameSystem._pickupData[0] = true;
      item.name = onMsg;
    }
    const itemName = `<\x1bSIN[${item.id}]>`;
    TickerManager.show(`${itemName}に変更しました`);
  };

  // Replaces (1x, skill 35 マップステータス).
  AGH_damageFormulaSelectMapStatus = function (action, user, target) {
    if (target.actorId() !== user.actorId()) return;
    const item = action.item();
    skill_sentaku(item.id, 0);
    const itemName = "＜" + item.name + "＞";
    TickerManager.show(`${itemName}に変更しました`);
    info_SetY($gameVariables.value(200));
  };

  // Replaces (1x, skill 42 視点変更): moves the map viewpoint state (601)
  // from the actor currently in variable 11 to the caster.
  AGH_damageFormulaChangeViewpoint = function (user, target) {
    if (target.actorId() !== user.actorId()) return;
    const currentViewpointActorId = $gameVariables.value(HELPER_VARIABLE.VIEWPOINT_ACTOR_ID);
    const userName = user.name();
    if (user.actorId() === currentViewpointActorId) {
      TickerManager.show(`現在の視点は${userName}の為、変更はありません。`);
      return;
    }
    $gameSwitches.setValue(151, true);
    $gameActors.actor(currentViewpointActorId).removeState(601);
    $gameVariables.setValue(HELPER_VARIABLE.VIEWPOINT_ACTOR_ID, user.actorId());
    $gameActors.actor($gameVariables.value(HELPER_VARIABLE.VIEWPOINT_ACTOR_ID)).addState(601);
    TickerManager.show(`現在の視点を${userName}に変更しました。`);
  };

  // Replaces (1x, skill 45 立ち絵全裸): toggles the actor's nude flag (cell
  // 23 of variable 440 + actorId) and refreshes the portrait.
  //
  // BUGFIX: both messages were single-quoted strings, so the player was shown
  // the literal text `${b.name}は着衣になりました。`. They are template
  // literals now, and `${b.name}` became `${target.name()}` - `name` is a
  // method on Game_Battler, so interpolating it without the call would have
  // printed the function source instead of the actor's name.
  AGH_damageFormulaToggleNude = function (target) {
    const nudeFlags = $gameVariables.value(440 + target.actorId());
    const targetName = target.name();
    if (nudeFlags[23] === 1) {
      nudeFlags[23] = 0;
      TickerManager.show(`${targetName}は着衣になりました。`);
    } else {
      nudeFlags[23] = 1;
      TickerManager.show(`${targetName}は全裸になりました。`);
    }
    $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID, target.actorId());
    tachie_settei2();
  };

  // Replaces (1x, skill 90 青眼の構え用反撃用スキル).
  //
  // NOT fixed, deliberately. The original body was:
  //     var value1 = 206;
  //     var value2 = a.getStateCounter(154);
  //     if(value2 == 0){ ...log... } else { value2 * a.skillMasteryLevel(value1) - b * 2 };
  // Two bugs sit here and they happen to cancel out:
  //   * the else-branch is a bare expression, so its result was discarded and
  //     the skill always dealt 0 damage;
  //   * `b * 2` is NaN anyway, because Game_Battler has no valueOf.
  // The helper returns the value instead of assigning it, which keeps the
  // damage at 0 exactly as before. Assigning it to `value` would make the
  // damage - and then the target's HP - NaN, which is a worse bug than the
  // one being fixed. What the counter should actually deal is a design
  // decision, so it is left alone and reported.
  AGH_damageFormulaStanceCounter = function (user, target, sourceSkillId, stanceStateId) {
    const counter = user.getStateCounter(stanceStateId);
    if (counter === 0) {
      const targetName = target.name();
      const skillName = $dataSkills[sourceSkillId].name;
      BattleManager._logWindow.push("addText", `${targetName}の${skillName}は不発に終わった…。`);
      return 0;
    }
    return counter * user.skillMasteryLevel(sourceSkillId) - target * 2;
  };

  const ROUNDED_COSTS = {
    10000000: 1000,
    1000000: 10000000,
    100000: 1000000,
    10000: 100000,
    1000: 10000
  };

  // Replaces (1x, skill 373 ルビフリップ): in battle this is the damage
  // formula; outside battle it steps the 消費額 variable (268) through
  // 1000 -> 10000 -> 100000 -> 1000000 -> 10000000 -> 1000 and reports it.
  AGH_damageFormulaRubyFlip = function (action, user, target) {
    const item = action.item();
    if ($gameParty.inBattle()) {
      const parts = String($dataSkills[item.id].meta["DamageFormula2"]).split(",");
      return Math.max(
        $attack1(Number(parts[0]), user, target, Number(parts[1])) * Number(parts[2]),
        user.mdf / 10
      );
    }
    const nextCost = ROUNDED_COSTS[$gameVariables.value(268)];
    if (nextCost !== undefined) $gameVariables.setValue(268, nextCost);

    const itemName = `\x1bSIN[${item.id}]`;
    const charaName = colorTaggedText(10, $gameVariables.value(268).toLocaleString());
    TickerManager.show(`${itemName}の消費額が${charaName}に変更されました。`);
    return 0;
  };

  // Replaces (1x, skill 686 完全支配).
  //
  // BUGFIX: the database had `b.isLearnedSkill(687);` - a query whose result
  // was thrown away, so the target was never actually granted skill 687 even
  // though the message says it was (「…は[絶対服従]を付与された！」).
  AGH_damageFormulaDominate = function (target) {
    if ($dataActors[target.actorId()].meta["Mcharacter"]) {
      target.learnSkill(687);
      const targetName = target.name();
      const skillName = colorTaggedText(27, "\x1bSIN[687]");
      TickerManager.show(`${targetName}は${skillName}を付与された！`);
      return;
    }
    const targetName = target.name();
    const failedTargetName = colorTaggedText(2, targetName);
    TickerManager.show(`${failedTargetName}には効果が無かった…。`);
  };

  // Replaces (1x, skill 787 隠形): toggles the map stealth mode.
  AGH_damageFormulaToggleStealth = function (user, target) {
    if (target.actorId() !== user.actorId()) return;
    if ($gameSwitches.value(HELPER_SWITCH.TOWN)) {
      TickerManager.show("このマップでは使用できません。");
      return;
    }
    const stealthModeName = "ステルス・モード";
    if (!$gamePlayer.isStealthMode()) {
      $gamePlayer.setStealthTimer(10800);
      TickerManager.show(`＜${stealthModeName}＞${ON_MARK}`);
    } else {
      $gamePlayer.setStealthMode(false);
      TickerManager.show(`＜${stealthModeName}＞${OFF_MARK}`);
    }
  };

  // Replaces (1x, skill 788 看破): unlocks the enemy status view.
  AGH_damageFormulaRevealStatus = function (target) {
    $gameVariables.setValue(92, target.index());
    if (!$gameSwitches.value(HELPER_SWITCH.ENEMY_STATUS_VISIBLE)) {
      $gameSwitches.setValue(HELPER_SWITCH.ENEMY_STATUS_VISIBLE, true);
      time_settei();
      const targetName = target.name();
      BattleManager._logWindow.push("addText", `${targetName}達のStatus閲覧可能`);
    }
  };

  // Replaces (1x, skill 789 感知): scans every event on the map and reports
  // how many unopened treasures, symbols, H-enemies and gather points are
  // left. Toggles window 0 on switch 603.
  AGH_damageFormulaSenseMap = function (user, target) {
    if (target.actorId() !== user.actorId()) return;
    if ($gameSwitches.value(HELPER_SWITCH.TOWN)) {
      TickerManager.show("このマップでは使用できません。");
      return;
    }
    if ($gameSwitches.value(HELPER_SWITCH.SENSE_MAP_WINDOW_OPEN)) {
      WindowManager.hide(0);
      valueCountSet1 = 0;
      $gameSwitches.setValue(HELPER_SWITCH.SENSE_MAP_WINDOW_OPEN, false);
      return;
    }
    const counts = countSenseMapObjects($gameMap);
    const reportText = buildSenseMapReport(counts);
    WindowManager.show(0, 0, 0, 1280, 290);
    WindowManager.drawText(0, reportText);
    valueCountSet1 = 1;
    $gameSwitches.setValue(HELPER_SWITCH.SENSE_MAP_WINDOW_OPEN, true);
  };

  // Replaces (4x, skills 791 拠点錬金 / 792 単一錬金個数+ / 794 【匠】掘り /
  // 799 大量採取).
  //
  // BUGFIX: the database called `skill_titles(a,b,this.item().id)`, and no
  // function of that name exists anywhere in the project - so the whole
  // <damage formula> threw a ReferenceError that YEP's try/catch swallowed.
  // The other 226 title skills all call `skillItem_titles(a,b,this.item().id,0)`
  // (the 4th argument selects $dataSkills over $dataItems), so these four do
  // too. Inert today - all four are occasion 3 ("never"), so the tag is
  // unreachable - but no longer a dangling reference.
  AGH_damageFormulaSkillTitle = function (action, user, target) {
    skillItem_titles(user, target, action.item().id, 0);
  };

  // =====================================================================
  // Skill after-effects (data/Skills.json)
  //
  // <After Eval> is evaluated by Game_Action.prototype.applyAfterEval
  // (YEP_SkillCore.js:1119):
  //
  //     var item = this.item();
  //     var a = this.subject(); var b = target;
  //     var user = this.subject(); var subject = this.subject();
  //     var s = $gameSwitches._data; var v = $gameVariables._data;
  //     var code = item.customAfterEval;
  //     try { eval(code); } catch (e) { ... }
  //
  // A direct eval that RETURNS NOTHING - the body only has side effects.
  // `this` is the Game_Action, `target` is the action's target, and
  // `item`/`a`/`b`/`user` are all bound.
  // =====================================================================

  // Replaces (6x, skills 207 / 208 / 222 / 324 / 362 / 388).
  AGH_afterEvalAddState = function (user, stateId) {
    user.addState(stateId);
  };

  // Replaces (4x, skills 284 / 294 / 332 / 338).
  AGH_afterEvalGainTp = function (user, amount) {
    user.gainTp(amount);
  };

  // Replaces (3x, skills 298 / 349 / 397): an equipped instrument (weapon
  // type 10) adds a state to the target.
  AGH_afterEvalInstrumentTargetState = function (user, target, stateId) {
    if (!user.isActor()) return;
    if (!user.isWtypeEquipped(10)) return;
    target.addState(stateId);
  };

  // Replaces (2x, skills 296 / 346): an equipped instrument adds a state to
  // the user.
  AGH_afterEvalInstrumentSelfState = function (user, stateId) {
    if (!user.isActor()) return;
    if (!user.isWtypeEquipped(10)) return;
    user.addState(stateId);
  };

  // Replaces (2x, skills 347 / 348): an equipped instrument rolls a state
  // formula on the target.
  AGH_afterEvalInstrumentStateFormula = function (user, target, stateId) {
    if (!user.isActor()) return;
    if (!user.isWtypeEquipped(10)) return;
    state_addFormula1([stateId, 50, user, target, user.mdf, target.luk]);
  };

  // Replaces (1x, skill 297 チャームボイスⅠ): the same, with a battle-log
  // line first.
  AGH_afterEvalInstrumentStateFormulaLogged = function (user, target, stateId) {
    if (!user.isActor()) return;
    if (!user.isWtypeEquipped(10)) return;
    BattleManager._logWindow.push("addText", "楽器装備による追加効果！");
    state_addFormula1([stateId, 50, user, target, user.mdf, target.luk]);
  };

  // Replaces (2x, skills 248 ヒールオールⅢ / 311 ヒールオールⅡ): the passive
  // battle skill adds a state to the user.
  AGH_afterEvalBattleSkillAddState = function (user, skillId, stateId) {
    if (user.battleSkillsRaw().contains(skillId)) user.addState(stateId);
  };

  // Replaces (2x, skills 250 リヴァイブⅡ / 313 リヴァイブ): the passive battle
  // skill heals the target for a tenth of the skill's DamageFormula2 attack.
  AGH_afterEvalBattleSkillHealFromAttack = function (action, user, target, skillId) {
    if (!user.battleSkillsRaw().contains(skillId)) return;
    const parts = String($dataSkills[action.item().id].meta["DamageFormula2"]).split(",");
    const damage = Math.max(
      $attack1(Number(parts[0]), user, target, Number(parts[1])) * Number(parts[2]),
      user.mdf / 10
    );
    target.gainHp(Math.round(damage / 10));
  };

  // Replaces (1x, skill 391 チャフリリース).
  AGH_afterEvalDispelAndAddState = function (action, user, target, stateId) {
    powerUp_dispel(user, target, action.item().id, 0);
    user.addState(stateId);
  };

  // Replaces (1x, skill 398 デファンデュ): an equipped instrument adds a state
  // to every battle member.
  AGH_afterEvalInstrumentPartyState = function (user, stateId) {
    if (!user.isActor()) return;
    if (!user.isWtypeEquipped(10)) return;
    const members = $gameParty.battleMembers();
    for (let i = 0; i < members.length; i++) {
      members[i].addState(stateId);
    }
  };

  // Replaces (1x, skill 431 経験値獲得率1000%up).
  AGH_afterEvalLogExpRate = function (target) {
    const rate = Math.round(target.exr * 100);
    const targetName = target.name();
    BattleManager._logWindow.push("addText", `${targetName}の経験値獲得率が上昇し${rate}%になった！`);
  };

  // Replaces (1x, skill 432 ルピ獲得率1000%up).
  AGH_afterEvalLogGoldRate = function () {
    BattleManager._logWindow.push("addText", "パーティの獲得\\Gレートが10倍になった！");
  };

  // Replaces (2x, skills 433 ダメージ上限撤廃 / 434 バフ上限最大値 - the
  // database gives both the same body, so both announce a damage cap).
  // Both after-evaluation notices are "<name><sentence>"; only the sentence differs.
  function logTargetSentence(target, sentence) {
    const targetName = target.name();
    BattleManager._logWindow.push("addText", `${targetName}${sentence}`);
  }

  AGH_afterEvalLogDamageCapRemoved = function (target) {
    logTargetSentence(target, "のダメージ上限が取り払われた！");
  };

  // Replaces (1x, skill 891 仲間を呼ぶ).
  AGH_afterEvalLogCalledAllies = function (target) {
    logTargetSentence(target, "は仲間を呼んだ！");
  };

  const CHARACTER_LOOK_VARIANTS = [
    "はこちらの様子を見ている…。",
    "はボーっとしている…。",
    "はあらぬ方向を眺めている…。",
    "は故郷に想いを馳せている…。"
  ];

  // Replaces (1x, skill 892 様子を見る). The idle line is rolled BEFORE the
  // state checks, exactly as in the original, so the RNG stream is unchanged.
  AGH_afterEvalLogIdleMessage = function (target) {
    let text;
    if (target.isStateAffected(420)) {
      text = "「………………」。";
    } else if (target.isStateAffected(91)) {
      text = "は厭らしい嗤いを浮かべている…。";
    } else {
      text = CHARACTER_LOOK_VARIANTS[getRandomIndex(CHARACTER_LOOK_VARIANTS.length)];
    }
    BattleManager._logWindow.push("addText", target.name() + text);
  };

  // Replaces (1x, skill 893 Ｈ攻撃).
  AGH_afterEvalSetSwitch = function (switchId) {
    $gameSwitches.setValue(switchId, true);
  };

  // Replaces (1x, skill 894 逃げる): the enemy refunds the exp/gold rate its
  // own states had granted, then reports the new totals. valueTotalexp /
  // valueTotalgold are the globals declared in amygameSettei.js.
  AGH_afterEvalFleeAndReport = function (user, target) {
    user._states.forEach(function (stateId) {
      const stateData = $dataStates[stateId];
      if (stateData.meta["EnemyExpRate"]) {
        valueTotalexp -= Number(stateData.meta["EnemyExpRate"]);
      }
      if (stateData.meta["EnemyGoldRate"]) {
        valueTotalgold -= Number(stateData.meta["EnemyGoldRate"]);
      }
    });
    logTargetSentence(target, "は逃げ出した！");
    const expRateText = valueTotalexp;
    const goldRateText = valueTotalgold;
    BattleManager._logWindow.push("addText", `経験値レート:${expRateText}`);
    BattleManager._logWindow.push("addText", `\\Gレート:${goldRateText}`);
  };
  //=============================================================================
  // Event Script (355/655) migration
  //=============================================================================
  //
  // The functions below were generated from the Script (355/655) command blocks
  // in data/CommonEvents.json and data/Map*.json. Every block that was either
  // duplicated across events or proven to execute at runtime was moved here, and
  // each source command was reduced to a single call to a readable,
  // context-based helper (e.g. AGH_showHExperienceTable1(), AGH_initLeadActorAndRespawn()):
  //
  //   helperName();            // self-contained bodies
  //   helperName(interp, ...); // bodies that used the interpreter (this)
  //
  // Contracts:
  //  - functions that drive a child interpreter receive the Game_Interpreter as
  //    their first argument (named `interp`); redundant interpreter wrappers are flattened where safe, using `interp`
  //    explicitly; callback bindings are retained, including for the
  //    callbacks that were passed `this` in the source block.
  //  - Parameters are named by their role/meaning in the source block (e.g.
  //    newValue, countValue, posX, posX2, requestedPartnerWeaponId) instead of
  //    the old positional __a0, __a1, ... placeholders.
  //  - Player-facing text is split into `var xxx = `...`;` (language)
  //    and `// code, not translation text` (control codes) consts at the top of
  //    the function; the message template below interpolates them, so the
  //    rendered string is byte-identical to the original.
  //  - Bodies intentionally assign implicit globals (valuePic1, valueCountSet*)
  //    exactly like the original snippets; this file is not strict mode.
  // Replaces (1x): data/CommonEvents.json:common-event:1
  AGH_setVariable250GameplayTips = function () {
    const messageText2 = "シーンの多くは、メインクエスト終了後に開放される。";
    const textPart2 = "本作には多様な強化システムを採用しているが、\nメインクエストとシーン回収だけを考えれば、\n極論レベルを上げて剣と杖で殴っていれば問題ない。";
    const textPart3 = "「朝昼」と「夜」では発生するイベントに変化がある。\nこれはメインクエストに措いても同様。\n進行条件が「〇〇に会いに行く」などの場合、\n夜では会えない事が多い。日を改めて日中に会いに行こう";
    const textPart4 = "シーンや挿話には「同一人物のシーンは同日に発生しない」という\n縛りが存在する場合がある。\n日数経過をさせる事で発生するようになる。";
    const textPart5 = "メインクエスト進行時の戦闘に、敗北Ｈはない";
    const textPart6 = "Ｈエネミーはそのマップで敗北Ｈを経験する事で出現する。\nＨエネミーに敗北すると汎用全滅シーンが発生する。";
    const textPart7 = "「称号」は、条件を満たした後、「一日の始まり」か「ギルド受付」と\n話した直後に付与される。";
    $gameVariables.setValue(250, [
      colorTaggedText(2, "[1]") + `${messageText2}`,
      colorTaggedText(2, "[2]") + `${textPart2}`,
      colorTaggedText(2, "[3]") + `${textPart3}`,
      colorTaggedText(2, "[4]") + `${textPart4}`,
      colorTaggedText(2, "[5]") + `${textPart5}`,
      colorTaggedText(2, "[6]") + `${textPart6}`,
      colorTaggedText(7, "[1]") + `${textPart7}`,
      colorTaggedText(2, "[8]"),
      colorTaggedText(2, "[9]"),
      colorTaggedText(2, "[10]")
    ]);
  };

  // Replaces (14x): data/CommonEvents.json:common-event:1, data/CommonEvents.json:common-event:21, data/CommonEvents.json:common-event:22, data/CommonEvents.json:common-event:47, data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:167, …
  AGH_setPictureMotion1 = function () {
    //picture_motion1("smooth",[0]);
    picture_motion1("linear", [0]);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:1
  AGH_setMessagePictureAnimationParams = function () {
    $gameMessage._IZSTPicShowParam = [550 + 640, 384 + 100, 100, 100, 100];
    $gameMessage._IZSTPicMoveParam = [500 + 640, 384 + 100, 100, 100, 255, 30];
  };

  // Replaces (1x): data/CommonEvents.json:common-event:1
  AGH_setHVScrollingMenuBackground = function () {
    $gameVariables.setValue(81, 0); //メニュー背景横スク
    $gameVariables.setValue(82, 0); //メニュー背景縦スク
  };

  /* ============================================================================
   * Shared helpers
   * ----------------------------------------------------------------------------
   * These functions are called *by name* from data/CommonEvents.json and from the
   * map data, so every public name is preserved.  Only the bodies were rewritten
   * in terms of the helpers below — they replace patterns that had been
   * copy-pasted dozens (in a few cases hundreds) of times.
   *
   * Variable-naming convention used throughout:
   *   variableNNValue      -> contextName          (e.g. actorId, partnerWeaponId)
   *   pictureId2/name2/x4  -> pictureId/pictureName/x
   *   numericValue/text... -> the real meaning (posX, duration, particleName, ...)
   * ========================================================================== */

  /* --- variables / switches / self switches -------------------------------- */

  function varValue(variableId) {
    return $gameVariables.value(variableId);
  }
  function setVar(variableId, value) {
    $gameVariables.setValue(variableId, value);
  }
  function setSelfVar(interp, variableId, value) {
    $gameVariables.setValue(variableId, value);
  }
  function clearSelfVarRange(interp, firstId, lastId) {
    range(firstId, lastId).forEach((variableId) => setSelfVar(interp, variableId, 0));
  }
  function range(from, to) {
    const values = [];
    for (let value = from; value <= to; value++) values.push(value);
    return values;
  }
  /* `AGH_enableSwitch` / `AGH_disableSwitch` are public (called from the data files) and
     are defined once, further down in the switches section. */
  function selfSwitchOn(mapId, eventId, key) {
    $gameSelfSwitches.setValue([mapId, eventId, key], true);
  }
  function selfSwitchOff(mapId, eventId, key) {
    $gameSelfSwitches.setValue([mapId, eventId, key], false);
  }
  function mapSelfSwitchOn(eventId, key) {
    selfSwitchOn($gameMap.mapId(), eventId, key);
  }
  function mapSelfSwitchOff(eventId, key) {
    selfSwitchOff($gameMap.mapId(), eventId, key);
  }
  function actorFromVariable(variableId) {
    return $gameActors.actor(varValue(variableId));
  }
  function applyFlagToSwitch(switchId, flag) {
    $gameSwitches.setValue(switchId, !!flag);
  }
  function findItemIdByMetaKey(metaKey) {
    const items = $dataItems;
    for (let itemId = 1; itemId < items.length; itemId++) {
      const item = items[itemId];
      if (item && item.meta && item.meta[metaKey]) return itemId;
    }
    return 0;
  }
  function spendGoldForJobMaterial(goldAmount, materialMetaKey) {
    $gameParty.loseGold(goldAmount);
    $gameParty.loseItem($dataItems[findItemIdByMetaKey(materialMetaKey)], 1);
  }
  function eraseEventsWithMetaKeys(metaKeys) {
    const map = $gameMap;
    const events = map.events();
    for (let eventIndex = events.length - 1; eventIndex >= 0; eventIndex--) {
      const event = events[eventIndex];
      if (!event) continue;
      const eventData = event.event();
      if (!eventData || !eventData.meta) continue;
      const meta = eventData.meta;
      if (metaKeys.some((metaKey) => meta[metaKey])) map.eraseEvent(event.eventId());
    }
  }
  /**
   * Same as forEachDatabaseMeta(), but with the original debug-scan quirk kept:
   * the loop advanced by the "slot" counter instead of 1, so only a subset of
   * the database is visited.  The callback returns true when the slot counter
   * must advance (i.e. when the original incremented it).
   */
  function forEachSteppedMetaEntry(database, metaKey, callback) {
    let slotCounter = 1;
    for (let entryId = 1; entryId < database.length; entryId += slotCounter) {
      const metaValue = database[entryId].meta[metaKey];
      if (!metaValue) continue;
      if (callback(entryId, metaValue, slotCounter)) slotCounter += 1;
    }
  }
  function forEachDatabaseMeta(database, metaKey, callback) {
    for (let entryId = 1; entryId < database.length; entryId++) {
      const metaValue = database[entryId].meta[metaKey];
      if (metaValue) callback(entryId, metaValue);
    }
  }

  /* --- recurring state ids (documented once instead of per call site) ------ */

  const DEPLOYED_ACTOR_START_VAR = 75; // 登場キャラ始点
  const DEPLOYED_ACTOR_END_VAR = 76; // 登場キャラ終点
  const HEROINE_ID_LIST_VAR = 247; // ヒロインID配列
  const CURRENT_ACTOR_VAR = 20; // 汎用「対象キャラ」
  const LEAD_ACTOR_VAR = 530; // 主格キャラ
  const SPAWNED_EVENT_TABLE_VAR = 292; // スポーンしたイベントID表
  const NPC_PRESET_TABLE_VAR = 163; // NPC外見プリセット表
  const NPC_PRESET_INDEX_VAR = 535; // 使用中のプリセット番号
  const QUEST_OBJECTIVE_VAR = 134; // クエスト目標テキスト
  const TICKER_WAIT_VAR = 71; // ティッカー表示ウェイト
  const TICKER_WAIT_FRAMES = 240;

  function forEachDeployedActor(callback) {
    const firstActorId = varValue(DEPLOYED_ACTOR_START_VAR);
    const lastActorId = varValue(DEPLOYED_ACTOR_END_VAR);
    if (!Number.isInteger(firstActorId) || !Number.isInteger(lastActorId)) return;
    if (firstActorId < 1 || lastActorId < firstActorId) return;
    // Snapshot both bounds, as the previous range(...).forEach(...) implementation did.
    for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
      callback(actorId);
    }
  }

  // Actor records live in variable 380 + actorId; field meanings are confirmed in
  // amygame.js (SecondName setup) and amygameSeiyoku.js (daily assault records).
  const CHARACTER_H_RECORD_BASE_VARIABLE_ID = 380;
  const CHARACTER_SURNAME_WEAPON_OFFSET = 200;
  const CHARACTER_H_RECORD_FIELD = { SURNAME: 50, DAILY_ASSAULT_COUNT: 71 };
  const PREGNANCY_STATE_ID = 83;
  const PROFESSION_RETURN_SKILL_ID = 18;

  function forEachCharacterHRecord(callback) {
    const variables = $gameVariables;
    const actorIds = variables.value(HELPER_VARIABLE.CHARACTER_ACTOR_IDS);
    if (!Array.isArray(actorIds)) return;
    // forEach preserves the source's sparse-array and initial-length behavior.
    actorIds.forEach(function (actorId) {
      if (!Number.isInteger(actorId) || actorId < 1) return;
      const hRecords = variables.value(CHARACTER_H_RECORD_BASE_VARIABLE_ID + actorId);
      if (!Array.isArray(hRecords)) return;
      callback(actorId, hRecords);
    });
  }

  function synchronizeCharacterSurnames() {
    const weapons = $dataWeapons;
    forEachCharacterHRecord(function (actorId, hRecords) {
      const surnameWeapon = weapons[CHARACTER_SURNAME_WEAPON_OFFSET + actorId];
      if (!surnameWeapon) return;
      const surname = hRecords[CHARACTER_H_RECORD_FIELD.SURNAME];
      if (surname === undefined) return;
      surnameWeapon.name = surname;
    });
  }

  function resetDailyAssaultCount(actorId, hRecords) {
    hRecords[CHARACTER_H_RECORD_FIELD.DAILY_ASSAULT_COUNT] = 0;
  }

  function applyDailyAssaultPenalty(actorId, hRecords) {
    if (!(hRecords[CHARACTER_H_RECORD_FIELD.DAILY_ASSAULT_COUNT] >= 1)) return;
    const gameActor = $gameActors.actor(actorId);
    if (!gameActor) return;
    const battleSkillIds = gameActor.battleSkillsRaw();
    if (battleSkillIds.indexOf(847) !== -1) return;
    gameActor.addState(67);
  }

  function processPregnancyForDeployedActors() {
    forEachDeployedActor(processDeployedActorPregnancy);
  }

  function processDeployedActorPregnancy(actorId) {
    const gameActor = $gameActors.actor(actorId);
    // Compatibility: the original event scripts publish the last visited actor.
    // Keep that write explicit, but never use this mutable global to drive the loop.
    // actor = gameActor; // commented global assign, will check if it will throw error somewhere later
    if (!gameActor || !gameActor.isStateAffected(PREGNANCY_STATE_ID)) return;
    actor_pregnancyCalculation(actorId);
  }

  function forgetProfessionReturnSkill(actorId) {
    const gameActor = $gameActors.actor(actorId);
    if (!gameActor) return;
    gameActor.forgetSkill(PROFESSION_RETURN_SKILL_ID);
  }

  function returnProfessionBasicsIfLearned(actorId) {
    const gameActor = $gameActors.actor(actorId);
    if (!gameActor || !gameActor.isLearnedSkill(PROFESSION_RETURN_SKILL_ID)) return;
    Profession_basicReturn(actorId);
  }
  function forEachHeroine(callback) {
    varValue(HEROINE_ID_LIST_VAR).forEach(callback);
  }
  function currentActor() {
    return actorFromVariable(CURRENT_ACTOR_VAR);
  }
  function spawnedEventId(slotIndex) {
    return varValue(SPAWNED_EVENT_TABLE_VAR)[slotIndex];
  }
  function spawnedEvent(slotIndex) {
    return $gameMap.event(spawnedEventId(slotIndex));
  }
  function currentNpcPreset() {
    return varValue(NPC_PRESET_TABLE_VAR)[varValue(NPC_PRESET_INDEX_VAR)];
  }

  /* --- pictures ------------------------------------------------------------ */

  const SCENE_PICTURE_X = 640 - 128; // 512 : left-hand scene pictures
  const SCENE_PICTURE_Y = 384;
  const RIGHT_PICTURE_X = 640 + 480; // 1120: right-hand scene pictures
  const SCENE_FADE_FRAMES = 60;

  function showPic(pictureId, pictureName, x, y, scaleX, scaleY, opacity, origin) {
    $gameScreen.showPicture(
      pictureId,
      pictureName,
      origin === undefined ? 1 : origin,
      x,
      y,
      scaleX,
      scaleY,
      opacity,
      0
    );
  }
  function movePic(pictureId, x, y, scaleX, scaleY, opacity, duration, origin) {
    $gameScreen.movePicture(
      pictureId,
      origin === undefined ? 1 : origin,
      x,
      y,
      scaleX,
      scaleY,
      opacity,
      0,
      duration
    );
  }
  /**
   * "Scene picture fade-in": show a picture, then animate it into place at full
   * opacity.  Unspecified target values default to the source values, except
   * scale (100%) and opacity (255) which every caller animates towards.
   */
  function showScenePicture(pictureId, pictureName, options = {}) {
    const {
      x = SCENE_PICTURE_X,
      y = SCENE_PICTURE_Y,
      scaleX = 100,
      scaleY = 100,
      opacity = 0,
      toX = x,
      toY = y,
      toScaleX = 100,
      toScaleY = 100,
      toOpacity = 255,
      duration = SCENE_FADE_FRAMES,
      origin = 1
    } = options;
    showPic(pictureId, pictureName, x, y, scaleX, scaleY, opacity, origin);
    movePic(pictureId, toX, toY, toScaleX, toScaleY, toOpacity, duration, origin);
  }
  /**
   * Core of the whole `AGH_blessStandingPicture*` family: show a picture, optionally
   * slide it to its resting position, apply the blessed-tachie effect and
   * optionally slide the previous picture away.
   */
  function showBlessedPicture(pictureId, pictureName, options = {}) {
    const {
      x = SCENE_PICTURE_X,
      y = SCENE_PICTURE_Y,
      scaleX = 100,
      scaleY = 100,
      opacity = 0,
      animate = true,
      toX = x,
      toY = y,
      toOpacity = 255,
      duration = SCENE_FADE_FRAMES,
      blessType = 2,
      slidePreviousId = 0,
      slideFrames = 90
    } = options;
    showPic(pictureId, pictureName, x, y, scaleX, scaleY, opacity, 1);
    if (animate) movePic(pictureId, toX, toY, 100, 100, toOpacity, duration, 1);
    tachie_bless(pictureId, blessType);
    if (slidePreviousId) pic_move1(slidePreviousId, 0, 0, 100, 100, 0, slideFrames);
  }
  function showScreenBlackOut(pictureId, opacity) {
    showPic(pictureId, "ScreenBlackOut", 640, 384, 100, 100, opacity, 1);
  }
  function fadeInScreenBlackOut(pictureId, opacity, fadePictureId) {
    showScreenBlackOut(pictureId, opacity);
    picture_fade1(fadePictureId === undefined ? pictureId : fadePictureId, "fadeIn", valueWipeImg, 60, 5);
  }
  function slideScenePictureAway(picIndex, AGH_waitFrames) {
    pic_move1(
      valuePic1 + picIndex - 1,
      0,
      0,
      100,
      100,
      0,
      AGH_waitFrames === undefined ? 90 : AGH_waitFrames
    );
  }
  function movePictureRetainingScale(pictureId, xOffset, opacity, duration) {
    const picture = $gameScreen.picture(pictureId);
    if (!picture) return;
    $gameScreen.movePicture(
      pictureId,
      picture.origin(),
      picture.x() + xOffset,
      picture.y(),
      picture.scaleX(),
      picture.scaleY(),
      opacity === null ? picture.opacity() : opacity,
      0,
      duration
    );
  }
  function erasePictureRangeBetween(rangeStart, rangeEnd) {
    range(rangeStart, rangeEnd).forEach((pictureId) => $gameScreen.erasePicture(pictureId));
  }

  /* --- particles ----------------------------------------------------------- */

  function particleSet(...args) {
    $gameScreen._particle.particleSet(...args);
  }
  function particlePlay(...args) {
    $gameScreen._particle.particlePlay(...args);
  }
  function particleUpdate(...args) {
    $gameScreen._particle.particleUpdate(...args);
  }
  function particleClear(particleId) {
    $gameScreen._particle.particleClear(particleId);
  }
  function spawnStatueOrbParticle(interp, yOffset) {
    const particleName = "statue_orb_c";
    const particleId = `${particleName}-${interp._eventId}`;
    particleSet(interp._eventId, particleId, "this", particleName, "above");
    particleUpdate([particleId, "color", "#ff00f7", "#ffffff"]);
    particleUpdate([particleId, "pos", 0, yOffset]);
  }
  function spawnWingParticle(eventId) {
    const particleName = "wing_r2";
    particlePlay(eventId, `${particleName}-${eventId}`, "this", particleName, "99");
  }

  /* --- translator-friendly text markers -------------------------------------
   * Message strings write the engine's control characters as an inline
   * placeholder instead of the raw escape, e.g.
   *
   *     const actorName = characterName(2); `「${actorName}さん、行きましょう！」`   instead of   `「\N[2]さん、行きましょう！」`
   *
   * Each helper expands back to the very control code the game already used, so
   * the rendered text is unchanged — a translator (or a tool that extracts the
   * strings) sees const objName = whatItIs(n); ${objName} instead of a cryptic backslash pair.  The names
   * follow the wording of the marker list at the top of the file; the complete
   * table is repeated right below that list.
   */
  /* @markers-off */
  function textSpeed(cps) {
    return `\\SP[${cps}]`;
  } // \SP[n]  text speed
  function animationType(typeId) {
    return `\\AT[${typeId}]`;
  } // \AT[n]  animation type
  function setString(setId) {
    return `\\SET[${setId}]`;
  } // \SET[n] set string
  function oneChar(chars) {
    return `\\CO[${chars}]`;
  } // \CO[S]  display as one character
  function ruby(text, rubyText) {
    return `\\RB[${text},${rubyText}]`;
  } // \RB[S,R] text with ruby
  function shiftNextX(pixels) {
    return `\\MX[${pixels}]`;
  } // \MX[n]  shift next letter X
  function shiftNextY(pixels) {
    return `\\MY[${pixels}]`;
  } // \MY[n]  shift next letter Y
  function nextCharX(x) {
    return `\\PX[${x}]`;
  } // \PX[n]  next character X
  function nextCharY(y) {
    return `\\PY[${y}]`;
  } // \PY[n]  next character Y
  function switchOnText(switchId) {
    return `\\SW[${switchId}]`;
  } // \SW[n]  turn on switch n
  function skillName(skillId) {
    return `\\SN[${skillId}]`;
  } // \SN[n]  skill name
  function skillIconName(skillId) {
    return `\\SIN[${skillId}]`;
  } // \SIN[n] icon + skill name
  function itemName(itemId) {
    return `\\IN[${itemId}]`;
  } // \IN[n]  item name
  function itemIconName(itemId) {
    return `\\IIN[${itemId}]`;
  } // \IIN[n] icon + item name
  function weaponName(weaponId) {
    return `\\WN[${weaponId}]`;
  } // \WN[n]  weapon name
  function weaponIconName(weaponId) {
    return `\\WIN[${weaponId}]`;
  } // \WIN[n] icon + weapon name
  function armorName(armorId) {
    return `\\AN[${armorId}]`;
  } // \AN[n]  armor name
  function armorIconName(armorId) {
    return `\\AIN[${armorId}]`;
  } // \AIN[n] icon + armor name
  function waitEffect() {
    return "\\WE";
  } // \WE     wait for the production
  function fontColor(colorIndex) {
    return `\\C[${colorIndex}]`;
  } // \C[n]   font color
  function fontColorRGB(r, g, b) {
    return `\\C[${r},${g},${b}]`;
  } // \C[r,g,b]
  function fontSize(size) {
    return `\\FS[${size}]`;
  } // \FS[n]  font size
  function invertBold() {
    return "\\FB";
  } // \FB     invert bold flag
  function invertItalic() {
    return "\\FI";
  } // \FI     invert italic flag
  function charOpacity(opacity) {
    return `\\OP[${opacity}]`;
  } // \OP[n]  character opacity
  function outlineColor(colorIndex) {
    return `\\OC[${colorIndex}]`;
  } // \OC[n]  character edge color
  function outlineColorRGB(r, g, b) {
    return `\\OC[${r},${g},${b}]`;
  } // \OC[r,g,b]
  function outlineColorRGBA(r, g, b, a) {
    return `\\OC[${r},${g},${b},${a}]`;
  } // \OC[r,g,b,a]
  function outlineWidth(width) {
    return `\\OW[${width}]`;
  } // \OW[n]  character edge width
  function rubyColor(colorIndex) {
    return `\\RC[${colorIndex}]`;
  } // \RC[n]  ruby color
  function rubyColorRGB(r, g, b) {
    return `\\RC[${r},${g},${b}]`;
  } // \RC[r,g,b]
  function rubyColorRGBA(r, g, b, a) {
    return `\\RC[${r},${g},${b},${a}]`;
  } // \RC[r,g,b,a]
  function resetTextStyle() {
    return "\\DF";
  } // \DF     back to default settings
  function saveTextStyle() {
    return "\\SV";
  } // \SV     memorize settings
  function loadTextStyle() {
    return "\\LD";
  } // \LD     recall memorized settings
  function noSkip() {
    return "\\A";
  } // \A      forbid skipping
  function allowSkipTemporarily() {
    return "\\ES";
  } // \ES     allow skipping for now
  function fadeOutType(typeId) {
    return `\\FO[${typeId}]`;
  } // \FO[n]  fade-out type
  /* the five below are not in the list above but are used by the data files: */
  function characterName(actorId) {
    return `\\N[${actorId}]`;
  } // \N[n]   character name
  function variableText(variableId) {
    return `\\V[${variableId}]`;
  } // \V[n]   value of variable n
  function icon(iconIndex) {
    return `\\I[${iconIndex}]`;
  } // \I[n]   icon
  function jobName(jobId) {
    return `\\j[${jobId}]`;
  } // \j[n]   job name
  function switchName(switchId) {
    return `\\swi[${switchId}]`;
  } // \swi[n] name of switch n (used as place names)
  /* Control characters of the other text / label plug-ins.  They are not in the
   * list above, so each name only says what the code is; the place the data uses
   * it in (noted on the right) is what tells them apart. */
  function goldIcon() {
    return "\\G";
  } // \G      currency glyph — follows a price
  function braceRight() {
    return "\\}";
  } // \}      right brace glyph — name labels / quest lines
  function braceLeft() {
    return "\\{";
  } // \{      left brace glyph — name labels / quest lines
  function instantText() {
    return "\\>";
  } // \>      show the rest of the message at once
  function centerLabel(text) {
    return `\\CL${text}`;
  } // \CL…    centre this label on the map (map_centerDispray)
  function itemIconNameEsc(itemId) {
    return `\x1bIIN[${itemId}]`;
  } // ESC + IIN[n] — quest-list spelling
  /* @markers-on */

  /* --- text, popups, ticker ------------------------------------------------ */

  function setQuestObjective(text) {
    setVar(QUEST_OBJECTIVE_VAR, text);
  }
  function showTicker(message) {
    TickerManager.show(`${message}`);
  }
  function showCommonInfo(text) {
    CommonPopupManager.showInfo({}, text, null);
  }
  function pushBattleLog(text) {
    BattleManager._logWindow.push("addText", text);
  }
  function showInfoOrBattleLog(text) {
    if ($gameParty.inBattle()) pushBattleLog(text);
    else showCommonInfo(text);
  }
  function setTickerWait(frames) {
    setVar(TICKER_WAIT_VAR, frames === undefined ? TICKER_WAIT_FRAMES : frames);
  }
  function fetchInfo(databaseTypeId, databaseEntryId, itemAmount) {
    setTickerWait();
    get_infoDirect(databaseTypeId, databaseEntryId, 0, itemAmount);
  }
  function fetchInfoWithLeadingEntry(
    leadingTypeId,
    leadingEntryId,
    databaseTypeId,
    databaseEntryId,
    itemAmount
  ) {
    setTickerWait();
    get_infoDirect(leadingTypeId, leadingEntryId, 0, 1);
    get_infoDirect(databaseTypeId, databaseEntryId, 0, itemAmount);
  }
  function setTickerDisplayTime(displayFrames, yOffset) {
    setVar(TICKER_WAIT_VAR, displayFrames);
    setVar(185, yOffset);
  }
  function startTextBGVoice(lines, layerPreset, speed) {
    setVar(707, lines);
    setVar(706, [640 - 128, 386, layerPreset, speed, 0, "eromangasimaji"]);
    AGH_enableSwitch(125);
  }
  function pushActorBattleLog(suffix) {
    const actorName = currentActor().name();
    pushBattleLog(`${actorName}${suffix}`);
  }
  function runShowInfoPlugin(interp, message) {
    callPluginCommand(interp, "ShowInfo", message);
  }
  function playPitchVariableSe(seName) {
    AudioManager.playSe({ name: seName, volume: 100, pitch: varValue(122), pan: 0 });
  }
  function forEachCostumeSlot(callback) {
    range(1, 40).forEach(callback);
  }
  function decorateWithActorName(message) {
    const actorName = currentActor().name();
    return `${actorName}${message}`;
  }
  /** 「はメインクラス2ndジョブ＜\j[2X]＞に目覚めた！」 + common event 45. */
  function setSecondJobAwakeningMessage(interp, jobIndex, leadingSpaces) {
    setSelfVar(interp, CURRENT_ACTOR_VAR, jobIndex);
    const awakeningActorName = currentActor().name(); // the actor that awakens
    const secondJobName = jobName(jobIndex + 20);
    const secondJob = colorTaggedText(2, `＜${secondJobName}＞`);
    const actorName = leadingSpaces + colorTaggedText(16, awakeningActorName);
    valueWordSet0 = `${actorName}はメインクラス2ndジョブ${secondJob}に目覚めた！`;
    valueWordSetEx = 0; // 補足が必要な場合
    AGH_runCommonEventAsChild(interp, 45);
  }
  function appendStoredSelfLine(interp, message) {
    setSelfVar(interp, 539, message);
    setSelfVar(interp, 540, varValue(540) + 1);
  }
  function setNpcIdentity(actorId, npcName, subtitle) {
    $gameActors.actor(actorId).setName(npcName);
    if (subtitle !== undefined) varValue(400)[59] = subtitle;
  }
  function actorNameWithPartySuffix(variableId, suffix) {
    const actorName = actorFromVariable(variableId).name();
    return $gameParty.battleMembers().length >= 2 ? `${actorName}${suffix}` : actorName;
  }
  function speakOneLiner(interp, pictureId, lines, options = {}) {
    // `interp` may be null when no wait is needed
    const {
      fontSize = 25,
      fontWeight = 180,
      fontFace = 0,
      xOffsets = [0],
      yOffsets = [-50],
      eventId = interp._eventId,
      AGH_waitFrames = 0
    } = options;
    chara_oneWord(pictureId, eventId, fontSize, fontWeight, xOffsets, yOffsets, [].concat(lines), fontFace);
    if (AGH_waitFrames && interp) interp.wait(AGH_waitFrames);
  }

  /* --- plugin commands / cut-ins ------------------------------------------- */

  function callPluginCommand(interp, commandName, ...commandArgs) {
    interp.pluginCommand(commandName, commandArgs.map(String));
  }
  function requestCutIn(interp, commandName, cutInParams) {
    valueCutInSet1 = cutInParams;
    callPluginCommand(interp, commandName, cutInParams[0]);
  }
  function prepareCutIn(interp, commandName, cutInSlotId, actorId) {
    cutin_preparation(cutInSlotId, actorId);
    if (valueCutInSet1[0] !== 0) callPluginCommand(interp, commandName, valueCutInSet1[0]);
  }
  function callStandingPicturePlugin(interp) {
    callPluginCommand(interp, "P_CALL_CE", getPreviousTachiePicId(), "71", "2", "ON");
  }

  /* --- visual-novel / cutscene state --------------------------------------- */

  function setVisualNovelChoices(enabled) {
    $gameSystem.vnChoices = enabled;
  }

  /* --- common events ------------------------------------------------------- */

  // Replaces (89x): data/CommonEvents.json:common-event:13, data/CommonEvents.json:common-event:96, data/CommonEvents.json:common-event:270, data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:303, …
  // The one entry point that lives in the helper layer: both the other entries and
  // the data files call it by name, so it stays a top-level assignment (a global in
  // the plugin scope, exactly like the original) instead of a helper declaration.
  AGH_runCommonEventAsChild = function (interp, commonEventId) {
    interp.setupChild($dataCommonEvents[commonEventId].list, 0);
  };
  function setSelfVarAndRunCommonEvent(interp, selfVarId, value, commonEventId) {
    setSelfVar(interp, selfVarId, value);
    AGH_runCommonEventAsChild(interp, commonEventId);
  }
  function showOneLineTalk(interp, talkLayoutId, talkParams) {
    setSelfVar(interp, 172, talkLayoutId);
    valueTalkSet = talkParams;
    AGH_runCommonEventAsChild(interp, 60);
  }
  function questDialogueText(itemId) {
    const isDailyQuest = $dataItems[itemId].meta["SGカテゴリ"] === "デイリークエスト";
    const baseItemId = isDailyQuest ? 900 : 800;
    // NOTE: this is the quest-list line, not a message window: its renderer wants
    //       the ESC spelling (0x1b + `IIN[n]`) the original used, which is what
    //       itemIconNameEsc() emits.
    const itemIconName = itemIconNameEsc(itemId);
    const questSummary = valueQuestArray4[itemId - baseItemId];
    return itemIconName + "\n" + questSummary;
  }

  /* --- spawned map events -------------------------------------------------- */

  function respawnActor(slotIndex, posX, posY, zoomFlag) {
    event_respawnSetA(slotIndex, posX, posY, zoomFlag);
    return spawnedEvent(slotIndex);
  }
  /** Same as respawnActor(), but the direction is handed to the plugin itself. */
  function respawnActorFacing(slotIndex, posX, posY, zoomFlag, direction) {
    event_respawnSetA(slotIndex, posX, posY, zoomFlag, direction);
    return spawnedEvent(slotIndex);
  }
  function respawnNpc(slotIndex, posX, posY, zoomFlag, imageName, imageIndex) {
    event_respawnSetN(slotIndex, posX, posY, zoomFlag, imageName, imageIndex);
    return spawnedEvent(slotIndex);
  }
  /** Same as respawnNpc(), but the direction is handed to the plugin itself. */
  function respawnNpcFacing(slotIndex, posX, posY, zoomFlag, imageName, imageIndex, direction) {
    event_respawnSetN(slotIndex, posX, posY, zoomFlag, imageName, imageIndex, direction);
    return spawnedEvent(slotIndex);
  }
  function placeSpawnedEvent(slotIndex, x, y, direction) {
    const event = spawnedEvent(slotIndex);
    event.locate(x, y);
    event.setDirection(direction);
    return event;
  }
  function moveSpawnedEvents(moveRouteCode, moveRouteParameters, slotIndexes) {
    event_NpcCharaMoveId(moveRouteCode, moveRouteParameters, slotIndexes.map(spawnedEventId));
  }
  function respawnLeadActorFromPreset(zoomFlag) {
    const npcPreset = currentNpcPreset();
    const leadSlot = varValue(LEAD_ACTOR_VAR);
    const event = respawnActor(leadSlot, npcPreset[3], npcPreset[4], zoomFlag);
    event.setImage(npcPreset[1], npcPreset[2]);
    event.setDirection(npcPreset[5]);
    return leadSlot;
  }
  function respawnSideNpcFromPreset(slotIndex, direction) {
    const npcPreset = currentNpcPreset();
    const event = respawnNpc(slotIndex, npcPreset[8], npcPreset[9], 0, npcPreset[6], npcPreset[7]);
    event.setDirection(direction === undefined ? npcPreset[10] : direction);
  }
  function zoomCameraOnEvent(targetEventId, zoomLevel) {
    drowsepost.camera.zoom(zoomLevel === undefined ? 1 : zoomLevel, 60, targetEventId);
  }

  /* --- debug helpers ------------------------------------------------------- */

  function showDebugPicture(pictureSlot, entryId, picturePath) {
    //console.log(`${entryId}  ${picturePath}`);
    showPic(pictureSlot, picturePath, 640 - 128, 384, 100, 100, 255, 1);
  }
  function playMetaBgm(entryId, bgmName) {
    if (bgmName === "NoMusic") return;
    //console.log(`${entryId}  ${bgmName}`);
    AudioManager.playBgm({ name: bgmName, volume: 100, pitch: 100, pan: 0 });
  }
  /* ============================================================================
   * Setup / configuration
   * ========================================================================== */

  // Replaces (1x): data/CommonEvents.json:common-event:1
  AGH_initHeroineAndDeployedActorVariables = function () {
    setVar(73, 1); // ヒロインキャラ始点変数
    setVar(74, 2); // ヒロインキャラ終点変数
    setVar(247, [1, 2]); // ヒロインID配列変数
    setVar(75, 1); // 登場キャラ始点変数
    setVar(76, 7); // 登場キャラ終点変数
    setVar(248, [1, 2, 3, 4, 5, 6, 7]); // キャラID配列変数
  };

  // Replaces (2x): data/CommonEvents.json:common-event:1, data/CommonEvents.json:common-event:102
  AGH_setGabDisplayDuration = function () {
    setVar(68, 120); // GAB表示時間
  };

  // Replaces (1x): data/CommonEvents.json:common-event:1
  AGH_setTickerDisplayTime180 = function () {
    setTickerDisplayTime(180, 0); // ティッカー表示時間 / TickerY軸変更
  };

  // Replaces (1x): data/CommonEvents.json:common-event:1
  AGH_setPopupNoticeDuration = function () {
    setVar(65, 180); // KMSポップアップ表示時間
  };

  // Replaces (1x): data/CommonEvents.json:common-event:1
  AGH_setStateAnimationWaitFrames = function () {
    setVar(279, 10); // ステート付与解除アニメウェイト
    setVar(280, 10); // 280に上乗せ分ウェイト
  };

  // Replaces (1x): data/CommonEvents.json:common-event:1
  AGH_setFirstMenuDisplayVariable = function () {
    setVar(254, 1); // メニュー表示変数1で固定
  };

  /* ============================================================================
   * Variables / save files
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:2, data/CommonEvents.json:common-event:53
  AGH_dumpLocationPresetToFile = function (variableId) {
    // LisciaBlueQuestフォルダに書き出し
    fs.writeFileSync("valueLocationPreset.txt", JSON.stringify(varValue(variableId)));
  };

  // Replaces (19x): data/CommonEvents.json:common-event:5, :87, :109, :110, :111, :112, ...
  AGH_setValueCountSet1 = function (setValue) {
    valueCountSet1 = setValue;
  };

  // Replaces (14x): data/CommonEvents.json:common-event:5, :42, :65, :87, :89, :132, ...
  AGH_setValueCountSet3 = function (setValue) {
    valueCountSet3 = setValue;
  };

  // Replaces (18x): data/CommonEvents.json:common-event:12, :212, :295, Map007.json:map-event:23:page:1, ...
  AGH_assignVariableValueFromArgs = function (variableId, value) {
    setVar(variableId, value);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:86, data/CommonEvents.json:common-event:179
  // Writes a game variable — exactly what `AGH_assignVariableValueFromArgs` above does,
  // so it is folded into it instead of repeating the body. The name is kept because
  // the data files call it directly.
  AGH_assignVariableValue = AGH_assignVariableValueFromArgs;

  // Replaces (4x): data/CommonEvents.json:common-event:12, :54, Map003.json:map-event:235:page:1, Map018.json:map-event:39:page:1
  AGH_initVariableArrayFromSize = function (variableId, arraySize) {
    setVar(variableId, Array(arraySize).fill(0));
  };

  // Replaces (11x): data/CommonEvents.json:common-event:9, :11, :12, :64, :254, Map003.json:map-event:133:page:2, ...
  AGH_initSelfVariableArrayFromSize = function (interp, variableId, arraySize) {
    setSelfVar(interp, variableId, Array(arraySize).fill(0));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:12, data/CommonEvents.json:Map003.json:map-event:113:page:1
  AGH_writeVariableSlotFromIndex = function (variableId, indexVariableId, value) {
    varValue(variableId)[varValue(indexVariableId)] = value;
  };

  // Replaces (2x): data/CommonEvents.json:common-event:12, data/CommonEvents.json:common-event:205
  AGH_hideSystemCursor = function () {
    $gameSystem._cursorHidden = true;
  };

  // Replaces (1x): data/CommonEvents.json:common-event:12
  AGH_setMenuBackgroundVariable = function () {
    setVar(508, "BlueSky");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:431
  AGH_setEliteCrewLabel = function () {
    const displayText = braceRight();
    setVar(21, `幹部団員 ${displayText}秩序の騎空団`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:12
  AGH_setWeekLabel = function () {
    setVar(55, "月");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:12
  AGH_setLiftOffLabel = function () {
    setVar(515, "持ち上げoff");
  };

  // Replaces (2x): data/CommonEvents.json:common-event:290, data/CommonEvents.json:common-event:295
  AGH_setAlreadyViewedEventPrompt = function () {
    const textSpeed0 = textSpeed(0);
    const viewedEventItemIcon = itemIconName(varValue(142)); // variable 142 (scratch): item of the already-viewed event
    setVar(
      21,
      `${textSpeed0}イベント：${viewedEventItemIcon}は、既に閲覧済みです。\nスキップしますか？\n（そのイベントで獲得できる称号や性経験値などは入手できます。\n但し、獲得物に選択肢が関係する場合は入手できません）`
    );
  };

  // Replaces (2x): data/CommonEvents.json:common-event:290, data/CommonEvents.json:common-event:295
  AGH_setViewedEventItemVariable = function () {
    const viewedEventItemId = varValue(142); // variable 142 (scratch): item of the already-viewed event
    setVar(141, `${viewedEventItemId}`);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:291, data/CommonEvents.json:common-event:296
  AGH_setValueScriptArray1_2 = function () {
    valueScriptArray1 = [];
    valueScriptArray2 = [];
  };

  // Replaces (151x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:303, data/CommonEvents.json:common-event:304, data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:306, …
  // Writes a 3-element array into a game variable (coordinate / slot triples).
  AGH_assignVariableTripleFromArgs = function (variableId, newValue, newValue2, newValue3) {
    setVar(variableId, [newValue, newValue2, newValue3]);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:302, data/Map018.json:map-event:32:page:1
  // Copies slot 59 of an actor's H-stat record into the shared variable 21
  // (`380 + actorIndex`: 0 = actor 20, 1..4 = actors 1..4).
  AGH_setSharedVariableFromActorLabel = function (actorIndex) {
    setVar(21, varValue(380 + actorIndex)[59]);
  };

  /* ============================================================================
   * Quest objectives (all of them write variable 134)
   * ========================================================================== */

  // Replaces (1x): data/CommonEvents.json:common-event:301
  AGH_setQuestObjectiveHeadToRoyalCastle = function () {
    setQuestObjective("まずは王城へと向かいましょう。\n王都北側に入り口がある筈です。");
  };

  // Replaces (2x): data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:303
  AGH_setQuestObjectiveHeadToInn = function () {
    setQuestObjective("宿へ向かいましょうか");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:304
  AGH_setQuestObjectiveHeadToGuild = function () {
    setQuestObjective("【騎空士ギルド】へ向かいましょう。\n確か、王城の手前ほどの場所にあったはずです");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:305
  AGH_setQuestObjectiveVisitInformant = function () {
    setQuestObjective("情報屋に会いに行きましょう。\n表向きは書店を営業していると聞いています");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:309
  AGH_setQuestObjectiveReturnToInn = function () {
    setQuestObjective("空賊に関する資料が届いているかも知れません。\n宿屋に戻りましょう");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:311
  AGH_setQuestObjectiveCaptureCentralPlainsBandits = function () {
    const defeatedBanditCount = variableText(642); // variable 642: ﾒｲﾝ10中央平原討伐数
    setQuestObjective(`中央平原の空賊達を\n１０人捕縛(討伐)しましょう\n ＜${defeatedBanditCount} / 10人＞`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:312
  AGH_setQuestObjectiveReachLevelTenThenChurch = function () {
    const characterName5 = characterName(5);
    const centralPlainsName = switchName(252); // switch 252: 中央平原
    setQuestObjective(
      `${characterName5}くんのレベルを10に上げて教会へと向かいましょう。\n` +
        `空賊達が居なくなった${centralPlainsName}が、\n狩場に適してしるようですね。\n` +
        "情報屋で情報を購入しておいた方が良いかも知れません。"
    );
  };

  // Replaces (1x): data/CommonEvents.json:common-event:313
  AGH_setQuestObjectiveLocateBanditHideout = function () {
    setQuestObjective("そろそろ、尋問が終わって空賊達の拠点が\n割り出されているでしょうか");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:314
  AGH_setQuestObjectiveHeadToVillage = function () {
    setQuestObjective("集落へと向かいましょうか");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:315
  AGH_setQuestObjectiveAskVillageElder = function () {
    const itemName26 = itemName(26);
    setQuestObjective(`この集落のまとめ役の方に\n${itemName26}に関する\n情報を聞きに行きましょう`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:316
  AGH_setQuestObjectivePrepareCountermeasures = function () {
    const graveyardName = switchName(254); // switch 254: 共同墓地
    const skillIcon424 = skillIconName(424);
    const skillIcon425 = skillIconName(425);
    const armorIcon175 = armorIconName(175);
    // NOTE: textPart2 is not declared in this scope in the original either —
    //       it comes from the global scope, so it is kept as-is.
    setQuestObjective(
      `${graveyardName}へ向かいましょう。\n${textPart2}` +
        `${skillIcon424}や${skillIcon425}対策を\nしておいた方が良いかも知れません。\n` +
        `${armorIcon175}などですね`
    );
  };

  // Replaces (1x): data/CommonEvents.json:common-event:317
  AGH_setQuestObjectiveSearchGraveyard = function () {
    setQuestObjective("この有様になった、原因がある筈です。\n墓地の中を調べていきましょう");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:318
  AGH_setQuestObjectiveDefeatGraveyardBoss = function () {
    const graveyardName = switchName(254); // switch 254: 共同墓地
    setQuestObjective(`${graveyardName}のボスを討伐しましょう！`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:319
  AGH_setQuestObjectiveHeadToNamedPlace = function () {
    const centralForestName = switchName(256); // switch 256: 中央森林
    setQuestObjective(`${centralForestName}へ向かいましょう`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:320
  AGH_setQuestObjectiveCrossForestToHideout = function () {
    setQuestObjective("この森を抜ければ空賊団のアジトです。\n行きましょう");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:321
  AGH_setQuestObjectiveRaidBanditHideout = function () {
    setQuestObjective("さあ、アジトへと突入しましょう！");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:322
  AGH_setQuestObjectiveDefeatHideoutBoss = function () {
    const skyPirateHideoutName = switchName(255); // switch 255: 空賊団本拠地
    setQuestObjective(`${skyPirateHideoutName}のボスを討伐しましょう！`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:323
  AGH_setQuestObjectiveLeaveCastle = function () {
    setQuestObjective("城を出ましょう");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:324
  AGH_setQuestObjectiveRegroupAtInn = function () {
    setQuestObjective("宿に戻ってみんなと合流しましょう");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:325
  AGH_setQuestObjectiveHeadToNewlyFoundSite = function () {
    const itemName22 = itemName(22);
    setQuestObjective(`新しく発見されたという\n${itemName22}へ向かいましょう`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:326
  AGH_setQuestObjectiveDefeatSiteBoss = function () {
    const kamunaoiCaveName = switchName(332); // switch 332: カムナオイ洞窟[裏]
    setQuestObjective(`${kamunaoiCaveName}のボスを討伐しましょう！`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:327
  AGH_setQuestObjectiveMeetCompanionAtPlace = function () {
    const augusteIslandsName = switchName(223); // switch 223: アウギュステ列島
    const characterName2 = characterName(2);
    setQuestObjective(`${augusteIslandsName}へと向かい、\n${characterName2}さんと合流しましょう`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:328
  AGH_setQuestObjectiveBuySwimsuit = function () {
    setQuestObjective("雑貨屋に水着を買いに行きましょうか…");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:329
  AGH_setQuestObjectiveMeetCompanionAtBeach = function () {
    const characterName2 = characterName(2);
    setQuestObjective(
      `浜辺に行って${characterName2}さんと合流しましょう。\nお昼でないと居ないでしょうから気を付けましょうね`
    );
  };

  // Replaces (1x): data/CommonEvents.json:common-event:330
  AGH_setQuestObjectiveAdvanceToNamedPlace = function () {
    const greatWaterfallName = switchName(284); // switch 284: 大爆滝
    setQuestObjective(`${greatWaterfallName}へ向かいましょう。`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:331
  AGH_setQuestObjectiveEnterFromEntrance = function () {
    const greatWaterfallName = switchName(284); // switch 284: 大爆滝
    setQuestObjective(`${greatWaterfallName}にある入口から中に入りましょう`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:332
  AGH_setQuestObjectiveGoDeeper = function () {
    const undergroundLakeName = switchName(285); // switch 285: 地底湖
    setQuestObjective(`${undergroundLakeName}の奥へと進みましょう──`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:333
  AGH_setQuestObjectiveDefeatDepthBoss = function () {
    const undergroundLabName = switchName(286); // switch 286: 地底湖奥研究所
    setQuestObjective(`${undergroundLabName}のボスを討伐しましょう！`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:334
  AGH_setQuestObjectiveReturnAndRegroup = function () {
    const corblantIslandName = switchName(221); // switch 221: コルブラント島
    const characterName4 = characterName(4);
    setQuestObjective(`${corblantIslandName}に戻って、\n${characterName4}さん達と合流しましょう`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:335
  AGH_setQuestObjectiveVisitInformantAgain = function () {
    setQuestObjective("情報屋を訪ねましょう");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:336
  AGH_setQuestObjectivePassFirstFloor = function () {
    const kleistMountainName = switchName(334); // switch 334: クライスト山[1F]
    setQuestObjective(`${kleistMountainName}へ向かいましょう。\n1層を通り抜けます`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:337
  AGH_setQuestObjectiveRaidHut = function () {
    setQuestObjective("小屋に突入しましょう");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:338
  AGH_setQuestObjectiveHeadToLocalInn = function () {
    const corblantIslandName = switchName(221); // switch 221: コルブラント島
    setQuestObjective(`${corblantIslandName}の宿に向かいましょう`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:339
  AGH_setQuestObjectiveVisitCastleByDay = function () {
    setQuestObjective("日中に王城へ向かいましょう");
  };

  // Replaces (2x): data/CommonEvents.json:common-event:340, data/CommonEvents.json:common-event:341
  AGH_setQuestObjectiveAwaitPlayerChoice = function () {
    setQuestObjective("どうしましょうか…");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:342
  AGH_setQuestObjectiveVisitChancellor = function () {
    setQuestObjective("宰相の元へ向かいましょう");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:343
  AGH_setQuestObjectiveFightKnightCommander = function () {
    setQuestObjective("謁見の間で、騎士団長との戦いです");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:344
  AGH_setQuestObjectiveHeadToFestivalHall = function () {
    const graveyardName = switchName(254); // switch 254: 共同墓地
    const undergroundTunnelName = switchName(257); // switch 257: 地下坑道
    setQuestObjective(
      `${graveyardName}の祭殿へ向かいましょう。\nそこから、${undergroundTunnelName}へと行ける筈です`
    );
  };

  // Replaces (1x): data/CommonEvents.json:common-event:345
  AGH_setQuestObjectiveContinueMainQuest = function () {
    const undergroundTunnelName = switchName(257); // switch 257: 地下坑道
    setQuestObjective(`${undergroundTunnelName}へ向かいましょう`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:346
  AGH_setQuestObjectiveDefeatAreaBoss = function () {
    const undergroundTunnelName = switchName(257); // switch 257: 地下坑道
    setQuestObjective(`${undergroundTunnelName}のボスを討伐しましょう！`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:347
  AGH_setQuestObjectiveInvestigateNoise = function () {
    setQuestObjective("中で物音がしましたね。\n何か変化があったのかも知れません。\n行ってみましょう");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:348
  AGH_setQuestObjectiveFinalBattle = function () {
    const setString7 = setString(7);
    setQuestObjective(`最期の決戦です…。\n『尊き契りの間』の${setString7}を\n撃破しましょう！`);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:349, data/CommonEvents.json:common-event:350
  AGH_setQuestObjectiveMainQuestComplete = function () {
    setQuestObjective("何処に行きましょうか？\n（メインクエスト完了）");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:306
  AGH_setQuestObjectivePrepareInTownAndAdvance = function (interp) {
    const itemName21 = itemName(21);
    setQuestObjective(`街で準備を整えて、\n${itemName21}へ向かいましょう！`);
    setSelfVar(interp, 21, $dataSystem.switches[248]);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:308
  AGH_setQuestObjectiveFightUnavoidableBoss = function (interp) {
    const itemName21 = itemName(21);
    setQuestObjective(`戦いは避けられませんね…。\n${itemName21}ボスを討伐しましょう！`);
    setSelfVar(interp, 21, $dataSystem.switches[248]);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:310
  AGH_setQuestObjectiveGoToCentralPlains = function (interp) {
    setQuestObjective("中央平原へ行きましょう");
    setSelfVar(interp, 21, $dataSystem.switches[248]);
  };

  // Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
  AGH_setDisappointmentMessage = function () {
    setVar(801, "残念だったね？");
  };
  /* ============================================================================
   * Actors / party / skills / states
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:12, data/CommonEvents.json:common-event:64
  AGH_setCostumeDirectSite = function (interp, actorVariableId) {
    setSelfVar(interp, 19, Number($dataActors[varValue(actorVariableId)].meta["MainCloth"]));
    kisekae_tyokusetusitei(varValue(19), 0);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:12
  AGH_setBattleAnimationSpeed = function (speed) {
    ConfigManager.battleAniSpeed = speed;
  };

  // Replaces (3x): data/CommonEvents.json:common-event:202
  // Same body as `AGH_setBattleAnimationSpeed` above (right-hand side of common-event:202).
  AGH_setBattleAnimationSpeed2 = AGH_setBattleAnimationSpeed;

  // Replaces (2x): data/CommonEvents.json:common-event:13, data/CommonEvents.json:common-event:24
  AGH_clearGotItemInfo = function () {
    $gameParty.gotItemInfo = [];
  };

  // Replaces (2x): data/CommonEvents.json:common-event:13, data/CommonEvents.json:common-event:22
  AGH_grantTpToListActors = function (interp) {
    forEachHeroine((heroineId) => {
      $gameActors.actor(heroineId).gainTp(getRandomIndex(61) + 40);
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:9, data/Map003.json:map-event:133:page:2
  AGH_returnProfessionBasics = function () {
    forEachDeployedActor((actorId) => Profession_basicReturn(actorId));
  };

  // Replaces (3x): data/CommonEvents.json:common-event:9, data/CommonEvents.json:common-event:24, data/Map003.json:map-event:131:page:2
  AGH_removeDungeonStateFromHeroines = function (interp) {
    forEachHeroine((heroineId) => {
      $gameActors.actor(heroineId).removeState(39);
      varValue(380 + heroineId)[58] = 0;
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:19, data/CommonEvents.json:common-event:20
  AGH_removeTemporaryStatesFromDeployedActors = function (interp) {
    valueTachieChangeStateTemporary.forEach((stateId) => {
      forEachDeployedActor((actorId) => $gameActors.actor(actorId).removeState(stateId));
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:102
  AGH_removeStateFromListActors = function () {
    $gameParty.battleMembers().forEach((battleMember) => {
      battleMember.clearParamPlus();
      battleMember.clearXParamPlus();
      battleMember.clearSParamPlus();
      range(486, 489).forEach((stateId) => battleMember.removeState(stateId));
      battleMember.refresh();
    });
  };

  // Replaces (1x): data/Map003.json:map-event:3:page:2
  AGH_removeAllStatesFromActor20 = function () {
    const actor = $gameActors.actor(20);
    range(1, $dataStates.length - 1)
      .filter((stateId) => actor.isStateAffected(stateId))
      .forEach((stateId) => actor.removeState(stateId));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:109, data/CommonEvents.json:common-event:110
  AGH_addStateToCurrentActor = function (stateId) {
    currentActor().addState(stateId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:329
  AGH_addState693ToActor1 = function () {
    $gameActors.actor(1).addState(693);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:158
  AGH_addExposureStateToHeroines = function (interp) {
    const exposureOverride = varValue(207); // 101 = 露出縛りなし
    forEachHeroine((heroineId) => {
      let shouldAddState = exposureOverride === 101;
      if (!shouldAddState && exposureOverride >= 1 && exposureOverride === varValue(heroineId + 440)[41]) {
        shouldAddState = true;
      }
      const isExposureShort = varValue(heroineId + 380)[4] < varValue(heroineId + 380)[5];
      if (shouldAddState && isExposureShort && $gameParty.members().contains($gameActors.actor(heroineId))) {
        $gameActors.actor(heroineId).addState(78);
      }
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:9
  // Registry of Actor-derived resolvers for the SubstitutionActorId fallback.
  // Add new meta keys here without touching the event data.
  AGH_ActorResolvers = {
    Profession: function (actorId) {
      const professionArray = $gameVariables.value(380 + actorId);
      return Array.isArray(professionArray) && professionArray[59] !== undefined ? professionArray[59] : "";
    },
    FamilyName: function (actorId) {
      const linkedWeapon = $dataWeapons[actorId + 200];
      return linkedWeapon && linkedWeapon.name ? linkedWeapon.name : "";
    }
  };

  // Registry of direct metadata resolvers; unknown keys fall back to the
  // raw (trimmed) meta value.
  AGH_DirectMetaResolvers = {
    Profession: function (weapon) {
      const meta = weapon.meta["Profession"];
      return typeof meta === "string" ? meta.trim() : meta || "";
    },
    FamilyName: function (weapon) {
      const meta = weapon.meta["FamilyName"];
      return typeof meta === "string" ? meta.trim() : meta || "";
    }
  };

  // Fills a self-variable array (size 101) with weapon metadata or
  // substitution-actor data. Database Weapon IDs 301..400 map to array
  // indices 1..100 (index 0 unused). Direct metadata takes priority over
  // the SubstitutionActorId fallback, matching the original Script block.
  AGH_nameWeaponsFromVariable = function (interp, targetVarId, metaKey) {
    const resultArray = new Array(101).fill(0);
    const resolveActor = AGH_ActorResolvers[metaKey];
    const resolveDirect =
      AGH_DirectMetaResolvers[metaKey] ||
      function (weapon) {
        const metaValue = weapon.meta[metaKey];
        return typeof metaValue === "string" ? metaValue.trim() : metaValue || "";
      };
    for (let weaponId = 301; weaponId <= 400; weaponId++) {
      const weapon = $dataWeapons[weaponId];
      if (!weapon || !weapon.name) continue;
      const arrayIndex = weaponId - 300;
      if (weapon.meta) {
        if (weapon.meta[metaKey] !== undefined) {
          resultArray[arrayIndex] = resolveDirect(weapon);
        } else if (weapon.meta["SubstitutionActorId"]) {
          const actorId = Number(weapon.meta["SubstitutionActorId"]);
          if (!Number.isNaN(actorId) && resolveActor) {
            resultArray[arrayIndex] = resolveActor(actorId);
          }
        }
      }
    }
    setSelfVar(interp, targetVarId, resultArray);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:30, data/CommonEvents.json:common-event:64
  AGH_setNicknameAndNameVariables = function (nicknameVariableId, nameVariableId) {
    setVar(53, actorFromVariable(nicknameVariableId).nickname());
    setVar(49, actorFromVariable(nameVariableId).name());
  };

  // Replaces (4x): data/CommonEvents.json:common-event:63, data/CommonEvents.json:common-event:64
  AGH_nameActorFromVariable = function (actorId, nameVariableId) {
    $gameActors.actor(actorId).setName(varValue(nameVariableId));
  };

  // Replaces (3x): data/CommonEvents.json:common-event:64
  AGH_refreshCurrentActor = function () {
    $gameActors.actor(varValue(CURRENT_ACTOR_VAR)).refresh();
  };

  // Replaces (2x): data/CommonEvents.json:common-event:64
  AGH_addCurrentActorToParty = function () {
    $gameParty.addActor(varValue(CURRENT_ACTOR_VAR));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:64
  AGH_addPartyActor = function (actorVariableId) {
    $gameParty.addActor(varValue(actorVariableId));
  };

  // Replaces (4x): data/CommonEvents.json:common-event:64
  AGH_teachSkillToCurrentActor = function (skillId) {
    $gameActors.actor(varValue(CURRENT_ACTOR_VAR)).learnSkill(skillId);
  };

  // Replaces (8x): data/CommonEvents.json:common-event:30, :64, :104, ...
  AGH_updatePartyRows = function () {
    $gameParty.updateRows();
  };

  // Replaces (2x): data/CommonEvents.json:common-event:40
  AGH_applyEvolvedStateToParty = function () {
    $gameParty.members().forEach((partyMember) => {
      if (partyMember.isStateAffected(61) && !partyMember.isStateAffected(71)) {
        partyMember.addState(71);
      }
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:40
  AGH_syncOverdoseSwitch = function () {
    // オーバードーズ状態でスイッチオンオフ
    const OVERDOSE_SKILL_ID = 863;
    const OVERDOSE_SWITCH_ID = 502;
    const hasOverdoseSkill = actorFromVariable(2).battleSkillsRaw().includes(OVERDOSE_SKILL_ID);
    $gameSwitches.setValue(OVERDOSE_SWITCH_ID, hasOverdoseSkill);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:40
  AGH_syncLearnedSkillSwitches = function () {
    // 主人公性欲度スキルでonoff
    const hero = actorFromVariable(11);
    range(1, 10).forEach((actorId) => {
      $gameSwitches.setValue(actorId + 400, hero.isLearnedSkill(actorId + 60));
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:40
  AGH_autoOffSkillPersonalSwitch = function (interp) {
    // 習得者不在時に自動でスイッチオフ
    valuePersonalSkill.forEach((skillId) => {
      if ($dataSkills[skillId].meta.SwicthOnOffUse && !$gameParty.membersLeSkill(skillId)) {
        skill_personalonoffAutoOff(skillId, 0);
      }
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:40
  AGH_autoOffSkillPersonalSwitch2 = function (interp) {
    // 習得者不在時に自動でスイッチオフ
    valuePersonalItem.forEach((itemId) => {
      const item = $dataItems[itemId];
      if (item.meta.SwicthOnOffUse && !$gameParty.hasItem(item, true)) {
        skill_personalonoffAutoOff(itemId, 1);
      }
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:40
  AGH_switchViewpointForDeployedActors = function () {
    // 現在の視点によってスイッチ切り替え
    const currentViewpointActorId = varValue(11);
    forEachDeployedActor((actorId) => {
      $gameSwitches.setValue(440 + actorId, actorId === currentViewpointActorId);
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:102
  AGH_clearPartyStateCounters = function () {
    $gameParty.members().forEach((partyMember) => partyMember.clearStateCounters());
  };

  // Replaces (1x): data/CommonEvents.json:common-event:102
  AGH_applyStateToParty = function () {
    const BATTLE_STATE_ID = 82;
    valueScriptArray1 = Array(11).fill(0);
    if ($gameParty.membersState(BATTLE_STATE_ID)) {
      $gameParty.members().forEach((partyMember, memberIndex) => {
        if (partyMember.isStateAffected(BATTLE_STATE_ID) && partyMember._stateCounter[BATTLE_STATE_ID] >= 0) {
          valueScriptArray1[memberIndex] = partyMember._stateCounter[BATTLE_STATE_ID];
        }
      });
    }
  };

  // Replaces (1x): data/CommonEvents.json:common-event:102
  AGH_restoreStateCountersFromScriptArray = function () {
    const BATTLE_STATE_ID = 82;
    range(0, valueScriptArray1.length - 1).forEach((memberIndex) => {
      const savedCounter = valueScriptArray1[memberIndex];
      const partyMember = $gameParty.members()[memberIndex];
      if (savedCounter >= 1 && partyMember.isStateAffected(BATTLE_STATE_ID)) {
        partyMember.setStateCounter(BATTLE_STATE_ID, savedCounter);
      }
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:102
  AGH_applyStateToParty2 = function (interp) {
    const battleMembers = $gameParty.battleMembers();
    valueStateBattleClear.forEach((stateId) => {
      if (!$gameParty.membersState(stateId)) return;
      battleMembers.forEach((battleMember) => {
        if ($gameParty.members().contains(battleMember) && battleMember.isStateAffected(stateId)) {
          battleMember.removeStateCounter(stateId);
        }
      });
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:102
  AGH_setValueTotalexp = function () {
    valueTotalexp = 1;
    valueTotalgold = 1;
    valueMaxEnemyLv = 0;
  };

  // Replaces (1x): data/CommonEvents.json:common-event:102
  AGH_resetStateTraits = function () {
    range(486, 489).forEach((stateId) => {
      const state = $dataStates[stateId];
      state.traits = [{ code: 53, dataId: 6, value: 0.1 }];
    });
    range(490, 497).forEach((stateId) => {
      $dataStates[stateId].traits = [];
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:102
  AGH_addStepsFromVariable = function () {
    $gameParty._steps += varValue(290);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:24, data/Map003.json:map-event:131:page:2
  AGH_resetSkillUseCounts = function () {
    range(1, $dataSkills.length - 1).forEach((skillId) => {
      const skill = $dataSkills[skillId];
      if (!skill.meta["Not Recover All Uses"]) return;
      const limitUses = Number(skill.meta["Limit Uses"]);
      forEachDeployedActor((actorId) => {
        $gameActors.actor(actorId).paySkillLimitedUseCost(skillId, -limitUses);
      });
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:24, data/Map003.json:map-event:131:page:2
  AGH_resetStateSpAbilities = function () {
    range(1, $dataStates.length - 1).forEach((stateId) => {
      if ($dataStates[stateId].meta["Category"] === " StateSPabNomal") {
        forEachDeployedActor((actorId) => $gameActors.actor(actorId).removeState(stateId));
      }
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:205
  AGH_capViewpointActorSkillMastery = function () {
    const hero = actorFromVariable(11);
    [772, 773].forEach((skillId) => {
      const maxMasteryLevel = Number($dataSkills[skillId].meta["Max Mastery Level"]);
      if (hero.skillMasteryLevel(skillId) > maxMasteryLevel) {
        hero.setSkillMasteryLevel(skillId, 5);
      }
    });
  };

  /* ============================================================================
   * Ticker / popups
   * ========================================================================== */

  // Replaces (4x): data/CommonEvents.json:common-event:42, data/CommonEvents.json:common-event:47
  AGH_showTickerNoPendingScenes = function () {
    showTicker("未発生のシーンは存在しません。");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:66
  AGH_showTickerNoEpisodesOnThisMap = function () {
    showTicker("条件が変動した為、現在このマップで発生する挿話はありません");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:68
  AGH_showTickerNoQuickSaveInBattleMap = function () {
    showTicker("戦闘マップではクイックセーブを行なえません");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:68
  AGH_showTickerNoQuickSaveWhileRecalling = function () {
    showTicker("回想中はクイックセーブを行なえません");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:68
  AGH_showTickerQuickSavedToFile51 = function () {
    showTicker("ファイル５１にクイックセーブしました");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:68
  AGH_showTickerQuickSavedToLastFile = function () {
    showTicker("最終使用ファイルにクイックセーブしました");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:68
  AGH_showTickerQuickSavedToFile1 = function () {
    showTicker("ファイル１にクイックセーブしました");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:202
  AGH_showTickerBattleSpeedSetToFastest = function () {
    showTicker("戦闘速度を最速に変更しました");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:202
  AGH_showTickerBattleSpeedSetToFast = function () {
    showTicker("戦闘速度を速いに変更しました");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:202
  AGH_showTickerBattleSpeedSetToNormal = function () {
    showTicker("戦闘速度を通常に変更しました");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:259
  AGH_showTickerVariable801 = function () {
    const tickerText = variableText(801); // variable 801: 文字等代入一時変数820まで (the ticker line)
    showTicker(`${tickerText}`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:60
  AGH_showInfoPopup = function () {
    const itemName = colorTaggedText(3, valueTalkSet[0]);
    showCommonInfo("Tips:" + `${itemName}を獲得`);
  };

  // Replaces (1x): data/Map003.json:map-event:3:page:2
  AGH_showInfoPopup2 = function () {
    showCommonInfo("60 seconds Waiting…");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:87
  AGH_setValueGraphicsWidth = function (graphicsWidth) {
    valueGraphicsWidth = graphicsWidth;
  };

  /* ============================================================================
   * Switches driven by game state
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:30, data/CommonEvents.json:common-event:221
  AGH_setMissingDungeonItemSwitch = function () {
    if (!$gameParty.hasItem($dataItems[varValue(240)])) AGH_enableSwitch(74);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:37
  AGH_setSwimsuitSwitch = function () {
    // 変数441(= 1+440)の衣装スロット41が 2 のときだけON
    $gameSwitches.setValue(516, varValue(441)[41] == 2);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:368, :386, :387, :495, :532, :548
  AGH_setMillionGoldSwitch = function () {
    $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, $gameParty.gold() >= 1000000);
  };

  // Replaces (5x): data/CommonEvents.json:common-event:211, data/CommonEvents.json:common-event:215
  AGH_setSoloHeroineSwitch = function (interp) {
    let deployedHeroineCount = 0;
    forEachHeroine((heroineId) => {
      if ($gameParty.members().contains($gameActors.actor(heroineId))) {
        AGH_enableSwitch(heroineId + 100);
        deployedHeroineCount += 1;
      }
    });
    if (deployedHeroineCount <= 1) AGH_enableSwitch(379);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:199
  AGH_setWorldMenuSwitchForEvent = function () {
    const worldMenuEventId = varValue(19); // variable 19 (scratch): the event the menu opened on
    AGH_disableSwitch(380);
    if ($gameMap.event(worldMenuEventId).event().meta["WorldMenu"]) AGH_enableSwitch(380);
  };

  // Replaces (2x): data/Map003.json:map-event:151:page:1, data/Map003.json:map-event:242:page:1
  AGH_setWorldMenuSwitch = function (interp) {
    AGH_disableSwitch(380);
    const mapId = $gameMap.mapId();
    if (!$gameSelfSwitches.value([mapId, interp._eventId, "A"])) AGH_enableSwitch(380);
    if (!$gameSelfSwitches.value([mapId, interp._eventId, "B"])) AGH_enableSwitch(380);
  };

  // Replaces (2x): data/Map003.json:map-event:133:page:2
  AGH_enableSwitchIfTwoWeaponSlotsActive = function (switchId) {
    const weaponSlotRecords = varValue(327); // variable 327: 拠点アクティベート記録配列 (per-slot activation records)
    const unlockedWeaponCount = range(1, 100).filter((slotIndex) => weaponSlotRecords[slotIndex] >= 1).length;
    if (unlockedWeaponCount >= 2) AGH_enableSwitch(switchId);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:103, :300, :301
  AGH_enableSwitch = function (switchId) {
    $gameSwitches.setValue(switchId, true);
  };

  // Replaces (8x): data/CommonEvents.json:common-event:105, :109, :141, :184, :381, Map007.json:map-event:3:page:1, ...
  AGH_disableSwitch = function (switchId) {
    $gameSwitches.setValue(switchId, false);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:299
  // Quest-target movement lock: while the main quest progress (variable 135)
  // matches an entry of the in-map quest-progress list (variable 173), switch 414
  // ("movement blocked") is ON — and OFF again when this event's <MQProgress>
  // note equals that entry, i.e. when this event is the quest target itself.
  AGH_setQuestTargetMovementSwitch = function (interp) {
    const questProgressList = varValue(173);
    const mainQuestProgress = varValue(135);
    const currentMapEvent = $gameMap.event(interp._eventId).event();
    questProgressList.forEach((questProgressId) => {
      if (mainQuestProgress != questProgressId) return;
      $gameSwitches.setValue(414, true);
      if (
        currentMapEvent.meta["MQProgress"] &&
        Number(currentMapEvent.meta["MQProgress"]) == questProgressId
      ) {
        $gameSwitches.setValue(414, false);
      }
    });
  };

  /* ============================================================================
   * Parallel events, common-event helpers and pictures (core)
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:192
  AGH_startParallelEvent = function (interp) {
    if (valueCountSet1 !== 0) event_pararelStarting(1, valueCountSet1, interp._eventId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:5, data/Map003.json:map-event:133:page:2
  AGH_spawnScreenParticleStatue_orb_c = function (interp) {
    spawnStatueOrbParticle(interp, -35);
  };

  // Replaces (2x): data/Map003.json:map-event:233:page:1, data/Map022.json:map-event:9:page:1
  AGH_spawnScreenParticleStatue_orb_c2 = function (interp) {
    spawnStatueOrbParticle(interp, -35 - 48);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:15
  AGH_movePictureKeepingScale = function (opacity, duration) {
    movePictureRetainingScale(94, 0, opacity, duration);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:15
  AGH_movePictureKeepingScale2 = function () {
    movePictureRetainingScale(95, -90, null, 1);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:89
  AGH_spawnScreenParticleSpriteset = function (particleName) {
    $gameScreen._particle.particleSet(0, particleName, "screen", "def", "spriteset");
  };

  // Replaces (2x): data/CommonEvents.json:common-event:343
  // Spawns the monster and the magic-circle particle of a spawned-event slot.
  // NOTE: the original re-declared `particleName2` for the second particle — the
  // two names are spelled out here instead.
  AGH_spawnSlotMonsterParticles = function (slotIndex) {
    const particleValue = spawnedEventId(slotIndex);
    const monsterParticle = "monster_c";
    const magicCircleParticle = "mahoujin_c";
    particleSet(particleValue, `${monsterParticle}-${particleValue}`, "this", monsterParticle);
    particleSet(particleValue, `${magicCircleParticle}-${particleValue}`, "this", magicCircleParticle);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:86, data/CommonEvents.json:common-event:245
  AGH_playScreenParticle = function (particleName, particleDefinitionName, particleDefinition) {
    particlePlay(0, particleName, particleDefinitionName, "def", particleDefinition);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:87
  AGH_updateScreenParticle = function () {
    particleUpdate(["hStates_bodyShine1", "emitterLifetime", 1]);
    particleClear("hStates_bodyShine1");
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:33:page:1
  AGH_clearScreenParticleAll = function () {
    particleClear("all");
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1
  AGH_particleEditParticle = function (particleName) {
    $gameScreen._particle.particleEdit(0, particleName, "picture:57", "def", "above");
  };

  // Replaces (2x): data/Map003.json:map-event:20:page:1, data/Map003.json:map-event:133:page:2
  AGH_clearScreenParticle = function (interp, particleName) {
    particleClear(`${particleName}-${interp._eventId}`);
  };

  // Replaces (14x): data/CommonEvents.json:common-event:5, :23, :42, :65, :87, :89, ...
  AGH_hideWindow = function (windowId) {
    WindowManager.hide(windowId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:87
  AGH_hideWindow2 = function () {
    [1, 2, 3].forEach((windowId) => WindowManager.hide(windowId));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
  AGH_hideWindow3 = function () {
    [1, 2].forEach((windowId) => WindowManager.hide(windowId));
  };

  // Replaces (9x): data/CommonEvents.json:common-event:87, :166, :203, :238, :239, :241, ...
  AGH_hideAllWindows = function () {
    WindowManager.hideAll();
  };

  // Replaces (3x): data/CommonEvents.json:common-event:5, data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_setSelfVariableToCharacterPool = function (interp) {
    // NOTE: `arr` is the shared pool in global scope, and variable 21 holds the
    //       *same array reference*.  The trailing reset is kept verbatim — an
    //       array is never == 0, so it is dead code in the original as well.
    const pickedCharacterId = arr[getRandomIndex(arr.length)];
    const pickedIndex = arr.findIndex((poolId) => poolId === pickedCharacterId);
    if (pickedIndex >= 0) arr.splice(pickedIndex, 1);
    setSelfVar(interp, 21, arr);
    if (arr == 0) arr = [1, 2, 3, 4, 5];
  };

  // Replaces (1x): data/CommonEvents.json:common-event:5
  AGH_eraseNpcEvents = function () {
    eraseEventsWithMetaKeys(["NPC", "動物", "Encounter Direction Lock"]);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:37
  AGH_eraseNpcEvents2 = function () {
    eraseEventsWithMetaKeys(["NPC", "Animal", "Encounter Direction Lock"]);
  };

  /* ============================================================================
   * Messages / windows
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:87
  AGH_appendCurrentActorProfileMessage = function (interp) {
    $gameMessage.newPage();
    const actorProfile = currentActor().profile();
    const profileText = instantText() + actorProfile;
    $gameMessage.add(profileText);
    interp.setWaitMode("message");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:87
  AGH_appendCurrentActorProfileMessageFast = function (interp) {
    $gameMessage.newPage();
    const textSpeed0 = textSpeed(0);
    const actorProfile = currentActor().profile();
    $gameMessage.add(`${textSpeed0}${actorProfile}`);
    interp.setWaitMode("message");
  };

  // Replaces (8x): data/CommonEvents.json:common-event:401, :414, :444, ...
  AGH_setMessageRowCount = function (rowCount) {
    $gameMessage.setMessageRow(rowCount);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:23
  // Variable 539 holds the end-of-day information line(s); only the font size differs.
  const END_OF_DAY_INFO_VARIABLE_ID = 539;

  function drawEndOfDayInfoText(fontSizeValue) {
    const fontTag = fontSize(fontSizeValue);
    const endOfDayInfoText = variableText(END_OF_DAY_INFO_VARIABLE_ID);
    WindowManager.drawText(1, fontTag + endOfDayInfoText);
  }

  AGH_drawWindowText = function () {
    drawEndOfDayInfoText(22);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:23
  AGH_drawWindowText2 = function () {
    drawEndOfDayInfoText(28);
  };

  // Replaces (1x): data/Map003.json:map-event:161:page:1
  AGH_drawWindowText3 = function () {
    WindowManager.drawText(0, "");
  };

  /* ============================================================================
   * System / misc
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:16, data/CommonEvents.json:common-event:205
  AGH_refreshPlayer = function () {
    $gamePlayer.refresh();
    $gameMap.requestRefresh();
  };

  // Replaces (1x): data/CommonEvents.json:common-event:161
  AGH_refreshPlayer2 = function () {
    $gamePlayer.refresh();
  };

  // Replaces (2x): data/Map003.json:map-event:3:page:2, data/Map003.json:map-event:16:page:1
  AGH_refreshMinimapCache = function () {
    $gameMap.refreshMinimapCache();
  };

  // Replaces (2x): data/CommonEvents.json:common-event:22, data/CommonEvents.json:common-event:23
  AGH_clearJuseiFlag = function () {
    // 受精してるキャラ以外の受精相手記録を消滅
    jusei_clear();
  };

  // Replaces (2x): data/CommonEvents.json:common-event:23, data/CommonEvents.json:common-event:25, :30, :54
  AGH_setPlayerPosition2 = function (variableId, mapId, x, y, eventId) {
    setVar(variableId, [mapId, x, y]);
    set_playerPosition2(eventId);
  };

  // Replaces (5x): data/CommonEvents.json:common-event:29, data/CommonEvents.json:common-event:40
  AGH_setValueMenuCloth = function (menuClothId) {
    valueMenuCloth = menuClothId;
  };

  // Replaces (2x): data/CommonEvents.json:common-event:29, data/CommonEvents.json:common-event:30
  AGH_setTickerDisplayTime = function (tickerFrames, tickerYOffset) {
    setTickerDisplayTime(tickerFrames, tickerYOffset);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:77, data/CommonEvents.json:common-event:78
  AGH_waitRandomVoiceDelay = function (interp, randomRange) {
    const baseWait = varValue(706)[3];
    interp.wait(getRandomIndex(randomRange) + baseWait - 30);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:78
  AGH_waitFrames = function (interp, frameCount) {
    interp.wait(frameCount);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:301
  AGH_respawnMapNpc = function (npcSlotId) {
    range(1, 5).forEach(() => {
      setVar(33, "BB_akunin");
      setVar(35, 3);
      setVar(37, getRandomIndex(3) + 2);
      setVar(34, getRandomIndex(2) + 4);
      map_npcRespawn(1, npcSlotId);
    });
  };

  // Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
  AGH_showCoinCounter = function () {
    const coinAmountText = varValue(69).toLocaleString(); // variable 69 (scratch): coin count
    const coinText = `Coin: ${coinAmountText}枚`;
    $gameScreen.setDTextPicture(coinText, 28);
    $gameScreen.dWindowFrame = "ON";
    showPic(99, "", 640 + 50, 50, 100, 100, 0, 1);
    movePic(99, 640, 50, 100, 100, 255, 60, 1);
  };

  // Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
  AGH_showDiceBackground = function () {
    showPic(98, "/img/dice/background", 640 + 50, 384, 100, 100, 0, 1);
    movePic(98, 640, 384, 100, 100, 255, 30, 1);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:37
  AGH_noop = function () {
    // original_autoEventFlag();
  };
  /* ============================================================================
   * Talk layouts, cut-ins, child interpreters
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:14
  // window.pic_setArray3: read via the global object because the array was
  // never defined in this codebase (the original event script read it too);
  // a missing preset must not throw, only skip with a warning.
  AGH_setPicture = function (presetIndex) {
    const presetValues = window.pic_setArray3;
    if (!presetValues) {
      console.warn("AGH_setPicture: pic_setArray3 is undefined");
      return;
    }
    valuePicWait2 = presetValues[2] + Math.floor(Math.random() * (presetValues[3] * 2 + 1)) - presetValues[3];
    pic_set(presetValues[1], presetValues[0], presetValues[presetIndex], valuePicWait2);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:14, data/CommonEvents.json:common-event:17
  AGH_playParallelPictureSeName = function () {
    const [seName, minVolume, minPitch] = valueParallelPicSe1;
    if (seName != 0) {
      AudioManager.playSe({
        name: seName,
        volume: getRandomIndex(11) + Number(minVolume),
        pitch: getRandomIndex(21) + Number(minPitch),
        pan: 0
      });
    }
  };

  // Replaces (2x): data/CommonEvents.json:common-event:17
  AGH_waitRandomPictureDelay = function (interp) {
    if (valuePicWait >= 1) interp.wait(valuePicWait + getRandomIndex(3));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:17
  // The slide helpers move the same scene picture in from either side.
  const SCENE_SLIDE_PICTURE_ID = 55; // 53 + 2
  const SCENE_SLIDE_DISTANCE_PIXELS = 50;

  // direction is +1 for "from the right", -1 for "from the left".
  function slidePictureInAndWait(interp, duration, waitFrames, direction) {
    const targetX =
      640 + direction * SCENE_SLIDE_DISTANCE_PIXELS - 128;
    movePic(SCENE_SLIDE_PICTURE_ID, targetX, 384, 100, 100, 240, duration, 1);
    interp.wait(waitFrames);
  }

  AGH_slidePictureInFromRightAndWait = function (interp, duration, AGH_waitFrames) {
    slidePictureInAndWait(interp, duration, AGH_waitFrames, 1);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:17
  AGH_slidePictureInFromLeftAndWait = function (interp, duration, AGH_waitFrames) {
    slidePictureInAndWait(interp, duration, AGH_waitFrames, -1);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:60
  AGH_setValueTalkSet = function () {
    valueTalkSet = 0;
    valueTalkarr1 = [];
  };

  // valueTalkSet[0] is the talk phase: 1 = face with state, 2 = face picture only,
  // 0 = close the conversation. Returns true only for phase 0, i.e. "keep going".
  function applyTalkSetPictureState(talkSet, actor, faceImageSuffix, durationFrames, addStateId, removeStateId) {
    switch (numericCaseValue(talkSet[0])) {
      case 1:
        actor.addState(addStateId);
        return false;
      case 2:
        pic_locationSet(91, 92, `/img/talkface/${talkSet[1]}${faceImageSuffix}`, durationFrames, 0);
        return false;
      case 0:
        actor.removeState(removeStateId);
        return true;
      default:
        return false;
    }
  }

  // Replaces (1x): data/CommonEvents.json:common-event:60
  AGH_setPictureLocationAndMovePicture1 = function (stateId, facePathSuffix, removeStateId) {
    const talkParams = valueTalkSet;
    const talkActor = $gameActors.actor(talkParams[1]);
    if (!applyTalkSetPictureState(talkParams, talkActor, facePathSuffix, 60, stateId, removeStateId)) return;

    pic_move1(92, 0, 0, 100, 100, 0, 120);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:60
  AGH_fadePicture1Pic101 = function () {
    showScreenBlackOut(101, valueTalkSet[3]);
    picture_fade1(101, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:60
  AGH_configurePictureEasing = function () {
    picture_easingConfiguration("easeOutQuad"); // 通常顔グラ演出
  };

  // Replaces (2x): data/CommonEvents.json:common-event:60, data/Map007.json:map-event:4:page:1
  AGH_configurePictureEasing2 = function (easingType) {
    picture_easingConfiguration(easingType);
  };

  // Replaces (1x): data/Map003.json:map-event:3:page:1
  AGH_configurePictureEasing3 = function () {
    picture_easingConfiguration("easeOutQuad");
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1
  AGH_configurePictureEasingEaseInOutQuad = function () {
    picture_easingConfiguration("easeInOutQuad");
  };

  // Replaces (2x): data/CommonEvents.json:common-event:61, data/CommonEvents.json:common-event:62
  AGH_startCommonEventFromVariable131 = function (interp, value) {
    // ｺﾓﾝID・変数ID
    setSelfVar(interp, 131, value);
    setSelfVar(interp, 14, 1);
    [121, 122, 123].forEach((variableId) => setSelfVar(interp, variableId, 0));
    AGH_runCommonEventAsChild(interp, varValue(131));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:212
  AGH_startCommonEvent64FromVariable131 = function (interp, value, variableId) {
    setSelfVar(interp, 131, 64);
    setSelfVar(interp, 14, value);
    setSelfVar(interp, 121, 0);
    setSelfVar(interp, 122, 0);
    setSelfVar(interp, variableId, 0);
    AGH_runCommonEventAsChild(interp, varValue(131));
  };

  // Replaces (4x): data/CommonEvents.json:common-event:64, data/CommonEvents.json:common-event:401, data/Map100.json:map-event:11:page:1
  AGH_runCommonEventFromArgs = function (interp, variableId, value, commonEventId) {
    setSelfVar(interp, variableId, value);
    AGH_runCommonEventAsChild(interp, commonEventId);
  };

  // Replaces (7x): data/CommonEvents.json:common-event:64, :373, Map054.json:map-event:2:page:1..4, ...
  AGH_startPartyDisband = function (interp, value) {
    setSelfVar(interp, 14, value); // パーティ一時解散コモン
    AGH_runCommonEventAsChild(interp, 64);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:530, Map081.json:map-event:3:page:1, Map083.json:map-event:6:page:1
  AGH_startPartyReform = function (interp) {
    setSelfVar(interp, 14, 22); // パーティ再結成コモン
    AGH_runCommonEventAsChild(interp, 64);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_startPartyDisbandAfterCommonEvent = function (interp) {
    AGH_runCommonEventAsChild(interp, 64);
    setSelfVar(interp, 14, 21); // パーティ一時解散コモン
  };

  // Replaces (7x): data/CommonEvents.json:common-event:368, :410, :495, :532, :548, :571, ...
  AGH_runCommonEvent19 = function (interp) {
    AGH_runCommonEventAsChild(interp, 19);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:342, data/CommonEvents.json:common-event:364
  AGH_startPartyJoin = function (interp, value) {
    // 仲間加入コモン
    setSelfVar(interp, 14, 19);
    setSelfVar(interp, 20, value);
    setSelfVar(interp, 121, 0);
    AGH_runCommonEventAsChild(interp, 64);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:330, data/CommonEvents.json:common-event:331
  AGH_startMoveRouteCommonEvent = function (interp) {
    setVar(171, [41, 32, 11]);
    AGH_runCommonEventAsChild(interp, 54);
  };

  // Replaces (1x): data/Map007.json:map-event:3:page:1
  AGH_applyMapShockwaveFilter = function (
    filterName,
    waveWidth,
    waveHeight,
    wavePower,
    speed,
    additionalTime
  ) {
    $gameMap.createFilter(filterName, "shockwave", 0, "screen");
    $gameMap.setFilter(filterName, [640, waveWidth, -1, waveHeight, wavePower, speed]);
    $gameMap.setFilterAddiTime(filterName, additionalTime);
  };

  // Replaces (2x): data/Map007.json:map-event:3:page:1
  AGH_showOverlayTalkFromArgs = function (interp, value) {
    setSelfVar(interp, 20, 1);
    setSelfVar(interp, 21, value);
    setSelfVar(interp, 22, -400);
    AGH_runCommonEventAsChild(interp, 141);
  };

  // Replaces (2x): data/Map007.json:map-event:5:page:1
  AGH_startSexualEffectCommonEvent = function (interp, value) {
    setSelfVar(interp, 14, value); // Ｈ効果
    AGH_runCommonEventAsChild(interp, 58);
  };

  // Replaces (5x): data/CommonEvents.json:common-event:120, data/CommonEvents.json:common-event:188, data/CommonEvents.json:common-event:196
  AGH_startEnemyAttackAnimation = function (
    interp,
    randomXRange,
    randomXOffset,
    randomYRange,
    randomYOffset,
    randomSpeedBase
  ) {
    setSelfVar(interp, 14, 26);
    setSelfVar(interp, 121, interp._eventId);
    setSelfVar(interp, 122, getRandomIndex(8) + 8);
    setSelfVar(interp, 123, 5);
    setSelfVar(interp, 124, 1); // アニメid
    setSelfVar(interp, 125, getRandomIndex(randomXRange) - randomXOffset);
    setSelfVar(interp, 126, getRandomIndex(randomYRange) - randomYOffset);
    setSelfVar(interp, 127, getRandomIndex(2) + randomSpeedBase);
    setSelfVar(interp, 128, getRandomIndex(2) + 0);
    setSelfVar(interp, 129, getRandomIndex(181) + 0);
    AGH_runCommonEventAsChild(interp, 64);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:120, data/CommonEvents.json:common-event:121
  AGH_readBranchResult = function (interp) {
    $result = interp._branch[interp._indent];
  };

  // Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:452
  AGH_showAttachmentTalk = function (interp, value) {
    setSelfVar(interp, 172, value);
    valueTalkSet = [1, 1]; // 1で付与2で直接表示 \CE[60]のみ0で解除, ｱｸﾀｰid
    AGH_runCommonEventAsChild(interp, 60);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:368, :495, :532, :548, Map041.json:map-event:7:page:1, Map083.json:map-event:6:page:1
  AGH_showOneLineTalkText = function (interp, talkLine) {
    // 中央に一言メッセージ, 何行でも良し
    setSelfVar(interp, 23, talkLine);
    const talkLineText = variableText(23); // variable 23: 乱数汎用3 (here: the one-line talk text)
    showOneLineTalk(interp, 19, [1, 28, `${talkLineText}`, 100]);
  };

  /* ============================================================================
   * Cut-ins / plugin commands
   * ========================================================================== */

  // Replaces (1x): data/CommonEvents.json:common-event:101
  AGH_runPluginCommandCutInCG_EnemyDefeat = function (interp) {
    requestCutIn(interp, "敵カットイン", [
      "カットインエネミー演出色々",
      "CutInCG_EnemyDefeat",
      0,
      2.0,
      2.0,
      25,
      60
    ]);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:104
  AGH_requestBattleMasturbationCutIn = function (interp) {
    const cutInImageName = `Zev_BattleMasturbation${varValue(CURRENT_ACTOR_VAR)}_1`;
    requestCutIn(interp, "味方カットイン", ["Ｈシーン演出", cutInImageName, 270, 1.5, 1.2, 25, 60]);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:104, data/CommonEvents.json:common-event:140
  AGH_prepareAllyCutIn = function (interp, pictureId) {
    prepareCutIn(interp, "味方カットイン", pictureId, varValue(CURRENT_ACTOR_VAR));
  };

  // Replaces (1x): data/CommonEvents.json:common-event:140
  AGH_prepareEnemyCutIn = function (interp) {
    prepareCutIn(interp, "敵カットイン", 0, varValue(CURRENT_ACTOR_VAR));
  };

  // Replaces (1x): data/CommonEvents.json:common-event:129
  AGH_prepareEnemyCutIn2 = function (interp) {
    prepareCutIn(interp, "敵カットイン", 8, varValue(CURRENT_ACTOR_VAR));
  };

  // Replaces (2x): data/Map003.json:map-event:81:page:1, data/Map003.json:map-event:82:page:1
  AGH_prepareAllyCutIn2 = function (interp) {
    prepareCutIn(interp, "味方カットイン", 7, varValue(CURRENT_ACTOR_VAR));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:138
  AGH_prepareAllyCutInWithAbilityKind = function (interp) {
    setVar(182, 13);
    prepareCutIn(interp, "味方カットイン", 1, varValue(CURRENT_ACTOR_VAR));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:138
  AGH_prepareCutInForSlotWithAbilityKind = function (interp, cutInSlotId) {
    setVar(182, 13);
    prepareCutIn(interp, "味方カットイン", 1, cutInSlotId);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:64
  AGH_runPluginCommandShowInfo = function (interp) {
    runShowInfoPlugin(interp, "パーティが再集合されました");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:64
  AGH_runPluginCommandShowInfo2 = function (interp) {
    runShowInfoPlugin(interp, "パーティが一時解散されました");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:73
  AGH_runPluginCommandShowInfo3 = function (interp) {
    const autosaveFileName = variableText(509); // variable 509: [NoReset]オートセーブ指定変数
    runShowInfoPlugin(interp, `ファイル${autosaveFileName}にオートセーブしました`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:73
  AGH_runPluginCommandShowInfo4 = function (interp) {
    runShowInfoPlugin(interp, "ファイル51にオートセーブしました");
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_runPluginCommandFadeImg = function (interp, imageName) {
    callPluginCommand(interp, "GWTrans_Setting", "FadeImg", imageName);
    callPluginCommand(interp, "GWTrans_Setting", "FadeInImg", imageName);
    callPluginCommand(interp, "GWTransition", "on");
  };

  // Replaces (3x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1, data/Map007.json:map-event:17:page:1
  AGH_runPluginCommand153 = function (interp) {
    // 一刀両断102崩壊161横両断008封印054内側から153
    callPluginCommand(interp, "GWFade", "character", "0", "fadeOut", "153", "180", "5");
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_runPluginCommand = function (interp) {
    [86, 87].forEach((variableId) => setSelfVar(interp, variableId, 3));
    setSelfVar(interp, 245, 40);
    setSelfVar(interp, 246, 80);
    setSelfVar(interp, 251, "testピクチャ");
    callPluginCommand(interp, "味方カットイン", "Ｈシーン演出");
  };

  /* ============================================================================
   * Battle / victory
   * ========================================================================== */

  // Replaces (1x): data/CommonEvents.json:common-event:102
  AGH_setValueBattleSexCountArr = function () {
    valueBattleSexCountArr = Array(21).fill(0);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:102
  AGH_setSideViewBattle = function () {
    $dataSystem.optSideView = true;
  };

  // Replaces (1x): data/CommonEvents.json:common-event:102
  AGH_setValueCollapseAnime = function () {
    valueCollapseAnime = 0;
  };

  // Replaces (2x): data/CommonEvents.json:common-event:104
  AGH_setValueChainAddPower = function () {
    valueChainAddPower = 0;
  };

  // Replaces (2x): data/CommonEvents.json:common-event:104, data/CommonEvents.json:common-event:129
  AGH_runBossActionPattern1 = function () {
    const boss = $gameTroop.members()[0];
    if (!(boss.isStateAffected(410) && boss.isAlive() && !boss.isRestricted())) return;

    AGH_enableSwitch(470);
    boss_actionPattarn1(boss);
    AGH_disableSwitch(470);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:105, data/CommonEvents.json:common-event:122
  AGH_countDefeatedEnemyForDungeonItem = function (defeatCountVariableId) {
    const dungeonInfoItemId = varValue(240); // variable 240: ダンジョン毎情報アイテム指定変数
    if (dungeonInfoItemId >= 1) varValue(defeatCountVariableId)[dungeonInfoItemId] += 1;
  };

  // Replaces (2x): data/CommonEvents.json:common-event:109
  AGH_resetEnemyMoveArray = function () {
    const enemyMovePosition = varValue(703); // variable 703: 拘束時敵移動一時配列
    if (!$dataSystem.optSideView) return;
    if (enemyMovePosition == 0) return;
    // TODO: original bug — 92/703 are not documented arrays; kept verbatim.
    $gameTroop.set(varValue(92) + 1, enemyMovePosition[0], enemyMovePosition[1], 30);
    setVar(703, 0);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:110, data/Map003.json:map-event:218:page:2
  AGH_grantHExp1AndGrantHExp1Extra = function (
    interp,
    vaginalExp,
    analExp,
    fellatioExp,
    affectionExp,
    inseminationCount
  ) {
    //     膣,経,フ,ア,自,絶
    h_exp1(vaginalExp, analExp, 0, 0, 0, 0);
    //     和,強,異,輪,乱,露
    h_exp2(0, fellatioExp, affectionExp, 0, 0, 0);
    //     セ,乳,尻,失,潮,売,妊,子,中,ア,口(射精先)
    h_exp3(0, 0, 0, 0, 0, 0, 0, 0, inseminationCount, 0, 0);
    //     膣,尻,口,感,露,精,性,奉,売
    h_exp4(0, 0, 0, 0, 0, 0, 0, 0, 0);
    AGH_runCommonEventAsChild(interp, 85);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:120
  AGH_setValueWordSet1 = function () {
    valueWordSet1 = 0;
    valueWordSet2 = 0;
    valueWordSet3 = 0;
  };

  // Replaces (6x): data/CommonEvents.json:common-event:120, :121, :300
  AGH_setValueVictoryResult = function (victoryResult) {
    valueVictoryResult = victoryResult;
  };

  // Replaces (13x): data/CommonEvents.json:common-event:119, :122, Map035.json:map-event:20:page:1, ...
  AGH_countBossEnemyDefeat = function (defeatCountVariableId) {
    varValue(defeatCountVariableId)[valueBossEnemyId] += 1;
  };

  // Replaces (7x): data/CommonEvents.json:common-event:119, :122, Map035.json:map-event:20:page:1, ...
  AGH_setValueBossAddLevel = function () {
    valueBossAddLevel = 0;
  };

  // Replaces (2x): data/CommonEvents.json:common-event:122, data/CommonEvents.json:common-event:297
  AGH_openVictoryTreasureBox1AndOpenVictoryTreasureBox2 = function () {
    if (valueMaxEnemyLv < 1) return;
    const treasureBoxCount = Math.ceil(valueMaxEnemyLv / 10);
    range(1, treasureBoxCount).forEach(() => {
      enemywin_treasurebox1(valueBossId);
      if (varValue(160)[4] >= 1) enemywin_treasurebox2(valueBossId);
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:120
  AGH_forceMoveRouteForDungeonEnemy = function (interp) {
    const enemyGraphicParts = $dataItems[varValue(240)].meta.EnemyGraphic.split(",");
    interp.character(0).forceMoveRoute({
      list: [
        { code: 41, parameters: [enemyGraphicParts[0], Number(enemyGraphicParts[1])] },
        { code: 15, parameters: [10] },
        { code: 45, parameters: ["this.setAngle([-45,45,-90,90][getRandomIndex(4)]);"] },
        { code: 32 },
        { code: 34 },
        { code: 35 },
        { code: 37 },
        { code: 0 }
      ]
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:64
  AGH_forceMoveRouteFromArgs = function (interp) {
    interp.character(varValue(121)).forceMoveRoute({
      list: [
        { code: 36 },
        { code: 37 },
        { code: 29, parameters: [varValue(122)] },
        { code: 30, parameters: [varValue(123)] },
        { code: 45, parameters: ["this.requestAnimation($gameVariables.value(124));"] },
        {
          code: 45,
          parameters: [
            "this.jumpEx($gameVariables.value(125),$gameVariables.value(126),$gameVariables.value(127),$gameVariables.value(128));"
          ]
        },
        { code: 25 },
        { code: 32 },
        { code: 34 },
        { code: 35 },
        { code: 0 }
      ],
      repeat: false,
      skippable: true
    });
    interp._character = interp.character(varValue(121));
    interp.setWaitMode("route");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:161
  AGH_forceMoveRouteFromViewpointArgs = function (interp) {
    interp.character(-1).forceMoveRoute({
      list: [
        { code: 41, parameters: [`${varValue(11)}_${varValue(21)}`, varValue(22)] },
        { code: 38 },
        { code: 29, parameters: [4] },
        { code: 31 },
        { code: 33 },
        { code: 0 }
      ]
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:259
  AGH_forceMoveRouteForSpawnedEvent = function (eventSlotIndex, moveRouteScript) {
    spawnedEvent(eventSlotIndex).forceMoveRoute({
      list: [{ code: 45, parameters: [moveRouteScript] }, { code: 0 }],
      repeat: false,
      skippable: true
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:259
  AGH_forceTwoMoveRoutesForSpawnedEvent = function (firstMoveRouteScript, secondMoveRouteScript) {
    spawnedEvent(12).forceMoveRoute({
      list: [
        { code: 45, parameters: [firstMoveRouteScript] },
        { code: 45, parameters: [secondMoveRouteScript] },
        { code: 0 }
      ],
      repeat: false,
      skippable: true
    });
  };

  // Replaces (3x): data/CommonEvents.json:common-event:303, :324, :471
  AGH_forceMoveRouteForSpawnedEventRange = function (firstSlotIndex, lastSlotIndex, moveRouteScript) {
    range(firstSlotIndex, lastSlotIndex).forEach((slotIndex) => {
      spawnedEvent(slotIndex).forceMoveRoute({
        list: [
          { code: 45, parameters: ["this.startOpacity(60,0);"] },
          { code: 45, parameters: [moveRouteScript] },
          { code: 0 }
        ],
        repeat: false,
        skippable: true
      });
    });
  };

  /* ============================================================================
   * Party / costume stat blocks
   * ========================================================================== */

  // Replaces (4x): data/CommonEvents.json:common-event:106, :111, :112, :167
  AGH_loadCostumeSlotsFromPartyStat = function () {
    // 現在衣装を呼び出し
    forEachCostumeSlot((slotIndex) => {
      setVar(slotIndex + 460, varValue(varValue(CURRENT_ACTOR_VAR) + 440)[slotIndex]);
    });
  };

  // Replaces (3x): data/CommonEvents.json:common-event:106, :111, :112
  AGH_loadPartyStatBlock = function (interp) {
    // 一時代入した仮情報を立ち絵指定後に反映
    forEachCostumeSlot((slotIndex) => {
      if (varValue(slotIndex + 560) >= 1) setSelfVar(interp, slotIndex + 460, varValue(slotIndex + 560));
    });
  };

  // Replaces (3x): data/CommonEvents.json:common-event:106, :111, :112
  AGH_saveCostumeSlotsToPartyStat = function () {
    // 衣装情報を更新
    forEachCostumeSlot((slotIndex) => {
      varValue(varValue(CURRENT_ACTOR_VAR) + 440)[slotIndex] = varValue(slotIndex + 460);
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:167
  // Class-2 twin of `AGH_saveCostumeSlotsToPartyStat` above — same slot copy, folded into it.
  AGH_saveCostumeSlotsToPartyStat2 = AGH_saveCostumeSlotsToPartyStat;

  // Replaces (2x): data/CommonEvents.json:common-event:167
  AGH_resetCostumeSlotVariables = function () {
    // 現在衣装を初期化
    forEachCostumeSlot((slotIndex) => {
      if (slotIndex != 4) setVar(slotIndex + 460, 0);
    });
  };

  // Replaces (3x): data/CommonEvents.json:common-event:167
  AGH_recordCostumeClothTotal = function () {
    const currentActorId = varValue(CURRENT_ACTOR_VAR);
    varValue(currentActorId + 440)[41] = Number($dataItems[varValue(19)].meta["TotalCloth"]);
    varValue(348)[currentActorId] = varValue(currentActorId + 440)[41];
  };

  // Replaces (3x): data/CommonEvents.json:common-event:167
  AGH_saveCharacterIdToStatBlock = function () {
    varValue(varValue(CURRENT_ACTOR_VAR) + 440)[0] = varValue(19);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:167
  AGH_configureCurrentActorStatusLine = function (interp) {
    const currentActorId = varValue(CURRENT_ACTOR_VAR);
    const icon155 = icon(155);
    const costumeStatusIcon = `${icon155}`;
    const actorName = currentActor().name();
    const exposureValue = varValue(currentActorId + 380)[4]; // 380+actorId slot 4: exposure value
    const exposureLimit = varValue(currentActorId + 380)[5]; // 380+actorId slot 5: exposure limit
    setSelfVar(
      interp,
      519,
      `${actorName}　${costumeStatusIcon}:` + `${exposureValue}` + `(${exposureLimit})\n`
    );
  };

  // Replaces (2x): data/CommonEvents.json:common-event:256
  AGH_setWeaponNameOrNone = function (
    weaponSlotIndex,
    hasWeaponSwitchId,
    weaponNameVariableId,
    weaponIndex,
    noWeaponSwitchId,
    noWeaponVariableId
  ) {
    if (varValue(varValue(CURRENT_ACTOR_VAR) + 380)[weaponSlotIndex] != 0) {
      AGH_enableSwitch(hasWeaponSwitchId);
      setVar(
        weaponNameVariableId,
        $dataWeapons[varValue(varValue(CURRENT_ACTOR_VAR) + 380)[weaponIndex]].name
      );
    } else {
      AGH_disableSwitch(noWeaponSwitchId);
      setVar(noWeaponVariableId, "なし");
    }
  };

  // Replaces (2x): data/CommonEvents.json:common-event:256
  AGH_clearWeaponSlot = function (weaponSlotIndex) {
    varValue(varValue(CURRENT_ACTOR_VAR) + 380)[weaponSlotIndex] = 0;
  };

  // Replaces (3x): data/CommonEvents.json:common-event:205
  AGH_setWeaponUnique = function (interp) {
    forEachHeroine((heroineId) => {
      $dataWeapons[heroineId + 200].name = varValue(heroineId + 380)[50];
      weapon_uniqueSet(heroineId);
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:241
  AGH_setWeaponUniqueAndAddWeaponUnique = function (setValue) {
    const actorVariableId = varValue(CURRENT_ACTOR_VAR);
    const weaponId = actorVariableId + 80;
    weapon_uniqueSet(actorVariableId);
    valueCountSet3 = setValue;
    weapon_uniqueAdd(weaponId);
    WindowManager.show(0, 270, 80, 1010, 450);
    const weaponIcon = weaponIconName(weaponId);
    const weaponNoteText = variableText(801); // variable 801: 文字等代入一時変数820まで (the weapon note)
    WindowManager.drawText(
      0,
      `${weaponIcon}\n${weaponNoteText}\n※付与効果は強化の度に選択/追加されていきます。`
    );
  };

  /* ============================================================================
   * Battle log / popups
   * ========================================================================== */

  // Replaces (3x): data/CommonEvents.json:common-event:106, data/CommonEvents.json:common-event:109
  AGH_pushBoundBattleLog = function () {
    pushActorBattleLog("は拘束された！");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:109
  AGH_pushAttackedBattleLog = function () {
    pushActorBattleLog("は襲い掛かられた！");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:109
  AGH_pushEscapedBattleLog = function () {
    pushActorBattleLog("は拘束から逃れた！");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:110
  AGH_pushAssaultedBattleLog = function () {
    pushActorBattleLog("は犯されている…。");
  };

  // Replaces (2x): data/CommonEvents.json:common-event:111, data/CommonEvents.json:common-event:112
  AGH_showAlreadyNudeInfo = function () {
    const actorName = currentActor().name();
    showInfoOrBattleLog(`しかし${actorName}は既に全裸であった…`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:112
  AGH_showNoEffectExposureInfo = function () {
    const exposureValue = value1;
    const actorName = currentActor().name();
    showInfoOrBattleLog(`しかし${actorName}には効果が無かった。　（現在露出値:${exposureValue}）`);
  };

  /* ============================================================================
   * Parallel / map events
   * ========================================================================== */

  // Replaces (1x): data/CommonEvents.json:common-event:288
  AGH_startLevel10EventForActor5 = function () {
    if (varValue(135) !== 12) return;
    if (!$gameSwitches.value(233)) return; // 教会
    if ($gameActors.actor(5).level < 10) return;
    event_pararelStarting(0, 313, 0);
    AGH_enableSwitch(474);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:288
  AGH_startBanditHuntEvent = function () {
    if (varValue(135) !== 11) return;
    if ($gameMap.mapId() !== 96) return;
    if (varValue(642) < 10) return;
    event_pararelStarting(0, 312, 0);
    AGH_enableSwitch(474);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:288
  AGH_setValueGetInfoPointX = function (getInfoPointX) {
    valueGetInfoPointX = getInfoPointX;
  };

  // Replaces (1x): data/CommonEvents.json:common-event:298
  AGH_playScreenParticleWing_r2 = function () {
    spawnWingParticle(2);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:300, :301, :349
  AGH_playScreenParticleWing_r2_2 = function (interp) {
    spawnWingParticle(interp._eventId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:190, data/CommonEvents.json:common-event:195
  AGH_spawnMapEvent = function () {
    const animalEvent = $gameMap.event(valueanimalEventId);
    $gameMap.spawnEvent(99, animalEvent.x, animalEvent.y, true);
    const spawnedAnimalEvent = $gameMap.event($gameMap.getLastSpawnEventId());
    spawnedAnimalEvent.startScale(10, 50, 50);
    spawnedAnimalEvent._priorityType = 0;
    spawnedAnimalEvent.setOpacity(150);
  };

  // Replaces (2x): data/Map085.json:map-event:2:page:1, data/Map085.json:map-event:3:page:1
  AGH_spawnMapEvent2 = function (interp) {
    const sourceEvent = $gameMap.event(interp.eventId());
    $gameMap.spawnEvent(190, sourceEvent.x, sourceEvent.y, true);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:259, :338, :361
  AGH_spawnEventAndRecordSlot = function (slotIndex, posX, posY, opacity) {
    $gameMap.spawnEvent(146, posX, posY, true);
    varValue(SPAWNED_EVENT_TABLE_VAR)[slotIndex] = $gameMap.getLastSpawnEventId();
    spawnedEvent(slotIndex).setOpacity(opacity);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:544, data/CommonEvents.json:common-event:545
  AGH_spawnEventFromNpcPreset = function () {
    const npcPreset = currentNpcPreset();
    $gameMap.spawnEvent(236, npcPreset[8], npcPreset[9], true);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:184, data/Map003.json:map-event:20:page:1, data/Map003.json:map-event:133:page:2
  AGH_bindInterpreterToValueCountSet9 = function (interp) {
    interp._eventId = valueCountSet9;
  };

  // Replaces (2x): data/CommonEvents.json:common-event:188
  AGH_bindInterpreterToValueEnemyEventId = function (interp) {
    interp._eventId = valueEnemyEventId;
  };

  // Replaces (3x): data/CommonEvents.json:common-event:189, :190, :196
  AGH_bindInterpreterToValueanimalEventId = function (interp) {
    interp._eventId = valueanimalEventId;
  };

  // Replaces (2x): data/CommonEvents.json:common-event:359, :361
  AGH_bindInterpreterToValueBossId = function (interp) {
    interp._eventId = valueBossId;
  };

  // Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
  AGH_bindInterpreterToValueThisEventId = function (interp) {
    if (valueThisEventId >= 1) interp._eventId = valueThisEventId;
  };

  // Replaces (5x): data/Map003.json:map-event:16:page:1..3 etc.
  AGH_storeValueEnemyEventIdFromEvent = function (interp) {
    valueEnemyEventId = interp.eventId();
  };

  // Replaces (2x): data/Map003.json:map-event:20:page:1, data/Map003.json:map-event:133:page:2
  AGH_storeValueCountSet9FromInterpreter = function (interp) {
    valueCountSet9 = interp._eventId;
    interp._eventId = varValue(SPAWNED_EVENT_TABLE_VAR)[0];
  };

  // Replaces (10x): data/Map003.json:map-event:156:page:1, ... Map035.json:map-event:20:page:1, ...
  AGH_storeValueBossIdFromInterpreter = function (interp) {
    valueBossId = interp._eventId;
  };

  // Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
  AGH_storeThisEventIdOrClear = function (interp) {
    valueThisEventId = interp._eventId >= 1 ? interp._eventId : 0;
  };

  /* ============================================================================
   * Erasing spawned events
   * ========================================================================== */

  // Replaces (3x): data/CommonEvents.json:common-event:184, Map003.json:map-event:20:page:1, Map003.json:map-event:133:page:2
  AGH_eraseFirstSpawnedEvent = function () {
    const spawnedEventTable = varValue(SPAWNED_EVENT_TABLE_VAR);
    const firstSpawnedEventId = spawnedEventTable[0];
    if (firstSpawnedEventId && $gameMap.event(firstSpawnedEventId)) $gameMap.eraseEvent(firstSpawnedEventId);
    spawnedEventTable[0] = 0;
  };

  // Replaces (4x): data/CommonEvents.json:common-event:259
  AGH_eraseTwoSpawnedEvents = function () {
    [11, 12].forEach((slotIndex) => {
      $gameMap.eraseEvent(spawnedEventId(slotIndex));
      varValue(SPAWNED_EVENT_TABLE_VAR)[slotIndex] = 0;
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:297, data/CommonEvents.json:common-event:400
  AGH_eraseAllSpawnedEvents = function (interp) {
    varValue(SPAWNED_EVENT_TABLE_VAR).forEach((spawnedId) => {
      if (spawnedId && $gameMap.event(spawnedId)) $gameMap.eraseEvent(spawnedId);
    });
  };

  // Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
  AGH_eraseAllSpawnedEventsOutOfBattle = function () {
    varValue(SPAWNED_EVENT_TABLE_VAR).forEach((spawnedId) => {
      if (spawnedId >= 1 && $gameMap.event(spawnedId) && !$gameParty.inBattle()) {
        $gameMap.eraseEvent(spawnedId);
      }
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
  AGH_hideEarlySpawnedEvents = function () {
    range(12, 17).forEach((slotIndex) => {
      const spawnedId = spawnedEventId(slotIndex);
      const mapEvent = $gameMap.event(spawnedId);
      if (mapEvent) mapEvent.setTransparent(true);
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:358, data/CommonEvents.json:common-event:361
  AGH_setFacesForSpawnedEvents = function (lastSlotIndex) {
    range(12, lastSlotIndex).forEach((slotIndex) => {
      const spawnedId = spawnedEventId(slotIndex);
      const mapEvent = $gameMap.event(spawnedId);
      if (!mapEvent) return;
      const event = mapEvent;
      event.setStepAnime(false);
      event.setWalkAnime(false);
      event.setDirection(2);
      event.resetPattern();
      event._originalPattern = 1;
      event.setAngle(45);
      event._spriteOffsetX = -12;
      event._spriteOffsetY = -12;
      event._kageM.clear();
      event.setFace(6, true, true);
    });
  };

  // Replaces (4x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
  AGH_setEventFace = function (interp, faceId) {
    $gameMap.event(interp._eventId).setFace(faceId, true, true);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
  AGH_clearEventFace = function (interp) {
    $gameMap.event(interp._eventId).removeFace();
  };

  // Replaces (2x): data/CommonEvents.json:common-event:543, data/CommonEvents.json:common-event:546
  AGH_setFaceForLeadActorEvent = function () {
    const leadEvent = spawnedEvent(varValue(LEAD_ACTOR_VAR));
    leadEvent.setFace(11, true, true);
    leadEvent.setStepAnime(false);
    leadEvent.setWalkAnime(false);
    leadEvent.setDirection(2);
  };

  // Replaces (2x): data/Map054.json:map-event:2:page:1..4
  AGH_setEventFace2 = function (interp) {
    const mapEvent = $gameMap.event(interp._eventId);
    if (!mapEvent) return;
    mapEvent.setStepAnime(false);
    mapEvent.setWalkAnime(false);
    mapEvent.setDirection(2);
    mapEvent.resetPattern();
    mapEvent._originalPattern = 1;
    mapEvent.setAngle(45);
    mapEvent._spriteOffsetX = -12;
    mapEvent._spriteOffsetY = -12;
    mapEvent._kageM.clear();
    mapEvent.setFace(6, true, true);
  };

  // Replaces (7x): data/CommonEvents.json:common-event:392, Map003.json events, Map018.json events
  AGH_gatherNearbyEvents = function (interp) {
    // CharaNameIdが同一のイベントを一日消去
    event_togetherSelf(interp._eventId, "B");
  };

  // Replaces (2x): data/Map003.json:map-event:196:page:1, data/Map018.json:map-event:31:page:1
  AGH_setParallelEvent = function (interp) {
    // ｲﾍﾞﾝﾄに対するx,yのズラす歩数と主人公の向き
    event_pararelSet(interp._eventId, 0, 1, 8);
  };

  // Replaces (22x): data/Map003.json:map-event:198:page:1, ... data/Map018.json:map-event:15:page:1, ...
  AGH_setParallelEventFromEvSceneSet = function (interp, playerDirection) {
    // ｲﾝｼﾞｹｰﾀｰ等消去, 帰還座標記憶, EvSceneSetでｲﾍﾞ起動ｽｲｯﾁ指定
    event_pararelSet(interp._eventId, 0, 1, playerDirection);
  };

  // Replaces (2x): data/Map003.json:map-event:167:page:1, data/Map007.json:map-event:20:page:1
  AGH_startParallelEventFromEvSceneSetMeta = function (interp) {
    const evSceneSet = $gameMap.event(interp._eventId).event().meta["EvSceneSet"];
    if (!evSceneSet) return;
    event_pararelStarting(1, Number(evSceneSet.split(",")[0]), interp._eventId);
  };

  // Replaces (5x): data/Map003.json:map-event:179:page:1, ... Map144.json:map-event:12:page:1
  AGH_presetEventCharacterAndRootEventCharacter = function (interp) {
    valueBossId = interp._eventId;
    event_charaPreset(interp._eventId);
    event_charaRoot(interp._eventId);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:292, :301, :343
  AGH_setInterpreterWaitMode = function (interp) {
    interp.setWaitMode("scroll");
  };

  // Replaces (4x): data/CommonEvents.json:common-event:302, :305, :401, data/Map094.json:map-event:45:page:1
  AGH_respawnLeadActorAtArgs = function (posX, posY, zoomFlag, direction) {
    respawnActor(varValue(LEAD_ACTOR_VAR), posX, posY, zoomFlag).setDirection(direction);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:304, :325, :335, :339
  AGH_respawnTwoAllies = function () {
    respawnActor(4, 12, 6, 0).setDirection(6);
    respawnActor(5, 13, 7, 0).setDirection(8);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:356, :357, :358, ... :362
  AGH_respawnLeadActorAtArgsFacing = function (posX, posY) {
    respawnActorFacing(varValue(LEAD_ACTOR_VAR), posX, posY, 1, 8);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:401
  AGH_respawnActorAtSlot = function (slotIndex, posX, zoomFlag, direction) {
    respawnActor(slotIndex, posX, 34, zoomFlag).setDirection(direction);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:303, data/CommonEvents.json:common-event:324
  AGH_respawnVillageNpcs = function (posX, posX2) {
    respawnNpcFacing(11, 13, 22, 0, "People3", 6, 8);
    respawnNpcFacing(12, posX, 23, 0, "People3", 7, 8);
    respawnNpcFacing(13, posX2, 23, 0, "People3", 7, 8);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:322, data/CommonEvents.json:common-event:354
  AGH_respawnVillainNpc = function () {
    const spawnedNpc = respawnNpcFacing(11, 27, 8, 0, "BB_akunin3", 5, 2);
    spawnedNpc._spriteOffsetY = -10;
  };

  // Replaces (3x): data/CommonEvents.json:common-event:322, :354, :358
  AGH_respawnVillainNpcsFromTable = function () {
    const npcPlacements = [
      [16, 27, 17, 0],
      [12, 25, 15, 1],
      [13, 24, 13, 2],
      [14, 29, 15, 3],
      [15, 31, 14, 4]
    ];
    npcPlacements.forEach(([slotIndex, posX, posY, imageIndex]) => {
      respawnNpc(slotIndex, posX, posY, 0, "BB_akunin3", imageIndex);
    });
  };

  // Replaces (3x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:547
  AGH_respawnNpcFromArgs = function (posX, posY, imageName, imageIndex, direction) {
    respawnNpcFacing(11, posX, posY, 0, imageName, imageIndex, direction);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:300, data/CommonEvents.json:common-event:301
  AGH_respawnAirshipNpc = function (interp) {
    event_respawnSetN(11, 25, 7, 0, "$airship02", 0);
    const spawnedNpc = spawnedEvent(11);
    interp._eventId = spawnedEventId(11);
    spawnedNpc.setDirection(4);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
  AGH_respawnRandomNpcs = function (
    slotIndex,
    posX,
    posY,
    direction,
    slotIndex2,
    posX2,
    posY2,
    direction2,
    slotIndex3,
    posX3,
    posY3,
    direction3
  ) {
    const placeRandomNpc = (slot, x, y, faceDirection) => {
      event_respawnSetN(slot, x, y, 0, "npc" + (getRandomIndex(6) + 1), getRandomIndex(7), faceDirection);
    };
    placeRandomNpc(slotIndex, posX, posY, direction);
    placeRandomNpc(slotIndex2, posX2, posY2, direction2);
    placeRandomNpc(slotIndex3, posX3, posY3, direction3);
  };

  // Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
  AGH_respawnSavedNpc = function () {
    const savedNpc = valueNpcGuraTemporarilySave;
    event_respawnSetN(11, savedNpc[8] - 1, savedNpc[9], 0, savedNpc[6], savedNpc[7], 6);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
  AGH_respawnGoodsEvent = function (quantity, priceOrFlag) {
    const GOODS_SLOT_INDEX = 18;
    goodsEvent_respawn(GOODS_SLOT_INDEX, "food_2", 4, 2, 0, quantity, priceOrFlag);
    spawnedEvent(GOODS_SLOT_INDEX)._priorityType = 2;
  };

  // Replaces (2x): data/Map003.json:map-event:157:page:1, data/Map165.json:map-event:12:page:1
  AGH_setupPopEnemy = function () {
    popEnemy_setUp($dataItems[varValue(240)]);
  };

  // Replaces (5x): data/CommonEvents.json:common-event:292, :304, :314, :316
  AGH_respawnNpcGoods9 = function (interp, selfSwitchKey, posX, posY) {
    mapSelfSwitchOn(selfSwitchKey, "A");
    event_respawnSetN(11, posX, posY, 0, "Goods9", 0, 2);
    interp._eventId = spawnedEventId(11);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:333, data/CommonEvents.json:common-event:348
  AGH_respawnLeadActorAndSpawnedEvent = function (interp, posY, posY2, imageName, imageIndex, direction) {
    const leadActorId = varValue(LEAD_ACTOR_VAR);
    respawnActorFacing(leadActorId, 12, posY, 1, 8);
    interp._eventId = spawnedEventId(leadActorId);
    event_respawnSetN(11, 12, posY2, 0, imageName, imageIndex, direction);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:336, data/CommonEvents.json:common-event:347, data/CommonEvents.json:common-event:349
  AGH_respawnNpcFromArgsAndBind = function (interp, posX, posY, imageName, direction) {
    event_respawnSetN(11, posX, posY, 0, imageName, 0, direction);
    interp._eventId = spawnedEventId(11);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:302, :305, :511, :552, data/Map094.json:map-event:45:page:1
  AGH_respawnNpcAtSlot = function (slotIndex, posX, posY, zoomFlag, imageName, imageIndex, direction) {
    respawnNpc(slotIndex, posX, posY, zoomFlag, imageName, imageIndex).setDirection(direction);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:306
  AGH_respawnLeadActorFacingDown = function (interp, posX, posY) {
    const leadActorId = varValue(LEAD_ACTOR_VAR);
    respawnActor(leadActorId, posX, posY, 1).setDirection(2);
    interp._eventId = spawnedEventId(leadActorId);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:471, data/CommonEvents.json:common-event:541
  AGH_respawnActor5FromArgs = function (interp, posX, posY, direction) {
    respawnActorFacing(5, posX, posY, 1, direction);
    interp._eventId = spawnedEventId(5);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:471
  AGH_respawnUniqueNpcAtSlot = function (
    interp,
    slotIndex,
    posX,
    zoomFlag,
    imageIndex,
    direction,
    referenceSlotIndex
  ) {
    event_respawnSetN(slotIndex, posX, 12, zoomFlag, "npcUnique3", imageIndex, direction);
    interp._eventId = spawnedEventId(referenceSlotIndex);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:383, :384, :528
  AGH_initLeadActorAndRespawn = function (interp, posX, posX2) {
    setSelfVar(interp, LEAD_ACTOR_VAR, 1); // 主格キャラ
    setVar(SPAWNED_EVENT_TABLE_VAR, Array(21).fill(0));
    respawnActor(varValue(LEAD_ACTOR_VAR), posX, 5, 1).setDirection(8);
    spawnedEvent(varValue(LEAD_ACTOR_VAR))._spriteOffsetX = -24;
    respawnActor(5, posX2, 5, 1).setDirection(8);
    spawnedEvent(5)._spriteOffsetX = -24;
  };
  /* ============================================================================
   * Scene pictures (show + fade in)
   *
   * Every "…AndFadeIn" function below is one call of showScenePicture():
   *   show  [x, y, scaleX, scaleY, opacity]  ->  move to [x, y, 100, 100, 255]
   * Only the parameters that actually differ per call site are passed.
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:306, data/CommonEvents.json:common-event:342
  AGH_showScenePictureAndFadeIn = function (scenePicName) {
    let pictureId = 55;
    valuePic1 = pictureId;
    valueScenePic = scenePicName;
    showScenePicture(pictureId, valueScenePic, { y: 384 - 20 });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:306
  AGH_showScenePictureAndFadeIn2 = function (picIndex, picIndex2) {
    showScenePicture(valuePic1 + picIndex, valueScenePic + picIndex2, { x: 640 - 128 + 50 });
  };

  // Replaces (5x): data/CommonEvents.json:common-event:338, :341, :507, :517, :545
  AGH_showScenePictureAndFadeIn3 = function (picIndex, picIndex2, scaleX, scaleY) {
    showScenePicture(valuePic1 + picIndex, valueScenePic + picIndex2, { scaleX, scaleY });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:389, data/CommonEvents.json:common-event:509
  AGH_showScenePictureAndFadeIn4 = function () {
    AGH_showScenePictureAndFadeIn3(3, "03", 100, 100);
    AGH_showScenePictureAndFadeIn3(4, "04", 100, 100);
  };

  // Replaces (8x): data/CommonEvents.json:common-event:391, :393, :399, :546, ...
  AGH_showScenePictureAndFadeIn5 = function (picIndex, picIndex2) {
    valuePic1 = 51;
    showScenePicture(valuePic1 + picIndex, valueScenePic + picIndex2);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:507, :508, :509, :541
  AGH_showScenePictureAndFadeIn6 = function (picIndex, picIndex2, scaleY, opacity) {
    showPic(valuePic1 + picIndex, valueScenePic + picIndex2, 640 - 128, 384, 100, scaleY, opacity, 1);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:530
  AGH_showScenePictureAndFadeIn7 = function () {
    showScenePicture(50, valueScenePic + "02");
  };

  // Replaces (2x): data/CommonEvents.json:common-event:547
  AGH_showScenePictureAndFadeIn8 = function (picIndex, picIndex2) {
    showScenePicture(valuePic1 + picIndex, valueScenePic + picIndex2);
  };

  // Replaces (8x): data/CommonEvents.json:common-event:341, ...
  AGH_movePicture1_3 = function (picIndex, picIndex2, scaleX, scaleY) {
    AGH_showScenePictureAndFadeIn3(picIndex, picIndex2, scaleX, scaleY);
    slideScenePictureAway(picIndex);
  };

  // Replaces (7x): data/CommonEvents.json:common-event:391, :393, :399, :530, :531, :572, ...
  AGH_movePicture1_4 = function (picIndex, scaleX, scaleY) {
    pic_move1(valuePic1 + picIndex, 0, 0, scaleX, scaleY, 0, 90);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:546
  AGH_movePicture1_5 = function (picIndex, picIndex2) {
    valuePic1 = 51;
    const pictureId = valuePic1 + picIndex;
    showScenePicture(pictureId, valueScenePic + picIndex2);
    slideScenePictureAway(picIndex);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516
  AGH_moveScenePictureAndFadeIn = function () {
    movePic(valuePic1 + 1, 640 - 128, 384, 100, 100, 255, 60, 1);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:306
  AGH_fadePicture1FadeIn = function (scenePicName, pictureId) {
    showPic(pictureId, scenePicName, 640, 384, 100, 100, 255, 1);
    picture_fade1(valuePic1, "fadeIn", "150", 60, 5);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:406, :496, :516, :517, :518, :519
  AGH_fadePicture1FadeIn_2 = function (opacity) {
    showPic(valuePic1, valueScenePic + "00", 640 - 128, 384, 100, 100, opacity, 1);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (7x): data/CommonEvents.json:common-event:406, :496, :516, :517, :518, :519, ...
  AGH_setValuePic1 = function () {
    valuePic1 = 51;
  };

  // Replaces (6x): data/CommonEvents.json:common-event:517, :518, :519
  AGH_setValueScenePic = function (scenePicName) {
    valueScenePic = scenePicName;
  };

  /* ============================================================================
   * Standing pictures (blessed)
   * ========================================================================== */

  // Replaces (3x): data/CommonEvents.json:common-event:410, :546, :547
  AGH_blessStandingPicture = function (picIndex, picIndex2, opacity) {
    showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2, { opacity, animate: false });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516
  AGH_blessStandingPicture2 = function (blessType) {
    const pictureId = valuePic1 + 1; // 非表示状態
    showBlessedPicture(pictureId, valueScenePic + "01", { y: 384 + 50, animate: false, blessType });
  };

  // Replaces (5x): data/CommonEvents.json:common-event:496, :516, :517, :518, :519
  AGH_blessStandingPicture3 = function (picIndex, picIndex2, yOffset) {
    showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2, { y: 384 + yOffset });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:496
  AGH_blessStandingPicture4 = function () {
    const pictureId = valuePic1 + 10;
    showBlessedPicture(pictureId, valueScenePic + "21", { x: 640 - 128 + 50, animate: false });
  };

  // Replaces (3x): data/CommonEvents.json:common-event:517, :518, :519
  AGH_blessStandingPicture5 = function () {
    const pictureId = valuePic1 + 10;
    showBlessedPicture(pictureId, valueScenePic + "21", { x: 640 - 128 + 50 });
  };

  // Replaces (3x): data/CommonEvents.json:common-event:526, data/CommonEvents.json:common-event:576
  // Identical to `AGH_blessStandingPicture` above (no bless call), folded into it.
  AGH_blessStandingPicture6 = AGH_blessStandingPicture;

  // Replaces (4x): data/CommonEvents.json:common-event:530, :531, :536
  AGH_blessStandingPicture7 = function (picIndex, picIndex2) {
    valuePic1 = 51;
    showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:541, data/CommonEvents.json:common-event:543
  AGH_blessStandingPicture8 = function (picIndex, picIndex2) {
    showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:544
  AGH_blessStandingPicture9 = function (picIndex, picIndex2) {
    showBlessedPicture(valuePic2 + picIndex, valueScenePic + picIndex2, {
      x: 640 + 480 + 50,
      toX: 640 + 480
    });
  };

  // Replaces (6x): data/CommonEvents.json:common-event:547, :572, :576
  AGH_blessStandingPicture10 = function (picIndex, picIndex2, blessType) {
    showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2, { blessType });
  };

  // Replaces (3x): data/CommonEvents.json:common-event:571, :572, :573
  AGH_blessStandingPicture11 = function (picIndex, picIndex2, yOffset, blessType) {
    showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2, { y: 384 - yOffset, blessType });
  };

  // Replaces (9x): data/CommonEvents.json:common-event:391, :393, :399, :526, :531, :545, ...
  AGH_blessStandingPictureAndMovePicture1 = function (picIndex, picIndex2, blessType) {
    const pictureId = valuePic1 + picIndex;
    showBlessedPicture(pictureId, valueScenePic + picIndex2, { blessType, slidePreviousId: pictureId - 1 });
  };

  // Replaces (12x): data/CommonEvents.json:common-event:496, :516, :517, :518, :519, ...
  AGH_blessStandingPictureAndMovePicture1_2 = function (
    picIndex,
    picIndex2,
    scaleX,
    scaleY,
    duration,
    blessType,
    previousPicIndex,
    AGH_waitFrames
  ) {
    const pictureId = valuePic1 + picIndex;
    showBlessedPicture(pictureId, valueScenePic + picIndex2, {
      scaleX,
      scaleY,
      duration,
      blessType,
      slidePreviousId: valuePic1 + previousPicIndex,
      slideFrames: AGH_waitFrames
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:531, data/CommonEvents.json:common-event:546
  AGH_blessStandingPictureAndMovePicture1_3 = function (picIndex, picIndex2) {
    valuePic1 = 51;
    const pictureId = valuePic1 + picIndex;
    showBlessedPicture(pictureId, valueScenePic + picIndex2, { slidePreviousId: pictureId - 1 });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:542
  AGH_blessStandingPictureAndMovePicture1_4 = function (picIndex, picIndex2) {
    const pictureId = valuePic2 + picIndex;
    showBlessedPicture(pictureId, valueScenePic + picIndex2, {
      x: 640 + 480,
      y: 384 - 118,
      opacity: 200,
      toX: 640 + 480,
      toY: 384 + 50,
      duration: 240,
      slidePreviousId: pictureId - 1
    });
  };

  // Replaces (3x): data/CommonEvents.json:common-event:517, :518, :519
  AGH_blessStandingPictureAndPlayPictureSe1 = function () {
    const pictureId = valuePic1 + 2;
    showBlessedPicture(pictureId, valueScenePic + "02", { scaleX: 300, scaleY: 300 });
    picture_se1();
  };

  // Replaces (5x): data/CommonEvents.json:common-event:368, :412, :495, :532, :548
  AGH_blessStandingPictureAndPlayHcgPiston = function () {
    showBlessedPicture(valuePic2 + 1, valueScenePic + "01", {
      x: 640 + 480 + 50,
      toX: 640 + 480,
      blessType: 1
    });
    const hcgPictureId = valuePic1 + 1;
    showScenePicture(hcgPictureId, valueScenePic + "02", { y: 384 - 20 });
    hcg_piston(hcgPictureId, 5, 1, 2);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:412, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548, data/CommonEvents.json:common-event:573
  // Shows the 1024-frame overlay (picture 70) at full opacity, fades it in and
  // blesses standing picture 1.
  AGH_fadeInFrameAndBlessStandingPicture = function () {
    const framePictureId = valuePic2;
    const framePictureName = "Screen1024Frame"; // 1024ピク表示の際のフレーム枠
    showPic(framePictureId, framePictureName, 640 - 78, 384, 100, 100, 255, 1);
    picture_fade1(framePictureId, "fadeIn", valueWipeImg, 60, 5);
    tachie_bless(value1, 5);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:64
  // Slides the seven scene pictures (ids 101..107) to the left edge.
  AGH_slideScenePicturesAway = function () {
    range(1, 7).forEach((pictureIndex) => pic_move1(100 + pictureIndex, 0, 30, -500, 0));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:537
  AGH_showAndMovePicture1AndBlessStandingPicture = function (picIndex, pictureName) {
    const pictureId = valuePic1 + picIndex;
    pic_showMove1(pictureId, valueScenePic + pictureName, 640 - 128, 384, 100, 60, 2, 200);
    tachie_bless(pictureId, 2);
    slideScenePictureAway(picIndex);
  };

  // Replaces (9x): data/CommonEvents.json:common-event:368, :412, :495, :507, :526, :532, ...
  AGH_setPictureLocationAndBlessStandingPicture = function (picIndex, picIndex2, pictureId, blessType) {
    const targetPictureId = valuePic1 + picIndex;
    pic_locationSet(targetPictureId - pictureId, targetPictureId, valueScenePic + picIndex2, 60, 1);
    tachie_bless(targetPictureId, blessType);
  };

  /* ============================================================================
   * Screen overlays / fades
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:54, data/CommonEvents.json:common-event:301
  AGH_blackOutScreenAndFadeScreenBlackOut = function () {
    valuePic1 = 101;
    showScreenBlackOut(valuePic1, 255);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:172
  AGH_blackOutScreenAndFadeScreenBlackOut2 = function () {
    showPic(100, "ScreenBlackOut", 640, 384, 100, 100, 0, 1);
    movePic(100, 640, 384, 100, 100, 150, 40, 1);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:543
  AGH_fadePicture1ScreenBlackOut = function (actorPictureId, opacity) {
    fadeInScreenBlackOut(actorPictureId, opacity);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:341
  AGH_fadePicture1ScreenBlackOut_2 = function () {
    fadeInScreenBlackOut(55 - 1, 200);
  };

  // Replaces (5x): data/CommonEvents.json:common-event:526, :530, Map083.json:map-event:6:page:1
  AGH_fadePicture1ScreenBlackOut_3 = function (pictureId, opacity, fadePictureId) {
    fadeInScreenBlackOut(pictureId, opacity, fadePictureId);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:517, :518, :519
  AGH_fadePicture1Pic75 = function () {
    fadeInScreenBlackOut(75, 150);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:21, data/CommonEvents.json:common-event:173, :183, Map003.json:map-event:83:page:1
  AGH_fadePicture1Pic98 = function (choicePictureName) {
    showPic(100, "ScreenFoundationChoice", 0 + 300, 0, 100, 100, 0, 0);
    movePic(100, 0, 0, 100, 100, 255, 120, 0);
    showPic(99, choicePictureName, 300 + 20, 0, 200, 200, 0, 0);
    movePic(99, 300, 0, 200, 200, 255, 120, 0);
    fadeInScreenBlackOut(98, 150);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:92, Map007.json:map-event:4:page:1, Map007.json:map-event:6:page:1
  AGH_fadePicture1FadeOut = function () {
    picture_fade1(51, "fadeOut", "Hscene005", 300, 5);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:301, data/Map094.json:map-event:45:page:1
  AGH_fadePicture1FadeOut_2 = function (actorPictureId) {
    valuePic1 = actorPictureId;
    picture_fade1(valuePic1, "fadeOut", valueWipeImg, 60, 5);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:292, :335, :337
  AGH_fadePicture1ZX_Main034_ = function () {
    valuePic1 = 55;
    valueScenePic = "ZX_Main034_";
    showPic(valuePic1, valueScenePic + "01", 640, 384, 100, 100, 0, 1);
    movePic(valuePic1, 640, 384, 100, 100, 255, 60, 1);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (4x): data/Map003.json:map-event:3:page:2, data/Map093.json:map-event:2:page:1, page:2, ...
  AGH_fadeInScreen = function (duration) {
    $gameScreen.startFadeIn(duration);
  };

  // Replaces (4x): data/Map003.json:map-event:6:page:1, :8:page:1, :107:page:1, :182:page:1
  AGH_fadeOutScreen = function (interp) {
    $gameScreen.startFadeOut(30);
    interp.wait(30);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:298
  AGH_setOpeningPictureFromPreset = function () {
    valuePic1 = 55;
    valueCountSet1 = getRandomIndex(51) + 200;
    let presetValues = [1, 2, 1, 1][getRandomIndex(4)];
    if (varValue(17) >= 500) presetValues = [2, 3, 4, 5][getRandomIndex(4)];
    const pictureName = `Zev_Opening1_${presetValues}`;
    showPic(valuePic1, pictureName, 640 + 450 - 500, 384, 300, 300, 0, 1);
    movePic(valuePic1, 640 + 450, 384, 100, 100, valueCountSet1, 300, 1);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:298
  AGH_blessOpeningPictureFromPreset = function () {
    $gameScreen.setPicturesAnimation(3, 2, "連番", 5);
    const presetValues = varValue(17) >= 500 ? 2 : 1;
    const pictureName = `Zev_Opening2_${presetValues}_0`;
    showPic(valuePic1 + 1, pictureName, 640 + 450 - 500, 384, 300, 300, 0, 1);
    movePic(valuePic1 + 1, 640 + 450, 384, 100, 100, valueCountSet1, 300, 1);
    tachie_bless(valuePic1, 2);
    tachie_bless(valuePic1 + 1, 2);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_shrinkPictureRow = function (interp) {
    const PICTURE_ROW_FIRST_ID = 55;
    range(0, 3).forEach((offset) => movePic(PICTURE_ROW_FIRST_ID + offset, 640, 384, 100, 0, 0, 30, 1));
    interp.wait(40);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_erasePictureRow = function () {
    const PICTURE_ROW_FIRST_ID = 55;
    range(0, 3).forEach((offset) => $gameScreen.erasePicture(PICTURE_ROW_FIRST_ID + offset));
  };

  // Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:471
  AGH_erasePictureP4 = function () {
    valuePic1 = 55;
    range(0, 3).forEach((offset) => pic_eraseP(1, [valuePic1 + offset]));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:109, data/CommonEvents.json:common-event:110
  AGH_erasePictureP2 = function () {
    pic_eraseP(0, [121, 122, 123, 124, 125, 126, 127, 128, 129, 130]);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:210, data/CommonEvents.json:common-event:259
  AGH_erasePictureP3 = function (firstPictureId) {
    const existingPictureIds = range(firstPictureId, 200).filter((pictureId) =>
      $gameScreen.picture(pictureId)
    );
    pic_eraseP(0, existingPictureIds);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:495, :532, :548, :572
  AGH_erasePictureP5 = function () {
    pic_eraseP(0, [valuePic1 + 7]);
  };

  // Replaces (2x): data/Map007.json:map-event:23:page:1
  AGH_erasePictureById2 = function (interp, pictureId) {
    $gameScreen.erasePicture(pictureId);
    interp.wait(3);
  };

  /* ============================================================================
   * Boss / H-scene picture choreography
   * ========================================================================== */

  // Replaces (6x): data/CommonEvents.json:common-event:389, :509
  AGH_playHcgPiston = function () {
    hcg_piston(valuePic1 + 4, 7, 1, 1);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:391, :393, :399
  AGH_playHcgPiston2 = function () {
    const pictureId = valuePic1 + 12;
    showPic(pictureId, valueScenePic + "12", 640 - 128, 384, 100, 100, 200, 1);
    hcg_piston(pictureId, 7, 1, 2);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:530, :531, :573
  AGH_playHcgPiston3 = function (picIndex, picIndex2, breathTypeId, breathPresetId, breathLayerId) {
    const pictureId = valuePic1 + picIndex;
    showScenePicture(pictureId, valueScenePic + picIndex2);
    hcg_piston(pictureId, breathTypeId, breathPresetId, breathLayerId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:572, data/CommonEvents.json:common-event:573
  AGH_playHcgPiston4 = function (picIndex, picIndex2, breathTypeId, breathPresetId) {
    const pictureId = valuePic1 + picIndex;
    showScenePicture(pictureId, valueScenePic + picIndex2, { y: 384 + 50 });
    hcg_piston(pictureId, breathTypeId, breathPresetId, 1);
  };

  // Replaces (3x): data/Map007.json:map-event:5:page:1
  AGH_playHcgPiston5 = function (breathPresetId) {
    // ピクID, 1縦2横3左斜め4右斜め, 1緩め2通常3ラスト
    hcg_piston(55, 1, breathPresetId);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:389, :509
  AGH_movePicture1AndPlayHcgPiston = function (picIndex, picIndex2, breathPresetId) {
    const pictureId = valuePic1 + picIndex;
    showScenePicture(pictureId, valueScenePic + picIndex2);
    slideScenePictureAway(picIndex);
    hcg_piston(pictureId, 6, breathPresetId, 1);
  };

  // Replaces (7x): data/CommonEvents.json:common-event:391, :393, :399, :531, :573, ...
  AGH_playHcgPistonAndMovePicture1 = function (picIndex, picIndex2, breathTypeId) {
    const pictureId = valuePic1 + picIndex;
    showScenePicture(pictureId, valueScenePic + picIndex2);
    hcg_piston(pictureId, breathTypeId, 1, 1);
    slideScenePictureAway(picIndex);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:508
  AGH_movePicture1AndBlessStandingPicture = function (picIndex, picIndex2) {
    const pictureId = valuePic1 + picIndex;
    showBlessedPicture(pictureId, valueScenePic + picIndex2, { slidePreviousId: pictureId - 1 });
  };

  // Replaces (4x): data/CommonEvents.json:common-event:368, :495, :532, :548
  AGH_playHcgPistonSwitch429 = function () {
    const pictureId = valuePic1 + 2;
    showPic(pictureId, valueScenePic + "02", 640, 384, 100, 100, 255, 1);
    pic_setArray1 = [1, pictureId, 0, -30, 0, 20];
    pic_setArray2 = [1, pictureId, 0, 0, 3, 30];
    valueParallelPicSe1 = ["ZH_sticky4", 20, 60];
    valueParallelPicSe2 = ["ZH_sticky4", 20, 60];
    hcg_piston(pictureId, 7, 2, 1);
    AGH_enableSwitch(429);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:541, data/CommonEvents.json:common-event:543
  AGH_playHcgPistonSwitch429_2 = function (picIndex, picIndex2, seVolume, pictureId) {
    pic_setArray1 = [1, valuePic1 + picIndex, 0, -15, 0, 20];
    pic_setArray2 = [1, valuePic1 + picIndex2, 0, 0, 3, 30];
    valueParallelPicSe1 = ["ZH_sticky4", seVolume, 10];
    valueParallelPicSe2 = [0, 0, 0];
    hcg_piston(valuePic1 + pictureId, 7, 2, 1);
    AGH_enableSwitch(429);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:572
  AGH_playParallelPictureSeSwitch429 = function (seVolume1, seVolume2) {
    const pictureId = valuePic1 + 7;
    pic_setArray1 = [1, pictureId, 0, -30, 5, seVolume1];
    pic_setArray2 = [1, pictureId, 0, 30, 3, seVolume2];
    valueParallelPicSe1 = [0, 0, 0];
    valueParallelPicSe2 = [0, 0, 0];
    AGH_enableSwitch(429);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:495, :532, :548
  AGH_playAdvHPartDirectAndSetSexDirection = function (interp) {
    // 絶頂射精
    adv_HpartDirectPlay(3);
    sex_direction(12, 0, 0);
    interp.wait(valueSexWait);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:495, :532, :548
  AGH_setAdvPartDirectAndSetSexDirection = function (interp) {
    // ピストン
    adv_partDirectSet(1);
    sex_direction(1, 0, 0);
    interp.wait(valueSexWait);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:517, :518, :519
  AGH_setSexDirectionAndSetAdvPartDirect = function (interp, actionType) {
    sex_direction(actionType, 0, 0);
    interp.wait(valueSexWait);
    adv_partDirectSet(1); // ピストンの時
  };

  // Replaces (2x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:536
  AGH_startPictureAnimationFrame = function (frameId) {
    const pictureId = valuePic1;
    const picture2 = $gameScreen.picture(pictureId);
    if (picture2) {
      picture2.startAnimationFrame(frameId, true, [1, 1, 1, 2]);
    }
  };

  // Replaces (3x): data/CommonEvents.json:common-event:543, :572, :573
  AGH_startPictureAnimationFrame2 = function (picIndex) {
    const pictureId = valuePic1 + picIndex;
    const picture2 = $gameScreen.picture(pictureId);
    if (picture2) {
      picture2.startAnimationFrame(1, true, [1, 1, 1, 2]);
    }
  };

  // Replaces (2x): data/CommonEvents.json:common-event:338
  AGH_playStandingPictureAction = function (interp, expressionCode) {
    tachie_dousa(2, 1, expressionCode, 15, 1, 255, 1344, 0, 0);
    tachie_dousa(1, 1, 4, 15, 1, 255, 0, 0, 0);
    interp.wait(3);
  };

  // Replaces (11x): data/CommonEvents.json:common-event:368, :410, :495, :532, :536, :548, ...
  AGH_setStandingPictureActionZ_ClothesTakeOff = function (
    expressionCode,
    targetPicId,
    sourcePicId,
    showCostumeId
  ) {
    tachie_dousa(0, 1, expressionCode, targetPicId, sourcePicId, showCostumeId, 120, 0, 0);
    AGH_playSeEffectZ_ClothesTakeOff();
  };

  // Replaces (4x): data/CommonEvents.json:common-event:292, :329, Map007.json:map-event:23:page:1
  AGH_playSeEffectZ_ClothesTakeOff = function () {
    const SE_NAME = "Z_ClothesTakeOff"; // ピッチ50か100。消去ウェイトで変更
    AudioManager.playSe({ name: SE_NAME, volume: 150, pitch: 100, pan: 0 });
  };
  /* ============================================================================
   * Flow / state variables
   * ========================================================================== */

  // Replaces (5x): data/CommonEvents.json:common-event:85, :109, :110, :113, :159
  AGH_clearSelfVarRange401To440 = function (interp) {
    clearSelfVarRange(interp, 401, 440);
  };

  // Replaces (7x): data/CommonEvents.json:common-event:85, :401, :516, :546, Map200.json:map-event:11:page:1, ...
  AGH_assignSelfVariableValue = function (interp, variableId, value) {
    setSelfVar(interp, variableId, value);
  };

  // Replaces (10x): data/CommonEvents.json:common-event:219, :307, :401, :411, :451, Map007.json:map-event:3:page:1, ...
  AGH_assignSelfVariableValue2 = AGH_assignSelfVariableValue; // identical helper, kept under its original name

  // Replaces (7x): data/CommonEvents.json:common-event:313, :322, :326, :338, :339, :355, ...
  AGH_setSelfVariableLine = function (interp, line) {
    setSelfVar(interp, 23, line);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:536
  AGH_setHStatSummaryLine = function (interp) {
    const actorHStatArray = varValue(381); // variable 381: アクター1Ｈステ配列
    const hStatValue56 = actorHStatArray[56]; // 381 slot 56 — no name in System.json
    const hStatValue53 = actorHStatArray[53]; // 381 slot 53 — no name in System.json
    setSelfVar(interp, 23, `${hStatValue56}の${hStatValue53}`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:158
  AGH_allowUnrestrictedExposure = function (interp) {
    setSelfVar(interp, 207, 101); // 露出縛りなし
  };

  // Replaces (2x): data/CommonEvents.json:common-event:217, data/CommonEvents.json:common-event:249
  AGH_setMashCountSelfVariable = function (interp) {
    setSelfVar(interp, 702, varValue(702) + 1);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:307, :335, :337
  AGH_setSelfVariableToActorPairNames = function (interp, variableId) {
    const actorName3 = $gameActors.actor(3).name();
    const actorName4 = $gameActors.actor(4).name();
    setSelfVar(interp, variableId, `${actorName3}＆${actorName4}`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:337
  AGH_setSelfVariableToActorNameExcept = function (interp) {
    const actorName4 = $gameActors.actor(4).name();
    setSelfVar(interp, 23, `${actorName4}以外`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:356
  AGH_setSelfVariableToActorTrioNames = function (interp) {
    const actorName3 = $gameActors.actor(3).name();
    const actorName4 = $gameActors.actor(4).name();
    const actorName5 = $gameActors.actor(5).name();
    setSelfVar(interp, 23, `${actorName3}＆${actorName4}＆${actorName5}`);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:90
  AGH_clearSelfVariableCharacterPool = function (interp) {
    setSelfVar(interp, 21, "");
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_initSelfVariableCharacterPool = function (interp) {
    const sharedPoolArray = varValue(21); // variable 21: 乱数汎用1 (the shared character pool)
    setSelfVar(interp, 21, [0, [], 0, 0, 0, 0, 0, 0, 0]);
    sharedPoolArray[1].push(5);
    sharedPoolArray[1].push(556);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_setSelfVariableToFighterStats = function (interp) {
    setSelfVar(interp, 21, valueFighterStatas);
  };

  // Replaces (2x): data/Map003.json:map-event:81:page:1, data/Map003.json:map-event:82:page:1
  AGH_setExpressionFromRandomValue = function (interp) {
    const expressionId = varValue(23);
    const expressionByExpressionId = { 6: 128, 7: 127, 8: 126, 9: 125 };
    const matchedExpressionId = expressionId >= 10 ? 124 : expressionByExpressionId[expressionId];
    if (matchedExpressionId) setSelfVar(interp, 24, matchedExpressionId);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:103
  AGH_setGainRateLabel = function () {
    const icon296 = icon(296);
    const totalexpRounded = Math.round(valueTotalexp);
    const icon313 = icon(313);
    const totalgoldRounded = Math.round(valueTotalgold);
    setVar(332, `${icon296}:${totalexpRounded}${icon313}:${totalgoldRounded}`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:12
  AGH_resetEnemySpawnIdArrays = function () {
    setVar(537, []); // エネミー
    setVar(538, []); // Hエネミー
  };

  // Replaces (2x): data/Map003.json:map-event:19:page:1
  AGH_clearChoiceAndSetNextValue = function (nextValue) {
    setVar(22, 0);
    setVar(23, nextValue);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:174, data/CommonEvents.json:common-event:181
  AGH_setItemIdFromCountArray = function () {
    setVar(19, valueCountArray3[varValue(19)]);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:201, data/CommonEvents.json:common-event:202
  AGH_setSelectedWeaponSlotVariable = function () {
    const weaponSlotRecords = varValue(327); // variable 327: 拠点アクティベート記録配列 (per-slot activation records)
    let targetSlotIndex = 22;
    for (let slotIndex = 1; slotIndex <= 100; slotIndex++) {
      if (!(weaponSlotRecords[slotIndex] == 2)) continue;

      targetSlotIndex = slotIndex;
      break;
    }
    setVar(19, targetSlotIndex);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:201, :202, data/Map003.json:map-event:133:page:2
  AGH_setEscapeMapPosition = function () {
    const homePosition = $dataWeapons[varValue(19)].meta["HomePosition"].split(",");
    const homePositionYOffset = Number(homePosition[3]) == 0 ? 1 : -1;
    setVar(161, [
      Number(homePosition[0]),
      Number(homePosition[1]) + homePositionYOffset,
      Number(homePosition[2])
    ]);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:201, data/CommonEvents.json:common-event:202
  AGH_countDefeatedEnemyAndSetEscapeMap = function () {
    const dungeonInfoItemId = varValue(240); // variable 240: ダンジョン毎情報アイテム指定変数
    let escapeMapPosition;
    if (dungeonInfoItemId >= 1) {
      escapeMapPosition = $dataItems[dungeonInfoItemId].meta["EscapeMapID"].split(",");
      setVar(161, [Number(escapeMapPosition[0]), Number(escapeMapPosition[1]), Number(escapeMapPosition[2])]);
    } else {
      setVar(161, [14, 26, 7]);
    }
    if (Number(escapeMapPosition[0]) != $gameMap.mapId()) {
      AGH_disableSwitch(140); // マップ最初の処理終了スイッチ
    }
  };

  // Replaces (2x): data/CommonEvents.json:common-event:240
  AGH_setValueScriptArray1 = function (setValue, arrayValue) {
    if (valueCountSet1 == setValue) valueScriptArray1 = [arrayValue];
  };

  // Replaces (3x): data/Map003.json:map-event:139:page:1, :140:page:1, :142:page:1
  AGH_cycleBetRateSelfSwitchTo10 = function (interp) {
    $gameSelfSwitches.setVariableValue([$gameMap.mapId(), interp._eventId, 10], 10);
  };

  // Replaces (3x): data/Map003.json:map-event:139:page:1, :140:page:1, :142:page:1
  AGH_cycleBetRateSelfSwitch = function (interp) {
    const nextBetRateByCurrentRate = { 10: 100, 100: 1000, 1000: 10000, 10000: 10 };
    const mapId2 = $gameMap.mapId();
    const currentBetRate = $gameSelfSwitches.getVariableValue([mapId2, interp._eventId, 10]);
    $gameSelfSwitches.setVariableValue(
      [mapId2, interp._eventId, 10],
      nextBetRateByCurrentRate[currentBetRate]
    );
  };

  // Replaces (3x): data/Map003.json:map-event:141:page:1, data/Map003.json:map-event:247:page:1, data/Map007.json:map-event:53:page:1
  AGH_setValueBetCoinlist = function (interp) {
    AGH_cycleBetRateSelfSwitchTo10(interp);
    valueBetCoinlist = [10]; // ポーカー用ベットレート
  };

  // Replaces (3x): data/Map003.json:map-event:141:page:1, data/Map003.json:map-event:247:page:1, data/Map007.json:map-event:53:page:1
  AGH_setValueBetCoinlist2 = function (interp) {
    const nextBetRateByCurrentRate = { 10: 100, 100: 1000, 1000: 10000, 10000: 10 };
    const mapId2 = $gameMap.mapId();
    const currentBetRate = $gameSelfSwitches.getVariableValue([mapId2, interp._eventId, 10]);
    const nextBetRate = nextBetRateByCurrentRate[currentBetRate];
    $gameSelfSwitches.setVariableValue([mapId2, interp._eventId, 10], nextBetRate);
    valueBetCoinlist = [nextBetRate];
  };

  // Replaces (2x): data/Map003.json:map-event:142:page:1
  AGH_setValueMenuBackOpacity = function (opacity) {
    valueMenuBackOpacity = opacity;
  };

  // Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
  AGH_showCongratulationsAndCoinsInfo = function (interp) {
    setVar(801, "おめでとう。");
    const betRate = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
    const coinPrize = betRate * 2;
    setVar(69, varValue(69) + coinPrize);
    showCommonInfo(`コイン+${coinPrize}枚`);
  };

  /* ============================================================================
   * Selection / shop / items
   * ========================================================================== */

  // Replaces (5x): data/CommonEvents.json:common-event:187, :188, :196
  AGH_selectEnemyDrop = function () {
    enemy_dropSelection($gameActors.actor(20));
  };

  // Replaces (1x): data/CommonEvents.json:common-event:176
  AGH_addCustomChoice = function () {
    $gameSystem.addCustomChoice(1, { text: "未指定", value: 0 });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:259
  AGH_addCustomChoice2 = function () {
    const fontSize20 = fontSize(20);
    const skipCutsceneChoiceText = $dataSystem.switches[430];
    const fontSize28 = fontSize(28);
    $gameSystem.addCustomChoice(1, {
      text: `${fontSize20}${skipCutsceneChoiceText}${fontSize28}`,
      value: 99
    });
  };

  // Replaces (1x): data/Map003.json:map-event:83:page:1
  AGH_addCustomChoiceWithText = function () {
    const customChoiceText = varValue(22); // variable 22: 乱数汎用2 (here: the choice text)
    $gameSystem.addCustomChoice(1, { text: `${customChoiceText}　　　　　　　　　　　　　`, value: 0 });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:185
  AGH_setValueShopMaxCols = function () {
    valueShopMaxCols = 1;
    array = [];
  };

  // Replaces (2x): data/CommonEvents.json:common-event:185
  AGH_setValueShopMaxCols2 = function () {
    valueShopMaxCols = 2;
  };

  // Replaces (4x): data/CommonEvents.json:common-event:53, data/Map007.json:map-event:7:page:1
  AGH_gainItem = function (firstItemId, lastItemId) {
    range(firstItemId, lastItemId).forEach((itemId) => {
      const item = $dataItems[itemId];
      if (item.name !== "") $gameParty.gainItem(item, 15);
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
  AGH_useItemBulk = function () {
    valueCountSet1 = 0;
    valueIkkatuArray = [];
    [0, 1, 2].forEach((itemCategoryId) => item_ikkatu(itemCategoryId));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
  AGH_setValueIkkatuArray = function () {
    valueIkkatuArray = [];
  };

  // Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
  AGH_setValueCountSet2_4 = function () {
    valueCountSet2 = valueIkkatuArray.length;
    valueCountSet3 = 0; // +1で件数合計
    valueCountSet4 = 0; // 個数累計
    valueCountSet5 = 0; // 金額合計
    valueCountSet6 = 0; // 変数57合計
    valueCountSet7 = 0; // ｱｲﾃﾑID270合計
  };

  // Replaces (2x): data/CommonEvents.json:common-event:176
  AGH_countTrainingDummyHits = function (maxValue) {
    const trainingDummyCounts = varValue(293); // variable 293: 訓練人形事前設定配列
    const itemId = varValue(19);
    trainingDummyCounts[itemId] += 1;
    if (trainingDummyCounts[itemId] >= maxValue) trainingDummyCounts[itemId] = 1;
  };

  // Replaces (3x): data/CommonEvents.json:common-event:176
  AGH_resetTrainingDummyCount = function (charaSlotId) {
    varValue(293)[charaSlotId] = varValue(20 + charaSlotId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:174
  AGH_setValueCountSet2 = function () {
    valueCountSet2 = 0;
    valueWordSet0 = 0;
    valueWordArray = [];
    valueCountArray = [];
    valueCountArray2 = [];
  };

  // Replaces (3x): data/CommonEvents.json:common-event:174
  AGH_setValueCountSet2_2 = function (wordIndex) {
    valueCountSet2 = 0;
    valueWordSet0 = wordIndex;
  };

  // Replaces (3x): data/CommonEvents.json:common-event:174
  AGH_setValueCountSet2_3 = function (setValue) {
    valueCountSet2 = setValue;
    valueWordSet0 = 0;
  };

  // Replaces (2x): data/CommonEvents.json:common-event:44, data/CommonEvents.json:common-event:45
  AGH_setValueWordSetEx = function () {
    valueWordSetEx = 0;
  };

  // Replaces (1x): data/CommonEvents.json:common-event:205
  AGH_setPickupSkillLabel = function () {
    $gameSystem._pickupData[0] = false;
    $dataSkills[26].name = "持ち上げ＜OFF＞";
  };

  /* ============================================================================
   * Actor names (receptionists / shop keepers / NPCs)
   * ========================================================================== */

  // Replaces (1x): data/CommonEvents.json:common-event:192
  AGH_setInformationBrokerNpcName = function () {
    setNpcIdentity(21, "情報屋");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:239
  AGH_setAppraisalShopNpcName = function () {
    setNpcIdentity(21, "鑑定屋");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:305
  AGH_setGuildBranchReceptionistNpcName = function () {
    const weaponName76 = $dataWeapons[76].name;
    const weaponName22 = $dataWeapons[22].name;
    const displayText = braceRight();
    const displayText2 = braceLeft();
    setNpcIdentity(21, `受付嬢${displayText} ${weaponName76} ${weaponName22}支部${displayText2}`);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
  AGH_setGuildCounterNpcName = function () {
    const weaponName70 = $dataWeapons[70].name;
    const displayText = braceRight();
    const displayText2 = braceLeft();
    setNpcIdentity(22, `受付${displayText} ${weaponName70}${displayText2}`);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:401
  AGH_setNpcNameFromActorInitial = function (nameVariableActorId) {
    $gameActors.actor(22).setName($gameActors.actor(nameVariableActorId).name().slice(0, 1));
  };

  // Replaces (1x): data/CommonEvents.json:common-event:236
  AGH_setBunnyGirlNpcName = function () {
    setNpcIdentity(20, "バニーさん", $dataWeapons[433].name);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:242, data/Map094.json:map-event:32:page:1
  AGH_setCounterClerkNpcName = function (subtitle) {
    setNpcIdentity(20, "受付", subtitle);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:246
  AGH_setTurtleExperienceClownNpcName = function () {
    setNpcIdentity(20, "ピエロ", "タートル・エクスペリエンス社");
  };

  // Replaces (2x): data/CommonEvents.json:common-event:308, data/CommonEvents.json:common-event:355
  AGH_setBossGoblinNpcName = function () {
    setNpcIdentity(20, "ボスゴブリン", $dataSystem.switches[248]);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:390, data/CommonEvents.json:common-event:576
  AGH_setInnLandladyNpcName = function () {
    setNpcIdentity(20, "女将", $dataWeapons[434].name);
  };

  // Replaces (2x): data/Map003.json:map-event:155:page:1, data/Map022.json:map-event:6:page:1
  // Guild staff share one identity: role label + "<city><branch>支部".
  // The two weapon ids hold the city name and the branch name respectively.
  function setGuildNpcIdentity(roleLabel, cityWeaponId, branchWeaponId) {
    const cityName = $dataWeapons[cityWeaponId].name;
    const branchName = $dataWeapons[branchWeaponId].name;
    const guildBranchLabel = cityName + branchName + "支部";
    setNpcIdentity(20, roleLabel, guildBranchLabel);
  }

  AGH_setGuildReceptionistNpcName = function () {
    setGuildNpcIdentity("受付嬢", 76, 22);
  };

  // Replaces (1x): data/Map003.json:map-event:164:page:1
  AGH_setGuildShopClerkNpcName = function () {
    const weaponName402 = $dataWeapons[402].name;
    setNpcIdentity(20, "販売員", `${weaponName402}ギルド出張所`);
  };

  // Replaces (4x): data/Map003.json:map-event:188:page:1, data/Map024.json:map-event:2:page:1, ...
  AGH_setGuildPriestNpcName = function () {
    setGuildNpcIdentity("神官", 77, 22);
  };

  // Replaces (2x): data/Map003.json:map-event:229:page:1, data/Map023.json:map-event:3:page:1
  AGH_setBlacksmithNpcName = function () {
    setNpcIdentity(20, "鍛冶師", $dataWeapons[401].name);
  };

  // Replaces (2x): data/Map003.json:map-event:230:page:1, data/Map021.json:map-event:10:page:1
  AGH_setAppraiserNpcName = function () {
    setNpcIdentity(20, "鑑定師", $dataWeapons[403].name);
  };

  // Replaces (2x): data/Map003.json:map-event:233:page:1, data/Map022.json:map-event:9:page:1
  AGH_setAlchemistNpcName = function () {
    setNpcIdentity(20, "錬金術師", "流れの錬金術師");
  };

  // Replaces (1x): data/Map018.json:map-event:27:page:1
  AGH_setVillageWomanNpcName = function () {
    setNpcIdentity(20, "おばさん", "ネルガド住民");
  };

  // Replaces (1x): data/Map018.json:map-event:28:page:1
  AGH_setVillageGirlNpcName = function () {
    setNpcIdentity(20, "お姉さん", "ネルガド住民");
  };

  // Replaces (1x): data/Map022.json:map-event:3:page:1
  AGH_setShopClerkNpcName = function () {
    setNpcIdentity(20, "販売員", $dataWeapons[402].name);
  };

  // Replaces (1x): data/Map048.json:map-event:3:page:1
  AGH_setGuildBranchClerkNpcName = function () {
    setGuildNpcIdentity("受付", 76, 41);
  };

  // Replaces (1x): data/Map003.json:map-event:237:page:1
  AGH_setInnReceptionistNpcNameAndDialogue = function (isLandlady = false) {
    const npcRoleName = isLandlady ? "宿女将" : "宿受付";
    setNpcIdentity(20, npcRoleName, $dataWeapons[421].name);
    valueCountSet1 = 1231;
    valueCountSet2 = 1232;
    const innPriceText = variableText(21);
    const currencyMarker = goldIcon();
    const messageText = isLandlady
      ? `「いらっしゃい。\nウチは一泊${innPriceText}${currencyMarker}よ。\n泊まっていくかしら？」\n`
      : `「いらっしゃい。\nウチは一泊${innPriceText}${currencyMarker}よ。\n泊まっていくのかしら？」\n`;
    setVar(23, messageText);
    setVar(22, "$FACE[People4, 5]");
  };

  // Replaces (1x): data/Map046.json:map-event:4:page:1
  AGH_setInnLandladyNpcNameAndDialogue = function () {
    return AGH_setInnReceptionistNpcNameAndDialogue(true);
  };

  /* ============================================================================
   * Standing-picture helpers and NPC presets
   * ========================================================================== */

  // Replaces (1x): data/CommonEvents.json:common-event:160
  AGH_setCurrentActorFromStandingPictureChoice = function () {
    if ($gameParty.inBattle()) return;
    setVar(20, varValue(3));
    tachie_settei2();
  };

  // Replaces (1x): data/CommonEvents.json:common-event:160
  AGH_showStandingPictureForChoiceVariable = function (interp) {
    if ($gameParty.inBattle()) return;
    tachie_hyouji1(varValue(3));
    callStandingPicturePlugin(interp);
  };

  // Replaces (3x): data/Map007.json:map-event:4:page:1, :6:page:1, :23:page:1
  AGH_showStandingPictureForCurrentActor = function (interp) {
    AGH_enableSwitch(42);
    tachie_hyouji1(varValue(CURRENT_ACTOR_VAR));
    callStandingPicturePlugin(interp);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_showStandingPicture1 = function () {
    AGH_enableSwitch(42);
    tachie_hyouji1(varValue(CURRENT_ACTOR_VAR));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:301
  AGH_moveStandingPicture1 = function (actorPictureId) {
    valuePic1 = actorPictureId;
    picTachie_move1(valuePic1, -500, 0, 0, 0, 0, 60);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:307
  AGH_moveStandingPicture1_2 = function () {
    const pictureId = 13;
    valuePic1 = pictureId;
    const picture = $gameScreen.picture(pictureId);
    if (!picture) {
      console.warn(`AGH_moveStandingPicture1_2: picture ${pictureId} is not displayed`);
      return;
    }
    const pictureScaleX = picture.scaleX();
    picTachie_move1(pictureId, 0, 0, -pictureScaleX * 2, 0, 255, 60);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:338
  AGH_startStandingPictureDialogue = function (interp, sideCount) {
    // 「一人で立ち絵変化させる時は4」「NPC会話の時は0」
    tachie_kaiwastart(false, false, 1, sideCount);
    AGH_runCommonEventAsChild(interp, 18);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:414, data/CommonEvents.json:common-event:451
  AGH_startStandingPictureDialogue2 = function (rightSideCount) {
    // 急ぎ, 拡大, 右人数, 左人数
    tachie_kaiwastart(false, true, rightSideCount, 1);
  };

  /* ============================================================================
   * Camera / weather / background
   * ========================================================================== */

  // Replaces (4x): data/CommonEvents.json:common-event:331, :337, Map007.json:map-event:4:page:1, :6:page:1
  AGH_zoomCamera = function (easing) {
    zoomCameraOnEvent(easing);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:338, :361, :471
  AGH_zoomCamera2 = function (interp) {
    zoomCameraOnEvent(interp._eventId, 1.5);
  };

  // Replaces (7x): data/CommonEvents.json:common-event:331, :338, :356, :359, :536, :546, ...
  AGH_zoomCameraOnLeadActorEvent = function (eventSlotIndex) {
    // NOTE: the original declared `easing` twice (shadowing bug); kept verbatim.
    let easing = eventSlotIndex;
    easing = spawnedEventId(easing);
    zoomCameraOnEvent(easing);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:511, :552, data/Map094.json:map-event:45:page:1
  AGH_zoomCameraOnLeadActorEventAndBind = function (interp) {
    interp._eventId = spawnedEventId(varValue(LEAD_ACTOR_VAR));
    zoomCameraOnEvent(interp._eventId);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:301, data/Map007.json:map-event:4:page:1
  AGH_setMapWeatherFire = function () {
    setVar(256, 11); // 火事
    map_weatherSet2();
  };

  // Replaces (2x): data/CommonEvents.json:common-event:301
  AGH_setMapWeatherFromArgs = function (weatherType) {
    setVar(256, weatherType); // 本降り
    map_weatherSet2();
  };

  // Replaces (7x): data/CommonEvents.json:common-event:368, :409, :412, :414, :495, :532, ...
  AGH_selectMapMusicAndSelectMapParallax = function () {
    setMap_musicSelect(1, 22, 0); // 種別, id, 0屋内1屋外
    setMap_parallaxSelect(1, 22, 1);
    backGraund_menuMapSelect(2, 0, 0, 0);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:516, data/CommonEvents.json:common-event:526
  AGH_selectMapParallax = function (parallaxName) {
    setMap_parallaxSelect(0, parallaxName, 0);
  };

  // Replaces (5x): data/CommonEvents.json:common-event:406, :496, :517, :518, :519
  AGH_selectMapParallaxAndSelectMenuMapBackground = function () {
    setMap_parallaxSelect(0, 21, 0);
    backGraund_menuMapSelect(2, "Dungeon1_2", 0, 0);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:410
  AGH_selectMenuMapBackground = function (mapBackgroundName) {
    backGraund_menuMapSelect(2, mapBackgroundName, 0, 0);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:516, :517, :518, :519
  AGH_selectMenuMapBackgroundDungeon1_2 = function () {
    backGraund_menuMapSelect(2, "Dungeon1_2", 0, 0);
  };

  // Replaces (5x): data/CommonEvents.json:common-event:442, data/CommonEvents.json:common-event:552
  AGH_setBackgroundLine = function (bgsLineId) {
    $gameSystem.setBgsLine(bgsLineId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:303, data/CommonEvents.json:common-event:324
  AGH_saveBgmAndFadeOut = function (duration) {
    $gameSystem.saveBgm();
    AudioManager.fadeOutBgm(duration);
  };

  // Replaces (7x): data/CommonEvents.json:common-event:301, :304, :305, ...
  AGH_assignSelfVariableFromSwitchName = function (interp, variableId, switchId) {
    setSelfVar(interp, variableId, $dataSystem.switches[switchId]);
  };

  // Replaces (1x): data/Map005.json:map-event:2:page:1
  AGH_resetScreenToneTemp = function () {
    $gameScreen._tone_temp = 0;
  };

  // Replaces (1x): data/Map005.json:map-event:2:page:1
  AGH_pushLoadScene = function () {
    SceneManager.push(Scene_Load);
  };

  /* ============================================================================
   * Screen effects / SE
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:61, data/CommonEvents.json:common-event:62
  AGH_flashScreenForFrameCount = function () {
    $gameScreen.startFlash([255, 119, 255, 200], varValue(121));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:61, data/CommonEvents.json:common-event:62
  AGH_shakeScreen = function () {
    $gameScreen.startShake(7, 7, varValue(121));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:481
  AGH_flashScreen = function () {
    $gameScreen.startFlash([255, 119, 255, 200], 60);
    $gameScreen.startShake(7, 7, 20);
    $gameScreen.startAnimation(640 - 256, 368, 634, false);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:61
  AGH_playHeartbeatSe = function () {
    playPitchVariableSe("鼓動");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:62
  AGH_playHeartbeatSeAlt = function () {
    playPitchVariableSe("Z_HeartBeat");
  };

  // Replaces (2x): data/CommonEvents.json:common-event:196
  AGH_requestEventAnimation = function (animationId) {
    $gameMap.event(valueEnemyEventId).requestAnimation(animationId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:124
  AGH_requestAnimationOnMapEvent = function (interp, animationId) {
    interp.character(varValue(223)).requestAnimation(animationId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:105, data/CommonEvents.json:common-event:122, data/CommonEvents.json:common-event:205
  AGH_setGlossaryText1AndSetGlossaryText2 = function () {
    forEachDatabaseMeta($dataItems, "SG種別", (itemId, glossaryCategory) => {
      if (Number(glossaryCategory) == 2) {
        scene_Glossarytext1(itemId, 218);
        scene_Glossarytext2(itemId, 213);
        scene_Glossarytext3(itemId, 219);
      }
    });
  };

  /* ============================================================================
   * Spawned-event movement
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:322, data/CommonEvents.json:common-event:335
  AGH_moveSpawnedEvents345 = function (moveRouteCode) {
    moveSpawnedEvents(moveRouteCode, 0, [3, 4, 5]);
  };

  // Replaces (5x): data/CommonEvents.json:common-event:331, :337, :339, :530
  AGH_moveTwoSpawnedEvents = function (slotIndex, slotIndex2, moveRouteCode) {
    moveSpawnedEvents(moveRouteCode, 0, [slotIndex, slotIndex2]);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:338, :346, :361, :471, :530
  AGH_moveSpawnedEventWithParams = function (slotIndex, moveRouteCode, moveRouteParameters) {
    moveSpawnedEvents(moveRouteCode, moveRouteParameters, [slotIndex]);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:368, :495, :532, :548
  AGH_moveSpawnedEventsDown = function () {
    // 1下移動 16下向く 39透明化
    moveSpawnedEvents(16, 0, [1, 11]);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
  AGH_moveSpawnedEventsBalloon = function () {
    const slotIndexes = [1, 12];
    moveSpawnedEvents(16, 0, slotIndexes);
    moveSpawnedEvents(45, "this.requestBalloon(1);", slotIndexes);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:327, :332, :349
  AGH_movePartyCharacter = function (moveRouteCode) {
    event_partyCharaMove(moveRouteCode, 0); // 19上を向く
  };

  // Replaces (2x): data/CommonEvents.json:common-event:356
  AGH_moveLeadActorEventTowardParty = function () {
    const targetEventId = spawnedEventId(varValue(LEAD_ACTOR_VAR));
    event_partyCharaMove(45, `this.moveTowardCharacter($gameMap.event(${targetEventId}));`);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
  AGH_bindInterpreterToSpawnedEventSlot = function (interp, slotIndex) {
    interp._eventId = spawnedEventId(slotIndex);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:248, data/CommonEvents.json:common-event:249
  AGH_bindInterpreterToEvent196 = function (interp) {
    interp._eventId = varValue(196);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:300, data/Map007.json:map-event:3:page:1
  AGH_applyAfterimageType20 = function (interp, afterimageType = 20) {
    event_charaZanzou(interp._eventId, afterimageType);
    interp._eventId = spawnedEventId(afterimageType);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:300, data/Map007.json:map-event:3:page:1
  AGH_applyAfterimageType19 = function (interp) {
    return AGH_applyAfterimageType20(interp, 19);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:318, :326, :333
  AGH_requestAnimationOnSpawnedEvent12 = function () {
    spawnedEvent(12).requestAnimation(635);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:124
  AGH_turnOnSelfSwitchD = function () {
    selfSwitchOn(varValue(52), varValue(223), "D");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:471
  AGH_speakSpawnedEventShoutOneLiner = function () {
    speakOneLiner(null, 100, "オラァッ！！", { eventId: spawnedEventId(11), fontWeight: 120 });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:471
  AGH_speakSpawnedEventGaspOneLiner = function () {
    speakOneLiner(null, 100, "ガハッッ！？", { eventId: spawnedEventId(5), fontWeight: 120 });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:471
  AGH_speakSpawnedEventHmphOneLiner = function () {
    speakOneLiner(null, 100, "フンッ！", { eventId: spawnedEventId(11) });
  };

  // Replaces (3x): data/CommonEvents.json:common-event:356
  AGH_speakLeadActorRustleOneLiner = function (interp, eventSlotIndex, pictureId) {
    const spawnedId = spawnedEventId(eventSlotIndex);
    interp._eventId = spawnedId;
    speakOneLiner(interp, pictureId, "ガサゴソ──", {
      yOffsets: [-10],
      eventId: spawnedId,
      fontWeight: 180
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:234
  AGH_speakBlessingOneLiner = function (interp) {
    speakOneLiner(interp, 100, "親愛なる隣人の旅路に祝福を──", { fontSize: 28, fontWeight: 240 });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:338
  AGH_speakGulpOneLiner = function (interp) {
    speakOneLiner(interp, 100, "ゴクゴクっ──", { fontWeight: 240 });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:541
  AGH_speakRustleOneLiner = function (interp) {
    speakOneLiner(interp, 100, "ガサゴソ…");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:301
  AGH_speakLaughOneLiner = function () {
    speakOneLiner(null, 76, "「ヒャッハァッッ！」", {
      eventId: 3,
      fontWeight: 120,
      fontFace: "SourceHanSerif-Heavy"
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:301
  AGH_speakScreamOneLiner = function () {
    speakOneLiner(null, 77, "「ギャアアアアアアアアアッッ────！！」", {
      eventId: 3,
      fontFace: "genkai-mincho"
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:301
  AGH_speakRoarOneLiner = function () {
    speakOneLiner(null, 100, "ウオオオオォォッッ！！", { eventId: 6, fontFace: "Tamanegiv6" });
  };

  // Replaces (3x): data/Map007.json:map-event:34:page:1
  AGH_speakShoutOneLiner = function (interp) {
    valueSerialPictureId += 1;
    speakOneLiner(interp, valueSerialPictureId, ["「オラッ！」", "「オラァッ！」"], {
      fontWeight: 60,
      xOffsets: [-50, 0, 50, -100, 100],
      yOffsets: [-50, 0, 50, -100, 100],
      waitFrames: 20
    });
  };

  /* ============================================================================
   * NPC placement data / world settings
   * ========================================================================== */

  // Replaces (1x): data/CommonEvents.json:common-event:205
  AGH_setNpcProfession = function () {
    setNPCProfession(); // NPC役職名配列
  };

  // Replaces (1x): data/CommonEvents.json:common-event:205
  AGH_setNpcFamilyName = function () {
    setNPCFamilyName(); // NPC苗字設定
  };

  // Replaces (1x): data/CommonEvents.json:common-event:205
  AGH_addAllSacredBeastParams = function () {
    seisyoujuu_addParamsAll(); // 星晶獣強化反映
  };

  // Replaces (1x): data/CommonEvents.json:common-event:205
  AGH_setTraitChangeAndSetInfoY = function () {
    trait_changeSetting(106); // 信仰バフステート変動設定
    trait_changeSetting(107); // 食事バフステート変動設定
    info_SetY(varValue(200)); // インフォY軸補正値ミニステで変更
  };

  // Replaces (1x): data/CommonEvents.json:common-event:101
  AGH_forceHomeMove = function () {
    set_homeMoveForced(); // 拠点に強制移動
  };

  // Replaces (1x): data/CommonEvents.json:common-event:85
  AGH_propagateLibido = function () {
    seiyoku_hanei(); // 性欲度情報を更新
  };

  // Replaces (2x): data/Map007.json:map-event:3:page:1
  AGH_setEnemyParams = function (paramValue) {
    [21, 22, 41, 42, 61, 62].forEach((enemyId) => {
      $dataEnemies[enemyId].params[0] = paramValue;
    });
  };

  // Replaces (2x): data/Map007.json:map-event:3:page:1, data/Map007.json:map-event:7:page:1
  AGH_gainSkillMasteryLevel = function (actorId, skillId, levelGain) {
    $gameActors.actor(actorId).gainSkillMasteryLevel(skillId, +levelGain);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_gainSkillMasteryLevelActor1 = function () {
    const actor1 = $gameActors.actor(1); // the one actor this entry point trains
    actor1.gainSkillMasteryLevel(101, +1);
    actor1.gainSkillMasteryUses(201, 15);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:342
  AGH_loadGameFont = function (interp, fontSize) {
    Graphics.loadFont("GameFont", fontSize);
    interp.wait(10);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_configureGatewayMessage = function () {
    $gameSystem.GWMessageSetting.useGW = "ON";
    $gameSystem.GWMessageSetting.imgName = "Dunjon008";
    $gameSystem.GWMessageSetting.fadeSpeed = 256;
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_setPlayerTransparent = function () {
    $gamePlayer.setTransparent(true);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:161
  AGH_hideFollowers = function () {
    if ($gameSwitches.value(209) || $gameSwitches.value(HELPER_SWITCH.TOWN)) $gamePlayer.hideFollowers();
    if ($gameSwitches.value(201) || $gameSwitches.value(205)) $gamePlayer.showFollowers();
  };

  // Replaces (1x): data/CommonEvents.json:common-event:161
  AGH_resetPlayerGraphic = function () {
    if ($gamePlayer.followers().follower(0).isVisible()) $gamePlayer.resetCustomizeGraphic();
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_moveReserveMembersToVariable = function (interp) {
    $gameParty.members().forEach((reserveMember) => {
      if (!reserveMember.isBattleMember()) {
        varValue(154).push(reserveMember._actorId);
        $gameParty.removeActor(reserveMember._actorId);
      }
    });
  };

  /* ============================================================================
   * Popups / onomatopoeia / sub-windows
   * ========================================================================== */

  // Replaces (4x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:338
  AGH_showPopupMessage = function (messageId) {
    message_popup2(messageId, 0, 2, 1);
  };

  // Replaces (8x): data/CommonEvents.json:common-event:342, :382, :511, data/Map094.json:map-event:45:page:1, ...
  AGH_showPopupMessageForSpawnedEvent = function (eventSlotIndex, popupType) {
    message_popup2(spawnedEventId(eventSlotIndex), 0, popupType, 1);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:431
  AGH_showBalloonAndPopupForSpawnedEvent = function (eventSlotIndex, balloonId, popupType) {
    spawnedEvent(eventSlotIndex).requestBalloon(balloonId);
    message_popup2(spawnedEventId(eventSlotIndex), 0, popupType, 1);
  };

  // Replaces (1x): data/Map003.json:map-event:44:page:1
  AGH_addPopupOnomatopoeia1 = function (interp) {
    interp.addPopup(["add", "text:ﾋﾟｲｲｲ──…"]);
  };

  // Replaces (2x): data/Map003.json:map-event:62:page:1, data/Map003.json:map-event:63:page:1
  AGH_addPopupOnomatopoeia2 = function (interp) {
    interp.addPopup(["add", "text:ホゥ…"]);
  };

  // Replaces (1x): data/Map003.json:map-event:64:page:1
  AGH_addPopupOnomatopoeia3 = function (interp) {
    interp.addPopup(["add", "text:ペンっ"]);
  };

  // Replaces (4x): data/Map003.json:map-event:57:page:1, :58:page:1, :59:page:1, data/Map126.json:map-event:4:page:1
  AGH_selectAnimalAction = function (interp) {
    valueanimalEvent2Id = 0;
    animal_ActionSelect(interp._eventId);
    if (valueanimalEvent2Id != 0) interp.addPopup(["add", `text:${valueanimalEvent2Id}`]);
    else interp.wait(30);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:471
  AGH_showMapCenterLabel = function (interp, switchId) {
    const placeName = $dataSystem.switches[switchId]; // name of the switch passed as switchId
    map_centerDispray(55, centerLabel(`【${placeName}】`));
    interp.wait(40);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_showPicture91 = function () {
    $gameScreen.setPicturesAnimation(2, 1, "横", 40);
    showPic(91, "画面ピンク", 640, 384, 100, 100, 200, 1);
    $gameScreen.picture(91).startAnimationFrame(1, true, 1);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:221
  AGH_showPicture3 = function () {
    const pictureName = $gameSwitches.value(488) ? "PictureBottan3a" : "PictureBottan3";
    showPic(3, pictureName, 255, 39, 100, 100, 255, 1);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:243, data/CommonEvents.json:common-event:244
  AGH_showPicture1 = function (pictureName) {
    const PICTURE_ID = 100;
    const pictureFrame = [4, 5, 6, 7][getRandomIndex(4)];
    pic_1(2, PICTURE_ID, pictureName, pictureFrame, 100, 255, 20, 1280, 768, 0, 0);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1
  AGH_showPicture1Xev100_00back = function () {
    pic_1(0, 53, "Xev100_00back", 0, 100, 255, 60, 1280, 768, -256, 0);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:221
  AGH_showPictureFromArgs = function (pictureId, pictureName, origin, x, y) {
    showPic(pictureId, pictureName, x, y, 100, 100, 255, origin);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:221
  AGH_showPictureFromArgs2 = function (
    pictureId,
    pictureName,
    x,
    secondPictureId,
    secondPictureName,
    secondX
  ) {
    showPic(pictureId, pictureName, x, 39, 100, 100, 255, 1);
    showPic(secondPictureId, secondPictureName, secondX, 39, 100, 100, 255, 1);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:451, data/Map007.json:map-event:4:page:1
  AGH_showPictureFromArgs3 = function (pictureId, pictureName, opacity) {
    showPic(pictureId, pictureName, 640, 384, 100, 100, opacity, 1);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:103
  AGH_logDebugValueActor20 = function () {
    //console.log($gameActors.actor(20));
  };

  // Replaces (1x): data/CommonEvents.json:common-event:64
  AGH_loadSkillPersonalSwitchAndSelectSkill = function (interp) {
    valueChangeSkill.forEach((skillId) => skill_personalonoffload(skillId, 0));
    valueVariablesChangeSkill.forEach((skillId) => skill_sentaku(skillId, 0));
  };

  // Replaces (1x): data/CommonEvents.json:common-event:205
  AGH_loadSkillPersonalSwitch = function (interp) {
    valuePersonalSkill.forEach((skillId) => skill_personalonoffload(skillId, 0));
  };

  // Replaces (1x): data/CommonEvents.json:common-event:205
  AGH_loadSkillPersonalSwitch2 = function (interp) {
    valuePersonalItem.forEach((itemId) => skill_personalonoffload(itemId, 1));
  };

  /* ============================================================================
   * Debug helpers
   * ========================================================================== */

  // Replaces (4x): data/CommonEvents.json:common-event:53
  AGH_logVariableValue = function (variableId) {
    //console.log(varValue(variableId));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:53, data/CommonEvents.json:common-event:199
  AGH_logDebugValue3 = function (value) {
    //console.log(value);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:52
  AGH_logDebugValue = function (metaKey, metaValueIndex, picturePathPrefix) {
    let pictureSlot = 1;
    for (let entryId = 1; entryId < $dataItems.length; entryId += pictureSlot) {
      // NOTE: original stepped by pictureSlot (kept verbatim)
      for (let metaIndex = 1; metaIndex <= 9; metaIndex++) {
        const metaValue = $dataItems[entryId].meta[metaKey + metaIndex];
        if (metaValue) {
          const pictureName = picturePathPrefix + metaValue.split(",")[metaValueIndex];
          showDebugPicture(pictureSlot, entryId, pictureName);
          pictureSlot += 1;
        }
      }
    }
  };

  // Replaces (3x): data/CommonEvents.json:common-event:52
  AGH_logDebugValue2 = function (metaKey) {
    forEachSteppedMetaEntry($dataWeapons, metaKey, (entryId, metaValue, pictureSlot) => {
      showDebugPicture(pictureSlot, entryId, "/img/parallaxes/" + metaValue.split(",")[0]);
      return true;
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:52
  // Plays the BGM named by one metadata column for every entry that has one;
  // "NoMusic" entries are skipped. Items and weapons share this scan.
  function playDatabaseBgmFromMetaName(database, metaKey) {
    forEachSteppedMetaEntry(database, metaKey, (entryId, metaValue) => {
      const bgmName = metaValue.split(",")[0];
      if (bgmName === "NoMusic") return false;
      playMetaBgm(entryId, bgmName);
      return true;
    });
  }

  AGH_playItemMusicFromMetaName = function (metaKey) {
    playDatabaseBgmFromMetaName($dataItems, metaKey);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:52
  AGH_playItemMusicFromMetaName2 = function (metaKey) {
    playDatabaseBgmFromMetaName($dataWeapons, metaKey);
  };

  // Replaces (7x): data/Map003.json:map-event:180:page:1, Map193.json events
  AGH_logDebugValue4 = function () {
    //console.log(`${$gameMap.tileId(6, 14, 1)}`);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_logDebugValue5 = function () {
    //console.log($dataItems[7].recipeItem[1]);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_logDebugValue6 = function (interp) {
    value1 = DataManager.getSynthesisIngredient($dataItems[234], 0);
    //console.log(valueItemsSynth1);
    setSelfVar(interp, 21, value1.id + 1000);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_debugLogTreasurePools = function () {
    const treasurePool = eval(`valueDanjonTreasure${varValue(CURRENT_ACTOR_VAR)}`);
    //treasureKindPool is only read by the commented debug log below
    //const treasureKindPool = eval(`valueDanjonTrSyurui${varValue(CURRENT_ACTOR_VAR)}`);
    //console.log(treasurePool);
    //console.log(treasureKindPool);
    const pickedTreasureId = treasurePool[getRandomIndex(treasurePool.length)];
    const pickedIndex = treasurePool.findIndex((treasureId) => treasureId === pickedTreasureId);
    if (pickedIndex >= 0) treasurePool.splice(pickedIndex, 1);
    //console.log(treasurePool);
    //console.log($dataItems[pickedTreasureId].name);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_readActorCharacterInfo = function () {
    const targetActor = $gameActors.actor(n); // dead reads, kept verbatim
    targetActor._characterIndex;
    targetActor._characterName;
  };

  // Replaces (3x): data/CommonEvents.json:common-event:53, data/Map007.json:map-event:2:page:1
  AGH_pickRandomIndexes = function () {
    // ｱｸﾀｰID, ﾋﾟｸﾁｬ, H相手(301ﾓﾌﾞ305対象なし306ｱｲﾃﾑ), 非表示, 簡易, 過去シーンか否か
    i1 = getRandomIndex(3) + 100;
    const presetValues = [1, 2, 3, 4, 5];
    i2 = presetValues[getRandomIndex(presetValues.length)];
  };

  // Replaces (2x): data/CommonEvents.json:common-event:49
  AGH_dropCachedMapData = function () {
    delete window.$dataMap2;
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_runCommonScript1 = function (interp) {
    // id, ｲﾍﾞid, 速度, 頻度, ｱﾆid, x, y, 高さ, 回転数, 角度
    common_script1(26, interp._eventId, 6, 5, 131, 4, 0, 15, 2, 90);
    AGH_runCommonEventAsChild(interp, 64);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_checkPlayerOnEventAndStoreEventId = function (interp) {
    const character2 = interp.character(0);
    character2.x == interp.character(-1).x && character2.y == interp.character(-1).y;
    value2 = $gameMap.eventIdXy(9, 3);
    setVar(2, value2);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:18, data/CommonEvents.json:common-event:53
  AGH_initWeaponSlotVariableArrays = function () {
    range(541, 560).forEach((variableId) => setVar(variableId, Array(43).fill(0)));
  };

  // Replaces (7x): data/CommonEvents.json:common-event:18, :66, :67, :110, :212, Map005.json:map-event:2:page:1, ...
  AGH_showAndMovePicturePairFromArgs = function (
    pictureId,
    pictureName,
    scaleX,
    scaleY,
    opacity,
    toScaleX,
    toScaleY,
    toOpacity,
    duration
  ) {
    showPic(pictureId, pictureName, 640, 384, scaleX, scaleY, opacity, 1);
    movePic(pictureId, 640, 384, toScaleX, toScaleY, toOpacity, duration, 1);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:19, :20, data/Map005.json:map-event:2:page:1
  AGH_moveTwoPicturesFromArgs = function (
    pictureId,
    scaleY,
    duration,
    secondPictureId,
    secondScaleY,
    secondDuration
  ) {
    movePic(pictureId, 640, 384, 100, scaleY, 0, duration, 1);
    movePic(secondPictureId, 640, 384, 100, secondScaleY, 0, secondDuration, 1);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:19, data/CommonEvents.json:common-event:20
  AGH_syncHeroineClothAndRefresh = function (interp) {
    forEachHeroine((heroineId) => {
      if (!$gameParty.members().contains($gameActors.actor(heroineId))) return;
      range(0, 42).forEach((slotIndex) => {
        varValue(heroineId + 440)[slotIndex] = varValue(heroineId + 540)[slotIndex];
      });
      setVar(CURRENT_ACTOR_VAR, heroineId);
      tachie_settei2();
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:64
  AGH_subtractVariables = function (resultVariableId, minuendVariableId, subtrahendId, subtrahend2Id) {
    setVar(resultVariableId, varValue(minuendVariableId) - varValue(subtrahendId) - varValue(subtrahend2Id));
  };
  /* ============================================================================
   * Remaining helpers and map-event utilities
   * ========================================================================== */

  // Replaces (3x): data/CommonEvents.json:common-event:10, data/CommonEvents.json:common-event:21
  AGH_setValueStartCommentary0 = function () {
    valueStartCommentary0 = 1;
  };

  // Replaces (1x): data/CommonEvents.json:common-event:22
  AGH_appendRestingLine = function (interp) {
    const restingActorName = variableText(49); // variable 49: 名前
    appendStoredSelfLine(interp, `${restingActorName}は傷付いた身体を休めた…。\n`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:83
  AGH_appendEstrusLine = function (interp, isRestless = false) {
    if (typeof actor === "undefined" || !actor) return;
    const actorName = actor.name();
    const effectName = colorTaggedText(27, "発情");
    const messageText = isRestless
      ? `${actorName}は${effectName}した肢体を持て余している…。` + "\n"
      : `${actorName}は${effectName}した肢体を慰めている…。` + "\n";
    appendStoredSelfLine(interp, messageText);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:83
  AGH_appendEstrusLine2 = function (interp) {
    return AGH_appendEstrusLine(interp, true);
  };

  // Replaces (11x): data/CommonEvents.json:common-event:338, :481, :503, :536, :537, :544, ...
  AGH_setDarknessOpacity = function (opacity) {
    $gameMap.darknessOpacity = opacity;
  };

  // Replaces (7x): data/CommonEvents.json:common-event:392, Map003.json events, Map018.json events
  AGH_temporarilySaveNpc = function () {
    Npc_TemporarilySave(0, 1); // 終了処理
  };

  // Replaces (1x): data/CommonEvents.json:common-event:101
  AGH_setViewpointActorName = function () {
    setVar(49, actorNameWithPartySuffix(11, "達"));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516
  AGH_setLeadActorPartyName = function () {
    setVar(21, actorNameWithPartySuffix(LEAD_ACTOR_VAR, "一行"));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:72, data/Map005.json:map-event:2:page:1
  AGH_closeGameWindow = function () {
    window.close();
  };

  /* ============================================================================
   * Self switches (bulk helpers)
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:11, data/CommonEvents.json:common-event:24
  AGH_setMapSelfSwitch = function (selfSwitchKey) {
    range(1, 500).forEach((mapId) => {
      range(1, 200).forEach((eventId) => selfSwitchOff(mapId, eventId, selfSwitchKey));
    });
  };

  // Replaces (2x): data/CommonEvents.json:common-event:314
  AGH_setMapSelfSwitch2 = function (selfSwitchKey) {
    mapSelfSwitchOn(selfSwitchKey, "A");
  };

  // Replaces (4x): data/CommonEvents.json:common-event:331, :511, data/Map094.json:map-event:45:page:1
  AGH_setMapSelfSwitch3 = function (eventId, selfSwitchKey) {
    mapSelfSwitchOn(eventId, selfSwitchKey);
  };

  // Replaces (5x): data/CommonEvents.json:common-event:390, :391, :393, :399, :530
  AGH_setMapSelfSwitch4 = function (firstEventId, secondEventId) {
    mapSelfSwitchOn(firstEventId, "C");
    mapSelfSwitchOn(secondEventId, "C");
  };

  // Replaces (3x): data/Map003.json:map-event:7:page:1, data/Map046.json:map-event:9:page:1, data/Map197.json:map-event:6:page:1
  AGH_setMapSelfSwitch5 = function (interp, firstItemId, secondItemId) {
    const hasEitherItem =
      $gameParty.hasItem($dataItems[firstItemId], true) || $gameParty.hasItem($dataItems[secondItemId], true);
    $gameSelfSwitches.setValue([$gameMap.mapId(), interp._eventId, "B"], !hasEitherItem);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:205, :292, :313
  AGH_setMapSelfSwitchMapFirsttAction = function (selfSwitchKey) {
    const mapId = $gameMap.mapId();
    for (let eventId = 1; eventId < 100; eventId++) {
      const mapEvent = $gameMap.event(eventId);
      if (!mapEvent) continue;
      if (mapEvent.event().meta["MapFirsttAction"]) {
        selfSwitchOff(mapId, eventId, selfSwitchKey);
        break;
      }
    }
  };

  // Replaces (26x): data/CommonEvents.json:common-event:241, :301, :336, :337, :338, :344, ...
  // The wide-spread alias of `AGH_setMapSelfSwitch3` — folded into that one definition.
  AGH_enableMapSelfSwitchForEvent = AGH_setMapSelfSwitch3;

  /* NOTE: despite the name, this one turns the switch OFF — kept as-is so the
  // Replaces (9x): data/CommonEvents.json:common-event:241, :292, :305, :310, :316, :336, ...
     data-file calls keep working. */
  AGH_enableMapSelfSwitchForEventAtKey = function (eventId, selfSwitchKey) {
    mapSelfSwitchOff(eventId, selfSwitchKey);
  };

  /* ============================================================================
   * Picture erasing (public helpers)
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:21, data/Map003.json:map-event:75:page:1
  AGH_eraseTwoPictures = function (firstPictureId, secondPictureId) {
    $gameScreen.erasePicture(firstPictureId);
    $gameScreen.erasePicture(secondPictureId);
  };

  // Replaces (14x): data/CommonEvents.json:common-event:21, :111, :112, :167, :173, :183, ...
  AGH_erasePictureRange = function (firstPictureId, lastPictureId) {
    erasePictureRangeBetween(firstPictureId, lastPictureId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:66, data/Map007.json:map-event:23:page:1
  AGH_erasePictureById = function (pictureId) {
    $gameScreen.erasePicture(pictureId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:47, data/CommonEvents.json:common-event:87
  AGH_erasePictureP = function (firstPictureId, lastPictureId, eraseStyleId) {
    range(firstPictureId, lastPictureId).forEach((pictureId) => pic_eraseP(eraseStyleId, [pictureId]));
  };

  // Replaces (2x): data/CommonEvents.json:common-event:94
  AGH_movePictureRowAndWait = function (interp, pictureId, duration, AGH_waitFrames) {
    const PICTURE_ROW_OFFSET = 60;
    movePic(pictureId + 1 + PICTURE_ROW_OFFSET, 1280 / 2, 768 / 2, 100, 100, 0, duration, 1);
    interp.wait(AGH_waitFrames);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:44, data/CommonEvents.json:common-event:45
  AGH_movePicture1 = function () {
    range(51, 60).forEach((pictureId) => pic_move1(pictureId, -100, 0, 100, 100, 0, 60));
  };

  /* ============================================================================
   * Ticker info fetching
   * ========================================================================== */

  // Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:309
  AGH_fetchInfoForItem = function (databaseEntryId, itemAmount) {
    fetchInfo(0, databaseEntryId, itemAmount);
  };

  // Replaces (16x): data/CommonEvents.json:common-event:306, :310, :314, :325, :330, :336, ...
  AGH_fetchInfoWithDatabaseType = function (databaseTypeId, databaseEntryId, itemAmount) {
    fetchInfo(databaseTypeId, databaseEntryId, itemAmount);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:309, data/CommonEvents.json:common-event:334
  AGH_fetchInfoWithLeadingEntry = function (
    databaseTypeId,
    databaseEntryId,
    secondDatabaseEntryId,
    itemAmount
  ) {
    fetchInfoWithLeadingEntry(databaseTypeId, databaseEntryId, 0, secondDatabaseEntryId, itemAmount);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:316, :319, :368, :495, :532, :548
  AGH_fetchInfoWithLeadingEntry2 = function (
    databaseEntryId,
    databaseTypeId,
    secondDatabaseEntryId,
    itemAmount
  ) {
    fetchInfoWithLeadingEntry(0, databaseEntryId, databaseTypeId, secondDatabaseEntryId, itemAmount);
  };

  /* ============================================================================
   * Variable-driven flags / switches
   * ========================================================================== */

  // Replaces (5x): data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:256
  AGH_flagIfAnySlotFilled = function (firstSlotIndex, lastSlotIndex, switchId) {
    const costumeSlotValues = varValue(360 + varValue(CURRENT_ACTOR_VAR));
    const maxSlotValue = range(firstSlotIndex, lastSlotIndex)
      .map((slotIndex) => costumeSlotValues[slotIndex])
      .filter((slotValue) => slotValue >= 1)
      .reduce((maxValue, slotValue) => Math.max(maxValue, slotValue), 0);
    if (maxSlotValue >= 1) AGH_enableSwitch(switchId);
  };

  // Replaces (2x): data/Map003.json:map-event:133:page:2
  AGH_applyWeaponSlotFlagsToSwitches = function (
    weaponSlotIndex,
    unlockedSwitchId,
    lockedSwitchId,
    secondWeaponSlotIndex,
    secondUnlockedSwitchId,
    secondLockedSwitchId
  ) {
    const isWeaponUnlocked = (slotIndex) => varValue(327)[slotIndex] >= 1;
    applyFlagToSwitch(unlockedSwitchId, isWeaponUnlocked(weaponSlotIndex));
    applyFlagToSwitch(lockedSwitchId, !isWeaponUnlocked(weaponSlotIndex));
    applyFlagToSwitch(secondUnlockedSwitchId, isWeaponUnlocked(secondWeaponSlotIndex));
    applyFlagToSwitch(secondLockedSwitchId, !isWeaponUnlocked(secondWeaponSlotIndex));
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_applyActorHHistory2 = function () {
    actor_Hhennreki2(varValue(19));
    // 選択肢番号は、実際の配列番号+1にしている。
    // もしピクチャ表示する場合は注意。
  };

  /* ============================================================================
   * Spawned-event positioning / animations
   * ========================================================================== */

  // Replaces (2x): data/CommonEvents.json:common-event:356
  AGH_placeTwoSpawnedEventsByCoordinates = function (interp, x, direction, x2, y, direction2) {
    const firstCharacter = interp.character(spawnedEventId(3));
    firstCharacter.locate(x, 14);
    firstCharacter.setDirection(direction);
    const secondCharacter = interp.character(spawnedEventId(4));
    secondCharacter.locate(x2, y);
    secondCharacter.setDirection(direction2);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:359
  AGH_placeTwoSpawnedEventsFromArgs = function (
    firstSlotIndex,
    x,
    y,
    direction,
    secondSlotIndex,
    x2,
    y2,
    direction2
  ) {
    placeSpawnedEvent(firstSlotIndex, x, y, direction);
    placeSpawnedEvent(secondSlotIndex, x2, y2, direction2);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:389, data/CommonEvents.json:common-event:509
  AGH_placeLeadActorEventAtInn = function () {
    const leadEvent = spawnedEvent(varValue(LEAD_ACTOR_VAR));
    leadEvent.locate(18, 10);
    leadEvent.setDirection(8);
    leadEvent._spriteOffsetY = -12;
  };

  // Replaces (2x): data/CommonEvents.json:common-event:451
  AGH_bindInterpreterToLeadActorEvent = function (interp) {
    interp._eventId = spawnedEventId(1); // 主格キャラ
  };

  // Replaces (5x): data/CommonEvents.json:common-event:495, :532, :548, :572, :573
  AGH_setLeadActorEventImage = function (characterIndex) {
    spawnedEvent(varValue(LEAD_ACTOR_VAR)).setImage("1_1", characterIndex);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
  AGH_placeInnPairEvents = function () {
    placeSpawnedEvent(11, 34, 20, 2);
    placeSpawnedEvent(varValue(LEAD_ACTOR_VAR), 34, 19, 2);
  };

  // Replaces (2x): data/Map100.json:map-event:11:page:1
  AGH_requestAnimationOnEvent = function (interp, animationId) {
    interp.character(varValue(19)).requestAnimation(animationId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:301, data/Map007.json:map-event:3:page:1
  AGH_bindInterpreterToEventId = function (interp, eventId) {
    interp._eventId = eventId;
  };

  // Replaces (2x): data/CommonEvents.json:common-event:552
  // Same as `AGH_bindInterpreterToEventId` above — folded into it.
  AGH_bindInterpreterToEventIdForSpawnedEvent = AGH_bindInterpreterToEventId;

  /* ============================================================================
   * Cut-in / GabText plugin commands
   * ========================================================================== */

  // Replaces (1x): data/CommonEvents.json:common-event:138
  AGH_runPluginCommandGabText = function (interp) {
    const gabActorName = $gameActors.actor(2).name();
    callPluginCommand(interp, "GabText", `${gabActorName}「ああ！　我らの力、見せてやろう！！」`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:138
  AGH_runPluginCommandGabText2 = function (interp) {
    const gabActorName = $gameActors.actor(1).name();
    const characterName2 = characterName(2);
    callPluginCommand(interp, "GabText", `${gabActorName}「はい、${characterName2}さん！」`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:138
  // Both battle cries use the current actor's line, optionally calling a partner by
  // name when the partner state is active.
  const PARTNER_CALL_STATE_ID = 234;

  function setActorBattleCry(interp, partnerActorId, defaultLine, partnerCallLineBuilder) {
    const speakerName = currentActor().name();
    const isPartnerCalled = $gameActors.actor(partnerActorId).isStateAffected(
      PARTNER_CALL_STATE_ID
    );
    const line = isPartnerCalled
      ? partnerCallLineBuilder(characterName(partnerActorId))
      : defaultLine;
    const message = speakerName + line;
    callPluginCommand(interp, "GabText", message);
  }

  AGH_setPartyLeaderGabText = function (interp) {
    setActorBattleCry(interp, 2, "「行きますよ、皆さん！」", function (partnerName) {
      return `「${partnerName}さん、行きましょう！」`;
    });
  };

  // Replaces (1x): data/CommonEvents.json:common-event:138
  AGH_setActor1BattleCry = function (interp) {
    setActorBattleCry(interp, 1, "「往くぞ！」", function (partnerName) {
      return `「往くぞ、${partnerName}！」`;
    });
  };

  /* ============================================================================
   * H-experience tables
   * ========================================================================== */

  // Replaces (6x): data/CommonEvents.json:common-event:370, :371, :372, :373, :383, :384
  AGH_showHExperienceTable1 = function (requestedPartnerWeaponId) {
    h_keikenhyouji1(521, requestedPartnerWeaponId); // 記録変数, 相手ID
  };

  // Replaces (11x): data/CommonEvents.json:common-event:294, :368, :370, :371, :372, :373, ...
  AGH_showHExperienceTable2 = function (requestedPartnerWeaponId) {
    h_keikenhyouji2(521, requestedPartnerWeaponId); // backGraund_menuMapSelectで消去
  };

  // Replaces (5x): data/CommonEvents.json:common-event:516, :517, :518, :519, :526
  AGH_showHExperienceTable1_2 = function (interp, scenePicName, episodeItemId, requestedPartnerWeaponId) {
    valueScenePic = scenePicName;
    setSelfVar(interp, LEAD_ACTOR_VAR, 1); // 主格キャラ
    setSelfVar(interp, NPC_PRESET_INDEX_VAR, episodeItemId); // 挿話回想の場合アイテムID。メインは0
    h_keikenhyouji1(521, requestedPartnerWeaponId); // 記録変数, 相手ID, 名前id21に名前と役職名
    valueWeatherSceneSet = 0;
  };
  /* ============================================================================
   * Child interpreters (dialogue / news tickers)
   * ========================================================================== */

  // Replaces (1x): data/CommonEvents.json:common-event:300
  AGH_announceCentralPlainsOnMap = function (interp) {
    setSelfVar(interp, CURRENT_ACTOR_VAR, 0);
    const centralPlainsName = colorTaggedText(16, $dataSystem.switches[252]);
    valueWordSet0 = `全体マップに${centralPlainsName}が追加されました`;
    valueWordSetEx = 0; // 補足が必要な場合
    AGH_runCommonEventAsChild(interp, 45);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:350
  AGH_announcePostGameDungeonUnlocked = function (interp) {
    setSelfVar(interp, CURRENT_ACTOR_VAR, 0);
    const forgottenSanctuaryName = $dataSystem.switches[259];
    valueWordSet0 = `${forgottenSanctuaryName}からクリア後ダンジョンに行けるようになりました`;
    valueWordSetEx = 0; // 補足が必要な場合
    AGH_runCommonEventAsChild(interp, 45);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:312
  AGH_announceCentralPlainsEnemiesChanged = function (interp, talkPictureId) {
    const centralPlainsName = switchName(252); // switch 252: 中央平原
    showOneLineTalk(interp, 19, [
      talkPictureId,
      28,
      `${centralPlainsName}の出現エネミーが変化しました。`,
      255
    ]);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:471
  AGH_showEventFaceTalk = function (interp, talkPictureId) {
    showOneLineTalk(interp, 21, [talkPictureId, 250, interp._eventId]);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:530
  AGH_showAttachmentTalkWithFrames = function (interp, talkPictureId) {
    // 1で付与 2で直接表示 \CE[60]のみ 0で解除, ｱｸﾀｰid, ﾌﾚｰﾑ60,40,20
    showOneLineTalk(interp, 16, [talkPictureId, 1, 60]);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:338, :368, :495, :532, :547, :548
  AGH_startForgetItemCommonEvent = function (interp, forgetItemId) {
    setSelfVar(interp, CURRENT_ACTOR_VAR, varValue(2));
    setSelfVar(interp, 19, forgetItemId);
    setSelfVar(interp, 14, 16); // 14ｱｲﾃﾑ称号 15ｽｷﾙ習得 16忘却, 変数19にID
    AGH_runCommonEventAsChild(interp, 44);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:234
  AGH_showQuestSetTalk = function (interp) {
    valueCountSet1 = Number($gameMap.event(interp._eventId).event().meta["QuestSet"]);
    showOneLineTalk(interp, 10, [24, questDialogueText(valueCountSet1), 1]);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:371, data/CommonEvents.json:common-event:372
  AGH_showQuestAcceptedTalk = function (interp, questItemId) {
    valueCountSet1 = questItemId;
    showOneLineTalk(interp, 10, [24, questDialogueText(valueCountSet1), 1]);
  };

  // Replaces (2x): data/Map003.json:map-event:166:page:2, data/Map003.json:map-event:243:page:2
  AGH_showQuestProgressTalkNoWait = function (interp) {
    showOneLineTalk(interp, 10, [24, questDialogueText(valueCountSet1), 0]);
  };

  // Replaces (3x): data/Map003.json:map-event:168:page:2, data/Map007.json:map-event:69:page:2, data/Map064.json:map-event:1:page:3
  AGH_showQuestProgressTalk = function (interp) {
    showOneLineTalk(interp, 10, [24, questDialogueText(valueCountSet1)]);
  };

  // Replaces (2x): data/Map003.json:map-event:166:page:2, data/Map003.json:map-event:243:page:2
  AGH_showTickerQuestAccepted = function () {
    const itemIndex = valueCountSet1;
    const itemName = colorTaggedText(3, itemIconName(itemIndex)); // the quest item (valueCountSet1)
    showTicker(`クエスト${itemName}を受注しました。`);
    $gameParty.gainItem($dataItems[itemIndex], 1);
  };
  /* ============================================================================
   * Actor announcement messages (reuses the shared helpers)
   * ========================================================================== */

  // Replaces (1x): data/CommonEvents.json:common-event:235
  AGH_setCurrentActorRankUpMessage = function () {
    const setString2 = setString(varValue(CURRENT_ACTOR_VAR));
    const ruby2 = ruby("昇格", "レアリティ・アップ");
    setVar(21, `${setString2}は、<${valueCountSet1}>に${ruby2}した！`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:254
  AGH_setActorResetConfirmMessage = function () {
    setVar(
      21,
      decorateWithActorName(
        "を初期化します。よろしいですか？\n（H履歴は影響ありませんが、\n各種開発度ランクはリセットされます。\nサブジョブのレベルは完全にはリセットされません）"
      )
    );
  };

  // Replaces (1x): data/CommonEvents.json:common-event:254
  AGH_setActorResetDoneMessage = function () {
    setVar(21, decorateWithActorName("のリセット処理が完了しました。"));
  };

  // Replaces (1x): data/CommonEvents.json:common-event:313
  AGH_setCurrentActorRankUpMessageWithIcon = function () {
    const setString2 = setString(varValue(CURRENT_ACTOR_VAR));
    const skillIcon405 = skillIconName(405);
    const ruby2 = ruby("昇格", "レアリティ・アップ");
    setVar(21, `${setString2}は、${skillIcon405}に${ruby2}した！`);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:259
  AGH_setJobUnlockRequirementMessage = function () {
    const className = $dataClasses[varValue(21)].name;
    setVar(801, decorateWithActorName(`は[${className}]のジョブ解放条件を満たしていません…。\n`));
  };

  // Replaces (1x): data/CommonEvents.json:common-event:361
  AGH_showSecondJobAwakening2 = function (interp) {
    setSecondJobAwakeningMessage(interp, 1, "　　");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:361
  AGH_showSecondJobAwakening3 = function (interp) {
    setSecondJobAwakeningMessage(interp, 2, "　　");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:361
  AGH_showSecondJobAwakening4 = function (interp) {
    setSecondJobAwakeningMessage(interp, 3, "　　");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:361
  AGH_showSecondJobAwakening5 = function (interp) {
    setSecondJobAwakeningMessage(interp, 4, "　　");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:471
  AGH_showSecondJobAwakening6 = function (interp) {
    setSecondJobAwakeningMessage(interp, 5, "　　　　　　");
  };

  // Replaces (1x): data/CommonEvents.json:common-event:301
  AGH_setSkyPirateNameLabels = function () {
    const weaponName74 = $dataWeapons[74].name;
    const displayText = braceRight();
    setVar(21, `空賊A ${displayText}${weaponName74}`);
    const displayText2 = braceRight();
    setVar(22, `空賊B ${displayText2}${weaponName74}`);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:301
  AGH_setBoyAndSkyPirateNameLabels = function () {
    const weaponName79 = $dataWeapons[79].name;
    const displayText = braceRight();
    setVar(21, `少年 ${displayText}${weaponName79}`);
    const weaponName74 = $dataWeapons[74].name;
    const displayText2 = braceRight();
    setVar(22, `空賊C ${displayText2}${weaponName74}`);
  };

  // Replaces (4x): data/Map054.json:map-event:2:page:1..4
  AGH_setupBoss = function (interp, bossSlotIndex, bossId) {
    setSelfVar(interp, 29, bossSlotIndex);
    boss_setup1(2, bossId);
  };

  // Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
  AGH_appendStateDescription = function () {
    const STATE_ID = 110;
    const stateData = $dataStates[STATE_ID];
    if (!stateData.meta["Help Description"]) return;
    stateData.description += "\nあああああ";
  };

  // Replaces (3x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:7:page:1
  AGH_grantJobPointsToDeployedActors = function (interp, levelGain) {
    forEachDeployedActor((actorId) => {
      callPluginCommand(interp, "gainJp", actorId, levelGain, $gameActors.actor(actorId)._classId);
    });
  };
  /* ============================================================================
   * NPC-preset based respawns
   *
   * `respawnLeadActorFromPreset()` / `respawnSideNpcFromPreset()` (defined with
   * the other respawn helpers) wrap the "read 163[535], place the lead actor,
   * place the side NPC" pattern that this family repeated a dozen times.
   * ========================================================================== */

  // Replaces (7x): data/CommonEvents.json:common-event:302, :304, :305, :309, :339, :382, ...
  AGH_respawnLeadActorAndNpcFromPreset = function (npcSlotIndex) {
    respawnLeadActorFromPreset(1);
    respawnSideNpcFromPreset(npcSlotIndex);
  };

  // Replaces (5x): data/CommonEvents.json:common-event:308, :317, :320, :327, :328
  AGH_respawnLeadActorFromPreset1 = function () {
    respawnLeadActorFromPreset(1);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:306, data/CommonEvents.json:common-event:336
  AGH_respawnLeadActorAndNpcPreset2 = function () {
    respawnActorFacing(varValue(LEAD_ACTOR_VAR), 7, 9, 1, 4);
    respawnSideNpcFromPreset(11, 6);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:325, data/CommonEvents.json:common-event:338
  AGH_respawnLeadActorAndNpcPreset3 = function (interp) {
    respawnLeadActorFromPreset(1);
    respawnSideNpcFromPreset(11);
    interp._eventId = spawnedEventId(11);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:389, :507, :508, :509
  AGH_respawnLeadActorAndNpcPreset4 = function (interp) {
    const leadActorId = varValue(LEAD_ACTOR_VAR);
    respawnActorFacing(leadActorId, 12, 10, 1, 4);
    interp._eventId = spawnedEventId(leadActorId);
    event_respawnSetN(11, 13, 10, 0, "npcUnique1", 0, 4);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:441, data/CommonEvents.json:common-event:552
  AGH_respawnLeadActorAndNpcPreset5 = function () {
    const npcPreset = currentNpcPreset();
    const leadEvent = respawnActor(varValue(LEAD_ACTOR_VAR), 15, 4, 0);
    leadEvent.setImage(npcPreset[1], npcPreset[2]);
    leadEvent.setDirection(6);
    respawnNpcFacing(11, 16, 4, 1, npcPreset[6], npcPreset[7], 2);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:442
  AGH_respawnLeadActorAndNpcPreset6 = function (interp, posX, posY, zoomFlag, posX2, posY2, zoomFlag2) {
    const leadActorId = varValue(LEAD_ACTOR_VAR);
    const npcPreset = currentNpcPreset();
    const leadEvent = respawnActor(leadActorId, posX, posY, zoomFlag);
    leadEvent.setImage(npcPreset[1], npcPreset[2]);
    leadEvent.setDirection(2);
    interp._eventId = spawnedEventId(leadActorId);
    respawnNpcFacing(11, posX2, posY2, zoomFlag2, npcPreset[6], npcPreset[7], 2);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:571, data/CommonEvents.json:common-event:572, data/CommonEvents.json:common-event:573
  AGH_respawnLeadActorAndNpcPreset7 = function (interp) {
    const leadActorId = varValue(LEAD_ACTOR_VAR);
    const npcPreset = currentNpcPreset();
    respawnActorFacing(leadActorId, 10, 11, 1, 4);
    interp._eventId = spawnedEventId(leadActorId);
    respawnNpcFacing(11, npcPreset[8], npcPreset[9], 0, npcPreset[6], npcPreset[7], 6);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:323, data/CommonEvents.json:common-event:332
  AGH_respawnLeadActorFromArgs = function (interp, posX, posY, direction) {
    const leadActorId = varValue(LEAD_ACTOR_VAR);
    respawnActorFacing(leadActorId, posX, posY, 1, direction);
    interp._eventId = spawnedEventId(leadActorId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:349, data/CommonEvents.json:common-event:542
  AGH_respawnLeadActorAndNpcFromNpcPreset = function (interp) {
    const leadActorId = varValue(LEAD_ACTOR_VAR);
    const npcPreset = currentNpcPreset();
    respawnActorFacing(leadActorId, npcPreset[3], npcPreset[4], 1, npcPreset[5]);
    interp._eventId = spawnedEventId(leadActorId);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:430, data/CommonEvents.json:common-event:432
  AGH_respawnLeadActorAndNpcFromNpcPreset2 = function (interp) {
    const leadActorId = varValue(LEAD_ACTOR_VAR);
    const npcPreset = currentNpcPreset();
    const leadEvent = respawnActor(leadActorId, 8, 7, 1);
    leadEvent.setImage(npcPreset[1], npcPreset[2]);
    leadEvent.setDirection(6);
    interp._eventId = spawnedEventId(leadActorId);
  };

  // Replaces (6x): data/CommonEvents.json:common-event:292, :304, :325, :327, :335, :339
  AGH_respawnLeadActorAndAlly = function () {
    respawnActorFacing(varValue(LEAD_ACTOR_VAR), 13, 5, 0, 2);
    respawnActorFacing(3, 14, 6, 0, 4);
  };

  // Replaces (7x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:327
  AGH_respawnActorAtSlotAndFace = function (slotIndex, posX, posY, direction) {
    respawnActor(slotIndex, posX, posY, 0).setDirection(direction);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:349
  AGH_respawnActorAtSlotAndBind = function (interp, slotIndex, posX, posY, zoomFlag) {
    respawnActor(slotIndex, posX, posY, zoomFlag);
    interp._eventId = spawnedEventId(slotIndex);
  };

  // Replaces (2x): data/CommonEvents.json:common-event:341, data/CommonEvents.json:common-event:342
  AGH_respawnActor5AndCastleNpc = function (interp) {
    respawnActorFacing(5, 13, 6, 1, 4);
    interp._eventId = spawnedEventId(5);
    event_respawnSetN(11, 18, 10, 0, "npcCastle1", 2, 4);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:441, data/CommonEvents.json:common-event:442, data/CommonEvents.json:common-event:552
  AGH_respawnLeadActorAndNpcFromArgs = function (
    posX,
    posY,
    direction,
    posX2,
    posY2,
    imageName,
    imageIndex,
    direction2
  ) {
    respawnActor(varValue(LEAD_ACTOR_VAR), posX, posY, 1).setDirection(direction);
    respawnNpc(11, posX2, posY2, 0, imageName, imageIndex).setDirection(direction2);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:370, data/CommonEvents.json:common-event:371, data/CommonEvents.json:common-event:383, data/CommonEvents.json:common-event:384
  // Marks the calling event as the lead-actor event (self variable 530 = 1) so
  // the respawn helpers can find it.
  AGH_markSelfAsLeadActorEvent = function (interp) {
    setSelfVar(interp, LEAD_ACTOR_VAR, 1);
  };
  /* ============================================================================
   * Last odds and ends
   * ========================================================================== */

  /* --- text BGV (文字BGV) lines -------------------------------------------- */

  // Replaces (1x): data/CommonEvents.json:common-event:306
  // Heavy breathing (layer preset 1, speed 120).
  AGH_startHeavyBreathingTextBGVoice = function () {
    const breathingLine = "「ハァ、ハァ…」";
    const pauseLine = "「ン………」";
    const gaspLine = "「ハァ…」";
    const exhaustedLine = "「ハァっ………」";
    startTextBGVoice([breathingLine, pauseLine, gaspLine, exhaustedLine], 1, 120);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:391
  // Moans (layer preset 0, speed 80).
  // Font-size controls use real RPG Maker escapes, not the legacy form-feed.
  AGH_startMoanTextBGVoice80 = function (displayFrames = 80, useFontSizeMarkers = true) {
    const voiceIcon = icon(12);
    const moanLine = `「アンっ${voiceIcon}」`;
    const secondLine = `「ヒゥンっ${voiceIcon}」`;
    const thirdLine = `「アッ${voiceIcon}　ンン${voiceIcon}」`;
    // Keep font controls outside the translatable sentence and restore the font size.
    const softMoan = useFontSizeMarkers ? fontSize(20) + "ン" + fontSize(28) : "ン";
    const fourthLine = `「ヒン${softMoan}っ${voiceIcon}」`;
    startTextBGVoice([moanLine, secondLine, thirdLine, fourthLine], 0, displayFrames);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:531
  // Moans, slower cadence (layer preset 0, speed 120).
  AGH_startMoanTextBGVoice120 = function () {
    return AGH_startMoanTextBGVoice80(120, false);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:338
  // Moan sequence (layer preset 1, speed 180).
  AGH_startMoanSequenceTextBGVoice = function () {
    const voiceIcon = icon(12);
    const moanLine = `「アッ${voiceIcon}」`;
    const secondLine = `「ンッ${voiceIcon}」`;
    const thirdLine = `「ンン…${voiceIcon}」`;
    const fourthLine = `「ンクっ…${voiceIcon}」`;
    const fifthLine = `「ァンっ…${voiceIcon}」`;
    startTextBGVoice([moanLine, secondLine, thirdLine, fourthLine, fifthLine], 1, 180);
  };

  // Replaces (1x): data/CommonEvents.json:common-event:518
  // Protest lines (layer preset 1, speed 180).
  AGH_startProtestTextBGVoice = function () {
    const moanLine = "「………ァっ」";
    const secondLine = "「いや…」";
    const thirdLine = "「ンン──……」";
    const fourthLine = "「ンクっ…」";
    const fifthLine = "「ァンっ…」";
    startTextBGVoice([moanLine, secondLine, thirdLine, fourthLine, fifthLine], 1, 180);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548
  // Picks the 文字BGV word set (3 = high, 2 = medium, 1 = low) and displays it
  // (layer preset 1, speed 60).
  AGH_selectHTextWordSet = function () {
    htext_word(3); // fills valueHtextWord
    startTextBGVoice([].concat(valueHtextWord), 1, 60);
  };

  // Replaces (3x): data/CommonEvents.json:common-event:393, data/CommonEvents.json:common-event:399, data/CommonEvents.json:common-event:547
  AGH_setCharacterVoiceTargetVariable = function (variableId) {
    // 文字HBGV: 呼び出し側が用意したセリフ群をそのまま流し込む
    setVar(318, varValue(variableId));
    setVar(706, [640 - 128, 386, 1, 80, 0, "eromangasimaji"]);
    AGH_enableSwitch(119);
  };

  // Replaces (5x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:310, data/CommonEvents.json:common-event:314, data/CommonEvents.json:common-event:316
  AGH_respawnLeadActorAndAllies = function () {
    respawnActorFacing(varValue(LEAD_ACTOR_VAR), 13, 5, 0, 2);
    respawnActorFacing(3, 14, 6, 0, 4);
    respawnActorFacing(4, 12, 6, 0, 6);
    respawnActorFacing(5, 13, 7, 0, 8);
  };

  // Replaces (4x): data/CommonEvents.json:common-event:307, :311, :317, :320
  AGH_lockMonsterSymbolRoute = function () {
    for (let eventId = 200; eventId > 0; eventId--) {
      const mapEvent = $gameMap.event(eventId);
      if (!mapEvent) continue;
      if (!mapEvent.event().meta["MonsterSymbol"]) continue;
      mapEvent.forceMoveRoute({
        list: [{ code: 15, parameters: [600] }, { code: 0 }],
        repeat: true,
        skippable: true
      });
    }
  };

  // Replaces (1x): data/Map100.json:map-event:11:page:1
  AGH_spendGoldForClass3JobMaterial = function () {
    spendGoldForJobMaterial(100000, "クラス3ジョブ解放素材");
  };

  // Replaces (1x): data/Map100.json:map-event:11:page:1
  AGH_spendGoldForClass2JobMaterial = function () {
    spendGoldForJobMaterial(10000, "クラス2ジョブ解放素材");
  };

  // Replaces (8x): data/CommonEvents.json:common-event:47, data/CommonEvents.json:common-event:166, data/CommonEvents.json:common-event:173, data/CommonEvents.json:common-event:174, data/CommonEvents.json:common-event:176, data/CommonEvents.json:common-event:183, …
  // Turns the visual-novel choice window off during a cutscene.
  AGH_disableVisualNovelChoices = function () {
    setVisualNovelChoices(false);
  };

  // Replaces (10x): data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:173, data/CommonEvents.json:common-event:183, data/CommonEvents.json:common-event:192, data/CommonEvents.json:common-event:203, data/CommonEvents.json:common-event:237, …
  // Turns the visual-novel choice window back on.
  AGH_enableVisualNovelChoices = function () {
    setVisualNovelChoices(true);
  };

  // Replaces (1x): CommonEvents.json:common-event:1|共通設定
  appendToVariable250 = function () {
    const aaa = $gameVariables.value(250);
    aaa.push("[11]");
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_configureSystem = function () {
    $dataSystem.optSideView = true;
    $dataSystem.optSideView = false;
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_spawnEvent = function () {
    const playerRealX = $gamePlayer._realX;
    const playerRealY = $gamePlayer._realY + 10;
    $gameMap.spawnEvent(146, playerRealX, playerRealY, true);
    valueCountSet1 = $gameMap.getLastSpawnEventId();
    const event = $gameMap.event(valueCountSet1);
    event.startOpacity(60, 255);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_spawnMapEventActorChoice = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    const playerRealX = $gamePlayer._realX;
    const playerRealY = $gamePlayer._realY;
    $gameMap.spawnEvent(147, playerRealX, playerRealY, true);
    valueCountSet2 = $gameMap.getLastSpawnEventId();
    const event = $gameMap.event(valueCountSet2);
    event.startOpacity(100, 255);
    event.setImage(actor.characterName(), actor.characterIndex());
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_particleGroupSetShrineC = function (interp) {
    const shrineC = "shrine_c";
    $gameScreen._particle.particleGroupSet(interp._eventId, shrineC, "this");
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_particlePlayMonsterCp = function (interp) {
    const monsterCp = "monster_cp";
    $gameScreen._particle.particlePlay(interp._eventId, monsterCp, "this", "def", "above");
    $gameScreen._particle.particleUpdate([monsterCp, "color", "#44ddff", "ffffff"]);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_particleClearShrineC = function (interp) {
    let particleName;
    particleName = "shrine_c";
    $gameScreen._particle.particleClear(particleName);
    particleName = "chant_b3";
    $gameScreen._particle.particleGroupPlay(interp._eventId, particleName, "this");
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_particlePlayAureoleC = function (interp) {
    const aureoleC = "aureole_c";
    $gameScreen._particle.particlePlay(interp._eventId, aureoleC, "this", "def", "above");
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_setMapEventOpacityVariousUseCommands = function () {
    let event;
    event = $gameMap.event(valueCountSet1);
    event.startOpacity(60, 0);
    event = $gameMap.event(valueCountSet2);
    event.startOpacity(60, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_setSelfVariableActorChoice = function (interp) {
    $gameVariables.setValue(20, 1);
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    actor.setSubclass(42);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_startGabWindowNone = function () {
    const scene = SceneManager._scene;
    if (scene._gabWindow) scene.clearGabWindow();
    const gabData = ["あああ", "none", "", 0, "", 0];
    if (scene._gabWindow) scene.startGabWindow(gabData);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_forceMoveRouteCharactersScriptCommonVariable1 = function (interp) {
    interp.character($gameVariables.value(121)).forceMoveRoute({
      list: [
        { code: 36 },
        { code: 37 },
        { code: 29, parameters: [$gameVariables.value(122)] },
        { code: 29, parameters: [$gameVariables.value(123)] },
        { code: 45, parameters: ["this.requestAnimation($gameVariables.value(124));"] },
        {
          code: 45,
          parameters: [
            "this.jumpEx($gameVariables.value(125),$gameVariables.value(126),$gameVariables.value(127),$gameVariables.value(128));"
          ]
        },
        { code: 25 },
        { code: 32 },
        { code: 34 },
        { code: 35 },
        { code: 45, parameters: ["this.setAngle($gameVariables.value(129));"] },
        { code: 0 }
      ],
      repeat: false,
      skippable: true
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_transformVariableDataIconIndex12 = function () {
    $gameVariables._data
      .map(function (v, i) {
        return [v, i];
      })
      .slice(1, 5)
      .filter(function (v) {
        return v[0] !== undefined;
      })
      .sort(function (a, b) {
        return b[0] - a[0];
      });
    //変数1~4の順番を変数17に代入した場合
    //1位は $gameVariables.value(17)[0][1]
    //2位は $gameVariables.value(17)[1][1]
    //3位は $gameVariables.value(17)[2][1]
    //4位は $gameVariables.value(17)[3][1]
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_iterateEnemiesVariousUseCommands = function () {
    const enemyData = $dataEnemies[Number(value2.split(",")[0])];
    $dataEnemies[i + 10] = Object.assign({}, enemyData);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_setSelfVariableActorChoiceVariousUseCommands = function (interp) {
    const array =
      $dataActors[$gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID)].meta["戦闘3連撃時"].split(",");
    $gameVariables.setValue(522, array[getRandomIndex(array.length)]);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_setSelfVariableActorChoice_2 = function (interp) {
    const battler = BattleManager._subject;
    const action = battler._actions[0];
    //action.isForOpponent() // 対象が敵の時true、仲間や自分など味方の時ははfalse
    //action._targetIndex // 対象のインデックス。敵味方ともに0から始まる。-1の時はランダムターゲット
    //action._item // 行動の種類。Game_Item クラスのオブジェクト。
    $gameVariables.setValue(20, $gameParty.members()[action._targetIndex]);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_iterateSkillsVariousUseCommands = function () {
    //action is only referenced by the commented debug block below
    //const action = BattleManager._action;
    //if(action.isSkill()){
    //var value1 = $dataSkills[action._item._itemId].stypeId;
    //if(value == 1){
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_setSelfVariableActorChoice_3 = function (interp) {
    const value = BattleManager._subject._lastTargetIndex;
    $gameVariables.setValue(20, $gameParty.members()[value].actorId());
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_configureMapVariousUseCommands = function () {
    $dataMap.battleback1Name;
    $dataMap.displayName;
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_traceDebugOutput = function () {
    //console.log(array[getRandomIndex(array.length)]);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_iterateItemsShowInfo = function (interp) {
    value = $dataItems[$gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1)].name;
    value1 = `${value}を入手した。`;
    const args = new Array(String(value1));
    interp.pluginCommand("ShowInfo", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_configureMapBGM = function () {
    const array = $dataMap.meta["BGM"].split(",");
    AudioManager.playBgm({ name: array[array.length - 4], volume: array[1], pitch: array[2], pan: array[3] });
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_forEachArray = function (interp) {
    value = 460;
    const list = [61, 67, 70, 81, 82, 83, 84, 85, 86, 88];
    list.forEach(function (id) {
      this.sVal(value + id, 0);
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_iterateMapEventsTest = function () {
    const eventName = "test";
    const variableId = 1;
    const regionId = 3;
    const mapEventList = $gameMap.events().filter(function (event) {
      return event.event().name === eventName && event.regionId() === regionId;
    }).length;
    $gameVariables.setValue(variableId, mapEventList);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_setVariableVariousUseCommands = function () {
    const start = 701;
    const end = 800;
    for (let i = start; i <= end; i++) {
      $gameVariables.setValue($gameVariables.value(i), $dataSkills[i - 600].description);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_setVariableActorChoice = function () {
    const array = [1, 2, 3, 4, 5, 6];
    $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID, array[2]);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_setSelfVariableRandomWork1 = function (interp) {
    $gameVariables.setValue(21, $gameParty._actors);
    const array = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID, array[getRandomIndex(array.length)]);
  };

  // Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
  AGH_iteratePartyActors = function () {
    $gameParty._actors = [];
    $gamePlayer.refresh();
    $gameMap.requestRefresh();

    $gameParty._actors = $gameParty._lastActors;
    $gamePlayer.refresh();
    $gameMap.requestRefresh();
  };

  // Replaces (1x): CommonEvents.json:common-event:4|条件分岐
  AGH_iterateItemsWarpPoint = function () {
    const itemMeta =
      $dataItems[$gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID)].meta[
        "warpPoint" + $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1)
      ].split(",");
    const array = [Number(itemMeta[0]), Number(itemMeta[1]), Number(itemMeta[2])];
    if (array[0] == arr3[0] && array[1] == arr3[1] && array[2] == arr3[2]) {
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:4|条件分岐
  AGH_iterateSkillsConditionBranch = function (interp) {
    let isClassUnlocked;
    isClassUnlocked = 0;
    for (let i = 0; i < interp._actor.unlockedClasses().length; ++i) {
      if (!(interp._actor.unlockedClasses()[i] == Number($dataSkills[skill.id].meta.SkillLearningClass)))
        continue;

      isClassUnlocked = 1;
      break;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:4|条件分岐
  AGH_iterateTroopMembers = function () {
    const members2 = $gameTroop.members();
    for (let i = 0; i < members2.length; i++) {
      const troopMember = members2[i];
      if (troopMember.isStateAffected(234)) {
        troopMember.startAnimation(160, false, 0);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:4|条件分岐
  AGH_iteratePartyMembers = function () {
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length; i++) {
      const battleMember = battleMembers2[i];
      if (battleMember.isStateAffected(234)) {
        battleMember.startAnimation(160, false, 0);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:4|条件分岐
  AGH_setSelfVariableActorChoiceConditionBranch = function (interp) {
    $gameVariables.setValue(20, 1);
    //actor/list are only referenced by the commented debug block below
    //const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    //const list = actor.actor().traits;
    //list.forEach(function (id) {
    //console.log(id);
    //}, this);
  };

  // Replaces (1x): CommonEvents.json:common-event:4|条件分岐
  AGH_iterateSkillsConditionBranch_2 = function (interp) {
    if (target.result().isHit() && interp.isPhysical() && interp.item().stypeId !== 1) {
      target.startAnimation(61);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:4|条件分岐
  AGH_runScriptConditionBranch = function () {
    //start/end are only referenced by the commented debug loop below
    //const start = 1;
    //const end = $dataSkills.length - 1;
    //for (var i = start; i <= end; i++) {
    //-1をしないとスキル上限+1まで範囲にしてしまいエラーが出る為
  };

  // Replaces (1x): CommonEvents.json:common-event:4|条件分岐
  AGH_iterateItemsEIC = function () {
    value = $dataItems[$gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID)];
    if ($gameParty.hasItem(value)) {
      $gameParty.gainItem(value, 1);
    }
    value3 = Number($dataItems[i].meta["EICスイッチ"]);
    //if($gameParty.hasItem($dataItems[value7])){
  };

  // Replaces (1x): CommonEvents.json:common-event:4|条件分岐
  AGH_setSelfSwitchConditionBranch = function (interp) {
    for (let id = $gameMap.events().length; id > 0; id--) {
      if (!$gameMap.event(id).event().note.match("[HOGE]")) continue;

      const mapID = interp._mapId;
      $gameSelfSwitches.setValue([mapID, id, "B"], true);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_concatArrayFrequentlyUsed = function () {
    array = array.concat(arr2);
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_setSwitchFrequentlyUsed = function () {
    const switchId = 502;
    if (!($gameSwitches.value(switchId + 600 - 1) && !$gameSwitches.value(switchId + 600))) return;

    $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, true);
    valueCountSet1 = switchId;
  };

  // Spawns the goods event in the tile the player faces and remembers its id in the
  // dynamic event list, which is what the caller then binds to its interpreter.
  function respawnGoodsAheadOfPlayer() {
    let playerRealX = $gamePlayer._realX;
    let playerRealY = $gamePlayer._realY;
    switch ($gamePlayer.direction()) {
      case 2:
        playerRealY += 1;
        break;
      case 4:
        playerRealX -= 1;
        break;
      case 6:
        playerRealX += 1;
        break;
      case 8:
        playerRealY -= 1;
        break;
    }
    goodsEvent_respawn(0, "Goods4", 6, 6, 2, playerRealX, playerRealY);
  }

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_readVariableDynamicEventId = function (interp) {
    respawnGoodsAheadOfPlayer();
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[0];
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_eraseMapEventDynamicEventId = function (interp) {
    const particleId = "statue_orb_c" + "-" + interp._eventId;
    $gameScreen._particle.particleClear(particleId);
    if (!!$gameMap.event(interp._eventId)) {
      $gameMap.eraseEvent(interp._eventId);
    }
    $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[0] = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_mapArrayFrequentlyUsed = function () {
    //var array = [...Array(100)].map((_, i) => i + 101);
    //console.log(`${arr1}`);
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_iterateStatesAddText = function () {
    const userName = user.name();
    const stateName = $dataStates[stateId].name;
    const coloredText = colorTaggedText(10, `${value1}`);
    const messageText = `${userName}の${stateName}が解除！ 蓄積ダメージ${coloredText}を受けた…`;
    BattleManager._logWindow.push("addText", messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_findIndexArray = function () {
    const randomIndex = array2[getRandomIndex(array2.length)]; //ID
    const index = array2.findIndex((array2) => array2 == randomIndex);
    if (index >= 0) {
      array2.splice(index, 1);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_setScreenDTextPicture = function () {
    // pictureId stays undefined for the text picture setup, exactly like the original.
    let pictureId;
    $gameScreen.clearZoom();
    $gameScreen.setDTextPicture(pictureId, 28);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.dTextRealTime = "ON";
    $gameScreen.dTextAlign = 1; // 中央
    pictureId = 100;
    const pictureName = "";
    showScenePicture(pictureId, pictureName);
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_runScriptFrequentlyUsed = function (interp) {
    interp._eventId;
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_setSelfVariableActorChoiceFrequentlyUsed = function (interp) {
    $gameVariables.setValue(20, 1);
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    if (actor.meetsSkillConditions($dataSkills[201])) {
      $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, 10);
    } else {
      $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, 20);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_filterArrayFrequentlyUsed = function () {
    //arr3から重複を削除してarr4に渡す
    arr4 = arr3.filter(function (val, i, array) {
      return array.indexOf(val) === i;
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_computeMaxFrequentlyUsed = function () {
    //dead verbatim extraction: the computed max was never used by callers
    //const array = [1, 3, 5, 8];
    //const maxValue = Math.max(...array);
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_setSelfVariableRandomWork1FrequentlyUsed = function (interp) {
    const array = [1, 2, 3, 4];
    const candidateValues = [5, 6, 7, 8];
    array.push(candidateValues);
    $gameVariables.setValue(21, array);
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_readVariableFrequentlyUsed = function () {
    const nameLength = actor.name().length;
    let threshold = 6 - nameLength;
    if (threshold <= -1) {
      threshold = 0;
    }
    for (let j = 0; j <= threshold; j++) {
      $gameVariables.value(id1)[i] += "　";
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_iterateItemsValueDanjonTreasure = function () {
    const itemIndex = i; // warn: i - is global using of general named variable, very danger, need to refactor to use input/output params fo functions
    const item = $dataItems[itemIndex];
    if (!item) {
      console.error(`AGH_iterateItemsValueDanjonTreasure: item is ${item}!`);
      return;
    }

    const DungeonChestList = item.meta["宝箱"].split(",");
    const DungeonChestTypeList = item.meta["宝箱種類"].split(",");
    window["valueDanjonTreasure" + itemIndex] = DungeonChestList;
    window["valueDanjonTrSyurui" + itemIndex] = DungeonChestTypeList;
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_runPluginCommandItemBattleUseLimit = function (interp) {
    const args = new Array(String($gameVariables.value(189)), "1", "横", String($gameVariables.value(680)));
    interp.pluginCommand("PA_INIT", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_setVariableFrequentlyUsed = function () {
    const DesireItemCheckList = $dataItems[id3].meta["性欲アイテム判定"].split(",");
    $gameVariables.setValue(Number(DesireItemCheckList[0]), Number(DesireItemCheckList[1]));
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_gainItemFrequentlyUsed = function () {
    let items = $gameTroop.makeDropItems(); //戦闘不能敵キャラのドロップ品
    items = $gameTroop.aliveMembers().reduce(function (r, enemy) {
      //生存中の敵キャラドロップの追加
      return r.concat(enemy.makeDropItems());
    }, items);
    items.forEach(function (item) {
      $gameParty.gainItem(item, 1);
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_runScriptFrequentlyUsed_2 = function () {
    //dead verbatim extraction: randomIndex was never written anywhere
    //const array = [10, 30, 40, 50];
    //const randomIndex = array[getRandomIndex(array.length)];
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_setSelfVariableRandomWork1_2 = function (interp) {
    const array = [1, 2, 3, 4, 5];
    array.push(6, 7, 8, 9, 10);
    const randomIndex = array[getRandomIndex(array.length)];
    $gameVariables.setValue(21, randomIndex);
  };

  // Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
  AGH_iterateItemsLV = function () {
    const dungeonInfoItemId = $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID);
    const dungeonItem = $dataItems[dungeonInfoItemId];
    if (!dungeonItem || !dungeonItem.meta) return 0;
    const levelTag = dungeonItem.meta["エネミーLV"];
    if (typeof levelTag !== "string") return 0;
    const enemyLevels = levelTag.split(",").map(Number).filter(Number.isFinite);
    return enemyLevels.length ? Math.max.apply(null, enemyLevels) : 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:6|アップデート時に実行コモン
  AGH_setSelfVariableUpdateCommon = function (interp) {
    //クエスト用配列
    $gameVariables.setValue(326, Array(2001).fill(0)); //クエスト達成用アイテムごと表示用配列
    $gameVariables.setValue(344, Array(151).fill(0)); //達成条件の内容のみ
    for (let i = 357; i <= 360; i++) {
      $gameVariables.setValue(i, Array(151).fill(0));
    }
    //357クエスト解説アイテム用358クエスト解説359クエスト発生360クエスト達成
    //1～100が通常クエスト、101～140がデイリークエスト
  };

  // Replaces (1x): CommonEvents.json:common-event:8|ピクチャ並列3
  AGH_shakePicture = function () {
    valueShakeArr2 = valueShakeArr1;
    const shakeArray = [
      valueShakeArr2[1],
      valueShakeArr2[1] + 0.1,
      valueShakeArr2[1] + 0.2,
      valueShakeArr2[1] + 0.3,
      valueShakeArr2[1] + 0.4,
      valueShakeArr2[1] + 0.5
    ];
    valueShakeArr2[1] = shakeArray[getRandomIndex(shakeArray.length)];
    $gameScreen.shakePicture(valuePic1, valueShakeArr2[1], valueShakeArr2[2], valueShakeArr2[3], Infinity);
  };

  // Replaces (1x): CommonEvents.json:common-event:8|ピクチャ並列3
  AGH_waitPictureParallel3 = function (interp) {
    valueShakeArr2 = valueShakeArr1;
    if (!(valueShakeArr2[4] >= 1)) return;

    const randomIndex = getRandomIndex(11) - 6;
    interp.wait(valueShakeArr2[4] + randomIndex);
  };

  // Replaces (1x): CommonEvents.json:common-event:9|スタート＆リセット兼用
  AGH_readVariableCharacterId = function (interp) {
    synchronizeCharacterSurnames();
  };

  // Replaces (1x): CommonEvents.json:common-event:9|スタート＆リセット兼用
  AGH_setVariableDungeonWarpCircle = function () {
    $gameVariables.setValue(HELPER_VARIABLE.DUNGEON_WARP_POINTS, Array(101).fill(0));
    const dungeonWarpPoints = $gameVariables.value(HELPER_VARIABLE.DUNGEON_WARP_POINTS);
    for (let i = 0; i <= 100; i++) {
      dungeonWarpPoints[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:9|スタート＆リセット兼用
  AGH_iterateItemsSG = function () {
    const treasureLists = $gameVariables.value(HELPER_VARIABLE.DUNGEON_TREASURE_LISTS);
    const treasureTypes = $gameVariables.value(HELPER_VARIABLE.DUNGEON_TREASURE_TYPES);
    for (let itemId = 1; itemId <= $dataItems.length - 1; itemId++) {
      const itemMeta = $dataItems[itemId].meta;
      // Only "SG種別" 2 entries carry a treasure chest table.
      if (Number(itemMeta["SG種別"]) != 2) continue;
      const treasureColumns = itemMeta["Tchest"];
      treasureLists[itemId] = treasureColumns ? treasureColumns.split(",") : [];
      treasureTypes[itemId] = treasureColumns ? itemMeta["TchestType"].split(",") : [];
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:10|初期解説コモン1
  AGH_resetValueStartCommentary1 = function () {
    valueStartCommentary1 = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:10|初期解説コモン1
  AGH_handleScriptSnippetDescriptionSubClass = function () {
    let messageText = "サブジョブ毎のスタータス上昇率一覧\n";
    for (let i = 51; i <= 60; i++) {
      messageText += `${valueClassGrowStatasComparison[i]}\n`;
    }
    start_commentary(
      0,
      "サブジョブについて",
      "Description_SubClass",
      `キャラ事に存在する＜メインジョブ＞とは別に設定できるジョブ。
		拠点に設置されている「オーブ」を利用する事で新たなサブジョブを解放できる。
		解放にはコストが掛かる。`,
      "Dpic",
      messageText,
      "Npic",
      "Nda"
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:10|初期解説コモン1
  AGH_iterateStatesMenuSubComand = function (interp) {
    let messageText = "";
    const list = $gameVariables.value(HELPER_VARIABLE.RESTRICTED_MENU_STATE_IDS);
    list.forEach(function (id) {
      const stateData = $dataStates[id];
      messageText += `\x1bI[${stateData.iconIndex}]${stateData.name} `;
    }, interp);
    start_commentary(
      0,
      "一部制限について",
      "MenuSubComand",
      `メニュー画面から開ける「クエストリスト」「ダンジョン情報」は、
		特定ステートが付与されている場合、開けなくなります。
		[${messageText}]`,
      "Npic",
      "Nda",
      "Npic",
      "Nda"
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:11|リセット時コモン
  AGH_readVariableAppearanceCharacterStart = function () {
    forEachDeployedActor(forgetProfessionReturnSkill);
  };

  // Replaces (1x): CommonEvents.json:common-event:11|リセット時コモン
  AGH_readVariableActorChoice = function () {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    for (let i = 101; i <= 200; i++) {
      $gameVariables.value(360 + selectedActorId)[i] = 0;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:11|リセット時コモン
  AGH_removeState = function (interp) {
    const list = $gameVariables.value(HELPER_VARIABLE.RESTRICTED_MENU_STATE_IDS);
    list.forEach(function (id) {
      const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
      actor.removeStateCounter(id);
      actor.removeState(id);
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:11|リセット時コモン
  AGH_resetSelfSwitchVariablesResetCommon = function () {
    for (let i = 1; i <= 200; i++) {
      $gameSelfSwitches.setVariableValue([i, 2, 1], 0);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:12|ゲームスタート時コモン
  AGH_readVariableAppearanceCharacterStartGameStartCommon = function () {
    const start = $gameVariables.value(HELPER_VARIABLE.FIRST_DEPLOYED_ACTOR_ID);
    const end = $gameVariables.value(HELPER_VARIABLE.LAST_DEPLOYED_ACTOR_ID);
    for (let i = start; i <= end; i++) {
      actor_StartSetUp(i);
      production_separateSetProfile(i);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:12|ゲームスタート時コモン
  AGH_readVariableHeroineId = function (interp) {
    const list = $gameVariables.value(HELPER_VARIABLE.HEROINE_ACTOR_IDS);
    list.forEach(function (id) {
      hstates_heights(id, 253);
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:14|ピクチャ並列2
  AGH_waitPictureParallel2 = function (interp) {
    if (!(valuePicWait2 >= 1)) return;

    const randomIndex = getRandomIndex(11) - 6;
    interp.wait(valuePicWait2 + randomIndex);
  };

  // Replaces (1x): CommonEvents.json:common-event:14|ピクチャ並列2
  AGH_waitPictureParallel2_2 = function (interp) {
    if (!(valuePicWait2 >= 1)) return;

    const randomIndex = getRandomIndex(valuePicWait2);
    interp.wait(valuePicWait2 - randomIndex);
  };

  // Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
  AGH_setPictureFromArrayPictureParallel1 = function () {
    const pictureSetArray = pic_setArray1;
    pic_setArray(
      pictureSetArray[0],
      pictureSetArray[1],
      pictureSetArray[2],
      pictureSetArray[3],
      pictureSetArray[4],
      pictureSetArray[5]
    );
    if (valueParallelPic1 >= 1) {
      pic_setArrayParallel1(valueParallelPic1);
    }
    if (valueParallelPic2 >= 1) {
      pic_setArrayParallel1(valueParallelPic2);
    }
    if (valueParallelPic3 >= 1) {
      pic_setArrayParallel1(valueParallelPic3);
    }
    if (valueParallelPic4 >= 1) {
      pic_setArrayParallel1(valueParallelPic4);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
  AGH_setPictureFromArrayPictureParallel1_2 = function () {
    const pictureSetArray = pic_setArray2;
    if (!(pictureSetArray[1] >= 1)) return;

    pic_setArray(
      pictureSetArray[0],
      pictureSetArray[1],
      pictureSetArray[2],
      pictureSetArray[3],
      pictureSetArray[4],
      pictureSetArray[5]
    );
    if (valueParallelPic1 >= 1) {
      pic_setArrayParallel1(valueParallelPic1);
    }
    if (valueParallelPic2 >= 1) {
      pic_setArrayParallel1(valueParallelPic2);
    }
    if (valueParallelPic3 >= 1) {
      pic_setArrayParallel1(valueParallelPic3);
    }
    if (valueParallelPic4 >= 1) {
      pic_setArrayParallel1(valueParallelPic4);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
  AGH_playSeName = function () {
    const parallelPictureSet = valueParallelPicSe2;
    if (!(parallelPictureSet[0] != 0)) return;

    const randomIndex = getRandomIndex(11) + Number(parallelPictureSet[1]);
    const randomOffset = getRandomIndex(21) + Number(parallelPictureSet[2]);
    AudioManager.playSe({ name: parallelPictureSet[0], volume: randomIndex, pitch: randomOffset, pan: 0 });
  };

  // Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
  AGH_waitPictureParallel1 = function (interp) {
    const pictureSetArray = pic_setArray2;
    if (!(pictureSetArray[1] >= 1)) return;

    if (valuePicWait >= 1) {
      //var value1 = getRandomIndex(10) + 1;
      interp.wait(valuePicWait);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
  // Picture 53 is shown twice (53 + 2) while the camera shakes, so the shake
  // helpers nudge id 55 only. Kept as one constant so both variants stay in sync.
  const SHAKE_PICTURE_ID = 53;
  const SHAKE_PICTURE_BASE_X = 640 - 128;
  const SHAKE_PICTURE_SETTLE_FRAMES = 120;

  // Vertical shake: the picture jumps up/down by verticalOffset pixels and returns.
  function nudgeShakePictureVertically(interp, verticalOffset) {
    const shakePictureId = SHAKE_PICTURE_ID + 2;
    const targetY = 384 + verticalOffset;
    $gameScreen.movePicture(
      shakePictureId,
      1,
      SHAKE_PICTURE_BASE_X,
      targetY,
      100,
      100,
      240,
      0,
      SHAKE_PICTURE_SETTLE_FRAMES
    );
    interp.wait(110);
  }

  // Horizontal shake with a random distance and a random, longer duration.
  function nudgeShakePictureHorizontally(interp, horizontalDirection) {
    const durationFrames = getRandomIndex(41) + 160;
    const offsetPixels = getRandomIndex(21) + 40;
    const shakePictureId = SHAKE_PICTURE_ID + 2;
    const targetX = SHAKE_PICTURE_BASE_X + horizontalDirection * offsetPixels;
    $gameScreen.movePicture(
      shakePictureId,
      1,
      targetX,
      384,
      100,
      100,
      240,
      0,
      durationFrames
    );
    interp.wait(durationFrames - 10);
  }

  AGH_movePicturePictureParallel1 = function (interp) {
    nudgeShakePictureVertically(interp, 20);
  };

  // Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
  AGH_movePicturePictureParallel1_2 = function (interp) {
    nudgeShakePictureVertically(interp, -20);
  };

  // Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
  AGH_movePicturePictureParallel1_3 = function (interp) {
    nudgeShakePictureHorizontally(interp, 1);
  };

  // Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
  AGH_movePicturePictureParallel1_4 = function (interp) {
    nudgeShakePictureHorizontally(interp, -1);
  };

  // Replaces (1x): CommonEvents.json:common-event:18|イベントシーン開始
  AGH_initValueTachieBless = function () {
    valueTachieBless = [100, 100, 250, 0.004, 0.003]; //立ち絵用息遣い設定。基本状態
  };

  // Replaces (1x): CommonEvents.json:common-event:18|イベントシーン開始
  AGH_readVariableHeroineIdEventSceneStart = function (interp) {
    //現在衣装を別変数配列に一時代入
    //統合衣装用の0も含める。（代入変数を利用しなくていい為可能）
    const list = $gameVariables.value(HELPER_VARIABLE.HEROINE_ACTOR_IDS);
    list.forEach(function (id) {
      //actor is only referenced by the commented debug block below
      //const actor = $gameActors.actor(id);
      //if($gameParty.members().contains(actor)){
      const start = 0;
      const end = 42;
      for (let i = start; i <= end; i++) {
        $gameVariables.value(id + 540)[i] = $gameVariables.value(id + 440)[i];
      }
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:21|初期解説コモン2
  AGH_erasePictureItemProcessWork = function () {
    const pictureId = 150 + valueStartCommentary1 + $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    $gameScreen.erasePicture(pictureId);
  };

  // Replaces (1x): CommonEvents.json:common-event:21|初期解説コモン2
  // Shows the commentary picture of the processed entry. A "Dpic" marker means the
  // entry carries text instead of an image, so the window text picture is used.
  // pictureId is 201 for the first commentary slot and 202 for the follow-up one.
  const COMMENTARY_PICTURE_TEXT_Y = 100;
  const COMMENTARY_PICTURE_TEXT_X = 134;
  const COMMENTARY_PICTURE_IMAGE_X = 334;
  const COMMENTARY_PICTURE_FADE_FRAMES = 30;
  const COMMENTARY_PICTURE_SLOT_1 = 201;
  const COMMENTARY_PICTURE_SLOT_2 = 202;

  function showCommentaryPicture(pictureId, commentaryArray, pictureMarkerArray) {
    const processedEntryId = $gameVariables.value(
      HELPER_VARIABLE.PROCESSED_ENTRY_ID
    );
    const pictureMarker = pictureMarkerArray[processedEntryId];
    if (pictureMarker == 0) return;

    let pictureName, pictureX, pictureY;
    if (pictureMarker == "Dpic") {
      pictureName = "";
      pictureY = COMMENTARY_PICTURE_TEXT_Y;
      pictureX = COMMENTARY_PICTURE_TEXT_X;
      $gameScreen.setDTextPicture(commentaryArray[processedEntryId], 28);
      $gameScreen.dWindowFrame = "ON";
    } else {
      pictureName = "/img/tips/" + pictureMarker;
      pictureY = 0;
      pictureX = COMMENTARY_PICTURE_IMAGE_X;
    }
    $gameScreen.showPicture(pictureId, pictureName, 0, pictureX, 50, 100, 100, 0, 0);
    $gameScreen.movePicture(
      pictureId,
      0,
      pictureX,
      pictureY,
      100,
      100,
      255,
      0,
      COMMENTARY_PICTURE_FADE_FRAMES
    );
  }

  AGH_showPictureItemProcessWork = function () {
    showCommentaryPicture(
      COMMENTARY_PICTURE_SLOT_1,
      valueStartCommentary2,
      valueStartCommentary2P
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:21|初期解説コモン2
  // Queues the stored commentary line of the processed entry as a new message page.
  // Entries whose picture slot is marked "Dpic" only show the picture, not the text.
  function queueCommentaryMessage(interp, commentaryArray, pictureMarkerArray) {
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    if (commentaryArray[processedEntryId] == 0) return;
    const isPictureOnly = pictureMarkerArray[processedEntryId] == "Dpic";
    const commentaryText = isPictureOnly ? "" : commentaryArray[processedEntryId];
    $gameMessage.newPage();
    $gameMessage.add(commentaryText);
    interp.setWaitMode("message");
  }

  AGH_queueMessageDpic = function (interp) {
    queueCommentaryMessage(interp, valueStartCommentary2, valueStartCommentary2P);
  };

  // Replaces (1x): CommonEvents.json:common-event:21|初期解説コモン2
  AGH_showPictureItemProcessWorkInitialGuideCommon2 = function () {
    showCommentaryPicture(
      COMMENTARY_PICTURE_SLOT_2,
      valueStartCommentary3,
      valueStartCommentary3P
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:21|初期解説コモン2
  AGH_readVariableItemProcessWork = function (interp) {
    queueCommentaryMessage(interp, valueStartCommentary3, valueStartCommentary3P);
  };

  // Replaces (1x): CommonEvents.json:common-event:22|宿泊時コモン
  AGH_iterateItemsBedPattern = function () {
    let bedTemplateEventId, valueItems;
    const playerRealX = $gamePlayer._realX;
    const playerRealY = $gamePlayer._realY;
    bedTemplateEventId = 148;
    const gameVariableValue = $gameVariables.value(HELPER_VARIABLE.TOWN_INFO_ITEM_ID);
    if (gameVariableValue >= 1) {
      valueItems = $dataWeapons[gameVariableValue];
    }
    const dungeonInfoItemId = $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID);
    if (dungeonInfoItemId >= 1) {
      valueItems = $dataItems[dungeonInfoItemId];
    }
    if ($dataMap.meta["BedPattern"]) {
      valueItems = $dataMap;
    }
    if (valueItems.meta["BedPattern"]) {
      bedTemplateEventId = Number(valueItems.meta["BedPattern"]);
    }
    $gameMap.spawnEvent(bedTemplateEventId, playerRealX, playerRealY + 1, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:22|宿泊時コモン
  AGH_setSelfVariableDayEndInfoText = function (interp) {
    const list = $gameVariables.value(HELPER_VARIABLE.HEROINE_ACTOR_IDS);
    list.forEach(function (id) {
      const actor = $gameActors.actor(id);
      if (
        ![84, 85, 86].some(function (i) {
          return actor.isStateAffected(i);
        })
      )
        return;

      if (actor.battleSkillsRaw().includes(864)) {
        const actorName = actor.name();
        this.sVal(539, `\x1bSIN[${864}]発動！ ${actorName}は汚れを放置した。\n`);
        this.sVal(540, $gameVariables.value(HELPER_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1);
      } else {
        actor.removeState(84);
        actor.removeState(85);
        actor.removeState(86);
        const actorName2 = actor.name();
        this.sVal(539, `${actorName2}は汚れを洗い流した。\n`);
        this.sVal(540, $gameVariables.value(HELPER_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1);
      }
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_readVariableAppearanceCharacterStartDayPassCommon = function () {
    forEachDeployedActor(returnProfessionBasicsIfLearned);
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_readVariableRaceDefeatCount = function () {
    $gameVariables.value(52)[1] = 0; //当日魔物討伐数
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  // State 61 (自慰) is cleared at the end of the day and logged into the day-end
  // report lines.
  const SELF_RELIEF_STATE_ID = 61;
  const SELF_RELIEF_SKILL_ID = 63;
  const SELF_RELIEF_LIBIDO_ROLL_RANGE = 6;
  const SELF_RELIEF_LIBIDO_ROLL_BASE = 5;
  const DAY_END_INFO_LINE_VARIABLE_ID = 540;
  const DAY_END_INFO_TEXT_VARIABLE_ID = 539;
  const LIBIDO_HIGHLIGHT_COLOR_ID = 27;
  const ACTOR_RECORD_VARIABLE_BASE = 380;
  const ACTOR_RECORD_LIBIDO_INDEX = 1;
  const ACTOR_RECORD_STATE_FLAG_INDEX = 2;
  const ACTOR_RECORD_SELF_RELIEF_COUNT_INDEX = 13;

  // Clears the state and appends the matching day-end report line.
  function clearSelfReliefState(interp, actor, actorId) {
    actor.removeState(SELF_RELIEF_STATE_ID);
    const actorRecord = $gameVariables.value(ACTOR_RECORD_VARIABLE_BASE + actorId);
    actorRecord[ACTOR_RECORD_STATE_FLAG_INDEX] = 0;
    const libidoGain = getRandomIndex(SELF_RELIEF_LIBIDO_ROLL_RANGE) + SELF_RELIEF_LIBIDO_ROLL_BASE;
    const actorName = actor.name();
    const stateName = $dataStates[SELF_RELIEF_STATE_ID].name;

    if (actor.isLearnedSkill(SELF_RELIEF_SKILL_ID)) {
      $gameVariables.setValue(
        DAY_END_INFO_LINE_VARIABLE_ID,
        $gameVariables.value(HELPER_VARIABLE.DAY_END_INFO_LINE_COUNT) + 2
      );
      actorRecord[ACTOR_RECORD_SELF_RELIEF_COUNT_INDEX] += 1;
      actorRecord[ACTOR_RECORD_LIBIDO_INDEX] += libidoGain;
      const effectText = colorTaggedText(
        LIBIDO_HIGHLIGHT_COLOR_ID,
        `[性欲度+${libidoGain}] [自慰回数+1]`
      );
      $gameVariables.setValue(
        DAY_END_INFO_TEXT_VARIABLE_ID,
        $gameVariables.value(HELPER_VARIABLE.DAY_END_INFO_TEXT) +
          `${actorName}は自分を慰めた…。${stateName}が解除された。\n` +
          effectText
      );
      return;
    }
    $gameVariables.setValue(
      DAY_END_INFO_TEXT_VARIABLE_ID,
      $gameVariables.value(HELPER_VARIABLE.DAY_END_INFO_TEXT) +
        `${actorName}の${stateName}が解除された。\n`
    );
    $gameVariables.setValue(
      DAY_END_INFO_LINE_VARIABLE_ID,
      $gameVariables.value(HELPER_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1
    );
  }

  AGH_setSelfVariableDayEndInfoCount = function (interp) {
    const firstActorId = $gameVariables.value(HELPER_VARIABLE.FIRST_DEPLOYED_ACTOR_ID);
    const lastActorId = $gameVariables.value(HELPER_VARIABLE.LAST_DEPLOYED_ACTOR_ID);
    for (let actorId = firstActorId; actorId <= lastActorId; actorId++) {
      const actor = $gameActors.actor(actorId);
      if (!actor.isStateAffected(SELF_RELIEF_STATE_ID)) continue;
      clearSelfReliefState(interp, actor, actorId);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_setSelfVariableDayEndInfoTextDayPassCommon = function (interp) {
    let actor;
    for (let i = 1; i <= $dataStates.length - 1; i++) {
      const stateData = $dataStates[i];
      if (stateData.meta["dayRemove"]) {
        if ($gameParty.membersState(i)) {
          for (
            let j = $gameVariables.value(HELPER_VARIABLE.FIRST_DEPLOYED_ACTOR_ID);
            j <= $gameVariables.value(HELPER_VARIABLE.LAST_DEPLOYED_ACTOR_ID);
            j++
          ) {
            actor = $gameActors.actor(j);
            if (actor.isStateAffected(i)) {
              actor.removeState(i);
            }
          }
          const stateName = stateData.name;
          $gameVariables.setValue(
            539,
            $gameVariables.value(HELPER_VARIABLE.DAY_END_INFO_TEXT) + `${stateName}が解除された。\n`
          );
          $gameVariables.setValue(540, $gameVariables.value(HELPER_VARIABLE.DAY_END_INFO_LINE_COUNT) + 1);
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_iterateSystemSwitchesDaysOnSwi = function () {
    for (let i = 1; i <= $dataSystem.switches.length - 1; i++) {
      if ($dataSystem.switches[i].match(/daysOnSwi/)) {
        if ($gameSwitches.value(i)) {
          const switchIdText = $dataSystem.switches[i].replace(/[^0-9]/g, "");
          $gameSwitches.setValue(switchIdText, true);
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_iterateSystemSwitchesDaysOnVal = function () {
    let variableId;
    for (let i = 1; i <= $dataSystem.switches.length - 1; i++) {
      if ($dataSystem.switches[i].match(/daysOnVal+/)) {
        if ($gameSwitches.value(i)) {
          variableId = $dataSystem.switches[i].replace(/[^0-9]/g, "");
          $gameVariables.setValue(variableId, $gameVariables.value(variableId) + 1);
        }
      }
      if ($dataSystem.switches[i].match(/daysOnVal-/)) {
        if ($gameSwitches.value(i)) {
          variableId = $dataSystem.switches[i].replace(/[^0-9]/g, "");
          $gameVariables.setValue(variableId, $gameVariables.value(variableId) - 1);
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_iterateSystemSwitchesDaysReset = function () {
    let i;
    for (i = 1; i <= $dataSystem.switches.length - 1; i++) {
      if ($dataSystem.switches[i].match(/daysReset/)) {
        $gameSwitches.setValue(i, false);
      }
    }
    for (i = 1; i <= $dataSystem.variables.length - 1; i++) {
      if ($dataSystem.variables[i].match(/daysReset/)) {
        $gameVariables.setValue(i, 0);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_loseItemDayPassCommon = function () {
    for (let i = 1001; i <= 1100; i++) {
      $gameParty.loseItem($dataItems[i], 9999);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_iterateItemsExpiryDate = function () {
    for (let i = 1; i <= $dataItems.length - 1; i++) {
      const itemData = $dataItems[i];
      if (!itemData.meta["ExpiryDate"]) continue;

      if ($gameParty.hasItem(itemData, true)) {
        $gameParty.loseItem(itemData, 9999);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_gainItemSkillCost1week = function () {
    for (let i = 1; i <= $dataItems.length - 1; i++) {
      const itemData = $dataItems[i];
      if (itemData.meta["SkillCost1week"]) {
        $gameParty.gainItem(itemData, 1);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_addState = function (interp) {
    forEachCharacterHRecord(applyDailyAssaultPenalty);
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_readVariableCharacterIdDayPassCommon = function (interp) {
    // Day passage resets record 71 only; surname restoration is a separate action.
    forEachCharacterHRecord(resetDailyAssaultCount);
  };

  // Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
  AGH_clearInfoLogDayPassCommon = function () {
    $gameSystem._infoLog = [];
  };

  // Replaces (1x): CommonEvents.json:common-event:25|一日始まり時コモン
  AGH_setSwitchParallelStopDayPass = function () {
    for (let i = 1; i <= $dataSystem.switches.length - 1; i++) {
      if ($dataSystem.switches[i].match(/夜自動/)) {
        if ($gameSwitches.value(i) && !$gameSwitches.value(i + 2)) {
          $gameSwitches.setValue(474, true);
          $gameSwitches.setValue(i + 1, true);
          break;
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:25|一日始まり時コモン
  AGH_playParticleChime2 = function () {
    AudioManager.playSe({ name: "Chime2", volume: 90, pitch: 100, pan: 0 });
    const textDispray2 = "text_dispray2";
    $gameScreen._particle.particleClear(textDispray2);
    $gameScreen._particle.particlePlay(0, textDispray2, "screen", "def", "screen");
    $gameScreen._particle.particleExceed(textDispray2, 0.3);
  };

  // Replaces (1x): CommonEvents.json:common-event:25|一日始まり時コモン
  AGH_showPictureDayStartCommon = function () {
    const variableText = "\\V[58]";
    const variableText2 = "\\V[55]";
    const messageText = `──${variableText}日目(${variableText2}曜日)──`;
    $gameScreen.setDTextPicture(messageText, 28);
    $gameScreen.dTextAlign = 0;
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(74, "", 0, -100, 100, 100, 100, 0, 0);
    $gameScreen.movePicture(74, 0, 50, 100, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:25|一日始まり時コモン
  AGH_setSelfVariableRandomWork1DayStartCommon = function (interp) {
    let randomWorkValue;
    if ($gameSwitches.value(465)) {
      randomWorkValue = "………行きましょう";
    }
    else if ($gameSwitches.value(HELPER_SWITCH.TOWN) && $gameSwitches.value(204)) {
      randomWorkValue = "──さて、行きましょうか";
    }
    else {
      randomWorkValue = "おはよう御座います。\n今日も頑張りましょうね";
    }
    $gameVariables.setValue(21, randomWorkValue);
  };

  // Replaces (1x): CommonEvents.json:common-event:25|一日始まり時コモン
  AGH_setSwitchDailyOrder = function () {
    if ($gameSwitches.value(HELPER_SWITCH.DAILY_AUTO_COMPLETE)) {
      quest_jutyuu2(2);
      $gameSwitches.setValue(644, true);
    }
    $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, false);
  };

  // Replaces (1x): CommonEvents.json:common-event:29|メニュー開く
  AGH_resetValueCountSet1 = function () {
    valueCountSet1 = 0; //WindowManager.showのため
  };

  // Replaces (1x): CommonEvents.json:common-event:29|メニュー開く
  // Variable 255 keeps the menu header block, variable 253 the profile block that is
  // appended to it. Both menu entry points only differ in the header font size.
  const MENU_HEADER_VARIABLE = 255;
  const MENU_PROFILE_VARIABLE = 253;
  const ACTOR_RECORD_PROFILE_SLOT = 50;

  function buildMenuHeaderText(actor, fontSizeValue) {
    const actorRecord = $gameVariables.value(actor.actorId() + 380);
    const actorName = actor.name();
    const actorNickname = actor.nickname();
    const headerLine = colorTaggedText(2, actorName + "=" + actorRecord[ACTOR_RECORD_PROFILE_SLOT]);
    return (
      "\\fs[" + fontSizeValue + "]" + headerLine + "\n" +
      "\t\t\\fs[" + fontSizeValue + "]" + actorNickname + "\n"
    );
  }

  // Appends the profile block (variable 253) to the header block (variable 255).
  function appendMenuProfileBlock() {
    const headerText = $gameVariables.value(MENU_HEADER_VARIABLE);
    const profileText = $gameVariables.value(MENU_PROFILE_VARIABLE);
    $gameVariables.setValue(MENU_HEADER_VARIABLE, headerText + profileText);
  }

  AGH_setVariableMenuDisplay = function () {
    const actor = $gameParty.members()[0];
    production_separateSetProfile(actor.actorId());
    $gameVariables.setValue(MENU_HEADER_VARIABLE, buildMenuHeaderText(actor, 22));
    const actorProfile = actor.profile();
    $gameVariables.setValue(MENU_PROFILE_VARIABLE, "\\fs[20]" + actorProfile);
    appendMenuProfileBlock();
  };

  // Replaces (1x): CommonEvents.json:common-event:29|メニュー開く
  AGH_setVariableMenuDisplayOpenMenu = function () {
    const actor = $gameParty.members()[0];
    $gameVariables.setValue(MENU_HEADER_VARIABLE, buildMenuHeaderText(actor, 25));
    if (isGirl(actor)) {
      hstates_heights(actor.actorId(), MENU_PROFILE_VARIABLE);
    } else {
      $gameVariables.setValue(MENU_PROFILE_VARIABLE, "　");
    }
    appendMenuProfileBlock();
  };

  // Replaces (1x): CommonEvents.json:common-event:29|メニュー開く
  AGH_setCursorHiddenOpenMenu = function () {
    $gameSystem._cursorHidden = false;
  };

  // Replaces (1x): CommonEvents.json:common-event:42|ナヴィ表示
  AGH_initValueWordSet1 = function () {
    valueWordSet1 = "";
    valueWordSet2 = "";
    valueWordSet3 = "";
    valueWordSet4 = "";
    valueWordSet5 = "";
  };

  // Replaces (1x): CommonEvents.json:common-event:43|一日一回コモン
  AGH_setVariableDungeonWipeOutCount = function () {
    const dungeonWipeBonusCounts = $gameVariables.value(257);
    let counter = 0;
    for (let i = 0; i < dungeonWipeBonusCounts.length; i++) {
      if (dungeonWipeBonusCounts[i] >= 1 && i >= 1) {
        const itemData = $dataItems[i];
        if (itemData.meta["OnSwitch"]) {
          const OnSwitchList = itemData.meta["OnSwitch"].split(",");
          for (let j = 0; j <= OnSwitchList.length - 1; j++) {
            if (Number(OnSwitchList[j]) == 207) {
              counter += dungeonWipeBonusCounts[i];
            }
          }
        }
      }
    }
    $gameVariables.setValue(608, counter);
  };

  // Replaces (1x): CommonEvents.json:common-event:44|称号パッシブ獲得
  AGH_readVariableRandomWork2 = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.VIEWPOINT_ACTOR_ID));
    if (!$gameParty.inBattle()) {
      $gamePlayer.requestAnimation($gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_2));
    } else {
      if (actor.isBattleMember()) {
        $gameParty
          .members()
          [actor.index()].startAnimation($gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_2), false, 0);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:45|一言演出用
  AGH_setSelfVariableActorChoiceOneLineEffect = function (interp) {
    //一言演出。変数20が1以上で獲得用。0で移動ポイント増加など
    $gameVariables.setValue(20, 1);
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const actor = $gameActors.actor(selectedActorId);
    const actorName = colorTaggedText(16, actor.name());
    const jobNameLabel = colorTaggedText(2, "＜\\j[21]＞");
    valueWordSet0 = `${actorName}はクラス2ndジョブ${jobNameLabel}に目覚めた！`;
    valueWordSetEx = 0; //補足が必要な場合
    interp.setupChild($dataCommonEvents[45].list, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:48|全体図で新エリア解放時イベント
  AGH_characterERSMAKETEMPLATE = function (interp) {
    let args;
    const character2 = interp.character(0);
    const positionX = character2.x;
    const positionY = character2.y;
    args = new Array("68", String(positionX), String(positionY));
    interp.pluginCommand("ERS_MAKE_TEMPLATE", args);
    args = new Array("22");
    interp.pluginCommand("ERS_GET_LAST_SPAWN_EVENT_ID", args);
    interp.wait(20);
  };

  // Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
  AGH_fillArrayDungeonWarpPoint = function () {
    valueScriptArray1 = []; //Array(21).fill(0);
    valueWordArray = [];
  };

  // ワープポイント一覧のマップ表示名取得用にマップデータを読み込む。
  // DataManager.loadDataFileは非同期で、読み出し時にwindow.$dataMap2がnullのまま
  // になるため、ローカルファイル限定の同期読み込みで読み出し前にデータを揃える
  AGH_loadMapDataFileSync = function (mapId) {
    const filename = "MAP" + ("000" + mapId).slice(-3) + ".json";
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "data/" + filename, false);
    xhr.overrideMimeType("application/json");
    xhr.send(null);
    window.$dataMap2 = xhr.status < 400 ? JSON.parse(xhr.responseText) : null;
    DataManager.onLoad(window.$dataMap2);
  };

  // Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
  AGH_sliceArrayMAP = function () {
    const entranceWarpEntry = valueScriptArray1[0];
    if (!entranceWarpEntry) return;
    AGH_loadMapDataFileSync(Number(entranceWarpEntry[0]));
  };

  // Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
  AGH_pushToArrayDungeonWarpPoint = function () {
    const displayNameText = window.$dataMap2 ? window.$dataMap2.displayName : "";
    valueWordArray.push(`${displayNameText}(入口)`);
  };

  // Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
  AGH_readVariableRandomWork1 = function () {
    const warpEntry = valueScriptArray1[$gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1)];
    if (!warpEntry) return;
    AGH_loadMapDataFileSync(Number(warpEntry[0]));
  };

  // Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
  AGH_pushToArrayDungeonWarpPoint_2 = function () {
    const displayNameText = window.$dataMap2 ? window.$dataMap2.displayName : "";
    valueWordArray.push(displayNameText);
  };

  // Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
  AGH_addCustomChoiceDungeonWarpPoint = function () {
    for (let i = 0; i <= valueScriptArray1.length - 1; i++) {
      const id = 1;
      const choiceParams = {
        text: `${valueWordArray[i]}`,
        value: i
      };
      $gameSystem.addCustomChoice(id, choiceParams);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
  AGH_readVariableItemProcessWorkDungeonWarpPoint = function () {
    const warpEntry = valueScriptArray1[$gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID)];
    // 選択されたワープポイント([mapId,x,y])は後続ヘルパーへ暗黙グローバルで受け渡す
    selectedWarpEntry = warpEntry || null;
  };

  // Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
  AGH_setVariableDungeonWarpPoint = function () {
    if (!selectedWarpEntry) return;
    $gameVariables.setValue(161, [Number(selectedWarpEntry[0]), Number(selectedWarpEntry[1]), Number(selectedWarpEntry[2])]);
  };

  // Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
  AGH_setSwitchTemporarySwitch = function (interp) {
    if (!selectedWarpEntry) return;
    const array = [Number(selectedWarpEntry[0]), Number(selectedWarpEntry[1]), Number(selectedWarpEntry[2])];
    // 呼び出し元イベントがあればその位置を、無ければプレイヤー位置を現在地とする
    const mapEvent = interp ? $gameMap.event(interp._eventId) : null;
    const currentX = mapEvent ? mapEvent.x : $gamePlayer.x;
    const currentY = mapEvent ? mapEvent.y : $gamePlayer.y;
    const mapPosition = [$gameMap.mapId(), currentX, currentY];
    if (array[0] == mapPosition[0] && array[1] == mapPosition[1] && array[2] == mapPosition[2]) {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, false);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:52|ファイルチェック用スクリプト
  AGH_iterateWeaponsBGInN = function () {
    const BGInN = "BG_inN";
    const valueItems = $dataWeapons;
    const end = valueItems.length - 1;
    let j = 1;
    for (let i = 1; i <= end; i++) {
      const databaseEntry = valueItems[i];
      if (!databaseEntry.meta[BGInN]) continue;

      const array = databaseEntry.meta[BGInN].split(",")[0];
      //console.log(`${i}  ${value1}`);
      //console.log(`${value1}`);
      $gameScreen.showPicture(j, array, 1, 640 - 128, 384, 100, 100, 255, 0);
      j += 1;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:52|ファイルチェック用スクリプト
  AGH_traceDebugOutputEnemyEntrySe = function () {
    const EnemyEntrySe = "EnemyEntrySe";
    const valueItems = $dataEnemies;
    const end = valueItems.length - 1;
    let j = 1;
    for (let i = 1; i <= end; i++) {
      const databaseEntry = valueItems[i];
      if (!databaseEntry.meta[EnemyEntrySe]) continue;

      const array = databaseEntry.meta[EnemyEntrySe].split(",")[0];
      //console.log(`${i}  ${value1}`);
      //console.log(`${value1}`);
      AudioManager.playSe({ name: array, volume: 100, pitch: 100, pan: 0 });
      j += 1;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:52|ファイルチェック用スクリプト
  AGH_showPictureFileCheckScript = function () {
    let pictureName;
    const metadataKey = "";
    const valueItems = $dataItems;
    const end = valueItems.length - 1;
    let j = 1;
    for (let i = 1; i <= end; i++) {
      const databaseEntry = valueItems[i];
      if (!databaseEntry.meta[metadataKey]) continue;

      pictureName = databaseEntry.meta[metadataKey].split(",")[0];
      pictureName = "/img/parallaxes/" + pictureName;
      //console.log(`${i}  ${value1}`);
      $gameScreen.showPicture(j, pictureName, 1, 640 - 128, 384, 100, 100, 255, 0);
      j += 1;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_setSelfVariableActorChoiceDebugCommon = function (interp) {
    $gameVariables.setValue(20, 3);
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    for (let i = 431; i < 439; i++) {
      actor.forgetSkill(i);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_setSelfVariableActorChoice_4 = function (interp) {
    $gameVariables.setValue(20, 3);
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    for (let i = 1; i < $dataSkills.length; i++) {
      if (!!actor.isLearnedSkill(i)) continue;

      actor.forgetSkill(i);
      actor.setSkillMasteryUses(i, 0);
      actor.setSkillMasteryLevel(i, 0);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_setSelfVariableActorChoice_5 = function (interp) {
    $gameVariables.setValue(20, 1);
    //dead debug leftovers: the commented log printed value1, not these
    //const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    //const stateResistancePercent = actor.stateRate(62) * 100;
    //console.log(`${value1}`);
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_addStepsDebugCommon = function () {
    $gameParty._steps += 200;
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_iteratePartyMembersDebugCommon = function () {
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length; i++) {
      const battleMember = battleMembers2[i];
      if ($gameParty.members().contains(battleMember)) {
        battleMember.learnSkill(297);
        battleMember.gainSkillMasteryUses(297, 100);
        battleMember.learnSkill(300);
        battleMember.gainSkillMasteryUses(300, 100);
        battleMember.learnSkill(308);
        battleMember.gainSkillMasteryUses(308, 100);
        battleMember.learnSkill(340);
        battleMember.gainSkillMasteryUses(340, 100);
        battleMember.learnSkill(290);
        battleMember.gainSkillMasteryUses(290, 100);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_iterateTroopsDebugCommon = function () {
    //console.log($dataTroops[11].members);
    //console.log($dataTroops[12].members);
    //console.log($dataTroops[13].members);
    //console.log($dataTroops[14].members);
    //console.log($dataTroops[15].members);
    //console.log($dataTroops[16].members);
    //console.log($dataTroops[17].members);
    //console.log($dataTroops[18].members);
    //console.log($dataTroops[19].members);
    //console.log($dataTroops[20].members);
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_iterateItemsDebugCommon = function () {
    let i;
    let messageText = "";
    for (i = 1; i <= $dataStates.length - 1; i++) {
      messageText += `[${i}]${$dataStates[i].name}\n`;
    }
    for (i = 1; i <= $dataItems.length - 1; i++) {
      messageText += `[${i}]${$dataItems[i].name}\n`;
    }
    for (i = 1; i <= $dataWeapons.length - 1; i++) {
      messageText += `[${i}]${$dataWeapons[i].name}\n`;
    }
    for (i = 1; i <= 500; i++) {
      messageText += `[${i}]${$dataArmors[i].name}\n`;
    }
    for (i = 1; i <= $dataSkills.length - 1; i++) {
      messageText += `[${i}]${$dataSkills[i].name}\n`;
    }
    //console.log(messageText)
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_gainItemDebugCommon = function () {
    for (let i = 801; i <= 810; i++) {
      const itemData = $dataItems[i];
      if (!itemData.name == "") {
        $gameParty.gainItem(itemData, -1);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_setVariableDungeonWarpCircleDebugCommon = function () {
    $gameVariables.setValue(HELPER_VARIABLE.DUNGEON_WARP_POINTS, Array(101).fill(0));
    const dungeonWarpPoints2 = $gameVariables.value(HELPER_VARIABLE.DUNGEON_WARP_POINTS);
    for (let i = 0; i <= 100; i++) {
      const dungeonWarpPoints = dungeonWarpPoints2;
      dungeonWarpPoints[i] = [];
      for (let j = 0; j <= 10; j++) {
        dungeonWarpPoints[i].push(0);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_readVariableDebugCommon = function () {
    $gameVariables.value(1 + 440)[41] = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_readVariableChoiceSwitch3 = function () {
    //イベントの位置が変更された場合に更新。ctrl+CでSetteiのvalueLocationPresetにコピペ
    document.addEventListener("copy", function (e) {
      e.preventDefault();
      const data = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES);
      delete data.comment;
      file = JSON.stringify(data);
      e.clipboardData.setData("text/plain", file);
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
  AGH_iterateSystemSwitches = function () {
    const array = [];
    for (let i = 201; i <= 380; i++) {
      array.push(`${i}:${$dataSystem.switches[i]}`);
    }
    fs.writeFileSync("valueLocationPreset.txt", JSON.stringify(array));
  };

  // Replaces (1x): CommonEvents.json:common-event:54|イベント場所移動コモン
  AGH_configureMapEventEventPlaceMoveCommon = function (interp) {
    for (let i = 1; i < 10; i++) {
      if (!!!$gameMap.event(i)) continue;

      interp._eventId = i;
      break;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:57|セーブ前コモン
  AGH_runScriptBeforeSaveCommon = function () {
    入手Ｇ累計$gameParty.gainGoldSum;
    総合与えダメージ$gameActors.attackDamageSum;
    消費Ｇ累計$gameParty.loseGoldSum;
    合計戦闘不能回数$gameActors.deadCounter;
    最大与えダメージ$gameActors.attackDamageMax;
    合計与えダメージ$gameActors.attackDamageSum;
    最大被害ダメージ$gameActors.acceptDamageMax;
    合計被害ダメージ$gameActors.acceptDamageSum;
  };

  // Replaces (1x): CommonEvents.json:common-event:59|会話コモン特定イベント用
  AGH_showPictureXevS09803 = function () {
    const pictureId = 55;
    valuePic1 = pictureId;
    const XevS09803 = "XevS098_03";
    $gameScreen.showPicture(pictureId, XevS09803, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 120);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_pluginCommandGabText = function (interp) {
    let args;
    const talkSet = valueTalkSet;
    args = new Array(String(talkSet[0]));
    interp.pluginCommand("GabText", args);
    args = new Array(String(talkSet[1]));
    interp.pluginCommand("GabFaceName", args);
    args = new Array(String(talkSet[2]));
    interp.pluginCommand("GabFaceIndex", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_readVariableTipsTitle = function () {
    let hasStoredTip;
    hasStoredTip = 0;
    const tipsTitles = $gameVariables.value(532);
    if (tipsTitles.length != 0) {
      for (let i = 0; i <= tipsTitles.length - 1; i++) {
        if (!(tipsTitles[i] == valueTalkSet[0])) continue;

        hasStoredTip = 1;
        break;
      }
    }
    if (!(hasStoredTip == 0)) return;

    tipsTitles.push(valueTalkSet[0]);
    $gameVariables.value(533).push(valueTalkSet[1]);
    $gameVariables.value(534).push(valueTalkSet[2]);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_showPictureConversationGabCommon = function () {
    let tipText, pictureY;
    if (valueTalkSet[1] == 0) {
      tipText = `Tips:${valueTalkSet[0]}`;
    } else {
      tipText = `Tips:${valueTalkSet[0]}\n${valueTalkSet[1]}`;
    }
    const array = [tipText, 25];
    $gameScreen.setDTextPicture(array[0], array[1]);
    $gameScreen.dWindowFrame = "ON";
    if (valueTalkSet[2][0] != 0) {
      pictureY = 30;
    } else {
      pictureY = 50;
    }
    $gameScreen.showPicture(103, "", 0, -80, pictureY, 100, 100, 255, 0);
    $gameScreen.movePicture(103, 0, 50, pictureY, 100, 100, 255, 0, 100);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_showPictureScreenBlackOut = function () {
    if (!(valueTalkSet[2][0] != 0)) return;

    const ScreenBlackOut = "ScreenBlackOut";
    $gameScreen.showPicture(101, ScreenBlackOut, 1, 640, 384, 100, 100, 150, 0);
    $gameScreen.showPicture(
      102,
      valueTalkSet[2][0],
      valueTalkSet[2][1],
      valueTalkSet[2][2],
      valueTalkSet[2][3],
      valueTalkSet[2][4],
      valueTalkSet[2][5],
      valueTalkSet[2][6],
      0
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_readVariableTipsTitleConversationGabCommon = function () {
    AGH_readVariableTipsTitle();
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  // Skill name picture shown above the acting party member when a skill is used.
  const SKILL_ATTACK_PICTURE_ID = 100;
  const SKILL_ATTACK_PICTURE_FONT_SIZE = 35;
  const SKILL_ATTACK_PICTURE_START_OFFSET_Y = 50;
  const SKILL_ATTACK_PICTURE_END_OFFSET_Y = 100;
  const SKILL_ATTACK_PICTURE_FRAMES = 30;

  // Skill name with its ruby line on top, when the database entry has one.
  function buildSkillNameText(skillId) {
    const skillNameEscaped = `\x1bSIN[${skillId}]`;
    const rubyText = $dataSkills[skillId].meta["rubi"];
    if (!rubyText) return skillNameEscaped;
    return `${rubyText.replace(" ", "")}\n${skillNameEscaped}`;
  }

  // Slides an empty picture upwards to reveal the text picture drawn on top of it.
  function slideSkillAttackPicture(pictureX, pictureY) {
    $gameScreen.showPicture(
      SKILL_ATTACK_PICTURE_ID,
      "",
      1,
      pictureX,
      pictureY - SKILL_ATTACK_PICTURE_START_OFFSET_Y,
      100,
      100,
      0,
      0
    );
    $gameScreen.movePicture(
      SKILL_ATTACK_PICTURE_ID,
      1,
      pictureX,
      pictureY - SKILL_ATTACK_PICTURE_END_OFFSET_Y,
      100,
      100,
      255,
      0,
      SKILL_ATTACK_PICTURE_FRAMES
    );
  }

  AGH_showPictureSkillAttackId = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    const skillId = $gameVariables.value(96);
    const skillNameText = buildSkillNameText(skillId);
    const partySlot = actor.index() + 1;
    const pictureX = $gameParty.getX(partySlot);
    const pictureY = $gameParty.getY(partySlot);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.dTextAlign = 1;
    $gameScreen.setDTextPicture(skillNameText, SKILL_ATTACK_PICTURE_FONT_SIZE);
    slideSkillAttackPicture(pictureX, pictureY);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_pictureScreenBlackOut = function () {
    let backgroundXOffset, textXOffset;
    backgroundXOffset = 128;
    textXOffset = 0;
    if ($gameScreen.picture(5) || $gameScreen.picture(70)) {
      backgroundXOffset = -128;
      textXOffset = -128;
    }
    const talkSet = valueTalkSet;
    const ScreenBlackOut = "ScreenBlackOut";
    $gameScreen.showPicture(
      talkSet[0],
      ScreenBlackOut,
      1,
      640 - 128 + backgroundXOffset,
      384,
      100,
      100,
      150,
      0
    );
    const Town014 = "Town014"; //中心から円状に表示
    picture_fade1(talkSet[0], "fadeIn", Town014, talkSet[2], 5);
    $gameScreen.showPicture(talkSet[0] + 1, talkSet[1], 1, 640 + textXOffset + 20, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(talkSet[0] + 1, 1, 640 + textXOffset, 384, 100, 100, 255, 0, talkSet[2]);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_readVariableRandomWork1ConversationGabCommon = function (interp) {
    const characterId = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    interp.character(characterId).requestAnimation(199);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_forceMoveRouteCharactersRandomWork1 = function (interp) {
    const eventId = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    const mapEvent = $gameMap.event(eventId);
    const positionX = mapEvent.x;
    const positionY = mapEvent.y;
    const args = new Array("190", String(positionX), String(positionY));
    interp.pluginCommand("ERS_MAKE_TEMPLATE", args);
    interp.character(eventId).forceMoveRoute({
      list: [
        { code: 32 },
        { code: 34 },
        { code: 36 },
        { code: 37 },
        { code: 19 },
        { code: 44, parameters: [{ name: "Z_Collaps", volume: 50, pitch: 70, pan: 0 }] },
        { code: 45, parameters: ["this._spriteOffsetX = -20;"] },
        { code: 35 },
        { code: 45, parameters: ["this.setAngle(45);"] },
        { code: 35 },
        { code: 0 }
      ],
      repeat: false,
      skippable: true
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_showPictureConversationGabCommon_2 = function () {
    const talkSet = valueTalkSet;
    $gameScreen.setDTextPicture(talkSet[1], talkSet[0]);
    $gameScreen.dWindowFrame = "ON";
    if (talkSet[2] == 0) {
      $gameScreen.showPicture(102, "", 0, 50, 50, 100, 100, 0, 0);
      $gameScreen.movePicture(102, 0, 100, 50, 100, 100, 255, 0, 60);
    } else {
      $gameScreen.showPicture(102, "", 1, 640 - 50, 384, 100, 100, 0, 0);
      $gameScreen.movePicture(102, 1, 640, 384, 100, 100, 255, 0, 60);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_showPictureConversationGabCommon_3 = function () {
    const pictureId = 101;
    const pictureName = "/img/talkface/99Actor99_s0";
    $gameScreen.showPicture(pictureId, pictureName, 1, 640 + 600, 384 + 100, 0, 0, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 + 500, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_playSeConversationGabCommon = function () {
    const talkSet = valueTalkSet;
    AudioManager.playSe({ name: talkSet[0], volume: talkSet[1], pitch: talkSet[2], pan: 0 });
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_startAnimation = function () {
    const talkSet = valueTalkSet;
    $gameScreen.startAnimation(talkSet[0], talkSet[1], talkSet[2], talkSet[3]);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_setPicturesAnimationConversationGabCommon = function () {
    const talkSet = valueTalkSet;
    //actor is a dead verbatim leftover: nothing in this branch uses it
    //const actor = $gameActors.actor(talkSet[1]);
    if (!(talkSet[0] == 2)) return;

    $gameScreen.setPicturesAnimation(2, 10, "連番", talkSet[2]);
    pic_locationSet(92, 99, "/img/talkface/" + talkSet[1] + "ActorHypnosisEye_0", 60, 0);
    $gameScreen.picture(99).startAnimationFrame(3, true, [1, 1, 1, 2]);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_setStateCounterConversationGabCommon = function () {
    const talkSet = valueTalkSet;
    const actor = $gameActors.actor(talkSet[1]);
    if (talkSet[0] == 1) {
      actor.addState(782);
      actor.setStateCounter(782, talkSet[2]);
    }
    if (!(talkSet[0] == 0)) return;

    actor.removeStateCounter(782);
    actor.removeState(782);
    pic_move1(99, 0, 0, 100, 100, 0, 120);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_waitConversationGabCommon = function (interp) {
    const talkSet = valueTalkSet;
    const actor = $gameActors.actor(talkSet[1]);
    if (!applyTalkSetPictureState(talkSet, actor, "ActorCloudyEye3", 120, 784, 784)) return;

    pic_move1(92, 0, 0, 100, 100, 0, 120);
    const firstPicture = $gameScreen.picture(91);
    const secondPicture = $gameScreen.picture(93);
    const firstPictureX = firstPicture ? firstPicture.x() : undefined;
    const secondPictureX = secondPicture ? secondPicture.x() : undefined;
    pic_move1(93, firstPictureX - secondPictureX, 0, 100, 100, 0, 10);
    interp.wait(15);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_movePicture1ConversationGabCommon = function () {
    const talkSet = valueTalkSet;
    if (talkSet[0] == 0) {
      pic_move1(93, 0, 0, 100, 100, 255, 60);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_showPictureConversationGabCommon_4 = function (entryXOffset = 50) {
    const screen = $gameScreen;
    const isCentered = screen.brightness() === 0 || (!screen.picture(6) && !screen.picture(70));
    const pictureX = isCentered ? 640 : 512;
    screen.dTextRealTime = "ON";
    screen.dTextAlign = 0;
    screen.dWindowFrame = "ON";
    screen.setDTextPicture(valueTalkSet[2], valueTalkSet[1]);
    screen.showPicture(102, "", 1, pictureX - entryXOffset, 384, 100, 100, 0, 0);
    screen.movePicture(102, 1, pictureX, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_brightnessIlluminationW = function () {
    const illuminationW = "illumination_w";
    $gameScreen._particle.particlePlay(0, illuminationW, "screen", "def", "screen");
    $gameScreen._particle.particleUpdate([illuminationW, "emitterLifetime", "1"]);
    if ($gameScreen.brightness() === 0 || (!$gameScreen.picture(6) && !$gameScreen.picture(70))) {
    } else {
      $gameScreen._particle.particleUpdate([illuminationW, "pos", -128, 0]);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_showPictureConversationGabCommon_5 = function () {
    return AGH_showPictureConversationGabCommon_4(20);
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_brightnessDirectScreenRing = function () {
    const directScreenRing = "direct_screenRing";
    $gameScreen._particle.particlePlay(0, directScreenRing, "screen", "def", "screen");
    const startColor = "#07c5ff";
    const endColor = "#ffffff";
    $gameScreen._particle.particleUpdate([directScreenRing, "color", String(startColor), String(endColor)]);
    if ($gameScreen.brightness() === 0 || (!$gameScreen.picture(6) && !$gameScreen.picture(70))) {
    } else {
      $gameScreen._particle.particleUpdate([directScreenRing, "pos", -128, 0]);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_configureMapEventConversationGabCommon = function () {
    const talkSet = valueTalkSet;
    if (talkSet[2] >= 1) {
      valueCountSet1 = talkSet[2];
    } else {
      for (let id = 10; id > 0; id--) {
        if (!!!$gameMap.event(id)) continue;

        valueCountSet1 = id;
        break;
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_spawnMapEventConversationGabCommon = function () {
    let event;
    const talkSet = valueTalkSet;
    if (!(talkSet[0] == 1)) return;

    event = $gameMap.event(valueCountSet1)._realX;
    const eventY = $gameMap.event(valueCountSet1)._realY;
    $gameMap.spawnEvent(146, event, eventY, true);
    valueBlackScreenId = $gameMap.getLastSpawnEventId();
    event = $gameMap.event(valueBlackScreenId);
    event.setOpacity(talkSet[1]);
    event._spriteOffsetY += 368;
  };

  // Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
  AGH_setMapEventOpacityConversationGabCommon = function () {
    let event;
    const talkSet = valueTalkSet;
    if (talkSet[0] == 0) {
      if (valueBlackScreenId >= 1) {
        event = $gameMap.event(valueBlackScreenId);
        event.setOpacity(0);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:62|スクリプト演出コモン
  AGH_showPictureScriptCommonVariable1 = function (interp) {
    let args;
    args = new Array(String($gameVariables.value(121)), "1", "横", String($gameVariables.value(123)));
    interp.pluginCommand("PA_INIT", args);
    const gameVariableValue = $gameVariables.value(124);
    $gameScreen.showPicture(
      gameVariableValue,
      $gameVariables.value(122),
      1,
      $gameVariables.value(126),
      $gameVariables.value(127),
      100,
      100,
      255,
      0
    );
    args = new Array(String(gameVariableValue), String($gameVariables.value(125)));
    interp.pluginCommand("PA_START_LOOP", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:62|スクリプト演出コモン
  AGH_showPictureScriptCommonVariable1ScriptEffectCommon = function (interp) {
    let args;
    const array = [1, 1, 2, 1];
    args = new Array(String($gameVariables.value(121)), "1", "横", String($gameVariables.value(123)));
    interp.pluginCommand("PA_INIT", args);
    const gameVariableValue = $gameVariables.value(124);
    $gameScreen.showPicture(
      gameVariableValue,
      $gameVariables.value(122),
      0,
      0,
      0,
      100,
      100,
      $gameVariables.value(126),
      $gameVariables.value(127)
    );
    args = new Array(String(gameVariableValue), String($gameVariables.value(125)), String(array));
    interp.pluginCommand("PA_START_LOOP", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
  AGH_forceMoveRouteCharactersScriptCommonVariable1ScriptSystemCommon = function (interp) {
    interp.character($gameVariables.value(121)).forceMoveRoute({
      list: [{ code: 41, parameters: [$gameVariables.value(125), $gameVariables.value(126)] }]
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
  AGH_readVariableScriptCommonVariable1 = function (interp) {
    character = interp.character($gameVariables.value(121));
    character.locate($gameVariables.value(122), $gameVariables.value(123));
    character.setDirection($gameVariables.value(124));
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
    const PARTY_DISBAND_ORDER_VARIABLE = 511;
  const PARTY_DISBAND_MARKER_VARIABLE = 512;
  // Variable 511 lists the party order, variable 512 marks the disband position.
  // Before the marker the members are re-added on the way back, after it on the way out.
  function addDisbandedPartyMembers(addBeforeMarker) {
    const partyActorIds = $gameVariables.value(PARTY_DISBAND_ORDER_VARIABLE);
    const markerPosition = $gameVariables.value(PARTY_DISBAND_MARKER_VARIABLE) - 1;
    // The last slot of the list is a terminator and must not be added.
    for (let listIndex = 0; listIndex < partyActorIds.length - 1; listIndex++) {
      const isWanted = addBeforeMarker
        ? markerPosition >= listIndex
        : markerPosition <= listIndex;
      if (!isWanted) continue;
      const partyActorId = partyActorIds[listIndex];
      const partyActor = $gameActors.actor(partyActorId);
      if ($gameParty.members().contains(partyActor)) continue;
      $gameParty.addActor(partyActorId);
      partyActor.refresh();
    }
  }

  AGH_readVariablePartyDisbandOrder = function () {
    addDisbandedPartyMembers(true);
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
  AGH_readVariablePartyDisbandOrderScriptSystemCommon = function () {
    addDisbandedPartyMembers(false);
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
  AGH_readVariableCurrentViewHeroId = function () {
    for (let i = 1; i <= 20; i++) {
      $gameParty.removeActor(i);
    }
    $gameParty.addActor($gameVariables.value(HELPER_VARIABLE.VIEWPOINT_ACTOR_ID));
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
  AGH_runPluginCommandActorChoice = function (interp) {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const args = new Array(String(selectedActorId));
    interp.pluginCommand("NF_NPC削除", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
  AGH_readVariableActorChoiceScriptSystemCommon = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    const calculatedAmount = actor.nickname() + actor.name();
    const messageText = `${calculatedAmount}がパーティから離脱した。`;
    CommonPopupManager.showInfo({}, messageText, null);
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
  AGH_runPluginCommandActorChoiceScriptSystemCommon = function (interp) {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const args = new Array(String(selectedActorId), "1");
    interp.pluginCommand("NF_NPC追加", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
  AGH_readVariableActorChoice_2 = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    $gameParty.setMenuActor(actor);
    SceneManager.push(Scene_Status);
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
  AGH_addCustomChoiceScriptSystemCommon = function () {
    for (let i = 0; i < 9; i++) {
      const id = 1;
      const choiceParams = {
        text: $gameSystem.saveEquipCommandNameArray[i],
        value: i + 1
      };
      $gameSystem.addCustomChoice(id, choiceParams);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
  AGH_readVariableCharacterIdScriptSystemCommon = function (interp) {
    // Scene transitions restore surnames; they must not reset daily records.
    synchronizeCharacterSurnames();
  };

  // Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
  AGH_iteratePartyMembersERSMAKETEMPLATE = function (interp) {
    let args;
    const actor = $gameActors.actor($gameVariables.value(121)).index();
    const members2 = $gameParty.members();
    if (members2.contains(members2[actor])) {
      if (members2[actor].actorId() == $gameVariables.value(HELPER_VARIABLE.VIEWPOINT_ACTOR_ID)) {
      } else {
        const memberIndex = members2[actor].actorId() + 20;
        args = new Array(
          String(memberIndex),
          String(interp.character(-1).x),
          String(interp.character(-1).y + 1)
        );
        interp.pluginCommand("ERS_MAKE_TEMPLATE", args);
        args = new Array("21");
        interp.pluginCommand("ERS_GET_LAST_SPAWN_EVENT_ID", args);
        const gameVariableValue = $gameVariables.value(342);
        gameVariableValue[memberIndex - 20] = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
        args = new Array(String(gameVariableValue[memberIndex - 20]), String(actor));
        interp.pluginCommand("PartyGraphics", args);
        interp
          .character(gameVariableValue[memberIndex - 20])
          .forceMoveRoute({ list: [{ code: 38 }, { code: 9 }, { code: 9 }, { code: 25 }, { code: 0 }] });
        interp.wait(5);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:66|コンフィグコマンド
  AGH_showPictureConfigPicture = function () {
    const gameVariableValue = $gameVariables.value(312);
    if (gameVariableValue == "ZX_NowconditionA_") {
      $gameScreen.showPicture(
        98,
        gameVariableValue + $gameVariables.value(HELPER_VARIABLE.VIEWPOINT_ACTOR_ID),
        1,
        640 + 331 + 500,
        384,
        100,
        100,
        0,
        0
      );
      pic_move1(98, -500, 0, 100, 100, 255, 40);
    } else {
      //$gameScreen.showPicture(98,$gameVariables.value(312),
      //1,640+331+50,384+200,100,100,0,0);
      //pic_move1(98,0,-200,100,100,255,40);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:66|コンフィグコマンド
  AGH_readVariableCurrentViewHeroIdConfigCommand = function () {
    const conditionPictureIndex = 1;
    const animePicName =
      "NowconditionActor" +
      $gameVariables.value(HELPER_VARIABLE.VIEWPOINT_ACTOR_ID) +
      "_" +
      conditionPictureIndex;
    picture_anime1(99, animePicName, 2, 10, "横", 180, 1, true, [1]);
  };

  // Replaces (1x): CommonEvents.json:common-event:66|コンフィグコマンド
  AGH_setSwitchTrueHeroId = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.PROTAGONIST_ACTOR_ID));
    if (actor.isLearnedSkill(796)) {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, true);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:66|コンフィグコマンド
  AGH_setSwitchSingleSouwaIncidence = function () {
    const start = 1201;
    const end = 1300;
    for (let i = start; i <= end; i++) {
      if ($gameSwitches.value(i) && !$gameParty.hasItem(i - 800) && !$gameSwitches.value(i + 100)) {
        if ($dataItems[i - 800].meta["singleSouwaIncidence"]) {
        } else {
          $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, true);
          break;
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:66|コンフィグコマンド
  AGH_setSwitchAddEventIncidenceSwi = function () {
    for (let i = 1; i <= $dataItems.length - 1; i++) {
      const itemData = $dataItems[i];
      if (itemData.meta["AddEventIncidenceSwi"]) {
        if (Number(itemData.meta["EICSwitch"]) == 102) {
          if (
            $gameSwitches.value(Number(itemData.meta["AddEventIncidenceSwi"])) &&
            !$gameParty.hasItem(i) &&
            !$gameSwitches.value(Number(itemData.meta["AddEventCompSwi"]))
          ) {
            if (itemData.meta["singleSouwaIncidence"]) {
            } else {
              $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, true);
              break;
            }
          }
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:67|現状確認
  AGH_hide = function () {
    WindowManager.hide(1);
    WindowManager.hide(2);
    WindowManager.hide(3);
    WindowManager.hide(4);
    WindowManager.hide(5);
    WindowManager.hide(6);
    WindowManager.hide(7);
    WindowManager.hide(8);
    WindowManager.hide(9);
    WindowManager.hide(10);
  };

  // Replaces (1x): CommonEvents.json:common-event:67|現状確認
  AGH_readVariableCurrentViewHeroIdStatusCheck = function (interp) {
    const conditionPictureIndex = 1;
    pic_anime1(
      1,
      2,
      "NowconditionActor" +
        $gameVariables.value(HELPER_VARIABLE.VIEWPOINT_ACTOR_ID) +
        "_" +
        conditionPictureIndex,
      180,
      99,
      3,
      200,
      0
    );
    interp.setupChild($dataCommonEvents[62].list, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:69|主人公スキル
  AGH_readVariableCurrentViewHeroIdHeroSkill = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.VIEWPOINT_ACTOR_ID));
    $gameParty.setMenuActor(actor);
    SceneManager.push(Scene_Skill);
  };

  // Replaces (1x): CommonEvents.json:common-event:76|エロシステム↓
  AGH_inBattle = function () {
    i1 = getRandomIndex(3) + 3;
    const array = [1, 2, 3, 4, 5];
    i2 = array[getRandomIndex(array.length)];
    if ($gameParty.inBattle()) {
      i3 = $gameTroop.aliveMembers().length;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:82|文字で効果音ＢＧＳ
  AGH_showOneWordPictureTextSoundEffectBgs = function () {
    const array = [76, 77, 78, 79, 80, 81, 82, 83, 84, 85];
    valueSerialPictureId = array[getRandomIndex(array.length)];
    pic_oneWord(
      valueSerialPictureId,
      valueScriptArray2[0],
      valueScriptArray2[1],
      valueScriptArray2[2],
      valueScriptArray2[3],
      valueScriptArray1
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:82|文字で効果音ＢＧＳ
  AGH_waitTextSoundEffectBgs = function (interp) {
    const array = [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
    const randomIndex = array[getRandomIndex(array.length)];
    interp.wait(randomIndex);
  };

  // Replaces (1x): CommonEvents.json:common-event:82|文字で効果音ＢＧＳ
  AGH_waitTextSoundEffectBgs_2 = function (interp) {
    let waitFrames;
    waitFrames = valueScriptArray2[3];
    waitFrames = getRandomIndex(41) + waitFrames - 20;
    interp.wait(waitFrames);
  };

  // Replaces (1x): CommonEvents.json:common-event:83|夜発情コモン
  AGH_setSelfVariableRandomWork1NightHeatCommon = function (interp) {
    const start = 63;
    const end = 70;
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    for (let i = start; i <= end; i++) {
      if (actor.isLearnedSkill(i)) {
        $gameVariables.setValue(21, $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1) + 1);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:83|夜発情コモン
  AGH_setSelfVariableLibido = function (interp) {
    h_exp($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID), "0_1_0", 105, false, true, false);
    //ｱｸﾀｰID,ﾋﾟｸﾁｬ,H相手(101ﾓﾌﾞ105対象なし106アイテム),非表示,簡易,過去シーンか否か
    $gameVariables.setValue(401, getRandomIndex(6) + 5);
    $gameVariables.setValue(413, 1);
    $gameVariables.setValue(402, -100);
    //var arr = [1,2,3,4,5];$gameVariables.setValue(401,arr[getRandomIndex(arr.length)]);
    if ($gameSwitches.value(122)) {
      interp.setupChild($dataCommonEvents[85].list, 0);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:83|夜発情コモン
  AGH_setSelfVariableLibidoNightHeatCommon = function (interp) {
    h_exp($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID), "0_1_0", 105, false, true, false);
    //ｱｸﾀｰID,ﾋﾟｸﾁｬ,H相手(101ﾓﾌﾞ105対象なし106アイテム),非表示,簡易,過去シーンか否か
    $gameVariables.setValue(401, getRandomIndex(3) + 3);
    $gameVariables.setValue(402, -100);
    //var arr = [1,2,3,4,5];$gameVariables.setValue(401,arr[getRandomIndex(arr.length)]);
    if ($gameSwitches.value(122)) {
      interp.setupChild($dataCommonEvents[85].list, 0);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:85|性欲度等変動表示コモン
  AGH_handleScriptSnippetValueWordSet = function () {
    valueCountSet1 = 0;
    valueCountSet2 = 1;
    const messageText = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
    window["valueWordSet" + valueCountSet2] = messageText;
  };

  // Replaces (1x): CommonEvents.json:common-event:85|性欲度等変動表示コモン
  AGH_readVariableChoiceSwitch15 = function () {
    //シーン一行表現履歴174,175
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const sceneSummaryCounts = $gameVariables.value(
      HELPER_VARIABLE.SCENE_SUMMARY_COUNTS
    );
    sceneSummaryCounts[selectedActorId] += 1;
    const summaryCount = sceneSummaryCounts[selectedActorId];
    const sceneTitle = $gameVariables.value(506);
    const sceneSummary = "[" + summaryCount + "]" + sceneTitle + "\n";
    const sceneSummaryHistory = $gameVariables.value(174);
    sceneSummaryHistory[selectedActorId] = sceneSummaryHistory[
      selectedActorId
    ].concat(sceneSummary);
  };

  // Replaces (1x): CommonEvents.json:common-event:85|性欲度等変動表示コモン
  AGH_readVariableChoiceSwitch15DesireChangeDisplayCommon = function () {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const gameVariableValue = $gameVariables.value(HELPER_VARIABLE.SCENE_SUMMARY_COUNTS);
    if (!(gameVariableValue[selectedActorId] >= 101)) return;

    gameVariableValue[selectedActorId] -= 1;
    $gameVariables.value(174)[selectedActorId].shift();
  };

  // Replaces (1x): CommonEvents.json:common-event:85|性欲度等変動表示コモン
  AGH_setSelfVariableHStatusGainText = function (interp) {
    const adultSceneTargetId = $gameVariables.value(340) - 100;
    if (
      !(
        $gameVariables.value($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) + 360)[
          adultSceneTargetId
        ] >= 1
      )
    )
      return;

    const displayedAmount = $gameVariables.value(
      $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) + 360
    )[adultSceneTargetId];
    const secondaryWorkText = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_2);
    const coloredText = colorTaggedText(27, `Ｈ回数：${displayedAmount}`);
    const messageText = `\n${secondaryWorkText}との${coloredText}`;
    $gameVariables.setValue(506, $gameVariables.value(506) + messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:85|性欲度等変動表示コモン
  AGH_setScreenDWindowFrame = function () {
    $gameScreen.dWindowFrame = "ON";
  };

  // Replaces (1x): CommonEvents.json:common-event:86|性欲度等補正コモン
  AGH_initValueCountSet3 = function () {
    valueCountSet3 = 1;
  };

  // Replaces (1x): CommonEvents.json:common-event:86|性欲度等補正コモン
  AGH_runScriptDesireAdjustCommon = function () {
    valueCountSet3 += 1;
  };

  // Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
  AGH_showPictureDesireInfoDisplay = function () {
    const pictureId = 111;
    $gameScreen.showPicture(pictureId + 7, "", 1, 1024, 384, 100, 100, 255, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
  AGH_erasePictureDesireInfoDisplay = function () {
    const pictureId = 111;
    $gameScreen.erasePicture(pictureId + 7);
  };

  // Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
  AGH_showPictureHStatusPictureTemp = function () {
    let pictureId;
    const gameVariableValue = $gameVariables.value(193);
    if (!(gameVariableValue != 0)) return;

    pictureId = 111;
    $gameScreen.showPicture(pictureId, gameVariableValue, 1, 1024, 384, 100, 100, 255, 0);
    const array = ["Hscene005", "Hscene029", "Hscene061", "Hscene099", "Hscene105", "Hscene123", "Hscene183"];
    pictureId = array[getRandomIndex(array.length)];
    picture_fade1(51, "fadeIn", pictureId, 60, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
  AGH_setSwitchActorChoice = function (interp) {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    const list = valueHstateDisplay;
    list.forEach(function (id) {
      if (actor.isStateAffected(id)) {
        $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, true);
      }
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
  AGH_setSwitchChoiceSwitch15 = function () {
    if (
      $gameVariables.value(HELPER_VARIABLE.SCENE_SUMMARY_COUNTS)[
        $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID)
      ] >= 1
    ) {
      $gameSwitches.setValue(165, true);
    }
    $gameSwitches.setValue(166, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
  AGH_erasePictureDesireInfoDisplay_2 = function () {
    for (let i = 111; i <= 125; i++) {
      if (!$gameScreen.picture(i)) continue;

      UTSU.PictureBreath.off([i]);
      UTSU.PictureBreath2.off([i]);
      $gameScreen.erasePicture(i);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
  AGH_readVariableActorChoiceDesireInfoDisplay = function () {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const actorHStats = $gameVariables.value(selectedActorId + 380);
    if (!actorHStats) return;
    const dailyEncounterCount = actorHStats[61];
    const prostitutionEarnings = actorHStats[27];
    const desireLevel = actorHStats[1];
    const abstinenceDays = actorHStats[64];
    const wasAssaultedToday = actorHStats[71] >= 1;
    valueWordSet0 = `本日Ｈ回数：${dailyEncounterCount}回　`;
    if (wasAssaultedToday) valueWordSet0 += "（本日中に犯されている…）";
    if (prostitutionEarnings >= 1) valueWordSet0 += `\n売春獲得総金額：${prostitutionEarnings}` + "\\G　";
    if (desireLevel >= 500 && abstinenceDays >= 1) valueWordSet0 += `\n禁欲日数：${abstinenceDays}日　`;
  };

  // Replaces (1x): CommonEvents.json:common-event:88|
  AGH_ceil = function () {
    value1 = Math.ceil(value1);
  };

  // Replaces (1x): CommonEvents.json:common-event:89|Hステ上昇時スキル習得コモン
  AGH_initValueCountSet1 = function () {
    valueCountSet1 = 0; //文言追加用
    valueCountSet2 = 1;
    const expText = colorTaggedText(10, "<H-Passive Expression!>");
    const messageText = `\\FS[28]${expText}\\FS[25]\n`;
    window["valueWordSet" + valueCountSet2] = messageText;
  };

  // Replaces (1x): CommonEvents.json:common-event:93|自動出産コモン
  AGH_showPictureScreenBlackOutAutoBirthCommon = function () {
    const pictureId = 55;
    valuePic1 = pictureId;
    $gameScreen.showPicture(pictureId, "ScreenBlackOut", 1, 640, 384, 100, 100, 150, 0);
    picture_fade1(pictureId, "fadeIn", valueWipeImg, 60, 5);
    pic_1(0, pictureId + 1, "Zev_childbirth", 0, 100, 255, 80, 1280, 768, -256, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:93|自動出産コモン
  AGH_readVariableAppearanceCharacterStartAutoBirthCommon = function () {
    processPregnancyForDeployedActors();
  };

  // Replaces (1x): CommonEvents.json:common-event:93|自動出産コモン
  AGH_setSelfSwitchAutoBirthCommon = function (lastEventId = 20, selfSwitchKey = "A", enabled = false) {
    const mapId = $gameMap.mapId();
    for (let eventId = 1; eventId <= lastEventId; eventId++) {
      $gameSelfSwitches.setValue([mapId, eventId, selfSwitchKey], enabled);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
  AGH_setSelfVariableRandomWork10 = function (interp) {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    if (actor.isLearnedSkill(68)) {
      $gameVariables.setValue(30, $gameVariables.value(30) + 1);
    }
    if (actor.isLearnedSkill(69)) {
      $gameVariables.setValue(30, $gameVariables.value(30) + 1);
    }
    if (actor.isLearnedSkill(70)) {
      $gameVariables.setValue(30, $gameVariables.value(30) + 1);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
  AGH_setSelfVariableSkillUserName = function (interp) {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    actor.removeState(79);
    actor.addState(82);
    $gameVariables.setValue(94, actor.name());
    actor.setStateCounter(82, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
  AGH_showPictureActorChoice = function () {
    const pictureId = 60;
    const fertilizationPictureName =
      "FertilizationActor" + $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    $gameScreen.showPicture(
      pictureId + 1,
      fertilizationPictureName + "_1",
      1,
      1280 / 2 + 50,
      768 / 2,
      100,
      100,
      0,
      0
    );
    $gameScreen.movePicture(pictureId + 1, 1, 1280 / 2, 768 / 2, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
  AGH_startFlash = function () {
    const randomIndex = getRandomIndex(41) + 180;
    const randomOffset = getRandomIndex(21) + 50;
    $gameScreen.startFlash([255, 119, 255, randomIndex], randomOffset);
  };

  // Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
  AGH_showPictureActorChoiceFertilizationCommon = function (interp) {
    const pictureId = 60;
    const fertilizationPictureName =
      "FertilizationActor" + $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    $gameScreen.showPicture(
      pictureId + 10,
      fertilizationPictureName + "_2",
      1,
      1280 / 2,
      768 / 2,
      100,
      100,
      0,
      0
    );
    $gameScreen.movePicture(pictureId + 10, 1, 1280 / 2, 768 / 2, 100, 100, 255, 0, 60);
    interp.wait(60);
  };

  // Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
  AGH_showPictureFertilizationDirect = function (interp) {
    const value = 60;
    for (let i = 1; i <= 4; i++) {
      $gameScreen.showPicture(
        i + 1 + value,
        "FertilizationDirect" + i,
        1,
        1280 / 2,
        768 / 2,
        100,
        100,
        255,
        0
      );
    }
    interp.wait(120);
  };

  // Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
  AGH_movePictureFertilizationCommon = function (interp) {
    const pictureId = 60;
    $gameScreen.movePicture(pictureId + 10, 1, 1280 / 2 - 300, 768 / 2 + 800, 1000, 1000, 0, 0, 240);
    interp.wait(240);
  };

  // Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
  AGH_movePictureFertilizationCommon_2 = function (interp) {
    const value = 60;
    $gameScreen.movePicture(4 + 1 + value, 1, 1280 / 2 - 300, 768 / 2 + 800, 1000, 1000, 0, 0, 300);
    interp.wait(300);
    AudioManager.stopSe();
  };

  // Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
  AGH_erasePictureFertilizationCommon = function (firstPictureId = 60, lastPictureId = 80) {
    const screen = $gameScreen;
    for (let pictureId = firstPictureId; pictureId <= lastPictureId; pictureId++) {
      screen.erasePicture(pictureId);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:95|妊娠時コモン
  AGH_setSelfVariableSkillUserNamePregnancyCommon = function (interp) {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    actor.addStateCounter(82, +10);
    const randomIndex = getRandomIndex(101);
    const threshold = actor.getStateCounter(82) - 50;
    if (!(threshold >= randomIndex)) return;

    actor.removeStateCounter(82);
    actor.removeState(82);
    actor.addState(83);
    actor.setStateCounter(83, 0);
    $gameVariables.setValue(94, actor.name());
  };

  // Actor record arrays: 380 + actorId keeps the H counter record, 440 + actorId the
  // [NoReset] outfit record and 180 + actorId the swimsuit record (all one-based).
  const ACTOR_SWIMSUIT_RECORD_BASE = 180;
  const ACTOR_OUTFIT_RECORD_BASE = 440;
  // Variable 348 stores the heroine graphic outfit of every actor, indexed by actor id.
  const HEROINE_GRAPHIC_OUTFIT_VARIABLE = 348;
  // Slots 1..40 of the current outfit are copied into 460 + slot (variables 461-500).
  const CURRENT_OUTFIT_VARIABLE_BASE = 460;
  const OUTFIT_FIRST_SLOT = 1;
  const OUTFIT_LAST_SLOT = 40;
  const OUTFIT_GRAPHIC_SLOT_INDEX = 41;

  // Copies the 40 current-outfit slots of one preset row into their work variables.
  function copyOutfitSlotsToWorkVariables(outfitPresetRow) {
    for (let slot = OUTFIT_FIRST_SLOT; slot <= OUTFIT_LAST_SLOT; slot++) {
      $gameVariables.setValue(CURRENT_OUTFIT_VARIABLE_BASE + slot, outfitPresetRow[slot]);
    }
  }

  // Replaces (1x): CommonEvents.json:common-event:95|妊娠時コモン
  AGH_setSelfVariableRandomWork2 = function (interp) {
    // 妊娠時の一時的なサイズ増量表現 42 が体重で、以降がスリーサイズ
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const actorRecord = $gameVariables.value(selectedActorId + ACTOR_RECORD_VARIABLE_BASE);
    actorRecord[42] += [7, 8, 9, 10, 11, 12][getRandomIndex(6)];
    actorRecord[43] += [20, 21, 22, 23, 24, 25][getRandomIndex(6)];
    actorRecord[44] += [15, 16, 17, 18, 19, 20][getRandomIndex(6)];
    actorRecord[45] += [3, 4, 5, 6, 7, 8][getRandomIndex(6)];
    // 乱数汎用2..5 hold the four values the scene reads afterwards
    $gameVariables.setValue(22, actorRecord[42]);
    $gameVariables.setValue(23, actorRecord[43]);
    $gameVariables.setValue(24, actorRecord[44]);
    $gameVariables.setValue(25, actorRecord[45]);
    actorRecord[15] += 1;
  };

  // Replaces (1x): CommonEvents.json:common-event:97|出産時コモン演出用未使用
  AGH_readVariableAppearanceCharacterStartBirthCommonUnused = function () {
    // Retain the legacy entry point without coupling it to the auto-birth handler.
    processPregnancyForDeployedActors();
  };

  // Replaces (1x): CommonEvents.json:common-event:99|コンティニュー処理
  AGH_iterateBattleMembersContinueProcessing = function () {
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length - 1; i++) {
      const battleMember = battleMembers2[i];
      battleMember.startAnimation(395, false, 0);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:99|コンティニュー処理
  AGH_iteratePartyMembersContinueProcessing = function () {
    $gameParty.members().forEach(function (actor) {
      actor.removeState(24);
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:101|戦闘全滅
  AGH_stopMapPlayerMovementBattleAllOut = function () {
    if (!$gameParty.inBattle()) {
      $gameTemp.stopMapPlayerMovement();
    }
  };

  // Replaces (2x): CommonEvents.json:common-event:101|戦闘全滅
  AGH_showPictureScreenBlackOutBattleAllOut = function () {
    backGraund_menuMapSelect(2, 0, 0, 0);
    const pictureId = 55;
    valuePic1 = pictureId;
    $gameScreen.showPicture(pictureId - 2, "ScreenBlackOut", 1, 640, 384, 100, 100, 200, 0);
    $gameScreen.showPicture(pictureId - 1, "ScreenDarkCloudsH", 1, 640, 384, 100, 100, 150, 0);
    const Town014 = "Town014"; //中心から円状に表示
    picture_fade1(pictureId - 2, "fadeIn", Town014, 60, 5);
    picture_fade1(pictureId - 1, "fadeIn", Town014, 60, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:101|戦闘全滅
  AGH_showPictureRandomWork1 = function () {
    const actorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const actor = $gameActors.actor(actorId);
    let picIndex = 1;
    if (actor.isLearnedSkill(63)) {
      picIndex = 2;
    }
    if (actor.isLearnedSkill(65)) {
      picIndex = 3;
    }
    const picName = "Zev_BattleDefeat" + actorId + "_" + picIndex;
    const pictureId = valuePic1; // valuePic1 is some general named global variable, need to refactor to use input param
    $gameScreen.showPicture(pictureId, picName, 1, 640 - 128, 384, 150, 150, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    tachie_bless(pictureId, 1);
    const actorName = actor.name();
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_1, `${actorName}は凌辱された…。`);
  };

  // Replaces (1x): CommonEvents.json:common-event:101|戦闘全滅
  AGH_setSelfVariableHStatusGainTextBattleAllOut = function (interp) {
    h_exp($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID), 0, 301, false, false, false);
    //ｱｸﾀｰID,ﾋﾟｸﾁｬ,H相手(301ﾓﾌﾞ305対象なし306アイテム),非表示,簡易,過去シーンか否か
    const name = "\\V[94]";
    $gameVariables.setValue(506, `${name}は凌辱された…。` + "\n");
    $gameVariables.setValue(401, getRandomIndex(3) + 3);
    if ($gameSwitches.value(122)) {
      interp.setupChild($dataCommonEvents[85].list, 0);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:101|戦闘全滅
  AGH_allowMapPlayerMovementBattleAllOut = function () {
    if (!$gameParty.inBattle()) {
      $gameTemp.allowMapPlayerMovement();
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:102|戦闘後
  AGH_fillArrayAfterBattle = function () {
    valueAttackAmplifysActorId = Array(21).fill(Array(100).fill(0));
  };

  // Replaces (1x): CommonEvents.json:common-event:102|戦闘後
  AGH_runPluginCommandPortraitPictureId = function (interp) {
    const list = $gameVariables.value(HELPER_VARIABLE.HEROINE_ACTOR_IDS);
    list.forEach(function (id) {
      $gameVariables.setValue(300, Number($dataActors[id].meta["tachiePicId"]));
      const args = new Array(String(getPreviousTachiePicId()));
      this.pluginCommand("PICT_AFTERIMAGE_REMOVE", args);
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:102|戦闘後
  AGH_setSwitchPassiveOnStatus = function () {
    const partyBattleMembers = $gameParty.battleMembers();
    const partyMembers = $gameParty.members();
    const p100 = colorTaggedText(2, 100);
    const skillIds = [2, 3, 4, 5, 6, 7];
    for (let i = 0; i < partyBattleMembers.length; i++) {
      const battleMember = partyBattleMembers[i];
      if (!partyMembers.contains(battleMember)) continue;

      const anyParamIs100orMore = skillIds.some(function (id) {
        return battleMember.param(id) >= 100;
      });
      if (!anyParamIs100orMore) continue;

      // show one time
      const messageText = `一部ステータスが${p100}以上になる事で、そのステータスが上昇するbattleMembersパッシブスキルが習得できるようになります`;
      gab_wordParticle(messageText);
      $gameSwitches.setValue(483, true);
      return;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:103|戦闘開始時
  AGH_setSelfVariableBattleAverageLuk = function (interp) {
    const battleMembers2 = $gameParty.battleMembers();
    $gameVariables.setValue(
      516,
      Math.round(
        battleMembers2.reduce(function (prev, member) {
          return prev + member.luk;
        }, 0) / (battleMembers2.length || 1)
      )
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:103|戦闘開始時
  AGH_setSwitchEnemyStatusCheck = function () {
    if ($gameVariables.value(304)[valueBossEnemyId] >= 1) {
      $gameSwitches.setValue(HELPER_SWITCH.ENEMY_STATUS_VISIBLE, true);
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.ENEMY_STATUS_VISIBLE, false);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:103|戦闘開始時
  AGH_setSwitchEnemyStatusCheckBattleStart = function () {
    if (!($gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID) >= 1)) return;

    if ($gameParty.hasItem($dataItems[$gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID)])) {
      $gameSwitches.setValue(HELPER_SWITCH.ENEMY_STATUS_VISIBLE, true);
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.ENEMY_STATUS_VISIBLE, false);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:103|戦闘開始時
  AGH_iterateTroopMembersAddText = function () {
    const troopMembers = $gameTroop.members();
    troopMembers.forEach(function (member) {
      if (!member.isAlive()) return;
      const memberName = colorTaggedText(16, member.name());
      const tpLabel = colorTaggedText(6, member.tp + "%");
      BattleManager._logWindow.push("addText", `${memberName} TP${tpLabel}`);
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:103|戦闘開始時
  // Escape odds shown before a flee attempt: one state pins it to 100%, otherwise
  // the party/troop agility ratio decides (capped at 99%).
  const ESCAPE_ALWAYS_STATE_ID = 233;
  const ESCAPE_MAX_PERCENT = 99;

  function escapeChancePercent() {
    if ($gameParty.membersState(ESCAPE_ALWAYS_STATE_ID)) return 100;
    const agilityRatio = (0.8 * $gameParty.agility()) / $gameTroop.agility();
    if (agilityRatio >= 1) return ESCAPE_MAX_PERCENT;
    return Math.floor(agilityRatio * 100);
  }

  AGH_logBattleText = function () {
    if (!BattleManager.canEscape()) {
      const blockedText = colorTaggedText(10, "逃走不可！");
      BattleManager._logWindow.push("addText", `${blockedText}`);
      return;
    }
    const escapeText = colorTaggedText(2, escapeChancePercent() + "%");
    BattleManager._logWindow.push("addText", `逃走成功確立:${escapeText}`);
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_readVariableEnemyLevel = function () {
    //エネミー一定レベル以上で様子を見るを別スキルに変更
    const randomIndex = getRandomIndex(101);
    if (randomIndex >= 40) {
      $dataSkills[890] = $dataSkills[896];
    } else {
      if ($gameVariables.value(270) >= 10) {
        $dataSkills[890] = $dataSkills[891];
      } else {
        $dataSkills[890] = $dataSkills[892];
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_setVariableActorChoiceBattleEachTurn = function () {
    const stateId = 42;
    $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID, 1);
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const actor = $gameActors.actor(selectedActorId);
    const actorName = actor.name();
    const stateName = $dataStates[stateId].name;
    const stateRatePercent = actor.stateRate(stateId) * 100;
    const coloredRate = colorTaggedText(10, `${stateRatePercent}`);
    BattleManager._logWindow.push("addText", `${actorName}の${stateName}耐性率:${coloredRate}%`);
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_movePictureBattleEachTurn = function () {
    const pictureId = 96;
    if ($gameScreen.picture(pictureId)) {
      $gameScreen.movePicture(pictureId, 0, 450, 480, 100, 100, 0, 0, 120);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_erasePicturesBattleEachTurn = function () {
    const array = [...Array(100)].map((_, i) => i + 101);
    pic_eraseP(0, array);
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_runChainSkillBattleEachTurn = function () {
    valueChainSkillId = 0;
    valueChainElement = 0;
    valueChainTotalStat = 0;
    valueChainMemberCount = 0;
    chain_skill();
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_readVariableActorChoiceBattleEachTurn = function () {
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length; i++) {
      const battleMember = battleMembers2[i];
      if (battleMember.isStateAffected(234) && !battleMember.isRestricted()) {
        battleMember.startAnimation(160, false, 0);
        if (battleMember.actorId() != $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID)) {
          if (battleMember.elementAmplifyRate(15) != 0) {
            valueChainAddPower += Math.round(battleMember.elementAmplifyRate(15) * 100);
          }
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_iterateBattleMembersBattleEachTurn = function () {
    let actor1;
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length; i++) {
      const battleMember = battleMembers2[i];
      if (battleMember.isStateAffected(234) && !battleMember.isRestricted()) {
        actor1 = battleMember;
        break;
      }
    }
    if (valueChainSkillId == 0) {
      valueChainSkillId = 98;
    }
    const chainSkillId = valueChainSkillId;
    BattleManager.queueForceAction(actor1, chainSkillId, -1);
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_iterateBattleMembersAddText = function () {
    valueCountSet1 = 0;
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length; i++) {
      const battleMember = battleMembers2[i];
      if (battleMember.battleSkillsRaw().contains(340)) {
        const coloredText = colorTaggedText(2, `\\Sin[340]`);
        const coloredText2 = colorTaggedText(10, `${valueChainMemberCount - 1}`);
        const messageText = `${coloredText}効果が発動！　（×${coloredText2}）`;
        BattleManager._logWindow.push("addText", messageText);
        valueCountSet1 += 1;
        break;
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_iterateBattleMembersBattleEachTurn_2 = function () {
    if (valueCountSet1 >= 1) {
      const battleMembers2 = $gameParty.battleMembers();
      for (let i = 0; i < battleMembers2.length; i++) {
        const battleMember = battleMembers2[i];
        battleMember.startAnimation(426, false, 0);
        for (let id1 = 2; id1 <= valueChainMemberCount; id1++) {
          for (let j = 206; j <= 211; j++) {
            battleMember.addState(j);
          }
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_readVariableActor20HCount = function () {
    if (!$gameParty.membersState(771)) return;
    const battleMembers = $gameParty.battleMembers();
    for (const actor of battleMembers) {
      if (!actor.isStateAffected(771) || !actor.isAlive()) continue;
      const estrusGain = actor._stateCounter[771];
      if (!(estrusGain >= 1)) continue;
      const actorId = actor.actorId();
      const actorHStats = $gameVariables.value(380 + actorId);
      if (!actorHStats) continue;
      actorHStats[2] += estrusGain;
      const totalEstrus = actorHStats[2];
      actor.setStateCounter(771, 0);
      const actorName = actor.name();
      const gainText = colorTaggedText(27, `+${estrusGain}`);
      const messageText = `${actorName}の発情度${gainText} (${totalEstrus})`;
      BattleManager._logWindow.push("addText", messageText);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_readVariableBattleTurnCount = function () {
    const battleMembers2 = $gameParty.battleMembers();
    for (let j = 0; j < battleMembers2.length; j++) {
      const battleMember = battleMembers2[j];
      if ($gameParty.members().contains(battleMember) && battleMember.isAlive()) {
        if ($gameSwitches.value(374)) {
          actor_skilllearn2(battleMember.actorId());
        }
        if ($gameVariables.value(263) % 10 == 0) {
          battleMember.addState(31);
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_setSwitchRank3AttackSkillNotice = function () {
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length; i++) {
      const battleMember = battleMembers2[i];
      if ($gameParty.members().contains(battleMember)) {
        if (
          [101, 111, 121, 131, 141, 151, 161, 171, 181, 191].some(function (id) {
            return battleMember.skillMasteryLevel(id) >= 3;
          })
        ) {
          const coloredText = colorTaggedText(2, "ランク3");
          const messageText = `通常攻撃スキルが${coloredText}になる事で、その武器威力が上昇するパッシブスキルが習得できるようになります`;
          gab_wordParticle(messageText);
          $gameSwitches.setValue(HELPER_SWITCH.RANK_3_ATTACK_NOTICE, true);
          break;
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_runPluginCommandPortraitPictureIdBattleEachTurn = function (interp) {
    const heroineActorIds = $gameVariables.value(HELPER_VARIABLE.HEROINE_ACTOR_IDS);
    heroineActorIds.forEach(function (actorId) {
      const actorData = $dataActors[actorId];
      $gameVariables.setValue(300, Number(actorData.meta["tachiePicId"]));
      const pictureIdText = String(getPreviousTachiePicId());
      if ($gameActors.actor(actorId).tp >= 100) {
        // "r,g,b" afterimage tint of the tachie picture.
        const afterimageRgb = actorData.meta["AfterimageRGB"].split(",");
        const args = new Array(
          pictureIdText,
          "20",
          String(afterimageRgb[0]),
          String(afterimageRgb[1]),
          String(afterimageRgb[2])
        );
        this.pluginCommand("PICT_AFTERIMAGE_ADD", args);
        return;
      }
      this.pluginCommand("PICT_AFTERIMAGE_REMOVE", new Array(pictureIdText));
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
  AGH_iterateBattleMembersBattleEachTurn_3 = function () {
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length; i++) {
      const battleMember = battleMembers2[i];
      if (battleMember.isStateAffected(61) && battleMember.isAlive()) {
        let randomIndex = getRandomIndex(101);
        seiyoku_skillProbabilityUp1(battleMember);
        randomIndex += valueCountSet3;
        if (randomIndex >= 90) {
          battleMember.addState(65);
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:105|戦闘マップ全滅ボーナス
  AGH_readVariableDungeonInfoItem = function () {
    const dungeonInfoItemId = $gameVariables.value(
      HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID
    );
    const dungeonInfoItem = $dataItems[dungeonInfoItemId];
    const dungeonNameLabel = `<${dungeonInfoItem.name}>`;
    const dungeonName = colorTaggedText(1, dungeonNameLabel);
    valueWordSet0 = `${dungeonName}出現エネミーの殲滅が完了！`;
  };

  // Replaces (1x): CommonEvents.json:common-event:105|戦闘マップ全滅ボーナス
  AGH_resetValueWordSet0 = function () {
    valueWordSet0 = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:105|戦闘マップ全滅ボーナス
  AGH_setDTextPictureBattleMapAllOutBonus = function () {
    const wordSet = valueWordSet1;
    const fontSize2 = 28;
    $gameScreen.setDTextPicture(wordSet, fontSize2);
  };

  // Replaces (1x): CommonEvents.json:common-event:105|戦闘マップ全滅ボーナス
  AGH_gainItemRandomWork1 = function () {
    const dungeonInfoItemId = $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID);
    const firstAnnihilationItem = $dataItems[dungeonInfoItemId].meta["firstAnnihilationItem"].split(",");
    // "<database type>,<entry id>": 0 = items, 1 = weapons, 2 = armors.
    const rewardItem = getIWA(Number(firstAnnihilationItem[0]))[Number(firstAnnihilationItem[1])];
    $gameParty.gainItem(rewardItem, 1);
    const coloredText = colorTaggedText(2, "<初回殲滅特典>");
    const iconIndexText = rewardItem.iconIndex;
    const itemName = rewardItem.name;
    const messageText = `${coloredText}\x1bI[${iconIndexText}]${itemName}を入手した！`;
    $gameScreen.setDTextPicture(messageText, 28);
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_1, `${rewardItem.description}`);
  };

  // Replaces (1x): CommonEvents.json:common-event:106|
  AGH_readVariableActorChoiceCommonEvent106 = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    const clothes = $gameVariables.value(HELPER_VARIABLE.DAMAGED_CLOTHES_NAME);
    const actorName = actor.name();
    BattleManager._logWindow.push("addText", `${actorName}の${clothes}が破損した！`);
  };

  // Replaces (1x): CommonEvents.json:common-event:106|
  AGH_iterateItemsSetTint = function (interp) {
    const gameVariableValue = $gameVariables.value(244);
    const itemData = $dataItems[gameVariableValue];
    if (!itemData.meta["色相"]) return;

    const itemMeta = itemData.meta["色相"];
    const args = new Array("42", String(itemMeta));
    interp.pluginCommand("SetTint", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:106|
  AGH_runPluginCommandDamagedPartItemId = function (interp) {
    const gameVariableValue = $gameVariables.value(244);
    const itemData = $dataItems[gameVariableValue];
    if (!itemData.meta["色相2"]) return;

    const MetaList = itemData.meta["色相2"].split(",")[2];
    const args = new Array("44", String(MetaList));
    interp.pluginCommand("SetTint", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:106|
  AGH_setPictureOpacityCommonEvent106 = function () {
    $gameScreen.picture(42)._opacity = 255;
    const picture2 = $gameScreen.picture(44);
    if (picture2) {
      picture2._opacity = 255;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:109|ダメージ時破損コモン
  AGH_setSwitchCostumeDamaged = function () {
    const array = $gameVariables.value($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) + 380)[4];
    if (array <= 49) {
      $gameSwitches.setValue(438, true);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:109|ダメージ時破損コモン
  AGH_setVariableRestrainedEnemyMove = function () {
    if (!$dataSystem.optSideView) return;

    const skillTargetId = $gameVariables.value(92) + 1;
    $gameVariables.setValue(703, [$gameTroop.getX(skillTargetId), $gameTroop.getY(skillTargetId)]);
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID)).index() + 1;
    $gameVariables.setValue(704, [$gameParty.getX(actor), $gameParty.getY(actor)]);
    $gameTroop.set(skillTargetId, $gameVariables.value(704)[0] - 100, $gameVariables.value(704)[1], 30);
  };

  // Replaces (1x): CommonEvents.json:common-event:109|ダメージ時破損コモン
  AGH_aliveMembers = function (interp) {
    let entryCount;
    if ($gameTroop.aliveMembers().length >= 1) {
      entryCount = $gameTroop.aliveMembers().length;
    } else {
      entryCount = 1;
    }
    h_exp3(1, entryCount, entryCount, 0, 0, 0, 0, 0, 0, 0, 0); //10
    //0セク1乳2尻揉3失禁4潮吹5売春6妊7子8中だ9ｱﾅﾙ出し10口飲
    interp.setupChild($dataCommonEvents[85].list, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:109|ダメージ時破損コモン
  AGH_erasePicturesDamageBreakCommon = function () {
    const array = [54, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];
    pic_eraseP(0, array);
  };

  // Replaces (1x): CommonEvents.json:common-event:110|Ｈ攻撃時コモン
  AGH_setVariableHbgvTarget = function () {
    const backgroundVoiceTarget = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID); //文字HBGV
    $gameVariables.setValue(318, backgroundVoiceTarget);
    $gameVariables.setValue(706, [640, 384, 1, 60, 0, 0]);
  };

  // Replaces (1x): CommonEvents.json:common-event:110|Ｈ攻撃時コモン
  AGH_setSelfVariableLibidoHAttackCommon = function (interp) {
    $gameVariables.setValue(401, getRandomIndex(11) + 10);
    if ($gameSwitches.value(122)) {
      interp.setupChild($dataCommonEvents[85].list, 0);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:110|Ｈ攻撃時コモン
  AGH_readVariableActorChoiceHAttackCommon = function () {
    valueBattleSexCountArr[$gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID)] += 1;
  };

  // Replaces (1x): CommonEvents.json:common-event:110|Ｈ攻撃時コモン
  AGH_setSwitchTemporarySwitchHAttackCommon = function () {
    let desireLevel;
    $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, false);
    desireLevel = $gameVariables.value($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) + 380)[1];
    desireLevel = Math.floor(desireLevel / 100);
    desireLevel = desireLevel * 2;
    const actorBattleEncounterCount =
      valueBattleSexCountArr[$gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID)];
    const coloredText = colorTaggedText(27, `${actorBattleEncounterCount}`);
    const coloredText2 = colorTaggedText(2, `${desireLevel}`);
    const messageText = `性交回数:${coloredText} / 性交限界回数:${coloredText2}`;
    BattleManager._logWindow.push("addText", messageText);
    if (actorBattleEncounterCount >= desireLevel) {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:110|Ｈ攻撃時コモン
  AGH_setVariableRandomWork1 = function () {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    if (!$dataActors[selectedActorId].meta["SexualBattleEndLow"]) return;

    const actor = $gameActors.actor(selectedActorId);
    // Learned skills raise the quote intensity and pick the matching face.
    let quoteIntensity = "Low";
    let faceIndex = 22;
    if (actor.isLearnedSkill(62)) {
      quoteIntensity = "Middle";
      faceIndex = 34;
    }
    if (actor.isLearnedSkill(65)) {
      quoteIntensity = "Hi";
      faceIndex = 36;
    }
    const quoteCandidates = $dataActors[selectedActorId].meta[
      "SexualBattleEnd" + quoteIntensity
    ].split(",");
    const randomIndex = quoteCandidates[getRandomIndex(quoteCandidates.length)];
    const actorName = actor.name();
    $gameVariables.setValue(
      HELPER_VARIABLE.RANDOM_WORK_1,
      `\\nw[${actorName}]${randomIndex}`
    );
    valueFaceSelect = faceIndex;
    battle_bustUp(51, 500, 10, 40);
  };

  // Replaces (1x): CommonEvents.json:common-event:111|衣装全損
  AGH_setVariableActor20Costume = function (interp) {
    valueCountSet2 = [];
    const list = [20, 21, 22, 23, 25, 28];
    list.forEach(function (id) {
      clothes_hason1([id], 0);
      valueCountSet2.push($gameVariables.value(244));
      $gameVariables.setValue(460 + id, 0);
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:111|衣装全損
  AGH_setVariableDamagedPartItemId = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    for (let i = 0; i <= valueCountSet2.length - 1; i++) {
      if (!(valueCountSet2[i] >= 1)) continue;

      $gameVariables.setValue(244, valueCountSet2[i]);
      const actorName = actor.name();
      const itemName = $dataItems[valueCountSet2[i]].name;
      const messageText = `${actorName}の${itemName}が破損した！`;
      if ($gameParty.inBattle()) {
        BattleManager._logWindow.push("addText", messageText);
      } else {
        CommonPopupManager.showInfo({}, messageText, null);
      }
      clothes_hason2(0, 1);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:112|衣装通常破損
  AGH_readVariableActorChoiceCostumeNormalDamage = function () {
    const actorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const actor = $gameActors.actor(actorId);
    const actorHStats = $gameVariables.value(actorId + 380);
    if (!actor || !actorHStats) return;
    const actorName = actor.name();
    const damagedClothes = $gameVariables.value(HELPER_VARIABLE.DAMAGED_CLOTHES_NAME);
    const exposureValue = actorHStats[4];
    const messageText = `${actorName}の${damagedClothes}が破損した！　（現在露出値:${exposureValue}）`;
    if ($gameParty.inBattle()) {
      BattleManager._logWindow.push("addText", messageText);
      return;
    }
    CommonPopupManager.showInfo({}, messageText, null);
  };

  // Replaces (1x): CommonEvents.json:common-event:113|戦闘絶頂表現
  AGH_readVariableActorChoiceBattleClimaxExpression = function () {
    h_BattleEcstasyDirect();
    $gameVariables.value($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) + 380)[2] = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:120|雑魚戦闘用
  AGH_setup = function (interp) {
    BattleManager.setup(valueCountSet1, valueCountSet2, true);
    BattleManager.setEventCallback(
      function (n) {
        this._branch[this._indent] = n;
      }.bind(interp)
    );
    $gamePlayer.makeEncounterCount();
    SceneManager.push(Scene_Battle);
  };

  // Replaces (1x): CommonEvents.json:common-event:120|雑魚戦闘用
  // Both handlers below roll a random sprite angle offset that no caller ever used; the
  // roll is kept so the random sequence (and therefore later rolls) stays identical.
  function rollUnusedSpriteAngleOffset() {
    const angle = [-45, 45, -90, 90][getRandomIndex(4)];
    switch (numericCaseValue(angle)) {
      case 90:
        return -24;
      case 45:
        return -12;
    }
    if (angle == -90) return 24;
    if (angle == -45) return 12;
    return undefined;
  }

  // Runs a forced move route that ends with the usual "end of list" command.
  function forceMoveRoute(character, commands) {
    character.forceMoveRoute({
      list: commands.concat([{ code: 0 }]),
      repeat: false,
      skippable: true
    });
  }

  const MOVE_COMMAND_SET_GRAPHIC = 41;
  const MOVE_COMMAND_WAIT = 15;
  const MOVE_COMMAND_SCRIPT = 45;
  const MOVE_COMMAND_TURN_DOWN = 32;
  const MOVE_COMMAND_TURN_LEFT = 34;
  const MOVE_COMMAND_STEP_LEFT = 35;
  const MOVE_COMMAND_TURN_RIGHT = 37;
  const MOVE_COMMAND_STEP_UP = 17;

  AGH_forceMoveRouteCharactersDungeonInfoItem = function (interp) {
    rollUnusedSpriteAngleOffset();
    const dungeonInfoItemId = $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID);
    const enemyGraphic = $dataItems[dungeonInfoItemId].meta.EnemyGraphic.split(",");
    forceMoveRoute(interp.character(interp._eventId), [
      {
        code: MOVE_COMMAND_SET_GRAPHIC,
        parameters: [enemyGraphic[0], Number(enemyGraphic[1])]
      },
      { code: MOVE_COMMAND_WAIT, parameters: [10] },
      { code: MOVE_COMMAND_SCRIPT, parameters: ["this.setAngle(value1);"] },
      { code: MOVE_COMMAND_SCRIPT, parameters: ["this._spriteOffsetX = value2;"] },
      { code: MOVE_COMMAND_SCRIPT, parameters: ["this._spriteOffsetY = value2;"] },
      { code: MOVE_COMMAND_TURN_DOWN },
      { code: MOVE_COMMAND_TURN_LEFT },
      { code: MOVE_COMMAND_STEP_LEFT },
      { code: MOVE_COMMAND_TURN_RIGHT }
    ]);
  };

  // Replaces (1x): CommonEvents.json:common-event:121|ボスその他戦闘用
  AGH_battleBgmName = function () {
    const entryName = $gameSystem.battleBgm().name;
    const volume2 = $gameSystem.battleBgm().volume;
    const pitch2 = $gameSystem.battleBgm().pitch;
    const pan2 = $gameSystem.battleBgm().pan;
    AudioManager.playBgm({ name: entryName, volume: volume2, pitch: pitch2, pan: pan2 });
  };

  // Replaces (1x): CommonEvents.json:common-event:121|ボスその他戦闘用
  AGH_resetValueBossId = function () {
    valueBossId = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:121|ボスその他戦闘用
  AGH_readVariableBossBgm = function () {
    const gameVariableValue = $gameVariables.value(337);
    if (!(gameVariableValue != 0)) return;

    const bossBgmSettings = gameVariableValue;
    $gameSystem.setBattleBgm({
      name: bossBgmSettings[0],
      volume: bossBgmSettings[1],
      pitch: bossBgmSettings[2],
      pan: bossBgmSettings[3]
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:121|ボスその他戦闘用
  AGH_setVariableActorChoiceBossBattleUse = function () {
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i <= battleMembers2.length - 1; i++) {
      const battleMember = battleMembers2[i];
      if (isGirl(battleMember)) {
        $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID, battleMembers2[i].actorId());
        tachie_settei2();
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:121|ボスその他戦闘用
  AGH_pushToArrayBossBattleUse = function (interp) {
    const valueTroopId2 = valueTroopId; //直前に入れる戦闘グループ名
    //逃走無効を条件分岐させる？
    BattleManager.setup(valueTroopId2, false, true);
    BattleManager.setEventCallback(
      function (n) {
        this._branch[this._indent] = n;
      }.bind(interp)
    );
    $gamePlayer.makeEncounterCount();
    SceneManager.push(Scene_Battle);
  };

  // Replaces (1x): CommonEvents.json:common-event:124|呼びエネミー生成
  AGH_forceMoveRouteCharactersDungeonInfoItemSummonEnemySpawn = function (interp) {
    const dungeonInfoItemId = $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID);
    const itemData = $dataItems[dungeonInfoItemId];
    interp.character($gameVariables.value(223)).forceMoveRoute({
      list: [
        {
          code: 41,
          parameters: [
            itemData.meta.EnemyGraphic.split(",")[0],
            Number(itemData.meta.EnemyGraphic.split(",")[1])
          ]
        },
        { code: 15, parameters: [60] },
        { code: 29, parameters: [getRandomIndex(4) + 2] },
        { code: 0 }
      ]
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:124|呼びエネミー生成
  AGH_forceMoveRouteCharactersDungeonInfoItemMinionSpawnLatest = function (interp) {
    const dungeonInfoItemId = $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID);
    const itemData = $dataItems[dungeonInfoItemId];
    interp.character($gameVariables.value(223)).forceMoveRoute({
      list: [
        {
          code: 41,
          parameters: [
            itemData.meta.EnemyGraphic.split(",")[0],
            Number(itemData.meta.EnemyGraphic.split(",")[1])
          ]
        },
        { code: 15, parameters: [60] },
        { code: 45, parameters: ["this.setTone(50, -100, 50);"] },
        { code: 0 }
      ]
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:128|エネミー変身コモン
  AGH_resetValueEnemyEntrySetId = function () {
    valueEnemyEntrySetId = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:128|エネミー変身コモン
  AGH_iterateTroopMembersEnemyTransformCommon = function () {
    let transformEnemyId;
    transformEnemyId = 0;
    const troopMember = $gameTroop.members()[valueWordSet10];
    const enemyId = troopMember._enemyId;
    if ($dataEnemies[enemyId].meta[valueWordSet9]) {
      transformEnemyId = enemyId;
    }
    valueEnemyEntrySetId = transformEnemyId;
  };

  // Replaces (1x): CommonEvents.json:common-event:128|エネミー変身コモン
  AGH_iterateTroopMembersEnemyTransformCommon_2 = function () {
    const troopMember = $gameTroop.members()[valueWordSet10];
    const enemyId = troopMember._enemyId;
    const enemy = $dataEnemies[enemyId].meta[valueWordSet9].split(",");
    valueWordSet7 = Number(enemy[4]);
  };

  // Replaces (1x): CommonEvents.json:common-event:128|エネミー変身コモン
  AGH_waitEnemyTransformCommon = function (interp) {
    let animationRate;
    const troopMember = $gameTroop.members()[valueWordSet10];
    const enemyId = troopMember._enemyId;
    const enemy = $dataEnemies[enemyId].meta[valueWordSet9].split(",");
    const array = Number(enemy[0]);
    troopMember.startAnimation(array, true, 0);
    const entryCount = $dataAnimations[array].frames.length;
    animationRate = 4;
    if ($dataAnimations[array].name.match(/!/)) {
      animationRate = 1;
    }
    if ($dataAnimations[array].name.match(/&/)) {
      animationRate = 2;
    }
    if ($dataAnimations[array].name.match(/\$/)) {
      animationRate = 3;
    }
    interp.wait(Math.ceil((entryCount * animationRate) / 4));
  };

  // Replaces (1x): CommonEvents.json:common-event:128|エネミー変身コモン
  AGH_iterateTroopMembersEnemyTransformCommon_3 = function () {
    const wordSet = valueWordSet8;
    const troopMember = $gameTroop.members()[valueWordSet10];
    //enemy1 is a dead verbatim leftover: nothing uses it
    //const enemy1 = troopMember._enemyId;
    troopMember.addState(wordSet);
    troopMember.refresh();
  };

  // Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
  AGH_iterateTroopMembersBossAwakenAction = function () {
    a = $gameTroop.members()[0];
  };

  // Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
  AGH_readVariableBossSpecialActionPattern = function () {
    let selectedBossSkillId;
    selectedBossSkillId = 0;
    const loopVariableValue = $gameVariables.value(347);
    for (let i = 1; i <= 8; i++) {
      const gameVariableValue = loopVariableValue;
      if (gameVariableValue[i][0] == 9) {
        if (a.hpRate() <= gameVariableValue[i][1] / 100) {
          if (a.meetsSkillConditions($dataSkills[gameVariableValue[i][2]])) {
            selectedBossSkillId = gameVariableValue[i][2];
          }
        }
      }
    }
    valueCountSet1 = selectedBossSkillId;
  };

  // Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
  AGH_initValueBossAction = function () {
    valueBossAction = valueCountSet1;
  };

  // Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
  AGH_handleScriptSnippetEnemyMiddleChange = function () {
    valueWordSet7 = 0; //会話イベント指定変数
    valueWordSet8 = 551; //付与ステートid
    valueWordSet9 = "EnemyMiddleChange"; //meta判定
    valueWordSet10 = 0; //変身するかしないか判定
  };

  // Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
  AGH_iterateTroopMembersAddTextBossAwakenAction = function () {
    const entryName = $gameTroop.members()[0].name();
    const messageText = `${entryName}は真の力を解放した！`;
    BattleManager._logWindow.push("addText", messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
  // `a` (troop member) and `valueBossAction` are implicit globals set by the
  // preceding helpers in the same event, like selectedWarpEntry in the warp-point event.
  AGH_runBossAwakenAttack = function (interp) {
    attack_keisan1(a, valueBossAction, 1);
    interp.forceAction(a, valueBossAction, -1);
  };

  // Replaces (1x): CommonEvents.json:common-event:130|ボス行動
  AGH_forceAction = function (interp) {
    let skillId;
    if (valueBossAction >= 1) {
      skillId = valueBossAction;
    } else {
      skillId = valueBossActionNormal;
    }
    attack_keisan1(BattleManager._subject, skillId, 1);
    interp.forceAction(BattleManager._subject, skillId, -1);
  };

  // Replaces (1x): CommonEvents.json:common-event:131|行動条件で設定
  AGH_setSelfVariableRandomWork1SetByActionCondition = function (interp) {
    //action is a dead verbatim leftover: the line below re-reads it
    //const action = BattleManager._action;
    $gameVariables.setValue(21, BattleManager._action._item._itemId);
  };

  // Replaces (1x): CommonEvents.json:common-event:140|カットインコモン
  AGH_checkSwitchBattlePortraitDisabled = function () {
    if (!$gameSwitches.value(131)) {
      //立ち絵禁止のスイッチで条件分岐
      tachie_syoukyo1(getPreviousTachiePicId());
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:140|カットインコモン
  AGH_fillArrayCutInCommon = function () {
    valueCutInSet1 = Array(7).fill(0);
  };

  // Replaces (1x): CommonEvents.json:common-event:141|会話カットインコモン
  // valueCutInSet1[0] is the cut-in label set by cutin_preparation; the
  // pluginCommand args follow the idiom used by every other call site
  // (Troops.json / Torigoya_SkillCutIn.js consumers).
  AGH_runPluginCommandNightSpecialWeather = function (interp) {
    cutin_preparation(5, $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    $gameVariables.setValue(251, valueCutInSet1);
    const args = new Array(String(valueCutInSet1[0]));
    interp.pluginCommand("味方カットイン", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:141|会話カットインコモン
  AGH_updateParticleRandomWork2 = function () {
    const linesSp = "lines_sp"; //集中線
    const secondaryWorkValue = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_2);
    $gameScreen._particle.particleUpdate([linesSp, "pos", secondaryWorkValue, 0]);
  };

  // Replaces (1x): CommonEvents.json:common-event:141|会話カットインコモン
  AGH_showPictureActorChoiceConversationCutInCommon = function () {
    let easingValue;
    easingValue = "easeOutBack";
    picture_easingConfiguration(easingValue);
    easingValue = 100 - valueADVCutinDirect;
    const pictureName =
      "CutInCG_Actor" +
      $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) +
      "_" +
      $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    const secondaryWorkValue = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_2);
    $gameScreen.showPicture(easingValue, pictureName, 1, 640 + secondaryWorkValue, 384, 100, 0, 255, 0);
    $gameScreen.movePicture(easingValue, 1, 640 + secondaryWorkValue, 384, 100, 100, 255, 0, 40);
  };

  // Replaces (1x): CommonEvents.json:common-event:141|会話カットインコモン
  AGH_runScriptConversationCutInCommon = function () {
    valueADVCutinDirect += 1;
  };

  // Replaces (1x): CommonEvents.json:common-event:141|会話カットインコモン
  AGH_pictureEaseOutBack = function () {
    let easingValue, picture;
    easingValue = "easeOutBack";
    picture_easingConfiguration(easingValue);
    for (let i = 98; i <= 100; i++) {
      const picture2 = $gameScreen.picture(i);
      if (!picture2) continue;

      easingValue = picture2.x();
      picture = picture2.y();
      $gameScreen.movePicture(i, 1, easingValue, picture, 100, 0, 0, 0, 30);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:141|会話カットインコモン
  AGH_resetValueADVCutinDirect = function () {
    valueADVCutinDirect = 0;
    adv_partDirectSet(1, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:142|ボスＨＰ表示
  AGH_runScriptBossHpDisplay = function () {
    SceneManager._scene._bosshp_sprites.visible = true;
  };

  // Replaces (1x): CommonEvents.json:common-event:150|トータルダメージ表示変数
  AGH_handleScriptSnippetEaseOutBounce = function () {
    let easingValue;
    if (valueTotalDamageCount >= 100000) {
      easingValue = "easeOutBounce";
    } else {
      easingValue = "easeOutBack";
    }
    picture_easingConfiguration(easingValue);
  };

  // Replaces (1x): CommonEvents.json:common-event:150|トータルダメージ表示変数
  AGH_showPictureOneLineSwitch = function () {
    let fontSize2;
    const pictureId = 96;
    const valueTotalDamageCount3 = valueTotalDamageCount;
    const damageText = valueTotalDamageCount3.toLocaleString();
    fontSize2 = 50;
    const pictureX = 400;
    const pictureY = 480;
    if (valueTotalDamageCount <= 9999) {
      fontSize2 = 45;
    }
    if (valueTotalDamageCount >= 100000) {
      fontSize2 = 55;
    }
    if ($gameVariables.value(276) == 2) {
      $gameScreen.setDTextPicture(
        `\\f[b]\\oc[22]\\f[i]Total ${valueTotalDamageCount2} hits,\\C[10]${damageText}\\C[17] damage!\\C[0]`,
        fontSize2
      );
    } else {
      $gameScreen.setDTextPicture(
        `\\f[b]\\oc[2]\\f[i]Total ${valueTotalDamageCount2} hits,\\C[10]${damageText}\\C[17] damage!\\C[0]`,
        fontSize2
      );
    }
    $gameScreen.showPicture(pictureId, "", 0, pictureX - 50, pictureY, 100, 100, 100, 0);
    $gameScreen.movePicture(pictureId, 0, pictureX, pictureY, 100, 100, 255, 0, 20);
  };

  // Replaces (1x): CommonEvents.json:common-event:150|トータルダメージ表示変数
  AGH_showPictureTotalDamageDisplay = function () {
    let fontSize2, pictureX;
    const pictureId = 96;
    const gameVariableValue = $gameVariables.value(330);
    const totalDamage = gameVariableValue;
    const totalDamageText = totalDamage.toLocaleString();
    fontSize2 = 50;
    if (gameVariableValue <= 9999) {
      fontSize2 = 45;
    }
    if (gameVariableValue >= 100000) {
      fontSize2 = 55;
    }
    $gameScreen.setDTextPicture(
      `\\f[b]\\oc[22]\\f[i]Total,\\C[10]${totalDamageText}\\C[17]Damage!\\C[0]`,
      fontSize2
    );
    if ($gameVariables.value(276) == 2) {
      pictureX = 850;
    } else {
      pictureX = 850;
    }
    $gameScreen.showPicture(pictureId, "", 0, pictureX - 50, 50, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 0, pictureX, 50, 100, 100, 255, 0, 20);
  };

  // Replaces (1x): CommonEvents.json:common-event:159|露出限界判定時内部処理
  AGH_iterateActorsTachiePicId = function () {
    const pictureId = Number(
      $dataActors[$gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID)].meta["tachiePicId"]
    );
    const picture2 = $gameScreen.picture(pictureId);
    const picture = picture2._x - 600;
    const pictureY = picture2._y;
    const scaleX = picture2._scaleX;
    const scaleY = picture2._scaleY;
    $gameScreen.movePicture(
      pictureId,
      1,
      picture,
      pictureY,
      scaleX,
      scaleY,
      $gameVariables.value(109),
      0,
      120
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:159|露出限界判定時内部処理
  AGH_setSelfVariableEntryName = function (interp) {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const actor = $gameActors.actor(selectedActorId);
    $gameVariables.setValue(49, actor.name());
    const randomWork = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    const nameWord = randomWork[0];
    $gameMessage.add(`\\nw[\\V[49]]${nameWord}`);
    const faceFileName = selectedActorId + "Actor" + randomWork[1];
    $gameMessage.setFaceImage(faceFileName, randomWork[2]);
    interp.setWaitMode("message");
  };

  // Replaces (1x): CommonEvents.json:common-event:159|露出限界判定時内部処理
  AGH_setVariableRandomWork1ExposureLimitInternal = function () {
    const variableText = "\\V[49]";
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    const randomWorkValue = `${variableText}は\x1bIIN[${processedEntryId}]に着替えた。`;
    //CommonPopupManager.showInfo({},variable19Value,null);
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_1, randomWorkValue);
  };

  // Replaces (1x): CommonEvents.json:common-event:160|立ち絵処理
  AGH_pluginCommandPCALLCEREMOVE = function (interp) {
    const args = new Array(String(getPreviousTachiePicId()));
    interp.pluginCommand("P_CALL_CE_REMOVE", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:161|主人公先頭グラ指定コモン
  AGH_iterateActorsOtherCharaChip = function (interp) {
    const gameVariableValue = $gameVariables.value(HELPER_VARIABLE.VIEWPOINT_ACTOR_ID);
    const actorData = $dataActors[gameVariableValue];
    const characterName2 = actorData.meta["OtherCharaChip"].split(",")[0];
    const variable11Value2 = Number(actorData.meta["OtherCharaChip"].split(",")[1]);

    interp.character(-1).forceMoveRoute({
      list: [
        { code: 41, parameters: [characterName2, variable11Value2] },
        { code: 38 },
        { code: 29, parameters: [4] },
        { code: 31 },
        { code: 33 },
        { code: 0 }
      ]
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:165|装着衣装一覧
  AGH_setSelfVariableDressChangeCostume = function (interp) {
    //装着衣装計上1
    const list = [37, 32, 35, 36, 29, 28, 26, 24, 17, 25, 23, 22, 21, 20, 11, 14, 7, 27, 18];
    list.forEach(function (id) {
      for (let i = 1101; i < $dataItems.length; i++) {
        const itemData = $dataItems[i];
        if (
          id + 460 == Number(itemData.meta["ClothSwitch"]) + 460 &&
          $gameVariables.value(id + 460) == Number(itemData.meta["ClothAllocationNumber"])
        ) {
          if (
            Number(itemData.meta["EICSwitch"]) == 200 ||
            $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) ==
              Number(itemData.meta["EICSwitch"]) - 180
          ) {
            this.sVal(519, $gameVariables.value(519) + `${itemData.name}\n`);
          }
        }
      }
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:166|着せ替え
  AGH_showPictureActorChoiceDressUp = function () {
    let outfitPictureVariant;
    const pictureId = 6;
    if ($gameSwitches.value(204)) {
      outfitPictureVariant = 1;
    } else {
      outfitPictureVariant = 2;
    }
    if ($gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID)).isStateAffected(61)) {
      outfitPictureVariant = 3;
    }
    const pictureName = "Scene_Dress up" + outfitPictureVariant;
    //ScreenBlackOut is a dead verbatim leftover: nothing uses it here
    //const ScreenBlackOut = "ScreenBlackOut";
    $gameScreen.showPicture(pictureId, pictureName, 1, 640, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 220, 0, 60);
    $gameScreen.showPicture(pictureId + 4, pictureName, 1, 640, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId + 4, 1, 640, 384, 100, 100, 150, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
  AGH_setVariableRandomWork10 = function (endExclusive = 100, destinationVariableId = 30) {
    for (let entryIndex = 1; entryIndex < endExclusive; entryIndex++) {
      if (valueRandomSet[entryIndex] == $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID)) {
        $gameVariables.setValue(destinationVariableId, entryIndex - 1);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
  AGH_iterateItemsClothType = function (interp) {
    const value = 460;
    const messageText = "通常";
    for (let i = 1101; i < $dataItems.length; i++) {
      const itemData = $dataItems[i];
      if (itemData.meta["ClothType"] === messageText) {
        if (
          $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) + 380 ==
            Number(itemData.meta["EICSwitch"]) ||
          $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) + 180 ==
            Number(itemData.meta["EICSwitch"]) ||
          200 == Number(itemData.meta["EICSwitch"]) ||
          400 == Number(itemData.meta["EICSwitch"])
        ) {
          if (
            itemData.meta["subCategory"] ===
            $dataItems[$gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID)].meta["subCategory"]
          ) {
            const itemMeta = Number(itemData.meta["ClothSwitch"]);
            const clothAllocationNumber = Number(itemData.meta["ClothAllocationNumber"]);
            $gameVariables.setValue(value + itemMeta, clothAllocationNumber);
          }
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
  AGH_readVariableItemProcessWorkDressUpInterior = function (interp) {
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    const processedItemMeta = $dataItems[processedEntryId].meta;
    const clothType = processedItemMeta["ClothType"];
    const clothSubCategory = processedItemMeta["subCategory"];
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    // Entries belong to this actor when their EICSwitch names one of these slots.
    const ownEicSwitches = [
      selectedActorId + ACTOR_RECORD_VARIABLE_BASE,
      selectedActorId + ACTOR_SWIMSUIT_RECORD_BASE,
      200,
      400
    ];

    for (let itemId = 1111; itemId < $dataItems.length; itemId++) {
      const itemData = $dataItems[itemId];
      if (itemData.meta["ClothType"] !== clothType) continue;
      if (!ownEicSwitches.includes(Number(itemData.meta["EICSwitch"]))) continue;
      if (itemData.meta["subCategory"] !== clothSubCategory) continue;
      const clothSwitch = Number(itemData.meta["ClothSwitch"]);
      const clothAllocationNumber = Number(itemData.meta["ClothAllocationNumber"]);
      $gameVariables.setValue(CURRENT_OUTFIT_VARIABLE_BASE + clothSwitch, clothAllocationNumber);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
  AGH_iterateItemsClothSwitch = function (interp) {
    const variableId = 460;
    const clothSwitch = Number(
      $dataItems[$gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID)].meta["ClothSwitch"]
    );
    const variable19Value2 = Number(
      $dataItems[$gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID)].meta["ClothAllocationNumber"]
    );
    if ($gameVariables.value(variableId + clothSwitch) == variable19Value2) {
      $gameVariables.setValue(variableId + clothSwitch, 0);
    } else {
      $gameVariables.setValue(variableId + clothSwitch, variable19Value2);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
  AGH_setVariableMessageWindowWidth = function () {
    const pictureId = Number(
      $dataActors[$gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID)].meta["tachiePicId"]
    );
    const picture2 = $gameScreen.picture(pictureId);
    $gameVariables.setValue(311, picture2.origin());
    $gameVariables.setValue(312, picture2.x());
    $gameVariables.setValue(313, picture2.y());
    $gameVariables.setValue(314, picture2.scaleX());
    $gameVariables.setValue(315, picture2.scaleY());
    $gameVariables.setValue(316, picture2.opacity());
  };

  // Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
  AGH_movePictureItemProcessWork = function () {
    const pictureId = Number(
      $dataActors[$gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID)].meta["tachiePicId"]
    );
    let pictureXOffset = 200;
    if ($gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID) == clothSlideUp) {
      pictureXOffset = -200;
    }
    $gameScreen.movePicture(
      pictureId,
      $gameVariables.value(311),
      $gameVariables.value(312),
      $gameVariables.value(313) + pictureXOffset,
      $gameVariables.value(314),
      $gameVariables.value(315),
      $gameVariables.value(316),
      0,
      60
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
  AGH_showTickerMessage = function () {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const outfitPresets = $gameVariables.value(HELPER_VARIABLE.OUTFIT_PRESETS);
    const outfitName = outfitPresets[selectedActorId][valueCountSet1][50];
    const actor2 = $gameActors.actor(21);
    const actorName = actor2.name();
    const actor21Name = `${outfitName}の名称を${actorName}に変更しました。`;
    TickerManager.show(actor21Name);
    outfitPresets[selectedActorId][valueCountSet1][50] = actor2.name();
  };

  // Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
  AGH_readVariableActorChoiceDressUpInterior = function () {
    const start = 0;
    const end = 41;
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const outfitPresets = $gameVariables.value(HELPER_VARIABLE.OUTFIT_PRESETS);
    for (let i = start; i <= end; i++) {
      outfitPresets[selectedActorId][valueCountSet1][i] = $gameVariables.value(selectedActorId + 440)[i];
    }
    outfitPresets[selectedActorId][valueCountSet1][49] = 1;
    const outfitName = outfitPresets[selectedActorId][valueCountSet1][50];
    const messageText = `現在の衣装状態を${outfitName}に登録しました。`;
    TickerManager.show(messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
  // OUTFIT_PRESETS[actorId][slot] keeps the worn outfit id at index 50 and the
  // "already unlocked" flag at index 49. Slots 1..4 map to work variables 21..24 and
  // to four separate choice switches (the first two have named constants).
  const OUTFIT_SLOT_WEAR_INDEX = 50;
  const OUTFIT_SLOT_UNLOCKED_INDEX = 49;
  const OUTFIT_SLOT_3_SWITCH_ID = 163;
  const OUTFIT_SLOT_4_SWITCH_ID = 164;

  AGH_setSwitchRandomWork1 = function () {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const outfitSlots = $gameVariables.value(
      HELPER_VARIABLE.OUTFIT_PRESETS
    )[selectedActorId];
    const slotTargets = [
      { slot: 1, variableId: HELPER_VARIABLE.RANDOM_WORK_1, switchId: HELPER_SWITCH.CHOICE_1_ENABLED },
      { slot: 2, variableId: HELPER_VARIABLE.RANDOM_WORK_2, switchId: HELPER_SWITCH.CHOICE_2_ENABLED },
      { slot: 3, variableId: HELPER_VARIABLE.RANDOM_WORK_3, switchId: OUTFIT_SLOT_3_SWITCH_ID },
      { slot: 4, variableId: HELPER_VARIABLE.RANDOM_WORK_4, switchId: OUTFIT_SLOT_4_SWITCH_ID }
    ];

    // The original wrote the four work variables first and turned the switches on
    // afterwards, so the two passes are kept apart.
    slotTargets.forEach(function (target) {
      const wornOutfitId = outfitSlots[target.slot][OUTFIT_SLOT_WEAR_INDEX];
      $gameVariables.setValue(target.variableId, wornOutfitId);
    });
    slotTargets.forEach(function (target) {
      const isUnlocked = outfitSlots[target.slot][OUTFIT_SLOT_UNLOCKED_INDEX] == 1;
      if (isUnlocked) $gameSwitches.setValue(target.switchId, true);
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
  AGH_setVariableActorChoiceDressUpInterior = function () {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    // OUTFIT_PRESETS[actorId][valueCountSet1] is the preset row the player picked;
    // 440 + actorId is the [NoReset] actor outfit record and 348 the heroine graphic
    // outfit list that remembers the same slot 41 value.
    const outfitPresetRow =
      $gameVariables.value(HELPER_VARIABLE.OUTFIT_PRESETS)[selectedActorId][valueCountSet1];
    const actorOutfitRecord = $gameVariables.value(selectedActorId + ACTOR_OUTFIT_RECORD_BASE);
    const heroineGraphicOutfits = $gameVariables.value(HEROINE_GRAPHIC_OUTFIT_VARIABLE);

    actorOutfitRecord[OUTFIT_GRAPHIC_SLOT_INDEX] = outfitPresetRow[OUTFIT_GRAPHIC_SLOT_INDEX];
    heroineGraphicOutfits[selectedActorId] = actorOutfitRecord[OUTFIT_GRAPHIC_SLOT_INDEX];
    actorOutfitRecord[0] = outfitPresetRow[0];
    copyOutfitSlotsToWorkVariables(outfitPresetRow);
  };

  // Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
  AGH_setVariableChoicePosition = function () {
    return AGH_setVariableRandomWork10(200, 12);
  };

  // Replaces (1x): CommonEvents.json:common-event:172|星晶獣選択
  AGH_readVariableItemProcessWorkStarBeastSelect = function () {
    valueCountSet1 = 2;
    valueCountSet2 = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    item_oneOffBuy(1, valueCountSet1, valueCountSet2, 1);
  };

  // Replaces (1x): CommonEvents.json:common-event:174|一括売却対象指定
  AGH_showWindowTextBulkSellTargetSelect = function () {
    WindowManager.show(0, 0, 0, 984, 80);
    const messageText = "";
    //var value7 = `\\FS[25]対象を選択して下さい　　　　　　　　　　　　　　　　　　　　　　　　　　　`;
    WindowManager.drawText(0, messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:174|一括売却対象指定
  AGH_initValueCountArray2 = function () {
    valueWordArray = [];
    valueCountArray = [];
    valueCountArray2 = [];
  };

  // Replaces (1x): CommonEvents.json:common-event:174|一括売却対象指定
  AGH_initValueCountArray = function () {
    valueWordArray = [];
    valueCountArray = [];
  };

  // Replaces (1x): CommonEvents.json:common-event:174|一括売却対象指定
  AGH_readVariableItemProcessWorkBulkSellTargetSelect = function () {
    //verbatim dead extraction: the local was never read by this event
    //const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
  };

  // Replaces (1x): CommonEvents.json:common-event:174|一括売却対象指定
  AGH_showWindowTextRandomWork10 = function () {
    // Variable 30 selects the list type; valueCountArray2 holds one type per entry.
    const listTypeId = valueCountArray2[$gameVariables.value(30)];
    const databaseList = BULK_SELL_DATABASE_GETTERS[numericCaseValue(listTypeId)]();
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    const databaseEntry = databaseList[processedEntryId];
    const itemLabel = `\x1bI[${databaseEntry.iconIndex}]${databaseEntry.name}`;
    const wasRegistered = toggleBulkSellRegistration(processedEntryId, listTypeId);
    const resultText = wasRegistered
      ? "の一括売却対象指定を解除しました"
      : "を一括売却対象指定に登録しました";
    WindowManager.drawText(0, itemLabel + resultText);
  };

  // Replaces (1x): CommonEvents.json:common-event:174|一括売却対象指定
  // The bulk-sell toggle works on one of three database lists, picked by
  // valueCountSet2 (0 = items, 1 = weapons, 2 = armors).
  const BULK_SELL_DATABASE_GETTERS = [
    function () {
      return $dataItems;
    },
    function () {
      return $dataWeapons;
    },
    function () {
      return $dataArmors;
    }
  ];
  const BULK_SELL_SELF_SWITCH_ID = 4;
  const BULK_SELL_SELF_SWITCH_FIRST_ENTRY = 11;

  // Flips the "sell in bulk" registration of one database entry and reports whether
  // it was registered before the call.
  function toggleBulkSellRegistration(processedEntryId, listTypeId) {
    const selfSwitchKey = [
      BULK_SELL_SELF_SWITCH_ID,
      BULK_SELL_SELF_SWITCH_FIRST_ENTRY + listTypeId,
      processedEntryId
    ];
    const wasRegistered = $gameSelfSwitches.getVariableValue(selfSwitchKey) == 1;
    $gameSelfSwitches.setVariableValue(selfSwitchKey, wasRegistered ? 0 : 1);
    return wasRegistered;
  }

  AGH_showWindowTextItemProcessWork = function () {
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    // An unknown list id keeps the original failure: the getter is missing.
    const databaseList = BULK_SELL_DATABASE_GETTERS[numericCaseValue(valueCountSet2)]();
    const databaseEntry = databaseList[processedEntryId];
    const itemLabel = `\x1bI[${databaseEntry.iconIndex}]${databaseEntry.name}`;
    const wasRegistered = toggleBulkSellRegistration(processedEntryId, valueCountSet2);
    const resultText = wasRegistered
      ? "の一括売却対象指定を解除しました"
      : "を一括売却対象指定に登録しました";
    WindowManager.drawText(0, itemLabel + resultText);
  };

  // Replaces (1x): CommonEvents.json:common-event:175|一括売却実行
  AGH_initValueWordSet0 = function () {
    const soldKindCount = valueCountSet3; //件数合計
    const soldItemCount = valueCountSet4.toLocaleString(); //個数累計
    const soldGoldTotal = valueCountSet5.toLocaleString(); //金額合計
    const weaponTotalLabel = valueCountSet6.toLocaleString(); //変数57合計
    const itemTotalLabel = valueCountSet7.toLocaleString(); //ｱｲﾃﾑID270合計

    const resultHeading = colorTaggedText(16, "<一括売却結果>");
    const kindCountText = colorTaggedText(2, `${soldKindCount}種`);
    const itemCountText = colorTaggedText(3, `${soldItemCount}個`);
    // NOTE: the original wrote "\\G" inside a template literal, which evaluates to a
    // plain "G"; the rendered text is kept byte-identical on purpose. Replace with
    // the gold marker only after checking every consumer of valueWordSet0.
    const goldTotalText = colorTaggedText(10, soldGoldTotal + "G");
    valueWordSet0 = `${resultHeading} ${kindCountText} ${itemCountText} ${goldTotalText}`;
    if (!(valueCountSet6 >= 1 || valueCountSet7 >= 1)) return;

    valueWordSet0 += "\n";
    if (valueCountSet6 >= 1) {
      valueWordSet0 += `${$dataSystem.variables[57]}:${weaponTotalLabel} `;
    }
    if (valueCountSet7 >= 1) {
      valueWordSet0 += `\\IIN[270]:${itemTotalLabel} `;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  AGH_setDTextPictureTrainingDollPreset = function () {
    const trainingDollSettings = $gameVariables.value(HELPER_VARIABLE.TRAINING_DOLL_SETTINGS);
    if (!trainingDollSettings) return;
    const damageIcon = `\\I[75]`;
    const displayedDamage = trainingDollSettings[10];
    $gameScreen.setDTextPicture(`ダメージ一覧<${damageIcon}:${displayedDamage}>　　`, 28);
    let totalDamage = 0;
    for (let actorId = 1; actorId <= 20; actorId++) {
      const damage = trainingDollSettings[actorId + 10];
      if (!(damage >= 2)) continue;
      const actor = $gameActors.actor(actorId);
      if (!actor) continue;
      const actorName = actor.name();
      const damageText = damage.toLocaleString();
      $gameScreen.setDTextPicture(`${actorName}:${damageText}`, 28);
      totalDamage += damage;
    }
    const totalDamageText = totalDamage.toLocaleString();
    $gameScreen.setDTextPicture(`トータル:${totalDamageText}`, 28);
  };

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  AGH_showPictureTrainingDollSetup = function () {
    const pictureId = 100;
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(pictureId, "", 0, 10 + 50, 10, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 0, 10, 10, 100, 100, 255, 0, 20);
  };

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  AGH_setVariableActorChoiceTrainingDollSetup = function () {
    const trainingPresetIndex = 1;
    for (let i = 1; i <= 7; i++) {
      if (!($gameVariables.value(HELPER_VARIABLE.TRAINING_DOLL_SETTINGS)[trainingPresetIndex] == i)) continue;

      const trainingPresetValue = $gameVariables.value(HELPER_VARIABLE.TRAINING_DOLL_SETTINGS)[
        trainingPresetIndex
      ];
      $gameVariables.setValue(
        20 + trainingPresetIndex,
        `\x1bI[${$dataStates[trainingPresetValue + 50].iconIndex}]`
      );
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  // Training doll presets: the label written into the actor-choice variable and the
  // skill the doll uses. Values outside this table leave the doll untouched.
  const TRAINING_DOLL_ENEMY_ID = 51;
  const TRAINING_DOLL_ACTIONS = {
    1: { label: "行動しない", skillId: 892 },
    2: { label: "攻撃", skillId: 1 },
    3: { label: "防御", skillId: 2 },
    4: { label: "命乞い", skillId: 892 }
  };

  AGH_setVariableActorChoice_2 = function () {
    const trainingPresetIndex = 2;
    const trainingPresetValue = $gameVariables.value(
      HELPER_VARIABLE.TRAINING_DOLL_SETTINGS
    )[trainingPresetIndex];
    const dollAction = TRAINING_DOLL_ACTIONS[numericCaseValue(trainingPresetValue)];
    // The original loop let values outside 1..4 fall through without changing anything.
    if (!dollAction) return;
    $gameVariables.setValue(20 + trainingPresetIndex, dollAction.label);
    $dataEnemies[TRAINING_DOLL_ENEMY_ID].actions[0].skillId = dollAction.skillId;
  };

  // Indices 3..5 of TRAINING_DOLL_SETTINGS are copied verbatim into the actor-choice
  // variables 23..25; the label conversion already happened for indices 1..2.
  const TRAINING_DOLL_FIRST_RAW_CHOICE_INDEX = 3;
  const TRAINING_DOLL_LAST_RAW_CHOICE_INDEX = 5;

  function writeTrainingDollChoiceVariable(trainingPresetIndex) {
    $gameVariables.setValue(
      20 + trainingPresetIndex,
      $gameVariables.value(HELPER_VARIABLE.TRAINING_DOLL_SETTINGS)[trainingPresetIndex]
    );
  }

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  AGH_setVariableActorChoice_3 = function () {
    // Indices 3..5 keep the raw settings; only the label conversion differs elsewhere.
    for (
      let trainingPresetIndex = TRAINING_DOLL_FIRST_RAW_CHOICE_INDEX;
      trainingPresetIndex <= TRAINING_DOLL_LAST_RAW_CHOICE_INDEX;
      trainingPresetIndex++
    ) {
      writeTrainingDollChoiceVariable(trainingPresetIndex);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  AGH_setVariableActorChoice_4 = function () {
    const trainingPresetIndex = 6;
    for (let i = 0; i <= 20; i++) {
      if (!($gameVariables.value(HELPER_VARIABLE.TRAINING_DOLL_SETTINGS)[trainingPresetIndex] == i)) continue;

      if (i == 0) {
        $gameVariables.setValue(20 + trainingPresetIndex, "種族未設定");
      }
      if (i >= 1) {
        const stateData = $dataStates[i + 420];
        $gameVariables.setValue(20 + trainingPresetIndex, `\x1bI[${stateData.iconIndex}]${stateData.name}`);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  AGH_iterateItemsTrainingDollSetup = function () {
    //trainingPresetIndex is a dead verbatim leftover: the loop uses i
    //const trainingPresetIndex = 6;
    for (let i = 1; i <= 19; i++) {
      if ($gameParty.hasItem($dataItems[i + 340])) {
        const stateData = $dataStates[i + 420];
        const messageText = `\x1bI[${stateData.iconIndex}]${stateData.name}`;
        const choiceValue = i;
        const id = 1;
        const choiceParams = {
          text: messageText,
          value: choiceValue
        };
        $gameSystem.addCustomChoice(id, choiceParams);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  AGH_setVariableActorChoice_5 = function () {
    const trainingPresetIndex = 6;
    $gameVariables.value(HELPER_VARIABLE.TRAINING_DOLL_SETTINGS)[trainingPresetIndex] =
      $gameVariables.value(31);
    if ($gameVariables.value(HELPER_VARIABLE.TRAINING_DOLL_SETTINGS)[trainingPresetIndex] == 0) {
      $gameVariables.setValue(20 + trainingPresetIndex, "種族未設定");
    }
    if ($gameVariables.value(HELPER_VARIABLE.TRAINING_DOLL_SETTINGS)[trainingPresetIndex] >= 1) {
      const stateData = $dataStates[i + 420];
      $gameVariables.setValue(20 + trainingPresetIndex, `\x1bI[${stateData.iconIndex}]${stateData.name}`);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  AGH_readVariableTrainingDollPreset = function () {
    //trainingPresetIndex/trainingPresetValue are only read by the commented debug log below
    //const trainingPresetIndex = 6;
    //const trainingPresetValue = $gameVariables.value(HELPER_VARIABLE.TRAINING_DOLL_SETTINGS)[
    //  trainingPresetIndex
    //];
    //console.log(`${variable293Value}`);
  };

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  AGH_iterateBattleMembersTrainingDollSetup = function () {
    let actor;
    valueTrialJustBeforeTP = Array(21).fill(0);
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length; i++) {
      const battleMember = battleMembers2[i].actorId();
      actor = $gameActors.actor(battleMember);
      valueTrialJustBeforeTP[battleMember] = actor.tp;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  AGH_readVariableTrainingDollPresetTrainingDollSetup = function () {
    const trainingDollSettings = $gameVariables.value(HELPER_VARIABLE.TRAINING_DOLL_SETTINGS);
    for (let i = 11; i <= 30; i++) {
      trainingDollSettings[i] = 0;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
  AGH_iterateBattleMembersTrainingDollSetup_2 = function () {
    let actor;
    valueTrialJustBeforeTP = Array(21).fill(0);
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length; i++) {
      const battleMember = battleMembers2[i].actorId();
      actor = $gameActors.actor(battleMember);
      actor.gainTp(-1000);
      actor.gainTp(valueTrialJustBeforeTP[battleMember]);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:177|監禁,奴隷化コモン
  AGH_readVariableCashInItem = function () {
    if ($gameVariables.value(316)[0] != 0) {
      item_confinementScript(0);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
  AGH_showWindowTitleText = function (setH) {
    let messageText = "[発動中の称号効果]" + "\n";
    let variableId = 288;
    if (setH && $gameSwitches.value(105)) {
      messageText = "[発動中のＨな称号効果]" + "\n";
      variableId = 294;
    }
    const maxId = $gameVariables.value(variableId + 1);
    const ids = $gameVariables.value(variableId);
    for (let i = 0; i < maxId; i++) {
      const titleText = ids[i];
      if (titleText == 0) {
        messageText += "Empty" + "\n";
      } else {
        messageText += colorTaggedText(16, `\x1bIIN[${titleText}]`) + "\n";
      }
    }
    const scaleY = maxId * 48 + 48;
    WindowManager.show(1, 740, 96 + 14, 540, scaleY);
    WindowManager.drawText(1, messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
  AGH_showWindowHTitleText = function () {
    AGH_showWindowTitleText(true);
  };

  // Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
  AGH_addCustomTitleChoice = function (setH) {
    let text;
    const variableId = setH && $gameSwitches.value(105) ? 294 : 288;
    const maxId = $gameVariables.value(variableId + 1);
    const ids = $gameVariables.value(variableId);
    for (let i = 0; i < maxId; i++) {
      const itemId = ids[i];
      if (itemId == 0) {
        text = "Empty";
      } else {
        text = $dataItems[itemId].name;
      }
      const choiceParams = { text: text, value: i };
      $gameSystem.addCustomChoice(1, choiceParams);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
  AGH_addCustomHTitleChoice = function () {
    AGH_addCustomTitleChoice(true);
  };

  // Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
  AGH_setLeaderTitleId = function (setH) {
    const index = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    const id = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    const variableId = setH && $gameSwitches.value(105) ? 294 : 288;
    $gameVariables.value(variableId)[index] = id == 601 ? 0 : id;
  };

  // Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
  AGH_setLeaderHTitleId = function () {
    AGH_setLeaderTitleId(true);
  };

  // Replaces (1x): CommonEvents.json:common-event:180|種族討伐数表示
  AGH_setupDefeatCountDisplay = function () {
    const gameVariableValue = $gameVariables.value(52);
    for (let i = 0; i <= gameVariableValue.length - 1; i++) {
      if (gameVariableValue[i] < 1) continue;

      let defeatedMonstersMsg = `\x1bSIM[${i}]`;
      switch (i) {
        case 1:
          defeatedMonstersMsg = "当日魔物";
          break;
        case 2:
          defeatedMonstersMsg = "総魔物";
          break;
      }
      const defeatedMonstersCnt = gameVariableValue[i];
      valueIkkatuArray.push([defeatedMonstersMsg, defeatedMonstersCnt, 0, 0, 0]);
      valueCountSet1 += 1;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:181|通常クエスト受注
  AGH_resetValueCountArray = function () {
    valueWordArray = [];
    valueCountArray = [];
    valueCountSet1 = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:183|本屋コモン
  AGH_resetValueScriptArray1 = function () {
    valueScriptArray1 = [1, 2];
    valueCountSet3 = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:183|本屋コモン
  AGH_resetValueScriptArray1BookstoreCommon = function () {
    valueScriptArray1 = [1];
    valueCountSet3 = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:183|本屋コモン
  AGH_gainItemItemProcessWork = function () {
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    const itemData = $dataItems[processedEntryId];
    const discountRate = valueCountSet3;
    const basePrice = itemData.price;
    const goldAmount =
      discountRate != 0
        ? Math.floor(basePrice - (basePrice * discountRate) / 100)
        : basePrice;
    let resultMessage;
    if ($gameParty.gold() >= goldAmount) {
      $gameParty.gainItem(itemData, 1);
      $gameParty.loseGold(goldAmount);
      AudioManager.playSe({ name: "Shop1", volume: 90, pitch: 100, pan: 0 });
      const itemIconName = `\x1bIIN[${processedEntryId}]`;
      const itemLabel = colorTaggedText(2, itemIconName);
      resultMessage = `${itemLabel}を購入しました。`;
    } else {
      resultMessage = "所持金が足りなかった…。";
    }
    TickerManager.show(resultMessage);
  };

  // Replaces (1x): CommonEvents.json:common-event:183|本屋コモン
  AGH_resetValueScriptArray1_2 = function () {
    valueCountSet1 = 0;
    valueCountSet2 = 0; //件数
    valueCountSet3 = 0; //割引率
    valueScriptArray1 = [];
  };

  // Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
  AGH_setVariableRandomWork2 = function () {
    let secondaryWorkValue;
    secondaryWorkValue = 109;
    if ($gameSwitches.value(203)) {
      secondaryWorkValue = 110;
    }
    if ($gameSwitches.value(205)) {
      secondaryWorkValue = 111;
    }
    if ($gameSwitches.value(207)) {
      secondaryWorkValue = 112;
    }
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, secondaryWorkValue);
  };

  // Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
  AGH_setVariableRandomWork2WaterDrawingCommon = function () {
    // The dungeon info item wins over the town info weapon when both are set.
    let infoItemData;
    const townInfoItemId = $gameVariables.value(HELPER_VARIABLE.TOWN_INFO_ITEM_ID);
    if (townInfoItemId >= 1) infoItemData = $dataWeapons[townInfoItemId];
    const dungeonInfoItemId = $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID);
    if (dungeonInfoItemId >= 1) infoItemData = $dataItems[dungeonInfoItemId];
    if (!infoItemData) return;
    if (!infoItemData.meta["getWaterItem"]) return;
    $gameVariables.setValue(
      HELPER_VARIABLE.RANDOM_WORK_2,
      Number(infoItemData.meta["getWaterItem"])
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
  AGH_setVariableRandomWork2GetWaterItem = function () {
    if ($dataMap.meta["getWaterItem"]) {
      $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, Number($dataMap.meta["getWaterItem"]));
    }
  };

  // Water can be drawn on terrain tag 3 and on region ids 3 and 16.
  const WATER_DRAWING_TERRAIN_TAGS = [3];
  const WATER_DRAWING_REGION_IDS = [3, 16];

  // Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
  AGH_setSwitchTemporarySwitchWaterDrawingCommon = function () {
    // The flag starts off and is switched on by whichever water rule matches.
    $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, false);
    // Recomputes valueDirectionPointX/Y for the tile the player faces.
    event_charaDirectionPoint($gamePlayer, 2);
    const terrainTag = $gameMap.terrainTag(valueDirectionPointX, valueDirectionPointY);
    if (WATER_DRAWING_TERRAIN_TAGS.includes(terrainTag)) {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
    }
    const regionId = $gameMap.regionId(valueDirectionPointX, valueDirectionPointY);
    if (WATER_DRAWING_REGION_IDS.includes(regionId)) {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
  AGH_setSwitchTemporarySwitch_2 = function () {
    const secondaryWorkValue = 1162; //中央森林
    if (!($gameMap.regionId(valueDirectionPointX, valueDirectionPointY) == 101)) return;

    $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, secondaryWorkValue);
  };

  // Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
  AGH_setSwitchTemporarySwitch_3 = function () {
    const secondaryWorkValue = 111;
    // Both regions take water the same way; only the region id differs.
    const regionId = $gameMap.regionId(valueDirectionPointX, valueDirectionPointY);

    switch (regionId) {
      case 102:
        $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
        $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, secondaryWorkValue);
        break;
      case 103:
        $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
        $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, secondaryWorkValue);
        break;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
  AGH_setVariableDynamicEventId = function (interp) {
    $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    const posX = valueDirectionPointX;
    const posY = valueDirectionPointY;
    goodsEvent_respawn(0, "Goods4", 4, 2, 0, posX, posY);
    valueCountSet9 = interp._eventId;
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[0];
  };

  // Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
  AGH_gainItemRandomWork2 = function () {
    const itemAmount = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    $gameParty.loseItem($dataItems[108], itemAmount);
    const secondaryWorkValue = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_2);
    $gameParty.gainItem($dataItems[secondaryWorkValue], itemAmount);
    const displayText = `\x1bIIN[${secondaryWorkValue}]`;
    const coloredText = colorTaggedText(3, `${itemAmount}`);
    const itemName = "\u001bIIN[108]";
    const coloredText2 = colorTaggedText(10, `-${itemAmount}`);
    const messageText = `${displayText}を${coloredText}個獲得！（${itemName}${coloredText2}個）`;
    TickerManager.show(messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:185|その他ショップ処理
  AGH_initArray = function () {
    array = [];
    bookShop_preparert2(0, 3, 1);
  };

  // Replaces (1x): CommonEvents.json:common-event:186|娼館処理
  AGH_readVariableBrothelProcessing = function () {
    const actorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const gameVariableValue = $gameVariables.value(actorId + 380);
    if (!gameVariableValue || gameVariableValue[27] < 1) return;

    const displayedAmount = gameVariableValue[27];
    const earningsUnit = $gameVariables.value(827);
    const messageText = fontSize(25) + `売春総獲得額:${displayedAmount}回${earningsUnit}`;
    TickerManager.show(messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:187|追剥コモン
  AGH_showInfo = function () {
    value1 = "既に事切れているようだ…。";
    CommonPopupManager.showInfo({}, value1, null);
  };

  // Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
  AGH_setSwitchWalletIn = function () {
    $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, false);
    for (let i = 1; i <= $dataItems.length - 1; i++) {
      const itemData = $dataItems[i];
      if (itemData.meta["walletIn"]) {
        if ($gameParty.hasItem(itemData, true)) {
          $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, true);
          break;
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
  // Both guild helpers write "<label>＜ON|OFF＞" into a scratch work variable; they
  // only differ in the label, the switch they read and the variable they write.
  function writeAutoDailyQuestLabel(variableId, labelText, switchId) {
    const stateMark = $gameSwitches.value(switchId) ? ON_MARK : OFF_MARK;
    $gameVariables.setValue(variableId, `${labelText}＜${stateMark}＞`);
  }

  AGH_setVariableRandomWork1GuildCommon = function () {
    writeAutoDailyQuestLabel(
      HELPER_VARIABLE.RANDOM_WORK_1,
      "デイリークエスト自動受注",
      HELPER_SWITCH.DAILY_AUTO_ACCEPT
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
  AGH_setVariableRandomWork2GuildCommon = function () {
    writeAutoDailyQuestLabel(
      HELPER_VARIABLE.RANDOM_WORK_2,
      "デイリークエスト自動達成",
      HELPER_SWITCH.DAILY_AUTO_COMPLETE
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
  AGH_setSwitchGuildCommon = function () {
    if ($gameParty.hasItem($dataItems[693], true)) {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, true);
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, false);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
  AGH_gainItemWalletDeliveryCount = function () {
    let deliveredWalletCount = 0;
    let messageText = "拾得物\n";
    for (let itemId = 1; itemId < $dataItems.length; itemId++) {
      const item = $dataItems[itemId];
      if (!item || !item.meta || !item.meta.walletIn) continue;
      const itemCount = $gameParty.numItems(item);
      if (itemCount < 1) continue;
      deliveredWalletCount += itemCount;
      const itemName = `\x1bIIN[${itemId}]`;
      const quantityText = colorTaggedText(1, String(itemCount));
      messageText += `${itemName}:${quantityText}個\n`;
      $gameParty.loseItem(item, itemCount);
    }
    $gameParty.gainItem($dataItems[10], deliveredWalletCount);
    $gameVariables.setValue(
      HELPER_VARIABLE.WALLET_DELIVERY_COUNT,
      $gameVariables.value(HELPER_VARIABLE.WALLET_DELIVERY_COUNT) + deliveredWalletCount
    );
    const rewardItemName = "\x1bIIN[10]";
    const rewardQuantity = colorTaggedText(2, String(deliveredWalletCount));
    messageText += `${rewardItemName}:${rewardQuantity}個を謝礼として受け取った。\n`;
    valueTalkSet = [28, messageText];
  };

  // Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
  AGH_setSwitchDailyAutoOrder = function () {
    let messageText;
    if ($gameSwitches.value(HELPER_SWITCH.DAILY_AUTO_ACCEPT)) {
      $gameSwitches.setValue(HELPER_SWITCH.DAILY_AUTO_ACCEPT, false);
      messageText = "デイリークエストの自動受注をオフにしました。";
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.DAILY_AUTO_ACCEPT, true);
      messageText = "デイリークエストの自動受注をオンにしました。";
    }
    TickerManager.show(messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
  AGH_setSwitchDailyAutoComplete = function () {
    let messageText;
    if ($gameSwitches.value(HELPER_SWITCH.DAILY_AUTO_COMPLETE)) {
      $gameSwitches.setValue(HELPER_SWITCH.DAILY_AUTO_COMPLETE, false);
      messageText = "デイリークエストの自動達成報告をオフにしました。";
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.DAILY_AUTO_COMPLETE, true);
      messageText = "デイリークエストの自動達成報告をオンにしました。";
    }
    TickerManager.show(messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:192|未使用：情報屋選択肢
  AGH_iterateItemsSetJouhouGold = function () {
    let goldAmount;
    goldAmount = 1000;
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    const itemData = $dataItems[processedEntryId];
    if (itemData.meta["SetJouhouGold"]) {
      goldAmount = Number(itemData.meta["SetJouhouGold"]);
    }
    $gameParty.loseGold(goldAmount);
    const messageText = `-${goldAmount}\\G`;
    TickerManager.show(messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:192|未使用：情報屋選択肢
  AGH_gainItemItemProcessWorkUnusedInfoBrokerChoice = function () {
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    $gameParty.gainItem($dataItems[processedEntryId], 1);
    const displayText = `\x1bIIN[${processedEntryId}]`;
    const messageText = `エリア情報:${displayText}を購入した。`;
    TickerManager.show(messageText);
    $gamePlayer.requestAnimation(229);
  };

  // Replaces (1x): CommonEvents.json:common-event:195|動物処理バックアップ
  AGH_configureMapEventAnimalProcessingBackup = function () {
    const event = $gameMap.event(valueanimalEventId);
    event.requestAnimation(387);
  };

  // Replaces (1x): CommonEvents.json:common-event:195|動物処理バックアップ
  AGH_forceMoveRouteCharactersAnimalProcessingBackup = function (interp) {
    if (!(valueanimalEventId >= 1)) return;
    rollUnusedSpriteAngleOffset();
    forceMoveRoute(interp.character(valueanimalEventId), [
      { code: MOVE_COMMAND_SCRIPT, parameters: ["this.setAngle(value1);"] },
      { code: MOVE_COMMAND_SCRIPT, parameters: ["this.resetPattern();"] },
      { code: MOVE_COMMAND_SCRIPT, parameters: ["this._originalPattern = 1;"] },
      { code: MOVE_COMMAND_SCRIPT, parameters: ["this._priorityType = 0;"] },
      { code: MOVE_COMMAND_SCRIPT, parameters: ["this._spriteOffsetX += value2;"] },
      { code: MOVE_COMMAND_SCRIPT, parameters: ["this._spriteOffsetY += value2;"] },
      { code: MOVE_COMMAND_TURN_DOWN },
      { code: MOVE_COMMAND_TURN_LEFT },
      { code: MOVE_COMMAND_TURN_RIGHT },
      { code: MOVE_COMMAND_STEP_UP },
      { code: MOVE_COMMAND_STEP_LEFT }
    ]);
  };

  // Replaces (1x): CommonEvents.json:common-event:195|動物処理バックアップ
  AGH_characterRoute = function (interp) {
    interp._character = interp.character(valueanimalEventId);
    interp.setWaitMode("route");
  };

  // Replaces (1x): CommonEvents.json:common-event:195|動物処理バックアップ
  AGH_forceMoveRouteCharactersPeople2 = function (interp) {
    if (!(valueanimalEventId >= 1)) return;

    const character2 = interp.character(valueanimalEventId);
    character2.forceMoveRoute({
      list: [
        { code: 45, parameters: ["this.setScale(100, 100);"] },
        { code: 42, parameters: [255] },
        { code: 40 },
        { code: 41, parameters: ["People2", 1] },
        { code: 0 }
      ],
      repeat: false,
      skippable: true
    });
    interp._character = character2;
    interp.setWaitMode("route");
  };

  // Replaces (1x): CommonEvents.json:common-event:195|動物処理バックアップ
  AGH_forceMoveRouteCharactersAnimalProcessingBackup_2 = function (interp) {
    if (valueanimalEventId >= 1) {
      interp.character(valueanimalEventId).forceMoveRoute({
        list: [{ code: 15, parameters: [600] }, { code: 0 }],
        repeat: true,
        skippable: true
      });
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:196|ダンジョン雑魚で剥ぎ取り追いはぎコモンバックアップ
  AGH_forceMoveRouteCharactersSFEnemy2 = function (interp) {
    const eventId = valueEnemyEventId;
    const mapEvent = $gameMap.event(eventId);
    if (!!mapEvent) {
      mapEvent.forceMoveRoute({
        list: [
          { code: 36 },
          { code: 16 },
          { code: 41, parameters: ["SF_enemy2", 7] },
          { code: 45, parameters: ["this.setFace(6,true,true);"] },
          { code: 35 },
          { code: 0 }
        ],
        repeat: false,
        skippable: true
      });
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:199|全体マップ移動選択コモン
  AGH_setSelfSwitchWorldMapMoveSelectCommon = function () {
    for (let id = 50; id > 0; id--) {
      if (!!$gameMap.event(id)) {
        $gameSelfSwitches.setValue([$gameMap.mapId(), id, "C"], true);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:199|全体マップ移動選択コモン
  AGH_insertCallEventData = function (interp) {
    if ($callEventMap) {
      interp.insertCallEventData(23, 2);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:203|熟練度アップコモン
  AGH_showWindowTextProficiencyUpCommon = function () {
    WindowManager.show(0, 0, 700, 1280, 68);
    WindowManager.show(1, 0, 632, 1280, 68);
  };

  // Replaces (1x): CommonEvents.json:common-event:203|熟練度アップコモン
  AGH_showWindowTextRandomWork1 = function (interp) {
    const descriptionWindowWidth = 169; //例外アイテム名
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const actor = $gameActors.actor(selectedActorId);
    const itemId = $gameVariables.value(93);
    const item = $dataItems[itemId];
    if (itemId != descriptionWindowWidth) {
      $gameVariables.setValue(21, Number(item.meta["熟練度アップスキルタイプ"]));
    }
    $gameVariables.setValue(22, Number(item.meta["熟練度上昇値"]));
    const ownedItemCount = $gameParty.numItems(value);
    const gainedStat = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_2);
    const coloredStat = colorTaggedText(2, `${gainedStat}`);
    const actorName = actor.name();
    const itemIconName = `\x1bIIN[${itemId}]`;
    let messageText = `${itemIconName}（${ownedItemCount}）上昇値:${coloredStat}　対象:${actorName}`;
    if ($gameVariables.value(203) >= 2) {
      messageText += `\\C[10] * 2\\C[0]`;
    }
    WindowManager.drawText(0, messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:203|熟練度アップコモン
  AGH_readVariableItemProcessWorkProficiencyUpCommon = function () {
    if (valueCountSet1 == $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID)) {
      item_skilljukurenndoup(2);
    } else {
      item_skilljukurenndoup(1);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:203|熟練度アップコモン
  AGH_readVariableSkillUseId = function () {
    const item = $dataItems[$gameVariables.value(93)];
    const itemName = item.name;
    const messageText = `${itemName}の所持数が0になった為、使用画面を終了します。`;
    CommonPopupManager.showInfo({}, messageText, null);
  };

  // Replaces (1x): CommonEvents.json:common-event:210|アクター選択コモン
  AGH_movePictureActorChoice = function () {
    let pictureId;
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    pictureId = selectedActorId + 100;
    if (selectedActorId >= 2) {
      pictureId = 101 + (selectedActorId - 1) * 7;
    }
    $gameScreen.movePicture(pictureId, 1, 640 - 500, 384, 100, 100, 0, 0, 20);
    for (let i = 0; i <= 7; i++) {
      if ($gameScreen.picture(pictureId + i)) {
        $gameScreen.movePicture(pictureId + i, 1, 640 - 500, 384, 100, 100, 0, 3, 20);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:212|エクストラコマンド
  AGH_setSwitchTipsTitle = function () {
    if ($gameVariables.value(532).length >= 1) {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, true);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:212|エクストラコマンド
  AGH_runScriptExtraCommand = function () {
    window.close();
  };

  // Replaces (1x): CommonEvents.json:common-event:219|収集表示アイテムコモン
  AGH_checkItemCountCollectedItem = function (interp) {
    const start = 1;
    const end = 4;
    for (let i = start; i <= end; i++) {
      if ($gameVariables.value(284)[i] == 0) {
        $gameVariables.setValue(i + 21, "[登録なし]");
      } else {
        $gameVariables.setValue(i + 21, "[" + $dataItems[$gameVariables.value(284)[i]].name + ":");
        $gameVariables.setValue(
          i + 21,
          $gameVariables.value(i + 21) + $gameParty.numItems($dataItems[$gameVariables.value(284)[i]]) + "]"
        );
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:232|ショップ処理先頭で処理
  AGH_initValueRandomSet = function () {
    valueRandomSet = 20;
  };

  // Replaces (1x): CommonEvents.json:common-event:232|ショップ処理先頭で処理
  AGH_setVariableRandomWork1ShopProcessingHead = function () {
    const actorName = colorTaggedText(2, actor.name());
    const honeyTrapSkillMarker = "\x1bSIN[" + valueHoneyTrapSkillId + "]";
    const honeyTrapSkillName = colorTaggedText(27, honeyTrapSkillMarker);
    const successRateText = colorTaggedText(10, valueRandomSet + "%UP");
    const effectText = `${actorName}は${honeyTrapSkillName}を行った…。[成功率/値引き率${successRateText}]`;
    const previousWorkText = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    $gameVariables.setValue(
      HELPER_VARIABLE.RANDOM_WORK_1,
      previousWorkText + effectText + "\n"
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:234|喜捨コモン
  AGH_readVariableDonationTotal = function () {
    const totalDonations = $gameVariables.value(631) / 1000;
    const coloredText = colorTaggedText(10, `${totalDonations}`);
    const messageText = `\\SIM[106]が付与された。(${coloredText}%)`;
    TickerManager.show(messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:235|レアリティ昇格コモン
  AGH_setVariableRandomWork1RarityUpCommon = function () {
    const wordSet = valueWordSet2;
    $gameVariables.setValue(
      HELPER_VARIABLE.RANDOM_WORK_1,
      `${wordSet}には上記の物が必要になります。
		昇格なさいますか？`
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:235|レアリティ昇格コモン
  AGH_eraseMapEventDynamicEventIdRarityUpCommon = function () {
    const eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[11];
    $gameMap.eraseEvent(eventId);
    $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
  };

  // Replaces (1x): CommonEvents.json:common-event:235|レアリティ昇格コモン
  AGH_setVariableRandomWork1_2 = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    const actorName = actor.name();
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_1, `${actorName}殿はこれ以上の昇格はできませんね`);
  };

  // Replaces (1x): CommonEvents.json:common-event:237|指輪ショップ処理
  AGH_setSwitchRingShopProcessing = function () {
    const firstRingVariableId = 20;
    const firstRingSwitchId = 160;
    const firstRingArmorId = 396;
    // Each ring occupies the variable/switch right after the previous one.
    for (let armorId = firstRingArmorId; armorId <= 399; armorId++) {
      const ringIndex = armorId - firstRingArmorId + 1;
      const ringData = $dataArmors[armorId];
      const priceText = ringData.price.toLocaleString();
      // NOTE: the original wrote "\\G" inside a template literal, which renders as a
      // plain "G"; the produced text is kept identical on purpose.
      const itemLabel = "\x1bI[" + ringData.iconIndex + "]" + ringData.name;
      $gameVariables.setValue(
        firstRingVariableId + ringIndex,
        itemLabel + " " + priceText + "G"
      );
      const canAfford = $gameParty.gold() >= ringData.price;
      $gameSwitches.setValue(firstRingSwitchId + ringIndex, canAfford);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:237|指輪ショップ処理
  AGH_setSelfVariableChoiceSwitch12 = function (interp) {
    $gameVariables.setValue(172, 2); //会話コモン文字ピク
    const messageText2 = "指輪について";
    const messageText = `スロットにアタッチを装着する事で性能が上昇する。
		一度アタッチを付けると取り外し不可。指輪本体は店売りのみで、
		アタッチはドロップや宝箱等からのみ。
		アタッチが付くと指輪の売却額がアタッチ分上乗せされる。
		先頭アタッチの略語が名称の末尾に付く。
		※ 指輪本体を大量に持ち過ぎるとセーブデータの容量が増加します。
		許容できる範囲でやりくりして下さい。`;
    const array = [0, 1, 640 + 320, 384, 100, 100, 255];
    valueTalkSet = [messageText2, messageText, array];
    interp.setupChild($dataCommonEvents[60].list, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:238|個別アイテム鑑定店
  AGH_showWindowTextIndividualItemAppraisal = function () {
    const messageText = `鑑定料金表\n（下級：10\\G）（中級：100\\G）（上級：1000\\G）\n`;
    WindowManager.show(0, 10, 100, 800, 100);
    WindowManager.drawText(0, messageText);
  };

  // Appraisal items announce one grade keyword each; the grades add up.
  const APPRAISAL_GRADE_VALUES = [
    { metaKey: "下級鑑定品", value: 10 },
    { metaKey: "中級鑑定品", value: 100 },
    { metaKey: "上級鑑定品", value: 1000 }
  ];

  // Replaces (1x): CommonEvents.json:common-event:238|個別アイテム鑑定店
  AGH_setVariableRandomWork1IndividualItemAppraisal = function () {
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    const itemMeta = $dataItems[processedEntryId].meta;
    const appraisalValue = APPRAISAL_GRADE_VALUES.reduce(function (total, grade) {
      return itemMeta[grade.metaKey] ? total + grade.value : total;
    }, 0);
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_1, appraisalValue);
  };

  // Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
  // valueScriptArray1 presets for the shop / crafting handlers, selected by the value
  // of valueCountSet1 (the switch is the case label of the original code).
  const SCRIPT_ARRAY1_PRESETS = [
    [4, 5, 6],
    [6, 7],
    [4, 5, 6],
    [4, 5, 6, 7],
    [4, 5, 6, 7],
    [1],
    [1]
  ];
  const SCRIPT_ARRAY1_SHOP_PRESETS = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 8, 9],
    [1, 2, 3, 7, 8, 9],
    [1, 2, 3, 4, 5, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1],
    [1, 2]
  ];
  const SCRIPT_ARRAY1_BOOK_PRESETS = [
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
    [1, 2, 3],
    [1, 2, 3],
    [1, 2, 3],
    [1],
    [1]
  ];

  // Copies the preset so every caller gets its own array, like the literals did.
  function setScriptArrayFromPresets(presets) {
    const preset = presets[numericCaseValue(valueCountSet1)];
    if (!preset) return;
    valueScriptArray1 = preset.slice();
  }

  AGH_initValueScriptArray1 = function () {
    setScriptArrayFromPresets(SCRIPT_ARRAY1_PRESETS);
  };

  // Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
  AGH_initValueScriptArray1ShopProcessing = function () {
    setScriptArrayFromPresets(SCRIPT_ARRAY1_SHOP_PRESETS);
  };

  // Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
  AGH_initValueScriptArray1_2 = function () {
    setScriptArrayFromPresets(SCRIPT_ARRAY1_BOOK_PRESETS);
  };

  // Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
  AGH_initArrayShopProcessing = function () {
    array = [];
  };

  // Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
  // Feeds valueScriptArray1 into one shop preparation handler. The last array entry
  // is flagged with 1 so the handler knows the list is finished.
  function runShopPreparation(prepareEntry) {
    const scriptArray = valueScriptArray1;
    const lastEntryId = scriptArray[scriptArray.length - 1];
    for (let scriptIndex = 0; scriptIndex < scriptArray.length; scriptIndex++) {
      const entryId = scriptArray[scriptIndex];
      const isLastEntry = entryId == lastEntryId ? 1 : 0;
      prepareEntry(0, entryId, isLastEntry);
    }
  }

  AGH_runScriptShopProcessing = function () {
    runShopPreparation(shop_preparationEI);
  };

  // Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
  AGH_runScriptShopProcessing_2 = function () {
    runShopPreparation(shop_preparationH);
  };

  // Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
  AGH_runScriptShopProcessing_3 = function () {
    runShopPreparation(shop_preparationE);
  };

  // Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
  AGH_runScriptShopProcessing_4 = function () {
    const scriptArray = valueScriptArray1;
    for (let j = 0; j < scriptArray.length; j++) {
      if (scriptArray[j] == scriptArray[scriptArray.length - 1]) {
        shop_preparation1(0, scriptArray[j], 0);
        shop_preparation1(1, scriptArray[j], 0);
        shop_preparation1(2, scriptArray[j], 1);
      } else {
        shop_preparation1(0, scriptArray[j], 0);
        shop_preparation1(1, scriptArray[j], 0);
        shop_preparation1(2, scriptArray[j], 0);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
  AGH_runScriptShopProcessing_5 = function () {
    const scriptArray = valueScriptArray1;
    for (let j = 0; j < scriptArray.length; j++) {
      if (scriptArray[j] == scriptArray[scriptArray.length - 1]) {
        shop_preparation1(1, scriptArray[j], 0);
        shop_preparation1(2, scriptArray[j], 1);
      } else {
        shop_preparation1(1, scriptArray[j], 0);
        shop_preparation1(2, scriptArray[j], 0);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
  AGH_runScriptShopProcessing_6 = function () {
    const scriptArray = valueScriptArray1;
    for (let j = 0; j < scriptArray.length; j++) {
      if (scriptArray[j] == scriptArray[scriptArray.length - 1]) {
        shop_preparation1(valueCountSet1, scriptArray[j], 1);
      } else {
        shop_preparation1(valueCountSet1, scriptArray[j], 0);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
  AGH_setSwitchTemporarySwitchUniqueWeaponEnhance = function () {
    const id = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    if ($gameVariables.value(287)[id][10] >= 20) {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, false);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
  // Gold amount of the current enhance job, coloured red and followed by the usual
  // currency escape.
  function currentEnhanceCostText() {
    const costAmount = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1).toLocaleString();
    return colorTaggedText(2, `${costAmount}\\G`);
  }

  // Requirement line of an enhance job that also needs materials. Returns whether the
  // party owns enough of the material.
  function writeEnhanceRequirementLine() {
    const materialItemId = valueScriptArray2[0];
    const requiredMaterialCount = valueScriptArray2[1];
    const materialItem = $dataItems[materialItemId];
    const ownedMaterialCount = $gameParty.numItems(materialItem);
    const costText = currentEnhanceCostText();
    const requirementText =
      `（要:${costText} \x1bIIN[${materialItemId}]×${requiredMaterialCount}個）\n` +
      `所持数:${ownedMaterialCount}個`;
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_3, requirementText);
    return ownedMaterialCount >= requiredMaterialCount;
  }

  AGH_setSwitchTemporarySwitch_4 = function () {
    let hasRequiredMaterials;
    weapon_uniqueEnhance($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID), 1);
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_1, valueCountSet1);
    $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, false);
    if (valueScriptArray2[0] >= 1) {
      hasRequiredMaterials = writeEnhanceRequirementLine();
    } else {
      hasRequiredMaterials = true;
      $gameVariables.setValue(
        HELPER_VARIABLE.RANDOM_WORK_3,
        `（要:${currentEnhanceCostText()}）`
      );
    }
    if ($gameParty.gold() >= valueCountSet1 && hasRequiredMaterials) {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
  AGH_setSelfVariableRandomWork2UniqueWeaponEnhance = function (interp) {
    if ($gameSwitches.value(515)) {
      $dataSystem.switches[515] = "鍛冶ｼｰﾝｶｯﾄ(ON)";
    } else {
      $dataSystem.switches[515] = "鍛冶ｼｰﾝｶｯﾄ(OFF)";
    }
    $gameVariables.setValue(22, $dataSystem.switches[515]);
  };

  // Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
  AGH_setSelfVariableRandomWork2ForgeSceneCut = function (interp) {
    if ($gameSwitches.value(515)) {
      $dataSystem.switches[515] = "鍛冶ｼｰﾝｶｯﾄ(OFF)";
      $gameSwitches.setValue(515, false);
    } else {
      $dataSystem.switches[515] = "鍛冶ｼｰﾝｶｯﾄ(ON)";
      $gameSwitches.setValue(515, true);
    }
    $gameVariables.setValue(22, $dataSystem.switches[515]);
  };

  // Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
  AGH_readVariableActorChoiceUniqueWeaponEnhance = function () {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const id = selectedActorId;
    const gameVariableValue = $gameVariables.value(287);
    gameVariableValue[id][10] += 1;
    const weaponEnhancementLevel = gameVariableValue[id][10];
    gameVariableValue[id][weaponEnhancementLevel + 10] = $gameVariables.value(
      HELPER_VARIABLE.PROCESSED_ENTRY_ID
    );
    weapon_uniqueEnhance(selectedActorId, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
  AGH_gainItemRandomWork3 = function () {
    $gameParty.loseGold($gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1));
    const formattedAmount = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1).toLocaleString();
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_3, `${formattedAmount}\\Gを支払った。\n`);
    if (!(valueScriptArray2[0] >= 1)) return;

    $gameParty.gainItem($dataItems[valueScriptArray2[0]], -valueScriptArray2[1]);
    const displayedAmount = valueScriptArray2[0];
    const displayedAmount2 = valueScriptArray2[1];
    $gameVariables.setValue(
      HELPER_VARIABLE.RANDOM_WORK_3,
      $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_3) +
        `\\IIN[${displayedAmount}]を${displayedAmount2}個消費した。`
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:245|昇格演出
  AGH_spawnMapEventDynamicEventId = function () {
    $gameMap.spawnEvent(146, 7, 26, true);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    spawnedEventIds[11] = $gameMap.getLastSpawnEventId();
    const eventId = spawnedEventIds[11];
    const event = $gameMap.event(eventId);
    event.setOpacity(255);
  };

  // Replaces (1x): CommonEvents.json:common-event:245|昇格演出
  AGH_playParticleAureoleC = function (interp) {
    let particleName;
    particleName = "aureole_c";
    $gameScreen._particle.particlePlay(
      interp._eventId,
      particleName + "-" + interp._eventId,
      "this",
      particleName
    );
    particleName = "lifeStorm_screen";
    $gameScreen._particle.particlePlay(
      interp._eventId,
      particleName + "-" + interp._eventId,
      "this",
      particleName
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:245|昇格演出
  AGH_particlePlayChargeC = function () {
    const chargeC = "charge_c";
    $gameScreen._particle.particlePlay(0, chargeC, "player", "def", "screen");
    $gameScreen._particle.particleUpdate([chargeC, "pos", 0, 20]);
  };

  // Replaces (1x): CommonEvents.json:common-event:245|昇格演出
  AGH_forEachArrayAureoleC = function (interp) {
    const list = [
      "aureole_c" + "-" + interp._eventId,
      "lifeStorm_screen" + "-" + interp._eventId,
      "charge_c",
      "direct_screenRing"
    ];
    list.forEach(function (id) {
      $gameScreen._particle.particleClear(id);
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:250|神掘りコモン終了
  AGH_allowMapPlayerMovementGodDiggingEnd = function () {
    if (!!$gameParty.inBattle()) return;

    $gameTemp.allowMapPlayerMovement();
    $gameTemp.allowMapEventMovement();
  };

  // Replaces (1x): CommonEvents.json:common-event:251|重要アイテム入手コモン
  AGH_gainItemChestRareSlot = function () {
    showRareChestReward(valueCountSet1, valueCountSet2, 29);
  };

  // Replaces (1x): CommonEvents.json:common-event:253|リセット項目選択
  AGH_readVariableItemProcessWorkResetItemSelect = function () {
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    const gameVariableValue = $gameVariables.value(183);
    if (gameVariableValue[processedEntryId] == 0) {
      gameVariableValue[processedEntryId] = 1;
    } else {
      gameVariableValue[processedEntryId] = 0;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:254|ステータスリセット
  AGH_readVariableActorChoiceStatusReset = function () {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const actor = $gameActors.actor(selectedActorId);
    actor.setup(selectedActorId);
  };

  // Replaces (1x): CommonEvents.json:common-event:254|ステータスリセット
  AGH_readVariableActorChoice_3 = function () {
    let i;
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    for (i = 1; i < $dataSkills.length; i++) {
      actor.forgetSkill(i);
      actor.setSkillMasteryUses(i, 0);
      actor.setSkillMasteryLevel(i, 0);
    }
    const equips = actor.equips();
    for (i = 0; i < equips.length; i++) {
      if (equips[i]) {
        actor.changeEquipById(i + 1, 0);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:254|ステータスリセット
  AGH_runPluginCommandActorChoiceStatusReset = function (interp) {
    const actorClassId = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID))._classId;
    const args = new Array(String(i), "100", String(actorClassId));
    interp.pluginCommand("gainJp", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:256|Ｈ相手リセット
  AGH_readVariableItemProcessWorkHPartnerReset = function () {
    valueRandomSet = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
  };

  // Replaces (1x): CommonEvents.json:common-event:256|Ｈ相手リセット
  AGH_readVariableItemProcessWorkActorChoice = function () {
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    $gameVariables.value($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) + 360)[
      processedEntryId + 1
    ] = 0;
    const weaponName = $dataWeapons[processedEntryId + 1].name;
    const messageText = `${weaponName}とのＨ回数がリセットされました…`;
    CommonPopupManager.showInfo({}, messageText, null);
  };

  // Replaces (1x): CommonEvents.json:common-event:256|Ｈ相手リセット
  AGH_readVariableItemProcessWork_3 = function () {
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    $gameVariables.value($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) + 360)[
      processedEntryId + 200 + 1
    ] = 0;
    const weaponName = $dataWeapons[processedEntryId + 200 + 1].name;
    const messageText = `${weaponName}の出産履歴がリセットされました…`;
    CommonPopupManager.showInfo({}, messageText, null);
  };

  // Replaces (1x): CommonEvents.json:common-event:256|Ｈ相手リセット
  AGH_readVariableActorChoiceHPartnerReset = function (
    firstHistoryIndex = 1,
    lastHistoryIndex = 100,
    messageText = "男性遍歴が一括リセットされました…"
  ) {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const actorHistory = $gameVariables.value(selectedActorId + 360);
    for (let historyIndex = firstHistoryIndex; historyIndex <= lastHistoryIndex; historyIndex++) {
      actorHistory[historyIndex] = 0;
    }
    CommonPopupManager.showInfo({}, messageText, null);
  };

  // Replaces (1x): CommonEvents.json:common-event:256|Ｈ相手リセット
  AGH_readVariableActorChoice_4 = function () {
    return AGH_readVariableActorChoiceHPartnerReset(201, 300, "出産履歴が一括リセットされました…");
  };

  // Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
  AGH_spawnMapEventDynamicEventIdSubJobUnlock1 = function (interp) {
    $gameMap.spawnEvent(224, 15, 10, true);
    const eventId = $gameMap.getLastSpawnEventId();
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    spawnedEventIds[11] = eventId;
    interp._eventId = spawnedEventIds[11];
  };

  // Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
  AGH_spawnMapEventDynamicEventId_2 = function () {
    $gameMap.spawnEvent(223, 10, 10, true);
    const eventId = $gameMap.getLastSpawnEventId();
    $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[12] = eventId;
  };

  // Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
  AGH_fillArraySubJobUnlock1 = function () {
    valueJobReleaseTorF1 = Array(81).fill(0);
    valueJobReleaseTorF2 = Array(81).fill(0);
  };

  // Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
  AGH_setSwitchTemporarySwitchSubJobUnlock1 = function () {
    const randomWorkValue = valueJobReleaseTorF2[$gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID)];
    if (valueJobReleaseTorF1[randomWorkValue] == 1) {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, false);
    }
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_1, randomWorkValue);
  };

  // Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
  AGH_runPluginCommandDynamicEventId = function (interp) {
    const fadePatternId = "161"; //一刀両断102崩壊161横両断008封印054内側から153
    const character = "character"; //"picture"
    const args = new Array(
      String(character),
      $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[12],
      "fadeOut",
      String(fadePatternId),
      "180",
      "5"
    );
    interp.pluginCommand("GWFade", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
  AGH_setVariableTextWork = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    const classRank = Number(
      $dataClasses[$gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1)].meta["classRank"]
    );
    const actorName = actor.name();
    const coloredText = colorTaggedText(
      14,
      `[${$dataClasses[$gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1)].name}]`
    );
    $gameVariables.setValue(
      801,
      `${actorName}はClass${classRank}Job${coloredText}を解放した！
		`
    );
  };

  // Replaces (1x): CommonEvents.json:common-event:261|鑑定解説文
  AGH_iterateItemsInfoEval = function () {
    const processedEntryId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    const entryId = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    const databaseEntry = getIWA(processedEntryId)[entryId];
    const itemLabel = `\x1bI[${databaseEntry.iconIndex}]${databaseEntry.name}`;
    const descriptionText = `${itemLabel}\n${databaseEntry.description}`;
    let messageText = "\n";
    if (databaseEntry.meta["Info Eval"]) {
      item_priceinfo(processedEntryId, entryId);
      messageText += $gameVariables.value(801);
    }
    WindowManager.show(1, 0, 100, 1280, 668);
    WindowManager.drawText(1, `${descriptionText}${messageText}`);
  };

  // Replaces (1x): CommonEvents.json:common-event:287|戦闘勝利時獲得変数等
  AGH_findSystemSwitchByNameBattleVictoryVariable = function () {
    const switch252Name = $dataSystem.switches[252];
    const messageText = `${switch252Name}の空賊捕縛数+1`;
    CommonPopupManager.showInfo({}, messageText, null);
  };

  // Replaces (1x): CommonEvents.json:common-event:287|戦闘勝利時獲得変数等
  AGH_setMapEventOpacityBattleVictoryVariable = function () {
    const event = $gameMap.event(valueEnemyEventId);
    event.setOpacity(0);
  };

  // Replaces (1x): CommonEvents.json:common-event:290|シーン初期処理自動実行
  AGH_setSwitchEventProgress = function () {
    if (!$gameParty.inBattle()) {
      $gamePlayer.setThrough(true);
    }
    $gameSwitches.setValue(468, true);
    $gameSwitches.setValue(HELPER_SWITCH.EVENT_IN_PROGRESS, true);
    $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
  };

  // Replaces (1x): CommonEvents.json:common-event:291|シーン終了処理自動実行
  AGH_setSwitchEventProgressSceneEndAuto = function () {
    $gameVariables.setValue(320, 0);
    if (!$gameParty.inBattle()) {
      $gamePlayer.setThrough(false);
    }
    $gameSwitches.setValue(HELPER_SWITCH.EVENT_IN_PROGRESS, false); //イベント進行時onoff
    $gameSwitches.setValue(473, false);
    if (!$gameParty.inBattle()) {
      $gameTemp.allowMapPlayerMovement();
      $gameTemp.allowMapEventMovement();
    }
    $gameSwitches.setValue(467, false); //NPC消滅スイッチoff
  };

  // Replaces (1x): CommonEvents.json:common-event:291|シーン終了処理自動実行
  AGH_setVariableDynamicEventIdSceneEndAuto = function () {
    valueWeatherSceneSet = 0;
    valueSceneConditions1 = true;
    valueSceneConditions2 = true;
    valueSceneConditions3 = true;
    $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    $gameVariables.setValue(528, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:291|シーン終了処理自動実行
  AGH_setSwitchEpisodeAutoTrigger = function () {
    if (!$gameSwitches.value(HELPER_SWITCH.RECOLLECTION_SKIP)) {
      $gamePlayer.setTransparent(false);
      if ($gameSwitches.value(412)) {
        //挿話
        $gameSwitches.setValue(412, false);
      }
      if ($gameSwitches.value(469)) {
        //Ｈ
        $gameSwitches.setValue(469, false);
      }
    }
    if (!$gameParty.inBattle()) {
      drowsepost.camera.zoom(1, 60, $gamePlayer);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:292|※※コマンド一覧
  AGH_waitActorChoice = function (interp) {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    actor.addState(693);
    tachie_dousa(2, 1, 2, 12, 1, 255, 1323, 0, 0);
    tachie_dousa(2, 1, 2, 12, 1, 255, 1325, 0, 0);
    tachie_dousa(0, 1, 1, 12, 13, 0, 60, 0, 0);
    //tachie_clothReflect(1);
    interp.wait(3);
  };

  // Replaces (1x): CommonEvents.json:common-event:292|※※コマンド一覧
  AGH_configureMapEventCommandList = function (interp) {
    event_partyCharaEntry();
    const event = $gameMap.event(interp._eventId);
    if (!event) return;
    const direction = event.direction();
    let movementCommandId;
    switch (direction) {
      case 2:
        movementCommandId = 16;
        break;
      case 4:
        movementCommandId = 17;
        break;
      case 6:
        movementCommandId = 18;
        break;
      case 8:
        movementCommandId = 19;
        break;
      default:
        return;
    }
    event_partyCharaMove(movementCommandId, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:294|タイトルコール
  AGH_setSwitchTemporarySwitchTitleCall = function () {
    const episodeItemId = $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID);
    if (episodeItemId === 0) {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
      return;
    }
    const episodeItem = $dataItems[episodeItemId];
    const isUnownedEpisode =
      episodeItemId >= 1 &&
      episodeItem &&
      episodeItem.meta &&
      Number(episodeItem.meta.EICSwitch) === 103 &&
      !$gameParty.hasItem(episodeItem, true);
    $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, !!isUnownedEpisode);
  };

  // Replaces (1x): CommonEvents.json:common-event:294|タイトルコール
  AGH_movePictureTitleCall = function () {
    const pictureId = 102;
    $gameScreen.movePicture(pictureId, 1, 640 - 250, 384 - 200, 100, 100, 0, 0, 300);
  };

  // Replaces (1x): CommonEvents.json:common-event:294|タイトルコール
  AGH_setVariableRandomWork1TitleCall = function () {
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_1, $gameVariables.value(142));
    const randomWorkValue = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    gab_wordParticle(`～～\\C[16]${randomWorkValue}\\C[0]～～`);
  };

  // Replaces (1x): CommonEvents.json:common-event:294|タイトルコール
  AGH_readVariableEpisodeRecallItemId = function () {
    if (!($gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID) == 0)) return;

    const start = $gameVariables.value(HELPER_VARIABLE.FIRST_DEPLOYED_ACTOR_ID);
    const end = $gameVariables.value(HELPER_VARIABLE.LAST_DEPLOYED_ACTOR_ID);
    for (let id1 = start; id1 <= end; id1++) {
      Profession_basicReturn(id1);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:295|シーン初期処理
  AGH_readVariableHeroineIdSceneInitProcessing = function (interp) {
    //現在衣装を別変数配列に一時代入
    //統合衣装用の0も含める。（代入変数を利用しなくていい為可能）
    const list = $gameVariables.value(HELPER_VARIABLE.HEROINE_ACTOR_IDS);
    list.forEach(function (id) {
      const actor = $gameActors.actor(id);
      if (!$gameParty.members().contains(actor)) return;

      const start = 0;
      const end = 42;
      for (let i = start; i <= end; i++) {
        $gameVariables.value(id + 540)[i] = $gameVariables.value(id + 440)[i];
      }
    }, interp);
  };

  // Replaces (1x): CommonEvents.json:common-event:295|シーン初期処理
  AGH_someArray = function () {
    //並列コモンスイッチid区分けにも使用
    valueScriptArray1 = [119, 125, 422, 425, 429, 481];
    valueScriptArray1.some(function (id) {
      return $gameSwitches.setValue(id, false);
    });
  };

  // Variable 626: 0 = main scene, 1..2 = the episode unlocked by the episode item.
  const EPISODE_ITEM_VARIABLE_ID = 626;

  // Replaces (1x): CommonEvents.json:common-event:295|シーン初期処理
  AGH_setVariableMainSceneOrEpisode = function () {
    $gameVariables.setValue(EPISODE_ITEM_VARIABLE_ID, 0);
    const episodeItemId = $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID);
    if (!(episodeItemId >= 1)) return;

    const eicSwitch = Number($dataItems[episodeItemId].meta["EICSwitch"]);
    // Only the two episode switches mark an episode; anything else stays 0.
    switch (eicSwitch) {
      case 102:
        $gameVariables.setValue(EPISODE_ITEM_VARIABLE_ID, 1);
        break;
      case 103:
        $gameVariables.setValue(EPISODE_ITEM_VARIABLE_ID, 2);
        break;
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:295|シーン初期処理
  AGH_setVariableEventStartSwitch = function () {
    const array = $gameMap._commonEvents
      .filter(function (event) {
        return event.isActive();
      })
      .map(function (event) {
        return event.event().id;
      });
    for (let i = 0; i <= array.length - 1; i++) {
      if (array[i] >= 2 && $dataCommonEvents[array[i]].switchId) {
        if (
          valueScriptArray1.some(function (id) {
            return id == $dataCommonEvents[array[i]].switchId;
          })
        ) {
        } else {
          $gameVariables.setValue(529, $dataCommonEvents[array[i]].switchId);
          $gameVariables.setValue(142, $dataCommonEvents[array[i]].name);
          valueCommonId = array[i];
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:295|シーン初期処理
  AGH_setVariableEventStartSwitchSceneInitProcessing = function () {
    if (!($gameVariables.value(529) == 0)) return;

    const commonEventId = $gameVariables.value(201);
    $gameVariables.setValue(529, $dataCommonEvents[commonEventId].switchId);
    $gameVariables.setValue(142, $dataCommonEvents[commonEventId].name);
    valueCommonId = commonEventId;
  };

  // Replaces (1x): CommonEvents.json:common-event:297|シーン終了処理2
  AGH_hideAll = function () {
    TickerManager.hideAll();
  };

  // Replaces (1x): CommonEvents.json:common-event:298|オープニング
  AGH_runScriptOpening = function () {
    UTSU.PictureBreath.on([100], 10);
  };

  // Replaces (5x): CommonEvents.json:common-event:298|オープニング, CommonEvents.json:common-event:300|シナリオ↓シーン名設定コモン, CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！, CommonEvents.json:common-event:349|[49]終幕
  AGH_particleUpdateCloudW = function () {
    let randomOffset;
    adv_partDirectSet(9);
    const cloudW = "cloud_w"; //天候:雲
    randomOffset = getRandomIndex(201) + 1000;
    $gameScreen._particle.particleUpdate([cloudW, "speed", String(randomOffset), String(randomOffset)]);
    const cloudAlpha = 0.75; //[0.40,0.45,0.50,0.55,0.60,0.65,0.70,0.75];
    randomOffset = cloudAlpha[getRandomIndex(cloudAlpha.length)];
    $gameScreen._particle.particleUpdate([
      cloudW,
      "alpha",
      "0",
      randomOffset + "@0.05",
      randomOffset + "@0.9",
      "0"
    ]);
    $gameScreen._particle.particleUpdate([cloudW, "frequency", "1.5"]);
  };

  // Replaces (1x): CommonEvents.json:common-event:298|オープニング
  AGH_setSelfSwitchOpening = function (interp) {
    let eventId;
    const mapId2 = $gameMap.mapId();
    eventId = 7; //this._eventId;
    const positionY = "D";
    const selfSwitchEnabled = true; //false;
    $gameSelfSwitches.setValue([mapId2, eventId, positionY], selfSwitchEnabled);
    eventId = 8; //this._eventId;
    $gameSelfSwitches.setValue([mapId2, eventId, positionY], selfSwitchEnabled);
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_spawnMapEventOrderSkyKnightsAppear = function () {
    const spawnX = 12; //$gamePlayer._realX;
    const spawnY = 15; //$gamePlayer._realY;
    $gameMap.spawnEvent(143, spawnX, spawnY, true);
    valueCountSet1 = $gameMap.getLastSpawnEventId();
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_setSelfVariableChoiceSwitch12OrderSkyKnightsAppear = function (interp) {
    $gameVariables.setValue(172, 10);
    const actorName = "\\N[1]";
    const actorName2 = "\\N[5]";
    const coloredText = colorTaggedText(2, `${$dataSystem.switches[221]}`);
    const actorName3 = "\\N[1]";
    const coloredText2 = colorTaggedText(2, `${$dataSystem.switches[221]}`);
    valueTalkSet = [
      28,
      `<秩序の騎空団団長代理>を務める\\set[1]。
		騎空挺を駆り任務先の島へと移動していた際、\n別の島で狼藉が行われている事を察知し急行する。
		名もなき集落を襲っていた「空賊」達の討伐に成功するが、\n集落の人々は一人の少年を残し全滅していた…。
		唯一の生き残りである少年、\\set[5]を${actorName}は、\n騎空団で引き取り<秩序の騎空士見習い>として面倒を見る事に決める。

		──それから一か月。
		新天地での暮らしにも慣れてきた${actorName2}は、
		${coloredText}という島にある国で
		発生している問題の解決の為、
		${actorName3}や先輩騎空士達と共に${coloredText2}へ
		向かうのであった…。`
    ];
    interp.setupChild($dataCommonEvents[60].list, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_getLastSpawnEventId = function (interp) {
    event_respawnSetN(11, 12, 8, 0, "$airship02", 0);
    valueCountSet1 = $gameMap.getLastSpawnEventId();
    interp._eventId = valueCountSet1;
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_eventOrder = function () {
    let event;
    for (let id = 100; id > 0; id--) {
      const mapEvent = $gameMap.event(id);
      if (!!mapEvent) {
        if (mapEvent.event().meta["Order"]) {
          event = mapEvent;
          event.setDirection(6);
          event.requestBalloon(1);
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_readMapEventMetaOrder = function () {
    let event;
    for (let id = 100; id > 0; id--) {
      const mapEvent = $gameMap.event(id);
      if (!!mapEvent) {
        if (mapEvent.event().meta["Order"]) {
          event = mapEvent;
          event.setDirection(4);
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_setSelfVariableChoiceSwitch12_2 = function (interp) {
    $gameVariables.setValue(172, 18);
    valueTalkSet = [0, 1]; //1で付与2で直接表示\CE[60]のみ0で解除,ｱｸﾀｰid
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_eventBandit = function () {
    let event;
    for (let id = 100; id > 0; id--) {
      const mapEvent = $gameMap.event(id);
      if (!!mapEvent) {
        if (mapEvent.event().meta["Bandit"]) {
          event = mapEvent;
          event.requestBalloon(12);
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_readMapEventMetaBandit = function () {
    /*
    for (var id = 100; id > 0; id--) {
      const mapEvent = $gameMap.event(id);
      if (!!mapEvent) {
        if (mapEvent.event().meta["Bandit"]) {
          //event is only referenced by the commented debug call below
          //var event = mapEvent;
          //event.erase();
        }
      }
    }
    */
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_readMapEventMetaBanditOrderSkyKnightsAppear = function () {
    for (let id = 100; id > 0; id--) {
      const mapEvent = $gameMap.event(id);
      if (!!mapEvent) {
        if (mapEvent.event().meta["Bandit"]) {
          mapEvent.forceMoveRoute({
            list: [{ code: 19 }, { code: 0 }],
            repeat: false,
            skippable: true
          });
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_particleSetDustWalk = function () {
    const dustWalk = "dust_walk";
    $gameScreen._particle.particleSet(0, dustWalk, "walk:event:1", "def", "below");
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_configureMapEventOrderSkyKnightsAppear = function () {
    const event = $gameMap.event(5);
    event.setFace(4, true, true, 0, 6, 0, 6);
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_readVariableEventProgressHero = function (interp) {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 25, 10, 0);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setFace(8, true, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_particleSetFlashPermanence = function () {
    const flashPermanence = "flash_permanence";
    $gameScreen._particle.particleSet(0, flashPermanence, "screen", "def", "screen");
    const particleColor = "#4bedff"; //元がﾋﾟﾝｸ、青水'#4bedff',黄'#ffea4b',赤'#ff634b',
    $gameScreen._particle.particleUpdate([flashPermanence, "color", particleColor, "#ffffff"]);
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_particleClearFlashPermanence = function () {
    const flashPermanence = "flash_permanence";
    $gameScreen._particle.particleClear(flashPermanence);
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_readVariableDynamicEventIdOrderSkyKnightsAppear = function (interp) {
    original_main(valueCommonId, 7);
    const charaSlotId = 19;
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event_charaZanzou(
      spawnedEventIds[$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX)],
      charaSlotId
    );
    interp._eventId = spawnedEventIds[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_readVariableDynamicEventId_2 = function (interp) {
    const charaSlotId = 20;
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event_charaZanzou(
      spawnedEventIds[$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX)],
      charaSlotId
    );
    interp._eventId = spawnedEventIds[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_readVariableDynamicEventId_3 = function (interp) {
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[
      $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX)
    ];
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_runScriptOrderSkyKnightsAppear = function (interp) {
    const array = [0];
    const randomYOffsets = [-50];
    const lineCandidates = ["グハァァッッ！！"];
    chara_oneWord(100, interp._eventId, 25, 180, array, randomYOffsets, lineCandidates, "genkai-mincho");
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_configureMapEventOrderSkyKnightsAppear_2 = function () {
    const event = $gameMap.event(5);
    event.removeFace();
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_readVariableDynamicEventId_4 = function (interp) {
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[
      $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX)
    ];
    const event = $gameMap.event(interp._eventId);
    event.removeFace();
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_handleScriptSnippetFadeOut = function () {
    valuePic1 = 52;
    picture_fade1(52, "fadeOut", "150", 60, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_readVariableEventProgressHeroOrderSkyKnightsAppear = function (interp) {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 8, 4, 1);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    goodsEvent_respawn(11, "Goods8", 0, 4, 1, 8, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_showPictureScreenBlackOutOrderSkyKnightsAppear = function () {
    const pictureId = 54;
    valuePic1 = pictureId;
    $gameScreen.showPicture(pictureId, "ScreenBlackOut", 1, 640, 384, 100, 100, 250, 0);
    $gameScreen.showPicture(pictureId + 1, "/img/parallaxes/BlueSky", 1, 640, 384, 100, 100, 200, 0);
    $gameScreen.showPicture(pictureId + 2, "/img/parallaxes/EV_15_0", 1, 640, 384, 100, 100, 255, 0);
    $gameScreen.showPicture(pictureId + 3, "/img/parallaxes/EV_15_2", 1, 640, 384, 100, 100, 255, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_initValuePic1 = function () {
    const pictureId = 54;
    valuePic1 = pictureId;
    for (let i = 0; i <= 4; i++) {
      picture_fade1(pictureId + i, "fadeOut", valueWipeImg, 60, 5);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
  AGH_runScriptOrderSkyKnightsAppear_2 = function () {
    event_respawnSetA(3, 15, 40, 0);
    event_respawnSetA(4, 13, 40, 0);
    event_respawnSetA(5, 14, 40, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:305|[5]騎空士ギルド
  AGH_setSelfSwitchDynamicEventId = function (interp) {
    $gameSelfSwitches.setValue([$gameMap.mapId(), 3, "A"], true);
    const evId = 11;
    event_respawnSetN(evId, 19, 4, 0, "Goods9", 0);
    const eventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    const event = $gameMap.event(eventIds[evId]);
    event.setDirection(2);
    interp._eventId = eventIds[evId];
  };

  // Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
  AGH_showPictureZXMain006 = function () {
    let pictureName;
    backGraund_menuMapSelect(2, 0, 0, 0);
    valuePic1 = 55;
    valueScenePic = "ZX_Main006_";
    pictureName = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640, 384, 100, 100, 200, 0);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
    const pictureId = valuePic1 + 1;
    pictureName = valueScenePic + "02";
    $gameScreen.showPicture(pictureId, pictureName, 1, 640 - 128 + 20 + 50, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128 + 50, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
  AGH_showPictureInfoBrokerNegotiation = function () {
    pic_move1(valuePic1 + 1, 0, 0, 100, 100, 0, 90);
    const pictureId = valuePic1 + 2;
    const scenePictureName = valueScenePic + "03";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 + 50, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128 + 50, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
  AGH_setPicturesAnimation = function () {
    for (let i = 1; i <= 3; i++) {
      pic_move1(valuePic1 + i, 0, 0, 100, 100, 0, 90);
    }
    $gameScreen.setPicturesAnimation(2, 10, "連番", 20);
    const pictureId = valuePic1 + 4;
    const scenePictureName = valueScenePic + "05_00";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 + 50, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128 + 50, 384, 100, 100, 255, 0, 60);
    const picture2 = $gameScreen.picture(pictureId);
    if (picture2) {
      picture2.startAnimationFrame(1, true, [1, 1, 1, 2]);
    }
    tachie_bless(pictureId, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
  AGH_showPictureInfoBrokerNegotiation_2 = function () {
    sex_direction(99, 0, 0);
    for (let i = 1; i <= 5; i++) {
      pic_move1(valuePic1 + i, 0, 0, 100, 100, 0, 90);
    }
    const pictureId = valuePic1 + 6;
    const scenePictureName = valueScenePic + "07";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 + 100, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128 + 100, 384, 100, 100, 255, 0, 60);
    tachie_bless(pictureId, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
  AGH_showPictureInfoBrokerNegotiation_3 = function () {
    $gameScreen.setPicturesAnimation(2, 20, "連番", 40);
    const pictureId = valuePic1 + 7;
    const scenePictureName = valueScenePic + "08_00";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 + 100, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128 + 100, 384, 100, 100, 255, 0, 60);
    const picture2 = $gameScreen.picture(pictureId);
    if (picture2) {
      picture2.startAnimationFrame(1, true, [1, 1, 1, 2]);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
  AGH_runScriptInfoBrokerNegotiation = function () {
    const popupEventId = 18;
    message_popup2(popupEventId, 0, 1, 1);
    //message_popup2(0,[1024,368],1,1);
    //ｲﾍﾞﾝﾄid,ﾌｷﾀﾞｼ位置,行数,1で有効化。\sh[5] で振動強さ指定
    //0で座標指定,xyは中心点を指定
    //mpp文字操作との相性が悪い
  };

  // Replaces (1x): CommonEvents.json:common-event:307|[7]少年の初陣
  AGH_getPatternJump = function () {
    valuePic1 = 13;
    curveFunctions.patternX = curveFunctions.getPattern("jump", [30]);
    picTachie_move1(valuePic1, 0, 0, 0, 0, 255, 30);
    picture_motion1("smooth", [0]);
  };

  // Replaces (1x): CommonEvents.json:common-event:307|[7]少年の初陣
  AGH_initValuePic1BoyFirstBattle = function () {
    valuePic1 = 14;
    picture_animation1(valuePic1, 0, -300, 196);
  };

  // Replaces (1x): CommonEvents.json:common-event:307|[7]少年の初陣
  AGH_valueName = function (interp) {
    let floorValue;
    picTachie_move1(13, -1000, 0, 0, 0, 255, 60);
    picTachie_move1(14, -1000, 0, 0, 0, 255, 60);
    if ($gameSwitches.value(127)) {
      AudioManager.playSe({ name: "Z_FootRun", volume: 35, pitch: 100, pan: 0 });
      floorValue = Math.floor(floorValue / 2); //ウェイト
      interp.wait(floorValue);
    } else {
      AudioManager.playSe({ name: "Z_FootWalkShort", volume: 65, pitch: 100, pan: 0 });
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:308|[8]高位種との遭遇
  AGH_updateParticleDynamicEventId = function (interp) {
    const evId = 11;
    event_respawnSetN(evId, 12, 10, 0, "Monster", 2, 2);
    const eventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    const event = $gameMap.event(eventIds[evId]);
    interp._eventId = eventIds[evId];
    event.setDirection(2);
    event.setTone(-50, -200, 100);
    const picPath = "magic_circle_c";
    $gameScreen._particle.particleSet(interp._eventId, picPath + "-" + interp._eventId, "this", picPath);
    $gameScreen._particle.particleUpdate([picPath, "color", "#400070", "#ffcdcd"]);
  };

  // Replaces (1x): CommonEvents.json:common-event:311|[11]中央平原で空賊捕縛
  AGH_readVariableEventProgressHeroCentralPlainCapture = function (interp) {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3], npcPreset[4], 1);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setImage(npcPreset[1], npcPreset[2]);
    event.setDirection(4);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (3x): CommonEvents.json:common-event:312|[12]捕縛完了→引き渡しまで, CommonEvents.json:common-event:316|[16]集落の長に話を聞く, CommonEvents.json:common-event:345|[45]祭殿の隠し通路
  AGH_readVariableEventProgressHeroCaptureToHandover = function (interp) {
    let eventSubjectIndex;
    event_partyCharaEntry();
    eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[eventSubjectIndex];
    event_partyCharaMove(45, "this.turnTowardCharacter($gameMap.event(" + eventSubjectIndex + "));");
  };

  // Replaces (1x): CommonEvents.json:common-event:312|[12]捕縛完了→引き渡しまで
  AGH_eventMonsterSymbol = function (interp) {
    for (let id = 200; id > 0; id--) {
      const mapEvent = $gameMap.event(id);
      if (!!mapEvent) {
        if (mapEvent.event().meta["MonsterSymbol"]) {
          mapEvent.forceMoveRoute({
            list: [{ code: 45, parameters: ["this.setOpacity(0);"] }, { code: 0 }],
            repeat: true,
            skippable: true
          });
        }
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:312|[12]捕縛完了→引き渡しまで
  AGH_readVariableEventProgressHero_2 = function (interp) {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 26, 4, 1, 2);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    charaSlotId = 3;
    event_respawnSetA(charaSlotId, 26, 3, 0, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
  AGH_setSelfVariableEventProgressHero = function (interp) {
    $gameVariables.setValue(530, 5); //主格キャラ
    $gameVariables.setValue(535, 313); //挿話回想の場合アイテムID。メインは0
    if ($gameVariables.value(528) == 3) {
      valueWeatherSceneSet = 15;
    } else {
      valueWeatherSceneSet = 14;
    }
    h_keikenhyouji1(521, 357); //記録変数,相手ID
  };

  // Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
  AGH_readVariableEventProgressHeroPromotionGap = function (interp) {
    //var value1 = 5;//$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(5, 10, 13, 1, 8);
    //var value1 = 3;//$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(3, 11, 13, 1, 8);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1];
    //var value1 = 12;
    event_respawnSetN(12, 10, 11, 0, "People2", 1, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
  AGH_eraseMapEventDynamicEventIdPromotionGap = function () {
    const eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[11];
    $gameMap.eraseEvent(eventId);
    //$gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS,Array(21).fill(0));
  };

  // Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
  AGH_particleSetMahoujinC = function (interp) {
    const mahoujinC = "mahoujin_c";
    $gameScreen._particle.particleSet(interp._eventId, mahoujinC + "-" + interp._eventId, "this", mahoujinC);
  };

  // Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
  AGH_readVariableEventProgressHero_3 = function (interp) {
    //var value1 = 5;//$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[5];
    const event = $gameMap.event(interp._eventId);
    const screenX = event.screenX();
    const screenY = event.screenY();
    filter_direct(9, screenX, screenY, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
  AGH_readVariableEventProgressHero_4 = function (interp) {
    const id = 5; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(id, 20, 13, 1, 2);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[id];
    //var id = 3;//$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(3, 20, 14, 0, 4);
  };

  // Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
  AGH_readVariableEventProgressHero_5 = function (interp) {
    //var value1 = 5;//$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(5, 8, 10, 1, 6);
    //var value1 = 3;
    event_respawnSetA(3, 11, 10, 0, 4);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[3];
  };

  // Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
  AGH_setSelfVariableActorChoicePromotionGap = function (interp) {
    $gameVariables.setValue(20, 0);
    valueWordSet0 = "教会で「昇格」が可能になりました！";
    valueWordSetEx = 0; //補足が必要な場合
    interp.setupChild($dataCommonEvents[45].list, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:315|[15]集落到着
  AGH_readVariableEventProgressHeroVillageArrival = function () {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3], npcPreset[4], 1);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setImage(npcPreset[1], npcPreset[2]);
    event.setDirection(npcPreset[5]);
    event_partyCharaEntry();
  };

  // Episode NPC setup: EVENT_WORK_VALUES[episode item id] holds the graphics and tiles
  // of the subject NPC and of its companion, which always spawns in slot 11.
  const EPISODE_COMPANION_SLOT_ID = 11;

  function episodeSubjectSlotId() {
    return $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
  }

  // Respawns the subject NPC from the episode preset and reapplies its look.
  function respawnEpisodeSubjectNpc(spawnSlotId, npcPreset, npcX) {
    const subjectEvent = respawnActor(spawnSlotId, npcX, npcPreset[4], 1);
    subjectEvent.setImage(npcPreset[1], npcPreset[2]);
    subjectEvent.setDirection(npcPreset[5]);
    return subjectEvent;
  }

  // Respawns the companion NPC of the episode preset in its fixed slot.
  function respawnEpisodeCompanionNpc(npcPreset) {
    event_respawnSetN(
      EPISODE_COMPANION_SLOT_ID,
      npcPreset[8],
      npcPreset[9],
      0,
      npcPreset[6],
      npcPreset[7]
    );
    const companionEvent = spawnedEvent(EPISODE_COMPANION_SLOT_ID);
    companionEvent.setDirection(npcPreset[10]);
    return companionEvent;
  }

  // Replaces (1x): CommonEvents.json:common-event:316|[16]集落の長に話を聞く
  AGH_readVariableEventProgressHeroAskVillageChief = function (interp) {
    const npcPreset = currentNpcPreset();
    const subjectSlotId = episodeSubjectSlotId();
    respawnEpisodeSubjectNpc(subjectSlotId, npcPreset, npcPreset[3]);
    interp._eventId = spawnedEventId(subjectSlotId);
    respawnEpisodeCompanionNpc(npcPreset);
  };

  // Replaces (1x): CommonEvents.json:common-event:316|[16]集落の長に話を聞く
  AGH_readVariableEventProgressHero_6 = function () {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    //npcPreset/event are dead verbatim leftovers: the respawn call below uses fixed coords
    //const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
    //  $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    //];
    event_respawnSetA(charaSlotId, 14, 18, 1, 2);
    //const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
  };

  // Replaces (1x): CommonEvents.json:common-event:322|[22]頭目との対峙
  AGH_readVariableEventProgressHeroBossConfrontation = function (interp) {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, 27, 19, 1);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setImage(npcPreset[1], npcPreset[2]);
    event.setDirection(npcPreset[5]);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:322|[22]頭目との対峙
  AGH_readVariableEventProgressHero_7 = function () {
    const eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[eventSubjectIndex]);
    const posX = event._realX;
    const eventY = event._realY;
    event_respawnSetA(3, posX + 1, eventY + 1, 0, 8);
    event_respawnSetA(4, posX - 1, eventY + 1, 0, 8);
    event_respawnSetA(5, posX, eventY + 1, 0, 8);
  };

  // Replaces (1x): CommonEvents.json:common-event:322|[22]頭目との対峙
  AGH_readVariableDynamicEventIdBossConfrontation = function () {
    const array = [];
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    array.push(spawnedEventIds[12]);
    array.push(spawnedEventIds[13]);
    array.push(spawnedEventIds[14]);
    array.push(spawnedEventIds[15]);
    array.push(spawnedEventIds[16]);
    event_NpcCharaMoveId(19, 0, array);
  };

  // Replaces (1x): CommonEvents.json:common-event:328|[28]アウギュステ到着
  AGH_readVariableDynamicEventIdAugusteArrival = function (interp) {
    event_respawnSetN(value1, 32, 9, 0, "Goods9", 0, 2);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1];
  };

  // Replaces (1x): CommonEvents.json:common-event:329|[29]水着購入
  AGH_readVariableEventProgressHeroSwimsuitPurchase = function (interp) {
    const npcPreset = currentNpcPreset();
    const subjectSlotId = episodeSubjectSlotId();
    respawnEpisodeSubjectNpc(subjectSlotId, npcPreset, npcPreset[3]);
    interp._eventId = spawnedEventId(subjectSlotId);
    const companionEvent = respawnEpisodeCompanionNpc(npcPreset);
    companionEvent.setStepAnime(false);
    companionEvent.setWalkAnime(false);
  };

  // Replaces (1x): CommonEvents.json:common-event:329|[29]水着購入
  AGH_waitActorChoiceSwimsuitPurchase = function (interp) {
    //actor is only referenced by the commented debug call below
    //const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    //actor.addState(693);
    tachie_dousa(2, 1, 2, 14, 1, 255, 1311, 0, 0);
    tachie_dousa(0, 1, 1, 14, 15, 0, 120, 1, 0);
    //tachie_clothReflect(1);
    interp.wait(3);
  };

  // Replaces (1x): CommonEvents.json:common-event:329|[29]水着購入
  AGH_waitActorChoice_2 = function (interp) {
    //actor is only referenced by the commented debug call below
    //const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    //actor.addState(693);
    tachie_dousa(2, 1, 2, 15, 1, 255, 1347, 0, 0);
    tachie_dousa(0, 1, 1, 15, 14, 0, 180, 0, 0);
    tachie_clothReflect(1);
    interp.wait(3);
  };

  // Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
  AGH_readVariableEventProgressHeroMonicaJoins = function (interp) {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, 11, 5, 1, 6);
    charaSlotId = 3; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 12, 4, 0, 2);
    charaSlotId = 11;
    event_respawnSetN(charaSlotId, npcPreset[8], npcPreset[9], 0, npcPreset[6], npcPreset[7], npcPreset[10]);
    //event is a dead verbatim leftover: only _eventId is transferred below
    //const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
  AGH_readVariableDynamicEventIdMonicaJoins = function () {
    const charaSlotId = 13;
    goodsEvent_respawn(charaSlotId, "food_1", 4, 6, 1, 13, 5);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event._spriteOffsetX = 20;
    event._spriteOffsetY = 0;
    event._priorityType = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
  AGH_runScriptMonicaJoins = function (interp) {
    const array = [0];
    const randomYOffsets = [50];
    const lineCandidates = ["モグモグ──サクサク──"];
    chara_oneWord(100, interp._eventId, 25, 180, array, randomYOffsets, lineCandidates, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
  AGH_eraseMapEventDynamicEventIdMonicaJoins = function () {
    //var value1 = 13;
    $gameMap.eraseEvent($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[13]);
  };

  // Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
  AGH_readVariableEventProgressHero_8 = function (interp) {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 38, 18, 1, 2);
    charaSlotId = 2; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 38, 20, 0, 8);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    charaSlotId = 3; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 37, 17, 0, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
  AGH_readVariableDynamicEventId_5 = function () {
    const array = [0];
    const randomYOffsets = [-50];
    const lineCandidates = ["了解！"];
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    chara_oneWord(100, spawnedEventIds[1], 25, 180, array, randomYOffsets, lineCandidates, 0);
    chara_oneWord(101, spawnedEventIds[3], 25, 180, array, randomYOffsets, lineCandidates, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:331|[31]秘密の入口
  AGH_readVariableEventProgressHeroSecretEntrance = function (interp) {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 70, 12, 0, 8);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    charaSlotId = 2; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 71, 11, 1, 2);
    charaSlotId = 3; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 70, 13, 0, 8);
  };

  // Replaces (1x): CommonEvents.json:common-event:333|[33]地底研究所
  AGH_readVariableEventProgressHeroUndergroundLab = function (interp) {
    let spawnSlot;
    spawnSlot = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    spawnSlot = spawnedEventIds[spawnSlot];
    drowsepost.camera.zoom(1, 60, spawnSlot);
    spawnSlot = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    interp._eventId = spawnedEventIds[spawnSlot];
  };

  // Replaces (1x): CommonEvents.json:common-event:333|[33]地底研究所
  AGH_readMapEventMetaRandomWork1 = function (interp) {
    const eventId = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    const mapEvent = $gameMap.event(eventId);
    if (!!mapEvent) {
      if (mapEvent.event().meta["Researcher"]) {
        mapEvent.forceMoveRoute({
          list: [
            { code: 29, parameters: [5] },
            { code: 45, parameters: ["this.startOpacity(120,0);"] },
            { code: 45, parameters: ["Move To: 23, 20;"] },
            { code: 45, parameters: ["this.erase();"] },
            { code: 0 }
          ],
          repeat: false,
          skippable: true
        });
        interp.wait(10);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:334|[34]アウギュステで分散
  AGH_readVariableEventProgressHeroAugusteDisperse = function () {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3], npcPreset[4], 1);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setImage(npcPreset[1], npcPreset[2]);
    event.setDirection(npcPreset[5]);
    charaSlotId = 2; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 19, 3, 0, 8);
  };

  // Replaces (1x): CommonEvents.json:common-event:336|[36]情報屋に話を聞く
  AGH_readVariableEventProgressHeroAskInfoBroker = function (interp) {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, 6, 11, 1, 8);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    charaSlotId = 11;
    event_respawnSetN(charaSlotId, npcPreset[8], npcPreset[9], 0, npcPreset[6], npcPreset[7]);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setDirection(2);
  };

  // Replaces (1x): CommonEvents.json:common-event:337|[37]丘陵地帯からの…
  AGH_readVariableDynamicEventIdFromHills = function (interp) {
    const eventId = 6; //$gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[11]; //this._eventId
    const event = $gameMap.event(eventId);
    event.setStepAnime(false);
    event.setWalkAnime(false);
    event.setDirection(2);
    event.resetPattern();
    event._originalPattern = 1;
    event.setAngle(45);
    event._spriteOffsetX = -12;
    event._spriteOffsetY = -12;
    event._kageM.clear();
    event.setFace(6, true, true, 0, 6, 0, 6); //Child用
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_runScriptBBAkunin3 = function () {
    const id = 11;
    event_respawnSetN(id, 10, 12, 1, "BB_akunin3", 5, 2);
    event_respawnSetN(id + 1, 9, 13, 0, "BB_akunin3", 6, 6);
    event_respawnSetN(id + 2, 11, 13, 0, "BB_akunin3", 6, 4);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableDynamicEventIdAirPirateRemnantSuppression = function (interp) {
    const id = 20;
    goodsEvent_respawn(id, "!Door1", 2, 2, 1, 10, 19);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    const event = $gameMap.event(spawnedEventIds[id]);
    event._priorityType = 0;
    interp._eventId = spawnedEventIds[id];
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableDynamicEventId_6 = function (interp) {
    let event;
    const dynamicEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    for (let i = 11; i <= 13; i++) {
      const eventId = dynamicEventIds[i]; //this._eventId
      event = $gameMap.event(eventId);
      event.requestBalloon(1);
      event.setDirection(2);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableDynamicEventId_7 = function (interp) {
    const id = 17; //
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event_charaZanzou(interp._eventId, spawnedEventIds[id]);
    interp._eventId = $gameMap.event(spawnedEventIds[id]);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableDynamicEventId_8 = function (interp) {
    let event;
    const dynamicEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    for (let i = 11; i <= 13; i++) {
      const eventId = dynamicEventIds[i]; //this._eventId
      event = $gameMap.event(eventId);
      event.requestAnimation(371);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableDynamicEventId_9 = function () {
    let lineCandidates, id;
    const array = [0];
    const randomYOffsets = [-50];
    lineCandidates = ["ギャアァッ！！"];
    id = 11;
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    chara_oneWord(101, spawnedEventIds[id], 25, 180, array, randomYOffsets, lineCandidates, 0);
    lineCandidates = ["グエッ"];
    id = 12;
    chara_oneWord(102, spawnedEventIds[id], 25, 180, array, randomYOffsets, lineCandidates, 0);
    lineCandidates = ["ガッ…"];
    id = 13;
    chara_oneWord(103, spawnedEventIds[id], 25, 180, array, randomYOffsets, lineCandidates, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableDynamicEventId_10 = function (interp) {
    let event;
    const dynamicEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    for (let i = 11; i <= 13; i++) {
      AudioManager.playSe({ name: "Z_Collaps", volume: 50, pitch: 70, pan: 0 });
      const eventId = dynamicEventIds[i]; //this._eventId
      event = $gameMap.event(eventId);
      event.setStepAnime(false);
      event.setWalkAnime(false);
      event.setDirection(2);
      event.resetPattern();
      event._originalPattern = 1;
      event.setAngle(45);
      event._spriteOffsetX = -12;
      event._spriteOffsetY = -12;
      event._kageM.clear();
      event.setFace(6, true, true); //Child用
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableDynamicEventId_11 = function (interp) {
    AudioManager.playSe({ name: "Z_Collaps", volume: 50, pitch: 70, pan: 0 });
    const eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[5]; //this._eventId
    const event = $gameMap.event(eventId);
    event.setStepAnime(false);
    event.setWalkAnime(false);
    event.setDirection(2);
    event.resetPattern();
    event._originalPattern = 1;
    event.setAngle(45);
    event._spriteOffsetX = -12;
    event._spriteOffsetY = -12;
    event._kageM.clear();
    event.setFace(6, true, true, 0, 6, 0, 6);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableEventProgressHeroAirPirateRemnantSuppression = function (interp) {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 10, 15, 1, 8);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    charaSlotId = 12;
    event_respawnSetN(charaSlotId, 10, 12, 0, "BB_akunin3", 5, 2);
    event_respawnSetN(charaSlotId + 1, 9, 13, 0, "BB_akunin3", 6, 6);
    event_respawnSetN(charaSlotId + 2, 11, 13, 0, "BB_akunin3", 6, 4);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableDynamicEventId_12 = function (interp) {
    let event;
    const dynamicEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    for (let i = 12; i <= 14; i++) {
      const eventId = dynamicEventIds[i]; //this._eventId
      event = $gameMap.event(eventId);
      event.setStepAnime(false);
      event.setWalkAnime(false);
      event.setDirection(2);
      event.resetPattern();
      event._originalPattern = 1;
      event.setAngle(45);
      event._spriteOffsetX = -12;
      event._spriteOffsetY = -12;
      event._kageM.clear();
      event.setFace(6, true, true); //Child用
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableEventProgressHero_9 = function () {
    const charaSlotId = 5; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 8, 12, 1, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableEventProgressHero_10 = function () {
    const id = 5; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[id]);
    event.setStepAnime(false);
    event._priorityType = 2;
    event._spriteOffsetX = +10;
    event._spriteOffsetY = -58;
    event._kageM.clear();
    event.setFace(6, true, true, 0, 6, 0, 6); //Child用
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_playSeZClothesTakeOff = function () {
    const ZClothesTakeOff = "Z_ClothesTakeOff"; //ピッチ50か100。消去ウェイトで変更
    AudioManager.playSe({ name: ZClothesTakeOff, volume: 150, pitch: 50, pan: 0 });
    tachie_dousa(2, 1, 4, 14, 1, 255, 1319, 0, 0);
    tachie_dousa(2, 1, 4, 14, 1, 255, 1320, 0, 0);
    tachie_dousa(2, 1, 4, 14, 1, 255, 1321, 0, 0);
    tachie_dousa(2, 1, 4, 14, 1, 255, 1322, 0, 0);
    tachie_dousa(0, 1, 18, 13, 14, 0, 180, 1, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_playSeZClothesTakeOffAirPirateRemnantSuppression = function () {
    const ZClothesTakeOff = "Z_ClothesTakeOff"; //ピッチ50か100。消去ウェイトで変更
    AudioManager.playSe({ name: ZClothesTakeOff, volume: 150, pitch: 100, pan: 0 });
    tachie_dousa(0, 1, 22, 12, 13, 1318, 120, 0, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_showPictureGoodsDrag1 = function () {
    valuePic1 = 55;
    valueScenePic = "Goods_drag1_";
    $gameScreen.setPicturesAnimation(2, 30, "連番", 60);
    const scenePictureName = valueScenePic + "00";
    $gameScreen.showPicture(valuePic1, scenePictureName, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_configureMapEventAirPirateRemnantSuppression = function (interp) {
    const event = $gameMap.event(interp._eventId);
    const xValue = event.screenX();
    const yValue = event.screenY();
    filter_direct(9, xValue, yValue, 20);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_showPictureZXMain037 = function () {
    let pictureName;
    backGraund_menuMapSelect(2, 0, 0, 0);
    valuePic1 = 51;
    valuePic2 = 71;
    valueScenePic = "ZX_Main037_";
    pictureName = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640, 384, 100, 100, 200, 0);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
    pictureName = valueScenePic + "01";
    $gameScreen.showPicture(valuePic2 + 1, pictureName, 1, 640 + 480, 384 - 118, 100, 100, 200, 0);
    $gameScreen.movePicture(valuePic2 + 1, 1, 640 + 480, 384 + 50, 100, 100, 255, 0, 240);
    tachie_bless(valuePic2 + 1, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_showPictureScreen1024Frame = function () {
    let pictureName;
    pictureName = valueScenePic + "02";
    $gameScreen.showPicture(valuePic1 + 1, pictureName, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1 + 1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    tachie_bless(valuePic1 + 1, 2);
    pictureName = "Screen1024Frame";
    $gameScreen.showPicture(valuePic2, pictureName, 1, 640 - 78, 384, 100, 100, 255, 0);
    picture_fade1(valuePic2, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_showPictureAirPirateRemnantSuppression = function () {
    // The right hand picture sits 480 pixels to the right and 50 pixels lower.
    const rightPictureId = valuePic2 + 2;
    const rightPictureName = valueScenePic + "03";
    showScenePicture(rightPictureId, rightPictureName, { x: RIGHT_PICTURE_X, y: 384 + 50 });
    tachie_bless(rightPictureId, 2);
    pic_move1(rightPictureId - 1, 0, 0, 100, 100, 0, 90);

    const pictureId = valuePic1 + 2;
    showScenePicture(pictureId, valueScenePic + "04");
    tachie_bless(pictureId, 2);
    pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_showPicturePictureParallelLoop = function () {
    const pictureId = valuePic1 + 4;
    const scenePictureName = valueScenePic + "04a";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 150, 0);
    pic_setArray1 = [1, pictureId, 0, 5, 0, 30];
    pic_setArray2 = [1, pictureId, 0, 0, 3, 30]; //pic_setArray2 = [1,0,0,0,0,0];
    valueParallelPicSe1 = ["ZH_sticky4", 20, 60];
    valueParallelPicSe2 = ["ZH_sticky1", 20, 60];
    hcg_piston(pictureId, 7, 2, 1);
    $gameSwitches.setValue(HELPER_SWITCH.LOOP_PICTURE_MOVEMENT, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  // Shows a scene picture at opacity 0, fades it in and moves its companion layer.
  function showFadedScenePicture(pictureId, pictureName, blessLevel, companionPictureId) {
    $gameScreen.showPicture(pictureId, pictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    tachie_bless(pictureId, blessLevel);
    pic_move1(companionPictureId, 0, 0, 100, 100, 0, 90);
  }

  AGH_showPictureAirPirateRemnantSuppression_2 = function () {
    const pictureId = valuePic1 + 5;
    const pictureName = valueScenePic + "06";
    showFadedScenePicture(pictureId, pictureName, 2, pictureId - 1);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_showPictureAirPirateRemnantSuppression_3 = function () {
    $gameScreen.setPicturesAnimation(2, 10, "連番", 20);
    const pictureId = valuePic1 + 6;
    const scenePictureName = valueScenePic + "05_00";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    const picture2 = $gameScreen.picture(pictureId);
    if (picture2) {
      picture2.startAnimationFrame(1, true, [1, 1, 1, 2]);
    }
    tachie_bless(pictureId, 2);
    pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableEventProgressHero_11 = function () {
    const spawnSlot = 5; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[spawnSlot]);
    event.setStepAnime(true);
    event._priorityType = 2;
    event._spriteOffsetX = -10;
    event._spriteOffsetY = +58;
    event.removeFace();
    event.setDirection(8);
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableDynamicEventId_13 = function (interp) {
    const eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[11]; //this._eventId
    const event = $gameMap.event(eventId);
    event.setStepAnime(false);
    event.setWalkAnime(false);
    event.setDirection(2);
    event.resetPattern();
    event._originalPattern = 1;
    event.setAngle(45);
    event._spriteOffsetX = -12;
    event._spriteOffsetY = -12;
    event._kageM.clear();
    event.setFace(6, true, true); //Child用
  };

  // Spawn slots and tiles of the four companion events of the prison room.
  const PRISON_ROOM_TILES = [
    { spawnSlotId: 11, x: 4, y: 16 },
    { spawnSlotId: 12, x: 5, y: 16 },
    { spawnSlotId: 13, x: 4, y: 17 },
    { spawnSlotId: 14, x: 5, y: 17 }
  ];

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableEventProgressHero_12 = function () {
    // Four companion events are parked on the four tiles of the prison room.
    PRISON_ROOM_TILES.forEach(function (tile) {
      spawnedEvent(tile.spawnSlotId).locate(tile.x, tile.y);
    });
  };

  // Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
  AGH_readVariableEventProgressHero_13 = function () {
    let spawnSlot, event;
    spawnSlot = 5; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event = $gameMap.event(spawnedEventIds[spawnSlot]);
    event.locate(4, 11);
    event.setDirection(2);
    event.setScale(100, 90);
    spawnSlot = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event = $gameMap.event(spawnedEventIds[spawnSlot]);
    event.locate(22, 6);
    event.setDirection(2);
    event._spriteOffsetX = -48;
    event._spriteOffsetY = -24;
    event.setStepAnime(false);
    event.setWalkAnime(false);
    event._kageM.clear();
    event.setFace(6, true, true); //Child用
  };

  // Replaces (1x): CommonEvents.json:common-event:339|[39]合流と分散
  AGH_showPictureZXMain038 = function () {
    valuePic1 = 55;
    valueScenePic = "ZX_Main038_";
    const scenePictureName = valueScenePic + "01";
    $gameScreen.showPicture(valuePic1, scenePictureName, 1, 640, 384, 100, 100, 250, 0);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:340|[40]謁見を申し出る
  AGH_readVariableEventProgressHeroRequestAudience = function () {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 13, 23, 1, 8);
    event_respawnSetA(5, 13, 24, 0, 8);
  };

  // Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
  AGH_readVariableEventProgressHeroPrisonDay1 = function () {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 12, 5, 1, 2);
    event_respawnSetA(5, 13, 6, 0, 4);
    event_respawnSetN(11, 18, 10, 0, "npcCastle1", 2, 4);
  };

  // Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
  AGH_readVariableEventProgressHero_14 = function (interp) {
    const charaSlotId = 12; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetN(charaSlotId, 16, 3, 1, "npcCastle1", 2, 2);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
  AGH_readVariableEventProgressHero_15 = function () {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 5, 8, 1, 8);
    event_respawnSetA(7, 5, 6, 0, 2);
    event_respawnSetN(12, 8, 5, 0, "npcCastle1", 2, 6);
    event_respawnSetN(13, 10, 9, 0, "npcCastle1", 2, 2);
    event_respawnSetN(14, 4, 9, 0, "npcCastle1", 2, 8);
    event_respawnSetN(15, 6, 9, 0, "npcCastle1", 2, 8);
  };

  // Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
  AGH_showPictureDungeon12 = function () {
    let pictureName;
    backGraund_menuMapSelect(2, 0, 0, 0); //'Dungeon1_2'
    valueScenePic = "ZX_Main040_";
    valuePic1 = 55;
    pictureName = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640, 384, 100, 100, 200, 0);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
    const pictureId = valuePic1 + 1;
    pictureName = valueScenePic + "01";
    $gameScreen.showPicture(pictureId, pictureName, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
  AGH_showPicturePrisonDay1 = function (pictureOffset = 3, sceneSuffix = "03") {
    picture_se1();
    const pictureId = valuePic1 + pictureOffset;
    const scenePictureName = valueScenePic + sceneSuffix;
    showScenePicture(pictureId, scenePictureName);
    pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
  AGH_movePicture1PrisonDay1 = function (opacity = 0) {
    picture_se1();
    const pictureId = valuePic1 + 3;
    pic_move1(pictureId, 0, 0, 100, 100, opacity, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
  AGH_movePicture1PrisonDay1_2 = function () {
    const pictureId = 55;
    pic_move1(pictureId, 0, 0, 0, 0, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
  AGH_movePicture1PrisonDay1_3 = function () {
    return AGH_movePicture1PrisonDay1(255);
  };

  // Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
  AGH_showPicturePrisonDay1_2 = function () {
    const pictureId = valuePic1 + 4;
    const scenePictureName = valueScenePic + "04";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 - 50, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
  AGH_showPicturePrisonDay1_3 = function () {
    return AGH_showPicturePrisonDay1(9, "13");
  };

  // Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
  AGH_showPicturePrisonDay1_4 = function () {
    return AGH_showPicturePrisonDay1(10, "14");
  };

  // Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
  AGH_readVariableEventProgressHeroPrisonDay6 = function (interp) {
    const charaSlotId = 12; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetN(charaSlotId, 16, 3, 1, "npcCastle1", 2, 2);
    //this._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[value1];
  };

  // Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
  AGH_waitPrisonDay6 = function (interp) {
    const id1 = 1;
    const id2 = 30;
    const array = ["ア", "ア", "ア", "ア", "ア", "～", "ン"];
    const wordBodyCandidates = ["゛", "゛", "゛", `\\C[27]♥\\C[0]`, `\\C[27]♡\\C[0]`, " "];
    const wordTailCandidates = [
      64, 60, 55, 50, 45, 40, 35, 64, 60, 55, 50, 45, 40, 35, 64, 60, 55, 50, 45, 40, 35, 14
    ];
    const shakeOffsetCandidates = [25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15];
    text_randumWord(21, id1, id2, array, wordBodyCandidates, wordTailCandidates, shakeOffsetCandidates);
    interp.wait(10);
  };

  // Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
  AGH_runScriptPrisonDay6 = function () {
    const actorName = "\\N[5]";
    const coloredText = colorTaggedText(2, "魔導ディスク");
    const messageText = `${actorName}は「${coloredText}」を手に入れた。`;
    TickerManager.show(messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
  AGH_readVariableEventProgressHero_16 = function (interp) {
    event_respawnSetA(episodeSubjectSlotId(), 11, 6, 1, 6);
    // Two background NPCs stand on fixed tiles, both looking left.
    placeSpawnedEvent(5, 13, 6, 4);
    placeSpawnedEvent(12, 18, 10, 4);
    interp._eventId = spawnedEventId(12);
  };

  // Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
  AGH_readVariableEventProgressHero_17 = function () {
    const charaSlotId = 13; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetN(charaSlotId, 12, 10, 0, "npcOrder1", 3, 8);
    event_partyCharaMove(16, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
  AGH_readVariableEventProgressHero_18 = function () {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 6, 9, 1, 2);
    event_respawnSetA(5, 7, 9, 0, 2);
    event_respawnSetA(2, 6, 10, 0, 8);
    event_respawnSetA(3, 7, 10, 0, 8);
    event_respawnSetA(4, 5, 10, 0, 8);
  };

  // Replaces (1x): CommonEvents.json:common-event:343|[43]誇りと秩序
  AGH_readVariableEventProgressHeroPrideAndOrder = function (interp) {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3], npcPreset[4], 1, npcPreset[5]);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    charaSlotId = 11;
    event_respawnSetN(charaSlotId, 13, 13, 0, "People3", 6, 2);
    event_respawnSetN(12, 10, 17, 0, "npcCastle1", 2, 6);
    event_respawnSetN(13, 10, 18, 0, "npcCastle1", 2, 6);
    event_respawnSetN(14, 16, 17, 0, "npcCastle1", 2, 4);
    event_respawnSetN(15, 16, 18, 0, "npcCastle1", 2, 4);
  };

  // Replaces (1x): CommonEvents.json:common-event:344|[44]宰相蓄電
  AGH_setVariableChoiceSwitch11 = function (interp) {
    $gameVariables.setValue(HELPER_VARIABLE.EVENT_DESTINATION, [36, 13, 16]);
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 13, 16, 1, 8);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:345|[45]祭殿の隠し通路
  AGH_setVariableChoiceSwitch11ShrineSecretPath = function (interp) {
    let charaSlotId;
    $gameVariables.setValue(HELPER_VARIABLE.EVENT_DESTINATION, [108, 10, 9]);
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 10, 9, 1, 8);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    charaSlotId = 11;
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    goodsEvent_respawn(
      charaSlotId,
      npcPreset[6],
      npcPreset[7],
      npcPreset[10],
      npcPreset[11],
      npcPreset[8],
      npcPreset[9]
    );
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event._priorityType = 1;
    event._spriteOffsetX = +12;
  };

  // Replaces (1x): CommonEvents.json:common-event:346|[46]遺跡の守護者
  AGH_readVariableDynamicEventIdRuinsGuardian = function () {
    let popupEventId;
    popupEventId = 12;
    popupEventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[popupEventId];
    message_popup2(popupEventId, 0, 2, 1);
    //message_popup2(0,[1024,368],1,1);
    //ｲﾍﾞﾝﾄid,ﾌｷﾀﾞｼ位置,行数,1で有効化。\sh[5] で振動強さ指定
    //0で座標指定,xyは中心点を指定
    //mpp文字操作との相性が悪い
  };

  // Replaces (1x): CommonEvents.json:common-event:349|[49]終幕
  AGH_readVariableEventProgressHeroFinale = function (interp) {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 8, 4, 1, 2);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    goodsEvent_respawn(11, "Goods8", 0, 4, 1, 8, 5);
    goodsEvent_respawn(12, "Goods8", 0, 6, 0, 7, 5);
    goodsEvent_respawn(13, "Goods8", 0, 6, 0, 9, 5);
    goodsEvent_respawn(14, "Goods7", 5, 8, 1, 7, 6);
    goodsEvent_respawn(15, "Goods7", 5, 8, 1, 9, 6);
  };

  // Replaces (1x): CommonEvents.json:common-event:350|[50]次なる戦いへ──
  AGH_readVariableEventProgressHeroNextBattle = function (interp) {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3], npcPreset[4], 1);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setImage(npcPreset[1], npcPreset[2]);
    event.setDirection(npcPreset[5]);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    charaSlotId = 2; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, npcPreset[3], npcPreset[4] + 3, 1, 8);
    goodsEvent_respawn(11, "Goods8", 0, 6, 1, 8, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:355|戦闘時台詞集
  AGH_pushToArrayAddText = function () {
    const messageText = `\\wn[351]が\\sim[331]を発動した！`;
    BattleManager._logWindow.push("addText", messageText);
  };

  // Replaces (1x): CommonEvents.json:common-event:356|ハイゴブリン勝利
  AGH_readVariableEventProgressHeroHighGoblinVictory = function (interp) {
    let characterId;
    characterId = 5; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    characterId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[characterId];
    character = interp.character(characterId);
    character.locate(12, 11);
    character.setDirection(8);
  };

  // Replaces (1x): CommonEvents.json:common-event:356|ハイゴブリン勝利
  AGH_readVariableEventProgressHero_19 = function (interp) {
    let xValue;
    xValue = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[xValue];
    const event = $gameMap.event(interp._eventId);
    xValue = event.screenX();
    const yValue = event.screenY();
    filter_direct(9, xValue, yValue, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:356|ハイゴブリン勝利
  AGH_readVariableEventProgressHero_20 = function () {
    let variable292Value2, event;
    variable292Value2 = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    variable292Value2 = spawnedEventIds[variable292Value2];
    event = $gameMap.event(variable292Value2);
    event.setOpacity(0);
    variable292Value2 = 5; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    variable292Value2 = spawnedEventIds[variable292Value2];
    event = $gameMap.event(variable292Value2);
    event.setOpacity(0);
  };

  // Replaces (1x): CommonEvents.json:common-event:358|空賊ボス勝利
  AGH_configureMapEventAirPirateBossVictory = function (interp) {
    const eventId = interp._eventId; //this._eventId
    const event = $gameMap.event(eventId);
    event.setStepAnime(false);
    event.setWalkAnime(false);
    event.setDirection(2);
    event.resetPattern();
    event._originalPattern = 1;
    event.setAngle(45);
    event._spriteOffsetX = -12;
    event._spriteOffsetY = -12;
    event._kageM.clear();
    event.setFace(6, true, true); //Child用
  };

  // Replaces (1x): CommonEvents.json:common-event:359|ガーディアン勝利
  AGH_readVariableEventProgressHeroGuardianVictory = function (interp) {
    let xValue;
    xValue = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[xValue];
    const event = $gameMap.event(interp._eventId);
    xValue = event._realX;
    const yValue = event._realY;
    filter_direct(9, xValue, yValue, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:360|ガーディアン2勝利
  AGH_readVariableEventProgressHeroGuardian2Victory = function () {
    let eventSubjectIndex, event;
    eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event.locate(7, 24);
    event.setDirection(8);
    eventSubjectIndex = 2; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event.locate(6, 23);
    event.setDirection(6);
    eventSubjectIndex = 3; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event.locate(8, 23);
    event.setDirection(4);
  };

  // Replaces (1x): CommonEvents.json:common-event:360|ガーディアン2勝利
  AGH_showPictureGoodsBook1 = function () {
    valuePic1 = 55;
    const GoodsBook1 = "Goods_Book1";
    $gameScreen.showPicture(valuePic1, GoodsBook1, 1, 640, 384 - 20, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1, 1, 640, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:361|騎士団長勝利
  AGH_readVariableEventProgressHeroKnightLeaderVictory = function () {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 13, 15, 1, 8);
    charaSlotId = 11;
    event_respawnSetN(charaSlotId, 13, 13, 0, "People3", 6, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:361|騎士団長勝利
  AGH_readVariableEventProgressHero_21 = function (interp) {
    let eventSubjectIndex, event;
    eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event._spriteOffsetY = -24;
    eventSubjectIndex = 11;
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event._spriteOffsetY = +24;
    interp._eventId = spawnedEventIds[eventSubjectIndex];
  };

  // Replaces (1x): CommonEvents.json:common-event:361|騎士団長勝利
  AGH_readVariableDynamicEventIdKnightLeaderVictory = function (interp) {
    const charaSlotId = 17; //
    event_charaZanzou(interp._eventId, charaSlotId);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:363|グドン勝利
  AGH_readVariableEventProgressHeroGudonVictory = function (interp) {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 12, 10, 1, 8);
    //this._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[variable530Value];
  };

  // Replaces (1x): CommonEvents.json:common-event:363|グドン勝利
  AGH_configureMapEventGudonVictory = function (interp) {
    const event = $gameMap.event(interp._eventId);
    const fadePatternName = "Hscene005"; //102一刀両断 Hscene005崩壊 008横両断 054封印 153内側から
    event._GWInfo = $gameScreen.createGWInfo(["fadeOut", fadePatternName, 300, 5]);
  };

  // Replaces (1x): CommonEvents.json:common-event:364|\N[5]勝利
  AGH_configureMapEventActor5Victory = function () {
    const mapEvent = $gameMap.event(12);
    if (!!!mapEvent) return;

    const event = mapEvent;
    event.setStepAnime(false);
    event.setWalkAnime(false);
    event.setDirection(2);
    event.resetPattern();
    event._originalPattern = 1;
    event.setAngle(45);
    event._spriteOffsetX = -12;
    event._spriteOffsetY = -12;
    event._kageM.clear();
    event.setFace(6, true, true); //Child用event.setFace(6,true,true,0,6,0,6);
  };

  // Replaces (4x): CommonEvents.json:common-event:368|コマンド, CommonEvents.json:common-event:495|サンプル, CommonEvents.json:common-event:532|サンプル, CommonEvents.json:common-event:548|
  AGH_showPictureCommand = function (sceneSuffix = "02", pictureOffset = 1, fadeFrames = 60, blessType = 2) {
    backGraund_menuMapSelect(2, 0, 0, 0);
    valuePic1 = 51;
    const pictureId = valuePic1 + pictureOffset;
    const scenePictureName = valueScenePic + sceneSuffix;
    showScenePicture(pictureId, scenePictureName, { duration: fadeFrames });
    if (blessType !== null) tachie_bless(pictureId, blessType);
  };

  // Replaces (5x): CommonEvents.json:common-event:368|コマンド, CommonEvents.json:common-event:412|, CommonEvents.json:common-event:495|サンプル, CommonEvents.json:common-event:532|サンプル, CommonEvents.json:common-event:548|
  AGH_showPictureZXMain037Command = function () {
    backGraund_menuMapSelect(2, 0, 0, 0);
    valuePic1 = 55;
    valuePic2 = 71;
    valueScenePic = "ZX_Main037_";
    const ScreenBlackOut = "ScreenBlackOut";
    $gameScreen.showPicture(51, ScreenBlackOut, 1, 640, 384, 100, 100, 150, 0);
    picture_fade1(51, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:370|素体
  AGH_setSelfVariableEventProgressHeroBaseBody = function (interp) {
    $gameVariables.setValue(530, 1); //主格キャラ
    $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 12, 12, 1, 8);
  };

  // Replaces (1x): CommonEvents.json:common-event:381|情報屋処理
  AGH_setSwitchRandomWork1InfoBrokerProcessing = function () {
    const itemPrice = $dataItems[$gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID)].price;
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_1, itemPrice.toLocaleString());
    if ($gameParty.gold() >= itemPrice) {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, true);
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, false);
    }
    valueCountSet2 = itemPrice;
  };

  // Replaces (1x): CommonEvents.json:common-event:381|情報屋処理
  AGH_setSwitchActorChoiceInfoBrokerProcessing = function () {
    //actor is a dead verbatim leftover: switch checks below do not use it
    //const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    if ($gameSwitches.value(508)) {
      if ($gameSwitches.value(1007) && !$gameSwitches.value(1107)) {
        $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, true);
      }
    }
    if ($gameSwitches.value(508)) {
      if ($gameSwitches.value(1008) && !$gameSwitches.value(1108)) {
        $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, true);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:381|情報屋処理
  AGH_setSwitchActorChoice_2 = function () {
    //actor is a dead verbatim leftover: switch checks below do not use it
    //const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    if ($gameSwitches.value(508)) {
      if ($gameSwitches.value(1009) && !$gameSwitches.value(1109)) {
        $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, true);
      }
    }
    if ($gameSwitches.value(508)) {
      if ($gameSwitches.value(1109)) {
        $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, true);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:381|情報屋処理
  AGH_setSelfVariableRandomWork3 = function (interp) {
    let animationId;
    animationId = 507;
    if ($gameSwitches.value(1107)) {
      animationId = 508;
    }
    if ($gameSwitches.value(1108)) {
      animationId = 509;
    }
    if ($gameSwitches.value(1109)) {
      animationId = 1000;
    }
    if ($gameSwitches.value(1110)) {
      animationId = 1000;
    }
    valueCountSet1 = animationId;
    if (valueCountSet1 == 1000) {
      $gameVariables.setValue(23, "汎用シーン発生");
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, true);
    } else {
      $gameVariables.setValue(23, `${$dataItems[valueCountSet1].description}`);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
  AGH_setSelfVariableEventProgressHeroCareForDrunkard = function (interp) {
    valueScenePic = "XevS006_";
    //var value2 = valueScenePic+'01';
    valueVariable163Set = 5;
    $gameVariables.setValue(530, 1); //主格キャラ
    $gameVariables.setValue(535, 502); //挿話回想の場合アイテムID。メインは0
    valueWeatherSceneSet = 15;
  };

  // Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
  AGH_showPictureScreenBlackOutCareForDrunkard = function () {
    let pictureName;
    valuePic1 = 51;
    pictureName = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640, 384, 100, 100, 150, 0);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
    pictureName = valueScenePic + "01";
    $gameScreen.showPicture(valuePic1 + 1, pictureName, 1, 640 - 128, 384 - 10, 100, 100, 255, 0);
    $gameScreen.movePicture(valuePic1 + 1, 1, 640 - 128, 384, 100, 100, 255, 0, 40);
    hcg_piston(valuePic1 + 1, 6, 1, 1);
  };

  // Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
  AGH_runPluginCommandCutInNoWait = function (interp) {
    const scenePictureName = valueScenePic + "05";
    $gameSwitches.setValue(428, true);
    valueCutInSet1 = ["Ｈシーン演出", scenePictureName, 270, 1.5, 1.2, 25, 120];
    const args = new Array(String(valueCutInSet1[0]));
    interp.pluginCommand("味方カットイン", args);
    $gameSwitches.setValue(428, false);
  };

  // Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
  AGH_showPictureCareForDrunkard = function () {
    let pictureName;
    pictureName = valueScenePic + "04";
    $gameScreen.showPicture(valuePic1 + 4, pictureName, 1, 640 - 128, 384 + 100, 100, 100, 255, 0);
    $gameScreen.movePicture(valuePic1 + 4, 1, 640 - 128, 384, 100, 100, 255, 0, 40);
    hcg_piston(valuePic1 + 4, 7, 2, 2);
    pictureName = valueScenePic + "02";
    pic_1(0, valuePic1 + 2, pictureName, 2, 100, 255, 40, 1280, 768, -256, 0);
    hcg_piston(valuePic1 + 2, 6, 1, 1);
    sex_direction(6, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
  AGH_setSelfVariableChoiceSwitch12CareForDrunkard = function (interp) {
    $gameVariables.setValue(172, 13);
    valueTalkSet = [640 - 128, 386, 200, false];
  };

  // Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
  AGH_runScriptCareForDrunkard = function () {
    const scenePictureName = valueScenePic + "03";
    pic_1(0, valuePic1 + 3, scenePictureName, 2, 100, 255, 40, 1280, 768, -256, 0);
    hcg_piston(valuePic1 + 3, 6, 1, 1);
  };

  // Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
  AGH_setSelfVariableChoiceSwitch12_3 = function (interp) {
    $gameVariables.setValue(172, 13);
    valueTalkSet = [640 - 128, 386, 200, false];
    interp.setupChild($dataCommonEvents[60].list, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
  AGH_setSwitchCareForDrunkard = function () {
    if (eval(valueSceneConditions1)) {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, true);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:387|闘技場受付2
  AGH_setSwitchSpecialMeasureDenied = function () {
    if ($gameSwitches.value(637)) {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, false);
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, true);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:389|情報屋汎用
  AGH_setSwitchNonHSceneBGVStart = function () {
    //actor is only referenced by the commented debug block below
    //const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    //if(actor.meta['SexualEcstasyHi']){var SexualEcstasyHiList = actor1.meta['SexualEcstasyHi'].split(',')};//SexualEcstasyLow  SexualEcstasyMiddle
    //var arr1 = ['（ドキっ）','（ドキドキ）','（ドクン）','ドキッ'];//文字BGV
    const textCandidates = [
      "「アッ\\I[12]」",
      "「ンッ\\I[12]」",
      "「ンン…\\I[12]」",
      "「ンクっ…\\I[12]」",
      "「ァンっ…\\I[12]」"
    ]; //文字BGV
    //var arr1 = ['「………ァっ」','「いや…」','「ンン──……」','「ンクっ…」','「ァンっ…」'];//文字BGV
    htext_word(3); //3高2中1低
    const backgroundWords = textCandidates.concat(valueHtextWord);
    $gameVariables.setValue(707, backgroundWords);
    $gameVariables.setValue(706, [640 - 128, 386, 1, 60, 0, "eromangasimaji"]);
    $gameSwitches.setValue(HELPER_SWITCH.NON_ADULT_BACKGROUND_VOICE, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:390|娼館コモン
  AGH_floor = function () {
    i1 = getRandomIndex(6) + 1; //人数
    i2 = getRandomIndex(7) + 3; //膣回数
    i3 = Math.floor(Math.random() * -2) + i1; //中だし回数
    i4 = getRandomIndex(5) + 0; //アナル回数
    i5 = Math.floor(Math.random() * -2) + 0; //中だし回数
    i6 = getRandomIndex(2) + 1; //フェラ回数
    i7 = getRandomIndex(1) + i4; //口腔回数
    i8 = getRandomIndex(3) + 0; //失禁回数
    return { i1: i1, i2: i2, i3: i3, i4: i4, i5: i5, i6: i6, i7: i7, i8: i8 };
  };

  // Replaces (1x): CommonEvents.json:common-event:392|トウロウコモン1
  AGH_movePicture1ToroCommon1 = function (
    pictureOffset = 1,
    sceneSuffix = "01",
    motionType = 1,
    motionStrength = 50
  ) {
    const pictureId = valuePic1 + pictureOffset;
    pic_showMove1(pictureId, valueScenePic + sceneSuffix, 512, 384, 100, 60, motionType, motionStrength);
    tachie_bless(pictureId, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:392|トウロウコモン1
  AGH_movePicture1ToroCommon1_2 = function () {
    const pictureId = valuePic1 + 2;
    pic_showMove1(pictureId, valueScenePic + "11", 640 - 128, 384, 100, 60, 1, -50);
    hcg_piston(pictureId, 7, 1, 1);
    //pic_move1(pictureId-1,0,0,100,100,0,90);
  };

  // Replaces (1x): CommonEvents.json:common-event:392|トウロウコモン1
  AGH_erasePicturesToroCommon1 = function () {
    for (let i = 0; i <= 3; i++) {
      pic_eraseP(0, [valuePic1 + i]);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:400|↓挿話集コモン500まで
  AGH_initValueScenePic = function () {
    valueScenePic = "XevO001_";
    //var value2 = valueScenePic+'01';
  };

  // Replaces (1x): CommonEvents.json:common-event:410|立ち上がる秩序
  AGH_showPictureScreenBlackOutRisingOrder = function () {
    valuePic1 = 51;
    const blackOutPictureId = valuePic1;
    const blackOutName = "ScreenBlackOut";
    $gameScreen.showPicture(blackOutPictureId, blackOutName, 1, 640, 384, 100, 100, 200, 0);
    picture_fade1(blackOutPictureId, "fadeIn", valueWipeImg, 60, 5);
    const pictureId = valuePic1 + 1;
    const pictureName = valueScenePic + "01";
    showScenePicture(pictureId, pictureName);
    tachie_bless(pictureId, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:411|無頓着な秩序
  AGH_waitNonchalantOrder = function (interp) {
    valuePic1 = 16;
    const picture = $gameScreen.picture(valuePic1).x();
    const pictureX = $gameScreen.picture(13).x();
    picTachie_move1(valuePic1, pictureX - picture - 200, 0, 0, 0, 255, 30);
    interp.wait(30);
  };

  // Replaces (1x): CommonEvents.json:common-event:411|無頓着な秩序
  AGH_waitNonchalantOrder_2 = function (interp) {
    valuePic1 = 16;
    const picture = $gameScreen.picture(valuePic1).scaleX();
    picTachie_move1(valuePic1, 0, 0, picture - picture - picture, 0, 255, 30);
    interp.wait(30);
  };

  // Replaces (1x): CommonEvents.json:common-event:411|無頓着な秩序
  AGH_waitPortraitTalkHurry = function (interp) {
    let floorValue;
    picTachie_move1(16, -500, 0, 0, 0, 0, 60);
    valuePic1 = 13;
    picTachie_move1(valuePic1, -500, 0, 0, 0, 0, 60);
    if ($gameSwitches.value(127)) {
      AudioManager.playSe({ name: "Z_FootCastle", volume: 25, pitch: 140, pan: 0 });
      floorValue = Math.floor(floorValue / 2); //ウェイト
    } else {
      AudioManager.playSe({ name: "Z_FootCastle", volume: 25, pitch: 100, pan: 0 });
    }
    interp.wait(60);
  };

  // Replaces (1x): CommonEvents.json:common-event:412|
  AGH_showPictureScreenBlackOutCommonEvent412 = function () {
    backGraund_menuMapSelect(2, 0, 0, 0);
    valuePic1 = 51;
    const blackOutPictureId = valuePic1;
    const blackOutName = "ScreenBlackOut";
    $gameScreen.showPicture(blackOutPictureId, blackOutName, 1, 640, 384, 100, 100, 200, 0);
    picture_fade1(blackOutPictureId, "fadeIn", valueWipeImg, 60, 5);
    const pictureId = valuePic1 + 1;
    const pictureName = valueScenePic + "02";
    showScenePicture(pictureId, pictureName);
    tachie_bless(pictureId, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:414|副船団長の密かな疑問
  AGH_runScriptViceCaptainDoubt = function () {
    const parallaxName = "/img/parallaxes/BG_Town1";
    parallax_scroll(7, parallaxName, 0, 20, 0.2, 0, 255);
  };

  // Replaces (1x): CommonEvents.json:common-event:431|未必の陰謀
  AGH_readVariableDynamicEventIdHiddenConspiracy = function (interp) {
    const charaSlotId = 16;
    event_respawnSetN(charaSlotId, 6, 15, 0, "npcOrder1", 5);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setDirection(8);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:431|未必の陰謀
  AGH_readVariableDynamicEventId_14 = function (
    interp,
    spawnSlot = 17,
    spawnX = 8,
    spawnY = 7,
    characterName = "npcOrder1",
    characterIndex = 1
  ) {
    event_respawnSetN(spawnSlot, spawnX, spawnY, 0, characterName, characterIndex);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[spawnSlot];
  };

  // Replaces (1x): CommonEvents.json:common-event:432|休暇のすゝめ
  AGH_readVariableEventProgressHeroRecommendVacation = function () {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    charaSlotId = 11;
    event_respawnSetN(charaSlotId, npcPreset[8], npcPreset[9], 0, npcPreset[6], npcPreset[7], 4);
  };

  // Replaces (1x): CommonEvents.json:common-event:441|△人助け
  AGH_readVariableEventProgressHeroHelpingHands = function () {
    const npcPreset = currentNpcPreset();
    // The subject stands five tiles left of its preset tile.
    respawnEpisodeSubjectNpc(episodeSubjectSlotId(), npcPreset, npcPreset[3] - 5);
    respawnEpisodeCompanionNpc(npcPreset);
  };

  // Replaces (1x): CommonEvents.json:common-event:441|△人助け
  AGH_readVariableDynamicEventIdHelpingHands = function (interp) {
    return AGH_readVariableDynamicEventId_13.apply(this, arguments);
  };

  // Replaces (1x): CommonEvents.json:common-event:442|△人助け2
  AGH_readVariableEventProgressHeroHelpingHands2 = function (interp) {
    const npcPreset = currentNpcPreset();
    const subjectSlotId = episodeSubjectSlotId();
    respawnEpisodeSubjectNpc(subjectSlotId, npcPreset, npcPreset[3] - 5);
    interp._eventId = spawnedEventId(subjectSlotId);
    respawnEpisodeCompanionNpc(npcPreset);
  };

  // Replaces (1x): CommonEvents.json:common-event:442|△人助け2
  AGH_runPluginCommandCutInNoWaitHelpingHands2 = function (interp) {
    valueScenePic = "XevO000_";
    const scenePictureName = valueScenePic + "02_00";
    $gameSwitches.setValue(428, true);
    valueCutInSet1 = ["カットインアクター会話", scenePictureName, -90, 4.5, 3.0, 25, 60];
    const args = new Array(String(valueCutInSet1[0]));
    interp.pluginCommand("味方カットイン", args);
  };

  // Replaces (1x): CommonEvents.json:common-event:442|△人助け2
  AGH_readVariableEventProgressHero_22 = function (interp) {
    const spawnSlot = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[spawnSlot];
    drowsepost.camera.zoom(1, 120, interp._eventId);
  };

  // Replaces (1x): CommonEvents.json:common-event:444|△りーしゃ人助け
  AGH_setSelfVariableChoiceSwitch12LishaHelpingHands = function (interp) {
    $gameVariables.setValue(172, 10); //文字ﾋﾟｸTips以外
    const messageText = `彼女が感じた最も近い感情は、「落胆」や「失意」と言ったものだろう。
		未だ歳若い、理想を胸に宿す少女には明確な理解が出来なかったのだ。
		何れはそこに至るやも知れぬが、それはこの物語に措いてでは無い…。
		`;
    valueTalkSet = [25, messageText];
  };

  // Replaces (1x): CommonEvents.json:common-event:451|雄ドラフ、驚愕する
  AGH_readVariableEventProgressHeroMaleDrafAstonished = function (interp) {
    return AGH_readVariableDynamicEventId_14(interp, 1, 16, 6, "1_1", 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:452|△露出王(上巻)を読む
  AGH_readVariableEventProgressHeroReadExposureKing = function (interp) {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3] + 1, npcPreset[4], 1, 2);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:452|△露出王(上巻)を読む
  AGH_readVariableDynamicEventIdReadExposureKing = function () {
    const charaSlotId = 11;
    goodsEvent_respawn(charaSlotId, "Goods7", 5, 8, 1, 14, 5);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event._spriteOffsetY = -20;
    event._priorityType = 2;
  };

  // Replaces (1x): CommonEvents.json:common-event:452|△露出王(上巻)を読む
  AGH_showPictureScreenBlackOutReadExposureKing = function () {
    let pictureName;
    backGraund_menuMapSelect(2, 0, 0, 0);
    valuePic1 = 55;
    pictureName = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1 - 1, pictureName, 1, 640, 384, 100, 100, 200, 0);
    picture_fade1(valuePic1 - 1, "fadeIn", valueWipeImg, 60, 5);
    pictureName = "ZX_NowconditionF_2";
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
  AGH_readVariableDynamicEventIdAwakenB = function (interp) {
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[11];
    drowsepost.camera.zoom(1, 60, interp._eventId);
  };

  // Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
  AGH_readVariableDynamicEventId_15 = function (interp) {
    const eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[5]; //this._eventId
    const mapEvent = $gameMap.event(eventId);
    if (!!!mapEvent) return;

    const event = mapEvent;
    event.setStepAnime(false);
    event.setWalkAnime(false);
    event.setDirection(2);
    event.resetPattern();
    event._originalPattern = 1;
    event.setAngle(45);
    event._spriteOffsetX = -12;
    event._spriteOffsetY = -12;
    event._kageM.clear();
    event.setFace(6, true, true, 0, 6, 0, 6); //Child用event.setFace(6,true,true,0,6,0,6);
  };

  // Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
  AGH_spawnMapEventDynamicEventIdAwakenB = function (interp) {
    const eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[5]; //this._eventId
    const positionX = $gameMap.event(eventId).x;
    const positionY = $gameMap.event(eventId).y;
    $gameMap.spawnEvent(190, positionX, positionY, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
  AGH_showPictureAwakenB = function () {
    valuePic1 = 55;
    const pictureName = "/img/parallaxes/Scene_Awaken_1";
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1, 1, 640, 384, 100, 100, 50, 0, 60);
    $gameScreen.rotatePicture(valuePic1, 0.1);
    hcg_piston(valuePic1, 7, 1, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
  AGH_movePictureLifeStormScreen = function () {
    $gameScreen.movePicture(valuePic1, 1, 640, 384, 100, 100, 100, 0, 60);
    const lifeStormScreen = "lifeStorm_screen";
    $gameScreen._particle.particleUpdate([lifeStormScreen, "particlesPerWave", String(10)]);
    $gameScreen._particle.particleUpdate([lifeStormScreen, "speed", String(200), String(0)]);
  };

  // Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
  AGH_updateParticleLifeStormScreen = function () {
    $gameScreen.movePicture(valuePic1, 1, 640, 384, 100, 100, 200, 0, 60);
    const lifeStormScreen = "lifeStorm_screen";
    $gameScreen._particle.particleUpdate([lifeStormScreen, "scale", "1", 0.2 + "@0.15", 0.05 + "@0.8", "0"]);
  };

  // Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
  AGH_setSelfVariableActorChoiceAwakenB = function (interp) {
    $gameVariables.setValue(20, 5);
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    for (let i = 401; i <= 406; i++) {
      actor.forgetSkill(i);
    }
    actor.learnSkill(401);
  };

  // Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
  AGH_readVariableDynamicEventId_16 = function (interp) {
    $gameMap.darknessOpacity = 200;
    const eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[5]; //this._eventId
    const mapEvent = $gameMap.event(eventId);
    if (!!!mapEvent) return;

    const event = mapEvent;
    event.setStepAnime(true);
    event.setWalkAnime(true);
    event.setAngle(0);
    event._spriteOffsetX = 0;
    event._spriteOffsetY = 0;
    event._kageM = new Game_KageMaster(event);
    event.removeFace();
    event.setOpacity(0);
  };

  // Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
  AGH_readVariableDynamicEventId_17 = function (interp) {
    const spawnedEventId2 = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[5]; //this._eventId
    $gameMap.eraseMapLight(spawnedEventId2);
  };

  // Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
  AGH_readVariableDynamicEventId_18 = function (interp) {
    event_respawnSetN(5, 4, 11, 1, "4Child", 2, 6);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[5];
    original_direct(5, interp._eventId, 0, 0, 0, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:472|予期せぬ要請
  AGH_readVariableEventProgressHeroUnexpectedRequest = function (interp) {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    //npcPreset is a dead verbatim leftover: the respawn call below uses fixed coords
    //const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
    //  $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    //];
    event_respawnSetA(charaSlotId, 8, 4, 1, 2);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    event_respawnSetA(2, 8, 7, 0, 8);
  };

  // Replaces (1x): CommonEvents.json:common-event:473|秩序ＶＳ狂戦士
  AGH_readVariableEventProgressHeroOrderVsBerserker = function (interp) {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3], npcPreset[4], 1, 8);
    event_respawnSetA(2, npcPreset[3] - 1, npcPreset[4], 1, 8);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[2];
  };

  // Replaces (1x): CommonEvents.json:common-event:473|秩序ＶＳ狂戦士
  AGH_readVariableDynamicEventIdOrderVsBerserker = function (interp) {
    let event;
    const dynamicEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    for (let i = 11; i <= 13; i++) {
      const eventId = dynamicEventIds[i]; //this._eventId
      const mapEvent = $gameMap.event(eventId);
      if (!!mapEvent) {
        event = mapEvent;
        event.setStepAnime(false);
        event.setWalkAnime(false);
        event.setDirection(2);
        event.resetPattern();
        event._originalPattern = 1;
        event.setAngle(45);
        event._spriteOffsetX = -12;
        event._spriteOffsetY = -12;
        event._kageM.clear();
        event.setFace(6, true, true); //Child用event.setFace(6,true,true,0,6,0,6);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:481|決戦！　黒銀の翼！！
  AGH_readVariableEventProgressHeroDecisiveBlackSilverWing = function (interp) {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3] - 1, npcPreset[4], 1, npcPreset[5]);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:481|決戦！　黒銀の翼！！
  AGH_readVariableEventProgressHero_23 = function (interp) {
    const charaSlotId = 2; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3], npcPreset[4] + 1, 0, npcPreset[5]);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:496|全滅テンプレ
  AGH_setSelfVariableEventProgressHeroAllOutTemplate = function (interp) {
    valueScenePic = "XevS016_";
    //var value2 = valueScenePic+'01';
    $gameVariables.setValue(530, 1); //主格キャラ
    $gameVariables.setValue(535, 516); //挿話回想の場合アイテムID。メインは0
    valueWeatherSceneSet = 0;
  };

  // Replaces (1x): CommonEvents.json:common-event:502|悪戯っ子世に憚る
  AGH_readVariableEventProgressHeroMischiefChildPublic = function () {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3], npcPreset[4], 1, 4);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setImage(npcPreset[1], npcPreset[2]);
    event.setDirection(npcPreset[5]);
    charaSlotId = 11;
    event_respawnSetN(charaSlotId, 39, 15, 1, "4Child", 3, 4);
  };

  // Replaces (1x): CommonEvents.json:common-event:502|悪戯っ子世に憚る
  AGH_showPictureScreenBlackOutMischiefChildPublic = function () {
    let pictureName;
    valuePic1 = 55;
    pictureName = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1 - 1, pictureName, 1, 640, 384, 100, 100, 150, 0);
    picture_fade1(valuePic1 - 1, "fadeIn", valueWipeImg, 60, 5);
    pictureName = valueScenePic + "01";
    pic_1(0, valuePic1 + 1, pictureName, 0, 100, 255, 60, 1280, 768, -256, 0);
    //tachie_bless(valuePic1+1,1);
  };

  // Replaces (1x): CommonEvents.json:common-event:502|悪戯っ子世に憚る
  AGH_showPictureHpicture2 = function () {
    let pictureName, fadeGlowA;
    pictureName = valueScenePic + "02";
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640 - 128, 384, 100, 100, 255, 0);
    tachie_bless(valuePic1, 1);
    fadeGlowA = "Hpicture2";
    picture_fade1(valuePic1, "fadeIn", fadeGlowA, 60, 5);
    fadeGlowA = "Hpicture3";
    picture_fade1(valuePic1 + 1, "fadeOut", fadeGlowA, 120, 5);
    pictureName = valueScenePic + "03";
    $gameScreen.showPicture(valuePic1 + 2, pictureName, 1, 640 - 128, 384 + 500, 100, 100, 255, 0);
    $gameScreen.movePicture(valuePic1 + 2, 1, 640 - 128, 384, 100, 100, 0, 0, 120);
  };

  // Replaces (1x): CommonEvents.json:common-event:502|悪戯っ子世に憚る
  AGH_runScriptMischiefChildPublic = function (interp) {
    const array = [0];
    const randomYOffsets = [-50];
    const lineCandidates = ["ハッハ──ッ♪"];
    chara_oneWord(101, interp._eventId, 25, 120, array, randomYOffsets, lineCandidates);
  };

  // Replaces (1x): CommonEvents.json:common-event:503|爺の本懐
  AGH_showPictureScreenBlackOutOldManWish = function () {
    let pictureName;
    valuePic1 = 51;
    valuePic2 = 71;
    pictureName = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640, 384, 100, 100, 150, 0);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
    const pictureId = valuePic2 + 1;
    pictureName = valueScenePic + "01";
    $gameScreen.showPicture(pictureId, pictureName, 1, 640 + 480 + 50, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 + 480, 384, 100, 100, 255, 0, 60);
    tachie_bless(pictureId, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:503|爺の本懐
  AGH_showPictureScreen1024FrameOldManWish = function () {
    let pictureName;
    pictureName = "Screen1024Frame";
    $gameScreen.showPicture(valuePic2, pictureName, 1, 640 - 78, 384, 100, 100, 255, 0);
    picture_fade1(valuePic2, "fadeIn", valueWipeImg, 60, 5);
    pictureName = valueScenePic + "02";
    $gameScreen.showPicture(valuePic1 + 1, pictureName, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1 + 1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    tachie_bless(valuePic1 + 1, 2);
  };

  // Replaces (4x): CommonEvents.json:common-event:507|情報の代価Ⅰ, CommonEvents.json:common-event:536|メイドウェイトレス, CommonEvents.json:common-event:547|リゾート休暇で限界突破！, CommonEvents.json:common-event:576|娼婦Debut!
  AGH_showPicturePriceOfInformation1 = function () {
    return AGH_showPictureCommand("01", 1, 60, null);
  };

  // Replaces (1x): CommonEvents.json:common-event:507|情報の代価Ⅰ
  AGH_showPicturePriceOfInformation1_2 = function (
    firstPictureOffset = 2,
    firstSceneSuffix = "02",
    secondPictureOffset = 3,
    secondSceneSuffix = "03"
  ) {
    const firstPictureId = valuePic1 + firstPictureOffset;
    const firstPictureName = valueScenePic + firstSceneSuffix;
    showScenePicture(firstPictureId, firstPictureName);
    const secondPictureId = valuePic1 + secondPictureOffset;
    const secondPictureName = valueScenePic + secondSceneSuffix;
    showScenePicture(secondPictureId, secondPictureName);
    tachie_bless(secondPictureId, 2);
  };

  // Replaces (2x): CommonEvents.json:common-event:508|情報の代価Ⅱ, CommonEvents.json:common-event:509|情報の代価Ⅲ
  AGH_showPictureXevS00702 = function () {
    backGraund_menuMapSelect(2, 0, 0, 0);
    showScenePicture(valuePic1 + 1, "XevS007_02");
    const pictureId = valuePic1 + 2;
    showScenePicture(pictureId, valueScenePic + "02");
    tachie_bless(pictureId, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:509|情報の代価Ⅲ
  AGH_showPicturePriceOfInformation3 = function () {
    const pictureId = valuePic1 + 5;
    const scenePictureName = valueScenePic + "05";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    hcg_piston(pictureId, 7, 2, 1);
  };

  // Replaces (1x): CommonEvents.json:common-event:511|ドクター・Ｋによる診察
  AGH_iterateWeaponsProfession1 = function () {
    const weaponId = 317;
    const messageText = `${$dataWeapons[id1].meta["Profession1"]}`;
    Profession_CharaChange(1, weaponId, messageText, 1);
  };

  // Replaces (1x): CommonEvents.json:common-event:511|ドクター・Ｋによる診察
  AGH_setSwitchNonHSceneBGVStartDoctorKExamination = function () {
    const array = ["「スーっ…」", "「ン………」", "「ZZZ………」", "「スゥ──」"]; //文字BGV
    $gameVariables.setValue(707, array);
    $gameVariables.setValue(706, [640 - 128, 386, 0, 240]); //最後1で横範囲縮小
    $gameSwitches.setValue(HELPER_SWITCH.NON_ADULT_BACKGROUND_VOICE, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:516|ゴブリン姦Ⅰ
  AGH_showPictureGoblinRape1 = function () {
    const pictureId = valuePic1 + 10; //非表示状態
    const scenePictureName = valueScenePic + "21";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 + 50, 384, 100, 100, 0, 0);
    //$gameScreen.movePicture(pictureId,1,640-128,384,100,100,255,0,60);
    tachie_bless(pictureId, 1);
  };

  // Replaces (1x): CommonEvents.json:common-event:516|ゴブリン姦Ⅰ
  AGH_showPictureGoblinRape1_2 = function () {
    const pictureId = valuePic1 + 10;
    //scenePictureName is only referenced by the commented debug call below
    //const scenePictureName = valueScenePic + "21";
    //$gameScreen.showPicture(pictureId,scenePictureName,1,640-128+50,384,100,100,0,0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    tachie_bless(pictureId, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:519|ゴブリン姦Ⅳ
  AGH_setSwitchNonHSceneBGVStartGoblinRape4 = function () {
    let array = [];
    htext_word(3); //3高2中1低
    array = array.concat(valueHtextWord);
    $gameVariables.setValue(707, array);
    $gameVariables.setValue(706, [640 - 128, 386, 1, 60, 0, "eromangasimaji"]);
    $gameSwitches.setValue(HELPER_SWITCH.NON_ADULT_BACKGROUND_VOICE, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:526|トロル姦
  AGH_showPictureTrollRape = function () {
    return AGH_showPictureCommand("01");
  };

  // Replaces (1x): CommonEvents.json:common-event:526|トロル姦
  AGH_showPictureScreenBlackOutTrollRape = function () {
    const ScreenBlackOut = "ScreenBlackOut";
    $gameScreen.showPicture(60, ScreenBlackOut, 1, 640, 384, 100, 100, 255, 0);
    picture_fade1(51, "fadeIn", "Town014", 180, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:526|トロル姦
  AGH_showPictureTrollRape_2 = function () {
    return AGH_showPictureCommand("07");
  };

  // Replaces (1x): CommonEvents.json:common-event:526|トロル姦
  AGH_showPictureTrollRape_3 = function () {
    return AGH_showPictureCommand("08", 2, 180);
  };

  // Replaces (1x): CommonEvents.json:common-event:530|試練の裏側
  AGH_readVariableEventProgressHeroBehindTheTrial = function (interp) {
    let charaSlotId, event;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3], npcPreset[4], 1, npcPreset[5]);
    event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event._spriteOffsetX = -24;
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    charaSlotId = 11;
    event_respawnSetN(charaSlotId, npcPreset[3] + 1, npcPreset[4], 2, "4Child", 1, 8);
    event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event._spriteOffsetX = -24;
  };

  // Replaces (1x): CommonEvents.json:common-event:530|試練の裏側
  AGH_spawnMapEventDynamicEventIdBehindTheTrial = function () {
    const spawnSlot = 12;
    $gameMap.spawnEvent(202, 12, 12, true);
    $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[spawnSlot] = $gameMap.getLastSpawnEventId();
  };

  // Replaces (1x): CommonEvents.json:common-event:530|試練の裏側
  AGH_showPicturePictureParallelLoopBehindTheTrial = function () {
    const pictureId = valuePic1 + 6;
    const scenePictureName = valueScenePic + "12";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 255, 0);
    pic_setArray1 = [1, pictureId, 0, -15, 0, 20];
    pic_setArray2 = [1, pictureId, 0, 0, 3, 30]; //pic_setArray2 = [1,0,0,0,0,0];
    valueParallelPicSe1 = ["ZH_sticky4", 20, 60];
    valueParallelPicSe2 = ["ZH_sticky4", 20, 60];
    hcg_piston(pictureId, 7, 2, 1);
    $gameSwitches.setValue(HELPER_SWITCH.LOOP_PICTURE_MOVEMENT, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:530|試練の裏側
  AGH_showPictureBehindTheTrial = function () {
    const pictureId = valuePic1 + 7;
    const scenePictureName = valueScenePic + "13";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    tachie_bless(pictureId, 2);
    pic_move1(pictureId + 4, 0, 0, 100, 100, 0, 90);
    pic_move1(pictureId + 5, 0, 0, 100, 100, 0, 90);
    pic_move1(pictureId + 6, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
  AGH_setVariableChoiceSwitch11Warakaserare = function () {
    //npcPreset is a dead verbatim leftover: only the destination is set below
    //const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
    //  $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    //];
    $gameVariables.setValue(HELPER_VARIABLE.EVENT_DESTINATION, [40, 17, 8]);
  };

  // Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
  AGH_readVariableEventProgressHeroWarakaserare = function (interp) {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    //npcPreset/event are dead verbatim leftovers: only _eventId is transferred below
    //const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
    //  $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    //];
    event_respawnSetA(charaSlotId, 17, 8, 1, 8);
    //var event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);

    charaSlotId = 11;
    event_respawnSetN(charaSlotId, 17, 6, 0, "4Child", 1, 2);
    //var event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
  AGH_showPictureWarakaserare = function () {
    valuePic1 = 51;
    const pictureId = valuePic1 + 11;
    const scenePictureName = valueScenePic + "11";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 - 100, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    tachie_bless(pictureId, 1);
    //pic_move1(pictureId-1,0,0,100,100,0,90);
  };

  // Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
  AGH_readVariableEventProgressHero_24 = function () {
    let eventSubjectIndex, event;
    eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event.locate(19, 4);
    event.setDirection(2);
    event._spriteOffsetX = +24;
    event.setFace(11, true, true);
    eventSubjectIndex = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event.locate(19, 5);
    event.setDirection(8);
    event._spriteOffsetX = +24;
    event._spriteOffsetY = -24;
  };

  // Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
  AGH_readVariableEventProgressHero_25 = function () {
    let eventSubjectIndex, event;
    eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event.setImage("1_1", 1);
    eventSubjectIndex = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event.setImage("4Child", 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
  AGH_movePictureWarakaserare = function () {
    valueCharaWaitCount1 = 30;
    valueCharaWaitCount2 = valuePic1 + 12;
    valueCharaWaitCount3 = getRandomIndex(11) + valueCharaWaitCount1;
    const mapEvent = $gameMap.event(1);
    if (!!mapEvent) {
      mapEvent.forceMoveRoute({
        list: [
          {
            code: 45,
            parameters: [
              "if($gameScreen.picture(valueCharaWaitCount2)){$gameScreen.movePicture(valueCharaWaitCount2,1,640-128,384-15,100,100,250,0,valueCharaWaitCount3)};"
            ]
          },
          { code: 15, parameters: [valueCharaWaitCount3] },
          {
            code: 45,
            parameters: [
              "if($gameScreen.picture(valueCharaWaitCount2)){$gameScreen.movePicture(valueCharaWaitCount2,1,640-128,384+5,100,100,0,0,valueCharaWaitCount3)};"
            ]
          },
          { code: 15, parameters: [valueCharaWaitCount3] },
          { code: 0 }
        ],
        repeat: true,
        skippable: true
      });
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:532|サンプル
  AGH_movePictureSample = function () {
    valueCharaWaitCount1 = 40;
    valueCharaWaitCount2 = valuePic1 + 2;
    const mapEvent = $gameMap.event(1);
    if (!!mapEvent) {
      mapEvent.forceMoveRoute({
        list: [
          { code: 45, parameters: ["valueCharaWaitCount3 = getRandomIndex(11) + valueCharaWaitCount1;"] },
          {
            code: 45,
            parameters: [
              "if($gameScreen.picture(valueCharaWaitCount2)){$gameScreen.movePicture(valueCharaWaitCount2,1,640-128,384,100,100,250,0,valueCharaWaitCount3)};"
            ]
          },
          { code: 15, parameters: [valueCharaWaitCount3] },
          {
            code: 45,
            parameters: [
              "if($gameScreen.picture(valueCharaWaitCount2)){$gameScreen.movePicture(valueCharaWaitCount2,1,640-128,384,100,100,0,0,valueCharaWaitCount3)};"
            ]
          },
          { code: 15, parameters: [valueCharaWaitCount3] },
          { code: 0 }
        ],
        repeat: true,
        skippable: true
      });
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:536|メイドウェイトレス
  AGH_playSeZClothesTakeOffMaidWaitress = function () {
    tachie_dousa(2, 1, 0, 14, 1, 255, 1311, 0, 0);
    tachie_dousa(2, 1, 0, 14, 1, 255, 1385, 0, 0);
    tachie_dousa(0, 1, 1, 14, 15, 0, 120, 0, 0);
    const ZClothesTakeOff = "Z_ClothesTakeOff"; //ピッチ50か100。消去ウェイトで変更
    AudioManager.playSe({ name: ZClothesTakeOff, volume: 150, pitch: 100, pan: 0 });
    //tachie_clothReflect(1);//ｱｸﾀｰid
  };

  // Replaces (1x): CommonEvents.json:common-event:536|メイドウェイトレス
  AGH_showPictureGoodsTea1 = function () {
    valuePic1 = 55;
    const pictureName = "Goods_Tea1_" + "00";
    $gameScreen.setPicturesAnimation(2, 30, "連番", 60);
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:536|メイドウェイトレス
  AGH_readVariableEventProgressHeroMaidWaitress = function () {
    const spawnSlot = 18; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[spawnSlot]);
    event.locate(19, 4);
  };

  // Replaces (1x): CommonEvents.json:common-event:536|メイドウェイトレス
  AGH_movePicture1MaidWaitress = function () {
    valuePic1 = 51;
    const pictureId = valuePic1 + 1;
    pic_move1(pictureId, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:537|メイドウェイトレスご奉仕
  AGH_showPictureXevS03601 = function () {
    backGraund_menuMapSelect(2, 0, 0, 0);
    valuePic1 = 51;
    const pictureId = valuePic1 + 1;
    const XevS03601 = "XevS036_01";
    $gameScreen.showPicture(pictureId, XevS03601, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    //tachie_bless(pictureId,2);
    //pic_move1(pictureId-1,0,0,100,100,0,90);
  };

  // Replaces (1x): CommonEvents.json:common-event:537|メイドウェイトレスご奉仕
  AGH_setSelfSwitchEventProgressHero = function () {
    let eventSubjectIndex, event;
    $gameSelfSwitches.setValue([$gameMap.mapId(), 8, "C"], true);
    eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[eventSubjectIndex]);
    event.locate(20, 10);
    event.setDirection(8);
    eventSubjectIndex = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[eventSubjectIndex]);
    event.locate(20, 9);
    event.setDirection(2);
  };

  // Replaces (1x): CommonEvents.json:common-event:537|メイドウェイトレスご奉仕
  AGH_showPictureScreenBlackOutMaidWaitressService = function () {
    const ScreenBlackOut = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1, ScreenBlackOut, 1, 640, 384, 100, 100, 200, 0);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
    backGraund_menuMapSelect(2, 0, 0, 0);
    const pictureId = valuePic1 + 1;
    pic_showMove1(pictureId, valueScenePic + "01", 640 - 128, 384, 100, 60, 0, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:537|メイドウェイトレスご奉仕
  AGH_movePicture1MaidWaitressService = function () {
    return AGH_movePicture1ToroCommon1(2, "02", 2, 200);
  };

  // Replaces (1x): CommonEvents.json:common-event:540|
  AGH_showPictureCommonEvent540 = function () {
    showScenePicture(valuePic1 + 4, valueScenePic + "04");
    showScenePicture(valuePic1 + 5, valueScenePic + "05");
  };

  // Replaces (1x): CommonEvents.json:common-event:540|
  AGH_setSwitchPictureParallelLoop = function () {
    pic_setArray1 = [1, valuePic1 + 5, 0, -15, 0, 20];
    pic_setArray2 = [1, valuePic1 + 5, 0, 0, 3, 30]; //pic_setArray2 = [1,0,0,0,0,0];
    valueParallelPicSe1 = ["ZH_sticky4", 80, 60];
    valueParallelPicSe2 = ["ZH_sticky4", 80, 60];
    hcg_piston(valuePic1 + 5, 7, 2, 1);
    $gameSwitches.setValue(HELPER_SWITCH.LOOP_PICTURE_MOVEMENT, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:541|知らなかった『裏側』
  AGH_showPictureGoodsDVD = function () {
    valuePic1 = 55;
    const GoodsDVD = "Goods_DVD";
    $gameScreen.showPicture(valuePic1, GoodsDVD, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:541|知らなかった『裏側』
  AGH_showPictureDungeon12UnknownOtherSide = function (pictureOffset = 1, sceneSuffix = "01") {
    backGraund_menuMapSelect(2, 0, 0, 0);
    valuePic1 = 51;
    showScreenBlackOut(valuePic1, 200);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
    const pictureId = valuePic1 + pictureOffset;
    const scenePictureName = valueScenePic + sceneSuffix;
    showScenePicture(pictureId, scenePictureName);
  };

  // Replaces (1x): CommonEvents.json:common-event:541|知らなかった『裏側』
  AGH_setSwitchPictureParallelLoopUnknownOtherSide = function () {
    pic_setArray1 = [1, valuePic1 + 4, 0, -30, 0, 20];
    pic_setArray2 = [1, valuePic1 + 4, 0, 0, 3, 30]; //pic_setArray2 = [1,0,0,0,0,0];
    valueParallelPicSe1 = [0, 0, 0];
    valueParallelPicSe2 = [0, 0, 0];
    hcg_piston(valuePic1 + 4, 7, 2, 1);
    $gameSwitches.setValue(HELPER_SWITCH.LOOP_PICTURE_MOVEMENT, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:541|知らなかった『裏側』
  AGH_movePicture1UnknownOtherSide = function () {
    const pictureId = valuePic1 + 1;
    pic_move1(pictureId, 0, 0, 100, 100, 0, 90);
    pic_move1(pictureId + 1, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
  AGH_setVariableChoiceSwitch11InCityShadows = function () {
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    $gameVariables.setValue(HELPER_VARIABLE.EVENT_DESTINATION, [41, npcPreset[3], npcPreset[4]]);
  };

  // Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
  AGH_showPictureScreenBlackOutInCityShadows = function () {
    let pictureName;
    backGraund_menuMapSelect(2, 0, 0, 0);
    valuePic1 = 51;
    valuePic2 = 71;
    pictureName = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640, 384, 100, 100, 200, 0);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
    pictureName = valueScenePic + "01";
    $gameScreen.showPicture(valuePic2 + 1, pictureName, 1, 640 + 480, 384 - 118, 100, 100, 200, 0);
    $gameScreen.movePicture(valuePic2 + 1, 1, 640 + 480, 384 + 50, 100, 100, 255, 0, 240);
    tachie_bless(valuePic2 + 1, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
  AGH_readVariableEventProgressHeroInCityShadows = function (interp) {
    event_respawnSetN(11, 35, 6, 1, "BB_akunin1", 7, 6);
    const spawnSlot = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[spawnSlot];
  };

  // Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
  AGH_showPictureScreen1024FrameInCityShadows = function () {
    let pictureName;
    pictureName = valueScenePic + "04_00";
    $gameScreen.setPicturesAnimation(2, 10, "連番", 40);
    $gameScreen.showPicture(valuePic1 + 1, pictureName, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1 + 1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    const picture2 = $gameScreen.picture(valuePic1 + 1);
    if (picture2) {
      picture2.startAnimationFrame(3, true, [1, 1, 1, 2]);
    }
    pictureName = "Screen1024Frame";
    $gameScreen.showPicture(69, pictureName, 1, 640 - 78, 384, 100, 100, 255, 0);
    picture_fade1(69, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
  AGH_movePicture1InCityShadows = function () {
    let pictureId;
    pictureId = valuePic1 + 1;
    pic_move1(pictureId, 0, 0, 100, 100, 0, 60);
    pictureId = 69;
    pic_move1(pictureId, 0, 0, 100, 100, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
  AGH_readVariableEventProgressHero_26 = function (interp) {
    let eventSubjectIndex;
    eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[eventSubjectIndex];
    drowsepost.camera.zoom(1, 60, interp._eventId);
  };

  // Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
  AGH_readVariableEventProgressHeroFoolishReunion = function (interp) {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, npcPreset[3], npcPreset[4], 1, npcPreset[5]);
    charaSlotId = 11;
    event_respawnSetN(charaSlotId, npcPreset[8], npcPreset[9], 0, npcPreset[6], npcPreset[7], npcPreset[10]);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
  AGH_showPictureZXMain04006 = function () {
    valuePic1 = 51;
    const ZXMain04006 = "ZX_Main040_06";
    $gameScreen.showPicture(valuePic1, ZXMain04006, 1, 640, 384, 100, 100, 250, 0);
    picture_fade1(51, "fadeIn", "150", 60, 5);
  };

  // Replaces (2x): CommonEvents.json:common-event:543|愚鈍なる再会, CommonEvents.json:common-event:545|チンピラ団員達と…
  AGH_showPictureDungeon12FoolishReunion = function () {
    backGraund_menuMapSelect(2, 0, 0, 0); //'Dungeon1_2'
    valuePic1 = 51;
    const ScreenBlackOut = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1, ScreenBlackOut, 1, 640, 384, 100, 100, 200, 0);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
  AGH_showPictureFoolishReunion = function () {
    $gameScreen.setPicturesAnimation(2, 10, "連番", 20);
    const pictureId = valuePic1 + 1;
    const scenePictureName = valueScenePic + "01_00";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    const picture2 = $gameScreen.picture(pictureId);
    if (picture2) {
      picture2.startAnimationFrame(1, true, [1, 1, 1, 2]);
    }
    tachie_bless(pictureId, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
  AGH_runScriptFoolishReunion = function () {
    const pictureId = valuePic1 + 1;
    picture_fade1(pictureId, "fadeOut", valueWipeImg, 60, 5);
    picture_fade1(51, "fadeOut", valueWipeImg, 60, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
  AGH_readVariableEventProgressHero_27 = function () {
    let spawnSlot, event;
    spawnSlot = 1; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event = $gameMap.event(spawnedEventIds[spawnSlot]);
    event.locate(16, 7);
    event.setDirection(8);
    event._spriteOffsetX = +24;
    spawnSlot = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event = $gameMap.event(spawnedEventIds[spawnSlot]);
    event.locate(16, 6);
    event.setDirection(2);
    event._spriteOffsetX = +24;
    event._spriteOffsetY = -12;
  };

  // Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
  AGH_showPictureDungeon12_2 = function () {
    return AGH_showPictureDungeon12UnknownOtherSide(2, "02");
  };

  // Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
  AGH_showPictureFoolishReunion_2 = function () {
    showScenePicture(valuePic1 + 3, valueScenePic + "03");
    hcg_piston(valuePic1 + 3, 7, 1, 2);
    const pictureId = valuePic1 + 5;
    showScenePicture(pictureId, valueScenePic + "04");
    tachie_bless(pictureId, 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
  AGH_movePicture1FoolishReunion = function () {
    let pictureId;
    pictureId = valuePic1 + 3;
    pic_move1(pictureId, 0, 0, 100, 100, 0, 90);
    pictureId = valuePic1 + 4;
    pic_move1(pictureId, 0, 0, 100, 100, 0, 90);
    pictureId = valuePic1 + 5;
    pic_move1(pictureId, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
  AGH_readVariableEventProgressHero_28 = function () {
    const spawnSlot = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[spawnSlot]);
    event.locate(16, 6);
    event.setDirection(4);
    event._spriteOffsetX = -12;
  };

  // Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
  AGH_readVariableEventProgressHeroWithGangMember = function () {
    let spawnSlot, event;
    spawnSlot = 1; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event = $gameMap.event(spawnedEventIds[spawnSlot]);
    event.locate(17, 4);
    event.setDirection(8);
    spawnSlot = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event = $gameMap.event(spawnedEventIds[spawnSlot]);
    event.locate(17, 5);
    event.setDirection(8);
    event._spriteOffsetY = -24;
  };

  // Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
  AGH_showPictureXevS044 = function () {
    backGraund_menuMapSelect(2, 0, 0, 0);
    valuePic1 = 51;
    valuePic2 = 71;
    valueScenePic = "XevS044_";
    const ScreenBlackOut = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1, ScreenBlackOut, 1, 640, 384, 100, 100, 150, 0);
    picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
  AGH_showPictureWithGangMember = function () {
    const pictureId = valuePic2 + 3;
    const scenePictureName = valueScenePic + "03_00";
    $gameScreen.setPicturesAnimation(3, 10, "連番", 20);
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 + 480 + 50, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 + 480, 384, 100, 100, 255, 0, 60);
    const picture2 = $gameScreen.picture(pictureId);
    if (picture2) {
      picture2.startAnimationFrame(1, true, [1, 1, 1, 2]);
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
  AGH_showPictureWithGangMember_2 = function () {
    const pictureId = valuePic2 + 2;
    const scenePictureName = valueScenePic + "02";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 + 480 + 50, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 + 480, 384, 100, 100, 255, 0, 60);
    tachie_bless(pictureId, 2);
    pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
  // Moves one picture per offset that follows basePictureId (offsets keep their order,
  // because the move order matters for the picture z-order).
  function moveCompanionPictures(basePictureId, pictureOffsets) {
    pictureOffsets.forEach((pictureOffset) => {
      pic_move1(basePictureId + pictureOffset - 1, 0, 0, 100, 100, 0, 90);
    });
  }

  AGH_movePicture1WithGangMember = function () {
    moveCompanionPictures(valuePic2, [3, 2]);
  };

  // Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
  AGH_showPictureScreen1024FrameWithGangMember = function () {
    let pictureName;
    pictureName = "Screen1024Frame";
    $gameScreen.showPicture(valuePic2, pictureName, 1, 640 - 78, 384, 100, 100, 255, 0);
    picture_fade1(valuePic2, "fadeIn", valueWipeImg, 60, 5);
    pictureName = valueScenePic + "05";
    $gameScreen.showPicture(valuePic1 + 1, pictureName, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1 + 1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
  AGH_readVariableEventProgressHeroWithPunks = function (interp) {
    let charaSlotId;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, 9, 12, 1, 8);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    charaSlotId = 11;
    event_respawnSetN(charaSlotId, 9, 11, 0, npcPreset[6], npcPreset[7], 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
  AGH_readVariableEventProgressHero_29 = function () {
    let eventSubjectIndex, event;
    eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event._priorityType = 0;
    event._spriteOffsetY = +12;
    event.locate(19, 5);
    event.setDirection(2);
    eventSubjectIndex = 11;
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event._priorityType = 2;
    event._spriteOffsetY = -12;
    event.locate(19, 6);
    event.setDirection(8);
  };

  // Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
  AGH_readVariableDynamicEventIdWithPunks = function () {
    let spawnSlot, event;
    spawnSlot = 12;
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event = $gameMap.event(spawnedEventIds[spawnSlot]);
    event.locate(20, 5);
    event.setDirection(4);
    spawnSlot = 13;
    event = $gameMap.event(spawnedEventIds[spawnSlot]);
    event.locate(18, 5);
    event.setDirection(6);
  };

  // Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
  AGH_showPictureWithPunks = function () {
    return AGH_showPicturePriceOfInformation1_2(1, "01", 2, "02");
  };

  // Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
  AGH_showPicturePictureParallelLoopWithPunks = function () {
    const pictureId = valuePic1 + 4;
    const scenePictureName = valueScenePic + "03";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 255, 0);
    pic_setArray1 = [1, pictureId, 15, -15, 0, 20];
    pic_setArray2 = [1, pictureId, 0, 0, 3, 30]; //pic_setArray2 = [1,0,0,0,0,0];
    valueParallelPicSe1 = ["ZH_sticky4", 10, 10];
    valueParallelPicSe2 = [0, 0, 0];
    hcg_piston(pictureId, 4, 1, 1);
    $gameSwitches.setValue(HELPER_SWITCH.LOOP_PICTURE_MOVEMENT, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
  AGH_movePicture1WithPunks = function () {
    moveCompanionPictures(valuePic1, [2, 3]);
  };

  // Replaces (1x): CommonEvents.json:common-event:546|獣欲の暴走、一生の懊悩と後悔
  AGH_movePicture1BeastDesireRampage = function () {
    const pictureId = valuePic1;
    pic_move1(pictureId, 0, 0, 100, 100, 0, 90);
    pic_move1(pictureId + 1, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:546|獣欲の暴走、一生の懊悩と後悔
  AGH_setSelfSwitchDynamicEventIdBeastDesireRampage = function () {
    let charaSlotId, event;
    charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 19, 5, 0, 2);
    event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event._priorityType = 0;
    event._spriteOffsetY = +12;
    charaSlotId = 11;
    event_respawnSetN(charaSlotId, 19, 6, 0, "npcOrder2", 4, 8);
    event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event._priorityType = 2;
    event._spriteOffsetY = -12;
    $gameSelfSwitches.setValue([$gameMap.mapId(), 2, "C"], true);
  };

  // Replaces (1x): CommonEvents.json:common-event:546|獣欲の暴走、一生の懊悩と後悔
  AGH_spawnMapEventNpcOrder2 = function () {
    event_respawnSetN(12, 17, 6, 0, "npcOrder2", 5, 6);
    event_respawnSetN(13, 20, 7, 0, "npcOrder2", 6, 8);
    event_respawnSetN(14, 18, 8, 0, "npcOrder2", 7, 2);
    $gameMap.spawnEvent(244, 17, 18, true);
    $gameMap.darknessOpacity = 150;
  };

  // Replaces (1x): CommonEvents.json:common-event:546|獣欲の暴走、一生の懊悩と後悔
  AGH_readVariableEventProgressHeroBeastDesireRampage = function () {
    let eventId;
    const array = [0];
    const randomYOffsets = [-50];
    const lineCandidates = [`アンっ\\I[12]`];
    eventId = 1; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[eventId];
    chara_oneWord(100, eventId, 25, 180, array, randomYOffsets, lineCandidates, 0);
  };

  // Replaces (1x): CommonEvents.json:common-event:546|獣欲の暴走、一生の懊悩と後悔
  AGH_readVariableDynamicEventIdBeastDesireRampage = function (interp) {
    let event;
    const dynamicEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    for (let i = 11; i <= 14; i++) {
      const eventId = dynamicEventIds[i]; //this._eventId
      const mapEvent = $gameMap.event(eventId);
      if (!!mapEvent) {
        event = mapEvent;
        event.setOpacity(0);
      }
    }
  };

  // Replaces (1x): CommonEvents.json:common-event:547|リゾート休暇で限界突破！
  AGH_erasePicturesResortBreakthrough = function () {
    const pictureId = valuePic1;
    pic_eraseP(0, [pictureId + 1, pictureId + 2, pictureId + 3]);
  };

  // Replaces (1x): CommonEvents.json:common-event:547|リゾート休暇で限界突破！
  AGH_showPictureResortBreakthrough = function () {
    backGraund_menuMapSelect(2, 0, 0, 0);
    const pictureId = valuePic1 + 4;
    const scenePictureName = valueScenePic + "04";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    //tachie_bless(pictureId,2);
    //pic_move1(pictureId-1,0,0,100,100,0,90);
  };

  // Replaces (1x): CommonEvents.json:common-event:547|リゾート休暇で限界突破！
  AGH_readVariableEventProgressHeroResortBreakthrough = function (interp) {
    const subjectSlotId = episodeSubjectSlotId();
    event_respawnSetA(subjectSlotId, 34, 6, 1, 2);
    interp._eventId = spawnedEventId(subjectSlotId);
    // The original looked both events up without using them; the lookups are kept so
    // the engine sees the same calls in the same order.
    spawnedEvent(subjectSlotId);
    interp._spriteOffsetY = +12;
    event_respawnSetN(11, 34, 7, 0, "npcUnique2", 0, 8);
    spawnedEvent(11);
    interp._spriteOffsetY = -12;
  };

  // Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
  AGH_readVariableEventProgressHeroMonicaProstituteDebut = function (interp) {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 7, 9, 1);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setDirection(6);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
  };

  // Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
  AGH_readVariableEventProgressHero_30 = function (interp) {
    const charaSlotId = 1; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event_respawnSetA(charaSlotId, 35, 9, 1);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setDirection(4);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    drowsepost.camera.zoom(1, 60, interp._eventId);
  };

  // Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
  AGH_setSelfSwitchMonicaProstituteDebut = function () {
    let event;
    const mapId2 = $gameMap.mapId();
    $gameSelfSwitches.setValue([mapId2, 20, "C"], true);
    $gameSelfSwitches.setValue([mapId2, 21, "C"], true);
    event = $gameMap.event(20);
    event.locate(22, 11);
    event = $gameMap.event(21);
    event.locate(22, 12);
  };

  // Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
  AGH_readVariableEventProgressHero_31 = function () {
    let eventSubjectIndex, event;
    eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const spawnedEventIds = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS);
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event.locate(3, 7);
    event.setDirection(6);
    eventSubjectIndex = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    event = $gameMap.event(spawnedEventIds[eventSubjectIndex]);
    event.locate(4, 7);
    event.setDirection(4);
  };

  // Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
  AGH_showPictureScreenBlackOutMonicaProstituteDebut = function () {
    let pictureName;
    valuePic1 = 55;
    pictureName = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1 - 1, pictureName, 1, 640, 384, 100, 100, 200, 0);
    picture_fade1(valuePic1 - 1, "fadeIn", valueWipeImg, 60, 5);
    $gameScreen.setPicturesAnimation(2, 10, "連番", 20);
    valueScenePic = "XevS011_";
    pictureName = valueScenePic + "01";
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640 - 128, 384 + 50, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    hcg_piston(valuePic1, 5, 3, 2);
    $gameScreen.picture(valuePic1).startAnimationFrame(1, false, [1, 1, 1, 2]);
  };

  // Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
  AGH_readVariableDynamicEventIdMonicaProstituteDebut = function () {
    const charaSlotId = 11;
    event_respawnSetN(charaSlotId, 3, 11, 1, "2_1", 2);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setDirection(2);
    event_doorOpenClose(1, 3);
  };

  // Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
  AGH_readVariableDynamicEventId_19 = function () {
    const spawnSlot = 12;
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[spawnSlot]);
    event.setImage(event.characterName(), 4);
  };

  // Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
  AGH_readVariableEventProgressHero_32 = function () {
    const charaSlotId = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const npcPreset = $gameVariables.value(HELPER_VARIABLE.EVENT_WORK_VALUES)[
      $gameVariables.value(HELPER_VARIABLE.EPISODE_ITEM_ID)
    ];
    event_respawnSetA(charaSlotId, 15, 4, 0);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId]);
    event.setImage(npcPreset[1], npcPreset[2]);
    event.setDirection(2);
  };

  // Replaces (1x): CommonEvents.json:common-event:571|マッサージⅠ
  AGH_showPictureMassage1 = function () {
    return AGH_showPictureCommand("01", 1, 60, 1);
  };

  // Replaces (1x): CommonEvents.json:common-event:571|マッサージⅠ
  AGH_setSwitchPictureParallelLoopMassage1 = function () {
    const pictureId = valuePic1 + 4;
    pic_setArray1 = [1, pictureId, 0, -30, 5, 60];
    pic_setArray2 = [1, pictureId, 0, 30, 3, 40]; //pic_setArray2 = [1,0,0,0,0,0];
    valueParallelPicSe1 = [0, 0, 0];
    valueParallelPicSe2 = [0, 0, 0];
    hcg_piston(pictureId, 7, 2, 1);
    $gameSwitches.setValue(HELPER_SWITCH.LOOP_PICTURE_MOVEMENT, true);
  };

  // Replaces (2x): CommonEvents.json:common-event:572|マッサージⅡ, CommonEvents.json:common-event:573|マッサージⅢ
  AGH_showPictureMassage2 = function () {
    return AGH_showPictureCommand("01", 1, 60, null);
  };

  // Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
  AGH_showPictureMassage2_2 = function () {
    const pictureId = valuePic1 + 2;
    const scenePictureName = valueScenePic + "02";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 + 50, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    tachie_bless(pictureId, 1);
    //pic_move1(pictureId-1,0,0,100,100,0,90);
  };

  // Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
  AGH_showPictureMassage2_3 = function () {
    const pictureId = valuePic1 + 4;
    const scenePictureName = valueScenePic + "04";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 + 50, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    tachie_bless(pictureId, 1);
    pic_move1(pictureId - 2, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
  AGH_showPictureMassage2_4 = function () {
    const pictureId = valuePic1 + 5;
    const scenePictureName = valueScenePic + "05";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 - 100, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    hcg_piston(pictureId, 7, 1, 2);
    //pic_move1(pictureId-1,0,0,100,100,0,90);
  };

  // Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
  AGH_showPictureMassage2_5 = function () {
    const pictureId = valuePic1 + 7;
    const scenePictureName = valueScenePic + "06";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 - 100, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    hcg_piston(pictureId, 7, 1, 2);
    pic_move1(pictureId - 2, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
  AGH_movePicture1Massage2 = function () {
    let pictureId;
    pictureId = valuePic1 + 7;
    pic_move1(pictureId, 0, 0, 100, 100, 0, 90);
    pictureId = valuePic1 + 6;
    pic_move1(pictureId, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
  AGH_showPictureMassage2_6 = function () {
    const pictureId = valuePic1 + 2;
    const pictureName = valueScenePic + "07";
    showFadedScenePicture(pictureId, pictureName, 1, pictureId + 2);
  };

  // Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
  AGH_showPictureMassage2_7 = function () {
    $gameScreen.setPicturesAnimation(2, 10, "連番", 30);
    const pictureId = valuePic1 + 8;
    const scenePictureName = valueScenePic + "08_00";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
  AGH_showPictureMassage2_8 = function () {
    const pictureId = valuePic1 + 1;
    const scenePictureName = valueScenePic + "01";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    //tachie_bless(pictureId,1);
    //pic_move1(pictureId-1,0,0,100,100,0,90);
  };

  // Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
  AGH_showPictureMassage3 = function () {
    const pictureId = valuePic1 + 4;
    const scenePictureName = valueScenePic + "04_00";
    $gameScreen.setPicturesAnimation(2, 10, "連番", 20);
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    tachie_bless(pictureId, 2);
    pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
  AGH_erasePicturesMassage3 = function () {
    sex_direction(99, 0, 0);
    const pictureId = valuePic1 + 4;
    pic_eraseP(0, [pictureId, pictureId - 1]);
  };

  // Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
  AGH_showPictureScreenBlackOutMassage3 = function () {
    backGraund_menuMapSelect(2, 0, 0, 0);
    valuePic1 = 55;
    valuePic2 = 71;
    const ScreenBlackOut = "ScreenBlackOut";
    $gameScreen.showPicture(51, ScreenBlackOut, 1, 640, 384, 100, 100, 150, 0);
    picture_fade1(51, "fadeIn", valueWipeImg, 60, 5);
  };

  // Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
  AGH_showPictureMassage3_2 = function () {
    const pictureId = valuePic1 + 1;
    const scenePictureName = valueScenePic + "91";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    //hcg_piston(pictureId,5,1,2);
  };

  // Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
  AGH_setSwitchNonHSceneBGVStartMassage3 = function () {
    const array = ["（グルルゥ──）", "（ググゥ…）", "（グゥ～～）"]; //文字BGV
    $gameVariables.setValue(707, array);
    $gameVariables.setValue(706, [640 - 128, 386, 0, 180, 0, 0]);
    $gameSwitches.setValue(HELPER_SWITCH.NON_ADULT_BACKGROUND_VOICE, true);
  };

  // Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
  AGH_showPictureMassage3_3 = function () {
    const pictureId = valuePic1 + 2;
    const scenePictureName = valueScenePic + "92";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
    //hcg_piston(pictureId,5,1,2);
    pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
  };

  // Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
  AGH_showPictureMassage3_4 = function () {
    const pictureId = valuePic1 + 3;
    const scenePictureName = valueScenePic + "93";
    $gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 250, 0);
    //hcg_piston(pictureId,5,1,2);
    //pic_move1(pictureId-1,0,0,100,100,0,90);
  };

  // Replaces (1x): CommonEvents.json:common-event:576|娼婦Debut!
  AGH_readVariableEventProgressHeroProstituteDebut = function () {
    const eventSubjectIndex = $gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[eventSubjectIndex]);
    event.locate(20, 6);
    event.setDirection(2);
    event._spriteOffsetY = -24;
    event._spriteOffsetX = -48;
  };

  // Replaces (1x): CommonEvents.json:common-event:576|娼婦Debut!
  AGH_readVariableEventProgressHero_33 = function () {
    const spawnSlot = 11; //$gameVariables.value(HELPER_VARIABLE.EVENT_SUBJECT_INDEX);
    const event = $gameMap.event($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[spawnSlot]);
    event.locate(20, 7);
    event.setDirection(8);
    event._spriteOffsetY = -24;
    event._spriteOffsetX = -48;
  };

  // Replaces (1x): CommonEvents.json:common-event:576|娼婦Debut!
  AGH_readVariableDynamicEventIdProstituteDebut = function (interp) {
    const array = [];
    array.push($gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[11]);
    event_NpcCharaMoveId(39, 0, array);
    //1下移動16下向く39透明化
    //event_partyCharaMove(45,"this.turnTowardCharacter($gameMap.event("+value1+"));");
    //event_partyCharaMove(45,"UP: 10;"); //"UP: 10;"
    //event_partyCharaMove(45,"this.requestBalloon(1);");
    //event_partyCharaMove(45,"this.requestAnimation(617);");
  };

  // Replaces (1x): CommonEvents.json:common-event:576|娼婦Debut!
  AGH_computeFloorProstituteDebut = function () {
    i1 = getRandomIndex(10) + 11; //人数
    i2 = getRandomIndex(10) + 11; //膣回数
    i3 = Math.floor(Math.random() * -5) + i1; //中だし回数
    i4 = getRandomIndex(5) + 1; //アナル回数
    i5 = getRandomIndex(1) + i4; //中だし回数
    i6 = getRandomIndex(5) + 6; //フェラ回数
    i7 = Math.floor(Math.random() * -2) + i4; //口腔回数
    i8 = getRandomIndex(3) + 0; //失禁回数
    return { i1: i1, i2: i2, i3: i3, i4: i4, i5: i5, i6: i6, i7: i7, i8: i8 };
  };

  // Replaces (1x): Map003.json:event:4|ドロップ宝箱|page:3
  AGH_gainItemDropChest = function () {
    let rarity;
    const array = [6, 7, 6, 6, 6, 7, 6, 7, 6, 6, 8, 6, 6];
    rarity = array[getRandomIndex(array.length)];
    gacha_naiyou(3, rarity);
    const databaseEntry = valueItems[valueGachaId];
    $gameParty.gainItem(databaseEntry, 1);
    const coloredText = colorTaggedText(24, `\x1bI[${databaseEntry.iconIndex}]${databaseEntry.name}`);
    rarity = `${coloredText}を入手した！`;
    $gameScreen.setDTextPicture(rarity, 28);
  };

  // Replaces (1x): Map003.json:event:4|ドロップ宝箱|page:4
  AGH_gainItemDropChest_2 = function () {
    let rarity;
    const array = [8, 9, 8, 9, 8, 8, 10, 9, 8, 8];
    rarity = array[getRandomIndex(array.length)];
    gacha_naiyou(3, rarity);
    const databaseEntry = valueItems[valueGachaId];
    $gameParty.gainItem(databaseEntry, 1);
    const coloredText = colorTaggedText(24, `\x1bI[${databaseEntry.iconIndex}]${databaseEntry.name}`);
    rarity = `${coloredText}を入手した！`;
    $gameScreen.setDTextPicture(rarity, 28);
  };

  // Replaces (1x): Map003.json:event:19|小銭|page:1
  AGH_setVariableRandomWork2SmallChange = function () {
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, 3);
    const randomIndex = getRandomIndex(91) + 10;
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_3, randomIndex);
  };

  // Replaces (1x): Map003.json:event:20|罠コモン|page:1
  AGH_setVariableDynamicEventIdTrapCommon = function () {
    $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    const playerRealX = $gamePlayer._realX;
    const playerRealY = $gamePlayer._realY;
    //if($gamePlayer.direction() == 2){playerRealY += 1};
    //if($gamePlayer.direction() == 4){playerRealX -= 1};
    //if($gamePlayer.direction() == 6){playerRealX += 1};
    //if($gamePlayer.direction() == 8){playerRealY -= 1};
    goodsEvent_respawn(0, "Goods8", 6, 8, 2, playerRealX, playerRealY);
  };

  // Replaces (1x): Map003.json:event:20|罠コモン|page:1
  AGH_particleSetOrbC = function (interp) {
    let particleName;
    particleName = "orb_c";
    $gameScreen._particle.particleSet(
      interp._eventId,
      particleName + "-" + interp._eventId,
      "this",
      particleName,
      "above"
    );
    particleName = "orb_c" + "-" + interp._eventId;
    $gameScreen._particle.particleUpdate([particleName, "color", "#ff00f7", "#ffffff"]);
    //$gameScreen._particle.particleUpdate([value1,'pos',0,-35]);
  };

  // Replaces (1x): Map003.json:event:42|固有素材2|page:1
  AGH_stopMapPlayerMovementUniqueMaterial2 = function () {
    if (!$gameParty.inBattle()) {
      $gameTemp.stopMapPlayerMovement();
    }
    if (!$gameParty.inBattle()) {
      $gameTemp.stopMapEventMovement();
    }
  };

  // Replaces (1x): Map003.json:event:42|固有素材2|page:1
  AGH_setSelfSwitchTrueHeroId = function (interp) {
    const id = 794; //匠掘りスキル
    if ($gameActors.actor($gameVariables.value(HELPER_VARIABLE.PROTAGONIST_ACTOR_ID)).isLearnedSkill(id)) {
      const array = [1, 2];
      const randomIndex = array[getRandomIndex(array.length)];
      if (randomIndex == 2) {
        $gameSelfSwitches.setValue([$gameMap.mapId(), interp._eventId, "B"], true);
      }
    } else {
      $gameSelfSwitches.setValue([$gameMap.mapId(), interp._eventId, "B"], true);
    }
  };

  // Replaces (1x): Map003.json:event:42|固有素材2|page:1
  AGH_clearParticleGoodsShine2 = function (interp) {
    if (!$gameSelfSwitches.value([$gameMap.mapId(), interp._eventId, "B"])) return;

    const particleId = "goods_shine2" + "-" + interp._eventId;
    $gameScreen._particle.particleClear(particleId);
  };

  // Replaces (1x): Map003.json:event:42|固有素材2|page:1
  AGH_pluginCommandShowInfo = function (interp) {
    const messageText = "採掘が出来そうな岩石だった…。";
    const args = new Array(String(messageText));
    interp.pluginCommand("ShowInfo", args);
  };

  // Replaces (1x): Map003.json:event:47|魚|page:1
  AGH_setupChild = function (interp) {
    const randomIndex = getRandomIndex(11) + 5;
    const commonVar126 = getRandomIndex(11) + 5;
    const commonVar127 = getRandomIndex(11) + 10;
    const commonVar128 = getRandomIndex(5) + 1;
    const commonVar122 = getRandomIndex(5) + 6;
    common_script1(
      26,
      interp._eventId,
      commonVar122,
      5,
      0,
      randomIndex,
      commonVar126,
      commonVar127,
      commonVar128,
      255
    );
    interp.setupChild($dataCommonEvents[64].list, 0);
  };

  // Replaces (1x): Map003.json:event:47|魚|page:1
  AGH_initValueRandomSetFish = function () {
    valueRandomSet = getRandomIndex(1);
  };

  // Replaces (1x): Map003.json:event:69|EV069|page:1
  AGH_readMapEventMetaNpcSpawnEventId = function (interp) {
    let args;
    const templateEventId = 77;
    args = new Array(String(templateEventId), "1", "0", "3", "1", "1");
    interp.pluginCommand("ERS_MAKE_TEMPLATE_RANDOM", args);
    args = new Array("286");
    interp.pluginCommand("ERS_GET_LAST_SPAWN_EVENT_ID", args);
    const eventId = $gameVariables.value(286);
    const mapEvent = $gameMap.event(eventId);
    const eventData = mapEvent.event();
    if (!eventData.meta["座標"]) return;

    const character2 = interp.character(eventId);
    character2.locate(
      Number(eventData.meta["座標"].split(",")[0]),
      Number(eventData.meta["座標"].split(",")[1])
    );
    character2.setDirection(0);
  };

  // Replaces (1x): Map003.json:event:69|EV069|page:1
  AGH_readMapEventMetaNpcSpawnEventIdEv069 = function (interp) {
    const list = [81, 82, 83];
    list.forEach(function (id) {
    let args;
      const templateEventId = id;
      args = new Array(String(templateEventId), "1", "0", "3", "1", "1");
      this.pluginCommand("ERS_MAKE_TEMPLATE_RANDOM", args);
      args = new Array("286");
      this.pluginCommand("ERS_GET_LAST_SPAWN_EVENT_ID", args);
      const eventId = $gameVariables.value(286);
      const mapEvent = $gameMap.event(eventId);
      const eventData = mapEvent.event();
      if (!eventData.meta["座標"]) return;

      const character2 = this.character(eventId);
      character2.locate(
        Number(eventData.meta["座標"].split(",")[0]),
        Number(eventData.meta["座標"].split(",")[1])
      );
      character2.setDirection(0);
    }, interp);
  };

  // Replaces (1x): Map003.json:event:69|EV069|page:1
  AGH_readMapEventMetaNpcSpawnEventIdERSMAKETEMPLATERANDOM = function (interp) {
    const list = [73, 74, 75, 78];
    list.forEach(function (id) {
    let args;
      const templateEventId = id;
      args = new Array(String(templateEventId), "1", "0", "3", "1", "1");
      this.pluginCommand("ERS_MAKE_TEMPLATE_RANDOM", args);
      args = new Array("286");
      this.pluginCommand("ERS_GET_LAST_SPAWN_EVENT_ID", args);
      const eventId = $gameVariables.value(286);
      const mapEvent = $gameMap.event(eventId);
      const eventData = mapEvent.event();
      if (!eventData.meta["座標"]) return;

      const character2 = this.character(eventId);
      character2.locate(
        Number(eventData.meta["座標"].split(",")[0]),
        Number(eventData.meta["座標"].split(",")[1])
      );
      character2.setDirection(0);
    }, interp);
  };

  // Replaces (1x): Map003.json:event:82|EV082|page:1
  AGH_setSelfVariableRandomWork1Ev082 = function (interp) {
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, "＜獲得アイテム一覧＞\n");
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_3, 0);
    $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
    $gameVariables.setValue(21, 0);
    for (let i = 1; i <= 10; i++) {
      item_gacha();
    }
  };

  // Replaces (1x): Map003.json:event:84|EV084|page:1
  AGH_reservePlayerTransfer = function () {
    const destinationVariableId = $gameVariables.value(204);
    const destination = $gameVariables.value(destinationVariableId);
    if (!Array.isArray(destination) || destination.length < 3) return;
    $gamePlayer.reserveTransfer(destination[0], destination[1], destination[2], 2, 2);
  };

  // Replaces (1x): Map003.json:event:113|EV113|page:1
  AGH_gainItemChestRareSlotEv113 = function () {
    showRareChestReward(2, 21, 24);
  };

  // Replaces (1x): Map003.json:event:113|EV113|page:1
  AGH_gainItemChestRareSlotTchestOnly = function () {
    const dungeonInfoItemId = $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID);
    const dungeonItem = $dataItems[dungeonInfoItemId];
    if (!dungeonItem || !dungeonItem.meta || typeof dungeonItem.meta.TchestOnly !== "string") return;
    const chestSettings = dungeonItem.meta.TchestOnly.split(",");
    showRareChestReward(Number(chestSettings[3]), Number(chestSettings[4]), 24);
  };

  // Warp points are stored as metadata columns warpPoint1..warpPoint9.
  const LAST_WARP_POINT_INDEX = 9;

  // Replaces (1x): Map003.json:event:131|ワープスポット|page:1
  AGH_setSelfSwitchWarpPoint = function (interp) {
    const mapId = $gameMap.mapId();
    const mapEvent = $gameMap.event(interp._eventId);
    const eventPosition = [mapId, mapEvent.x, mapEvent.y];
    const dungeonInfoItemId = $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID);
    const warpPointMeta = $dataItems[dungeonInfoItemId].meta;
    const warpPoints = $gameVariables.value(HELPER_VARIABLE.DUNGEON_WARP_POINTS);

    for (let warpPointIndex = 1; warpPointIndex <= LAST_WARP_POINT_INDEX; warpPointIndex++) {
      const warpPointPosition = warpPointMeta["warpPoint" + warpPointIndex];
      if (!warpPointPosition) continue;
      const position = warpPointPosition.split(",");
      const isSamePosition =
        Number(position[0]) == eventPosition[0] &&
        Number(position[1]) == eventPosition[1] &&
        Number(position[2]) == eventPosition[2];
      if (!isSamePosition) continue;
      //変更: ワープスポットは実行時に動的生成されるため、同一座標に二重生成
      // されることがある。その場合、同一タイルの両イベントが連続して
      // 実行されてお知らせとアクティベートエフェクトが二重に表示されて
      // いた。初回(0→1)のみお知らせとエフェクトを出し、各スポットの
      // セルフスイッチAは毎回設定する(二重生成分もメニュー頁へ移行する)
      const isAlreadyActivated = warpPoints[dungeonInfoItemId][warpPointIndex] == 1;
      warpPoints[dungeonInfoItemId][warpPointIndex] = 1;
      $gameSelfSwitches.setValue([mapId, interp._eventId, "A"], true);
      if (!isAlreadyActivated) {
        const messageText = `ワープポイント[${warpPointIndex}]がアクティベートされました。`;
        $gameScreen.setDTextPicture(messageText, 28);
        $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
      }
      break;
    }
  };

  // Base activation records keep one entry per base (1 = active, 2 = the current one).
  const BASE_ACTIVATION_RECORD_COUNT = 100;

  // Replaces (1x): Map003.json:event:133|EV133|page:1
  AGH_setDTextPictureTemporarySwitch = function (interp) {
    const baseActivationRecords = $gameVariables.value(HELPER_VARIABLE.BASE_ACTIVATION_RECORDS);
    // Every other activated base drops back to 1, the current one becomes 2.
    for (let baseIndex = 1; baseIndex <= BASE_ACTIVATION_RECORD_COUNT; baseIndex++) {
      if (baseActivationRecords[baseIndex] >= 2) baseActivationRecords[baseIndex] = 1;
    }
    const townInfoItemId = $gameVariables.value(HELPER_VARIABLE.TOWN_INFO_ITEM_ID);
    const weaponName = $dataWeapons[townInfoItemId].name;
    baseActivationRecords[townInfoItemId] = 2;
    $gameSelfSwitches.setValue([$gameMap.mapId(), interp._eventId, "A"], true);
    const messageText = `<${weaponName}>拠点がアクティベートされました。`;
    $gameScreen.setDTextPicture(messageText, 28);
    $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
  };

  // Replaces (1x): Map003.json:event:133|EV133|page:1
  AGH_readVariableBaseActivation = function () {
    let hasActiveBase;
    hasActiveBase = 0;
    const baseActivationRecords = $gameVariables.value(HELPER_VARIABLE.BASE_ACTIVATION_RECORDS);
    for (let i = 1; i <= 100; i++) {
      if (baseActivationRecords[i] == 2) {
        hasActiveBase = 1;
      }
    }
    if (hasActiveBase == 0) {
      baseActivationRecords[$gameVariables.value(319)] = 2;
    }
  };

  // Replaces (1x): Map003.json:event:133|EV133|page:2
  AGH_setVariableTextWorkEv133 = function () {
    for (let i = 1; i <= 100; i++) {
      if (!($gameVariables.value(HELPER_VARIABLE.BASE_ACTIVATION_RECORDS)[i] >= 2)) continue;

      const weaponName = $dataWeapons[i].name;
      $gameVariables.setValue(801, `帰還先:${weaponName}`);
      break;
    }
  };

  // Replaces (1x): Map003.json:event:133|EV133|page:2
  AGH_setSwitchMainQuestProgress = function () {
    if ($gameVariables.value(135) >= 1) {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, true); //時間経過可能
    }
    if ($gameSwitches.value(34)) {
      $gameSwitches.setValue(163, true); //周回可能
    }
  };

  // Replaces (1x): Map003.json:event:133|EV133|page:2
  AGH_setSwitchEv133 = function () {
    let i;
    for (i = 501; i <= 600; i++) {
      if ($gameParty.hasItem($dataItems[i])) {
        $gameSwitches.setValue(164, true); //シーン回想
      }
    }
    for (i = 401; i <= 500; i++) {
      if ($gameParty.hasItem($dataItems[i])) {
        $gameSwitches.setValue(165, true); //挿話回想
      }
    }
  };

  // Replaces (1x): Map003.json:event:133|EV133|page:2
  AGH_setSwitchTrueHeroIdEv133 = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.PROTAGONIST_ACTOR_ID));
    if (actor.isLearnedSkill(791)) {
      $gameSwitches.setValue(167, true); //錬金実行
    }
  };

  // Replaces (1x): Map003.json:event:133|EV133|page:2
  AGH_readVariableBaseActivationEv133 = function () {
    let activeBaseId;
    const baseActivationRecords = $gameVariables.value(HELPER_VARIABLE.BASE_ACTIVATION_RECORDS);
    for (let i = 1; i <= 100; i++) {
      if (!(baseActivationRecords[i] >= 2)) continue;

      activeBaseId = i;
      break;
    }
    valueCountSet1 = activeBaseId;
  };

  // Replaces (1x): Map003.json:event:133|EV133|page:2
  AGH_readVariableTownInfoItem = function () {
    const gameVariableValue = $gameVariables.value(HELPER_VARIABLE.TOWN_INFO_ITEM_ID);
    $gameVariables.value(HELPER_VARIABLE.BASE_ACTIVATION_RECORDS)[gameVariableValue] = 2;
    const weaponName = colorTaggedText(2, `<${$dataWeapons[gameVariableValue].name}>`);
    const messageText = `帰還先拠点を${weaponName}に設定しました。`;
    TickerManager.show(messageText);
  };

  // Replaces (1x): Map003.json:event:133|EV133|page:2
  AGH_setVariableDynamicEventIdEv133 = function () {
    $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    respawnGoodsAheadOfPlayer();
  };

  // Replaces (1x): Map003.json:event:145|EV145教会処理|page:1
  AGH_configureMapEventEv145ChurchProcessing = function (interp) {
    const sourceEvent = $gameMap.event(interp._eventId);
    const playerCharacter = interp.character(-1);
    if (!sourceEvent || !playerCharacter) return;
    const destinationX = sourceEvent.x;
    const destinationY = sourceEvent.y + 2;
    playerCharacter.locate(destinationX, destinationY);
    playerCharacter.setDirection(8);
  };

  // Replaces (1x): Map003.json:event:161|EV161|page:1
  AGH_showWindowTextEv161 = function () {
    WindowManager.show(0, 0, 0, 1024, 68);
  };

  // Replaces (1x): Map003.json:event:161|EV161|page:1
  AGH_setSwitchTemporarySwitchEv161 = function () {
    $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, false);
    for (let i = 1; i <= $dataItems.length - 1; i++) {
      const itemData = $dataItems[i];
      if (!itemData.name == "") {
        if (itemData.meta["EICSwitch"]) {
          if (Number(itemData.meta["EICSwitch"]) == 108) {
            if ($gameParty.hasItem(itemData) && !itemData.meta["singleQuestIncidence"]) {
              $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
              break;
            }
          }
        }
      }
    }
  };

  // Replaces (1x): Map003.json:event:161|EV161|page:1
  AGH_erasePictureEv161 = function () {
    return AGH_erasePictureFertilizationCommon(101, 250);
  };

  // Replaces (1x): Map003.json:event:166|EV166シングルクエスト受注|page:2
  AGH_eventQuestSet = function (interp) {
    valueCountSet1 = Number($gameMap.event(interp._eventId).event().meta["QuestSet"]);
  };

  // Replaces (1x): Map003.json:event:172|EV172召喚石戦闘|page:1
  AGH_setSwitchTemporarySwitchEv172SummonStoneBattle = function (interp) {
    $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, false);
    if (!$gameSelfSwitches.value([$gameMap.mapId(), interp._eventId, "A"])) {
      $gameSwitches.setValue(HELPER_SWITCH.TEMPORARY_FLAG, true);
    }
  };

  // Replaces (1x): Map003.json:event:185|EV185|page:1
  AGH_gainItemChestRareSlotEv185 = function () {
    showRareChestReward(2, 21, 29);
  };

  // Replaces (1x): Map003.json:event:207|EV207宿屋処理|page:1
  AGH_showPictureEv207InnProcessing = function () {
    const pictureId = 51;
    const pictureName = "";
    $gameScreen.showPicture(pictureId + 1, pictureName, 0, 1072, 612, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId + 1, 0, 1072, 612, 100, 100, 255, 0, 60);
    const messageText = "　　　　　\n　　　　　\n　　　　　\n　　　　　";
    $gameScreen.setDTextPicture(messageText, 28);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.showPicture(pictureId, pictureName, 0, 1072, 612, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 0, 1072, 612, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): Map003.json:event:207|EV207宿屋処理|page:1
  AGH_setSwitchRandomWork1Ev207InnProcessing = function () {
    const item = $dataItems[valueCountSet1].price;
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_1, item.toLocaleString());
    if ($gameParty.gold() >= item) {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, true);
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_1_ENABLED, false);
    }
  };

  // Replaces (1x): Map003.json:event:207|EV207宿屋処理|page:1
  AGH_setSwitchRandomWork2 = function () {
    const item = $dataItems[valueCountSet2].price;
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, item.toLocaleString());
    if ($gameParty.gold() >= item) {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, true);
    } else {
      $gameSwitches.setValue(HELPER_SWITCH.CHOICE_2_ENABLED, false);
    }
  };

  // Replaces (1x): Map003.json:event:207|EV207宿屋処理|page:1
  // Inn accounting: get_infoDirect(0, id) records the stay, (4, -price) pays it.
  function processInnItemPrice(itemId) {
    const itemPrice = $dataItems[itemId].price;
    get_infoDirect(0, itemId, 0, 1);
    get_infoDirect(4, -itemPrice, 0, 1);
  }

  AGH_iterateItemsEv207InnProcessing = function () {
    processInnItemPrice(valueCountSet1);
  };

  // Replaces (1x): Map003.json:event:207|EV207宿屋処理|page:1
  AGH_iterateItemsEv207InnProcessing_2 = function () {
    processInnItemPrice(valueCountSet2);
  };

  // Replaces (1x): Map003.json:event:217|EV217回想全開放|page:1
  AGH_iterateItemsEICSwitch = function (categorySwitchId = 102, messageText = "挿話が全開放されました。") {
    for (let itemId = 1; itemId < $dataItems.length; itemId++) {
      const itemData = $dataItems[itemId];
      if (!itemData.meta.EICSwitch || Number(itemData.meta.EICSwitch) != categorySwitchId) continue;
      $gameParty.gainItem(itemData, 1);
    }
    gab_wordParticle(messageText);
  };

  // Replaces (1x): Map003.json:event:217|EV217回想全開放|page:1
  AGH_gainItemEICSwitch = function () {
    return AGH_iterateItemsEICSwitch(103, "Hシーンが全開放されました。");
  };

  // Replaces (1x): Map003.json:event:218|EV218|page:2
  AGH_readVariableActorChoiceEv218 = function (interp) {
    //その場に作成
    const charaSlotId = 1; //$gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const valueNpcGuraTemporarilySave2 = valueNpcGuraTemporarilySave;
    event_respawnSetA(
      charaSlotId,
      valueNpcGuraTemporarilySave2[3],
      valueNpcGuraTemporarilySave2[4],
      1,
      valueNpcGuraTemporarilySave2[5]
    );
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    event_respawnSetN(
      11,
      valueNpcGuraTemporarilySave2[8],
      valueNpcGuraTemporarilySave2[9],
      0,
      valueNpcGuraTemporarilySave2[6],
      valueNpcGuraTemporarilySave2[7],
      valueNpcGuraTemporarilySave2[10]
    );
  };

  // Replaces (1x): Map003.json:event:218|EV218|page:2
  AGH_readVariableActorChoice_5 = function (interp) {
    let charaSlotId;
    //移動マップに作成。x,y入力
    charaSlotId = 1; //$gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const array = [x, y, d]; //ｱｸﾀｰ座標
    const candidateValues = [x, y, d]; //NPC座標
    const valueNpcGuraTemporarilySave2 = valueNpcGuraTemporarilySave;
    event_respawnSetA(charaSlotId, array[0], array[1], 1, array[2]);
    interp._eventId = $gameVariables.value(HELPER_VARIABLE.DYNAMIC_EVENT_IDS)[charaSlotId];
    charaSlotId = 11;
    event_respawnSetN(
      charaSlotId,
      candidateValues[0],
      candidateValues[1],
      0,
      valueNpcGuraTemporarilySave2[6],
      valueNpcGuraTemporarilySave2[7],
      candidateValues[2]
    );
  };

  // Replaces (1x): Map003.json:event:219|EV219|page:1
  AGH_setVariableDynamicEventIdEv219 = function () {
    $gameVariables.setValue(HELPER_VARIABLE.DYNAMIC_EVENT_IDS, Array(21).fill(0));
    event_respawnSetN(11, 24, 16, 0, "$airship02", 0, 2);
    event_respawnSetN(12, 21, 16, 0, "!$VehicleHorse", 0, 2);
    event_respawnSetA(7, 22, 16, 1, 6);
  };

  // Replaces (1x): Map007.json:event:2|EV002|page:1
  AGH_setSelfVariableLibidoEv002 = function (interp) {
    h_exp($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID), "Xev001_99", 101, false, false, false);
    //ｱｸﾀｰID,ﾋﾟｸﾁｬ,H相手(301ﾓﾌﾞ305対象なし306アイテム),非表示,簡易,過去シーンか否か
    $gameVariables.setValue(401, getRandomIndex(3) + 3);
    //var arr = [1,2,3,4,5];$gameVariables.setValue(401,arr[getRandomIndex(arr.length)]);
    //this.sVal(506,`\\V[94]は\\V[22]に情報の対価としてセクハラされた…。\n`);
    //this.sVal(506,`\\V[94]はモブにセクハラされた…。\n`);
    const variableText = "\\V[94]";
    $gameVariables.setValue(506, `${variableText}は魔物達に凌辱された…。\n`);
    if ($gameSwitches.value(122)) {
      interp.setupChild($dataCommonEvents[85].list, 0);
    }
  };

  // Replaces (1x): Map007.json:event:2|EV002|page:1
  AGH_callHExp3Ev002 = function (interp) {
    //var randomIndex = getRandomIndex(3) + 3;
    //var array = [1, 2, 3, 4, 5]; var value2 = array[getRandomIndex(array.length)];
    //var value3 = $gameTroop.aliveMembers().length;
    h_exp1(0, 0, 0, 0, 0, 0); //h_exp1ex(value3*2);//6
    //0膣1経験2フェラ3アナル4自慰5絶頂
    h_exp2(0, 0, 0, 0, 0); //5//0和姦1強姦2異種姦3輪姦4露出
    h_exp3(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); //10
    //0セク1乳2尻揉3失禁4潮吹5売春6妊7子8中だ9ｱﾅﾙ出し10口飲
    h_exp4(0, 0, 0, 0, 0, 0, 0, 0); //9
    //0膣1尻2口3感4露5精6性戯7奉仕8売春
    interp.setupChild($dataCommonEvents[85].list, 0);
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_readVariableActorChoiceEv003 = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    actor.setCanChangeClass(true);
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_showPictureScreenBlackOutEv003 = function () {
    valuePic1 = 51;
    const ScreenBlackOut = "ScreenBlackOut";
    $gameScreen.showPicture(valuePic1, ScreenBlackOut, 1, 640, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(valuePic1, 1, 640, 384, 100, 100, 200, 0, 10);
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_showPicturePictureParallelLoopEv003 = function () {
    let pictureName;
    valuePic1 = 60;
    pictureName = "test2";
    $gameScreen.showPicture(valuePic1, pictureName, 1, 640, 384, 100, 100, 255, 0);
    pic_setArray(1, valuePic1, 0, 50, 60);
    pictureName = "test2a_0";
    picture_anime1(valuePic1 + 1, pictureName, 3, 10, "連番", 10, 1, true, [1, 2, 1, 1]);
    pic_set(valuePic1 + 1, 1, 255, 20);
    hcg_piston(valuePic1, 8, 1, 1);
    hcg_piston(valuePic1 + 1, 8, 1, 1);
    $gameSwitches.setValue(HELPER_SWITCH.LOOP_PICTURE_MOVEMENT, true);
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_readVariableRaceDefeatCountEv003 = function () {
    const gameVariableValue = $gameVariables.value(52);
    gameVariableValue[421] += 50;
    gameVariableValue[423] += 30;
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_showPicturePictureParallelLoop_2 = function () {
    let pictureName;
    const pictureId = 60;
    pictureName = "test2";
    $gameScreen.showPicture(pictureId, pictureName, 1, 640, 384, 100, 100, 255, 0);
    pic_setArray(pictureId, 0, 20, 20);
    pictureName = "test2a_0";
    picture_anime1(pictureId + 1, pictureName, 3, 10, "連番", 20, 1, true, [1, 2, 1, 1]);
    pic_set(pictureId + 1, 1, 255, 20);
    hcg_piston(pictureId, 8, 1, 1);
    hcg_piston(pictureId - 1, 8, 1, 1);
    $gameSwitches.setValue(HELPER_SWITCH.LOOP_PICTURE_MOVEMENT, true);
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_configureMapEventEv003 = function () {
    const event = $gameMap.event(3);
    event.setDirectionFix(true);
    event.setStepAnime(false);
    event.setWalkAnime(false);
    event.resetPattern();
    event._originalPattern = 1;
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_initValueWordSet0Ev003 = function () {
    valueWordSet0 = "あああああ";
    adv_partDirectPlay(18);
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_runScriptEv003 = function () {
    curveFunctions.initialize();
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_setSelfVariableActorChoiceEv003 = function (interp) {
    valueFaceSelect = 4;
    $gameVariables.setValue(20, 1);
    $gameVariables.setValue(276, 1);
    battle_bustUp(51, 500, 10, 40);
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_runScriptJump = function () {
    curveFunctions.patternY = curveFunctions.getPattern("jump", [-100]);
    curveFunctions.patternOpacity = curveFunctions.getPattern("jump", [400]);
  };

  // Curve properties that all use the same smooth pattern.
  const SMOOTH_PATTERN_PROPERTIES = [
    "patternX",
    "patternY",
    "patternScaleX",
    "patternScaleY",
    "patternOpacity"
  ];

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_getPatternSmooth = function () {
    // Every property gets its own curve instance, exactly like the five separate calls.
    SMOOTH_PATTERN_PROPERTIES.forEach(function (property) {
      curveFunctions[property] = curveFunctions.getPattern("smooth", [10]);
    });
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_iterateArmorsPassiveState = function () {
    const stateId = Number($dataArmors[219].meta["Passive State"]);
    if (!Number.isFinite(stateId)) return;
    const nextStateId = stateId + 1;
    CommonPopupManager.showInfo({}, String(nextStateId), null);
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_createFilterZettyou = function () {
    const zettyou = "zettyou";
    $gameMap.createFilter(zettyou, "blur", 0, "screen");
    $gameMap.setFilter(zettyou, [5]);
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_setSwitchBossBattleImminent = function (interp) {
    boss_setup1(2, 56);
    $gameSwitches.setValue(211, true);
    valueVictoryResult1 = interp._eventId;
    interp.setupChild($dataCommonEvents[121].list, 0);
    //this.setupChild($dataCommonEvents[122].list, 0);
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_particleEditItemGain = function (interp) {
    const itemGain = "item_gain";
    $gameScreen._particle.particleEdit(interp._eventId, itemGain, "this");
    //$gameScreen._particle.particleEdit(0,itemGain,'screen','def','above');
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_particleUpdateActorParticleLight = function () {
    const actorParticleLight = "actor_particleLight";
    $gameScreen._particle.particleUpdate([actorParticleLight, "rect", -700, 400, 1300, 768]);
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_showPictureScreenBlackOut_2 = function () {
    let particleName;
    const pictureId = 51;
    const ScreenBlackOut = "ScreenBlackOut";
    $gameScreen.showPicture(pictureId, ScreenBlackOut, 1, 640, 384, 100, 100, 150, 0);
    particleName = "lines_width1";
    $gameScreen._particle.particleSet(0, particleName, "screen", "def", "above");
    particleName = "lines_width2";
    $gameScreen._particle.particleSet(0, particleName, "screen", "def", "screen");
    particleName = "lines_width3";
    $gameScreen._particle.particleSet(0, particleName, "screen", "def", "spriteset");
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_pushToArrayEv003 = function () {
    $gameActors.actor(1).actor().traits.push({ code: 11, dataId: 11, value: 1.5 });
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_iterateEnemiesEv003 = function () {
    const experienceReward = 10000;
    $dataEnemies[11].exp = experienceReward;
    $dataEnemies[12].exp = experienceReward;
    $dataEnemies[13].exp = experienceReward;
    $dataEnemies[42].exp = experienceReward;
    $dataEnemies[61].exp = experienceReward;
    $dataEnemies[62].exp = experienceReward;
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_iterateTroopsEv003 = function () {
    const troopsId = 10; //グループIDを指定
    $dataTroops[troopsId].name = "アレク"; //グループのメンバーを空に
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_push = function () {
    const troopsId = 10; //グループIDを指定
    $dataTroops[troopsId].members = []; //グループのメンバーを空に
    const enemy = { enemyId: 11, x: 450, y: 420, hidden: false }; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
    $dataTroops[troopsId].members.push(enemy); //設定したエネミーをグループに追加
  };

  // Replaces (1x): Map007.json:event:3|EV003|page:1
  AGH_readVariableDungeonInfoItemEv003 = function () {
    const start = 1;
    const end = 6;
    const dungeonInfoItemId = $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID);
    for (let i = start; i <= end; i++) {
      const itemMeta = $dataItems[dungeonInfoItemId].meta["出現エネミー" + i];
      if (Number(itemMeta.split(",")[0]) >= 21) {
        $dataEnemies[i + 10].exp = $dataEnemies[itemMeta.split(",")[0]].exp;
      }
    }
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_particleEditLightLeakS = function (interp) {
    const lightLeakS = "light_leak_s";
    $gameScreen._particle.particleEdit(interp._eventId, lightLeakS, "this", "def", "spriteset");
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_runScriptGoodsShine2 = function () {
    const goodsShine2 = "goods_shine2";
    $gameScreen._particle.particleEdit(0, goodsShine2, "screen", "def", "spriteset");
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_concatArrayEv004000 = function () {
    $gameScreen._tone_temp = $gameScreen.tone().concat();
    $gameScreen.startTint([-150, -150, -150, 150], 10);
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_setDTextPictureEv004000 = function () {
    const messageText = "パーティに加わった！";
    $gameScreen.setDTextPicture(messageText, 28);
    adv_partDirectPlay(8);
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_setVariableNpcSpawnRandom1 = function () {
    for (let i = 1; i <= 5; i++) {
      $gameVariables.setValue(33, "BB_akunin"); //グラ名前
      $gameVariables.setValue(35, 3); //グラ番号
      $gameVariables.setValue(37, getRandomIndex(3) + 2); //速度
      $gameVariables.setValue(34, getRandomIndex(2) + 4); //頻度
      map_npcRespawn(1, 124); //1で任意,次にイベID
    }
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_spawnEventRandom = function () {
    const conditionMap = {};
    conditionMap.passable = 1;
    conditionMap.screen = 0;
    conditionMap.collided = 3;
    conditionMap.terrainTags = [0];
    conditionMap.regionIds = [1];
    $gameMap.spawnEventRandom(78, conditionMap, true);
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_particleEditDappledR = function () {
    const dappledR = "dappled_r"; //木漏れ日[リージョン]
    $gameScreen._particle.particleEdit(0, dappledR, "weather", "def", "screen");
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_particleEditRippleWalk = function (interp) {
    const rippleWalk = "ripple_walk"; //集中線
    $gameScreen._particle.particleEdit(0, rippleWalk, "this._eventId", "def");
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_showPictureHStatusLibidoChange = function () {
    const pictureId = 51;
    $gameVariables.setValue(192, 1);
    $gameScreen.showPicture(
      pictureId + 6,
      "HstatesActorBody" +
        $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID) +
        "_" +
        $gameVariables.value(192),
      1,
      624,
      400,
      100,
      100,
      255,
      0
    );
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_showPictureMovie2 = function () {
    $gameScreen.setVideoPictureName("Movie2", "on", false);
    const pictureId = 53 + 2;
    $gameScreen.showPicture(pictureId, "", 1, 640 - 128, 384, 100, 100, 255, 0);
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_runScriptEv004000 = function () {
    const pictureId = 53 + 2;
    const picture = $gameScreen.picture(pictureId);
    if (picture) {
      picture.setVideoLoop(pictureId);
    }
    if (picture) {
      picture.setVideoSpeed(50);
    }
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_movePictureXev10001 = function () {
    let pictureName;
    const pictureId = 53;
    pictureName = "Xev100_01";
    pic_1(0, pictureId + 1, pictureName, 0, 100, 255, 60, 1280, 768, -256, 0);
    pictureName = "Xev100_01_100";
    picture_anime1(pictureId + 3, pictureName, 5, 1, "連番", 300, 3, true, [2, 4]);
    $gameScreen.movePicture(pictureId + 3, 1, 640 - 128, 384, 100, 100, 200, 0, 60);
    picture_anime1(pictureId + 4, pictureName, 5, 1, "連番", 200, 3, true, [3, 1, 5, 1]);
    $gameScreen.movePicture(pictureId + 4, 1, 640 - 128, 384, 100, 100, 100, 0, 60);
    for (let i = pictureId + 1; i <= pictureId + 4; i++) {
      hcg_piston(i, 8, 1);
    }
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_movePictureXev10001Ev004000 = function () {
    let pictureName;
    const pictureId = 53;
    pictureName = "Xev100_01";
    pic_1(0, pictureId + 1, pictureName, 0, 100, 255, 60, 1280, 768, -256, 0);
    pictureName = "Xev100_01hip2_100";
    pic_1(2, pictureId + 2, pictureName, 0, 100, 200, 1, 1280, 768, -256, 0);
    pictureName = "Xev100_01_100";
    picture_anime1(pictureId + 3, pictureName, 5, 1, "連番", 180, 3, true, [2, 4]);
    $gameScreen.movePicture(pictureId + 3, 1, 640 - 128, 384, 100, 100, 200, 0, 60);
    picture_anime1(pictureId + 4, pictureName, 5, 1, "連番", 100, 3, true, [3, 1, 5, 1]);
    $gameScreen.movePicture(pictureId + 4, 1, 640 - 128, 384, 100, 100, 100, 0, 60);
    for (let i = pictureId + 1; i <= pictureId + 4; i++) {
      hcg_piston(i, 8, 1);
    }
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_movePictureXev10001hip2100 = function () {
    const pictureId = 53;
    const Xev10001hip2100 = "Xev100_01hip2_100";
    //picture_anime1(pictureId+2,Xev10001hip2100,3,1,"連番",50,3,true,[1,1,2,3,2,1]);
    picture_anime1(pictureId + 2, Xev10001hip2100, 3, 1, "連番", 50, 3, true, [1, 1, 2, 1, 2, 1, 1]);
    $gameScreen.movePicture(pictureId + 3, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_readVariableActorChoiceEv004000 = function () {
    const selectedActorId = $gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID);
    const gameVariableValue = $gameVariables.value(360 + selectedActorId);
    gameVariableValue[11] = 3;
    gameVariableValue[12] = 3;
    gameVariableValue[211] = 1;
    gameVariableValue[212] = 2;
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_iterateMapEventsIconDisplay = function () {
	return; // return because it is the debug code and the result console log message was commented, uncomment when will need again

    for (let id = $gameMap.events().length; id > 0; id--) {
      const mapEvent = $gameMap.event(id);
      if (!!mapEvent) {
        const eventData = mapEvent.event();
        if (eventData.meta["IconDisplay"]) {
          //iconDisplay is a dead verbatim leftover: the commented debug block reads value1
          //var iconDisplay = Number(eventData.meta["IconDisplay"]);
          /*if (value1 == 17) {
            if ($gameMap.event(id).characterName() == 0) {
              console.log(`${1}`);
            }
          }*/
        }
      }
    }
  };

  // Replaces (1x): Map007.json:event:4|EV004000|page:1
  AGH_setSelfVariableRandomWork1Ev004000 = function (interp) {
    const randomWorkValue = $gameVariables
      .value(174)
      [$gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID)].split(",");
    $gameVariables.setValue(21, randomWorkValue);
  };

  // Replaces (1x): Map007.json:event:5|EV005|page:1
  AGH_particleUpdateMonsterC = function (interp) {
    let particleName;
    particleName = "monster_c";
    const startColor = "#ffffff";
    const endColor = "#460000";
    $gameScreen._particle.particleUpdate([
      particleName + "-" + interp._eventId,
      "color",
      String(startColor),
      String(endColor)
    ]);
    particleName = "mysterious_torch_c";
    $gameScreen._particle.particleUpdate([particleName, "alpha", "0", "0.7@0.5", "0"]);
  };

  // Replaces (1x): Map007.json:event:5|EV005|page:1
  AGH_erasePictureEasing = function (interp) {
    const args = new Array("easeOutQuad");
    interp.pluginCommand("easing", args);
    pic_1(0, 5, "/img/parallaxes/ScreenBlackOut", 0, 100, 200, 30, 1280, 768, 0, 0);
    pic_1(0, 55, "test2", 0, 100, 255, 30, 1024, 768, 100, 0);
    //0-0がH1が普通,1ﾋﾟｸID,2ﾌｧｲﾙ名,3表示演出0か1,4拡大率,
    //5透明率,6ｳｪｲﾄ,7と8横縦サイズ(基本は解像度か1024)
    //$gameScreen.erasePicture(70);
    //'/img/parallaxes/画面暗転'
  };

  // Replaces (1x): Map007.json:event:7|EV007|page:1
  AGH_setSelfVariableActorChoiceEv007 = function (interp) {
    $gameVariables.setValue(20, 1);
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    actor.gainExpSubclass(1000);
  };

  // Replaces (1x): Map007.json:event:7|EV007|page:1
  AGH_iteratePartyMembersEv007 = function () {
    const battleMembers2 = $gameParty.battleMembers();
    for (let i = 0; i < battleMembers2.length; i++) {
      const battleMember = battleMembers2[i];
      if ($gameParty.members().contains(battleMember)) {
        battleMember.learnSkill(297);
        battleMember.gainSkillMasteryUses(297, 100);
        battleMember.learnSkill(300);
        battleMember.gainSkillMasteryUses(300, 100);
        battleMember.learnSkill(308);
        battleMember.gainSkillMasteryUses(308, 100);
        battleMember.learnSkill(340);
        battleMember.gainSkillMasteryUses(340, 100);
      }
    }
  };

  // Replaces (1x): Map007.json:event:7|EV007|page:1
  AGH_iterateSkillsEv007 = function () {
    const actorId = 1;
    const start = 61;
    const end = 64;
    for (let i = start; i <= end; i++) {
      if (!$dataSkills[i].name == "") {
        $gameActors.actor(actorId).learnSkill(i);
      }
    }
  };

  // Replaces (1x): Map007.json:event:7|EV007|page:1
  AGH_iterateStatesEv007 = function () {
    $dataStates[600].traits.push({ code: 43, dataId: 682, value: 0 });
  };

  // Replaces (1x): Map007.json:event:7|EV007|page:1
  AGH_readVariableActorChoiceEv007 = function (interp) {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    const list = valueHstateDisplay;
    list.forEach(function (id) {
      actor.addState(id);
    }, interp);
  };

  // Replaces (1x): Map007.json:event:10|EV010|page:1
  AGH_configureMapEventEv010 = function () {
    const eventId = 6;
    const character = $gameMap.event(eventId);
    const valid = false;

    character.residual().setValid(valid);
  };

  // Replaces (1x): Map007.json:event:10|EV010|page:1
  AGH_configureMapEventEv010_2 = function () {
    const eventId = 11;
    const character = $gameMap.event(eventId);
    const r = 0;
    const g = 255;
    const b = 0;
    const gray = 255;
    const color = [r, g, b, gray];
    const valid = true;

    character.residual().setColorTone(color);
    character.residual().setValid(valid);
  };

  // Replaces (1x): Map007.json:event:11|EV011|page:1
  AGH_traceDebugEv011 = function () {
    //var value1 = 51;
    //console.log(`${-value1 + 30}`);
  };

  // Replaces (1x): Map007.json:event:17|EV017|page:1
  AGH_pluginCommandPicture = function (interp) {
    const pictureId = 71;
    const picture = "picture";
    const fadePatternId = "153";
    //一刀両断102横から崩壊161縦から崩壊162
    //横両断008封印054内側から153
    const args = new Array(String(picture), String(pictureId), "fadeOut", String(fadePatternId), "60", "5");
    interp.pluginCommand("GWFade", args);
  };

  // Replaces (1x): Map007.json:event:22|EV022|page:2
  AGH_iterateMapEvents = function (interp) {
    let characterId;
    characterId = 0;
    for (let id = $gameMap.events().length - 1; id > 0; id--) {
      const mapEvent = $gameMap.event(id);
      if (!!mapEvent) {
        if (mapEvent.event().meta["ベッド"]) {
          characterId = id;
          break;
        }
      }
    }
    if (!(characterId >= 1)) return;

    const character2 = interp.character(characterId);
    const positionX = character2.x;
    const positionY = character2.y;
    $gamePlayer.reserveTransfer($gameMap.mapId($gameVariables.value(52)), positionX, positionY, 2);
    $gamePlayer.performTransfer();
  };

  // Replaces (1x): Map007.json:event:22|EV022|page:2
  AGH_readMapEventMetaRaceDefeatCount = function (interp) {
    let characterId;
    characterId = 0;
    for (let id = $gameMap.events().length - 1; id > 0; id--) {
      const mapEvent = $gameMap.event(id);
      if (!!mapEvent) {
        if (mapEvent.event().meta["着替え"]) {
          characterId = id;
          break;
        }
      }
    }
    if (!(characterId >= 1)) return;

    const character2 = interp.character(characterId);
    const positionX = character2.x;
    const positionY = character2.y;
    $gamePlayer.reserveTransfer($gameMap.mapId($gameVariables.value(52)), positionX, positionY + 1, 8);
    $gamePlayer.performTransfer();
  };

  // Replaces (1x): Map007.json:event:23|EV023|page:1
  AGH_readVariableActorChoiceEv023 = function () {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    actor.addState(693);
    tachie_dousa(2, 1, 2, 12, 1, 255, 1323, 0, 0);
    tachie_dousa(2, 1, 2, 12, 1, 255, 1325, 0, 0);
    tachie_dousa(0, 1, 1, 12, 13, 0, 60, 0, 0);
    //tachie_clothReflect(1);
  };

  // Replaces (1x): Map007.json:event:23|EV023|page:1
  AGH_initValuePic1Ev023 = function () {
    valuePic1 = 19;
    curveFunctions.patternX = curveFunctions.getPattern("jump", [-30]);
    picTachie_move1(valuePic1, 0, 0, 0, 0, 255, 30);
    //0id,1x,2y,3拡x,4拡y,5opa,6wait//こちらの代入は透明度とwaitのみ
    picture_animation1(valuePic1, 0, -300, 200);
    //0id,1x,2y,3animeId
    picture_motion1("smooth", [0]);
  };

  // Replaces (1x): Map007.json:event:23|EV023|page:1
  AGH_waitEv023 = function (interp) {
    valueWordSet0 = 12;
    tachie_clothesHason(1, 25, valueWordSet0, 1, 1);
    interp.wait(Math.randomInt(10));
  };

  // Replaces (1x): Map007.json:event:23|EV023|page:1
  AGH_setVariableActorChoiceEv023 = function (interp) {
    const actor = $gameActors.actor($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    actor.addState(23);
    tachie_syoukyo1(getPreviousTachiePicId());
    $gameVariables.setValue(HELPER_VARIABLE.SELECTED_ACTOR_ID, 1);
    kisekae_tyokusetusitei(1324, 23);
    //tachie_hyouji1($gameVariables.value(HELPER_VARIABLE.SELECTED_ACTOR_ID));
    tachie_syoukyo1(getPreviousTachiePicId());
    interp.wait(60);
  };

  // Replaces (1x): Map007.json:event:32|EV032|page:1
  AGH_spawnMapEventEv032 = function () {
    const playerRealX = $gamePlayer._realX;
    const playerRealY = $gamePlayer._realY + 1;
    $gameMap.spawnEvent(122, playerRealX, playerRealY, true);
    valueCountSet1 = $gameMap.getLastSpawnEventId();
  };

  // Replaces (1x): Map007.json:event:32|EV032|page:1
  AGH_eventStatueOrbC = function () {
    const primaryCounter = "statue_orb_c" + "-" + valueCountSet1;
    $gameScreen._particle.particleClear(primaryCounter);
    if (!!$gameMap.event(valueCountSet1)) {
      $gameMap.eraseEvent(valueCountSet1);
    }
  };

  // Replaces (1x): Map007.json:event:34|EV034|page:1
  AGH_waitEv034 = function (interp) {
    valueSerialPictureId = 76;
    valueSerialPictureId += 1;
    const array = [-50, 0, 50, -100, 100];
    const randomYOffsets = [-50, 0, 50, -100, 100];
    const lineCandidates = ["「オラッ！」", "「オラァッ！」"];
    chara_oneWord(valueSerialPictureId, interp._eventId, 25, 60, array, randomYOffsets, lineCandidates);
    interp.wait(20);
  };

  // Replaces (1x): Map007.json:event:54|EV054|page:1
  AGH_setWaitModeRoute = function (interp) {
    interp._character = $gamePlayer;
    interp.setWaitMode("route");
  };

  // Replaces (1x): Map007.json:event:58|EV058|page:1
  AGH_eventDomeBed = function () {
    let event;
    for (let id1 = 1; id1 <= 200; id1++) {
      const mapEvent = $gameMap.event(id1);
      if (!!mapEvent) {
        if (mapEvent.event().meta["DomeBed"]) {
          event = mapEvent;
          event.setDirectionFix(false);
          event.setDirection(2);
          event.setDirectionFix(true);
        }
      }
    }
  };

  // Replaces (1x): Map018.json:event:21|EV021|page:1
  AGH_setSelfVariableRandomWork1Ev021 = function (interp) {
    const weaponData = $dataWeapons[315];
    if (weaponData.meta["FamilyName"]) {
      $gameVariables.setValue(21, weaponData.meta["FamilyName"]);
    } else {
      $gameVariables.setValue(21, "　");
    }
  };

  // Replaces (1x): Map018.json:event:25|EV025|page:1
  AGH_runPluginCommandCutInNoWaitEv025 = function (interp) {
    $gameSwitches.setValue(428, true);
    valueScenePic = "XevS002_";
    const XevO00202 = "XevO002_02";
    valueCutInSet1 = ["Ｈシーン演出", XevO00202, 270, 2, 1, 25, 60];
    const args = new Array(String(valueCutInSet1[0]));
    interp.pluginCommand("味方カットイン", args);
  };

  // Replaces (1x): Map018.json:event:32|EV032|page:1
  AGH_setSelfVariableChoiceSwitch12Ev032 = function (interp) {
    $gameVariables.setValue(172, 8);
    valueTalkSet = [101, "Goods_Letter1", 60];
    interp.setupChild($dataCommonEvents[60].list, 0);
  };

  // Replaces (1x): Map018.json:event:39|EV039|page:1
  AGH_readVariableActor19HStatus = function () {
    $gameActors.actor(19).setName("青年Ａ");
    $gameVariables.value(399)[59] = "ネルガド住民";
    $gameActors.actor(20).setName("青年Ｂ");
    $gameVariables.value(400)[59] = "ネルガド住民";
  };

  // Replaces (1x): Map035.json:event:20|EV020|page:1
  AGH_changeBattlebackDungeon141 = function () {
    const Dungeon141 = "Dungeon14_1";
    $gameMap.changeBattleback(Dungeon141, Dungeon141);
  };

  // Switches 1071..1074 trigger the scene, 1171..1174 record that it already ran.
  const SCENE_TRIGGER_SWITCH_FIRST_ID = 1071;
  const SCENE_TRIGGER_CLEARED_SWITCH_FIRST_ID = 1171;
  const SCENE_TRIGGER_SWITCH_COUNT = 4;

  // Replaces (1x): Map041.json:event:7|EV007|page:1
  AGH_setSelfSwitchSceneTrigger1 = function (interp) {
    for (let sceneOffset = 1; sceneOffset <= SCENE_TRIGGER_SWITCH_COUNT; sceneOffset++) {
      const isTriggered = $gameSwitches.value(SCENE_TRIGGER_SWITCH_FIRST_ID + sceneOffset - 1);
      const isAlreadyCleared = $gameSwitches.value(
        SCENE_TRIGGER_CLEARED_SWITCH_FIRST_ID + sceneOffset - 1
      );
      if (!isTriggered || isAlreadyCleared) continue;
      // The key is only built once a trigger actually fires (the interpreter may be absent).
      $gameSelfSwitches.setValue([$gameMap.mapId(), interp._eventId, "B"], false);
    }
  };

  // Replaces (1x): Map041.json:event:7|EV007|page:1
  AGH_checkSwitchSceneComplete1 = function () {
    let nextSceneItemId;
    nextSceneItemId = 571;
    if ($gameSwitches.value(1171)) {
      nextSceneItemId = 572;
    }
    if ($gameSwitches.value(1172)) {
      nextSceneItemId = 573;
    }
    if ($gameSwitches.value(1173)) {
      nextSceneItemId = 574;
    }
    if ($gameSwitches.value(1174)) {
      nextSceneItemId = 1000;
    }
    valueCountSet1 = nextSceneItemId;
  };

  // Replaces (1x): Map068.json:event:3|EV003|page:1
  AGH_showPictureEv003 = function () {
    let pictureId;
    pictureId = `\\V[801]\n\\V[802]\n\\V[803]\n\\V[804]\n\\V[805]`;
    $gameScreen.setDTextPicture(pictureId, 28);
    $gameScreen.dWindowFrame = "ON";
    $gameScreen.dTextAlign = 1;
    pictureId = 100;
    const pictureName = "";
    $gameScreen.showPicture(pictureId, pictureName, 0, 100 + 50, 100, 100, 100, 0, 0);
    $gameScreen.movePicture(pictureId, 0, 100, 100, 100, 100, 255, 0, 60);
  };

  // Replaces (1x): Map068.json:event:3|EV003|page:1
  AGH_readVariableAppearanceCharacterStartEv003 = function () {
    let actor, equips;
    const start = $gameVariables.value(HELPER_VARIABLE.FIRST_DEPLOYED_ACTOR_ID);
    const end = $gameVariables.value(HELPER_VARIABLE.LAST_DEPLOYED_ACTOR_ID);
    for (let j = start; j <= end; j++) {
      actor = $gameActors.actor(j);
      equips = actor.equips();
      for (let i = 0; i < equips.length; i++) {
        if (equips[i]) {
          actor.changeEquipById(i + 1, 0);
        }
      }
    }
  };

  // Replaces (1x): Map081.json:event:4|EV004|page:1
  AGH_setVariableRandomWork1Ev004 = function () {
    const defeatedCnt = $gameVariables.value(52)[478];
    const targetDefeated = `\\sim[478]`;
    $gameVariables.setValue(
      HELPER_VARIABLE.RANDOM_WORK_1,
      `${targetDefeated}を10体討伐せよ
		現在討伐数：${defeatedCnt}体`
    );
  };

  // Replaces (1x): Map100.json:event:11|EV011|page:1
  AGH_readVariableRandomWork1Ev011 = function () {
    const randomWorkValue = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    for (let i = 1; i <= 10; i++) {
      $dataMap.events[i].name =
        `${$dataClasses[i + randomWorkValue - 10].name}→${$dataClasses[i + randomWorkValue].name}`;
    }
  };

  // Replaces (1x): Map100.json:event:11|EV011|page:1
  AGH_setSelfSwitchEv011 = function () {
    return AGH_setSelfSwitchAutoBirthCommon(10, "B", true);
  };

  // Replaces (1x): Map100.json:event:11|EV011|page:1
  AGH_showWindowTextEv011 = function (jobTier = 3, requiredGold = 100000, minimumClassLevel = 30) {
    const materialMetaKey = `クラス${jobTier}ジョブ解放素材`;
    const materialItemId = findItemIdByMetaKey(materialMetaKey);
    if (!materialItemId) return;
    const materialItem = $dataItems[materialItemId];
    const currentGold = $gameParty.gold();
    const ownedItemCount = $gameParty.numItems(materialItem);
    // Retain the original escape spelling, outside the translatable message.
    const currencyMarker = "\\G";
    const materialName = `\\iin[${materialItemId}]`;
    const messageText = `ジョブ解放条件
\t\t${requiredGold}${currencyMarker}消費（${currentGold}${currencyMarker}所持）
\t\t${materialName} 1個消費（${ownedItemCount}個所持）
\t\tパーティメンバーの誰か一人が、そのジョブの下位クラスLv${minimumClassLevel}以上。`;
    WindowManager.show(0, 250, 568, 1030, 200);
    WindowManager.drawText(0, messageText);
  };

  // Replaces (1x): Map100.json:event:11|EV011|page:1
  AGH_showWindowTextEv011_2 = function () {
    return AGH_showWindowTextEv011(2, 10000, 20);
  };

  // Replaces (1x): Map100.json:event:11|EV011|page:1
  AGH_forceMoveRouteCharactersEv011 = function (interp) {
    for (let i = 1; i <= 10; i++) {
      interp.character(i).forceMoveRoute({
        list: [{ code: 45, parameters: ["this.setTone(-150, -150, -150);"] }, { code: 0 }],
        repeat: false,
        skippable: true
      });
    }
  };

  // Replaces (1x): Map100.json:event:11|EV011|page:1
  AGH_readVariableItemProcessWorkEv011 = function (interp) {
    const characterId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    const character = interp.character(characterId);
    if (!character) return;
    const destinationMapId = $gameMap.mapId();
    const destinationX = character.x;
    const destinationY = character.y - 1;
    $gamePlayer.reserveTransfer(destinationMapId, destinationX, destinationY, 0);
    $gamePlayer.performTransfer();
  };

  // Replaces (1x): Map100.json:event:11|EV011|page:1
  AGH_unlockClassItemProcessWork = function (interp) {
    const characterId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    const animationId = 240;
    const randomWorkValue = $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    $gameParty.unlockClass(characterId + randomWorkValue);
    interp.character(characterId).requestAnimation(animationId);
  };

  // Replaces (1x): Map100.json:event:11|EV011|page:1
  AGH_forceMoveRouteCharactersRandomWork2 = function (interp) {
    const characterId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    interp.character(characterId).forceMoveRoute({
      list: [{ code: 45, parameters: ["this.setTone(0, 0, 0);"] }, { code: 0 }],
      repeat: false,
      skippable: true
    });
    const classNameIndex = characterId + $gameVariables.value(HELPER_VARIABLE.RANDOM_WORK_1);
    const className = $dataClasses[classNameIndex].name;
    $gameVariables.setValue(22, className);
  };

  // Replaces (1x): Map100.json:event:11|EV011|page:1
  AGH_forceMoveRouteCharactersItemProcessWork = function (interp) {
    const characterId = $gameVariables.value(HELPER_VARIABLE.PROCESSED_ENTRY_ID);
    interp.character(characterId).forceMoveRoute({
      list: [{ code: 37 }, { code: 45, parameters: ["this.jumpEx(0,20,14,0);"] }, { code: 0 }],
      repeat: false,
      skippable: true
    });
  };

  // Replaces (1x): Map144.json:event:12|EV012|page:1
  AGH_setSwitchEv012 = function () {
    const itemsCnt = 10;
    // item id from 154 to 159
    // switch id from 161 to 166
    for (let id = 154; id < 160; id++) {
      if ($gameParty.numItems($dataItems[id]) >= itemsCnt) {
        $gameSwitches.setValue(id + 7, true);
      }
    }
  };

  // Replaces (1x): Map196.json:event:3|EV207宿屋処理|page:1
  AGH_setVariableRandomWork3 = function () {
    $gameActors.actor(20).setName("宿受付");
    $gameVariables.value(400)[59] = `${$dataWeapons[431].name}`;
    valueCountSet1 = 1233;
    valueCountSet2 = 1234;
    $gameVariables.setValue(
      HELPER_VARIABLE.RANDOM_WORK_3,
      `「いらっしゃいませ。
		当ホテルにお越しくださり、誠に有難う御座います。
		最高級の設備をご用意しておりますので、
		ご堪能頂ければ幸いです」
		`
    );
    $gameVariables.setValue(HELPER_VARIABLE.RANDOM_WORK_2, "$FACE[Vxa_People2, 0]");
  };

  // Replaces (1x): Map200.json:event:11|EV011|page:1
  AGH_setSelfVariableChoiceSwitch12Ev011 = function (interp) {
    $gameVariables.setValue(172, 19); //中央に一言メッセージ,何行でも良し
    const messageText = `\\V[23]`;
    valueTalkSet = [1, 28, messageText, 100]; //0で消去 1で通常 2で時間経過  255で背景透明度
    interp.setupChild($dataCommonEvents[60].list, 0);
  };

  // Private helpers: public AGH_* entry points and shared globals remain unchanged.
  function applyBraveCommandToMembers(target, stateId, counterIndex, orderStateId, members) {
    for (const member of members) {
      member.addState(orderStateId);
      // Intentionally live: addState/setStateCounter may replace the source counter.
      member.setStateCounter(stateId, target._stateCounter[stateId][counterIndex]);
    }
  }
  function updatePartyLimitGaugeForStance(target, stanceId, reverse) {
    if (!target.isStateAffected(stanceId)) return;
    const isGaugeUp = target.isStateAffected(415);
    if (isGaugeUp !== reverse) $gameTroop.losePartyLimitGauge(5);
    else $gameTroop.gainPartyLimitGauge(5);
  }
  function applyLimitGaugeState(user, target, stateId, animationId, actorName) {
    target.addState(stateId);
    const stateName = $dataStates[stateId].name;
    BattleManager._logWindow.push("addText", `${actorName}が${stateName}になった！`);
    state_applyCommonEffect(user, target, stateId, animationId);
  }
  function showRareChestReward(databaseTypeId, entryId, colorId) {
    if (databaseTypeId < 0 || databaseTypeId > 2) return;
    const database = getIWA(databaseTypeId);
    const entry = database[entryId];
    if (!entry) return;
    $gameParty.gainItem(entry, 1);
    const entryName = colorTaggedText(colorId, `I[${entry.iconIndex}]${entry.name}`);
    const messageText = `${entryName}を入手した！`;
    $gameScreen.setDTextPicture(messageText, 28);
    $gameSwitches.setValue(HELPER_SWITCH.RARE_CHEST_DISPLAY, true);
  }
  function countSenseMapObjects(map) {
    const counts = {
      treasureCount: 0,
      monsterSymbolCount: 0,
      hEnemyCount: 0,
      whiteTreasureCount: 0,
      gatherPointCount: 0,
      minePointCount: 0,
      dropPointCount: 0
    };
    const mapId = map.mapId();
    const events = map.events();
    for (let eventIndex = events.length - 1; eventIndex >= 0; eventIndex--) {
      const event = events[eventIndex];
      if (!event) continue;
      const eventData = event.event();
      if (!eventData || !eventData.meta) continue;
      countSenseMapEvent(counts, mapId, event.eventId(), eventData.meta);
    }
    return counts;
  }
  function countSenseMapEvent(counts, mapId, eventId, meta) {
    const isOpened = $gameSelfSwitches.value([mapId, eventId, "A"]);
    const isHidden = $gameSelfSwitches.value([mapId, eventId, "B"]);
    const isDefeated = $gameSelfSwitches.value([mapId, eventId, "C"]);
    if (meta.TreasureBox && !isOpened) counts.treasureCount++;
    if (meta.TreasureBoxW && !isOpened) counts.whiteTreasureCount++;
    if (meta.MonsterSymbol && !isHidden && !isDefeated) counts.monsterSymbolCount++;
    if (meta.Henemy && !isHidden && !isDefeated) counts.hEnemyCount++;
    if (isHidden) return;
    switch (Number(meta.IconDisplay)) {
      case 183:
        counts.gatherPointCount++;
        break;
      case 216:
        counts.minePointCount++;
        break;
      case 208:
        counts.dropPointCount++;
        break;
    }
  }
  function buildSenseMapReport(counts) {
    const dungeonItemId = $gameVariables.value(HELPER_VARIABLE.DUNGEON_INFO_ITEM_ID);
    const treasureTables = $gameVariables.value(HELPER_VARIABLE.DUNGEON_TREASURE_LISTS);
    const dungeonTreasures = treasureTables && treasureTables[dungeonItemId];
    const dungeonTreasureTotal = Array.isArray(dungeonTreasures) ? dungeonTreasures.length : 0;
    const maxEnemyCount = $gameVariables.value(HELPER_VARIABLE.MAX_ENEMY_COUNT);
    const maxHEnemyCount = $gameVariables.value(HELPER_VARIABLE.MAX_H_ENEMY_COUNT);
    const {
      treasureCount,
      monsterSymbolCount,
      hEnemyCount,
      whiteTreasureCount,
      gatherPointCount,
      minePointCount,
      dropPointCount
    } = counts;
    return `このダンジョンorフィールド内の通常宝箱現在数：${dungeonTreasureTotal}個
現在マップエネミー数　　：${monsterSymbolCount}/${maxEnemyCount}体　現在マップＨエネミー数　：${hEnemyCount}/${maxHEnemyCount}体
現在マップ宝箱数　　　　：${treasureCount}個　　　現在マップ白銀宝箱数　　：${whiteTreasureCount}個
現在マップ採取ポイント数：${gatherPointCount}個　　現在マップ採掘ポイント数：${minePointCount}個
現在マップ落とし物数　　：${dropPointCount}個

※ カーソルをそのままで決定ボタンorマウス左クリック
`;
  }

  function numericCaseValue(value) {
    return value == null ? value : Number(value);
  }
})();
