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
    recordSubjugationBattleRefactor(user, isInBattle);
  }
  const drops = get_item_drop_data(user);
  const sources = [$dataItems, $dataWeapons, $dataArmors];
  const dropUpItem = $dataItems[valueItemDropUpItem];
  const messages = [];
  const origin = isInBattle && drops.length ? getDropOriginBattleRefactor(user) : null;
  for (const drop of drops) {
    if (!drop) continue;
    valueDropCount1 = drop_probabilityCalculation2(user, Number(drop[0]), dropUpItem);
    if (valueDropCount1 != 1) continue;
    const sourceKind = Number(drop[1]);
    const itemId = Number(drop[2]);
    const source = sources[sourceKind];
    const item = source && source[itemId];
    if (!item) continue;
    if (isInBattle) {
      showBattleDropBattleRefactor(item, sourceKind, origin);
    } else if (isDuringStripping || isDuringRipping) {
      grantFootpadDropBattleRefactor(sourceKind, itemId);
    } else if (itemId >= 1) {
      recordPlainDropBattleRefactor(item, messages);
    }
  }
  valueWordSet1 += messages.join('');
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
  if (!setDropEnemyLevelBattleRefactor(user)) return [];
  const drops = [];
  appendPowerAndElementDropsBattleRefactor(user, drops);
  for (const group of battleRefactorStateDropGroups) {
    const stateId = group[0];
    appendStateDropCopiesBattleRefactor(user, stateId, group[1], drops);
    if (stateId === 454 && user.isStateAffected(454)) {
      appendStateDropCopiesBattleRefactor(user, 465, [[3, 0, 1289]], drops);
    }
    if (stateId === 448) appendArmorAndLevelDropsBattleRefactor(user, drops);
  }
  if (user.isStateAffected(475)) drops.push([6, 0, 151]);
  appendRaceDropsBattleRefactor(user, drops);
  return drops;
}

allAnimeattack_move1 = function () { allAnimeattack_moveBase(false); }

allAnimeattack_move2 = function () { allAnimeattack_moveBase(true); }

allAnimeattack_moveBase = function (isMove2) {

  const max = !$gameSwitches.value(464) ? 8 : 4;
  const stepShift = max == 8 ? (isMove2 ? -100 : 100) : (isMove2 ? 350 : -350);
  const dashShift = max == 8 ? (isMove2 ? -350 : 350) : (isMove2 ? 200 : -200);
  const shift = $gameVariables.value(182) == 11 ? stepShift : dashShift;
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

    // Flash/shake parameters. `hitIndex == 1` computes them; `hitIndex == 2`
    // reuses whatever they hold (the initial values) for its own flash/shake.
    const fx = { shakeIntensity: 0, shakeSpeed: 4, duration: 10 };
    const flashColorData = getFlashColorDataDamageKeisan1();
    flashColorData[3] = FLASH_OPACITY_DAMAGE_KEISAN1;

    if (hitIndex == 1) {
      applyFirstHitEffectsDamageKeisan1(user, target, critAnimationId, damageAmount, flashColorData, damageHitCount, fx);
    }
    // A missing animation id aborts this hit before any damage is applied.
    const animDelay = (animationId >= 1 && hitIndex >= 2)
      ? resolveAnimDelayDamageKeisan1(animationId, hitIndex)
      : 0;
    if (animDelay === null) continue;
    // NOTE: the <BattleAddAttackSet:50> bonus block that used to sit here was dead
    // — nothing ever set valueBattleAddAttackSet — so it has been removed rather
    // than left commented out.
    if (hitIndex >= 2) {
      let randomOffset = getRandomIndex(41) - 20;
      randomOffset = Math.round(damageAmount * randomOffset / 100);
      target.gainHp(-damageAmount - randomOffset);
      target.startDamagePopup();
    }
    // hitIndex == 2 implies hitIndex >= 2, so this stays after the damage above.
    if (hitIndex == 2) {
      $gameScreen.startFlash(flashColorData, fx.duration);
      $gameScreen.startShake(fx.shakeIntensity, fx.shakeSpeed, fx.duration);
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

// The animation delay for a repeated hit, or null when the animation id is set
// but missing from the database (the caller then skips the whole hit).
// The delay tier comes from a marker character in the animation name.
function resolveAnimDelayDamageKeisan1(animationId, hitIndex) {
  const animation = $dataAnimations[animationId];
  if (!animation) return null;
  const animFramesLength = animation.frames.length;
  let maxAnimationDelay = 4;
  if (animation.name.match(/!/)) { maxAnimationDelay = 1 }
  else if (animation.name.match(/&/)) { maxAnimationDelay = 2 }
  else if (animation.name.match(/$/)) { maxAnimationDelay = 3 };
  return Math.ceil((animFramesLength * 4 / 5) * maxAnimationDelay / 4) * (hitIndex - 1);
}

const FLASH_OPACITY_DAMAGE_KEISAN1 = 50;

// Returns the flash colour array stored in game variable 331 (creating it on the
// first hit). The caller overwrites index 3 with FLASH_OPACITY_DAMAGE_KEISAN1.
function getFlashColorDataDamageKeisan1() {
  if ($gameVariables.value(331)) return $gameVariables.value(331);
  const flashColorData = [200, 0, 0, FLASH_OPACITY_DAMAGE_KEISAN1];
  $gameVariables.setValue(331, flashColorData);
  return flashColorData;
}

// The `hitIndex == 1` branch of damage_keisan1: crit animation, the state-damage
// formula, the shockwave filter and the closing screen flash/shake. The shake
// values are written into `fx` because the `hitIndex == 2` branch reads them.
//
// NOTE: v1.46 also tracked a local `flashOpacity` here and decremented /
// incremented it, but never copied it back into flashColorData[3], so the flash
// opacity has always been a constant. The dead writes are not reproduced.
function applyFirstHitEffectsDamageKeisan1(user, target, critAnimationId, damageAmount, flashColorData, damageHitCount, fx) {
  if (target.result().critical) {
    if (user.isActor()) {
      $gameVariables.value(380 + user.actorId())[68] += 1;
    }
    if (!(target.hp <= 0 && valueCollapseAnime >= 1)) {
      target.startAnimation(critAnimationId, true, 0);
    }
  }
  if (target.hp != 0 && valueTotalDamageCount2 == 0) {
    battle_stateAnime1(target);
  }
  if (target.isActor() && damageAmount >= target.mhp / 2) {
    state_addFormula1([41, 25, user, target, user.mdf, target.luk]);//負傷ステート
  }
  if (damageAmount >= target.mhp / 10) {
    applyShockwaveFilterDamageKeisan1(target, damageAmount);
  }

  fx.duration = 10;
  if (target.mhp / 100 >= damageAmount) {
    fx.shakeIntensity = 130;
    fx.duration -= 5;
    fx.shakeSpeed -= 3;
  } else if (target.mhp <= damageAmount) {
    fx.shakeIntensity += 1;
    fx.duration += 5;
    fx.shakeSpeed += 2;
  }
  if (damageHitCount >= 2) {
    fx.duration += damageHitCount * 3;
  }
  $gameScreen.startFlash(flashColorData, fx.duration);
  $gameScreen.startShake(fx.shakeIntensity, fx.shakeSpeed, fx.duration);
}

// The >= mhp/10 shockwave filter, with its intensity/radius tiers.
function applyShockwaveFilterDamageKeisan1(target, damageAmount) {
  const isActor = target.isActor();
  const targetGroup = isActor ? $gameParty : $gameTroop;
  const positionYOffset = isActor ? -24 : -100;
  const targetIndex = target.index();
  const filterId = 'wave_' + targetIndex;
  const filterX = targetGroup.getX(targetIndex + 1);
  const filterY = targetGroup.getY(targetIndex + 1) + positionYOffset;
  let shockwaveIntensity = 50;
  let shockwaveRadius = 30;
  let shockwaveDurationMultiplier = 0.05;
  if (damageAmount >= target.mhp / 10 * 3) {
    shockwaveIntensity = 100;
    shockwaveRadius = 40;
  }
  if (damageAmount >= target.mhp / 2) {
    shockwaveIntensity = 150;
    shockwaveRadius = 50;
  }
  if (damageAmount >= target.mhp) {
    shockwaveIntensity = 200;
    shockwaveDurationMultiplier = 0.06;
  }
  $gameMap.createFilter(filterId, 'shockwave', 0, 'screen');
  $gameMap.setFilter(filterId, [filterX, filterY, -1, shockwaveRadius, shockwaveIntensity, 1]);
  $gameMap.setFilterAddiTime(filterId, shockwaveDurationMultiplier);
}

//スキルパワー加算計算skill_addPowerSet(user,$dataSkills,1,1);
// Returns the total skill-power bonus in percent.
//
// The total is also published as valueAddPowerCustom because js/plugins/SkillFormula.js
// adds it to the level inside its damage formula, and the stats text builders read it
// right after calling this. The accumulation itself uses a local, so a re-entrant call
// can no longer corrupt a partially built total.
skill_addPowerSet = function (user, dbEntries, dbEntryId, powerCategoryId) {

  let addPowerCustom = 0;
  if (user.isActor()) {
    const equippedSkillIds = new Set(user.battleSkillsRaw());
    addPowerCustom += sumAddPowerCustomSkillAddPowerSet(valueAddPowerCustomSkill,
      (id) => user.isLearnedSkill(id) && equippedSkillIds.has(id),
      (id) => $dataSkills[id],
      (id) => ($dataSkills[id].meta['Max Mastery Level'] ? user.skillMasteryLevel(id) : 0));
    addPowerCustom += sumAddPowerCustomSkillAddPowerSet(valueAddPowerCustomWeapon,
      (id) => user.hasWeapon($dataWeapons[id]),
      (id) => $dataWeapons[Number(id)]);
    addPowerCustom += sumAddPowerCustomSkillAddPowerSet(valueAddPowerCustomArmor,
      (id) => user.hasArmor($dataArmors[id]),
      (id) => $dataArmors[id]);
  };
  addPowerCustom += sumAddPowerCustomSkillAddPowerSet(valueAddPowerCustomState,
    (id) => user.isStateAffected(id),
    (id) => $dataStates[id]);

  const entry = dbEntries[dbEntryId];
  if (powerCategoryId != 2 && entry && entry.stypeId == 12) {
    addPowerCustom += burstEquipmentPowerBattleRefactor(user, entry);
  }
  // NOTE: <BattleAddAttackSet:50> is an unused tag — the block that summed it into
  // valueBattleAddAttack was removed rather than left commented out.
  valueAddPowerCustom = addPowerCustom;
  return addPowerCustom;

};

// The bonus stored for a <ユニーク> skill in variable 287, or 0 when it is below
// 1 (the original simply added nothing in that case).
function uniqueBonusSkillAddPowerSet(user) {
  const bonus = $gameVariables.value(287)[user.actorId()][10];
  return bonus >= 1 ? bonus : 0;
}

// Sums <AddPowerCustom> over `ids`. `isEligible` decides whether an id counts,
// `entryOf` resolves the database entry holding the meta, and `bonusOf`
// optionally adds a per-id mastery bonus.
function sumAddPowerCustomSkillAddPowerSet(ids, isEligible, entryOf, bonusOf) {
  let total = 0;
  for (let i = 0; i <= ids.length - 1; i++) {
    const id = ids[i];
    if (!isEligible(id)) continue;
    const entry = entryOf(id);
    if (!entry) continue;
    total += Number(entry.meta['AddPowerCustom']);
    if (bonusOf) total += bonusOf(id);
  }
  return total;
}

//攻撃時に連撃計算とスキルID代入
// 40 = 攻撃前表示に使う立ち絵のピクチャ(下のBATTLE_STANDING_PICTURE_ID)
const ak1PicIdsToErase = [40, 51, 52, 53, 54, 55, 56, 57, 58, 86, 87, 88, 89, 90, 91, 92, 93, 98, 99];
const ak1ElementIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 34];
const ak1ElementDisplayValues = [131, 133, 135, 137, 139, 141, 143, 145, 147, 367, 369, 147, 149, 371, 373, 375, 377, 379, 381, 383, 385, 387, 389, 130];
const ak1DamageFlashDesignationData = [255, 255, 255, 0];
// uses globals like valueCertainlyDouble, valueCertainlyTriple, valueNormalAttackHit, and valueAttackAbilityHit without explicit declaration
// 
attack_keisan1 = function (user, skillId, sourceTypeId) {
  // Initialize attack variables and clean up UI. The database the skill lives in
  // is resolved once here and handed to every step below, so no step has to
  // reach for a global to find it.
  const sourceDatabase = ak1InitializeAttackVariables(user, skillId, sourceTypeId);
  ak1CleanupPreviousAttackUI();

  // Set up the skill and its properties
  ak1SetupSkillProperties(user, sourceDatabase, skillId, sourceTypeId);

  // Calculate multi-attack count.
  // The result is not consumed anywhere today (the executed hit count comes from
  // game variable 526) and is deliberately left unused so the calculation and its
  // random draws stay exactly as they were.
  ak1CalculateMultiAttackCount(user);

  // Configure animation settings
  ak1ConfigureAnimationSettings(sourceDatabase, skillId);

  // Set up attack states and elements
  const attackElements = ak1SetupAttackStatesAndElements(user, sourceDatabase, skillId);

  // Handle damage visualization and special effects
  ak1ConfigureDamageVisualization(user, sourceDatabase, skillId, attackElements);

  // Process skill-specific movement and projectile settings
  ak1ProcessSkillSpecialSettings(user, sourceDatabase, skillId);

  // Handle mastery progression and brave command
  ak1ProcessSkillMasteryAndBraveCommand(user, skillId);

  // Apply final skill customization
  ak1ApplyFinalSkillCustomization(user, sourceDatabase, skillId);
};

// Initialize attack variables and set source
// Returns the database the current skill lives in ($dataItems or $dataSkills), so
// the rest of the setup pipeline receives it instead of reading the implicit
// global `sourceItems` this function used to assign.
function ak1InitializeAttackVariables(user, skillId, sourceTypeId) {
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

  return sourceTypeId == 2 ? $dataItems : $dataSkills;
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
function ak1SetupSkillProperties(user, sourceDatabase, skillId, sourceTypeId) {
  // skill_addPowerSet's total is consumed through the valueAddPowerCustom global
  // (js/plugins/SkillFormula.js and the stats text builders read it), so it is not
  // threaded through here.
  skill_addPowerSet(user, sourceDatabase, skillId, sourceTypeId);
  const currentItem = sourceDatabase[skillId];

  $gameVariables.setValue(182, currentItem.stypeId);
  valueSkillDamageType = currentItem.damage.type;
}

// Calculate how many attacks will be performed
// Returns the multi-attack count (previously accumulated into a leaked global).
function ak1CalculateMultiAttackCount(user) {
  let multiAttackCount = 1;
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
  return ak1ApplyGuaranteedMultiAttacks(user, multiAttackCount);
}

// Apply guaranteed double and triple attacks from states
function ak1ApplyGuaranteedMultiAttacks(user, multiAttackCount) {
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
    if (isAnyStateAffected(attackType.states, user)) {
      multiAttackCount += attackType.addCount;
    }
  }
  return multiAttackCount;
}

// True when `battler` is affected by any of `stateIds`. A plain loop rather than
// Array#some, so that no closure is allocated per call inside the loops above.
function isAnyStateAffected(stateIds, battler) {
  for (const stateId of stateIds) {
    if (battler.isStateAffected(stateId)) return true;
  }
  return false;
}

// True when the comma-split `list` contains `value` as a number. Same reason as
// isAnyStateAffected: no per-iteration closure.
function listContainsNumber(list, value) {
  for (const entry of list) {
    if (Number(entry) === value) return true;
  }
  return false;
}

// Configure animation settings for the skill
function ak1ConfigureAnimationSettings(sourceDatabase, skillId) {
  const currentItem = sourceDatabase[skillId];
  $gameVariables.setValue(181, currentItem.animationId);
  const animation = $dataAnimations[currentItem.animationId];
  if (!animation) return;
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
// Returns the list of attack element ids (see ak1SetupAttackElements).
function ak1SetupAttackStatesAndElements(user, sourceDatabase, skillId) {
  const currentItem = sourceDatabase[skillId];

  // Get attack states and add skill effect states. The array is also published as
  // valueAttackStates, which the state-application step further down reads.
  const attackStates = user.attackStates();
  for (let i = 0; i <= 19; i++) {
    const effect = currentItem.effects[i];
    if (effect && effect.code == 21 && effect.dataId >= 2) {
      attackStates.push(effect.dataId);
    }
  }
  valueAttackStates = attackStates;

  // Handle level fluctuation. Published as a global because js/plugins/
  // SkillFormula.js reads valueLevelFluctuation from inside its damage formula.
  if (user.isStateAffected(410)) {
    if (currentItem.meta['LevelFluctuation']) {
      valueLevelFluctuation = Number(currentItem.meta['LevelFluctuation']);
    } else {
      valueLevelFluctuation = 0;
    }
  }

  // Set up attack elements
  return ak1SetupAttackElements(user, currentItem);
}

// Set up attack elements from skill and user properties
// Returns the assembled element id list (previously leaked as a global).
function ak1SetupAttackElements(user, currentItem) {
  const attackElementsList = [];

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

  return attackElementsList;
}

// Configure damage visualization based on elements and skill properties
function ak1ConfigureDamageVisualization(user, sourceDatabase, skillId, attackElementsList) {
  const currentItem = sourceDatabase[skillId];
  $gameVariables.setValue(93, 131); // Default damage visualization
  $gameVariables.setValue(526, 1); // Default hit count

  // Set damage visualization based on elements
  ak1ConfigureElementDamageVisualization(currentItem);

  // Configure special flash effect based on elements
  ak1ConfigureElementFlashEffect(user, attackElementsList);
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
      if (selectedElementId != ak1ElementIds[i]) continue;
      $gameVariables.setValue(93, ak1ElementDisplayValues[i]);
      $gameVariables.setValue(331, ak1DamageFlashDesignationData);
    }
  }
}

