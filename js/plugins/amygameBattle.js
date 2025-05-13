/*:
* @plugindesc このゲーム専用プラグイン
* @author 作者名
* @help ゲーム専用に作成された初期読み込み用プラグイン
*/

//(function() {

// enemy_dropSelection global vars (to not declare each time)
var itemsSourceKindPicNamesEnemyDropSelection = ['ItemDrop_Items', 'ItemDrop_Weapons', 'ItemDrop_Armors'];
var xShiftCoordsEnemyDropSelection = [50, 75, 100, 125, 150, 175, 200];
var yShiftCoordsEnemyDropSelection = [-50, -40, -30, -20, -10, 0, 10, 20];
var durationsEnemyDropSelection = [80, 85, 90, 95, 100];
//エネミー戦闘不能時にドロップ計算
enemy_dropSelection = function (user) {

  const isDuringStripping = $gameSwitches.value(607);
  const isDuringRipping = $gameSwitches.value(608);
  const isInBattle = $gameParty.inBattle();
  if (!isDuringStripping && !isDuringRipping) {
    const tribalSubjugationIds = $gameVariables.value(52);
    const valueWordSet3Array = [];
    for (let i = 1; i < valueSubjugationPoint.length; i++) {//討伐数カウント
      const stateId = valueSubjugationPoint[i];
      if (!user.isStateAffected(stateId)) continue;

      tribalSubjugationIds[stateId] += 1;
      if (isInBattle) continue;

      const name = `\x1bSIM[${stateId}]`;
      const num = `\\C[10]+1\\C[0]`;
      const messageText = `${name}：討伐数${num}\n`;
      valueWordSet3Array.push(messageText);
      $gameSystem.pushInfoLog(messageText);
      //CommonPopupManager.showInfo({},value1,null);
    }

    valueWordSet3 += valueWordSet3Array.join('');

    if (!user.isStateAffected(436)) {
      tribalSubjugationIds[1] += 1;//ヒューマン以外の魔物当日討伐数
      tribalSubjugationIds[2] += 1;//ヒューマン以外の魔物総合討伐数
    }
  };

  const itemDropDataArray = get_item_drop_data(user);
  const itemDropDataArrayLength = itemDropDataArray.length;
  const itemsSourceKinds = [$dataItems, $dataWeapons, $dataArmors];
  const xShiftCoordsLength = xShiftCoordsEnemyDropSelection.length;
  const yShiftCoordsLength = yShiftCoordsEnemyDropSelection.length;
  const durationsLength = durationsEnemyDropSelection.length;
  const userIndex = user.index() + 1;
  const coordinateX = $gameTroop.getX(userIndex);
  const coordinateY = $gameTroop.getY(userIndex);
  const dropUpItem = $dataItems[valueItemDropUpItem];
  const valueWordSet1Array = [];
  for (let i = 0; i < itemDropDataArrayLength; i++) {
    const itemDropData = itemDropDataArray[i];
    if (!itemDropData) continue;

    valueDropCount1 = drop_probabilityCalculation2(user, Number(itemDropData[0]), dropUpItem);
    if (valueDropCount1 != 1) continue;

    const itemDropDataKindNum = Number(itemDropData[1]);
    valueItems = itemsSourceKinds[itemDropDataKindNum];
    const valueItem = valueItems[Number(itemDropData[2])];
    const picName = itemsSourceKindPicNamesEnemyDropSelection[itemDropDataKindNum];
    if (isInBattle) {
      $gameTroop.addDropItem(valueItem);
      //var value1 = `\x1bI[${valueItems[Number(arr1[i][2])].iconIndex}]`;
      //var arr7 = [-50,-60,-70,-80,-90,-100,-110,-120,-130,-140,-150,-160,-170,-180,-190,-200];
      const shiftX = xShiftCoordsEnemyDropSelection[getRandomIndex(xShiftCoordsLength)];//x
      const shiftY = yShiftCoordsEnemyDropSelection[getRandomIndex(yShiftCoordsLength)];//y
      const duration = durationsEnemyDropSelection[getRandomIndex(durationsLength)];//wait
      //var value7 = arr7[getRandomIndex(arr7.length)];//jump
      picture_motion1("smooth", [0]);
      //$gameScreen.setDTextPicture(value1, 32);//元から
      $gameScreen.showPicture(valueDropEnemyPicId, picName, 1, coordinateX, coordinateY, 100, 100, 255, 0);
      //curveFunctions.patternY = curveFunctions.getPattern('jump', [value7]);
      //curveFunctions.patternOpacity = curveFunctions.getPattern('jump', [200]);
      $gameScreen.movePicture(valueDropEnemyPicId, 1, coordinateX + shiftX, coordinateY + shiftY, 100, 100, 0, 0, duration);
      valueDropEnemyPicId += 1;
    } else {
      if (isDuringStripping || isDuringRipping) {
        $gameVariables.setValue(22, itemDropDataKindNum);
        $gameVariables.setValue(23, Number(itemDropData[2]));
        item_getSkillLevel(valueFootpadSkillId, $gameVariables.value(22), $gameVariables.value(23));
      } else {
        if (Number(itemDropData[2]) >= 1) {
          $gameParty.gainItem(valueItem, 1);
          const itemIcon = `\x1bI[${valueItem.iconIndex}]`;
          const itemName = `\\C[2]${valueItem.name}\\C[0]`;
          const item = `${itemIcon}${itemName}`;
          const num = `\\C[2]1\\C[0]`;
          const messageText = `${item}を${num}個入手！\n`;
          valueWordSet1Array.push(messageText);
          $gameSystem.pushInfoLog(messageText);
          //CommonPopupManager.showInfo({},value11,null);
        }
      }
    }
  }
  valueWordSet1 += valueWordSet1Array.join('');

};


function addDropIfStateAffected(user, stateId, dropDataArray, drops) {
  if (user.isStateAffected(stateId)) {
    drops.forEach(drop => dropDataArray.push(drop));
  }
};

const getItemDropDataStateIds = [851, 852, 853, 854, 855, 856, 857, 858, 859, 860,
  861, 862, 863, 864, 865, 866, 867, 868, 869, 870,
  871, 872, 873, 874, 875, 876, 877, 878, 879, 880
];

get_item_drop_data = function (user) {

  valueDropEnemyLevel = $gameParty.inBattle() ? user.level : Math.ceil($gameActors.actor($gameVariables.value(11)).level / 2);

  const itemDropDataArray = [];
  let stateAddPowerCustomCount = 0;
  for (let i = 0; i < valueAddPowerCustomState.length; i++) {
    if (user.isStateAffected(valueAddPowerCustomState[i])) {
      stateAddPowerCustomCount += Number($dataStates[valueAddPowerCustomState[i]].meta['AddPowerCustom']);
    }
  };
  if (stateAddPowerCustomCount >= 1) {
    for (let i = 0; i < stateAddPowerCustomCount.length; i++) {
      itemDropDataArray.push([6, 0, 153]);
    };
  };
  for (let i = 51; i <= 56; i++) {
    if (user.isStateAffected(i)) itemDropDataArray.push([4, 0, i + 103]);
  };

  addDropIfStateAffected(user, 610, itemDropDataArray, [
    [0, 0, 10],
    [1, 0, 196],
    [3, 0, 197],
    [5, 0, 198],
    [9, 0, 199],
    [6, 0, 190],
    [7, 0, 147],
    [10, 0, 148],
    [8, 0, 152],
    [8, 0, 153],
    [10, 0, 170]
  ]);

  // Combine both drops for state 451
  addDropIfStateAffected(user, 451, itemDropDataArray, [
    [6, 0, 191],
    [6, 0, 161],
    [6, 0, 163]
  ]);

  addDropIfStateAffected(user, 452, itemDropDataArray, [
    [7, 0, 192],
    [6, 0, 162],
    [6, 0, 164]
  ]);

  addDropIfStateAffected(user, 453, itemDropDataArray, [
    [8, 0, 193],
    [10, 0, 169]
  ]);

  addDropIfStateAffected(user, 454, itemDropDataArray, [
    [10, 0, 194],
    [10, 0, 169]
  ]);
  if (user.isStateAffected(454) && user.isStateAffected(465)) {
    // Separate nested check for state 465 when 454 is active
    addDropIfStateAffected(user, 465, itemDropDataArray, [
      [3, 0, 1289]
    ]);
  }

  addDropIfStateAffected(user, 441, itemDropDataArray, [
    [6, 0, 165]
  ]);
  addDropIfStateAffected(user, 442, itemDropDataArray, [
    [6, 0, 165]
  ]);
  addDropIfStateAffected(user, 443, itemDropDataArray, [
    [6, 0, 166]
  ]);
  addDropIfStateAffected(user, 446, itemDropDataArray, [
    [6, 0, 167]
  ]);
  addDropIfStateAffected(user, 455, itemDropDataArray, [
    [6, 0, 168]
  ]);
  addDropIfStateAffected(user, 448, itemDropDataArray, [
    [10, 0, 169]
  ]);

  getItemDropDataStateIds.forEach(function (id) {
    addDropIfStateAffected(user, id, itemDropDataArray, [
      [6, 0, 170],
      [6, 2, id - 780]
    ]);
  });

  if (user.isStateAffected(410)) {
    addDropIfStateAffected(user, 410, itemDropDataArray, [
      [6, 0, 185],
      [7, 0, 186],
      [8, 0, 187],
      [10, 0, 188],
      [5, 0, 1115],
      [8, 0, 1117]
    ]);
    if (valueDropEnemyLevel >= 1 && valueDropEnemyLevel <= 20) {
      addDropIfStateAffected(user, 410, itemDropDataArray, [
        [2, 0, 1118],
        [3, 0, 1119],
        [4, 0, 1120],
        [5, 0, 1121]
      ]);
    }
    if (valueDropEnemyLevel >= 11) {
      addDropIfStateAffected(user, 410, itemDropDataArray, [
        [6, 0, 1122],
        [7, 0, 1123],
        [8, 0, 1124],
        [10, 0, 1125]
      ]);
    }
  }

  addDropIfStateAffected(user, 440, itemDropDataArray, [
    [5, 0, 220],
    [8, 0, 240]
  ]);

  addDropIfStateAffected(user, 461, itemDropDataArray, [
    [5, 0, 251]
  ]);
  addDropIfStateAffected(user, 462, itemDropDataArray, [
    [5, 0, 252]
  ]);
  addDropIfStateAffected(user, 463, itemDropDataArray, [
    [5, 0, 253]
  ]);
  addDropIfStateAffected(user, 464, itemDropDataArray, [
    [5, 0, 254]
  ]);
  addDropIfStateAffected(user, 465, itemDropDataArray, [
    [5, 0, 255],
    [3, 0, 1287]
  ]);
  addDropIfStateAffected(user, 466, itemDropDataArray, [
    [5, 0, 256]
  ]);
  addDropIfStateAffected(user, 467, itemDropDataArray, [
    [5, 0, 257]
  ]);
  addDropIfStateAffected(user, 479, itemDropDataArray, [
    [6, 0, 270],
    [5, 0, 269]
  ]);

  if (user.isStateAffected(475)) { itemDropDataArray.push([6, 0, 151]); };
  for (let i = 421; i <= 439; i++) {
    if (user.isStateAffected(i)) {
      const stateRaceDropKind = $dataStates[i].meta['RaceDropKind'];
      if (stateRaceDropKind) {
        const stateRaceDropKinds = stateRaceDropKind.split(',');
        for (let id1 = 0; id1 <= stateRaceDropKinds.length - 1; id1++) {
          const stateRaceDropKindIndex = Number(stateRaceDropKinds[id1]);
          const itemRaceDropRarity = $dataItems[stateRaceDropKindIndex].meta['RaceDropRarity'];
          if (itemRaceDropRarity) {
            itemDropDataArray.push([Number(itemRaceDropRarity), 0, stateRaceDropKindIndex]);
          };
        };
      };
    };
  };

  return itemDropDataArray;
}

allAnimeattack_move1 = function () { allAnimeattack_moveBase(false); }

allAnimeattack_move2 = function () { allAnimeattack_moveBase(true); }

allAnimeattack_moveBase = function (isMove2) {

  const max = !$gameSwitches.value(464) ? 8 : 4;
  const shift1 = max == 8 ? (isMove2 ? -100 : 100) : (isMove2 ? 350 : -350);
  const shift2 = max == 8 ? (isMove2 ? -350 : 350) : (isMove2 ? 200 : -200);
  const shift = $gameVariables.value(182) == 11 ? shift1 : shift2;
  for (let i = 1; i <= max; i++) {
    $gameTroop.move(i, shift, 0, 20);
  }
}

//ダメージ時に計算。（変更が多いため先頭に置く）value4はstateId。value2未使用
damage_keisan1 = function (user, target, action, damageAmount, critAnimationId, unusedParam, animationId, stateId) {

  if (!$gameSwitches.value(141)) return;

  const damageHitCount = $gameVariables.value(526);
  for (let hitIndex = 1; hitIndex <= damageHitCount; hitIndex++) {
    const isValid = action && damageAmount > 0 && valueSkillDamageType == 1;
    if (!isValid) continue;

    let flashOpacity = 50;
    let shakeIntensity = 0;
    let shakeSpeed = 4;
    let duration = 10;

    let flashColorData;
    if (!$gameVariables.value(331)) {
      flashColorData = [200, 0, 0, flashOpacity];
      $gameVariables.setValue(331, flashColorData);
    } else {
      flashColorData = $gameVariables.value(331);
      flashColorData[3] = flashOpacity;
    };
    flashColorData[3] = flashOpacity;

    if (hitIndex == 1) {
      if (target.result().critical) {
        if (user.isActor()) {
          $gameVariables.value(380 + user.actorId())[68] += 1;
        }
        if (target.hp <= 0 && valueCollapseAnime >= 1) { } else {
          target.startAnimation(critAnimationId, true, 0);
        }
      }
      if (target.hp != 0 && valueTotalDamageCount2 == 0) {
        battle_stateAnime1(target);
      }

      if (target.isActor()) {
        if (damageAmount >= target.mhp / 2) {
          state_addFormula1([41, 25, user, target, user.mdf, target.luk]);//負傷ステート
        };
      };
      if (damageAmount >= target.mhp / 10) {
        let targetGroup;
        let positionYOffset;
        if (target.isActor()) {
          targetGroup = $gameParty;
          positionYOffset = -24;
        } else {
          targetGroup = $gameTroop;
          positionYOffset = -100;
        };
        const targetIndex = target.index();
        let filterId = 'wave_' + targetIndex;
        let filterX = targetGroup.getX(targetIndex + 1);
        let filterY = targetGroup.getY(targetIndex + 1) + positionYOffset;
        let shockwaveIntensity = 50;
        let shockwaveRadius = 30;
        let shockwaveDurationMultiplier = 0.05;
        if (damageAmount >= target.mhp / 10 * 3) {
          shockwaveIntensity = 100;
          shockwaveRadius = 40;
        };
        if (damageAmount >= target.mhp / 2) {
          shockwaveIntensity = 150;
          shockwaveRadius = 50;
        };
        if (damageAmount >= target.mhp) {
          shockwaveIntensity = 200;
          shockwaveDurationMultiplier = 0.06;
        };
        $gameMap.createFilter(filterId, 'shockwave', 0, 'screen');
        $gameMap.setFilter(filterId, [filterX, filterY, -1, shockwaveRadius, shockwaveIntensity, 1]);
        $gameMap.setFilterAddiTime(filterId, shockwaveDurationMultiplier);
      }
      duration = 10;
      if (target.mhp / 100 >= damageAmount) {
        shakeIntensity = 130;
        flashOpacity -= 50;
        duration -= 5;
        shakeSpeed -= 3;
      }
      else if (target.mhp <= damageAmount) {
        shakeIntensity += 1;
        flashOpacity += 25;
        duration += 5;
        shakeSpeed += 2;
      }

      if (damageHitCount >= 2) {
        duration += damageHitCount * 3;
      };
      $gameScreen.startFlash(flashColorData, duration);
      $gameScreen.startShake(shakeIntensity, shakeSpeed, duration);
    }
    let animDelay = 0;
    if (animationId >= 1) {
      if (hitIndex >= 2) {
        const animation = $dataAnimations[animationId];
        const animFramesLength = animation.frames.length;
        let maxAnimationDelay = 4;
        if (animation.name.match(/!/)) { maxAnimationDelay = 1 }
        else if (animation.name.match(/&/)) { maxAnimationDelay = 2 }
        else if (animation.name.match(/$/)) { maxAnimationDelay = 3 };

        animDelay = Math.ceil((animFramesLength * 4 / 5) * maxAnimationDelay / 4) * (hitIndex - 1);
      } else {
        animDelay = 0;
      }
    }
    /*
       if(valueBattleAddAttack >= 1){//<BattleAddAttackSet:50>未使用	
         let value1 = Math.round(damageAmount * valueBattleAddAttack / 100);
         target.gainHp(-value1);
         target.startDamagePopup();
       };
    */
    if (hitIndex >= 2) {
      let randomOffset = getRandomIndex(41) - 20;
      randomOffset = Math.round(damageAmount * randomOffset / 100);
      target.gainHp(-damageAmount - randomOffset);
      target.startDamagePopup();

      if (hitIndex == 2) {
        //if(target.hp <= 0 && valueCollapseAnime >= 1){}else{
        $gameScreen.startFlash(flashColorData, duration);
        $gameScreen.startShake(shakeIntensity, shakeSpeed, duration);
        //};
      }
    }
    if (animationId >= 1) {
      //if(target.hp <= 0 && valueCollapseAnime >= 1){}else{
      target.startAnimation(animationId, true, animDelay);
      //};
    }
    target.addStateCounter(stateId, damageAmount);
    valueTotalDamageCount += damageAmount;
    valueTotalDamageCount2 += 1;
  }
}

//スキルパワー加算計算skill_addPowerSet(user,$dataSkills,1,1);
skill_addPowerSet = function (user, valueItems, id1, id2) {

  valueAddPowerCustom = 0;
  if (user.isActor()) {
    var arr1 = valueAddPowerCustomSkill;
    if (arr1 != 0) {
      for (var i = 0; i <= arr1.length - 1; i++) {
        if (user.isLearnedSkill(arr1[i]) && user.battleSkillsRaw().includes(arr1[i])) {
          valueAddPowerCustom += Number($dataSkills[arr1[i]].meta['AddPowerCustom']);
          if ($dataSkills[arr1[i]].meta['Max Mastery Level']) {
            valueAddPowerCustom += user.skillMasteryLevel(arr1[i]);
          };
        };
      }
    };
    var arr1 = valueAddPowerCustomWeapon;
    if (arr1 != 0) {
      for (var i = 0; i <= arr1.length - 1; i++) {
        if (user.hasWeapon($dataWeapons[arr1[i]])) { valueAddPowerCustom += Number($dataWeapons[Number(arr1[i])].meta['AddPowerCustom']) };
      }
    };
    var arr1 = valueAddPowerCustomArmor;
    if (arr1 != 0) {
      for (var i = 0; i <= arr1.length - 1; i++) {
        if (user.hasArmor($dataArmors[arr1[i]])) { valueAddPowerCustom += Number($dataArmors[arr1[i]].meta['AddPowerCustom']) };
      }
    };
  };
  var arr1 = valueAddPowerCustomState;
  if (arr1 != 0) {
    for (var i = 0; i <= arr1.length - 1; i++) {
      if (user.isStateAffected(arr1[i])) { valueAddPowerCustom += Number($dataStates[arr1[i]].meta['AddPowerCustom']) };
    }
  };
  if (id2 == 2) { } else {
    if (valueItems[id1].stypeId == 12) {
      if (user.isActor()) {
        if (valueItems[id1].meta['ユニーク']) {
          if ($gameVariables.value(287)[user.actorId()][10] >= 1) {
            valueAddPowerCustom += $gameVariables.value(287)[user.actorId()][10];
          };
        } else {
          if ($dataWeapons[user.equips()[0].id].meta['LotteryRearity']) {
            valueAddPowerCustom += Number($dataWeapons[user.equips()[0].id].meta['LotteryRearity']);
          };
        };
      } else {
        valueAddPowerCustom += Math.round(user.level / 10);
      };
    };
  };
  /*
  valueBattleAddAttack = 0;//<BattleAddAttackSet:50>未使用	
  var arr1 = valueBattleAddAttackSet;
  for (var i = 0; i <= arr1.length-1; i++) {
   if(user.isStateAffected(arr1[i])){
     valueBattleAddAttack += Number($dataStates[arr1[i]].meta['BattleAddAttackSet']);
   };
  };
  */

};

//攻撃時に連撃計算とスキルID代入
const ak1PicIdsToErase = [51, 52, 53, 54, 55, 56, 57, 58, 86, 87, 88, 89, 90, 91, 92, 93, 98, 99];
const ak1ElementIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 34];
const ak1ElementDisplayValues = [131, 133, 135, 137, 139, 141, 143, 145, 147, 367, 369, 147, 149, 371, 373, 375, 377, 379, 381, 383, 385, 387, 389, 130];
const ak1DamageFlashDesignationData = [255, 255, 255, 0];
// uses globals like valueCertainlyDouble, valueCertainlyTriple, valueNormalAttackHit, and valueAttackAbilityHit without explicit declaration
// 
attack_keisan1 = function (user, skillId, sourceTypeId) {
  // Initialize attack variables and clean up UI
  ak1InitializeAttackVariables(user, skillId, sourceTypeId);
  ak1CleanupPreviousAttackUI();

  // Set up the skill and its properties
  ak1SetupSkillProperties(user, skillId, sourceTypeId);

  // Calculate multi-attack count
  ak1CalculateMultiAttackCount(user);

  // Configure animation settings
  ak1ConfigureAnimationSettings(skillId);

  // Set up attack states and elements
  ak1SetupAttackStatesAndElements(user, skillId);

  // Handle damage visualization and special effects
  ak1ConfigureDamageVisualization(user, skillId);

  // Process skill-specific movement and projectile settings
  ak1ProcessSkillSpecialSettings(user, skillId);

  // Handle mastery progression and brave command
  ak1ProcessSkillMasteryAndBraveCommand(user, skillId);

  // Apply final skill customization
  ak1ApplyFinalSkillCustomization(user, skillId);
};

// Initialize attack variables and set source
function ak1InitializeAttackVariables(user, skillId, sourceTypeId) {
  sourceItems = sourceTypeId == 2 ? $dataItems : $dataSkills;
  valueSkillSpecialDispel35 = 0;
  totalDamageCountDuringAction = 0;
  valueDropEnemyPicId = 101;
  valueMetalKiller = 0;
  tachie_syoukyo1(getPreviousTachiePicId());

  $gameVariables.setValue(91, user);
  $gameVariables.setValue(96, skillId);
  $gameVariables.setValue(279, 10); // Initialize delay for state-apply animation
  $gameSwitches.setValue(141, true); // Indicates an attack from a skill/item

  valueAttackCount = 0;
  valueTotalDamageCount = 0; // Total damage variable for this action
  $gameVariables.setValue(331, []); // Array for damage flash configuration
}

// Clean up UI from previous attacks
function ak1CleanupPreviousAttackUI() {
  const pictureData = $gameScreen.picture(50);
  if (pictureData) {
    const picOrigin = pictureData.origin();
    const picX = pictureData.x();
    const picY = pictureData.y();
    const picScaleX = pictureData.scaleX();
    const picScaleY = pictureData.scaleY();
    $gameScreen.movePicture(50, picOrigin, picX, picY, picScaleX, picScaleY, 0, 0, 40);
  }

  pic_eraseP(0, ak1PicIdsToErase);

  const pictureId = 96;
  if ($gameScreen.picture(pictureId)) {
    $gameScreen.movePicture(pictureId, 0, 450, 480, 100, 100, 0, 0, 120);
  }
}

// Set up skill properties and basic settings
function ak1SetupSkillProperties(user, skillId, sourceTypeId) {
  skill_addPowerSet(user, sourceItems, skillId, sourceTypeId);
  const currentItem = sourceItems[skillId];

  $gameVariables.setValue(182, currentItem.stypeId);
  valueSkillDamageType = currentItem.damage.type;
}

// Calculate how many attacks will be performed
function ak1CalculateMultiAttackCount(user) {
  multiAttackCount = 1;
  const elementAttackRate = user.elementRate(11) * 10;

  // Use a single random calculation to determine both checks
  const randomValue1 = getRandomIndex(101);

  // Only calculate the second random value if the first check passes
  if (elementAttackRate >= randomValue1) {
    multiAttackCount += 1;

    // Calculate second random value only if needed
    const randomValue2 = randomValue1 + getRandomIndex(101);
    if (elementAttackRate >= randomValue2) {
      multiAttackCount += 2;
    }
  }

  // Apply guaranteed multi-attacks from states
  ak1ApplyGuaranteedMultiAttacks(user);
}

// Apply guaranteed double and triple attacks from states
function ak1ApplyGuaranteedMultiAttacks(user) {
  // Check for guaranteed double attack
  // Define constant arrays with state IDs and corresponding attack counts to add
  const multiAttackStates = [
    { states: valueCertainlyDouble, addCount: 1, maxAttacks: 2 },
    { states: valueCertainlyTriple, addCount: 2, maxAttacks: 3 }
  ];

  // Loop through each multi-attack type only once
  for (const attackType of multiAttackStates) {
    // Skip if we've already reached or exceeded the maximum attacks for this type
    if (multiAttackCount >= attackType.maxAttacks) continue;

    // Check if user has any of the states that grant this multi-attack
    for (let i = 0; i < attackType.states.length; i++) {
      if (user.isStateAffected(attackType.states[i])) {
        multiAttackCount += attackType.addCount;
        break; // Stop checking once we find a matching state
      }
    }
  }
}

// Configure animation settings for the skill
function ak1ConfigureAnimationSettings(skillId) {
  const currentItem = sourceItems[skillId];
  $gameVariables.setValue(181, currentItem.animationId);
  const animation = $dataAnimations[currentItem.animationId];
  const frameCount = animation.frames.length;

  if (currentItem.stypeId == 12) {
    $gameVariables.setValue(97, frameCount);
  } else {
    let animationModifier = 4;

    if (animation.name) {
      const name = animation.name;
      if (name.includes('!')) animationModifier = 1;
      else if (name.includes('&')) animationModifier = 2;
      else if (name.includes('$')) animationModifier = 3;
    }
    $gameVariables.setValue(97, Math.ceil((frameCount * 4 / 5) * animationModifier / 4));
  }
}

