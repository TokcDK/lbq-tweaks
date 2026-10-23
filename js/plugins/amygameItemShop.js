/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

// Database type ids: 0 items, 1 weapons, 2 armors.
const ITEM_SHOP_DB_ITEM = 0;
const ITEM_SHOP_DB_WEAPON = 1;
const ITEM_SHOP_DB_ARMOR = 2;

// databaseTypeId -> database array. Out of range gives undefined, as the original did.
function itemShopDatabase(databaseTypeId) {
  switch (databaseTypeId) {
    case ITEM_SHOP_DB_ITEM: return $dataItems;
    case ITEM_SHOP_DB_WEAPON: return $dataWeapons;
    case ITEM_SHOP_DB_ARMOR: return $dataArmors;
    default: return undefined;
  }
}

// Last id to scan. Armors keep their upper bound in a separate variable.
function itemShopDatabaseEnd(databaseTypeId, entries) {
  return databaseTypeId === ITEM_SHOP_DB_ARMOR ? valueArmorsLength : entries.length - 1;
}

// One line of the shop goods list handed to Scene_Shop; template keeps the original 4-element shape.
function itemShopEntry(databaseTypeId, itemId, template) {
  const entry = (template || [0, 0, 0, 0]).slice();
  entry[0] = databaseTypeId;
  entry[1] = itemId;
  return entry;
}

// Common tail of every shop builder: publish goods and enter Scene_Shop.
// prepareFlag is the second Scene_Shop argument (false only for shop_preparation1).
function itemShopOpen(goodsEntries, sortFlag, prepareFlag) {
  if (sortFlag != 1) return;
  goods = goodsEntries;
  SceneManager.push(Scene_Shop);
  SceneManager.prepareNextScene(goods, prepareFlag !== false);
}

// Collects the entries matching the predicate; shared by all six shop builders.
function collectShopEntries(databaseTypeIds, matches, template, reportedDatabaseTypeId) {
  const shopEntries = [];
  for (const databaseTypeId of databaseTypeIds) {
    const entries = itemShopDatabase(databaseTypeId);
    if (!entries) continue;
    const end = itemShopDatabaseEnd(databaseTypeId, entries);
    for (let itemId = 1; itemId <= end; itemId++) {
      const item = entries[itemId];
      if (!item) continue;
      if (matches(item, databaseTypeId) === false) continue;
      // With reportedDatabaseTypeId the recorded type is that value, not the scanned one.
      const entryTypeId = (reportedDatabaseTypeId === undefined) ? databaseTypeId : reportedDatabaseTypeId;
      shopEntries.push(itemShopEntry(entryTypeId, itemId, template));
    }
  }
  return shopEntries;
}

// Game variables this plugin shares with the event code. The project keeps their ids
// in the database only, so they are named here after what they carry.
const ITEM_SHOP_VARIABLE = {
  TRUE_PROTAGONIST_ACTOR_ID: 2,
  CURRENT_VIEWPOINT_ACTOR_ID: 11,
  PROCESSED_ITEM_ID: 19, // item being used or appraised
  SELECTED_ACTOR_ID: 20,
  TEMPORARY_TEXT: 21, // shop window text buffer
  TEMPORARY_VALUE: 22, // purchase price, also the mastery multiplier of a book
  PREVIOUS_MASTERY_LEVEL: 23,
  VARIABLE_57_CURRENCY: 57,
  COIN_COUNT: 69,
  USED_ITEM_ID: 93,
  MAP_STATUS_DISPLAY_MODE: 200,
  SKILL_MASTERY_GAIN: 203,
  WEAPON_ID: 230, // weapon referenced by the gathering and bounty code
  BOUNTY_PAID_COUNT: 231,
  DUNGEON_INFO_ITEM_ID: 240,
  ACTOR_WEAPON_PARAMETERS: 287,
  TITLE_SLOT_COUNT: 289,
  H_TITLE_SLOT_COUNT: 295,
  RETURN_ITEM_SLOTS: 327,
  STAT_ORB_STACKS: 352,
  BOUNTY_TOTALS: 501,
  MENU_BACKGROUND_NAME: 508,
  PRICE_INFO_TEXT: 801
};

// Game switches this plugin shares with the event code.
const ITEM_SHOP_SWITCH = {
  SCENE_SKIP: 29,
  APPRAISAL_BULK_START: 69, // both flags are raised for the whole bulk appraisal
  APPRAISAL_BULK_END: 114,
  APPRAISAL_EMPTY: 116,
  DAILY_QUEST_ENABLED: 129,
  SKILL_RANK_UP: 133,
  COMMERCE_ENABLED: 138,
  SHOP_NEGOTIATION: 380, // negotiation still available / purchase result
  DAILY_QUEST_REWARD: 518, // raised only while the reward event runs
  EAT_INFO_WINDOW: 603,
  GATHER_PINNED_MATERIAL: 605
};

// Font size tag of the bulk sale lists; kept out of the translatable lines.
const BULK_SELL_FONT_TAG = `\\FS[25]`;

// Sell price note tags, in the order shared by item_priceinfo, item_ikkatu and ikkatu_sellChoice.
const ITEM_SHOP_SELL_VARIABLE_TAGS = ['Variable 57 Sell Price', 'Variable 69 Sell Price'];
const ITEM_SHOP_SELL_ITEM_TAGS = ['Item 270 Sell Price', 'Item 147 Sell Price', 'Item 152 Sell Price'];
const ITEM_SHOP_SELL_TAGS = ['Sell Price'].concat(ITEM_SHOP_SELL_VARIABLE_TAGS, ITEM_SHOP_SELL_ITEM_TAGS);

// True when the entry carries at least one sell price tag.
function hasSellPriceTag(entry) {
  const meta = entry.meta;
  return ITEM_SHOP_SELL_TAGS.some(function (key) { return !!meta[key]; });
}

// Display name of an item/weapon/armor; the \\x1bI[n] icon marker stays outside the text.
function itemShopIconName(entry) {
  return `\x1bI[${entry.iconIndex}]${entry.name}`;
}

// Verb of an eaten entry: drink, then alcohol, then food.
function eatOutcomeText(meta) {
  if (meta['Drink']) return `飲んだ！`;
  if (meta['Alcohol']) return `呑んだ！`;
  return `食べた！`;
}

// ---------------------------------------------------------------------------
// Post-acquisition processing
// ---------------------------------------------------------------------------
// Counters reset on every acquisition: the usable title slots and the satiety cap.
function resetAcquisitionCounters() {
  $gameVariables.setValue(ITEM_SHOP_VARIABLE.TITLE_SLOT_COUNT, 4);// Number of usable title slots
  $gameVariables.setValue(ITEM_SHOP_VARIABLE.H_TITLE_SLOT_COUNT, 0);// Number of usable H title slots
  $gameVariables.setValue(EAT_SATIETY_MAX_VARIABLE_ID, 5);// Satiety cap
}

// Quest lists, collection flags and medals refreshed after an acquisition.
function refreshQuestRecords() {
  rebuildQuestExArray();
  syncCollectBookFlag203();
  collectCasinoMedals();
  quest_settei(1);
  quest_settei(2);
  time_settei();
}

// Map status window of the current display mode: 3 simple H status, 4 collected items.
function refreshMapStatusDisplay() {
  const mapStatusMode = $gameVariables.value(ITEM_SHOP_VARIABLE.MAP_STATUS_DISPLAY_MODE);
  switch (mapStatusMode) {
    // 1 hidden, 2 simple status, 3 simple H status, 4 collected items, 5 minimap
    case 3:
      actor_miniHstatusList1(283);
      break;
    case 4:
      item_collectList1(284);
      break;
  }
}

itemGet_afterProcess = function(){

  if ($gameSwitches.value(ITEM_SHOP_SWITCH.SCENE_SKIP)) return;

  resetAcquisitionCounters();
  title_EffectConfi();
  actors_unlockedClassHit();

  refreshQuestRecords();
  refreshMapStatusDisplay();

  showQuestProgressPopups();
  processDailyQuestItems();
  chargeSeisyoujuuParams();

  $gameSwitches.setValue(ITEM_SHOP_SWITCH.SHOP_NEGOTIATION, false);
}

// Copies the owned state of the quest items (<EICSwitch:108>) into valueQuestArrayEX.
function rebuildQuestExArray() {
  valueQuestArrayEX = Array(201).fill(0);

  const dataItems = $dataItems;
  const party = $gameParty;
  const itemsLen = dataItems.length;

  for (let itemId = 1; itemId < itemsLen; itemId++) {
    const item = dataItems[itemId];
    if (!item || item.name === '') continue;
    if (Number(item.meta['EICSwitch']) !== 108) continue;
    if (!party.hasItem(item)) continue;

    // 101-900 maps to slots 1-100 and 901-1000 maps to slots 1-100 of the daily array.
    const questIndex = (itemId <= 900) ? itemId - 800 : itemId - 900;
    if (valueQuestArray6[questIndex] === 0) {
      valueQuestArrayEX[questIndex] = valueQuestArray2[questIndex];
    }
  }
}

// "Second volume" flag of the collection book (variable 203): 2 when every book is owned, else 1.
function syncCollectBookFlag203() {
  if (!($gameVariables.value(ITEM_SHOP_VARIABLE.SKILL_MASTERY_GAIN) >= 2)) return;
  const hasAllBooks = $gameParty.hasItem($dataItems[52]);
  $gameVariables.setValue(ITEM_SHOP_VARIABLE.SKILL_MASTERY_GAIN, hasAllBooks ? 2 : 1);
}

// Cashes in every casino medal item; the owned amount is cleared with -9999.
function collectCasinoMedals() {
  const party = $gameParty;
  const dataItems = $dataItems;
  let medalTotalPts = 0;

  for (const itemId of valueCasinoMedalItem) {
    const item = dataItems[itemId];
    if (!party.hasItem(item)) continue;
    medalTotalPts += Number(item.meta['MedalRate']) * party.numItems(item);
    party.gainItem(item, -9999);
  }

  if (medalTotalPts >= 1) {
    $gameVariables.setValue(ITEM_SHOP_VARIABLE.COIN_COUNT, $gameVariables.value(ITEM_SHOP_VARIABLE.COIN_COUNT) + medalTotalPts);
  }
}

// Quest progress popups: only the lines whose value changed since the last run are shown.
// Shows the lines of a quest record that changed since the last run and plays the
// quest clear effect on the not yet seen ones.
function showQuestChangedLines(questIndex, previousValue, currentValue, isInBattle) {
  const itemLabelId = (questIndex <= 100) ? questIndex + 800 : questIndex + 900;
  CommonPopupManager.showInfo({}, `\x1bIIN[${itemLabelId}]`, null);

  const previousValueLines = previousValue.split("\n");
  const currentValueLines = currentValue.split("\n");

  for (let lineIndex = 0; lineIndex < previousValueLines.length; lineIndex++) {
    if (previousValueLines[lineIndex] === currentValueLines[lineIndex]) continue;

    CommonPopupManager.showInfo({}, currentValueLines[lineIndex], null);
    if (valueQuestArray6[questIndex] !== 1) continue;

    const achievedLabel = colorTaggedText(10, `条件達成`);
    const achievedText = `\x1bIIN[${itemLabelId}]:[${achievedLabel}]`;
    CommonPopupManager.showInfo({}, achievedText, null);

    if (isInBattle) continue;
    const particleName = (questIndex >= 101) ? 'cracker_min_r' : 'cracker_min_l';
    $gameScreen._particle.particlePlay(0, particleName, 'player', 'def', 'above');
  }
}

function showQuestProgressPopups() {
  const isInBattle = $gameParty.inBattle();

  for (let questIndex = 1; questIndex <= 200; questIndex++) {
    const previousValue = valueQuestArrayEX[questIndex];
    const currentValue = valueQuestArray2[questIndex];
    if (previousValue === 0 || previousValue === currentValue) continue;

    showQuestChangedLines(questIndex, previousValue, currentValue, isInBattle);
  }
}

// Completes the daily quests (SG category note) of the owned items.
function processDailyQuestItems() {
  if (!$gameSwitches.value(ITEM_SHOP_SWITCH.DAILY_QUEST_ENABLED)) return;

  const dailyQuestName = 'デイリークエスト';
  const dataItems = $dataItems;
  const party = $gameParty;
  const dailyQuestEnd = dataItems.length - 1;

  for (let itemId = 1; itemId <= dailyQuestEnd; itemId++) {
    const item = dataItems[itemId];
    if (!item || item.name === '') continue;
    if (Number(item.meta['EICSwitch']) !== 108) continue;
    if (item.meta['SGカテゴリ'] !== dailyQuestName) continue;
    if (!party.hasItem(item)) continue;
    if (valueQuestArray6[itemId - 900] !== 1) continue;

    $gameSwitches.setValue(ITEM_SHOP_SWITCH.DAILY_QUEST_REWARD, true);
    quest_housyuu(itemId, 2);
    $gameSwitches.setValue(ITEM_SHOP_SWITCH.DAILY_QUEST_REWARD, false);
  }
}

// Converts the stacked use of stat orbs (equip type 6 + <ItemPicture>) into parameters.
// Stacked use of one stat orb: the surplus pieces are converted into parameters and
// the player is told about it. Returns true when the orb was charged.
function chargeStatOrbStack(armor, armorId, statOrbStacks) {
  const party = $gameParty;
  if (!armor || armor.etypeId !== 6 || !armor.meta['ItemPicture']) return false;
  if (!party.hasItem(armor, true)) return false;

  let itemCount = party.numItems(armor);
  if (party.membersEqArmor(armorId)) itemCount += 1;
  if (itemCount < 2) return false;

  const seisyoujuuIndex = armorId - valueSeisyoujuuStartId;
  const initialParamValue = statOrbStacks[seisyoujuuIndex];
  if (initialParamValue === undefined) return false;

  itemCount -= 1;
  statOrbStacks[seisyoujuuIndex] = initialParamValue + itemCount;
  party.loseItem(armor, itemCount);
  seisyoujuu_addParams(armorId);

  AudioManager.playSe({ name: "Magic2", volume: 100, pitch: 130, pan: 0 });
  playSeisyoujuuParticle();

  const armorName = colorTaggedText(2, `\x1bAIN[${armorId}]`);
  const addedValueText = colorTaggedText(10, `+${itemCount}`);
  const enhanceValueText = `[強化値:${initialParamValue}${addedValueText}]`;
  const parameterUpLabel = `<パラメータアップ！>`;
  const popupMessage = `${armorName} ${enhanceValueText}${parameterUpLabel}`;
  CommonPopupManager.showInfo({}, popupMessage, null);
  return true;
}

function chargeSeisyoujuuParams() {
  const statOrbStacks = $gameVariables.value(ITEM_SHOP_VARIABLE.STAT_ORB_STACKS);
  let hasParameterIncrease = false;

  for (let armorId = 1; armorId <= valueArmorsLength; armorId++) {
    if (chargeStatOrbStack($dataArmors[armorId], armorId, statOrbStacks)) {
      hasParameterIncrease = true;
    }
  }

  if (hasParameterIncrease) refreshBattleMembers();
}

// Absorb particle of a stat orb; the picture name is the original one.
function playSeisyoujuuParticle() {
  const particleName = `charge_c`;
  $gameScreen._particle.particlePlay(0, particleName, 'player', 'def', 'above');
  $gameScreen._particle.particleUpdate([particleName, 'emitterLifetime', 1]);
  $gameScreen._particle.particleExceed(particleName, 0.5);
}

function refreshBattleMembers() {
  const battleMembers = $gameParty.battleMembers();
  for (const actor of battleMembers) {
    if (actor) actor.refresh();
  }
}

// ---------------------------------------------------------------------------
// Potions
// ---------------------------------------------------------------------------
// HP / MP potion effect of an item
// Resistance gain of a potion: none while state 291 is active, otherwise the note value.
function resolvePotionResistDelta(targetItem, itemMeta) {
  return targetItem.isStateAffected(291) ? 0 : Number(itemMeta['PotionResist']);
}

// Potion amount before the resistance is applied. PotionUsePoint 1 means a full
// recovery, any other value is a flat amount.
function resolvePotionBaseAmount(targetItem, potionUsePoint, restoresHp) {
  if (potionUsePoint != 1) return potionUsePoint;
  return restoresHp ? targetItem.mhp : targetItem.mmp;
}

// Potion effect: resistance bookkeeping plus the resulting HP / MP amount and message.
// Applies a potion to the target: the resistance value is raised and the restored
// amount is published in valuePotion1, then the outcome is reported.
item_Potion1 = function(usedItem,targetItem,itemId){

  const itemMeta = $dataItems[itemId].meta;
  const isResistDisabled = targetItem.isStateAffected(291);
  const potionResistDelta = resolvePotionResistDelta(targetItem, itemMeta);
  const potionUsePoint = Number(itemMeta['PotionUsePoint']);
  const resistVariableId = 380 + targetItem.actorId();
  const resistValues = $gameVariables.value(resistVariableId);
  const currentResist = resistValues[58];

  if (!isResistDisabled) targetItem.addState(39);

  // damage.type 3 restores HP, every other type restores MP.
  const restoresHp = $dataItems[itemId].damage.type == 3;
  const baseAmount = resolvePotionBaseAmount(targetItem, potionUsePoint, restoresHp);
  valuePotion1 = Math.round(baseAmount * (100 - currentResist) / 100);

  resistValues[58] += potionResistDelta;

  // The resistance array is read again after the gain, so the message shows the new value.
  reportPotionOutcome(targetItem, restoresHp, isResistDisabled, potionResistDelta, resistValues[58]);
}