// Configure flash effect based on the user's elemental affinities
const testIds = new Set([3, 4, 5, 6, 7, 8, 9]);
function ak1ConfigureElementFlashEffect(user, attackElementsList) {
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
function ak1ProcessSkillSpecialSettings(user, sourceDatabase, skillId) {
  const currentItem = sourceDatabase[skillId];

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
  if (!user.isActor() || $gameVariables.value(182) != 2) return;
  const subclass = user.subclass();
  if (!subclass || !user.equips()[0]) return;
  const subclassIcon = Number($dataClasses[subclass.id].meta['Icon']);
  const weaponType = Number($dataWeapons[user.equips()[0].id].wtypeId);
  const mastery = ak1SubclassWeaponMastery[subclassIcon];
  if (!mastery || !mastery.weaponTypes.includes(weaponType)) return;
  const classRankNum = Number($dataClasses[subclass.id].meta['classRank']);
  user.gainSkillMasteryUses(skillId, mastery.value * classRankNum);
}

// Process brave command state updates for Lisha (actor 1)
function ak1ProcessBraveCommandState(abilityUsageDistinction) {
  const actor1 = $gameActors.actor(1);
  if (!$gameParty.members().contains(actor1) || !actor1.isStateAffected(662)) return;

  const stateCounter = actor1._stateCounter[662];
  for (let i = 0; i < 4; i++) {
    if (abilityUsageDistinction != i + 5) continue;
    if (stateCounter[i] < 0 || stateCounter[i] > 4) continue;
    stateCounter[i] += 1;
  }
}

// Apply final skill customization based on metadata and skill type
function ak1ApplyFinalSkillCustomization(user, sourceDatabase, skillId) {
  const currentItem = sourceDatabase[skillId];
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
// Renamed from Element_DebuffRateA: the A/R suffix carried no meaning and the
// function is only ever called from a <Custom Apply Effect> notetag. See
// state_removeElementDebuffRate below for the removal counterpart.
state_applyElementDebuffRate = function (target, stateId) {
  const state = $dataStates[stateId];
  const resistanceState = resistanceStateBattleRefactor(target);
  if (!state || !resistanceState) return;
  const elementId = Number(state.meta.ElementId);
  const debuffRate = Number(state.meta.DebuffRate) / 100;
  if (!Number.isFinite(elementId) || !Number.isFinite(debuffRate) || debuffRate < -1) return;
  const counter = Number(target._stateCounter[stateId]);
  if (!Number.isFinite(counter)) target.setStateCounter(stateId, 0);
  resistanceState.traits.push({ code: 11, dataId: elementId, value: 1 + debuffRate, amygameElementDebuffStateId: stateId });
  target.addStateCounter(stateId, debuffRate);
};

//属性耐性ダウン解除
// Renamed from Element_DebuffRateR (see state_applyElementDebuffRate above).
state_removeElementDebuffRate = function (target, stateId) {
  const resistanceState = resistanceStateBattleRefactor(target);
  if (resistanceState) {
    const traits = resistanceState.traits;
    for (let index = traits.length - 1; index >= 0; index--) {
      if (traits[index].amygameElementDebuffStateId === stateId) traits.splice(index, 1);
    }
  }
  target.removeStateCounter(stateId);
};

//ステート付与時のアクション
//
// Renamed from state_addEffect1. This is the shared "<Custom Apply Effect>"
// entry point referenced by ~200 states in data/states.json: it registers the
// state in the per-battler resistance slot, chains the <stateAddState:...>
// reactions and plays the animation / name popup. The trailing "1" was a
// meaningless copy-paste index, so it was dropped; every call site in
// data/states.json was renamed with it.
const defaultPopupColorArray = [255, 128, 0, 255, 256];
const alternativePopupColorArray = [255, 0, 187, 189, 256];
state_applyCommonEffect = function (user, target, stateId, animationId) {
  if ($gameTroop.isAllDead() || !$gameParty.inBattle()) return;
  const state = $dataStates[stateId];
  if (!state) return;
  const category = normalizedStateCategoryBattleRefactor(state);
  const isAbnormal = category === 'StateabNomal' || category === 'StateSPabNomal';
  if (!category || isAbnormal) addAccumulatedStateResistanceBattleRefactor(target, stateId, state);
  applyReactiveStatesBattleRefactor(target);
  if (ConfigManager.battleAniSpeed < 3) return;
  playStateAnimationBattleRefactor(target, animationId);
  target.startMessagePopup(state.name, isAbnormal ? alternativePopupColorArray : defaultPopupColorArray);
};

//ステート解除時のアクション
//
// Renamed from state_removeEffect1: the removal counterpart of
// state_applyCommonEffect above (animation + "was removed" battle-log line).
state_removeCommonEffect = function (user, target, stateId, animationId) {
  target.removeStateCounter(stateId);
  if ($gameTroop.isAllDead() || !$gameParty.inBattle() || ConfigManager.battleAniSpeed < 3) return;
  const state = $dataStates[stateId];
  if (!state) return;
  const category = normalizedStateCategoryBattleRefactor(state);
  const colorId = category === 'PowerUp' ? 2 : category ? 1 : 0;
  const ending = category && category !== 'PowerUp' ? '…' : ' ';
  playStateAnimationBattleRefactor(target, animationId);
  const actorName = target.name();
  const stateName = colorTaggedText(colorId, state.name);
  BattleManager._logWindow.push('addText', `${actorName}の${stateName}が解除された${ending}`);
};

//特殊効果ステート発動時のアクション
activate_specialState = function (user, stateId) {

  const stateMeta = $dataStates[stateId].meta;
  // Both tags gate the same way; only the pool they test and the message differ.
  if (stateMeta['activateRate']) {
    const rate = buildActivationThresholdActivateSpecialState(user, Number(stateMeta['activateRate']));
    applyActivationActivateSpecialState(user, user.mpRate() >= rate, Math.ceil(user.mmp * rate), 109);
  };
  if (stateMeta['activatePoint']) {
    const point = buildActivationThresholdActivateSpecialState(user, Number(stateMeta['activatePoint']));
    applyActivationActivateSpecialState(user, user.mp >= point, Math.ceil(point), 19);
  };

};

// The tag's base value, reduced by the mastery level of skill 746 and by 747/748.
function buildActivationThresholdActivateSpecialState(user, baseValue) {
  let threshold = baseValue;
  if (user.isLearnedSkill(746) && user.skillMasteryLevel(746) >= 1) {
    threshold -= baseValue * user.skillMasteryLevel(746) / 10;
  }
  if (user.battleSkillsRaw().includes(747)) threshold -= threshold * 2 / 10;
  if (user.battleSkillsRaw().includes(748)) threshold -= threshold * 49 / 100;
  return threshold;
}

// Pays `cost` MP and plays the activation animation, or flags the user as out of
// MP. `insufficientMpStateId` only picks which \SIM[n] icon the message shows.
function applyActivationActivateSpecialState(user, canActivate, cost, insufficientMpStateId) {
  if (!canActivate) {
    const userName = user.name();
    const stateName = `\\SIM[${insufficientMpStateId}]`;
    const insufficientMpMessage = `${userName}はMPが足らず${stateName}になった…`;
    BattleManager._logWindow.push(`addText`, insufficientMpMessage);
    user.startAnimation(275, true, 0);
    user.addState(109);
    return;
  }
  user.startAnimation(615, true, 0)
  user.gainMp(-cost);
  user.startDamagePopup();
  user.clearResult();
}

//チェインスキル実行267valueChainTotalStat,268valueChainMemberCount,30valueChainElement,29valueChainSkillId
chain_skill = function () {

  // Hoisted out of the loop: neither the party nor its states change in here.
  const battleMembers = $gameParty.battleMembers();
  for (let i = 0; i < battleMembers.length; i++) {
    if (!battleMembers[i].isStateAffected(234) || battleMembers[i].isRestricted()) continue;
    valueChainMemberCount += 1;
    // NOTE: battleMembers() and members() are not the same list — with a reserve
    // member parked in the middle the two index differently. Kept verbatim.
    valueChainTotalStat += $gameParty.members()[i].atk;
    valueChainTotalStat += $gameParty.members()[i].mat;
  };

  if (valueChainMemberCount < 2) return;

  const chainMember = findChainMemberChainSkill();
  if (chainMember) $gameVariables.setValue(20, chainMember.actorId());
  // Only assign on a match: valueChainElement is not reset here, so a stale
  // non-zero value must survive a call that finds no element.
  const chainElement = findChainElementChainSkill($gameActors.actor($gameVariables.value(20)));
  if (chainElement) valueChainElement = chainElement;
  valueChainSkillId = (valueChainElement == 0)
    ? 98
    : Number($dataStates[valueChainElement].meta['ChainID']);
  if (!$dataSkills[valueChainSkillId]) return;

  const chainSkill = $dataSkills[valueChainSkillId];
  // The skill is renamed to the variant matching how many members are chained.
  const chainNameKeys = { 2: '2rdChain', 3: '3rdChain' };
  const chainNameKey = chainNameKeys[valueChainMemberCount] || '4thChain';
  const hasChainName = chainSkill.meta['2rdChain'] || chainSkill.meta['3rdChain'] || chainSkill.meta['4thChain'];
  if (hasChainName) chainSkill.name = chainSkill.meta[chainNameKey];

  $gameVariables.setValue(267, valueChainTotalStat);
};

// The first chain-element state (49..56) the given actor is affected by, or 0.
function findChainElementChainSkill(actor) {
  for (let i = 49; i < 57; i++) {
    if (actor.isStateAffected(i)) return i;
  }
  return 0;
}

// The first battle member affected by the chain state (234), or null. The caller
// stores its actor id in variable 20.
function findChainMemberChainSkill() {
  const members = $gameParty.battleMembers();
  for (let i = 0; i < members.length; i++) {
    if (members[i].isStateAffected(234)) return members[i];
  }
  return null;
}

//攻撃防御時バストアップ表示$gameVariables.setValue(20,1); $gameVariables.setValue(520, [1,7]); 520→valueFaceSelect = 1;
battle_bustUp = function (basePictureId, baseMoveX, baseMoveY, baseDurationOffset) {
  const actorId = $gameVariables.value(20);
  const actor = $gameActors.actor(actorId);
  battle_bustUp1(actor, basePictureId, baseMoveX, baseMoveY, baseDurationOffset);
}

// 攻撃前の表示はトークフェイスのバストアップではなくTKM立ち絵で行う。トークフェイスは
// 統合衣装ごとに1枚絵しか持たず破損差分が無いため、衣装が破れても着たままに見える。
// 立ち絵は部位ごとの衣装から組まれるので常に現在の状態になる。
const BATTLE_STANDING_PICTURE_BASE_ID = 86;   // 攻撃前表示のバストアップ基準ピクチャID
const BATTLE_STANDING_PICTURE_ID = 40;        // 専用の立ち絵枠(TKMの立ち絵40番。アクターは21〜27しか使わない)
const BATTLE_STANDING_PICTURE_SLOT = BATTLE_STANDING_PICTURE_ID - 1;
const BATTLE_STANDING_PICTURE_SCALE = 105;     // %。90〜95で旧バストアップと同じ上半身の切り取り
const BATTLE_STANDING_PICTURE_X = 640;        // 旧バストアップの基準x。呼び出し元のオフセットで右へ寄る
// 立ち絵サイズ変更(変数120)と同じ規則で、倍率に比例して下へずらすと頭が画面上端に来る
const BATTLE_STANDING_PICTURE_Y = BATTLE_STANDING_PICTURE_SCALE * 9;
// 表情の部位(パーツ33)。tachie_settei1() は戦闘中ほぼ「気まずい」顔(4)を選ぶので、
// 攻撃前は与ダメージ表情(amygameTachie.js の damageFaceExpressionsMap[2])に固定する。
// 8 = 怒った目+開いた口。同じ目口の48は頬の赤みと汗の飛沫が描き込まれていて気まずく
// 見えるので使わない(赤みだけの差分画像は無い)。
const BATTLE_STANDING_PICTURE_FACE_SLOT = 33;
const BATTLE_STANDING_PICTURE_ATTACK_FACE = 8;

// 立ち絵を攻撃前表示として出す。表示できたらtrue(呼び出し側はトークフェイスを描かない)
function drawBattleStandingPicture(gameActor, horizontalShift, verticalShift, moveOffsetX, moveOffsetY, duration) {
  const tachieData = typeof $TKMvar === 'object' && $TKMvar !== null ? $TKMvar.tachie : null;
  if (!tachieData || !tachieData.CharList || !tachieData.PicData) return false;

  const actorId = gameActor.actorId();
  const characterName = 'actor' + actorId;
  // 立ち絵がまだ組まれていない(マップで一度も表示していない)時は従来の表示に任せる
  if (!(characterName in tachieData.CharList)) return false;

  const picData = tachieData.PicData[BATTLE_STANDING_PICTURE_SLOT];
  picData.picNum = BATTLE_STANDING_PICTURE_ID;
  picData.char = characterName;
  // 衣装と表情を今の状態から作り直す(CharList と、この枠のビットマップも更新される)
  refreshBattleStandingPictureParts(gameActor);
  // 値が変わらなかった部位は tachie_naibusyori1() では埋まらないので、枠ごと組み直す
  tachieData.preloadBitmap(BATTLE_STANDING_PICTURE_SLOT);
  eraseTalkfaceBustUpLayers(BATTLE_STANDING_PICTURE_BASE_ID);

  const startShiftX = isFinite(horizontalShift) ? horizontalShift : 0;
  const startShiftY = isFinite(verticalShift) ? verticalShift : 0;
  const scale = BATTLE_STANDING_PICTURE_SCALE;
  const targetX = BATTLE_STANDING_PICTURE_X + moveOffsetX;
  const targetY = BATTLE_STANDING_PICTURE_Y + moveOffsetY;

  $gameScreen.showPicture(BATTLE_STANDING_PICTURE_ID, 'TKMtachie_' + characterName + '_', 1,
    BATTLE_STANDING_PICTURE_X + startShiftX, BATTLE_STANDING_PICTURE_Y + startShiftY + moveOffsetY,
    scale, scale, 255, 0);
  $gameScreen.movePicture(BATTLE_STANDING_PICTURE_ID, 1, targetX, targetY, scale, scale, 255, 0, duration + 10);
  tachie_bless(BATTLE_STANDING_PICTURE_ID, 1);

  // TEMP: shows the framing and the expression part the draw picked
  if (window.DEBUG_BATTLE_CLOTHES) {
    // CharList is indexed by layer, and layer n is part slot n+1 (partsNameArr = "1".."41")
    const parts = tachieData.CharList[characterName] || [];
    const partOfSlot = slot => parts[slot - 1];
    console.log('[standingPicture]', {
      actorId: actorId,
      pictureId: BATTLE_STANDING_PICTURE_ID,
      from: { x: BATTLE_STANDING_PICTURE_X + startShiftX, y: BATTLE_STANDING_PICTURE_Y + startShiftY + moveOffsetY },
      to: { x: targetX, y: targetY, scale: scale },
      expressionPart: partOfSlot(33),
      // 460+33 = 表情。上書き前の tachie_settei1() の選択(参考値)
      settei1Expression: $gameVariables.value(460 + BATTLE_STANDING_PICTURE_FACE_SLOT),
      coatPart: partOfSlot(28),
      torsoParts: { innerTop: partOfSlot(21), top: partOfSlot(23), top2: partOfSlot(25) }
    });
  }
  return true;
}

// 立ち絵の部位番号を作り直す。衣装だけでなく表情も tachie_settei1() に決めさせるので、
// マップの立ち絵と同じ見た目(破れた服・その場に合った表情)になる。
// tachie_settei3() と違い、アクター自身の立ち絵ピクチャには触らない。
function refreshBattleStandingPictureParts(gameActor) {
  // すべて amygameTachie.js / amygameSeiyoku.js 側の関数(このファイルより後で読み込まれる)
  if (typeof tachie_naibusyori1 !== 'function' || typeof tachie_settei1 !== 'function') return;
  if (typeof resetTemporaryClothingSlots !== 'function' || typeof copyClothingSlotsToWorkVariables !== 'function') return;
  if (typeof rosyutu_genkai1 !== 'function' || typeof rosyutu_genzai1 !== 'function') return;

  const actorId = gameActor.actorId();
  const actorClothingData = $gameVariables.value(actorId + 440);
  if (!actorClothingData) return;

  resetTemporaryClothingSlots();
  copyClothingSlotsToWorkVariables(actorClothingData);
  rosyutu_genkai1(gameActor);
  rosyutu_genzai1(actorId);
  // 衣装固定(23)中は立ち絵の衣装を組み替えない。tachie_settei3 と同じ条件
  if (!gameActor.isStateAffected(23)) tachie_settei1(gameActor);

  const characterName = 'actor' + actorId;
  // 部位1..40 = 衣装スロット1..40。460 = CLOTHING_PART_VAR_BASE_ID (amygameTachie.js)
  const workVarBase = 460;
  for (let partSlot = 1; partSlot <= 40; partSlot++) {
    tachie_naibusyori1(characterName, partSlot, $gameVariables.value(partSlot + workVarBase));
  }
  // 表情は tachie_settei1() の選択を上書きする(上のループの後でないと効かない)
  tachie_naibusyori1(characterName, BATTLE_STANDING_PICTURE_FACE_SLOT, BATTLE_STANDING_PICTURE_ATTACK_FACE);
}

// トークフェイスのバストアップ(8枚)が残っていれば消す
function eraseTalkfaceBustUpLayers(basePictureId) {
  for (let index = 0; index <= 7; index++) {
    const pictureId = basePictureId + index;
    if (!$gameScreen.picture(pictureId)) continue;
    tachie_bless(pictureId, 0);
    $gameScreen.erasePicture(pictureId);
  }
}

battle_bustUp1 = function (gameActor, basePictureId, baseMoveX, baseMoveY, baseDurationOffset) {
  if (!gameActor) {
    return;
  };
  // Get the acting actor's ID from the game variables
  if (!isGirl(gameActor)) {
    return;
  };

  // The bust-up layers are picked from the value*Cloth[] globals, and only
  // tachie_settei3() ever refreshes them. Nothing calls it in battle, so after
  // the clothes were torn the image kept drawing the intact outfit. Re-derive
  // them from the actor's current clothing array (440+actorId, the same slots
  // tachie_settei3 reads) so the image always matches the damaged state.
  // The literal is used on purpose: CLOTHING_ACTOR_DATA_VAR_BASE_ID lives in
  // amygameTachie.js, which is loaded after this file.
  if (typeof updateClothingGlobals === 'function') {
    updateClothingGlobals(gameActor, $gameVariables.value(gameActor.actorId() + 440));
  }
  if (window.DEBUG_BATTLE_CLOTHES) logBattleBustUpStateBattleBustUp(gameActor);

  // Setup picture motion and compute picture scale & vertical shift
  let pictureScale;
  let verticalShift;
  const result = setupScaleAndShiftBattleBustUpBattleBustUp();
  pictureScale = result.pictureScale;
  verticalShift = result.verticalShift;

  // Calculate horizontal adjustment based on battle state and switches
  const horizontalShift = calculateHorizontalAdjustmentBattleBustUpBattleBustUp();

  const actorId = gameActor.actorId();
  const moveOffsetX = baseMoveX;
  const moveOffsetY = baseMoveY;
  const extraMoveDuration = baseDurationOffset;
  const actorFaceBaseName = actorId + 'Actor_' + valueFaceSelect;

  // The pre-attack display uses the TKM standing picture instead of the talkface
  // bust-up: the talkface art has one image per outfit and no damaged variant, so
  // a heroine whose clothes were torn still looked fully dressed. The standing
  // picture is built from the per-slot clothing parts, so it is always current.
  // Everything else (H scenes, the choice portraits) keeps the talkface layers.
  const usedStandingPicture = basePictureId === BATTLE_STANDING_PICTURE_BASE_ID
    && drawBattleStandingPicture(gameActor, horizontalShift, verticalShift, moveOffsetX, moveOffsetY, extraMoveDuration);

  // Loop through each face image part (from 0 to 7)
  if (!usedStandingPicture) {
    for (let i = 0; i <= 7; i++) {
      processFaceImageBattleBustUpBattleBustUp(
        basePictureId, actorId, actorFaceBaseName, i,
        horizontalShift, verticalShift,
        moveOffsetX, moveOffsetY, pictureScale, extraMoveDuration
      );
    }
  }

  // Process hypnosis effect if actor is affected by hypnosis state (782). The eye
  // overlay is placed for the talkface layers, so it is skipped with the standing
  // picture (that path is the pre-attack display only).
  if (!usedStandingPicture) {
    processHypnosisEffectBattleBustUpBattleBustUp(
      basePictureId, gameActor,
      horizontalShift, verticalShift,
      moveOffsetX, moveOffsetY, pictureScale, extraMoveDuration
    );
  }

  if ($gameVariables.value(276) > 0) {
    picture_motion1("smooth", [0]);
  }
};

// TEMP: prints the layer inputs the bust-up is about to draw, so a real-game
// battle shows whether the clothing globals lag behind the clothing array.
function logBattleBustUpStateBattleBustUp(gameActor) {
  const actorId = gameActor.actorId();
  const clothing = $gameVariables.value(actorId + 440) || [];
  const exposure = ($gameVariables.value(actorId + 380) || [])[4];
  // the eight pictures this draw will show, null when the layer is hidden
  const layers = [];
  for (let index = 0; index <= 7; index++) {
    const resolved = getFaceImageNameBattleBustUp(actorId, index, actorId + 'Actor_' + valueFaceSelect);
    layers.push(resolved.showPictureFlag ? resolved.faceImageName : null);
  }
  console.log('[bustUp]', {
    actorId: actorId,
    exposure: exposure,
    brokenState62: gameActor.isStateAffected(62),
    // layers drawn: 0 Lining(2) 1 BackHair(4) 2 Cloth(41) 3 BustUp(41) 4 Coat(28) 7 FrontHair(32)
    globals: {
      lining: valueLiningCloth[actorId],
      backHair: valueBackHairCloth[actorId],
      cloth: valueBustUpCloth[actorId],
      bustUp: valueBustUpCloth2[actorId],
      coat: valueCoatCloth[actorId],
      frontHair: valueFrontHairCloth[actorId]
    },
    clothingArray: { item: clothing[0], coat: clothing[28], frontHair: clothing[32], totalCloth: clothing[41] },
    layers: layers
  });
}

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
  const result = getFaceImageNameBattleBustUp(actorId, index, faceImageName);
  faceImageName = result.faceImageName;
  const showPictureFlag = result.showPictureFlag;

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
      movePicturePartBattleBustUp(basePictureId + index, 640 + moveOffsetX, 384 + moveOffsetY, extraMoveDuration);
    }
    if (index == 3) {
      hcg_piston(basePictureId + index, 10, $gameParty.inBattle()  ? 2 : 1, 4);
    } else {
      tachie_bless(basePictureId + index, 3);
    }
  } else if ($gameScreen.picture(basePictureId + index)) {
    // A hidden layer is simply not drawn, but the copy from the previous draw
    // is still on screen - that is how the coat that had just been torn off
    // kept showing. The picture ids are stable (86..93), so stop its breath
    // animation and erase it.
    tachie_bless(basePictureId + index, 0);
    $gameScreen.erasePicture(basePictureId + index);
  }
}

// Moves one battle-bust picture part. Every part shares the same mode, zoom
// (100), opacity (255) and blend (0), and runs 10 frames longer than the offset.
function movePicturePartBattleBustUp(pictureId, x, y, extraMoveDuration) {
  $gameScreen.movePicture(pictureId, 1, x, y, 100, 100, 255, 0, extraMoveDuration + 10);
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
  const hypnosisImageName = `${gameActor.actorId()}ActorHypnosisEye_0`;
  
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
  
  movePicturePartBattleBustUp(99, targetX, targetY, extraMoveDuration);
  
  // Start the animation frame with fixed parameters
  $gameScreen.picture(99).startAnimationFrame(3, true, [1, 1, 1, 2]);
}

function getFaceImageNameBattleBustUp(actorId, index, baseFaceImageName) {
  let showPictureFlag = true;
  switch (index) {
    case 0:
      if (valueLiningCloth[actorId] >= 1) {
        baseFaceImageName = actorId + 'Actor' + "Lining" + valueLiningCloth[actorId];
      } else {
        showPictureFlag = false;
      }
      break;
    case 1:
      if (valueBackHairCloth[actorId] >= 1) {
        baseFaceImageName = actorId + 'Actor' + "BackHair" + valueBackHairCloth[actorId];
      } else {
        showPictureFlag = false;
      }
      break;
    case 2:
      if (valueBustUpCloth[actorId] >= 0) {
        baseFaceImageName = actorId + 'Actor' + "Cloth" + valueBustUpCloth[actorId];
      } else {
        showPictureFlag = false;
      }
      break;
    case 3:
      if (valueBustUpCloth2[actorId] >= 0) {
        baseFaceImageName = actorId + 'Actor' + "BustUp" + valueBustUpCloth2[actorId];
      } else {
        showPictureFlag = false;
      }
      break;
    case 4:
      if (valueCoatCloth[actorId] >= 1) {
        baseFaceImageName = actorId + 'Actor' + "Coat" + valueCoatCloth[actorId];
      } else {
        showPictureFlag = false;
      }
      break;
    case 5:
      baseFaceImageName = actorId + 'Actor_' + valueFaceSelect;
      break;
    case 6:
      return resolveCloudyEyeFaceImageNameBattleBustUp($gameActors.actor(actorId), actorId, baseFaceImageName);
    case 7:
      return resolveFrontHairFaceImageNameBattleBustUp($gameActors.actor(actorId), actorId, baseFaceImageName);
  }
  return { faceImageName: baseFaceImageName, showPictureFlag };
}

// Face index 6: states 781/783/785 select the "CloudyEye" 1/2/4 face, otherwise
// the picture is hidden. Returns the same shape as getFaceImageNameBattleBustUp.
function resolveCloudyEyeFaceImageNameBattleBustUp(actor, actorId, baseFaceImageName) {
  // BUGFIX: state 785 is handled below but was missing from this guard, so an
  // actor carrying only 785 fell through and hid the picture instead of showing
  // "CloudyEye4".
  const hasCloudyEye = actor.isStateAffected(781) || actor.isStateAffected(783) || actor.isStateAffected(785);
  if (!hasCloudyEye) return { faceImageName: baseFaceImageName, showPictureFlag: false };
  if (actor.isStateAffected(781)) baseFaceImageName = actorId + 'Actor' + "CloudyEye1";
  if (actor.isStateAffected(783)) baseFaceImageName = actorId + 'Actor' + "CloudyEye2";
  if (actor.isStateAffected(785)) baseFaceImageName = actorId + 'Actor' + "CloudyEye4";
  return { faceImageName: baseFaceImageName, showPictureFlag: true };
}

// Face index 7: state 784 selects "CloudyEye3", otherwise the front-hair face.
function resolveFrontHairFaceImageNameBattleBustUp(actor, actorId, baseFaceImageName) {
  if (actor.isStateAffected(784)) {
    return { faceImageName: actorId + 'Actor' + "CloudyEye3", showPictureFlag: true };
  }
  if (valueFrontHairCloth[actorId] < 0) {
    return { faceImageName: baseFaceImageName, showPictureFlag: false };
  }
  return { faceImageName: actorId + 'Actor' + "FrontHair" + valueFrontHairCloth[actorId], showPictureFlag: true };
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
  if (!gameActor) return;
  
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
  if (!boundActor) return;
  
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
    const actorName = partyMember.name();
    const boundActorName = boundActor.name()
    const logMessage = `${actorName}は${boundActorName}の拘束を解きに掛かった！`;
    BattleManager._logWindow.push('addText', logMessage);
    
    // Remove the bind state from the bound actor
    boundActor.removeState(63);
    
    // No need to continue checking other party members once one is found who can unbind
    break;
  }
};

//パーティメンバーが居る時に拘束解除時の反応。
actor_kousokukaijo3 = function (actorId) {
  const battleMembers = $gameParty.battleMembers();
  const rescuingMemberIndex = findRescuingMemberIndexBattleRefactor(battleMembers);
  if (rescuingMemberIndex === -1) return;
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  const partyMember = battleMembers[rescuingMemberIndex];
  const actorData = actor.actor();
  partyMember.removeState(89);
  actor.removeState(69);
  if ($dataSystem.optSideView) {
    placeRescueBattlersBattleRefactor(rescuingMemberIndex, $gameVariables.value(703));
  }
  const actorMeta = actorData.meta;
  const faceConfig = actorMeta.BindRemoveSuccessFace.split(',');
  const successMessages = actorMeta.BindRemoveSuccess.split(',');
  const successMessage = successMessages[getRandomIndex(successMessages.length)];
  const actorName = actor.name();
  $gameVariables.setValue(525, successMessage);
  BattleManager._logWindow.push('addText', `${actorName}は拘束から助け出された！`);
  $gameMessage.newPage();
  $gameMessage.setFaceImage(`${actorId}Actor${Number(faceConfig[0])}`, Number(faceConfig[1]));
  $gameMessage.add('\\V[525]');
  $gameVariables.setValue(703, 0);
};

