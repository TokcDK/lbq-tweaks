/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//☆☆キャラチップに一言台詞chara_oneWord(valueSerialPictureId,this._eventId,25,60,arr1,arr2,arr3);
chara_oneWord = function(id1,id2,id3,id4,arr1,arr2,arr3,id6){

if(id4 >= 100){
  picture_motion1("smooth",[0]);
} else {
  picture_motion1("smooth",[0]);
};
var value3 = arr1[Math.floor(Math.random() * arr1.length)];
var value4 = arr2[Math.floor(Math.random() * arr2.length)];
var value5 = arr3[Math.floor(Math.random() * arr3.length)];
$gameScreen.setDTextPicture(value5, id3);
$gameScreen.dWindowFrame = 'ON';
if(id6 == 0){}else{$gameScreen.setDtextFont(id6)};
$gameScreen.dTextAlign = 1;
if(!!$gameMap.event(id2)) {
  var value1 = $gameMap.event(id2).screenX()*$gameScreen.zoomScale();
  var value2 = ($gameMap.event(id2).screenY() - 70) *$gameScreen.zoomScale();
} else {
  var value1 = 640;
  var value2 = 384;
};
$gameScreen.showPicture(id1,"",1,value1+value3,value2+value4,50,50,255,0);
$gameScreen.movePicture(id1,1,value1+value3,value2+value4,150,150,0,0,id4);

};

//プレイヤー（イベント）の向き対応座標x,y,id1が2で正面,8が背後,4が左,6が右
event_charaDirectionPoint = function(event,id1){

valueDirectionPointX = event._realX;
valueDirectionPointY = event._realY;
if(id1 == 2){
  if(event.direction() == 2){valueDirectionPointY += 1};
  if(event.direction() == 4){valueDirectionPointX -= 1};
  if(event.direction() == 6){valueDirectionPointX += 1};
  if(event.direction() == 8){valueDirectionPointY -= 1};
};
if(id1 == 8){
  if(event.direction() == 2){valueDirectionPointY -= 1};
  if(event.direction() == 4){valueDirectionPointX += 1};
  if(event.direction() == 6){valueDirectionPointX -= 1};
  if(event.direction() == 8){valueDirectionPointY += 1};
};
if(id1 == 4){
  if(event.direction() == 2){valueDirectionPointX += 1};
  if(event.direction() == 4){valueDirectionPointY += 1};
  if(event.direction() == 6){valueDirectionPointY -= 1};
  if(event.direction() == 8){valueDirectionPointX -= 1};
};
if(id1 == 6){
  if(event.direction() == 2){valueDirectionPointX -= 1};
  if(event.direction() == 4){valueDirectionPointY -= 1};
  if(event.direction() == 6){valueDirectionPointY += 1};
  if(event.direction() == 8){valueDirectionPointX += 1};
};

};

//マップイベントのリセット
map_reset1 = function(){

$gameSystem.savePrefabEventCondition($gameMap.mapId());
for (var id = $gameMap.events().length; id > 0; id--) {
  if(!!$gameMap.event(id)) {
    if ($gameMap.event(id).event().meta['Respawn']){
      $gameMap.eraseEvent(id);
}}};
$gameSwitches.setValue(140,false);
$gameSwitches.setValue(156,false);
for (var id = $gameMap.events().length; id > 0; id--) {
  if(!!$gameMap.event(id)) {
    //  var mapID = this._mapId;
    var mapID = $gameMap.mapId();
    $gameSelfSwitches.setValue([mapID, id, "C"], false);
    $gameSelfSwitches.setValue([mapID, id, "D"], false);
  };
};

};