// Set up attack states and elements
function ak1SetupAttackStatesAndElements(user, skillId) {
  const currentItem = sourceItems[skillId];

  // Get attack states and add skill effect states
  valueAttackStates = user.attackStates();
  for (let i = 0; i <= 19; i++) {
    const effect = currentItem.effects[i];
    if (effect && effect.code == 21 && effect.dataId >= 2) {
      valueAttackStates.push(effect.dataId);
    }
  }

  // Handle level fluctuation
  if (user.isStateAffected(410)) {
    if (currentItem.meta['LevelFluctuation']) {
      valueLevelFluctuation = Number(currentItem.meta['LevelFluctuation']);
    } else {
      valueLevelFluctuation = 0;
    }
  }

  // Set up attack elements
  ak1SetupAttackElements(user, currentItem);
}

// Set up attack elements from skill and user properties
function ak1SetupAttackElements(user, currentItem) {
  attackElementsList = [];

  // Add elements from skill metadata
  if (currentItem.meta['Multiple Elements']) {
    attackElementsList.push(...currentItem.meta['Multiple Elements'].split(','));
  }

  // Add element from damage settings
  if (currentItem.damage.elementId >= 1) {
    attackElementsList.push(currentItem.damage.elementId);
  }

  // Add user's innate attack elements
  attackElementsList.push(...user.attackElements());
}

// Configure damage visualization based on elements and skill properties
function ak1ConfigureDamageVisualization(user, skillId) {
  const currentItem = sourceItems[skillId];
  $gameVariables.setValue(93, 131); // Default damage visualization
  $gameVariables.setValue(526, 1); // Default hit count

  // Set damage visualization based on elements
  ak1ConfigureElementDamageVisualization(currentItem);

  // Configure special flash effect based on elements
  ak1ConfigureElementFlashEffect(user);
}

// Configure damage visualization based on elements in the skill
function ak1ConfigureElementDamageVisualization(currentItem) {
  if (!currentItem.meta['Multiple Elements']) return;

  const multipleElements = currentItem.meta['Multiple Elements'].split(',');
  if (currentItem.damage.elementId >= 1) {
    multipleElements.push(currentItem.damage.elementId);
  }

  const randomIndex = getRandomIndex(multipleElements.length);
  const selectedElementId = multipleElements[randomIndex];

  if (selectedElementId >= 1) {
    const elementIdsCount = ak1ElementIds.length;
    for (let i = 0; i < elementIdsCount; i++) {
      if (selectedElementId == ak1ElementIds[i]) {
        $gameVariables.setValue(93, ak1ElementDisplayValues[i]);
        $gameVariables.setValue(331, ak1DamageFlashDesignationData);
      }
    }
  }
}

// Configure flash effect based on the user's elemental affinities
const testIds = new Set([3, 4, 5, 6, 7, 8, 9]);
function ak1ConfigureElementFlashEffect(user) {
  const candidateElements = [0];

  const len = attackElementsList.length;
  for (let i = 0; i < len; i++) {
    if (i == 35) { valueSkillSpecialDispel35 += 1; }

    const attackElement = attackElementsList[i];
    const elementId = Number(attackElement);

    if (testIds.has(elementId) && user.elementAmplifyRate(elementId) >= 0.5) {
      candidateElements.push(attackElement);
    }
  }

  if (candidateElements.length > 0) {
    const maxCandidateElement = Math.max(...candidateElements);
    ak1SetDamageFlashConfiguration(maxCandidateElement);
  }
}

// Process skill-specific movement and projectile settings
function ak1ProcessSkillSpecialSettings(user, skillId) {
  const currentItem = sourceItems[skillId];

  const meta = currentItem.meta;
  $gameVariables.setValue(349, meta['moveReaction'] ? Number(meta['moveReaction']) : 0);
  $gameSwitches.setValue(462, !meta['ProjectileSkill']);

  if (user.isEnemy()) {
    if (!$dataEnemies[user.enemyId()].meta[`Sideview Battler`]) {
      $gameSwitches.setValue(462, false);
    }
  }
}

// Process skill mastery progression and brave command effects
function ak1ProcessSkillMasteryAndBraveCommand(user, skillId) {
  //const currentItem = sourceItems[skillId];
  const abilityUsageDistinction = $gameVariables.value(182);

  // Handle skill mastery progression
  if (user.isActor() && abilityUsageDistinction == 2) {
    ak1ProcessSkillMasteryProgression(user, skillId);
  }

  // Handle brave command state
  ak1ProcessBraveCommandState(abilityUsageDistinction);
}

// Define the subclass-to-weapon mastery mapping
const ak1SubclassWeaponMastery = {
  97: { weaponTypes: [1, 7], value: 1 },
  107: { weaponTypes: [1, 6], value: 1 },
  108: { weaponTypes: [4, 6], value: 1 },
  101: { weaponTypes: [4, 5], value: 1 },
  115: { weaponTypes: [2, 8], value: 1 },
  96: { weaponTypes: [1, 2], value: 1 },
  106: { weaponTypes: [5, 7], value: 1 },
  120: { weaponTypes: [3, 9], value: 1 },
  102: { weaponTypes: [8, 9], value: 1 },
  199: { weaponTypes: [2, 10], value: 1 },
  43: { weaponTypes: [7], value: 2 }, // Note: Original has redundant condition; simplified here
};

// Process skill mastery progression for subclasses
function ak1ProcessSkillMasteryProgression(user, skillId) {
  if (user.isActor() && $gameVariables.value(182) == 2) {
    const subclass = user.subclass();
    if (subclass && user.equips()[0]) {
      const subclassIcon = Number($dataClasses[subclass.id].meta['Icon']);
      const weaponType = Number($dataWeapons[user.equips()[0].id].wtypeId);

      if (ak1SubclassWeaponMastery[subclassIcon] &&
        ak1SubclassWeaponMastery[subclassIcon].weaponTypes.includes(weaponType)) {
        const value3 = ak1SubclassWeaponMastery[subclassIcon].value;
        const classRankNum = Number($dataClasses[subclass.id].meta['classRank']);
        user.gainSkillMasteryUses(skillId, value3 * classRankNum);
      }
    }
  }
}

// Process brave command state updates for Lisha (actor 1)
function ak1ProcessBraveCommandState(abilityUsageDistinction) {
  const actor1 = $gameActors.actor(1);

  if ($gameParty.members().contains(actor1) && actor1.isStateAffected(662)) {
    const stateCounter = actor1._stateCounter[662];

    for (let i = 0; i < 4; i++) {
      if (abilityUsageDistinction == i + 5 && stateCounter[i] >= 0 && stateCounter[i] <= 4) {
        stateCounter[i] += 1;
      }
    }
  }
}

// Apply final skill customization based on metadata and skill type
function ak1ApplyFinalSkillCustomization(user, skillId) {
  const currentItem = sourceItems[skillId];
  const currentItemName = currentItem.name;
  const abilityUsageDistinction = $gameVariables.value(182);

  // Update UI variables based on ability type
  ak1UpdateVariablesBasedOnGameVar(abilityUsageDistinction, currentItemName, currentItem);

  // Apply skill-specific damage visualization
  if (currentItem.meta['SkillDamageAction']) {
    $gameVariables.setValue(93, Number(currentItem.meta['SkillDamageAction']));
  }

  // Apply instant effect flag
  $gameSwitches.setValue(91, !!currentItem.meta['Instant']);

  // Apply repeat count
  if (currentItem.meta['Repeat']) {
    $gameVariables.setValue(526, Number(currentItem.meta['Repeat']));
  }

  // Apply hit count buffs based on skill type and states
  ak1ApplyHitCountBuffs(user, abilityUsageDistinction);
}

// Apply additional hits based on states and ability type
function ak1ApplyHitCountBuffs(user, abilityUsageDistinction) {
  if (abilityUsageDistinction == 2) {
    ak1ApplyValueAttackHit(user, valueNormalAttackHit, 'NormalAttackHit');
  }

  if (abilityUsageDistinction == 2 || abilityUsageDistinction == 6) {
    ak1ApplyValueAttackHit(user, valueAttackAbilityHit, 'AttackAbilityHit');
  }
}

/**
* Updates game variables based on the current value of game variable 182 (ability usage distinction).
* This controls text colors and visual representations of different skill types.
* 
* @param {number} abilityUsageDistinction - The type of ability (from $gameVariables.value(182))
* @param {string} itemName - The name of the current item/skill
* @param {object} item - The current item/skill data object
*/
function ak1UpdateVariablesBasedOnGameVar(abilityUsageDistinction, itemName, item) {
  // Set colored name display and damage representation based on ability type
  switch (abilityUsageDistinction) {
    case 12: // Ougi/Limit Break
      $gameVariables.setValue(93, 367); // Specific damage visualization
      break;

    case 13: // Chain Attack
      $gameVariables.setValue(93, 369); // Specific damage visualization
      $gameVariables.setValue(527, `\\C[18]＜${itemName}＞\\C[0]`); // Blue colored name
      break;

    case 11: // Unknown type
      $gameVariables.setValue(527, `\\C[10]＜${itemName}＞\\C[0]`); // Yellow colored name
      break;

    case 5: // S-Ability (Special Ability)
      $gameVariables.setValue(527, `\\C[17]＜${itemName}＞\\C[0]`); // Purple colored name
      $gameVariables.setValue(93, 0); // Reset damage visualization
      break;

    case 6: // A-Ability (Active Ability)
      $gameVariables.setValue(527, `\\C[10]＜${itemName}＞\\C[0]`); // Yellow colored name
      break;

    case 7: // W-Ability (Weapon Ability)
      $gameVariables.setValue(527, `\\C[9]＜${itemName}＞\\C[0]`); // Light blue colored name
      $gameVariables.setValue(93, 0); // Reset damage visualization
      break;

    case 8: // R-Ability (Recovery Ability)
      $gameVariables.setValue(527, `\\C[3]＜${itemName}＞\\C[0]`); // Green colored name
      // Set visualization based on damage type (heal or damage)
      $gameVariables.setValue(93, item.damage.type == 2 ? 249 : 245);
      break;

    default:
      // No specific handling for other types
      break;
  }
}

// Flash effect colors for different elements [R, G, B, Alpha]
// Element ID to flash color mapping for damage visualization
const elementFlashColors = {
  3: [255, 102, 119, 0], // Fire element - Red flash
  4: [119, 255, 119, 0], // Earth element - Green flash
  5: [255, 187, 119, 0], // Wind element - Orange flash
  6: [85, 153, 255, 0],  // Water element - Blue flash
  7: [255, 255, 119, 0], // Light element - Yellow flash
  8: [68, 0, 68, 0],     // Dark element - Purple flash
  9: [255, 255, 255, 0]  // Neutral element - White flash
};
/**
* Sets the damage flash effect color based on the elemental property.
* This creates visual feedback when damage of specific elements is dealt.
* 
* @param {number} elementId - The ID of the element to set flash effect for
*/
function ak1SetDamageFlashConfiguration(elementId) {

  // Set flash effect based on element ID if available in the mapping
  const flashColors = elementFlashColors[elementId];
  if (flashColors) {
    $gameVariables.setValue(331, flashColors);
  }
}

/**
* Applies additional damage multipliers based on user's active states.
* This allows state-based attack bonuses to affect combat.
* 
* @param {object} user - The battler using the skill/attack
* @param {Array} stateArray - Array of state IDs to check
* @param {string} stateMetaName - Metadata property to read from states
*/
ak1ApplyValueAttackHit = function (user, stateArray, stateMetaName) {
  // Current hit count stored in game variable 526
  let currentHitCount = $gameVariables.value(526);

  // Check each potential state that could affect hit count
  for (let i = 0; i < stateArray.length; i++) {
    const stateId = stateArray[i];

    // If user has this state, add its hit bonus
    if (user.isStateAffected(stateId)) {
      const additionalHits = Number($dataStates[stateId].meta[stateMetaName]);
      currentHitCount += additionalHits;
    }
  }

  // Update the game variable with new hit count
  $gameVariables.setValue(526, currentHitCount);
}

//属性耐性ダウン付与
Element_DebuffRateA = function (target, stateId) {

  if (target._stateCounter[stateId] < 0.001) {
    target.setStateCounter(stateId, 0);
  };
  var code = 11;
  var stateElementId = Number($dataStates[stateId].meta['ElementId']);
  var stateDebuffRate = Number($dataStates[stateId].meta['DebuffRate']);
  const target1 = $dataStates[(target.isEnemy() ? 490 : 486) + target.index()];
  target1.traits.push({ code: code, dataId: stateElementId, value: 1 + (stateDebuffRate / 100) });
  target.addStateCounter(stateId, +(stateDebuffRate / 100));

};

//属性耐性ダウン解除
Element_DebuffRateR = function (target, stateId) {

  if (target._stateCounter[stateId] >= 1) {
    const code = 11;
    const dataId = Number($dataStates[stateId].meta['ElementId']);
    const dataStateId = target.isEnemy() ? 490 : 486;
    const target1 = $dataStates[dataStateId + target.index()];
    target1.traits.push({ code: code, dataId: dataId, value: 1 - target.getStateCounter[stateId] });
    target.removeStateCounter(stateId);
  };
};

//ステート付与時のアクション
const defaultPopupColorArray = [255, 128, 0, 255, 256];
const alternativePopupColorArray = [255, 0, 187, 189, 256];
state_addEffect1 = function (user, target, stateId, animationId) {

  if (!$gameTroop.isAllDead() && $gameParty.inBattle()) {
    const stateData = $dataStates[stateId];
    const stateMeta = stateData.meta;
    let resistanceFactor;
    resistanceFactor = target.isStateAffected(289) ? 0.2 : 0.1;
    if (stateMeta['registUp']) {
      resistanceFactor = Math.ceil(Number(stateMeta['registUp']) / 100);
    }
    const stateObject = target.isEnemy() ? $dataStates[490 + target.index()] : $dataStates[486 + target.index()];
    let popupColorArray = defaultPopupColorArray;
    if (stateMeta['Category']) {
      if (stateMeta['Category'] === ' StateabNomal' || stateMeta['Category'] === ' StateSPabNomal') { //耐性付与。強化は除外
        stateObject.traits.push({ code: 13, dataId: stateId, value: 1 - resistanceFactor });
        popupColorArray = alternativePopupColorArray;
      }
    } else {
      stateObject.traits.push({ code: 13, dataId: stateId, value: 1 - resistanceFactor });
    }
    const additionalStateConfig = valueStateAddState; //<stateAddState:5,201,2>//反応するｽｷﾙﾀｲﾌﾟ,追加ｽﾃｰﾄ,追加回数
    for (let configIndex = 0; configIndex <= additionalStateConfig.length - 1; configIndex++) {
      if (target.isStateAffected(additionalStateConfig[configIndex])) {
        const configStateMeta = $dataStates[additionalStateConfig[configIndex]].meta;
        if (Number(configStateMeta['stateAddState'].split(',')[0]) === $gameVariables.value(182)) {
          for (let repIndex = 1; repIndex <= Number(configStateMeta['stateAddState'].split(',')[2]); repIndex++) {
            target.addState(Number(configStateMeta['stateAddState'].split(',')[1]));
          }
        }
      }
    }
    if (ConfigManager.battleAniSpeed >= 3) {
      target.startAnimation(animationId, false, $gameVariables.value(279));
      $gameVariables.setValue(279, $gameVariables.value(279) + $gameVariables.value(280));
      target.startMessagePopup(stateData.name, popupColorArray);
    }
  }

};

//ステート解除時のアクション
state_removeEffect1 = function (user, target, stateId, animationId) {

  user.removeStateCounter(stateId);
  if (!$gameTroop.isAllDead() && $gameParty.inBattle()) {
    if (ConfigManager.battleAniSpeed >= 3) {
      let colorIndex = 0;
      let s = ` `;
      const state = $dataStates[stateId];
      if (state.meta['Category']) {
        if (state.meta['Category'] == ' PowerUp') {
          colorIndex = 2;
        } else {
          colorIndex = 1;
          s = `…`;
        };
      }
      target.startAnimation(animationId, false, $gameVariables.value(279));
      $gameVariables.setValue(279, $gameVariables.value(279) + $gameVariables.value(280));
      const actorName = target.name();
      const stateName = `\\C[${colorIndex}]${state.name}\\C[0]`;
      BattleManager._logWindow.push(`addText`, `${actorName}の${stateName}が解除された${s}`);
    }
  };

};

//特殊効果ステート発動時のアクション
activate_spcialState = function (user, id1) {

  if ($dataStates[id1].meta['activateRate']) {
    if (user.isLearnedSkill(746) && user.skillMasteryLevel(746) >= 1) {
      var value1 = Number($dataStates[id1].meta['activateRate']) - ((Number($dataStates[id1].meta['activateRate']) * user.skillMasteryLevel(746) / 10));
    } else {
      var value1 = Number($dataStates[id1].meta['activateRate']);
    };
    if (user.battleSkillsRaw().includes(747)) {
      var value1 = value1 - (value1 * 2 / 10);
    };
    if (user.battleSkillsRaw().includes(748)) {
      var value1 = value1 - (value1 * 49 / 100);
    };
    if (user.mpRate() >= value1) {
      user.startAnimation(615, true, 0)
      var dmg = Math.ceil(user.mmp * value1);
      user.gainMp(-dmg);
      user.startDamagePopup();
      user.clearResult();
    } else {
      var value2 = `${user.name()}はMPが足らず\\SIM[109]になった…`;
      BattleManager._logWindow.push(`addText`, value2);
      user.startAnimation(275, true, 0);
      user.addState(109);
    };
  };
  if ($dataStates[id1].meta['activatePoint']) {
    if (user.isLearnedSkill(746) && user.skillMasteryLevel(746) >= 1) {
      var value1 = Number($dataStates[id1].meta['activatePoint']) - (Number($dataStates[id1].meta['activatePoint']) * user.skillMasteryLevel(746) / 10);
    } else {
      var value1 = Number($dataStates[id1].meta['activatePoint']);
    };
    if (user.battleSkillsRaw().includes(747)) {
      var value1 = value1 - (value1 * 2 / 10);
    };
    if (user.battleSkillsRaw().includes(748)) {
      var value1 = value1 - (value1 * 49 / 100);
    };
    if (user.mp >= value1) {
      user.startAnimation(615, true, 0)
      var dmg = Math.ceil(value1);
      user.gainMp(-dmg);
      user.startDamagePopup();
      user.clearResult();
    } else {
      var value2 = `${user.name()}はMPが足らず\\SIM[19]になった…`;
      BattleManager._logWindow.push(`addText`, value2);
      user.startAnimation(275, true, 0);
      user.addState(109);
    };
  };

};

//チェインスキル実行267valueChainTotalStat,268valueChainMemberCount,30valueChainElement,29valueChainSkillId
chain_skill = function () {

  for (var i = 0; i < $gameParty.battleMembers().length; i++) {
    if ($gameParty.battleMembers()[i].isStateAffected(234) && !$gameParty.battleMembers()[i].isRestricted()) {
      valueChainMemberCount += 1;
      valueChainTotalStat += $gameParty.members()[i].atk;
      valueChainTotalStat += $gameParty.members()[i].mat;
    };
  };
  if (valueChainMemberCount >= 2) {
    for (var i = 0; i < $gameParty.battleMembers().length; i++) {
      var actor = $gameParty.battleMembers()[i];
      if (actor.isStateAffected(234)) {
        $gameVariables.setValue(20, actor.actorId());
        break;
      }
    };
    for (var i = 49; i < 57; i++) {
      var actor = $gameActors.actor($gameVariables.value(20));
      if (actor.isStateAffected(i)) {
        valueChainElement = i;
        break;
      }
    };
    if (valueChainElement == 0) {
      valueChainSkillId = 98;
    } else {
      valueChainSkillId = Number($dataStates[valueChainElement].meta['ChainID']);
    };
    if ($dataSkills[valueChainSkillId].meta['2rdChain'] || $dataSkills[valueChainSkillId].meta['3rdChain'] || $dataSkills[valueChainSkillId].meta['4thChain']) {
      if (valueChainMemberCount == 2) {
        $dataSkills[valueChainSkillId].name = $dataSkills[valueChainSkillId].meta['2rdChain'];
      };
      if (valueChainMemberCount == 3) {
        $dataSkills[valueChainSkillId].name = $dataSkills[valueChainSkillId].meta['3rdChain'];
      };
      if (valueChainMemberCount >= 4) {
        $dataSkills[valueChainSkillId].name = $dataSkills[valueChainSkillId].meta['4thChain'];
      };
    };
    $gameVariables.setValue(267, value1 + value2);
  };

};

//攻撃防御時バストアップ表示$gameVariables.setValue(20,1); $gameVariables.setValue(520, [1,7]); 520→valueFaceSelect = 1;
battle_bustUp = function (basePictureId, baseMoveX, baseMoveY, baseDurationOffset) {
  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  battle_bustUp1(actor, basePictureId, baseMoveX, baseMoveY, baseDurationOffset);
}
battle_bustUp1 = function (gameActor, basePictureId, baseMoveX, baseMoveY, baseDurationOffset) {
  // Get the acting actor's ID from the game variables
  if (!isGirl(gameActor)) {
    return;
  };

  // Setup picture motion and compute picture scale & vertical shift
  const { pictureScale, verticalShift } = setupScaleAndShiftBattleBustUpBattleBustUp();

  // Calculate horizontal adjustment based on battle state and switches
  const horizontalShift = calculateHorizontalAdjustmentBattleBustUpBattleBustUp();

  const actorId = gameActor.actorId();
  const moveOffsetX = baseMoveX;
  const moveOffsetY = baseMoveY;
  const extraMoveDuration = baseDurationOffset;
  const actorFaceBaseName = actorId + 'Actor_' + valueFaceSelect;

  // Loop through each face image part (from 0 to 7)
  for (let i = 0; i <= 7; i++) {
    processFaceImageBattleBustUpBattleBustUp(
      basePictureId, actorId, actorFaceBaseName, i,
      horizontalShift, verticalShift,
      moveOffsetX, moveOffsetY, pictureScale, extraMoveDuration
    );
  }

  // Process hypnosis effect if actor is affected by hypnosis state (782)
  processHypnosisEffectBattleBustUpBattleBustUp(
    basePictureId, gameActor,
    horizontalShift, verticalShift,
    moveOffsetX, moveOffsetY, pictureScale, extraMoveDuration
  );

  if ($gameVariables.value(276) > 0) {
    picture_motion1("smooth", [0]);
  }
};

//---------------------------------------------------------------------
// Setup scale and vertical shift based on the current battle conditions.
//---------------------------------------------------------------------
function setupScaleAndShiftBattleBustUpBattleBustUp() {
  let pictureScale = 100;
  let verticalShift = 0;
  if ($gameSwitches.value(471)) {
    picture_motion1("linear", [0]);
    pictureScale = 100;
    verticalShift = 0;
  } else {
    picture_motion1("smooth", [0]);
    pictureScale = 100;
    verticalShift = 0;
    if ($gameVariables.value(276) == 2) {
      curveFunctions.patternScaleX = curveFunctions.getPattern('wave', [20, 0.5]);
      curveFunctions.patternScaleY = curveFunctions.getPattern('wave', [20, 0.5]);
      curveFunctions.patternX = curveFunctions.getPattern('jump', [-100]);
      curveFunctions.patternY = curveFunctions.getPattern('jump', [-10]);
      pictureScale = 100;
      verticalShift = 50;
    }
    else if ($gameVariables.value(276) == 1) {
      curveFunctions.patternScaleX = curveFunctions.getPattern('damped', [5, -0.3, 5, 0, 1]);
      curveFunctions.patternScaleY = curveFunctions.getPattern('damped', [5, -0.3, 5, 0, 1]);
      curveFunctions.patternX = curveFunctions.getPattern('jump', [100]);
      pictureScale = 100;
      verticalShift = 0;
    }
  }
  return { pictureScale: pictureScale, verticalShift: verticalShift };
}

//---------------------------------------------------------------------
// Calculate horizontal adjustment based on battle variables and switches.
//---------------------------------------------------------------------
function calculateHorizontalAdjustmentBattleBustUpBattleBustUp() {
  let horizontalAdjustment;
  if ($gameVariables.value(276) == 2) {
    horizontalAdjustment = 800;
  } else if ($gameVariables.value(276) == 1) {
    horizontalAdjustment = 300;
  }
  if ($gameSwitches.value(436)) {
    horizontalAdjustment = $gameMessage._IZSTPicMoveParam[0] - 640;
  }
  if ($gameSwitches.value(471)) {
    horizontalAdjustment = 300;
  }
  return horizontalAdjustment;
}

//---------------------------------------------------------------------
// Process and display each face image based on its index.
//---------------------------------------------------------------------
function processFaceImageBattleBustUpBattleBustUp(basePictureId, actorId, faceImageName, index, horizontalShift, verticalShift, moveOffsetX, moveOffsetY, pictureScale, extraMoveDuration) {
  // Get the proper face image name and flag for display
  const { faceImageName, showPictureFlag } = getFaceImageNameBattleBustUp(actorId, index);

  if (showPictureFlag === true) {
    $gameScreen.showPicture(
      basePictureId + index,
      "/img/talkface/" + faceImageName,
      1,
      640 + horizontalShift,
      384 + verticalShift + moveOffsetY,
      pictureScale,
      pictureScale,
      0,
      0
    );
    if (!$gameSwitches.value(471)) {
      $gameScreen.movePicture(
        basePictureId + index,
        1,
        640 + moveOffsetX,
        384 + moveOffsetY,
        100,
        100,
        255,
        0,
        extraMoveDuration + 10
      );
    }
    if (index == 3) {
      if ($gameParty.inBattle()) {
        hcg_piston(basePictureId + index, 10, 2, 4);
      } else {
        hcg_piston(basePictureId + index, 10, 1, 4);
      }
    } else {
      tachie_bless(basePictureId + index, 3);
    }
  }
}

