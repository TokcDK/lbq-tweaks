/*:
 * @plugindesc このゲーム専用プラグイン
 * @author 作者名
 * @help ゲーム専用に作成された初期読み込み用プラグイン
 */

//(function(){

// ---------------------------------------------------------------------------
// Lookup tables and small helpers
//
// Most of what follows used to be a chain of `if (x == n) { ... }` branches —
// up to twelve of them per chain, and several chains appeared two or three
// times with identical bodies. Every chain is the same shape: an id mapped to
// an icon, a label, or a percentage. Written as data it is one line, and the
// id ranges become visible instead of being implied by thirty near-identical
// lines.
//
// Only pure literals live at this level. Anything that reads a $data* global
// has to be resolved inside a function: this plugin file is evaluated by
// PluginManager, which runs before DataManager.loadDatabase() fills those
// globals, so a top-level table would capture undefined.
// ---------------------------------------------------------------------------


// databaseTypeId -> the database to rewrite. Resolved per call for the reason
// above. An unknown id keeps the previous selection, as the original did.
descriptionDatabase = function (databaseTypeId) {
  return [$dataItems, $dataWeapons, $dataArmors, $dataSkills, $dataStates, $dataClasses][databaseTypeId];
};

// RM core skill `scope` id -> target label.
const SCOPE_LABELS = [``, `敵単体`, `敵全体`, `敵R1`, `敵R2`, `敵R3`, `敵R4`, `味方単体`, `味方全体`, `戦闘不能単体`, `戦闘不能全体`, `使用者`];

// Skill / item `occasion` id -> "where it can be used" icon pair.
const OCCASION_ICONS = [`\\I[661]\\I[660]`, `\\I[661]`, `\\I[660]`, `\\I[16]`];

// States 206..217 are drawn from the battle-state icon sheet rather than from
// their own iconIndex. The range is contiguous and three separate blocks used
// to spell it out branch by branch, so one array indexed by `stateId - 206`
// replaces all of them.
const BATTLE_STATE_ICON_FIRST_ID = 206;
const BATTLE_STATE_ICONS = [`\\I[322]`, `\\I[323]`, `\\I[324]`, `\\I[325]`, `\\I[326]`, `\\I[327]`,
  `\\I[338]`, `\\I[339]`, `\\I[340]`, `\\I[341]`, `\\I[342]`, `\\I[343]`];

// Trait code 22 (xparam) / 23 (sparam) dataId -> [grantIcon, upIcon, downIcon].
const XPARAM_ICONS = {
  0: [630, 630, 646], 1: [632, 632, 648], 2: [631, 631, 647],
  7: [640, 640, 643], 8: [641, 641, 644], 9: [642, 642, 645]
};
const SPARAM_ICONS = {
  0: [649, 649, 649], 4: [634, 634, 650], 5: [635, 635, 651],
  6: [654, 638, 654], 7: [655, 639, 655], 9: [656, 656, 672]
};
const PARAM_ICON_DEFAULT = [16, 16, 16];
// For these sparam ids a value below 1 is the good direction, so the up/down
// icons are swapped relative to every other entry.
const SPARAM_ICONS_NEGATIVE_IS_GOOD = [6, 7];

// `<additionalSetN>` target index 1-4 -> the "to whom" prefix label.
const ADDITIONAL_SET_TARGET_LABELS = [``, `使用者に`, `味方全体に`, `対象敵に`, `敵全体に`];

// `<Skill Tier N Slots>` -> the label shown for slot N.
const SKILL_TIER_SLOT_LABELS = [``, `Ability装着数`, `Main装着数`, `Job装着数`,
  `G-Passive装着数`, `Passive装着数`, `H-Passive装着数`];

// `<titleGetAchievement>` counter id -> counter name.
const ACHIEVEMENT_NAMES = [``, `TotalKill`, `MaxAssalt`, `TotalAssalt`, `TotalOverKill`, `MaxDamage`,
  `TotalDamage`, `Defead`, `AttackCount`, `S-AbilityCount`, `A-AbilityCount`,
  `W-AbilityCount`, `R-AbilityCount`, `BurstCount`, `ChainCount`,
  `TotalDefead`, `CriticalCount`];

// Class iconIndex -> the name of the growth-stat table that class uses. Stored
// as a name rather than as the array itself because the stat tables are set up
// by amyGameSettei.js and must be read at call time.
const CLASS_GROWTH_STAT_NAMES = {
  353: `valueActor1Statas`, 354: `valueActor2Statas`, 355: `valueActor3Statas`,
  356: `valueActor4Statas`, 357: `valueActor5Statas`,
  97: `valueFighterStatas`, 107: `valueNightStatas`, 108: `valuePriestStatas`,
  101: `valueMagicianStatas`, 115: `valueThiefStatas`, 96: `valueEnhancerStatas`,
  106: `valueGrapplerStatas`, 120: `valueSamuraiStatas`, 102: `valueRangerStatas`,
  199: `valueHarpistStatas`, 99: `valueDestroyerStatas`, 554: `valueSlaveStatas`
};

// Class rank 1..4 -> Roman numeral.
const CLASS_RANK_NUMERALS = [``, `Ⅰ`, `Ⅱ`, `Ⅲ`, `Ⅳ`];

// Parameter order used by the class description and the class comparison list.
const GROWTH_STAT_LABELS = [`Mhp`, `Mmp`, `Atk`, `Def`, `Mag`, `Dex`, `Agi`, `Luk`];

// `<RaceDropRarity>` -> drop-range note. Ids 1..5 are commented out in the
// original, so they are simply absent; 9 and 10 deliberately share a message.
const RACE_DROP_RARITY_TEXT = {
  6: `[種族エネミーLv20からドロップ]`, 7: `[種族エネミーLv30からドロップ]`,
  8: `[種族エネミーLv40からドロップ]`, 9: `[種族エネミーLv50からドロップ]`,
  10: `[種族エネミーLv50からドロップ]`
};

// `<additionalSet<N>>` third field: the state ids that are not plain state ids.
const ADDITIONAL_SET_EXTRA_ICONS = { 201: `\\I[658]` };
// ...and the "*N" suffixes that mean "this many stacks".
const ADDITIONAL_SET_STACK_SUFFIX = { 293: `*10`, 294: `*20`, 295: `*30` };

// `<Category>` -> the id of the state whose help text is appended.
const CATEGORY_HELP_STATE_IDS = {
  ' StateabNomal': 15, ' StateSPabNomal': 30,
  ' StateUnique': 40, ' InvalidDispel': 201, ' PowerUp': 202
};

// Quest objective meta key -> the label printed for it.
const QUEST_OBJECTIVE_LABELS = [
  [`QuestCompSubjugation1`, `討伐依頼`],
  [`QuestCompcollect1`, `収集依頼`],
  [`QuestCompDelivery1`, `納品依頼`],
  [`QuestCompVal1`, `指定値達成依頼`],
  [`QuestCompArray1`, `指定値達成依頼`],
  [`QuestCompSkill1`, `指定スキル獲得依頼`],
  [`QuestCompSkillRank1`, `指定スキルランク到達依頼`],
  [`QuestCompSkillSwi`, `指定目的達成依頼`]
];

// The two "is this element a special-attack element" id sets. They were inlined
// as `.some(function(id){return id == x})` closures, four times for the resist
// set alone.
const SPECIAL_ATTACK_ELEMENT_IDS = [18, 19, 51, 52, 53, 54, 55, 56, 57, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
  71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 82, 83];
const ATTACK_AMPLIFY_ELEMENT_IDS = [18, 19, 51, 52, 53, 54, 55, 56, 57, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
  71, 72, 73, 74, 75, 76, 77, 78, 79, 80];
//const RESIST_SPECIAL_ELEMENT_IDS = [10, 11, 12, 15, 20, 38, 39, 40, 41];// declared in amygameBattle.js
const RESIST_EXCLUDED_ELEMENT_IDS = [35, 37, 38, 41];

// Skill type ids that are cast in battle. Two slightly different sets are in
// use — the scope line also covers type 2 — so both are named rather than left
// as two similar-looking array literals in the middle of the code.
const BATTLE_SKILL_TYPE_IDS = [1, 4, 5, 6, 7, 8, 11, 12, 14];
const BATTLE_SKILL_TYPE_IDS_WITH_SCOPE = [1, 2, 4, 5, 6, 7, 8, 11, 12, 14];
// Skill types that take a turn to resolve.
const TURN_ACTION_SKILL_TYPE_IDS = [4, 5, 6, 7, 8];
// Skill types that get the "auto" and "equipped" header flags.
const EQUIPPED_SKILL_TYPE_IDS = [9, 10, 15];
// Weapon type id 12 marks the Burst skill type.
const BURST_SKILL_TYPE_ID = 12;

// ---------------------------------------------------------------------------
// Translatable labels
//
// A `` marker means the literal's *value* is human-readable text that
// has to reach a translator. Everything around it — `\C[n]`, `\I[n]`, the
// `\x1b*` name codes, wrapper brackets, and pure-ASCII tokens such as `Rank:`,
// `TP`, `%` — stays in the template literal. The string a translator edits then
// reads as a word or a short phrase instead of mostly control-code noise, and
// the codes cannot be mangled by the translation pass.
//
// Only labels shared by more than one site live here; a label used once is a
// local `const` immediately above the statement that consumes it.
// ---------------------------------------------------------------------------
const CONDITION_LABEL = `条件`;
const POWER_LABEL = `威力`;
const DRAIN_LABEL = `与Dの`;
const ABSORB_LABEL = `吸収回復`;
const OR_MORE_SUFFIX = `以上`;
const TIMES_SUFFIX = `倍`;
const SUITABLE_LV_LABEL = `適正Lv`;
const TP_LABEL = `TP`;
const RANK_LABEL = `Rank`;
// Entry 18 of the damage-formula table is the only entry carrying text; the
// `GunDamage` tag further down the item section reuses the same word.
const FIXED_VALUE_TEXT = `固定値`;

// `DamageFormula2` first field -> the blurb shown for it. Every entry is the
// body of `[\C[${colorCode}]…\C[0]`. Ids 8, 9 and 10 are built from the
// remaining fields and are handled before this table is consulted; id 31 has
// no blurb at all (see the note at the lookup site).
const DAMAGE_FORMULA_TEXT = {
  1: `\\I[34]100%`, 2: `\\I[36]100%`, 3: `\\I[37]100%`, 4: `\\I[39]100%`, 5: `\\I[35]100%`,
  6: `\\I[37]50%\\I[38]50%`, 7: `\\I[34]50%\\I[37]50%`,
  11: `\\I[34]70%\\I[37]20%\\I[38]10%`, 12: `\\I[34]20%\\I[37]40%\\I[38]40%`,
  13: `\\I[34]60%\\I[37]40%`, 14: `\\I[36]100%`,
  15: `\\I[34]40%\\I[37]30%\\I[38]30%`, 16: `\\I[34]80%\\I[37]20%`, 17: `\\I[34]100%`,
  18: `\\I[37]50%+${FIXED_VALUE_TEXT}`, 19: `\\I[34]20%\\I[37]80%`, 20: `\\I[36]50%\\I[37]50%`,
  24: `\\I[37]50%\\I[39]50%`, 25: `\\I[37]50%`,
  28: `\\I[34]100%`, 29: `\\I[34]80%\\I[37]10%\\I[38]10%`, 30: `\\I[34]70%\\I[37]10%\\I[38]20%`
};

