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
// The constants below are the *values* a translator has to see. Everything
// around them — `\C[n]`, `\I[n]`, the `\x1b*` name codes, wrapper brackets, and
// pure-ASCII tokens such as `Rank:`, `TP`, `%` — stays in the template literal,
// so the string a translator edits reads as a word or a short phrase instead of
// mostly control-code noise, and the codes cannot be mangled by the translation
// pass. (The `//翻訳対象` markers the earlier generation carried were stripped from
// this file; the split into single-word literals is what makes them unnecessary.)
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
  // Read once: the original indexed the database twice per call, and this runs
  // inside the trait and effect loops.
  const state = $dataStates[stateId];
  return state.iconIndex >= 1 ? `\x1bI[${state.iconIndex}]` : `${state.name}`;
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
    if (passiveList[index] == stateId) { return true; }
  }
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
  }
  let text = ``;
  if (physical) { text += lifeStealText(`物理`, physical, resource, lossSuffix); }
  if (magical) { text += lifeStealText(`魔法`, magical, resource, lossSuffix); }
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
    case 3: {
      const specialAttackLabel = `特攻`;
      const specialAttackPart = ATTACK_AMPLIFY_ELEMENT_IDS.indexOf(statIndex) >= 0 ? specialAttackLabel : ``;
      return `${$dataSystem.elements[statIndex]}${specialAttackPart}${POWER_LABEL}`;
    }
    default: return undefined;
  }
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
}

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
// Trait code -> renderer, see TRAIT_HANDLERS below.
function describeTraitList(ctx) {
  if (!isTraitDatabaseType(ctx.databaseTypeId)) return;

  const traits = ctx.item.traits;
  if (!traits) return;
  const scannedTraitCount = Math.min(traits.length, MAX_TRAIT_SLOTS);
  for (let traitIndex = 0; traitIndex < scannedTraitCount; traitIndex++) {
    const trait = traits[traitIndex];
    if (!trait) continue;
    const traitHandler = TRAIT_HANDLERS[trait.code];
    if (traitHandler) traitHandler(ctx, trait, traitIndex);
  }
}

// `[分類:…][種別:…]` header of a weapon or armor entry, plus its rarity badge.
function describeEntryHeader(ctx) {
  const isEquipPage = ctx.databaseTypeId == DESCRIPTION_DATABASE_WEAPON
    || ctx.databaseTypeId == DESCRIPTION_DATABASE_ARMOR;
  if (!isEquipPage) return;

  const categoryLabel = `分類`;
  const typeLabel = `種別`;
  const categoryText = `[\\C[${ctx.colorCode}]${categoryLabel}\\C[0]:${$dataSystem.equipTypes[ctx.item.etypeId]}]`;
  ctx.headerText = categoryText + entryTypeText(ctx, typeLabel);
  appendLotteryRarityBadge(ctx);
}

// Weapon type on a weapon page, armor type on an armor page; id 0 means "none",
// which prints no `種別` row at all.
function entryTypeText(ctx, typeLabel) {
  const isWeaponPage = ctx.databaseTypeId == DESCRIPTION_DATABASE_WEAPON;
  const typeId = isWeaponPage ? ctx.item.wtypeId : ctx.item.atypeId;
  if (!(typeId >= 1)) return ``;
  const typeName = isWeaponPage ? $dataSystem.weaponTypes[typeId] : $dataSystem.armorTypes[typeId];
  return `[\\C[${ctx.colorCode}]${typeLabel}\\C[0]:${typeName}]`;
}

// `<LotteryRearity>`: the lottery rarity badge.
function appendLotteryRarityBadge(ctx) {
  const lotteryRarity = ctx.meta['LotteryRearity'];
  if (!lotteryRarity) return;
  ctx.headerText += `[\\I[517]:${Number(lotteryRarity)}]`;
}

//十種武器: ten weapon-type traits on one entry are summarised as `十種武器`.
function describeTenWeaponSummary(ctx) {
  if (!isTraitDatabaseType(ctx.databaseTypeId)) return;

  const traits = ctx.item.traits;
  const scannedTraitCount = Math.min(traits.length, TEN_WEAPON_SCAN_COUNT);
  for (let traitIndex = 0; traitIndex < scannedTraitCount; traitIndex++) {
    const weaponTrait = traits[traitIndex];
    if (weaponTrait && weaponTrait.code == TRAIT_CODE_WEAPON_TYPE) ctx.tenWeaponCount += 1;
  }
  if (ctx.tenWeaponCount < TEN_WEAPON_SUMMARY_COUNT) return;

  const weaponTypePrefix = colorTaggedText(ctx.colorCode, `武器種:`);
  ctx.effectText += `${weaponTypePrefix}十種武器 `;
}

//ステアップALLで纏める: a run of five or eight param-rate traits that all carry the
// same multiplier is collapsed into one line, so the eight individual rows are
// not printed. `calcTmp` counts the repeats.
function describeStatUpSummary(ctx) {
  if (!isTraitDatabaseType(ctx.databaseTypeId)) return;

  const traits = ctx.item.traits;
  ctx.effectValue = 0;
  ctx.calcTmp = 0;
  const scannedTraitCount = Math.min(traits.length, STAT_UP_TRAIT_SCAN_COUNT);
  for (let traitIndex = 0; traitIndex < scannedTraitCount; traitIndex++) {
    const statTrait = traits[traitIndex];
    if (!statTrait || statTrait.code != TRAIT_CODE_PARAM_RATE) continue;
    ctx.statUpCount += 1;
    // NOTE: the value this compares against is only ever assigned inside the
    // branch, so `calcTmp` never leaves 0 and `allStatUpText` always keeps the
    // percentage. Left as is on purpose: `effectValue` is scratch that later rows
    // of the same entry read, so seeding it here would change generated text.
    // See amygameDescription_review.md.
    if (ctx.effectValue == statTrait.value) {
      ctx.effectValue = statTrait.value;
      ctx.calcTmp += 1;
    }
  }

  const isUniform = ctx.calcTmp >= 2;
  if (ctx.statUpCount == STAT_UP_FIVE_COUNT && traits[4]) {
    ctx.effectText += allStatUpText(traits[4].value, `\\I[658]+`, `\\I[674]-`, isUniform);
  }
  if (ctx.statUpCount == STAT_UP_EIGHT_COUNT) {
    ctx.effectText += allStatUpText(traits[7].value, `\\I[659]+`, `\\I[675]-`, isUniform);
  }
}

//物理魔法ダメージカット: the physical and the magical damage-cut trait are summarised
// only when both are present *and* carry the same multiplier (a mismatched pair
// is listed row by row instead).
function describeDamageCutSummary(ctx) {
  if (!isTraitDatabaseType(ctx.databaseTypeId)) return;

  const traits = ctx.item.traits;
  const scannedTraitCount = Math.min(traits.length, DAMAGE_CUT_SCAN_COUNT);
  for (let traitIndex = 0; traitIndex < scannedTraitCount; traitIndex++) {
    const cutTrait = traits[traitIndex];
    if (!cutTrait || cutTrait.code != TRAIT_CODE_SPARAM_RATE) continue;
    if (DAMAGE_CUT_PARAM_IDS.indexOf(cutTrait.dataId) < 0) continue;
    if (ctx.damageCutIsFirst == 0) ctx.damageCutRef = cutTrait.value;
    if (ctx.damageCutIsFirst == 0 || ctx.damageCutRef == cutTrait.value) ctx.damageCutCount += 1;
    ctx.damageCutIsFirst += 1;
  }
  if (ctx.damageCutCount != DAMAGE_CUT_SUMMARY_COUNT) return;

  ctx.effectText += allStatUpText(traits[1].value, `\\I[654]\\I[655]-`, `\\I[638]\\I[639]+`, false);
}

// `<HSkillLearn>`: the learning conditions, one `[条件:…]` row per entry.
const PREMISE_SLOT_COUNT = 3;

function describeLearnPremises(ctx) {
  if (!ctx.meta['HSkillLearn']) return;

  const premiseTexts = [];
  for (let premiseIndex = 1; premiseIndex <= PREMISE_SLOT_COUNT; premiseIndex++) {
    appendPremiseText(ctx, premiseTexts, premiseIndex);
  }
  const noneLabel = `なし`;
  const coloredNoneLabel = `\\C[27]${noneLabel}\\C[0]`;
  const premiseText = premiseTexts.length ? premiseTexts.join(``) : coloredNoneLabel;
  ctx.effectText += `[${CONDITION_LABEL}:${premiseText}]`;
}

// The four `<Premise…N>` tags of one slot: skill, skill rank, variable,
// arrangement. Several can be set at once and they print in that order.
function appendPremiseText(ctx, premiseTexts, premiseIndex) {
  const premiseSkillId = ctx.meta['PremiseSkill' + premiseIndex];
  if (premiseSkillId) {
    const learnSuffix = `習得`;
    premiseTexts.push(`\\C[27]<${$dataSkills[Number(premiseSkillId)].name}>\\C[0]${learnSuffix}`);
  }

  const premiseSkillRank = ctx.meta['PremiseSkillRank' + premiseIndex];
  if (premiseSkillRank) {
    const rankValues = splitMetaValues(premiseSkillRank);
    const reachSuffix = `到達`;
    const rankSkillName = $dataSkills[Number(rankValues[0])].name;
    premiseTexts.push(`\\C[27]<${rankSkillName}>\\C[0]${RANK_LABEL}:\\C[27]${Number(rankValues[1])}\\C[0]${reachSuffix}`);
  }

  const premiseVariable = ctx.meta['PremiseVariable' + premiseIndex];
  if (premiseVariable) {
    const variableValues = splitMetaValues(premiseVariable);
    const variableName = premiseVariableName(Number(variableValues[0]));
    premiseTexts.push(`\\C[27]${variableName}\\C[0]:\\C[27]${Number(variableValues[1])}\\C[0]${OR_MORE_SUFFIX}`);
  }

  const premiseArrangement = ctx.meta['PremiseArrangement' + premiseIndex];
  if (premiseArrangement) {
    const arrangementValues = splitMetaValues(premiseArrangement);
    const arrangementName = valueHentaiArrangement[Number(arrangementValues[0])];
    premiseTexts.push(`\\C[27]${arrangementName}\\C[0]:\\C[27]${Number(arrangementValues[1])}\\C[0]${OR_MORE_SUFFIX}`);
  }
}