// Potion result: battle log inside a battle, ticker on the map.
function reportPotionOutcome(targetItem, restoresHp, isResistDisabled, potionResistDelta, currentResist) {
  const resourceLabel = restoresHp ? `HP` : `MP`;
  const actorName = targetItem.name();
  const potionMessage = isResistDisabled
    ? buildPotionMessageSuppressed(actorName, resourceLabel, valuePotion1, currentResist)
    : buildPotionMessageApplied(actorName, resourceLabel, valuePotion1, potionResistDelta, currentResist);

  if ($gameParty.inBattle()) {
    BattleManager._logWindow.push(`addText`, potionMessage);
    return;
  }
  TickerManager.show(potionMessage);
}

// Message used while the resistance gain is disabled.
function buildPotionMessageSuppressed(actorName, resourceLabel, amount, currentResist) {
  return `${actorName}の${resourceLabel}が${amount}回復！ 耐性値上昇は無効化されている。[${currentResist}%]`;
}

// Message of the regular case.
function buildPotionMessageApplied(actorName, resourceLabel, amount, resistDelta, currentResist) {
  return `${actorName}の${resourceLabel}が${amount}回復！ 耐性値が${resistDelta}%上昇し${currentResist}%になった。`;
}

// ---------------------------------------------------------------------------
// Item collection rates
// ---------------------------------------------------------------------------
// Writes [owned, total] into variables 321-325, one range of 100 entries each.
const COLLECT_RATE_RANGES = [
  { variableId: 321, first: 401, last: 500, countsOwned: true },
  { variableId: 322, first: 501, last: 600, countsOwned: true },
  { variableId: 323, first: 601, last: 700, countsOwned: true },
  { variableId: 324, first: 701, last: 800, countsOwned: true },
  { variableId: 325, first: 901, last: 1000, countsOwned: true }
];

// Collection rate of every item category
collect_keisan1 = function(){
  for (const range of COLLECT_RATE_RANGES) {
    $gameVariables.setValue(range.variableId, countCollectedItems(range.first, range.last, range.countsOwned));
  }
};

// [owned, total]. The original 801-900 scan was overwritten and thrown away, and the
// 901-1000 scan forgot to reset ownedItemCount, so counts of 701-800 leaked into
// the variable 325 count. Every range is counted from scratch here.
function countCollectedItems(first, last, countsOwned) {
  const dataItems = $dataItems;
  const party = $gameParty;
  let totalItemCount = 0;
  let ownedItemCount = 0;

  for (let itemId = first; itemId <= last; itemId++) {
    const item = dataItems[itemId];
    if (!item || item.name === '') continue;
    totalItemCount += 1;
    if (countsOwned && party.hasItem(item)) ownedItemCount += 1;
  }

  return [ownedItemCount, totalItemCount];
}

// ---------------------------------------------------------------------------
// Appraisal
// ---------------------------------------------------------------------------
// Appraisal body
kantei_nakami = function(){

  const appraisalEntry = $dataItems[$gameVariables.value(ITEM_SHOP_VARIABLE.PROCESSED_ITEM_ID)];
  if (!appraisalEntry) return;
  const appraisalMeta = appraisalEntry.meta;

  $gameParty.loseItem(appraisalEntry, 1);

  const appraisalTarget = resolveAppraisalTarget(appraisalEntry);
  if (!appraisalTarget) return;

  const appraisalItem = appraisalTarget.entries[appraisalTarget.index];
  if (!appraisalItem) return;

  deliverAppraisedItem(appraisalItem);
};

// Hands the appraised entry over and reports it in the window matching the bulk mode.
function deliverAppraisedItem(appraisalItem) {
  $gameParty.gainItem(appraisalItem, 1);

  const appraisalItemLabel = colorTaggedText(16, itemShopIconName(appraisalItem));
  const acquiredItemMessage = `${appraisalItemLabel}を入手した。`;

  if (!$gameSwitches.value(ITEM_SHOP_SWITCH.APPRAISAL_BULK_END)) {
    TickerManager.show(acquiredItemMessage);
    return;
  }
  CommonPopupManager.showInfo({}, acquiredItemMessage, null);
}

// Picks the appraised entry. There are only four ways to build the candidates, so
// only "which database" and "which condition" are switched here.
function resolveAppraisalTarget(appraisalEntry) {
  const appraisalMeta = appraisalEntry.meta;

  const entries = appraisalDatabaseFor(appraisalMeta);
  if (!entries) return null;
  const end = itemShopDatabaseEnd(appraisalDatabaseForId(appraisalMeta), entries);

  // Same order as the original: the plain, then the category, then the rarity note,
  // so the last tag wins when an entry carries several of them.
  let index;
  if (appraisalMeta['鑑定']) {
    index = pickRandomIdFrom(appraisalMeta['鑑定'].split(','), $dataItems);
  }
  if (appraisalMeta['鑑定カテゴリ']) {
    const categoryValue = appraisalMeta['鑑定カテゴリ'];
    const candidateIndices = collectRarityCandidates(entries, end, appraisalMeta['鑑定カテゴリランク'].split(','),
      function (item) { return appraisalCategoryMatches(item, entries, categoryValue); });
    index = pickRandomIdFrom(candidateIndices, entries);
  }
  if (appraisalMeta['鑑定レアリティ版']) {
    const candidateIndices = collectRarityCandidates(entries, end, appraisalMeta['鑑定レアリティ版'].split(','),
      function () { return true; });
    index = pickRandomIdFrom(candidateIndices, entries);
  }

  return { entries, index };
}

// Draws one candidate; returns undefined when the list is empty.
// `entries` is unused; it is kept so the helper keeps its original signature.
function pickRandomIdFrom(candidateIds, entries) {
  if (!candidateIds.length) return undefined;
  return candidateIds[getRandomIndex(candidateIds.length)];
}

// The item / weapon / armor appraisal note decides which database is scanned.
function appraisalDatabaseFor(appraisalMeta) {
  if (appraisalMeta['鑑定道具']) return $dataItems;
  if (appraisalMeta['鑑定武器']) return $dataWeapons;
  if (appraisalMeta['鑑定防具']) return $dataArmors;
  return undefined;
}

function appraisalDatabaseForId(appraisalMeta) {
  if (appraisalMeta['鑑定防具']) return ITEM_SHOP_DB_ARMOR;
  if (appraisalMeta['鑑定武器']) return ITEM_SHOP_DB_WEAPON;
  return ITEM_SHOP_DB_ITEM;
}

// Category note match: wtypeId for weapons, etypeId for armors, menu category for items.
function appraisalCategoryMatches(item, entries, categoryValue) {
  if (!item || !item.meta['LotteryRearity']) return false;
  if (entries === $dataWeapons) return item.wtypeId == Number(categoryValue);
  if (entries === $dataArmors) return item.etypeId == Number(categoryValue);
  return !!item.meta['Menu Category'] && item.meta['Menu Category'] == categoryValue;
}

// Scans the target database once per rarity candidate.
function collectRarityCandidates(entries, end, rarityValues, matches) {
  const candidateIndices = [];
  for (const rarityValue of rarityValues) {
    for (let itemId = 1; itemId <= end; itemId++) {
      const item = entries[itemId];
      if (!item) continue;
      if (!matches(item)) continue;
      if (Number(item.meta['LotteryRearity']) != rarityValue) continue;
      candidateIndices.push(itemId);
    }
  }
  return candidateIndices;
}

// Appraisal of a single item
// Refusal messages of the appraisal skill; returns false when the appraisal must stop.
function checkAppraisalRequirements(actor, actorName, appraisalSkill, targetItemData, appraisalSkillId) {
  if (actor.mp < appraisalSkill.mpCost) {
    TickerManager.show(`${actorName}のMPが足りません…。`);
    return false;
  }
  if (!actor.isLearnedSkill(appraisalSkillId)) {
    const skillName = colorTaggedText(3, `\x1bSIN[${appraisalSkillId}]`);
    TickerManager.show(`パーソナルスキル＜${skillName}＞が必要です…。`);
    return false;
  }
  if (!canAppraise(actor, targetItemData, appraisalSkillId)) {
    const skillName = `\x1bSIN[${appraisalSkillId}]`;
    const requiredRankLabel = colorTaggedText(1, `${skillName}ランク`);
    TickerManager.show(`${requiredRankLabel}が足りません…。`);
    return false;
  }
  return true;
}

kantei_item = function(usedItem,targetItem,itemId){

  if (targetItem.actorId() != usedItem.actorId()) return;

  $gameVariables.setValue(ITEM_SHOP_VARIABLE.PROCESSED_ITEM_ID, itemId);
  const actor = usedItem;
  const targetItemData = $dataItems[itemId];
  const appraisalSkillId = valueAppraisalSkillId;
  const appraisalSkill = $dataSkills[appraisalSkillId];

  if (!checkAppraisalRequirements(actor, actor.name(), appraisalSkill, targetItemData, appraisalSkillId)) return;

  kantei_nakami();
  // From mastery rank 4 on the skill costs nothing and gains nothing.
  if (actor.skillMasteryLevel(appraisalSkillId) > 3) return;

  actor.gainMp(-appraisalSkill.mpCost);
  actor.gainSkillMasteryUses(appraisalSkillId, $gameVariables.value(ITEM_SHOP_VARIABLE.SKILL_MASTERY_GAIN));// mastery gain
  showAppraisalMasteryMessage(actor, appraisalSkillId);
}

// Compares the owned low / mid / high grade appraisal notes with the mastery rank.
function canAppraise(actor, targetItemData, appraisalSkillId) {
  const masteryLevel = actor.skillMasteryLevel(appraisalSkillId);
  if (targetItemData.meta['下級鑑定品'] && masteryLevel >= 1) return true;
  if (targetItemData.meta['中級鑑定品'] && masteryLevel >= 2) return true;
  if (targetItemData.meta['上級鑑定品'] && masteryLevel >= 3) return true;
  return false;
}

// Mastery gain message; the <\x1bSIN[id]> skill marker is kept outside the text.
function showAppraisalMasteryMessage(actor, appraisalSkillId) {
  const actorName = actor.name();
  const skillName = colorTaggedText(3, `\x1bSIN[${appraisalSkillId}]`);
  const currentUses = actor.skillMasteryUses(appraisalSkillId);
  const maxUses = actor.skillMasteryUsageMax(appraisalSkillId);
  const mpState = `${actor.mp}/${actor.param(1)}`;
  const masteryGainText = `\\V[203]`;
  TickerManager.show(
    `${actorName}のMPが5消費された。【現在MP${mpState}】＜${skillName}＞熟練度${masteryGainText}獲得！（${currentUses}/${maxUses}）`
  );
}

// The two switches the appraisal events read while a bulk appraisal runs.
function setBulkAppraisalSwitches(isRunning) {
  $gameSwitches.setValue(ITEM_SHOP_SWITCH.APPRAISAL_BULK_START, isRunning);
  $gameSwitches.setValue(ITEM_SHOP_SWITCH.APPRAISAL_BULK_END, isRunning);
}

// Bulk appraisal
kantei_ikkatu = function(unusedArg1,unusedArg2,itemId){

  setBulkAppraisalSwitches(true);

  const dataItems = $dataItems;
  const party = $gameParty;
  const itemsLen = dataItems.length;

  for (let itemId = 1; itemId < itemsLen; itemId++) {
    const item = dataItems[itemId];
    if (!item) continue;
    if (!isAppraisalItem(item)) continue;
    if (!party.hasItem(item)) continue;

    $gameVariables.setValue(ITEM_SHOP_VARIABLE.PROCESSED_ITEM_ID, itemId);
    kantei_nakami();
    // An appraisal that returns the same id is processed again in the same slot.
    if (party.hasItem(item)) itemId -= 1;
  }

  setBulkAppraisalSwitches(false);
};

function isAppraisalItem(item) {
  if (!item) return false;
  return !!(item.meta['下級鑑定品'] || item.meta['中級鑑定品'] || item.meta['上級鑑定品']);
}

// Bulk appraisal in the shop
kantei_shopikkatu1 = function(){

  const counts = countAppraisalItems();
  const totalCount = counts.low + counts.mid + counts.high;

  if (totalCount == 0) {
    $gameSwitches.setValue(ITEM_SHOP_SWITCH.APPRAISAL_EMPTY,true);
    return;
  }

  // NOTE: the fee table shows 100/500/1000 while the calculation uses 10/100/1000,
  // exactly as the original did (display and calculation disagree).
  const fee = counts.low * APPRAISAL_FEES.low + counts.mid * APPRAISAL_FEES.mid + counts.high * APPRAISAL_FEES.high;
  $gameVariables.setValue(ITEM_SHOP_VARIABLE.TEMPORARY_TEXT, fee);

  WindowManager.show(0, 10, 100, 800, 300);
  WindowManager.drawText(0, buildAppraisalFeeText(counts, fee));
};

const APPRAISAL_FEES = { low: 10, mid: 100, high: 1000 };

const APPRAISAL_ITEM_ROWS = [
  { metaKey: '下級鑑定品', countKey: 'low', label: `下級鑑定品` },
  { metaKey: '中級鑑定品', countKey: 'mid', label: `中級鑑定品` },
  { metaKey: '上級鑑定品', countKey: 'high', label: `上級鑑定品` }
];

// Counts the owned appraisal entries per grade.
function countAppraisalItems() {
  const counts = { low: 0, mid: 0, high: 0 };
  const dataItems = $dataItems;
  const party = $gameParty;
  const itemsEnd = dataItems.length - 1;

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const item = dataItems[itemId];
    if (!item || !party.hasItem(item)) continue;
    for (const row of APPRAISAL_ITEM_ROWS) {
      if (!item.meta[row.metaKey]) continue;
      counts[row.countKey] += party.numItems(item);
    }
  }
  return counts;
}

// Fee table text of the bulk appraisal.
function buildAppraisalFeeText(counts, fee) {
  const feeTableHeader = `鑑定料金表` + '\n' + `（下級：100\\G）（中級：500\\G）（上級：1000\\G）` + '\n';
  let feeDisplayText = feeTableHeader;

  for (const row of APPRAISAL_ITEM_ROWS) {
    const count = counts[row.countKey];
    if (count < 1) continue;
    const countText = colorTaggedText(1, `${count}`);
    feeDisplayText += `${row.label}：${countText}個` + '\n';
  }

  const totalFeeText = colorTaggedText(10, `${fee}`);
  feeDisplayText += `合計鑑定料金${totalFeeText}\\G\\$`;
  return feeDisplayText;
}
// ---------------------------------------------------------------------------
// Gathering findings and mastery
// ---------------------------------------------------------------------------
// Unique material found while gathering. gatherModeId 0 gathers, 1 mines.
item_getScript1 = function(gatherModeId,materialSlotId){

  const collectedVariableId = $gameVariables.value(ITEM_SHOP_VARIABLE.DUNGEON_INFO_ITEM_ID);// 1 or more reads an item, 0 reads a weapon id
  const item = collectedVariableId >= 1 ? $dataItems[collectedVariableId] : $dataWeapons[$gameVariables.value(ITEM_SHOP_VARIABLE.WEAPON_ID)];
  if (!item) return;

  const uniqueMaterialTag = 'UniqueMaterial' + materialSlotId;
  const uniqueMaterialValue = item.meta[uniqueMaterialTag];
  if (uniqueMaterialValue === undefined || uniqueMaterialValue === null) return;

  const materialCandidates = uniqueMaterialValue.split(',');
  // Switch 605 pins the result to the first material.
  const materialId = $gameSwitches.value(ITEM_SHOP_SWITCH.GATHER_PINNED_MATERIAL)
    ? Number(materialCandidates[0])
    : materialCandidates[getRandomIndex(materialCandidates.length)];

  const gatherSkillId = gatherModeId == 0 ? valueHarvestingSkillId : valueMiningSkillId;
  item_getSkillLevel(gatherSkillId, 0, materialId);
};

// Mastery raising finding. itemType 0 gold, 1 item, 2 weapon, 3 armor.
// valueScriptArray1 payload of a gathering use: actor id, mastery level and skill.
// Without the skill the mastery is reported as 0, as the original did.
function publishGatherSkillResult(viewpointActorId, isLearnedSkill, gainResult, skillId) {
  if (!isLearnedSkill) return [viewpointActorId, 0, 0];
  return [viewpointActorId, gainResult.skillLevel, skillId];
}