//アビリティ後にＣＧ消去
const skillAfter1picEraseIds = [40, 51, 52, 53, 54, 55, 56, 57, 86, 87, 88, 89, 90, 91, 92, 93, 98, 99];
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
  // Slot 20 is the party actor, every other slot is a troop member, so the enemy
  // flag is "anything but 20". The previous `battlerActorId > 20` mislabelled the
  // troop members at indexes 0..19 as party actors, which then reached
  // actor-only code paths (passive_addCondition, title_battleUp).
  const user = (battlerActorId === 20)
    ? $gameActors.actor($gameVariables.value(20))
    : $gameTroop.members()[battlerActorId];
  if (!user) return;

  battle_xsarStatas1(user, battlerActorId !== 20);
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
    const headerText = buildHeaderTextBattleXsarStatas(user, isEnemy);
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
//連撃率 is element 11, and is shown at one tenth of the rate the other
//element lines use (see 詳細能力値[1]).
function calcChainRateBattleXsarStatas(user) {
  return Math.floor(user.elementRate(11) * 10);
}
// Variable 380+actorId holds the per-actor stat array. Enemies have no
// actorId(); the page is drawn for the currently acting actor, whose id sits in
// variable 20 - which is what the pre-refactor code read here too.
function actorStatSlotBattleXsarStatas(user) {
  const actorId = user.isActor() ? user.actorId() : $gameVariables.value(20);
  return $gameVariables.value(380 + actorId) || [];
}
function calcCritMultBonusBattleXsarStatas(user) {
  return user.criticalMultiplierBonus() * 100;
}
function calcStateRate(user, index) {
  return Math.floor(user.stateRate(index) * 100);
}

// `valueAttackAmplifysActorId` is indexed by the acting actor, which lives in
// variable 20. It is deliberately NOT `user.actorId()`: an enemy battler has no
// actorId(), and the pre-refactor code read variable 20 for the enemy page too.
function calcElementAmplifyBattleXsarStatas(user, index, includeBonus) {
  const base = Math.floor(user.elementAmplifyRate(index) * 100);
  if (!includeBonus) return base;
  return base + valueAttackAmplifysActorId[$gameVariables.value(20)][index];
}

function buildStatsTextPart1BattleXsarStatas(user) {  
  // Define the header
  const headerText = "詳細能力値";
  let statsTextPart1 = `\\C[2]${headerText}[1]\\C[0]\n`;
  
  // Add each stat line using the helper function
  statsTextPart1 += formatStatLine(636, "連撃率　  　", calcChainRateBattleXsarStatas(user));
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
  statsTextPart1 += formatStatLine(624, "ﾎﾟｰｼｮﾝ耐性率", actorStatSlotBattleXsarStatas(user)[58]);
  statsTextPart1 += formatStatLine(683, "通常異常耐性", calcStateRate(user, 15));
  statsTextPart1 += formatStatLine(684, "特殊異常耐性", calcStateRate(user, 30));
  
  return statsTextPart1;
}

function buildStatsTextPart2BattleXsarStatas(user, isEnemy) {
  let statsTextPart2 = "";
  statsTextPart2 += `\\C[2]詳細能力値[2]\\C[0]\n`;
  for (let i = 1; i <= 9; i++) {
    const elementIcon = amygame_elementIcon(i);
    const elementAmplifyValue = calcElementAmplifyBattleXsarStatas(user, i, true);
    let amplifyLabel = (i === 1 || i === 2) ? `威力率　` : `属性威力率`;
    statsTextPart2 += `\\C[16]\x1bI[${elementIcon[1]}]${$dataSystem.elements[i]}${amplifyLabel}:\\C[0]${elementAmplifyValue}%\n`;
  }
  for (let i = 1; i <= 9; i++) {
    const elementIcon = amygame_elementIcon(i);
    let resistanceLabel = (i === 1 || i === 2) ? `耐性率　` : `属性耐性率`;
    statsTextPart2 += `\\C[16]\x1bI[${elementIcon[1]}]${$dataSystem.elements[i]}${resistanceLabel}:\\C[0]${calcElementRateBattleXsarStatas(user, i)}%\n`;
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
      const skillName = `\\I[666]`;
      const skillMsgPrefix = colorTaggedText(16, `${skillName}スキル威力率`);
      statsTextPart3 += `${skillMsgPrefix}:+${valueAddPowerCustom}\n`;
    }
  }
  statsTextPart3 += formatStatLine(31, "奥義威力率　", calcElementAmplifyBattleXsarStatas(user, 10, true));
  statsTextPart3 += formatStatLine(673, "ｱﾋﾞﾘﾃｨ威力率", calcElementAmplifyBattleXsarStatas(user, 20, true));
  statsTextPart3 += formatStatLine(78, "会心威力率　", calcCritMultBonusBattleXsarStatas(user));
  statsTextPart3 += formatStatLine(480, "剣威力率　　", calcElementAmplifyBattleXsarStatas(user, 21, true));
  statsTextPart3 += formatStatLine(481, "短剣威力率　", calcElementAmplifyBattleXsarStatas(user, 22, true));
  statsTextPart3 += formatStatLine(482, "刀威力率　　", calcElementAmplifyBattleXsarStatas(user, 23, true));
  statsTextPart3 += formatStatLine(483, "杖威力率　　", calcElementAmplifyBattleXsarStatas(user, 24, true));
  statsTextPart3 += formatStatLine(484, "拳威力率　　", calcElementAmplifyBattleXsarStatas(user, 25, true));
  statsTextPart3 += formatStatLine(485, "槍威力率　　", calcElementAmplifyBattleXsarStatas(user, 26, true));
  statsTextPart3 += formatStatLine(486, "斧威力率　　", calcElementAmplifyBattleXsarStatas(user, 27, true));
  statsTextPart3 += formatStatLine(487, "銃威力率　　", calcElementAmplifyBattleXsarStatas(user, 28, true));
  statsTextPart3 += formatStatLine(488, "弓威力率　　", calcElementAmplifyBattleXsarStatas(user, 29, true));
  statsTextPart3 += formatStatLine(489, "楽器威力率　", calcElementAmplifyBattleXsarStatas(user, 30, true));
  // 神聖邪悪耐性率表示 (if needed)
  // if (false) { ... }
  return statsTextPart3;
}

const NORMAL_STATE_CATEGORY_JP = ' StateabNomal';
const SPECIAL_STATE_CATEGORY_JP = ' StateSPabNomal';
// The state whose rate counts as the "default" for each listed category; a state
// whose rate equals its category default is not worth listing.
const DEFAULT_STATE_ID_NORMAL = 15;
const DEFAULT_STATE_ID_SPECIAL = 30;

// State resistances that differ from the category default, one line each.
function buildStateResistanceLinesBattleXsarStatas(user) {
  const resistanceJP = "耐性率";
  const nullifyJP = "無効化";
  let lines = "";
  for (let i = 1; i <= $dataStates.length - 1; i++) {
    const state = $dataStates[i];
    if (!state || !state.meta) continue;
    const category = state.meta['Category'];
    const isNormalCategory = category === NORMAL_STATE_CATEGORY_JP;
    const isSpecialCategory = category === SPECIAL_STATE_CATEGORY_JP;
    if (!isNormalCategory && !isSpecialCategory) continue;

    if (user.isStateResist(i)) {
      lines += `\x1bI[${state.iconIndex}]${state.name}:\\C[2][${nullifyJP}]\\C[0]\n`;
      continue;
    }
    if (user.stateRate(i) === 1.0) continue;
    const defaultStateId = isNormalCategory ? DEFAULT_STATE_ID_NORMAL : DEFAULT_STATE_ID_SPECIAL;
    if (user.stateRate(i) === user.stateRate(defaultStateId)) continue;
    lines += `\x1bI[${state.iconIndex}]${state.name}${resistanceJP}:${calcStateRate(user, i)}%\n`;
  }
  return lines;
}

// Elements the enemy amplifies: the 特攻率 list.
function buildSpecialAttackLinesBattleXsarStatas(user) {
  const specialAttackJP = "特攻率";
  let lines = "";
  attackElementIdsBattleXsarStatas.forEach(function (elementId) {
    if (user.elementAmplifyRate(elementId) === 0) return;
    // Column 0 of the icon table is a flag (1 = use the element name instead of
    // an icon); the icon itself is in column 1. Using column 0 here drew icon
    // 0/1 instead of the element icon.
    const elementIcon = amygame_elementIcon(elementId);
    lines += `\\C[16]\x1bI[${elementIcon[1]}]${specialAttackJP}:\\C[0]${calcElementAmplifyBattleXsarStatas(user, elementId, false)}%\n`;
  });
  return lines;
}

// Element rates the party member resists, excluding the nine shown in [2].
function buildElementResistanceLinesBattleXsarStatas(user) {
  const resistanceJP = "耐性率";
  let lines = "";
  for (let i = 1, endE = $dataSystem.elements.length - 1; i <= endE; i++) {
    if (elemIdsBattleXsarStatas.indexOf(i) >= 0) continue;
    if (user.elementRate(i) === 1) continue;
    const elementIcon = amygame_elementIcon(i);
    const icon = elementIcon[0] === 1 ? `${$dataSystem.elements[i]}` : `\x1bI[${elementIcon[3]}]`;
    lines += `\\C[16]${icon}${resistanceJP}\\C[0]:${calcElementRateBattleXsarStatas(user, i)}%\n`;
  }
  return lines;
}

function buildStatsTextPart4BattleXsarStatas(user, isEnemy) {
  const body = isEnemy
    ? buildSpecialAttackLinesBattleXsarStatas(user)
    : buildElementResistanceLinesBattleXsarStatas(user);
  const resistanceLines = buildStateResistanceLinesBattleXsarStatas(user);
  return `\\C[2]詳細能力値[4]\\C[0]\n${resistanceLines}${body}`;
}

function buildHeaderTextBattleXsarStatas(user, isEnemy) {
  if (isEnemy) return user.name();

  const classInfo = user.subclass()
    ? `[${$dataClasses[user._classId].name}/${$dataClasses[user._subclassId].name}]`
    : `${$dataClasses[user._classId].name}`;

  let additionalInfo;
  if ($gameParty.inBattle()) {
    // BUGFIX: v1.46 read `user.maximumHealing() - user.maximumHealing() - user.maximumHealing()`,
    // i.e. the negated cap, so H.cap rendered as "-5000" next to a positive D.cap.
    // YEP_DamageCore's maximumHealing() already returns the positive cap.
    additionalInfo = `\\C[16]BuffLimit:\\C[0]${user.maxBuffLimit(2)} \\C[16]D.cap:\\C[0]${user.maximumDamage()} \\C[16]H.cap:\\C[0]${user.maximumHealing()}`;
  } else {
    const headerJP = "役職:";
    additionalInfo = `${headerJP}${$gameVariables.value(380 + user.actorId())[59]}`;
  }
  return `${classInfo}${user.nickname()}\\set[${user.actorId()}]\n${additionalInfo}`;
}

// Tile offsets tried around the source event when hunting for a free chest tile.
const CHEST_SEARCH_OFFSETS_ENEMYWIN_TREASUREBOX2 = [-2, -1, 0, 1, 2];

//エネミー撃破時にドロップボックス設定
enemywin_treasurebox1 = function (unusedArg1) {

  const treasureBoxPosition = $gameVariables.value(160);
  treasureBoxPosition[4] = 0;
  treasureBoxPosition[7] = 0;
  let treasureScore = getRandomIndex(101);
  let scoreBonus = 0;
  let treasureThreshold = 0;
  if ($gameVariables.value(270) >= 1) treasureThreshold = $gameVariables.value(270);
  if ($gameSwitches.value(211)) scoreBonus += 20;
  treasureScore += Math.round(scoreBonus + ($gameVariables.value(270) / 10));

  // The tier fills slots 4..7 of variable 160: chest rank, level, item count, flag.
  if (treasureScore >= 100 && treasureThreshold >= 40) {
    treasureBoxPosition[4] = 3;
    treasureBoxPosition[5] = 21;
    treasureBoxPosition[6] = 5;
    treasureBoxPosition[7] = 1;
  } else if (treasureScore >= 95 && treasureThreshold >= 20) {
    treasureBoxPosition[4] = 2;
    treasureBoxPosition[5] = 18;
    treasureBoxPosition[6] = 3;
    treasureBoxPosition[7] = 1;
  } else if (treasureScore >= 85) {
    treasureBoxPosition[4] = 1;
    treasureBoxPosition[5] = 15;
    treasureBoxPosition[6] = 1;
    treasureBoxPosition[7] = 1;
  };

};

//エネミー撃破時にドロップボックス設定
enemywin_treasurebox2 = function (eventId) {
  const sourceEvent = $gameMap.event(eventId);
  if (!sourceEvent) return;
  const treasureBoxPosition = $gameVariables.value(160);
  findFreeChestOffsetEnemywinTreasurebox2(sourceEvent, treasureBoxPosition);
  const chestEventId = spawnChestEnemywinTreasurebox2(sourceEvent, treasureBoxPosition);
  if (!chestEventId) return;
  const chestEvent = $gameMap.event(chestEventId);
  if (!chestEvent) return;
  presentChestEnemywinTreasurebox2(chestEventId, chestEvent, treasureBoxPosition);
};

// Resolves which `<BGn>` key a layer uses: the plain key by default, overridden
// by the switch-15 "night" variant `<BGnN>` when both exist. 0 means "no layer".
function resolveBattlebackKeyBattlebackChange2(value, baseKey) {
  const nightKey = baseKey + 'N';
  if ($gameSwitches.value(15) && value.meta[nightKey]) return nightKey;
  if (value.meta[baseKey]) return baseKey;
  return 0;
}

// Draws the layer's scroll speeds. The second draw was already unused in the
// original (it fed a variable nothing ever read), but dropping it would remove a
// Math.random() call and shift every later random value in the battle, so it is
// kept deliberately. `getRandomIndex` consumes exactly one draw whatever its
// argument, which is why the original's 56/101 mismatch is unobservable.
function drawBattlebackScrollSpeedsBattlebackChange2(scrollSpeedCandidates) {
  const speedX = scrollSpeedCandidates[getRandomIndex(scrollSpeedCandidates.length)];
  getRandomIndex(101);
  const speedY = scrollSpeedCandidates[getRandomIndex(scrollSpeedCandidates.length)];
  return { speedX, speedY };
}

// Applies `<BGn:x,y,...>` field 1 as the X speed and field 2 as the Y speed:
// 0 = leave alone, 1 = the drawn speed, 2+ = that literal speed (set twice, the
// literal overwriting the drawn value — preserved as-is).
function applyBattlebackScrollSpeedBattlebackChange2(spriteset, level, arr, speedX, speedY) {
  if (Number(arr[1]) != 0) spriteset.setBattlebackScrollSpeedX(level, speedX);
  if (Number(arr[1]) >= 2) spriteset.setBattlebackScrollSpeedX(level, Number(arr[1]));
  if (Number(arr[2]) != 0) spriteset.setBattlebackScrollSpeedY(level, speedY);
  if (Number(arr[2]) >= 2) spriteset.setBattlebackScrollSpeedY(level, Number(arr[2]));
}

// Loads and configures one of the extra battleback layers 3..6. Layer 1 is not
// routed through here: it sets scroll speeds only and never loads artwork.
function applyBattlebackLayerBattlebackChange2(spriteset, level, value, baseKey, scrollSpeedCandidates, battlebackDuration) {
  const selectedBgKey = resolveBattlebackKeyBattlebackChange2(value, baseKey);
  if (selectedBgKey == 0) return;
  const arr = value.meta[selectedBgKey].split(',');
  const speeds = drawBattlebackScrollSpeedsBattlebackChange2(scrollSpeedCandidates);
  const bitmap = ImageManager.loadBitmap("img/parallaxes/", arr[0], Number(arr[4]), true);
  spriteset.addNewBattleback(level, bitmap, 0, battlebackDuration);
  applyBattlebackScrollSpeedBattlebackChange2(spriteset, level, arr, speeds.speedX, speeds.speedY);
  spriteset.battlebackOpacity(level, Number(arr[3]));
  spriteset.battlebackFadeIn(level, battlebackDuration);
}

//戦闘背景をコントロール
battleback_change2 = function () {

  //戦闘中パーティクル
  if (!SceneManager._scene || !SceneManager._scene._spriteset) return;
  // Hoisted: the BG3..BG6 layers below need it too, and BG1 may not run at all.
  const spriteset = SceneManager._scene._spriteset;
  // NOTE: `battlebackDuration` is declared here but only ever assigned inside the
  // BG1 branch far below. When BG1 is absent this function therefore passes
  // `undefined` to addNewBattleback/battlebackFadeIn, and
  // YEP_ImprovedBattlebacks falls back to its own 20-frame default. Preserved
  // verbatim: hoisting the assignment to 120 would change BG3..BG6 fade timing.
  var battlebackDuration;
  const scrollSpeedX = 'fog_battle_front';
  $gameScreen._particle.particleSet(0, scrollSpeedX, 'battleWeather', 'def', 'above');
  const scrollAlphaRange = valueWeather[28];
  $gameScreen._particle.particleUpdate([scrollSpeedX, 'alpha', '0', scrollAlphaRange + '@0.05', scrollAlphaRange + '@0.9', '0']);
  const scrollSpeedRange = valueWeather[29];
  $gameScreen._particle.particleUpdate([scrollSpeedX, 'speed', String(scrollSpeedRange), String(scrollSpeedRange)]);

  if ($gameVariables.value(230) >= 1 && $gameVariables.value(240) == 0) {
    var bitmap = ImageManager.loadBitmap("img/parallaxes/", "BG_TownBattle3", 0, true);
    spriteset.addNewBattleback(3, bitmap, 0, battlebackDuration);
    spriteset.battlebackOpacity(3, 255);
  };

  const scrollSpeedCandidates = [-0.1, -0.2, -0.3, -0.4, -0.5, 0.1, 0.2, 0.3, 0.4, 0.5];
  const value = ($gameVariables.value(240) >= 1) ? $dataItems[$gameVariables.value(240)] : $dataMap;
  if (!value) return;

  // Layer 1 only sets scroll speeds; it never loads artwork of its own.
  const bg1Key = resolveBattlebackKeyBattlebackChange2(value, 'BG1');
  if (bg1Key != 0) {
    battlebackDuration = 120;
    const bg1Arr = value.meta[bg1Key].split(',');
    const bg1Speeds = drawBattlebackScrollSpeedsBattlebackChange2(scrollSpeedCandidates);
    applyBattlebackScrollSpeedBattlebackChange2(spriteset, 1, bg1Arr, bg1Speeds.speedX, bg1Speeds.speedY);
    //spriteset.battlebackOpacity(1, value2);
  }

  applyBattlebackLayerBattlebackChange2(spriteset, 3, value, 'BG3', scrollSpeedCandidates, battlebackDuration);

  applyBattlebackLayerBattlebackChange2(spriteset, 4, value, 'BG4', scrollSpeedCandidates, battlebackDuration);

  applyBattlebackLayerBattlebackChange2(spriteset, 5, value, 'BG5', scrollSpeedCandidates, battlebackDuration);

  applyBattlebackLayerBattlebackChange2(spriteset, 6, value, 'BG6', scrollSpeedCandidates, battlebackDuration);
};

//戦闘時一言集
battle_wordset = function (wordSetId) {

  if (ConfigManager.battleAniSpeed < 3) return;

  let statusWordCandidates = 0;
  let damageWordCandidates = 0;
  let attackWordCandidates = 0;
  let actorId = $gameVariables.value(20);
  const gameTroopMembers = $gameTroop.members();
  const gameVar276 = $gameVariables.value(276);
  actorId = resolveSpeakingActorIdBattleRefactor(wordSetId, gameVar276, actorId);

  $gameVariables.setValue(277, 0);//二言目台詞用。現在未使用
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  $gameVariables.setValue(53, actor.nickname());
  $gameVariables.setValue(625, $gameVariables.value(380 + actorId)[59]);

  const actorName = actor.name();
  const actorMeta = $dataActors[actorId].meta;
  const words = { statusWordCandidates, damageWordCandidates, attackWordCandidates };
  switch (Number(gameVar276)) {
    case 2: selectAttackWordsBattleRefactor(actor, actorMeta, words); break;
    case 1: selectDamageWordsBattleRefactor(actor, actorMeta, words); break;
    case 0: selectStatusWordsBattleRefactor(actor, actorMeta, words); break;
  }
  statusWordCandidates = words.statusWordCandidates;
  damageWordCandidates = words.damageWordCandidates;
  attackWordCandidates = words.attackWordCandidates;

  const enemy1 = gameTroopMembers[$gameVariables.value(92)];
  const enemyName = enemy1 ? enemy1.name() : '';
  let messageText = ``;
  switch (Number(wordSetId)) {
    case 0: messageText = buildStatusWordBattleWordset(statusWordCandidates, actorName); break;
    case 1: messageText = buildAttackWordBattleWordset(gameVar276, attackWordCandidates, actorMeta, actor, actorName, enemyName); break;
    case 2: messageText = buildDamageWordBattleWordset(gameVar276, damageWordCandidates, actorName, enemyName, enemy1, actor); break;
  }

  if (messageText) {
    BattleManager._logWindow.push(`addText`, messageText);
  }
  if ($gameVariables.value(277)) {
    BattleManager._logWindow.push(`addText`, `\\V[277]`);
  }

}

// Picks one entry out of a face-select candidate list.
function pickFaceSelectBattleWordset(faceCandidates) {
  return faceCandidates[getRandomIndex(faceCandidates.length)];
}

// Maps the ability selector in variable 182 to the actor-meta key holding its
// word list and the face it selects. `face` is null when the face is unchanged
// (6 / A-AbilityUse reuses the normal-attack face).
const ABILITY_WORD_BATTLE_WORDSET = {
  5: { meta: 'S-AbilityUse', face: 15 },
  6: { meta: 'A-AbilityUse', face: null },
  7: { meta: 'W-AbilityUse', face: 13 },
  8: { meta: 'R-AbilityUse', face: 6 },
};

function selectAbilityWordBattleWordset(gameVar182) {
  return ABILITY_WORD_BATTLE_WORDSET[gameVar182] || null;
}

// wordSetId 0 — the actor's status line (turn count, fatigue, dying, arousal...).
function buildStatusWordBattleWordset(statusWordCandidates, actorName) {
  if (!statusWordCandidates) return '';
  return actorName + statusWordCandidates[getRandomIndex(statusWordCandidates.length)];
}

// wordSetId 1 — the actor's attack line, plus the 2/3-hit combo lines.
function buildAttackWordBattleWordset(gameVar276, attackWordCandidates, actorMeta, actor, actorName, enemyName) {
  if (gameVar276 == 2) {
    if (!attackWordCandidates) return '';
    let comboWordCandidates = actorMeta['BattleAttack2Conbo'].split(',');
    let num = comboWordCandidates[getRandomIndex(comboWordCandidates.length)];
    valueWordSet9 = `${actorName}の\\C[2]2連撃\\C[0]！ ${num}`;
    comboWordCandidates = actorMeta['BattleAttack3Conbo'].split(',');
    num = comboWordCandidates[getRandomIndex(comboWordCandidates.length)];
    valueWordSet10 = `${actorName}の\\C[2]3連撃\\C[0]！ ${num}`;
    battle_bustUp1(actor, 86, 500, 10, 20);
    return actorName + attackWordCandidates[getRandomIndex(attackWordCandidates.length)];
  }
  if (gameVar276 == 1) {
    const skillName = `\\C[3]＜${$dataSkills[$gameVariables.value(96)].name}＞\\C[0]`;
    valueWordSet9 = `${enemyName}の\\C[2]2連撃\\C[0]！`;
    valueWordSet10 = `${enemyName}の\\C[2]3連撃\\C[0]！`;
    return `${enemyName}の${skillName}！`;
  }
  return '';
}