// Variable names are stored with a label-like padding (`変数1　:名前`) that the
// note prints without. The original stripped up to three ideographic spaces, then
// one space and one colon — five sequential first-occurrence replaces, not a
// global one.
function premiseVariableName(variableId) {
  return `${$dataSystem.variables[variableId]}`
    .replace("　", "").replace("　", "").replace("　", "")
    .replace(" ", "").replace(":", "");
}

// `<DescriptionWord>`: the one-line summary shown under the entry name. Lust
// skills print it in the lust colour.
function describeDescriptionWord(ctx) {
  const descriptionWord = ctx.meta['DescriptionWord'];
  if (!descriptionWord) return;
  ctx.fragText = `${descriptionWord}`;
  const isLustSkill = ctx.databaseTypeId == DESCRIPTION_DATABASE_SKILL
    && ctx.item.stypeId == AUTO_EQUIP_LUST_SKILL_TYPE_ID;
  const colorCode = isLustSkill ? LUST_COLOR_CODE : ctx.colorCode;
  // `[` / `]` sit inside the colour span, so this is a plain colorTaggedText wrap.
  ctx.descWordText = `${colorTaggedText(colorCode, `[${ctx.fragText}]`)} `;
}

// `<GunDamage>`: the fixed damage value of gun weapons.
function describeFixedDamageTag(ctx) {
  const gunDamage = ctx.meta['GunDamage'];
  if (!gunDamage) return;
  ctx.effectValue = gunDamage;
  ctx.effectText += `[${FIXED_VALUE_TEXT}:${ctx.effectValue}] `;
}

function describeSkillHeaderTags(ctx) {
  appendAutoEquipBadge(ctx);
  appendSkillTierBadge(ctx);
  appendOccasionBadge(ctx);

  if (ctx.meta['SaveShare']) ctx.headerText += `\\I[15]`;
  if (ctx.meta['MCharacterLearn']) ctx.headerText += `\\I[14]`;

  appendTurnActionBadge(ctx);
  appendScopeLabel(ctx);
  appendMultipleElements(ctx);
  // `<Custom Cooldown Mastery Formula>`, `<Custom MP Cost Mastery Formula>` and
  // `<Mastery Effect>` carry no description text; the original had an empty block
  // with two commented-out lines here.
  appendSelectConditionTag(ctx);
  appendSkillLearningClassTag(ctx);
  appendLimitUsesTag(ctx);
  appendLustItemTag(ctx);
}

// The lust skills (skill type 15) are badged in the lust colour.
function badgeColorCode(ctx) {
  return ctx.item.stypeId == AUTO_EQUIP_LUST_SKILL_TYPE_ID ? LUST_COLOR_CODE : ctx.colorCode;
}

// `<Unequippable>` on an equippable skill type: the `<自動>` badge in the header.
function appendAutoEquipBadge(ctx) {
  if (!ctx.meta['Unequippable']) return;
  if (EQUIPPED_SKILL_TYPE_IDS.indexOf(ctx.item.stypeId) < 0) return;
  ctx.fragText = `<自動>`;
  ctx.headerText += colorTaggedText(badgeColorCode(ctx), ctx.fragText);
}

// `<Skill Tier>`: equipped enchant tier, i.e. an icon plus its tier name.
function appendSkillTierBadge(ctx) {
  const skillTier = ctx.meta['Skill Tier'];
  if (!skillTier) return;

  ctx.effectValue = Number(skillTier.replace(' ', ''));
  if (ctx.effectValue >= 1) {
    const tierIcon = `\x1bI[${Yanfly.Icon.ESTier[ctx.effectValue]}]`;
    ctx.effectValue = `${tierIcon}${Yanfly.Param.ESTierName[ctx.effectValue]}>`;
  }
  ctx.fragText = `<装着:${ctx.effectValue}`;
  ctx.headerText += `${colorTaggedText(badgeColorCode(ctx), ctx.fragText)} `;
}

// `occasion` -> the "where can this be used" icon. Items always show it, skills
// only for the battle skill types; an entry flagged as battle-map information
// hides it.
function appendOccasionBadge(ctx) {
  const isItemPage = ctx.databaseTypeId == DESCRIPTION_DATABASE_ITEM;
  const isBattleSkill = ctx.databaseTypeId == DESCRIPTION_DATABASE_SKILL
    && BATTLE_SKILL_TYPE_IDS.indexOf(ctx.item.stypeId) >= 0;
  if (!isItemPage && !isBattleSkill) return;
  if (ctx.item.occasion && ctx.meta['BattleMapInformation']) return;

  ctx.fragText = OCCASION_ICONS[ctx.item.occasion] || OCCASION_ICONS[0];
  ctx.headerText += colorTaggedText(ctx.colorCode, ctx.fragText);
}

// `<scope>` for the skill types that announce their target.
function appendScopeLabel(ctx) {
  if (ctx.item.scope < 1) return;
  if (BATTLE_SKILL_TYPE_IDS_WITH_SCOPE.indexOf(ctx.item.stypeId) < 0) return;
  ctx.fragText = SCOPE_LABELS[ctx.item.scope];
  const scopeLabelText = `<${ctx.fragText}>`;
  ctx.headerText += `${colorTaggedText(SCOPE_COLOR_CODE, scopeLabelText)} `;
}

// `<Turn Action>`: the skill resolves at the end of the turn, unless `<Instant>`.
function appendTurnActionBadge(ctx) {
  if (ctx.databaseTypeId != DESCRIPTION_DATABASE_SKILL) return;
  if (TURN_ACTION_SKILL_TYPE_IDS.indexOf(ctx.item.stypeId) < 0) return;
  if (ctx.meta['Instant']) return;
  const turnActionText = `ターン行動`;
  ctx.headerText += `${colorTaggedText(TURN_ACTION_COLOR_CODE, `<${turnActionText}>`)} `;
}

// `<Multiple Elements>`: one element label per id, collected in `skillElementText`
// because later rows append to the same list.
function appendMultipleElements(ctx) {
  const multipleElements = ctx.meta['Multiple Elements'];
  if (!multipleElements) return;

  const elementIds = splitMetaValues(multipleElements);
  for (const elementId of elementIds) {
    ctx.skillElementText += colorTaggedText(ctx.colorCode, elementLabel(elementId));
  }
  const elementListLabel = `属性:`;
  ctx.headerText += `[${elementListLabel}${ctx.skillElementText}] `;
}

// `<Select Conditions>`: the skill only targets the front row.
function appendSelectConditionTag(ctx) {
  if (!ctx.meta['Select Conditions']) return;
  const frontGuardOnlyText = `対象前衛のみ`;
  ctx.headerText += `[${colorTaggedText(ctx.colorCode, frontGuardOnlyText)}] `;
}

// `<SkillLearningClass>`: the class name (a name code, i.e. other game text, so it
// stays outside the translatable string) followed by `習得`. Class id 100 means
// "no class" and prints nothing.
function appendSkillLearningClassTag(ctx) {
  const learningClassId = ctx.meta['SkillLearningClass'];
  if (!learningClassId) return;

  ctx.effectValue = `${$dataSystem.skillTypes[ctx.item.stypeId]}`;
  ctx.fragText = Number(learningClassId);
  if (ctx.fragText == 100) return;

  const learnNameCode = `\x1bJ[${ctx.fragText}]`;//名前コード。翻訳対象外
  const learnText = `習得`;
  ctx.effectText += `[${colorTaggedText(ctx.colorCode, ctx.effectValue)}] [${colorTaggedText(ctx.colorCode, learnNameCode)}${learnText}] `;
}

// `<Limit Uses>`: per day, or per battle when `<Not Recover All Uses>` is set.
function appendLimitUsesTag(ctx) {
  const limitUses = ctx.meta['Limit Uses'];
  if (!limitUses) return;

  ctx.fragText = Number(limitUses);
  // `<Not Recover All Uses>` always comes with `<After Battle Uses Recover: 0>`.
  const usesText = ctx.meta['Not Recover All Uses']
    ? `1日${ctx.fragText}回`
    : `戦闘中${ctx.fragText}回`;
  ctx.headerText += `[${colorTaggedText(ctx.colorCode, usesText)}] `;
}

// `<SeiyokuItem>`: the lust-item badge, items only.
function appendLustItemTag(ctx) {
  if (ctx.databaseTypeId != DESCRIPTION_DATABASE_ITEM || !ctx.meta['SeiyokuItem']) return;
  const lustItemText = `性欲品`;
  ctx.effectText += `[${colorTaggedText(LUST_COLOR_CODE, lustItemText)}] `;
}


// `<DamageFormula2>:formulaId,value,multiplier`: the damage blurb. Ids 8, 9 and
// 10 are built from their own fields and id 31 has no blurb at all, so the table
// below covers the remaining twenty-three.
function describeDamageFormula(ctx) {
  ctx.colorCode = DESCRIPTION_DEFAULT_COLOR_CODE;
  const damageFormula = ctx.meta['DamageFormula2'];
  if (!damageFormula) return;

  ctx.metaValues = splitMetaValues(damageFormula);
  const formulaId = Number(ctx.metaValues[0]);
  switch (formulaId) {
    case 8: ctx.fragText = recoveryEffectMsg(36, 36); break;
    case 9: ctx.fragText = recoveryEffectMsg(34, 35); break;
    case 10: ctx.fragText = hpCostDamageFormulaText(ctx); break;
    default:
      // Id 31 (skill 373 "ルビフリップ") is in no table: no branch assigns, so
      // `fragText` still holds whatever an earlier row of this run left behind.
      // The original behaves the same way and the note it produces is kept as is;
      // the lookup only makes sure an unknown id cannot assign a value.
      if (DAMAGE_FORMULA_TEXT[formulaId]) {
        ctx.fragText = `[\\C[${ctx.colorCode}]${DAMAGE_FORMULA_TEXT[formulaId]}\\C[0]`;
      }
      break;
  }
  appendDamageFormulaSuffix(ctx);

  if (ctx.meta['LevelFluctuation']) {
    const levelFluctuation = ctx.meta['LevelFluctuation'];
    ctx.suffixText += `[${levelFluctuation}ﾚﾍﾞﾙ毎に威力+]`;
  }
}

// Id 10: `[現在HPの<n>%消費して×<m>倍の与ダメ`.
function hpCostDamageFormulaText(ctx) {
  const absorbPercent = ctx.metaValues[1];
  const damageMultiplier = ctx.metaValues[2];
  const hpCostText = `現在HPの${absorbPercent}%消費して×${damageMultiplier}倍の与ダメ`;
  return `[\\C[${ctx.colorCode}]${hpCostText}\\C[0]`;
}