item_getSkillLevel = function(skillId,itemType,rewardId){

  const viewpointActorId = $gameVariables.value(ITEM_SHOP_VARIABLE.CURRENT_VIEWPOINT_ACTOR_ID);
  const actor = $gameActors.actor(viewpointActorId);
  const skill = $dataSkills[skillId];
  if (!actor || !skill) return;

  const isLearnedSkill = actor.isLearnedSkill(skillId);
  const skillMasteryLevel = isLearnedSkill ? actor.skillMasteryLevel(skillId) : 0;

  const gainResult = gainGatherSkillMastery(actor, skill, skillId, isLearnedSkill, skillMasteryLevel);
  const rewardAmount = computeGatherRewardAmount(actor, skillMasteryLevel, rewardId);
  const rewardText = grantGatherReward(itemType, rewardId, rewardAmount);

  CommonPopupManager.showInfo({}, rewardText + gainResult.text, null);

  valueScriptArray1 = publishGatherSkillResult(viewpointActorId, isLearnedSkill, gainResult, skillId);
}

// Adds the mastery gain and returns the display text plus the pre-gain mastery.
// When nothing is added (max rank reached) the text is one invisible ideographic space.
function gainGatherSkillMastery(actor, skill, skillId, isLearnedSkill, skillMasteryLevel) {
  const noGain = { text: '　', skillLevel: 0 };

  if (skillMasteryLevel == Number(skill.meta['Max Mastery Level'])) return noGain;
  if (!isLearnedSkill || skillMasteryLevel < 0) return noGain;

  actor.gainSkillMasteryUses(skillId, $gameVariables.value(ITEM_SHOP_VARIABLE.SKILL_MASTERY_GAIN));// mastery gain

  const baseSkillName = stripSkillStateSuffix(skill.name);
  const skillName = colorTaggedText(1, `＜${baseSkillName}＞`);
  const masteryGainText = colorTaggedText(10, `\\V[203]`);
  return { text: `${skillName}熟練度${masteryGainText}獲得！`, skillLevel: skillMasteryLevel };
}

// Drops the ＜ON＞ / ＜OFF＞ suffix of a skill name.
function stripSkillStateSuffix(skillName) {
  return skillName.replace("＜ON＞", "").replace("＜OFF＞", "");
}

// Amount of a finding: one at mastery 0, and material ids 10/141 give ten times more with the luck skill.
function computeGatherRewardAmount(actor, skillMasteryLevel, rewardId) {
  if (skillMasteryLevel != 0) {
    if ((rewardId == 10 || rewardId == 141) && actor.isLearnedSkill(799)) return skillMasteryLevel * 10;
    return skillMasteryLevel;
  }
  return 1;
}

// Grants the finding (gold or item) and returns its report line.
function grantGatherReward(itemType, rewardId, rewardAmount) {
  const notFoundText = '　';
  if (rewardId < 1) return notFoundText;

  if (itemType == 3) {
    const goldAmount = rewardId * rewardAmount;
    $gameParty.gainGold(goldAmount);
    // As in the original the colour tag opens before the gold line and closes after the amount.
    const goldColorTag = `\\C[3]`;
    const goldGainLabel = `小銭を拾った。（+`;
    const goldAmountText = colorTaggedText(10, `${goldAmount}`);
    return `${goldColorTag}${goldGainLabel}${goldAmountText}\\G）`;
  }

  const entries = itemShopDatabase(itemType);
  const rewardItem = entries && entries[rewardId];
  if (!rewardItem) return notFoundText;

  $gameParty.gainItem(rewardItem, rewardAmount);
  const rewardItemLabel = colorTaggedText(3, itemShopIconName(rewardItem));
  const rewardAmountLabel = colorTaggedText(10, `${rewardAmount}`);
  return `${rewardItemLabel}を${rewardAmountLabel}個入手した。`;
}

// Second half of the mastery finding: consumes valueScriptArray1 filled by item_getSkillLevel.
item_getSkillLevel2 = function(){

  const skillId = valueScriptArray1 ? valueScriptArray1[2] : 0;
  if (skillId < 1) return;

  const actor = $gameActors.actor(valueScriptArray1[0]);
  const skill = $dataSkills[skillId];
  if (!actor || !skill) return;

  const maxSkillMasteryLevel = Number(skill.meta['Max Mastery Level']);
  const skillMasteryLevel = actor.skillMasteryLevel(skillId);
  const skillRarity = actor.isLearnedSkill(skillId) && skillMasteryLevel >= 0
    ? get_skill_rarity(skillMasteryLevel, maxSkillMasteryLevel)
    : ``;

  if (skillRarity) showSkillMasteryInfo(actor, skill, skillId, skillMasteryLevel, maxSkillMasteryLevel, skillRarity);

  const lastSkillMasteryLevel = valueScriptArray1[1];
  if (!(lastSkillMasteryLevel >= 1)) return;
  if (!(skillMasteryLevel > lastSkillMasteryLevel)) return;

  $gameSwitches.setValue(ITEM_SHOP_SWITCH.SKILL_RANK_UP, true);
  valueWordSet1 = buildSkillRankUpWord(actor, skill, skillRarity, skillMasteryLevel, maxSkillMasteryLevel);
};

// Shows the mastery uses and the rank on one line.
function showSkillMasteryInfo(actor, skill, skillId, skillMasteryLevel, maxSkillMasteryLevel, skillRarity) {
  const skillRarityName = skill.name + skillRarity;
  const usesText = colorTaggedText(2, `${actor.skillMasteryUses(skillId)}`);
  const usesMaxText = colorTaggedText(2, `${actor.skillMasteryUsageMax(skillId)}`);
  const usesLabel = `Uses:`;

  const completeText = colorTaggedText(10, `Complete!`);
  const infoMessageText = skillMasteryLevel == maxSkillMasteryLevel
    ? `${skillRarityName} ${completeText}`
    : `${skillRarityName}　${usesLabel}${usesText}／${usesMaxText}`;
  CommonPopupManager.showInfo({}, infoMessageText, null);
}

// Rank up / max rank narration, stored in valueWordSet1.
function buildSkillRankUpWord(actor, skill, skillRarity, skillMasteryLevel, maxSkillMasteryLevel) {
  const actorName = actor.name();
  const baseSkillName = stripSkillStateSuffix(skill.name);
  const skillName = colorTaggedText(1, `＜${baseSkillName}＞`);
  return skillMasteryLevel == maxSkillMasteryLevel
    ? `${actorName}の${skillName}がカンストした！`
    : `${actorName}の${skillName}が${skillRarity}にランクアップ！`;
}

// Mastery rank mark; skills with a max rank below 5 start one step higher.
const skillMasteryLevelRarityMarks = [
  colorTaggedText(4, `[E]`), colorTaggedText(4, `[E]`), colorTaggedText(12, `[D]`),
  colorTaggedText(5, `[C]`), colorTaggedText(13, `[B]`), colorTaggedText(27, `[A]`),
  colorTaggedText(30, `[S]`)
];

get_skill_rarity = function (skillMasteryLevel, maxSkillMasteryLevel){
  let skillRarityIndex = skillMasteryLevel;
  if (maxSkillMasteryLevel < 6) skillRarityIndex++;
  if (skillRarityIndex >= skillMasteryLevelRarityMarks.length) skillRarityIndex = skillMasteryLevelRarityMarks.length - 1;
  return skillMasteryLevelRarityMarks[skillRarityIndex];
};

// Skill mastery from an item use. selectionModeId 2 confirms, anything else only shows the choice.
item_skilljukurenndoup = function(selectionModeId){

  const actor = $gameActors.actor($gameVariables.value(ITEM_SHOP_VARIABLE.SELECTED_ACTOR_ID));
  const usedItem = $dataItems[$gameVariables.value(ITEM_SHOP_VARIABLE.USED_ITEM_ID)];
  const skillId = $gameVariables.value(ITEM_SHOP_VARIABLE.PROCESSED_ITEM_ID);
  const skill = $dataSkills[skillId];
  if (!actor || !skill) return;

  const masteryGain = $gameVariables.value(ITEM_SHOP_VARIABLE.TEMPORARY_VALUE) * $gameVariables.value(ITEM_SHOP_VARIABLE.SKILL_MASTERY_GAIN);// mastery gain
  const skillType = skill.stypeId;
  valueCountSet1 = 0;

  if (!skill.meta['Max Mastery Level']) {
    WindowManager.drawText(1, buildSkillNoRankText(skillId, skillType));
    return;
  }

  $gameVariables.setValue(ITEM_SHOP_VARIABLE.PREVIOUS_MASTERY_LEVEL, actor.skillMasteryLevel(skillId));// mastery before the use

  const infoMessageText = (selectionModeId == 2)
    ? useSkillMasteryBook(actor, usedItem, skillId, skillType, masteryGain)
    : buildSkillMasteryBookChoiceText(actor, skillId, skillType);
  WindowManager.drawText(1, infoMessageText);
};

// Skill name as a coloured <\x1bSIN[id]> label.
function skillColoredName(skillId, skillType, brackets) {
  const skillName = `\x1bSIN[${skillId}]`;
  return colorTaggedText(valueSkillColorArr[skillType], brackets === false ? skillName : `＜${skillName}＞`);
}

function buildSkillNoRankText(skillId, skillType) {
  const suffix = `はランクが存在しないスキルのため使用できない…。`;
  return `${skillColoredName(skillId, skillType)}${suffix}`;
}

// Confirmed use: adds the mastery and appends two log lines on a rank up.
function useSkillMasteryBook(actor, usedItem, skillId, skillType, masteryGain) {
  const beforeMasteryLevel = actor.skillMasteryLevel(skillId);
  actor.gainSkillMasteryUses(skillId, masteryGain);
  $gameParty.loseItem(usedItem, 1);

  const playerName = actor.name();
  const skillName = skillColoredName(skillId, skillType);
  const usesLabel = `${actor.skillMasteryUses(skillId)}/${actor.skillMasteryUsageMax(skillId)}`;
  const infoMessageText = `${playerName}の${skillName}熟練度が${masteryGain}上昇した！（${usesLabel}）`;

  const currentMasteryLevel = actor.skillMasteryLevel(skillId);
  const hasRankedUp = currentMasteryLevel > beforeMasteryLevel;
  let rankUpText;
  if (hasRankedUp) {
    if (!$gameParty.inBattle()) $gamePlayer.requestAnimation(300);
    const masteryLevelText = colorTaggedText(2, `${currentMasteryLevel}`);
    rankUpText = `${playerName}の${skillName}が${masteryLevelText}にランクアップ！`;
    gab_wordParticle(rankUpText);
  }

  $gameSystem.pushInfoLog(infoMessageText);
  if (hasRankedUp) $gameSystem.pushInfoLog(rankUpText);
  return infoMessageText;
}

// Choice display; a usable skill stores its id in valueCountSet1 and asks for a second selection.
function buildSkillMasteryBookChoiceText(actor, skillId, skillType) {
  const skill = $dataSkills[skillId];
  const skillName = skillColoredName(skillId, skillType);

  if (skill.meta['NoJpBook']) return `${skillName}は対象に選べない…。`;

  const skillMasteryLevel = actor.skillMasteryLevel(skillId);
  if (skillMasteryLevel >= Number(skill.meta['Max Mastery Level'])) {
    const actorName = actor.name();
    return `${actorName}の${skillName}は最大ランクに達しているため使用できない。`;
  }

  valueCountSet1 += skillId;
  const usesText = `${actor.skillMasteryUses(skillId)}/${actor.skillMasteryUsageMax(skillId)}`;
  const promptText = colorTaggedText(10, `（もう一度選択で使用されます）`);
  const plainSkillName = skillColoredName(skillId, skillType, false);
  return `${plainSkillName} 熟練度:${usesText}　${promptText}`;
}

// ---------------------------------------------------------------------------
// Item price and description
// ---------------------------------------------------------------------------

// Buy back / sell price display; the last sell tag wins, as in the original.
const PRICE_INFO_SELL_TAGS = [
  { metaKey: 'Sell Price', kind: 'gold' },
  { metaKey: 'Variable 57 Sell Price', kind: 'variable', variableId: 57 },
  { metaKey: 'Variable 69 Sell Price', kind: 'variable', variableId: 69 },
  { metaKey: 'Item 270 Sell Price', kind: 'item', itemId: 270 },
  { metaKey: 'Item 147 Sell Price', kind: 'item', itemId: 147 },
  { metaKey: 'Item 152 Sell Price', kind: 'item', itemId: 152 }
];

// Normal attack description per weapon type: [english name, skill id, description].
const WEAPON_BASE_ATTACK_TEXTS = {
  '剣': ['Sword', 101, `与D*1.0倍/対象前衛のみ`],
  '短剣': ['Dagger', 111, `与D*0.5倍/2Hit/対象前衛のみ`],
  '刀': ['Blade', 121, `与D*0.9倍/対象前衛のみ`],
  '杖': ['Wand', 131, `与D*1.0倍`],
  '拳': ['Fist', 141, `与D*0.4倍/2Hit/対象前衛のみ`],
  '槍': ['Lance', 151, `与D*1.2倍/対象前衛のみ`],
  '斧': ['Axe', 161, `与D*1.5倍/対象前衛のみ`],
  '銃': ['Gun', 171, `与D*0.5倍+固定ダメ/即死付与`],
  '弓': ['Bow', 181, `与D*0.8倍/浮遊特攻`],
  '楽器': ['Instrument', 191, `与D*0.5倍/ランダムデバフ`],
  '針': ['Needle', 81, `与D*1.0倍/対象前衛のみ/装備条件なし`],
  '鞭': ['Whip', 84, `与D*0.5倍/全体攻撃/装備条件なし`],
  '鈍器': ['Blow', 901, `与D*1.0倍/対象前衛のみ`],
  '爪': ['Claw', 911, `与D*1.0倍/対象前衛のみ`],
  '牙': ['Fang', 921, `与D*1.0倍/対象前衛のみ`]
};

// Rarity promotion material tags, in the original display order.
const RARITY_PROMOTION_TAGS = [
  { metaKey: 'LRpromotionM', label: `[RarelityLR解放素材]` },
  { metaKey: 'URpromotionM', label: `[RarelityUR解放素材]` },
  { metaKey: 'SSRpromotionM', label: `[RarelitySSR解放素材]` },
  { metaKey: 'SRpromotionM', label: `[RarelitySR解放素材]` },
  { metaKey: 'RpromotionM', label: `[RarelityR解放素材]` }
];

// Steps of the price info window, in display order. Every step gets the same context,
// so a new line is a new entry here.
const PRICE_INFO_STEPS = [
  function (context) { return buildPriceInfoSellText(context.item, context.itemPrice); },
  function (context) { return buildPriceInfoRankText(context.itemMeta); },
  function (context) { return buildPriceInfoShopStateText(context.databaseTypeId, context.itemId, context.itemMeta); },
  function (context) { return buildPriceInfoBaseAttackText(context.databaseTypeId, context.item); },
  function (context) { return buildPriceInfoEquipStateText(context.itemMeta); },
  function (context) { return buildPriceInfoRarityPromotionText(context.itemMeta); },
  function (context) { return buildPriceInfoReturnItemText(context.itemMeta); },
  function (context) { return buildPriceInfoAbilityLearnText(context.itemMeta); },
  function (context) { return buildPriceInfoSynthesisMaterialText(context.databaseTypeId, context.itemId, context.item, context.itemMeta); },
  function (context) { return buildPriceInfoSingleAlchemyText(context.databaseEntries, context.itemId, context.item, context.itemMeta); },
  function (context) { return buildPriceInfoQuestMaterialText(context.databaseTypeId, context.itemId); },
  function (context) { return buildPriceInfoSeisyoujuuText(context.databaseTypeId, context.itemId, context.item); },
  function (context) { return context.itemMeta['GatchaHasRange'] ? `[所持でガチャ排出品に追加]` + '\n' : ``; }
];

// Builds the description text of one entry and stores it in variable 801.
item_priceinfo = function(databaseTypeId,itemId){

  const databaseEntries = itemShopDatabase(databaseTypeId);
  if (!databaseEntries || !databaseEntries[itemId]) return;

  const item = databaseEntries[itemId];
  const context = {
    databaseTypeId: databaseTypeId,
    itemId: itemId,
    databaseEntries: databaseEntries,
    item: item,
    itemMeta: item.meta,
    itemPrice: Number(item.price)
  };

  let priceInfoText = ``;
  for (const priceInfoStep of PRICE_INFO_STEPS) {
    priceInfoText += priceInfoStep(context);
  }

  $gameVariables.setValue(ITEM_SHOP_VARIABLE.PRICE_INFO_TEXT, priceInfoText);
}

// Buy back price is price/2 by default and is replaced by the sell tag display when present.
function buildPriceInfoSellText(item, itemPrice) {
  let sellText = null;

  if (itemPrice >= 1) {
    const buyBackPrice = Math.floor(itemPrice / 2);
    sellText = `買取価格:` + colorTaggedText(2, buyBackPrice.toLocaleString()) + `\\G` + '\n';
  }

  for (const sellTag of PRICE_INFO_SELL_TAGS) {
    const tagValue = item.meta[sellTag.metaKey];
    if (!tagValue) continue;
    sellText = buildSellTagText(sellTag, tagValue);
  }

  // As in the original an entry without tags and without a price is shown as not sellable.
  if (itemPrice == 0 && !hasSellPriceTag(item)) return colorTaggedText(1, `[売却不可]`) + '\n';
  return sellText || ``;
}

