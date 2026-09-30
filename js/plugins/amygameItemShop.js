/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

//アイテム入手後に実行
itemGet_afterProcess = function(){

  if ($gameSwitches.value(29)) return;

  $gameVariables.setValue(289, 4);//タイトル設定可能数
  $gameVariables.setValue(295, 0);//Hタイトル設定可能数
  $gameVariables.setValue(13, 5);//満腹度上限

  title_EffectConfi();
  actors_unlockedClassHit();

  valueQuestArrayEX = Array(201).fill(0);
  const itemsLen = $dataItems.length;

  for (let i = 1; i < itemsLen; i++) {
    const item = $dataItems[i];

    if (item.name === '') continue;

    const itemEICSwitch = item.meta['EICSwitch'];
    if (!itemEICSwitch || Number(itemEICSwitch) !== 108) continue;
    
    if (!$gameParty.hasItem(item)) continue;

    const j = (i <= 900) ? i - 800 : i - 900;

    if (valueQuestArray6[j] === 0) {
      valueQuestArrayEX[j] = valueQuestArray2[j];
    }
  }

  if ($gameVariables.value(203) >= 2) {
    if ($gameParty.hasItem($dataItems[52])) {
      $gameVariables.setValue(203, 2);
    } else {
      $gameVariables.setValue(203, 1);
    };
  };
  
  var medalTotalPts = 0;
  var list = valueCasinoMedalItem;
  list.forEach(function (id) {
    if ($gameParty.hasItem($dataItems[id])) {
      medalTotalPts += Number($dataItems[id].meta['MedalRate']) * $gameParty.numItems($dataItems[id]);
      $gameParty.gainItem($dataItems[id], -9999);
    };
  }, this);
  if (medalTotalPts >= 1) {
    $gameVariables.setValue(69, $gameVariables.value(69) + medalTotalPts);
  };

  quest_settei(1);
  quest_settei(2);
  time_settei();

  if ($gameVariables.value(200) == 3) {//マップステータス表示1非表示2簡易ステ3簡易Ｈステ4収集アイテム5ミニマップ
    actor_miniHstatusList1(283);
  };
  if ($gameVariables.value(200) == 4) {
    item_collectList1(284);
  };

  const isInBattle = $gameParty.inBattle();
  for (let i = 1; i <= 200; i++) {
    const exValue = valueQuestArrayEX[i];
    const currentQuestValue = valueQuestArray2[i];

    if (exValue !== 0 && exValue !== currentQuestValue) {
      const j = (i <= 100) ? i + 800 : i + 900;
      let medalTotalPts = `\x1bIIN[${j}]`;

      CommonPopupManager.showInfo({}, medalTotalPts, null);

      const arr1 = exValue.split("\n");
      const arr2 = currentQuestValue.split("\n");

      for (let id1 = 0, len = arr1.length; id1 < len; id1++) {
        if (arr1[id1] === arr2[id1]) continue;

        CommonPopupManager.showInfo({}, arr2[id1], null);

        if (valueQuestArray6[i] !== 1) continue;

        medalTotalPts = `\x1bIIN[${j}]:[\\C[10]条件達成\\C[0]]`;
        CommonPopupManager.showInfo({}, medalTotalPts, null);

        if (!isInBattle) {
          const particleName = (i >= 101) ? 'cracker_min_r' : 'cracker_min_l';
          $gameScreen._particle.particlePlay(0, particleName, 'player', 'def', 'above');
          // AudioManager.playSe({"name":'Z11_ItemDrop',"volume":25,"pitch":110,"pan":0});
        }
      }
    }
  }

  if ($gameSwitches.value(129)) {
    const dailyQuestName = 'デイリークエスト';
    const dataItemsLength = $dataItems.length;

    for (let i = 1; i <= dataItemsLength - 1; i++) {
      const currentItem = $dataItems[i];

      if (
        currentItem.name === '' ||
        Number(currentItem.meta['EICSwitch']) !== 108 ||
        currentItem.meta['SGカテゴリ'] !== dailyQuestName ||
        !$gameParty.hasItem(currentItem) ||
        valueQuestArray6[i - 900] !== 1
      ) {
        // Skip to the next iteration if any condition fails
        continue;
      }

      $gameSwitches.setValue(518, true);
      quest_housyuu(i, 2);
      $gameSwitches.setValue(518, false);
    }
  }

  let hasParameterIncrease = false;
  const variable352Values = $gameVariables.value(352);
  for (let armorIndex = 1, armorLength = valueArmorsLength; armorIndex <= armorLength; armorIndex++) {
    const currentArmor = $dataArmors[armorIndex];

    if (!(currentArmor.etypeId === 6 && currentArmor.meta['ItemPicture'] && $gameParty.hasItem(currentArmor, true))) {
      continue;
    }

    let itemCount = $gameParty.numItems(currentArmor);

    if ($gameParty.membersEqArmor(armorIndex)) {
      itemCount += 1;
    }

    if (itemCount < 2) {
      continue;
    }

    const seisyoujuuIndex = armorIndex - valueSeisyoujuuStartId;
    if (variable352Values[seisyoujuuIndex] === undefined) {
      continue;
    }

    itemCount = itemCount - 1;
    const initialParamValue = variable352Values[seisyoujuuIndex];
    variable352Values[seisyoujuuIndex] += itemCount;
    $gameParty.loseItem(currentArmor, itemCount);
    seisyoujuu_addParams(armorIndex);

    AudioManager.playSe({ "name": "Magic2", "volume": 100, "pitch": 130, "pan": 0 });

    const seName = `charge_c`;
    $gameScreen._particle.particlePlay(0, seName, 'player', 'def', 'above');
    $gameScreen._particle.particleUpdate([seName, 'emitterLifetime', 1]);
    $gameScreen._particle.particleExceed(seName, 0.5);

    const armorName = `\\C[2]\x1bAIN[${armorIndex}]\\C[0]`
    const itemCnt = `\\C[10]+${itemCount}\\C[0]`;
    const popupMessage = `${armorName} [強化値:${initialParamValue}${itemCnt}]<パラメータアップ！>`;
    CommonPopupManager.showInfo({}, popupMessage, null);

    hasParameterIncrease = true;
  }
  if (hasParameterIncrease) {
    const battleMembers = $gameParty.battleMembers();
    const len = battleMembers.length;
    for (let actorIndex = 0; actorIndex < len; actorIndex++) {
      const actor = battleMembers[actorIndex];
      if (!actor) continue;
      actor.refresh();
    }
  }

  $gameSwitches.setValue(380, false);
};

//アイテムのHPMPポーション効果
item_Potion1 = function(a,b,itemId){

var potionResistDelta = Number($dataItems[itemId].meta['PotionResist']);
var currentResist = $gameVariables.value(380 + b.actorId())[58];
var potionUsePoint = Number($dataItems[itemId].meta['PotionUsePoint']);
if(b.isStateAffected(291)){
  var potionResistDelta = 0;
} else {
  b.addState(39);
};
if(potionUsePoint == 1){
  if($dataItems[itemId].damage.type == 3){
    valuePotion1 = Math.round(b.mhp * (100-currentResist)/100);
  } else {
    valuePotion1 = Math.round(b.mmp * (100-currentResist)/100);
  };
} else {
  valuePotion1 = Math.round(potionUsePoint * (100-currentResist)/100);
};
$gameVariables.value(380 + b.actorId())[58] += potionResistDelta;
if($dataItems[itemId].damage.type == 3){
  var hpMpLabel = `HP`;
} else {
  var hpMpLabel = `MP`;
};
if(b.isStateAffected(291)){
  var potionMessage = `${b.name()}の${hpMpLabel}が${valuePotion1}回復！ 耐性値上昇は無効化されている。[${$gameVariables.value(380 + b.actorId())[58]}%]`;
} else {
  var potionMessage = `${b.name()}の${hpMpLabel}が${valuePotion1}回復！ 耐性値が${potionResistDelta}%上昇し${$gameVariables.value(380 + b.actorId())[58]}%になった。`;
};
if($gameParty.inBattle()){
  BattleManager._logWindow.push(`addText`, potionMessage);
} else {
  TickerManager.show(potionMessage);
};

};

//各アイテム収集率
collect_keisan1 = function(){

var totalItemCount = 0;
var ownedItemCount = 0;
var start = 401;
var end = 500;
for (var i = start; i <= end; i++) {
  if ($dataItems[i].name !== '') {
    totalItemCount += 1;
  if($gameParty.hasItem($dataItems[i])){
    ownedItemCount += 1;
}}};
$gameVariables.setValue(321,[ownedItemCount,totalItemCount]);
var totalItemCount = 0;
var ownedItemCount = 0;
var start = 501;
var end = 600;
for (var i = start; i <= end; i++) {
  if ($dataItems[i].name !== '') {
    totalItemCount += 1;
  if($gameParty.hasItem($dataItems[i])){
    ownedItemCount += 1;
}}};
$gameVariables.setValue(322,[ownedItemCount,totalItemCount]);
var totalItemCount = 0;
var ownedItemCount = 0;
var start = 601;
var end = 700;
for (var i = start; i <= end; i++) {
  if ($dataItems[i].name !== '') {
    totalItemCount += 1;
  if($gameParty.hasItem($dataItems[i])){
    ownedItemCount += 1;
}}};
$gameVariables.setValue(323,[ownedItemCount,totalItemCount]);
var totalItemCount = 0;
var ownedItemCount = 0;
var start = 701;
var end = 800;
for (var i = start; i <= end; i++) {
  if ($dataItems[i].name !== '') {
    totalItemCount += 1;
  if($gameParty.hasItem($dataItems[i])){
    ownedItemCount += 1;
}}};
$gameVariables.setValue(324,[ownedItemCount,totalItemCount]);
var totalItemCount = 0;
var start = 801;
var end = 900;
for (var i = start; i <= end; i++) {
  if ($dataItems[i].name !== '') {
    totalItemCount += 1;
}};
var totalItemCount = 0;
var start = 901;
var end = 1000;
for (var i = start; i <= end; i++) {
  if ($dataItems[i].name !== '') {
  if($gameParty.hasItem($dataItems[i])){
    ownedItemCount += 1;
}}};
$gameVariables.setValue(325,[ownedItemCount,totalItemCount]);

};

//鑑定実行中身
kantei_nakami = function(){

$gameParty.loseItem($dataItems[$gameVariables.value(19)], 1);
if($dataItems[$gameVariables.value(19)].meta['鑑定']){
  var arr = $dataItems[$gameVariables.value(19)].meta['鑑定'].split(',');
  var chosenItemIndex = arr[getRandomIndex(arr.length)];
};
if($dataItems[$gameVariables.value(19)].meta['鑑定道具']){var item = $dataItems};
if($dataItems[$gameVariables.value(19)].meta['鑑定武器']){var item = $dataWeapons};
if($dataItems[$gameVariables.value(19)].meta['鑑定防具']){var item = $dataArmors};
if($dataItems[$gameVariables.value(19)].meta['鑑定防具']){
  var itemListEnd = valueArmorsLength;
} else {
  var itemListEnd = item.length-1;
};
if(!item){return};
//武器は武器タイプ$dataWeapons[id].wtypeId
//防具は装備タイプ$dataArmors[id].etypeId
//道具はメタでカテゴリ
if(item == $dataWeapons && $dataItems[$gameVariables.value(19)].meta['鑑定カテゴリ']){
  var arr1 = [];
  var list = $dataItems[$gameVariables.value(19)].meta['鑑定カテゴリランク'].split(',');
  list.forEach(function(id1) {
    for (var i = 1; i <= itemListEnd; i++) {
      if(item[i].meta['LotteryRearity']){
        if(item[i].wtypeId == Number($dataItems[$gameVariables.value(19)].meta['鑑定カテゴリ']) && 
        Number(item[i].meta['LotteryRearity']) == id1){
          arr1.push(i);
    }}};
  }, this);
  var chosenItemIndex = arr1[getRandomIndex(arr1.length)];
};
if(item == $dataArmors && $dataItems[$gameVariables.value(19)].meta['鑑定カテゴリ']){
  var arr1 = [];
  var list = $dataItems[$gameVariables.value(19)].meta['鑑定カテゴリランク'].split(',');
  list.forEach(function(id1) {
    for (var i = 1; i <= itemListEnd; i++) {
      if(item[i].meta['LotteryRearity']){
        if(item[i].etypeId == Number($dataItems[$gameVariables.value(19)].meta['鑑定カテゴリ']) && 
        Number(item[i].meta['LotteryRearity']) == id1){
          arr1.push(i);
    }}};
  }, this);
  var chosenItemIndex = arr1[getRandomIndex(arr1.length)];
};
if(item == $dataItems && $dataItems[$gameVariables.value(19)].meta['鑑定カテゴリ']){
  var arr1 = [];
  var list = $dataItems[$gameVariables.value(19)].meta['鑑定カテゴリランク'].split(',');
  list.forEach(function(id1) {
    for (var i = 1; i <= itemListEnd; i++) {
      if(item[i].meta['Menu Category'] && item[i].meta['LotteryRearity']){
        if(item[i].meta['Menu Category'] == $dataItems[$gameVariables.value(19)].meta['鑑定カテゴリ'] && 
        Number(item[i].meta['LotteryRearity']) == id1){
          arr1.push(i);
    }}};
  }, this);
  var chosenItemIndex = arr1[getRandomIndex(arr1.length)];
};
if($dataItems[$gameVariables.value(19)].meta['鑑定レアリティ版']){
  var arr1 = [];
  var list = $dataItems[$gameVariables.value(19)].meta['鑑定レアリティ版'].split(',');
  list.forEach(function(id1) {
    for (var i = 1; i <= itemListEnd; i++) {
      if(item[i].meta['LotteryRearity']){
        if(Number(item[i].meta['LotteryRearity']) == id1){
          arr1.push(i);
      }};
    };
  }, this);
  var chosenItemIndex = arr1[getRandomIndex(arr1.length)];
};
var appraisalItem = item[chosenItemIndex];
if(!appraisalItem){return};
$gameParty.gainItem(appraisalItem, 1);
//一括鑑定時で条件分岐
  var value = `\x1bI[${appraisalItem.iconIndex}]${appraisalItem.name}`;
  var acquiredItemMessage = `\\C[16]${value}\\C[0]を入手した。`;
if(!$gameSwitches.value(114)){
  TickerManager.show(acquiredItemMessage);
} else {
  CommonPopupManager.showInfo({},acquiredItemMessage,null);
};

};