// The multiplier, the flat bonus and the unique-skill note, closed with `]` unless
// one of the branches already did that.
function appendDamageFormulaSuffix(ctx) {
  if (!ctx.fragText) return;

  if (ctx.metaValues[2] >= 0) { ctx.fragText += ` \\C[${ctx.colorCode}]×${ctx.metaValues[2]}\\C[0]] `; }
  if (ctx.metaValues[1] >= 1) { ctx.fragText += `\\I[666]:${ctx.metaValues[1]}`; }
  // Unique skills (type 12) scale with the equipped weapon, which cannot be
  // identified from here, so the weapon row is marked invalid.
  if (ctx.databaseTypeId == DESCRIPTION_DATABASE_SKILL && ctx.item.stypeId == BURST_SKILL_TYPE_ID) {
    ctx.fragText += ('+' + (ctx.meta['ユニーク'] ? `強化段階` : `装備レア度`));
  }
  ctx.suffixText += `${ctx.fragText} `;//元文章の後に追記される。
}

// `<PotionUsePoint>`: the restored resource comes from the damage element of the
// entry, so one table replaces the two equality checks.
const POTION_RECOVERY_RESOURCES = { 3: `HP`, 4: `MP` };//HP回復 / MP回復
function describePotionRecoveryTag(ctx) {
  const damageType = ctx.item.damage ? ctx.item.damage.type : 0;
  if (damageType < 1) return;
  if (!ctx.meta['PotionUsePoint']) return;

  // A damage type that is not a healing element leaves whatever resource name the
  // previous entry had put in `fragText`, as the original did.
  ctx.fragText = POTION_RECOVERY_RESOURCES[damageType];
  if (!ctx.fragText) return;

  // Anything below 2 means "all of it".
  const usePoint = Number(ctx.meta['PotionUsePoint']);
  ctx.effectValue = usePoint >= 2 ? usePoint : `全`;
  const recoveryText = `回復`;
  // No colorTaggedText here: the colour of the resource name has to run into the
  // `\C[3]` amount, so the two codes are not a complete wrap.
  ctx.effectText += `[\\C[${ctx.colorCode}]${ctx.fragText}\\C[3]${ctx.effectValue}\\C[0]${recoveryText}]`;
}

// `<Repeat>` / `<Warmup>` / `<Cooldown>`: `\I[icon]:value `.
const SKILL_VALUE_ICON_ROWS = [
  { metaKey: 'Repeat', iconId: 668 },
  { metaKey: 'Warmup', iconId: 662 },
  { metaKey: 'Cooldown', iconId: 663 }
];
const MASTERY_RANK_ICON_ID = 664;
const MASTERY_MAX_ICON_ID = 665;

function describeSkillRowTags(ctx) {
  appendSkillStateTag(ctx);
  appendPotionResistTag(ctx);
  appendSpeedRow(ctx);
  for (const iconRow of SKILL_VALUE_ICON_ROWS) {
    appendSkillValueIconRow(ctx, iconRow.metaKey, iconRow.iconId);
  }
  appendRankUpPointRow(ctx);
  appendSkillValueIconRow(ctx, 'Max Mastery Level', MASTERY_MAX_ICON_ID);
  appendTpGainRow(ctx);
}

// `<SkillStateAddRemove>`: the state the skill adds or removes, as a name code.
function appendSkillStateTag(ctx) {
  const stateId = ctx.meta['SkillStateAddRemove'];
  if (!stateId) return;
  ctx.fragText = Number(stateId);
  const stateNameCode = `\x1bSIM[${ctx.fragText}]`;//ステート名コード。翻訳対象外
  const grantRemoveText = `付与/解除`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${stateNameCode}\\C[0]${grantRemoveText}]`;
}

// `<PotionResist>`: the potion resistance percentage.
function appendPotionResistTag(ctx) {
  const potionResist = ctx.meta['PotionResist'];
  if (!potionResist) return;
  ctx.fragText = Number(potionResist);
  ctx.effectText += `[\\I[624]+${ctx.fragText}%]`;
}

// `speed` is a core field, not a notetag.
function appendSpeedRow(ctx) {
  if (ctx.item.speed == 0) return;
  ctx.fragText = ctx.item.speed;
  const speedLabel = `Speed`;
  ctx.effectText += `\\C[${ctx.colorCode}]${speedLabel}\\C[0]:${ctx.fragText} `;
}

// Generic `\I[icon]:value ` row.
function appendSkillValueIconRow(ctx, metaKey, iconId) {
  const metaValue = ctx.meta[metaKey];
  if (!metaValue) return;
  ctx.fragText = Number(metaValue);
  ctx.effectText += `\\I[${iconId}]:${ctx.fragText} `;
}

// `<RankUpPoint>`: the mastery point value, marked as per-rank when the entry has
// more than one mastery level. (`\I[664]:Rank*Exp`, the row the original
// commented out here, is redundant and stays unused.)
function appendRankUpPointRow(ctx) {
  const rankUpPoint = ctx.meta['RankUpPoint'];
  if (!rankUpPoint) return;
  ctx.fragText = Number(rankUpPoint);
  const maxMasteryLevel = ctx.meta['Max Mastery Level'];
  if (!maxMasteryLevel) return;

  const rankSuffix = Number(maxMasteryLevel) == 1 ? `` : `*${RANK_LABEL}`;
  ctx.effectText += `\\I[${MASTERY_RANK_ICON_ID}]:${ctx.fragText}${rankSuffix} `;
}

// `tpGain` is a core field.
function appendTpGainRow(ctx) {
  if (ctx.item.tpGain == 0) return;
  ctx.fragText = ctx.item.tpGain;
  ctx.effectText += `\\C[${ctx.colorCode}]${TP_LABEL}\\C[0]:${ctx.fragText}\\C[10]↑\\C[0] `;
}

const ADDITIONAL_SET_SLOT_COUNT = 9;
const ADDITIONAL_SET_TARGET_COUNT = 4;
// `<additionalSet1>` .. `<additionalSet9>`, resolved once.
const ADDITIONAL_SET_META_KEYS = (function () {
  const metaKeys = [];
  for (let additionalSetSlot = 1; additionalSetSlot <= ADDITIONAL_SET_SLOT_COUNT; additionalSetSlot++) {
    metaKeys.push('additionalSet' + additionalSetSlot);
  }
  return metaKeys;
})();

function describeAdditionalSets(ctx) {
  // One open-ended prefix per target index: the row is closed by the `付与` line
  // further down.
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
  // per slot; the icon is a helper now and the target is just an index.
  for (const additionalSetKey of ADDITIONAL_SET_META_KEYS) {
    const additionalSetMeta = ctx.meta[additionalSetKey];
    if (!additionalSetMeta) continue;

    const additionalSetValues = splitMetaValues(additionalSetMeta);
    const targetIndex = Number(additionalSetValues[0]);
    if (targetIndex < 1 || targetIndex > ADDITIONAL_SET_TARGET_COUNT) continue;
    ctx.additionalSetCountByTarget[targetIndex] += 1;
    if (Number(additionalSetValues[1]) != 1) continue;

    const stateId = Number(additionalSetValues[3]);
    const stackCount = Number(additionalSetValues[2]);
    ctx.additionalSetTextByTarget[targetIndex] += additionalSetStateIcon(stateId, stackCount);
  }

  // A target whose slots all lacked the flag still bumps its count, so the line
  // below prints an empty `付与` for it — that is the original behaviour.
  for (let targetIndex = 1; targetIndex <= ADDITIONAL_SET_TARGET_COUNT; targetIndex++) {
    if (ctx.additionalSetCountByTarget[targetIndex] < 1) continue;
    const additionalSetGrantText = `付与`;
    ctx.effectText += `${ctx.additionalSetTextByTarget[targetIndex]}${additionalSetGrantText}\\C[0]] `;
  }
}

// Effect codes 11/12/13 are the HP/MP/TP recovery rows and 21/22 the state
// add/remove rows. Each was written out twice (percentage field plus flat field)
// or once per state id by scanning the whole state list; only one `code` can match
// per effect, so this is a single dispatch.
const EFFECT_CODE_STATE_ADD = 21;
const EFFECT_CODE_STATE_REMOVE = 22;
const EFFECT_CODE_TP_RECOVER = 13;
const MAX_EFFECT_SLOTS = 20;
const BATTLE_STATE_ID_RANGE = { first: BATTLE_STATE_ICON_FIRST_ID, last: BATTLE_STATE_ICON_FIRST_ID + BATTLE_STATE_ICONS.length - 1 };

function describeEffectRows(ctx) {
  const effects = ctx.item.effects;
  if (!effects) return;
  const scannedEffectCount = Math.min(effects.length, MAX_EFFECT_SLOTS);
  for (let effectIndex = 0; effectIndex < scannedEffectCount; effectIndex++) {
    const effect = effects[effectIndex];
    if (!effect) continue;
    switch (effect.code) {
      case EFFECT_CODE_STATE_ADD: describeStateAddEffect(ctx, effect); break;
      case EFFECT_CODE_STATE_REMOVE: describeStateRemoveEffect(ctx, effect); break;
      default: describeRecoveryEffect(ctx, effect); break;
    }
  }
}

// 11/12/13: `[\\C[n]\\I[icon]:value%↑\\C[0]]` for the percentage field and
// `[\\C[n]\\I[icon]:value\\C[0]]` for the flat one. TP has no flat field and shows
// the direction instead.
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

// The state of an effect, or null when the id points outside the database.
function effectState(stateId) {
  if (stateId < 1 || stateId > $dataStates.length - 1) return null;
  return $dataStates[stateId];
}

// 22: `[\\C[3]解除:\\C[0]state]`, with the removal chance when it is not 100%.
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
  const isBattleState = effect.dataId >= BATTLE_STATE_ID_RANGE.first
    && effect.dataId <= BATTLE_STATE_ID_RANGE.last;
  const turnText = !isBattleState && state.autoRemovalTiming >= 1 ? stateTurnText(state) : ``;
  const grantPercent = Math.round(effect.value1 * 100);
  const grantLabel = `付与`;
  const grantChanceText = grantPercent == 100 ? `` : `${grantPercent}%`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${grantLabel}:\\C[0]${stateIconText(effect.dataId)}${grantChanceText}${turnText}]`;
}

// `<minTurns>t` or `<minTurns>～<maxTurns>t`.
function stateTurnText(state) {
  return state.minTurns == state.maxTurns
    ? ` ${state.minTurns}t`
    : ` ${state.minTurns}～${state.maxTurns}t`;
}


