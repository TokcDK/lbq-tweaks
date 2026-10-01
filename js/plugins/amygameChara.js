/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//☆☆キャラチップに一言台詞chara_oneWord(valueSerialPictureId,this._eventId,25,60,arr1,arr2,arr3);
chara_oneWord = function(pictureId,eventId,textPictureId,waitFrames,randomXOffsets,randomYOffsets,lineCandidates,fontSize){

//WARN: both are identical!
// if(id4 >= 100){
//   picture_motion1("smooth",[0]);
// } else {
//   picture_motion1("smooth",[0]);
// };
picture_motion1("smooth", [0]);

const randomLine = lineCandidates[getRandomIndex(lineCandidates.length)];
$gameScreen.setDTextPicture(randomLine, textPictureId);
$gameScreen.dWindowFrame = 'ON';
if(fontSize == 0){}else{$gameScreen.setDtextFont(fontSize)};
$gameScreen.dTextAlign = 1;

let screenXPos;
let screenYPos;
if(!!$gameMap.event(eventId)) {
  const ev = $gameMap.event(eventId);
  screenXPos = ev.screenX() * $gameScreen.zoomScale();
  screenYPos = (ev.screenY() - 70) * $gameScreen.zoomScale();
} else {
  screenXPos = 640;
  screenYPos = 384;
};

const randXOffset = randomXOffsets[getRandomIndex(randomXOffsets.length)];
const randYOffset = randomYOffsets[getRandomIndex(randomYOffsets.length)];
$gameScreen.showPicture(pictureId,"",1,screenXPos+randXOffset,screenYPos+randYOffset,50,50,255,0);
$gameScreen.movePicture(pictureId,1,screenXPos+randXOffset,screenYPos+randYOffset,150,150,0,0,waitFrames);

};

//プレイヤー（イベント）の向き対応座標x,y,id1が2で正面,8が背後,4が左,6が右
event_charaDirectionPoint = function(event,facingId){

valueDirectionPointX = event._realX;
valueDirectionPointY = event._realY;
const eventDirection = event.direction();
if(facingId == 2){
  if(eventDirection == 2){valueDirectionPointY += 1}
  else if(eventDirection == 4){valueDirectionPointX -= 1}
  else if(eventDirection == 6){valueDirectionPointX += 1}
  else if(eventDirection == 8){valueDirectionPointY -= 1};
}
else if(facingId == 8){
  if(eventDirection == 2){valueDirectionPointY -= 1}
  else if(eventDirection == 4){valueDirectionPointX += 1}
  else if(eventDirection == 6){valueDirectionPointX -= 1}
  else if(eventDirection == 8){valueDirectionPointY += 1};
}
else if(facingId == 4){
  if(eventDirection == 2){valueDirectionPointX += 1}
  else if(eventDirection == 4){valueDirectionPointY += 1}
  else if(eventDirection == 6){valueDirectionPointY -= 1}
  else if(eventDirection == 8){valueDirectionPointX -= 1};
}
else if(facingId == 6){
  if(eventDirection == 2){valueDirectionPointX -= 1}
  else if(eventDirection == 4){valueDirectionPointY -= 1}
  else if(eventDirection == 6){valueDirectionPointY += 1}
  else if(eventDirection == 8){valueDirectionPointX += 1};
};

};

//マップイベントのリセット
map_reset1 = function(){

const mapID = $gameMap.mapId();
$gameSystem.savePrefabEventCondition(mapID);
$gameSwitches.setValue(140,false);
$gameSwitches.setValue(156,false);
for (let id = $gameMap.events().length; id > 0; id--) {
  if (!$gameMap.event(id)) continue;

  if ($gameMap.event(id).event().meta['Respawn']) {
    $gameMap.eraseEvent(id);
  } else {
    $gameSelfSwitches.setValue([mapID, id, "C"], false);
    $gameSelfSwitches.setValue([mapID, id, "D"], false);
  }
}

}

//主観イベントの現在位置にプレイヤーを設置してシーン終了event_PlayerArrangement($gameVariables.value(530));
event_PlayerArrangement = function(eventIndex){

const eventId = $gameVariables.value(292)[eventIndex];
const event = $gameMap.event(eventId);
if(!!event) {
  if($gameSwitches.value(29)){
    $gameVariables.setValue(171,0);
  } else {
    event_charaDirectionPoint(event,0);
    $gamePlayer.setDirection(event.direction());
    const playerPosition = [$gameMap.mapId(),valueDirectionPointX,valueDirectionPointY];
    $gameVariables.setValue(171,playerPosition);
  }
} else {
  $gameVariables.setValue(171,0);
}
$gameVariables.setValue(528,100);

}

event_charaZanzou = function(sourceEventId,charaSlotId){

if(!!$gameMap.event(sourceEventId)) {
  var event = $gameMap.event(sourceEventId);
  var charaparaState = [event.characterName(),event.characterIndex(),event._realX,event._realY,event.direction()];
  $gameMap.spawnEvent(195, Number(charaparaState[2]), Number(charaparaState[3]), true);
  var eventId = $gameMap.getLastSpawnEventId();
  var event = $gameMap.event(eventId);
  event.setImage(charaparaState[0], Number(charaparaState[1]));
  event.setDirection(Number(charaparaState[4]));
  event.setTone(30, 30, 255);
  event.setOpacity(200);
  event.setBlendMode(1);
  $gameVariables.value(292)[charaSlotId] = eventId;
};

};

event_charaRoot = function(eventId){

if(!!$gameMap.event(eventId)) {
  $gameMap.event(eventId).forceMoveRoute({
  "list":[
  {"code":15, "parameters":[600]},
  {"code":0}],"repeat":true,"skippable":true});
};

};

event_charaPreset = function(eventId){

if(!!$gameMap.event(eventId)) {
  var char = $gameMap.event(eventId);
  char.clearIndicators();
  char._indData.ref = true;
  $gameSystem.setMapActiveMessageEnabled(false);
};

};

//NPCグラ設定
map_npcGraphicSet = function(){

$gameVariables.setValue(33,'npc');
$gameVariables.setValue(35,getRandomIndex(6) + 1);
$gameVariables.setValue(37,getRandomIndex(3) + 2);
$gameVariables.setValue(34,5);
$gameVariables.setValue(36,[0,8]);//インデックス
  if($gameSwitches.value(203)){//屋外
    var npcTypeRandom = getRandomIndex(11);
    if(npcTypeRandom >= 9){
      $gameVariables.setValue(33,'npcCastle');
      $gameVariables.setValue(35,1);
      $gameVariables.setValue(37,getRandomIndex(3) + 2);
    };
  };
  if($gameSwitches.value(282)){//浜辺
    $gameVariables.setValue(33,'npcSwimsuit');
    $gameVariables.setValue(35,getRandomIndex(4) + 1);
    $gameVariables.setValue(37,getRandomIndex(3) + 2);
  };
  if($gameSwitches.value(242)){//城
    var arr = [1,2];
    var castleMaidChoice = arr[getRandomIndex(arr.length)]
      if(castleMaidChoice == 1){
        $gameVariables.setValue(33,'npcCastle');
        $gameVariables.setValue(35,getRandomIndex(2) + 1);
        $gameVariables.setValue(37,getRandomIndex(2) + 2);
      } else {
        $gameVariables.setValue(33,'npcMaid');
        $gameVariables.setValue(35,1);
        $gameVariables.setValue(37,getRandomIndex(2) + 2);
      };
  };
  if($gameSwitches.value(276)){//城終盤
    $gameVariables.setValue(33,'npcOrder');
    $gameVariables.setValue(35,1);
    $gameVariables.setValue(37,getRandomIndex(2) + 2);
  };
  if($gameSwitches.value(261)){//秩序
    $gameVariables.setValue(33,'npcOrder');
    $gameVariables.setValue(35,1);
    $gameVariables.setValue(37,getRandomIndex(2) + 2);
  };
  if($gameSwitches.value(246)){//貴族
    $gameVariables.setValue(33,'npcMaid');
    $gameVariables.setValue(35,1);
    $gameVariables.setValue(37,getRandomIndex(2) + 2);
  };
  if($gameSwitches.value(300)){//病院
    $gameVariables.setValue(33,'npcDoctor');
    $gameVariables.setValue(35,1);
    $gameVariables.setValue(37,getRandomIndex(2) + 2);
  };
  if($gameSwitches.value(235) || $gameSwitches.value(237)){//ギルドと武器防具屋
    $gameVariables.setValue(33,'Actor');
    $gameVariables.setValue(35,getRandomIndex(3) + 1);
    $gameVariables.setValue(37,getRandomIndex(2) + 2);
  };
  if($gameSwitches.value(232)){//富豪
    $gameVariables.setValue(33,'npcFugou');
    $gameVariables.setValue(35,3);
    $gameVariables.setValue(37,getRandomIndex(2) + 2);
    $gameVariables.setValue(36,[0,4]);//インデックス
  };
  if($gameSwitches.value(230)){//スラム悪人
    $gameVariables.setValue(33,'BB_akunin');
    $gameVariables.setValue(35,5);
    $gameVariables.setValue(37,getRandomIndex(2) + 2);
  };
  if($gameSwitches.value(15)){//夜
    if($gameSwitches.value(203)){//屋外
      $gameVariables.setValue(241,getRandomIndex(5) + 1);
    } else {
      $gameVariables.setValue(241,0);
    };
  };

};