// Display line of a single sell tag.
function buildSellTagText(sellTag, tagValue) {
  const formattedValue = Number(tagValue).toLocaleString();

  switch (sellTag.kind) {
    case 'gold':
      return `買取価格:` + colorTaggedText(2, formattedValue) + '\n';
    case 'variable': {
      const currencyName = $dataSystem.variables[sellTag.variableId];
      return `売却pt:` + colorTaggedText(2, formattedValue + currencyName) + '\n';
    }
    default: {
      const priceItemName = $dataItems[sellTag.itemId].name;
      const priceItemLabel = colorTaggedText(2, `${priceItemName}${formattedValue}個`);
      return `売却:` + priceItemLabel + '\n';
    }
  }
}

// Lottery rarity line.
function buildPriceInfoRankText(itemMeta) {
  if (!itemMeta['LotteryRearity']) return `ランク:──` + '\n';
  const rarityValue = Number(itemMeta['LotteryRearity']);
  return `ランク:` + colorTaggedText(14, `${rarityValue}`) + '\n';
}

// Sale state line: not for sale, sale only, or bulk sale target.
function buildPriceInfoShopStateText(databaseTypeId, itemId, itemMeta) {
  let shopStateText = ``;

  if (!itemMeta.ShopRank) {
    shopStateText += colorTaggedText(29, `[非売品]`) + '\n';
  } else if (!itemMeta['LotteryRearity']) {
    shopStateText += colorTaggedText(29, `[販売のみ]`) + '\n';
  }

  if ($gameSelfSwitches.getVariableValue([4, 11 + databaseTypeId, itemId]) == 1) {
    shopStateText += colorTaggedText(10, `[一括売却対象]`) + '\n';
  }

  return shopStateText;
}

// Normal attack description of the weapon type.
function buildPriceInfoBaseAttackText(databaseTypeId, item) {
  if (databaseTypeId != ITEM_SHOP_DB_WEAPON) return ``;
  if (!(item.wtypeId >= 1)) return ``;

  const weaponTypeName = $dataSystem.weaponTypes[item.wtypeId];
  const baseAttack = WEAPON_BASE_ATTACK_TEXTS[weaponTypeName];
  const heading = `基本通常攻撃:`;
  if (!baseAttack) return heading;

  const [attackName, attackSkillId, attackNote] = baseAttack;
  const attackNameText = colorTaggedText(2, attackName);
  const skillMarker = `<\\SIN[${attackSkillId}]>`;
  return `${heading}${attackNameText}${skillMarker}` + '\n' + `[${attackNote}]` + '\n';
}

// Set bonus / equip requirement line.
function buildPriceInfoEquipStateText(itemMeta) {
  let equipStateText = ``;
  if (itemMeta['SetBonus']) equipStateText += colorTaggedText(14, `[セットボーナス効果]`) + '\n';
  if (itemMeta['Custom Equip Requirement Text'] || itemMeta['Equip Requirement']) {
    equipStateText += colorTaggedText(10, `[装備条件あり]`) + '\n';
  }
  return equipStateText;
}

// Rarity promotion / job release material line.
function buildPriceInfoRarityPromotionText(itemMeta) {
  let promotionText = ``;
  for (const promotionTag of RARITY_PROMOTION_TAGS) {
    if (!itemMeta[promotionTag.metaKey]) continue;
    promotionText += colorTaggedText(28, promotionTag.label) + '\n';
  }
  if (itemMeta['class2JobReleaseM']) promotionText += colorTaggedText(20, `[Class2ndJob解放素材]`) + '\n';
  return promotionText;
}

// Return target of a <returnItem>; the slot of the variable 327 array that holds 2.
function buildPriceInfoReturnItemText(itemMeta) {
  if (!itemMeta['returnItem']) return ``;

  const returnSlotValues = $gameVariables.value(ITEM_SHOP_VARIABLE.RETURN_ITEM_SLOTS);
  let returnWeaponId = 22;
  for (let slotId = 1; slotId <= 100; slotId++) {
    if (returnSlotValues[slotId] != 2) continue;
    returnWeaponId = slotId;
    break;
  }

  const returnWeaponName = $dataWeapons[returnWeaponId].name;
  return colorTaggedText(20, `[現在の帰還先]`) + '\n' + returnWeaponName + '\n';
}

// Ability learn cost material line.
function buildPriceInfoAbilityLearnText(itemMeta) {
  if (!itemMeta['AbilityLearnM']) return ``;
  const classId = Number(itemMeta['AbilityLearnM']);
  const className = $dataClasses[classId].name;
  const classNameText = colorTaggedText(21, `${className}系列`);
  return colorTaggedText(3, `[アビリティ習得コスト素材]`) + '\n' + classNameText + '\n';
}

// Synthesis material check; valueItemsSynth1 uses 0 items, 2000+ weapons, 3000+ armors.
// Rarity 8 and above stay hidden while the protagonist is below synthesis rank 4.
function isHiddenByAlchemyRank(itemMeta) {
  if (!itemMeta['LotteryRearity']) return false;
  if (Number(itemMeta['LotteryRearity']) < 8) return false;
  const protagonist = $gameActors.actor($gameVariables.value(ITEM_SHOP_VARIABLE.TRUE_PROTAGONIST_ACTOR_ID));
  return protagonist.skillMasteryLevel(valueAlchemySkillId) <= 3;
}

// `item` is unused; it is kept so the helper keeps its original signature.
function buildPriceInfoSynthesisMaterialText(databaseTypeId, itemId, item, itemMeta) {
  let synthItemId = itemId;
  if (databaseTypeId == ITEM_SHOP_DB_WEAPON) synthItemId = itemId + 2000;
  if (databaseTypeId == ITEM_SHOP_DB_ARMOR) synthItemId = itemId + 3000;

  const synthesisSourceText = valueItemsSynth1[synthItemId];
  if (synthesisSourceText == 0) return ``;

  let materialText = `[錬金素材元対象]` + '\n';
  if (synthesisSourceText.length >= 40) return materialText + colorTaggedText(14, `[多岐に渡る錬金素材元]`) + '\n';

  materialText += isHiddenByAlchemyRank(itemMeta)
    ? colorTaggedText(10, `錬金Rank4以上で表示`) + '\n'
    : colorTaggedText(3, synthesisSourceText) + '\n';
  return materialText;
}

// Single item synthesis info: material id, required rank, result id, count.
// `itemId` is unused; it is kept so the helper keeps its original signature.
function buildPriceInfoSingleAlchemyText(databaseEntries, itemId, item, itemMeta) {
  const singleAlchemyValue = itemMeta['単一アイテム錬金'];
  if (!singleAlchemyValue) return ``;

  const singleItemAlchemyValues = singleAlchemyValue.split(',');
  const resultItemName = databaseEntries[Number(singleItemAlchemyValues[2])].name;
  const alchemySkillName = $dataSkills[valueAlchemySkillId].name;
  const requiredRank = singleItemAlchemyValues[1];
  const materialQuantity = singleItemAlchemyValues[3];
  const resultItemText = colorTaggedText(14, resultItemName);
  const requiredRankText = colorTaggedText(2, `${alchemySkillName}Rank${requiredRank}`);
  const materialNameText = colorTaggedText(1, item.name);

  return `[可]` + resultItemText + '\n'
    + `[要]` + requiredRankText + '\n'
    + `${materialNameText}×${materialQuantity}個` + '\n';
}

// Quest material line; daily quests (901-1000) read the state of 801-900.
// NOTE: the original read valueQuestArray1[itemId] for weapons and armors instead of
// the +2000/+3000 side it tested, which crashed on weapons and armors. The tested
// side is used here.
function buildPriceInfoQuestMaterialText(databaseTypeId, itemId) {
  const questEntry = findQuestMaterialEntry(databaseTypeId, itemId);
  if (!questEntry) return ``;

  const questItemId = questEntry[1];
  const questMaterialLabel = colorTaggedText(14, `[クエスト指定素材]`);

  if (!(questItemId >= 801 && questItemId <= 900)) {
    return questMaterialLabel + colorTaggedText(11, `(ﾃﾞｲﾘｰ)`) + '\n';
  }

  const isDelivered = $gameParty.hasItem($dataItems[questItemId + 100], true);
  const deliveredLabel = isDelivered ? colorTaggedText(2, `(済)`) : colorTaggedText(10, `(未)`);
  return questMaterialLabel + deliveredLabel + '\n';
}

// Quest material info of one database type and item id.
function findQuestMaterialEntry(databaseTypeId, itemId) {
  const questOffset = (databaseTypeId == ITEM_SHOP_DB_WEAPON) ? 2000 : (databaseTypeId == ITEM_SHOP_DB_ARMOR) ? 3000 : 0;
  const questEntry = valueQuestArray1[itemId + questOffset];
  if (!questEntry) return null;
  return questEntry[0] == databaseTypeId + 1 ? questEntry : null;
}

// Enhancement value line of a stat orb (equip type 6 + <ItemPicture>).
function buildPriceInfoSeisyoujuuText(databaseTypeId, itemId, item) {
  if (databaseTypeId != ITEM_SHOP_DB_ARMOR) return ``;
  if (item.etypeId != 6) return ``;
  if (!item.meta['ItemPicture']) return ``;

  const enhanceValue = colorTaggedText(10, $gameVariables.value(ITEM_SHOP_VARIABLE.STAT_ORB_STACKS)[itemId - valueSeisyoujuuStartId]);
  const enhanceLabel = `強化値:`;
  return `${enhanceLabel}${enhanceValue}\n`;
}
// ---------------------------------------------------------------------------
// Single item synthesis
// ---------------------------------------------------------------------------
// Synthesis from an item use: the used item is the material.
// True when the alchemy skill reaches the required rank and the materials suffice;
// the failing case is reported to the ticker and the synthesis is skipped.
function canRunItemSynthesis(actor, synthesisItem, requiredRank, materialCount) {
  if (!actor.isLearnedSkill(valueAlchemySkillId) || actor.skillMasteryLevel(valueAlchemySkillId) < requiredRank) {
    const alchemySkillLabel = `\x1bSIN[${valueAlchemySkillId}]`;
    TickerManager.show(`主人公の${alchemySkillLabel}ランクが必要値に達していません。`);
    return false;
  }
  if ($gameParty.numItems(synthesisItem) < materialCount) {
    TickerManager.show(`必要素材が足りません。`);
    return false;
  }
  return true;
}

// Success message: how many materials were used and how many items were produced.
function showSynthesisSuccessMessage(itemId, materialLabel, materialCount, resultItemId, resultLabel, craftAmount) {
  const craftSuccessMessage = `${materialLabel}を${materialCount}個消費して${resultLabel}を${craftAmount}個制作した！`;
  TickerManager.show(craftSuccessMessage);

  const remainingMaterial = $gameParty.numItems($dataItems[itemId]);
  const remainingResult = $gameParty.numItems($dataItems[resultItemId]);
  const remainingMaterialText = colorTaggedText(1, `${remainingMaterial}`);
  const remainingResultText = colorTaggedText(10, `${remainingResult}`);
  const resultIconMarker = `\x1bIIN[${resultItemId}]`;
  const craftInfoMessage = `${materialLabel}${remainingMaterialText}個/${resultIconMarker}${remainingResultText}個`;
  TickerManager.show(craftInfoMessage);
}

// Reads the `単一アイテム錬金` tag: required rank, result item id and material count.
function readSingleAlchemyRecipe(synthesisItem) {
  const alchemyValues = synthesisItem.meta['単一アイテム錬金'].split(',');
  return {
    requiredRank: Number(alchemyValues[1]),
    resultItemId: Number(alchemyValues[2]),
    materialCount: Number(alchemyValues[3])
  };
}

item_synthesis = function(usedItem,targetItem,itemId){

  if (targetItem.actorId() != usedItem.actorId()) return;

  const synthesisItem = $dataItems[itemId];
  if (!synthesisItem.meta['単一アイテム錬金']) return;

  const { requiredRank, materialCount, resultItemId } = readSingleAlchemyRecipe(synthesisItem);
  const resultItem = $dataItems[resultItemId];
  const actor = $gameActors.actor($gameVariables.value(ITEM_SHOP_VARIABLE.TRUE_PROTAGONIST_ACTOR_ID));

  // The synthesis boost skill (792) produces two items. The count is published before
  // the checks run, so the global is set even when the synthesis is refused.
  craftAmount = actor.isLearnedSkill(ALCHEMY_BOOST_SKILL_ID) ? 2 : 1;

  if (!canRunItemSynthesis(actor, synthesisItem, requiredRank, materialCount)) return;

  AudioManager.playSe({ name: "Z11_AlchemySuccess", volume: 80, pitch: 110, pan: 0 });
  $gameParty.loseItem(synthesisItem, materialCount);
  $gameParty.gainItem(resultItem, craftAmount);

  const materialLabel = `\x1bIIN[${itemId}]`;
  const resultLabel = colorTaggedText(10, `\x1bIIN[${resultItemId}]`);
  showSynthesisSuccessMessage(itemId, materialLabel, materialCount, resultItemId, resultLabel, craftAmount);
}

const ALCHEMY_BOOST_SKILL_ID = 792;

// ---------------------------------------------------------------------------
// Material description of a synthesis item
// ---------------------------------------------------------------------------
// Recipe kinds: recipe array name, database and icon marker are the only differences.
const SYNTHESIS_RECIPE_KINDS = [
  { recipeKey: 'Item Recipe', recipeListKey: 'recipeItem', databaseTypeId: ITEM_SHOP_DB_ITEM, iconMarker: 'II' },
  { recipeKey: 'Weapon Recipe', recipeListKey: 'recipeWeapon', databaseTypeId: ITEM_SHOP_DB_WEAPON, iconMarker: 'WI' },
  { recipeKey: 'Armor Recipe', recipeListKey: 'recipeArmor', databaseTypeId: ITEM_SHOP_DB_ARMOR, iconMarker: 'AI' }
];

// Extra description added to the materials of a synthesis item
item_addSynthesisHelp = function(){

  valueItemsSynth1 = Array(4001).fill(0);

  const actor = $gameActors.actor($gameVariables.value(ITEM_SHOP_VARIABLE.TRUE_PROTAGONIST_ACTOR_ID));
  if (!actor) return;

  const dataItems = $dataItems;
  const knowsAlchemy = actor.isLearnedSkill(valueAlchemySkillId);
  const itemsEnd = dataItems.length - 1;

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const recipeItem = dataItems[itemId];
    if (!recipeItem) continue;
    for (const recipeKind of SYNTHESIS_RECIPE_KINDS) {
      if (!recipeItem.meta[recipeKind.recipeKey]) continue;
      registerSynthesisSources(recipeItem[recipeKind.recipeListKey], recipeKind, knowsAlchemy);
    }
  }
};

// Registers the materials of one recipe in valueItemsSynth1, merging repeated materials.
function registerSynthesisSources(recipeIds, recipeKind, knowsAlchemy) {
  const entries = itemShopDatabase(recipeKind.databaseTypeId);

  for (const recipeId of recipeIds) {
    const recipeTarget = entries[recipeId];
    if (!recipeTarget) continue;
    const ingredients = recipeTarget.synthIngredients;
    // The same line is registered for every ingredient of this recipe.
    const ingredientDisplayText = knowsAlchemy
      ? `\x1b${recipeKind.iconMarker}N[${recipeId}]` + '\n'
      : `？？？` + '\n';

    for (let ingredientIndex = 0; ingredientIndex < ingredients.length; ingredientIndex++) {
      const synthIngredient = DataManager.getSynthesisIngredient(recipeTarget, ingredientIndex);
      const sourceId = synthIngredient.id + synthesisSlotOffset(synthIngredient);
      const registeredText = valueItemsSynth1[sourceId];
      valueItemsSynth1[sourceId] = registeredText == 0
        ? ingredientDisplayText
        : registeredText + ingredientDisplayText;
    }
  }
}

// Materials with augment slots are kept apart for weapons and armors (<No Augment Slots>).
function synthesisSlotOffset(synthIngredient) {
  if (!synthIngredient.meta['No Augment Slots']) return 0;
  return synthIngredient.etypeId == 1 ? 2000 : 3000;
}

// ---------------------------------------------------------------------------
// Unique weapons
// ---------------------------------------------------------------------------
// Weapon name prefix by enhancement stage (variable 287 [10]): required stage, prefix.
function applyUniqueWeaponName(uniqueWeapon, empowerLevel) {
  let isEnhanced = false;

  // When several prefixes qualify, the last one wins, as in the original.
  for (let enhanceIndex = 1; enhanceIndex <= 9; enhanceIndex++) {
    const enhanceNameValue = uniqueWeapon.meta['EnhanceName' + enhanceIndex];
    if (!enhanceNameValue) continue;

    const enhanceNameValues = enhanceNameValue.split(',');
    if (!(empowerLevel >= Number(enhanceNameValues[0]))) continue;

    uniqueWeapon.name = enhanceNameValues[1] + uniqueWeapon.meta['BasicName'];
    isEnhanced = true;
  }
  return isEnhanced;
}

// Traits added by the enhancement stage (variable 287 [11..30]): value -> [code, dataId].
const UNIQUE_WEAPON_TRAITS = {
  1: [22, 0], 2: [22, 1], 3: [22, 2], 4: [22, 7], 5: [22, 8], 6: [22, 9],
  7: [21, 0], 8: [21, 1], 9: [21, 2], 10: [21, 3],
  11: [21, 4], 12: [21, 5], 13: [21, 6], 14: [21, 7]
};
const UNIQUE_WEAPON_TRAIT_VALUE = { 22: 0.01, 21: 1 + 0.05 };