//鑑定アイテム版
kantei_item = function(a,b,itemId){

if(b.actorId() == a.actorId()){
  $gameVariables.setValue(19,itemId)
  var actor = a;
  var targetItemData = $dataItems[$gameVariables.value(19)];
  var appraisalSuccessFlag = 0;
  var id1 = valueAppraisalSkillId;
  if(actor.mp >= $dataSkills[id1].mpCost){
    if(actor.isLearnedSkill(id1)){
      if(targetItemData.meta['下級鑑定品'] && actor.skillMasteryLevel(id1) >= 1){
        var appraisalSuccessFlag = 1;
      };
      if(targetItemData.meta['中級鑑定品'] && actor.skillMasteryLevel(id1) >= 2){
        var appraisalSuccessFlag = 1;
      };
      if(targetItemData.meta['上級鑑定品'] && actor.skillMasteryLevel(id1) >= 3){
        var appraisalSuccessFlag = 1;
      };
      if(appraisalSuccessFlag == 1){
        kantei_nakami();
        if(actor.skillMasteryLevel(id1) <= 3){
          actor.gainMp(-$dataSkills[id1].mpCost);
          actor.gainSkillMasteryUses(id1, $gameVariables.value(203));//変更熟練度
          TickerManager.show(`${actor.name()}のMPが5消費された。【現在MP${actor.mp}/${actor.param(1)}】＜\\C[3]\x1bSIN[${id1}]\\C[0]＞熟練度\\V[203]獲得！（${actor.skillMasteryUses(id1)}/${actor.skillMasteryUsageMax(id1)}）`);
        };
      } else {
        TickerManager.show(`\\C[1]\x1bSIN[${id1}]ランク\\C[0]が足りません…。`);
      };
    } else {
      TickerManager.show(`パーソナルスキル＜\\C[3]\x1bSIN[${id1}]\\C[0]＞が必要です…。`);
    };
  } else {
    TickerManager.show(`${actor.name()}のMPが足りません…。`);
  };
};

};

//鑑定一括
kantei_ikkatu = function(a,b,itemId){

$gameSwitches.setValue(69,true);
$gameSwitches.setValue(114,true);
const len = $dataItems.length;
for (let i = 1; i < len; i++) {
  const item = $dataItems[i];
  if(item.meta['下級鑑定品'] || item.meta['中級鑑定品'] || item.meta['上級鑑定品']){
    if($gameParty.hasItem(item)){
      $gameVariables.setValue(19,i);
      kantei_nakami();
      if($gameParty.hasItem(item)){
        i -= 1;
      }
    }
  }
}
$gameSwitches.setValue(114,false);
$gameSwitches.setValue(69,false);

};

//店で鑑定一括
kantei_shopikkatu1 = function(){

var lowAppraisalCount = 0; 
var midAppraisalCount = 0; 
var highAppraisalCount = 0;
var start = 1;var end = $dataItems.length-1;
for (var i = start; i <= end; i++) {
  if($gameParty.hasItem($dataItems[i])){
    if ($dataItems[i].meta['下級鑑定品']) {
      lowAppraisalCount += $gameParty.numItems($dataItems[i]);
    };
    if ($dataItems[i].meta['中級鑑定品']) {
      midAppraisalCount += $gameParty.numItems($dataItems[i]);
    };
    if ($dataItems[i].meta['上級鑑定品']) {
      highAppraisalCount += $gameParty.numItems($dataItems[i]);
    };
}};
if(lowAppraisalCount + midAppraisalCount + highAppraisalCount == 0){
  $gameSwitches.setValue(116,true);
} else {
  var lowFee = lowAppraisalCount * 10;
  var midFee = midAppraisalCount * 100;
  var highFee = highAppraisalCount * 1000;
  var totalFee = lowFee + midFee + highFee;
  $gameVariables.setValue(21,totalFee);
  var feeDisplayText = `鑑定料金表\n（下級：100\\G）（中級：500\\G）（上級：1000\\G）\n`;
  if(lowAppraisalCount >= 1){
    feeDisplayText += `下級鑑定品：\\C[1]${lowAppraisalCount}\\C[0]個\n`;
  };
  if(midAppraisalCount >= 1){
    feeDisplayText += `中級鑑定品：\\C[1]${midAppraisalCount}\\C[0]個\n`;
  };
  if(highAppraisalCount >= 1){
    feeDisplayText += `上級鑑定品：\\C[1]${highAppraisalCount}\\C[0]個\n`;
  };
  feeDisplayText += `合計鑑定料金\\C[10]${totalFee}\\C[0]\\G\\$`;
  WindowManager.show(0, 10, 100, 800, 300);
  WindowManager.drawText(0, feeDisplayText);
};

};

//拾得物スクリプト。item_getScript1(0,1);
item_getScript1 = function(id11,id10){

//var actor = $gameActors.actor($gameVariables.value(2));
const item = $gameVariables.value(240) >= 1 ? 
$dataItems[$gameVariables.value(240)] : 
$dataWeapons[$gameVariables.value(230)];
if(!item){return};

const itemUniqueMaterial = item.meta['UniqueMaterial' + id10];
if (itemUniqueMaterial === undefined || itemUniqueMaterial === null) return;

const itemUniqueMaterialArray = item.meta['UniqueMaterial' + id10].split(',');
const materialIndex = $gameSwitches.value(605) ? 
Number(itemUniqueMaterialArray[0]) :
itemUniqueMaterialArray[getRandomIndex(itemUniqueMaterialArray.length)];

const gatherSkillId = id11 == 0 ? valueHarvestingSkillId : valueMiningSkillId;
item_getSkillLevel(gatherSkillId,0,materialIndex);

};

//熟練度上昇拾得物。スキルid、アイテム種別3お金0アイテム1武器2防具、金額orアイテムID,0でスキル熟練度のみアップ
item_getSkillLevel = function(skillId,itemType,id3){

let skillGainMessage = `　`; 
let skillLevel = 0;
const actor = $gameActors.actor($gameVariables.value(11)); 
if(!actor || !$dataSkills[skillId]){return};

const isLearnedSkill = actor.isLearnedSkill(skillId);
const skillMasteryLevel = isLearnedSkill ? actor.skillMasteryLevel(skillId) : 0;
if (skillMasteryLevel == Number($dataSkills[skillId].meta['Max Mastery Level'])){}else{
  if (isLearnedSkill && skillMasteryLevel >= 0){
    skillLevel = skillMasteryLevel;
    actor.gainSkillMasteryUses(skillId, $gameVariables.value(203)); //変更熟練度
    let skillDisplayName = `${$dataSkills[skillId].name}`;
    skillDisplayName = skillDisplayName.replace("＜ON＞", "");
    skillDisplayName = skillDisplayName.replace("＜OFF＞", "");
    skillGainMessage = `\\C[1]＜${skillDisplayName}＞\\C[0]熟練度\\C[10]\\V[203]\\C[0]獲得！`;
  }
}

let id4 = skillMasteryLevel;
if(id4 == 0){id4 = 1}
else if(id3 == 10 || id3 == 141){
  if(actor.isLearnedSkill(799)){
    id4 = id4 * 10;
  };
};

let gainReportText = `　`;
if(id3 >= 1){
  let item;
  if(itemType == 0){item = $dataItems};
  if(itemType == 1){item = $dataWeapons};
  if(itemType == 2){item = $dataArmors};
  if(itemType == 3){
    id3 = id3 * id4;
    $gameParty.gainGold(id3);
    gainReportText = `\\C[3]小銭を拾った。（+\\C[10]${id3}\\C[0]\\G）`;
  } else if(item && item[id3]){
    $gameParty.gainItem(item[id3],id4);
    gainReportText = `\\C[3]\x1bI[${item[id3].iconIndex}]${item[id3].name}\\C[0]を\\C[10]${id4}\\C[0]個入手した。`;
  };
};
CommonPopupManager.showInfo({},gainReportText + skillGainMessage,null);
if(isLearnedSkill){
  valueScriptArray1 = [$gameVariables.value(11),skillLevel,skillId];
} else {
  valueScriptArray1 = [$gameVariables.value(11),0,0];
}

}

//熟練度上昇拾得物。後半
item_getSkillLevel2 = function(){

  const skillId = valueScriptArray1 ? valueScriptArray1[2] : 0;
  if (skillId < 1) return;

  const actor = $gameActors.actor(valueScriptArray1[0]);
  const skill = $dataSkills[skillId];
  if (!actor || !skill) return;
  let maxSkillMasteryLevel = Number(skill.meta['Max Mastery Level']);
  let skillRarity = ``;
  const skillMasteryLevel = actor.skillMasteryLevel(skillId);
  if(actor.isLearnedSkill(skillId) && skillMasteryLevel >= 0){
    skillRarity = get_skill_rarity(skillMasteryLevel, maxSkillMasteryLevel);
    const skillRarityName = `${skill.name + skillRarity}`;
    const skillUses = `\\C[2]${actor.skillMasteryUses(skillId)}\\C[0]`;
    const skillUsageMax = `\\C[2]${actor.skillMasteryUsageMax(skillId)}\\C[0]`;
    let infoMessageText = `${skillRarityName}　Uses:${skillUses}／${skillUsageMax}`;
    if (skillMasteryLevel == maxSkillMasteryLevel){
      infoMessageText = `${skillRarityName} \\C[10]Complete!\\C[0]`;
    };
    CommonPopupManager.showInfo({},infoMessageText,null);
  };

  const lastSkillMasteryLevel = valueScriptArray1[1];
  if (lastSkillMasteryLevel >= 1 && skillMasteryLevel > lastSkillMasteryLevel){
    $gameSwitches.setValue(133,true);
    let skillName = `${skill.name}`;
    skillName = skillName.replace("＜ON＞", "");
    skillName = skillName.replace("＜OFF＞", "");
    skillName = `\\C[1]＜${skillName}＞\\C[0]`;
    if (skillMasteryLevel == maxSkillMasteryLevel){
      valueWordSet1 = `${actor.name()}の${skillName}がカンストした！`;
    } else {
      valueWordSet1 = `${actor.name()}の${skillName}が${skillRarity}にランクアップ！`;
    }
  }
}

const skillMasteryLevelRarityMarks = [`\\C[4][E]\\C[0]`, `\\C[4][E]\\C[0]`, `\\C[12][D]\\C[0]`, `\\C[5][C]\\C[0]`, `\\C[13][B]\\C[0]`, `\\C[27][A]\\C[0]`, `\\C[30][S]\\C[0]`];
get_skill_rarity = function (skillMasteryLevel, maxSkillMasteryLevel){

  let skillRarityIndex = skillMasteryLevel;
  if (maxSkillMasteryLevel < 6) skillRarityIndex++;
  if (skillRarityIndex >= skillMasteryLevelRarityMarks.length) skillRarityIndex = skillMasteryLevelRarityMarks.length - 1;

  return skillMasteryLevelRarityMarks[skillRarityIndex];
}