// wordSetId 2 — the "took damage" line, for either side.
function buildDamageWordBattleWordset(gameVar276, damageWordCandidates, actorName, enemyName, enemy1, actor) {
  const gameVar464 = $gameSwitches.value(464);
  if (gameVar276 == 2 && !gameVar464) {
    const enemy2 = enemy1 && $dataEnemies[enemy1.enemyId()];
    if (!enemy2 || !enemy2.meta['EnemyDamageWord']) {
      return `${enemyName}は攻撃を受けた！`;
    }
    const enemyWordCandidates = enemy2.meta['EnemyDamageWord'].split(',');
    return `${enemyName}${enemyWordCandidates[getRandomIndex(enemyWordCandidates.length)]}`;
  }
  if (gameVar276 != 1) return '';
  if (!gameVar464) {
    const skillName = `${$dataSkills[$gameVariables.value(96)].name}`
    return `${enemyName}は${skillName}を受けた！`;//攻撃時だが使用不可
  }
  if (!damageWordCandidates) return '';
  const word = actorName + damageWordCandidates[getRandomIndex(damageWordCandidates.length)];
  battle_bustUp1(actor, 86, 500, 10, 40);
  return word;
}

// Elements whose resistance is written as a plain "UP!"/"DOWN!" rather than
// "耐性…". Shared by the title effects and the pacond/tbcs trait descriptions.
const RESIST_SPECIAL_ELEMENT_IDS = [10, 11, 12, 15, 20, 38, 39, 40, 41]; // also was declared in amygameDescription.js

//戦闘開始時に称号効果
const TITLE_RESIST_ELEMENT_IDS_TITLE_BATTLE_UP = RESIST_SPECIAL_ELEMENT_IDS;

title_battleUp = function (actor) {
  const titleItemIdArray = $gameVariables.value(288);
  if (!titleItemIdArray || titleItemIdArray.length === 0) return;

  // Switch 375 off = apply the title effects for real; on = only describe them.
  const applyTraits = !$gameSwitches.value(375);
  let titleCount = 0;
  const titleEffects = [];

  for (let itemId = 0; itemId < titleItemIdArray.length; itemId++) {
    const currentItemId = titleItemIdArray[itemId];
    if (currentItemId === 0) continue;
    const currentItem = $dataItems[currentItemId];
    if (!currentItem) continue;
    const titleEffect = currentItem.meta['titleEffect1'];
    if (!titleEffect) continue;

    const effectParams = titleEffect.split(',');
    if (applyTraits) {
      applyTitleEffectTraitTitleBattleUp(actor, effectParams);
      continue;
    }
    titleEffects.push(buildTitleEffectTextTitleBattleUp(currentItem, effectParams));
    titleCount += 1;
  }

  if (!$gameSwitches.value(375) || titleCount < 1) return;
  if ($gameParty.inBattle()) {
    for (const user of $gameParty.battleMembers()) {
      $gameScreen._particle.particlePlay(0, 'aura_bp', `attachParty:${user.index() + 1}`, 'def', 'above');
    }
  }
  for (const titleEffect of titleEffects) {
    valueGetInfoPointX = 900;
    CommonPopupManager.showInfo({}, titleEffect, null);
    BattleManager._logWindow.push('addText', titleEffect);
  }

  valueGetInfoPointX = 0;
};

// <titleEffect1:kind,id,value> applied as a real trait on the actor's data.
function applyTitleEffectTraitTitleBattleUp(actor, effectParams) {
  const effectValue = Number(effectParams[2]);
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
}

// The battle-log line describing one <titleEffect1:...> entry.
function buildTitleEffectTextTitleBattleUp(currentItem, effectParams) {
  let titleEffectText = `\\C[6]【称号効果】\\C[0]\\C[2]${currentItem.name}\\C[0]:`;
  const effectValue = Number(effectParams[2]);
  const resistValue = (Number(effectParams[1]) === 11) ? 10 : 100;

  switch (Number(effectParams[0])) {
    case 0:
      titleEffectText += TextManager.param(Number(effectParams[1]));
      titleEffectText += `\\C[10]${effectValue * 100}%\\C[0]UP!`;
      break;
    case 1:
      titleEffectText += FTKR.CSS.cssStatus.xparam[Number(effectParams[1])];
      titleEffectText += `\\C[10]${effectValue * 100}%\\C[0]UP!`;
      break;
    case 2:
      titleEffectText += FTKR.CSS.cssStatus.sparam[Number(effectParams[1])];
      titleEffectText += `\\C[10]${effectValue * 100}%\\C[0]UP!`;
      break;
    case 3:
      const effectElementName = $dataSystem.elements[Number(effectParams[1])];
      titleEffectText += `${effectElementName}威力`;
      if (effectValue >= 0) {
        titleEffectText += `\\C[10]${effectValue}%UP!\\C[0]`;
      } else {
        titleEffectText += `\\C[1]${effectValue}%DOWN!\\C[0]`;
      }
      break;
    case 4:
      titleEffectText += buildElementTitleEffectTextTitleBattleUp(effectParams);
      break;
    default:
      break;
  }
  return titleEffectText;
}

// The <titleEffect4:...> clause: an element resistance/amplification. `dataId` 11
// (HP absorb) is scaled per-mille, everything else per-cent.
function buildElementTitleEffectTextTitleBattleUp(effectParams) {
  const dataId = Number(effectParams[1]);
  const effectValue = Number(effectParams[2]);
  const resistValue = (dataId === 11) ? 10 : 100;
  const elementName = $dataSystem.elements[dataId];

  if (TITLE_RESIST_ELEMENT_IDS_TITLE_BATTLE_UP.indexOf(dataId) >= 0) {
    const color = effectValue >= 0 ? `\\C[10]` : `\\C[1]`;
    const direction = effectValue >= 0 ? `UP!` : `DOWN!`;
    return `${elementName}${color}${effectValue * resistValue}%\\C[0]${direction}`;
  }

  // NOTE: the old code negated effectValue here, but then printed
  // Number(effectParams[2]) anyway - the negation was dead. The negative case
  // therefore renders "-50%DOWN!" (the sign is not folded away). That matches the
  // duplicate of this logic in amygame.js (~line 6201), so it is preserved rather
  // than "fixed". Note also that 0 lands in the DOWN branch here but the UP branch
  // above, so the two cannot share one sign test.
  const color = effectValue <= 0 ? `\\C[1]` : `\\C[10]`;
  const direction = effectValue <= 0 ? `DOWN!` : `UP!`;
  const resistancePercent = effectValue * resistValue;
  return `${elementName}耐性${color}${resistancePercent}%\\C[0]${direction}`;
}

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

// Display-mode log accumulator shared by the pacond passes. `header` seeds the
// first line (the G-Passive list opens with a "発動G-Passive" title).
function pacondCreatePassiveLog(header) {
  return { messages: header ? [header] : [], count: 0 };
}

// Records one display-mode line. The appliers return null when they applied the
// effect for real instead of describing it.
function pacondRecordPassiveMessage(log, message) {
  if (!message) return;
  log.count += 1;
  log.messages.push(message);
}

function pacondApplyPassiveSkillEffects(user, passiveSkillArray) {
  if (passiveSkillArray.length === 0) return;

  const userName = colorTaggedText(10, user.name());
  const log = pacondCreatePassiveLog(`${userName}発動G-Passive`);

  passiveSkillArray.forEach(function (skillId) {
    const skill = $dataSkills[skillId];
    const skillMeta = skill.meta;
    const isDisplayMode = $gameSwitches.value(375);

    // BUGFIX: `passiveLogCount` used to be passed by value into the two appliers
    // below, so their `passiveLogCount += 1` incremented a dead local. The count
    // stayed 0 and pacondDisplayPassiveMessages bailed out on `count === 0`,
    // which meant the G-Passive list never displayed at all. The appliers now
    // return their message and the caller owns the count.
    pacondRecordPassiveMessage(log, skillMeta['Max Mastery Level']
      ? pacondApplyMasteryPassive(user, skill, skillMeta, isDisplayMode)
      : pacondApplyRegularPassive(user, skill, skillMeta, isDisplayMode));
  });

  pacondDisplayPassiveMessages(user, log.messages, log.count);
}

// Returns the display-mode message for the skill, or null when applying for real.
function pacondApplyMasteryPassive(user, skill, skillMeta, isDisplayMode) {
  if (!isDisplayMode) {
    const stateBaseId = Number(skillMeta['PassiveCondi'].split(',')[2]);
    user.addState(stateBaseId + user.skillMasteryLevel(skill.id) - 1);
    return null;
  }

  let passiveLogMessage = `\\C[2]${skill.name}\\C[0]:`;
  if (skillMeta['PassiveLogDisplay']) {
    const displayParams = skillMeta['PassiveLogDisplay'].split(',');
    passiveLogMessage += `${displayParams[0]}\\C[10]${Number(displayParams[1]) * user.skillMasteryLevel(skill.id)}%\\C[0]UP!`;
  } else {
    passiveLogMessage += `発動中`;
  }
  return passiveLogMessage;
}

// Returns the display-mode message for the skill, or null when applying for real.
function pacondApplyRegularPassive(user, skill, skillMeta, isDisplayMode) {
  if (!isDisplayMode) {
    user.addState(Number(skillMeta['PassiveCondi'].split(',')[2]));
    return null;
  }

  let passiveLogMessage = `\\C[2]${skill.name}\\C[0]:`;
  if (skillMeta['PassiveLogDisplay']) {
    passiveLogMessage += `\\C[10]${skillMeta['PassiveLogDisplay'].split(',')[0]}\\C[0]!`;
  } else {
    passiveLogMessage += `発動中`;
  }
  return passiveLogMessage;
}

function pacondProcessPlusTraitPassives(user) {
  // Process standard plus trait passives
  pacondProcessPlusTraitSkills(user, valuePassivePlussSkill, 'PassivePlusEffect');

  // Process trait modifier passives
  pacondProcessPlusTraitSkills(user, valuePassivePlussSkill2, 'PassivePlusTrait');
}

function pacondProcessPlusTraitSkills(user, skillList, metaKey) {
  const isDisplayMode = $gameSwitches.value(375);
  const log = pacondCreatePassiveLog();

  skillList.forEach(function (skillId) {
    const skill = $dataSkills[skillId];
    const skillMeta = skill.meta;
    const hideSkillId = Number(skillMeta['Hide if Learned Skill'] || 0);

    const isSkillEquipped = user.battleSkillsRaw().includes(skillId);
    const isSkillValid = metaKey === 'PassivePlusEffect' ||
      (user.isLearnedSkill(skillId) && !user.isLearnedSkill(hideSkillId));
    if (!isSkillEquipped || !isSkillValid) return;

    const traitParams = skillMeta[metaKey].split(',');
    let traitValue = Number(traitParams[2]);
    if (skillMeta['Max Mastery Level']) traitValue *= user.skillMasteryLevel(skillId);

    // BUGFIX: see pacondApplyPassiveSkillEffects — the count was passed by value,
    // so `passiveLogCount += 1` inside pacondApplyTraitEffect was dead and the
    // plus-trait list never displayed. The message is now returned to the caller.
    pacondRecordPassiveMessage(log, pacondApplyTraitEffect(user, skill, traitParams, traitValue, isDisplayMode, metaKey));
  });

  pacondDisplayPassiveMessages(user, log.messages, log.count);
}

// Returns the display-mode message for the trait, or null when applying for real
// (or when the metaKey/type pair has no description).
function pacondApplyTraitEffect(user, skill, traitParams, traitValue, isDisplayMode, metaKey) {
  const paramType = Number(traitParams[0]);
  // PassivePlusEffect stores a 0/1/2 stat kind; PassivePlusTrait stores the raw
  // trait code (e.g. 11 for elements).
  const actualTraitCode = (metaKey === 'PassivePlusEffect') ? [21, 22, 23][paramType] : paramType;

  if (isDisplayMode) return pacondBuildTraitMessage(skill.name, metaKey, traitParams, traitValue);

  const dataId = Number(traitParams[1]);
  if (actualTraitCode === 11) {
    user.actor().traits.push({ code: actualTraitCode, dataId: dataId, value: 1 + traitValue });
  } else if ([21, 22, 23].includes(actualTraitCode)) {
    pacondApplyStatTrait(user, actualTraitCode, dataId, traitValue);
  }
  return null;
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
    return message;
  }

  if (metaKey !== 'PassivePlusTrait' || type !== 11) return null;

  message += $dataSystem.elements[dataId];
  const isSpecialElement = RESIST_SPECIAL_ELEMENT_IDS.includes(dataId);
  // Element 11 (HP absorb) is printed per-mille, everything else per-cent.
  const multiplier = (isSpecialElement && dataId == 11) ? 10 : 100;
  if (isSpecialElement) {
    const color = traitValue >= 0 ? `\\C[10]` : `\\C[1]`;
    const direction = traitValue >= 0 ? `UP!` : `DOWN!`;
    return `${message}${color}${traitValue * multiplier}%\\C[0]${direction}`;
  }

  // A non-special element is described as a resistance, so a positive stored
  // value reads as a negative resistance and vice versa.
  const resistanceValue = traitValue > 0 ? -traitValue : traitValue;
  const color = traitValue <= 0 ? `\\C[1]` : `\\C[10]`;
  const resistancePercent = colorTaggedText(traitValue <= 0 ? 1: 10, resistanceValue * 100);
  return `${message}耐性${resistancePercent}%`;
}

function pacondProcessElementPassives(user) {
  const isDisplayMode = $gameSwitches.value(375);
  const log = pacondCreatePassiveLog();

  // Process element power passives
  valuePassiveElementP.forEach(function (skillId) {
    const skill = $dataSkills[skillId];
    const skillMeta = skill.meta;
    const hideSkillId = Number(skillMeta['Hide if Learned Skill'] || -1);

    if (!skill.meta['PassiveElementP']) return;
    if (!user.isLearnedSkill(skillId) ||
      !user.battleSkillsRaw().includes(skillId) ||
      user.isLearnedSkill(hideSkillId)) return;

    const elementParams = skillMeta['PassiveElementP'].split(',');
    const elementId = Number(elementParams[0]);
    let elementValue = Number(elementParams[1]);
    if (skillMeta['Max Mastery Level']) elementValue *= user.skillMasteryLevel(skillId);

    if (!isDisplayMode) {
      valueAttackAmplifysActorId[user.actorId()][elementId] += elementValue;
      return;
    }

    pacondRecordPassiveMessage(log, pacondBuildElementPowerMessage(skill.name, elementId, elementValue));
  });

  // Process power custom skills. These are display-only: the AddPowerCustom
  // total is collected elsewhere (skill_addPowerSet).
  valueAddPowerCustomSkill.forEach(function (skillId) {
    const skill = $dataSkills[skillId];
    const skillMeta = skill.meta;
    const hideSkillId = Number(skillMeta['Hide if Learned Skill'] || -1);

    if (!user.isLearnedSkill(skillId) ||
      !user.battleSkillsRaw().includes(skillId) ||
      user.isLearnedSkill(hideSkillId)) return;
    if (!isDisplayMode) return;

    let powerValue = Number(skillMeta['AddPowerCustom'] || 0);
    if (skillMeta['Max Mastery Level']) powerValue += user.skillMasteryLevel(skillId);

    pacondRecordPassiveMessage(log, pacondBuildAddPowerMessage(skill.name, powerValue));
  });

  pacondDisplayPassiveMessages(user, log.messages, log.count);
}

function pacondBuildElementPowerMessage(skillName, elementId, elementValue) {
  let updown = elementValue >= 1 ? `UP` : `DOWN`;
  const elementName = $dataSystem.elements[elementId];
  skillName = colorTaggedText(2, skillName);
  elementValue = colorTaggedText(10, elementValue);
  updown = colorTaggedText(10, updown);
  return `${skillName}:${elementName}威力${elementValue}%${updown}!`;
}

function pacondBuildAddPowerMessage(skillName, powerValue) {
  const sign = powerValue >= 1 ? `+` : `-`;
  return `\\C[2]${skillName}\\C[0]:\\I[666]\\C[10]${sign}${powerValue}!\\C[0]`;
}

function pacondProcessDamageResistanceForGuardians(user) {
  if (!user.isLearnedSkill(61)) return;

  // Guardian skills 62..70 each add another 10% on top of the base 10%.
  let damageRate = 10;
  for (let skillId = 62; skillId <= 70; skillId++) {
    if (user.isLearnedSkill(skillId)) damageRate += 10;
  }

  const actorTraits = user.actor().traits;
  actorTraits.push({ code: 13, dataId: 62, value: 1 + damageRate });
  actorTraits.push({ code: 13, dataId: 63, value: 1 + damageRate });
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
    if (!stateData.meta['traitBase' + i]) continue;

    const traitParts = stateData.meta['traitBase' + i].split(',');
    const traitCode = Number(traitParts[0]);
    const traitDataId = Number(traitParts[1]);
    const traitValue = Math.round(Number(traitParts[2]) * multiplier);
    const absoluteValue = Math.abs(traitValue);

    // Process trait based on its code and add to description
    description += tbcsProcessTraitByCode(stateData, traitCode, traitDataId, traitValue, absoluteValue);

    // Break the description every third trait.
    traitCount++;
    if (traitCount >= 3) { description += '\n'; traitCount = 0; }
  }

  // Finalize description with category info if available
  description = tbcsFinalizeDescription(stateData, description);

  user.refresh();
};

// Helper function to process trait based on code
function tbcsProcessTraitByCode(stateData, code, dataId, value, absoluteValue) {
  switch (code) {
    case 11: return tbcsProcessElementTrait(stateData, code, dataId, value, absoluteValue);
    case 13: return tbcsProcessStateResistanceTrait(stateData, code, dataId, value, absoluteValue);
    case 14: return tbcsProcessStateImmunityTrait(stateData, code, dataId);
    case 21: return tbcsProcessParameterTrait(stateData, code, dataId, value, absoluteValue);
    case 22: return tbcsProcessExParameterTrait(stateData, code, dataId, value, absoluteValue);
    case 23: return tbcsProcessSpParameterTrait(stateData, code, dataId, value, absoluteValue);
    default: return '';
  }
}

// Process element trait
function tbcsProcessElementTrait(stateData, code, dataId, value, absoluteValue) {
  stateData.traits.push({ code: code, dataId: dataId, value: 1 + value });

  if (!RESIST_SPECIAL_ELEMENT_IDS.includes(dataId)) {
    const modifier = value >= 0.01 ? `\\C[1]-` : `\\C[2]+`;
    const elementName = $dataSystem.elements[dataId];
    const resistancePercent = absoluteValue * 100;
    // BUGFIX: `colorTaggedValue` never existed (only colorTaggedText does), so this
    // branch threw a ReferenceError and the resistance line was dropped.
    return ':' + colorTaggedText(16, `[${elementName}${modifier}${resistancePercent}%耐性]`);
  }

  const modifier = value >= 0.01 ? `\\C[2]+` : `\\C[1]-`;
  const percentage = dataId == 11 ? absoluteValue * 10 : absoluteValue * 100;
  const elementName = $dataSystem.elements[dataId];
  return `:\\C[16][${elementName}${modifier}${percentage}%]\\C[0]`;
}

// Process state resistance trait
function tbcsProcessStateResistanceTrait(stateData, code, dataId, value, absoluteValue) {
  const modifier = value >= 0.01 ? `\\C[1]-` : `\\C[2]+`;

  // Add state resistance traits for matching states
  tbcsAddStateTraits(stateData, code, dataId, value);

  // Return description based on dataId
  const percent = absoluteValue * 100;
  switch (dataId) {
    case 0:
      const baseResToUniqueStatus = colorTaggedText(16, `基本特殊固有状態異常耐性${modifier}${percent}`);
      return `:[${baseResToUniqueStatus}]`;
    case 1:
      const baseResToStatus = colorTaggedText(16, `基本状態異常耐性${modifier}${percent}`);
      return `:[${baseResToStatus}]`;
    case 2:
      const baseResToSpecStatus = colorTaggedText(16, `特殊状態異常耐性${modifier}${percent}`);
      return `:[${baseResToSpecStatus}]`;
    default:
      return '';
  }
}

// Process state immunity trait
function tbcsProcessStateImmunityTrait(stateData, code, dataId) {
  // Add state immunity traits for matching states
  tbcsAddStateTraits(stateData, code, dataId, 0, true);

  // Return description based on dataId
  switch (dataId) {
    case 0:
      const baseImmToUniqueStatus = colorTaggedText(16, `基本特殊固有状態異常無効`);
      return `:[${baseImmToUniqueStatus}]`;
    case 1:
      const baseImmToStatus = colorTaggedText(16, `基本状態異常無効`);
      return `:[${baseImmToStatus}]`;
    case 2:
      const baseImmToSpecStatus = colorTaggedText(16, `特殊状態異常耐性無効`);
      return `:[${baseImmToSpecStatus}]`;
    default:
      return '';
  }
}

// Builds one state-resistance/immunity trait entry.
function tbcsBuildStateTrait(code, dataId, value) {
  return { code: code, dataId: dataId, value: value };
}

// Helper to add state traits
function tbcsAddStateTraits(stateData, code, dataId, value, isImmunity) {
  const traitValue = isImmunity ? 0 : 1 + value;
  for (let j = 1; j <= $dataStates.length - 1; j++) {
    if (tbcsShouldAddStateTrait(dataId, j)) stateData.traits.push(tbcsBuildStateTrait(code, j, traitValue));
  }
}

// Helper to check if state trait should be added
function tbcsShouldAddStateTrait(dataId, stateId) {
  const state = $dataStates[stateId];
  if (!state) return false;
  // The database spells these tags with a leading space; accept both forms.
  const meta = state.meta;
  const isNormal = meta[' StateabNomal'] || meta['StateabNomal'];
  const isSpecial = meta[' StateSPabNomal'] || meta['StateSPabNomal'];
  switch (dataId) {
    case 0: return isNormal || isSpecial || meta[' StateUnique'];
    case 1: return isNormal;
    case 2: return isSpecial;
    default: return false;
  }
}

// Process parameter trait
function tbcsProcessParameterTrait(stateData, code, dataId, value, absoluteValue) {
  const modifier = value >= 0.01 ? `\\C[2]+` : `\\C[1]-`;
  stateData.traits.push({ code: code, dataId: dataId, value: 1 + value });
  return `:\\C[16][${TextManager.param(dataId)}${modifier}${absoluteValue * 100}%]\\C[0]`;
}

// Process ex-parameter trait
function tbcsProcessExParameterTrait(stateData, code, dataId, value, absoluteValue) {
  const modifier = value >= 0.01 ? `\\C[2]+` : `\\C[1]-`;
  stateData.traits.push({ code: code, dataId: dataId, value: value });
  return `:\\C[16][${FTKR.CSS.cssStatus.xparam[dataId]}${modifier}${absoluteValue * 100}%]\\C[0]`;
}

// Process sp-parameter trait
function tbcsProcessSpParameterTrait(stateData, code, dataId, value, absoluteValue) {
  const modifier = value >= 0.01 ? `\\C[2]+` : `\\C[1]-`;
  stateData.traits.push({ code: code, dataId: dataId, value: 1 + value });
  return `:\\C[16][${FTKR.CSS.cssStatus.sparam[dataId]}${modifier}${absoluteValue * 100}%]\\C[0]`;
}

// Helper to finalize description
function tbcsFinalizeDescription(stateData, description) {
  if (stateData.meta['Help Description']) {
    if (stateData.meta['DescriptionWord']) {
      description = `[${stateData.meta['DescriptionWord']}]${description}`;
    }

    if (stateData.meta['Category']) {
      description += tbcsAddCategoryDescription(stateData);
    }

    stateData.description = description;
  }
  return description;
}