//全体マップで消去が必要な場合
worldMap_eraseSelect = function(){

  const gameVar135 = $gameVariables.value(135);
  const max = $gameVariables.value(173).length;
  const mapId = $gameMap.mapId();
  for (let id = 50; id > 0; id--) {
    const eventData = $gameMap.event(id);
    if (!eventData) continue;

    const event = eventData.event();
    if (!!event.meta['WorldNotErase']) continue;

    for (let j = 0; j < max; j++) {
      if (gameVar135 == j) {
        const eventMQProgress = event.meta['MQProgress'];
        if (eventMQProgress) {
          if (Number(eventMQProgress) !== j) {
            $gameSelfSwitches.setValue([mapId, id, 'C'], true);
          };
        } else {
          $gameSelfSwitches.setValue([mapId, id, 'C'], true);
        };
      };
    };
  };
};

//マップNPC配置セット
map_npcPositionSet = function () {

  $gameVariables.setValue(173, []);
  const eventsCount = $gameMap.events().length;
  const start = eventsCount >= 50 ? 200 : 100;
  const mapId = $gameMap.mapId();
  //for (var id2 = $gameMap.events().length; id2 > 0; id2--) {
  for (let id = start; id > 0; id--) {
    map_npcPositionSetEvent(id, mapId);
  }
}