// Unique weapon extra elements
// Traits of a unique weapon: the ultimate skill plus one trait per stored value.
function buildUniqueWeaponTraits(weaponStateValues, uniqueSkillId) {
  const traits = [{ code: 43, dataId: uniqueSkillId, value: 0.00 }];
  for (let traitSlot = 11; traitSlot <= 30; traitSlot++) {
    if (!(weaponStateValues[traitSlot] >= 1)) continue;
    const trait = UNIQUE_WEAPON_TRAITS[weaponStateValues[traitSlot]];
    if (!trait) continue;
    traits.push({ code: trait[0], dataId: trait[1], value: UNIQUE_WEAPON_TRAIT_VALUE[trait[0]] });
  }
  return traits;
}

weapon_uniqueSet = function(weaponSlotId){

  const uniqueWeapon = $dataWeapons[weaponSlotId + 80];
  // Entries without a name are not unique weapons yet.
  if (uniqueWeapon && uniqueWeapon.name === '') return;

  const weaponStateValues = $gameVariables.value(ITEM_SHOP_VARIABLE.ACTOR_WEAPON_PARAMETERS)[weaponSlotId];
  const empowerLevel = weaponStateValues[10];
  const isEnhanced = applyUniqueWeaponName(uniqueWeapon, empowerLevel);

  if (!isEnhanced) uniqueWeapon.name = uniqueWeapon.meta['BasicName'];

  // Ultimate skill; an enhanced weapon uses the next stage.
  const uniqueSkillId = Number(uniqueWeapon.meta['UniqueOugi']) + (isEnhanced ? 1 : 0);
  weaponStateValues[9] = uniqueSkillId;
  uniqueWeapon.traits = buildUniqueWeaponTraits(weaponStateValues, uniqueSkillId);

  $gamePlayer.refresh();
}

// Unique weapon extra description; valueCountSet3 is the entries per line (3 or 5).
const UNIQUE_WEAPON_PARAM_ICONS = [32, 33, 34, 35, 36, 37, 38, 39];
const UNIQUE_WEAPON_EFFECT_TEXTS = {
  1: `\\I[630]+1%`, 2: `\\I[632]+1%`, 3: `\\I[631]+1%`,
  4: `\\I[640]+1%`, 5: `\\I[641]+1%`, 6: `\\I[642]+1%`,
  7: `\\I[32]+5%`, 8: `\\I[33]+5%`, 9: `\\I[34]+5%`, 10: `\\I[35]+5%`,
  11: `\\I[36]+5%`, 12: `\\I[37]+5%`, 13: `\\I[38]+5%`, 14: `\\I[39]+5%`
};

weapon_uniqueAdd = function(itemId){

  const weaponStateValues = $gameVariables.value(ITEM_SHOP_VARIABLE.ACTOR_WEAPON_PARAMETERS)[itemId - 80];
  const empowerLevel = weaponStateValues[10];
  const passiveStateData = $dataStates[Number($dataWeapons[itemId].meta['Passive State'])];

  let enhanceInfoText = colorTaggedText(14, `強化段階:${empowerLevel}/20`) + '\n';

  const passiveDescription = passiveStateData ? passiveStateData.meta['PassiveAddDescription'] : undefined;
  if (empowerLevel >= 5 && passiveDescription) {
    enhanceInfoText += `付与効果:${passiveDescription}` + '\n';
  }

  enhanceInfoText += buildUniqueWeaponParamText(weaponStateValues, UNIQUE_WEAPON_PARAM_ICONS, 0, 7);
  enhanceInfoText += '\n';
  enhanceInfoText += buildUniqueWeaponEffectText(weaponStateValues, 11, 30);

  // valueCountSet3 3 appends to the line built by item_priceinfo, anything else replaces it.
  const currentInfoText = valueCountSet3 == 3
    ? $gameVariables.value(ITEM_SHOP_VARIABLE.PRICE_INFO_TEXT)
    : ``;
  $gameVariables.setValue(ITEM_SHOP_VARIABLE.PRICE_INFO_TEXT, currentInfoText + enhanceInfoText);
};

// Parameter gains (variable 287 [0..7]) as icon plus value.
function buildUniqueWeaponParamText(weaponStateValues, paramIcons, firstIndex, lastIndex) {
  let paramText = ``;
  let effectCount = 0;

  for (let paramIndex = firstIndex; paramIndex <= lastIndex; paramIndex++) {
    if (!(weaponStateValues[paramIndex] >= 1)) continue;

    paramText += `\\I[${paramIcons[paramIndex]}]` + colorTaggedText(2, `+${weaponStateValues[paramIndex]}`) + ` `;
    effectCount += 1;
    if (effectCount % valueCountSet3 == 0) paramText += '\n';
  }
  return paramText;
}

// Added effects (variable 287 [11..30]) as bracketed icon plus effect.
function buildUniqueWeaponEffectText(weaponStateValues, firstIndex, lastIndex) {
  let effectText = ``;
  let effectCount = 0;
  let effectIconText;

  for (let effectSlot = firstIndex; effectSlot <= lastIndex; effectSlot++) {
    const effectValue = weaponStateValues[effectSlot];
    if (!(effectValue >= 1)) continue;

    const effectCandidateText = UNIQUE_WEAPON_EFFECT_TEXTS[effectValue];
    // Values of 15 and above are not in the table, so the previous display stays, as in the original.
    if (effectCandidateText !== undefined) effectIconText = effectCandidateText;

    effectCount += 1;
    effectText += `[${effectIconText}]`;
    if (effectCount % valueCountSet3 == 0) effectText += '\n';
  }
  return effectText;
}

// Unique weapon enhancement steps, weapon_uniqueEnhance($gameVariables.value(20)) 2..7
// Per stage [cost, gain array, granted skill], overwritten from top to bottom.
const UNIQUE_WEAPON_ENHANCE_TIERS = [
  { minLevel: 0, costPerLevel: 0, flatCost: 1500, statGains: [30, 0, 0, 0, 0, 0], skillIds: [0, 0] },
  { minLevel: 1, costPerLevel: 3000, flatCost: 0, statGains: [30, 0, 0, 0, 0, 0], skillIds: [0, 0] },
  { minLevel: 5, costPerLevel: 5000, flatCost: 0, statGains: [50, 0, 30, 0, 0, 0], skillIds: [1204, 'level'] },
  { minLevel: 10, costPerLevel: 10000, flatCost: 0, statGains: [100, 0, 50, 30, 30, 0], skillIds: [1206, 'level'] },
  { minLevel: 15, costPerLevel: 100000, flatCost: 0, statGains: [100, 0, 50, 50, 50, 50], skillIds: [1208, 'level'] }
];

// Enhancement tier of the current empowerment level: the last tier whose minimum is
// reached, which is the first tier when none is.
function resolveUniqueEnhanceTier(empowerLevel) {
  return UNIQUE_WEAPON_ENHANCE_TIERS.reduce(function (selectedTier, candidateTier) {
    return empowerLevel >= candidateTier.minLevel ? candidateTier : selectedTier;
  }, UNIQUE_WEAPON_ENHANCE_TIERS[0]);
}

// Publishes the cost, the stat gains and the skills of the next enhancement step.
function publishUniqueEnhanceStep(empowerLevel) {
  const tier = resolveUniqueEnhanceTier(empowerLevel);
  valueCountSet1 = tier.flatCost || tier.costPerLevel * empowerLevel;
  valueScriptArray1 = tier.statGains.slice();
  valueScriptArray2 = tier.skillIds.map(function (skillId) {
    return skillId === 'level' ? empowerLevel : skillId;
  });
}

// Applies the stat gains prepared by the first mode to the weapon parameters.
function applyUniqueEnhanceStatGains(weaponStateValues) {
  const uniqueStatGainList = valueScriptArray1;
  for (let statIndex = 0; statIndex <= 5; statIndex++) {
    if (!(uniqueStatGainList[statIndex] >= 1)) continue;
    weaponStateValues[statIndex + 2] += uniqueStatGainList[statIndex];
  }
}

weapon_uniqueEnhance = function(id,enhanceModeId){

  const weaponStateValues = $gameVariables.value(ITEM_SHOP_VARIABLE.ACTOR_WEAPON_PARAMETERS)[id];

  // Mode 1 prepares the next step, mode 2 commits the gains prepared before.
  if (enhanceModeId == 1) {
    publishUniqueEnhanceStep(weaponStateValues[10]);
    return;
  }
  if (enhanceModeId == 2) {
    applyUniqueEnhanceStatGains(weaponStateValues);
  }
}

// ---------------------------------------------------------------------------
// Collection list and simple H status
// ---------------------------------------------------------------------------
// Collected item list, item_collectList1(284)
// NOTE: the original read the undefined variable id1 and always crashed; the eval()
// built collectSlot1..4 is replaced by an indexed array.
// One slot of the collected item list: "[name:count]" or the empty marker.
function buildCollectSlotText(collectedItemId, party) {
  const collectedItem = $dataItems[collectedItemId];
  if (collectedItemId == 0 || !collectedItem) return `[登録なし]`;
  return `[${collectedItem.name}:${party.numItems(collectedItem)}]`;
}

// Two text lines and the framed window of the collected item list.
function showCollectListLines(collectSlotTexts) {
  $gameScreen.setDTextPicture(collectSlotTexts[1] + collectSlotTexts[2], 22);
  $gameScreen.setDTextPicture(collectSlotTexts[3] + collectSlotTexts[4], 22);
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.showPicture(48, "", 0, 10, 698, 100, 100, 255, 0);
}

item_collectList1 = function(varId){

  const collectedItemIds = $gameVariables.value(varId);
  const party = $gameParty;
  const collectSlotTexts = [];

  for (let slotIndex = 1; slotIndex <= 4; slotIndex++) {
    collectSlotTexts[slotIndex] = buildCollectSlotText(collectedItemIds[slotIndex], party);
  }

  showCollectListLines(collectSlotTexts);
}

// Simple H status list, actor_miniHstatusList1(283)
// Icon (or bracketed name) plus HP / MP of one girl.
function buildMiniHstatusText(actor, memberActorId) {
  const girlIconName = $dataActors[memberActorId].meta['IconGura'];
  const memberText = girlIconName
    ? `\x1bI[${Number(girlIconName)}]`
    : `[${actor.name()}]`;

  const actorRecords = $gameVariables.value(memberActorId + 380);
  const hpLabel = `\\I[12]:${actorRecords[1]}`;
  const mpLabel = `\\I[376]:${actorRecords[2]}`;
  return memberText + ` ${hpLabel} ${mpLabel}` + buildActorStateIconsText(actor);
}

// Status window of the girl members: one text picture per member plus the frame.
function showMiniHstatusWindow(girlMemberCount) {
  const iconOffsetValue = 758 + (girlMemberCount * -30);
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.showPicture(48, "", 0, 10, iconOffsetValue, 100, 100, 255, 0);
}

actor_miniHstatusList1 = function(varId){

  const battleMembers = $gameParty.battleMembers();
  const statusList = $gameVariables.value(varId);
  let girlMemberCount = 0;

  for (let memberIndex = 0; memberIndex <= 3; memberIndex++) {
    const battleMember = battleMembers[memberIndex];
    if (!battleMember) continue;

    const memberActorId = battleMember.actorId();
    const actor = $gameActors.actor(memberActorId);
    if (!isGirl(actor)) continue;

    girlMemberCount += 1;
    statusList[memberIndex] = buildMiniHstatusText(actor, memberActorId);
    $gameScreen.setDTextPicture(statusList[memberIndex], 22);
  }

  if (girlMemberCount < 1) return;
  showMiniHstatusWindow(girlMemberCount);
}

// Listed states (valueHstateDisplay) as icons.
function buildActorStateIconsText(actor) {
  let stateIconsText = ``;
  for (const stateId of valueHstateDisplay) {
    if (!actor.isStateAffected(stateId)) continue;
    stateIconsText += `\\I[${$dataStates[stateId].iconIndex}]`;
  }
  return stateIconsText;
}

// ---------------------------------------------------------------------------
// Shop goods
// ---------------------------------------------------------------------------
// Shop goods selection, shop_preparation1(1,1,0): type / rarity / 0 load only, 1 run the shop.
// Shop goods entry: ranked and not a lust item, of the requested rarity and, for
// weapons and armors, of the current equip type (valueCountSet3).
function isShopPreparationEntry(item, databaseTypeId, targetRarity) {
  const itemMeta = item.meta;
  if (!itemMeta['ShopRank'] || !itemMeta['LotteryRearity']) return false;
  if (itemMeta['SeiyokuItem']) return false;

  const isEquipTypeMatched = databaseTypeId == ITEM_SHOP_DB_ITEM || valueCountSet3 == item.etypeId;
  if (!isEquipTypeMatched) return false;
  return Number(itemMeta['LotteryRearity']) == targetRarity;
}

shop_preparation1 = function(databaseTypeId,targetRarity,sortFlag){

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;
  valueItems = entries;

  const itemsEnd = itemShopDatabaseEnd(databaseTypeId, entries);
  const shopEntries = [];

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const item = entries[itemId];
    if (!item) continue;
    if (!isShopPreparationEntry(item, databaseTypeId, targetRarity)) continue;

    shopEntries.push(itemShopEntry(databaseTypeId, itemId));
  }

  // Only this builder passes false to Scene_Shop, as the original did.
  itemShopOpen(shopEntries, sortFlag, false);
}

// Lust item shop, shop_preparationH(0,1,1)
shop_preparationH = function(unusedArg1,seiyokuItemId,sortFlag){

  const shopEntries = collectShopEntries([ITEM_SHOP_DB_ITEM, ITEM_SHOP_DB_WEAPON, ITEM_SHOP_DB_ARMOR], function (item) {
    return !!item.meta['SeiyokuItem'] && Number(item.meta['SeiyokuItem']) == seiyokuItemId;
  });
  valueItems = $dataArmors;// the original reads the armor database last
  itemShopOpen(shopEntries, sortFlag);
};

// Goods of one item database note tag, e.g. <EatShop:n>; every builder below only
// names the tag it filters on. The three wrappers keep their public names and
// arguments, and databaseTypeId is passed straight to the recorded entry type.
function openItemDatabaseShopByTag(metaKey, tagValue, databaseTypeId, sortFlag) {
  const shopEntries = collectFromItemDatabase(function (item) {
    return !!item.meta[metaKey] && Number(item.meta[metaKey]) == tagValue;
  }, databaseTypeId);
  itemShopOpen(shopEntries, sortFlag);
}

// Food shop, shop_preparationE(0,1,1)
shop_preparationE = function(databaseTypeId,eatShopId,sortFlag){
  openItemDatabaseShopByTag('EatShop', eatShopId, databaseTypeId, sortFlag);
};

// Ingredient shop, shop_preparationEI(0,1,1)
shop_preparationEI = function(databaseTypeId,ingredientsShopId,sortFlag){
  openItemDatabaseShopByTag('IngredientsShop', ingredientsShopId, databaseTypeId, sortFlag);
};

// Goods built from the item database only; the recorded type is the argument itself
// (shop_preparationE/EI and bookShop_preparert2 pass databaseTypeId straight through).
function collectFromItemDatabase(matches, databaseTypeId) {
  valueItems = $dataItems;
  return collectShopEntries([ITEM_SHOP_DB_ITEM], matches, [0, 0, 0, 0], databaseTypeId);
}

// Casino "Variable 69 Buy Price", boost potion "Variable 57 Buy Price", otherShop_preparation1(57,0,1)
otherShop_preparation1 = function(buyPriceVarId,lotteryRarity,sortFlag){

  const buyPriceTag = 'Variable ' + buyPriceVarId + ' Buy Price';
  const shopEntries = collectShopEntries([ITEM_SHOP_DB_ITEM, ITEM_SHOP_DB_WEAPON, ITEM_SHOP_DB_ARMOR], function (item) {
    if (!item.meta[buyPriceTag]) return false;
    // lotteryRarity 0 means every rarity, 1 and above must match; other values select nothing.
    if (lotteryRarity == 0) return true;
    if (lotteryRarity >= 1) return Number(item.meta['LotteryRearity']) == lotteryRarity;
    return false;
  }, [0, 0, 1, 0]);
  itemShopOpen(shopEntries, sortFlag);
};

// Book shop, goods only (no choices)
// Book shop, goods only (no choices)
bookShop_preparert2 = function(databaseTypeId,bookShopId,sortFlag){
  openItemDatabaseShopByTag('bookShop', bookShopId, databaseTypeId, sortFlag);
};

// Book shop with choices; valueCountSet1 is the picture id and valueCountSet2 the choice value.
bookShop_preparert = function(bookShopId){

  const dataItems = $dataItems;
  const party = $gameParty;
  const itemsEnd = dataItems.length - 1;

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const bookItem = dataItems[itemId];
    if (!bookItem || bookItem.name === '') continue;
    const bookMeta = bookItem.meta;
    if (!bookMeta['bookShop']) continue;
    if (Number(bookMeta['bookShop']) != bookShopId) continue;

    // Books with <Max Item:1> are listed only while they are not owned.
    const isBookOwned = Number(bookMeta['Max Item']) == 1 ? party.numItems(bookItem) != 0 : false;
    if (isBookOwned) continue;

    addBookChoice(bookItem, itemId);
  }
};