// Add category description if needed
function tbcsAddCategoryDescription(stateData) {
  const category = stateData.meta['Category'];

  switch (category) {
    case ' InvalidDispel':
      return `[${$dataStates[201].description}]`;
    case ' PowerUp':
      return `[${$dataStates[202].description}]`;
    case ' StateSPabNomal':
      return `[${$dataStates[30].description}]`;
    case ' StateUnique':
      return `[${$dataStates[40].description}]`;
  }
  return '';
}
//#endregion

// Bosses (enemy 30) take the global boss bonus plus a per-troop bonus; ordinary
// enemies below the level gate roll a random extra level instead.
function applyLevelBonusEnemyBattleSetting(level, enemyId) {
  if (enemyId == 30) {
    if (valueBossAddLevel >= 1) level += valueBossAddLevel;
    if ($gameSwitches.value(426)) {
      return level + $gameVariables.value(304)[valueBossEnemyId] * 10;
    }
    return level + $gameVariables.value(305)[$gameVariables.value(240)] * 5;
  }

  if ($gameVariables.value(232) < 2) return level;
  level += Math.floor(Math.random() * $gameVariables.value(232));
  // getRandomIndex() must stay inside the short-circuit: it is only drawn once
  // the level passed 11.
  if (level >= 11 && level >= getRandomIndex(101)) level += 1;
  return level;
}

// Variable 350 lists states to stamp on the enemy. The marker 885 means "roll one
// of the 885..915 attribute states, scaled by the enemy's level".
function applyEnemyStateIdsEnemyBattleSetting(gameTroopMember, stateIds, level) {
  for (let i = 0; i <= stateIds.length - 1; i++) {
    if (stateIds[i] != 885) {
      gameTroopMember.addState(stateIds[i]);
      continue;
    }
    let extraLevelMult = 11;
    if (level >= 30 && level <= 60) { extraLevelMult = 21 }
    else if (level >= 61) { extraLevelMult = 31 }
    gameTroopMember.addState(getRandomIndex(extraLevelMult) + 885);
  };
}

// Rolls once for a generic drop and adds it to the troop's drop list.
function rollGenericDropEnemyBattleSetting() {
  const itemsToDrop = [];
  const valueDropItemIndex = drop_genericDropRate(0, itemsToDrop);
  const item = $dataItems[valueDropItemIndex];
  if (item) $gameTroop.addDropItem(item);
}

//エネミーに様々なセッティング
enemy_battleSetting = function (troopIndex) {
  const gameTroopMembers = $gameTroop.members();
  const gameTroopMember = gameTroopMembers[troopIndex];
  if (!gameTroopMember) return;
  const enemyId = gameTroopMember._enemyId;
  const target = $gameSwitches.value(426)
    ? $dataEnemies[gameTroopMembers[0]._enemyId]
    : $dataItems[$gameVariables.value(240)];
  if (!target) return;
  const level = resolveEnemyBattleLevelBattleRefactor(gameTroopMember, target, enemyId);
  applyEnemyElementStateBattleRefactor(gameTroopMember, target, enemyId);
  applyEnemySlotStatesBattleRefactor(gameTroopMember, enemyId, target);
  applyEnemySexStatesBattleRefactor(gameTroopMember, $dataEnemies[enemyId]);
  applyPredatorStatesBattleRefactor(gameTroopMember, gameTroopMembers);
  addEnemyDropsBattleRefactor(gameTroopMember, enemyId);
  addEnemyRewardRatesBattleRefactor(gameTroopMember);
  rollEnemyGenericDropsBattleRefactor(gameTroopMember);
  if (gameTroopMember.level >= valueMaxEnemyLv) valueMaxEnemyLv = gameTroopMember.level;
};

// <BossDrop1..9:sourceKind,index,percent> - each slot rolls once, and only the
// slots from the first one present are considered. valueItems is the shared
// scratch global the item-source lookup writes into.
function applyBossDropsEnemyBattleSetting(target) {
  if (!target.meta['BossDrop1']) return;
  for (let j = 1; j <= 9; j++) {
    const bossDrop = target.meta['BossDrop' + j];
    if (!bossDrop) continue;
    const bossDropValues = bossDrop.split(',');
    valueItems = getItemEquipmentSource(Number(bossDropValues[0]));
    if (Number(bossDropValues[2]) < getRandomIndex(101)) continue;
    $gameTroop.addDropItem(valueItems[Number(bossDropValues[1])]);
  }
}

//エネミー簡易討伐
// Constants for calculation
const INSTAWIN_EXP_RATE_MULTIPLIER = 0.5;
const INSTAWIN_EXP_FLAT_BONUS = 20;
const INSTAWIN_GOLD_RATE_MULTIPLIER = 0.6;
const INSTAWIN_GOLD_FLAT_BONUS = 10;
enemy_instantwin = function () {
  const dungeonItem = $dataItems[$gameVariables.value(240)];
  const dropActor = $gameActors.actor(20);
  if (!dungeonItem || !dropActor || !dungeonItem.meta.EnemyLV || !dungeonItem.meta.BattleEnemyPopC) return;
  valueWordSet1 = '';
  valueWordSet3 = '';
  const enemyLevels = dungeonItem.meta.EnemyLV.split(',');
  actor1_setup1(dungeonItem, enemyLevels[getRandomIndex(enemyLevels.length)]);
  const enemyIds = $gameVariables.value(220);
  if (!enemyIds || !enemyIds.length) return;
  const popCounts = dungeonItem.meta.BattleEnemyPopC.split(',');
  const enemyCount = Number(popCounts[getRandomIndex(popCounts.length)]);
  const rewards = accumulateInstantwinRewardsBattleRefactor(dropActor, enemyLevels, enemyIds, enemyCount);
  displayInstantwinRewardsBattleRefactor(rewards);
  grantInstantwinRewardsBattleRefactor(rewards);
  publishInstantwinSummaryBattleRefactor();
};

// Appends the "obtained X" line for a dropped item, if there is one.
function recordInstantwinDropEnemyInstantwin(itemToDrop, valueWordSet1Array) {
  if (!itemToDrop) return;
  const item = `\\C[24]\x1bI[${itemToDrop.iconIndex}]${itemToDrop.name}\\C[0]`;
  const itemMessage = `${item}を獲得した。\n`;
  valueWordSet1Array.push(itemMessage);
  $gameSystem.pushInfoLog(itemMessage);
  $gameParty.gainItem(itemToDrop, 1);
}

// Helper function to count newlines in a string
function countNewlines(str) {
  let count = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    if (str.charAt(i) === '\n') count++;
  }
  return count;
}

//ドロップするかどうかの確率計算
drop_probabilityCalculation = function(actorLevel, dropUpItem) {
  // Start with a random base probability, then add bonus based on the actor level
  let probability = getRandomIndex(101) + Math.round(actorLevel / 10);

  // Increase probability if party size is one (game variable 54 equals 1)
  if ($gameVariables.value(54) === 1) {
    probability += 5;
  }

  // Adjust probability based on the value of game variable 516
  const dropVariable = $gameVariables.value(516);
  if (dropVariable >= 1000) {
    probability += 4;
  } else if (dropVariable >= 500) {
    probability += 3;
  } else if (dropVariable >= 300) {
    probability += 2;
  } else if (dropVariable >= 100) {
    probability += 1;
  }

  // Increase probability if the party has the drop-up item
  if ($gameParty.hasItem(dropUpItem)) {
    probability += 1;
  }

  // Increase probability based on specific party member states (IDs: 296, 297, 298)
  [296, 297, 298].forEach(id => {
    if ($gameParty.membersState(id)) {
      probability += 1;
    }
  });

  return probability;
};

//ドロップするかどうかの確率計算2
const dropModifierMapDropProbabilityCalculation2 = {
  1: 10,
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1
};
drop_probabilityCalculation2 = function (user, dropCategory, dropUpItem) {
  if (dropCategory >= 5 && valueDropEnemyLevel <= minimumStateDropLevelBattleRefactor(dropCategory)) return;
  const baseModifier = dropModifierMapDropProbabilityCalculation2[dropCategory] || 5;
  const modifierIncrement = baseModifier / 3;
  let modifier = baseModifier + modifierIncrement + valueDropEnemyLevel / 10;
  if ($gameTroop.turnCount() <= 1) modifier += modifierIncrement * 3;
  if ($gameVariables.value(54) == 1) modifier += modifierIncrement * 5;
  const averageBattleLuck = $gameVariables.value(516);
  for (const threshold of [100, 300, 500, 1000, 1500, 2000]) {
    if (averageBattleLuck >= threshold) modifier += modifierIncrement;
  }
  if ($gameParty.hasItem(dropUpItem)) modifier += modifierIncrement * 3;
  for (const stateId of [296, 297, 298]) {
    if ($gameParty.membersState(stateId)) modifier += modifierIncrement * 2;
  }
  if (user.isStateAffected(186) && user._stateCounter[186] >= 1) {
    modifier += modifierIncrement * user._stateCounter[186];
  }
  return modifier >= getRandomIndex(100) + 1 ? 1 : 0;
};

//採取物の設定
harvesting_itemSelect = function () {

  var itemsToDrop = [];
  //var value1 = 0; 
  const valueDropItemIndex = drop_genericDropRate(1, itemsToDrop);
  $gameVariables.setValue(23, valueDropItemIndex);
  if (valueDropItemIndex == 0) {
    $gameVariables.setValue(23, 1191);//1191は石ころ
  };

};

//汎用財布ドロップ設定
drop_walletItemBoxGet = function (fallbackDropCategory, isWallet) {
  const footpadSkillId = valueFootpadSkillId;
  const actor = $gameActors.actor($gameVariables.value(11));
  if (!actor || !actor.isLearnedSkill(footpadSkillId)) return;
  const masteryLevel = actor.skillMasteryLevel(footpadSkillId);
  if (masteryLevel < 1) return;
  const dropUpItem = $dataItems[valueItemDropUpItem];
  if (drop_probabilityCalculation(100, dropUpItem) + masteryLevel * 3 < 90) return;
  const category = selectGenericDropCategoryBattleRefactor(fallbackDropCategory, true);
  const candidates = collectWalletCandidatesBattleRefactor(category, isWallet === 1 ? 'walletIn' : 'ItemBag');
  if (!candidates.length) return;
  const itemCount = getRandomIndex(3) + 1;
  for (let index = 0; index < itemCount; index++) {
    const itemId = candidates[getRandomIndex(candidates.length)];
    grantPopupItemBattleRefactor($dataItems[itemId]);
  }
};

//汎用ドロップ設定
drop_genericDropRate = function (battleDrop, itemsToDrop) {
  const genericDropRate = selectGenericDropCategoryBattleRefactor(1, false);
  const candidates = itemsToDrop == null ? [] : itemsToDrop;
  const isBattle = battleDrop !== 0;
  if (!isBattle || $gameSwitches.value(2)) {
    for (const itemId of valueItemDropRate1) {
      appendGenericDropTicketsBattleRefactor(itemId, genericDropRate, isBattle, candidates);
    }
  }
  // Empty pools must produce the established 0/no-item sentinel, never NaN.
  valueDropItems = candidates.length ? Number(candidates[getRandomIndex(candidates.length)]) : 0;
  return valueDropItems;
};

//汎用ドロップエネミー対象設定ダンジョンのみ。計算のみ計算結果はarr4に蓄積。簡易討伐時
function drop_enemyDropRate(unusedParam, eligibleDropItems) {
  const dungeonItem = $dataItems[$gameVariables.value(240)];
  if (!dungeonItem || !dungeonItem.meta.EnemyLV) return;
  const enemyIds = $gameVariables.value(220);
  if (!enemyIds || !enemyIds.length) return;
  const enemyLevels = dungeonItem.meta.EnemyLV.split(',');
  const enemyLevel = Number(enemyLevels[getRandomIndex(enemyLevels.length)]);
  const enemyId = Number(enemyIds[getRandomIndex(enemyIds.length)]);
  const enemyData = $dataEnemies[enemyId];
  if (!enemyData) return;
  const candidates = eligibleDropItems == null ? [] : eligibleDropItems;
  for (let itemId = 1; itemId < $dataItems.length; itemId++) {
    if (!enemyData.meta['Conditional Item ' + itemId + ' Drop']) continue;
    const item = $dataItems[itemId];
    if (!item || !item.meta.LotteryRearity) continue;
    const minimumLevel = minimumEnemyDropLevelBattleRefactor(Number(item.meta.LotteryRearity));
    if (enemyLevel >= minimumLevel) candidates.push(itemId);
  }
  return candidates;
}

//ジョブステートエネミーorジョブ持ち追いはぎスクリプト
//drop_JobStateWAget(1,10);//1武器2防具ダンジョン外の場合の想定レベル
drop_JobStateWAget = function (equipmentType, unusedParam) {
  const context = resolveClassDropContextBattleRefactor();
  if (!context) return;
  const isArmor = equipmentType === 2;
  const equipmentData = isArmor ? $dataArmors : $dataWeapons;
  const lastIndex = isArmor ? Math.min(valueArmorsLength, equipmentData.length - 1) : equipmentData.length - 1;
  const requiredType = Number(context.dropData[isArmor ? 2 : 1]);
  const maximumRarity = Math.max(1, Math.min(Math.round(context.enemyLevel / 10), 10));
  const candidates = collectClassEquipmentBattleRefactor(equipmentData, lastIndex, isArmor, requiredType, maximumRarity);
  const selectedId = candidates[getRandomIndex(candidates.length)];
  if (selectedId === 0) return;
  const item = equipmentData[selectedId];
  if ($gameParty.inBattle()) $gameTroop.addDropItem(item);
  else grantPopupItemBattleRefactor(item);
}

//追いはぎ時の確率と武器防具入手
footpad_probabilityUp = function (equipmentType) {

  const actor = $gameActors.actor($gameVariables.value(11));
  if (!actor) return;
  let enemyDropChance = 10;
  if ($gameVariables.value(240) >= 1) {
    const item = $dataItems[$gameVariables.value(240)];
    if (!item || !item.meta['EnemyLV']) return;
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
    drop_JobStateWAget(equipmentType, enemyDropChance);
  };
};

//アイテムボックス開封
item_itemBoxOpen = function (a, b, itemId) {

  const boxItem = $dataItems[itemId];
  if (!boxItem) return;
  if (b.actorId() != a.actorId()) return;

  // Using the box a second time closes the window again.
  if ($gameSwitches.value(115)) {
    $gameSwitches.setValue(115, false);
    WindowManager.hide(0);
    return;
  }

  $gameSwitches.setValue(115, true);
  $gameParty.loseItem($dataItems[itemId], 1);

  if (!boxItem.meta['ItemBag']) return;

  valueItemBoxOpen = `${boxItem.name}の内訳（もう一度使用でウィンドウ閉じる）\n`;
  const openedItemCount = drawItemBoxContentsItemBoxOpen(boxItem);

  WindowManager.show(0, 0, 0, 1280, 290);
  if (openedItemCount == 0) {
    WindowManager.drawText(0, `${valueItemBoxOpen}中身は空だった…。`);
  } else {
    WindowManager.drawText(0, `${valueItemBoxOpen}`);
  }
};

// Draws the box contents into the valueItemBoxOpen global and returns how many
// items the party actually gained.
function drawItemBoxContentsItemBoxOpen(boxItem) {
  const itemTypeId = [0, 0, 0, 1, 0, 0, 2, 0];
  const itemBagValues = boxItem.meta['ItemBag'].split(',');
  const drawCount = itemBagValues[getRandomIndex(itemBagValues.length)];
  // Carried across draws on purpose: a HentaiBox rewrites it per candidate item.
  let isSeiyokuItem = !boxItem.meta['SeiyokuItem'];
  let openedItemCount = 0;

  for (let drawIndex = 0; drawIndex <= drawCount; drawIndex++) {
    const entryCategoryId = itemTypeId[getRandomIndex(itemTypeId.length)];
    valueItems = getItemEquipmentSource(entryCategoryId);
    if (boxItem.meta['HentaiBox']) {
      valueItems = $dataItems;
      isSeiyokuItem = boxItem.meta['SeiyokuItem'];
    }

    const end = valueItems == $dataArmors ? valueArmorsLength : valueItems.length - 1;
    const candidates = collectItemBoxCandidatesItemBoxOpen(boxItem, valueItems, end, isSeiyokuItem);
    isSeiyokuItem = candidates.isSeiyokuItem;

    valueDropItems = Number(candidates.weightedItemIds[getRandomIndex(candidates.weightedItemIds.length)]);
    if (valueDropItems < 1) continue;

    const gainedItem = valueItems[valueDropItems];
    let itemGainCount = 1;
    if (entryCategoryId == 0) {
      if (gainedItem.price <= 0) { itemGainCount = 1 }
      else if (gainedItem.price <= 1000) { itemGainCount = getRandomIndex(6) + 1 }
      else if (gainedItem.price <= 10000) { itemGainCount = getRandomIndex(3) + 1 }
    }
    $gameParty.gainItem(gainedItem, itemGainCount);
    valueItemBoxOpen += `[\x1bI[${gainedItem.iconIndex}]${gainedItem.name}×${itemGainCount}]`;
    openedItemCount += 1;
    if ((openedItemCount % 3) == 0) { valueItemBoxOpen += `\n` };
  }
  return openedItemCount;
}

// Candidate item ids for one draw, weighted by <LotteryRearity>. The list always
// starts with a 0, which is the "nothing dropped" outcome. NOTE: the caller
// passes the cross-file `valueItems` scratch global; it is renamed here so the
// parameter does not shadow it.
function collectItemBoxCandidatesItemBoxOpen(boxItem, candidateItems, end, isSeiyokuItem) {
  const weightedItemIds = [0];
  for (let i = 1; i <= end; i++) {
    const valueItem = candidateItems[i];
    if (!valueItem) continue;
    if (isExcludedItemBoxEntryItemBoxOpen(valueItem)) continue;
    if (boxItem.meta['HentaiBox']) isSeiyokuItem = $dataItems[i].meta['SeiyokuItem'];

    const lotteryRearity = valueItem.meta['LotteryRearity'];
    if (!lotteryRearity || !isSeiyokuItem) continue;
    const rarityNum = Number(lotteryRearity);
    // A rarity named more than once in the list weights the entry more heavily,
    // so each match pushes its own copy.
    const rarityList = boxItem.meta['ItemBagRearity'].split(',');
    for (const rarityValue of rarityList) {
      if (rarityValue != rarityNum) continue;
      for (let j = 10; j >= rarityNum; j--) weightedItemIds.push(i);
    }
  }
  return { weightedItemIds, isSeiyokuItem };
}

// <GatchaOutOfRange> entries never drop, and <Max Item:1> entries are skipped
// once the party already owns one.
function isExcludedItemBoxEntryItemBoxOpen(valueItem) {
  if (valueItem.meta['GatchaOutOfRange']) return true;
  const maxItem = valueItem.meta['Max Item'];
  return Number(maxItem) == 1 && $gameParty.hasItem(valueItem);
}

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
      if (!stateRate) continue;
      // NOTE: isExp is a boolean because valueTotalgold is a primitive — routing it
      // through an array would box it into a fresh Number object.
      if (isExp) valueTotalexp += Number(stateRate);
      else valueTotalgold += Number(stateRate);
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
attack_DamageFormula = function (user, target, skillId) {

  if (!$gameSwitches.value(141)) return;
  const skill = $dataSkills[skillId];

  const skillDamageFormulaData = skill.meta['DamageFormula2'].split(',');
  // BUGFIX: `damage` was assigned without a declaration, leaking a global.
  const damage = Math.max($attack1(Number(skillDamageFormulaData[0]), user, target,
    Number(skillDamageFormulaData[1])) *
    Number(skillDamageFormulaData[2]), user.mdf / 10);
  const dmg = `\\C[10]${damage}\\C[0]`;
  let text = `基礎ダメージ値:${dmg}`;
  BattleManager._logWindow.push(`addText`, text);

  const userAttackElements = user.attackElements().slice();
  if (skill.meta['Multiple Elements']) {
    userAttackElements.push(...skill.meta['Multiple Elements'].split(','));
  };
  const skillDamageElementId = skill.damage.elementId;
  if (skillDamageElementId >= 1) {
    userAttackElements.push(skillDamageElementId);
  };

  const prefix = `[属性] `
  text = prefix;
  for (let i = 0; i < userAttackElements.length; i++) {
    text += buildDamageElementTextAttackDamageFormula(user, target, userAttackElements[i]);
  };
  if (text != prefix) {
    BattleManager._logWindow.push(`addText`, text);
  };
  if (target.result().critical) {
    const critPercent = user.criticalMultiplierBonus() * 100;
    text = `[会心発生！] 倍率${critPercent}%`;
    BattleManager._logWindow.push(`addText`, text);
  };
  const skillDamageVar = $dataSkills[skillId].damage.variance;
  text = `[分散値] ${skillDamageVar}`;
  BattleManager._logWindow.push(`addText`, text);

};

// The "[属性] \x1bI[icon]:attackRate-targetRate " fragment for one element, or ''
// when both rates are exactly 100.
function buildDamageElementTextAttackDamageFormula(user, target, userAttackElement) {
  let attackElementRatePct = Math.round(valueAttackAmplifysActorId[user.actorId()][userAttackElement]);
  attackElementRatePct = attackElementRatePct + Math.round(user.elementAmplifyRate(userAttackElement) * 100 + 100);
  const targetElementRatePct = Math.round(target.elementRate(userAttackElement) * 100);
  // NOTE: amygame_elementIcon also assigns the global valueElementIconArr, so it
  // is called unconditionally, exactly as the original did.
  const elementIcon = amygame_elementIcon(userAttackElement);
  if (attackElementRatePct == 100 && targetElementRatePct == 100) return '';
  // NOTE: `!= 1 || != 16` can never be false, so this guard is inert. Kept as-is
  // (see commit message) rather than guess which operator was meant.
  if (elementIcon[1] != 1 || elementIcon[1] != 16) {
    return `\x1bI[${elementIcon[1]}]:${attackElementRatePct}-${targetElementRatePct} `;
  }
  return '';
}

//ボス行動パターン設定
boss_actionPattarn1 = function (a) {
  const bossActionPattern = $gameVariables.value(346);
  if (!bossActionPattern) return;
  const isPredictionOn = $gameSwitches.value(470);
  const triggers = scanBossActionTriggersBossActionPattarn1(a, isPredictionOn);
  const selectedSkillId = resolveBossSelectedSkillBattleRefactor(a, bossActionPattern, triggers.selectedSkillId);
  const bossActionId = chooseBossNormalActionBattleRefactor(a, bossActionPattern, triggers.chosenSkillId);
  valueBossAction = selectedSkillId;
  valueBossActionNormal = bossActionId;
  if (!isPredictionOn) return;
  if (valueBossAction >= 1) boss_actionPredict(valueBossAction, 1);
  else boss_actionPredict(valueBossActionNormal, 2);
};

// Scans the 15 boss-action trigger slots in variable 347. Returns the skill id
// selected by an HP / MP / turn / state trigger and the one chosen by a
// normal-attack change (type 4). Only the first match of each wins.
function scanBossActionTriggersBossActionPattarn1(a, gameVar470) {
  const result = { selectedSkillId: 0, chosenSkillId: 0 };
  for (let i = 1; i <= 15; i++) {//$dataSkills[id].tpCost
    const gameVar347i = $gameVariables.value(347)[i];
    if (!gameVar347i) continue;

    const typeId = gameVar347i[0];
    const stateId = gameVar347i[1];
    const skillId = gameVar347i[2];
    const skill = $dataSkills[skillId];
    if (!skill) continue;

    // type 4 swaps the normal attack and never grants TP.
    if (typeId == 4 && a.hpRate() <= stateId / 100 && a.meetsSkillConditions(skill)) {//ＨＰによる通常攻撃変化
      result.chosenSkillId = skillId;
      break;
    }
    if (typeId == 4) continue;

    if (!isBossActionTriggeredBossActionPattarn1(a, typeId, stateId, skillId)) continue;
    if (!gameVar470 && skill.tpCost == 100) a.gainTp(100);
    if (!a.meetsSkillConditions(skill)) continue;
    result.selectedSkillId = skillId;
    break;
  }
  return result;
}