map_npcPositionSetEvent = function (id, mapId) {
  const event = $gameMap.event(id);
  if (!event) return;
  const eventEvent = event.event();

  if ($gameSelfSwitches.value([mapId, id, 'A']) && !$gameSwitches.value(209)) {
    if (eventEvent.meta['NoAClear']) { } else {
      $gameMap.eraseEvent(id);
    }

    return;
  }

  if (eventEvent.meta['MQProgress']) {
    $gameVariables.value(173).push(Number(eventEvent.meta['MQProgress']));
  }

  if (eventEvent.meta['foodC']) {//decorationFood
    let foodIndex = 1;
    const foodPattern = getRandomIndex(7) + 0;
    event.setImage('food_' + foodIndex, foodPattern);
    let directionOrPatternCandidates = [2, 4, 6, 8];
    foodIndex = directionOrPatternCandidates[getRandomIndex(directionOrPatternCandidates.length)];
    event.setDirection(foodIndex);//2,4,6,8
    directionOrPatternCandidates = [0, 1, 2];
    foodIndex = directionOrPatternCandidates[getRandomIndex(directionOrPatternCandidates.length)];
    event.setPattern(foodIndex);//0,1,2
    event._originalPattern = foodIndex;
    event.setDirectionFix(true);//向き固定
  }
  else if (eventEvent.meta['decorationFood']) {
    const foodCharaparaCandidates = [[1, 5, 8, 1], [1, 5, 8, 2], [1, 6, 8, 0], [1, 6, 8, 1], [2, 0, 2, 1], [2, 1, 2, 2], [2, 0, 6, 0], [2, 0, 6, 1]];
    const foodCharapara = foodCharaparaCandidates[getRandomIndex(foodCharaparaCandidates.length)];
    event.setDirectionFix(false);
    event.setImage('food_' + foodCharapara[0], foodCharapara[1]);
    event.setDirection(foodCharapara[2]);
    event.setPattern(foodCharapara[3]);//0,1,2不要
    event._originalPattern = foodCharapara[3];
    event.setDirectionFix(true);
  }
  else if (eventEvent.meta['Alcol']) {
    const alcolCharaparaCandidates = [[0, 6, 0], [0, 6, 1], [0, 6, 2], [1, 4, 1], [1, 4, 2], [2, 4, 0], [2, 4, 1]];
    const alcolCharapara = alcolCharaparaCandidates[getRandomIndex(alcolCharaparaCandidates.length)];
    event.setDirectionFix(false);
    event.setImage('food_2', alcolCharapara[0]);
    event.setDirection(alcolCharapara[1]);
    event.setPattern(alcolCharapara[2]);//0,1,2不要
    event._originalPattern = alcolCharapara[2];
    event.setDirectionFix(true);
  }
  else if (eventEvent.meta['foodPlate']) {
    const plateCharaparaCandidates = [[2, 0, 8, 0], [2, 0, 8, 1], [2, 0, 8, 1], [2, 1, 8, 0], [2, 1, 8, 1], [2, 1, 8, 2], [2, 2, 8, 0], [2, 2, 8, 1]];
    const plateCharapara = plateCharaparaCandidates[getRandomIndex(plateCharaparaCandidates.length)];
    event.setDirectionFix(false);
    event.setImage('food_' + plateCharapara[0], plateCharapara[1]);
    event.setDirection(plateCharapara[2]);
    event.setPattern(plateCharapara[3]);//0,1,2不要
    event._originalPattern = plateCharapara[3];
    event.setDirectionFix(true);
  }
  else if (eventEvent.meta['NpcProstitute']) {
    const prosName = 'npcNakidWoman';
    const prosIndex = getRandomIndex(3) + 1;
    const prosPattern = getRandomIndex(7) + 0;
    event.setImage(prosName + prosIndex, prosPattern);
  }
  else if (eventEvent.meta['NpcProstituteGuest']) {
    const guestName = 'npcFugou';
    const guestIndex = 1;
    const guestPattern = getRandomIndex(4) + 4;
    event.setImage(guestName + guestIndex, guestPattern);
  }
    else if (eventEvent.meta['StandNPC']) {
    map_npcGraphicSet();
    const graphicKind = $gameVariables.value(33);
    const graphicIndex = $gameVariables.value(35);
    const graphicPattern = Math.floor(Math.random() * $gameVariables.value(36)[1]) + $gameVariables.value(36)[0];
    event.setImage(graphicKind + graphicIndex, graphicPattern);
  }
    else if (eventEvent.meta['BloodBody']) {
    map_npcGraphicSet();
    const graphicKind = $gameVariables.value(33);
    const graphicIndex = $gameVariables.value(35);
    const graphicPattern = Math.floor(Math.random() * $gameVariables.value(36)[1]) + $gameVariables.value(36)[0];
    event.setImage(graphicKind + graphicIndex, graphicPattern);
    const bloodAngleCandidates = [45, 135, -45, -135];
    const bloodAngle = bloodAngleCandidates[getRandomIndex(bloodAngleCandidates.length)];
    event.setAngle(bloodAngle);
    event.setDirection(8);
    $gameMap.spawnEvent(99, event.x, event.y, true);//血痕
    const bloodEventId = $gameMap.getLastSpawnEventId();
    if (bloodAngle == 45) { spriteOffsetX = 20; spriteOffsetY = 20 };
    if (bloodAngle == 135) { spriteOffsetX = 20; spriteOffsetY = 40 };
    if (bloodAngle == -45) { spriteOffsetX = -20; spriteOffsetY = 20 };
    if (bloodAngle == -135) { spriteOffsetX = -20; spriteOffsetY = 40 };
    $gameMap.event(bloodEventId)._spriteOffsetX += spriteOffsetX;//yep
    $gameMap.event(bloodEventId)._spriteOffsetY += spriteOffsetY;
  }

  let eraseFlag = 0;
  if (event.characterName()) {//で画像なし状態のキャラ判定
    if (eventEvent.meta['BossGura']) {
      //let moveRouteCode = 0;
      const bossGuraValues = eventEvent.meta['BossGura'].split(',');
      const enemyData = $dataEnemies[Number(bossGuraValues[1])];
      if (!!enemyData && !!enemyData.meta['BossEnemy']) {
        const enemyBossGuraValues = enemyData.meta['BossGura'] ? enemyData.meta['BossGura'].split(',') : [20, 30, 0.2];
        valueBossCharaGura = [id, enemyData.meta['BossEnemy'].split(',')[2], Number(enemyBossGuraValues[0]), Number(enemyBossGuraValues[1]), Number(enemyBossGuraValues[2])];
        boss_charaGuraCGSet(valueBossCharaGura);
      };
    }
    if (eventEvent.meta['BossGura2']) {
      //let moveRouteCode = 0;
      const bossGura2Values = eventEvent.meta['BossGura2'].split(',');
      valueBossCharaGura = [id, bossGura2Values[0], Number(bossGura2Values[1]), Number(bossGura2Values[2]), Number(bossGura2Values[3])];
      boss_charaGuraCGSet(valueBossCharaGura);
      //event.setOpacity(255);
    }
    if (eventEvent.meta['Charalight']) {
      const charalightValues = eventEvent.meta['Charalight'].split(',');
      eventEvent.moveLight(Number(charalightValues[0]), Number(charalightValues[1]), Number(charalightValues[2]), Number(charalightValues[3]));
    }
    if (eventEvent.meta['PerspectiveA']) {
      let hideIndicator = 0;
      const perspectiveValues = eventEvent.meta['PerspectiveA'].split(',');
      for (let i = 0; i <= perspectiveValues.length - 1; i++) {
        if (Number(perspectiveValues[i]) <= 0) { hideIndicator = 1 } else {
          if ($gameSwitches.value(Number(perspectiveValues[i]) + 440)) {
            hideIndicator = 1;
          }
        }
      }
      if (hideIndicator == 0) { eraseFlag = 1 };
    }

    if (eventEvent.meta['EvSceneSet']) {//<EvSceneSet:401,1,0>1で達成時に消去で2なら消去なし。0で♡1で笑-1でなし
      let hideIndicator = 0;
      const evSceneSetValues = eventEvent.meta['EvSceneSet'].split(',');
      const sceneItemId = Number(evSceneSetValues[0]);
      let incidenceSw = 0;//発生
      let compSw = 0;//達成
      let indIcon = 'h';//イベアイコン
      if (sceneItemId >= 401 && sceneItemId <= 500) { incidenceSw = sceneItemId + 800; compSw = sceneItemId + 900 };
      if (sceneItemId >= 501 && sceneItemId <= 600) { incidenceSw = sceneItemId + 500; compSw = sceneItemId + 600 };
      if (!!$dataItems[sceneItemId]) {
        if ($dataItems[sceneItemId].meta['AddEventIncidenceSwi']) {
          incidenceSw = Number($dataItems[sceneItemId].meta['AddEventIncidenceSwi']);
        };
        if ($dataItems[sceneItemId].meta['AddEventCompSwi']) {
          compSw = Number($dataItems[sceneItemId].meta['AddEventCompSwi']);
        };
      } else {
        incidenceSw = 0;
      };
      if (incidenceSw <= 1) { hideIndicator = 1 };
      if ($gameSwitches.value(incidenceSw)) { hideIndicator = 1 };
      if (Number(evSceneSetValues[1]) == 1 && $gameSwitches.value(compSw)) { hideIndicator = 0 };
      if (hideIndicator == 0) {
        eraseFlag = 1;
      } else {
        const indicatorIconKind = Number(evSceneSetValues[2]);
        if (indicatorIconKind == 0) { indIcon = 'h' };
        if (indicatorIconKind == 1) { indIcon = 'h1' };
        if (indicatorIconKind == 2) { indIcon = 't' };
        if (indicatorIconKind == 3) { indIcon = 'e' };
        if (indicatorIconKind == -1) { indIcon = null };
        if (indIcon) {
          const char = event;
          char.setIndicators(indIcon, 0, false, 0, 0, "", 0, false, false, 0, true, 0, -10);
          char._indData.ref = true;
          char._indData.fontSize = 28;
          char._indData.ref = true;
          char._indData.animated = true;
          char._indData.frames = [0, 5, 0, 5];
        }
      }
    }
    if (eventEvent.meta['EvStartSw']) {
      let hideIndicator = 0;
      const evStartSwValues = eventEvent.meta['EvStartSw'].split(',');
      for (let i = 0; i < evStartSwValues.length; i++) {
        if (Number(evStartSwValues[i]) <= 1) { hideIndicator = 1 } else {
          if ($gameSwitches.value(Number(evStartSwValues[i]))) {
            hideIndicator = 1;
          }
        }
      }
      if (hideIndicator == 0) { eraseFlag = 1 };
    }
    if (eventEvent.meta['EvEndSw']) {
      const evEndSwValues = eventEvent.meta['EvEndSw'].split(',');
      for (let i = 0; i < evEndSwValues.length; i++) {
        if (Number(evEndSwValues[i]) >= 1) {
          if ($gameSwitches.value(Number(evEndSwValues[i]))) {
            eraseFlag = 1;
            break;
          }
        }
      }
    }

    if (eventEvent.meta['EvStartCloth']) {
      //let character = event;
      const eventEventEvStartClothArr = eventEvent.meta['EvStartCloth'].split(',');
      const clothSlot = Number(eventEventEvStartClothArr[0]);
      const clothReq = Number(eventEventEvStartClothArr[1]);
      if (clothSlot >= 1) {
        if ($gameVariables.value(440 + clothSlot)[41] == clothReq) { } else {
          eraseFlag = 1;
        }
      }
    }
    if (eventEvent.meta['EvStartVal']) {
      //let character = event;
      const eventEventEvStartValArr = eventEvent.meta['EvStartVal'].split(',');
      const startVarId = Number(eventEventEvStartValArr[0]);
      const startReqVal = Number(eventEventEvStartValArr[1]);
      if (startVarId >= 1) {
        if ($gameVariables.value(startVarId) >= startReqVal) { } else {
          eraseFlag = 1;
        }
      }
    }
    if (eventEvent.meta['EvEndVal']) {
      //let character = event;
      const eventEventEvEndValArr = eventEvent.meta['EvEndVal'].split(',');
      const endVarId = Number(eventEventEvEndValArr[0]);
      const endReqVal = Number(eventEventEvEndValArr[1]);
      if (endVarId >= 1) {
        if ($gameVariables.value(endVarId) >= endReqVal) {
          eraseFlag = 1;
        }
      }
    }
    if (eventEvent.meta['EvEraseMain']) {
      //let character = event;
      const evEraseMainValues = eventEvent.meta['EvEraseMain'].split(',');
      for (let i = 0; i <= evEraseMainValues.length - 1; i++) {
        if (Number(evEraseMainValues[i]) >= 1) {
          if ($gameVariables.value(135) == Number(evEraseMainValues[i])) {
            eraseFlag = 1;
            break;
          }
        }
      }
    }
    if (eventEvent.meta['EvESSOn']) {
      //let character = event;
      const evEssOnValues = eventEvent.meta['EvESSOn'].split(',');
      for (let i = 0; i <= evEssOnValues.length - 1; i++) {
        const sceneItemId = Number(evEssOnValues[i]);
        if (sceneItemId >= 501 && sceneItemId <= 600) {
          if ($gameSwitches.value(sceneItemId + 500) && !$gameSwitches.value(sceneItemId + 600)) {
            eraseFlag = 1;
            break;
          }
        }
        else if (sceneItemId >= 401 && sceneItemId <= 500) {
          if ($gameSwitches.value(sceneItemId + 800) && !$gameSwitches.value(sceneItemId + 900)) {
            eraseFlag = 1;
            break;
          }
        }
      }
    }
    if (eventEvent.meta['EvEraseItem']) {
      //let character = event;
      let evEraseItemValues = eventEvent.meta['EvEraseItem'].split(',');
      for (let i = 0; i <= evEraseItemValues.length - 1; i++) {
        if (Number(evEraseItemValues[i]) >= 1) {
          if ($gameParty.hasItem($dataItems[Number(evEraseItemValues[i])], true)) {
            eraseFlag = 1;
          }
        }
      }
    }
    if (eventEvent.meta['QuestSet']) {//
      //let character = event;
      const questItemId = eventEvent.meta['QuestSet'];
      $gameSelfSwitches.setValue([mapId, id, 'B'], valueQuestArray5[questItemId - 800] == 1);
      $gameSelfSwitches.setValue([mapId, id, 'A'], $gameParty.hasItem($dataItems[Number(questItemId)], true));
      //if($gameParty.hasItem($dataItems[Number(value1) + 100],true)){
      //let eraseFlag = 1;
      //}
    }

    if (eraseFlag == 1) { $gameMap.eraseEvent(id) }
    else if (eraseFlag == 0) {
      if (eventEvent.meta['PSet']) {
        const character = event;
        const locateX = Number(eventEvent.meta['PSet'].split(',')[0]);
        const locateY = Number(eventEvent.meta['PSet'].split(',')[1]);
        character.locate(locateX, locateY);
        //character.setDirection(4);
      };
      if (eventEvent.meta['Amassage']) {//<Amassage:901,おはよう\I[16]>
        const arr = eventEvent.meta['Amassage'].split(',');
        const msgVarId = Number(arr[0]);
        const msgText = arr[1];
        $gameVariables.setValue(msgVarId, msgText);
        $gameMap.forceDisplayActiveMessage(id);
      };

      //<Hsw1:2,1> , //<H1sw1:2,1>
      const hSwSlotIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (const num of ['', '1']) {
        if (!eventEvent.meta['H' + num + 'sw1']) continue;

        for (const hSwSlotId of hSwSlotIds) {
          const hswX = eventEvent.meta['H' + num + 'sw' + hSwSlotId];
          if (!hswX) continue;

          const hswXArr = eventEvent.meta['H' + num + 'sw' + hSwSlotId].split(',');
          const hswTargetSw = Number(hswXArr[0]);
          const hswBlockSw = Number(hswXArr[1]);
          if ($gameSwitches.value(hswTargetSw) && !$gameSwitches.value(hswBlockSw)) {
            const char = event;
            char.setIndicators('h' + num, 0, false, 0, 0, "", 0, false, false, 0, true, 0, -20);
            char._indData.ref = true;
            char._indData.fontSize = 28;
            char._indData.ref = true;
            char._indData.animated = true;
            char._indData.frames = [0, 5, 0, 5];
          }
        }
      }
    }
  }
}