//主観イベントの現在位置にプレイヤーを設置してシーン終了event_PlayerArrangement($gameVariables.value(530));
event_PlayerArrangement = function(value1){

var value2 = $gameVariables.value(292)[value1];
if(!!$gameMap.event(value2)) {
  var event = $gameMap.event(value2);
  if($gameSwitches.value(29)){
    $gameVariables.setValue(171,0);
  } else {
    event_charaDirectionPoint(event,0);
    $gamePlayer.setDirection(event.direction());
    var arr1 = [$gameMap.mapId(),valueDirectionPointX,valueDirectionPointY];
    $gameVariables.setValue(171,arr1);
  };
} else {
  $gameVariables.setValue(171,0);
};
$gameVariables.setValue(528,100);

};

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
$gameVariables.setValue(35,Math.floor( Math.random() * 6) + 1);
$gameVariables.setValue(37,Math.floor( Math.random() * 3) + 2);
$gameVariables.setValue(34,5);
$gameVariables.setValue(36,[0,8]);//インデックス
  if($gameSwitches.value(203)){//屋外
    var value1 = Math.floor( Math.random() * 11);
    if(value1 >= 9){
      $gameVariables.setValue(33,'npcCastle');
      $gameVariables.setValue(35,1);
      $gameVariables.setValue(37,Math.floor( Math.random() * 3) + 2);
    };
  };
  if($gameSwitches.value(282)){//浜辺
    $gameVariables.setValue(33,'npcSwimsuit');
    $gameVariables.setValue(35,Math.floor( Math.random() * 4) + 1);
    $gameVariables.setValue(37,Math.floor( Math.random() * 3) + 2);
  };
  if($gameSwitches.value(242)){//城
    var arr = [1,2];
    var value5 = arr[Math.floor(Math.random() * arr.length)]
      if(value5 == 1){
        $gameVariables.setValue(33,'npcCastle');
        $gameVariables.setValue(35,Math.floor( Math.random() * 2) + 1);
        $gameVariables.setValue(37,Math.floor( Math.random() * 2) + 2);
      } else {
        $gameVariables.setValue(33,'npcMaid');
        $gameVariables.setValue(35,1);
        $gameVariables.setValue(37,Math.floor( Math.random() * 2) + 2);
      };
  };
  if($gameSwitches.value(276)){//城終盤
    $gameVariables.setValue(33,'npcOrder');
    $gameVariables.setValue(35,1);
    $gameVariables.setValue(37,Math.floor( Math.random() * 2) + 2);
  };
  if($gameSwitches.value(261)){//秩序
    $gameVariables.setValue(33,'npcOrder');
    $gameVariables.setValue(35,1);
    $gameVariables.setValue(37,Math.floor( Math.random() * 2) + 2);
  };
  if($gameSwitches.value(246)){//貴族
    $gameVariables.setValue(33,'npcMaid');
    $gameVariables.setValue(35,1);
    $gameVariables.setValue(37,Math.floor( Math.random() * 2) + 2);
  };
  if($gameSwitches.value(300)){//病院
    $gameVariables.setValue(33,'npcDoctor');
    $gameVariables.setValue(35,1);
    $gameVariables.setValue(37,Math.floor( Math.random() * 2) + 2);
  };
  if($gameSwitches.value(235) || $gameSwitches.value(237)){//ギルドと武器防具屋
    $gameVariables.setValue(33,'Actor');
    $gameVariables.setValue(35,Math.floor( Math.random() * 3) + 1);
    $gameVariables.setValue(37,Math.floor( Math.random() * 2) + 2);
  };
  if($gameSwitches.value(232)){//富豪
    $gameVariables.setValue(33,'npcFugou');
    $gameVariables.setValue(35,3);
    $gameVariables.setValue(37,Math.floor( Math.random() * 2) + 2);
    $gameVariables.setValue(36,[0,4]);//インデックス
  };
  if($gameSwitches.value(230)){//スラム悪人
    $gameVariables.setValue(33,'BB_akunin');
    $gameVariables.setValue(35,5);
    $gameVariables.setValue(37,Math.floor( Math.random() * 2) + 2);
  };
  if($gameSwitches.value(15)){//夜
    if($gameSwitches.value(203)){//屋外
      $gameVariables.setValue(241,Math.floor( Math.random() * 5) + 1);
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
map_npcPositionSet = function(){

$gameVariables.setValue(173,[]);
var value1 = $gameMap.events().length;
if(value1 >= 50){
  var value11 = 200;
} else {
  var value11 = 100;
};
//for (var id2 = $gameMap.events().length; id2 > 0; id2--) {
for (var id = value11; id > 0; id--) {
  if(!!$gameMap.event(id)) {
    if($gameSelfSwitches.value([$gameMap.mapId(), id, 'A']) && !$gameSwitches.value(209)){
      if ($gameMap.event(id).event().meta['NoAClear']){}else{
        $gameMap.eraseEvent(id);
      };
    } else {
      if ($gameMap.event(id).event().meta['MQProgress']){
        var value1 = Number($gameMap.event(id).event().meta['MQProgress']);
        $gameVariables.value(173).push(value1);
      };
      if ($gameMap.event(id).event().meta['foodC']){//decorationFood
        var event = $gameMap.event(id);
        var value2 = 1;
        var value3 = Math.floor( Math.random() * 7) + 0;
        event.setImage('food_'+value2, value3);
        var arr1 = [2,4,6,8];
        var value2 = arr1[Math.floor(Math.random() * arr1.length)];
        event.setDirection(value2);//2,4,6,8
        var arr1 = [0,1,2];
        var value2 = arr1[Math.floor(Math.random() * arr1.length)];
        event.setPattern(value2);//0,1,2
        event._originalPattern = value2;
        event.setDirectionFix(true);//向き固定
      };
      if ($gameMap.event(id).event().meta['decorationFood']){
        var arr2 = [[1,5,8,1],[1,5,8,2],[1,6,8,0],[1,6,8,1],[2,0,2,1],[2,1,2,2],[2,0,6,0],[2,0,6,1]];
        var arr1 = arr2[Math.floor(Math.random() * arr2.length)];
        var event = $gameMap.event(id);
        event.setDirectionFix(false);
        event.setImage('food_' + arr1[0], arr1[1]);
        event.setDirection(arr1[2]);
        event.setPattern(arr1[3]);//0,1,2不要
        event._originalPattern = arr1[3];
        event.setDirectionFix(true);
      };
      if ($gameMap.event(id).event().meta['Alcol']){
        var arr2 = [[0,6,0],[0,6,1],[0,6,2],[1,4,1],[1,4,2],[2,4,0],[2,4,1]];
        var arr1 = arr2[Math.floor(Math.random() * arr2.length)];
        var event = $gameMap.event(id);
        event.setDirectionFix(false);
        event.setImage('food_2', arr1[0]);
        event.setDirection(arr1[1]);
        event.setPattern(arr1[2]);//0,1,2不要
        event._originalPattern = arr1[2];
        event.setDirectionFix(true);
      };
      if ($gameMap.event(id).event().meta['foodPlate']){
        var arr2 = [[2,0,8,0],[2,0,8,1],[2,0,8,1],[2,1,8,0],[2,1,8,1],[2,1,8,2],[2,2,8,0],[2,2,8,1]];
        var arr1 = arr2[Math.floor(Math.random() * arr2.length)];
        var event = $gameMap.event(id);
        event.setDirectionFix(false);
        event.setImage('food_' + arr1[0], arr1[1]);
        event.setDirection(arr1[2]);
        event.setPattern(arr1[3]);//0,1,2不要
        event._originalPattern = arr1[3];
        event.setDirectionFix(true);
      };
      if ($gameMap.event(id).event().meta['NpcProstitute']){
        var event = $gameMap.event(id);
        var value2 = 'npcNakidWoman';
        var value3 = Math.floor( Math.random() * 3) + 1;
        var value4 = Math.floor( Math.random() * 7) + 0;
        event.setImage(value2+value3, value4);
      };
      if ($gameMap.event(id).event().meta['NpcProstituteGuest']){
        var event = $gameMap.event(id);
        var value2 = 'npcFugou';
        var value3 = 1;
        var value4 = Math.floor( Math.random() * 4) + 4;
        event.setImage(value2+value3, value4);
      };
      if ($gameMap.event(id).event().meta['StandNPC']){
        map_npcGraphicSet();
        var event = $gameMap.event(id);
        var value4 = $gameVariables.value(33);
        var value2 = $gameVariables.value(35);
        var value3 = Math.floor( Math.random() * $gameVariables.value(36)[1]) + $gameVariables.value(36)[0];
        event.setImage(value4+value2, value3);
      };
      if ($gameMap.event(id).event().meta['BloodBody']){
        map_npcGraphicSet();
        var event = $gameMap.event(id);
        var value4 = $gameVariables.value(33);
        var value2 = $gameVariables.value(35);
        var value3 = Math.floor( Math.random() * $gameVariables.value(36)[1]) + $gameVariables.value(36)[0];
        event.setImage(value4+value2, value3);
        var arr1 = [45,135,-45,-135];
        var value5 = arr1[Math.floor(Math.random() * arr1.length)];
        event.setAngle(value5);
        event.setDirection(8);
        $gameMap.spawnEvent(99, event.x, event.y, true);//血痕
        var value6 = $gameMap.getLastSpawnEventId();
        if(value5 == 45){var value7 = 20;var value8 = 20};
        if(value5 == 135){var value7 = 20;var value8 = 40};
        if(value5 == -45){var value7 = -20;var value8 = 20};
        if(value5 == -135){var value7 = -20;var value8 = 40};
        $gameMap.event(value6)._spriteOffsetX += value7;//yep
        $gameMap.event(value6)._spriteOffsetY += value8;
      };
      var value12 = 0;
if($gameMap.event(id).characterName() == 0){}else{//で画像なし状態のキャラ判定
  if ($gameMap.event(id).event().meta['BossGura']){
    var value13 = 0;
    var arr1 = $gameMap.event(id).event().meta['BossGura'].split(',');
    if($dataEnemies[Number(arr1[1])].meta['BossGura']){
      var arr2 = $dataEnemies[Number(arr1[1])].meta['BossGura'].split(',');
    } else {
      var arr2 = [20,30,0.2];
    };
    valueBossCharaGura = [id,$dataEnemies[Number(arr1[1])].meta['BossEnemy'].split(',')[2],Number(arr2[0]),Number(arr2[1]),Number(arr2[2])];
    boss_charaGuraCGSet(valueBossCharaGura);
  };
  if ($gameMap.event(id).event().meta['BossGura2']){
    var value13 = 0;
    var arr2 = $gameMap.event(id).event().meta['BossGura2'].split(',');
    valueBossCharaGura = [id,arr2[0],Number(arr2[1]),Number(arr2[2]),Number(arr2[3])];
    boss_charaGuraCGSet(valueBossCharaGura);
    //$gameMap.event(id).setOpacity(255);
  };
  if ($gameMap.event(id).event().meta['Charalight']){
    var event = $gameMap.event(id).event();
    if(event){
      var arr1 = event.meta['Charalight'].split(',');
      $gameMap.event(id).moveLight(Number(arr1[0]), Number(arr1[1]), Number(arr1[2]), Number(arr1[3]));
    };
  };
  if ($gameMap.event(id).event().meta['PerspectiveA']){
    var value13 = 0;
    var arr1 = $gameMap.event(id).event().meta['PerspectiveA'].split(',');
      for (var i = 0; i <= arr1.length-1; i++) {
        if(Number(arr1[i]) <= 0){var value13 = 1}else{
          if($gameSwitches.value(Number(arr1[i]) + 440)){
            var value13 = 1;
      }}};
      if(value13 == 0){var value12 = 1};
  };
  if ($gameMap.event(id).event().meta['EvSceneSet']){//<EvSceneSet:401,1,0>1で達成時に消去で2なら消去なし。0で♡1で笑-1でなし
    var value13 = 0;
    var arr1 = $gameMap.event(id).event().meta['EvSceneSet'].split(',');
    var value1 = Number(arr1[0]);
    var value2 = 0;//発生
    var value3 = 0;//達成
    var value4 = 'h';//イベアイコン
    if(value1 >= 401 && value1 <= 500){var value2 = value1 + 800;var value3 = value1 + 900};
    if(value1 >= 501 && value1 <= 600){var value2 = value1 + 500;var value3 = value1 + 600};
    if($dataItems[value1].meta['AddEventIncidenceSwi']){
      var value2 = Number($dataItems[value1].meta['AddEventIncidenceSwi']);
    };
    if($dataItems[value1].meta['AddEventCompSwi']){
      var value3 = Number($dataItems[value1].meta['AddEventCompSwi']);
    };
    if(value2 <= 1){var value13 = 1};
    if($gameSwitches.value(value2)){var value13 = 1};
    if(Number(arr1[1]) == 1 && $gameSwitches.value(value3)){var value13 = 0};
    if(value13 == 0){
      var value12 = 1;
    } else {
      if(Number(arr1[2]) == 0){var value4 = 'h'};
      if(Number(arr1[2]) == 1){var value4 = 'h1'};
      if(Number(arr1[2]) == 2){var value4 = 't'};
      if(Number(arr1[2]) == 3){var value4 = 'e'};
      if(Number(arr1[2]) == -1){var value4 = 0};
      if(value4 != 0){
        var char = $gameMap.event(id);
        char.setIndicators(value4,0,false,0,0,"",0,false,false,0,true,0,-10);
        char._indData.ref = true;
        char._indData.fontSize = 28;
        char._indData.ref = true;
        char._indData.animated = true;
        char._indData.frames = [0,5,0,5]; 
      };
    };
  };
  if ($gameMap.event(id).event().meta['EvStartSw']){
    var value13 = 0;
    var arr1 = $gameMap.event(id).event().meta['EvStartSw'].split(',');
      for (var i = 0; i <= arr1.length-1; i++) {
        if(Number(arr1[i]) <= 1){var value13 = 1} else {
          if($gameSwitches.value(Number(arr1[i]))){
            var value13 = 1;
      }}};
      if(value13 == 0){var value12 = 1};
  };
  if ($gameMap.event(id).event().meta['EvEndSw']){
    var arr1 = $gameMap.event(id).event().meta['EvEndSw'].split(',');
      for (var i = 0; i <= arr1.length-1; i++) {
        if(Number(arr1[i]) >= 1){
          if($gameSwitches.value(Number(arr1[i]))){
            var value12 = 1;
            break;
  }}}};
  if ($gameMap.event(id).event().meta['EvStartCloth']){
    var character = $gameMap.event(id);
    var value1 = Number($gameMap.event(id).event().meta['EvStartCloth'].split(',')[0]);
    var value2 = Number($gameMap.event(id).event().meta['EvStartCloth'].split(',')[1]);
      if(value1 >= 1){
        if($gameVariables.value(440 + value1)[41] == value2){}else{
          var value12 = 1;
        };
  }};
  if ($gameMap.event(id).event().meta['EvStartVal']){
    var character = $gameMap.event(id);
    var value1 = Number($gameMap.event(id).event().meta['EvStartVal'].split(',')[0]);
    var value2 = Number($gameMap.event(id).event().meta['EvStartVal'].split(',')[1]);
      if(value1 >= 1){
        if($gameVariables.value(value1) >= value2){}else{
          var value12 = 1;
        };
  }};
  if ($gameMap.event(id).event().meta['EvEndVal']){
    var character = $gameMap.event(id);
    var value1 = Number($gameMap.event(id).event().meta['EvEndVal'].split(',')[0]);
    var value2 = Number($gameMap.event(id).event().meta['EvEndVal'].split(',')[1]);
      if(value1 >= 1){
        if($gameVariables.value(value1) >= value2){
          var value12 = 1;
        };
  }};
  if ($gameMap.event(id).event().meta['EvEraseMain']){
    var character = $gameMap.event(id);
    var arr1 = $gameMap.event(id).event().meta['EvEraseMain'].split(',');
    for (var i = 0; i <= arr1.length-1; i++) {
      if(Number(arr1[i]) >= 1){
        if($gameVariables.value(135) == Number(arr1[i])){
          var value12 = 1;
          break;
        };
  }}};
  if ($gameMap.event(id).event().meta['EvESSOn']){
    var character = $gameMap.event(id);
    var arr1 = $gameMap.event(id).event().meta['EvESSOn'].split(',');
    for (var i = 0; i <= arr1.length-1; i++) {
      if(Number(arr1[i]) >= 501 && Number(arr1[i]) <= 600){
        if( $gameSwitches.value(Number(arr1[i])+500) && !$gameSwitches.value(Number(arr1[i])+600) ){
          var value12 = 1;
          break;
        };
      };
      if(Number(arr1[i]) >= 401 && Number(arr1[i]) <= 500){
        if( $gameSwitches.value(Number(arr1[i])+800) && !$gameSwitches.value(Number(arr1[i])+900) ){
          var value12 = 1;
          break;
        };
      };
    };
  };
  if ($gameMap.event(id).event().meta['EvEraseItem']){
    var character = $gameMap.event(id);
    var arr1 = $gameMap.event(id).event().meta['EvEraseItem'].split(',');
    for (var i = 0; i <= arr1.length-1; i++) {
      if(Number(arr1[i]) >= 1){
        if($gameParty.hasItem($dataItems[Number(arr1[i])],true)){
          var value12 = 1;
        };
  }}};
  if ($gameMap.event(id).event().meta['QuestSet']){//
    var character = $gameMap.event(id);
    var value1 = $gameMap.event(id).event().meta['QuestSet'];
    if(valueQuestArray5[value1-800] == 1){
      $gameSelfSwitches.setValue([$gameMap.mapId(), id, 'B'], true);
    } else {
      $gameSelfSwitches.setValue([$gameMap.mapId(), id, 'B'], false);
    };
    if($gameParty.hasItem($dataItems[Number(value1)],true)){
      $gameSelfSwitches.setValue([$gameMap.mapId(), id, 'A'], true);
    } else {
      $gameSelfSwitches.setValue([$gameMap.mapId(), id, 'A'], false);
    };
    if($gameParty.hasItem($dataItems[Number(value1) + 100],true)){
      //var value12 = 1;
    };
  };
  if(value12 == 1){$gameMap.eraseEvent(id)};
  if(value12 == 0){
    if ($gameMap.event(id).event().meta['PSet']){
      var character = $gameMap.event(id);
      var value1 = Number($gameMap.event(id).event().meta['PSet'].split(',')[0]);
      var value2 = Number($gameMap.event(id).event().meta['PSet'].split(',')[1]);
      character.locate(value1, value2);
      //character.setDirection(4);
    };
    if ($gameMap.event(id).event().meta['Amassage']){//<Amassage:901,おはよう\I[16]>
      var value1 = Number($gameMap.event(id).event().meta['Amassage'].split(',')[0]);
      var value2 = $gameMap.event(id).event().meta['Amassage'].split(',')[1];
      $gameVariables.setValue(value1,value2);
      $gameMap.forceDisplayActiveMessage(id);
    };
    if ($gameMap.event(id).event().meta['Hsw1']){//<Hsw1:2,1>
      var list = [1,2,3,4,5,6,7,8,9];
      list.forEach(function(id1) {
        if ($gameMap.event(id).event().meta['Hsw'+id1]){
          var value1 = Number($gameMap.event(id).event().meta['Hsw'+id1].split(',')[0]);
          var value2 = Number($gameMap.event(id).event().meta['Hsw'+id1].split(',')[1]);
          if($gameSwitches.value(value1) && !$gameSwitches.value(value2)){
            var char = $gameMap.event(id);
            char.setIndicators('h',0,false,0,0,"",0,false,false,0,true,0,-20);
            char._indData.ref = true;
            char._indData.fontSize = 28;
            char._indData.ref = true;
            char._indData.animated = true;
            char._indData.frames = [0,5,0,5]; 
        }};
      }, this);
    };
    if ($gameMap.event(id).event().meta['H1sw1']){//<H1sw1:2,1>
      var list = [1,2,3,4,5,6,7,8,9];
      list.forEach(function(id1) {
        if ($gameMap.event(id).event().meta['H1sw'+id1]){
          var value1 = Number($gameMap.event(id).event().meta['H1sw'+id1].split(',')[0]);
          var value2 = Number($gameMap.event(id).event().meta['H1sw'+id1].split(',')[1]);
            if($gameSwitches.value(value1) && !$gameSwitches.value(value2)){
              var char = $gameMap.event(id);
              char.setIndicators('h1',0,false,0,0,"",0,false,false,0,true,0,-20);
              char._indData.ref = true;
              char._indData.fontSize = 28;
              char._indData.ref = true;
              char._indData.animated = true;
              char._indData.frames = [0,5,0,5]; 
        }};
      }, this);
    };
  };
}}};

};
};

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

let value1 = 1;
if(valueRegionMapArray[value1] < 1) return;

if(id2 == 0){
  value1 = $gameVariables.value(241);
  if($gameSwitches.value(16)){
    value1 += Math.floor( Math.random() * 3) + 1;
  };
  if($gameSwitches.value(14)){
    value1 += Math.floor( Math.random() * 3);
  };
  if($gameSwitches.value(15)){
    value1 = Math.round($gameVariables.value(241) / 10);
  };
} else {
  value1 = 1;
};
if(id2 == 0 && $gameVariables.value(235) > value1){
  value1 = 0;
};
let j = 0;
if(!$gameSwitches.value(140) ||
$gameParty.inBattle() ||
value1 < 1 ||
$gameVariables.value(202).some(function (id) { return $gameMap.mapId() == id })) return;

  for (let id1 = 1; id1 <= value1; id1++) {
    let value11 = id3;
    if(id3 == 0){
      map_npcGraphicSet();
      value11 = [52,55][Math.floor(Math.random() * 2)];//テンプレ元イベントID
    }
    const conditionMap         = {};
    conditionMap.passable    = 1;
    conditionMap.screen      = 0;
    conditionMap.collided    = 3;
    conditionMap.terrainTags = [0];
    conditionMap.regionIds   = [1];
    $gameMap.spawnEventRandom(value11, conditionMap, true);
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
    charaEventToRespawn.setDirection(map_npcRespawnNpcDirections[Math.floor(Math.random() * map_npcRespawnNpcDirections.length)]);//2,4,6,8

    const npcOpacity = id2 == 0 ? 0/*初期透明度*/ : 255;
    charaEventToRespawn.setOpacity(npcOpacity);

    const npcMoveSpeed = $gameVariables.value(37);//移動速度
    charaEventToRespawn.setMoveSpeed(npcMoveSpeed);

    const npcMoveFrequency = value11 == 52 ? //移動頻度。直線かランダムで変更。
      [3, 4, 5][Math.floor(Math.random() * 3)]
      : $gameVariables.value(34);
    charaEventToRespawn.setMoveFrequency(npcMoveFrequency);

    $gameVariables.setValue(235,$gameVariables.value(235) + 1);
    j += [1,2,1,2,1,1,2][Math.floor(Math.random() * 7)];

    if (id1 + j >= value1) break;
  }

};

//エネミー動的生成。0通常。1エロ。map_enemyRespawn(0);
map_enemyRespawn = function(id2){

let value1 = 1;
if(valueRegionMapArray[value1] < 1) return;

//$gameVariables.value(334);//最大数
//$gameVariables.value(335);//討伐数
  if($gameSwitches.value(655) && !$gameSwitches.value(216)  && $gameVariables.value(335) >= $gameVariables.value(334)){
    $gameVariables.setValue(335,0);
  };
  const originalEventId = id2 == 0 ? 16 : 17;//元イベントID
  const maxOccurNum = id2 == 0 ? 224 : 227;//最大出現数変数
  const appearance = id2 == 0 ? 222 : 226;//現在出現数変数

  value1 = $gameVariables.value(maxOccurNum);//
  if($gameSwitches.value(15)){
    //var value1 = $gameVariables.value(value11) + Math.round($gameVariables.value(value11) / 5);
  };
  value1 -= $gameVariables.value(appearance);
  if($gameVariables.value(appearance) > $gameVariables.value(maxOccurNum)){
    value1 = 0;
  };
  //討伐数 + 現在出現数　＞　エネミー最大ポップ数20
  if($gameVariables.value(335) + $gameVariables.value(appearance) >= $gameVariables.value(334)){
    value1 = 0;
  };
  //if($gameVariables.value(335) + $gameVariables.value(value12) >= $gameVariables.value(334)){
    //var value1 = 0;
  //};
  if(id2 == 1){
    if(!$gameSwitches.value($gameVariables.value(236))){
      value1 = 0;
    };
  };
  //var j = 0;//
  if (!$gameSwitches.value(140) ||
    $gameParty.inBattle() ||
    value1 < 1 ||
    $gameVariables.value(202).some(function (id) { return $gameMap.mapId() == id })) return;

      for (let id1 = 1; id1 <= value1; id1++) {
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
        let value15 = Math.floor( Math.random() * 4) + 1;
        let value16 = Math.floor( Math.random() * 4) + 1;
        if($gameSwitches.value(363)){
          value15 = Math.floor( Math.random() * 3) + 3;
          value16 = Math.floor( Math.random() * 3) + 3;
        };
        if($gameSwitches.value(368)){
          value15 = Math.floor( Math.random() * 2) + 1;
          value16 = Math.floor( Math.random() * 2) + 1;
        };
        enemyEventToRespawn.setMoveSpeed(value15);
        enemyEventToRespawn.setMoveFrequency(value16);
        if($gameSwitches.value(360)){
          enemyEventToRespawn.setScale(150, 150);
        };
        if(id2 == 1){
          enemyEventToRespawn.setTone(50, -100, 50);
        };
        let value13 = 9;
        const value14 = Math.floor( Math.random() * 11);
        if(value14 >= 9){
          value13 = 10;
        } 
        if(value14 <= 1){
          value13 = 11;
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
            "list":[{"code":value13},
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
    const rnd0or1 = Math.floor( Math.random() * 2);
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
      var value2 = 131;//ワープ魔方陣<warpPoint1:1,1,1>
      var value1 = Number(arr2[0]);
        if(value1 == $gameMap.mapId()){
         $gameMap.spawnEvent(value2, Number(arr2[1]), Number(arr2[2]), true);
           if($gameVariables.value(211)[$gameVariables.value(240)][i] == 1){
             $gameSelfSwitches.setValue([$gameMap.mapId(), $gameMap.getLastSpawnEventId(), 'A'], true);
           };
        };
    };
  };
  if(value.meta['warpStart']){
    var arr2 = value.meta['warpStart'].split(',');
    var value2 = 132;//ワープ魔方陣。入口<warpStart:1,1,1>
    var value1 = Number(arr2[0]);
      if(value1 == $gameMap.mapId()){
        $gameMap.spawnEvent(value2, Number(arr2[1]), Number(arr2[2]), true);
      };
  };
  if(value.meta['TchestOnly']){
    var arr2 = value.meta['TchestOnly'].split(',');
    var value2 = 113;//レア宝箱
    var value1 = Number(arr2[0]);
      if(value1 == $gameMap.mapId()){
        $gameMap.spawnEvent(value2, Number(arr2[1]), Number(arr2[2]), true);
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
  if($gameSwitches.value(202) && valueRegionMapArray[1] >= 1){
    const arr2 = [19,[1],[1],1,0,3,[0],[1]];//小銭生成
    const value1 = $gameVariables.value(238);
    const array1 = [value1-2,value1-1,value1,value1+1];
    let value2 = array1[Math.floor(Math.random() * array1.length)];
    if(value2 <= 0){value2 = 1};
    map_otherGraphicSet(value2,0,arr2);
  }
  if($gameSwitches.value(201) && valueRegionMapArray[1] >= 1){
    const arr2 = [18,[1],[1],1,0,3,[0],[1]];//小物生成
    const value1 = $gameVariables.value(238);
    const array1 = [value1-2,value1-1,value1,value1+1];
    let value2 = array1[Math.floor(Math.random() * array1.length)];
    if(value2 <= 0){value2 = 1};
    map_otherGraphicSet(value2,0,arr2);
  }
}

if($gameSwitches.value(201)){
  $gameVariables.setValue(536,[]);//宝箱生成Id配列
  if(valueRegionMapArray[1] >= 1){
    const arr2 = [43,[1],[1],1,0,0,[0],[1]];//転送先
    map_otherGraphicSet(1,0,arr2);
  }
  if($gameVariables.value(215)[$gameVariables.value(240)].length >= 1 && valueRegionMapArray[8] >= 1){
    let value2 = Math.ceil($gameVariables.value(215)[$gameVariables.value(240)].length/$gameVariables.value(217));
    if(value2 > valueRegionMapArray[8]){value2 = valueRegionMapArray[8]};
    const arr2 = [86,[1],[1],1,0,0,[0],[8]];
    map_otherGraphicSet(value2,0,arr2);
    $gameVariables.value(536).push($gameMap.getLastSpawnEventId());
  }
  if($gameSwitches.value(207) && $gameVariables.value(238) >= 3 && $gameVariables.value(270) >= 20 && valueRegionMapArray[1] >= 1){
    const arr2 = [20,[1],[1],1,0,0,[0],[1]];//トラップ。エネミーレベル20以上
    const value1 = $gameVariables.value(238);
    const array1 = [value1-2,value1-1,value1,value1+1];
    let value2 = array1[Math.floor(Math.random() * array1.length)];
    if(value2 <= 0){value2 = 1};
    map_otherGraphicSet(value2,0,arr2);
  }
}

if($gameVariables.value(260) >= 1 && valueRegionMapArray[1] >= 1){
  let value2 = $gameVariables.value(260);
  value2 += Math.round($gameVariables.value(238)/2);
  value2 += Math.floor( Math.random() * 4) + -2;
  if (value2 >= 1) {
    const arr = [70, 93, 85, 92, 91, 94, 88, 89, 95, 96];//亡骸
      for (let id10 = 1; id10 <= value2; id10++) {
        const value1 = arr[Math.floor(Math.random() * arr.length)];
        const arr2 = [value1,[1],[1],1,0,0,[0],[1]];
        map_otherGraphicSet(1,0,arr2);
      }
  }
}

const gameVar259 = $gameVariables.value(259);
const gameVar238= $gameVariables.value(238);
const value1Arr = [78, 42, 5, 103, 104, 105, 126, 127, 128, 129];
for (let id10 = 1; id10 <= 10; id10++) {//固有素材。<CGPriority:1,1>
  if (gameVar259[id10] < 1) continue;

  let value2 = Math.round(gameVar238);
  value2 += Math.floor(Math.random() * 6) + 5;
  if (value2 < 1) continue;
  
  const value1 = value1Arr[id10];
  if (id10 == 7) {
    if (valueRegionMapArray[3] >= 1) {
      const arr2 = [value1, [1], [1], 1, 0, 3, [3], [3]];
      map_otherGraphicSet(value2, 0, arr2);
    }
  } else {
    if (valueRegionMapArray[1] >= 1) {
      const arr2 = [value1, [1], [1], 1, 0, 3, [0], [1]];
      map_otherGraphicSet(value2, 0, arr2);
    }
  }
}

}

//色々動的生成設定
var map_otherGraphicSetEndNowArray = [1, 2, 1, 1, 1, 1, 1];
map_otherGraphicSet = function(id1,arr1,arr2){

  if(arr2 === 0) return;

  let j = 0;
  const gameVar210SpawnEventIdsArray = $gameVariables.value(210);
  const end = id1 == 0 ? $gameVariables.value(238) : id1;
  for (let i = 1; i <= end; i++) {
    const conditionMap         = {};
    conditionMap.passable    = arr2[3];
    conditionMap.screen      = arr2[4];
    conditionMap.collided    = arr2[5];
    conditionMap.terrainTags = arr2[6];
    conditionMap.regionIds   = arr2[7];
    $gameMap.spawnEventRandom(arr2[0], conditionMap, true);
    
    gameVar210SpawnEventIdsArray.push($gameMap.getLastSpawnEventId());
    const event = $gameMap.event($gameMap.getLastSpawnEventId());
    if(arr1){
      event.setImage(arr1[Math.floor(Math.random() * arr1.length)],Math.floor( Math.random() * 8) + 0);
    }
    event.setMoveSpeed(arr2[1][Math.floor(Math.random() * arr2[1].length)]);//1-6
    event.setMoveFrequency(arr2[2][Math.floor(Math.random() * arr2[2].length)]);//1-5
    
    j += map_otherGraphicSetEndNowArray[Math.floor(Math.random() * 3)];
    if(i + j >= end){
      break;
    }
  }
}

//マップイベント消去メモタグで指定
map_eventErase = function(id1){

var value1 = $gameMap.events().length;
if(value1 >= 90){
  var value11 = 200;
} else {
  var value11 = 100;
};
for (var id = value11; id > 0; id--) {
  if(!!$gameMap.event(id)) {
    if ($gameMap.event(id).event().meta[id1]){
      $gameMap.eraseEvent(id);
}}};

};

//シーン時にアクターイベント生成とＩＤ記憶
event_respawnSetA = function(value1,value2,value3,value4,value5){

  var value6 = $gameMap.eventIdXy(value2, value3);
  if(value6 >= 1){
    if ($gameMap.event(value6).event().meta['Respawn']){}else{
      $gameMap.eraseEvent(value6);
    };
  };
  $gameMap.spawnEvent(value1 + 20, value2, value3, true);
  var eventId = $gameMap.getLastSpawnEventId();
  $gameVariables.value(292)[value1] = eventId;
  var event = $gameMap.event($gameVariables.value(292)[value1]);
  var actor = $gameActors.actor(value1);
  event.setImage(actor.characterName(), actor.characterIndex());
  if([2,4,6,8].some(function(id3){return value5 == id3})){
    event.setDirection(value5);
  };
  if(value4 == 1){
    drowsepost.camera.zoom(1, 60, $gameVariables.value(292)[value1]);
    $gameSystem._listenerEvent = $gameVariables.value(292)[value1];
    //$gamePlayer.setTransparent(true);
  };

};

//シーン時にＮＰＣイベント生成とＩＤ記憶event_respawnSetN(11,x,y,0,'People1',0);
event_respawnSetN = function(value1,value2,value3,value4,id1,id2,value5){

  var value6 = $gameMap.eventIdXy(value2, value3);
  if(value6 >= 1){
    if ($gameMap.event(value6).event().meta['Respawn']){}else{
      if ($gameMap.event(value6).isThrough()){}else{
        $gameMap.eraseEvent(value6);
      };
    };
  };
  $gameMap.spawnEvent(40, value2, value3, true);
  var eventId = $gameMap.getLastSpawnEventId();
  $gameVariables.value(292)[value1] = eventId;
  var event = $gameMap.event($gameVariables.value(292)[value1]);
  event.setImage(id1, id2);
  if([2,4,6,8].some(function(id3){return value5 == id3})){
    event.setDirection(value5);
  };
  if(value4 == 1){
    drowsepost.camera.zoom(1, 60, $gameVariables.value(292)[value1]);
    //$gamePlayer.setTransparent(true);
  };

};

//シーン時に道具イベント生成。0一時指定ID-生成済みID指定で生成省略,1ﾌｧｲﾙ名2ｲﾝﾃﾞｯｸｽ3方向4ﾊﾟﾀｰﾝ5x6y
goodsEvent_respawn = function(value1,id1,id2,id3,id4,id5,id6){

if($gameVariables.value(292)[value1] == 0){
  $gameMap.spawnEvent(102, id5, id6, true);
  var eventId = $gameMap.getLastSpawnEventId();
  $gameVariables.value(292)[value1] = eventId;
} else {
  var eventId = $gameVariables.value(292)[value1];
};
var event = $gameMap.event(eventId);
event.setDirectionFix(false);
event.setImage(id1, id2);
event.setDirection(id3);
event.setPattern(id4);
event._originalPattern = id4;
event.setDirectionFix(true);

};

//イベントを指定してグラ変更id1ﾌｧｲﾙ名id2ｲﾝﾃﾞｯｸｽid3方向id4ﾊﾟﾀｰﾝ
//goodsEvent_imageChange(this._eventId,'Goods7',5,8,1);
goodsEvent_imageChange = function(eventId,id1,id2,id3,id4){

var event = $gameMap.event(eventId);
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
var arr1 = [[1,1],[1,-1],[1,2],[1,-2],[-1,1],[-1,-1],[-1,2],[-1,-2],[2,1],[2,-1],[2,2],[2,-2],[-2,1],[-2,-1],[-2,2],[-2,-2]];
var start = $gameVariables.value(75);
var end = $gameVariables.value(76);
for (var i = start; i <= end; i++) {
  if($gameActors.actor(i).isLearnedSkill(18)){
    var value1 = i;
    if($gameVariables.value(530) == 0){
      if($gameVariables.value(530) == value1){}else{
        var value2 = $gamePlayer.x;
        var value3 = $gamePlayer.y;
        var arr2 = arr1[Math.floor(Math.random() * arr1.length)];//ID
        var index = arr1.findIndex(arr1 => arr1 == arr2); 
        if(index >= 0){
          arr1.splice(index, 1);
        };
        event_respawnSetA(value1,value2+arr2[0],value3+arr2[1],0,0);
      };
    }else{
      if($gameVariables.value(530) == value1){}else{  
        var value5 = 0;
        for (var j = 0; j <= 10; j++) {
          if(value5 == 0 && arr1 != []){
            var value2 = $gameMap.event($gameVariables.value(292)[$gameVariables.value(530)]).x;
            var value3 = $gameMap.event($gameVariables.value(292)[$gameVariables.value(530)]).y;
            var arr2 = arr1[Math.floor(Math.random() * arr1.length)];//ID
            var index = arr1.findIndex(arr1 => arr1 == arr2); 
            if(index >= 0){
              arr1.splice(index, 1);
            };
            var value4 = $gameMap.terrainTag(value2+arr2[0], value3+arr2[1]);
            if(value4 == 1){
              event_respawnSetA(value1,value2+arr2[0],value3+arr2[1],0,0);
              value5 += 1;
            };
          };
        };
      };
    };
}};

};

//パーティメンバーキャラチップを一括で同じ動作event_partyCharaMove(3,0); event_partyCharaMove(45,"UP: 10;");
event_partyCharaMove = function(id1,id2){

var start = 1;
var end = 15;
for (var i = start; i <= end; i++) {
  if($gameVariables.value(292)[i] >= 1){
    if(!!$gameMap.event($gameVariables.value(292)[i])) {
      if ($gameMap.event($gameVariables.value(292)[i]).event().meta['Actor']){
        if(id1 == 45){
          $gameMap.event($gameVariables.value(292)[i]).forceMoveRoute({
          "list":[
          {"code":id1,"parameters":[id2]},
          {"code":0}],"repeat":false,"skippable":true});
        } else {
          $gameMap.event($gameVariables.value(292)[i]).forceMoveRoute({
          "list":[
          {"code":id1,"parameters":[id2]},
          {"code":0}],"repeat":false,"skippable":true});
        };
      };
    };
  };
};

};

//メモタグ指定で一括で同じ動作event_NpcCharaMove(3,0,'Actor'); event_NpcCharaMove(45,"UP: 10;",'Actor');
event_NpcCharaMove = function(id1,id2,value1){

for (var id = 200; id > 0; id--) {
  if(!!$gameMap.event(id)) {
    if ($gameMap.event(id).event().meta[value1]){
      var event = $gameMap.event(id);
      if(id1 == 45){
        $gameMap.event(id).forceMoveRoute({
        "list":[
        {"code":id1,"parameters":[id2]},
        {"code":0}],"repeat":false,"skippable":true});
      } else {
        $gameMap.event(id).forceMoveRoute({
        "list":[
        {"code":id1,"parameters":[id2]},
        {"code":0}],"repeat":false,"skippable":true});
      };
    };
  };
};

};

//id指定でevent_NpcCharaMoveId(3,0,arr1); event_NpcCharaMoveId(45,"UP: 10;",arr1);
event_NpcCharaMoveId = function(id1,id2,arr1){

for (var id = 0; id < arr1.length; id++) {
  if(!!$gameMap.event(arr1[id])) {
    var event = $gameMap.event(arr1[id]);
    if(id1 == 45){
      $gameMap.event(arr1[id]).forceMoveRoute({
      "list":[
      {"code":id1,"parameters":[id2]},
      {"code":0}],"repeat":false,"skippable":true});
    } else {
      $gameMap.event(arr1[id]).forceMoveRoute({
      "list":[
      {"code":id1,"parameters":[id2]},
      {"code":0}],"repeat":false,"skippable":true});
    };
  };
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

if(id1 == 1){
  if(!!$gameMap.event(id2)) {
    $gameMap.event(id2).forceMoveRoute({
    "list":[
    {"code":36},{"code":17},{"code":15, "parameters":[5]},
    {"code":18},{"code":15, "parameters":[5]},
    {"code":19},{"code":15, "parameters":[5]},
    {"code":35},{"code":15, "parameters":[5]},
    {"code":0}],"repeat":false,"skippable":false});
    event_doorOpenCloseSe(id1,id2);
  };
};
if(id1 == 2){
  if(!!$gameMap.event(id2)) {
    $gameMap.event(id2).forceMoveRoute({
    "list":[
    {"code":36},{"code":18},{"code":15, "parameters":[5]},
    {"code":17},{"code":15, "parameters":[5]},
    {"code":16},{"code":15, "parameters":[5]},
    {"code":35},{"code":15, "parameters":[5]},
    {"code":0}],"repeat":false,"skippable":false});
    event_doorOpenCloseSe(id1,id2);
  };
};

};

//扉チップの開閉の際の効果音
event_doorOpenCloseSe = function(id1,id2){

if(id1 == 1){
  if(!!$gameMap.event(id2)) {
    var arr1 = ['Open1',90,100];
    if($gameMap.event(id2).characterName() == '!$fsm_Door06'){
      var arr1 = ['Z_clothesTakeOff',100,80];
    };
    if($gameMap.event(id2).characterName() == '!Door1' && $gameMap.event(id2).characterIndex() == 5){
      var arr1 = ['Z_clothesTakeOff',100,80];
    };
    if($gameMap.event(id2).characterName() == '!Door1' && $gameMap.event(id2).characterIndex() == 6){
      var arr1 = ['Door2',90,100];
    };
    if($gameMap.event(id2).characterName() == '!$SF_Gate1' || $gameMap.event(id2).characterName() == '!$SF_Gate3'){
      var arr1 = ['Open3',90,100];
    };
    if($gameMap.event(id2).characterName() == '!$Gate1' || $gameMap.event(id2).characterName() == '!$Gate2'){
      var arr1 = ['Open3',90,100];
    };
    if($gameMap.event(id2).characterName() == '!$SF_Gate2'){
      var arr1 = ['door6AutoDoorHeavy',90,100];
    };
    AudioManager.playSe({"name":arr1[0],"volume":arr1[1],"pitch":arr1[2],"pan":0});
  };
};
if(id1 == 2){
  if(!!$gameMap.event(id2)) {
    var arr1 = ['Close1',90,150];
    if($gameMap.event(id2).characterName() == '!$fsm_Door06'){
      var arr1 = ['Z_clothesTakeOff',100,80];
    };
    if($gameMap.event(id2).characterName() == '!Door1' && $gameMap.event(id2).characterIndex() == 5){
      var arr1 = ['Z_clothesTakeOff',100,80];
    };
    if($gameMap.event(id2).characterName() == '!Door1' && $gameMap.event(id2).characterIndex() == 6){
      var arr1 = ['Door2',90,150];
    };
    if($gameMap.event(id2).characterName() == '!$SF_Gate1' || $gameMap.event(id2).characterName() == '!$SF_Gate3'){
      var arr1 = ['Close3',90,70];
    };
    if($gameMap.event(id2).characterName() == '!$Gate1' || $gameMap.event(id2).characterName() == '!$Gate2'){
      var arr1 = ['Close3',90,70];
    };
    if($gameMap.event(id2).characterName() == '!$SF_Gate2'){
      var arr1 = ['door6AutoDoorHeavy',90,150];
    };
    AudioManager.playSe({"name":arr1[0],"volume":arr1[1],"pitch":arr1[2],"pan":0});
  };
};

};

//そのマップのNPC死体任意位置作成。ランダムはコモン162
people_bloodBodySet = function(value2,value3){

map_npcGraphicSet();
$gameMap.spawnEvent(74, value2, value3, true);
var eventId = $gameMap.getLastSpawnEventId();
var event = $gameMap.event(eventId);
var arr1 = [6,7];
var value1 = arr1[Math.floor(Math.random() * arr1.length)];
event.setImage('Damage2', value1);
var value4 = Math.floor( Math.random() * $gameVariables.value(36)[1]) + $gameVariables.value(36)[0];
event.setImage($gameVariables.value(33)+$gameVariables.value(35), value4);
event.setDirectionFix(false);
event.setDirection(8);
event.setDirectionFix(true);
$gameMap.spawnEvent(99, value2, value3, true);

};

//イベントメモタグでまとめてセルフスイッチevent_togetherSelf(this._eventId,'B');
event_togetherSelf = function(id1,id2){

for (var id = 100; id > 0; id--) {
  if(id != id1) {
    if(!!$gameMap.event(id)) {
      if ($gameMap.event(id).event().meta['CharaNameId']){
        if (Number($gameMap.event(id1).event().meta['CharaNameId']) == Number($gameMap.event(id).event().meta['CharaNameId'])){
          if([301,302,303,304,305,306,307,308,309,310].some(function(id3){return id == id3})){}else{
            $gameSelfSwitches.setValue([$gameMap.mapId(), id, id2], true);
          };
}}}}};
};

//ｲﾝｼﾞｹｰﾀｰ発生消去event_charaIndicators(1,this._eventId,'Arrow',0,-10,3,10);
//0で0消去1ｱﾆﾒ発生,1ｲﾍﾞﾝﾄid,2ﾌｧｲﾙ名,3x4y,5枚数,6速度
event_charaIndicators = function(id1,id2,id3,id4,id5,id6,id7){

var char = $gameMap.event(id2);
if(id1 == 0){
  char.clearIndicators();
  char._indData.ref = true;
};
if(id1 == 1){
  char.setIndicators(id3,0,false,0,0,"",0,false,false,0,true,id4,id5);
  char._indData.ref = true;
  char._indData.fontSize = 28;
  char._indData.ref = true;
  char._indData.animated = true;
  char._indData.frames = [0,id6,0,id7]; 
};

};


//動物食材指定
animal_IngredientsSelect = function(id1){

var value1 = 1271;
if($gameMap.event(id1)._characterName.match(/Pig/)){var value1 = 1272};
if($gameMap.event(id1)._characterName.match(/Horse/)){var value1 = 1273};
if($gameMap.event(id1)._characterName.match(/Cow/)){var value1 = 1274};
if($gameMap.event(id1)._characterName.match(/Sheep/)){var value1 = 1275};
if($gameMap.event(id1)._characterName.match(/Chicken/)){var value1 = 1276};
if($gameMap.event(id1)._characterName.match(/Goat/)){var value1 = 1277};
if($gameMap.event(id1)._characterName.match(/Monkey/)){var value1 = 1283};
if($gameMap.event(id1)._characterName.match(/Bear/)){var value1 = 1278};
if($gameMap.event(id1)._characterName.match(/Deer/)){var value1 = 1279};
if($gameMap.event(id1)._characterName.match(/Boar/)){var value1 = 1280};
if($gameMap.event(id1)._characterName.match(/BigCat/)){var value1 = 1283};
if($gameMap.event(id1)._characterName.match(/Cow/)){var value1 = 1274};
if($gameMap.event(id1)._characterName.match(/Crab/)){var value1 = 1281};
if($gameMap.event(id1)._characterName.match(/Frog/)){var value1 = 1282};
if($gameMap.event(id1)._characterName.match(/fish/)){var value1 = 1286};

if($gameSwitches.value(258) && $gameMap.event(id1)._characterName.match(/Cow/)){var value1 = 1288};

valueDropItems = value1;
valueanimalEventId = id1;

};

//動物反応指定
animal_ActionSelect = function(id1){

var value1 = 0;
if($gameMap.event(id1)._characterName.match(/Pig/)){var value1 = 1;var value2 = `ブヒっ`};
if($gameMap.event(id1)._characterName.match(/Horse/)){AudioManager.playSe({"name":'Horse',"volume":70,"pitch":100,"pan":0})};
if($gameMap.event(id1)._characterName.match(/Cow/)){AudioManager.playSe({"name":'Cow',"volume":70,"pitch":100,"pan":0})};
if($gameMap.event(id1)._characterName.match(/Sheep/)){var value1 = 1;var value2 = `メェっ…`};
if($gameMap.event(id1)._characterName.match(/Chicken/)){AudioManager.playSe({"name":'Chicken',"volume":70,"pitch":100,"pan":0})};
if($gameMap.event(id1)._characterName.match(/Goat/)){var value1 = 1;var value2 = `メェ～～っ`};
if($gameMap.event(id1)._characterName.match(/Monkey/)){var value1 = 1;var value2 = `ウキィっ！`};
if($gameMap.event(id1)._characterName.match(/Bear/)){AudioManager.playSe({"name":'Monster6',"volume":70,"pitch":80,"pan":0})};
if($gameMap.event(id1)._characterName.match(/Deer/)){var value1 = 1;var value2 = `ピィっ`};
if($gameMap.event(id1)._characterName.match(/Boar/)){var value1 = 1;var value2 = `ブルルゥっ！`};
if($gameMap.event(id1)._characterName.match(/BigCat/)){AudioManager.playSe({"name":'Monster1',"volume":70,"pitch":120,"pan":0})};
if($gameMap.event(id1)._characterName.match(/Cow/)){AudioManager.playSe({"name":'Cow',"volume":70,"pitch":100,"pan":0})};
if($gameMap.event(id1)._characterName.match(/Crab/)){var value1 = 1;var value2 = `カニィっ`};
if($gameMap.event(id1)._characterName.match(/Frog/)){AudioManager.playSe({"name":'Frog',"volume":70,"pitch":100,"pan":0})};
if($gameMap.event(id1)._characterName.match(/fish/)){};

if(value1 == 1){
  valueanimalEvent2Id = value2;
};

};

//エネミーステートでドロップ
//enemy_drop = function(user,enemy){

//};

//}());
