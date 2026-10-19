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
				return $dataItems
		}
	}

	//内部用。変数292(スポーンID一覧)が未設定/配列でない場合の事故を防ぐ
	function AGH_spawnIdList() {
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
		interp._eventId = AGH_spawnIdList()[spawnSlot] || 0;
	};

	// Replaces (~31x):
	//   var value1 = <id or expression>;
	//   var event = $gameMap.event($gameVariables.value(292)[value1]);
	//   event.locate(<x>, <y>);
	//   event.setDirection(<dir>);
	AGH_locateSpawnedNpc = function (id, x, y, dir) {
		var spawnSlot = id;
		var event = $gameMap.event(AGH_spawnIdList()[spawnSlot]);
		if (!event) return;
		event.locate(x, y);
		event.setDirection(dir);
	};

	// Replaces (~26x):
	//   var arr1 = [];
	//   arr1.push($gameVariables.value(292)[<id1>]); ...
	//   event_NpcCharaMoveId(45,"<action>",arr1);
	AGH_npcGroupAction = function (ids, action) {
		var spawnIdList = AGH_spawnIdList();
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
	AGH_erasePictureIdsForSwitch = function (switchId, layer, ids) {
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
		$gameScreen.showPicture(picId, cgImageName, 1, 640, 384, 100, 100, 255, 0);
		picture_fade1(picId, "fadeIn", fadeTarget, frames, 5);
	};

	// Replaces (8x): slide out left-side standing pictures (11..20).
	AGH_slideOutLeftPictures = function () {
		for (var i = 11; i <= 20; i++) {
			const pic = $gameScreen.picture(i);
			if (!pic) continue;

			const posX = pic.x() >= 640 ? 1280 : -500;
			$gameScreen.movePicture(i, 1, posX, pic.y(), pic.scaleX(), pic.scaleY(), 0, 0, 60);
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
		item_oneOffBuy(1, valueSPBuyCountSet1 = count, valueSPBuyCountSet2 = itemId, kind);
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
		$gameVariables.setValue(528, 100);
		CEH_sceneReturnKeepCount(interp, val171);
	}

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
		interp._eventId = AGH_spawnIdList()[slot] || 0;
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
		var spawnIdList = AGH_spawnIdList();
		for (var i = 0; i <= spawnIdList.length - 1; i++) {
			const id = spawnIdList[i];
			if (id < 1 || !$gameMap.event(id) || $gameParty.inBattle()) {
				continue;
			};
			$gameMap.eraseEvent(id);
		};
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
		if (valueThisEventId >= 1) { interp._eventId = valueThisEventId };
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
	//   var value1 = $gameVariables.value(530);
	//   event_respawnSetA(value1,14,34,1,4);
	//   this._eventId = $gameVariables.value(292)[value1];
	//   var value1 = 11;
	//   event_respawnSetN(value1,16,15,0,'npcUnique1',0,4);
	CEH_respawnMainNpcDefault = function (interp) {
		var spawnSlot = $gameVariables.value(530);
		event_respawnSetA(spawnSlot, 14, 34, 1, 4);
		interp._eventId = AGH_spawnIdList()[spawnSlot] || 0;
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
		var event = $gameMap.event(AGH_spawnIdList()[spawnSlot]);
		if (event) {
			event.setImage(npcPreset[1], npcPreset[2]);
			event.setDirection(npcPreset[5]);
		}
		interp._eventId = AGH_spawnIdList()[spawnSlot] || 0;
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
		interp._eventId = AGH_spawnIdList()[spawnSlot] || 0;
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
		var spawnedEventId = AGH_spawnIdList()[spawnSlot] || 0;
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
	CEH_currentActorId = function () {
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
		var spawnedEventId = AGH_spawnIdList()[spawnSlot] || 0;
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
	AGH_charaOneWord = function (picId, eventId, textPicId, AGH_waitFrames, randX, randY, lines) {
		chara_oneWord(picId, eventId, textPicId, AGH_waitFrames, [randX], [randY], lines);
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
		let picId = 55
		valuePic1 = picId;
		valueScenePic = 'Goods_drag1_';
		$gameScreen.setPicturesAnimation(2, 10, "連番", 20);
		picId = picId + 4;
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
		const actor1 = `\\V[94]`;
		const actor2 = `\\V[22]`;
		interp.sVal(506, `${actor1}は${actor2}とセックスした…。`);
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
		// var unusedTurnsDraw = getRandomIndex(3) + 3; //RNG stream position
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
		if (!$gameParty.inBattle()) {
			return;
		};
		state_applyCommonEffect(user, target, stateId, 261);
		if (target._stateCounter[stateId] >= 1 || target._stateCounter[stateId] <= 9) {
			target.addStateCounter(stateId, +1);
		} else {
			target.setStateCounter(stateId, 1);
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
		switch (motionType) {
			case 0:
				user.addState(594)
				break;
			case 1:
				user.addState(595)
				break;
			case 2:
				user.addState(596)
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
		else if (weaponId == 73) {
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
	// classRank is a static notetag but this formula is re-evaluated for every
	// parameter on every level-up / status refresh, so the parsed Number is
	// cached per classId (NaN for a class without the notetag, exactly like the
	// previous Number(undefined) result).
	var classRankCache = {};
	function classRankOf(classId) {
		var rank = classRankCache[classId];
		if (rank === undefined) {
			rank = Number($dataClasses[classId].meta['classRank']);
			classRankCache[classId] = rank;
		}
		return rank;
	}
	AGH_classBaseParamActorStatas = function (user, level, statas, statIndex) {
		var base = statas[statIndex];
		var classRank = classRankOf(user._classId);
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
		const targetName = target.name();
		const itemName = item.name;
		TickerManager.show(`${targetName}の通常攻撃を${itemName}に変更しました`);
	};

	// Replaces (1x, skill 26 持ち上げ＜OFF＞): flips the pickup flag and the
	// skill's own name between ＜ON＞ and ＜OFF＞.
	AGH_damageFormulaTogglePickup = function (action, user, target) {
		if (target.actorId() !== user.actorId()) return;
		var item = action.item();
		const onMsg = `持ち上げ＜ON＞`;
		if (item.name === onMsg) {
			$gameSystem._pickupData[0] = false;
			item.name = '持ち上げ＜OFF＞';
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
		var item = action.item();
		skill_sentaku(item.id, 0);
		const itemName = '＜' + item.name + '＞';
		TickerManager.show(`${itemName}に変更しました`);
		info_SetY($gameVariables.value(200));
	};

	// Replaces (1x, skill 42 視点変更): moves the map viewpoint state (601)
	// from the actor currently in variable 11 to the caster.
	AGH_damageFormulaChangeViewpoint = function (user, target) {
		if (target.actorId() !== user.actorId()) return;
		var currentViewpointActorId = $gameVariables.value(11);
		const userName = user.name();
		if (user.actorId() === currentViewpointActorId) {
			TickerManager.show(`現在の視点は${userName}の為、変更はありません。`);
			return;
		}
		$gameSwitches.setValue(151, true);
		$gameActors.actor(currentViewpointActorId).removeState(601);
		$gameVariables.setValue(11, user.actorId());
		$gameActors.actor($gameVariables.value(11)).addState(601);
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
		var nudeFlags = $gameVariables.value(440 + target.actorId());
		const targetName = target.name();
		if (nudeFlags[23] === 1) {
			nudeFlags[23] = 0;
			TickerManager.show(`${targetName}は着衣になりました。`);
		} else {
			nudeFlags[23] = 1;
			TickerManager.show(`${targetName}は全裸になりました。`);
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
			const targetName = target.name();
			const skillName = $dataSkills[sourceSkillId].name;
			BattleManager._logWindow.push(`addText`, `${targetName}の${skillName}は不発に終わった…。`);
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
	}

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
		var nextCost = ROUNDED_COSTS[$gameVariables.value(268)];
		if (nextCost !== undefined)
			$gameVariables.setValue(268, nextCost);

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
			const targetName = target.name();
			BattleManager._logWindow.push(`addText`, `${targetName}達のStatus閲覧可能`);
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
		const targetName = target.name();
		BattleManager._logWindow.push(`addText`, `${targetName}の経験値獲得率が上昇し${rate}%になった！`);
	};

	// Replaces (1x, skill 432 ルピ獲得率1000%up).
	AGH_afterEvalLogGoldRate = function () {
		BattleManager._logWindow.push(`addText`, 'パーティの獲得\\Gレートが10倍になった！');
	};

	// Replaces (2x, skills 433 ダメージ上限撤廃 / 434 バフ上限最大値 - the
	// database gives both the same body, so both announce a damage cap).
	AGH_afterEvalLogDamageCapRemoved = function (target) {
		const targetName = target.name();
		BattleManager._logWindow.push(`addText`, `${targetName}のダメージ上限が取り払われた！`);
	};

	// Replaces (1x, skill 891 仲間を呼ぶ).
	AGH_afterEvalLogCalledAllies = function (target) {
		const targetName = target.name();
		BattleManager._logWindow.push(`addText`, `${targetName}は仲間を呼んだ！`);
	};

	const CHARACTER_LOOK_VARIANTS = [
		`はこちらの様子を見ている…。`,
		`はボーっとしている…。`,
		`はあらぬ方向を眺めている…。`,
		`は故郷に想いを馳せている…。`
	];

	// Replaces (1x, skill 892 様子を見る). The idle line is rolled BEFORE the
	// state checks, exactly as in the original, so the RNG stream is unchanged.
	AGH_afterEvalLogIdleMessage = function (target) {
		if (target.isStateAffected(420)) {
			text = '「………………」。';
		}
		else if (target.isStateAffected(91)) {
			text = 'は厭らしい嗤いを浮かべている…。'
		}
		else {
			var text = CHARACTER_LOOK_VARIANTS[getRandomIndex(CHARACTER_LOOK_VARIANTS.length)];
		}
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
	// context-based helper (e.g. AGH_showHExperienceTable1(), AGH_initLeadActorAndRespawn()):
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
		picture_motion1("linear", [0]);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	AGH_setMessagePictureAnimationParams = function () {
		$gameMessage._IZSTPicShowParam = [550 + 640, 384 + 100, 100, 100, 100];
		$gameMessage._IZSTPicMoveParam = [500 + 640, 384 + 100, 100, 100, 255, 30];
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	AGH_setHVScrollingMenuBackground = function () {
		$gameVariables.setValue(81, 0)//メニュー背景横スク
		$gameVariables.setValue(82, 0)//メニュー背景縦スク
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
	/* `AGH_enableSwitch` / `AGH_disableSwitch` are public (called from the data files) and
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
	 * Core of the whole `AGH_blessStandingPicture*` family: show a picture, optionally
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
	function slideScenePictureAway(picIndex, AGH_waitFrames) {
		pic_move1(valuePic1 + picIndex - 1, 0, 0, 100, 100, 0, AGH_waitFrames === undefined ? 90 : AGH_waitFrames);
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
		AGH_enableSwitch(125);
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
		const awakeningActorName = currentActor().name();   // the actor that awakens
		const secondJobName = jobName(jobIndex + 20);
		const secondJob = colorTaggedText(2, `＜${secondJobName}＞`);
		const actorName = leadingSpaces + colorTaggedText(16, awakeningActorName);
		valueWordSet0 = `${actorName}はメインクラス2ndジョブ${secondJob}に目覚めた！`;
		valueWordSetEx = 0;   // 補足が必要な場合
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
	function speakOneLiner(interp, pictureId, lines, options = {}) {   // `interp` may be null when no wait is needed
		const {
			fontSize = 25, fontWeight = 180, fontFace = 0,
			xOffsets = [0], yOffsets = [-50],
			eventId = interp._eventId, AGH_waitFrames = 0,
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
		callPluginCommand(interp, 'P_CALL_CE', getPreviousTachiePicId(), '71', '2', 'ON');
	}

	/* --- visual-novel / cutscene state --------------------------------------- */

	function setVisualNovelChoices(enabled) { $gameSystem.vnChoices = enabled; }

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
		//console.log(`${entryId}  ${picturePath}`);
		showPic(pictureSlot, picturePath, 640 - 128, 384, 100, 100, 255, 1);
	}
	function playMetaBgm(entryId, bgmName) {
		if (bgmName === 'NoMusic') return;
		//console.log(`${entryId}  ${bgmName}`);
		AudioManager.playBgm({ name: bgmName, volume: 100, pitch: 100, pan: 0 });
	}
	/* ============================================================================
	 * Setup / configuration
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:1
	AGH_initHeroineAndDeployedActorVariables = function () {
		setVar(73, 1);   // ヒロインキャラ始点変数
		setVar(74, 2);   // ヒロインキャラ終点変数
		setVar(247, [1, 2]);                // ヒロインID配列変数
		setVar(75, 1);   // 登場キャラ始点変数
		setVar(76, 7);   // 登場キャラ終点変数
		setVar(248, [1, 2, 3, 4, 5, 6, 7]); // キャラID配列変数
	};

	// Replaces (2x): data/CommonEvents.json:common-event:1, data/CommonEvents.json:common-event:102
	AGH_setGabDisplayDuration = function () {
		setVar(68, 120);   // GAB表示時間
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	AGH_setTickerDisplayTime180 = function () {
		setTickerDisplayTime(180, 0);   // ティッカー表示時間 / TickerY軸変更
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	AGH_setPopupNoticeDuration = function () {
		setVar(65, 180);   // KMSポップアップ表示時間
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	AGH_setStateAnimationWaitFrames = function () {
		setVar(279, 10);   // ステート付与解除アニメウェイト
		setVar(280, 10);   // 280に上乗せ分ウェイト
	};

	// Replaces (1x): data/CommonEvents.json:common-event:1
	AGH_setFirstMenuDisplayVariable = function () {
		setVar(254, 1);   // メニュー表示変数1で固定
	};

	/* ============================================================================
	 * Variables / save files
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:2, data/CommonEvents.json:common-event:53
	AGH_dumpLocationPresetToFile = function (variableId) {
		// LisciaBlueQuestフォルダに書き出し
		fs.writeFileSync('valueLocationPreset.txt', JSON.stringify(varValue(variableId)));
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
		setVar(508, 'BlueSky');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:431
	AGH_setEliteCrewLabel = function () {
		setVar(21, `幹部団員 ${braceRight()}秩序の騎空団`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:12
	AGH_setWeekLabel = function () {
		setVar(55, '月');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:12
	AGH_setLiftOffLabel = function () {
		setVar(515, '持ち上げoff');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:290, data/CommonEvents.json:common-event:295
	AGH_setAlreadyViewedEventPrompt = function () {
		const textSpeed0 = textSpeed(0);
		const viewedEventItemIcon = itemIconName(varValue(142));   // variable 142 (scratch): item of the already-viewed event
		setVar(21,
			`${textSpeed0}イベント：${viewedEventItemIcon}は、既に閲覧済みです。\nスキップしますか？\n（そのイベントで獲得できる称号や性経験値などは入手できます。\n但し、獲得物に選択肢が関係する場合は入手できません）`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:290, data/CommonEvents.json:common-event:295
	AGH_setViewedEventItemVariable = function () {
		const viewedEventItemId = varValue(142);   // variable 142 (scratch): item of the already-viewed event
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
		setQuestObjective('まずは王城へと向かいましょう。\n王都北側に入り口がある筈です。');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:302, data/CommonEvents.json:common-event:303
	AGH_setQuestObjectiveHeadToInn = function () {
		setQuestObjective('宿へ向かいましょうか');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:304
	AGH_setQuestObjectiveHeadToGuild = function () {
		setQuestObjective('【騎空士ギルド】へ向かいましょう。\n確か、王城の手前ほどの場所にあったはずです');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:305
	AGH_setQuestObjectiveVisitInformant = function () {
		setQuestObjective('情報屋に会いに行きましょう。\n表向きは書店を営業していると聞いています');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:309
	AGH_setQuestObjectiveReturnToInn = function () {
		setQuestObjective('空賊に関する資料が届いているかも知れません。\n宿屋に戻りましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:311
	AGH_setQuestObjectiveCaptureCentralPlainsBandits = function () {
		const defeatedBanditCount = variableText(642);   // variable 642: ﾒｲﾝ10中央平原討伐数
		setQuestObjective(`中央平原の空賊達を\n１０人捕縛(討伐)しましょう\n ＜${defeatedBanditCount} / 10人＞`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:312
	AGH_setQuestObjectiveReachLevelTenThenChurch = function () {
		const characterName5 = characterName(5);
		const centralPlainsName = switchName(252);   // switch 252: 中央平原
		setQuestObjective(`${characterName5}くんのレベルを10に上げて教会へと向かいましょう。\n` +
			`空賊達が居なくなった${centralPlainsName}が、\n狩場に適してしるようですね。\n` +
			'情報屋で情報を購入しておいた方が良いかも知れません。');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:313
	AGH_setQuestObjectiveLocateBanditHideout = function () {
		setQuestObjective('そろそろ、尋問が終わって空賊達の拠点が\n割り出されているでしょうか');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:314
	AGH_setQuestObjectiveHeadToVillage = function () {
		setQuestObjective('集落へと向かいましょうか');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:315
	AGH_setQuestObjectiveAskVillageElder = function () {
		const itemName26 = itemName(26);
		setQuestObjective(`この集落のまとめ役の方に\n${itemName26}に関する\n情報を聞きに行きましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:316
	AGH_setQuestObjectivePrepareCountermeasures = function () {
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
	AGH_setQuestObjectiveSearchGraveyard = function () {
		setQuestObjective('この有様になった、原因がある筈です。\n墓地の中を調べていきましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:318
	AGH_setQuestObjectiveDefeatGraveyardBoss = function () {
		const graveyardName = switchName(254);   // switch 254: 共同墓地
		setQuestObjective(`${graveyardName}のボスを討伐しましょう！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:319
	AGH_setQuestObjectiveHeadToNamedPlace = function () {
		const centralForestName = switchName(256);   // switch 256: 中央森林
		setQuestObjective(`${centralForestName}へ向かいましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:320
	AGH_setQuestObjectiveCrossForestToHideout = function () {
		setQuestObjective('この森を抜ければ空賊団のアジトです。\n行きましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:321
	AGH_setQuestObjectiveRaidBanditHideout = function () {
		setQuestObjective('さあ、アジトへと突入しましょう！');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:322
	AGH_setQuestObjectiveDefeatHideoutBoss = function () {
		const skyPirateHideoutName = switchName(255);   // switch 255: 空賊団本拠地
		setQuestObjective(`${skyPirateHideoutName}のボスを討伐しましょう！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:323
	AGH_setQuestObjectiveLeaveCastle = function () {
		setQuestObjective('城を出ましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:324
	AGH_setQuestObjectiveRegroupAtInn = function () {
		setQuestObjective('宿に戻ってみんなと合流しましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:325
	AGH_setQuestObjectiveHeadToNewlyFoundSite = function () {
		const itemName22 = itemName(22);
		setQuestObjective(`新しく発見されたという\n${itemName22}へ向かいましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:326
	AGH_setQuestObjectiveDefeatSiteBoss = function () {
		const kamunaoiCaveName = switchName(332);   // switch 332: カムナオイ洞窟[裏]
		setQuestObjective(`${kamunaoiCaveName}のボスを討伐しましょう！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:327
	AGH_setQuestObjectiveMeetCompanionAtPlace = function () {
		const augusteIslandsName = switchName(223);   // switch 223: アウギュステ列島
		const characterName2 = characterName(2);
		setQuestObjective(`${augusteIslandsName}へと向かい、\n${characterName2}さんと合流しましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:328
	AGH_setQuestObjectiveBuySwimsuit = function () {
		setQuestObjective('雑貨屋に水着を買いに行きましょうか…');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:329
	AGH_setQuestObjectiveMeetCompanionAtBeach = function () {
		const characterName2 = characterName(2);
		setQuestObjective(`浜辺に行って${characterName2}さんと合流しましょう。\nお昼でないと居ないでしょうから気を付けましょうね`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:330
	AGH_setQuestObjectiveAdvanceToNamedPlace = function () {
		const greatWaterfallName = switchName(284);   // switch 284: 大爆滝
		setQuestObjective(`${greatWaterfallName}へ向かいましょう。`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:331
	AGH_setQuestObjectiveEnterFromEntrance = function () {
		const greatWaterfallName = switchName(284);   // switch 284: 大爆滝
		setQuestObjective(`${greatWaterfallName}にある入口から中に入りましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:332
	AGH_setQuestObjectiveGoDeeper = function () {
		const undergroundLakeName = switchName(285);   // switch 285: 地底湖
		setQuestObjective(`${undergroundLakeName}の奥へと進みましょう──`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:333
	AGH_setQuestObjectiveDefeatDepthBoss = function () {
		const undergroundLabName = switchName(286);   // switch 286: 地底湖奥研究所
		setQuestObjective(`${undergroundLabName}のボスを討伐しましょう！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:334
	AGH_setQuestObjectiveReturnAndRegroup = function () {
		const corblantIslandName = switchName(221);   // switch 221: コルブラント島
		const characterName4 = characterName(4);
		setQuestObjective(`${corblantIslandName}に戻って、\n${characterName4}さん達と合流しましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:335
	AGH_setQuestObjectiveVisitInformantAgain = function () {
		setQuestObjective('情報屋を訪ねましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:336
	AGH_setQuestObjectivePassFirstFloor = function () {
		const kleistMountainName = switchName(334);   // switch 334: クライスト山[1F]
		setQuestObjective(`${kleistMountainName}へ向かいましょう。\n1層を通り抜けます`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:337
	AGH_setQuestObjectiveRaidHut = function () {
		setQuestObjective('小屋に突入しましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:338
	AGH_setQuestObjectiveHeadToLocalInn = function () {
		const corblantIslandName = switchName(221);   // switch 221: コルブラント島
		setQuestObjective(`${corblantIslandName}の宿に向かいましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:339
	AGH_setQuestObjectiveVisitCastleByDay = function () {
		setQuestObjective('日中に王城へ向かいましょう');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:340, data/CommonEvents.json:common-event:341
	AGH_setQuestObjectiveAwaitPlayerChoice = function () {
		setQuestObjective('どうしましょうか…');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:342
	AGH_setQuestObjectiveVisitChancellor = function () {
		setQuestObjective('宰相の元へ向かいましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:343
	AGH_setQuestObjectiveFightKnightCommander = function () {
		setQuestObjective('謁見の間で、騎士団長との戦いです');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:344
	AGH_setQuestObjectiveHeadToFestivalHall = function () {
		const graveyardName = switchName(254);   // switch 254: 共同墓地
		const undergroundTunnelName = switchName(257);   // switch 257: 地下坑道
		setQuestObjective(`${graveyardName}の祭殿へ向かいましょう。\nそこから、${undergroundTunnelName}へと行ける筈です`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:345
	AGH_setQuestObjectiveContinueMainQuest = function () {
		const undergroundTunnelName = switchName(257);   // switch 257: 地下坑道
		setQuestObjective(`${undergroundTunnelName}へ向かいましょう`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:346
	AGH_setQuestObjectiveDefeatAreaBoss = function () {
		const undergroundTunnelName = switchName(257);   // switch 257: 地下坑道
		setQuestObjective(`${undergroundTunnelName}のボスを討伐しましょう！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:347
	AGH_setQuestObjectiveInvestigateNoise = function () {
		setQuestObjective('中で物音がしましたね。\n何か変化があったのかも知れません。\n行ってみましょう');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:348
	AGH_setQuestObjectiveFinalBattle = function () {
		const setString7 = setString(7);
		setQuestObjective(`最期の決戦です…。\n『尊き契りの間』の${setString7}を\n撃破しましょう！`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:349, data/CommonEvents.json:common-event:350
	AGH_setQuestObjectiveMainQuestComplete = function () {
		setQuestObjective('何処に行きましょうか？\n（メインクエスト完了）');
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
		setQuestObjective('中央平原へ行きましょう');
		setSelfVar(interp, 21, $dataSystem.switches[248]);
	};

	// Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	AGH_setDisappointmentMessage = function () {
		setVar(801, '残念だったね？');
	};
	/* ============================================================================
	 * Actors / party / skills / states
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:12, data/CommonEvents.json:common-event:64
	AGH_setCostumeDirectSite = function (interp, actorVariableId) {
		setSelfVar(interp, 19, Number($dataActors[varValue(actorVariableId)].meta['MainCloth']));
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
		forEachHeroine(heroineId => {
			$gameActors.actor(heroineId).gainTp(getRandomIndex(61) + 40);
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:9, data/Map003.json:map-event:133:page:2
	AGH_returnProfessionBasics = function () {
		forEachDeployedActor(actorId => Profession_basicReturn(actorId));
	};

	// Replaces (3x): data/CommonEvents.json:common-event:9, data/CommonEvents.json:common-event:24, data/Map003.json:map-event:131:page:2
	AGH_removeDungeonStateFromHeroines = function (interp) {
		forEachHeroine(heroineId => {
			$gameActors.actor(heroineId).removeState(39);
			varValue(380 + heroineId)[58] = 0;
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:19, data/CommonEvents.json:common-event:20
	AGH_removeTemporaryStatesFromDeployedActors = function (interp) {
		valueTachieChangeStateTemporary.forEach(stateId => {
			forEachDeployedActor(actorId => $gameActors.actor(actorId).removeState(stateId));
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	AGH_removeStateFromListActors = function () {
		$gameParty.battleMembers().forEach(battleMember => {
			battleMember.clearParamPlus();
			battleMember.clearXParamPlus();
			battleMember.clearSParamPlus();
			range(486, 489).forEach(stateId => battleMember.removeState(stateId));
			battleMember.refresh();
		});
	};

	// Replaces (1x): data/Map003.json:map-event:3:page:2
	AGH_removeAllStatesFromActor20 = function () {
		const actor = $gameActors.actor(20);
		range(1, $dataStates.length - 1)
			.filter(stateId => actor.isStateAffected(stateId))
			.forEach(stateId => actor.removeState(stateId));
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

	// Replaces (2x): data/CommonEvents.json:common-event:9
	// Registry of Actor-derived resolvers for the SubstitutionActorId fallback.
	// Add new meta keys here without touching the event data.
	AGH_ActorResolvers = {
		Profession: function (actorId) {
			var professionArray = $gameVariables.value(380 + actorId);
			return (Array.isArray(professionArray) && professionArray[59] !== undefined) ? professionArray[59] : '';
		},
		FamilyName: function (actorId) {
			var linkedWeapon = $dataWeapons[actorId + 200];
			return linkedWeapon && linkedWeapon.name ? linkedWeapon.name : '';
		}
	};

	// Registry of direct metadata resolvers; unknown keys fall back to the
	// raw (trimmed) meta value.
	AGH_DirectMetaResolvers = {
		Profession: function (weapon) {
			var meta = weapon.meta['Profession'];
			return typeof meta === 'string' ? meta.trim() : (meta || '');
		},
		FamilyName: function (weapon) {
			var meta = weapon.meta['FamilyName'];
			return typeof meta === 'string' ? meta.trim() : (meta || '');
		}
	};

	// Fills a self-variable array (size 101) with weapon metadata or
	// substitution-actor data. Database Weapon IDs 301..400 map to array
	// indices 1..100 (index 0 unused). Direct metadata takes priority over
	// the SubstitutionActorId fallback, matching the original Script block.
	AGH_nameWeaponsFromVariable = function (interp, targetVarId, metaKey) {
		var resultArray = new Array(101).fill(0);
		var resolveActor = AGH_ActorResolvers[metaKey];
		var resolveDirect = AGH_DirectMetaResolvers[metaKey] || function (weapon) {
			var metaValue = weapon.meta[metaKey];
			return typeof metaValue === 'string' ? metaValue.trim() : (metaValue || '');
		};
		for (var weaponId = 301; weaponId <= 400; weaponId++) {
			var weapon = $dataWeapons[weaponId];
			if (!weapon || !weapon.name) continue;
			var arrayIndex = weaponId - 300;
			if (weapon.meta) {
				if (weapon.meta[metaKey] !== undefined) {
					resultArray[arrayIndex] = resolveDirect(weapon);
				} else if (weapon.meta['SubstitutionActorId']) {
					var actorId = Number(weapon.meta['SubstitutionActorId']);
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
		$gameParty.members().forEach(partyMember => {
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
		range(1, 10).forEach(actorId => {
			$gameSwitches.setValue(actorId + 400, hero.isLearnedSkill(actorId + 60));
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	AGH_autoOffSkillPersonalSwitch = function (interp) {
		// 習得者不在時に自動でスイッチオフ
		valuePersonalSkill.forEach(skillId => {
			if ($dataSkills[skillId].meta.SwicthOnOffUse && !$gameParty.membersLeSkill(skillId)) {
				skill_personalonoffAutoOff(skillId, 0);
			}
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:40
	AGH_autoOffSkillPersonalSwitch2 = function (interp) {
		// 習得者不在時に自動でスイッチオフ
		valuePersonalItem.forEach(itemId => {
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
		forEachDeployedActor(actorId => {
			$gameSwitches.setValue(440 + actorId, actorId === currentViewpointActorId);
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	AGH_clearPartyStateCounters = function () {
		$gameParty.members().forEach(partyMember => partyMember.clearStateCounters());
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
		range(0, valueScriptArray1.length - 1).forEach(memberIndex => {
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
	AGH_setValueTotalexp = function () {
		valueTotalexp = 1;
		valueTotalgold = 1;
		valueMaxEnemyLv = 0;
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	AGH_resetStateTraits = function () {
		range(486, 489).forEach(stateId => {
			const state = $dataStates[stateId];
			state.traits = [{ code: 53, dataId: 6, value: 0.1 }];
		});
		range(490, 497).forEach(stateId => { $dataStates[stateId].traits = []; });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:102
	AGH_addStepsFromVariable = function () {
		$gameParty._steps += varValue(290);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:24, data/Map003.json:map-event:131:page:2
	AGH_resetSkillUseCounts = function () {
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
	AGH_resetStateSpAbilities = function () {
		range(1, $dataStates.length - 1).forEach(stateId => {
			if ($dataStates[stateId].meta['Category'] === ' StateSPabNomal') {
				forEachDeployedActor(actorId => $gameActors.actor(actorId).removeState(stateId));
			}
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	AGH_capViewpointActorSkillMastery = function () {
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
	AGH_showTickerNoPendingScenes = function () {
		showTicker('未発生のシーンは存在しません。');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:66
	AGH_showTickerNoEpisodesOnThisMap = function () {
		showTicker('条件が変動した為、現在このマップで発生する挿話はありません');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	AGH_showTickerNoQuickSaveInBattleMap = function () {
		showTicker('戦闘マップではクイックセーブを行なえません');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	AGH_showTickerNoQuickSaveWhileRecalling = function () {
		showTicker('回想中はクイックセーブを行なえません');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	AGH_showTickerQuickSavedToFile51 = function () {
		showTicker('ファイル５１にクイックセーブしました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	AGH_showTickerQuickSavedToLastFile = function () {
		showTicker('最終使用ファイルにクイックセーブしました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:68
	AGH_showTickerQuickSavedToFile1 = function () {
		showTicker('ファイル１にクイックセーブしました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:202
	AGH_showTickerBattleSpeedSetToFastest = function () {
		showTicker('戦闘速度を最速に変更しました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:202
	AGH_showTickerBattleSpeedSetToFast = function () {
		showTicker('戦闘速度を速いに変更しました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:202
	AGH_showTickerBattleSpeedSetToNormal = function () {
		showTicker('戦闘速度を通常に変更しました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:259
	AGH_showTickerVariable801 = function () {
		const tickerText = variableText(801);   // variable 801: 文字等代入一時変数820まで (the ticker line)
		showTicker(`${tickerText}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:60
	AGH_showInfoPopup = function () {
		const fontColor3 = fontColor(3);
		const talkSet0 = valueTalkSet[0];
		const fontColor0 = fontColor(0);
		showCommonInfo(`Tips:${fontColor3}${talkSet0}${fontColor0}を獲得`);
	};

	// Replaces (1x): data/Map003.json:map-event:3:page:2
	AGH_showInfoPopup2 = function () {
		showCommonInfo('60 seconds Waiting…');
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
		$gameSwitches.setValue(161, $gameParty.gold() >= 1000000);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:211, data/CommonEvents.json:common-event:215
	AGH_setSoloHeroineSwitch = function (interp) {
		let deployedHeroineCount = 0;
		forEachHeroine(heroineId => {
			if ($gameParty.members().contains($gameActors.actor(heroineId))) {
				AGH_enableSwitch(heroineId + 100);
				deployedHeroineCount += 1;
			}
		});
		if (deployedHeroineCount <= 1) AGH_enableSwitch(379);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:199
	AGH_setWorldMenuSwitchForEvent = function () {
		const worldMenuEventId = varValue(19);   // variable 19 (scratch): the event the menu opened on
		AGH_disableSwitch(380);
		if ($gameMap.event(worldMenuEventId).event().meta['WorldMenu']) AGH_enableSwitch(380);
	};

	// Replaces (2x): data/Map003.json:map-event:151:page:1, data/Map003.json:map-event:242:page:1
	AGH_setWorldMenuSwitch = function (interp) {
		AGH_disableSwitch(380);
		const mapId = $gameMap.mapId();
		if (!$gameSelfSwitches.value([mapId, interp._eventId, 'A'])) AGH_enableSwitch(380);
		if (!$gameSelfSwitches.value([mapId, interp._eventId, 'B'])) AGH_enableSwitch(380);
	};

	// Replaces (2x): data/Map003.json:map-event:133:page:2
	AGH_enableSwitchIfTwoWeaponSlotsActive = function (switchId) {
		const weaponSlotRecords = varValue(327);   // variable 327: 拠点アクティベート記録配列 (per-slot activation records)
		const unlockedWeaponCount = range(1, 100).filter(slotIndex => weaponSlotRecords[slotIndex] >= 1).length;
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
			if (currentMapEvent.meta['MQProgress'] && Number(currentMapEvent.meta['MQProgress']) == questProgressId) {
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
		$gameScreen._particle.particleSet(0, particleName, 'screen', 'def', 'spriteset');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:343
	// Spawns the monster and the magic-circle particle of a spawned-event slot.
	// NOTE: the original re-declared `particleName2` for the second particle — the
	// two names are spelled out here instead.
	AGH_spawnSlotMonsterParticles = function (slotIndex) {
		const particleValue = spawnedEventId(slotIndex);
		const monsterParticle = 'monster_c';
		const magicCircleParticle = 'mahoujin_c';
		particleSet(particleValue, `${monsterParticle}-${particleValue}`, 'this', monsterParticle);
		particleSet(particleValue, `${magicCircleParticle}-${particleValue}`, 'this', magicCircleParticle);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:86, data/CommonEvents.json:common-event:245
	AGH_playScreenParticle = function (particleName, particleDefinitionName, particleDefinition) {
		particlePlay(0, particleName, particleDefinitionName, 'def', particleDefinition);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:87
	AGH_updateScreenParticle = function () {
		particleUpdate(['hStates_bodyShine1', 'emitterLifetime', 1]);
		particleClear('hStates_bodyShine1');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:33:page:1
	AGH_clearScreenParticleAll = function () {
		particleClear('all');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1
	AGH_particleEditParticle = function (particleName) {
		$gameScreen._particle.particleEdit(0, particleName, 'picture:57', 'def', 'above');
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
		[1, 2, 3].forEach(windowId => WindowManager.hide(windowId));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	AGH_hideWindow3 = function () {
		[1, 2].forEach(windowId => WindowManager.hide(windowId));
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
		const pickedIndex = arr.findIndex(poolId => poolId === pickedCharacterId);
		if (pickedIndex >= 0) arr.splice(pickedIndex, 1);
		setSelfVar(interp, 21, arr);
		if (arr == 0) arr = [1, 2, 3, 4, 5];
	};

	// Replaces (1x): data/CommonEvents.json:common-event:5
	AGH_eraseNpcEvents = function () {
		eraseEventsWithMetaKeys(['NPC', '動物', 'Encounter Direction Lock']);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:37
	AGH_eraseNpcEvents2 = function () {
		eraseEventsWithMetaKeys(['NPC', 'Animal', 'Encounter Direction Lock']);
	};

	/* ============================================================================
	 * Messages / windows
	 * ========================================================================== */

	// Replaces (2x): data/CommonEvents.json:common-event:87
	AGH_appendCurrentActorProfileMessage = function (interp) {
		$gameMessage.newPage();
		const actorProfile = currentActor().profile();
		$gameMessage.add(`${instantText()}${actorProfile}`);
		interp.setWaitMode('message');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:87
	AGH_appendCurrentActorProfileMessageFast = function (interp) {
		$gameMessage.newPage();
		const textSpeed0 = textSpeed(0);
		const actorProfile = currentActor().profile();
		$gameMessage.add(`${textSpeed0}${actorProfile}`);
		interp.setWaitMode('message');
	};

	// Replaces (8x): data/CommonEvents.json:common-event:401, :414, :444, ...
	AGH_setMessageRowCount = function (rowCount) {
		$gameMessage.setMessageRow(rowCount);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:23
	AGH_drawWindowText = function () {
		const fontSize22 = fontSize(22);
		const endOfDayInfoText = variableText(539);   // variable 539: 一日終了時情報表示文字列変数
		WindowManager.drawText(1, `${fontSize22}${endOfDayInfoText}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:23
	AGH_drawWindowText2 = function () {
		const fontSize28 = fontSize(28);
		const endOfDayInfoText = variableText(539);   // variable 539: 一日終了時情報表示文字列変数
		WindowManager.drawText(1, `${fontSize28}${endOfDayInfoText}`);
	};

	// Replaces (1x): data/Map003.json:map-event:161:page:1
	AGH_drawWindowText3 = function () {
		WindowManager.drawText(0, '');
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
			setVar(33, 'BB_akunin');
			setVar(35, 3);
			setVar(37, getRandomIndex(3) + 2);
			setVar(34, getRandomIndex(2) + 4);
			map_npcRespawn(1, npcSlotId);
		});
	};

	// Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	AGH_showCoinCounter = function () {
		const coinAmountText = varValue(69).toLocaleString();   // variable 69 (scratch): coin count
		const coinText = `Coin: ${coinAmountText}枚`;
		$gameScreen.setDTextPicture(coinText, 28);
		$gameScreen.dWindowFrame = 'ON';
		showPic(99, '', 640 + 50, 50, 100, 100, 0, 1);
		movePic(99, 640, 50, 100, 100, 255, 60, 1);
	};

	// Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	AGH_showDiceBackground = function () {
		showPic(98, '/img/dice/background', 640 + 50, 384, 100, 100, 0, 1);
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
	AGH_setPicture = function (presetIndex) {
		const presetValues = pic_setArray3;
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
				pan: 0,
			});
		}
	};

	// Replaces (2x): data/CommonEvents.json:common-event:17
	AGH_waitRandomPictureDelay = function (interp) {
		if (valuePicWait >= 1) interp.wait(valuePicWait + getRandomIndex(3));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:17
	AGH_slidePictureInFromRightAndWait = function (interp, duration, AGH_waitFrames) {
		const SLIDE_PICTURE_ID = 55;   // 53 + 2
		movePic(SLIDE_PICTURE_ID, 640 + 50 - 128, 384, 100, 100, 240, duration, 1);
		interp.wait(AGH_waitFrames);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:17
	AGH_slidePictureInFromLeftAndWait = function (interp, duration, AGH_waitFrames) {
		const SLIDE_PICTURE_ID = 55;   // 53 + 2
		movePic(SLIDE_PICTURE_ID, 640 - 50 - 128, 384, 100, 100, 240, duration, 1);
		interp.wait(AGH_waitFrames);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:60
	AGH_setValueTalkSet = function () {
		valueTalkSet = 0;
		valueTalkarr1 = [];
	};

	// Replaces (1x): data/CommonEvents.json:common-event:60
	AGH_setPictureLocationAndMovePicture1 = function (stateId, facePathSuffix, removeStateId) {
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
	AGH_fadePicture1Pic101 = function () {
		showScreenBlackOut(101, valueTalkSet[3]);
		picture_fade1(101, 'fadeIn', valueWipeImg, 60, 5);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:60
	AGH_configurePictureEasing = function () {
		picture_easingConfiguration('easeOutQuad');   // 通常顔グラ演出
	};

	// Replaces (2x): data/CommonEvents.json:common-event:60, data/Map007.json:map-event:4:page:1
	AGH_configurePictureEasing2 = function (easingType) {
		picture_easingConfiguration(easingType);
	};

	// Replaces (1x): data/Map003.json:map-event:3:page:1
	AGH_configurePictureEasing3 = function () {
		picture_easingConfiguration('easeOutQuad');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1
	AGH_configurePictureEasingEaseInOutQuad = function () {
		picture_easingConfiguration('easeInOutQuad');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:61, data/CommonEvents.json:common-event:62
	AGH_startCommonEventFromVariable131 = function (interp, value) {
		// ｺﾓﾝID・変数ID
		setSelfVar(interp, 131, value);
		setSelfVar(interp, 14, 1);
		[121, 122, 123].forEach(variableId => setSelfVar(interp, variableId, 0));
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
		setSelfVar(interp, 14, value);   // パーティ一時解散コモン
		AGH_runCommonEventAsChild(interp, 64);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:530, Map081.json:map-event:3:page:1, Map083.json:map-event:6:page:1
	AGH_startPartyReform = function (interp) {
		setSelfVar(interp, 14, 22);   // パーティ再結成コモン
		AGH_runCommonEventAsChild(interp, 64);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_startPartyDisbandAfterCommonEvent = function (interp) {
		AGH_runCommonEventAsChild(interp, 64);
		setSelfVar(interp, 14, 21);   // パーティ一時解散コモン
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
	AGH_applyMapShockwaveFilter = function (filterName, waveWidth, waveHeight, wavePower, speed, additionalTime) {
		$gameMap.createFilter(filterName, 'shockwave', 0, 'screen');
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
		setSelfVar(interp, 14, value);   // Ｈ効果
		AGH_runCommonEventAsChild(interp, 58);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:120, data/CommonEvents.json:common-event:188, data/CommonEvents.json:common-event:196
	AGH_startEnemyAttackAnimation = function (interp, randomXRange, randomXOffset, randomYRange, randomYOffset, randomSpeedBase) {
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
		AGH_runCommonEventAsChild(interp, 64);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:120, data/CommonEvents.json:common-event:121
	AGH_readBranchResult = function (interp) {
		$result = interp._branch[interp._indent];
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:452
	AGH_showAttachmentTalk = function (interp, value) {
		setSelfVar(interp, 172, value);
		valueTalkSet = [1, 1];   // 1で付与2で直接表示 \CE[60]のみ0で解除, ｱｸﾀｰid
		AGH_runCommonEventAsChild(interp, 60);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:368, :495, :532, :548, Map041.json:map-event:7:page:1, Map083.json:map-event:6:page:1
	AGH_showOneLineTalkText = function (interp, talkLine) {
		// 中央に一言メッセージ, 何行でも良し
		setSelfVar(interp, 23, talkLine);
		const talkLineText = variableText(23);   // variable 23: 乱数汎用3 (here: the one-line talk text)
		showOneLineTalk(interp, 19, [1, 28, `${talkLineText}`, 100]);
	};

	/* ============================================================================
	 * Cut-ins / plugin commands
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:101
	AGH_runPluginCommandCutInCG_EnemyDefeat = function (interp) {
		requestCutIn(interp, '敵カットイン', ['カットインエネミー演出色々', 'CutInCG_EnemyDefeat', 0, 2.0, 2.0, 25, 60]);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:104
	AGH_requestBattleMasturbationCutIn = function (interp) {
		const cutInImageName = `Zev_BattleMasturbation${varValue(CURRENT_ACTOR_VAR)}_1`;
		requestCutIn(interp, '味方カットイン', ['Ｈシーン演出', cutInImageName, 270, 1.5, 1.2, 25, 60]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:104, data/CommonEvents.json:common-event:140
	AGH_prepareAllyCutIn = function (interp, pictureId) {
		prepareCutIn(interp, '味方カットイン', pictureId, varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:140
	AGH_prepareEnemyCutIn = function (interp) {
		prepareCutIn(interp, '敵カットイン', 0, varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:129
	AGH_prepareEnemyCutIn2 = function (interp) {
		prepareCutIn(interp, '敵カットイン', 8, varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (2x): data/Map003.json:map-event:81:page:1, data/Map003.json:map-event:82:page:1
	AGH_prepareAllyCutIn2 = function (interp) {
		prepareCutIn(interp, '味方カットイン', 7, varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:138
	AGH_prepareAllyCutInWithAbilityKind = function (interp) {
		setVar(182, 13);
		prepareCutIn(interp, '味方カットイン', 1, varValue(CURRENT_ACTOR_VAR));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:138
	AGH_prepareCutInForSlotWithAbilityKind = function (interp, cutInSlotId) {
		setVar(182, 13);
		prepareCutIn(interp, '味方カットイン', 1, cutInSlotId);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:64
	AGH_runPluginCommandShowInfo = function (interp) {
		runShowInfoPlugin(interp, 'パーティが再集合されました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:64
	AGH_runPluginCommandShowInfo2 = function (interp) {
		runShowInfoPlugin(interp, 'パーティが一時解散されました');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:73
	AGH_runPluginCommandShowInfo3 = function (interp) {
		const autosaveFileName = variableText(509);   // variable 509: [NoReset]オートセーブ指定変数
		runShowInfoPlugin(interp, `ファイル${autosaveFileName}にオートセーブしました`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:73
	AGH_runPluginCommandShowInfo4 = function (interp) {
		runShowInfoPlugin(interp, 'ファイル51にオートセーブしました');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_runPluginCommandFadeImg = function (interp, imageName) {
		callPluginCommand(interp, 'GWTrans_Setting', 'FadeImg', imageName);
		callPluginCommand(interp, 'GWTrans_Setting', 'FadeInImg', imageName);
		callPluginCommand(interp, 'GWTransition', 'on');
	};

	// Replaces (3x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1, data/Map007.json:map-event:17:page:1
	AGH_runPluginCommand153 = function (interp) {
		// 一刀両断102崩壊161横両断008封印054内側から153
		callPluginCommand(interp, 'GWFade', 'character', '0', 'fadeOut', '153', '180', '5');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_runPluginCommand = function (interp) {
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
		if (boss.isStateAffected(410) && boss.isAlive() && !boss.isRestricted()) {
			AGH_enableSwitch(470);
			boss_actionPattarn1(boss);
			AGH_disableSwitch(470);
		}
	};

	// Replaces (2x): data/CommonEvents.json:common-event:105, data/CommonEvents.json:common-event:122
	AGH_countDefeatedEnemyForDungeonItem = function (defeatCountVariableId) {
		const dungeonInfoItemId = varValue(240);   // variable 240: ダンジョン毎情報アイテム指定変数
		if (dungeonInfoItemId >= 1) varValue(defeatCountVariableId)[dungeonInfoItemId] += 1;
	};

	// Replaces (2x): data/CommonEvents.json:common-event:109
	AGH_resetEnemyMoveArray = function () {
		const enemyMovePosition = varValue(703);   // variable 703: 拘束時敵移動一時配列
		if (!$dataSystem.optSideView) return;
		if (enemyMovePosition == 0) return;
		// TODO: original bug — 92/703 are not documented arrays; kept verbatim.
		$gameTroop.set(varValue(92) + 1, enemyMovePosition[0], enemyMovePosition[1], 30);
		setVar(703, 0);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:110, data/Map003.json:map-event:218:page:2
	AGH_grantHExp1AndGrantHExp1Extra = function (interp, vaginalExp, analExp, fellatioExp, affectionExp, inseminationCount) {
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
	AGH_forceMoveRouteFromArgs = function (interp) {
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
	AGH_forceMoveRouteFromViewpointArgs = function (interp) {
		interp.character(-1).forceMoveRoute({
			list: [
				{ code: 41, parameters: [`${varValue(11)}_${varValue(21)}`, varValue(22)] },
				{ code: 38 }, { code: 29, parameters: [4] }, { code: 31 }, { code: 33 }, { code: 0 },
			],
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:259
	AGH_forceMoveRouteForSpawnedEvent = function (eventSlotIndex, moveRouteScript) {
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
	AGH_forceTwoMoveRoutesForSpawnedEvent = function (firstMoveRouteScript, secondMoveRouteScript) {
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
	AGH_forceMoveRouteForSpawnedEventRange = function (firstSlotIndex, lastSlotIndex, moveRouteScript) {
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
	AGH_loadCostumeSlotsFromPartyStat = function () {
		// 現在衣装を呼び出し
		forEachCostumeSlot(slotIndex => {
			setVar(slotIndex + 460, varValue(varValue(CURRENT_ACTOR_VAR) + 440)[slotIndex]);
		});
	};

	// Replaces (3x): data/CommonEvents.json:common-event:106, :111, :112
	AGH_loadPartyStatBlock = function (interp) {
		// 一時代入した仮情報を立ち絵指定後に反映
		forEachCostumeSlot(slotIndex => {
			if (varValue(slotIndex + 560) >= 1) setSelfVar(interp, slotIndex + 460, varValue(slotIndex + 560));
		});
	};

	// Replaces (3x): data/CommonEvents.json:common-event:106, :111, :112
	AGH_saveCostumeSlotsToPartyStat = function () {
		// 衣装情報を更新
		forEachCostumeSlot(slotIndex => {
			varValue(varValue(CURRENT_ACTOR_VAR) + 440)[slotIndex] = varValue(slotIndex + 460);
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:167
	// Class-2 twin of `AGH_saveCostumeSlotsToPartyStat` above — same slot copy, folded into it.
	AGH_saveCostumeSlotsToPartyStat2 = AGH_saveCostumeSlotsToPartyStat;

	// Replaces (2x): data/CommonEvents.json:common-event:167
	AGH_resetCostumeSlotVariables = function () {
		// 現在衣装を初期化
		forEachCostumeSlot(slotIndex => {
			if (slotIndex != 4) setVar(slotIndex + 460, 0);
		});
	};

	// Replaces (3x): data/CommonEvents.json:common-event:167
	AGH_recordCostumeClothTotal = function () {
		const currentActorId = varValue(CURRENT_ACTOR_VAR);
		varValue(currentActorId + 440)[41] = Number($dataItems[varValue(19)].meta['TotalCloth']);
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
		const exposureValue = varValue(currentActorId + 380)[4];   // 380+actorId slot 4: exposure value
		const exposureLimit = varValue(currentActorId + 380)[5];   // 380+actorId slot 5: exposure limit
		setSelfVar(interp, 519,
			`${actorName}　${costumeStatusIcon}:` +
			`${exposureValue}` +
			`(${exposureLimit})\n`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:256
	AGH_setWeaponNameOrNone = function (weaponSlotIndex, hasWeaponSwitchId, weaponNameVariableId, weaponIndex, noWeaponSwitchId, noWeaponVariableId) {
		if (varValue(varValue(CURRENT_ACTOR_VAR) + 380)[weaponSlotIndex] != 0) {
			AGH_enableSwitch(hasWeaponSwitchId);
			setVar(weaponNameVariableId, $dataWeapons[varValue(varValue(CURRENT_ACTOR_VAR) + 380)[weaponIndex]].name);
		} else {
			AGH_disableSwitch(noWeaponSwitchId);
			setVar(noWeaponVariableId, 'なし');
		}
	};

	// Replaces (2x): data/CommonEvents.json:common-event:256
	AGH_clearWeaponSlot = function (weaponSlotIndex) {
		varValue(varValue(CURRENT_ACTOR_VAR) + 380)[weaponSlotIndex] = 0;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:205
	AGH_setWeaponUnique = function (interp) {
		forEachHeroine(heroineId => {
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
		const weaponNoteText = variableText(801);   // variable 801: 文字等代入一時変数820まで (the weapon note)
		WindowManager.drawText(0, `${weaponIcon}\n${weaponNoteText}\n※付与効果は強化の度に選択/追加されていきます。`);
	};

	/* ============================================================================
	 * Battle log / popups
	 * ========================================================================== */

	// Replaces (3x): data/CommonEvents.json:common-event:106, data/CommonEvents.json:common-event:109
	AGH_pushBoundBattleLog = function () {
		pushActorBattleLog('は拘束された！');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:109
	AGH_pushAttackedBattleLog = function () {
		pushActorBattleLog('は襲い掛かられた！');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:109
	AGH_pushEscapedBattleLog = function () {
		pushActorBattleLog('は拘束から逃れた！');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:110
	AGH_pushAssaultedBattleLog = function () {
		pushActorBattleLog('は犯されている…。');
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
		if (!$gameSwitches.value(233)) return;   // 教会
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
		[11, 12].forEach(slotIndex => {
			$gameMap.eraseEvent(spawnedEventId(slotIndex));
			varValue(SPAWNED_EVENT_TABLE_VAR)[slotIndex] = 0;
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:297, data/CommonEvents.json:common-event:400
	AGH_eraseAllSpawnedEvents = function (interp) {
		varValue(SPAWNED_EVENT_TABLE_VAR).forEach(spawnedId => {
			if (spawnedId && $gameMap.event(spawnedId)) $gameMap.eraseEvent(spawnedId);
		});
	};

	// Replaces (2x): data/Map003.json:map-event:235:page:1, data/Map018.json:map-event:39:page:1
	AGH_eraseAllSpawnedEventsOutOfBattle = function () {
		varValue(SPAWNED_EVENT_TABLE_VAR).forEach(spawnedId => {
			if (spawnedId >= 1 && $gameMap.event(spawnedId) && !$gameParty.inBattle()) {
				$gameMap.eraseEvent(spawnedId);
			}
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
	AGH_hideEarlySpawnedEvents = function () {
		range(12, 17).forEach(slotIndex => {
			const spawnedId = spawnedEventId(slotIndex);
			const mapEvent = $gameMap.event(spawnedId);
			if (mapEvent) mapEvent.setTransparent(true);
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:358, data/CommonEvents.json:common-event:361
	AGH_setFacesForSpawnedEvents = function (lastSlotIndex) {
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
		event_togetherSelf(interp._eventId, 'B');
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
		const evSceneSet = $gameMap.event(interp._eventId).event().meta['EvSceneSet'];
		if (!evSceneSet) return;
		event_pararelStarting(1, Number(evSceneSet.split(',')[0]), interp._eventId);
	};

	// Replaces (5x): data/Map003.json:map-event:179:page:1, ... Map144.json:map-event:12:page:1
	AGH_presetEventCharacterAndRootEventCharacter = function (interp) {
		valueBossId = interp._eventId;
		event_charaPreset(interp._eventId);
		event_charaRoot(interp._eventId);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:292, :301, :343
	AGH_setInterpreterWaitMode = function (interp) {
		interp.setWaitMode('scroll');
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
		respawnNpcFacing(11, 13, 22, 0, 'People3', 6, 8);
		respawnNpcFacing(12, posX, 23, 0, 'People3', 7, 8);
		respawnNpcFacing(13, posX2, 23, 0, 'People3', 7, 8);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:322, data/CommonEvents.json:common-event:354
	AGH_respawnVillainNpc = function () {
		const spawnedNpc = respawnNpcFacing(11, 27, 8, 0, 'BB_akunin3', 5, 2);
		spawnedNpc._spriteOffsetY = -10;
	};

	// Replaces (3x): data/CommonEvents.json:common-event:322, :354, :358
	AGH_respawnVillainNpcsFromTable = function () {
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
	AGH_respawnNpcFromArgs = function (posX, posY, imageName, imageIndex, direction) {
		respawnNpcFacing(11, posX, posY, 0, imageName, imageIndex, direction);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:300, data/CommonEvents.json:common-event:301
	AGH_respawnAirshipNpc = function (interp) {
		event_respawnSetN(11, 25, 7, 0, '$airship02', 0);
		const spawnedNpc = spawnedEvent(11);
		interp._eventId = spawnedEventId(11);
		spawnedNpc.setDirection(4);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:536, data/CommonEvents.json:common-event:537
	AGH_respawnRandomNpcs = function (slotIndex, posX, posY, direction, slotIndex2, posX2, posY2, direction2, slotIndex3, posX3, posY3, direction3) {
		const placeRandomNpc = (slot, x, y, faceDirection) => {
			event_respawnSetN(slot, x, y, 0, 'npc' + (getRandomIndex(6) + 1), getRandomIndex(7), faceDirection);
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
		goodsEvent_respawn(GOODS_SLOT_INDEX, 'food_2', 4, 2, 0, quantity, priceOrFlag);
		spawnedEvent(GOODS_SLOT_INDEX)._priorityType = 2;
	};

	// Replaces (2x): data/Map003.json:map-event:157:page:1, data/Map165.json:map-event:12:page:1
	AGH_setupPopEnemy = function () {
		popEnemy_setUp($dataItems[varValue(240)]);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:292, :304, :314, :316
	AGH_respawnNpcGoods9 = function (interp, selfSwitchKey, posX, posY) {
		mapSelfSwitchOn(selfSwitchKey, 'A');
		event_respawnSetN(11, posX, posY, 0, 'Goods9', 0, 2);
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
	AGH_respawnUniqueNpcAtSlot = function (interp, slotIndex, posX, zoomFlag, imageIndex, direction, referenceSlotIndex) {
		event_respawnSetN(slotIndex, posX, 12, zoomFlag, 'npcUnique3', imageIndex, direction);
		interp._eventId = spawnedEventId(referenceSlotIndex);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:383, :384, :528
	AGH_initLeadActorAndRespawn = function (interp, posX, posX2) {
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
	AGH_showScenePictureAndFadeIn = function (scenePicName) {
		let picId = 55
		valuePic1 = picId;
		valueScenePic = scenePicName;
		showScenePicture(picId, valueScenePic, { y: 384 - 20 });
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
		AGH_showScenePictureAndFadeIn3(3, '03', 100, 100);
		AGH_showScenePictureAndFadeIn3(4, '04', 100, 100);
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
		showScenePicture(50, valueScenePic + '02');
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
		picture_fade1(valuePic1, 'fadeIn', '150', 60, 5);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:406, :496, :516, :517, :518, :519
	AGH_fadePicture1FadeIn_2 = function (opacity) {
		showPic(valuePic1, valueScenePic + '00', 640 - 128, 384, 100, 100, opacity, 1);
		picture_fade1(valuePic1, 'fadeIn', valueWipeImg, 60, 5);
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
		const pictureId = valuePic1 + 1;   // 非表示状態
		showBlessedPicture(pictureId, valueScenePic + '01', { y: 384 + 50, animate: false, blessType });
	};

	// Replaces (5x): data/CommonEvents.json:common-event:496, :516, :517, :518, :519
	AGH_blessStandingPicture3 = function (picIndex, picIndex2, yOffset) {
		showBlessedPicture(valuePic1 + picIndex, valueScenePic + picIndex2, { y: 384 + yOffset });
	};

	// Replaces (2x): data/CommonEvents.json:common-event:496
	AGH_blessStandingPicture4 = function () {
		const pictureId = valuePic1 + 10;
		showBlessedPicture(pictureId, valueScenePic + '21', { x: 640 - 128 + 50, animate: false });
	};

	// Replaces (3x): data/CommonEvents.json:common-event:517, :518, :519
	AGH_blessStandingPicture5 = function () {
		const pictureId = valuePic1 + 10;
		showBlessedPicture(pictureId, valueScenePic + '21', { x: 640 - 128 + 50 });
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
		showBlessedPicture(valuePic2 + picIndex, valueScenePic + picIndex2, { x: 640 + 480 + 50, toX: 640 + 480 });
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
	AGH_blessStandingPictureAndMovePicture1_2 = function (picIndex, picIndex2, scaleX, scaleY, duration, blessType, previousPicIndex, AGH_waitFrames) {
		const pictureId = valuePic1 + picIndex;
		showBlessedPicture(pictureId, valueScenePic + picIndex2, {
			scaleX, scaleY, duration, blessType,
			slidePreviousId: valuePic1 + previousPicIndex, slideFrames: AGH_waitFrames,
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
			x: 640 + 480, y: 384 - 118, opacity: 200,
			toX: 640 + 480, toY: 384 + 50, duration: 240,
			slidePreviousId: pictureId - 1,
		});
	};

	// Replaces (3x): data/CommonEvents.json:common-event:517, :518, :519
	AGH_blessStandingPictureAndPlayPictureSe1 = function () {
		const pictureId = valuePic1 + 2;
		showBlessedPicture(pictureId, valueScenePic + '02', { scaleX: 300, scaleY: 300 });
		picture_se1();
	};

	// Replaces (5x): data/CommonEvents.json:common-event:368, :412, :495, :532, :548
	AGH_blessStandingPictureAndPlayHcgPiston = function () {
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
	AGH_fadeInFrameAndBlessStandingPicture = function () {
		const framePictureId = valuePic2;
		const framePictureName = 'Screen1024Frame';   // 1024ピク表示の際のフレーム枠
		showPic(framePictureId, framePictureName, 640 - 78, 384, 100, 100, 255, 1);
		picture_fade1(framePictureId, 'fadeIn', valueWipeImg, 60, 5);
		tachie_bless(value1, 5);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:64
	// Slides the seven scene pictures (ids 101..107) to the left edge.
	AGH_slideScenePicturesAway = function () {
		range(1, 7).forEach(pictureIndex => pic_move1(100 + pictureIndex, 0, 30, -500, 0));
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
		showPic(100, 'ScreenBlackOut', 640, 384, 100, 100, 0, 1);
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
		showPic(100, 'ScreenFoundationChoice', 0 + 300, 0, 100, 100, 0, 0);
		movePic(100, 0, 0, 100, 100, 255, 120, 0);
		showPic(99, choicePictureName, 300 + 20, 0, 200, 200, 0, 0);
		movePic(99, 300, 0, 200, 200, 255, 120, 0);
		fadeInScreenBlackOut(98, 150);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:92, Map007.json:map-event:4:page:1, Map007.json:map-event:6:page:1
	AGH_fadePicture1FadeOut = function () {
		picture_fade1(51, 'fadeOut', 'Hscene005', 300, 5);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/Map094.json:map-event:45:page:1
	AGH_fadePicture1FadeOut_2 = function (actorPictureId) {
		valuePic1 = actorPictureId;
		picture_fade1(valuePic1, 'fadeOut', valueWipeImg, 60, 5);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:292, :335, :337
	AGH_fadePicture1ZX_Main034_ = function () {
		valuePic1 = 55;
		valueScenePic = 'ZX_Main034_';
		showPic(valuePic1, valueScenePic + '01', 640, 384, 100, 100, 0, 1);
		movePic(valuePic1, 640, 384, 100, 100, 255, 60, 1);
		picture_fade1(valuePic1, 'fadeIn', valueWipeImg, 60, 5);
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
		$gameScreen.setPicturesAnimation(3, 2, '連番', 5);
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
		range(0, 3).forEach(offset => movePic(PICTURE_ROW_FIRST_ID + offset, 640, 384, 100, 0, 0, 30, 1));
		interp.wait(40);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_erasePictureRow = function () {
		const PICTURE_ROW_FIRST_ID = 55;
		range(0, 3).forEach(offset => $gameScreen.erasePicture(PICTURE_ROW_FIRST_ID + offset));
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:471
	AGH_erasePictureP4 = function () {
		valuePic1 = 55;
		range(0, 3).forEach(offset => pic_eraseP(1, [valuePic1 + offset]));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:109, data/CommonEvents.json:common-event:110
	AGH_erasePictureP2 = function () {
		pic_eraseP(0, [121, 122, 123, 124, 125, 126, 127, 128, 129, 130]);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:210, data/CommonEvents.json:common-event:259
	AGH_erasePictureP3 = function (firstPictureId) {
		const existingPictureIds = range(firstPictureId, 200).filter(pictureId => $gameScreen.picture(pictureId));
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
		showPic(pictureId, valueScenePic + '12', 640 - 128, 384, 100, 100, 200, 1);
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
		showPic(pictureId, valueScenePic + '02', 640, 384, 100, 100, 255, 1);
		pic_setArray1 = [1, pictureId, 0, -30, 0, 20];
		pic_setArray2 = [1, pictureId, 0, 0, 3, 30];
		valueParallelPicSe1 = ['ZH_sticky4', 20, 60];
		valueParallelPicSe2 = ['ZH_sticky4', 20, 60];
		hcg_piston(pictureId, 7, 2, 1);
		AGH_enableSwitch(429);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:541, data/CommonEvents.json:common-event:543
	AGH_playHcgPistonSwitch429_2 = function (picIndex, picIndex2, seVolume, pictureId) {
		pic_setArray1 = [1, valuePic1 + picIndex, 0, -15, 0, 20];
		pic_setArray2 = [1, valuePic1 + picIndex2, 0, 0, 3, 30];
		valueParallelPicSe1 = ['ZH_sticky4', seVolume, 10];
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
		adv_partDirectSet(1);   // ピストンの時
	};

	// Replaces (2x): data/CommonEvents.json:common-event:338, data/CommonEvents.json:common-event:536
	AGH_startPictureAnimationFrame = function (frameId) {
		const pictureId = valuePic1;
		if ($gameScreen.picture(pictureId)) {
			$gameScreen.picture(pictureId).startAnimationFrame(frameId, true, [1, 1, 1, 2]);
		}
	};

	// Replaces (3x): data/CommonEvents.json:common-event:543, :572, :573
	AGH_startPictureAnimationFrame2 = function (picIndex) {
		const pictureId = valuePic1 + picIndex;
		if ($gameScreen.picture(pictureId)) {
			$gameScreen.picture(pictureId).startAnimationFrame(1, true, [1, 1, 1, 2]);
		}
	};

	// Replaces (2x): data/CommonEvents.json:common-event:338
	AGH_playStandingPictureAction = function (interp, expressionCode) {
		tachie_dousa(2, 1, expressionCode, 15, 1, 255, 1344, 0, 0);
		tachie_dousa(1, 1, 4, 15, 1, 255, 0, 0, 0);
		interp.wait(3);
	};

	// Replaces (11x): data/CommonEvents.json:common-event:368, :410, :495, :532, :536, :548, ...
	AGH_setStandingPictureActionZ_ClothesTakeOff = function (expressionCode, targetPicId, sourcePicId, showCostumeId) {
		tachie_dousa(0, 1, expressionCode, targetPicId, sourcePicId, showCostumeId, 120, 0, 0);
		AGH_playSeEffectZ_ClothesTakeOff();
	};

	// Replaces (4x): data/CommonEvents.json:common-event:292, :329, Map007.json:map-event:23:page:1
	AGH_playSeEffectZ_ClothesTakeOff = function () {
		const SE_NAME = 'Z_ClothesTakeOff';   // ピッチ50か100。消去ウェイトで変更
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
	AGH_assignSelfVariableValue2 = AGH_assignSelfVariableValue;   // identical helper, kept under its original name

	// Replaces (7x): data/CommonEvents.json:common-event:313, :322, :326, :338, :339, :355, ...
	AGH_setSelfVariableLine = function (interp, line) {
		setSelfVar(interp, 23, line);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:536
	AGH_setHStatSummaryLine = function (interp) {
		const actorHStatArray = varValue(381);   // variable 381: アクター1Ｈステ配列
		const hStatValue56 = actorHStatArray[56];   // 381 slot 56 — no name in System.json
		const hStatValue53 = actorHStatArray[53];   // 381 slot 53 — no name in System.json
		setSelfVar(interp, 23, `${hStatValue56}の${hStatValue53}`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:158
	AGH_allowUnrestrictedExposure = function (interp) {
		setSelfVar(interp, 207, 101);   // 露出縛りなし
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
		setSelfVar(interp, 23,
			`${actorName3}＆${actorName4}＆${actorName5}`);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:90
	AGH_clearSelfVariableCharacterPool = function (interp) {
		setSelfVar(interp, 21, '');
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_initSelfVariableCharacterPool = function (interp) {
		const sharedPoolArray = varValue(21);   // variable 21: 乱数汎用1 (the shared character pool)
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
		setVar(537, []);   // エネミー
		setVar(538, []);   // Hエネミー
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
	AGH_setEscapeMapPosition = function () {
		const homePosition = $dataWeapons[varValue(19)].meta['HomePosition'].split(',');
		const homePositionYOffset = Number(homePosition[3]) == 0 ? 1 : -1;
		setVar(161, [Number(homePosition[0]), Number(homePosition[1]) + homePositionYOffset, Number(homePosition[2])]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:201, data/CommonEvents.json:common-event:202
	AGH_countDefeatedEnemyAndSetEscapeMap = function () {
		const dungeonInfoItemId = varValue(240);   // variable 240: ダンジョン毎情報アイテム指定変数
		let escapeMapPosition;
		if (dungeonInfoItemId >= 1) {
			escapeMapPosition = $dataItems[dungeonInfoItemId].meta['EscapeMapID'].split(',');
			setVar(161, [Number(escapeMapPosition[0]), Number(escapeMapPosition[1]), Number(escapeMapPosition[2])]);
		} else {
			setVar(161, [14, 26, 7]);
		}
		if (Number(escapeMapPosition[0]) != $gameMap.mapId()) {
			AGH_disableSwitch(140);   // マップ最初の処理終了スイッチ
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
		const currentBetRate = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
		$gameSelfSwitches.setVariableValue([$gameMap.mapId(), interp._eventId, 10], nextBetRateByCurrentRate[currentBetRate]);
	};

	// Replaces (3x): data/Map003.json:map-event:141:page:1, data/Map003.json:map-event:247:page:1, data/Map007.json:map-event:53:page:1
	AGH_setValueBetCoinlist = function (interp) {
		AGH_cycleBetRateSelfSwitchTo10(interp);
		valueBetCoinlist = [10];   // ポーカー用ベットレート
	};

	// Replaces (3x): data/Map003.json:map-event:141:page:1, data/Map003.json:map-event:247:page:1, data/Map007.json:map-event:53:page:1
	AGH_setValueBetCoinlist2 = function (interp) {
		const nextBetRateByCurrentRate = { 10: 100, 100: 1000, 1000: 10000, 10000: 10 };
		const currentBetRate = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), interp._eventId, 10]);
		const nextBetRate = nextBetRateByCurrentRate[currentBetRate];
		$gameSelfSwitches.setVariableValue([$gameMap.mapId(), interp._eventId, 10], nextBetRate);
		valueBetCoinlist = [nextBetRate];
	};

	// Replaces (2x): data/Map003.json:map-event:142:page:1
	AGH_setValueMenuBackOpacity = function (opacity) {
		valueMenuBackOpacity = opacity;
	};

	// Replaces (2x): data/Map003.json:map-event:139:page:1, data/Map003.json:map-event:140:page:1
	AGH_showCongratulationsAndCoinsInfo = function (interp) {
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
	AGH_selectEnemyDrop = function () {
		enemy_dropSelection($gameActors.actor(20));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:176
	AGH_addCustomChoice = function () {
		$gameSystem.addCustomChoice(1, { text: '未指定', value: 0 });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:259
	AGH_addCustomChoice2 = function () {
		const fontSize20 = fontSize(20);
		const skipCutsceneChoiceText = $dataSystem.switches[430];
		const fontSize28 = fontSize(28);
		$gameSystem.addCustomChoice(1, { text: `${fontSize20}${skipCutsceneChoiceText}${fontSize28}`, value: 99 });
	};

	// Replaces (1x): data/Map003.json:map-event:83:page:1
	AGH_addCustomChoiceWithText = function () {
		const customChoiceText = varValue(22);   // variable 22: 乱数汎用2 (here: the choice text)
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
		range(firstItemId, lastItemId).forEach(itemId => {
			const item = $dataItems[itemId];
			if (item.name !== '') $gameParty.gainItem(item, 15);
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	AGH_useItemBulk = function () {
		valueCountSet1 = 0;
		valueIkkatuArray = [];
		[0, 1, 2].forEach(itemCategoryId => item_ikkatu(itemCategoryId));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	AGH_setValueIkkatuArray = function () {
		valueIkkatuArray = [];
	};

	// Replaces (2x): data/CommonEvents.json:common-event:175, data/CommonEvents.json:common-event:180
	AGH_setValueCountSet2_4 = function () {
		valueCountSet2 = valueIkkatuArray.length;
		valueCountSet3 = 0;   // +1で件数合計
		valueCountSet4 = 0;   // 個数累計
		valueCountSet5 = 0;   // 金額合計
		valueCountSet6 = 0;   // 変数57合計
		valueCountSet7 = 0;   // ｱｲﾃﾑID270合計
	};

	// Replaces (2x): data/CommonEvents.json:common-event:176
	AGH_countTrainingDummyHits = function (maxValue) {
		const trainingDummyCounts = varValue(293);   // variable 293: 訓練人形事前設定配列
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
		$dataSkills[26].name = '持ち上げ＜OFF＞';
	};

	/* ============================================================================
	 * Actor names (receptionists / shop keepers / NPCs)
	 * ========================================================================== */

	// Replaces (1x): data/CommonEvents.json:common-event:192
	AGH_setInformationBrokerNpcName = function () {
		setNpcIdentity(21, '情報屋');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:239
	AGH_setAppraisalShopNpcName = function () {
		setNpcIdentity(21, '鑑定屋');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:305
	AGH_setGuildBranchReceptionistNpcName = function () {
		const weaponName76 = $dataWeapons[76].name;
		const weaponName22 = $dataWeapons[22].name;
		setNpcIdentity(21, `受付嬢${braceRight()} ${weaponName76} ${weaponName22}支部${braceLeft()}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:511, data/Map094.json:map-event:45:page:1
	AGH_setGuildCounterNpcName = function () {
		const weaponName70 = $dataWeapons[70].name;
		setNpcIdentity(22, `受付${braceRight()} ${weaponName70}${braceLeft()}`);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:401
	AGH_setNpcNameFromActorInitial = function (nameVariableActorId) {
		$gameActors.actor(22).setName($gameActors.actor(nameVariableActorId).name().slice(0, 1));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:236
	AGH_setBunnyGirlNpcName = function () {
		setNpcIdentity(20, 'バニーさん', $dataWeapons[433].name);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:242, data/Map094.json:map-event:32:page:1
	AGH_setCounterClerkNpcName = function (subtitle) {
		setNpcIdentity(20, '受付', subtitle);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:246
	AGH_setTurtleExperienceClownNpcName = function () {
		setNpcIdentity(20, 'ピエロ', 'タートル・エクスペリエンス社');
	};

	// Replaces (2x): data/CommonEvents.json:common-event:308, data/CommonEvents.json:common-event:355
	AGH_setBossGoblinNpcName = function () {
		setNpcIdentity(20, 'ボスゴブリン', $dataSystem.switches[248]);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:390, data/CommonEvents.json:common-event:576
	AGH_setInnLandladyNpcName = function () {
		setNpcIdentity(20, '女将', $dataWeapons[434].name);
	};

	// Replaces (2x): data/Map003.json:map-event:155:page:1, data/Map022.json:map-event:6:page:1
	AGH_setGuildReceptionistNpcName = function () {
		const weaponName76 = $dataWeapons[76].name;
		const weaponName22 = $dataWeapons[22].name;
		setNpcIdentity(20, '受付嬢', `${weaponName76}${weaponName22}支部`);
	};

	// Replaces (1x): data/Map003.json:map-event:164:page:1
	AGH_setGuildShopClerkNpcName = function () {
		const weaponName402 = $dataWeapons[402].name;
		setNpcIdentity(20, '販売員', `${weaponName402}ギルド出張所`);
	};

	// Replaces (4x): data/Map003.json:map-event:188:page:1, data/Map024.json:map-event:2:page:1, ...
	AGH_setGuildPriestNpcName = function () {
		const weaponName77 = $dataWeapons[77].name;
		const weaponName22 = $dataWeapons[22].name;
		setNpcIdentity(20, '神官', `${weaponName77}${weaponName22}支部`);
	};

	// Replaces (2x): data/Map003.json:map-event:229:page:1, data/Map023.json:map-event:3:page:1
	AGH_setBlacksmithNpcName = function () {
		setNpcIdentity(20, '鍛冶師', $dataWeapons[401].name);
	};

	// Replaces (2x): data/Map003.json:map-event:230:page:1, data/Map021.json:map-event:10:page:1
	AGH_setAppraiserNpcName = function () {
		setNpcIdentity(20, '鑑定師', $dataWeapons[403].name);
	};

	// Replaces (2x): data/Map003.json:map-event:233:page:1, data/Map022.json:map-event:9:page:1
	AGH_setAlchemistNpcName = function () {
		setNpcIdentity(20, '錬金術師', '流れの錬金術師');
	};

	// Replaces (1x): data/Map018.json:map-event:27:page:1
	AGH_setVillageWomanNpcName = function () {
		setNpcIdentity(20, 'おばさん', 'ネルガド住民');
	};

	// Replaces (1x): data/Map018.json:map-event:28:page:1
	AGH_setVillageGirlNpcName = function () {
		setNpcIdentity(20, 'お姉さん', 'ネルガド住民');
	};

	// Replaces (1x): data/Map022.json:map-event:3:page:1
	AGH_setShopClerkNpcName = function () {
		setNpcIdentity(20, '販売員', $dataWeapons[402].name);
	};

	// Replaces (1x): data/Map048.json:map-event:3:page:1
	AGH_setGuildBranchClerkNpcName = function () {
		const weaponName76 = $dataWeapons[76].name;
		const weaponName41 = $dataWeapons[41].name;
		setNpcIdentity(20, '受付', `${weaponName76}${weaponName41}支部`);
	};

	// Replaces (1x): data/Map003.json:map-event:237:page:1
	AGH_setInnReceptionistNpcNameAndDialogue = function () {
		setNpcIdentity(20, '宿受付', $dataWeapons[421].name);
		valueCountSet1 = 1231;
		valueCountSet2 = 1232;
		const innPriceText = variableText(21);   // variable 21: 乱数汎用1 (here: the nightly price)
		setVar(23, `「いらっしゃい。\nウチは一泊${innPriceText}${goldIcon()}よ。\n泊まっていくのかしら？」\n`);
		setVar(22, '$FACE[People4, 5]');
	};

	// Replaces (1x): data/Map046.json:map-event:4:page:1
	AGH_setInnLandladyNpcNameAndDialogue = function () {
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
		const picId = 13;
		valuePic1 = picId;
		if (!valuePic){
			console.warn(`AGH_moveStandingPicture1_2: valuePic1 is undefined`);
		}

		const pictureScaleX = $gameScreen.picture(picId).scaleX();
		picTachie_move1(picId, 0, 0, -pictureScaleX * 2, 0, 255, 60);
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
		setVar(256, 11);   // 火事
		map_weatherSet2();
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301
	AGH_setMapWeatherFromArgs = function (weatherType) {
		setVar(256, weatherType);   // 本降り
		map_weatherSet2();
	};

	// Replaces (7x): data/CommonEvents.json:common-event:368, :409, :412, :414, :495, :532, ...
	AGH_selectMapMusicAndSelectMapParallax = function () {
		setMap_musicSelect(1, 22, 0);       // 種別, id, 0屋内1屋外
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
		backGraund_menuMapSelect(2, 'Dungeon1_2', 0, 0);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:410
	AGH_selectMenuMapBackground = function (mapBackgroundName) {
		backGraund_menuMapSelect(2, mapBackgroundName, 0, 0);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:516, :517, :518, :519
	AGH_selectMenuMapBackgroundDungeon1_2 = function () {
		backGraund_menuMapSelect(2, 'Dungeon1_2', 0, 0);
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
		playPitchVariableSe('鼓動');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:62
	AGH_playHeartbeatSeAlt = function () {
		playPitchVariableSe('Z_HeartBeat');
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
		moveSpawnedEvents(45, 'this.requestBalloon(1);', slotIndexes);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:327, :332, :349
	AGH_movePartyCharacter = function (moveRouteCode) {
		event_partyCharaMove(moveRouteCode, 0);   // 19上を向く
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
	AGH_applyAfterimageType20 = function (interp) {
		const AFTERIMAGE_TYPE = 20;
		event_charaZanzou(interp._eventId, AFTERIMAGE_TYPE);
		interp._eventId = spawnedEventId(AFTERIMAGE_TYPE);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:300, data/Map007.json:map-event:3:page:1
	AGH_applyAfterimageType19 = function (interp) {
		const AFTERIMAGE_TYPE = 19;
		event_charaZanzou(interp._eventId, AFTERIMAGE_TYPE);
		interp._eventId = spawnedEventId(AFTERIMAGE_TYPE);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:318, :326, :333
	AGH_requestAnimationOnSpawnedEvent12 = function () {
		spawnedEvent(12).requestAnimation(635);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:124
	AGH_turnOnSelfSwitchD = function () {
		selfSwitchOn(varValue(52), varValue(223), 'D');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	AGH_speakSpawnedEventShoutOneLiner = function () {
		speakOneLiner(null, 100, 'オラァッ！！', { eventId: spawnedEventId(11), fontWeight: 120 });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	AGH_speakSpawnedEventGaspOneLiner = function () {
		speakOneLiner(null, 100, 'ガハッッ！？', { eventId: spawnedEventId(5), fontWeight: 120 });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	AGH_speakSpawnedEventHmphOneLiner = function () {
		speakOneLiner(null, 100, 'フンッ！', { eventId: spawnedEventId(11) });
	};

	// Replaces (3x): data/CommonEvents.json:common-event:356
	AGH_speakLeadActorRustleOneLiner = function (interp, eventSlotIndex, pictureId) {
		const spawnedId = spawnedEventId(eventSlotIndex);
		interp._eventId = spawnedId;
		speakOneLiner(interp, pictureId, 'ガサゴソ──', {
			yOffsets: [-10], eventId: spawnedId, fontWeight: 180,
		});
	};

	// Replaces (1x): data/CommonEvents.json:common-event:234
	AGH_speakBlessingOneLiner = function (interp) {
		speakOneLiner(interp, 100, '親愛なる隣人の旅路に祝福を──', { fontSize: 28, fontWeight: 240 });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:338
	AGH_speakGulpOneLiner = function (interp) {
		speakOneLiner(interp, 100, 'ゴクゴクっ──', { fontWeight: 240 });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:541
	AGH_speakRustleOneLiner = function (interp) {
		speakOneLiner(interp, 100, 'ガサゴソ…');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	AGH_speakLaughOneLiner = function () {
		speakOneLiner(null, 76, '「ヒャッハァッッ！」', { eventId: 3, fontWeight: 120, fontFace: 'SourceHanSerif-Heavy' });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	AGH_speakScreamOneLiner = function () {
		speakOneLiner(null, 77, '「ギャアアアアアアアアアッッ────！！」', { eventId: 3, fontFace: 'genkai-mincho' });
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	AGH_speakRoarOneLiner = function () {
		speakOneLiner(null, 100, 'ウオオオオォォッッ！！', { eventId: 6, fontFace: 'Tamanegiv6' });
	};

	// Replaces (3x): data/Map007.json:map-event:34:page:1
	AGH_speakShoutOneLiner = function (interp) {
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
	AGH_setNpcProfession = function () {
		setNPCProfession();   // NPC役職名配列
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	AGH_setNpcFamilyName = function () {
		setNPCFamilyName();   // NPC苗字設定
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	AGH_addAllSacredBeastParams = function () {
		seisyoujuu_addParamsAll();   // 星晶獣強化反映
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	AGH_setTraitChangeAndSetInfoY = function () {
		trait_changeSetting(106);   // 信仰バフステート変動設定
		trait_changeSetting(107);   // 食事バフステート変動設定
		info_SetY(varValue(200));   // インフォY軸補正値ミニステで変更
	};

	// Replaces (1x): data/CommonEvents.json:common-event:101
	AGH_forceHomeMove = function () {
		set_homeMoveForced();   // 拠点に強制移動
	};

	// Replaces (1x): data/CommonEvents.json:common-event:85
	AGH_propagateLibido = function () {
		seiyoku_hanei();   // 性欲度情報を更新
	};

	// Replaces (2x): data/Map007.json:map-event:3:page:1
	AGH_setEnemyParams = function (paramValue) {
		[21, 22, 41, 42, 61, 62].forEach(enemyId => { $dataEnemies[enemyId].params[0] = paramValue; });
	};

	// Replaces (2x): data/Map007.json:map-event:3:page:1, data/Map007.json:map-event:7:page:1
	AGH_gainSkillMasteryLevel = function (actorId, skillId, levelGain) {
		$gameActors.actor(actorId).gainSkillMasteryLevel(skillId, +levelGain);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_gainSkillMasteryLevelActor1 = function () {
		const actor1 = $gameActors.actor(1);   // the one actor this entry point trains
		actor1.gainSkillMasteryLevel(101, +1);
		actor1.gainSkillMasteryUses(201, 15);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:342
	AGH_loadGameFont = function (interp, fontSize) {
		Graphics.loadFont('GameFont', fontSize);
		interp.wait(10);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_configureGatewayMessage = function () {
		$gameSystem.GWMessageSetting.useGW = 'ON';
		$gameSystem.GWMessageSetting.imgName = 'Dunjon008';
		$gameSystem.GWMessageSetting.fadeSpeed = 256;
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_setPlayerTransparent = function () {
		$gamePlayer.setTransparent(true);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:161
	AGH_hideFollowers = function () {
		if ($gameSwitches.value(209) || $gameSwitches.value(202)) $gamePlayer.hideFollowers();
		if ($gameSwitches.value(201) || $gameSwitches.value(205)) $gamePlayer.showFollowers();
	};

	// Replaces (1x): data/CommonEvents.json:common-event:161
	AGH_resetPlayerGraphic = function () {
		if ($gamePlayer.followers().follower(0).isVisible()) $gamePlayer.resetCustomizeGraphic();
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_moveReserveMembersToVariable = function (interp) {
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
		interp.addPopup(['add', 'text:ﾋﾟｲｲｲ──…']);
	};

	// Replaces (2x): data/Map003.json:map-event:62:page:1, data/Map003.json:map-event:63:page:1
	AGH_addPopupOnomatopoeia2 = function (interp) {
		interp.addPopup(['add', 'text:ホゥ…']);
	};

	// Replaces (1x): data/Map003.json:map-event:64:page:1
	AGH_addPopupOnomatopoeia3 = function (interp) {
		interp.addPopup(['add', 'text:ペンっ']);
	};

	// Replaces (4x): data/Map003.json:map-event:57:page:1, :58:page:1, :59:page:1, data/Map126.json:map-event:4:page:1
	AGH_selectAnimalAction = function (interp) {
		valueanimalEvent2Id = 0;
		animal_ActionSelect(interp._eventId);
		if (valueanimalEvent2Id != 0) interp.addPopup(['add', `text:${valueanimalEvent2Id}`]);
		else interp.wait(30);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:301, data/CommonEvents.json:common-event:471
	AGH_showMapCenterLabel = function (interp, switchId) {
		const placeName = $dataSystem.switches[switchId];   // name of the switch passed as switchId
		map_centerDispray(55, centerLabel(`【${placeName}】`));
		interp.wait(40);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_showPicture91 = function () {
		$gameScreen.setPicturesAnimation(2, 1, '横', 40);
		showPic(91, '画面ピンク', 640, 384, 100, 100, 200, 1);
		$gameScreen.picture(91).startAnimationFrame(1, true, 1);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:221
	AGH_showPicture3 = function () {
		const pictureName = $gameSwitches.value(488) ? 'PictureBottan3a' : 'PictureBottan3';
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
		pic_1(0, 53, 'Xev100_00back', 0, 100, 255, 60, 1280, 768, -256, 0);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:221
	AGH_showPictureFromArgs = function (pictureId, pictureName, origin, x, y) {
		showPic(pictureId, pictureName, x, y, 100, 100, 255, origin);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:221
	AGH_showPictureFromArgs2 = function (pictureId, pictureName, x, secondPictureId, secondPictureName, secondX) {
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
		valueChangeSkill.forEach(skillId => skill_personalonoffload(skillId, 0));
		valueVariablesChangeSkill.forEach(skillId => skill_sentaku(skillId, 0));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	AGH_loadSkillPersonalSwitch = function (interp) {
		valuePersonalSkill.forEach(skillId => skill_personalonoffload(skillId, 0));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:205
	AGH_loadSkillPersonalSwitch2 = function (interp) {
		valuePersonalItem.forEach(itemId => skill_personalonoffload(itemId, 1));
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
	AGH_logDebugValue2 = function (metaKey) {
		forEachSteppedMetaEntry($dataWeapons, metaKey, (entryId, metaValue, pictureSlot) => {
			showDebugPicture(pictureSlot, entryId, '/img/parallaxes/' + metaValue.split(',')[0]);
			return true;
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:52
	AGH_playItemMusicFromMetaName = function (metaKey) {
		forEachSteppedMetaEntry($dataItems, metaKey, (entryId, metaValue) => {
			const bgmName = metaValue.split(',')[0];
			if (bgmName === 'NoMusic') return false;
			playMetaBgm(entryId, bgmName);
			return true;
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:52
	AGH_playItemMusicFromMetaName2 = function (metaKey) {
		forEachSteppedMetaEntry($dataWeapons, metaKey, (entryId, metaValue) => {
			const bgmName = metaValue.split(',')[0];
			if (bgmName === 'NoMusic') return false;
			playMetaBgm(entryId, bgmName);
			return true;
		});
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
		const treasureKindPool = eval(`valueDanjonTrSyurui${varValue(CURRENT_ACTOR_VAR)}`);
		//console.log(treasurePool);
		//console.log(treasureKindPool);
		const pickedTreasureId = treasurePool[getRandomIndex(treasurePool.length)];
		const pickedIndex = treasurePool.findIndex(treasureId => treasureId === pickedTreasureId);
		if (pickedIndex >= 0) treasurePool.splice(pickedIndex, 1);
		//console.log(treasurePool);
		//console.log($dataItems[pickedTreasureId].name);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_readActorCharacterInfo = function () {
		const targetActor = $gameActors.actor(n);   // dead reads, kept verbatim
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
		interp.character(0).x == interp.character(-1).x && interp.character(0).y == interp.character(-1).y;
		value2 = $gameMap.eventIdXy(9, 3);
		setVar(2, value2);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:18, data/CommonEvents.json:common-event:53
	AGH_initWeaponSlotVariableArrays = function () {
		range(541, 560).forEach(variableId => setVar(variableId, Array(43).fill(0)));
	};

	// Replaces (7x): data/CommonEvents.json:common-event:18, :66, :67, :110, :212, Map005.json:map-event:2:page:1, ...
	AGH_showAndMovePicturePairFromArgs = function (pictureId, pictureName, scaleX, scaleY, opacity, toScaleX, toScaleY, toOpacity, duration) {
		showPic(pictureId, pictureName, 640, 384, scaleX, scaleY, opacity, 1);
		movePic(pictureId, 640, 384, toScaleX, toScaleY, toOpacity, duration, 1);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:19, :20, data/Map005.json:map-event:2:page:1
	AGH_moveTwoPicturesFromArgs = function (pictureId, scaleY, duration, secondPictureId, secondScaleY, secondDuration) {
		movePic(pictureId, 640, 384, 100, scaleY, 0, duration, 1);
		movePic(secondPictureId, 640, 384, 100, secondScaleY, 0, secondDuration, 1);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:19, data/CommonEvents.json:common-event:20
	AGH_syncHeroineClothAndRefresh = function (interp) {
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
	AGH_subtractVariables = function (resultVariableId, minuendVariableId, subtrahendId, subtrahend2Id) {
		setVar(resultVariableId,
			varValue(minuendVariableId) - varValue(subtrahendId) - varValue(subtrahend2Id));
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
		const restingActorName = variableText(49);   // variable 49: 名前
		appendStoredSelfLine(interp, `${restingActorName}は傷付いた身体を休めた…。\n`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:83
	AGH_appendEstrusLine = function (interp) {
		const actorName = actor.name();
		const fontColor27 = fontColor(27);
		const fontColor0 = fontColor(0);
		appendStoredSelfLine(interp, `${actorName}は${fontColor27}発情${fontColor0}した肢体を慰めている…。\n`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:83
	AGH_appendEstrusLine2 = function (interp) {
		const actorName = actor.name();
		const fontColor27 = fontColor(27);
		const fontColor0 = fontColor(0);
		appendStoredSelfLine(interp, `${actorName}は${fontColor27}発情${fontColor0}した肢体を持て余している…。\n`);
	};

	// Replaces (11x): data/CommonEvents.json:common-event:338, :481, :503, :536, :537, :544, ...
	AGH_setDarknessOpacity = function (opacity) {
		$gameMap.darknessOpacity = opacity;
	};

	// Replaces (7x): data/CommonEvents.json:common-event:392, Map003.json events, Map018.json events
	AGH_temporarilySaveNpc = function () {
		Npc_TemporarilySave(0, 1);   // 終了処理
	};

	// Replaces (1x): data/CommonEvents.json:common-event:101
	AGH_setViewpointActorName = function () {
		setVar(49, actorNameWithPartySuffix(11, '達'));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:496, data/CommonEvents.json:common-event:516
	AGH_setLeadActorPartyName = function () {
		setVar(21, actorNameWithPartySuffix(LEAD_ACTOR_VAR, '一行'));
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
		range(1, 500).forEach(mapId => {
			range(1, 200).forEach(eventId => selfSwitchOff(mapId, eventId, selfSwitchKey));
		});
	};

	// Replaces (2x): data/CommonEvents.json:common-event:314
	AGH_setMapSelfSwitch2 = function (selfSwitchKey) {
		mapSelfSwitchOn(selfSwitchKey, 'A');
	};

	// Replaces (4x): data/CommonEvents.json:common-event:331, :511, data/Map094.json:map-event:45:page:1
	AGH_setMapSelfSwitch3 = function (eventId, selfSwitchKey) {
		mapSelfSwitchOn(eventId, selfSwitchKey);
	};

	// Replaces (5x): data/CommonEvents.json:common-event:390, :391, :393, :399, :530
	AGH_setMapSelfSwitch4 = function (firstEventId, secondEventId) {
		mapSelfSwitchOn(firstEventId, 'C');
		mapSelfSwitchOn(secondEventId, 'C');
	};

	// Replaces (3x): data/Map003.json:map-event:7:page:1, data/Map046.json:map-event:9:page:1, data/Map197.json:map-event:6:page:1
	AGH_setMapSelfSwitch5 = function (interp, firstItemId, secondItemId) {
		const hasEitherItem =
			$gameParty.hasItem($dataItems[firstItemId], true) || $gameParty.hasItem($dataItems[secondItemId], true);
		$gameSelfSwitches.setValue([$gameMap.mapId(), interp._eventId, 'B'], !hasEitherItem);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:205, :292, :313
	AGH_setMapSelfSwitchMapFirsttAction = function (selfSwitchKey) {
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
	// The wide-spread alias of `AGH_setMapSelfSwitch3` — folded into that one definition.
	AGH_enableMapSelfSwitchForEvent = AGH_setMapSelfSwitch3;

	// Replaces (9x): data/CommonEvents.json:common-event:241, :292, :305, :310, :316, :336, ...
	/* NOTE: despite the name, this one turns the switch OFF — kept as-is so the
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
		range(firstPictureId, lastPictureId).forEach(pictureId => pic_eraseP(eraseStyleId, [pictureId]));
	};

	// Replaces (2x): data/CommonEvents.json:common-event:94
	AGH_movePictureRowAndWait = function (interp, pictureId, duration, AGH_waitFrames) {
		const PICTURE_ROW_OFFSET = 60;
		movePic(pictureId + 1 + PICTURE_ROW_OFFSET, 1280 / 2, 768 / 2, 100, 100, 0, duration, 1);
		interp.wait(AGH_waitFrames);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:44, data/CommonEvents.json:common-event:45
	AGH_movePicture1 = function () {
		range(51, 60).forEach(pictureId => pic_move1(pictureId, -100, 0, 100, 100, 0, 60));
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
	AGH_fetchInfoWithLeadingEntry = function (databaseTypeId, databaseEntryId, secondDatabaseEntryId, itemAmount) {
		fetchInfoWithLeadingEntry(databaseTypeId, databaseEntryId, 0, secondDatabaseEntryId, itemAmount);
	};

	// Replaces (6x): data/CommonEvents.json:common-event:316, :319, :368, :495, :532, :548
	AGH_fetchInfoWithLeadingEntry2 = function (databaseEntryId, databaseTypeId, secondDatabaseEntryId, itemAmount) {
		fetchInfoWithLeadingEntry(0, databaseEntryId, databaseTypeId, secondDatabaseEntryId, itemAmount);
	};

	/* ============================================================================
	 * Variable-driven flags / switches
	 * ========================================================================== */

	// Replaces (5x): data/CommonEvents.json:common-event:87, data/CommonEvents.json:common-event:256
	AGH_flagIfAnySlotFilled = function (firstSlotIndex, lastSlotIndex, switchId) {
		const costumeSlotValues = varValue(360 + varValue(CURRENT_ACTOR_VAR));
		const maxSlotValue = range(firstSlotIndex, lastSlotIndex)
			.map(slotIndex => costumeSlotValues[slotIndex])
			.filter(slotValue => slotValue >= 1)
			.reduce((maxValue, slotValue) => Math.max(maxValue, slotValue), 0);
		if (maxSlotValue >= 1) AGH_enableSwitch(switchId);
	};

	// Replaces (2x): data/Map003.json:map-event:133:page:2
	AGH_applyWeaponSlotFlagsToSwitches = function (weaponSlotIndex, unlockedSwitchId, lockedSwitchId, secondWeaponSlotIndex, secondUnlockedSwitchId, secondLockedSwitchId) {
		const isWeaponUnlocked = slotIndex => varValue(327)[slotIndex] >= 1;
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
	AGH_placeTwoSpawnedEventsFromArgs = function (firstSlotIndex, x, y, direction, secondSlotIndex, x2, y2, direction2) {
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
		interp._eventId = spawnedEventId(1);   // 主格キャラ
	};

	// Replaces (5x): data/CommonEvents.json:common-event:495, :532, :548, :572, :573
	AGH_setLeadActorEventImage = function (characterIndex) {
		spawnedEvent(varValue(LEAD_ACTOR_VAR)).setImage('1_1', characterIndex);
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
		callPluginCommand(interp, 'GabText', `${gabActorName}「ああ！　我らの力、見せてやろう！！」`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:138
	AGH_runPluginCommandGabText2 = function (interp) {
		const gabActorName = $gameActors.actor(1).name();
		const characterName2 = characterName(2);
		callPluginCommand(interp, 'GabText', `${gabActorName}「はい、${characterName2}さん！」`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:138
	AGH_setPartyLeaderGabText = function (interp) {
		const speakerName = currentActor().name();
		const defaultLine = '「行きますよ、皆さん！」';
		const characterName2 = characterName(2);
		const partnerCallLine = `「${characterName2}さん、行きましょう！」`;
		const message = $gameActors.actor(2).isStateAffected(234) ? speakerName + partnerCallLine : speakerName + defaultLine;
		callPluginCommand(interp, 'GabText', message);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:138
	AGH_setActor1BattleCry = function (interp) {
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
	AGH_showHExperienceTable1 = function (requestedPartnerWeaponId) {
		h_keikenhyouji1(521, requestedPartnerWeaponId);   // 記録変数, 相手ID
	};

	// Replaces (11x): data/CommonEvents.json:common-event:294, :368, :370, :371, :372, :373, ...
	AGH_showHExperienceTable2 = function (requestedPartnerWeaponId) {
		h_keikenhyouji2(521, requestedPartnerWeaponId);   // backGraund_menuMapSelectで消去
	};

	// Replaces (5x): data/CommonEvents.json:common-event:516, :517, :518, :519, :526
	AGH_showHExperienceTable1_2 = function (interp, scenePicName, episodeItemId, requestedPartnerWeaponId) {
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
	AGH_announceCentralPlainsOnMap = function (interp) {
		setSelfVar(interp, CURRENT_ACTOR_VAR, 0);
		const fontColor16 = fontColor(16);
		const centralPlainsName = $dataSystem.switches[252];
		const fontColor0 = fontColor(0);
		valueWordSet0 = `全体マップに${fontColor16}${centralPlainsName}${fontColor0}が追加されました`;
		valueWordSetEx = 0;   // 補足が必要な場合
		AGH_runCommonEventAsChild(interp, 45);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:350
	AGH_announcePostGameDungeonUnlocked = function (interp) {
		setSelfVar(interp, CURRENT_ACTOR_VAR, 0);
		const forgottenSanctuaryName = $dataSystem.switches[259];
		valueWordSet0 = `${forgottenSanctuaryName}からクリア後ダンジョンに行けるようになりました`;
		valueWordSetEx = 0;   // 補足が必要な場合
		AGH_runCommonEventAsChild(interp, 45);
	};

	// Replaces (2x): data/CommonEvents.json:common-event:312
	AGH_announceCentralPlainsEnemiesChanged = function (interp, talkPictureId) {
		const centralPlainsName = switchName(252);   // switch 252: 中央平原
		showOneLineTalk(interp, 19, [talkPictureId, 28, `${centralPlainsName}の出現エネミーが変化しました。`, 255]);
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
		setSelfVar(interp, 14, 16);   // 14ｱｲﾃﾑ称号 15ｽｷﾙ習得 16忘却, 変数19にID
		AGH_runCommonEventAsChild(interp, 44);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:234
	AGH_showQuestSetTalk = function (interp) {
		valueCountSet1 = Number($gameMap.event(interp._eventId).event().meta['QuestSet']);
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
	AGH_setCurrentActorRankUpMessage = function () {
		const setString2 = setString(varValue(CURRENT_ACTOR_VAR));
		const ruby2 = ruby('昇格', 'レアリティ・アップ');
		setVar(21, `${setString2}は、<${valueCountSet1}>に${ruby2}した！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:254
	AGH_setActorResetConfirmMessage = function () {
		setVar(21, decorateWithActorName(
			'を初期化します。よろしいですか？\n（H履歴は影響ありませんが、\n各種開発度ランクはリセットされます。\nサブジョブのレベルは完全にはリセットされません）'));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:254
	AGH_setActorResetDoneMessage = function () {
		setVar(21, decorateWithActorName('のリセット処理が完了しました。'));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:313
	AGH_setCurrentActorRankUpMessageWithIcon = function () {
		const setString2 = setString(varValue(CURRENT_ACTOR_VAR));
		const skillIcon405 = skillIconName(405);
		const ruby2 = ruby('昇格', 'レアリティ・アップ');
		setVar(21, `${setString2}は、${skillIcon405}に${ruby2}した！`);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:259
	AGH_setJobUnlockRequirementMessage = function () {
		const className = $dataClasses[varValue(21)].name;
		setVar(801, decorateWithActorName(
			`は[${className}]のジョブ解放条件を満たしていません…。\n`));
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	AGH_showSecondJobAwakening2 = function (interp) {
		setSecondJobAwakeningMessage(interp, 1, '　　');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	AGH_showSecondJobAwakening3 = function (interp) {
		setSecondJobAwakeningMessage(interp, 2, '　　');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	AGH_showSecondJobAwakening4 = function (interp) {
		setSecondJobAwakeningMessage(interp, 3, '　　');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:361
	AGH_showSecondJobAwakening5 = function (interp) {
		setSecondJobAwakeningMessage(interp, 4, '　　');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:471
	AGH_showSecondJobAwakening6 = function (interp) {
		setSecondJobAwakeningMessage(interp, 5, '　　　　　　');
	};

	// Replaces (1x): data/CommonEvents.json:common-event:301
	AGH_setSkyPirateNameLabels = function () {
		const weaponName74 = $dataWeapons[74].name;
		setVar(21, `空賊A ${braceRight()}${weaponName74}`);
		setVar(22, `空賊B ${braceRight()}${weaponName74}`);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:301
	AGH_setBoyAndSkyPirateNameLabels = function () {
		const weaponName79 = $dataWeapons[79].name;
		setVar(21, `少年 ${braceRight()}${weaponName79}`);
		const weaponName74 = $dataWeapons[74].name;
		setVar(22, `空賊C ${braceRight()}${weaponName74}`);
	};

	// Replaces (4x): data/Map054.json:map-event:2:page:1..4
	AGH_setupBoss = function (interp, bossSlotIndex, bossId) {
		setSelfVar(interp, 29, bossSlotIndex);
		boss_setup1(2, bossId);
	};

	// Replaces (2x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:6:page:1
	AGH_appendStateDescription = function () {
		const STATE_ID = 110;
		if (!$dataStates[STATE_ID].meta['Help Description']) return;
		$dataStates[STATE_ID].description += '\nあああああ';
	};

	// Replaces (3x): data/Map007.json:map-event:4:page:1, data/Map007.json:map-event:7:page:1
	AGH_grantJobPointsToDeployedActors = function (interp, levelGain) {
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
		event_respawnSetN(11, 13, 10, 0, 'npcUnique1', 0, 4);
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
		event_respawnSetN(11, 18, 10, 0, 'npcCastle1', 2, 4);
	};

	// Replaces (4x): data/CommonEvents.json:common-event:441, data/CommonEvents.json:common-event:442, data/CommonEvents.json:common-event:552
	AGH_respawnLeadActorAndNpcFromArgs = function (posX, posY, direction, posX2, posY2, imageName, imageIndex, direction2) {
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
	AGH_startMoanTextBGVoice80 = function () {
		const voiceIcon = icon(12);
		const moanLine = `「アンっ${voiceIcon}」`;
		const secondLine = `「ヒゥンっ${voiceIcon}」`;
		const thirdLine = `「アッ${voiceIcon}　ンン${voiceIcon}」`;
		const fourthLine = `「ヒン\x0cs[20]ン\x0cs[28]っ${voiceIcon}」`;
		startTextBGVoice([moanLine, secondLine, thirdLine, fourthLine], 0, 80);
	};

	// Replaces (1x): data/CommonEvents.json:common-event:531
	// Moans, slower cadence (layer preset 0, speed 120).
	AGH_startMoanTextBGVoice120 = function () {
		const voiceIcon = icon(12);
		const moanLine = `「アンっ${voiceIcon}」`;
		const secondLine = `「ヒゥンっ${voiceIcon}」`;
		const thirdLine = `「アッ${voiceIcon}　ンン${voiceIcon}」`;
		const fourthLine = `「ヒンンっ${voiceIcon}」`;
		startTextBGVoice([moanLine, secondLine, thirdLine, fourthLine], 0, 120);
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
	AGH_selectHTextWordSet = function () {
		htext_word(3);                          // fills valueHtextWord
		startTextBGVoice([].concat(valueHtextWord), 1, 60);
	};

	// Replaces (3x): data/CommonEvents.json:common-event:393, data/CommonEvents.json:common-event:399, data/CommonEvents.json:common-event:547
	AGH_setCharacterVoiceTargetVariable = function (variableId) {
		// 文字HBGV: 呼び出し側が用意したセリフ群をそのまま流し込む
		setVar(318, varValue(variableId));
		setVar(706, [640 - 128, 386, 1, 80, 0, 'eromangasimaji']);
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
	AGH_spendGoldForClass3JobMaterial = function () {
		spendGoldForJobMaterial(100000, 'クラス3ジョブ解放素材');
	};

	// Replaces (1x): data/Map100.json:map-event:11:page:1
	AGH_spendGoldForClass2JobMaterial = function () {
		spendGoldForJobMaterial(10000, 'クラス2ジョブ解放素材');
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
		var aaa = $gameVariables.value(250);
		aaa.push(`[11]`);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_configureSystem = function () {
		$dataSystem.optSideView = true;
		$dataSystem.optSideView = false;
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_spawnEvent = function () {
		var playerRealX = $gamePlayer._realX;
		var playerRealY = $gamePlayer._realY + 10;
		$gameMap.spawnEvent(146, playerRealX, playerRealY, true);
		valueCountSet1 = $gameMap.getLastSpawnEventId();
		var event = $gameMap.event(valueCountSet1);
		event.startOpacity(60, 255);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_spawnMapEventActorChoice = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		var playerRealX = $gamePlayer._realX;
		var playerRealY = $gamePlayer._realY;
		$gameMap.spawnEvent(147, playerRealX, playerRealY, true);
		valueCountSet2 = $gameMap.getLastSpawnEventId();
		var event = $gameMap.event(valueCountSet2);
		event.startOpacity(100, 255);
		event.setImage(actor.characterName(), actor.characterIndex());
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_particleGroupSetShrineC = function (interp) {
		return (function () {
			var shrineC = 'shrine_c';
			$gameScreen._particle.particleGroupSet(this._eventId, shrineC, 'this');
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_particlePlayMonsterCp = function (interp) {
		return (function () {
			var monsterCp = 'monster_cp';
			$gameScreen._particle.particlePlay(this._eventId, monsterCp, 'this', 'def', 'above');
			$gameScreen._particle.particleUpdate([monsterCp, 'color', '#44ddff', 'ffffff']);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_particleClearShrineC = function (interp) {
		return (function () {
			var value1 = 'shrine_c';
			$gameScreen._particle.particleClear(value1);
			var value1 = 'chant_b3';
			$gameScreen._particle.particleGroupPlay(this._eventId, value1, 'this');
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_particlePlayAureoleC = function (interp) {
		return (function () {
			var aureoleC = 'aureole_c';
			$gameScreen._particle.particlePlay(this._eventId, aureoleC, 'this', 'def', 'above');
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_setMapEventOpacityVariousUseCommands = function () {
		var event = $gameMap.event(valueCountSet1);
		event.startOpacity(60, 0);
		var event = $gameMap.event(valueCountSet2);
		event.startOpacity(60, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_setSelfVariableActorChoice = function (interp) {
		return (function () {
			this.sVal(20, 1);
			var actor = $gameActors.actor($gameVariables.value(20));
			actor.setSubclass(42);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_startGabWindowNone = function () {
		var scene = SceneManager._scene;
		if (scene._gabWindow) scene.clearGabWindow();
		var gabData = [`あああ`, 'none', '', 0, '', 0];
		if (scene._gabWindow) scene.startGabWindow(gabData);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_forceMoveRouteCharactersScriptCommonVariable1 = function (interp) {
		return (function () {
			this.character($gameVariables.value(121)).forceMoveRoute({
				"list": [
					{ "code": 36 }, { "code": 37 }, { "code": 29, "parameters": [$gameVariables.value(122)] },
					{ "code": 29, "parameters": [$gameVariables.value(123)] },
					{ "code": 45, "parameters": ["this.requestAnimation($gameVariables.value(124));"] },
					{ "code": 45, "parameters": ["this.jumpEx($gameVariables.value(125),$gameVariables.value(126),$gameVariables.value(127),$gameVariables.value(128));"] },
					{ "code": 25 }, { "code": 32 }, { "code": 34 }, { "code": 35 },
					{ "code": 45, "parameters": ["this.setAngle($gameVariables.value(129));"] },
					{ "code": 0 }], "repeat": false, "skippable": true
			});
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_transformVariableDataIconIndex12 = function () {
		$gameVariables._data.map(function (v, i) { return [v, i] }).
			slice(1, 5).filter(function (v) { return v[0] !== undefined }).sort(function (a, b) { return b[0] - a[0] })
		//変数1~4の順番を変数17に代入した場合
		//1位は $gameVariables.value(17)[0][1]
		//2位は $gameVariables.value(17)[1][1]
		//3位は $gameVariables.value(17)[2][1]
		//4位は $gameVariables.value(17)[3][1]
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_iterateEnemiesVariousUseCommands = function () {
		const obj1 = $dataEnemies[Number(value2.split(',')[0])];
		$dataEnemies[i + 10] = Object.assign({}, obj1);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_setSelfVariableActorChoiceVariousUseCommands = function (interp) {
		return (function () {
			var array = $dataActors[$gameVariables.value(20)].meta['戦闘3連撃時'].split(',')
			this.sVal(522, array[getRandomIndex(array.length)]);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_setSelfVariableActorChoice_2 = function (interp) {
		return (function () {
			var battler = BattleManager._subject;
			var action = battler._actions[0];
			//action.isForOpponent() // 対象が敵の時true、仲間や自分など味方の時ははfalse
			//action._targetIndex // 対象のインデックス。敵味方ともに0から始まる。-1の時はランダムターゲット
			//action._item // 行動の種類。Game_Item クラスのオブジェクト。
			this.sVal(20, $gameParty.members()[action._targetIndex]);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_iterateSkillsVariousUseCommands = function () {
		var action = BattleManager._action;
		//if(action.isSkill()){
		//var value1 = $dataSkills[action._item._itemId].stypeId;
		//if(value == 1){
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_setSelfVariableActorChoice_3 = function (interp) {
		return (function () {
			var value = BattleManager._subject._lastTargetIndex;
			this.sVal(20, $gameParty.members()[value].actorId());
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_configureMapVariousUseCommands = function () {
		$dataMap.battleback1Name
		$dataMap.displayName
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_traceDebugOutput = function () {
		//console.log(array[getRandomIndex(array.length)]);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_iterateItemsShowInfo = function (interp) {
		return (function () {
			value = $dataItems[$gameVariables.value(21)].name;
			value1 = `${value}を入手した。`
			var args = new Array(String(value1));
			this.pluginCommand("ShowInfo", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_configureMapBGM = function () {
		var array = $dataMap.meta['BGM'].split(',');
		AudioManager.playBgm({ name: array[array.length - 4], volume: array[1], pitch: array[2], pan: array[3] })
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_forEachArray = function (interp) {
		return (function () {
			value = 460;
			var list = [61, 67, 70, 81, 82, 83, 84, 85, 86, 88];
			list.forEach(function (id) {
				this.sVal(value + id, 0);
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_iterateMapEventsTest = function () {
		var eventName = "test";
		var variableId = 1;
		var regionId = 3;
		var mapEventList = $gameMap.events().filter(function (event) {
			return event.event().name === eventName
				&& event.regionId() === regionId;
		}).length;
		$gameVariables.setValue(variableId, mapEventList);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_setVariableVariousUseCommands = function () {
		var start = 701;
		var end = 800;
		for (var i = start; i <= end; i++) {
			$gameVariables.setValue($gameVariables.value(i), $dataSkills[i - 600].description);
		}
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_setVariableActorChoice = function () {
		var array = [
			1, 2, 3, 4, 5, 6];
		$gameVariables.setValue(20, array[2]);
	};

	// Replaces (1x): CommonEvents.json:common-event:3|各種使用コマンド
	AGH_setSelfVariableRandomWork1 = function (interp) {
		return (function () {
			this.sVal(21, $gameParty._actors);
			var array = $gameVariables.value(21);
			$gameVariables.setValue(20, array[getRandomIndex(array.length)]);
		}).call(interp);
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
		var itemMeta = $dataItems[$gameVariables.value(240)].meta['warpPoint' + $gameVariables.value(21)].split(',');
		var array = [Number(itemMeta[0]), Number(itemMeta[1]), Number(itemMeta[2])];
		if (array[0] == arr3[0] && array[1] == arr3[1] && array[2] == arr3[2]) {


		};
	};

	// Replaces (1x): CommonEvents.json:common-event:4|条件分岐
	AGH_iterateSkillsConditionBranch = function (interp) {
		return (function () {
			var value1 = 0;
			for (var i = 0; i < this._actor.unlockedClasses().length; ++i) {
				if (this._actor.unlockedClasses()[i] == Number($dataSkills[skill.id].meta.SkillLearningClass)) {
					var value1 = 1;
					break;
				};
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:4|条件分岐
	AGH_iterateTroopMembers = function () {
		for (var i = 0; i < $gameTroop.members().length; i++) {
			var troopMember = $gameTroop.members()[i];
			if (troopMember.isStateAffected(234)) {
				troopMember.startAnimation(160, false, 0);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:4|条件分岐
	AGH_iteratePartyMembers = function () {
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			var battleMember = $gameParty.battleMembers()[i];
			if (battleMember.isStateAffected(234)) {
				battleMember.startAnimation(160, false, 0);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:4|条件分岐
	AGH_setSelfVariableActorChoiceConditionBranch = function (interp) {
		return (function () {
			this.sVal(20, 1);
			var actor = $gameActors.actor($gameVariables.value(20));
			var list = actor.actor().traits;
			//list.forEach(function (id) {
			//console.log(id);
			//}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:4|条件分岐
	AGH_iterateSkillsConditionBranch_2 = function (interp) {
		return (function () {
			$dataSkills[skill_Id].stypeId

			if (target.result().isHit() && this.isPhysical() && this.item().stypeId !== 1) {
				target.startAnimation(61);
			}
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:4|条件分岐
	AGH_runScriptConditionBranch = function () {
		var start = 1;
		var end = $dataSkills.length - 1;
		//for (var i = start; i <= end; i++) {
		//-1をしないとスキル上限+1まで範囲にしてしまいエラーが出る為
	};

	// Replaces (1x): CommonEvents.json:common-event:4|条件分岐
	AGH_iterateItemsEIC = function () {
		value = $dataItems[$gameVariables.value(19)];
		if ($gameParty.hasItem(value)) {
			$gameParty.gainItem(value, 1);
		};
		value3 = Number($dataItems[i].meta['EICスイッチ']);
		//if($gameParty.hasItem($dataItems[value7])){
	};

	// Replaces (1x): CommonEvents.json:common-event:4|条件分岐
	AGH_setSelfSwitchConditionBranch = function (interp) {
		return (function () {
			for (var id = $gameMap.events().length; id > 0; id--) {
				if ($gameMap.event(id).event().note.match("[HOGE]")) {
					var mapID = this._mapId;
					$gameSelfSwitches.setValue([mapID, id, "B"], true);
				}
			}
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_concatArrayFrequentlyUsed = function () {
		var array = array.concat(arr2);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_setSwitchFrequentlyUsed = function () {
		var switchId = 502
		if ($gameSwitches.value(switchId + 600 - 1) && !$gameSwitches.value(switchId + 600)) {
			$gameSwitches.setValue(161, true);
			valueCountSet1 = switchId;
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_readVariableDynamicEventId = function (interp) {
		return (function () {
			var playerRealX = $gamePlayer._realX;
			var playerRealY = $gamePlayer._realY;
			if ($gamePlayer.direction() == 2) { playerRealY += 1 };
			if ($gamePlayer.direction() == 4) { playerRealX -= 1 };
			if ($gamePlayer.direction() == 6) { playerRealX += 1 };
			if ($gamePlayer.direction() == 8) { playerRealY -= 1 };
			goodsEvent_respawn(0, 'Goods4', 6, 6, 2, playerRealX, playerRealY);
			this._eventId = $gameVariables.value(292)[0];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_eraseMapEventDynamicEventId = function (interp) {
		return (function () {
			var value1 = 'statue_orb_c' + '-' + this._eventId;
			$gameScreen._particle.particleClear(value1);
			if (!!$gameMap.event(this._eventId)) {
				$gameMap.eraseEvent(this._eventId);
			};
			$gameVariables.value(292)[0] = 0;
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_mapArrayFrequentlyUsed = function () {
		//var array = [...Array(100)].map((_, i) => i + 101);
		//console.log(`${arr1}`);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_iterateStatesAddText = function () {
		var messageText = `${user.name()}の${$dataStates[stateId].name}が解除！ 蓄積ダメージ\\C[10]${value1}\\C[0]を受けた…`;
		BattleManager._logWindow.push(`addText`, messageText);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_findIndexArray = function () {
		var randomIndex = array2[getRandomIndex(array2.length)];//ID
		var index = array2.findIndex(array2 => array2 == randomIndex);
		if (index >= 0) {
			array2.splice(index, 1);
		}
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_setScreenDTextPicture = function () {
		$gameScreen.clearZoom();
		$gameScreen.setDTextPicture(pictureId, 28);
		$gameScreen.dWindowFrame = 'ON';
		$gameScreen.dTextRealTime = 'ON';
		$gameScreen.dTextAlign = 1;//中央
		var pictureId = 100;
		var value2 = '';
		$gameScreen.showPicture(pictureId, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_runScriptFrequentlyUsed = function (interp) {
		return (function () {
			this._eventId
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_setSelfVariableActorChoiceFrequentlyUsed = function (interp) {
		return (function () {
			this.sVal(20, 1);
			var actor = $gameActors.actor($gameVariables.value(20));
			if (actor.meetsSkillConditions($dataSkills[201])) {
				$gameVariables.setValue(22, 10);
			} else {
				$gameVariables.setValue(22, 20);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_filterArrayFrequentlyUsed = function () {
		//arr3から重複を削除してarr4に渡す
		arr4 = arr3.filter(function (val, i, array) {
			return (array.indexOf(val) === i);
		});
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_computeMaxFrequentlyUsed = function () {
		var array = [1, 3, 5, 8];
		var maxValue = Math.max(...array);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_setSelfVariableRandomWork1FrequentlyUsed = function (interp) {
		return (function () {
			var array = [1, 2, 3, 4];
			var arr2 = [5, 6, 7, 8];
			array.push(arr2);
			this.sVal(21, array);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_readVariableFrequentlyUsed = function () {
		var nameLength = actor.name().length;
		var threshold = 6 - nameLength;
		if (threshold <= -1) { threshold = 0 };
		for (var j = 0; j <= threshold; j++) {
			$gameVariables.value(id1)[i] += `　`;
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_iterateItemsValueDanjonTreasure = function () {
		const itemIndex = i; // warn: i - is global using of general named variable, very danger, need to refactor to use input/output params fo functions
		const item = $dataItems[itemIndex];
		if(!item){
			console.error(`AGH_iterateItemsValueDanjonTreasure: item is ${item}!`);
			return;
		}

		const DungeonChestList = item.meta['宝箱'].split(',');
		const DungeonChestTypeList = item.meta['宝箱種類'].split(',');
		window['valueDanjonTreasure' + itemIndex] = DungeonChestList;
		window['valueDanjonTrSyurui' + itemIndex] = DungeonChestTypeList;
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_runPluginCommandItemBattleUseLimit = function (interp) {
		return (function () {
			var args = new Array(String($gameVariables.value(189)), "1", "横", String($gameVariables.value(680)));
			this.pluginCommand("PA_INIT", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_setVariableFrequentlyUsed = function () {
		var DesireItemCheckList = $dataItems[id3].meta['性欲アイテム判定'].split(',');
		$gameVariables.setValue(Number(DesireItemCheckList[0]), Number(DesireItemCheckList[1]));
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_gainItemFrequentlyUsed = function () {
		var items = $gameTroop.makeDropItems();  //戦闘不能敵キャラのドロップ品
		items = $gameTroop.aliveMembers().reduce(function (r, enemy) {  //生存中の敵キャラドロップの追加
			return r.concat(enemy.makeDropItems());
		}, items);
		items.forEach(function (item) {
			$gameParty.gainItem(item, 1);
		});
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_runScriptFrequentlyUsed_2 = function () {
		var array = [10, 30, 40, 50];
		var randomIndex = array[getRandomIndex(array.length)];
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_setSelfVariableRandomWork1_2 = function (interp) {
		return (function () {
			var array = [1, 2, 3, 4, 5];
			array.push(6, 7, 8, 9, 10);
			var randomIndex = array[getRandomIndex(array.length)];
			this.sVal(21, randomIndex);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:5|用途の多いもの
	AGH_iterateItemsLV = function () {
		var actor = $gameActors.actor($gameVariables.item(11));
		var item = $dataItems[$gameVariables.item(240)];
		var array = item.meta['エネミーLV'].split(',');
		var max = array.reduce(function (a, b) {
			var maxValue = Math.max(a, b);
		});
	};

	// Replaces (1x): CommonEvents.json:common-event:6|アップデート時に実行コモン
	AGH_setSelfVariableUpdateCommon = function (interp) {
		return (function () {
			//クエスト用配列
			this.sVal(326, Array(2001).fill(0));//クエスト達成用アイテムごと表示用配列
			this.sVal(344, Array(151).fill(0));//達成条件の内容のみ
			for (var i = 357; i <= 360; i++) { this.sVal(i, Array(151).fill(0)) };
			//357クエスト解説アイテム用358クエスト解説359クエスト発生360クエスト達成
			//1～100が通常クエスト、101～140がデイリークエスト
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:8|ピクチャ並列3
	AGH_shakePicture = function () {
		valueShakeArr2 = valueShakeArr1;
		var shakeArray = [valueShakeArr2[1], valueShakeArr2[1] + 0.1, valueShakeArr2[1] + 0.2, valueShakeArr2[1] + 0.3, valueShakeArr2[1] + 0.4, valueShakeArr2[1] + 0.5];
		valueShakeArr2[1] = shakeArray[getRandomIndex(shakeArray.length)];
		$gameScreen.shakePicture(valuePic1, valueShakeArr2[1], valueShakeArr2[2], valueShakeArr2[3], Infinity);
	};

	// Replaces (1x): CommonEvents.json:common-event:8|ピクチャ並列3
	AGH_waitPictureParallel3 = function (interp) {
		return (function () {
			valueShakeArr2 = valueShakeArr1;
			if (valueShakeArr2[4] >= 1) {
				var randomIndex = getRandomIndex(11) - 6;
				this.wait(valueShakeArr2[4] + randomIndex);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:9|スタート＆リセット兼用
	AGH_readVariableCharacterId = function (interp) {
		return (function () {
			var list = $gameVariables.value(248);
			list.forEach(function (id) {
				$dataWeapons[id + 200].name = $gameVariables.value(id + 380)[50];
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:9|スタート＆リセット兼用
	AGH_setVariableDungeonWarpCircle = function () {
		$gameVariables.setValue(211, Array(101).fill(0));
		for (var i = 0; i <= 100; i++) { $gameVariables.value(211)[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
	};

	// Replaces (1x): CommonEvents.json:common-event:9|スタート＆リセット兼用
	AGH_iterateItemsSG = function () {
		var start = 1;
		var end = $dataItems.length - 1;
		for (var i = start; i <= end; i++) {
			if ($dataItems[i].meta['SG種別']) {
				if (Number($dataItems[i].meta['SG種別']) == 2) {
					if ($dataItems[i].meta['Tchest']) {
						$gameVariables.value(215)[i] = $dataItems[i].meta['Tchest'].split(',');
						$gameVariables.value(216)[i] = $dataItems[i].meta['TchestType'].split(',');
					} else {
						$gameVariables.value(215)[i] = [];
						$gameVariables.value(216)[i] = [];
					}
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:10|初期解説コモン1
	AGH_resetValueStartCommentary1 = function () {
		valueStartCommentary1 = 0;
	};

	// Replaces (1x): CommonEvents.json:common-event:10|初期解説コモン1
	AGH_handleScriptSnippetDescriptionSubClass = function () {
		var messageText = `サブジョブ毎のスタータス上昇率一覧\n`;
		for (var i = 51; i <= 60; i++) {
			messageText += `${valueClassGrowStatasComparison[i]}\n`;
		};
		start_commentary(0, 'サブジョブについて', 'Description_SubClass',
			`キャラ事に存在する＜メインジョブ＞とは別に設定できるジョブ。
		拠点に設置されている「オーブ」を利用する事で新たなサブジョブを解放できる。
		解放にはコストが掛かる。`,
			'Dpic', `${value1}`, 'Npic', 'Nda');
	};

	// Replaces (1x): CommonEvents.json:common-event:10|初期解説コモン1
	AGH_iterateStatesMenuSubComand = function (interp) {
		return (function () {
			var messageText = ``;
			var list = $gameVariables.value(205);
			list.forEach(function (id) {
				messageText += `\x1bI[${$dataStates[id].iconIndex}]${$dataStates[id].name} `
			}, this);
			start_commentary(0, '一部制限について', 'MenuSubComand',
				`メニュー画面から開ける「クエストリスト」「ダンジョン情報」は、
		特定ステートが付与されている場合、開けなくなります。
		[${value1}]`,
				'Npic', `Nda`, 'Npic', `Nda`);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:11|リセット時コモン
	AGH_readVariableAppearanceCharacterStart = function () {
		for (var i = $gameVariables.value(75); i <= $gameVariables.value(76); i++) { $gameActors.actor(i).forgetSkill(18) }
	};

	// Replaces (1x): CommonEvents.json:common-event:11|リセット時コモン
	AGH_readVariableActorChoice = function () {
		for (var i = 101; i <= 200; i++) {
			$gameVariables.value(360 + $gameVariables.value(20))[i] = 0
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:11|リセット時コモン
	AGH_removeState = function (interp) {
		return (function () {
			var list = $gameVariables.value(205);
			list.forEach(function (id) {
				var actor = $gameActors.actor($gameVariables.value(20));
				actor.removeStateCounter(id);
				actor.removeState(id);
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:11|リセット時コモン
	AGH_resetSelfSwitchVariablesResetCommon = function () {
		for (var i = 1; i <= 200; i++) {
			$gameSelfSwitches.setVariableValue([(i), 2, 1], 0);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:12|ゲームスタート時コモン
	AGH_readVariableAppearanceCharacterStartGameStartCommon = function () {
		var start = $gameVariables.value(75);
		var end = $gameVariables.value(76);
		for (var i = start; i <= end; i++) {
			actor_StartSetUp(i);
			production_separateSetProfile(i);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:12|ゲームスタート時コモン
	AGH_readVariableHeroineId = function (interp) {
		return (function () {
			var list = $gameVariables.value(247);
			list.forEach(function (id) {
				hstates_heights(id, 253);
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:14|ピクチャ並列2
	AGH_waitPictureParallel2 = function (interp) {
		return (function () {
			if (valuePicWait2 >= 1) {
				var randomIndex = getRandomIndex(11) - 6;
				this.wait(valuePicWait2 + randomIndex);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:14|ピクチャ並列2
	AGH_waitPictureParallel2_2 = function (interp) {
		return (function () {
			if (valuePicWait2 >= 1) {
				var randomIndex = getRandomIndex(valuePicWait2);
				this.wait(valuePicWait2 - randomIndex);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
	AGH_setPictureFromArrayPictureParallel1 = function () {
		var pictureSetArray = pic_setArray1;
		pic_setArray(pictureSetArray[0], pictureSetArray[1], pictureSetArray[2], pictureSetArray[3], pictureSetArray[4], pictureSetArray[5]);
		if (valueParallelPic1 >= 1) { pic_setArrayParallel1(valueParallelPic1) };
		if (valueParallelPic2 >= 1) { pic_setArrayParallel1(valueParallelPic2) };
		if (valueParallelPic3 >= 1) { pic_setArrayParallel1(valueParallelPic3) };
		if (valueParallelPic4 >= 1) { pic_setArrayParallel1(valueParallelPic4) };
	};

	// Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
	AGH_setPictureFromArrayPictureParallel1_2 = function () {
		var pictureSetArray = pic_setArray2;
		if (pictureSetArray[1] >= 1) {
			pic_setArray(pictureSetArray[0], pictureSetArray[1], pictureSetArray[2], pictureSetArray[3], pictureSetArray[4], pictureSetArray[5]);
			if (valueParallelPic1 >= 1) { pic_setArrayParallel1(valueParallelPic1) };
			if (valueParallelPic2 >= 1) { pic_setArrayParallel1(valueParallelPic2) };
			if (valueParallelPic3 >= 1) { pic_setArrayParallel1(valueParallelPic3) };
			if (valueParallelPic4 >= 1) { pic_setArrayParallel1(valueParallelPic4) };
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
	AGH_playSeName = function () {
		var parallelPictureSet = valueParallelPicSe2;
		if (parallelPictureSet[0] != 0) {
			var randomIndex = getRandomIndex(11) + Number(parallelPictureSet[1]);
			var value2 = getRandomIndex(21) + Number(parallelPictureSet[2]);
			AudioManager.playSe({ "name": parallelPictureSet[0], "volume": randomIndex, "pitch": value2, "pan": 0 });
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
	AGH_waitPictureParallel1 = function (interp) {
		return (function () {
			var pictureSetArray = pic_setArray2;
			if (pictureSetArray[1] >= 1) {
				if (valuePicWait >= 1) {
					//var value1 = getRandomIndex(10) + 1;
					this.wait(valuePicWait);
				};
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
	AGH_movePicturePictureParallel1 = function (interp) {
		return (function () {
			var pictureId = 53;
			$gameScreen.movePicture(pictureId + 2, 1, 640 - 128, 384 + 20, 100, 100, 240, 0, 120);
			this.wait(110);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
	AGH_movePicturePictureParallel1_2 = function (interp) {
		return (function () {
			var pictureId = 53;
			$gameScreen.movePicture(pictureId + 2, 1, 640 - 128, 384 - 20, 100, 100, 240, 0, 120);
			this.wait(110);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
	AGH_movePicturePictureParallel1_3 = function (interp) {
		return (function () {
			var randomIndex = getRandomIndex(41) + 160;
			var value3 = getRandomIndex(21) + 40;
			var pictureId = 53;
			$gameScreen.movePicture(pictureId + 2, 1, 640 + value3 - 128, 384, 100, 100, 240, 0, randomIndex);
			this.wait(randomIndex - 10);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:17|ピクチャ並列1
	AGH_movePicturePictureParallel1_4 = function (interp) {
		return (function () {
			var randomIndex = getRandomIndex(41) + 160;
			var value3 = getRandomIndex(21) + 40;
			var pictureId = 53;
			$gameScreen.movePicture(pictureId + 2, 1, 640 - value3 - 128, 384, 100, 100, 240, 0, randomIndex);
			this.wait(randomIndex - 10);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:18|イベントシーン開始
	AGH_initValueTachieBless = function () {
		valueTachieBless = [100, 100, 250, 0.004, 0.003];//立ち絵用息遣い設定。基本状態
	};

	// Replaces (1x): CommonEvents.json:common-event:18|イベントシーン開始
	AGH_readVariableHeroineIdEventSceneStart = function (interp) {
		return (function () {
			//現在衣装を別変数配列に一時代入
			//統合衣装用の0も含める。（代入変数を利用しなくていい為可能）
			var list = $gameVariables.value(247);
			list.forEach(function (id) {
				var actor = $gameActors.actor(id);
				//if($gameParty.members().contains(actor)){
				var start = 0; var end = 42;
				for (var i = start; i <= end; i++) {
					$gameVariables.value(id + 540)[i] = $gameVariables.value(id + 440)[i]
				};
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:21|初期解説コモン2
	AGH_erasePictureItemProcessWork = function () {
		var pictureId = 150 + valueStartCommentary1 + $gameVariables.value(19);
		$gameScreen.erasePicture(pictureId);
	};

	// Replaces (1x): CommonEvents.json:common-event:21|初期解説コモン2
	AGH_showPictureItemProcessWork = function () {
		if (valueStartCommentary2P[$gameVariables.value(19)] == 0) { } else {
			if (valueStartCommentary2P[$gameVariables.value(19)] == 'Dpic') {
				var value9 = ''; var value10 = 100; var value11 = 134;
				$gameScreen.setDTextPicture(valueStartCommentary2[$gameVariables.value(19)], 28);
				$gameScreen.dWindowFrame = 'ON';
			} else {
				var value9 = '/img/tips/' + valueStartCommentary2P[$gameVariables.value(19)];
				var value10 = 0; var value11 = 334;
			};
			$gameScreen.showPicture(201, value9, 0, value11, 0 + 50, 100, 100, 0, 0);
			$gameScreen.movePicture(201, 0, value11, value10, 100, 100, 255, 0, 30);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:21|初期解説コモン2
	AGH_queueMessageDpic = function (interp) {
		return (function () {
			if (valueStartCommentary2[$gameVariables.value(19)] == 0) { } else {
				if (valueStartCommentary2P[$gameVariables.value(19)] == 'Dpic') {
					var variable19Value = '';
				} else {
					var variable19Value = valueStartCommentary2[$gameVariables.value(19)];
				};
				$gameMessage.newPage();
				$gameMessage.add(variable19Value);
				this.setWaitMode('message');
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:21|初期解説コモン2
	AGH_showPictureItemProcessWorkInitialGuideCommon2 = function () {
		if (valueStartCommentary3P[$gameVariables.value(19)] == 0) { } else {
			if (valueStartCommentary3P[$gameVariables.value(19)] == 'Dpic') {
				var value9 = ''; var value10 = 100; var value11 = 134;
				$gameScreen.setDTextPicture(valueStartCommentary3[$gameVariables.value(19)], 28);
				$gameScreen.dWindowFrame = 'ON';
			} else {
				var value9 = '/img/tips/' + valueStartCommentary3P[$gameVariables.value(19)];
				var value10 = 0; var value11 = 334;
			};
			$gameScreen.showPicture(202, value9, 0, value11, 0 + 50, 100, 100, 0, 0);
			$gameScreen.movePicture(202, 0, value11, value10, 100, 100, 255, 0, 30);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:21|初期解説コモン2
	AGH_readVariableItemProcessWork = function (interp) {
		return (function () {
			if (valueStartCommentary3[$gameVariables.value(19)] == 0) { } else {
				if (valueStartCommentary3P[$gameVariables.value(19)] == 'Dpic') {
					var variable19Value = '';
				} else {
					var variable19Value = valueStartCommentary3[$gameVariables.value(19)];
				};
				$gameMessage.newPage();
				$gameMessage.add(variable19Value);
				this.setWaitMode('message');
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:22|宿泊時コモン
	AGH_iterateItemsBedPattern = function () {
		var playerRealX = $gamePlayer._realX;
		var playerRealY = $gamePlayer._realY;
		var value3 = 148;
		if ($gameVariables.value(230) >= 1) { var valueItems = $dataWeapons[$gameVariables.value(230)] };
		if ($gameVariables.value(240) >= 1) { var valueItems = $dataItems[$gameVariables.value(240)] };
		if ($dataMap.meta['BedPattern']) { var valueItems = $dataMap };
		if (valueItems.meta['BedPattern']) {
			var value3 = Number(valueItems.meta['BedPattern']);
		};
		$gameMap.spawnEvent(value3, playerRealX, playerRealY + 1, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:22|宿泊時コモン
	AGH_setSelfVariableDayEndInfoText = function (interp) {
		return (function () {
			var list = $gameVariables.value(247);
			list.forEach(function (id) {
				var actor = $gameActors.actor(id);
				if ([84, 85, 86].some(function (i) { return actor.isStateAffected(i) })) {
					if (actor.battleSkillsRaw().includes(864)) {
						this.sVal(539, `\x1bSIN[${864}]発動！ ${actor.name()}は汚れを放置した。\n`); this.sVal(540, $gameVariables.value(540) + 1);
					} else {
						actor.removeState(84); actor.removeState(85); actor.removeState(86);
						this.sVal(539, `${actor.name()}は汚れを洗い流した。\n`); this.sVal(540, $gameVariables.value(540) + 1);
					};
				};
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_readVariableAppearanceCharacterStartDayPassCommon = function () {
		var start = $gameVariables.value(75);
		var end = $gameVariables.value(76);
		for (var id1 = start; id1 <= end; id1++) {
			var actor = $gameActors.actor(id1);
			if (actor.isLearnedSkill(18)) {
				Profession_basicReturn(id1);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_readVariableRaceDefeatCount = function () {
		$gameVariables.value(52)[1] = 0;//当日魔物討伐数
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_setSelfVariableDayEndInfoCount = function (interp) {
		return (function () {
			for (var j = $gameVariables.value(75); j <= $gameVariables.value(76); j++) {
				var actor = $gameActors.actor(j);
				if (actor.isStateAffected(61)) {
					actor.removeState(61); $gameVariables.value(380 + j)[2] = 0; var randomIndex = getRandomIndex(6) + 5;
					if (actor.isLearnedSkill(63)) {
						this.sVal(540, $gameVariables.value(540) + 2); $gameVariables.value(380 + j)[13] += 1; $gameVariables.value(380 + j)[1] += randomIndex;
						this.sVal(539, $gameVariables.value(539) + `${actor.name()}は自分を慰めた…。${$dataStates[61].name}が解除された。\n\\c[27][性欲度+${value1}] [自慰回数+1]\\C[0]`);
					} else {
						this.sVal(539, $gameVariables.value(539) + `${actor.name()}の${$dataStates[61].name}が解除された。\n`);
						this.sVal(540, $gameVariables.value(540) + 1);
					}
				}
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_setSelfVariableDayEndInfoTextDayPassCommon = function (interp) {
		return (function () {
			for (var i = 1; i <= $dataStates.length - 1; i++) {
				if ($dataStates[i].meta['dayRemove']) {
					if ($gameParty.membersState(i)) {
						for (var j = $gameVariables.value(75); j <= $gameVariables.value(76); j++) {
							var actor = $gameActors.actor(j);
							if (actor.isStateAffected(i)) {
								actor.removeState(i);
							}
						};
						this.sVal(539, $gameVariables.value(539) + `${$dataStates[i].name}が解除された。\n`);
						this.sVal(540, $gameVariables.value(540) + 1);
					}
				}
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_iterateSystemSwitchesDaysOnSwi = function () {
		for (var i = 1; i <= $dataSystem.switches.length - 1; i++) {
			if ($dataSystem.switches[i].match(/daysOnSwi/)) {
				if ($gameSwitches.value(i)) {
					var switchIdText = $dataSystem.switches[i].replace(/[^0-9]/g, "");
					$gameSwitches.setValue(switchIdText, true);
				}
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_iterateSystemSwitchesDaysOnVal = function () {
		for (var i = 1; i <= $dataSystem.switches.length - 1; i++) {
			if ($dataSystem.switches[i].match(/daysOnVal+/)) {
				if ($gameSwitches.value(i)) {
					var value1 = $dataSystem.switches[i].replace(/[^0-9]/g, "");
					$gameVariables.setValue(value1, $gameVariables.value(value1) + 1);
				}
			};
			if ($dataSystem.switches[i].match(/daysOnVal-/)) {
				if ($gameSwitches.value(i)) {
					var value1 = $dataSystem.switches[i].replace(/[^0-9]/g, "");
					$gameVariables.setValue(value1, $gameVariables.value(value1) - 1);
				}
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_iterateSystemSwitchesDaysReset = function () {
		for (var i = 1; i <= $dataSystem.switches.length - 1; i++) {
			if ($dataSystem.switches[i].match(/daysReset/)) {
				$gameSwitches.setValue(i, false);
			}
		};
		for (var i = 1; i <= $dataSystem.variables.length - 1; i++) {
			if ($dataSystem.variables[i].match(/daysReset/)) {
				$gameVariables.setValue(i, 0);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_loseItemDayPassCommon = function () {
		for (var i = 1001; i <= 1100; i++) {
			$gameParty.loseItem($dataItems[i], 9999);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_iterateItemsExpiryDate = function () {
		for (var i = 1; i <= $dataItems.length - 1; i++) {
			if ($dataItems[i].meta['ExpiryDate']) {
				if ($gameParty.hasItem($dataItems[i], true)) {
					$gameParty.loseItem($dataItems[i], 9999);
				};
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_gainItemSkillCost1week = function () {
		for (var i = 1; i <= $dataItems.length - 1; i++) {
			if ($dataItems[i].meta['SkillCost1week']) {
				$gameParty.gainItem($dataItems[i], 1);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_addState = function (interp) {
		return (function () {
			var list = $gameVariables.value(248);
			list.forEach(function (id) {
				if ($gameVariables.value(380 + id)[71] >= 1) {
					if (!$gameActors.actor(id).battleSkillsRaw().includes(847)) {
						$gameActors.actor(id).addState(67);
					};
				};
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_readVariableCharacterIdDayPassCommon = function (interp) {
		return (function () {
			var list = $gameVariables.value(248);
			list.forEach(function (id) {
				$gameVariables.value(380 + id)[71] = 0;
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:24|一日経過時コモン
	AGH_clearInfoLogDayPassCommon = function () {
		$gameSystem._infoLog = [];
	};

	// Replaces (1x): CommonEvents.json:common-event:25|一日始まり時コモン
	AGH_setSwitchParallelStopDayPass = function () {
		for (var i = 1; i <= $dataSystem.switches.length - 1; i++) {
			if ($dataSystem.switches[i].match(/夜自動/)) {
				if ($gameSwitches.value(i) && !$gameSwitches.value(i + 2)) {
					$gameSwitches.setValue(474, true);
					$gameSwitches.setValue(i + 1, true);
					break;
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:25|一日始まり時コモン
	AGH_playParticleChime2 = function () {
		AudioManager.playSe({ "name": 'Chime2', "volume": 90, "pitch": 100, "pan": 0 });
		var textDispray2 = 'text_dispray2';
		$gameScreen._particle.particleClear(textDispray2);
		$gameScreen._particle.particlePlay(0, textDispray2, 'screen', 'def', 'screen');
		$gameScreen._particle.particleExceed(textDispray2, 0.3);
	};

	// Replaces (1x): CommonEvents.json:common-event:25|一日始まり時コモン
	AGH_showPictureDayStartCommon = function () {
		var messageText = `──\\V[58]日目(\\V[55]曜日)──`;
		$gameScreen.setDTextPicture(messageText, 28);
		$gameScreen.dTextAlign = 0;
		$gameScreen.dWindowFrame = 'ON';
		$gameScreen.showPicture(74, "", 0, -100, 100, 100, 100, 0, 0);
		$gameScreen.movePicture(74, 0, 50, 100, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:25|一日始まり時コモン
	AGH_setSelfVariableRandomWork1DayStartCommon = function (interp) {
		return (function () {
			var value1 = `おはよう御座います。\n今日も頑張りましょうね`;
			if ($gameSwitches.value(202) && $gameSwitches.value(204)) { var value1 = `──さて、行きましょうか` };
			if ($gameSwitches.value(465)) { var value1 = `………行きましょう` };
			this.sVal(21, value1);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:25|一日始まり時コモン
	AGH_setSwitchDailyOrder = function () {
		if ($gameSwitches.value(129)) {
			quest_jutyuu2(2);
			$gameSwitches.setValue(644, true);
		};
		$gameSwitches.setValue(380, false);
	};

	// Replaces (1x): CommonEvents.json:common-event:29|メニュー開く
	AGH_resetValueCountSet1 = function () {
		valueCountSet1 = 0;//WindowManager.showのため
	};

	// Replaces (1x): CommonEvents.json:common-event:29|メニュー開く
	AGH_setVariableMenuDisplay = function () {
		var actor = $gameParty.members()[0];
		production_separateSetProfile(actor.actorId());
		$gameVariables.setValue(255,
			`\\fs[22]\\C[2]${actor.name()}=${$gameVariables.value(actor.actorId() + 380)[50]}\\C[0]
		\\fs[22]${actor.nickname()}\n`);
		$gameVariables.setValue(253, `\\fs[20]${actor.profile()}`);
		$gameVariables.setValue(255, $gameVariables.value(255) + $gameVariables.value(253));
	};

	// Replaces (1x): CommonEvents.json:common-event:29|メニュー開く
	AGH_setVariableMenuDisplayOpenMenu = function () {
		var actor = $gameParty.members()[0];
		$gameVariables.setValue(255,
			`\\fs[25]\\C[2]${actor.name()}=${$gameVariables.value(actor.actorId() + 380)[50]}\\C[0]
		\\fs[25]${actor.nickname()}\n`);
		if (isGirl(actor)) {
			hstates_heights(actor.actorId(), 253);
		} else {
			$gameVariables.setValue(253, `　`);
		};
		$gameVariables.setValue(255, $gameVariables.value(255) + $gameVariables.value(253));
	};

	// Replaces (1x): CommonEvents.json:common-event:29|メニュー開く
	AGH_setCursorHiddenOpenMenu = function () {
		$gameSystem._cursorHidden = false;
	};

	// Replaces (1x): CommonEvents.json:common-event:42|ナヴィ表示
	AGH_initValueWordSet1 = function () {
		valueWordSet1 = ``;
		valueWordSet2 = ``;
		valueWordSet3 = ``;
		valueWordSet4 = ``;
		valueWordSet5 = ``;
	};

	// Replaces (1x): CommonEvents.json:common-event:43|一日一回コモン
	AGH_setVariableDungeonWipeOutCount = function () {
		var variable257Value = $gameVariables.value(257);
		var counter = 0;
		for (var i = 0; i < variable257Value.length; i++) {
			if (variable257Value[i] >= 1 && i >= 1) {
				if ($dataItems[i].meta['OnSwitch']) {
					var OnSwitchList = $dataItems[i].meta['OnSwitch'].split(',');
					for (var j = 0; j <= OnSwitchList.length - 1; j++) {
						if (Number(OnSwitchList[j]) == 207) {
							counter += variable257Value[i];
						}
					}
				}
			}
		};
		$gameVariables.setValue(608, counter);
	};

	// Replaces (1x): CommonEvents.json:common-event:44|称号パッシブ獲得
	AGH_readVariableRandomWork2 = function () {
		var actor = $gameActors.actor($gameVariables.value(11));
		if (!$gameParty.inBattle()) {
			$gamePlayer.requestAnimation($gameVariables.value(22))
		} else {
			if (actor.isBattleMember()) {
				$gameParty.members()[actor.index()].startAnimation($gameVariables.value(22), false, 0)
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:45|一言演出用
	AGH_setSelfVariableActorChoiceOneLineEffect = function (interp) {
		return (function () {
			//一言演出。変数20が1以上で獲得用。0で移動ポイント増加など
			this.sVal(20, 1);
			var actor = $gameActors.actor($gameVariables.value(20));
			valueWordSet0 = `\\C[16]${actor.name()}\\C[0]はクラス2ndジョブ\\C[2]＜\\j[21]＞\\C[0]に目覚めた！`;
			valueWordSetEx = 0;//補足が必要な場合
			this.setupChild($dataCommonEvents[45].list, 0);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:48|全体図で新エリア解放時イベント
	AGH_characterERSMAKETEMPLATE = function (interp) {
		return (function () {
			var value1 = this.character(0).x;
			var value2 = this.character(0).y;
			var args = new Array("68", String(value1), String(value2));
			this.pluginCommand("ERS_MAKE_TEMPLATE", args);
			var args = new Array("22");
			this.pluginCommand("ERS_GET_LAST_SPAWN_EVENT_ID", args);
			this.wait(20);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
	AGH_fillArrayDungeonWarpPoint = function () {
		valueScriptArray1 = [];//Array(21).fill(0);
		valueWordArray = [];
	};

	// Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
	AGH_sliceArrayMAP = function () {
		var scriptArray = valueScriptArray1[0];
		var mapId = Number(scriptArray[0]);
		filename = 'MAP' + ('000' + mapId).slice(-3) + '.json';
		DataManager.loadDataFile('$dataMap2', filename);
	};

	// Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
	AGH_pushToArrayDungeonWarpPoint = function () {
		valueWordArray.push(`${$dataMap2.displayName}(入口)`);
	};

	// Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
	AGH_readVariableRandomWork1 = function () {
		var variable21Value = valueScriptArray1[$gameVariables.value(21)];
		var mapId = Number(variable21Value[0]);
		filename = 'MAP' + ('000' + mapId).slice(-3) + '.json';
		DataManager.loadDataFile('$dataMap2', filename);
	};

	// Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
	AGH_pushToArrayDungeonWarpPoint_2 = function () {
		valueWordArray.push($dataMap2.displayName);
	};

	// Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
	AGH_addCustomChoiceDungeonWarpPoint = function () {
		for (var i = 0; i <= valueScriptArray1.length - 1; i++) {
			const id = 1;
			const choiceParams = {
				text: `${valueWordArray[i]}`,
				value: i
			};
			$gameSystem.addCustomChoice(id, choiceParams);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
	AGH_readVariableItemProcessWorkDungeonWarpPoint = function () {
		arr1 = valueScriptArray1[$gameVariables.value(19)];
	};

	// Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
	AGH_setVariableDungeonWarpPoint = function () {
		$gameVariables.setValue(161, [Number(arr1[0]), Number(arr1[1]), Number(arr1[2])]);
	};

	// Replaces (1x): CommonEvents.json:common-event:49|ダンジョンワープポイント
	AGH_setSwitchTemporarySwitch = function (interp) {
		return (function () {
			var array = [Number(arr1[0]), Number(arr1[1]), Number(arr1[2])];
			var arr3 = [$gameMap.mapId(), $gameMap.event(this._eventId).x, $gameMap.event(this._eventId).y];
			if (array[0] == arr3[0] && array[1] == arr3[1] && array[2] == arr3[2]) {
				$gameSwitches.setValue(380, true);
			} else {
				$gameSwitches.setValue(380, false);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:52|ファイルチェック用スクリプト
	AGH_iterateWeaponsBGInN = function () {
		var BGInN = 'BG_inN';
		var valueItems = $dataWeapons; var end = valueItems.length - 1;
		var j = 1;
		for (var i = 1; i <= end; i++) {
			if (valueItems[i].meta[BGInN]) {
				var array = valueItems[i].meta[BGInN].split(',')[0];
				//console.log(`${i}  ${value1}`);
				//console.log(`${value1}`);
				$gameScreen.showPicture(j, array, 1, 640 - 128, 384, 100, 100, 255, 0);
				j += 1;
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:52|ファイルチェック用スクリプト
	AGH_traceDebugOutputEnemyEntrySe = function () {
		var EnemyEntrySe = 'EnemyEntrySe';
		var valueItems = $dataEnemies; var end = valueItems.length - 1;
		var j = 1;
		for (var i = 1; i <= end; i++) {
			if (valueItems[i].meta[EnemyEntrySe]) {
				var array = valueItems[i].meta[EnemyEntrySe].split(',')[0];
				//console.log(`${i}  ${value1}`);
				//console.log(`${value1}`);
				AudioManager.playSe({ "name": array, "volume": 100, "pitch": 100, "pan": 0 });
				j += 1;
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:52|ファイルチェック用スクリプト
	AGH_showPictureFileCheckScript = function () {
		var value2 = '';
		var valueItems = $dataItems; var end = valueItems.length - 1;
		var j = 1;
		for (var i = 1; i <= end; i++) {
			if (valueItems[i].meta[value2]) {
				var value1 = valueItems[i].meta[value2].split(',')[0];
				var value1 = '/img/parallaxes/' + value1;
				//console.log(`${i}  ${value1}`);
				$gameScreen.showPicture(j, value1, 1, 640 - 128, 384, 100, 100, 255, 0);
				j += 1;
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
	AGH_setSelfVariableActorChoiceDebugCommon = function (interp) {
		return (function () {
			this.sVal(20, 3);
			var actor = $gameActors.actor($gameVariables.value(20));
			for (var i = 431; i < 439; i++) {
				actor.forgetSkill(i);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
	AGH_setSelfVariableActorChoice_4 = function (interp) {
		return (function () {
			this.sVal(20, 3);
			var actor = $gameActors.actor($gameVariables.value(20));
			for (var i = 1; i < $dataSkills.length; i++) {
				if (!actor.isLearnedSkill(i)) {
					actor.forgetSkill(i);
					actor.setSkillMasteryUses(i, 0);
					actor.setSkillMasteryLevel(i, 0);
				};
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
	AGH_setSelfVariableActorChoice_5 = function (interp) {
		return (function () {
			this.sVal(20, 1);
			var actor = $gameActors.actor($gameVariables.value(20));
			var value1 = actor.stateRate(62) * 100
			//console.log(`${value1}`);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
	AGH_addStepsDebugCommon = function () {
		$gameParty._steps += 200;
	};

	// Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
	AGH_iteratePartyMembersDebugCommon = function () {
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			var battleMember = $gameParty.battleMembers()[i];
			if ($gameParty.members().contains(battleMember)) {
				battleMember.learnSkill(297); battleMember.gainSkillMasteryUses(297, 100);
				battleMember.learnSkill(300); battleMember.gainSkillMasteryUses(300, 100);
				battleMember.learnSkill(308); battleMember.gainSkillMasteryUses(308, 100);
				battleMember.learnSkill(340); battleMember.gainSkillMasteryUses(340, 100);
				battleMember.learnSkill(290); battleMember.gainSkillMasteryUses(290, 100);
			}
		};
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
		var messageText = ``;
		for (var i = 1; i <= $dataStates.length - 1; i++) { messageText += `[${i}]${$dataStates[i].name}\n` };
		for (var i = 1; i <= $dataItems.length - 1; i++) { messageText += `[${i}]${$dataItems[i].name}\n` };
		for (var i = 1; i <= $dataWeapons.length - 1; i++) { messageText += `[${i}]${$dataWeapons[i].name}\n` };
		for (var i = 1; i <= 500; i++) { messageText += `[${i}]${$dataArmors[i].name}\n` };
		for (var i = 1; i <= $dataSkills.length - 1; i++) { messageText += `[${i}]${$dataSkills[i].name}\n` };
		//console.log(messageText)
	};

	// Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
	AGH_gainItemDebugCommon = function () {
		for (var i = 801; i <= 810; i++) {
			if (!$dataItems[i].name == '') {
				$gameParty.gainItem($dataItems[i], -1);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
	AGH_setVariableDungeonWarpCircleDebugCommon = function () {
		$gameVariables.setValue(211, Array(101).fill(0));
		for (var i = 0; i <= 100; i++) {
			$gameVariables.value(211)[i] = [];
			for (var j = 0; j <= 10; j++) {
				$gameVariables.value(211)[i].push(0);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
	AGH_readVariableDebugCommon = function () {
		$gameVariables.value(1 + 440)[41] = 0
	};

	// Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
	AGH_readVariableChoiceSwitch3 = function () {
		//イベントの位置が変更された場合に更新。ctrl+CでSetteiのvalueLocationPresetにコピペ
		document.addEventListener('copy', function (e) {
			e.preventDefault();
			var data = $gameVariables.value(163);
			delete data.comment;
			file = JSON.stringify(data);
			e.clipboardData.setData('text/plain', file);
		});
	};

	// Replaces (1x): CommonEvents.json:common-event:53|デバッグコモン
	AGH_iterateSystemSwitches = function () {
		var array = [];
		for (var i = 201; i <= 380; i++) {
			array.push(`${i}:${$dataSystem.switches[i]}`);
		};
		fs.writeFileSync("valueLocationPreset.txt", JSON.stringify(array))
	};

	// Replaces (1x): CommonEvents.json:common-event:54|イベント場所移動コモン
	AGH_configureMapEventEventPlaceMoveCommon = function (interp) {
		return (function () {
			for (var i = 1; i < 10; i++) {
				if (!!$gameMap.event(i)) {
					this._eventId = i;
					break;
				};
			};
		}).call(interp);
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
		const picId = 55;
		valuePic1 = picId;
		var XevS09803 = 'XevS098_03';
		$gameScreen.showPicture(picId, XevS09803, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(picId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		pic_move1(picId - 1, 0, 0, 100, 100, 0, 120);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_pluginCommandGabText = function (interp) {
		return (function () {
			var talkSet = valueTalkSet;
			var args = new Array(String(talkSet[0]));
			this.pluginCommand("GabText", args);
			var args = new Array(String(talkSet[1]));
			this.pluginCommand("GabFaceName", args);
			var args = new Array(String(talkSet[2]));
			this.pluginCommand("GabFaceIndex", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_readVariableTipsTitle = function () {
		var value1 = 0;
		if ($gameVariables.value(532).length != 0) {
			for (var i = 0; i <= $gameVariables.value(532).length - 1; i++) {
				if ($gameVariables.value(532)[i] == valueTalkSet[0]) {
					var value1 = 1;
					break;
				}
			}
		};
		if (value1 == 0) {
			$gameVariables.value(532).push(valueTalkSet[0]);
			$gameVariables.value(533).push(valueTalkSet[1]);
			$gameVariables.value(534).push(valueTalkSet[2]);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_showPictureConversationGabCommon = function () {
		if (valueTalkSet[1] == 0) { var value2 = `Tips:${valueTalkSet[0]}` } else { var value2 = `Tips:${valueTalkSet[0]}\n${valueTalkSet[1]}` };
		var array = [value2, 25];
		$gameScreen.setDTextPicture(array[0], array[1]);
		$gameScreen.dWindowFrame = 'ON';
		if (valueTalkSet[2][0] != 0) {
			var value1 = 30;
		} else {
			var value1 = 50;
		};
		$gameScreen.showPicture(103, '', 0, -80, value1, 100, 100, 255, 0);
		$gameScreen.movePicture(103, 0, 50, value1, 100, 100, 255, 0, 100);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_showPictureScreenBlackOut = function () {
		if (valueTalkSet[2][0] != 0) {
			var ScreenBlackOut = 'ScreenBlackOut';
			$gameScreen.showPicture(101, ScreenBlackOut, 1, 640, 384, 100, 100, 150, 0);
			$gameScreen.showPicture(102, valueTalkSet[2][0], valueTalkSet[2][1],
				valueTalkSet[2][2], valueTalkSet[2][3],
				valueTalkSet[2][4], valueTalkSet[2][5], valueTalkSet[2][6], 0);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_readVariableTipsTitleConversationGabCommon = function () {
		var value1 = 0;
		if ($gameVariables.value(532).length != 0) {
			for (var i = 0; i <= $gameVariables.value(532).length - 1; i++) {
				if ($gameVariables.value(532) == valueTalkSet[0]) {
					var value1 = 1;
					break;
				}
			}
		};
		if (value1 == 0) {
			$gameVariables.value(532).push(valueTalkSet[0]);
			$gameVariables.value(533).push(valueTalkSet[1]);
			$gameVariables.value(534).push(valueTalkSet[2]);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_showPictureSkillAttackId = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		var variable96Value = `\x1bSIN[${$gameVariables.value(96)}]`;
		if ($dataSkills[$gameVariables.value(96)].meta['rubi']) {
			var variable96Value2 = $dataSkills[$gameVariables.value(96)].meta['rubi'].replace(' ', '');
			var variable96Value = `${variable96Value2}\n${variable96Value}`;
		};
		$gameScreen.dWindowFrame = 'ON';
		$gameScreen.dTextAlign = 1;
		$gameScreen.setDTextPicture(`${variable96Value}`, 35);
		$gameScreen.showPicture(100, "", 1, $gameParty.getX(actor.index() + 1), $gameParty.getY(actor.index() + 1) - 50, 100, 100, 0, 0);
		$gameScreen.movePicture(100, 1, $gameParty.getX(actor.index() + 1), $gameParty.getY(actor.index() + 1) - 100, 100, 100, 255, 0, 30);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_pictureScreenBlackOut = function () {
		var value1 = 128; var value4 = 0;
		if ($gameScreen.picture(5) || $gameScreen.picture(70)) {
			var value1 = -128; var value4 = -128;
		};
		var talkSet = valueTalkSet;
		var ScreenBlackOut = 'ScreenBlackOut';
		$gameScreen.showPicture(talkSet[0], ScreenBlackOut, 1, 640 - 128 + value1, 384, 100, 100, 150, 0);
		var Town014 = 'Town014';　//中心から円状に表示
		picture_fade1(talkSet[0], "fadeIn", Town014, talkSet[2], 5);
		$gameScreen.showPicture(talkSet[0] + 1, talkSet[1], 1, 640 + value4 + 20, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(talkSet[0] + 1, 1, 640 + value4, 384, 100, 100, 255, 0, talkSet[2]);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_readVariableRandomWork1ConversationGabCommon = function (interp) {
		return (function () {
			var variable21Value = $gameVariables.value(21);
			this.character(variable21Value).requestAnimation(199);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_forceMoveRouteCharactersRandomWork1 = function (interp) {
		return (function () {
			var variable21Value = $gameVariables.value(21);
			var value5 = $gameMap.event(variable21Value).x; var value6 = $gameMap.event(variable21Value).y;
			var args = new Array("190", String(value5), String(value6));
			this.pluginCommand("ERS_MAKE_TEMPLATE", args);
			this.character(variable21Value).forceMoveRoute({
				"list": [
					{ "code": 32 }, { "code": 34 }, { "code": 36 }, { "code": 37 }, { "code": 19 },
					{ "code": 44, "parameters": [{ "name": "Z_Collaps", "volume": 50, "pitch": 70, "pan": 0 }] },
					{ "code": 45, "parameters": ["this._spriteOffsetX = -20;"] }, { "code": 35 },
					{ "code": 45, "parameters": ["this.setAngle(45);"] }, { "code": 35 },
					{ "code": 0 }], "repeat": false, "skippable": true
			});
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_showPictureConversationGabCommon_2 = function () {
		var talkSet = valueTalkSet;
		$gameScreen.setDTextPicture(talkSet[1], talkSet[0]);
		$gameScreen.dWindowFrame = 'ON';
		if (talkSet[2] == 0) {
			$gameScreen.showPicture(102, '', 0, 50, 50, 100, 100, 0, 0);
			$gameScreen.movePicture(102, 0, 100, 50, 100, 100, 255, 0, 60);
		} else {
			$gameScreen.showPicture(102, '', 1, 640 - 50, 384, 100, 100, 0, 0);
			$gameScreen.movePicture(102, 1, 640, 384, 100, 100, 255, 0, 60);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_showPictureConversationGabCommon_3 = function () {
		var pictureId = 101;
		var value2 = '/img/talkface/99Actor99_s0';
		$gameScreen.showPicture(pictureId, value2, 1, 640 + 600, 384 + 100, 0, 0, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 + 500, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_playSeConversationGabCommon = function () {
		var talkSet = valueTalkSet;
		AudioManager.playSe({ "name": talkSet[0], "volume": talkSet[1], "pitch": talkSet[2], "pan": 0 });
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_startAnimation = function () {
		var talkSet = valueTalkSet;
		$gameScreen.startAnimation(talkSet[0], talkSet[1], talkSet[2], talkSet[3]);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_setPicturesAnimationConversationGabCommon = function () {
		var talkSet = valueTalkSet;
		var actor = $gameActors.actor(talkSet[1]);
		if (talkSet[0] == 2) {
			$gameScreen.setPicturesAnimation(2, 10, "連番", talkSet[2]);
			pic_locationSet(92, 99, "/img/talkface/" + talkSet[1] + "ActorHypnosisEye_0", 60, 0);
			$gameScreen.picture(99).startAnimationFrame(3, true, [1, 1, 1, 2]);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_setStateCounterConversationGabCommon = function () {
		var talkSet = valueTalkSet;
		var actor = $gameActors.actor(talkSet[1]);
		if (talkSet[0] == 1) {
			actor.addState(782);
			actor.setStateCounter(782, talkSet[2]);
		};
		if (talkSet[0] == 0) {
			actor.removeStateCounter(782);
			actor.removeState(782);
			pic_move1(99, 0, 0, 100, 100, 0, 120);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_waitConversationGabCommon = function (interp) {
		return (function () {
			var talkSet = valueTalkSet;
			var actor = $gameActors.actor(talkSet[1]);
			if (talkSet[0] == 1) { actor.addState(784) };
			if (talkSet[0] == 2) { pic_locationSet(91, 92, "/img/talkface/" + talkSet[1] + "ActorCloudyEye3", 120, 0) };
			if (talkSet[0] == 0) {
				actor.removeState(784);
				pic_move1(92, 0, 0, 100, 100, 0, 120);
				if ($gameScreen.picture(91)) { var picture = $gameScreen.picture(91).x() };
				if ($gameScreen.picture(93)) { var value2 = $gameScreen.picture(93).x() };
				pic_move1(93, picture - value2, 0, 100, 100, 0, 10);
				this.wait(15);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_movePicture1ConversationGabCommon = function () {
		var talkSet = valueTalkSet;
		if (talkSet[0] == 0) {
			pic_move1(93, 0, 0, 100, 100, 255, 60);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_showPictureConversationGabCommon_4 = function () {
		if ($gameScreen.brightness() === 0 || !$gameScreen.picture(6) && !$gameScreen.picture(70)) {
			var value1 = 640;
		} else {
			var value1 = 640 - 128;
		};
		$gameScreen.dTextRealTime = 'ON';
		$gameScreen.dTextAlign = 0;
		$gameScreen.dWindowFrame = 'ON';
		$gameScreen.setDTextPicture(valueTalkSet[2], valueTalkSet[1]);
		$gameScreen.showPicture(102, '', 1, value1 - 50, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(102, 1, value1, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_brightnessIlluminationW = function () {
		var illuminationW = 'illumination_w';
		$gameScreen._particle.particlePlay(0, illuminationW, 'screen', 'def', 'screen');
		$gameScreen._particle.particleUpdate([illuminationW, 'emitterLifetime', '1']);
		if ($gameScreen.brightness() === 0 || !$gameScreen.picture(6) && !$gameScreen.picture(70)) { } else {
			$gameScreen._particle.particleUpdate([illuminationW, 'pos', -128, 0]);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_showPictureConversationGabCommon_5 = function () {
		if ($gameScreen.brightness() === 0 || !$gameScreen.picture(6) && !$gameScreen.picture(70)) {
			var value1 = 640;
		} else {
			var value1 = 640 - 128;
		};
		$gameScreen.dTextRealTime = 'ON';
		$gameScreen.dTextAlign = 0;
		$gameScreen.dWindowFrame = 'ON';
		$gameScreen.setDTextPicture(valueTalkSet[2], valueTalkSet[1]);
		$gameScreen.showPicture(102, '', 1, value1 - 20, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(102, 1, value1, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_brightnessDirectScreenRing = function () {
		var directScreenRing = 'direct_screenRing';
		$gameScreen._particle.particlePlay(0, directScreenRing, 'screen', 'def', 'screen');
		var value3 = '#07c5ff';
		var value4 = '#ffffff';
		$gameScreen._particle.particleUpdate([directScreenRing, 'color', String(value3), String(value4)]);
		if ($gameScreen.brightness() === 0 || !$gameScreen.picture(6) && !$gameScreen.picture(70)) { } else {
			$gameScreen._particle.particleUpdate([directScreenRing, 'pos', -128, 0]);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_configureMapEventConversationGabCommon = function () {
		var talkSet = valueTalkSet;
		if (talkSet[2] >= 1) {
			valueCountSet1 = talkSet[2];
		} else {
			for (var id = 10; id > 0; id--) {
				if (!!$gameMap.event(id)) {
					valueCountSet1 = id;
					break;
				}
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_spawnMapEventConversationGabCommon = function () {
		var talkSet = valueTalkSet;
		if (talkSet[0] == 1) {
			var event = $gameMap.event(valueCountSet1)._realX;
			var value2 = $gameMap.event(valueCountSet1)._realY;
			$gameMap.spawnEvent(146, event, value2, true);
			valueBlackScreenId = $gameMap.getLastSpawnEventId();
			var event = $gameMap.event(valueBlackScreenId);
			event.setOpacity(talkSet[1]);
			event._spriteOffsetY += 368;
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:60|会話コモンGabなど
	AGH_setMapEventOpacityConversationGabCommon = function () {
		var talkSet = valueTalkSet;
		if (talkSet[0] == 0) {
			if (valueBlackScreenId >= 1) {
				var event = $gameMap.event(valueBlackScreenId);
				event.setOpacity(0);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:62|スクリプト演出コモン
	AGH_showPictureScriptCommonVariable1 = function (interp) {
		return (function () {
			var args = new Array(String($gameVariables.value(121)), "1", "横", String($gameVariables.value(123)));
			this.pluginCommand("PA_INIT", args);
			$gameScreen.showPicture($gameVariables.value(124), $gameVariables.value(122), 1,
				$gameVariables.value(126), $gameVariables.value(127), 100, 100, 255, 0)
			var args = new Array(String($gameVariables.value(124)), String($gameVariables.value(125)));
			this.pluginCommand("PA_START_LOOP", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:62|スクリプト演出コモン
	AGH_showPictureScriptCommonVariable1ScriptEffectCommon = function (interp) {
		return (function () {
			var array = [1, 1, 2, 1];
			var args = new Array(String($gameVariables.value(121)), "1", "横", String($gameVariables.value(123)));
			this.pluginCommand("PA_INIT", args);
			$gameScreen.showPicture($gameVariables.value(124), $gameVariables.value(122), 0,
				0, 0, 100, 100, $gameVariables.value(126), $gameVariables.value(127));
			var args = new Array(String($gameVariables.value(124)), String($gameVariables.value(125)), String(array));
			this.pluginCommand("PA_START_LOOP", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_forceMoveRouteCharactersScriptCommonVariable1ScriptSystemCommon = function (interp) {
		return (function () {
			this.character($gameVariables.value(121)).forceMoveRoute({
				"list": [{ "code": 41, "parameters": [$gameVariables.value(125), $gameVariables.value(126)] }]
			})
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_readVariableScriptCommonVariable1 = function (interp) {
		return (function () {
			character = this.character($gameVariables.value(121))
			character.locate($gameVariables.value(122), $gameVariables.value(123))
			character.setDirection($gameVariables.value(124))
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_readVariablePartyDisbandOrder = function () {
		var array = $gameVariables.value(511);
		for (var i = 0; i < array.length - 1; i++) {
			if ($gameVariables.value(512) - 1 >= i) {
				if (!$gameParty.members().contains($gameActors.actor(array[i]))) {
					$gameParty.addActor(array[i])
					$gameActors.actor(array[i]).refresh();
					//console.log(array[i]);
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_readVariablePartyDisbandOrderScriptSystemCommon = function () {
		var array = $gameVariables.value(511);
		for (var i = 0; i < array.length - 1; i++) {
			if ($gameVariables.value(512) - 1 <= i) {
				if (!$gameParty.members().contains($gameActors.actor(array[i]))) {
					$gameParty.addActor(array[i])
					$gameActors.actor(array[i]).refresh();
					//console.log(array[i]);
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_readVariableCurrentViewHeroId = function () {
		for (var i = 1; i <= 20; i++) { $gameParty.removeActor(i) }
		$gameParty.addActor($gameVariables.value(11))
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_runPluginCommandActorChoice = function (interp) {
		return (function () {
			var variable20Value = $gameVariables.value(20);
			var args = new Array(String(variable20Value));
			this.pluginCommand("NF_NPC削除", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_readVariableActorChoiceScriptSystemCommon = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		var messageText = `${actor.nickname() + actor.name()}がパーティから離脱した。`
		CommonPopupManager.showInfo({}, messageText, null);
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_runPluginCommandActorChoiceScriptSystemCommon = function (interp) {
		return (function () {
			var variable20Value = $gameVariables.value(20);
			var args = new Array(String(variable20Value), '1');
			this.pluginCommand("NF_NPC追加", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_readVariableActorChoice_2 = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		$gameParty.setMenuActor(actor);
		SceneManager.push(Scene_Status);
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_addCustomChoiceScriptSystemCommon = function () {
		for (var i = 0; i < 9; i++) {
			const id = 1; const choiceParams = {
				text: $gameSystem.saveEquipCommandNameArray[i],
				value: i + 1
			};
			$gameSystem.addCustomChoice(id, choiceParams);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_readVariableCharacterIdScriptSystemCommon = function (interp) {
		return (function () {
			//場面転換時に苗字代入
			var list = $gameVariables.value(248);
			list.forEach(function (id) {
				$dataWeapons[id + 200].name = $gameVariables.value(id + 380)[50];
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:64|スクリプトシステムコモン
	AGH_iteratePartyMembersERSMAKETEMPLATE = function (interp) {
		return (function () {
			var actor = $gameActors.actor($gameVariables.value(121)).index();
			if ($gameParty.members().contains($gameParty.members()[actor])) {
				if ($gameParty.members()[actor].actorId() == $gameVariables.value(11)) { } else {
					var memberIndex = $gameParty.members()[actor].actorId() + 20;
					var args = new Array(String(memberIndex), String(this.character(-1).x), String(this.character(-1).y + 1));
					this.pluginCommand("ERS_MAKE_TEMPLATE", args);
					var args = new Array("21"); this.pluginCommand("ERS_GET_LAST_SPAWN_EVENT_ID", args); $gameVariables.value(342)[memberIndex - 20] = $gameVariables.value(21);
					var args = new Array(String($gameVariables.value(342)[memberIndex - 20]), String(actor)); this.pluginCommand("PartyGraphics", args);
					this.character($gameVariables.value(342)[memberIndex - 20]).forceMoveRoute({ "list": [{ "code": 38 }, { "code": 9 }, { "code": 9 }, { "code": 25 }, { "code": 0 }] });
					this.wait(5);
				}
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:66|コンフィグコマンド
	AGH_showPictureConfigPicture = function () {
		if ($gameVariables.value(312) == 'ZX_NowconditionA_') {
			$gameScreen.showPicture(98, $gameVariables.value(312) + $gameVariables.value(11),
				1, 640 + 331 + 500, 384, 100, 100, 0, 0);
			pic_move1(98, -500, 0, 100, 100, 255, 40);
		} else {
			//$gameScreen.showPicture(98,$gameVariables.value(312),
			//1,640+331+50,384+200,100,100,0,0);
			//pic_move1(98,0,-200,100,100,255,40);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:66|コンフィグコマンド
	AGH_readVariableCurrentViewHeroIdConfigCommand = function () {
		var value1 = 1;
		var value2 = "NowconditionActor" + $gameVariables.value(11) + "_" + value1;
		picture_anime1(99, value2, 2, 10, '横', 180, 1, true, [1]);
	};

	// Replaces (1x): CommonEvents.json:common-event:66|コンフィグコマンド
	AGH_setSwitchTrueHeroId = function () {
		var actor = $gameActors.actor($gameVariables.value(2));
		if (actor.isLearnedSkill(796)) {
			$gameSwitches.setValue(161, true);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:66|コンフィグコマンド
	AGH_setSwitchSingleSouwaIncidence = function () {
		var start = 1201;
		var end = 1300;
		for (var i = start; i <= end; i++) {
			if ($gameSwitches.value(i) && !$gameParty.hasItem(i - 800) && !$gameSwitches.value(i + 100)) {
				if ($dataItems[i - 800].meta['singleSouwaIncidence']) { } else {
					$gameSwitches.setValue(162, true);
					break;
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:66|コンフィグコマンド
	AGH_setSwitchAddEventIncidenceSwi = function () {
		for (var i = 1; i <= $dataItems.length - 1; i++) {
			if ($dataItems[i].meta['AddEventIncidenceSwi']) {
				if (Number($dataItems[i].meta['EICSwitch']) == 102) {
					if ($gameSwitches.value(Number($dataItems[i].meta['AddEventIncidenceSwi'])) && !$gameParty.hasItem(i) &&
						!$gameSwitches.value(Number($dataItems[i].meta['AddEventCompSwi']))) {
						if ($dataItems[i].meta['singleSouwaIncidence']) { } else {
							$gameSwitches.setValue(162, true);
							break;
						}
					}
				}
			}
		};
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
		return (function () {
			var value1 = 1;
			pic_anime1(1, 2, "NowconditionActor" + $gameVariables.value(11) + "_" + value1, 180, 99, 3, 200, 0);
			this.setupChild($dataCommonEvents[62].list, 0);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:69|主人公スキル
	AGH_readVariableCurrentViewHeroIdHeroSkill = function () {
		var actor = $gameActors.actor($gameVariables.value(11));
		$gameParty.setMenuActor(actor);
		SceneManager.push(Scene_Skill);
	};

	// Replaces (1x): CommonEvents.json:common-event:76|エロシステム↓
	AGH_inBattle = function () {
		i1 = getRandomIndex(3) + 3;
		var array = [1, 2, 3, 4, 5];
		i2 = array[getRandomIndex(array.length)];
		if ($gameParty.inBattle()) { i3 = $gameTroop.aliveMembers().length };
	};

	// Replaces (1x): CommonEvents.json:common-event:82|文字で効果音ＢＧＳ
	AGH_showOneWordPictureTextSoundEffectBgs = function () {
		var array = [76, 77, 78, 79, 80, 81, 82, 83, 84, 85];
		valueSerialPictureId = array[getRandomIndex(array.length)];
		pic_oneWord(valueSerialPictureId, valueScriptArray2[0],
			valueScriptArray2[1], valueScriptArray2[2], valueScriptArray2[3], valueScriptArray1);
	};

	// Replaces (1x): CommonEvents.json:common-event:82|文字で効果音ＢＧＳ
	AGH_waitTextSoundEffectBgs = function (interp) {
		return (function () {
			var array = [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
			var randomIndex = array[getRandomIndex(array.length)];
			this.wait(randomIndex);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:82|文字で効果音ＢＧＳ
	AGH_waitTextSoundEffectBgs_2 = function (interp) {
		return (function () {
			var value1 = valueScriptArray2[3];
			var value1 = getRandomIndex(41) + value1 - 20;
			this.wait(value1);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:83|夜発情コモン
	AGH_setSelfVariableRandomWork1NightHeatCommon = function (interp) {
		return (function () {
			var start = 63;
			var end = 70;
			var actor = $gameActors.actor($gameVariables.value(20));
			for (var i = start; i <= end; i++) {
				if (actor.isLearnedSkill(i)) {
					this.sVal(21, $gameVariables.value(21) + 1);
				}
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:83|夜発情コモン
	AGH_setSelfVariableLibido = function (interp) {
		return (function () {
			h_exp($gameVariables.value(20), '0_1_0', 105, false, true, false);
			//ｱｸﾀｰID,ﾋﾟｸﾁｬ,H相手(101ﾓﾌﾞ105対象なし106アイテム),非表示,簡易,過去シーンか否か
			this.sVal(401, getRandomIndex(6) + 5);
			this.sVal(413, 1);
			this.sVal(402, -100);
			//var arr = [1,2,3,4,5];$gameVariables.setValue(401,arr[getRandomIndex(arr.length)]);
			if ($gameSwitches.value(122)) { this.setupChild($dataCommonEvents[85].list, 0) };
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:83|夜発情コモン
	AGH_setSelfVariableLibidoNightHeatCommon = function (interp) {
		return (function () {
			h_exp($gameVariables.value(20), '0_1_0', 105, false, true, false);
			//ｱｸﾀｰID,ﾋﾟｸﾁｬ,H相手(101ﾓﾌﾞ105対象なし106アイテム),非表示,簡易,過去シーンか否か
			this.sVal(401, getRandomIndex(3) + 3);
			this.sVal(402, -100);
			//var arr = [1,2,3,4,5];$gameVariables.setValue(401,arr[getRandomIndex(arr.length)]);
			if ($gameSwitches.value(122)) { this.setupChild($dataCommonEvents[85].list, 0) };
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:85|性欲度等変動表示コモン
	AGH_handleScriptSnippetValueWordSet = function () {
		valueCountSet1 = 0;
		valueCountSet2 = 1;
		var messageText = `\\C[10]H-Passive[${valueCountSet2}]\\C[0]\n`;
		winddow["valueWordSet" + valueCountSet2] = messageText;
	};

	// Replaces (1x): CommonEvents.json:common-event:85|性欲度等変動表示コモン
	AGH_readVariableChoiceSwitch15 = function () {
		//シーン一行表現履歴174,175
		$gameVariables.value(175)[$gameVariables.value(20)] += 1;
		var variable175Value = `[${$gameVariables.value(175)[$gameVariables.value(20)]}]${$gameVariables.value(506)}\n`;
		$gameVariables.value(174)[$gameVariables.value(20)] = $gameVariables.value(174)[$gameVariables.value(20)].concat(variable175Value);
	};

	// Replaces (1x): CommonEvents.json:common-event:85|性欲度等変動表示コモン
	AGH_readVariableChoiceSwitch15DesireChangeDisplayCommon = function () {
		if ($gameVariables.value(175)[$gameVariables.value(20)] >= 101) {
			$gameVariables.value(175)[$gameVariables.value(20)] -= 1;
			$gameVariables.value(174)[$gameVariables.value(20)].shift();
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:85|性欲度等変動表示コモン
	AGH_setSelfVariableHStatusGainText = function (interp) {
		return (function () {
			var value4 = $gameVariables.value(340) - 100;
			if ($gameVariables.value($gameVariables.value(20) + 360)[value4] >= 1) {
				var messageText = `\n${$gameVariables.value(22)}との\\C[27]Ｈ回数：${$gameVariables.value($gameVariables.value(20) + 360)[value4]}\\C[0]`;
				this.sVal(506, $gameVariables.value(506) + messageText);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:85|性欲度等変動表示コモン
	AGH_setScreenDWindowFrame = function () {
		$gameScreen.dWindowFrame = 'ON';
	};

	// Replaces (1x): CommonEvents.json:common-event:86|性欲度等補正コモン
	AGH_initValueCountSet3 = function () {
		valueCountSet3 = 1
	};

	// Replaces (1x): CommonEvents.json:common-event:86|性欲度等補正コモン
	AGH_runScriptDesireAdjustCommon = function () {
		valueCountSet3 += 1
	};

	// Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
	AGH_showPictureDesireInfoDisplay = function () {
		var pictureId = 111;
		$gameScreen.showPicture(pictureId + 7, "", 1, 1024, 384, 100, 100, 255, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
	AGH_erasePictureDesireInfoDisplay = function () {
		var pictureId = 111;
		$gameScreen.erasePicture(pictureId + 7);
	};

	// Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
	AGH_showPictureHStatusPictureTemp = function () {
		if ($gameVariables.value(193) != 0) {
			var value1 = 111;
			$gameScreen.showPicture(value1, $gameVariables.value(193), 1, 1024, 384, 100, 100, 255, 0);
			var array = ['Hscene005', 'Hscene029', 'Hscene061', 'Hscene099', 'Hscene105', 'Hscene123', 'Hscene183']
			var value1 = array[getRandomIndex(array.length)];
			picture_fade1(51, "fadeIn", value1, 60, 5);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
	AGH_setSwitchActorChoice = function (interp) {
		return (function () {
			var actor = $gameActors.actor($gameVariables.value(20));
			var list = valueHstateDisplay;
			list.forEach(function (id) {
				if (actor.isStateAffected(id)) {
					$gameSwitches.setValue(161, true);
				};
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
	AGH_setSwitchChoiceSwitch15 = function () {
		if ($gameVariables.value(175)[$gameVariables.value(20)] >= 1) {
			$gameSwitches.setValue(165, true);
		};
		$gameSwitches.setValue(166, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
	AGH_erasePictureDesireInfoDisplay_2 = function () {
		for (var i = 111; i <= 125; i++) {
			if ($gameScreen.picture(i)) {
				UTSU.PictureBreath.off([i]);
				UTSU.PictureBreath2.off([i]);
				$gameScreen.erasePicture(i);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:87|性欲度等情報表示
	AGH_readVariableActorChoiceDesireInfoDisplay = function () {
		var array = $gameVariables.value($gameVariables.value(20) + 380)[61];
		var value2 = $gameVariables.value($gameVariables.value(20) + 380)[27];
		var value3 = $gameVariables.value($gameVariables.value(20) + 380)[1];
		var value4 = $gameVariables.value($gameVariables.value(20) + 380)[64];
		var value5 = $gameVariables.value($gameVariables.value(20) + 380)[71];
		valueWordSet0 = `本日Ｈ回数：${value1}回　`;
		if (value5 >= 1) { valueWordSet0 += `（本日中に犯されている…）` };
		if (value2 >= 1) { valueWordSet0 += `\n売春獲得総金額：${value2}\G　` };
		if (value3 >= 500 && value4 >= 1) { valueWordSet0 += `\n禁欲日数：${value4}日　` };
	};

	// Replaces (1x): CommonEvents.json:common-event:88|
	AGH_ceil = function () {
		value1 = Math.ceil(value1);
	};

	// Replaces (1x): CommonEvents.json:common-event:89|Hステ上昇時スキル習得コモン
	AGH_initValueCountSet1 = function () {
		valueCountSet1 = 0;//文言追加用
		valueCountSet2 = 1;
		const expText = colorTaggedText(10, "<H-Passive Expression!>");
		var messageText = `\\FS[28]${expText}\\FS[25]\n`;
		window['valueWordSet' + valueCountSet2] = messageText
	};

	// Replaces (1x): CommonEvents.json:common-event:93|自動出産コモン
	AGH_showPictureScreenBlackOutAutoBirthCommon = function () {
		const picId = 55;
		valuePic1 = picId;
		$gameScreen.showPicture(picId, 'ScreenBlackOut', 1, 640, 384, 100, 100, 150, 0);
		picture_fade1(picId, "fadeIn", valueWipeImg, 60, 5);
		pic_1(0, picId + 1, 'Zev_childbirth', 0, 100, 255, 80, 1280, 768, -256, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:93|自動出産コモン
	AGH_readVariableAppearanceCharacterStartAutoBirthCommon = function () {
		var start = $gameVariables.value(75);
		var end = $gameVariables.value(76);
		for (var j = start; j <= end; j++) {
			actor = $gameActors.actor(j);
			if (actor.isStateAffected(83)) {
				//actor.addStateCounter(83, +100);
				actor_pregnancyCalculation(j);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:93|自動出産コモン
	AGH_setSelfSwitchAutoBirthCommon = function () {
		for (var i = 1; i <= 20; i++) {
			$gameSelfSwitches.setValue([$gameMap.mapId(), i, 'A'], false);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
	AGH_setSelfVariableRandomWork10 = function (interp) {
		return (function () {
			var actor = $gameActors.actor($gameVariables.value(20));
			if (actor.isLearnedSkill(68)) {
				this.sVal(30, $gameVariables.value(30) + 1);
			};
			if (actor.isLearnedSkill(69)) {
				this.sVal(30, $gameVariables.value(30) + 1);
			};
			if (actor.isLearnedSkill(70)) {
				this.sVal(30, $gameVariables.value(30) + 1);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
	AGH_setSelfVariableSkillUserName = function (interp) {
		return (function () {
			var actor = $gameActors.actor($gameVariables.value(20));
			actor.removeState(79);
			actor.addState(82);
			this.sVal(94, actor.name());
			actor.setStateCounter(82, 0);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
	AGH_showPictureActorChoice = function () {
		var pictureId = 60;
		var value1 = 'FertilizationActor' + $gameVariables.pictureId(20);
		$gameScreen.showPicture(pictureId + 1, value1 + '_1', 1, 1280 / 2 + 50, 768 / 2, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId + 1, 1, 1280 / 2, 768 / 2, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
	AGH_startFlash = function () {
		var randomIndex = getRandomIndex(41) + 180;
		var value2 = getRandomIndex(21) + 50;
		$gameScreen.startFlash([255, 119, 255, randomIndex], value2);
	};

	// Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
	AGH_showPictureActorChoiceFertilizationCommon = function (interp) {
		return (function () {
			var pictureId = 60;
			var value1 = 'FertilizationActor' + $gameVariables.pictureId(20);
			$gameScreen.showPicture(pictureId + 10, value1 + '_2', 1, 1280 / 2, 768 / 2, 100, 100, 0, 0);
			$gameScreen.movePicture(pictureId + 10, 1, 1280 / 2, 768 / 2, 100, 100, 255, 0, 60);
			this.wait(60);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
	AGH_showPictureFertilizationDirect = function (interp) {
		return (function () {
			var value = 60;
			for (var i = 1; i <= 4; i++) { $gameScreen.showPicture(i + 1 + value, 'FertilizationDirect' + i, 1, 1280 / 2, 768 / 2, 100, 100, 255, 0) };
			this.wait(120);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
	AGH_movePictureFertilizationCommon = function (interp) {
		return (function () {
			var pictureId = 60;
			$gameScreen.movePicture(pictureId + 10, 1, 1280 / 2 - 300, 768 / 2 + 800, 1000, 1000, 0, 0, 240);
			this.wait(240);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
	AGH_movePictureFertilizationCommon_2 = function (interp) {
		return (function () {
			var value = 60;
			$gameScreen.movePicture(4 + 1 + value, 1, 1280 / 2 - 300, 768 / 2 + 800, 1000, 1000, 0, 0, 300);
			this.wait(300);
			AudioManager.stopSe();
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:94|受精コモン演出
	AGH_erasePictureFertilizationCommon = function () {
		for (var i = 60; i <= 80; i++) { $gameScreen.erasePicture(i) };
	};

	// Replaces (1x): CommonEvents.json:common-event:95|妊娠時コモン
	AGH_setSelfVariableSkillUserNamePregnancyCommon = function (interp) {
		return (function () {
			var actor = $gameActors.actor($gameVariables.value(20));
			actor.addStateCounter(82, +10);
			var randomIndex = getRandomIndex(101);
			var threshold = actor.getStateCounter(82) - 50;
			if (threshold >= randomIndex) {
				actor.removeStateCounter(82);
				actor.removeState(82);
				actor.addState(83);
				actor.setStateCounter(83, 0);
				this.sVal(94, actor.name());
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:95|妊娠時コモン
	AGH_setSelfVariableRandomWork2 = function (interp) {
		return (function () {
			//妊娠時の一時的なサイズ増量表現42が体重で以降スリーサイズ
			var variable20Value = $gameVariables.value(20);
			$gameVariables.value(variable20Value + 380)[42] += [7, 8, 9, 10, 11, 12][getRandomIndex(6)];
			$gameVariables.value(variable20Value + 380)[43] += [20, 21, 22, 23, 24, 25][getRandomIndex(6)];
			$gameVariables.value(variable20Value + 380)[44] += [15, 16, 17, 18, 19, 20][getRandomIndex(6)];
			$gameVariables.value(variable20Value + 380)[45] += [3, 4, 5, 6, 7, 8][getRandomIndex(6)];
			this.sVal(22, $gameVariables.value(variable20Value + 380)[42]);
			this.sVal(23, $gameVariables.value(variable20Value + 380)[43]);
			this.sVal(24, $gameVariables.value(variable20Value + 380)[44]);
			this.sVal(25, $gameVariables.value(variable20Value + 380)[45]);
			$gameVariables.value(variable20Value + 380)[15] += 1;
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:97|出産時コモン演出用未使用
	AGH_readVariableAppearanceCharacterStartBirthCommonUnused = function () {
		var start = $gameVariables.value(75);
		var end = $gameVariables.value(76);
		for (var j = start; j <= end; j++) {
			actor = $gameActors.actor(j);
			if (actor.isStateAffected(83)) {
				actor_pregnancyCalculation(j);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:99|コンティニュー処理
	AGH_iterateBattleMembersContinueProcessing = function () {
		for (var i = 0; i < $gameParty.battleMembers().length - 1; i++) {
			var battleMember = $gameParty.battleMembers()[i];
			battleMember.startAnimation(395, false, 0);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:99|コンティニュー処理
	AGH_iteratePartyMembersContinueProcessing = function () {
		$gameParty.members().forEach(function (actor) {
			actor.removeState(24);
		});
	};

	// Replaces (1x): CommonEvents.json:common-event:101|戦闘全滅
	AGH_stopMapPlayerMovementBattleAllOut = function () {
		if (!$gameParty.inBattle()) { $gameTemp.stopMapPlayerMovement() }
	};

	// Replaces (2x): CommonEvents.json:common-event:101|戦闘全滅
	AGH_showPictureScreenBlackOutBattleAllOut = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		const picId = 55;
		valuePic1 = picId;
		$gameScreen.showPicture(picId - 2, 'ScreenBlackOut', 1, 640, 384, 100, 100, 200, 0);
		$gameScreen.showPicture(picId - 1, 'ScreenDarkCloudsH', 1, 640, 384, 100, 100, 150, 0);
		const Town014 = 'Town014';　//中心から円状に表示
		picture_fade1(picId - 2, "fadeIn", Town014, 60, 5);
		picture_fade1(picId - 1, "fadeIn", Town014, 60, 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:101|戦闘全滅
	AGH_showPictureRandomWork1 = function () {
		const actorId = $gameVariables.value(20);
		var actor = $gameActors.actor(actorId);
		let picIndex = 1;
		if (actor.isLearnedSkill(63)) { picIndex = 2 };
		if (actor.isLearnedSkill(65)) { picIndex = 3 };
		var picName = 'Zev_BattleDefeat' + actorId + '_' + picIndex;
		const picId = valuePic1; // valuePic1 is some general named global variable, need to refactor to use input param
		$gameScreen.showPicture(picId, picName, 1, 640 - 128, 384, 150, 150, 0, 0);
		$gameScreen.movePicture(picId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(picId, 1);
		$gameVariables.setValue(21, `${actor.name()}は凌辱された…。`);
	};

	// Replaces (1x): CommonEvents.json:common-event:101|戦闘全滅
	AGH_setSelfVariableHStatusGainTextBattleAllOut = function (interp) {
		return (function () {
			h_exp($gameVariables.value(20), 0, 301, false, false, false);
			//ｱｸﾀｰID,ﾋﾟｸﾁｬ,H相手(301ﾓﾌﾞ305対象なし306アイテム),非表示,簡易,過去シーンか否か
			const name = '\\V[94]';
			this.sVal(506, `${name}は凌辱された…。` + `\n`);
			this.sVal(401, getRandomIndex(3) + 3);
			if ($gameSwitches.value(122)) { this.setupChild($dataCommonEvents[85].list, 0) };
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:101|戦闘全滅
	AGH_allowMapPlayerMovementBattleAllOut = function () {
		if (!$gameParty.inBattle()) {
			$gameTemp.allowMapPlayerMovement();
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:102|戦闘後
	AGH_fillArrayAfterBattle = function () {
		valueAttackAmplifysActorId = Array(21).fill(Array(100).fill(0));
	};

	// Replaces (1x): CommonEvents.json:common-event:102|戦闘後
	AGH_runPluginCommandPortraitPictureId = function (interp) {
		return (function () {
			var list = $gameVariables.value(247);
			list.forEach(function (id) {
				$gameVariables.setValue(300, Number($dataActors[id].meta['tachiePicId']));
				var args = new Array(String(getPreviousTachiePicId()));
				this.pluginCommand("PICT_AFTERIMAGE_REMOVE", args);
				;
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:102|戦闘後
	AGH_setSwitchPassiveOnStatus = function () {
		const partyBattleMembers = $gameParty.battleMembers();
		const partyMembers = $gameParty.members();
		const p100 = colorTaggedText(2, 100);
		const skillIds = [2, 3, 4, 5, 6, 7];
		for (var i = 0; i < partyBattleMembers.length; i++) {
			var battleMember = partyBattleMembers[i];
			if (!partyMembers.contains(battleMember)) continue;

			const anyParamIs100orMore = skillIds.some(function (id) { return battleMember.param(id) >= 100 });
			if (!anyParamIs100orMore) continue;

			// show one time
			var messageText = `一部ステータスが${p100}以上になる事で、そのステータスが上昇するbattleMembersパッシブスキルが習得できるようになります`;
			gab_wordParticle(messageText);
			$gameSwitches.setValue(483, true);
			return;
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:103|戦闘開始時
	AGH_setSelfVariableBattleAverageLuk = function (interp) {
		return (function () {
			this.sVal(516, Math.round($gameParty.battleMembers().reduce(function (prev, member) { return prev + member.luk }, 0) / ($gameParty.battleMembers().length || 1)));
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:103|戦闘開始時
	AGH_setSwitchEnemyStatusCheck = function () {
		if ($gameVariables.value(304)[valueBossEnemyId] >= 1) {
			$gameSwitches.setValue(95, true);
		} else {
			$gameSwitches.setValue(95, false);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:103|戦闘開始時
	AGH_setSwitchEnemyStatusCheckBattleStart = function () {
		if ($gameVariables.value(240) >= 1) {
			if ($gameParty.hasItem($dataItems[$gameVariables.value(240)])) {
				$gameSwitches.setValue(95, true);
			} else {
				$gameSwitches.setValue(95, false);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:103|戦闘開始時
	AGH_iterateTroopMembersAddText = function () {
		for (var i = 0; i < $gameTroop.members().length; i++) {
			var user = $gameTroop.members()[i];
			if (user.isAlive()) {
				BattleManager._logWindow.push(`addText`, `\\C[16]${user.name()}\\C[0] TP\\C[6]${user.tp}%\\C[0]`);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:103|戦闘開始時
	AGH_logBattleText = function () {
		if (BattleManager.canEscape()) {
			if ($gameParty.membersState(233)) {
				var value4 = 100;
			} else {
				var value4 = 0.8 * $gameParty.agility() / $gameTroop.agility();
				if (value4 >= 1) { value4 = 99 } else { value4 = Math.floor(value4 * 100) };
			};
			var value1 = `逃走成功確立:\\C[2]${value4}%\\C[0]`;
		} else {
			var value1 = `\\C[10]逃走不可！\\C[0]`;
		};
		BattleManager._logWindow.push(`addText`, value1);
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_readVariableEnemyLevel = function () {
		//エネミー一定レベル以上で様子を見るを別スキルに変更
		var randomIndex = getRandomIndex(101);
		if (randomIndex >= 40) {
			$dataSkills[890] = $dataSkills[896];
		} else {
			if ($gameVariables.value(270) >= 10) {
				$dataSkills[890] = $dataSkills[891];
			} else {
				$dataSkills[890] = $dataSkills[892];
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_setVariableActorChoiceBattleEachTurn = function () {
		var stateId = 42;
		$gameVariables.setValue(20, 1);
		var actor = $gameActors.actor($gameVariables.value(20));
		BattleManager._logWindow.push(`addText`, `${actor.name()}の${$dataStates[value1].name}耐性率:\\C[10]${actor.stateRate(value1) * 100}\\C[0]%`);
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_movePictureBattleEachTurn = function () {
		var pictureId = 96;
		if ($gameScreen.picture(pictureId)) {
			$gameScreen.movePicture(pictureId, 0, 450, 480, 100, 100, 0, 0, 120);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_erasePicturesBattleEachTurn = function () {
		var array = [...Array(100)].map((_, i) => i + 101);
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
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			var battleMember = $gameParty.battleMembers()[i];
			if (battleMember.isStateAffected(234) && !battleMember.isRestricted()) {
				battleMember.startAnimation(160, false, 0);
				if (battleMember.actorId() != $gameVariables.value(20)) {
					if (battleMember.elementAmplifyRate(15) != 0) {
						valueChainAddPower += Math.round(battleMember.elementAmplifyRate(15) * 100);
					}
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_iterateBattleMembersBattleEachTurn = function () {
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			var battleMember = $gameParty.battleMembers()[i];
			if (battleMember.isStateAffected(234) && !battleMember.isRestricted()) {
				var actor1 = battleMember;
				break;
			}
		};
		if (valueChainSkillId == 0) {
			valueChainSkillId = 98;
		};
		var value1 = valueChainSkillId;
		BattleManager.queueForceAction(actor1, value1, -1);
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_iterateBattleMembersAddText = function () {
		valueCountSet1 = 0;
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			var battleMember = $gameParty.battleMembers()[i];
			if (battleMember.battleSkillsRaw().contains(340)) {
				var value2 = `\\C[2]\\Sin[340]\\C[0]効果が発動！　（×\\C[10]${valueChainMemberCount - 1}\\C[0]）`;
				BattleManager._logWindow.push(`addText`, messageText);
				valueCountSet1 += 1;
				break;
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_iterateBattleMembersBattleEachTurn_2 = function () {
		if (valueCountSet1 >= 1) {
			for (var i = 0; i < $gameParty.battleMembers().length; i++) {
				var battleMember = $gameParty.battleMembers()[i];
				battleMember.startAnimation(426, false, 0);
				for (var id1 = 2; id1 <= valueChainMemberCount; id1++) {
					for (var j = 206; j <= 211; j++) {
						battleMember.addState(j);
					}
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_readVariableActor20HCount = function () {
		if ($gameParty.membersState(771)) {
			for (var i = 0; i < $gameParty.battleMembers().length; i++) {
				var battleMember = $gameParty.battleMembers()[i];
				if (battleMember.isStateAffected(771) && battleMember.isAlive()) {
					var array = battleMember._stateCounter[771];
					if (array >= 1) {
						$gameVariables.value(380 + battleMember.actorId())[2] += array;
						var value3 = $gameVariables.value(380 + battleMember.actorId())[2];
						battleMember.setStateCounter(771, 0);
						var value1 = `${actor.name()}の発情度\\C[27]+${array}\\C[0] (${value3})`;
						BattleManager._logWindow.push(`addText`, messageText);
					}
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_readVariableBattleTurnCount = function () {
		for (var j = 0; j < $gameParty.battleMembers().length; j++) {
			var battleMember = $gameParty.battleMembers()[j];
			if ($gameParty.members().contains(battleMember) && battleMember.isAlive()) {
				if ($gameSwitches.value(374)) {
					actor_skilllearn2(battleMember.actorId());
				};
				if (($gameVariables.value(263) % 10) == 0) {
					battleMember.addState(31);
				};
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_setSwitchRank3AttackSkillNotice = function () {
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			var battleMember = $gameParty.battleMembers()[i];
			if ($gameParty.members().contains(battleMember)) {
				if ([101, 111, 121, 131, 141, 151, 161, 171, 181, 191].some(function (id) { return battleMember.skillMasteryLevel(id) >= 3 })) {
					var value1 = `通常攻撃スキルが\\C[2]ランク3\\C[0]になる事で、その武器威力が上昇するパッシブスキルが習得できるようになります`;
					gab_wordParticle(messageText);
					$gameSwitches.setValue(482, true);
					break;
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_runPluginCommandPortraitPictureIdBattleEachTurn = function (interp) {
		return (function () {
			var list = $gameVariables.value(247);
			list.forEach(function (id) {
				$gameVariables.setValue(300, Number($dataActors[id].meta['tachiePicId']));
				if ($gameActors.actor(id).tp >= 100) {
					var AfterimageRGBList = $dataActors[id].meta['AfterimageRGB'].split(',')[0]; var value2 = $dataActors[id].meta['AfterimageRGB'].split(',')[1]; var value3 = $dataActors[id].meta['AfterimageRGB'].split(',')[2];
					var args = new Array(String(getPreviousTachiePicId()), '20', String(AfterimageRGBList), String(value2), String(value3));
					this.pluginCommand("PICT_AFTERIMAGE_ADD", args);
				} else {
					var args = new Array(String(getPreviousTachiePicId()));
					this.pluginCommand("PICT_AFTERIMAGE_REMOVE", args);
				}
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:104|戦闘毎ターン
	AGH_iterateBattleMembersBattleEachTurn_3 = function () {
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			var battleMember = $gameParty.battleMembers()[i];
			if (battleMember.isStateAffected(61) && battleMember.isAlive()) {
				var randomIndex = getRandomIndex(101);
				seiyoku_skillProbabilityUp1(battleMember);
				randomIndex += valueCountSet3;
				if (randomIndex >= 90) {
					battleMember.addState(65);
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:105|戦闘マップ全滅ボーナス
	AGH_readVariableDungeonInfoItem = function () {
		valueWordSet0 = `\\C[1]<${$dataItems[$gameVariables.value(240)].name}>\\C[0]出現エネミーの殲滅が完了！`;
	};

	// Replaces (1x): CommonEvents.json:common-event:105|戦闘マップ全滅ボーナス
	AGH_resetValueWordSet0 = function () {
		valueWordSet0 = 0;
	};

	// Replaces (1x): CommonEvents.json:common-event:105|戦闘マップ全滅ボーナス
	AGH_setDTextPictureBattleMapAllOutBonus = function () {
		var wordSet = valueWordSet1;
		var value2 = 28;
		$gameScreen.setDTextPicture(wordSet, value2);
	};

	// Replaces (1x): CommonEvents.json:common-event:105|戦闘マップ全滅ボーナス
	AGH_gainItemRandomWork1 = function () {
		var variable240Value = $dataItems[$gameVariables.value(240)].meta['firstAnnihilationItem'].split(',');
		if (Number(variable240Value[0]) == 0) { valueItems = $dataItems[Number(variable240Value[1])] };
		if (Number(variable240Value[0]) == 1) { valueItems = $dataWeapons[Number(variable240Value[1])] };
		if (Number(variable240Value[0]) == 2) { valueItems = $dataArmors[Number(variable240Value[1])] };
		$gameParty.gainItem(valueItems, 1);
		var messageText = `\\C[2]<初回殲滅特典>\\C[0]\x1bI[${valueItems.iconIndex}]${valueItems.name}を入手した！`;
		$gameScreen.setDTextPicture(messageText, 28);
		$gameVariables.setValue(21, `${valueItems.description}`);
	};

	// Replaces (1x): CommonEvents.json:common-event:106|
	AGH_readVariableActorChoiceCommonEvent106 = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		var clothes = $gameVariables.value(243);
		BattleManager._logWindow.push(`addText`, `${actor.name()}の${clothes}が破損した！`);
	};

	// Replaces (1x): CommonEvents.json:common-event:106|
	AGH_iterateItemsSetTint = function (interp) {
		return (function () {
			if ($dataItems[$gameVariables.itemMeta(244)].meta['色相']) {
				var itemMeta = $dataItems[$gameVariables.itemMeta(244)].meta['色相'];
				var args = new Array("42", String(itemMeta));
				this.pluginCommand("SetTint", args);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:106|
	AGH_runPluginCommandDamagedPartItemId = function (interp) {
		return (function () {
			if ($dataItems[$gameVariables.MetaList(244)].meta['色相2']) {
				var MetaList = $dataItems[$gameVariables.MetaList(244)].meta['色相2'].split(',')[2];
				var args = new Array("44", String(MetaList));
				this.pluginCommand("SetTint", args);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:106|
	AGH_setPictureOpacityCommonEvent106 = function () {
		$gameScreen.picture(42)._opacity = 255;
		if ($gameScreen.picture(44)) {
			$gameScreen.picture(44)._opacity = 255;
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:109|ダメージ時破損コモン
	AGH_setSwitchCostumeDamaged = function () {
		var array = $gameVariables.value($gameVariables.value(20) + 380)[4];
		if (array <= 49) { $gameSwitches.setValue(438, true) };
	};

	// Replaces (1x): CommonEvents.json:common-event:109|ダメージ時破損コモン
	AGH_setVariableRestrainedEnemyMove = function () {
		if ($dataSystem.optSideView) {
			var value1 = $gameVariables.value(92) + 1;
			$gameVariables.setValue(703, [$gameTroop.getX(value1), $gameTroop.getY(value1)]);
			var actor = $gameActors.actor($gameVariables.value(20)).index() + 1;
			$gameVariables.setValue(704, [$gameParty.getX(actor), $gameParty.getY(actor)]);
			$gameTroop.set(value1, $gameVariables.value(704)[0] - 100, $gameVariables.value(704)[1], 30);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:109|ダメージ時破損コモン
	AGH_aliveMembers = function (interp) {
		return (function () {
			if ($gameTroop.aliveMembers().length >= 1) {
				var value3 = $gameTroop.aliveMembers().length;
			} else {
				var value3 = 1;
			};
			h_exp3(1, value3, value3, 0, 0, 0, 0, 0, 0, 0, 0);//10
			//0セク1乳2尻揉3失禁4潮吹5売春6妊7子8中だ9ｱﾅﾙ出し10口飲
			this.setupChild($dataCommonEvents[85].list, 0);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:109|ダメージ時破損コモン
	AGH_erasePicturesDamageBreakCommon = function () {
		var array = [54, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];
		pic_eraseP(0, array);
	};

	// Replaces (1x): CommonEvents.json:common-event:110|Ｈ攻撃時コモン
	AGH_setVariableHbgvTarget = function () {
		var variable20Value = $gameVariables.value(20);//文字HBGV
		$gameVariables.setValue(318, variable20Value);
		$gameVariables.setValue(706, [640, 384, 1, 60, 0, 0]);
	};

	// Replaces (1x): CommonEvents.json:common-event:110|Ｈ攻撃時コモン
	AGH_setSelfVariableLibidoHAttackCommon = function (interp) {
		return (function () {
			this.sVal(401, getRandomIndex(11) + 10);
			if ($gameSwitches.value(122)) { this.setupChild($dataCommonEvents[85].list, 0) };
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:110|Ｈ攻撃時コモン
	AGH_readVariableActorChoiceHAttackCommon = function () {
		valueBattleSexCountArr[$gameVariables.value(20)] += 1;
	};

	// Replaces (1x): CommonEvents.json:common-event:110|Ｈ攻撃時コモン
	AGH_setSwitchTemporarySwitchHAttackCommon = function () {
		$gameSwitches.setValue(380, false);
		var value1 = $gameVariables.value($gameVariables.value(20) + 380)[1];
		var value1 = Math.floor(value1 / 100);
		var value1 = value1 * 2;
		var variable20Value = valueBattleSexCountArr[$gameVariables.value(20)];
		var messageText = `性交回数:\\C[27]${variable20Value}\\C[0] / 性交限界回数:\\C[2]${value1}\\C[0]`;
		BattleManager._logWindow.push(`addText`, messageText);
		if (variable20Value >= value1) {
			$gameSwitches.setValue(380, true);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:110|Ｈ攻撃時コモン
	AGH_setVariableRandomWork1 = function () {
		if ($dataActors[$gameVariables.value(20)].meta['SexualBattleEndLow']) {
			var actor = $gameActors.actor($gameVariables.value(20));
			var value3 = 'Low'; var value4 = 22;
			if ($gameActors.actor($gameVariables.value(20)).isLearnedSkill(62)) { var value3 = 'Middle'; var value4 = 34 };
			if ($gameActors.actor($gameVariables.value(20)).isLearnedSkill(65)) { var value3 = 'Hi'; var value4 = 36 };
			var actorData = $dataActors[$gameVariables.value(20)].meta['SexualBattleEnd' + value3].split(',');
			var randomIndex = actorData[getRandomIndex(actorData.length)];
			var value2 = `${actor.name()}`;
			$gameVariables.setValue(21, `\\nw[${messageText}]${randomIndex}`);
			valueFaceSelect = value4;
			battle_bustUp(51, 500, 10, 40);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:111|衣装全損
	AGH_setVariableActor20Costume = function (interp) {
		return (function () {
			valueCountSet2 = [];
			var list = [20, 21, 22, 23, 25, 28];
			list.forEach(function (id) {
				clothes_hason1([id], 0);
				valueCountSet2.push($gameVariables.value(244));
				$gameVariables.setValue(460 + id, 0);
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:111|衣装全損
	AGH_setVariableDamagedPartItemId = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		for (var i = 0; i <= valueCountSet2.length - 1; i++) {
			if (valueCountSet2[i] >= 1) {
				$gameVariables.setValue(244, valueCountSet2[i]);
				var messageText = `${actor.name()}の${$dataItems[valueCountSet2[i]].name}が破損した！`;
				if ($gameParty.inBattle()) {
					BattleManager._logWindow.push(`addText`, messageText);
				} else {
					CommonPopupManager.showInfo({}, messageText, null);
				};
				clothes_hason2(0, 1);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:112|衣装通常破損
	AGH_readVariableActorChoiceCostumeNormalDamage = function () {
		var array = $gameVariables.value($gameVariables.value(20) + 380)[4];
		var actor = $gameActors.actor($gameVariables.value(20));
		var clothes = $gameVariables.value(243);
		var messageText = `${actor.name()}の${clothes}が破損した！　（現在露出値:${value1}）`;
		if ($gameParty.inBattle()) {
			BattleManager._logWindow.push(`addText`, messageText);
		} else {
			CommonPopupManager.showInfo({}, messageText, null);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:113|戦闘絶頂表現
	AGH_readVariableActorChoiceBattleClimaxExpression = function () {
		h_BattleEcstasyDirect();
		$gameVariables.value($gameVariables.value(20) + 380)[2] = 0;
	};

	// Replaces (1x): CommonEvents.json:common-event:120|雑魚戦闘用
	AGH_setup = function (interp) {
		return (function () {
			BattleManager.setup(valueCountSet1, valueCountSet2, true);
			BattleManager.setEventCallback(function (n) { this._branch[this._indent] = n; }.bind(this));
			$gamePlayer.makeEncounterCount();
			SceneManager.push(Scene_Battle);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:120|雑魚戦闘用
	AGH_forceMoveRouteCharactersDungeonInfoItem = function (interp) {
		return (function () {
			var randomIndex = [-45, 45, -90, 90][getRandomIndex(4)];
			if (randomIndex == 90) { var value2 = -24 }; if (randomIndex == 45) { var value2 = -12 };
			if (randomIndex == -90) { var value2 = 24 }; if (randomIndex == -45) { var value2 = 12 };
			this.character(this._eventId).forceMoveRoute({
				"list": [{
					"code": 41,
					"parameters": [$dataItems[$gameVariables.value(240)].meta.EnemyGraphic.split(',')[0],
					Number($dataItems[$gameVariables.value(240)].meta.EnemyGraphic.split(',')[1])]
				},
				{ "code": 15, "parameters": [10] },
				{ "code": 45, "parameters": ["this.setAngle(value1);"] },
				{ "code": 45, "parameters": ["this._spriteOffsetX = value2;"] }, { "code": 45, "parameters": ["this._spriteOffsetY = value2;"] },
				{ "code": 32 }, { "code": 34 }, { "code": 35 }, { "code": 37 },
				{ "code": 0 }], "repeat": false, "skippable": true
			});
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:121|ボスその他戦闘用
	AGH_battleBgmName = function () {
		var value1 = $gameSystem.battleBgm().name;
		var value2 = $gameSystem.battleBgm().volume;
		var value3 = $gameSystem.battleBgm().pitch;
		var value4 = $gameSystem.battleBgm().pan;
		AudioManager.playBgm({ "name": value1, "volume": value2, "pitch": value3, "pan": value4 });
	};

	// Replaces (1x): CommonEvents.json:common-event:121|ボスその他戦闘用
	AGH_resetValueBossId = function () {
		valueBossId = 0;
	};

	// Replaces (1x): CommonEvents.json:common-event:121|ボスその他戦闘用
	AGH_readVariableBossBgm = function () {
		if ($gameVariables.value(337) != 0) {
			var variable337Value = $gameVariables.value(337);
			$gameSystem.setBattleBgm({ "name": variable337Value[0], "volume": variable337Value[1], "pitch": variable337Value[2], "pan": variable337Value[3] });
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:121|ボスその他戦闘用
	AGH_setVariableActorChoiceBossBattleUse = function () {
		for (var i = 0; i <= $gameParty.battleMembers().length - 1; i++) {
			var battleMember = $gameParty.battleMembers()[i];
			if (isGirl(battleMember)) {
				$gameVariables.setValue(20, $gameParty.battleMembers()[i].actorId());
				tachie_settei2();
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:121|ボスその他戦闘用
	AGH_pushToArrayBossBattleUse = function (interp) {
		return (function () {
			var value1 = valueTroopId;//直前に入れる戦闘グループ名
			//逃走無効を条件分岐させる？
			BattleManager.setup(value1, false, true);
			BattleManager.setEventCallback(function (n) { this._branch[this._indent] = n; }.bind(this));
			$gamePlayer.makeEncounterCount();
			SceneManager.push(Scene_Battle);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:124|呼びエネミー生成
	AGH_forceMoveRouteCharactersDungeonInfoItemSummonEnemySpawn = function (interp) {
		return (function () {
			this.character($gameVariables.value(223)).forceMoveRoute({
				"list": [{
					"code": 41,
					"parameters": [$dataItems[$gameVariables.value(240)].meta.EnemyGraphic.split(',')[0],
					Number($dataItems[$gameVariables.value(240)].meta.EnemyGraphic.split(',')[1])]
				},
				{ "code": 15, "parameters": [60] },
				{ "code": 29, "parameters": [getRandomIndex(4) + 2] },
				{ "code": 0 }]
			});
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:124|呼びエネミー生成
	AGH_forceMoveRouteCharactersDungeonInfoItemMinionSpawnLatest = function (interp) {
		return (function () {
			this.character($gameVariables.value(223)).forceMoveRoute({
				"list": [{
					"code": 41,
					"parameters": [$dataItems[$gameVariables.value(240)].meta.EnemyGraphic.split(',')[0],
					Number($dataItems[$gameVariables.value(240)].meta.EnemyGraphic.split(',')[1])]
				},
				{ "code": 15, "parameters": [60] }, { "code": 45, "parameters": ["this.setTone(50, -100, 50);"] }, { "code": 0 }]
			});
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:128|エネミー変身コモン
	AGH_resetValueEnemyEntrySetId = function () {
		valueEnemyEntrySetId = 0;
	};

	// Replaces (1x): CommonEvents.json:common-event:128|エネミー変身コモン
	AGH_iterateTroopMembersEnemyTransformCommon = function () {
		var value1 = 0;
		var troopMember = $gameTroop.members()[valueWordSet10];
		var enemyId = troopMember._enemyId;
		if ($dataEnemies[enemyId].meta[valueWordSet9]) {
			var value1 = enemyId;
		};
		valueEnemyEntrySetId = value1;
	};

	// Replaces (1x): CommonEvents.json:common-event:128|エネミー変身コモン
	AGH_iterateTroopMembersEnemyTransformCommon_2 = function () {
		var troopMember = $gameTroop.members()[valueWordSet10];
		var enemyId = troopMember._enemyId;
		var enemy = $dataEnemies[enemyId].meta[valueWordSet9].split(',');
		valueWordSet7 = Number(enemy[4]);
	};

	// Replaces (1x): CommonEvents.json:common-event:128|エネミー変身コモン
	AGH_waitEnemyTransformCommon = function (interp) {
		return (function () {
			var troopMember = $gameTroop.members()[valueWordSet10];
			var enemyId = troopMember._enemyId;
			var enemy = $dataEnemies[enemyId].meta[valueWordSet9].split(',');
			var array = Number(enemy[0]);
			troopMember.startAnimation(array, true, 0);
			var value2 = $dataAnimations[array].frames.length;
			var value3 = 4;
			if ($dataAnimations[array].name.match(/!/)) { var value3 = 1 };
			if ($dataAnimations[array].name.match(/&/)) { var value3 = 2 };
			if ($dataAnimations[array].name.match(/$/)) { var value3 = 3 };
			this.wait(Math.ceil((value2) * value3 / 4));
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:128|エネミー変身コモン
	AGH_iterateTroopMembersEnemyTransformCommon_3 = function () {
		var wordSet = valueWordSet8;
		var troopMember = $gameTroop.members()[valueWordSet10];
		var enemy1 = troopMember._enemyId;
		troopMember.addState(wordSet);
		troopMember.refresh();
	};

	// Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
	AGH_iterateTroopMembersBossAwakenAction = function () {
		a = $gameTroop.members()[0];
	};

	// Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
	AGH_readVariableBossSpecialActionPattern = function () {
		var variable347Value = 0;
		for (var i = 1; i <= 8; i++) {
			if ($gameVariables.value(347)[i][0] == 9) {
				if (a.hpRate() <= $gameVariables.value(347)[i][1] / 100) {
					if (a.meetsSkillConditions($dataSkills[$gameVariables.value(347)[i][2]])) {
						var variable347Value = $gameVariables.value(347)[i][2];
					}
				}
			}
		};
		valueCountSet1 = variable347Value;
	};

	// Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
	AGH_initValueBossAction = function () {
		valueBossAction = valueCountSet1;
	};

	// Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
	AGH_handleScriptSnippetEnemyMiddleChange = function () {
		valueWordSet7 = 0;//会話イベント指定変数
		valueWordSet8 = 551;//付与ステートid
		valueWordSet9 = 'EnemyMiddleChange';//meta判定
		valueWordSet10 = 0;//変身するかしないか判定
	};

	// Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
	AGH_iterateTroopMembersAddTextBossAwakenAction = function () {
		var messageText = `${$gameTroop.members()[0].name()}は真の力を解放した！`;
		BattleManager._logWindow.push(`addText`, messageText);
	};

	// Replaces (1x): CommonEvents.json:common-event:129|ボス覚醒行動
	// `a` (troop member) and `valueBossAction` are implicit globals set by the
	// preceding helpers in the same event, like arr1 in the warp-point event.
	AGH_runBossAwakenAttack = function (interp) {
		attack_keisan1(a, valueBossAction, 1);
		interp.forceAction(a, valueBossAction, -1);
	};

	// Replaces (1x): CommonEvents.json:common-event:130|ボス行動
	AGH_forceAction = function (interp) {
		return (function () {
			if (valueBossAction >= 1) {
				var value100 = valueBossAction;
			} else {
				var value100 = valueBossActionNormal;
			};
			attack_keisan1(BattleManager._subject, value100, 1);
			this.forceAction(BattleManager._subject, value100, -1);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:131|行動条件で設定
	AGH_setSelfVariableRandomWork1SetByActionCondition = function (interp) {
		return (function () {
			var action = BattleManager._action;
			this.sVal(21, BattleManager._action._item._itemId);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:140|カットインコモン
	AGH_checkSwitchBattlePortraitDisabled = function () {
		if (!$gameSwitches.value(131)) { //立ち絵禁止のスイッチで条件分岐
			tachie_syoukyo1(getPreviousTachiePicId());
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:140|カットインコモン
	AGH_fillArrayCutInCommon = function () {
		valueCutInSet1 = Array(7).fill(0);
	};

	// Replaces (1x): CommonEvents.json:common-event:141|会話カットインコモン
	AGH_runPluginCommandNightSpecialWeather = function (interp) {
		return (function () {
			cutin_preparation(5, $gameVariables.value(20));
			this.sVal(251, valueCutInSet);
			var args = new Array(String(valueCutInSet2));
			this.pluginCommand("味方カットイン", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:141|会話カットインコモン
	AGH_updateParticleRandomWork2 = function () {
		var linesSp = 'lines_sp';//集中線
		var variable22Value = $gameVariables.value(22);
		$gameScreen._particle.particleUpdate([linesSp, 'pos', variable22Value, 0]);
	};

	// Replaces (1x): CommonEvents.json:common-event:141|会話カットインコモン
	AGH_showPictureActorChoiceConversationCutInCommon = function () {
		var value1 = 'easeOutBack';
		picture_easingConfiguration(value1);
		var value1 = 100 - valueADVCutinDirect;
		var value2 = 'CutInCG_Actor' + $gameVariables.value(20) + '_' + $gameVariables.value(21);
		var variable22Value = $gameVariables.value(22);
		$gameScreen.showPicture(value1, value2, 1, 640 + variable22Value, 384, 100, 0, 255, 0);
		$gameScreen.movePicture(value1, 1, 640 + variable22Value, 384, 100, 100, 255, 0, 40);
	};

	// Replaces (1x): CommonEvents.json:common-event:141|会話カットインコモン
	AGH_runScriptConversationCutInCommon = function () {
		valueADVCutinDirect += 1;
	};

	// Replaces (1x): CommonEvents.json:common-event:141|会話カットインコモン
	AGH_pictureEaseOutBack = function () {
		var value1 = 'easeOutBack';
		picture_easingConfiguration(value1);
		for (var i = 98; i <= 100; i++) {
			if ($gameScreen.picture(i)) {
				var value1 = $gameScreen.picture(i).x();
				var picture = $gameScreen.picture(i).y();
				$gameScreen.movePicture(i, 1, value1, picture, 100, 0, 0, 0, 30);
			}
		};
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
		if (valueTotalDamageCount >= 100000) {
			var value1 = 'easeOutBounce';
		} else {
			var value1 = 'easeOutBack';
		};
		picture_easingConfiguration(value1);
	};

	// Replaces (1x): CommonEvents.json:common-event:150|トータルダメージ表示変数
	AGH_showPictureOneLineSwitch = function () {
		var pictureId = 96;
		var value2 = valueTotalDamageCount; var value3 = value2.toLocaleString();
		var value4 = 50; var value5 = 400; var value6 = 480;
		if (valueTotalDamageCount <= 9999) { var value4 = 45 };
		if (valueTotalDamageCount >= 100000) { var value4 = 55 };
		if ($gameVariables.value(276) == 2) {
			$gameScreen.setDTextPicture(`\\f[b]\\oc[22]\\f[i]Total${valueTotalDamageCount2}Hit,\\C[10]${value3}\\C[17]Damage!\\C[0]`, value4);
		} else {
			$gameScreen.setDTextPicture(`\\f[b]\\oc[2]\\f[i]Total${valueTotalDamageCount2}Hit,\\C[10]${value3}\\C[17]Damage!\\C[0]`, value4);
		};
		$gameScreen.showPicture(pictureId, "", 0, value5 - 50, value6, 100, 100, 100, 0);
		$gameScreen.movePicture(pictureId, 0, value5, value6, 100, 100, 255, 0, 20);
	};

	// Replaces (1x): CommonEvents.json:common-event:150|トータルダメージ表示変数
	AGH_showPictureTotalDamageDisplay = function () {
		var pictureId = 96;
		var variable330Value = $gameVariables.value(330);
		var value3 = variable330Value.toLocaleString();
		var value4 = 50;
		if ($gameVariables.value(330) <= 9999) { var value4 = 45 };
		if ($gameVariables.value(330) >= 100000) { var value4 = 55 };
		$gameScreen.setDTextPicture(`\\f[b]\\oc[22]\\f[i]Total,\\C[10]${value3}\\C[17]Damage!\\C[0]`, value4);
		if ($gameVariables.value(276) == 2) { var value5 = 850; } else { var value5 = 850 }
		$gameScreen.showPicture(pictureId, "", 0, value5 - 50, 50, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 0, value5, 50, 100, 100, 255, 0, 20);
	};

	// Replaces (1x): CommonEvents.json:common-event:159|露出限界判定時内部処理
	AGH_iterateActorsTachiePicId = function () {
		var variable20Value = Number($dataActors[$gameVariables.value(20)].meta['tachiePicId']);
		var picture = $gameScreen.picture(variable20Value)._x - 600;
		var value3 = $gameScreen.picture(variable20Value)._y;
		var value4 = $gameScreen.picture(variable20Value)._scaleX;
		var value5 = $gameScreen.picture(variable20Value)._scaleY;
		$gameScreen.movePicture(variable20Value, 1,
			picture, value3, value4, value5,
			$gameVariables.value(109),
			0, 120);
	};

	// Replaces (1x): CommonEvents.json:common-event:159|露出限界判定時内部処理
	AGH_setSelfVariableEntryName = function (interp) {
		return (function () {
			var actor = $gameActors.actor($gameVariables.value(20));
			this.sVal(49, actor.name());
			$gameMessage.add(`\\nw[\\V[49]]${$gameVariables.value(21)[0]}`);
			$gameMessage.setFaceImage($gameVariables.value(20) + 'Actor' + $gameVariables.value(21)[1], $gameVariables.value(21)[2]);
			this.setWaitMode('message');
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:159|露出限界判定時内部処理
	AGH_setVariableRandomWork1ExposureLimitInternal = function () {
		var variable19Value = `\\V[49]は\x1bIIN[${$gameVariables.value(19)}]に着替えた。`;
		//CommonPopupManager.showInfo({},variable19Value,null);
		$gameVariables.setValue(21, variable19Value);
	};

	// Replaces (1x): CommonEvents.json:common-event:160|立ち絵処理
	AGH_pluginCommandPCALLCEREMOVE = function (interp) {
		return (function () {
			var args = new Array(String(getPreviousTachiePicId()))
			this.pluginCommand("P_CALL_CE_REMOVE", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:161|主人公先頭グラ指定コモン
	AGH_iterateActorsOtherCharaChip = function (interp) {
		return (function () {
			var variable11Value = $dataActors[$gameVariables.value(11)].meta['OtherCharaChip'].split(',')[0];
			var variable11Value2 = Number($dataActors[$gameVariables.value(11)].meta['OtherCharaChip'].split(',')[1]);

			this.character(-1).forceMoveRoute({
				"list": [{ "code": 41, "parameters": [variable11Value, variable11Value2] }, { "code": 38 }, { "code": 29, "parameters": [4] },
				{ "code": 31 }, { "code": 33 }, { "code": 0 }],
			});
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:165|装着衣装一覧
	AGH_setSelfVariableDressChangeCostume = function (interp) {
		return (function () {
			//装着衣装計上1
			var list = [37, 32, 35, 36, 29, 28, 26, 24, 17, 25, 23, 22, 21, 20, 11, 14, 7, 27, 18];
			list.forEach(function (id) {
				for (var i = 1101; i < $dataItems.length; i++) {
					if (id + 460 == Number($dataItems[i].meta['ClothSwitch']) + 460 &&
						$gameVariables.value(id + 460) == Number($dataItems[i].meta['ClothAllocationNumber'])) {
						if (Number($dataItems[i].meta['EICSwitch']) == 200 || $gameVariables.value(20) == Number($dataItems[i].meta['EICSwitch']) - 180) {
							this.sVal(519, $gameVariables.value(519) + `${$dataItems[i].name}\n`);
						}
					};
				}
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:166|着せ替え
	AGH_showPictureActorChoiceDressUp = function () {
		var pictureId = 6;
		if ($gameSwitches.value(204)) { var value4 = 1 } else { var value4 = 2 };
		if ($gameActors.actor($gameVariables.value(20)).isStateAffected(61)) { var value4 = 3 };
		var value2 = 'Scene_Dress up' + value4;
		var ScreenBlackOut = 'ScreenBlackOut';
		$gameScreen.showPicture(pictureId, value2, 1, 640, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640, 384, 100, 100, 220, 0, 60);
		$gameScreen.showPicture(pictureId + 4, value2, 1, 640, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId + 4, 1, 640, 384, 100, 100, 150, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
	AGH_setVariableRandomWork10 = function () {
		for (var i = 1; i < 100; i++) {
			if (valueRandomSet[i] == $gameVariables.value(19)) {
				$gameVariables.setValue(30, i - 1);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
	AGH_iterateItemsClothType = function (interp) {
		return (function () {
			var value = 460;
			var value3 = '通常'
			for (var i = 1101; i < $dataItems.length; i++) {
				if ($dataItems[i].meta['ClothType'] === value3) {
					if ($gameVariables.value(20) + 380 == Number($dataItems[i].meta['EICSwitch']) || $gameVariables.value(20) + 180 == Number($dataItems[i].meta['EICSwitch']) || 200 == Number($dataItems[i].meta['EICSwitch']) || 400 == Number($dataItems[i].meta['EICSwitch'])) {
						if ($dataItems[i].meta['subCategory'] === $dataItems[$gameVariables.value(19)].meta['subCategory']) {
							var itemMeta = Number($dataItems[i].meta['ClothSwitch']);
							var value2 = Number($dataItems[i].meta['ClothAllocationNumber']);
							this.sVal(value + itemMeta, value2);
						}
					}
				}
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
	AGH_readVariableItemProcessWorkDressUpInterior = function (interp) {
		return (function () {
			var value = 460;
			var variable19Value = $dataItems[$gameVariables.value(19)].meta['ClothType']
			for (var i = 1101; i < $dataItems.length; i++) {
				if ($dataItems[i].meta['ClothType'] === variable19Value) {
					if ($gameVariables.value(20) + 380 == Number($dataItems[i].meta['EICSwitch']) || $gameVariables.value(20) + 180 == Number($dataItems[i].meta['EICSwitch']) || 200 == Number($dataItems[i].meta['EICSwitch']) || 400 == Number($dataItems[i].meta['EICSwitch'])) {
						if ($dataItems[i].meta['subCategory'] === $dataItems[$gameVariables.value(19)].meta['subCategory']) {
							var itemMeta = Number($dataItems[i].meta['ClothSwitch']);
							var value2 = Number($dataItems[i].meta['ClothAllocationNumber']);
							this.sVal(value + itemMeta, value2);
						}
					}
				}
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
	AGH_iterateItemsClothSwitch = function (interp) {
		return (function () {
			var variableId = 460;
			var variable19Value = Number($dataItems[$gameVariables.variableId(19)].meta['ClothSwitch']);
			var variable19Value2 = Number($dataItems[$gameVariables.variableId(19)].meta['ClothAllocationNumber']);
			if ($gameVariables.variableId(variableId + variable19Value) == variable19Value2) {
				this.sVal(variableId + variable19Value, 0);
			} else {
				this.sVal(variableId + variable19Value, variable19Value2);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
	AGH_setVariableMessageWindowWidth = function () {
		var variable20Value = Number($dataActors[$gameVariables.value(20)].meta['tachiePicId']);
		$gameVariables.setValue(311, $gameScreen.picture(variable20Value).origin());
		$gameVariables.setValue(312, $gameScreen.picture(variable20Value).x());
		$gameVariables.setValue(313, $gameScreen.picture(variable20Value).y());
		$gameVariables.setValue(314, $gameScreen.picture(variable20Value).scaleX());
		$gameVariables.setValue(315, $gameScreen.picture(variable20Value).scaleY());
		$gameVariables.setValue(316, $gameScreen.picture(variable20Value).opacity());
	};

	// Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
	AGH_movePictureItemProcessWork = function () {
		var variable20Value = Number($dataActors[$gameVariables.value(20)].meta['tachiePicId']);
		var value2 = 200;
		if ($gameVariables.value(19) == clothSlideUp) { value2 = -200 };
		$gameScreen.movePicture(variable20Value,
			$gameVariables.value(311),
			$gameVariables.value(312),
			$gameVariables.value(313) + value2,
			$gameVariables.value(314),
			$gameVariables.value(315),
			$gameVariables.value(316), 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
	AGH_showTickerMessage = function () {
		var variable355Value = $gameVariables.value(355)[$gameVariables.value(20)][valueCountSet1][50];
		var actor21Name = `${variable355Value}の名称を${$gameActors.actor(21).name()}に変更しました。`;
		TickerManager.show(actor21Name);
		$gameVariables.value(355)[$gameVariables.value(20)][valueCountSet1][50] = $gameActors.actor(21).name();
	};

	// Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
	AGH_readVariableActorChoiceDressUpInterior = function () {
		var start = 0; var end = 41;
		for (var i = start; i <= end; i++) {
			$gameVariables.value(355)[$gameVariables.value(20)][valueCountSet1][i] = $gameVariables.value($gameVariables.value(20) + 440)[i];
		};
		$gameVariables.value(355)[$gameVariables.value(20)][valueCountSet1][49] = 1;
		var variable355Value = $gameVariables.value(355)[$gameVariables.value(20)][valueCountSet1][50];
		var messageText = `現在の衣装状態を${variable355Value}に登録しました。`;
		TickerManager.show(messageText);
	};

	// Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
	AGH_setSwitchRandomWork1 = function () {
		$gameVariables.setValue(21, $gameVariables.value(355)[$gameVariables.value(20)][1][50]);
		$gameVariables.setValue(22, $gameVariables.value(355)[$gameVariables.value(20)][2][50]);
		$gameVariables.setValue(23, $gameVariables.value(355)[$gameVariables.value(20)][3][50]);
		$gameVariables.setValue(24, $gameVariables.value(355)[$gameVariables.value(20)][4][50]);
		if ($gameVariables.value(355)[$gameVariables.value(20)][1][49] == 1) { $gameSwitches.setValue(161, true) };
		if ($gameVariables.value(355)[$gameVariables.value(20)][2][49] == 1) { $gameSwitches.setValue(162, true) };
		if ($gameVariables.value(355)[$gameVariables.value(20)][3][49] == 1) { $gameSwitches.setValue(163, true) };
		if ($gameVariables.value(355)[$gameVariables.value(20)][4][49] == 1) { $gameSwitches.setValue(164, true) };
	};

	// Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
	AGH_setVariableActorChoiceDressUpInterior = function () {
		$gameVariables.value($gameVariables.value(20) + 440)[41] = $gameVariables.value(355)[$gameVariables.value(20)][valueCountSet1][41];
		$gameVariables.value(348)[$gameVariables.value(20)] = $gameVariables.value($gameVariables.value(20) + 440)[41];
		$gameVariables.value($gameVariables.value(20) + 440)[0] = $gameVariables.value(355)[$gameVariables.value(20)][valueCountSet1][0];
		//現在衣装を初期化
		var start = 1; var end = 40;
		for (var i = start; i <= end; i++) {
			$gameVariables.setValue(i + 460, $gameVariables.value(355)[$gameVariables.value(20)][valueCountSet1][i]);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:167|着せ替え中身
	AGH_setVariableChoicePosition = function () {
		for (var i = 1; i < 200; i++) {
			if (valueRandomSet[i] == $gameVariables.value(19)) {
				$gameVariables.setValue(12, i - 1);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:172|星晶獣選択
	AGH_readVariableItemProcessWorkStarBeastSelect = function () {
		valueCountSet1 = 2;
		valueCountSet2 = $gameVariables.value(19);
		item_oneOffBuy(1, valueCountSet1, valueCountSet2, 1);
	};

	// Replaces (1x): CommonEvents.json:common-event:174|一括売却対象指定
	AGH_showWindowTextBulkSellTargetSelect = function () {
		WindowManager.show(0, 0, 0, 984, 80);
		var messageText = ``;
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
		var variable19Value = $gameVariables.value(19);
	};

	// Replaces (1x): CommonEvents.json:common-event:174|一括売却対象指定
	AGH_showWindowTextRandomWork10 = function () {
		if (valueCountArray2[$gameVariables.value(30)] == 0) { var valueItems = $dataItems };
		if (valueCountArray2[$gameVariables.value(30)] == 1) { var valueItems = $dataWeapons };
		if (valueCountArray2[$gameVariables.value(30)] == 2) { var valueItems = $dataArmors };
		var variable19Value = `\x1bI[${valueItems[$gameVariables.value(19)].iconIndex}]${valueItems[$gameVariables.value(19)].name}`;
		if ($gameSelfSwitches.getVariableValue([4, 11 + valueCountArray2[$gameVariables.value(30)], $gameVariables.value(19)]) == 1) {
			$gameSelfSwitches.setVariableValue([4, 11 + valueCountArray2[$gameVariables.value(30)], $gameVariables.value(19)], 0);
			variable19Value += `の一括売却対象指定を解除しました`;
		} else {
			$gameSelfSwitches.setVariableValue([4, 11 + valueCountArray2[$gameVariables.value(30)], $gameVariables.value(19)], 1);
			variable19Value += `を一括売却対象指定に登録しました`;
		};
		WindowManager.drawText(0, variable19Value);
	};

	// Replaces (1x): CommonEvents.json:common-event:174|一括売却対象指定
	AGH_showWindowTextItemProcessWork = function () {
		if (valueCountSet2 == 0) { var valueItems = $dataItems };
		if (valueCountSet2 == 1) { var valueItems = $dataWeapons };
		if (valueCountSet2 == 2) { var valueItems = $dataArmors };
		var variable19Value = `\x1bI[${valueItems[$gameVariables.value(19)].iconIndex}]${valueItems[$gameVariables.value(19)].name}`;
		if ($gameSelfSwitches.getVariableValue([4, 11 + valueCountSet2, $gameVariables.value(19)]) == 1) {
			$gameSelfSwitches.setVariableValue([4, 11 + valueCountSet2, $gameVariables.value(19)], 0);
			variable19Value += `の一括売却対象指定を解除しました`;
		} else {
			$gameSelfSwitches.setVariableValue([4, 11 + valueCountSet2, $gameVariables.value(19)], 1);
			variable19Value += `を一括売却対象指定に登録しました`;
		};
		WindowManager.drawText(0, variable19Value);
	};

	// Replaces (1x): CommonEvents.json:common-event:175|一括売却実行
	AGH_initValueWordSet0 = function () {
		var id3 = valueCountSet3;//件数合計
		var id4 = valueCountSet4.toLocaleString();//個数累計
		var id5 = valueCountSet5.toLocaleString();//金額合計
		var id6 = valueCountSet6.toLocaleString();//変数57合計
		var id7 = valueCountSet7.toLocaleString();//ｱｲﾃﾑID270合計
		valueWordSet0 = `\\C[16]<一括売却結果>\\C[0] \\C[2]${id3}種\\C[0] \\C[3]${id4}個\\C[0] \\C[10]${id5}\G\\C[0]`;
		if (valueCountSet6 >= 1 || valueCountSet7 >= 1) {
			valueWordSet0 += `\n`;
			if (valueCountSet6 >= 1) { valueWordSet0 += `${$dataSystem.variables[57]}:${id6} ` };
			if (valueCountSet7 >= 1) { valueWordSet0 += `\\IIN[${270}]:${id7} ` };
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_setDTextPictureTrainingDollPreset = function () {
		$gameScreen.setDTextPicture(`ダメージ一覧<\\I[75]:${$gameVariables.value(293)[10]}>　　`, 28);
		var counter = 0;
		for (var i = 1; i <= 20; i++) {
			if ($gameVariables.value(293)[i + 10] >= 2) {
				var actor = $gameActors.actor(i);
				var messageText = `${actor.name()}:${$gameVariables.value(293)[i + 10].toLocaleString()}`;
				$gameScreen.setDTextPicture(messageText, 28);
				counter += $gameVariables.value(293)[i + 10];
			}
		};
		$gameScreen.setDTextPicture(`トータル:${value3.toLocaleString()}`, 28);
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_showPictureTrainingDollSetup = function () {
		var pictureId = 100;
		$gameScreen.dWindowFrame = 'ON';
		$gameScreen.showPicture(pictureId, '', 0, 10 + 50, 10, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 0, 10, 10, 100, 100, 255, 0, 20);
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_setVariableActorChoiceTrainingDollSetup = function () {
		var value1 = 1;
		for (var i = 1; i <= 7; i++) {
			if ($gameVariables.value(293)[value1] == i) {
				var variable293Value = $gameVariables.value(293)[value1];
				$gameVariables.setValue(20 + value1, `\x1bI[${$dataStates[variable293Value + 50].iconIndex}]`);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_setVariableActorChoice_2 = function () {
		var value1 = 2;
		for (var i = 1; i <= 4; i++) {
			if ($gameVariables.value(293)[value1] == i) {
				var variable293Value = $gameVariables.value(293)[value1];
				if (variable293Value == 1) { $gameVariables.setValue(20 + value1, `行動しない`) };
				if (variable293Value == 2) { $gameVariables.setValue(20 + value1, `攻撃`) };
				if (variable293Value == 3) { $gameVariables.setValue(20 + value1, `防御`) };
				if (variable293Value == 4) { $gameVariables.setValue(20 + value1, `命乞い`) };
				if (variable293Value == 1 || variable293Value == 4) { $dataEnemies[51].actions[0].skillId = 892 };
				if (variable293Value == 2) { $dataEnemies[51].actions[0].skillId = 1 };
				if (variable293Value == 3) { $dataEnemies[51].actions[0].skillId = 2 };
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_setVariableActorChoice_3 = function () {
		var value1 = 3;
		$gameVariables.setValue(20 + value1, $gameVariables.value(293)[value1]);
		var value1 = 4;
		$gameVariables.setValue(20 + value1, $gameVariables.value(293)[value1]);
		var value1 = 5;
		$gameVariables.setValue(20 + value1, $gameVariables.value(293)[value1]);
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_setVariableActorChoice_4 = function () {
		var value1 = 6;
		for (var i = 0; i <= 20; i++) {
			if ($gameVariables.value(293)[value1] == i) {
				if (i == 0) { $gameVariables.setValue(20 + value1, `種族未設定`) };
				if (i >= 1) { $gameVariables.setValue(20 + value1, `\x1bI[${$dataStates[i + 420].iconIndex}]${$dataStates[i + 420].name}`) };
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_iterateItemsTrainingDollSetup = function () {
		var value1 = 6;
		for (var i = 1; i <= 19; i++) {
			if ($gameParty.hasItem($dataItems[i + 340])) {
				var messageText = `\x1bI[${$dataStates[i + 420].iconIndex}]${$dataStates[i + 420].name}`;
				var value3 = i;
				const id = 1;
				const choiceParams = {
					text: `${value2}`, value: value3
				};
				$gameSystem.addCustomChoice(id, choiceParams);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_setVariableActorChoice_5 = function () {
		var value1 = 6;
		$gameVariables.value(293)[value1] = $gameVariables.value(31);
		if ($gameVariables.value(293)[value1] == 0) { $gameVariables.setValue(20 + value1, `種族未設定`) };
		if ($gameVariables.value(293)[value1] >= 1) { $gameVariables.setValue(20 + value1, `\x1bI[${$dataStates[i + 420].iconIndex}]${$dataStates[i + 420].name}`) };
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_readVariableTrainingDollPreset = function () {
		var value1 = 6;
		var variable293Value = $gameVariables.value(293)[value1];
		//console.log(`${variable293Value}`);
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_iterateBattleMembersTrainingDollSetup = function () {
		valueTrialJustBeforeTP = Array(21).fill(0);
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			var battleMember = $gameParty.battleMembers()[i].actorId();
			var actor = $gameActors.actor(battleMember);
			valueTrialJustBeforeTP[battleMember] = actor.tp;
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_readVariableTrainingDollPresetTrainingDollSetup = function () {
		for (var i = 11; i <= 30; i++) {
			$gameVariables.value(293)[i] = 0;
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:176|訓練人形設定
	AGH_iterateBattleMembersTrainingDollSetup_2 = function () {
		valueTrialJustBeforeTP = Array(21).fill(0);
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			var battleMember = $gameParty.battleMembers()[i].actorId();
			var actor = $gameActors.actor(battleMember);
			actor.gainTp(-1000);
			actor.gainTp(valueTrialJustBeforeTP[battleMember]);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:177|監禁,奴隷化コモン
	AGH_readVariableCashInItem = function () {
		if ($gameVariables.value(316)[0] != 0) {
			item_confinementScript(0);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
	AGH_showWindowTextTitleEffectSelectCommon = function () {
		var messageText = `[発動中の称号効果]\n`; var variableId = 288;
		for (var i = 0; i <= $gameVariables.value(variableId + 1) - 1; i++) {
			if ($gameVariables.value(variableId)[i] == 0) {
				messageText += `Empty\n`;
			} else {
				messageText += `\\C[16]\x1bIIN[${$gameVariables.value(value3)[i]}]\\C[0]\n`;
			}
		};
		var value2 = $gameVariables.value(variableId + 1) * 48 + 48;
		WindowManager.show(1, 740, 96 + 14, 540, value2);
		WindowManager.drawText(1, messageText);
	};

	// Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
	AGH_showWindowTextHNickname = function () {
		var value1 = `[発動中の称号効果]\n`; var value3 = 288;
		if ($gameSwitches.value(105)) { var value1 = `[発動中のＨな称号効果]\n`; var value3 = 294 };
		for (var i = 0; i <= $gameVariables.value(value3 + 1) - 1; i++) {
			if ($gameVariables.value(value3)[i] == 0) {
				value1 += `Empty\n`;
			} else {
				value1 += `\\C[16]\x1bIIN[${$gameVariables.value(value3)[i]}]\\C[0]\n`;
			}
		};
		var value2 = $gameVariables.value(value3 + 1) * 48 + 48;
		WindowManager.show(1, 740, 96 + 14, 540, value2);
		WindowManager.drawText(1, value1);
	};

	// Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
	AGH_iterateItemsEmpty = function () {
		var variableId = 288;
		for (var i = 0; i <= $gameVariables.value(variableId + 1) - 1; i++) {
			const id = 1;
			if ($gameVariables.value(variableId)[i] == 0) {
				var value1 = 'Empty';
			} else {
				var value1 = $dataItems[$gameVariables.value(variableId)[i]].name;
			};
			const choiceParams = { text: value1, value: i };
			$gameSystem.addCustomChoice(id, choiceParams);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
	AGH_readVariableHNickname = function () {
		var value3 = 288;
		if ($gameSwitches.value(105)) { var value3 = 294 };
		for (var i = 0; i <= $gameVariables.value(value3 + 1) - 1; i++) {
			const id = 1;
			if ($gameVariables.value(value3)[i] == 0) {
				var value1 = 'Empty';
			} else {
				var value1 = $dataItems[$gameVariables.value(value3)[i]].name;
			};
			const choiceParams = { text: value1, value: i };
			$gameSystem.addCustomChoice(id, choiceParams);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
	AGH_readVariableItemProcessWorkTitleEffectSelectCommon = function () {
		var variableId = 288;
		if ($gameVariables.value(19) == 601) {
			$gameVariables.value(variableId)[$gameVariables.value(21)] = 0;
		} else {
			$gameVariables.value(variableId)[$gameVariables.value(21)] = $gameVariables.value(19);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:179|タイトル効果選択コモン
	AGH_readVariableItemProcessWork_2 = function () {
		var value3 = 288;
		if ($gameSwitches.value(105)) { var value3 = 294 };
		if ($gameVariables.value(19) == 601) {
			$gameVariables.value(value3)[$gameVariables.value(21)] = 0;
		} else {
			$gameVariables.value(value3)[$gameVariables.value(21)] = $gameVariables.value(19);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:180|種族討伐数表示
	AGH_readVariableRaceDefeatCountRaceDefeatCountDisplay = function () {
		for (var i = 0; i <= $gameVariables.value(52).length - 1; i++) {
			if ($gameVariables.value(52)[i] >= 1) {
				var value8 = `\x1bSIM[${i}]`;
				if (i == 1) { var value8 = `当日魔物` };
				if (i == 2) { var value8 = `総魔物` };
				var variable52Value = $gameVariables.value(52)[i];
				valueIkkatuArray.push([value8, variable52Value, 0, 0, 0]);
				valueCountSet1 += 1;
			}
		};
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
		var variable19Value = $dataItems[$gameVariables.value(19)].price;
		if (valueCountSet3 != 0) { var variable19Value = Math.floor(variable19Value - (variable19Value * valueCountSet3 / 100)) };
		if ($gameParty.gold() >= variable19Value) {
			$gameParty.gainItem($dataItems[$gameVariables.value(19)], 1);
			$gameParty.loseGold(variable19Value);
			AudioManager.playSe({ "name": 'Shop1', "volume": 90, "pitch": 100, "pan": 0 });
			var variable19Value2 = `\\C[2]\x1bIIN[${$gameVariables.value(19)}]\\C[0]を購入しました。`;
		} else {
			var variable19Value2 = `所持金が足りなかった…。`;
		};
		TickerManager.show(variable19Value2);
	};

	// Replaces (1x): CommonEvents.json:common-event:183|本屋コモン
	AGH_resetValueScriptArray1_2 = function () {
		valueCountSet1 = 0;
		valueCountSet2 = 0;//件数
		valueCountSet3 = 0;//割引率
		valueScriptArray1 = [];
	};

	// Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
	AGH_setVariableRandomWork2 = function () {
		var value1 = 109;
		if ($gameSwitches.value(203)) { var value1 = 110 };
		if ($gameSwitches.value(205)) { var value1 = 111 };
		if ($gameSwitches.value(207)) { var value1 = 112 };
		$gameVariables.setValue(22, value1);
	};

	// Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
	AGH_setVariableRandomWork2WaterDrawingCommon = function () {
		var valueItems = 0;
		if ($gameVariables.value(230) >= 1) {
			var valueItems = $dataWeapons[$gameVariables.value(230)];
		};
		if ($gameVariables.value(240) >= 1) {
			var valueItems = $dataItems[$gameVariables.value(240)];
		};
		if (valueItems != 0) {
			if (valueItems.meta['getWaterItem']) {
				$gameVariables.setValue(22, Number(valueItems.meta['getWaterItem']));
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
	AGH_setVariableRandomWork2GetWaterItem = function () {
		if ($dataMap.meta['getWaterItem']) {
			$gameVariables.setValue(22, Number($dataMap.meta['getWaterItem']));
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
	AGH_setSwitchTemporarySwitchWaterDrawingCommon = function () {
		$gameSwitches.setValue(380, false);
		event_charaDirectionPoint($gamePlayer, 2);
		if ($gameMap.terrainTag(valueDirectionPointX, valueDirectionPointY) == 3) {
			$gameSwitches.setValue(380, true);
		};
		if ($gameMap.regionId(valueDirectionPointX, valueDirectionPointY) == 3) {
			$gameSwitches.setValue(380, true);
		};
		if ($gameMap.regionId(valueDirectionPointX, valueDirectionPointY) == 16) {
			$gameSwitches.setValue(380, true);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
	AGH_setSwitchTemporarySwitch_2 = function () {
		var value1 = 1162;//中央森林
		if ($gameMap.regionId(valueDirectionPointX, valueDirectionPointY) == 101) {
			$gameSwitches.setValue(380, true);
			$gameVariables.setValue(22, value1);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
	AGH_setSwitchTemporarySwitch_3 = function () {
		var value1 = 111;
		if ($gameMap.regionId(valueDirectionPointX, valueDirectionPointY) == 102) {
			$gameSwitches.setValue(380, true);
			$gameVariables.setValue(22, value1);
		};
		var value1 = 111;
		if ($gameMap.regionId(valueDirectionPointX, valueDirectionPointY) == 103) {
			$gameSwitches.setValue(380, true);
			$gameVariables.setValue(22, value1);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
	AGH_setVariableDynamicEventId = function (interp) {
		return (function () {
			$gameVariables.setValue(292, Array(21).fill(0));
			var value2 = valueDirectionPointX;
			var value3 = valueDirectionPointY;
			goodsEvent_respawn(0, 'Goods4', 4, 2, 0, value2, value3);
			valueCountSet9 = this._eventId;
			this._eventId = $gameVariables.value(292)[0];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:184|水汲みコモン
	AGH_gainItemRandomWork2 = function () {
		var variable19Value = $gameVariables.value(19);
		$gameParty.loseItem($dataItems[108], variable19Value);
		$gameParty.gainItem($dataItems[$gameVariables.value(22)], variable19Value);
		var messageText = `\x1bIIN[${$gameVariables.value(22)}]を\\C[3]${variable19Value}\\C[0]個獲得！（\x1bIIN[108]\\C[10]-${variable19Value}\\C[0]個）`;
		TickerManager.show(messageText);
	};

	// Replaces (1x): CommonEvents.json:common-event:185|その他ショップ処理
	AGH_initArray = function () {
		array = [];
		bookShop_preparert2(0, 3, 1);
	};

	// Replaces (1x): CommonEvents.json:common-event:186|娼館処理
	AGH_readVariableBrothelProcessing = function () {
		var actorData = $dataActors[id];
		if ($gameVariables.value(id + 380)[27] >= 1) {
			var value11 = `\\fs[25]売春総獲得額:${$gameVariables.value(id + 380)[27]}回${$gameVariables.value(827)}`
		} else {
			var value11 = ``
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:187|追剥コモン
	AGH_showInfo = function () {
		value1 = `既に事切れているようだ…。`;
		CommonPopupManager.showInfo({}, value1, null);
	};

	// Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
	AGH_setSwitchWalletIn = function () {
		$gameSwitches.setValue(161, false);
		for (var i = 1; i <= $dataItems.length - 1; i++) {
			if ($dataItems[i].meta['walletIn']) {
				if ($gameParty.hasItem($dataItems[i], true)) {
					$gameSwitches.setValue(161, true);
					break;
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
	AGH_setVariableRandomWork1GuildCommon = function () {
		if ($gameSwitches.value(128)) {
			var value1 = `デイリークエスト自動受注＜ON＞`;
		} else {
			var value1 = `デイリークエスト自動受注＜OFF＞`;
		};
		$gameVariables.setValue(21, value1);
	};

	// Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
	AGH_setVariableRandomWork2GuildCommon = function () {
		if ($gameSwitches.value(129)) {
			var value1 = `デイリークエスト自動達成＜ON＞`;
		} else {
			var value1 = `デイリークエスト自動達成＜OFF＞`;
		};
		$gameVariables.setValue(22, value1);
	};

	// Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
	AGH_setSwitchGuildCommon = function () {
		if ($gameParty.hasItem($dataItems[693], true)) {
			$gameSwitches.setValue(162, true);
		} else {
			$gameSwitches.setValue(162, false);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
	AGH_gainItemWalletDeliveryCount = function () {
		var counter = 0;
		var messageText = `拾得物\n`;
		for (var i = 1; i <= $dataItems.length - 1; i++) {
			if ($dataItems[i].meta['walletIn']) {
				if ($gameParty.numItems($dataItems[i]) >= 1) {
					counter += $gameParty.numItems($dataItems[i]);
					messageText += `\x1bIIN[${i}]:\\C[1]${$gameParty.numItems($dataItems[i])}\\C[0]個\n`;
					$gameParty.loseItem($dataItems[i], $gameParty.numItems($dataItems[i]));
				}
			}
		};
		$gameParty.gainItem($dataItems[10], counter); $gameVariables.setValue(605, $gameVariables.value(605) + counter);
		messageText += `\x1bIIN[10]:\\C[2]${value2}\\C[0]個を謝礼として受け取った。\n`;
		valueTalkSet = [28, messageText];
	};

	// Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
	AGH_setSwitchDailyAutoOrder = function () {
		if ($gameSwitches.value(128)) {
			$gameSwitches.setValue(128, false);
			var value1 = `デイリークエストの自動受注をオフにしました。`;
		} else {
			$gameSwitches.setValue(128, true);
			var value1 = `デイリークエストの自動受注をオンにしました。`;
		};
		TickerManager.show(value1);
	};

	// Replaces (1x): CommonEvents.json:common-event:191|ギルドコモン
	AGH_setSwitchDailyAutoComplete = function () {
		if ($gameSwitches.value(129)) {
			$gameSwitches.setValue(129, false);
			var value1 = `デイリークエストの自動達成報告をオフにしました。`;
		} else {
			$gameSwitches.setValue(129, true);
			var value1 = `デイリークエストの自動達成報告をオンにしました。`;
		};
		TickerManager.show(value1);
	};

	// Replaces (1x): CommonEvents.json:common-event:192|未使用：情報屋選択肢
	AGH_iterateItemsSetJouhouGold = function () {
		var variable19Value = 1000;
		if ($dataItems[$gameVariables.value(19)].meta['SetJouhouGold']) {
			var variable19Value = Number($dataItems[$gameVariables.value(19)].meta['SetJouhouGold']);
		};
		$gameParty.loseGold(variable19Value);
		var messageText = `-${variable19Value}\\G`;
		TickerManager.show(messageText);
	};

	// Replaces (1x): CommonEvents.json:common-event:192|未使用：情報屋選択肢
	AGH_gainItemItemProcessWorkUnusedInfoBrokerChoice = function () {
		$gameParty.gainItem($dataItems[$gameVariables.value(19)], 1);
		var variable19Value = `エリア情報:\x1bIIN[${$gameVariables.value(19)}]を購入した。`;
		TickerManager.show(variable19Value);
		$gamePlayer.requestAnimation(229);
	};

	// Replaces (1x): CommonEvents.json:common-event:195|動物処理バックアップ
	AGH_configureMapEventAnimalProcessingBackup = function () {
		var event = $gameMap.event(valueanimalEventId);
		event.requestAnimation(387);
	};

	// Replaces (1x): CommonEvents.json:common-event:195|動物処理バックアップ
	AGH_forceMoveRouteCharactersAnimalProcessingBackup = function (interp) {
		return (function () {
			if (valueanimalEventId >= 1) {
				var randomIndex = [-45, 45, -90, 90][getRandomIndex(4)];
				if (randomIndex == 90) { var value2 = -24 }; if (randomIndex == 45) { var value2 = -12 };
				if (randomIndex == -90) { var value2 = 24 }; if (randomIndex == -45) { var value2 = 12 };
				this.character(valueanimalEventId).forceMoveRoute({
					"list": [
						{ "code": 45, "parameters": ["this.setAngle(value1);"] },
						{ "code": 45, "parameters": ["this.resetPattern();"] }, { "code": 45, "parameters": ["this._originalPattern = 1;"] }, { "code": 45, "parameters": ["this._priorityType = 0;"] },
						{ "code": 45, "parameters": ["this._spriteOffsetX += value2;"] }, { "code": 45, "parameters": ["this._spriteOffsetY += value2;"] },
						{ "code": 32 }, { "code": 34 }, { "code": 37 }, { "code": 17 }, { "code": 35 },
						{ "code": 0 }], "repeat": false, "skippable": true
				});
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:195|動物処理バックアップ
	AGH_characterRoute = function (interp) {
		return (function () {
			this._character = this.character(valueanimalEventId);
			this.setWaitMode('route');
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:195|動物処理バックアップ
	AGH_forceMoveRouteCharactersPeople2 = function (interp) {
		return (function () {
			if (valueanimalEventId >= 1) {
				this.character(valueanimalEventId).forceMoveRoute({
					"list": [
						{ "code": 45, "parameters": ["this.setScale(100, 100);"] },
						{ "code": 42, "parameters": [255] },
						{ "code": 40 },
						{ "code": 41, "parameters": ['People2', 1] },
						{ "code": 0 }], "repeat": false, "skippable": true
				});
				this._character = this.character(valueanimalEventId);
				this.setWaitMode('route');
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:195|動物処理バックアップ
	AGH_forceMoveRouteCharactersAnimalProcessingBackup_2 = function (interp) {
		return (function () {
			if (valueanimalEventId >= 1) {
				this.character(valueanimalEventId).forceMoveRoute({
					"list": [
						{ "code": 15, "parameters": [600] },
						{ "code": 0 }], "repeat": true, "skippable": true
				});
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:196|ダンジョン雑魚で剥ぎ取り追いはぎコモンバックアップ
	AGH_forceMoveRouteCharactersSFEnemy2 = function (interp) {
		return (function () {
			var eventId = valueEnemyEventId;
			if (!!$gameMap.event(eventId)) {
				$gameMap.event(eventId).forceMoveRoute({
					"list": [
						{ "code": 36 }, { "code": 16 },
						{ "code": 41, "parameters": ['SF_enemy2', 7] },
						{ "code": 45, "parameters": ["this.setFace(6,true,true);"] },
						{ "code": 35 },
						{ "code": 0 }], "repeat": false, "skippable": true
				});
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:199|全体マップ移動選択コモン
	AGH_setSelfSwitchWorldMapMoveSelectCommon = function () {
		for (var id = 50; id > 0; id--) {
			if (!!$gameMap.event(id)) {
				$gameSelfSwitches.setValue([$gameMap.mapId(), id, 'C'], true);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:199|全体マップ移動選択コモン
	AGH_insertCallEventData = function (interp) {
		return (function () {
			if ($callEventMap) {
				this.insertCallEventData(23, 2);
			}
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:203|熟練度アップコモン
	AGH_showWindowTextProficiencyUpCommon = function () {
		WindowManager.show(0, 0, 700, 1280, 68);
		WindowManager.show(1, 0, 632, 1280, 68);
	};

	// Replaces (1x): CommonEvents.json:common-event:203|熟練度アップコモン
	AGH_showWindowTextRandomWork1 = function (interp) {
		return (function () {
			var value1 = 169;//例外アイテム名
			var actor = $gameActors.actor($gameVariables.item(20));
			var item = $dataItems[$gameVariables.item(93)]
			if ($gameVariables.item(93) != value1) {
				this.sVal(21, Number(item.meta['熟練度アップスキルタイプ']));
			};
			this.sVal(22, Number(item.meta['熟練度上昇値']));
			var variable93Value = `\x1bIIN[${$gameVariables.value(93)}]（${$gameParty.numItems(value)}）上昇値:\\C[2]${$gameVariables.value(22)}\\C[0]　対象:${actor.name()}`
			if ($gameVariables.item(203) >= 2) { variable93Value += `\\C[10] * 2\\C[0]` };
			WindowManager.drawText(0, variable93Value);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:203|熟練度アップコモン
	AGH_readVariableItemProcessWorkProficiencyUpCommon = function () {
		if (valueCountSet1 == $gameVariables.value(19)) {
			item_skilljukurenndoup(2);
		} else {
			item_skilljukurenndoup(1);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:203|熟練度アップコモン
	AGH_readVariableSkillUseId = function () {
		var item = $dataItems[$gameVariables.item(93)]
		var messageText = `${value.name}の所持数が0になった為、使用画面を終了します。`;
		CommonPopupManager.showInfo({}, messageText, null);
	};

	// Replaces (1x): CommonEvents.json:common-event:210|アクター選択コモン
	AGH_movePictureActorChoice = function () {
		var value1 = $gameVariables.value(20) + 100;
		if ($gameVariables.value(20) >= 2) {
			var value1 = 101 + ($gameVariables.value(20) - 1) * 7;
		};
		$gameScreen.movePicture(value1, 1, 640 - 500, 384, 100, 100, 0, 0, 20);
		for (var i = 0; i <= 7; i++) {
			if ($gameScreen.picture(value1 + i)) {
				$gameScreen.movePicture(value1 + i, 1, 640 - 500, 384, 100, 100, 0, 3, 20);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:212|エクストラコマンド
	AGH_setSwitchTipsTitle = function () {
		if ($gameVariables.value(532).length >= 1) {
			$gameSwitches.setValue(161, true);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:212|エクストラコマンド
	AGH_runScriptExtraCommand = function () {
		window.close();
	};

	// Replaces (1x): CommonEvents.json:common-event:219|収集表示アイテムコモン
	AGH_checkItemCountCollectedItem = function (interp) {
		return (function () {
			var start = 1; var end = 4;
			for (var i = start; i <= end; i++) {
				if ($gameVariables.value(284)[i] == 0) {
					this.sVal(i + 21, '[登録なし]');
				} else {
					this.sVal(i + 21, '[' + $dataItems[$gameVariables.value(284)[i]].name + ':');
					this.sVal(i + 21, $gameVariables.value(i + 21) + $gameParty.numItems($dataItems[$gameVariables.value(284)[i]]) + ']');
				}
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:232|ショップ処理先頭で処理
	AGH_initValueRandomSet = function () {
		valueRandomSet = 20;
	};

	// Replaces (1x): CommonEvents.json:common-event:232|ショップ処理先頭で処理
	AGH_setVariableRandomWork1ShopProcessingHead = function () {
		var messageText = `\\C[2]${actor.name()}\\C[0]は\\C[27]\x1bSIN[${valueHoneyTrapSkillId}]\\C[0]を行った…。[成功率/値引き率\\C[10]${valueRandomSet}%UP\\C[0]]\n`;
		$gameVariables.setValue(21, $gameVariables.value(21) + messageText);
	};

	// Replaces (1x): CommonEvents.json:common-event:234|喜捨コモン
	AGH_readVariableDonationTotal = function () {
		var value2 = $gameVariables.value(631) / 1000;
		var messageText = `\\SIM[106]が付与された。(\\C[10]${value2}\\C[0]%)`;
		TickerManager.show(messageText);
	};

	// Replaces (1x): CommonEvents.json:common-event:235|レアリティ昇格コモン
	AGH_setVariableRandomWork1RarityUpCommon = function () {
		var wordSet = valueWordSet2;
		$gameVariables.setValue(21, `${value1}には上記の物が必要になります。
		昇格なさいますか？`);
	};

	// Replaces (1x): CommonEvents.json:common-event:235|レアリティ昇格コモン
	AGH_eraseMapEventDynamicEventIdRarityUpCommon = function () {
		var eventId = $gameVariables.value(292)[11];
		$gameMap.eraseEvent(eventId);
		$gameVariables.setValue(292, Array(21).fill(0));
	};

	// Replaces (1x): CommonEvents.json:common-event:235|レアリティ昇格コモン
	AGH_setVariableRandomWork1_2 = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		$gameVariables.setValue(21, `${actor.name()}殿はこれ以上の昇格はできませんね`);
	};

	// Replaces (1x): CommonEvents.json:common-event:237|指輪ショップ処理
	AGH_setSwitchRingShopProcessing = function () {
		var variableId = 20;
		var switchId = 160;
		for (var i = 396; i <= 399; i++) {
			$gameVariables.setValue(variableId + (i - 395), `\x1bI[${$dataArmors[i].iconIndex}]${$dataArmors[i].name} ${$dataArmors[i].price.toLocaleString()}\G`);
			if ($gameParty.gold() >= $dataArmors[i].price) {
				$gameSwitches.setValue(switchId + (i - 395), true);
			} else {
				$gameSwitches.setValue(switchId + (i - 395), false);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:237|指輪ショップ処理
	AGH_setSelfVariableChoiceSwitch12 = function (interp) {
		return (function () {
			this.sVal(172, 2);//会話コモン文字ピク
			var value1 = '指輪について';
			var messageText = `スロットにアタッチを装着する事で性能が上昇する。
		一度アタッチを付けると取り外し不可。指輪本体は店売りのみで、
		アタッチはドロップや宝箱等からのみ。
		アタッチが付くと指輪の売却額がアタッチ分上乗せされる。
		先頭アタッチの略語が名称の末尾に付く。
		※ 指輪本体を大量に持ち過ぎるとセーブデータの容量が増加します。
		許容できる範囲でやりくりして下さい。`;
			var array = [0, 1, 640 + 320, 384, 100, 100, 255];
			valueTalkSet = [value1, messageText, array];
			this.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:238|個別アイテム鑑定店
	AGH_showWindowTextIndividualItemAppraisal = function () {
		var messageText = `鑑定料金表\n（下級：10\\G）（中級：100\\G）（上級：1000\\G）\n`;
		WindowManager.show(0, 10, 100, 800, 100);
		WindowManager.drawText(0, messageText);
	};

	// Replaces (1x): CommonEvents.json:common-event:238|個別アイテム鑑定店
	AGH_setVariableRandomWork1IndividualItemAppraisal = function () {
		var value1 = 0; var value2 = 0; var value3 = 0;
		if ($dataItems[$gameVariables.value(19)].meta['下級鑑定品']) { value1 = 10 };
		if ($dataItems[$gameVariables.value(19)].meta['中級鑑定品']) { value2 = 100 };
		if ($dataItems[$gameVariables.value(19)].meta['上級鑑定品']) { value3 = 1000 };
		$gameVariables.setValue(21, value1 + value2 + value3);
	};

	// Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
	AGH_initValueScriptArray1 = function () {
		if (valueCountSet1 == 0) { valueScriptArray1 = [4, 5, 6] };
		if (valueCountSet1 == 1) { valueScriptArray1 = [6, 7] };
		if (valueCountSet1 == 2) { valueScriptArray1 = [4, 5, 6] };
		if (valueCountSet1 == 3) { valueScriptArray1 = [4, 5, 6, 7] };
		if (valueCountSet1 == 4) { valueScriptArray1 = [4, 5, 6, 7] };
		if (valueCountSet1 == 5) { valueScriptArray1 = [1] };
		if (valueCountSet1 == 6) { valueScriptArray1 = [1] };
	};

	// Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
	AGH_initValueScriptArray1ShopProcessing = function () {
		if (valueCountSet1 == 0) { valueScriptArray1 = [1, 2, 3, 4, 5, 6, 7, 8, 9] };
		if (valueCountSet1 == 1) { valueScriptArray1 = [1, 2, 3, 4, 5, 8, 9] };
		if (valueCountSet1 == 2) { valueScriptArray1 = [1, 2, 3, 7, 8, 9] };
		if (valueCountSet1 == 3) { valueScriptArray1 = [1, 2, 3, 4, 5, 7, 8, 9] };
		if (valueCountSet1 == 4) { valueScriptArray1 = [1, 2, 3, 4, 5, 6, 7, 8, 9] };
		if (valueCountSet1 == 5) { valueScriptArray1 = [1] };
		if (valueCountSet1 == 6) { valueScriptArray1 = [1, 2] };
	};

	// Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
	AGH_initValueScriptArray1_2 = function () {
		if (valueCountSet1 == 0) { valueScriptArray1 = [1, 2, 3, 4, 5] };
		if (valueCountSet1 == 1) { valueScriptArray1 = [1, 2, 3, 4, 5] };
		if (valueCountSet1 == 2) { valueScriptArray1 = [1, 2, 3] };
		if (valueCountSet1 == 3) { valueScriptArray1 = [1, 2, 3] };
		if (valueCountSet1 == 4) { valueScriptArray1 = [1, 2, 3] };
		if (valueCountSet1 == 5) { valueScriptArray1 = [1] };
		if (valueCountSet1 == 6) { valueScriptArray1 = [1] };
	};

	// Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
	AGH_initArrayShopProcessing = function () {
		array = [];
	};

	// Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
	AGH_runScriptShopProcessing = function () {
		var scriptArray = valueScriptArray1;
		for (var j = 0; j < scriptArray.length; j++) {
			if (scriptArray[j] == scriptArray[scriptArray.length - 1]) {
				shop_preparationEI(0, scriptArray[j], 1);
			} else {
				shop_preparationEI(0, scriptArray[j], 0);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
	AGH_runScriptShopProcessing_2 = function () {
		var scriptArray = valueScriptArray1;
		for (var j = 0; j < scriptArray.length; j++) {
			if (scriptArray[j] == scriptArray[scriptArray.length - 1]) {
				shop_preparationH(0, scriptArray[j], 1);
			} else {
				shop_preparationH(0, scriptArray[j], 0);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
	AGH_runScriptShopProcessing_3 = function () {
		var scriptArray = valueScriptArray1;
		for (var j = 0; j < scriptArray.length; j++) {
			if (scriptArray[j] == scriptArray[scriptArray.length - 1]) {
				shop_preparationE(0, scriptArray[j], 1);
			} else {
				shop_preparationE(0, scriptArray[j], 0);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
	AGH_runScriptShopProcessing_4 = function () {
		var scriptArray = valueScriptArray1;
		for (var j = 0; j < scriptArray.length; j++) {
			if (scriptArray[j] == scriptArray[scriptArray.length - 1]) {
				shop_preparation1(0, scriptArray[j], 0);
				shop_preparation1(1, scriptArray[j], 0);
				shop_preparation1(2, scriptArray[j], 1);
			} else {
				shop_preparation1(0, scriptArray[j], 0);
				shop_preparation1(1, scriptArray[j], 0);
				shop_preparation1(2, scriptArray[j], 0);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
	AGH_runScriptShopProcessing_5 = function () {
		var scriptArray = valueScriptArray1;
		for (var j = 0; j < scriptArray.length; j++) {
			if (scriptArray[j] == scriptArray[scriptArray.length - 1]) {
				shop_preparation1(1, scriptArray[j], 0);
				shop_preparation1(2, scriptArray[j], 1);
			} else {
				shop_preparation1(1, scriptArray[j], 0);
				shop_preparation1(2, scriptArray[j], 0);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:240|ショップ処理
	AGH_runScriptShopProcessing_6 = function () {
		var scriptArray = valueScriptArray1;
		for (var j = 0; j < scriptArray.length; j++) {
			if (scriptArray[j] == scriptArray[scriptArray.length - 1]) {
				shop_preparation1(valueCountSet1, scriptArray[j], 1);
			} else {
				shop_preparation1(valueCountSet1, scriptArray[j], 0);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
	AGH_setSwitchTemporarySwitchUniqueWeaponEnhance = function () {
		var id = $gameVariables.value(20);
		if ($gameVariables.value(287)[id][10] >= 20) {
			$gameSwitches.setValue(380, true);
		} else {
			$gameSwitches.setValue(380, false);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
	AGH_setSwitchTemporarySwitch_4 = function () {
		weapon_uniqueEnhance($gameVariables.value(20), 1);
		$gameVariables.setValue(21, valueCountSet1);
		$gameSwitches.setValue(380, false);
		if (valueScriptArray2[0] >= 1) {
			var value1 = $gameParty.numItems($dataItems[valueScriptArray2[0]]) >= valueScriptArray2[1];
			$gameVariables.setValue(23, `（要:\\C[2]${$gameVariables.value(21).toLocaleString()}\\G\\C[0] \x1bIIN[${valueScriptArray2[0]}]×${valueScriptArray2[1]}個）\n所持数:${$gameParty.numItems($dataItems[valueScriptArray2[0]])}個`);
		} else {
			var value1 = true;
			$gameVariables.setValue(23, `（要:\\C[2]${$gameVariables.value(21).toLocaleString()}\\G\\C[0]）`);
		};
		if ($gameParty.gold() >= valueCountSet1 && value1) { $gameSwitches.setValue(380, true) };
	};

	// Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
	AGH_setSelfVariableRandomWork2UniqueWeaponEnhance = function (interp) {
		return (function () {
			if ($gameSwitches.value(515)) {
				$dataSystem.switches[515] = '鍛冶ｼｰﾝｶｯﾄ(ON)';
			} else {
				$dataSystem.switches[515] = '鍛冶ｼｰﾝｶｯﾄ(OFF)';
			};
			this.sVal(22, $dataSystem.switches[515]);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
	AGH_setSelfVariableRandomWork2ForgeSceneCut = function (interp) {
		return (function () {
			if ($gameSwitches.value(515)) {
				$dataSystem.switches[515] = '鍛冶ｼｰﾝｶｯﾄ(OFF)';
				$gameSwitches.setValue(515, false);
			} else {
				$dataSystem.switches[515] = '鍛冶ｼｰﾝｶｯﾄ(ON)';
				$gameSwitches.setValue(515, true);
			};
			this.sVal(22, $dataSystem.switches[515]);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
	AGH_readVariableActorChoiceUniqueWeaponEnhance = function () {
		var id = $gameVariables.value(20);
		$gameVariables.value(287)[id][10] += 1;
		var variable287Value = $gameVariables.value(287)[id][10];
		$gameVariables.value(287)[id][variable287Value + 10] = $gameVariables.value(19);
		weapon_uniqueEnhance($gameVariables.value(20), 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:241|固有武器強化
	AGH_gainItemRandomWork3 = function () {
		$gameParty.loseGold($gameVariables.value(21));
		$gameVariables.setValue(23, `${$gameVariables.value(21).toLocaleString()}\\Gを支払った。\n`);
		if (valueScriptArray2[0] >= 1) {
			$gameParty.gainItem($dataItems[valueScriptArray2[0]], -valueScriptArray2[1]);
			$gameVariables.setValue(23, $gameVariables.value(23) + `\\IIN[${valueScriptArray2[0]}]を${valueScriptArray2[1]}個消費した。`);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:245|昇格演出
	AGH_spawnMapEventDynamicEventId = function () {
		$gameMap.spawnEvent(146, 7, 26, true);
		$gameVariables.value(292)[11] = $gameMap.getLastSpawnEventId();
		var eventId = $gameVariables.value(292)[11];
		var event = $gameMap.event(eventId);
		event.setOpacity(255);
	};

	// Replaces (1x): CommonEvents.json:common-event:245|昇格演出
	AGH_playParticleAureoleC = function (interp) {
		return (function () {
			var value1 = 'aureole_c';
			$gameScreen._particle.particlePlay(this._eventId, value1 + '-' + this._eventId, 'this', value1);
			var value1 = 'lifeStorm_screen';
			$gameScreen._particle.particlePlay(this._eventId, value1 + '-' + this._eventId, 'this', value1);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:245|昇格演出
	AGH_particlePlayChargeC = function () {
		var chargeC = 'charge_c';
		$gameScreen._particle.particlePlay(0, chargeC, 'player', 'def', 'screen');
		$gameScreen._particle.particleUpdate([chargeC, 'pos', 0, 20]);
	};

	// Replaces (1x): CommonEvents.json:common-event:245|昇格演出
	AGH_forEachArrayAureoleC = function (interp) {
		return (function () {
			var list = ['aureole_c' + '-' + this._eventId, 'lifeStorm_screen' + '-' + this._eventId, 'charge_c', 'direct_screenRing'];
			list.forEach(function (id) {
				$gameScreen._particle.particleClear(id);
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:250|神掘りコモン終了
	AGH_allowMapPlayerMovementGodDiggingEnd = function () {
		if (!$gameParty.inBattle()) {
			$gameTemp.allowMapPlayerMovement();
			$gameTemp.allowMapEventMovement();
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:251|重要アイテム入手コモン
	AGH_gainItemChestRareSlot = function () {
		var threshold = valueCountSet1;
		var value2 = valueCountSet2;
		if (threshold == 0) { var valueItems = $dataItems };
		if (threshold == 1) { var valueItems = $dataWeapons };
		if (threshold == 2) { var valueItems = $dataArmors };
		$gameParty.gainItem(valueItems[value2], 1);
		var value3 = `\\C[29]\x1bI[${valueItems[value2].iconIndex}]${valueItems[value2].name}\\C[0]を入手した！`;
		var value4 = 28;
		$gameScreen.setDTextPicture(messageText, value4);
		$gameSwitches.setValue(439, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:253|リセット項目選択
	AGH_readVariableItemProcessWorkResetItemSelect = function () {
		var variable19Value = $gameVariables.value(19);
		if ($gameVariables.value(183)[variable19Value] == 0) {
			$gameVariables.value(183)[variable19Value] = 1;
		} else {
			$gameVariables.value(183)[variable19Value] = 0;
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:254|ステータスリセット
	AGH_readVariableActorChoiceStatusReset = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		actor.setup($gameVariables.value(20));
	};

	// Replaces (1x): CommonEvents.json:common-event:254|ステータスリセット
	AGH_readVariableActorChoice_3 = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		for (var i = 1; i < $dataSkills.length; i++) {
			actor.forgetSkill(i);
			actor.setSkillMasteryUses(i, 0);
			actor.setSkillMasteryLevel(i, 0);
		};
		var equips = actor.equips();
		for (var i = 0; i < equips.length; i++) {
			if (equips[i]) {
				actor.changeEquipById(i + 1, 0);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:254|ステータスリセット
	AGH_runPluginCommandActorChoiceStatusReset = function (interp) {
		return (function () {
			var variable20Value = $gameActors.actor($gameVariables.value(20))._classId;
			var args = new Array(String(i), "100", String(variable20Value));
			this.pluginCommand("gainJp", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:256|Ｈ相手リセット
	AGH_readVariableItemProcessWorkHPartnerReset = function () {
		valueRandomSet = $gameVariables.value(19);
	};

	// Replaces (1x): CommonEvents.json:common-event:256|Ｈ相手リセット
	AGH_readVariableItemProcessWorkActorChoice = function () {
		$gameVariables.value($gameVariables.value(20) + 360)[$gameVariables.value(19) + 1] = 0;
		var messageText = `${$dataWeapons[$gameVariables.value(19) + 1].name}とのＨ回数がリセットされました…`;
		CommonPopupManager.showInfo({}, messageText, null);
	};

	// Replaces (1x): CommonEvents.json:common-event:256|Ｈ相手リセット
	AGH_readVariableItemProcessWork_3 = function () {
		$gameVariables.value($gameVariables.value(20) + 360)[$gameVariables.value(19) + 200 + 1] = 0;
		var messageText = `${$dataWeapons[$gameVariables.value(19) + 200 + 1].name}の出産履歴がリセットされました…`;
		CommonPopupManager.showInfo({}, messageText, null);
	};

	// Replaces (1x): CommonEvents.json:common-event:256|Ｈ相手リセット
	AGH_readVariableActorChoiceHPartnerReset = function () {
		for (var i = 1; i <= 100; i++) {
			$gameVariables.value($gameVariables.value(20) + 360)[i] = 0;
		};
		var messageText = `男性遍歴が一括リセットされました…`;
		CommonPopupManager.showInfo({}, messageText, null);
	};

	// Replaces (1x): CommonEvents.json:common-event:256|Ｈ相手リセット
	AGH_readVariableActorChoice_4 = function () {
		for (var i = 201; i <= 300; i++) {
			$gameVariables.value($gameVariables.value(20) + 360)[i] = 0;
		};
		var messageText = `出産履歴が一括リセットされました…`;
		CommonPopupManager.showInfo({}, messageText, null);
	};

	// Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
	AGH_spawnMapEventDynamicEventIdSubJobUnlock1 = function (interp) {
		return (function () {
			$gameMap.spawnEvent(224, 15, 10, true);
			var eventId = $gameMap.getLastSpawnEventId();
			$gameVariables.value(292)[11] = eventId;
			this._eventId = $gameVariables.value(292)[11];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
	AGH_spawnMapEventDynamicEventId_2 = function () {
		$gameMap.spawnEvent(223, 10, 10, true);
		var eventId = $gameMap.getLastSpawnEventId();
		$gameVariables.value(292)[12] = eventId;
	};

	// Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
	AGH_fillArraySubJobUnlock1 = function () {
		valueJobReleaseTorF1 = Array(81).fill(0);
		valueJobReleaseTorF2 = Array(81).fill(0);
	};

	// Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
	AGH_setSwitchTemporarySwitchSubJobUnlock1 = function () {
		var variable19Value = valueJobReleaseTorF2[$gameVariables.value(19)];
		if (valueJobReleaseTorF1[variable19Value] == 1) {
			$gameSwitches.setValue(380, true);
		} else {
			$gameSwitches.setValue(380, false);
		};
		$gameVariables.setValue(21, variable19Value);
	};

	// Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
	AGH_runPluginCommandDynamicEventId = function (interp) {
		return (function () {
			var value1 = "161";//一刀両断102崩壊161横両断008封印054内側から153
			var character = "character";//"picture"
			var args = new Array(String(character), $gameVariables.value(292)[12], "fadeOut",
				String(value1), "180", "5");
			this.pluginCommand("GWFade", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:259|サブジョブ解放1
	AGH_setVariableTextWork = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		var variable21Value = Number($dataClasses[$gameVariables.value(21)].meta['classRank']);
		$gameVariables.setValue(801,
			`${actor.name()}はClass${variable21Value}Job\\C[14][${$dataClasses[$gameVariables.value(21)].name}]\\C[0]を解放した！
		`);
	};

	// Replaces (1x): CommonEvents.json:common-event:261|鑑定解説文
	AGH_iterateItemsInfoEval = function () {
		if ($gameVariables.value(19) == 0) { var valueItems = $dataItems[$gameVariables.value(21)] };
		if ($gameVariables.value(19) == 1) { var valueItems = $dataWeapons[$gameVariables.value(21)] };
		if ($gameVariables.value(19) == 2) { var valueItems = $dataArmors[$gameVariables.value(21)] };
		var value1 = valueItems.description;
		//var value1 = value1.replace("\n", "");
		var value1 = `\x1bI[${valueItems.iconIndex}]${valueItems.name}\n${value1}`;
		var messageText = `\n`;
		if (valueItems.meta['Info Eval']) {
			item_priceinfo($gameVariables.value(19), $gameVariables.value(21));
			messageText += $gameVariables.value(801);
		};
		WindowManager.show(1, 0, 100, 1280, 668); WindowManager.drawText(1, `${value1}${value2}`);
	};

	// Replaces (1x): CommonEvents.json:common-event:287|戦闘勝利時獲得変数等
	AGH_findSystemSwitchByNameBattleVictoryVariable = function () {
		var switch252Name = $dataSystem.switches[252];
		var messageText = `${switch252Name}の空賊捕縛数+1`;
		CommonPopupManager.showInfo({}, messageText, null);
	};

	// Replaces (1x): CommonEvents.json:common-event:287|戦闘勝利時獲得変数等
	AGH_setMapEventOpacityBattleVictoryVariable = function () {
		var event = $gameMap.event(valueEnemyEventId);
		event.setOpacity(0);
	};

	// Replaces (1x): CommonEvents.json:common-event:290|シーン初期処理自動実行
	AGH_setSwitchEventProgress = function () {
		if (!$gameParty.inBattle()) { $gamePlayer.setThrough(true) };
		$gameSwitches.setValue(468, true);
		$gameSwitches.setValue(124, true);
		$gameVariables.setValue(292, Array(21).fill(0));
	};

	// Replaces (1x): CommonEvents.json:common-event:291|シーン終了処理自動実行
	AGH_setSwitchEventProgressSceneEndAuto = function () {
		$gameVariables.setValue(320, 0);
		if (!$gameParty.inBattle()) {
			$gamePlayer.setThrough(false);
		};
		$gameSwitches.setValue(124, false);//イベント進行時onoff
		$gameSwitches.setValue(473, false);
		if (!$gameParty.inBattle()) {
			$gameTemp.allowMapPlayerMovement();
			$gameTemp.allowMapEventMovement();
		};
		$gameSwitches.setValue(467, false);//NPC消滅スイッチoff
	};

	// Replaces (1x): CommonEvents.json:common-event:291|シーン終了処理自動実行
	AGH_setVariableDynamicEventIdSceneEndAuto = function () {
		valueWeatherSceneSet = 0;
		valueSceneConditions1 = true;
		valueSceneConditions2 = true;
		valueSceneConditions3 = true;
		$gameVariables.setValue(292, Array(21).fill(0));
		$gameVariables.setValue(528, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:291|シーン終了処理自動実行
	AGH_setSwitchEpisodeAutoTrigger = function () {
		if (!$gameSwitches.value(29)) {
			$gamePlayer.setTransparent(false);
			if ($gameSwitches.value(412)) {//挿話
				$gameSwitches.setValue(412, false);
			};
			if ($gameSwitches.value(469)) {//Ｈ
				$gameSwitches.setValue(469, false);
			};
		};
		if (!$gameParty.inBattle()) {
			drowsepost.camera.zoom(1, 60, $gamePlayer);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:292|※※コマンド一覧
	AGH_waitActorChoice = function (interp) {
		return (function () {
			var actor = $gameActors.actor($gameVariables.value(20));
			actor.addState(693);
			tachie_dousa(2, 1, 2, 12, 1, 255, 1323, 0, 0);
			tachie_dousa(2, 1, 2, 12, 1, 255, 1325, 0, 0);
			tachie_dousa(0, 1, 1, 12, 13, 0, 60, 0, 0);
			//tachie_clothReflect(1);
			this.wait(3);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:292|※※コマンド一覧
	AGH_configureMapEventCommandList = function (interp) {
		return (function () {
			event_partyCharaEntry();
			var event = $gameMap.event(this._eventId);
			var value1 = event.direction();
			if (value1 = 2) { var value2 = 16 };
			if (value1 = 4) { var value2 = 17 };
			if (value1 = 6) { var value2 = 18 };
			if (value1 = 8) { var value2 = 19 };
			event_partyCharaMove(value2, 0);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:294|タイトルコール
	AGH_setSwitchTemporarySwitchTitleCall = function () {
		$gameSwitches.setValue(380, false);
		if ($gameVariables.value(535) >= 1) {
			if (Number($dataItems[$gameVariables.value(535)].meta['EICSwitch']) == 103) {
				if (!$gameParty.hasItem($dataItems[$gameVariables.value(535)], true)) {
					$gameSwitches.setValue(380, true);
				};
			};
		};
		if ($gameVariables.value(535) == 0) {
			$gameSwitches.setValue(380, true);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:294|タイトルコール
	AGH_movePictureTitleCall = function () {
		var pictureId = 102;
		$gameScreen.movePicture(pictureId, 1, 640 - 250, 384 - 200, 100, 100, 0, 0, 300);
	};

	// Replaces (1x): CommonEvents.json:common-event:294|タイトルコール
	AGH_setVariableRandomWork1TitleCall = function () {
		$gameVariables.setValue(21, $gameVariables.value(142));
		var variable21Value = $gameVariables.value(21);
		gab_wordParticle(`～～\\C[16]${variable21Value}\\C[0]～～`);
	};

	// Replaces (1x): CommonEvents.json:common-event:294|タイトルコール
	AGH_readVariableEpisodeRecallItemId = function () {
		if ($gameVariables.value(535) == 0) {
			var start = $gameVariables.value(75);
			var end = $gameVariables.value(76);
			for (var id1 = start; id1 <= end; id1++) {
				Profession_basicReturn(id1);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:295|シーン初期処理
	AGH_readVariableHeroineIdSceneInitProcessing = function (interp) {
		return (function () {
			//現在衣装を別変数配列に一時代入
			//統合衣装用の0も含める。（代入変数を利用しなくていい為可能）
			var list = $gameVariables.value(247);
			list.forEach(function (id) {
				var actor = $gameActors.actor(id);
				if ($gameParty.members().contains(actor)) {
					var start = 0; var end = 42;
					for (var i = start; i <= end; i++) {
						$gameVariables.value(id + 540)[i] = $gameVariables.value(id + 440)[i]
					}
				};
			}, this);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:295|シーン初期処理
	AGH_someArray = function () {
		//並列コモンスイッチid区分けにも使用
		valueScriptArray1 = [119, 125, 422, 425, 429, 481];
		valueScriptArray1.some(function (id) { return $gameSwitches.setValue(id, false) });
	};

	// Replaces (1x): CommonEvents.json:common-event:295|シーン初期処理
	AGH_setVariableMainSceneOrEpisode = function () {
		$gameVariables.setValue(626, 0);
		var variable535Value = $gameVariables.value(535);
		if (variable535Value >= 1) {
			if (Number($dataItems[variable535Value].meta['EICSwitch']) == 102) {
				$gameVariables.setValue(626, 1);
			};
			if (Number($dataItems[variable535Value].meta['EICSwitch']) == 103) {
				$gameVariables.setValue(626, 2);
			};
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:295|シーン初期処理
	AGH_setVariableEventStartSwitch = function () {
		var array = $gameMap._commonEvents.filter(function (event) {
			return event.isActive();
		}).map(function (event) {
			return event.event().id;
		});
		for (var i = 0; i <= array.length - 1; i++) {
			if (array[i] >= 2 && $dataCommonEvents[array[i]].switchId) {
				if (valueScriptArray1.some(function (id) { return id == $dataCommonEvents[array[i]].switchId })) { } else {
					$gameVariables.setValue(529, $dataCommonEvents[array[i]].switchId);
					$gameVariables.setValue(142, $dataCommonEvents[array[i]].name);
					valueCommonId = array[i];
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:295|シーン初期処理
	AGH_setVariableEventStartSwitchSceneInitProcessing = function () {
		if ($gameVariables.value(529) == 0) {
			var variable201Value = $gameVariables.value(201);
			$gameVariables.setValue(529, $dataCommonEvents[variable201Value].switchId);
			$gameVariables.setValue(142, $dataCommonEvents[variable201Value].name);
			valueCommonId = variable201Value;
		};
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
		adv_partDirectSet(9);
		var cloudW = 'cloud_w';//天候:雲
		var value2 = getRandomIndex(201) + 1000;
		$gameScreen._particle.particleUpdate([cloudW, 'speed', String(value2), String(value2)]);
		var arr1 = 0.75;//[0.40,0.45,0.50,0.55,0.60,0.65,0.70,0.75];
		var value2 = arr1[getRandomIndex(arr1.length)];
		$gameScreen._particle.particleUpdate([cloudW, 'alpha', '0', value2 + '@0.05', value2 + '@0.9', '0']);
		$gameScreen._particle.particleUpdate([cloudW, 'frequency', '1.5']);
	};

	// Replaces (1x): CommonEvents.json:common-event:298|オープニング
	AGH_setSelfSwitchOpening = function (interp) {
		return (function () {
			var value1 = $gameMap.mapId();
			var value2 = 7;//this._eventId;
			var positionY = 'D';
			var value4 = true;//false;
			$gameSelfSwitches.setValue([value1, value2, positionY], value4);
			var value2 = 8;//this._eventId;
			$gameSelfSwitches.setValue([value1, value2, positionY], value4);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_spawnMapEventOrderSkyKnightsAppear = function () {
		var value1 = 12;//$gamePlayer._realX;
		var value2 = 15;//$gamePlayer._realY;
		$gameMap.spawnEvent(143, value1, value2, true);
		valueCountSet1 = $gameMap.getLastSpawnEventId();
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_setSelfVariableChoiceSwitch12OrderSkyKnightsAppear = function (interp) {
		return (function () {
			this.sVal(172, 10); valueTalkSet = [28, `<秩序の騎空団団長代理>を務める\\set[1]。
		騎空挺を駆り任務先の島へと移動していた際、\n別の島で狼藉が行われている事を察知し急行する。
		名もなき集落を襲っていた「空賊」達の討伐に成功するが、\n集落の人々は一人の少年を残し全滅していた…。
		唯一の生き残りである少年、\\set[5]を\\N[1]は、\n騎空団で引き取り<秩序の騎空士見習い>として面倒を見る事に決める。

		──それから一か月。
		新天地での暮らしにも慣れてきた\\N[5]は、
		\\C[2]${$dataSystem.switches[221]}\\C[0]という島にある国で
		発生している問題の解決の為、
		\\N[1]や先輩騎空士達と共に\\C[2]${$dataSystem.switches[221]}\\C[0]へ
		向かうのであった…。`];
			this.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_getLastSpawnEventId = function (interp) {
		return (function () {
			event_respawnSetN(11, 12, 8, 0, '$airship02', 0);
			valueCountSet1 = $gameMap.getLastSpawnEventId();
			this._eventId = valueCountSet1;
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_eventOrder = function () {
		for (var id = 100; id > 0; id--) {
			if (!!$gameMap.event(id)) {
				if ($gameMap.event(id).event().meta['Order']) {
					var event = $gameMap.event(id);
					event.setDirection(6);
					event.requestBalloon(1);
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_readMapEventMetaOrder = function () {
		for (var id = 100; id > 0; id--) {
			if (!!$gameMap.event(id)) {
				if ($gameMap.event(id).event().meta['Order']) {
					var event = $gameMap.event(id);
					event.setDirection(4);
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_setSelfVariableChoiceSwitch12_2 = function (interp) {
		return (function () {
			this.sVal(172, 18);
			valueTalkSet = [0, 1];//1で付与2で直接表示\CE[60]のみ0で解除,ｱｸﾀｰid
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_eventBandit = function () {
		for (var id = 100; id > 0; id--) {
			if (!!$gameMap.event(id)) {
				if ($gameMap.event(id).event().meta['Bandit']) {
					var event = $gameMap.event(id);
					event.requestBalloon(12);
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_readMapEventMetaBandit = function () {
		for (var id = 100; id > 0; id--) {
			if (!!$gameMap.event(id)) {
				if ($gameMap.event(id).event().meta['Bandit']) {
					var event = $gameMap.event(id);
					//event.erase();
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_readMapEventMetaBanditOrderSkyKnightsAppear = function () {
		for (var id = 100; id > 0; id--) {
			if (!!$gameMap.event(id)) {
				if ($gameMap.event(id).event().meta['Bandit']) {
					$gameMap.event(id).forceMoveRoute({
						"list": [
							{ "code": 19 },
							{ "code": 0 }], "repeat": false, "skippable": true
					});
				}
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_particleSetDustWalk = function () {
		var dustWalk = 'dust_walk';
		$gameScreen._particle.particleSet(0, dustWalk, 'walk:event:1', 'def', 'below');
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_configureMapEventOrderSkyKnightsAppear = function () {
		var event = $gameMap.event(5);
		event.setFace(4, true, true, 0, 6, 0, 6);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_readVariableEventProgressHero = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 25, 10, 0);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setFace(8, true, true);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_particleSetFlashPermanence = function () {
		var flashPermanence = 'flash_permanence';
		$gameScreen._particle.particleSet(0, flashPermanence, 'screen', 'def', 'screen');
		var value2 = '#4bedff';//元がﾋﾟﾝｸ、青水'#4bedff',黄'#ffea4b',赤'#ff634b',
		$gameScreen._particle.particleUpdate([flashPermanence, 'color', value2, '#ffffff']);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_particleClearFlashPermanence = function () {
		var flashPermanence = 'flash_permanence';
		$gameScreen._particle.particleClear(flashPermanence);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_readVariableDynamicEventIdOrderSkyKnightsAppear = function (interp) {
		return (function () {
			original_main(valueCommonId, 7);
			var value1 = 19;
			event_charaZanzou($gameVariables.value(292)[$gameVariables.value(530)], value1);
			this._eventId = $gameVariables.value(292)[value1];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_readVariableDynamicEventId_2 = function (interp) {
		return (function () {
			var value1 = 20;
			event_charaZanzou($gameVariables.value(292)[$gameVariables.value(530)], value1);
			this._eventId = $gameVariables.value(292)[value1];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_readVariableDynamicEventId_3 = function (interp) {
		return (function () {
			this._eventId = $gameVariables.value(292)[$gameVariables.value(530)];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_runScriptOrderSkyKnightsAppear = function (interp) {
		return (function () {
			var array = [0];
			var arr2 = [-50];
			var arr3 = [`グハァァッッ！！`];
			chara_oneWord(100, this._eventId, 25, 180, array, arr2, arr3, 'genkai-mincho');
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_configureMapEventOrderSkyKnightsAppear_2 = function () {
		var event = $gameMap.event(5);
		event.removeFace();
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_readVariableDynamicEventId_4 = function (interp) {
		return (function () {
			this._eventId = $gameVariables.value(292)[$gameVariables.value(530)];
			var event = $gameMap.event(this._eventId);
			event.removeFace();
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_handleScriptSnippetFadeOut = function () {
		valuePic1 = 52;
		picture_fade1(52, "fadeOut", '150', 60, 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_readVariableEventProgressHeroOrderSkyKnightsAppear = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 8, 4, 1);
			this._eventId = $gameVariables.value(292)[variable530Value];
			goodsEvent_respawn(11, 'Goods8', 0, 4, 1, 8, 5);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_showPictureScreenBlackOutOrderSkyKnightsAppear = function () {
		const picId = 54;
		valuePic1 = picId;
		$gameScreen.showPicture(picId, 'ScreenBlackOut', 1, 640, 384, 100, 100, 250, 0);
		$gameScreen.showPicture(picId + 1, '/img/parallaxes/BlueSky', 1, 640, 384, 100, 100, 200, 0);
		$gameScreen.showPicture(picId + 2, '/img/parallaxes/EV_15_0', 1, 640, 384, 100, 100, 255, 0);
		$gameScreen.showPicture(picId + 3, '/img/parallaxes/EV_15_2', 1, 640, 384, 100, 100, 255, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_initValuePic1 = function () {
		const picId = 54;
		valuePic1 = picId;
		for (var i = 0; i <= 4; i++) { picture_fade1(picId + i, "fadeOut", valueWipeImg, 60, 5) };
	};

	// Replaces (1x): CommonEvents.json:common-event:301|[1]秩序の騎空団、参上！
	AGH_runScriptOrderSkyKnightsAppear_2 = function () {
		event_respawnSetA(3, 15, 40, 0);
		event_respawnSetA(4, 13, 40, 0);
		event_respawnSetA(5, 14, 40, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:305|[5]騎空士ギルド
	AGH_setSelfSwitchDynamicEventId = function (interp) {
		return (function () {
			$gameSelfSwitches.setValue([$gameMap.mapId(), 3, 'A'], true);
			const evId = 11;
			event_respawnSetN(evId, 19, 4, 0, 'Goods9', 0);
			const eventIds = $gameVariables.value(292);
			const event = $gameMap.event(eventIds[evId]);
			event.setDirection(2);
			this._eventId = eventIds[evId];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
	AGH_showPictureZXMain006 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 55;
		valueScenePic = 'ZX_Main006_';
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
		var pictureId = valuePic1 + 1;
		var value2 = valueScenePic + '02';
		$gameScreen.showPicture(pictureId, value2, 1, 640 - 128 + 20 + 50, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128 + 50, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
	AGH_showPictureInfoBrokerNegotiation = function () {
		pic_move1(valuePic1 + 1, 0, 0, 100, 100, 0, 90);
		var pictureId = valuePic1 + 2
		var scenePictureName = valueScenePic + '03';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 + 50, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128 + 50, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
	AGH_setPicturesAnimation = function () {
		for (var i = 1; i <= 3; i++) { pic_move1(valuePic1 + i, 0, 0, 100, 100, 0, 90) };
		$gameScreen.setPicturesAnimation(2, 10, "連番", 20);
		var pictureId = valuePic1 + 4;
		var scenePictureName = valueScenePic + '05_00';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 + 50, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128 + 50, 384, 100, 100, 255, 0, 60);
		if ($gameScreen.picture(pictureId)) {
			$gameScreen.picture(pictureId).startAnimationFrame(1, true, [1, 1, 1, 2]);
		};
		tachie_bless(pictureId, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
	AGH_showPictureInfoBrokerNegotiation_2 = function () {
		sex_direction(99, 0, 0);
		for (var i = 1; i <= 5; i++) { pic_move1(valuePic1 + i, 0, 0, 100, 100, 0, 90) };
		var pictureId = valuePic1 + 6;
		var scenePictureName = valueScenePic + '07';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 + 100, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128 + 100, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
	AGH_showPictureInfoBrokerNegotiation_3 = function () {
		$gameScreen.setPicturesAnimation(2, 20, "連番", 40);
		var pictureId = valuePic1 + 7;
		var scenePictureName = valueScenePic + '08_00';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 + 100, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128 + 100, 384, 100, 100, 255, 0, 60);
		if ($gameScreen.picture(pictureId)) {
			$gameScreen.picture(pictureId).startAnimationFrame(1, true, [1, 1, 1, 2]);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:306|[6]情報屋との交渉
	AGH_runScriptInfoBrokerNegotiation = function () {
		var value1 = 18;
		message_popup2(value1, 0, 1, 1);
		//message_popup2(0,[1024,368],1,1);
		//ｲﾍﾞﾝﾄid,ﾌｷﾀﾞｼ位置,行数,1で有効化。\sh[5] で振動強さ指定
		//0で座標指定,xyは中心点を指定
		//mpp文字操作との相性が悪い
	};

	// Replaces (1x): CommonEvents.json:common-event:307|[7]少年の初陣
	AGH_getPatternJump = function () {
		valuePic1 = 13;
		curveFunctions.patternX = curveFunctions.getPattern('jump', [30]);
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
		return (function () {
			picTachie_move1(13, -1000, 0, 0, 0, 255, 60);
			picTachie_move1(14, -1000, 0, 0, 0, 255, 60);
			if ($gameSwitches.value(127)) {
				AudioManager.playSe({ "name": "Z_FootRun", "volume": 35, "pitch": 100, "pan": 0 });
				var floorValue = Math.floor(floorValue / 2);//ウェイト
				this.wait(floorValue);
			} else {
				AudioManager.playSe({ "name": "Z_FootWalkShort", "volume": 65, "pitch": 100, "pan": 0 });
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:308|[8]高位種との遭遇
	AGH_updateParticleDynamicEventId = function (interp) {
		return (function () {
			var evId = 11;
			event_respawnSetN(evId, 12, 10, 0, 'Monster', 2, 2);
			const eventIds = $gameVariables.value(292);
			var event = $gameMap.event(eventIds[evId]);
			this._eventId = eventIds[evId];
			event.setDirection(2);
			event.setTone(-50, -200, 100);
			const picPath = 'magic_circle_c';
			$gameScreen._particle.particleSet(this._eventId, picPath + '-' + this._eventId, 'this', picPath);
			$gameScreen._particle.particleUpdate([picPath, 'color', '#400070', '#ffcdcd']);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:311|[11]中央平原で空賊捕縛
	AGH_readVariableEventProgressHeroCentralPlainCapture = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4], 1);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setImage(variable163Value[1], variable163Value[2]);
			event.setDirection(4);
			this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (3x): CommonEvents.json:common-event:312|[12]捕縛完了→引き渡しまで, CommonEvents.json:common-event:316|[16]集落の長に話を聞く, CommonEvents.json:common-event:345|[45]祭殿の隠し通路
	AGH_readVariableEventProgressHeroCaptureToHandover = function (interp) {
		return (function () {
			event_partyCharaEntry();
			var variable292Value = $gameVariables.value(530);
			var variable292Value = $gameVariables.value(292)[variable292Value];
			event_partyCharaMove(45, "this.turnTowardCharacter($gameMap.event(" + variable292Value + "));");
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:312|[12]捕縛完了→引き渡しまで
	AGH_eventMonsterSymbol = function (interp) {
		return (function () {
			for (var id = 200; id > 0; id--) {
				if (!!$gameMap.event(id)) {
					if ($gameMap.event(id).event().meta['MonsterSymbol']) {
						$gameMap.event(id).forceMoveRoute({
							"list": [
								{ "code": 45, "parameters": ["this.setOpacity(0);"] },
								{ "code": 0 }], "repeat": true, "skippable": true
						});
					}
				}
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:312|[12]捕縛完了→引き渡しまで
	AGH_readVariableEventProgressHero_2 = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 26, 4, 1, 2);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 3;
			event_respawnSetA(variable530Value, 26, 3, 0, 2);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
	AGH_setSelfVariableEventProgressHero = function (interp) {
		return (function () {
			this.sVal(530, 5);//主格キャラ
			this.sVal(535, 313);//挿話回想の場合アイテムID。メインは0
			if ($gameVariables.value(528) == 3) {
				valueWeatherSceneSet = 15;
			} else {
				valueWeatherSceneSet = 14;
			};
			h_keikenhyouji1(521, 357);//記録変数,相手ID
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
	AGH_readVariableEventProgressHeroPromotionGap = function (interp) {
		return (function () {
			//var value1 = 5;//$gameVariables.value(530);
			event_respawnSetA(5, 10, 13, 1, 8);
			//var value1 = 3;//$gameVariables.value(530);
			event_respawnSetA(3, 11, 13, 1, 8);
			this._eventId = $gameVariables.value(292)[value1];
			//var value1 = 12;
			event_respawnSetN(12, 10, 11, 0, 'People2', 1, 2);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
	AGH_eraseMapEventDynamicEventIdPromotionGap = function () {
		var eventId = $gameVariables.value(292)[11];
		$gameMap.eraseEvent(eventId);
		//$gameVariables.setValue(292,Array(21).fill(0));
	};

	// Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
	AGH_particleSetMahoujinC = function (interp) {
		return (function () {
			var mahoujinC = 'mahoujin_c';
			$gameScreen._particle.particleSet(this._eventId, mahoujinC + '-' + this._eventId, 'this', mahoujinC);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
	AGH_readVariableEventProgressHero_3 = function (interp) {
		return (function () {
			//var value1 = 5;//$gameVariables.value(530);
			this._eventId = $gameVariables.value(292)[5];
			const event = $gameMap.event(this._eventId);
			const screenX = event.screenX();
			const screenY = event.screenY();
			filter_direct(9, screenX, screenY, 60);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
	AGH_readVariableEventProgressHero_4 = function (interp) {
		return (function () {
			var id = 5;//$gameVariables.value(530);
			event_respawnSetA(id, 20, 13, 1, 2);
			this._eventId = $gameVariables.value(292)[id];
			//var id = 3;//$gameVariables.value(530);
			event_respawnSetA(3, 20, 14, 0, 4);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
	AGH_readVariableEventProgressHero_5 = function (interp) {
		return (function () {
			//var value1 = 5;//$gameVariables.value(530);
			event_respawnSetA(5, 8, 10, 1, 6);
			//var value1 = 3;
			event_respawnSetA(3, 11, 10, 0, 4);
			this._eventId = $gameVariables.value(292)[3];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:313|[13]昇格──格差──
	AGH_setSelfVariableActorChoicePromotionGap = function (interp) {
		return (function () {
			this.sVal(20, 0);
			valueWordSet0 = `教会で「昇格」が可能になりました！`;
			valueWordSetEx = 0;//補足が必要な場合
			this.setupChild($dataCommonEvents[45].list, 0);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:315|[15]集落到着
	AGH_readVariableEventProgressHeroVillageArrival = function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4], 1);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.setImage(variable163Value[1], variable163Value[2]);
		event.setDirection(variable163Value[5]);
		event_partyCharaEntry();
	};

	// Replaces (1x): CommonEvents.json:common-event:316|[16]集落の長に話を聞く
	AGH_readVariableEventProgressHeroAskVillageChief = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4], 1);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setImage(variable163Value[1], variable163Value[2]);
			event.setDirection(variable163Value[5]);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 11;
			event_respawnSetN(variable530Value, variable163Value[8], variable163Value[9], 0, variable163Value[6], variable163Value[7]);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setDirection(variable163Value[10]);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:316|[16]集落の長に話を聞く
	AGH_readVariableEventProgressHero_6 = function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value, 14, 18, 1, 2);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
	};

	// Replaces (1x): CommonEvents.json:common-event:322|[22]頭目との対峙
	AGH_readVariableEventProgressHeroBossConfrontation = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, 27, 19, 1);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setImage(variable163Value[1], variable163Value[2]);
			event.setDirection(variable163Value[5]);
			this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:322|[22]頭目との対峙
	AGH_readVariableEventProgressHero_7 = function () {
		var variable530Value = $gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		var value2 = event._realX;
		var value3 = event._realY;
		event_respawnSetA(3, value2 + 1, value3 + 1, 0, 8);
		event_respawnSetA(4, value2 - 1, value3 + 1, 0, 8);
		event_respawnSetA(5, value2, value3 + 1, 0, 8);
	};

	// Replaces (1x): CommonEvents.json:common-event:322|[22]頭目との対峙
	AGH_readVariableDynamicEventIdBossConfrontation = function () {
		var array = [];
		array.push($gameVariables.value(292)[12]);
		array.push($gameVariables.value(292)[13]);
		array.push($gameVariables.value(292)[14]);
		array.push($gameVariables.value(292)[15]);
		array.push($gameVariables.value(292)[16]);
		event_NpcCharaMoveId(19, 0, array);
	};

	// Replaces (1x): CommonEvents.json:common-event:328|[28]アウギュステ到着
	AGH_readVariableDynamicEventIdAugusteArrival = function (interp) {
		return (function () {
			event_respawnSetN(value1, 32, 9, 0, 'Goods9', 0, 2);
			this._eventId = $gameVariables.value(292)[value1];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:329|[29]水着購入
	AGH_readVariableEventProgressHeroSwimsuitPurchase = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4], 1);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setImage(variable163Value[1], variable163Value[2]);
			event.setDirection(variable163Value[5]);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 11;
			event_respawnSetN(variable530Value, variable163Value[8], variable163Value[9], 0, variable163Value[6], variable163Value[7]);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setDirection(variable163Value[10]);
			event.setStepAnime(false); event.setWalkAnime(false);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:329|[29]水着購入
	AGH_waitActorChoiceSwimsuitPurchase = function (interp) {
		return (function () {
			var actor = $gameActors.actor($gameVariables.value(20));
			//actor.addState(693);
			tachie_dousa(2, 1, 2, 14, 1, 255, 1311, 0, 0);
			tachie_dousa(0, 1, 1, 14, 15, 0, 120, 1, 0);
			//tachie_clothReflect(1);
			this.wait(3);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:329|[29]水着購入
	AGH_waitActorChoice_2 = function (interp) {
		return (function () {
			var actor = $gameActors.actor($gameVariables.value(20));
			//actor.addState(693);
			tachie_dousa(2, 1, 2, 15, 1, 255, 1347, 0, 0);
			tachie_dousa(0, 1, 1, 15, 14, 0, 180, 0, 0);
			tachie_clothReflect(1);
			this.wait(3);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
	AGH_readVariableEventProgressHeroMonicaJoins = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, 11, 5, 1, 6);
			var variable530Value = 3;//$gameVariables.value(530);
			event_respawnSetA(variable530Value, 12, 4, 0, 2);
			var variable530Value = 11;
			event_respawnSetN(variable530Value, variable163Value[8], variable163Value[9], 0, variable163Value[6], variable163Value[7], variable163Value[10]);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
	AGH_readVariableDynamicEventIdMonicaJoins = function () {
		var value1 = 13;
		goodsEvent_respawn(value1, 'food_1', 4, 6, 1, 13, 5);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event._spriteOffsetX = 20;
		event._spriteOffsetY = 0;
		event._priorityType = 0;
	};

	// Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
	AGH_runScriptMonicaJoins = function (interp) {
		return (function () {
			var array = [0];
			var arr2 = [50];
			var arr3 = [`モグモグ──サクサク──`];
			chara_oneWord(100, this._eventId, 25, 180, array, arr2, arr3, 0);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
	AGH_eraseMapEventDynamicEventIdMonicaJoins = function () {
		//var value1 = 13;
		$gameMap.eraseEvent($gameVariables.value(292)[13]);
	};

	// Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
	AGH_readVariableEventProgressHero_8 = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 38, 18, 1, 2);
			var variable530Value = 2;//$gameVariables.value(530);
			event_respawnSetA(variable530Value, 38, 20, 0, 8);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 3;//$gameVariables.value(530);
			event_respawnSetA(variable530Value, 37, 17, 0, 2);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:330|[30]モニカ合流
	AGH_readVariableDynamicEventId_5 = function () {
		var array = [0];
		var arr2 = [-50];
		var arr3 = [`了解！`];
		chara_oneWord(100, $gameVariables.value(292)[1], 25, 180, array, arr2, arr3, 0);
		chara_oneWord(101, $gameVariables.value(292)[3], 25, 180, array, arr2, arr3, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:331|[31]秘密の入口
	AGH_readVariableEventProgressHeroSecretEntrance = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 70, 12, 0, 8);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 2;//$gameVariables.value(530);
			event_respawnSetA(variable530Value, 71, 11, 1, 2);
			var variable530Value = 3;//$gameVariables.value(530);
			event_respawnSetA(variable530Value, 70, 13, 0, 8);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:333|[33]地底研究所
	AGH_readVariableEventProgressHeroUndergroundLab = function (interp) {
		return (function () {
			var variable292Value = 11;//$gameVariables.value(530);
			var variable292Value = $gameVariables.value(292)[variable292Value];
			drowsepost.camera.zoom(1, 60, variable292Value);
			var variable292Value = 11;//$gameVariables.value(530);
			this._eventId = $gameVariables.value(292)[variable292Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:333|[33]地底研究所
	AGH_readMapEventMetaRandomWork1 = function (interp) {
		return (function () {
			var eventId = $gameVariables.value(21);
			if (!!$gameMap.event(eventId)) {
				if ($gameMap.event(eventId).event().meta['Researcher']) {
					$gameMap.event(eventId).forceMoveRoute({
						"list": [
							{ "code": 29, "parameters": [5] },
							{ "code": 45, "parameters": ["this.startOpacity(120,0);"] },
							{ "code": 45, "parameters": ["Move To: 23, 20;"] },
							{ "code": 45, "parameters": ["this.erase();"] },
							{ "code": 0 }], "repeat": false, "skippable": true
					});
					this.wait(10);
				}
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:334|[34]アウギュステで分散
	AGH_readVariableEventProgressHeroAugusteDisperse = function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4], 1);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.setImage(variable163Value[1], variable163Value[2]);
		event.setDirection(variable163Value[5]);
		var variable530Value = 2;//$gameVariables.value(530);
		event_respawnSetA(variable530Value, 19, 3, 0, 8);
	};

	// Replaces (1x): CommonEvents.json:common-event:336|[36]情報屋に話を聞く
	AGH_readVariableEventProgressHeroAskInfoBroker = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, 6, 11, 1, 8);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 11;
			event_respawnSetN(variable530Value, variable163Value[8], variable163Value[9], 0, variable163Value[6], variable163Value[7]);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setDirection(2);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:337|[37]丘陵地帯からの…
	AGH_readVariableDynamicEventIdFromHills = function (interp) {
		return (function () {
			var eventId = 6;//$gameVariables.value(292)[11]; //this._eventId
			var event = $gameMap.event(eventId);
			event.setStepAnime(false);
			event.setWalkAnime(false);
			event.setDirection(2);
			event.resetPattern();
			event._originalPattern = 1;
			event.setAngle(45);
			event._spriteOffsetX = -12;
			event._spriteOffsetY = -12
			event._kageM.clear();
			event.setFace(6, true, true, 0, 6, 0, 6);//Child用
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_runScriptBBAkunin3 = function () {
		var id = 11;
		event_respawnSetN(id, 10, 12, 1, 'BB_akunin3', 5, 2);
		event_respawnSetN(id + 1, 9, 13, 0, 'BB_akunin3', 6, 6);
		event_respawnSetN(id + 2, 11, 13, 0, 'BB_akunin3', 6, 4);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableDynamicEventIdAirPirateRemnantSuppression = function (interp) {
		return (function () {
			var id = 20;
			goodsEvent_respawn(id, '!Door1', 2, 2, 1, 10, 19);
			var event = $gameMap.event($gameVariables.value(292)[id]);
			event._priorityType = 0;
			this._eventId = $gameVariables.value(292)[id];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableDynamicEventId_6 = function (interp) {
		return (function () {
			for (var i = 11; i <= 13; i++) {
				var variable292Value = $gameVariables.value(292)[i]; //this._eventId
				var event = $gameMap.event(variable292Value);
				event.requestBalloon(1);
				event.setDirection(2);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableDynamicEventId_7 = function (interp) {
		return (function () {
			var id = 17;//
			event_charaZanzou(this._eventId, $gameVariables.value(292)[id]);
			this._eventId = $gameMap.event($gameVariables.value(292)[id]);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableDynamicEventId_8 = function (interp) {
		return (function () {
			for (var i = 11; i <= 13; i++) {
				var variable292Value = $gameVariables.value(292)[i]; //this._eventId
				var event = $gameMap.event(variable292Value);
				event.requestAnimation(371);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableDynamicEventId_9 = function () {
		var array = [0];
		var arr2 = [-50];
		var arr3 = [`ギャアァッ！！`]; var id = 11;
		chara_oneWord(101, $gameVariables.value(292)[id], 25, 180, array, arr2, arr3, 0);
		var arr3 = [`グエッ`]; var id = 12;
		chara_oneWord(102, $gameVariables.value(292)[id], 25, 180, array, arr2, arr3, 0);
		var arr3 = [`ガッ…`]; var id = 13;
		chara_oneWord(103, $gameVariables.value(292)[id], 25, 180, array, arr2, arr3, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableDynamicEventId_10 = function (interp) {
		return (function () {
			for (var i = 11; i <= 13; i++) {
				AudioManager.playSe({ "name": 'Z_Collaps', "volume": 50, "pitch": 70, "pan": 0 });
				var variable292Value = $gameVariables.value(292)[i]; //this._eventId
				var event = $gameMap.event(variable292Value);
				event.setStepAnime(false); event.setWalkAnime(false);
				event.setDirection(2); event.resetPattern();
				event._originalPattern = 1; event.setAngle(45);
				event._spriteOffsetX = -12; event._spriteOffsetY = -12;
				event._kageM.clear();
				event.setFace(6, true, true);//Child用
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableDynamicEventId_11 = function (interp) {
		return (function () {
			AudioManager.playSe({ "name": 'Z_Collaps', "volume": 50, "pitch": 70, "pan": 0 });
			var variable292Value = $gameVariables.value(292)[5]; //this._eventId
			var event = $gameMap.event(variable292Value);
			event.setStepAnime(false); event.setWalkAnime(false);
			event.setDirection(2);
			event.resetPattern(); event._originalPattern = 1;
			event.setAngle(45);
			event._spriteOffsetX = -12;
			event._spriteOffsetY = -12
			event._kageM.clear();
			event.setFace(6, true, true, 0, 6, 0, 6);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableEventProgressHeroAirPirateRemnantSuppression = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 10, 15, 1, 8);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 12;
			event_respawnSetN(variable530Value, 10, 12, 0, 'BB_akunin3', 5, 2);
			event_respawnSetN(variable530Value + 1, 9, 13, 0, 'BB_akunin3', 6, 6);
			event_respawnSetN(variable530Value + 2, 11, 13, 0, 'BB_akunin3', 6, 4);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableDynamicEventId_12 = function (interp) {
		return (function () {
			for (var i = 12; i <= 14; i++) {
				var variable292Value = $gameVariables.value(292)[i]; //this._eventId
				var event = $gameMap.event(variable292Value);
				event.setStepAnime(false); event.setWalkAnime(false);
				event.setDirection(2); event.resetPattern();
				event._originalPattern = 1; event.setAngle(45);
				event._spriteOffsetX = -12; event._spriteOffsetY = -12;
				event._kageM.clear();
				event.setFace(6, true, true);//Child用
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableEventProgressHero_9 = function () {
		var value1 = 5;//$gameVariables.value(530);
		event_respawnSetA(value1, 8, 12, 1, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableEventProgressHero_10 = function () {
		var id = 5;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[id]);
		event.setStepAnime(false);
		event._priorityType = 2;
		event._spriteOffsetX = +10;
		event._spriteOffsetY = -58;
		event._kageM.clear();
		event.setFace(6, true, true, 0, 6, 0, 6);//Child用
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_playSeZClothesTakeOff = function () {
		var ZClothesTakeOff = 'Z_ClothesTakeOff';//ピッチ50か100。消去ウェイトで変更
		AudioManager.playSe({ "name": ZClothesTakeOff, "volume": 150, "pitch": 50, "pan": 0 });
		tachie_dousa(2, 1, 4, 14, 1, 255, 1319, 0, 0);
		tachie_dousa(2, 1, 4, 14, 1, 255, 1320, 0, 0);
		tachie_dousa(2, 1, 4, 14, 1, 255, 1321, 0, 0);
		tachie_dousa(2, 1, 4, 14, 1, 255, 1322, 0, 0);
		tachie_dousa(0, 1, 18, 13, 14, 0, 180, 1, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_playSeZClothesTakeOffAirPirateRemnantSuppression = function () {
		var ZClothesTakeOff = 'Z_ClothesTakeOff';//ピッチ50か100。消去ウェイトで変更
		AudioManager.playSe({ "name": ZClothesTakeOff, "volume": 150, "pitch": 100, "pan": 0 });
		tachie_dousa(0, 1, 22, 12, 13, 1318, 120, 0, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_showPictureGoodsDrag1 = function () {
		valuePic1 = 55;
		valueScenePic = 'Goods_drag1_';
		$gameScreen.setPicturesAnimation(2, 30, "連番", 60);
		var scenePictureName = valueScenePic + '00';
		$gameScreen.showPicture(valuePic1, scenePictureName, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_configureMapEventAirPirateRemnantSuppression = function (interp) {
		return (function () {
			var event = $gameMap.event(this._eventId);
			var value1 = event.screenX();
			var value2 = event.screenY();
			filter_direct(9, value1, value2, 20);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_showPictureZXMain037 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		valuePic2 = 71;
		valueScenePic = 'ZX_Main037_';
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
		var value2 = valueScenePic + '01';
		$gameScreen.showPicture(valuePic2 + 1, value2, 1, 640 + 480, 384 - 118, 100, 100, 200, 0);
		$gameScreen.movePicture(valuePic2 + 1, 1, 640 + 480, 384 + 50, 100, 100, 255, 0, 240);
		tachie_bless(valuePic2 + 1, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_showPictureScreen1024Frame = function () {
		var value2 = valueScenePic + '02';
		$gameScreen.showPicture(valuePic1 + 1, value2, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1 + 1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(valuePic1 + 1, 2);
		var value2 = 'Screen1024Frame';
		$gameScreen.showPicture(valuePic2, value2, 1, 640 - 78, 384, 100, 100, 255, 0);
		picture_fade1(valuePic2, "fadeIn", valueWipeImg, 60, 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_showPictureAirPirateRemnantSuppression = function () {
		var value1 = valuePic2 + 2;
		var value2 = valueScenePic + '03';
		$gameScreen.showPicture(value1, value2, 1, 640 + 480, 384 + 50, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 + 480, 384 + 50, 100, 100, 255, 0, 60);
		tachie_bless(value1, 2); pic_move1(value1 - 1, 0, 0, 100, 100, 0, 90);
		var value1 = valuePic1 + 2;
		var value2 = valueScenePic + '04';
		$gameScreen.showPicture(value1, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(value1, 2); pic_move1(value1 - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_showPicturePictureParallelLoop = function () {
		var pictureId = valuePic1 + 4;
		var scenePictureName = valueScenePic + '04a';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 150, 0);
		pic_setArray1 = [1, pictureId, 0, 5, 0, 30];
		pic_setArray2 = [1, pictureId, 0, 0, 3, 30]; //pic_setArray2 = [1,0,0,0,0,0];
		valueParallelPicSe1 = ['ZH_sticky4', 20, 60];
		valueParallelPicSe2 = ['ZH_sticky1', 20, 60];
		hcg_piston(pictureId, 7, 2, 1);
		$gameSwitches.setValue(429, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_showPictureAirPirateRemnantSuppression_2 = function () {
		var pictureId = valuePic1 + 5;
		var scenePictureName = valueScenePic + '06';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2); pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_showPictureAirPirateRemnantSuppression_3 = function () {
		$gameScreen.setPicturesAnimation(2, 10, "連番", 20);
		var pictureId = valuePic1 + 6;
		var scenePictureName = valueScenePic + '05_00';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		if ($gameScreen.picture(pictureId)) {
			$gameScreen.picture(pictureId).startAnimationFrame(1, true, [1, 1, 1, 2]);
		};
		tachie_bless(pictureId, 2); pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableEventProgressHero_11 = function () {
		var value1 = 5;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.setStepAnime(true);
		event._priorityType = 2;
		event._spriteOffsetX = -10;
		event._spriteOffsetY = +58;
		event.removeFace();
		event.setDirection(8);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableDynamicEventId_13 = function (interp) {
		return (function () {
			var variable292Value = $gameVariables.value(292)[11]; //this._eventId
			var event = $gameMap.event(variable292Value);
			event.setStepAnime(false); event.setWalkAnime(false);
			event.setDirection(2); event.resetPattern();
			event._originalPattern = 1; event.setAngle(45);
			event._spriteOffsetX = -12; event._spriteOffsetY = -12;
			event._kageM.clear();
			event.setFace(6, true, true);//Child用
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableEventProgressHero_12 = function () {
		var value1 = 11;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(4, 16);
		var value1 = 12;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(5, 16);
		var value1 = 13;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(4, 17);
		var value1 = 14;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(5, 17);
	};

	// Replaces (1x): CommonEvents.json:common-event:338|[38]空賊残党制圧
	AGH_readVariableEventProgressHero_13 = function () {
		var variable530Value = 5;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(4, 11);
		event.setDirection(2);
		event.setScale(100, 90);
		var variable530Value = $gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(22, 6);
		event.setDirection(2);
		event._spriteOffsetX = -48; event._spriteOffsetY = -24;
		event.setStepAnime(false); event.setWalkAnime(false);
		event._kageM.clear(); event.setFace(6, true, true);//Child用
	};

	// Replaces (1x): CommonEvents.json:common-event:339|[39]合流と分散
	AGH_showPictureZXMain038 = function () {
		valuePic1 = 55;
		valueScenePic = 'ZX_Main038_';
		var scenePictureName = valueScenePic + '01';
		$gameScreen.showPicture(valuePic1, scenePictureName, 1, 640, 384, 100, 100, 250, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:340|[40]謁見を申し出る
	AGH_readVariableEventProgressHeroRequestAudience = function () {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value, 13, 23, 1, 8);
		event_respawnSetA(5, 13, 24, 0, 8);
	};

	// Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
	AGH_readVariableEventProgressHeroPrisonDay1 = function () {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value, 12, 5, 1, 2);
		event_respawnSetA(5, 13, 6, 0, 4);
		event_respawnSetN(11, 18, 10, 0, 'npcCastle1', 2, 4);
	};

	// Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
	AGH_readVariableEventProgressHero_14 = function (interp) {
		return (function () {
			var value1 = 12;//$gameVariables.value(530);
			event_respawnSetN(value1, 16, 3, 1, 'npcCastle1', 2, 2);
			this._eventId = $gameVariables.value(292)[value1];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
	AGH_readVariableEventProgressHero_15 = function () {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value, 5, 8, 1, 8);
		event_respawnSetA(7, 5, 6, 0, 2);
		event_respawnSetN(12, 8, 5, 0, 'npcCastle1', 2, 6);
		event_respawnSetN(13, 10, 9, 0, 'npcCastle1', 2, 2);
		event_respawnSetN(14, 4, 9, 0, 'npcCastle1', 2, 8);
		event_respawnSetN(15, 6, 9, 0, 'npcCastle1', 2, 8);
	};

	// Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
	AGH_showPictureDungeon12 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);//'Dungeon1_2'
		valueScenePic = 'ZX_Main040_';
		valuePic1 = 55;
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
		var pictureId = valuePic1 + 1;
		var value2 = valueScenePic + '01';
		$gameScreen.showPicture(pictureId, value2, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
	AGH_showPicturePrisonDay1 = function () {
		picture_se1();
		var pictureId = valuePic1 + 3;
		var scenePictureName = valueScenePic + '03';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
	AGH_movePicture1PrisonDay1 = function () {
		picture_se1();
		var pictureId = valuePic1 + 3;
		pic_move1(pictureId, 0, 0, 100, 100, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
	AGH_movePicture1PrisonDay1_2 = function () {
		var value1 = 55;
		pic_move1(value1, 0, 0, 0, 0, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
	AGH_movePicture1PrisonDay1_3 = function () {
		picture_se1();
		var pictureId = valuePic1 + 3;
		pic_move1(pictureId, 0, 0, 100, 100, 255, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
	AGH_showPicturePrisonDay1_2 = function () {
		var pictureId = valuePic1 + 4;
		var scenePictureName = valueScenePic + '04';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 - 50, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
	AGH_showPicturePrisonDay1_3 = function () {
		picture_se1();
		var pictureId = valuePic1 + 9;
		var scenePictureName = valueScenePic + '13';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:341|[41]牢獄１日目
	AGH_showPicturePrisonDay1_4 = function () {
		picture_se1();
		var pictureId = valuePic1 + 10;
		var scenePictureName = valueScenePic + '14';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
	AGH_readVariableEventProgressHeroPrisonDay6 = function (interp) {
		return (function () {
			var value1 = 12;//$gameVariables.value(530);
			event_respawnSetN(value1, 16, 3, 1, 'npcCastle1', 2, 2);
			//this._eventId = $gameVariables.value(292)[value1];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
	AGH_waitPrisonDay6 = function (interp) {
		return (function () {
			var id1 = 1;
			var id2 = 30;
			var array = [`ア`, `ア`, `ア`, `ア`, `ア`, `～`, `ン`];
			var arr2 = [`゛`, `゛`, `゛`, `\\C[27]♥\\C[0]`, `\\C[27]♡\\C[0]`, ` `];
			var arr3 = [64, 60, 55, 50, 45, 40, 35, 64, 60, 55, 50, 45, 40, 35, 64, 60, 55, 50, 45, 40, 35, 14];
			var arr4 = [25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15];
			text_randumWord(21, id1, id2, array, arr2, arr3, arr4);
			this.wait(10);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
	AGH_runScriptPrisonDay6 = function () {
		var messageText = `\\N[5]は「\\c[2]魔導ディスク\\c[0]」を手に入れた。`;
		TickerManager.show(messageText);
	};

	// Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
	AGH_readVariableEventProgressHero_16 = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 11, 6, 1, 6);
			var variable530Value = 5;//$gameVariables.value(530);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.locate(13, 6);
			event.setDirection(4);
			var variable530Value = 12;//$gameVariables.value(530);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.locate(18, 10);
			event.setDirection(4);
			this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
	AGH_readVariableEventProgressHero_17 = function () {
		var value1 = 13;//$gameVariables.value(530);
		event_respawnSetN(value1, 12, 10, 0, 'npcOrder1', 3, 8);
		event_partyCharaMove(16, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:342|[42]牢獄６日目
	AGH_readVariableEventProgressHero_18 = function () {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value, 6, 9, 1, 2);
		event_respawnSetA(5, 7, 9, 0, 2);
		event_respawnSetA(2, 6, 10, 0, 8);
		event_respawnSetA(3, 7, 10, 0, 8);
		event_respawnSetA(4, 5, 10, 0, 8);
	};

	// Replaces (1x): CommonEvents.json:common-event:343|[43]誇りと秩序
	AGH_readVariableEventProgressHeroPrideAndOrder = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4], 1, variable163Value[5]);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 11;
			event_respawnSetN(variable530Value, 13, 13, 0, 'People3', 6, 2);
			event_respawnSetN(12, 10, 17, 0, 'npcCastle1', 2, 6);
			event_respawnSetN(13, 10, 18, 0, 'npcCastle1', 2, 6);
			event_respawnSetN(14, 16, 17, 0, 'npcCastle1', 2, 4);
			event_respawnSetN(15, 16, 18, 0, 'npcCastle1', 2, 4);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:344|[44]宰相蓄電
	AGH_setVariableChoiceSwitch11 = function (interp) {
		return (function () {
			$gameVariables.setValue(171, [36, 13, 16]);
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 13, 16, 1, 8);
			this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:345|[45]祭殿の隠し通路
	AGH_setVariableChoiceSwitch11ShrineSecretPath = function (interp) {
		return (function () {
			$gameVariables.setValue(171, [108, 10, 9]);
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 10, 9, 1, 8);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 11;
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			goodsEvent_respawn(variable530Value, variable163Value[6], variable163Value[7], variable163Value[10], variable163Value[11], variable163Value[8], variable163Value[9]);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event._priorityType = 1;
			event._spriteOffsetX = +12;
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:346|[46]遺跡の守護者
	AGH_readVariableDynamicEventIdRuinsGuardian = function () {
		var variable292Value = 12;
		var variable292Value = $gameVariables.value(292)[variable292Value];
		message_popup2(variable292Value, 0, 2, 1);
		//message_popup2(0,[1024,368],1,1);
		//ｲﾍﾞﾝﾄid,ﾌｷﾀﾞｼ位置,行数,1で有効化。\sh[5] で振動強さ指定
		//0で座標指定,xyは中心点を指定
		//mpp文字操作との相性が悪い
	};

	// Replaces (1x): CommonEvents.json:common-event:349|[49]終幕
	AGH_readVariableEventProgressHeroFinale = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 8, 4, 1, 2);
			this._eventId = $gameVariables.value(292)[variable530Value];
			goodsEvent_respawn(11, 'Goods8', 0, 4, 1, 8, 5);
			goodsEvent_respawn(12, 'Goods8', 0, 6, 0, 7, 5);
			goodsEvent_respawn(13, 'Goods8', 0, 6, 0, 9, 5);
			goodsEvent_respawn(14, 'Goods7', 5, 8, 1, 7, 6);
			goodsEvent_respawn(15, 'Goods7', 5, 8, 1, 9, 6);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:350|[50]次なる戦いへ──
	AGH_readVariableEventProgressHeroNextBattle = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4], 1);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setImage(variable163Value[1], variable163Value[2]);
			event.setDirection(variable163Value[5]);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 2;//$gameVariables.value(530);
			event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4] + 3, 1, 8);
			goodsEvent_respawn(11, 'Goods8', 0, 6, 1, 8, 5);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:355|戦闘時台詞集
	AGH_pushToArrayAddText = function () {
		var messageText = `\\wn[351]が\\sim[331]を発動した！`
		BattleManager._logWindow.push(`addText`, messageText);
	};

	// Replaces (1x): CommonEvents.json:common-event:356|ハイゴブリン勝利
	AGH_readVariableEventProgressHeroHighGoblinVictory = function (interp) {
		return (function () {
			var variable292Value = 5;//$gameVariables.value(530);
			var variable292Value = $gameVariables.value(292)[variable292Value];
			character = this.character(variable292Value);
			character.locate(12, 11);
			character.setDirection(8);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:356|ハイゴブリン勝利
	AGH_readVariableEventProgressHero_19 = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var event = $gameMap.event(this._eventId);
			var variable530Value = event.screenX();
			var value2 = event.screenY();
			filter_direct(9, variable530Value, value2, 60);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:356|ハイゴブリン勝利
	AGH_readVariableEventProgressHero_20 = function () {
		var variable292Value2 = $gameVariables.value(530);
		var variable292Value2 = $gameVariables.value(292)[variable292Value2];
		var event = $gameMap.event(variable292Value2);
		event.setOpacity(0);
		var variable292Value2 = 5;//$gameVariables.value(530);
		var variable292Value2 = $gameVariables.value(292)[variable292Value2];
		var event = $gameMap.event(variable292Value2);
		event.setOpacity(0);
	};

	// Replaces (1x): CommonEvents.json:common-event:358|空賊ボス勝利
	AGH_configureMapEventAirPirateBossVictory = function (interp) {
		return (function () {
			var eventId = this._eventId; //this._eventId
			var event = $gameMap.event(eventId);
			event.setStepAnime(false);
			event.setWalkAnime(false);
			event.setDirection(2);
			event.resetPattern();
			event._originalPattern = 1;
			event.setAngle(45);
			event._spriteOffsetX = -12;
			event._spriteOffsetY = -12
			event._kageM.clear();
			event.setFace(6, true, true);//Child用
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:359|ガーディアン勝利
	AGH_readVariableEventProgressHeroGuardianVictory = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var event = $gameMap.event(this._eventId);
			var variable530Value = event._realX;
			var value2 = event._realY;
			filter_direct(9, variable530Value, value2, 60);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:360|ガーディアン2勝利
	AGH_readVariableEventProgressHeroGuardian2Victory = function () {
		var variable530Value = $gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(7, 24);
		event.setDirection(8);
		var variable530Value = 2;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(6, 23);
		event.setDirection(6);
		var variable530Value = 3;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(8, 23);
		event.setDirection(4);
	};

	// Replaces (1x): CommonEvents.json:common-event:360|ガーディアン2勝利
	AGH_showPictureGoodsBook1 = function () {
		valuePic1 = 55;
		var GoodsBook1 = 'Goods_Book1';
		$gameScreen.showPicture(valuePic1, GoodsBook1, 1, 640, 384 - 20, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1, 1, 640, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:361|騎士団長勝利
	AGH_readVariableEventProgressHeroKnightLeaderVictory = function () {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value, 13, 15, 1, 8);
		var variable530Value = 11;
		event_respawnSetN(variable530Value, 13, 13, 0, 'People3', 6, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:361|騎士団長勝利
	AGH_readVariableEventProgressHero_21 = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event._spriteOffsetY = -24;
			var variable530Value = 11;
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event._spriteOffsetY = +24;
			this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:361|騎士団長勝利
	AGH_readVariableDynamicEventIdKnightLeaderVictory = function (interp) {
		return (function () {
			var value1 = 17;//
			event_charaZanzou(this._eventId, value1);
			this._eventId = $gameVariables.value(292)[value1];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:363|グドン勝利
	AGH_readVariableEventProgressHeroGudonVictory = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 12, 10, 1, 8);
			//this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:363|グドン勝利
	AGH_configureMapEventGudonVictory = function (interp) {
		return (function () {
			var event = $gameMap.event(this._eventId);
			var value3 = "Hscene005";//102一刀両断 Hscene005崩壊 008横両断 054封印 153内側から
			event._GWInfo = $gameScreen.createGWInfo(["fadeOut", value3, 300, 5]);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:364|\N[5]勝利
	AGH_configureMapEventActor5Victory = function () {
		if (!!$gameMap.event(12)) {
			var event = $gameMap.event(12);
			event.setStepAnime(false); event.setWalkAnime(false);
			event.setDirection(2); event.resetPattern();
			event._originalPattern = 1; event.setAngle(45);
			event._spriteOffsetX = -12; event._spriteOffsetY = -12;
			event._kageM.clear();
			event.setFace(6, true, true);//Child用event.setFace(6,true,true,0,6,0,6);
		}
	};

	// Replaces (4x): CommonEvents.json:common-event:368|コマンド, CommonEvents.json:common-event:495|サンプル, CommonEvents.json:common-event:532|サンプル, CommonEvents.json:common-event:548|
	AGH_showPictureCommand = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		var pictureId = valuePic1 + 1;
		var scenePictureName = valueScenePic + '02';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (5x): CommonEvents.json:common-event:368|コマンド, CommonEvents.json:common-event:412|, CommonEvents.json:common-event:495|サンプル, CommonEvents.json:common-event:532|サンプル, CommonEvents.json:common-event:548|
	AGH_showPictureZXMain037Command = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 55;
		valuePic2 = 71;
		valueScenePic = 'ZX_Main037_';
		var ScreenBlackOut = 'ScreenBlackOut';
		$gameScreen.showPicture(51, ScreenBlackOut, 1, 640, 384, 100, 100, 150, 0);
		picture_fade1(51, "fadeIn", valueWipeImg, 60, 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:370|素体
	AGH_setSelfVariableEventProgressHeroBaseBody = function (interp) {
		return (function () {
			this.sVal(530, 1);//主格キャラ
			$gameVariables.setValue(292, Array(21).fill(0));
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 12, 12, 1, 8);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:381|情報屋処理
	AGH_setSwitchRandomWork1InfoBrokerProcessing = function () {
		var variable19Value = $dataItems[$gameVariables.value(19)].price;
		$gameVariables.setValue(21, variable19Value.toLocaleString());
		if ($gameParty.gold() >= variable19Value) {
			$gameSwitches.setValue(161, true);
		} else {
			$gameSwitches.setValue(161, false);
		};
		valueCountSet2 = variable19Value;
	};

	// Replaces (1x): CommonEvents.json:common-event:381|情報屋処理
	AGH_setSwitchActorChoiceInfoBrokerProcessing = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		if ($gameSwitches.value(508)) {
			if ($gameSwitches.value(1007) && !$gameSwitches.value(1107)) {
				$gameSwitches.setValue(162, true);
			}
		};
		if ($gameSwitches.value(508)) {
			if ($gameSwitches.value(1008) && !$gameSwitches.value(1108)) {
				$gameSwitches.setValue(162, true);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:381|情報屋処理
	AGH_setSwitchActorChoice_2 = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		if ($gameSwitches.value(508)) {
			if ($gameSwitches.value(1009) && !$gameSwitches.value(1109)) {
				$gameSwitches.setValue(162, true);
			}
		};
		if ($gameSwitches.value(508)) {
			if ($gameSwitches.value(1109)) {
				$gameSwitches.setValue(162, true);
			}
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:381|情報屋処理
	AGH_setSelfVariableRandomWork3 = function (interp) {
		return (function () {
			var value1 = 507;
			if ($gameSwitches.value(1107)) { var value1 = 508 };
			if ($gameSwitches.value(1108)) { var value1 = 509 };
			if ($gameSwitches.value(1109)) { var value1 = 1000 };
			if ($gameSwitches.value(1110)) { var value1 = 1000 };
			valueCountSet1 = value1;
			if (valueCountSet1 == 1000) {
				this.sVal(23, `汎用シーン発生`); $gameSwitches.setValue(162, true);
			} else {
				this.sVal(23, `${$dataItems[valueCountSet1].description}`);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
	AGH_setSelfVariableEventProgressHeroCareForDrunkard = function (interp) {
		return (function () {
			valueScenePic = 'XevS006_';
			//var value2 = valueScenePic+'01';
			valueVariable163Set = 5;
			this.sVal(530, 1);//主格キャラ
			this.sVal(535, 502);//挿話回想の場合アイテムID。メインは0
			valueWeatherSceneSet = 15;
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
	AGH_showPictureScreenBlackOutCareForDrunkard = function () {
		valuePic1 = 51;
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 150, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
		var value2 = valueScenePic + '01';
		$gameScreen.showPicture(valuePic1 + 1, value2, 1, 640 - 128, 384 - 10, 100, 100, 255, 0);
		$gameScreen.movePicture(valuePic1 + 1, 1, 640 - 128, 384, 100, 100, 255, 0, 40);
		hcg_piston(valuePic1 + 1, 6, 1, 1);
	};

	// Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
	AGH_runPluginCommandCutInNoWait = function (interp) {
		return (function () {
			var scenePictureName = valueScenePic + '05';
			$gameSwitches.setValue(428, true);
			valueCutInSet1 = ['Ｈシーン演出', scenePictureName, 270, 1.5, 1.2, 25, 120];
			var args = new Array(String(valueCutInSet1[0]));
			this.pluginCommand("味方カットイン", args);
			$gameSwitches.setValue(428, false);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
	AGH_showPictureCareForDrunkard = function () {
		var value2 = valueScenePic + '04';
		$gameScreen.showPicture(valuePic1 + 4, value2, 1, 640 - 128, 384 + 100, 100, 100, 255, 0);
		$gameScreen.movePicture(valuePic1 + 4, 1, 640 - 128, 384, 100, 100, 255, 0, 40);
		hcg_piston(valuePic1 + 4, 7, 2, 2);
		var value2 = valueScenePic + '02';
		pic_1(0, valuePic1 + 2, value2, 2, 100, 255, 40, 1280, 768, -256, 0);
		hcg_piston(valuePic1 + 2, 6, 1, 1);
		sex_direction(6, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
	AGH_setSelfVariableChoiceSwitch12CareForDrunkard = function (interp) {
		return (function () {
			this.sVal(172, 13);
			valueTalkSet = [640 - 128, 386, 200, false];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
	AGH_runScriptCareForDrunkard = function () {
		var scenePictureName = valueScenePic + '03';
		pic_1(0, valuePic1 + 3, scenePictureName, 2, 100, 255, 40, 1280, 768, -256, 0);
		hcg_piston(valuePic1 + 3, 6, 1, 1);
	};

	// Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
	AGH_setSelfVariableChoiceSwitch12_3 = function (interp) {
		return (function () {
			this.sVal(172, 13);
			valueTalkSet = [640 - 128, 386, 200, false];
			this.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:382|酔っ払いを介抱する
	AGH_setSwitchCareForDrunkard = function () {
		if (eval(valueSceneConditions1)) {
			$gameSwitches.setValue(161, true);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:387|闘技場受付2
	AGH_setSwitchSpecialMeasureDenied = function () {
		if ($gameSwitches.value(637)) {
			$gameSwitches.setValue(162, false);
		} else {
			$gameSwitches.setValue(162, true);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:389|情報屋汎用
	AGH_setSwitchNonHSceneBGVStart = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		//if(actor.meta['SexualEcstasyHi']){var SexualEcstasyHiList = actor1.meta['SexualEcstasyHi'].split(',')};//SexualEcstasyLow  SexualEcstasyMiddle
		//var arr1 = ['（ドキっ）','（ドキドキ）','（ドクン）','ドキッ'];//文字BGV
		var arr1 = ['「アッ\\I[12]」', '「ンッ\\I[12]」', '「ンン…\\I[12]」', '「ンクっ…\\I[12]」', '「ァンっ…\\I[12]」'];//文字BGV
		//var arr1 = ['「………ァっ」','「いや…」','「ンン──……」','「ンクっ…」','「ァンっ…」'];//文字BGV
		htext_word(3);//3高2中1低
		array = array.concat(valueHtextWord);
		$gameVariables.setValue(707, array);
		$gameVariables.setValue(706, [640 - 128, 386, 1, 60, 0, 'eromangasimaji']);
		$gameSwitches.setValue(125, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:390|娼館コモン
	AGH_floor = function () {
		i1 = getRandomIndex(6) + 1;//人数
		i2 = getRandomIndex(7) + 3;//膣回数
		i3 = Math.floor(Math.random() * -2) + i1;//中だし回数
		i4 = getRandomIndex(5) + 0;//アナル回数
		i5 = Math.floor(Math.random() * -2) + 0;//中だし回数
		i6 = getRandomIndex(2) + 1;//フェラ回数
		i7 = getRandomIndex(1) + i4;//口腔回数
		i8 = getRandomIndex(3) + 0;//失禁回数
		return { i1: i1, i2: i2, i3: i3, i4: i4, i5: i5, i6: i6, i7: i7, i8: i8 };
	};

	// Replaces (1x): CommonEvents.json:common-event:392|トウロウコモン1
	AGH_movePicture1ToroCommon1 = function () {
		var pictureId = valuePic1 + 1;
		pic_showMove1(pictureId, valueScenePic + '01',
			640 - 128, 384, 100, 60, 1, 50);
		tachie_bless(pictureId, 2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:392|トウロウコモン1
	AGH_movePicture1ToroCommon1_2 = function () {
		var pictureId = valuePic1 + 2;
		pic_showMove1(pictureId, valueScenePic + '11',
			640 - 128, 384, 100, 60, 1, -50);
		hcg_piston(pictureId, 7, 1, 1);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:392|トウロウコモン1
	AGH_erasePicturesToroCommon1 = function () {
		for (var i = 0; i <= 3; i++) { pic_eraseP(0, [valuePic1 + i]) };
	};

	// Replaces (1x): CommonEvents.json:common-event:400|↓挿話集コモン500まで
	AGH_initValueScenePic = function () {
		valueScenePic = 'XevO001_';
		//var value2 = valueScenePic+'01';
	};

	// Replaces (1x): CommonEvents.json:common-event:410|立ち上がる秩序
	AGH_showPictureScreenBlackOutRisingOrder = function () {
		valuePic1 = 51;
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
		var pictureId = valuePic1 + 1;
		var value2 = valueScenePic + '01';
		$gameScreen.showPicture(pictureId, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:411|無頓着な秩序
	AGH_waitNonchalantOrder = function (interp) {
		return (function () {
			valuePic1 = 16;
			var picture = $gameScreen.picture(valuePic1).x();
			var value2 = $gameScreen.picture(13).x();
			picTachie_move1(valuePic1, value2 - picture - 200, 0, 0, 0, 255, 30);
			this.wait(30);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:411|無頓着な秩序
	AGH_waitNonchalantOrder_2 = function (interp) {
		return (function () {
			valuePic1 = 16;
			var picture = $gameScreen.picture(valuePic1).scaleX();
			picTachie_move1(valuePic1, 0, 0, picture - picture - picture, 0, 255, 30);
			this.wait(30);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:411|無頓着な秩序
	AGH_waitPortraitTalkHurry = function (interp) {
		return (function () {
			picTachie_move1(16, -500, 0, 0, 0, 0, 60);
			valuePic1 = 13;
			picTachie_move1(valuePic1, -500, 0, 0, 0, 0, 60);
			if ($gameSwitches.value(127)) {
				AudioManager.playSe({ "name": "Z_FootCastle", "volume": 25, "pitch": 140, "pan": 0 });
				var floorValue = Math.floor(floorValue / 2);//ウェイト
			} else {
				AudioManager.playSe({ "name": "Z_FootCastle", "volume": 25, "pitch": 100, "pan": 0 });
			};
			this.wait(60);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:412|
	AGH_showPictureScreenBlackOutCommonEvent412 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
		var pictureId = valuePic1 + 1;
		var value2 = valueScenePic + '02';
		$gameScreen.showPicture(pictureId, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:414|副船団長の密かな疑問
	AGH_runScriptViceCaptainDoubt = function () {
		var value1 = '/img/parallaxes/BG_Town1';
		parallax_scroll(7, value1, 0, 20, 0.2, 0, 255);
	};

	// Replaces (1x): CommonEvents.json:common-event:431|未必の陰謀
	AGH_readVariableDynamicEventIdHiddenConspiracy = function (interp) {
		return (function () {
			var value1 = 16;
			event_respawnSetN(value1, 6, 15, 0, 'npcOrder1', 5);
			var event = $gameMap.event($gameVariables.value(292)[value1]);
			event.setDirection(8);
			this._eventId = $gameVariables.value(292)[value1];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:431|未必の陰謀
	AGH_readVariableDynamicEventId_14 = function (interp) {
		return (function () {
			var value1 = 17;
			event_respawnSetN(value1, 8, 7, 0, 'npcOrder1', 1);
			this._eventId = $gameVariables.value(292)[value1];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:432|休暇のすゝめ
	AGH_readVariableEventProgressHeroRecommendVacation = function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		var variable530Value = 11;
		event_respawnSetN(variable530Value, variable163Value[8], variable163Value[9], 0, variable163Value[6], variable163Value[7], 4);
	};

	// Replaces (1x): CommonEvents.json:common-event:441|△人助け
	AGH_readVariableEventProgressHeroHelpingHands = function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value, variable163Value[3] - 5, variable163Value[4], 1);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.setImage(variable163Value[1], variable163Value[2]);
		event.setDirection(variable163Value[5]);
		var variable530Value = 11;
		event_respawnSetN(variable530Value, variable163Value[8], variable163Value[9], 0, variable163Value[6], variable163Value[7]);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.setDirection(variable163Value[10]);
	};

	// Replaces (1x): CommonEvents.json:common-event:441|△人助け
	AGH_readVariableDynamicEventIdHelpingHands = function (interp) {
		return (function () {
			var variable292Value = $gameVariables.value(292)[11]; //this._eventId
			var event = $gameMap.event(variable292Value);
			event.setStepAnime(false);
			event.setWalkAnime(false);
			event.setDirection(2);
			event.resetPattern();
			event._originalPattern = 1;
			event.setAngle(45);
			event._spriteOffsetX = -12;
			event._spriteOffsetY = -12
			event._kageM.clear();
			event.setFace(6, true, true);//Child用
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:442|△人助け2
	AGH_readVariableEventProgressHeroHelpingHands2 = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, variable163Value[3] - 5, variable163Value[4], 1);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setImage(variable163Value[1], variable163Value[2]);
			event.setDirection(variable163Value[5]);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 11;
			event_respawnSetN(variable530Value, variable163Value[8], variable163Value[9], 0, variable163Value[6], variable163Value[7]);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setDirection(variable163Value[10]);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:442|△人助け2
	AGH_runPluginCommandCutInNoWaitHelpingHands2 = function (interp) {
		return (function () {
			valueScenePic = 'XevO000_';
			var scenePictureName = valueScenePic + '02_00';
			$gameSwitches.setValue(428, true);
			valueCutInSet1 = ['カットインアクター会話', scenePictureName, -90, 4.5, 3.0, 25, 60];
			var args = new Array(String(valueCutInSet1[0]));
			this.pluginCommand("味方カットイン", args);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:442|△人助け2
	AGH_readVariableEventProgressHero_22 = function (interp) {
		return (function () {
			var value1 = 11;//$gameVariables.value(530);
			this._eventId = $gameVariables.value(292)[value1];
			drowsepost.camera.zoom(1, 120, this._eventId);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:444|△りーしゃ人助け
	AGH_setSelfVariableChoiceSwitch12LishaHelpingHands = function (interp) {
		return (function () {
			this.sVal(172, 10);//文字ﾋﾟｸTips以外
			var messageText =
				`彼女が感じた最も近い感情は、「落胆」や「失意」と言ったものだろう。
		未だ歳若い、理想を胸に宿す少女には明確な理解が出来なかったのだ。
		何れはそこに至るやも知れぬが、それはこの物語に措いてでは無い…。
		`;
			valueTalkSet = [25, actor.profile()]
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:451|雄ドラフ、驚愕する
	AGH_readVariableEventProgressHeroMaleDrafAstonished = function (interp) {
		return (function () {
			var value1 = 1;//$gameVariables.value(530);
			event_respawnSetN(value1, 16, 6, 0, '1_1', 2);
			this._eventId = $gameVariables.value(292)[value1];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:452|△露出王(上巻)を読む
	AGH_readVariableEventProgressHeroReadExposureKing = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, variable163Value[3] + 1, variable163Value[4], 1, 2);
			this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:452|△露出王(上巻)を読む
	AGH_readVariableDynamicEventIdReadExposureKing = function () {
		var value1 = 11;
		goodsEvent_respawn(value1, 'Goods7', 5, 8, 1, 14, 5);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event._spriteOffsetY = -20;
		event._priorityType = 2;
	};

	// Replaces (1x): CommonEvents.json:common-event:452|△露出王(上巻)を読む
	AGH_showPictureScreenBlackOutReadExposureKing = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 55;
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1 - 1, value2, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1 - 1, "fadeIn", valueWipeImg, 60, 5);
		var value2 = 'ZX_NowconditionF_2';
		$gameScreen.showPicture(valuePic1, value2, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
	AGH_readVariableDynamicEventIdAwakenB = function (interp) {
		return (function () {
			this._eventId = $gameVariables.value(292)[11];
			drowsepost.camera.zoom(1, 60, this._eventId);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
	AGH_readVariableDynamicEventId_15 = function (interp) {
		return (function () {
			var variable292Value = $gameVariables.value(292)[5]; //this._eventId
			if (!!$gameMap.event(variable292Value)) {
				var event = $gameMap.event(variable292Value);
				event.setStepAnime(false); event.setWalkAnime(false);
				event.setDirection(2); event.resetPattern();
				event._originalPattern = 1; event.setAngle(45);
				event._spriteOffsetX = -12; event._spriteOffsetY = -12;
				event._kageM.clear();
				event.setFace(6, true, true, 0, 6, 0, 6);//Child用event.setFace(6,true,true,0,6,0,6);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
	AGH_spawnMapEventDynamicEventIdAwakenB = function (interp) {
		return (function () {
			var variable292Value = $gameVariables.value(292)[5]; //this._eventId
			var value5 = $gameMap.event(variable292Value).x; var value6 = $gameMap.event(variable292Value).y;
			$gameMap.spawnEvent(190, value5, value6, true);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
	AGH_showPictureAwakenB = function () {
		valuePic1 = 55;
		var value2 = "/img/parallaxes/Scene_Awaken_1";
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1, 1, 640, 384, 100, 100, 50, 0, 60);
		$gameScreen.rotatePicture(valuePic1, 0.1);
		hcg_piston(valuePic1, 7, 1, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
	AGH_movePictureLifeStormScreen = function () {
		$gameScreen.movePicture(valuePic1, 1, 640, 384, 100, 100, 100, 0, 60);
		var lifeStormScreen = 'lifeStorm_screen';
		$gameScreen._particle.particleUpdate([lifeStormScreen, 'particlesPerWave', String(10)]);
		$gameScreen._particle.particleUpdate([lifeStormScreen, 'speed', String(200), String(0)]);
	};

	// Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
	AGH_updateParticleLifeStormScreen = function () {
		$gameScreen.movePicture(valuePic1, 1, 640, 384, 100, 100, 200, 0, 60);
		var lifeStormScreen = 'lifeStorm_screen';
		$gameScreen._particle.particleUpdate([lifeStormScreen, 'scale', '1', 0.2 + '@0.15', 0.05 + '@0.8', '0']);
	};

	// Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
	AGH_setSelfVariableActorChoiceAwakenB = function (interp) {
		return (function () {
			this.sVal(20, 5);
			var actor = $gameActors.actor($gameVariables.value(20));
			for (var i = 401; i <= 406; i++) {
				actor.forgetSkill(i);
			};
			actor.learnSkill(401);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
	AGH_readVariableDynamicEventId_16 = function (interp) {
		return (function () {
			$gameMap.darknessOpacity = 200;
			var variable292Value = $gameVariables.value(292)[5]; //this._eventId
			if (!!$gameMap.event(variable292Value)) {
				var event = $gameMap.event(variable292Value);
				event.setStepAnime(true); event.setWalkAnime(true);
				event.setAngle(0);
				event._spriteOffsetX = 0; event._spriteOffsetY = 0;
				event._kageM = new Game_KageMaster(event);
				event.removeFace();
				event.setOpacity(0);
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
	AGH_readVariableDynamicEventId_17 = function (interp) {
		return (function () {
			var variable292Value = $gameVariables.value(292)[5]; //this._eventId
			$gameMap.eraseMapLight(variable292Value);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:471|覚醒 ─Awaken 'B'─
	AGH_readVariableDynamicEventId_18 = function (interp) {
		return (function () {
			event_respawnSetN(5, 4, 11, 1, '4Child', 2, 6);
			this._eventId = $gameVariables.value(292)[5];
			original_direct(5, this._eventId, 0, 0, 0, 0);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:472|予期せぬ要請
	AGH_readVariableEventProgressHeroUnexpectedRequest = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, 8, 4, 1, 2);
			this._eventId = $gameVariables.value(292)[variable530Value];
			event_respawnSetA(2, 8, 7, 0, 8);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:473|秩序ＶＳ狂戦士
	AGH_readVariableEventProgressHeroOrderVsBerserker = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4], 1, 8);
			event_respawnSetA(2, variable163Value[3] - 1, variable163Value[4], 1, 8);
			this._eventId = $gameVariables.value(292)[2];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:473|秩序ＶＳ狂戦士
	AGH_readVariableDynamicEventIdOrderVsBerserker = function (interp) {
		return (function () {
			for (var i = 11; i <= 13; i++) {
				var variable292Value = $gameVariables.value(292)[i]; //this._eventId
				if (!!$gameMap.event(variable292Value)) {
					var event = $gameMap.event(variable292Value);
					event.setStepAnime(false); event.setWalkAnime(false);
					event.setDirection(2); event.resetPattern();
					event._originalPattern = 1; event.setAngle(45);
					event._spriteOffsetX = -12; event._spriteOffsetY = -12;
					event._kageM.clear();
					event.setFace(6, true, true);//Child用event.setFace(6,true,true,0,6,0,6);
				}
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:481|決戦！　黒銀の翼！！
	AGH_readVariableEventProgressHeroDecisiveBlackSilverWing = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, variable163Value[3] - 1, variable163Value[4], 1, variable163Value[5]);
			this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:481|決戦！　黒銀の翼！！
	AGH_readVariableEventProgressHero_23 = function (interp) {
		return (function () {
			var value1 = 2;//$gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(value1, variable163Value[3], variable163Value[4] + 1, 0, variable163Value[5]);
			this._eventId = $gameVariables.value(292)[value1];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:496|全滅テンプレ
	AGH_setSelfVariableEventProgressHeroAllOutTemplate = function (interp) {
		return (function () {
			valueScenePic = 'XevS016_';
			//var value2 = valueScenePic+'01';
			this.sVal(530, 1);//主格キャラ
			this.sVal(535, 516);//挿話回想の場合アイテムID。メインは0
			valueWeatherSceneSet = 0;
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:502|悪戯っ子世に憚る
	AGH_readVariableEventProgressHeroMischiefChildPublic = function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4], 1, 4);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.setImage(variable163Value[1], variable163Value[2]);
		event.setDirection(variable163Value[5]);
		var variable530Value = 11;
		event_respawnSetN(variable530Value, 39, 15, 1, '4Child', 3, 4);
	};

	// Replaces (1x): CommonEvents.json:common-event:502|悪戯っ子世に憚る
	AGH_showPictureScreenBlackOutMischiefChildPublic = function () {
		valuePic1 = 55;
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1 - 1, value2, 1, 640, 384, 100, 100, 150, 0);
		picture_fade1(valuePic1 - 1, "fadeIn", valueWipeImg, 60, 5);
		var value2 = valueScenePic + '01';
		pic_1(0, valuePic1 + 1, value2, 0, 100, 255, 60, 1280, 768, -256, 0);
		//tachie_bless(valuePic1+1,1);
	};

	// Replaces (1x): CommonEvents.json:common-event:502|悪戯っ子世に憚る
	AGH_showPictureHpicture2 = function () {
		var value2 = valueScenePic + '02';
		$gameScreen.showPicture(valuePic1, value2, 1, 640 - 128, 384, 100, 100, 255, 0);
		tachie_bless(valuePic1, 1);
		var value3 = 'Hpicture2';
		picture_fade1(valuePic1, "fadeIn", value3, 60, 5);
		var value3 = 'Hpicture3';
		picture_fade1(valuePic1 + 1, "fadeOut", value3, 120, 5);
		var value2 = valueScenePic + '03';
		$gameScreen.showPicture(valuePic1 + 2, value2, 1, 640 - 128, 384 + 500, 100, 100, 255, 0);
		$gameScreen.movePicture(valuePic1 + 2, 1, 640 - 128, 384, 100, 100, 0, 0, 120);
	};

	// Replaces (1x): CommonEvents.json:common-event:502|悪戯っ子世に憚る
	AGH_runScriptMischiefChildPublic = function (interp) {
		return (function () {
			var array = [0];
			var arr2 = [-50];
			var arr3 = [`ハッハ──ッ♪`];
			chara_oneWord(101, this._eventId, 25, 120, array, arr2, arr3);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:503|爺の本懐
	AGH_showPictureScreenBlackOutOldManWish = function () {
		valuePic1 = 51;
		valuePic2 = 71;
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 150, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
		var pictureId = valuePic2 + 1;
		var value2 = valueScenePic + '01';
		$gameScreen.showPicture(pictureId, value2, 1, 640 + 480 + 50, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 + 480, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:503|爺の本懐
	AGH_showPictureScreen1024FrameOldManWish = function () {
		var value2 = 'Screen1024Frame';
		$gameScreen.showPicture(valuePic2, value2, 1, 640 - 78, 384, 100, 100, 255, 0);
		picture_fade1(valuePic2, "fadeIn", valueWipeImg, 60, 5);
		var value2 = valueScenePic + '02';
		$gameScreen.showPicture(valuePic1 + 1, value2, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1 + 1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(valuePic1 + 1, 2);
	};

	// Replaces (4x): CommonEvents.json:common-event:507|情報の代価Ⅰ, CommonEvents.json:common-event:536|メイドウェイトレス, CommonEvents.json:common-event:547|リゾート休暇で限界突破！, CommonEvents.json:common-event:576|娼婦Debut!
	AGH_showPicturePriceOfInformation1 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		var pictureId = valuePic1 + 1;
		var scenePictureName = valueScenePic + '01';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		//tachie_bless(pictureId,2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:507|情報の代価Ⅰ
	AGH_showPicturePriceOfInformation1_2 = function () {
		var value1 = valuePic1 + 2;
		var value2 = valueScenePic + '02';
		$gameScreen.showPicture(value1, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		//pic_move1(value1-1,0,0,100,100,0,90);
		var value1 = valuePic1 + 3;
		var value2 = valueScenePic + '03';
		$gameScreen.showPicture(value1, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(value1, 2);
	};

	// Replaces (2x): CommonEvents.json:common-event:508|情報の代価Ⅱ, CommonEvents.json:common-event:509|情報の代価Ⅲ
	AGH_showPictureXevS00702 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		var value1 = valuePic1 + 1;
		var value2 = 'XevS007_02';
		$gameScreen.showPicture(value1, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		//pic_move1(value1-1,0,0,100,100,0,90);
		var value1 = valuePic1 + 2;
		var value2 = valueScenePic + '02';
		$gameScreen.showPicture(value1, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(value1, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:509|情報の代価Ⅲ
	AGH_showPicturePriceOfInformation3 = function () {
		var pictureId = valuePic1 + 5;
		var scenePictureName = valueScenePic + '05';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		hcg_piston(pictureId, 7, 2, 1);
	};

	// Replaces (1x): CommonEvents.json:common-event:511|ドクター・Ｋによる診察
	AGH_iterateWeaponsProfession1 = function () {
		var weaponId = 317;
		var messageText = `${$dataWeapons[id1].meta['Profession1']}`;
		Profession_CharaChange(1, weaponId, messageText, 1);
	};

	// Replaces (1x): CommonEvents.json:common-event:511|ドクター・Ｋによる診察
	AGH_setSwitchNonHSceneBGVStartDoctorKExamination = function () {
		var array = ['「スーっ…」', '「ン………」', '「ZZZ………」', '「スゥ──」'];//文字BGV
		$gameVariables.setValue(707, array);
		$gameVariables.setValue(706, [640 - 128, 386, 0, 240]);//最後1で横範囲縮小
		$gameSwitches.setValue(125, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:516|ゴブリン姦Ⅰ
	AGH_showPictureGoblinRape1 = function () {
		var pictureId = valuePic1 + 10;//非表示状態
		var scenePictureName = valueScenePic + '21';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 + 50, 384, 100, 100, 0, 0);
		//$gameScreen.movePicture(pictureId,1,640-128,384,100,100,255,0,60);
		tachie_bless(pictureId, 1);
	};

	// Replaces (1x): CommonEvents.json:common-event:516|ゴブリン姦Ⅰ
	AGH_showPictureGoblinRape1_2 = function () {
		var pictureId = valuePic1 + 10;
		var scenePictureName = valueScenePic + '21';
		//$gameScreen.showPicture(pictureId,scenePictureName,1,640-128+50,384,100,100,0,0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:519|ゴブリン姦Ⅳ
	AGH_setSwitchNonHSceneBGVStartGoblinRape4 = function () {
		var array = [];
		htext_word(3);//3高2中1低
		array = array.concat(valueHtextWord);
		$gameVariables.setValue(707, array);
		$gameVariables.setValue(706, [640 - 128, 386, 1, 60, 0, 'eromangasimaji']);
		$gameSwitches.setValue(125, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:526|トロル姦
	AGH_showPictureTrollRape = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		var pictureId = valuePic1 + 1;
		var scenePictureName = valueScenePic + '01';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:526|トロル姦
	AGH_showPictureScreenBlackOutTrollRape = function () {
		var ScreenBlackOut = 'ScreenBlackOut';
		$gameScreen.showPicture(60, ScreenBlackOut, 1, 640, 384, 100, 100, 255, 0);
		picture_fade1(51, "fadeIn", 'Town014', 180, 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:526|トロル姦
	AGH_showPictureTrollRape_2 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		var pictureId = valuePic1 + 1;
		var scenePictureName = valueScenePic + '07';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:526|トロル姦
	AGH_showPictureTrollRape_3 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		var pictureId = valuePic1 + 2;
		var scenePictureName = valueScenePic + '08';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 180);
		tachie_bless(pictureId, 2);
		//pic_move1(pictureId-1,0,0,100,100,0,240);
	};

	// Replaces (1x): CommonEvents.json:common-event:530|試練の裏側
	AGH_readVariableEventProgressHeroBehindTheTrial = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4], 1, variable163Value[5]);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event._spriteOffsetX = -24;
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 11;
			event_respawnSetN(variable530Value, variable163Value[3] + 1, variable163Value[4], 2, '4Child', 1, 8);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event._spriteOffsetX = -24;
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:530|試練の裏側
	AGH_spawnMapEventDynamicEventIdBehindTheTrial = function () {
		var value1 = 12;
		$gameMap.spawnEvent(202, 12, 12, true);
		$gameVariables.value(292)[value1] = $gameMap.getLastSpawnEventId();
	};

	// Replaces (1x): CommonEvents.json:common-event:530|試練の裏側
	AGH_showPicturePictureParallelLoopBehindTheTrial = function () {
		var pictureId = valuePic1 + 6;
		var scenePictureName = valueScenePic + '12';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 255, 0);
		pic_setArray1 = [1, pictureId, 0, -15, 0, 20];
		pic_setArray2 = [1, pictureId, 0, 0, 3, 30]; //pic_setArray2 = [1,0,0,0,0,0];
		valueParallelPicSe1 = ['ZH_sticky4', 20, 60];
		valueParallelPicSe2 = ['ZH_sticky4', 20, 60];
		hcg_piston(pictureId, 7, 2, 1);
		$gameSwitches.setValue(429, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:530|試練の裏側
	AGH_showPictureBehindTheTrial = function () {
		var pictureId = valuePic1 + 7;
		var scenePictureName = valueScenePic + '13';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2);
		pic_move1(pictureId + 4, 0, 0, 100, 100, 0, 90);
		pic_move1(pictureId + 5, 0, 0, 100, 100, 0, 90);
		pic_move1(pictureId + 6, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
	AGH_setVariableChoiceSwitch11Warakaserare = function () {
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		$gameVariables.setValue(171, [40, 17, 8]);
	};

	// Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
	AGH_readVariableEventProgressHeroWarakaserare = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, 17, 8, 1, 8);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);

			var variable530Value = 11;
			event_respawnSetN(variable530Value, 17, 6, 0, '4Child', 1, 2);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
	AGH_showPictureWarakaserare = function () {
		valuePic1 = 51;
		var pictureId = valuePic1 + 11;
		var scenePictureName = valueScenePic + '11';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128 - 100, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 1);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
	AGH_readVariableEventProgressHero_24 = function () {
		var variable530Value = $gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(19, 4);
		event.setDirection(2);
		event._spriteOffsetX = +24;
		event.setFace(11, true, true);
		var variable530Value = 11;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(19, 5);
		event.setDirection(8);
		event._spriteOffsetX = +24;
		event._spriteOffsetY = -24;
	};

	// Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
	AGH_readVariableEventProgressHero_25 = function () {
		var variable530Value = $gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.setImage('1_1', 1);
		var variable530Value = 11;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.setImage('4Child', 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:531|『わからせられ』
	AGH_movePictureWarakaserare = function () {
		valueCharaWaitCount1 = 30;
		valueCharaWaitCount2 = valuePic1 + 12;
		valueCharaWaitCount3 = getRandomIndex(11) + valueCharaWaitCount1
		if (!!$gameMap.event(1)) {
			$gameMap.event(1).forceMoveRoute({
				"list": [
					{ "code": 45, "parameters": ["if($gameScreen.picture(valueCharaWaitCount2)){$gameScreen.movePicture(valueCharaWaitCount2,1,640-128,384-15,100,100,250,0,valueCharaWaitCount3)};"] },
					{ "code": 15, "parameters": [valueCharaWaitCount3] },
					{ "code": 45, "parameters": ["if($gameScreen.picture(valueCharaWaitCount2)){$gameScreen.movePicture(valueCharaWaitCount2,1,640-128,384+5,100,100,0,0,valueCharaWaitCount3)};"] },
					{ "code": 15, "parameters": [valueCharaWaitCount3] },
					{ "code": 0 }], "repeat": true, "skippable": true
			});
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:532|サンプル
	AGH_movePictureSample = function () {
		valueCharaWaitCount1 = 40;
		valueCharaWaitCount2 = valuePic1 + 2;
		if (!!$gameMap.event(1)) {
			$gameMap.event(1).forceMoveRoute({
				"list": [
					{ "code": 45, "parameters": ["valueCharaWaitCount3 = getRandomIndex(11) + valueCharaWaitCount1;"] },
					{ "code": 45, "parameters": ["if($gameScreen.picture(valueCharaWaitCount2)){$gameScreen.movePicture(valueCharaWaitCount2,1,640-128,384,100,100,250,0,valueCharaWaitCount3)};"] },
					{ "code": 15, "parameters": [valueCharaWaitCount3] },
					{ "code": 45, "parameters": ["if($gameScreen.picture(valueCharaWaitCount2)){$gameScreen.movePicture(valueCharaWaitCount2,1,640-128,384,100,100,0,0,valueCharaWaitCount3)};"] },
					{ "code": 15, "parameters": [valueCharaWaitCount3] },
					{ "code": 0 }], "repeat": true, "skippable": true
			});
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:536|メイドウェイトレス
	AGH_playSeZClothesTakeOffMaidWaitress = function () {
		tachie_dousa(2, 1, 0, 14, 1, 255, 1311, 0, 0);
		tachie_dousa(2, 1, 0, 14, 1, 255, 1385, 0, 0);
		tachie_dousa(0, 1, 1, 14, 15, 0, 120, 0, 0);
		var ZClothesTakeOff = 'Z_ClothesTakeOff';//ピッチ50か100。消去ウェイトで変更
		AudioManager.playSe({ "name": ZClothesTakeOff, "volume": 150, "pitch": 100, "pan": 0 });
		//tachie_clothReflect(1);//ｱｸﾀｰid
	};

	// Replaces (1x): CommonEvents.json:common-event:536|メイドウェイトレス
	AGH_showPictureGoodsTea1 = function () {
		valuePic1 = 55;
		var value2 = 'Goods_Tea1_' + '00';
		$gameScreen.setPicturesAnimation(2, 30, "連番", 60);
		$gameScreen.showPicture(valuePic1, value2, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:536|メイドウェイトレス
	AGH_readVariableEventProgressHeroMaidWaitress = function () {
		var value1 = 18;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(19, 4);
	};

	// Replaces (1x): CommonEvents.json:common-event:536|メイドウェイトレス
	AGH_movePicture1MaidWaitress = function () {
		valuePic1 = 51;
		var pictureId = valuePic1 + 1;
		pic_move1(pictureId, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:537|メイドウェイトレスご奉仕
	AGH_showPictureXevS03601 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		var pictureId = valuePic1 + 1;
		var XevS03601 = 'XevS036_01';
		$gameScreen.showPicture(pictureId, XevS03601, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		//tachie_bless(pictureId,2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:537|メイドウェイトレスご奉仕
	AGH_setSelfSwitchEventProgressHero = function () {
		$gameSelfSwitches.setValue([$gameMap.mapId(), 8, 'C'], true);
		var variable530Value = $gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(20, 10);
		event.setDirection(8);
		var variable530Value = 11;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(20, 9);
		event.setDirection(2);
	};

	// Replaces (1x): CommonEvents.json:common-event:537|メイドウェイトレスご奉仕
	AGH_showPictureScreenBlackOutMaidWaitressService = function () {
		var ScreenBlackOut = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, ScreenBlackOut, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
		backGraund_menuMapSelect(2, 0, 0, 0);
		var pictureId = valuePic1 + 1;
		pic_showMove1(pictureId, valueScenePic + '01', 640 - 128, 384, 100, 60, 0, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:537|メイドウェイトレスご奉仕
	AGH_movePicture1MaidWaitressService = function () {
		var pictureId = valuePic1 + 2;
		pic_showMove1(pictureId, valueScenePic + '02', 640 - 128, 384, 100, 60, 2, 200);
		tachie_bless(pictureId, 2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:540|
	AGH_showPictureCommonEvent540 = function () {
		var value1 = valuePic1 + 4;
		var value2 = valueScenePic + '04';
		$gameScreen.showPicture(value1, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		var value1 = valuePic1 + 5;
		var value2 = valueScenePic + '05';
		$gameScreen.showPicture(value1, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:540|
	AGH_setSwitchPictureParallelLoop = function () {
		pic_setArray1 = [1, valuePic1 + 5, 0, -15, 0, 20];
		pic_setArray2 = [1, valuePic1 + 5, 0, 0, 3, 30]; //pic_setArray2 = [1,0,0,0,0,0];
		valueParallelPicSe1 = ['ZH_sticky4', 80, 60];
		valueParallelPicSe2 = ['ZH_sticky4', 80, 60];
		hcg_piston(valuePic1 + 5, 7, 2, 1);
		$gameSwitches.setValue(429, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:541|知らなかった『裏側』
	AGH_showPictureGoodsDVD = function () {
		valuePic1 = 55;
		var GoodsDVD = 'Goods_DVD';
		$gameScreen.showPicture(valuePic1, GoodsDVD, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:541|知らなかった『裏側』
	AGH_showPictureDungeon12UnknownOtherSide = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);//'Dungeon1_2'
		valuePic1 = 51;
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
		var pictureId = valuePic1 + 1;
		var value2 = valueScenePic + '01';
		$gameScreen.showPicture(pictureId, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:541|知らなかった『裏側』
	AGH_setSwitchPictureParallelLoopUnknownOtherSide = function () {
		pic_setArray1 = [1, valuePic1 + 4, 0, -30, 0, 20];
		pic_setArray2 = [1, valuePic1 + 4, 0, 0, 3, 30]; //pic_setArray2 = [1,0,0,0,0,0];
		valueParallelPicSe1 = [0, 0, 0];
		valueParallelPicSe2 = [0, 0, 0];
		hcg_piston(valuePic1 + 4, 7, 2, 1);
		$gameSwitches.setValue(429, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:541|知らなかった『裏側』
	AGH_movePicture1UnknownOtherSide = function () {
		var pictureId = valuePic1 + 1;
		pic_move1(pictureId, 0, 0, 100, 100, 0, 90);
		pic_move1(pictureId + 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
	AGH_setVariableChoiceSwitch11InCityShadows = function () {
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		$gameVariables.setValue(171, [41, variable163Value[3], variable163Value[4]]);
	};

	// Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
	AGH_showPictureScreenBlackOutInCityShadows = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		valuePic2 = 71;
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
		var value2 = valueScenePic + '01';
		$gameScreen.showPicture(valuePic2 + 1, value2, 1, 640 + 480, 384 - 118, 100, 100, 200, 0);
		$gameScreen.movePicture(valuePic2 + 1, 1, 640 + 480, 384 + 50, 100, 100, 255, 0, 240);
		tachie_bless(valuePic2 + 1, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
	AGH_readVariableEventProgressHeroInCityShadows = function (interp) {
		return (function () {
			event_respawnSetN(11, 35, 6, 1, 'BB_akunin1', 7, 6);
			var value1 = 11;//$gameVariables.value(530);
			this._eventId = $gameVariables.value(292)[value1];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
	AGH_showPictureScreen1024FrameInCityShadows = function () {
		var value2 = valueScenePic + '04_00';
		$gameScreen.setPicturesAnimation(2, 10, "連番", 40);
		$gameScreen.showPicture(valuePic1 + 1, value2, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1 + 1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		if ($gameScreen.picture(valuePic1 + 1)) {
			$gameScreen.picture(valuePic1 + 1).startAnimationFrame(3, true, [1, 1, 1, 2]);
		};
		var value2 = 'Screen1024Frame';
		$gameScreen.showPicture(69, value2, 1, 640 - 78, 384, 100, 100, 255, 0);
		picture_fade1(69, "fadeIn", valueWipeImg, 60, 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
	AGH_movePicture1InCityShadows = function () {
		var value1 = valuePic1 + 1;
		pic_move1(value1, 0, 0, 100, 100, 0, 60);
		var value1 = 69;
		pic_move1(value1, 0, 0, 100, 100, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:542|街の物陰で…
	AGH_readVariableEventProgressHero_26 = function (interp) {
		return (function () {
			var variable292Value = $gameVariables.value(530);
			var variable292Value = $gameVariables.value(292)[variable292Value];
			drowsepost.camera.zoom(1, 60, this._eventId);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
	AGH_readVariableEventProgressHeroFoolishReunion = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, variable163Value[3], variable163Value[4], 1, variable163Value[5]);
			var variable530Value = 11;
			event_respawnSetN(variable530Value, variable163Value[8], variable163Value[9], 0, variable163Value[6], variable163Value[7], variable163Value[10]);
			this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
	AGH_showPictureZXMain04006 = function () {
		valuePic1 = 51;
		var ZXMain04006 = 'ZX_Main040_06';
		$gameScreen.showPicture(valuePic1, ZXMain04006, 1, 640, 384, 100, 100, 250, 0);
		picture_fade1(51, "fadeIn", '150', 60, 5);
	};

	// Replaces (2x): CommonEvents.json:common-event:543|愚鈍なる再会, CommonEvents.json:common-event:545|チンピラ団員達と…
	AGH_showPictureDungeon12FoolishReunion = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);//'Dungeon1_2'
		valuePic1 = 51;
		var ScreenBlackOut = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, ScreenBlackOut, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
	AGH_showPictureFoolishReunion = function () {
		$gameScreen.setPicturesAnimation(2, 10, "連番", 20);
		var pictureId = valuePic1 + 1;
		var scenePictureName = valueScenePic + '01_00';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		if ($gameScreen.picture(pictureId)) {
			$gameScreen.picture(pictureId).startAnimationFrame(1, true, [1, 1, 1, 2]);
		};
		tachie_bless(pictureId, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
	AGH_runScriptFoolishReunion = function () {
		var pictureId = valuePic1 + 1;
		picture_fade1(pictureId, "fadeOut", valueWipeImg, 60, 5);
		picture_fade1(51, "fadeOut", valueWipeImg, 60, 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
	AGH_readVariableEventProgressHero_27 = function () {
		var value1 = 1;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(16, 7);
		event.setDirection(8);
		event._spriteOffsetX = +24
		var value1 = 11;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(16, 6);
		event.setDirection(2);
		event._spriteOffsetX = +24
		event._spriteOffsetY = -12
	};

	// Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
	AGH_showPictureDungeon12_2 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);//'Dungeon1_2'
		valuePic1 = 51;
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
		var pictureId = valuePic1 + 2;
		var value2 = valueScenePic + '02';
		$gameScreen.showPicture(pictureId, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
	AGH_showPictureFoolishReunion_2 = function () {
		var value1 = valuePic1 + 3;
		var value2 = valueScenePic + '03';
		$gameScreen.showPicture(value1, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		hcg_piston(valuePic1 + 3, 7, 1, 2);
		var value1 = valuePic1 + 5;
		var value2 = valueScenePic + '04';
		$gameScreen.showPicture(value1, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(value1, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
	AGH_movePicture1FoolishReunion = function () {
		var value1 = valuePic1 + 3;
		pic_move1(value1, 0, 0, 100, 100, 0, 90);
		var value1 = valuePic1 + 4;
		pic_move1(value1, 0, 0, 100, 100, 0, 90);
		var value1 = valuePic1 + 5;
		pic_move1(value1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:543|愚鈍なる再会
	AGH_readVariableEventProgressHero_28 = function () {
		var value1 = 11;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(16, 6);
		event.setDirection(4);
		event._spriteOffsetX = -12;
	};

	// Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
	AGH_readVariableEventProgressHeroWithGangMember = function () {
		var value1 = 1;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(17, 4);
		event.setDirection(8);
		var value1 = 11;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(17, 5);
		event.setDirection(8);
		event._spriteOffsetY = -24
	};

	// Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
	AGH_showPictureXevS044 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		valuePic2 = 71;
		valueScenePic = 'XevS044_';
		var ScreenBlackOut = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, ScreenBlackOut, 1, 640, 384, 100, 100, 150, 0);
		picture_fade1(valuePic1, "fadeIn", valueWipeImg, 60, 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
	AGH_showPictureWithGangMember = function () {
		var pictureId = valuePic2 + 3;
		var scenePictureName = valueScenePic + '03_00';
		$gameScreen.setPicturesAnimation(3, 10, "連番", 20);
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 + 480 + 50, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 + 480, 384, 100, 100, 255, 0, 60);
		if ($gameScreen.picture(pictureId)) {
			$gameScreen.picture(pictureId).startAnimationFrame(1, true, [1, 1, 1, 2]);
		};
	};

	// Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
	AGH_showPictureWithGangMember_2 = function () {
		var pictureId = valuePic2 + 2;
		var scenePictureName = valueScenePic + '02';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 + 480 + 50, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 + 480, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2);
		pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
	AGH_movePicture1WithGangMember = function () {
		var value1 = valuePic2 + 3;
		pic_move1(value1 - 1, 0, 0, 100, 100, 0, 90);
		var value1 = valuePic2 + 2;
		pic_move1(value1 - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:544|チャラ団員と…
	AGH_showPictureScreen1024FrameWithGangMember = function () {
		var value2 = 'Screen1024Frame';
		$gameScreen.showPicture(valuePic2, value2, 1, 640 - 78, 384, 100, 100, 255, 0);
		picture_fade1(valuePic2, "fadeIn", valueWipeImg, 60, 5);
		var value2 = valueScenePic + '05';
		$gameScreen.showPicture(valuePic1 + 1, value2, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1 + 1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
	AGH_readVariableEventProgressHeroWithPunks = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
			event_respawnSetA(variable530Value, 9, 12, 1, 8);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var variable530Value = 11;
			event_respawnSetN(variable530Value, 9, 11, 0, variable163Value[6], variable163Value[7], 2);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
	AGH_readVariableEventProgressHero_29 = function () {
		var variable530Value = $gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event._priorityType = 0; event._spriteOffsetY = +12;
		event.locate(19, 5); event.setDirection(2);
		var variable530Value = 11;
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event._priorityType = 2; event._spriteOffsetY = -12;
		event.locate(19, 6); event.setDirection(8);
	};

	// Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
	AGH_readVariableDynamicEventIdWithPunks = function () {
		var value1 = 12;
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(20, 5); event.setDirection(4);
		var value1 = 13;
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(18, 5); event.setDirection(6);
	};

	// Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
	AGH_showPictureWithPunks = function () {
		var value1 = valuePic1 + 1;
		var value2 = valueScenePic + '01';
		$gameScreen.showPicture(value1, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		var value1 = valuePic1 + 2;
		var value2 = valueScenePic + '02';
		$gameScreen.showPicture(value1, value2, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(value1, 2);
	};

	// Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
	AGH_showPicturePictureParallelLoopWithPunks = function () {
		var pictureId = valuePic1 + 4;
		var scenePictureName = valueScenePic + '03';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 255, 0);
		pic_setArray1 = [1, pictureId, 15, -15, 0, 20];
		pic_setArray2 = [1, pictureId, 0, 0, 3, 30]; //pic_setArray2 = [1,0,0,0,0,0];
		valueParallelPicSe1 = ['ZH_sticky4', 10, 10];
		valueParallelPicSe2 = [0, 0, 0];
		hcg_piston(pictureId, 4, 1, 1);
		$gameSwitches.setValue(429, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:545|チンピラ団員達と…
	AGH_movePicture1WithPunks = function () {
		var value1 = valuePic1 + 2;
		pic_move1(value1 - 1, 0, 0, 100, 100, 0, 90);
		var value1 = valuePic1 + 3;
		pic_move1(value1 - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:546|獣欲の暴走、一生の懊悩と後悔
	AGH_movePicture1BeastDesireRampage = function () {
		var pictureId = valuePic1;
		pic_move1(pictureId, 0, 0, 100, 100, 0, 90);
		pic_move1(pictureId + 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:546|獣欲の暴走、一生の懊悩と後悔
	AGH_setSelfSwitchDynamicEventIdBeastDesireRampage = function () {
		var variable530Value = $gameVariables.value(530);
		event_respawnSetA(variable530Value, 19, 5, 0, 2);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event._priorityType = 0;
		event._spriteOffsetY = +12
		var variable530Value = 11;
		event_respawnSetN(variable530Value, 19, 6, 0, 'npcOrder2', 4, 8);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event._priorityType = 2;
		event._spriteOffsetY = -12;
		$gameSelfSwitches.setValue([$gameMap.mapId(), 2, 'C'], true);
	};

	// Replaces (1x): CommonEvents.json:common-event:546|獣欲の暴走、一生の懊悩と後悔
	AGH_spawnMapEventNpcOrder2 = function () {
		event_respawnSetN(12, 17, 6, 0, 'npcOrder2', 5, 6);
		event_respawnSetN(13, 20, 7, 0, 'npcOrder2', 6, 8);
		event_respawnSetN(14, 18, 8, 0, 'npcOrder2', 7, 2);
		$gameMap.spawnEvent(244, 17, 18, true);
		$gameMap.darknessOpacity = 150;
	};

	// Replaces (1x): CommonEvents.json:common-event:546|獣欲の暴走、一生の懊悩と後悔
	AGH_readVariableEventProgressHeroBeastDesireRampage = function () {
		var array = [0];
		var arr2 = [-50];
		var arr3 = [`アンっ\\I[12]`];
		var variable292Value = 1;//$gameVariables.value(530);
		var variable292Value = $gameVariables.value(292)[variable292Value];
		chara_oneWord(100, variable292Value, 25, 180, array, arr2, arr3, 0);
	};

	// Replaces (1x): CommonEvents.json:common-event:546|獣欲の暴走、一生の懊悩と後悔
	AGH_readVariableDynamicEventIdBeastDesireRampage = function (interp) {
		return (function () {
			for (var i = 11; i <= 14; i++) {
				var variable292Value = $gameVariables.value(292)[i]; //this._eventId
				if (!!$gameMap.event(variable292Value)) {
					var event = $gameMap.event(variable292Value);
					event.setOpacity(0);
				}
			};
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:547|リゾート休暇で限界突破！
	AGH_erasePicturesResortBreakthrough = function () {
		var pictureId = valuePic1;
		pic_eraseP(0, [pictureId + 1, pictureId + 2, pictureId + 3]);
	};

	// Replaces (1x): CommonEvents.json:common-event:547|リゾート休暇で限界突破！
	AGH_showPictureResortBreakthrough = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		var pictureId = valuePic1 + 4;
		var scenePictureName = valueScenePic + '04';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		//tachie_bless(pictureId,2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:547|リゾート休暇で限界突破！
	AGH_readVariableEventProgressHeroResortBreakthrough = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 34, 6, 1, 2);
			this._eventId = $gameVariables.value(292)[variable530Value];
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			this._spriteOffsetY = +12;
			var variable530Value = 11;
			event_respawnSetN(variable530Value, 34, 7, 0, 'npcUnique2', 0, 8);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			this._spriteOffsetY = -12;
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
	AGH_readVariableEventProgressHeroMonicaProstituteDebut = function (interp) {
		return (function () {
			var variable530Value = $gameVariables.value(530);
			event_respawnSetA(variable530Value, 7, 9, 1);
			var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
			event.setDirection(6);
			this._eventId = $gameVariables.value(292)[variable530Value];
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
	AGH_readVariableEventProgressHero_30 = function (interp) {
		return (function () {
			var value1 = 1;//$gameVariables.value(530);
			event_respawnSetA(value1, 35, 9, 1);
			var event = $gameMap.event($gameVariables.value(292)[value1]);
			event.setDirection(4);
			this._eventId = $gameVariables.value(292)[value1];
			drowsepost.camera.zoom(1, 60, this._eventId);
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
	AGH_setSelfSwitchMonicaProstituteDebut = function () {
		$gameSelfSwitches.setValue([$gameMap.mapId(), 20, 'C'], true);
		$gameSelfSwitches.setValue([$gameMap.mapId(), 21, 'C'], true);
		var event = $gameMap.event(20);
		event.locate(22, 11);
		var event = $gameMap.event(21);
		event.locate(22, 12);
	};

	// Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
	AGH_readVariableEventProgressHero_31 = function () {
		var variable530Value = $gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(3, 7); event.setDirection(6);
		var variable530Value = 11;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(4, 7); event.setDirection(4);
	};

	// Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
	AGH_showPictureScreenBlackOutMonicaProstituteDebut = function () {
		valuePic1 = 55;
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1 - 1, value2, 1, 640, 384, 100, 100, 200, 0);
		picture_fade1(valuePic1 - 1, "fadeIn", valueWipeImg, 60, 5);
		$gameScreen.setPicturesAnimation(2, 10, "連番", 20);
		valueScenePic = 'XevS011_';
		var value2 = valueScenePic + '01';
		$gameScreen.showPicture(valuePic1, value2, 1, 640 - 128, 384 + 50, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		hcg_piston(valuePic1, 5, 3, 2);
		$gameScreen.picture(valuePic1).startAnimationFrame(1, false, [1, 1, 1, 2]);
	};

	// Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
	AGH_readVariableDynamicEventIdMonicaProstituteDebut = function () {
		var value1 = 11;
		event_respawnSetN(value1, 3, 11, 1, '2_1', 2);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.setDirection(2);
		event_doorOpenClose(1, 3);
	};

	// Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
	AGH_readVariableDynamicEventId_19 = function () {
		var value1 = 12;
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.setImage(event.characterName(), 4);
	};

	// Replaces (1x): CommonEvents.json:common-event:552|モニカ娼婦デビュー
	AGH_readVariableEventProgressHero_32 = function () {
		var variable530Value = $gameVariables.value(530);
		var variable163Value = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(variable530Value, 15, 4, 0);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.setImage(variable163Value[1], variable163Value[2]);
		event.setDirection(2);
	};

	// Replaces (1x): CommonEvents.json:common-event:571|マッサージⅠ
	AGH_showPictureMassage1 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		var pictureId = valuePic1 + 1;
		var scenePictureName = valueScenePic + '01';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 1);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:571|マッサージⅠ
	AGH_setSwitchPictureParallelLoopMassage1 = function () {
		var pictureId = valuePic1 + 4;
		pic_setArray1 = [1, pictureId, 0, -30, 5, 60];
		pic_setArray2 = [1, pictureId, 0, 30, 3, 40]; //pic_setArray2 = [1,0,0,0,0,0];
		valueParallelPicSe1 = [0, 0, 0];
		valueParallelPicSe2 = [0, 0, 0];
		hcg_piston(pictureId, 7, 2, 1);
		$gameSwitches.setValue(429, true);
	};

	// Replaces (2x): CommonEvents.json:common-event:572|マッサージⅡ, CommonEvents.json:common-event:573|マッサージⅢ
	AGH_showPictureMassage2 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 51;
		var pictureId = valuePic1 + 1;
		var scenePictureName = valueScenePic + '01';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		//tachie_bless(pictureId,1);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
	AGH_showPictureMassage2_2 = function () {
		var pictureId = valuePic1 + 2;
		var scenePictureName = valueScenePic + '02';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 + 50, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 1);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
	AGH_showPictureMassage2_3 = function () {
		var pictureId = valuePic1 + 4;
		var scenePictureName = valueScenePic + '04';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 + 50, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 1);
		pic_move1(pictureId - 2, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
	AGH_showPictureMassage2_4 = function () {
		var pictureId = valuePic1 + 5;
		var scenePictureName = valueScenePic + '05';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 - 100, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		hcg_piston(pictureId, 7, 1, 2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
	AGH_showPictureMassage2_5 = function () {
		var pictureId = valuePic1 + 7;
		var scenePictureName = valueScenePic + '06';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 - 100, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		hcg_piston(pictureId, 7, 1, 2);
		pic_move1(pictureId - 2, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
	AGH_movePicture1Massage2 = function () {
		var value1 = valuePic1 + 7;
		pic_move1(value1, 0, 0, 100, 100, 0, 90);
		var value1 = valuePic1 + 6;
		pic_move1(value1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
	AGH_showPictureMassage2_6 = function () {
		var pictureId = valuePic1 + 2;
		var scenePictureName = valueScenePic + '07';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 1);
		pic_move1(pictureId + 2, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
	AGH_showPictureMassage2_7 = function () {
		$gameScreen.setPicturesAnimation(2, 10, "連番", 30);
		var pictureId = valuePic1 + 8;
		var scenePictureName = valueScenePic + '08_00';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): CommonEvents.json:common-event:572|マッサージⅡ
	AGH_showPictureMassage2_8 = function () {
		var pictureId = valuePic1 + 1;
		var scenePictureName = valueScenePic + '01';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		//tachie_bless(pictureId,1);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
	AGH_showPictureMassage3 = function () {
		var pictureId = valuePic1 + 4;
		var scenePictureName = valueScenePic + '04_00';
		$gameScreen.setPicturesAnimation(2, 10, "連番", 20);
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		tachie_bless(pictureId, 2);
		pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
	AGH_erasePicturesMassage3 = function () {
		sex_direction(99, 0, 0);
		var pictureId = valuePic1 + 4;
		pic_eraseP(0, [pictureId, pictureId - 1]);
	};

	// Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
	AGH_showPictureScreenBlackOutMassage3 = function () {
		backGraund_menuMapSelect(2, 0, 0, 0);
		valuePic1 = 55;
		valuePic2 = 71;
		var ScreenBlackOut = 'ScreenBlackOut';
		$gameScreen.showPicture(51, ScreenBlackOut, 1, 640, 384, 100, 100, 150, 0);
		picture_fade1(51, "fadeIn", valueWipeImg, 60, 5);
	};

	// Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
	AGH_showPictureMassage3_2 = function () {
		var pictureId = valuePic1 + 1;
		var scenePictureName = valueScenePic + '91';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384 - 20, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		//hcg_piston(pictureId,5,1,2);
	};

	// Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
	AGH_setSwitchNonHSceneBGVStartMassage3 = function () {
		var array = ['（グルルゥ──）', '（ググゥ…）', '（グゥ～～）'];//文字BGV
		$gameVariables.setValue(707, array);
		$gameVariables.setValue(706, [640 - 128, 386, 0, 180, 0, 0]);
		$gameSwitches.setValue(125, true);
	};

	// Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
	AGH_showPictureMassage3_3 = function () {
		var pictureId = valuePic1 + 2;
		var scenePictureName = valueScenePic + '92';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
		//hcg_piston(pictureId,5,1,2);
		pic_move1(pictureId - 1, 0, 0, 100, 100, 0, 90);
	};

	// Replaces (1x): CommonEvents.json:common-event:573|マッサージⅢ
	AGH_showPictureMassage3_4 = function () {
		var pictureId = valuePic1 + 3;
		var scenePictureName = valueScenePic + '93';
		$gameScreen.showPicture(pictureId, scenePictureName, 1, 640 - 128, 384, 100, 100, 250, 0);
		//hcg_piston(pictureId,5,1,2);
		//pic_move1(pictureId-1,0,0,100,100,0,90);
	};

	// Replaces (1x): CommonEvents.json:common-event:576|娼婦Debut!
	AGH_readVariableEventProgressHeroProstituteDebut = function () {
		var variable530Value = $gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[variable530Value]);
		event.locate(20, 6);
		event.setDirection(2);
		event._spriteOffsetY = -24;
		event._spriteOffsetX = -48;
	};

	// Replaces (1x): CommonEvents.json:common-event:576|娼婦Debut!
	AGH_readVariableEventProgressHero_33 = function () {
		var value1 = 11;//$gameVariables.value(530);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(20, 7);
		event.setDirection(8);
		event._spriteOffsetY = -24;
		event._spriteOffsetX = -48;
	};

	// Replaces (1x): CommonEvents.json:common-event:576|娼婦Debut!
	AGH_readVariableDynamicEventIdProstituteDebut = function (interp) {
		return (function () {
			var array = [];
			array.push($gameVariables.value(292)[11]);
			event_NpcCharaMoveId(39, 0, array);
			//1下移動16下向く39透明化
			//event_partyCharaMove(45,"this.turnTowardCharacter($gameMap.event("+value1+"));");
			//event_partyCharaMove(45,"UP: 10;"); //"UP: 10;"
			//event_partyCharaMove(45,"this.requestBalloon(1);");
			//event_partyCharaMove(45,"this.requestAnimation(617);");
		}).call(interp);
	};

	// Replaces (1x): CommonEvents.json:common-event:576|娼婦Debut!
	AGH_computeFloorProstituteDebut = function () {
		i1 = getRandomIndex(10) + 11;//人数
		i2 = getRandomIndex(10) + 11;//膣回数
		i3 = Math.floor(Math.random() * -5) + i1;//中だし回数
		i4 = getRandomIndex(5) + 1;//アナル回数
		i5 = getRandomIndex(1) + i4;//中だし回数
		i6 = getRandomIndex(5) + 6;//フェラ回数
		i7 = Math.floor(Math.random() * -2) + i4;//口腔回数
		i8 = getRandomIndex(3) + 0;//失禁回数
		return { i1: i1, i2: i2, i3: i3, i4: i4, i5: i5, i6: i6, i7: i7, i8: i8 };
	};

	// Replaces (1x): Map003.json:event:4|ドロップ宝箱|page:3
	AGH_gainItemDropChest = function () {
		var array = [6, 7, 6, 6, 6, 7, 6, 7, 6, 6, 8, 6, 6];
		var value2 = array[getRandomIndex(array.length)];
		gacha_naiyou(3, value2);
		$gameParty.gainItem(valueItems[valueGachaId], 1);
		var value2 = `\\C[24]\x1bI[${valueItems[valueGachaId].iconIndex}]${valueItems[valueGachaId].name}\\C[0]を入手した！`
		$gameScreen.setDTextPicture(value2, 28);
	};

	// Replaces (1x): Map003.json:event:4|ドロップ宝箱|page:4
	AGH_gainItemDropChest_2 = function () {
		var array = [8, 9, 8, 9, 8, 8, 10, 9, 8, 8];
		var value2 = array[getRandomIndex(array.length)];
		gacha_naiyou(3, value2);
		$gameParty.gainItem(valueItems[valueGachaId], 1);
		var value2 = `\\C[24]\x1bI[${valueItems[valueGachaId].iconIndex}]${valueItems[valueGachaId].name}\\C[0]を入手した！`
		$gameScreen.setDTextPicture(value2, 28);
	};

	// Replaces (1x): Map003.json:event:19|小銭|page:1
	AGH_setVariableRandomWork2SmallChange = function () {
		$gameVariables.setValue(22, 3);
		var randomIndex = getRandomIndex(91) + 10;
		$gameVariables.setValue(23, randomIndex);
	};

	// Replaces (1x): Map003.json:event:20|罠コモン|page:1
	AGH_setVariableDynamicEventIdTrapCommon = function () {
		$gameVariables.setValue(292, Array(21).fill(0));
		var playerRealX = $gamePlayer._realX;
		var playerRealY = $gamePlayer._realY;
		//if($gamePlayer.direction() == 2){playerRealY += 1};
		//if($gamePlayer.direction() == 4){playerRealX -= 1};
		//if($gamePlayer.direction() == 6){playerRealX += 1};
		//if($gamePlayer.direction() == 8){playerRealY -= 1};
		goodsEvent_respawn(0, 'Goods8', 6, 8, 2, playerRealX, playerRealY);
	};

	// Replaces (1x): Map003.json:event:20|罠コモン|page:1
	AGH_particleSetOrbC = function (interp) {
		return (function () {
			var value1 = 'orb_c';
			$gameScreen._particle.particleSet(this._eventId, value1 + '-' + this._eventId, 'this', value1, 'above');
			var value1 = 'orb_c' + '-' + this._eventId;
			$gameScreen._particle.particleUpdate([value1, 'color', '#ff00f7', '#ffffff']);
			//$gameScreen._particle.particleUpdate([value1,'pos',0,-35]);
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:42|固有素材2|page:1
	AGH_stopMapPlayerMovementUniqueMaterial2 = function () {
		if (!$gameParty.inBattle()) { $gameTemp.stopMapPlayerMovement() };
		if (!$gameParty.inBattle()) { $gameTemp.stopMapEventMovement() };
	};

	// Replaces (1x): Map003.json:event:42|固有素材2|page:1
	AGH_setSelfSwitchTrueHeroId = function (interp) {
		return (function () {
			var id = 794;//匠掘りスキル
			if ($gameActors.actor($gameVariables.value(2)).isLearnedSkill(id)) {
				var array = [1, 2];
				var randomIndex = array[getRandomIndex(array.length)];
				if (randomIndex == 2) {
					$gameSelfSwitches.setValue([$gameMap.mapId(), this._eventId, 'B'], true);
				};
			} else {
				$gameSelfSwitches.setValue([$gameMap.mapId(), this._eventId, 'B'], true);
			};
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:42|固有素材2|page:1
	AGH_clearParticleGoodsShine2 = function (interp) {
		return (function () {
			if ($gameSelfSwitches.value([$gameMap.mapId(), this._eventId, 'B'])) {
				var value1 = 'goods_shine2' + '-' + this._eventId;
				$gameScreen._particle.particleClear(value1);
			};
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:42|固有素材2|page:1
	AGH_pluginCommandShowInfo = function (interp) {
		return (function () {
			var messageText = `採掘が出来そうな岩石だった…。`;
			var args = new Array(String(messageText));
			this.pluginCommand("ShowInfo", args);
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:47|魚|page:1
	AGH_setupChild = function (interp) {
		return (function () {
			var randomIndex = getRandomIndex(11) + 5;
			var value2 = getRandomIndex(11) + 5;
			var value3 = getRandomIndex(11) + 10;
			var value4 = getRandomIndex(5) + 1;
			var value5 = getRandomIndex(5) + 6;
			common_script1(26, this._eventId, value5, 5, 0, randomIndex, value2, value3, value4, 255);
			this.setupChild($dataCommonEvents[64].list, 0);
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:47|魚|page:1
	AGH_initValueRandomSetFish = function () {
		valueRandomSet = getRandomIndex(1);
	};

	// Replaces (1x): Map003.json:event:69|EV069|page:1
	AGH_readMapEventMetaNpcSpawnEventId = function (interp) {
		return (function () {
			var value1 = 77;
			var args = new Array(String(value1), "1", "0", "3", "1", "1");
			this.pluginCommand("ERS_MAKE_TEMPLATE_RANDOM", args);
			var args = new Array("286");
			this.pluginCommand("ERS_GET_LAST_SPAWN_EVENT_ID", args);
			var variable286Value = $gameVariables.value(286);
			if ($gameMap.event(variable286Value).event().meta['座標']) {
				this.character(variable286Value).locate(Number($gameMap.event(variable286Value).event().meta['座標'].split(',')[0]), Number($gameMap.event(variable286Value).event().meta['座標'].split(',')[1])); this.character(variable286Value).setDirection(0);
			};
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:69|EV069|page:1
	AGH_readMapEventMetaNpcSpawnEventIdEv069 = function (interp) {
		return (function () {
			var list = [81, 82, 83];
			list.forEach(function (id) {
				var value1 = id;
				var args = new Array(String(value1), "1", "0", "3", "1", "1");
				this.pluginCommand("ERS_MAKE_TEMPLATE_RANDOM", args);
				var args = new Array("286");
				this.pluginCommand("ERS_GET_LAST_SPAWN_EVENT_ID", args);
				var variable286Value = $gameVariables.value(286);
				if ($gameMap.event(variable286Value).event().meta['座標']) {
					this.character(variable286Value).locate(Number($gameMap.event(variable286Value).event().meta['座標'].split(',')[0]), Number($gameMap.event(variable286Value).event().meta['座標'].split(',')[1])); this.character(variable286Value).setDirection(0);
				}
			}, this);
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:69|EV069|page:1
	AGH_readMapEventMetaNpcSpawnEventIdERSMAKETEMPLATERANDOM = function (interp) {
		return (function () {
			var list = [73, 74, 75, 78];
			list.forEach(function (id) {
				var value1 = id;
				var args = new Array(String(value1), "1", "0", "3", "1", "1");
				this.pluginCommand("ERS_MAKE_TEMPLATE_RANDOM", args);
				var args = new Array("286");
				this.pluginCommand("ERS_GET_LAST_SPAWN_EVENT_ID", args);
				var variable286Value = $gameVariables.value(286);
				if ($gameMap.event(variable286Value).event().meta['座標']) {
					this.character(variable286Value).locate(Number($gameMap.event(variable286Value).event().meta['座標'].split(',')[0]), Number($gameMap.event(variable286Value).event().meta['座標'].split(',')[1])); this.character(variable286Value).setDirection(0);
				}
			}, this);
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:82|EV082|page:1
	AGH_setSelfVariableRandomWork1Ev082 = function (interp) {
		return (function () {
			$gameVariables.setValue(22, `＜獲得アイテム一覧＞\n`);
			$gameVariables.setValue(23, 0);
			$gameSwitches.setValue(380, true);
			this.sVal(21, 0);
			for (var i = 1; i <= 10; i++) {
				item_gacha();
			};
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:84|EV084|page:1
	AGH_reservePlayerTransfer = function () {
		var variableId = $gameVariables.variableId(204);
		var array = $gameVariables.variableId(variableId)[0];
		var value2 = $gameVariables.variableId(variableId)[1];
		var value3 = $gameVariables.variableId(variableId)[2];
		$gamePlayer.reserveTransfer(array, value2, value3, 2, 2);
	};

	// Replaces (1x): Map003.json:event:113|EV113|page:1
	AGH_gainItemChestRareSlotEv113 = function () {
		var value1 = 2;//種別
		var value2 = 21;//ID全体攻撃の腕輪
		var array = [0, 0, 0, value1, value2];

		if (Number(array[3]) == 0) { var valueItems = $dataItems };
		if (Number(array[3]) == 1) { var valueItems = $dataWeapons };
		if (Number(array[3]) == 2) { var valueItems = $dataArmors };
		$gameParty.gainItem(valueItems[Number(array[4])], 1);
		var value1 = `\\C[24]\x1bI[${valueItems[Number(arr1[4])].iconIndex}]${valueItems[Number(arr1[4])].name}\\C[0]を入手した！`;
		var value2 = 28;
		$gameScreen.setDTextPicture(value1, value2);
		$gameSwitches.setValue(439, true);
	};

	// Replaces (1x): Map003.json:event:113|EV113|page:1
	AGH_gainItemChestRareSlotTchestOnly = function () {
		var variable240Value = $dataItems[$gameVariables.value(240)].meta['TchestOnly'].split(',');
		var valueItems = getIWA(Number(variable240Value[3]));
		$gameParty.gainItem(valueItems[Number(variable240Value[4])], 1);
		const itemName = colorTaggedText(24, `\x1bI[${valueItems[Number(variable240Value[4])].iconIndex}]${valueItems[Number(variable240Value[4])].name}`);
		var messageText = `${itemName}を入手した！`;
		var value2 = 28;
		$gameScreen.setDTextPicture(messageText, value2);
		$gameSwitches.setValue(439, true);
	};

	// Replaces (1x): Map003.json:event:131|ワープスポット|page:1
	AGH_setSelfSwitchWarpPoint = function (interp) {
		return (function () {
			var arr3 = [$gameMap.mapId(), $gameMap.event(this._eventId).x, $gameMap.event(this._eventId).y];
			for (var i = 1; i <= 9; i++) {
				if ($dataItems[$gameVariables.value(240)].meta['warpPoint' + i]) {
					var itemMeta = $dataItems[$gameVariables.value(240)].meta['warpPoint' + i].split(',');
					var array = [Number(itemMeta[0]), Number(itemMeta[1]), Number(itemMeta[2])];
					if (array[0] == arr3[0] && array[1] == arr3[1] && array[2] == arr3[2]) {
						$gameVariables.value(211)[$gameVariables.value(240)][i] = 1;
						$gameSelfSwitches.setValue([$gameMap.mapId(), this._eventId, 'A'], true);
						//var value4 = `ワープポイント[${i}]がアクティベートされました。`;
						$gameScreen.setDTextPicture(messageText, 28); $gameSwitches.setValue(380, true);
						break;
					}
				}
			};
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:133|EV133|page:1
	AGH_setDTextPictureTemporarySwitch = function (interp) {
		return (function () {
			for (var i = 1; i <= 100; i++) {
				if ($gameVariables.value(327)[i] >= 2) {
					$gameVariables.value(327)[i] = 1;
				}
			};
			var weaponName = $dataWeapons[$gameVariables.value(230)].name;
			$gameVariables.value(327)[$gameVariables.value(230)] = 2;
			$gameSelfSwitches.setValue([$gameMap.mapId(), this._eventId, 'A'], true);
			var messageText = `<${weaponName}>拠点がアクティベートされました。`;
			$gameScreen.setDTextPicture(messageText, 28);
			$gameSwitches.setValue(380, true);
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:133|EV133|page:1
	AGH_readVariableBaseActivation = function () {
		var value2 = 0;
		for (var i = 1; i <= 100; i++) {
			if ($gameVariables.value(327)[i] == 2) {
				var value2 = 1;
			}
		};
		if (value2 == 0) {
			$gameVariables.value(327)[$gameVariables.value(319)] = 2;
		};
	};

	// Replaces (1x): Map003.json:event:133|EV133|page:2
	AGH_setVariableTextWorkEv133 = function () {
		for (var i = 1; i <= 100; i++) {
			if ($gameVariables.value(327)[i] >= 2) {
				$gameVariables.setValue(801, `帰還先:${$dataWeapons[i].name}`);
				break;
			}
		};
	};

	// Replaces (1x): Map003.json:event:133|EV133|page:2
	AGH_setSwitchMainQuestProgress = function () {
		if ($gameVariables.value(135) >= 1) {
			$gameSwitches.setValue(162, true);//時間経過可能
		};
		if ($gameSwitches.value(34)) {
			$gameSwitches.setValue(163, true);//周回可能
		};
	};

	// Replaces (1x): Map003.json:event:133|EV133|page:2
	AGH_setSwitchEv133 = function () {
		for (var i = 501; i <= 600; i++) {
			if ($gameParty.hasItem($dataItems[i])) {
				$gameSwitches.setValue(164, true);//シーン回想
			}
		};
		for (var i = 401; i <= 500; i++) {
			if ($gameParty.hasItem($dataItems[i])) {
				$gameSwitches.setValue(165, true);//挿話回想
			}
		};
	};

	// Replaces (1x): Map003.json:event:133|EV133|page:2
	AGH_setSwitchTrueHeroIdEv133 = function () {
		var actor = $gameActors.actor($gameVariables.value(2));
		if (actor.isLearnedSkill(791)) {
			$gameSwitches.setValue(167, true);//錬金実行
		};
	};

	// Replaces (1x): Map003.json:event:133|EV133|page:2
	AGH_readVariableBaseActivationEv133 = function () {
		for (var i = 1; i <= 100; i++) {
			if ($gameVariables.value(327)[i] >= 2) {
				var value1 = i;
				break;
			}
		};
		valueCountSet1 = value1;
	};

	// Replaces (1x): Map003.json:event:133|EV133|page:2
	AGH_readVariableTownInfoItem = function () {
		$gameVariables.value(327)[$gameVariables.value(230)] = 2;
		const weaponName = colorTaggedText(2, `<${$dataWeapons[$gameVariables.value(230)].name}>`);
		var messageText = `帰還先拠点を${weaponName}に設定しました。`;
		TickerManager.show(messageText);
	};

	// Replaces (1x): Map003.json:event:133|EV133|page:2
	AGH_setVariableDynamicEventIdEv133 = function () {
		$gameVariables.setValue(292, Array(21).fill(0));
		var playerRealX = $gamePlayer._realX;
		var playerRealY = $gamePlayer._realY;
		if ($gamePlayer.direction() == 2) { playerRealY += 1 };
		if ($gamePlayer.direction() == 4) { playerRealX -= 1 };
		if ($gamePlayer.direction() == 6) { playerRealX += 1 };
		if ($gamePlayer.direction() == 8) { playerRealY -= 1 };
		goodsEvent_respawn(0, 'Goods4', 6, 6, 2, playerRealX, playerRealY);
	};

	// Replaces (1x): Map003.json:event:145|EV145教会処理|page:1
	AGH_configureMapEventEv145ChurchProcessing = function (interp) {
		return (function () {
			var event = $gameMap.event(this._eventId).x;
			var value2 = $gameMap.event(this._eventId).y;
			var event = this.character(-1);
			event.locate(event, value2 + 2);
			event.setDirection(8);
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:161|EV161|page:1
	AGH_showWindowTextEv161 = function () {
		WindowManager.show(0, 0, 0, 1024, 68);
	};

	// Replaces (1x): Map003.json:event:161|EV161|page:1
	AGH_setSwitchTemporarySwitchEv161 = function () {
		$gameSwitches.setValue(380, false);
		for (var i = 1; i <= $dataItems.length - 1; i++) {
			if (!$dataItems[i].name == '') {
				if ($dataItems[i].meta['EICSwitch']) {
					if (Number($dataItems[i].meta['EICSwitch']) == 108) {
						if ($gameParty.hasItem($dataItems[i]) && !$dataItems[i].meta['singleQuestIncidence']) {
							$gameSwitches.setValue(380, true);
							break;
						}
					}
				}
			}
		};
	};

	// Replaces (1x): Map003.json:event:161|EV161|page:1
	AGH_erasePictureEv161 = function () {
		for (var i = 101; i <= 250; i++) { $gameScreen.erasePicture(i) }
	};

	// Replaces (1x): Map003.json:event:166|EV166シングルクエスト受注|page:2
	AGH_eventQuestSet = function (interp) {
		return (function () {
			valueCountSet1 = Number($gameMap.event(this._eventId).event().meta['QuestSet']);
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:172|EV172召喚石戦闘|page:1
	AGH_setSwitchTemporarySwitchEv172SummonStoneBattle = function (interp) {
		return (function () {
			$gameSwitches.setValue(380, false);
			if (!$gameSelfSwitches.value([$gameMap.mapId(), this._eventId, 'A'])) {
				$gameSwitches.setValue(380, true);
			};
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:185|EV185|page:1
	AGH_gainItemChestRareSlotEv185 = function () {
		var threshold = 2;//種別
		var id = 21;//ID
		if (threshold == 0) { var valueItems = $dataItems };
		if (threshold == 1) { var valueItems = $dataWeapons };
		if (threshold == 2) { var valueItems = $dataArmors };
		$gameParty.gainItem(valueItems[id], 1);
		const itemName = colorTaggedText(29, `\x1bI[${valueItems[id].iconIndex}]${valueItems[id].name}`);
		var messageText = `${itemName}を入手した！`;
		$gameScreen.setDTextPicture(messageText, 28);
		$gameSwitches.setValue(439, true);
	};

	// Replaces (1x): Map003.json:event:207|EV207宿屋処理|page:1
	AGH_showPictureEv207InnProcessing = function () {
		var pictureId = 51;
		var value2 = '';
		$gameScreen.showPicture(pictureId + 1, value2, 0, 1072, 612, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId + 1, 0, 1072, 612, 100, 100, 255, 0, 60);
		var value3 = `　　　　　\n　　　　　\n　　　　　\n　　　　　`;
		$gameScreen.setDTextPicture(messageText, 28);
		$gameScreen.dWindowFrame = 'ON';
		$gameScreen.showPicture(pictureId, value2, 0, 1072, 612, 100, 100, 0, 0);
		$gameScreen.movePicture(pictureId, 0, 1072, 612, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): Map003.json:event:207|EV207宿屋処理|page:1
	AGH_setSwitchRandomWork1Ev207InnProcessing = function () {
		var item = $dataItems[valueCountSet1].price;
		$gameVariables.setValue(21, item.toLocaleString());
		if ($gameParty.gold() >= item) {
			$gameSwitches.setValue(161, true);
		} else {
			$gameSwitches.setValue(161, false);
		};
	};

	// Replaces (1x): Map003.json:event:207|EV207宿屋処理|page:1
	AGH_setSwitchRandomWork2 = function () {
		var item = $dataItems[valueCountSet2].price;
		$gameVariables.setValue(22, item.toLocaleString());
		if ($gameParty.gold() >= item) {
			$gameSwitches.setValue(162, true);
		} else {
			$gameSwitches.setValue(162, false);
		};
	};

	// Replaces (1x): Map003.json:event:207|EV207宿屋処理|page:1
	AGH_iterateItemsEv207InnProcessing = function () {
		var item = $dataItems[valueCountSet1].price;
		get_infoDirect(0, valueCountSet1, 0, 1);
		get_infoDirect(4, -item, 0, 1);
	};

	// Replaces (1x): Map003.json:event:207|EV207宿屋処理|page:1
	AGH_iterateItemsEv207InnProcessing_2 = function () {
		var item = $dataItems[valueCountSet2].price;
		get_infoDirect(0, valueCountSet2, 0, 1);
		get_infoDirect(4, -item, 0, 1);
	};

	// Replaces (1x): Map003.json:event:217|EV217回想全開放|page:1
	AGH_iterateItemsEICSwitch = function () {
		for (var i = 1; i < $dataItems.length; i++) {
			if ($dataItems[i].meta['EICSwitch']) {
				if (Number($dataItems[i].meta['EICSwitch']) == 102) {
					$gameParty.gainItem($dataItems[i], 1);
				}
			}
		};
		var messageText = `挿話が全開放されました。`;
		gab_wordParticle(messageText);
	};

	// Replaces (1x): Map003.json:event:217|EV217回想全開放|page:1
	AGH_gainItemEICSwitch = function () {
		for (var i = 1; i < $dataItems.length; i++) {
			if ($dataItems[i].meta['EICSwitch']) {
				if (Number($dataItems[i].meta['EICSwitch']) == 103) {
					$gameParty.gainItem($dataItems[i], 1);
				}
			}
		};
		var messageText = `Hシーンが全開放されました。`;
		gab_wordParticle(messageText);
	};

	// Replaces (1x): Map003.json:event:218|EV218|page:2
	AGH_readVariableActorChoiceEv218 = function (interp) {
		return (function () {
			//その場に作成
			var value1 = 1;//$gameVariables.value(20);
			var arr1 = valueNpcGuraTemporarilySave;
			event_respawnSetA(value1, arr1[3], arr1[4], 1, arr1[5]);
			this._eventId = $gameVariables.value(292)[value1];
			event_respawnSetN(11, arr1[8], arr1[9], 0, arr1[6], arr1[7], arr1[10]);
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:218|EV218|page:2
	AGH_readVariableActorChoice_5 = function (interp) {
		return (function () {
			//移動マップに作成。x,y入力
			var value1 = 1;//$gameVariables.value(20);
			var array = [x, y, d];//ｱｸﾀｰ座標
			var arr3 = [x, y, d];//NPC座標
			var arr1 = valueNpcGuraTemporarilySave;
			event_respawnSetA(value1, array[0], array[1], 1, array[2]);
			this._eventId = $gameVariables.value(292)[value1];
			var value1 = 11;
			event_respawnSetN(value1, arr3[0], arr3[1], 0, arr1[6], arr1[7], arr3[2]);
		}).call(interp);
	};

	// Replaces (1x): Map003.json:event:219|EV219|page:1
	AGH_setVariableDynamicEventIdEv219 = function () {
		$gameVariables.setValue(292, Array(21).fill(0));
		event_respawnSetN(11, 24, 16, 0, '$airship02', 0, 2);
		event_respawnSetN(12, 21, 16, 0, '!$VehicleHorse', 0, 2);
		event_respawnSetA(7, 22, 16, 1, 6);
	};

	// Replaces (1x): Map007.json:event:2|EV002|page:1
	AGH_setSelfVariableLibidoEv002 = function (interp) {
		return (function () {
			h_exp($gameVariables.value(20), 'Xev001_99', 101, false, false, false);
			//ｱｸﾀｰID,ﾋﾟｸﾁｬ,H相手(301ﾓﾌﾞ305対象なし306アイテム),非表示,簡易,過去シーンか否か
			this.sVal(401, getRandomIndex(3) + 3);
			//var arr = [1,2,3,4,5];$gameVariables.setValue(401,arr[getRandomIndex(arr.length)]);
			//this.sVal(506,`\\V[94]は\\V[22]に情報の対価としてセクハラされた…。\n`);
			//this.sVal(506,`\\V[94]はモブにセクハラされた…。\n`);
			this.sVal(506, `\\V[94]は魔物達に凌辱された…。\n`);
			if ($gameSwitches.value(122)) { this.setupChild($dataCommonEvents[85].list, 0) };
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:2|EV002|page:1
	AGH_callHExp3Ev002 = function (interp) {
		return (function () {
			//var randomIndex = getRandomIndex(3) + 3;
			//var array = [1, 2, 3, 4, 5]; var value2 = array[getRandomIndex(array.length)];
			//var value3 = $gameTroop.aliveMembers().length;
			h_exp1(0, 0, 0, 0, 0, 0);//h_exp1ex(value3*2);//6
			//0膣1経験2フェラ3アナル4自慰5絶頂
			h_exp2(0, 0, 0, 0, 0);//5//0和姦1強姦2異種姦3輪姦4露出
			h_exp3(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);//10
			//0セク1乳2尻揉3失禁4潮吹5売春6妊7子8中だ9ｱﾅﾙ出し10口飲
			h_exp4(0, 0, 0, 0, 0, 0, 0, 0);//9
			//0膣1尻2口3感4露5精6性戯7奉仕8売春
			this.setupChild($dataCommonEvents[85].list, 0);
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_readVariableActorChoiceEv003 = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		actor.setCanChangeClass(true);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_showPictureScreenBlackOutEv003 = function () {
		valuePic1 = 51;
		var ScreenBlackOut = 'ScreenBlackOut';
		$gameScreen.showPicture(valuePic1, ScreenBlackOut, 1, 640, 384, 100, 100, 0, 0);
		$gameScreen.movePicture(valuePic1, 1, 640, 384, 100, 100, 200, 0, 10);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_showPicturePictureParallelLoopEv003 = function () {
		valuePic1 = 60;
		var value2 = 'test2';
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 255, 0);
		pic_setArray(1, valuePic1, 0, 50, 60);
		var value2 = 'test2a_0';
		picture_anime1(valuePic1 + 1, value2, 3, 10, "連番", 10, 1, true, [1, 2, 1, 1]);
		pic_set(valuePic1 + 1, 1, 255, 20);
		hcg_piston(valuePic1, 8, 1, 1);
		hcg_piston(valuePic1 + 1, 8, 1, 1);
		$gameSwitches.setValue(429, true);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_readVariableRaceDefeatCountEv003 = function () {
		$gameVariables.value(52)[421] += 50;
		$gameVariables.value(52)[423] += 30;
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_showPicturePictureParallelLoop_2 = function () {
		var pictureId = 60;
		var value2 = 'test2';
		$gameScreen.showPicture(pictureId, value2, 1, 640, 384, 100, 100, 255, 0);
		pic_setArray(pictureId, 0, 20, 20);
		var value2 = 'test2a_0';
		picture_anime1(pictureId + 1, value2, 3, 10, "連番", 20, 1, true, [1, 2, 1, 1]);
		pic_set(pictureId + 1, 1, 255, 20);
		hcg_piston(pictureId, 8, 1, 1);
		hcg_piston(pictureId - 1, 8, 1, 1);
		$gameSwitches.setValue(429, true);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_configureMapEventEv003 = function () {
		var event = $gameMap.event(3);
		event.setDirectionFix(true);
		event.setStepAnime(false);
		event.setWalkAnime(false);
		event.resetPattern();
		event._originalPattern = 1;
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_initValueWordSet0Ev003 = function () {
		valueWordSet0 = `あああああ`;
		adv_partDirectPlay(18);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_runScriptEv003 = function () {
		curveFunctions.initialize();
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_setSelfVariableActorChoiceEv003 = function (interp) {
		return (function () {
			valueFaceSelect = 4;
			this.sVal(20, 1);
			this.sVal(276, 1);
			battle_bustUp(51, 500, 10, 40);
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_runScriptJump = function () {
		curveFunctions.patternY = curveFunctions.getPattern('jump', [-100]);
		curveFunctions.patternOpacity = curveFunctions.getPattern('jump', [400]);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_getPatternSmooth = function () {
		curveFunctions.patternX = curveFunctions.getPattern("smooth", [10]);
		curveFunctions.patternY = curveFunctions.getPattern("smooth", [10]);
		curveFunctions.patternScaleX = curveFunctions.getPattern("smooth", [10]);
		curveFunctions.patternScaleY = curveFunctions.getPattern("smooth", [10]);
		curveFunctions.patternOpacity = curveFunctions.getPattern("smooth", [10]);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_iterateArmorsPassiveState = function () {
		var armor = Number($dataArmors[219].meta['Passive State'])
		var messageText = `${value2 + 1}`;
		CommonPopupManager.showInfo({}, messageText, null);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_createFilterZettyou = function () {
		var zettyou = 'zettyou';
		$gameMap.createFilter(zettyou, 'blur', 0, 'screen');
		$gameMap.setFilter(zettyou, [5]);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_setSwitchBossBattleImminent = function (interp) {
		return (function () {
			boss_setup1(2, 56);
			$gameSwitches.setValue(211, true);
			valueVictoryResult1 = this._eventId;
			this.setupChild($dataCommonEvents[121].list, 0);
			//this.setupChild($dataCommonEvents[122].list, 0);
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_particleEditItemGain = function (interp) {
		return (function () {
			var itemGain = 'item_gain';
			$gameScreen._particle.particleEdit(this._eventId, itemGain, 'this');
			//$gameScreen._particle.particleEdit(0,itemGain,'screen','def','above');
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_particleUpdateActorParticleLight = function () {
		var actorParticleLight = 'actor_particleLight';
		$gameScreen._particle.particleUpdate([actorParticleLight, 'rect', -700, 400, 1300, 768]);
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_showPictureScreenBlackOut_2 = function () {
		var pictureId = 51;
		var ScreenBlackOut = 'ScreenBlackOut';
		$gameScreen.showPicture(pictureId, ScreenBlackOut, 1, 640, 384, 100, 100, 150, 0);
		var value1 = 'lines_width1';
		$gameScreen._particle.particleSet(0, value1, 'screen', 'def', 'above');
		var value1 = 'lines_width2';
		$gameScreen._particle.particleSet(0, value1, 'screen', 'def', 'screen');
		var value1 = 'lines_width3';
		$gameScreen._particle.particleSet(0, value1, 'screen', 'def', 'spriteset');
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_pushToArrayEv003 = function () {
		$gameActors.actor(1).actor().traits.push({ code: 11, dataId: 11, value: 1.5 });
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_iterateEnemiesEv003 = function () {
		var value1 = 10000;
		$dataEnemies[11].exp = value1;
		$dataEnemies[12].exp = value1;
		$dataEnemies[13].exp = value1;
		$dataEnemies[42].exp = value1;
		$dataEnemies[61].exp = value1;
		$dataEnemies[62].exp = value1;
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_iterateTroopsEv003 = function () {
		var troopsId = 10; //グループIDを指定
		$dataTroops[troopsId].name = "アレク"; //グループのメンバーを空に
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_push = function () {
		var troopsId = 10; //グループIDを指定
		$dataTroops[troopsId].members = []; //グループのメンバーを空に
		var enemy = { enemyId: 11, x: 450, y: 420, hidden: false }; //追加するエネミーの設定(ID1、座標(100,100)、表示有)
		$dataTroops[troopsId].members.push(enemy); //設定したエネミーをグループに追加
	};

	// Replaces (1x): Map007.json:event:3|EV003|page:1
	AGH_readVariableDungeonInfoItemEv003 = function () {
		var start = 1; var end = 6; for (var i = start; i <= end; i++) {
			var itemMeta = $dataItems[$gameVariables.value(240)].meta['出現エネミー' + i];
			if (Number(itemMeta.split(',')[0]) >= 21) {
				$dataEnemies[i + 10].exp = $dataEnemies[itemMeta.split(',')[0]].exp;
			}
		};
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_particleEditLightLeakS = function (interp) {
		return (function () {
			var lightLeakS = 'light_leak_s'
			$gameScreen._particle.particleEdit(this._eventId, lightLeakS, 'this', 'def', 'spriteset');
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_runScriptGoodsShine2 = function () {
		var goodsShine2 = 'goods_shine2';
		$gameScreen._particle.particleEdit(0, goodsShine2, 'screen', 'def', 'spriteset');
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_concatArrayEv004000 = function () {
		$gameScreen._tone_temp = $gameScreen.tone().concat();
		$gameScreen.startTint([-150, -150, -150, 150], 10);
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_setDTextPictureEv004000 = function () {
		var messageText = `パーティに加わった！`;
		$gameScreen.setDTextPicture(messageText, 28);
		adv_partDirectPlay(8);
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_setVariableNpcSpawnRandom1 = function () {
		for (var i = 1; i <= 5; i++) {
			$gameVariables.setValue(33, 'BB_akunin');//グラ名前
			$gameVariables.setValue(35, 3);//グラ番号
			$gameVariables.setValue(37, getRandomIndex(3) + 2);//速度
			$gameVariables.setValue(34, getRandomIndex(2) + 4);//頻度
			map_npcRespawn(1, 124);//1で任意,次にイベID
		};
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_spawnEventRandom = function () {
		var conditionMap = {};
		conditionMap.passable = 1;
		conditionMap.screen = 0;
		conditionMap.collided = 3;
		conditionMap.terrainTags = [0];
		conditionMap.regionIds = [1];
		$gameMap.spawnEventRandom(78, conditionMap, true);
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_particleEditDappledR = function () {
		var dappledR = 'dappled_r';//木漏れ日[リージョン]
		$gameScreen._particle.particleEdit(0, dappledR, 'weather', 'def', 'screen');
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_particleEditRippleWalk = function (interp) {
		return (function () {
			var rippleWalk = 'ripple_walk';//集中線
			$gameScreen._particle.particleEdit(0, rippleWalk, 'this._eventId', 'def');
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_showPictureHStatusLibidoChange = function () {
		var pictureId = 51;
		$gameVariables.setValue(192, 1);
		$gameScreen.showPicture(pictureId + 6, "HstatesActorBody" + $gameVariables.value(20) + "_" + $gameVariables.value(192), 1, 624, 400, 100, 100, 255, 0);
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_showPictureMovie2 = function () {
		$gameScreen.setVideoPictureName('Movie2', 'on', false);
		var pictureId = 53 + 2;
		$gameScreen.showPicture(pictureId, '', 1, 640 - 128, 384, 100, 100, 255, 0);
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_runScriptEv004000 = function () {
		var pictureId = 53 + 2;
		var picture = $gameScreen.picture(pictureId);
		if (picture) { picture.setVideoLoop(pictureId) };
		if (picture) { picture.setVideoSpeed(50) };
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_movePictureXev10001 = function () {
		var pictureId = 53;
		var value2 = 'Xev100_01';
		pic_1(0, pictureId + 1, value2, 0, 100, 255, 60, 1280, 768, -256, 0);
		var value2 = 'Xev100_01_100';
		picture_anime1(pictureId + 3, value2, 5, 1, "連番", 300, 3, true, [2, 4]);
		$gameScreen.movePicture(pictureId + 3, 1, 640 - 128, 384, 100, 100, 200, 0, 60);
		picture_anime1(pictureId + 4, value2, 5, 1, "連番", 200, 3, true, [3, 1, 5, 1]);
		$gameScreen.movePicture(pictureId + 4, 1, 640 - 128, 384, 100, 100, 100, 0, 60);
		for (var i = pictureId + 1; i <= pictureId + 4; i++) { hcg_piston(i, 8, 1) };
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_movePictureXev10001Ev004000 = function () {
		var pictureId = 53;
		var value2 = 'Xev100_01';
		pic_1(0, pictureId + 1, value2, 0, 100, 255, 60, 1280, 768, -256, 0);
		var value2 = 'Xev100_01hip2_100';
		pic_1(2, pictureId + 2, value2, 0, 100, 200, 1, 1280, 768, -256, 0);
		var value2 = 'Xev100_01_100';
		picture_anime1(pictureId + 3, value2, 5, 1, "連番", 180, 3, true, [2, 4]);
		$gameScreen.movePicture(pictureId + 3, 1, 640 - 128, 384, 100, 100, 200, 0, 60);
		picture_anime1(pictureId + 4, value2, 5, 1, "連番", 100, 3, true, [3, 1, 5, 1]);
		$gameScreen.movePicture(pictureId + 4, 1, 640 - 128, 384, 100, 100, 100, 0, 60);
		for (var i = pictureId + 1; i <= pictureId + 4; i++) { hcg_piston(i, 8, 1) };
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_movePictureXev10001hip2100 = function () {
		var pictureId = 53;
		var Xev10001hip2100 = 'Xev100_01hip2_100';
		//picture_anime1(pictureId+2,Xev10001hip2100,3,1,"連番",50,3,true,[1,1,2,3,2,1]);
		picture_anime1(pictureId + 2, Xev10001hip2100, 3, 1, "連番", 50, 3, true, [1, 1, 2, 1, 2, 1, 1]);
		$gameScreen.movePicture(pictureId + 3, 1, 640 - 128, 384, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_readVariableActorChoiceEv004000 = function () {
		$gameVariables.value(360 + $gameVariables.value(20))[11] = 3;
		$gameVariables.value(360 + $gameVariables.value(20))[12] = 3;
		$gameVariables.value(360 + $gameVariables.value(20))[211] = 1;
		$gameVariables.value(360 + $gameVariables.value(20))[212] = 2;
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_iterateMapEventsIconDisplay = function () {
		for (var id = $gameMap.events().length; id > 0; id--) {
			if (!!$gameMap.event(id)) {
				if ($gameMap.event(id).event().meta['IconDisplay']) {
					var value1 = Number($gameMap.event(id).event().meta['IconDisplay']);
					/*if (value1 == 17) {
						if ($gameMap.event(id).characterName() == 0) {
							console.log(`${1}`);
						}
					}*/
				}
			}
		};
	};

	// Replaces (1x): Map007.json:event:4|EV004000|page:1
	AGH_setSelfVariableRandomWork1Ev004000 = function (interp) {
		return (function () {
			var variable174Value = $gameVariables.value(174)[$gameVariables.value(20)].split(',');
			this.sVal(21, variable174Value);
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:5|EV005|page:1
	AGH_particleUpdateMonsterC = function (interp) {
		return (function () {
			var value1 = 'monster_c';
			var value3 = '#ffffff';
			var value4 = '#460000';
			$gameScreen._particle.particleUpdate([value1 + '-' + this._eventId, 'color', String(value3), String(value4)]);
			var value1 = 'mysterious_torch_c';
			$gameScreen._particle.particleUpdate([value1, 'alpha', '0', '0.7@0.5', '0']);
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:5|EV005|page:1
	AGH_erasePictureEasing = function (interp) {
		return (function () {
			var args = new Array("easeOutQuad");
			this.pluginCommand("easing", args);
			pic_1(0, 5, '/img/parallaxes/ScreenBlackOut', 0, 100, 200, 30, 1280, 768, 0, 0);
			pic_1(0, 55, 'test2', 0, 100, 255, 30, 1024, 768, 100, 0);
			//0-0がH1が普通,1ﾋﾟｸID,2ﾌｧｲﾙ名,3表示演出0か1,4拡大率,
			//5透明率,6ｳｪｲﾄ,7と8横縦サイズ(基本は解像度か1024)
			//$gameScreen.erasePicture(70);
			//'/img/parallaxes/画面暗転'
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:7|EV007|page:1
	AGH_setSelfVariableActorChoiceEv007 = function (interp) {
		return (function () {
			this.sVal(20, 1);
			var actor = $gameActors.actor($gameVariables.value(20));
			actor.gainExpSubclass(1000);
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:7|EV007|page:1
	AGH_iteratePartyMembersEv007 = function () {
		for (var i = 0; i < $gameParty.battleMembers().length; i++) {
			var battleMember = $gameParty.battleMembers()[i];
			if ($gameParty.members().contains(battleMember)) {
				battleMember.learnSkill(297); battleMember.gainSkillMasteryUses(297, 100);
				battleMember.learnSkill(300); battleMember.gainSkillMasteryUses(300, 100);
				battleMember.learnSkill(308); battleMember.gainSkillMasteryUses(308, 100);
				battleMember.learnSkill(340); battleMember.gainSkillMasteryUses(340, 100);
			}
		};
	};

	// Replaces (1x): Map007.json:event:7|EV007|page:1
	AGH_iterateSkillsEv007 = function () {
		var actorId = 1;
		var start = 61;
		var end = 64;
		for (var i = start; i <= end; i++) {
			if (!$dataSkills[i].name == '') {
				$gameActors.actor(actorId).learnSkill(i)
			}
		};
	};

	// Replaces (1x): Map007.json:event:7|EV007|page:1
	AGH_iterateStatesEv007 = function () {
		$dataStates[600].traits.push({ code: 43, dataId: 682, value: 0 });
	};

	// Replaces (1x): Map007.json:event:7|EV007|page:1
	AGH_readVariableActorChoiceEv007 = function (interp) {
		return (function () {
			var actor = $gameActors.actor($gameVariables.value(20));
			var list = valueHstateDisplay;
			list.forEach(function (id) {
				actor.addState(id);
			}, this);
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:10|EV010|page:1
	AGH_configureMapEventEv010 = function () {
		var eventId = 6;
		var character = $gameMap.event(eventId);
		var valid = false;

		character.residual().setValid(valid);
	};

	// Replaces (1x): Map007.json:event:10|EV010|page:1
	AGH_configureMapEventEv010_2 = function () {
		var eventId = 11;
		var character = $gameMap.event(eventId);
		var r = 0;
		var g = 255;
		var b = 0;
		var gray = 255;
		var color = [r, g, b, gray];
		var valid = true;

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
		return (function () {
			var value1 = 71;
			var picture = "picture"
			var value3 = "153";
			//一刀両断102横から崩壊161縦から崩壊162
			//横両断008封印054内側から153
			var args = new Array(String(picture), String(value1), "fadeOut",
				String(value3), "60", "5");
			this.pluginCommand("GWFade", args);
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:22|EV022|page:2
	AGH_iterateMapEvents = function (interp) {
		return (function () {
			var value1 = 0;
			for (var id = $gameMap.events().length - 1; id > 0; id--) {
				if (!!$gameMap.event(id)) {
					if ($gameMap.event(id).event().meta['ベッド']) {
						var value1 = id;
						break;
					}
				}
			};
			if (value1 >= 1) {
				var value2 = this.character(value1).x; var value3 = this.character(value1).y;
				$gamePlayer.reserveTransfer($gameMap.mapId($gameVariables.value(52)), value2, value3, 2);
				$gamePlayer.performTransfer();
			};
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:22|EV022|page:2
	AGH_readMapEventMetaRaceDefeatCount = function (interp) {
		return (function () {
			var value1 = 0;
			for (var id = $gameMap.events().length - 1; id > 0; id--) {
				if (!!$gameMap.event(id)) {
					if ($gameMap.event(id).event().meta['着替え']) {
						var value1 = id;
						break;
					}
				}
			};
			if (value1 >= 1) {
				var value2 = this.character(value1).x; var value3 = this.character(value1).y;
				$gamePlayer.reserveTransfer($gameMap.mapId($gameVariables.value(52)), value2, value3 + 1, 8);
				$gamePlayer.performTransfer();
			};
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:23|EV023|page:1
	AGH_readVariableActorChoiceEv023 = function () {
		var actor = $gameActors.actor($gameVariables.value(20));
		actor.addState(693);
		tachie_dousa(2, 1, 2, 12, 1, 255, 1323, 0, 0);
		tachie_dousa(2, 1, 2, 12, 1, 255, 1325, 0, 0);
		tachie_dousa(0, 1, 1, 12, 13, 0, 60, 0, 0);
		//tachie_clothReflect(1);
	};

	// Replaces (1x): Map007.json:event:23|EV023|page:1
	AGH_initValuePic1Ev023 = function () {
		valuePic1 = 19;
		curveFunctions.patternX = curveFunctions.getPattern('jump', [-30]);
		picTachie_move1(valuePic1, 0, 0, 0, 0, 255, 30);
		//0id,1x,2y,3拡x,4拡y,5opa,6wait//こちらの代入は透明度とwaitのみ
		picture_animation1(valuePic1, 0, -300, 200);
		//0id,1x,2y,3animeId
		picture_motion1("smooth", [0]);
	};

	// Replaces (1x): Map007.json:event:23|EV023|page:1
	AGH_waitEv023 = function (interp) {
		return (function () {
			valueWordSet0 = 12;
			tachie_clothesHason(1, 25, valueWordSet0, 1, 1);
			this.wait(Math.randomInt(10));
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:23|EV023|page:1
	AGH_setVariableActorChoiceEv023 = function (interp) {
		return (function () {
			var actor = $gameActors.actor($gameVariables.value(20));
			actor.addState(23);
			tachie_syoukyo1(getPreviousTachiePicId());
			$gameVariables.setValue(20, 1);
			kisekae_tyokusetusitei(1324, 23);
			//tachie_hyouji1($gameVariables.value(20));
			tachie_syoukyo1(getPreviousTachiePicId());
			this.wait(60);
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:32|EV032|page:1
	AGH_spawnMapEventEv032 = function () {
		var playerRealX = $gamePlayer._realX;
		var playerRealY = $gamePlayer._realY + 1;
		$gameMap.spawnEvent(122, playerRealX, playerRealY, true);
		valueCountSet1 = $gameMap.getLastSpawnEventId();
	};

	// Replaces (1x): Map007.json:event:32|EV032|page:1
	AGH_eventStatueOrbC = function () {
		var value1 = 'statue_orb_c' + '-' + valueCountSet1;
		$gameScreen._particle.particleClear(value1);
		if (!!$gameMap.event(valueCountSet1)) {
			$gameMap.eraseEvent(valueCountSet1);
		};
	};

	// Replaces (1x): Map007.json:event:34|EV034|page:1
	AGH_waitEv034 = function (interp) {
		return (function () {
			valueSerialPictureId = 76;
			valueSerialPictureId += 1;
			var array = [-50, 0, 50, -100, 100];
			var arr2 = [-50, 0, 50, -100, 100];
			var arr3 = [`「オラッ！」`, `「オラァッ！」`];
			chara_oneWord(valueSerialPictureId, this._eventId, 25, 60, array, arr2, arr3);
			this.wait(20);
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:54|EV054|page:1
	AGH_setWaitModeRoute = function (interp) {
		return (function () {
			this._character = $gamePlayer;
			this.setWaitMode('route');
		}).call(interp);
	};

	// Replaces (1x): Map007.json:event:58|EV058|page:1
	AGH_eventDomeBed = function () {
		for (var id1 = 1; id1 <= 200; id1++) {
			if (!!$gameMap.event(id1)) {
				if ($gameMap.event(id1).event().meta['DomeBed']) {
					var event = $gameMap.event(id1);
					event.setDirectionFix(false);
					event.setDirection(2);
					event.setDirectionFix(true);
				}
			}
		};
	};

	// Replaces (1x): Map018.json:event:21|EV021|page:1
	AGH_setSelfVariableRandomWork1Ev021 = function (interp) {
		return (function () {
			if ($dataWeapons[315].meta['FamilyName']) {
				this.sVal(21, $dataWeapons[315].meta['FamilyName']);
			} else {
				this.sVal(21, `　`);
			};
		}).call(interp);
	};

	// Replaces (1x): Map018.json:event:25|EV025|page:1
	AGH_runPluginCommandCutInNoWaitEv025 = function (interp) {
		return (function () {
			$gameSwitches.setValue(428, true);
			valueScenePic = 'XevS002_';
			var XevO00202 = 'XevO002_02';
			valueCutInSet1 = ['Ｈシーン演出', XevO00202, 270, 2, 1, 25, 60];
			var args = new Array(String(valueCutInSet1[0]));
			this.pluginCommand("味方カットイン", args);
		}).call(interp);
	};

	// Replaces (1x): Map018.json:event:32|EV032|page:1
	AGH_setSelfVariableChoiceSwitch12Ev032 = function (interp) {
		return (function () {
			this.sVal(172, 8);
			valueTalkSet = [101, 'Goods_Letter1', 60];
			this.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp);
	};

	// Replaces (1x): Map018.json:event:39|EV039|page:1
	AGH_readVariableActor19HStatus = function () {
		$gameActors.actor(19).setName(`青年Ａ`);
		$gameVariables.value(399)[59] = `ネルガド住民`;
		$gameActors.actor(20).setName(`青年Ｂ`);
		$gameVariables.value(400)[59] = `ネルガド住民`;
	};

	// Replaces (1x): Map035.json:event:20|EV020|page:1
	AGH_changeBattlebackDungeon141 = function () {
		var Dungeon141 = 'Dungeon14_1';
		$gameMap.changeBattleback(Dungeon141, Dungeon141);
	};

	// Replaces (1x): Map041.json:event:7|EV007|page:1
	AGH_setSelfSwitchSceneTrigger1 = function (interp) {
		return (function () {
			if ($gameSwitches.value(1071) && !$gameSwitches.value(1171)) {
				$gameSelfSwitches.setValue([$gameMap.mapId(), this._eventId, 'B'], false);
			};
			if ($gameSwitches.value(1072) && !$gameSwitches.value(1172)) {
				$gameSelfSwitches.setValue([$gameMap.mapId(), this._eventId, 'B'], false);
			};
			if ($gameSwitches.value(1073) && !$gameSwitches.value(1173)) {
				$gameSelfSwitches.setValue([$gameMap.mapId(), this._eventId, 'B'], false);
			};
			if ($gameSwitches.value(1074) && !$gameSwitches.value(1174)) {
				$gameSelfSwitches.setValue([$gameMap.mapId(), this._eventId, 'B'], false);
			};
		}).call(interp);
	};

	// Replaces (1x): Map041.json:event:7|EV007|page:1
	AGH_checkSwitchSceneComplete1 = function () {
		var value1 = 571;
		if ($gameSwitches.value(1171)) { var value1 = 572 };
		if ($gameSwitches.value(1172)) { var value1 = 573 };
		if ($gameSwitches.value(1173)) { var value1 = 574 };
		if ($gameSwitches.value(1174)) { var value1 = 1000 };
		valueCountSet1 = value1;
	};

	// Replaces (1x): Map068.json:event:3|EV003|page:1
	AGH_showPictureEv003 = function () {
		var value1 = `\\V[801]\n\\V[802]\n\\V[803]\n\\V[804]\n\\V[805]`;
		$gameScreen.setDTextPicture(value1, 28);
		$gameScreen.dWindowFrame = 'ON';
		$gameScreen.dTextAlign = 1;
		var value1 = 100;
		var value2 = '';
		$gameScreen.showPicture(value1, value2, 0, 100 + 50, 100, 100, 100, 0, 0);
		$gameScreen.movePicture(value1, 0, 100, 100, 100, 100, 255, 0, 60);
	};

	// Replaces (1x): Map068.json:event:3|EV003|page:1
	AGH_readVariableAppearanceCharacterStartEv003 = function () {
		var start = $gameVariables.value(75);
		var end = $gameVariables.value(76);
		for (var j = start; j <= end; j++) {
			var actor = $gameActors.actor(j);
			var equips = actor.equips();
			for (var i = 0; i < equips.length; i++) {
				if (equips[i]) {
					actor.changeEquipById(i + 1, 0);
				};
			};
		};
	};

	// Replaces (1x): Map081.json:event:4|EV004|page:1
	AGH_setVariableRandomWork1Ev004 = function () {
		var defeatedCnt = $gameVariables.value(52)[478];
		const targetDefeated = `\\sim[478]`;
		$gameVariables.setValue(21,
			`${targetDefeated}を10体討伐せよ
		現在討伐数：${defeatedCnt}体`
		);
	};

	// Replaces (1x): Map100.json:event:11|EV011|page:1
	AGH_readVariableRandomWork1Ev011 = function () {
		var variable21Value = $gameVariables.value(21);
		for (var i = 1; i <= 10; i++) {
			$dataMap.events[i].name = `${$dataClasses[i + variable21Value - 10].name}→${$dataClasses[i + variable21Value].name}`;
		};
	};

	// Replaces (1x): Map100.json:event:11|EV011|page:1
	AGH_setSelfSwitchEv011 = function () {
		for (var i = 1; i <= 10; i++) {
			$gameSelfSwitches.setValue([$gameMap.mapId(), i, "B"], true);
		};
	};

	// Replaces (1x): Map100.json:event:11|EV011|page:1
	AGH_showWindowTextEv011 = function () {
		for (var i = 1; i <= $dataItems.length - 1; i++) {
			if ($dataItems[i].meta['クラス3ジョブ解放素材']) {
				var itemId = i;
				break;
			}
		};
		var messageText = `ジョブ解放条件
		100000\\G消費（${$gameParty.gold()}\\G所持）
		\\iin[${value5}] 1個消費（${$gameParty.numItems($dataItems[value5])}個所持）
		パーティメンバーの誰か一人が、そのジョブの下位クラスLv30以上。`;
		WindowManager.show(0, 250, 568, 1030, 200);
		WindowManager.drawText(0, messageText);
	};

	// Replaces (1x): Map100.json:event:11|EV011|page:1
	AGH_showWindowTextEv011_2 = function () {
		for (var i = 1; i <= $dataItems.length - 1; i++) {
			if ($dataItems[i].meta['クラス2ジョブ解放素材']) {
				var itemId = i;
				break;
			}
		};
		var messageText = `ジョブ解放条件
		10000\\G消費（${$gameParty.gold()}\\G所持）
		\\iin[${value5}] 1個消費（${$gameParty.numItems($dataItems[value5])}個所持）
		パーティメンバーの誰か一人が、そのジョブの下位クラスLv20以上。`;
		WindowManager.show(0, 250, 568, 1030, 200);
		WindowManager.drawText(0, messageText);
	};

	// Replaces (1x): Map100.json:event:11|EV011|page:1
	AGH_forceMoveRouteCharactersEv011 = function (interp) {
		return (function () {
			for (var i = 1; i <= 10; i++) {
				this.character(i).forceMoveRoute({
					"list": [
						{ "code": 45, "parameters": ["this.setTone(-150, -150, -150);"] },
						{ "code": 0 }], "repeat": false, "skippable": true
				});
			};
		}).call(interp);
	};

	// Replaces (1x): Map100.json:event:11|EV011|page:1
	AGH_readVariableItemProcessWorkEv011 = function (interp) {
		return (function () {
			var variable19Value = this.character($gameVariables.value(19)).x;
			var value2 = this.character($gameVariables.value(19)).y - 1;
			$gamePlayer.reserveTransfer($gameMap.mapId(), variable19Value, value2, 0);
			$gamePlayer.performTransfer();
		}).call(interp);
	};

	// Replaces (1x): Map100.json:event:11|EV011|page:1
	AGH_unlockClassItemProcessWork = function (interp) {
		return (function () {
			var variable19Value = $gameVariables.value(19);
			var value2 = 240;
			var variable21Value = $gameVariables.value(21);
			$gameParty.unlockClass(variable19Value + variable21Value);
			this.character(variable19Value).requestAnimation(value2);
		}).call(interp);
	};

	// Replaces (1x): Map100.json:event:11|EV011|page:1
	AGH_forceMoveRouteCharactersRandomWork2 = function (interp) {
		return (function () {
			var variable19Value = $gameVariables.value(19);
			this.character(variable19Value).forceMoveRoute({
				"list": [
					{ "code": 45, "parameters": ["this.setTone(0, 0, 0);"] },
					{ "code": 0 }], "repeat": false, "skippable": true
			});
			this.sVal(22, `${$dataClasses[variable19Value + $gameVariables.value(21)].name}`);
		}).call(interp);
	};

	// Replaces (1x): Map100.json:event:11|EV011|page:1
	AGH_forceMoveRouteCharactersItemProcessWork = function (interp) {
		return (function () {
			var variable19Value = $gameVariables.value(19);
			this.character(variable19Value).forceMoveRoute({
				"list": [
					{ "code": 37 },
					{ "code": 45, "parameters": ["this.jumpEx(0,20,14,0);"] },
					{ "code": 0 }], "repeat": false, "skippable": true
			});
		}).call(interp);
	};

	// Replaces (1x): Map144.json:event:12|EV012|page:1
	AGH_setSwitchEv012 = function () {
		var itemsCnt = 10;
		// item id from 154 to 159
		// switch id from 161 to 166
		for (let id = 154; id < 160; id++) {
			if ($gameParty.numItems($dataItems[id]) >= itemsCnt) {
				$gameSwitches.setValue(id + 7, true)
			};
		}
	};

	// Replaces (1x): Map196.json:event:3|EV207宿屋処理|page:1
	AGH_setVariableRandomWork3 = function () {
		$gameActors.actor(20).setName(`宿受付`);
		$gameVariables.value(400)[59] = `${$dataWeapons[431].name}`;
		valueCountSet1 = 1233;
		valueCountSet2 = 1234;
		$gameVariables.setValue(23,
			`「いらっしゃいませ。
		当ホテルにお越しくださり、誠に有難う御座います。
		最高級の設備をご用意しておりますので、
		ご堪能頂ければ幸いです」
		`);
		$gameVariables.setValue(22, '$FACE[Vxa_People2, 0]');
	};

	// Replaces (1x): Map200.json:event:11|EV011|page:1
	AGH_setSelfVariableChoiceSwitch12Ev011 = function (interp) {
		return (function () {
			this.sVal(172, 19);//中央に一言メッセージ,何行でも良し
			var messageText = `\v[23]`;
			valueTalkSet = [1, 28, messageText, 100];//0で消去 1で通常 2で時間経過  255で背景透明度
			this.setupChild($dataCommonEvents[60].list, 0);
		}).call(interp);
	};


})();