// Registers the choice, the description and the picture of one book.
function addBookChoice(bookItem, itemId) {
  const bookPrice = applyShopDiscount(bookItem.price);
  const ownedCount = $gameParty.numItems(bookItem);
  const bookListText = `${padBookName(bookItem.name)}${buildBookOwnedLabel(ownedCount)} `
    + colorTaggedText(2, bookPrice.toLocaleString()) + `\\G`;
  const bookDescriptionText = buildBookDescriptionText(bookItem);

  $gameSystem.addCustomChoice(1, { text: bookListText, value: valueCountSet2 });
  $gameScreen.setDTextPicture(bookDescriptionText, 28);
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.showPicture(valueCountSet1, "", 0, 10, 606, 100, 100, 255, 0);
  $gameMessage.setSelectPictureId(valueCountSet2, valueCountSet1);
  valueCountSet1 += 1;
  valueCountSet2 += 1;
  valueScriptArray2.push(itemId);
}

// valueCountSet3 is the discount rate in percent.
function applyShopDiscount(price) {
  if (valueCountSet3 == 0) return price;
  return Math.floor(price - (price * valueCountSet3 / 100));
}

function buildBookOwnedLabel(ownedCount) {
  if (ownedCount < 1) return colorTaggedText(3, `[未所持]`) + ` `;
  return colorTaggedText(10, `[${ownedCount}冊所持]`) + ` `;
}

// Pads the book title to 21 characters with ideographic spaces.
function padBookName(bookName) {
  let paddedName = bookName;
  if (paddedName.length > 19) return paddedName;
  for (let padIndex = paddedName.length; padIndex <= 20; padIndex++) paddedName += `　`;
  return paddedName;
}

// Extracts the skill id from <ADDescription:\sin[788]:\SD[788]> and appends it to the description.
function buildBookDescriptionText(bookItem) {
  const bookDescriptionText = `${bookItem.description}`;
  const adDescriptionValue = bookItem.meta['ADDescription'];
  if (!adDescriptionValue) return bookDescriptionText;

  const adDescription = adDescriptionValue.replace("\\sin[", "");
  const adSkillId = extractSkillIdFromDescription(adDescription);
  const adSkill = $dataSkills[Number(adSkillId)];
  return `${bookDescriptionText}\n${adSkill.name}:${adSkill.description}`;
}

// Reads up to three digits up to the closing bracket of "[788]".
function extractSkillIdFromDescription(adDescription) {
  let adSkillId = `${adDescription.charAt(0)}${adDescription.charAt(1)}`;
  if (adDescription.charAt(2) != ']') adSkillId += adDescription.charAt(2);
  return adSkillId;
}

// <jouhouBuyVariable:135,1><jouhouBuySwitche:135><jouhouBuyItem:100,101>
// One informant slot driven by <jouhouBuyVariable: id, needed value>; an unreached
// variable lists the dummy item instead.
function collectJouhouVariableSlot(infoItemMeta, itemId, buyInfoItemId, buyItemIds) {
  if (!infoItemMeta['jouhouBuyVariable']) return;
  const jouhouBuyValues = infoItemMeta['jouhouBuyVariable'].split(',');
  const jouhouVariableId = Number(jouhouBuyValues[0]);
  if (!(jouhouVariableId >= 1)) return;

  const isVariableReached = $gameVariables.value(jouhouVariableId) >= Number(jouhouBuyValues[1]);
  buyItemIds.push(isVariableReached ? itemId : buyInfoItemId);
}

// One informant slot driven by <jouhouBuySwitche>; the switch must be on to sell.
function collectJouhouSwitchSlot(infoItemMeta, itemId, buyInfoItemId, buyItemIds) {
  const jouhouSwitchMeta = infoItemMeta['jouhouBuySwitche'];
  if (!jouhouSwitchMeta || !(Number(jouhouSwitchMeta) >= 1)) return;

  const isSwitchOn = $gameSwitches.value(Number(jouhouSwitchMeta));
  buyItemIds.push(isSwitchOn ? itemId : buyInfoItemId);
}

// One informant slot driven by <jouhouBuyItem>, which needs one of the listed items.
function collectJouhouItemSlot(infoItemMeta, itemId, buyInfoItemId, buyItemIds) {
  if (!infoItemMeta['jouhouBuyItem']) return;
  buyItemIds.push(resolveJouhouBuyItemId(itemId, infoItemMeta['jouhouBuyItem'], buyInfoItemId));
}

jouhouShop_preparert = function(){

  const dataItems = $dataItems;
  const buyInfoItemId = 6;// Dummy item shown in the slots whose condition is not met
  const itemsEnd = dataItems.length - 1;
  const buyItemIds = [];

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const infoItemMeta = dataItems[itemId].meta;
    collectJouhouVariableSlot(infoItemMeta, itemId, buyInfoItemId, buyItemIds);
    collectJouhouSwitchSlot(infoItemMeta, itemId, buyInfoItemId, buyItemIds);
    collectJouhouItemSlot(infoItemMeta, itemId, buyInfoItemId, buyItemIds);
  }

  for (const infoItemId of buyItemIds) {
    $gameSystem.addCustomChoice(1, { text: buildJouhouChoiceText(infoItemId, buyInfoItemId), value: infoItemId });
  }
}

// The information is sold when the party owns one of the <jouhouBuyItem:100,101> entries.
function resolveJouhouBuyItemId(itemId, jouhouBuyItemValue, buyInfoItemId) {
  const jouhouBuyValues = jouhouBuyItemValue.split(',');
  for (const jouhouBuyItemId of jouhouBuyValues) {
    if (Number(jouhouBuyItemId) < 1) continue;
    if (!$gameParty.hasItem($dataItems[Number(jouhouBuyItemId)], true)) continue;
    return itemId;
  }
  return buyInfoItemId;
}

// Informant choice text; the dummy slot (6) shows the name only.
function buildJouhouChoiceText(infoItemId, buyInfoItemId) {
  const infoItem = $dataItems[infoItemId];
  if (infoItemId == buyInfoItemId) return infoItem.name;

  const infoItemPriceText = colorTaggedText(2, `(${infoItem.price.toLocaleString()}\\G)`);
  let infoItemNameText = `${infoItem.name} ${infoItemPriceText}`;
  if ($gameParty.hasItem(infoItem, true)) infoItemNameText += colorTaggedText(10, `[購入済み]`);
  return infoItemNameText;
}
// ---------------------------------------------------------------------------
// Eating
// ---------------------------------------------------------------------------
// Satiety is variable 16 with its cap in variable 13; eaten effects are pushed to variable 620.
const EAT_SATIETY_VARIABLE_ID = 16;
const EAT_SATIETY_MAX_VARIABLE_ID = 13;
const EAT_EFFECT_ARRAY_VARIABLE_ID = 620;
const EAT_EFFECT_STATE_ID = 107;
const EAT_EFFECT_SLOT_MAX = 9;

// Whether the satiety cap is reached (item_eatEvent2 tests cap <= current).
function isFullStomach() {
  return !($gameVariables.value(EAT_SATIETY_MAX_VARIABLE_ID) > $gameVariables.value(EAT_SATIETY_VARIABLE_ID));
}

// The unused item_eatEvent tests current > cap, which is the original condition.
function isFullStomachOver() {
  return $gameVariables.value(EAT_SATIETY_VARIABLE_ID) > $gameVariables.value(EAT_SATIETY_MAX_VARIABLE_ID);
}

// Pushes the <eatEffect1..9: kind,value,time> entries into the variable 620 array.
function pushEatEffectEntries(itemMeta) {
  const eatEffectArray = $gameVariables.value(EAT_EFFECT_ARRAY_VARIABLE_ID);

  for (let effectSlot = 1; effectSlot <= EAT_EFFECT_SLOT_MAX; effectSlot++) {
    const eatEffectValue = itemMeta['eatEffect' + effectSlot];
    if (!eatEffectValue) continue;
    const eatEffectValues = eatEffectValue.split(',');
    eatEffectArray.push([Number(eatEffectValues[0]), Number(eatEffectValues[1]), Number(eatEffectValues[2])]);
  }
}

// Eating event
// Second stage of item_eatEvent2: the confirm press only closes the window again.
function closeEatInfoWindow() {
  WindowManager.hide(0);
  valueCountSet1 = 0;
  $gameSwitches.setValue(ITEM_SHOP_SWITCH.EAT_INFO_WINDOW, false);
}

// Refusal message when the satiety cap is already reached.
function showFullStomachMessage() {
  const satietyMax = $gameVariables.value(EAT_SATIETY_MAX_VARIABLE_ID);
  const satietyMaxText = colorTaggedText(10, `${satietyMax}`);
  TickerManager.show(`満腹でこれ以上は食べられない…。（満腹上限:${satietyMaxText}）`);
}

// Applies one eaten entry: effect slots, satiety, party state, inventory and sound.
function applyEatenItem(eatItem, eatItemMeta) {
  pushEatEffectEntries(eatItemMeta);
  $gameVariables.setValue(EAT_SATIETY_VARIABLE_ID, $gameVariables.value(EAT_SATIETY_VARIABLE_ID) + 1);

  $gameParty.members().forEach(function (actor) { actor.addState(EAT_EFFECT_STATE_ID); });
  trait_changeSetting(EAT_EFFECT_STATE_ID);
  $gameParty.gainItem(eatItem, -1);
  AudioManager.playSe({ name: "Z_Eat", volume: 100, pitch: 100, pan: 0 });
}

// Opens the confirmation window with the eaten entry description.
function showEatInfoWindow(itemId, eatItemMeta) {
  const windowWidth = 1280;
  const windowHeight = 290;
  WindowManager.show(0, 0, 0, windowWidth, windowHeight);
  WindowManager.drawText(0, buildEatInfoMessage(itemId, eatItemMeta));
  valueCountSet1 = 1;
}

item_eatEvent2 = function(usedItem,targetItem,itemId){

  if (targetItem.actorId() != usedItem.actorId()) return;

  // While switch 603 is on, the confirm press closes the window (second stage).
  if ($gameSwitches.value(ITEM_SHOP_SWITCH.EAT_INFO_WINDOW)) {
    closeEatInfoWindow();
    return;
  }

  if (isFullStomach()) {
    showFullStomachMessage();
    return;
  }

  const eatItem = $dataItems[itemId];
  const eatItemMeta = eatItem.meta;

  applyEatenItem(eatItem, eatItemMeta);
  showEatInfoWindow(itemId, eatItemMeta);

  $gameSwitches.setValue(ITEM_SHOP_SWITCH.EAT_INFO_WINDOW, true);
  activateEatEventSwitch(eatItemMeta);
}

// Message with the satiety values and the eaten verb.
function buildEatInfoMessage(itemId, eatItemMeta) {
  const satietyNow = $gameVariables.value(EAT_SATIETY_VARIABLE_ID);
  const satietyMax = $gameVariables.value(EAT_SATIETY_MAX_VARIABLE_ID);

  const itemLabel = `\x1bIIN[${itemId}]`;
  const eatVerb = eatOutcomeText(eatItemMeta);
  const satietyNowText = colorTaggedText(3, `${satietyNow}`);
  const satietyMaxText = colorTaggedText(10, `${satietyMax}`);
  const effectDescription = $dataStates[EAT_EFFECT_STATE_ID].description;
  const closeHintText = colorTaggedText(10, `ウィンドウ消去はカーソルをそのままで決定ボタンorマウス左クリック。`);

  const eatInfoMessage = `${itemLabel}を${eatVerb}。（満腹度:`
    + `${satietyNowText}/${satietyMaxText}）` + '\n'
    + effectDescription + '\n\n'
    + `※ ${closeHintText}` + '\n';
  return eatInfoMessage;
}

// An <EventOnSwitch:n> of 2 or more is raised as an event switch.
function activateEatEventSwitch(eatItemMeta) {
  const eventOnSwitchValue = eatItemMeta['EventOnSwitch'];
  if (!eventOnSwitchValue) return;

  const eventSwitchId = Number(eventOnSwitchValue);
  if (!(eventSwitchId >= 2)) return;
  if ($gameSwitches.value(eventSwitchId)) return;
  $gameSwitches.setValue(eventSwitchId, true);
}

// Eating event, unused version
// Satiety, TP and sound of the unused eat event.
function applyLegacyEatEffects(eatItemMeta) {
  const eatStuffValue = Number(eatItemMeta['Stuff']);
  const eatTpValue = Number(eatItemMeta['ＴＰ']);

  $gameVariables.setValue(EAT_SATIETY_VARIABLE_ID, $gameVariables.value(EAT_SATIETY_VARIABLE_ID) + eatStuffValue);
  $gameParty.members().forEach(function (actor) { actor.gainTp(eatTpValue); });
  AudioManager.playSe({ name: "Z_Eat", volume: 100, pitch: 100, pan: 0 });
  return { eatStuffValue: eatStuffValue, eatTpValue: eatTpValue };
}

// Ticker line of the unused eat event: TP gain, satiety gain and the satiety values.
function buildLegacyEatMessage(itemId, eatItemMeta, eatStuffValue, eatTpValue) {
  const itemLabel = colorTaggedText(24, `\x1bIIN[${itemId}]`);
  const satietyNow = `\\V[16]`;
  const satietyMax = `\\V[13]`;
  const eatVerb = eatOutcomeText(eatItemMeta);
  const eatTpText = colorTaggedText(2, `${eatTpValue}`);
  const eatStuffText = colorTaggedText(2, `${eatStuffValue}`);
  return `${itemLabel}を${eatVerb} TP${eatTpText}%UP! `
    + `満腹度${eatStuffText}上昇(${satietyNow}/${satietyMax})`;
}

item_eatEvent = function(unusedArg1,unusedArg2,itemId){

  if (isFullStomachOver()) {
    TickerManager.show(`満腹でこれ以上は食べられない…。`);
    return;
  }

  const eatItem = $dataItems[itemId];
  const eatItemMeta = eatItem.meta;
  const eatValues = applyLegacyEatEffects(eatItemMeta);

  TickerManager.show(buildLegacyEatMessage(itemId, eatItemMeta, eatValues.eatStuffValue, eatValues.eatTpValue));
  $gameParty.loseItem(eatItem, 1);

  const onSwitchValue = eatItemMeta['OnSwitch'];
  if (!onSwitchValue) return;
  const onSwitchId = Number(onSwitchValue);
  if (!(onSwitchId >= 1) || $gameSwitches.value(onSwitchId)) return;
  $gameSwitches.setValue(onSwitchId, true);
  time_settei();
}

// ---------------------------------------------------------------------------
// Wallet items
// ---------------------------------------------------------------------------
// Ruby from a wallet item, <walletIn: minimum,width>
wallet_insideGet = function(usedItem,targetItem,itemId,databaseTypeId){

  if (targetItem.actorId() != usedItem.actorId()) return;

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;
  valueItems = entries;

  const walletItem = entries[itemId];
  const walletInValues = walletItem.meta['walletIn'].split(',');
  const walletMin = Number(walletInValues[0]);
  const walletRange = Number(walletInValues[1]);
  const walletGainAmount = Math.floor(Math.random() * walletRange + 1) + walletMin;

  const walletItemLabel = colorTaggedText(2, `\x1bIIN[${itemId}]`);
  const walletAmountText = colorTaggedText(14, `${walletGainAmount}\\G`);
  TickerManager.show(`${walletItemLabel}には${walletAmountText}入っていた！`);

  $gameParty.gainGold(walletGainAmount);
  $gameParty.gainItem(walletItem, -1);
};

// ---------------------------------------------------------------------------
// Bulk sale
// ---------------------------------------------------------------------------
// Builds the bulk sale choices; damageTypeId 0 items, 1 weapons, 2 armors.
// Walks the shop database and keeps the rows `selectRow` accepts. `selectRow` returns
// the display line of an entry, or null to skip it. The original loops of both bulk
// sale choices only differed in that predicate and in what they published afterwards.
function collectBulkSellRows(databaseTypeId, selectRow) {
  const rows = [];
  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return rows;

  const itemsEnd = itemShopDatabaseEnd(databaseTypeId, entries);
  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const item = entries[itemId];
    if (!item) continue;

    const line = selectRow(item, itemId);
    if (line === null) continue;
    rows.push({ itemId, line });
  }
  return rows;
}

ikkatu_sellChoice = function(databaseTypeId,menuCategoryId){

  const party = $gameParty;
  const rows = collectBulkSellRows(databaseTypeId, (item, itemId) => {
    if (!canBulkSell(item, databaseTypeId, menuCategoryId)) return null;
    if (!party.hasItem(item)) return null;

    // The colour changes when the bulk sale self switch is on.
    return buildBulkSellChoiceText(item, party, bulkSellMark(databaseTypeId, itemId) != 0);
  });

  if (rows.length < 1) return;
  valueWordArray = rows.map((row) => row.line);
  valueCountArray = rows.map((row) => row.itemId);
}