//ボスマップのキャラグラをＣＧで設定
boss_charaGuraCGSet = function(valueBossCharaGura){

if(!!$gameMap.event(valueBossCharaGura[0])) {
  $gameMap.event(valueBossCharaGura[0]).changeImage(valueBossCharaGura[1]);
  $gameMap.event(valueBossCharaGura[0]).forceMoveRoute({
  "list":[
  { "code": 45, "parameters": ["$gameMap.event(valueBossCharaGura[0]).startScale(valueBossCharaGura[3],valueBossCharaGura[2]-valueBossCharaGura[4],valueBossCharaGura[2]-valueBossCharaGura[4]);"] },{"code":15, "parameters":[valueBossCharaGura[3]]},
  { "code": 45, "parameters": ["$gameMap.event(valueBossCharaGura[0]).startScale(valueBossCharaGura[3],valueBossCharaGura[2],valueBossCharaGura[2]);"] },{"code":15, "parameters":[valueBossCharaGura[3]]},
  { "code": 45, "parameters": ["$gameMap.event(valueBossCharaGura[0]).startScale(valueBossCharaGura[3],valueBossCharaGura[2]+valueBossCharaGura[4],valueBossCharaGura[2]+valueBossCharaGura[4]);"] },{"code":15, "parameters":[valueBossCharaGura[3]]},
  { "code": 45, "parameters": ["$gameMap.event(valueBossCharaGura[0]).startScale(valueBossCharaGura[3],valueBossCharaGura[2],valueBossCharaGura[2]);"] },{"code":15, "parameters":[valueBossCharaGura[3]]},
  {"code":0}],"repeat":true,"skippable":true});
};

};

var map_npcRespawnNpcDirections = [2, 4, 6, 8];
//NPC動的生成。0マップ最初。1任意タイミング
map_npcRespawn = function(respawnModeId, requestedSourceEventId){

let spawnCount = 1;
if(valueRegionMapArray[spawnCount] < 1) return;

if(respawnModeId == 0){
  spawnCount = $gameVariables.value(241);
  if($gameSwitches.value(16)){
    spawnCount += getRandomIndex(3) + 1;
  };
  if($gameSwitches.value(14)){
    spawnCount += getRandomIndex(3);
  };
  if($gameSwitches.value(15)){
    spawnCount = Math.round($gameVariables.value(241) / 10);
  };
} else {
  spawnCount = 1;
};
if(respawnModeId == 0 && $gameVariables.value(235) > spawnCount){
  spawnCount = 0;
};
let j = 0;
if(!$gameSwitches.value(140) ||
$gameParty.inBattle() ||
spawnCount < 1 ||
$gameVariables.value(202).some(function (id) { return $gameMap.mapId() == id })) return;

  for (let spawnIndex = 1; spawnIndex <= spawnCount; spawnIndex++) {
    let sourceEventId = requestedSourceEventId;
    if(requestedSourceEventId == 0){
      map_npcGraphicSet();
      sourceEventId = [52,55][getRandomIndex(2)];//テンプレ元イベントID
    }
    const conditionMap         = {};
    conditionMap.passable    = 1;
    conditionMap.screen      = 0;
    conditionMap.collided    = 3;
    conditionMap.terrainTags = [0];
    conditionMap.regionIds   = [1];
// BUGFIX: same stale-id bug as map_otherGraphicSet - skip on failure.
    const lastSpawnEventId = $gameMap.spawnEventRandom(sourceEventId, conditionMap, true);
    if(!lastSpawnEventId) continue;
    const charaEventToRespawn = $gameMap.event(lastSpawnEventId);
    if(!charaEventToRespawn) continue;//生成位置が見つからず生成되지 않은場合
    if($gameSwitches.value(377)){
      charaEventToRespawn._priorityType = 1;
    };

    const charaName = $gameVariables.value(33);//キャラグラ名
    const charaNum = $gameVariables.value(35);//キャラグラ番号
    const charaCoords = $gameVariables.value(36);
    //$gameSelfSwitches.setValue([$gameMap.mapId(), value7, "D"], true);
    charaEventToRespawn.setImage(charaName + charaNum, Math.floor(Math.random() * charaCoords[1]) + charaCoords[0]);

    //event.setPattern(value2);//0,1,2不要
    charaEventToRespawn.setDirection(map_npcRespawnNpcDirections[getRandomIndex(map_npcRespawnNpcDirections.length)]);//2,4,6,8

    const npcOpacity = respawnModeId == 0 ? 0/*初期透明度*/ : 255;
    charaEventToRespawn.setOpacity(npcOpacity);

    const npcMoveSpeed = $gameVariables.value(37);//移動速度
    charaEventToRespawn.setMoveSpeed(npcMoveSpeed);

    const npcMoveFrequency = sourceEventId == 52 ? //移動頻度。直線かランダムで変更。
      [3, 4, 5][getRandomIndex(3)]
      : $gameVariables.value(34);
    charaEventToRespawn.setMoveFrequency(npcMoveFrequency);

    $gameVariables.setValue(235,$gameVariables.value(235) + 1);
    j += [1,2,1,2,1,1,2][getRandomIndex(7)];

    if (spawnIndex + j >= spawnCount) break;
  }

};

