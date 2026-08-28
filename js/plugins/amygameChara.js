/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//☆☆キャラチップに一言台詞chara_oneWord(valueSerialPictureId,this._eventId,25,60,arr1,arr2,arr3);
chara_oneWord = function(id1,id2,id3,id4,arr1,arr2,arr3,id6){

//WARN: both are identical!
// if(id4 >= 100){
//   picture_motion1("smooth",[0]);
// } else {
//   picture_motion1("smooth",[0]);
// };
picture_motion1("smooth", [0]);

const randomLine = arr3[getRandomIndex(arr3.length)];
$gameScreen.setDTextPicture(randomLine, id3);
$gameScreen.dWindowFrame = 'ON';
if(id6 == 0){}else{$gameScreen.setDtextFont(id6)};
$gameScreen.dTextAlign = 1;

let screenXPos;
let screenYPos;
if(!!$gameMap.event(id2)) {
  const ev = $gameMap.event(id2);
  screenXPos = ev.screenX() * $gameScreen.zoomScale();
  screenYPos = (ev.screenY() - 70) * $gameScreen.zoomScale();
} else {
  screenXPos = 640;
  screenYPos = 384;
};

const randXOffset = arr1[getRandomIndex(arr1.length)];
const randYOffset = arr2[getRandomIndex(arr2.length)];
$gameScreen.showPicture(id1,"",1,screenXPos+randXOffset,screenYPos+randYOffset,50,50,255,0);
$gameScreen.movePicture(id1,1,screenXPos+randXOffset,screenYPos+randYOffset,150,150,0,0,id4);

};

//プレイヤー（イベント）の向き対応座標x,y,id1が2で正面,8が背後,4が左,6が右
event_charaDirectionPoint = function(event,id1){

valueDirectionPointX = event._realX;
valueDirectionPointY = event._realY;
const eventDirection = event.direction();
if(id1 == 2){
  if(eventDirection == 2){valueDirectionPointY += 1}
  else if(eventDirection == 4){valueDirectionPointX -= 1}
  else if(eventDirection == 6){valueDirectionPointX += 1}
  else if(eventDirection == 8){valueDirectionPointY -= 1};
}
else if(id1 == 8){
  if(eventDirection == 2){valueDirectionPointY -= 1}
  else if(eventDirection == 4){valueDirectionPointX += 1}
  else if(eventDirection == 6){valueDirectionPointX -= 1}
  else if(eventDirection == 8){valueDirectionPointY += 1};
}
else if(id1 == 4){
  if(eventDirection == 2){valueDirectionPointX += 1}
  else if(eventDirection == 4){valueDirectionPointY += 1}
  else if(eventDirection == 6){valueDirectionPointY -= 1}
  else if(eventDirection == 8){valueDirectionPointX -= 1};
}
else if(id1 == 6){
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
    const arr1 = [$gameMap.mapId(),valueDirectionPointX,valueDirectionPointY];
    $gameVariables.setValue(171,arr1);
  }
} else {
  $gameVariables.setValue(171,0);
}
$gameVariables.setValue(528,100);

}

event_charaZanzou = function(id1,id2){

if(!!$gameMap.event(id1)) {
  var event = $gameMap.event(id1);
  var arr1 = [event.characterName(),event.characterIndex(),event._realX,event._realY,event.direction()];
  $gameMap.spawnEvent(195, Number(arr1[2]), Number(arr1[3]), true);
  var eventId = $gameMap.getLastSpawnEventId();
  var event = $gameMap.event(eventId);
  event.setImage(arr1[0], Number(arr1[1]));
  event.setDirection(Number(arr1[4]));
  event.setTone(30, 30, 255);
  event.setOpacity(200);
  event.setBlendMode(1);
  $gameVariables.value(292)[id2] = eventId;
};

};

event_charaRoot = function(id1){

if(!!$gameMap.event(id1)) {
  $gameMap.event(id1).forceMoveRoute({
  "list":[
  {"code":15, "parameters":[600]},
  {"code":0}],"repeat":true,"skippable":true});
};

};