function describeClearCountTags(ctx) {
  appendDispelCountTag(ctx);
  appendAilmentClearTag(ctx);
  appendClearCountPlusTags(ctx);
}

// `<dispelCount>`: `強化状態<n>つ消去`.
function appendDispelCountTag(ctx) {
  const dispelCount = ctx.meta['dispelCount'];
  if (!dispelCount) return;

  ctx.fragText = Number(dispelCount);
  const dispelStateText = `強化状態`;
  const dispelCountSuffix = `つ`;
  const dispelActionText = `消去`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${dispelStateText}\\C[3]${ctx.fragText}${dispelCountSuffix}`
    + `\\C[${ctx.colorCode}]${dispelActionText}\\C[0]]`;
}

// `<abNomalClearCount>`: the ailment recovery count. `<StateabNomalOnly>` drops
// the second icon, i.e. the "special" ailment sheet.
function appendAilmentClearTag(ctx) {
  const clearCount = ctx.meta['abNomalClearCount'];
  if (!clearCount) return;

  ctx.fragText = Number(clearCount);
  const clearCountSuffix = `つ`;
  const clearRecoverText = `回復`;
  const clearIcons = ctx.meta['StateabNomalOnly'] ? `\\I[683]` : `\\I[683]\\I[684]`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${clearIcons}\\C[3]${ctx.fragText}${clearCountSuffix}`
    + `\\C[${ctx.colorCode}]${clearRecoverText}\\C[0]]`;
}

// `<abNomalClearCountPlus>` / `<dispelCountPlus>`: the two "scaled by Magic/300"
// rows.
function appendClearCountPlusTags(ctx) {
  if (ctx.meta['abNomalClearCountPlus']) {
    const ailmentRecoveryText = `状態異常回復数+(Magic/300)`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${ailmentRecoveryText}\\C[0]]`;
  }
  if (ctx.meta['dispelCountPlus']) {
    const buffRemovalText = `強化解除数+(Magic/300)`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${buffRemovalText}\\C[0]]`;
  }
}

function describePassiveTags(ctx) {
  appendPassiveStateTag(ctx);
  appendElementAmplifyRows(ctx);
}

//パッシブステート: `<Passive State>` prints `付与` plus the state name code, or
// `特殊効果付与` when that state is a `<SpcialState>`. `<パッシブ隠蔽>` hides the row.
function appendPassiveStateTag(ctx) {
  const passiveStateId = ctx.meta['Passive State'];
  if (!passiveStateId || ctx.meta['パッシブ隠蔽']) return;

  const passiveState = $dataStates[Number(passiveStateId)];
  const grantLabel = passiveState && passiveState.meta['SpcialState'] ? `特殊効果付与` : `付与`;
  ctx.effectText += `\\C[${ctx.colorCode}]${grantLabel}\\C[0]<\x1bSIM[${Number(passiveStateId)}]> `;
}

//属性威力加算: `<Element Amplify N>` -> `…威力<value> `, one row per element.
// The tag names are cached: building `'Element Amplify ' + id` inside the loop
// allocated forty strings for every entry that reached this row.
let elementAmplifyKeys = [];

function elementAmplifyMetaKeys() {
  const elementCount = $dataSystem.elements.length - 1;
  if (elementAmplifyKeys.length == elementCount) return elementAmplifyKeys;
  elementAmplifyKeys = [];
  for (let elementId = 1; elementId <= elementCount; elementId++) {
    elementAmplifyKeys.push('Element Amplify ' + elementId);
  }
  return elementAmplifyKeys;
}

function appendElementAmplifyRows(ctx) {
  const amplifyKeys = elementAmplifyMetaKeys();
  for (let keyIndex = 0; keyIndex < amplifyKeys.length; keyIndex++) {
    const amplifyValue = ctx.meta[amplifyKeys[keyIndex]];
    if (!amplifyValue) continue;
    ctx.effectText += `${elementAmplifyLabel(keyIndex + 1)}${amplifyValue.replace(' ', '')} `;
  }
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
    const resistValue = ctx.meta[resistRow.metaKey];
    if (!resistValue) continue;
    ctx.effectValue = resistValue;
    appendResistRow(ctx, resistRow, resistValue);
  }
  appendDispelGuardTag(ctx);
  appendLevelUpRecoverAllTag(ctx);
}

// `<DispelGuard>`: the buff removal immunity.
function appendDispelGuardTag(ctx) {
  if (!ctx.meta['DispelGuard']) return;
  const dispelGuardText = `強化消去無効`;
  ctx.effectText += `${colorTaggedText(ctx.colorCode, dispelGuardText)} `;
}

// `<Level Up Recover All>`: full recovery on level up.
function appendLevelUpRecoverAllTag(ctx) {
  if (!ctx.meta['Level Up Recover All']) return;
  const levelUpRecoverAllText = `LvUp時に全回復`;
  ctx.effectText += `[${colorTaggedText(16, levelUpRecoverAllText)}]`;
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
// `<SpcialState>` (activation / expiry state names), `<activateRate>`,
// `<activatePoint>` and `<Global Cooldown>` all describe the MP trigger.
function describeSpecialStateTags(ctx) {
  appendSpecialStateTrigger(ctx);
  appendActivateRateTag(ctx);
  appendActivatePointTag(ctx);
  appendGlobalCooldownTag(ctx);
}

// `<SpcialState>`: the state that switches the effect on, and the one that ends
// it. The two `\x1bSIM[n]` codes expand to *state names*, i.e. to other game
// text, so they stay outside the translatable strings.
function appendSpecialStateTrigger(ctx) {
  if (!ctx.meta['SpcialState']) return;

  const activationStateIcon = `\x1bSIM[110]`;//ステート名コード。翻訳対象外
  const activationText = `で発動`;
  const expiryStateIcon = `\x1bSIM[109]`;//ステート名コード。翻訳対象外
  const expiryText = `で効果消失`;
  ctx.suffixText += `[${colorTaggedText(ctx.colorCode, activationStateIcon + activationText)}][${expiryStateIcon}${expiryText}]`;

  const activationConditionText = `行動時MP消費/消費MP未満で`;
  const grantText = `付与`;
  ctx.effectText += `[${colorTaggedText(ctx.colorCode, `${activationConditionText}\\I[252]${grantText}`)}]`;
}

// `<activateRate>`: the MP trigger chance.
function appendActivateRateTag(ctx) {
  if (!ctx.meta['activateRate']) return;
  ctx.effectValue = Math.round(ctx.meta['activateRate'] * 100);
  const consumeMpText = `消費MP:MMP`;
  ctx.suffixText += `[${consumeMpText}${colorTaggedText(10, `${ctx.effectValue}%`)}]`;
}

// `<activatePoint>`: unused in this database, kept for compatibility.
function appendActivatePointTag(ctx) {
  if (!ctx.meta['activatePoint']) return;
  ctx.effectValue = ctx.meta['activatePoint'];
  const consumeMpLabel = `消費MP:`;
  ctx.suffixText += `[${consumeMpLabel}${colorTaggedText(2, `${ctx.effectValue}`)}]`;
}

// `<Global Cooldown>`: the cooldown applied to every skill.
function appendGlobalCooldownTag(ctx) {
  if (!ctx.meta['Global Cooldown']) return;
  ctx.effectValue = Number(ctx.meta['Global Cooldown']);
  const allCooldownLabel = `全てのCT:`;
  ctx.suffixText += `[${allCooldownLabel}${colorTaggedText(2, `${ctx.effectValue}`)}]`;
}

function describeCooldownAndDrainTags(ctx) {
  appendSkillTypeCooldownRows(ctx);
  appendLifeStealRows(ctx);
  appendRankMaxLearningTag(ctx);
  appendTrapAndSemenTags(ctx);
  appendHstaSuppressionTag(ctx);
  appendGainRows(ctx);
  appendSkillTierSlotRows(ctx);
  ctx.colorCode = DESCRIPTION_DEFAULT_COLOR_CODE;
}

// `<SType N Cooldown|Warmup>`: one row per skill type, red when negative.
const SKILL_TYPE_COUNT = 15;
const COOLDOWN_ROW_KINDS = [[`Cooldown`, 663], [`Warmup`, 662]];

// `<SType N Cooldown|Warmup>`: one row per skill type, red when negative. The tag
// names and their skill type are resolved once, at load time.
const COOLDOWN_ROWS = (function () {
  const cooldownRows = [];
  for (let skillTypeId = 1; skillTypeId <= SKILL_TYPE_COUNT; skillTypeId++) {
    for (const [metaSuffix, iconId] of COOLDOWN_ROW_KINDS) {
      cooldownRows.push({ metaKey: `SType ${skillTypeId} ${metaSuffix}`, skillTypeId: skillTypeId, iconId: iconId });
    }
  }
  return cooldownRows;
})();

function appendSkillTypeCooldownRows(ctx) {
  const skillTypes = $dataSystem.skillTypes;
  for (const cooldownRow of COOLDOWN_ROWS) {
    const cooldownValue = ctx.meta[cooldownRow.metaKey];
    if (!cooldownValue) continue;
    const cooldownColorCode = Number(cooldownValue) < 0 ? 3 : 1;
    ctx.effectText += `[${skillTypes[cooldownRow.skillTypeId]}\\C[${cooldownColorCode}]`
      + `\\I[${cooldownRow.iconId}]${Number(cooldownValue)}\\C[0]]`;
  }
}

// The life-steal rows are printed in the default colour. The original re-assigned
// it before every call; nothing in between changes it, so once is enough.
function appendLifeStealRows(ctx) {
  ctx.colorCode = DESCRIPTION_DEFAULT_COLOR_CODE;
  ctx.effectText += lifeStealGroupText(ctx.meta, `HP`, `反動ﾀﾞﾒｰｼﾞ`);
  ctx.effectText += lifeStealGroupText(ctx.meta, `MP`, `消耗`);
  describeLifeStealRows(ctx);
}

// `<RankMaxLearning>`: the skill only becomes learnable at rank max. Summons
// (skill type 11) are excluded — they already have a premise skill.
const SUMMON_SKILL_TYPE_ID = 11;
const MASTERY_LEVEL_FOR_RANK_TEXT = 2;

function appendRankMaxLearningTag(ctx) {
  if (!ctx.meta['RankMaxLearning']) return;
  if (ctx.item.stypeId == SUMMON_SKILL_TYPE_ID) return;

  const hasRanks = Number(ctx.meta['Max Mastery Level']) >= MASTERY_LEVEL_FOR_RANK_TEXT;
  const learnText = hasRanks ? `RankMaxで習得が可能になる` : `熟練度Maxで習得が可能になる`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${learnText}\\C[0]]`;
}

// `<trapEvasion>` and `<SemenRemove>`, both in the lust colour.
const SEMEN_REMOVE_COLOR_CODE = 27;

function appendTrapAndSemenTags(ctx) {
  if (ctx.meta['trapEvasion']) {
    const trapEvasionText = `引っ掛かったトラップを自動で回避する`;
    ctx.effectText += `[\\C[${ctx.colorCode}]${trapEvasionText}\\C[0]]`;
  }
  const semenRemove = ctx.meta['SemenRemove'];
  if (!semenRemove) return;

  ctx.colorCode = SEMEN_REMOVE_COLOR_CODE;
  ctx.effectValue = Number(semenRemove);
  const semenRemoveText = `状態異常精液${ctx.effectValue}つ回復`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${semenRemoveText}\\C[0]]`;
}