//エネミー動的生成。0通常。1エロ。map_enemyRespawn(0);
map_enemyRespawn = function(respawnModeId){

let enemySpawnCount = 1;
if(valueRegionMapArray[enemySpawnCount] < 1) return;

//$gameVariables.value(334);//最大数
//$gameVariables.value(335);//討伐数
  if($gameSwitches.value(655) && !$gameSwitches.value(216)  && $gameVariables.value(335) >= $gameVariables.value(334)){
    $gameVariables.setValue(335,0);
  };
  const originalEventId = respawnModeId == 0 ? 16 : 17;//元イベントID
  const maxOccurNum = respawnModeId == 0 ? 224 : 227;//最大出現数変数
  const appearance = respawnModeId == 0 ? 222 : 226;//現在出現数変数

  enemySpawnCount = $gameVariables.value(maxOccurNum);//
  if($gameSwitches.value(15)){
    //var value1 = $gameVariables.value(value11) + Math.round($gameVariables.value(value11) / 5);
  };
  enemySpawnCount -= $gameVariables.value(appearance);
  if($gameVariables.value(appearance) > $gameVariables.value(maxOccurNum)){
    enemySpawnCount = 0;
  };
  //討伐数 + 現在出現数　＞　エネミー最大ポップ数20
  if($gameVariables.value(335) + $gameVariables.value(appearance) >= $gameVariables.value(334)){
    enemySpawnCount = 0;
  };
  //if($gameVariables.value(335) + $gameVariables.value(eraseFlag) >= $gameVariables.value(334)){
    //var value1 = 0;
  //};
  if(respawnModeId == 1){
    if(!$gameSwitches.value($gameVariables.value(236))){
      enemySpawnCount = 0;
    };
  };
  //var j = 0;//
  if (!$gameSwitches.value(140) ||
    $gameParty.inBattle() ||
    enemySpawnCount < 1 ||
    $gameVariables.value(202).some(function (id) { return $gameMap.mapId() == id })) return;

      for (let spawnIndex = 1; spawnIndex <= enemySpawnCount; spawnIndex++) {
        const conditionMap       = {};
        conditionMap.passable    = 1;
        conditionMap.screen      = 0;
        conditionMap.collided    = 3;
        conditionMap.terrainTags = [1];
        conditionMap.regionIds   = [1];        
        // BUGFIX: same stale-id bug - getLastSpawnEventId() returned the previous
        // spawn when this one failed, so an unrelated existing event was
        // re-imaged as an enemy.
        const enemySpawnedId = $gameMap.spawnEventRandom(originalEventId, conditionMap, true);
        if(!enemySpawnedId) continue;
        const enemyEventToRespawn = $gameMap.event(enemySpawnedId);
        if(!enemyEventToRespawn) continue;//生成位置が見つからず生成되지 않은場合
        const enemyGraphic = $dataItems[$gameVariables.value(240)] ? $dataItems[$gameVariables.value(240)].meta.EnemyGraphic : null;
        if(!enemyGraphic) continue;
        enemyEventToRespawn._trigger = 2; // spawned enemy will attack player, trigger set to event touch
        enemyEventToRespawn.setImage(enemyGraphic.split(',')[0], 
        Number(enemyGraphic.split(',')[1]));
        enemyEventToRespawn.setOpacity(255);//scale
        if($dataItems[$gameVariables.value(240)].meta.BigEnemyGraphic){enemyEventToRespawn.setScale(150, 150)};
        let enemyMoveSpeed = getRandomIndex(4) + 1;
        let enemyMoveFrequency = getRandomIndex(4) + 1;
        if($gameSwitches.value(363)){
          enemyMoveSpeed = getRandomIndex(3) + 3;
          enemyMoveFrequency = getRandomIndex(3) + 3;
        };
        if($gameSwitches.value(368)){
          enemyMoveSpeed = getRandomIndex(2) + 1;
          enemyMoveFrequency = getRandomIndex(2) + 1;
        };
        enemyEventToRespawn.setMoveSpeed(enemyMoveSpeed);
        enemyEventToRespawn.setMoveFrequency(enemyMoveFrequency);
        if($gameSwitches.value(360)){
          enemyEventToRespawn.setScale(150, 150);
        };
        if(respawnModeId == 1){
          enemyEventToRespawn.setTone(50, -100, 50);
        };
        let moveRouteCode = 9;
        const moveRouteRandom = getRandomIndex(11);
        if(moveRouteRandom >= 9){
          moveRouteCode = 10;
        } 
        if(moveRouteRandom <= 1){
          moveRouteCode = 11;
        } 
        if(respawnModeId == 1 || $gameSwitches.value(493)){
/*
          enemyEventToRespawn.forceMoveRoute({
          "list":[{"code":9},
          {"code":45,"parameters": ["this._chaseRange = 5;"]},
          {"code":45,"parameters": ["this._chaseSpeed = 4;"]},
          {"code":45,"parameters": ["this._seePlayer = true;"]},
          {"code":45,"parameters": ["this._alertBalloon = 4;"]},
          {"code":45,"parameters": ["this._sightLock = 120;"]},
          {"code":45,"parameters": ["this._returnAfter = false;"]},
          {"code":0}],"repeat":true,"skippable":true});
*/
        } else {
          if($gameSwitches.value(228)){
            enemyEventToRespawn.forceMoveRoute({
            "list":[{"code":15, "parameters":[600]},
            {"code":0}],"repeat":true,"skippable":true});
          } else {
            enemyEventToRespawn.forceMoveRoute({
            "list":[{"code":moveRouteCode},
            {"code":0}],"repeat":true,"skippable":true});
          };
        };
        if($gameSwitches.value(207)){
          if(!$gameSwitches.value(236) || !$gameSwitches.value(155)){
            enemyEventToRespawn.requestAnimation(226);
            //$gameScreen.startAnimation(640, 368, 226, false);
          };
        };
        const gameVar537 = $gameVariables.value(537);
        if(Array.isArray(gameVar537)){gameVar537.push(enemySpawnedId)};
        $gameVariables.setValue(appearance,$gameVariables.value(appearance) + 1);
      }
};

//動物動的生成設定
map_animalGraphicSet = function(enabledFlag){

  if (enabledFlag !== 0) return;

  let graphicNames = 0;
  let spawnConditions = 0;
  const gameSwitch15 = $gameSwitches.value(15);
  if($gameSwitches.value(366)){//夜梟、飛行or待機
    const rnd0or1 = getRandomIndex(2);
      if(rnd0or1 == 0){
        if(valueRegionMapArray[1] >= 1){ 
          graphicNames = ["ZanimalForestNightOwl1"];
          spawnConditions = [62,[3,4],[5],0,0,3,[0],[1]];
        };
      } else {
        if(valueRegionMapArray[2] >= 1){
          graphicNames = ["ZanimalForestNightOwl2"];
          spawnConditions = [63,[1],[1],0,0,3,[0],[2]];
        };
      };
      if(gameSwitch15){map_otherGraphicSet(enabledFlag,graphicNames,spawnConditions)};
  }
  if($gameSwitches.value(365) && valueRegionMapArray[3] >= 1){//水棲
    graphicNames = ["ZannimalWatersideCrab1","ZannimalWatersideFrog2"];
    spawnConditions = [59,[3,4],[2,3],0,0,3,[3],[3]];
    map_otherGraphicSet(enabledFlag,graphicNames,spawnConditions);
  }
  if($gameSwitches.value(364) && valueRegionMapArray[1] >= 1){//野生動物
    graphicNames = ["ZanimalWildCow1","ZanimalWilddeer1","ZanimalWildMonkey1","ZanimalWildBoar1","ZanimalWildBigCat1","ZanimalWildGoat1","ZanimalWildBear1"];
    spawnConditions = [58,[3,4],[2,3,4],1,0,3,[0],[1]];
    map_otherGraphicSet(enabledFlag,graphicNames,spawnConditions);
  }
  if(valueRegionMapArray[4] >= 1){//家畜動物
    graphicNames = ["ZanimalLivestockPig1","ZanimalLivestockHorse1","ZanimalLivestockCow1","ZanimalLivestockCow2","ZanimalLivestockGoat1","ZanimalLivestockSheep1","ZanimalLivestockChicken1"];
    spawnConditions = [57,[3,4],[2,3,4],1,0,3,[0],[4]];
    map_otherGraphicSet(enabledFlag,graphicNames,spawnConditions);
  }
  if($gameSwitches.value(362) && valueRegionMapArray[3] >= 1){//魚
    graphicNames = ["Zanimaltinyfish"];
    spawnConditions = [47,[3,4,5],[4,5],0,0,3,[3],[3]];
    if(!gameSwitch15){map_otherGraphicSet(enabledFlag,graphicNames,spawnConditions)};
  }
  if($gameSwitches.value(202) && $gameSwitches.value(203) && $gameVariables.value(238) >= 2){//街中、町屋外、広さ一定
    if (gameSwitch15) {
      if (valueRegionMapArray[2] >= 1) {
        //夜。伏せ動物
        graphicNames = ["ZanimalNight"];
        spawnConditions = [56, [1, 2], [1, 2], 0, 0, 3, [0], [2]];
        map_otherGraphicSet(enabledFlag, graphicNames, spawnConditions);
      }
    } else if (valueRegionMapArray[1] >= 1) {
      //鳥
      graphicNames = ["!flyingsmallbirds"];
      spawnConditions = [44, [3, 4], [5], 1, 0, 3, [0], [1]];
      map_otherGraphicSet(enabledFlag, graphicNames, spawnConditions);

      if (!$gameSwitches.value(361)) {
        //犬猫
        graphicNames = ["ZanimalCat1", "ZanimalCat2", "ZanimalDog1", "ZanimalDog2", "ZanimalCat3"];
        spawnConditions = [45, [2, 3, 4], [2, 3, 4], 1, 0, 3, [0], [1]];
        map_otherGraphicSet(enabledFlag, graphicNames, spawnConditions);

        //蝶
        graphicNames = ["ZanimalButterflys"];
        spawnConditions = [46, [2, 3, 4], [5], 1, 0, 3, [0], [1]];
        map_otherGraphicSet(enabledFlag, graphicNames, spawnConditions);
      }
    }    
  }
};

//メモで指定したオブジェクト動的生成設定
map_objectMemoSet = function(){

if($gameVariables.value(230) >= 1){
  var value = $dataWeapons[$gameVariables.value(230)];
};
if($gameVariables.value(240) >= 1){
  var value = $dataItems[$gameVariables.value(240)];
};
if(!value) return;
if($gameSwitches.value(201)){
  for (var i = 1; i <= 9; i++) {
    if(value.meta['warpPoint' + i]){
      var warpValues = value.meta['warpPoint' + i].split(',');
      var warpEventId = 131;//ワープ魔方陣<warpPoint1:1,1,1>
      var targetMapId = Number(warpValues[0]);
        if(targetMapId == $gameMap.mapId()){
         $gameMap.spawnEvent(warpEventId, Number(warpValues[1]), Number(warpValues[2]), true);
           if($gameVariables.value(211)[$gameVariables.value(240)][i] == 1){
             $gameSelfSwitches.setValue([$gameMap.mapId(), $gameMap.getLastSpawnEventId(), 'A'], true);
           };
        };
    };
  };
  if(value.meta['warpStart']){
    var warpValues = value.meta['warpStart'].split(',');
      var warpEventId = 132;//ワープ魔方陣。入口<warpStart:1,1,1>
      var targetMapId = Number(warpValues[0]);
        if(targetMapId == $gameMap.mapId()){
         $gameMap.spawnEvent(warpEventId, Number(warpValues[1]), Number(warpValues[2]), true);
      };
  };
  if(value.meta['TchestOnly']){
    var warpValues = value.meta['TchestOnly'].split(',');
      var warpEventId = 113;//レア宝箱
      var targetMapId = Number(warpValues[0]);
        if(targetMapId == $gameMap.mapId()){
         $gameMap.spawnEvent(warpEventId, Number(warpValues[1]), Number(warpValues[2]), true);
          if($gameVariables.value(212)[$gameVariables.value(240)] == 1){
            $gameSelfSwitches.setValue([$gameMap.mapId(), $gameMap.getLastSpawnEventId(), 'A'], true);
          };
      };
  };
};

};