//アイテム使用で熟練度アップ
item_skilljukurenndoup = function(id1){

var actor = $gameActors.actor($gameVariables.value(20));
var value = $dataItems[$gameVariables.value(93)]
var appraisalTargetId = $gameVariables.value(19);
if(!actor || !$dataSkills[appraisalTargetId]){return};
var masteryGain = $gameVariables.value(22) * $gameVariables.value(203);//変更熟練度
var skillType = $dataSkills[appraisalTargetId].stypeId;
valueCountSet1 = 0;
if($dataSkills[appraisalTargetId].meta['Max Mastery Level']){
  var usageMax = actor.skillMasteryUsageMax(appraisalTargetId);
  var rankUpMessage = 0;
  $gameVariables.setValue(23,actor.skillMasteryLevel(appraisalTargetId));
  if(id1 == 2){
    actor.gainSkillMasteryUses(appraisalTargetId, masteryGain);
    $gameParty.loseItem(value, 1);
    var usageMax = actor.skillMasteryUsageMax(appraisalTargetId);
    var infoMessageText = `${actor.name()}の\\C[${valueSkillColorArr[skillType]}]＜\x1bSIN[${appraisalTargetId}]＞\\C[0]熟練度が${masteryGain}上昇した！（${actor.skillMasteryUses(appraisalTargetId)}/${usageMax}）`
    var currentMasteryLevel = actor.skillMasteryLevel(appraisalTargetId);
    if(currentMasteryLevel > $gameVariables.value(23)){
      if(!$gameParty.inBattle()){$gamePlayer.requestAnimation(300)};      
      var rankUpMessage = `${actor.name()}の\\C[${valueSkillColorArr[skillType]}]＜\x1bSIN[${appraisalTargetId}]＞\\C[0]が\\C[2]${currentMasteryLevel}\\C[0]にランクアップ！`;
      gab_wordParticle(rankUpMessage);
    };
    $gameSystem.pushInfoLog(infoMessageText);
    if(rankUpMessage != 0){
      $gameSystem.pushInfoLog(rankUpMessage);
    };
  } else {
    if($dataSkills[appraisalTargetId].meta['NoJpBook']){
      var infoMessageText = `\\C[${valueSkillColorArr[skillType]}]＜\x1bSIN[${appraisalTargetId}]＞\\C[0]は対象に選べない…。`;
    } else {
      if(actor.skillMasteryLevel(appraisalTargetId) >= Number($dataSkills[appraisalTargetId].meta['Max Mastery Level'])){
        var infoMessageText = `${actor.name()}の\\C[${valueSkillColorArr[skillType]}]＜\x1bSIN[${appraisalTargetId}]＞\\C[0]は最大ランクに達しているため使用できない。`;
      } else {
        valueCountSet1 += appraisalTargetId;
        var infoMessageText = `\\C[${valueSkillColorArr[skillType]}]\x1bSIN[${appraisalTargetId}]\\C[0] 熟練度:${actor.skillMasteryUses(appraisalTargetId)}/${usageMax}　\\C[10]（もう一度選択で使用されます）\\C[0]`;
      };
    };
  };
} else {
  var infoMessageText = `\\C[${valueSkillColorArr[skillType]}]＜\x1bSIN[${appraisalTargetId}]＞\\C[0]はランクが存在しないスキルのため使用できない…。`;
};
WindowManager.drawText(1, `${infoMessageText}`);

};

//アイテム価格等説明
item_priceinfo = function(id1,itemId){

if(id1 == 0){var valueItems = $dataItems}; 
if(id1 == 1){var valueItems = $dataWeapons}; 
if(id1 == 2){var valueItems = $dataArmors};
if(!valueItems || !valueItems[itemId]){return};
var priceInfoText = ``;
if(Number(valueItems[itemId].price) >= 1){
  var itemInfoValue = Math.floor(valueItems[itemId].price/2);
  var priceInfoText = `買取価格:\\C[2]${itemInfoValue.toLocaleString()}\\C[0]\\G\n`
};
if(valueItems[itemId].meta['Sell Price']){
  var itemInfoValue = Number(valueItems[itemId].meta['Sell Price']);
  var priceInfoText = `買取価格:\\C[2]${itemInfoValue.toLocaleString()}\\C[0]\n`;
};
if(valueItems[itemId].meta['Variable 57 Sell Price']){
  var itemInfoValue = Number(valueItems[itemId].meta['Variable 57 Sell Price']);
  var priceInfoText = `売却pt:\\C[2]${itemInfoValue.toLocaleString()}${$dataSystem.variables[57]}\\C[0]\n`;
};
if(valueItems[itemId].meta['Variable 69 Sell Price']){
  var itemInfoValue = Number(valueItems[itemId].meta['Variable 69 Sell Price']);
  var priceInfoText = `売却pt:\\C[2]${itemInfoValue.toLocaleString()}${$dataSystem.variables[69]}\\C[0]\n`;
};
if(valueItems[itemId].meta['Item 270 Sell Price']){
  var itemInfoValue = Number(valueItems[itemId].meta['Item 270 Sell Price']);
  var priceInfoText = `売却:\\C[2]${$dataItems[270].name}${itemInfoValue.toLocaleString()}個\\C[0]\n`;
};
if(valueItems[itemId].meta['Item 147 Sell Price']){
  var itemInfoValue = Number(valueItems[itemId].meta['Item 147 Sell Price']);
  var priceInfoText = `売却:\\C[2]${$dataItems[147].name}${itemInfoValue.toLocaleString()}個\\C[0]\n`;
};
if(valueItems[itemId].meta['Item 152 Sell Price']){
  var itemInfoValue = Number(valueItems[itemId].meta['Item 152 Sell Price']);
  var priceInfoText = `売却:\\C[2]${$dataItems[152].name}${itemInfoValue.toLocaleString()}個\\C[0]\n`;
};
if(Number(valueItems[itemId].price) == 0 &&
!valueItems[itemId].meta['Sell Price'] &&
!valueItems[itemId].meta['Variable 57 Sell Price'] &&
!valueItems[itemId].meta['Variable 69 Sell Price'] &&
!valueItems[itemId].meta['Item 270 Sell Price'] &&
!valueItems[itemId].meta['Item 147 Sell Price'] &&
!valueItems[itemId].meta['Item 152 Sell Price']) {
  var priceInfoText = `\\C[1][売却不可]\\C[0]\n`;
};
//抽選に応じたランク指定
if(valueItems[itemId].meta['LotteryRearity']){
  var itemInfoValue = Number(valueItems[itemId].meta['LotteryRearity']);
  priceInfoText += `ランク:\\C[14]${itemInfoValue}\\C[0]\n`;
} else {
  priceInfoText += `ランク:──\n`;
};
if(!valueItems[itemId].meta.ShopRank){
  priceInfoText += `\\C[29][非売品]\\C[0]\n`;
};
if(valueItems[itemId].meta.ShopRank && !valueItems[itemId].meta['LotteryRearity']){
  priceInfoText += `\\C[29][販売のみ]\\C[0]\n`;
};
if($gameSelfSwitches.getVariableValue([4, 11+id1, itemId]) == 1){
  priceInfoText += `\\C[10][一括売却対象]\\C[0]\n`;
};
if(id1 == 1){
    if(valueItems[itemId].wtypeId >= 1){
      var itemInfoValue = $dataSystem.weaponTypes[valueItems[itemId].wtypeId];
        priceInfoText += `基本通常攻撃:`;
        if(itemInfoValue == `剣`){priceInfoText += `\\C[2]Sword\\C[0]<\\SIN[101]>\n[与D*1.0倍/対象前衛のみ]\n`};
        if(itemInfoValue == `短剣`){priceInfoText += `\\C[2]Dagger\\C[0]<\\SIN[111]>\n[与D*0.5倍/2Hit/対象前衛のみ]\n`};
        if(itemInfoValue == `刀`){priceInfoText += `\\C[2]Blade\\C[0]<\\SIN[121]>\n[与D*0.9倍/対象前衛のみ]\n`};
        if(itemInfoValue == `杖`){priceInfoText += `\\C[2]Wand\\C[0]<\\SIN[131]>\n[与D*1.0倍]\n`};
        if(itemInfoValue == `拳`){priceInfoText += `\\C[2]Fist\\C[0]<\\SIN[141]>\n[与D*0.4倍/2Hit/対象前衛のみ]\n`};
        if(itemInfoValue == `槍`){priceInfoText += `\\C[2]Lance\\C[0]<\\SIN[151]>\n[与D*1.2倍/対象前衛のみ]\n`};
        if(itemInfoValue == `斧`){priceInfoText += `\\C[2]Axe\\C[0]<\\SIN[161]>\n[与D*1.5倍/対象前衛のみ]\n`};
        if(itemInfoValue == `銃`){priceInfoText += `\\C[2]Gun\\C[0]<\\SIN[171]>\n[与D*0.5倍+固定ダメ/即死付与]\n`};
        if(itemInfoValue == `弓`){priceInfoText += `\\C[2]Bow\\C[0]<\\SIN[181]>\n[与D*0.8倍/浮遊特攻]\n`};
        if(itemInfoValue == `楽器`){priceInfoText += `\\C[2]Instrument\\C[0]<\\SIN[191]>\n[与D*0.5倍/ランダムデバフ]\n`};
        if(itemInfoValue == `針`){priceInfoText += `\\C[2]Needle\\C[0]<\\SIN[81]>\n[与D*1.0倍/対象前衛のみ/装備条件なし]\n`};
        if(itemInfoValue == `鞭`){priceInfoText += `\\C[2]Whip\\C[0]<\\SIN[84]>\n[与D*0.5倍/全体攻撃/装備条件なし]\n`};
        if(itemInfoValue == `鈍器`){priceInfoText += `\\C[2]Blow\\C[0]<\\SIN[901]>\n[与D*1.0倍/対象前衛のみ]\n`};
        if(itemInfoValue == `爪`){priceInfoText += `\\C[2]Claw\\C[0]<\\SIN[911]>\n[与D*1.0倍/対象前衛のみ]\n`};
        if(itemInfoValue == `牙`){priceInfoText += `\\C[2]Fang\\C[0]<\\SIN[921]>\n[与D*1.0倍/対象前衛のみ]\n`};
    };
};
if(valueItems[itemId].meta['SetBonus']){
  priceInfoText += `\\C[14][セットボーナス効果]\\C[0]\n`;
};
if(valueItems[itemId].meta['Custom Equip Requirement Text'] || valueItems[itemId].meta['Equip Requirement']){
  priceInfoText += `\\C[10][装備条件あり]\\C[0]\n`;
};
//レアリティ昇格素材か否か
if(valueItems[itemId].meta['LRpromotionM']){
  priceInfoText += `\\C[28][RarelityLR解放素材]\\C[0]\n`;
};
if(valueItems[itemId].meta['URpromotionM']){
  priceInfoText += `\\C[28][RarelityUR解放素材]\\C[0]\n`;
};
if(valueItems[itemId].meta['SSRpromotionM']){
  priceInfoText += `\\C[28][RarelitySSR解放素材]\\C[0]\n`;
};
if(valueItems[itemId].meta['SRpromotionM']){
  priceInfoText += `\\C[28][RarelitySR解放素材]\\C[0]\n`;
};
if(valueItems[itemId].meta['RpromotionM']){
  priceInfoText += `\\C[28][RarelityR解放素材]\\C[0]\n`;
};
//ジョブ解放素材か否か
if(valueItems[itemId].meta['class2JobReleaseM']){
  priceInfoText += `\\C[20][Class2ndJob解放素材]\\C[0]\n`;
};
if(valueItems[itemId].meta['returnItem']){
  var itemInfoValue = 22
  for (var i = 1; i <= 100; i++) {
    if($gameVariables.value(327)[i] == 2){
      var itemInfoValue = i;
      break;
    };
  };
  priceInfoText += `\\C[20][現在の帰還先]\\C[0]\n`;
  priceInfoText += `${$dataWeapons[itemInfoValue].name}\n`;
};
//アビリティ解放素材か否か
if(valueItems[itemId].meta['AbilityLearnM']){
  var itemInfoValue = Number(valueItems[itemId].meta['AbilityLearnM']);
  priceInfoText += `\\C[3][アビリティ習得コスト素材]\\C[0]\n`;
  priceInfoText += `\\C[21]${$dataClasses[itemInfoValue].name}系列\\C[0]\n`;
};
//錬金素材か否か
if(id1 == 0){var synthItemId = itemId}; 
if(id1 == 1){var synthItemId = itemId + 2000}; 
if(id1 == 2){var synthItemId = itemId + 3000}; 
if(valueItemsSynth1[synthItemId] != 0){
  priceInfoText += `[錬金素材元対象]\n`;
  if(valueItemsSynth1[synthItemId].length >= 40){//文字数カウント
    priceInfoText += `\\C[14][多岐に渡る錬金素材元]\\C[0]\n`;
  } else {
    var actor = $gameActors.actor($gameVariables.value(2));
    if(valueItems[itemId].meta['LotteryRearity']){
      if(actor.skillMasteryLevel(valueAlchemySkillId) <= 3 && Number(valueItems[itemId].meta['LotteryRearity']) >= 8){
        priceInfoText += `\\C[10]錬金Rank4以上で表示\\C[0]\n`;
      } else {
        priceInfoText += `\\C[3]${valueItemsSynth1[synthItemId]}\\C[0]\n`;
      };
    } else {
      priceInfoText += `\\C[3]${valueItemsSynth1[synthItemId]}\\C[0]\n`;
    };
  };
};
//アイテム単一合成時のインフォの定型パターン
if(valueItems[itemId].meta['単一アイテム錬金']){
  var alchemySkillId = valueAlchemySkillId;//錬金スキル
  var arr1 = valueItems[itemId].meta['単一アイテム錬金'].split(',');
  //if($gameParty.hasItem(valueItems[Number(arr1[0])])){//前提アイテム消去
  if(true){
    priceInfoText += `[可]\\C[14]${valueItems[Number(arr1[2])].name}\\C[0]
[要]\\C[2]${$dataSkills[alchemySkillId].name}Rank${arr1[1]}\\C[0]
\\C[1]${valueItems[itemId].name}\\C[0]×${arr1[3]}個\n`;
  };
};
//クエスト素材か判定
if(id1 == 0 && valueQuestArray1[itemId] && valueQuestArray1[itemId][0] == 1 || id1 == 1 && valueQuestArray1[itemId+2000] && valueQuestArray1[itemId+2000][0] == 2 || id1 == 2 && valueQuestArray1[itemId+3000] && valueQuestArray1[itemId+3000][0] == 3){
  priceInfoText += `\\C[14][クエスト指定素材]\\C[0]`;
  if(valueQuestArray1[itemId][1] >= 801 && valueQuestArray1[itemId][1] <= 900){
    if($gameParty.hasItem($dataItems[valueQuestArray1[itemId][1] + 100],true)){
      priceInfoText += `\\C[2](済)\\C[0]\n`;
    } else {
      priceInfoText += `\\C[10](未)\\C[0]\n`;
    };
  } else {
    priceInfoText += `\\C[11](ﾃﾞｲﾘｰ)\\C[0]\n`;
  };
};

if(id1 == 2){
  if(valueItems[itemId].etypeId == 6){
    if(valueItems[itemId].meta['ItemPicture']){
      priceInfoText += `強化値:\\C[10]${$gameVariables.value(352)[itemId - valueSeisyoujuuStartId]}\\C[0]\n`;
}}};
if(valueItems[itemId].meta['GatchaHasRange']){
  priceInfoText += `[所持でガチャ排出品に追加]\n`;
};
$gameVariables.setValue(801,priceInfoText);

};