// `<HstaSuppression:0|variableId,value>`: the lust-stat ceiling. Field 0 selects
// the fixed desire/development text, anything else a rank variable's name.
function appendHstaSuppressionTag(ctx) {
  const hstaSuppression = ctx.meta['HstaSuppression'];
  if (!hstaSuppression) return;

  ctx.colorCode = SEMEN_REMOVE_COLOR_CODE;
  ctx.metaValues = hstaSuppression.split(',');
  ctx.effectValue = Number(ctx.metaValues[1]);
  const desireValue = ctx.effectValue * 100;
  const desireLimitText = `性欲度${desireValue}まで`;
  const developmentLimitText = `各開発/経験度${ctx.effectValue}まで`;
  if (Number(ctx.metaValues[0]) == 0) {
    ctx.effectText += `[\\C[${ctx.colorCode}]${desireLimitText}\\C[0]][\\C[${ctx.colorCode}]${developmentLimitText}\\C[0]]`;
    return;
  }
  const rankVariableName = $dataSystem.variables[Number(ctx.metaValues[0])];
  const rankLimitText = `のランク${ctx.effectValue}まで`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${rankVariableName}${rankLimitText}\\C[0]]`;
}

// `<TPGain1>` and `<gainExp>`.
function appendGainRows(ctx) {
  ctx.colorCode = DESCRIPTION_DEFAULT_COLOR_CODE;
  const tpGain = ctx.meta['TPGain1'];
  if (tpGain) {
    ctx.effectValue = tpGain;
    ctx.effectText += `[\\C[${ctx.colorCode}]${TP_LABEL}${ctx.effectValue}%\\C[0]]`;
  }
  const gainExp = ctx.meta['gainExp'];
  if (!gainExp) return;

  ctx.effectValue = gainExp;
  const gainExpLabel = `獲得Exp`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${gainExpLabel}:${ctx.effectValue}%\\C[0]]`;
}

// `<Skill Tier N Slots>`: how many enchant slots the entry uses per tier.
const SKILL_TIER_SLOT_COUNT = 6;
// `<Skill Tier 1 Slots>` .. `<Skill Tier 6 Slots>`, index 0 left unused.
const SKILL_TIER_SLOT_META_KEYS = [``, `Skill Tier 1 Slots`, `Skill Tier 2 Slots`,
  `Skill Tier 3 Slots`, `Skill Tier 4 Slots`, `Skill Tier 5 Slots`, `Skill Tier 6 Slots`];
const SKILL_TIER_SLOT_COLOR_CODE = 16;

function appendSkillTierSlotRows(ctx) {
  for (let tierIndex = 1; tierIndex <= SKILL_TIER_SLOT_COUNT; tierIndex++) {
    const tierSlots = ctx.meta[SKILL_TIER_SLOT_META_KEYS[tierIndex]];
    if (!tierSlots) continue;
    ctx.effectText += `[\\C[${SKILL_TIER_SLOT_COLOR_CODE}]${SKILL_TIER_SLOT_LABELS[tierIndex]}\\C[2]${tierSlots.replace(' ', '')}\\C[0]]`;
  }
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

    const conditionValues = conditionRow.splitMeta ? splitConditionValues(ctx, conditionMeta) : null;
    const conditionText = conditionRow.build(ctx, conditionValues);
    if (!conditionText) continue;
    // `\\C[c][条件:body\\C[0]` — the bracket sits inside the colour code, so the row
    // is not a plain colorTaggedText wrap.
    ctx.effectText += `\\C[${ctx.colorCode}][${CONDITION_LABEL}:${conditionText}]\\C[0]`;
  }
}

// The comma separated condition tags. `ctx.metaValues` is still written: a later
// row of the same entry reads whatever the last condition left in the scratch.
function splitConditionValues(ctx, conditionMeta) {
  const conditionValues = conditionMeta.split(',');
  ctx.metaValues = conditionValues;
  return conditionValues;
}

// `<titleGetSwitch>`: switch id; id 2 is the "no condition" placeholder.
const NO_TITLE_CONDITION_SWITCH_ID = 2;

function titleSwitchCondition(ctx, conditionValues) {
  ctx.effectValue = Number(ctx.meta['titleGetSwitch']);
  if (ctx.effectValue == NO_TITLE_CONDITION_SWITCH_ID) return ``;
  return `${$dataSystem.switches[ctx.effectValue]}`;
}

// `<titleGetVariable:variableId,value>`.
function titleVariableCondition(ctx, conditionValues) {
  const variableName = $dataSystem.variables[Number(conditionValues[0])];
  return `${variableName}:${Number(conditionValues[1])}`;
}

// `<titleGetArray:52,stateId,count>`: `52` is the only counter implemented.
function titleArrayCondition(ctx, conditionValues) {
  if (Number(conditionValues[0]) != SUBJUGATION_CONDITION_ID) return ``;
  const subjugationCountLabel = `体討伐`;
  const stateNameCode = `\x1bSIM[${Number(conditionValues[1])}]`;
  return `${stateNameCode}:${Number(conditionValues[2])}${subjugationCountLabel}`;
}

// `<titleGetItems:itemId,count>`.
function titleItemCondition(ctx, conditionValues) {
  const quantityLabel = `個`;
  const itemNameCode = `\x1bIIN[${Number(conditionValues[0])}]`;
  return `${itemNameCode}:${Number(conditionValues[1])}${quantityLabel}`;
}

// `<titleGetSkillRank:skillId,rank>`: any party member.
function titleSkillRankCondition(ctx, conditionValues) {
  const partyMemberLabel = `パーティの誰かが`;
  const skillNameCode = `\x1bSIN[${Number(conditionValues[0])}]`;
  return `${partyMemberLabel}${skillNameCode}${RANK_LABEL}:${Number(conditionValues[1])}${OR_MORE_SUFFIX}`;
}

// `<titleGetAchievement:counterId,value>`, plus a `<KojinTitle>` marker.
function titleAchievementCondition(ctx, conditionValues) {
  const achievementName = ACHIEVEMENT_NAMES[Number(conditionValues[0])];
  const personalTagLabel = `個人`;
  const personalTag = ctx.meta['KojinTitle'] ? `[${personalTagLabel}]` : ``;
  return `${achievementName}${personalTag}:${Number(conditionValues[1])}`;
}

// `<HtitleGetArray:variableId,value>`: H variables live 400 entries further up.
function titleHArrayCondition(ctx, conditionValues) {
  const variableName = $dataSystem.variables[Number(conditionValues[0]) + H_VARIABLE_OFFSET];
  return `${variableName}:${Number(conditionValues[1])}`;
}


// `<annihilationTitle:selector,count>`: `selector` is a kill counter — 1 = all
// maps, 2 = all dungeons, >= 20 = an item id. The original printed the selector
// itself as the count and, when no branch matched, appended whatever
// `effectValue` an earlier row of the same entry had left behind; both fixed.
// `<annihilationTitle:selector,count>`: `selector` is a kill counter — 1 = all
// maps, 2 = all dungeons, >= 20 = an item id. The original printed the selector
// itself as the count and, when no branch matched, appended whatever `effectValue`
// an earlier row of the same entry had left behind; both fixed.
const ANNIHILATION_ITEM_SELECTOR_MIN = 20;
const ALL_MAPS_SELECTOR = 1;
const ALL_DUNGEONS_SELECTOR = 2;

function describeAnnihilationTitle(ctx) {
  const annihilationMeta = ctx.meta['annihilationTitle'];
  if (!annihilationMeta) return;

  ctx.metaValues = annihilationMeta.split(',');
  const target = annihilationTitleTarget(Number(ctx.metaValues[0]));
  if (!target) return;

  const requiredCount = Number(ctx.metaValues[1]);
  const timesOrMoreSuffix = `回以上`;
  const subjectText = `${colorTaggedText(1, target.subjectName)}${target.countLabel}:`;
  ctx.effectValue = `${subjectText}${colorTaggedText(10, `${requiredCount}`)}${timesOrMoreSuffix}`;
  ctx.effectText += `\\C[${ctx.colorCode}][${CONDITION_LABEL}:${ctx.effectValue}\\C[${ctx.colorCode}]]\\C[0]`;
}

// What the row counts: a named item, all maps or all dungeons. An unknown selector
// prints nothing.
function annihilationTitleTarget(selector) {
  const annihilationCountLabel = `殲滅回数`;
  const totalAnnihilationCountLabel = `の総殲滅回数`;
  const allMapsLabel = `全マップ`;
  const allDungeonsLabel = `全ダンジョン`;
  if (selector >= ANNIHILATION_ITEM_SELECTOR_MIN && $dataItems[selector]) {
    return { subjectName: `<${$dataItems[selector].name}>`, countLabel: annihilationCountLabel };
  }
  if (selector == ALL_MAPS_SELECTOR) {
    return { subjectName: `<${allMapsLabel}>`, countLabel: totalAnnihilationCountLabel };
  }
  if (selector == ALL_DUNGEONS_SELECTOR) {
    return { subjectName: `<${allDungeonsLabel}>`, countLabel: totalAnnihilationCountLabel };
  }
  return null;
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
  appendTitleEffectVariableTag(ctx);
  appendTitleEffectSwitchTag(ctx);
  appendTitleSenkaTag(ctx);
}