//オブジェクト動的生成設定
map_objectGraphicSet = function(){

if($gameSwitches.value(124) && $gameSwitches.value(238)) return;//イベント進行時と動的生成停止

if($gameVariables.value(238) >= 1){
  if(valueRegionMapArray[1] > 0){
	  for(const n of [0, 1]){
		if(!$gameSwitches.value(201+n)) continue;
		
		const coinSpawnConditions = [18+n,[1],[1],1,0,3,[0],[1]];//小銭生成
		const var238 = $gameVariables.value(238);
		const coinSpawnCountCandidates = [var238-2, var238-1, var238, var238+1];
      let coinSpawnCount = coinSpawnCountCandidates[getRandomIndex(coinSpawnCountCandidates.length)];
      if(coinSpawnCount < 1) coinSpawnCount = 1 ;
      map_otherGraphicSet(coinSpawnCount, 0, coinSpawnConditions);
	  }
  }
}

if($gameSwitches.value(201)){
  $gameVariables.setValue(536,[]);//宝箱生成Id配列
  if (valueRegionMapArray[1] >= 1) {
    const warpSpawnConditions = [43,[1],[1],1,0,0,[0],[1]];//転送先
    map_otherGraphicSet(1,0,warpSpawnConditions);
  }
  if($gameVariables.value(215)[$gameVariables.value(240)].length >= 1 && valueRegionMapArray[8] >= 1){
      let treasureSpawnCount = Math.ceil($gameVariables.value(215)[$gameVariables.value(240)].length/$gameVariables.value(217));
      if (treasureSpawnCount > valueRegionMapArray[8]) { treasureSpawnCount = valueRegionMapArray[8] };
      const treasureSpawnConditions = [86,[1],[1],1,0,0,[0],[8]];
      // BUGFIX: only record the treasure id if a spawn actually happened.
      const spawnedTreasureEventId = map_otherGraphicSet(treasureSpawnCount,0,treasureSpawnConditions);
      if(spawnedTreasureEventId) $gameVariables.value(536).push(spawnedTreasureEventId);
  }
  if($gameSwitches.value(207) && $gameVariables.value(238) >= 3 && $gameVariables.value(270) >= 20 && valueRegionMapArray[1] >= 1){
    const trapSpawnConditions = [20, [1], [1], 1, 0, 0, [0], [1]];//トラップ。エネミーレベル20以上
      const trapBaseVar = $gameVariables.value(238);
      const trapSpawnCountCandidates = [trapBaseVar-2,trapBaseVar-1,trapBaseVar,trapBaseVar+1];
      let trapSpawnCount = trapSpawnCountCandidates[getRandomIndex(trapSpawnCountCandidates.length)];
      if(trapSpawnCount <= 0){trapSpawnCount = 1};
      map_otherGraphicSet(trapSpawnCount,0,trapSpawnConditions);
  }
}

if($gameVariables.value(260) >= 1 && valueRegionMapArray[1] >= 1){
      let corpseSpawnCount = $gameVariables.value(260);
      corpseSpawnCount += Math.round($gameVariables.value(238)/2);
      corpseSpawnCount += getRandomIndex(4) + -2;
      if (corpseSpawnCount >= 1) {
        const arr = [70, 93, 85, 92, 91, 94, 88, 89, 95, 96];//亡骸
        for (let corpseIndex = 1; corpseIndex <= corpseSpawnCount; corpseIndex++) {
            const corpseId = arr[getRandomIndex(arr.length)];
            const corpseSpawnConditions = [corpseId,[1],[1],1,0,0,[0],[1]];
            map_otherGraphicSet(1,0,corpseSpawnConditions);
          }
  }
}

const gameVar259 = $gameVariables.value(259);
const gameVar238= $gameVariables.value(238);
const value1Arr = [-1, 78, 42, 5, 103, 104, 105, 126, 127, 128, 129]; // -1 added for to not change id10 values
for (let materialSlotId = 1; materialSlotId <= 10; materialSlotId++) {//固有素材。<CGPriority:1,1>
  const isValid = gameVar259[materialSlotId] >= 1;
  if (!isValid) continue; // 'gameVar259[id10] < 1' is not the same here for some reason :(

      let materialSpawnCount = Math.round(gameVar238);
      materialSpawnCount += getRandomIndex(6) + 5;
      if (materialSpawnCount < 1) continue;
      
      const materialId = value1Arr[materialSlotId];
      if (materialSlotId == 7) {
        if (valueRegionMapArray[3] >= 1) {
          const graphicNames = 0;
          const spawnConditions = [materialId, [1], [1], 1, 0, 3, [3], [3]];
          map_otherGraphicSet(materialSpawnCount, graphicNames, spawnConditions);
        }
      } else {
        if (valueRegionMapArray[1] >= 1) {
          const graphicNames = 0;
          const spawnConditions = [materialId, [1], [1], 1, 0, 3, [0], [1]];
          map_otherGraphicSet(materialSpawnCount, graphicNames, spawnConditions);
        }
      }
}

}

//色々動的生成設定
//const map_otherGraphicSetEndNowArray = [1, 2, 1, 1, 1, 1, 1];
//const map_otherGraphicSetEndNowArrayLen = map_otherGraphicSetEndNowArray.length;
map_otherGraphicSet = function(spawnCount,graphicNames,spawnConditions){

  if(!spawnConditions || spawnConditions.length == 0) return null;

  let j = 0;
  // BUGFIX: return the id of the event THIS call actually spawned (null when
  // every attempt failed). Callers used to read getLastSpawnEventId(), which
  // still points at the previous spawn after a failure.
  let lastSpawnedId = null;
  const gameVar210SpawnEventIdsArray = $gameVariables.value(210);
  const end = spawnCount == 0 ? $gameVariables.value(238) : spawnCount;
  const gameMap = $gameMap;
  for (let i = 1; i <= end; i++) {
    const conditionMap         = {};
    conditionMap.passable    = spawnConditions[3];
    conditionMap.screen      = spawnConditions[4];
    conditionMap.collided    = spawnConditions[5];
    conditionMap.terrainTags = spawnConditions[6];
    conditionMap.regionIds   = spawnConditions[7];
    const lastSpawnEventId = gameMap.spawnEventRandom(spawnConditions[0], conditionMap, true);
    if(!lastSpawnEventId) continue;
    const event = gameMap.event(lastSpawnEventId);
    if(!event) continue;//生成位置が見つからず生成されていない場合は前回の生成IDの誤登録も避ける
    lastSpawnedId = lastSpawnEventId;
    gameVar210SpawnEventIdsArray.push(lastSpawnEventId);
    if(graphicNames){
      event.setImage(graphicNames[getRandomIndex(graphicNames.length)],getRandomIndex(8) + 0);
    }
    event.setMoveSpeed(spawnConditions[1][Math.floor(Math.random() * spawnConditions[1].length)]);//1-6
    event.setMoveFrequency(spawnConditions[2][Math.floor(Math.random() * spawnConditions[2].length)]);//1-5
    
    //j += map_otherGraphicSetEndNowArray[getRandomIndex(map_otherGraphicSetEndNowArrayLen)];
    j += Math.random() < 0.14 ? 2 : 1; // 14% 1 of 7
	if(i + j >= end){
      break;
    }
  }
  return lastSpawnedId;
}

//マップイベント消去メモタグで指定
map_eventErase = function(metaKey){

const eventsCount = $gameMap.events().length;
const start = eventsCount >= 90 ? 200 : 100;
for (var id = start; id > 0; id--) {
  const ev = $gameMap.event(id);
  if (!!ev && ev.event().meta[metaKey]) {
    $gameMap.eraseEvent(id);
  }
}

};

//シーン時にアクターイベント生成とＩＤ記憶
event_respawnSetA = function(charaSlotId,posX,posY,zoomFlag,direction){
  const actor = $gameActors.actor(charaSlotId);
  if(!actor) return;
  event_respawnSetAN(charaSlotId, posX, posY, zoomFlag, direction, charaSlotId + 20, actor.characterName(), actor.characterIndex(), 0);
};