// The per-type trigger test: 0 HP, 1 MP, 2 turn count, 3 state.
function isBossActionTriggeredBossActionPattarn1(a, typeId, stateId, skillId) {
  switch (typeId) {
    case 0: return 899 != skillId && a.hpRate() <= stateId / 100;//HPトリガー
    case 1: return a.mpRate() <= stateId / 100;//MPトリガー
    case 2: return ($gameVariables.value(263) % stateId) == 0;//ターン
    case 3: return a.isStateAffected(stateId);//オーバードライブなどステートによる変化
  }
  return false;
}

// Rolls up to 10 times for a candidate whose skill conditions are met. When none
// matches, the last roll is kept (which is what the original loop did too).
function pickBossActionSkillBossActionPattarn1(a, candidateSkillIds, fallbackId) {
  let candidateSkillId = 0;
  for (let i = 1; i <= 10; i++) {
    candidateSkillId = candidateSkillIds[getRandomIndex(candidateSkillIds.length)];
    if (candidateSkillId == 0) candidateSkillId = fallbackId;
    if ($dataSkills[candidateSkillId] && a.meetsSkillConditions($dataSkills[candidateSkillId])) break;
  }
  return candidateSkillId;
}

//ボス行動コモン内予測計算
boss_actionPredict = function (predictedSkillId, predictionModeId) {

  var masteryCheckSkillId = 777;//
  var enemy1 = $gameTroop.members()[0];
  if (!enemy1) return;
  var actor = $gameActors.actor($gameVariables.value(2));
  if (!actor) return;
  var masteryBonus = actor.skillMasteryLevel(masteryCheckSkillId) * 10;
  let predictionMessage = 1;
  var enemyName = enemy1.name();
  if (predictionModeId == 1) {
    predictionMessage = buildActionPredictionMessageBossActionPredict(
      actor, enemy1, enemyName, predictedSkillId, masteryBonus,
      '発動するようだ', `${enemyName}から大きな力の予兆を感じる…。。`);
    if (predictionMessage != 1) BattleManager._logWindow.push(`addText`, predictionMessage);
  };
  if (predictionModeId == 2) {
    // Mode 2 stays silent when the actor is not affected by state 292, which is
    // expressed here by leaving predictionMessage at its 1 sentinel.
    predictionMessage = buildActionPredictionMessageBossActionPredict(
      actor, enemy1, enemyName, predictedSkillId, masteryBonus, '使用するようだ', 1);
    if (predictionMessage != 1) BattleManager._logWindow.push(`addText`, predictionMessage);
  };
};

// Builds the boss-action prediction line, or returns `unaffectedMessage` when the
// actor lacks state 292. Callers pass the sentinel 1 to mean "say nothing".
function buildActionPredictionMessageBossActionPredict(actor, enemy, enemyName, predictedSkillId, masteryBonus, verbPhrase, unaffectedMessage) {
  if (!actor.isStateAffected(292)) return unaffectedMessage;
  if (masteryBonus + actor.level > enemy.level) {
    const skillName = `\x1bSIN[${predictedSkillId}]`;
    return `${enemyName}は${skillName}を${verbPhrase}…。`;
  }
  return `${enemyName}の力が強大な為、行動を予測する事が出来ない…。`;
}