//---------------------------------------------------------------------
// Process the hypnosis effect for the actor if state 782 is active.
//---------------------------------------------------------------------
function processHypnosisEffectBattleBustUpBattleBustUp(basePictureId, gameActor, horizontalAdjustment, verticalShift, moveOffsetX, moveOffsetY, pictureScale, extraMoveDuration) {
  // Early exit conditions to avoid unnecessary processing
  if ($gameSwitches.value(471) || !gameActor.isStateAffected(782) || !$gameScreen.picture(99)) {
    return;
  }

  // Cache values to reduce property lookups
  const hypnosisCount = gameActor.getStateCounter(782);
  const hypnosisImageName = `${actorId}ActorHypnosisEye_0`;
  
  // Set animation parameters once
  $gameScreen.setPicturesAnimation(2, 10, "連番", hypnosisCount);
  
  // Calculate positions once
  const initialX = 640 + horizontalAdjustment;
  const initialY = 384 + verticalShift + moveOffsetY;
  const targetX = 640 + moveOffsetX;
  const targetY = 384 + moveOffsetY;
  
  // Show and move the picture
  $gameScreen.showPicture(
    99,
    "/img/talkface/" + hypnosisImageName,
    1,
    initialX,
    initialY,
    pictureScale,
    pictureScale,
    0,
    0
  );
  
  $gameScreen.movePicture(
    99,
    1,
    targetX,
    targetY,
    100,
    100,
    255,
    0,
    extraMoveDuration + 10
  );
  
  // Start the animation frame with fixed parameters
  $gameScreen.picture(99).startAnimationFrame(3, true, [1, 1, 1, 2]);
}

function getFaceImageNameBattleBustUp(actorId, i) {
  let faceImageName = "";
  let showPictureFlag = true;
  switch (i) {
    case 0:
      if (valueLiningCloth[actorId] >= 1) {
        faceImageName = actorId + 'Actor' + "Lining" + valueLiningCloth[actorId];
      } else {
        showPictureFlag = false;
      }
      break;
    case 1:
      if (valueBackHairCloth[actorId] >= 1) {
        faceImageName = actorId + 'Actor' + "BackHair" + valueBackHairCloth[actorId];
      } else {
        showPictureFlag = false;
      }
      break;
    case 2:
      if (valueBustUpCloth[actorId] >= 0) {
        faceImageName = actorId + 'Actor' + "Cloth" + valueBustUpCloth[actorId];
      } else {
        showPictureFlag = false;
      }
      break;
    case 3:
      if (valueBustUpCloth2[actorId] >= 0) {
        faceImageName = actorId + 'Actor' + "BustUp" + valueBustUpCloth2[actorId];
      } else {
        showPictureFlag = false;
      }
      break;
    case 4:
      if (valueCoatCloth[actorId] >= 1) {
        faceImageName = actorId + 'Actor' + "Coat" + valueCoatCloth[actorId];
      } else {
        showPictureFlag = false;
      }
      break;
    case 5:
      faceImageName = actorId + 'Actor_' + valueFaceSelect;
      break;
    case 6: {
      const actor = $gameActors.actor(actorId);
      if (actor.isStateAffected(781) || actor.isStateAffected(783)) {
        if (actor.isStateAffected(781)) {
          faceImageName = actorId + 'Actor' + "CloudyEye1";
        }
        if (actor.isStateAffected(783)) {
          faceImageName = actorId + 'Actor' + "CloudyEye2";
        }
        if (actor.isStateAffected(785)) {
          faceImageName = actorId + 'Actor' + "CloudyEye4";
        }
      } else {
        showPictureFlag = false;
      }
      break;
    }
    case 7: {
      const actor = $gameActors.actor(actorId);
      if (actor.isStateAffected(784)) {
        faceImageName = actorId + 'Actor' + "CloudyEye3";
      } else {
        if (valueFrontHairCloth[actorId] >= 0) {
          faceImageName = actorId + 'Actor' + "FrontHair" + valueFrontHairCloth[actorId];
        } else {
          showPictureFlag = false;
        }
      }
      break;
    }
  }
  return { faceImageName, showPictureFlag };
}

//オーラ表現
tachie_aura = function () {
  // Early exits for most common cases to avoid unnecessary processing
  if (!$gameParty.inBattle()) return;

  tachie_aura1($gameActors.actor($gameVariables.value(20)));
}
tachie_aura1 = function (gameActor) {
  // Early exits for most common cases to avoid unnecessary processing
  if (!$gameParty.inBattle()) return;
  
  // Combine conditions for better performance
  if (gameActor.tp < 100 || !isGirl(gameActor)) return;
  
  // Check if the picture exists before proceeding
  const tachiePictureId = Number(gameActor.actor().meta['tachiePicId']);
  if (!$gameScreen.picture(tachiePictureId)) return;

  // Get all required variables at once to minimize variable lookups
  const baseX = $gameVariables.value(105);
  const baseY = $gameVariables.value(106);
  const scaleX = $gameVariables.value(107);
  const scaleY = $gameVariables.value(108);
  const pictureIdOffset = tachiePictureId - 20;
  
  // Create image path once
  const imagePath = "/img/tachies/actor" + pictureIdOffset + '_45_1';
  
  // Determine if animation is needed based on gameVariable state
  const isAnimationNeeded = $gameVariables.value(276) < 1;
  
  // Show picture with conditional parameters for better performance
  $gameScreen.showPicture(
    45,                          // Picture ID
    imagePath,                   // Image path
    1,                           // Origin
    baseX,                       // X position
    baseY,                       // Y position
    isAnimationNeeded ? 0 : scaleX,  // Scale X
    isAnimationNeeded ? 0 : scaleY,  // Scale Y
    isAnimationNeeded ? 0 : 255,     // Opacity
    1                            // Blend mode
  );
  
  // Only perform animation if needed
  if (isAnimationNeeded) {
    $gameScreen.movePicture(45, 1, baseX, baseY, scaleX, scaleY, 255, 1, 60);
  }
};

//パーティメンバーが居る時に拘束解除。
actor_kousokukaijo1 = function (boundActorId) {
  const battleMembers = $gameParty.battleMembers();
  
  // Loop through battle members to find someone who can rescue
  for (let i = 0; i < battleMembers.length; i++) {
    const member = battleMembers[i];
    
    // Skip if this member is the bound actor or has incapacitating states, or has skill 80
    if (member.actorId() === boundActorId || 
        member.isStateAffected(61) || 
        member.isStateAffected(63) || 
        member.isStateAffected(64) || 
        member.battleSkillsRaw().contains(80)) {
      continue;
    }
    
    // Found a member who can help - set rescue state
    member.addState(89);
    
    // Handle side view positioning if needed
    if ($dataSystem.optSideView) {
      const partyPosition = i + 1;
      const currentPosition = [$gameParty.getX(partyPosition), $gameParty.getY(partyPosition)];
      
      // Save current position for later restoration
      $gameVariables.setValue(705, currentPosition);
      
      // Move to the bound character's position with offset
      const targetPositionData = $gameVariables.value(704);
      $gameParty.set(partyPosition, targetPositionData[0] + 50, targetPositionData[1], 20);
    }
    
    // We only need one rescuer, so exit after finding one
    break;
  }
};

//パーティメンバーが居る時に拘束解除。
actor_kousokukaijo2 = function (boundActorId) {
  const battleMembers = $gameParty.battleMembers();
  const boundActor = $gameActors.actor(boundActorId);
  
  // Check if there are any party members with state 89 (rescue state)
  for (let i = 0; i < battleMembers.length; i++) {
    const partyMember = battleMembers[i];
    
    // Skip if this member doesn't have the rescue state
    if (!partyMember.isStateAffected(89)) continue;
    
    // Play animation on the rescuing party member
    partyMember.startAnimation(351, false, 0);
    
    // Get a random message from the actor's metadata
    const actorId = partyMember.actorId();
    const bindRemoveMessages = $dataActors[actorId].meta['BindRemove'].split(',');
    const randomMessage = bindRemoveMessages[getRandomIndex(bindRemoveMessages.length)];
    $gameVariables.setValue(525, randomMessage);
    
    // Display battle log message
    const logMessage = `${partyMember.name()}は${boundActor.name()}の拘束を解きに掛かった！`;
    BattleManager._logWindow.push('addText', logMessage);
    
    // Remove the bind state from the bound actor
    boundActor.removeState(63);
    
    // No need to continue checking other party members once one is found who can unbind
    break;
  }
};

//パーティメンバーが居る時に拘束解除時の反応。
actor_kousokukaijo3 = function(actorId) {
  // Cache frequently used data and perform early exit if no rescue state found
  const battleMembers = $gameParty.battleMembers();
  let rescuingMemberIndex = -1;
  
  // Find the first party member with state 89 (rescue state)
  for (let i = 0; i < battleMembers.length; i++) {
    if (battleMembers[i].isStateAffected(89)) {
      rescuingMemberIndex = i;
      break;
    }
  }
  
  // Early exit if no rescuing member found
  if (rescuingMemberIndex === -1) return;
  
  // Get rescuing party member and bound actor
  const partyMember = battleMembers[rescuingMemberIndex];
  const actor = $gameActors.actor(actorId);
  const actorData = actor.actor();
  
  // Handle state changes
  partyMember.removeState(89);
  actor.removeState(69);
  
  // Handle positioning in side view battles
  if ($dataSystem.optSideView) {
    const enemyMovementData = $gameVariables.value(703);
    if (enemyMovementData) {
      const troopMemberIndex = $gameVariables.value(92) + 1;
      const partyMemberIndex = rescuingMemberIndex + 1;
      
      $gameTroop.set(troopMemberIndex, enemyMovementData[0], enemyMovementData[1], 30);
      $gameParty.set(partyMemberIndex, enemyMovementData[0], enemyMovementData[1], 30);
    }
  }
  
  // Handle success messages and face display
  const meta = actorData.meta;
  const bindRemoveSuccessFaceData = meta['BindRemoveSuccessFace'].split(',');
  const faceImageCode = Number(bindRemoveSuccessFaceData[0]);
  const faceImageFrame = Number(bindRemoveSuccessFaceData[1]);
  
  // Get a random success message
  const bindRemoveSuccessMessages = meta['BindRemoveSuccess'].split(',');
  const randomMessageIndex = getRandomIndex(bindRemoveSuccessMessages.length);
  const successMessage = bindRemoveSuccessMessages[randomMessageIndex];
  
  // Set variables and display messages
  $gameVariables.setValue(525, successMessage);
  BattleManager._logWindow.push('addText', `${actor.name()}は拘束から助け出された！`);
  
  // Show face and message
  $gameMessage.newPage();
  $gameMessage.setFaceImage(`${actorId}Actor${faceImageCode}`, faceImageFrame);
  $gameMessage.add('\\V[525]');
  
  // Reset movement data
  $gameVariables.setValue(703, 0);
};

//アビリティ後にＣＧ消去
const skillAfter1picEraseIds = [51, 52, 53, 54, 55, 56, 57, 86, 87, 88, 89, 90, 91, 92, 93, 98, 99];
skill_after1 = function (user, skillId) {

  if (valueAttackCount !== 0) {
    return;
  };

  pic_eraseP(0, skillAfter1picEraseIds);
  if ($gameSwitches.value(91)) {
    const picture50 = $gameScreen.picture(50);
    if (picture50) {
      const origin = picture50.origin();
      const xPosition = picture50.x();
      const yPosition = picture50.y();
      const scaleX = picture50.scaleX();
      const scaleY = picture50.scaleY();
      //const currentOpacity = picture50.opacity();
      $gameScreen.movePicture(50, origin, xPosition, yPosition, scaleX, scaleY, 250, 0, 60);
    }
  };
  valueAttackCount = 1;

};

//オーバーキル時のカウント
overkill_count = function () {

  $gameVariables.value(380 + $gameVariables.value(20))[67] += 1;

};

//戦闘時に各種特別能力値表示。縦に18
const elemIdsBattleXsarStatas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17];
const attackElementIdsBattleXsarStatas = [18, 19, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80];
battle_xsarStatas = function (battlerActorId) {
  const isEnemy = battlerActorId > 20;
  const user = (battlerActorId === 20)
    ? $gameActors.actor($gameVariables.value(20))
    : $gameTroop.members()[battlerActorId];

  battle_xsarStatas1(user, isEnemy);
}
battle_xsarStatas1 = function (user, isEnemy) {

  // Build text parts from separated logic functions
  const statsTextPart1 = buildStatsTextPart1BattleXsarStatas(user);
  const statsTextPart2 = buildStatsTextPart2BattleXsarStatas(user, isEnemy);
  const statsTextPart3 = buildStatsTextPart3BattleXsarStatas(user, isEnemy);
  const statsTextPart4 = buildStatsTextPart4BattleXsarStatas(user, isEnemy);

  // Show windows and draw texts for parts 1, 2, 3
  WindowManager.show(1, 0, 105, 300, 663);
  WindowManager.show(2, 300, 105, 300, 663);
  WindowManager.show(3, 600, 105, 300, 663);
  WindowManager.drawText(1, `\\fs[25]${statsTextPart1}`);
  WindowManager.drawText(2, `\\fs[25]${statsTextPart2}`);
  WindowManager.drawText(3, `\\fs[25]${statsTextPart3}`);

  // Process part 4: if non-empty, display in its own window
  if (statsTextPart4 !== `\\C[2]詳細能力値[4]\\C[0]\n`) {
    WindowManager.show(4, 900, 105, 380, 663);
    WindowManager.drawText(4, `\\fs[25]${statsTextPart4}`);
    // Adjust main window width if part 4 is present
    WindowManager.show(0, 0, 0, 1280, 105);
    WindowManager.drawText(0, `\\fs[25]${statsTextPart1}`);
  } else {
    // If no part 4, then possibly show title & passive effects for battler actor 20
    if (!isEnemy && $gameParty.inBattle()) {
      $gameSwitches.setValue(375, true);
      title_battleUp(user);
      passive_addCondition(user);
      $gameSwitches.setValue(375, false);
    }
    WindowManager.show(0, 0, 0, 900, 105);
    WindowManager.drawText(0, `\\fs[25]${statsTextPart1}`);
  }

  // Draw header text in window 0 based on actor type
  {
    const headerText = buildHeaderTextBattleXsarStatas(user, IsEnemy);
    WindowManager.show(0, 0, 0, 0, 105);
    WindowManager.drawText(0, `\\fs[25]${headerText}`);
  }
};

function calcXParamBattleXsarStatas(user, index) {
  return Math.floor(user.xparam(index) * 100);
}
function calcSParamBattleXsarStatas(user, index) {
  return Math.floor(user.sparam(index) * 100);
}
function calcElementRateBattleXsarStatas(user, index) {
  return Math.floor(user.elementRate(index) * 100);
}
function calcCritMultBonusBattleXsarStatas(user) {
  return user.criticalMultiplierBonus() * 100;
}
function calcStateRate(user, index) {
  return Math.floor(user.stateRate(index) * 100);
}

function calcElementAmplifyBattleXsarStatas(user, index, includeBonus) {
  let base = Math.floor(user.elementAmplifyRate(index) * 100);
  return includeBonus ? base + valueAttackAmplifysActorId[user.actorId()][index] : base;
}

function buildStatsTextPart1BattleXsarStatas(user) {  
  // Define the header
  const headerText = "詳細能力値";
  let statsTextPart1 = `\\C[2]${headerText}[1]\\C[0]\n`;
  
  // Add each stat line using the helper function
  // Note: The "n" value for 連撃率 (Chain Rate) appears to be a placeholder - should be replaced with actual calculation
  statsTextPart1 += formatStatLine(636, "連撃率　  　", "n");
  statsTextPart1 += formatStatLine(637, "回復率　　  ", calcElementRateBattleXsarStatas(user, 12));
  statsTextPart1 += formatStatLine(630, "命中率　　　", calcXParamBattleXsarStatas(user, 0));
  statsTextPart1 += formatStatLine(632, "回避率　　　", calcXParamBattleXsarStatas(user, 1));
  statsTextPart1 += formatStatLine(631, "会心率　　　", calcXParamBattleXsarStatas(user, 2));
  statsTextPart1 += formatStatLine(640, "HP再生率　　", calcXParamBattleXsarStatas(user, 7));
  statsTextPart1 += formatStatLine(641, "MP再生率　　", calcXParamBattleXsarStatas(user, 8));
  statsTextPart1 += formatStatLine(642, "TP再生率　　", calcXParamBattleXsarStatas(user, 9));
  statsTextPart1 += formatStatLine(633, "狙われ率　　", calcSParamBattleXsarStatas(user, 0));
  statsTextPart1 += formatStatLine(634, "MP消費率　　", calcSParamBattleXsarStatas(user, 4));
  statsTextPart1 += formatStatLine(635, "TPﾁｬｰｼﾞ率　 ", calcSParamBattleXsarStatas(user, 5));
  statsTextPart1 += formatStatLine(638, "物理ﾀﾞﾒｶｯﾄ率", calcSParamBattleXsarStatas(user, 6));
  statsTextPart1 += formatStatLine(639, "魔法ﾀﾞﾒｶｯﾄ率", calcSParamBattleXsarStatas(user, 7));
  statsTextPart1 += formatStatLine(656, "経験獲得率　", calcSParamBattleXsarStatas(user, 9));
  statsTextPart1 += formatStatLine(624, "ﾎﾟｰｼｮﾝ耐性率", $gameVariables.value(380 + user.actorId())[58]);
  statsTextPart1 += formatStatLine(683, "通常異常耐性", calcStateRate(user, 15));
  statsTextPart1 += formatStatLine(684, "特殊異常耐性", calcStateRate(user, 30));
  
  return statsTextPart1;
}

function buildStatsTextPart2BattleXsarStatas(user, isEnemy) {
  let statsTextPart2 = "";
  statsTextPart2 += `\\C[2]詳細能力値[2]\\C[0]\n`;
  for (let i = 1; i <= 9; i++) {
    amygame_elementIcon(i);
    const elementAmplifyValue = calcElementAmplifyBattleXsarStatas(user, i, isEnemy);
    let amplifyLabel = (i === 1 || i === 2) ? `威力率　` : `属性威力率`;
    statsTextPart2 += `\\C[16]\x1bI[${valueElementIconArr[1]}]${$dataSystem.elements[i]}${amplifyLabel}:\\C[0]${elementAmplifyValue}%\n`;
  }
  for (let i = 1; i <= 9; i++) {
    amygame_elementIcon(i);
    let resistanceLabel = (i === 1 || i === 2) ? `耐性率　` : `属性耐性率`;
    statsTextPart2 += `\\C[16]\x1bI[${valueElementIconArr[1]}]${$dataSystem.elements[i]}${resistanceLabel}:\\C[0]${calcElementRateBattleXsarStatas(user, i)}%\n`;
  }
  return statsTextPart2;
}

const formatStatLine = (iconId, labelText, value) => {
  return `\\C[16]\\I[${iconId}]${labelText}:\\C[0]${value}%\n`;
};

function buildStatsTextPart3BattleXsarStatas(user, isEnemy) {
  let statsTextPart3 = "";
  statsTextPart3 += `\\C[2]詳細能力値[3]\\C[0]\n`;
  if (isEnemy) {
    skill_addPowerSet(user, $dataSkills, 1, 1);
    if (valueAddPowerCustom >= 1) {
      statsTextPart3 += `\\C[16]\\I[666]スキル威力率:\\C[0]+${valueAddPowerCustom}\n`;
    }
  }
  statsTextPart3 += formatStatLine(31, "奥義威力率　", calcElementAmplifyBattleXsarStatas(user, 10, isEnemy));
  statsTextPart3 += formatStatLine(673, "ｱﾋﾞﾘﾃｨ威力率", calcElementAmplifyBattleXsarStatas(user, 20, isEnemy));
  statsTextPart3 += formatStatLine(78, "会心威力率　", calcCritMultBonusBattleXsarStatas(user));
  statsTextPart3 += formatStatLine(480, "剣威力率　　", calcElementAmplifyBattleXsarStatas(user, 21, isEnemy));
  statsTextPart3 += formatStatLine(481, "短剣威力率　", calcElementAmplifyBattleXsarStatas(user, 22, isEnemy));
  statsTextPart3 += formatStatLine(482, "刀威力率　　", calcElementAmplifyBattleXsarStatas(user, 23, isEnemy));
  statsTextPart3 += formatStatLine(483, "杖威力率　　", calcElementAmplifyBattleXsarStatas(user, 24, isEnemy));
  statsTextPart3 += formatStatLine(484, "拳威力率　　", calcElementAmplifyBattleXsarStatas(user, 25, isEnemy));
  statsTextPart3 += formatStatLine(485, "槍威力率　　", calcElementAmplifyBattleXsarStatas(user, 26, isEnemy));
  statsTextPart3 += formatStatLine(486, "斧威力率　　", calcElementAmplifyBattleXsarStatas(user, 27, isEnemy));
  statsTextPart3 += formatStatLine(487, "銃威力率　　", calcElementAmplifyBattleXsarStatas(user, 28, isEnemy));
  statsTextPart3 += formatStatLine(488, "弓威力率　　", calcElementAmplifyBattleXsarStatas(user, 29, isEnemy));
  statsTextPart3 += formatStatLine(489, "楽器威力率　", calcElementAmplifyBattleXsarStatas(user, 30, isEnemy));
  // 神聖邪悪耐性率表示 (if needed)
  // if (false) { ... }
  return statsTextPart3;
}

function buildStatsTextPart4BattleXsarStatas(user, isEnemy) {
  let statsTextPart4 = "";
  statsTextPart4 += `\\C[2]詳細能力値[4]\\C[0]\n`;
  const start = 1;
  const end = $dataStates.length - 1;
  const resistanceJP = "耐性率";
  for (let i = start; i <= end; i++) {
    const stateMeta = $dataStates[i].meta;
    if (stateMeta['Category']) {
      if (stateMeta['Category'] === ' StateabNomal' || stateMeta['Category'] === ' StateSPabNomal') {
        if (user.isStateResist(i)) {
          const nullifyJP = "無効化";
          statsTextPart4 += `\x1bI[${$dataStates[i].iconIndex}]${$dataStates[i].name}:\\C[2][${nullifyJP}]\\C[0]\n`;
        } else {
          if (user.stateRate(i) !== 1.0) {
            if ((stateMeta['Category'] === ' StateabNomal' && user.stateRate(i) === user.stateRate(15)) ||
                (stateMeta['Category'] === ' StateSPabNomal' && user.stateRate(i) === user.stateRate(30))) {
              // Do nothing when equal to default state rate.
            } else {
              statsTextPart4 += `\x1bI[${$dataStates[i].iconIndex}]${$dataStates[i].name}${resistanceJP}:${calcStateRate(user, i)}%\n`;
            }
          }
        }
      }
    }
  }
  if (isEnemy) {
    const elementList = attackElementIdsBattleXsarStatas;
    elementList.forEach(function (elementId) {
      if (user.elementAmplifyRate(elementId) !== 0) {
        amygame_elementIcon(elementId);
        statsTextPart4 += `\\C[16]\x1bI[${valueElementIconArr[0]}]${resistanceJP}:\\C[0]${calcElementAmplifyBattleXsarStatas(user, elementId, false)}%\n`;
      }
    });
  } else {
    for (let i = 1, endE = $dataSystem.elements.length - 1; i <= endE; i++) {
      if (elemIdsBattleXsarStatas.some(function (elem) { return elem === i; })) {
        // Skip if in the array
      } else {
        if (user.elementRate(i) !== 1) {
          amygame_elementIcon(i);
          let resistanceText;
          const icon = valueElementIconArr[0] === 1 ? `${$dataSystem.elements[i]}` : `\x1bI[${valueElementIconArr[3]}]`;
          resistanceText = `\\C[16]${icon}${resistanceJP}\\C[0]:`;
          statsTextPart4 += `${resistanceText}${calcElementRateBattleXsarStatas(user, i)}%\n`;
        }
      }
    }
  }
  return statsTextPart4;
}

function buildHeaderTextBattleXsarStatas(user, IsEnemy) {
  let headerText = "";
  if (!IsEnemy) {
    let classInfo;
    if (user.subclass()) {
      classInfo = `[${$dataClasses[user._classId].name}/${$dataClasses[user._subclassId].name}]`;
    } else {
      classInfo = `${$dataClasses[user._classId].name}`;
    }
    let additionalInfo;
    if ($gameParty.inBattle()) {
      additionalInfo = `\\C[16]BuffLimit:\\C[0]${user.maxBuffLimit(2)} \\C[16]D.cap:\\C[0]${user.maximumDamage()} \\C[16]H.cap:\\C[0]${user.maximumHealing() - user.maximumHealing() - user.maximumHealing()}`;
    } else {
      const headerJP = "役職:";
      additionalInfo = `${headerJP}${$gameVariables.value(380 + user.actorId())[59]}`;
    }
    headerText = `${classInfo}${user.nickname()}\\set[${user.actorId()}]\n${additionalInfo}`;
  } else {
    headerText = `${user.name()}`;
  }
  return headerText;
}

//エネミー撃破時にドロップボックス設定
enemywin_treasurebox1 = function (id1) {

  $gameVariables.value(160)[4] = 0;
  $gameVariables.value(160)[7] = 0;
  var value1 = getRandomIndex(101);
  var value2 = 0;
  var value3 = 0;
  if ($gameVariables.value(270) >= 1) {
    var value3 = $gameVariables.value(270);
  };
  if ($gameSwitches.value(211)) {
    value2 += 20;
  };
  value1 += Math.round(value2 + ($gameVariables.value(270) / 10));
  if (value1 >= 100 && value3 >= 40) {
    $gameVariables.value(160)[4] = 3;
    $gameVariables.value(160)[5] = 21;
    $gameVariables.value(160)[6] = 5;
    $gameVariables.value(160)[7] = 1;
  } else {
    if (value1 >= 95 && value3 >= 20) {
      $gameVariables.value(160)[4] = 2;
      $gameVariables.value(160)[5] = 18;
      $gameVariables.value(160)[6] = 3;
      $gameVariables.value(160)[7] = 1;
    } else {
      if (value1 >= 85) {
        $gameVariables.value(160)[4] = 1;
        $gameVariables.value(160)[5] = 15;
        $gameVariables.value(160)[6] = 1;
        $gameVariables.value(160)[7] = 1;
      }
    }
  };

  //テストプレイ用
  //$gameVariables.value(160)[4] = 1;
  //$gameVariables.value(160)[5] = 15;
  //$gameVariables.value(160)[6] = 1;
  //$gameVariables.value(160)[7] = 1;

};