//アイテム使用時の単一合成パターン。使用アイテムを素材にする場合
item_synthesis = function(a,b,itemId){

if(b.actorId() == a.actorId()){
  if(!$dataItems[itemId].meta['単一アイテム錬金']){return};
  var arr1 = $dataItems[itemId].meta['単一アイテム錬金'].split(',');
  var alchemySkillRef = valueAlchemySkillId;//錬金スキル
  var alchemyBoostSkillId = 792;//錬金増加スキル
  //if($gameParty.hasItem($dataItems[Number(arr1[0])])){//前提アイテム消去
    if(true){
    var actor = $gameActors.actor($gameVariables.value(2));
    if(actor.isLearnedSkill(alchemyBoostSkillId)){craftAmount = 2} else {craftAmount = 1};
    if(actor.isLearnedSkill(alchemySkillRef) && actor.skillMasteryLevel(alchemySkillRef) >= Number(arr1[1]) ){
      if($gameParty.numItems($dataItems[itemId]) < Number(arr1[3]) ){
        TickerManager.show('必要素材が足りません。');
      } else { 
        AudioManager.playSe({"name":"Z11_AlchemySuccess","volume":80,"pitch":110,"pan":0});
        $gameParty.loseItem($dataItems[itemId], Number(arr1[3]) );
        $gameParty.gainItem($dataItems[ Number(arr1[2]) ], craftAmount);
        var craftSuccessMessage = `\x1bIIN[${itemId}]を${arr1[3]}個消費して\\C[10]\x1bIIN[${Number(arr1[2])}]\\C[0]を${craftAmount}個制作した！`;
        var craftInfoMessage = `\x1bIIN[${itemId}]\\C[1]${$gameParty.numItems($dataItems[itemId])}\\C[0]個/\x1bIIN[${Number(arr1[2])}]\\C[10]${$gameParty.numItems($dataItems[Number(arr1[2])])}\\C[0]個`
        TickerManager.show(craftSuccessMessage);
        TickerManager.show(craftInfoMessage);
      };
    } else { 
      TickerManager.show('主人公の\x1bSIN[${value1}]ランクが必要値に達していません。');
    };
  } else { 
    TickerManager.show('しかし、何も起こらなかった…。');
  };
};

};

//錬金アイテムの素材となるアイテムへの説明追加分
item_addSynthesisHelp = function(){

valueItemsSynth1 = Array(4001).fill(0);
var alchemySkillId = valueAlchemySkillId;//錬金スキル
var alchemySkillRank = 1;//錬金スキルランク
var actor = $gameActors.actor($gameVariables.value(2));
if(!actor){return};
var start = 1;
var end = $dataItems.length-1;
for (var i = start; i <= end; i++) {
  if($dataItems[i].meta['Item Recipe']){
    for (var j = 0; j <= $dataItems[i].recipeItem.length-1; j++) {
      for (var id1 = 0; id1 <= $dataItems[ $dataItems[i].recipeItem[j] ].synthIngredients.length-1; id1++) {
        var synthIngredient = DataManager.getSynthesisIngredient($dataItems[$dataItems[i].recipeItem[j]], id1);
        if(synthIngredient.meta['No Augment Slots']){
          if(synthIngredient.etypeId == 1){
            var augmentSlotOffset = 2000;
          } else {
            var augmentSlotOffset = 3000;
          };
        } else {
          var augmentSlotOffset = 0;
        };
        if(!actor.isLearnedSkill(alchemySkillId)){
          var ingredientDisplayText = `？？？\n`;
        } else {
          var ingredientDisplayText = `\x1bIIN[${$dataItems[i].recipeItem[j]}]\n`;
        };
        if(valueItemsSynth1[synthIngredient.id + augmentSlotOffset] == 0){
          valueItemsSynth1[synthIngredient.id + augmentSlotOffset] = ingredientDisplayText;
        } else {
          valueItemsSynth1[synthIngredient.id + augmentSlotOffset] += ingredientDisplayText;
        };
      };
    };
  };
  if($dataItems[i].meta['Weapon Recipe']){
    for (var j = 0; j <= $dataItems[i].recipeWeapon.length-1; j++) {
      for (var id1 = 0; id1 <= $dataWeapons[ $dataItems[i].recipeWeapon[j] ].synthIngredients.length-1; id1++) {
        var synthIngredient = DataManager.getSynthesisIngredient($dataWeapons[$dataItems[i].recipeWeapon[j]], id1);
        if(synthIngredient.meta['No Augment Slots']){
          if(synthIngredient.etypeId == 1){
            var augmentSlotOffset = 2000;
          } else {
            var augmentSlotOffset = 3000;
          };
        } else {
          var augmentSlotOffset = 0;
        };
        if(!actor.isLearnedSkill(alchemySkillId)){
          var ingredientDisplayText = `？？？\n`;
        } else {
          var ingredientDisplayText = `\x1bWIN[${$dataItems[i].recipeWeapon[j]}]\n`;
        };
        if(valueItemsSynth1[synthIngredient.id + augmentSlotOffset] == 0){
          valueItemsSynth1[synthIngredient.id + augmentSlotOffset] = ingredientDisplayText;
        } else {
          valueItemsSynth1[synthIngredient.id + augmentSlotOffset] += ingredientDisplayText;
        };
      };
    };
  };
  if($dataItems[i].meta['Armor Recipe']){
    for (var j = 0; j <= $dataItems[i].recipeArmor.length-1; j++) {
      for (var id1 = 0; id1 <= $dataArmors[ $dataItems[i].recipeArmor[j] ].synthIngredients.length-1; id1++) {
        var synthIngredient = DataManager.getSynthesisIngredient($dataArmors[$dataItems[i].recipeArmor[j]], id1);
        if(synthIngredient.meta['No Augment Slots']){
          if(synthIngredient.etypeId == 1){
            var augmentSlotOffset = 2000;
          } else {
            var augmentSlotOffset = 3000;
          };
        } else {
          var augmentSlotOffset = 0;
        };
        if(!actor.isLearnedSkill(alchemySkillId)){
          var ingredientDisplayText = `？？？\n`;
        } else {
          var ingredientDisplayText = `\x1bAIN[${$dataItems[i].recipeArmor[j]}]\n`;
        };
        if(valueItemsSynth1[synthIngredient.id + augmentSlotOffset] == 0){
          valueItemsSynth1[synthIngredient.id + augmentSlotOffset] = ingredientDisplayText;
        } else {
          valueItemsSynth1[synthIngredient.id + augmentSlotOffset] += ingredientDisplayText;
        };
      };
    };
  };
};

};

//固有武器拡張要素設定
weapon_uniqueSet = function(id1){

var enhanceAppliedFlag = 0;
if (!$dataWeapons[id1+80] || $dataWeapons[id1+80].name !== '') {
  for (var i = 1; i <= 9; i++) {
    if($dataWeapons[id1+80].meta['EnhanceName'+i]){
      var arr1 = $dataWeapons[id1+80].meta['EnhanceName'+i].split(',');
      if($gameVariables.value(287)[id1][10] >= Number(arr1[0])){
        $dataWeapons[id1+80].name = arr1[1] + $dataWeapons[id1+80].meta['BasicName'];
        var enhanceAppliedFlag = 1;
        var uniqueSkillId = Number($dataWeapons[id1+80].meta['UniqueOugi']) + 1;
  }}}
  if(enhanceAppliedFlag == 0){
    $dataWeapons[id1+80].name = $dataWeapons[id1+80].meta['BasicName'];
    var uniqueSkillId = Number($dataWeapons[id1+80].meta['UniqueOugi']);
  };
  $gameVariables.value(287)[id1][9] = uniqueSkillId;
  $dataWeapons[id1+80].traits = [];
  $dataWeapons[id1+80].traits.push({code: 43, dataId: uniqueSkillId, value: 0.00})
  for (var i = 11; i <= 30; i++) {
    if($gameVariables.value(287)[id1][i] >= 1){
      if($gameVariables.value(287)[id1][i] == 1){ $dataWeapons[id1+80].traits.push({code: 22, dataId: 0, value: 0.01}) };
      if($gameVariables.value(287)[id1][i] == 2){ $dataWeapons[id1+80].traits.push({code: 22, dataId: 1, value: 0.01}) };
      if($gameVariables.value(287)[id1][i] == 3){ $dataWeapons[id1+80].traits.push({code: 22, dataId: 2, value: 0.01}) };
      if($gameVariables.value(287)[id1][i] == 4){ $dataWeapons[id1+80].traits.push({code: 22, dataId: 7, value: 0.01}) };
      if($gameVariables.value(287)[id1][i] == 5){ $dataWeapons[id1+80].traits.push({code: 22, dataId: 8, value: 0.01}) };
      if($gameVariables.value(287)[id1][i] == 6){ $dataWeapons[id1+80].traits.push({code: 22, dataId: 9, value: 0.01}) };
      if($gameVariables.value(287)[id1][i] == 7){ $dataWeapons[id1+80].traits.push({code: 21, dataId: 0, value: 1+0.05}) };//MHP未使用
      if($gameVariables.value(287)[id1][i] == 8){ $dataWeapons[id1+80].traits.push({code: 21, dataId: 1, value: 1+0.05}) };//MMP未使用
      if($gameVariables.value(287)[id1][i] == 9){ $dataWeapons[id1+80].traits.push({code: 21, dataId: 2, value: 1+0.05}) };
      if($gameVariables.value(287)[id1][i] == 10){ $dataWeapons[id1+80].traits.push({code: 21, dataId: 3, value: 1+0.05}) };
      if($gameVariables.value(287)[id1][i] == 11){ $dataWeapons[id1+80].traits.push({code: 21, dataId: 4, value: 1+0.05}) };
      if($gameVariables.value(287)[id1][i] == 12){ $dataWeapons[id1+80].traits.push({code: 21, dataId: 5, value: 1+0.05}) };
      if($gameVariables.value(287)[id1][i] == 13){ $dataWeapons[id1+80].traits.push({code: 21, dataId: 6, value: 1+0.05}) };
      if($gameVariables.value(287)[id1][i] == 14){ $dataWeapons[id1+80].traits.push({code: 21, dataId: 7, value: 1+0.05}) };
  }};
  $gamePlayer.refresh();
};

};