//エネミー仲間呼びスキル
enemy_reinforcement = function () {

  let reinforcementFound = false;
  let reinforcementIndex = 0;
  const enemies = $gameTroop.members();
  for (let i = 0, size = enemies.length; i < size; i++) {
    if (enemies[i].isAppeared()) continue;
    this.iterateEnemyIndex(i, function (enemy) {
      enemy.appear();
      $gameTroop.makeUniqueNames();
    });
    reinforcementFound = true;
    reinforcementIndex = i;
    break;
  }
  if (reinforcementFound == true) {
    const enemyId = $gameTroop.members()[reinforcementIndex]._enemyId;
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
  if ($gameTroop.aliveMembers().length < 1 || !target.isAlive()) return;

  const skillMeta = $dataSkills[$gameVariables.value(96)].meta;
  for (let id = 1; id <= 9; id++) {
    const additionalSet = skillMeta['additionalSet' + id];
    if (!additionalSet) continue;
    applyAdditionalSetEntrySkillAdditionalSet(user, additionalSet.split(','));
  }

};

// One <additionalSetN:...> entry. [1] selects the animation recipients, [4] the
// animation; the state grant only happens when [1] is 1, and is then routed by
// [0].
function applyAdditionalSetEntrySkillAdditionalSet(user, values) {
  const recipientSelector = Number(values[1]);
  const animationId = Number(values[4]);
  if (animationId >= 1) playAdditionalSetAnimationSkillAdditionalSet(user, recipientSelector, animationId);
  if (recipientSelector != 1) return;//ステート付与
  grantAdditionalSetStateSkillAdditionalSet(user, Number(values[0]), Number(values[2]), Number(values[3]));
}

// Recipients: 1 = user only, 2 = all allies, 3 = the enemy in variable 92,
// 4 = all enemies. Positions of 3 mean "on the target", so the whole side is hit.
function playAdditionalSetAnimationSkillAdditionalSet(user, recipientSelector, animationId) {
  if (recipientSelector == 1) {
    $gameActors.actor($gameVariables.value(20)).startAnimation(animationId, true, 1);
    return;
  }
  if (recipientSelector == 2) {
    const actor = $gameActors.actor($gameVariables.value(20));
    if ($dataAnimations[animationId].position == 3) {
      actor.startAnimation(animationId, true, 1);
      return;
    }
    for (const member of $gameParty.battleMembers()) {
      if (member.isAlive()) member.startAnimation(animationId, true, 1);
    }
    return;
  }
  if (recipientSelector == 3) {
    $gameTroop.members()[$gameVariables.value(92)].startAnimation(animationId, true, 1);
    return;
  }
  if (recipientSelector == 4) {
    const battler = $gameTroop.members()[$gameVariables.value(92)];
    if ($dataAnimations[animationId].position == 3) {
      battler.startAnimation(animationId, true, 1);
      return;
    }
    for (const member of $gameTroop.members()) {
      member.startAnimation(animationId, true, 1);
    }
  }
}

// State grant. `recipient` is values[0] (1 user / 2 all allies / 3 one enemy /
// 4 all enemies), `grantCount` is values[2] and `stateId` is values[3]. State id
// 201 is shorthand for the 206..211 range. Note the four branches differ on
// purpose: 2 and 4 grant once per battler, and 4 uses the shorter 206..210 range.
function grantAdditionalSetStateSkillAdditionalSet(user, recipient, grantCount, stateId) {
  if (recipient == 1) {
    const actor = $gameActors.actor($gameVariables.value(20));
    for (let i = 1; i <= grantCount; i++) {
      if (stateId == 201) { for (let j = 206; j <= 211; j++) actor.addState(j); }
      else actor.addState(stateId);
    }
    return;
  }
  if (recipient == 2) {
    for (const actor of $gameParty.battleMembers()) {
      if (!actor.isAlive()) continue;
      if (stateId == 201) { for (let j = 206; j <= 211; j++) actor.addState(j); }
      else actor.addState(stateId);
    }
    return;
  }
  if (recipient == 3) {
    const battler = $gameTroop.members()[$gameVariables.value(92)];
    if (!battler.isAlive()) return;
    for (let i = 1; i <= grantCount; i++) {
      if (stateId == 201) { for (let j = 206; j <= 211; j++) state_addFormula1([j, 50, user, battler, user.mdf, battler.luk]); }
      else state_addFormula1([stateId, 50, user, battler, user.mdf, battler.luk]);
    }
    return;
  }
  if (recipient == 4) {
    for (const battler of $gameTroop.members()) {
      if (!battler.isAlive()) continue;
      if (stateId == 201) { for (let j = 206; j <= 210; j++) state_addFormula1([j, 50, user, battler, user.mdf, battler.luk]); }
      else state_addFormula1([stateId, 50, user, battler, user.mdf, battler.luk]);
    }
  }
}

//スキル名表示。id2はid1が2の場合のみ名前を入れておく
skillWord_direction = function (displayModeId, messageText) {

  let pictureY = 384 - 310;
  if (displayModeId == 2) {
    setBattlerBhpTempSkillWordDirection(true);
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.dTextAlign = 1;
    $gameScreen.setDTextPicture(`${messageText}`, 28);
    $gameScreen.showPicture(100, "", 1, 640 + 50, pictureY, 100, 100, 0, 0);
    $gameScreen.movePicture(100, 1, 640, pictureY, 100, 100, 255, 0, 30);
  };
  if (displayModeId == 0) {
    setBattlerBhpTempSkillWordDirection(true);
    const skill96Ruby = stripSpacesSkillWordDirection($dataSkills[$gameVariables.value(96)].meta['rubi']);
    if (skill96Ruby) {
      pictureY += 40;
      $gameScreen.setDTextPicture(`${skill96Ruby}`, 20);
    };
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.dTextAlign = 1;
    $gameScreen.setDTextPicture(`${$gameVariables.value(527)}`, 28);
    $gameScreen.showPicture(100, "", 1, 640 + 50, pictureY, 100, 100, 0, 0);
    $gameScreen.movePicture(100, 1, 640, pictureY, 100, 100, 255, 0, 30);
  } else {
    // NOTE: displayModeId 2 also lands here, so its picture is moved out again
    // immediately after being shown above. Preserved as-is.
    setBattlerBhpTempSkillWordDirection(false);
    if ($gameScreen.picture(100)) $gameScreen.movePicture(100, 1, 640 - 50, pictureY, 100, 100, 0, 0, 60);
  };

};

// Strips up to 10 spaces out of a <rubi:...> meta value. The loop is bounded, so
// a longer run keeps its tail spaces - matching the original.
function stripSpacesSkillWordDirection(text) {
  if (!text) return text;
  for (let i = 1; i <= 10; i++) {
    if (text.match(/ /)) text = text.replace(' ', '');
  }
  return text;
}

// Toggles the turn-order flag the skill-name picture depends on.
function setBattlerBhpTempSkillWordDirection(value) {
  if (!$gameParty.inBattle()) return;
  if (!$gameSwitches.value(211)) return;
  $gameTemp._battler_bhp_temp[2] = value;
}

//奥義名表示
ougiWord_direction = function (displayModeId) {

  if (displayModeId == 0) {
    if (!BattleManager._subject) return;
    // Actor subjects are indexed by their party position, enemies by variable 92.
    const user = BattleManager._subject.isActor()
      ? $gameActors.actor($gameVariables.value(20)).index()
      : $gameVariables.value(92);
    let skillDisplayName = `\x1bSIN[${$gameVariables.value(96)}]`;
    if (valueAddPowerCustom >= 1) {
      skillDisplayName += `＜\\I[666]\\C[10]+${valueAddPowerCustom}\\C[0]＞`
    };
    if (valueChainAddPower >= 1) {
      skillDisplayName += `＜\\C[10]Chain+${valueChainAddPower}\\C[0]＞`
    };
    const skillRubiText = stripSpacesSkillWordDirection($dataSkills[$gameVariables.value(96)].meta['rubi']);
    if (skillRubiText) {
      $gameScreen.setDTextPicture(`${skillRubiText}`, 20);
    };
    $gameScreen.dWindowFrame = 'ON';
    $gameScreen.dTextAlign = 1;
    $gameScreen.setDTextPicture(`${skillDisplayName}`, 28);
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
  const actor = $gameActors.actor(actorId);
  if (!actor) return;
  const actorData = actor.actor();
  const cutinType = resolveCutinTypeBattleRefactor($gameVariables.value(182));
  if (cutinType < 1) return;
  if (cutinType === 2) playOugiBgmCutinPreparation(actorData);
  speakOugiUseLineCutinPreparation(actor, actorData);
  if (actorData.meta.Heroine) applyHeroineCutinCutinPreparation(actorId, cutinType);
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
  const picture = $gameScreen.picture(pictureId);
  if (!picture) return;
  const picOrigin = picture.origin();
  const picX = picture.x();
  const picY = picture.y();
  const picScaleX = picture.scaleX();
  const picScaleY = picture.scaleY();

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
  if (!skill || !skill.meta['picSize']) return;
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
  if (!skill || !skill.meta['picSize']) return;
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
  const picture = $gameScreen.picture(pictureId);
  if (!picture) return;
  const picX2 = picture.x();
  const picY2 = picture.y();

  // Play animation at the picture's position
  $gameScreen.startAnimation(picX2, picY2, 301, false);

  // Display skill name with optional ruby text
  sdp1DisplaySummonSkillName(pictureId, picX2);
}

// Displays the skill name with optional ruby text above it
function sdp1DisplaySummonSkillName(pictureId, xPosition) {
  const currentSkill = $dataSkills[$gameVariables.value(96)];
  if (!currentSkill) return;
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
  if (!skill || !skill.meta['rubi']) return;

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
      if ($gameSwitches.value(98)) { valueVictoryResult = 0; $gameSwitches.setValue(98, false); }
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
battle_simpleSubjugation = function (subjugationId) {
  if (!$gameSwitches.value(201)) return; // return when battle_simpleSubjugation is disabled
  
  // Only calculate level requirements if needed
  const isForceSubjugation = $gameSwitches.value(41);
  
  // Skip level check if force subjugation is active
  if (!isForceSubjugation) {
    const battleItem = $dataItems[$gameVariables.value(240)];
    if (!battleItem || !battleItem.meta['EnemyLV']) return;
    const enemyLvArray = battleItem.meta['EnemyLV'].split(',');
    
    // Find max level in a single pass
    let maxEnemyLv = 0;
    for (let i = 0, len = enemyLvArray.length; i < len; i++) {
      const level = Number(enemyLvArray[i]);
      if (level > maxEnemyLv) maxEnemyLv = level;
    }
    
    // Early return if actor level is insufficient
    const levelActor = $gameActors.actor($gameVariables.value(11));
    if (!levelActor) return;
    const actorLevel = levelActor.level;
    if (actorLevel < maxEnemyLv) return;
  }
  
  // Process subjugation when conditions are met
  $gameSwitches.setValue(98, true);
  enemy_instantwin();
  
  // Award JP to all battle members
  const battleMembers = $gameParty.battleMembers();
  for (let i = 0, len = battleMembers.length; i < len; i++) {
    battleMembers[i].gainJp(1);
  }
};

// Renamed from state_addbuffdebuff (and state_removebuffdebuff /
// state_turnEndbuffdebuff below) so the compound words are readable. Called
// from the <Custom Apply Effect> / <Custom Remove Effect> notetags of the
// 206-217 stat-up/down states in data/states.json.
//state_addBuffDebuff(1,2,user,target,stateId,271);
state_addBuffDebuff = function (isBuff, requestedBuffParamId, user, target, stateId, animationId) {

  var buffParamId = requestedBuffParamId;
  var turns = getRandomIndex(3) + 3;
  if (isBuff == 1) {
    target.addBuff(buffParamId, turns);
  } else {
    target.addDebuff(buffParamId, turns);
  };
  if (target._stateCounter[stateId] < 5) state_applyCommonEffect(user, target, stateId, animationId);
  if (target._stateCounter[stateId] >= 1) {
    target.addStateCounter(stateId, +1);
  } else {
    target.setStateCounter(stateId, 1);
  };

};

//state_removeBuffDebuff(1,2,user,target,stateId,271);
state_removeBuffDebuff = function (id, buffId, user, target, stateId, animationId) {
  if ($gameTroop.isAllDead()) return;
  // Retained rule: only a positive buff level removes the linked state.
  const buffLevel = target._buffs[buffId];
  if (!(buffLevel >= 1)) return;
  target.removeState(stateId);
  target.removeBuff(buffId);
  state_removeCommonEffect(user, target, stateId, animationId);
};

//state_turnEndBuffDebuff(1,2,user,target,stateId,271);
// NOTE: not referenced by any notetag in the data files; kept for parity with
// the add/remove pair above.
state_turnEndBuffDebuff = function (mode, buffId, user, target, stateId, animationId) {

  target.removeStateCounter(stateId);
  let removeEffect
  if (mode == 1) {
    removeEffect = target._buffs[buffId] < 0;
  } else {
    removeEffect = target._buffs[buffId] > 0;
  };
  if (removeEffect) {
    target.removeState(stateId);
    //id2.removeBuff(value1);
    state_removeCommonEffect(user, target, stateId, animationId);
  };

};

//装備スキルの操作
skill_equipOperation = function (actor, actor2, itemId) {
  if (!actor || !actor2 || actor2.actorId() !== actor.actorId()) return;
  const actorName = colorTaggedText(2, actor.name());
  switch (Number(itemId)) {
    case 427: return rememberEquippedSkillsBattleRefactor(actor, actorName);
    case 428: return restoreEquippedSkillsBattleRefactor(actor, actorName);
    case 429:
      actor.clearEquipBattleSkills();
      TickerManager.show(`${actorName}のスキル装備状態を全て解除しました`);
      return;
    case 430: return equipAvailableSkillsBattleRefactor(actor, actorName);
  }
}

// Places skillId in the slot band its stype maps to: 10 = G-passive, 15 =
// H-passive, anything else = normal. Mirrors YEP_EquipBattleSkills.learnSkill.
function assignSkillSlotSkillEquipOperation(skillIds, slotIndex, skillId, stypeId) {
  const band = stypeId == 10 ? 'gPassive' : stypeId == 15 ? 'hPassive' : 'normal';
  const slotCount = skillIds.length;
  const slot = slotIndex[band];
  // In this project the final 200 slots are two reserved passive bands.
  const bandEnd = band === 'gPassive' ? slotCount - 100 : band === 'hPassive' ? slotCount : slotCount >= 200 ? slotCount - 200 : slotCount;
  if (slot < 0 || slot >= bandEnd) return;
  skillIds[slot] = skillId;
  slotIndex[band] += 1;
}

//ステータス表示非表示
battleStatus_showHide = function (hideFlag) {

  const on = hideFlag == 0;
  if (Imported.MOG_BattleHud) {
    $gameSystem._bhud_visible = on;
  } else {
    if (on) BattleManager._statusWindow.show(); else BattleManager._statusWindow.hide();
  };
  if ($gameSwitches.value(211) && SceneManager._scene && SceneManager._scene._bosshp_sprites) {
    SceneManager._scene._bosshp_sprites.visible = on;
  }

}

//確率でステート付与state_addFormula1([4,50,user,target,user.mdf,target.luk]);
state_addFormula1 = function (params) {
  const [stateId, baseChance, user, target, userMDF, targetLUK] = params;
  const stateData = $dataStates[stateId];
  if (!stateData) return;
  const targetName = colorTaggedText(16, target.name());
  const stateName = colorTaggedText(10, stateData.name);
  if (target.isStateResist(stateId)) {
    const immunityText = colorTaggedText(10, '完全耐性');
    showMessage(`${targetName}は${stateName}を無効化した！。（${immunityText}）`);
    return;
  }
  if (user !== target) {
    const userName = colorTaggedText(2, user.name());
    showMessage(`${userName}が${stateName}を付与した！　`);
  }
  const baseActivationChance = Math.floor((1 + (userMDF - targetLUK) * 0.01) * baseChance);
  const activationChance = Math.max(0, Math.min(100, Math.floor(baseActivationChance * target.stateRate(stateId))));
  const resistanceRoll = Math.floor(Math.random() * 100);
  const isStateApplied = activationChance > resistanceRoll;
  if (isStateApplied) target.addState(stateId);
  showStateRollResultBattleRefactor(targetName, stateName, isStateApplied, resistanceRoll, activationChance);
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

  if (valueAttackStates.length == 0) return;

  let animationLoopIndex = 0;
  for (let i = 0; i < valueAttackStates.length; i++) {
    const valueAttackState = valueAttackStates[i];
    if (valueAttackState < 1 || valueStateAnimeArr[valueAttackState] < 1) continue;
    target.startAnimation(valueStateAnimeArr[valueAttackState], true, animationLoopIndex);
    animationLoopIndex += 1;
  }
}

//パーティレベルを一時記憶/呼び出し
party_levelSaveLoad = function (modeId) {

  if (modeId == 0) {
    valuePartyMainLv = Array(21).fill(0);
    valuePartySubLv = Array(21).fill(0);
    const start = $gameVariables.value(75);
    const end = $gameVariables.value(76);
    for (let i = start; i <= end; i++) {
      const actor = $gameActors.actor(i);
      if (!actor || !$gameParty.members().contains(actor)) continue;
      valuePartyMainLv[i] = actor.level;
      if (actor.subclass()) valuePartySubLv[i] = actor.classLevel(actor._subclassId);
    }
    return;
  }
  if (modeId == 1) {
    announceLevelUpsPartyLevelSaveLoad(valuePartyMainLv, "メインジョブ",
      (actor) => actor.level,
      (actor) => $dataClasses[actor._classId]);
    return;
  }
  if (modeId == 2) {
    announceLevelUpsPartyLevelSaveLoad(valuePartySubLv, "サブジョブ",
      (actor) => actor.classLevel(actor._subclassId),
      (actor) => $dataClasses[actor._subclassId]);
  }

};

// Shared level-up announcement for party_levelSaveLoad modes 1 (main job) and
// 2 (sub job). `savedLevels[i]` is the level recorded for actor i, `levelOf`
// reads that actor's live level, `jobJP` names the job kind and `classOf`
// resolves the class whose name is shown.
function announceLevelUpsPartyLevelSaveLoad(savedLevels, jobJP, levelOf, classOf) {
  let levelUpFlag = 0;
  for (let i = 0; i <= savedLevels.length - 1; i++) {
    if (savedLevels[i] < 1) continue;
    const actor = $gameActors.actor(i);
    if (!actor) continue;
    const currentLevel = levelOf(actor);
    if (currentLevel <= savedLevels[i]) continue;
    const classNameBase = classOf(actor).name;
    const actorName = colorTaggedText(2, actor.name());
    const className = colorTaggedText(14, `<${classNameBase}>`);
    const jpbonusCnt = colorTaggedText(19, `${currentLevel - savedLevels[i]}`);
    const levelUpMessage = `${actorName}の${jobJP}${className}Lvが${jpbonusCnt}上がった！ (${currentLevel})`;
    CommonPopupManager.showInfo({}, levelUpMessage, null);
    levelUpFlag = 1;
  }
  if (levelUpFlag == 1) $gamePlayer.requestAnimation(297);
}

//=============================================================================
//=============================================================================
// Weapon-unleash replacement skills
//   backs the <Custom Replace Attack> / <Custom Replace Guard> note blocks in
//   data/Actors.json, data/Weapons.json and data/Armors.json, which used to hold
//   a copy-pasted eval snippet per entry. The notes now only call the functions
//   below, so the logic lives here once. Every note still passes its own numbers.
//=============================================================================

// Attack id per equipped weapon type: 1 -> 101, 2 -> 111, ... 10 -> 191.
const attackIdsMapAcraSub = {
  1: 101, 2: 111, 3: 121, 4: 131, 5: 141,
  6: 151, 7: 161, 8: 171, 9: 181, 10: 191
};

// Guard id per equipped weapon type: 1 -> 501, 2 -> 502, ... 10 -> 510.
const guardIdsMapAcraSub = {
  1: 501, 2: 502, 3: 503, 4: 504, 5: 505,
  6: 506, 7: 507, 8: 508, 9: 509, 10: 510
};

// Weapon in the actor's first weapon slot, or null when that slot is empty or
// its id no longer exists in the database. The old note code read
// user._equips[0]._itemId and then $dataWeapons[id] without checking either.
function replaceFirstSlotWeapon(user) {
  const slot = user._equips && user._equips[0];
  if (!slot || slot._itemId < 1) return null;
  // Game_Item exposes _dataClass; an armour in slot 0 must not resolve as a weapon.
  if (slot._dataClass && slot._dataClass !== 'weapon') return null;
  return $dataWeapons[slot._itemId] || null;
}

// First equipped weapon type (1..10), or 0 when the actor carries none.
function replaceEquippedWeaponType(user) {
  for (let typeId = 1; typeId <= 10; typeId++) {
    if (user.isWtypeEquipped(typeId)) return typeId;
  }
  return 0;
}

// Base attack id from the weapon type; 1 (plain attack) when unarmed.
function replaceBaseAttackId(user) {
  const typeId = replaceEquippedWeaponType(user);
  return typeId ? (attackIdsMapAcraSub[typeId] || 1) : 1;
}

// Base guard id from the weapon type; 0 when the actor carries no weapon.
function replaceBaseGuardId(user) {
  const typeId = replaceEquippedWeaponType(user);
  return typeId ? (guardIdsMapAcraSub[typeId] || 0) : 0;
}

// Bonus every attack replacement shares: only the FIRST match applies. The
// earliest version of this code summed all of them, so an actor with state 282
// *and* an extra learned skill got +7 instead of +5.
function replaceAttackBonusId(user, attackId) {
  if (user.isStateAffected(283)) return attackId + 6;
  if (user.isStateAffected(282)) return attackId + 5;
  if (user.isLearnedSkill(attackId + 4)) return attackId + 4;
  if (user.isLearnedSkill(attackId + 3)) return attackId + 3;
  if (user.isLearnedSkill(attackId + 2)) return attackId + 2;
  if (user.isLearnedSkill(attackId + 1)) return attackId + 1;
  return attackId;
}

// <UniqueOugi> resolves to variable 287[actorId][9]; 0 when that is not set.
function replaceUniqueOugiId(user) {
  const uniqueData = $gameVariables.value(287);
  if (!Array.isArray(uniqueData)) return 0;
  const actorData = uniqueData[user.actorId()];
  if (!Array.isArray(actorData)) return 0;
  return Number(actorData[9]) || 0;
}

// States 63/64 (plus skill 66) short-circuit to the actor's special attacks.
// Actors without that state pair call actor_custom_replace_attack_sub directly.
actor_custom_replace_attack = function (user, attackWhenArmed, attackWhenUnarmed) {
  const userStateAffected64 = user.isStateAffected(64);
  return (userStateAffected64 || user.isStateAffected(63))
    ? (userStateAffected64 || user.isLearnedSkill(66) ? attackWhenArmed : attackWhenUnarmed)
    : actor_custom_replace_attack_sub(user);
};

// Weapon driven attack replacement; returns 1 (plain attack) when unarmed.
actor_custom_replace_attack_sub = function(user) {
  const firstWeapon = replaceFirstSlotWeapon(user);
  if (!firstWeapon) return 1;

  // <SpecialAttack> on the weapon overrides everything below.
  const specialAttackMeta = firstWeapon.meta['SpecialAttack'];
  if (specialAttackMeta) {
    const specialAttackId = Number(specialAttackMeta);
    if (specialAttackId >= 1) return specialAttackId;
  }
  return replaceAttackBonusId(user, replaceBaseAttackId(user));
};

// A weapon note that pins one attack id for whoever carries it, ignoring
// equipment and TP (data/Weapons.json, id 1 = sword -> 101).
actor_custom_replace_attack_fixed = function (user, baseSkillId) {
  return replaceAttackBonusId(user, baseSkillId);
};

// An armour note that shifts the weapon-type attack id while TP is still below
// tpLimit (data/Armors.json, id 23 = +2 below full TP). When the condition is
// not met it hands back fallbackSkillId so the caller leaves its own id alone.
actor_custom_replace_attack_shifted = function (user, offset, tpLimit, fallbackSkillId) {
  if (user.tp >= tpLimit) return fallbackSkillId;
  const typeId = replaceEquippedWeaponType(user);
  if (!typeId) return fallbackSkillId;
  return (attackIdsMapAcraSub[typeId] || 0) + offset;
};

// Guard replacement derived from the weapon's first trait (code 43 = add skill),
// then overridden by <SpecialOugi> and finally by <UniqueOugi>.
// activeOnly: true  -> when there is no weapon in slot 1 or TP is below 100,
//                     hand back fallbackSkillId so the caller can keep its own
//                     id untouched (actors that only replace at full TP).
// activeOnly: false -> fall back to the plain guard id 2 instead.
actor_custom_replace_guard = function (user, activeOnly, fallbackSkillId) {
  const weapon = replaceFirstSlotWeapon(user);
  if (!weapon || user.tp < 100) return activeOnly ? fallbackSkillId : 2;
  return resolveGuardSkillBattleRefactor(user, weapon);
};

// Guard replacement derived from the weapon type (501 .. 510), with
// <SpecialOugi> overriding it. Same activeOnly handling as above.
actor_custom_replace_guard1 = function (user, activeOnly, fallbackSkillId) {
  const weapon = replaceFirstSlotWeapon(user);
  if (!weapon || user.tp < 100) return activeOnly ? fallbackSkillId : 2;
  const baseGuardId = replaceBaseGuardId(user) || 2;
  return applyGuardOverridesBattleRefactor(user, weapon, baseGuardId);
};

//ボス行動コモン内予測計算
//boss_actionPredict = function(value1){

//};

//})();


// Named implementation helpers; original global entry points remain available.
const battleRefactorStateDropGroups = [
  [
    610,
    [
      [
        0,
        0,
        10
      ],
      [
        1,
        0,
        196
      ],
      [
        3,
        0,
        197
      ],
      [
        5,
        0,
        198
      ],
      [
        9,
        0,
        199
      ],
      [
        6,
        0,
        190
      ],
      [
        7,
        0,
        147
      ],
      [
        10,
        0,
        148
      ],
      [
        8,
        0,
        152
      ],
      [
        8,
        0,
        153
      ],
      [
        10,
        0,
        170
      ]
    ]
  ],
  [
    451,
    [
      [
        6,
        0,
        191
      ],
      [
        6,
        0,
        161
      ],
      [
        6,
        0,
        163
      ]
    ]
  ],
  [
    452,
    [
      [
        7,
        0,
        192
      ],
      [
        6,
        0,
        162
      ],
      [
        6,
        0,
        164
      ]
    ]
  ],
  [
    453,
    [
      [
        8,
        0,
        193
      ],
      [
        10,
        0,
        169
      ]
    ]
  ],
  [
    454,
    [
      [
        10,
        0,
        194
      ],
      [
        10,
        0,
        169
      ]
    ]
  ],
  [
    441,
    [
      [
        6,
        0,
        165
      ]
    ]
  ],
  [
    442,
    [
      [
        6,
        0,
        165
      ]
    ]
  ],
  [
    443,
    [
      [
        6,
        0,
        166
      ]
    ]
  ],
  [
    446,
    [
      [
        6,
        0,
        167
      ]
    ]
  ],
  [
    455,
    [
      [
        6,
        0,
        168
      ]
    ]
  ],
  [
    448,
    [
      [
        10,
        0,
        169
      ]
    ]
  ],
  [
    440,
    [
      [
        5,
        0,
        220
      ],
      [
        8,
        0,
        240
      ]
    ]
  ],
  [
    461,
    [
      [
        5,
        0,
        251
      ]
    ]
  ],
  [
    462,
    [
      [
        5,
        0,
        252
      ]
    ]
  ],
  [
    463,
    [
      [
        5,
        0,
        253
      ]
    ]
  ],
  [
    464,
    [
      [
        5,
        0,
        254
      ]
    ]
  ],
  [
    465,
    [
      [
        5,
        0,
        255
      ],
      [
        3,
        0,
        1287
      ]
    ]
  ],
  [
    466,
    [
      [
        5,
        0,
        256
      ]
    ]
  ],
  [
    467,
    [
      [
        5,
        0,
        257
      ]
    ]
  ],
  [
    479,
    [
      [
        6,
        0,
        270
      ],
      [
        5,
        0,
        269
      ]
    ]
  ]
];

function setDropEnemyLevelBattleRefactor(user) {
  if ($gameParty.inBattle()) {
    valueDropEnemyLevel = user.level;
    return true;
  }
  const viewpointActor = $gameActors.actor($gameVariables.value(11));
  const levelReference = viewpointActor || $gameParty.leader();
  if (!levelReference) return false;
  valueDropEnemyLevel = Math.ceil(levelReference.level / 2);
  return true;
}
function appendStateDropCopiesBattleRefactor(user, stateId, entries, drops) {
  if (!user.isStateAffected(stateId)) return;
  for (const entry of entries) drops.push(entry.slice());
}
function appendPowerAndElementDropsBattleRefactor(user, drops) {
  let powerDropCount = 0;
  for (const stateId of valueAddPowerCustomState) {
    if (!user.isStateAffected(stateId)) continue;
    const stateData = $dataStates[stateId];
    if (stateData) powerDropCount += Number(stateData.meta.AddPowerCustom) || 0;
  }
  for (let count = 0; count < powerDropCount; count++) drops.push([6, 0, 153]);
  for (let stateId = 51; stateId <= 56; stateId++) {
    if (user.isStateAffected(stateId)) drops.push([4, 0, stateId + 103]);
  }
}
function appendArmorAndLevelDropsBattleRefactor(user, drops) {
  for (const stateId of getItemDropDataStateIds) {
    appendStateDropCopiesBattleRefactor(user, stateId, [[6, 0, 170], [6, 2, stateId - 780]], drops);
  }
  appendStateDropCopiesBattleRefactor(user, 410, [
    [6, 0, 185], [7, 0, 186], [8, 0, 187], [10, 0, 188], [5, 0, 1115], [8, 0, 1117]
  ], drops);
  if (valueDropEnemyLevel >= 1 && valueDropEnemyLevel <= 20) {
    appendStateDropCopiesBattleRefactor(user, 410, [
      [2, 0, 1118], [3, 0, 1119], [4, 0, 1120], [5, 0, 1121]
    ], drops);
  }
  if (valueDropEnemyLevel >= 11) {
    appendStateDropCopiesBattleRefactor(user, 410, [
      [6, 0, 1122], [7, 0, 1123], [8, 0, 1124], [10, 0, 1125]
    ], drops);
  }
}
function appendRaceDropsBattleRefactor(user, drops) {
  for (let stateId = 421; stateId <= 439; stateId++) {
    if (!user.isStateAffected(stateId)) continue;
    const stateData = $dataStates[stateId];
    const raceDropKind = stateData && stateData.meta.RaceDropKind;
    if (!raceDropKind) continue;
    for (const itemIdText of raceDropKind.split(',')) {
      const itemId = Number(itemIdText);
      const itemData = $dataItems[itemId];
      const rarity = itemData && itemData.meta.RaceDropRarity;
      if (rarity) drops.push([Number(rarity), 0, itemId]);
    }
  }
}

function recordSubjugationBattleRefactor(user, isInBattle) {
  const subjugationCounts = $gameVariables.value(52);
  const messages = [];
  for (let index = 1; index < valueSubjugationPoint.length; index++) {
    const stateId = valueSubjugationPoint[index];
    if (!user.isStateAffected(stateId)) continue;
    subjugationCounts[stateId] += 1;
    if (isInBattle) continue;
    const tribeName = `\x1bSIM[${stateId}]`;
    const countText = colorTaggedText(10, '+1');
    const message = `${tribeName}：討伐数${countText}\n`;
    messages.push(message);
    $gameSystem.pushInfoLog(message);
  }
  valueWordSet3 += messages.join('');
  if (user.isStateAffected(436)) return;
  subjugationCounts[1] += 1;
  subjugationCounts[2] += 1;
}
function getDropOriginBattleRefactor(user) {
  const memberIndex = user.index() + 1;
  return { x: $gameTroop.getX(memberIndex), y: $gameTroop.getY(memberIndex) };
}
function showBattleDropBattleRefactor(item, sourceKind, origin) {
  $gameTroop.addDropItem(item);
  const shiftX = xShiftCoordsEnemyDropSelection[getRandomIndex(xShiftCoordsEnemyDropSelection.length)];
  const shiftY = yShiftCoordsEnemyDropSelection[getRandomIndex(yShiftCoordsEnemyDropSelection.length)];
  const duration = durationsEnemyDropSelection[getRandomIndex(durationsEnemyDropSelection.length)];
  const pictureName = itemsSourceKindPicNamesEnemyDropSelection[sourceKind];
  picture_motion1('smooth', [0]);
  $gameScreen.showPicture(valueDropEnemyPicId, pictureName, 1, origin.x, origin.y, 100, 100, 255, 0);
  $gameScreen.movePicture(valueDropEnemyPicId, 1, origin.x + shiftX, origin.y + shiftY, 100, 100, 0, 0, duration);
  valueDropEnemyPicId += 1;
}
function grantFootpadDropBattleRefactor(sourceKind, itemId) {
  // Event scratch variables are part of the footpad/event contract.
  $gameVariables.setValue(22, sourceKind);
  $gameVariables.setValue(23, itemId);
  item_getSkillLevel(valueFootpadSkillId, $gameVariables.value(22), $gameVariables.value(23));
}
function recordPlainDropBattleRefactor(item, messages) {
  $gameParty.gainItem(item, 1);
  const itemName = colorTaggedText(2, item.name);
  const itemIcon = `\x1bI[${item.iconIndex}]`;
  const itemTitle = `${itemIcon}${itemName}`;
  const countText = colorTaggedText(2, '1');
  const message = `${itemTitle}を${countText}個入手！\n`;
  messages.push(message);
  $gameSystem.pushInfoLog(message);
}

function selectGenericDropCategoryBattleRefactor(fallbackCategory, useWalletFallback) {
  const dungeonItemId = $gameVariables.value(240);
  const dungeonItem = $dataItems[dungeonItemId];
  const categories = dungeonItem && dungeonItem.meta.GenericDropRate;
  if (dungeonItemId < 1 || !categories) return fallbackCategory;
  const choices = categories.split(',');
  const selectedCategory = Number(choices[getRandomIndex(choices.length)]);
  return useWalletFallback ? selectedCategory || 1 : selectedCategory;
}
function appendGenericDropTicketsBattleRefactor(itemId, category, isBattle, candidates) {
  const item = $dataItems[itemId];
  if (!item || (!isBattle && item.meta.NoBattleDrop) || !item.meta.DropRate) return;
  const lotteryWeight = item.meta.DropLottery ? Number(item.meta.DropLottery) : 1;
  if (!Number.isFinite(lotteryWeight)) return;
  // Duplicate matching categories intentionally multiply the weight.
  for (const dropCategory of item.meta.DropRate.split(',')) {
    if (dropCategory != category) continue;
    for (let ticket = 1; ticket <= lotteryWeight; ticket++) candidates.push(itemId);
  }
}

function collectWalletCandidatesBattleRefactor(category, listType) {
  const candidates = [];
  for (let itemId = 1; itemId < $dataItems.length; itemId++) {
    const item = $dataItems[itemId];
    if (!item || !item.meta[listType] || !item.meta.DropRate) continue;
    if (listContainsNumber(item.meta.DropRate.split(','), category)) candidates.push(itemId);
  }
  return candidates;
}
function grantPopupItemBattleRefactor(item) {
  if (!item) return;
  const itemName = colorTaggedText(24, `\x1bI[${item.iconIndex}]${item.name}`);
  CommonPopupManager.showInfo({}, `${itemName}を獲得した。`, null);
  $gameParty.gainItem(item, 1);
}

function minimumEnemyDropLevelBattleRefactor(rarity) {
  switch (rarity) {
    case 1: case 2: return 1;
    case 3: return 10;
    case 4: return 20;
    case 5: case 6: return 30;
    case 7: case 8: return 40;
    case 9: case 10: return 50;
    default: return Infinity;
  }
}

function resolveClassDropContextBattleRefactor() {
  if ($gameParty.inBattle()) {
    if (typeof valueClassState === 'undefined' || !Array.isArray(valueClassState)) return null;
    return { dropData: valueClassState, enemyLevel: valueEnemyLevel };
  }
  const mapEvent = $gameMap.event(valueEnemyEventId);
  const eventData = mapEvent && mapEvent.event();
  if (!eventData || !eventData.meta.classStateDrop) return null;
  const dungeonItemId = $gameVariables.value(240);
  const dungeonItem = $dataItems[dungeonItemId];
  const levels = dungeonItem && dungeonItem.meta.EnemyLV ? dungeonItem.meta.EnemyLV.split(',') : [];
  // No dungeon selection means no level lottery draw (the existing event contract).
  const enemyLevel = dungeonItemId !== 0 && levels.length ? Number(levels[getRandomIndex(levels.length)]) : 30;
  return { dropData: eventData.meta.classStateDrop.split(','), enemyLevel: enemyLevel };
}
function collectClassEquipmentBattleRefactor(entries, lastIndex, isArmor, requiredType, maximumRarity) {
  const candidates = [0]; // The original lottery intentionally includes a no-drop ticket.
  for (let itemId = 1; itemId <= lastIndex; itemId++) {
    const item = entries[itemId];
    if (!item || !item.meta.LotteryRearity || item.meta.GatchaOutOfRange) continue;
    const equipmentType = isArmor ? item.atypeId : item.wtypeId;
    if (equipmentType === requiredType && maximumRarity >= Number(item.meta.LotteryRearity)) candidates.push(itemId);
  }
  return candidates;
}

function minimumStateDropLevelBattleRefactor(category) {
  if (category < 7) return 20;
  switch (category) {
    case 7: return 30;
    case 8: return 40;
    default: return 50;
  }
}

function burstEquipmentPowerBattleRefactor(user, skill) {
  if (!user.isActor()) return Math.round(user.level / 10);
  if (skill.meta['ユニーク']) return uniqueBonusSkillAddPowerSet(user);
  const weapon = replaceFirstSlotWeapon(user);
  return weapon && weapon.meta.LotteryRearity ? Number(weapon.meta.LotteryRearity) : 0;
}

function rememberEquippedSkillsBattleRefactor(actor, actorName) {
  const rememberedLoadouts = $gameVariables.value(351);
  rememberedLoadouts[actor.actorId()] = actor.battleSkillsRaw().slice();
  TickerManager.show(`${actorName}のスキル装備状態を記録しました`);
}
function restoreEquippedSkillsBattleRefactor(actor, actorName) {
  const rememberedLoadouts = $gameVariables.value(351);
  const rememberedSkills = rememberedLoadouts[actor.actorId()];
  if (!Array.isArray(rememberedSkills) || rememberedSkills.length === 0) {
    TickerManager.show(`${actorName}はスキル装備状態を記録していません`);
    return;
  }
  actor.clearEquipBattleSkills();
  for (let slot = 0; slot < rememberedSkills.length; slot++) actor.equipSkill(rememberedSkills[slot], slot);
  TickerManager.show(`${actorName}のスキル装備状態を復元しました`);
}
function collectAvailableSkillsBattleRefactor(actor) {
  const slotCount = actor.battleSkillsRaw().length;
  const skillIds = Array(slotCount).fill(0);
  const slotIndex = { normal: 0, gPassive: slotCount - 200, hPassive: slotCount - 100 };
  const addedSkillIds = new Set(actor.addedSkills());
  for (let skillId = 1; skillId < $dataSkills.length; skillId++) {
    const skill = $dataSkills[skillId];
    if (!skill || !skill.name || !skill.meta['Skill Tier']) continue;
    if (!actor.isLearnedSkill(skillId) && !addedSkillIds.has(skillId)) continue;
    assignSkillSlotSkillEquipOperation(skillIds, slotIndex, skillId, skill.stypeId);
  }
  return skillIds;
}
function equipAvailableSkillsBattleRefactor(actor, actorName) {
  const skillIds = collectAvailableSkillsBattleRefactor(actor);
  if (!skillIds.some(skillId => skillId > 0)) {
    TickerManager.show(`${actorName}は装備可能なスキルを保有していません。`);
    return;
  }
  actor.clearEquipBattleSkills();
  for (let slot = 0; slot < skillIds.length; slot++) {
    const skillId = skillIds[slot];
    if (!skillId) continue;
    const tier = Number($dataSkills[skillId].meta['Skill Tier']);
    if (actor.getEquipSkillTierCount(tier) >= actor.getEquipSkillTierMax(tier)) continue;
    actor.equipSkill(skillId, slot);
  }
  TickerManager.show(`${actorName}は装備可能なスキルを全て装着しました。`);
}

function showStateRollResultBattleRefactor(targetName, stateName, applied, roll, chance) {
  const resultMessage = applied ? `${targetName}は${stateName}を付与された…。` : `${targetName}は${stateName}を無効化した！`;
  const rollText = colorTaggedText(4, roll);
  const chanceText = colorTaggedText(10, chance);
  const comparison = applied ? '<' : '>=';
  showMessage(`${resultMessage}（判定：${rollText} ${comparison} ${chanceText}）`);
}

function resistanceStateBattleRefactor(target) {
  return $dataStates[(target.isEnemy() ? 490 : 486) + target.index()];
}
function normalizedStateCategoryBattleRefactor(state) {
  return state.meta.Category ? String(state.meta.Category).trim() : '';
}

function addAccumulatedStateResistanceBattleRefactor(target, stateId, state) {
  let resistanceFactor = target.isStateAffected(289) ? 0.2 : 0.1;
  if (state.meta.registUp) {
    const configuredRate = Number(state.meta.registUp) / 100;
    if (Number.isFinite(configuredRate)) resistanceFactor = Math.max(0, Math.min(1, configuredRate));
  }
  const resistanceState = resistanceStateBattleRefactor(target);
  if (resistanceState) resistanceState.traits.push({ code: 13, dataId: stateId, value: 1 - resistanceFactor });
}
function applyReactiveStatesBattleRefactor(target) {
  const abilityType = $gameVariables.value(182);
  for (const stateId of valueStateAddState) {
    if (!target.isStateAffected(stateId)) continue;
    const state = $dataStates[stateId];
    if (!state || !state.meta.stateAddState) continue;
    const config = state.meta.stateAddState.split(',');
    if (Number(config[0]) !== abilityType) continue;
    const additionalStateId = Number(config[1]);
    const repetitions = Number(config[2]);
    for (let repeat = 1; repeat <= repetitions; repeat++) target.addState(additionalStateId);
  }
}
function playStateAnimationBattleRefactor(target, animationId) {
  const delay = $gameVariables.value(279);
  target.startAnimation(animationId, false, delay);
  $gameVariables.setValue(279, delay + $gameVariables.value(280));
}

function resolveGuardSkillBattleRefactor(user, firstWeapon) {
  const firstTrait = firstWeapon.traits && firstWeapon.traits[0];
  const baseGuardId = firstTrait === undefined ? 2 : firstTrait.dataId;
  return applyGuardOverridesBattleRefactor(user, firstWeapon, baseGuardId, true);
}
// <SpecialOugi> overrides the base id, then <UniqueOugi> overrides both. Slot 9
// of the actor array is the unique-ougi id (see replaceUniqueOugiId).
function applyGuardOverridesBattleRefactor(user, firstWeapon, baseGuardId, includeUniqueOugi) {
  let guardSkillId = baseGuardId;
  if (firstWeapon.meta.SpecialOugi) {
    const specialOugiId = Number(firstWeapon.meta.SpecialOugi);
    if (specialOugiId >= 1) guardSkillId = specialOugiId;
  }
  if (includeUniqueOugi && firstWeapon.meta.UniqueOugi) {
    const uniqueOugiId = replaceUniqueOugiId(user);
    if (uniqueOugiId >= 1) guardSkillId = uniqueOugiId;
  }
  return guardSkillId;
}

function accumulateInstantwinRewardsBattleRefactor(dropActor, enemyLevels, enemyIds, enemyCount) {
  const rewards = { exp: 0, gold: 0 };
  const dropUpItem = $dataItems[valueItemDropUpItem];
  const dropCandidates = [];
  for (let popIndex = 1; popIndex <= enemyCount; popIndex++) {
    const enemyLevel = Number(enemyLevels[getRandomIndex(enemyLevels.length)]) || 1;
    const levelOffset = enemyLevel - 1;
    const enemyId = Number(enemyIds[getRandomIndex(enemyIds.length)]);
    const enemy = $dataEnemies[enemyId];
    if (!enemy) continue;
    rewards.exp += Math.round(enemy.exp * (1 + levelOffset * INSTAWIN_EXP_RATE_MULTIPLIER) + INSTAWIN_EXP_FLAT_BONUS * levelOffset);
    rewards.gold += Math.round(enemy.gold * (1 + levelOffset * INSTAWIN_GOLD_RATE_MULTIPLIER) + INSTAWIN_GOLD_FLAT_BONUS * levelOffset);
    enemy_dropSelection(dropActor);
    if (drop_probabilityCalculation(enemyLevel, dropUpItem) < 90) continue;
    dropCandidates.length = 0;
    drop_enemyDropRate(0, dropCandidates);
    const itemId = drop_genericDropRate(0, dropCandidates);
    const messages = [];
    recordInstantwinDropEnemyInstantwin($dataItems[itemId], messages);
    valueWordSet1 += messages.join('');
  }
  return rewards;
}
function displayInstantwinRewardsBattleRefactor(rewards) {
  const resultTitle = colorTaggedText(2, 'BattleResult!');
  const experienceText = colorTaggedText(10, rewards.exp);
  const goldText = colorTaggedText(14, rewards.gold) + '\\G';
  const rewardsMessage = `経験値${experienceText}、${goldText}を入手！ JPを1獲得した。`;
  const resultMessage = `${resultTitle}\n${rewardsMessage}`;
  $gameSystem.pushInfoLog(resultMessage);
  valueWordSet2 = `${resultMessage}\n`;
}
function grantInstantwinRewardsBattleRefactor(rewards) {
  for (const actor of $gameParty.battleMembers()) {
    actor.changeExp(actor.currentExp() + rewards.exp, false);
    if (actor.subclass()) actor.gainExpSubclass(rewards.exp);
  }
  $gameParty.gainGold(rewards.gold);
}
function publishInstantwinSummaryBattleRefactor() {
  const dropCount = countNewlines(valueWordSet1);
  const defeatCount = countNewlines(valueWordSet3);
  if (dropCount + defeatCount <= 6) {
    $gameVariables.setValue(701, `${valueWordSet2}${valueWordSet1}${valueWordSet3}`);
    return;
  }
  let message = valueWordSet2;
  if (dropCount >= 1) {
    const dropCountText = colorTaggedText(2, `+${dropCount}`);
    message += `ドロップ(${dropCountText})\n`;
  }
  if (defeatCount >= 1) {
    const defeatCountText = colorTaggedText(2, `+${defeatCount}`);
    message += `討伐カウント(${defeatCountText})`;
  }
  $gameVariables.setValue(701, message);
}

function selectAttackWordsBattleRefactor(actor, actorMeta, words) {

    valueFaceSelect = 8;
    if (actor.tp >= 100) {
      valueFaceSelect = 48;

    };
    words.attackWordCandidates = actorMeta['BattleAttack'].split(',');
    if (actor.isStateAffected(61)) {
      valueFaceSelect = pickFaceSelectBattleWordset([21, 22, 23, 24]);
    };
    if (actor.isStateAffected(68)) {
      valueFaceSelect = pickFaceSelectBattleWordset([17, 18, 19, 20]);
    };
    const abilityWord = selectAbilityWordBattleWordset($gameVariables.value(182));
    if (abilityWord) {
      words.attackWordCandidates = actorMeta[abilityWord.meta].split(',');
      // 6 (A-AbilityUse) reuses the normal-attack face, hence face === null.
      if (abilityWord.face !== null) valueFaceSelect = abilityWord.face;
    }

}

function selectDamageWordsBattleRefactor(actor, actorMeta, words) {

    valueFaceSelect = 9;
    const damageThresholdVar514 = $gameVariables.value(514);
    const currentHpPercent = actor.hpRate() * 100;
    words.damageWordCandidates = actorMeta['BattleDamage'].split(',');
    if (damageThresholdVar514 - currentHpPercent >= 50) {
      words.damageWordCandidates = actorMeta['BattleBigDamage'].split(',');
      valueFaceSelect = 45;
    }
    else if (damageThresholdVar514 == currentHpPercent) {
      words.damageWordCandidates = actorMeta['Battle0Damage'].split(',');
      valueFaceSelect = 6;
    }
    else if (damageThresholdVar514 - currentHpPercent <= 2) {
      words.damageWordCandidates = actorMeta['BattleSmallDamage'].split(',');
      valueFaceSelect = 4;
    }
}

function selectStatusWordsBattleRefactor(actor, actorMeta, words) {
    if ($gameVariables.value(263) >= 3) { //ターン数 
      words.statusWordCandidates = actorMeta['BattleTurn2'].split(',');
    }
    if ([34, 35, 36].some(function (id) { return actor.isStateAffected(id) })) {  //疲労時
      words.statusWordCandidates = actorMeta['BattleFatigue'].split(',');
    }
    if (actor.isStateAffected(37)) {  //ブラック
      words.statusWordCandidates = actorMeta['BattleFatigueBlack'].split(',');
      words.attackWordCandidates = actorMeta['BattleFatigueBlackAttack'].split(',');
      words.damageWordCandidates = actorMeta['BattleFatigueBlackDamage'].split(',');
    }
    if (actor.hpRate() <= 0.3) {  //瀕死  
      words.statusWordCandidates = actorMeta['BattleDying'].split(',');
    }
    if ($gameParty.battleMembers().length >= 2 && $gameParty.aliveMembers().length <= 1) {  //最後の一人
      words.statusWordCandidates = actorMeta['BattleLastOne'].split(',');
    }

    // Skill 65 turns several of these states into their "Max" variant.
    const maxed = actor.isLearnedSkill(65);
    if (actor.isStateAffected(61) && isGirl(actor)) {  //発情
      words.statusWordCandidates = actorMeta[maxed ? 'BattleSexualExcitementMax' : 'BattleSexualExcitement'].split(',');
      words.attackWordCandidates = actorMeta[maxed ? 'BattleSexualExcitementMaxAttack' : 'BattleSexualExcitementAttack'].split(',');//攻撃
      words.damageWordCandidates = actorMeta[maxed ? 'BattleSexualExcitementMaxDamage' : 'BattleSexualExcitementDamage'].split(',');//ダメージ
    }
    if (actor.isStateAffected(63) && isGirl(actor)) {    //拘束
      words.statusWordCandidates = actorMeta[maxed ? 'BattleBindMax' : 'BattleBind'].split(',');
    };
    if (actor.isStateAffected(68) && isGirl(actor)) {    //激情
      words.statusWordCandidates = actorMeta['BattlePassion'].split(',');
    };
    if (actor.isStateAffected(64) && isGirl(actor)) {    //放心
      words.statusWordCandidates = actorMeta[maxed ? 'BattleAbsentlyMax' : 'BattleAbsently'].split(',');
    };
}

function findRescuingMemberIndexBattleRefactor(battleMembers) {
  for (let index = 0; index < battleMembers.length; index++) {
    if (battleMembers[index].isStateAffected(89)) return index;
  }
  return -1;
}
function placeRescueBattlersBattleRefactor(rescuingMemberIndex, enemyMovementData) {
  if (!enemyMovementData) return;
  const troopMemberIndex = $gameVariables.value(92) + 1;
  $gameTroop.set(troopMemberIndex, enemyMovementData[0], enemyMovementData[1], 30);
  $gameParty.set(rescuingMemberIndex + 1, enemyMovementData[0], enemyMovementData[1], 30);
}

// Level lottery, boss level handling, troop/global bonuses and the "copy the
// protagonist's level" case (EnemyLV 0).
function resolveEnemyBattleLevelBattleRefactor(gameTroopMember, target, enemyId) {
  const enemyLevelMeta = target.meta.EnemyLV;
  const enemyLevelChoices = enemyLevelMeta ? enemyLevelMeta.split(',') : [1, 1];
  let level = Number(enemyLevelChoices[getRandomIndex(enemyLevelChoices.length)]);
  if (enemyId == 30) {
    if (target.meta.BossLV) level = Number(target.meta.BossLV);
    if (level >= 30) gameTroopMember.addState(310);
  }
  if (level >= 1) {
    level = applyLevelBonusEnemyBattleSetting(level, enemyId);
    if (valueEnemyAddLevel >= 1) level += valueEnemyAddLevel;
    const dungeonItemId = $gameVariables.value(240);
    if (dungeonItemId >= 1) level += $gameVariables.value(257)[dungeonItemId];
    level = Math.round(level);
    gameTroopMember.changeLevel(level);
  }
  if (enemyLevelMeta && Number(enemyLevelMeta) == 0) {
    const protagonist = $gameActors.actor($gameVariables.value(2));
    if (protagonist) {
      level = protagonist.level;
      gameTroopMember.changeLevel(level);
    }
  }
  return level;
}
// Element state from <EnemyElement> (or <BossElement> for enemy 30): the
// enemy's own <defaultState> is removed first when it differs.
function applyEnemyElementStateBattleRefactor(gameTroopMember, target, enemyId) {
  const elementMeta = target.meta.EnemyElement;
  const elementChoices = elementMeta ? elementMeta.split(',') : [0, 0];
  let elementStateId = Number(elementChoices[getRandomIndex(elementChoices.length)]);
  if (enemyId == 30 && target.meta.BossElement) elementStateId = Number(target.meta.BossElement);
  if (elementStateId == 0) return;
  const enemy = $dataEnemies[enemyId];
  const defaultState = enemy && enemy.meta.defaultState;
  if (defaultState && Number(defaultState) != elementStateId) gameTroopMember.removeState(Number(defaultState));
  gameTroopMember.addState(elementStateId);
}
// Variable 350 holds map-wide extra states; 345 is indexed by troop slot
// (enemy 20..29) and 343 holds boss-only states plus the boss drop table.
function applyEnemySlotStatesBattleRefactor(gameTroopMember, enemyId, target) {
  const mapStateIds = $gameVariables.value(350);
  if (mapStateIds != 0) applyEnemyStateIdsEnemyBattleSetting(gameTroopMember, mapStateIds, gameTroopMember.level);
  if (enemyId >= 20 && enemyId <= 29) {
    const slotStates = $gameVariables.value(345)[enemyId - 20];
    if (slotStates) for (const stateId of slotStates) gameTroopMember.addState(stateId);
  }
  if (enemyId == 30 && $gameVariables.value(343) != 0) {
    for (const stateId of $gameVariables.value(343)) gameTroopMember.addState(stateId);
    applyBossDropsEnemyBattleSetting(target);
  }
}
function applyEnemySexStatesBattleRefactor(gameTroopMember, enemy) {
  const meta = enemy.meta;
  if (meta.Man || meta.Woman) {
    if (meta.Man) gameTroopMember.addState(459);
    if (meta.Woman) gameTroopMember.addState(460);
  } else if (!meta.Nonsexual) {
    gameTroopMember.addState(!isHEnemyOrNonAuto() && getRandomIndex(11) == 7 ? 460 : 459);
  }
  if (gameTroopMember.level >= 60 && !gameTroopMember.isStateAffected(436)) gameTroopMember.addState(406);
  if (gameTroopMember._enemyId != 30 && gameTroopMember.level >= 40 && $gameTroop.aliveMembers().length == 1) {
    gameTroopMember.addState(475);
  }
}
// 捕食者 (455) appears immediately and marks weaker allies as 被捕食者 (456).
function applyPredatorStatesBattleRefactor(gameTroopMember, gameTroopMembers) {
  if (!gameTroopMember.isStateAffected(455)) return;
  gameTroopMember.appear();
  const threshold = gameTroopMember.level + 10;
  for (const enemy of gameTroopMembers) {
    if (enemy.isStateAffected(455)) continue;
    if (threshold >= enemy.level) enemy.addState(456);
  }
  for (const actor of $gameParty.battleMembers()) {
    if (actor.isStateAffected(455)) continue;
    if (threshold >= actor.level) actor.addState(456);
  }
}
function addEnemyDropsBattleRefactor(gameTroopMember, enemyId) {
  if (enemyId == 30) {
    const fixedBossDrops = $gameVariables.value(628);
    if (fixedBossDrops != 0) {
      for (const itemId of fixedBossDrops) {
        if (itemId < 1) continue;
        $gameTroop.addDropItem($dataItems[itemId]);
      }
    }
  }
  for (const stateId of valueStateGetItems) {
    if (!gameTroopMember.isStateAffected(stateId)) continue;
    const state = $dataStates[stateId];
    const itemId = Number(state.meta.SubjugationPointItem);
    $gameTroop.addDropItem($dataItems[itemId]);
  }
}
function addEnemyRewardRatesBattleRefactor(gameTroopMember) {
  if (!gameTroopMember.isAlive()) return;
  addStateMetaTotalBattleRefactor(gameTroopMember, valueStateEnemyExpRate, 'EnemyExpRate', 'exp');
  addStateMetaTotalBattleRefactor(gameTroopMember, valueStateEnemyGoldRate, 'EnemyGoldRate', 'gold');
}
function addStateMetaTotalBattleRefactor(gameTroopMember, stateIds, metaKey, rewardKind) {
  for (const stateId of stateIds) {
    if (!gameTroopMember.isStateAffected(stateId)) continue;
    const state = $dataStates[stateId];
    const rate = state && state.meta[metaKey];
    if (!rate) continue;
    if (rewardKind === 'exp') valueTotalexp += Number(rate);
    else valueTotalgold += Number(rate);
  }
}
function rollEnemyGenericDropsBattleRefactor(gameTroopMember) {
  const dropUpItem = $dataItems[valueItemDropUpItem];
  const dropRolls = getRandomIndex(4);
  for (let roll = 1; roll <= dropRolls; roll++) {
    if (drop_probabilityCalculation(gameTroopMember.level, dropUpItem) >= 90) rollGenericDropEnemyBattleSetting();
  }
  if (drop_probabilityCalculation(gameTroopMember.level, dropUpItem) < 90) return;
  const classStateId = firstAffectedStateBattleRefactor(gameTroopMember, valueClassStateA);
  if (classStateId < 1 || !$dataStates[classStateId].meta.classStateDrop) return;
  valueClassState = $dataStates[classStateId].meta.classStateDrop.split(',');
  valueEnemyLevel = gameTroopMember.level;
  drop_JobStateWAget(1, 10);
  drop_JobStateWAget(2, 10);
}
function firstAffectedStateBattleRefactor(battler, stateIds) {
  let matchedStateId = 0;
  for (const stateId of stateIds) {
    if (battler.isStateAffected(stateId)) matchedStateId = stateId;
  }
  return matchedStateId;
}

// 182 = 13 is the dedicated ougi cut-in (skill 91); otherwise the current
// action item decides, and 12 upgrades a <CutInSkillSet> entry to type 2.
function resolveCutinTypeBattleRefactor(abilityUsageDistinction) {
  let cutinType = 0;
  let skillId;
  if (abilityUsageDistinction == 13) {
    cutinType = 4;
    skillId = 91;
  } else {
    const action = BattleManager._action;
    skillId = action && action._item ? action._item._itemId : 0;
  }
  if (abilityUsageDistinction == 12) {
    const skill = $dataSkills[skillId];
    cutinType = skill && skill.meta.CutInSkillSet ? 2 : 1;
  }
  return cutinType;
}
function playOugiBgmCutinPreparation(actorData) {
  const currentSkill = $dataSkills[$gameVariables.value(96)];
  const isHighQualityBurst = actorData && currentSkill && currentSkill.meta.HiQualityBurst;
  const bgmName = isHighQualityBurst ? '21_BattleOugiBest' : '21_BattleOugi';
  AudioManager.playBgm({ name: bgmName, volume: 50, pitch: 110, pan: 0 });
}
function speakOugiUseLineCutinPreparation(actor, actorData) {
  const ougiUseMeta = actorData.meta.OugiUse;
  if (!ougiUseMeta) return;
  const ougiUseOptions = ougiUseMeta.split(',');
  const selectedOption = ougiUseOptions[getRandomIndex(ougiUseOptions.length)];
  gabWord_exeScriptNoFace([[`${actor.name()}${selectedOption}`, 0, 0]]);
}
// Low exposure hides the ougi CG, so type 2/4 fall back to 3/5.
function applyHeroineCutinCutinPreparation(actorId, cutinType) {
  let resolvedType = cutinType;
  const exposure = $gameVariables.value(actorId + 380)[4];
  if (exposure <= 5 && resolvedType === 2) resolvedType = 3;
  else if (exposure <= 5 && resolvedType === 4) resolvedType = 5;
  const settings = cutinSettingsMap[resolvedType];
  if (!settings) return;
  const label = 'カットインアクター' + settings.name;
  const asset = 'CutInCG_Actor' + actorId + '_' + resolvedType;
  valueCutInSet1 = [label, asset, settings.angle, settings.scaleX, settings.scaleY, settings.opacity, settings.duration];
}

// TP-100 special skill slots (416 = the pattern's 4th slot, otherwise slot 2
// when its conditions pass). A trigger scan can override the slot.
function resolveBossSelectedSkillBattleRefactor(a, bossActionPattern, triggerSkillId) {
  let selectedSkillId = 0;
  if (a.tp >= 100 && !a.isStateAffected(416)) {
    const tpSkillId = bossActionPattern[2];
    if ($dataSkills[tpSkillId] && a.meetsSkillConditions($dataSkills[tpSkillId])) selectedSkillId = tpSkillId;
  }
  return triggerSkillId >= 1 ? triggerSkillId : selectedSkillId;
}
function chooseBossNormalActionBattleRefactor(a, bossActionPattern, triggerSkillId) {
  const fallbackCandidates = [bossActionPattern[0], bossActionPattern[3], bossActionPattern[4], bossActionPattern[5], bossActionPattern[6]];
  let candidateSkillId = fallbackCandidates[getRandomIndex(fallbackCandidates.length)] || bossActionPattern[0];
  if (triggerSkillId >= 1) candidateSkillId = triggerSkillId;
  const fallbackSkillId = candidateSkillId;
  let randomRoll = getRandomIndex(11);
  const frontAttackSkill = $dataSkills[bossActionPattern[0]];
  if (a.isStateAffected(29) && frontAttackSkill && frontAttackSkill.meta['Select Conditions']) randomRoll += 2;
  if (randomRoll >= 5) {
    const abilityCandidates = [bossActionPattern[1], bossActionPattern[7], bossActionPattern[8], bossActionPattern[9]];
    candidateSkillId = pickBossActionSkillBossActionPattarn1(a, abilityCandidates, bossActionPattern[1]);
  }
  let bossActionId = candidateSkillId;
  if (!$dataSkills[bossActionId] || !a.meetsSkillConditions($dataSkills[bossActionId])) bossActionId = fallbackSkillId;
  return escalateBossAttackIdBattleRefactor(a, bossActionId);
}
// Weapon attack ids escalate at level 30/50/100 with a 50% roll each.
const BOSS_WEAPON_ATTACK_IDS_BATTLE_REFACTOR = [101, 111, 121, 131, 141, 151, 161, 171, 181, 191, 901, 911, 921];
function escalateBossAttackIdBattleRefactor(a, bossActionId) {
  if (BOSS_WEAPON_ATTACK_IDS_BATTLE_REFACTOR.indexOf(bossActionId) < 0) return bossActionId;
  let escalatedId = bossActionId;
  for (const requiredLevel of [30, 50, 100]) {
    const roll = getRandomIndex(101);
    if (a.level >= requiredLevel && roll >= 51) escalatedId += 1;
  }
  return escalatedId;
}

const CHEST_SPAWN_EVENT_ID_ENEMYWIN_TREASUREBOX2 = 4;
// Up to 100 tries for an offset near the source event that is neither the player
// nor a zero-terrain tile. A zero offset in [1] means "spawn on a random tile".
function findFreeChestOffsetEnemywinTreasurebox2(sourceEvent, treasureBoxPosition) {
  const playerX = $gamePlayer.x;
  const playerY = $gamePlayer.y;
  for (let attempt = 1; attempt <= 100; attempt++) {
    const offsetX = CHEST_SEARCH_OFFSETS_ENEMYWIN_TREASUREBOX2[getRandomIndex(5)];
    const offsetY = CHEST_SEARCH_OFFSETS_ENEMYWIN_TREASUREBOX2[getRandomIndex(5)];
    const targetX = sourceEvent.x + offsetX;
    const targetY = sourceEvent.y + offsetY;
    const isFree = $gameMap.eventIdXy(targetX, targetY) < 1 &&
      $gameMap.terrainTag(targetX, targetY) != 0 &&
      !(targetX == playerX && targetY == playerY);
    treasureBoxPosition[1] = isFree ? offsetX : 0;
    treasureBoxPosition[2] = isFree ? offsetY : 0;
    if (treasureBoxPosition[1] != 0) break;
  }
}
function spawnChestEnemywinTreasurebox2(sourceEvent, treasureBoxPosition) {
  if (treasureBoxPosition[1] == 0) {
    const conditionMap = { passable: 1, screen: 0, collided: 3, terrainTags: [1], regionIds: [1] };
    return $gameMap.spawnEventRandom(CHEST_SPAWN_EVENT_ID_ENEMYWIN_TREASUREBOX2, conditionMap, true);
  }
  $gameMap.spawnEvent(CHEST_SPAWN_EVENT_ID_ENEMYWIN_TREASUREBOX2, sourceEvent.x, sourceEvent.y, true);
  return $gameMap.getLastSpawnEventId();
}
function presentChestEnemywinTreasurebox2(chestEventId, chestEvent, treasureBoxPosition) {
  const particleName = 'chest_c3';
  $gameScreen._particle.particlePlay(chestEventId, particleName, 'attach:this', 'def', 'above');
  $gameScreen._particle.particleExceed(particleName, 0.5);
  AudioManager.playSe({ name: 'Sound1', volume: 75, pitch: 150, pan: 0 });
  chestEvent.jumpEx(treasureBoxPosition[1], treasureBoxPosition[2], treasureBoxPosition[5], treasureBoxPosition[6]);
  chestEvent.controlSelfVariable(1, 0, treasureBoxPosition[4], true);
}


// Resolves who speaks: wordSetId 1 while the actor is hit uses variable 11,
// or the current battle member (indexed by the same variable) under switch 464.
function resolveSpeakingActorIdBattleRefactor(wordSetId, gameVar276, actorId) {
  if (wordSetId != 1 || gameVar276 != 1) return actorId;
  if ($gameSwitches.value(464)) {
    $gameVariables.setValue(20, $gameParty.battleMembers()[actorId].actorId());
  } else {
    $gameVariables.setValue(20, $gameVariables.value(11));
  }
  return $gameVariables.value(20);
}