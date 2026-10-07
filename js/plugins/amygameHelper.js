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
})();