//固有武器追加説明valueCountSet3 = 3;
weapon_uniqueAdd = function(itemId){

var enhanceInfoText = `\\C[14]強化段階:${$gameVariables.value(287)[itemId-80][10]}/20\\C[0]\n`;
var passiveStateData = $dataStates[Number($dataWeapons[itemId].meta['Passive State'])];
if($gameVariables.value(287)[itemId-80][10] >= 5 && passiveStateData && passiveStateData.meta['PassiveAddDescription']){
  enhanceInfoText += `付与効果:${passiveStateData.meta['PassiveAddDescription']}\n`;
};
var effectCount = 0;
for (var i = 0; i <= 7; i++) {
  if($gameVariables.value(287)[itemId-80][i] >= 1){
    if(i == 0){enhanceInfoText += `\\I[32]\\C[2]+${$gameVariables.value(287)[itemId-80][i]}\\C[0] `;effectCount += 1};
    if(i == 1){enhanceInfoText += `\\I[33]\\C[2]+${$gameVariables.value(287)[itemId-80][i]}\\C[0] `;effectCount += 1};
    if(i == 2){enhanceInfoText += `\\I[34]\\C[2]+${$gameVariables.value(287)[itemId-80][i]}\\C[0] `;effectCount += 1};
    if(i == 3){enhanceInfoText += `\\I[35]\\C[2]+${$gameVariables.value(287)[itemId-80][i]}\\C[0] `;effectCount += 1};
    if(i == 4){enhanceInfoText += `\\I[36]\\C[2]+${$gameVariables.value(287)[itemId-80][i]}\\C[0] `;effectCount += 1};
    if(i == 5){enhanceInfoText += `\\I[37]\\C[2]+${$gameVariables.value(287)[itemId-80][i]}\\C[0] `;effectCount += 1};
    if(i == 6){enhanceInfoText += `\\I[38]\\C[2]+${$gameVariables.value(287)[itemId-80][i]}\\C[0] `;effectCount += 1};
    if(i == 7){enhanceInfoText += `\\I[39]\\C[2]+${$gameVariables.value(287)[itemId-80][i]}\\C[0] `;effectCount += 1};
    if((effectCount %valueCountSet3) == 0){
    enhanceInfoText += `\n`;
    };
  };
};
enhanceInfoText += `\n`;
var effectCount = 0;
for (var i = 11; i <= 30; i++) {
  if($gameVariables.value(287)[itemId-80][i] >= 1){
    if($gameVariables.value(287)[itemId-80][i] == 1){var effectIconText = `\\I[630]+1%`};
    if($gameVariables.value(287)[itemId-80][i] == 2){var effectIconText = `\\I[632]+1%`};
    if($gameVariables.value(287)[itemId-80][i] == 3){var effectIconText = `\\I[631]+1%`};
    if($gameVariables.value(287)[itemId-80][i] == 4){var effectIconText = `\\I[640]+1%`};
    if($gameVariables.value(287)[itemId-80][i] == 5){var effectIconText = `\\I[641]+1%`};
    if($gameVariables.value(287)[itemId-80][i] == 6){var effectIconText = `\\I[642]+1%`};
    if($gameVariables.value(287)[itemId-80][i] == 7){var effectIconText = `\\I[32]+5%`};
    if($gameVariables.value(287)[itemId-80][i] == 8){var effectIconText = `\\I[33]+5%`};
    if($gameVariables.value(287)[itemId-80][i] == 9){var effectIconText = `\\I[34]+5%`};
    if($gameVariables.value(287)[itemId-80][i] == 10){var effectIconText = `\\I[35]+5%`};
    if($gameVariables.value(287)[itemId-80][i] == 11){var effectIconText = `\\I[36]+5%`};
    if($gameVariables.value(287)[itemId-80][i] == 12){var effectIconText = `\\I[37]+5%`};
    if($gameVariables.value(287)[itemId-80][i] == 13){var effectIconText = `\\I[38]+5%`};
    if($gameVariables.value(287)[itemId-80][i] == 14){var effectIconText = `\\I[39]+5%`};
    effectCount += 1
    enhanceInfoText += `[${effectIconText}]`;
    if((effectCount %valueCountSet3) == 0){
      enhanceInfoText += `\n`;
}}};
if(valueCountSet3 == 3){
  $gameVariables.setValue(801,$gameVariables.value(801) + `${enhanceInfoText}`);
} else {
  $gameVariables.setValue(801,`${enhanceInfoText}`);
};

};

//固有武器強化過程weapon_uniqueEnhance($gameVariables.value(20));2,3,4,5,6,7
weapon_uniqueEnhance = function(id,id2){

if(id2 == 1){
  var enhanceCostValue = 1500;
  var arr1 = [30,0,0,0,0,0];
  var arr2 = [0,0];
  if($gameVariables.value(287)[id][10] >= 1){
    var enhanceCostValue = 3000 * $gameVariables.value(287)[id][10];
    var arr1 = [30,0,0,0,0,0];
    var arr2 = [0,0];
  };
  if($gameVariables.value(287)[id][10] >= 5){
    var enhanceCostValue = 5000 * $gameVariables.value(287)[id][10];
    var arr1 = [50,0,30,0,0,0];
    var arr2 = [1204,$gameVariables.value(287)[id][10]];
  };
  if($gameVariables.value(287)[id][10] >= 10){
    var enhanceCostValue = 10000 * $gameVariables.value(287)[id][10];
    var arr1 = [100,0,50,30,30,0];
    var arr2 = [1206,$gameVariables.value(287)[id][10]];
  };
  if($gameVariables.value(287)[id][10] >= 15){
    var enhanceCostValue = 100000 * $gameVariables.value(287)[id][10];
    var arr1 = [100,0,50,50,50,50];
    var arr2 = [1208,$gameVariables.value(287)[id][10]];
  };
  valueCountSet1 = enhanceCostValue;
  valueScriptArray1 = arr1;
  valueScriptArray2 = arr2;
};
if(id2 == 2){
  var arr3 = valueScriptArray1;
  for (var i = 0; i <= 5; i++) {
    if(arr3[i] >= 1){
      $gameVariables.value(287)[id][i+2] += arr3[i];
    };
  };
};

};

//収集表示アイテムリスト表示item_collectList1(  );
item_collectList1 = function(id1){

var start = 1;var end = 4;
for (var i = start; i <= end; i++) {
  if($gameVariables.value(id1)[i] == 0){
    eval("var collectSlot" + i + "=  `[登録なし]`");
  }else{
    eval("var collectSlot" + i + "=  `[${$dataItems[$gameVariables.value(id1)[i]].name}:${$gameParty.numItems($dataItems[$gameVariables.value(id1)[i]])}]`");
}};
$gameScreen.setDTextPicture(collectSlot1+collectSlot2, 22);
$gameScreen.setDTextPicture(collectSlot3+collectSlot4, 22);
$gameScreen.dWindowFrame = 'ON';
$gameScreen.showPicture(48,"",0,10,698,100,100,255,0);

};

//収集表示アイテムリスト表示actor_miniHstatusList1(330);
actor_miniHstatusList1 = function(id1){

var girlMemberCount = 0;
var start = 0;var end = 3;
for (var i = start; i <= end; i++) {
  if($gameParty.battleMembers()[i]){
    var memberActorId = $gameParty.battleMembers()[i].actorId()
    if(isGirl($gameActors.actor(memberActorId))){
      girlMemberCount += 1;
      var actor = $gameActors.actor(memberActorId);
      if($dataActors[memberActorId].meta['IconGura']){
        $gameVariables.value(id1)[i] = `\x1bI[${Number($dataActors[memberActorId].meta['IconGura'])}]`;
      } else {
        $gameVariables.value(id1)[i] = `[${actor.name()}]`;
      };
/*:
      $gameVariables.value(id1)[i] = `[${actor.name()}]`;
      var value3 = actor.name().length;
      var value5 = 6 - value3;
      if(value5 <= -1){value5 = 0};
      for (var j = 0; j <= value5; j++) {
        $gameVariables.value(id1)[i] += `　`;
      };
*/
      $gameVariables.value(id1)[i] += `\\I[12]:${$gameVariables.value(memberActorId+380)[1]} \\I[376]:${$gameVariables.value(memberActorId+380)[2]}`;
      var list = valueHstateDisplay;
      list.forEach(function(id) {
        if(actor.isStateAffected(id)){
          $gameVariables.value(id1)[i] += `\\I[${$dataStates[id].iconIndex}]`;
        ;}
      }, this);
      $gameScreen.setDTextPicture($gameVariables.value(id1)[i], 22);
}}};
if(girlMemberCount >= 1){
  var iconOffsetValue = 758 + (girlMemberCount * -30);
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.showPicture(48,"",0,10,iconOffsetValue,100,100,255,0);
};

};

//ショップの品目指定。shop_preparation1(1,1,0);//種類/ランク/0読み込みのみ1ショップ処理実行valueCountSet3 = 5;//4,6
shop_preparation1 = function(id1,id2,id3){

var array = [];
if(id1 == 1){valueItems = $dataWeapons};
if(id1 == 2){valueItems = $dataArmors};
if(id1 == 0){valueItems = $dataItems};
var start = 1;
if(id1 == 2){
  var end = valueArmorsLength;
} else {
  var end = valueItems.length-1;
};
if(id1 == 0){var rankMatchFlag = true};
for (var i = start; i <= end; i++) {
  if(valueItems[i].meta['ShopRank'] && valueItems[i].meta['LotteryRearity']){
    if(valueItems[i].meta['SeiyokuItem']){}else{
      if(id1 == 1 || id1 == 2){
        if(valueCountSet3 == valueItems[i].etypeId){
          var rankMatchFlag = true;
        } else {
          var rankMatchFlag = false;
        };
      };
      if(rankMatchFlag){
        var lotteryRarity = Number(valueItems[i].meta['LotteryRearity']);
        if(lotteryRarity == id2){
          var arr1 = [0,0,0,0];
          arr1[0] = id1;
          arr1[1] = i;
          array.push(arr1);//この場合はこちらが正解
        };
      };
    };
}};
if(id3 == 1){
  goods = array;
  SceneManager.push(Scene_Shop);
  SceneManager.prepareNextScene(goods, false);
};

};

//性欲品ショップ。shop_preparationH(0,1,1);
shop_preparationH = function(id1,id2,id3){

var array = [];
var list = [0,1,2];
list.forEach(function(id1) {
  if(id1 == 1){valueItems = $dataWeapons};
  if(id1 == 2){valueItems = $dataArmors};
  if(id1 == 0){valueItems = $dataItems};
  var start = 1;
    if(id1 == 2){
    var end = valueArmorsLength;
  } else {
    var end = valueItems.length-1;
  };
  for (var i = start; i <= end; i++) {
    if(valueItems[i].meta['SeiyokuItem']){
      if(Number(valueItems[i].meta['SeiyokuItem']) == id2){
        var arr1 = [0,0,0,0];
        arr1[0] = id1;
        arr1[1] = i;
        array.push(arr1);//この場合はこちらが正解
  }}};
}, this);
if(id3 == 1){
  goods = array;
  SceneManager.push(Scene_Shop);
  SceneManager.prepareNextScene(goods, true);
};

};

//食品ショップ。shop_preparationE(0,1,1);
shop_preparationE = function(id1,id2,id3){

var array = [];
valueItems = $dataItems
var start = 1;
var end = valueItems.length-1;
for (var i = start; i <= end; i++) {
  if(valueItems[i].meta['EatShop']){
    if(Number(valueItems[i].meta['EatShop']) == id2){
      var arr1 = [0,0,0,0];
        arr1[0] = id1;
        arr1[1] = i;
        array.push(arr1);//この場合はこちらが正解
}}};
if(id3 == 1){
  goods = array;
  SceneManager.push(Scene_Shop);
  SceneManager.prepareNextScene(goods, true);
};

};