// Element id -> the `\I[n]` / literal-label text for it, and the two derived
// forms the trait scan needs. `amygame_elementIcon` already centralises the id
// table; these wrappers stop every call site from repeating the
// `elementIcon[0] >= 1 ? name : icon` test.
elementLabel = function (elementId) {
  const elementIcon = amygame_elementIcon(elementId);
  return elementIcon[0] >= 1 ? `${elementIcon[1]}` : `\x1bI[${elementIcon[1]}]`;
}
elementAmplifyLabel = function (elementId) {
  const elementIcon = amygame_elementIcon(elementId);
  return elementIcon[0] >= 1 ? `${elementIcon[1]}${POWER_LABEL}` : `\x1bI[${elementIcon[2]}]${POWER_LABEL}`;
}
// The `\x1bI[n]` icon used by the element-resist trait (code 11). Takes the
// already-fetched descriptor: `amygame_elementIcon` allocates a fresh array on
// every call, so the trait scan reads it once.
elementResistIcon = function (elementIcon) {
  return `\x1bI[${elementIcon[3]}]`;
}
// State id -> the icon to draw for it, honouring the battle-state sheet range.
stateIconText = function (stateId) {
  const battleIcon = BATTLE_STATE_ICONS[stateId - BATTLE_STATE_ICON_FIRST_ID];
  if (battleIcon) return battleIcon;
  return $dataStates[stateId].iconIndex >= 1
    ? `\x1bI[${$dataStates[stateId].iconIndex}]`
    : `${$dataStates[stateId].name}`;
}
// Same, but for the `<additionalSet>` path, which falls back to `\x1bSIM[n]`
// and appends one `+` per extra stack.
additionalSetStateIcon = function (stateId, stackCount) {
  const battleIcon = BATTLE_STATE_ICONS[stateId - BATTLE_STATE_ICON_FIRST_ID];
  let text = battleIcon ? battleIcon : `\x1bSIM[${stateId}]`;
  if (ADDITIONAL_SET_EXTRA_ICONS[stateId]) text = ADDITIONAL_SET_EXTRA_ICONS[stateId];
  if (ADDITIONAL_SET_STACK_SUFFIX[stateId]) text += ADDITIONAL_SET_STACK_SUFFIX[stateId];
  for (let plusSignCount = 2; plusSignCount <= stackCount; plusSignCount++) {
    text += `+`;
  }
  return text;
}
// The passive-state lists built by amyGameSettei.js hold their ids as strings
// (`pushArray` pushes `metaValue.split(',')`), so the test has to stay loose.
containsState = function (passiveList, stateId) {
  for (let index = 0; index < passiveList.length; index++) {
    if (passiveList[index] == stateId) { return true; };
  };
  return false;
}
// `value1,value2` style meta, split and trimmed. Trimming matters: the notes in
// this project are hand-written and carry stray spaces after the commas.
splitMetaValues = function (metaValue) {
  return String(metaValue).split(',').map(function (part) { return part.trim(); });
}
// Growth-stat row for a class, e.g. `\C[16]Mhp\C[10]120\C[0],…`. Built once and
// reused: the original pasted this 8-stat expression into two long templates.
growthStatText = function (growthStats, rankValue) {
  return GROWTH_STAT_LABELS.map(function (label, index) {
    return `\\C[16]${label}\\C[10]${Number(growthStats[index]) * rankValue}\\C[0]`;
  }).join(',');
}
// The "all stats up" note. `traitValue` is the RM multiplier, so 1 is neutral
// and above/below 1 selects the up or down icon. `isUniform` is true when every
// stat in the run carried the same multiplier, in which case the percentage is
// dropped (showing "×2" once is clearer than eight identical percentages).
allStatUpText = function (traitValue, upIcon, downIcon, isUniform) {
  const icon = traitValue >= 1 ? upIcon : downIcon;
  const percent = Math.round(Math.abs(traitValue - 1) * 100);
  return isUniform ? `${icon} ` : `${icon}${percent}% `;
}
// `[\C[3]\I[n]:value%up\C[0]]` — the row shared by skill effect codes 11 (HP),
// 12 (MP) and 13 (TP). The colour is 3 for a positive value and 4 for a
// negative one; `unit` is `%` for the percentage field and empty for the flat
// `value2` field; `direction` is `up`/`down` for TP and empty for HP/MP.
// The icon table is a module-scope constant: it was previously rebuilt inside
// the per-entry loop, which allocated the same object once per database entry.
const RECOVERY_EFFECT_ICONS = { 11: 627, 12: 628, 13: 629 };
recoveryEffectText = function (iconId, value, unit, direction) {
  return `[\\C[${value >= 1 ? 3 : 4}]\\I[${iconId}]:${value}${unit}${direction}\\C[0]]`;
}
// `<HP|MP Life Steal Physical|Magical>`: four near-identical blocks. The value
// comes from the physical tag when both are present, and the prefix names
// whichever tags are in play. `lossSuffix` differs between HP (反動ﾀﾞﾒｰｼﾞ) and
// MP (消耗); a value below 1 means the skill costs rather than drains.
lifeStealText = function (prefix, rawValue, resource, lossSuffix) {
  const value = Number(String(rawValue).replace(' ', '').replace('%', ''));
  const isGain = value >= 1;
  return `[\\C[${isGain ? 2 : 10}]${prefix}${DRAIN_LABEL}${value}%${resource}${isGain ? ABSORB_LABEL : lossSuffix}\\C[0]]`;
}
lifeStealGroupText = function (meta, resource, lossSuffix) {
  const physical = meta[resource + ' Life Steal Physical'];
  const magical = meta[resource + ' Life Steal Magical'];
  if (physical && magical) {
    return lifeStealText(`物理/魔法`, physical, resource, lossSuffix);
  };
  let text = ``;
  if (physical) { text += lifeStealText(`物理`, physical, resource, lossSuffix); };
  if (magical) { text += lifeStealText(`魔法`, magical, resource, lossSuffix); };
  return text;
}
// `<titleEffectN>` / `<eatEffectN>` share one body. `metaValues[0]` selects
// which stat table supplies the name: 0 param, 1 xparam, 2 sparam, 3 element
// (with 特攻 inserted for the amplify set). Case 4 is handled by the caller
// because it writes to the output as well.
// A `switch` rather than four `if`s: every arm returns, and `sourceIndex` is
// already a number, so `switch`'s `===` is the same test the `==` chain made —
// with one jump instead of up to four comparisons.
statEffectName = function (metaValues) {
  const sourceIndex = Number(metaValues[0]);
  const statIndex = Number(metaValues[1]);
  switch (sourceIndex) {
    case 0: return TextManager.param(statIndex);
    case 1: return FTKR.CSS.cssStatus.xparam[statIndex];
    case 2: return FTKR.CSS.cssStatus.sparam[statIndex];
    case 3:
      const specialAttackLabel = `特攻`;
      return `${$dataSystem.elements[statIndex]}`
        + (ATTACK_AMPLIFY_ELEMENT_IDS.indexOf(statIndex) >= 0 ? specialAttackLabel : ``) + POWER_LABEL;
    default: return undefined;
  };
}
// amyGameSettei.js sets the growth-stat tables up as bare top-level variables,
// i.e. as properties of the global object. `globalThis` does not exist in MV's
// NW.js build, so reach the global object the old way. The tables have to be
// read at call time: this file is evaluated before that one.
const GAME_GLOBALS = (function () { return this; })();
classGrowthStats = function (classIconIndex) {
  const tableName = CLASS_GROWTH_STAT_NAMES[Number(classIconIndex)];
  return (tableName && GAME_GLOBALS[tableName]) || valuePeplesStatas;
}
// The class comparison list pads every name out to six display cells. The
// original spelled that out as five branches, one per source length.
const CLASS_NAME_WIDTH = 6;
classComparisonName = function (className) {
  const paddingLength = className.length >= 1 && className.length < CLASS_NAME_WIDTH
    ? CLASS_NAME_WIDTH - className.length : 0;
  return className + `　`.repeat(paddingLength);
}

//武器防具の説明文に効果に応じた文章追加

// Weapons / armor / states / classes carry generated text; skills and items too.
// `databaseTypeId` selects the database (see descriptionDatabase).
const DESCRIPTION_DATABASE_ITEM = 0;
const DESCRIPTION_DATABASE_WEAPON = 1;
const DESCRIPTION_DATABASE_ARMOR = 2;
const DESCRIPTION_DATABASE_SKILL = 3;
const DESCRIPTION_DATABASE_STATE = 4;
const DESCRIPTION_DATABASE_CLASS = 5;

// The original repeated these two type tests in front of several sections; they are
// predicates now so every guard reads the same way.
const TRAIT_DATABASE_TYPES = [
  DESCRIPTION_DATABASE_WEAPON, DESCRIPTION_DATABASE_ARMOR,
  DESCRIPTION_DATABASE_STATE, DESCRIPTION_DATABASE_CLASS
];

function isTraitDatabaseType(databaseTypeId) {
  return TRAIT_DATABASE_TYPES.indexOf(databaseTypeId) >= 0;
}

function isItemOrSkillDatabaseType(databaseTypeId) {
  return databaseTypeId == DESCRIPTION_DATABASE_ITEM || databaseTypeId == DESCRIPTION_DATABASE_SKILL;
}

// `<HP Life Steal>` / `<MP Life Steal>`: `与Dの50%HP吸収回復`, one row per resource.
const DRAIN_ROWS = [
  { metaKey: 'HP Life Steal', resourceLabel: `HP` },
  { metaKey: 'MP Life Steal', resourceLabel: `MP` }
];

function describeLifeStealRows(ctx) {
  for (const drainRow of DRAIN_ROWS) {
    if (!ctx.meta[drainRow.metaKey]) continue;
    ctx.effectValue = ctx.meta[drainRow.metaKey].replace(' ', '');
    ctx.effectValue = ctx.effectValue.replace('%', '');
    const drainText = `${DRAIN_LABEL}${Number(ctx.effectValue)}%${drainRow.resourceLabel}${ABSORB_LABEL}`;
    ctx.effectText += `[${colorTaggedText(ctx.colorCode, drainText)}]`;
  }
}
const DESCRIPTION_DEFAULT_COLOR_CODE = 2;
// Colour codes that the original switched to and back for a single row; they are
// passed to colorTaggedText now, so `colorCode` no longer has to be mutated.
const LUST_COLOR_CODE = 27;
const SCOPE_COLOR_CODE = 14;
const TURN_ACTION_COLOR_CODE = 13;
const AUTO_EQUIP_LUST_SKILL_TYPE_ID = 15;
// `<titleGetArray>` first field: the only implemented counter.
const SUBJUGATION_CONDITION_ID = 52;
// The H-variable block of the variable list starts 400 entries later.
const H_VARIABLE_OFFSET = 400;

various_description = function (databaseTypeId) {

  Hentai380_ArrangementNameSet();
  valueItems = descriptionDatabase(databaseTypeId) || valueItems;

  const lastEntryId = lastDescriptionEntryId(databaseTypeId);
  // One context per call: the original declared its scratch `var`s inside the
  // function, so `fragText`/`effectValue`/`metaValues` survived from one entry to
  // the next and some rows (see describeDamageFormula) still rely on that.
  const ctx = createDescriptionContext();
  for (let entryIndex = 1; entryIndex <= lastEntryId; entryIndex++) {
    describeDatabaseEntry(ctx, valueItems[entryIndex], databaseTypeId, entryIndex);
  }

};

// Armor is sized by `valueArmorsLength` (the array itself is longer than the
// entries this plugin may touch); every other database runs to its last entry.
function lastDescriptionEntryId(databaseTypeId) {
  return databaseTypeId == DESCRIPTION_DATABASE_ARMOR ? valueArmorsLength : valueItems.length - 1;
}

// Unnamed entries - and weapons without a weapon type - get no generated text.
function isDescriptionSkipped(item, databaseTypeId) {
  if (!item || !item.meta) return true;
  if (item.name == ``) return true;
  return databaseTypeId == DESCRIPTION_DATABASE_WEAPON && item.wtypeId == 0;
}

// Cross-step scratch state. The original kept these in function-scoped `var`s, so a
// later block could still read what an earlier one left behind (the `<titleEffectN>`
// element rows and the `DamageFormula2` id 31 fall-through depend on it). Fields the
// loop re-initialised per entry are reset by beginDescriptionEntry, the rest persist.
function createDescriptionContext() {
  return {
    item: null,
    meta: null,
    databaseTypeId: 0,
    entryIndex: 0,
    effectText: ``,
    headerText: ``,
    suffixText: ``,
    colorCode: DESCRIPTION_DEFAULT_COLOR_CODE,
    statUpCount: 0,
    skillElementText: ``,
    tenWeaponCount: 0,
    damageCutRef: 0,
    damageCutCount: 0,
    damageCutIsFirst: 0,
    prevStateCode: 0,
    consecStateCount: 0,
    calcTmp: 0,
    descWordText: 0,
    additionalSetTextByTarget: [],
    additionalSetCountByTarget: [],
    effectValue: undefined,
    fragText: undefined,
    metaValues: undefined
  };
}

// The per-entry reset the original performed at the top of its loop body.
function beginDescriptionEntry(ctx, item, databaseTypeId, entryIndex) {
  ctx.item = item;
  ctx.meta = item.meta;
  ctx.databaseTypeId = databaseTypeId;
  ctx.entryIndex = entryIndex;
  ctx.effectText = ``;
  ctx.headerText = ``;
  ctx.suffixText = ``;
  ctx.colorCode = DESCRIPTION_DEFAULT_COLOR_CODE;
  ctx.statUpCount = 0;
  ctx.skillElementText = ``;
  ctx.tenWeaponCount = 0;
  ctx.damageCutRef = 0;
  ctx.damageCutCount = 0;
  ctx.damageCutIsFirst = 0;
  ctx.prevStateCode = 0;
  ctx.consecStateCount = 0;
  ctx.calcTmp = 0;
  ctx.descWordText = 0;
  ctx.additionalSetTextByTarget = [];
  ctx.additionalSetCountByTarget = [];
}

function describeDatabaseEntry(ctx, item, databaseTypeId, entryIndex) {
  if (isDescriptionSkipped(item, databaseTypeId)) return;
  beginDescriptionEntry(ctx, item, databaseTypeId, entryIndex);

  describeEntryHeader(ctx);
  describeTenWeaponSummary(ctx);
  describeStatUpSummary(ctx);
  describeDamageCutSummary(ctx);
  describeTraitList(ctx);
  describeLearnPremises(ctx);
  describeDescriptionWord(ctx);
  describeFixedDamageTag(ctx);
  describeItemAndSkillRows(ctx);
  describeClearCountTags(ctx);
  describePassiveTags(ctx);
  describeBattleTags(ctx);
  describeResistTags(ctx);
  describeCapAndCostTags(ctx);
  describeCooldownAndDrainTags(ctx);
  describeTitleConditionTags(ctx);
  describeTitleEffectTags(ctx);
  describeStatEffectSlots(ctx);
  describeBodyChangeTags(ctx);
  describeQuestHeaderTags(ctx);
  describeQuestAndRateTags(ctx);
  describeFinalTags(ctx);

  applyEntryDescription(ctx);
  expandSealedSkillTypes(ctx);
};

// One dispatch per trait instead of nineteen `if (trait.code == n)` tests: every
// describer ignores the codes it does not own, and they run in the original order
// so the generated text keeps its order.
const TRAIT_DESCRIBERS = [
  describeElementAttackTrait,
  describeElementResistTrait,
  describeDebuffResistTrait,
  describeStateResistTrait,
  describeStateNullifyTrait,
  describeStatUpTrait,
  describeXparamTrait,
  describeSparamTrait,
  describeStateAddTrait,
  describeAttackSpeedTrait,
  describeSkillTypeUnlockTrait,
  describeSkillTypeSealTrait,
  describeSkillUnlockTrait,
  describeSkillSealTrait,
  describeWeaponTypeTrait,
  describeArmorTypeTrait,
  describeEquipFixedTrait,
  describeEquipSealedTrait,
  describeActionCountTrait
];

// Everything from <Unequippable> down to the effect rows is item/skill only: the
// original opened one `if(databaseTypeId == 3 || databaseTypeId == 0)` in front of
// it and closed it after the effect rows.
function describeItemAndSkillRows(ctx) {
  if (!isItemOrSkillDatabaseType(ctx.databaseTypeId)) return;
  describeSkillHeaderTags(ctx);
  describeDamageFormula(ctx);
  describePotionRecoveryTag(ctx);
  describeSkillRowTags(ctx);
  describeAdditionalSets(ctx);
  describeEffectRows(ctx);
}

// 武器防具ステートの特徴 (traits)。スキルは effects なので describeEffectRows。
function describeTraitList(ctx) {
  if (!isTraitDatabaseType(ctx.databaseTypeId)) return;

  const traits = ctx.item.traits;
  if (!traits) return;
  for (let traitIndex = 0; traitIndex <= 19; traitIndex++) {
    const trait = traits[traitIndex];
    if (!trait) continue;
    for (const describeTrait of TRAIT_DESCRIBERS) {
      describeTrait(ctx, trait, traitIndex);
    }
  }
}

