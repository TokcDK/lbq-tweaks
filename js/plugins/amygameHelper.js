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

	//内部用。変数292(スポーンID一覧)が未設定/配列でない場合の事故を防ぐ
	function aghSpawnIdList () {
		var spawnIdList = $gameVariables.value(292);
		return Array.isArray(spawnIdList) ? spawnIdList : [];
	}

	//=============================================================================
	// Scene return / position bookkeeping (common event 54 family)
	//=============================================================================

	// Replaces (~90x):
	//   $gameVariables.setValue(171,[x,y,z]);        <- position array or expression
	//   this.setupChild($dataCommonEvents[54].list, 0);
	AGH_sceneReturnSetup = function (interp, pos171) {
		$gameVariables.setValue(171, pos171);
		interp.setupChild($dataCommonEvents[54].list, 0);
	};

	//=============================================================================
	// Conversation face selection
	//=============================================================================

	// Replaces (~57x):
	//   this.sVal(172,7);//会話途中顔グラ。
	//   $gameVariables.setValue(20,<actorId>);
	//   valueFaceSelect = <faceNo>;
	AGH_faceSelectMidTalk = function (interp, actorId, faceNo) {
		interp.sVal(172, 7); //会話途中顔グラ。
		$gameVariables.setValue(20, actorId);
		valueFaceSelect = faceNo;
	};

	//=============================================================================
	// H-scene recall / replay presets
	//=============================================================================

	// Replaces (~48x):
	//   this.sVal(530,<mainChara>);//主格キャラ
	//   this.sVal(535,<itemSub>);//挿話回想の場合アイテムID。メインは0
	//   valueWeatherSceneSet = <weather>;
	//   h_keikenhyouji1(521,<partnerId>);//記録変数,相手ID
	AGH_recallSceneSetup = function (interp, mainChara, itemSub, weather, partnerId) {
		interp.sVal(530, mainChara); //主格キャラ
		interp.sVal(535, itemSub); //挿話回想の場合アイテムID。メインは0
		valueWeatherSceneSet = weather;
		h_keikenhyouji1(521, partnerId); //記録変数,相手ID
	};

	// Replaces (~44x):
	//   valueScenePic = '<prefix>';
	//   //var value2 = valueScenePic+'01';
	//   this.sVal(530,<mainChara>);
	//   this.sVal(535,<itemSub>);
	//   h_keikenhyouji1(521,<partnerId>);
	//   valueWeatherSceneSet = <weather>;
	//   $gameVariables.setValue(20,$gameVariables.value(530));
	AGH_xevSceneIntro = function (interp, scenePic, mainChara, itemSub, partnerId, weather) {
		valueScenePic = scenePic;
		//var value2 = valueScenePic+'01';
		interp.sVal(530, mainChara); //主格キャラ
		interp.sVal(535, itemSub); //挿話回想の場合アイテムID。メインは0
		h_keikenhyouji1(521, partnerId); //記録変数,相手ID
		valueWeatherSceneSet = weather;
		$gameVariables.setValue(20, $gameVariables.value(530)); //H主体ｱｸﾀｰID
	};

	//=============================================================================
	// Boss battle helpers
	//=============================================================================

	// Replaces (~37x): spawn blood-stain decal behind defeated boss event.
	AGH_bossBloodMark = function () {
		var event = $gameMap.event(valueBossId);
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
		var mapEvent = $gameMap.event(interp._eventId);
		if (!mapEvent) return;
		var bossGura = mapEvent.event().meta['BossGura'];
		if (!bossGura) return;
		var bossGuraParams = bossGura.split(',');
		boss_setup1(Number(bossGuraParams[0]), Number(bossGuraParams[1]));
	};

	//=============================================================================
	// Counter flags (parallel-event counters)
	//=============================================================================

	// Replaces (~28x):
	//   valueCountSet3 = <v3>;
	//   valueCountSet1 = <v1>;
	AGH_setCountSet = function (v3, v1) {
		valueCountSet3 = v3;
		valueCountSet1 = v1;
	};

	//=============================================================================
	// Spawned-NPC respawn presets
	//=============================================================================

	// Replaces (~27x):
	//   var value1 = $gameVariables.value(530);
	//   event_respawnSetA(value1,<a>,<b>,<c>[,<d>]);
	//   this._eventId = $gameVariables.value(292)[value1];
	AGH_respawnPartyAndSetId = function (interp, a, b, c, d) {
		var spawnSlot = $gameVariables.value(530);
		if (arguments.length >= 5) {
			event_respawnSetA(spawnSlot, a, b, c, d);
		} else {
			event_respawnSetA(spawnSlot, a, b, c);
		}
		interp._eventId = aghSpawnIdList()[spawnSlot] || 0;
	};

	// Replaces (~31x):
	//   var value1 = <id or expression>;
	//   var event = $gameMap.event($gameVariables.value(292)[value1]);
	//   event.locate(<x>, <y>);
	//   event.setDirection(<dir>);
	AGH_locateSpawnedNpc = function (id, x, y, dir) {
		var spawnSlot = id;
		var event = $gameMap.event(aghSpawnIdList()[spawnSlot]);
		if (!event) return;
		event.locate(x, y);
		event.setDirection(dir);
	};

	// Replaces (~26x):
	//   var arr1 = [];
	//   arr1.push($gameVariables.value(292)[<id1>]); ...
	//   event_NpcCharaMoveId(45,"<action>",arr1);
	AGH_npcGroupAction = function (ids, action) {
		var spawnIdList = aghSpawnIdList();
		if (spawnIdList.length === 0) return;
		var spawnEventIds = [];
		ids.forEach(function (id) {
			spawnEventIds.push(spawnIdList[id]);
		});
		event_NpcCharaMoveId(45, action, spawnEventIds);
	};

	//=============================================================================
	// UI notices / windows
	//=============================================================================

	// Replaces (~24x): region/map unlock notification popup (common event 45).
	AGH_regionUnlockNotice = function (interp, sw1, sw2) {
		interp.sVal(20, 0);
		var newEntryName = $dataSystem.switches[sw1];
		var regionName = $dataSystem.switches[sw2];
		valueWordSet0 = `${regionName}に\\C[16]${newEntryName}\\C[0]が追加されました`;
		valueWordSetEx = 0; //補足が必要な場合
		interp.setupChild($dataCommonEvents[45].list, 0);
	};

	// Replaces (~23x): party join/leave processing via common event 64.
	//   this.sVal(14,<mode14>);this.sVal(20,<mode20>);this.sVal(121,0);
	//   this.setupChild($dataCommonEvents[64].list, 0);
	AGH_partyJoinLeaveCommon = function (interp, mode14, mode20) {
		interp.sVal(14, mode14);
		interp.sVal(20, mode20);
		interp.sVal(121, 0);
		interp.setupChild($dataCommonEvents[64].list, 0);
	};

	// Replaces (~10x):
	//   this.sVal(172,16);
	//   valueTalkSet = [<give>,<actorId>,<frames>];
	//   this.setupChild($dataCommonEvents[60].list, 0);
	AGH_talkSetCall = function (interp, give, actorId, frames) {
		interp.sVal(172, 16);
		valueTalkSet = [give, actorId, frames]; //1で付与2で直接表示\CE[60]のみ0で解除,ｱｸﾀｰid,ﾌﾚｰﾑ60,40,20
		interp.setupChild($dataCommonEvents[60].list, 0);
	};

	//=============================================================================
	// Picture / screen effects
	//=============================================================================

	// Replaces (~33x):
	//   var value1 = <picId>;
	//   $gameScreen.movePicture(value1,<origin>,<x>,<y>,100,<scaleY>,0,0,<dur>);
	AGH_movePictureTo = function (picId, origin, x, y, scaleY, dur) {
		var pictureId = picId;
		$gameScreen.movePicture(pictureId, origin, x, y, 100, scaleY, 0, 0, dur);
	};

	// Replaces (~16x):
	//   $gameSwitches.setValue(<switchId>,false);
	//   var arr1 = [<ids>];
	//   pic_eraseP(<layer>,arr1);
	AGH_erasePictureRange = function (switchId, layer, ids) {
		$gameSwitches.setValue(switchId, false);
		var picIds = ids;
		pic_eraseP(layer, picIds);
	};

	// Replaces (~12x):
	//   valuePic1 = <picId>;
	//   var value2 = '<imageName>';
	//   $gameScreen.showPicture(valuePic1,value2,1,640,384,100,100,255,0);
	//   picture_fade1(valuePic1,"fadeIn",<fadeTarget>,<frames>,5);
	AGH_showCgFadeIn = function (picId, imageName, fadeTarget, frames) {
		valuePic1 = picId;
		var cgImageName = imageName;
		$gameScreen.showPicture(valuePic1, cgImageName, 1, 640, 384, 100, 100, 255, 0);
		picture_fade1(valuePic1, "fadeIn", fadeTarget, frames, 5);
	};

	// Replaces (8x): slide out left-side standing pictures (11..20).
	AGH_slideOutLeftPictures = function () {
		for (var i = 11; i <= 20; i++) {
			if ($gameScreen.picture(i)) { ;
				if ($gameScreen.picture(i).x() >= 640) { ;
					$gameScreen.movePicture(i, 1, 1280, $gameScreen.picture(i).y(), $gameScreen.picture(i).scaleX(), $gameScreen.picture(i).scaleY(), 0, 0, 60);
				} else {
					$gameScreen.movePicture(i, 1, -500, $gameScreen.picture(i).y(), $gameScreen.picture(i).scaleX(), $gameScreen.picture(i).scaleY(), 0, 0, 60);
				}
			}
		};
	};

	//=============================================================================
	// Battle / party processing
	//=============================================================================

	// Replaces (8x): refresh whole party with passive/title re-application.
	AGH_partyBattleRefresh = function () {
		for (var i = 0; i < $gameParty.members().length; i++) {
			var actor = $gameParty.members()[i];
			passive_addCondition(actor);
			title_battleUp(actor);
			actor.refresh();
		};
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
		valueSPBuyCountSet1 = count;
		valueSPBuyCountSet2 = itemId;
		item_oneOffBuy(1, valueSPBuyCountSet1, valueSPBuyCountSet2, kind);
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
		var savedPos = $gameVariables.value(slot);
		if (!Array.isArray(savedPos)) savedPos = [];
		var mapId = savedPos[0];
		var mapX = savedPos[1];
		var mapY = savedPos[2];
		if (mapId >= 1) {
			$gamePlayer.reserveTransfer(mapId, mapX, mapY, 2, 2);
		} else {
			$gamePlayer.reserveTransfer(14, 2, 2, 2, 2);
		};
	};
	
	//=============================================================================
	// Party arrangement / return-to-scene processing (common event 54 family)
	//=============================================================================

	// Replaces (115x):
	//   event_PlayerArrangement($gameVariables.value(530));
	//   this.setupChild($dataCommonEvents[54].list, 0);
	CEH_arrangePartyAndCall54 = function (interp) {
		event_PlayerArrangement($gameVariables.value(530));
		interp.setupChild($dataCommonEvents[54].list, 0);
	};

	// Replaces (37x / 18x):
	//   $gameVariables.setValue(171,0);              <- or [18,26,2]
	//   $gameVariables.setValue(528,100);
	//   this.setupChild($dataCommonEvents[54].list, 0);
	CEH_sceneReturnSetup = function (interp, val171) {
		$gameVariables.setValue(171, val171);
		$gameVariables.setValue(528, 100);
		interp.setupChild($dataCommonEvents[54].list, 0);
	};

	// Replaces (11x):
	//   $gameVariables.setValue(171,[20,5,2]);
	//   this.setupChild($dataCommonEvents[54].list, 0);
	// Same as CEH_sceneReturnSetup but without resetting variable 528.
	CEH_sceneReturnKeepCount = function (interp, val171) {
		$gameVariables.setValue(171, val171);
		interp.setupChild($dataCommonEvents[54].list, 0);
	};

	//=============================================================================
	// Spawned-event bookkeeping (variable 292 spawn id list)
	//=============================================================================

	// Replaces (88x):
	//   var value1 = $gameVariables.value(530);
	//   this._eventId = $gameVariables.value(292)[value1];
	// and (34x):
	//   var value1 = 11;//$gameVariables.value(530);
	//   this._eventId = $gameVariables.value(292)[value1];
	//
	// NOTE: this helper was previously defined twice in this file. The second
	// definition read $gameVariables.value(292) directly and so threw whenever the
	// variable had not been initialised to an array yet, and it also dropped the
	// `|| 0` fallback, leaving _eventId undefined for an empty slot. The single
	// definition below keeps the guarded accessor and the fallback.
	CEH_setEventIdFromSpawnList = function (interp, slot) {
		interp._eventId = aghSpawnIdList()[slot] || 0;
	};

	// Replaces (18x):
	//   $gameVariables.setValue(292,Array(21).fill(0));
	CEH_clearSpawnList = function () {
		$gameVariables.setValue(292, Array(21).fill(0));
	};

	// Replaces (17x):
	//   for (var i = 0; i <= $gameVariables.value(292).length-1; i++) {
	//     ...
	//   };
	CEH_eraseAllSpawnedEvents = function () {
		var spawnIdList = aghSpawnIdList();
		for (var i = 0; i <= spawnIdList.length - 1; i++) {
			if (spawnIdList[i] >= 1) {
				if (!!$gameMap.event(spawnIdList[i])) {
					if (!$gameParty.inBattle()) { $gameMap.eraseEvent(spawnIdList[i]) };
				};
			};
		};
	};

	// Replaces (17x):
	//   if(this._eventId >= 1){
	//     valueThisEventId = this._eventId;
	//   } else {
	//     valueThisEventId = 0;
	//   };
	CEH_storeThisEventId = function (interp) {
		if (interp._eventId >= 1) {
			valueThisEventId = interp._eventId;
		} else {
			valueThisEventId = 0;
		};
	};

	// Replaces (21x):
	//   if(valueThisEventId >= 1){this._eventId = valueThisEventId};
	CEH_restoreThisEventId = function (interp) {
		if (valueThisEventId >= 1) { interp._eventId = valueThisEventId };
	};

	// Replaces (11x):
	//   this._eventId = valueBossId;
	CEH_setEventIdToBoss = function (interp) {
		interp._eventId = valueBossId;
	};

	//=============================================================================
	// Respawn presets (main NPC / sub NPC combinations)
	//=============================================================================

	// Replaces (19x):
	//   var value1 = $gameVariables.value(530);
	//   event_respawnSetA(value1,14,34,1,4);
	//   this._eventId = $gameVariables.value(292)[value1];
	//   var value1 = 11;
	//   event_respawnSetN(value1,16,15,0,'npcUnique1',0,4);
	CEH_respawnMainNpcDefault = function (interp) {
		var spawnSlot = $gameVariables.value(530);
		event_respawnSetA(spawnSlot, 14, 34, 1, 4);
		interp._eventId = aghSpawnIdList()[spawnSlot] || 0;
		var spawnSlot = 11;
		event_respawnSetN(spawnSlot, 16, 15, 0, 'npcUnique1', 0, 4);
	};

	// Replaces (18x):
	//   var value1 = $gameVariables.value(530);
	//   var arr1 = $gameVariables.value(163)[$gameVariables.value(535)];
	//   event_respawnSetA(value1,15,4,0,6);
	//   var event = $gameMap.event($gameVariables.value(292)[value1]);
	//   var value1 = 11;
	//   event_respawnSetN(value1,16,4,1,arr1[6],arr1[7],2);
	CEH_respawnSubNpcWithPreset = function (interp) {
		var presetList = $gameVariables.value(163);
		var npcPreset = Array.isArray(presetList) ? presetList[$gameVariables.value(535)] : null;
		if (!npcPreset) return;
		var spawnSlot = $gameVariables.value(530);
		event_respawnSetA(spawnSlot, 15, 4, 0, 6);
		var spawnSlot = 11;
		event_respawnSetN(spawnSlot, 16, 4, 1, npcPreset[6], npcPreset[7], 2);
	};

	// Replaces (11x):
	//   var value1 = $gameVariables.value(530);
	//   var arr1 = $gameVariables.value(163)[$gameVariables.value(535)];
	//   event_respawnSetA(value1,arr1[3],arr1[4],1);
	//   var event = $gameMap.event($gameVariables.value(292)[value1]);
	//   event.setImage(arr1[1], arr1[2]);
	//   event.setDirection(arr1[5]);
	//   this._eventId = $gameVariables.value(292)[value1];
	CEH_respawnSubNpcWithImage = function (interp) {
		var presetList = $gameVariables.value(163);
		var npcPreset = Array.isArray(presetList) ? presetList[$gameVariables.value(535)] : null;
		if (!npcPreset) return;
		var spawnSlot = $gameVariables.value(530);
		event_respawnSetA(spawnSlot, npcPreset[3], npcPreset[4], 1);
		var event = $gameMap.event(aghSpawnIdList()[spawnSlot]);
		if (event) {
			event.setImage(npcPreset[1], npcPreset[2]);
			event.setDirection(npcPreset[5]);
		}
		interp._eventId = aghSpawnIdList()[spawnSlot] || 0;
	};

	// Replaces (11x):
	//   var value1 = $gameVariables.value(530);
	//   var arr1 = $gameVariables.value(163)[$gameVariables.value(535)];
	//   event_respawnSetA(value1,arr1[3],arr1[4],1,arr1[5]);
	//   this._eventId = $gameVariables.value(292)[value1];
	//   var value1 = 11;
	//   event_respawnSetN(value1,arr1[8],arr1[9],0,arr1[6],arr1[7],arr1[10]);
	CEH_respawnSubNpcWithPresetArr = function (interp) {
		var presetList = $gameVariables.value(163);
		var npcPreset = Array.isArray(presetList) ? presetList[$gameVariables.value(535)] : null;
		if (!npcPreset) return;
		var spawnSlot = $gameVariables.value(530);
		event_respawnSetA(spawnSlot, npcPreset[3], npcPreset[4], 1, npcPreset[5]);
		interp._eventId = aghSpawnIdList()[spawnSlot] || 0;
		var spawnSlot = 11;
		event_respawnSetN(spawnSlot, npcPreset[8], npcPreset[9], 0, npcPreset[6], npcPreset[7], npcPreset[10]);
	};

	//=============================================================================
	// Camera work
	//=============================================================================

	// Replaces (19x):
	//   var value1 = $gameVariables.value(530);
	//   var value1 = $gameVariables.value(292)[value1];
	//   drowsepost.camera.zoom(1, 60, value1);
	CEH_zoomToPartySpawnedEvent = function () {
		var spawnSlot = $gameVariables.value(530);
		var spawnedEventId = aghSpawnIdList()[spawnSlot] || 0;
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
		picture_fade1(valuePic1, "fadeOut", valueWipeImg, 60, 5);
	};

	// Replaces (16x):
	//   var value2 = 'ScreenBlackOut';
	//   $gameScreen.showPicture(51,value2,1,640,384,100,100,200,0);
	//   picture_fade1(51,"fadeIn",valueWipeImg,60,5);
	CEH_blackoutFadeIn = function () {
		var blackoutImageName = 'ScreenBlackOut';
		$gameScreen.showPicture(51, blackoutImageName, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(51, "fadeIn", valueWipeImg, 60, 5);
	};

	// Replaces (13x):
	//   $gameSwitches.setValue(429,false);
	//   valueParallelPicSe1 = [0,0,0];
	//   valueParallelPicSe2 = [0,0,0];
	//   pic_setArray(0,0,0,0,0,0);
	//   picture_motion1("smooth",[0]);
	CEH_resetParallelPictureState = function () {
		$gameSwitches.setValue(429, false);
		valueParallelPicSe1 = [0, 0, 0];
		valueParallelPicSe2 = [0, 0, 0];
		pic_setArray(0, 0, 0, 0, 0, 0);
		picture_motion1("smooth", [0]);
	};

	//=============================================================================
	// Misc gameplay values
	//=============================================================================

	// Replaces (33x):
	//   $gameVariables.setValue(20,$gameVariables.value(530));//H主体ｱｸﾀｰID
	CEH_setCurrentActorId = function () {
		$gameVariables.setValue(20, $gameVariables.value(530)); // H主体ｱｸﾀｰID
	};

	// Replaces (24x):
	//   var arr1 = $gameVariables.value(163)[$gameVariables.value(535)];
	//   $gameVariables.setValue(171,[arr1[0],arr1[3],arr1[4]]);
	CEH_setScenePosFromPreset = function () {
		var presetList = $gameVariables.value(163);
		var npcPreset = Array.isArray(presetList) ? presetList[$gameVariables.value(535)] : null;
		if (!npcPreset) return;
		$gameVariables.setValue(171, [npcPreset[0], npcPreset[3], npcPreset[4]]);
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
		var peopleCount = getRandomIndex(6) + 5;                             //人数
		var vaginaCount = getRandomIndex(10) + 11;                           //膣回数
		var creampieVaginaCount = Math.floor(Math.random() * -5) + peopleCount; //中出し回数
		var anusCount = getRandomIndex(5) + 6;                               //アナル回数
		var creampieAnusCount = Math.floor(Math.random() * -2) + anusCount;   //中出し回数
		var oralCount = getRandomIndex(5) + 6;                              //フェラ回数
		var creampieOralCount = Math.floor(Math.random() * -2) + anusCount;  //口腔回数
		var incontinenceCount = getRandomIndex(3) + 0;                      //失禁回数

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
	//   var value1 = $gameVariables.value(530);
	//   var value1 = $gameVariables.value(292)[value1];
	//   event_partyCharaMove(45,"this.turnTowardCharacter($gameMap.event("+value1+"));");
	CEH_turnPartyTowardSpawnedEvent = function () {
		var spawnSlot = $gameVariables.value(530);
		var spawnedEventId = aghSpawnIdList()[spawnSlot] || 0;
		event_partyCharaMove(45, "this.turnTowardCharacter($gameMap.event(" + spawnedEventId + "));");
	};

	// Replaces (11x):
	//   this.sVal(172,7);//会話途中顔グラ。
	//   $gameVariables.setValue(20,1);
	//   valueFaceSelect = 8;
	CEH_faceSelectMidTalk = function (interp) {
		interp.sVal(172, 7); //会話途中顔グラ。
		$gameVariables.setValue(20, 1);
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
	event_charaPrepChara = function (eventId) {
		event_charaPreset(eventId);
		event_charaRoot(eventId);
	};
	
	// Replaces (25x): valueBossId = id; event_charaPreset(id); event_charaRoot(id);
	CEH_bossMarkAndCharaPrep = function (eventId) {
		valueBossId = eventId;
		event_charaPrepChara(eventId);
	};
	
	// Replaces (26x): event_charaPreset/Root + page variable -> event_pararelStarting
	CEH_mapEventPararelStart = function (eventId) {
		event_charaPrepChara(eventId);
		var pageVariable = $dataMap.events[eventId].pages[0].conditions.variableValue;
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
	
	// Replaces (5x): value = $dataItems[$gameVariables.value(240)]; popEnemy_setUp(value);
	CEH_popEnemySetUp = function () {
		var dungeonItem = $dataItems[$gameVariables.value(240)];
		popEnemy_setUp(dungeonItem);
	};
	
	// Replaces (10x): valueEnemyEventId = this.eventId(); this.sVal(21,this.eventId());
	CEH_storeEnemyEventId = function (interp) {
		valueEnemyEventId = interp.eventId();
		interp.sVal(21, interp.eventId());
	};
	
	// Replaces (9x): this._eventId = valueBossId; CEH_storeThisEventId(this); pic_erase(0);
	CEH_restoreBossEvent = function (interp) {
		interp._eventId = valueBossId;
		CEH_storeThisEventId(interp);
		pic_erase(0);
	};
	
	// Replaces (9x): self switch [mapId, eventId, 10] -> variable 21 as a grouped string
	AGH_selfSwitchValue10ToVar21 = function (interp) {
		var slotValue = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
		$gameVariables.setValue(21, slotValue.toLocaleString());
	};
	
	// Replaces (6x): same self switch -> shop_priceComparison(value,1,0)
	AGH_shopPriceComparisonFromSelfSwitch = function (interp) {
		var priceValue = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
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
		var weaponId = 22;
		for (var i = 1; i <= 100; i++) {
			if ($gameVariables.value(327)[i] == 2) {
				weaponId = i;
				break;
			}
		}
		var homePosition = $dataWeapons[weaponId].meta['HomePosition'].split(',');
		$gameVariables.setValue(161, [Number(homePosition[0]), Number(homePosition[1]), Number(homePosition[2])]);
		CEH_sceneReturnSetup(interp, $gameVariables.value(161));
	};
	
	// Replaces (6x): $dataItems[clothPartsChoice].name = `...`;
	AGH_setClothPartsChoiceName = function (name) {
		$dataItems[clothPartsChoice].name = name;
	};
	
	// Replaces (6x): valuePic1 = picId; showPicture(640,384) + picture_fade1.
	// valuePic1 is still assigned because later commands read it.
	AGH_setPicAndFadeIn = function (picId, imageName, opacity) {
		valuePic1 = picId;
		$gameScreen.showPicture(picId, imageName, 1, 640, 384, 100, 100, opacity, 0);
		picture_fade1(picId, 'fadeIn', valueWipeImg, 60, 5);
	};
	
	// Replaces (5x): showPicture + picture_fade1 at an explicit position.
	AGH_showPictureFadeIn = function (picId, imageName, x, y, scaleX, scaleY, opacity, fadeWait, moveWait) {
		$gameScreen.showPicture(picId, imageName, 1, x, y, scaleX, scaleY, opacity, 0);
		picture_fade1(picId, 'fadeIn', valueWipeImg, fadeWait, moveWait);
	};
	
	// Replaces (6x): the one-line talk popup (common event 60).
	// NOTE: the original assigned valueTalkSet twice, the second assignment
	// overwriting the first with [0,0,0]. That looks like a leftover bug in the
	// event data, but it is preserved here on purpose so behaviour is identical;
	// if the intent was [mode, 250, eventId], delete the second line.
	AGH_openTalkWindow = function (interp, mode) {
		interp.sVal(172, 21);
		valueTalkSet = [mode, 250, interp._eventId];
		valueTalkSet = [0, 0, 0];
		interp.setupChild($dataCommonEvents[60].list, 0);
	};
	
	// Replaces (6x): clear the particle attached to this event.
	AGH_clearEventParticle = function (interp, particlePrefix) {
		var particleName = particlePrefix + '-' + interp._eventId;
		$gameScreen._particle.particleClear(particleName);
	};
	
	// Replaces (4x): this._eventId = id; drowsepost.camera.zoom(mode, 60, this._eventId);
	CEH_focusEventAndZoom = function (interp, eventId, zoomMode) {
		interp._eventId = eventId;
		drowsepost.camera.zoom(zoomMode, 60, interp._eventId);
	};
	
	// Replaces (4x): open the quest board for the <QuestSet> item on this event.
	AGH_openQuestSetForThisEvent = function (interp) {
		valueCountSet1 = Number($gameMap.event(interp._eventId).event().meta['QuestSet']);
		quest_singleJutyuu(valueCountSet1);
	};
	
	// Replaces (4x): respawn a main NPC into a party slot, then make the
	// interpreter act on the event that was just created.
	CEH_respawnMainNpcAndTarget = function (interp, slot, x, y, zoomFlag, direction) {
		event_respawnSetA(slot, x, y, zoomFlag, direction);
		interp._eventId = $gameVariables.value(292)[slot];
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
	AGH_charaOneWord = function (picId, eventId, textPicId, waitFrames, randX, randY, lines) {
		chara_oneWord(picId, eventId, textPicId, waitFrames, [randX], [randY], lines);
	};
	
	// Replaces (5x): spawn the summons-boss event, register it in slot 12 and
	// start the boss intro CG + animation.
	AGH_summonBossCharaGura = function (x, y, imageName, cgWidth, cgHeight, animScale, animId) {
		var slot = 12;
		$gameMap.spawnEvent(192, x, y, true);
		var eventId = $gameMap.getLastSpawnEventId();
		$gameVariables.value(292)[slot] = eventId;
		var event = $gameMap.event($gameVariables.value(292)[slot]);
		event._priorityType = 2;
		valueBossCharaGura = [$gameVariables.value(292)[slot], imageName, cgWidth, cgHeight, animScale];
		boss_charaGuraCGSet(valueBossCharaGura);
		event.requestAnimation(animId);
	};
	
	// Replaces (6x): rebuild both the main and the sub NPC from the scene preset
	// held in variable 163, then wipe the screen.
	CEH_respawnSubNpcFromScenePreset = function (interp) {
		var mainSlot = $gameVariables.value(530);
		var preset = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(mainSlot, preset[3], preset[4], 1);
		var event = $gameMap.event($gameVariables.value(292)[mainSlot]);
		event.setImage(preset[1], preset[2]);
		event.setDirection(preset[5]);
		interp._eventId = $gameVariables.value(292)[mainSlot];
		var subSlot = 11;
		event_respawnSetN(subSlot, preset[8], preset[9], 0, preset[6], preset[7]);
		event = $gameMap.event($gameVariables.value(292)[subSlot]);
		event.setDirection(preset[10]);
		CEH_wipeFadeOut101();
	};
	
	// Replaces (5x): the goods-drag sprite, whose ids and image names were fixed.
	AGH_showGoodsDragSprite = function () {
		valuePic1 = 55;
		valueScenePic = 'Goods_drag1_';
		$gameScreen.setPicturesAnimation(2, 10, "連番", 20);
		var picId = valuePic1 + 4;
		var imageName = valueScenePic + '05_00';
		$gameScreen.showPicture(picId, imageName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(picId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		if ($gameScreen.picture(picId)) {
			$gameScreen.picture(picId).startAnimationFrame(1, true, [1, 1, 1, 2]);
		};
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
		var end = database.length - 1;
		var pictureId = 1;
		for (var i = 1; i <= end; i++) {
			var metaValue = database[i].meta[metaKey];
			if (!metaValue) continue;
			var imageName = pathPrefix + metaValue.split(',')[fieldIndex];
			console.log(`${i}  ${imageName}`);
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
	//   $gameVariables.setValue(292, Array(21).fill(0));
	//   $gameVariables.setValue(134, `<objective text>`);
	AGH_bossVictoryAftermath = function (interp, memoItemId, objectiveText) {
		interp.sVal(530, 1);
		interp.sVal(535, memoItemId);
		valueWeatherSceneSet = 0;
		$gameVariables.setValue(292, Array(21).fill(0));
		$gameVariables.setValue(134, objectiveText);
	};

	// --------------------------------------------------------------------------
	// Opens an H scene: picture slot, scene-art prefix, memo item, record id, weather.
	// The "汎用" family also re-reads variable 530 into variable 20; the "陵辱"
	// family does not, which is why syncActorVariable is a parameter.
	// Replaces (5x) the common opening sequence.
	// --------------------------------------------------------------------------
AGH_hSceneSetup = function (interp, picId, scenePicPrefix, mainCharId, memoItemId, recordId, weatherSceneSet, syncActorVariable) {
		// The 陵辱 family never assigned valuePic1 in the original, so a null picId
		// must leave the existing value alone rather than overwrite it with null.
		if (picId != null) {
			valuePic1 = picId;
		}
		valueScenePic = scenePicPrefix;
		interp.sVal(530, mainCharId);
		interp.sVal(535, memoItemId);
		h_keikenhyouji1(521, recordId);
		valueWeatherSceneSet = weatherSceneSet;
		if (syncActorVariable) {
			$gameVariables.setValue(20, $gameVariables.value(530));
		}
	};

	// --------------------------------------------------------------------------
	// Applies the standard H-scene experience bundle: the base gain, a random
	// message, and the four h_exp channels. Only the h_exp3 gain vector differs
	// between scenes, so it is passed through as an argument array.
	// Replaces (4x).
	// --------------------------------------------------------------------------
	AGH_hSceneExperience = function (interp, exp3Args) {
		h_exp($gameVariables.value(20), valueScenePic + '99', valueScenePartnerId, false, false, false);
		interp.sVal(401, getRandomIndex(11) + 20);
		interp.sVal(506, `\\V[94]は\\V[22]とセックスした…。`);
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
		$gameSwitches.setValue(380, false);
		if ($gameParty.numItems($dataItems[itemId]) >= count) {
			$gameParty.loseItem($dataItems[itemId], count);
			interp.addPopup(["add", "text:" + popupLabel]);
		} else {
			TickerManager.show(`${$dataItems[itemId].name}が${count}枚必要です`);
			$gameSwitches.setValue(380, true);
		}
	};

	// --------------------------------------------------------------------------
	// Shows a tips popup via the shared talk common event. pictureLayout is the
	// literal [image,x,y,scaleX,scaleY,opacity] array the source built inline.
	// Replaces (2x) in the prologue-end common event.
	// --------------------------------------------------------------------------
	AGH_showTipPopup = function (interp, title, pictureLayout) {
		interp.sVal(172, 2);
		var mode = 0;
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
		$gameVariables.setValue(22, 0);
		$gameVariables.setValue(23, valueDropItemIndex);
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
			var reviveHp = Math.ceil(user.mmp * 0.3);
			user.gainHp(reviveHp);
			var reviveMpCost = Math.ceil(user.mmp * 0.3);
			user.gainMp(-reviveMpCost);
			user.startDamagePopup();
			user.clearResult();
			user.startAnimation(436, false, 0);
		} else {
			if (user.isEnemy()) {
				enemy_dropSelection(user);
			};
			if (valueCollapseAnime >= 1 && user.isEnemy()) {
				if ($gameTroop.aliveMembers().length == 0) {
					$gameTroop.members()[0].spriteOpacity(0, 120);
					pic_eraseP(0, [51, 52, 53, 54, 55, 56, 57]);
					$gameTroop.members()[0].startAnimation(valueCollapseAnime, false, 40);
				};
			};
		};
	};

	// Replaces (1x, state 38 即死): instant death, guarded so that an already
	// collapsed target is not killed twice.
	AGH_stateApplyInstantDeath = function (user, target, stateId) {
		if (!target.isStateAffected(1) && $gameParty.inBattle()) {
			state_applyCommonEffect(user, target, stateId, 260);
			var targetName = target.name();
			var stateName = $dataStates[stateId].name;
			BattleManager._logWindow.push(`addText`, `${targetName}に${stateName}が発動した！`)
			target.gainHp(-999999);
			target.addState(1);
		}
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
		};
		if (addSacredState) {
			user.addState(289);
		};
	};

	// --- Counter ladders --------------------------------------------------------

	// Replaces (1x, state 4 毒): poison stacks; the fifth application is converted
	// into state 12 猛毒 and the counter is cleared.
	AGH_stateApplyPoisonStack = function (user, target, stateId) {
		if ($gameParty.inBattle()) {
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
				};
			};
		};
	};

	// Replaces (1x, state 31 疲労操作用非表示): five-step fatigue ladder
	// 32 疲労(小) -> 37 疲労(ブラック).
	AGH_stateApplyFatigueTier = function (user, target, stateId) {
		state_applyCommonEffect(user, target, stateId, 261);
		if (target._stateCounter[stateId] >= 5) {
			target.addState(37);
			target.removeState(36);
			target.removeState(stateId);
			target.addStateCounter(stateId, +1);
		} else if (target._stateCounter[stateId] >= 4) {
			target.addState(36);
			target.removeState(35);
			target.addStateCounter(stateId, +1);
		} else if (target._stateCounter[stateId] >= 3) {
			target.addState(35);
			target.removeState(34);
			target.addStateCounter(stateId, +1);
		} else if (target._stateCounter[stateId] >= 2) {
			target.addState(34);
			target.removeState(33);
			target.addStateCounter(stateId, +1);
		} else if (target._stateCounter[stateId] >= 1) {
			target.addState(33);
			target.removeState(32);
			target.addStateCounter(stateId, +1);
		} else {
			target.setStateCounter(stateId, 1);
			target.addState(32);
		};
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
		};
	};

	// Replaces (1x, state 42 呪苛): only play the removal effect when the upgraded
	// state is still on the target.
	AGH_stateRemoveCurseTorment = function (user, target, stateId) {
		if (target.isStateAffected(stateId + 1)) {
			state_removeCommonEffect(user, target, stateId, 262);
		};
	};

	// Replaces (3x, states 44 恐怖 / 45 恐慌 / 46 狂乱): if a stronger tier of the
	// same family is already active the incoming state is not stacked but
	// escalated straight to stateId+1; otherwise it stacks up to five and then
	// escalates. higherTierCount is how many tiers above this one the family has
	// (3 / 2 / 1 for 44 / 45 / 46).
	AGH_stateApplyEscalatingTier = function (user, target, stateId, higherTierCount) {
		var higherTierIds = [];
		for (var tier = 1; tier <= higherTierCount; tier++) {
			higherTierIds.push(stateId + tier);
		}
		if (higherTierIds.some(function (id) { return target.isStateAffected(id) })) {
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
			};
		};
	};

	// Replaces (3x, states 44 恐怖 / 45 恐慌 / 46 狂乱): the escalation counterpart.
	//
	// NOTE: the condition is the *opposite* of AGH_stateRemoveCurseTorment /
	// AGH_stateRemoveStanceUpgrade - the database wrote
	//   if([higher tiers].some(...)) {} else { <removal effect> }
	// so the removal effect only plays when the state really expired rather than
	// being swallowed by an escalation. higherTierCount is 3 / 2 / 1.
	AGH_stateRemoveEscalatingTier = function (user, target, stateId, higherTierCount) {
		var higherTierIds = [];
		for (var tier = 1; tier <= higherTierCount; tier++) {
			higherTierIds.push(stateId + tier);
		}
		if (!higherTierIds.some(function (id) { return target.isStateAffected(id) })) {
			state_removeCommonEffect(user, target, stateId, 262);
		};
	};

	// Replaces (2x, states 402 超覚醒 / 403 限界超越): drops the weaker
	// abnormal-state tiers below this one and re-registers the normal-abnormal
	// class. lowerTierCount is 1 / 2 for 402 / 403.
	AGH_stateApplyAwakeningTier = function (user, target, stateId, lowerTierCount) {
		for (var tier = 1; tier <= lowerTierCount; tier++) {
			if (target.isStateAffected(stateId - tier)) {
				target.removeState(stateId - tier);
			};
		};
		abNomal_Clear(target, target, stateId, 2);
	};

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
		if (target._stateCounter[stateId][0] >= 0) {
			if (target._stateCounter[stateId][0] >= 1) {
				for (var i = 0; i < $gameParty.battleMembers().length; i++) {
					var actor = $gameParty.battleMembers()[i];
					actor.addState(663);
					actor.setStateCounter(stateId, target._stateCounter[stateId][0]);
				};
			};
			if (target._stateCounter[stateId][1] >= 1) {
				for (var i = 0; i < $gameParty.battleMembers().length; i++) {
					var actor = $gameParty.battleMembers()[i];
					actor.addState(664);
					actor.setStateCounter(stateId, target._stateCounter[stateId][1]);
				};
			};
			if (target._stateCounter[stateId][2] >= 1) {
				for (var i = 0; i < $gameTroop.members().length; i++) {
					var enemy = $gameTroop.members()[i];
					enemy.addState(665);
					enemy.setStateCounter(stateId, target._stateCounter[stateId][2]);
				};
			};
			if (target._stateCounter[stateId][3] >= 1) {
				for (var i = 0; i < $gameParty.battleMembers().length; i++) {
					var actor = $gameParty.battleMembers()[i];
					actor.addState(666);
					actor.setStateCounter(stateId, target._stateCounter[stateId][3]);
				};
			};
			target.removeState(stateId);
			target.removeStateCounter(stateId);
			target.addCooldown(217, +5);
		} else {
			target.setStateCounter(stateId, [0, 0, 0, 0]);
		};
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
		var masteryMultiplier = 1 + (user.skillMasteryLevel(307) / 100 * 2);
		if (masteryMultiplier == 0) { masteryMultiplier = 1 };
		var statBonus = Math.round(user.mat / 100 * 20 * masteryMultiplier);
		user.setStateCounter(stateId, statBonus);
		user.addAtk(statBonus);
		user.addDef(statBonus);
		user.addMdf(statBonus);
		user.addAgi(statBonus);
		user.addLuk(statBonus);
		var popupText = `Atk/Def/Dex/Agi/Luk20%up!`;
		target.startMessagePopup(popupText, [255, 0, 0, 255, 0, 256]);
		state_applyCommonEffect(user, target, stateId, 271);
	};

	// Replaces (1x, state 157 魔装): gives the stored bonus back.
	AGH_stateRemoveMagicArmor = function (user, target, stateId) {
		if (user.getStateCounter(stateId) >= 1) {
			var statBonus = user.getStateCounter(stateId);
			user.minusAtk(statBonus);
			user.minusDef(statBonus);
			user.minusMdf(statBonus);
			user.minusAgi(statBonus);
			user.minusLuk(statBonus);
			var popupText = `Atk/Def/Dex/Agi/Luk20%Down…`;
			target.startMessagePopup(popupText, [255, 0, 187, 189, 0, 256]);
		};
		user.removeStateCounter(stateId);
		state_removeCommonEffect(user, target, stateId, 272);
	};

	// Replaces (1x, state 895 デストロイ・フォーム): converts the unit's current DEF
	// into ATK and remembers how much was moved.
	AGH_stateApplyDestroyForm = function (user, target, stateId) {
		var convertedDef = user.def;
		user.setStateCounter(stateId, convertedDef);
		user.addAtk(convertedDef);
		user.minusDef(convertedDef);
		state_applyCommonEffect(user, target, stateId, 274);
	};

	// Replaces (1x, state 895 デストロイ・フォーム): moves the DEF back.
	AGH_stateRemoveDestroyForm = function (user, target, stateId) {
		if (user.getStateCounter(stateId) >= 1) {
			var convertedDef = user.getStateCounter(stateId);
			user.minusAtk(convertedDef);
			user.addDef(convertedDef);
		};
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
		var accumulatedDamage = user.getStateCounter(stateId);
		if (user.isAlive()) {
			user.gainHp(-accumulatedDamage);
			if (user.isDead()) user.performCollapse();
		}
		var userName = user.name();
		var stateName = $dataStates[stateId].name;
		var damage = `\\C[10]${accumulatedDamage}\\C[0]`;
		var logText = `${userName}の${stateName}が解除！ 蓄積ダメージ${damage}を受けた…`;
		BattleManager._logWindow.push(`addText`, logText);
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
	AGH_stateApplyTwoKingsFeud = function (user, target, stateId) {
		state_applyCommonEffect(user, target, stateId, 271);
		if (user.isAlive()) {
			var abnormalStateCount = 0;
			for (var i = 1; i <= $dataStates.length - 1; i++) {
				if ($dataStates[i].meta['StateabNomal'] || $dataStates[i].meta['StateSPabNomal'] || $dataStates[i].meta['StateUnique']) {
					if (user.isStateAffected(i)) {
						abnormalStateCount += 1;
					}
				}
			};
			if (abnormalStateCount >= 1) {
				for (var i = 1; i <= abnormalStateCount; i++) {
					if (user.isAlive()) {
						user.gainHp(-abnormalStateCount);
						user.startDamagePopup();
						user.clearResult();
					} else {
						break;
					};
				};
			};
			user.removeState(stateId);
		};
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
		var buffParamId = [2, 3, 4, 5, 6, 7][getRandomIndex(6)]
		var buffTurns = getRandomIndex(3) + 3;
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
		var debuffStateId = [212, 213, 214, 215, 216, 217][getRandomIndex(6)]
		var unusedTurnsDraw = getRandomIndex(3) + 3; //RNG stream position
		target.addState(debuffStateId);
		state_applyCommonEffect(user, target, stateId, 277);
		target.removeState(stateId);
	};

	// Replaces (1x, state 320 属性弱体): on a 6-in-11 roll, applies the
	// resistance-down state matching the attacker's own element tag, then removes
	// the marker. No element tag means no effect.
	AGH_stateApplyElementBreak = function (user, target, stateId) {
		if (target.isAlive()) {
			var weaknessStateId = 0;
			var elementRoll = getRandomIndex(11);
			if (elementRoll >= 6) {
				if (user.isStateAffected(51)) { weaknessStateId = 311 };
				if (user.isStateAffected(52)) { weaknessStateId = 312 };
				if (user.isStateAffected(53)) { weaknessStateId = 313 };
				if (user.isStateAffected(54)) { weaknessStateId = 314 };
				if (user.isStateAffected(55) || user.isStateAffected(58)) { weaknessStateId = 315 };
				if (user.isStateAffected(56) || user.isStateAffected(59)) { weaknessStateId = 316 };
				if (user.isStateAffected(49)) { weaknessStateId = 318 };
				if (user.isStateAffected(50)) { weaknessStateId = 319 };
				if (weaknessStateId >= 1) {
					state_addFormula1([weaknessStateId, 50, user, target, user.mdf, target.luk]);
				};
			};
		};
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
		if (user.isEnemy()) {
			user.removeState(stateId);
			user.addState(addStateId);
		};
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
		for (var up = 1; up <= 3 - tier; up++) {
			if (user.isStateAffected(stateId + 6 * up)) {
				user.removeState(stateId);
				break;
			};
		};
		for (var down = 1; down <= tier; down++) {
			if (user.isStateAffected(stateId - 6 * down)) {
				user.removeState(stateId - 6 * down);
			};
		};
		if (tier >= 3 || user.isStateAffected(stateId)) {
			state_applyCommonEffect(user, target, stateId, animationId);
		};
	};

	// Replaces (6x, states 539-544 无の加護 family): the same idea as
	// AGH_stateApplyElementGuard but the rungs are one state id apart and the
	// upgrade / downgrade sets are not symmetric in the database, so both are
	// passed in explicitly as offsets from stateId.
	//
	// effectFirst is set for 544 无の加護(神撃) only, which played the add effect
	// before clearing the weaker tiers instead of after.
	AGH_stateApplyNullGuard = function (user, target, stateId, upgradeOffsets, downgradeOffsets, animationId, effectFirst) {
		if (effectFirst) {
			state_applyCommonEffect(user, target, stateId, animationId);
		};
		for (var up = 0; up < upgradeOffsets.length; up++) {
			if (user.isStateAffected(stateId + upgradeOffsets[up])) {
				user.removeState(stateId);
				break;
			};
		};
		for (var down = 0; down < downgradeOffsets.length; down++) {
			if (user.isStateAffected(stateId - downgradeOffsets[down])) {
				user.removeState(stateId - downgradeOffsets[down]);
			};
		};
		if (!effectFirst && user.isStateAffected(stateId)) {
			state_applyCommonEffect(user, target, stateId, animationId);
		};
	};

	// --- Stance upgrades --------------------------------------------------------

	// Replaces (2x, states 802 フォーカス / 822 ソング・オブ・グランデ): when the unit
	// knows the listed skill the stance escalates to stateId+1 instead of
	// lingering. skillId is 320 / 350 for 802 / 822.
	AGH_stateApplyStanceUpgrade = function (user, target, stateId, skillId) {
		state_applyCommonEffect(user, target, stateId, 271);
		if (user.battleSkillsRaw().contains(skillId)) {
			user.addState(stateId + 1);
			user.removeState(stateId);
		};
	};

	// Replaces (2x, states 802 フォーカス / 822 ソング・オブ・グランデ): only play the
	// removal effect while the escalated state is still active.
	AGH_stateRemoveStanceUpgrade = function (user, target, stateId) {
		if (!!user.isStateAffected(stateId + 1)) {
			state_removeCommonEffect(user, target, stateId, 272);
		};
	};

	// --- Misc single-state effects ----------------------------------------------

	// Replaces (3x, states 151 果たし合い / 154 青眼の構え / 155 ファルサス・ガード):
	// the guard counter starts at zero.
	AGH_stateApplyResetCounter = function (user, target, stateId) {
		user.setStateCounter(stateId, 0);
	};

	// Replaces (1x, state 64 放心): recovery log line plus the opacity restore.
	AGH_stateRemoveRelief = function (user, target, stateId) {
		var targetName = target.name();
		BattleManager._logWindow.push(`addText`, `${targetName}は立ち直った！`)
		target.spriteOpacity(255, 20);
	};

	// Replaces (1x, state 172 鴉雀無声): weapon-type driven follow-up states, and
	// the state always removes itself.
	AGH_stateApplyCrowSilence = function (user, target, stateId) {
		if (user.isWtypeEquipped(3)) {
			user.addState(173);
		};
		if (user.isWtypeEquipped(9)) {
			user.addState(174);
			user.gainTp(-30);
			user.startMessagePopup('TP-30%', [255, 0, 0, 255], 0, 256);
		};
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
		var braveSoulStacks = Math.round(user.hpRate() * 10);
		if (braveSoulStacks <= 1) { braveSoulStacks = 1 };
		for (var i = 1; i <= braveSoulStacks; i++) {
			user.addState(201);
		};
		user.removeState(stateId);
	};

	// Replaces (1x, state 186 トレジャーハント): stacks a counter while in battle.
	//
	// NOTE: the database guard read `>= 1 || <= 9`, which is true for every
	// number, so the reset branch was unreachable. Kept as-is: the observable
	// behaviour (the counter always increments) is the same either way.
	AGH_stateApplyTreasureHunt = function (user, target, stateId) {
		if ($gameParty.inBattle()) {
			state_applyCommonEffect(user, target, stateId, 261);
			if (target._stateCounter[stateId] >= 1 || target._stateCounter[stateId] <= 9) {
				target.addStateCounter(stateId, +1);
			} else {
				target.setStateCounter(stateId, 1);
			};
		};
	};

	// Replaces (1x, state 194 トレマーラウンド): applies the two tremolo states to
	// every battle member, then drops this state.
	//
	// NOTE: `actor` is declared with `var` inside the loop, so after the loop it
	// still points at the *last* battle member and only that member loses the
	// state. Preserved on purpose; hoisting the declaration would change which
	// battler is affected.
	AGH_stateApplyTremaRound = function (user, target, stateId) {
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			var actor = $gameParty.battleMembers()[i];
			actor.addState(206);
			actor.addState(207);
		};
		actor.removeState(stateId);
	};

	// Replaces (2x, states 266 連撃ボーナス / 267 三連撃ボーナス): battle-log banner.
	AGH_stateApplyStrikeBonus = function (user, target, stateId, logText) {
		BattleManager._logWindow.push(`addText`, logText)
	};

	// Replaces (1x, state 292 浄眼): re-runs the boss action pattern when the lead
	// troop member is a boss individual and can still act.
	AGH_stateApplyPureEye = function (user, target, stateId) {
		var leadEnemy = $gameTroop.members()[0];
		if (leadEnemy.isStateAffected(410) &&
			leadEnemy.isAlive() &&
			!leadEnemy.isRestricted()) {
			$gameSwitches.setValue(470, true);
			boss_actionPattarn1(leadEnemy);
			$gameSwitches.setValue(470, false);
		};
	};

	// Replaces (5x, states 321/323/324/898/905 delay family): grants the delay TP
	// gain declared in the notetag, then removes the state.
	AGH_stateApplyDelay = function (user, target, stateId) {
		state_applyCommonEffect(user, target, stateId, 277);
		target.gainTp(Number($dataStates[stateId].meta['TPGain1']));
		target.removeState(stateId);
	};

	// Replaces (1x, state 417 モードゲージ減少): drains 20 points of the party limit
	// gauge while break mode is up, then removes the marker.
	AGH_stateApplyModeGaugeDown = function (user, target, stateId) {
		if (target.isStateAffected(stateId - 2)) {
			var targetName = target.name();
			BattleManager._logWindow.push(`addText`, `${targetName}の\\C[10]モードゲージ\\C[0]が20減少した！`)
			state_applyCommonEffect(user, target, stateId, 261);
			$gameTroop.losePartyLimitGauge(20);
		}
		target.removeState(stateId);
	};

	// Replaces (1x, state 418 ブレイクモード維持): resets the turn counter of the
	// break-mode state instead of letting it expire, then removes the marker.
	AGH_stateApplyBreakModeKeep = function (user, target, stateId) {
		if (target.isStateAffected(stateId - 2)) {
			var targetName = target.name();
			var stateName = `\\C[1]＜${$dataStates[stateId - 2].name}＞\\C[0]`;
			BattleManager._logWindow.push(`addText`, `${targetName}の${stateName}のターンが初期化された！`)
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
		var targetName = target.name();
		var stateName = `\\sim[427]`;
		BattleManager._logWindow.push(`addText`, `${targetName}は${stateName}を始めた！`);
		var pleaStateIds = [421, 436];
		pleaStateIds.forEach(function (id) {
			if (target.isStateAffected(id)) {
				var pleaLines = $dataStates[stateId].meta['inotigoi' + id].split(',');
				var pleaLine = pleaLines[getRandomIndex(pleaLines.length)];
				BattleManager._logWindow.push(`addText`, pleaLine);
			};
		}, this);
	};

	// Replaces (1x, state 551 エネミー変身): re-skins the enemy from the
	// valueWordSet9 preset (battler name, hue, move distance).
	AGH_stateApplyEnemyTransform = function (user, target, stateId) {
		var presetParts = $dataEnemies[user._enemyId].meta[valueWordSet9].split(',');
		var moveDistance = Number(presetParts[3]);
		$gameTroop.move(user.index() + 1, 0, moveDistance, 40);
		$dataEnemies[user._enemyId].battlerName = presetParts[1];
		$dataEnemies[user._enemyId].battlerHue = presetParts[2];
	};

	// Replaces (3x, states 594 Thrust / 595 Swing / 596 Missile): plays the
	// equipped weapon's animation with the matching battler frame for one motion
	// type. motionType is 'Thrust' / 'Swing' / 'Missile'.
	//
	// NOTE: the original also read meta['MotionType'] into a local that was never
	// used; the read had no side effect, so it is not carried over.
	AGH_stateApplyWeaponMotion = function (user, target, stateId, motionType) {
		var weaponData = $dataWeapons[$gameActors.actor(user.actorId()).equips()[0].id];
		var weaponNumber = Number(weaponData.meta['WeaponNumber']);
		user.battler().setFrame(motionType, 2);
		user.startWeaponAnimation(weaponNumber);
	};

	// Replaces (1x, state 771 被虐体質): resets a non-negative counter.
	AGH_stateApplyMasochism = function (user, target, stateId) {
		if (target._stateCounter[stateId] >= 0) {
			target.setStateCounter(stateId, 0);
		};
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
		var missingHpRate = 1 - user.hpRate();
		var elementScaledRate = missingHpRate * user.elementRate(elementId);
		var counterRate = Math.round(elementScaledRate * 100 / 2);
		user.setStateCounter(stateId, counterRate / 100);
	};

	// --- Turn End ---------------------------------------------------------------

	// Replaces (1x, state 94): the last surviving party member collapses, otherwise
	// the battler taunts and fades out.
	AGH_stateTurnEndFleeOrTaunt = function (user, target, stateId) {
		if ($gameParty.aliveMembers().length === 1) {
			user.addState(1);
		} else {
			var userName = `\\C[16]${user.name()}\\C[0]`;
			BattleManager._logWindow.push(`addText`, `${userName}「は、早く倒してしまえっ！」`);
			user.spriteOpacity(0, 30);
		}
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
			var accumulatedDamage = target._stateCounter[stateId];
			if (accumulatedDamage >= 1) {
				var troopMembers = $gameTroop.members();
				var troopCount = troopMembers.length;
				if (troopCount >= 1) {
					var targetName = target.name();
					var stateName = `\\SIM[${stateId}]`;
					BattleManager._logWindow.push(`addText`, `${targetName}の${stateName}が発動！`);
					user.startAnimation(509, true, 0);
					for (var i = 0; i < troopCount; i++) {
						troopMembers[i].startAnimation(132, true, 10);
						var damagePerMember = Math.round(accumulatedDamage * 2 / troopCount);
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
		var seedStateId = [4, 5, 6, 7, 8, 9, 10, 11][getRandomIndex(8)];
		var unitMembers = target.friendsUnit().aliveMembers();
		unitMembers.forEach(function (member) {
			member.addState(seedStateId);
		});
		target.removeState(stateId);
		if (ConfigManager.battleAniSpeed >= 3) {
			var animationDelay = $gameVariables.value(279);
			unitMembers.forEach(function (member) {
				member.startAnimation(277, false, animationDelay);
			});
			$gameVariables.setValue(279, animationDelay + $gameVariables.value(280));
		}
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
		if (user.hpRate() === 1.00 || user.mpRate() < drainRate) return;
		var drain = Math.round(user.mmp * drainRate);
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
		var targetName = target.name();
		var stateName = `\\sim[${simStateId}]`;
		BattleManager._logWindow.push(`addText`, `${targetName}は${stateName}をしている…。`);
		watchedStateIds.forEach(function (id) {
			if (!target.isStateAffected(id)) return;
			var lines = $dataStates[stateId].meta['inotigoi' + id].split(',');
			BattleManager._logWindow.push(`addText`, lines[getRandomIndex(lines.length)]);
		});
	};

	// Replaces (1x, state 600): reports the damage taken during the turn and then
	// re-requests the equipped weapon's motion so the actor keeps animating.
	AGH_stateTurnEndReportCounterDamageAndMotion = function (user, target, stateId) {
		if (!user.isAlive()) return;
		var counterDamage = target._stateCounter[stateId];
		if (counterDamage >= 1) {
			var targetName = target.name();
			var damage = `\\C[10]${counterDamage}\\C[0]`;
			BattleManager._logWindow.push(`addText`, `${targetName}はターン中に${damage}のダメージを受けた！`);
			target.setStateCounter(stateId, 0);
		}
		var actor = $gameActors.actor(user.actorId());
		var weapon = actor.equips()[0];
		if (!$dataSystem.optSideView || user.isStateAffected(1) || user.isStateAffected(64) || !weapon) return;
		var weaponData = $dataWeapons[weapon.id];
		if (!weaponData.meta['WeaponNumber'] || !weaponData.meta['MotionType']) return;
		var weaponNumber = Number(weaponData.meta['WeaponNumber']);
		var motionType = Number(weaponData.meta['MotionType']);
		var motionName = '';
		if (motionType === 0) motionName = 'thrust';
		else if (motionType === 1) motionName = 'swing';
		else if (motionType === 2) motionName = 'missile';
		user.requestMotion(motionName);
		user.startWeaponAnimation(weaponNumber);
	};

	// Replaces (1x, state 610): reports the damage taken during the turn together
	// with the battler's current TP percentage.
	AGH_stateTurnEndReportCounterDamageTp = function (user, target, stateId) {
		if (!user.isAlive()) return;
		var counterDamage = target._stateCounter[stateId];
		var targetName = target.name();
		var tpValue = `\\C[6]` + target.tp + `\\C[0]`;
		if (counterDamage >= 1) {
			var damage = `\\C[10]` + counterDamage + `\\C[0]`;
			BattleManager._logWindow.push(`addText`, `${targetName}のTP${tpValue}% ターン中に${damage}のダメージを受けた！`);
			target.setStateCounter(stateId, 0);
		} else {
			BattleManager._logWindow.push(`addText`, `${targetName}のTP${tpValue}%`);
		}
	};

	// --- Action Start -----------------------------------------------------------

	// Replaces (1x, state 157): charges the state's <TurnCost> against MP, or drops
	// the state when the battler cannot pay.
	AGH_stateActionStartPayTurnCostMp = function (user, target, stateId) {
		var turnCost = Number($dataStates[stateId].meta['TurnCost']);
		if (user.mp >= turnCost) {
			user.gainMp(-turnCost);
		} else {
			user.removeState(stateId);
		}
	};

	// Replaces (1x, state 895): the HP-paying twin of the above.
	AGH_stateActionStartPayTurnCostHp = function (user, target, stateId) {
		var turnCost = Number($dataStates[stateId].meta['TurnCost']);
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
		var action = BattleManager._action;
		var unit = action.isForOpponent() ? action.opponentsUnit() : action.friendsUnit();
		var lastTarget = unit.members()[BattleManager._subject._lastTargetIndex];
		if (!lastTarget.isStateAffected(610)) return;
		var targetMarker = 'E' + (BattleManager._subject._lastTargetIndex + 1);
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
		if (target._stateCounter[stateId] >= 4) {
			user.removeStateCounter(stateId);
			user.removeState(stateId);
			if (user._stateCounter[stateId] >= 1) {
				user.addStateCounter(stateId, +1);
			} else {
				user.setStateCounter(stateId, 1);
			}
		}
	};

	// --- Battle -----------------------------------------------------------------

	// Replaces (1x, state 94): the "runs away" battle start.
	AGH_stateBattleFlee = function (user, target, stateId) {
		var userName = `\\C[16]${user.name()}\\C[0]`;
		BattleManager._logWindow.push(`addText`, `${userName}「ヒィィ～～っ！」`);
		BattleManager._logWindow.push(`addText`, `${userName}は逃げ出した！`);
		AudioManager.playSe({ "name": 'Z_FootRun', "volume": 90, "pitch": 150, "pan": 0 });
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
		var weapon = user.equips()[0];
		if (!weapon) return;
		var weaponData = $dataWeapons[weapon.id];
		if (!weaponData.meta['WeaponNumber'] || !weaponData.meta['MotionType']) return;
		var motionType = Number(weaponData.meta['MotionType']);
		if (motionType === 0) user.addState(594);
		if (motionType === 1) user.addState(595);
		if (motionType === 2) user.addState(596);
	};

	// Replaces (1x, state 610): rolls the starting TP, shows it as a popup, applies
	// the per-index state and seeds the enemy battle AI.
	AGH_stateBattleInitTpGauge = function (user, target, stateId) {
		user.setStateCounter(stateId, 0);
		user.gainTp(getRandomIndex(31) + 20);
		target.startMessagePopup('TP:' + user.tp, [255, 128, 0, 255, 256]);
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
			value = Math.round(value - (value / 5));
			user.removeState(stateId);
		}
		return value;
	};

	// Replaces (1x, state 410): converts incoming damage into party limit gauge
	// movement and swaps between the 415 "gauge up" and 416 "broken" states.
	AGH_stateReactPartyLimitGauge = function (action, user, target, stateId, value) {
		if (!action.isHpEffect() || value <= 0 || !target.isAlive()) return value;
		if (target.isStateAffected(407)) {
			if (target.isStateAffected(415)) {
				$gameTroop.losePartyLimitGauge(5);
			} else {
				$gameTroop.gainPartyLimitGauge(5);
			}
		}
		if (target.isStateAffected(408)) {
			if (target.isStateAffected(415)) {
				$gameTroop.gainPartyLimitGauge(5);
			} else {
				$gameTroop.losePartyLimitGauge(5);
			}
		}
		var targetName = target.name();
		if (target.isStateAffected(415)) {
			var gaugeLoss = Math.floor(20 * value / target.mhp).clamp(15, 50);
			$gameTroop.losePartyLimitGauge(gaugeLoss);
			if ($gameTroop.partyLimitGauge() <= 0) {
				target.removeState(415);
				target.addState(416);
				var stateName = $dataStates[416].name;
				BattleManager._logWindow.push(`addText`, `${targetName}が${stateName}になった！`);
				state_applyCommonEffect(user, target, 416, 251);
			}
		}
		if (target.isStateAffected(416)) {
			$gameTroop.setPartyLimitGauge(0);
		}
		if ($gameTroop.partyLimitGaugeCurrent() >= 1) {
			target.addState(415);
			var stateName = $dataStates[415].name;
			BattleManager._logWindow.push(`addText`, `${targetName}が${stateName}になった！`);
			state_applyCommonEffect(user, target, 415, 252);
		}
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
		damage_keisan1(user, target, action.isHpEffect(), value, formulaType, 0, $gameVariables.value(93), stateId);
		return value;
	};

	// Replaces (1x, state 771): on taking HP damage, plays the victory motion and
	// stacks a counter that grows with the actor's variable block.
	AGH_stateReactAddCounterOnHit = function (action, user, target, stateId, value) {
		if (!action.isHpEffect() || value <= 0) return value;
		target.requestMotion('Victory');
		AudioManager.playSe({ "name": 'ZH_Knead1', "volume": 50, "pitch": 120, "pan": 0 });
		var counter = getRandomIndex(10) + 1;
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
				var leadActor = $gameParty.battleMembers()[0];
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
	AGH_stateRespondReserveCommonEventOnState = function (user, target, stateId, value, guardStateId, commonEventId) {
		if (target.isStateAffected(guardStateId)) {
			$gameVariables.setValue(20, target.actorId());
			$gameTemp.reserveCommonEvent(commonEventId);
		}
		return value;
	};

	// Replaces (1x, state 610): the enemy-side damage formula, the kill tally and
	// the per-species collapse animation.
	AGH_stateRespondEnemyDamageFormula = function (action, user, target, stateId, value) {
		damage_keisan1(user, target, action.isHpEffect(), value, 120, 0, $gameVariables.value(93), stateId);
		if (target.hp <= 0 && $gameVariables.value(240) >= 1) {
			$gameVariables.value(258)[$gameVariables.value(240)] += 1;
		}
		if (!target.isAlive() && valueCollapseAnime == 0) {
			var collapseAnimationId = 598;
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
		var weaponId = user._equips[0]._itemId;
		var shouldBreak = false;
		if (weaponId == 71 || weaponId == 72) {
			shouldBreak = !!target.result().critical;
		}
		if (weaponId == 73) {
			shouldBreak = !target.result().critical;
		}
		if (shouldBreak) {
			user.changeEquipById(1, 0);
			$gameParty.loseItem($dataWeapons[weaponId], 1);
			AudioManager.playSe({ "name": "壊れた音", "volume": 100, "pitch": 110, "pan": 50 });
		}
		return value;
	};

	// Replaces (1x, state 599): runs the shared attack formula and accumulates the
	// damage dealt into the actor's block of variable 293.
	AGH_stateConfirmTrackDamage = function (action, user, target, stateId, value) {
		attack_DamageFormula(user, target, $gameVariables.value(96));
		if (action.isHpEffect() && value > 0) {
			$gameVariables.value(293)[user.actorId() + 10] += value;
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
		var formulaSkillId = 0;
		for (var i = 0; i < stateSkillGroups.length; i++) {
			var group = stateSkillGroups[i];
			var matched = false;
			for (var j = 0; j < group[0].length; j++) {
				if (user.isStateAffected(group[0][j])) {
					matched = true;
					break;
				}
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
		var formulaSkillId = formulaSkillIds[getRandomIndex(formulaSkillIds.length)];
		state_addFormula1([formulaSkillId, 50, user, target, user.mdf, target.luk]);
	};

	// Replaces (1x, state 405): the same, gated on an at-least-`threshold` roll.
	AGH_stateConcludeRandomFormulaChance = function (user, target, stateId, threshold, formulaSkillIds) {
		if (!target.isAlive() || !target.isActor()) return;
		if (getRandomIndex(11) < threshold) return;
		var formulaSkillId = formulaSkillIds[getRandomIndex(formulaSkillIds.length)];
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
	AGH_stateDeselectKeepMark = function (user, target, stateId) {
	};

	// Replaces (1x, state 184): on the qualifying battle modes, upgrades the state
	// when its prerequisite is present and grants state 201 for the named skills.
	AGH_stateInitiateTierUp = function (user, target, stateId) {
		var battleMode = $gameVariables.value(182);
		if (battleMode != 2 && battleMode != 12) return;
		if (user.isStateAffected(181)) {
			user.addState(stateId + 1);
		}
		var currentSkillId = $gameVariables.value(96);
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
		var rate = user.elementRate(elementId);
		return rate >= minRate && rate <= maxRate;
	};

	// Replaces (2x, states 501 / 502): a cell of a two-dimensional game variable
	// must have reached minValue.
	AGH_statePassiveConditionVariableCellAtLeast = function (user, variableId, rowIndex, columnIndex, minValue) {
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
		var state = $dataStates[stateId];
		var result = { value: 0, variance: state.dotVariance, element: state.dotElement };
		if (origin.hpRate() !== 1.00 && origin.mpRate() >= mpThreshold) {
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
		return Math.round(user.hp / divisor * multiplier);
	};

	// Replaces (34x, skills 600-633): enemies pay tpSurcharge more TP.
	AGH_skillTpCostEnemySurcharge = function (user, item, cost, tpSurcharge) {
		if (user.isEnemy()) cost += tpSurcharge;
		return cost;
	};

	// Replaces (1x, skill 90): writes each [variableId, value] pair.
	AGH_skillExecutionSetVariables = function (user, item, pairs) {
		for (var i = 0; i < pairs.length; i++) {
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
		var aliveFoes = foes.aliveMembers();
		for (var i = 0; i < aliveFoes.length; ++i) {
			var member = aliveFoes[i];
			if (member.level % 3 === 0) targets.push(member);
		}
	};

	// Replaces (2x, skill 369 五神の慈しみ / item 99 ラスト・エリクサー): the whole
	// party.
	// BUGFIX: both originals pushed into `target` - a single Game_Battler, which
	// has no push() - instead of `targets`. makeEvalTargets threw, YEP's
	// try/catch swallowed it and the skill/item silently targeted nothing at all.
	AGH_targetEvalAllPartyBattleMembers = function (targets) {
		var members = $gameParty.battleMembers();
		for (var i = 0; i < members.length; ++i) {
			targets.push(members[i]);
		}
	};

	// Replaces (1x, skill 949 五神の慈しみ): the whole troop.
	// BUGFIX: same `target` -> `targets` mistake as the party version above.
	AGH_targetEvalAllTroopMembers = function (targets) {
		var members = $gameTroop.members();
		for (var i = 0; i < members.length; ++i) {
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
	AGH_classBaseParamActorStatas = function (user, level, statas, statIndex) {
		var base = statas[statIndex];
		var classRank = Number($dataClasses[user._classId].meta['classRank']);
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
		for (var i = 0; i < skillIds.length; i++) {
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
		if (reqMastery
				&& user.skillMasteryLevel(reqSkillId) < Number($dataSkills[reqSkillId].meta['Max Mastery Level'])) {
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
		return user.skillMasteryLevel(skillId) >= Number($dataSkills[skillId].meta['Max Mastery Level']);
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
		return user.isLearnedSkill(skillId)
			&& user.skillMasteryLevel(skillId) >= minMastery
			&& user.isLearnedSkill(otherSkillId);
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
		var item = action.item();
		var stateId = item.id - 400;
		if (target.isStateAffected(stateId)) {
			TickerManager.show(target.name() + 'の通常攻撃は' + item.name + 'です');
			return;
		}
		for (var i = 101; i <= 200; i++) target.removeState(i);
		target.addState(stateId);
		TickerManager.show(target.name() + 'の通常攻撃を' + item.name + 'に変更しました');
	};

	// Replaces (1x, skill 26 持ち上げ＜OFF＞): flips the pickup flag and the
	// skill's own name between ＜ON＞ and ＜OFF＞.
	AGH_damageFormulaTogglePickup = function (action, user, target) {
		if (target.actorId() !== user.actorId()) return;
		var item = action.item();
		if (item.name === `持ち上げ＜ON＞`) {
			$gameSystem._pickupData[0] = false;
			item.name = '持ち上げ＜OFF＞';
		} else {
			$gameSystem._pickupData[0] = true;
			item.name = '持ち上げ＜ON＞';
		}
		TickerManager.show(`<\x1bSIN[${item.id}]>に変更しました`);
	};

	// Replaces (1x, skill 35 マップステータス).
	AGH_damageFormulaSelectMapStatus = function (action, user, target) {
		if (target.actorId() !== user.actorId()) return;
		var item = action.item();
		skill_sentaku(item.id, 0);
		TickerManager.show('＜' + item.name + '＞に変更しました');
		info_SetY($gameVariables.value(200));
	};

	// Replaces (1x, skill 42 視点変更): moves the map viewpoint state (601)
	// from the actor currently in variable 11 to the caster.
	AGH_damageFormulaChangeViewpoint = function (user, target) {
		if (target.actorId() !== user.actorId()) return;
		var currentViewpointActorId = $gameVariables.value(11);
		if (user.actorId() === currentViewpointActorId) {
			TickerManager.show(`現在の視点は${user.name()}の為、変更はありません。`);
			return;
		}
		$gameSwitches.setValue(151, true);
		$gameActors.actor(currentViewpointActorId).removeState(601);
		$gameVariables.setValue(11, user.actorId());
		$gameActors.actor($gameVariables.value(11)).addState(601);
		TickerManager.show(`現在の視点を${user.name()}に変更しました。`);
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
		var nudeFlags = $gameVariables.value(440 + target.actorId());
		if (nudeFlags[23] === 1) {
			nudeFlags[23] = 0;
			TickerManager.show(`${target.name()}は着衣になりました。`);
		} else {
			nudeFlags[23] = 1;
			TickerManager.show(`${target.name()}は全裸になりました。`);
		}
		$gameVariables.setValue(20, target.actorId());
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
		var counter = user.getStateCounter(stanceStateId);
		if (counter === 0) {
			BattleManager._logWindow.push(`addText`,
				target.name() + 'の' + $dataSkills[sourceSkillId].name + 'は不発に終わった…。');
			return 0;
		}
		return counter * user.skillMasteryLevel(sourceSkillId) - target * 2;
	};

	// Replaces (1x, skill 373 ルビフリップ): in battle this is the damage
	// formula; outside battle it steps the 消費額 variable (268) through
	// 1000 -> 10000 -> 100000 -> 1000000 -> 10000000 -> 1000 and reports it.
	AGH_damageFormulaRubyFlip = function (action, user, target) {
		var item = action.item();
		if ($gameParty.inBattle()) {
			var parts = String($dataSkills[item.id].meta['DamageFormula2']).split(',');
			return Math.max(
				$attack1(Number(parts[0]), user, target, Number(parts[1])) * Number(parts[2]),
				user.mdf / 10);
		}
		var nextCost = {
			10000000: 1000,
			1000000: 10000000,
			100000: 1000000,
			10000: 100000,
			1000: 10000
		}[$gameVariables.value(268)];
		if (nextCost !== undefined) $gameVariables.setValue(268, nextCost);
		TickerManager.show(`\x1bSIN[${item.id}]の消費額が\\C[10]${$gameVariables.value(268).toLocaleString()}\\C[0]に変更されました。`);
		return 0;
	};

	// Replaces (1x, skill 686 完全支配).
	//
	// BUGFIX: the database had `b.isLearnedSkill(687);` - a query whose result
	// was thrown away, so the target was never actually granted skill 687 even
	// though the message says it was (「…は[絶対服従]を付与された！」).
	AGH_damageFormulaDominate = function (target) {
		if ($dataActors[target.actorId()].meta['Mcharacter']) {
			target.learnSkill(687);
			TickerManager.show(`\\C[27]${target.name()}\\C[0]は\x1bSIN[687]を付与された！`);
		} else {
			TickerManager.show(`\\C[2]${target.name()}\\C[0]には効果が無かった…。`);
		}
	};

	// Replaces (1x, skill 787 隠形): toggles the map stealth mode.
	AGH_damageFormulaToggleStealth = function (user, target) {
		if (target.actorId() !== user.actorId()) return;
		if ($gameSwitches.value(202)) {
			TickerManager.show(`このマップでは使用できません。`);
			return;
		}
		if (!$gamePlayer.isStealthMode()) {
			$gamePlayer.setStealthTimer(10800);
			TickerManager.show(`＜ステルス・モード＞がオンになりました。`);
		} else {
			$gamePlayer.setStealthMode(false);
			TickerManager.show(`＜ステルス・モード＞がオフになりました。`);
		}
	};

	// Replaces (1x, skill 788 看破): unlocks the enemy status view.
	AGH_damageFormulaRevealStatus = function (target) {
		$gameVariables.setValue(92, target.index());
		if (!$gameSwitches.value(95)) {
			$gameSwitches.setValue(95, true);
			time_settei();
			BattleManager._logWindow.push(`addText`, `${target.name()}達のStatus閲覧可能`);
		}
	};

	// Replaces (1x, skill 789 感知): scans every event on the map and reports
	// how many unopened treasures, symbols, H-enemies and gather points are
	// left. Toggles window 0 on switch 603.
	AGH_damageFormulaSenseMap = function (user, target) {
		if (target.actorId() !== user.actorId()) return;
		if ($gameSwitches.value(202)) {
			TickerManager.show(`このマップでは使用できません。`);
			return;
		}
		var treasureCount = 0;
		var monsterSymbolCount = 0;
		var hEnemyCount = 0;
		var whiteTreasureCount = 0;
		var gatherPointCount = 0;
		var minePointCount = 0;
		var dropPointCount = 0;
		var dungeonTreasureTotal = $gameVariables.value(215)[$gameVariables.value(240)].length;
		var mapId = $gameMap.mapId();
		for (var eventId = 200; eventId > 0; eventId--) {
			if (!$gameMap.event(eventId)) continue;
			var meta = $gameMap.event(eventId).event().meta;
			if (meta['TreasureBox'] && !$gameSelfSwitches.value([mapId, eventId, 'A'])) {
				treasureCount += 1;
			}
			if (meta['MonsterSymbol']
					&& !$gameSelfSwitches.value([mapId, eventId, 'C'])
					&& !$gameSelfSwitches.value([mapId, eventId, 'B'])) {
				monsterSymbolCount += 1;
			}
			if (meta['Henemy']
					&& !$gameSelfSwitches.value([mapId, eventId, 'C'])
					&& !$gameSelfSwitches.value([mapId, eventId, 'B'])) {
				hEnemyCount += 1;
			}
			if (meta['TreasureBoxW'] && !$gameSelfSwitches.value([mapId, eventId, 'A'])) {
				whiteTreasureCount += 1;
			}
			if (meta['IconDisplay']) {
				var iconId = Number(meta['IconDisplay']);
				var iconSeen = $gameSelfSwitches.value([mapId, eventId, 'B']);
				if (iconId === 183 && !iconSeen) gatherPointCount += 1;
				if (iconId === 216 && !iconSeen) minePointCount += 1;
				if (iconId === 208 && !iconSeen) dropPointCount += 1;
			}
		}
		if (!$gameSwitches.value(603)) {
			var reportText = `このダンジョンorフィールド内の通常宝箱現在数：${dungeonTreasureTotal}個
現在マップエネミー数　　：${monsterSymbolCount}/${$gameVariables.value(224)}体　現在マップＨエネミー数　：${hEnemyCount}/${$gameVariables.value(227)}体
現在マップ宝箱数　　　　：${treasureCount}個　　　現在マップ白銀宝箱数　　：${whiteTreasureCount}個
現在マップ採取ポイント数：${gatherPointCount}個　　現在マップ採掘ポイント数：${minePointCount}個
現在マップ落とし物数　　：${dropPointCount}個

※ カーソルをそのままで決定ボタンorマウス左クリック
`;
			WindowManager.show(0, 0, 0, 1280, 290);
			WindowManager.drawText(0, reportText);
			valueCountSet1 = 1;
			$gameSwitches.setValue(603, true);
		} else {
			WindowManager.hide(0);
			valueCountSet1 = 0;
			$gameSwitches.setValue(603, false);
		}
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
		BattleManager._logWindow.push(`addText`, `楽器装備による追加効果！`);
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
		var parts = String($dataSkills[action.item().id].meta['DamageFormula2']).split(',');
		var damage = Math.max(
			$attack1(Number(parts[0]), user, target, Number(parts[1])) * Number(parts[2]),
			user.mdf / 10);
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
		var members = $gameParty.battleMembers();
		for (var i = 0; i < members.length; i++) {
			members[i].addState(stateId);
		}
	};

	// Replaces (1x, skill 431 経験値獲得率1000%up).
	AGH_afterEvalLogExpRate = function (target) {
		var rate = Math.round(target.exr * 100);
		BattleManager._logWindow.push(`addText`, target.name() + 'の経験値獲得率が上昇し' + rate + '%になった！');
	};

	// Replaces (1x, skill 432 ルピ獲得率1000%up).
	AGH_afterEvalLogGoldRate = function () {
		BattleManager._logWindow.push(`addText`, 'パーティの獲得\\Gレートが10倍になった！');
	};

	// Replaces (2x, skills 433 ダメージ上限撤廃 / 434 バフ上限最大値 - the
	// database gives both the same body, so both announce a damage cap).
	AGH_afterEvalLogDamageCapRemoved = function (target) {
		BattleManager._logWindow.push(`addText`, target.name() + 'のダメージ上限が取り払われた！');
	};

	// Replaces (1x, skill 891 仲間を呼ぶ).
	AGH_afterEvalLogCalledAllies = function (target) {
		BattleManager._logWindow.push(`addText`, target.name() + 'は仲間を呼んだ！');
	};

	// Replaces (1x, skill 892 様子を見る). The idle line is rolled BEFORE the
	// state checks, exactly as in the original, so the RNG stream is unchanged.
	AGH_afterEvalLogIdleMessage = function (target) {
		var lines = [
			`はこちらの様子を見ている…。`,
			`はボーっとしている…。`,
			`はあらぬ方向を眺めている…。`,
			`は故郷に想いを馳せている…。`
		];
		var text = lines[getRandomIndex(lines.length)];
		if (target.isStateAffected(420)) text = '「………………」。';
		if (target.isStateAffected(91)) text = 'は厭らしい嗤いを浮かべている…。';
		BattleManager._logWindow.push(`addText`, target.name() + text);
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
			if ($dataStates[stateId].meta['EnemyExpRate']) {
				valueTotalexp -= Number($dataStates[stateId].meta['EnemyExpRate']);
			}
			if ($dataStates[stateId].meta['EnemyGoldRate']) {
				valueTotalgold -= Number($dataStates[stateId].meta['EnemyGoldRate']);
			}
		});
		BattleManager._logWindow.push(`addText`, target.name() + 'は逃げ出した！');
		BattleManager._logWindow.push(`addText`, `経験値レート:${valueTotalexp}`);
		BattleManager._logWindow.push(`addText`, `\\Gレート:${valueTotalgold}`);
	};
	//=============================================================================
	// Event Script (355/655) migration
	//=============================================================================
	//
	// The functions below were generated from the Script (355/655) command blocks
	// in data/CommonEvents.json and data/Map*.json. Every block that was either
	// duplicated across events or proven to execute at runtime was moved here, and
	// each source command was reduced to a single call to a readable,
	// context-based helper (e.g. showHExperienceTable1(), setupRespawnEnemyAVar292And530()):
	//
	//   helperName();            // self-contained bodies
	//   helperName(interp, ...); // bodies that used the interpreter (this)
	//
	// Contracts:
	//  - functions that drive a child interpreter receive the Game_Interpreter as
	//    their first argument (named `interp`); the body is executed through
	//    .call(interp) so `this` keeps its original meaning, including for the
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
		var messageText2 = `シーンの多くは、メインクエスト終了後に開放される。`;
		var textPart2 = `本作には多様な強化システムを採用しているが、\nメインクエストとシーン回収だけを考えれば、\n極論レベルを上げて剣と杖で殴っていれば問題ない。`;
		var textPart3 = `「朝昼」と「夜」では発生するイベントに変化がある。\nこれはメインクエストに措いても同様。\n進行条件が「〇〇に会いに行く」などの場合、\n夜では会えない事が多い。日を改めて日中に会いに行こう`;
		var textPart4 = `シーンや挿話には「同一人物のシーンは同日に発生しない」という\n縛りが存在する場合がある。\n日数経過をさせる事で発生するようになる。`;
		var textPart5 = `メインクエスト進行時の戦闘に、敗北Ｈはない`;
		var textPart6 = `Ｈエネミーはそのマップで敗北Ｈを経験する事で出現する。\nＨエネミーに敗北すると汎用全滅シーンが発生する。`;
		var textPart7 = `「称号」は、条件を満たした後、「一日の始まり」か「ギルド受付」と\n話した直後に付与される。`;
		$gameVariables.setValue(250,
			[	
				colorTaggedText(2, `[1]`) + `${messageText2}`,
				colorTaggedText(2, `[2]`) + `${textPart2}`,
				colorTaggedText(2, `[3]`) + `${textPart3}`,
				colorTaggedText(2, `[4]`) + `${textPart4}`,
				colorTaggedText(2, `[5]`) + `${textPart5}`,
				colorTaggedText(2, `[6]`) + `${textPart6}`,
				colorTaggedText(7, `[1]`) + `${textPart7}`,
				colorTaggedText(2, `[8]`),
				colorTaggedText(2, `[9]`),
				colorTaggedText(2, `[10]`)
			]
		);
	};

	// Replaces (14x): data/CommonEvents.json:common-event:1, data/CommonEvents.json:common-event:21, data/CommonEvents.json:common-event:22, data/CommonEvents.json:common-event:47, data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:167, …
	AGH_setPictureMotion1 = function () {
		//picture_motion1("smooth",[0]);
		picture_motion1("linear",[0]);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	AGH_setMessagePictureAnimationParams = function () {
		$gameMessage._IZSTPicShowParam = [550+640,384+100,100,100,100];
		$gameMessage._IZSTPicMoveParam = [500+640,384+100,100,100,255,30];
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	AGH_setHVScrollingMenuBackground = function () {
		$gameVariables.setValue(81,0)//メニュー背景横スク
		$gameVariables.setValue(82,0)//メニュー背景縦スク
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

	function varValue(variableId) { return $gameVariables.value(variableId); }
	function setVar(variableId, value) { $gameVariables.setValue(variableId, value); }
	function setSelfVar(interp, variableId, value) { interp.sVal(variableId, value); }
	function clearSelfVarRange(interp, firstId, lastId) {
		range(firstId, lastId).forEach(variableId => setSelfVar(interp, variableId, 0));
	}
	function range(from, to) {
		const values = [];
		for (let value = from; value <= to; value++) values.push(value);
		return values;
	}
	/* `enableSwitch` / `disableSwitch` are public (called from the data files) and
	   are defined once, further down in the switches section. */
	function selfSwitchOn(mapId, eventId, key) { $gameSelfSwitches.setValue([mapId, eventId, key], true); }
	function selfSwitchOff(mapId, eventId, key) { $gameSelfSwitches.setValue([mapId, eventId, key], false); }
	function mapSelfSwitchOn(eventId, key) { selfSwitchOn($gameMap.mapId(), eventId, key); }
	function mapSelfSwitchOff(eventId, key) { selfSwitchOff($gameMap.mapId(), eventId, key); }
	function actorFromVariable(variableId) { return $gameActors.actor(varValue(variableId)); }
	function applyFlagToSwitch(switchId, flag) { $gameSwitches.setValue(switchId, !!flag); }
	function findItemIdByMetaKey(metaKey) {
		const itemId = range(1, $dataItems.length - 1).find(id => $dataItems[id].meta[metaKey]);
		return itemId || 0;
	}
	function spendGoldForJobMaterial(goldAmount, materialMetaKey) {
		$gameParty.loseGold(goldAmount);
		$gameParty.loseItem($dataItems[findItemIdByMetaKey(materialMetaKey)], 1);
	}
	function eraseEventsWithMetaKeys(metaKeys) {
		for (let eventId = $gameMap.events().length; eventId > 0; eventId--) {
			const mapEvent = $gameMap.event(eventId);
			if (!mapEvent) continue;
			if (metaKeys.some(metaKey => mapEvent.event().meta[metaKey])) $gameMap.eraseEvent(eventId);
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

	const DEPLOYED_ACTOR_START_VAR = 75;      // 登場キャラ始点
	const DEPLOYED_ACTOR_END_VAR = 76;        // 登場キャラ終点
	const HEROINE_ID_LIST_VAR = 247;          // ヒロインID配列
	const CURRENT_ACTOR_VAR = 20;             // 汎用「対象キャラ」
	const LEAD_ACTOR_VAR = 530;               // 主格キャラ
	const SPAWNED_EVENT_TABLE_VAR = 292;      // スポーンしたイベントID表
	const NPC_PRESET_TABLE_VAR = 163;         // NPC外見プリセット表
	const NPC_PRESET_INDEX_VAR = 535;         // 使用中のプリセット番号
	const QUEST_OBJECTIVE_VAR = 134;          // クエスト目標テキスト
	const TICKER_WAIT_VAR = 71;               // ティッカー表示ウェイト
	const TICKER_WAIT_FRAMES = 240;

	function forEachDeployedActor(callback) {
		range(varValue(DEPLOYED_ACTOR_START_VAR), varValue(DEPLOYED_ACTOR_END_VAR)).forEach(callback);
	}
	function forEachHeroine(callback) { varValue(HEROINE_ID_LIST_VAR).forEach(callback); }
	function currentActor() { return actorFromVariable(CURRENT_ACTOR_VAR); }
	function spawnedEventId(slotIndex) { return varValue(SPAWNED_EVENT_TABLE_VAR)[slotIndex]; }
	function spawnedEvent(slotIndex) { return $gameMap.event(spawnedEventId(slotIndex)); }
	function currentNpcPreset() { return varValue(NPC_PRESET_TABLE_VAR)[varValue(NPC_PRESET_INDEX_VAR)]; }

	/* --- pictures ------------------------------------------------------------ */

	const SCENE_PICTURE_X = 640 - 128;   // 512 : left-hand scene pictures
	const SCENE_PICTURE_Y = 384;
	const RIGHT_PICTURE_X = 640 + 480;   // 1120: right-hand scene pictures
	const SCENE_FADE_FRAMES = 60;

	function showPic(pictureId, pictureName, x, y, scaleX, scaleY, opacity, origin) {
		$gameScreen.showPicture(pictureId, pictureName, origin === undefined ? 1 : origin, x, y, scaleX, scaleY, opacity, 0);
	}
	function movePic(pictureId, x, y, scaleX, scaleY, opacity, duration, origin) {
		$gameScreen.movePicture(pictureId, origin === undefined ? 1 : origin, x, y, scaleX, scaleY, opacity, 0, duration);
	}
	/**
	 * "Scene picture fade-in": show a picture, then animate it into place at full
	 * opacity.  Unspecified target values default to the source values, except
	 * scale (100%) and opacity (255) which every caller animates towards.
	 */
	function showScenePicture(pictureId, pictureName, options = {}) {
		const {
			x = SCENE_PICTURE_X, y = SCENE_PICTURE_Y,
			scaleX = 100, scaleY = 100, opacity = 0,
			toX = x, toY = y, toScaleX = 100, toScaleY = 100, toOpacity = 255,
			duration = SCENE_FADE_FRAMES, origin = 1,
		} = options;
		showPic(pictureId, pictureName, x, y, scaleX, scaleY, opacity, origin);
		movePic(pictureId, toX, toY, toScaleX, toScaleY, toOpacity, duration, origin);
	}
	/**
	 * Core of the whole `blessStandingPicture*` family: show a picture, optionally
	 * slide it to its resting position, apply the blessed-tachie effect and
	 * optionally slide the previous picture away.
	 */
	function showBlessedPicture(pictureId, pictureName, options = {}) {
		const {
			x = SCENE_PICTURE_X, y = SCENE_PICTURE_Y,
			scaleX = 100, scaleY = 100, opacity = 0,
			animate = true, toX = x, toY = y, toOpacity = 255, duration = SCENE_FADE_FRAMES,
			blessType = 2, slidePreviousId = 0, slideFrames = 90,
		} = options;
		showPic(pictureId, pictureName, x, y, scaleX, scaleY, opacity, 1);
		if (animate) movePic(pictureId, toX, toY, 100, 100, toOpacity, duration, 1);
		tachie_bless(pictureId, blessType);
		if (slidePreviousId) pic_move1(slidePreviousId, 0, 0, 100, 100, 0, slideFrames);
	}
	function showScreenBlackOut(pictureId, opacity) {
		showPic(pictureId, 'ScreenBlackOut', 640, 384, 100, 100, opacity, 1);
	}
	function fadeInScreenBlackOut(pictureId, opacity, fadePictureId) {
		showScreenBlackOut(pictureId, opacity);
		picture_fade1(fadePictureId === undefined ? pictureId : fadePictureId, 'fadeIn', valueWipeImg, 60, 5);
	}
	function slideScenePictureAway(picIndex, waitFrames) {
		pic_move1(valuePic1 + picIndex - 1, 0, 0, 100, 100, 0, waitFrames === undefined ? 90 : waitFrames);
	}
	function movePictureRetainingScale(pictureId, xOffset, opacity, duration) {
		const picture = $gameScreen.picture(pictureId);
		if (!picture) return;
		$gameScreen.movePicture(pictureId, picture.origin(), picture.x() + xOffset, picture.y(),
			picture.scaleX(), picture.scaleY(), opacity === null ? picture.opacity() : opacity, 0, duration);
	}
	function erasePictureRangeBetween(rangeStart, rangeEnd) {
		range(rangeStart, rangeEnd).forEach(pictureId => $gameScreen.erasePicture(pictureId));
	}

	/* --- particles ----------------------------------------------------------- */

	function particleSet(...args) { $gameScreen._particle.particleSet(...args); }
	function particlePlay(...args) { $gameScreen._particle.particlePlay(...args); }
	function particleUpdate(...args) { $gameScreen._particle.particleUpdate(...args); }
	function particleClear(particleId) { $gameScreen._particle.particleClear(particleId); }
	function spawnStatueOrbParticle(interp, yOffset) {
		const particleName = 'statue_orb_c';
		const particleId = `${particleName}-${interp._eventId}`;
		particleSet(interp._eventId, particleId, 'this', particleName, 'above');
		particleUpdate([particleId, 'color', '#ff00f7', '#ffffff']);
		particleUpdate([particleId, 'pos', 0, yOffset]);
	}
	function spawnWingParticle(eventId) {
		const particleName = 'wing_r2';
		particlePlay(eventId, `${particleName}-${eventId}`, 'this', particleName, '99');
	}

	/* --- translator-friendly text markers -------------------------------------
	 * Message strings write the engine's control characters as an inline
	 * placeholder instead of the raw escape, e.g.
	 *
	 *     `「${characterName(2)}さん、行きましょう！」`   instead of   `「\N[2]さん、行きましょう！」`
	 *
	 * Each helper expands back to the very control code the game already used, so
	 * the rendered text is unchanged — a translator (or a tool that extracts the
	 * strings) sees ${whatItIs(n)} instead of a cryptic backslash pair.  The names
	 * follow the wording of the marker list at the top of the file; the complete
	 * table is repeated right below that list.
	 */
	/* @markers-off */
	function textSpeed(cps) { return `\\SP[${cps}]`; }                        // \SP[n]  text speed
	function animationType(typeId) { return `\\AT[${typeId}]`; }              // \AT[n]  animation type
	function setString(setId) { return `\\SET[${setId}]`; }                   // \SET[n] set string
	function oneChar(chars) { return `\\CO[${chars}]`; }                      // \CO[S]  display as one character
	function ruby(text, rubyText) { return `\\RB[${text},${rubyText}]`; }     // \RB[S,R] text with ruby
	function shiftNextX(pixels) { return `\\MX[${pixels}]`; }                 // \MX[n]  shift next letter X
	function shiftNextY(pixels) { return `\\MY[${pixels}]`; }                 // \MY[n]  shift next letter Y
	function nextCharX(x) { return `\\PX[${x}]`; }                            // \PX[n]  next character X
	function nextCharY(y) { return `\\PY[${y}]`; }                            // \PY[n]  next character Y
	function switchOnText(switchId) { return `\\SW[${switchId}]`; }           // \SW[n]  turn on switch n
	function skillName(skillId) { return `\\SN[${skillId}]`; }                // \SN[n]  skill name
	function skillIconName(skillId) { return `\\SIN[${skillId}]`; }           // \SIN[n] icon + skill name
	function itemName(itemId) { return `\\IN[${itemId}]`; }                   // \IN[n]  item name
	function itemIconName(itemId) { return `\\IIN[${itemId}]`; }              // \IIN[n] icon + item name
	function weaponName(weaponId) { return `\\WN[${weaponId}]`; }             // \WN[n]  weapon name
	function weaponIconName(weaponId) { return `\\WIN[${weaponId}]`; }        // \WIN[n] icon + weapon name
	function armorName(armorId) { return `\\AN[${armorId}]`; }                // \AN[n]  armor name
	function armorIconName(armorId) { return `\\AIN[${armorId}]`; }           // \AIN[n] icon + armor name
	function waitEffect() { return '\\WE'; }                                  // \WE     wait for the production
	function fontColor(colorIndex) { return `\\C[${colorIndex}]`; }           // \C[n]   font color
	function fontColorRGB(r, g, b) { return `\\C[${r},${g},${b}]`; }          // \C[r,g,b]
	function fontSize(size) { return `\\FS[${size}]`; }                       // \FS[n]  font size
	function invertBold() { return '\\FB'; }                                  // \FB     invert bold flag
	function invertItalic() { return '\\FI'; }                                // \FI     invert italic flag
	function charOpacity(opacity) { return `\\OP[${opacity}]`; }              // \OP[n]  character opacity
	function outlineColor(colorIndex) { return `\\OC[${colorIndex}]`; }       // \OC[n]  character edge color
	function outlineColorRGB(r, g, b) { return `\\OC[${r},${g},${b}]`; }      // \OC[r,g,b]
	function outlineColorRGBA(r, g, b, a) { return `\\OC[${r},${g},${b},${a}]`; }  // \OC[r,g,b,a]
	function outlineWidth(width) { return `\\OW[${width}]`; }                 // \OW[n]  character edge width
	function rubyColor(colorIndex) { return `\\RC[${colorIndex}]`; }          // \RC[n]  ruby color
	function rubyColorRGB(r, g, b) { return `\\RC[${r},${g},${b}]`; }         // \RC[r,g,b]
	function rubyColorRGBA(r, g, b, a) { return `\\RC[${r},${g},${b},${a}]`; }    // \RC[r,g,b,a]
	function resetTextStyle() { return '\\DF'; }                              // \DF     back to default settings
	function saveTextStyle() { return '\\SV'; }                               // \SV     memorize settings
	function loadTextStyle() { return '\\LD'; }                               // \LD     recall memorized settings
	function noSkip() { return '\\A'; }                                       // \A      forbid skipping
	function allowSkipTemporarily() { return '\\ES'; }                        // \ES     allow skipping for now
	function fadeOutType(typeId) { return `\\FO[${typeId}]`; }                // \FO[n]  fade-out type
	/* the five below are not in the list above but are used by the data files: */
	function characterName(actorId) { return `\\N[${actorId}]`; }             // \N[n]   character name
	function variableText(variableId) { return `\\V[${variableId}]`; }        // \V[n]   value of variable n
	function icon(iconIndex) { return `\\I[${iconIndex}]`; }                  // \I[n]   icon
	function jobName(jobId) { return `\\j[${jobId}]`; }                       // \j[n]   job name
	function switchName(switchId) { return `\\swi[${switchId}]`; }            // \swi[n] name of switch n (used as place names)
	/* Control characters of the other text / label plug-ins.  They are not in the
	 * list above, so each name only says what the code is; the place the data uses
	 * it in (noted on the right) is what tells them apart. */
	function goldIcon() { return '\\G'; }                                      // \G      currency glyph — follows a price
	function braceRight() { return '\\}'; }                                    // \}      right brace glyph — name labels / quest lines
	function braceLeft() { return '\\{'; }                                     // \{      left brace glyph — name labels / quest lines
	function instantText() { return '\\>'; }                                   // \>      show the rest of the message at once
	function centerLabel(text) { return `\\CL${text}`; }                       // \CL…    centre this label on the map (map_centerDispray)
	function itemIconNameEsc(itemId) { return `\x1bIIN[${itemId}]`; }           // ESC + IIN[n] — quest-list spelling
	/* @markers-on */

	/* --- text, popups, ticker ------------------------------------------------ */

	function setQuestObjective(text) { setVar(QUEST_OBJECTIVE_VAR, text); }
	function showTicker(message) { TickerManager.show(`${message}`); }
	function showCommonInfo(text) { CommonPopupManager.showInfo({}, text, null); }
	function pushBattleLog(text) { BattleManager._logWindow.push('addText', text); }
	function showInfoOrBattleLog(text) {
		if ($gameParty.inBattle()) pushBattleLog(text);
		else showCommonInfo(text);
	}
	function setTickerWait(frames) { setVar(TICKER_WAIT_VAR, frames === undefined ? TICKER_WAIT_FRAMES : frames); }
	function fetchInfo(databaseTypeId, databaseEntryId, itemAmount) {
		setTickerWait();
		get_infoDirect(databaseTypeId, databaseEntryId, 0, itemAmount);
	}
	function fetchInfoWithLeadingEntry(leadingTypeId, leadingEntryId, databaseTypeId, databaseEntryId, itemAmount) {
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
		setVar(706, [640 - 128, 386, layerPreset, speed, 0, 'eromangasimaji']);
		enableSwitch(125);
	}
	function pushActorBattleLog(suffix) {
		const actorName = currentActor().name();
		pushBattleLog(`${actorName}${suffix}`);
	}
	function runShowInfoPlugin(interp, message) {
		callPluginCommand(interp, 'ShowInfo', message);
	}
	function playPitchVariableSe(seName) {
		AudioManager.playSe({ name: seName, volume: 100, pitch: varValue(122), pan: 0 });
	}
	function forEachCostumeSlot(callback) {
		range(1, 40).forEach(callback);
	}
	function decorateWithActorName(message) {
		return `${currentActor().name()}${message}`;
	}
	/** 「はメインクラス2ndジョブ＜\j[2X]＞に目覚めた！」 + common event 45. */
	function setSecondJobAwakeningMessage(interp, jobIndex, leadingSpaces) {
		setSelfVar(interp, CURRENT_ACTOR_VAR, jobIndex);
		const fontColor16 = fontColor(16);
		const awakeningActorName = currentActor().name();   // the actor that awakens
		const fontColor0 = fontColor(0);
		const fontColor2 = fontColor(2);
		const secondJobName = jobName(jobIndex + 20);
		valueWordSet0 = `${leadingSpaces}${fontColor16}${awakeningActorName}${fontColor0}` +
			`はメインクラス2ndジョブ${fontColor2}＜${secondJobName}＞${fontColor0}に目覚めた！`;
		valueWordSetEx = 0;   // 補足が必要な場合
		runCommonEventAsChild(interp, 45);
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
	function speakOneLiner(interp, pictureId, lines, options = {}) {   // `interp` may be null when no wait is needed
		const {
			fontSize = 25, fontWeight = 180, fontFace = 0,
			xOffsets = [0], yOffsets = [-50],
			eventId = interp._eventId, waitFrames = 0,
		} = options;
		chara_oneWord(pictureId, eventId, fontSize, fontWeight, xOffsets, yOffsets, [].concat(lines), fontFace);
		if (waitFrames && interp) interp.wait(waitFrames);
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
		callPluginCommand(interp, 'P_CALL_CE', getPreviousTachiePicId(), '71', '2', 'ON');
	}

	/* --- visual-novel / cutscene state --------------------------------------- */

	function setVisualNovelChoices(enabled) { $gameSystem.vnChoices = enabled; }

	/* --- common events ------------------------------------------------------- */

	// Replaces (89x): data/CommonEvents.json:common-event:13, data/CommonEvents.json:common-event:96, data/CommonEvents.json:common-event:270, data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:303, …
	// The one entry point that lives in the helper layer: both the other entries and
	// the data files call it by name, so it stays a top-level assignment (a global in
	// the plugin scope, exactly like the original) instead of a helper declaration.
	runCommonEventAsChild = function (interp, commonEventId) {
		interp.setupChild($dataCommonEvents[commonEventId].list, 0);
	};
	function setSelfVarAndRunCommonEvent(interp, selfVarId, value, commonEventId) {
		setSelfVar(interp, selfVarId, value);
		runCommonEventAsChild(interp, commonEventId);
	}
	function showOneLineTalk(interp, talkLayoutId, talkParams) {
		setSelfVar(interp, 172, talkLayoutId);
		valueTalkSet = talkParams;
		runCommonEventAsChild(interp, 60);
	}
	function questDialogueText(itemId) {
		const isDailyQuest = $dataItems[itemId].meta['SGカテゴリ'] === 'デイリークエスト';
		const baseItemId = isDailyQuest ? 900 : 800;
		// NOTE: this is the quest-list line, not a message window: its renderer wants
		//       the ESC spelling (0x1b + `IIN[n]`) the original used, which is what
		//       itemIconNameEsc() emits.
		return `${itemIconNameEsc(itemId)}\n${valueQuestArray4[itemId - baseItemId]}`;
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
		console.log(`${entryId}  ${picturePath}`);
		showPic(pictureSlot, picturePath, 640 - 128, 384, 100, 100, 255, 1);
	}
	function playMetaBgm(entryId, bgmName) {
		if (bgmName === 'NoMusic') return;
		console.log(`${entryId}  ${bgmName}`);
		AudioManager.playBgm({ name: bgmName, volume: 100, pitch: 100, pan: 0 });
	}
	/* ============================================================================
	 * Setup / configuration
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:1
	setVariable73 = function () {
		setVar(73, 1);   // ヒロインキャラ始点変数
		setVar(74, 2);   // ヒロインキャラ終点変数
		setVar(247, [1, 2]);                // ヒロインID配列変数
		setVar(75, 1);   // 登場キャラ始点変数
		setVar(76, 7);   // 登場キャラ終点変数
		setVar(248, [1, 2, 3, 4, 5, 6, 7]); // キャラID配列変数
	};

	// Replaces (2x): data/CommonEvents.json:common-event:1, data/CommonEvents.json:common-event:102
	setVariable68 = function () {
		setVar(68, 120);   // GAB表示時間
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	setVariable71Var185 = function () {
		setTickerDisplayTime(180, 0);   // ティッカー表示時間 / TickerY軸変更
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	setVariable65 = function () {
		setVar(65, 180);   // KMSポップアップ表示時間
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	setVariable279 = function () {
		setVar(279, 10);   // ステート付与解除アニメウェイト
		setVar(280, 10);   // 280に上乗せ分ウェイト
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	setVariable254 = function () {
		setVar(254, 1);   // メニュー表示変数1で固定
	};

	/* ============================================================================
	 * Variables / save files
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:2, data/CommonEvents.json:common-event:53
	dumpLocationPresetToFile = function (variableId) {
		// LisciaBlueQuestフォルダに書き出し
		fs.writeFileSync('valueLocationPreset.txt', JSON.stringify(varValue(variableId)));
	};

	// Replaces (19x): data/CommonEvents.json:common-event:5, :87, :109, :110, :111, :112, ...
	setValueCountSet1 = function (setValue) {
		valueCountSet1 = setValue;
	};

	// Replaces (14x): data/CommonEvents.json:common-event:5, :42, :65, :87, :89, :132, ...
	setValueCountSet3 = function (setValue) {
		valueCountSet3 = setValue;
	};

	// Replaces (18x): data/CommonEvents.json:common-event:12, :212, :295, Map007.json:map-event:23:page:1, ...
	assignVariableValueFromArgs = function (variableId, value) {
		setVar(variableId, value);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:86, data/CommonEvents.json:common-event:179
	// Writes a game variable — exactly what `assignVariableValueFromArgs` above does,
	// so it is folded into it instead of repeating the body. The name is kept because
	// the data files call it directly.
	assignVariableValue = assignVariableValueFromArgs;

	// Replaces (4x): data/CommonEvents.json:common-event:12, :54, Map003.json:map-event:235:page:1, Map018.json:map-event:39:page:1
	initVariableArrayFromSize = function (variableId, arraySize) {
		setVar(variableId, Array(arraySize).fill(0));
	};

	// Replaces (11x): data/CommonEvents.json:common-event:9, :11, :12, :64, :254, Map003.json:map-event:133:page:2, ...
	initSelfVariableArrayFromSize = function (interp, variableId, arraySize) {
		setSelfVar(interp, variableId, Array(arraySize).fill(0));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:12, data/CommonEvents.json:Map003.json:map-event:113:page:1
	writeVariableSlotFromIndex = function (variableId, indexVariableId, value) {
		varValue(variableId)[varValue(indexVariableId)] = value;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:12, data/CommonEvents.json:common-event:205
	hideSystemCursor = function () {
		$gameSystem._cursorHidden = true;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:12
	setVariable508 = function () {
		setVar(508, 'BlueSky');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:431
	setVariable21Text = function () {
		setVar(21, `幹部団員 ${braceRight()}秩序の騎空団`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:12
	setVariable55Text = function () {
		setVar(55, '月');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:12
	setVariable515Text = function () {
		setVar(515, '持ち上げoff');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:290, data/CommonEvents.json:common-event:295
	setVariable21TextVar142 = function () {
		const textSpeed0 = textSpeed(0);
		const viewedEventItemIcon = itemIconName(varValue(142));   // variable 142 (scratch): item of the already-viewed event
		setVar(21,
			`${textSpeed0}イベント：${viewedEventItemIcon}は、既に閲覧済みです。\nスキップしますか？\n（そのイベントで獲得できる称号や性経験値などは入手できます。\n但し、獲得物に選択肢が関係する場合は入手できません）`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:290, data/CommonEvents.json:common-event:295
	setVariable141Text = function () {
		const viewedEventItemId = varValue(142);   // variable 142 (scratch): item of the already-viewed event
		setVar(141, `${viewedEventItemId}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:291, data/CommonEvents.json:common-event:296
	setValueScriptArray1_2 = function () {
		valueScriptArray1 = [];
		valueScriptArray2 = [];
	};

	// Replaces (151x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:303, data/CommonEvents.json:common-event:304, data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:306, …
	// Writes a 3-element array into a game variable (coordinate / slot triples).
	assignVariableTripleFromArgs = function (variableId, newValue, newValue2, newValue3) {
		setVar(variableId, [newValue, newValue2, newValue3]);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:302, data/Map018.json:map-event:32:page:1
	// Copies slot 59 of an actor's H-stat record into the shared variable 21
	// (`380 + actorIndex`: 0 = actor 20, 1..4 = actors 1..4).
	setVariable21 = function (actorIndex) {
		setVar(21, varValue(380 + actorIndex)[59]);
	};

	/* ============================================================================
	 * Quest objectives (all of them write variable 134)
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:301
	setQuestObjectiveHeadToRoyalCastle = function () {
		setQuestObjective('まずは王城へと向かいましょう。\n王都北側に入り口がある筈です。');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:303
	setQuestObjectiveHeadToInn = function () {
		setQuestObjective('宿へ向かいましょうか');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:304
	setQuestObjectiveHeadToGuild = function () {
		setQuestObjective('【騎空士ギルド】へ向かいましょう。\n確か、王城の手前ほどの場所にあったはずです');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:305
	setQuestObjectiveVisitInformant = function () {
		setQuestObjective('情報屋に会いに行きましょう。\n表向きは書店を営業していると聞いています');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:309
	setQuestObjectiveReturnToInn = function () {
		setQuestObjective('空賊に関する資料が届いているかも知れません。\n宿屋に戻りましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:311
	setQuestObjectiveCaptureCentralPlainsBandits = function () {
		const defeatedBanditCount = variableText(642);   // variable 642: ﾒｲﾝ10中央平原討伐数
		setQuestObjective(`中央平原の空賊達を\n１０人捕縛(討伐)しましょう\n ＜${defeatedBanditCount} / 10人＞`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:312
	setQuestObjectiveReachLevelTenThenChurch = function () {
		const characterName5 = characterName(5);
		const centralPlainsName = switchName(252);   // switch 252: 中央平原
		setQuestObjective(`${characterName5}くんのレベルを10に上げて教会へと向かいましょう。\n` +
			`空賊達が居なくなった${centralPlainsName}が、\n狩場に適してしるようですね。\n` +
			'情報屋で情報を購入しておいた方が良いかも知れません。');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:313
	setQuestObjectiveLocateBanditHideout = function () {
		setQuestObjective('そろそろ、尋問が終わって空賊達の拠点が\n割り出されているでしょうか');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:314
	setQuestObjectiveHeadToVillage = function () {
		setQuestObjective('集落へと向かいましょうか');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:315
	setQuestObjectiveAskVillageElder = function () {
		const itemName26 = itemName(26);
		setQuestObjective(`この集落のまとめ役の方に\n${itemName26}に関する\n情報を聞きに行きましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:316
	setQuestObjectivePrepareCountermeasures = function () {
		const graveyardName = switchName(254);   // switch 254: 共同墓地
		const skillIcon424 = skillIconName(424);
		const skillIcon425 = skillIconName(425);
		const armorIcon175 = armorIconName(175);
		// NOTE: textPart2 is not declared in this scope in the original either —
		//       it comes from the global scope, so it is kept as-is.
		setQuestObjective(`${graveyardName}へ向かいましょう。\n${textPart2}` +
			`${skillIcon424}や${skillIcon425}対策を\nしておいた方が良いかも知れません。\n` +
			`${armorIcon175}などですね`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:317
	setQuestObjectiveSearchGraveyard = function () {
		setQuestObjective('この有様になった、原因がある筈です。\n墓地の中を調べていきましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:318
	setQuestObjectiveDefeatGraveyardBoss = function () {
		const graveyardName = switchName(254);   // switch 254: 共同墓地
		setQuestObjective(`${graveyardName}のボスを討伐しましょう！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:319
	setQuestObjectiveHeadToNamedPlace = function () {
		const centralForestName = switchName(256);   // switch 256: 中央森林
		setQuestObjective(`${centralForestName}へ向かいましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:320
	setQuestObjectiveCrossForestToHideout = function () {
		setQuestObjective('この森を抜ければ空賊団のアジトです。\n行きましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:321
	setQuestObjectiveRaidBanditHideout = function () {
		setQuestObjective('さあ、アジトへと突入しましょう！');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:322
	setQuestObjectiveDefeatHideoutBoss = function () {
		const skyPirateHideoutName = switchName(255);   // switch 255: 空賊団本拠地
		setQuestObjective(`${skyPirateHideoutName}のボスを討伐しましょう！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:323
	setQuestObjectiveLeaveCastle = function () {
		setQuestObjective('城を出ましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:324
	setQuestObjectiveRegroupAtInn = function () {
		setQuestObjective('宿に戻ってみんなと合流しましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:325
	setQuestObjectiveHeadToNewlyFoundSite = function () {
		const itemName22 = itemName(22);
		setQuestObjective(`新しく発見されたという\n${itemName22}へ向かいましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:326
	setQuestObjectiveDefeatSiteBoss = function () {
		const kamunaoiCaveName = switchName(332);   // switch 332: カムナオイ洞窟[裏]
		setQuestObjective(`${kamunaoiCaveName}のボスを討伐しましょう！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:327
	setQuestObjectiveMeetCompanionAtPlace = function () {
		const augusteIslandsName = switchName(223);   // switch 223: アウギュステ列島
		const characterName2 = characterName(2);
		setQuestObjective(`${augusteIslandsName}へと向かい、\n${characterName2}さんと合流しましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:328
	setQuestObjectiveBuySwimsuit = function () {
		setQuestObjective('雑貨屋に水着を買いに行きましょうか…');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:329
	setQuestObjectiveMeetCompanionAtBeach = function () {
		const characterName2 = characterName(2);
		setQuestObjective(`浜辺に行って${characterName2}さんと合流しましょう。\nお昼でないと居ないでしょうから気を付けましょうね`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:330
	setQuestObjectiveAdvanceToNamedPlace = function () {
		const greatWaterfallName = switchName(284);   // switch 284: 大爆滝
		setQuestObjective(`${greatWaterfallName}へ向かいましょう。`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:331
	setQuestObjectiveEnterFromEntrance = function () {
		const greatWaterfallName = switchName(284);   // switch 284: 大爆滝
		setQuestObjective(`${greatWaterfallName}にある入口から中に入りましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:332
	setQuestObjectiveGoDeeper = function () {
		const undergroundLakeName = switchName(285);   // switch 285: 地底湖
		setQuestObjective(`${undergroundLakeName}の奥へと進みましょう──`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:333
	setQuestObjectiveDefeatDepthBoss = function () {
		const undergroundLabName = switchName(286);   // switch 286: 地底湖奥研究所
		setQuestObjective(`${undergroundLabName}のボスを討伐しましょう！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:334
	setQuestObjectiveReturnAndRegroup = function () {
		const corblantIslandName = switchName(221);   // switch 221: コルブラント島
		const characterName4 = characterName(4);
		setQuestObjective(`${corblantIslandName}に戻って、\n${characterName4}さん達と合流しましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:335
	setQuestObjectiveVisitInformantAgain = function () {
		setQuestObjective('情報屋を訪ねましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:336
	setQuestObjectivePassFirstFloor = function () {
		const kleistMountainName = switchName(334);   // switch 334: クライスト山[1F]
		setQuestObjective(`${kleistMountainName}へ向かいましょう。\n1層を通り抜けます`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:337
	setQuestObjectiveRaidHut = function () {
		setQuestObjective('小屋に突入しましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:338
	setQuestObjectiveHeadToLocalInn = function () {
		const corblantIslandName = switchName(221);   // switch 221: コルブラント島
		setQuestObjective(`${corblantIslandName}の宿に向かいましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:339
	setQuestObjectiveVisitCastleByDay = function () {
		setQuestObjective('日中に王城へ向かいましょう');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:340, data/CommonEvents.json:common-event:341
	setQuestObjectiveAwaitPlayerChoice = function () {
		setQuestObjective('どうしましょうか…');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:342
	setQuestObjectiveVisitChancellor = function () {
		setQuestObjective('宰相の元へ向かいましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:343
	setQuestObjectiveFightKnightCommander = function () {
		setQuestObjective('謁見の間で、騎士団長との戦いです');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:344
	setQuestObjectiveHeadToFestivalHall = function () {
		const graveyardName = switchName(254);   // switch 254: 共同墓地
		const undergroundTunnelName = switchName(257);   // switch 257: 地下坑道
		setQuestObjective(`${graveyardName}の祭殿へ向かいましょう。\nそこから、${undergroundTunnelName}へと行ける筈です`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:345
	setQuestObjectiveContinueMainQuest = function () {
		const undergroundTunnelName = switchName(257);   // switch 257: 地下坑道
		setQuestObjective(`${undergroundTunnelName}へ向かいましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:346
	setQuestObjectiveDefeatAreaBoss = function () {
		const undergroundTunnelName = switchName(257);   // switch 257: 地下坑道
		setQuestObjective(`${undergroundTunnelName}のボスを討伐しましょう！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:347
	setQuestObjectiveInvestigateNoise = function () {
		setQuestObjective('中で物音がしましたね。\n何か変化があったのかも知れません。\n行ってみましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:348
	setQuestObjectiveFinalBattle = function () {
		const setString7 = setString(7);
		setQuestObjective(`最期の決戦です…。\n『尊き契りの間』の${setString7}を\n撃破しましょう！`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:349, data/CommonEvents.json:common-event:350
	setQuestObjectiveMainQuestComplete = function () {
		setQuestObjective('何処に行きましょうか？\n（メインクエスト完了）');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:306
	setQuestObjectivePrepareInTownAndAdvance = function (interp) {
		const itemName21 = itemName(21);
		setQuestObjective(`街で準備を整えて、\n${itemName21}へ向かいましょう！`);
		setSelfVar(interp, 21, $dataSystem.switches[248]);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:308
	setQuestObjectiveFightUnavoidableBoss = function (interp) {
		const itemName21 = itemName(21);
		setQuestObjective(`戦いは避けられませんね…。\n${itemName21}ボスを討伐しましょう！`);
		setSelfVar(interp, 21, $dataSystem.switches[248]);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:310
	setQuestObjectiveGoToCentralPlains = function (interp) {
		setQuestObjective('中央平原へ行きましょう');
		setSelfVar(interp, 21, $dataSystem.switches[248]);
	};

	// Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	setVariable801Text = function () {
		setVar(801, '残念だったね？');
	};
	/* ============================================================================
	 * Actors / party / skills / states
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:12, data/CommonEvents.json:common-event:64
	setCostumeDirectSite = function (interp, actorVariableId) {
		setSelfVar(interp, 19, Number($dataActors[varValue(actorVariableId)].meta['MainCloth']));
		kisekae_tyokusetusitei(varValue(19), 0);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:12
	setBattleAnimationSpeed = function (speed) {
		ConfigManager.battleAniSpeed = speed;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:202
	// Same body as `setBattleAnimationSpeed` above (right-hand side of common-event:202).
	setBattleAnimationSpeed2 = setBattleAnimationSpeed;

	// Replaces (2x): data/CommonEvents.json:common-event:13, data/CommonEvents.json:common-event:24
	clearGotItemInfo = function () {
		$gameParty.gotItemInfo = [];
	};

	// Replaces (2x): data/CommonEvents.json:common-event:13, data/CommonEvents.json:common-event:22
	grantTpToListActors = function (interp) {
		forEachHeroine(heroineId => {
			$gameActors.actor(heroineId).gainTp(getRandomIndex(61) + 40);
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:9, data/Map003.json:map-event:133:page:2
	returnProfessionBasics = function () {
		forEachDeployedActor(actorId => Profession_basicReturn(actorId));
	};

	// Replaces (3x): data/CommonEvents.json:common-event:9, data/CommonEvents.json:common-event:24, data/Map003.json:map-event:131:page:2
	removeStateFromListActorsVar248And380 = function (interp) {
		forEachHeroine(heroineId => {
			$gameActors.actor(heroineId).removeState(39);
			varValue(380 + heroineId)[58] = 0;
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:19, data/CommonEvents.json:common-event:20
	removeStateFromListActorsVar75And76 = function (interp) {
		valueTachieChangeStateTemporary.forEach(stateId => {
			forEachDeployedActor(actorId => $gameActors.actor(actorId).removeState(stateId));
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	removeStateFromListActors = function () {
		$gameParty.battleMembers().forEach(battleMember => {
			battleMember.clearParamPlus();
			battleMember.clearXParamPlus();
			battleMember.clearSParamPlus();
			range(486, 489).forEach(stateId => battleMember.removeState(stateId));
			battleMember.refresh();
		});
	};

	// Replaces (1x): data/Map003.json:map-event:3:page:2
	removeStateFromListActorsActor20 = function () {
		const actor = $gameActors.actor(20);
		range(1, $dataStates.length - 1)
			.filter(stateId => actor.isStateAffected(stateId))
			.forEach(stateId => actor.removeState(stateId));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:109, data/CommonEvents.json:common-event:110
	addStateToActorFromVariable20 = function (stateId) {
		currentActor().addState(stateId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:329
	addStateToActorFromVariable20Actor1 = function () {
		$gameActors.actor(1).addState(693);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:158
	addStateToActorFromVariable20Var247And207 = function (interp) {
		const exposureOverride = varValue(207);   // 101 = 露出縛りなし
		forEachHeroine(heroineId => {
			let shouldAddState = exposureOverride === 101;
			if (!shouldAddState && exposureOverride >= 1 && exposureOverride === varValue(heroineId + 440)[41]) {
				shouldAddState = true;
			}
			const isExposureShort =
				varValue(heroineId + 380)[4] < varValue(heroineId + 380)[5];
			if (shouldAddState && isExposureShort && $gameParty.members().contains($gameActors.actor(heroineId))) {
				$gameActors.actor(heroineId).addState(78);
			}
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:9
	nameWeaponsFromVariable = function (interp, arrayVariableId, sourceVariableId, sourceValue, metaKey, targetVariableId, targetValue) {
		setSelfVar(interp, arrayVariableId, Array(101).fill(0));
		range(301, 400).forEach(weaponId => {
			const weapon = $dataWeapons[weaponId];
			if (weapon.name !== '') {
				if (weapon.meta['SubstitutionActorId']) {
					varValue(sourceVariableId)[weaponId - 300] = sourceValue;
				}
				if (weapon.meta[metaKey]) {
					varValue(targetVariableId)[weaponId - 300] = targetValue;
				}
			}
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:30, data/CommonEvents.json:common-event:64
	setVariable53 = function (nicknameVariableId, nameVariableId) {
		setVar(53, actorFromVariable(nicknameVariableId).nickname());
		setVar(49, actorFromVariable(nameVariableId).name());
	};

	// Replaces (4x): data/CommonEvents.json:common-event:63, data/CommonEvents.json:common-event:64
	nameActorFromVariable = function (actorId, nameVariableId) {
		$gameActors.actor(actorId).setName(varValue(nameVariableId));
	};

	// Replaces (3x): data/CommonEvents.json:common-event:64
	refreshCurrentActor = function () {
		$gameActors.actor(varValue(CURRENT_ACTOR_VAR)).refresh();
	};

	// Replaces (2x): data/CommonEvents.json:common-event:64
	addPartyActorVar20 = function () {
		$gameParty.addActor(varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:64
	addPartyActor = function (actorVariableId) {
		$gameParty.addActor(varValue(actorVariableId));
	};

	// Replaces (4x): data/CommonEvents.json:common-event:64
	teachSkillToActorFromVariable20 = function (skillId) {
		$gameActors.actor(varValue(CURRENT_ACTOR_VAR)).learnSkill(skillId);
	};

	// Replaces (8x): data/CommonEvents.json:common-event:30, :64, :104, ...
	updatePartyRows = function () {
		$gameParty.updateRows();
	};

	// Replaces (2x): data/CommonEvents.json:common-event:40
	applyEvolvedStateToParty = function () {
		$gameParty.members().forEach(partyMember => {
			if (partyMember.isStateAffected(61) && !partyMember.isStateAffected(71)) {
				partyMember.addState(71);
			}
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	configureActorFromVariable2 = function () {
		// オーバードーズ状態でスイッチオンオフ
		const OVERDOSE_SKILL_ID = 863;
		const OVERDOSE_SWITCH_ID = 502;
		const hasOverdoseSkill = actorFromVariable(2).battleSkillsRaw().includes(OVERDOSE_SKILL_ID);
		$gameSwitches.setValue(OVERDOSE_SWITCH_ID, hasOverdoseSkill);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	syncLearnedSkillSwitches = function () {
		// 主人公性欲度スキルでonoff
		const hero = actorFromVariable(11);
		range(1, 10).forEach(actorId => {
			$gameSwitches.setValue(actorId + 400, hero.isLearnedSkill(actorId + 60));
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	autoOffSkillPersonalSwitch = function (interp) {
		// 習得者不在時に自動でスイッチオフ
		valuePersonalSkill.forEach(skillId => {
			if ($dataSkills[skillId].meta.SwicthOnOffUse && !$gameParty.membersLeSkill(skillId)) {
				skill_personalonoffAutoOff(skillId, 0);
			}
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	autoOffSkillPersonalSwitch2 = function (interp) {
		// 習得者不在時に自動でスイッチオフ
		valuePersonalItem.forEach(itemId => {
			const item = $dataItems[itemId];
			if (item.meta.SwicthOnOffUse && !$gameParty.hasItem(item, true)) {
				skill_personalonoffAutoOff(itemId, 1);
			}
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	readVariable75 = function () {
		// 現在の視点によってスイッチ切り替え
		const currentViewpointActorId = varValue(11);
		forEachDeployedActor(actorId => {
			$gameSwitches.setValue(440 + actorId, actorId === currentViewpointActorId);
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	clearPartyStateCounters = function () {
		$gameParty.members().forEach(partyMember => partyMember.clearStateCounters());
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	applyStateToParty = function () {
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
	restoreStateCountersFromScriptArray = function () {
		const BATTLE_STATE_ID = 82;
		range(0, valueScriptArray1.length - 1).forEach(memberIndex => {
			const savedCounter = valueScriptArray1[memberIndex];
			const partyMember = $gameParty.members()[memberIndex];
			if (savedCounter >= 1 && partyMember.isStateAffected(BATTLE_STATE_ID)) {
				partyMember.setStateCounter(BATTLE_STATE_ID, savedCounter);
			}
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	applyStateToParty2 = function (interp) {
		const battleMembers = $gameParty.battleMembers();
		valueStateBattleClear.forEach(stateId => {
			if (!$gameParty.membersState(stateId)) return;
			battleMembers.forEach(battleMember => {
				if ($gameParty.members().contains(battleMember) && battleMember.isStateAffected(stateId)) {
					battleMember.removeStateCounter(stateId);
				}
			});
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	setValueTotalexp = function () {
		valueTotalexp = 1;
		valueTotalgold = 1;
		valueMaxEnemyLv = 0;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	resetStateTraits = function () {
		range(486, 489).forEach(stateId => {
			const state = $dataStates[stateId];
			state.traits = [{ code: 53, dataId: 6, value: 0.1 }];
		});
		range(490, 497).forEach(stateId => { $dataStates[stateId].traits = []; });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	addStepsFromVariable = function () {
		$gameParty._steps += varValue(290);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:24, data/Map003.json:map-event:131:page:2
	resetSkillUseCounts = function () {
		range(1, $dataSkills.length - 1).forEach(skillId => {
			const skill = $dataSkills[skillId];
			if (!skill.meta['Not Recover All Uses']) return;
			const limitUses = Number(skill.meta['Limit Uses']);
			forEachDeployedActor(actorId => {
				$gameActors.actor(actorId).paySkillLimitedUseCost(skillId, -limitUses);
			});
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:24, data/Map003.json:map-event:131:page:2
	resetStateSpAbilities = function () {
		range(1, $dataStates.length - 1).forEach(stateId => {
			if ($dataStates[stateId].meta['Category'] === ' StateSPabNomal') {
				forEachDeployedActor(actorId => $gameActors.actor(actorId).removeState(stateId));
			}
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	configureActorFromVariable11 = function () {
		const hero = actorFromVariable(11);
		[772, 773].forEach(skillId => {
			const maxMasteryLevel = Number($dataSkills[skillId].meta['Max Mastery Level']);
			if (hero.skillMasteryLevel(skillId) > maxMasteryLevel) {
				hero.setSkillMasteryLevel(skillId, 5);
			}
		});
	};

	/* ============================================================================
	 * Ticker / popups
	 * ========================================================================== */

	// Replaces (4x): data/CommonEvents.json:common-event:42, data/CommonEvents.json:common-event:47
	showTickerNoPendingScenes = function () {
		showTicker('未発生のシーンは存在しません。');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:66
	showTickerNoEpisodesOnThisMap = function () {
		showTicker('条件が変動した為、現在このマップで発生する挿話はありません');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	showTickerNoQuickSaveInBattleMap = function () {
		showTicker('戦闘マップではクイックセーブを行なえません');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	showTickerNoQuickSaveWhileRecalling = function () {
		showTicker('回想中はクイックセーブを行なえません');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	showTickerQuickSavedToFile51 = function () {
		showTicker('ファイル５１にクイックセーブしました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	showTickerQuickSavedToLastFile = function () {
		showTicker('最終使用ファイルにクイックセーブしました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	showTickerQuickSavedToFile1 = function () {
		showTicker('ファイル１にクイックセーブしました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:202
	showTickerBattleSpeedSetToFastest = function () {
		showTicker('戦闘速度を最速に変更しました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:202
	showTickerBattleSpeedSetToFast = function () {
		showTicker('戦闘速度を速いに変更しました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:202
	showTickerBattleSpeedSetToNormal = function () {
		showTicker('戦闘速度を通常に変更しました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:259
	showTickerVariable801 = function () {
		const tickerText = variableText(801);   // variable 801: 文字等代入一時変数820まで (the ticker line)
		showTicker(`${tickerText}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:60
	showInfoPopup = function () {
		const fontColor3 = fontColor(3);
		const talkSet0 = valueTalkSet[0];
		const fontColor0 = fontColor(0);
		showCommonInfo(`Tips:${fontColor3}${talkSet0}${fontColor0}を獲得`);
	};

	// Replaces (1x): data/Map003.json:map-event:3:page:2
	showInfoPopup2 = function () {
		showCommonInfo('60 seconds Waiting…');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:87
	setValueGraphicsWidth = function (graphicsWidth) {
		valueGraphicsWidth = graphicsWidth;
	};

	/* ============================================================================
	 * Switches driven by game state
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:30, data/CommonEvents.json:common-event:221
	setSwitch74 = function () {
		if (!$gameParty.hasItem($dataItems[varValue(240)])) enableSwitch(74);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:37
	setSwitch516 = function () {
		// 変数441(= 1+440)の衣装スロット41が 2 のときだけON
		$gameSwitches.setValue(516, varValue(441)[41] == 2);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:368, :386, :387, :495, :532, :548
	setSwitch161 = function () {
		$gameSwitches.setValue(161, $gameParty.gold() >= 1000000);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:211, data/CommonEvents.json:common-event:215
	setSwitch379 = function (interp) {
		let deployedHeroineCount = 0;
		forEachHeroine(heroineId => {
			if ($gameParty.members().contains($gameActors.actor(heroineId))) {
				enableSwitch(heroineId + 100);
				deployedHeroineCount += 1;
			}
		});
		if (deployedHeroineCount <= 1) enableSwitch(379);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:199
	setSwitch380Var19 = function () {
		const worldMenuEventId = varValue(19);   // variable 19 (scratch): the event the menu opened on
		disableSwitch(380);
		if ($gameMap.event(worldMenuEventId).event().meta['WorldMenu']) enableSwitch(380);
	};

	// Replaces (2x): data/Map003.json:map-event:151:page:1, data/Map003.json:map-event:242:page:1
	setSwitch380 = function (interp) {
		disableSwitch(380);
		const mapId = $gameMap.mapId();
		if (!$gameSelfSwitches.value([mapId, interp._eventId, 'A'])) enableSwitch(380);
		if (!$gameSelfSwitches.value([mapId, interp._eventId, 'B'])) enableSwitch(380);
	};

	// Replaces (2x): data/Map003.json:map-event:133:page:2
	enableSwitchVar327 = function (switchId) {
		const weaponSlotRecords = varValue(327);   // variable 327: 拠点アクティベート記録配列 (per-slot activation records)
		const unlockedWeaponCount = range(1, 100).filter(slotIndex => weaponSlotRecords[slotIndex] >= 1).length;
		if (unlockedWeaponCount >= 2) enableSwitch(switchId);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:103, :300, :301
	enableSwitch = function (switchId) {
		$gameSwitches.setValue(switchId, true);
	};

	// Replaces (8x): data/CommonEvents.json:common-event:105, :109, :141, :184, :381, Map007.json:map-event:3:page:1, ...
	disableSwitch = function (switchId) {
		$gameSwitches.setValue(switchId, false);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:299
	// Quest-target movement lock: while the main quest progress (variable 135)
	// matches an entry of the in-map quest-progress list (variable 173), switch 414
	// ("movement blocked") is ON — and OFF again when this event's <MQProgress>
	// note equals that entry, i.e. when this event is the quest target itself.
	setSwitch414 = function (interp) {
		const questProgressList = varValue(173);
		const mainQuestProgress = varValue(135);
		const currentMapEvent = $gameMap.event(interp._eventId).event();
		questProgressList.forEach((questProgressId) => {
			if (mainQuestProgress != questProgressId) return;
			$gameSwitches.setValue(414, true);
			if (currentMapEvent.meta['MQProgress'] && Number(currentMapEvent.meta['MQProgress']) == questProgressId) {
				$gameSwitches.setValue(414, false);
			}
		});
	};

	/* ============================================================================
	 * Parallel events, common-event helpers and pictures (core)
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:192
	startParallelEvent = function (interp) {
		if (valueCountSet1 !== 0) event_pararelStarting(1, valueCountSet1, interp._eventId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:5, data/Map003.json:map-event:133:page:2
	spawnScreenParticleStatue_orb_c = function (interp) {
		spawnStatueOrbParticle(interp, -35);
	};

	// Replaces (2x): data/Map003.json:map-event:233:page:1, data/Map022.json:map-event:9:page:1
	spawnScreenParticleStatue_orb_c2 = function (interp) {
		spawnStatueOrbParticle(interp, -35 - 48);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:15
	movePictureKeepingScale = function (opacity, duration) {
		movePictureRetainingScale(94, 0, opacity, duration);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:15
	movePictureKeepingScale2 = function () {
		movePictureRetainingScale(95, -90, null, 1);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:89
	spawnScreenParticleSpriteset = function (particleName) {
		$gameScreen._particle.particleSet(0, particleName, 'screen', 'def', 'spriteset');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:343
	// Spawns the monster and the magic-circle particle of a spawned-event slot.
	// NOTE: the original re-declared `particleName2` for the second particle — the
	// two names are spelled out here instead.
	spawnScreenParticleVar292 = function (slotIndex) {
		const particleValue = spawnedEventId(slotIndex);
		const monsterParticle = 'monster_c';
		const magicCircleParticle = 'mahoujin_c';
		particleSet(particleValue, `${monsterParticle}-${particleValue}`, 'this', monsterParticle);
		particleSet(particleValue, `${magicCircleParticle}-${particleValue}`, 'this', magicCircleParticle);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:86, data/CommonEvents.json:common-event:245
	playScreenParticle = function (particleName, particleDefinitionName, particleDefinition) {
		particlePlay(0, particleName, particleDefinitionName, 'def', particleDefinition);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:87
	updateScreenParticle = function () {
		particleUpdate(['hStates_bodyShine1', 'emitterLifetime', 1]);
		particleClear('hStates_bodyShine1');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:33:page:1
	clearScreenParticleAll = function () {
		particleClear('all');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1
	particleEditParticle = function (particleName) {
		$gameScreen._particle.particleEdit(0, particleName, 'picture:57', 'def', 'above');
	};

	// Replaces (2x): data/Map003.json:map-event:20:page:1, data/Map003.json:map-event:133:page:2
	clearScreenParticle = function (interp, particleName) {
		particleClear(`${particleName}-${interp._eventId}`);
	};

	// Replaces (14x): data/CommonEvents.json:common-event:5, :23, :42, :65, :87, :89, ...
	hideWindow = function (windowId) {
		WindowManager.hide(windowId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:87
	hideWindow2 = function () {
		[1, 2, 3].forEach(windowId => WindowManager.hide(windowId));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	hideWindow3 = function () {
		[1, 2].forEach(windowId => WindowManager.hide(windowId));
	};

	// Replaces (9x): data/CommonEvents.json:common-event:87, :166, :203, :238, :239, :241, ...
	hideAllWindows = function () {
		WindowManager.hideAll();
	};

	// Replaces (3x): data/CommonEvents.json:common-event:5, data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	setSelfVariable21 = function (interp) {
		// NOTE: `arr` is the shared pool in global scope, and variable 21 holds the
		//       *same array reference*.  The trailing reset is kept verbatim — an
		//       array is never == 0, so it is dead code in the original as well.
		const pickedCharacterId = arr[getRandomIndex(arr.length)];
		const pickedIndex = arr.findIndex(poolId => poolId === pickedCharacterId);
		if (pickedIndex >= 0) arr.splice(pickedIndex, 1);
		setSelfVar(interp, 21, arr);
		if (arr == 0) arr = [1, 2, 3, 4, 5];
	};

	// Replaces (1x): data/CommonEvents.json:common-event:5
	eraseNpcEvents = function () {
		eraseEventsWithMetaKeys(['NPC', '動物', 'Encounter Direction Lock']);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:37
	eraseNpcEvents2 = function () {
		eraseEventsWithMetaKeys(['NPC', 'Animal', 'Encounter Direction Lock']);
	};

	/* ============================================================================
	 * Messages / windows
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:87
	appendMessageTextVar20 = function (interp) {
		$gameMessage.newPage();
		const actorProfile = currentActor().profile();
		$gameMessage.add(`${instantText()}${actorProfile}`);
		interp.setWaitMode('message');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:87
	appendMessageTextVar20_2 = function (interp) {
		$gameMessage.newPage();
		const textSpeed0 = textSpeed(0);
		const actorProfile = currentActor().profile();
		$gameMessage.add(`${textSpeed0}${actorProfile}`);
		interp.setWaitMode('message');
	};

	// Replaces (8x): data/CommonEvents.json:common-event:401, :414, :444, ...
	setMessageRowCount = function (rowCount) {
		$gameMessage.setMessageRow(rowCount);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:23
	drawWindowText = function () {
		const fontSize22 = fontSize(22);
		const endOfDayInfoText = variableText(539);   // variable 539: 一日終了時情報表示文字列変数
		WindowManager.drawText(1, `${fontSize22}${endOfDayInfoText}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:23
	drawWindowText2 = function () {
		const fontSize28 = fontSize(28);
		const endOfDayInfoText = variableText(539);   // variable 539: 一日終了時情報表示文字列変数
		WindowManager.drawText(1, `${fontSize28}${endOfDayInfoText}`);
	};

	// Replaces (1x): data/Map003.json:map-event:161:page:1
	drawWindowText3 = function () {
		WindowManager.drawText(0, '');
	};

	/* ============================================================================
	 * System / misc
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:16, data/CommonEvents.json:common-event:205
	refreshPlayer = function () {
		$gamePlayer.refresh();
		$gameMap.requestRefresh();
	};

	// Replaces (1x): data/CommonEvents.json:common-event:161
	refreshPlayer2 = function () {
		$gamePlayer.refresh();
	};

	// Replaces (2x): data/Map003.json:map-event:3:page:2, data/Map003.json:map-event:16:page:1
	refreshMinimapCache = function () {
		$gameMap.refreshMinimapCache();
	};

	// Replaces (2x): data/CommonEvents.json:common-event:22, data/CommonEvents.json:common-event:23
	clearJuseiFlag = function () {
		// 受精してるキャラ以外の受精相手記録を消滅
		jusei_clear();
	};

	// Replaces (2x): data/CommonEvents.json:common-event:23, data/CommonEvents.json:common-event:25, :30, :54
	setPlayerPosition2 = function (variableId, mapId, x, y, eventId) {
		setVar(variableId, [mapId, x, y]);
		set_playerPosition2(eventId);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:29, data/CommonEvents.json:common-event:40
	setValueMenuCloth = function (menuClothId) {
		valueMenuCloth = menuClothId;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:29, data/CommonEvents.json:common-event:30
	setVariable71Var185_2 = function (tickerFrames, tickerYOffset) {
		setTickerDisplayTime(tickerFrames, tickerYOffset);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:77, data/CommonEvents.json:common-event:78
	readVariable706 = function (interp, randomRange) {
		const baseWait = varValue(706)[3];
		interp.wait(getRandomIndex(randomRange) + baseWait - 30);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:78
	waitFrames = function (interp, frameCount) {
		interp.wait(frameCount);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:301
	respawnMapNpc = function (npcSlotId) {
		range(1, 5).forEach(() => {
			setVar(33, 'BB_akunin');
			setVar(35, 3);
			setVar(37, getRandomIndex(3) + 2);
			setVar(34, getRandomIndex(2) + 4);
			map_npcRespawn(1, npcSlotId);
		});
	};

	// Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	readVariable69 = function () {
		const coinAmountText = varValue(69).toLocaleString();   // variable 69 (scratch): coin count
		const coinText = `Coin: ${coinAmountText}枚`;
		$gameScreen.setDTextPicture(coinText, 28);
		$gameScreen.dWindowFrame = 'ON';
		showPic(99, '', 640 + 50, 50, 100, 100, 0, 1);
		movePic(99, 640, 50, 100, 100, 255, 60, 1);
	};

	// Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	showDiceBackground = function () {
		showPic(98, '/img/dice/background', 640 + 50, 384, 100, 100, 0, 1);
		movePic(98, 640, 384, 100, 100, 255, 30, 1);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:37
	noop = function () {
		// original_autoEventFlag();
	};
	/* ============================================================================
	 * Talk layouts, cut-ins, child interpreters
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:14
	setPicture = function (presetIndex) {
		const presetValues = pic_setArray3;
		valuePicWait2 = presetValues[2] + Math.floor(Math.random() * (presetValues[3] * 2 + 1)) - presetValues[3];
		pic_set(presetValues[1], presetValues[0], presetValues[presetIndex], valuePicWait2);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:14, data/CommonEvents.json:common-event:17
	playParallelPictureSeName = function () {
		const [seName, minVolume, minPitch] = valueParallelPicSe1;
		if (seName != 0) {
			AudioManager.playSe({
				name: seName,
				volume: getRandomIndex(11) + Number(minVolume),
				pitch: getRandomIndex(21) + Number(minPitch),
				pan: 0,
			});
		}
	};

	// Replaces (2x): data/CommonEvents.json:common-event:17
	waitRandomPictureDelay = function (interp) {
		if (valuePicWait >= 1) interp.wait(valuePicWait + getRandomIndex(3));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:17
	slidePictureInFromRightAndWait = function (interp, duration, waitFrames) {
		const SLIDE_PICTURE_ID = 55;   // 53 + 2
		movePic(SLIDE_PICTURE_ID, 640 + 50 - 128, 384, 100, 100, 240, duration, 1);
		interp.wait(waitFrames);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:17
	slidePictureInFromLeftAndWait = function (interp, duration, waitFrames) {
		const SLIDE_PICTURE_ID = 55;   // 53 + 2
		movePic(SLIDE_PICTURE_ID, 640 - 50 - 128, 384, 100, 100, 240, duration, 1);
		interp.wait(waitFrames);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:60
	setValueTalkSet = function () {
		valueTalkSet = 0;
		valueTalkarr1 = [];
	};

	// Replaces (1x): data/CommonEvents.json:common-event:60
	setPictureLocationAndMovePicture1 = function (stateId, facePathSuffix, removeStateId) {
		const talkParams = valueTalkSet;
		const talkActor = $gameActors.actor(talkParams[1]);
		if (talkParams[0] == 1) talkActor.addState(stateId);
		if (talkParams[0] == 2) pic_locationSet(91, 92, `/img/talkface/${talkParams[1]}${facePathSuffix}`, 60, 0);
		if (talkParams[0] == 0) {
			talkActor.removeState(removeStateId);
			pic_move1(92, 0, 0, 100, 100, 0, 120);
		}
	};

	// Replaces (2x): data/CommonEvents.json:common-event:60
	fadePicture1Pic101 = function () {
		showScreenBlackOut(101, valueTalkSet[3]);
		picture_fade1(101, 'fadeIn', valueWipeImg, 60, 5);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:60
	configurePictureEasing = function () {
		picture_easingConfiguration('easeOutQuad');   // 通常顔グラ演出
	};

	// Replaces (2x): data/CommonEvents.json:common-event:60, data/Map007.json:map-event:4:page:1
	configurePictureEasing2 = function (easingType) {
		picture_easingConfiguration(easingType);
	};

	// Replaces (1x): data/Map003.json:map-event:3:page:1
	configurePictureEasing3 = function () {
		picture_easingConfiguration('easeOutQuad');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1
	configurePictureEasingEaseInOutQuad = function () {
		picture_easingConfiguration('easeInOutQuad');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:61, data/CommonEvents.json:common-event:62
	setupChildInterpreterVar131 = function (interp, value) {
		// ｺﾓﾝID・変数ID
		setSelfVar(interp, 131, value);
		setSelfVar(interp, 14, 1);
		[121, 122, 123].forEach(variableId => setSelfVar(interp, variableId, 0));
		runCommonEventAsChild(interp, varValue(131));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:212
	setupChildInterpreterVar131_2 = function (interp, value, variableId) {
		setSelfVar(interp, 131, 64);
		setSelfVar(interp, 14, value);
		setSelfVar(interp, 121, 0);
		setSelfVar(interp, 122, 0);
		setSelfVar(interp, variableId, 0);
		runCommonEventAsChild(interp, varValue(131));
	};

	// Replaces (4x): data/CommonEvents.json:common-event:64, data/CommonEvents.json:common-event:401, data/Map100.json:map-event:11:page:1
	setupChildInterpreter = function (interp, variableId, value, commonEventId) {
		setSelfVar(interp, variableId, value);
		runCommonEventAsChild(interp, commonEventId);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:64, :373, Map054.json:map-event:2:page:1..4, ...
	setupChildInterpreter2 = function (interp, value) {
		setSelfVar(interp, 14, value);   // パーティ一時解散コモン
		runCommonEventAsChild(interp, 64);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:530, Map081.json:map-event:3:page:1, Map083.json:map-event:6:page:1
	setupChildInterpreter14 = function (interp) {
		setSelfVar(interp, 14, 22);   // パーティ再結成コモン
		runCommonEventAsChild(interp, 64);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	setupChildInterpreter18 = function (interp) {
		runCommonEventAsChild(interp, 64);
		setSelfVar(interp, 14, 21);   // パーティ一時解散コモン
	};

	// Replaces (7x): data/CommonEvents.json:common-event:368, :410, :495, :532, :548, :571, ...
	setupChildInterpreter9 = function (interp) {
		runCommonEventAsChild(interp, 19);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:342, data/CommonEvents.json:common-event:364
	setupChildInterpreter8 = function (interp, value) {
		// 仲間加入コモン
		setSelfVar(interp, 14, 19);
		setSelfVar(interp, 20, value);
		setSelfVar(interp, 121, 0);
		runCommonEventAsChild(interp, 64);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:330, data/CommonEvents.json:common-event:331
	setupChildInterpreterVar171 = function (interp) {
		setVar(171, [41, 32, 11]);
		runCommonEventAsChild(interp, 54);
	};

	// Replaces (1x): data/Map007.json:map-event:3:page:1
	applyMapShockwaveFilter = function (filterName, waveWidth, waveHeight, wavePower, speed, additionalTime) {
		$gameMap.createFilter(filterName, 'shockwave', 0, 'screen');
		$gameMap.setFilter(filterName, [640, waveWidth, -1, waveHeight, wavePower, speed]);
		$gameMap.setFilterAddiTime(filterName, additionalTime);
	};

	// Replaces (2x): data/Map007.json:map-event:3:page:1
	setupChildInterpreter17 = function (interp, value) {
		setSelfVar(interp, 20, 1);
		setSelfVar(interp, 21, value);
		setSelfVar(interp, 22, -400);
		runCommonEventAsChild(interp, 141);
	};

	// Replaces (2x): data/Map007.json:map-event:5:page:1
	setupChildInterpreter19 = function (interp, value) {
		setSelfVar(interp, 14, value);   // Ｈ効果
		runCommonEventAsChild(interp, 58);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:120, data/CommonEvents.json:common-event:188, data/CommonEvents.json:common-event:196
	setupChildInterpreter3 = function (interp, randomXRange, randomXOffset, randomYRange, randomYOffset, randomSpeedBase) {
		setSelfVar(interp, 14, 26);
		setSelfVar(interp, 121, interp._eventId);
		setSelfVar(interp, 122, getRandomIndex(8) + 8);
		setSelfVar(interp, 123, 5);
		setSelfVar(interp, 124, 1);   // アニメid
		setSelfVar(interp, 125, getRandomIndex(randomXRange) - randomXOffset);
		setSelfVar(interp, 126, getRandomIndex(randomYRange) - randomYOffset);
		setSelfVar(interp, 127, getRandomIndex(2) + randomSpeedBase);
		setSelfVar(interp, 128, getRandomIndex(2) + 0);
		setSelfVar(interp, 129, getRandomIndex(181) + 0);
		runCommonEventAsChild(interp, 64);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:120, data/CommonEvents.json:common-event:121
	readBranchResult = function (interp) {
		$result = interp._branch[interp._indent];
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:452
	setupChildInterpreter6 = function (interp, value) {
		setSelfVar(interp, 172, value);
		valueTalkSet = [1, 1];   // 1で付与2で直接表示 \CE[60]のみ0で解除, ｱｸﾀｰid
		runCommonEventAsChild(interp, 60);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:368, :495, :532, :548, Map041.json:map-event:7:page:1, Map083.json:map-event:6:page:1
	setupChildInterpreter10 = function (interp, talkLine) {
		// 中央に一言メッセージ, 何行でも良し
		setSelfVar(interp, 23, talkLine);
		const talkLineText = variableText(23);   // variable 23: 乱数汎用3 (here: the one-line talk text)
		showOneLineTalk(interp, 19, [1, 28, `${talkLineText}`, 100]);
	};

	/* ============================================================================
	 * Cut-ins / plugin commands
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:101
	runPluginCommandCutInCG_EnemyDefeat = function (interp) {
		requestCutIn(interp, '敵カットイン', ['カットインエネミー演出色々', 'CutInCG_EnemyDefeat', 0, 2.0, 2.0, 25, 60]);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:104
	runPluginCommandVar20 = function (interp) {
		const cutInImageName = `Zev_BattleMasturbation${varValue(CURRENT_ACTOR_VAR)}_1`;
		requestCutIn(interp, '味方カットイン', ['Ｈシーン演出', cutInImageName, 270, 1.5, 1.2, 25, 60]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:104, data/CommonEvents.json:common-event:140
	prepareCutInVar20 = function (interp, pictureId) {
		prepareCutIn(interp, '味方カットイン', pictureId, varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:140
	prepareCutInVar20_2 = function (interp) {
		prepareCutIn(interp, '敵カットイン', 0, varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:129
	prepareCutInVar20_3 = function (interp) {
		prepareCutIn(interp, '敵カットイン', 8, varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (2x): data/Map003.json:map-event:81:page:1, data/Map003.json:map-event:82:page:1
	prepareCutInVar20_4 = function (interp) {
		prepareCutIn(interp, '味方カットイン', 7, varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:138
	prepareCutInVar182And20 = function (interp) {
		setVar(182, 13);
		prepareCutIn(interp, '味方カットイン', 1, varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:138
	prepareCutInVar182 = function (interp, cutInSlotId) {
		setVar(182, 13);
		prepareCutIn(interp, '味方カットイン', 1, cutInSlotId);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:64
	runPluginCommandShowInfo = function (interp) {
		runShowInfoPlugin(interp, 'パーティが再集合されました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:64
	runPluginCommandShowInfo2 = function (interp) {
		runShowInfoPlugin(interp, 'パーティが一時解散されました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:73
	runPluginCommandShowInfo3 = function (interp) {
		const autosaveFileName = variableText(509);   // variable 509: [NoReset]オートセーブ指定変数
		runShowInfoPlugin(interp, `ファイル${autosaveFileName}にオートセーブしました`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:73
	runPluginCommandShowInfo4 = function (interp) {
		runShowInfoPlugin(interp, 'ファイル51にオートセーブしました');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	runPluginCommandFadeImg = function (interp, imageName) {
		callPluginCommand(interp, 'GWTrans_Setting', 'FadeImg', imageName);
		callPluginCommand(interp, 'GWTrans_Setting', 'FadeInImg', imageName);
		callPluginCommand(interp, 'GWTransition', 'on');
	};

	// Replaces (3x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1, data/Map007.json:map-event:17:page:1
	runPluginCommand153 = function (interp) {
		// 一刀両断102崩壊161横両断008封印054内側から153
		callPluginCommand(interp, 'GWFade', 'character', '0', 'fadeOut', '153', '180', '5');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	runPluginCommand = function (interp) {
		[86, 87].forEach(variableId => setSelfVar(interp, variableId, 3));
		setSelfVar(interp, 245, 40);
		setSelfVar(interp, 246, 80);
		setSelfVar(interp, 251, 'testピクチャ');
		callPluginCommand(interp, '味方カットイン', 'Ｈシーン演出');
	};

	/* ============================================================================
	 * Battle / victory
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:102
	setValueBattleSexCountArr = function () {
		valueBattleSexCountArr = Array(21).fill(0);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	setSideViewBattle = function () {
		$dataSystem.optSideView = true;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	setValueCollapseAnime = function () {
		valueCollapseAnime = 0;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:104
	setValueChainAddPower = function () {
		valueChainAddPower = 0;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:104, data/CommonEvents.json:common-event:129
	runBossActionPattern1 = function () {
		const boss = $gameTroop.members()[0];
		if (boss.isStateAffected(410) && boss.isAlive() && !boss.isRestricted()) {
			enableSwitch(470);
			boss_actionPattarn1(boss);
			disableSwitch(470);
		}
	};

	// Replaces (2x): data/CommonEvents.json:common-event:105, data/CommonEvents.json:common-event:122
	countDefeatedEnemyVar240 = function (defeatCountVariableId) {
		const dungeonInfoItemId = varValue(240);   // variable 240: ダンジョン毎情報アイテム指定変数
		if (dungeonInfoItemId >= 1) varValue(defeatCountVariableId)[dungeonInfoItemId] += 1;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:109
	setVariable703 = function () {
		const enemyMovePosition = varValue(703);   // variable 703: 拘束時敵移動一時配列
		if (!$dataSystem.optSideView) return;
		if (enemyMovePosition == 0) return;
		// TODO: original bug — 92/703 are not documented arrays; kept verbatim.
		$gameTroop.set(varValue(92) + 1, enemyMovePosition[0], enemyMovePosition[1], 30);
		setVar(703, 0);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:110, data/Map003.json:map-event:218:page:2
	grantHExp1AndGrantHExp1Extra = function (interp, vaginalExp, analExp, fellatioExp, affectionExp, inseminationCount) {
		//     膣,経,フ,ア,自,絶
		h_exp1(vaginalExp, analExp, 0, 0, 0, 0);
		//     和,強,異,輪,乱,露
		h_exp2(0, fellatioExp, affectionExp, 0, 0, 0);
		//     セ,乳,尻,失,潮,売,妊,子,中,ア,口(射精先)
		h_exp3(0, 0, 0, 0, 0, 0, 0, 0, inseminationCount, 0, 0);
		//     膣,尻,口,感,露,精,性,奉,売
		h_exp4(0, 0, 0, 0, 0, 0, 0, 0, 0);
		runCommonEventAsChild(interp, 85);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:120
	setValueWordSet1 = function () {
		valueWordSet1 = 0;
		valueWordSet2 = 0;
		valueWordSet3 = 0;
	};

	// Replaces (6x): data/CommonEvents.json:common-event:120, :121, :300
	setValueVictoryResult = function (victoryResult) {
		valueVictoryResult = victoryResult;
	};

	// Replaces (13x): data/CommonEvents.json:common-event:119, :122, Map035.json:map-event:20:page:1, ...
	countBossEnemyDefeat = function (defeatCountVariableId) {
		varValue(defeatCountVariableId)[valueBossEnemyId] += 1;
	};

	// Replaces (7x): data/CommonEvents.json:common-event:119, :122, Map035.json:map-event:20:page:1, ...
	setValueBossAddLevel = function () {
		valueBossAddLevel = 0;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:122, data/CommonEvents.json:common-event:297
	openVictoryTreasureBox1AndOpenVictoryTreasureBox2 = function () {
		if (valueMaxEnemyLv < 1) return;
		const treasureBoxCount = Math.ceil(valueMaxEnemyLv / 10);
		range(1, treasureBoxCount).forEach(() => {
			enemywin_treasurebox1(valueBossId);
			if (varValue(160)[4] >= 1) enemywin_treasurebox2(valueBossId);
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:120
	forceCharacterMoveRouteVar240 = function (interp) {
		const enemyGraphicParts = $dataItems[varValue(240)].meta.EnemyGraphic.split(',');
		interp.character(0).forceMoveRoute({
			list: [
				{ code: 41, parameters: [enemyGraphicParts[0], Number(enemyGraphicParts[1])] },
				{ code: 15, parameters: [10] },
				{ code: 45, parameters: ['this.setAngle([-45,45,-90,90][getRandomIndex(4)]);'] },
				{ code: 32 }, { code: 34 }, { code: 35 }, { code: 37 },
				{ code: 0 },
			],
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:64
	forceCharacterMoveRouteVar121And122Etc = function (interp) {
		interp.character(varValue(121)).forceMoveRoute({
			list: [
				{ code: 36 }, { code: 37 },
				{ code: 29, parameters: [varValue(122)] },
				{ code: 30, parameters: [varValue(123)] },
				{ code: 45, parameters: ['this.requestAnimation($gameVariables.value(124));'] },
				{ code: 45, parameters: ['this.jumpEx($gameVariables.value(125),$gameVariables.value(126),$gameVariables.value(127),$gameVariables.value(128));'] },
				{ code: 25 }, { code: 32 }, { code: 34 }, { code: 35 },
				{ code: 0 },
			],
			repeat: false,
			skippable: true,
		});
		interp._character = interp.character(varValue(121));
		interp.setWaitMode('route');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:161
	forceCharacterMoveRouteVar11And21Etc = function (interp) {
		interp.character(-1).forceMoveRoute({
			list: [
				{ code: 41, parameters: [`${varValue(11)}_${varValue(21)}`, varValue(22)] },
				{ code: 38 }, { code: 29, parameters: [4] }, { code: 31 }, { code: 33 }, { code: 0 },
			],
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:259
	forceCharacterMoveRouteVar292 = function (eventSlotIndex, moveRouteScript) {
		spawnedEvent(eventSlotIndex).forceMoveRoute({
			list: [
				{ code: 45, parameters: [moveRouteScript] },
				{ code: 0 },
			],
			repeat: false,
			skippable: true,
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:259
	forceCharacterMoveRouteVar292_2 = function (firstMoveRouteScript, secondMoveRouteScript) {
		spawnedEvent(12).forceMoveRoute({
			list: [
				{ code: 45, parameters: [firstMoveRouteScript] },
				{ code: 45, parameters: [secondMoveRouteScript] },
				{ code: 0 },
			],
			repeat: false,
			skippable: true,
		});
	};

	// Replaces (3x): data/CommonEvents.json:common-event:303, :324, :471
	forceCharacterMoveRouteVar292_3 = function (firstSlotIndex, lastSlotIndex, moveRouteScript) {
		range(firstSlotIndex, lastSlotIndex).forEach(slotIndex => {
			spawnedEvent(slotIndex).forceMoveRoute({
				list: [
					{ code: 45, parameters: ['this.startOpacity(60,0);'] },
					{ code: 45, parameters: [moveRouteScript] },
					{ code: 0 },
				],
				repeat: false,
				skippable: true,
			});
		});
	};

	/* ============================================================================
	 * Party / costume stat blocks
	 * ========================================================================== */

	// Replaces (4x): data/CommonEvents.json:common-event:106, :111, :112, :167
	loadPartyStatBlockVar20 = function () {
		// 現在衣装を呼び出し
		forEachCostumeSlot(slotIndex => {
			setVar(slotIndex + 460, varValue(varValue(CURRENT_ACTOR_VAR) + 440)[slotIndex]);
		});
	};

	// Replaces (3x): data/CommonEvents.json:common-event:106, :111, :112
	loadPartyStatBlock = function (interp) {
		// 一時代入した仮情報を立ち絵指定後に反映
		forEachCostumeSlot(slotIndex => {
			if (varValue(slotIndex + 560) >= 1) setSelfVar(interp, slotIndex + 460, varValue(slotIndex + 560));
		});
	};

	// Replaces (3x): data/CommonEvents.json:common-event:106, :111, :112
	savePartyStatBlockVar20 = function () {
		// 衣装情報を更新
		forEachCostumeSlot(slotIndex => {
			varValue(varValue(CURRENT_ACTOR_VAR) + 440)[slotIndex] = varValue(slotIndex + 460);
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:167
	// Class-2 twin of `savePartyStatBlockVar20` above — same slot copy, folded into it.
	savePartyStatBlockVar20_2 = savePartyStatBlockVar20;

	// Replaces (2x): data/CommonEvents.json:common-event:167
	setVariable0 = function () {
		// 現在衣装を初期化
		forEachCostumeSlot(slotIndex => {
			if (slotIndex != 4) setVar(slotIndex + 460, 0);
		});
	};

	// Replaces (3x): data/CommonEvents.json:common-event:167
	writeVariableArraySlotVar20And19Etc = function () {
		const currentActorId = varValue(CURRENT_ACTOR_VAR);
		varValue(currentActorId + 440)[41] = Number($dataItems[varValue(19)].meta['TotalCloth']);
		varValue(348)[currentActorId] = varValue(currentActorId + 440)[41];
	};

	// Replaces (3x): data/CommonEvents.json:common-event:167
	saveCharacterIdToStatBlock = function () {
		varValue(varValue(CURRENT_ACTOR_VAR) + 440)[0] = varValue(19);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:167
	configureActorFromVariable20 = function (interp) {
		const currentActorId = varValue(CURRENT_ACTOR_VAR);
		const icon155 = icon(155);
		const costumeStatusIcon = `${icon155}`;
		const actorName = currentActor().name();
		const exposureValue = varValue(currentActorId + 380)[4];   // 380+actorId slot 4: exposure value
		const exposureLimit = varValue(currentActorId + 380)[5];   // 380+actorId slot 5: exposure limit
		setSelfVar(interp, 519,
			`${actorName}　${costumeStatusIcon}:` +
			`${exposureValue}` +
			`(${exposureLimit})\n`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:256
	setWeaponNameOrNone = function (weaponSlotIndex, hasWeaponSwitchId, weaponNameVariableId, weaponIndex, noWeaponSwitchId, noWeaponVariableId) {
		if (varValue(varValue(CURRENT_ACTOR_VAR) + 380)[weaponSlotIndex] != 0) {
			enableSwitch(hasWeaponSwitchId);
			setVar(weaponNameVariableId, $dataWeapons[varValue(varValue(CURRENT_ACTOR_VAR) + 380)[weaponIndex]].name);
		} else {
			disableSwitch(noWeaponSwitchId);
			setVar(noWeaponVariableId, 'なし');
		}
	};

	// Replaces (2x): data/CommonEvents.json:common-event:256
	clearWeaponSlot = function (weaponSlotIndex) {
		varValue(varValue(CURRENT_ACTOR_VAR) + 380)[weaponSlotIndex] = 0;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:205
	setWeaponUnique = function (interp) {
		forEachHeroine(heroineId => {
			$dataWeapons[heroineId + 200].name = varValue(heroineId + 380)[50];
			weapon_uniqueSet(heroineId);
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:241
	setWeaponUniqueAndAddWeaponUnique = function (setValue) {
		const actorVariableId = varValue(CURRENT_ACTOR_VAR);
		const weaponId = actorVariableId + 80;
		weapon_uniqueSet(actorVariableId);
		valueCountSet3 = setValue;
		weapon_uniqueAdd(weaponId);
		WindowManager.show(0, 270, 80, 1010, 450);
		const weaponIcon = weaponIconName(weaponId);
		const weaponNoteText = variableText(801);   // variable 801: 文字等代入一時変数820まで (the weapon note)
		WindowManager.drawText(0, `${weaponIcon}\n${weaponNoteText}\n※付与効果は強化の度に選択/追加されていきます。`);
	};

	/* ============================================================================
	 * Battle log / popups
	 * ========================================================================== */

	// Replaces (3x): data/CommonEvents.json:common-event:106, data/CommonEvents.json:common-event:109
	pushBattleLogTextVar20 = function () {
		pushActorBattleLog('は拘束された！');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:109
	pushBattleLogTextVar20_2 = function () {
		pushActorBattleLog('は襲い掛かられた！');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:109
	pushBattleLogTextVar20_3 = function () {
		pushActorBattleLog('は拘束から逃れた！');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:110
	pushBattleLogTextVar20_4 = function () {
		pushActorBattleLog('は犯されている…。');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:111, data/CommonEvents.json:common-event:112
	showInfoPopupVar20 = function () {
		const actorName = currentActor().name();
		showInfoOrBattleLog(`しかし${actorName}は既に全裸であった…`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:112
	showInfoPopupVar20_2 = function () {
		const exposureValue = value1;
		const actorName = currentActor().name();
		showInfoOrBattleLog(`しかし${actorName}には効果が無かった。　（現在露出値:${exposureValue}）`);
	};

	/* ============================================================================
	 * Parallel / map events
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:288
	startParallelEventVar135Actor5Switch474 = function () {
		if (varValue(135) !== 12) return;
		if (!$gameSwitches.value(233)) return;   // 教会
		if ($gameActors.actor(5).level < 10) return;
		event_pararelStarting(0, 313, 0);
		enableSwitch(474);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:288
	startParallelEventVar135And642Switch474 = function () {
		if (varValue(135) !== 11) return;
		if ($gameMap.mapId() !== 96) return;
		if (varValue(642) < 10) return;
		event_pararelStarting(0, 312, 0);
		enableSwitch(474);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:288
	setValueGetInfoPointX = function (getInfoPointX) {
		valueGetInfoPointX = getInfoPointX;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:298
	playScreenParticleWing_r2 = function () {
		spawnWingParticle(2);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:300, :301, :349
	playScreenParticleWing_r2_2 = function (interp) {
		spawnWingParticle(interp._eventId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:190, data/CommonEvents.json:common-event:195
	spawnMapEvent = function () {
		const animalEvent = $gameMap.event(valueanimalEventId);
		$gameMap.spawnEvent(99, animalEvent.x, animalEvent.y, true);
		const spawnedAnimalEvent = $gameMap.event($gameMap.getLastSpawnEventId());
		spawnedAnimalEvent.startScale(10, 50, 50);
		spawnedAnimalEvent._priorityType = 0;
		spawnedAnimalEvent.setOpacity(150);
	};

	// Replaces (2x): data/Map085.json:map-event:2:page:1, data/Map085.json:map-event:3:page:1
	spawnMapEvent2 = function (interp) {
		const sourceEvent = $gameMap.event(interp.eventId());
		$gameMap.spawnEvent(190, sourceEvent.x, sourceEvent.y, true);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:259, :338, :361
	spawnMapEventVar292 = function (slotIndex, posX, posY, opacity) {
		$gameMap.spawnEvent(146, posX, posY, true);
		varValue(SPAWNED_EVENT_TABLE_VAR)[slotIndex] = $gameMap.getLastSpawnEventId();
		spawnedEvent(slotIndex).setOpacity(opacity);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:544, data/CommonEvents.json:common-event:545
	spawnMapEventVar163And535 = function () {
		const npcPreset = currentNpcPreset();
		$gameMap.spawnEvent(236, npcPreset[8], npcPreset[9], true);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:184, data/Map003.json:map-event:20:page:1, data/Map003.json:map-event:133:page:2
	bindInterpreterToValueCountSet9 = function (interp) {
		interp._eventId = valueCountSet9;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:188
	bindInterpreterToValueEnemyEventId = function (interp) {
		interp._eventId = valueEnemyEventId;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:189, :190, :196
	bindInterpreterToValueanimalEventId = function (interp) {
		interp._eventId = valueanimalEventId;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:359, :361
	bindInterpreterToValueBossId = function (interp) {
		interp._eventId = valueBossId;
	};

	// Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
	bindInterpreterToValueThisEventId = function (interp) {
		if (valueThisEventId >= 1) interp._eventId = valueThisEventId;
	};

	// Replaces (5x): data/Map003.json:map-event:16:page:1..3 etc.
	storeValueEnemyEventIdFromEvent = function (interp) {
		valueEnemyEventId = interp.eventId();
	};

	// Replaces (2x): data/Map003.json:map-event:20:page:1, data/Map003.json:map-event:133:page:2
	storeValueCountSet9FromInterpreter = function (interp) {
		valueCountSet9 = interp._eventId;
		interp._eventId = varValue(SPAWNED_EVENT_TABLE_VAR)[0];
	};

	// Replaces (10x): data/Map003.json:map-event:156:page:1, ... Map035.json:map-event:20:page:1, ...
	storeValueBossIdFromInterpreter = function (interp) {
		valueBossId = interp._eventId;
	};

	// Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
	storeThisEventIdOrClear = function (interp) {
		valueThisEventId = interp._eventId >= 1 ? interp._eventId : 0;
	};

	/* ============================================================================
	 * Erasing spawned events
	 * ========================================================================== */

	// Replaces (3x): data/CommonEvents.json:common-event:184, Map003.json:map-event:20:page:1, Map003.json:map-event:133:page:2
	writeVariableArraySlotVar292 = function () {
		const spawnedEventTable = varValue(SPAWNED_EVENT_TABLE_VAR);
		const firstSpawnedEventId = spawnedEventTable[0];
		if (firstSpawnedEventId && $gameMap.event(firstSpawnedEventId)) $gameMap.eraseEvent(firstSpawnedEventId);
		spawnedEventTable[0] = 0;
	};

	// Replaces (4x): data/CommonEvents.json:common-event:259
	writeVariableArraySlotVar292_2 = function () {
		[11, 12].forEach(slotIndex => {
			$gameMap.eraseEvent(spawnedEventId(slotIndex));
			varValue(SPAWNED_EVENT_TABLE_VAR)[slotIndex] = 0;
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:297, data/CommonEvents.json:common-event:400
	readVariable292_2 = function (interp) {
		varValue(SPAWNED_EVENT_TABLE_VAR).forEach(spawnedId => {
			if (spawnedId && $gameMap.event(spawnedId)) $gameMap.eraseEvent(spawnedId);
		});
	};

	// Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
	readVariable292_4 = function () {
		varValue(SPAWNED_EVENT_TABLE_VAR).forEach(spawnedId => {
			if (spawnedId >= 1 && $gameMap.event(spawnedId) && !$gameParty.inBattle()) {
				$gameMap.eraseEvent(spawnedId);
			}
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
	readVariable292_3 = function () {
		range(12, 17).forEach(slotIndex => {
			const spawnedId = spawnedEventId(slotIndex);
			const mapEvent = $gameMap.event(spawnedId);
			if (mapEvent) mapEvent.setTransparent(true);
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:358, data/CommonEvents.json:common-event:361
	setEventFaceVar292 = function (lastSlotIndex) {
		range(12, lastSlotIndex).forEach(slotIndex => {
			const spawnedId = spawnedEventId(slotIndex);
			if (!$gameMap.event(spawnedId)) return;
			const event = $gameMap.event(spawnedId);
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
	setEventFace = function (interp, faceId) {
		$gameMap.event(interp._eventId).setFace(faceId, true, true);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
	clearEventFace = function (interp) {
		$gameMap.event(interp._eventId).removeFace();
	};

	// Replaces (2x): data/CommonEvents.json:common-event:543, data/CommonEvents.json:common-event:546
	setEventFaceVar530And292 = function () {
		const leadEvent = spawnedEvent(varValue(LEAD_ACTOR_VAR));
		leadEvent.setFace(11, true, true);
		leadEvent.setStepAnime(false);
		leadEvent.setWalkAnime(false);
		leadEvent.setDirection(2);
	};

	// Replaces (2x): data/Map054.json:map-event:2:page:1..4
	setEventFace2 = function (interp) {
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
	gatherNearbyEvents = function (interp) {
		// CharaNameIdが同一のイベントを一日消去
		event_togetherSelf(interp._eventId, 'B');
	};

	// Replaces (2x): data/Map003.json:map-event:196:page:1, data/Map018.json:map-event:31:page:1
	setParallelEvent = function (interp) {
		// ｲﾍﾞﾝﾄに対するx,yのズラす歩数と主人公の向き
		event_pararelSet(interp._eventId, 0, 1, 8);
	};

	// Replaces (22x): data/Map003.json:map-event:198:page:1, ... data/Map018.json:map-event:15:page:1, ...
	setParallelEventFromEvSceneSet = function (interp, playerDirection) {
		// ｲﾝｼﾞｹｰﾀｰ等消去, 帰還座標記憶, EvSceneSetでｲﾍﾞ起動ｽｲｯﾁ指定
		event_pararelSet(interp._eventId, 0, 1, playerDirection);
	};

	// Replaces (2x): data/Map003.json:map-event:167:page:1, data/Map007.json:map-event:20:page:1
	startParallelEventFromEvSceneSetMeta = function (interp) {
		const evSceneSet = $gameMap.event(interp._eventId).event().meta['EvSceneSet'];
		if (!evSceneSet) return;
		event_pararelStarting(1, Number(evSceneSet.split(',')[0]), interp._eventId);
	};

	// Replaces (5x): data/Map003.json:map-event:179:page:1, ... Map144.json:map-event:12:page:1
	presetEventCharacterAndRootEventCharacter = function (interp) {
		valueBossId = interp._eventId;
		event_charaPreset(interp._eventId);
		event_charaRoot(interp._eventId);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:292, :301, :343
	setInterpreterWaitMode = function (interp) {
		interp.setWaitMode('scroll');
	};

	// Replaces (4x): data/CommonEvents.json:common-event:302, :305, :401, data/Map094.json:map-event:45:page:1
	setupRespawnEnemyAVar530And292_4 = function (posX, posY, zoomFlag, direction) {
		respawnActor(varValue(LEAD_ACTOR_VAR), posX, posY, zoomFlag).setDirection(direction);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:304, :325, :335, :339
	setupRespawnEnemyAVar530And292_5 = function () {
		respawnActor(4, 12, 6, 0).setDirection(6);
		respawnActor(5, 13, 7, 0).setDirection(8);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:356, :357, :358, ... :362
	setupRespawnEnemyAVar530_2 = function (posX, posY) {
		respawnActorFacing(varValue(LEAD_ACTOR_VAR), posX, posY, 1, 8);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:401
	setupRespawnEnemyAVar292 = function (slotIndex, posX, zoomFlag, direction) {
		respawnActor(slotIndex, posX, 34, zoomFlag).setDirection(direction);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:303, data/CommonEvents.json:common-event:324
	setupRespawnEnemyNVar292_4 = function (posX, posX2) {
		respawnNpcFacing(11, 13, 22, 0, 'People3', 6, 8);
		respawnNpcFacing(12, posX, 23, 0, 'People3', 7, 8);
		respawnNpcFacing(13, posX2, 23, 0, 'People3', 7, 8);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:322, data/CommonEvents.json:common-event:354
	setupRespawnEnemyNVar292_5 = function () {
		const spawnedNpc = respawnNpcFacing(11, 27, 8, 0, 'BB_akunin3', 5, 2);
		spawnedNpc._spriteOffsetY = -10;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:322, :354, :358
	setupRespawnEnemyNBB_akunin3 = function () {
		const npcPlacements = [
			[16, 27, 17, 0],
			[12, 25, 15, 1],
			[13, 24, 13, 2],
			[14, 29, 15, 3],
			[15, 31, 14, 4],
		];
		npcPlacements.forEach(([slotIndex, posX, posY, imageIndex]) => {
			respawnNpc(slotIndex, posX, posY, 0, 'BB_akunin3', imageIndex);
		});
	};

	// Replaces (3x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:547
	setupRespawnEnemyN = function (posX, posY, imageName, imageIndex, direction) {
		respawnNpcFacing(11, posX, posY, 0, imageName, imageIndex, direction);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:300, data/CommonEvents.json:common-event:301
	setupRespawnEnemyNVar292_2 = function (interp) {
		event_respawnSetN(11, 25, 7, 0, '$airship02', 0);
		const spawnedNpc = spawnedEvent(11);
		interp._eventId = spawnedEventId(11);
		spawnedNpc.setDirection(4);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
	setupRespawnEnemyNNpc = function (slotIndex, posX, posY, direction, slotIndex2, posX2, posY2, direction2, slotIndex3, posX3, posY3, direction3) {
		const placeRandomNpc = (slot, x, y, faceDirection) => {
			event_respawnSetN(slot, x, y, 0, 'npc' + (getRandomIndex(6) + 1), getRandomIndex(7), faceDirection);
		};
		placeRandomNpc(slotIndex, posX, posY, direction);
		placeRandomNpc(slotIndex2, posX2, posY2, direction2);
		placeRandomNpc(slotIndex3, posX3, posY3, direction3);
	};

	// Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
	setupRespawnEnemyN2 = function () {
		const savedNpc = valueNpcGuraTemporarilySave;
		event_respawnSetN(11, savedNpc[8] - 1, savedNpc[9], 0, savedNpc[6], savedNpc[7], 6);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
	respawnGoodsEvent = function (quantity, priceOrFlag) {
		const GOODS_SLOT_INDEX = 18;
		goodsEvent_respawn(GOODS_SLOT_INDEX, 'food_2', 4, 2, 0, quantity, priceOrFlag);
		spawnedEvent(GOODS_SLOT_INDEX)._priorityType = 2;
	};

	// Replaces (2x): data/Map003.json:map-event:157:page:1, data/Map165.json:map-event:12:page:1
	setupPopEnemy = function () {
		popEnemy_setUp($dataItems[varValue(240)]);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:292, :304, :314, :316
	setupRespawnEnemyNVar292 = function (interp, selfSwitchKey, posX, posY) {
		mapSelfSwitchOn(selfSwitchKey, 'A');
		event_respawnSetN(11, posX, posY, 0, 'Goods9', 0, 2);
		interp._eventId = spawnedEventId(11);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:333, data/CommonEvents.json:common-event:348
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And292 = function (interp, posY, posY2, imageName, imageIndex, direction) {
		const leadActorId = varValue(LEAD_ACTOR_VAR);
		respawnActorFacing(leadActorId, 12, posY, 1, 8);
		interp._eventId = spawnedEventId(leadActorId);
		event_respawnSetN(11, 12, posY2, 0, imageName, imageIndex, direction);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:336, data/CommonEvents.json:common-event:347, data/CommonEvents.json:common-event:349
	setupRespawnEnemyNVar292_6 = function (interp, posX, posY, imageName, direction) {
		event_respawnSetN(11, posX, posY, 0, imageName, 0, direction);
		interp._eventId = spawnedEventId(11);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:302, :305, :511, :552, data/Map094.json:map-event:45:page:1
	setupRespawnEnemyNVar292_3 = function (slotIndex, posX, posY, zoomFlag, imageName, imageIndex, direction) {
		respawnNpc(slotIndex, posX, posY, zoomFlag, imageName, imageIndex).setDirection(direction);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:306
	setupRespawnEnemyAVar530And292_6 = function (interp, posX, posY) {
		const leadActorId = varValue(LEAD_ACTOR_VAR);
		respawnActor(leadActorId, posX, posY, 1).setDirection(2);
		interp._eventId = spawnedEventId(leadActorId);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:471, data/CommonEvents.json:common-event:541
	setupRespawnEnemyAVar530And292_7 = function (interp, posX, posY, direction) {
		respawnActorFacing(5, posX, posY, 1, direction);
		interp._eventId = spawnedEventId(5);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:471
	setupRespawnEnemyNVar292_7 = function (interp, slotIndex, posX, zoomFlag, imageIndex, direction, referenceSlotIndex) {
		event_respawnSetN(slotIndex, posX, 12, zoomFlag, 'npcUnique3', imageIndex, direction);
		interp._eventId = spawnedEventId(referenceSlotIndex);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:383, :384, :528
	setupRespawnEnemyAVar292And530 = function (interp, posX, posX2) {
		setSelfVar(interp, LEAD_ACTOR_VAR, 1);   // 主格キャラ
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
	showScenePictureAndFadeIn = function (scenePicName) {
		valuePic1 = 55;
		valueScenePic = scenePicName;
		showScenePicture(valuePic1, valueScenePic, { y: 384 - 20 });
	};

	// Replaces (2x): data/CommonEvents.json:common-event:306
	showScenePictureAndFadeIn2 = function (picIndex, picIndex2) {
		showScenePicture(valuePic1 + picIndex, valueScenePic + picIndex2, { x: 640 - 128 + 50 });
	};

	// Replaces (5x): data/CommonEvents.json:common-event:338, :341, :507, :517, :545
	showScenePictureAndFadeIn3 = function (picIndex, picIndex2, scaleX, scaleY) {
		showScenePicture(valuePic1 + picIndex, valueScenePic + picIndex2, { scaleX, scaleY });
	};

	// Replaces (2x): data/CommonEvents.json:common-event:389, data/CommonEvents.json:common-event:509
	showScenePictureAndFadeIn4 = function () {
		showScenePictureAndFadeIn3(3, '03', 100, 100);
		showScenePictureAndFadeIn3(4, '04', 100, 100);
	};

	// Replaces (8x): data/CommonEvents.json:common-event:391, :393, :399, :546, ...
	showScenePictureAndFadeIn5 = function (picIndex, picIndex2) {
		valuePic1 = 51;
		showScenePicture(valuePic1 + picIndex, valueScenePic + picIndex2);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:507, :508, :509, :541
	showScenePictureAndFadeIn6 = function (picIndex, picIndex2, scaleY, opacity) {
		showPic(valuePic1 + picIndex, valueScenePic + picIndex2, 640 - 128, 384, 100, scaleY, opacity, 1);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:530
	showScenePictureAndFadeIn7 = function () {
		showScenePicture(50, valueScenePic + '02');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:547
	showScenePictureAndFadeIn8 = function (picIndex, picIndex2) {
		showScenePicture(valuePic1 + picIndex, valueScenePic + picIndex2);
	};

	// Replaces (8x): data/CommonEvents.json:common-event:341, ...
	movePicture1_3 = function (picIndex, picIndex2, scaleX, scaleY) {
		showScenePictureAndFadeIn3(picIndex, picIndex2, scaleX, scaleY);
		slideScenePictureAway(picIndex);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:391, :393, :399, :530, :531, :572, ...
	movePicture1_4 = function (picIndex, scaleX, scaleY) {
		pic_move1(valuePic1 + picIndex, 0, 0, scaleX, scaleY, 0, 90);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:546
	movePicture1_5 = function (picIndex, picIndex2) {
		valuePic1 = 51;
		const pictureId = valuePic1 + picIndex;
		showScenePicture(pictureId, valueScenePic + picIndex2);
		slideScenePictureAway(picIndex);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516
	moveScenePictureAndFadeIn = function () {
		movePic(valuePic1 + 1, 640 - 128, 384, 100, 100, 255, 60, 1);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:306
	fadePicture1FadeIn = function (scenePicName, pictureId) {
		showPic(pictureId, scenePicName, 640, 384, 100, 100, 255, 1);
		picture_fade1(valuePic1, 'fadeIn', '150', 60, 5);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:406, :496, :516, :517, :518, :519
	fadePicture1FadeIn_2 = function (opacity) {
		showPic(valuePic1, valueScenePic + '00', 640 - 128, 384, 100, 100, opacity, 1);
		picture_fade1(valuePic1, 'fadeIn', valueWipeImg, 60, 5);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:406, :496, :516, :517, :518, :519, ...
	setValuePic1 = function () {
		valuePic1 = 51;
	};

	// Replaces (6x): data/CommonEvents.json:common-event:517, :518, :519
	setValueScenePic = function (scenePicName) {
		valueScenePic = scenePicName;
	};

	/* ============================================================================
	 * Standing pictures (blessed)
	 * ========================================================================== */

	// Replaces (3x): data/CommonEvents.json:common-event:410, :546, :547
	blessStandingPicture = function (picIndex, picIndex2, opacity) {
		showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2, { opacity, animate: false });
	};

	// Replaces (2x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516
	blessStandingPicture2 = function (blessType) {
		const pictureId = valuePic1 + 1;   // 非表示状態
		showBlessedPicture(pictureId, valueScenePic + '01', { y: 384 + 50, animate: false, blessType });
	};

	// Replaces (5x): data/CommonEvents.json:common-event:496, :516, :517, :518, :519
	blessStandingPicture3 = function (picIndex, picIndex2, yOffset) {
		showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2, { y: 384 + yOffset });
	};

	// Replaces (2x): data/CommonEvents.json:common-event:496
	blessStandingPicture4 = function () {
		const pictureId = valuePic1 + 10;
		showBlessedPicture(pictureId, valueScenePic + '21', { x: 640 - 128 + 50, animate: false });
	};

	// Replaces (3x): data/CommonEvents.json:common-event:517, :518, :519
	blessStandingPicture5 = function () {
		const pictureId = valuePic1 + 10;
		showBlessedPicture(pictureId, valueScenePic + '21', { x: 640 - 128 + 50 });
	};

	// Replaces (3x): data/CommonEvents.json:common-event:526, data/CommonEvents.json:common-event:576
	// Identical to `blessStandingPicture` above (no bless call), folded into it.
	blessStandingPicture6 = blessStandingPicture;

	// Replaces (4x): data/CommonEvents.json:common-event:530, :531, :536
	blessStandingPicture7 = function (picIndex, picIndex2) {
		valuePic1 = 51;
		showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:541, data/CommonEvents.json:common-event:543
	blessStandingPicture8 = function (picIndex, picIndex2) {
		showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:544
	blessStandingPicture9 = function (picIndex, picIndex2) {
		showBlessedPicture(valuePic2 + picIndex, valueScenePic + picIndex2, { x: 640 + 480 + 50, toX: 640 + 480 });
	};

	// Replaces (6x): data/CommonEvents.json:common-event:547, :572, :576
	blessStandingPicture10 = function (picIndex, picIndex2, blessType) {
		showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2, { blessType });
	};

	// Replaces (3x): data/CommonEvents.json:common-event:571, :572, :573
	blessStandingPicture11 = function (picIndex, picIndex2, yOffset, blessType) {
		showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2, { y: 384 - yOffset, blessType });
	};

	// Replaces (9x): data/CommonEvents.json:common-event:391, :393, :399, :526, :531, :545, ...
	blessStandingPictureAndMovePicture1 = function (picIndex, picIndex2, blessType) {
		const pictureId = valuePic1 + picIndex;
		showBlessedPicture(pictureId, valueScenePic + picIndex2, { blessType, slidePreviousId: pictureId - 1 });
	};

	// Replaces (12x): data/CommonEvents.json:common-event:496, :516, :517, :518, :519, ...
	blessStandingPictureAndMovePicture1_2 = function (picIndex, picIndex2, scaleX, scaleY, duration, blessType, previousPicIndex, waitFrames) {
		const pictureId = valuePic1 + picIndex;
		showBlessedPicture(pictureId, valueScenePic + picIndex2, {
			scaleX, scaleY, duration, blessType,
			slidePreviousId: valuePic1 + previousPicIndex, slideFrames: waitFrames,
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:531, data/CommonEvents.json:common-event:546
	blessStandingPictureAndMovePicture1_3 = function (picIndex, picIndex2) {
		valuePic1 = 51;
		const pictureId = valuePic1 + picIndex;
		showBlessedPicture(pictureId, valueScenePic + picIndex2, { slidePreviousId: pictureId - 1 });
	};

	// Replaces (2x): data/CommonEvents.json:common-event:542
	blessStandingPictureAndMovePicture1_4 = function (picIndex, picIndex2) {
		const pictureId = valuePic2 + picIndex;
		showBlessedPicture(pictureId, valueScenePic + picIndex2, {
			x: 640 + 480, y: 384 - 118, opacity: 200,
			toX: 640 + 480, toY: 384 + 50, duration: 240,
			slidePreviousId: pictureId - 1,
		});
	};

	// Replaces (3x): data/CommonEvents.json:common-event:517, :518, :519
	blessStandingPictureAndPlayPictureSe1 = function () {
		const pictureId = valuePic1 + 2;
		showBlessedPicture(pictureId, valueScenePic + '02', { scaleX: 300, scaleY: 300 });
		picture_se1();
	};

	// Replaces (5x): data/CommonEvents.json:common-event:368, :412, :495, :532, :548
	blessStandingPictureAndPlayHcgPiston = function () {
		showBlessedPicture(valuePic2 + 1, valueScenePic + '01', {
			x: 640 + 480 + 50, toX: 640 + 480, blessType: 1,
		});
		const hcgPictureId = valuePic1 + 1;
		showScenePicture(hcgPictureId, valueScenePic + '02', { y: 384 - 20 });
		hcg_piston(hcgPictureId, 5, 1, 2);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:412, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548, data/CommonEvents.json:common-event:573
	// Shows the 1024-frame overlay (picture 70) at full opacity, fades it in and
	// blesses standing picture 1.
	fadePicture1AndBlessStandingPicture = function () {
		const framePictureId = valuePic2;
		const framePictureName = 'Screen1024Frame';   // 1024ピク表示の際のフレーム枠
		showPic(framePictureId, framePictureName, 640 - 78, 384, 100, 100, 255, 1);
		picture_fade1(framePictureId, 'fadeIn', valueWipeImg, 60, 5);
		tachie_bless(value1, 5);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:64
	// Slides the seven scene pictures (ids 101..107) to the left edge.
	movePicture1_2 = function () {
		range(1, 7).forEach(pictureIndex => pic_move1(100 + pictureIndex, 0, 30, -500, 0));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:537
	showAndMovePicture1AndBlessStandingPicture = function (picIndex, pictureName) {
		const pictureId = valuePic1 + picIndex;
		pic_showMove1(pictureId, valueScenePic + pictureName, 640 - 128, 384, 100, 60, 2, 200);
		tachie_bless(pictureId, 2);
		slideScenePictureAway(picIndex);
	};

	// Replaces (9x): data/CommonEvents.json:common-event:368, :412, :495, :507, :526, :532, ...
	setPictureLocationAndBlessStandingPicture = function (picIndex, picIndex2, pictureId, blessType) {
		const targetPictureId = valuePic1 + picIndex;
		pic_locationSet(targetPictureId - pictureId, targetPictureId, valueScenePic + picIndex2, 60, 1);
		tachie_bless(targetPictureId, blessType);
	};

	/* ============================================================================
	 * Screen overlays / fades
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:54, data/CommonEvents.json:common-event:301
	blackOutScreenAndFadeScreenBlackOut = function () {
		valuePic1 = 101;
		showScreenBlackOut(valuePic1, 255);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:172
	blackOutScreenAndFadeScreenBlackOut2 = function () {
		showPic(100, 'ScreenBlackOut', 640, 384, 100, 100, 0, 1);
		movePic(100, 640, 384, 100, 100, 150, 40, 1);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:543
	fadePicture1ScreenBlackOut = function (actorPictureId, opacity) {
		fadeInScreenBlackOut(actorPictureId, opacity);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:341
	fadePicture1ScreenBlackOut_2 = function () {
		fadeInScreenBlackOut(55 - 1, 200);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:526, :530, Map083.json:map-event:6:page:1
	fadePicture1ScreenBlackOut_3 = function (pictureId, opacity, fadePictureId) {
		fadeInScreenBlackOut(pictureId, opacity, fadePictureId);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:517, :518, :519
	fadePicture1Pic75 = function () {
		fadeInScreenBlackOut(75, 150);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:21, data/CommonEvents.json:common-event:173, :183, Map003.json:map-event:83:page:1
	fadePicture1Pic98 = function (choicePictureName) {
		showPic(100, 'ScreenFoundationChoice', 0 + 300, 0, 100, 100, 0, 0);
		movePic(100, 0, 0, 100, 100, 255, 120, 0);
		showPic(99, choicePictureName, 300 + 20, 0, 200, 200, 0, 0);
		movePic(99, 300, 0, 200, 200, 255, 120, 0);
		fadeInScreenBlackOut(98, 150);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:92, Map007.json:map-event:4:page:1, Map007.json:map-event:6:page:1
	fadePicture1FadeOut = function () {
		picture_fade1(51, 'fadeOut', 'Hscene005', 300, 5);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/Map094.json:map-event:45:page:1
	fadePicture1FadeOut_2 = function (actorPictureId) {
		valuePic1 = actorPictureId;
		picture_fade1(valuePic1, 'fadeOut', valueWipeImg, 60, 5);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:292, :335, :337
	fadePicture1ZX_Main034_ = function () {
		valuePic1 = 55;
		valueScenePic = 'ZX_Main034_';
		showPic(valuePic1, valueScenePic + '01', 640, 384, 100, 100, 0, 1);
		movePic(valuePic1, 640, 384, 100, 100, 255, 60, 1);
		picture_fade1(valuePic1, 'fadeIn', valueWipeImg, 60, 5);
	};

	// Replaces (4x): data/Map003.json:map-event:3:page:2, data/Map093.json:map-event:2:page:1, page:2, ...
	fadeInScreen = function (duration) {
		$gameScreen.startFadeIn(duration);
	};

	// Replaces (4x): data/Map003.json:map-event:6:page:1, :8:page:1, :107:page:1, :182:page:1
	fadeOutScreen = function (interp) {
		$gameScreen.startFadeOut(30);
		interp.wait(30);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:298
	setValuePic1Var17 = function () {
		valuePic1 = 55;
		valueCountSet1 = getRandomIndex(51) + 200;
		let presetValues = [1, 2, 1, 1][getRandomIndex(4)];
		if (varValue(17) >= 500) presetValues = [2, 3, 4, 5][getRandomIndex(4)];
		const pictureName = `Zev_Opening1_${presetValues}`;
		showPic(valuePic1, pictureName, 640 + 450 - 500, 384, 300, 300, 0, 1);
		movePic(valuePic1, 640 + 450, 384, 100, 100, valueCountSet1, 300, 1);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:298
	blessStandingPictureVar17 = function () {
		$gameScreen.setPicturesAnimation(3, 2, '連番', 5);
		const presetValues = varValue(17) >= 500 ? 2 : 1;
		const pictureName = `Zev_Opening2_${presetValues}_0`;
		showPic(valuePic1 + 1, pictureName, 640 + 450 - 500, 384, 300, 300, 0, 1);
		movePic(valuePic1 + 1, 640 + 450, 384, 100, 100, valueCountSet1, 300, 1);
		tachie_bless(valuePic1, 2);
		tachie_bless(valuePic1 + 1, 2);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	shrinkPictureRow = function (interp) {
		const PICTURE_ROW_FIRST_ID = 55;
		range(0, 3).forEach(offset => movePic(PICTURE_ROW_FIRST_ID + offset, 640, 384, 100, 0, 0, 30, 1));
		interp.wait(40);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	erasePictureRow = function () {
		const PICTURE_ROW_FIRST_ID = 55;
		range(0, 3).forEach(offset => $gameScreen.erasePicture(PICTURE_ROW_FIRST_ID + offset));
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:471
	erasePictureP4 = function () {
		valuePic1 = 55;
		range(0, 3).forEach(offset => pic_eraseP(1, [valuePic1 + offset]));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:109, data/CommonEvents.json:common-event:110
	erasePictureP2 = function () {
		pic_eraseP(0, [121, 122, 123, 124, 125, 126, 127, 128, 129, 130]);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:210, data/CommonEvents.json:common-event:259
	erasePictureP3 = function (firstPictureId) {
		const existingPictureIds = range(firstPictureId, 200).filter(pictureId => $gameScreen.picture(pictureId));
		pic_eraseP(0, existingPictureIds);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:495, :532, :548, :572
	erasePictureP5 = function () {
		pic_eraseP(0, [valuePic1 + 7]);
	};

	// Replaces (2x): data/Map007.json:map-event:23:page:1
	erasePictureById2 = function (interp, pictureId) {
		$gameScreen.erasePicture(pictureId);
		interp.wait(3);
	};

	/* ============================================================================
	 * Boss / H-scene picture choreography
	 * ========================================================================== */

	// Replaces (6x): data/CommonEvents.json:common-event:389, :509
	playHcgPiston = function () {
		hcg_piston(valuePic1 + 4, 7, 1, 1);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:391, :393, :399
	playHcgPiston2 = function () {
		const pictureId = valuePic1 + 12;
		showPic(pictureId, valueScenePic + '12', 640 - 128, 384, 100, 100, 200, 1);
		hcg_piston(pictureId, 7, 1, 2);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:530, :531, :573
	playHcgPiston3 = function (picIndex, picIndex2, breathTypeId, breathPresetId, breathLayerId) {
		const pictureId = valuePic1 + picIndex;
		showScenePicture(pictureId, valueScenePic + picIndex2);
		hcg_piston(pictureId, breathTypeId, breathPresetId, breathLayerId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:572, data/CommonEvents.json:common-event:573
	playHcgPiston4 = function (picIndex, picIndex2, breathTypeId, breathPresetId) {
		const pictureId = valuePic1 + picIndex;
		showScenePicture(pictureId, valueScenePic + picIndex2, { y: 384 + 50 });
		hcg_piston(pictureId, breathTypeId, breathPresetId, 1);
	};

	// Replaces (3x): data/Map007.json:map-event:5:page:1
	playHcgPiston5 = function (breathPresetId) {
		// ピクID, 1縦2横3左斜め4右斜め, 1緩め2通常3ラスト
		hcg_piston(55, 1, breathPresetId);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:389, :509
	movePicture1AndPlayHcgPiston = function (picIndex, picIndex2, breathPresetId) {
		const pictureId = valuePic1 + picIndex;
		showScenePicture(pictureId, valueScenePic + picIndex2);
		slideScenePictureAway(picIndex);
		hcg_piston(pictureId, 6, breathPresetId, 1);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:391, :393, :399, :531, :573, ...
	playHcgPistonAndMovePicture1 = function (picIndex, picIndex2, breathTypeId) {
		const pictureId = valuePic1 + picIndex;
		showScenePicture(pictureId, valueScenePic + picIndex2);
		hcg_piston(pictureId, breathTypeId, 1, 1);
		slideScenePictureAway(picIndex);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:508
	movePicture1AndBlessStandingPicture = function (picIndex, picIndex2) {
		const pictureId = valuePic1 + picIndex;
		showBlessedPicture(pictureId, valueScenePic + picIndex2, { slidePreviousId: pictureId - 1 });
	};

	// Replaces (4x): data/CommonEvents.json:common-event:368, :495, :532, :548
	playHcgPistonSwitch429 = function () {
		const pictureId = valuePic1 + 2;
		showPic(pictureId, valueScenePic + '02', 640, 384, 100, 100, 255, 1);
		pic_setArray1 = [1, pictureId, 0, -30, 0, 20];
		pic_setArray2 = [1, pictureId, 0, 0, 3, 30];
		valueParallelPicSe1 = ['ZH_sticky4', 20, 60];
		valueParallelPicSe2 = ['ZH_sticky4', 20, 60];
		hcg_piston(pictureId, 7, 2, 1);
		enableSwitch(429);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:541, data/CommonEvents.json:common-event:543
	playHcgPistonSwitch429_2 = function (picIndex, picIndex2, seVolume, pictureId) {
		pic_setArray1 = [1, valuePic1 + picIndex, 0, -15, 0, 20];
		pic_setArray2 = [1, valuePic1 + picIndex2, 0, 0, 3, 30];
		valueParallelPicSe1 = ['ZH_sticky4', seVolume, 10];
		valueParallelPicSe2 = [0, 0, 0];
		hcg_piston(valuePic1 + pictureId, 7, 2, 1);
		enableSwitch(429);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:572
	playParallelPictureSeSwitch429 = function (seVolume1, seVolume2) {
		const pictureId = valuePic1 + 7;
		pic_setArray1 = [1, pictureId, 0, -30, 5, seVolume1];
		pic_setArray2 = [1, pictureId, 0, 30, 3, seVolume2];
		valueParallelPicSe1 = [0, 0, 0];
		valueParallelPicSe2 = [0, 0, 0];
		enableSwitch(429);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:495, :532, :548
	playAdvHPartDirectAndSetSexDirection = function (interp) {
		// 絶頂射精
		adv_HpartDirectPlay(3);
		sex_direction(12, 0, 0);
		interp.wait(valueSexWait);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:495, :532, :548
	setAdvPartDirectAndSetSexDirection = function (interp) {
		// ピストン
		adv_partDirectSet(1);
		sex_direction(1, 0, 0);
		interp.wait(valueSexWait);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:517, :518, :519
	setSexDirectionAndSetAdvPartDirect = function (interp, actionType) {
		sex_direction(actionType, 0, 0);
		interp.wait(valueSexWait);
		adv_partDirectSet(1);   // ピストンの時
	};

	// Replaces (2x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:536
	startPictureAnimationFrame = function (frameId) {
		const pictureId = valuePic1;
		if ($gameScreen.picture(pictureId)) {
			$gameScreen.picture(pictureId).startAnimationFrame(frameId, true, [1, 1, 1, 2]);
		}
	};

	// Replaces (3x): data/CommonEvents.json:common-event:543, :572, :573
	startPictureAnimationFrame2 = function (picIndex) {
		const pictureId = valuePic1 + picIndex;
		if ($gameScreen.picture(pictureId)) {
			$gameScreen.picture(pictureId).startAnimationFrame(1, true, [1, 1, 1, 2]);
		}
	};

	// Replaces (2x): data/CommonEvents.json:common-event:338
	setStandingPictureActionVar20 = function (interp, expressionCode) {
		tachie_dousa(2, 1, expressionCode, 15, 1, 255, 1344, 0, 0);
		tachie_dousa(1, 1, 4, 15, 1, 255, 0, 0, 0);
		interp.wait(3);
	};

	// Replaces (11x): data/CommonEvents.json:common-event:368, :410, :495, :532, :536, :548, ...
	setStandingPictureActionZ_ClothesTakeOff = function (expressionCode, targetPicId, sourcePicId, showCostumeId) {
		tachie_dousa(0, 1, expressionCode, targetPicId, sourcePicId, showCostumeId, 120, 0, 0);
		playSeEffectZ_ClothesTakeOff();
	};

	// Replaces (4x): data/CommonEvents.json:common-event:292, :329, Map007.json:map-event:23:page:1
	playSeEffectZ_ClothesTakeOff = function () {
		const SE_NAME = 'Z_ClothesTakeOff';   // ピッチ50か100。消去ウェイトで変更
		AudioManager.playSe({ name: SE_NAME, volume: 150, pitch: 100, pan: 0 });
	};
	/* ============================================================================
	 * Flow / state variables
	 * ========================================================================== */

	// Replaces (5x): data/CommonEvents.json:common-event:85, :109, :110, :113, :159
	setSelfVariable0 = function (interp) {
		clearSelfVarRange(interp, 401, 440);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:85, :401, :516, :546, Map200.json:map-event:11:page:1, ...
	assignSelfVariableValue = function (interp, variableId, value) {
		setSelfVar(interp, variableId, value);
	};

	// Replaces (10x): data/CommonEvents.json:common-event:219, :307, :401, :411, :451, Map007.json:map-event:3:page:1, ...
	assignSelfVariableValue2 = assignSelfVariableValue;   // identical helper, kept under its original name

	// Replaces (7x): data/CommonEvents.json:common-event:313, :322, :326, :338, :339, :355, ...
	setSelfVariable23 = function (interp, line) {
		setSelfVar(interp, 23, line);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:536
	setSelfVariable23Var1 = function (interp) {
		const actorHStatArray = varValue(381);   // variable 381: アクター1Ｈステ配列
		const hStatValue56 = actorHStatArray[56];   // 381 slot 56 — no name in System.json
		const hStatValue53 = actorHStatArray[53];   // 381 slot 53 — no name in System.json
		setSelfVar(interp, 23, `${hStatValue56}の${hStatValue53}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:158
	setSelfVariable207 = function (interp) {
		setSelfVar(interp, 207, 101);   // 露出縛りなし
	};

	// Replaces (2x): data/CommonEvents.json:common-event:217, data/CommonEvents.json:common-event:249
	setSelfVariable702 = function (interp) {
		setSelfVar(interp, 702, varValue(702) + 1);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:307, :335, :337
	setSelfVariableToActorPairNames = function (interp, variableId) {
		const actorName3 = $gameActors.actor(3).name();
		const actorName4 = $gameActors.actor(4).name();
		setSelfVar(interp, variableId, `${actorName3}＆${actorName4}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:337
	setSelfVariableToActorNameWithExcept = function (interp) {
		const actorName4 = $gameActors.actor(4).name();
		setSelfVar(interp, 23, `${actorName4}以外`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:356
	setSelfVariableToActorTrioNames = function (interp) {
		const actorName3 = $gameActors.actor(3).name();
		const actorName4 = $gameActors.actor(4).name();
		const actorName5 = $gameActors.actor(5).name();
		setSelfVar(interp, 23,
			`${actorName3}＆${actorName4}＆${actorName5}`);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:90
	setSelfVariable21_2 = function (interp) {
		setSelfVar(interp, 21, '');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	setSelfVariable21_3 = function (interp) {
		const sharedPoolArray = varValue(21);   // variable 21: 乱数汎用1 (the shared character pool)
		setSelfVar(interp, 21, [0, [], 0, 0, 0, 0, 0, 0, 0]);
		sharedPoolArray[1].push(5);
		sharedPoolArray[1].push(556);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	setSelfVariable21_4 = function (interp) {
		setSelfVar(interp, 21, valueFighterStatas);
	};

	// Replaces (2x): data/Map003.json:map-event:81:page:1, data/Map003.json:map-event:82:page:1
	setSelfVariable24 = function (interp) {
		const expressionId = varValue(23);
		const expressionByExpressionId = { 6: 128, 7: 127, 8: 126, 9: 125 };
		const matchedExpressionId = expressionId >= 10 ? 124 : expressionByExpressionId[expressionId];
		if (matchedExpressionId) setSelfVar(interp, 24, matchedExpressionId);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:103
	setVariable332Text = function () {
		const icon296 = icon(296);
		const totalexpRounded = Math.round(valueTotalexp);
		const icon313 = icon(313);
		const totalgoldRounded = Math.round(valueTotalgold);
		setVar(332, `${icon296}:${totalexpRounded}${icon313}:${totalgoldRounded}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:12
	setVariable537 = function () {
		setVar(537, []);   // エネミー
		setVar(538, []);   // Hエネミー
	};

	// Replaces (2x): data/Map003.json:map-event:19:page:1
	setVariable22 = function (nextValue) {
		setVar(22, 0);
		setVar(23, nextValue);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:174, data/CommonEvents.json:common-event:181
	setVariable19 = function () {
		setVar(19, valueCountArray3[varValue(19)]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:201, data/CommonEvents.json:common-event:202
	setVariable19Var327 = function () {
		const weaponSlotRecords = varValue(327);   // variable 327: 拠点アクティベート記録配列 (per-slot activation records)
		let targetSlotIndex = 22;
		for (let slotIndex = 1; slotIndex <= 100; slotIndex++) {
			if (weaponSlotRecords[slotIndex] == 2) {
				targetSlotIndex = slotIndex;
				break;
			}
		}
		setVar(19, targetSlotIndex);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:201, :202, data/Map003.json:map-event:133:page:2
	setVariable161 = function () {
		const homePosition = $dataWeapons[varValue(19)].meta['HomePosition'].split(',');
		const homePositionYOffset = Number(homePosition[3]) == 0 ? 1 : -1;
		setVar(161, [Number(homePosition[0]), Number(homePosition[1]) + homePositionYOffset, Number(homePosition[2])]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:201, data/CommonEvents.json:common-event:202
	countDefeatedEnemyVar240And161Switch140 = function () {
		const dungeonInfoItemId = varValue(240);   // variable 240: ダンジョン毎情報アイテム指定変数
		let escapeMapPosition;
		if (dungeonInfoItemId >= 1) {
			escapeMapPosition = $dataItems[dungeonInfoItemId].meta['EscapeMapID'].split(',');
			setVar(161, [Number(escapeMapPosition[0]), Number(escapeMapPosition[1]), Number(escapeMapPosition[2])]);
		} else {
			setVar(161, [14, 26, 7]);
		}
		if (Number(escapeMapPosition[0]) != $gameMap.mapId()) {
			disableSwitch(140);   // マップ最初の処理終了スイッチ
		}
	};

	// Replaces (2x): data/CommonEvents.json:common-event:240
	setValueScriptArray1 = function (setValue, arrayValue) {
		if (valueCountSet1 == setValue) valueScriptArray1 = [arrayValue];
	};

	// Replaces (3x): data/Map003.json:map-event:139:page:1, :140:page:1, :142:page:1
	cycleSelfSwitchVariable = function (interp) {
		$gameSelfSwitches.setVariableValue([$gameMap.mapId(), interp._eventId, 10], 10);
	};

	// Replaces (3x): data/Map003.json:map-event:139:page:1, :140:page:1, :142:page:1
	cycleSelfSwitchVariable2 = function (interp) {
		const nextBetRateByCurrentRate = { 10: 100, 100: 1000, 1000: 10000, 10000: 10 };
		const currentBetRate = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
		$gameSelfSwitches.setVariableValue([$gameMap.mapId(), interp._eventId, 10], nextBetRateByCurrentRate[currentBetRate]);
	};

	// Replaces (3x): data/Map003.json:map-event:141:page:1, data/Map003.json:map-event:247:page:1, data/Map007.json:map-event:53:page:1
	setValueBetCoinlist = function (interp) {
		cycleSelfSwitchVariable(interp);
		valueBetCoinlist = [10];   // ポーカー用ベットレート
	};

	// Replaces (3x): data/Map003.json:map-event:141:page:1, data/Map003.json:map-event:247:page:1, data/Map007.json:map-event:53:page:1
	setValueBetCoinlist2 = function (interp) {
		const nextBetRateByCurrentRate = { 10: 100, 100: 1000, 1000: 10000, 10000: 10 };
		const currentBetRate = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
		const nextBetRate = nextBetRateByCurrentRate[currentBetRate];
		$gameSelfSwitches.setVariableValue([$gameMap.mapId(), interp._eventId, 10], nextBetRate);
		valueBetCoinlist = [nextBetRate];
	};

	// Replaces (2x): data/Map003.json:map-event:142:page:1
	setValueMenuBackOpacity = function (opacity) {
		valueMenuBackOpacity = opacity;
	};

	// Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	showInfoPopupVar801And69 = function (interp) {
		setVar(801, 'おめでとう。');
		const betRate = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
		const coinPrize = betRate * 2;
		setVar(69, varValue(69) + coinPrize);
		showCommonInfo(`コイン+${coinPrize}枚`);
	};

	/* ============================================================================
	 * Selection / shop / items
	 * ========================================================================== */

	// Replaces (5x): data/CommonEvents.json:common-event:187, :188, :196
	selectEnemyDrop = function () {
		enemy_dropSelection($gameActors.actor(20));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:176
	addCustomChoice = function () {
		$gameSystem.addCustomChoice(1, { text: '未指定', value: 0 });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:259
	addCustomChoice2 = function () {
		const fontSize20 = fontSize(20);
		const skipCutsceneChoiceText = $dataSystem.switches[430];
		const fontSize28 = fontSize(28);
		$gameSystem.addCustomChoice(1, { text: `${fontSize20}${skipCutsceneChoiceText}${fontSize28}`, value: 99 });
	};

	// Replaces (1x): data/Map003.json:map-event:83:page:1
	addCustomChoiceVar22 = function () {
		const customChoiceText = varValue(22);   // variable 22: 乱数汎用2 (here: the choice text)
		$gameSystem.addCustomChoice(1, { text: `${customChoiceText}　　　　　　　　　　　　　`, value: 0 });
	};

	// Replaces (2x): data/CommonEvents.json:common-event:185
	setValueShopMaxCols = function () {
		valueShopMaxCols = 1;
		array = [];
	};

	// Replaces (2x): data/CommonEvents.json:common-event:185
	setValueShopMaxCols2 = function () {
		valueShopMaxCols = 2;
	};

	// Replaces (4x): data/CommonEvents.json:common-event:53, data/Map007.json:map-event:7:page:1
	gainItem = function (firstItemId, lastItemId) {
		range(firstItemId, lastItemId).forEach(itemId => {
			const item = $dataItems[itemId];
			if (item.name !== '') $gameParty.gainItem(item, 15);
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	useItemBulk = function () {
		valueCountSet1 = 0;
		valueIkkatuArray = [];
		[0, 1, 2].forEach(itemCategoryId => item_ikkatu(itemCategoryId));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	setValueIkkatuArray = function () {
		valueIkkatuArray = [];
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	setValueCountSet2_4 = function () {
		valueCountSet2 = valueIkkatuArray.length;
		valueCountSet3 = 0;   // +1で件数合計
		valueCountSet4 = 0;   // 個数累計
		valueCountSet5 = 0;   // 金額合計
		valueCountSet6 = 0;   // 変数57合計
		valueCountSet7 = 0;   // ｱｲﾃﾑID270合計
	};

	// Replaces (2x): data/CommonEvents.json:common-event:176
	writeVariableArraySlotVar19And293 = function (maxValue) {
		const trainingDummyCounts = varValue(293);   // variable 293: 訓練人形事前設定配列
		const itemId = varValue(19);
		trainingDummyCounts[itemId] += 1;
		if (trainingDummyCounts[itemId] >= maxValue) trainingDummyCounts[itemId] = 1;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:176
	writeVariableArraySlotVar293And20 = function (charaSlotId) {
		varValue(293)[charaSlotId] = varValue(20 + charaSlotId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:174
	setValueCountSet2 = function () {
		valueCountSet2 = 0;
		valueWordSet0 = 0;
		valueWordArray = [];
		valueCountArray = [];
		valueCountArray2 = [];
	};

	// Replaces (3x): data/CommonEvents.json:common-event:174
	setValueCountSet2_2 = function (wordIndex) {
		valueCountSet2 = 0;
		valueWordSet0 = wordIndex;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:174
	setValueCountSet2_3 = function (setValue) {
		valueCountSet2 = setValue;
		valueWordSet0 = 0;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:44, data/CommonEvents.json:common-event:45
	setValueWordSetEx = function () {
		valueWordSetEx = 0;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	setPickupSkillLabel = function () {
		$gameSystem._pickupData[0] = false;
		$dataSkills[26].name = '持ち上げ＜OFF＞';
	};

	/* ============================================================================
	 * Actor names (receptionists / shop keepers / NPCs)
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:192
	setActor21Name = function () {
		setNpcIdentity(21, '情報屋');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:239
	setActor21Name2 = function () {
		setNpcIdentity(21, '鑑定屋');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:305
	setActor21Name3 = function () {
		const weaponName76 = $dataWeapons[76].name;
		const weaponName22 = $dataWeapons[22].name;
		setNpcIdentity(21, `受付嬢${braceRight()} ${weaponName76} ${weaponName22}支部${braceLeft()}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
	setActor22Name = function () {
		const weaponName70 = $dataWeapons[70].name;
		setNpcIdentity(22, `受付${braceRight()} ${weaponName70}${braceLeft()}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:401
	setActor22Name2 = function (nameVariableActorId) {
		$gameActors.actor(22).setName($gameActors.actor(nameVariableActorId).name().slice(0, 1));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:236
	setActor20NameVar400 = function () {
		setNpcIdentity(20, 'バニーさん', $dataWeapons[433].name);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:242, data/Map094.json:map-event:32:page:1
	setActor20NameVar400_2 = function (subtitle) {
		setNpcIdentity(20, '受付', subtitle);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:246
	setActor20NameVar400_3 = function () {
		setNpcIdentity(20, 'ピエロ', 'タートル・エクスペリエンス社');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:308, data/CommonEvents.json:common-event:355
	setActor20NameVar400_4 = function () {
		setNpcIdentity(20, 'ボスゴブリン', $dataSystem.switches[248]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:390, data/CommonEvents.json:common-event:576
	setActor20NameVar400_5 = function () {
		setNpcIdentity(20, '女将', $dataWeapons[434].name);
	};

	// Replaces (2x): data/Map003.json:map-event:155:page:1, data/Map022.json:map-event:6:page:1
	setActor20NameVar400_6 = function () {
		const weaponName76 = $dataWeapons[76].name;
		const weaponName22 = $dataWeapons[22].name;
		setNpcIdentity(20, '受付嬢', `${weaponName76}${weaponName22}支部`);
	};

	// Replaces (1x): data/Map003.json:map-event:164:page:1
	setActor20NameVar400_7 = function () {
		const weaponName402 = $dataWeapons[402].name;
		setNpcIdentity(20, '販売員', `${weaponName402}ギルド出張所`);
	};

	// Replaces (4x): data/Map003.json:map-event:188:page:1, data/Map024.json:map-event:2:page:1, ...
	setActor20NameVar400_8 = function () {
		const weaponName77 = $dataWeapons[77].name;
		const weaponName22 = $dataWeapons[22].name;
		setNpcIdentity(20, '神官', `${weaponName77}${weaponName22}支部`);
	};

	// Replaces (2x): data/Map003.json:map-event:229:page:1, data/Map023.json:map-event:3:page:1
	setActor20NameVar400_9 = function () {
		setNpcIdentity(20, '鍛冶師', $dataWeapons[401].name);
	};

	// Replaces (2x): data/Map003.json:map-event:230:page:1, data/Map021.json:map-event:10:page:1
	setActor20NameVar400_10 = function () {
		setNpcIdentity(20, '鑑定師', $dataWeapons[403].name);
	};

	// Replaces (2x): data/Map003.json:map-event:233:page:1, data/Map022.json:map-event:9:page:1
	setActor20NameVar400_11 = function () {
		setNpcIdentity(20, '錬金術師', '流れの錬金術師');
	};

	// Replaces (1x): data/Map018.json:map-event:27:page:1
	setActor20NameVar400_12 = function () {
		setNpcIdentity(20, 'おばさん', 'ネルガド住民');
	};

	// Replaces (1x): data/Map018.json:map-event:28:page:1
	setActor20NameVar400_13 = function () {
		setNpcIdentity(20, 'お姉さん', 'ネルガド住民');
	};

	// Replaces (1x): data/Map022.json:map-event:3:page:1
	setActor20NameVar400_14 = function () {
		setNpcIdentity(20, '販売員', $dataWeapons[402].name);
	};

	// Replaces (1x): data/Map048.json:map-event:3:page:1
	setActor20NameVar400_15 = function () {
		const weaponName76 = $dataWeapons[76].name;
		const weaponName41 = $dataWeapons[41].name;
		setNpcIdentity(20, '受付', `${weaponName76}${weaponName41}支部`);
	};

	// Replaces (1x): data/Map003.json:map-event:237:page:1
	setActor20NameVar400And23Etc = function () {
		setNpcIdentity(20, '宿受付', $dataWeapons[421].name);
		valueCountSet1 = 1231;
		valueCountSet2 = 1232;
		const innPriceText = variableText(21);   // variable 21: 乱数汎用1 (here: the nightly price)
		setVar(23, `「いらっしゃい。\nウチは一泊${innPriceText}${goldIcon()}よ。\n泊まっていくのかしら？」\n`);
		setVar(22, '$FACE[People4, 5]');
	};

	// Replaces (1x): data/Map046.json:map-event:4:page:1
	setActor20NameVar400And23Etc2 = function () {
		setNpcIdentity(20, '宿女将', $dataWeapons[421].name);
		valueCountSet1 = 1231;
		valueCountSet2 = 1232;
		const innPriceText = variableText(21);   // variable 21: 乱数汎用1 (here: the nightly price)
		setVar(23, `「いらっしゃい。\nウチは一泊${innPriceText}${goldIcon()}よ。\n泊まっていくかしら？」\n`);
		setVar(22, '$FACE[People4, 5]');
	};

	/* ============================================================================
	 * Standing-picture helpers and NPC presets
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:160
	configureStandingPicture2Var20And3 = function () {
		if ($gameParty.inBattle()) return;
		setVar(20, varValue(3));
		tachie_settei2();
	};

	// Replaces (1x): data/CommonEvents.json:common-event:160
	showStandingPicture1AndGetPreviousStandingPicIdVar3 = function (interp) {
		if ($gameParty.inBattle()) return;
		tachie_hyouji1(varValue(3));
		callStandingPicturePlugin(interp);
	};

	// Replaces (3x): data/Map007.json:map-event:4:page:1, :6:page:1, :23:page:1
	showStandingPicture1AndGetPreviousStandingPicIdVar20Switch42 = function (interp) {
		enableSwitch(42);
		tachie_hyouji1(varValue(CURRENT_ACTOR_VAR));
		callStandingPicturePlugin(interp);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	showStandingPicture1 = function () {
		enableSwitch(42);
		tachie_hyouji1(varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301
	moveStandingPicture1 = function (actorPictureId) {
		valuePic1 = actorPictureId;
		picTachie_move1(valuePic1, -500, 0, 0, 0, 0, 60);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:307
	moveStandingPicture1_2 = function () {
		valuePic1 = 13;
		const pictureScaleX = $gameScreen.picture(valuePic1).scaleX();
		picTachie_move1(valuePic1, 0, 0, -pictureScaleX * 2, 0, 255, 60);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:338
	startStandingPictureDialogue = function (interp, sideCount) {
		// 「一人で立ち絵変化させる時は4」「NPC会話の時は0」
		tachie_kaiwastart(false, false, 1, sideCount);
		runCommonEventAsChild(interp, 18);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:414, data/CommonEvents.json:common-event:451
	startStandingPictureDialogue2 = function (rightSideCount) {
		// 急ぎ, 拡大, 右人数, 左人数
		tachie_kaiwastart(false, true, rightSideCount, 1);
	};

	/* ============================================================================
	 * Camera / weather / background
	 * ========================================================================== */

	// Replaces (4x): data/CommonEvents.json:common-event:331, :337, Map007.json:map-event:4:page:1, :6:page:1
	zoomCamera = function (easing) {
		zoomCameraOnEvent(easing);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:338, :361, :471
	zoomCamera2 = function (interp) {
		zoomCameraOnEvent(interp._eventId, 1.5);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:331, :338, :356, :359, :536, :546, ...
	zoomCameraVar530And292 = function (eventSlotIndex) {
		// NOTE: the original declared `easing` twice (shadowing bug); kept verbatim.
		let easing = eventSlotIndex;
		easing = spawnedEventId(easing);
		zoomCameraOnEvent(easing);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:511, :552, data/Map094.json:map-event:45:page:1
	zoomCameraVar530And292_2 = function (interp) {
		interp._eventId = spawnedEventId(varValue(LEAD_ACTOR_VAR));
		zoomCameraOnEvent(interp._eventId);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/Map007.json:map-event:4:page:1
	setMapWeather2Var256 = function () {
		setVar(256, 11);   // 火事
		map_weatherSet2();
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301
	setMapWeather2Var256_2 = function (weatherType) {
		setVar(256, weatherType);   // 本降り
		map_weatherSet2();
	};

	// Replaces (7x): data/CommonEvents.json:common-event:368, :409, :412, :414, :495, :532, ...
	selectMapMusicAndSelectMapParallax = function () {
		setMap_musicSelect(1, 22, 0);       // 種別, id, 0屋内1屋外
		setMap_parallaxSelect(1, 22, 1);
		backGraund_menuMapSelect(2, 0, 0, 0);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:516, data/CommonEvents.json:common-event:526
	selectMapParallax = function (parallaxName) {
		setMap_parallaxSelect(0, parallaxName, 0);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:406, :496, :517, :518, :519
	selectMapParallaxAndSelectMenuMapBackground = function () {
		setMap_parallaxSelect(0, 21, 0);
		backGraund_menuMapSelect(2, 'Dungeon1_2', 0, 0);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:410
	selectMenuMapBackground = function (mapBackgroundName) {
		backGraund_menuMapSelect(2, mapBackgroundName, 0, 0);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:516, :517, :518, :519
	selectMenuMapBackgroundDungeon1_2 = function () {
		backGraund_menuMapSelect(2, 'Dungeon1_2', 0, 0);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:442, data/CommonEvents.json:common-event:552
	setBackgroundLine = function (bgsLineId) {
		$gameSystem.setBgsLine(bgsLineId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:303, data/CommonEvents.json:common-event:324
	saveBgmAndFadeOut = function (duration) {
		$gameSystem.saveBgm();
		AudioManager.fadeOutBgm(duration);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:301, :304, :305, ...
	assignSelfVariableFromSystemSwitch = function (interp, variableId, switchId) {
		setSelfVar(interp, variableId, $dataSystem.switches[switchId]);
	};

	// Replaces (1x): data/Map005.json:map-event:2:page:1
	resetScreenToneTemp = function () {
		$gameScreen._tone_temp = 0;
	};

	// Replaces (1x): data/Map005.json:map-event:2:page:1
	pushLoadScene = function () {
		SceneManager.push(Scene_Load);
	};

	/* ============================================================================
	 * Screen effects / SE
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:61, data/CommonEvents.json:common-event:62
	flashScreenVar121 = function () {
		$gameScreen.startFlash([255, 119, 255, 200], varValue(121));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:61, data/CommonEvents.json:common-event:62
	shakeScreen = function () {
		$gameScreen.startShake(7, 7, varValue(121));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:481
	flashScreen = function () {
		$gameScreen.startFlash([255, 119, 255, 200], 60);
		$gameScreen.startShake(7, 7, 20);
		$gameScreen.startAnimation(640 - 256, 368, 634, false);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:61
	playSeEffectVar122 = function () {
		playPitchVariableSe('鼓動');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:62
	playSeEffectVar122_2 = function () {
		playPitchVariableSe('Z_HeartBeat');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:196
	requestEventAnimation = function (animationId) {
		$gameMap.event(valueEnemyEventId).requestAnimation(animationId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:124
	requestEventAnimationVar223 = function (interp, animationId) {
		interp.character(varValue(223)).requestAnimation(animationId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:105, data/CommonEvents.json:common-event:122, data/CommonEvents.json:common-event:205
	setGlossaryText1AndSetGlossaryText2 = function () {
		forEachDatabaseMeta($dataItems, 'SG種別', (itemId, glossaryCategory) => {
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
	moveNpcCharacterByIdVar292 = function (moveRouteCode) {
		moveSpawnedEvents(moveRouteCode, 0, [3, 4, 5]);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:331, :337, :339, :530
	moveNpcCharacterByIdVar292_2 = function (slotIndex, slotIndex2, moveRouteCode) {
		moveSpawnedEvents(moveRouteCode, 0, [slotIndex, slotIndex2]);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:338, :346, :361, :471, :530
	moveNpcCharacterByIdVar292_3 = function (slotIndex, moveRouteCode, moveRouteParameters) {
		moveSpawnedEvents(moveRouteCode, moveRouteParameters, [slotIndex]);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:368, :495, :532, :548
	moveNpcCharacterByIdVar292_4 = function () {
		// 1下移動 16下向く 39透明化
		moveSpawnedEvents(16, 0, [1, 11]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
	moveNpcCharacterByIdVar292_5 = function () {
		const slotIndexes = [1, 12];
		moveSpawnedEvents(16, 0, slotIndexes);
		moveSpawnedEvents(45, 'this.requestBalloon(1);', slotIndexes);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:327, :332, :349
	movePartyCharacter = function (moveRouteCode) {
		event_partyCharaMove(moveRouteCode, 0);   // 19上を向く
	};

	// Replaces (2x): data/CommonEvents.json:common-event:356
	movePartyCharacterVar530And292 = function () {
		const targetEventId = spawnedEventId(varValue(LEAD_ACTOR_VAR));
		event_partyCharaMove(45, `this.moveTowardCharacter($gameMap.event(${targetEventId}));`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
	readVariable292 = function (interp, slotIndex) {
		interp._eventId = spawnedEventId(slotIndex);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:248, data/CommonEvents.json:common-event:249
	readVariable196 = function (interp) {
		interp._eventId = varValue(196);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:300, data/Map007.json:map-event:3:page:1
	setEventCharacterAfterimageVar292 = function (interp) {
		const AFTERIMAGE_TYPE = 20;
		event_charaZanzou(interp._eventId, AFTERIMAGE_TYPE);
		interp._eventId = spawnedEventId(AFTERIMAGE_TYPE);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:300, data/Map007.json:map-event:3:page:1
	setEventCharacterAfterimageVar292_2 = function (interp) {
		const AFTERIMAGE_TYPE = 19;
		event_charaZanzou(interp._eventId, AFTERIMAGE_TYPE);
		interp._eventId = spawnedEventId(AFTERIMAGE_TYPE);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:318, :326, :333
	requestEventAnimationVar292 = function () {
		spawnedEvent(12).requestAnimation(635);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:124
	setMapSelfSwitchVar52And223 = function () {
		selfSwitchOn(varValue(52), varValue(223), 'D');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	speakCharacterOneLinerVar292 = function () {
		speakOneLiner(null, 100, 'オラァッ！！', { eventId: spawnedEventId(11), fontWeight: 120 });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	speakCharacterOneLinerVar292_2 = function () {
		speakOneLiner(null, 100, 'ガハッッ！？', { eventId: spawnedEventId(5), fontWeight: 120 });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	speakCharacterOneLinerVar292_3 = function () {
		speakOneLiner(null, 100, 'フンッ！', { eventId: spawnedEventId(11) });
	};

	// Replaces (3x): data/CommonEvents.json:common-event:356
	speakCharacterOneLinerVar530And292 = function (interp, eventSlotIndex, pictureId) {
		const spawnedId = spawnedEventId(eventSlotIndex);
		interp._eventId = spawnedId;
		speakOneLiner(interp, pictureId, 'ガサゴソ──', {
			yOffsets: [-10], eventId: spawnedId, fontWeight: 180,
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:234
	speakCharacterOneLiner = function (interp) {
		speakOneLiner(interp, 100, '親愛なる隣人の旅路に祝福を──', { fontSize: 28, fontWeight: 240 });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:338
	speakCharacterOneLiner2 = function (interp) {
		speakOneLiner(interp, 100, 'ゴクゴクっ──', { fontWeight: 240 });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:541
	speakCharacterOneLiner3 = function (interp) {
		speakOneLiner(interp, 100, 'ガサゴソ…');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	speakCharacterOneLinerSourceHanSerifHeavy = function () {
		speakOneLiner(null, 76, '「ヒャッハァッッ！」', { eventId: 3, fontWeight: 120, fontFace: 'SourceHanSerif-Heavy' });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	speakCharacterOneLinerGenkaiMincho = function () {
		speakOneLiner(null, 77, '「ギャアアアアアアアアアッッ────！！」', { eventId: 3, fontFace: 'genkai-mincho' });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	speakCharacterOneLinerTamanegiv6 = function () {
		speakOneLiner(null, 100, 'ウオオオオォォッッ！！', { eventId: 6, fontFace: 'Tamanegiv6' });
	};

	// Replaces (3x): data/Map007.json:map-event:34:page:1
	speakCharacterOneLiner4 = function (interp) {
		valueSerialPictureId += 1;
		speakOneLiner(interp, valueSerialPictureId, ['「オラッ！」', '「オラァッ！」'], {
			fontWeight: 60,
			xOffsets: [-50, 0, 50, -100, 100],
			yOffsets: [-50, 0, 50, -100, 100],
			waitFrames: 20,
		});
	};

	/* ============================================================================
	 * NPC placement data / world settings
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:205
	setNpcProfession = function () {
		setNPCProfession();   // NPC役職名配列
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	setNpcFamilyName = function () {
		setNPCFamilyName();   // NPC苗字設定
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	addAllSacredBeastParams = function () {
		seisyoujuu_addParamsAll();   // 星晶獣強化反映
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	setTraitChangeAndSetInfoY = function () {
		trait_changeSetting(106);   // 信仰バフステート変動設定
		trait_changeSetting(107);   // 食事バフステート変動設定
		info_SetY(varValue(200));   // インフォY軸補正値ミニステで変更
	};

	// Replaces (1x): data/CommonEvents.json:common-event:101
	forceHomeMove = function () {
		set_homeMoveForced();   // 拠点に強制移動
	};

	// Replaces (1x): data/CommonEvents.json:common-event:85
	propagateLibido = function () {
		seiyoku_hanei();   // 性欲度情報を更新
	};

	// Replaces (2x): data/Map007.json:map-event:3:page:1
	setEnemyParams = function (paramValue) {
		[21, 22, 41, 42, 61, 62].forEach(enemyId => { $dataEnemies[enemyId].params[0] = paramValue; });
	};

	// Replaces (2x): data/Map007.json:map-event:3:page:1, data/Map007.json:map-event:7:page:1
	gainSkillMasteryLevel = function (actorId, skillId, levelGain) {
		$gameActors.actor(actorId).gainSkillMasteryLevel(skillId, +levelGain);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	gainSkillMasteryLevelActor1 = function () {
		const actor1 = $gameActors.actor(1);   // the one actor this entry point trains
		actor1.gainSkillMasteryLevel(101, +1);
		actor1.gainSkillMasteryUses(201, 15);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:342
	loadGameFont = function (interp, fontSize) {
		Graphics.loadFont('GameFont', fontSize);
		interp.wait(10);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	configureGatewayMessage = function () {
		$gameSystem.GWMessageSetting.useGW = 'ON';
		$gameSystem.GWMessageSetting.imgName = 'Dunjon008';
		$gameSystem.GWMessageSetting.fadeSpeed = 256;
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	setPlayerTransparent = function () {
		$gamePlayer.setTransparent(true);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:161
	hideFollowers = function () {
		if ($gameSwitches.value(209) || $gameSwitches.value(202)) $gamePlayer.hideFollowers();
		if ($gameSwitches.value(201) || $gameSwitches.value(205)) $gamePlayer.showFollowers();
	};

	// Replaces (1x): data/CommonEvents.json:common-event:161
	resetPlayerGraphic = function () {
		if ($gamePlayer.followers().follower(0).isVisible()) $gamePlayer.resetCustomizeGraphic();
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	moveReserveMembersToVariable = function (interp) {
		$gameParty.members().forEach(reserveMember => {
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
	showPopupMessage2Var292 = function (messageId) {
		message_popup2(messageId, 0, 2, 1);
	};

	// Replaces (8x): data/CommonEvents.json:common-event:342, :382, :511, data/Map094.json:map-event:45:page:1, ...
	showPopupMessage2Var292_2 = function (eventSlotIndex, popupType) {
		message_popup2(spawnedEventId(eventSlotIndex), 0, popupType, 1);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:431
	showPopupMessage2Var292_3 = function (eventSlotIndex, balloonId, popupType) {
		spawnedEvent(eventSlotIndex).requestBalloon(balloonId);
		message_popup2(spawnedEventId(eventSlotIndex), 0, popupType, 1);
	};

	// Replaces (1x): data/Map003.json:map-event:44:page:1
	addPopupOnomatopoeia1 = function (interp) {
		interp.addPopup(['add', 'text:ﾋﾟｲｲｲ──…']);
	};

	// Replaces (2x): data/Map003.json:map-event:62:page:1, data/Map003.json:map-event:63:page:1
	addPopupOnomatopoeia2 = function (interp) {
		interp.addPopup(['add', 'text:ホゥ…']);
	};

	// Replaces (1x): data/Map003.json:map-event:64:page:1
	addPopupOnomatopoeia3 = function (interp) {
		interp.addPopup(['add', 'text:ペンっ']);
	};

	// Replaces (4x): data/Map003.json:map-event:57:page:1, :58:page:1, :59:page:1, data/Map126.json:map-event:4:page:1
	selectAnimalAction = function (interp) {
		valueanimalEvent2Id = 0;
		animal_ActionSelect(interp._eventId);
		if (valueanimalEvent2Id != 0) interp.addPopup(['add', `text:${valueanimalEvent2Id}`]);
		else interp.wait(30);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:471
	showMapCenterLabel = function (interp, switchId) {
		const placeName = $dataSystem.switches[switchId];   // name of the switch passed as switchId
		map_centerDispray(55, centerLabel(`【${placeName}】`));
		interp.wait(40);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	showPicture91 = function () {
		$gameScreen.setPicturesAnimation(2, 1, '横', 40);
		showPic(91, '画面ピンク', 640, 384, 100, 100, 200, 1);
		$gameScreen.picture(91).startAnimationFrame(1, true, 1);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:221
	showPicture3 = function () {
		const pictureName = $gameSwitches.value(488) ? 'PictureBottan3a' : 'PictureBottan3';
		showPic(3, pictureName, 255, 39, 100, 100, 255, 1);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:243, data/CommonEvents.json:common-event:244
	showPicture1 = function (pictureName) {
		const PICTURE_ID = 100;
		const pictureFrame = [4, 5, 6, 7][getRandomIndex(4)];
		pic_1(2, PICTURE_ID, pictureName, pictureFrame, 100, 255, 20, 1280, 768, 0, 0);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1
	showPicture1Xev100_00back = function () {
		pic_1(0, 53, 'Xev100_00back', 0, 100, 255, 60, 1280, 768, -256, 0);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:221
	showPictureFromArgs = function (pictureId, pictureName, origin, x, y) {
		showPic(pictureId, pictureName, x, y, 100, 100, 255, origin);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:221
	showPictureFromArgs2 = function (pictureId, pictureName, x, secondPictureId, secondPictureName, secondX) {
		showPic(pictureId, pictureName, x, 39, 100, 100, 255, 1);
		showPic(secondPictureId, secondPictureName, secondX, 39, 100, 100, 255, 1);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:451, data/Map007.json:map-event:4:page:1
	showPictureFromArgs3 = function (pictureId, pictureName, opacity) {
		showPic(pictureId, pictureName, 640, 384, 100, 100, opacity, 1);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:103
	logDebugValueActor20 = function () {
		console.log($gameActors.actor(20));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:64
	loadSkillPersonalSwitchAndSelectSkill = function (interp) {
		valueChangeSkill.forEach(skillId => skill_personalonoffload(skillId, 0));
		valueVariablesChangeSkill.forEach(skillId => skill_sentaku(skillId, 0));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	loadSkillPersonalSwitch = function (interp) {
		valuePersonalSkill.forEach(skillId => skill_personalonoffload(skillId, 0));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	loadSkillPersonalSwitch2 = function (interp) {
		valuePersonalItem.forEach(itemId => skill_personalonoffload(itemId, 1));
	};

	/* ============================================================================
	 * Debug helpers
	 * ========================================================================== */

	// Replaces (4x): data/CommonEvents.json:common-event:53
	logVariableValue = function (variableId) {
		console.log(varValue(variableId));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:53, data/CommonEvents.json:common-event:199
	logDebugValue3 = function (value) {
		console.log(value);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:52
	logDebugValue = function (metaKey, metaValueIndex, picturePathPrefix) {
		let pictureSlot = 1;
		for (let entryId = 1; entryId < $dataItems.length; entryId += pictureSlot) {   // NOTE: original stepped by pictureSlot (kept verbatim)
			for (let metaIndex = 1; metaIndex <= 9; metaIndex++) {
				const metaValue = $dataItems[entryId].meta[metaKey + metaIndex];
				if (metaValue) {
					const pictureName = picturePathPrefix + metaValue.split(',')[metaValueIndex];
					showDebugPicture(pictureSlot, entryId, pictureName);
					pictureSlot += 1;
				}
			}
		}
	};

	// Replaces (3x): data/CommonEvents.json:common-event:52
	logDebugValue2 = function (metaKey) {
		forEachSteppedMetaEntry($dataWeapons, metaKey, (entryId, metaValue, pictureSlot) => {
			showDebugPicture(pictureSlot, entryId, '/img/parallaxes/' + metaValue.split(',')[0]);
			return true;
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:52
	playItemMusicFromMetaName = function (metaKey) {
		forEachSteppedMetaEntry($dataItems, metaKey, (entryId, metaValue) => {
			const bgmName = metaValue.split(',')[0];
			if (bgmName === 'NoMusic') return false;
			playMetaBgm(entryId, bgmName);
			return true;
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:52
	playItemMusicFromMetaName2 = function (metaKey) {
		forEachSteppedMetaEntry($dataWeapons, metaKey, (entryId, metaValue) => {
			const bgmName = metaValue.split(',')[0];
			if (bgmName === 'NoMusic') return false;
			playMetaBgm(entryId, bgmName);
			return true;
		});
	};

	// Replaces (7x): data/Map003.json:map-event:180:page:1, Map193.json events
	logDebugValue4 = function () {
		console.log(`${$gameMap.tileId(6, 14, 1)}`);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	logDebugValue5 = function () {
		console.log($dataItems[7].recipeItem[1]);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	logDebugValue6 = function (interp) {
		value1 = DataManager.getSynthesisIngredient($dataItems[234], 0);
		console.log(valueItemsSynth1);
		setSelfVar(interp, 21, value1.id + 1000);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	logDebugValueVar20 = function () {
		const treasurePool = eval(`valueDanjonTreasure${varValue(CURRENT_ACTOR_VAR)}`);
		const treasureKindPool = eval(`valueDanjonTrSyurui${varValue(CURRENT_ACTOR_VAR)}`);
		console.log(treasurePool);
		console.log(treasureKindPool);
		const pickedTreasureId = treasurePool[getRandomIndex(treasurePool.length)];
		const pickedIndex = treasurePool.findIndex(treasureId => treasureId === pickedTreasureId);
		if (pickedIndex >= 0) treasurePool.splice(pickedIndex, 1);
		console.log(treasurePool);
		console.log($dataItems[pickedTreasureId].name);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	readActorCharacterInfo = function () {
		const targetActor = $gameActors.actor(n);   // dead reads, kept verbatim
		targetActor._characterIndex;
		targetActor._characterName;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:53, data/Map007.json:map-event:2:page:1
	pickRandomIndexes = function () {
		// ｱｸﾀｰID, ﾋﾟｸﾁｬ, H相手(301ﾓﾌﾞ305対象なし306ｱｲﾃﾑ), 非表示, 簡易, 過去シーンか否か
		i1 = getRandomIndex(3) + 100;
		const presetValues = [1, 2, 3, 4, 5];
		i2 = presetValues[getRandomIndex(presetValues.length)];
	};

	// Replaces (2x): data/CommonEvents.json:common-event:49
	dropCachedMapData = function () {
		delete window.$dataMap2;
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	runCommonScript1 = function (interp) {
		// id, ｲﾍﾞid, 速度, 頻度, ｱﾆid, x, y, 高さ, 回転数, 角度
		common_script1(26, interp._eventId, 6, 5, 131, 4, 0, 15, 2, 90);
		runCommonEventAsChild(interp, 64);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	checkPlayerOnEventAndStoreEventId = function (interp) {
		interp.character(0).x == interp.character(-1).x && interp.character(0).y == interp.character(-1).y;
		value2 = $gameMap.eventIdXy(9, 3);
		setVar(2, value2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:18, data/CommonEvents.json:common-event:53
	initWeaponSlotVariableArrays = function () {
		range(541, 560).forEach(variableId => setVar(variableId, Array(43).fill(0)));
	};

	// Replaces (7x): data/CommonEvents.json:common-event:18, :66, :67, :110, :212, Map005.json:map-event:2:page:1, ...
	showAndMovePicturePairFromArgs = function (pictureId, pictureName, scaleX, scaleY, opacity, toScaleX, toScaleY, toOpacity, duration) {
		showPic(pictureId, pictureName, 640, 384, scaleX, scaleY, opacity, 1);
		movePic(pictureId, 640, 384, toScaleX, toScaleY, toOpacity, duration, 1);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:19, :20, data/Map005.json:map-event:2:page:1
	moveTwoPicturesFromArgs = function (pictureId, scaleY, duration, secondPictureId, secondScaleY, secondDuration) {
		movePic(pictureId, 640, 384, 100, scaleY, 0, duration, 1);
		movePic(secondPictureId, 640, 384, 100, secondScaleY, 0, secondDuration, 1);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:19, data/CommonEvents.json:common-event:20
	configureStandingPicture2Var247And20 = function (interp) {
		forEachHeroine(heroineId => {
			if (!$gameParty.members().contains($gameActors.actor(heroineId))) return;
			range(0, 42).forEach(slotIndex => {
				varValue(heroineId + 440)[slotIndex] = varValue(heroineId + 540)[slotIndex];
			});
			setVar(CURRENT_ACTOR_VAR, heroineId);
			tachie_settei2();
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:64
	subtractVariables = function (resultVariableId, minuendVariableId, subtrahendId, subtrahend2Id) {
		setVar(resultVariableId,
			varValue(minuendVariableId) - varValue(subtrahendId) - varValue(subtrahend2Id));
	};
	/* ============================================================================
	 * Remaining helpers and map-event utilities
	 * ========================================================================== */

	// Replaces (3x): data/CommonEvents.json:common-event:10, data/CommonEvents.json:common-event:21
	setValueStartCommentary0 = function () {
		valueStartCommentary0 = 1;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:22
	setSelfVariable539Var540 = function (interp) {
		const restingActorName = variableText(49);   // variable 49: 名前
		appendStoredSelfLine(interp, `${restingActorName}は傷付いた身体を休めた…。\n`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:83
	setSelfVariable539Var540_2 = function (interp) {
		const actorName = actor.name();
		const fontColor27 = fontColor(27);
		const fontColor0 = fontColor(0);
		appendStoredSelfLine(interp, `${actorName}は${fontColor27}発情${fontColor0}した肢体を慰めている…。\n`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:83
	setSelfVariable539Var540_3 = function (interp) {
		const actorName = actor.name();
		const fontColor27 = fontColor(27);
		const fontColor0 = fontColor(0);
		appendStoredSelfLine(interp, `${actorName}は${fontColor27}発情${fontColor0}した肢体を持て余している…。\n`);
	};

	// Replaces (11x): data/CommonEvents.json:common-event:338, :481, :503, :536, :537, :544, ...
	setDarknessOpacity = function (opacity) {
		$gameMap.darknessOpacity = opacity;
	};

	// Replaces (7x): data/CommonEvents.json:common-event:392, Map003.json events, Map018.json events
	temporarilySaveNpc = function () {
		Npc_TemporarilySave(0, 1);   // 終了処理
	};

	// Replaces (1x): data/CommonEvents.json:common-event:101
	updateActorFromVariable11 = function () {
		setVar(49, actorNameWithPartySuffix(11, '達'));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516
	updateActorFromVariable530 = function () {
		setVar(21, actorNameWithPartySuffix(LEAD_ACTOR_VAR, '一行'));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:72, data/Map005.json:map-event:2:page:1
	closeGameWindow = function () {
		window.close();
	};

	/* ============================================================================
	 * Self switches (bulk helpers)
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:11, data/CommonEvents.json:common-event:24
	setMapSelfSwitch = function (selfSwitchKey) {
		range(1, 500).forEach(mapId => {
			range(1, 200).forEach(eventId => selfSwitchOff(mapId, eventId, selfSwitchKey));
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:314
	setMapSelfSwitch2 = function (selfSwitchKey) {
		mapSelfSwitchOn(selfSwitchKey, 'A');
	};

	// Replaces (4x): data/CommonEvents.json:common-event:331, :511, data/Map094.json:map-event:45:page:1
	setMapSelfSwitch3 = function (eventId, selfSwitchKey) {
		mapSelfSwitchOn(eventId, selfSwitchKey);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:390, :391, :393, :399, :530
	setMapSelfSwitch4 = function (firstEventId, secondEventId) {
		mapSelfSwitchOn(firstEventId, 'C');
		mapSelfSwitchOn(secondEventId, 'C');
	};

	// Replaces (3x): data/Map003.json:map-event:7:page:1, data/Map046.json:map-event:9:page:1, data/Map197.json:map-event:6:page:1
	setMapSelfSwitch5 = function (interp, firstItemId, secondItemId) {
		const hasEitherItem =
			$gameParty.hasItem($dataItems[firstItemId], true) || $gameParty.hasItem($dataItems[secondItemId], true);
		$gameSelfSwitches.setValue([$gameMap.mapId(), interp._eventId, 'B'], !hasEitherItem);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:205, :292, :313
	setMapSelfSwitchMapFirsttAction = function (selfSwitchKey) {
		const mapId = $gameMap.mapId();
		for (let eventId = 1; eventId < 100; eventId++) {
			const mapEvent = $gameMap.event(eventId);
			if (!mapEvent) continue;
			if (mapEvent.event().meta['MapFirsttAction']) {
				selfSwitchOff(mapId, eventId, selfSwitchKey);
				break;
			}
		}
	};

	// Replaces (26x): data/CommonEvents.json:common-event:241, :301, :336, :337, :338, :344, ...
	// The wide-spread alias of `setMapSelfSwitch3` — folded into that one definition.
	enableMapSelfSwitchForEvent = setMapSelfSwitch3;

	// Replaces (9x): data/CommonEvents.json:common-event:241, :292, :305, :310, :316, :336, ...
	/* NOTE: despite the name, this one turns the switch OFF — kept as-is so the
	   data-file calls keep working. */
	enableMapSelfSwitchForEventAtKey = function (eventId, selfSwitchKey) {
		mapSelfSwitchOff(eventId, selfSwitchKey);
	};

	/* ============================================================================
	 * Picture erasing (public helpers)
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:21, data/Map003.json:map-event:75:page:1
	eraseTwoPictures = function (firstPictureId, secondPictureId) {
		$gameScreen.erasePicture(firstPictureId);
		$gameScreen.erasePicture(secondPictureId);
	};

	// Replaces (14x): data/CommonEvents.json:common-event:21, :111, :112, :167, :173, :183, ...
	erasePictureRange = function (firstPictureId, lastPictureId) {
		erasePictureRangeBetween(firstPictureId, lastPictureId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:66, data/Map007.json:map-event:23:page:1
	erasePictureById = function (pictureId) {
		$gameScreen.erasePicture(pictureId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:47, data/CommonEvents.json:common-event:87
	erasePictureP = function (firstPictureId, lastPictureId, eraseStyleId) {
		range(firstPictureId, lastPictureId).forEach(pictureId => pic_eraseP(eraseStyleId, [pictureId]));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:94
	movePictureRowAndWait = function (interp, pictureId, duration, waitFrames) {
		const PICTURE_ROW_OFFSET = 60;
		movePic(pictureId + 1 + PICTURE_ROW_OFFSET, 1280 / 2, 768 / 2, 100, 100, 0, duration, 1);
		interp.wait(waitFrames);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:44, data/CommonEvents.json:common-event:45
	movePicture1 = function () {
		range(51, 60).forEach(pictureId => pic_move1(pictureId, -100, 0, 100, 100, 0, 60));
	};

	/* ============================================================================
	 * Ticker info fetching
	 * ========================================================================== */

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:309
	fetchInfoDirectVar71 = function (databaseEntryId, itemAmount) {
		fetchInfo(0, databaseEntryId, itemAmount);
	};

	// Replaces (16x): data/CommonEvents.json:common-event:306, :310, :314, :325, :330, :336, ...
	fetchInfoDirectVar71_2 = function (databaseTypeId, databaseEntryId, itemAmount) {
		fetchInfo(databaseTypeId, databaseEntryId, itemAmount);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:309, data/CommonEvents.json:common-event:334
	fetchInfoDirectVar71_3 = function (databaseTypeId, databaseEntryId, secondDatabaseEntryId, itemAmount) {
		fetchInfoWithLeadingEntry(databaseTypeId, databaseEntryId, 0, secondDatabaseEntryId, itemAmount);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:316, :319, :368, :495, :532, :548
	fetchInfoDirectVar71_4 = function (databaseEntryId, databaseTypeId, secondDatabaseEntryId, itemAmount) {
		fetchInfoWithLeadingEntry(0, databaseEntryId, databaseTypeId, secondDatabaseEntryId, itemAmount);
	};

	/* ============================================================================
	 * Variable-driven flags / switches
	 * ========================================================================== */

	// Replaces (5x): data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:256
	flagIfAnySlotFilled = function (firstSlotIndex, lastSlotIndex, switchId) {
		const costumeSlotValues = varValue(360 + varValue(CURRENT_ACTOR_VAR));
		const maxSlotValue = range(firstSlotIndex, lastSlotIndex)
			.map(slotIndex => costumeSlotValues[slotIndex])
			.filter(slotValue => slotValue >= 1)
			.reduce((maxValue, slotValue) => Math.max(maxValue, slotValue), 0);
		if (maxSlotValue >= 1) enableSwitch(switchId);
	};

	// Replaces (2x): data/Map003.json:map-event:133:page:2
	readVariable327 = function (weaponSlotIndex, unlockedSwitchId, lockedSwitchId, secondWeaponSlotIndex, secondUnlockedSwitchId, secondLockedSwitchId) {
		const isWeaponUnlocked = slotIndex => varValue(327)[slotIndex] >= 1;
		applyFlagToSwitch(unlockedSwitchId, isWeaponUnlocked(weaponSlotIndex));
		applyFlagToSwitch(lockedSwitchId, !isWeaponUnlocked(weaponSlotIndex));
		applyFlagToSwitch(secondUnlockedSwitchId, isWeaponUnlocked(secondWeaponSlotIndex));
		applyFlagToSwitch(secondLockedSwitchId, !isWeaponUnlocked(secondWeaponSlotIndex));
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	applyActorHHistory2 = function () {
		actor_Hhennreki2(varValue(19));
		// 選択肢番号は、実際の配列番号+1にしている。
		// もしピクチャ表示する場合は注意。
	};

	/* ============================================================================
	 * Spawned-event positioning / animations
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:356
	readVariable530Var292 = function (interp, x, direction, x2, y, direction2) {
		const firstCharacter = interp.character(spawnedEventId(3));
		firstCharacter.locate(x, 14);
		firstCharacter.setDirection(direction);
		const secondCharacter = interp.character(spawnedEventId(4));
		secondCharacter.locate(x2, y);
		secondCharacter.setDirection(direction2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:359
	readVariable530Var292_2 = function (firstSlotIndex, x, y, direction, secondSlotIndex, x2, y2, direction2) {
		placeSpawnedEvent(firstSlotIndex, x, y, direction);
		placeSpawnedEvent(secondSlotIndex, x2, y2, direction2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:389, data/CommonEvents.json:common-event:509
	readVariable530Var292_3 = function () {
		const leadEvent = spawnedEvent(varValue(LEAD_ACTOR_VAR));
		leadEvent.locate(18, 10);
		leadEvent.setDirection(8);
		leadEvent._spriteOffsetY = -12;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:451
	readVariable530Var292_4 = function (interp) {
		interp._eventId = spawnedEventId(1);   // 主格キャラ
	};

	// Replaces (5x): data/CommonEvents.json:common-event:495, :532, :548, :572, :573
	readVariable530Var292_5 = function (characterIndex) {
		spawnedEvent(varValue(LEAD_ACTOR_VAR)).setImage('1_1', characterIndex);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
	readVariable530Var292_6 = function () {
		placeSpawnedEvent(11, 34, 20, 2);
		placeSpawnedEvent(varValue(LEAD_ACTOR_VAR), 34, 19, 2);
	};

	// Replaces (2x): data/Map100.json:map-event:11:page:1
	requestEventAnimationVar19 = function (interp, animationId) {
		interp.character(varValue(19)).requestAnimation(animationId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/Map007.json:map-event:3:page:1
	bindInterpreterToEventId = function (interp, eventId) {
		interp._eventId = eventId;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:552
	// Same as `bindInterpreterToEventId` above — folded into it.
	bindInterpreterToEventIdVar292 = bindInterpreterToEventId;

	/* ============================================================================
	 * Cut-in / GabText plugin commands
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:138
	runPluginCommandGabText = function (interp) {
		const gabActorName = $gameActors.actor(2).name();
		callPluginCommand(interp, 'GabText', `${gabActorName}「ああ！　我らの力、見せてやろう！！」`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:138
	runPluginCommandGabText2 = function (interp) {
		const gabActorName = $gameActors.actor(1).name();
		const characterName2 = characterName(2);
		callPluginCommand(interp, 'GabText', `${gabActorName}「はい、${characterName2}さん！」`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:138
	configureActorFromVariable20GabText = function (interp) {
		const speakerName = currentActor().name();
		const defaultLine = '「行きますよ、皆さん！」';
		const characterName2 = characterName(2);
		const partnerCallLine = `「${characterName2}さん、行きましょう！」`;
		const message = $gameActors.actor(2).isStateAffected(234) ? speakerName + partnerCallLine : speakerName + defaultLine;
		callPluginCommand(interp, 'GabText', message);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:138
	configureActorFromVariable20Actor1 = function (interp) {
		const speakerName = currentActor().name();
		const defaultLine = '「往くぞ！」';
		const characterName1 = characterName(1);
		const partnerCallLine = `「往くぞ、${characterName1}！」`;
		const message = $gameActors.actor(1).isStateAffected(234) ? speakerName + partnerCallLine : speakerName + defaultLine;
		callPluginCommand(interp, 'GabText', message);
	};

	/* ============================================================================
	 * H-experience tables
	 * ========================================================================== */

	// Replaces (6x): data/CommonEvents.json:common-event:370, :371, :372, :373, :383, :384
	showHExperienceTable1 = function (requestedPartnerWeaponId) {
		h_keikenhyouji1(521, requestedPartnerWeaponId);   // 記録変数, 相手ID
	};

	// Replaces (11x): data/CommonEvents.json:common-event:294, :368, :370, :371, :372, :373, ...
	showHExperienceTable2 = function (requestedPartnerWeaponId) {
		h_keikenhyouji2(521, requestedPartnerWeaponId);   // backGraund_menuMapSelectで消去
	};

	// Replaces (5x): data/CommonEvents.json:common-event:516, :517, :518, :519, :526
	showHExperienceTable1_2 = function (interp, scenePicName, episodeItemId, requestedPartnerWeaponId) {
		valueScenePic = scenePicName;
		setSelfVar(interp, LEAD_ACTOR_VAR, 1);        // 主格キャラ
		setSelfVar(interp, NPC_PRESET_INDEX_VAR, episodeItemId);   // 挿話回想の場合アイテムID。メインは0
		h_keikenhyouji1(521, requestedPartnerWeaponId);   // 記録変数, 相手ID, 名前id21に名前と役職名
		valueWeatherSceneSet = 0;
	};
	/* ============================================================================
	 * Child interpreters (dialogue / news tickers)
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:300
	setupChildInterpreter4 = function (interp) {
		setSelfVar(interp, CURRENT_ACTOR_VAR, 0);
		const fontColor16 = fontColor(16);
		const centralPlainsName = $dataSystem.switches[252];
		const fontColor0 = fontColor(0);
		valueWordSet0 = `全体マップに${fontColor16}${centralPlainsName}${fontColor0}が追加されました`;
		valueWordSetEx = 0;   // 補足が必要な場合
		runCommonEventAsChild(interp, 45);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:350
	setupChildInterpreter5 = function (interp) {
		setSelfVar(interp, CURRENT_ACTOR_VAR, 0);
		const forgottenSanctuaryName = $dataSystem.switches[259];
		valueWordSet0 = `${forgottenSanctuaryName}からクリア後ダンジョンに行けるようになりました`;
		valueWordSetEx = 0;   // 補足が必要な場合
		runCommonEventAsChild(interp, 45);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:312
	setupChildInterpreter7 = function (interp, talkPictureId) {
		const centralPlainsName = switchName(252);   // switch 252: 中央平原
		showOneLineTalk(interp, 19, [talkPictureId, 28, `${centralPlainsName}の出現エネミーが変化しました。`, 255]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:471
	setupChildInterpreter12 = function (interp, talkPictureId) {
		showOneLineTalk(interp, 21, [talkPictureId, 250, interp._eventId]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:530
	setupChildInterpreter13 = function (interp, talkPictureId) {
		// 1で付与 2で直接表示 \CE[60]のみ 0で解除, ｱｸﾀｰid, ﾌﾚｰﾑ60,40,20
		showOneLineTalk(interp, 16, [talkPictureId, 1, 60]);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:338, :368, :495, :532, :547, :548
	setupChildInterpreterVar2 = function (interp, forgetItemId) {
		setSelfVar(interp, CURRENT_ACTOR_VAR, varValue(2));
		setSelfVar(interp, 19, forgetItemId);
		setSelfVar(interp, 14, 16);   // 14ｱｲﾃﾑ称号 15ｽｷﾙ習得 16忘却, 変数19にID
		runCommonEventAsChild(interp, 44);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:234
	setupChildInterpreterForQuestSet = function (interp) {
		valueCountSet1 = Number($gameMap.event(interp._eventId).event().meta['QuestSet']);
		showOneLineTalk(interp, 10, [24, questDialogueText(valueCountSet1), 1]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:371, data/CommonEvents.json:common-event:372
	setupChildInterpreter11 = function (interp, questItemId) {
		valueCountSet1 = questItemId;
		showOneLineTalk(interp, 10, [24, questDialogueText(valueCountSet1), 1]);
	};

	// Replaces (2x): data/Map003.json:map-event:166:page:2, data/Map003.json:map-event:243:page:2
	setupChildInterpreter15 = function (interp) {
		showOneLineTalk(interp, 10, [24, questDialogueText(valueCountSet1), 0]);
	};

	// Replaces (3x): data/Map003.json:map-event:168:page:2, data/Map007.json:map-event:69:page:2, data/Map064.json:map-event:1:page:3
	setupChildInterpreter16 = function (interp) {
		showOneLineTalk(interp, 10, [24, questDialogueText(valueCountSet1)]);
	};

	// Replaces (2x): data/Map003.json:map-event:166:page:2, data/Map003.json:map-event:243:page:2
	showTickerQuestAccepted = function () {
		const fontColor3 = fontColor(3);
		const questItemIcon = itemIconName(valueCountSet1);   // the quest item (valueCountSet1)
		const fontColor0 = fontColor(0);
		showTicker(`クエスト${fontColor3}${questItemIcon}${fontColor0}を受注しました。`);
		$gameParty.gainItem($dataItems[valueCountSet1], 1);
	};
	/* ============================================================================
	 * Actor announcement messages (reuses the shared helpers)
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:235
	configureActorFromVariable20Var21 = function () {
		const setString2 = setString(varValue(CURRENT_ACTOR_VAR));
		const ruby2 = ruby('昇格', 'レアリティ・アップ');
		setVar(21, `${setString2}は、<${valueCountSet1}>に${ruby2}した！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:254
	configureActorFromVariable20Var21_2 = function () {
		setVar(21, decorateWithActorName(
			'を初期化します。よろしいですか？\n（H履歴は影響ありませんが、\n各種開発度ランクはリセットされます。\nサブジョブのレベルは完全にはリセットされません）'));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:254
	configureActorFromVariable20Var21_3 = function () {
		setVar(21, decorateWithActorName('のリセット処理が完了しました。'));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:313
	configureActorFromVariable20Var21_4 = function () {
		const setString2 = setString(varValue(CURRENT_ACTOR_VAR));
		const skillIcon405 = skillIconName(405);
		const ruby2 = ruby('昇格', 'レアリティ・アップ');
		setVar(21, `${setString2}は、${skillIcon405}に${ruby2}した！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:259
	configureActorFromVariable20Var801And21 = function () {
		const className = $dataClasses[varValue(21)].name;
		setVar(801, decorateWithActorName(
			`は[${className}]のジョブ解放条件を満たしていません…。\n`));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	configureActorFromVariable20_2 = function (interp) {
		setSecondJobAwakeningMessage(interp, 1, '　　');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	configureActorFromVariable20_3 = function (interp) {
		setSecondJobAwakeningMessage(interp, 2, '　　');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	configureActorFromVariable20_4 = function (interp) {
		setSecondJobAwakeningMessage(interp, 3, '　　');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	configureActorFromVariable20_5 = function (interp) {
		setSecondJobAwakeningMessage(interp, 4, '　　');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	configureActorFromVariable20_6 = function (interp) {
		setSecondJobAwakeningMessage(interp, 5, '　　　　　　');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	setVariable21TextVar22 = function () {
		const weaponName74 = $dataWeapons[74].name;
		setVar(21, `空賊A ${braceRight()}${weaponName74}`);
		setVar(22, `空賊B ${braceRight()}${weaponName74}`);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301
	setVariable21TextVar22_2 = function () {
		const weaponName79 = $dataWeapons[79].name;
		setVar(21, `少年 ${braceRight()}${weaponName79}`);
		const weaponName74 = $dataWeapons[74].name;
		setVar(22, `空賊C ${braceRight()}${weaponName74}`);
	};

	// Replaces (4x): data/Map054.json:map-event:2:page:1..4
	setupBoss = function (interp, bossSlotIndex, bossId) {
		setSelfVar(interp, 29, bossSlotIndex);
		boss_setup1(2, bossId);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	appendStateDescription = function () {
		const STATE_ID = 110;
		if (!$dataStates[STATE_ID].meta['Help Description']) return;
		$dataStates[STATE_ID].description += '\nあああああ';
	};

	// Replaces (3x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:7:page:1
	runPluginCommandVar75And76 = function (interp, levelGain) {
		forEachDeployedActor(actorId => {
			callPluginCommand(interp, 'gainJp', actorId, levelGain, $gameActors.actor(actorId)._classId);
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
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc = function (npcSlotIndex) {
		respawnLeadActorFromPreset(1);
		respawnSideNpcFromPreset(npcSlotIndex);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:308, :317, :320, :327, :328
	setupRespawnEnemyAVar530And163Etc = function () {
		respawnLeadActorFromPreset(1);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:306, data/CommonEvents.json:common-event:336
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc2 = function () {
		respawnActorFacing(varValue(LEAD_ACTOR_VAR), 7, 9, 1, 4);
		respawnSideNpcFromPreset(11, 6);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:325, data/CommonEvents.json:common-event:338
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc3 = function (interp) {
		respawnLeadActorFromPreset(1);
		respawnSideNpcFromPreset(11);
		interp._eventId = spawnedEventId(11);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:389, :507, :508, :509
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc4 = function (interp) {
		const leadActorId = varValue(LEAD_ACTOR_VAR);
		respawnActorFacing(leadActorId, 12, 10, 1, 4);
		interp._eventId = spawnedEventId(leadActorId);
		event_respawnSetN(11, 13, 10, 0, 'npcUnique1', 0, 4);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:441, data/CommonEvents.json:common-event:552
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc5 = function () {
		const npcPreset = currentNpcPreset();
		const leadEvent = respawnActor(varValue(LEAD_ACTOR_VAR), 15, 4, 0);
		leadEvent.setImage(npcPreset[1], npcPreset[2]);
		leadEvent.setDirection(6);
		respawnNpcFacing(11, 16, 4, 1, npcPreset[6], npcPreset[7], 2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:442
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc6 = function (interp, posX, posY, zoomFlag, posX2, posY2, zoomFlag2) {
		const leadActorId = varValue(LEAD_ACTOR_VAR);
		const npcPreset = currentNpcPreset();
		const leadEvent = respawnActor(leadActorId, posX, posY, zoomFlag);
		leadEvent.setImage(npcPreset[1], npcPreset[2]);
		leadEvent.setDirection(2);
		interp._eventId = spawnedEventId(leadActorId);
		respawnNpcFacing(11, posX2, posY2, zoomFlag2, npcPreset[6], npcPreset[7], 2);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:571, data/CommonEvents.json:common-event:572, data/CommonEvents.json:common-event:573
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc7 = function (interp) {
		const leadActorId = varValue(LEAD_ACTOR_VAR);
		const npcPreset = currentNpcPreset();
		respawnActorFacing(leadActorId, 10, 11, 1, 4);
		interp._eventId = spawnedEventId(leadActorId);
		respawnNpcFacing(11, npcPreset[8], npcPreset[9], 0, npcPreset[6], npcPreset[7], 6);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:323, data/CommonEvents.json:common-event:332
	setupRespawnEnemyAVar530And163Etc2 = function (interp, posX, posY, direction) {
		const leadActorId = varValue(LEAD_ACTOR_VAR);
		respawnActorFacing(leadActorId, posX, posY, 1, direction);
		interp._eventId = spawnedEventId(leadActorId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:349, data/CommonEvents.json:common-event:542
	setupRespawnEnemyAVar530And163Etc3 = function (interp) {
		const leadActorId = varValue(LEAD_ACTOR_VAR);
		const npcPreset = currentNpcPreset();
		respawnActorFacing(leadActorId, npcPreset[3], npcPreset[4], 1, npcPreset[5]);
		interp._eventId = spawnedEventId(leadActorId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:430, data/CommonEvents.json:common-event:432
	setupRespawnEnemyAVar530And163Etc4 = function (interp) {
		const leadActorId = varValue(LEAD_ACTOR_VAR);
		const npcPreset = currentNpcPreset();
		const leadEvent = respawnActor(leadActorId, 8, 7, 1);
		leadEvent.setImage(npcPreset[1], npcPreset[2]);
		leadEvent.setDirection(6);
		interp._eventId = spawnedEventId(leadActorId);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:292, :304, :325, :327, :335, :339
	setupRespawnEnemyAVar530And292 = function () {
		respawnActorFacing(varValue(LEAD_ACTOR_VAR), 13, 5, 0, 2);
		respawnActorFacing(3, 14, 6, 0, 4);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:327
	setupRespawnEnemyAVar530And292_2 = function (slotIndex, posX, posY, direction) {
		respawnActor(slotIndex, posX, posY, 0).setDirection(direction);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:349
	setupRespawnEnemyAVar530And292_3 = function (interp, slotIndex, posX, posY, zoomFlag) {
		respawnActor(slotIndex, posX, posY, zoomFlag);
		interp._eventId = spawnedEventId(slotIndex);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:341, data/CommonEvents.json:common-event:342
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And292_2 = function (interp) {
		respawnActorFacing(5, 13, 6, 1, 4);
		interp._eventId = spawnedEventId(5);
		event_respawnSetN(11, 18, 10, 0, 'npcCastle1', 2, 4);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:441, data/CommonEvents.json:common-event:442, data/CommonEvents.json:common-event:552
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And292_3 = function (posX, posY, direction, posX2, posY2, imageName, imageIndex, direction2) {
		respawnActor(varValue(LEAD_ACTOR_VAR), posX, posY, 1).setDirection(direction);
		respawnNpc(11, posX2, posY2, 0, imageName, imageIndex).setDirection(direction2);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:370, data/CommonEvents.json:common-event:371, data/CommonEvents.json:common-event:383, data/CommonEvents.json:common-event:384
	// Marks the calling event as the lead-actor event (self variable 530 = 1) so
	// the respawn helpers can find it.
	setSelfVariable530 = function (interp) {
		setSelfVar(interp, LEAD_ACTOR_VAR, 1);
	};
	/* ============================================================================
	 * Last odds and ends
	 * ========================================================================== */

	/* --- text BGV (文字BGV) lines -------------------------------------------- */

	// Replaces (1x): data/CommonEvents.json:common-event:306
	// Heavy breathing (layer preset 1, speed 120).
	setVariable707Var706Switch125 = function () {
		const breathingLine = '「ハァ、ハァ…」';
		const pauseLine = '「ン………」';
		const gaspLine = '「ハァ…」';
		const exhaustedLine = '「ハァっ………」';
		startTextBGVoice([breathingLine, pauseLine, gaspLine, exhaustedLine], 1, 120);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:391
	// Moans (layer preset 0, speed 80).
	// NOTE: the last line carries a form-feed character where the maker code
	// `\FS[n]` was meant (the original wrote `\f` + `s[20]`) — kept exactly.
	setVariable707Var706Switch125_2 = function () {
		const voiceIcon = icon(12);
		const moanLine = `「アンっ${voiceIcon}」`;
		const secondLine = `「ヒゥンっ${voiceIcon}」`;
		const thirdLine = `「アッ${voiceIcon}　ンン${voiceIcon}」`;
		const fourthLine = `「ヒン\x0cs[20]ン\x0cs[28]っ${voiceIcon}」`;
		startTextBGVoice([moanLine, secondLine, thirdLine, fourthLine], 0, 80);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:531
	// Moans, slower cadence (layer preset 0, speed 120).
	setVariable707Var706Switch125_3 = function () {
		const voiceIcon = icon(12);
		const moanLine = `「アンっ${voiceIcon}」`;
		const secondLine = `「ヒゥンっ${voiceIcon}」`;
		const thirdLine = `「アッ${voiceIcon}　ンン${voiceIcon}」`;
		const fourthLine = `「ヒンンっ${voiceIcon}」`;
		startTextBGVoice([moanLine, secondLine, thirdLine, fourthLine], 0, 120);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:338
	// Moan sequence (layer preset 1, speed 180).
	setVariable707Var706Switch125_4 = function () {
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
	setVariable707Var706Switch125_5 = function () {
		const moanLine = '「………ァっ」';
		const secondLine = '「いや…」';
		const thirdLine = '「ンン──……」';
		const fourthLine = '「ンクっ…」';
		const fifthLine = '「ァンっ…」';
		startTextBGVoice([moanLine, secondLine, thirdLine, fourthLine, fifthLine], 1, 180);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548
	// Picks the 文字BGV word set (3 = high, 2 = medium, 1 = low) and displays it
	// (layer preset 1, speed 60).
	setHTextWord = function () {
		htext_word(3);                          // fills valueHtextWord
		startTextBGVoice([].concat(valueHtextWord), 1, 60);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:393, data/CommonEvents.json:common-event:399, data/CommonEvents.json:common-event:547
	setVariable318 = function (variableId) {
		// 文字HBGV: 呼び出し側が用意したセリフ群をそのまま流し込む
		setVar(318, varValue(variableId));
		setVar(706, [640 - 128, 386, 1, 80, 0, 'eromangasimaji']);
		enableSwitch(119);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:310, data/CommonEvents.json:common-event:314, data/CommonEvents.json:common-event:316
	setupRespawnEnemyAVar530 = function () {
		respawnActorFacing(varValue(LEAD_ACTOR_VAR), 13, 5, 0, 2);
		respawnActorFacing(3, 14, 6, 0, 4);
		respawnActorFacing(4, 12, 6, 0, 6);
		respawnActorFacing(5, 13, 7, 0, 8);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:307, :311, :317, :320
	lockMonsterSymbolRoute = function () {
		for (let eventId = 200; eventId > 0; eventId--) {
			const mapEvent = $gameMap.event(eventId);
			if (!mapEvent) continue;
			if (!mapEvent.event().meta['MonsterSymbol']) continue;
			mapEvent.forceMoveRoute({
				list: [
					{ code: 15, parameters: [600] },
					{ code: 0 },
				],
				repeat: true,
				skippable: true,
			});
		}
	};

	// Replaces (1x): data/Map100.json:map-event:11:page:1
	spendGoldForClass3JobMaterial = function () {
		spendGoldForJobMaterial(100000, 'クラス3ジョブ解放素材');
	};

	// Replaces (1x): data/Map100.json:map-event:11:page:1
	spendGoldForClass2JobMaterial = function () {
		spendGoldForJobMaterial(10000, 'クラス2ジョブ解放素材');
	};

	// Replaces (8x): data/CommonEvents.json:common-event:47, data/CommonEvents.json:common-event:166, data/CommonEvents.json:common-event:173, data/CommonEvents.json:common-event:174, data/CommonEvents.json:common-event:176, data/CommonEvents.json:common-event:183, …
	// Turns the visual-novel choice window off during a cutscene.
	disableVisualNovelChoices = function () {
		setVisualNovelChoices(false);
	};

	// Replaces (10x): data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:173, data/CommonEvents.json:common-event:183, data/CommonEvents.json:common-event:192, data/CommonEvents.json:common-event:203, data/CommonEvents.json:common-event:237, …
	// Turns the visual-novel choice window back on.
	enableVisualNovelChoices = function () {
		setVisualNovelChoices(true);
	};

})();