//シーン時にＮＰＣイベント生成とＩＤ記憶event_respawnSetN(11,x,y,0,'People1',0);
event_respawnSetN = function(charaSlotId,posX,posY,zoomFlag,imageName,imageIndex,direction){
  event_respawnSetAN(charaSlotId, posX, posY, zoomFlag, direction, 40, imageName, imageIndex, 1);
};

/*:
 * Merged code of event_respawnSetA and event_respawnSetN
 * @function
 * @param {integer} an
*/
event_respawnSetAN = function (charaSlotId, posX, posY, zoomFlag, direction, id0, imageName, imageIndex, an) {

  const existingEventId = $gameMap.eventIdXy(posX, posY);
  if (existingEventId >= 1) {
    const ev = $gameMap.event(existingEventId);
    if (!ev.event().meta['Respawn']) {
      if (an === 0 || !ev.isThrough()) {
        $gameMap.eraseEvent(existingEventId);
      };
    };
  };

  $gameMap.spawnEvent(id0, posX, posY, true);
  const eventId = $gameMap.getLastSpawnEventId();
  const gameVar292 = $gameVariables.value(292);
  gameVar292[charaSlotId] = eventId;
  const event = $gameMap.event(gameVar292[charaSlotId]);
  if(!event) return;
  event.setImage(imageName, imageIndex);
  if ([2, 4, 6, 8].some(function (directionValue) { return direction == directionValue })) {
    event.setDirection(direction);
  };
  
  if (zoomFlag == 1) {
    drowsepost.camera.zoom(1, 60, gameVar292[charaSlotId]);
    if (an === 0) $gameSystem._listenerEvent = gameVar292[charaSlotId];
    //$gamePlayer.setTransparent(true);
  };

};

//シーン時に道具イベント生成。0一時指定ID-生成済みID指定で生成省略,1ﾌｧｲﾙ名2ｲﾝﾃﾞｯｸｽ3方向4ﾊﾟﾀｰﾝ5x6y
goodsEvent_respawn = function(charaSlotId,imageName,imageIndex,direction,pattern,posX,posY){

let eventId;
if($gameVariables.value(292)[charaSlotId] == 0){
  $gameMap.spawnEvent(102, posX, posY, true);
  eventId = $gameMap.getLastSpawnEventId();
  $gameVariables.value(292)[charaSlotId] = eventId;
} else {
  eventId = $gameVariables.value(292)[charaSlotId];
};

goodsEvent_imageChange(eventId, imageName, imageIndex, direction, pattern);

};

//イベントを指定してグラ変更id1ﾌｧｲﾙ名id2ｲﾝﾃﾞｯｸｽid3方向id4ﾊﾟﾀｰﾝ
//goodsEvent_imageChange(this._eventId,'Goods7',5,8,1);
goodsEvent_imageChange = function(eventId,imageName,imageIndex,direction,pattern){

const event = $gameMap.event(eventId);
if(!event) return;
event.setDirectionFix(false);
event.setImage(imageName, imageIndex);
event.setDirection(direction);
event.setPattern(pattern);
event._originalPattern = pattern;
event.setDirectionFix(true);

};

//パーティメンバーのキャラチップを主人公の周囲に出現させる。16人分。集合させないキャラ用に$dataActorsメタに記述<NoPartyEntry>
event_partyCharaEntry = function(){

if($gameVariables.value(292) == 0){
  $gameVariables.setValue(292,Array(51).fill(0));
};
const gameVar292 = $gameVariables.value(292);
const positionOffsets = [[1,1],[1,-1],[1,2],[1,-2],[-1,1],[-1,-1],[-1,2],[-1,-2],[2,1],[2,-1],[2,2],[2,-2],[-2,1],[-2,-1],[-2,2],[-2,-2]];
const start = $gameVariables.value(75);
const end = $gameVariables.value(76);
const gameVar530 = $gameVariables.value(530);
for (let i = start; i <= end; i++) {
  const actor = $gameActors.actor(i);
  const isValid = !!actor && gameVar530 !== i && actor.isLearnedSkill(18);
  if (!isValid) continue;

  if (gameVar530 == 0) {
    if (positionOffsets.length < 1) continue;
    const x = $gamePlayer.x;
    const y = $gamePlayer.y;
    const positionOffset = positionOffsets[getRandomIndex(positionOffsets.length)];//ID
    const index = positionOffsets.findIndex(candidateOffset => candidateOffset === positionOffset);
    if (index >= 0) {
      positionOffsets.splice(index, 1);
    }
    event_respawnSetA(i, x + positionOffset[0], y + positionOffset[1], 0, 0);
  } else {
    let placedCount = 0;
    for (let j = 0; j <= 10; j++) {
      if (placedCount == 0 && positionOffsets.length >= 1) {
        const ev = $gameMap.event(gameVar292[gameVar530]);
        if(!ev) break;
        const x = ev.x;
        const y = ev.y;
        const positionOffset = positionOffsets[getRandomIndex(positionOffsets.length)];//ID
        const index = positionOffsets.findIndex(candidateOffset => candidateOffset === positionOffset);
        if (index >= 0) {
          positionOffsets.splice(index, 1);
        };
        const terrainTagValue = $gameMap.terrainTag(x + positionOffset[0], y + positionOffset[1]);
        if (terrainTagValue == 1) {
          event_respawnSetA(i, x + positionOffset[0], y + positionOffset[1], 0, 0);
          placedCount += 1;
        }
      }
    }
  }
}

}

//パーティメンバーキャラチップを一括で同じ動作event_partyCharaMove(3,0); event_partyCharaMove(45,"UP: 10;");
event_partyCharaMove = function(moveRouteCode,moveRouteParameters){

for (let i = 1; i <= 15; i++) {
  const eventId = $gameVariables.value(292)[i];
  const isValid = eventId >= 1;
  if (!isValid) continue;

  event_partyMoveEventForceMoveRoute(moveRouteCode, moveRouteParameters, eventId, 'Actor');
}

}

//メモタグ指定で一括で同じ動作event_NpcCharaMove(3,0,'Actor'); event_NpcCharaMove(45,"UP: 10;",'Actor');
event_NpcCharaMove = function(moveRouteCode,moveRouteParameters,metaName){

  for (var id = 200; id > 0; id--) {
    event_partyMoveEventForceMoveRoute(moveRouteCode, moveRouteParameters, id, metaName);
  };
};

// merged forceMoveRoute of event_partyCharaMove and event_NpcCharaMove and event_NpcCharaMoveId
event_partyMoveEventForceMoveRoute = function (moveRouteCode, moveRouteParameters, eventId, metaName) {

  const event = $gameMap.event(eventId);
  const isValid = !!event && (metaName === '' || event.event().meta[metaName]);
  if (!isValid) return;

  //WARN! both forceMoveRoute below is identical! useless condition id1 == 45 , typo?
  event.forceMoveRoute({
    "list": [
      { "code": moveRouteCode, "parameters": [moveRouteParameters] },
      { "code": 0 }], "repeat": false, "skippable": true
  });
  // if (id1 == 45) {
  //   event.forceMoveRoute({
  //     "list": [
  //       { "code": id1, "parameters": [id2] },
  //       { "code": 0 }], "repeat": false, "skippable": true
  //   });
  // } else {
  //   event.forceMoveRoute({
  //     "list": [
  //       { "code": id1, "parameters": [id2] },
  //       { "code": 0 }], "repeat": false, "skippable": true
  //   });
  // }

}

//id指定でevent_NpcCharaMoveId(3,0,arr1); event_NpcCharaMoveId(45,"UP: 10;",arr1);
event_NpcCharaMoveId = function(moveRouteCode,moveRouteParameters,eventIds){

  for (var id = 0; id < eventIds.length; id++) {
    event_partyMoveEventForceMoveRoute(moveRouteCode, moveRouteParameters, eventIds[id], '');
  };
};

//パーティメンバーを一括消去
event_partyCharaErase = function(){

var start = 1;
var end = 15;
for (var i = start; i <= end; i++) {
  if($gameVariables.value(292)[i] >= 1){
    if(!!$gameMap.event($gameVariables.value(292)[i])) {
      $gameMap.eraseEvent($gameVariables.value(292)[i]);
}}};

};