//称号効果: `<titleEffectConfiVal:variableId,value>` -> the variable and its increase.
function appendTitleEffectVariableTag(ctx) {
  const titleEffectValue = ctx.meta['titleEffectConfiVal'];
  if (!titleEffectValue || ctx.meta['DescriptionWord']) return;

  ctx.metaValues = titleEffectValue.split(',');
  const variableName = $dataSystem.variables[Number(ctx.metaValues[0])];
  const variableIncreaseText = `+${Number(ctx.metaValues[1])}`;
  ctx.effectText += `[${colorTaggedText(ctx.colorCode, `${variableName}:${variableIncreaseText}`)}]`;
}

// `<titleEffectConfiSwi>`: a switch the title turns on.
function appendTitleEffectSwitchTag(ctx) {
  const titleEffectSwitchId = ctx.meta['titleEffectConfiSwi'];
  if (!titleEffectSwitchId) return;

  ctx.effectValue = Number(titleEffectSwitchId);
  ctx.effectText += `[${colorTaggedText(ctx.colorCode, `${$dataSystem.switches[ctx.effectValue]}`)}]`;
}

// `<titleSenkaGet>`: the senka currency (item code 10) plus the amount.
const SENKA_ITEM_CODE_ID = 10;

function appendTitleSenkaTag(ctx) {
  const senkaAmount = ctx.meta['titleSenkaGet'];
  if (!senkaAmount) return;

  ctx.effectValue = Number(senkaAmount);
  ctx.effectText += `[${colorTaggedText(ctx.colorCode, `\x1bIIN[${SENKA_ITEM_CODE_ID}]+${ctx.effectValue}`)}]`;
}

const STAT_EFFECT_PREFIXES = [`titleEffect`, `eatEffect`];
const STAT_EFFECT_SLOT_COUNT = 9;
const STAT_ROW_COLOR_CODE = 1;
// `<titleEffect1>` .. `<titleEffect9>` / `<eatEffect1>` .. `<eatEffect9>`.
const STAT_EFFECT_META_KEYS = (function () {
  const metaKeys = [];
  for (const statEffectPrefix of STAT_EFFECT_PREFIXES) {
    for (let statEffectSlot = 1; statEffectSlot <= STAT_EFFECT_SLOT_COUNT; statEffectSlot++) {
      metaKeys.push(statEffectPrefix + statEffectSlot);
    }
  }
  return metaKeys;
})();

function describeStatEffectSlots(ctx) {
  for (const statEffectKey of STAT_EFFECT_META_KEYS) {
    const statEffectMeta = ctx.meta[statEffectKey];
    if (!statEffectMeta) continue;
    appendStatEffectSlotRow(ctx, statEffectMeta);
  }
}

// One slot, `source,index,rate`. Source 4 is an element resist: the element name
// goes straight to the output and the row is labelled 耐性 — except for the
// resist-special elements, which keep whatever the previous slot left in
// `effectValue`.
function appendStatEffectSlotRow(ctx, statEffectMeta) {
  ctx.metaValues = splitMetaValues(statEffectMeta);
  const statSource = Number(ctx.metaValues[0]);
  const statIndex = Number(ctx.metaValues[1]);
  if (statSource == 4) {
    ctx.effectText += `${$dataSystem.elements[statIndex]}`;
    if (RESIST_SPECIAL_ELEMENT_IDS.indexOf(statIndex) < 0) ctx.effectValue = RESIST_RATE_TEXT;
  } else if (statSource >= 0 && statSource <= 3) {
    ctx.effectValue = statEffectName(ctx.metaValues);
  }
  // `x - x - x` in the original is just `-x`, i.e. the magnitude.
  const statPercent = Math.abs(Number(ctx.metaValues[2])) * 100;
  ctx.colorCode = STAT_ROW_COLOR_CODE;
  ctx.effectText += `[\\C[${ctx.colorCode}]${ctx.effectValue}\\C[0]+\\C[2]${statPercent}\\C[0]%]`;
  ctx.colorCode = DESCRIPTION_DEFAULT_COLOR_CODE;
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
// `<Stuff>`, `<ＴＰ>`, `<Ingredients>`, `<Alcohol>`, `<ExpiryDate>`,
// `<EventFactorClearReset>`, `<AddPowerCustom>` and `<RaceDropRarity>`, in the
// order the original printed them.
const STUFF_SATIETY_VARIABLE_ID = 16;
const SATIETY_MAX_VARIABLE_ID = 13;

function describeQuestItemTags(ctx) {
  appendSatietyRow(ctx);
  appendQuestTpRow(ctx);

  const ingredientLabel = `食材(換金用途)`;
  appendQuestFlagRow(ctx, 'Ingredients', ingredientLabel);
  const alcoholLabel = `アルコール`;
  appendQuestFlagRow(ctx, 'Alcohol', alcoholLabel);

  describeExpiryDateTag(ctx);

  const questItemLabel = `クエスト関連アイテム`;
  appendQuestFlagRow(ctx, 'EventFactorClearReset', questItemLabel);

  appendCustomPowerRow(ctx);
  appendRaceDropRarityRow(ctx);
}

// `<Stuff>`: the satiety the item restores, with the current and the maximum value.
function appendSatietyRow(ctx) {
  const stuff = ctx.meta['Stuff'];
  if (!stuff) return;

  ctx.effectValue = Number(stuff);
  const currentSatiety = $gameVariables.value(STUFF_SATIETY_VARIABLE_ID);
  const maxSatiety = $gameVariables.value(SATIETY_MAX_VARIABLE_ID);
  const satietyText = `満腹度+${ctx.effectValue}（${currentSatiety}/${maxSatiety}）`;
  ctx.effectText += `${colorTaggedText(ctx.colorCode, `[${satietyText}]`)} `;
}

// `<ＴＰ>`: a TP gain. The tag is full-width in the database on purpose.
function appendQuestTpRow(ctx) {
  const tpValue = ctx.meta['ＴＰ'];
  if (!tpValue) return;

  ctx.effectValue = Number(tpValue);
  ctx.effectText += `${colorTaggedText(ctx.colorCode, `[${TP_LABEL}+${ctx.effectValue}]`)} `;
}

// One `[label] ` row for a flag that is set.
function appendQuestFlagRow(ctx, metaKey, label) {
  if (!ctx.meta[metaKey]) return;
  ctx.effectText += `${colorTaggedText(ctx.colorCode, `[${label}]`)} `;
}

// `<AddPowerCustom>`: the extra weapon power.
function appendCustomPowerRow(ctx) {
  const addPowerCustom = ctx.meta['AddPowerCustom'];
  if (!addPowerCustom) return;

  ctx.effectValue = Number(addPowerCustom);
  if (ctx.effectValue >= 1) ctx.effectText += `\\I[666]+${ctx.effectValue} `;
}

// `<RaceDropRarity>`: the drop-range note.
function appendRaceDropRarityRow(ctx) {
  const raceDropRarity = ctx.meta['RaceDropRarity'];
  if (!raceDropRarity) return;

  const rarityText = RACE_DROP_RARITY_TEXT[Number(raceDropRarity)];
  if (rarityText) ctx.effectText += rarityText;
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
  appendLearnRequirementHeader(ctx);
  appendSwitchToggleTag(ctx);
  appendCategoryHelpText(ctx);
  appendTimeRemovalTag(ctx);
  appendStateDurationTag(ctx);
}

// `<Learn Require Eval>`: the "has a learning condition" badge in the header.
function appendLearnRequirementHeader(ctx) {
  if (!ctx.meta['Learn Require Eval']) return;
  const learnRequirementLabel = `習得条件あり`;
  ctx.headerText += `[\\C[${ctx.colorCode}]${learnRequirementLabel}\\C[0]]`;
}

// `<SwicthOnOffUse>`: using the item toggles a switch.
function appendSwitchToggleTag(ctx) {
  if (!ctx.meta['SwicthOnOffUse']) return;
  const toggleOnUseLabel = `使用でOn/Off`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${toggleOnUseLabel}\\C[0]]`;
}

//↓ステート最後に付けるようにする。
// Each of the five `<Category>` values appends one fixed state's help text.
function appendCategoryHelpText(ctx) {
  const categoryStateId = CATEGORY_HELP_STATE_IDS[ctx.meta['Category']];
  if (!categoryStateId) return;
  ctx.suffixText += `\\C[${ctx.colorCode}]${$dataStates[categoryStateId].description}\\C[0] `;
}

// `<timeRemove>`: the state expires with time.
function appendTimeRemovalTag(ctx) {
  if (!ctx.meta['timeRemove']) return;
  const timeReleaseLabel = `時間経過で解除`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${timeReleaseLabel}\\C[0]]`;
}

// State page only: `<registUp>` and the turn counter.
function appendStateDurationTag(ctx) {
  if (ctx.databaseTypeId != DESCRIPTION_DATABASE_STATE) return;
  appendResistOnApplyTag(ctx);
  appendStateTurnCounter(ctx);
}

// `<registUp>`: the resistance gained when the state is applied.
function appendResistOnApplyTag(ctx) {
  const registUp = ctx.meta['registUp'];
  if (!registUp) return;

  ctx.effectValue = registUp;
  const resistOnApplyText = `付与時に耐性率${ctx.effectValue}%up`;
  ctx.effectText += `[\\C[${ctx.colorCode}]${resistOnApplyText}\\C[0]]`;
}

// `\\I[75]:n` for a timed state; `∞` when none of the equipped passive skills,
// weapons or armors grants this state. Three identical scan-the-whole-list loops
// used to decide that; this short-circuits and allocates nothing.
const STATE_TURN_ICON_ID = 75;

function appendStateTurnCounter(ctx) {
  if (ctx.item.autoRemovalTiming >= 1) {
    ctx.fragText = `\\I[${STATE_TURN_ICON_ID}]:${ctx.item.minTurns}`;
    if (ctx.item.minTurns != ctx.item.maxTurns) ctx.fragText += `～${ctx.item.maxTurns}`;
    ctx.effectText += `[${ctx.fragText}] `;
    return;
  }
  const grantedByEquipment = containsState(valueEquipPassiveSkill, ctx.entryIndex)
    || containsState(valueEquipPassiveWeapon, ctx.entryIndex)
    || containsState(valueEquipPassiveArmor, ctx.entryIndex);
  if (!grantedByEquipment) ctx.effectText += `[\\I[${STATE_TURN_ICON_ID}]:∞] `;
}