//食材ショップ。shop_preparationEI(0,1,1);
shop_preparationEI = function(id1,id2,id3){

var array = [];
valueItems = $dataItems
var start = 1;
var end = valueItems.length-1;
for (var i = start; i <= end; i++) {
  if(valueItems[i].meta['IngredientsShop']){
    if(Number(valueItems[i].meta['IngredientsShop']) == id2){
      var arr1 = [0,0,0,0];
        arr1[0] = id1;
        arr1[1] = i;
        array.push(arr1);//この場合はこちらが正解
}}};
if(id3 == 1){
  goods = array;
  SceneManager.push(Scene_Shop);
  SceneManager.prepareNextScene(goods, true);
};

};

//カジノ"Variable 69 Buy Price",ブースト薬"Variable 57 Buy Price" otherShop_preparation1(57,0,1);
otherShop_preparation1 = function(buyPriceVarId,id2,id3){//id2が0で一括

var array = [];
for (var id1 = 0; id1 <= 2; id1++) {
  if(id1 == 1){var valueItems = $dataWeapons};
  if(id1 == 2){var valueItems = $dataArmors};
  if(id1 == 0){var valueItems = $dataItems};
  var start = 1;
  if(id1 == 2){
    var end = valueArmorsLength;
  } else {
    var end = valueItems.length-1;
  };
  for (var i = start; i <= end; i++) {
    if(valueItems[i].meta['Variable '+buyPriceVarId+' Buy Price']){//<Variable 69 Buy Price: 100000>
      if(id2 == 0){var rarityMatchFlag = true};
      if(id2 >= 1){var rarityMatchFlag = Number(valueItems[i].meta['LotteryRearity']) == id2};
      if(rarityMatchFlag){
        var arr1 = [0,0,1,0];
        arr1[0] = id1;
        arr1[1] = i;
        array.push(arr1);
      };
    };
  };
};
if(id3 == 1){
  goods = array;
  SceneManager.push(Scene_Shop);
  SceneManager.prepareNextScene(goods, true);
};

};

bookShop_preparert2 = function(id1,id2,id3){

var array = [];
valueItems = $dataItems
var start = 1;
var end = valueItems.length-1;
for (var i = start; i <= end; i++) {
  if(valueItems[i].meta['bookShop']){
    if(Number(valueItems[i].meta['bookShop']) == id2){
      var arr1 = [0,0,0,0];
        arr1[0] = id1;
        arr1[1] = i;
        array.push(arr1);//この場合はこちらが正解
}}};
if(id3 == 1){
  goods = array;
  SceneManager.push(Scene_Shop);
  SceneManager.prepareNextScene(goods, true);
};

};

bookShop_preparert = function(id1){

for (var i = 1; i <= $dataItems.length-1; i++) {
  if($dataItems[i].name !== '') {
    if($dataItems[i].meta['bookShop']) {
      if(Number($dataItems[i].meta['Max Item']) == 1){
        var bookOwnedFlag = $gameParty.numItems($dataItems[i]) == 0;
      } else {
        var bookOwnedFlag = true;
      };
      if(Number($dataItems[i].meta['bookShop']) == id1 && bookOwnedFlag) {
        var bookPrice = $dataItems[i].price;
        if(valueCountSet3 != 0){
          var bookPrice = Math.floor(bookPrice - (bookPrice * valueCountSet3 / 100));
        };
        if($gameParty.numItems($dataItems[i]) >= 1){
          var bookOwnedLabel = `\\C[10][${$gameParty.numItems($dataItems[i])}冊所持]\\C[0] `;
        } else {
          var bookOwnedLabel = `\\C[3][未所持]\\C[0] `;
        };
        var bookName = $dataItems[i].name;
        if(bookName.length <= 19){
          for (var j = bookName.length; j <= 20; j++) {
            bookName += `　`; 
          };
        };
        var bookListText = `${bookName}${bookOwnedLabel} \\C[2]${bookPrice.toLocaleString()}\\C[0]\G`;
        var bookDescriptionText = `${$dataItems[i].description}`;
        if($dataItems[i].meta['ADDescription']){
          //<ADDescription:\sin[788]:\SD[788]>
          var adDescription = $dataItems[i].meta['ADDescription'];
          var adDescription = adDescription.replace("\\sin[", "");
          var adSkillCode = `${adDescription.charAt(0)}${adDescription.charAt(1)}`;
          if(adDescription.charAt(2) != ']'){adSkillCode += adDescription.charAt(2)};
          var bookDescriptionText = `${bookDescriptionText}\n${$dataSkills[Number(adSkillCode)].name}:${$dataSkills[Number(adSkillCode)].description}`;
        };
        const id = 1; 
        const choiceParams = {
        text: bookListText,
        value: valueCountSet2};
        $gameSystem.addCustomChoice(id, choiceParams);
        $gameScreen.setDTextPicture(bookDescriptionText, 28);
        $gameScreen.dWindowFrame = 'ON';
        $gameScreen.showPicture(valueCountSet1,'',0,10,606,100,100,255,0);
        $gameMessage.setSelectPictureId(valueCountSet2, valueCountSet1);
        valueCountSet1 += 1;
        valueCountSet2 += 1;
        valueScriptArray2.push(i);
      };
    };
  };
};

};

//<jouhouBuyVariable:135,1><jouhouBuySwitche:135>
jouhouShop_preparert = function(){

var arr1 = [];
for(var i = 1; i <= $dataItems.length-1; i++){
  if($dataItems[i].meta['jouhouBuyVariable']){
    var arr2 = $dataItems[i].meta['jouhouBuyVariable'].split(',');
    if(Number(arr2[0]) >= 1){
      if($gameVariables.value(Number(arr2[0])) >= Number(arr2[1])){
        arr1.push(i);
      } else {
        arr1.push(6);
      };
  }};
  if($dataItems[i].meta['jouhouBuySwitche']){
    if(Number($dataItems[i].meta['jouhouBuySwitche']) >= 1){
      if($gameSwitches.value(Number($dataItems[i].meta['jouhouBuySwitche']))){ 
        arr1.push(i);
      } else {
        arr1.push(6);
      };
  }};
  var infoItemNameText = 6;//jouhouBuyItem
  if($dataItems[i].meta['jouhouBuyItem']){
    var arr2 = $dataItems[i].meta['jouhouBuyItem'].split(',');
    for(var j = 0; j <= arr2.length-1; j++){
      if(Number(arr2[j]) >= 1){
        if($gameParty.hasItem($dataItems[Number(arr2[j])],true)){
          var infoItemNameText = i;
        };
    }}
    arr1.push(infoItemNameText);
  };
};
for(var j = 0; j <= arr1.length-1; j++){
  var infoItemNameText = $dataItems[arr1[j]].name;//
  if(arr1[j] != 6){
    infoItemNameText += ` \\C[2](${$dataItems[arr1[j]].price.toLocaleString()}\\G)\\C[0]`;
    if($gameParty.hasItem($dataItems[arr1[j]],true)){
      infoItemNameText += `\\C[10][購入済み]\\C[0]`;
    };
  };
  const id = 1; 
  const choiceParams = {
  text: `${infoItemNameText}`,
  value: arr1[j]};
  $gameSystem.addCustomChoice(id, choiceParams);
};

};

//食事イベント
item_eatEvent2 = function(a,b,itemId){

if(b.actorId() == a.actorId()){
  if(!$gameSwitches.value(603)){
    if($gameVariables.value(13) > $gameVariables.value(16)){
      for(var i = 1; i <= 9; i++){
        if($dataItems[itemId].meta['eatEffect' + i]){
          var arr3 = $dataItems[itemId].meta['eatEffect' + i].split(',');
          $gameVariables.value(620).push([Number(arr3[0]),Number(arr3[1]),Number(arr3[2])]);
        };
      };
      $gameVariables.setValue(16,$gameVariables.value(16) + 1);
      $gameParty.members().forEach(function(actor) {
        actor.addState(107);
      });
      trait_changeSetting(107);
      $gameParty.gainItem($dataItems[itemId], -1);
      AudioManager.playSe({"name":"Z_Eat","volume":100,"pitch":100,"pan":0});
      if($dataItems[itemId].meta['Drink']){
        var eatOutcomeText = `飲んだ！`;
      } else {
        if($dataItems[itemId].meta['Alcohol']){
          var eatOutcomeText = `呑んだ！`;
        } else {
          var eatOutcomeText = `食べた！`;
        };
      };
      var eatInfoMessage = `\x1bIIN[${itemId}]を${eatOutcomeText}。（満腹度:\\C[3]${$gameVariables.value(16)}\\C[0]/\\C[10]${$gameVariables.value(13)}\\C[0]）\n`;
      eatInfoMessage += `${$dataStates[107].description}\n
※ \\C[10]ウィンドウ消去はカーソルをそのままで決定ボタンorマウス左クリック。\\C[0]
`;
      WindowManager.show(0, 0, 0, 1280, 290);
      WindowManager.drawText(0, eatInfoMessage);
      valueCountSet1 = 1;
      if($dataItems[itemId].meta['EventOnSwitch']){
        var eatOutcomeText = Number($dataItems[itemId].meta['EventOnSwitch']);
        if(eatOutcomeText >= 2 && !$gameSwitches.value(eatOutcomeText)){
          $gameSwitches.setValue(eatOutcomeText,true);
      }};
      $gameSwitches.setValue(603,true);
    } else {
      TickerManager.show(`満腹でこれ以上は食べられない…。（満腹上限:\\C[10]${$gameVariables.value(13)}\\C[0]）`);
    };
  } else {
    WindowManager.hide(0);
    valueCountSet1 = 0;
    $gameSwitches.setValue(603,false);
  };
};

};

//食事イベント、没
item_eatEvent = function(a,b,itemId){

if($gameVariables.value(16) > $gameVariables.value(13)){
  TickerManager.show('満腹でこれ以上は食べられない…。');
} else {
  var eatStuffValue = Number($dataItems[itemId].meta['Stuff']);
  var eatTpValue = Number($dataItems[itemId].meta['ＴＰ']);
  $gameVariables.setValue(16,$gameVariables.value(16) + eatStuffValue);
  $gameParty.members().forEach(function(actor) {
  actor.gainTp(eatTpValue);
  });
    AudioManager.playSe({"name":"Z_Eat","volume":100,"pitch":100,"pan":0});
    if($dataItems[itemId].meta['Drink']){
      var eatResultText = `飲んだ！`;
    } else {
      if($dataItems[itemId].meta['Alcohol']){
        var eatResultText = `呑んだ！`;
      } else {
        var eatResultText = `食べた！`;
    }};
  TickerManager.show(`\\C[24]\x1bIIN[${itemId}]\\C[0]を${eatResultText} TP\\C[2]${eatTpValue}\\C[0]%UP! 満腹度\\C[2]${eatStuffValue}\\C[0]上昇(\\V[16]/\\V[13])`);
  $gameParty.loseItem($dataItems[itemId], 1);
  if($dataItems[itemId].meta['OnSwitch']){
    var eatResultText = Number($dataItems[itemId].meta['OnSwitch']);
    if(eatResultText >= 1 && !$gameSwitches.value(eatResultText)){
      $gameSwitches.setValue(eatResultText,true);
      time_settei();//scene_jouken(1);
  }};
};

};

//アイテム財布からルビ入手。
wallet_insideGet = function(a,b,itemId,id1){

if(b.actorId() == a.actorId()){
  if(id1 == 1){valueItems = $dataWeapons};
  if(id1 == 2){valueItems = $dataArmors};
  if(id1 == 0){valueItems = $dataItems};
  var walletMin = Number(valueItems[itemId].meta['walletIn'].split(',')[0]);
  var walletRange = Number(valueItems[itemId].meta['walletIn'].split(',')[1]);
  var walletGainAmount = Math.floor( Math.random() * walletRange+1) + walletMin;
  TickerManager.show(`\\C[2]\x1bIIN[${itemId}]\\C[0]には\\C[14]${walletGainAmount}\\G\\C[0]入っていた！`);
  $gameParty.gainGold(walletGainAmount);
  $gameParty.gainItem(valueItems[itemId], -1);
};

};