// Whether an entry can be sold in bulk: name, sell price, category, equip type, owned.
function canBulkSell(item, databaseTypeId, menuCategoryId) {
  if (item.name === '') return false;
  if (!(item.price >= 1 || hasSellPriceTag(item))) return false;
  if (databaseTypeId == ITEM_SHOP_DB_ITEM && item.meta['Menu Category'] != menuCategoryId) return false;
  if (databaseTypeId == ITEM_SHOP_DB_ARMOR && item.etypeId == 3) return false;
  return true;
}

// One bulk sale choice line.
// Self switch mark of the bulk sale target list: map 4, the type group and the item id.
function bulkSellMark(databaseTypeId, itemId) {
  return $gameSelfSwitches.getVariableValue([4, 11 + databaseTypeId, itemId]);
}

function buildBulkSellChoiceText(item, party, isMarkedForBulkSell) {
  let itemNameAndCount = `\x1bI[${item.iconIndex}]${item.name}:${party.numItems(item)}`;
  if (isMarkedForBulkSell){
    itemNameAndCount = colorTaggedText(isMarkedForBulkSell ? 10 : 0, itemNameAndCount);
  }
  return BULK_SELL_FONT_TAG + itemNameAndCount;
}

// Bulk sale target selection, self switch version
// Choice line of the bulk sale confirmation list: font size, icon, name and count.
function buildBulkSellListLine(item, party) {
  const itemName = `\x1bI[${item.iconIndex}]${item.name}`;
  return BULK_SELL_FONT_TAG + `${itemName}:${party.numItems(item)}`;
}

ikkatu_sellChoice2 = function(databaseTypeId){

  const party = $gameParty;
  const rows = collectBulkSellRows(databaseTypeId, (item, itemId) => {
    if (bulkSellMark(databaseTypeId, itemId) == 0) return null;
    return buildBulkSellListLine(item, party);
  });

  if (rows.length < 1) return;
  valueWordArray = rows.map((row) => row.line);
  valueCountArray = rows.map((row) => row.itemId);
  valueCountArray2 = rows.map(() => databaseTypeId);
}


// Bulk sale arithmetic
item_ikkatu = function(databaseTypeId){

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;

  const party = $gameParty;
  const itemsEnd = itemShopDatabaseEnd(databaseTypeId, entries);

  for (let itemId = 1; itemId <= itemsEnd; itemId++) {
    const item = entries[itemId];
    if (!item) continue;
    if (!party.hasItem(item)) continue;
    // only the entries whose bulk sale self switch is on are sold
    if (!(bulkSellMark(databaseTypeId, itemId) >= 1)) continue;

    sellBulkItem(item);
  }
};

// Sells one entry, splitting the amount per currency: gold, variable 57, variable 69, items.
function sellBulkItem(item) {
  const itemMeta = item.meta;
  const sellItemCount = $gameParty.numItems(item);
  if (sellItemCount < 1) return;

  const goldPrices = resolveBulkSellGoldPrices(item);
  const variablePrice = resolveBulkSellVariablePrice(itemMeta) * sellItemCount;
  const itemPrice = resolveBulkSellItemPrice(itemMeta) * sellItemCount;

  $gameParty.loseItem(item, sellItemCount);
  if (goldPrices.total >= 1) $gameParty.gainGold(goldPrices.total);

  // NOTE: variable 69 is increased with the amount computed for variable 57, as in the original.
  if (variablePrice >= 1) {
    if (itemMeta['Variable 57 Sell Price']) {
      const currencyCount = $gameVariables.value(ITEM_SHOP_VARIABLE.VARIABLE_57_CURRENCY);
      $gameVariables.setValue(ITEM_SHOP_VARIABLE.VARIABLE_57_CURRENCY, currencyCount + variablePrice);
    }
    if (itemMeta['Variable 69 Sell Price']) {
      const coinCount = $gameVariables.value(ITEM_SHOP_VARIABLE.COIN_COUNT);
      $gameVariables.setValue(ITEM_SHOP_VARIABLE.COIN_COUNT, coinCount + variablePrice);
    }
  }

  if (itemPrice >= 1) {
    for (const sellItemTag of ITEM_SHOP_SELL_ITEM_TAGS) {
      if (!itemMeta[sellItemTag]) continue;
      $gameParty.gainItem($dataItems[Number(sellItemTag.split(' ')[1])], itemPrice);
    }
  }

  valueIkkatuArray.push([
    `\x1bI[${item.iconIndex}]${item.name}`, sellItemCount, goldPrices.total, variablePrice, itemPrice
  ]);
  valueCountSet1 += 1;
}

// Gold payout: <Price> is halved and <Sell Price> wins.
function resolveBulkSellGoldPrices(item) {
  const itemMeta = item.meta;
  let baseSellPrice = 0;
  let itemBasePrice = item.price;

  if (itemMeta['Sell Price']) baseSellPrice = Number(itemMeta['Sell Price']);
  if (itemMeta['Price']) baseSellPrice = Math.round(Number(itemMeta['Price']) / 2);

  const sellItemCount = $gameParty.numItems(item);
  if (baseSellPrice >= 1) baseSellPrice = baseSellPrice * sellItemCount;
  if (itemBasePrice >= 1) itemBasePrice = itemBasePrice / 2 * sellItemCount;

  return { total: itemBasePrice + baseSellPrice };
}

// Variable currency payout; the variable 57/69 tags overwrite the same value.
function resolveBulkSellVariablePrice(itemMeta) {
  let variablePrice = 0;
  for (const sellTag of ITEM_SHOP_SELL_VARIABLE_TAGS) {
    if (!itemMeta[sellTag]) continue;
    variablePrice = Number(itemMeta[sellTag]);
  }
  return variablePrice;
}

// Item currency payout; the 270/147/152 tags overwrite the same value.
function resolveBulkSellItemPrice(itemMeta) {
  let itemPrice = 0;
  for (const sellTag of ITEM_SHOP_SELL_ITEM_TAGS) {
    if (!itemMeta[sellTag]) continue;
    itemPrice = Number(itemMeta[sellTag]);
  }
  return itemPrice;
}

// ---------------------------------------------------------------------------
// Shop purchase rate
// ---------------------------------------------------------------------------
// shop_taxDecision1(this._eventId);
// The discount rate is the self switch (10) variable value; negative means a discount.
// Purchase rate of the shop event: the discount comes from the self switch (10)
// variable value, a negative value being a discount. The negotiation flag (self
// switch B) and the seduction state (self switch A) are reported through the
// valueCountSet globals, as the following common events expect them.
shop_taxDecision1 = function(eventId){

  valueCountSet1 = 0;
  valueCountSet2 = 0;
  valueCountSet3 = 0;
  valueRandomSet = 0;
  $gameSwitches.setValue(ITEM_SHOP_SWITCH.SHOP_NEGOTIATION, false);

  const actor = $gameActors.actor($gameVariables.value(ITEM_SHOP_VARIABLE.CURRENT_VIEWPOINT_ACTOR_ID));
  const shopEvent = $gameMap.event(eventId);
  if (!actor || !shopEvent) return;

  const mapId = $gameMap.mapId();
  const taxRate = $gameSelfSwitches.getVariableValue([mapId, eventId, 10]);
  const isNegotiated = $gameSelfSwitches.value([mapId, eventId, 'B']);
  const isHoneyTrapped = $gameSelfSwitches.value([mapId, eventId, 'A']);

  $gameSystem.setBuyTaxTo(isNegotiated ? taxRate : 0);
  if (isHoneyTrapped) valueCountSet1 += 1;

  if ($gameSwitches.value(ITEM_SHOP_SWITCH.COMMERCE_ENABLED)) {// commerce on
    markShopNegotiationState(shopEvent, actor, isNegotiated);
  }

  if (taxRate > -1) return;
  showNegotiatedDiscount(taxRate);
}

// Commerce switch branch: the shop keeper offers a negotiation and, unless it was
// already used, the negotiation switch (380) is raised.
function markShopNegotiationState(shopEvent, actor, isNegotiated) {
  const shopEventMeta = shopEvent.event().meta || {};
  if (shopEventMeta['Man'] && actor.battleSkillsRaw().contains(valueHoneyTrapSkillId)) {
    valueCountSet2 += 1;
  }
  // Negotiation is allowed once a day.
  if (!isNegotiated) $gameSwitches.setValue(ITEM_SHOP_SWITCH.SHOP_NEGOTIATION, true);
}

// Discount line shown when the shop is already negotiated with.
function showNegotiatedDiscount(taxRate) {
  const discountText = colorTaggedText(10, `${-taxRate}%`);
  const taxInfoText = `値段交渉済み：${discountText}の値引きが行われます。`;
  CommonPopupManager.showInfo({}, taxInfoText, null);
}

// Shop purchase rate steps, spaced by common events: shop_taxDecision2(this._eventId,1)
// Shop negotiation steps, spaced by common events:
// 1 shows the window, 2 plays the seduction scene, 3 rolls the outcome, 4 shows the result.
shop_taxDecision2 = function(eventId,decisionModeId){

  $gameSwitches.setValue(ITEM_SHOP_SWITCH.SHOP_NEGOTIATION, false);

  const actor = $gameActors.actor($gameVariables.value(ITEM_SHOP_VARIABLE.CURRENT_VIEWPOINT_ACTOR_ID));
  if (!actor) return;

  switch (decisionModeId) {
    case 1:
      startTaxDecisionWindow();
      break;
    case 2:
      playHoneyTrapScene(actor);
      break;
    case 3:
      rollTaxDecision(eventId, actor);
      break;
    case 4:
      finishTaxDecision(eventId);
      break;
  }
}

// 1: show the negotiation window.
function startTaxDecisionWindow() {
  $gameVariables.setValue(ITEM_SHOP_VARIABLE.TEMPORARY_TEXT, `値引き交渉を行っています…。` + '\n');
  $gameScreen.dTextRealTime = 'ON';
  $gameScreen.dWindowFrame = 'ON';
  $gameScreen.setDTextPicture(`\\V[21]`, 28);

  const negotiationPictureId = 100;
  $gameScreen.showPicture(negotiationPictureId, "", 0, 10 + 50, 100, 100, 100, 0, 0);
  $gameScreen.movePicture(negotiationPictureId, 0, 10, 100, 100, 100, 255, 0, 60);
}

// 2: seduction animation; each variant lists [id, picture, start x, end x, opacity].
const HONEY_TRAP_PICTURE_SETS = {
  1: [
    [55, 'ScreenBlackOut', 640 - 100, 640, 200],
    [56, 'Zev_HoneyTrap1_1a', 640 + 100, 640, 250],
    [57, 'Zev_HoneyTrap1_1', 1024 + 128, 1024, 255]
  ],
  2: [
    [55, 'Screen_Width512Black', 1024 - 100, 1024 - 50, 200],
    [56, 'Zev_HoneyTrap1_2', 1024 + 128, 1024, 255]
  ],
  // Variant 3 is not part of the [1,2] draw, so it never runs.
  3: [
    [55, 'ScreenBlackOut', 640 - 100, 640, 200],
    [56, 'Zev_HoneyTrap1_3', 640 + 50, 640, 250]
  ]
};

function playHoneyTrapScene() {
  valueRandomSet = 10;
  const honeyTrapParticle = 'hStates_hexpUp';
  $gameScreen._particle.particleSet(0, honeyTrapParticle, 'screen', 'def', 'spriteset');
  AudioManager.playSe({ name: 'ZH_Sexy', volume: 40, pitch: 130, pan: 0 });
  $gameScreen.startFlash([255, 119, 255, 200], 60);

  const trapVariantCandidates = [1, 2];
  const trapVariant = trapVariantCandidates[getRandomIndex(trapVariantCandidates.length)];
  for (const trapPicture of HONEY_TRAP_PICTURE_SETS[trapVariant]) {
    showHoneyTrapPicture(trapPicture);
  }
}

// Shows one picture sliding from the right to the centre.
function showHoneyTrapPicture(trapPicture) {
  const [pictureId, pictureName, startX, endX, opacity] = trapPicture;
  const pictureY = 384;
  const moveDuration = 60;
  $gameScreen.showPicture(pictureId, pictureName, 1, startX, pictureY, 100, 100, 0, 0);
  $gameScreen.movePicture(pictureId, 1, endX, pictureY, 100, 100, opacity, 0, moveDuration);
}

// 3: negotiation roll; the threshold changes with <NoDiscount>.
const TAX_SUCCESS_THRESHOLDS = { normal: 60, noDiscount: 1000 };

function rollTaxDecision(eventId, actor) {
  const businessMastery = actor.skillMasteryLevel(valueBusinessSkillId);
  const rollScore = getRandomIndex(101) + businessMastery * 10 + valueRandomSet;
  const eventMeta = $gameMap.event(eventId).event().meta || {};
  const successThreshold = eventMeta['NoDiscount'] ? TAX_SUCCESS_THRESHOLDS.noDiscount : TAX_SUCCESS_THRESHOLDS.normal;

  const rollScoreText = colorTaggedText(2, `${rollScore}`);
  const thresholdText = colorTaggedText(1, `${successThreshold}`);
  const formulaText = `成功計算式：${rollScoreText} >= ${thresholdText} ` + '\n';
  $gameVariables.setValue(ITEM_SHOP_VARIABLE.TEMPORARY_TEXT, $gameVariables.value(ITEM_SHOP_VARIABLE.TEMPORARY_TEXT) + formulaText);

  if (rollScore < successThreshold) return;

  const discountRate = getRandomIndex(11) + businessMastery * 5 + valueRandomSet;
  $gameSelfSwitches.setVariableValue([$gameMap.mapId(), eventId, 10], discountRate);
  valueCountSet3 = 1;
}

// 4: result display; a success raises self switch A.
// Appends a line to the negotiation window text (variable 21).
function appendNegotiationText(lineText) {
  const currentText = $gameVariables.value(ITEM_SHOP_VARIABLE.TEMPORARY_TEXT);
  $gameVariables.setValue(ITEM_SHOP_VARIABLE.TEMPORARY_TEXT, currentText + lineText);
}

// Failed negotiation: the shop keeps its price and the negotiation is used up.
function finishFailedTaxDecision(mapId, eventId) {
  $gamePlayer.requestBalloon(6);
  AudioManager.playSe({ name: 'Down1', volume: 90, pitch: 100, pan: 0 });
  appendNegotiationText(`交渉失敗…。`);
  $gameSelfSwitches.setValue([mapId, eventId, 'B'], true);
}

// Successful negotiation: the discount line is shown and the negotiation is used up.
// Self switch A is raised as well when the seduction discount succeeded.
function finishSucceededTaxDecision(mapId, eventId) {
  AudioManager.playSe({ name: 'Z11_QuestClear', volume: 50, pitch: 130, pan: 0 });
  const discountRate = $gameSelfSwitches.getVariableValue([mapId, eventId, 10]);
  const discountText = colorTaggedText(10, `${discountRate}%の値引きが行われます。` + '\n');
  appendNegotiationText(`交渉成功！ ${discountText}`);

  if (valueCountSet2 == 1) $gameSelfSwitches.setValue([mapId, eventId, 'A'], true);
  $gameSelfSwitches.setValue([mapId, eventId, 'B'], true);
}

function finishTaxDecision(eventId) {
  const mapId = $gameMap.mapId();

  if (valueCountSet3 != 1) {
    finishFailedTaxDecision(mapId, eventId);
    return;
  }
  finishSucceededTaxDecision(mapId, eventId);
}

// ---------------------------------------------------------------------------
// Price versus owned amount
// ---------------------------------------------------------------------------
// shop_priceComparison(10000,0,0);
// costAmount 0 reads the price of the entry; currencyTypeId 0 gold, 1 coins (variable 69), 2 war medals (item 10).
// Price comparison line of the shop: "label:owned unit - price unit = change unit".
function buildShortageText(currency, costAmount, ownedAmount) {
  const ownedText = ownedAmount.toLocaleString();
  const costText = costAmount.toLocaleString();
  return `${currency.label}:${ownedText}${currency.unit} < `
    + `支払額:${costText}${currency.unit}　所持金が足りなかった…`;
}

// Change line of the shop when the party can pay.
function buildChangeText(currency, costAmount, ownedAmount) {
  const priceDifference = ownedAmount - costAmount;
  const ownedText = ownedAmount.toLocaleString();
  const costText = costAmount.toLocaleString();
  const changeText = colorTaggedText(14, `${priceDifference.toLocaleString()}${currency.unit}`);
  return `${currency.label}:${ownedText}${currency.unit} - `
    + `支払額:${costText}${currency.unit} = `
    + changeText + `…`;
}

// Compares the price with the owned amount and pays it when the party can afford it.
// costAmount 0 reads the price of the entry; currencyTypeId 0 gold, 1 coins, 2 war medals.
shop_priceComparison = function(costAmount,currencyTypeId,itemId){

  valuePriceSet1 = costAmount;
  if (costAmount == 0) {
    valuePriceSet1 = resolvePurchasePrice(currencyTypeId, itemId);
  }

  const currency = purchaseCurrency(currencyTypeId, costAmount);
  const ownedAmount = currency.ownedAmount;

  if (ownedAmount < costAmount) {
    CommonPopupManager.showInfo({}, buildShortageText(currency, costAmount, ownedAmount), null);
    $gameSwitches.setValue(ITEM_SHOP_SWITCH.SHOP_NEGOTIATION, false);
    return;
  }

  CommonPopupManager.showInfo({}, buildChangeText(currency, costAmount, ownedAmount), null);
  AudioManager.playSe({ name: 'Shop', volume: 90, pitch: 100, pan: 0 });

  payPurchaseCost(costAmount, currencyTypeId);
  $gameSwitches.setValue(ITEM_SHOP_SWITCH.SHOP_NEGOTIATION, true);
}