//エネミー撃破時にドロップボックス設定
enemywin_treasurebox2 = function (id1) {

  for (var i = 1; i <= 100; i++) {
    var value0 = 0;
    var value1 = $gameMap.event(id1).x;
    var value2 = $gameMap.event(id1).y;
    var value3 = $gamePlayer.x;//プレイヤー座標
    var value4 = $gamePlayer.y;
    var value6 = [-2, -1, 0, 1, 2][getRandomIndex(5)];
    var value7 = [-2, -1, 0, 1, 2][getRandomIndex(5)];
    value1 += value6;
    value2 += value7;
    value0 = $gameMap.eventIdXy(value1, value2);
    var value5 = $gameMap.terrainTag(value1, value2);
    if (value5 == 0) { value0 = 1 }
    if (value1 == value3 && value2 == value4) { value0 = 1 };
    if (value0 >= 1) {
      $gameVariables.value(160)[1] = 0;
      $gameVariables.value(160)[2] = 0;
    } else {
      $gameVariables.value(160)[1] = value6;
      $gameVariables.value(160)[2] = value7;
    };
    if ($gameVariables.value(160)[1] != 0) {
      break;
    }
  };

  var value1 = 4;
  if ($gameVariables.value(160)[1] == 0) {
    var conditionMap = {};
    conditionMap.passable = 1;
    conditionMap.screen = 0;
    conditionMap.collided = 3;
    conditionMap.terrainTags = [1];
    conditionMap.regionIds = [1];
    $gameMap.spawnEventRandom(value1, conditionMap, true);
  } else {
    $gameMap.spawnEvent(value1, $gameMap.event(id1).x, $gameMap.event(id1).y, true);
  };
  var value2 = $gameMap.getLastSpawnEventId();
  var event = $gameMap.event(value2);
  var value1 = 'chest_c3';
  $gameScreen._particle.particlePlay(value2, value1, 'attach:this', 'def', 'above');
  $gameScreen._particle.particleExceed(value1, 0.5);
  AudioManager.playSe({ "name": "Sound1", "volume": 75, "pitch": 150, "pan": 0 });
  event.jumpEx($gameVariables.value(160)[1], $gameVariables.value(160)[2], $gameVariables.value(160)[5], $gameVariables.value(160)[6]);
  event.controlSelfVariable(1, 0, $gameVariables.value(160)[4], true);

};

//戦闘背景をコントロール
battleback_change2 = function () {

  //戦闘中パーティクル
  var value1 = 'fog_battle_front';
  $gameScreen._particle.particleSet(0, value1, 'battleWeather', 'def', 'above');
  var value2 = valueWeather[28];
  $gameScreen._particle.particleUpdate([value1, 'alpha', '0', value2 + '@0.05', value2 + '@0.9', '0']);
  var value2 = valueWeather[29];
  $gameScreen._particle.particleUpdate([value1, 'speed', String(value2), String(value2)]);

  if ($gameVariables.value(230) >= 1 && $gameVariables.value(240) == 0) {
    var spriteset = SceneManager._scene._spriteset;
    var bitmap = ImageManager.loadBitmap("img/parallaxes/", "BG_TownBattle3", 0, true);
    spriteset.addNewBattleback(3, bitmap, 0, value4);
    spriteset.battlebackOpacity(3, 255);
  };

  var value10 = 0;
  if ($gameVariables.value(240) >= 1) {
    var arr1 = [-0.1, -0.2, -0.3, -0.4, -0.5, 0.1, 0.2, 0.3, 0.4, 0.5];
    var value = $dataItems[$gameVariables.value(240)];
    if (value.meta['BG1']) { var value10 = 'BG1' };
    if ($gameSwitches.value(15) && value.meta['BG1N']) {
      if (value.meta['BG1N']) { var value10 = 'BG1N' };
    };
  } else {
    var value = $dataMap;
  };
  if (value10 != 0) {
    var arr = value.meta[value10].split(',');
    var value1 = arr1[getRandomIndex(arr1.length)];
    var value2 = getRandomIndex(56) + 200;
    var value3 = arr1[getRandomIndex(arr1.length)];
    var value4 = 120;
    var spriteset = SceneManager._scene._spriteset;
    if (Number(arr[1]) == 0) { } else {
      spriteset.setBattlebackScrollSpeedX(1, value1);
    };
    if (Number(arr[1]) >= 2) {
      spriteset.setBattlebackScrollSpeedX(1, Number(arr[1]));
    };
    if (Number(arr[2]) == 0) { } else {
      spriteset.setBattlebackScrollSpeedY(1, value3);
    };
    if (Number(arr[2]) >= 2) {
      spriteset.setBattlebackScrollSpeedX(1, Number(arr[2]));
    };
    //spriteset.battlebackOpacity(1, value2);
  };

  var value10 = 0;
  if (value.meta['BG3']) { var value10 = 'BG3' };
  if ($gameSwitches.value(15) && value.meta['BG3N']) {
    if (value.meta['BG3N']) { var value10 = 'BG3N' };
  };
  if (value10 != 0) {
    if (value.meta[value10]) {
      var arr = value.meta[value10].split(',');
      var value1 = arr1[getRandomIndex(arr1.length)];
      var value2 = getRandomIndex(101) + 100;
      var value3 = arr1[getRandomIndex(arr1.length)];
      var bitmap = ImageManager.loadBitmap("img/parallaxes/", arr[0], Number(arr[4]), true);
      spriteset.addNewBattleback(3, bitmap, 0, value4);
      if (Number(arr[1]) == 0) { } else {
        spriteset.setBattlebackScrollSpeedX(3, value1);
      };
      if (Number(arr[1]) >= 2) {
        spriteset.setBattlebackScrollSpeedX(3, Number(arr[1]));
      };
      if (Number(arr[2]) == 0) { } else {
        spriteset.setBattlebackScrollSpeedY(3, value3);
      };
      if (Number(arr[2]) >= 2) {
        spriteset.setBattlebackScrollSpeedX(3, Number(arr[2]));
      };
      spriteset.battlebackOpacity(3, Number(arr[3]));
      spriteset.battlebackFadeIn(3, value4);
    };
  };

  var value10 = 0;
  if (value.meta['BG4']) { var value10 = 'BG4' };
  if ($gameSwitches.value(15) && value.meta['BG4N']) {
    if (value.meta['BG4N']) { var value10 = 'BG4N' };
  };
  if (value10 != 0) {
    if (value.meta[value10]) {
      var arr = value.meta[value10].split(',');
      var value1 = arr1[getRandomIndex(arr1.length)];
      var value2 = getRandomIndex(101) + 100;
      var value3 = arr1[getRandomIndex(arr1.length)];
      var bitmap = ImageManager.loadBitmap("img/parallaxes/", arr[0], Number(arr[4]), true);
      spriteset.addNewBattleback(4, bitmap, 0, value4);
      if (Number(arr[1]) == 0) { } else {
        spriteset.setBattlebackScrollSpeedX(4, value1);
      };
      if (Number(arr[1]) >= 2) {
        spriteset.setBattlebackScrollSpeedX(4, Number(arr[1]));
      };
      if (Number(arr[2]) == 0) { } else {
        spriteset.setBattlebackScrollSpeedY(4, value3);
      };
      if (Number(arr[2]) >= 2) {
        spriteset.setBattlebackScrollSpeedX(4, Number(arr[2]));
      };
      spriteset.battlebackOpacity(4, Number(arr[3]));
      spriteset.battlebackFadeIn(4, value4);
    };
  };

  var value10 = 0;
  if (value.meta['BG5']) { var value10 = 'BG5' };
  if ($gameSwitches.value(15) && value.meta['BG5N']) {
    if (value.meta['BG5N']) { var value10 = 'BG5N' };
  };
  if (value10 != 0) {
    if (value.meta[value10]) {
      var arr = value.meta[value10].split(',');
      var value1 = arr1[getRandomIndex(arr1.length)];
      var value2 = getRandomIndex(101) + 100;
      var value3 = arr1[getRandomIndex(arr1.length)];
      var bitmap = ImageManager.loadBitmap("img/parallaxes/", arr[0], Number(arr[4]), true);
      spriteset.addNewBattleback(5, bitmap, 0, value4);
      if (Number(arr[1]) == 0) { } else {
        spriteset.setBattlebackScrollSpeedX(5, value1);
      };
      if (Number(arr[1]) >= 2) {
        spriteset.setBattlebackScrollSpeedX(5, Number(arr[1]));
      };
      if (Number(arr[2]) == 0) { } else {
        spriteset.setBattlebackScrollSpeedY(5, value3);
      };
      if (Number(arr[2]) >= 2) {
        spriteset.setBattlebackScrollSpeedX(5, Number(arr[2]));
      };
      spriteset.battlebackOpacity(5, Number(arr[3]));
      spriteset.battlebackFadeIn(5, value4);
    };
  };

  var value10 = 0;
  if (value.meta['BG6']) { var value10 = 'BG6' };
  if ($gameSwitches.value(15) && value.meta['BG6N']) {
    if (value.meta['BG6N']) { var value10 = 'BG6N' };
  };
  if (value10 != 0) {
    if (value.meta[value10]) {
      var arr = value.meta[value10].split(',');
      var value1 = arr1[getRandomIndex(arr1.length)];
      var value2 = getRandomIndex(101) + 100;
      var value3 = arr1[getRandomIndex(arr1.length)];
      var bitmap = ImageManager.loadBitmap("img/parallaxes/", arr[0], Number(arr[4]), true);
      spriteset.addNewBattleback(6, bitmap, 0, value4);
      if (Number(arr[1]) == 0) { } else {
        spriteset.setBattlebackScrollSpeedX(6, value1);
      };
      if (Number(arr[1]) >= 2) {
        spriteset.setBattlebackScrollSpeedX(6, Number(arr[1]));
      };
      if (Number(arr[2]) == 0) { } else {
        spriteset.setBattlebackScrollSpeedY(6, value3);
      };
      if (Number(arr[2]) >= 2) {
        spriteset.setBattlebackScrollSpeedX(6, Number(arr[2]));
      };
      spriteset.battlebackOpacity(6, Number(arr[3]));
      spriteset.battlebackFadeIn(6, value4);
    };
  };


};

//戦闘時一言集
battle_wordset = function (id1) {

  if (ConfigManager.battleAniSpeed < 3) return;

  let array0 = 0;
  let array1 = 0;
  let array2 = 0;
  let actorId = $gameVariables.value(20);
  const gameTroopMembers = $gameTroop.members();
  const gameVar276 = $gameVariables.value(276);
  if (id1 == 1) {
    if (gameVar276 == 1) {
      if ($gameSwitches.value(464)) {
        $gameVariables.setValue(20, $gameParty.battleMembers()[actorId].actorId());
      } else {
        //var enemy1 = gameTroopMembers[actorId]; // not using
        //var enemy2 = $dataEnemies[gameTroopMembers[actorId].enemyId()]; // not using
        $gameVariables.setValue(20, $gameVariables.value(11));
      };
      actorId = $gameVariables.value(20);
    };
  }

  $gameVariables.setValue(277, 0);//二言目台詞用。現在未使用
  $gameVariables.setValue(53, $gameActors.actor(actorId).nickname());
  $gameVariables.setValue(625, $gameVariables.value(380 + actorId)[59]);

  const actor = $gameActors.actor(actorId);
  const actorName = actor.name();
  const actorMeta = $dataActors[actorId].meta;
  if (gameVar276 == 2) {

    valueFaceSelect = 8;
    if (actor.tp >= 100) {
      valueFaceSelect = 48;

    };
    array2 = actorMeta['BattleAttack'].split(',');
    if (actor.isStateAffected(61)) {
      const arr2 = [21, 22, 23, 24];
      valueFaceSelect = arr2[getRandomIndex(arr2.length)];
    };
    if (actor.isStateAffected(68)) {
      const arr1 = [17, 18, 19, 20];
      valueFaceSelect = arr1[getRandomIndex(arr1.length)];
    };
    const gameVar182 = $gameVariables.value(182);
    if (gameVar182 == 5) {
      //var array1 = actorMeta['S-AbilityUse'].split(',');
      array2 = actorMeta['S-AbilityUse'].split(',');
      valueFaceSelect = 15;
    }
    else if (gameVar182 == 6) {
      //var array1 = actorMeta['A-AbilityUse'].split(',');
      array2 = actorMeta['A-AbilityUse'].split(',');
      //フェイスは通常攻撃を流用
    }
    else if (gameVar182 == 7) {
      //var array1 = actorMeta['W-AbilityUse'].split(',');
      array2 = actorMeta['W-AbilityUse'].split(',');
      valueFaceSelect = 13;
    }
    else if (gameVar182 == 8) {
      //var array1 = actorMeta['R-AbilityUse'].split(',');
      array2 = actorMeta['R-AbilityUse'].split(',');
      valueFaceSelect = 6;
    };

  }
  else if (gameVar276 == 1) {

    valueFaceSelect = 9;
    const value1 = $gameVariables.value(514);
    const value2 = actor.hpRate() * 100;
    array1 = actorMeta['BattleDamage'].split(',');
    if (value1 - value2 >= 50) {
      array1 = actorMeta['BattleBigDamage'].split(',');
      valueFaceSelect = 45;
    }
    else if (value1 - value2 <= 2) {
      array1 = actorMeta['BattleSmallDamage'].split(',');
      valueFaceSelect = 4;
    }
    else if (value1 == value2) {
      array1 = actorMeta['Battle0Damage'].split(',');
      valueFaceSelect = 6;
    }
  }
  else if (gameVar276 == 0) {
    if ($gameVariables.value(263) >= 3) { //ターン数 
      array0 = actorMeta['BattleTurn2'].split(',');
    }
    if ([34, 35, 36].some(function (id) { return actor.isStateAffected(id) })) {  //疲労時
      array0 = actorMeta['BattleFatigue'].split(',');
    }
    if (actor.isStateAffected(37)) {  //ブラック
      array0 = actorMeta['BattleFatigueBlack'].split(',');
      array2 = actorMeta['BattleFatigueBlackAttack'].split(',');
      array1 = actorMeta['BattleFatigueBlackDamage'].split(',');
    }
    if (actor.hpRate() <= 0.3) {  //瀕死  
      array0 = actorMeta['BattleDying'].split(',');
    }
    if ($gameParty.battleMembers().length >= 2 && $gameParty.aliveMembers().length <= 1) {  //最後の一人
      array0 = actorMeta['BattleLastOne'].split(',');
    }

    if (actor.isStateAffected(61) && isGirl(actor)) {  //発情
      if (actor.isLearnedSkill(65)) {
        array0 = actorMeta['BattleSexualExcitementMax'].split(',');
        array2 = actorMeta['BattleSexualExcitementMaxAttack'].split(',');//攻撃
        array1 = actorMeta['BattleSexualExcitementMaxDamage'].split(',');//ダメージ
      } else {
        array0 = actorMeta['BattleSexualExcitement'].split(',');
        array2 = actorMeta['BattleSexualExcitementAttack'].split(',');//攻撃
        array1 = actorMeta['BattleSexualExcitementDamage'].split(',');//ダメージ
      };
    }
    if (actor.isStateAffected(63) && isGirl(actor)) {
      if (actor.isLearnedSkill(65)) {//拘束
        array0 = actorMeta['BattleBindMax'].split(',');
      } else {
        array0 = actorMeta['BattleBind'].split(',');
      };
    };
    if (actor.isStateAffected(68) && isGirl(actor)) {    //激情
      array0 = actorMeta['BattlePassion'].split(',');
    };
    if (actor.isStateAffected(64) && isGirl(actor)) {    //放心
      if (actor.isLearnedSkill(65)) {
        array0 = actorMeta['BattleAbsentlyMax'].split(',');
      } else {
        array0 = actorMeta['BattleAbsently'].split(',');
      };
    };
  }

  let messageText = ``;
  const enemy1 = gameTroopMembers[$gameVariables.value(92)];
  const enemyName = enemy1.name();
  if (id1 == 0) {
    if (array0) {
      messageText = actorName + array0[getRandomIndex(array0.length)];
    }
  }
  else if (id1 == 1) {
    if (gameVar276 == 2) {
      if (array2) {
        let array = actorMeta['BattleAttack2Conbo'].split(',');
        let num = array[getRandomIndex(array.length)];
        valueWordSet9 = `${actor.name()}の\\C[2]2連撃\\C[0]！ ${num}`;
        array = actorMeta['BattleAttack3Conbo'].split(',');
        num = array[getRandomIndex(array.length)];
        valueWordSet10 = `${actor.name()}の\\C[2]3連撃\\C[0]！ ${num}`;
        messageText = actorName + array2[getRandomIndex(array2.length)];
        battle_bustUp1(actor, 86, 500, 10, 20);
      };
    }
    else if (gameVar276 == 1) {
      const skillName = `\\C[3]＜${$dataSkills[$gameVariables.value(96)].name}＞\\C[0]`;
      messageText = `${enemyName}の${skillName}！`;
      valueWordSet9 = `${enemyName}の\\C[2]2連撃\\C[0]！`;
      valueWordSet10 = `${enemyName}の\\C[2]3連撃\\C[0]！`;
    };
  }
  else if (id1 == 2) {
    const gameVar464 = $gameSwitches.value(464);
    if (gameVar276 == 2 && !gameVar464) {
      const enemy2 = $dataEnemies[enemy1.enemyId()];
      if (enemy2.meta['EnemyDamageWord']) {
        const array = enemy2.meta['EnemyDamageWord'].split(',');
        messageText = `${enemyName}${array[getRandomIndex(array.length)]}`;
      } else {
        messageText = `${enemyName}は攻撃を受けた！`;
      };
    }
    else if (gameVar276 == 1) {
      if (gameVar464) {
        if (array1) {
          messageText = actorName + array1[getRandomIndex(array1.length)];
          battle_bustUp1(actor, 86, 500, 10, 40);
        }
      }
      else /*if (!gameVar464)*/ {
        const skillName = `${$dataSkills[$gameVariables.value(96)].name}`
        messageText = `${enemyName}は${skillName}を受けた！`;//攻撃時だが使用不可
      }
    }
  }

  if (messageText) {
    BattleManager._logWindow.push(`addText`, messageText);
  }
  if ($gameVariables.value(277)) {
    BattleManager._logWindow.push(`addText`, `\\V[277]`);
  }

  //if(gameVar276 == 2){
  // gameTroopMembers[$gameVariables.value(92)].hpRate()*100;
  //} else {
  // $gameActors.actor(actorId).hpRate()*100;
  //};

}

//戦闘開始時に称号効果
title_battleUp = function (actor) {
  let titleCount = 0;
  const titleEffects = [];

  const variable288Length = $gameVariables.value(288).length;

  if (variable288Length === 0) {
    return;
  }

  let currentItem = $dataItems;

  for (let itemId = 0; itemId < variable288Length; itemId++) {
    const currentItemId = $gameVariables.value(288)[itemId];

    if (currentItemId === 0) {
      continue;
    }

    currentItem = $dataItems[currentItemId];

    if (!currentItem.meta['titleEffect1']) {
      continue;
    }

    const effectParams = currentItem.meta['titleEffect1'].split(',');
    const effectValue = Number(effectParams[2]);

    if (!$gameSwitches.value(375)) {
      // Handle conditions when the switch is not active
      switch (Number(effectParams[0])) {
        case 0:
          actor.actor().traits.push({ code: 21, dataId: Number(effectParams[1]), value: 1 + effectValue });
          break;
        case 1:
          actor.actor().traits.push({ code: 22, dataId: Number(effectParams[1]), value: effectValue });
          break;
        case 2:
          actor.actor().traits.push({ code: 23, dataId: Number(effectParams[1]), value: 1 + effectValue });
          break;
        case 3:
          valueAttackAmplifysActorId[actor.actorId()][Number(effectParams[1])] += Number(effectParams[2]);
          break;
        case 4:
          actor.actor().traits.push({ code: 11, dataId: Number(effectParams[1]), value: 1 + effectValue });
          break;
        default:
          break;
      }
    } else {
      // Handle conditions when the switch is active
      let titleEffectText = `\\C[6]【称号効果】\\C[0]\\C[2]${currentItem.name}\\C[0]:`;
      titleCount += 1;

      switch (Number(effectParams[0])) {
        case 0:
          titleEffectText += TextManager.param(Number(effectParams[1]));
          titleEffectText += `\\C[10]${Number(effectParams[2]) * 100}%\\C[0]UP!`;
          break;
        case 1:
          titleEffectText += FTKR.CSS.cssStatus.xparam[Number(effectParams[1])];
          titleEffectText += `\\C[10]${Number(effectParams[2]) * 100}%\\C[0]UP!`;
          break;
        case 2:
          titleEffectText += FTKR.CSS.cssStatus.sparam[Number(effectParams[1])];
          titleEffectText += `\\C[10]${Number(effectParams[2]) * 100}%\\C[0]UP!`;
          break;
        case 3:
          titleEffectText += `${$dataSystem.elements[Number(effectParams[1])]}威力`;
          if (Number(effectParams[2]) >= 0) {
            titleEffectText += `\\C[10]${Number(effectParams[2])}%UP!\\C[0]`;
          } else {
            titleEffectText += `\\C[1]${Number(effectParams[2])}%DOWN!\\C[0]`;
          }
          break;
        case 4:
          titleEffectText += `${$dataSystem.elements[Number(effectParams[1])]}`;

          if ([10, 11, 12, 15, 20, 38, 39, 40, 41].some(id => id === Number(effectParams[1]))) {
            const resistValue = (Number(effectParams[1]) === 11) ? 10 : 100;
            if (effectValue >= 0) {
              titleEffectText += `\\C[10]${Number(effectParams[2]) * resistValue}%\\C[0]UP!`;
            } else {
              titleEffectText += `\\C[1]${Number(effectParams[2]) * resistValue}%\\C[0]DOWN!`;
            }
          } else {
            titleEffectText += '耐性';
            const resistValue = (Number(effectParams[1]) === 11) ? 10 : 100;
            if (effectValue <= 0) {
              effectValue = -effectValue;
              titleEffectText += `\\C[1]${Number(effectParams[2]) * resistValue}%\\C[0]DOWN!`;
            } else {
              titleEffectText += `\\C[10]${Number(effectParams[2]) * resistValue}%\\C[0]UP!`;
            }
          }
          break;
        default:
          break;
      }

      titleEffects.push(titleEffectText);
      break;
    }
  }

  if (!$gameSwitches.value(375) || titleCount < 1) return;
  if ($gameParty.inBattle()) {
    for (let i = 0, len = $gameParty.battleMembers().length; i < len; i++) {
      const user = $gameParty.battleMembers()[i];
      const partyIndex = user.index() + 1;
      $gameScreen._particle.particlePlay(0, 'aura_bp', `attachParty:${partyIndex}`, 'def', 'above');
    }
  }
  for (let i = 0, len = titleEffects.length; i < len; i++) {
    valueGetInfoPointX = 900;
    CommonPopupManager.showInfo({}, titleEffects[i], null);
    BattleManager._logWindow.push(addText, titleEffects[i]);
  }

  valueGetInfoPointX = 0;
};

//パッシブ付与
//#region passive_addCondition
passive_addCondition = function (user) {
  pacondInitializeUserTraitsIfNeeded(user);
  pacondProcessPassiveSkills(user);
  pacondProcessPlusTraitPassives(user);
  pacondProcessElementPassives(user);
  pacondProcessDamageResistanceForGuardians(user);
};

function pacondInitializeUserTraitsIfNeeded(user) {
  if (!$gameSwitches.value(375)) {
    valueAttackAmplifysActorId[user.actorId()] = Array(100).fill(0);
    user.actor().traits = [];
  }
}

function pacondProcessPassiveSkills(user) {
  const passiveSkillArray = pacondCollectEligiblePassiveSkills(user);
  pacondApplyPassiveSkillEffects(user, passiveSkillArray);
}

function pacondCollectEligiblePassiveSkills(user) {
  const passiveSkillArray = [];

  valuePassiveAdd.forEach(function (skillId) {
    const skill = $dataSkills[skillId];
    const skillMeta = skill.meta;

    if (!skillMeta['PassiveCondi']) return;

    const skillCondition = skillMeta['PassiveCondi'].split(',');
    const hideSkillId = Number(skillMeta['Hide if Learned Skill']);
    const hasMaxMasteryLevel = !!skillMeta['Max Mastery Level'];

    // Handle masterable passive skills
    if (hasMaxMasteryLevel) {
      pacondProcessMaxMasteryPassiveSkill(user, skillId, skillCondition, hideSkillId, passiveSkillArray);
    }
    // Handle regular passive skills
    else {
      pacondProcessRegularPassiveSkill(user, skillId, skillCondition, hideSkillId, passiveSkillArray);
    }
  });

  return passiveSkillArray;
}

function pacondProcessMaxMasteryPassiveSkill(user, skillId, skillCondition, hideSkillId, passiveSkillArray) {
  const maxMasteryLevel = Number($dataSkills[skillId].meta['Max Mastery Level']);

  if (user.skillMasteryLevel(skillId) >= 1 &&
    user.battleSkillsRaw().includes(skillId) &&
    !user.isLearnedSkill(hideSkillId)) {
    pacondHandlePassiveCondition(user, passiveSkillArray, skillId, Number(skillCondition[0]), Number(skillCondition[1]));
  } else {
    // Remove all mastery level states if the skill isn't equipped
    for (let masteryLevel = 0; masteryLevel <= maxMasteryLevel - 1; masteryLevel++) {
      user.removeState(Number(skillCondition[2]) + masteryLevel);
    }
  }
}

function pacondProcessRegularPassiveSkill(user, skillId, skillCondition, hideSkillId, passiveSkillArray) {
  if (!user.isLearnedSkill(hideSkillId) && user.battleSkillsRaw().includes(skillId)) {
    pacondHandlePassiveCondition(user, passiveSkillArray, skillId, Number(skillCondition[0]), Number(skillCondition[1]));
  } else {
    user.removeState(Number(skillCondition[2]));
  }
}

