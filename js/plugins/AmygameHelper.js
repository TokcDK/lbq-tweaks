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
		var arr1 = $gameMap.event(interp._eventId).event().meta['BossGura'].split(',');
		boss_setup1(Number(arr1[0]), Number(arr1[1]));
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
		var value1 = $gameVariables.value(530);
		if (arguments.length >= 5) {
			event_respawnSetA(value1, a, b, c, d);
		} else {
			event_respawnSetA(value1, a, b, c);
		}
		interp._eventId = $gameVariables.value(292)[value1];
	};

	// Replaces (~31x):
	//   var value1 = <id or expression>;
	//   var event = $gameMap.event($gameVariables.value(292)[value1]);
	//   event.locate(<x>, <y>);
	//   event.setDirection(<dir>);
	AGH_locateSpawnedNpc = function (id, x, y, dir) {
		var value1 = id;
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.locate(x, y);
		event.setDirection(dir);
	};

	// Replaces (~26x):
	//   var arr1 = [];
	//   arr1.push($gameVariables.value(292)[<id1>]); ...
	//   event_NpcCharaMoveId(45,"<action>",arr1);
	AGH_npcGroupAction = function (ids, action) {
		var arr1 = [];
		ids.forEach(function (id) {
			arr1.push($gameVariables.value(292)[id]);
		});
		event_NpcCharaMoveId(45, action, arr1);
	};

	//=============================================================================
	// UI notices / windows
	//=============================================================================

	// Replaces (~24x): region/map unlock notification popup (common event 45).
	AGH_regionUnlockNotice = function (interp, sw1, sw2) {
		interp.sVal(20, 0);
		var value1 = $dataSystem.switches[sw1];
		var value2 = $dataSystem.switches[sw2];
		valueWordSet0 = `${value2}に\\C[16]${value1}\\C[0]が追加されました`;
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
		var value1 = picId;
		$gameScreen.movePicture(value1, origin, x, y, 100, scaleY, 0, 0, dur);
	};

	// Replaces (~16x):
	//   $gameSwitches.setValue(<switchId>,false);
	//   var arr1 = [<ids>];
	//   pic_eraseP(<layer>,arr1);
	AGH_erasePictureRange = function (switchId, layer, ids) {
		$gameSwitches.setValue(switchId, false);
		var arr1 = ids;
		pic_eraseP(layer, arr1);
	};

	// Replaces (~12x):
	//   valuePic1 = <picId>;
	//   var value2 = '<imageName>';
	//   $gameScreen.showPicture(valuePic1,value2,1,640,384,100,100,255,0);
	//   picture_fade1(valuePic1,"fadeIn",<fadeTarget>,<frames>,5);
	AGH_showCgFadeIn = function (picId, imageName, fadeTarget, frames) {
		valuePic1 = picId;
		var value2 = imageName;
		$gameScreen.showPicture(valuePic1, value2, 1, 640, 384, 100, 100, 255, 0);
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
		var value1 = $gameVariables.value(slot)[0];
		var value2 = $gameVariables.value(slot)[1];
		var value3 = $gameVariables.value(slot)[2];
		if (value1 >= 1) {
			$gamePlayer.reserveTransfer(value1, value2, value3, 2, 2);
		} else {
			$gamePlayer.reserveTransfer(14, 2, 2, 2, 2);
		};
	};

})();