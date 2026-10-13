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
		var colorCode2 = `\\C[2]`;
		var colorResetCode = `\\C[0]`;
		var messageText2 = `シーンの多くは、メインクエスト終了後に開放される。`;
		var textPart2 = `本作には多様な強化システムを採用しているが、\nメインクエストとシーン回収だけを考えれば、\n極論レベルを上げて剣と杖で殴っていれば問題ない。`;
		var textPart3 = `「朝昼」と「夜」では発生するイベントに変化がある。\nこれはメインクエストに措いても同様。\n進行条件が「〇〇に会いに行く」などの場合、\n夜では会えない事が多い。日を改めて日中に会いに行こう`;
		var textPart4 = `シーンや挿話には「同一人物のシーンは同日に発生しない」という\n縛りが存在する場合がある。\n日数経過をさせる事で発生するようになる。`;
		var textPart5 = `メインクエスト進行時の戦闘に、敗北Ｈはない`;
		var textPart6 = `Ｈエネミーはそのマップで敗北Ｈを経験する事で出現する。\nＨエネミーに敗北すると汎用全滅シーンが発生する。`;
		var textPart7 = `「称号」は、条件を満たした後、「一日の始まり」か「ギルド受付」と\n話した直後に付与される。`;
		$gameVariables.setValue(250,
		[	`${colorCode2}[1]${colorResetCode}${messageText2}`,
			`${colorCode2}[2]${colorResetCode}${textPart2}`,
			`${colorCode2}[3]${colorResetCode}${textPart3}`,
			`${colorCode2}[4]${colorResetCode}${textPart4}`,
			`${colorCode2}[5]${colorResetCode}${textPart5}`,
			`${colorCode2}[6]${colorResetCode}${textPart6}`,
			`${colorCode2}[7]${colorResetCode}${textPart7}`,
			`${colorCode2}[8]${colorResetCode}`,
			`${colorCode2}[9]${colorResetCode}`,
			`${colorCode2}[10]${colorResetCode}`
		]);
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

	// Replaces (1x): data/CommonEvents.json:common-event:1
	setVariable73 = function () {
		$gameVariables.setValue(73,1)//ヒロインキャラ始点変数
		$gameVariables.setValue(74,2)//ヒロインキャラ終点変数
		$gameVariables.setValue(247,[1,2])//ヒロインID配列変数
		$gameVariables.setValue(75,1)//登場キャラ始点変数
		$gameVariables.setValue(76,7)//登場キャラ終点変数
		$gameVariables.setValue(248,[1,2,3,4,5,6,7])//キャラID配列変数
	};

	// Replaces (2x): data/CommonEvents.json:common-event:1, data/CommonEvents.json:common-event:102
	setVariable68 = function () {
		$gameVariables.setValue(68,120)//GAB表示時間
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	setVariable71Var185 = function () {
		$gameVariables.setValue(71,180);//ティッカー表示時間
		$gameVariables.setValue(185,0);//TickerＹ軸変更
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	setVariable65 = function () {
		$gameVariables.setValue(65,180)//KMSポップアップ表示時間
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	setVariable279 = function () {
		$gameVariables.setValue(279,10)//ステート付与解除アニメウェイト
		$gameVariables.setValue(280,10)//280に上乗せ分ウェイト
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	setVariable254 = function () {
		$gameVariables.setValue(254,1);//メニュー表示変数1で固定
	};

	// Replaces (2x): data/CommonEvents.json:common-event:2, data/CommonEvents.json:common-event:53
	dumpLocationPresetToFile = function (variableId) {
		//LisciaBlueQuestフォルダに書き出し
		var variableValue = $gameVariables.value(variableId);
		fs.writeFileSync( "valueLocationPreset.txt" ,JSON.stringify(variableValue) )
	};

	// Replaces (19x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:109, data/CommonEvents.json:common-event:110, data/CommonEvents.json:common-event:111, data/CommonEvents.json:common-event:112, …
	setValueCountSet1 = function (countValue) {
		valueCountSet1 = countValue;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:192
	startParallelEvent = function (interp) {
		return (function () {
		if(valueCountSet1 != 0){
		  event_pararelStarting(1,valueCountSet1,interp._eventId);
		};
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:5, data/Map003.json:map-event:133:page:2
	spawnScreenParticleStatue_orb_c = function (interp) {
		return (function () {
		var particleName2 = 'statue_orb_c';
		$gameScreen._particle.particleSet(interp._eventId,particleName2+'-'+interp._eventId,'this',particleName2,'above');
		var particleName2 = 'statue_orb_c'+'-'+interp._eventId;
		$gameScreen._particle.particleUpdate([particleName2,'color','#ff00f7','#ffffff']);
		$gameScreen._particle.particleUpdate([particleName2,'pos',0,-35]);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:15
	movePictureKeepingScale = function (numericValue, duration) {
		var pictureId2 = 94;
		if($gameScreen.picture(pictureId2)){
		  var origin2 = $gameScreen.picture(pictureId2).origin();
		  var x4 = $gameScreen.picture(pictureId2).x();
		  var y5 = $gameScreen.picture(pictureId2).y();
		  var scaleX2 = $gameScreen.picture(pictureId2).scaleX();
		  var scaleY2 = $gameScreen.picture(pictureId2).scaleY();
		  var opacity2 = numericValue;//$gameScreen.picture(value1).opacity();
		  $gameScreen.movePicture(pictureId2,origin2,x4,y5,scaleX2,scaleY2,opacity2,0,duration);
		};
	};

	// Replaces (3x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:89
	spawnScreenParticleSpriteset = function (textValue) {
		var particleName2 = textValue;
		$gameScreen._particle.particleSet(0,particleName2,'screen','def','spriteset');
	};

	// Replaces (14x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:42, data/CommonEvents.json:common-event:65, data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:89, data/CommonEvents.json:common-event:132, …
	setValueCountSet3 = function (countValue) {
		valueCountSet3 = countValue;
	};

	// Replaces (14x): data/CommonEvents.json:common-event:5, data/CommonEvents.json:common-event:23, data/CommonEvents.json:common-event:42, data/CommonEvents.json:common-event:65, data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:89, …
	hideWindow = function (windowId) {
		WindowManager.hide(windowId);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:5, data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	setSelfVariable21 = function (interp) {
		return (function () {
		var randomValue4 = arr[getRandomIndex(arr.length)];
		let entryIndex2 = arr.findIndex(arr => arr === randomValue4); 
		if(entryIndex2 >= 0){
		arr.splice(entryIndex2, 1);
		}
		interp.sVal(21,arr);
		if(arr == 0){arr = [1,2,3,4,5]};
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:5
	eraseNpcEvents = function () {
		for (var eventId2 = $gameMap.events().length; eventId2 > 0; eventId2--) {
		if(!!$gameMap.event(eventId2)) {
		if ($gameMap.event(eventId2).event().meta['NPC'] ||
		$gameMap.event(eventId2).event().meta['動物'] ||
		$gameMap.event(eventId2).event().meta['Encounter Direction Lock'] ){
		$gameMap.eraseEvent(eventId2);
		}}};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:37
	eraseNpcEvents2 = function () {
		for (var eventId2 = $gameMap.events().length; eventId2 > 0; eventId2--) {
		if(!!$gameMap.event(eventId2)) {
		if ($gameMap.event(eventId2).event().meta['NPC'] ||
		$gameMap.event(eventId2).event().meta['Animal'] ||
		$gameMap.event(eventId2).event().meta['Encounter Direction Lock'] ){
		$gameMap.eraseEvent(eventId2);
		}}};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:9, data/Map003.json:map-event:133:page:2
	returnProfessionBasics = function () {
		var variable75Value = $gameVariables.value(75);
		var variable76Value = $gameVariables.value(76);
		for(var tempValue = variable75Value; tempValue <= variable76Value; tempValue++){
		  Profession_basicReturn(tempValue);
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:9
	nameWeaponsFromVariable = function (interp, variableId, variableId2, numericValue, textValue, variableId3, numericValue2) {
		return (function (variableId, variableId2, numericValue, textValue, variableId3, numericValue2) {
		interp.sVal(variableId,Array(101).fill(0));
		for(var weaponId2 = 301; weaponId2 <= 400; weaponId2++){
		  if(!$dataWeapons[weaponId2].name == '') {
		    if($dataWeapons[weaponId2].meta['SubstitutionActorId']){
		      var databaseEntries2 = Number($dataWeapons[weaponId2].meta['SubstitutionActorId']);
		      $gameVariables.value(variableId2)[weaponId2-300] = numericValue;
		    };
		    if($dataWeapons[weaponId2].meta[textValue]){
		      $gameVariables.value(variableId3)[weaponId2-300] = numericValue2;
		    };
		  };
		};
		}).call(interp, variableId, variableId2, numericValue, textValue, variableId3, numericValue2);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:9, data/CommonEvents.json:common-event:24, data/Map003.json:map-event:131:page:2
	removeStateFromListActorsVar248And380 = function (interp) {
		return (function () {
		var variable248Value = $gameVariables.value(248);
		variable248Value.forEach(function(id) {
		  $gameActors.actor(id).removeState(39);
		  $gameVariables.value(380 + id)[58] =  0;
		}, interp);
		}).call(interp);
	};

	// Replaces (11x): data/CommonEvents.json:common-event:9, data/CommonEvents.json:common-event:11, data/CommonEvents.json:common-event:12, data/CommonEvents.json:common-event:64, data/CommonEvents.json:common-event:254, data/Map003.json:map-event:133:page:2, …
	initSelfVariableArrayFromSize = function (interp, variableId, newValue) {
		return (function (variableId, newValue) {
		interp.sVal(variableId,Array(newValue).fill(0));
		}).call(interp, variableId, newValue);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:10, data/CommonEvents.json:common-event:21
	setValueStartCommentary0 = function () {
		valueStartCommentary0 = 1;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:11, data/CommonEvents.json:common-event:24
	setMapSelfSwitch = function (key) {
		for(var loopIndex = 1; loopIndex <= 500; loopIndex++){
		  for (var key3 = 200; key3 > 0; key3--) {
		    //if(!!$gameMap.event(id)) {
		      $gameSelfSwitches.setValue([loopIndex, key3, key], false);
		    //};
		  };
		};
	};

	// Replaces (4x): data/CommonEvents.json:common-event:12, data/CommonEvents.json:common-event:54, data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
	initVariableArrayFromSize = function (variableId, newValue) {
		$gameVariables.setValue(variableId,Array(newValue).fill(0));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:12, data/Map003.json:map-event:113:page:1
	writeVariableSlotFromIndex = function (variableId, variableId2, numericValue) {
		$gameVariables.value(variableId)[$gameVariables.value(variableId2)] = numericValue;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:12, data/CommonEvents.json:common-event:205
	hideSystemCursor = function () {
		$gameSystem._cursorHidden = true;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:12
	setVariable508 = function () {
		$gameVariables.setValue(508,'BlueSky')
	};

	// Replaces (1x): data/CommonEvents.json:common-event:431
	setVariable21Text = function () {
		var textPrefix = `幹部団員 `;
		var controlCode = `\\}`;
		var textSuffix = `秩序の騎空団`;
		$gameVariables.setValue(21,`${textPrefix}${controlCode}${textSuffix}`)
	};

	// Replaces (1x): data/CommonEvents.json:common-event:12
	setVariable55Text = function () {
		var messageText2 = `月`;
		$gameVariables.setValue(55, `${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:12
	setVariable515Text = function () {
		var messageText2 = `持ち上げoff`;
		$gameVariables.setValue(515, `${messageText2}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:290, data/CommonEvents.json:common-event:295
	setVariable21TextVar142 = function () {
		var controlCode = `\\SP[0]`;
		var textPrefix = `イベント：IIN[`;
		var textSuffix = `]は、既に閲覧済みです。\nスキップしますか？\n（そのイベントで獲得できる称号や性経験値などは入手できます。\n但し、獲得物に選択肢が関係する場合は入手できません）`;
		$gameVariables.setValue(21,
		`${controlCode}${textPrefix}${$gameVariables.value(142)}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	setQuestObjectiveHeadToRoyalCastle = function () {
		var messageText2 = `まずは王城へと向かいましょう。\n王都北側に入り口がある筈です。`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:303
	setQuestObjectiveHeadToInn = function () {
		var messageText2 = `宿へ向かいましょうか`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:304
	setQuestObjectiveHeadToGuild = function () {
		var messageText2 = `【騎空士ギルド】へ向かいましょう。\n確か、王城の手前ほどの場所にあったはずです`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:305
	setQuestObjectiveVisitInformant = function () {
		var messageText2 = `情報屋に会いに行きましょう。\n表向きは書店を営業していると聞いています`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:309
	setQuestObjectiveReturnToInn = function () {
		var messageText2 = `空賊に関する資料が届いているかも知れません。\n宿屋に戻りましょう`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:311
	setQuestObjectiveCaptureCentralPlainsBandits = function () {
		var textPrefix = `中央平原の空賊達を\n１０人捕縛(討伐)しましょう\n ＜`;
		var controlCode = `\\v[642]`;
		var textSuffix = ` / 10人＞`;
		$gameVariables.setValue(134,
		`${textPrefix}${controlCode}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:312
	setQuestObjectiveReachLevelTenThenChurch = function () {
		var characterName = `\\N[5]`;
		var textPrefix = `${characterName}くんのレベルを10に上げて教会へと向かいましょう。\n空賊達が居なくなった`;
		var locationName = `\\swi[252]`;
		var textSuffix = `${locationName}が、\n狩場に適してしるようですね。\n情報屋で情報を購入しておいた方が良いかも知れません。`;
		$gameVariables.setValue(134,
		`${textPrefix}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:313
	setQuestObjectiveLocateBanditHideout = function () {
		var messageText2 = `そろそろ、尋問が終わって空賊達の拠点が\n割り出されているでしょうか`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:314
	setQuestObjectiveHeadToVillage = function () {
		var messageText2 = `集落へと向かいましょうか`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:315
	setQuestObjectiveAskVillageElder = function () {
		var textPrefix = `この集落のまとめ役の方に\n`;
		var itemName = `\\in[26]`;
		var textSuffix = `${itemName}に関する\n情報を聞きに行きましょう`;
		$gameVariables.setValue(134,
		`${textPrefix}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:316
	setQuestObjectivePrepareCountermeasures = function () {
		var name1 = `\\swi[254]`;
		var textPrefix = `${name1}へ向かいましょう。`+`\n`;
		var state1Name = `\\sim[424]`;
		var state2Name = `\\sim[425]`;
		var textPart3 = `${state1Name}や${state2Name}対策を\nしておいた方が良いかも知れません。` +`\n`;
		var armorName = `\\ain[175]`;
		var textSuffix = `${armorName}などですね`;
		$gameVariables.setValue(134,
		`${textPrefix}${textPart2}${textPart3}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:317
	setQuestObjectiveSearchGraveyard = function () {
		var messageText2 = `この有様になった、原因がある筈です。\n墓地の中を調べていきましょう`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:318
	setQuestObjectiveDefeatGraveyardBoss = function () {
		var bossName = `\\swi[254]`;
		var messageText2 = `${bossName}のボスを討伐しましょう！`;
		$gameVariables.setValue(134,
		messageText2);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:319
	setQuestObjectiveHeadToNamedPlace = function () {
		var name = `\\swi[256]`;
		var messageText2 = `${name}へ向かいましょう`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:320
	setQuestObjectiveCrossForestToHideout = function () {
		var messageText2 = `この森を抜ければ空賊団のアジトです。\n行きましょう`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:321
	setQuestObjectiveRaidBanditHideout = function () {
		var messageText2 = `さあ、アジトへと突入しましょう！`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:322
	setQuestObjectiveDefeatHideoutBoss = function () {
		var controlCode = `\\swi[255]`;
		var messageText2 = `のボスを討伐しましょう！`;
		$gameVariables.setValue(134,
		`${controlCode}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:323
	setQuestObjectiveLeaveCastle = function () {
		var messageText2 = `城を出ましょう`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:324
	setQuestObjectiveRegroupAtInn = function () {
		var messageText2 = `宿に戻ってみんなと合流しましょう`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:325
	setQuestObjectiveHeadToNewlyFoundSite = function () {
		var textPrefix = `新しく発見されたという\n`;
		var controlCode = `\\in[22]`;
		var textSuffix = `へ向かいましょう`;
		$gameVariables.setValue(134,
		`${textPrefix}${controlCode}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:326
	setQuestObjectiveDefeatSiteBoss = function () {
		var controlCode = `\\swi[332]`;
		var messageText2 = `のボスを討伐しましょう！`;
		$gameVariables.setValue(134,
		`${controlCode}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:327
	setQuestObjectiveMeetCompanionAtPlace = function () {
		var name1 = `\\swi[223]`;
		var textPrefix = `${name1}へと向かい、`+`\n`;
		var charaName = `\\N[2]`;
		var textSuffix = `${charaName}さんと合流しましょう`;
		$gameVariables.setValue(134,
		`${textPrefix}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:328
	setQuestObjectiveBuySwimsuit = function () {
		var messageText2 = `雑貨屋に水着を買いに行きましょうか…`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:329
	setQuestObjectiveMeetCompanionAtBeach = function () {
		var charaName = `\\N[2]`;
		var text = `浜辺に行って${charaName}さんと合流しましょう。\nお昼でないと居ないでしょうから気を付けましょうね`;
		$gameVariables.setValue(134, text);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:330
	setQuestObjectiveAdvanceToNamedPlace = function () {
		var controlCode = `\\swi[284]`;
		var messageText2 = `へ向かいましょう。`;
		$gameVariables.setValue(134,
		`${controlCode}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:331
	setQuestObjectiveEnterFromEntrance = function () {
		var controlCode = `\\swi[284]`;
		var messageText2 = `にある入口から中に入りましょう`;
		$gameVariables.setValue(134,
		`${controlCode}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:332
	setQuestObjectiveGoDeeper = function () {
		var controlCode = `\\swi[285]`;
		var messageText2 = `の奥へと進みましょう──`;
		$gameVariables.setValue(134,
		`${controlCode}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:333
	setQuestObjectiveDefeatDepthBoss = function () {
		var controlCode = `\\swi[286]`;
		var messageText2 = `のボスを討伐しましょう！`;
		$gameVariables.setValue(134,
		`${controlCode}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:334
	setQuestObjectiveReturnAndRegroup = function () {
		var controlCode1 = `\\swi[221]`;
		var textPrefix = `に戻って、\n`;
		var controlCode2 = `\\N[4]`;
		var textSuffix = `さん達と合流しましょう`;
		$gameVariables.setValue(134,
		`${controlCode1}${textPrefix}${controlCode2}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:335
	setQuestObjectiveVisitInformantAgain = function () {
		var messageText2 = `情報屋を訪ねましょう`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:336
	setQuestObjectivePassFirstFloor = function () {
		var controlCode = `\\swi[334]`;
		var messageText2 = `へ向かいましょう。\n1層を通り抜けます`;
		$gameVariables.setValue(134,
		`${controlCode}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:337
	setQuestObjectiveRaidHut = function () {
		var messageText2 = `小屋に突入しましょう`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:338
	setQuestObjectiveHeadToLocalInn = function () {
		var controlCode = `\\swi[221]`;
		var messageText2 = `の宿に向かいましょう`;
		$gameVariables.setValue(134,
		`${controlCode}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:339
	setQuestObjectiveVisitCastleByDay = function () {
		var messageText2 = `日中に王城へ向かいましょう`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:340, data/CommonEvents.json:common-event:341
	setQuestObjectiveAwaitPlayerChoice = function () {
		var messageText2 = `どうしましょうか…`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:342
	setQuestObjectiveVisitChancellor = function () {
		var messageText2 = `宰相の元へ向かいましょう`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:343
	setQuestObjectiveFightKnightCommander = function () {
		var messageText2 = `謁見の間で、騎士団長との戦いです`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:344
	setQuestObjectiveHeadToFestivalHall = function () {
		var controlCode1 = `\\swi[254]`;
		var textPrefix = `の祭殿へ向かいましょう。\nそこから、`;
		var controlCode2 = `\\swi[257]`;
		var textSuffix = `へと行ける筈です`;
		$gameVariables.setValue(134,
		`${controlCode1}${textPrefix}${controlCode2}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:345
	setQuestObjectiveContinueMainQuest = function () {
		var controlCode = `\\swi[257]`;
		var messageText2 = `へ向かいましょう`;
		$gameVariables.setValue(134,
		`${controlCode}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:346
	setQuestObjectiveDefeatAreaBoss = function () {
		var controlCode = `\\swi[257]`;
		var messageText2 = `のボスを討伐しましょう！`;
		$gameVariables.setValue(134,
		`${controlCode}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:347
	setQuestObjectiveInvestigateNoise = function () {
		var messageText2 = `中で物音がしましたね。\n何か変化があったのかも知れません。\n行ってみましょう`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:348
	setQuestObjectiveFinalBattle = function () {
		var textPrefix = `最期の決戦です…。\n『尊き契りの間』の`;
		var controlCode = `\\set[7]`;
		var textSuffix = `を\n撃破しましょう！`;
		$gameVariables.setValue(134,
		`${textPrefix}${controlCode}${textSuffix}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:349, data/CommonEvents.json:common-event:350
	setQuestObjectiveMainQuestComplete = function () {
		var messageText2 = `何処に行きましょうか？\n（メインクエスト完了）`;
		$gameVariables.setValue(134,
		`${messageText2}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:12, data/CommonEvents.json:common-event:64
	setCostumeDirectSite = function (interp, newValue) {
		return (function (newValue) {
		interp.sVal(19,Number($dataActors[$gameVariables.value(newValue)].meta['MainCloth']));
		kisekae_tyokusetusitei($gameVariables.value(19),0);
		}).call(interp, newValue);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:12
	setBattleAnimationSpeed = function (battleAnimationSpeed) {
		ConfigManager.battleAniSpeed = battleAnimationSpeed;
	};

	// Replaces (18x): data/CommonEvents.json:common-event:12, data/CommonEvents.json:common-event:212, data/CommonEvents.json:common-event:295, data/Map007.json:map-event:23:page:1, data/Map035.json:map-event:20:page:1, …
	assignVariableValueFromArgs = function (variableId, newValue) {
		$gameVariables.setValue(variableId,newValue);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:13, data/CommonEvents.json:common-event:24
	clearGotItemInfo = function () {
		$gameParty.gotItemInfo = [];
	};

	// Replaces (2x): data/CommonEvents.json:common-event:13, data/CommonEvents.json:common-event:22
	grantTpToListActors = function (interp) {
		return (function () {
		var variable248Value = $gameVariables.value(248);
		variable248Value.forEach(function(id) {
		var tp2 = getRandomIndex(61) + 40;
		var actor3 = $gameActors.actor(id);
		actor3.gainTp(tp2);
		}, interp);
		}).call(interp);
	};

	// Replaces (89x): data/CommonEvents.json:common-event:13, data/CommonEvents.json:common-event:96, data/CommonEvents.json:common-event:270, data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:303, …
	runCommonEventAsChild = function (interp, list) {
		return (function (list) {
		interp.setupChild($dataCommonEvents[list].list, 0);
		}).call(interp, list);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:14
	setPicture = function (presetIndex) {
		var tempValue = pic_setArray3;
		var pictureName2 = tempValue[0];
		var pictureId2 = tempValue[1];
		var origin2 = tempValue[presetIndex];
		valuePicWait2 = tempValue[2] + Math.floor( Math.random() * (tempValue[3] * 2 + 1)) - tempValue[3];
		pic_set(pictureId2,pictureName2,
		origin2,valuePicWait2);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:14, data/CommonEvents.json:common-event:17
	playParallelPictureSeName = function () {
		var se2 = valueParallelPicSe1;
		if(se2[0] != 0){
		  var se3 = getRandomIndex(11) + Number(se2[1]);
		  var se4 = getRandomIndex(21) + Number(se2[2]);
		  AudioManager.playSe({"name":se2[0],"volume":se3,"pitch":se4,"pan":0});
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:15
	movePictureKeepingScale2 = function () {
		var pictureId2 = 95;
		if($gameScreen.picture(pictureId2)){
		  var origin2 = $gameScreen.picture(pictureId2).origin();
		  var x4 = $gameScreen.picture(pictureId2).x() - 90;
		  var y5 = $gameScreen.picture(pictureId2).y();
		  var scaleX2 = $gameScreen.picture(pictureId2).scaleX();
		  var scaleY2 = $gameScreen.picture(pictureId2).scaleY();
		  var opacity2 = $gameScreen.picture(pictureId2).opacity();
		  $gameScreen.movePicture(pictureId2,origin2,x4,y5,scaleX2,scaleY2,opacity2,0,1);
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:16, data/CommonEvents.json:common-event:205
	refreshPlayer = function () {
		$gamePlayer.refresh();
		$gameMap.requestRefresh();
	};

	// Replaces (2x): data/CommonEvents.json:common-event:17
	waitRandomPictureDelay = function (interp) {
		return (function () {
		if(valuePicWait >= 1){
		  var waitFrames = getRandomIndex(3);
		  interp.wait(valuePicWait + waitFrames);
		};
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:17
	slidePictureInFromRightAndWait = function (interp, duration, waitFrames) {
		return (function (duration, waitFrames) {
		var pictureId2 = 53;
		$gameScreen.movePicture(pictureId2+2,1,640+50-128,384,100,100,240,0,duration);
		interp.wait(waitFrames);
		}).call(interp, duration, waitFrames);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:17
	slidePictureInFromLeftAndWait = function (interp, duration, waitFrames) {
		return (function (duration, waitFrames) {
		var pictureId2 = 53;
		$gameScreen.movePicture(pictureId2+2,1,640-50-128,384,100,100,240,0,duration);
		interp.wait(waitFrames);
		}).call(interp, duration, waitFrames);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:18, data/CommonEvents.json:common-event:53
	initWeaponSlotVariableArrays = function () {
		for(var loopIndex = 541; loopIndex <= 560; loopIndex++){$gameVariables.setValue(loopIndex,Array(43).fill(0))};
	};

	// Replaces (7x): data/CommonEvents.json:common-event:18, data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:67, data/CommonEvents.json:common-event:110, data/CommonEvents.json:common-event:212, data/Map005.json:map-event:2:page:1, …
	showAndMovePicturePairFromArgs = function (numericValue, textValue, scaleX, scaleY, opacity, scaleX2, scaleY2, opacity2, duration) {
		var pictureId2 = numericValue;
		var pictureName2 = textValue;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640,384,scaleX,scaleY,opacity,0);
		$gameScreen.movePicture(pictureId2,1,640,384,scaleX2,scaleY2,opacity2,0,duration);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:19, data/CommonEvents.json:common-event:20, data/Map005.json:map-event:2:page:1
	moveTwoPicturesFromArgs = function (numericValue, scaleY, duration, numericValue2, scaleY2, duration2) {
		var pictureId2 = numericValue;
		$gameScreen.movePicture(pictureId2,1,640,384,100,scaleY,0,0,duration);
		var pictureId2 = numericValue2;
		$gameScreen.movePicture(pictureId2,1,640,384,100,scaleY2,0,0,duration2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:19, data/CommonEvents.json:common-event:20
	removeStateFromListActorsVar75And76 = function (interp) {
		return (function () {
		var tachieChangeStateTemporary = valueTachieChangeStateTemporary;
		tachieChangeStateTemporary.forEach(function(id1) {
		  var variable75Value = $gameVariables.value(75);
		  var variable76Value = $gameVariables.value(76);
		    for (var loopIndex = variable75Value; loopIndex <= variable76Value; loopIndex++) {
		      $gameActors.actor(loopIndex).removeState(id1);
		    };
		}, interp);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:19, data/CommonEvents.json:common-event:20
	configureStandingPicture2Var247And20 = function (interp) {
		return (function () {
		var variable247Value = $gameVariables.value(247);
		variable247Value.forEach(function(id) {
		  var actor3 = $gameActors.actor(id);
		    if($gameParty.members().contains(actor3)){
		      var rangeStart2 = 0; var rangeEnd2 = 42;
		        for (var slotIndex2 = rangeStart2; slotIndex2 <= rangeEnd2; slotIndex2++) {
		          $gameVariables.value(id+440)[slotIndex2] = $gameVariables.value(id+540)[slotIndex2]
		        };
		        $gameVariables.setValue(20,id);
		        tachie_settei2();
		}}, interp);
		}).call(interp);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:21, data/CommonEvents.json:common-event:173, data/CommonEvents.json:common-event:183, data/Map003.json:map-event:83:page:1
	fadePicture1Pic98 = function (textValue) {
		var pictureId2 = 100;
		var pictureName2 = 'ScreenFoundationChoice';
		$gameScreen.showPicture(pictureId2,pictureName2,0,0,0+300,100,100,0,0);
		$gameScreen.movePicture(pictureId2,0,0,0,100,100,255,0,120);
		var pictureId2 = 99;
		var pictureName2 = textValue;
		$gameScreen.showPicture(pictureId2,pictureName2,0,300+20,0,200,200,0,0);
		$gameScreen.movePicture(pictureId2,0,300,0,200,200,255,0,120);
		$gameScreen.showPicture(98,'ScreenBlackOut',1,640,384,100,100,150,0);
		picture_fade1(98,"fadeIn",valueWipeImg,60,5);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:21, data/Map003.json:map-event:75:page:1
	eraseTwoPictures = function (pictureId, pictureId2) {
		$gameScreen.erasePicture(pictureId);
		$gameScreen.erasePicture(pictureId2);
	};

	// Replaces (14x): data/CommonEvents.json:common-event:21, data/CommonEvents.json:common-event:111, data/CommonEvents.json:common-event:112, data/CommonEvents.json:common-event:167, data/CommonEvents.json:common-event:173, data/CommonEvents.json:common-event:183, …
	erasePictureRange = function (rangeStart, rangeEnd) {
		for (var loopIndex = rangeStart; loopIndex <= rangeEnd; loopIndex++) {$gameScreen.erasePicture(loopIndex)};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:22, data/CommonEvents.json:common-event:23
	clearJuseiFlag = function () {
		//受精してるキャラ以外の受精相手記録を消滅
		jusei_clear();
	};

	// Replaces (1x): data/CommonEvents.json:common-event:22
	setSelfVariable539Var540 = function (interp) {
		var variableCode = `\\V[49]`;
		var messageText2 = `は傷付いた身体を休めた…。\n`;
		return (function () {
		interp.sVal(539,`${variableCode}${messageText2}`);
		interp.sVal(540,$gameVariables.value(540) + 1);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:83
	setSelfVariable539Var540_2 = function (interp) {
		var textPrefix = `は`;
		var colorCode4 = `\\C[27]`;
		var textPart2 = `発情`;
		var colorResetCode = `\\C[0]`;
		var textSuffix = `した肢体を慰めている…。\n`;
		return (function () {
		interp.sVal(539,`${actor.name()}${textPrefix}${colorCode4}${textPart2}${colorResetCode}${textSuffix}`);
		interp.sVal(540,$gameVariables.value(540) + 1);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:83
	setSelfVariable539Var540_3 = function (interp) {
		var textPrefix = `は`;
		var colorCode4 = `\\C[27]`;
		var textPart2 = `発情`;
		var colorResetCode = `\\C[0]`;
		var textSuffix = `した肢体を持て余している…。\n`;
		return (function () {
		interp.sVal(539,`${actor.name()}${textPrefix}${colorCode4}${textPart2}${colorResetCode}${textSuffix}`);
		interp.sVal(540,$gameVariables.value(540) + 1);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:23
	drawWindowText = function () {
		var controlCode = `\\fs[22]`;
		var variableCode = `\\V[539]`;
		WindowManager.drawText(1, `${controlCode}${variableCode}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:23
	drawWindowText2 = function () {
		var controlCode = `\\fs[28]`;
		var variableCode = `\\V[539]`;
		WindowManager.drawText(1, `${controlCode}${variableCode}`);
	};

	// Replaces (1x): data/Map003.json:map-event:161:page:1
	drawWindowText3 = function () {
		WindowManager.drawText(0, ``);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:23, data/CommonEvents.json:common-event:25, data/CommonEvents.json:common-event:30, data/CommonEvents.json:common-event:54
	setPlayerPosition2 = function (variableId, newValue, newValue2, newValue3, x) {
		$gameVariables.setValue(variableId,[newValue,newValue2,newValue3]);
		set_playerPosition2(x);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:24, data/Map003.json:map-event:131:page:2
	resetSkillUseCounts = function () {
		var rangeStart2 = 1;
		var databaseEntries2 = $dataSkills.length-1;
		for (var skillId2 = rangeStart2; skillId2 <= databaseEntries2; skillId2++) {
		  if($dataSkills[skillId2].meta['Not Recover All Uses']){
		      for (var loopIndex = $gameVariables.value(75); loopIndex <= $gameVariables.value(76); loopIndex++) {
		        var databaseEntries3 = Number($dataSkills[skillId2].meta['Limit Uses']);
		        $gameActors.actor(loopIndex).paySkillLimitedUseCost(skillId2, -databaseEntries3);
		      };
		  };
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:24, data/Map003.json:map-event:131:page:2
	resetStateSpAbilities = function () {
		var rangeStart2 = 1;
		var databaseEntries2 = $dataStates.length-1;
		for (var stateId2 = rangeStart2; stateId2 <= databaseEntries2; stateId2++) {
		  if($dataStates[stateId2].meta['Category']){
		    if($dataStates[stateId2].meta['Category'] === ' StateSPabNomal'){
		      for (var loopIndex = $gameVariables.value(75); loopIndex <= $gameVariables.value(76); loopIndex++) {
		        $gameActors.actor(loopIndex).removeState(stateId2);
		      };
		    };
		  };
		};
	};

	// Replaces (5x): data/CommonEvents.json:common-event:29, data/CommonEvents.json:common-event:40
	setValueMenuCloth = function (menuClothId) {
		valueMenuCloth = menuClothId;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:29, data/CommonEvents.json:common-event:30
	setVariable71Var185_2 = function (newValue, newValue2) {
		$gameVariables.setValue(71,newValue);//ティッカー。計算式で使うため
		$gameVariables.setValue(185,newValue2);//TickerＹ軸変更
	};

	// Replaces (8x): data/CommonEvents.json:common-event:30, data/CommonEvents.json:common-event:64, data/CommonEvents.json:common-event:104, …
	updatePartyRows = function () {
		$gameParty.updateRows();
	};

	// Replaces (6x): data/CommonEvents.json:common-event:30, data/CommonEvents.json:common-event:64
	setVariable53 = function (newValue, newValue2) {
		$gameVariables.setValue(53,$gameActors.actor($gameVariables.value(newValue)).nickname());
		$gameVariables.setValue(49,$gameActors.actor($gameVariables.value(newValue2)).name());
	};

	// Replaces (2x): data/CommonEvents.json:common-event:30, data/CommonEvents.json:common-event:221
	setSwitch74 = function () {
		if(!$gameParty.hasItem($dataItems[$gameVariables.value(240)])){
		  $gameSwitches.setValue(74,true);
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:37
	noop = function () {
		//original_autoEventFlag();
	};

	// Replaces (1x): data/CommonEvents.json:common-event:37
	setSwitch516 = function () {
		if($gameVariables.value(1+440)[41] == 2){
		  $gameSwitches.setValue(516,true);
		} else {
		  $gameSwitches.setValue(516,false);
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	applyEvolvedStateToParty = function () {
		for (var memberIndex = 0; memberIndex < $gameParty.members().length; memberIndex++) {
		  if ($gameParty.members()[memberIndex].isStateAffected(61) && !$gameParty.members()[memberIndex].isStateAffected(71)) {
		    $gameParty.members()[memberIndex].addState(71);
		}};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	configureActorFromVariable2 = function () {
		//オーバードーズ状態でスイッチオンオフ
		var variable2Value = $gameActors.actor($gameVariables.value(2));
		var constantValue = 863;
		var switchId2 = 502;
		if(variable2Value.battleSkillsRaw().includes(constantValue)){
		$gameSwitches.setValue(switchId2,true);
		} else {
		$gameSwitches.setValue(switchId2,false);
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	syncLearnedSkillSwitches = function () {
		//主人公性欲度スキルでonoff
		var variable11Value = $gameActors.actor($gameVariables.value(11));
		var rangeStart2 = 1;
		var rangeEnd2 = 10;
		for (var actorId3 = rangeStart2; actorId3 <= rangeEnd2; actorId3++) {
		if(variable11Value.isLearnedSkill(actorId3 + 60)){
		$gameSwitches.setValue(actorId3 + 400,true);
		} else {
		$gameSwitches.setValue(actorId3 + 400,false);
		}};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	autoOffSkillPersonalSwitch = function (interp) {
		return (function () {
		//習得者不在時に自動でスイッチオフ
		var personalSkill = valuePersonalSkill;
		personalSkill.forEach(function(id) {
		  if($dataSkills[id].meta.SwicthOnOffUse){
		    if($gameParty.membersLeSkill(id)){}else{
		      skill_personalonoffAutoOff(id,0);
		  }};
		}, interp);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	autoOffSkillPersonalSwitch2 = function (interp) {
		return (function () {
		//習得者不在時に自動でスイッチオフ
		var personalItem = valuePersonalItem;
		personalItem.forEach(function(id) {
		  if($dataItems[id].meta.SwicthOnOffUse){
		    if(!$gameParty.hasItem($dataItems[id],true)){
		      skill_personalonoffAutoOff(id,1);
		  }};
		}, interp);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	readVariable75 = function () {
		//現在の視点によってスイッチ切り替え
		var variable75Value = $gameVariables.value(75);
		var variable76Value = $gameVariables.value(76);
		for (var loopIndex = variable75Value; loopIndex <= variable76Value; loopIndex++) {
		  $gameSwitches.setValue(440 + loopIndex,false);
		  if($gameVariables.value(11) == loopIndex){
		    $gameSwitches.setValue(440 + loopIndex,true);
		  };
		};
	};

	// Replaces (4x): data/CommonEvents.json:common-event:42, data/CommonEvents.json:common-event:47
	showTickerNoPendingScenes = function () {
		var messageText2 = `未発生のシーンは存在しません。`;
		TickerManager.show(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:66
	showTickerNoEpisodesOnThisMap = function () {
		var messageText2 = `条件が変動した為、現在このマップで発生する挿話はありません`;
		TickerManager.show(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	showTickerNoQuickSaveInBattleMap = function () {
		var messageText2 = `戦闘マップではクイックセーブを行なえません`;
		TickerManager.show(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	showTickerNoQuickSaveWhileRecalling = function () {
		var messageText2 = `回想中はクイックセーブを行なえません`;
		TickerManager.show(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	showTickerQuickSavedToFile51 = function () {
		var messageText2 = `ファイル５１にクイックセーブしました`;
		TickerManager.show(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	showTickerQuickSavedToLastFile = function () {
		var messageText2 = `最終使用ファイルにクイックセーブしました`;
		TickerManager.show(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	showTickerQuickSavedToFile1 = function () {
		var messageText2 = `ファイル１にクイックセーブしました`;
		TickerManager.show(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:202
	showTickerBattleSpeedSetToFastest = function () {
		var messageText2 = `戦闘速度を最速に変更しました`;
		TickerManager.show(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:202
	showTickerBattleSpeedSetToFast = function () {
		var messageText2 = `戦闘速度を速いに変更しました`;
		TickerManager.show(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:202
	showTickerBattleSpeedSetToNormal = function () {
		var messageText2 = `戦闘速度を通常に変更しました`;
		TickerManager.show(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:259
	showTickerVariable801 = function () {
		var variableCode = `\\V[801]`;
		TickerManager.show(`${variableCode}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:44, data/CommonEvents.json:common-event:45
	movePicture1 = function () {
		for (var loopIndex = 51; loopIndex <= 60; loopIndex++) {
		  pic_move1(loopIndex,-100,0,100,100,0,60);
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:44, data/CommonEvents.json:common-event:45
	setValueWordSetEx = function () {
		valueWordSetEx = 0;
	};

	// Replaces (8x): data/CommonEvents.json:common-event:47, data/CommonEvents.json:common-event:166, data/CommonEvents.json:common-event:173, data/CommonEvents.json:common-event:174, data/CommonEvents.json:common-event:176, data/CommonEvents.json:common-event:183, …
	disableVisualNovelChoices = function () {
		$gameSystem.vnChoices = false;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:47, data/CommonEvents.json:common-event:87
	erasePictureP = function (rangeStart, rangeEnd, eraseStyleId) {
		for (var loopIndex = rangeStart; loopIndex <= rangeEnd; loopIndex++) {pic_eraseP(eraseStyleId,[loopIndex])};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:49
	dropCachedMapData = function () {
		delete window.$dataMap2;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:52
	logDebugValue = function (textValue, numericValue, textValue2) {
		var textValue3 = textValue;
		var databaseEntries2 = $dataItems;var tempValue = databaseEntries2.length-1;
		var loopIndex = 1;
		for(var loopIndex2 = 1; loopIndex2 <= tempValue; loopIndex2++){
		  for(var constantValue = 1; constantValue <= 9; constantValue++){
		    if(databaseEntries2[loopIndex2].meta[textValue3+constantValue]){
		      var pictureName2 = databaseEntries2[loopIndex2].meta[textValue3+constantValue].split(',')[numericValue];
		      var pictureName2 = textValue2 + pictureName2;
		      console.log(`${loopIndex2}  ${pictureName2}`);
		      $gameScreen.showPicture(loopIndex,pictureName2,1,640-128,384,100,100,255,0);
		      loopIndex += 1;
		}}};
	};

	// Replaces (3x): data/CommonEvents.json:common-event:52
	logDebugValue2 = function (textValue) {
		var textValue2 = textValue;
		var databaseEntries2 = $dataWeapons;var tempValue = databaseEntries2.length-1;
		var loopIndex = 1;
		for(var loopIndex2 = 1; loopIndex2 <= tempValue; loopIndex2++){
		  if(databaseEntries2[loopIndex2].meta[textValue2]){
		    var pictureName2 = databaseEntries2[loopIndex2].meta[textValue2].split(',')[0];
		      var pictureName2 = '/img/parallaxes/' + pictureName2;
		      console.log(`${loopIndex2}  ${pictureName2}`);
		    $gameScreen.showPicture(loopIndex,pictureName2,1,640-128,384,100,100,255,0);
		    loopIndex += 1;
		}};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:52
	playItemMusicFromMetaName = function (textValue) {
		var textValue2 = textValue;
		var databaseEntries2 = $dataItems;var tempValue = databaseEntries2.length-1;
		var loopIndex = 1;
		for(var loopIndex2 = 1; loopIndex2 <= tempValue; loopIndex2++){
		  if(databaseEntries2[loopIndex2].meta[textValue2]){
		    var bgm2 = databaseEntries2[loopIndex2].meta[textValue2].split(',')[0];
		    if(bgm2 != 'NoMusic'){
		      console.log(`${loopIndex2}  ${bgm2}`);
		    AudioManager.playBgm({"name":bgm2,"volume":100,"pitch":100,"pan":0});
		    loopIndex += 1;
		}}};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:52
	playItemMusicFromMetaName2 = function (textValue) {
		var textValue2 = textValue;
		var databaseEntries2 = $dataWeapons;var tempValue = databaseEntries2.length-1;
		var loopIndex = 1;
		for(var loopIndex2 = 1; loopIndex2 <= tempValue; loopIndex2++){
		  if(databaseEntries2[loopIndex2].meta[textValue2]){
		    var bgm2 = databaseEntries2[loopIndex2].meta[textValue2].split(',')[0];
		    if(bgm2 != 'NoMusic'){
		      console.log(`${loopIndex2}  ${bgm2}`);
		    AudioManager.playBgm({"name":bgm2,"volume":100,"pitch":100,"pan":0});
		    loopIndex += 1;
		}}};
	};

	// Replaces (3x): data/CommonEvents.json:common-event:53, data/Map007.json:map-event:2:page:1
	pickRandomIndexes = function () {
		//ｱｸﾀｰID,ﾋﾟｸﾁｬ,H相手(301ﾓﾌﾞ305対象なし306アイテム),非表示,簡易,過去シーンか否か
		//var arr = [1,2,3,4,5];$gameVariables.setValue(401,arr[getRandomIndex(arr.length)]);
		//this.sVal(506,`\\V[94]は\\V[22]に情報の対価としてセクハラされた…。`);
		//this.sVal(506,`\\V[94]はモブにセクハラされた…。`);
		
		i1 = getRandomIndex(3) + 100;
		var presetValues = [1,2,3,4,5];
		i2 = presetValues[getRandomIndex(presetValues.length)];
		//var value3 = $gameTroop.aliveMembers().length;
	};

	// Replaces (4x): data/CommonEvents.json:common-event:53
	logVariableValue = function (variableId) {
		console.log($gameVariables.value(variableId));
	};

	// Replaces (4x): data/CommonEvents.json:common-event:53, data/Map007.json:map-event:7:page:1
	gainItem = function (rangeStart, rangeEnd) {
		for(var itemId2 = rangeStart; itemId2 <= rangeEnd; itemId2++){
		if (!$dataItems[itemId2].name == '') {
		$gameParty.gainItem($dataItems[itemId2], 15);
		}};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:53, data/Map003.json:map-event:3:page:1
	logDebugValueActor20 = function () {
		console.log($gameActors.actor(20));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:53, data/CommonEvents.json:common-event:199
	logDebugValue3 = function (textValue) {
		console.log(textValue);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:54, data/CommonEvents.json:common-event:301
	blackOutScreenAndFadeScreenBlackOut = function () {
		valuePic1 = 101;
		var pictureName2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1,pictureName2,1,640,384,100,100,255,0);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:59, data/CommonEvents.json:common-event:60
	setValueTalkSet = function () {
		valueTalkSet = 0;
		valueTalkarr1 = [];
	};

	// Replaces (1x): data/CommonEvents.json:common-event:60
	showInfoPopup = function () {
		var textPrefix = `Tips:`;
		var colorCode4 = `\\C[3]`;
		var colorResetCode = `\\C[0]`;
		var textSuffix = `を獲得`;
		  var text3 = `${textPrefix}${colorCode4}${valueTalkSet[0]}${colorResetCode}${textSuffix}`;
		  CommonPopupManager.showInfo({},text3,null);
	};

	// Replaces (1x): data/Map003.json:map-event:3:page:2
	showInfoPopup2 = function () {
		var text3 = `60 seconds Waiting…`;
		CommonPopupManager.showInfo({},text3,null);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:60
	configurePictureEasing = function () {
		var easingValue = 'easeOutQuad';//通常顔グラ演出
		picture_easingConfiguration(easingValue);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:60, data/Map007.json:map-event:4:page:1
	configurePictureEasing2 = function (textValue) {
		var easingValue = textValue;
		picture_easingConfiguration(easingValue);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:60
	setPictureLocationAndMovePicture1 = function (stateId, argument2, stateId2) {
		var actorId3 = valueTalkSet;
		var actor3 = $gameActors.actor(actorId3[1]);
		if(actorId3[0] == 1){actor3.addState(stateId)};
		if(actorId3[0] == 2){pic_locationSet(91,92,"/img/talkface/" + actorId3[1] + argument2,60,0)};
		if(actorId3[0] == 0){
		  actor3.removeState(stateId2);
		  pic_move1(92,0,0,100,100,0,120);
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:60
	fadePicture1Pic101 = function () {
		var pictureName2 = 'ScreenBlackOut';
		$gameScreen.showPicture(101,pictureName2,1,640,384,100,100,valueTalkSet[3],0);
		picture_fade1(101,"fadeIn",valueWipeImg,60,5);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:61, data/CommonEvents.json:common-event:62
	setupChildInterpreterVar131 = function (interp, newValue) {
		return (function (newValue) {
		interp.sVal(131,newValue);interp.sVal(14,1);//ｺﾓﾝID・変数ID
		interp.sVal(121,0);interp.sVal(122,0);interp.sVal(123,0);
		interp.setupChild($dataCommonEvents[$gameVariables.value(131)].list, 0);
		//
		}).call(interp, newValue);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:61
	playSeEffectVar122 = function () {
		var messageText2 = `鼓動`;
		AudioManager.playSe({"name":`${messageText2}`,"volume":100,"pitch":$gameVariables.value(122),"pan":0})
	};

	// Replaces (1x): data/CommonEvents.json:common-event:62
	playSeEffectVar122_2 = function () {
		AudioManager.playSe({"name":"Z_HeartBeat","volume":100,"pitch":$gameVariables.value(122),"pan":0})
	};

	// Replaces (2x): data/CommonEvents.json:common-event:61, data/CommonEvents.json:common-event:62
	flashScreenVar121 = function () {
		$gameScreen.startFlash([255,119,255,200], $gameVariables.value(121))
	};

	// Replaces (2x): data/CommonEvents.json:common-event:61, data/CommonEvents.json:common-event:62
	shakeScreen = function () {
		$gameScreen.startShake(7, 7, $gameVariables.value(121))
	};

	// Replaces (5x): data/CommonEvents.json:common-event:63, data/CommonEvents.json:common-event:64
	nameActorFromVariable = function (actorId, variableId) {
		$gameActors.actor(actorId).setName($gameVariables.value(variableId))
	};

	// Replaces (4x): data/CommonEvents.json:common-event:64, data/CommonEvents.json:common-event:401, data/Map100.json:map-event:11:page:1
	setupChildInterpreter = function (interp, variableId, newValue, list) {
		return (function (variableId, newValue, list) {
		interp.sVal(variableId,newValue);
		interp.setupChild($dataCommonEvents[list].list, 0);
		}).call(interp, variableId, newValue, list);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:64
	subtractVariables = function (variableId, newValue, newValue2, newValue3) {
		$gameVariables.setValue(variableId,$gameVariables.value(newValue) - $gameVariables.value(newValue2) - $gameVariables.value(newValue3));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:64
	forceCharacterMoveRouteVar121And122Etc = function (interp) {
		return (function () {
		interp.character($gameVariables.value(121)).forceMoveRoute({
		"list":[
		{"code":36},{"code":37},{"code":29, "parameters":[$gameVariables.value(122)]},
		{"code":30, "parameters":[$gameVariables.value(123)]},
		{ "code": 45, "parameters": ["this.requestAnimation($gameVariables.value(124));"] },
		{ "code": 45, "parameters": ["this.jumpEx($gameVariables.value(125),$gameVariables.value(126),$gameVariables.value(127),$gameVariables.value(128));"] },
		{"code":25},{"code":32},{"code":34},{"code":35},
		//{ "code": 45, "parameters": ["this.startOpacity(60,$gameVariables.value(129));"] },
		{"code":0}],"repeat":false,"skippable":true});
		interp._character = interp.character($gameVariables.value(121))
		interp.setWaitMode('route')
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:64
	runPluginCommandShowInfo = function (interp) {
		var messageText2 = `パーティが再集合されました`;
		return (function () {
		value1 = `${messageText2}`;
		var args3 = new Array( String(value1) ); 
		interp.pluginCommand("ShowInfo", args3);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:64
	runPluginCommandShowInfo2 = function (interp) {
		var messageText2 = `パーティが一時解散されました`;
		return (function () {
		value1 = `${messageText2}`;
		var args3 = new Array( String(value1) ); 
		interp.pluginCommand("ShowInfo", args3);
		}).call(interp);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:64, data/CommonEvents.json:common-event:373, data/Map054.json:map-event:2:page:1, data/Map054.json:map-event:2:page:2, data/Map054.json:map-event:2:page:3, data/Map054.json:map-event:2:page:4, …
	setupChildInterpreter2 = function (interp, newValue) {
		return (function (newValue) {
		interp.sVal(14,newValue);//パーティ一時解散コモン
		interp.setupChild($dataCommonEvents[64].list, 0);
		}).call(interp, newValue);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:64
	refreshCurrentActor = function () {
		$gameActors.actor($gameVariables.value(20)).refresh();
	};

	// Replaces (3x): data/CommonEvents.json:common-event:64
	movePicture1_2 = function () {
		for (var loopIndex = 1; loopIndex <= 7; loopIndex++) {
		  pic_move1(100+loopIndex,0,30,-500,0);
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:64
	addPartyActorVar20 = function () {
		$gameParty.addActor($gameVariables.value(20));
	};

	// Replaces (4x): data/CommonEvents.json:common-event:64
	teachSkillToActorFromVariable20 = function (skillId) {
		$gameActors.actor($gameVariables.value(20)).learnSkill(skillId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:64
	addPartyActor = function (variableId) {
		$gameParty.addActor($gameVariables.value(variableId))
	};

	// Replaces (2x): data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:87
	hideWindow2 = function () {
		WindowManager.hide(1);
		WindowManager.hide(2);
		WindowManager.hide(3);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:66, data/Map007.json:map-event:23:page:1
	erasePictureById = function (pictureId) {
		$gameScreen.erasePicture(pictureId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:212
	setupChildInterpreterVar131_2 = function (interp, newValue, variableId) {
		return (function (newValue, variableId) {
		interp.sVal(131,64);interp.sVal(14,newValue);//ｺﾓﾝID・変数ID
		interp.sVal(121,0);interp.sVal(122,0);interp.sVal(variableId,0);
		interp.setupChild($dataCommonEvents[$gameVariables.value(131)].list, 0);
		}).call(interp, newValue, variableId);
	};

	// Replaces (10x): data/CommonEvents.json:common-event:66, data/CommonEvents.json:common-event:173, data/CommonEvents.json:common-event:183, data/CommonEvents.json:common-event:192, data/CommonEvents.json:common-event:203, data/CommonEvents.json:common-event:237, …
	enableVisualNovelChoices = function () {
		$gameSystem.vnChoices = true;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:72, data/Map005.json:map-event:2:page:1
	closeGameWindow = function () {
		window.close()
	};

	// Replaces (1x): data/CommonEvents.json:common-event:73
	runPluginCommandShowInfo3 = function (interp) {
		var textPrefix = `ファイル`;
		var variableCode = `\\V[509]`;
		var textSuffix = `にオートセーブしました`;
		return (function () {
		var args3 = new Array( `${textPrefix}${variableCode}${textSuffix}`);
		interp.pluginCommand("ShowInfo", args3);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:73
	runPluginCommandShowInfo4 = function (interp) {
		var messageText2 = `ファイル51にオートセーブしました`;
		return (function () {
		var args3 = new Array( `${messageText2}`);
		interp.pluginCommand("ShowInfo", args3);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:77, data/CommonEvents.json:common-event:78
	readVariable706 = function (interp, randomRange) {
		return (function (randomRange) {
		var variable706Value = $gameVariables.value(706)[3];
		var variable706Value = getRandomIndex(randomRange) + variable706Value-30;
		interp.wait(variable706Value);
		}).call(interp, randomRange);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:78
	waitFrames = function (interp, waitFrames) {
		return (function (waitFrames) {
		interp.wait(waitFrames)
		}).call(interp, waitFrames);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:85
	propagateLibido = function () {
		//性欲度情報を更新
		seiyoku_hanei();
	};

	// Replaces (5x): data/CommonEvents.json:common-event:85, data/CommonEvents.json:common-event:109, data/CommonEvents.json:common-event:110, data/CommonEvents.json:common-event:113, data/CommonEvents.json:common-event:159
	setSelfVariable0 = function (interp) {
		return (function () {
		for(var loopIndex = 401; loopIndex <= 440; loopIndex++){interp.sVal(loopIndex,0)};
		}).call(interp);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:85, data/CommonEvents.json:common-event:401, data/CommonEvents.json:common-event:516, data/CommonEvents.json:common-event:546, data/Map200.json:map-event:11:page:1, …
	assignSelfVariableValue = function (interp, variableId, newValue) {
		return (function (variableId, newValue) {
		interp.sVal(variableId,newValue);
		}).call(interp, variableId, newValue);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:536
	setSelfVariable23Var1 = function (interp) {
		var messageText2 = `の`;
		return (function () {
		interp.sVal(23,`${$gameVariables.value(1+380)[56]}${messageText2}${$gameVariables.value(1+380)[53]}`);
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:86, data/CommonEvents.json:common-event:245
	playScreenParticle = function (textValue, particleName, particleDefinition) {
		var particleName2 = textValue;
		$gameScreen._particle.particlePlay(0,particleName2,particleName,'def',particleDefinition);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:86, data/CommonEvents.json:common-event:179
	assignVariableValue = function (variableId, newValue) {
		$gameVariables.setValue(variableId,newValue);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:103
	setVariable332Text = function () {
		var iconCode296 = `\\I[296]`;
		var iconCode313 = `\\I[313]`;
		$gameVariables.setValue(332,`${iconCode296}:${Math.round(valueTotalexp)}${iconCode313}:${Math.round(valueTotalgold)}`);
	};

	// Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	setVariable801Text = function () {
		var messageText2 = `残念だったわね？`;
		$gameVariables.setValue(801,`${messageText2}`);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:87
	updateScreenParticle = function () {
		$gameScreen._particle.particleUpdate(['hStates_bodyShine1','emitterLifetime',1]);
		$gameScreen._particle.particleClear('hStates_bodyShine1');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:87
	appendMessageTextVar20 = function (interp) {
		var controlCode = `\\>`;
		return (function () {
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		$gameMessage.newPage();
		$gameMessage.add(`${controlCode}${variable20Value.profile()}`);
		interp.setWaitMode('message');
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:87
	appendMessageTextVar20_2 = function (interp) {
		var controlCode = `\\SP[0]`;
		return (function () {
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		$gameMessage.newPage();
		$gameMessage.add(`${controlCode}${variable20Value.profile()}`);
		interp.setWaitMode('message');
		}).call(interp);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:256
	flagIfAnySlotFilled = function (rangeStart, rangeEnd, switchId) {
		var presetValues = [0];
		var variable20Value = $gameVariables.value(360 + $gameVariables.value(20));
		for (var loopIndex = rangeStart; loopIndex <= rangeEnd; loopIndex++) {
		if(variable20Value[loopIndex] >= 1){
		presetValues.push(variable20Value[loopIndex]);
		}};
		var computedCount = presetValues.reduce(function(a,b){  
		return Math.max(a,b);
		});
		if(computedCount >= 1){
		$gameSwitches.setValue(switchId,true);
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:87
	setValueGraphicsWidth = function (graphicsWidth) {
		valueGraphicsWidth = graphicsWidth;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:256
	applyActorHHistory2 = function () {
		actor_Hhennreki2($gameVariables.value(19));
		//選択肢番号は、実際の配列番号+1にしている。
		//もしピクチャ表示する場合は注意。
	};

	// Replaces (9x): data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:166, data/CommonEvents.json:common-event:203, data/CommonEvents.json:common-event:238, data/CommonEvents.json:common-event:239, data/CommonEvents.json:common-event:241, …
	hideAllWindows = function () {
		WindowManager.hideAll();
	};

	// Replaces (4x): data/CommonEvents.json:common-event:90
	setSelfVariable21_2 = function (interp) {
		return (function () {
		interp.sVal(21,
		);
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:92, data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	fadePicture1FadeOut = function () {
		var fadePicId = 51;
		picture_fade1(fadePicId,"fadeOut",'Hscene005',300,5);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:94
	movePictureRowAndWait = function (interp, pictureId, duration, waitFrames) {
		return (function (pictureId, duration, waitFrames) {
		var pictureId2 = 60;
		$gameScreen.movePicture(pictureId+1+pictureId2,1,1280/2,768/2,100,100,0,0,duration);
		interp.wait(waitFrames);
		}).call(interp, pictureId, duration, waitFrames);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:101
	runPluginCommandCutInCG_EnemyDefeat = function (interp) {
		var messageText2 = `カットインエネミー演出色々`;
		var textPart2 = `敵カットイン`;
		return (function () {
		var nameValue = 'CutInCG_EnemyDefeat';
		valueCutInSet1 = [`${messageText2}`,nameValue,0,2.0,2.0,25,60];
		var args3 = new Array(String(valueCutInSet1[0]));
		interp.pluginCommand(`${textPart2}`, args3);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:104
	runPluginCommandVar20 = function (interp) {
		var textPrefix = `Ｈシーン演出`;
		var textSuffix = `味方カットイン`;
		return (function () {
		var variable20Value = `Zev_BattleMasturbation${$gameVariables.value(20)}_1`;
		valueCutInSet1 = [`${textPrefix}`,variable20Value,270,1.5,1.2,25,60];
		var args3 = new Array(String(valueCutInSet1[0]));
		interp.pluginCommand(`${textSuffix}`, args3);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:101
	updateActorFromVariable11 = function () {
		var messageText2 = `達`;
		var variable11Value = `${$gameActors.actor($gameVariables.value(11)).name()}`;
		if($gameParty.battleMembers().length >= 2){
		  variable11Value += `${messageText2}`;
		};
		$gameVariables.setValue(49,variable11Value);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516
	updateActorFromVariable530 = function () {
		var messageText2 = `一行`;
		var variable530Value = `${$gameActors.actor($gameVariables.value(530)).name()}`;
		if($gameParty.battleMembers().length >= 2){
		  variable530Value += `${messageText2}`;
		};
		$gameVariables.setValue(21,variable530Value);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:101
	forceHomeMove = function () {
		set_homeMoveForced();//拠点に強制移動
	};

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

	// Replaces (1x): data/CommonEvents.json:common-event:102
	applyStateToParty = function () {
		valueScriptArray1 = [0,0,0,0,0,0,0,0,0,0,0];
		var stateId2 = 82;
		if($gameParty.membersState(stateId2)){
		  for (var memberIndex = 0; memberIndex < $gameParty.members().length; memberIndex++) {
		    var partyMember2 = $gameParty.members()[memberIndex];
		      if(partyMember2.isStateAffected(stateId2)){
		        if(partyMember2._stateCounter[stateId2] >= 0){
		          valueScriptArray1[memberIndex] = partyMember2._stateCounter[stateId2];
		}}}};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	clearPartyStateCounters = function () {
		for (var memberIndex = 0; memberIndex < $gameParty.members().length; memberIndex++) {
		  var partyMember2 = $gameParty.members()[memberIndex];
		  partyMember2.clearStateCounters();
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	restoreStateCountersFromScriptArray = function () {
		var constantValue = 82;
		for (var memberIndex = 0; memberIndex < valueScriptArray1.length; memberIndex++) {
		  if(valueScriptArray1[memberIndex] >= 1){
		    if($gameParty.members()[memberIndex].isStateAffected(constantValue)){
		      $gameParty.members()[memberIndex].setStateCounter(constantValue, valueScriptArray1[memberIndex]);
		}}};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	applyStateToParty2 = function (interp) {
		return (function () {
		var stateBattleClear = valueStateBattleClear;
		const partyBattleMembers = $gameParty.battleMembers(); stateBattleClear.forEach(function(id) {
		  if($gameParty.membersState(id)){
		    for (let loopIndex = 0; loopIndex < partyBattleMembers.length; loopIndex++) {
		      const tempValue = partyBattleMembers[loopIndex];
		      if($gameParty.members().contains(tempValue)){
		        if(tempValue.isStateAffected(id)){
		          tempValue.removeStateCounter(id);
		    }}};
		  };
		}, interp);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	setValueTotalexp = function () {
		valueTotalexp = 1;
		valueTotalgold = 1;
		valueMaxEnemyLv = 0;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	removeStateFromListActors = function () {
		for (var memberIndex = 0; memberIndex < $gameParty.battleMembers().length; memberIndex++) {
		  var battleMember = $gameParty.battleMembers()[memberIndex];
		  battleMember.clearParamPlus();
		  battleMember.clearXParamPlus();
		  battleMember.clearSParamPlus();
		  battleMember.removeState(486);
		  battleMember.removeState(487);
		  battleMember.removeState(488);
		  battleMember.removeState(489);
		  battleMember.refresh();
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	resetStateTraits = function () {
		for (let stateId2 = 486; stateId2 <= 489; stateId2++) {
		  const databaseEntries2 = $dataStates[stateId2]; databaseEntries2.traits = [];
		  databaseEntries2.traits.push({code: 53, dataId: 6, value: 0.1});
		};
		for (var stateId2 = 490; stateId2 <= 497; stateId2++) {
		  $dataStates[stateId2].traits = [];
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	addStepsFromVariable = function () {
		$gameParty._steps += $gameVariables.value(290);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:103, data/CommonEvents.json:common-event:300, data/CommonEvents.json:common-event:301
	enableSwitch = function (switchId) {
		$gameSwitches.setValue(switchId,true);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:104, data/CommonEvents.json:common-event:140
	prepareCutInVar20 = function (interp, pictureId) {
		var messageText2 = `味方カットイン`;
		return (function (pictureId) {
		cutin_preparation(pictureId,$gameVariables.value(20));
		if(valueCutInSet1[0] != 0){
		  var args3 = new Array(String(valueCutInSet1[0]));
		  interp.pluginCommand(`${messageText2}`, args3);
		};
		}).call(interp, pictureId);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:140
	prepareCutInVar20_2 = function (interp) {
		var messageText2 = `敵カットイン`;
		return (function () {
		cutin_preparation(0,$gameVariables.value(20));
		if(valueCutInSet1[0] != 0){
		  var args3 = new Array(String(valueCutInSet1[0]));
		  interp.pluginCommand(`${messageText2}`, args3);
		};
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:104
	setValueChainAddPower = function () {
		valueChainAddPower = 0;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:104, data/CommonEvents.json:common-event:129
	runBossActionPattern1 = function () {
		if($gameTroop.members()[0].isStateAffected(410) && 
		$gameTroop.members()[0].isAlive() && 
		!$gameTroop.members()[0].isRestricted ()){
		  $gameSwitches.setValue(470,true);
		  boss_actionPattarn1($gameTroop.members()[0]);
		  $gameSwitches.setValue(470,false);
		};
	};

	// Replaces (8x): data/CommonEvents.json:common-event:105, data/CommonEvents.json:common-event:109, data/CommonEvents.json:common-event:141, data/CommonEvents.json:common-event:184, data/CommonEvents.json:common-event:381, data/Map007.json:map-event:3:page:1, …
	disableSwitch = function (switchId) {
		$gameSwitches.setValue(switchId,false);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:105, data/CommonEvents.json:common-event:122
	countDefeatedEnemyVar240 = function (variableId) {
		if($gameVariables.value(240) >= 1){
		  $gameVariables.value(variableId)[$gameVariables.value(240)] += 1;
		};
	};

	// Replaces (3x): data/CommonEvents.json:common-event:105, data/CommonEvents.json:common-event:122, data/CommonEvents.json:common-event:205
	setGlossaryText1AndSetGlossaryText2 = function () {
		var rangeStart2 = 1;
		var databaseEntries2 = $dataItems.length-1;
		  for (var itemId2 = rangeStart2; itemId2 <= databaseEntries2; itemId2++) {
		    if($dataItems[itemId2].meta['SG種別']){
		      if(Number($dataItems[itemId2].meta['SG種別']) == 2){
		        scene_Glossarytext1(itemId2,218);
		        scene_Glossarytext2(itemId2,213);
		        scene_Glossarytext3(itemId2,219);
		}}};
	};

	// Replaces (4x): data/CommonEvents.json:common-event:106, data/CommonEvents.json:common-event:111, data/CommonEvents.json:common-event:112, data/CommonEvents.json:common-event:167
	loadPartyStatBlockVar20 = function () {
		//現在衣装を呼び出し
		var rangeStart2 = 1; var rangeEnd2 = 40;
		for (var loopIndex = rangeStart2; loopIndex <= rangeEnd2; loopIndex++) {
		$gameVariables.setValue(loopIndex+460,
		$gameVariables.value($gameVariables.value(20)+440)[loopIndex]);
		};
	};

	// Replaces (3x): data/CommonEvents.json:common-event:106, data/CommonEvents.json:common-event:111, data/CommonEvents.json:common-event:112
	loadPartyStatBlock = function (interp) {
		return (function () {
		//一時代入した仮情報を立ち絵指定後に反映
		var rangeStart2 = 1; var rangeEnd2 = 40;
		for (var loopIndex = rangeStart2; loopIndex <= rangeEnd2; loopIndex++) {
		if($gameVariables.value(loopIndex+560) >= 1){
		interp.sVal(loopIndex+460,$gameVariables.value(loopIndex+560));
		}};
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:106, data/CommonEvents.json:common-event:111, data/CommonEvents.json:common-event:112
	savePartyStatBlockVar20 = function () {
		//衣装情報を更新
		var rangeStart2 = 1; var rangeEnd2 = 40;
		for (var loopIndex = rangeStart2; loopIndex <= rangeEnd2; loopIndex++) {
		$gameVariables.value($gameVariables.value(20)+440)[loopIndex] = $gameVariables.value(loopIndex+460)
		};
	};

	// Replaces (3x): data/CommonEvents.json:common-event:106, data/CommonEvents.json:common-event:109
	pushBattleLogTextVar20 = function () {
		var messageText2 = `は拘束された！`;
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		BattleManager._logWindow.push(`addText`, `${variable20Value.name()}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:109
	pushBattleLogTextVar20_2 = function () {
		var messageText2 = `は襲い掛かられた！`;
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		BattleManager._logWindow.push(`addText`, `${variable20Value.name()}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:109
	pushBattleLogTextVar20_3 = function () {
		var messageText2 = `は拘束から逃れた！`;
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		BattleManager._logWindow.push(`addText`, `${variable20Value.name()}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:110
	pushBattleLogTextVar20_4 = function () {
		var messageText2 = `は犯されている…。`;
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		BattleManager._logWindow.push(`addText`, `${variable20Value.name()}${messageText2}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:109, data/CommonEvents.json:common-event:110
	erasePictureP2 = function () {
		var pictureIds2 = [121,122,123,124,125,126,127,128,129,130];
		pic_eraseP(0,pictureIds2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:109, data/CommonEvents.json:common-event:110
	addStateToActorFromVariable20 = function (stateId) {
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		variable20Value.addState(stateId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:109
	setVariable703 = function () {
		if($dataSystem.optSideView){
		  if($gameVariables.value(703) != 0){
		    var variable92Value = $gameVariables.value(92) + 1;
		    $gameTroop.set(variable92Value, $gameVariables.value(703)[0], $gameVariables.value(703)[1], 30);
		    $gameVariables.setValue(703, 0);
		  };
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:110, data/Map003.json:map-event:218:page:2
	grantHExp1AndGrantHExp1Extra = function (interp, expVar406, expVar409, expVar4092, expVar408, numericValue) {
		return (function (expVar406, expVar409, expVar4092, expVar408, numericValue) {
		//     膣,経,フ,ア,自,絶
		h_exp1( expVar406, expVar409, 0, 0, 0, 0);//6//h_exp1ex(10);
		//     和,強,異,輪,乱,露
		h_exp2( 0, expVar4092, expVar408, 0, 0, 0);//6
		//     セ,乳,尻,失,潮,売,妊,子,中,ア,口(射精先)
		h_exp3( 0, 0, 0, 0, 0, 0, 0, 0, numericValue, 0, 0);//10
		//     膣,尻,口,感,露,精,性,奉,売
		h_exp4( 0, 0, 0, 0, 0, 0, 0, 0, 0);//9
		interp.setupChild($dataCommonEvents[85].list, 0);
		}).call(interp, expVar406, expVar409, expVar4092, expVar408, numericValue);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:111, data/CommonEvents.json:common-event:112
	showInfoPopupVar20 = function () {
		var textPrefix = `しかし`;
		var textSuffix = `は既に全裸であった…`;
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		var text3 = `${textPrefix}${variable20Value.name()}${textSuffix}`;
		if($gameParty.inBattle()){
		  BattleManager._logWindow.push(`addText`, text3);
		} else {
		  CommonPopupManager.showInfo({},text3,null);
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:112
	showInfoPopupVar20_2 = function () {
		var textPrefix = `しかし`;
		var textPart2 = `には効果が無かった。　（現在露出値:`;
		var textSuffix = `）`;
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		var text3 = `${textPrefix}${variable20Value.name()}${textPart2}${value1}${textSuffix}`;
		if($gameParty.inBattle()){
		  BattleManager._logWindow.push(`addText`, text3);
		} else {
		  CommonPopupManager.showInfo({},text3,null);
		};
	};

	// Replaces (13x): data/CommonEvents.json:common-event:119, data/CommonEvents.json:common-event:122, data/Map035.json:map-event:20:page:1, data/Map054.json:map-event:2:page:1, data/Map054.json:map-event:2:page:2, data/Map054.json:map-event:2:page:3, …
	countBossEnemyDefeat = function (variableId) {
		$gameVariables.value(variableId)[valueBossEnemyId] += 1;
	};

	// Replaces (7x): data/CommonEvents.json:common-event:119, data/CommonEvents.json:common-event:122, data/Map035.json:map-event:20:page:1, data/Map054.json:map-event:2:page:1, data/Map054.json:map-event:2:page:2, data/Map054.json:map-event:2:page:3, …
	setValueBossAddLevel = function () {
		valueBossAddLevel = 0;
	};

	// Replaces (6x): data/CommonEvents.json:common-event:120, data/CommonEvents.json:common-event:121, data/CommonEvents.json:common-event:300
	setValueVictoryResult = function (victoryResult) {
		valueVictoryResult = victoryResult;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:120
	setValueWordSet1 = function () {
		valueWordSet1 = 0;
		valueWordSet2 = 0;
		valueWordSet3 = 0;
	};

	// Replaces (5x): data/CommonEvents.json:common-event:120, data/CommonEvents.json:common-event:188, data/CommonEvents.json:common-event:196
	setupChildInterpreter3 = function (interp, newValue, newValue2, newValue3, newValue4, newValue5) {
		return (function (newValue, newValue2, newValue3, newValue4, newValue5) {
		interp.sVal(14,26);interp.sVal(121,interp._eventId);
		interp.sVal(122,getRandomIndex(8) + 8);
		interp.sVal(123,5);
		//アニメid
		interp.sVal(124,1);
		interp.sVal(125,getRandomIndex(newValue) + -newValue2);
		interp.sVal(126,getRandomIndex(newValue3) + -newValue4);
		interp.sVal(127,getRandomIndex(2) + newValue5);
		interp.sVal(128,getRandomIndex(2) + 0);
		interp.sVal(129,getRandomIndex(181) + 0);
		interp.setupChild($dataCommonEvents[64].list, 0);
		}).call(interp, newValue, newValue2, newValue3, newValue4, newValue5);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:120, data/CommonEvents.json:common-event:121
	readBranchResult = function (interp) {
		return (function () {
		$result = interp._branch[interp._indent]
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:120
	forceCharacterMoveRouteVar240 = function (interp) {
		return (function () {
		interp.character(0).forceMoveRoute({
		"list":[{"code":41,
		"parameters":[$dataItems[$gameVariables.value(240)].meta.EnemyGraphic.split(',')[0],
		Number($dataItems[$gameVariables.value(240)].meta.EnemyGraphic.split(',')[1])]},
		{"code":15, "parameters":[10]},
		{ "code": 45, "parameters": ["this.setAngle([-45,45,-90,90][getRandomIndex(4)]);"] },
		{"code":32},{"code":34},{"code":35},{"code":37},
		{"code":0}]});
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:122, data/CommonEvents.json:common-event:297
	openVictoryTreasureBox1AndOpenVictoryTreasureBox2 = function () {
		if(valueMaxEnemyLv >= 1){
		var rangeStart2 = 1;
		var computedCount = Math.ceil(valueMaxEnemyLv / 10);
		  for (var loopIndex = rangeStart2; loopIndex <= computedCount; loopIndex++) {
		    enemywin_treasurebox1(valueBossId);
		      if($gameVariables.value(160)[4] >= 1){
		        enemywin_treasurebox2(valueBossId);
		      };
		  };
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:124
	setMapSelfSwitchVar52And223 = function () {
		$gameSelfSwitches.setValue([$gameVariables.value(52), $gameVariables.value(223), "D"], true)
	};

	// Replaces (2x): data/CommonEvents.json:common-event:124
	requestEventAnimationVar223 = function (interp, animationId) {
		return (function (animationId) {
		interp.character($gameVariables.value(223)).requestAnimation(animationId);
		}).call(interp, animationId);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:129
	prepareCutInVar20_3 = function (interp) {
		var messageText2 = `敵カットイン`;
		return (function () {
		cutin_preparation(8,$gameVariables.value(20));
		if(valueCutInSet1[0] != 0){
		  var args3 = new Array(valueCutInSet1[0]);
		  interp.pluginCommand(`${messageText2}`, args3);
		};
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:81:page:1, data/Map003.json:map-event:82:page:1
	prepareCutInVar20_4 = function (interp) {
		var messageText2 = `味方カットイン`;
		return (function () {
		cutin_preparation(7,$gameVariables.value(20));
		if(valueCutInSet1[0] != 0){
		  var args3 = new Array(valueCutInSet1[0]);
		  interp.pluginCommand(`${messageText2}`, args3);
		};
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:138
	configureActorFromVariable20GabText = function (interp) {
		var messageText2 = `「行きますよ、皆さん！」`;
		var textPart2 = `「`;
		var controlCode = `\\N[2]`;
		var textPart3 = `さん、行きましょう！」`;
		return (function () {
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		var arraySize = `${variable20Value.name()}${messageText2}`;
		if($gameActors.actor(2).isStateAffected(234)){var arraySize = `${variable20Value.name()}${textPart2}${controlCode}${textPart3}`};
		var args3 = new Array(String(arraySize));
		interp.pluginCommand("GabText", args3);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:138
	configureActorFromVariable20Actor1 = function (interp) {
		var messageText2 = `「往くぞ！」`;
		var textPart2 = `「往くぞ、`;
		var controlCode = `\\N[1]`;
		var textPart3 = `！」`;
		return (function () {
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		var arraySize = `${variable20Value.name()}${messageText2}`;
		if($gameActors.actor(1).isStateAffected(234)){var arraySize = `${variable20Value.name()}${textPart2}${controlCode}${textPart3}`};
		var args3 = new Array(String(arraySize));
		interp.pluginCommand("GabText", args3);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:138
	prepareCutInVar182And20 = function (interp) {
		var messageText2 = `味方カットイン`;
		return (function () {
		$gameVariables.setValue(182,13);
		cutin_preparation(1,$gameVariables.value(20));
		if(valueCutInSet1[0] != 0){
		  var args3 = new Array(String(valueCutInSet1[0]));
		  interp.pluginCommand(`${messageText2}`, args3);
		};
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:138
	runPluginCommandGabText = function (interp) {
		var messageText2 = `「ああ！　我らの力、見せてやろう！！」`;
		return (function () {
		var actorId3 = 2;
		var actor3 = $gameActors.actor(actorId3);
		var arraySize = `${actor3.name()}${messageText2}`;
		var args3 = new Array(String(arraySize));
		interp.pluginCommand("GabText", args3);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:138
	runPluginCommandGabText2 = function (interp) {
		var textPrefix = `「はい、`;
		var controlCode = `\\N[2]`;
		var textSuffix = `さん！」`;
		return (function () {
		var actorId3 = 1;
		var actor3 = $gameActors.actor(actorId3);
		var arraySize = `${actor3.name()}${textPrefix}${controlCode}${textSuffix}`;
		var args3 = new Array(String(arraySize));
		interp.pluginCommand("GabText", args3);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:138
	prepareCutInVar182 = function (interp, argument1) {
		var messageText2 = `味方カットイン`;
		return (function (argument1) {
		var cutinType2 = argument1;
		$gameVariables.setValue(182,13);
		cutin_preparation(1,cutinType2);
		if(valueCutInSet1[0] != 0){
		  var args3 = new Array(String(valueCutInSet1[0]));
		  interp.pluginCommand(`${messageText2}`, args3);
		};
		}).call(interp, argument1);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:158
	setSelfVariable207 = function (interp) {
		return (function () {
		interp.sVal(207,101);//露出縛りなし
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:158
	addStateToActorFromVariable20Var247And207 = function (interp) {
		return (function () {
		var variable247Value = $gameVariables.value(247);
		variable247Value.forEach(function(id) {
		  var constantValue = 0;
		  if($gameVariables.value(207) == 101){var constantValue = 1};
		  if($gameVariables.value(207) >= 1 && $gameVariables.value(207) == $gameVariables.value(id+440)[41]){var constantValue = 1}; 
		  if(constantValue == 0 && $gameParty.members().contains($gameActors.actor(id))){
		    if($gameVariables.value(id+380)[4] <  $gameVariables.value(id+380)[5]){
		      $gameActors.actor(id).addState(78);
		}}}, interp);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:160
	configureStandingPicture2Var20And3 = function () {
		if(!$gameParty.inBattle()){
		  $gameVariables.setValue(20,$gameVariables.value(3));
		  tachie_settei2();
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:160
	showStandingPicture1AndGetPreviousStandingPicIdVar3 = function (interp) {
		return (function () {
		if(!$gameParty.inBattle()){
		  tachie_hyouji1($gameVariables.value(3));
		  var args3 = new Array(String(getPreviousTachiePicId()),'71','2','ON')
		  interp.pluginCommand("P_CALL_CE", args3);
		};
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:161
	hideFollowers = function () {
		if($gameSwitches.value(209) ||
		$gameSwitches.value(202)){
		$gamePlayer.hideFollowers();
		};
		if($gameSwitches.value(201) ||
		$gameSwitches.value(205)){
		$gamePlayer.showFollowers();
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:161
	resetPlayerGraphic = function () {
		if($gamePlayer.followers().follower(0).isVisible() ){
		$gamePlayer.resetCustomizeGraphic();
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:161
	forceCharacterMoveRouteVar11And21Etc = function (interp) {
		return (function () {
		interp.character(-1).forceMoveRoute({
		"list":[{"code":41, "parameters":[$gameVariables.value(11) + '_' + $gameVariables.value(21),$gameVariables.value(22)]},
		{"code":38},{"code":29, "parameters":[4]},{"code":31},{"code":33},{"code":0}],});
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:161
	refreshPlayer2 = function () {
		$gamePlayer.refresh()
	};

	// Replaces (2x): data/CommonEvents.json:common-event:167
	configureActorFromVariable20 = function (interp) {
		var messageText2 = `　`;
		var iconCode = `\\I[155]`;
		return (function () {
		var variable20Value = $gameActors.actor($gameVariables.value(20))
		interp.sVal(519,`${variable20Value.name()}${messageText2}${iconCode}:${$gameVariables.value($gameVariables.value(20)+380)[4]}(${$gameVariables.value($gameVariables.value(20)+380)[5]})
`);
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:167
	writeVariableArraySlotVar20And19Etc = function () {
		$gameVariables.value($gameVariables.value(20)+440)[41] = Number($dataItems[$gameVariables.value(19)].meta['TotalCloth']);
		$gameVariables.value(348)[$gameVariables.value(20)] = $gameVariables.value($gameVariables.value(20)+440)[41];
	};

	// Replaces (3x): data/CommonEvents.json:common-event:167
	saveCharacterIdToStatBlock = function () {
		$gameVariables.value($gameVariables.value(20)+440)[0] = $gameVariables.value(19);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:167
	setVariable0 = function () {
		//現在衣装を初期化
		var rangeStart2 = 1; var rangeEnd2 = 40;
		for (var loopIndex = rangeStart2; loopIndex <= rangeEnd2; loopIndex++) {
		if(loopIndex == 4){
		} else {
		$gameVariables.setValue(loopIndex+460,0);
		}};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:167
	savePartyStatBlockVar20_2 = function () {
		//衣装情報を更新
		var rangeStart2 = 1; var rangeEnd2 = 40;
		for (var loopIndex = rangeStart2; loopIndex <= rangeEnd2; loopIndex++) {
		$gameVariables.value($gameVariables.value(20)+440)[loopIndex] = $gameVariables.value(loopIndex+460)
		}
	};

	// Replaces (2x): data/CommonEvents.json:common-event:172
	blackOutScreenAndFadeScreenBlackOut2 = function () {
		var pictureId2 = 101;
		var pictureName2 = 'ScreenBlackOut';
		$gameScreen.showPicture(pictureId2-1,pictureName2,1,640,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2-1,1,640,384,100,100,150,0,40);
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
	setValueCountSet2_3 = function (countValue) {
		valueCountSet2 = countValue;
		valueWordSet0 = 0;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:174, data/CommonEvents.json:common-event:181
	setVariable19 = function () {
		$gameVariables.setValue(19,valueCountArray3[$gameVariables.value(19)]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	useItemBulk = function () {
		valueCountSet1 = 0;
		valueIkkatuArray = [];
		item_ikkatu(0);
		item_ikkatu(1);
		item_ikkatu(2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	setValueCountSet2_4 = function () {
		valueCountSet2 = valueIkkatuArray.length;
		valueCountSet3 = 0;//+1で件数合計
		valueCountSet4 = 0;//個数累計
		valueCountSet5 = 0;//金額合計
		valueCountSet6 = 0;//変数57合計
		valueCountSet7 = 0;//ｱｲﾃﾑID270合計
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	hideWindow3 = function () {
		WindowManager.hide(1);
		WindowManager.hide(2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	setValueIkkatuArray = function () {
		valueIkkatuArray = [];
	};

	// Replaces (2x): data/CommonEvents.json:common-event:176
	writeVariableArraySlotVar19And293 = function (numericValue) {
		var variable19Value = $gameVariables.value(19);
		$gameVariables.value(293)[variable19Value] += 1;
		if($gameVariables.value(293)[variable19Value] >= numericValue){
		$gameVariables.value(293)[variable19Value] = 1;
		};
	};

	// Replaces (3x): data/CommonEvents.json:common-event:176
	writeVariableArraySlotVar293And20 = function (numericValue) {
		var variableId2 = numericValue;
		$gameVariables.value(293)[variableId2] = $gameVariables.value(20+variableId2);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:176
	addCustomChoice = function () {
		var messageText2 = `未指定`;
		const constantValue = 1; 
		const choiceParams2 = {
		text: `${messageText2}`,
		value: 0};
		$gameSystem.addCustomChoice(constantValue, choiceParams2);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:259
	addCustomChoice2 = function () {
		var controlCode1 = `\\fs[20]`;
		var controlCode2 = `\\fs[28]`;
		    const constantValue = 1; 
		    const choiceParams2 = {
		    text: `${controlCode1}${$dataSystem.switches[430]}${controlCode2}`,
		    value: 99};
		    $gameSystem.addCustomChoice(constantValue, choiceParams2);
	};

	// Replaces (1x): data/Map003.json:map-event:83:page:1
	addCustomChoiceVar22 = function () {
		var messageText2 = `　　　　　　　　　　　　　`;
		const constantValue = 1; 
		const variable22Value = {
		text: `${$gameVariables.value(22)}${messageText2}`,
		value: 0};
		$gameSystem.addCustomChoice(constantValue, variable22Value);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:184, data/Map003.json:map-event:20:page:1, data/Map003.json:map-event:133:page:2
	bindInterpreterToValueCountSet9 = function (interp) {
		return (function () {
		interp._eventId = valueCountSet9;
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:184, data/Map003.json:map-event:20:page:1, data/Map003.json:map-event:133:page:2
	writeVariableArraySlotVar292 = function () {
		if(!!$gameMap.event($gameVariables.value(292)[0])) {
		  $gameMap.eraseEvent($gameVariables.value(292)[0]);
		};
		$gameVariables.value(292)[0] = 0;
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

	// Replaces (5x): data/CommonEvents.json:common-event:187, data/CommonEvents.json:common-event:188, data/CommonEvents.json:common-event:196
	selectEnemyDrop = function () {
		var user2 = $gameActors.actor(20);
		enemy_dropSelection(user2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:188
	bindInterpreterToValueEnemyEventId = function (interp) {
		return (function () {
		interp._eventId = valueEnemyEventId;
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:189, data/CommonEvents.json:common-event:190, data/CommonEvents.json:common-event:196
	bindInterpreterToValueanimalEventId = function (interp) {
		return (function () {
		interp._eventId = valueanimalEventId;
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:190, data/CommonEvents.json:common-event:195
	spawnMapEvent = function () {
		var x4 = $gameMap.event(valueanimalEventId).x;
		var y5 = $gameMap.event(valueanimalEventId).y;
		$gameMap.spawnEvent(99, x4, y5, true);
		var mapGetLastSpawnEventId = $gameMap.getLastSpawnEventId();
		var event2 = $gameMap.event(mapGetLastSpawnEventId);
		event2.startScale(10,50,50);
		event2._priorityType = 0;
		event2.setOpacity(150);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:192
	setActor21Name = function () {
		var messageText2 = `情報屋`;
		$gameActors.actor(21).setName(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:239
	setActor21Name2 = function () {
		var messageText2 = `鑑定屋`;
		$gameActors.actor(21).setName(`${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:305
	setActor21Name3 = function () {
		var textPrefix = `受付嬢`;
		var controlCode1 = `\\}`;
		var textSuffix = `支部`;
		var controlCode2 = `\\{`;
		$gameActors.actor(21).setName(`${textPrefix}${controlCode1} ${$dataWeapons[76].name} ${$dataWeapons[22].name}${textSuffix}${controlCode2}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
	setActor22Name = function () {
		var messageText2 = `受付`;
		var controlCode1 = `\\}`;
		var controlCode2 = `\\{`;
		$gameActors.actor(22).setName(`${messageText2}${controlCode1} ${$dataWeapons[70].name}${controlCode2}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:196
	requestEventAnimation = function (animationId) {
		var event2 = $gameMap.event(valueEnemyEventId);
		event2.requestAnimation(animationId);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:199
	setSwitch380Var19 = function () {
		$gameSwitches.setValue(380,false);
		var variable19Value = $gameVariables.value(19);
		if ($gameMap.event(variable19Value).event().meta['WorldMenu']){
		  $gameSwitches.setValue(380,true);
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:201, data/CommonEvents.json:common-event:202
	setVariable19Var327 = function () {
		var newValue2 = 22;
		for (var slotIndex2 = 1; slotIndex2 <= 100; slotIndex2++) {
		  if($gameVariables.value(327)[slotIndex2] == 2){
		    var newValue2 = slotIndex2;
		    break;
		}};
		$gameVariables.setValue(19,newValue2);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:201, data/CommonEvents.json:common-event:202, data/Map003.json:map-event:133:page:2
	setVariable161 = function () {
		var variable19Value = $dataWeapons[$gameVariables.value(19)].meta['HomePosition'].split(',');
		if(Number(variable19Value[3]) == 0){
		  var newValue2 = 1;
		} else {
		  var newValue2 = -1;
		};
		$gameVariables.setValue(161,[Number(variable19Value[0]),
		Number(variable19Value[1]) + newValue2,Number(variable19Value[2])]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:201, data/CommonEvents.json:common-event:202
	countDefeatedEnemyVar240And161Switch140 = function () {
		if($gameVariables.value(240) >= 1){
		  var variable240Value = $dataItems[$gameVariables.value(240)].meta['EscapeMapID'].split(',');
		  $gameVariables.setValue(161,[Number(variable240Value[0]),Number(variable240Value[1]),Number(variable240Value[2])]);
		} else {
		  $gameVariables.setValue(161,[14,26,7]);
		};
		if(Number(variable240Value[0]) != $gameMap.mapId()){
		  $gameSwitches.setValue(140,false);//マップ最初の処理終了スイッチ
		};
	};

	// Replaces (3x): data/CommonEvents.json:common-event:202
	setBattleAnimationSpeed2 = function (battleAnimationSpeed) {
		ConfigManager.battleAniSpeed = battleAnimationSpeed
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	setPickupSkillLabel = function () {
		var messageText2 = `持ち上げ＜OFF＞`;
		$gameSystem._pickupData[0] = false;
		$dataSkills[26].name =`${messageText2}`;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	loadSkillPersonalSwitchAndSelectSkill = function (interp) {
		return (function () {
		var changeSkill = valueChangeSkill;
		changeSkill.forEach(function(id) {
		  skill_personalonoffload(id,0);
		}, interp);
		var changeSkill = valueVariablesChangeSkill;
		changeSkill.forEach(function(id) {
		  skill_sentaku(id,0);
		}, interp);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	loadSkillPersonalSwitch = function (interp) {
		return (function () {
		var personalSkill = valuePersonalSkill;
		personalSkill.forEach(function(id) {
		  skill_personalonoffload(id,0);
		}, interp);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	loadSkillPersonalSwitch2 = function (interp) {
		return (function () {
		var personalItem = valuePersonalItem;
		personalItem.forEach(function(id) {
		  skill_personalonoffload(id,1);
		}, interp);
		}).call(interp);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:205, data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:313
	setMapSelfSwitchMapFirsttAction = function (textValue) {
		for (var eventId2 = 1; eventId2 < 100; eventId2++) {
		  if(!!$gameMap.event(eventId2)) {
		    if ($gameMap.event(eventId2).event().meta['MapFirsttAction'] ){
		      var mapMapId = $gameMap.mapId();
		      var key3 = eventId2;
		      var key4 = textValue;
		      var newValue2 = false;
		      $gameSelfSwitches.setValue([mapMapId, key3, key4], newValue2);
		      break;
		}}};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	setWeaponUnique = function (interp) {
		return (function () {
		var variable248Value = $gameVariables.value(248);
		variable248Value.forEach(function(id) {
		  $dataWeapons[id+200].name = $gameVariables.value(id+380)[50]; 
		  weapon_uniqueSet(id);
		}, interp);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	addAllSacredBeastParams = function () {
		seisyoujuu_addParamsAll();//星晶獣強化反映
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	setTraitChangeAndSetInfoY = function () {
		trait_changeSetting(106);//信仰バフステート変動設定
		trait_changeSetting(107);//食事バフステート変動設定
		info_SetY($gameVariables.value(200));//インフォY軸補正値ミニステで変更
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	setNpcProfession = function () {
		//NPC役職名配列
		setNPCProfession();
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	setNpcFamilyName = function () {
		//NPC苗字設定
		setNPCFamilyName();
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	configureActorFromVariable11 = function () {
		var variable11Value = $gameActors.actor($gameVariables.value(11));
		if(variable11Value.skillMasteryLevel(772) > Number($dataSkills[772].meta['Max Mastery Level'])){
		  variable11Value.setSkillMasteryLevel(772, 5);
		};
		if(variable11Value.skillMasteryLevel(773) > Number($dataSkills[773].meta['Max Mastery Level'])){
		  variable11Value.setSkillMasteryLevel(773, 5);
		};
	};

	// Replaces (3x): data/CommonEvents.json:common-event:210, data/CommonEvents.json:common-event:259
	erasePictureP3 = function (rangeStart) {
		var pictureIds2 = [];
		for (var loopIndex = rangeStart; loopIndex <= 200; loopIndex++) {
		  if($gameScreen.picture(loopIndex)){
		    pictureIds2.push(loopIndex);
		  };
		};
		pic_eraseP(0,pictureIds2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:211, data/CommonEvents.json:common-event:215
	setSwitch379 = function (interp) {
		return (function () {
		var constantValue = 0;
		var variable247Value = $gameVariables.value(247);
		variable247Value.forEach(function(id) {
		if($gameParty.members().contains($gameActors.actor(id))){
		$gameSwitches.setValue(id+100,true);
		constantValue += 1;
		}}, interp);
		if(constantValue <= 1){
		$gameSwitches.setValue(379,true);
		};
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:217, data/CommonEvents.json:common-event:249
	setSelfVariable702 = function (interp) {
		return (function () {
		interp.sVal(702,$gameVariables.value(702) + 1);
		//this.character($gameVariables.value(196)).requestAnimation(180);
		//this.addPopup(["add","text:\\V[702]"]);
		}).call(interp);
	};

	// Replaces (10x): data/CommonEvents.json:common-event:219, data/CommonEvents.json:common-event:307, data/CommonEvents.json:common-event:401, data/CommonEvents.json:common-event:411, data/CommonEvents.json:common-event:451, data/Map007.json:map-event:3:page:1, …
	assignSelfVariableValue2 = function (interp, variableId, newValue) {
		return (function (variableId, newValue) {
		interp.sVal(variableId,newValue);
		}).call(interp, variableId, newValue);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:221
	showPictureFromArgs = function (pictureId, pictureName, origin, x, y) {
		$gameScreen.showPicture(pictureId,pictureName,origin,
		x,y,100,100,255,0)
	};

	// Replaces (1x): data/CommonEvents.json:common-event:221
	showPicture3 = function () {
		if($gameSwitches.value(488)){
		  $gameScreen.showPicture(3,'PictureBottan3a',1,
		  255,39,100,100,255,0)
		} else {
		  $gameScreen.showPicture(3,'PictureBottan3',1,
		  255,39,100,100,255,0)
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:221
	showPictureFromArgs2 = function (pictureId, pictureName, x, pictureId2, pictureName2, x2) {
		$gameScreen.showPicture(pictureId,pictureName,1,
		x,39,100,100,255,0)
		$gameScreen.showPicture(pictureId2,pictureName2,1,
		x2,39,100,100,255,0)
	};

	// Replaces (1x): data/CommonEvents.json:common-event:234
	speakCharacterOneLiner = function (interp) {
		var messageText2 = `親愛なる隣人の旅路に祝福を──`;
		return (function () {
		var randomXOffsets = [0];
		var randomYOffsets = [-50];
		var lineCandidates = [`${messageText2}`];
		chara_oneWord(100,interp._eventId,28,240,randomXOffsets,randomYOffsets,lineCandidates,0);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:338
	speakCharacterOneLiner2 = function (interp) {
		var messageText2 = `ゴクゴクっ──`;
		return (function () {
		var randomXOffsets = [0];
		var randomYOffsets = [-50];
		var lineCandidates = [`${messageText2}`];
		chara_oneWord(100,interp._eventId,25,240,randomXOffsets,randomYOffsets,lineCandidates,0);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:541
	speakCharacterOneLiner3 = function (interp) {
		var messageText2 = `ガサゴソ…`;
		return (function () {
		var randomXOffsets = [0];
		var randomYOffsets = [-50];
		var lineCandidates = [`${messageText2}`];
		chara_oneWord(100,interp._eventId,25,180,randomXOffsets,randomYOffsets,lineCandidates,0);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:235
	configureActorFromVariable20Var21 = function () {
		var textPrefix = `\\set[`;
		var textPart2 = `]は、<`;
		var textSuffix = `>に\\rb[昇格,レアリティ・アップ]した！`;
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		$gameVariables.setValue(21,
		`${textPrefix}${$gameVariables.value(20)}${textPart2}${valueCountSet1}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:254
	configureActorFromVariable20Var21_2 = function () {
		var messageText2 = `を初期化します。よろしいですか？\n（H履歴は影響ありませんが、\n各種開発度ランクはリセットされます。\nサブジョブのレベルは完全にはリセットされません）`;
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		$gameVariables.setValue(21,
		`${variable20Value.name()}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:254
	configureActorFromVariable20Var21_3 = function () {
		var messageText2 = `のリセット処理が完了しました。`;
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		$gameVariables.setValue(21,
		`${variable20Value.name()}${messageText2}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:259
	configureActorFromVariable20Var801And21 = function () {
		var textPrefix = `は[`;
		var textSuffix = `]のジョブ解放条件を満たしていません…。\n`;
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		$gameVariables.setValue(801,
		`${variable20Value.name()}${textPrefix}${$dataClasses[$gameVariables.value(21)].name}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:313
	configureActorFromVariable20Var21_4 = function () {
		var textPrefix = `\\set[`;
		var textPart2 = `]は、`;
		var controlCode = `\\sin[405]`;
		var textSuffix = `に\\rb[昇格,レアリティ・アップ]した！`;
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		$gameVariables.setValue(21,
		`${textPrefix}${$gameVariables.value(20)}${textPart2}${controlCode}${textSuffix}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:236
	setActor20NameVar400 = function () {
		var messageText2 = `バニーさん`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataWeapons[433].name}`;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:242, data/Map094.json:map-event:32:page:1
	setActor20NameVar400_2 = function (textValue) {
		var messageText2 = `受付`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = textValue;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:246
	setActor20NameVar400_3 = function () {
		var messageText2 = `ピエロ`;
		var textPart2 = `タートル・エクスペリエンス社`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${textPart2}`;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:308, data/CommonEvents.json:common-event:355
	setActor20NameVar400_4 = function () {
		var messageText2 = `ボスゴブリン`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataSystem.switches[248]}`;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:390, data/CommonEvents.json:common-event:576
	setActor20NameVar400_5 = function () {
		var messageText2 = `女将`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataWeapons[434].name}`;
	};

	// Replaces (2x): data/Map003.json:map-event:155:page:1, data/Map022.json:map-event:6:page:1
	setActor20NameVar400_6 = function () {
		var messageText2 = `受付嬢`;
		var textPart2 = `支部`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataWeapons[76].name}${$dataWeapons[22].name}${textPart2}`;
	};

	// Replaces (1x): data/Map003.json:map-event:164:page:1
	setActor20NameVar400_7 = function () {
		var messageText2 = `販売員`;
		var textPart2 = `ギルド出張所`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataWeapons[402].name}${textPart2}`;
	};

	// Replaces (4x): data/Map003.json:map-event:188:page:1, data/Map024.json:map-event:2:page:1, data/Map079.json:map-event:2:page:1, data/Map195.json:map-event:2:page:1
	setActor20NameVar400_8 = function () {
		var messageText2 = `神官`;
		var textPart2 = `支部`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataWeapons[77].name}${$dataWeapons[22].name}${textPart2}`;
	};

	// Replaces (2x): data/Map003.json:map-event:229:page:1, data/Map023.json:map-event:3:page:1
	setActor20NameVar400_9 = function () {
		var messageText2 = `鍛冶師`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataWeapons[401].name}`;
	};

	// Replaces (2x): data/Map003.json:map-event:230:page:1, data/Map021.json:map-event:10:page:1
	setActor20NameVar400_10 = function () {
		var messageText2 = `鑑定師`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataWeapons[403].name}`;
	};

	// Replaces (2x): data/Map003.json:map-event:233:page:1, data/Map022.json:map-event:9:page:1
	setActor20NameVar400_11 = function () {
		var messageText2 = `錬金術師`;
		var textPart2 = `流れの錬金術師`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${textPart2}`;
	};

	// Replaces (1x): data/Map018.json:map-event:27:page:1
	setActor20NameVar400_12 = function () {
		var messageText2 = `おばさん`;
		var textPart2 = `ネルガド住民`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${textPart2}`;
	};

	// Replaces (1x): data/Map018.json:map-event:28:page:1
	setActor20NameVar400_13 = function () {
		var messageText2 = `お姉さん`;
		var textPart2 = `ネルガド住民`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${textPart2}`;
	};

	// Replaces (1x): data/Map022.json:map-event:3:page:1
	setActor20NameVar400_14 = function () {
		var messageText2 = `販売員`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataWeapons[402].name}`;
	};

	// Replaces (1x): data/Map048.json:map-event:3:page:1
	setActor20NameVar400_15 = function () {
		var messageText2 = `受付`;
		var textPart2 = `支部`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataWeapons[76].name}${$dataWeapons[41].name}${textPart2}`;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:240
	setValueScriptArray1 = function (numericValue, numericValue2) {
		if(valueCountSet1 == numericValue){valueScriptArray1 = [numericValue2]};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:241
	setWeaponUniqueAndAddWeaponUnique = function (countValue) {
		var textPrefix = `\\WIN[`;
		var variableCode = `\\V[801]`;
		var textSuffix = `\n※付与効果は強化の度に選択/追加されていきます。`;
		var variable20Value = $gameVariables.value(20);
		weapon_uniqueSet(variable20Value);
		valueCountSet3 = countValue;
		weapon_uniqueAdd(variable20Value+80);
		var text3 = `${textPrefix}${variable20Value+80}]
${variableCode}${textSuffix}`;
		WindowManager.show(0, 270, 80, 1010, 450);
		WindowManager.drawText(0, `${text3}`);
	};

	// Replaces (26x): data/CommonEvents.json:common-event:241, data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:336, data/CommonEvents.json:common-event:337, data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:344, …
	enableMapSelfSwitchForEvent = function (key, key2) {
		$gameSelfSwitches.setValue([$gameMap.mapId(), key, key2], true);
	};

	// Replaces (9x): data/CommonEvents.json:common-event:241, data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:310, data/CommonEvents.json:common-event:316, data/CommonEvents.json:common-event:336, …
	enableMapSelfSwitchForEventAtKey = function (key, key2) {
		$gameSelfSwitches.setValue([$gameMap.mapId(), key, key2], false);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:243, data/CommonEvents.json:common-event:244
	showPicture1 = function (textValue) {
		var constantValue = 100;
		var textValue2 = textValue;
		var presetValues = [4,5,6,7];
		var randomValue4 = presetValues[getRandomIndex(presetValues.length)];
		pic_1(2,constantValue,textValue2,randomValue4,100,255,20,1280,768,0,0);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:248, data/CommonEvents.json:common-event:249
	readVariable196 = function (interp) {
		return (function () {
		interp._eventId = $gameVariables.value(196);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:256
	setWeaponNameOrNone = function (weaponSlotIndex, switchId, variableId, newValue, switchId2, variableId2) {
		var messageText2 = `なし`;
		if($gameVariables.value($gameVariables.value(20)+380)[weaponSlotIndex] != 0){
		  $gameSwitches.setValue(switchId,true);
		  $gameVariables.setValue(variableId,$dataWeapons[$gameVariables.value($gameVariables.value(20)+380)[newValue]].name);
		} else {
		  $gameSwitches.setValue(switchId2,false);
		  $gameVariables.setValue(variableId2,`${messageText2}`);
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:256
	clearWeaponSlot = function (weaponSlotIndex) {
		$gameVariables.value($gameVariables.value(20)+380)[weaponSlotIndex] = 0;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:259, data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:361
	spawnMapEventVar292 = function (numericValue, x, y, opacity) {
		var numericValue2 = numericValue;
		$gameMap.spawnEvent(146, x, y, true);
		$gameVariables.value(292)[numericValue2] = $gameMap.getLastSpawnEventId();
		var variable292Value = $gameVariables.value(292)[numericValue2];
		var event2 = $gameMap.event(variable292Value);
		event2.setOpacity(opacity);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:259
	forceCharacterMoveRouteVar292 = function (eventId, moveRouteParameter) {
		  $gameMap.event($gameVariables.value(292)[eventId]).forceMoveRoute({
		  "list":[
		  {"code":45, "parameters":[moveRouteParameter]},
		  {"code":0}],"repeat":false,"skippable":true});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:259
	forceCharacterMoveRouteVar292_2 = function (moveRouteParameter, moveRouteParameter2) {
		  $gameMap.event($gameVariables.value(292)[12]).forceMoveRoute({
		  "list":[
		  {"code":45, "parameters":[moveRouteParameter]},
		  {"code":45, "parameters":[moveRouteParameter2]},
		  {"code":0}],"repeat":false,"skippable":true});
	};

	// Replaces (4x): data/CommonEvents.json:common-event:259
	writeVariableArraySlotVar292_2 = function () {
		$gameMap.eraseEvent($gameVariables.value(292)[11]);
		$gameMap.eraseEvent($gameVariables.value(292)[12]);
		$gameVariables.value(292)[11] = 0;
		$gameVariables.value(292)[12] = 0;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:259, data/CommonEvents.json:common-event:301
	readVariable292 = function (interp, slotIndex) {
		return (function (slotIndex) {
		interp._eventId = $gameVariables.value(292)[slotIndex];
		}).call(interp, slotIndex);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:288
	startParallelEventVar135Actor5Switch474 = function () {
		if($gameVariables.value(135) == 12){
		  if($gameSwitches.value(233)){//教会
		    if($gameActors.actor(5).level >= 10){
		      event_pararelStarting(0,313,0);
		      $gameSwitches.setValue(474,true);
		    };
		  };
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:288
	startParallelEventVar135And642Switch474 = function () {
		if($gameVariables.value(135) == 11){
		  if($gameMap.mapId() == 96){
		    if($gameVariables.value(642) >= 10){
		      event_pararelStarting(0,312,0);
		      $gameSwitches.setValue(474,true);
		    };
		  };
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:288
	setValueGetInfoPointX = function (getInfoPointX) {
		valueGetInfoPointX = getInfoPointX;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:290, data/CommonEvents.json:common-event:295
	setVariable141Text = function () {
		var variable142Value = $gameVariables.value(142);
		$gameVariables.setValue(141,`${variable142Value}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:291, data/CommonEvents.json:common-event:296
	setValueScriptArray1_2 = function () {
		valueScriptArray1 = [];
		valueScriptArray2 = [];
	};

	// Replaces (3x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:343
	setInterpreterWaitMode = function (interp) {
		return (function () {
		interp.setWaitMode('scroll');
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:335, data/CommonEvents.json:common-event:337
	fadePicture1ZX_Main034_ = function () {
		valuePic1 = 55;
		valueScenePic = 'ZX_Main034_';
		var pictureName2 = valueScenePic+'01';
		$gameScreen.showPicture(valuePic1,pictureName2,1,640,384,100,100,0,0);
		$gameScreen.movePicture(valuePic1,1,640,384,100,100,255,0,60);
		picture_fade1(valuePic1,"fadeIn",valueWipeImg,60,5);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:338
	startStandingPictureDialogue = function (interp, argument1) {
		return (function (argument1) {
		//「一人で立ち絵変化させる時は4」「NPC会話の時は0」
		tachie_kaiwastart(false,false,1,argument1);
		interp.setupChild($dataCommonEvents[18].list, 0);
		}).call(interp, argument1);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:329, data/Map007.json:map-event:23:page:1
	playSeEffectZ_ClothesTakeOff = function () {
		var se2 = 'Z_ClothesTakeOff';
		AudioManager.playSe({"name":se2,"volume":150,"pitch":100,"pan":0});
	};

	// Replaces (6x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:304, data/CommonEvents.json:common-event:325, data/CommonEvents.json:common-event:327, data/CommonEvents.json:common-event:335, data/CommonEvents.json:common-event:339
	setupRespawnEnemyAVar530And292 = function () {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value,13,5,0);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setDirection(2);
		var variable530Value = 3;//$gameVariables.value(530);
		event_respawnSetA(variable530Value,14,6,0);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setDirection(4);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:327
	setupRespawnEnemyAVar530And292_2 = function (variableId, posX, posY, direction) {
		var charaSlotId = variableId;//$gameVariables.value(530);
		event_respawnSetA(charaSlotId,posX,posY,0);
		var variable292Value = $gameMap.event($gameVariables.value(292)[charaSlotId]);
		variable292Value.setDirection(direction);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:310, data/CommonEvents.json:common-event:314, data/CommonEvents.json:common-event:316
	setupRespawnEnemyNVar292 = function (interp, key, posX, posY) {
		return (function (key, posX, posY) {
		$gameSelfSwitches.setValue([$gameMap.mapId(), key, 'A'], true);
		var charaSlotId = 11;
		event_respawnSetN(charaSlotId,posX,posY,0,'Goods9',0,2);
		interp._eventId = $gameVariables.value(292)[charaSlotId];
		}).call(interp, key, posX, posY);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:292, data/CommonEvents.json:common-event:310, data/CommonEvents.json:common-event:314
	setupRespawnEnemyAVar530 = function () {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value,13,5,0,2);
		var variable530Value = 3;//$gameVariables.value(530);
		event_respawnSetA(variable530Value,14,6,0,4);
		var variable530Value = 4;//$gameVariables.value(530);
		event_respawnSetA(variable530Value,12,6,0,6);
		var variable530Value = 5;//$gameVariables.value(530);
		event_respawnSetA(variable530Value,13,7,0,8);
	};

	// Replaces (11x): data/CommonEvents.json:common-event:294, data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:370, data/CommonEvents.json:common-event:371, data/CommonEvents.json:common-event:372, data/CommonEvents.json:common-event:373, …
	showHExperienceTable2 = function (requestedPartnerWeaponId) {
		h_keikenhyouji2(521,requestedPartnerWeaponId);//backGraund_menuMapSelectで消去
	};

	// Replaces (2x): data/CommonEvents.json:common-event:297, data/CommonEvents.json:common-event:400
	readVariable292_2 = function (interp) {
		return (function () {
		var variable292Value = $gameVariables.value(292);
		variable292Value.forEach(function(id1) {
		  if(id1 == 0){}else{
		    if(!!$gameMap.event(id1)) {
		      $gameMap.eraseEvent(id1);
		  }};
		}, interp);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:298
	setValuePic1Var17 = function () {
		valuePic1 = 55;
		valueCountSet1 = getRandomIndex(51) + 200;
		var presetValues = [1,2,1,1][getRandomIndex(4)];
		if($gameVariables.value(17) >= 500){
		  var presetValues = [2,3,4,5][getRandomIndex(4)];
		};
		var pictureName2 = "Zev_Opening1_"+presetValues;
		$gameScreen.showPicture(valuePic1,pictureName2,1,640+450-500,384,300,300,0,0);
		$gameScreen.movePicture(valuePic1,1,640+450,384,100,100,valueCountSet1,0,300);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:298
	blessStandingPictureVar17 = function () {
		var messageText2 = `連番`;
		$gameScreen.setPicturesAnimation(3, 2, `${messageText2}`, 5);
		var constantValue = 1;
		if($gameVariables.value(17) >= 500){
		  var constantValue = 2;
		};
		var pictureName2 = "Zev_Opening2_"+constantValue+"_0";
		$gameScreen.showPicture(valuePic1+1,pictureName2,1,640+450-500,384,300,300,0,0);
		$gameScreen.movePicture(valuePic1+1,1,640+450,384,100,100,valueCountSet1,0,300);
		tachie_bless(valuePic1,2);
		tachie_bless(valuePic1+1,2);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:298
	playScreenParticleWing_r2 = function () {
		var particleName2 = 'wing_r2';
		var eventId2 = ['2','this','99'];
		$gameScreen._particle.particlePlay(eventId2[0],particleName2 + '-' + 2,eventId2[1],particleName2,eventId2[2]);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:299
	setSwitch414 = function (interp) {
		return (function () {
		var variable173Value = $gameVariables.value(173);
		variable173Value.forEach(function(id) {
		  if($gameVariables.value(135) == id){
		    var eventId2 = this._eventId;
		    var event2 = $gameMap.event(eventId2).event();
		    $gameSwitches.setValue(414,true);
		    if(event2.meta['MQProgress']){
		      if(Number(event2.meta['MQProgress']) == id){
		        $gameSwitches.setValue(414,false);
		}}};
		}, interp);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:300
	setupChildInterpreter4 = function (interp) {
		var textPrefix = `全体マップに`;
		var colorCode4 = `\\C[16]`;
		var colorResetCode = `\\C[0]`;
		var textSuffix = `が追加されました`;
		return (function () {
		interp.sVal(20,0);
		var tempValue = $dataSystem.switches[252];
		valueWordSet0 = `${textPrefix}${colorCode4}${tempValue}${colorResetCode}${textSuffix}`;
		valueWordSetEx = 0;//補足が必要な場合
		interp.setupChild($dataCommonEvents[45].list, 0);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:350
	setupChildInterpreter5 = function (interp) {
		var messageText2 = `からクリア後ダンジョンに行けるようになりました`;
		return (function () {
		interp.sVal(20,0);
		var tempValue = $dataSystem.switches[259];
		valueWordSet0 = `${tempValue}${messageText2}`;
		valueWordSetEx = 0;//補足が必要な場合
		interp.setupChild($dataCommonEvents[45].list, 0);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:300, data/CommonEvents.json:common-event:301
	setupRespawnEnemyNVar292_2 = function (interp) {
		return (function () {
		var charaSlotId = 11;
		event_respawnSetN(charaSlotId,25,7,0,'$airship02',0);
		var variable292Value = $gameMap.event($gameVariables.value(292)[charaSlotId]);
		interp._eventId = $gameVariables.value(292)[charaSlotId];
		variable292Value.setDirection(4);
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:300, data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:349
	playScreenParticleWing_r2_2 = function (interp) {
		return (function () {
		var particleName2 = 'wing_r2';
		var eventId2 = [interp._eventId,'this','99'];
		$gameScreen._particle.particlePlay(eventId2[0],particleName2 + '-' + eventId2[0],eventId2[1],particleName2,eventId2[2]);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:300, data/Map007.json:map-event:3:page:1
	setEventCharacterAfterimageVar292 = function (interp) {
		return (function () {
		//$gameVariables.setValue(292,Array(21).fill(0));
		var zanzouType = 20;
		event_charaZanzou(interp._eventId,zanzouType);
		interp._eventId = $gameVariables.value(292)[zanzouType];
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:300, data/Map007.json:map-event:3:page:1
	setEventCharacterAfterimageVar292_2 = function (interp) {
		return (function () {
		var zanzouType = 19;
		event_charaZanzou(interp._eventId,zanzouType);
		interp._eventId = $gameVariables.value(292)[zanzouType];
		}).call(interp);
	};

	// Replaces (151x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:303, data/CommonEvents.json:common-event:304, data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:306, …
	assignVariableTripleFromArgs = function (variableId, newValue, newValue2, newValue3) {
		$gameVariables.setValue(variableId,[newValue,newValue2,newValue3]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:452
	setupChildInterpreter6 = function (interp, newValue) {
		return (function (newValue) {
		interp.sVal(172,newValue);
		valueTalkSet = [1,1];//1で付与2で直接表示\CE[60]のみ0で解除,ｱｸﾀｰid
		interp.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp, newValue);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:338
	showPopupMessage2Var292 = function (variableId) {
		var messageId = variableId;//$gameVariables.value(292)[value1];
		message_popup2(messageId,0,2,1);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:309
	fetchInfoDirectVar71 = function (databaseEntryId, itemAmount) {
		$gameVariables.setValue(71,240);
		get_infoDirect(0,databaseEntryId,0,itemAmount);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/Map007.json:map-event:4:page:1
	setMapWeather2Var256 = function () {
		$gameVariables.setValue(256,11);//火事
		map_weatherSet2();
	};

	// Replaces (4x): data/CommonEvents.json:common-event:301
	respawnMapNpc = function (npcId) {
		for (var loopIndex = 1; loopIndex <= 5; loopIndex++) {
		$gameVariables.setValue(33,'BB_akunin');
		$gameVariables.setValue(35,3);
		$gameVariables.setValue(37,getRandomIndex(3) + 2);
		$gameVariables.setValue(34,getRandomIndex(2) + 4);
		map_npcRespawn(1,npcId);
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	speakCharacterOneLinerSourceHanSerifHeavy = function () {
		var messageText2 = `「ヒャッハァッッ！」`;
		var randomXOffsets = [0];
		var randomYOffsets = [-50];
		var lineCandidates = [`${messageText2}`];
		chara_oneWord(76,3,25,120,randomXOffsets,randomYOffsets,lineCandidates,'SourceHanSerif-Heavy');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	speakCharacterOneLinerGenkaiMincho = function () {
		var messageText2 = `「ギャアアアアアアアアアッッ────！！」`;
		var randomXOffsets = [0];
		var randomYOffsets = [-50];
		var lineCandidates = [`${messageText2}`];
		chara_oneWord(77,3,25,180,randomXOffsets,randomYOffsets,lineCandidates,'genkai-mincho');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	speakCharacterOneLinerTamanegiv6 = function () {
		var messageText2 = `ウオオオオォォッッ！！`;
		var randomXOffsets = [0];
		var randomYOffsets = [-50];
		var lineCandidates = [`${messageText2}`];
		chara_oneWord(100,6,25,180,randomXOffsets,randomYOffsets,lineCandidates,'Tamanegiv6');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	setVariable21TextVar22 = function () {
		var messageText2 = `空賊A `;
		var controlCode = `\\}`;
		var textPart2 = `空賊B `;
		$gameVariables.setValue(21,`${messageText2}${controlCode}${$dataWeapons[74].name}`);
		$gameVariables.setValue(22,`${textPart2}${controlCode}${$dataWeapons[74].name}`);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301
	setVariable21TextVar22_2 = function () {
		var messageText2 = `少年 `;
		var controlCode = `\\}`;
		var textPart2 = `空賊C `;
		$gameVariables.setValue(21,`${messageText2}${controlCode}${$dataWeapons[79].name}`);
		$gameVariables.setValue(22,`${textPart2}${controlCode}${$dataWeapons[74].name}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301
	setMapWeather2Var256_2 = function (newValue) {
		$gameVariables.setValue(256,newValue);//本降り
		map_weatherSet2();
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/Map007.json:map-event:3:page:1
	bindInterpreterToEventId = function (interp, argument1) {
		return (function (argument1) {
		interp._eventId = argument1;
		}).call(interp, argument1);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:401
	setActor22Name2 = function (actorId) {
		$gameActors.actor(22).setName($gameActors.actor(actorId).name().slice(0, 1));
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:471
	erasePictureP4 = function () {
		valuePic1 = 55;
		for (var loopIndex = 0; loopIndex <= 3; loopIndex++) {pic_eraseP(1,[valuePic1+loopIndex])};
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:349
	setupRespawnEnemyAVar530And292_3 = function (interp, variableId, posX, posY, zoomFlag) {
		return (function (variableId, posX, posY, zoomFlag) {
		var charaSlotId = variableId;//$gameVariables.value(530);
		event_respawnSetA(charaSlotId,posX,posY,zoomFlag);
		interp._eventId = $gameVariables.value(292)[charaSlotId];
		}).call(interp, variableId, posX, posY, zoomFlag);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:543
	fadePicture1ScreenBlackOut = function (actorPictureId, opacity) {
		valuePic1 = actorPictureId;
		var pictureName2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1,pictureName2,1,640,384,100,100,opacity,0);
		picture_fade1(valuePic1,"fadeIn",valueWipeImg,60,5);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:302, data/Map018.json:map-event:32:page:1
	setVariable21 = function (newValue) {
		$gameVariables.setValue(21,
		$gameVariables.value(380+newValue)[59]);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/Map094.json:map-event:45:page:1
	fadePicture1FadeOut_2 = function (actorPictureId) {
		valuePic1 = actorPictureId;
		picture_fade1(valuePic1,"fadeOut",valueWipeImg,60,5);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:303, data/CommonEvents.json:common-event:324, …
	saveBgmAndFadeOut = function (duration) {
		$gameSystem.saveBgm();
		AudioManager.fadeOutBgm(duration);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:304, data/CommonEvents.json:common-event:305, …
	assignSelfVariableFromSystemSwitch = function (interp, variableId, newValue) {
		return (function (variableId, newValue) {
		interp.sVal(variableId,$dataSystem.switches[newValue]);
		}).call(interp, variableId, newValue);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:471
	showMapCenterLabel = function (interp, switchIndex) {
		var textPrefix = `\\CL【`;
		var textSuffix = `】`;
		return (function (switchIndex) {
		var tempValue = $dataSystem.switches[switchIndex];
		map_centerDispray(55,`${textPrefix}${tempValue}${textSuffix}`);
		interp.wait(40);
		}).call(interp, switchIndex);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301
	moveStandingPicture1 = function (actorPictureId) {
		valuePic1 = actorPictureId;
		picTachie_move1(valuePic1,-500,0,0,0,0,60);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:304, data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:309, data/CommonEvents.json:common-event:339, data/CommonEvents.json:common-event:382, …
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc = function (numericValue) {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value,variable163Value[3],variable163Value[4],1);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setImage(variable163Value[1], variable163Value[2]);
		variable292Value.setDirection(variable163Value[5]);
		var variable530Value = numericValue;
		event_respawnSetN(variable530Value,variable163Value[8],variable163Value[9],0,variable163Value[6],variable163Value[7]);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setDirection(variable163Value[10]);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:401, data/Map094.json:map-event:45:page:1
	setupRespawnEnemyAVar530And292_4 = function (posX, posY, zoomFlag, direction) {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value,posX,posY,zoomFlag);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setDirection(direction);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:511, data/CommonEvents.json:common-event:552, data/Map094.json:map-event:45:page:1
	setupRespawnEnemyNVar292_3 = function (numericValue, posX, posY, zoomFlag, imageName, imageIndex, direction) {
		var charaSlotId = numericValue;
		event_respawnSetN(charaSlotId,posX,posY,zoomFlag,imageName,imageIndex);
		var variable292Value = $gameMap.event($gameVariables.value(292)[charaSlotId]);
		variable292Value.setDirection(direction);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:303, data/CommonEvents.json:common-event:324
	setupRespawnEnemyNVar292_4 = function (posX, posX2) {
		var charaSlotId = 11;
		event_respawnSetN(charaSlotId,13,22,0,'People3',6);
		var variable292Value = $gameMap.event($gameVariables.value(292)[charaSlotId]);
		variable292Value.setDirection(8);
		var charaSlotId = 12;
		event_respawnSetN(charaSlotId,posX,23,0,'People3',7);
		var variable292Value = $gameMap.event($gameVariables.value(292)[charaSlotId]);
		variable292Value.setDirection(8);
		var charaSlotId = 13;
		event_respawnSetN(charaSlotId,posX2,23,0,'People3',7);
		var variable292Value = $gameMap.event($gameVariables.value(292)[charaSlotId]);
		variable292Value.setDirection(8);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:303, data/CommonEvents.json:common-event:324, data/CommonEvents.json:common-event:471
	forceCharacterMoveRouteVar292_3 = function (rangeStart, rangeEnd, moveRouteParameter) {
		for (var slotIndex2 = rangeStart; slotIndex2 <= rangeEnd; slotIndex2++) {
		  $gameMap.event($gameVariables.value(292)[slotIndex2]).forceMoveRoute({
		  "list":[
		  {"code":45, "parameters":["this.startOpacity(60,0);"]},
		  {"code":45, "parameters":[moveRouteParameter]},
		  {"code":0}],"repeat":false,"skippable":true});
		};
	};

	// Replaces (4x): data/CommonEvents.json:common-event:304, data/CommonEvents.json:common-event:325, data/CommonEvents.json:common-event:335, data/CommonEvents.json:common-event:339
	setupRespawnEnemyAVar530And292_5 = function () {
		var charaSlotId = 4;//$gameVariables.value(530);
		event_respawnSetA(charaSlotId,12,6,0);
		var variable292Value = $gameMap.event($gameVariables.value(292)[charaSlotId]);
		variable292Value.setDirection(6);
		var charaSlotId = 5;//$gameVariables.value(530);
		event_respawnSetA(charaSlotId,13,7,0);
		var variable292Value = $gameMap.event($gameVariables.value(292)[charaSlotId]);
		variable292Value.setDirection(8);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:305, data/CommonEvents.json:common-event:306
	setupRespawnEnemyAVar530And292_6 = function (interp, posX, posY) {
		return (function (posX, posY) {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value,posX,posY,1);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setDirection(2);
		var variable530Value = $gameVariables.value(530);
		interp._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp, posX, posY);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:306
	setQuestObjectivePrepareInTownAndAdvance = function (interp) {
		var textPrefix = `街で準備を整えて、\n`;
		var controlCode = `\\in[21]`;
		var textSuffix = `へ向かいましょう！`;
		return (function () {
		$gameVariables.setValue(134,
		`${textPrefix}${controlCode}${textSuffix}`);
		interp.sVal(21,$dataSystem.switches[248]);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:308
	setQuestObjectiveFightUnavoidableBoss = function (interp) {
		var textPrefix = `戦いは避けられませんね…。\n`;
		var controlCode = `\\in[21]`;
		var textSuffix = `ボスを討伐しましょう！`;
		return (function () {
		$gameVariables.setValue(134,
		`${textPrefix}${controlCode}${textSuffix}`);
		interp.sVal(21,$dataSystem.switches[248]);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:310
	setQuestObjectiveGoToCentralPlains = function (interp) {
		var messageText2 = `中央平原へ行きましょう`;
		return (function () {
		$gameVariables.setValue(134,
		`${messageText2}`);
		interp.sVal(21,$dataSystem.switches[248]);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:306, data/CommonEvents.json:common-event:336
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc2 = function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value,7,9,1,4);
		var variable530Value = 11;
		event_respawnSetN(variable530Value,variable163Value[8],variable163Value[9],0,variable163Value[6],variable163Value[7]);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setDirection(6);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:306, data/CommonEvents.json:common-event:342
	showScenePictureAndFadeIn = function (scenePicName) {
		valuePic1 = 55;
		valueScenePic = scenePicName;
		var pictureName2 = valueScenePic;
		$gameScreen.showPicture(valuePic1,pictureName2,1,640-128,384-20,100,100,0,0);
		$gameScreen.movePicture(valuePic1,1,640-128,384,100,100,255,0,60);
	};

	// Replaces (16x): data/CommonEvents.json:common-event:306, data/CommonEvents.json:common-event:310, data/CommonEvents.json:common-event:314, data/CommonEvents.json:common-event:325, data/CommonEvents.json:common-event:330, data/CommonEvents.json:common-event:336, …
	fetchInfoDirectVar71_2 = function (databaseTypeId, databaseEntryId, itemAmount) {
		$gameVariables.setValue(71,240);//ティッカーウェイト
		get_infoDirect(databaseTypeId,databaseEntryId,0,itemAmount);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:306
	showScenePictureAndFadeIn2 = function (picIndex, picIndex2) {
		//pic_move1(valuePic1+1,0,0,100,100,0,90);
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128+50,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128+50,384,100,100,255,0,60);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:306
	setVariable707Var706Switch125 = function () {
		var messageText2 = `「ハァ、ハァ…」`;
		var textPart2 = `「ン………」`;
		var textPart3 = `「ハァ…」`;
		var textPart4 = `「ハァっ………」`;
		var newValue2 = [`${messageText2}`,`${textPart2}`,`${textPart3}`,`${textPart4}`];//文字BGV
		$gameVariables.setValue(707,newValue2);
		$gameVariables.setValue(706,[640-128,386,1,120,0,'eromangasimaji']);
		$gameSwitches.setValue(125,true);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:391
	setVariable707Var706Switch125_2 = function () {
		var textPrefix = `「アンっ`;
		var iconCode = `\\I[12]`;
		var textSuffix = `」`;
		var textPart3 = `「ヒゥンっ`;
		var textPart4 = `」`;
		var textPart5 = `「アッ`;
		var textPart6 = `　ンン`;
		var textPart7 = `」`;
		var textPart8 = `「ヒンs[20]ンs[28]っ`;
		var textPart9 = `」`;
		var newValue2 = [`${textPrefix}${iconCode}${textSuffix}`,`${textPart3}${iconCode}${textPart4}`,`${textPart5}${iconCode}${textPart6}${iconCode}${textPart7}`,`${textPart8}${iconCode}${textPart9}`];//文字BGV
		$gameVariables.setValue(707,newValue2);
		$gameVariables.setValue(706,[640-128,386,0,80,0,'eromangasimaji']);
		$gameSwitches.setValue(125,true);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:531
	setVariable707Var706Switch125_3 = function () {
		var textPrefix = `「アンっ`;
		var iconCode = `\\I[12]`;
		var textSuffix = `」`;
		var textPart3 = `「ヒゥンっ`;
		var textPart4 = `」`;
		var textPart5 = `「アッ`;
		var textPart6 = `　ンン`;
		var textPart7 = `」`;
		var textPart8 = `「ヒンンっ`;
		var textPart9 = `」`;
		var newValue2 = [`${textPrefix}${iconCode}${textSuffix}`,`${textPart3}${iconCode}${textPart4}`,`${textPart5}${iconCode}${textPart6}${iconCode}${textPart7}`,`${textPart8}${iconCode}${textPart9}`];//文字BGV
		$gameVariables.setValue(707,newValue2);
		$gameVariables.setValue(706,[640-128,386,0,120,0,'eromangasimaji']);
		$gameSwitches.setValue(125,true);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:307, data/CommonEvents.json:common-event:311, data/CommonEvents.json:common-event:317, data/CommonEvents.json:common-event:320
	lockMonsterSymbolRoute = function () {
		for (var eventId2 = 200; eventId2 > 0; eventId2--) {
		  if(!!$gameMap.event(eventId2)) {
		    if ($gameMap.event(eventId2).event().meta['MonsterSymbol']){
		      $gameMap.event(eventId2).forceMoveRoute({
		      "list":[
		  {"code":15, "parameters":[600]},
		  {"code":0}],"repeat":true,"skippable":true});
		}}};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:307
	moveStandingPicture1_2 = function () {
		valuePic1 = 13;
		var scaleX2 = $gameScreen.picture(valuePic1).scaleX();
		picTachie_move1(valuePic1,0,0,-scaleX2*2,0,255,60);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:307, data/CommonEvents.json:common-event:335, data/CommonEvents.json:common-event:337
	setSelfVariableToActorPairNames = function (interp, variableId) {
		var messageText2 = `＆`;
		return (function (variableId) {
		interp.sVal(variableId,
		`${$gameActors.actor(3).name()}${messageText2}${$gameActors.actor(4).name()}`
		);
		}).call(interp, variableId);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:313, data/CommonEvents.json:common-event:322, data/CommonEvents.json:common-event:326, data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:339, data/CommonEvents.json:common-event:355, …
	setSelfVariable23 = function (interp, newValue) {
		return (function (newValue) {
		interp.sVal(23,
		newValue
		);
		}).call(interp, newValue);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:337
	setSelfVariableToActorNameWithExcept = function (interp) {
		var messageText2 = `以外`;
		return (function () {
		interp.sVal(23,
		`${$gameActors.actor(4).name()}${messageText2}`
		);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:356
	setSelfVariableToActorTrioNames = function (interp) {
		var textPrefix = `＆`;
		var textSuffix = `＆`;
		return (function () {
		interp.sVal(23,
		`${$gameActors.actor(3).name()}${textPrefix}${$gameActors.actor(4).name()}${textSuffix}${$gameActors.actor(5).name()}`
		);
		}).call(interp);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:308, data/CommonEvents.json:common-event:317, data/CommonEvents.json:common-event:320, data/CommonEvents.json:common-event:327, data/CommonEvents.json:common-event:328
	setupRespawnEnemyAVar530And163Etc = function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value,variable163Value[3],variable163Value[4],1);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setImage(variable163Value[1], variable163Value[2]);
		variable292Value.setDirection(variable163Value[5]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:309, data/CommonEvents.json:common-event:334
	fetchInfoDirectVar71_3 = function (databaseTypeId, databaseEntryId, databaseEntryId2, itemAmount) {
		$gameVariables.setValue(71,240);
		get_infoDirect(databaseTypeId,databaseEntryId,0,1);
		get_infoDirect(0,databaseEntryId2,0,itemAmount);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:312
	setupChildInterpreter7 = function (interp, talkPictureId) {
		var controlCode = `\\swi[252]`;
		var messageText2 = `の出現エネミーが変化しました。`;
		return (function (talkPictureId) {
		interp.sVal(172,19);//中央に一言メッセージ
		var templateText = `${controlCode}${messageText2}`;
		valueTalkSet = [talkPictureId,28,templateText,255];//0で消去 1で通常 2で時間経過  255で背景透明度
		interp.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp, talkPictureId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:314
	setMapSelfSwitch2 = function (key) {
		$gameSelfSwitches.setValue([$gameMap.mapId(), key, 'A'], true);
		var constantValue = 11;
	};

	// Replaces (6x): data/CommonEvents.json:common-event:316, data/CommonEvents.json:common-event:319, data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548
	fetchInfoDirectVar71_4 = function (databaseEntryId, databaseTypeId, databaseEntryId2, itemAmount) {
		$gameVariables.setValue(71,240);//ティッカーウェイト
		get_infoDirect(0,databaseEntryId,0,1);
		get_infoDirect(databaseTypeId,databaseEntryId2,0,itemAmount);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:318, data/CommonEvents.json:common-event:326, data/CommonEvents.json:common-event:333
	requestEventAnimationVar292 = function () {
		var eventId2 = 12;
		var variable292Value = $gameMap.event($gameVariables.value(292)[eventId2]);
		variable292Value.requestAnimation(635);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:322, data/CommonEvents.json:common-event:354
	setupRespawnEnemyNVar292_5 = function () {
		var charaSlotId = 11;
		event_respawnSetN(charaSlotId,27,8,0,'BB_akunin3',5);
		var variable292Value = $gameMap.event($gameVariables.value(292)[charaSlotId]);
		variable292Value.setDirection(2);
		variable292Value._spriteOffsetY = -10;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:322, data/CommonEvents.json:common-event:354, data/CommonEvents.json:common-event:358
	setupRespawnEnemyNBB_akunin3 = function () {
		var charaSlotId = 16;
		event_respawnSetN(charaSlotId,27,17,0,'BB_akunin3',0);
		var charaSlotId = 12;
		event_respawnSetN(charaSlotId,25,15,0,'BB_akunin3',1);
		var charaSlotId = 13;
		event_respawnSetN(charaSlotId,24,13,0,'BB_akunin3',2);
		var charaSlotId = 14;
		event_respawnSetN(charaSlotId,29,15,0,'BB_akunin3',3);
		var charaSlotId = 15;
		event_respawnSetN(charaSlotId,31,14,0,'BB_akunin3',4);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:322, data/CommonEvents.json:common-event:335
	moveNpcCharacterByIdVar292 = function (moveRouteCode) {
		var eventIds2 = [];
		eventIds2.push($gameVariables.value(292)[3]);
		eventIds2.push($gameVariables.value(292)[4]);
		eventIds2.push($gameVariables.value(292)[5]);
		event_NpcCharaMoveId(moveRouteCode,0,eventIds2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:323, data/CommonEvents.json:common-event:332
	setupRespawnEnemyAVar530And163Etc2 = function (interp, posX, posY, direction) {
		return (function (posX, posY, direction) {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value,posX,posY,1,direction);
		interp._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp, posX, posY, direction);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:325, data/CommonEvents.json:common-event:338
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc3 = function (interp) {
		return (function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value,variable163Value[3],variable163Value[4],1);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setImage(variable163Value[1], variable163Value[2]);
		variable292Value.setDirection(variable163Value[5]);
		var variable530Value = 11;
		event_respawnSetN(variable530Value,variable163Value[8],variable163Value[9],0,variable163Value[6],variable163Value[7]);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setDirection(variable163Value[10]);
		interp._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:327, data/CommonEvents.json:common-event:332, data/CommonEvents.json:common-event:349
	movePartyCharacter = function (moveRouteCode) {
		event_partyCharaMove(moveRouteCode,0);//19上を向く
	};

	// Replaces (2x): data/CommonEvents.json:common-event:329
	addStateToActorFromVariable20Actor1 = function () {
		var actor3 = $gameActors.actor(1);
		actor3.addState(693);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:330, data/CommonEvents.json:common-event:331
	setupChildInterpreterVar171 = function (interp) {
		return (function () {
		$gameVariables.setValue(171,[41,32,11]);
		//$gameVariables.setValue(528,100);
		interp.setupChild($dataCommonEvents[54].list, 0);
		}).call(interp);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:331, data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:356, data/CommonEvents.json:common-event:359, data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:546, …
	zoomCameraVar530And292 = function (variableId) {
		var easing = variableId;//$gameVariables.value(530);
		var easing = $gameVariables.value(292)[easing];
		drowsepost.camera.zoom(1, 60, easing);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:331, data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
	setMapSelfSwitch3 = function (numericValue, textValue) {
		var mapMapId = $gameMap.mapId();
		var key3 = numericValue;//this._eventId;
		var key4 = textValue;
		var newValue2 = true;//false;
		$gameSelfSwitches.setValue([mapMapId, key3, key4], newValue2);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:331, data/CommonEvents.json:common-event:337, data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	zoomCamera = function (easing) {
		drowsepost.camera.zoom(1, 60, easing);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:331, data/CommonEvents.json:common-event:337, data/CommonEvents.json:common-event:339, data/CommonEvents.json:common-event:530
	moveNpcCharacterByIdVar292_2 = function (slotIndex, slotIndex2, moveRouteCode) {
		var eventIds2 = [];
		eventIds2.push($gameVariables.value(292)[slotIndex]);
		eventIds2.push($gameVariables.value(292)[slotIndex2]);
		event_NpcCharaMoveId(moveRouteCode,0,eventIds2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:333, data/CommonEvents.json:common-event:348
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And292 = function (interp, posY, posY2, imageName, imageIndex, direction) {
		return (function (posY, posY2, imageName, imageIndex, direction) {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value,12,posY,1,8);
		interp._eventId = $gameVariables.value(292)[variable530Value];
		var variable530Value = 11;
		event_respawnSetN(variable530Value,12,posY2,0,imageName,imageIndex,direction);
		}).call(interp, posY, posY2, imageName, imageIndex, direction);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:336, data/CommonEvents.json:common-event:347, data/CommonEvents.json:common-event:349
	setupRespawnEnemyNVar292_6 = function (interp, posX, posY, imageName, direction) {
		return (function (posX, posY, imageName, direction) {
		var charaSlotId = 11;
		event_respawnSetN(charaSlotId,posX,posY,0,imageName,0,direction);
		interp._eventId = $gameVariables.value(292)[charaSlotId];
		}).call(interp, posX, posY, imageName, direction);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:338
	setStandingPictureActionVar20 = function (interp, expressionCode) {
		return (function (expressionCode) {
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		tachie_dousa(2,1,expressionCode,15,1,255,1344,0,0);
		tachie_dousa(1,1,4,15,1,255,0,0,0);
		interp.wait(3);
		}).call(interp, expressionCode);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:361, data/CommonEvents.json:common-event:471
	zoomCamera2 = function (interp) {
		return (function () {
		drowsepost.camera.zoom(1.5, 60, interp._eventId);
		}).call(interp);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:346, data/CommonEvents.json:common-event:361, data/CommonEvents.json:common-event:471, data/CommonEvents.json:common-event:530
	moveNpcCharacterByIdVar292_3 = function (slotIndex, moveRouteCode, moveRouteParameters) {
		var eventIds2 = [];
		eventIds2.push($gameVariables.value(292)[slotIndex]);
		event_NpcCharaMoveId(moveRouteCode,moveRouteParameters,eventIds2);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:547
	setupRespawnEnemyN = function (posX, posY, imageName, imageIndex, direction) {
		var charaSlotId = 11;
		event_respawnSetN(charaSlotId,posX,posY,0,imageName,imageIndex,direction);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:536
	startPictureAnimationFrame = function (numericValue) {
		var pic1 = valuePic1;
		if($gameScreen.picture(pic1)){
		  $gameScreen.picture(pic1).startAnimationFrame(numericValue, true, [1,1,1,2]);
		};
	};

	// Replaces (1x): data/CommonEvents.json:common-event:338
	setVariable707Var706Switch125_4 = function () {
		var textPrefix = `「アッ`;
		var iconCode = `\\I[12]`;
		var textSuffix = `」`;
		var textPart3 = `「ンッ`;
		var textPart4 = `」`;
		var textPart5 = `「ンン…`;
		var textPart6 = `」`;
		var textPart7 = `「ンクっ…`;
		var textPart8 = `」`;
		var textPart9 = `「ァンっ…`;
		var textPart10 = `」`;
		var newValue2 = [`${textPrefix}${iconCode}${textSuffix}`,`${textPart3}${iconCode}${textPart4}`,`${textPart5}${iconCode}${textPart6}`,`${textPart7}${iconCode}${textPart8}`,`${textPart9}${iconCode}${textPart10}`];//文字BGV
		$gameVariables.setValue(707,newValue2);
		$gameVariables.setValue(706,[640-128,386,1,180,0,'eromangasimaji']);
		$gameSwitches.setValue(125,true);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:518
	setVariable707Var706Switch125_5 = function () {
		var messageText2 = `「………ァっ」`;
		var textPart2 = `「いや…」`;
		var textPart3 = `「ンン──……」`;
		var textPart4 = `「ンクっ…」`;
		var textPart5 = `「ァンっ…」`;
		var newValue2 = [`${messageText2}`,`${textPart2}`,`${textPart3}`,`${textPart4}`,`${textPart5}`];//文字BGV
		$gameVariables.setValue(707,newValue2);
		$gameVariables.setValue(706,[640-128,386,1,180,0,'eromangasimaji']);
		$gameSwitches.setValue(125,true);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:338
	fadePicture1FadeIn = function (textValue, pictureId) {
		var pictureName2 = textValue;
		$gameScreen.showPicture(pictureId,pictureName2,1,640,384,100,100,255,0);
		picture_fade1(valuePic1,"fadeIn",'150',60,5);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:547, data/CommonEvents.json:common-event:548
	setupChildInterpreterVar2 = function (interp, newValue) {
		return (function (newValue) {
		interp.sVal(20,$gameVariables.value(2));
		interp.sVal(19,newValue);
		interp.sVal(14,16);//14ｱｲﾃﾑ称号15ｽｷﾙ習得16忘却,変数19にID
		interp.setupChild($dataCommonEvents[44].list, 0);
		}).call(interp, newValue);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:341, data/CommonEvents.json:common-event:507, data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:545
	showScenePictureAndFadeIn3 = function (picIndex, picIndex2, scaleX, scaleY) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,scaleX,scaleY,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
	};

	// Replaces (11x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:481, data/CommonEvents.json:common-event:503, data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537, data/CommonEvents.json:common-event:544, …
	setDarknessOpacity = function (opacity) {
		$gameMap.darknessOpacity = opacity;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:341
	fadePicture1ScreenBlackOut_2 = function () {
		valuePic1 = 55;
		var pictureName2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1-1,pictureName2,1,640,384,100,100,200,0);
		picture_fade1(valuePic1-1,"fadeIn",valueWipeImg,60,5);
	};

	// Replaces (8x): data/CommonEvents.json:common-event:341, …
	movePicture1_3 = function (picIndex, picIndex2, scaleX, scaleY) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,scaleX,scaleY,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		pic_move1(pictureId2-1,0,0,100,100,0,90);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:341, data/CommonEvents.json:common-event:342
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And292_2 = function (interp) {
		return (function () {
		var charaSlotId = 5;//$gameVariables.value(530);
		event_respawnSetA(charaSlotId,13,6,1,4);
		interp._eventId = $gameVariables.value(292)[charaSlotId];
		event_respawnSetN(11,18,10,0,'npcCastle1',2,4);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:342
	loadGameFont = function (interp, fontSize) {
		return (function (fontSize) {
		Graphics.loadFont("GameFont",fontSize);
		interp.wait(10);
		}).call(interp, fontSize);
	};

	// Replaces (8x): data/CommonEvents.json:common-event:342, data/CommonEvents.json:common-event:382, data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1, …
	showPopupMessage2Var292_2 = function (numericValue, numericValue2) {
		var messageId = numericValue;
		var messageId = $gameVariables.value(292)[messageId];
		message_popup2(messageId,0,numericValue2,1);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:342, data/CommonEvents.json:common-event:364
	setupChildInterpreter8 = function (interp, newValue) {
		return (function (newValue) {
		interp.sVal(14,19);interp.sVal(20,newValue);interp.sVal(121,0);//仲間加入コモン
		interp.setupChild($dataCommonEvents[64].list, 0);
		}).call(interp, newValue);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:343
	spawnScreenParticleVar292 = function (slotIndex) {
		var particleName2 = 'monster_c';
		var variable292Value = $gameVariables.value(292)[slotIndex];
		$gameScreen._particle.particleSet(variable292Value,particleName2+'-'+variable292Value,'this',particleName2);
		//$gameScreen._particle.particleClear(value1+'-'+value2);
		var particleName2 = 'mahoujin_c';
		$gameScreen._particle.particleSet(variable292Value,particleName2+'-'+variable292Value,'this',particleName2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:349, data/CommonEvents.json:common-event:542
	setupRespawnEnemyAVar530And163Etc3 = function (interp) {
		return (function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value,variable163Value[3],variable163Value[4],1,variable163Value[5]);
		interp._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:356, data/CommonEvents.json:common-event:357, data/CommonEvents.json:common-event:358, data/CommonEvents.json:common-event:359, data/CommonEvents.json:common-event:360, data/CommonEvents.json:common-event:362
	setupRespawnEnemyAVar530_2 = function (posX, posY) {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value,posX,posY,1,8);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:356
	readVariable530Var292 = function (interp, x, direction, x2, y, direction2) {
		return (function (x, direction, x2, y, direction2) {
		var characterId = 3;//$gameVariables.value(530);
		var characterId = $gameVariables.value(292)[characterId];
		character = interp.character(characterId);
		character.locate(x, 14);
		character.setDirection(direction);
		var characterId = 4;//$gameVariables.value(530);
		var characterId = $gameVariables.value(292)[characterId];
		character = interp.character(characterId);
		character.locate(x2, y);
		character.setDirection(direction2);
		}).call(interp, x, direction, x2, y, direction2);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:356
	speakCharacterOneLinerVar530And292 = function (interp, variableId, pictureId) {
		var messageText2 = `ガサゴソ──`;
		return (function (variableId, pictureId) {
		var variableId2 = variableId;//$gameVariables.value(530);
		interp._eventId = $gameVariables.value(292)[variableId2];
		var randomXOffsets = [0];
		var randomYOffsets = [-10];
		var lineCandidates = [`${messageText2}`];
		chara_oneWord(pictureId,interp._eventId,25,180,randomXOffsets,randomYOffsets,lineCandidates);
		}).call(interp, variableId, pictureId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:356
	movePartyCharacterVar530And292 = function () {
		var variable530Value = $gameVariables.value(530);
		var variable530Value = $gameVariables.value(292)[variable530Value];
		event_partyCharaMove(45,"this.moveTowardCharacter($gameMap.event("+variable530Value+"));");
	};

	// Replaces (2x): data/CommonEvents.json:common-event:358, data/CommonEvents.json:common-event:361
	setEventFaceVar292 = function (rangeEnd) {
		for (var slotIndex2 = 12; slotIndex2 <= rangeEnd; slotIndex2++) {
		  var variable292Value = $gameVariables.value(292)[slotIndex2]; //this._eventId
		  if(!!$gameMap.event(variable292Value)) {
		    var event2 = $gameMap.event(variable292Value);
		    event2.setStepAnime(false);event2.setWalkAnime(false);
		    event2.setDirection(2);event2.resetPattern();
		    event2._originalPattern = 1;event2.setAngle(45);
		    event2._spriteOffsetX = -12;event2._spriteOffsetY = -12;
		    event2._kageM.clear();
		    event2.setFace(6,true,true);
		}};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:359, data/CommonEvents.json:common-event:361
	bindInterpreterToValueBossId = function (interp) {
		return (function () {
		interp._eventId = valueBossId;
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:359
	readVariable530Var292_2 = function (variableId, x, y, direction, variableId2, x2, y2, direction2) {
		var eventId2 = variableId;//$gameVariables.value(530);
		var variable292Value = $gameMap.event($gameVariables.value(292)[eventId2]);
		variable292Value.locate(x, y);
		variable292Value.setDirection(direction);
		var eventId2 = variableId2;//$gameVariables.value(530);
		var variable292Value = $gameMap.event($gameVariables.value(292)[eventId2]);
		variable292Value.locate(x2, y2);
		variable292Value.setDirection(direction2);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	configureActorFromVariable20_2 = function (interp) {
		var textPrefix = `　　`;
		var colorCode162 = `\\C[16]`;
		var colorResetCode = `\\C[0]`;
		var textPart2 = `はメインクラス2ndジョブ`;
		var colorCode22 = `\\C[2]`;
		var textPart3 = `＜`;
		var controlCode = `\\j[21]`;
		var textPart4 = `＞`;
		var textSuffix = `に目覚めた！`;
		return (function () {
		interp.sVal(20,1);
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		valueWordSet0 = `${textPrefix}${colorCode162}${variable20Value.name()}${colorResetCode}${textPart2}${colorCode22}${textPart3}${controlCode}${textPart4}${colorResetCode}${textSuffix}`;
		valueWordSetEx = 0;//補足が必要な場合
		interp.setupChild($dataCommonEvents[45].list, 0);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	configureActorFromVariable20_3 = function (interp) {
		var textPrefix = `　　`;
		var colorCode162 = `\\C[16]`;
		var colorResetCode = `\\C[0]`;
		var textPart2 = `はメインクラス2ndジョブ`;
		var colorCode22 = `\\C[2]`;
		var textPart3 = `＜`;
		var controlCode = `\\j[22]`;
		var textPart4 = `＞`;
		var textSuffix = `に目覚めた！`;
		return (function () {
		interp.sVal(20,2);
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		valueWordSet0 = `${textPrefix}${colorCode162}${variable20Value.name()}${colorResetCode}${textPart2}${colorCode22}${textPart3}${controlCode}${textPart4}${colorResetCode}${textSuffix}`;
		valueWordSetEx = 0;//補足が必要な場合
		interp.setupChild($dataCommonEvents[45].list, 0);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	configureActorFromVariable20_4 = function (interp) {
		var textPrefix = `　　`;
		var colorCode162 = `\\C[16]`;
		var colorResetCode = `\\C[0]`;
		var textPart2 = `はメインクラス2ndジョブ`;
		var colorCode22 = `\\C[2]`;
		var textPart3 = `＜`;
		var controlCode = `\\j[23]`;
		var textPart4 = `＞`;
		var textSuffix = `に目覚めた！`;
		return (function () {
		interp.sVal(20,3);
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		valueWordSet0 = `${textPrefix}${colorCode162}${variable20Value.name()}${colorResetCode}${textPart2}${colorCode22}${textPart3}${controlCode}${textPart4}${colorResetCode}${textSuffix}`;
		valueWordSetEx = 0;//補足が必要な場合
		interp.setupChild($dataCommonEvents[45].list, 0);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	configureActorFromVariable20_5 = function (interp) {
		var textPrefix = `　　`;
		var colorCode162 = `\\C[16]`;
		var colorResetCode = `\\C[0]`;
		var textPart2 = `はメインクラス2ndジョブ`;
		var colorCode22 = `\\C[2]`;
		var textPart3 = `＜`;
		var controlCode = `\\j[24]`;
		var textPart4 = `＞`;
		var textSuffix = `に目覚めた！`;
		return (function () {
		interp.sVal(20,4);
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		valueWordSet0 = `${textPrefix}${colorCode162}${variable20Value.name()}${colorResetCode}${textPart2}${colorCode22}${textPart3}${controlCode}${textPart4}${colorResetCode}${textSuffix}`;
		valueWordSetEx = 0;//補足が必要な場合
		interp.setupChild($dataCommonEvents[45].list, 0);
		}).call(interp);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	configureActorFromVariable20_6 = function (interp) {
		var textPrefix = `　　　　　　`;
		var colorCode162 = `\\C[16]`;
		var colorResetCode = `\\C[0]`;
		var textPart2 = `はメインクラス2ndジョブ`;
		var colorCode22 = `\\C[2]`;
		var textPart3 = `＜`;
		var controlCode = `\\j[25]`;
		var textPart4 = `＞`;
		var textSuffix = `に目覚めた！`;
		return (function () {
		interp.sVal(20,5);
		var variable20Value = $gameActors.actor($gameVariables.value(20));
		valueWordSet0 = `${textPrefix}${colorCode162}${variable20Value.name()}${colorResetCode}${textPart2}${colorCode22}${textPart3}${controlCode}${textPart4}${colorResetCode}${textSuffix}`;
		valueWordSetEx = 0;//補足が必要な場合
		interp.setupChild($dataCommonEvents[45].list, 0);
		}).call(interp);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:409, data/CommonEvents.json:common-event:412, data/CommonEvents.json:common-event:414, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, …
	selectMapMusicAndSelectMapParallax = function () {
		setMap_musicSelect(1,22,0);//種別,id,0屋内1屋外
		setMap_parallaxSelect(1,22,1);
		backGraund_menuMapSelect(2,0,0,0);//右6,70表示の場合
	};

	// Replaces (4x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548
	moveNpcCharacterByIdVar292_4 = function () {
		var eventIds2 = [];
		eventIds2.push($gameVariables.value(292)[1]);
		eventIds2.push($gameVariables.value(292)[11]);
		event_NpcCharaMoveId(16,0,eventIds2);
		//1下移動16下向く39透明化
		//event_partyCharaMove(45,"this.turnTowardCharacter($gameMap.event("+value1+"));");
		//event_partyCharaMove(45,"UP: 10;"); //"UP: 10;"
		//event_partyCharaMove(45,"this.requestBalloon(1);");
		//event_partyCharaMove(45,"this.requestAnimation(617);");
	};

	// Replaces (6x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:386, data/CommonEvents.json:common-event:387, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548
	setSwitch161 = function () {
		var constantValue = 1000000;
		if($gameParty.gold() >= constantValue){
		  $gameSwitches.setValue(161,true);
		} else {
		  $gameSwitches.setValue(161,false);
		};
	};

	// Replaces (9x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:412, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:507, data/CommonEvents.json:common-event:526, data/CommonEvents.json:common-event:532, …
	setPictureLocationAndBlessStandingPicture = function (picIndex, picIndex2, pictureId, blessType) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		pic_locationSet(pictureId2-pictureId,pictureId2,pictureName2,60,1);
		tachie_bless(pictureId2,blessType);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:412, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548
	blessStandingPictureAndPlayHcgPiston = function () {
		var pictureId2 = valuePic2+1;
		var pictureName2 = valueScenePic+'01';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640+480+50,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640+480,384,100,100,255,0,60);
		tachie_bless(pictureId2,1);
		var pictureId2 = valuePic1+1;
		var pictureName2 = valueScenePic+'02';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384-20,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		hcg_piston(pictureId2,5,1,2);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:412, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548, data/CommonEvents.json:common-event:573
	fadePicture1AndBlessStandingPicture = function () {
		var pictureName2 = 'Screen1024Frame';//1024ﾋﾟｸ表示の際のフレーム枠、,id70
		$gameScreen.showPicture(valuePic2,pictureName2,1,640-78,384,100,100,255,0);
		picture_fade1(valuePic2,"fadeIn",valueWipeImg,60,5);
		tachie_bless(value1,5);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548
	setHTextWord = function () {
		var newValue2 = [];
		htext_word(3);//3高2中1低
		newValue2 = newValue2.concat(valueHtextWord);
		//var arr1 = ['（ドキっ）','（ドキドキ）','（ドクン）','ドキッ'];//文字BGV
		//var arr1 = ['「アッ\\I[12]」','「ンッ\\I[12]」','「ンン…\\I[12]」','「ンクっ…\\I[12]」','「ァンっ…\\I[12]」'];//文字BGV
		//var arr1 = ['「………ァっ」','「いや…」','「ンン──……」','「ンクっ…」','「ァンっ…」'];//文字BGV
		$gameVariables.setValue(707,newValue2);
		$gameVariables.setValue(706,[640-128,386,1,60,0,'eromangasimaji']);
		$gameSwitches.setValue(125,true);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548
	playHcgPistonSwitch429 = function () {
		var pictureId2 = valuePic1+2;
		var pictureName2 = valueScenePic+'02';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640,384,100,100,255,0);
		pic_setArray1 = [1,pictureId2,0,-30,0,20];
		pic_setArray2 = [1,pictureId2,0,0,3,30]; //pic_setArray2 = [1,0,0,0,0,0];
		valueParallelPicSe1 = ['ZH_sticky4',20,60];
		valueParallelPicSe2 = ['ZH_sticky4',20,60];
		hcg_piston(pictureId2,7,2,1);
		$gameSwitches.setValue(429,true);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:410, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548, data/CommonEvents.json:common-event:571, …
	setupChildInterpreter9 = function (interp) {
		return (function () {
		//this.setupChild($dataCommonEvents[18].list, 0);
		interp.setupChild($dataCommonEvents[19].list, 0);
		}).call(interp);
	};

	// Replaces (11x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:410, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:548, …
	setStandingPictureActionZ_ClothesTakeOff = function (expressionCode, targetPicId, sourcePicId, showCostumeId) {
		tachie_dousa(0,1,expressionCode,targetPicId,sourcePicId,showCostumeId,120,0,0);
		var se2 = 'Z_ClothesTakeOff';//ピッチ50か100。消去ウェイトで変更
		AudioManager.playSe({"name":se2,"volume":150,"pitch":100,"pan":0});
		//tachie_clothReflect(1);//ｱｸﾀｰid
	};

	// Replaces (6x): data/CommonEvents.json:common-event:368, data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548, data/Map041.json:map-event:7:page:1, data/Map083.json:map-event:6:page:1
	setupChildInterpreter10 = function (interp, newValue) {
		var controlCode = `\\v[23]`;
		return (function (newValue) {
		interp.sVal(23,newValue);
		interp.sVal(172,19);//中央に一言メッセージ,何行でも良し
		var templateText = `${controlCode}`;
		valueTalkSet = [1,28,templateText,100];//0で消去 1で通常 2で時間経過  255で背景透明度
		interp.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp, newValue);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:370, data/CommonEvents.json:common-event:371, data/CommonEvents.json:common-event:383, data/CommonEvents.json:common-event:384
	setSelfVariable530 = function (interp) {
		return (function () {
		interp.sVal(530,1);//主格キャラ
		}).call(interp);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:370, data/CommonEvents.json:common-event:371, data/CommonEvents.json:common-event:372, data/CommonEvents.json:common-event:373, data/CommonEvents.json:common-event:383, data/CommonEvents.json:common-event:384
	showHExperienceTable1 = function (requestedPartnerWeaponId) {
		h_keikenhyouji1(521,requestedPartnerWeaponId);//記録変数,相手ID
	};

	// Replaces (2x): data/CommonEvents.json:common-event:371, data/CommonEvents.json:common-event:372
	setupChildInterpreter11 = function (interp, countValue) {
		var messageText2 = `デイリークエスト`;
		return (function (countValue) {
		var constantValue = 800;valueCountSet1 = countValue;
		if($dataItems[valueCountSet1].meta['SGカテゴリ']){
		  if($dataItems[valueCountSet1].meta['SGカテゴリ'] == `${messageText2}`){
		    var constantValue = 900;
		  } else {
		    var constantValue = 800;
		  };
		};
		var templateText = `\x1bIIN[${valueCountSet1}]\n${valueQuestArray4[valueCountSet1-constantValue]}`;
		interp.sVal(172,10);
		valueTalkSet = [24,templateText,1];
		interp.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp, countValue);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:383, data/CommonEvents.json:common-event:384, data/CommonEvents.json:common-event:528
	setupRespawnEnemyAVar292And530 = function (interp, posX, posX2) {
		return (function (posX, posX2) {
		interp.sVal(530,1);//主格キャラ
		$gameVariables.setValue(292,Array(21).fill(0));
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value,posX,5,1,8);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value._spriteOffsetX = -24;
		var variable530Value = 5;//$gameVariables.value(530);
		event_respawnSetA(variable530Value,posX2,5,1,8);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value._spriteOffsetX = -24;
		}).call(interp, posX, posX2);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:389, data/CommonEvents.json:common-event:507, data/CommonEvents.json:common-event:508, data/CommonEvents.json:common-event:509
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc4 = function (interp) {
		return (function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value,12,10,1,4);
		interp._eventId = $gameVariables.value(292)[variable530Value];
		var variable530Value = 11;
		event_respawnSetN(variable530Value,13,10,0,'npcUnique1',0,4);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:389, data/CommonEvents.json:common-event:509
	readVariable530Var292_3 = function () {
		var variable530Value = $gameVariables.value(530);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.locate(18, 10);
		variable292Value.setDirection(8);
		variable292Value._spriteOffsetY = -12;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:389, data/CommonEvents.json:common-event:509
	showScenePictureAndFadeIn4 = function () {
		var pictureId2 = valuePic1+3;
		var pictureName2 = valueScenePic+'03';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		var pictureId2 = valuePic1+4;
		var pictureName2 = valueScenePic+'04';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		//pic_move1(value1-1,0,0,100,100,0,90);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:389, data/CommonEvents.json:common-event:509
	playHcgPiston = function () {
		var pictureId2 = valuePic1+4;
		hcg_piston(pictureId2,7,1,1);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:389, data/CommonEvents.json:common-event:509
	movePicture1AndPlayHcgPiston = function (picIndex, picIndex2, breathPresetId) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		pic_move1(pictureId2-1,0,0,100,100,0,90);
		hcg_piston(pictureId2,6,breathPresetId,1);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:390, data/CommonEvents.json:common-event:391, data/CommonEvents.json:common-event:393, data/CommonEvents.json:common-event:399, data/CommonEvents.json:common-event:530
	setMapSelfSwitch4 = function (key, key2) {
		$gameSelfSwitches.setValue([$gameMap.mapId(), key, 'C'], true);
		$gameSelfSwitches.setValue([$gameMap.mapId(), key2, 'C'], true);
	};

	// Replaces (8x): data/CommonEvents.json:common-event:391, data/CommonEvents.json:common-event:393, data/CommonEvents.json:common-event:399, data/CommonEvents.json:common-event:546, …
	showScenePictureAndFadeIn5 = function (picIndex, picIndex2) {
		valuePic1 = 51;
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		//tachie_bless(value1,2);
		//pic_move1(value1-1,0,0,100,100,0,90);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:391, data/CommonEvents.json:common-event:393, data/CommonEvents.json:common-event:399, data/CommonEvents.json:common-event:531, data/CommonEvents.json:common-event:573, …
	playHcgPistonAndMovePicture1 = function (picIndex, picIndex2, breathTypeId) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		hcg_piston(pictureId2,breathTypeId,1,1);
		pic_move1(pictureId2-1,0,0,100,100,0,90);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:391, data/CommonEvents.json:common-event:393, data/CommonEvents.json:common-event:399
	playHcgPiston2 = function () {
		var pictureId2 = valuePic1+12;
		var pictureName2 = valueScenePic+'12';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,200,0);
		hcg_piston(pictureId2,7,1,2);
		//pic_move1(value1-1,0,0,100,100,0,90);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:391, data/CommonEvents.json:common-event:393, data/CommonEvents.json:common-event:399, data/CommonEvents.json:common-event:530, data/CommonEvents.json:common-event:531, data/CommonEvents.json:common-event:572, …
	movePicture1_4 = function (picIndex, scaleX, scaleY) {
		var pictureId2 = valuePic1+picIndex;
		pic_move1(pictureId2,0,0,scaleX,scaleY,0,90);
	};

	// Replaces (9x): data/CommonEvents.json:common-event:391, data/CommonEvents.json:common-event:393, data/CommonEvents.json:common-event:399, data/CommonEvents.json:common-event:526, data/CommonEvents.json:common-event:531, data/CommonEvents.json:common-event:545, …
	blessStandingPictureAndMovePicture1 = function (picIndex, picIndex2, blessType) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId2,blessType);
		pic_move1(pictureId2-1,0,0,100,100,0,90);
	};

	// Replaces (7x): data/CommonEvents.json:common-event:392, data/Map003.json:map-event:181:page:1, data/Map003.json:map-event:218:page:2, data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:25:page:1, data/Map018.json:map-event:39:page:1, …
	temporarilySaveNpc = function () {
		Npc_TemporarilySave(0,1);//終了処理
	};

	// Replaces (3x): data/CommonEvents.json:common-event:393, data/CommonEvents.json:common-event:399, data/CommonEvents.json:common-event:547
	setVariable318 = function (variableId) {
		var newValue2 = $gameVariables.value(variableId);//文字HBGV
		$gameVariables.setValue(318,newValue2);
		$gameVariables.setValue(706,[640-128,386,1,80,0,'eromangasimaji']);
		$gameSwitches.setValue(119,true);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:401
	setupRespawnEnemyAVar292 = function (numericValue, posX, zoomFlag, direction) {
		var charaSlotId = numericValue;
		event_respawnSetA(charaSlotId,posX,34,zoomFlag);
		var variable292Value = $gameMap.event($gameVariables.value(292)[charaSlotId]);
		variable292Value.setDirection(direction);
	};

	// Replaces (8x): data/CommonEvents.json:common-event:401, data/CommonEvents.json:common-event:414, data/CommonEvents.json:common-event:444, …
	setMessageRowCount = function (rowCount) {
		$gameMessage.setMessageRow(rowCount);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:406, data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519
	selectMapParallaxAndSelectMenuMapBackground = function () {
		//setMap_musicSelect(0,21,0);
		setMap_parallaxSelect(0,21,0);
		backGraund_menuMapSelect(2,'Dungeon1_2',0,0);//
	};

	// Replaces (7x): data/CommonEvents.json:common-event:406, data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516, data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519, …
	setValuePic1 = function () {
		valuePic1 = 51;
	};

	// Replaces (6x): data/CommonEvents.json:common-event:406, data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516, data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519
	fadePicture1FadeIn_2 = function (opacity) {
		var pictureId2 = valuePic1;
		var pictureName2 = valueScenePic+'00';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,opacity,0);
		picture_fade1(valuePic1,"fadeIn",valueWipeImg,60,5);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:410
	selectMenuMapBackground = function (mapName) {
		backGraund_menuMapSelect(2,mapName,0,0);//右6,70表示の場合
	};

	// Replaces (3x): data/CommonEvents.json:common-event:410, data/CommonEvents.json:common-event:546, data/CommonEvents.json:common-event:547
	blessStandingPicture = function (picIndex, picIndex2, opacity) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,opacity,0);
		tachie_bless(pictureId2,2);
		//pic_move1(value1-1,0,0,100,100,0,90);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:414, data/CommonEvents.json:common-event:451
	startStandingPictureDialogue2 = function (numericValue) {
		tachie_kaiwastart(false,true,numericValue,1);
		//急ぎ,拡大,右人数,左人数
	};

	// Replaces (2x): data/CommonEvents.json:common-event:430, data/CommonEvents.json:common-event:432
	setupRespawnEnemyAVar530And163Etc4 = function (interp) {
		return (function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value,8,7,1);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setImage(variable163Value[1], variable163Value[2]);
		variable292Value.setDirection(6);
		interp._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:431
	showPopupMessage2Var292_3 = function (numericValue, numericValue2, numericValue3) {
		var eventId2 = numericValue;
		var variable292Value = $gameMap.event($gameVariables.value(292)[eventId2]);
		variable292Value.requestBalloon(numericValue2);
		var eventId2 = $gameVariables.value(292)[eventId2];
		message_popup2(eventId2,0,numericValue3,1);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:441, data/CommonEvents.json:common-event:552
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc5 = function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value,15,4,0);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setImage(variable163Value[1], variable163Value[2]);
		variable292Value.setDirection(6);
		var variable530Value = 11;
		event_respawnSetN(variable530Value,16,4,1,variable163Value[6],variable163Value[7]);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setDirection(2);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:441, data/CommonEvents.json:common-event:442, data/CommonEvents.json:common-event:552
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And292_3 = function (posX, posY, direction, posX2, posY2, imageName, imageIndex, direction2) {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value,posX,posY,1);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setDirection(direction);
		var variable530Value = 11;
		event_respawnSetN(variable530Value,posX2,posY2,0,imageName,imageIndex);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setDirection(direction2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:442
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc6 = function (interp, posX, posY, zoomFlag, posX2, posY2, zoomFlag2) {
		return (function (posX, posY, zoomFlag, posX2, posY2, zoomFlag2) {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value,posX,posY,zoomFlag);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setImage(variable163Value[1], variable163Value[2]);
		variable292Value.setDirection(2);
		interp._eventId = $gameVariables.value(292)[variable530Value];
		var variable530Value = 11;
		event_respawnSetN(variable530Value,posX2,posY2,zoomFlag2,variable163Value[6],variable163Value[7]);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setDirection(2);
		}).call(interp, posX, posY, zoomFlag, posX2, posY2, zoomFlag2);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:442, data/CommonEvents.json:common-event:552
	setBackgroundLine = function (numericValue) {
		$gameSystem.setBgsLine(numericValue);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:451
	readVariable530Var292_4 = function (interp) {
		return (function () {
		var constantValue = 1;//$gameVariables.value(530);
		//event_respawnSetN(value1,16,6,0,'1_1',2);
		interp._eventId = $gameVariables.value(292)[constantValue];
		}).call(interp);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:451, data/Map007.json:map-event:4:page:1
	showPictureFromArgs3 = function (numericValue, textValue, opacity) {
		var pictureId2 = numericValue;
		var pictureName2 = textValue;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640,384,100,100,opacity,0);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:471, data/CommonEvents.json:common-event:541
	setupRespawnEnemyAVar530And292_7 = function (interp, posX, posY, direction) {
		return (function (posX, posY, direction) {
		var charaSlotId = 5;//$gameVariables.value(530);
		event_respawnSetA(charaSlotId,posX,posY,1,direction);
		interp._eventId = $gameVariables.value(292)[charaSlotId];
		}).call(interp, posX, posY, direction);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:471
	setupRespawnEnemyNVar292_7 = function (interp, charaSlotId, posX, zoomFlag, imageIndex, direction, slotIndex) {
		return (function (charaSlotId, posX, zoomFlag, imageIndex, direction, slotIndex) {
		event_respawnSetN(charaSlotId,posX,12,zoomFlag,'npcUnique3',imageIndex,direction);
		interp._eventId = $gameVariables.value(292)[slotIndex];
		}).call(interp, charaSlotId, posX, zoomFlag, imageIndex, direction, slotIndex);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:471
	setupChildInterpreter12 = function (interp, talkPictureId) {
		return (function (talkPictureId) {
		interp.sVal(172,21);
		valueTalkSet = [talkPictureId,250,interp._eventId];//1で付与0で解除,透明度,参照ｲﾍﾞid,valueTalkSet = [0,0,0];
		interp.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp, talkPictureId);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	speakCharacterOneLinerVar292 = function () {
		var messageText2 = `オラァッ！！`;
		var randomXOffsets = [0];
		var randomYOffsets = [-50];
		var lineCandidates = [`${messageText2}`];
		chara_oneWord(100,$gameVariables.value(292)[11],25,120,randomXOffsets,randomYOffsets,lineCandidates,0);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	speakCharacterOneLinerVar292_2 = function () {
		var messageText2 = `ガハッッ！？`;
		var randomXOffsets = [0];
		var randomYOffsets = [-50];
		var lineCandidates = [`${messageText2}`];
		chara_oneWord(100,$gameVariables.value(292)[5],25,120,randomXOffsets,randomYOffsets,lineCandidates,0);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	speakCharacterOneLinerVar292_3 = function () {
		var messageText2 = `フンッ！`;
		var randomXOffsets = [0];
		var randomYOffsets = [-50];
		var lineCandidates = [`${messageText2}`];
		chara_oneWord(100,$gameVariables.value(292)[11],25,180,randomXOffsets,randomYOffsets,lineCandidates,0);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:481
	flashScreen = function () {
		$gameScreen.startFlash([255,119,255,200], 60)
		$gameScreen.startShake(7, 7, 20);
		$gameScreen.startAnimation(640-256, 368, 634, false);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548, data/CommonEvents.json:common-event:572, data/CommonEvents.json:common-event:573
	readVariable530Var292_5 = function (characterIndex) {
		var variable530Value = $gameVariables.value(530);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		variable292Value.setImage('1_1', characterIndex);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548, data/CommonEvents.json:common-event:572
	erasePictureP5 = function () {
		var pictureId2 = valuePic1+7;
		pic_eraseP(0,[pictureId2]);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548
	playAdvHPartDirectAndSetSexDirection = function (interp) {
		return (function () {
		//絶頂射精
		adv_HpartDirectPlay(3);
		sex_direction(12,0,0);
		interp.wait(valueSexWait);
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:495, data/CommonEvents.json:common-event:532, data/CommonEvents.json:common-event:548
	setAdvPartDirectAndSetSexDirection = function (interp) {
		return (function () {
		//ピストン
		adv_partDirectSet(1);//ピストンの時1
		sex_direction(1,0,0);
		interp.wait(valueSexWait);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516
	blessStandingPicture2 = function (blessType) {
		var pictureId2 = valuePic1+1;//非表示状態
		var pictureName2 = valueScenePic+'01';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384+50,100,100,0,0);
		//$gameScreen.movePicture(value1,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId2,blessType);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516, data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519
	blessStandingPicture3 = function (picIndex, picIndex2, y) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384+y,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId2,2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:496
	blessStandingPicture4 = function () {
		var pictureId2 = valuePic1+10;
		var pictureName2 = valueScenePic+'21';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128+50,384,100,100,0,0);
		//$gameScreen.movePicture(value1,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId2,2);
	};

	// Replaces (12x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516, data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519, …
	blessStandingPictureAndMovePicture1_2 = function (picIndex, picIndex2, scaleX, scaleY, duration, blessType, pictureId, waitFrames) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,scaleX,scaleY,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,duration);
		tachie_bless(pictureId2,blessType);
		pic_move1(valuePic1+pictureId,0,0,100,100,0,waitFrames);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516
	moveScenePictureAndFadeIn = function () {
		var pictureId2 = valuePic1+1;//非表示状態
		var pictureName2 = valueScenePic+'01';
		//$gameScreen.showPicture(value1,value2,1,640-128,384+50,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:507, data/CommonEvents.json:common-event:508, data/CommonEvents.json:common-event:509, data/CommonEvents.json:common-event:541
	showScenePictureAndFadeIn6 = function (picIndex, picIndex2, scaleY, opacity) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,scaleY,opacity,0);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:508
	movePicture1AndBlessStandingPicture = function (picIndex, picIndex2) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		pic_move1(pictureId2-1,0,0,100,100,0,90);
		tachie_bless(pictureId2,2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
	moveNpcCharacterByIdVar292_5 = function () {
		var eventIds2 = [];
		eventIds2.push($gameVariables.value(292)[1]);
		eventIds2.push($gameVariables.value(292)[12]);
		event_NpcCharaMoveId(16,0,eventIds2); 
		event_NpcCharaMoveId(45,"this.requestBalloon(1);",eventIds2);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
	setEventFace = function (interp, argument1) {
		return (function (argument1) {
		var event2 = $gameMap.event(interp._eventId);
		event2.setFace(argument1,true,true);
		}).call(interp, argument1);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
	clearEventFace = function (interp) {
		return (function () {
		var event2 = $gameMap.event(interp._eventId);
		event2.removeFace();
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
	readVariable530Var292_6 = function () {
		var eventId2 = 11;//$gameVariables.value(530);
		var variable292Value = $gameMap.event($gameVariables.value(292)[eventId2]);
		variable292Value.locate(34, 20);variable292Value.setDirection(2);
		var eventId2 = $gameVariables.value(530);
		var variable292Value = $gameMap.event($gameVariables.value(292)[eventId2]);
		variable292Value.locate(34, 19);variable292Value.setDirection(2);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:511, data/CommonEvents.json:common-event:552, data/Map094.json:map-event:45:page:1
	zoomCameraVar530And292_2 = function (interp) {
		return (function () {
		var variable530Value = $gameVariables.value(530);
		interp._eventId = $gameVariables.value(292)[variable530Value];
		drowsepost.camera.zoom(1, 60, interp._eventId);
		}).call(interp);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:516, data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519, data/CommonEvents.json:common-event:526
	showHExperienceTable1_2 = function (interp, scenePicName, newValue, requestedPartnerWeaponId) {
		return (function (scenePicName, newValue, requestedPartnerWeaponId) {
		valueScenePic = scenePicName;
		//var value2 = valueScenePic+'01';
		interp.sVal(530,1);//主格キャラ
		interp.sVal(535,newValue);//挿話回想の場合アイテムID。メインは0
		h_keikenhyouji1(521,requestedPartnerWeaponId);//記録変数,相手ID,名前id21に名前と役職名
		valueWeatherSceneSet = 0;
		}).call(interp, scenePicName, newValue, requestedPartnerWeaponId);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:516, data/CommonEvents.json:common-event:526
	selectMapParallax = function (parallaxName) {
		//setMap_musicSelect(0,21,0);
		setMap_parallaxSelect(0,parallaxName,0);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:516, data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519
	selectMenuMapBackgroundDungeon1_2 = function () {
		backGraund_menuMapSelect(2,'Dungeon1_2',0,0);//
	};

	// Replaces (6x): data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519
	setValueScenePic = function (scenePicName) {
		valueScenePic = scenePicName;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519
	blessStandingPicture5 = function () {
		var pictureId2 = valuePic1+10;
		var pictureName2 = valueScenePic+'21';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128+50,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId2,2);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519
	blessStandingPictureAndPlayPictureSe1 = function () {
		var pictureId2 = valuePic1+2;
		var pictureName2 = valueScenePic+'02';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,300,300,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId2,2);
		picture_se1();
	};

	// Replaces (3x): data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519
	setSexDirectionAndSetAdvPartDirect = function (interp, actionType) {
		return (function (actionType) {
		sex_direction(actionType,0,0);
		interp.wait(valueSexWait);
		adv_partDirectSet(1);//ピストンの時
		}).call(interp, actionType);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:517, data/CommonEvents.json:common-event:518, data/CommonEvents.json:common-event:519
	fadePicture1Pic75 = function () {
		$gameScreen.showPicture(75,'ScreenBlackOut',1,640,384,100,100,150,0);
		picture_fade1(75,"fadeIn",valueWipeImg,60,5);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:526, data/CommonEvents.json:common-event:530, data/Map083.json:map-event:6:page:1
	fadePicture1ScreenBlackOut_3 = function (pictureId, opacity, fadePicId) {
		var pictureName2 = 'ScreenBlackOut';
		$gameScreen.showPicture(pictureId,pictureName2,1,640,384,100,100,opacity,0);
		picture_fade1(fadePicId,"fadeIn",valueWipeImg,60,5);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:526, data/CommonEvents.json:common-event:576
	blessStandingPicture6 = function (picIndex, picIndex2, opacity) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,opacity,0);
		tachie_bless(pictureId2,2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:530
	setupChildInterpreter13 = function (interp, talkPictureId) {
		return (function (talkPictureId) {
		interp.sVal(172,16);
		valueTalkSet = [talkPictureId,1,60];//1で付与2で直接表示\CE[60]のみ0で解除,ｱｸﾀｰid,ﾌﾚｰﾑ60,40,20
		interp.setupChild($dataCommonEvents[60].list, 0)
		}).call(interp, talkPictureId);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:530, data/CommonEvents.json:common-event:531, data/CommonEvents.json:common-event:536
	blessStandingPicture7 = function (picIndex, picIndex2) {
		valuePic1 = 51;
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId2,2);
		//pic_move1(value1-1,0,0,100,100,0,90);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:530
	showScenePictureAndFadeIn7 = function () {
		var pictureId2 = 50;
		var pictureName2 = valueScenePic+'02';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		//pic_move1(value1-1,0,0,100,100,0,90);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:530, data/CommonEvents.json:common-event:531, data/CommonEvents.json:common-event:573
	playHcgPiston3 = function (picIndex, picIndex2, breathTypeId, breathPresetId, breathLayerId) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		hcg_piston(pictureId2,breathTypeId,breathPresetId,breathLayerId);
		//pic_move1(value1-1,0,0,100,100,0,90);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:530, data/Map081.json:map-event:3:page:1, data/Map083.json:map-event:6:page:1
	setupChildInterpreter14 = function (interp) {
		return (function () {
		interp.sVal(14,22);//パーティ再結成コモン
		interp.setupChild($dataCommonEvents[64].list, 0);
		}).call(interp);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:531, data/CommonEvents.json:common-event:546
	blessStandingPictureAndMovePicture1_3 = function (picIndex, picIndex2) {
		valuePic1 = 51;
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId2,2);
		pic_move1(pictureId2-1,0,0,100,100,0,90);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
	setupRespawnEnemyNNpc = function (charaSlotId, posX, posY, direction, charaSlotId2, posX2, posY2, direction2, charaSlotId3, posX3, posY3, direction3) {
		var imageName2 = getRandomIndex(6) + 1;
		var imageIndex2 = getRandomIndex(7); 
		event_respawnSetN(charaSlotId,posX,posY,0,'npc'+imageName2,imageIndex2,direction);
		var imageName2 = getRandomIndex(6) + 1;
		var imageIndex2 = getRandomIndex(7); 
		event_respawnSetN(charaSlotId2,posX2,posY2,0,'npc'+imageName2,imageIndex2,direction2);
		var imageName2 = getRandomIndex(6) + 1;
		var imageIndex2 = getRandomIndex(7); 
		event_respawnSetN(charaSlotId3,posX3,posY3,0,'npc'+imageName2,imageIndex2,direction3);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
	readVariable292_3 = function () {
		for (var slotIndex2 = 12; slotIndex2 <= 17; slotIndex2++) {
		  var variable292Value = $gameVariables.value(292)[slotIndex2]; //this._eventId
		  if(!!$gameMap.event(variable292Value)) {
		    var event2 = $gameMap.event(variable292Value);
		    event2.setTransparent(true);
		}};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
	respawnGoodsEvent = function (numericValue, numericValue2) {
		var goodsEventId = 18;
		goodsEvent_respawn(goodsEventId,'food_2',4,2,0,numericValue,numericValue2);
		var variable292Value = $gameMap.event($gameVariables.value(292)[goodsEventId]);
		variable292Value._priorityType = 2;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:537
	showAndMovePicture1AndBlessStandingPicture = function (picIndex, pictureName) {
		var pictureId2 = valuePic1+picIndex;
		pic_showMove1(pictureId2,valueScenePic+pictureName,640-128,384,100,60,2,200);
		tachie_bless(pictureId2,2);
		pic_move1(pictureId2-1,0,0,100,100,0,90);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:541, data/CommonEvents.json:common-event:543
	blessStandingPicture8 = function (picIndex, picIndex2) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId2,2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:541, data/CommonEvents.json:common-event:543
	playHcgPistonSwitch429_2 = function (picIndex, picIndex2, numericValue, pictureId) {
		pic_setArray1 = [1,valuePic1+picIndex,0,-15,0,20];
		pic_setArray2 = [1,valuePic1+picIndex2,0,0,3,30]; //pic_setArray2 = [1,0,0,0,0,0];
		valueParallelPicSe1 = ['ZH_sticky4',numericValue,10];
		valueParallelPicSe2 = [0,0,0];
		hcg_piston(valuePic1+pictureId,7,2,1);
		$gameSwitches.setValue(429,true);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:542
	blessStandingPictureAndMovePicture1_4 = function (picIndex, picIndex2) {
		var pictureId2 = valuePic2+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640+480,384-118,100,100,200,0);
		$gameScreen.movePicture(pictureId2,1,640+480,384+50,100,100,255,0,240);
		tachie_bless(pictureId2,2);
		pic_move1(pictureId2-1,0,0,100,100,0,90);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:543, data/CommonEvents.json:common-event:572, data/CommonEvents.json:common-event:573
	startPictureAnimationFrame2 = function (picIndex) {
		var pictureId2 = valuePic1+picIndex;
		if($gameScreen.picture(pictureId2)){
		  $gameScreen.picture(pictureId2).startAnimationFrame(1, true, [1,1,1,2]);
		};
	};

	// Replaces (2x): data/CommonEvents.json:common-event:543, data/CommonEvents.json:common-event:546
	setEventFaceVar530And292 = function () {
		var variable530Value = $gameVariables.value(530);
		var variable292Value = $gameMap.event($gameVariables.value(292)[variable530Value]);
		//var event = $gameMap.event(this._eventId);
		variable292Value.setFace(11,true,true);
		variable292Value.setStepAnime(false);
		variable292Value.setWalkAnime(false);
		variable292Value.setDirection(2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:544, data/CommonEvents.json:common-event:545
	spawnMapEventVar163And535 = function () {
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		$gameMap.spawnEvent(236,variable163Value[8], variable163Value[9], true)
	};

	// Replaces (2x): data/CommonEvents.json:common-event:544
	blessStandingPicture9 = function (picIndex, picIndex2) {
		var pictureId2 = valuePic2+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640+480+50,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640+480,384,100,100,255,0,60);
		tachie_bless(pictureId2,2);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:546
	movePicture1_5 = function (picIndex, picIndex2) {
		valuePic1 = 51;
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		//tachie_bless(value1,2);
		pic_move1(pictureId2-1,0,0,100,100,0,90);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:547
	showScenePictureAndFadeIn8 = function (picIndex, picIndex2) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		//tachie_bless(value1,2);
		//pic_move1(value1-1,0,0,100,100,0,90);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:547, data/CommonEvents.json:common-event:572, data/CommonEvents.json:common-event:576
	blessStandingPicture10 = function (picIndex, picIndex2, blessType) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId2,blessType);
		//pic_move1(value1-1,0,0,100,100,0,90);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:552
	bindInterpreterToEventIdVar292 = function (interp, argument1) {
		return (function (argument1) {
		interp._eventId = argument1;//$gameVariables.value(292)[value1];
		}).call(interp, argument1);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:571, data/CommonEvents.json:common-event:572, data/CommonEvents.json:common-event:573
	setupRespawnEnemyAAndSetupRespawnEnemyNVar530And163Etc7 = function (interp) {
		return (function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value,10,11,1,4);
		interp._eventId = $gameVariables.value(292)[variable530Value];
		var variable530Value = 11;
		event_respawnSetN(variable530Value,variable163Value[8],variable163Value[9],0,variable163Value[6],variable163Value[7],6);
		}).call(interp);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:571, data/CommonEvents.json:common-event:573
	blessStandingPicture11 = function (picIndex, picIndex2, y, blessType) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384-y,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId2,blessType);
		//pic_move1(value1-1,0,0,100,100,0,90);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:572
	playParallelPictureSeSwitch429 = function (numericValue, numericValue2) {
		var pictureId2 = valuePic1+7;
		pic_setArray1 = [1,pictureId2,0,-30,5,numericValue];
		pic_setArray2 = [1,pictureId2,0,30,3,numericValue2]; //pic_setArray2 = [1,0,0,0,0,0];
		valueParallelPicSe1 = [0,0,0];
		valueParallelPicSe2 = [0,0,0];
		$gameSwitches.setValue(429,true);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:572, data/CommonEvents.json:common-event:573
	playHcgPiston4 = function (picIndex, picIndex2, breathTypeId, breathPresetId) {
		var pictureId2 = valuePic1+picIndex;
		var pictureName2 = valueScenePic+picIndex2;
		$gameScreen.showPicture(pictureId2,pictureName2,1,640-128,384+50,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640-128,384,100,100,255,0,60);
		hcg_piston(pictureId2,breathTypeId,breathPresetId,1);
		//pic_move1(value1-1,0,0,100,100,0,90);
	};

	// Replaces (1x): data/Map003.json:map-event:3:page:1
	configurePictureEasing3 = function () {
		var easingValue = 'easeOutQuad';
		//var value1 = 'easeInQuad';//無難すぎ？
		picture_easingConfiguration(easingValue);
	};

	// Replaces (1x): data/Map003.json:map-event:3:page:1
	setVariable537 = function () {
		$gameVariables.setValue(537,[]);//エネミー
		$gameVariables.setValue(538,[]);//Hエネミー
	};

	// Replaces (1x): data/Map003.json:map-event:3:page:2
	removeStateFromListActorsActor20 = function () {
		var actor3 = $gameActors.actor(20);
		for (var loopIndex = 1; loopIndex <= $dataStates.length-1; loopIndex++) {
		  if(actor3.isStateAffected(loopIndex)){
		    actor3.removeState(loopIndex);
		  };
		};
	};

	// Replaces (4x): data/Map003.json:map-event:3:page:2, data/Map093.json:map-event:2:page:1, data/Map093.json:map-event:2:page:2
	fadeInScreen = function (duration) {
		$gameScreen.startFadeIn(duration);
	};

	// Replaces (2x): data/Map003.json:map-event:3:page:2, data/Map003.json:map-event:16:page:1
	refreshMinimapCache = function () {
		$gameMap.refreshMinimapCache();
	};

	// Replaces (4x): data/Map003.json:map-event:6:page:1, data/Map003.json:map-event:8:page:1, data/Map003.json:map-event:107:page:1, data/Map003.json:map-event:182:page:1
	fadeOutScreen = function (interp) {
		return (function () {
		$gameScreen.startFadeOut(30);
		interp.wait(30);
		}).call(interp);
	};

	// Replaces (3x): data/Map003.json:map-event:7:page:1, data/Map046.json:map-event:9:page:1, data/Map197.json:map-event:6:page:1
	setMapSelfSwitch5 = function (interp, itemId, itemId2) {
		return (function (itemId, itemId2) {
		if($gameParty.hasItem($dataItems[itemId],true) || $gameParty.hasItem($dataItems[itemId2],true)){
		  $gameSelfSwitches.setValue([$gameMap.mapId(), interp._eventId, 'B'], false);
		} else {
		  $gameSelfSwitches.setValue([$gameMap.mapId(), interp._eventId, 'B'], true);
		};
		}).call(interp, itemId, itemId2);
	};

	// Replaces (5x): data/Map003.json:map-event:16:page:1, data/Map003.json:map-event:16:page:2, data/Map003.json:map-event:16:page:3, data/Map003.json:map-event:17:page:1, data/Map003.json:map-event:17:page:3
	storeValueEnemyEventIdFromEvent = function (interp) {
		return (function () {
		valueEnemyEventId = interp.eventId();
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:19:page:1
	setVariable22 = function (numericValue) {
		$gameVariables.setValue(22,0);
		var newValue2 = numericValue;
		$gameVariables.setValue(23,newValue2);
	};

	// Replaces (2x): data/Map003.json:map-event:20:page:1, data/Map003.json:map-event:133:page:2
	storeValueCountSet9FromInterpreter = function (interp) {
		return (function () {
		valueCountSet9 = interp._eventId;
		interp._eventId = $gameVariables.value(292)[0];
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:20:page:1, data/Map003.json:map-event:133:page:2
	clearScreenParticle = function (interp, argument1) {
		return (function (argument1) {
		var eventId2 = argument1+'-'+interp._eventId;
		$gameScreen._particle.particleClear(eventId2);
		}).call(interp, argument1);
	};

	// Replaces (1x): data/Map003.json:map-event:44:page:1
	addPopupOnomatopoeia1 = function (interp) {
		var messageText2 = `text:ﾋﾟｲｲｲ──…`;
		return (function () {
		interp.addPopup(["add",`${messageText2}`]);
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:62:page:1, data/Map003.json:map-event:63:page:1
	addPopupOnomatopoeia2 = function (interp) {
		var messageText2 = `text:ホゥ…`;
		return (function () {
		interp.addPopup(["add",`${messageText2}`]);
		}).call(interp);
	};

	// Replaces (1x): data/Map003.json:map-event:64:page:1
	addPopupOnomatopoeia3 = function (interp) {
		var messageText2 = `text:ペンっ`;
		return (function () {
		interp.addPopup(["add",`${messageText2}`]);
		}).call(interp);
	};

	// Replaces (4x): data/Map003.json:map-event:57:page:1, data/Map003.json:map-event:58:page:1, data/Map003.json:map-event:59:page:1, data/Map126.json:map-event:4:page:1
	selectAnimalAction = function (interp) {
		return (function () {
		valueanimalEvent2Id = 0;
		animal_ActionSelect(interp._eventId);
		if(valueanimalEvent2Id != 0){
		  interp.addPopup(["add",`text:${valueanimalEvent2Id}`]);
		} else {
		  interp.wait(30);
		};
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:81:page:1, data/Map003.json:map-event:82:page:1
	setSelfVariable24 = function (interp) {
		return (function () {
		if($gameVariables.value(23) == 6){interp.sVal(24,128)};
		if($gameVariables.value(23) == 7){interp.sVal(24,127)};
		if($gameVariables.value(23) == 8){interp.sVal(24,126)};
		if($gameVariables.value(23) == 9){interp.sVal(24,125)};
		if($gameVariables.value(23) >= 10){interp.sVal(24,124)};
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:133:page:2
	enableSwitchVar327 = function (switchId) {
		var constantValue = 0;
		for (var slotIndex2 = 1; slotIndex2 <= 100; slotIndex2++) {
		  if($gameVariables.value(327)[slotIndex2] >= 1){
		    constantValue += 1;
		}};
		if(constantValue >= 2){
		  $gameSwitches.setValue(switchId,true);
		};
	};

	// Replaces (2x): data/Map003.json:map-event:133:page:2
	readVariable327 = function (numericValue, switchId, switchId2, numericValue2, switchId3, switchId4) {
		if($gameVariables.value(327)[numericValue] >= 1){
		  $gameSwitches.setValue(switchId,true);
		} else {
		  $gameSwitches.setValue(switchId2,false);
		};
		if($gameVariables.value(327)[numericValue2] >= 1){
		  $gameSwitches.setValue(switchId3,true);
		} else {
		  $gameSwitches.setValue(switchId4,false);
		};
	};

	// Replaces (3x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1, data/Map003.json:map-event:142:page:1
	cycleSelfSwitchVariable = function (interp) {
		return (function () {
		$gameSelfSwitches.setVariableValue([$gameMap.mapId(), 
		interp._eventId, 10], 10);
		}).call(interp);
	};

	// Replaces (4x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	readVariable69 = function () {
		var textPrefix = `Coin: `;
		var textSuffix = `枚`;
		var variable69Value = `${textPrefix}${$gameVariables.value(69).toLocaleString()}${textSuffix}`;
		var constantValue = 28;
		$gameScreen.setDTextPicture(variable69Value, constantValue);
		$gameScreen.dWindowFrame = 'ON';
		var variable69Value = 99;
		$gameScreen.showPicture(variable69Value,"",1,640+50,50,100,100,0,0);
		$gameScreen.movePicture(variable69Value,1,640,50,100,100,255,0,60);
	};

	// Replaces (3x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1, data/Map003.json:map-event:142:page:1
	cycleSelfSwitchVariable2 = function (interp) {
		return (function () {
		var selfSwitchValue = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
		var newValue2 = 10;
		if(selfSwitchValue == 10){var newValue2 = 100};
		if(selfSwitchValue == 100){var newValue2 = 1000};
		if(selfSwitchValue == 1000){var newValue2 = 10000};
		if(selfSwitchValue == 10000){var newValue2 = 10};
		$gameSelfSwitches.setVariableValue([$gameMap.mapId(), 
		interp._eventId, 10], newValue2);
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	showDiceBackground = function () {
		var pictureId2 = 98;
		var pictureName2 = '/img/dice/background';
		$gameScreen.showPicture(pictureId2,pictureName2,1,640+50,384,100,100,0,0);
		$gameScreen.movePicture(pictureId2,1,640,384,100,100,255,0,30);
	};

	// Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	showInfoPopupVar801And69 = function (interp) {
		var messageText2 = `おめでとう。`;
		var textPart2 = `コイン+`;
		var textPart3 = `枚`;
		return (function () {
		$gameVariables.setValue(801,`${messageText2}`);
		var text3 = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
		var newValue2 = text3 * 2;
		$gameVariables.setValue(69,$gameVariables.value(69) + newValue2);
		var text3 = `${textPart2}${newValue2}${textPart3}`;
		CommonPopupManager.showInfo({},text3,null);
		}).call(interp);
	};

	// Replaces (3x): data/Map003.json:map-event:141:page:1, data/Map003.json:map-event:247:page:1, data/Map007.json:map-event:53:page:1
	setValueBetCoinlist = function (interp) {
		return (function () {
		$gameSelfSwitches.setVariableValue([$gameMap.mapId(), 
		interp._eventId, 10], 10);
		valueBetCoinlist = [10];//ポーカー用ベットレート
		}).call(interp);
	};

	// Replaces (3x): data/Map003.json:map-event:141:page:1, data/Map003.json:map-event:247:page:1, data/Map007.json:map-event:53:page:1
	setValueBetCoinlist2 = function (interp) {
		return (function () {
		var selfSwitchValue = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
		var newValue2 = 10;
		if(selfSwitchValue == 10){var newValue2 = 100};
		if(selfSwitchValue == 100){var newValue2 = 1000};
		if(selfSwitchValue == 1000){var newValue2 = 10000};
		if(selfSwitchValue == 10000){var newValue2 = 10};
		$gameSelfSwitches.setVariableValue([$gameMap.mapId(), 
		interp._eventId, 10], newValue2);
		valueBetCoinlist = [newValue2];
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:142:page:1
	setValueMenuBackOpacity = function (numericValue) {
		valueMenuBackOpacity = numericValue;
	};

	// Replaces (2x): data/Map003.json:map-event:151:page:1, data/Map003.json:map-event:242:page:1
	setSwitch380 = function (interp) {
		return (function () {
		$gameSwitches.setValue(380,false);
		if(!$gameSelfSwitches.value([$gameMap.mapId(), interp._eventId, 'A'])){
		  $gameSwitches.setValue(380,true);
		};
		if(!$gameSelfSwitches.value([$gameMap.mapId(), interp._eventId, 'B'])){
		  $gameSwitches.setValue(380,true);
		};
		}).call(interp);
	};

	// Replaces (10x): data/Map003.json:map-event:156:page:1, data/Map003.json:map-event:157:page:1, data/Map003.json:map-event:174:page:1, data/Map035.json:map-event:20:page:1, data/Map096.json:map-event:6:page:1, data/Map096.json:map-event:6:page:2, …
	storeValueBossIdFromInterpreter = function (interp) {
		return (function () {
		valueBossId = interp._eventId;
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:157:page:1, data/Map165.json:map-event:12:page:1
	setupPopEnemy = function () {
		value = $dataItems[$gameVariables.value(240)];
		popEnemy_setUp(value);
	};

	// Replaces (2x): data/Map003.json:map-event:166:page:2, data/Map003.json:map-event:243:page:2
	setupChildInterpreter15 = function (interp) {
		var messageText2 = `デイリークエスト`;
		return (function () {
		var constantValue = 800;
		if($dataItems[valueCountSet1].meta['SGカテゴリ']){
		  if($dataItems[valueCountSet1].meta['SGカテゴリ'] == `${messageText2}`){
		    var constantValue = 900;
		  } else {
		    var constantValue = 800;
		  };
		};
		var templateText = `\x1bIIN[${valueCountSet1}]\n${valueQuestArray4[valueCountSet1-constantValue]}`;
		interp.sVal(172,10);
		valueTalkSet = [24,templateText,0];
		interp.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:166:page:2, data/Map003.json:map-event:243:page:2
	showTickerQuestAccepted = function () {
		var textPrefix = `クエスト`;
		var colorCode4 = `\\C[3]`;
		var textPart2 = `IIN[`;
		var colorResetCode = `\\C[0]`;
		var textSuffix = `を受注しました。`;
		var tickerText = `${textPrefix}${colorCode4}${textPart2}${valueCountSet1}]${colorResetCode}${textSuffix}`;
		TickerManager.show(tickerText);
		$gameParty.gainItem($dataItems[valueCountSet1], 1);
	};

	// Replaces (2x): data/Map003.json:map-event:166:page:3, data/Map003.json:map-event:243:page:3
	setupChildInterpreterForQuestSet = function (interp) {
		var messageText2 = `デイリークエスト`;
		return (function () {
		var constantValue = 800;valueCountSet1 = Number($gameMap.event(interp._eventId).event().meta['QuestSet']);
		if($dataItems[valueCountSet1].meta['SGカテゴリ']){
		  if($dataItems[valueCountSet1].meta['SGカテゴリ'] == `${messageText2}`){
		    var constantValue = 900;
		  } else {
		    var constantValue = 800;
		  };
		};
		var templateText = `\x1bIIN[${valueCountSet1}]\n${valueQuestArray4[valueCountSet1-constantValue]}`;
		interp.sVal(172,10);
		valueTalkSet = [24,templateText,1];
		interp.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:167:page:1, data/Map007.json:map-event:20:page:1
	startParallelEventFromEvSceneSetMeta = function (interp) {
		return (function () {
		if ($gameMap.event(interp._eventId).event().meta['EvSceneSet']){
		  var event2 = $gameMap.event(interp._eventId).event().meta['EvSceneSet'].split(',');
		  var targetId2 = Number(event2[0]);
		  event_pararelStarting(1,targetId2,interp._eventId);
		};
		}).call(interp);
	};

	// Replaces (3x): data/Map003.json:map-event:168:page:2, data/Map007.json:map-event:69:page:2, data/Map064.json:map-event:1:page:3
	setupChildInterpreter16 = function (interp) {
		var messageText2 = `デイリークエスト`;
		return (function () {
		var constantValue = 800;
		if($dataItems[valueCountSet1].meta['SGカテゴリ']){
		  if($dataItems[valueCountSet1].meta['SGカテゴリ'] == `${messageText2}`){
		    var constantValue = 900;
		  } else {
		    var constantValue = 800;
		  };
		};
		var templateText = `\x1bIIN[${valueCountSet1}]\n${valueQuestArray4[valueCountSet1-constantValue]}`;
		interp.sVal(172,10);
		valueTalkSet = [24,templateText];
		interp.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp);
	};

	// Replaces (5x): data/Map003.json:map-event:179:page:1, data/Map003.json:map-event:194:page:1, data/Map092.json:map-event:3:page:1, data/Map139.json:map-event:4:page:1, data/Map144.json:map-event:12:page:1
	presetEventCharacterAndRootEventCharacter = function (interp) {
		return (function () {
		valueBossId = interp._eventId;
		event_charaPreset(interp._eventId);
		event_charaRoot(interp._eventId);
		}).call(interp);
	};

	// Replaces (7x): data/Map003.json:map-event:180:page:1, data/Map193.json:map-event:6:page:1, data/Map193.json:map-event:7:page:1, data/Map193.json:map-event:8:page:1, data/Map193.json:map-event:9:page:1, data/Map193.json:map-event:10:page:1, …
	logDebugValue4 = function () {
		var tempValue = $gameMap.tileId(6, 14, 1)
		console.log(`${tempValue}`);
	};

	// Replaces (33x): data/Map003.json:map-event:181:page:1, data/Map003.json:map-event:198:page:1, data/Map003.json:map-event:209:page:1, data/Map003.json:map-event:218:page:1, data/Map003.json:map-event:234:page:1, data/Map003.json:map-event:235:page:1, …
	gatherNearbyEvents = function (interp) {
		return (function () {
		//CharaNameIdが同一のイベントを一日消去
		event_togetherSelf(interp._eventId,'B');
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:196:page:1, data/Map018.json:map-event:31:page:1
	setParallelEvent = function (interp) {
		return (function () {
		event_pararelSet(interp._eventId,0,1,8);
		//ｲﾍﾞﾝﾄに対するx,yのズラす歩数と主人公の向き
		}).call(interp);
	};

	// Replaces (22x): data/Map003.json:map-event:198:page:1, data/Map003.json:map-event:209:page:1, data/Map007.json:map-event:71:page:1, data/Map012.json:map-event:6:page:1, data/Map012.json:map-event:7:page:1, data/Map018.json:map-event:15:page:1, …
	setParallelEventFromEvSceneSet = function (interp, playerDirection) {
		return (function (playerDirection) {
		//ｲﾝｼﾞｹｰﾀｰ等消去,帰還座標記憶,EvSceneSetでｲﾍﾞ起動ｽｲｯﾁ指定
		//ｲﾍﾞﾝﾄに対するx,yのズラす歩数と主人公の向き
		event_pararelSet(interp._eventId,0,1,playerDirection);
		}).call(interp, playerDirection);
	};

	// Replaces (2x): data/Map003.json:map-event:233:page:1, data/Map022.json:map-event:9:page:1
	spawnScreenParticleStatue_orb_c2 = function (interp) {
		return (function () {
		var particleName2 = 'statue_orb_c';
		$gameScreen._particle.particleSet(interp._eventId,particleName2+'-'+interp._eventId,'this',particleName2,'above');
		var particleName2 = 'statue_orb_c'+'-'+interp._eventId;
		$gameScreen._particle.particleUpdate([particleName2,'color','#ff00f7','#ffffff']);
		$gameScreen._particle.particleUpdate([particleName2,'pos',0,-35-48]);
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
	storeThisEventIdOrClear = function (interp) {
		return (function () {
		if(interp._eventId >= 1){
		  valueThisEventId = interp._eventId;
		} else {
		  valueThisEventId = 0;
		};
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
	setupRespawnEnemyN2 = function () {
		var posX = valueNpcGuraTemporarilySave;
		var charaSlotId = 11;
		event_respawnSetN(charaSlotId,posX[8]-1,posX[9],0,posX[6],posX[7],6);
	};

	// Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
	bindInterpreterToValueThisEventId = function (interp) {
		return (function () {
		if(valueThisEventId >= 1){interp._eventId = valueThisEventId};
		}).call(interp);
	};

	// Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
	readVariable292_4 = function () {
		  for (var slotIndex2 = 0; slotIndex2 <= $gameVariables.value(292).length-1; slotIndex2++) {
		    if($gameVariables.value(292)[slotIndex2] >= 1){
		      if(!!$gameMap.event($gameVariables.value(292)[slotIndex2])) {
		        if(!$gameParty.inBattle()){$gameMap.eraseEvent($gameVariables.value(292)[slotIndex2])};
		      };
		    };
		  };
	};

	// Replaces (1x): data/Map003.json:map-event:237:page:1
	setActor20NameVar400And23Etc = function () {
		var messageText2 = `宿受付`;
		var textPart2 = `「いらっしゃい。\nウチは一泊`;
		var variableCode = `\\V[21]`;
		var controlCode = `\\G`;
		var textPart3 = `よ。\n泊まっていくのかしら？」\n`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataWeapons[421].name}`;
		valueCountSet1 = 1231;
		valueCountSet2 = 1232;
		$gameVariables.setValue(23,
		`${textPart2}${variableCode}${controlCode}${textPart3}`);
		$gameVariables.setValue(22,'$FACE[People4, 5]');
		//$gameScreen.setPreparePictureName($FACE[People4,5]);/解らん
		//
	};

	// Replaces (1x): data/Map046.json:map-event:4:page:1
	setActor20NameVar400And23Etc2 = function () {
		var messageText2 = `宿女将`;
		var textPart2 = `「いらっしゃい。\nウチは一泊`;
		var variableCode = `\\V[21]`;
		var controlCode = `\\G`;
		var textPart3 = `よ。\n泊まっていくのかしら？」\n`;
		$gameActors.actor(20).setName(`${messageText2}`);
		$gameVariables.value(400)[59] = `${$dataWeapons[421].name}`;
		valueCountSet1 = 1231;
		valueCountSet2 = 1232;
		$gameVariables.setValue(23,
		`${textPart2}${variableCode}${controlCode}${textPart3}`);
		$gameVariables.setValue(22,'$FACE[People4, 5]');
		//$gameScreen.setPreparePictureName($FACE[People4,5]);/解らん
		//
	};

	// Replaces (1x): data/Map005.json:map-event:2:page:1
	resetScreenToneTemp = function () {
		$gameScreen._tone_temp = 0;
	};

	// Replaces (1x): data/Map005.json:map-event:2:page:1
	pushLoadScene = function () {
		SceneManager.push(Scene_Load)
	};

	// Replaces (3x): data/Map007.json:map-event:3:page:1
	applyMapShockwaveFilter = function (textValue, numericValue, numericValue2, numericValue3, argument5, argument6) {
		var textValue2 = textValue;
		$gameMap.createFilter(textValue2,'shockwave',0,'screen');
		$gameMap.setFilter(textValue2,[640,numericValue,-1,numericValue2,numericValue3,argument5]);
		$gameMap.setFilterAddiTime(textValue2,argument6);
	};

	// Replaces (2x): data/Map007.json:map-event:3:page:1
	setupChildInterpreter17 = function (interp, newValue) {
		return (function (newValue) {
		interp.sVal(20,1);
		interp.sVal(21,newValue);
		interp.sVal(22,-400);
		interp.setupChild($dataCommonEvents[141].list, 0);
		}).call(interp, newValue);
	};

	// Replaces (2x): data/Map007.json:map-event:3:page:1
	setEnemyParams = function (numericValue) {
		var numericValue2 = numericValue;
		$dataEnemies[21].params[0] = numericValue2;
		$dataEnemies[22].params[0] = numericValue2;
		$dataEnemies[41].params[0] = numericValue2;
		$dataEnemies[42].params[0] = numericValue2;
		$dataEnemies[61].params[0] = numericValue2;
		$dataEnemies[62].params[0] = numericValue2;
	};

	// Replaces (2x): data/Map007.json:map-event:3:page:1, data/Map007.json:map-event:7:page:1
	gainSkillMasteryLevel = function (actorId, numericValue, numericValue2) {
		$gameActors.actor(actorId).gainSkillMasteryLevel(numericValue, +numericValue2)
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:33:page:1
	clearScreenParticleAll = function () {
		$gameScreen._particle.particleClear('all');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1
	particleEditParticle = function (textValue) {
		$gameScreen._particle.particleEdit(0,textValue,'picture:57','def','above');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1
	configurePictureEasingEaseInOutQuad = function () {
		var easingValue = 'easeInOutQuad';
		//var value1 = 'easeInSine';
		picture_easingConfiguration(easingValue);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1
	showPicture1Xev100_00back = function () {
		var constantValue = 53;
		var nameValue = 'Xev100_00back';
		pic_1(0,constantValue,nameValue,0,100,255,60,1280,768,-256,0);
	};

	// Replaces (3x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:7:page:1
	runPluginCommandVar75And76 = function (interp, argument1) {
		return (function (argument1) {
		var variable75Value = $gameVariables.value(75);
		var variable76Value = $gameVariables.value(76);
		for (var loopIndex = variable75Value; loopIndex <= variable76Value; loopIndex++) {
		var actor3 = $gameActors.actor(loopIndex)._classId;
		var args3 = new Array(String(loopIndex),argument1,String(actor3));
		interp.pluginCommand("gainJp", args3);
		//var value1 = $gameActors.actor(i)._subclassId;
		//var args = new Array(String(i),"50",String(value1));
		//this.pluginCommand("gainJp", args);
		};
		}).call(interp, argument1);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	setPlayerTransparent = function () {
		$gamePlayer.setTransparent(true);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	shrinkPictureRow = function (interp) {
		return (function () {
		var pictureId2 = 55;
		for (var loopIndex = 0; loopIndex <= 3; loopIndex++) {$gameScreen.movePicture(pictureId2+loopIndex,1,640,384,100,0,0,0,30)};
		interp.wait(40);
		}).call(interp);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	erasePictureRow = function () {
		var pictureId2 = 55;
		for (var loopIndex = 0; loopIndex <= 3; loopIndex++) {$gameScreen.erasePicture(pictureId2+loopIndex)};
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	appendStateDescription = function () {
		var messageText2 = `\nあああああ`;
		if($dataStates[110].meta['Help Description']){
		$dataStates[110].description = `${$dataStates[110].description}${messageText2}`
		}
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	setupChildInterpreter18 = function (interp) {
		return (function () {
		interp.setupChild($dataCommonEvents[64].list, 0);
		interp.sVal(14,21);//パーティ一時解散コモン
		}).call(interp);
	};

	// Replaces (3x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1, data/Map007.json:map-event:23:page:1
	showStandingPicture1AndGetPreviousStandingPicIdVar20Switch42 = function (interp) {
		return (function () {
		$gameSwitches.setValue(42,true);
		tachie_hyouji1($gameVariables.value(20));
		var args3 = new Array(String(getPreviousTachiePicId()),'71','2','ON')
		interp.pluginCommand("P_CALL_CE", args3);
		}).call(interp);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	moveReserveMembersToVariable = function (interp) {
		return (function () {
		$gameParty.members().forEach(function(actor) {
		if(!actor.isBattleMember()){
		$gameVariables.value(154).push(actor._actorId);
		$gameParty.removeActor(actor._actorId)
		}
		}, interp);
		}).call(interp);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	showStandingPicture1 = function () {
		$gameSwitches.setValue(42,true);
		tachie_hyouji1($gameVariables.value(20));
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	showPicture91 = function () {
		var messageText2 = `横`;
		var textPart2 = `画面ピンク`;
		$gameScreen.setPicturesAnimation(2, 1, `${messageText2}`, 40);
		$gameScreen.showPicture(91,`${textPart2}`,1,640,384,100,100,200,0);
		$gameScreen.picture(91).startAnimationFrame(1, true, 1);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	configureGatewayMessage = function () {
		$gameSystem.GWMessageSetting.useGW = 'ON';
		$gameSystem.GWMessageSetting.imgName = 'Dunjon008';
		$gameSystem.GWMessageSetting.fadeSpeed = 256;
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	logDebugValue5 = function () {
		//console.log($dataItems[7].meta['Item Recipe'].split(',')[8]);
		//console.log($dataItems[7].recipeArmor.length);
		console.log($dataItems[7].recipeItem[1]);
		//console.log(value1);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	logDebugValue6 = function (interp) {
		return (function () {
		value1 = DataManager.getSynthesisIngredient($dataItems[234], 0);
		//value1 = DataManager.getSynthesisQuantity($dataItems[234], 1);
		//console.log($dataItems[234].synthIngredients.length);
		console.log(valueItemsSynth1);
		interp.sVal(21,value1.id + 1000);
		}).call(interp);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	runPluginCommand = function (interp) {
		var messageText2 = `testピクチャ`;
		var textPart2 = `Ｈシーン演出`;
		var textPart3 = `味方カットイン`;
		return (function () {
		interp.sVal(86,3);interp.sVal(87,3);interp.sVal(245,40);interp.sVal(246,80);
		var newValue2 = `${messageText2}`;
		interp.sVal(251,newValue2);
		var args3 = new Array(`${textPart2}`);
		interp.pluginCommand(`${textPart3}`, args3);
		}).call(interp);
	};

	// Replaces (3x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1, data/Map007.json:map-event:23:page:1
	runPluginCommandFadeImg = function (interp, argument1) {
		return (function (argument1) {
		var argument12 = argument1;
		var args3 = new Array("FadeImg",String(argument12));
		interp.pluginCommand("GWTrans_Setting", args3);
		var args3 = new Array("FadeInImg",String(argument12));
		interp.pluginCommand("GWTrans_Setting", args3);
		var args3 = new Array("on");
		interp.pluginCommand("GWTransition", args3);
		}).call(interp, argument1);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	setSelfVariable21_3 = function (interp) {
		return (function () {
		interp.sVal(21,[0,[],0,0,0,0,0,0,0]);
		$gameVariables.value(21)[1].push(5);
		$gameVariables.value(21)[1].push(556);
		}).call(interp);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	runCommonScript1 = function (interp) {
		return (function () {
		common_script1(26,interp._eventId,6,5,131,4,0,15,2,90);
		interp.setupChild($dataCommonEvents[64].list, 0);
		//id,ｲﾍﾞid,速度,頻度,ｱﾆid,x,y,高さ,回転数,角度
		}).call(interp);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	logDebugValueVar20 = function () {
		console.log(eval("valueDanjonTreasure" + $gameVariables.value(20)));
		console.log(eval("valueDanjonTrSyurui" + $gameVariables.value(20)));
		var variable20Value = eval("valueDanjonTreasure" + $gameVariables.value(20));
		var variable20Value2 = eval("valueDanjonTrSyurui" + $gameVariables.value(20));
		var randomValue4 = variable20Value[getRandomIndex(variable20Value.length)];
		let entryIndex2 = variable20Value.findIndex(variable20Value => variable20Value === randomValue4); 
		if(entryIndex2 >= 0){
		variable20Value.splice(entryIndex2, 1);
		}
		console.log(variable20Value);
		console.log($dataItems[randomValue4].name);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	setSelfVariable21_4 = function (interp) {
		return (function () {
		//if($gamePlayer.followers().follower(i).isVisible() ){
		//this.sVal(21,2);
		//} else {
		//this.sVal(21,1);
		//};
		interp.sVal(21,valueFighterStatas);
		}).call(interp);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	checkPlayerOnEventAndStoreEventId = function (interp) {
		return (function () {
		interp.character(0).x == interp.character(-1).x && interp.character(0).y == interp.character(-1).y
		value2 = $gameMap.eventIdXy(9, 3)
		$gameVariables.setValue(2, value2)
		}).call(interp);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	gainSkillMasteryLevelActor1 = function () {
		$gameActors.actor(1).gainSkillMasteryLevel(101, +1)
		$gameActors.actor(1).gainSkillMasteryUses(201, 15)
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	readActorCharacterInfo = function () {
		$gameActors.actor(n)._characterIndex
		$gameActors.actor(n)._characterName
	};

	// Replaces (3x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1, data/Map007.json:map-event:17:page:1
	runPluginCommand153 = function (interp) {
		return (function () {
		var nameValue = "153";//一刀両断102崩壊161横両断008封印054内側から153
		var arraySize = "character";//"picture"
		var args3 = new Array(String(arraySize),"0","fadeOut",
		String(nameValue),"180","5");
		interp.pluginCommand("GWFade", args3);
		}).call(interp);
	};

	// Replaces (3x): data/Map007.json:map-event:5:page:1
	playHcgPiston5 = function (breathPresetId) {
		hcg_piston(55,1,breathPresetId);
		//ピクID,1縦2横3左斜め4右斜め,1緩め2通常3ラスト
	};

	// Replaces (3x): data/Map007.json:map-event:5:page:1
	setupChildInterpreter19 = function (interp, newValue) {
		return (function (newValue) {
		interp.sVal(14,newValue);//Ｈ効果
		interp.setupChild($dataCommonEvents[58].list, 0);
		}).call(interp, newValue);
	};

	// Replaces (3x): data/Map007.json:map-event:23:page:1
	erasePictureById2 = function (interp, pictureId) {
		return (function (pictureId) {
		$gameScreen.erasePicture(pictureId);
		interp.wait(3);
		}).call(interp, pictureId);
	};

	// Replaces (3x): data/Map007.json:map-event:34:page:1
	speakCharacterOneLiner4 = function (interp) {
		var messageText2 = `「オラッ！」`;
		var textPart2 = `「オラァッ！」`;
		return (function () {
		valueSerialPictureId += 1;
		var randomXOffsets = [-50,0,50,-100,100];
		var randomYOffsets = [-50,0,50,-100,100];
		var lineCandidates = [`${messageText2}`,`${textPart2}`];
		chara_oneWord(valueSerialPictureId,interp._eventId,25,60,randomXOffsets,randomYOffsets,lineCandidates);
		interp.wait(20);
		}).call(interp);
	};

	// Replaces (4x): data/Map054.json:map-event:2:page:1, data/Map054.json:map-event:2:page:2, data/Map054.json:map-event:2:page:3, data/Map054.json:map-event:2:page:4
	setupBoss = function (interp, newValue, bossId) {
		return (function (newValue, bossId) {
		interp.sVal(29,newValue);
		boss_setup1(2,bossId);
		}).call(interp, newValue, bossId);
	};

	// Replaces (4x): data/Map054.json:map-event:2:page:1, data/Map054.json:map-event:2:page:2, data/Map054.json:map-event:2:page:3, data/Map054.json:map-event:2:page:4
	setEventFace2 = function (interp) {
		return (function () {
		var eventId2 = interp._eventId
		if(!!$gameMap.event(eventId2)) {
		    var event = $gameMap.event(eventId2);
		    event.setStepAnime(false);event.setWalkAnime(false);
		    event.setDirection(2);event.resetPattern();
		    event._originalPattern = 1;event.setAngle(45);
		    event._spriteOffsetX = -12;event._spriteOffsetY = -12;
		    event._kageM.clear();
		    event.setFace(6,true,true);//Child用event.setFace(6,true,true,0,6,0,6);
		};
		}).call(interp);
	};

	// Replaces (2x): data/Map085.json:map-event:2:page:1, data/Map085.json:map-event:3:page:1
	spawnMapEvent2 = function (interp) {
		return (function () {
		var x4 = $gameMap.event(interp.eventId()).x;
		var y5 = $gameMap.event(interp.eventId()).y;
		$gameMap.spawnEvent(190, x4, y5, true);
		}).call(interp);
	};

	// Replaces (2x): data/Map100.json:map-event:11:page:1
	requestEventAnimationVar19 = function (interp, argument1) {
		return (function (argument1) {
		var variable19Value = $gameVariables.value(19);
		var argument12 = argument1;
		interp.character(variable19Value).requestAnimation(argument12);
		}).call(interp, argument1);
	};

	// Replaces (1x): data/Map100.json:map-event:11:page:1
	spendGoldForClass3JobMaterial = function () {
		$gameParty.loseGold(100000);
		for (var itemId2 = 1; itemId2 <= $dataItems.length-1; itemId2++) {
		if($dataItems[itemId2].meta['クラス3ジョブ解放素材']){
		var item2 = itemId2;
		break;
		}};
		$gameParty.loseItem($dataItems[item2], 1);
	};

	// Replaces (1x): data/Map100.json:map-event:11:page:1
	spendGoldForClass2JobMaterial = function () {
		$gameParty.loseGold(10000);
		for (var itemId2 = 1; itemId2 <= $dataItems.length-1; itemId2++) {
		if($dataItems[itemId2].meta['クラス2ジョブ解放素材']){
		var item2 = itemId2;
		break;
		}};
		$gameParty.loseItem($dataItems[item2], 1);
	};


})();