// ---------------------------------------------------------------------------
// Trait rows
//
// `TRAIT_HANDLERS` maps a trait code to the function that renders it. The
// original tested all nineteen codes for every trait — twenty traits per entry —
// and each branch repeated the same `dataId` range test and the same
// `colorTaggedText(...)` prefix. Codes are unique, so one lookup replaces the
// ladder, a handler only deals with the payload it owns, and the text order
// cannot change.
// ---------------------------------------------------------------------------
const MAX_TRAIT_SLOTS = 20;
// Codes the summaries in front of the trait list scan for, and the counts they
// collapse to one line.
const TRAIT_CODE_PARAM_RATE = 21;
const TRAIT_CODE_SPARAM_RATE = 23;
const TRAIT_CODE_WEAPON_TYPE = 51;
const TEN_WEAPON_SCAN_COUNT = 10;
const TEN_WEAPON_SUMMARY_COUNT = 10;
const STAT_UP_TRAIT_SCAN_COUNT = 8;
const STAT_UP_FIVE_COUNT = 5;
const STAT_UP_EIGHT_COUNT = 8;
const DAMAGE_CUT_SCAN_COUNT = 2;
const DAMAGE_CUT_SUMMARY_COUNT = 2;
// Sparam ids 6 and 7 are the physical and the magical damage cut.
const DAMAGE_CUT_PARAM_IDS = [6, 7];
// `<additionalSet>`-style ids: param rate rows accept 0-7, the xparam/sparam
// icon rows 0-9.
const PARAM_RATE_ID_MAX = 7;
const PARAM_ICON_ID_MAX = 9;
// The red colour the negative resist and the equip rows use.
const RESIST_NEGATIVE_COLOR_CODE = 1;
// xparam icons start 48 ids above the debuff arrow icons.
const DEBUFF_ICON_OFFSET = 48;
// The equip rows are printed in the red (1) colour, unlike every other type row.
const EQUIP_ROW_COLOR_CODE = 1;
// Up to this many param-rate traits are listed one by one; a longer run is
// collapsed by describeStatUpSummary.
const STAT_UP_SINGLE_ROW_MAX_COUNT = 4;

// RM databases start with a null entry at index 0, hence the `- 1`.
function isElementId(elementId) {
  return elementId >= 1 && elementId <= $dataSystem.elements.length - 1;
}
function isStateId(stateId) {
  return stateId >= 1 && stateId <= $dataStates.length - 1;
}
function isSkillId(skillId) {
  return skillId >= 1 && skillId <= $dataSkills.length - 1;
}
function isSkillTypeId(skillTypeId) {
  return skillTypeId >= 1 && skillTypeId <= $dataSystem.skillTypes.length - 1;
}
function isWeaponTypeId(weaponTypeId) {
  return weaponTypeId >= 1 && weaponTypeId <= $dataSystem.weaponTypes.length - 1;
}
// Armor type 1 is the "none" entry, so the rows start at 2.
function isArmorTypeId(armorTypeId) {
  return armorTypeId >= 2 && armorTypeId <= $dataSystem.armorTypes.length - 1;
}
function isEquipTypeId(equipTypeId) {
  return equipTypeId >= 1 && equipTypeId <= $dataSystem.equipTypes.length - 1;
}
function isParamRateId(paramId) {
  return paramId >= 0 && paramId <= PARAM_RATE_ID_MAX;
}
function isParamIconId(paramId) {
  return paramId >= 0 && paramId <= PARAM_ICON_ID_MAX;
}

const TRAIT_HANDLERS = {
  11: describeElementResistTrait,     // element resist
  12: describeDebuffResistTrait,      // debuff rate
  13: describeStateResistTrait,       // state resist
  14: describeStateNullifyTrait,      // state nullify
  21: describeStatUpTrait,            // param rate
  22: describeXparamTrait,            // xparam rate
  23: describeSparamTrait,            // sparam rate
  31: describeElementAttackTrait,     // attack element
  32: describeStateAddTrait,          // state add
  33: describeAttackSpeedTrait,       // attack speed
  41: describeSkillTypeUnlockTrait,   // skill type usable
  42: describeSkillTypeSealTrait,     // skill type sealed
  43: describeSkillUnlockTrait,       // skill usable
  44: describeSkillSealTrait,         // skill sealed
  51: describeWeaponTypeTrait,        // weapon type
  52: describeArmorTypeTrait,         // armor type
  53: describeEquipFixedTrait,        // equipment fixed
  54: describeEquipSealedTrait,       // equipment sealed
  61: describeActionCountTrait        // extra action
};

// 31: `特攻属性付与` for the special-attack elements, `攻撃属性付与` otherwise.
// States do not carry the row at all.
function describeElementAttackTrait(ctx, trait, traitIndex) {
  const elementId = trait.dataId;
  if (!isElementId(elementId)) return;
  if (ctx.meta['EnemyState']) return;

  const isSpecialAttackElement = SPECIAL_ATTACK_ELEMENT_IDS.indexOf(elementId) >= 0;
  const grantLabel = isSpecialAttackElement ? `特攻属性付与` : `攻撃属性付与`;
  // The plain row re-applies the entry colour because the element label may end
  // with a name code that moves the colour elsewhere.
  const colorReset = isSpecialAttackElement ? `` : `\\C[${ctx.colorCode}]`;
  ctx.effectText += `${colorTaggedText(ctx.colorCode, grantLabel)}${elementLabel(elementId)}${colorReset} `;
}

// The two element groups read the sign from opposite ends of the same rate. The
// resist-special ids are mechanic rates (Burst!, 連撃率, 回復率, Chain, Ability,
// 汎用, 背水, 渾身, 状態異常数), so a rate above 1 is a plain `+`; for the damage
// elements a rate above 1 is a weakness, i.e. `耐性-`.
function elementResistPolarity(elementId, rawRate) {
  if (RESIST_SPECIAL_ELEMENT_IDS.indexOf(elementId) >= 0) {
    return rawRate >= 1 ? `+` : `-`;
  }
  return RESIST_RATE_TEXT + (rawRate >= 1 ? `-` : `+`);
}

// `耐性+` / `耐性-` in the request colour: red on the negative direction.
function resistRateText(ctx, isNegative) {
  const colorCode = isNegative ? RESIST_NEGATIVE_COLOR_CODE : ctx.colorCode;
  return colorTaggedText(colorCode, RESIST_RATE_TEXT + (isNegative ? `-` : `+`));
}

// 11: element resist. `amygame_elementIcon` allocates a fresh array on every
// call, so the descriptor is read once here.
function describeElementResistTrait(ctx, trait, traitIndex) {
  const elementId = trait.dataId;
  if (!isElementId(elementId)) return;

  const elementIcon = amygame_elementIcon(elementId);
  if (elementIcon[0] >= 1) {
    // A handful of element ids carry a literal label instead of an icon.
    ctx.fragText = `${elementIcon[1]}`;
  } else {
    // Element 11 is scaled by 10 rather than 100, so a "10% resist" is written
    // as 1 in the database.
    ctx.effectValue = Math.round(Math.abs(trait.value - 1) * (elementId == 11 ? 10 : 100));
    ctx.fragText = `${elementResistIcon(elementIcon)}${elementResistPolarity(elementId, trait.value)}`;
  }
  // Element ids 35/37/38/41 are never listed, and 41-80 are enemy-only: the
  // latter are hidden altogether on a state page.
  const isHiddenEnemyElement = ctx.meta['EnemyState'] && elementId >= 41 && elementId <= 80;
  if (RESIST_EXCLUDED_ELEMENT_IDS.indexOf(elementId) >= 0 || isHiddenEnemyElement) return;
  ctx.effectText += `${ctx.fragText}${ctx.effectValue}% `;
}

// 12: debuff rate. A rate above 1 makes the debuff land more often, which is the
// negative (red) direction — the same reading as the state resist row below.
function describeDebuffResistTrait(ctx, trait, traitIndex) {
  const paramId = trait.dataId;
  if (!isParamRateId(paramId)) return;

  const isNegative = trait.value >= 1;
  ctx.effectValue = Math.round(Math.abs(trait.value - 1) * 100);
  ctx.fragText = `${resistRateText(ctx, isNegative)}\x1bI[${paramId + DEBUFF_ICON_OFFSET}]`;
  ctx.effectText += `${ctx.fragText}${ctx.effectValue}% `;
}

// 13: state resist. The `\C[0]` in front is the original's: the state icon code
// may leave the colour somewhere else.
function describeStateResistTrait(ctx, trait, traitIndex) {
  const stateId = trait.dataId;
  if (!isStateId(stateId)) return;

  const isNegative = trait.value >= 1;
  ctx.effectValue = Math.round(Math.abs(trait.value - 1) * 100);
  ctx.effectText += `\\C[0]${resistRateText(ctx, isNegative)}${stateIconText(stateId)}${ctx.effectValue}% `;
}

// 14: `無効化` plus the state icon.
function describeStateNullifyTrait(ctx, trait, traitIndex) {
  const stateId = trait.dataId;
  if (!isStateId(stateId)) return;
  const nullifyText = colorTaggedText(ctx.colorCode, `無効化`);
  ctx.effectText += `${nullifyText}${stateIconText(stateId)} `;
}

// 21: parameter rate. Rows are skipped once the summary above collapsed a full
// five- or eight-stat run into a single line.
function describeStatUpTrait(ctx, trait, traitIndex) {
  if (traitIndex <= ctx.statUpCount && ctx.statUpCount > STAT_UP_SINGLE_ROW_MAX_COUNT) return;
  if (!isParamRateId(trait.dataId)) return;
  ctx.effectText += allStatUpText(trait.value,
    `\x1bI[${trait.dataId + 32}]+`, `\x1bI[${trait.dataId + 48}]-`, false);
}

// 22: xparam rate.
function describeXparamTrait(ctx, trait, traitIndex) {
  if (!isParamIconId(trait.dataId)) return;
  const xparamIcons = XPARAM_ICONS[trait.dataId] || PARAM_ICON_DEFAULT;
  const isUp = trait.value >= 0.01;
  const percentText = `${Math.round(trait.value * 100)}%`;
  ctx.effectText += isUp
    ? `\x1bI[${xparamIcons[1]}]+${percentText} `
    : `\x1bI[${xparamIcons[2]}]${percentText} `;
}

// 23: sparam rate. Suppressed when the damage-cut summary above already covers
// the entry.
function describeSparamTrait(ctx, trait, traitIndex) {
  if (ctx.damageCutCount > 1) return;
  if (!isParamIconId(trait.dataId)) return;

  const sparamIcons = SPARAM_ICONS[trait.dataId] || PARAM_ICON_DEFAULT;
  const negativeIsGood = SPARAM_ICONS_NEGATIVE_IS_GOOD.indexOf(trait.dataId) >= 0;
  const isUp = (trait.value >= 1) !== negativeIsGood;
  const percentValue = Math.round(Math.abs(trait.value - 1) * 100);
  ctx.effectText += `\x1bI[${isUp ? sparamIcons[1] : sparamIcons[2]}]${isUp ? `+` : `-`}${percentValue}% `;
}

