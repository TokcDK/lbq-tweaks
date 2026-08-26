/*:
 * @plugindesc Shared helper functions extracted from repeating Script (355/655) command blocks found in data/CommonEvents.json
 * @author BlueQuest maintenance
 *
 * @help
 * Every function below was moved verbatim out of CommonEvents.json, where the
 * same script block was copy-pasted across many common events. Each occurrence
 * in CommonEvents.json was replaced by a single Script command calling the
 * corresponding CEH_xxx(...) function defined here.
 *
 * Functions that touch Game_Interpreter state (_eventId, setupChild, sVal)
 * take the interpreter as first argument: call them from a Script event
 * command as "CEH_xxx(this);".
 *
 * Implicit globals used by the original snippets (valuePic1, valueWipeImg,
 * valueThisEventId, i1..i8, valueFaceSelect, valueBossId, ...) are kept
 * implicit on purpose to preserve the original behaviour.
 */

(function () {
	
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
		interp._eventId = $gameVariables.value(292)[id];
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
		for (var i = 0; i <= $gameVariables.value(292).length - 1; i++) {
			if ($gameVariables.value(292)[i] >= 1) {
				if (!!$gameMap.event($gameVariables.value(292)[i])) {
					if (!$gameParty.inBattle()) { $gameMap.eraseEvent($gameVariables.value(292)[i]) };
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
		var value1 = $gameVariables.value(530);
		event_respawnSetA(value1, 14, 34, 1, 4);
		interp._eventId = $gameVariables.value(292)[value1];
		var value1 = 11;
		event_respawnSetN(value1, 16, 15, 0, 'npcUnique1', 0, 4);
	};

	// Replaces (18x):
	//   var value1 = $gameVariables.value(530);
	//   var arr1 = $gameVariables.value(163)[$gameVariables.value(535)];
	//   event_respawnSetA(value1,15,4,0,6);
	//   var event = $gameMap.event($gameVariables.value(292)[value1]);
	//   var value1 = 11;
	//   event_respawnSetN(value1,16,4,1,arr1[6],arr1[7],2);
	CEH_respawnSubNpcWithPreset = function (interp) {
		var value1 = $gameVariables.value(530);
		var arr1 = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(value1, 15, 4, 0, 6);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		var value1 = 11;
		event_respawnSetN(value1, 16, 4, 1, arr1[6], arr1[7], 2);
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
		var value1 = $gameVariables.value(530);
		var arr1 = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(value1, arr1[3], arr1[4], 1);
		var event = $gameMap.event($gameVariables.value(292)[value1]);
		event.setImage(arr1[1], arr1[2]);
		event.setDirection(arr1[5]);
		interp._eventId = $gameVariables.value(292)[value1];
	};

	// Replaces (11x):
	//   var value1 = $gameVariables.value(530);
	//   var arr1 = $gameVariables.value(163)[$gameVariables.value(535)];
	//   event_respawnSetA(value1,arr1[3],arr1[4],1,arr1[5]);
	//   this._eventId = $gameVariables.value(292)[value1];
	//   var value1 = 11;
	//   event_respawnSetN(value1,arr1[8],arr1[9],0,arr1[6],arr1[7],arr1[10]);
	CEH_respawnSubNpcWithPresetArr = function (interp) {
		var value1 = $gameVariables.value(530);
		var arr1 = $gameVariables.value(163)[$gameVariables.value(535)];
		event_respawnSetA(value1, arr1[3], arr1[4], 1, arr1[5]);
		interp._eventId = $gameVariables.value(292)[value1];
		var value1 = 11;
		event_respawnSetN(value1, arr1[8], arr1[9], 0, arr1[6], arr1[7], arr1[10]);
	};

	//=============================================================================
	// Camera work
	//=============================================================================

	// Replaces (19x):
	//   var value1 = $gameVariables.value(530);
	//   var value1 = $gameVariables.value(292)[value1];
	//   drowsepost.camera.zoom(1, 60, value1);
	CEH_zoomToPartySpawnedEvent = function () {
		var value1 = $gameVariables.value(530);
		var value1 = $gameVariables.value(292)[value1];
		drowsepost.camera.zoom(1, 60, value1);
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
		var value2 = 'ScreenBlackOut';
		$gameScreen.showPicture(51, value2, 1, 640, 384, 100, 100, 200, 0);
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
		var arr1 = $gameVariables.value(163)[$gameVariables.value(535)];
		$gameVariables.setValue(171, [arr1[0], arr1[3], arr1[4]]);
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
		var value1 = $gameVariables.value(530);
		var value1 = $gameVariables.value(292)[value1];
		event_partyCharaMove(45, "this.turnTowardCharacter($gameMap.event(" + value1 + "));");
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

})();