event_charaPreset = function(id1){

if(!!$gameMap.event(id1)) {
  var char = $gameMap.event(id1);
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
    let arr1 = [2, 4, 6, 8];
    foodIndex = arr1[getRandomIndex(arr1.length)];
    event.setDirection(foodIndex);//2,4,6,8
    arr1 = [0, 1, 2];
    foodIndex = arr1[getRandomIndex(arr1.length)];
    event.setPattern(foodIndex);//0,1,2
    event._originalPattern = foodIndex;
    event.setDirectionFix(true);//向き固定
  }
  else if (eventEvent.meta['decorationFood']) {
    const arr2 = [[1, 5, 8, 1], [1, 5, 8, 2], [1, 6, 8, 0], [1, 6, 8, 1], [2, 0, 2, 1], [2, 1, 2, 2], [2, 0, 6, 0], [2, 0, 6, 1]];
    const arr1 = arr2[getRandomIndex(arr2.length)];
    event.setDirectionFix(false);
    event.setImage('food_' + arr1[0], arr1[1]);
    event.setDirection(arr1[2]);
    event.setPattern(arr1[3]);//0,1,2不要
    event._originalPattern = arr1[3];
    event.setDirectionFix(true);
  }
  else if (eventEvent.meta['Alcol']) {
    const arr2 = [[0, 6, 0], [0, 6, 1], [0, 6, 2], [1, 4, 1], [1, 4, 2], [2, 4, 0], [2, 4, 1]];
    const arr1 = arr2[getRandomIndex(arr2.length)];
    event.setDirectionFix(false);
    event.setImage('food_2', arr1[0]);
    event.setDirection(arr1[1]);
    event.setPattern(arr1[2]);//0,1,2不要
    event._originalPattern = arr1[2];
    event.setDirectionFix(true);
  }
  else if (eventEvent.meta['foodPlate']) {
    const arr2 = [[2, 0, 8, 0], [2, 0, 8, 1], [2, 0, 8, 1], [2, 1, 8, 0], [2, 1, 8, 1], [2, 1, 8, 2], [2, 2, 8, 0], [2, 2, 8, 1]];
    const arr1 = arr2[getRandomIndex(arr2.length)];
    event.setDirectionFix(false);
    event.setImage('food_' + arr1[0], arr1[1]);
    event.setDirection(arr1[2]);
    event.setPattern(arr1[3]);//0,1,2不要
    event._originalPattern = arr1[3];
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
    const arr1 = [45, 135, -45, -135];
    const bloodAngle = arr1[getRandomIndex(arr1.length)];
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
      const arr1 = eventEvent.meta['BossGura'].split(',');
      const arr2 = $dataEnemies[Number(arr1[1])].meta['BossGura'] ? $dataEnemies[Number(arr1[1])].meta['BossGura'].split(',') : [20, 30, 0.2];
      valueBossCharaGura = [id, $dataEnemies[Number(arr1[1])].meta['BossEnemy'].split(',')[2], Number(arr2[0]), Number(arr2[1]), Number(arr2[2])];
      boss_charaGuraCGSet(valueBossCharaGura);
    }
    if (eventEvent.meta['BossGura2']) {
      //let moveRouteCode = 0;
      const arr2 = eventEvent.meta['BossGura2'].split(',');
      valueBossCharaGura = [id, arr2[0], Number(arr2[1]), Number(arr2[2]), Number(arr2[3])];
      boss_charaGuraCGSet(valueBossCharaGura);
      //event.setOpacity(255);
    }
    if (eventEvent.meta['Charalight']) {
      const arr1 = eventEvent.meta['Charalight'].split(',');
      eventEvent.moveLight(Number(arr1[0]), Number(arr1[1]), Number(arr1[2]), Number(arr1[3]));
    }
    if (eventEvent.meta['PerspectiveA']) {
      let hideIndicator = 0;
      const arr1 = eventEvent.meta['PerspectiveA'].split(',');
      for (let i = 0; i <= arr1.length - 1; i++) {
        if (Number(arr1[i]) <= 0) { hideIndicator = 1 } else {
          if ($gameSwitches.value(Number(arr1[i]) + 440)) {
            hideIndicator = 1;
          }
        }
      }
      if (hideIndicator == 0) { eraseFlag = 1 };
    }

    if (eventEvent.meta['EvSceneSet']) {//<EvSceneSet:401,1,0>1で達成時に消去で2なら消去なし。0で♡1で笑-1でなし
      let hideIndicator = 0;
      const arr1 = eventEvent.meta['EvSceneSet'].split(',');
      const sceneItemId = Number(arr1[0]);
      let incidenceSw = 0;//発生
      let compSw = 0;//達成
      let indIcon = 'h';//イベアイコン
      if (sceneItemId >= 401 && sceneItemId <= 500) { incidenceSw = sceneItemId + 800; compSw = sceneItemId + 900 };
      if (sceneItemId >= 501 && sceneItemId <= 600) { incidenceSw = sceneItemId + 500; compSw = sceneItemId + 600 };
      if ($dataItems[sceneItemId].meta['AddEventIncidenceSwi']) {
        incidenceSw = Number($dataItems[sceneItemId].meta['AddEventIncidenceSwi']);
      };
      if ($dataItems[sceneItemId].meta['AddEventCompSwi']) {
        compSw = Number($dataItems[sceneItemId].meta['AddEventCompSwi']);
      };
      if (incidenceSw <= 1) { hideIndicator = 1 };
      if ($gameSwitches.value(incidenceSw)) { hideIndicator = 1 };
      if (Number(arr1[1]) == 1 && $gameSwitches.value(compSw)) { hideIndicator = 0 };
      if (hideIndicator == 0) {
        eraseFlag = 1;
      } else {
        const arr2Num = Number(arr1[2]);
        if (arr2Num == 0) { indIcon = 'h' };
        if (arr2Num == 1) { indIcon = 'h1' };
        if (arr2Num == 2) { indIcon = 't' };
        if (arr2Num == 3) { indIcon = 'e' };
        if (arr2Num == -1) { indIcon = null };
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
      const arr1 = eventEvent.meta['EvStartSw'].split(',');
      for (let i = 0; i < arr1.length; i++) {
        if (Number(arr1[i]) <= 1) { hideIndicator = 1 } else {
          if ($gameSwitches.value(Number(arr1[i]))) {
            hideIndicator = 1;
          }
        }
      }
      if (hideIndicator == 0) { eraseFlag = 1 };
    }
    if (eventEvent.meta['EvEndSw']) {
      const arr1 = eventEvent.meta['EvEndSw'].split(',');
      for (let i = 0; i < arr1.length; i++) {
        if (Number(arr1[i]) >= 1) {
          if ($gameSwitches.value(Number(arr1[i]))) {
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
      const arr1 = eventEvent.meta['EvEraseMain'].split(',');
      for (let i = 0; i <= arr1.length - 1; i++) {
        if (Number(arr1[i]) >= 1) {
          if ($gameVariables.value(135) == Number(arr1[i])) {
            eraseFlag = 1;
            break;
          }
        }
      }
    }
    if (eventEvent.meta['EvESSOn']) {
      //let character = event;
      const arr1 = eventEvent.meta['EvESSOn'].split(',');
      for (let i = 0; i <= arr1.length - 1; i++) {
        const arr1iNum = Number(arr1[i]);
        if (arr1iNum >= 501 && arr1iNum <= 600) {
          if ($gameSwitches.value(arr1iNum + 500) && !$gameSwitches.value(arr1iNum + 600)) {
            eraseFlag = 1;
            break;
          }
        }
        else if (arr1iNum >= 401 && arr1iNum <= 500) {
          if ($gameSwitches.value(arr1iNum + 800) && !$gameSwitches.value(arr1iNum + 900)) {
            eraseFlag = 1;
            break;
          }
        }
      }
    }
    if (eventEvent.meta['EvEraseItem']) {
      //let character = event;
      let arr1 = eventEvent.meta['EvEraseItem'].split(',');
      for (let i = 0; i <= arr1.length - 1; i++) {
        if (Number(arr1[i]) >= 1) {
          if ($gameParty.hasItem($dataItems[Number(arr1[i])], true)) {
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
      const ids1 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (const num of ['', '1']) {
        if (!eventEvent.meta['H' + num + 'sw1']) continue;

        for (const id1 of ids1) {
          const hswX = eventEvent.meta['H' + num + 'sw' + id1];
          if (!hswX) continue;

          const hswXArr = eventEvent.meta['H' + num + 'sw' + id1].split(',');
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
map_npcRespawn = function(id2,id3){

let spawnCount = 1;
if(valueRegionMapArray[spawnCount] < 1) return;

if(id2 == 0){
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
if(id2 == 0 && $gameVariables.value(235) > spawnCount){
  spawnCount = 0;
};
let j = 0;
if(!$gameSwitches.value(140) ||
$gameParty.inBattle() ||
spawnCount < 1 ||
$gameVariables.value(202).some(function (id) { return $gameMap.mapId() == id })) return;

  for (let id1 = 1; id1 <= spawnCount; id1++) {
    let sourceEventId = id3;
    if(id3 == 0){
      map_npcGraphicSet();
      sourceEventId = [52,55][getRandomIndex(2)];//テンプレ元イベントID
    }
    const conditionMap         = {};
    conditionMap.passable    = 1;
    conditionMap.screen      = 0;
    conditionMap.collided    = 3;
    conditionMap.terrainTags = [0];
    conditionMap.regionIds   = [1];
    $gameMap.spawnEventRandom(sourceEventId, conditionMap, true);
    const lastSpawnEventId = $gameMap.getLastSpawnEventId();
    const charaEventToRespawn = $gameMap.event(lastSpawnEventId);
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

    const npcOpacity = id2 == 0 ? 0/*初期透明度*/ : 255;
    charaEventToRespawn.setOpacity(npcOpacity);

    const npcMoveSpeed = $gameVariables.value(37);//移動速度
    charaEventToRespawn.setMoveSpeed(npcMoveSpeed);

    const npcMoveFrequency = sourceEventId == 52 ? //移動頻度。直線かランダムで変更。
      [3, 4, 5][getRandomIndex(3)]
      : $gameVariables.value(34);
    charaEventToRespawn.setMoveFrequency(npcMoveFrequency);

    $gameVariables.setValue(235,$gameVariables.value(235) + 1);
    j += [1,2,1,2,1,1,2][getRandomIndex(7)];

    if (id1 + j >= spawnCount) break;
  }

};

//エネミー動的生成。0通常。1エロ。map_enemyRespawn(0);
map_enemyRespawn = function(id2){

let enemySpawnCount = 1;
if(valueRegionMapArray[enemySpawnCount] < 1) return;

//$gameVariables.value(334);//最大数
//$gameVariables.value(335);//討伐数
  if($gameSwitches.value(655) && !$gameSwitches.value(216)  && $gameVariables.value(335) >= $gameVariables.value(334)){
    $gameVariables.setValue(335,0);
  };
  const originalEventId = id2 == 0 ? 16 : 17;//元イベントID
  const maxOccurNum = id2 == 0 ? 224 : 227;//最大出現数変数
  const appearance = id2 == 0 ? 222 : 226;//現在出現数変数

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
  if(id2 == 1){
    if(!$gameSwitches.value($gameVariables.value(236))){
      enemySpawnCount = 0;
    };
  };
  //var j = 0;//
  if (!$gameSwitches.value(140) ||
    $gameParty.inBattle() ||
    enemySpawnCount < 1 ||
    $gameVariables.value(202).some(function (id) { return $gameMap.mapId() == id })) return;

      for (let id1 = 1; id1 <= enemySpawnCount; id1++) {
        const conditionMap       = {};
        conditionMap.passable    = 1;
        conditionMap.screen      = 0;
        conditionMap.collided    = 3;
        conditionMap.terrainTags = [1];
        conditionMap.regionIds   = [1];        
        $gameMap.spawnEventRandom(originalEventId, conditionMap, true);

        const enemyEventToRespawn = $gameMap.event($gameMap.getLastSpawnEventId());
        enemyEventToRespawn._trigger = 2; // spawned enemy will attack player, trigger set to event touch
        enemyEventToRespawn.setImage($dataItems[$gameVariables.value(240)].meta.EnemyGraphic.split(',')[0], 
        Number($dataItems[$gameVariables.value(240)].meta.EnemyGraphic.split(',')[1]));
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
        if(id2 == 1){
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
        if(id2 == 1 || $gameSwitches.value(493)){
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
        $gameVariables.value(537).push($gameMap.getLastSpawnEventId());
        $gameVariables.setValue(appearance,$gameVariables.value(appearance) + 1);
      }
};

//動物動的生成設定
map_animalGraphicSet = function(id1){

  if (id1 !== 0) return;

  let arr1 = 0;
  let arr2 = 0;
  const gameSwitch15 = $gameSwitches.value(15);
  if($gameSwitches.value(366)){//夜梟、飛行or待機
    const rnd0or1 = getRandomIndex(2);
      if(rnd0or1 == 0){
        if(valueRegionMapArray[1] >= 1){ 
          arr1 = ["ZanimalForestNightOwl1"];
          arr2 = [62,[3,4],[5],0,0,3,[0],[1]];
        };
      } else {
        if(valueRegionMapArray[2] >= 1){
          arr1 = ["ZanimalForestNightOwl2"];
          arr2 = [63,[1],[1],0,0,3,[0],[2]];
        };
      };
      if(gameSwitch15){map_otherGraphicSet(id1,arr1,arr2)};
  }
  if($gameSwitches.value(365) && valueRegionMapArray[3] >= 1){//水棲
    arr1 = ["ZannimalWatersideCrab1","ZannimalWatersideFrog2"];
    arr2 = [59,[3,4],[2,3],0,0,3,[3],[3]];
    map_otherGraphicSet(id1,arr1,arr2);
  }
  if($gameSwitches.value(364) && valueRegionMapArray[1] >= 1){//野生動物
    arr1 = ["ZanimalWildCow1","ZanimalWilddeer1","ZanimalWildMonkey1","ZanimalWildBoar1","ZanimalWildBigCat1","ZanimalWildGoat1","ZanimalWildBear1"];
    arr2 = [58,[3,4],[2,3,4],1,0,3,[0],[1]];
    map_otherGraphicSet(id1,arr1,arr2);
  }
  if(valueRegionMapArray[4] >= 1){//家畜動物
    arr1 = ["ZanimalLivestockPig1","ZanimalLivestockHorse1","ZanimalLivestockCow1","ZanimalLivestockCow2","ZanimalLivestockGoat1","ZanimalLivestockSheep1","ZanimalLivestockChicken1"];
    arr2 = [57,[3,4],[2,3,4],1,0,3,[0],[4]];
    map_otherGraphicSet(id1,arr1,arr2);
  }
  if($gameSwitches.value(362) && valueRegionMapArray[3] >= 1){//魚
    arr1 = ["Zanimaltinyfish"];
    arr2 = [47,[3,4,5],[4,5],0,0,3,[3],[3]];
    if(!gameSwitch15){map_otherGraphicSet(id1,arr1,arr2)};
  }
  if($gameSwitches.value(202) && $gameSwitches.value(203) && $gameVariables.value(238) >= 2){//街中、町屋外、広さ一定
    if (gameSwitch15) {
      if (valueRegionMapArray[2] >= 1) {
        //夜。伏せ動物
        arr1 = ["ZanimalNight"];
        arr2 = [56, [1, 2], [1, 2], 0, 0, 3, [0], [2]];
        map_otherGraphicSet(id1, arr1, arr2);
      }
    } else if (valueRegionMapArray[1] >= 1) {
      //鳥
      arr1 = ["!flyingsmallbirds"];
      arr2 = [44, [3, 4], [5], 1, 0, 3, [0], [1]];
      map_otherGraphicSet(id1, arr1, arr2);

      if (!$gameSwitches.value(361)) {
        //犬猫
        arr1 = ["ZanimalCat1", "ZanimalCat2", "ZanimalDog1", "ZanimalDog2", "ZanimalCat3"];
        arr2 = [45, [2, 3, 4], [2, 3, 4], 1, 0, 3, [0], [1]];
        map_otherGraphicSet(id1, arr1, arr2);

        //蝶
        arr1 = ["ZanimalButterflys"];
        arr2 = [46, [2, 3, 4], [5], 1, 0, 3, [0], [1]];
        map_otherGraphicSet(id1, arr1, arr2);
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
if($gameSwitches.value(201)){
  for (var i = 1; i <= 9; i++) {
    if(value.meta['warpPoint' + i]){
      var arr2 = value.meta['warpPoint' + i].split(',');
      var warpEventId = 131;//ワープ魔方陣<warpPoint1:1,1,1>
      var targetMapId = Number(arr2[0]);
        if(targetMapId == $gameMap.mapId()){
         $gameMap.spawnEvent(warpEventId, Number(arr2[1]), Number(arr2[2]), true);
           if($gameVariables.value(211)[$gameVariables.value(240)][i] == 1){
             $gameSelfSwitches.setValue([$gameMap.mapId(), $gameMap.getLastSpawnEventId(), 'A'], true);
           };
        };
    };
  };
  if(value.meta['warpStart']){
    var arr2 = value.meta['warpStart'].split(',');
      var warpEventId = 132;//ワープ魔方陣。入口<warpStart:1,1,1>
      var targetMapId = Number(arr2[0]);
        if(targetMapId == $gameMap.mapId()){
         $gameMap.spawnEvent(warpEventId, Number(arr2[1]), Number(arr2[2]), true);
      };
  };
  if(value.meta['TchestOnly']){
    var arr2 = value.meta['TchestOnly'].split(',');
      var warpEventId = 113;//レア宝箱
      var targetMapId = Number(arr2[0]);
        if(targetMapId == $gameMap.mapId()){
         $gameMap.spawnEvent(warpEventId, Number(arr2[1]), Number(arr2[2]), true);
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
		
		const arr2 = [18+n,[1],[1],1,0,3,[0],[1]];//小銭生成
		const var238 = $gameVariables.value(238);
		const array1 = [var238-2, var238-1, var238, var238+1];
      let coinSpawnCount = array1[getRandomIndex(array1.length)];
      if(coinSpawnCount < 1) coinSpawnCount = 1 ;
      map_otherGraphicSet(coinSpawnCount, 0, arr2);
	  }
  }
}

if($gameSwitches.value(201)){
  $gameVariables.setValue(536,[]);//宝箱生成Id配列
  if (valueRegionMapArray[1] >= 1) {
    const arr2 = [43,[1],[1],1,0,0,[0],[1]];//転送先
    map_otherGraphicSet(1,0,arr2);
  }
  if($gameVariables.value(215)[$gameVariables.value(240)].length >= 1 && valueRegionMapArray[8] >= 1){
      let treasureSpawnCount = Math.ceil($gameVariables.value(215)[$gameVariables.value(240)].length/$gameVariables.value(217));
      if (treasureSpawnCount > valueRegionMapArray[8]) { treasureSpawnCount = valueRegionMapArray[8] };
      const arr2 = [86,[1],[1],1,0,0,[0],[8]];
      map_otherGraphicSet(treasureSpawnCount,0,arr2);
    $gameVariables.value(536).push($gameMap.getLastSpawnEventId());
  }
  if($gameSwitches.value(207) && $gameVariables.value(238) >= 3 && $gameVariables.value(270) >= 20 && valueRegionMapArray[1] >= 1){
    const arr2 = [20, [1], [1], 1, 0, 0, [0], [1]];//トラップ。エネミーレベル20以上
      const trapBaseVar = $gameVariables.value(238);
      const array1 = [trapBaseVar-2,trapBaseVar-1,trapBaseVar,trapBaseVar+1];
      let trapSpawnCount = array1[getRandomIndex(array1.length)];
      if(trapSpawnCount <= 0){trapSpawnCount = 1};
      map_otherGraphicSet(trapSpawnCount,0,arr2);
  }
}

if($gameVariables.value(260) >= 1 && valueRegionMapArray[1] >= 1){
      let corpseSpawnCount = $gameVariables.value(260);
      corpseSpawnCount += Math.round($gameVariables.value(238)/2);
      corpseSpawnCount += getRandomIndex(4) + -2;
      if (corpseSpawnCount >= 1) {
        const arr = [70, 93, 85, 92, 91, 94, 88, 89, 95, 96];//亡骸
        for (let id10 = 1; id10 <= corpseSpawnCount; id10++) {
            const corpseId = arr[getRandomIndex(arr.length)];
            const arr2 = [corpseId,[1],[1],1,0,0,[0],[1]];
            map_otherGraphicSet(1,0,arr2);
          }
  }
}

const gameVar259 = $gameVariables.value(259);
const gameVar238= $gameVariables.value(238);
const value1Arr = [-1, 78, 42, 5, 103, 104, 105, 126, 127, 128, 129]; // -1 added for to not change id10 values
for (let id10 = 1; id10 <= 10; id10++) {//固有素材。<CGPriority:1,1>
  const isValid = gameVar259[id10] >= 1;
  if (!isValid) continue; // 'gameVar259[id10] < 1' is not the same here for some reason :(

      let materialSpawnCount = Math.round(gameVar238);
      materialSpawnCount += getRandomIndex(6) + 5;
      if (materialSpawnCount < 1) continue;
      
      const materialId = value1Arr[id10];
      if (id10 == 7) {
        if (valueRegionMapArray[3] >= 1) {
          const arr1 = 0;
          const arr2 = [materialId, [1], [1], 1, 0, 3, [3], [3]];
          map_otherGraphicSet(materialSpawnCount, arr1, arr2);
        }
      } else {
        if (valueRegionMapArray[1] >= 1) {
          const arr1 = 0;
          const arr2 = [materialId, [1], [1], 1, 0, 3, [0], [1]];
          map_otherGraphicSet(materialSpawnCount, arr1, arr2);
        }
      }
}

}

//色々動的生成設定
//const map_otherGraphicSetEndNowArray = [1, 2, 1, 1, 1, 1, 1];
//const map_otherGraphicSetEndNowArrayLen = map_otherGraphicSetEndNowArray.length;
map_otherGraphicSet = function(id1,arr1,arr2){

  if(!arr2 || arr2.length == 0) return;

  let j = 0;
  const gameVar210SpawnEventIdsArray = $gameVariables.value(210);
  const end = id1 == 0 ? $gameVariables.value(238) : id1;
  const gameMap = $gameMap;
  for (let i = 1; i <= end; i++) {
    const conditionMap         = {};
    conditionMap.passable    = arr2[3];
    conditionMap.screen      = arr2[4];
    conditionMap.collided    = arr2[5];
    conditionMap.terrainTags = arr2[6];
    conditionMap.regionIds   = arr2[7];
    gameMap.spawnEventRandom(arr2[0], conditionMap, true);
    
	const lastSpawnEventId = gameMap.getLastSpawnEventId();
    gameVar210SpawnEventIdsArray.push(lastSpawnEventId);
    const event = gameMap.event(lastSpawnEventId);
    if(arr1){
      event.setImage(arr1[getRandomIndex(arr1.length)],getRandomIndex(8) + 0);
    }
    event.setMoveSpeed(arr2[1][Math.floor(Math.random() * arr2[1].length)]);//1-6
    event.setMoveFrequency(arr2[2][Math.floor(Math.random() * arr2[2].length)]);//1-5
    
    //j += map_otherGraphicSetEndNowArray[getRandomIndex(map_otherGraphicSetEndNowArrayLen)];
    j += Math.random() < 0.14 ? 2 : 1; // 14% 1 of 7
	if(i + j >= end){
      break;
    }
  }
}

//マップイベント消去メモタグで指定
map_eventErase = function(id1){

const eventsCount = $gameMap.events().length;
const start = eventsCount >= 90 ? 200 : 100;
for (var id = start; id > 0; id--) {
  const ev = $gameMap.event(id);
  if (!!ev && ev.event().meta[id1]) {
    $gameMap.eraseEvent(id);
  }
}

};

//シーン時にアクターイベント生成とＩＤ記憶
event_respawnSetA = function(charaSlotId,posX,posY,zoomFlag,direction){
  const actor = $gameActors.actor(charaSlotId);
  event_respawnSetAN(charaSlotId, posX, posY, zoomFlag, direction, charaSlotId + 20, actor.characterName(), actor.characterIndex(), 0);
};

//シーン時にＮＰＣイベント生成とＩＤ記憶event_respawnSetN(11,x,y,0,'People1',0);
event_respawnSetN = function(charaSlotId,posX,posY,zoomFlag,id1,id2,direction){
  event_respawnSetAN(charaSlotId, posX, posY, zoomFlag, direction, 40, id1, id2, 1);
};

/*:
 * Merged code of event_respawnSetA and event_respawnSetN
 * @function
 * @param {integer} an
*/
event_respawnSetAN = function (charaSlotId, posX, posY, zoomFlag, direction, id0, id1, id2, an) {

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
  event.setImage(id1, id2);
  if ([2, 4, 6, 8].some(function (id3) { return direction == id3 })) {
    event.setDirection(direction);
  };
  
  if (zoomFlag == 1) {
    drowsepost.camera.zoom(1, 60, gameVar292[charaSlotId]);
    if (an === 0) $gameSystem._listenerEvent = gameVar292[charaSlotId];
    //$gamePlayer.setTransparent(true);
  };

};

//シーン時に道具イベント生成。0一時指定ID-生成済みID指定で生成省略,1ﾌｧｲﾙ名2ｲﾝﾃﾞｯｸｽ3方向4ﾊﾟﾀｰﾝ5x6y
goodsEvent_respawn = function(charaSlotId,id1,id2,id3,id4,id5,id6){

let eventId;
if($gameVariables.value(292)[charaSlotId] == 0){
  $gameMap.spawnEvent(102, id5, id6, true);
  eventId = $gameMap.getLastSpawnEventId();
  $gameVariables.value(292)[charaSlotId] = eventId;
} else {
  eventId = $gameVariables.value(292)[charaSlotId];
};

goodsEvent_imageChange(eventId, id1, id2, id3, id4);

};

//イベントを指定してグラ変更id1ﾌｧｲﾙ名id2ｲﾝﾃﾞｯｸｽid3方向id4ﾊﾟﾀｰﾝ
//goodsEvent_imageChange(this._eventId,'Goods7',5,8,1);
goodsEvent_imageChange = function(eventId,id1,id2,id3,id4){

const event = $gameMap.event(eventId);
event.setDirectionFix(false);
event.setImage(id1, id2);
event.setDirection(id3);
event.setPattern(id4);
event._originalPattern = id4;
event.setDirectionFix(true);

};

//パーティメンバーのキャラチップを主人公の周囲に出現させる。16人分。集合させないキャラ用に$dataActorsメタに記述<NoPartyEntry>
event_partyCharaEntry = function(){

if($gameVariables.value(292) == 0){
  $gameVariables.setValue(292,Array(51).fill(0));
};
const gameVar292 = $gameVariables.value(292);
const arr1 = [[1,1],[1,-1],[1,2],[1,-2],[-1,1],[-1,-1],[-1,2],[-1,-2],[2,1],[2,-1],[2,2],[2,-2],[-2,1],[-2,-1],[-2,2],[-2,-2]];
const start = $gameVariables.value(75);
const end = $gameVariables.value(76);
const gameVar530 = $gameVariables.value(530);
for (let i = start; i <= end; i++) {
  const isValid = gameVar530 !== i && $gameActors.actor(i).isLearnedSkill(18);
  if (!isValid) continue;

  if (gameVar530 == 0) {
    const x = $gamePlayer.x;
    const y = $gamePlayer.y;
    const arr2 = arr1[getRandomIndex(arr1.length)];//ID
    const index = arr1.findIndex(arr1 => arr1 == arr2);
    if (index >= 0) {
      arr1.splice(index, 1);
    }
    event_respawnSetA(i, x + arr2[0], y + arr2[1], 0, 0);
  } else {
    let placedCount = 0;
    for (let j = 0; j <= 10; j++) {
      if (placedCount == 0 && arr1 != []) {
        const ev = $gameMap.event(gameVar292[gameVar530]);
        const x = ev.x;
        const y = ev.y;
        const arr2 = arr1[getRandomIndex(arr1.length)];//ID
        const index = arr1.findIndex(arr1 => arr1 == arr2);
        if (index >= 0) {
          arr1.splice(index, 1);
        };
        const terrainTagValue = $gameMap.terrainTag(x + arr2[0], y + arr2[1]);
        if (terrainTagValue == 1) {
          event_respawnSetA(i, x + arr2[0], y + arr2[1], 0, 0);
          placedCount += 1;
        }
      }
    }
  }
}

}

//パーティメンバーキャラチップを一括で同じ動作event_partyCharaMove(3,0); event_partyCharaMove(45,"UP: 10;");
event_partyCharaMove = function(id1,id2){

for (let i = 1; i <= 15; i++) {
  const eventId = $gameVariables.value(292)[i];
  const isValid = eventId >= 1;
  if (!isValid) continue;

  event_partyMoveEventForceMoveRoute(id1, id2, eventId, 'Actor');
}

}

//メモタグ指定で一括で同じ動作event_NpcCharaMove(3,0,'Actor'); event_NpcCharaMove(45,"UP: 10;",'Actor');
event_NpcCharaMove = function(id1,id2,metaName){

  for (var id = 200; id > 0; id--) {
    event_partyMoveEventForceMoveRoute(id1, id2, id, metaName);
  };
};

// merged forceMoveRoute of event_partyCharaMove and event_NpcCharaMove and event_NpcCharaMoveId
event_partyMoveEventForceMoveRoute = function (id1, id2, eventId, metaName) {

  const event = $gameMap.event(eventId);
  const isValid = !!event && (metaName === '' || event.event().meta[metaName]);
  if (!isValid) return;

  //WARN! both forceMoveRoute below is identical! useless condition id1 == 45 , typo?
  event.forceMoveRoute({
    "list": [
      { "code": id1, "parameters": [id2] },
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
event_NpcCharaMoveId = function(id1,id2,arr1){

  for (var id = 0; id < arr1.length; id++) {
    event_partyMoveEventForceMoveRoute(id1, id2, arr1[id], '');
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
event_doorOpenClose = function(id1,id2){

  const is1 = id1 == 1;
  if (!!$gameMap.event(id2)) {
    const c1 = is1 ? 17 : 18;
    const c2 = is1 ? 18 : 17;
    const c3 = is1 ? 19 : 16;
    $gameMap.event(id2).forceMoveRoute({
      "list": [
        { "code": 36 }, { "code": c1 }, { "code": 15, "parameters": [5] },
        { "code": c2 }, { "code": 15, "parameters": [5] },
        { "code": c3 }, { "code": 15, "parameters": [5] },
        { "code": 35 }, { "code": 15, "parameters": [5] },
        { "code": 0 }], "repeat": false, "skippable": false
    });
    event_doorOpenCloseSe(id1, id2);
  }
}

//扉チップの開閉の際の効果音
event_doorOpenCloseSe = function(id1,id2){

  if (!!$gameMap.event(id2)) {
    const is1 = id1 == 1;
    const i1 = is1 ? 100 : 150;
    const i2 = is1 ? 100 : 70;
    const n = is1 ? 'Open' : 'Close';

    let arr1 = [n + '1', 90, i1];
    if ($gameMap.event(id2).characterName() == '!$fsm_Door06') {
      arr1 = ['Z_clothesTakeOff', 100, 80];
    }
    else if ($gameMap.event(id2).characterName() == '!Door1' && $gameMap.event(id2).characterIndex() == 5) {
      arr1 = ['Z_clothesTakeOff', 100, 80];
    }
    else if ($gameMap.event(id2).characterName() == '!Door1' && $gameMap.event(id2).characterIndex() == 6) {
      arr1 = ['Door2', 90, i1];
    }
    else if ($gameMap.event(id2).characterName() == '!$SF_Gate1' || $gameMap.event(id2).characterName() == '!$SF_Gate3') {
      arr1 = [n + '3', 90, i2];
    }
    else if ($gameMap.event(id2).characterName() == '!$Gate1' || $gameMap.event(id2).characterName() == '!$Gate2') {
      arr1 = [n + '3', 90, i2];
    }
    else if ($gameMap.event(id2).characterName() == '!$SF_Gate2') {
      arr1 = ['door6AutoDoorHeavy', 90, i1];
    }
    AudioManager.playSe({ "name": arr1[0], "volume": arr1[1], "pitch": arr1[2], "pan": 0 });
  }
};

//そのマップのNPC死体任意位置作成。ランダムはコモン162
people_bloodBodySet = function(posX,posY){

map_npcGraphicSet();
$gameMap.spawnEvent(74, posX, posY, true);
const event = $gameMap.event($gameMap.getLastSpawnEventId());
const arr1 = [6,7];
const damagePattern = arr1[getRandomIndex(arr1.length)];
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
event_togetherSelf = function(id1,id2){

  const arr = [301, 302, 303, 304, 305, 306, 307, 308, 309, 310];
  const mapId = $gameMap.mapId();
  for (var id = 100; id > 0; id--) {
    if (id != id1) {
      const ev = $gameMap.event(id);
      if (!!ev) {
        const evCharaNameId = ev.event().meta['CharaNameId'];
        if (evCharaNameId) {
          if (Number($gameMap.event(id1).event().meta['CharaNameId']) == Number(evCharaNameId)) {
            if (arr.some(function (id3) { return id == id3 })) { } else {
              $gameSelfSwitches.setValue([mapId, id, id2], true);
            };
          }
        }
      }
    }
  }
}

//ｲﾝｼﾞｹｰﾀｰ発生消去event_charaIndicators(1,this._eventId,'Arrow',0,-10,3,10);
//0で0消去1ｱﾆﾒ発生,1ｲﾍﾞﾝﾄid,2ﾌｧｲﾙ名,3x4y,5枚数,6速度
event_charaIndicators = function(id1,id2,id3,id4,id5,id6,id7){

const char = $gameMap.event(id2);
if(id1 == 0){
  char.clearIndicators();
  char._indData.ref = true;
}
else if(id1 == 1){
  char.setIndicators(id3,0,false,0,0,"",0,false,false,0,true,id4,id5);
  char._indData.ref = true;
  char._indData.fontSize = 28;
  char._indData.ref = true;
  char._indData.animated = true;
  char._indData.frames = [0,id6,0,id7]; 
}

}


//動物食材指定
animal_IngredientsSelect = function(id1){

let dropItemId = 1271;
const eventCharaName = $gameMap.event(id1)._characterName;
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
valueanimalEventId = id1;

};

//動物反応指定
animal_ActionSelect = function(id1){

let hasReaction = 0;
let reactionText = ``;
const eventCharaName = $gameMap.event(id1)._characterName;
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
else if(eventCharaName.match(/fish/)){};

if(hasReaction == 1){
  valueanimalEvent2Id = reactionText;
};

};

//エネミーステートでドロップ
//enemy_drop = function(user,enemy){

//};

//}());