//アイテム一括売却対象選択ikkatu_sellChoice(0,' Goods');
ikkatu_sellChoice = function(id1,id2){

var arr1 = [];
var arr2 = [];
if(id1 == 0){var valueItems = $dataItems};
if(id1 == 1){var valueItems = $dataWeapons};
if(id1 == 2){var valueItems = $dataArmors};
var start = 1;
if(id1 == 2){
  var end = valueArmorsLength;
} else {
  var end = valueItems.length-1;
};
for (var i = start; i <= end; i++) {
  var sellChoiceText = 0;
  if(id1 == 0){
    var categoryMatchFlag = valueItems[i].meta['Menu Category'] == id2;
  } else {
    var categoryMatchFlag = true;
  };
  if(id1 == 2){
    var etypeMatchFlag = valueItems[i].etypeId != 3;
  } else {
    var etypeMatchFlag = true;
  };
  if(valueItems[i].name !== '') {
    if(valueItems[i].price >= 1 || valueItems[i].meta['Sell Price'] || valueItems[i].meta['Variable 57 Sell Price'] || valueItems[i].meta['Variable 69 Sell Price'] || valueItems[i].meta['Item 270 Sell Price'] || valueItems[i].meta['Item 147 Sell Price'] || valueItems[i].meta['Item 152 Sell Price']){
      if($gameParty.hasItem(valueItems[i])){
        if(etypeMatchFlag && categoryMatchFlag){
          if($gameSelfSwitches.getVariableValue([4, id1 + 11, i]) == 0){
            var rarityColorCode = 0;
          } else {
            var rarityColorCode = 10;
          };
          var sellChoiceText = `\\FS[25]\\C[${rarityColorCode}]\x1bI[${valueItems[i].iconIndex}]${valueItems[i].name}:${$gameParty.numItems(valueItems[i])}\\C[0]`;
          if(sellChoiceText != 0){
            arr1.push(sellChoiceText);
            arr2.push(i);
          };
}}}}};
if(arr1.length >= 1){
  valueWordArray = arr1;
  valueCountArray = arr2;
};
};

//アイテム一括売却対象選択
ikkatu_sellChoice2 = function(id1){

var arr1 = [];
var arr2 = [];
var arr3 = [];
if(id1 == 0){var valueItems = $dataItems};
if(id1 == 1){var valueItems = $dataWeapons};
if(id1 == 2){var valueItems = $dataArmors};
var start = 1;
if(id1 == 2){
  var end = valueArmorsLength;
} else {
  var end = valueItems.length-1;
};
for (var i = start; i <= end; i++) {
  if($gameSelfSwitches.getVariableValue([4, id1 + 11, i]) == 1){
    var sellItemLine = `\\FS[25]\x1bI[${valueItems[i].iconIndex}]${valueItems[i].name}:${$gameParty.numItems(valueItems[i])}`;
    if(sellItemLine != 0){
      arr1.push(sellItemLine);
      arr2.push(i);
      arr3.push(id1);
    };
  };
};
if(arr1.length >= 1){
  valueWordArray = arr1;
  valueCountArray = arr2;
  valueCountArray2 = arr3;
};

};

//アイテム一括売却実行内部計算
item_ikkatu = function(id1){

if(id1 == 0){var valueItems = $dataItems};
if(id1 == 1){var valueItems = $dataWeapons};
if(id1 == 2){var valueItems = $dataArmors};
var collectedItemTotal = 0;//実行回数記録用。10回で一旦ウェイト
//value6が個数。value7が価格。value8が名前。value9が価格×個数。value10が表示用
var start = 1;
if(id1 == 2){
  var end = valueArmorsLength;
} else {
  var end = valueItems.length-1;
};
for (var i = start; i <= end; i++) {
  if($gameParty.hasItem(valueItems[i])){
    var selfSwitchCount = $gameSelfSwitches.getVariableValue([4, 11+id1, i]);
    if(selfSwitchCount >= 1){  
      collectedItemTotal += 1;
      var baseSellPrice = 0;
      if(valueItems[i].meta['Sell Price']){
        var baseSellPrice = Number(valueItems[i].meta['Sell Price']);
      };
      if(valueItems[i].meta['Price']){
        var baseSellPrice = Math.round(Number(valueItems[i].meta['Price']) / 2);
      };
      var sellPriceVar57 = 0;
      if(valueItems[i].meta['Variable 57 Sell Price']){
        var sellPriceVar57 = Number(valueItems[i].meta['Variable 57 Sell Price']);
      };
      if(valueItems[i].meta['Variable 69 Sell Price']){
        var sellPriceVar57 = Number(valueItems[i].meta['Variable 69 Sell Price']);
      };
      var sellPriceVar69 = 0;
      if(valueItems[i].meta['Item 270 Sell Price']){
        var sellPriceVar69 = Number(valueItems[i].meta['Item 270 Sell Price']);
      };
      if(valueItems[i].meta['Item 147 Sell Price']){
        var sellPriceVar69 = Number(valueItems[i].meta['Item 147 Sell Price']);
      };
      if(valueItems[i].meta['Item 152 Sell Price']){
        var sellPriceVar69 = Number(valueItems[i].meta['Item 152 Sell Price']);
      };
      var sellItemCount = $gameParty.numItems(valueItems[i]);
      var itemBasePrice = valueItems[i].price;
      var sellItemNameText = `\x1bI[${valueItems[i].iconIndex}]${valueItems[i].name}`;
      if(baseSellPrice >= 1){
        var baseSellPrice = baseSellPrice * sellItemCount;
      };
      if(itemBasePrice >= 1){
        var itemBasePrice = itemBasePrice / 2;
        var itemBasePrice = itemBasePrice * sellItemCount;
      };
//変数アイテム用。設定まだで仮設定。アイテムと変数を通過として使用するもの
      if(sellPriceVar57 >= 1){//変数
        var sellPriceVar57 = sellPriceVar57 * sellItemCount;
      };
      if(sellPriceVar69 >= 1){//アイテム
        var sellPriceVar69 = sellPriceVar69 * sellItemCount;
      };
      if(sellItemCount >= 1){
        //arr1[0] = value8;
        //arr1[1] = value6;
        //arr1[2] = value7 + value3;
        //arr1[3] = value4;
        //arr1[4] = value5;
        $gameParty.loseItem(valueItems[i], sellItemCount);
        if(itemBasePrice + baseSellPrice >= 1){$gameParty.gainGold(itemBasePrice + baseSellPrice)};
        if(valueItems[i].meta['Variable 57 Sell Price']){
          if(sellPriceVar57 >= 1){$gameVariables.setValue(57,$gameVariables.value(57) + sellPriceVar57)};
        };
        if(valueItems[i].meta['Variable 69 Sell Price']){
          if(sellPriceVar57 >= 1){$gameVariables.setValue(69,$gameVariables.value(69) + sellPriceVar57)};
        };
        if(sellPriceVar69 >= 1){
          if(valueItems[i].meta['Item 270 Sell Price']){
            $gameParty.gainItem($dataItems[270], sellPriceVar69);
          };
          if(valueItems[i].meta['Item 147 Sell Price']){
            $gameParty.gainItem($dataItems[147], sellPriceVar69);
          };
          if(valueItems[i].meta['Item 152 Sell Price']){
            $gameParty.gainItem($dataItems[152], sellPriceVar69);
          };
        };
        valueIkkatuArray.push([sellItemNameText,sellItemCount,itemBasePrice + baseSellPrice,sellPriceVar57,sellPriceVar69]);
        valueCountSet1 += 1;
      };
}}};

};

//ショップの購入レート設定shop_taxDecision1(this._eventId);
shop_taxDecision1 = function(id1){

valueCountSet1 = 0;
valueCountSet2 = 0;
valueCountSet3 = 0;
valueRandomSet = 0;
$gameSwitches.setValue(380,false);
var id2 = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), id1, 10]);
var actor = $gameActors.actor($gameVariables.value(11));
if(!actor || !$gameMap.event(id1)){return};
if($gameSelfSwitches.value([$gameMap.mapId(), id1, 'B'])){
  $gameSystem.setBuyTaxTo(id2);
} else {
  $gameSystem.setBuyTaxTo(0);
};
if($gameSelfSwitches.value([$gameMap.mapId(), id1, 'A'])){
  valueCountSet1 += 1;
};
if($gameSwitches.value(138)){//商業on
  if($gameMap.event(id1).event().meta['Man'] && 
  actor.battleSkillsRaw().contains(valueHoneyTrapSkillId)){
    valueCountSet2 += 1;
  };
  if(!$gameSelfSwitches.value([$gameMap.mapId(), id1, 'B'])){//交渉は一日一回
    $gameSwitches.setValue(380,true);
  };
};
if(id2 <= -1){
  var taxInfoText = `値段交渉済み：\\C[10]${-id2}%\\C[0]の値引きが行われます。`;
  CommonPopupManager.showInfo({},taxInfoText,null);
};

};

//ショップの購入レート設定。順番にコモンでウェイトを挟んでいるshop_taxDecision2(this._eventId,1);
shop_taxDecision2 = function(id1,id3){

$gameSwitches.setValue(380,false);
var id2 = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), id1, 10]);
var actor = $gameActors.actor($gameVariables.value(11));
if(!actor){return};
if(id3 == 1){
  //$gamePlayer.requestBalloon(8);
  //event.requestBalloon(8);
  $gameVariables.setValue(21,`値引き交渉を行っています…。\n`);
  $gameScreen.dTextRealTime = 'ON';
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.setDTextPicture(`\\V[21]`, 28);
  $gameScreen.showPicture(100,"",0,10+50,100,100,100,0,0);
  $gameScreen.movePicture(100,0,10,100,100,100,255,0,60);
};
if(id3 == 2){
  valueRandomSet = 10;
  var honeyTrapValue = 'hStates_hexpUp';
  $gameScreen._particle.particleSet(0,honeyTrapValue,'screen','def','spriteset');
  AudioManager.playSe({"name":'ZH_Sexy',"volume":40,"pitch":130,"pan":0});
  $gameScreen.startFlash([255,119,255,200], 60);
  var arr1 = [1,2];
  var trapVariant = arr1[getRandomIndex(arr1.length)];
  if(trapVariant == 1){
    var honeyTrapValue = 55;
    var trapPictureName = 'ScreenBlackOut';
    var trapSceneName = 'Zev_HoneyTrap1_1a';
    var trapInfoText = 'Zev_HoneyTrap1_1';
    $gameScreen.showPicture(honeyTrapValue,trapPictureName,1,640-100,384,100,100,0,0);
    $gameScreen.movePicture(honeyTrapValue,1,640,384,100,100,200,0,60);
    $gameScreen.showPicture(honeyTrapValue+1,trapSceneName,1,640+100,384,100,100,0,0);
    $gameScreen.movePicture(honeyTrapValue+1,1,640,384,100,100,250,0,60);
    $gameScreen.showPicture(honeyTrapValue+2,trapInfoText,1,1024+128,384,100,100,0,0);
    $gameScreen.movePicture(honeyTrapValue+2,1,1024,384,100,100,255,0,60);
  };
  if(trapVariant == 2){
    var honeyTrapValue = 55;
    var trapSceneName = 'Zev_HoneyTrap1_' + trapVariant;
    var trapPictureName = 'Screen_Width512Black';//右側のみＨＣＧの際に使用
    $gameScreen.showPicture(honeyTrapValue,trapPictureName,1,1024-100,384,100,100,0,0);
    $gameScreen.movePicture(honeyTrapValue,1,1024-50,384,100,100,200,0,60);
    $gameScreen.showPicture(honeyTrapValue+1,trapSceneName,1,1024+128,384,100,100,0,0);
    $gameScreen.movePicture(honeyTrapValue+1,1,1024,384,100,100,255,0,60);
  };
  if(trapVariant == 3){
    var honeyTrapValue = 55;
    var trapPictureName = 'ScreenBlackOut';
    var trapSceneName = 'Zev_HoneyTrap1_' + trapVariant;
    $gameScreen.showPicture(honeyTrapValue,trapPictureName,1,640-100,384,100,100,0,0);
    $gameScreen.movePicture(honeyTrapValue,1,640,384,100,100,200,0,60);
    $gameScreen.showPicture(honeyTrapValue+1,trapSceneName,1,640+50,384,100,100,0,0);
    $gameScreen.movePicture(honeyTrapValue+1,1,640,384,100,100,250,0,60);
  };
};
if(id3 == 3){
  var trapPictureName = actor.skillMasteryLevel(valueBusinessSkillId) * 10;
  var trapSceneName = getRandomIndex(101) + trapPictureName + valueRandomSet;
  if($gameMap.event(id1).event().meta['NoDiscount']){
    var successThreshold = 1000;
  } else {
    var successThreshold = 60;
  };
  var trapInfoText = `成功計算式：\\C[2]${trapSceneName}\\C[0] >= \\C[1]${successThreshold}\\C[0] \n`;
  $gameVariables.setValue(21,$gameVariables.value(21)+trapInfoText);
    if(trapSceneName >= successThreshold){
      var trapVariant = getRandomIndex(11) + (actor.skillMasteryLevel(valueBusinessSkillId) * 5) + valueRandomSet;
      $gameSelfSwitches.setVariableValue([$gameMap.mapId(), id1, 10], trapVariant);
      valueCountSet3 = 1;
    };
};
if(id3 == 4){
  if(valueCountSet3 == 1){
    $gamePlayer.requestBalloon(3);
    AudioManager.playSe({"name":'Z11_QuestClear',"volume":50,"pitch":130,"pan":0});
    var trapPictureName = $gameSelfSwitches.getVariableValue([$gameMap.mapId(), id1, 10]);
    var honeyTrapValue = `交渉成功！ \\C[10]${trapPictureName}%\\C[0]の値引きが行われます。\n`;
    $gameVariables.setValue(21,$gameVariables.value(21)+honeyTrapValue);
      if(valueCountSet2 == 1){//色仕掛け使用時に値引き成功でセルフAオン
        $gameSelfSwitches.setValue([$gameMap.mapId(), id1, 'A'], true);
      };
  } else {
    $gamePlayer.requestBalloon(6);
    AudioManager.playSe({"name":'Down1',"volume":90,"pitch":100,"pan":0});
    var honeyTrapValue = `交渉失敗…。`;
    $gameVariables.setValue(21,$gameVariables.value(21)+honeyTrapValue);
  };
$gameSelfSwitches.setValue([$gameMap.mapId(), id1, 'B'], true);
};

};