function pacondApplyPassiveSkillEffects(user, passiveSkillArray) {
  if (passiveSkillArray.length === 0) return;

  const passiveLogMessages = [`\\C[10]${user.name()}\\C[0]発動G-Passive`];
  let passiveLogCount = 0;

  passiveSkillArray.forEach(function (skillId) {
    const skill = $dataSkills[skillId];
    const skillMeta = skill.meta;
    const isDisplayMode = $gameSwitches.value(375);
    const hasMasteryLevels = !!skillMeta['Max Mastery Level'];

    if (hasMasteryLevels) {
      pacondApplyMasteryPassive(user, skill, skillMeta, isDisplayMode, passiveLogMessages, passiveLogCount);
    } else {
      pacondApplyRegularPassive(user, skill, skillMeta, isDisplayMode, passiveLogMessages, passiveLogCount);
    }
  });

  pacondDisplayPassiveMessages(user, passiveLogMessages, passiveLogCount);
}

function pacondApplyMasteryPassive(user, skill, skillMeta, isDisplayMode, passiveLogMessages, passiveLogCount) {
  if (isDisplayMode) {
    let passiveLogMessage = `\\C[2]${skill.name}\\C[0]:`;
    passiveLogCount += 1;

    if (skillMeta['PassiveLogDisplay']) {
      const displayParams = skillMeta['PassiveLogDisplay'].split(',');
      passiveLogMessage += `${displayParams[0]}\\C[10]${Number(displayParams[1]) * user.skillMasteryLevel(skill.id)}%\\C[0]UP!`;
    } else {
      passiveLogMessage += `発動中`;
    }

    passiveLogMessages.push(passiveLogMessage);
  } else {
    const stateBaseId = Number(skillMeta['PassiveCondi'].split(',')[2]);
    const stateId = stateBaseId + user.skillMasteryLevel(skill.id) - 1;
    user.addState(stateId);
  }
}

function pacondApplyRegularPassive(user, skill, skillMeta, isDisplayMode, passiveLogMessages, passiveLogCount) {
  if (isDisplayMode) {
    let passiveLogMessage = `\\C[2]${skill.name}\\C[0]:`;
    passiveLogCount += 1;

    if (skillMeta['PassiveLogDisplay']) {
      passiveLogMessage += `\\C[10]${skillMeta['PassiveLogDisplay'].split(',')[0]}\\C[0]!`;
    } else {
      passiveLogMessage += `発動中`;
    }

    passiveLogMessages.push(passiveLogMessage);
  } else {
    const stateId = Number(skillMeta['PassiveCondi'].split(',')[2]);
    user.addState(stateId);
  }
}

function pacondProcessPlusTraitPassives(user) {
  // Process standard plus trait passives
  pacondProcessPlusTraitSkills(user, valuePassivePlussSkill, 'PassivePlusEffect');

  // Process trait modifier passives
  pacondProcessPlusTraitSkills(user, valuePassivePlussSkill2, 'PassivePlusTrait');
}

function pacondProcessPlusTraitSkills(user, skillList, metaKey) {
  const isDisplayMode = $gameSwitches.value(375);
  const passiveLogMessages = [];
  let passiveLogCount = 0;

  skillList.forEach(function (skillId) {
    const skill = $dataSkills[skillId];
    const skillMeta = skill.meta;
    const hideSkillId = Number(skillMeta['Hide if Learned Skill'] || 0);

    const isSkillEquipped = user.battleSkillsRaw().includes(skillId);
    const isSkillValid = metaKey === 'PassivePlusEffect' ||
      (user.isLearnedSkill(skillId) && !user.isLearnedSkill(hideSkillId));

    if (isSkillEquipped && isSkillValid) {
      const traitParams = skillMeta[metaKey].split(',');
      let traitValue = Number(traitParams[2]);

      if (skillMeta['Max Mastery Level']) {
        traitValue *= user.skillMasteryLevel(skillId);
      }

      pacondApplyTraitEffect(user, skill, traitParams, traitValue, isDisplayMode, passiveLogMessages, passiveLogCount, metaKey);
    }
  });

  pacondDisplayPassiveMessages(user, passiveLogMessages, passiveLogCount);
}

function pacondApplyTraitEffect(user, skill, traitParams, traitValue, isDisplayMode, passiveLogMessages, passiveLogCount, metaKey) {
  const paramType = Number(traitParams[0]);
  let actualTraitCode;

  // Map trait code based on metaKey
  if (metaKey === 'PassivePlusEffect') {
    actualTraitCode = [21, 22, 23][paramType]; // Map 0->21, 1->22, 2->23
  } else {
    actualTraitCode = paramType; // For 'PassivePlusTrait', use the raw trait code (e.g., 11)
  }

  const dataId = Number(traitParams[1]);

  if (isDisplayMode) {
    let message = pacondBuildTraitMessage(skill.name, metaKey, traitParams, traitValue);
    if (message) {
      passiveLogCount += 1;
      passiveLogMessages.push(message);
    }
  } else {
    if (actualTraitCode === 11) {
      user.actor().traits.push({ code: actualTraitCode, dataId: dataId, value: 1 + traitValue });
    } else if ([21, 22, 23].includes(actualTraitCode)) {
      pacondApplyStatTrait(user, actualTraitCode, dataId, traitValue);
    }
  }
}

function pacondApplyStatTrait(user, traitCode, dataId, traitValue) {
  switch (traitCode) {
    case 21:
    case 23:
      user.actor().traits.push({ code: traitCode, dataId: dataId, value: 1 + traitValue });
      break;
    case 22:
      user.actor().traits.push({ code: traitCode, dataId: dataId, value: traitValue });
      break;
  }
}

function pacondBuildTraitMessage(skillName, metaKey, traitParams, traitValue) {
  let message = `\\C[2]${skillName}\\C[0]:`;
  const type = Number(traitParams[0]);
  const dataId = Number(traitParams[1]);

  if (metaKey === 'PassivePlusEffect') {
    if (type === 0) {
      message += TextManager.param(dataId);
    } else if (type === 1) {
      message += FTKR.CSS.cssStatus.xparam[dataId];
    } else if (type === 2) {
      message += FTKR.CSS.cssStatus.sparam[dataId];
    }
    message += `\\C[10]${traitValue * 100}%\\C[0]UP!`;
  } else if (metaKey === 'PassivePlusTrait' && type === 11) {
    message += `${$dataSystem.elements[dataId]}`;
    const isSpecialElement = [10, 11, 12, 15, 20, 38, 39, 40, 41].includes(dataId);
    const multiplier = isSpecialElement ? (dataId == 11 ? 10 : 100) : 100;
    if (isSpecialElement) {
      if (traitValue >= 0) {
        message += `\\C[10]${traitValue * multiplier}%\\C[0]UP!`;
      } else {
        message += `\\C[1]${traitValue * multiplier}%\\C[0]DOWN!`;
      }
    } else {
      let resistanceValue = traitValue;
      let color = traitValue <= 0 ? '\\C[1]' : '\\C[10]';
      if (traitValue > 0) resistanceValue = -traitValue;
      message += `耐性${color}${resistanceValue * 100}%\\C[0]`;
    }
  } else {
    return null;
  }
  return message;
}

function pacondProcessElementPassives(user) {
  const isDisplayMode = $gameSwitches.value(375);
  const passiveLogMessages = [];
  let passiveLogCount = 0;

  // Process element power passives
  valuePassiveElementP.forEach(function (skillId) {
    const skill = $dataSkills[skillId];
    const skillMeta = skill.meta;
    const hideSkillId = Number(skillMeta['Hide if Learned Skill'] || 0);

    if (!skill.meta['PassiveElementP']) return;

    if (user.isLearnedSkill(skillId) &&
      user.battleSkillsRaw().includes(skillId) &&
      !user.isLearnedSkill(hideSkillId)) {

      const elementParams = skillMeta['PassiveElementP'].split(',');
      const elementId = Number(elementParams[0]);
      let elementValue = Number(elementParams[1]);

      if (skillMeta['Max Mastery Level']) {
        elementValue *= user.skillMasteryLevel(skillId);
      }

      if (isDisplayMode) {
        let message = `\\C[2]${skill.name}\\C[0]:${$dataSystem.elements[elementId]}威力`;
        const updown = elementValue >= 1 ? `UP` : `DOWN`;
        message += `\\C[10]${elementValue}%${updown}!\\C[0]`;

        passiveLogCount += 1;
        passiveLogMessages.push(message);
      } else {
        valueAttackAmplifysActorId[user.actorId()][elementId] += elementValue;
      }
    }
  });

  // Process power custom skills
  valueAddPowerCustomSkill.forEach(function (skillId) {
    const skill = $dataSkills[skillId];
    const skillMeta = skill.meta;
    const hideSkillId = Number(skillMeta['Hide if Learned Skill'] || 0);

    if (user.isLearnedSkill(skillId) &&
      user.battleSkillsRaw().includes(skillId) &&
      !user.isLearnedSkill(hideSkillId)) {

      let powerValue = Number(skillMeta['AddPowerCustom'] || 0);

      if (skillMeta['Max Mastery Level']) {
        powerValue += user.skillMasteryLevel(skillId);
      }

      if (isDisplayMode) {
        let message = `\\C[2]${skill.name}\\C[0]:\\I[666]`;
        const updown = powerValue >= 1 ? `+` : `-`;
        message += `\\C[10]${updown}${powerValue}!\\C[0]`;

        passiveLogCount += 1;
        passiveLogMessages.push(message);
      }
    }
  });

  pacondDisplayPassiveMessages(user, passiveLogMessages, passiveLogCount);
}

function pacondProcessDamageResistanceForGuardians(user) {
  // Add damage resistance for guardians with skill 61
  if (user.isLearnedSkill(61)) {
    let damageRate = 10;

    // Add 10% per level of guardian skills
    for (let skillId = 62; skillId <= 70; skillId++) {
      if (user.isLearnedSkill(skillId)) {
        damageRate += 10;
      }
    }

    // Apply resistance traits
    const actorTraits = user.actor().traits;
    actorTraits.push({ code: 13, dataId: 62, value: 1 + damageRate });
    actorTraits.push({ code: 13, dataId: 63, value: 1 + damageRate });
  }
}

function pacondDisplayPassiveMessages(user, messages, count) {
  if (!$gameSwitches.value(375) || count === 0) return;

  valueGetInfoPointX = 900;

  messages.forEach(function (message) {
    CommonPopupManager.showInfo({}, message, null);
  });

  valueGetInfoPointX = 0;
}

pacondHandlePassiveCondition = function (user, passiveSkillArray, skillId, conditionType, conditionValue) {
  switch (conditionType) {
    case 1:
      if (user.battleSkillsRaw().includes(skillId)) {
        passiveSkillArray.push(skillId);
      }
      break;
    case 2:
      if (user.isWtypeEquipped(conditionValue)) {
        passiveSkillArray.push(skillId);
      }
      break;
    case 3:
      if (user.isStateAffected(conditionValue)) {
        passiveSkillArray.push(skillId);
      }
      break;
  }
};
//#endregion

//戦闘中に変動するステート特徴設定<traitBase1:21,0,1.5>traitBattle_changeSetting(user,stateId,0);
//ステート耐性。id3が0で基本特殊,1で基本,2で特殊でそれぞれ指定
//#region traitBattle_changeSetting
traitBattle_changeSetting = function (user, stateId, multiplier) {
  if (multiplier == 0) return;

  const stateData = $dataStates[stateId];
  stateData.traits = [];
  let description = '';
  let traitCount = 0;

  // Process all trait bases
  for (let i = 1; i <= 9; i++) {
    if (stateData.meta['traitBase' + i]) {
      const traitParts = stateData.meta['traitBase' + i].split(',');
      const traitCode = Number(traitParts[0]);
      const traitDataId = Number(traitParts[1]);
      const traitValue = Math.round(Number(traitParts[2]) * multiplier);
      const absoluteValue = Math.abs(traitValue);

      // Process trait based on its code and add to description
      const traitDescription = tbcsProcessTraitByCode(traitCode, traitDataId, traitValue, absoluteValue);

      description += traitDescription;
      traitCount++;
      if (traitCount >= 3) {
        description += '\n';
        traitCount = 0;
      }
    }
  }

  // Finalize description with category info if available
  tbcsFinalizeDescription();

  user.refresh();
};

// Helper function to process trait based on code
function tbcsProcessTraitByCode(code, dataId, value, absoluteValue) {
  switch (code) {
    case 11: return tbcsProcessElementTrait(code, dataId, value, absoluteValue);
    case 13: return tbcsProcessStateResistanceTrait(code, dataId, value, absoluteValue);
    case 14: return tbcsProcessStateImmunityTrait(code, dataId);
    case 21: return tbcsProcessParameterTrait(code, dataId, value, absoluteValue);
    case 22: return tbcsProcessExParameterTrait(code, dataId, value, absoluteValue);
    case 23: return tbcsProcessSpParameterTrait(code, dataId, value, absoluteValue);
    default: return '';
  }
}

// Process element trait
function tbcsProcessElementTrait(code, dataId, value, absoluteValue) {
  stateData.traits.push({ code: code, dataId: dataId, value: 1 + value });

  if ([10, 11, 12, 15, 20, 38, 39, 40, 41].some(function (id) { return id == dataId })) {
    const modifier = value >= 0.01 ? `\\C[2]+` : `\\C[1]-`;
    const percentage = dataId == 11 ? absoluteValue * 10 : absoluteValue * 100;
    return `:\\C[16][${$dataSystem.elements[dataId]}${modifier}${percentage}%]\\C[0]`;
  } else {
    const modifier = value >= 0.01 ? `\\C[1]-` : `\\C[2]+`;
    return `:\\C[16][${$dataSystem.elements[dataId]}${modifier}${absoluteValue * 100}%耐性]\\C[0]`;
  }
}

// Process state resistance trait
function tbcsProcessStateResistanceTrait(code, dataId, value, absoluteValue) {
  const modifier = value >= 0.01 ? `\\C[1]-` : `\\C[2]+`;

  // Add state resistance traits for matching states
  tbcsAddStateTraits(code, dataId, value);

  // Return description based on dataId
  const percent = absoluteValue * 100;
  switch (dataId) {
    case 0:
      return `:\\C[16][基本特殊固有状態異常耐性${modifier}${percent}]\\C[0]`;
    case 1:
      return `:\\C[16][基本状態異常耐性${modifier}${percent}]\\C[0]`;
    case 2:
      return `:\\C[16][特殊状態異常耐性${modifier}${percent}]\\C[0]`;
    default:
      return '';
  }
}

// Process state immunity trait
function tbcsProcessStateImmunityTrait(code, dataId) {
  // Add state immunity traits for matching states
  tbcsAddStateTraits(code, dataId, 0, true);

  // Return description based on dataId
  switch (dataId) {
    case 0:
      return `:\\C[16][基本特殊固有状態異常無効]\\C[0]`;
    case 1:
      return `:\\C[16][基本状態異常耐性無効]\\C[0]`;
    case 2:
      return `:\\C[16][特殊状態異常耐性無効]\\C[0]`;
    default:
      return '';
  }
}

// Helper to add state traits
function tbcsAddStateTraits(code, dataId, value, isImmunity) {
  for (let j = 1; j <= $dataStates.length - 1; j++) {
    if (tbcsShouldAddStateTrait(dataId, j)) {
      stateData.traits.push({
        code: code,
        dataId: j,
        value: isImmunity ? 0 : 1 + value  // Changed from 0.1 to 0 for immunity
      });
    }
  }
}

// Helper to check if state trait should be added
function tbcsShouldAddStateTrait(dataId, stateId) {
  switch (dataId) {
    case 0:
      const meta = $dataStates[stateId].meta;
      return meta[' StateabNomal'] ||
        meta[' StateSPabNomal'] ||
        meta[' StateUnique'];
    case 1:
      return $dataStates[stateId].meta[' StateabNomal'];
    case 2:
      return $dataStates[stateId].meta[' StateSPabNomal'];
    default:
      return false;
  }
}

// Process parameter trait
function tbcsProcessParameterTrait(code, dataId, value, absoluteValue) {
  const modifier = value >= 0.01 ? `\\C[2]+` : `\\C[1]-`;
  stateData.traits.push({ code: code, dataId: dataId, value: 1 + value });
  return `:\\C[16][${TextManager.param(dataId)}${modifier}${absoluteValue * 100}%]\\C[0]`;
}

// Process ex-parameter trait
function tbcsProcessExParameterTrait(code, dataId, value, absoluteValue) {
  const modifier = value >= 0.01 ? `\\C[2]+` : `\\C[1]-`;
  stateData.traits.push({ code: code, dataId: dataId, value: value });
  return `:\\C[16][${FTKR.CSS.cssStatus.xparam[dataId]}${modifier}${absoluteValue * 100}%]\\C[0]`;
}

// Process sp-parameter trait
function tbcsProcessSpParameterTrait(code, dataId, value, absoluteValue) {
  const modifier = value >= 0.01 ? `\\C[2]+` : `\\C[1]-`;
  stateData.traits.push({ code: code, dataId: dataId, value: 1 + value });
  return `:\\C[16][${FTKR.CSS.cssStatus.sparam[dataId]}${modifier}${absoluteValue * 100}%]\\C[0]`;
}

// Helper to finalize description
function tbcsFinalizeDescription() {
  if (stateData.meta['Help Description']) {
    if (stateData.meta['DescriptionWord']) {
      description = `[${stateData.meta['DescriptionWord']}]${description}`;
    }

    if (stateData.meta['Category']) {
      tbcsAddCategoryDescription();
    }

    stateData.description = description;
  }
}

// Add category description if needed
function tbcsAddCategoryDescription() {
  const category = stateData.meta['Category'];

  switch (category) {
    case ' InvalidDispel':
      description += `[${$dataStates[201].description}]`;
      break;
    case ' PowerUp':
      description += `[${$dataStates[202].description}]`;
      break;
    case ' StateSPabNomal':
      description += `[${$dataStates[30].description}]`;
      break;
    case ' StateUnique':
      description += `[${$dataStates[40].description}]`;
      break;
  }
}
//#endregion

//エネミーに様々なセッティング
enemy_battleSetting = function (id10) {

  const gameTroopMembers = $gameTroop.members();
  const gameTroopMember = gameTroopMembers[id10];
  const enemyId = gameTroopMember._enemyId;
  const target = $gameSwitches.value(426) ? $dataEnemies[$gameTroop.members()[0]._enemyId] : $dataItems[$gameVariables.value(240)];
  const targetEnemyLV = target.meta['EnemyLV'];
  const targetEnemyLVDataArray = targetEnemyLV ? targetEnemyLV.split(',') : [1, 1];
  const targetEnemyElement = target.meta['EnemyElement'];
  const targetEnemyElementDataArray = targetEnemyElement ? targetEnemyElement.split(',') : [0, 0];
  let level = Number(targetEnemyLVDataArray[getRandomIndex(targetEnemyLVDataArray.length)]);

  if (enemyId == 30) {
    const targetMetaBossLV = target.meta['BossLV'];
    if (targetMetaBossLV) level = Number(targetMetaBossLV);
    if (level >= 30) gameTroopMember.addState(310);//属性の極み
  };
  if (level >= 1) {
    if (enemyId == 30) {
      if (valueBossAddLevel >= 1) level += valueBossAddLevel;
      level += $gameSwitches.value(426) ? $gameVariables.value(304)[valueBossEnemyId] * 10 : $gameVariables.value(305)[$gameVariables.value(240)] * 5;
      if ($gameSwitches.value(426)) {
        level += $gameVariables.value(304)[valueBossEnemyId] * 10;
      } else {
        level += $gameVariables.value(305)[$gameVariables.value(240)] * 5;
      };
    } else {
      if ($gameVariables.value(232) >= 2) {
        const extraLevel = Math.floor(Math.random() * $gameVariables.value(232));
        level += extraLevel;
        if (level >= 11) {
          const randomLevel = getRandomIndex(101);
          if (level >= randomLevel) {
            level += 1;
          };
        };
      };
    };
    if (valueEnemyAddLevel >= 1) level += valueEnemyAddLevel;
    const gameVar240 = $gameVariables.value(240);
    if (gameVar240 >= 1) level += $gameVariables.value(257)[gameVar240];
    level = Math.round(level);
    gameTroopMember.changeLevel(level);
  };
  if (targetEnemyLV) {
    if (Number(targetEnemyLV) == 0) {
      level = $gameActors.actor($gameVariables.value(2)).level;
      gameTroopMember.changeLevel(level);
    };
  }
  const gameVar350 = $gameVariables.value(350);
  if (gameVar350 != 0) {
    for (let i = 0; i <= gameVar350.length - 1; i++) {
      if (gameVar350[i] == 885) {
        let extraLevelMult = 11;
        if (level >= 30 && level <= 60) { extraLevelMult = 21 }
        else if (level >= 61) { extraLevelMult = 31 }
        const extraLevel = getRandomIndex(extraLevelMult) + 885;
        gameTroopMember.addState(extraLevel);
      } else {
        gameTroopMember.addState($gameVariables.value(350)[i]);
      };
    };
  };
  let extraLevel = Number(targetEnemyElementDataArray[getRandomIndex(targetEnemyElementDataArray.length)]);
  if (enemyId == 30) {
    if (target.meta['BossElement']) {
      extraLevel = Number(target.meta['BossElement'])
    };
  };
  const enemy = $dataEnemies[enemyId];
  if (extraLevel != 0) {
    const enemyDefaultState = enemy.meta['defaultState'];
    if (enemyDefaultState) {
      if (Number(enemyDefaultState) != extraLevel) {
        gameTroopMember.removeState(Number(enemyDefaultState));
      };
    }
    gameTroopMember.addState(extraLevel);
  };
  if (enemyId <= 29) {
    const arr2 = $gameVariables.value(345)[enemyId - 20];
    for (let j = 0; j <= arr2.length - 1; j++) {
      gameTroopMember.addState(arr2[j]);
    };
  };
  if (enemyId == 30 && $gameVariables.value(343) != 0) {//ボスステート処理
    let arr2 = $gameVariables.value(343);
    for (let j = 0; j <= arr2.length - 1; j++) {
      gameTroopMember.addState(arr2[j]);
    };
    if (target.meta['BossDrop1']) {
      for (var j = 1; j <= 9; j++) {
        if (target.meta['BossDrop' + j]) {
          arr2 = target.meta['BossDrop' + j].split(',');
          valueItems = getItemEquipmentSource(Number(arr2[0]));

          if (Number(arr2[2]) >= getRandomIndex(101)) {
            $gameTroop.addDropItem(valueItems[Number(arr2[1])]);
          };
        }
      }
    };
  };
  if (enemy.meta['Man'] || enemy.meta['Woman']) {
    if (enemy.meta['Man']) { gameTroopMember.addState(459) };
    if (enemy.meta['Woman']) { gameTroopMember.addState(460) };
  } else {
    if (!enemy.meta['Nonsexual']) {
      if (!isHEnemyOrNonAuto() && getRandomIndex(11) == 7) {
        gameTroopMember.addState(460);//雌
      } else {
        gameTroopMember.addState(459);//雄
      };
    };
  };
  if (gameTroopMember.level >= 60 && !gameTroopMember.isStateAffected(436)) {//人種以外
    gameTroopMember.addState(406);//魔性心威
  };
  if (enemyId != 30) {
    if (gameTroopMember.level >= 40 && $gameTroop.aliveMembers().length == 1) {
      gameTroopMember.addState(475);//孤高
    };
  };
  /*//パッシブオーラで実行
  if(enemy.isStateAffected(443)){//指揮官
   for (var j = 0; j <= $gameTroop.members().length-1; j++) {
     var enemy2 = $gameTroop.members()[j];
     if(!enemy2.isStateAffected(443) && enemy2.isStateAffected(441)){
       enemy2.addState(444);//揮下戦士
     };
     if(!enemy2.isStateAffected(443) && enemy2.isStateAffected(442)){
       enemy2.addState(445);//揮下魔導士
  }}};
  if(enemy.isStateAffected(446)){//将器
   for (var j = 0; j <= $gameTroop.members().length-1; j++) {
     var enemy2 = $gameTroop.members()[j];
     var value1 = enemy._enemyId;
     var value2 = enemy2._enemyId;
     if(!enemy2.isStateAffected(446) && Number(dataEnemies[value1].meta['Passive State']) == Number(dataEnemies[value2].meta['Passive State'])){
       enemy2.addState(447);//将軍号令
  }}};
  if(enemy.isStateAffected(448)){//王権
   for (var j = 0; j <= $gameTroop.members().length-1; j++) {
     var enemy2 = $gameTroop.members()[j];
     var value1 = enemy._enemyId;
     var value2 = enemy2._enemyId;
     if(!enemy2.isStateAffected(448)){
       if(Number(dataEnemies[value1].meta['Passive State']) == Number(dataEnemies[value2].meta['Passive State'])){
         enemy2.addState(449);//王卒兵
       } else {
         enemy2.addState(450);//魔軍兵
  }}}};
  */
  if (gameTroopMember.isStateAffected(455)) {//捕食者
    gameTroopMember.appear();//非捕食者は常に出現させる。

    for (let j = 0; j < $gameTroop.members().length; j++) {
      const enemyJ = gameTroopMembers[j];
      if (!enemyJ.isStateAffected(455)) {
        if (gameTroopMember.level + 10 >= enemyJ.level) {
          enemyJ.addState(456);//被捕食者
        };
      };
    };
    const gamePartyBattleMembers = $gameParty.battleMembers();
    for (let j = 0; j < gamePartyBattleMembers.length; j++) {
      const actor = gamePartyBattleMembers[j];
      if (!actor.isStateAffected(455)) {
        if (gameTroopMember.level + 10 >= actor.level) {
          actor.addState(456);//被捕食者
        }
      }
    };
  };
  const gameVar628 = $gameVariables.value(628);
  if (enemyId == 30 && gameVar628 != 0) {//ボス確定ドロップ
    for (let j = 0; j < gameVar628.length; j++) {
      if (gameVar628[j] >= 1) {
        const itemId = gameVar628[j];
        $gameTroop.addDropItem($dataItems[itemId]);
      }
    }
  };
  for (let j = 0; j < valueStateGetItems.length; j++) {
    if (gameTroopMember.isStateAffected(valueStateGetItems[j])) {
      const itemId = Number($dataStates[valueStateGetItems[j]].meta['SubjugationPointItem']);
      $gameTroop.addDropItem($dataItems[itemId]);
    }
  };
  //var value11 = 1;
  let arr4 = valueStateEnemyExpRate;
  for (let j = 0; j < arr4.length; j++) {
    if (gameTroopMember.isStateAffected(arr4[j]) && gameTroopMember.isAlive()) {
      if ($dataStates[arr4[j]].meta['EnemyExpRate']) {
        valueTotalexp += Number($dataStates[arr4[j]].meta['EnemyExpRate']);
      };
    };
  };
  //var value11 = 1;
  arr4 = valueStateEnemyGoldRate;
  for (let j = 0; j < arr4.length; j++) {
    if (gameTroopMember.isStateAffected(arr4[j]) && gameTroopMember.isAlive()) {
      if ($dataStates[arr4[j]].meta['EnemyGoldRate']) {
        valueTotalgold += Number($dataStates[arr4[j]].meta['EnemyGoldRate']);
      };
    };
  };
  const dropUpItem = $dataItems[valueItemDropUpItem];
  const dropCount = getRandomIndex(4);
  if (dropCount >= 1) {
    let gameTroopMemberLevel = gameTroopMember.level;
    for (let j = 1; j <= dropCount; j++) {
      const drop_probability = drop_probabilityCalculation(gameTroopMemberLevel, dropUpItem);
      if (drop_probability >= 90) {
        const arr6 = [];
        drop_genericDropRate(0, arr6);
        $gameTroop.addDropItem($dataItems[valueDropItems]);
      };
    };
  };
  const drop_probability = drop_probabilityCalculation(gameTroopMember.level, dropUpItem);
  if (drop_probability >= 90) {
    let stateId = 0;
    for (const id11 of valueClassStateA) {
      if (gameTroopMember.isStateAffected(id11)) { stateId = id11 };
    }
    if (stateId >= 1) {
      valueClassState = $dataStates[stateId].meta['classStateDrop'].split(',');
      valueEnemyLevel = gameTroopMember.level;
      drop_JobStateWAget(1, 10);
      drop_JobStateWAget(2, 10);
    };
  };
  if (gameTroopMember.level >= valueMaxEnemyLv) {
    valueMaxEnemyLv = gameTroopMember.level;
  }

};