function describeEntryHeader(ctx) {
  if (ctx.databaseTypeId == 1 || ctx.databaseTypeId == 2) {
    const categoryLabel = `分類`;
    const typeLabel = `種別`;
    ctx.headerText = `[\\C[${ctx.colorCode}]${categoryLabel}\\C[0]:${$dataSystem.equipTypes[ctx.item.etypeId]}]`;
    if (ctx.databaseTypeId == 1 && ctx.item.wtypeId >= 1) {
      var weaponTypeName = $dataSystem.weaponTypes[ctx.item.wtypeId];
      ctx.headerText += `[\\C[${ctx.colorCode}]${typeLabel}\\C[0]:${weaponTypeName}]`
    };
    if (ctx.databaseTypeId == 2 && ctx.item.atypeId >= 1) { ctx.headerText += `[\\C[${ctx.colorCode}]${typeLabel}\\C[0]:${$dataSystem.armorTypes[ctx.item.atypeId]}]` };
    if (ctx.databaseTypeId == 1 || ctx.databaseTypeId == 2) {
      if (ctx.meta['LotteryRearity']) {
        ctx.headerText += `[\\I[517]:${Number(ctx.meta['LotteryRearity'])}]`;
      }
    };
  };
}

function describeTenWeaponSummary(ctx) {
  if (!isTraitDatabaseType(ctx.databaseTypeId)) return;
  //十種武器: ten weapon-type traits on one entry are summarised as "十種武器".
  for (var traitScanIndex = 0; traitScanIndex <= 9; traitScanIndex++) {
    var weaponTrait = ctx.item.traits[traitScanIndex];
    if (weaponTrait && weaponTrait.code == 51) {
      ctx.tenWeaponCount += 1;
    };
  };
  if (ctx.tenWeaponCount >= 10) {
    var colorTaggeredText = colorTaggedText(ctx.colorCode, `武器種:`);
    ctx.effectText += `${colorTaggeredText}十種武器 `;
  };
}

function describeStatUpSummary(ctx) {
  if (!isTraitDatabaseType(ctx.databaseTypeId)) return;
  ctx.effectValue = 0;
  ctx.calcTmp = 0;
  //ステアップALLで纏める: count the stat-up traits and how many of them repeat
  // the same multiplier, so a full set can be collapsed to one icon below.
  for (var traitScanIndex = 0; traitScanIndex <= 7; traitScanIndex++) {
    var statTrait = ctx.item.traits[traitScanIndex];
    if (statTrait && statTrait.code == 21) {
      ctx.statUpCount += 1;
      if (ctx.effectValue == statTrait.value) {
        ctx.effectValue = statTrait.value;
        ctx.calcTmp += 1;
      };
    };
  };
  if (ctx.statUpCount == 5 && ctx.item.traits[4]) {
    ctx.effectText += allStatUpText(ctx.item.traits[4].value, `\\I[658]+`, `\\I[674]-`, ctx.calcTmp >= 2);
  };
  if (ctx.statUpCount == 8) {
    ctx.effectText += allStatUpText(ctx.item.traits[7].value, `\\I[659]+`, `\\I[675]-`, ctx.calcTmp >= 2);
  };

  //物理魔法ダメージカット: count the physical and magical damage-cut traits, but
  // only when they carry the same multiplier (a mismatched pair is shown
}

function describeDamageCutSummary(ctx) {
  if (!isTraitDatabaseType(ctx.databaseTypeId)) return;
  for (var traitScanIndex = 0; traitScanIndex <= 1; traitScanIndex++) {
    var cutTrait = ctx.item.traits[traitScanIndex];
    if (cutTrait && cutTrait.code == 23 && (cutTrait.dataId == 6 || cutTrait.dataId == 7)) {
      if (ctx.damageCutIsFirst == 0) {
        ctx.damageCutRef = cutTrait.value;
      };
      if (ctx.damageCutIsFirst == 0 || ctx.damageCutRef == cutTrait.value) {
        ctx.damageCutCount += 1;
      };
      ctx.damageCutIsFirst += 1;
    };
  };

  if (ctx.damageCutCount == 2) {
    ctx.effectText += allStatUpText(ctx.item.traits[1].value, `\\I[654]\\I[655]-`, `\\I[638]\\I[639]+`, false);
  };
}

function describeLearnPremises(ctx) {
  if (ctx.meta['HSkillLearn']) {
    const premiseTexts = [];
    for (let premiseIndex = 1; premiseIndex <= 3; premiseIndex++) {
      const premiseSkill = ctx.meta['PremiseSkill' + premiseIndex];
      const premiseSkillRank = ctx.meta['PremiseSkillRank' + premiseIndex];
      const premiseVariable = ctx.meta['PremiseVariable' + premiseIndex];
      const premiseArrangement = ctx.meta['PremiseArrangement' + premiseIndex];
      if (premiseSkill) {
        const learnSuffix = `習得`;
        premiseTexts.push(`\\C[27]<${$dataSkills[Number(premiseSkill)].name}>\\C[0]${learnSuffix}`);
      };
      if (premiseSkillRank) {
        const rankValues = splitMetaValues(premiseSkillRank);
        const reachSuffix = `到達`;
        premiseTexts.push(`\\C[27]<${$dataSkills[Number(rankValues[0])].name}>\\C[0]${RANK_LABEL}:\\C[27]${Number(rankValues[1])}\\C[0]${reachSuffix}`);
      };
      if (premiseVariable) {
        const variableValues = splitMetaValues(premiseVariable);
        // The original stripped up to three ideographic spaces, then one space and
        // one colon — five sequential first-occurrence replaces, not a global one.
        const variableName = `${$dataSystem.variables[Number(variableValues[0])]}`
          .replace("　", "").replace("　", "").replace("　", "").replace(" ", "").replace(":", "");
        premiseTexts.push(`\\C[27]${variableName}\\C[0]:\\C[27]${Number(variableValues[1])}\\C[0]${OR_MORE_SUFFIX}`);
      };
      if (premiseArrangement) {
        const arrangementValues = splitMetaValues(premiseArrangement);
        premiseTexts.push(`\\C[27]${valueHentaiArrangement[Number(arrangementValues[0])]}\\C[0]:\\C[27]${Number(arrangementValues[1])}\\C[0]${OR_MORE_SUFFIX}`);
      };
    };
    const noneLabel = `なし`;
    var coloredNoneLabel = `\\C[27]${noneLabel}\\C[0]`;
    var premiseTextMerged = premiseTexts.join(``);
    ctx.effectText += `[${CONDITION_LABEL}:${premiseTexts.length ? premiseTextMerged : coloredNoneLabel}]`;
  };
}

function describeDescriptionWord(ctx) {
  if (ctx.meta['DescriptionWord']) {
    ctx.fragText = `${ctx.meta['DescriptionWord']}`;
    if (ctx.databaseTypeId == 3 && ctx.item.stypeId == 15) {
      ctx.descWordText = `\\C[27][${ctx.fragText}]\\C[0] `;
    } else {
      ctx.descWordText = `\\C[${ctx.colorCode}][${ctx.fragText}]\\C[0] `;
    };
  };//一言が必要なもののみ
}

function describeFixedDamageTag(ctx) {
  if (ctx.meta['GunDamage']) {
    ctx.effectValue = ctx.meta['GunDamage'];
    ctx.effectText += `[${FIXED_VALUE_TEXT}:${ctx.effectValue}] `;
  };//銃武器の固定値
}

function describeSkillHeaderTags(ctx) {
  appendAutoEquipBadge(ctx);
  appendSkillTierBadge(ctx);

  // `occasion` -> the "where can this be used" icon. Items always show it; skills
  // only for battle skill types.
  const showsOccasion = ctx.databaseTypeId == DESCRIPTION_DATABASE_ITEM
    || (ctx.databaseTypeId == DESCRIPTION_DATABASE_SKILL && BATTLE_SKILL_TYPE_IDS.indexOf(ctx.item.stypeId) >= 0);
  if (showsOccasion && (!ctx.item.occasion || !ctx.meta['BattleMapInformation'])) {
    ctx.fragText = OCCASION_ICONS[ctx.item.occasion] || OCCASION_ICONS[0];
    ctx.headerText += colorTaggedText(ctx.colorCode, ctx.fragText);
  }
  if (ctx.meta['SaveShare']) ctx.headerText += `\\I[15]`;
  if (ctx.meta['MCharacterLearn']) ctx.headerText += `\\I[14]`;

  appendTurnActionBadge(ctx);
  appendScopeLabel(ctx);
  appendMultipleElements(ctx);

  // `<Custom Cooldown Mastery Formula>`, `<Custom MP Cost Mastery Formula>` and
  // `<Mastery Effect>` have no description text (the original had an empty block
  // with two commented-out lines here).
  if (ctx.meta['Select Conditions']) {
    const frontGuardOnlyText = `対象前衛のみ`;
    ctx.headerText += `[${colorTaggedText(ctx.colorCode, frontGuardOnlyText)}] `;
  }
  appendSkillLearningClassTag(ctx);
  appendLimitUsesTag(ctx);
  if (ctx.databaseTypeId == DESCRIPTION_DATABASE_ITEM && ctx.meta['SeiyokuItem']) {
    const lustItemText = `性欲品`;
    ctx.effectText += `[${colorTaggedText(LUST_COLOR_CODE, lustItemText)}] `;
  }
}

// `<Unequippable>` on an equippable skill type: the `<自動>` badge in the header.
function appendAutoEquipBadge(ctx) {
  if (!ctx.meta['Unequippable']) return;
  if (EQUIPPED_SKILL_TYPE_IDS.indexOf(ctx.item.stypeId) < 0) return;
  ctx.fragText = `<自動>`;
  const autoEquipColorCode = ctx.item.stypeId == AUTO_EQUIP_LUST_SKILL_TYPE_ID ? LUST_COLOR_CODE : ctx.colorCode;
  ctx.headerText += colorTaggedText(autoEquipColorCode, ctx.fragText);
}

// `<Skill Tier>`: equipped enchant tier, i.e. an icon plus its tier name.
function appendSkillTierBadge(ctx) {
  if (!ctx.meta['Skill Tier']) return;
  ctx.effectValue = Number(ctx.meta['Skill Tier'].replace(' ', ''));
  if (ctx.effectValue >= 1) {
    const tierIcon = `\x1bI[${Yanfly.Icon.ESTier[ctx.effectValue]}]`;
    ctx.effectValue = `${tierIcon}${Yanfly.Param.ESTierName[ctx.effectValue]}>`;
  }
  ctx.fragText = `<装着:${ctx.effectValue}`;
  const equipColorCode = ctx.item.stypeId == AUTO_EQUIP_LUST_SKILL_TYPE_ID ? LUST_COLOR_CODE : ctx.colorCode;
  ctx.headerText += `${colorTaggedText(equipColorCode, ctx.fragText)} `;
}

// `<scope>` for the skill types that announce their target.
function appendScopeLabel(ctx) {
  if (ctx.item.scope < 1) return;
  if (BATTLE_SKILL_TYPE_IDS_WITH_SCOPE.indexOf(ctx.item.stypeId) < 0) return;
  ctx.fragText = SCOPE_LABELS[ctx.item.scope];
  const scopeLabelText = `<${ctx.fragText}>`;
  ctx.headerText += `${colorTaggedText(SCOPE_COLOR_CODE, scopeLabelText)} `;
}

function appendTurnActionBadge(ctx) {
  if (ctx.databaseTypeId != DESCRIPTION_DATABASE_SKILL) return;
  if (TURN_ACTION_SKILL_TYPE_IDS.indexOf(ctx.item.stypeId) < 0) return;
  if (ctx.meta['Instant']) return;
  const turnActionText = `ターン行動`;
  ctx.headerText += `${colorTaggedText(TURN_ACTION_COLOR_CODE, `<${turnActionText}>`)} `;
}

// `<Multiple Elements>`: one element label per id, kept in `skillElementText` so
// later rows can reuse the list.
function appendMultipleElements(ctx) {
  if (!ctx.meta['Multiple Elements']) return;
  const elementIds = splitMetaValues(ctx.meta['Multiple Elements']);
  for (const elementId of elementIds) {
    ctx.skillElementText += colorTaggedText(ctx.colorCode, elementLabel(elementId));
  }
  const elementListLabel = `属性:`;
  ctx.headerText += `[${elementListLabel}${ctx.skillElementText}] `;
}

// `<SkillLearningClass>`: which class learns the skill (a name code, i.e. other
// game text, so it stays outside the translatable string).
function appendSkillLearningClassTag(ctx) {
  if (!ctx.meta['SkillLearningClass']) return;
  ctx.effectValue = `${$dataSystem.skillTypes[ctx.item.stypeId]}`;
  ctx.fragText = Number(ctx.meta['SkillLearningClass']);
  if (ctx.fragText == 100) return;
  const learnNameCode = `\x1bJ[${ctx.fragText}]`;//名前コード。翻訳対象外
  const learnText = `習得`;
  ctx.effectText += `[${colorTaggedText(ctx.colorCode, ctx.effectValue)}] [${colorTaggedText(ctx.colorCode, learnNameCode)}${learnText}] `;
}

// `<Limit Uses>`: per day, or per battle when `<Not Recover All Uses>` is set.
function appendLimitUsesTag(ctx) {
  if (!ctx.meta['Limit Uses']) return;
  ctx.fragText = Number(ctx.meta['Limit Uses']);
  const usesText = ctx.meta['Not Recover All Uses'] // <After Battle Uses Recover: 0> もセット
    ? `1日${ctx.fragText}回`
    : `戦闘中${ctx.fragText}回`;
  ctx.headerText += `[${colorTaggedText(ctx.colorCode, usesText)}] `;
}