// 32: state add, i.e. the state icon plus the chance.
function describeStateAddTrait(ctx, trait, traitIndex) {
  const stateId = trait.dataId;
  if (!isStateId(stateId)) return;
  const grantText = colorTaggedText(ctx.colorCode, `ステート付与`);
  ctx.effectText += `${grantText}${stateIconText(stateId)}${Math.round(trait.value * 100)}% `;
}

// 33: attack speed, a flat value rather than a rate.
function describeAttackSpeedTrait(ctx, trait, traitIndex) {
  if (trait.dataId != 0) return;
  const speedText = colorTaggedText(ctx.colorCode, `AttackSpeed+`);
  ctx.effectText += `${speedText}${Math.round(trait.value)} `;
}

// `<label><name> ` — the shape shared by the skill-type, weapon-type, armor-type
// and equip-type rows. `headText` is the already coloured label or an icon.
function appendBracketedName(ctx, headText, name) {
  ctx.effectText += `${headText}<${name}> `;
}

// 41: a skill type the entry can use.
function describeSkillTypeUnlockTrait(ctx, trait, traitIndex) {
  if (!isSkillTypeId(trait.dataId)) return;
  const unlockText = colorTaggedText(ctx.colorCode, `使用可能`);
  appendBracketedName(ctx, unlockText, $dataSystem.skillTypes[trait.dataId]);
}

// 42: a sealed skill type. Type 4 also seals types 5-8 (see
// SEALED_SKILL_TYPE_GROUPS at the end of the file).
function describeSkillTypeSealTrait(ctx, trait, traitIndex) {
  if (!isSkillTypeId(trait.dataId)) return;
  appendBracketedName(ctx, `\\I[626]`, $dataSystem.skillTypes[trait.dataId]);
}

// 43: a usable skill. Weapons name the Burst skills by effect instead.
function describeSkillUnlockTrait(ctx, trait, traitIndex) {
  const skillId = trait.dataId;
  if (!isSkillId(skillId)) return;
  const isBurst = ctx.databaseTypeId == DESCRIPTION_DATABASE_WEAPON
    && $dataSkills[skillId].stypeId == BURST_SKILL_TYPE_ID;
  const unlockLabel = isBurst ? `Burst` : `使用可能`;
  appendBracketedName(ctx, colorTaggedText(ctx.colorCode, unlockLabel), `\x1bSIN[${skillId}]`);
}

// 44: a sealed skill.
function describeSkillSealTrait(ctx, trait, traitIndex) {
  const skillId = trait.dataId;
  if (!isSkillId(skillId)) return;
  appendBracketedName(ctx, `\\I[626]`, `\x1bSIN[${skillId}]`);
}

// 51: a weapon type the entry counts as. A full ten-weapon entry is already
// summarised as `十種武器`, so the individual rows stop at the tenth.
const TEN_WEAPON_ROW_LIMIT = 9;
function describeWeaponTypeTrait(ctx, trait, traitIndex) {
  if (ctx.tenWeaponCount > TEN_WEAPON_ROW_LIMIT) return;
  if (!isWeaponTypeId(trait.dataId)) return;
  const weaponTypeText = colorTaggedText(ctx.colorCode, `武器種`);
  appendBracketedName(ctx, weaponTypeText, $dataSystem.weaponTypes[trait.dataId]);
}

// 52: an armor type the entry counts as.
function describeArmorTypeTrait(ctx, trait, traitIndex) {
  if (!isArmorTypeId(trait.dataId)) return;
  const armorTypeText = colorTaggedText(ctx.colorCode, `防具種`);
  appendBracketedName(ctx, armorTypeText, $dataSystem.armorTypes[trait.dataId]);
}

// 53 / 54: fixed and sealed equipment slots, both printed in the red colour.
function describeEquipFixedTrait(ctx, trait, traitIndex) {
  if (!isEquipTypeId(trait.dataId)) return;
  const fixedText = colorTaggedText(EQUIP_ROW_COLOR_CODE, `装備固定`);
  appendBracketedName(ctx, fixedText, $dataSystem.equipTypes[trait.dataId]);
}

function describeEquipSealedTrait(ctx, trait, traitIndex) {
  if (!isEquipTypeId(trait.dataId)) return;
  const sealedText = colorTaggedText(EQUIP_ROW_COLOR_CODE, `装備封印`);
  appendBracketedName(ctx, sealedText, $dataSystem.equipTypes[trait.dataId]);
}

// 61: an extra action per turn.
function describeActionCountTrait(ctx, trait, traitIndex) {
  if (trait.dataId != 0) return;
  const actionCountText = colorTaggedText(ctx.colorCode, `行動回数追加`);
  ctx.effectText += `${actionCountText}${Math.round(trait.value * 100)}% `;
}


// ---------------------------------------------------------------------------
// Output assembly: header + description + effect lines, then the page-specific
// write rules (states/classes only get text when they carry <Help Description>).
// ---------------------------------------------------------------------------
// Output assembly. The write rules are page specific:
//   state  – written only with `<Help Description>`, and the description word is
//            indented by one full-width space;
//   class  – written only with `<Help Description>` and without
//            `<NoAddDescription>`;
//   others – always written.
function applyEntryDescription(ctx) {
  const { item, meta, databaseTypeId } = ctx;
  if (databaseTypeId == DESCRIPTION_DATABASE_STATE) ctx.descWordText = `　${ctx.descWordText}`;
  if (databaseTypeId != DESCRIPTION_DATABASE_STATE && item.description == undefined) {
    item.description = meta['NoAddDescription'] ? `解説なし` : ``;
  }

  const generatedDescription = buildGeneratedDescription(ctx);
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

// Header + the existing description + suffix, then the description word and the
// effect lines — or, with `<NoAddDescription>`, the word on its own line at the
// end and no effect lines at all.
function buildGeneratedDescription(ctx) {
  const descriptionWordPart = ctx.descWordText == 0 ? `` : ctx.descWordText;
  const descriptionWordLine = descriptionWordPart ? `\n${descriptionWordPart}` : ``;
  if (ctx.meta['NoAddDescription']) {
    return `${ctx.headerText}${ctx.item.description}${ctx.suffixText}${descriptionWordLine}`;
  }
  return `${ctx.headerText}${ctx.item.description}${ctx.suffixText}\n${descriptionWordPart}${ctx.effectText}`;
}

// Trait code 42 (skill-type seal) for type 4 also seals types 5-8. This is a real
// database change, not text, so it lives next to the write rules.
const SEALED_SKILL_TYPE_GROUPS = { 4: [5, 6, 7, 8] };
const SEALED_SKILL_TYPE_SCAN_COUNT = 20;
const SKILL_TYPE_SEAL_TRAIT_CODE = 42;

function expandSealedSkillTypes(ctx) {
  const { item, databaseTypeId } = ctx;
  if (!isTraitDatabaseType(databaseTypeId)) return;

  const scannedTraitCount = Math.min(item.traits.length, SEALED_SKILL_TYPE_SCAN_COUNT);
  for (let traitIndex = 0; traitIndex < scannedTraitCount; traitIndex++) {
    const trait = item.traits[traitIndex];
    if (!trait || trait.code != SKILL_TYPE_SEAL_TRAIT_CODE) continue;
    const sealedTypes = SEALED_SKILL_TYPE_GROUPS[trait.dataId];
    if (!sealedTypes) continue;
    for (const sealedTypeId of sealedTypes) item.traits.push({ code: SKILL_TYPE_SEAL_TRAIT_CODE, dataId: sealedTypeId, value: 1 });
  }
}


//通常攻撃の追加説明文にランク補正値と派生スキルの有無を表示valueAddDescriptionSkill = Array(101).fill(0);
// Normal attacks get a rank-correction line and, optionally, the skills they
// derive into. The 101-200 and 901-950 blocks were the same body with a
// different header and output slot; 901-950 has no `<NormalAttackDerivedSuper>`
// tag in this database, so handling it in the shared body is a no-op there.
attackSkillRankText = function (skill, headerText) {
  const masteryEffect = skill.meta['Mastery Effect'];
  const rankCorrectionLabel = `ランク補正`;
  const damagePerRankLabel = `ダメージ値にランク毎`;
  const rankCorrectionText = masteryEffect
    ? `[${rankCorrectionLabel}:${damagePerRankLabel}${masteryEffect.replace(' Damage Per Level', '').replace(' ', '')}]`
    : ``;
  let descriptionText = `${headerText}${rankCorrectionText}\n`;
  for (const derivedTag of NORMAL_ATTACK_DERIVED_TAGS) {
    const derivedMeta = skill.meta[derivedTag];
    if (!derivedMeta) continue;
    descriptionText += normalAttackDerivedText(derivedTag, derivedMeta);
  }
  return descriptionText;
}

// `<NormalAttackDerived:rank,skillId>` / `<NormalAttackDerivedSuper:rank,skillId>`:
// the skill a normal attack turns into, and the rank it needs.
const NORMAL_ATTACK_DERIVED_TAGS = [`NormalAttackDerived`, `NormalAttackDerivedSuper`];

function normalAttackDerivedText(derivedTag, derivedMeta) {
  const metaValues = derivedMeta.split(',');
  const derivedSkillName = $dataSkills[Number(metaValues[1])].name;
  const derivedRankLabel = `ランク${metaValues[0]}で`;
  const derivedRankConditionLabel = `ランク${metaValues[0]}と特殊条件を満たす事で`;
  const derivedSkillSuffix = `が派生発生`;
  const conditionLabel = derivedTag == NORMAL_ATTACK_DERIVED_TAGS[0]
    ? derivedRankLabel
    : derivedRankConditionLabel;
  return `[${conditionLabel}\\C[2]${derivedSkillName}\\C[0]${derivedSkillSuffix}]`;
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
}

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
    if (classData.name == '') { continue; }
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
      if (!learning) { continue; }
      // Main classes only list the skills the current playthrough has reached.
      if (classMeta['Primary Only'] && learning.level < requiredPrimaryLevel) { continue; }
      const levelLabel = `Lv`;
      descriptionText += `[${levelLabel}${learning.level}:\\C[2]\x1bSIN[${learning.skillId}]\\C[0]]`;
    }
    valueAddDescriptionClass[classId] = descriptionText;
    valueClassGrowStatasComparison[classId] = comparisonText;
  }
};

//}());