//エネミー簡易討伐
enemy_instantwin = function () {

  const actor20 = $gameActors.actor(20);
  const item240 = $dataItems[$gameVariables.value(240)];
  let expCount = 0;
  let goldCount = 0;
  const rate = 0.5;//rate
  const flat = 20;//flat
  const rate1 = 0.6;
  const flat1 = 10;
  valueWordSet1 = ``;
  valueWordSet3 = ``;
  const arrItemEnemyLV = item240.meta['EnemyLV'].split(',');
  actor1_setup1(item240, arrItemEnemyLV[getRandomIndex(arrItemEnemyLV.length)]);
  //特殊ステート対応討伐カウント // tweak: commented because no data change
  /* if($gameVariables.value(350) != 0){
   for (var i = 0; i <= $gameVariables.value(350).length-1; i++) {
     for (var j = 1; j <= valueSubjugationPoint.length-1; j++) {//討伐数カウント
       if($gameVariables.value(350)[i] == valueSubjugationPoint[j]){
         //$gameVariables.value(52)[valueSubjugationPoint[j]] += 1;
         //var value1 = `\x1bSIM[${valueSubjugationPoint[j]}]：討伐数\\C[10]+1\\C[0]`;
         //CommonPopupManager.showInfo({},value1,null);
       };
     };
   };
  }; */
  //パッシブステート対応ドロップPopEnemy1  // tweak: commented because no data change
  /* for (var i = 1; i <= 9; i++) {
   if(value.meta['PopEnemy' + i]){
     var arr5 = value.meta['PopEnemy' + i].split(',');
     var arr6 = $dataEnemies[Number(arr5[0])].meta['Passive State'].split(',');
     for (var j = 0; j <= arr6.length-1; j++) {
       if($dataStates[Number(arr6[j])].meta['SubjugationPoint']){
         //$gameVariables.value(52)[Number(arr6[j])] += 1;
         //var value1 = `\x1bSIM[${Number(arr6[j])}]：討伐数\\C[10]+1\\C[0]`;
         //CommonPopupManager.showInfo({},value1,null);
       };
     };
   };
  }; */
  const gameVar220 = $gameVariables.value(220);
  const dropUpItem = $dataItems[valueItemDropUpItem];
  const arrItemBattleEnemyPopC = item240.meta['BattleEnemyPopC'].split(',');
  arr4 = [];
  const end = Number(arrItemBattleEnemyPopC[getRandomIndex(arrItemBattleEnemyPopC.length)]);
  for (var i = 1; i <= end; i++) {
    let intValue1 = Number(arrItemEnemyLV[getRandomIndex(arrItemEnemyLV.length)]);
    if (intValue1 == 0) { intValue1 = 1 };
    const intValue1minus1 = intValue1 - 1;
    const enemy = $dataEnemies[Number(gameVar220[getRandomIndex(gameVar220.length)])];
    expCount += Math.round(enemy.exp * (1 + intValue1minus1 * rate) + (flat * intValue1minus1));
    goldCount += Math.round(enemy.gold * (1 + intValue1minus1 * rate1) + (flat1 * intValue1minus1));

    enemy_dropSelection(actor20);
    const drop_probability = drop_probabilityCalculation(intValue1, dropUpItem);
    if (drop_probability >= 90) {
      drop_enemyDropRate(0, arr4);//計算のみ。計算結果はarr4に蓄積。
      drop_genericDropRate(0, arr4);//valueDropItemsに格納
      const itemToDrop = $dataItems[valueDropItems];
      const itemName = `\\C[24]\x1bI[${itemToDrop.iconIndex}]${itemToDrop.name}\\C[0]`;
      const message = `${itemName}を獲得した。\n`;
      valueWordSet1 += `${message}`;
      $gameSystem.pushInfoLog(message);
      //CommonPopupManager.showInfo({},`\\C[24]\x1bI[${$dataItems[valueDropItems].iconIndex}]${$dataItems[valueDropItems].name}\\C[0]を獲得した。`,null);
      $gameParty.gainItem(itemToDrop, 1);
    };

  }

  const result = `\\C[2]BattleResult!\\C[0]`;
  const exp = `\\C[10]${expCount}\\C[0]`;
  const gold = `\\C[14]${goldCount}\\C[0]`;
  const battleResultMessage = `${result}\n経験値${exp}、${gold}\\Gを入手！ JPを1獲得した。`;
  $gameSystem.pushInfoLog(battleResultMessage);
  valueWordSet2 = `${battleResultMessage}\n`;
  //CommonPopupManager.showInfo({},battleResultMessage,null);
  for (const actor of $gameParty.battleMembers()) {
    actor.changeExp(actor.currentExp() + expCount, false);

    if (actor.subclass()) actor.gainExpSubclass(expCount);
  }
  $gameParty.gainGold(goldCount);
  let dropCount = 0;
  let defeatsCount = 0;
  for (let i = 0; i < valueWordSet1.length; i++) {
    if (valueWordSet1.charAt(i) == `\n`) {
      dropCount += 1;
    }
  }
  for (let i = 0; i < valueWordSet3.length; i++) {
    if (valueWordSet3.charAt(i) == `\n`) {
      defeatsCount += 1;
    }
  }
  if (dropCount + defeatsCount <= 6) {
    $gameVariables.setValue(701, `${valueWordSet2}${valueWordSet1}${valueWordSet3}`);
  } else {
    $gameVariables.setValue(701, `${valueWordSet2}`);
    if (dropCount >= 1) {
      $gameVariables.setValue(701, $gameVariables.value(701) + `ドロップ(\\C[2]+${dropCount}\\C[0])\n`);
    }
    if (defeatsCount >= 1) {
      $gameVariables.setValue(701, $gameVariables.value(701) + `討伐カウント(\\C[2]+${defeatsCount}\\C[0])`);
    }
  }

};

//ドロップするかどうかの確率計算
drop_probabilityCalculation = function (actorLevel, dropUpItem) {

  let drop_probability = getRandomIndex(101);
  drop_probability += Math.round(actorLevel / 10);
  if ($gameVariables.value(54) == 1) { drop_probability += 5 };//パーティが一人の場合確率アップ

  const gameVar516 = $gameVariables.value(516);
  if (gameVar516 >= 1000) { drop_probability += 4 }
  else if (gameVar516 >= 500) { drop_probability += 3 }
  else if (gameVar516 >= 300) { drop_probability += 2 }
  else if (gameVar516 >= 100) { drop_probability += 1 };

  if ($gameParty.hasItem(dropUpItem)) { drop_probability += 1 };
  if ($gameParty.membersState(296)) { drop_probability += 1 };
  if ($gameParty.membersState(297)) { drop_probability += 1 };
  if ($gameParty.membersState(298)) { drop_probability += 1 };

  return drop_probability;
};

//ドロップするかどうかの確率計算2
drop_probabilityCalculation2 = function (user, dropCategory, dropUpItem) {

  let dropCount = 0;

  let canDrop;
  if (dropCategory >= 5) {
    let calculatedLevelLimit = dropCategory * 20;
    if (calculatedLevelLimit == 0) { calculatedLevelLimit = 999 } //0はレベル制限しない汎用ドロップ
    else if (calculatedLevelLimit >= 51) { calculatedLevelLimit = 999 };//レアリティが6以上なら制限なし

    if (dropCategory < 7) { calculatedLevelLimit = 20 }
    else if (dropCategory == 7) { calculatedLevelLimit = 30 }
    else if (dropCategory == 8) { calculatedLevelLimit = 40 }
    if (dropCategory > 8) { calculatedLevelLimit = 50 };
    canDrop = calculatedLevelLimit < valueDropEnemyLevel;
  } else {
    canDrop = true;
  };

  //var value14 = true;//dropCategory > valueDropEnemyLevel;//高レベルでドロップ制限はなし
  if (canDrop /*&& value14*/) {
    let dropModifier = 5;
    //if(dropCategory == 0){...};
    if (dropCategory == 1) { dropModifier = 10 }
    else if (dropCategory == 2) { dropModifier = 9 }
    else if (dropCategory == 3) { dropModifier = 8 }
    else if (dropCategory == 4) { dropModifier = 7 }
    else if (dropCategory == 5) { dropModifier = 6 }
    else if (dropCategory == 6) { dropModifier = 5 }
    else if (dropCategory == 7) { dropModifier = 4 }
    else if (dropCategory == 8) { dropModifier = 3 }
    else if (dropCategory == 9) { dropModifier = 2 }
    else if (dropCategory == 10) { dropModifier = 1 };

    let modifierIncrement = dropModifier / 3;
    dropModifier += modifierIncrement + (valueDropEnemyLevel / 10);
    if ($gameTroop.turnCount() <= 1) { dropModifier += modifierIncrement * 3 };
    if ($gameVariables.value(54) == 1) { dropModifier += modifierIncrement * 5 };//パーティが一人の場合確率アップ

    const dropVariable = $gameVariables.value(516);
    if (dropVariable >= 100) { dropModifier += modifierIncrement };
    if (dropVariable >= 300) { dropModifier += modifierIncrement };
    if (dropVariable >= 500) { dropModifier += modifierIncrement };
    if (dropVariable >= 1000) { dropModifier += modifierIncrement };
    if (dropVariable >= 1500) { dropModifier += modifierIncrement };
    if (dropVariable >= 2000) { dropModifier += modifierIncrement };

    if ($gameParty.hasItem(dropUpItem)) { dropModifier += modifierIncrement * 3 };
    if ($gameParty.membersState(296)) { dropModifier += modifierIncrement * 2 };
    if ($gameParty.membersState(297)) { dropModifier += modifierIncrement * 2 };
    if ($gameParty.membersState(298)) { dropModifier += modifierIncrement * 2 };
    if (user.isStateAffected(186)) {
      if (user._stateCounter[186] >= 1) {
        dropModifier += modifierIncrement * user._stateCounter[186];
      };
    };

    const randomChance = getRandomIndex(100) + 1;
    if (dropModifier >= randomChance) { dropCount += 1 };

    return dropCount;
  };

};

//採取物の設定
harvesting_itemSelect = function () {

  var arr4 = [];
  //var value1 = 0; 
  drop_genericDropRate(1, arr4);
  $gameVariables.setValue(23, valueDropItems);
  if (valueDropItems == 0) {
    $gameVariables.setValue(23, 1191);//1191は石ころ
  };

};

//汎用財布ドロップ設定
drop_walletItemBoxGet = function (value12, id12) {
  const value3 = valueFootpadSkillId;
  const actor = $gameActors.actor($gameVariables.value(11));
  if (!actor.isLearnedSkill(value3) || actor.skillMasteryLevel(value3) < 1) {
    return;
  }

  let drop_probability = 100;
  const dropUpItem = $dataItems[valueItemDropUpItem];
  drop_probability = drop_probabilityCalculation(drop_probability, dropUpItem);

  drop_probability += actor.skillMasteryLevel(value3) * 3;

  if (drop_probability < 90) {
    return;
  }

  const arr12 = [];
  const gameVariable240 = $gameVariables.value(240);
  const value = $dataItems[gameVariable240];
  const arr11 = value.meta.GenericDropRate.split(',');
  let value11 = (gameVariable240 >= 1)
    ? Number(arr11[getRandomIndex(arr11.length)]) || 1
    : value12;

  const listType = (id12 === 1) ? 'walletIn' : 'ItemBag';
  const dataItemsLength = $dataItems.length;

  for (let i = 1; i < dataItemsLength; i++) {
    const item = $dataItems[i];
    if (!item.meta[listType]) {
      continue;
    }

    const list = item.meta.DropRate.split(',');

    if (list.some(id11 => Number(id11) === value11)) {
      arr12.push(i);
    }
  }

  const arr12Length = arr12.length;
  if (arr12Length === 0) {
    return;
  }

  const numItemsToGain = getRandomIndex(3) + 1;

  for (let i = 1; i <= numItemsToGain; i++) {
    const randomIndex = getRandomIndex(arr12Length);
    const value1 = arr12[randomIndex];
    const item = $dataItems[value1];
    const itemInfo = `\\C[24]\x1bI[${item.iconIndex}]${item.name}\\C[0]を獲得した。`;

    CommonPopupManager.showInfo({}, itemInfo, null);
    $gameParty.gainItem(item, 1);
  }
};

//汎用ドロップ設定
drop_genericDropRate = function (battleDrop, itemsToDrop) {
  const gameVariable240 = $gameVariables.value(240);
  let value11 = 1;

  if (gameVariable240 >= 1) {
    const value = $dataItems[gameVariable240];
    if (value.meta.GenericDropRate) {
      const arr11 = value.meta.GenericDropRate.split(',');
      value11 = Number(arr11[getRandomIndex(arr11.length)]);
    }
  }

  const valueItemDropRate1Length = valueItemDropRate1.length;
  const items = $dataItems;
  const gameSwitch2State = $gameSwitches.value(2);
  const isBattleIsTrue = battleDrop !== 0;
  for (let i = 0; i < valueItemDropRate1Length; i++) {
    const dropItemI = valueItemDropRate1[i];
    let value15 = 1;

    if (isBattleIsTrue && !gameSwitch2State) continue;

    const item = items[dropItemI];
    const itemDropRate = item.meta['DropRate'];
    const isBattleDrop = isBattleIsTrue || !item.meta['NoBattleDrop'];
    if (!isBattleDrop || !itemDropRate) continue;

    const list = itemDropRate.split(',');

    for (let id11 of list) {
      if (id11 != value11) continue;

      const itemDropLottery = item.meta['DropLottery'];
      if (itemDropLottery) {
        value15 = Number(itemDropLottery);
      }

      for (let j = 1; j <= value15; j++) {
        itemsToDrop.push(dropItemI);
      }
    }
  }

  valueDropItems = Number(itemsToDrop[getRandomIndex(itemsToDrop.length)]);
};

//汎用ドロップエネミー対象設定ダンジョンのみ。計算のみ計算結果はarr4に蓄積。簡易討伐時
function drop_enemyDropRate(value12, arr4) {

  const item = $dataItems[$gameVariables.value(240)];
  const itemEnemyLVdata = item.meta['EnemyLV'].split(',');
  const arrdrop3 = $gameVariables.value(220);
  const itemEnemyLVdataSelectedIndex = Number(itemEnemyLVdata[getRandomIndex(itemEnemyLVdata.length)]);
  const enemyIndex = Number(arrdrop3[getRandomIndex(arrdrop3.length)]);

  const itemsLength = $dataItems.length;
  for (let i = 1; i < itemsLength; i++) {
    const conditionalItemDrop = $dataEnemies[enemyIndex].meta['Conditional Item ' + i + ' Drop'];
    if (conditionalItemDrop) {
      const lotteryRarity = $dataItems[i].meta['LotteryRearity'];
      if (lotteryRarity) {
        let rarityNum;

        switch (Number(lotteryRarity)) {
          case 1:
          case 2:
            rarityNum = 1;
            break;
          case 3:
            rarityNum = 10;
            break;
          case 4:
            rarityNum = 20;
            break;
          case 5:
          case 6:
            rarityNum = 30;
            break;
          case 7:
          case 8:
            rarityNum = 40;
            break;
          case 9:
          case 10:
            rarityNum = 50;
            break;
        }

        if (itemEnemyLVdataSelectedIndex >= rarityNum) {
          arr4.push(i);
        }
      }
    }
  }
}

//ジョブステートエネミーorジョブ持ち追いはぎスクリプト
//drop_JobStateWAget(1,10);//1武器2防具ダンジョン外の場合の想定レベル
drop_JobStateWAget = function (valueItemsType, value10) {
  const DEFAULT_ENEMY_LEVEL = 30;
  const LEVEL_DIVISOR = 10;
  const MIN_REARITY = 1;
  const MAX_REARITY = 10;

  let arr4 = [0];
  let valueClassState = 0;
  let valueEnemyLevel;

  if (!$gameParty.inBattle()) {
    if ($gameMap.event(valueEnemyEventId).event().meta['classStateDrop']) {
      valueClassState = $gameMap.event(valueEnemyEventId).event().meta['classStateDrop'].split(',');

      const gameVar240Value = $gameVariables.value(240);
      if (gameVar240Value === 0) {
        valueEnemyLevel = DEFAULT_ENEMY_LEVEL;
      } else {
        const arr1 = $dataItems[gameVar240Value].meta['EnemyLV'].split(',');
        valueEnemyLevel = Number(arr1[getRandomIndex(arr1.length)]);
      }
    }
  }

  if (!valueClassState) return;

  let lotteryRearity = Math.round(valueEnemyLevel / LEVEL_DIVISOR);
  lotteryRearity = Math.max(MIN_REARITY, Math.min(lotteryRearity, MAX_REARITY));
  let start = 1;
  const isArmors = valueItemsType === 2;
  let valueItems, end, vTypeId;

  if (isArmors) {
    valueItems = $dataArmors;
    end = valueArmorsLength;
    vTypeId = Number(valueClassState[2]);
  } else {
    valueItems = $dataWeapons;
    end = $dataWeapons.length - 1;
    vTypeId = Number(valueClassState[1]);
  }

  for (let i = start; i <= end; i++) {
    const item = valueItems[i];
    const itemLotteryRearity = item.meta['LotteryRearity'];
    if (itemLotteryRearity && !item.meta['GatchaOutOfRange']) {
      const valueTypeId = isArmors ? item.atypeId : item.wtypeId;
      if (vTypeId === valueTypeId && lotteryRearity >= Number(itemLotteryRearity)) {
        arr4.push(i);
      }
    }
  }

  const dropItemId = arr4[getRandomIndex(arr4.length)];
  if (dropItemId !== 0) {
    if ($gameParty.inBattle()) {
      $gameTroop.addDropItem(valueItems[dropItemId]);
    } else {
      const item = valueItems[dropItemId];
      const itemName = `\\C[24]\x1bI[${item.iconIndex}]${item.name}\\C[0]`;
      CommonPopupManager.showInfo({}, `${itemName}を獲得した。`, null);
      $gameParty.gainItem(item, 1);
    }
  }
}

//追いはぎ時の確率と武器防具入手
footpad_probabilityUp = function (id1) {

  const actor = $gameActors.actor($gameVariables.value(11));
  let enemyDropChance = 10;
  if ($gameVariables.value(240) >= 1) {
    const item = $dataItems[$gameVariables.value(240)];
    const itemEnemyLVData = item.meta['EnemyLV'].split(',');
    enemyDropChance = Number(itemEnemyLVData[getRandomIndex(itemEnemyLVData.length)]);
  };
  const dropUpItem = $dataItems[valueItemDropUpItem];
  let drop_probability = drop_probabilityCalculation(enemyDropChance, dropUpItem);
  const skillId = valueFootpadSkillId;//追剥スキルID
  if (actor.isLearnedSkill(skillId) && actor.skillMasteryLevel(skillId) >= 1) {
    drop_probability += actor.skillMasteryLevel(skillId) * 3;
  };
  if (drop_probability >= 90) {
    drop_JobStateWAget(id1, enemyDropChance);
  };
};

//アイテムボックス開封
item_itemBoxOpen = function (a, b, itemId) {

  if (b.actorId() == a.actorId()) {
    if ($gameSwitches.value(115)) {
      $gameSwitches.setValue(115, false)
      WindowManager.hide(0);
    } else {
      $gameSwitches.setValue(115, true);
      $gameParty.loseItem($dataItems[itemId], 1);

      valueItemBoxOpen = `${$dataItems[itemId].name}の内訳（もう一度使用でウィンドウ閉じる）\n`;
      let value17 = 0;
      //var value18 = 0;
      let value20 = !$dataItems[itemId].meta['SeiyokuItem'];
      const itemTypeId = [0, 0, 0, 1, 0, 0, 2, 0];


      const arr2 = $dataItems[itemId].meta['ItemBag'].split(',');
      const id2 = arr2[getRandomIndex(arr2.length)];
      for (let id3 = 0; id3 <= id2; id3++) {
        const id12 = itemTypeId[getRandomIndex(itemTypeId.length)];
        valueItems = getItemEquipmentSource(id12);

        if ($dataItems[itemId].meta['HentaiBox']) {
          valueItems = $dataItems;
          value20 = $dataItems[itemId].meta['SeiyokuItem'];
        };
        const end = valueItems == $dataArmors ? valueArmorsLength : valueItems.length - 1;
        const arr12 = [0];
        for (let i = 1; i <= end; i++) {
          let value19 = 0;
          valueItem = valueItems[i];
          if (valueItem.meta['GatchaOutOfRange']) {
            value19 += 1;
          };
          const valueItemMaxItem = valueItem.meta['Max Item'];
          if (valueItemMaxItem) {
            if (Number(valueItemMaxItem) == 1 && $gameParty.hasItem(valueItem)) {
              value19 += 1;
            }
          };
          if (value19 == 0) {
            if ($dataItems[itemId].meta['HentaiBox']) {
              value20 = $dataItems[i].meta['SeiyokuItem'];
            };
            const valueItemLotteryRearity = valueItem.meta['LotteryRearity'];
            if (valueItemLotteryRearity && value20) {
              const valueItemLotteryRearityNum = Number(valueItemLotteryRearity);
              const list = $dataItems[itemId].meta['ItemBagRearity'].split(',');
              for (const id11 of list) {
                if (id11 == valueItemLotteryRearityNum) {
                  for (let j = 10; j >= valueItemLotteryRearityNum; j--) {
                    arr12.push(i);
                  };
                };
              }
            };
          };
        };
        valueDropItems = Number(arr12[getRandomIndex(arr12.length)]);
        if (valueDropItems >= 1) {
          let value16 = 1;
          const valueItem = valueItems[valueDropItems];
          if (id12 == 0) {
            if (valueItem.price == 0) { value16 = 1 }
            else if (valueItem.price <= 1000) { value16 = getRandomIndex(6) + 1 }
            else if (valueItem.price <= 10000) { value16 = getRandomIndex(3) + 1 }
          };
          $gameParty.gainItem(valueItem, value16);
          valueItemBoxOpen += `[\x1bI[${valueItem.iconIndex}]${valueItem.name}×${value16}]`;
          value17 += 1;
          if ((value17 % 3) == 0) { valueItemBoxOpen += `\n` };
        };
      };
      WindowManager.show(0, 0, 0, 1280, 290);
      if (value17 == 0) {
        WindowManager.drawText(0, `${valueItemBoxOpen}中身は空だった…。`);
      } else {
        WindowManager.drawText(0, `${valueItemBoxOpen}`);
      };
    };
  };

};

//アクターステートに応じて経験値Ｇレート設定
actor_stateExpGoldRate = function () {

  const valueStatePartyRates = [valueStatePartyExpRate, valueStatePartyGoldRate];
  const metaNames = ['PartyExpRate', 'PartyGoldRate'];
  for (let i = 0; i < 2; i++) {
    const isExp = i == 0;
    const valueStatePartyRate = valueStatePartyRates[i];
    const metaName = metaNames[i];
    for (var id = 0; id < valueStatePartyRate.length; id++) {
      const rate = valueStatePartyRate[id];
      if (!$gameParty.membersState(rate)) continue;
      const stateRate = $dataStates[rate].meta[metaName];
      if (stateRate) {
        // here is using isExp boolean because int value like valueTotalgold is not reference type and if set them to array it will be new int objects 
        if (isExp) valueTotalexp += Number(stateRate);
        else valueTotalgold + Number(stateRate);
      };
    };
  }
};

//エネミー登場時にse
enemy_battleStartCry = function (user) {

  if (!$gameSwitches.value(157)) {
    const enemyId = user._enemyId;
    const enemyEntrySe = $dataEnemies[enemyId].meta['EnemyEntrySe'];
    if (enemyEntrySe) {
      const enemyEntrySeArr = enemyEntrySe.split(',');
      const name = enemyEntrySeArr[0];
      const pitch = getRandomIndex(21) + Number(enemyEntrySeArr[1]);
      const volume = getRandomIndex(11) + Number(enemyEntrySeArr[2]);
      const pan = Math.floor(Math.random() * -101);
      AudioManager.playSe({ "name": name, "volume": volume, "pitch": pitch, "pan": pan });
      $gameSwitches.setValue(157, true);
    }
  };

};