function describeDamageFormula(ctx) {
  ctx.colorCode = 2;
  if (ctx.meta['DamageFormula2']) {
    ctx.metaValues = splitMetaValues(ctx.meta['DamageFormula2']);
    var formulaId = Number(ctx.metaValues[0]);
    // 8, 9, 10 and 31 are the ids that are not a fixed blurb, so they are taken
    // first and the table covers the remaining twenty-three.
    if (formulaId == 8) { ctx.fragText = recoveryEffectMsg(36, 36); };
    if (formulaId == 9) { ctx.fragText = recoveryEffectMsg(34, 35); };
    if (formulaId == 10) {
      var absorbNum = ctx.metaValues[1]; var dmgNum = ctx.metaValues[2];
      var msg = `現在HPの${absorbNum}%消費して×${dmgNum}倍の与ダメ`;
      ctx.fragText = `[\\C[${ctx.colorCode}]${msg}\\C[0]`;
    };
    // Id 31 (skill 373 \"ルビフリップ\") has no blurb, so no branch assigns here and
    // `fragText` still holds whatever an earlier row of this run left behind — the
    // original behaves the same way, and the note it produces is kept as is. The
    // guard only makes sure an id that is not in the table cannot assign a value.
    if (DAMAGE_FORMULA_TEXT[formulaId]) {
      ctx.fragText = `[\\C[${ctx.colorCode}]${DAMAGE_FORMULA_TEXT[formulaId]}\\C[0]`;
    };
    if (ctx.fragText) {
      if (ctx.metaValues[2] >= 0) { ctx.fragText += ` \\C[${ctx.colorCode}]×${ctx.metaValues[2]}\\C[0]] ` };
      if (ctx.metaValues[1] >= 1) { ctx.fragText += `\\I[666]:${ctx.metaValues[1]}` };
      if (ctx.databaseTypeId == 3) {
        if (ctx.item.stypeId == 12) {
          if (ctx.meta['ユニーク']) {//武器を特定できないため無効状態
            ctx.fragText += `+強化段階`;
          } else {
            ctx.fragText += `+装備レア度`;
          };
        };
      };
      ctx.suffixText += `${ctx.fragText} `;//元文章の後に追記される。
    };
    if (ctx.meta['LevelFluctuation']) {
      var levelFluctuation = ctx.meta['LevelFluctuation'];
      ctx.suffixText += `[${levelFluctuation}ﾚﾍﾞﾙ毎に威力+]`;
    };
  };
}

// `<PotionUsePoint>`: the restored resource comes from the damage element of the
// item, so one table replaces the two equality checks.
const POTION_RECOVERY_RESOURCES = { 3: `HP`, 4: `MP` };//HP回復 / MP回復

function describePotionRecoveryTag(ctx) {
  const damageType = ctx.item.damage ? ctx.item.damage.type : 0;
  if (damageType < 1) return;
  if (!ctx.meta['PotionUsePoint']) return;

  // A damage type that is not a healing element used to print whatever resource
  // name the previous entry had left in `fragText`.
  ctx.fragText = POTION_RECOVERY_RESOURCES[damageType];
  if (!ctx.fragText) return;
  // Anything below 2 means "all of it".
  const usePoint = Number(ctx.meta['PotionUsePoint']);
  ctx.effectValue = usePoint >= 2 ? usePoint : `全`;
  const recoveryText = `回復`;
  // No colorTaggedText here: the colour of the resource name has to run into the
  // `\\C[3]` amount, so the two codes are not a complete wrap.
  ctx.effectText += `[\\C[${ctx.colorCode}]${ctx.fragText}\\C[3]${ctx.effectValue}\\C[0]${recoveryText}]`;
}