// Price of an entry, <Buy Price> first.
function resolvePurchasePrice(currencyTypeId, itemId) {
  const entries = itemShopDatabase(currencyTypeId);
  if (!entries) return 0;
  valueItems = entries;// kept as a global, as the original did

  const purchaseItem = entries[itemId];
  let comparedPrice = 0;
  if (Number(purchaseItem.price) >= 1) comparedPrice = purchaseItem.price;
  if (purchaseItem.meta['Buy Price']) comparedPrice = Number(purchaseItem.meta['Buy Price']);
  return comparedPrice;
}

// Label, unit and owned amount per currency; costAmount 0 keeps gold, as the original did.
function purchaseCurrency(currencyTypeId, costAmount) {
  if (costAmount >= 1 && currencyTypeId == 1) {
    return { label: `コイン`, unit: `枚`, ownedAmount: $gameVariables.value(ITEM_SHOP_VARIABLE.COIN_COUNT) };
  }
  if (costAmount >= 1 && currencyTypeId == 2) {
    return { label: `戦貨`, unit: `枚`, ownedAmount: $gameParty.numItems($dataItems[10]) };
  }
  return { label: `所持金`, unit: `\\G`, ownedAmount: $gameParty.gold() };
}

// Payment: coins use variable 69, war medals item 10, everything else gold.
function payPurchaseCost(costAmount, currencyTypeId) {
  if (costAmount >= 1 && currencyTypeId == 1) {
    $gameVariables.setValue(ITEM_SHOP_VARIABLE.COIN_COUNT, $gameVariables.value(ITEM_SHOP_VARIABLE.COIN_COUNT) - costAmount);
    return;
  }
  if (costAmount >= 1 && currencyTypeId == 2) {
    $gameParty.gainItem($dataItems[10], -costAmount);
    return;
  }
  $gameParty.gainGold(-costAmount);
}

// ---------------------------------------------------------------------------
// One-off item purchase
// ---------------------------------------------------------------------------
// buyModeId 1 prepares the display, 2 buys, 3 is a battle reward, 0 cleans up
const ONE_OFF_BUY_PICTURE_ID = 101;
const ONE_OFF_BUY_SUMMON_ICON_INDEX = 508;

// One-off purchase modes: 1 prepares the window, 2 buys, 3 is a battle reward and
// 0 removes the window again.
const ONE_OFF_BUY_MODE_CLEANUP = 0;
const ONE_OFF_BUY_MODE_PREPARE = 1;
const ONE_OFF_BUY_MODE_PURCHASE = 2;
const ONE_OFF_BUY_MODE_REWARD = 3;

// Prepare mode: background, portrait and the weapon animation that goes with them.
function showOneOffBuyPreview(purchaseItem, databaseTypeId, buyFlag) {
  const passiveStateId = showOneOffBuyPictures(purchaseItem, buyFlag);
  const pictureYOffset = showOneOffBuyItemPicture(purchaseItem, passiveStateId);
  playOneOffBuyWeaponAnimation(purchaseItem, databaseTypeId, pictureYOffset);
}

// Purchase mode: the item is granted and the price stored in variable 22 is paid.
function confirmOneOffBuyPurchase(purchaseItem) {
  // Variable 22 holds the price prepared by the display mode.
  const purchasePrice = $gameVariables.value(ITEM_SHOP_VARIABLE.TEMPORARY_VALUE);
  $gameParty.gainItem(purchaseItem, 1);
  $gameParty.loseGold(purchasePrice);

  const itemLabel = `\x1bI[${purchaseItem.iconIndex}]` + colorTaggedText(16, purchaseItem.name);
  const paidAmountText = colorTaggedText(1, `(-${purchasePrice}\\G)`);
  CommonPopupManager.showInfo({}, `${itemLabel}を購入した。${paidAmountText}`, null);
  AudioManager.playSe({ name: 'Shop1', volume: 90, pitch: 100, pan: 0 });
}

// Battle reward mode: the item is granted and its name is published for the ticker.
function grantOneOffBuyReward(purchaseItem) {
  $gameParty.gainItem(purchaseItem, 1);
  const itemLabel = `\x1bI[${purchaseItem.iconIndex}]` + colorTaggedText(16, purchaseItem.name);
  valueWordSet0 = `${itemLabel}を入手した！`;
  AudioManager.playSe({ name: 'Z11_RareTreasureBox', volume: 50, pitch: 120, pan: 0 });
  adv_partDirectPlay(18);
}

// Cleanup mode: the window pictures are erased again. The state and y offset are only
// ever filled by the prepare mode, so the cleanup always runs with 0 / undefined here,
// exactly like the original.
function cleanupOneOffBuyPreview() {
  pic_eraseP(0, [ONE_OFF_BUY_PICTURE_ID - 3, ONE_OFF_BUY_PICTURE_ID - 2]);
  picture_fade1(ONE_OFF_BUY_PICTURE_ID, "fadeOut", 'Hscene005', 60, 5);
  element_particleSet(0, ONE_OFF_BUY_PICTURE_ID, 0, undefined);
}

item_oneOffBuy = function(buyModeId,databaseTypeId,dbEntryId,buyFlag){

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;

  valueItems = entries[dbEntryId];
  const purchaseItem = valueItems;
  if (!purchaseItem) return;

  switch (buyModeId) {
    case ONE_OFF_BUY_MODE_PREPARE:
      showOneOffBuyPreview(purchaseItem, databaseTypeId, buyFlag);
      break;
    case ONE_OFF_BUY_MODE_PURCHASE:
      confirmOneOffBuyPurchase(purchaseItem);
      break;
    case ONE_OFF_BUY_MODE_REWARD:
      grantOneOffBuyReward(purchaseItem);
      break;
    case ONE_OFF_BUY_MODE_CLEANUP:
      cleanupOneOffBuyPreview();
      break;
  }
};

// Shows the background and the portrait and sets the description (variable 21) and price (variable 22).
function showOneOffBuyPictures(purchaseItem, buyFlag) {
  const backgroundPath = (buyFlag == 0)
    ? "/img/parallaxes/Scene_ItemsBuy"
    : "/img/parallaxes/" + $gameVariables.value(ITEM_SHOP_VARIABLE.MENU_BACKGROUND_NAME);
  $gameScreen.showPicture(ONE_OFF_BUY_PICTURE_ID - 3, backgroundPath, 1, 640, 384, 100, 100, 0, 0);
  $gameScreen.movePicture(ONE_OFF_BUY_PICTURE_ID - 3, 1, 640, 384, 100, 100, 250, 0, 40);

  const blackOutPath = 'ScreenBlackOut';
  $gameScreen.showPicture(ONE_OFF_BUY_PICTURE_ID - 2, blackOutPath, 1, 640, 384, 100, 100, 0, 0);
  $gameScreen.movePicture(ONE_OFF_BUY_PICTURE_ID - 2, 1, 640, 384, 100, 100, 200, 0, 40);

  let passiveStateId = 0;
  if (purchaseItem.meta['Passive State']) {
    passiveStateId = Number(purchaseItem.meta['Passive State']);
    element_particleSet(1, ONE_OFF_BUY_PICTURE_ID, passiveStateId, 0);
  }

  // NOTE: variable 22 doubles as the temporary purchase price, as the original did.
  $gameVariables.setValue(ITEM_SHOP_VARIABLE.TEMPORARY_VALUE, purchaseItem.price);

  const ownedLabel = $gameParty.hasItem(purchaseItem, true)
    ? colorTaggedText(3, `所持済み`)
    : `　`;
  const itemLabel = `\\$` + `\x1bI[${purchaseItem.iconIndex}]` + colorTaggedText(16, purchaseItem.name);
  const priceText = colorTaggedText(2, `${purchaseItem.price}\\G`);
  $gameVariables.setValue(ITEM_SHOP_VARIABLE.TEMPORARY_TEXT,
    `${itemLabel} 価格:${priceText} ${ownedLabel}` + '\n' + purchaseItem.description);
  return passiveStateId;
}

// Shows the <ItemPicture:x,y> portrait and returns the y offset.
function showOneOffBuyItemPicture(purchaseItem, passiveStateId) {
  const itemPictureValue = purchaseItem.meta['ItemPicture'];
  if (!itemPictureValue) return undefined;

  const itemPictureValues = itemPictureValue.split(',');
  const pictureYOffset = Number(itemPictureValues[1]);
  const pictureY = 384 + pictureYOffset;

  if (purchaseItem.iconIndex == ONE_OFF_BUY_SUMMON_ICON_INDEX) {
    const summonPath = `/img/sv_enemies/Summon_${itemPictureValues[0]}`;
    $gameScreen.showPicture(ONE_OFF_BUY_PICTURE_ID, summonPath, 1, 640, pictureY, 100, 100, 255, 0);
    picture_fade1(ONE_OFF_BUY_PICTURE_ID, "fadeIn", '162', 60, 5);
    valueTachieBless = [100, 100, 250, 0.004, 0.003];// portrait breathing setup, base state
    tachie_bless(ONE_OFF_BUY_PICTURE_ID, 0);
    element_particleSet(2, ONE_OFF_BUY_PICTURE_ID, passiveStateId, pictureYOffset);
    return pictureYOffset;
  }

  $gameScreen.showPicture(ONE_OFF_BUY_PICTURE_ID, itemPictureValues[0], 1, 640, pictureY, 100, 100, 255, 0);
  picture_fade1(ONE_OFF_BUY_PICTURE_ID, "157", '162', 60, 5);
  return pictureYOffset;
}

// Animation used when a weapon or armor carries trait 43.
function playOneOffBuyWeaponAnimation(purchaseItem, databaseTypeId, pictureYOffset) {
  if (databaseTypeId != ITEM_SHOP_DB_WEAPON && databaseTypeId != ITEM_SHOP_DB_ARMOR) return;
  if (!purchaseItem.traits[0] || purchaseItem.traits[0].code != 43) return;

  const animationId = $dataSkills[purchaseItem.traits[0].dataId].animationId;
  $gameScreen.startAnimation(640, 368 + pictureYOffset, animationId, false);
}

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------
// databaseTypeId 1 is treated as a skill, as in the original.
gain_itemGainExp1 = function(unusedArg1,actor,itemId,databaseTypeId){

  const gainExpSource = (databaseTypeId == ITEM_SHOP_DB_ITEM) ? $dataItems[itemId] : $dataSkills[itemId];
  if (!gainExpSource) return;

  const gainExpAmount = gainExpSource.meta['gainExp'] ? Number(gainExpSource.meta['gainExp']) : 100;
  actor.changeExp(actor.currentExp() + gainExpAmount, false);
  if (actor.subclass()) actor.gainExpSubclass(gainExpAmount);
  // NOTE: the original built an unused gainExpMessage string; it was removed.
};

// ---------------------------------------------------------------------------
// Stealing
// ---------------------------------------------------------------------------
const STEAL_BASE_SKILL_ID = 1;// mastery of stealing
const STEAL_WITNESS_RATE_STEP = 10;
const STEAL_DEFAULT_BOUNTY_CASH_RATE = 1000;

// Stealing, steal_direction1(0,51,1)
steal_direction1 = function(databaseTypeId,dbEntryId,stealCount){

  const actor = $gameActors.actor($gameVariables.value(ITEM_SHOP_VARIABLE.TRUE_PROTAGONIST_ACTOR_ID));
  if (!actor) return;

  const stealSuccessFlag = scanForStealWitness(actor);

  const entries = itemShopDatabase(databaseTypeId);
  if (!entries) return;
  valueItems = entries;

  const stolenItem = entries[dbEntryId];
  const stolenItemLabel = `\x1bI[${stolenItem.iconIndex}]${stolenItem.name}`;
  const stealCountText = colorTaggedText(2, `${stealCount}個`);
  const stealMessage = `${stolenItemLabel}を${stealCountText}盗んだ！`;
  CommonPopupManager.showInfo({}, stealMessage, null);
  $gameParty.gainItem(stolenItem, stealCount);

  if (stealSuccessFlag < 1) return;
  reportStealBounty(stolenItem);
};

// Checks whether nearby NPCs witness the theft and shows one balloon per witness.
function scanForStealWitness(actor) {
  const player = $gamePlayer;
  // Knowing skill 1 (mastery of stealing) narrows the search radius.
  const searchRadius = actor.isLearnedSkill(STEAL_BASE_SKILL_ID) ? 3 : 5;
  let stealSuccessFlag = 0;

  for (let scanY = player.y - searchRadius; scanY <= player.y + searchRadius; scanY++) {
    for (let scanX = player.x - searchRadius; scanX <= player.x + searchRadius; scanX++) {
      const foundEventId = $gameMap.eventIdXy(scanX, scanY);
      if (foundEventId < 1) continue;

      const foundEvent = $gameMap.event(foundEventId);
      if (!isWitnessCandidate(foundEvent, scanX, scanY)) continue;
      if (!isFacingAwayFromPlayer(foundEvent, scanX, scanY)) continue;

      if (rollStealWitness(actor)) {
        foundEvent.requestBalloon(1);
        stealSuccessFlag = 1;
        break;
      }
      foundEvent.requestBalloon(2);// balloon
    }
  }
  return stealSuccessFlag;
}

// Only opaque NPCs can witness the theft.
// The scan origin is unused; it is kept so the helper keeps its original signature.
function isWitnessCandidate(targetEvent, scanX, scanY) {
  const eventMeta = targetEvent.event().meta || {};
  if (!eventMeta['NPC']) return false;
  return targetEvent.opacity() >= 100;
}

// Whether the event faces away from the player.
function isFacingAwayFromPlayer(targetEvent, scanX, scanY) {
  const player = $gamePlayer;
  const eventDirection = targetEvent.direction();
  return (scanY <= player.y - 1 && eventDirection == 2)
    || (scanY >= player.y + 1 && eventDirection == 8)
    || (scanX <= player.x - 1 && eventDirection == 6)
    || (scanX >= player.x + 1 && eventDirection == 4);
}

// Witness roll: mastery of skill 1 times ten percent.
function rollStealWitness(actor) {
  const witnessRandom = getRandomIndex(101);
  // Without the skill the threshold stays 0, so only a roll of 0 witnesses the theft.
  const witnessThreshold = actor.isLearnedSkill(STEAL_BASE_SKILL_ID)
    ? actor.skillMasteryLevel(STEAL_BASE_SKILL_ID) * STEAL_WITNESS_RATE_STEP
    : 0;
  if (witnessThreshold < 1) return witnessThreshold >= witnessRandom;

  CommonPopupManager.showInfo({}, `目撃確率:${witnessThreshold} >=- ${witnessRandom}`, null);
  return witnessThreshold >= witnessRandom;
}

// Bounty increase and display when the theft was witnessed.
// Bounty line shown to the player when the theft was witnessed.
function buildStealBountyMessage(bountyPrice, bountyCashRate, bountyTotal) {
  const bountyAmountText = colorTaggedText(10, `+${bountyPrice + bountyCashRate}(${bountyTotal})\\G`);
  const karmaAmountText = colorTaggedText(10, `+1(\\V[231])`);
  return `盗みを目撃された！　<賞金額:${bountyAmountText} カルマ値:${karmaAmountText}>`;
}

// Adds the bounty of a witnessed theft to the weapon it is bound to.
function reportStealBounty(stolenItem) {
  const stolenItemMeta = stolenItem.meta;
  const bountyPriceNote = stolenItemMeta['Buy Price'];
  const bountyPrice = bountyPriceNote ? Number(bountyPriceNote) : stolenItem.price;
  const bountyWeaponId = $gameVariables.value(ITEM_SHOP_VARIABLE.WEAPON_ID);
  const bountyWeapon = $dataWeapons[bountyWeaponId];
  const bountyWeaponMeta = bountyWeapon ? bountyWeapon.meta : {};
  const bountyCashRateNote = bountyWeaponMeta['bountyCashRate'];
  const bountyCashRate = bountyCashRateNote
    ? Number(bountyCashRateNote)
    : STEAL_DEFAULT_BOUNTY_CASH_RATE;

  const bountyTotals = $gameVariables.value(ITEM_SHOP_VARIABLE.BOUNTY_TOTALS);
  bountyTotals[bountyWeaponId] += bountyPrice + bountyCashRate;
  const bountyTotal = bountyTotals[bountyWeaponId];

  const bountyPaidCount = $gameVariables.value(ITEM_SHOP_VARIABLE.BOUNTY_PAID_COUNT);
  $gameVariables.setValue(ITEM_SHOP_VARIABLE.BOUNTY_PAID_COUNT, bountyPaidCount + 1);

  CommonPopupManager.showInfo({}, buildStealBountyMessage(bountyPrice, bountyCashRate, bountyTotal), null);
}

//}());