//ソロコンビ設定
party_SoroCombiAddRemove = function () {

  const gamePartyBattleMembers = $gameParty.battleMembers();
  const gamePartyBattleMembersCount = gamePartyBattleMembers.length;
  const gamePartyMembers = $gameParty.members();
  for (let i = 1; i < 3; i++) {
    const isEqualMembersCount = gamePartyBattleMembersCount == i;
    const actors = isEqualMembersCount ? gamePartyBattleMembers : gamePartyMembers;
    for (const actor of actors) {
      if (isEqualMembersCount) actor.addState(i + 202); else actor.removeState(i + 202);
      actor.refresh();
    }
  }

};

//特殊なステートの時にダメージの計算式をバトルログに出力。
attack_DamageFormula = function (user, target, id1) {

  const skill = $dataSkills[id1];
  if ($gameSwitches.value(141)) {
    const skillDamageFormulaData = skill.meta['DamageFormula2'].split(',');
    damage = Math.max($attack1(Number(skillDamageFormulaData[0]), user, target,
      Number(skillDamageFormulaData[1])) *
      Number(skillDamageFormulaData[2]), user.mdf / 10);
    const dmg = `\\C[10]${damage}\\C[0]`;
    let text = `基礎ダメージ値:${dmg}`;
    BattleManager._logWindow.push(`addText`, text);
    let userAttackElements = user.attackElements();
    if (skill.meta['Multiple Elements']) {
      userAttackElements.push(...skill.meta['Multiple Elements'].split(','));
    };
    const skillDamageElementId = $dataSkills[1].damage.elementId;
    if (skillDamageElementId >= 1) {
      userAttackElements.push(skillDamageElementId);
    };

    const prefix = `[属性] `
    text = prefix;
    for (let i = 0; i < userAttackElements.length; i++) {
      const userAttackElement = userAttackElements[i];
      let value3 = Math.round(valueAttackAmplifysActorId[user.actorId()][userAttackElement]);
      value3 = value3 + Math.round(user.elementAmplifyRate(userAttackElement) * 100 + 100);
      const value4 = Math.round(target.elementRate(userAttackElement) * 100);
      amygame_elementIcon(userAttackElement);
      if (value3 != 100 || value4 != 100) {
        if (valueElementIconArr[1] != 1 || valueElementIconArr[1] != 16) {
          text += `\x1bI[${valueElementIconArr[1]}]:${value3}-${value4} `;
        }
      };
    };
    if (text != prefix) {
      BattleManager._logWindow.push(`addText`, text);
    };
    if (target.result().critical) {
      text = `[会心発生！] 倍率${user.criticalMultiplierBonus() * 100}%`;
      BattleManager._logWindow.push(`addText`, text);
    };
    text = `[分散値] ${$dataSkills[id1].damage.variance}`;
    BattleManager._logWindow.push(`addText`, text);
  };

};

//ボス行動パターン設定
boss_actionPattarn1 = function (a) {

  const gameVar346 = $gameVariables.value(346);

  let value11 = 0;
  let value4 = 0;
  let value2 = 0;

  if (a.tp >= 100) {
    if (a.isStateAffected(416)) {
      value2 = gameVar346[3];
    } else {
      if (a.meetsSkillConditions($dataSkills[gameVar346[2]])) {
        value11 = gameVar346[2];
      }
    }
  }

  const gameVar470 = $gameSwitches.value(470);
  for (let i = 1; i <= 15; i++) {//$dataSkills[id].tpCost
    const gameVar347i = $gameVariables.value(347)[i];
    if (!gameVar347i) continue;

    const typeId = gameVar347i[0];
    const stateId = gameVar347i[1];
    const skillId = gameVar347i[2];
    const skill = $dataSkills[skillId];
    if (typeId == 0) {//HPトリガー
      if (899 != skillId && a.hpRate() <= stateId / 100) {
        if (!gameVar470 && skill.tpCost == 100) { a.gainTp(100) };
        if (a.meetsSkillConditions(skill)) {
          value11 = skillId;
          break;
        };
      }
    }
    else if (typeId == 1) {//MPトリガー
      if (a.mpRate() <= stateId / 100) {
        if (!gameVar470 && skill.tpCost == 100) { a.gainTp(100) };
        if (a.meetsSkillConditions(skill)) {
          value11 = skillId;
          break;
        };
      }
    }
    else if (typeId == 2) {//ターン
      if (($gameVariables.value(263) % stateId) == 0) {
        if (!gameVar470 && skill.tpCost == 100) { a.gainTp(100) };
        if (a.meetsSkillConditions(skill)) {
          value11 = skillId;
          break;
        };
      }
    }
    else if (typeId == 3) {//オーバードライブなどステートによる変化
      if (a.isStateAffected(stateId)) {
        if (!gameVar470 && skill.tpCost == 100) { a.gainTp(100) };
        if (a.meetsSkillConditions(skill)) {
          value11 = skillId;
          break;
        };
      }
    }
    else if (typeId == 4) {//ＨＰによる通常攻撃変化
      if (a.hpRate() <= stateId / 100) {
        if (a.meetsSkillConditions(skill)) {
          value4 = skillId;
          break;
        };
      }
    }
  }

  let arr1 = [gameVar346[0], gameVar346[3], gameVar346[4], gameVar346[5], gameVar346[6]];
  value2 = arr1[getRandomIndex(arr1.length)];
  if (value2 == 0) {
    value2 = gameVar346[0];
  };
  if (value4 >= 1) {
    value2 = value4;
  };
  const value3 = value2;
  let value1 = getRandomIndex(11);
  if (a.isStateAffected(29) && $dataSkills[gameVar346[0]].meta['Select Conditions']) {
    value1 += 2;//前衛アタック持ちが後衛の時にアビリティ使用確立アップ
  };
  if (value1 >= 5) {
    arr1 = [gameVar346[1], gameVar346[7], gameVar346[8], gameVar346[9]];
    for (let i = 1; i <= 10; i++) {
      value2 = arr1[getRandomIndex(arr1.length)];
      if (value2 == 0) {
        value2 = gameVar346[1];
      };
      if (a.meetsSkillConditions($dataSkills[value2])) {
        break;
      };
    };
  }

  let value12 = value2;
  if (value11 >= 1) {
    if (!a.meetsSkillConditions($dataSkills[value11])) {
      value11 = 0;
    };
  };
  if (!a.meetsSkillConditions($dataSkills[value12])) {
    value12 = value3;
  };
  if ([101, 111, 121, 131, 141, 151, 161, 171, 181, 191, 901, 911, 921].some(function (id) { return value12 == id })) {
    value1 = getRandomIndex(101);
    if (a.level >= 30 && value1 >= 51) { value12 += 1 };
    value1 = getRandomIndex(101);
    if (a.level >= 50 && value1 >= 51) { value12 += 1 };
    value1 = getRandomIndex(101);
    if (a.level >= 100 && value1 >= 51) { value12 += 1 };
  };

  valueBossAction = value11;
  valueBossActionNormal = value12;
  if (gameVar470) {
    if (valueBossAction >= 1) {
      boss_actionPredict(valueBossAction, 1);
    } else {
      boss_actionPredict(valueBossActionNormal, 2);
    };
  };
};

//ボス行動コモン内予測計算
boss_actionPredict = function (value1, id1) {

  var value3 = 777;//
  var enemy1 = $gameTroop.members()[0];
  var actor = $gameActors.actor($gameVariables.value(2));
  var value5 = actor.skillMasteryLevel(value3) * 10;
  var value2 = 1;
  if (id1 == 1) {
    if (actor.isStateAffected(292)) {
      if (value5 + actor.level > enemy1.level) {
        //if(true){
        var value2 = `${enemy1.name()}は\x1bSIN[${value1}]を発動するようだ…。`;
      } else {
        var value2 = `${enemy1.name()}の力が強大な為、行動を予測する事が出来ない…。`;
      };
    } else {
      var value2 = `${enemy1.name()}から大きな力の予兆を感じる…。。`;
    };
    if (value2 == 1) { } else {
      BattleManager._logWindow.push(`addText`, value2);
    };
  };
  if (id1 == 2) {
    if (actor.isStateAffected(292)) {
      if (value5 + actor.level > enemy1.level) {
        //if(true){
        var value2 = `${enemy1.name()}は\x1bSIN[${value1}]を使用するようだ…。`;
      } else {
        var value2 = `${enemy1.name()}の力が強大な為、行動を予測する事が出来ない…。`;
      };
      if (value2 == 1) { } else {
        BattleManager._logWindow.push(`addText`, value2);
      };
    };
  };
};

//エネミー仲間呼びスキル
enemy_reinforcement = function () {

  let value1 = false;
  let value2 = 0;
  const enemies = $gameTroop.members();
  for (let i = 0, size = enemies.length; i < size; i++) {
    if (!enemies[i].isAppeared()) {
      this.iterateEnemyIndex(i, function (enemy) {
        enemy.appear();
        $gameTroop.makeUniqueNames();
      });
      value1 = true;
      value2 = i;
      break;
    }
  }
  if (value1 == true) {
    const enemyId = $gameTroop.members()[value2]._enemyId;
    $gameVariables.setValue(21, $dataEnemies[enemyId].name);
    if ($gameVariables.value(240) >= 1) {
      enemy_battleSetting($gameVariables.value(334));
    };
    $gameSwitches.setValue(380, true);
  } else {
    $gameSwitches.setValue(380, false);
  };

};

//奥義召喚等追加効果設定id1対象が使用者のみなら1全員なら2敵単体なら3敵全体なら4 id2ステート付与なら1 id3は付与回数バフなど,id4ステート種類 id5アニメ
skill_additionalSet = function (user, target) {

  //<additionalSet1:1,1,2,206,651>
  if ($gameTroop.aliveMembers().length >= 1 && target.isAlive()) {
    var list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    list.forEach(function (id) {
      if ($dataSkills[$gameVariables.value(96)].meta['additionalSet' + id]) {
        var arr1 = $dataSkills[$gameVariables.value(96)].meta['additionalSet' + id].split(',');
        if (Number(arr1[4]) >= 1) {
          if (Number(arr1[1]) == 1) {
            var actor = $gameActors.actor($gameVariables.value(20));
            actor.startAnimation(Number(arr1[4]), true, 1);
          };
          if (Number(arr1[1]) == 2) {
            var actor = $gameActors.actor($gameVariables.value(20));
            if ($dataAnimations[Number(arr1[4])].position() == 3) {
              actor.startAnimation(Number(arr1[4]), true, 1);
            } else {
              for (var i = 0; i < $gameParty.battleMembers().length; i++) {
                var actor = $gameParty.battleMembers()[i];
                if (actor.isAlive()) {
                  actor.startAnimation(Number(arr1[4]), true, 1);
                };
              };
            };
          };
          if (Number(arr1[1]) == 3) {
            var target1 = $gameTroop.members()[$gameVariables.value(92)];
            target1.startAnimation(Number(arr1[4]), true, 1);
          };
          if (Number(arr1[1]) == 4) {
            var target1 = $gameTroop.members()[$gameVariables.value(92)];
            if ($dataAnimations[Number(arr1[4])].position() == 3) {
              target1.startAnimation(Number(arr1[4]), true, 1);
            } else {
              for (var i = 0; i < $gameTroop.members().length; i++) {
                var target1 = $gameTroop.members()[i];
                target1.startAnimation(Number(arr1[4]), true, 1);
              };
            };
          };
        };
        if (Number(arr1[1]) == 1) {//ステート付与
          if (Number(arr1[0]) == 1) {
            var actor = $gameActors.actor($gameVariables.value(20));
            for (var i = 1; i <= Number(arr1[2]); i++) {
              if (Number(arr1[3]) == 201) {
                for (var j = 206; j <= 211; j++) {
                  actor.addState(j);
                };
              } else {
                actor.addState(Number(arr1[3]));
              };
            };
          };
          if (Number(arr1[0]) == 2) {
            for (var i = 0; i < $gameParty.battleMembers().length; i++) {
              var actor = $gameParty.battleMembers()[i];
              if (actor.isAlive()) {
                if (Number(arr1[3]) == 201) {
                  for (var j = 206; j <= 211; j++) {
                    actor.addState(j);
                  };
                } else {
                  actor.addState(Number(arr1[3]));
                };
              };
            };
          };
          if (Number(arr1[0]) == 3) {
            var target1 = $gameTroop.members()[$gameVariables.value(92)];
            if (target1.isAlive()) {
              for (var i = 1; i <= Number(arr1[2]); i++) {
                if (Number(arr1[3]) == 201) {
                  for (var j = 206; j <= 211; j++) {
                    state_addFormula1([j, 50, user, target1, user.mdf, target1.luk]);
                  };
                } else {
                  state_addFormula1([Number(arr1[3]), 50, user, target1, user.mdf, target1.luk]);
                };
              };
            };
          };
          if (Number(arr1[0]) == 4) {
            for (var i = 0; i < $gameTroop.members().length; i++) {
              var target1 = $gameTroop.members()[i];
              if (target1.isAlive()) {
                if (Number(arr1[3]) == 201) {
                  for (var j = 206; j <= 210; j++) {
                    state_addFormula1([j, 50, user, target1, user.mdf, target1.luk]);
                  };
                } else {
                  state_addFormula1([Number(arr1[3]), 50, user, target1, user.mdf, target1.luk]);
                };
              };
            };
          };
        };
      };
    }, this);
  };

};

//スキル名表示。id2はid1が2の場合のみ名前を入れておく
skillWord_direction = function (id1, id2) {

  let value3 = 384 - 310;
  if (id1 == 2) {
    if ($gameParty.inBattle()) {
      if ($gameSwitches.value(211)) {
        $gameTemp._battler_bhp_temp[2] = true;
      } //else {
      //$gameSystem.setTurnOrderDisplaySettings(false);
      //BattleManager.updateTurnOrderDisplayX();
      //};
    };
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.dTextAlign = 1;
    $gameScreen.setDTextPicture(`${id2}`, 28);
    $gameScreen.showPicture(100, "", 1, 640 + 50, value3, 100, 100, 0, 0);
    $gameScreen.movePicture(100, 1, 640, value3, 100, 100, 255, 0, 30);
  };
  if (id1 == 0) {
    if ($gameParty.inBattle()) {
      if ($gameSwitches.value(211)) {
        $gameTemp._battler_bhp_temp[2] = true;
      } else {
        //$gameSystem.setTurnOrderDisplaySettings(false);
        //BattleManager.updateTurnOrderDisplayX();
      };
    };
    let skill96Ruby = $dataSkills[$gameVariables.value(96)].meta['rubi'];
    if (skill96Ruby) {
      for (let i = 1; i <= 10; i++) {
        if (skill96Ruby.match(/ /)) {
          skill96Ruby = skill96Ruby.replace(' ', '');
        };
      };
      value3 += 40;
      $gameScreen.setDTextPicture(`${skill96Ruby}`, 20);
    };
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.dTextAlign = 1;
    $gameScreen.setDTextPicture(`${$gameVariables.value(527)}`, 28);
    $gameScreen.showPicture(100, "", 1, 640 + 50, value3, 100, 100, 0, 0);
    $gameScreen.movePicture(100, 1, 640, value3, 100, 100, 255, 0, 30);
  } else {
    if ($gameParty.inBattle()) {
      if ($gameSwitches.value(211)) {
        $gameTemp._battler_bhp_temp[2] = false;
      } //else {
      //$gameSystem.setTurnOrderDisplaySettings(true);
      //};
    };
    if ($gameScreen.picture(100)) $gameScreen.movePicture(100, 1, 640 - 50, value3, 100, 100, 0, 0, 60);
  };

};

//奥義名表示
ougiWord_direction = function (id1) {

  if (id1 == 0) {
    if (BattleManager._subject.isActor()) {
      var user = $gameActors.actor($gameVariables.value(20)).index();
    } else {
      var user = $gameVariables.value(92);
    };
    var value1 = `\x1bSIN[${$gameVariables.value(96)}]`;
    if (valueAddPowerCustom >= 1) {
      value1 += `＜\\I[666]\\C[10]+${valueAddPowerCustom}\\C[0]＞`
    };
    if (valueChainAddPower >= 1) {
      value1 += `＜\\C[10]Chain+${valueChainAddPower}\\C[0]＞`
    };
    if ($dataSkills[$gameVariables.value(96)].meta['rubi']) {
      var value2 = $dataSkills[$gameVariables.value(96)].meta['rubi'];
      for (var i = 1; i <= 10; i++) {
        if (value2.match(/ /)) {
          var value2 = value2.replace(' ', '');
        };
      };
      $gameScreen.setDTextPicture(`${value2}`, 20);
    };
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.dTextAlign = 1;
    $gameScreen.setDTextPicture(`${value1}`, 28);
    if (BattleManager._subject.isActor()) {
      $gameScreen.showPicture(100, "", 1, $gameParty.getX(user + 1), $gameParty.getY(user + 1) - 200, 100, 100, 0, 0);
      $gameScreen.movePicture(100, 1, $gameParty.getX(user + 1), $gameParty.getY(user + 1) - 250, 100, 100, 255, 0, 20);
    } else {
      //$gameScreen.showPicture(100,"",1,$gameTroop.getX(user+1),$gameTroop.getY(user+1)-200,100,100,0,0);
      //$gameScreen.movePicture(100,1,$gameTroop.getX(user+1),$gameTroop.getY(user+1)-250,100,100,255,0,20);
      $gameScreen.showPicture(100, "", 1, 640, 80 - 100, 100, 100, 0, 0);
      $gameScreen.movePicture(100, 1, 640, 80, 100, 100, 255, 0, 20);
    };
  } else {
    if ($gameScreen.picture(100)) { $gameScreen.erasePicture(100) };
  };

};

//カットイン事前設定用
cutin_preparation = function (cutinCategory, actorId) {
  //奥義0,角度
  //スキル90
  //チェイン180
  //会話-90
  //if (actorId >= 1) {
  //  const actor = $gameActors.actor(actorId);
  //};
  //if (cutinCategory == 0) {
    //const action = BattleManager._action;
    //const itemId = BattleManager._action._item._itemId;
    //if ($dataSkills[itemId].meta["CutInSkillSet"]) {
      //const enemyId = $gameTroop.members()[$gameVariables.value(92)]._enemyId;
      //if ($dataEnemies[enemyId].meta[`Passive State`]) {
        //const passiveStateId = Number($dataEnemies[enemyId].meta[`Passive State`]) - 420;
      //};
      //const cgAssetName = 'CutInCG_EnemyEntry' + passiveStateId; 
      //valueCutInSet1 = ["カットインエネミースキル", cgAssetName, 0, 4.5, 4.5, 25, 40];
    //};
  //};

  // Modified switch block using the helper functions with "CutinPreparation" suffix
  switch (cutinCategory) {
    case 1:
      handleCutinCategory1CutinPreparation(actorId);
      break;
    case 2:
      handleCutinCategory2CutinPreparation();
      break;
    case 3:
      handleCutinCategory3CutinPreparation();
      break;
    case 4:
      handleCutinCategory4CutinPreparation();
      break;
    case 5:
      handleCutinCategory5CutinPreparation(actorId);
      break;
    case 6:
      handleCutinCategory6CutinPreparation();
      break;
    case 7:
      handleCutinCategory7CutinPreparation();
      break;
    case 8:
      handleCutinCategory8CutinPreparation();
      break;
    default:
      // Optional: Default behavior
      break;
  }
};

const cutinSettingsV2V3 = { angle: 90, scaleX: 1.3, scaleY: 1.3, opacity: 35, duration: 60, name: 'スキル' };
const cutinSettingsV4V5 = { angle: 180, scaleX: 1.3, scaleY: 1.3, opacity: 35, duration: 60, name: 'チェイン' };
const cutinSettingsMap = {
  1: { angle: 0, scaleX: 4.5, scaleY: 4.5, opacity: 25, duration: 20, name: '奥義' },
  2: cutinSettingsV2V3,
  3: cutinSettingsV2V3,
  4: cutinSettingsV4V5,
  5: cutinSettingsV4V5
};
function handleCutinCategory1CutinPreparation(actorId) {
  // Cache references and values to reduce property lookups
  const actor = $gameActors.actor(actorId);
  const abilityUsageDistinction = $gameVariables.value(182);
  const dataActor = actor.actor();
  
  // Initialize with defaults
  let cutinType = 0;
  let skillId;
  
  // Determine skill ID and cutin type based on ability usage distinction
  if (abilityUsageDistinction == 13) {
    skillId = 91;
    cutinType = 4;
  } else {
    skillId = BattleManager._action._item._itemId;
  }

  if (abilityUsageDistinction == 12) {
    // Check for special cutin settings in skill metadata
    const skill = $dataSkills[skillId];
    if (skill && skill.meta["CutInSkillSet"]) {
      cutinType = 2;
    }
    else {
      cutinType = 1;
    }
  }
  //else{
    //if (skill && skill.meta["CutInSkillSet"] && [5, 6, 7, 8].some(function(id) { return abilityUsageDistinction == id; })) {
    //  $gameVariables.setValue(21, 2);
    //}
  //}
  
  
  // Exit early if no cutin needed
  if (cutinType < 1) return;
  
  // Play background music for special cutin types
  if (cutinType === 2) {
    const bgmName = $dataSkills[$gameVariables.value(96)].meta['HiQualityBurst'] ? 
                    "21_BattleOugiBest" : "21_BattleOugi";
    AudioManager.playBgm({ name: bgmName, volume: 50, pitch: 110, pan: 0 });
  }
  
  // Display character dialogue if available
  const ougiUseMeta = dataActor.meta['OugiUse'];
  if (ougiUseMeta) {
    const ougiUseOptions = ougiUseMeta.split(',');
    const selectedOption = ougiUseOptions[getRandomIndex(ougiUseOptions.length)];
    gabWord_exeScriptNoFace([[`${actor.name()}${selectedOption}`, 0, 0]]);
  }
  
  // Apply heroine-specific modifications
  if (dataActor.meta['Heroine']) {
    const heroineExposure = $gameVariables.value(actorId + 380)[4];
    
    // Adjust cutinType based on exposure level
    if (heroineExposure <= 5) {
      if (cutinType === 2) cutinType = 3;
      else if (cutinType === 4) cutinType = 5;
    }
    
    // Define cutin settings based on type - use lookup table for better performance
    const cutinSettings = cutinSettingsMap[cutinType];    
    if (cutinSettings) {
      const actorCgAsset = 'CutInCG_Actor' + actorId + '_' + cutinType;
      const actorCutinLabel = 'カットインアクター' + cutinSettings.name;
      
      // Set the global cutin parameters in a single operation
      valueCutInSet1 = [
        actorCutinLabel,
        actorCgAsset,
        cutinSettings.angle,
        cutinSettings.scaleX,
        cutinSettings.scaleY,
        cutinSettings.opacity,
        cutinSettings.duration
      ];
    }
  }
}

function handleCutinCategory2CutinPreparation() {
  const partyFirstStrikeCg = 'CutInCG_PartyFirstStrike';
  const chainLabel = 'チェイン';
  const partyCutinActorLabel = 'カットインアクター' + chainLabel;
  valueCutInSet1 = [partyCutinActorLabel, partyFirstStrikeCg, 180, 1.3, 1.3, 25, 20];
}

function handleCutinCategory3CutinPreparation() {
  const enemySurpriseCg = 'CutInCG_EnemySurprise';
  const enemyCutinLabel = 'カットインエネミー演出色々';
  valueCutInSet1 = [enemyCutinLabel, enemySurpriseCg, 0, 2, 2, 25, 40];
}

function handleCutinCategory4CutinPreparation() {
  const partyChainBurstCg = 'CutInCG_PartyChainBurst';
  const chainLabelForBurst = 'チェイン';
  const partyChainCutinLabel = 'カットインアクター' + chainLabelForBurst;
  valueCutInSet1 = [partyChainCutinLabel, partyChainBurstCg, 180, 5, 5, 25, 40];
}

function handleCutinCategory5CutinPreparation(actorId) {
  $gameSwitches.setValue(428, true);
  const actorConversationCg = 'CutInCG_Actor' + actorId + '_' + $gameVariables.value(21);
  let conversationLabel;
  if ($gameVariables.value(21) >= 11) {
    conversationLabel = '会話';
  }
  const actorConversationCutinLabel = 'カットインアクター' + conversationLabel;
  valueCutInSet1 = [actorConversationCutinLabel, actorConversationCg, -90, 2.5, 2.5, 25, 60];
}

function handleCutinCategory6CutinPreparation() {
  const enemyEntryCg = 'CutInCG_EnemyEntry' + valueCountSet1;
  valueCutInSet1 = ["カットインエネミー登場", enemyEntryCg, 180, 1.2, 1.2, 25, 40];
}

function handleCutinCategory7CutinPreparation() {
  let gachaRank = 'N';
  const rankId = $gameVariables.value(23);
  switch (rankId) {
    case 6:
      gachaRank = 'R';
      break;
    case 7:
      gachaRank = 'SR';
      break;
    case 8:
      gachaRank = 'SSR';
      break;
    case 9:
      gachaRank = 'UR';
      break;
    default:
      if (rankId >= 10) {
        gachaRank = 'LR';
      }
  }
  const cutinGachaCg = 'GachaDirect' + gachaRank;
  valueCutInSet1 = ["ガチャ演出", cutinGachaCg, 270, 2, 1.5, 25, 60];
}

function handleCutinCategory8CutinPreparation() {
  const enemyAwakenCg = 'CutInCG_EnemyAwaken';
  const enemySkillCutinLabel = 'カットインエネミースキル';
  valueCutInSet1 = [enemySkillCutinLabel, enemyAwakenCg, 0, 2, 2, 25, 40];
}

//石召喚演出ピクチャsummon_directPicture1(1);
summon_directPicture1 = function (effectMode) {
  picture_motion1("smooth", [0]);

  const pictureId = 101;

  switch (effectMode) {
    case 0:
      sdp1HandleSummonFadeOut(pictureId);
      break;
    case 1:
      sdp1HandleSummonAppearance(pictureId);
      break;
    case 2:
      sdp1HandleSummonSkillDisplay(pictureId);
      break;
  }
};