function describeSkillRowTags(ctx) {
  if (ctx.meta['SkillStateAddRemove']) {
    ctx.fragText = Number(ctx.meta['SkillStateAddRemove']);
    const stateNameCode = `\x1bSIM[${ctx.fragText}]`;//ステート名コード。翻訳対象外
    const grantRemoveText = `付与/解除`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${stateNameCode}\\C[0]${grantRemoveText}]`;//
  };
  if (ctx.meta['PotionResist']) {
    ctx.fragText = Number(ctx.meta['PotionResist']);
    ctx.effectText += `[\\I[624]+${ctx.fragText}%]`;
  };
  if (ctx.item.speed != 0) {
    ctx.fragText = ctx.item.speed;
    const speedLabel = `Speed`;
    ctx.effectText += `\\C[${ctx.colorCode}]${speedLabel}\\C[0]:${ctx.fragText} `;
  };
  if (ctx.meta['Repeat']) {
    ctx.fragText = Number(ctx.meta['Repeat']);
    ctx.effectText += `\\I[668]:${ctx.fragText} `;
  };
  if (ctx.meta['Warmup']) {
    ctx.fragText = Number(ctx.meta['Warmup']);
    ctx.effectText += `\\I[662]:${ctx.fragText} `;
  };
  if (ctx.meta['Cooldown']) {
    ctx.fragText = Number(ctx.meta['Cooldown']);
    ctx.effectText += `\\I[663]:${ctx.fragText} `;
  };
  if (ctx.meta['RankUpPoint']) {
    ctx.fragText = Number(ctx.meta['RankUpPoint']);
    if (ctx.meta['Max Mastery Level']) {
      if (Number(ctx.meta['Max Mastery Level']) == 1) {
        ctx.effectText += `\\I[664]:${ctx.fragText} `;
      } else {
        ctx.effectText += `\\I[664]:${ctx.fragText}*${RANK_LABEL} `;
      };
    };
  };
  //if(itemMeta['Max Mastery Level']){
  //  value10 += `\\I[664]:Rank*Exp `;
  //};//冗長なので使用しない。
  if (ctx.meta['Max Mastery Level']) {
    ctx.fragText = Number(ctx.meta['Max Mastery Level']);
    ctx.effectText += `\\I[665]:${ctx.fragText} `;
  };
  if (ctx.item.tpGain != 0) {
    ctx.fragText = ctx.item.tpGain;
    ctx.effectText += `\\C[${ctx.colorCode}]${TP_LABEL}\\C[0]:${ctx.fragText}\\C[10]↑\\C[0] `;
  };
}

function describeAdditionalSets(ctx) {
  ctx.additionalSetTextByTarget = [
    0,
    `[\\C[${ctx.colorCode}]${ADDITIONAL_SET_TARGET_LABELS[1]}`,
    `[\\C[${ctx.colorCode}]${ADDITIONAL_SET_TARGET_LABELS[2]}`,
    `[\\C[${ctx.colorCode}]${ADDITIONAL_SET_TARGET_LABELS[3]}`,
    `[\\C[${ctx.colorCode}]${ADDITIONAL_SET_TARGET_LABELS[4]}`,
  ];
  ctx.additionalSetCountByTarget = [0, 0, 0, 0, 0];
  // Nine `<additionalSetN>` slots, each `target,flag,stacks,stateId`. The state
  // icon ladder and the four-way "which target" dispatch were written out twice
  // per slot; the icon is now a helper and the target is just an index.
  for (let additionalSetSlot = 1; additionalSetSlot <= 9; additionalSetSlot++) {
    const additionalSetMeta = ctx.meta['additionalSet' + additionalSetSlot];
    if (!additionalSetMeta) { continue; };
    const additionalSetValues = splitMetaValues(additionalSetMeta);
    const targetIndex = Number(additionalSetValues[0]);
    if (targetIndex < 1 || targetIndex > 4) { continue; };
    ctx.additionalSetCountByTarget[targetIndex] += 1;
    if (Number(additionalSetValues[1]) == 1) {
      ctx.additionalSetTextByTarget[targetIndex] +=
        additionalSetStateIcon(Number(additionalSetValues[3]), Number(additionalSetValues[2]));
    };
  };
  // A target whose slots all lacked the flag still bumps its count, so the line
  // below prints an empty "付与" for it — that is the original behaviour.
  for (let targetIndex = 1; targetIndex <= 4; targetIndex++) {
    if (ctx.additionalSetCountByTarget[targetIndex] >= 1) {
      const additionalSetGrantText = `付与`;
      ctx.effectText += `${ctx.additionalSetTextByTarget[targetIndex]}${additionalSetGrantText}\\C[0]] `;
    };
  };
}

// Effect codes 11/12/13 are the HP/MP/TP recovery rows and 21/22 the state
// add/remove rows. Each was written out twice (percentage field plus flat field)
// or once per state id by scanning the whole state list; only one `code` can match
// per effect, so this is a single dispatch.
const EFFECT_CODE_STATE_ADD = 21;
const EFFECT_CODE_STATE_REMOVE = 22;
const EFFECT_CODE_TP_RECOVER = 13;
const BATTLE_STATE_ID_RANGE = { first: BATTLE_STATE_ICON_FIRST_ID, last: BATTLE_STATE_ICON_FIRST_ID + BATTLE_STATE_ICONS.length - 1 };

function describeEffectRows(ctx) {
  const effects = ctx.item.effects;
  if (!effects) return;
  for (let effectIndex = 0; effectIndex <= 19; effectIndex++) {
    const effect = effects[effectIndex];
    if (!effect) continue;
    switch (effect.code) {
      case EFFECT_CODE_STATE_ADD: describeStateAddEffect(ctx, effect); break;
      case EFFECT_CODE_STATE_REMOVE: describeStateRemoveEffect(ctx, effect); break;
      default: describeRecoveryEffect(ctx, effect); break;
    }
  }
}

// 11/12/13: `[C[n]\I[icon]:value%↑[C[0]]` for the percentage field and
// `[C[n]\I[icon]:value[C[0]]` for the flat one. TP has no flat field.
function describeRecoveryEffect(ctx, effect) {
  const effectIcon = RECOVERY_EFFECT_ICONS[effect.code];
  if (!effectIcon || effect.dataId != 0) return;

  const isTp = effect.code == EFFECT_CODE_TP_RECOVER;
  const percentValue = Math.round(effect.value1 * (isTp ? 1 : 100));
  if (percentValue != 0) {
    const direction = isTp ? (percentValue >= 1 ? `up` : `down`) : ``;
    ctx.effectText += recoveryEffectText(effectIcon, percentValue, `%`, direction);
  }
  if (!isTp && effect.value2 != 0) {
    ctx.effectText += recoveryEffectText(effectIcon, effect.value2, ``, ``);
  }
}

// `<stateIcon>`: the state icon code, or the state name when it has no icon.
function effectStateLabel(state) {
  return state.iconIndex >= 1 ? `\x1bI[${state.iconIndex}]` : `${state.name}`;
}

function effectState(stateId) {
  if (stateId < 1 || stateId > $dataStates.length - 1) return null;
  return $dataStates[stateId];
}

// 22: `[C[3]解除:C[0]state]`, with the removal chance when it is not 100%.
function describeStateRemoveEffect(ctx, effect) {
  const state = effectState(effect.dataId);
  if (!state) return;
  const removePercent = Math.round(effect.value1 * 100);
  const removalLabel = `解除`;
  const removalChanceText = removePercent == 100 ? `` : `${removePercent}%`;
  ctx.effectText += `[\\C[3]${removalLabel}:\\C[0]${effectStateLabel(state)}${removalChanceText}]`;
}

// 21: a repeat of the previous state collapses to a bare `+`.
function describeStateAddEffect(ctx, effect) {
  const state = effectState(effect.dataId);
  if (!state) return;

  if (effect.dataId == ctx.prevStateCode) {
    ctx.consecStateCount += 1;
    ctx.effectText += `\\C[${ctx.colorCode}]+\\C[0]`;
    return;
  }
  ctx.prevStateCode = effect.dataId;
  ctx.consecStateCount = 0;

  // Battle states draw from their own icon sheet and carry no turn counter.
  const isBattleState = effect.dataId >= BATTLE_STATE_ID_RANGE.first && effect.dataId <= BATTLE_STATE_ID_RANGE.last;
  const turnText = !isBattleState && state.autoRemovalTiming >= 1 ? stateTurnText(state) : ``;
  const grantPercent = Math.round(effect.value1 * 100);
  const grantLabel = `付与`;
  const grantChanceText = grantPercent == 100 ? `` : `${grantPercent}%`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${grantLabel}:\\C[0]${stateIconText(effect.dataId)}${grantChanceText}${turnText}]`;
}

function stateTurnText(state) {
  return state.minTurns == state.maxTurns
    ? ` ${state.minTurns}t`
    : ` ${state.minTurns}～${state.maxTurns}t`;
}

function describeClearCountTags(ctx) {
  if (ctx.meta['dispelCount']) {
    ctx.fragText = Number(ctx.meta['dispelCount']);
    const dispelStateText = `強化状態`;
    const dispelCountSuffix = `つ`;
    const dispelActionText = `消去`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${dispelStateText}\\C[3]${ctx.fragText}${dispelCountSuffix}\\C[${ctx.colorCode}]${dispelActionText}\\C[0]]`;
  };
  if (ctx.meta['abNomalClearCount']) {
    ctx.fragText = Number(ctx.meta['abNomalClearCount']);
    const clearCountSuffix = `つ`;
    const clearRecoverText = `回復`;
    if (ctx.meta['StateabNomalOnly']) {
      ctx.effectText += `[\\C[${ctx.colorCode}]\\I[683]\\C[3]${ctx.fragText}${clearCountSuffix}\\C[${ctx.colorCode}]${clearRecoverText}\\C[0]]`;
    } else {
      ctx.effectText += `[\\C[${ctx.colorCode}]\\I[683]\\I[684]\\C[3]${ctx.fragText}${clearCountSuffix}\\C[${ctx.colorCode}]${clearRecoverText}\\C[0]]`;
    };
  };
  if (ctx.meta['abNomalClearCountPlus']) {
    const ailmentRecoveryText = `状態異常回復数+(Magic/300)`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${ailmentRecoveryText}\\C[0]]`;
  };
  if (ctx.meta['dispelCountPlus']) {
    const buffRemovalText = `強化解除数+(Magic/300)`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${buffRemovalText}\\C[0]]`;
  };
}

function describePassiveTags(ctx) {
  if (ctx.meta['Passive State'] && !ctx.meta['パッシブ隠蔽']) {
    if ($dataStates[Number(ctx.meta['Passive State'])] && $dataStates[Number(ctx.meta['Passive State'])].meta['SpcialState']) {
      const specialEffectGrantText = `特殊効果付与`;
      ctx.effectText += `\\C[${ctx.colorCode}]${specialEffectGrantText}\\C[0]<\x1bSIM[${Number(ctx.meta['Passive State'])}]> `;
    } else {
      const passiveGrantText = `付与`;
      ctx.effectText += `\\C[${ctx.colorCode}]${passiveGrantText}\\C[0]<\x1bSIM[${Number(ctx.meta['Passive State'])}]> `;
    };
  };//パッシブステート

  //属性威力加算
  for (let elementId = 1; elementId <= $dataSystem.elements.length - 1; elementId++) {
    const amplifyValue = ctx.meta['Element Amplify ' + elementId];
    if (amplifyValue) {
      ctx.effectText += `${elementAmplifyLabel(elementId)}${amplifyValue.replace(' ', '')} `;
    };
  };
}

// `<…>` battle rows that read `\\C[16][label]\C[0] ` (optionally label + value).
const BATTLE_NOTE_ROWS = [
  { metaKey: 'CertainlyDouble', label: `必ず2連撃以上` },
  { metaKey: 'CertainlyTriple', label: `必ず3連撃` },
  { metaKey: 'NormalAttackHit', label: `通常攻撃Hit数+`, valueSuffix: `` },
  { metaKey: 'AttackAbilityHit', label: `通常/アビリティ攻撃Hit数+`, valueSuffix: `` },
  { metaKey: 'BattleAddAttackSet', label: `追撃`, valueSuffix: `%` },
  { metaKey: 'Evade Counter', label: `回避後に反撃` },
  { metaKey: 'Hit Counter', label: `攻撃受後に反撃` }
];
// Icon-prefixed power rows: `\\I[icon]{label}{value} `.
const BATTLE_POWER_ROWS = [
  { metaKey: 'AddPowerWeapon', iconId: 666, label: ``, valuePrefix: `+`, valueSuffix: `` },
  { metaKey: 'Critical Multiplier', iconId: 78, label: POWER_LABEL, valuePrefix: ``, valueSuffix: `` }
];

function describeBattleTags(ctx) {
  appendPassiveElementPower(ctx);
  appendSpecialAttackTag(ctx);
  describeBattlePowerRows(ctx);
  appendCounterSkillsTag(ctx);
  appendCounterTotalTag(ctx);
  describeBattleNoteRows(ctx);
  appendMaxTpTag(ctx);
}

// `<PassiveElementP:elementId,rate>`: element damage bonus, colour-coded by sign.
function appendPassiveElementPower(ctx) {
  if (!ctx.meta['PassiveElementP']) return;
  ctx.metaValues = splitMetaValues(ctx.meta['PassiveElementP']);
  const amplifyValue = Number(ctx.metaValues[1]);
  const amplifyColorCode = amplifyValue >= 1 ? 10 : 1;
  const rankPrefix = ctx.meta['Max Mastery Level'] ? `Rank*` : ``;
  const powerText = `<${elementAmplifyLabel(ctx.metaValues[0])}${rankPrefix}${amplifyValue}%`;
  ctx.effectText += `${colorTaggedText(amplifyColorCode, powerText)}>`;
}

// `<SpecialAttack:elementId>`: the attacker's element, as a name code.
function appendSpecialAttackTag(ctx) {
  if (!ctx.meta['SpecialAttack']) return;
  ctx.effectValue = Number(ctx.meta['SpecialAttack']);
  ctx.fragText = `<\x1bSIN[${ctx.effectValue}]>`;
  const specialAttackLabel = `Attack`;
  ctx.effectText += `${colorTaggedText(ctx.colorCode, specialAttackLabel)}${ctx.fragText} `;
}

function describeBattlePowerRows(ctx) {
  for (const powerRow of BATTLE_POWER_ROWS) {
    if (!ctx.meta[powerRow.metaKey]) continue;
    ctx.effectValue = ctx.meta[powerRow.metaKey].replace(' ', '');
    const powerText = `${powerRow.label}${powerRow.valuePrefix}${ctx.effectValue}${powerRow.valueSuffix}`;
    ctx.effectText += `\\I[${powerRow.iconId}]${powerText} `;
  }
}

// `<Counter Skills>`: the reaction skills, as name codes.
function appendCounterSkillsTag(ctx) {
  if (!ctx.meta['Counter Skills']) return;
  ctx.effectValue = ctx.meta['Counter Skills'];
  const counterSkillLabel = `反撃スキル`;
  ctx.effectText += `${colorTaggedText(16, `${counterSkillLabel}:\x1bSIN[${ctx.effectValue}]`)} `;
}

// `<Counter Total>`: the tag counts extra hits, so the shown maximum is one more.
function appendCounterTotalTag(ctx) {
  if (!ctx.meta['Counter Total']) return;
  ctx.effectValue = ctx.meta['Counter Total'].replace(' +', '');
  const maxCounterText = `最大反撃回数:${Number(ctx.effectValue) + 1}回`;
  ctx.effectText += `${colorTaggedText(16, `[${maxCounterText}]`)} `;
}

function describeBattleNoteRows(ctx) {
  for (const noteRow of BATTLE_NOTE_ROWS) {
    if (!ctx.meta[noteRow.metaKey]) continue;
    ctx.effectValue = ctx.meta[noteRow.metaKey];
    const noteText = noteRow.valueSuffix === undefined
      ? noteRow.label
      : `${noteRow.label}${ctx.effectValue}${noteRow.valueSuffix}`;
    ctx.effectText += `${colorTaggedText(16, `[${noteText}]`)} `;
  }
}

// `<MaxTp>`: `\\C[16]MaxTp\\C[0]+value `.
function appendMaxTpTag(ctx) {
  if (!ctx.meta['MaxTp']) return;
  ctx.effectValue = ctx.meta['MaxTp'];
  const maxTpLabel = `MaxTp`;
  ctx.effectText += `${colorTaggedText(16, maxTpLabel)}+${ctx.effectValue} `;
}

// Element and state resistances: the same sentence with a different icon/wording.
// `ratePrefix` is what the original put between the label and the number (`+` for
// the state rows, nothing for the element rows).
const RESIST_FULL_TEXT = `完全耐性`;
const RESIST_RATE_TEXT = `耐性`;
const RESIST_NULLIFY_TEXT = `無効`;
const RESIST_ROWS = [
  { metaKey: 'elementRegist6', icon: ``, fullLabel: `六属性${RESIST_FULL_TEXT}`, rateLabel: `六属性${RESIST_RATE_TEXT}`, ratePrefix: `` },
  { metaKey: 'elementRegist9', icon: ``, fullLabel: `九属性${RESIST_FULL_TEXT}`, rateLabel: `九属性${RESIST_RATE_TEXT}`, ratePrefix: `` },
  { metaKey: 'StateabNomalResist', icon: `\\I[683]`, fullLabel: RESIST_NULLIFY_TEXT, rateLabel: RESIST_RATE_TEXT, ratePrefix: `+` },
  { metaKey: 'StateSPabNomalResist', icon: `\\I[684]`, fullLabel: RESIST_NULLIFY_TEXT, rateLabel: RESIST_RATE_TEXT, ratePrefix: `+` }
];

// 0 means immunity, anything else is a percentage.
function appendResistRow(ctx, resistRow, resistValue) {
  if (resistValue == 0) {
    ctx.effectText += `${colorTaggedText(ctx.colorCode, resistRow.icon + resistRow.fullLabel)} `;
    return;
  }
  const rateText = colorTaggedText(ctx.colorCode, `${resistRow.icon}${resistRow.rateLabel}`);
  ctx.effectText += `${rateText}${resistRow.ratePrefix}${resistValue}% `;
}

function describeResistTags(ctx) {
  for (const resistRow of RESIST_ROWS) {
    ctx.effectValue = ctx.meta[resistRow.metaKey];
    if (!ctx.effectValue) continue;
    appendResistRow(ctx, resistRow, ctx.effectValue);
  }
  if (ctx.meta['DispelGuard']) {
    const dispelGuardText = `強化消去無効`;
    ctx.effectText += `${colorTaggedText(ctx.colorCode, dispelGuardText)} `;
  }
  if (ctx.meta['Level Up Recover All']) {
    const levelUpRecoverAllText = `LvUp時に全回復`;
    ctx.effectText += `[${colorTaggedText(16, levelUpRecoverAllText)}]`;
  }
}

// `<Bypass Damage Cap>` wins over `<Damage Cap>`, `<Bypass Heal Cap>` over
// `<Heal Cap>`; the two pairs only differ in their label.
const CAP_ROWS = [
  { bypassKey: 'Bypass Damage Cap', bypassLabel: `D.Cap無効`, valueKey: 'Damage Cap', valueLabel: `D.Cap` },
  { bypassKey: 'Bypass Heal Cap', bypassLabel: `H.Cap無効`, valueKey: 'Heal Cap', valueLabel: `H.Cap` }
];
const COST_ROWS = [
  { metaKey: 'HP Cost', resourceLabel: `HP` },
  { metaKey: 'MP Cost', resourceLabel: `MP` }
];

function describeCapAndCostTags(ctx) {
  describeCapTags(ctx);
  describeCostTags(ctx);
  describeSpecialStateTags(ctx);
}

function describeCapTags(ctx) {
  for (const capRow of CAP_ROWS) {
    if (ctx.meta[capRow.bypassKey]) {
      ctx.effectText += `${colorTaggedText(16, capRow.bypassLabel)} `;
      continue;
    }
    if (!ctx.meta[capRow.valueKey]) continue;
    ctx.effectValue = ctx.meta[capRow.valueKey].replace(' ', '');
    ctx.effectText += `${colorTaggedText(16, `${capRow.valueLabel}:`)}${ctx.effectValue} `;
  }
}

// `[\\C[16]HP10消費\\C[0]]`
function describeCostTags(ctx) {
  const costSuffix = `消費`;
  for (const costRow of COST_ROWS) {
    if (!ctx.meta[costRow.metaKey]) continue;
    ctx.effectValue = ctx.meta[costRow.metaKey].replace(' ', '');
    ctx.effectText += `[${colorTaggedText(16, `${costRow.resourceLabel}${ctx.effectValue}${costSuffix}`)}]`;
  }
}

// `<SpcialState>` (activation / expiry state names), `<activateRate>`,
// `<activatePoint>` and `<Global Cooldown>` all describe the MP trigger.
function describeSpecialStateTags(ctx) {
  if (ctx.meta['SpcialState']) {
    // The two `\x1bSIM[n]` codes expand to *state names*, i.e. to other game text,
    // so they stay outside the translatable strings.
    const activationStateIcon = `\x1bSIM[110]`;//ステート名コード。翻訳対象外
    const activationText = `で発動`;
    const expiryStateIcon = `\x1bSIM[109]`;//ステート名コード。翻訳対象外
    const expiryText = `で効果消失`;
    ctx.suffixText += `[${colorTaggedText(ctx.colorCode, activationStateIcon + activationText)}][${expiryStateIcon}${expiryText}]`;

    const activationConditionText = `行動時MP消費/消費MP未満で`;
    const grantText = `付与`;
    ctx.effectText += `[${colorTaggedText(ctx.colorCode, `${activationConditionText}\\I[252]${grantText}`)}]`;
  }
  if (ctx.meta['activateRate']) {
    ctx.effectValue = Math.round(ctx.meta['activateRate'] * 100);
    const consumeMpText = `消費MP:MMP`;
    ctx.suffixText += `[${consumeMpText}${colorTaggedText(10, `${ctx.effectValue}%`)}]`;
  }
  if (ctx.meta['activatePoint']) {//使ってない？
    ctx.effectValue = ctx.meta['activatePoint'];
    const consumeMpLabel = `消費MP:`;
    ctx.suffixText += `[${consumeMpLabel}${colorTaggedText(2, `${ctx.effectValue}`)}]`;
  }
  if (ctx.meta['Global Cooldown']) {
    ctx.effectValue = Number(ctx.meta['Global Cooldown']);
    const allCooldownLabel = `全てのCT:`;
    ctx.suffixText += `[${allCooldownLabel}${colorTaggedText(2, `${ctx.effectValue}`)}]`;
  }
}

function describeCooldownAndDrainTags(ctx) {
  for (let skillTypeId = 1; skillTypeId <= 15; skillTypeId++) {
    for (const [metaSuffix, iconId] of [[`Cooldown`, 663], [`Warmup`, 662]]) {
      const metaValue = ctx.meta[`SType ${skillTypeId} ${metaSuffix}`];
      if (!metaValue) { continue; };
      ctx.colorCode = Number(metaValue) < 0 ? 3 : 1;
      ctx.effectText += `[${$dataSystem.skillTypes[skillTypeId]}\\C[${ctx.colorCode}]\\I[${iconId}]${Number(metaValue)}\\C[0]]`;
    };
  };
  ctx.colorCode = 2;
  ctx.effectText += lifeStealGroupText(ctx.meta, `HP`, `反動ﾀﾞﾒｰｼﾞ`);
  ctx.colorCode = 2;
  ctx.effectText += lifeStealGroupText(ctx.meta, `MP`, `消耗`);
  ctx.colorCode = 2;
  describeLifeStealRows(ctx);
  if (ctx.meta['RankMaxLearning']) {
    if (ctx.item.stypeId != 11) {//召喚は前提スキルがあるため除外
      if (Number(ctx.meta['Max Mastery Level']) >= 2) {
        const rankMaxLearnText = `RankMaxで習得が可能になる`;
        ctx.effectText += `[\\C[${ctx.colorCode}]${rankMaxLearnText}\\C[0]]`;
      } else {
        const masteryMaxLearnText = `熟練度Maxで習得が可能になる`;
        ctx.effectText += `[\\C[${ctx.colorCode}]${masteryMaxLearnText}\\C[0]]`;
      };
    };
  };
  if (ctx.meta['trapEvasion']) {
    const trapEvasionText = `引っ掛かったトラップを自動で回避する`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${trapEvasionText}\\C[0]]`;
  };
  if (ctx.meta['SemenRemove']) {
    ctx.colorCode = 27;
    ctx.effectValue = Number(ctx.meta['SemenRemove']);
    const semenRemoveText = `状態異常精液${ctx.effectValue}つ回復`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${semenRemoveText}\\C[0]]`;
  };
  if (ctx.meta['HstaSuppression']) {
    ctx.colorCode = 27;
    ctx.metaValues = ctx.meta['HstaSuppression'].split(',');
    ctx.effectValue = Number(ctx.metaValues[1]);
	const desireValue = ctx.effectValue * 100;
    const desireLimitText = `性欲度${desireValue}まで`;
    const developmentLimitText = `各開発/経験度${ctx.effectValue}まで`;
    if (Number(ctx.metaValues[0]) == 0) {
      ctx.effectText += `[\\C[${ctx.colorCode}]${desireLimitText}\\C[0]][\\C[${ctx.colorCode}]${developmentLimitText}\\C[0]]`;
    } else {
      const rankVariableName = $dataSystem.variables[Number(ctx.metaValues[0])];
      const rankLimitText = `のランク${ctx.effectValue}まで`;
      ctx.effectText += `[\\C[${ctx.colorCode}]${rankVariableName}${rankLimitText}\\C[0]]`;
    };
  };
  ctx.colorCode = 2;
  if (ctx.meta['TPGain1']) {
    ctx.effectValue = ctx.meta['TPGain1'];
    ctx.effectText += `[\\C[${ctx.colorCode}]${TP_LABEL}${ctx.effectValue}%\\C[0]]`;
  };
  if (ctx.meta['gainExp']) {
    ctx.effectValue = ctx.meta['gainExp'];
    const gainExpLabel = `獲得Exp`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${gainExpLabel}:${ctx.effectValue}%\\C[0]]`;
  };
  for (let tierIndex = 1; tierIndex <= 6; tierIndex++) {
    const tierSlots = ctx.meta['Skill Tier ' + tierIndex + ' Slots'];
    if (tierSlots) {
      ctx.colorCode = 16;
      ctx.effectText += `[\\C[${ctx.colorCode}]${SKILL_TIER_SLOT_LABELS[tierIndex]}\\C[2]${tierSlots.replace(' ', '')}\\C[0]]`;
    };
  };
  ctx.colorCode = 2;
}

// 称号条件: every row renders as `[\\C[c]条件:<body>\\C[0]]` and is suppressed when
// the title carries a `<DescriptionWord>`. The original repeated that guard as
// `if(x){}else{ … }` seven times; it is one check here and each row only builds its
// body.
const TITLE_CONDITION_ROWS = [
  { metaKey: 'titleGetSwitch', build: titleSwitchCondition },
  { metaKey: 'titleGetVariable', build: titleVariableCondition, splitMeta: true },
  { metaKey: 'titleGetArray', build: titleArrayCondition, splitMeta: true },
  { metaKey: 'titleGetItems', build: titleItemCondition, splitMeta: true },
  { metaKey: 'titleGetSkillRank', build: titleSkillRankCondition, splitMeta: true, ignoreDescriptionWord: true },
  { metaKey: 'titleGetAchievement', build: titleAchievementCondition, splitMeta: true },
  { metaKey: 'HtitleGetArray', build: titleHArrayCondition, splitMeta: true }
];

function describeTitleConditionTags(ctx) {
  for (const conditionRow of TITLE_CONDITION_ROWS) {
    const conditionMeta = ctx.meta[conditionRow.metaKey];
    if (!conditionMeta) continue;
    if (!conditionRow.ignoreDescriptionWord && ctx.meta['DescriptionWord']) continue;
    if (conditionRow.splitMeta) ctx.metaValues = conditionMeta.split(',');
    const conditionText = conditionRow.build(ctx, conditionMeta);
    if (!conditionText) continue;
    // `\\C[c][条件:body\\C[0]` — the bracket sits inside the colour code, so the row
    // is not a plain colorTaggedText wrap.
    ctx.effectText += `\\C[${ctx.colorCode}][${CONDITION_LABEL}:${conditionText}]\\C[0]`;
  }
}

// `<titleGetSwitch>`: switch id; id 2 is the "no condition" placeholder.
function titleSwitchCondition(ctx) {
  ctx.effectValue = Number(ctx.meta['titleGetSwitch']);
  if (ctx.effectValue == 2) return ``;
  return `${$dataSystem.switches[ctx.effectValue]}`;
}

// `<titleGetVariable:variableId,value>`.
function titleVariableCondition(ctx) {
  const variableName = $dataSystem.variables[Number(ctx.metaValues[0])];
  return `${variableName}:${Number(ctx.metaValues[1])}`;
}

// `<titleGetArray:52,stateId,count>`: `52` is the only counter implemented.
function titleArrayCondition(ctx) {
  if (Number(ctx.metaValues[0]) != SUBJUGATION_CONDITION_ID) return ``;
  const subjugationCountLabel = `体討伐`;
  const stateNameCode = `\x1bSIM[${Number(ctx.metaValues[1])}]`;
  return `${stateNameCode}:${Number(ctx.metaValues[2])}${subjugationCountLabel}`;
}

// `<titleGetItems:itemId,count>`.
function titleItemCondition(ctx) {
  const quantityLabel = `個`;
  const itemNameCode = `\x1bIIN[${Number(ctx.metaValues[0])}]`;
  return `${itemNameCode}:${Number(ctx.metaValues[1])}${quantityLabel}`;
}

// `<titleGetSkillRank:skillId,rank>`: any party member.
function titleSkillRankCondition(ctx) {
  const partyMemberLabel = `パーティの誰かが`;
  const skillNameCode = `\x1bSIN[${Number(ctx.metaValues[0])}]`;
  return `${partyMemberLabel}${skillNameCode}${RANK_LABEL}:${Number(ctx.metaValues[1])}${OR_MORE_SUFFIX}`;
}

// `<titleGetAchievement:counterId,value>`, plus a `<KojinTitle>` marker.
function titleAchievementCondition(ctx) {
  const achievementName = ACHIEVEMENT_NAMES[Number(ctx.metaValues[0])];
  const personalTagLabel = `個人`;
  const personalTag = ctx.meta['KojinTitle'] ? `[${personalTagLabel}]` : ``;
  return `${achievementName}${personalTag}:${Number(ctx.metaValues[1])}`;
}

// `<HtitleGetArray:variableId,value>`: H variables live 400 entries further up.
function titleHArrayCondition(ctx) {
  const variableName = $dataSystem.variables[Number(ctx.metaValues[0]) + H_VARIABLE_OFFSET];
  return `${variableName}:${Number(ctx.metaValues[1])}`;
}

// `<annihilationTitle:selector,count>`: `selector` is a kill counter — 1 = all
// maps, 2 = all dungeons, >= 20 = an item id. The original printed the selector
// itself as the count and, when no branch matched, appended whatever
// `effectValue` an earlier row of the same entry had left behind; both fixed.
function describeAnnihilationTitle(ctx) {
  const annihilationMeta = ctx.meta['annihilationTitle'];
  if (!annihilationMeta) return;
  ctx.metaValues = annihilationMeta.split(',');
  const selector = Number(ctx.metaValues[0]);
  const requiredCount = Number(ctx.metaValues[1]);

  const annihilationCountLabel = `殲滅回数`;
  const totalAnnihilationCountLabel = `の総殲滅回数`;
  const allMapsLabel = `全マップ`;
  const allDungeonsLabel = `全ダンジョン`;
  const timesOrMoreSuffix = `回以上`;

  let subjectName;
  let countLabel;
  if (selector >= 20 && $dataItems[selector]) {
    subjectName = `<${$dataItems[selector].name}>`;
    countLabel = annihilationCountLabel;
  } else if (selector == 1) {
    subjectName = `<${allMapsLabel}>`;
    countLabel = totalAnnihilationCountLabel;
  } else if (selector == 2) {
    subjectName = `<${allDungeonsLabel}>`;
    countLabel = totalAnnihilationCountLabel;
  } else {
    return;
  }
  const subjectText = `${colorTaggedText(1, subjectName)}${countLabel}:`;
  ctx.effectValue = `${subjectText}${colorTaggedText(10, `${requiredCount}`)}${timesOrMoreSuffix}`;
  ctx.effectText += `\\C[${ctx.colorCode}][${CONDITION_LABEL}:${ctx.effectValue}\\C[${ctx.colorCode}]]\\C[0]`;
}

// `<PassivePlusTrait:11,elementId,rate>`: element damage taken modifier. A positive
// rate lowers the damage taken, a negative one raises it (the original computed
// the absolute value with `x - x - x`).
function describePassivePlusTrait(ctx) {
  const plusTraitMeta = ctx.meta['PassivePlusTrait'];
  if (!plusTraitMeta) return;
  ctx.metaValues = plusTraitMeta.split(',');
  if (Number(ctx.metaValues[0]) != 11) return;

  ctx.effectValue = Number(ctx.metaValues[2]);
  const damageResistLabel = `ダメージ耐性`;
  const elementName = $dataSystem.elements[Number(ctx.metaValues[1])];
  const directionText = ctx.effectValue >= 0 ? `Down` : `Up`;
  const percentText = Math.round(Math.abs(ctx.effectValue) * 100);
  ctx.effectText += `[${colorTaggedText(ctx.colorCode, elementName)}${damageResistLabel}${percentText}%${directionText}]`;
}

// `<PassivePlusEffect:source,index,rate>`: one stat name plus a percentage.
function describePassivePlusEffect(ctx) {
  const plusEffectMeta = ctx.meta['PassivePlusEffect'];
  if (!plusEffectMeta) return;
  ctx.metaValues = plusEffectMeta.split(',');
  ctx.effectValue = statEffectName(ctx.metaValues);
  // An unknown source used to print whatever `effectValue` the previous row had
  // left behind; print nothing instead.
  if (ctx.effectValue === undefined) return;
  const percentText = Math.round(Number(ctx.metaValues[2]) * 100);
  ctx.effectText += `[${colorTaggedText(ctx.colorCode, `${ctx.effectValue}`)}+${percentText}%]`;
}

function describeTitleEffectTags(ctx) {
  describeAnnihilationTitle(ctx);
  describePassivePlusTrait(ctx);
  describePassivePlusEffect(ctx);

  // 称号効果
  if (ctx.meta['titleEffectConfiVal'] && !ctx.meta['DescriptionWord']) {
    ctx.metaValues = ctx.meta['titleEffectConfiVal'].split(',');
    const variableName = $dataSystem.variables[Number(ctx.metaValues[0])];
    const variableIncreaseText = `+${Number(ctx.metaValues[1])}`;
    ctx.effectText += `[${colorTaggedText(ctx.colorCode, `${variableName}:${variableIncreaseText}`)}]`;
  }
  if (ctx.meta['titleEffectConfiSwi']) {
    ctx.effectValue = Number(ctx.meta['titleEffectConfiSwi']);
    ctx.effectText += `[${colorTaggedText(ctx.colorCode, `${$dataSystem.switches[ctx.effectValue]}`)}]`;
  }
  if (ctx.meta['titleSenkaGet']) {
    ctx.effectValue = Number(ctx.meta['titleSenkaGet']);
    ctx.effectText += `[${colorTaggedText(ctx.colorCode, `\x1bIIN[10]+${ctx.effectValue}`)}]`;
  }
}

function describeStatEffectSlots(ctx) {
  for (const statEffectPrefix of [`titleEffect`, `eatEffect`]) {
    for (let statEffectSlot = 1; statEffectSlot <= 9; statEffectSlot++) {
      const statEffectMeta = ctx.meta[statEffectPrefix + statEffectSlot];
      if (!statEffectMeta) { continue; };
      ctx.metaValues = splitMetaValues(statEffectMeta);
      const statSource = Number(ctx.metaValues[0]);
      if (statSource == 4) {
        // Element resist: the element name goes straight to the output, and the row
        // is labelled 耐性 — except for the resist-special elements, which keep
        // whatever the previous slot left in `effectValue`.
        ctx.effectText += `${$dataSystem.elements[Number(ctx.metaValues[1])]}`;
        if (RESIST_SPECIAL_ELEMENT_IDS.indexOf(Number(ctx.metaValues[1])) < 0) {
          ctx.effectValue = RESIST_RATE_TEXT;
        };
      } else if (statSource >= 0 && statSource <= 3) {
        ctx.effectValue = statEffectName(ctx.metaValues);
      };
      // `x - x - x` in the original is just `-x`, i.e. the magnitude.
      const statPercent = Math.abs(Number(ctx.metaValues[2])) * 100;
      ctx.colorCode = 1;
      ctx.effectText += `[\\C[${ctx.colorCode}]${ctx.effectValue}\\C[0]+\\C[2]${statPercent}\\C[0]%]`;
      ctx.colorCode = 2;
    };
  };
}

// 娼婦系説明文: one row per body stat, `<tag>` -> `\\C[27]label+value unit\\C[0] `.
const BODY_CHANGE_ROWS = [
  { metaKey: 'BustSizeChange', label: `BustSize`, unit: `cm` },
  { metaKey: 'HipSizeChange', label: `HipSize`, unit: `cm` },
  { metaKey: 'BodyWeightChange', label: `BodyWeight`, unit: `kg` }
];

function describeBodyChangeTags(ctx) {
  if (ctx.meta['ProstitutionMoneyUp']) {
    ctx.effectValue = ctx.meta['ProstitutionMoneyUp'];
    const prostitutionBonusText = `売春額に${ctx.effectValue}倍補正`;
    ctx.effectText += `${colorTaggedText(27, prostitutionBonusText)} `;
  }
  for (const bodyChangeRow of BODY_CHANGE_ROWS) {
    if (!ctx.meta[bodyChangeRow.metaKey]) continue;
    ctx.effectValue = ctx.meta[bodyChangeRow.metaKey];
    const bodyChangeText = `${bodyChangeRow.label}+${ctx.effectValue}${bodyChangeRow.unit}`;
    ctx.effectText += `${colorTaggedText(27, bodyChangeText)} `;
  }
  describeAppraisalTags(ctx);
}

// `<下級鑑定品>` / `<中級鑑定品>` / `<上級鑑定品>`: one "未鑑定品" marker followed by the
// tiers that are present.
const APPRAISAL_GRADE_ROWS = [
  { metaKey: '下級鑑定品', label: `下級` },
  { metaKey: '中級鑑定品', label: `中級` },
  { metaKey: '上級鑑定品', label: `上級` }
];

function describeAppraisalTags(ctx) {
  const presentGradeRows = APPRAISAL_GRADE_ROWS.filter(function (gradeRow) {
    return ctx.meta[gradeRow.metaKey];
  });
  if (!presentGradeRows.length) return;

  const unidentifiedLabel = `未鑑定品`;
  let appraisalText = `\\C[3][${unidentifiedLabel}]\\C[0]`;
  for (const gradeRow of presentGradeRows) {
    appraisalText += colorTaggedText(ctx.colorCode, `[${gradeRow.label}]`);
  }
  ctx.effectText += `${appraisalText} `;
}

function describeQuestHeaderTags(ctx) {
  if (ctx.meta['walletIn']) {
    const useWithLabel = `使用で`;
    const obtainLabel = `入手`;
    ctx.effectText += `\\C[${ctx.colorCode}][${useWithLabel}\\\G${obtainLabel}]\\C[0] `;
  }
  appendQuestAcceptRow(ctx);
  appendQuestTargetRow(ctx);
  appendQuestSuitableLevelRow(ctx);
}

// `[\\C[16]label\\C[0]:\\C[2]value\\C[0]]` plus its separator (a space, or a line break
// after the target row).
function appendQuestLabelRow(ctx, label, value, separator) {
  ctx.effectText += `[${colorTaggedText(16, label)}:${colorTaggedText(2, `${value}`)}]${separator}`;
}

// `<QuestSetMap>`: the switch that unlocks the quest, or `[常設]` for 0.
function appendQuestAcceptRow(ctx) {
  if (!ctx.meta['QuestSetMap']) return;
  ctx.effectValue = Number(ctx.meta['QuestSetMap']) == 0
    ? `[常設]`
    : $dataSystem.switches[Number(ctx.meta['QuestSetMap'])];
  const acceptLabel = `受注`;
  appendQuestLabelRow(ctx, acceptLabel, ctx.effectValue, ` `);
}

// `<QuestSubjectMap>`: the map the quest takes place on.
function appendQuestTargetRow(ctx) {
  if (!ctx.meta['QuestSubjectMap']) return;
  ctx.effectValue = $dataSystem.switches[Number(ctx.meta['QuestSubjectMap'])];
  const targetLabel = `対象`;
  appendQuestLabelRow(ctx, targetLabel, ctx.effectValue, `\n`);
}

// `<QuestSuitableLv>`, or — when it is missing — the lowest enemy level of the
// items that belong to the quest map.
function appendQuestSuitableLevelRow(ctx) {
  if (ctx.meta['QuestSuitableLv']) {
    // `effectValue` here, `fragText` in the fallback: the two branches keep the
    // scratch variables the original left behind (a later row still reads them).
    ctx.effectValue = Number(ctx.meta['QuestSuitableLv']);
    appendQuestLabelRow(ctx, SUITABLE_LV_LABEL, ctx.effectValue, ` `);
    return;
  }
  const mapEnemyLevel = questMapEnemyLevel(ctx);
  if (mapEnemyLevel === null) return;
  ctx.fragText = mapEnemyLevel;
  appendQuestLabelRow(ctx, SUITABLE_LV_LABEL, ctx.fragText, ` `);
}

// The original walked the whole item list and re-read `$dataItems[id].meta` four
// times per candidate; the entry and its meta are cached now.
function questMapEnemyLevel(ctx) {
  if (!ctx.meta['QuestSubjectMap']) return null;
  ctx.effectValue = Number(ctx.meta['QuestSubjectMap']);
  for (let itemId = 1; itemId <= $dataItems.length - 1; itemId++) {
    const candidateItem = $dataItems[itemId];
    const candidateMeta = candidateItem ? candidateItem.meta : null;
    if (!candidateMeta || !candidateMeta['MapSwitch']) continue;
    if (Number(candidateMeta['MapSwitch']) != ctx.effectValue) continue;
    if (!candidateMeta['EnemyLV']) continue;
    ctx.metaValues = candidateMeta['EnemyLV'].split(',');
    return Math.min(...ctx.metaValues);
  }
  return null;
}

// `\\I[icon]rate× ` rows: party/enemy experience and gold bonuses.
const RATE_ROWS = [
  { metaKey: 'PartyExpRate', iconId: 296 },
  { metaKey: 'PartyGoldRate', iconId: 314 },
  { metaKey: 'EnemyExpRate', iconId: 296 },
  { metaKey: 'EnemyGoldRate', iconId: 314 }
];

function describeQuestAndRateTags(ctx) {
  ctx.colorCode = DESCRIPTION_DEFAULT_COLOR_CODE;
  describeQuestObjectiveTags(ctx);
  describeQuestItemTags(ctx);
  describeRateTags(ctx);
}

// `<QuestComp…1>`: one `[label] ` per objective whose first field is at least 1.
function describeQuestObjectiveTags(ctx) {
  for (const [questMetaKey, questLabel] of QUEST_OBJECTIVE_LABELS) {
    const questMeta = ctx.meta[questMetaKey];
    if (!questMeta || Number(questMeta.split(',')[0]) < 1) continue;
    ctx.effectText += `[${colorTaggedText(ctx.colorCode, questLabel)}] `;
  }
  if (ctx.meta['CoercionQuest']) {
    const questForcedProgressText = `クエスト進行中に強制進行あり`;
    ctx.effectText += `[${colorTaggedText(ctx.colorCode, questForcedProgressText)}] `;
  }
}

// Simple `[label]` / `[label+value]` item rows.
function describeQuestItemTags(ctx) {
  if (ctx.meta['Stuff']) {
    ctx.effectValue = Number(ctx.meta['Stuff']);
    const currentSatiety = $gameVariables.value(16);
    const maxSatiety = $gameVariables.value(13);
    const satietyText = `満腹度+${ctx.effectValue}（${currentSatiety}/${maxSatiety}）`;
    ctx.effectText += `${colorTaggedText(ctx.colorCode, `[${satietyText}]`)} `;
  }
  if (ctx.meta['ＴＰ']) {
    ctx.effectValue = Number(ctx.meta['ＴＰ']);
    ctx.effectText += `${colorTaggedText(ctx.colorCode, `[${TP_LABEL}+${ctx.effectValue}]`)} `;
  }
  if (ctx.meta['Ingredients']) {
    const ingredientLabel = `食材(換金用途)`;
    ctx.effectText += `${colorTaggedText(ctx.colorCode, `[${ingredientLabel}]`)} `;
  }
  if (ctx.meta['Alcohol']) {
    const alcoholLabel = `アルコール`;
    ctx.effectText += `${colorTaggedText(ctx.colorCode, `[${alcoholLabel}]`)} `;
  }
  describeExpiryDateTag(ctx);
  if (ctx.meta['EventFactorClearReset']) {
    const questItemLabel = `クエスト関連アイテム`;
    ctx.effectText += `${colorTaggedText(ctx.colorCode, `[${questItemLabel}]`)} `;
  }
  if (ctx.meta['AddPowerCustom']) {
    ctx.effectValue = Number(ctx.meta['AddPowerCustom']);
    if (ctx.effectValue >= 1) ctx.effectText += `\\I[666]+${ctx.effectValue} `;
  }
  if (ctx.meta['RaceDropRarity']) {
    const rarityText = RACE_DROP_RARITY_TEXT[Number(ctx.meta['RaceDropRarity'])];
    if (rarityText) ctx.effectText += rarityText;
  }
}

// `<ExpiryDate>`: food expires the same day, everything else is returned the next
// day. (A `<Menu Category>` other than ` Food` shows neither, as before.)
function describeExpiryDateTag(ctx) {
  if (!ctx.meta['ExpiryDate']) return;
  const menuCategory = ctx.meta['Menu Category'];
  if (menuCategory && menuCategory != ' Food') return;
  const expiryLabel = menuCategory ? `賞味期限当日中` : `翌日自動返却`;
  ctx.effectText += `${colorTaggedText(ctx.colorCode, `[${expiryLabel}]`)} `;
}

function describeRateTags(ctx) {
  for (const rateRow of RATE_ROWS) {
    if (!ctx.meta[rateRow.metaKey]) continue;
    ctx.effectValue = ctx.meta[rateRow.metaKey];
    ctx.effectText += `\\I[${rateRow.iconId}]${ctx.effectValue}${TIMES_SUFFIX} `;
  }
}

function describeFinalTags(ctx) {
  if (ctx.meta['Learn Require Eval']) {
    const learnRequirementLabel = `習得条件あり`;
    ctx.headerText += `[\\C[${ctx.colorCode}]${learnRequirementLabel}\\C[0]]`;
  };

  if (ctx.meta['SwicthOnOffUse']) {
    const toggleOnUseLabel = `使用でOn/Off`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${toggleOnUseLabel}\\C[0]]`;
  };

  //↓ステート最後に付けるようにする。
  // Each of the five `<Category>` values appends one fixed state's help text.
  const categoryStateId = CATEGORY_HELP_STATE_IDS[ctx.meta['Category']];
  if (categoryStateId) {
    ctx.suffixText += `\\C[${ctx.colorCode}]${$dataStates[categoryStateId].description}\\C[0] `;
  };
  if (ctx.meta['timeRemove']) {
    const timeReleaseLabel = `時間経過で解除`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${timeReleaseLabel}\\C[0]]`;
  };

  if (ctx.databaseTypeId == 4) {
    if (ctx.meta['registUp']) {
      ctx.effectValue = ctx.meta['registUp'];
      const resistOnApplyText = `付与時に耐性率${ctx.effectValue}%up`;
      ctx.effectText += `[\\C[${ctx.colorCode}]${resistOnApplyText}\\C[0]]`;
    };
    if (ctx.item.autoRemovalTiming >= 1) {
      ctx.fragText = `\\I[75]:${ctx.item.minTurns}`;
      if (ctx.item.minTurns != ctx.item.maxTurns) {
        ctx.fragText += `～${ctx.item.maxTurns}`;
      };
      ctx.effectText += `[${ctx.fragText}] `;
    } else {
      // `∞` when none of the equipped passive skills / weapons / armors grants
      // this state. Three identical scan-the-whole-list loops used to decide it;
      // this short-circuits and allocates nothing.
      const grantedByEquipment = containsState(valueEquipPassiveSkill, ctx.entryIndex)
        || containsState(valueEquipPassiveWeapon, ctx.entryIndex)
        || containsState(valueEquipPassiveArmor, ctx.entryIndex);
      if (!grantedByEquipment) { ctx.effectText += `[\\I[75]:∞] `; };
    };

  };
}

function describeElementAttackTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 31) {
    if (traitDataId >= 1 && traitDataId <= $dataSystem.elements.length - 1) {
      if (!ctx.meta['EnemyState']) {
        if (SPECIAL_ATTACK_ELEMENT_IDS.indexOf(traitDataId) >= 0) {
          var colorTaggeredText = colorTaggedText(ctx.colorCode, `特攻属性付与`);
          ctx.effectText += `${colorTaggeredText}${elementLabel(traitDataId)} `;
        } else {
          var colorTaggeredText = colorTaggedText(ctx.colorCode, `攻撃属性付与`);
          ctx.effectText += `${colorTaggeredText}${elementLabel(traitDataId)}\\C[${ctx.colorCode}] `;
        };
      };
    };
  };
}

function describeElementResistTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 11) {
    if (traitDataId >= 1 && traitDataId <= $dataSystem.elements.length - 1) {
      // Read the descriptor once: each call allocates.
      const elementIcon = amygame_elementIcon(traitDataId);
      if (elementIcon[0] >= 1) {
        // A handful of element ids carry a literal label instead of an icon.
        ctx.fragText = `${elementIcon[1]}`;
      } else {
        // Element 11 is scaled by 10 rather than 100, so a "10% resist" is
        // written as 1 in the database.
        ctx.effectValue = Math.round(Math.abs(traitValue - 1) * (traitDataId == 11 ? 10 : 100));
        // The two element groups read the sign from opposite ends of the same rate.
        // The resist-special ids are mechanic rates (Burst!, 連撃率, 回復率, Chain,
        // Ability, 汎用, 背水, 渾身, 状態異常数), so a rate above 1 is a plain `+`.
        // For the damage elements a rate above 1 is a weakness, i.e. `耐性-`.
        const pm = traitValue >= 1 ? `+` : `-`;
        const resistPm = traitValue >= 1 ? `-` : `+`;
        const pmName = RESIST_RATE_TEXT + resistPm;
        const pmMsg = RESIST_SPECIAL_ELEMENT_IDS.indexOf(traitDataId) >= 0 ? pm : pmName;
        ctx.fragText = `${elementResistIcon(elementIcon)}${pmMsg}`;
      };
      // Element ids 35/37/38/41 are never listed, and 41-80 are enemy-only:
      // the latter are hidden altogether when the page is a state page.
      if (RESIST_EXCLUDED_ELEMENT_IDS.indexOf(traitDataId) < 0
        && !(ctx.meta['EnemyState'] && traitDataId >= 41 && traitDataId <= 80)) {
        ctx.effectText += `${ctx.fragText}${ctx.effectValue}% `;
      };
    };
  };
}

function describeDebuffResistTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 12) {
    if (traitDataId >= 0 && traitDataId <= 7) {
      // Debuff rate: a rate above 1 means the debuff lands more often, which is
      // the negative (red) direction — the same reading as describeStateResistTrait.
      const isMinus = traitValue >= 1;
      ctx.effectValue = Math.round((isMinus ? (traitValue - 1) : (1 - traitValue)) * 100);
      const resistColor = isMinus ? 1 : ctx.colorCode;
      const pm = isMinus ? `-` : `+`;
      const pmName = colorTaggedText(resistColor, RESIST_RATE_TEXT + pm);
      ctx.fragText = `${pmName}\x1bI[${traitDataId + 48}]`;
      ctx.effectText += `${ctx.fragText}${ctx.effectValue}% `;
    };
  };
}

function describeStateResistTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 13) {
    if (traitDataId >= 1 && traitDataId <= $dataStates.length - 1) {
      ctx.effectValue = Math.round(Math.abs(traitValue - 1) * 100);
      const isMinus = traitValue >= 1;
      const resistColor = isMinus ? 1 : ctx.colorCode;
      const pm = isMinus ? `-` : `+`;
      const pmName = colorTaggedText(resistColor, RESIST_RATE_TEXT + pm);
      ctx.effectText += "\\C[0]" + `${pmName}${stateIconText(traitDataId)}${ctx.effectValue}% `;
    };
  };
}

function describeStateNullifyTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  //const traitValue = trait.value;
  if (trait.code == 14) {
    if (traitDataId >= 1 && traitDataId <= $dataStates.length - 1) {
      var pmName = colorTaggedText(ctx.colorCode, `無効化`);
      ctx.effectText += `${pmName}${stateIconText(traitDataId)} `;
    };
  };
}

function describeStatUpTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if ((traitIndex > ctx.statUpCount || ctx.statUpCount <= 4) && trait.code == 21) {
    if (traitDataId >= 0 && traitDataId <= 7) {
      ctx.effectText += allStatUpText(traitValue, `\x1bI[${traitDataId + 32}]+`, `\x1bI[${traitDataId + 48}]-`, false);
    };
  };
}

function describeXparamTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 22) {
    if (traitDataId >= 0 && traitDataId <= 9) {
      var xparamIcons = XPARAM_ICONS[traitDataId] || PARAM_ICON_DEFAULT;
      if (traitValue >= 0.01) {
        ctx.effectText += `\x1bI[${xparamIcons[1]}]+${Math.round(traitValue * 100)}% `;
      } else {
        ctx.effectText += `\x1bI[${xparamIcons[2]}]${Math.round(traitValue * 100)}% `;
      };
    };
  };
}

function describeSparamTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (ctx.damageCutCount <= 1 && trait.code == 23) {
    if (traitDataId >= 0 && traitDataId <= 9) {
      var sparamIcons = SPARAM_ICONS[traitDataId] || PARAM_ICON_DEFAULT;
      var negativeIsGood = SPARAM_ICONS_NEGATIVE_IS_GOOD.indexOf(traitDataId) >= 0;
      var isUp = (traitValue >= 1) !== negativeIsGood;
      const pm = isUp ? `+` : `-`;
      ctx.effectText += `\x1bI[${isUp ? sparamIcons[1] : sparamIcons[2]}]${pm}${Math.round(Math.abs(traitValue - 1) * 100)}% `;
    };
  };
}

function describeStateAddTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 32) { //31は先頭で実行済み。
    if (traitDataId >= 1 && traitDataId <= $dataStates.length - 1) {
      var colorTaggeredText = colorTaggedText(ctx.colorCode, `ステート付与`);
      ctx.effectText += `${colorTaggeredText}${stateIconText(traitDataId)}${Math.round(traitValue * 100)}% `;
    };
  };
}

function describeAttackSpeedTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 33) {
    if (traitDataId == 0) {
      var colorTaggeredText = colorTaggedText(ctx.colorCode, `AttackSpeed+`);
      ctx.effectText += `${colorTaggeredText}${Math.round(traitValue)} `;
    };
  };
}

function describeSkillTypeUnlockTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 41) {
    if (traitDataId >= 1 && traitDataId <= $dataSystem.skillTypes.length - 1) {
      var colorTaggeredText = colorTaggedText(ctx.colorCode, `使用可能`);
      ctx.effectText += `${colorTaggeredText}<${$dataSystem.skillTypes[traitDataId]}> `;
    };
  };
}

function describeSkillTypeSealTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 42) {
    if (traitDataId >= 1 && traitDataId <= $dataSystem.skillTypes.length - 1) {
      ctx.effectText += `\\I[626]<${$dataSystem.skillTypes[traitDataId]}> `;
    };
  };
}

function describeSkillUnlockTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 43) {
    if (traitDataId >= 1 && traitDataId <= $dataSkills.length - 1) {
      var skillRef = `<\x1bSIN[${traitDataId}]>`;
      if (ctx.databaseTypeId == 1 && $dataSkills[traitDataId].stypeId == BURST_SKILL_TYPE_ID) {
        var colorTaggeredText = colorTaggedText(ctx.colorCode, `Burst`);
        ctx.effectText += `${colorTaggeredText}${skillRef} `;
      } else {
        var colorTaggeredText = colorTaggedText(ctx.colorCode, `使用可能`);
        ctx.effectText += `${colorTaggeredText}${skillRef} `;
      };
    };
  };
}

function describeSkillSealTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 44) {
    if (traitDataId >= 1 && traitDataId <= $dataSkills.length - 1) {
      ctx.effectText += `\\I[626]<\x1bSIN[${traitDataId}]> `;
    };
  };
}

function describeWeaponTypeTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (ctx.tenWeaponCount <= 9 && trait.code == 51) {
    if (traitDataId >= 1 && traitDataId <= $dataSystem.weaponTypes.length - 1) {
      var colorTaggeredText = colorTaggedText(ctx.colorCode, `武器種`);
      ctx.effectText += `${colorTaggeredText}<${$dataSystem.weaponTypes[traitDataId]}> `;
    };
  };
}

function describeArmorTypeTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 52) {
    if (traitDataId >= 2 && traitDataId <= $dataSystem.armorTypes.length - 1) {
      var colorTaggeredText = colorTaggedText(ctx.colorCode, `防具種`);
      ctx.effectText += `${colorTaggeredText}<${$dataSystem.armorTypes[traitDataId]}> `;
    };
  };
}

function describeEquipFixedTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 53) {
    if (traitDataId >= 1 && traitDataId <= $dataSystem.equipTypes.length - 1) {
      var colorTaggeredText = colorTaggedText(1, `装備固定`);
      ctx.effectText += `${colorTaggeredText}<${$dataSystem.equipTypes[traitDataId]}> `;
    };
  };
}

function describeEquipSealedTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 54) {
    if (traitDataId >= 1 && traitDataId <= $dataSystem.equipTypes.length - 1) {
      var colorTaggeredText = colorTaggedText(1, `装備封印`);
      ctx.effectText += `${colorTaggeredText}<${$dataSystem.equipTypes[traitDataId]}> `;
    };
  };
}

function describeActionCountTrait(ctx, trait, traitIndex) {
  const traitDataId = trait.dataId;
  const traitValue = trait.value;
  if (trait.code == 61) {
    if (traitDataId == 0) {
      var colorTaggeredText = colorTaggedText(ctx.colorCode, `行動回数追加`);
      ctx.effectText += `${colorTaggeredText}${Math.round(traitValue * 100)}% `;
    };
  };
}

// ---------------------------------------------------------------------------
// Output assembly: header + description + effect lines, then the page-specific
// write rules (states/classes only get text when they carry <Help Description>).
// ---------------------------------------------------------------------------
function applyEntryDescription(ctx) {
  const { item, meta, databaseTypeId } = ctx;
  if (databaseTypeId == DESCRIPTION_DATABASE_STATE) ctx.descWordText = `　${ctx.descWordText}`;
  if (databaseTypeId != DESCRIPTION_DATABASE_STATE && item.description == undefined) {
    item.description = meta['NoAddDescription'] ? `解説なし` : ``;
  }

  const descriptionWordPart = ctx.descWordText == 0 ? `` : ctx.descWordText;
  const descriptionWordLine = descriptionWordPart ? `\n${descriptionWordPart}` : ``;
  const generatedDescription = meta['NoAddDescription']
    ? `${ctx.headerText}${item.description}${ctx.suffixText}${descriptionWordLine}`
    : `${ctx.headerText}${item.description}${ctx.suffixText}\n${descriptionWordPart}${ctx.effectText}`;

  if (databaseTypeId == DESCRIPTION_DATABASE_STATE) {
    if (meta['Help Description']) item.description = generatedDescription;
    return;
  }
  if (databaseTypeId == DESCRIPTION_DATABASE_CLASS) {
    if (!meta['NoAddDescription'] && meta['Help Description']) {
      item.description = `${ctx.headerText}${item.description}${ctx.suffixText}${ctx.effectText}`;
    }
    return;
  }
  item.description = generatedDescription;
}

// Trait code 42 (skill-type seal) for type 4 also seals types 5-8. This is a real
// database change, not text, so it lives next to the write rules.
const SEALED_SKILL_TYPE_GROUPS = { 4: [5, 6, 7, 8] };

function expandSealedSkillTypes(ctx) {
  const { item, databaseTypeId } = ctx;
  if (databaseTypeId != DESCRIPTION_DATABASE_WEAPON && databaseTypeId != DESCRIPTION_DATABASE_ARMOR
    && databaseTypeId != DESCRIPTION_DATABASE_STATE && databaseTypeId != DESCRIPTION_DATABASE_CLASS) return;
  for (let traitIndex = 0; traitIndex <= 19; traitIndex++) {
    const trait = item.traits[traitIndex];
    if (!trait || trait.code != 42) continue;
    const sealedTypes = SEALED_SKILL_TYPE_GROUPS[trait.dataId];
    if (!sealedTypes) continue;
    for (const sealedTypeId of sealedTypes) item.traits.push({ code: 42, dataId: sealedTypeId, value: 1 });
  }
}

//通常攻撃の追加説明文にランク補正値と派生スキルの有無を表示valueAddDescriptionSkill = Array(101).fill(0);
// Normal attacks get a rank-correction line and, optionally, the skills they
// derive into. The 101-200 and 901-950 blocks were the same body with a
// different header and output slot; 901-950 has no `<NormalAttackDerivedSuper>`
// tag in this database, so handling it in the shared body is a no-op there.
attackSkillRankText = function (skill, headerText) {
  let descriptionText = headerText;
  const masteryEffect = skill.meta['Mastery Effect'];
  const rankCorrectionLabel = `ランク補正`;
  const damagePerRankLabel = `ダメージ値にランク毎`;
  descriptionText += masteryEffect
    ? `[${rankCorrectionLabel}:${damagePerRankLabel}${masteryEffect.replace(' Damage Per Level', '').replace(' ', '')}]\n`
    : `\n`;
  for (const derivedTag of [`NormalAttackDerived`, `NormalAttackDerivedSuper`]) {
    const derivedMeta = skill.meta[derivedTag];
    if (!derivedMeta) { continue; };
    const metaValues = derivedMeta.split(',');
    const derivedSkillName = $dataSkills[Number(metaValues[1])].name;
    const derivedRankLabel = `ランク${metaValues[0]}で`;
    const derivedRankConditionLabel = `ランク${metaValues[0]}と特殊条件を満たす事で`;
    const derivedSkillSuffix = `が派生発生`;
    descriptionText += derivedTag == `NormalAttackDerived`
      ? `[${derivedRankLabel}\\C[2]${derivedSkillName}\\C[0]${derivedSkillSuffix}]`
      : `[${derivedRankConditionLabel}\\C[2]${derivedSkillName}\\C[0]${derivedSkillSuffix}]`;
  };
  return descriptionText;
}
// `valueAddDescriptionSkill[id - offset]`: 101-200 are the plain normal attacks
// and 901-950 the same rows with a required-mastery header, so one helper covers
// both ranges.
attack_addKaisetu1 = function () {
  fillAttackDescriptions(101, 200, 100, function () { return ``; });
  fillAttackDescriptions(901, 950, 800, requiredMasteryHeader);
};

function requiredMasteryHeader(skill) {
  return `[必要熟練度:基礎値${Number(skill.meta.RankUpPoint)}にランク×基礎値をプラス]`;
}

function fillAttackDescriptions(firstSkillId, lastSkillId, idOffset, headerFor) {
  for (let skillId = firstSkillId; skillId <= lastSkillId; skillId++) {
    const skill = $dataSkills[skillId];
    if (skill.name == '') continue;
    valueAddDescriptionSkill[skillId - idOffset] = attackSkillRankText(skill, headerFor(skill));
  }
};

recoveryEffectMsg = function (ind1, ind2) {
  const recoveryEffectName = `回復`;
  const icon1 = `\\I[${ind1}]`;
  const icon2 = `\\I[${ind2}]`;
  const extraEffectMsg = `対象の${icon2}も影響`;
  return `[\\C[3]${recoveryEffectName}:${icon1}100%(${extraEffectMsg})\\C[0]`;
}

//ジョブの追加説明文valueAddDescriptionClass
// Job description: `valueAddDescriptionClass` feeds the class screen and
// `valueClassGrowStatasComparison` the side-by-side list. The name-padding
// ladder, the seventeen-branch growth-stat lookup and the twice-pasted
// eight-stat expression are all data or one helper now.
class_addKaisetu1 = function () {
  for (let classId = 1; classId < $dataClasses.length; classId++) {
    const classData = $dataClasses[classId];
    if (classData.name == '') { continue; };
    const classMeta = classData.meta;
    let comparisonText = classComparisonName(classData.name);
    const growthStats = classGrowthStats(classMeta['Icon']);
    // `<classRank>` 0 means "unranked", which the original wrote as 1. A missing
    // tag yields NaN and stays NaN, as before.
    const rawRank = Number(classMeta['classRank']);
    const classRankVal = rawRank == 0 ? 1 : rawRank;
    const primaryClassLabel = `メイン`;
    const secondaryClassLabel = `サブ`;
    let descriptionText = classMeta['Primary Only'] ? `[\\C[1]${primaryClassLabel}\\C[0]]` : `[\\C[5]${secondaryClassLabel}\\C[0]]`;
    descriptionText += `[Class${CLASS_RANK_NUMERALS[classRankVal]}]`;
    const growthStatRow = growthStatText(growthStats, classRankVal);
    descriptionText += `[GrowStatas:${growthStatRow}]\n`;
    comparisonText += `:${growthStatRow}]`;
    // Read once: the original called $gameVariables.value(6) for every slot.
    const requiredPrimaryLevel = classMeta['Primary Only'] ? $gameVariables.value(6) : 0;
    for (let learningIndex = 0; learningIndex <= 10; learningIndex++) {
      const learning = classData.learnings[learningIndex];
      if (!learning) { continue; };
      // Main classes only list the skills the current playthrough has reached.
      if (classMeta['Primary Only'] && learning.level < requiredPrimaryLevel) { continue; };
      const levelLabel = `Lv`;
      descriptionText += `[${levelLabel}${learning.level}:\\C[2]\x1bSIN[${learning.skillId}]\\C[0]]`;
    };
    valueAddDescriptionClass[classId] = descriptionText;
    valueClassGrowStatasComparison[classId] = comparisonText;
  };
};

//}());
