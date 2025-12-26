/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

(function(){

//クエスト報酬設定。クエストで変数21-23は報酬で使っているので使用不可。
quest_housyuukeisan = function (id1) {
  //WARN: valueCountSet1 and valueCountSet2 is not changing here! Some init values?
  var valueCountSet1 = 0;
  var valueCountSet2 = 0;
  
  let valueCountSet3 = `\n\\C[16]●追加報酬\\C[0]\n`;
  let id2 = Number(valueQuestRankD[1]);
  let id3 = Number(valueQuestRankD[2]);
  const itemData = $dataItems[id1];
  const id4 = itemData.iconIndex;

  const set_Id2_id3 = (arr) => {
	  id2 = Number(arr[1]);
	  id3 = Number(arr[2]);
  }
  switch (id4) {
    case 422: // C
    case 426: // EX,C報酬
	  set_Id2_id3(valueQuestRankC);
      break;
    case 423: // B
	  set_Id2_id3(valueQuestRankB);
      break;
    case 424: // A
	  set_Id2_id3(valueQuestRankA);
      break;
    case 425: // S
	  set_Id2_id3(valueQuestRankS);
      break;
  }

  let j = 0;
  for (const i1 in itemData.meta) {
    if (!itemData.meta.hasOwnProperty(i1) || !i1.startsWith('QuestSpcialPrice')) continue;

    const arr1 = itemData.meta[i1].split(',');
    const itemType = Number(arr1[0]);

    let item;
    switch (itemType) {
      case 0:
        item = $dataItems[Number(arr1[1])];
        break;
      case 1:
        item = $dataWeapons[Number(arr1[1])];
        break;
      case 2:
        item = $dataArmors[Number(arr1[1])];
        break;
      case 4:
        item = $dataItems[10];
        break;
      default:
        continue;
    }

    if ($gameSwitches.value(518)) {
      $gameParty.gainItem(item, Number(arr1[2]));
    }

    if (itemType === 3) {
      valueCountSet3 += `[\\C[2]${Number(arr1[2])}\\C[0]\\G] `;
    } else {
      valueCountSet3 += `[${item.name}:\\C[2]+${Number(arr1[2])}\\C[0]] `;
    }

    j += 1;
    if (j % 3 === 0) {
      valueCountSet3 += `\n`;
    }
  }
};

quest_settei_getItemEquipmentSource = function (arr, i) {

  const id = Number(arr[1]);
  switch (id) {
    case 0:
      valueQuestArray1[arr[0]] = [1, i];
      return $dataItems;
    case 1:
      valueQuestArray1[arr[0] + 2000] = [2, i];
      return $dataWeapons;
    case 2:
      valueQuestArray1[arr[0] + 3000] = [3, i];
      return $dataArmors;
    default:
      console.error(`quest_settei_getItemEquipmentSource: id(${id}}) is not 0,1,2!`);
      return null;
  }
}

//クエストの解説、発生、達成の設定value12までで10が未使用value8
quest_settei = function(id5) {
  QuestSystem.process(id5);
};

//クエスト報酬設定
quest_housyuu = function (questId, completionType) {
  const baseItemId = questId >= 1001 ? 900 : 800;
  const questRewardItem = questId >= 1001 ? $dataItems[questId + 50] : $dataItems[questId + 100];
  const questItem = $dataItems[questId];
  const questCategory = questItem.meta['SGカテゴリ'];

  const switch518Enabled = $gameSwitches.value(518);
  const completionTypeIs2 = completionType == 2;

  let completionMessage = ``;
  if (valueQuestArray6[questId - baseItemId] !== 1) {
    completionMessage = `クエスト\\C[2]${questItem.name}\\C[0]は達成条件を満たしていない…。`;

    WindowManager.drawText(0, completionMessage);
    return;
  }

  for (let deliveryId = 1; deliveryId < 10; deliveryId++) {
    if (!questItem.meta['QuestCompDelivery' + deliveryId]) continue;

    let deliveryArr = questItem.meta['QuestCompDelivery' + deliveryId].split(',');
    if (deliveryArr[0] == 0) {
      deliveryArr[0] = 5;
    }

    const deliveryItemCategory = getItemEquipmentSource(deliveryArr[1]);

    if (deliveryArr[0] == 5) continue;

    const deliveryItem = deliveryItemCategory[Number(deliveryArr[0])];
    if (switch518Enabled) {
      $gameParty.loseItem(deliveryItem, Number(deliveryArr[2]));
    }
    const itemName = `\\C[2]${deliveryItem.name}\\C[0]`;
    const itemCount = `\\C[1]${Number(deliveryArr[2])}\\C[0]`;
    completionMessage += `${itemName}を${itemCount}個納品しました。\n`;
    if (completionTypeIs2) {
      CommonPopupManager.showInfo({}, completionMessage, null);
    }
  }

  if (questItem.meta['QuestCompMoney']) {
    let moneyAmount = Number(questItem.meta['QuestCompMoney']);
    if (switch518Enabled) {
      $gameParty.loseGold(moneyAmount);
    }
    completionMessage += `\\C[2]${moneyAmount}\\C[0]\\Gを納めました。\n`;
    if (completionTypeIs2) {
      CommonPopupManager.showInfo({}, completionMessage, null);
    }
  }

  quest_housyuukeisan(questId);

  if (switch518Enabled) {
    if (rewardGoldAmount >= 1) {
      $gameParty.gainGold(rewardGoldAmount);
    }
    if (rewardItemAmount >= 1) {
      $gameParty.gainItem($dataItems[10], rewardItemAmount); //戦貨
    }
    $gameParty.loseItem(questItem, 1);
    $gameParty.gainItem(questRewardItem, 1);
  }

  completionMessage += `クエスト\\C[2]${questItem.name}\\C[0]を達成した！＜報酬:`;

  WindowManager.drawText(0, `クエスト\\C[2]${questItem.name}\\C[0]を達成報告した。`);

  if (rewardGoldAmount >= 1) {
    completionMessage += `\\C[14]${rewardGoldAmount}\\C[0]\\G `;
  }
  if (rewardItemAmount >= 1) {
    completionMessage += `\\C[14]${rewardItemAmount}\\C[0]${$dataItems[10].name} `;
  }

  completionMessage += `＞\n`;

  if (completionTypeIs2) {
    CommonPopupManager.showInfo({}, completionMessage, null);
  }

  if (additionalCompletionText !== ` `) {
    completionMessage += `${additionalCompletionText}\n`;

    if (completionTypeIs2) {
      CommonPopupManager.showInfo({}, completionMessage, null);
    }
  }

  $gameSwitches.setValue(380, true);

  if (switch518Enabled && questCategory) {
    if (questCategory == '受注クエスト' || questCategory == 'ＥＸ受注クエスト') {
      $gameVariables.setValue(50, $gameVariables.value(50) + 1);
    } else {
      $gameVariables.setValue(150, $gameVariables.value(150) + 1);
    }
  }

  if (!completionTypeIs2 && completionType == 1) {
    $gameScreen.setDTextPicture(completionMessage, 28);
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.showPicture(102, '', 1, 640 - 50, 384, 100, 100, 0, 0);
    $gameScreen.movePicture(102, 1, 640, 384, 100, 100, 255, 0, 60);
  }
};

//クエスト達成報告準備
quest_tasseiHoukoku = function(id4,id5){

var id2 = 0;//選択肢順番
var id3 = 101;//ピクチャID
if(id4 >= 1001){
  var id6 = 900;
} else {
  var id6 = 800;
};
for (var i = id4; i <= id5; i++) {
  if($gameParty.hasItem($dataItems[i]) && !$dataItems[i].meta['singleQuestIncidence']){
    if(valueQuestArray6[i-id6] == 1){
      var value1 = `\\C[2][達成]${$dataItems[i].name}\\C[0]`;
    } else {
      var value1 = `\\C[16][未達]${$dataItems[i].name}\\C[0]`;
    };
    const id = 1; 
    const choiceParams = {text: value1,value: i};
    $gameSystem.addCustomChoice(id, choiceParams);
    var value1 = `${valueQuestArray2[i-id4+1]}`;
    $gameScreen.setDTextPicture(value1, 22);
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.showPicture(id3,"",0,600,100,100,100,0,0);
    $gameMessage.setSelectPictureId(id2, id3);
    id2 += 1;
    id3 += 1;
  };
};

};

//クエスト受注情報掲示
quest_jutyuuDisplay = function(id1){

itemGet_afterProcess();
var arr1 = [];
var arr2 = [];
var value3 = 0;
if(id1 == 1){var j = 800;var j1 = 100;var value2 = '受注クエスト'};
if(id1 == 2){var j = 900;var j1 = 50;var value2 = 'デイリークエスト'};
for (var i = 1; i <= $dataItems.length-1; i++) {
  var value1 = 0;
  var value4 = 0;
  if(!$dataItems[i].name == '') {
    if($dataItems[i].meta['EICSwitch']) {
      if(Number($dataItems[i].meta['EICSwitch']) == 108) {
        if($dataItems[i].meta['SGカテゴリ'] == value2) {
          if($dataItems[i].meta['singleQuestIncidence']){}else{
            if($dataItems[i].meta['QuestSetMap'] && $gameVariables.value(230) >= 1) {
              if(Number($dataItems[i].meta['QuestSetMap']) == Number($dataWeapons[$gameVariables.value(230)].meta['MapSwitch']) || Number($dataItems[i].meta['QuestSetMap']) == 0) {
                var value1 = `\x1bI[${$dataItems[i].iconIndex}]${$dataItems[i].name}`;
                if(valueQuestArray5[i-j] == 1){
                  if(!$gameParty.hasItem($dataItems[i+j1])){
                    if(!$gameParty.hasItem($dataItems[i])){
                      var value1 = `\\C[2][受注可能]\\C[0]${value1}`;
                      valueCountSet1 = 1;
                      value4 += 1;
                    } else {
                      var value1 = `\\C[16][受注中]\\C[0]${value1}`; 
                      //value4 += 1;
                    };
                  } else {
                    //var value1 = `\\C[10][完了]\\C[0]${value1}`; 
                  };
                } else {
                  var value1 = `？？？`; 
                      value4 += 1;
                };
              };
            };
            if(value4 >= 1){//if(value1 != 0){
              arr1.push(value1);
              arr2.push(i);
              value3 += 1;
              if(value3 >= 12){//12
                break;
              };
            };
}}}}}};
if(arr1 != 0){
valueWordArray = arr1;
valueCountArray = arr2;

};

};

//クエスト受注設定
quest_jutyuu = function(id1,i){

itemGet_afterProcess();
if(id1 == 1){var j = 800;var j1 = 100;var value2 = '受注クエスト'};
if(id1 == 2){var j = 900;var j1 = 50;var value2 = 'デイリークエスト'};
$gameSwitches.setValue(380,false);
  if(!$dataItems[i].name == '') {
    if($dataItems[i].meta['EICSwitch']) {
      if(Number($dataItems[i].meta['EICSwitch']) == 108) {
        if($dataItems[i].meta['SGカテゴリ'] == value2) {
          if(valueQuestArray5[i-j] == 1){
            if($dataItems[i].meta['singleQuestIncidence']){}else{
              if(!$gameParty.hasItem($dataItems[i+j1])){
                if(!$gameParty.hasItem($dataItems[i])){
                  $gameParty.gainItem($dataItems[i], 1);
                  var value1 = `クエスト\\C[2]\x1bIIN[${i}]\\C[0]を受注しました。`;
                  CommonPopupManager.showInfo({},value1,null); 
                  $gameSwitches.setValue(380,true);
                  AudioManager.playSe({"name":"Z_PaperBreak","volume":100,"pitch":80,"pan":0});
                } else {
                  $gameSwitches.setValue(380,true);
                  var value1 = `既にこのクエストは受注している…。`;
                  CommonPopupManager.showInfo({},value1,null); 
                };
}}}}}}};

};

//クエスト受注設定
quest_jutyuu2 = function(id1){

itemGet_afterProcess();
if(id1 == 1){var j = 800;var j1 = 100;var value2 = '受注クエスト'};
if(id1 == 2){var j = 900;var j1 = 50;var value2 = 'デイリークエスト';$gameSwitches.setValue(644,true)};
$gameSwitches.setValue(380,false);
for (var i = 1; i <= $dataItems.length-1; i++) {
  if(!$dataItems[i].name == '') {
    if($dataItems[i].meta['EICSwitch']) {
      if(Number($dataItems[i].meta['EICSwitch']) == 108) {
        if($dataItems[i].meta['SGカテゴリ'] == value2) {
          if(valueQuestArray5[i-j] == 1){
            if($dataItems[i].meta['singleQuestIncidence']){}else{
              if(!$gameParty.hasItem($dataItems[i+j1])){
                if(!$gameParty.hasItem($dataItems[i])){
                  $gameParty.gainItem($dataItems[i], 1);
                  if(id1 == 1){
                    var value1 = `クエスト\\C[2]\x1bIIN[${i}]\\C[0]を受注しました。`;
                    CommonPopupManager.showInfo({},value1,null); 
                  } else {
                    var value1 = `デイリークエスト\\C[2]\x1bIIN[${i}]\\C[0]を受注しました。`;
                    CommonPopupManager.showInfo({},value1,null); 
                  };
                $gameSwitches.setValue(380,true);
}}}}}}}}};
if($gameSwitches.value(380) && $gameSwitches.value(128) && id1 == 2){
  var value1 = `デイリークエストを受注しました。`;
  CommonPopupManager.showInfo({},value1,null); 
};

};

//単発クエスト発生条件達成しているか。いなかったら発生条件提示
quest_singleJutyuu = function(value1){

$gameSwitches.setValue(380,false);
var value2 = 900;

var value4 = 0;
if($dataItems[value1].meta['SGカテゴリ']){
  if($dataItems[value1].meta['SGカテゴリ'] == 'デイリークエスト'){
    var value2 = 900;
  } else {
    var value2 = 800;
  };
};
if(valueQuestArray5[value1-value2] == 0){
  var value3 = `\x1bI[${$dataItems[value1].iconIndex}]？？？\n`;
} else {
  var value3 = `\x1bI[${$dataItems[value1].iconIndex}]${$dataItems[value1].name}\n`;
  $gameSwitches.setValue(380,true);
};
var arr1 = valueQuestArray7[value1-value2].split("\n");
for (var i = 0; i <= arr1.length-1; i++) {
  if(arr1[i] == 0){}else{
    value3 += `${arr1[i]}`;
    value4 += 1;
    if((value4 %2) == 0){value3 += `\n`};
  };
};
if(!$gameSwitches.value(380)){
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.setDTextPicture(value3, 28);
  $gameScreen.showPicture(55,'',1,640-20,384,100,100,0,0);
  $gameScreen.movePicture(55,1,640,384,100,100,255,0,60);
};

};

}());