//扉チップの開閉event_doorOpenClose(1,5);event_doorOpenClose(2,5);
event_doorOpenClose = function(isOpenFlag,eventId){

  const isOpen = isOpenFlag == 1;
  if (!!$gameMap.event(eventId)) {
    const turnSideCodeA = isOpen ? 17 : 18;
    const turnSideCodeB = isOpen ? 18 : 17;
    const turnFacingCode = isOpen ? 19 : 16;
    $gameMap.event(eventId).forceMoveRoute({
      "list": [
        { "code": 36 }, { "code": turnSideCodeA }, { "code": 15, "parameters": [5] },
        { "code": turnSideCodeB }, { "code": 15, "parameters": [5] },
        { "code": turnFacingCode }, { "code": 15, "parameters": [5] },
        { "code": 35 }, { "code": 15, "parameters": [5] },
        { "code": 0 }], "repeat": false, "skippable": false
    });
    event_doorOpenCloseSe(isOpenFlag, eventId);
  }
}

//扉チップの開閉の際の効果音
event_doorOpenCloseSe = function(isOpenFlag,eventId){

  if (!!$gameMap.event(eventId)) {
    const isOpen = isOpenFlag == 1;
    const openPitch = isOpen ? 100 : 150;
    const gatePitch = isOpen ? 100 : 70;
    const n = isOpen ? 'Open' : 'Close';

    let seParams = [n + '1', 90, openPitch];
    if ($gameMap.event(eventId).characterName() == '!$fsm_Door06') {
      seParams = ['Z_clothesTakeOff', 100, 80];
    }
    else if ($gameMap.event(eventId).characterName() == '!Door1' && $gameMap.event(eventId).characterIndex() == 5) {
      seParams = ['Z_clothesTakeOff', 100, 80];
    }
    else if ($gameMap.event(eventId).characterName() == '!Door1' && $gameMap.event(eventId).characterIndex() == 6) {
      seParams = ['Door2', 90, openPitch];
    }
    else if ($gameMap.event(eventId).characterName() == '!$SF_Gate1' || $gameMap.event(eventId).characterName() == '!$SF_Gate3') {
      seParams = [n + '3', 90, gatePitch];
    }
    else if ($gameMap.event(eventId).characterName() == '!$Gate1' || $gameMap.event(eventId).characterName() == '!$Gate2') {
      seParams = [n + '3', 90, gatePitch];
    }
    else if ($gameMap.event(eventId).characterName() == '!$SF_Gate2') {
      seParams = ['door6AutoDoorHeavy', 90, openPitch];
    }
    AudioManager.playSe({ "name": seParams[0], "volume": seParams[1], "pitch": seParams[2], "pan": 0 });
  }
};

//そのマップのNPC死体任意位置作成。ランダムはコモン162
people_bloodBodySet = function(posX,posY){

map_npcGraphicSet();
$gameMap.spawnEvent(74, posX, posY, true);
const event = $gameMap.event($gameMap.getLastSpawnEventId());
const damagePatternCandidates = [6,7];
const damagePattern = damagePatternCandidates[getRandomIndex(damagePatternCandidates.length)];
event.setImage('Damage2', damagePattern);
const gameVar36 = $gameVariables.value(36);
const charaPattern = Math.floor(Math.random() * gameVar36[1]) + gameVar36[0];
event.setImage($gameVariables.value(33)+$gameVariables.value(35), charaPattern);
event.setDirectionFix(false);
event.setDirection(8);
event.setDirectionFix(true);
$gameMap.spawnEvent(99, posX, posY, true);

};

//イベントメモタグでまとめてセルフスイッチevent_togetherSelf(this._eventId,'B');
event_togetherSelf = function(eventId,selfSwitchKey){

  const arr = [301, 302, 303, 304, 305, 306, 307, 308, 309, 310];
  const mapId = $gameMap.mapId();
  if(!$gameMap.event(eventId)) return;
  for (var id = 100; id > 0; id--) {
    if (id != eventId) {
      const ev = $gameMap.event(id);
      if (!!ev) {
        const evCharaNameId = ev.event().meta['CharaNameId'];
        if (evCharaNameId) {
          if (Number($gameMap.event(eventId).event().meta['CharaNameId']) == Number(evCharaNameId)) {
            if (arr.some(function (excludedEventId) { return id == excludedEventId })) { } else {
              $gameSelfSwitches.setValue([mapId, id, selfSwitchKey], true);
            };
          }
        }
      }
    }
  }
}

//ｲﾝｼﾞｹｰﾀｰ発生消去event_charaIndicators(1,this._eventId,'Arrow',0,-10,3,10);
//0で0消去1ｱﾆﾒ発生,1ｲﾍﾞﾝﾄid,2ﾌｧｲﾙ名,3x4y,5枚数,6速度
event_charaIndicators = function(modeId,eventId,indicatorIcon,indicatorX,indicatorY,frameStart,frameEnd){

const char = $gameMap.event(eventId);
if(!char) return;
if(modeId == 0){
  char.clearIndicators();
  char._indData.ref = true;
}
else if(modeId == 1){
  char.setIndicators(indicatorIcon,0,false,0,0,"",0,false,false,0,true,indicatorX,indicatorY);
  char._indData.ref = true;
  char._indData.fontSize = 28;
  char._indData.ref = true;
  char._indData.animated = true;
  char._indData.frames = [0,frameStart,0,frameEnd]; 
}

}


//動物食材指定
animal_IngredientsSelect = function(eventId){

let dropItemId = 1271;
const animalEvent = $gameMap.event(eventId);
if(!animalEvent) return;
const eventCharaName = animalEvent._characterName;
if(eventCharaName.match(/Pig/)){dropItemId = 1272}
else if(eventCharaName.match(/Horse/)){dropItemId = 1273}
else if(eventCharaName.match(/Cow/)){dropItemId = 1274}
else if(eventCharaName.match(/Sheep/)){dropItemId = 1275}
else if(eventCharaName.match(/Chicken/)){dropItemId = 1276}
else if(eventCharaName.match(/Goat/)){dropItemId = 1277}
else if(eventCharaName.match(/Monkey/)){dropItemId = 1283}
else if(eventCharaName.match(/Bear/)){dropItemId = 1278}
else if(eventCharaName.match(/Deer/)){dropItemId = 1279}
else if(eventCharaName.match(/Boar/)){dropItemId = 1280}
else if(eventCharaName.match(/BigCat/)){dropItemId = 1283}
else if(eventCharaName.match(/Cow/)){dropItemId = 1274}
else if(eventCharaName.match(/Crab/)){dropItemId = 1281}
else if(eventCharaName.match(/Frog/)){dropItemId = 1282}
else if(eventCharaName.match(/fish/)){dropItemId = 1286}
else if($gameSwitches.value(258) && eventCharaName.match(/Cow/)){dropItemId = 1288};

valueDropItems = dropItemId;
valueanimalEventId = eventId;

};

//動物反応指定
animal_ActionSelect = function(eventId){

let hasReaction = 0;
let reactionText = ``;
const animalEvent = $gameMap.event(eventId);
if(!animalEvent) return;
const eventCharaName = animalEvent._characterName;
if(eventCharaName.match(/Pig/)){hasReaction = 1;reactionText = `ブヒっ`}
else if(eventCharaName.match(/Horse/)){AudioManager.playSe({"name":'Horse',"volume":70,"pitch":100,"pan":0})}
else if(eventCharaName.match(/Cow/)){AudioManager.playSe({"name":'Cow',"volume":70,"pitch":100,"pan":0})}
else if(eventCharaName.match(/Sheep/)){hasReaction = 1;reactionText = `メェっ…`}
else if(eventCharaName.match(/Chicken/)){AudioManager.playSe({"name":'Chicken',"volume":70,"pitch":100,"pan":0})}
else if(eventCharaName.match(/Goat/)){hasReaction = 1;reactionText = `メェ～～っ`}
else if(eventCharaName.match(/Monkey/)){hasReaction = 1;reactionText = `ウキィっ！`}
else if(eventCharaName.match(/Bear/)){AudioManager.playSe({"name":'Monster6',"volume":70,"pitch":80,"pan":0})}
else if(eventCharaName.match(/Deer/)){hasReaction = 1;reactionText = `ピィっ`}
else if(eventCharaName.match(/Boar/)){hasReaction = 1;reactionText = `ブルルゥっ！`}
else if(eventCharaName.match(/BigCat/)){AudioManager.playSe({"name":'Monster1',"volume":70,"pitch":120,"pan":0})}
else if(eventCharaName.match(/Cow/)){AudioManager.playSe({"name":'Cow',"volume":70,"pitch":100,"pan":0})}
else if(eventCharaName.match(/Crab/)){hasReaction = 1;reactionText = `カニィっ`}
else if(eventCharaName.match(/Frog/)){AudioManager.playSe({"name":'Frog',"volume":70,"pitch":100,"pan":0})}
else if(eventCharaName.match(/fish/)){//魚はリアクション無し
};

if(hasReaction === 1){
  valueanimalEvent2Id = reactionText;
};

};

//エネミーステートでドロップ
//enemy_drop = function(user,enemy){

//};

//}());