// Handles the fade out effect of a summon
function sdp1HandleSummonFadeOut(pictureId) {
  sdp1PlaySummonFadeOutEffect();

  // Clear any existing particles
  sdp1ClearSummonParticles();

  // Move and fade out the picture
  sdp1AnimateSummonPictureFadeOut(pictureId);
}

// Plays sound and flash effects for fade out
function sdp1PlaySummonFadeOutEffect() {
  AudioManager.playSe({ "name": 'Ice7', "volume": 100, "pitch": 150, "pan": 0 });
  $gameScreen.startFlash([255, 255, 255, 170], 20);
}

// Clears particle effects used in summon animations
function sdp1ClearSummonParticles() {
  const particle = $gameScreen._particle;
  particle.particleClear('summon_Direct1');
  particle.particleClear('summon_Direct2');
}

// Animates the summon picture fading out
function sdp1AnimateSummonPictureFadeOut(pictureId) {
  const picOrigin = $gameScreen.picture(pictureId).origin();
  const picX = $gameScreen.picture(pictureId).x();
  const picY = $gameScreen.picture(pictureId).y();
  const picScaleX = $gameScreen.picture(pictureId).scaleX();
  const picScaleY = $gameScreen.picture(pictureId).scaleY();

  $gameScreen.movePicture(pictureId, picOrigin, picX, picY, picScaleX, picScaleY + 100, 0, 0, 60);
  picture_fade1(pictureId, "fadeOut", 'Hscene005', 60, 5);
  UTSU.PictureBreath.off([pictureId]);
  $gameScreen.erasePicture(pictureId + 1);
}

// Handles the appearance of a summon with particles and visual effects
function sdp1HandleSummonAppearance(pictureId) {
  const currentSkill = $dataSkills[$gameVariables.value(96)];

  // Set picture reference for particle effects
  valueWordSet10 = ($gameParty.inBattle() ? 'battlePicture:' : 'picture:') + pictureId;

  // Play effects and show the summon picture
  sdp1PlaySummonAppearanceEffects();
  sdp1ShowSummonPicture(pictureId, currentSkill);

  // Configure and apply particle effects
  sdp1ConfigureSummonParticles(currentSkill);
}

// Plays sound and visual effects for summon appearance
function sdp1PlaySummonAppearanceEffects() {
  AudioManager.playSe({ "name": 'Z_Summoning', "volume": 50, "pitch": 120, "pan": 0 });

  // Apply flash effect based on available data or default to white
  const damageFlashData = $gameVariables.value(331);
  if (damageFlashData !== 0) {
    $gameScreen.startFlash([
      damageFlashData[0],
      damageFlashData[1],
      damageFlashData[2],
      170
    ], 20);
  } else {
    $gameScreen.startFlash([255, 255, 255, 170], 20);
  }
}

// Shows the summon picture with appropriate positioning and animation
function sdp1ShowSummonPicture(pictureId, skill) {
  const picSizeArr = skill.meta['picSize'].split(',');
  const picturePath = "/img/sv_enemies/Summon_" + Number(picSizeArr[0]);
  const offsetX = Number(picSizeArr[1]);
  const offsetY = Number(picSizeArr[2]);

  $gameScreen.showPicture(pictureId, picturePath, 1, 640 + 450 + offsetX, 384 + offsetY, -100, 100, 210, 0);
  picture_fade1(pictureId, "fadeIn", '162', 60, 5);
  tachie_bless(pictureId);
}

// Configures particle effects for the summon based on skill properties
function sdp1ConfigureSummonParticles(skill) {
  const particle = $gameScreen._particle;
  const picSizeArr = skill.meta['picSize'].split(',');

  // Set up basic particle groups
  sdp1SetupSummonParticleGroups(particle);

  // Configure particle size and area
  const particleSize = Number(picSizeArr[3]);
  const particleDetail = Number(picSizeArr[4]);
  sdp1ConfigureSummonParticleProperties(particle, particleSize, particleDetail);

  // Apply element-based coloring if available
  sdp1ApplySummonElementColors(particle, skill);
}

// Sets up the base particle groups for summon effects
function sdp1SetupSummonParticleGroups(particle) {
  particle.particleSet(0, 'summon_Direct1', valueWordSet10, 'def', 'screen');
  particle.particleSet(0, 'summon_Direct2', valueWordSet10, 'def', 'screen');
}

// Configures detailed properties of summon particles
function sdp1ConfigureSummonParticleProperties(particle, particleSize, particleDetail) {
  const rectX = -particleSize / 2 - 50;
  const rectWidth = particleSize + 100;
  const particlesWaveCountA = Math.round(particleDetail / 10);
  const particlesWaveCountB = Math.round(particleDetail / 5);

  particle.particleUpdate(['summon_Direct1', 'rect', rectX, particlesWaveCountB, rectWidth, 0]);
  particle.particleUpdate(['summon_Direct2', 'rect', rectX, particlesWaveCountA, rectWidth, 0]);

  const waveParticles = 2;
  particle.particleUpdate(['summon_Direct1', 'particlesPerWave', String(waveParticles)]);
  particle.particleUpdate(['summon_Direct2', 'particlesPerWave', String(waveParticles)]);

  particle.particleExceed('summon_Direct1', 1.5);
  particle.particleExceed('summon_Direct2', 1.5);
}

// Applies element-specific colors to summon particles
function sdp1ApplySummonElementColors(particle, skill) {
  if (!skill.meta['Multiple Elements']) return;

  const multipleElementsArr = skill.meta['Multiple Elements'].split(',');

  for (let index = 0; index < multipleElementsArr.length; index++) {
    const elementValue = Number(multipleElementsArr[index]);
    const elementColorHex = getElementColorHex(elementValue);

    if (elementColorHex !== 0) {
      particle.particleUpdate(['summon_Direct1', 'color', String(elementColorHex), '#ffffff']);
      particle.particleUpdate(['summon_Direct1', 'colorMode', '1']);
      particle.particleUpdate(['summon_Direct2', 'color', String(elementColorHex), '#ffffff']);
      particle.particleUpdate(['summon_Direct2', 'colorMode', '1']);
      break;
    }
  }
}

// Handles displaying the skill name for a summon
function sdp1HandleSummonSkillDisplay(pictureId) {
  const picX2 = $gameScreen.picture(pictureId).x();
  const picY2 = $gameScreen.picture(pictureId).y();

  // Play animation at the picture's position
  $gameScreen.startAnimation(picX2, picY2, 301, false);

  // Display skill name with optional ruby text
  sdp1DisplaySummonSkillName(pictureId, picX2);
}

// Displays the skill name with optional ruby text above it
function sdp1DisplaySummonSkillName(pictureId, xPosition) {
  const currentSkill = $dataSkills[$gameVariables.value(96)];
  const displayText = `\x1bSIN[${$gameVariables.value(96)}]`;

  // Set up optional ruby text if available
  sdp1SetupSummonRubyText(currentSkill);

  // Configure and display the skill name
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.dTextAlign = 1;
  $gameScreen.setDTextPicture(`${displayText}`, 28);

  // Position and animate the text display
  $gameScreen.showPicture(pictureId + 1, "", 1, xPosition, 384 - 250, 100, 100, 0, 0);
  $gameScreen.movePicture(pictureId + 1, 1, xPosition, 384 - 350, 100, 100, 255, 0, 30);
}

// Prepares ruby text for a skill if available
function sdp1SetupSummonRubyText(skill) {
  if (!skill.meta['rubi']) return;

  let rubiText = skill.meta['rubi'];
  // Remove spaces from ruby text
  for (let j = 1; j <= 10; j++) {
    if (rubiText.match(/ /)) {
      rubiText = rubiText.replace(' ', '');
    }
  }

  $gameScreen.setDTextPicture(`${rubiText}`, 20);
}

const COLOR_RED = '#ff0000';
const COLOR_LIME = '#1eff00';
const COLOR_ORANGE = '#ff9500';
const COLOR_SKYBLUE = '#00d0ff';
const COLOR_WHITE = '#ffffff';
const COLOR_PURPLE = '#461260';

getElementColorHex = function (elementValue) {
  switch (elementValue) {
    case 3:
      return COLOR_RED;
    case 4:
      return COLOR_LIME;
    case 5:
      return COLOR_ORANGE;
    case 6:
      return COLOR_SKYBLUE;
    case 7:
      return COLOR_WHITE;
    case 8:
      return COLOR_PURPLE;
    default:
      return 0;
  }
}

enemy_preSetup1 = function (eventId) {

  let battleBgmSettings = isHEnemyOrNonAuto()
    ? ['21_Battle3', 45, 110, 0]
    : ['21_Battle1', 45, 100, 0];
  $gameSystem.setBattleBgm({
    "name": battleBgmSettings[0],
    "volume": battleBgmSettings[1],
    "pitch": battleBgmSettings[2],
    "pan": battleBgmSettings[3]
  });
  BattleManager._forceAdvantage = 'Neutral';

  if ($gameVariables.value(329) == 0) {
    if ($gameSwitches.value(41) || $gameSwitches.value(99)) {
      battle_simpleSubjugation(eventId);
      if ($gameSwitches.value(98)) {
        valueVictoryResult = 0;
        $gameSwitches.setValue(98, false);
      }
    }
    if ($gamePlayer.isFacingAway($gameMap.event(eventId)) && $gameMap.event(eventId).isPositionBackOf($gamePlayer)) {
      BattleManager._forceAdvantage = 'Player';
    }
    if ($gameMap.event(eventId).isFacingAway($gamePlayer) && $gamePlayer.isPositionBackOf($gameMap.event(eventId))) {
      BattleManager._forceAdvantage = 'Enemy';
    }
    valueCountSet1 = isHEnemyOrNonAuto() ? 10 : getRandomIndex(9) + 11;
    valueCountSet2 = true;
  } else {
    valueCountSet1 = $gameVariables.value(329); //直前に入れる戦闘グループ名
    valueCountSet2 = false;
  }

};

//戦闘マップでの簡易討伐
battle_simpleSubjugation = function (id1) {

  if ($gameSwitches.value(201)) {
    var actor = $gameActors.actor($gameVariables.value(11));
    var value = $dataItems[$gameVariables.value(240)];
    var array = value.meta['EnemyLV'].split(',');
    var max = array.reduce(function (a, b) {
      return Math.max(a, b);
    });
    var value1 = max;
    var value2 = actor.level;
    if (value2 >= value1 || $gameSwitches.value(41)) {
      $gameSwitches.setValue(98, true);
      enemy_instantwin();
      for (var i = 0; i < $gameParty.battleMembers().length; i++) {
        var actor = $gameParty.battleMembers()[i];
        actor.gainJp(1);
      };
    };
  };

};

//state_addbuffdebuff(1,2,user,target,stateId,271);
state_addbuffdebuff = function (id5, id6, id1, id2, id3, id4) {

  var value1 = id6;
  var turns = getRandomIndex(3) + 3;
  if (id5 == 1) {
    id2.addBuff(value1, turns);
  } else {
    id2.addDebuff(value1, turns);
  };
  if (id2._stateCounter[id3] >= 5) { } else {
    state_addEffect1(id1, id2, id3, id4);
  };
  if (id2._stateCounter[id3] >= 1) {
    id2.addStateCounter(id3, +1);
  } else {
    id2.setStateCounter(id3, 1);
  };

};

//state_removebuffdebuff(1,2,user,target,stateId,271);
state_removebuffdebuff = function (id, buffId, user, target, stateId, animationId) {

  if ($gameTroop.isAllDead() || target._buffs[buffId] < 1) { } else {
    target.removeState(stateId);
    target.removeBuff(buffId);
    //BattleManager._logWindow.push(`addText`, id2.name() + `の`+$dataStates[id3].name+`が解除された`);
    state_removeEffect1(user, target, stateId, animationId);
  };

};

//state_turnEndbuffdebuff(1,2,user,target,stateId,271);
state_turnEndbuffdebuff = function (mode, buffId, user, target, stateId, animationId) {

  user.removeStateCounter(stateId);
  let removeEffect
  if (mode == 1) {
    removeEffect = target._buffs[buffId] < 0;
  } else {
    removeEffect = target._buffs[buffId] > 0;
  };
  if (removeEffect) {
    target.removeState(stateId);
    //id2.removeBuff(value1);
    state_removeEffect1(user, target, stateId, animationId);
  };

};

//装備スキルの操作
skill_equipOperation = function (actor, actor2, itemId) {

  if (actor2.actorId() !== actor.actorId()) return;

  const gameVar351Arr = $gameVariables.value(351);
  const actorId = actor.actorId();
  const actorName = `\\C[2]${actor.name()}\\C[0]`;
  if (itemId == 427) {//記憶
    const arr1 = actor.battleSkillsRaw();
    gameVar351Arr[actorId] = arr1.clone();
    TickerManager.show(`${actorName}のスキル装備状態を記録しました`);
  }
  else if (itemId == 428) {//復元
    if (gameVar351Arr[actorId] == 0) {
      TickerManager.show(`\\C[2]${actor.name()}\\C[0]はスキル装備状態を記録していません`);
    } else {
      actor.clearEquipBattleSkills();
      for (let i = 0; i <= gameVar351Arr[actorId].length - 1; i++) {
        actor.equipSkill(gameVar351Arr[actorId][i], i);
      };
      TickerManager.show(`${actorName}のスキル装備状態を復元しました`);
    };
  }
  else if (itemId == 429) {//一括解除
    actor.clearEquipBattleSkills();
    TickerManager.show(`${actorName}のスキル装備状態を全て解除しました`);
  }
  else if (itemId == 430) {//一括装着
    const skillIds = Array(actor.battleSkillsRaw().length).fill(0);
    let id1 = 0;
    let id2 = actor.battleSkillsRaw().length - isGirl(actor) ? 200 : 100;//10Ｇパッシブ
    let id3 = actor.battleSkillsRaw().length - 100;//15Hパッシブ
    let id4 = 0;
    for (let i = 1; i < $dataSkills.length; i++) {
      const skill = $dataSkills[i];
      if (skill.name === '') continue;

      const isValid = skill.meta['Skill Tier'] && (actor.isLearnedSkill(i) || actor.addedSkills().contains(i));
      if (!isValid) continue;

      id4 += 1;
      if (skill.stypeId == 10) {
        skillIds[id2] = i;
        id2 += 1;
      } else if (skill.stypeId == 15) {
        skillIds[id3] = i;
        id3 += 1;
      } else {
        skillIds[id1] = i;
        id1 += 1;
      }
    }
    if (id4 >= 1) {
      actor.clearEquipBattleSkills();
      for (let i = 0; i < skillIds.length; i++) {
        const skillId = skillIds[i];
        if (skillId) {
          const skillTierId = Number($dataSkills[skillId].meta['Skill Tier']);
          if (actor.getEquipSkillTierCount(skillTierId) < actor.getEquipSkillTierMax(skillTierId)) {
            if (i <= actor.battleSkillsRaw().length) {
              actor.equipSkill(skillIds[i], i);
            }
          }
        }
      }
      TickerManager.show(`${actorName}は装備可能なスキルを全て装着しました。`);
    } else {
      TickerManager.show(`${actorName}は装備可能なスキルを保有していません。`);
    }
  }
}

//ステータス表示非表示
battleStatus_showHide = function (id1) {

  const on = id1 == 0;
  if (Imported.MOG_BattleHud) {
    $gameSystem._bhud_visible = on;
  } else {
    if (on) BattleManager._statusWindow.show(); else BattleManager._statusWindow.hide();
  };
  if ($gameSwitches.value(211)) {
    if (SceneManager._scene._bosshp_sprites === undefined) {
      console.warn('SceneManager._scene._bosshp_sprites is undefined!');
    }
    else SceneManager._scene._bosshp_sprites.visible = on;
  }

}

//確率でステート付与state_addFormula1([4,50,user,target,user.mdf,target.luk]);
state_addFormula1 = function(params) {
  // Extract parameters (destructuring for readability)
  const [stateId, baseChance, user, target, userMDF, targetLUK] = params;
  
  // Cache state data
  const stateData = $dataStates[stateId];
  
  // Skip processing if target is immune
  const targetName = `\\C[16]${target.name()}\\C[0]`;
  const stateName = `\\C[10]${stateData.name}\\C[0]`;
  if (target.isStateResist(stateId)) {
    showMessage(`${targetName}は${stateName}を無効化した！。（\\C[10]完全耐性\\C[0]）`);
    return;
  }
  
  // Show initial message only when user isn't targeting self
  const userName = `\\C[2]${user.name()}\\C[0]`;
  if (user !== target) {
    showMessage(`${userName}が${stateName}を付与した！　`);
  }
  
  // Calculate once for both conditionals
  const activationChance = Math.floor((1.0 + (userMDF - targetLUK) * 0.01) * baseChance);
  const resistanceRoll = Math.floor(Math.random() * target.stateRate(stateId) * 100);
  const isStateApplied = activationChance > resistanceRoll;
  
  // Apply state if check passed
  if (isStateApplied) {
    target.addState(stateId);
  }
  
  // Show appropriate result message
  const resultMessage = isStateApplied
    ? `${targetName}は${stateName}を付与された…。`
    : `${targetName}は${stateName}を無効化した！`;
  
  const resist = `\\C[4]${resistanceRoll}\\C[0]`;
  const chance = `\\C[10]${activationChance}\\C[0]`;
  showMessage(`${resultMessage}（判定：${resist} > ${chance}）`);
};

//トータルダメージ表示
const DEFAULT_PICTURE_ID_BATTLE_TOTAL_DAMAGE = 96;
const DEFAULT_PICTURE_X_BATTLE_TOTAL_DAMAGE = 400;
const DEFAULT_PICTURE_Y_BATTLE_TOTAL_DAMAGE = 480;
battle_totalDamage = function() {
  // Early exit if we don't have multiple hits
  if (valueTotalDamageCount2 < 2) return;

  const totalDamageCount = valueTotalDamageCount;
  const totalHits = valueTotalDamageCount2;
  
  // Format large numbers with commas
  const formattedDamageCount = totalDamageCount.toLocaleString();
  
  // Determine font size based on damage amount - calculate only once
  const dTextFontSize = totalDamageCount < 10000 ? 45 : 
                        totalDamageCount >= 100000 ? 55 : 50;
    
  // Configure text settings
  $gameScreen.setDtextFont('ＭＳ Ｐ明朝');
  
  // Use a template literal for the text string - more efficient than concatenation
  // Choose color based on current state - avoid branching with conditional operator
  const outlineColor = $gameVariables.value(276) === 2 ? '22' : '2';
  const displayText = `\\f[b]\\oc[${outlineColor}]\\f[i]Total${totalHits}Hit,\\C[10]${formattedDamageCount}\\C[17]Damage!\\C[0]`;
  
  // Set the text once
  $gameScreen.setDTextPicture(displayText, dTextFontSize);
  
  // Display and move the picture
  $gameScreen.showPicture(DEFAULT_PICTURE_ID_BATTLE_TOTAL_DAMAGE, "", 0, DEFAULT_PICTURE_X_BATTLE_TOTAL_DAMAGE - 50, DEFAULT_PICTURE_Y_BATTLE_TOTAL_DAMAGE, 100, 100, 100, 0);
  $gameScreen.movePicture(DEFAULT_PICTURE_ID_BATTLE_TOTAL_DAMAGE, 0, DEFAULT_PICTURE_X_BATTLE_TOTAL_DAMAGE, DEFAULT_PICTURE_Y_BATTLE_TOTAL_DAMAGE, 100, 100, 255, 0, 20);
};

//ステート付与攻撃時にアニメ
battle_stateAnime1 = function (target) {

  if (valueAttackStates.length > 0) {
    let value1 = 0;
    for (let i = 0; i < valueAttackStates.length; i++) {
      const valueAttackState = valueAttackStates[i];
      if (valueAttackState >= 1 && valueStateAnimeArr[valueAttackState] >= 1) {
        target.startAnimation(valueStateAnimeArr[valueAttackState], true, value1);
        value1 += 1;
      }
    }
  }
}

//パーティレベルを一時記憶/呼び出し
party_levelSaveLoad = function (id1) {

  if (id1 == 0) {
    valuePartyMainLv = Array(21).fill(0);
    valuePartySubLv = Array(21).fill(0);
    var start = $gameVariables.value(75);
    var end = $gameVariables.value(76);
    for (var i = start; i <= end; i++) {
      actor = $gameActors.actor(i);
      if ($gameParty.members().contains(actor)) {
        valuePartyMainLv[i] = actor.level;
        if (actor.subclass()) {
          valuePartySubLv[i] = actor.classLevel(actor._subclassId);
        };
      };
    };
  };
  if (id1 == 1) {
    var value2 = 0;
    for (var i = 0; i <= valuePartyMainLv.length - 1; i++) {
      if (valuePartyMainLv[i] >= 1) {
        actor = $gameActors.actor(i);
        if (actor.level > valuePartyMainLv[i]) {
          var value1 = `\\C[2]${actor.name()}\\C[0]のメインジョブ\\C[14]<${$dataClasses[actor._classId].name}>\\C[0]Lvが\\C[10]${actor.level - valuePartyMainLv[i]}\\C[0]上がった！ (${actor.level})`;
          CommonPopupManager.showInfo({}, value1, null);
          var value2 = 1;
        };
      };
    };
    if (value2 == 1) {
      $gamePlayer.requestAnimation(297);
    };
  };
  if (id1 == 2) {
    var value2 = 0;
    for (var i = 0; i <= valuePartyMainLv.length - 1; i++) {
      if (valuePartySubLv[i] >= 1) {
        actor = $gameActors.actor(i);
        if (actor.classLevel(actor._subclassId) > valuePartySubLv[i]) {
          var value1 = `\\C[2]${actor.name()}\\C[0]のサブジョブ\\C[14]<${$dataClasses[actor._subclassId].name}>\\C[0]Lvが\\C[10]${actor.classLevel(actor._subclassId) - valuePartySubLv[i]}\\C[0]上がった！ (${actor.classLevel(actor._subclassId)})`;
          CommonPopupManager.showInfo({}, value1, null);
          var value2 = 1;
        };
      };
    };
    if (value2 == 1) {
      $gamePlayer.requestAnimation(297);
    };
  };

};

actor_custom_replace_attack = function (user, id1, id2) {
  const userStateAffected64 = user.isStateAffected(64);
  return (userStateAffected64 || user.isStateAffected(63))
    ? (userStateAffected64 || user.isLearnedSkill(66) ? id1 : id2)
    : actor_custom_replace_attack_sub(user);
};

const attackIdsMapAcraSub = {
  1: 101,
  2: 111,
  3: 121,
  4: 131,
  5: 141,
  6: 151,
  7: 161,
  8: 171,
  9: 181,
  10: 191
};
actor_custom_replace_attack_sub = function(user) {
  // Early return if no weapon equipped
  const firstEquippedItemId = user._equips[0]._itemId;
  if (firstEquippedItemId < 1) {
    return 1;
  }
  
  // Get the weapon data once
  const firstWeapon = $dataWeapons[firstEquippedItemId];
  
  // Check for special attack override from weapon metadata
  const specialAttackMeta = firstWeapon.meta['SpecialAttack'];
  if (specialAttackMeta) {
    const specialAttackId = Number(specialAttackMeta);
    if (specialAttackId >= 1) {
      return specialAttackId;
    }
  }
  
  // Find base attack ID from equipped weapon type
  let attackId = 1;
  for (let typeId = 1; typeId <= 10; typeId++) {
    if (user.isWtypeEquipped(typeId)) {
      attackId = attackIdsMapAcraSub[typeId] || 1;
      break;
    }
  }
  
  // Apply state and skill modifiers
  // Using addition instead of multiple increments for better performance
  attackId += (user.isStateAffected(283) ? 6 : 0) +
              (user.isStateAffected(282) ? 5 : 0) +
              (user.isLearnedSkill(attackId + 4) ? 4 : 0) +
              (user.isLearnedSkill(attackId + 3) ? 3 : 0) +
              (user.isLearnedSkill(attackId + 2) ? 2 : 0) +
              (user.isLearnedSkill(attackId + 1) ? 1 : 0);
              
  return attackId;
};

actor_custom_replace_guard = function (user) {
  const userEquips0ItemId = user._equips[0]._itemId;
  if (userEquips0ItemId >= 1 && user.tp >= 100) {

    const weapon0 = $dataWeapons[userEquips0ItemId];
    const weapon0trait0 = weapon0.traits[0];
    if (weapon0trait0 !== undefined) return weapon0trait0.dataId;

    const weapon0MetaSpecialOugi = weapon0.meta['SpecialOugi'];
    if (weapon0MetaSpecialOugi) {
      const weapon0MetaSpecialOugiNum = Number(weapon0MetaSpecialOugi);
      if (weapon0MetaSpecialOugiNum >= 1) {
        return weapon0MetaSpecialOugiNum;
      };
    };

    if (weapon0.meta['UniqueOugi']) {
      var gameVariablesValue287UserActorId9 = $gameVariables.value(287)[user.actorId()][9];
      if (gameVariablesValue287UserActorId9 >= 1) {
        return gameVariablesValue287UserActorId9;
      };
    };
  };

  return 2;
};

actor_custom_replace_guard1 = function (user) {
  const userEquips0ItemId = user._equips[0]._itemId;
  if (userEquips0ItemId >= 1 && user.tp >= 100) {
    if (user.isWtypeEquipped(1)) { return 501 }
    else if (user.isWtypeEquipped(2)) { return 502 }
    else if (user.isWtypeEquipped(3)) { return 503 }
    else if (user.isWtypeEquipped(4)) { return 504 }
    else if (user.isWtypeEquipped(5)) { return 505 }
    else if (user.isWtypeEquipped(6)) { return 506 }
    else if (user.isWtypeEquipped(7)) { return 507 }
    else if (user.isWtypeEquipped(8)) { return 508 }
    else if (user.isWtypeEquipped(9)) { return 509 }
    else if (user.isWtypeEquipped(10)) { return 510 };

    const weapon0MetaSpecialOugi = $dataWeapons[userEquips0ItemId].meta['SpecialOugi'];
    if (weapon0MetaSpecialOugi) {
      return Number(weapon0MetaSpecialOugi)
    };
  };

  return 2;
};

//ボス行動コモン内予測計算
//boss_actionPredict = function(value1){

//};

//})();
