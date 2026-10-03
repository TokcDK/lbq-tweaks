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
	CEH_setEventIdFromSpawnList = function (interp, id) {
		interp._eventId = aghSpawnIdList()[id] || 0;
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
	CEH_rollRandomHCounts = function () {
		i1 = getRandomIndex(6) + 5;      //人数
		i2 = getRandomIndex(10) + 11;    //膣回数
		i3 = Math.floor(Math.random() * -5) + i1; //中だし回数
		i4 = getRandomIndex(5) + 6;      //アナル回数
		i5 = Math.floor(Math.random() * -2) + i4; //中だし回数
		i6 = getRandomIndex(5) + 6;      //フェラ回数
		i7 = Math.floor(Math.random() * -2) + i4; //口腔回数
		i8 = getRandomIndex(3) + 0;      //失禁回数
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
	
	// Replaces (13x): this._eventId = $gameVariables.value(292)[slot];
	CEH_setEventIdFromSpawnList = function (interp, slot) {
		interp._eventId = $gameVariables.value(292)[slot];
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
})();