//価格と所持金比較。id1に価格でid2が0で所持金1でコイン2で戦貨。id1が0でid2が種別id3がアイテムID。shop_priceComparison(10000,0,0);
shop_priceComparison = function(id1,id2,itemId){

valuePriceSet1 = id1;
var id4 = $gameParty.gold();
if(id1 == 0){
  if(id2 == 1){valueItems = $dataWeapons};
  if(id2 == 2){valueItems = $dataArmors};
  if(id2 == 0){valueItems = $dataItems};
  var comparedPrice = 0;
  if(Number(valueItems[itemId].price) >= 1){
    var comparedPrice = valueItems[itemId].price;
  };
  if(valueItems[itemId].meta['Buy Price']){
    var comparedPrice = Number(valueItems[itemId].meta['Buy Price']);
  };
valuePriceSet1 = comparedPrice;
};
var priceLabel = `所持金`;
var currencyLabel = `\\G`;
if(id1 >= 1 && id2 == 1){
var priceLabel = `コイン`;
var currencyLabel = `枚`;
var id4 = $gameVariables.value(69);
};
if(id1 >= 1 && id2 == 2){
var priceLabel = `戦貨`;
var currencyLabel = `枚`;
var id4 = $gameParty.numItems($dataItems[10]);
};
if(id4 >= id1){
  var priceDifference = id4-id1;
  var priceComparisonText = `${priceLabel}:${id4.toLocaleString()}${currencyLabel} - 支払額:${id1.toLocaleString()}${currencyLabel} = \\C[14]${priceDifference.toLocaleString()}${currencyLabel}\\C[0]…`;
  CommonPopupManager.showInfo({},priceComparisonText,null);
  AudioManager.playSe({"name":'Shop',"volume":90,"pitch":100,"pan":0});
  if(id1 >= 1 && id2 == 1){
    $gameVariables.setValue(69,$gameVariables.value(69) - id1);
  } else {
    if(id1 >= 1 && id2 == 2){
      $gameParty.gainItem($dataItems[10], -id1);
    } else {
      $gameParty.gainGold(-id1);
  }};
  $gameSwitches.setValue(380,true);
} else {
  var priceComparisonText = `${priceLabel}:${id4.toLocaleString()}${currencyLabel} < 支払額:${id1.toLocaleString()}${currencyLabel}　所持金が足りなかった…`;
  CommonPopupManager.showInfo({},priceComparisonText,null);
  $gameSwitches.setValue(380,false);
};

};

//ワンオフアイテム購入処理
item_oneOffBuy = function(id3,id1,id2,id4){

if(id1 == 0){valueItems = $dataItems[id2]};
if(id1 == 1){valueItems = $dataWeapons[id2]};
if(id1 == 2){valueItems = $dataArmors[id2]};
if(!valueItems){return};
var buyPictureId = 101;
var passiveStateId = 0;
if(id3 == 1){
  if(id4 == 0){
    var picturePath = "/img/parallaxes/Scene_ItemsBuy";
    $gameScreen.showPicture(buyPictureId-3,picturePath,1,640,384,100,100,0,0);
    $gameScreen.movePicture(buyPictureId-3,1,640,384,100,100,250,0,40);  
  };
  if(id4 == 1){
    var picturePath = "/img/parallaxes/" + $gameVariables.value(508);
    $gameScreen.showPicture(buyPictureId-3,picturePath,1,640,384,100,100,0,0);
    $gameScreen.movePicture(buyPictureId-3,1,640,384,100,100,250,0,40);  
  };
  var picturePath = 'ScreenBlackOut';
  $gameScreen.showPicture(buyPictureId-2,picturePath,1,640,384,100,100,0,0);
  $gameScreen.movePicture(buyPictureId-2,1,640,384,100,100,200,0,40);
  if(valueItems.meta['Passive State']){
    var picturePath = Number(valueItems.meta['Passive State']);
    var passiveStateId = picturePath;
    element_particleSet(1,buyPictureId,picturePath,0);
  };
  $gameVariables.setValue(22,valueItems.price);
  if($gameParty.hasItem(valueItems,true)){
    var buyMessageSuffix = '\\C[3]所持済み\\C[0]';
  } else {
    var buyMessageSuffix = '　';
  };
  $gameVariables.setValue(21,
  `\\$\x1bI[${valueItems.iconIndex}]\\C[16]${valueItems.name}\\C[0] 価格:\\C[2]${valueItems.price}\\G\\C[0] ${buyMessageSuffix}
${valueItems.description}`);
  if(valueItems.meta['ItemPicture']){
    var pictureYOffset = Number(valueItems.meta['ItemPicture'].split(',')[1]);
    if(valueItems.iconIndex == 508){
      var picturePath = `/img/sv_enemies/Summon_${valueItems.meta['ItemPicture'].split(',')[0]}`;
      $gameScreen.showPicture(buyPictureId,picturePath,1,640,384+pictureYOffset,100,100,255,0);
      picture_fade1(buyPictureId,"fadeIn",'162',60,5);
      valueTachieBless = [100,100,250,0.004,0.003];//立ち絵用息遣い設定。基本状態
      tachie_bless(buyPictureId,0);
      element_particleSet(2,buyPictureId,passiveStateId,pictureYOffset);
    } else {
      var picturePath = valueItems.meta['ItemPicture'].split(',')[0];
      $gameScreen.showPicture(buyPictureId,picturePath,1,640,384+pictureYOffset,100,100,255,0);
      picture_fade1(buyPictureId,"157",'162',60,5);
    };
  };
  if(id1 == 1 || id1 == 2){
    if(valueItems.traits[0] && valueItems.traits[0].code == 43){
      var picturePath = $dataSkills[valueItems.traits[0].dataId].animationId
      $gameScreen.startAnimation(640, 368+pictureYOffset, picturePath, false);
  }};
};
if(id3 == 2){
  $gameParty.gainItem(valueItems, 1);
  $gameParty.loseGold($gameVariables.value(22));
  var buyPictureId = `\x1bI[${valueItems.iconIndex}]\\C[16]${valueItems.name}\\C[0]を購入した。\\C[1](-${$gameVariables.value(22)}\\G)\\C[0]`;
  CommonPopupManager.showInfo({},buyPictureId,null);
  AudioManager.playSe({"name":'Shop1',"volume":90,"pitch":100,"pan":0});
};
if(id3 == 3){//戦闘で勝利
  $gameParty.gainItem(valueItems, 1);
  valueWordSet0 = `\x1bI[${valueItems.iconIndex}]\\C[16]${valueItems.name}\\C[0]を入手した！`;
  AudioManager.playSe({"name":'Z11_RareTreasureBox',"volume":50,"pitch":120,"pan":0});
  adv_partDirectPlay(18);
};
if(id3 == 0){
  pic_eraseP(0,[buyPictureId-3,buyPictureId-2]);
  picture_fade1(buyPictureId,"fadeOut",'Hscene005',60,5);
  element_particleSet(0,buyPictureId,passiveStateId,pictureYOffset);
};

};

gain_itemGainExp1 = function(a,b,itemId,id1){

if(id1 == 0){var value = $dataItems[itemId]};
if(id1 == 1){var value = $dataSkills[itemId]};
if(!value){return};
if(value.meta['gainExp']){
  var gainExpAmount = Number(value.meta['gainExp']);
} else {
  var gainExpAmount = 100;
};
b.changeExp(b.currentExp()+gainExpAmount, false);
if(b.subclass()){
  b.gainExpSubclass(gainExpAmount);
};
var gainExpMessage = `${b.name()}の経験値\\C[2]+${gainExpAmount}\\C[0]　<TotalExp:${b.currentExp()} `;
if(b.subclass()){
  gainExpMessage += `TotalExp2:${b._exp[b._subclassId]}>`;
} else {
  gainExpMessage += `>`;
};
//TickerManager.show(value2);

};

//盗み処理。スキルによる確率処理などがまだ。id1種別id2アイテムIDid3数・steal_direction1(0,51,1);
//イベント。透明化したNPCを例外処理して目撃させる。超高額アイテムを意図的に盗ませる
steal_direction1 = function(id1,id2,id3){

var actor = $gameActors.actor($gameVariables.value(2));
if(!actor){return};
var stealSuccessFlag = 0;
var stealSkillId = 1;//スキルによる成功確率計算。ランク*10％「盗みの極意」。スキルID指定まだ
if(actor.isLearnedSkill(1)){//スキルによって範囲を絞る。5→3「盗みの美学」スキルID指定まだ
  var searchRadius = 3;
} else {
  var searchRadius = 5;
};
for (var y = $gamePlayer.y-searchRadius; y <= $gamePlayer.y+searchRadius; y++) {
  for (var x = $gamePlayer.x-searchRadius; x <= $gamePlayer.x+searchRadius; x++) {
    var foundEventId = $gameMap.eventIdXy(x, y);
      if(foundEventId >= 1){
        var event = $gameMap.event(foundEventId);
        if(event.event().meta['NPC'] && event.opacity() >= 100){
          if(y <= $gamePlayer.y-1 && event.direction() == 2 ||
             y >= $gamePlayer.y+1 && event.direction() == 8 ||
             x <= $gamePlayer.x-1 && event.direction() == 6 ||
             x >= $gamePlayer.x+1 && event.direction() == 4 ){
               var witnessRandom = getRandomIndex(101);
               var witnessThreshold = 0;
               //
               if(actor.isLearnedSkill(stealSkillId)){
                 var witnessThreshold = actor.skillMasteryLevel(stealSkillId) * 10;
                 CommonPopupManager.showInfo({},`目撃確率:${witnessThreshold} >=- ${witnessRandom}`,null);
               };
               if(witnessThreshold >= witnessRandom){
                 event.requestBalloon(1);
                 var stealSuccessFlag = 1;
                 break;
               } else {
                 event.requestBalloon(2);//?ふきだし
               };
           };
}}}};
if(id1 == 1){valueItems = $dataWeapons};
if(id1 == 2){valueItems = $dataArmors};
if(id1 == 0){valueItems = $dataItems};
var stealMessage = `\x1bI[${valueItems[id2].iconIndex}]${valueItems[id2].name}を\\C[2]${id3}個\\C[0]盗んだ！`;
CommonPopupManager.showInfo({},stealMessage,null);
$gameParty.gainItem(valueItems[id2], id3);
  if(stealSuccessFlag >= 1){
    var bountyPrice = 0;
    if(Number(valueItems[id2].price) >= 1){
      var bountyPrice = valueItems[id2].price;
    };
    if(valueItems[id2].meta['Buy Price']){
      var bountyPrice = Number(valueItems[id2].meta['Buy Price']);
    };
    var bountyCashRate = 1000;
    if($dataWeapons[$gameVariables.value(230)] && $dataWeapons[$gameVariables.value(230)].meta['bountyCashRate']){
      var bountyCashRate = Number($dataWeapons[$gameVariables.value(230)].meta['bountyCashRate']);
    };
    $gameVariables.value(501)[$gameVariables.value(230)] += bountyPrice + bountyCashRate
    var bountyTotal = $gameVariables.value(501)[$gameVariables.value(230)];
    $gameVariables.setValue(231,$gameVariables.value(231) + 1);
    var stealMessage = `盗みを目撃された！　<賞金額:\\C[10]+${bountyPrice+bountyCashRate}(${bountyTotal})\\G\\C[0] カルマ値:\\C[10]+1(\\V[231])\\C[0]>`;
    CommonPopupManager.showInfo({},stealMessage,null);
  };

};

//エネミーステートでドロップ
//enemy_drop = function(user,enemy){

//};

//}());

